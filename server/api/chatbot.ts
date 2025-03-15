
import { Router } from 'express';
import { chatbotService } from '../services/chatbotService';

const router = Router();

router.post('/query', async (req, res) => {
  try {
    const { query } = req.body;
    const userId = req.user?.id || 1; // Default user for demo
    
    const response = await chatbotService.processQuery(query, userId);
    res.json({ response });
  } catch (error) {
    console.error('Chatbot API error:', error);
    res.status(500).json({ error: 'Failed to process chatbot query' });
  }
});

export default router;
