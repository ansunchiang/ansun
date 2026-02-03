/**
 * 新闻服务 - 带缓存
 * 定时预加载，用户直接读缓存，速度更快
 */

const axios = require('axios');
const Parser = require('rss-parser');
const NodeCache = require('node-cache');
const { translateNews } = require('./ai');

const parser = new Parser();

// 缓存5分钟
const newsCache = new NodeCache({ stdTTL: 300 });

// 新闻源配置
const RSS_SOURCES = {
  en: [
    { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', lang: 'en' },
    { name: 'CoinTelegraph', url: 'https://cointelegraph.com/rss', lang: 'en' },
    { name: 'BitcoinMagazine', url: 'https://bitcoinmagazine.com/.rss', lang: 'en' },
    { name: 'CryptoSlate', url: 'https://cryptoslate.com/feed/', lang: 'en' },
    { name: 'Decrypt', url: 'https://decrypt.co/feed', lang: 'en' }
  ],
  // 备用：使用英文源（国内RSS访问受限）
  zh: [
    { name: 'CoinDesk中文', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', lang: 'en' },
    { name: 'CoinTelegraph中文', url: 'https://cointelegraph.com/rss', lang: 'en' },
    { name: 'CryptoSlate中文', url: 'https://cryptoslate.com/feed/', lang: 'en' },
    { name: 'Decrypt中文', url: 'https://decrypt.co/feed', lang: 'en' },
    { name: 'News.Bitcoin.com', url: 'https://news.bitcoin.com/feed/', lang: 'en' }
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
    lang: 'en'
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
 * 获取中文新闻（备用：使用英文源）
 */
async function getZHNews() {
  const cacheKey = 'news_zh';
  const cached = newsCache.get(cacheKey);
  if (cached) {
    console.log(`[缓存命中] 中文新闻 (${cached.length}条)`);
    return cached;
  }
  
  console.log(`[抓取中] 中文新闻(备用源)...`);
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
 * 获取新闻（默认英文，自动翻译）
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
  
  // 翻译成目标语言
  news = await translateNews(news, lang);
  
  // 限制数量
  return news.slice(0, limit);
}

/**
 * 按用户语言获取新闻
 */
async function getNewsByUserLang(userLang) {
  // 中文用户：100%英文新闻（RSS访问受限）
  return await getENNews();
}

/**
 * 搜索新闻
 */
async function searchNews(keyword, limit = 20, lang = 'all') {
  const enNews = await getENNews();
  
  const keywordLower = keyword.toLowerCase();
  const filtered = enNews.filter(item => 
    item.title.toLowerCase().includes(keywordLower) ||
    item.content.toLowerCase().includes(keywordLower)
  );
  
  // 翻译
  const translated = await translateNews(filtered.slice(0, limit), lang);
  
  return translated;
}

/**
 * 获取热门新闻
 */
async function getHotNews(limit = 10, lang = 'all') {
  const news = await getENNews();
  const hotNews = news.slice(0, limit);
  
  // 翻译
  const translated = await translateNews(hotNews, lang);
  
  return translated;
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
 * 定时预加载
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
    en: { cached: !!enStatus, count: enStatus?.length || 0 },
    zh: { cached: !!zhStatus, count: zhStatus?.length || 0 }
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
