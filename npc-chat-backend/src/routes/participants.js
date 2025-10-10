import express from 'express';
const router = express.Router();
import { requireAuth } from '../middleware/auth.js';
import { addParticipant, getParticipants, getParticipantsByConversationId } from '../controllers/participantController.js';

router.post('/', requireAuth, addParticipant);
router.get('/conversation/:conversationId', requireAuth, getParticipantsByConversationId);
router.get('/', requireAuth, getParticipants);


export default router;
