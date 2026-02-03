// 已知巨鲸地址库（CEX 钱包、知名地址）
const WHALE_ADDRESSES = {
  // Binance
  '0x3c5b0f1366e13e3645a2bfb3c5a8b2c9c3e8f7a5': { name: 'Binance 1', type: 'cex', label: 'hot' },
  '0x56eddb7aa87536c09d5c26719d4910c85f7a2c9d': { name: 'Binance 2', type: 'cex', label: 'hot' },
  '0x0676b87b507cacc2ab9e4e3c9c2e4f8d7a6e3c2f': { name: 'Binance Cold', type: 'cex', label: 'cold' },
  
  // Coinbase
  '0xb98e9e58cd9b7c9d97a2a1e4f7c8b6d5a3e2f1c0': { name: 'Coinbase 1', type: 'cex', label: 'hot' },
  
  // Kraken
  '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b': { name: 'Kraken', type: 'cex', label: 'hot' },
  
  // 知名巨鲸
  '0xD6216fC9C05d9Db7A0aE1d7C41d3f5aD3a3B7D3D': { name: 'CZ', type: 'individual', label: 'whale' },
  '0x4759eA5a6e9d9F9a3b1f4e9d7f4e9d9F9A3B1F4E': { name: 'SBF', type: 'individual', label: 'whale' },
  '0x28C6c06298d514Db8897c1E235aE4C5bA7C1E0E0': { name: 'Justin Sun', type: 'individual', label: 'whale' },
  '0x15a9f1b7d61e30c2c3c5c7d8e9f0a1b2c3d4e5f6': { name: 'Arthur Hayes', type: 'individual', label: 'whale' },
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': { name: 'Uniswap V3 Router', type: 'protocol', label: 'protocol' },
};

// 监控的代币对
const MONITOR_PAIRS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC', 'LINK'];

// 信号阈值配置
const SIGNAL_THRESHOLDS = {
  large_tx_multiplier: 2.5,  // 平均交易额的2.5倍
  sentiment_score_buy: 0.3,   // 正面情绪阈值
  sentiment_score_sell: -0.3, // 负面情绪阈值
  whale_concentration: 0.3,  // 巨鲸持仓集中度
};

/**
 * 分析巨鲸地址的交易活动
 */
function analyzeWhaleActivity(transactions) {
  if (!transactions || transactions.length === 0) {
    return { score: 0, signal: 'neutral', confidence: 0, reason: '无交易数据' };
  }
  
  // 计算净流入/流出
  let totalInflow = 0;
  let totalOutflow = 0;
  let largeBuyCount = 0;
  let largeSellCount = 0;
  
  transactions.forEach(tx => {
    const value = tx.value_usd || 0;
    
    if (tx.recipient && WHALE_ADDRESSES[tx.recipient.toLowerCase()]) {
      totalInflow += value;
      if (value > 10000000) largeBuyCount++; // 1000万以上算大额买入
    }
    
    if (tx.sender && WHALE_ADDRESSES[tx.sender.toLowerCase()]) {
      totalOutflow += value;
      if (value > 10000000) largeSellCount++; // 1000万以上算大额卖出
    }
  });
  
  const netFlow = totalInflow - totalOutflow;
  const totalFlow = totalInflow + totalOutflow;
  const netFlowRatio = totalFlow > 0 ? netFlow / totalFlow : 0;
  
  // 判断信号
  let signal = 'neutral';
  let reason = '';
  
  if (netFlowRatio > 0.15) {
    signal = 'bullish';
    reason = `净流入 ${formatUSD(netFlow)}，大额买入 ${largeBuyCount} 笔`;
  } else if (netFlowRatio < -0.15) {
    signal = 'bearish';
    reason = `净流出 ${formatUSD(Math.abs(netFlow))}，大额卖出 ${largeSellCount} 笔`;
  } else {
    reason = '多空平衡，观望为主';
  }
  
  const confidence = Math.min(Math.abs(netFlowRatio) * 2 + 0.3, 0.95);
  
  return {
    score: netFlowRatio,
    signal,
    confidence,
    reason,
    metrics: {
      totalInflow,
      totalOutflow,
      netFlow,
      largeBuyCount,
      largeSellCount
    }
  };
}

/**
 * 分析新闻情绪
 */
