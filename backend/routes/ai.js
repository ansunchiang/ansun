/**
 * AI API路由
 */

const express = require('express');
const router = express.Router();
const { askQuestion } = require('../services/ai');

/**
 * POST /api/ai/ask
 * 智能问答
 */
router.post('/ask', async (req, res) => {
  try {
    const { question, context } = req.body;
    
    if (!question) {
      return res.status(400).json({
        success: false,
        error: '缺少问题'
      });
    }
    
    const result = await askQuestion(question, context);
    
    if (result.success) {
      res.json({
        success: true,
        answer: result.content
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
