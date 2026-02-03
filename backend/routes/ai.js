/**
 * AI API路由
 */

const express = require('express');
const router = express.Router();
const { askQuestion, getKnowledgeBaseStats, clearKnowledgeBase } = require('../services/ai');

/**
 * POST /api/ai/ask
 * 智能问答（带知识库缓存）
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
        fromCache: result.fromCache || false,
        cached: result.cached || false,
        question: result.question || null,
        tokenUsed: result.tokenUsed || 0
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

/**
 * GET /api/ai/stats
 * 获取知识库统计
 */
router.get('/stats', (req, res) => {
  try {
    const stats = getKnowledgeBaseStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/ai/knowledge-base
 * 清空知识库
 */
router.delete('/knowledge-base', (req, res) => {
  try {
    const result = clearKnowledgeBase();
    res.json({
      success: true,
      message: 'Knowledge base cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
