/**
 * RSS解析服务
 * 抓取币圈新闻源的RSS
 */

const Parser = require('rss-parser');
const axios = require('axios');

const parser = new Parser();

// 英文RSS源
const RSS_SOURCES_EN = [
  {
    name: 'CoinDesk',
    url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
    category: 'News'
  },
  {
    name: 'CoinTelegraph',
    url: 'https://cointelegraph.com/rss',
    category: 'News'
  },
  {
    name: 'Bitcoin Magazine',
    url: 'https://bitcoinmagazine.com/.rss',
    category: 'BTC'
  },
  {
    name: 'CryptoSlate',
    url: 'https://cryptoslate.com/feed/',
    category: 'General'
  }
];

// 中文RSS源
const RSS_SOURCES_ZH = [
  {
    name: '金色财经',
    url: 'https://www.jinse.cn/all/rss.xml',
    category: '新闻'
  },
  {
    name: '巴比特',
    url: 'https://www.8btc.com/feed',
    category: '新闻'
  },
  {
    name: '链节点',
    url: 'https://www.chainnode.com/feed',
    category: '新闻'
  },
  {
    name: 'Odaily星球日报',
    url: 'https://www.odaily.news/rss',
    category: '新闻'
  }
];

// 合并所有源
const RSS_SOURCES = [
  ...RSS_SOURCES_EN,
  ...RSS_SOURCES_ZH
];

/**
 * 获取所有RSS源的新闻
 * @param {string} lang - 语言代码 'en' | 'zh' | 'all'
 */
async function fetchAllNews(lang = 'all') {
  let sources;
  if (lang === 'zh') {
    sources = RSS_SOURCES_ZH;
  } else if (lang === 'en') {
    sources = RSS_SOURCES_EN;
  } else {
    sources = RSS_SOURCES;
  }
  
  const allNews = [];
  
  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.url);
      
      const news = feed.items.slice(0, 10).map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        content: item.contentSnippet || item.content || '',
        source: source.name,
        category: source.category,
        lang: lang === 'zh' ? 'zh' : 'en',
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

/**
 * 按语言获取源列表
 */
function getSourcesByLang(lang) {
  if (lang === 'zh') {
    return RSS_SOURCES_ZH;
  } else if (lang === 'en') {
    return RSS_SOURCES_EN;
  }
  return RSS_SOURCES;
}

module.exports = {
  fetchAllNews,
  getSources,
  getSourcesByLang,
  RSS_SOURCES,
  RSS_SOURCES_EN,
  RSS_SOURCES_ZH
};
