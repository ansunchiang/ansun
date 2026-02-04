// 巨鲸地址库
const WHALE_ADDRESSES = {
  // 交易所热钱包
  '0x3c5b0f1366e13e3645a2bfb3c5a8b2c9c3e8f7a5': { name: 'Binance 1', type: 'cex', label: 'hot' },
  '0x56eddb7aa87536c09d5c26719d4910c85f7a2c9d': { name: 'Binance 2', type: 'cex', label: 'hot' },
  '0xb98e9e58cd9b7c9d97a2a1e4f7c8b6d5a3e2f1c0': { name: 'Coinbase', type: 'cex', label: 'hot' },
  '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b': { name: 'Kraken', type: 'cex', label: 'hot' },
  
  // 知名人物
  '0xD6216fC9C05d9Db7A0aE1d7C41d3f5aD3a3B7D3D': { name: 'CZ', type: 'individual', label: 'whale' },
  '0x4759eA5a6e9d9F9a3b1f4e9d7f4e9d9F9A3B1F4E': { name: 'SBF', type: 'individual', label: 'whale' },
  '0x28C6c06298d514Db8897c1E235aE4C5bA7C1E0E0': { name: 'Justin Sun', type: 'individual', label: 'whale' },
  '0x15a9f1b7d61e30c2c3c5c7d8e9f0a1b2c3d4e5f6': { name: 'Arthur Hayes', type: 'individual', label: 'whale' },
  '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045': { name: 'Vitalik Buterin', type: 'individual', label: 'whale' },
  
  // 机构
  '0x5f65f7b609678448494De4C87521CdF6c2f5eDA2': { name: 'Grayscale', type: 'institution', label: 'institution' },
  '0xE2FC71F8111A73243eCa2194c9d84a08179a5AA6': { name: 'BlackRock', type: 'institution', label: 'institution' }
};

// 概念/叙事分类
const NARRATIVES = {
  'ai': { name: 'AI + Crypto', icon: '🤖', keywords: ['ai', 'artificial intelligence', 'machine learning', 'neural', 'gpt', 'openai'] },
  'rwa': { name: 'RWA', icon: '📋', keywords: ['rwa', 'real world assets', 'tokenization', 'securities', 'bonds', 'real estate'] },
  'defi': { name: 'DeFi', icon: '💰', keywords: ['defi', 'decentralized finance', 'uniswap', 'aave', 'compound', 'curve'] },
  'memecoin': { name: 'Memecoin', icon: '🐕', keywords: ['memecoin', 'doge', 'shiba', 'pepe', 'bonk', 'meme'] },
  'layer2': { name: 'Layer 2', icon: '🔷', keywords: ['layer 2', 'l2', 'arbitrum', 'optimism', 'polygon', 'zksync'] },
  'gaming': { name: 'Gaming', icon: '🎮', keywords: ['gaming', 'gamefi', 'nft games', 'metaverse', 'axie', 'sandbox'] },
  'restaking': { name: 'Restaking', icon: '🔒', keywords: ['restaking', 'eigenlayer', 'liquid staking', 'staked eth'] }
};

// 监控的代币列表
const MONITOR_TOKENS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC', 'LINK', 'ARB', 'OP', 'DOGE', 'SHIB', 'PEPE'];

/**
 * 检测地址是否在巨鲸库中
 */
function identifyWhale(address) {
  const normalized = address.toLowerCase();
  return WHALE_ADDRESSES[normalized] || null;
}

/**
 * 分析巨鲸活动类型
 */
