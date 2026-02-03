/**
 * Ansun 多语言支持
 */

const translations = {
  // 英文 (English)
  en: {
    title: "Ansun 🚀",
    subtitle: "Crypto News AI Aggregator - Information only, no investment advice",
    searchPlaceholder: "Search crypto news...",
    search: "Search",
    tabs: {
      all: "All",
      news: "News",
      btc: "BTC",
     综合: "General",
      refresh: "🔄 Refresh"
    },
    aiTitle: "🤖 AI Assistant",
    aiSubtitle: "Answering crypto knowledge questions only, no investment advice",
    aiHello: "Hello! I'm Ansun AI assistant. Feel free to ask me anything about crypto!",
    aiPlaceholder: "Ask your question...",
    ask: "Ask",
    footer: {
      copyright: "© 2026 Ansun - Crypto News AI Aggregator",
      disclaimer: "Information only, no investment advice"
    },
    loading: "Loading...",
    noNews: "No news found",
    searchFailed: "Search failed",
    error: "Something went wrong",
    thinking: "Thinking..."
  },
  
  // 中文 (Chinese)
  zh: {
    title: "Ansun 🚀",
    subtitle: "币圈资讯AI聚合平台 - 只做资讯，不给投资建议",
    searchPlaceholder: "搜索币圈新闻...",
    search: "搜索",
    tabs: {
      all: "全部",
      news: "新闻",
      btc: "BTC",
     综合: "综合",
      refresh: "🔄 刷新"
    },
    aiTitle: "🤖 AI 智能助手",
    aiSubtitle: "只回答币圈知识问题，不提供投资建议",
    aiHello: "你好！我是Ansun AI助手，有什么币圈相关的问题可以问我～",
    aiPlaceholder: "输入你的问题...",
    ask: "提问",
    footer: {
      copyright: "© 2026 Ansun - 币圈资讯AI聚合平台",
      disclaimer: "只做资讯，不给投资建议"
    },
    loading: "加载中...",
    noNews: "没有找到相关新闻",
    searchFailed: "搜索失败",
    error: "出错了",
    thinking: "思考中..."
  },
  
  // 日语 (Japanese)
  ja: {
    title: "Ansun 🚀",
    subtitle: "クリプトニュースAIアグリゲーター - 情報のみ、投資アドバイスなし",
    searchPlaceholder: "クリプトニュースを検索...",
    search: "検索",
    tabs: {
      all: "すべて",
      news: "ニュース",
      btc: "BTC",
     综合: "一般",
      refresh: "🔄 更新"
    },
    aiTitle: "🤖 AIアシスタント",
    aiSubtitle: "クリプトの知識質問のみに回答、投資アドバイスなし",
    aiHello: "こんにちは！私はAnsun AIアシスタントです。クリプト関連の質問があれば何でも聞いてください！",
    aiPlaceholder: "質問を入力...",
    ask: "質問",
    footer: {
      copyright: "© 2026 Ansun - クリプトニュースAIアグリゲーター",
      disclaimer: "情報のみ、投資アドバイスなし"
    },
    loading: "読み込み中...",
    noNews: "ニュースが見つかりません",
    searchFailed: "検索に失敗しました",
    error: "エラーが発生しました",
    thinking: "考え中..."
  },
  
  // 韩语 (Korean)
  ko: {
    title: "Ansun 🚀",
    subtitle: "암호화폐 뉴스 AI 집계 플랫폼 - 정보만 제공, 투자 조언 없음",
    searchPlaceholder: "암호화폐 뉴스 검색...",
    search: "검색",
    tabs: {
      all: "전체",
      news: "뉴스",
      btc: "BTC",
     综合: "일반",
      refresh: "🔄 새로고침"
    },
    aiTitle: "🤖 AI 어시스턴트",
    aiSubtitle: "암호화폐 지식 질문에만 답변, 투자 조언 없음",
    aiHello: "안녕하세요! 저는 Ansun AI 어시스턴트입니다. 암호화폐 관련 질문이 있으시면 무엇이든 물어보세요!",
    aiPlaceholder: "질문을 입력하세요...",
    ask: "질문",
    footer: {
      copyright: "© 2026 Ansun - 암호화폐 뉴스 AI 집계 플랫폼",
      disclaimer: "정보만 제공, 투자 조언 없음"
    },
    loading: "로딩 중...",
    noNews: "관련 뉴스를 찾을 수 없습니다",
    searchFailed: "검색 실패",
    error: "오류가 발생했습니다",
    thinking: "생각 중..."
  },
  
  // 葡萄牙语 (Portuguese)
  pt: {
    title: "Ansun 🚀",
    subtitle: "Agregador de Notícias de Criptomoedas - Apenas informações, sem conselhos de investimento",
    searchPlaceholder: "Pesquisar notícias de criptomoedas...",
    search: "Pesquisar",
    tabs: {
      all: "Todos",
      news: "Notícias",
      btc: "BTC",
     综合: "Geral",
      refresh: "🔄 Atualizar"
    },
    aiTitle: "🤖 Assistente de IA",
    aiSubtitle: "Respondendo apenas perguntas sobre conhecimento de criptomoedas, sem conselhos de investimento",
    aiHello: "Olá! Sou o assistente de IA Ansun. Sinta-se à vontade para perguntar qualquer coisa sobre criptomoedas!",
    aiPlaceholder: "Digite sua pergunta...",
    ask: "Perguntar",
    footer: {
      copyright: "© 2026 Ansun - Agregador de Notícias de Criptomoedas",
      disclaimer: "Apenas informações, sem conselhos de investimento"
    },
    loading: "Carregando...",
    noNews: "Nenhuma notícia encontrada",
    searchFailed: "Falha na pesquisa",
    error: "Algo deu errado",
    thinking: "Pensando..."
  },
  
  // 西班牙语 (Spanish)
  es: {
    title: "Ansun 🚀",
    subtitle: "Agregador de Noticias de Criptomonedas - Solo información, sin consejos de inversión",
    searchPlaceholder: "Buscar noticias de criptomonedas...",
    search: "Buscar",
    tabs: {
      all: "Todos",
      news: "Noticias",
      btc: "BTC",
     综合: "General",
      refresh: "🔄 Actualizar"
    },
    aiTitle: "🤖 Asistente de IA",
    aiSubtitle: "Respondiendo solo preguntas de conocimiento sobre criptomonedas, sin consejos de inversión",
    aiHello: "¡Hola! Soy el asistente de IA Ansun. ¡Siéntete libre de preguntarme cualquier cosa sobre criptomonedas!",
    aiPlaceholder: "Ingresa tu pregunta...",
    ask: "Preguntar",
    footer: {
      copyright: "© 2026 Ansun - Agregador de Noticias de Criptomonedas",
      disclaimer: "Solo información, sin consejos de inversión"
    },
    loading: "Cargando...",
    noNews: "No se encontraron noticias",
    searchFailed: "Búsqueda fallida",
    error: "Algo salió mal",
    thinking: "Pensando..."
  },
  
  // 法语 (French)
  fr: {
    title: "Ansun 🚀",
    subtitle: "Agrégateur d'Actualités Crypto - Informations uniquement, aucun conseil d'investissement",
    searchPlaceholder: "Rechercher des actualités crypto...",
    search: "Rechercher",
    tabs: {
      all: "Tout",
      news: "Actualités",
      btc: "BTC",
     综合: "Général",
      refresh: "🔄 Actualiser"
    },
    aiTitle: "🤖 Assistant IA",
    aiSubtitle: "Répondant uniquement aux questions sur les connaissances crypto, aucun conseil d'investissement",
    aiHello: "Bonjour ! Je suis l'assistant IA Ansun. N'hésitez pas à me poser des questions sur les crypto !",
    aiPlaceholder: "Entrez votre question...",
    ask: "Poser une question",
    footer: {
      copyright: "© 2026 Ansun - Agrégateur d'Actualités Crypto",
      disclaimer: "Informations uniquement, aucun conseil d'investissement"
    },
    loading: "Chargement...",
    noNews: "Aucune actualité trouvée",
    searchFailed: "Échec de la recherche",
    error: "Une erreur s'est produite",
    thinking: "Réflexion..."
  }
};

/**
 * 获取当前语言翻译
 */
function getTranslations(lang) {
  return translations[lang] || translations['en'];
}

/**
 * 检测浏览器语言
 */
function detectBrowserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  const langMap = {
    'zh': 'zh',
    'zh-CN': 'zh',
    'zh-TW': 'zh',
    'ja': 'ja',
    'ja-JP': 'ja',
    'ko': 'ko',
    'ko-KR': 'ko',
    'pt': 'pt',
    'pt-BR': 'pt',
    'pt-PT': 'pt',
    'es': 'es',
    'es-ES': 'es',
    'es-MX': 'es',
    'fr': 'fr',
    'fr-FR': 'fr'
  };
  
  return langMap[browserLang] || 'en';
}

module.exports = {
  translations,
  getTranslations,
  detectBrowserLanguage
};