function analyzeSentiment(news) {
  if (!news || news.length === 0) {
    return { score: 0, signal: 'neutral', confidence: 0, reason: '无新闻数据' };
  }
  
  // 关键词权重
  const bullishKeywords = {
    'surge': 0.2, 'rally': 0.2, 'breakout': 0.15, 'bullish': 0.25, 'moon': 0.2,
    'adoption': 0.15, 'partnership': 0.1, 'launch': 0.1, 'upgrade': 0.1, 'upgrade': 0.1,
    'record high': 0.2, 'all-time high': 0.25, 'ETF approved': 0.3, 'institutional': 0.15
  };
  
  const bearishKeywords = {
    'crash': -0.25, 'plunge': -0.2, 'dump': -0.2, 'bearish': -0.25, 'hack': -0.2,
    'scam': -0.25, 'lawsuit': -0.15, 'ban': -0.2, 'regulation': -0.1, 'crackdown': -0.2,
    'liquidations': -0.15, 'sell-off': -0.15, 'worried': -0.1, 'uncertainty': -0.1,
    'all-time low': -0.2, 'reject': -0.1, 'pressure': -0.1
  };
  
  let totalScore = 0;
  let newsWithSignal = 0;
  
  news.forEach(item => {
    const text = (item.title + ' ' + item.content).toLowerCase();
    let score = 0;
    
    Object.entries(bullishKeywords).forEach(([keyword, weight]) => {
      if (text.includes(keyword)) score += weight;
    });
    
    Object.entries(bearishKeywords).forEach(([keyword, weight]) => {
      if (text.includes(keyword)) score += weight;
    });
    
    totalScore += score;
    if (score !== 0) newsWithSignal++;
  });
  
  const avgScore = news.length > 0 ? totalScore / news.length : 0;
  
  let signal = 'neutral';
  let reason = '';
  
  if (avgScore > 0.1) {
    signal = 'bullish';
    reason = `新闻情绪偏多 (${newsWithSignal} 条相关)`;
  } else if (avgScore < -0.1) {
    signal = 'bearish';
    reason = `新闻情绪偏空 (${newsWithSignal} 条相关)`;
  } else {
    reason = '新闻情绪中性';
  }
  
  const confidence = Math.min(Math.abs(avgScore) * 3 + 0.2, 0.9);
  
  return {
    score: avgScore,
    signal,
    confidence,
    reason,
    metrics: {
      totalNews: news.length,
      newsWithSignal,
      avgScore
    }
  };
}

/**
 * 综合分析生成 AI 信号
 */
function generateAISignal(whaleActivity, sentiment) {
  // 权重分配：巨鲸活动 60%，新闻情绪 40%
  const whaleWeight = 0.6;
  const sentimentWeight = 0.4;
  
  const combinedScore = 
    whaleActivity.score * whaleWeight + 
    sentiment.score * sentimentWeight;
  
  const combinedConfidence = 
    whaleActivity.confidence * whaleWeight + 
    sentiment.confidence * sentimentWeight;
  
  // 判断信号
  let signal = 'neutral';
  let recommendation = 'HOLD';
  let emoji = '⚖️';
  
  if (combinedScore > 0.08) {
    signal = 'bullish';
    recommendation = 'BUY';
    emoji = '🟢';
  } else if (combinedScore < -0.08) {
    signal = 'bearish';
    recommendation = 'SELL';
    emoji = '🔴';
  }
  
  // 生成分析文本
  let analysis = '';
  if (whaleActivity.reason) {
    analysis += `巨鲸: ${whaleActivity.reason}。`;
  }
  if (sentiment.reason) {
    analysis += ` 情绪: ${sentiment.reason}。`;
  }
  
  // 根据置信度调整建议
  if (combinedConfidence < 0.4) {
    recommendation = 'HOLD';
    emoji = '⚪';
  }
  
  return {
    signal,
    recommendation,
    emoji,
    combinedScore: combinedScore.toFixed(3),
    confidence: combinedConfidence.toFixed(2),
    analysis,
    whaleActivity,
    sentiment,
    timestamp: new Date().toISOString()
  };
}

/**
 * 格式化金额
 */
function formatUSD(value) {
  if (value >= 1000000000) {
    return '$' + (value / 1000000000).toFixed(2) + 'B';
  } else if (value >= 1000000) {
    return '$' + (value / 1000000).toFixed(2) + 'M';
  } else if (value >= 1000) {
    return '$' + (value / 1000).toFixed(1) + 'K';
  }
  return '$' + value.toFixed(0);
}

module.exports = {
  WHALE_ADDRESSES,
  MONITOR_PAIRS,
  SIGNAL_THRESHOLDS,
  analyzeWhaleActivity,
  analyzeSentiment,
  generateAISignal
};
