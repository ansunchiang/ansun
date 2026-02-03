/**
 * RSS解析服务
 * 抓取币圈新闻源的RSS
 */

const Parser = require('rss-parser');
const axios = require('axios');

const parser = new Parser();

// 币圈RSS源列表
const RSS_SOURCES = [
  {
    name: 'CoinDesk',
    url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
    category: '新闻'
  },
  {
    name: 'CoinTelegraph',
    url: 'https://cointelegraph.com/rss',
    category: '新闻'
  },
  {
    name: 'Bitcoin Magazine',
    url: 'https://bitcoinmagazine.com/.rss',
    category: 'BTC'
  },
  {
    name: 'CryptoSlate',
    url: 'https://cryptoslate.com/feed/',
    category: '综合'
  }
];

/**
 * 获取所有RSS源的新闻
 */
async function fetchAllNews() {
  const allNews = [];
  
  for (const source of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url);
      
      const news = feed.items.slice(0, 10).map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        content: item.contentSnippet || item.content || '',
        source: source.name,
        category: source.category,
        timestamp: new Date(item.pubDate).getTime()
      }));
      
      allNews.push(...news);
      
      console.log(`✅ 获取 ${source.name}: ${news.length} 条`);
      
    } catch (error) {
      console.log(`❌ ${source.name}: ${error.message}`);
    }
  }
  
  // 按时间排序
  allNews.sort((a, b) => b.timestamp - a.timestamp);
  
  return allNews;
}

/**
 * 获取支持的RSS源列表
 */
function getSources() {
  return RSS_SOURCES.map(s => ({
    name: s.name,
    url: s.url,
    category: s.category
  }));
}

module.exports = {
  fetchAllNews,
  getSources,
  RSS_SOURCES
};
