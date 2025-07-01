module.exports = {
  // OpenAI настройки
  OPENAI: {
    API_KEY: process.env.OPENAI_API_KEY,
    MODEL: process.env.AI_MODEL || "gpt-4-vision-preview",
    MAX_TOKENS: parseInt(process.env.AI_MAX_TOKENS) || 500,
    TEMPERATURE: 0.3,
    TIMEOUT: 60000, // 60 секунд для OpenAI API
  },

  // Настройки таймаутов
  TIMEOUTS: {
    OPENAI_REQUEST: 60000,     // 60 секунд для запроса к OpenAI
    TOTAL_ANALYSIS: 90000,     // 90 секунд общий таймаут анализа
    IMAGE_OPTIMIZATION: 10000,  // 10 секунд на оптимизацию изображения
    CACHE_CHECK: 1000,         // 1 секунда на проверку кэша
  },

  // Настройки повторных попыток
  RETRY: {
    MAX_ATTEMPTS: 2,           // Максимум 2 попытки
    DELAY_MS: 2000,            // 2 секунды между попытками
    EXPONENTIAL_BACKOFF: true, // Экспоненциальное увеличение задержки
  },

  // Настройки кэша
  CACHE: {
    ENABLED: process.env.AI_CACHE_ENABLED === 'true',
    MAX_SIZE: 1000,
    TTL_MS: parseInt(process.env.AI_CACHE_TTL) || 86400000, // 24 часа
  },

  // Fallback настройки
  FALLBACK: {
    ENABLED: process.env.AI_FALLBACK_ENABLED !== 'false',
    CONFIDENCE_RANGE: [0.6, 0.8], // Диапазон уверенности для fallback
  },

  // Настройки изображений
  IMAGE: {
    MAX_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    OPTIMIZE_SIZE: { width: 512, height: 384 },
    QUALITY: 85,
    SUPPORTED_FORMATS: ['jpeg', 'jpg', 'png', 'gif'],
  },

  // Настройки логирования
  LOGGING: {
    ENABLED: process.env.NODE_ENV !== 'production',
    LEVEL: process.env.LOG_LEVEL || 'info',
    REQUEST_ID_LENGTH: 7,
  },

  // Мониторинг производительности
  PERFORMANCE: {
    SLOW_REQUEST_THRESHOLD: 30000, // 30 секунд - медленный запрос
    ERROR_RATE_THRESHOLD: 0.1,     // 10% ошибок - критический уровень
    MEMORY_USAGE_THRESHOLD: 0.8,   // 80% использования памяти
  },

  // Настройки безопасности
  SECURITY: {
    RATE_LIMIT: {
      WINDOW_MS: 15 * 60 * 1000, // 15 минут
      MAX_REQUESTS: 50,           // 50 запросов на пользователя
    },
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
  },

  // Проверка на работоспособность
  HEALTH_CHECK: {
    INTERVAL_MS: 5 * 60 * 1000, // 5 минут
    MAX_CONSECUTIVE_FAILURES: 3,
    ENDPOINTS: [
      'https://api.openai.com/v1/models',
    ],
  }
}; 