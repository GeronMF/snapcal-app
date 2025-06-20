import { environment } from '../config/environment';

// Базовый URL для API
const API_BASE_URL = environment.API_URL;

// Типы для API ответов
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

interface ApiError {
  message: string;
  status: number;
}

// Класс для работы с API
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Базовый метод для HTTP запросов
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        data,
        success: true,
      };
    } catch (error) {
      console.error('API request failed:', error);
      throw {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
      } as ApiError;
    }
  }

  // GET запрос
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST запрос
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT запрос
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE запрос
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Создаем экземпляр API клиента
export const apiClient = new ApiClient(API_BASE_URL);

// Экспортируем для использования в других файлах
export { ApiResponse, ApiError }; 