const { GoogleGenerativeAI } = require('@google/generative-ai');
const BaseAIProvider = require('./BaseAIProvider');

/**
 * Google Gemini провайдер для анализа изображений еды
 */
class GeminiProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
    
    if (!config.apiKey) {
      throw new Error('Gemini API ключ не найден');
    }

    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model || 'gemini-1.5-flash';
    this.maxTokens = config.maxTokens || 500;
  }

  /**
   * Проверка доступности Gemini
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });
      
      // Простой тестовый запрос
      const result = await model.generateContent("Hello");
      return !!result.response;
    } catch (error) {
      console.error('Gemini недоступен:', error.message);
      return false;
    }
  }

  /**
   * Анализ изображения через Gemini Vision
   * @param {Buffer} imageBuffer 
   * @param {string} language 
   * @param {string} comment 
   * @returns {Promise<Object>}
   */
  async analyzeImage(imageBuffer, language = 'en', comment = '') {
    const startTime = Date.now();
    
    this.logRequest({ language, comment });

    try {
      // Валидируем изображение
      if (!imageBuffer || imageBuffer.length < 100) {
        throw new Error('Invalid or too small image buffer');
      }

      // Получаем модель
      const model = this.genAI.getGenerativeModel({ 
        model: this.model,
        generationConfig: {
          maxOutputTokens: this.maxTokens,
          temperature: 0.1, // Более детерминистичные ответы
        }
      });

      // Конвертируем изображение для Gemini
      const imagePart = this.prepareImageForGemini(imageBuffer);
      
      // Получаем промпт на нужном языке
      const prompt = this.getPrompt(language, comment);

      // Запрос к Gemini
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      // Парсим ответ
      const analysisResult = this.parseResponse(text, language);
      
      // Валидируем результат
      const validated = this.validateResult(analysisResult);
      
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
   * Подготовка изображения для Gemini
   * @param {Buffer} imageBuffer 
   * @returns {Object}
   */
  prepareImageForGemini(imageBuffer) {
    const mimeType = this.detectMimeType(imageBuffer);
    
    return {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: mimeType
      }
    };
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
      en: `Analyze this food image and provide detailed nutritional information in English. ${comment ? `Additional context: ${comment}` : ''}

Please examine the image carefully and identify:
1. The main dish or food item
2. Estimate portion size and quantity
3. Calculate nutritional values per serving
4. Assess if this is a regional/traditional dish

Return ONLY a valid JSON object with these exact fields (no additional text or explanation):
{
  "name": "specific dish name",
  "calories": estimated_calories_number,
  "protein": protein_grams_number,
  "carbs": carbohydrates_grams_number,
  "fat": fat_grams_number,
  "confidence": confidence_score_0_to_1,
  "language": "en",
  "portions": "detailed portion description",
  "regional": true_or_false
}

Be precise with numbers and realistic with estimates.`,

      ru: `Проанализируй это изображение еды и предоставь детальную информацию о питательной ценности на русском языке. ${comment ? `Дополнительный контекст: ${comment}` : ''}

Пожалуйста, внимательно изучи изображение и определи:
1. Основное блюдо или продукт
2. Оцени размер порции и количество
3. Рассчитай питательную ценность на порцию
4. Определи, является ли это региональным/традиционным блюдом

Верни ТОЛЬКО валидный JSON объект с этими точными полями (без дополнительного текста или объяснений):
{
  "name": "конкретное название блюда",
  "calories": число_калорий,
  "protein": число_граммов_белка,
  "carbs": число_граммов_углеводов,
  "fat": число_граммов_жира,
  "confidence": оценка_уверенности_от_0_до_1,
  "language": "ru",
  "portions": "детальное описание порции",
  "regional": правда_или_ложь
}

Будь точен с числами и реалистичен в оценках.`,

      es: `Analiza esta imagen de comida y proporciona información nutricional detallada en español. ${comment ? `Contexto adicional: ${comment}` : ''}

Por favor examina la imagen cuidadosamente e identifica:
1. El plato principal o alimento
2. Estima el tamaño y cantidad de la porción
3. Calcula los valores nutricionales por porción
4. Evalúa si es un plato regional/tradicional

Devuelve SOLO un objeto JSON válido con estos campos exactos (sin texto adicional o explicación):
{
  "name": "nombre específico del plato",
  "calories": número_de_calorías,
  "protein": número_de_gramos_de_proteína,
  "carbs": número_de_gramos_de_carbohidratos,
  "fat": número_de_gramos_de_grasa,
  "confidence": puntuación_de_confianza_0_a_1,
  "language": "es",
  "portions": "descripción detallada de la porción",
  "regional": verdadero_o_falso
}

Sé preciso con los números y realista con las estimaciones.`,

      pl: `Przeanalizuj to zdjęcie jedzenia i podaj szczegółowe informacje o wartościach odżywczych po polsku. ${comment ? `Dodatkowy kontekst: ${comment}` : ''}

Proszę dokładnie zbadaj obraz i zidentyfikuj:
1. Główne danie lub produkt spożywczy
2. Oszacuj wielkość i ilość porcji
3. Oblicz wartości odżywcze na porcję
4. Oceń czy to danie regionalne/tradycyjne

Zwróć TYLKO prawidłowy obiekt JSON z tymi dokładnymi polami (bez dodatkowego tekstu lub wyjaśnień):
{
  "name": "konkretna nazwa potrawy",
  "calories": liczba_kalorii,
  "protein": liczba_gramów_białka,
  "carbs": liczba_gramów_węglowodanów,
  "fat": liczba_gramów_tłuszczu,
  "confidence": wskaźnik_pewności_od_0_do_1,
  "language": "pl",
  "portions": "szczegółowy opis porcji",
  "regional": prawda_lub_fałsz
}

Bądź precyzyjny z liczbami i realistyczny w szacunkach.`,

      uk: `Проаналізуй це зображення їжі та надай детальну інформацію про поживну цінність українською мовою. ${comment ? `Додатковий контекст: ${comment}` : ''}

Будь ласка, уважно вивчи зображення та визнач:
1. Основна страва або продукт
2. Оціни розмір порції та кількість
3. Розрахуй поживну цінність на порцію
4. Визнач, чи є це регіональною/традиційною стравою

Поверни ТІЛЬКИ валідний JSON об'єкт з цими точними полями (без додаткового тексту або пояснень):
{
  "name": "конкретна назва страви",
  "calories": число_калорій,
  "protein": число_грамів_білка,
  "carbs": число_грамів_вуглеводів,
  "fat": число_грамів_жиру,
  "confidence": оцінка_впевненості_від_0_до_1,
  "language": "uk",
  "portions": "детальний опис порції",
  "regional": правда_або_брехня
}

Будь точним з числами та реалістичним в оцінках.`
    };

    return prompts[language] || prompts.en;
  }

  /**
   * Парсинг ответа от Gemini
   * @param {string} content 
   * @param {string} language 
   * @returns {Object}
   */
  parseResponse(content, language) {
    try {
      // Очищаем ответ от markdown и лишних символов
      let cleanContent = content
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/^\s*[\r\n]+/gm, '')
        .trim();

      // Gemini иногда добавляет текст перед JSON, ищем JSON блок
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanContent = jsonMatch[0];
      }

      const parsed = JSON.parse(cleanContent);
      
      return {
        ...parsed,
        language: language || 'ru',
        provider: 'gemini'
      };
    } catch (error) {
      console.error('Gemini response parsing error:', error);
      console.log('Raw content:', content);
      
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
    // Улучшенное извлечение чисел из текста для Gemini
    const caloriesMatch = text.match(/(?:calories?|калори|caloría|kalori|калорі)[:\s]*(\d+)/i);
    const proteinMatch = text.match(/(?:protein|белк|proteína|białk|білок)[:\s]*(\d+\.?\d*)/i);
    const carbsMatch = text.match(/(?:carb|углевод|carbohidrat|węglowod|вуглевод)[:\s]*(\d+\.?\d*)/i);
    const fatMatch = text.match(/(?:fat|жир|grasa|tłuszcz|жир)[:\s]*(\d+\.?\d*)/i);
    
    // Попытка найти название блюда
    const nameMatch = text.match(/(?:name|название|nombre|nazwa|назва)[:\s]*["]?([^",\n]+)["]?/i);

    return {
      name: nameMatch ? nameMatch[1].trim() : 'Блюдо из изображения',
      calories: caloriesMatch ? parseInt(caloriesMatch[1]) : 250,
      protein: proteinMatch ? parseFloat(proteinMatch[1]) : 12,
      carbs: carbsMatch ? parseFloat(carbsMatch[1]) : 30,
      fat: fatMatch ? parseFloat(fatMatch[1]) : 10,
      confidence: 0.7,
      language: language || 'ru',
      portions: 'одна порция',
      regional: false,
      provider: 'gemini'
    };
  }
}

module.exports = GeminiProvider; 