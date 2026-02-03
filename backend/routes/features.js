/**
 * 特色功能API路由
 */

const express = require('express');
const router = express.Router();
const { getUpcomingUnlocks, getImportantEvents, getTrendingNarratives, getDailySummary, getDashboardData } = require('../services/features');

/**
 * GET /api/features/dashboard
 * 获取首页仪表盘数据
 */
router.get('/dashboard', async (req, res) => {
  try {
    // 获取新闻用于摘要
    const newsRes = await fetch(`${req.protocol}://${req.get('host')}/api/news/en?limit=10`);
    const newsData = await newsRes.json();
    const news = newsData.success ? newsData.data : [];
    
    const data = await getDashboardData(news);
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/features/unlocks
 * 获取代币解锁日历
 */
router.get('/unlocks', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const unlocks = await getUpcomingUnlocks(parseInt(days));
    
    res.json({
      success: true,
      data: unlocks,
      count: unlocks.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/features/events
 * 获取重要事件
 */
router.get('/events', async (req, res) => {
  try {
    const events = await getImportantEvents();
    
    res.json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/features/narratives
 * 获取热门叙事
 */
router.get('/narratives', async (req, res) => {
  try {
    const narratives = await getTrendingNarratives();
    
    res.json({
      success: true,
      data: narratives,
      count: narratives.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/features/summary
 * 获取AI每日摘要
 */
router.get('/summary', async (req, res) => {
  try {
    const newsRes = await fetch(`${req.protocol}://${req.get('host')}/api/news/en?limit=20`);
    const newsData = await newsRes.json();
    const news = newsData.success ? newsData.data : [];
    
    const summary = await getDailySummary(news);
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
