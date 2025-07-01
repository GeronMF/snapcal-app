/**
 * Базовый абстрактный класс для AI провайдеров
 */
class BaseAIProvider {
  constructor(config) {
    if (new.target === BaseAIProvider) {
      throw new Error('BaseAIProvider нельзя создавать напрямую');
    }
    
    this.config = config;
    this.name = config.name;
    this.enabled = config.enabled;
    this.priority = config.priority || 1;
    this.maxRetries = config.maxRetries || 2;
  }

  /**
   * Абстрактный метод анализа изображения
   * @param {Buffer} imageBuffer - Буфер изображения
   * @param {string} language - Язык анализа
   * @param {string} comment - Дополнительный комментарий
   * @returns {Promise<Object>} Результат анализа
   */
  async analyzeImage(imageBuffer, language = 'en', comment = '') {
    throw new Error('Метод analyzeImage должен быть реализован в наследнике');
  }

  /**
   * Проверка доступности провайдера
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    throw new Error('Метод isAvailable должен быть реализован в наследнике');
  }

  /**
   * Получение информации о провайдере
   * @returns {Object}
   */
  getInfo() {
    return {
      name: this.name,
      enabled: this.enabled,
      priority: this.priority,
      maxRetries: this.maxRetries
    };
  }

  /**
   * Валидация результата анализа
   * @param {Object} result 
   * @returns {Object}
   */
  validateResult(result) {
    const defaultResult = {
      name: 'Неизвестное блюдо',
      calories: 100,
      protein: 0,
      carbs: 0,
      fat: 0,
      confidence: 0.5,
      language: 'ru',
      provider: this.name,
      portions: 'одна порция',
      regional: false
    };

    // Объединяем с дефолтными значениями
    const validated = { ...defaultResult, ...result };

    // Валидируем числовые значения
    validated.calories = this.validateNumber(validated.calories, 100, 1, 3000);
    validated.protein = this.validateNumber(validated.protein, 0, 0, 100);
    validated.carbs = this.validateNumber(validated.carbs, 0, 0, 200);
    validated.fat = this.validateNumber(validated.fat, 0, 0, 100);
    validated.confidence = this.validateNumber(validated.confidence, 0.5, 0, 1);

    // Валидируем строки
    validated.name = validated.name || defaultResult.name;
    validated.portions = validated.portions || defaultResult.portions;
    validated.provider = this.name;

    return validated;
  }

  /**
   * Валидация числового значения
   * @param {*} value 
   * @param {number} defaultVal 
   * @param {number} min 
   * @param {number} max 
   * @returns {number}
   */
  validateNumber(value, defaultVal, min = 0, max = Infinity) {
    const num = parseFloat(value);
    if (isNaN(num)) return defaultVal;
    return Math.max(min, Math.min(max, num));
  }

  /**
   * Логирование запроса
   * @param {Object} params 
   */
  logRequest(params) {
    console.log(`🔍 ${this.name} AI Analysis:`, {
      language: params.language,
      comment: params.comment,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Логирование результата
   * @param {Object} result 
   * @param {number} duration 
   */
  logResult(result, duration) {
    console.log(`✅ ${this.name} Analysis Result:`, {
      name: result.name,
      calories: result.calories,
      confidence: result.confidence,
      duration: `${duration}ms`,
      provider: this.name
    });
  }

  /**
   * Логирование ошибки
   * @param {Error} error 
   */
  logError(error) {
    console.error(`❌ ${this.name} Analysis Error:`, {
      message: error.message,
      provider: this.name,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = BaseAIProvider; 