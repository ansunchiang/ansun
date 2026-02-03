/**
 * 特色功能服务
 * 1. 代币解锁日历
 * 2. AI每日摘要
 * 3. 热门叙事追踪
 */

const axios = require('axios');
const NodeCache = require('node-cache');
const { callDeepSeek } = require('./ai');

// 缓存1小时
const featureCache = new NodeCache({ stdTTL: 3600 });

// 代币解锁数据（Token Unlock Schedule）
const UNLOCK_DATA = [
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ARB',
    image: 'https://assets.coingecko.com/coins/images/16547/large/Logo_-_Arbitrum.png',
    nextUnlock: '2026-02-15',
    amount: '1.1B ARB',
    value: '$880M',
    percentage: '8.5%',
    unlockType: 'Team',
    description: 'Team & Investors Unlock'
  },
  {
    id: 'optimism',
    name: 'Optimism',
    symbol: 'OP',
    image: 'https://assets.coingecko.com/coins/images/25244/large/Optimism.png',
    nextUnlock: '2026-02-20',
    amount: '386M OP',
    value: '$770M',
    percentage: '15.4%',
    unlockType: 'Ecosystem',
    description: 'Ecosystem Grants & Partners'
  },
  {
    id: ' Aptos',
    name: 'Aptos',
    symbol: 'APT',
    image: 'https://assets.coingecko.com/coins/images/26455/large/aptos_round.png',
    nextUnlock: '2026-02-12',
    amount: '45M APT',
    value: '$360M',
    percentage: '2.1%',
    unlockType: 'Staking',
    description: 'Staking Rewards'
  },
  {
    id: 'immutable',
    name: 'Immutable',
    symbol: 'IMX',
    image: 'https://assets.coingecko.com/coins/images/12367/large/immutableX_symbol_blue.png',
    nextUnlock: '2026-02-08',
    amount: '38M IMX',
    value: '$76M',
    percentage: '2.8%',
    unlockType: 'Ecosystem',
    description: 'Ecosystem Rewards'
  },
  {
    id: 'singularitynet',
    name: 'SingularityNET',
    symbol: 'AGIX',
    image: 'https://assets.coingecko.com/coins/images/1358/large/singularitynet.png',
    nextUnlock: '2026-02-28',
    amount: '84M AGIX',
    value: '$168M',
    percentage: '7.2%',
    unlockType: 'Team',
    description: 'Team & Advisors'
  },
  {
    id: 'fetch',
    name: 'Fetch.ai',
    symbol: 'FET',
    image: 'https://assets.coingecko.com/coins/images/5681/large/Fetch.png',
    nextUnlock: '2026-02-10',
    amount: '130M FET',
    value: '$520M',
    percentage: '12.5%',
    unlockType: 'Community',
    description: 'Community & Ecosystem'
  },
  {
    id: 'mina',
    name: 'Mina',
    symbol: 'MINA',
    image: 'https://assets.coingecko.com/coins/images/5964/large/Mina_Icon_Core_Unit_2.png',
    nextUnlock: '2026-02-22',
    amount: '18M MINA',
    value: '$14.4M',
    percentage: '1.5%',
    unlockType: 'Staking',
    description: 'Staking Rewards'
  },
  {
    id: 'chainlink',
    name: 'Chainlink',
    symbol: 'LINK',
    image: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
    nextUnlock: '2026-02-15',
    amount: '44M LINK',
    value: '$880M',
    percentage: '2.2%',
    unlockType: 'Ecosystem',
    description: 'Ecosystem Growth'
  }
];

/**
 * 获取即将解锁的代币
 */
