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

  // AI анализ изображения еды
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
    const RETRY_DELAY = 2000; // 2 секунды между попытками // 2 секунды между попытками

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
          
          throw new Error('AI анализ занимает слишком много времени. Попробуйте позже.');
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
}

// Экспортируем единственный экземпляр
export const apiClient = new ApiClient(API_BASE_URL); 