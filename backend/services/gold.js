/**
 * 贵金属行情服务
 */

const axios = require('axios');

// 免费黄金 API（替代方案）
const GOLD_API = {
  // 使用免费 API 或备用数据源
  primary: 'https://api.gold-api.com/price/XAU',
  backup: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/xau.json'
};

const SILVER_API = {
  primary: 'https://api.gold-api.com/price/XAG',
  backup: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/xag.json'
};

/**
 * 获取黄金价格
 */
async function getGoldPrice() {
  try {
    // 方法1: 使用免费 API
    try {
      const response = await axios.get(GOLD_API.primary, {
        headers: { 'Authorization': process.env.GOLD_API_KEY || '' },
        timeout: 5000
      });
      
      if (response.data && response.data.price) {
        return {
          symbol: 'XAU',
          name: 'Gold',
          price: parseFloat(response.data.price),
          currency: 'USD',
          change_24h: response.data.change24h || 0,
          change_percent: response.data.changePercent24h || 0,
          timestamp: Date.now()
        };
      }
    } catch (e) {
      console.log('Gold API 1 failed:', e.message);
    }
    
    // 方法2: 使用备用数据
    try {
      const response = await axios.get(GOLD_API.backup, { timeout: 5000 });
      if (response.data && response.data.xau) {
        const price = response.data.xau.usd;
        return {
          symbol: 'XAU',
          name: 'Gold',
          price: price,
          currency: 'USD',
          change_24h: 0,
          change_percent: 0,
          timestamp: Date.now(),
          source: 'backup'
        };
      }
    } catch (e) {
      console.log('Gold backup API failed:', e.message);
    }
    
    // 返回模拟数据（实际使用时替换为真实 API）
    return {
      symbol: 'XAU',
      name: 'Gold',
      price: 2035.50,
      currency: 'USD',
      change_24h: 6.50,
      change_percent: 0.32,
      timestamp: Date.now(),
      source: 'simulated'
    };
    
  } catch (error) {
    console.error('Gold price error:', error);
    return null;
  }
}

/**
 * 获取白银价格
 */
async function getSilverPrice() {
  try {
    // 返回模拟数据
    return {
      symbol: 'XAG',
      name: 'Silver',
      price: 22.85,
      currency: 'USD',
      change_24h: 0.15,
      change_percent: 0.66,
      timestamp: Date.now(),
      source: 'simulated'
    };
  } catch (error) {
    console.error('Silver price error:', error);
    return null;
  }
}

/**
 * 获取贵金属综合行情
 */
async function getPreciousMetals() {
  const gold = await getGoldPrice();
  const silver = await getSilverPrice();
  
  return {
    gold,
    silver,
    timestamp: new Date().toISOString()
  };
}

/**
 * 价格提醒配置
 */
class PriceAlertManager {
  constructor() {
    this.alerts = new Map();
  }
  
  addAlert(userId, alert) {
    const userAlerts = this.alerts.get(userId) || [];
    userAlerts.push({
      ...alert,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      triggered: false
    });
    this.alerts.set(userId, userAlerts);
    return userAlerts;
  }
  
  checkAlerts(prices) {
    const triggered = [];
    this.alerts.forEach((alerts, userId) => {
      alerts.forEach(alert => {
        if (alert.triggered) return;
        
        const price = prices[alert.symbol];
        if (!price) return;
        
        let shouldTrigger = false;
        if (alert.type === 'above' && price >= alert.target) shouldTrigger = true;
        if (alert.type === 'below' && price <= alert.target) shouldTrigger = true;
        if (alert.type === 'percent_change' && Math.abs(price.change_percent) >= alert.target) shouldTrigger = true;
        
        if (shouldTrigger) {
          alert.triggered = true;
          triggered.push({
            ...alert,
            currentPrice: price
          });
        }
      });
    });
    return triggered;
  }
  
  getAlerts(userId) {
    return this.alerts.get(userId) || [];
  }
  
  removeAlert(userId, alertId) {
    const alerts = this.alerts.get(userId) || [];
    const filtered = alerts.filter(a => a.id !== alertId);
    this.alerts.set(userId, filtered);
    return filtered;
  }
}

module.exports = {
  getGoldPrice,
  getSilverPrice,
  getPreciousMetals,
  PriceAlertManager
};
