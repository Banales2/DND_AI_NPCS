import express from 'express';
const router = express.Router();
import { createNPC, getNpcs, getNpcById } from '../controllers/npcsController.js';
import { requireAuth } from '../middleware/auth.js';

// Ruta protegida: solo usuarios autenticados pueden crear NPCs
router.post('/', requireAuth, createNPC);
router.get('/', getNpcs);
router.get('/:id', getNpcById);

export default router;
