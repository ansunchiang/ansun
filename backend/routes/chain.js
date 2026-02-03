/**
 * 链上数据API路由
 */

const express = require('express');
const router = express.Router();
const { getLargeBTCTransactions, getLargeETHTransactions, getWhaleHoldings, getExchangeFlows, getOnchainMetrics, getWhaleDashboard } = require('../services/chain');

/**
 * GET /api/chain/whale-dashboard
 * 巨鲸追踪仪表盘
 */
router.get('/whale-dashboard', async (req, res) => {
  try {
    const data = await getWhaleDashboard();
    
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
 * GET /api/chain/btc-transactions
 * BTC大额转账
 */
router.get('/btc-transactions', async (req, res) => {
  try {
    const transactions = await getLargeBTCTransactions();
    
    res.json({
      success: true,
      data: transactions.slice(0, 10),
      count: transactions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/chain/eth-transactions
 * ETH大额转账
 */
router.get('/eth-transactions', async (req, res) => {
  try {
    const transactions = await getLargeETHTransactions();
    
    res.json({
      success: true,
      data: transactions.slice(0, 10),
      count: transactions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/chain/whale-holdings
 * 巨鲸持仓
 */
router.get('/whale-holdings', async (req, res) => {
  try {
    const holdings = await getWhaleHoldings();
    
    res.json({
      success: true,
      data: holdings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/chain/exchange-flows
 * 交易所流入/流出
 */
router.get('/exchange-flows', async (req, res) => {
  try {
    const flows = await getExchangeFlows();
    
    res.json({
      success: true,
      data: flows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/chain/metrics
 * 链上指标
 */
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await getOnchainMetrics();
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
