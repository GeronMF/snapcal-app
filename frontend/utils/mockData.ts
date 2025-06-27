import { Meal } from '../types';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api';

// Mock meals for different dishes (fallback)
const mockMeals: { [key: string]: { name: string; calories: number } } = {
  pizza: { name: 'Pizza', calories: 285 },
  salad: { name: 'Caesar Salad', calories: 150 },
  burger: { name: 'Cheeseburger', calories: 520 },
  pasta: { name: 'Pasta with Sauce', calories: 380 },
  sandwich: { name: 'Sandwich', calories: 270 },
  sushi: { name: 'Sushi Roll', calories: 190 },
  steak: { name: 'Steak with Vegetables', calories: 420 },
  soup: { name: 'Vegetable Soup', calories: 120 },
  dessert: { name: 'Chocolate Cake', calories: 370 },
  default: { name: 'Unknown Meal', calories: 250 },
};

// Реальный AI анализ через API
export async function analyzeFood(uri: string, comment?: string, language?: string): Promise<{ 
  name: string; 
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  confidence?: number;
  portions?: string;
  regional?: boolean;
}> {
  try {
    console.log('🔍 Starting AI food analysis...');
    console.log('Image URI:', uri);
    console.log('Comment:', comment);
    console.log('Language:', language);
    
    // Проверяем наличие токена авторизации
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ No auth token found, using fallback');
      throw new Error('No authentication token');
    }
    
    const response = await apiClient.analyzeFood(uri, comment, language);
    
    if (response.success && response.data) {
      console.log('✅ AI analysis successful:', response.data);
      return response.data;
    } else {
      throw new Error(response.message || 'AI analysis failed');
    }
  } catch (error) {
    console.error('❌ AI analysis error:', error);
    
    // Fallback to mock data
    console.log('🔄 Using fallback mock data...');
    const mockMealKeys = Object.keys(mockMeals);
    const randomKey = mockMealKeys[Math.floor(Math.random() * mockMealKeys.length)];
    
    return {
      ...mockMeals[randomKey],
      protein: 15,
      carbs: 30,
      fat: 10,
      confidence: 0.6,
      portions: 'Estimated portion (fallback)',
      regional: false
    };
  }
}

// Create a mock meal with the current timestamp
export function createMockMeal(imageUri: string, name: string, calories: number): Meal {
  const now = new Date();
  
  return {
    id: uuidv4(),
    imageUri,
    name,
    calories,
    protein: 15,
    carbs: 30,
    fat: 10,
    userId: '',
    timestamp: now.getTime(),
    date: format(now, 'yyyy-MM-dd'),
  };
}

// Generate mock meals for testing
export function generateMockMeals(count: number = 5): Meal[] {
  const meals: Meal[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    // Random day in the past week
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 7));
    
    // Random meal
    const mockMealKeys = Object.keys(mockMeals);
    const randomKey = mockMealKeys[Math.floor(Math.random() * mockMealKeys.length)];
    const { name, calories } = mockMeals[randomKey];
    
    meals.push({
      id: uuidv4(),
      imageUri: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg',
      name,
      calories,
      protein: Math.round(calories * 0.15 / 4), // Примерно 15% калорий из белка
      carbs: Math.round(calories * 0.50 / 4), // Примерно 50% калорий из углеводов
      fat: Math.round(calories * 0.35 / 9), // Примерно 35% калорий из жиров
      userId: '',
      timestamp: date.getTime(),
      date: format(date, 'yyyy-MM-dd'),
    });
  }
  
  return meals;
}