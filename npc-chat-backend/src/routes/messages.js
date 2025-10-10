import express from 'express';
const router = express.Router();
import { requireAuth } from '../middleware/auth.js';
import { createMessage, getMessagesByConversation, getMessagesBySenderInConversation } from '../controllers/messagesController.js';

router.post('/', requireAuth, createMessage);
router.get('/conversation/:conversationId', requireAuth, getMessagesByConversation);
router.get('/:conversationId/sender/:senderId', requireAuth, getMessagesBySenderInConversation);

export default router;
