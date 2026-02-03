/**
 * AI服务 - 带知识库缓存
 * 已回答的问题直接从库调取，节省AI token
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// 知识库存储路径
const KNOWLEDGE_BASE_PATH = path.join(__dirname, '../data/knowledge-base.json');

// 确保数据目录存在
const dataDir = path.dirname(KNOWLEDGE_BASE_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 初始化知识库
let knowledgeBase = loadKnowledgeBase();

function loadKnowledgeBase() {
  try {
    if (fs.existsSync(KNOWLEDGE_BASE_PATH)) {
      const data = fs.readFileSync(KNOWLEDGE_BASE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('加载知识库失败:', error);
  }
  return { questions: [] };
}

function saveKnowledgeBase() {
  try {
    fs.writeFileSync(KNOWLEDGE_BASE_PATH, JSON.stringify(knowledgeBase, null, 2));
  } catch (error) {
    console.error('保存知识库失败:', error);
  }
}

/**
 * 清理问题文本（用于匹配）
 */
function normalizeQuestion(question) {
  return question.toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5]/g, '')  // 保留中文、英文、数字、空格
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 在知识库中查找相似问题
 */
function findSimilarQuestion(question, threshold = 0.85) {
  const normalized = normalizeQuestion(question);
  
  // 完全匹配优先
  const exactMatch = knowledgeBase.questions.find(q => 
    normalizeQuestion(q.question) === normalized
  );
  if (exactMatch) {
    return { match: exactMatch, score: 1 };
  }
  
  // 关键词匹配
  const keywords = normalized.split(' ').filter(w => w.length > 2);
  
  let bestMatch = null;
  let bestScore = 0;
  
  for (const item of knowledgeBase.questions) {
    const itemNorm = normalizeQuestion(item.question);
    let score = 0;
    
    // 计算共同关键词数量
    const itemKeywords = itemNorm.split(' ').filter(w => w.length > 2);
    for (const kw of keywords) {
      if (itemNorm.includes(kw)) score += 1;
    }
    
    // 关键词重叠率
    const overlapRate = score / Math.max(keywords.length, itemKeywords.length);
    
    if (overlapRate >= threshold && score > bestScore) {
      bestMatch = item;
      bestScore = score;
    }
  }
  
  return bestMatch ? { match: bestMatch, score: bestScore } : null;
}

/**
 * 调用DeepSeek API
 */
