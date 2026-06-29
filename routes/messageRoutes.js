import express from 'express';
import { getConversations, getMessages, sendReply } from '../controllers/messageController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';
import { replyRules } from '../validators/messageValidator.js';
import { validate } from '../validators/authValidator.js';

const router = express.Router();

// Owner conversations retrieval
router.get('/conversations', protect, getConversations);

// Dual owner/visitor message operations
router.get('/conversations/:conversationId/messages', optionalProtect, getMessages);
router.post('/conversations/:conversationId/messages', optionalProtect, replyRules, validate, sendReply);

export default router;
