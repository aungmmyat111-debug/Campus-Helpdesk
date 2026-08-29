import { Router } from 'express';
import { handleIncomingP2PEvent, pingP2P } from '../controllers/p2p.controller';

const router = Router();

router.post('/events', handleIncomingP2PEvent);
router.get('/health', pingP2P);

export default router;