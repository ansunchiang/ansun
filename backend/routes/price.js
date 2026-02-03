/**
 * 行情API路由
 */

const express = require('express');
const router = express.Router();
const { getTopCoins, getCoinDetail, searchCoins, getTrending, formatPrice, formatMarketCap } = require('../services/price');

/**
 * GET /api/price/top
 * 获取Top加密货币行情
 * query: limit, currency
 */
router.get('/top', async (req, res) => {
  try {
    const { limit = 50, currency = 'usd' } = req.query;
    const coins = await getTopCoins(parseInt(limit), currency);
    
    res.json({
      success: true,
      data: coins,
      count: coins.length,
      last_updated: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/price/detail/:id
 * 获取单个币种详情
 */
router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { currency = 'usd' } = req.query;
    
    const coin = await getCoinDetail(id, currency);
    
    if (coin) {
      res.json({
        success: true,
        data: coin
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Coin not found'
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
 * GET /api/price/search
 * 搜索币种
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Missing query'
      });
    }
    
    const results = await searchCoins(q);
    
    res.json({
      success: true,
      data: results,
      count: results.length
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/price/trending
 * 获取Trending币种
 */
router.get('/trending', async (req, res) => {
  try {
    const trending = await getTrending();
    
    res.json({
      success: true,
      data: trending,
      count: trending.length
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/price/format
 * 格式化价格显示
 */
router.get('/format', (req, res) => {
  try {
    const { price, type } = req.query;
    
    if (!price) {
      return res.status(400).json({
        success: false,
        error: 'Missing price'
      });
    }
    
    const numPrice = parseFloat(price);
    let formatted;
    
    if (type === 'market_cap') {
      formatted = formatMarketCap(numPrice);
    } else {
      formatted = formatPrice(numPrice);
    }
    
    res.json({
      success: true,
      original: numPrice,
      formatted
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
