import { Request, Response } from 'express';
import { P2PEventPayload } from '../services/p2p.service';
import { emitEvent } from '../services/socket.service';

const MY_NODE_ID = process.env.MY_NODE_ID || 'group-careaid';
const P2P_SECRET = process.env.P2P_SECRET || 'campus-p2p-shared-secret-2026';

// Set to keep track of processed message IDs to prevent infinite loops
const seenMessages = new Set<string>();

export const handleIncomingP2PEvent = async (req: Request, res: Response): Promise<void> => {
  const secret = req.headers['x-p2p-secret'];
  if (P2P_SECRET && secret !== P2P_SECRET) {
    res.status(401).json({ error: 'Unauthorized P2P peer' });
    return;
  }

  const { messageId, originNodeId, eventType, data } = req.body as P2PEventPayload;

  if (!messageId || !originNodeId || !eventType) {
    res.status(400).json({ error: 'Invalid P2P event payload' });
    return;
  }

  // Prevent infinite loop if receiving our own event back
  if (originNodeId === MY_NODE_ID) {
    res.status(200).json({ status: 'ignored', reason: 'Self-originated message' });
    return;
  }

  // Prevent duplicate execution
  if (seenMessages.has(messageId)) {
    res.status(200).json({ status: 'ignored', reason: 'Duplicate message' });
    return;
  }

  seenMessages.add(messageId);

  // Clean old entries after 5 minutes
  setTimeout(() => seenMessages.delete(messageId), 300000);

  console.log(`\n[P2P Inbound] Received ${eventType} from [${originNodeId}]:`);
  console.log(JSON.stringify(data, null, 2));

  // ⚡ Emit live WebSocket event to connected frontend clients
  emitEvent('p2p:event_received', {
    messageId,
    originNodeId,
    eventType,
    data,
  });

  // Handle specific event types internally
  switch (eventType) {
    case 'TICKET_CREATED':
      console.log(`Remote ticket received: "${data.title}" (Room: ${data.roomNumber})`);
      break;

    case 'TICKET_UPDATED':
      console.log(`Remote ticket update: ID ${data.ticketId} -> Status: ${data.status}`);
      break;

    case 'HEARTBEAT':
      console.log(`Heartbeat received from ${originNodeId}`);
      break;

    default:
      console.log(`Unhandled event type: ${eventType}`);
  }

  res.status(200).json({
    status: 'received',
    nodeId: MY_NODE_ID,
    acknowledgedAt: new Date().toISOString(),
  });
};

export const pingP2P = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    status: 'online',
    nodeId: MY_NODE_ID,
    timestamp: new Date().toISOString(),
  });
};