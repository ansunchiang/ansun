/**
 * 新闻API路由
 */

const express = require('express');
const router = express.Router();
const { getNews, getNewsByUserLang, getHotNews, searchNews, getNewsSources } = require('../services/news');
const { summarizeNews } = require('../services/ai');

/**
 * GET /api/news
 * 获取新闻列表
 * query: limit, source, category, lang
 */
router.get('/', async (req, res) => {
  try {
    const { limit, source, category, lang } = req.query;
    
    // 如果用户指定了语言，使用该语言
    let news;
    if (lang && ['en', 'zh', 'all'].includes(lang)) {
      news = await getNews({
        lang,
        limit: limit ? parseInt(limit) : 30,
        source,
        category
      });
    } else {
      // 默认根据用户偏好混合（中英文）
      news = await getNewsByUserLang(lang || 'en');
    }
    
    res.json({
      success: true,
      data: news,
      count: news.length,
      lang: lang || 'mixed'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/news/en
 * 获取英文新闻
 */
router.get('/en', async (req, res) => {
  try {
    const { limit, category } = req.query;
    const news = await getNews({
      lang: 'en',
      limit: limit ? parseInt(limit) : 30,
      category
    });
    
    res.json({
      success: true,
      data: news,
      count: news.length,
      lang: 'en'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/news/zh
 * 获取中文新闻
 */
router.get('/zh', async (req, res) => {
  try {
    const { limit, category } = req.query;
    const news = await getNews({
      lang: 'zh',
      limit: limit ? parseInt(limit) : 30,
      category
    });
    
    res.json({
      success: true,
      data: news,
      count: news.length,
      lang: 'zh'
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
    const { lang } = req.query;
    const news = await getHotNews(limit, lang || 'all');
    
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
    const { keyword, limit, lang } = req.query;
    
    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: '缺少关键词'
      });
    }
    
    const news = await searchNews(keyword, limit ? parseInt(limit) : 20, lang || 'all');
    
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
    const { lang } = req.query;
    const news = await getNews({ lang: lang || 'all', limit: 10 });
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
