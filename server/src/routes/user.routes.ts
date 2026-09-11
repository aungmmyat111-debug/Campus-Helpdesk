import { Router } from 'express';
import { getUsers, updateUserRole, deleteUser } from '../controllers/user.controller';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);
// Allow both role naming conventions to avoid 403 Forbidden errors
router.use(requireRole(['ADMIN', 'ADMINISTRATOR'] as any));

router.get('/', getUsers);
router.patch('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

export default router;