const express = require('express');
const router = express.Router();
const { getGoldPrice, getSilverPrice, getPreciousMetals } = require('../services/gold');

/**
 * GET /api/gold/price
 * 获取黄金价格
 */
router.get('/price', async (req, res) => {
  try {
    const data = await getGoldPrice();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Gold price error:', error);
    res.json({ success: false, error: error.message });
  }
});

/**
 * GET /api/gold/silver
 * 获取白银价格
 */
router.get('/silver', async (req, res) => {
  try {
    const data = await getSilverPrice();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Silver price error:', error);
    res.json({ success: false, error: error.message });
  }
});

/**
 * GET /api/gold/all
 * 获取贵金属综合行情
 */
router.get('/all', async (req, res) => {
  try {
    const data = await getPreciousMetals();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Precious metals error:', error);
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;
