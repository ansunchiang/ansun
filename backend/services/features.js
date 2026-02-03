/**
 * 特色功能服务 - 增强版
 * 1. 代币解锁日历
 * 2. AI每日摘要（真·AI生成）
 * 3. 热门叙事追踪
 * 4. 交易所数据
 */

const NodeCache = require('node-cache');
const { callDeepSeek } = require('./ai');

const featureCache = new NodeCache({ stdTTL: 3600 });

// 多语言数据
const DATA = {
  en: {
    unlocks: [
      { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB', image: 'https://assets.coingecko.com/coins/images/16547/large/Logo_-_Arbitrum.png', nextUnlock: '2026-02-15', amount: '1.1B ARB', value: '$880M', percentage: '8.5%', unlockType: 'Team', description: 'Team & Investors Unlock' },
      { id: 'optimism', name: 'Optimism', symbol: 'OP', image: 'https://assets.coingecko.com/coins/images/25244/large/Optimism.png', nextUnlock: '2026-02-20', amount: '386M OP', value: '$770M', percentage: '15.4%', unlockType: 'Ecosystem', description: 'Ecosystem Grants & Partners' },
      { id: 'aptos', name: 'Aptos', symbol: 'APT', image: 'https://assets.coingecko.com/coins/images/26455/large/aptos_round.png', nextUnlock: '2026-02-12', amount: '45M APT', value: '$360M', percentage: '2.1%', unlockType: 'Staking', description: 'Staking Rewards' },
      { id: 'immutable', name: 'Immutable', symbol: 'IMX', image: 'https://assets.coingecko.com/coins/images/12367/large/immutableX_symbol_blue.png', nextUnlock: '2026-02-08', amount: '38M IMX', value: '$76M', percentage: '2.8%', unlockType: 'Ecosystem', description: 'Ecosystem Rewards' },
      { id: 'singularitynet', name: 'SingularityNET', symbol: 'AGIX', image: 'https://assets.coingecko.com/coins/images/1358/large/singularitynet.png', nextUnlock: '2026-02-28', amount: '84M AGIX', value: '$168M', percentage: '7.2%', unlockType: 'Team', description: 'Team & Advisors' },
      { id: 'fetch', name: 'Fetch.ai', symbol: 'FET', image: 'https://assets.coingecko.com/coins/images/5681/large/Fetch.png', nextUnlock: '2026-02-10', amount: '130M FET', value: '$520M', percentage: '12.5%', unlockType: 'Community', description: 'Community & Ecosystem' },
      { id: 'mina', name: 'Mina', symbol: 'MINA', image: 'https://assets.coingecko.com/coins/images/5964/large/Mina_Icon_Core_Unit_2.png', nextUnlock: '2026-02-22', amount: '18M MINA', value: '$14.4M', percentage: '1.5%', unlockType: 'Staking', description: 'Staking Rewards' },
      { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', image: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png', nextUnlock: '2026-02-15', amount: '44M LINK', value: '$880M', percentage: '2.2%', unlockType: 'Ecosystem', description: 'Ecosystem Growth' }
    ],
    events: [
      { id: 1, date: '2026-02-04', title: 'US PCE Inflation Data', importance: 'high', description: 'US PCE Price Index release, affects market sentiment', impact: 'high' },
      { id: 2, date: '2026-02-05', title: 'Fed Officials Speeches', importance: 'medium', description: 'Multiple Fed officials speak, may reveal policy signals', impact: 'medium' },
      { id: 3, date: '2026-02-07', title: 'US Jobs Report', importance: 'high', description: 'Non-farm payrolls data', impact: 'high' }
    ],
    narratives: [
      { id: 1, name: 'AI + Crypto', description: 'AI and blockchain integration projects', keywords: ['FET', 'AGIX', 'OCRAI'], sentiment: 'hot', trend: 'up', icon: '🤖' },
      { id: 2, name: 'RWA', description: 'Real World Assets tokenization', keywords: ['ONDO', 'TRU', 'MNT'], sentiment: 'warm', trend: 'stable', icon: '🏠' },
      { id: 3, name: 'DeFi Summer', description: 'DeFi liquidity protocol recovery', keywords: ['UNI', 'AAVE', 'COMP'], sentiment: 'warm', trend: 'up', icon: '💧' },
      { id: 4, name: 'Layer2', description: 'Layer 2 scaling solutions', keywords: ['ARB', 'OP', 'METIS'], sentiment: 'hot', trend: 'up', icon: '⚡' },
      { id: 5, name: 'Meme Coins', description: 'Community-driven meme tokens', keywords: ['DOGE', 'PEPE', 'WIF'], sentiment: 'mixed', trend: 'volatile', icon: '🐕' }
    ],
    marketStats: {
      fearGreedIndex: 25,
      marketMood: 'fear',
      dominance: { btc: 52.3, eth: 17.2 },
      defiTvl: '125.4B',
      nftVolume24h: '45.2M'
    }
  },
  zh: {
    unlocks: [
      { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB', image: 'https://assets.coingecko.com/coins/images/16547/large/Logo_-_Arbitrum.png', nextUnlock: '2026-02-15', amount: '11亿ARB', value: '$8.8亿', percentage: '8.5%', unlockType: '团队', description: '团队与投资者解锁' },
      { id: 'optimism', name: 'Optimism', symbol: 'OP', image: 'https://assets.coingecko.com/coins/images/25244/large/Optimism.png', nextUnlock: '2026-02-20', amount: '3.86亿OP', value: '$7.7亿', percentage: '15.4%', unlockType: '生态', description: '生态资助与合作方' },
      { id: 'aptos', name: 'Aptos', symbol: 'APT', image: 'https://assets.coingecko.com/coins/images/26455/large/aptos_round.png', nextUnlock: '2026-02-12', amount: '4500万APT', value: '$3.6亿', percentage: '2.1%', unlockType: '质押', description: '质押奖励' },
      { id: 'immutable', name: 'Immutable', symbol: 'IMX', image: 'https://assets.coingecko.com/coins/images/12367/large/immutableX_symbol_blue.png', nextUnlock: '2026-02-08', amount: '3800万IMX', value: '$7600万', percentage: '2.8%', unlockType: '生态', description: '生态奖励' },
      { id: 'singularitynet', name: 'SingularityNET', symbol: 'AGIX', image: 'https://assets.coingecko.com/coins/images/1358/large/singularitynet.png', nextUnlock: '2026-02-28', amount: '8400万AGIX', value: '$1.68亿', percentage: '7.2%', unlockType: '团队', description: '团队与顾问' },
      { id: 'fetch', name: 'Fetch.ai', symbol: 'FET', image: 'https://assets.coingecko.com/coins/images/5681/large/Fetch.png', nextUnlock: '2026-02-10', amount: '1.3亿FET', value: '$5.2亿', percentage: '12.5%', unlockType: '社区', description: '社区与生态' },
      { id: 'mina', name: 'Mina', symbol: 'MINA', image: 'https://assets.coingecko.com/coins/images/5964/large/Mina_Icon_Core_Unit_2.png', nextUnlock: '2026-02-22', amount: '1800万MINA', value: '$1440万', percentage: '1.5%', unlockType: '质押', description: '质押奖励' },
      { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', image: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png', nextUnlock: '2026-02-15', amount: '4400万LINK', value: '$8.8亿', percentage: '2.2%', unlockType: '生态', description: '生态增长' }
    ],
    events: [
      { id: 1, date: '2026-02-04', title: '美国PCE通胀数据', importance: 'high', description: '美国PCE物价指数发布，影响市场情绪', impact: 'high' },
      { id: 2, date: '2026-02-05', title: '美联储官员讲话', importance: 'medium', description: '多位美联储官员讲话，可能透露政策信号', impact: 'medium' },
      { id: 3, date: '2026-02-07', title: '美国非农就业', importance: 'high', description: '美国非农就业数据', impact: 'high' }
    ],
    narratives: [
      { id: 1, name: 'AI + Crypto', description: '人工智能与区块链结合的项目', keywords: ['FET', 'AGIX', 'OCRAI'], sentiment: 'hot', trend: 'up', icon: '🤖' },
      { id: 2, name: 'RWA', description: '真实世界资产代币化', keywords: ['ONDO', 'TRU', 'MNT'], sentiment: 'warm', trend: 'stable', icon: '🏠' },
      { id: 3, name: 'DeFi Summer', description: 'DeFi流动性协议复苏', keywords: ['UNI', 'AAVE', 'COMP'], sentiment: 'warm', trend: 'up', icon: '💧' },
      { id: 4, name: 'Layer2', description: '二层网络解决方案', keywords: ['ARB', 'OP', 'METIS'], sentiment: 'hot', trend: 'up', icon: '⚡' },
      { id: 5, name: 'Meme Coins', description: '社区驱动的Meme代币', keywords: ['DOGE', 'PEPE', 'WIF'], sentiment: 'mixed', trend: 'volatile', icon: '🐕' }
    ],
    marketStats: {
      fearGreedIndex: 25,
      marketMood: '恐惧',
      dominance: { btc: 52.3, eth: 17.2 },
      defiTvl: '1254亿美元',
      nftVolume24h: '4520万美元'
    }
  }
};

/**
 * 获取即将解锁的代币
 */
async function getUpcomingUnlocks(days = 30, lang = 'en') {
  const cacheKey = `unlocks_${days}_${lang}`;
  const cached = featureCache.get(cacheKey);
  if (cached) return cached;
  
  const data = DATA[lang] || DATA.en;
  const now = new Date();
  
  const unlocks = data.unlocks
    .filter(token => {
      const unlockDate = new Date(token.nextUnlock);
      return unlockDate >= now && unlockDate <= new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    })
    .sort((a, b) => new Date(a.nextUnlock) - new Date(b.nextUnlock))
    .map(token => ({
      ...token,
      daysUntil: Math.ceil((new Date(token.nextUnlock) - now) / (1000 * 60 * 60 * 24))
    }));
  
  featureCache.set(cacheKey, unlocks);
  return unlocks;
}

/**
 * 获取重要事件
 */
async function getImportantEvents(lang = 'en') {
  return DATA[lang]?.events || DATA.en.events;
}

/**
 * 热门叙事
 */
async function getTrendingNarratives(lang = 'en') {
  const cacheKey = `narratives_${lang}`;
  const cached = featureCache.get(cacheKey);
  if (cached) return cached;
  
  const data = DATA[lang] || DATA.en;
  featureCache.set(cacheKey, data.narratives, 1800);
  return data.narratives;
}

/**
 * AI生成每日摘要（真·AI）
 */
async function getDailySummary(news = [], lang = 'en') {
  const cacheKey = `summary_${lang}_${new Date().toDateString()}`;
  const cached = featureCache.get(cacheKey);
  if (cached) return cached;
  
  const data = DATA[lang] || DATA.en;
  
  // 如果有新闻，让AI生成摘要
  if (news.length > 0) {
    const newsList = news.slice(0, 8).map(n => `- ${n.title} (${n.source})`).join('\n');
    
    const prompts = {
      en: `Summarize today's crypto news in 3 bullet points (50 words each), then give a brief market sentiment (1 sentence). News:\n${newsList}`,
      zh: `用3个要点总结今日币圈新闻（每条50字内），然后给一句市场情绪判断。新闻：\n${newsList}`
    };
    
    try {
      const result = await callDeepSeek([
        { role: 'user', content: prompts[lang] || prompts.en }
      ], { maxTokens: 300, temperature: 0.5 });
      
      const summary = {
        date: new Date().toDateString(),
        summary: result.success ? result.content : data.marketStats.marketMood,
        highlights: [],
        marketMood: data.marketStats.marketMood
      };
      
      featureCache.set(cacheKey, summary, 3600);
      return summary;
    } catch (error) {
      console.error('AI summary error:', error);
    }
  }
  
  // 返回默认数据
  return {
    date: new Date().toDateString(),
    summary: lang === 'zh' ? '今日市场波动较大，关注即将到来的代币解锁事件。' : 'Market volatility remains high today. Watch for upcoming token unlocks.',
    highlights: [],
    marketMood: data.marketStats.marketMood
  };
}

/**
 * 市场统计数据
 */
async function getMarketStats(lang = 'en') {
  const cacheKey = `market_stats_${lang}`;
  const cached = featureCache.get(cacheKey);
  if (cached) return cached;
  
  const data = DATA[lang]?.marketStats || DATA.en.marketStats;
  featureCache.set(cacheKey, data, 1800);
  return data;
}

/**
 * 仪表盘数据
 */
async function getDashboardData(news = [], lang = 'en') {
  const [unlocks, events, narratives, summary, stats] = await Promise.all([
    getUpcomingUnlocks(30, lang),
    getImportantEvents(lang),
    getTrendingNarratives(lang),
    getDailySummary(news, lang),
    getMarketStats(lang)
  ]);
  
  return {
    unlocks: unlocks.slice(0, 5),
    events: events.slice(0, 3),
    narratives: narratives,
    summary: summary,
    marketStats: stats
  };
}

module.exports = {
  getUpcomingUnlocks,
  getImportantEvents,
  getTrendingNarratives,
  getDailySummary,
  getMarketStats,
  getDashboardData
};