async function getUpcomingUnlocks(days = 30) {
  const cacheKey = `unlocks_${days}`;
  const cached = featureCache.get(cacheKey);
  if (cached) return cached;
  
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  const unlocks = UNLOCK_DATA
    .filter(token => {
      const unlockDate = new Date(token.nextUnlock);
      return unlockDate >= now && unlockDate <= future;
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
 * 获取今日/本周重要事件
 */
async function getImportantEvents() {
  const cacheKey = 'important_events';
  const cached = featureCache.get(cacheKey);
  if (cached) return cached;
  
  const events = [
    {
      id: 1,
      date: '2026-02-04',
      title: 'US PCE Inflation Data',
      importance: 'high',
      description: '美国PCE物价指数发布，影响市场情绪',
      impact: 'high'
    },
    {
      id: 2,
      date: '2026-02-05',
      title: 'Fed Officials Speeches',
      importance: 'medium',
      description: '多位美联储官员讲话，可能透露政策信号',
      impact: 'medium'
    },
    {
      id: 3,
      date: '2026-02-06',
      title: 'ECB Meeting Minutes',
      importance: 'medium',
      description: '欧央行会议纪要发布',
      impact: 'medium'
    },
    {
      id: 4,
      date: '2026-02-07',
      title: 'US Jobs Report',
      importance: 'high',
      description: '美国非农就业数据',
      impact: 'high'
    }
  ];
  
  featureCache.set(cacheKey, events);
  return events;
}

/**
 * AI生成每日摘要
 */
async function getDailySummary(news = []) {
  const cacheKey = 'daily_summary';
  const cached = featureCache.get(cacheKey);
  if (cached && cached.date === new Date().toDateString()) {
    return cached;
  }
  
  if (news.length === 0) {
    return {
      date: new Date().toDateString(),
      summary: 'No significant news today.',
      highlights: [],
      marketMood: 'neutral'
    };
  }
  
  // 提取新闻标题
  const newsList = news.slice(0, 10).map(n => `- ${n.title} (${n.source})`).join('\n');
  
  const prompt = `请用中文总结以下币圈新闻，并给出：
1. 今日摘要（100字内）
2. 3个最重要新闻
3. 市场情绪判断（看涨/看跌/观望）

新闻列表：
${newsList}

请用中文回复，格式如下：
【今日摘要】
xxx

【重要新闻】
1. xxx
2. xxx
3. xxx

【市场情绪】
xxx`;

  const result = await callDeepSeek([
    { role: 'user', content: prompt }
  ], { maxTokens: 500, temperature: 0.5 });

  const summary = {
    date: new Date().toDateString(),
    summary: result.success ? result.content : '获取摘要失败',
    highlights: [],
    marketMood: 'neutral'
  };
  
  featureCache.set(cacheKey, summary, 3600); // 缓存1小时
  return summary;
}

/**
 * 热门叙事/概念
 */
async function getTrendingNarratives() {
  const cacheKey = 'trending_narratives';
  const cached = featureCache.get(cacheKey);
  if (cached) return cached;
  
  const narratives = [
    {
      id: 1,
      name: 'AI + Crypto',
      description: '人工智能与区块链结合的项目',
      keywords: ['FET, AGIX, OCRAI'],
      sentiment: 'hot',
      trend: 'up',
      icon: '🤖'
    },
    {
      id: 2,
      name: 'RWA (Real World Assets)',
      description: '真实世界资产代币化',
      keywords: ['ONDO, TRU, MNT'],
      sentiment: 'warm',
      trend: 'stable',
      icon: '🏠'
    },
    {
      id: 3,
      name: 'DeFi Summer',
      description: 'DeFi流动性协议复苏',
      keywords: ['UNI, AAVE, COMP'],
      sentiment: 'warm',
      trend: 'up',
      icon: '💧'
    },
    {
      id: 4,
      name: 'Layer2',
      description: '二层网络解决方案',
      keywords: ['ARB, OP, METIS'],
      sentiment: 'hot',
      trend: 'up',
      icon: '⚡'
    },
    {
      id: 5,
      name: 'Meme Coins',
      description: '社区驱动的Meme代币',
      keywords: ['DOGE, PEPE, WIF'],
      sentiment: 'mixed',
      trend: 'volatile',
      icon: '🐕'
    }
  ];
  
  featureCache.set(cacheKey, narratives, 1800); // 30分钟缓存
  return narratives;
}

/**
 * 快速数据获取（供前端使用）
 */
async function getDashboardData(news = []) {
  const [unlocks, events, narratives, summary] = await Promise.all([
    getUpcomingUnlocks(30),
    getImportantEvents(),
    getTrendingNarratives(),
    getDailySummary(news)
  ]);
  
  return {
    unlocks: unlocks.slice(0, 5),
    events: events.slice(0, 3),
    narratives: narratives,
    summary: summary
  };
}

module.exports = {
  getUpcomingUnlocks,
  getImportantEvents,
  getTrendingNarratives,
  getDailySummary,
  getDashboardData
};
