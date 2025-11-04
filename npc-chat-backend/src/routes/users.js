import express from 'express';
const router = express.Router();
import { registerUser, getUsers, getUserById, deleteUser, getUserNPCs, getStats,updateProfile, getCurrentUser,updateUserProfile } from '../controllers/usersController.js';
import { requireAuth } from '../middleware/auth.js';

router.post('/register', registerUser);
router.get('/', getUsers);
router.get('/npcs',requireAuth, getUserNPCs);
router.get('/stats',requireAuth, getStats);
router.get('/me', requireAuth, getCurrentUser);
router.get('/:id', getUserById);
router.put('/profile', requireAuth, updateProfile);
router.patch('/:id/profile', requireAuth, updateUserProfile);
router.delete('/:id',requireAuth, deleteUser);

export default router;
