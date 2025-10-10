import express from 'express';
const router = express.Router();
import { registerUser, getUsers, getUserById, deleteUser, getUserNPCs } from '../controllers/usersController.js';
import { requireAuth } from '../middleware/auth.js';

router.post('/register', registerUser);
router.get('/', getUsers);
router.get('/npcs',requireAuth, getUserNPCs);
router.get('/:id', getUserById);
router.delete('/:id',requireAuth, deleteUser);

export default router;
