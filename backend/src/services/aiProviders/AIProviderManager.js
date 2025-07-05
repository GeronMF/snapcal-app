const OpenAIProvider = require('./OpenAIProvider');
const GeminiProvider = require('./GeminiProvider');

/**
 * Менеджер AI провайдеров
 * Управляет переключением между разными AI сервисами
 */
class AIProviderManager {
  constructor() {
    this.providers = new Map();
    this.activeProvider = null;
    this.fallbackEnabled = true;
    this.healthCheckInterval = 60000; // 1 минута
    this.isInitialized = false;
  }

  /**
   * Инициализация провайдеров
   * @param {Object} config - Конфигурация провайдеров
   */
  async initialize(config) {
    console.log('🚀 Инициализация AI Provider Manager...');

    try {
      // Инициализируем OpenAI провайдер
      if (config.openai && config.openai.apiKey) {
        const openaiProvider = new OpenAIProvider({
          name: 'openai',
          apiKey: config.openai.apiKey,
          model: config.openai.model,
          enabled: config.openai.enabled !== false,
          priority: config.openai.priority || 1,
          maxRetries: config.openai.maxRetries || 2
        });
        
        this.providers.set('openai', openaiProvider);
        console.log('✅ OpenAI провайдер инициализирован');
      }

      // Инициализируем Gemini провайдер
      if (config.gemini && config.gemini.apiKey) {
        const geminiProvider = new GeminiProvider({
          name: 'gemini',
          apiKey: config.gemini.apiKey,
          model: config.gemini.model,
          enabled: config.gemini.enabled !== false,
          priority: config.gemini.priority || 2,
          maxRetries: config.gemini.maxRetries || 2
        });
        
        this.providers.set('gemini', geminiProvider);
        console.log('✅ Gemini провайдер инициализирован');
      }

      // Устанавливаем активный провайдер
      await this.setActiveProvider(config.activeProvider || 'openai');
      
      // Запускаем проверку здоровья провайдеров
      this.startHealthCheck();
      
      this.isInitialized = true;
      console.log(`🎯 AI Provider Manager готов. Активный провайдер: ${this.activeProvider?.name}`);
      
    } catch (error) {
      console.error('❌ Ошибка инициализации AI Provider Manager:', error);
      throw error;
    }
  }

  /**
   * Установка активного провайдера
   * @param {string} providerName - Имя провайдера
   */
  async setActiveProvider(providerName) {
    const provider = this.providers.get(providerName);
    
    if (!provider) {
      throw new Error(`Провайдер "${providerName}" не найден`);
    }

    if (!provider.enabled) {
      throw new Error(`Провайдер "${providerName}" отключен`);
    }

    // Проверяем доступность провайдера
    const isAvailable = await provider.isAvailable();
    if (!isAvailable) {
      console.warn(`⚠️ Провайдер "${providerName}" недоступен`);
      
      if (this.fallbackEnabled) {
        // Ищем альтернативный провайдер
        const fallbackProvider = await this.findAvailableProvider();
        if (fallbackProvider) {
          console.log(`🔄 Переключение на fallback провайдер: ${fallbackProvider.name}`);
          this.activeProvider = fallbackProvider;
          return;
        }
      }
      
      throw new Error(`Провайдер "${providerName}" недоступен и нет fallback`);
    }

    this.activeProvider = provider;
    console.log(`✅ Активный провайдер установлен: ${providerName}`);
  }

  /**
   * Анализ изображения через активный провайдер
   * @param {Buffer} imageBuffer 
   * @param {string} language 
   * @param {string} comment 
   * @returns {Promise<Object>}
   */
  async analyzeImage(imageBuffer, language = 'en', comment = '') {
    if (!this.isInitialized) {
      throw new Error('AI Provider Manager не инициализирован');
    }

    if (!this.activeProvider) {
      throw new Error('Нет активного AI провайдера');
    }

    const startTime = Date.now();

    try {
      // Логируем запрос
      console.log(`🔍 AI анализ через ${this.activeProvider.name}:`, {
        language,
        comment: comment ? comment.substring(0, 50) + '...' : 'нет',
        timestamp: new Date().toISOString()
      });

      // Выполняем анализ
      const result = await this.activeProvider.analyzeImage(imageBuffer, language, comment);
      
      const duration = Date.now() - startTime;
      console.log(`✅ AI анализ завершен:`, {
        provider: result.provider,
        name: result.name,
        calories: result.calories,
        confidence: result.confidence,
        duration: `${duration}ms`
      });

      return result;

    } catch (error) {
      console.error(`❌ Ошибка AI анализа через ${this.activeProvider.name}:`, error.message);
      
      // Если fallback включен, пробуем другой провайдер
      if (this.fallbackEnabled && this.providers.size > 1) {
        console.log('🔄 Попытка fallback анализа...');
        
        const fallbackProvider = await this.findAvailableProvider(this.activeProvider.name);
        if (fallbackProvider) {
          try {
            const result = await fallbackProvider.analyzeImage(imageBuffer, language, comment);
            console.log(`✅ Fallback анализ успешен через ${fallbackProvider.name}`);
            return result;
          } catch (fallbackError) {
            console.error(`❌ Fallback анализ также неудачен:`, fallbackError.message);
          }
        }
      }
      
      // Возвращаем базовый результат
      return this.getDefaultResult(comment, language);
    }
  }

