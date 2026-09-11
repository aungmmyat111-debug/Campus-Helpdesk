import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-campus-key';

export const loginOrDevToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, role, adObjectId, sub, id } = req.body || {};

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // 1. Find existing user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // 2. Only assign initial role if creating a brand new user
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          role: role || 'STUDENT',
          adObjectId: adObjectId || sub || id || `dev-ad-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        },
      });
    }
    // Note: If user already exists, we leave user.role unchanged so Prisma Studio edits are preserved.

    // 3. Issue JWT using the role stored in the database
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 4. Return database user data
    res.json({
      message: 'Login successful',
      token,
      jwt: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        adObjectId: user.adObjectId,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Authentication failed', details: error?.message || error });
  }
};