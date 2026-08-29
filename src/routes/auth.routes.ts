import { Router } from 'express';
import { loginOrDevToken } from '../controllers/auth.controller';

const router = Router();

router.post('/login', loginOrDevToken);

export default router;