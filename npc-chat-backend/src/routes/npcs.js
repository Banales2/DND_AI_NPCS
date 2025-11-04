import express from 'express';
const router = express.Router();
import { createNPC, getNpcs, getNpcById, updateNPC, deleteNPC, getUserNPCs} from '../controllers/npcsController.js';
import { requireAuth } from '../middleware/auth.js';

// Ruta protegida: solo usuarios autenticados pueden crear NPCs
router.post('/', requireAuth, createNPC);
router.get('/', getNpcs);
router.get('/user', requireAuth, getUserNPCs);
router.get('/:id',requireAuth, getNpcById);
router.put("/:id", requireAuth, updateNPC);
router.delete("/:id", requireAuth, deleteNPC);


export default router;
