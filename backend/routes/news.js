/**
 * 新闻API路由
 */

const express = require('express');
const router = express.Router();
const { getNews, getHotNews, searchNews, getNewsBySource, getNewsSources } = require('../services/news');
const { summarizeNews } = require('../services/ai');

/**
 * GET /api/news
 * 获取新闻列表
 */
router.get('/', async (req, res) => {
  try {
    const { limit, source, category } = req.query;
    const news = await getNews({
      limit: limit ? parseInt(limit) : 20,
      source,
      category
    });
    
    res.json({
      success: true,
      data: news,
      count: news.length
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/news/hot
 * 获取热门新闻
 */
router.get('/hot', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const news = await getHotNews(limit);
    
    res.json({
      success: true,
      data: news,
      count: news.length
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/news/search
 * 搜索新闻
 */
router.get('/search', async (req, res) => {
  try {
    const { keyword, limit } = req.query;
    
    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: '缺少关键词'
      });
    }
    
    const news = await searchNews(keyword, limit ? parseInt(limit) : 20);
    
    res.json({
      success: true,
      data: news,
      count: news.length,
      keyword
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/news/sources
 * 获取新闻来源列表
 */
router.get('/sources', (req, res) => {
  try {
    const sources = getNewsSources();
    
    res.json({
      success: true,
      data: sources
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/news/summary
 * 获取新闻摘要
 */
router.get('/summary', async (req, res) => {
  try {
    const news = await getNews({ limit: 10 });
    const result = await summarizeNews(news);
    
    res.json({
      success: true,
      summary: result.content,
      newsCount: news.length
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
