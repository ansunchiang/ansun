/**
 * AI服务 - DeepSeek
 * 只回答币圈知识问题，不给任何投资建议
 */

const axios = require('axios');

const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

/**
 * 调用DeepSeek API
 */
async function callDeepSeek(messages, options = {}) {
  try {
    const response = await axios.post(DEEPSEEK_API_URL, {
      model: 'deepseek-chat',
      messages: messages,
      max_tokens: options.maxTokens || 800,
      temperature: options.temperature || 0.3  // 低温度，更保守
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
    // 基础概念
    '比特币', 'bitcoin', 'btc', '以太坊', 'ethereum', 'eth', '区块链', 'blockchain',
    '加密货币', 'cryptocurrency', '虚拟货币', '数字货币', 'token', '代币', '通证',
    '钱包', 'wallet', '私钥', 'public key', '公钥', '助记词', 'seed phrase',
    '交易', 'transaction', '转账', '确认', '确认数', 'confirmations',
    '挖矿', 'mining', '矿工', 'miner', '算力', 'hash rate',
    '共识', 'consensus', 'pow', 'pos', 'dpos',
    '智能合约', 'smart contract', 'defi', 'nft', 'dao', 'layer2',
    // 交易所
    '交易所', 'exchange', 'binance', 'okx', 'huobi', 'coinbase', 'kraken',
    // 技术
    '分叉', 'fork', '升级', 'upgrade', '提案', 'eip', 'bip',
    '侧链', 'sidechain', '跨链', 'bridge', '预言机', 'oracle',
    '扩容', 'scaling', '二层', 'layer2', 'rollup', 'zk',
    // 政策/新闻
    '监管', 'regulation', '政策', '合规', 'sec', 'cfdc', '香港', '新加坡',
    // 币种
    'solana', 'sol', 'polkadot', 'dot', 'avalanche', 'avax', 'cardano', 'ada',
    'ripple', 'xrp', 'dogecoin', 'doge', 'shiba', 'bnb', 'matic', 'chainlink', 'link',
    // 一般知识
    '白皮书', 'whitepaper', '代币经济学', 'tokenomics', '分配', '释放',
    '通胀', '通缩', ' deflation', '供应量', '流通量', '最大供应',
    '历史', '价格历史', '创世', 'genesis', '创世块',
    // 工具
    '区块浏览器', 'explorer', 'etherscan', 'btc.com', 'nanopool', 'f2pool',
    // 学习
    '学习', '教程', '入门', '初学者', 'beginner', ' tutorial', '如何学习'
  ];
  
  const questionLower = question.toLowerCase();
  
  for (const keyword of cryptoKeywords) {
    if (questionLower.includes(keyword.toLowerCase())) {
      return true;
    }
  }
  
  return false;
}

/**
 * 检查是否是投资/炒币相关问题
 */
function isInvestmentRelated(question) {
  const investmentKeywords = [
    // 投资建议
    '买', '买入', '买哪个', '该买', '应该买', '值得买', '能买吗',
    '卖', '卖出', '该卖', '应该卖', '卖哪个', '卖吗',
    '投资', '投资建议', '投资策略', '投资收益', '投资组合',
    '仓位', '仓位管理', '仓位控制', '全仓', '半仓', '加仓', '减仓',
    '止损', '止盈', '止损点', '止盈点', '止损价', '止盈价',
    '抄底', '逃顶', '底部', '顶部', '高点', '低点',
    '预测', '会涨吗', '会跌吗', '涨到', '跌到', '目标价',
    '收益', '收益率', '年化', '回报', '利润',
    '风险', '风险大吗', '风险高吗', '安全吗',
    '哪个好', '哪个值得', '推荐哪个', '哪个更有',
    '长期持有', '短线', '波段', '合约', '杠杆', '做多', '做空',
    '山寨币', 'meme', '土狗', '百倍币', '千倍币', '百倍',
    '梭哈', 'all in', '全仓', '满仓',
    '现在合适吗', '现在能进吗', '可以入场吗', '入场时机',
    '出金', '入金', '充值', '提现',
    '币种推荐', '推荐币种', '买什么币', '持有什么',
    '什么时候买', '什么时候卖', '买卖时机',
    '涨了', '跌了', '被套', '套牢', '亏损',
    '解套', '回本', '回血',
    '定投', '定期投资', ' dollar cost average',
    '资产配置', '分散投资', '多元化',
    '收益预期', '预期收益', '能赚多少', '能赚吗',
    '屯币', 'hODL', 'hodl', '长期持有'
  ];
  
  const questionLower = question.toLowerCase();
  
  for (const keyword of investmentKeywords) {
    if (questionLower.includes(keyword.toLowerCase())) {
      return true;
    }
  }
  
  return false;
}

/**
 * 生成拒绝回答
 */
function getRefusalResponse(lang) {
  const responses = {
    zh: `抱歉，我只能提供币圈相关的**知识和信息**，不提供任何**投资建议**或**炒币指导**。

我无法回答：
- 买哪个币/卖哪个币
- 什么时候买入/卖出
- 价格预测
- 仓位管理
- 投资策略

我能回答：
- 币圈基础知识
- 项目是什么/做什么
- 技术原理
- 历史背景
- 行业动态

如有币圈知识问题，欢迎继续提问！`,
    
    en: `Sorry, I can only provide **crypto knowledge and information**, not any **investment advice** or **trading guidance**.

I cannot answer:
- Which coin to buy/sell
- When to buy/sell
- Price predictions
- Position management
- Investment strategies

I can answer:
- Crypto basics
- What projects do
- Technical principles
- Historical background
- Industry news

Feel free to ask crypto knowledge questions!`,
    
    default: `Sorry, I can only answer crypto knowledge questions, not investment advice.`
  };
  
  return responses[lang] || responses.default;
}

/**
 * 智能问答
 */
async function askQuestion(question, lang = 'en') {
  // 先检查是否是币圈相关问题
  if (!isCryptoRelated(question)) {
    const responses = {
      zh: '抱歉，我只能回答币圈（加密货币、区块链）相关的问题。其他领域的问题我无法回答。',
      en: 'Sorry, I can only answer questions related to cryptocurrency and blockchain. I cannot answer questions on other topics.',
      default: 'Sorry, I can only answer crypto-related questions.'
    };
    
    return {
      success: true,
      answer: responses[lang] || responses.default,
      filtered: true,
      reason: 'not_crypto_related'
    };
  }
  
  // 再检查是否是投资相关问题
  if (isInvestmentRelated(question)) {
    return {
      success: true,
      answer: getRefusalResponse(lang),
      filtered: true,
      reason: 'investment_related'
    };
  }
  
  // 准备系统提示
  const systemPrompts = {
    zh: `你是一个币圈知识助手。你的**唯一职责**是回答币圈相关的**知识性问题**。

🚫 **绝对禁止：**
- 提供任何投资建议
- 推荐任何币种
- 预测价格走势
- 指导买卖时机
- 建议仓位管理
- 鼓励炒币

✅ **允许回答：**
- 解释币圈概念和术语
- 描述项目是做什么的
- 解释技术原理（区块链、共识机制等）
- 提供历史背景和发展脉络
- 客观描述行业新闻和动态
- 解释安全性相关问题（如何保护钱包、如何识别骗局等）

📝 **回答原则：**
1. 只提供客观事实和知识
2. 不带主观判断和推荐
3. 如涉及风险，客观提示
4. 回答简洁、专业
5. 如果用户问投资相关问题，明确拒绝并引导到知识话题`,
    
    en: `You are a crypto knowledge assistant. Your **only job** is to answer crypto-related **knowledge questions**.

🚫 **Absolutely prohibited:**
- Provide any investment advice
- Recommend any cryptocurrencies
- Predict price movements
- Guide buying/selling timing
- Suggest position management
- Encourage trading

✅ **Allowed to answer:**
- Explain crypto concepts and terminology
- Describe what projects do
- Explain technical principles (blockchain, consensus, etc.)
- Provide historical background
- Objectively describe industry news and developments
- Explain security-related topics (how to protect wallets, how to identify scams, etc.)

📝 **Response principles:**
1. Only provide objective facts and knowledge
2. No subjective judgment or recommendations
3. Objectively mention risks if applicable
4. Keep answers concise and professional
5. If asked about investment, clearly refuse and redirect to knowledge topics`
  };
  
  const messages = [
    {
      role: 'system',
      content: systemPrompts[lang] || systemPrompts.en
    },
    {
      role: 'user',
      content: question
    }
  ];
  
  const result = await callDeepSeek(messages, { maxTokens: 800, temperature: 0.3 });
  
  if (result.success) {
    return {
      success: true,
      answer: result.content,
      filtered: false
    };
  } else {
    return {
      success: false,
      error: result.error
    };
  }
}

/**
 * 生成新闻摘要
 */
async function summarizeNews(newsItems, lang = 'en') {
  const newsList = newsItems.slice(0, 5).map((item, i) => {
    return `${i + 1}. ${item.title} (${item.source})`;
  }).join('\n');
  
  const prompts = {
    zh: {
      system: '你是一个专业的币圈新闻分析师。请用简洁的中文总结以下新闻要点，每条不超过50字。',
      user: `请总结以下币圈新闻（5条最重要）:\n\n${newsList}`
    },
    en: {
      system: 'You are a professional crypto news analyst. Summarize the following news in concise English, each point no more than 50 words.',
      user: `Please summarize the following crypto news (5 most important):\n\n${newsList}`
    }
  };
  
  const p = prompts[lang] || prompts.en;
  
  const messages = [
    { role: 'system', content: p.system },
    { role: 'user', content: p.user }
  ];
  
  return await callDeepSeek(messages, { maxTokens: 500 });
}

module.exports = {
  callDeepSeek,
  askQuestion,
  summarizeNews,
  isCryptoRelated,
  isInvestmentRelated
};
