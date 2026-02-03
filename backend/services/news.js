/**
 * 新闻聚合服务
 * 整合RSS的新闻
 */

const { fetchAllNews, getSources } = require('./rss');

// 内存缓存
let cachedNews = null;
let cacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

/**
 * 获取新闻（带缓存）
 */
async function getNews(options = {}) {
  const { limit = 20, source, category } = options;
  
  // 检查缓存
  const now = Date.now();
  if (cachedNews && cacheTime && (now - cacheTime) < CACHE_DURATION) {
    console.log('📦 使用缓存新闻');
    let news = cachedNews;
    
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
  console.log('🔄 抓取最新新闻...');
  cachedNews = await fetchAllNews();
  cacheTime = now;
  
  let news = cachedNews;
  
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
 * 获取热门新闻（按时间排序取前10）
 */
async function getHotNews(limit = 10) {
  const news = await getNews({ limit: 50 });
  return news.slice(0, limit);
}

/**
 * 搜索新闻
 */
async function searchNews(keyword, limit = 20) {
  const news = await getNews({ limit: 100 });
  
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
  cachedNews = null;
  cacheTime = null;
  console.log('🗑️ 新闻缓存已清除');
}

module.exports = {
  getNews,
  getHotNews,
  searchNews,
  getNewsSources,
  clearCache
};
