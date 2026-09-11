import { Router } from 'express';
import { loginOrDevToken } from '../controllers/auth.controller';
import { getMicrosoftAuthUrl, handleMicrosoftCallback } from '../controllers/msal.controller';

const router = Router();

// Development login
router.post('/login', loginOrDevToken);

// Microsoft AD SSO routes
router.get('/microsoft', getMicrosoftAuthUrl);
router.get('/microsoft/callback', handleMicrosoftCallback);

export default router;