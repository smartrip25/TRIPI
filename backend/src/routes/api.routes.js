import { Router } from 'express';
import { chatController, resetChatController } from '../controllers/api.controllers.js';

const router = Router();

// Root API endpoint - provides info about available endpoints
router.get('/', (req, res) => {
  res.json({
    message: 'TRIPI API is running!',
    endpoints: {
      'GET /api/': 'API information (this endpoint)',
      'GET /api/test': 'Test endpoint for connection check',
      'POST /api/chat': 'Chat endpoint for AI responses',
      'POST /api/reset-chat': 'Reset chat endpoint'
    },
    status: 'ok'
  });
});

// Test endpoint for frontend connection check
router.get('/test', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Chat endpoint
router.post('/chat', chatController);

// Reset chat endpoint
router.post('/reset-chat', resetChatController);

export default router;
