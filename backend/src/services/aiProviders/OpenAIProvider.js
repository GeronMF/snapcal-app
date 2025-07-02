const OpenAI = require('openai');
const BaseAIProvider = require('./BaseAIProvider');

/**
 * OpenAI провайдер для анализа изображений еды
 */
class OpenAIProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
    
    if (!config.apiKey) {
      throw new Error('OpenAI API ключ не найден');
    }

    this.client = new OpenAI({
      apiKey: config.apiKey,
      timeout: 20000, // 20 секунд таймаут для OpenAI запросов
    });

    this.model = config.model || 'gpt-4o-mini';
    this.maxTokens = config.maxTokens || 500;
  }

  /**
   * Проверка доступности OpenAI
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    try {
      // Простой запрос для проверки API
      await this.client.models.list();
      return true;
    } catch (error) {
      console.error('OpenAI недоступен:', error.message);
      return false;
    }
  }

  /**
   * Анализ изображения через OpenAI Vision
   * @param {Buffer} imageBuffer 
   * @param {string} language 
   * @param {string} comment 
   * @returns {Promise<Object>}
   */
  async analyzeImage(imageBuffer, language = 'en', comment = '') {
    const startTime = Date.now();
    
    this.logRequest({ language, comment });

    try {
      // Конвертируем изображение в base64
      const base64Image = imageBuffer.toString('base64');
      const mimeType = this.detectMimeType(imageBuffer);

      // Получаем промпт на нужном языке
      const prompt = this.getPrompt(language, comment);

      // Запрос к OpenAI
      const response = await this.client.chat.completions.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                  detail: 'low'
                }
              }
            ]
          }
        ]
      });

      // Парсим ответ
      const result = this.parseResponse(response.choices[0].message.content, language);
      
      // Валидируем результат
      const validated = this.validateResult(result);
      
      const duration = Date.now() - startTime;
      this.logResult(validated, duration);

      return validated;

    } catch (error) {
      this.logError(error);
      
      // Возвращаем fallback результат
      return this.validateResult({
        name: comment || 'Неопознанное блюдо',
        confidence: 0.3,
        language: language || 'ru'
      });
    }
  }

  /**
   * Определение MIME типа изображения
   * @param {Buffer} buffer 
   * @returns {string}
   */
  detectMimeType(buffer) {
    const signatures = {
      'ffd8ff': 'image/jpeg',
      '89504e47': 'image/png',
      '47494638': 'image/gif',
      '424d': 'image/bmp',
      '52494646': 'image/webp'
    };

    const hex = buffer.toString('hex', 0, 4);
    
    for (const [signature, mimeType] of Object.entries(signatures)) {
      if (hex.startsWith(signature)) {
        return mimeType;
      }
    }
    
    return 'image/jpeg'; // default
  }

  /**
   * Получение промпта на нужном языке
   * @param {string} language 
   * @param {string} comment 
   * @returns {string}
   */
  getPrompt(language, comment) {
    const prompts = {
      en: `Analyze this food image and provide nutritional information in English. ${comment ? `Additional context: ${comment}` : ''}
Return ONLY a valid JSON object with these exact fields:
{
  "name": "dish name",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "confidence": number (0-1),
  "language": "en",
  "portions": "portion description",
  "regional": boolean
}`,

      ru: `Проанализируй это изображение еды и предоставь информацию о питательной ценности на русском языке. ${comment ? `Дополнительный контекст: ${comment}` : ''}
Верни ТОЛЬКО валидный JSON объект с этими точными полями:
{
  "name": "название блюда",
  "calories": число,
  "protein": число,
  "carbs": число,
  "fat": число,
  "confidence": число (0-1),
  "language": "ru",
  "portions": "описание порции",
  "regional": булево
}`,

      es: `Analiza esta imagen de comida y proporciona información nutricional en español. ${comment ? `Contexto adicional: ${comment}` : ''}
Devuelve SOLO un objeto JSON válido con estos campos exactos:
{
  "name": "nombre del plato",
  "calories": número,
  "protein": número,
  "carbs": número,
  "fat": número,
  "confidence": número (0-1),
  "language": "es",
  "portions": "descripción de la porción",
  "regional": booleano
}`,

      pl: `Przeanalizuj to zdjęcie jedzenia i podaj informacje o wartościach odżywczych po polsku. ${comment ? `Dodatkowy kontekst: ${comment}` : ''}
Zwróć TYLKO prawidłowy obiekt JSON z tymi dokładnymi polami:
{
  "name": "nazwa potrawy",
  "calories": liczba,
  "protein": liczba,
  "carbs": liczba,
  "fat": liczba,
  "confidence": liczba (0-1),
  "language": "pl",
  "portions": "opis porcji",
  "regional": wartość logiczna
}`,

      uk: `Проаналізуй це зображення їжі та надай інформацію про поживну цінність українською мовою. ${comment ? `Додатковий контекст: ${comment}` : ''}
Поверни ТІЛЬКИ валідний JSON об'єкт з цими точними полями:
{
  "name": "назва страви",
  "calories": число,
  "protein": число,
  "carbs": число,
  "fat": число,
  "confidence": число (0-1),
  "language": "uk",
  "portions": "опис порції",
  "regional": булеве
}`
    };

    return prompts[language] || prompts.en;
  }

  /**
   * Парсинг ответа от OpenAI
   * @param {string} content 
   * @param {string} language 
   * @returns {Object}
   */
  parseResponse(content, language) {
    try {
      // Очищаем ответ от markdown и лишних символов
      const cleanContent = content
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/^\s*[\r\n]+/gm, '')
        .trim();

      const parsed = JSON.parse(cleanContent);
      
      return {
        ...parsed,
        language: language || 'ru',
        provider: 'openai'
      };
    } catch (error) {
      console.error('OpenAI response parsing error:', error);
      
      // Fallback парсинг
      return this.extractInfoFromText(content, language);
    }
  }

  /**
   * Извлечение информации из текста (fallback)
   * @param {string} text 
   * @param {string} language 
   * @returns {Object}
   */
  extractInfoFromText(text, language) {
    // Простое извлечение чисел из текста
    const caloriesMatch = text.match(/calories?[:\s]*(\d+)/i);
    const proteinMatch = text.match(/protein[:\s]*(\d+\.?\d*)/i);
    const carbsMatch = text.match(/carb[s]?[:\s]*(\d+\.?\d*)/i);
    const fatMatch = text.match(/fat[:\s]*(\d+\.?\d*)/i);

    return {
      name: 'Блюдо из изображения',
      calories: caloriesMatch ? parseInt(caloriesMatch[1]) : 200,
      protein: proteinMatch ? parseFloat(proteinMatch[1]) : 10,
      carbs: carbsMatch ? parseFloat(carbsMatch[1]) : 25,
      fat: fatMatch ? parseFloat(fatMatch[1]) : 8,
      confidence: 0.6,
      language: language || 'ru',
      portions: 'одна порция',
      regional: false,
      provider: 'openai'
    };
  }
}

module.exports = OpenAIProvider; 