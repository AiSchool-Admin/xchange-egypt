import { Router } from 'express';
import { aiAssistantController } from '../controllers/ai-assistant.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Conversations
router.post('/conversations', aiAssistantController.createConversation);
router.get('/conversations', aiAssistantController.getConversations);
router.get('/conversations/:id', aiAssistantController.getConversation);
router.post('/conversations/:id/messages', aiAssistantController.sendMessage);
router.post('/conversations/:id/close', aiAssistantController.closeConversation);
router.post('/conversations/:id/archive', aiAssistantController.archiveConversation);

// Suggestions
router.get('/suggestions', aiAssistantController.getQuickSuggestions);

export default router;
