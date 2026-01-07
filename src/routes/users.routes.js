import express from 'express';
import {
  deleteUserById,
  fetchAllUsers,
  fetchUserById,
  updateUserById,
} from '#controllers/users.controller';
import { authenticateToken, requireRole } from '#middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticateToken, fetchAllUsers);
router.get('/:id', authenticateToken, fetchUserById);
router.put('/:id', authenticateToken, updateUserById);
router.delete(
  '/:id',
  authenticateToken,
  requireRole(['admin']),
  deleteUserById
);

export default router;