  /**
   * Поиск доступного провайдера
   * @param {string} excludeProvider - Исключить этот провайдер
   * @returns {Promise<Object|null>}
   */
  async findAvailableProvider(excludeProvider = null) {
    const availableProviders = Array.from(this.providers.values())
      .filter(provider => 
        provider.enabled && 
        provider.name !== excludeProvider
      )
      .sort((a, b) => a.priority - b.priority);

    for (const provider of availableProviders) {
      try {
        const isAvailable = await provider.isAvailable();
        if (isAvailable) {
          return provider;
        }
      } catch (error) {
        console.error(`Проверка провайдера ${provider.name} неудачна:`, error.message);
      }
    }

    return null;
  }

  /**
   * Получение дефолтного результата
   * @param {string} comment 
   * @param {string} language 
   * @returns {Object}
   */
  getDefaultResult(comment, language) {
    return {
      name: comment || 'Неопознанное блюдо',
      calories: 200,
      protein: 10,
      carbs: 25,
      fat: 8,
      confidence: 0.3,
      language: language || 'ru',
      provider: 'manual',
      portions: 'одна порция',
      regional: false
    };
  }

  /**
   * Получение статуса всех провайдеров
   * @returns {Promise<Array>}
   */
  async getProvidersStatus() {
    const statuses = [];

    for (const [name, provider] of this.providers) {
      try {
        const isAvailable = await provider.isAvailable();
        statuses.push({
          name: provider.name,
          enabled: provider.enabled,
          available: isAvailable,
          active: provider === this.activeProvider,
          priority: provider.priority,
          info: provider.getInfo()
        });
      } catch (error) {
        statuses.push({
          name: provider.name,
          enabled: provider.enabled,
          available: false,
          active: provider === this.activeProvider,
          priority: provider.priority,
          error: error.message,
          info: provider.getInfo()
        });
      }
    }

    return statuses.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Включение/отключение провайдера
   * @param {string} providerName 
   * @param {boolean} enabled 
   */
  setProviderEnabled(providerName, enabled) {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Провайдер "${providerName}" не найден`);
    }

    provider.enabled = enabled;
    console.log(`${enabled ? '✅' : '❌'} Провайдер ${providerName} ${enabled ? 'включен' : 'отключен'}`);

    // Если отключили активный провайдер, ищем альтернативу
    if (!enabled && this.activeProvider === provider) {
      this.findAndSetAvailableProvider();
    }
  }

  /**
   * Поиск и установка доступного провайдера
   */
  async findAndSetAvailableProvider() {
    try {
      const availableProvider = await this.findAvailableProvider();
      if (availableProvider) {
        this.activeProvider = availableProvider;
        console.log(`🔄 Автоматическое переключение на провайдер: ${availableProvider.name}`);
      } else {
        this.activeProvider = null;
        console.error('❌ Нет доступных AI провайдеров');
      }
    } catch (error) {
      console.error('Ошибка при поиске доступного провайдера:', error);
    }
  }

  /**
   * Запуск периодической проверки здоровья провайдеров
   */
  startHealthCheck() {
    setInterval(async () => {
      console.log('🔍 Проверка здоровья AI провайдеров...');
      
      try {
        const statuses = await this.getProvidersStatus();
        const activeProviderStatus = statuses.find(s => s.active);
        
        if (activeProviderStatus && !activeProviderStatus.available) {
          console.warn(`⚠️ Активный провайдер ${activeProviderStatus.name} недоступен`);
          await this.findAndSetAvailableProvider();
        }
      } catch (error) {
        console.error('Ошибка проверки здоровья провайдеров:', error);
      }
    }, this.healthCheckInterval);
  }

  /**
   * Получение информации об активном провайдере
   * @returns {Object|null}
   */
  getActiveProviderInfo() {
    if (!this.activeProvider) {
      return null;
    }

    return {
      name: this.activeProvider.name,
      ...this.activeProvider.getInfo()
    };
  }

  /**
   * Остановка менеджера
   */
  shutdown() {
    console.log('🛑 Остановка AI Provider Manager...');
    this.isInitialized = false;
    this.activeProvider = null;
    this.providers.clear();
  }

  /**
   * Анализ текстового описания еды через активный провайдер
   * @param {string} text
   * @param {string} language
   * @returns {Promise<Object>}
   */
  async analyzeText(text, language = 'en') {
    if (!this.isInitialized) {
      throw new Error('AI Provider Manager не инициализирован');
    }
    if (!this.activeProvider) {
      throw new Error('Нет активного AI провайдера');
    }
    const startTime = Date.now();
    try {
      console.log(`🔍 AI текстовый анализ через ${this.activeProvider.name}:`, { language, text: text?.substring(0, 50) + '...', timestamp: new Date().toISOString() });
      const result = await this.activeProvider.analyzeText(text, language);
      const duration = Date.now() - startTime;
      console.log(`✅ AI текстовый анализ завершен:`, { provider: result.provider, name: result.name, calories: result.calories, confidence: result.confidence, duration: `${duration}ms` });
      return result;
    } catch (error) {
      console.error(`❌ Ошибка AI текстового анализа через ${this.activeProvider.name}:`, error.message);
      if (this.fallbackEnabled && this.providers.size > 1) {
        console.log('🔄 Попытка fallback текстового анализа...');
        const fallbackProvider = await this.findAvailableProvider(this.activeProvider.name);
        if (fallbackProvider) {
          try {
            const result = await fallbackProvider.analyzeText(text, language);
            console.log(`✅ Fallback текстовый анализ успешен через ${fallbackProvider.name}`);
            return result;
          } catch (fallbackError) {
            console.error(`❌ Fallback текстовый анализ также неудачен:`, fallbackError.message);
          }
        }
      }
      // Возвращаем базовый результат
      return this.getDefaultResult(text, language);
    }
  }
}

// Экспортируем единственный экземпляр (Singleton)
module.exports = new AIProviderManager(); 