import { Response } from 'express';
import prisma from '../prisma';
import { analyzeTicket } from '../services/ai.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { checkCampusScheduleStatus, broadcastToGroup3 } from '../services/p2p.service';
import { emitEvent } from '../services/socket.service';

// 1. CREATE TICKET (AI Priority & Software Escalation Rule + Public Holiday Context)
export const createTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, roomNumber } = req.body;
  const userId = req.user?.id;

  if (!title || !description || !roomNumber || !userId) {
    res.status(400).json({ error: 'Title, description, and roomNumber are required' });
    return;
  }

  try {
    // Step A: Fetch category and priority from AI API
    let { category, priority } = await analyzeTicket(description);

    // Step B: Check for software-related issues
    const issueText = `${title} ${description}`.toLowerCase();
    const isSoftwareProblem =
      category === 'SOFTWARE' ||
      issueText.includes('software') ||
      issueText.includes('app') ||
      issueText.includes('crash') ||
      issueText.includes('bug') ||
      issueText.includes('install') ||
      issueText.includes('license');

    // Step C: Priority Overrides
    // 1. If AI says URGENT, it stays URGENT.
    // 2. If AI says LOW/MEDIUM/NORMAL but it's a software problem, escalate to URGENT.
    if (priority !== 'URGENT' && isSoftwareProblem) {
      console.log(`🚨 Priority escalated to URGENT: Software issue policy override.`);
      priority = 'URGENT';
    }

    // Step D: Public API context (Nager.Date holiday check)
    const schedule = await checkCampusScheduleStatus();

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description: `${description}\n\n[Live Public API Context: ${schedule.summary}]`,
        roomNumber,
        category: category as any,
        priority: priority as any,
        createdById: userId,
      },
      include: {
        createdBy: true,
        assignedTo: true,
      },
    });

    // 1. Live WebSocket update to connected clients/dashboards
    emitEvent('ticket:created', ticket);

    // 2. Broadcast / fallback trigger
    if (typeof broadcastToGroup3 === 'function') {
      broadcastToGroup3('TICKET_CREATED', {
        ticketId: ticket.id,
        title: ticket.title,
        description: ticket.description,
        roomNumber: ticket.roomNumber,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        createdByName: ticket.createdBy.name,
      });
    }

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Failed to create ticket', details: error });
  }
};

// 2. GET ALL TICKETS (Filtered by role: Students & Faculty see theirs; Staff see all)
export const getTickets = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user;

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const userRole = (user.role || '').toUpperCase();
    const isEndUser = userRole === 'STUDENT' || userRole === 'FACULTY';

    const tickets = await prisma.ticket.findMany({
      where: isEndUser ? { createdById: user.id } : {},
      include: { createdBy: true, assignedTo: true },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(tickets);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

// 3. UPDATE TICKET (Status, assignment, priority)
export const updateTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, priority, assignedToId } = req.body;

  try {
    const updatedTicket = await prisma.ticket.update({
      where: { id: id as string },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assignedToId !== undefined && { assignedToId }),
      },
      include: {
        createdBy: true,
        assignedTo: true,
      },
    });

    // 1. Live WebSocket update to connected clients/dashboards
    emitEvent('ticket:updated', updatedTicket);

    // 2. Broadcast / fallback trigger
    if (typeof broadcastToGroup3 === 'function') {
      broadcastToGroup3('TICKET_UPDATED', {
        ticketId: updatedTicket.id,
        status: updatedTicket.status,
        priority: updatedTicket.priority,
        assignedToId: updatedTicket.assignedToId,
      });
    }

    res.status(200).json(updatedTicket);
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
};

// 4. DELETE TICKET (Creator, Technician, or Admin)
export const deleteTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const user = req.user;

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: id as string },
    });

    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    const userRole = (user.role || '').toUpperCase();
    const isCreator = ticket.createdById === user.id;
    const isStaff = ['ADMIN', 'ADMINISTRATOR', 'TECHNICIAN'].includes(userRole);

    if (!isStaff && !isCreator) {
      res.status(403).json({ error: 'Not authorized to delete this ticket' });
      return;
    }

    // Delete ticket (Comments automatically cascade-delete via schema)
    await prisma.ticket.delete({
      where: { id: id as string },
    });

    // 1. Live WebSocket notification
    emitEvent('ticket:deleted', { id });

    // 2. Broadcast deletion / fallback trigger
    if (typeof broadcastToGroup3 === 'function') {
      broadcastToGroup3('TICKET_DELETED' as any, { ticketId: id });
    }

    res.status(200).json({ message: 'Ticket deleted successfully', id });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
};