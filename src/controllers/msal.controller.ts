import { Request, Response } from 'express';
import { ConfidentialClientApplication } from '@azure/msal-node';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import prisma from '../prisma';

const REDIRECT_URI = process.env.AZURE_AD_REDIRECT_URI ?? 'http://localhost:5001/api/auth/microsoft/callback';

// Helper to initialize MSAL safely without crashing on boot if env vars aren't set yet
const getMsalClient = () => {
  const clientId = process.env.AZURE_AD_CLIENT_ID ?? 'placeholder-client-id';
  const clientSecret = process.env.AZURE_AD_CLIENT_SECRET ?? 'placeholder-client-secret';
  const tenantId = process.env.AZURE_AD_TENANT_ID ?? 'common';

  return new ConfidentialClientApplication({
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${tenantId}`,
      clientSecret,
    },
  });
};

export const getMicrosoftAuthUrl = async (req: Request, res: Response) => {
  const authCodeUrlParameters = {
    scopes: ['user.read', 'openid', 'profile', 'email'],
    redirectUri: REDIRECT_URI,
  };

  try {
    const cca = getMsalClient();
    const authUrl = await cca.getAuthCodeUrl(authCodeUrlParameters);
    return res.json({ url: authUrl });
  } catch (error) {
    console.error('Failed to generate Microsoft Auth URL:', error);
    return res.status(500).json({ error: 'Failed to generate Microsoft Auth URL' });
  }
};

export const handleMicrosoftCallback = async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Authorization code is missing' });
  }

  try {
    const cca = getMsalClient();
    const tokenResponse = await cca.acquireTokenByCode({
      code,
      scopes: ['user.read', 'openid', 'profile', 'email'],
      redirectUri: REDIRECT_URI,
    });

    const account = tokenResponse.account;
    if (!account) {
      return res.status(400).json({ error: 'Failed to retrieve account details' });
    }

    const email = account.username;
    const name = account.name ?? 'University User';

    // Safely extract oid or fallback to homeAccountId
    const claims = account.idTokenClaims as { oid?: string } | undefined;
    const adObjectId: string = claims?.oid ?? account.homeAccountId;

    const assignedRole: Role = email.toLowerCase().includes('admin')
      ? Role.ADMINISTRATOR
      : Role.STUDENT;

    // Use ??= to satisfy SonarQube S6606
    let user = await prisma.user.findUnique({ where: { email } });
    user ??= await prisma.user.create({
      data: {
        adObjectId,
        email,
        name,
        role: assignedRole,
      },
    });

    // Issue internal application JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET ?? 'default-jwt-secret',
      { expiresIn: '7d' }
    );

    // Redirect user back to frontend with the JWT token
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/auth/callback?token=${token}&role=${user.role}`);
  } catch (error) {
    console.error('SSO Error:', error);
    return res.status(500).json({ error: 'Authentication failed with Microsoft AD' });
  }
};