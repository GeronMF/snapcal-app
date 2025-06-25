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
      return await AsyncStorage.getItem('token');
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
}

// Экспортируем единственный экземпляр
export const apiClient = new ApiClient(API_BASE_URL); 