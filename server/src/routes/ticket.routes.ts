import { Router } from 'express';
import {
  createTicket,
  getTickets,
  updateTicket,
  deleteTicket,
} from '../controllers/ticket.controller';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';

const router = Router();

// All ticket routes require authentication
router.use(authenticateJWT);

router.post('/', createTicket);
router.get('/', getTickets);
router.patch('/:id', requireRole(['TECHNICIAN', 'ADMIN', 'ADMINISTRATOR'] as any), updateTicket);
router.delete('/:id', deleteTicket);

export default router;