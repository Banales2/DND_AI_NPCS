import express from 'express';
const router = express.Router();
import { requireAuth } from '../middleware/auth.js';
import { createConversation, getConversations } from '../controllers/conversationsControllers.js';

router.post('/', requireAuth, createConversation);
router.get('/', getConversations);

export default router;
