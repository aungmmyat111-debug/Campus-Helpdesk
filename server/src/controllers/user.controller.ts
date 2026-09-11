import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

// GET ALL USERS (Admin only)
export const getUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// UPDATE USER ROLE (Admin only)
export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const rawRole = req.body.role || req.body.newRole;

  if (!rawRole) {
    res.status(400).json({ error: 'Role parameter missing from request body.' });
    return;
  }

  // Map incoming string to uppercase enum standard
  let formattedRole = rawRole.toString().toUpperCase() as Role;

  // Handle standard ADMIN to ADMINISTRATOR alias mapping if applicable
  if ((formattedRole as string) === 'ADMIN') {
    formattedRole = 'ADMINISTRATOR' as Role;
  }

  const validRoles: Role[] = ['STUDENT', 'FACULTY', 'TECHNICIAN', 'ADMINISTRATOR'];

  if (!validRoles.includes(formattedRole)) {
    res.status(400).json({ error: `Invalid role specified. Allowed values: ${validRoles.join(', ')}` });
    return;
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: id as string },
      data: { role: formattedRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Failed to update role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

// DELETE USER ACCOUNT (Admin only)
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const currentUserId = req.user?.id;
  const currentUserRole = (req.user?.role as string)?.toUpperCase();

  // 1. Enforce Admin Access
  const isAdmin = currentUserRole === 'ADMIN' || currentUserRole === 'ADMINISTRATOR';
  if (!isAdmin) {
    res.status(403).json({ error: 'Forbidden: Admin access required to delete accounts.' });
    return;
  }

  // 2. Prevent self-deletion
  if (id === currentUserId) {
    res.status(400).json({ error: 'You cannot delete your own account.' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: id as string },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // 3. Delete user
    await prisma.user.delete({
      where: { id: id as string },
    });

    res.status(200).json({ message: 'User account deleted successfully', id });
  } catch (error) {
    console.error('Failed to delete user:', error);
    res.status(500).json({ error: 'Failed to delete user account' });
  }
};