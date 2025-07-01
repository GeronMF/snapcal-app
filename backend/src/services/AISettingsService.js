const mysql = require('mysql2/promise');
const { query } = require('../config/database');

/**
 * Сервис для управления настройками AI провайдеров
 */
class AISettingsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 секунд
    this.lastCacheUpdate = 0;
  }

  /**
   * Получение настройки по ключу
   * @param {string} key - Ключ настройки
   * @param {*} defaultValue - Значение по умолчанию
   * @returns {Promise<*>}
   */
  async getSetting(key, defaultValue = null) {
    try {
      // Проверяем кэш
      if (this.isCacheValid() && this.cache.has(key)) {
        return this.cache.get(key);
      }

      // Загружаем из БД
      const [rows] = await query(
        'SELECT setting_value FROM ai_settings WHERE setting_key = ?',
        [key]
      );

      if (rows.length > 0) {
        const value = this.parseValue(rows[0].setting_value);
        this.cache.set(key, value);
        return value;
      }

      return defaultValue;
    } catch (error) {
      console.error(`Ошибка получения настройки ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Установка настройки
   * @param {string} key - Ключ настройки
   * @param {*} value - Значение
   * @param {string} description - Описание настройки
   * @returns {Promise<boolean>}
   */
  async setSetting(key, value, description = null) {
    try {
      const stringValue = this.stringifyValue(value);
      
      const [result] = await query(`
        INSERT INTO ai_settings (setting_key, setting_value, description)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        setting_value = VALUES(setting_value),
        description = COALESCE(VALUES(description), description),
        updated_at = CURRENT_TIMESTAMP
      `, [key, stringValue, description]);

      // Обновляем кэш
      this.cache.set(key, value);
      this.lastCacheUpdate = Date.now();

      console.log(`✅ Настройка ${key} установлена: ${stringValue}`);
      return true;
    } catch (error) {
      console.error(`Ошибка установки настройки ${key}:`, error);
      return false;
    }
  }

  /**
   * Получение всех настроек AI
   * @returns {Promise<Object>}
   */
  async getAllSettings() {
    try {
      // Проверяем кэш
      if (this.isCacheValid() && this.cache.size > 0) {
        return Object.fromEntries(this.cache);
      }

      // Загружаем все из БД
      const [rows] = await query(
        'SELECT setting_key, setting_value FROM ai_settings'
      );

      const settings = {};
      this.cache.clear();

      for (const row of rows) {
        const value = this.parseValue(row.setting_value);
        settings[row.setting_key] = value;
        this.cache.set(row.setting_key, value);
      }

      this.lastCacheUpdate = Date.now();
      return settings;
    } catch (error) {
      console.error('Ошибка получения всех настроек:', error);
      return {};
    }
  }

  /**
   * Получение конфигурации для AI Manager
   * @returns {Promise<Object>}
   */
  async getAIManagerConfig() {
    try {
      const settings = await this.getAllSettings();

      return {
        activeProvider: settings.active_ai_provider || 'openai',
        fallbackEnabled: this.parseBoolean(settings.fallback_enabled, true),
        healthCheckInterval: parseInt(settings.health_check_interval) || 60000,
        timeout: parseInt(settings.ai_timeout) || 120000,
        retryAttempts: parseInt(settings.ai_retry_attempts) || 2,
        
        openai: {
          apiKey: process.env.OPENAI_API_KEY,
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          enabled: this.parseBoolean(settings.openai_enabled, true),
          priority: parseInt(settings.openai_priority) || 1,
          maxRetries: parseInt(settings.ai_retry_attempts) || 2
        },

        gemini: {
          apiKey: process.env.GEMINI_API_KEY,
          model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
          enabled: this.parseBoolean(settings.gemini_enabled, true),
          priority: parseInt(settings.gemini_priority) || 2,
          maxRetries: parseInt(settings.ai_retry_attempts) || 2
        }
      };
    } catch (error) {
      console.error('Ошибка получения конфигурации AI Manager:', error);
      
      // Возвращаем дефолтную конфигурацию
      return {
        activeProvider: 'openai',
        fallbackEnabled: true,
        healthCheckInterval: 60000,
        timeout: 120000,
        retryAttempts: 2,
        
        openai: {
          apiKey: process.env.OPENAI_API_KEY,
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          enabled: true,
          priority: 1,
          maxRetries: 2
        },

        gemini: {
          apiKey: process.env.GEMINI_API_KEY,
          model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
          enabled: true,
          priority: 2,
          maxRetries: 2
        }
      };
    }
  }

  /**
   * Обновление активного провайдера
   * @param {string} provider - Имя провайдера
   * @returns {Promise<boolean>}
   */
  async setActiveProvider(provider) {
    const validProviders = ['openai', 'gemini'];
    
    if (!validProviders.includes(provider)) {
      throw new Error(`Недопустимый провайдер: ${provider}`);
    }

    return await this.setSetting('active_ai_provider', provider, 'Currently active AI provider');
  }

  /**
   * Включение/отключение провайдера
   * @param {string} provider - Имя провайдера
   * @param {boolean} enabled - Включен ли провайдер
   * @returns {Promise<boolean>}
   */
  async setProviderEnabled(provider, enabled) {
    const validProviders = ['openai', 'gemini'];
    
    if (!validProviders.includes(provider)) {
      throw new Error(`Недопустимый провайдер: ${provider}`);
    }

    const key = `${provider}_enabled`;
    const description = `Enable/disable ${provider} provider`;
    
    return await this.setSetting(key, enabled.toString(), description);
  }

  /**
   * Установка приоритета провайдера
   * @param {string} provider - Имя провайдера
   * @param {number} priority - Приоритет (меньше = выше приоритет)
   * @returns {Promise<boolean>}
   */
  async setProviderPriority(provider, priority) {
    const validProviders = ['openai', 'gemini'];
    
    if (!validProviders.includes(provider)) {
      throw new Error(`Недопустимый провайдер: ${provider}`);
    }

    if (priority < 1 || priority > 10) {
      throw new Error('Приоритет должен быть от 1 до 10');
    }

    const key = `${provider}_priority`;
    const description = `Priority of ${provider} provider (lower = higher priority)`;
    
    return await this.setSetting(key, priority.toString(), description);
  }

  /**
   * Логирование использования AI
   * @param {Object} stats - Статистика использования
   * @returns {Promise<boolean>}
   */
  async logAIUsage(stats) {
    try {
      const {
        provider,
        userId = null,
        success = false,
        responseTime = null,
        errorMessage = null,
        language = null
      } = stats;

      await query(`
        INSERT INTO ai_usage_stats 
        (provider, user_id, success, response_time, error_message, language)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [provider, userId, success, responseTime, errorMessage, language]);

      return true;
    } catch (error) {
      console.error('Ошибка логирования использования AI:', error);
      return false;
    }
  }

  /**
   * Получение статистики использования AI
   * @param {number} days - Количество дней для анализа
   * @returns {Promise<Object>}
   */
  async getAIUsageStats(days = 7) {
    try {
      const [rows] = await query(`
        SELECT 
          provider,
          COUNT(*) as total_requests,
          SUM(success) as successful_requests,
          AVG(response_time) as avg_response_time,
          DATE(created_at) as date
        FROM ai_usage_stats 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY provider, DATE(created_at)
        ORDER BY date DESC, provider
      `, [days]);

      return rows;
    } catch (error) {
      console.error('Ошибка получения статистики AI:', error);
      return [];
    }
  }

  /**
   * Очистка кэша
   */
  clearCache() {
    this.cache.clear();
    this.lastCacheUpdate = 0;
    console.log('🗑️ Кэш настроек AI очищен');
  }

  /**
   * Проверка валидности кэша
   * @returns {boolean}
   */
  isCacheValid() {
    return (Date.now() - this.lastCacheUpdate) < this.cacheTimeout;
  }

  /**
   * Парсинг значения из строки
   * @param {string} value 
   * @returns {*}
   */
  parseValue(value) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (/^\d+$/.test(value)) return parseInt(value);
    if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
    
    // Попытка парсинга JSON
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  /**
   * Преобразование значения в строку
   * @param {*} value 
   * @returns {string}
   */
  stringifyValue(value) {
    if (typeof value === 'string') return value;
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'number') return value.toString();
    if (value === null) return 'null';
    
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  /**
   * Безопасное преобразование в булево значение
   * @param {*} value - Значение для преобразования
   * @param {boolean} defaultValue - Значение по умолчанию
   * @returns {boolean}
   */
  parseBoolean(value, defaultValue = false) {
    if (value === null || value === undefined) {
      return defaultValue;
    }
    
    if (typeof value === 'boolean') {
      return value;
    }
    
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    
    return Boolean(value);
  }
}

module.exports = AISettingsService; 