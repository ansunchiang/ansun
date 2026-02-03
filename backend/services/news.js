/**
 * 新闻聚合服务
 * 整合RSS的新闻（支持中英文）
 */

const { fetchAllNews, getSources } = require('./rss');

// 内存缓存（按语言分开缓存）
let cachedNews = {
  en: null,
  zh: null,
  all: null
};
let cacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

/**
 * 获取新闻（带缓存）
 * @param {object} options - 选项
 * @param {string} options.lang - 语言 'en' | 'zh' | 'all'
 * @param {number} options.limit - 限制数量
 * @param {string} options.source - 来源筛选
 * @param {string} options.category - 分类筛选
 */
async function getNews(options = {}) {
  const { lang = 'all', limit = 20, source, category } = options;
  
  // 检查缓存
  const now = Date.now();
  if (cachedNews[lang] && cacheTime && (now - cacheTime) < CACHE_DURATION) {
    console.log(`📦 使用缓存新闻 (${lang})`);
    let news = cachedNews[lang];
    
    // 筛选
    if (source) {
      news = news.filter(n => n.source === source);
    }
    if (category) {
      news = news.filter(n => n.category === category);
    }
    
    return news.slice(0, limit);
  }
  
  // 获取新新闻
  console.log(`🔄 抓取最新新闻 (${lang})...`);
  cachedNews[lang] = await fetchAllNews(lang);
  cacheTime = now;
  
  let news = cachedNews[lang];
  
  // 筛选
  if (source) {
    news = news.filter(n => n.source === source);
  }
  if (category) {
    news = news.filter(n => n.category === category);
  }
  
  return news.slice(0, limit);
}

/**
 * 根据用户语言偏好获取新闻
 * @param {string} userLang - 用户语言偏好
 */
async function getNewsByUserLang(userLang = 'en') {
  // 如果用户是中文，优先返回中文新闻
  if (userLang === 'zh') {
    // 中文用户：80%中文 + 20%英文
    const zhNews = await getNews({ lang: 'zh', limit: 20 });
    const enNews = await getNews({ lang: 'en', limit: 10 });
    return [...zhNews, ...enNews];
  } else {
    // 英文用户：80%英文 + 20%中文
    const enNews = await getNews({ lang: 'en', limit: 20 });
    const zhNews = await getNews({ lang: 'zh', limit: 10 });
    return [...enNews, ...zhNews];
  }
}

/**
 * 获取热门新闻（按时间排序取前10）
 */
async function getHotNews(limit = 10, lang = 'all') {
  const news = await getNews({ lang, limit: 50 });
  return news.slice(0, limit);
}

/**
 * 搜索新闻
 */
async function searchNews(keyword, limit = 20, lang = 'all') {
  const news = await getNews({ lang, limit: 100 });
  
  const results = news.filter(item => {
    const text = `${item.title} ${item.content}`.toLowerCase();
    return text.includes(keyword.toLowerCase());
  });
  
  return results.slice(0, limit);
}

/**
 * 获取新闻来源列表
 */
function getNewsSources() {
  return getSources();
}

/**
 * 清除缓存
 */
function clearCache() {
  cachedNews = { en: null, zh: null, all: null };
  cacheTime = null;
  console.log('🗑️ 新闻缓存已清除');
}

module.exports = {
  getNews,
  getNewsByUserLang,
  getHotNews,
  searchNews,
  getNewsSources,
  clearCache
};
