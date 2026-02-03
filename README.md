# Ansun - 币圈资讯AI聚合平台

只做资讯，不给投资建议

## 功能

- 📰 RSS新闻聚合（CoinDesk, CoinTelegraph, Bitcoin Magazine等）
- 🤖 AI智能问答（DeepSeek）
- 🔍 新闻搜索
- 📱 响应式Web界面

## 技术栈

- 后端：Node.js + Express
- 前端：原生HTML/CSS/JS
- AI：DeepSeek API
- RSS：rss-parser
- 部署：Nginx

## 快速开始

```bash
# 安装依赖
cd backend
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env填入API Key

# 启动服务
npm start
```

## 环境变量

```env
DEEPSEEK_API_KEY=your_api_key
DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions
PORT=3000
```

## API

- `GET /api/news` - 获取新闻列表
- `GET /api/news/hot` - 获取热门新闻
- `GET /api/news/search?keyword=xxx` - 搜索新闻
- `POST /api/ai/ask` - AI问答

## 部署

1. 安装Node.js 20+
2. 配置Nginx反向代理
3. 使用PM2或systemd管理进程

## License

MIT
