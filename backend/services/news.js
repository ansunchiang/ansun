/**
 * 新闻服务 - 带缓存
 * 定时预加载，用户直接读缓存，速度更快
 */

const axios = require('axios');
const Parser = require('rss-parser');
const iconv = require('iconv-lite');
const NodeCache = require('node-cache');

const parser = new Parser();

// 缓存5分钟
const newsCache = new NodeCache({ stdTTL: 300 });

// 新闻源配置
const RSS_SOURCES = {
  en: [
    { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', lang: 'en' },
    { name: 'CoinTelegraph', url: 'https://cointelegraph.com/rss', lang: 'en' },
    { name: 'BitcoinMagazine', url: 'https://bitcoinmagazine.com/.rss', lang: 'en' },
    { name: 'CryptoSlate', url: 'https://cryptoslate.com/feed/', lang: 'en' }
  ],
  zh: [
    { name: '金色财经', url: 'https://www.jinse.cn/feed', lang: 'zh' },
    { name: '巴比特', url: 'https://www.8btc.com/feed', lang: 'zh' },
    { name: '链节点', url: 'https://www.chainnode.com/feed', lang: 'zh' },
    { name: 'Odaily', url: 'https://www.odaily.news/feed', lang: 'zh' }
  ]
};

/**
 * 解析RSS
 */
async function fetchRSS(url) {
  try {
    const feed = await parser.parseURL(url);
    return feed.items || [];
  } catch (error) {
    console.error(`RSS获取失败: ${url}`, error.message);
    return [];
  }
}

/**
 * 格式化新闻
 */
function formatNews(items, source) {
  return items.map(item => ({
    id: item.guid || item.link,
    title: (item.title || '').trim(),
    link: item.link || item.url,
    content: (item.contentSnippet || item.content || item.description || '').slice(0, 500),
    timestamp: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
    source: source,
    lang: RSS_SOURCES.en.some(s => s.name === source) ? 'en' : 'zh'
  })).filter(item => item.title && item.link);
}

/**
 * 获取英文新闻
 */
async function getENNews() {
  const cacheKey = 'news_en';
  const cached = newsCache.get(cacheKey);
  if (cached) {
    console.log(`[缓存命中] 英文新闻 (${cached.length}条)`);
    return cached;
  }
  
  console.log(`[抓取中] 英文新闻...`);
  const allNews = [];
  
  for (const source of RSS_SOURCES.en) {
    try {
      const items = await fetchRSS(source.url);
      const formatted = formatNews(items, source.name);
      allNews.push(...formatted);
      console.log(`✅ 获取 ${source.name}: ${formatted.length} 条`);
    } catch (e) {
      console.error(`❌ ${source.name}: ${e.message}`);
    }
  }
  
  // 去重并排序
  const unique = [...new Map(allNews.map(i => [i.link, i])).values()];
  const sorted = unique.sort((a, b) => b.timestamp - a.timestamp);
  
  // 缓存
  newsCache.set(cacheKey, sorted);
  console.log(`[缓存写入] 英文新闻 (${sorted.length}条)`);
  
  return sorted;
}

/**
 * 获取中文新闻
 */
async function getZHNews() {
  const cacheKey = 'news_zh';
  const cached = newsCache.get(cacheKey);
  if (cached) {
    console.log(`[缓存命中] 中文新闻 (${cached.length}条)`);
    return cached;
  }
  
  console.log(`[抓取中] 中文新闻...`);
  const allNews = [];
  
  for (const source of RSS_SOURCES.zh) {
    try {
      const items = await fetchRSS(source.url);
      const formatted = formatNews(items, source.name);
      allNews.push(...formatted);
      console.log(`✅ 获取 ${source.name}: ${formatted.length} 条`);
    } catch (e) {
      console.error(`❌ ${source.name}: ${e.message}`);
    }
  }
  
  // 去重并排序
  const unique = [...new Map(allNews.map(i => [i.link, i])).values()];
  const sorted = unique.sort((a, b) => b.timestamp - a.timestamp);
  
  // 缓存
  newsCache.set(cacheKey, sorted);
  console.log(`[缓存写入] 中文新闻 (${sorted.length}条)`);
  
  return sorted;
}

/**
 * 获取新闻（默认英文）
 */
async function getNews({ lang = 'en', limit = 30, source, category }) {
  let news;
  
  if (lang === 'zh') {
    news = await getZHNews();
  } else {
    news = await getENNews();
  }
  
  // 过滤
  if (source) {
    news = news.filter(n => n.source === source);
  }
  
  // 限制数量
  return news.slice(0, limit);
}

/**
 * 按用户语言获取新闻（混合）
 */
async function getNewsByUserLang(userLang) {
  const isAsian = ['zh', 'ja', 'ko'].includes(userLang);
  const primaryLang = isAsian ? 'zh' : 'en';
  const secondaryLang = isAsian ? 'en' : 'zh';
  
  const primaryNews = primaryLang === 'zh' ? await getZHNews() : await getENNews();
  const secondaryNews = secondaryLang === 'zh' ? await getZHNews() : await getENNews();
  
  // 80%主要语言 + 20%次要语言
  const primaryLimit = 24;
  const secondaryLimit = 6;
  
  const combined = [
    ...primaryNews.slice(0, primaryLimit),
    ...secondaryNews.slice(0, secondaryLimit)
  ];
  
  return combined.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * 搜索新闻
 */
async function searchNews(keyword, limit = 20, lang = 'all') {
  const results = [];
  
  if (lang === 'all' || lang === 'en') {
    const enNews = await getENNews();
    results.push(...enNews);
  }
  
  if (lang === 'all' || lang === 'zh') {
    const zhNews = await getZHNews();
    results.push(...zhNews);
  }
  
  const keywordLower = keyword.toLowerCase();
  const filtered = results.filter(item => 
    item.title.toLowerCase().includes(keywordLower) ||
    item.content.toLowerCase().includes(keywordLower)
  );
  
  return filtered.slice(0, limit);
}

/**
 * 获取热门新闻（最新5条）
 */
async function getHotNews(limit = 10, lang = 'all') {
  const news = await getNews({ lang, limit: 50 });
  return news.slice(0, limit);
}

/**
 * 获取新闻来源列表
 */
function getNewsSources() {
  return {
    en: RSS_SOURCES.en.map(s => ({ name: s.name, lang: 'en' })),
    zh: RSS_SOURCES.zh.map(s => ({ name: s.name, lang: 'zh' }))
  };
}

/**
 * 定时预加载（每5分钟刷新一次）
 */
function startCacheScheduler() {
  console.log('📰 启动新闻缓存定时任务...');
  
  // 立即加载
  getENNews().catch(console.error);
  getZHNews().catch(console.error);
  
  // 每5分钟刷新
  setInterval(() => {
    console.log(`[定时任务] 刷新新闻缓存...`);
    getENNews().catch(e => console.error('EN刷新失败:', e.message));
    getZHNews().catch(e => console.error('ZH刷新失败:', e.message));
  }, 5 * 60 * 1000);
}

/**
 * 获取缓存状态
 */
function getCacheStatus() {
  const enStatus = newsCache.get('news_en');
  const zhStatus = newsCache.get('news_zh');
  
  return {
    en: {
      cached: !!enStatus,
      count: enStatus?.length || 0,
      ttl: newsCache.getTtl('news_en') ? Math.round((newsCache.getTtl('news_en') - Date.now()) / 1000) : 0
    },
    zh: {
      cached: !!zhStatus,
      count: zhStatus?.length || 0,
      ttl: newsCache.getTtl('news_zh') ? Math.round((newsCache.getTtl('news_zh') - Date.now()) / 1000) : 0
    }
  };
}

module.exports = {
  getNews,
  getNewsByUserLang,
  getHotNews,
  searchNews,
  getNewsSources,
  getENNews,
  getZHNews,
  startCacheScheduler,
  getCacheStatus
};
