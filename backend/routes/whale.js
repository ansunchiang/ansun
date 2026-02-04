const express = require('express');
const router = express.Router();
const { WHALE_ADDRESSES, NARRATIVES, identifyWhale, analyzeWhaleActivity, analyzeNarrativeTrends, generatePersonalizedFeed, formatUSD } = require('../services/whale');
const { getCachedNews } = require('../services/news');

/**
 * GET /api/whale/alerts
 * 获取巨鲸实时提醒
 */
router.get('/alerts', async (req, res) => {
  try {
    // 模拟实时巨鲸交易数据
    const mockTransactions = [
      {
        hash: '0x' + Math.random().toString(16).slice(2, 10) + '...',
        from: '0x3c5b0f1366e13e3645a2bfb3c5a8b2c9c3e8f7a5',
        to: '0x28C6c06298d514Db8897c1E235aE4C5bA7C1E0E0',
        token: 'BTC',
        value: 2500,
        value_usd: 187500000,
        timestamp: Date.now() - 1800000 // 30分钟前
      },
      {
        hash: '0x' + Math.random().toString(16).slice(2, 10) + '...',
        from: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        to: '0x56eddb7aa87536c09d5c26719d4910c85f7a2c9d',
        token: 'ETH',
        value: 5000,
        value_usd: 11300000,
        timestamp: Date.now() - 3600000 // 1小时前
      },
      {
        hash: '0x' + Math.random().toString(16).slice(2, 10) + '...',
        from: '0xD6216fC9C05d9Db7A0aE1d7C41d3f5aD3a3B7D3D',
        to: '0x15a9f1b7d61e30c2c3c5c7d8e9f0a1b2c3d4e5f6',
        token: 'BNB',
        value: 15000,
        value_usd: 4500000,
        timestamp: Date.now() - 7200000 // 2小时前
      }
    ];
    
    const alerts = analyzeWhaleActivity(mockTransactions);
    
    // 标记特别重要的警报
    const importantAlerts = alerts.map(alert => ({
      ...alert,
      importance: alert.value_usd > 10000000 ? 'critical' : alert.value_usd > 1000000 ? 'high' : 'normal',
      alert_level: alert.value_usd > 10000000 ? '🔴 重大' : alert.value_usd > 1000000 ? '🟠 大额' : '🟡 监控'
    }));
    
    res.json({
      success: true,
      data: {
        alerts: importantAlerts,
        summary: {
          total: alerts.length,
          critical: alerts.filter(a => a.value_usd > 10000000).length,
          large: alerts.filter(a => a.value_usd > 1000000).length,
          exchange_involvement: alerts.filter(a => a.is_exchange).length
        },
        whale_count: Object.keys(WHALE_ADDRESSES).length,
        monitored_addresses: Object.values(WHALE_ADDRESSES).map(w => w.name),
        last_updated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Whale alerts error:', error);
    res.json({ success: false, error: error.message });
  }
});

/**
 * GET /api/whale/address/:address
 * 查询地址信息
 */
router.get('/address/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const whale = identifyWhale(address);
    
    res.json({
      success: true,
      data: {
        address,
        identified: !!whale,
        info: whale || { name: 'Unknown', type: 'unknown' },
        recent_activity: whale ? [
          { type: 'receive', token: 'ETH', value: 1500, timestamp: Date.now() - 86400000 },
          { type: 'send', token: 'BTC', value: 500, timestamp: Date.now() - 172800000 }
        ] : []
      }
    });
  } catch (error) {
    console.error('Address query error:', error);
    res.json({ success: false, error: error.message });
  }
});

/**
 * GET /api/whale/narratives
 * 获取概念轮动分析
 */
router.get('/narratives', async (req, res) => {
  try {
    const newsData = getCachedNews('en') || [];
    const analysis = analyzeNarrativeTrends(newsData, 24);
    
    res.json({
      success: true,
      data: {
        narratives: analysis.trends,
        hot: analysis.hot_narratives,
        cooling: analysis.cooling_narratives,
        insights: generateNarrativeInsights(analysis.trends),
        updated: analysis.updated
      }
    });
  } catch (error) {
    console.error('Narratives error:', error);
    res.json({ success: false, error: error.message });
  }
});

/**
 * GET /api/whale/feed
 * 获取个性化信息流
 */
router.get('/feed', async (req, res) => {
  try {
    // 从查询参数获取关注的币种
    const followed = req.query.coins?.split(',').filter(Boolean) || ['BTC', 'ETH'];
    
    const newsData = getCachedNews('en') || [];
    const mockEvents = [
      { id: 1, name: 'BTC减半', date: '2028-04-01', type: 'halving', impact: 'high' },
      { id: 2, name: 'ETH ETF决策', date: '2026-03-15', type: 'etf', impact: 'high' },
      { id: 3, name: 'ARB空投解锁', date: '2026-02-20', type: 'unlock', impact: 'medium' }
    ];
    
    const mockAlerts = [
      { type: 'whale_tx', address: 'CZ', token: 'BTC', value: 2500, value_usd: 187500000, action: 'sent', timestamp: Date.now() - 1800000 },
      { type: 'whale_tx', address: 'Vitalik', token: 'ETH', value: 5000, value_usd: 11300000, action: 'sent', timestamp: Date.now() - 3600000 }
    ];
    
    const feed = generatePersonalizedFeed(newsData, mockEvents, mockAlerts, { followed_coins: followed });
    
    res.json({
      success: true,
      data: {
        ...feed,
        available_coins: ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC', 'LINK', 'ARB', 'OP'],
        updated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Feed error:', error);
    res.json({ success: false, error: error.message });
  }
});

/**
 * 生成概念分析洞察
 */
function generateNarrativeInsights(trends) {
  const insights = [];
  
  const hot = trends.filter(t => t.trend === 'hot' || t.trend === 'rising');
  const cooling = trends.filter(t => t.trend === 'cooling');
  
  if (hot.length > 0) {
    insights.push({
      type: 'opportunity',
      message: `${hot.map(t => t.name).join('、')} 概念热度上升，建议关注`,
      action: '关注'
    });
  }
  
  if (cooling.length > 0) {
    insights.push({
      type: 'warning',
      message: `${cooling.map(t => t.name).概念热度下降，谨慎追高`,
      action: '观望'
    });
  }
  
  const stable = trends.filter(t => t.trend === 'stable' && t.article_count > 0);
  if (stable.length > 0) {
    insights.push({
      type: 'observation',
      message: `${stable[0].name} 概念保持稳定，可逢低布局`,
      action: '关注'
    });
  }
  
  return insights;
}

module.exports = router;
