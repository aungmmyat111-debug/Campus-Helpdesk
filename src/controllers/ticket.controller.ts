import { Response } from 'express';
import prisma from '../prisma';
import { analyzeTicket } from '../services/ai.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { broadcastToGroup3 } from '../services/p2p.service';
import { emitEvent } from '../services/socket.service';

// 1. CREATE TICKET (with AI Category & Priority analysis)
export const createTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, roomNumber } = req.body;
  const userId = req.user?.id;

  if (!title || !description || !roomNumber || !userId) {
    res.status(400).json({ error: 'Title, description, and roomNumber are required' });
    return;
  }

  try {
    const { category, priority } = await analyzeTicket(description);

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
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

    // 2. Broadcast newly created ticket to Group 3
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

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Failed to create ticket', details: error });
  }
};

// 2. GET ALL TICKETS (Filtered by role)
export const getTickets = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user;

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    let tickets;

    if (user.role === 'STUDENT') {
      // Students only see their own tickets
      tickets = await prisma.ticket.findMany({
        where: { createdById: user.id },
        include: { createdBy: true, assignedTo: true },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Technicians and Admins see all tickets
      tickets = await prisma.ticket.findMany({
        include: { createdBy: true, assignedTo: true },
        orderBy: { createdAt: 'desc' },
      });
    }

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

    // 2. Broadcast update to Group 3
    broadcastToGroup3('TICKET_UPDATED', {
      ticketId: updatedTicket.id,
      status: updatedTicket.status,
      priority: updatedTicket.priority,
      assignedToId: updatedTicket.assignedToId,
    });

    res.status(200).json(updatedTicket);
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
};