function analyzeWhaleActivity(transactions) {
  if (!transactions || transactions.length === 0) return [];
  
  const alerts = [];
  
  transactions.forEach(tx => {
    const sender = identifyWhale(tx.from || tx.sender);
    const recipient = identifyWhale(tx.to || tx.recipient);
    
    if (sender || recipient) {
      const value = tx.value_usd || tx.value * (tx.price || 2000);
      
      alerts.push({
        type: 'whale_tx',
        timestamp: tx.timestamp || Date.now(),
        address: sender?.name || recipient?.name || 'Unknown',
        type_label: sender?.type || recipient?.type || 'unknown',
        action: sender ? 'sent' : 'received',
        token: tx.token || tx.symbol || 'ETH',
        value_usd: value,
        value_display: formatUSD(value),
        is_large: value > 1000000, // > $1M
        is_very_large: value > 10000000, // > $10M
        is_exchange: (sender?.type === 'cex' || recipient?.type === 'cex')
      });
    }
  });
  
  return alerts.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * 概念热度分析
 */
function analyzeNarrativeTrends(news, timeframe = 24) {
  const now = Date.now();
  const cutoff = now - timeframe * 60 * 60 * 1000;
  
  const narrativeScores = {};
  
  // 初始化
  Object.keys(NARRATIVES).forEach(key => {
    narrativeScores[key] = {
      name: NARRATIVES[key].name,
      icon: NARRATIVES[key].icon,
      score: 0,
      article_count: 0,
      sentiment_sum: 0,
      recent_articles: []
    };
  });
  
  // 分析新闻
  const recentNews = news.filter(n => n.timestamp > cutoff);
  
  recentNews.forEach(article => {
    const text = (article.title + ' ' + article.content).toLowerCase();
    
    Object.entries(NARRATIVES).forEach(([key, narrative]) => {
      const keywords = narrative.keywords;
      const matchCount = keywords.filter(k => text.includes(k)).length;
      
      if (matchCount > 0) {
        const sentiment = article.sentiment || calculateSentiment(text);
        const score = matchCount * 10 + (sentiment > 0 ? 5 : sentiment < 0 ? -5 : 0);
        
        narrativeScores[key].score += score;
        narrativeScores[key].article_count++;
        narrativeScores[key].sentiment_sum += sentiment;
        narrativeScores[key].recent_articles.push({
          title: article.title,
          sentiment
        });
      }
    });
  });
  
  // 计算趋势
  const trends = Object.values(narrativeScores)
    .filter(n => n.article_count > 0)
    .map(n => ({
      ...n,
      avg_sentiment: n.sentiment_sum / n.article_count,
      trend: n.score > 50 ? 'hot' : n.score > 20 ? 'rising' : n.score < -10 ? 'cooling' : 'stable'
    }))
    .sort((a, b) => b.score - a.score);
  
  return {
    trends,
    hot_narratives: trends.filter(t => t.trend === 'hot' || t.trend === 'rising'),
    cooling_narratives: trends.filter(t => t.trend === 'cooling'),
    updated: new Date().toISOString()
  };
}

/**
 * 计算文本情感
 */
function calculateSentiment(text) {
  const bullish = ['surge', 'rally', 'breakout', 'bullish', 'moon', 'adoption', 'partnership', 'launch', 'upgrade', 'record high', 'ETF', 'institutional'];
  const bearish = ['crash', 'plunge', 'dump', 'bearish', 'hack', 'scam', 'lawsuit', 'ban', 'regulation', 'crackdown', 'liquidations'];
  
  let score = 0;
  bullish.forEach(w => { if (text.includes(w)) score += 0.1; });
  bearish.forEach(w => { if (text.includes(w)) score -= 0.1; });
  
  return Math.max(-1, Math.min(1, score));
}

/**
 * 生成个性化信息流
 */
function generatePersonalizedFeed(news, events, whaleAlerts, preferences) {
  const { followed_coins = [] } = preferences;
  
  if (followed_coins.length === 0) {
    return {
      news: news.slice(0, 10),
      events: events.slice(0, 5),
      whaleAlerts: whaleAlerts.slice(0, 5),
      message: '请先关注一些币种以获取个性化内容'
    };
  }
  
  const keywords = followed_coins.flatMap(coin => [
    coin.toLowerCase(),
    coin.toLowerCase() + ' ',
    '$' + coin.toLowerCase()
  ]);
  
  const filteredNews = news.filter(article => {
    const text = (article.title + ' ' + article.content).toLowerCase();
    return keywords.some(k => text.includes(k));
  });
  
  const filteredEvents = events.filter(event => {
    const text = (event.name + ' ' + event.description || '').toLowerCase();
    return keywords.some(k => text.includes(k));
  });
  
  const filteredWhale = whaleAlerts.filter(alert => {
    return followed_coins.some(coin => 
      alert.token?.toLowerCase() === coin.toLowerCase() ||
      alert.token?.toLowerCase().includes(coin.toLowerCase())
    );
  });
  
  return {
    news: filteredNews.slice(0, 10),
    events: filteredEvents.slice(0, 5),
    whaleAlerts: filteredWhale.slice(0, 5),
    followed_coins,
    message: `显示 ${followed_coins.join(', ')} 相关内容`
  };
}

/**
 * 格式化金额
 */
function formatUSD(value) {
  if (value >= 1000000000) return '$' + (value / 1000000000).toFixed(2) + 'B';
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M';
  if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'K';
  return '$' + value.toFixed(0);
}

module.exports = {
  WHALE_ADDRESSES,
  NARRATIVES,
  MONITOR_TOKENS,
  identifyWhale,
  analyzeWhaleActivity,
  analyzeNarrativeTrends,
  generatePersonalizedFeed,
  formatUSD
};
