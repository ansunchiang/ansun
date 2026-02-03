/**
 * AI API路由
 */

const express = require('express');
const router = express.Router();
const { askQuestion } = require('../services/ai');

/**
 * POST /api/ai/ask
 * 智能问答
 * body: { question, lang }
 */
router.post('/ask', async (req, res) => {
  try {
    const { question, lang = 'en' } = req.body;
    
    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Missing question'
      });
    }
    
    const result = await askQuestion(question, lang);
    
    if (result.success) {
      res.json({
        success: true,
        answer: result.answer,
        filtered: result.filtered || false,
        reason: result.reason || null
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
