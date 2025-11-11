import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { 
  getUserConversations,
  createConversation,
  getMessagesByConversation,
  sendMessage,
  updateConversation,
  deleteConversation,
  getConversationById,
  addParticipantToConversation,
  removeParticipantFomConversation
} from '../controllers/conversationsController.js';

const router = express.Router();

router.get('/', requireAuth, getUserConversations);
router.post('/', requireAuth, createConversation);
router.get('/:id', requireAuth, getConversationById);
router.get('/:id/messages', requireAuth, getMessagesByConversation);
router.post('/:id/messages', requireAuth, sendMessage);
router.post('/:id/participants', requireAuth, addParticipantToConversation);
router.put('/:id', requireAuth, updateConversation);
router.delete('/:id/participants/:npcId', requireAuth, removeParticipantFomConversation);
router.delete('/:id', requireAuth, deleteConversation);

export default router;
