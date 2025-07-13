import { Router } from 'express';
import { chatController } from '../controllers/api.controllers.js';

const router = Router();

// Test endpoint for frontend connection check
router.get('/test', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Chat endpoint
router.post('/chat', chatController);

export default router;
