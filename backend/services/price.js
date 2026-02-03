/**
 * 行情服务 - CoinGecko API
 * 实时币价、涨跌幅排行
 */

const axios = require('axios');
const NodeCache = require('node-cache');

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// 缓存1分钟
const priceCache = new NodeCache({ stdTTL: 60 });

/**
 * 获取Top 100加密货币行情
 */
async function getTopCoins(limit = 50, currency = 'usd') {
  const cacheKey = `top_${limit}_${currency}`;
  const cached = priceCache.get(cacheKey);
  if (cached) {
    console.log(`[缓存命中] 行情数据 (${cached.length}条)`);
    return cached;
  }
  
  console.log(`[抓取中] CoinGecko行情...`);
  
  try {
    const response = await axios.get(`${COINGECKO_API}/coins/markets`, {
      params: {
        vs_currency: currency,
        order: 'market_cap_desc',
        per_page: limit,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h,7d'
      },
      timeout: 15000
    });
    
    const coins = response.data.map(coin => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.image,
      current_price: coin.current_price,
      market_cap: coin.market_cap,
      market_cap_rank: coin.market_cap_rank,
      price_change_24h: coin.price_change_24h,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      price_change_percentage_7d: coin.price_change_percentage_7d,
      total_volume: coin.total_volume,
      circulating_supply: coin.circulating_supply,
      high_24h: coin.high_24h,
      low_24h: coin.low_24h,
      last_updated: coin.last_updated
    }));
    
    priceCache.set(cacheKey, coins);
    console.log(`[缓存写入] CoinGecko行情 (${coins.length}条)`);
    
    return coins;
    
  } catch (error) {
    console.error(`[行情获取失败] ${error.message}`);
    return [];
  }
}

/**
 * 获取单个币种详情
 */
async function getCoinDetail(coinId, currency = 'usd') {
  const cacheKey = `detail_${coinId}_${currency}`;
  const cached = priceCache.get(cacheKey);
  if (cached) return cached;
  
  try {
    const response = await axios.get(`${COINGECKO_API}/coins/${coinId}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false
      },
      timeout: 15000
    });
    
    const coin = response.data;
    const data = {
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.image.large,
      description: coin.description.en ? coin.description.en.slice(0, 500) : '',
      market_cap_rank: coin.market_cap_rank,
      market_data: {
        current_price: coin.market_data.current_price[currency] || 0,
        market_cap: coin.market_data.market_cap[currency] || 0,
        price_change_24h: coin.market_data.price_change_24h || 0,
        price_change_percentage_24h: coin.market_data.price_change_percentage_24h || 0,
        price_change_percentage_7d: coin.market_data.price_change_percentage_7d || 0,
        high_24h: coin.market_data.high_24h[currency] || 0,
        low_24h: coin.market_data.low_24h[currency] || 0,
        total_volume: coin.market_data.total_volume[currency] || 0,
        circulating_supply: coin.market_data.circulating_supply || 0,
        total_supply: coin.market_data.total_supply || 0,
        ath: coin.market_data.ath[currency] || 0,
        ath_change_percentage: coin.market_data.ath_change_percentage[currency] || 0,
        atl: coin.market_data.atl[currency] || 0,
        atl_change_percentage: coin.market_data.atl_change_percentage[currency] || 0
      },
      last_updated: coin.last_updated
    };
    
    priceCache.set(cacheKey, data, 60);
    return data;
    
  } catch (error) {
    console.error(`[币种详情获取失败] ${coinId}: ${error.message}`);
    return null;
  }
}

/**
 * 搜索币种
 */
async function searchCoins(query) {
  try {
    const response = await axios.get(`${COINGECKO_API}/search`, {
      params: { query },
      timeout: 10000
    });
    
    return response.data.coins.slice(0, 10).map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      market_cap_rank: coin.market_cap_rank,
      thumb: coin.thumb
    }));
    
  } catch (error) {
    console.error(`[搜索失败] ${error.message}`);
    return [];
  }
}

/**
 * 获取Trending
 */
async function getTrending() {
  const cacheKey = 'trending';
  const cached = priceCache.get(cacheKey);
  if (cached) return cached;
  
  try {
    const response = await axios.get(`${COINGECKO_API}/search/trending`, {
      timeout: 15000
    });
    
    const trending = response.data.coins.slice(0, 10).map(item => ({
      item: {
        id: item.item.id,
        name: item.item.name,
        symbol: item.item.symbol,
        market_cap_rank: item.item.market_cap_rank,
        thumb: item.item.thumb,
        score: item.item.score
      }
    }));
    
    priceCache.set(cacheKey, trending, 300); // 5分钟缓存
    return trending;
    
  } catch (error) {
    console.error(`[Trending获取失败] ${error.message}`);
    return [];
  }
}

/**
 * 格式化价格
 */
function formatPrice(price, currency = 'USD') {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(2)}M`;
  } else if (price >= 1000) {
    return `$${(price / 1000).toFixed(2)}K`;
  } else if (price >= 1) {
    return `$${price.toFixed(2)}`;
  } else if (price >= 0.01) {
    return `$${price.toFixed(4)}`;
  } else {
    return `$${price.toFixed(6)}`;
  }
}

/**
 * 格式化市值
 */
function formatMarketCap(cap) {
  if (cap >= 1e12) {
    return `$${(cap / 1e12).toFixed(2)}T`;
  } else if (cap >= 1e9) {
    return `$${(cap / 1e9).toFixed(2)}B`;
  } else if (cap >= 1e6) {
    return `$${(cap / 1e6).toFixed(2)}M`;
  } else {
    return `$${cap.toLocaleString()}`;
  }
}

/**
 * 获取缓存状态
 */
function getCacheStatus() {
  const keys = priceCache.keys();
  return {
    cachedItems: keys.length,
    keys: keys.slice(0, 10) // 只返回前10个key
  };
}

module.exports = {
  getTopCoins,
  getCoinDetail,
  searchCoins,
  getTrending,
  formatPrice,
  formatMarketCap,
  getCacheStatus
};