async function callDeepSeek(messages, options = {}) {
  try {
    const response = await axios.post(DEEPSEEK_API_URL, {
      model: 'deepseek-chat',
      messages: messages,
      max_tokens: options.maxTokens || 600,
      temperature: options.temperature || 0.3
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      content: response.data.choices[0].message.content,
      usage: response.data.usage
    };
    
  } catch (error) {
    console.error('DeepSeek API错误:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

/**
 * 检查问题是否与币圈相关
 */
function isCryptoRelated(question) {
  const cryptoKeywords = [
    '比特币', 'bitcoin', 'btc', '以太坊', 'ethereum', 'eth', '区块链', 'blockchain',
    '加密货币', 'cryptocurrency', '虚拟货币', '数字货币', 'token', '代币', '通证',
    '钱包', 'wallet', '私钥', 'public key', '公钥', '助记词', 'seed phrase',
    '交易', 'transaction', '转账', '挖矿', 'mining', '共识', 'consensus',
    '智能合约', 'smart contract', 'defi', 'nft', 'dao', 'layer2',
    '交易所', 'exchange', 'binance', 'okx', 'solana', 'dot', 'avax',
    '白皮书', 'whitepaper', '代币经济学', '历史', '分叉', '升级',
    '区块', 'block', '哈希', 'hash', '加密', '挖矿', '验证'
  ];
  
  return cryptoKeywords.some(kw => question.toLowerCase().includes(kw.toLowerCase()));
}

/**
 * 检查是否是投资相关问题
 */
function isInvestmentRelated(question) {
  const investmentKeywords = [
    '买', '卖', '投资', '买入', '卖出', '仓位', '止损', '止盈',
    '预测', '会涨吗', '会跌吗', '目标价', '收益', '回报',
    '梭哈', 'all in', '抄底', '逃顶', '入场', '出金', '入金',
    '合约', '杠杆', '做多', '做空', '山寨币', 'meme'
  ];
  
  return investmentKeywords.some(kw => question.toLowerCase().includes(kw.toLowerCase()));
}

/**
 * 获取拒绝回答
 */
function getRefusalResponse(lang) {
  const responses = {
    zh: `抱歉，我只能提供币圈相关的**知识和信息**，不提供任何**投资建议**。

我无法回答：
- 买哪个币/卖哪个币
- 价格预测
- 仓位管理
- 入场时机

我能回答：
- 币圈基础知识
- 项目是什么/做什么
- 技术原理
- 历史背景`,
    
    en: `Sorry, I can only provide **crypto knowledge**, not investment advice.

I cannot answer:
- Which coin to buy/sell
- Price predictions
- Position management

I can answer:
- Crypto basics
- What projects do
- Technical principles`
  };
  
  return responses[lang] || responses.en;
}

/**
 * 智能问答（带知识库）
 */
async function askQuestion(question, lang = 'en') {
  // 1. 非币圈问题
  if (!isCryptoRelated(question)) {
    return {
      success: true,
      answer: responses[lang] || responses.en,
      fromCache: false,
      cached: false
    };
  }
  
  // 2. 投资相关问题
  if (isInvestmentRelated(question)) {
    return {
      success: true,
      answer: getRefusalResponse(lang),
      fromCache: false,
      cached: false
    };
  }
  
  // 3. 检查知识库
  const cached = findSimilarQuestion(question);
  if (cached && cached.match) {
    // 更新访问次数和时间
    cached.match.accessCount = (cached.match.accessCount || 0) + 1;
    cached.match.lastAccessed = new Date().toISOString();
    saveKnowledgeBase();
    
    return {
      success: true,
      answer: cached.match.answer,
      fromCache: true,
      question: cached.match.question,
      cached: true
    };
  }
  
  // 4. 调用AI
  const systemPrompts = {
    zh: `你是一个币圈知识助手。只回答知识性问题，不给投资建议。

允许回答：概念解释、项目介绍、技术原理、历史背景、安全知识
禁止回答：买卖推荐、价格预测、仓位管理、入场时机`,
    
    en: `You are a crypto knowledge assistant. Answer knowledge questions only, no investment advice.

Allowed: Concepts, project introductions, technical principles, history, security
Prohibited: Buy/sell recommendations, price predictions, position management`
  };
  
  const messages = [
    { role: 'system', content: systemPrompts[lang] || systemPrompts.en },
    { role: 'user', content: question }
  ];
  
  const result = await callDeepSeek(messages, { maxTokens: 600, temperature: 0.3 });
  
  if (result.success) {
    // 5. 保存到知识库
    const newEntry = {
      id: Date.now().toString(36),
      question: question,
      answer: result.content,
      lang: lang,
      createdAt: new Date().toISOString(),
      accessCount: 0,
      lastAccessed: null
    };
    
    knowledgeBase.questions.push(newEntry);
    saveKnowledgeBase();
    
    return {
      success: true,
      answer: result.content,
      fromCache: false,
      cached: false,
      tokenUsed: result.usage?.total_tokens || 0
    };
  }
  
  return {
    success: false,
    error: result.error
  };
}

/**
 * 获取知识库统计
 */
function getKnowledgeBaseStats() {
  return {
    totalQuestions: knowledgeBase.questions.length,
    byLang: {
      zh: knowledgeBase.questions.filter(q => q.lang === 'zh').length,
      en: knowledgeBase.questions.filter(q => q.lang === 'en').length
    },
    topAccessed: knowledgeBase.questions
      .sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0))
      .slice(0, 5)
      .map(q => ({
        question: q.question.slice(0, 50),
        count: q.accessCount
      }))
  };
}

/**
 * 清空知识库
 */
function clearKnowledgeBase() {
  knowledgeBase = { questions: [] };
  saveKnowledgeBase();
  return { success: true };
}

// 拒绝回答的通用回复
const responses = {
  zh: '抱歉，我只能回答币圈相关的问题。其他领域的问题我无法回答。',
  en: 'Sorry, I can only answer questions related to cryptocurrency and blockchain.'
};

module.exports = {
  callDeepSeek,
  askQuestion,
  getKnowledgeBaseStats,
  clearKnowledgeBase,
  knowledgeBase: knowledgeBase
};
