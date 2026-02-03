/**
 * Ansun - 币圈资讯AI聚合平台
 * 主服务器入口
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const newsRoutes = require('./routes/news');
const aiRoutes = require('./routes/ai');
const priceRoutes = require('./routes/price');
const featuresRoutes = require('./routes/features');
const { startCacheScheduler, getCacheStatus } = require('./services/news');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// 路由
app.use('/api/news', newsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/price', priceRoutes);
app.use('/api/features', featuresRoutes);

// 健康检查 + 缓存状态
app.get('/api/health', (req, res) => {
  const cacheStatus = getCacheStatus();
  res.json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    version: '1.0.0',
    cache: cacheStatus
  });
});

// 缓存状态API
app.get('/api/cache/status', (req, res) => {
  res.json({
    success: true,
    data: getCacheStatus()
  });
});

// 前端入口
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  // 启动缓存定时任务
  startCacheScheduler();
  
  console.log(`
🚀 Ansun Server Started!
━━━━━━━━━━━━━━━━━━━━━━━
📍 访问地址: http://localhost:${PORT}
🌐 域名: http://ansun.space
📦 API: http://ansun.space/api
💾 缓存: 已启用 (5分钟自动刷新)
━━━━━━━━━━━━━━━━━━━━━━━
  `);
});
