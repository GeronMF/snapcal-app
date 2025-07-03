import AsyncStorage from '@react-native-async-storage/async-storage';
import { Meal } from '../types';

const API_BASE_URL = 'https://snapcal.fun';

// Типы для API ответов
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Класс для работы с API
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Получение токена авторизации
  private async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('🔑 Auth token retrieved:', token ? `${token.substring(0, 20)}...` : 'null');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Базовый метод для HTTP запросов
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getAuthToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    console.log('API Request:', options.method || 'GET', url);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);

      // Добавляем детальную диагностику
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        console.error('Network error details:');
        console.error('- URL:', url);
        console.error('- This usually means:');
        console.error('  1. Server is down or unreachable');
        console.error('  2. Network connectivity issues');
        console.error('  3. CORS or firewall blocking the request');
        console.error('  4. Invalid URL or SSL certificate issues');
      }

      throw error;
    }
  }

  // Методы для работы с приемами пищи
  async getMeals(): Promise<ApiResponse<Meal[]>> {
    return this.request<Meal[]>('/api/meals');
  }

  async createMeal(mealData: {
    name: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    imageUri?: string;
    comment?: string;
    date?: string;
    // AI поля
    language?: string;
    ai_confidence?: number;
    ai_provider?: string;
    portions?: string;
    regional?: boolean;
  }): Promise<ApiResponse<Meal>> {
    return this.request<Meal>('/api/meals', {
      method: 'POST',
      body: JSON.stringify(mealData),
    });
  }

  async updateMeal(id: string, mealData: Partial<Meal>): Promise<ApiResponse<Meal>> {
    return this.request<Meal>(`/api/meals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(mealData),
    });
  }

  async deleteMeal(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/meals/${id}`, {
      method: 'DELETE',
    });
  }

  // AI анализ изображения еды или текстового описания
  async analyzeFood(imageUri: string, comment?: string, language?: string): Promise<ApiResponse<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    confidence: number;
    portions: string;
    regional?: boolean;
  }>> {
    const isTextOnly = !imageUri || imageUri.trim() === '';
    if (isTextOnly) {
      // Новый серверный endpoint для текстового анализа
      try {
        const token = await this.getAuthToken();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        const response = await fetch(`${this.baseURL}/api/ai/analyze-text`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ text: comment, language }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('AI Text Analysis request failed, fallback:', error);
        // Fallback (локальный)
        const textFallback = this.generateSmartTextAnalysis(comment || '', language || 'en');
        return {
          success: true,
          data: textFallback
        };
      }
    }

    // Оригинальная логика для анализа изображений
    const formData = new FormData();

    // Добавляем изображение
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'food.jpg',
    } as any);

    // Добавляем комментарий если есть
    if (comment) {
      formData.append('comment', comment);
    }

    // Добавляем язык если указан
    if (language) {
      formData.append('language', language);
    }

    const token = await this.getAuthToken();
    const headers: Record<string, string> = {};

    // Добавляем токен авторизации
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // НЕ добавляем Content-Type для FormData - браузер сам установит правильный заголовок с boundary

    console.log('AI Analysis Request:', `${this.baseURL}/api/ai/analyze`);
    console.log('Using auth token:', token ? 'Yes' : 'No');

    // Разумные таймауты для пользователя
    const AI_TIMEOUT = 20000; // 20 секунд - максимум что пользователь готов ждать
    const RETRY_ATTEMPTS = 2;
    const RETRY_DELAY = 2000; // 2 секунды между попытками

    for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
      try {
        console.log(`🔍 Попытка ${attempt}/${RETRY_ATTEMPTS} AI анализа...`);
        
        // Создаем контроллер для отмены запроса по таймауту
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log(`⏰ Таймаут ${AI_TIMEOUT}ms на попытке ${attempt}`);
          controller.abort();
        }, AI_TIMEOUT);

        const response = await fetch(`${this.baseURL}/api/ai/analyze`, {
          method: 'POST',
          headers,
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log(`AI Response status: ${response.status} (попытка ${attempt})`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`HTTP error! status: ${response.status}, body: ${errorText}`);
          
          // Если 408 (Request Timeout) или 504 (Gateway Timeout), попробуем еще раз
          if ((response.status === 408 || response.status === 504) && attempt < RETRY_ATTEMPTS) {
            console.log(`⏳ Таймаут сервера, ждем ${RETRY_DELAY}ms перед повтором...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            continue;
          }
          
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('AI Analysis successful:', data);
        return data;
        
      } catch (error: any) {
        console.error(`AI Analysis request failed (попытка ${attempt}):`, error);

        // Улучшенная диагностика ошибок
        if (error.name === 'AbortError') {
          console.error(`⏰ AI анализ превысил лимит времени (${AI_TIMEOUT}ms) на попытке ${attempt}`);
          
          if (attempt < RETRY_ATTEMPTS) {
            console.log(`⏳ Ждем ${RETRY_DELAY}ms перед повтором...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            continue;
          }
          
        } else if (error instanceof TypeError && error.message.includes('Network request failed')) {
          console.error('🌐 Проблема с сетевым подключением');
          
          if (attempt < RETRY_ATTEMPTS) {
            console.log(`🔄 Повторяем из-за сетевой ошибки через ${RETRY_DELAY}ms...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            continue;
          }
          
          throw new Error('Проблема с интернет-соединением. Проверьте подключение.');
        } else if (error instanceof TypeError && (
          error.message.includes('timeout') ||
          error.message.includes('timed out')
        )) {
          console.error('⏰ Превышен лимит времени ожидания');
          
          if (attempt < RETRY_ATTEMPTS) {
            console.log(`⏳ Повторяем из-за таймаута через ${RETRY_DELAY}ms...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            continue;
          }
          
          throw new Error('Сервер AI не отвечает. Попробуйте позже.');
        }

        // Если это последняя попытка, пробрасываем ошибку
        if (attempt === RETRY_ATTEMPTS) {
          throw error;
        }
        
        console.log(`🔄 Повторяем запрос через ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }

    // Этот код никогда не должен выполниться, но для безопасности
    throw new Error('Все попытки AI анализа завершились неудачей');
  }

  // Умный анализ текстового описания
  private generateSmartTextAnalysis(text: string, language: string) {
    console.log('📝 Генерируем умный анализ для текста:', text);
    
    // База данных еды с калориями и БЖУ
    const foodDatabase: { [key: string]: { calories: number, protein: number, carbs: number, fat: number } } = {
      // Основные блюда
      'рис': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
      'гречка': { calories: 134, protein: 4.5, carbs: 25, fat: 1.2 },
      'макароны': { calories: 220, protein: 8, carbs: 44, fat: 1.1 },
      'картофель': { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
      'курица': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
      'говядина': { calories: 250, protein: 26, carbs: 0, fat: 15 },
      'рыба': { calories: 200, protein: 22, carbs: 0, fat: 12 },
      'яйца': { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
      'овсянка': { calories: 68, protein: 2.4, carbs: 12, fat: 1.4 },
      'творог': { calories: 101, protein: 18, carbs: 3.4, fat: 2.2 },
      'хлеб': { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
      'молоко': { calories: 64, protein: 3.2, carbs: 4.8, fat: 3.6 },
      'масло': { calories: 717, protein: 0.6, carbs: 0.8, fat: 81 },
      'сыр': { calories: 402, protein: 25, carbs: 0.3, fat: 33 },
      'салат': { calories: 15, protein: 1.2, carbs: 2.9, fat: 0.2 },
      'огурец': { calories: 16, protein: 0.8, carbs: 2.5, fat: 0.1 },
      'помидор': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
      'морковь': { calories: 41, protein: 0.9, carbs: 9.6, fat: 0.24 },
      'яблоко': { calories: 52, protein: 0.3, carbs: 14, fat: 0.17 },
      'банан': { calories: 89, protein: 1.1, carbs: 23, fat: 0.33 },
      'каша': { calories: 90, protein: 3, carbs: 15, fat: 2 },
      'суп': { calories: 45, protein: 3, carbs: 6, fat: 1 },
      'борщ': { calories: 70, protein: 4, carbs: 8, fat: 2.5 },
      'щи': { calories: 35, protein: 2.5, carbs: 5, fat: 1 },
      'пельмени': { calories: 275, protein: 12, carbs: 29, fat: 12 },
      'котлета': { calories: 250, protein: 18, carbs: 8, fat: 16 },
      'пицца': { calories: 266, protein: 11, carbs: 33, fat: 10 },
      'бутерброд': { calories: 220, protein: 8, carbs: 26, fat: 9 }
    };

    const textLower = text.toLowerCase();
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let foundFoods: string[] = [];
    let portions = 1;

    // Поиск порций в тексте
    const portionMatches = textLower.match(/(\d+)\s*(порци|штук|кусочк|ложк|стакан|грамм|г\b)/gi);
    if (portionMatches) {
      const numbers = portionMatches.map(match => parseInt(match.match(/\d+/)?.[0] || '1'));
      if (numbers.length > 0) {
        portions = Math.max(...numbers);
      }
    }

    // Поиск еды в тексте
    Object.keys(foodDatabase).forEach(food => {
      if (textLower.includes(food)) {
        const foodData = foodDatabase[food];
        totalCalories += foodData.calories * portions;
        totalProtein += foodData.protein * portions;
        totalCarbs += foodData.carbs * portions;
        totalFat += foodData.fat * portions;
        foundFoods.push(food);
      }
    });

    // Если ничего не нашли, используем базовые значения
    if (foundFoods.length === 0) {
      totalCalories = 250;
      totalProtein = 15;
      totalCarbs = 30;
      totalFat = 10;
      foundFoods = ['блюдо'];
    }

    // Формируем название блюда
    let dishName = foundFoods.length > 0 ? foundFoods.join(', ') : 'Описанное блюдо';
    if (portions > 1) {
      dishName += ` (${portions} порций)`;
    }

    // Переводим название в зависимости от языка
    if (language === 'en') {
      dishName = foundFoods.map(food => {
        const translations: { [key: string]: string } = {
          'рис': 'rice', 'гречка': 'buckwheat', 'макароны': 'pasta',
          'картофель': 'potato', 'курица': 'chicken', 'говядина': 'beef',
          'рыба': 'fish', 'яйца': 'eggs', 'овсянка': 'oatmeal',
          'творог': 'cottage cheese', 'хлеб': 'bread', 'молоко': 'milk',
          'каша': 'porridge', 'суп': 'soup', 'блюдо': 'dish'
        };
        return translations[food] || food;
      }).join(', ');
      
      if (portions > 1) {
        dishName += ` (${portions} portions)`;
      }
    }

    return {
      name: dishName.charAt(0).toUpperCase() + dishName.slice(1),
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      confidence: 0.7, // Средняя уверенность для текстового анализа
      portions: `${portions} порция${portions > 1 ? 'и' : ''} (текстовый анализ)`,
      regional: false
    };
  }
}

// Экспортируем единственный экземпляр
export const apiClient = new ApiClient(API_BASE_URL); 