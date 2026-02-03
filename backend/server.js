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

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// 路由
app.use('/api/news', newsRoutes);
app.use('/api/ai', aiRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 前端入口
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`
🚀 Ansun Server Started!
━━━━━━━━━━━━━━━━━━━━━━━
📍 访问地址: http://localhost:${PORT}
🌐 域名: http://ansun.space
📦 API: http://ansun.space/api
━━━━━━━━━━━━━━━━━━━━━━━
  `);
});
