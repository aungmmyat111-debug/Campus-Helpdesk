import { Router } from 'express';
import { createTicket, getTickets, updateTicket } from '../controllers/ticket.controller';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/', createTicket);
router.get('/', getTickets);
router.patch('/:id', requireRole(['TECHNICIAN', 'ADMIN']), updateTicket);

export default router;