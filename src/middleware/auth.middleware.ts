import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-campus-key';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'STUDENT' | 'TECHNICIAN' | 'ADMIN';
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    res.status(403).json({ error: 'Invalid or expired token.' });
    return;
  }
};

export const requireRole = (allowedRoles: Array<'STUDENT' | 'TECHNICIAN' | 'ADMIN'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions.' });
      return;
    }
    next();
  };
};