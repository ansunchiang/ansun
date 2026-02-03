/**
 * AI服务 - DeepSeek
 * 新闻摘要和智能问答
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
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7
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
 * 生成新闻摘要
 */
async function summarizeNews(newsItems) {
  const newsList = newsItems.slice(0, 5).map((item, i) => {
    return `${i + 1}. ${item.title} (${item.source})`;
  }).join('\n');
  
  const messages = [
    {
      role: 'system',
      content: '你是一个专业的币圈新闻分析师。请用简洁的中文总结以下新闻要点，每条不超过50字。'
    },
    {
      role: 'user',
      content: `请总结以下币圈新闻（5条最重要）:\n\n${newsList}`
    }
  ];
  
  return await callDeepSeek(messages, { maxTokens: 500 });
}

/**
 * 智能问答
 */
async function askQuestion(question, context = '') {
  const messages = [
    {
      role: 'system',
      content: `你是一个币圈知识助手。请根据以下背景知识回答用户的问题。

背景知识：
${context || '你是一个专业的币圈资讯助手，提供客观、中立的币圈知识和资讯，不提供任何投资建议。'}

规则：
1. 只回答知识性问题，不提供投资建议
2. 如果是投资相关问题，建议用户自行研究
3. 回答要简洁、专业`
    },
    {
      role: 'user',
      content: question
    }
  ];
  
  return await callDeepSeek(messages, { maxTokens: 1000 });
}

module.exports = {
  callDeepSeek,
  summarizeNews,
  askQuestion
};
