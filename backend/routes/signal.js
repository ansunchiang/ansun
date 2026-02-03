const express = require('express');
const router = express.Router();
const { generateAISignal, analyzeWhaleActivity, analyzeSentiment } = require('../services/signal');
const { getCachedNews } = require('../services/news');

/**
 * GET /api/signal/overall
 * 获取整体市场 AI 信号
 */
router.get('/overall', async (req, res) => {
  try {
    // 获取新闻数据
    const newsData = getCachedNews('en') || [];
    const recentNews = newsData.slice(0, 50); // 取最近50条
    
    // 模拟巨鲸活动数据（实际应该从链上实时获取）
    const whaleActivity = {
      score: 0.12,
      signal: 'bullish',
      confidence: 0.72,
      reason: '净流入 $45.2M，大额买入 8 笔',
      metrics: {
        totalInflow: 52300000,
        totalOutflow: 7100000,
        netFlow: 45200000,
        largeBuyCount: 8,
        largeSellCount: 2
      }
    };
    
    // 分析新闻情绪
    const sentiment = analyzeSentiment(recentNews);
    
    // 生成综合信号
    const signal = generateAISignal(whaleActivity, sentiment);
    
    res.json({
      success: true,
      data: signal
    });
  } catch (error) {
    console.error('Signal error:', error);
    res.json({ success: false, error: error.message });
  }
});

/**
 * GET /api/signal/coin/:symbol
 * 获取特定代币的 AI 信号
 */
router.get('/coin/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const upperSymbol = symbol.toUpperCase();
    
    // 获取相关新闻
    const newsData = getCachedNews('en') || [];
    const coinNews = newsData.filter(n => {
      const text = (n.title + ' ' + n.content).toLowerCase();
      return text.includes(upperSymbol.toLowerCase());
    }).slice(0, 20);
    
    // 模拟代币巨鲸活动
    const whaleActivity = {
      score: (Math.random() - 0.3) * 0.4,
      signal: 'neutral',
      confidence: 0.55 + Math.random() * 0.2,
      reason: '近期无大额异动',
      metrics: {
        totalInflow: Math.random() * 10000000,
        totalOutflow: Math.random() * 8000000,
        netFlow: (Math.random() - 0.4) * 2000000,
        largeBuyCount: Math.floor(Math.random() * 3),
        largeSellCount: Math.floor(Math.random() * 2)
      }
    };
    
    const sentiment = analyzeSentiment(coinNews);
    const signal = generateAISignal(whaleActivity, sentiment);
    
    res.json({
      success: true,
      data: {
        symbol: upperSymbol,
        ...signal,
        newsCount: coinNews.length
      }
    });
  } catch (error) {
    console.error('Coin signal error:', error);
    res.json({ success: false, error: error.message });
  }
});

/**
 * GET /api/signal/whale-activity
 * 获取巨鲸活动详情
 */
router.get('/whale-activity', async (req, res) => {
  try {
    // 模拟巨鲸活动数据
    const activities = [
      {
        address: '0xD6216fC9C05d9Db7A0aE1d7C41d3f5aD3a3B7D3D',
        name: 'CZ',
        action: 'accumulate',
        token: 'BTC',
        amount: 2500,
        value_usd: 187500000,
        timestamp: Date.now() - 3600000
      },
      {
        address: '0x28C6c06298d514Db8897c1E235aE4C5bA7C1E0E0',
        name: 'Justin Sun',
        action: 'buy',
        token: 'ETH',
        amount: 15000,
        value_usd: 33900000,
        timestamp: Date.now() - 7200000
      },
      {
        address: '0x56eddb7aa87536c09d5c26719d4910c85f7a2c9d',
        name: 'Binance Hot',
        action: 'withdraw',
        token: 'BTC',
        amount: 3200,
        value_usd: 240000000,
        timestamp: Date.now() - 10800000
      }
    ];
    
    res.json({
      success: true,
      data: {
        activities,
        summary: {
          totalBuy: 3,
          totalSell: 1,
          netFlow: 423000000
        }
      }
    });
  } catch (error) {
    console.error('Whale activity error:', error);
    res.json({ success: false, error: error.message });
  }
});

/**
 * GET /api/signal/sentiment
 * 获取市场情绪数据
 */
router.get('/sentiment', async (req, res) => {
  try {
    const newsData = getCachedNews('en') || [];
    const sentiment = analyzeSentiment(newsData.slice(0, 100));
    
    res.json({
      success: true,
      data: {
        ...sentiment,
        totalNews: newsData.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Sentiment error:', error);
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;
