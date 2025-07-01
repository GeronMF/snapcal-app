const OpenAI = require('openai');
const sharp = require('sharp');
const crypto = require('crypto');
const { AI_PROMPTS, REGIONAL_FOODS } = require('../config/aiPrompts');

class AIAnalysisService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 60000 // 60 секунд таймаут только для OpenAI
    });

    // Simple in-memory cache for development
    this.cache = new Map();
    this.maxCacheSize = 1000;
    this.cacheEnabled = process.env.AI_CACHE_ENABLED === 'true';

    // Fallback enabled by default
    this.fallbackEnabled = process.env.AI_FALLBACK_ENABLED !== 'false';

    console.log('🤖 AI Analysis Service initialized');
    console.log('Cache enabled:', this.cacheEnabled);
    console.log('Fallback enabled:', this.fallbackEnabled);
  }

  /**
   * Main method to analyze food image
   * @param {Buffer} imageBuffer - The image buffer
   * @param {string} comment - User comment about the food
   * @param {string} userLanguage - User's preferred language
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeImage(imageBuffer, comment = '', userLanguage = 'en') {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    
    try {
      console.log(`🔍 [${requestId}] Starting AI analysis for language: ${userLanguage}`);
      console.log(`📊 [${requestId}] Image size: ${imageBuffer.length} bytes, comment: "${comment}"`);

      // Check cache first
      if (this.cacheEnabled) {
        const cachedResult = this.getCachedResult(imageBuffer, comment, userLanguage);
        if (cachedResult) {
          console.log(`📦 [${requestId}] Returning cached result in ${Date.now() - startTime}ms`);
          return cachedResult;
        }
      }

      // Optimize image for API
      const optimizeStart = Date.now();
      const optimizedImage = await this.optimizeImage(imageBuffer);
      console.log(`📸 [${requestId}] Image optimized in ${Date.now() - optimizeStart}ms`);

      // Get analysis from OpenAI
      const aiStart = Date.now();
      const result = await this.processWithOpenAI(optimizedImage, comment, userLanguage);
      console.log(`🤖 [${requestId}] OpenAI processing completed in ${Date.now() - aiStart}ms`);

      // Validate and enhance result
      const finalResult = this.validateAndEnhanceResult(result, userLanguage);

      // Cache the result
      if (this.cacheEnabled) {
        this.setCachedResult(imageBuffer, comment, userLanguage, finalResult);
      }

      const totalTime = Date.now() - startTime;
      console.log(`✅ [${requestId}] AI analysis completed successfully in ${totalTime}ms`);
      return finalResult;

    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error(`❌ [${requestId}] AI Analysis error after ${totalTime}ms:`, error.message);
      console.error(`🔍 [${requestId}] Error details:`, {
        name: error.name,
        code: error.code,
        status: error.status,
        stack: error.stack?.split('\n')[0]
      });

      // Специальная обработка таймаут ошибок
      if (error.message && (
        error.message.includes('timeout') ||
        error.message.includes('timed out') ||
        error.message.includes('ETIMEDOUT') ||
        error.code === 'ETIMEDOUT'
      )) {
        console.error(`⏰ [${requestId}] AI анализ превысил лимит времени`);
        if (this.fallbackEnabled) {
          console.log(`🔄 [${requestId}] Using fallback due to timeout`);
          return this.getFallbackResult(comment, userLanguage);
        }
        throw new Error('AI анализ занимает слишком много времени. Попробуйте позже.');
      }

      // Обработка ошибок OpenAI API
      if (error.status) {
        console.error(`🔴 [${requestId}] OpenAI API error: status ${error.status}`);
        if (error.status === 429) {
          console.error(`⚠️ [${requestId}] Rate limit exceeded`);
        } else if (error.status >= 500) {
          console.error(`🚨 [${requestId}] OpenAI server error`);
        }
      }

      if (this.fallbackEnabled) {
        console.log(`🔄 [${requestId}] Using fallback analysis`);
        return this.getFallbackResult(comment, userLanguage);
      }

      throw error;
    }
  }

  /**
 * Process image with OpenAI GPT-4 Vision
 */
  async processWithOpenAI(imageBuffer, comment, userLanguage) {
    const prompts = this.getPrompts(userLanguage);
    const base64Image = imageBuffer.toString('base64');

    const userPrompt = prompts.user.replace('{comment}', comment || 'Нет комментария');

    console.log(`🚀 Sending request to OpenAI (${userLanguage})`);

    const response = await this.openai.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: prompts.system
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: "low"
              }
            }
          ]
        }
      ],
      max_tokens: parseInt(process.env.AI_MAX_TOKENS) || 500,
      temperature: 0.3
    });

    const content = response.choices[0].message.content;
    console.log('📄 Raw AI response:', content);

    // Try to parse JSON response
    try {
      return JSON.parse(content);
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid JSON response from AI');
    }
  }

  /**
   * Optimize image for API submission
   */
  async optimizeImage(imageBuffer) {
    try {
      // Resize and compress image to reduce API costs and processing time
      const optimized = await sharp(imageBuffer)
        .resize(512, 384, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: 85,
          progressive: true
        })
        .toBuffer();

      console.log(`📸 Image optimized: ${imageBuffer.length} -> ${optimized.length} bytes`);
      return optimized;

    } catch (error) {
      console.warn('⚠️ Image optimization failed, using original:', error.message);
      return imageBuffer;
    }
  }

  /**
   * Get prompts for specific language
   */
  getPrompts(language) {
    return AI_PROMPTS[language] || AI_PROMPTS.en;
  }

  /**
   * Validate and enhance AI result
   */
  validateAndEnhanceResult(result, userLanguage) {
    // Ensure all required fields exist
    const validated = {
      name: result.name || 'Unknown Food',
      calories: this.validateNumber(result.calories, 100, 50, 2000),
      protein: this.validateNumber(result.protein, 5, 0, 200),
      carbs: this.validateNumber(result.carbs, 15, 0, 300),
      fat: this.validateNumber(result.fat, 5, 0, 150),
      confidence: this.validateNumber(result.confidence, 0.8, 0, 1),
      portions: result.portions || 'Standard portion',
      language: userLanguage,
      provider: 'openai',
      timestamp: Date.now()
    };

    // Check if food is in regional database
    const regionalFoods = REGIONAL_FOODS[userLanguage] || [];
    const isRegionalFood = regionalFoods.some(food =>
      validated.name.toLowerCase().includes(food.toLowerCase())
    );

    if (isRegionalFood) {
      validated.confidence = Math.min(validated.confidence + 0.1, 1.0);
      validated.regional = true;
    }

    return validated;
  }

  /**
   * Validate numeric values with defaults and bounds
   */
  validateNumber(value, defaultValue, min, max) {
    const num = parseFloat(value);
    if (isNaN(num)) return defaultValue;
    return Math.max(min, Math.min(max, num));
  }

  /**
   * Generate cache key for result
   */
  generateCacheKey(imageBuffer, comment, language) {
    const imageHash = crypto
      .createHash('md5')
      .update(imageBuffer)
      .digest('hex')
      .substring(0, 16);

    const commentHash = crypto
      .createHash('md5')
      .update(comment || '')
      .digest('hex')
      .substring(0, 8);

    return `${imageHash}_${commentHash}_${language}`;
  }

  /**
   * Get cached result if available
   */
  getCachedResult(imageBuffer, comment, language) {
    if (!this.cacheEnabled) return null;

    const key = this.generateCacheKey(imageBuffer, comment, language);
    const cached = this.cache.get(key);

    if (cached) {
      const age = Date.now() - cached.timestamp;
      const maxAge = parseInt(process.env.AI_CACHE_TTL) || 86400000; // 24 hours

      if (age < maxAge) {
        return cached.result;
      } else {
        this.cache.delete(key);
      }
    }

    return null;
  }

  /**
   * Cache analysis result
   */
  setCachedResult(imageBuffer, comment, language, result) {
    if (!this.cacheEnabled) return;

    // Clean cache if it's getting too large
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    const key = this.generateCacheKey(imageBuffer, comment, language);
    this.cache.set(key, {
      result,
      timestamp: Date.now()
    });
  }

  /**
   * Fallback analysis when AI fails
   */
  getFallbackResult(comment, userLanguage) {
    console.log('🔄 Generating fallback result');

    // Fallback food database by language
    const fallbackFoods = {
      ru: [
        { name: 'Смешанное блюдо', calories: 350, protein: 15, carbs: 40, fat: 12 },
        { name: 'Суп', calories: 180, protein: 8, carbs: 20, fat: 6 },
        { name: 'Салат', calories: 150, protein: 5, carbs: 15, fat: 8 },
        { name: 'Мясное блюдо', calories: 420, protein: 30, carbs: 10, fat: 25 },
        { name: 'Каша', calories: 200, protein: 6, carbs: 35, fat: 4 }
      ],
      en: [
        { name: 'Mixed Meal', calories: 350, protein: 15, carbs: 40, fat: 12 },
        { name: 'Soup', calories: 180, protein: 8, carbs: 20, fat: 6 },
        { name: 'Salad', calories: 150, protein: 5, carbs: 15, fat: 8 },
        { name: 'Meat Dish', calories: 420, protein: 30, carbs: 10, fat: 25 }
      ],
      uk: [
        { name: 'Змішана страва', calories: 350, protein: 15, carbs: 40, fat: 12 },
        { name: 'Суп', calories: 180, protein: 8, carbs: 20, fat: 6 }
      ],
      pl: [
        { name: 'Mieszane danie', calories: 350, protein: 15, carbs: 40, fat: 12 },
        { name: 'Zupa', calories: 180, protein: 8, carbs: 20, fat: 6 }
      ],
      es: [
        { name: 'Plato mixto', calories: 350, protein: 15, carbs: 40, fat: 12 },
        { name: 'Sopa', calories: 180, protein: 8, carbs: 20, fat: 6 }
      ]
    };

    const foods = fallbackFoods[userLanguage] || fallbackFoods.en;
    let selectedFood = foods[Math.floor(Math.random() * foods.length)];

    // Try to match comment
    if (comment) {
      const commentLower = comment.toLowerCase();
      const matchedFood = foods.find(food =>
        food.name.toLowerCase().includes(commentLower) ||
        commentLower.includes(food.name.toLowerCase().split(' ')[0])
      );
      if (matchedFood) selectedFood = matchedFood;
    }

    // Add some variation
    const variation = 0.9 + Math.random() * 0.2;

    return {
      name: selectedFood.name,
      calories: Math.round(selectedFood.calories * variation),
      protein: Math.round(selectedFood.protein * variation * 10) / 10,
      carbs: Math.round(selectedFood.carbs * variation * 10) / 10,
      fat: Math.round(selectedFood.fat * variation * 10) / 10,
      confidence: 0.6 + Math.random() * 0.2,
      portions: 'Estimated portion',
      language: userLanguage,
      provider: 'fallback',
      timestamp: Date.now()
    };
  }

  /**
   * Get service status
   */
  async getStatus() {
    try {
      // Test OpenAI connection
      const testResponse = await this.openai.models.list();

      return {
        status: 'operational',
        provider: 'openai',
        model: process.env.AI_MODEL || 'gpt-4-vision-preview',
        cache: {
          enabled: this.cacheEnabled,
          size: this.cache.size,
          maxSize: this.maxCacheSize
        },
        fallback: {
          enabled: this.fallbackEnabled
        },
        supportedLanguages: Object.keys(AI_PROMPTS),
        modelsAvailable: testResponse.data.length > 0
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        fallback: {
          enabled: this.fallbackEnabled
        }
      };
    }
  }
}

// Export singleton instance
module.exports = new AIAnalysisService(); 