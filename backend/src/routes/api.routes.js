import { Router } from 'express';
import { chatController } from '../controllers/api.controllers.js';

const router = Router();

// Chat endpoint
router.post('/chat', chatController);

export default router;
