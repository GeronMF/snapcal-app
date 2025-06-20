import { Meal } from '../types';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

// Mock meals for different dishes
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

// Mock AI analysis result - in a real app, this would be an API call
export async function analyzeFood(uri: string, comment?: string): Promise<{ name: string; calories: number }> {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      // Random selection from mock meals to simulate AI response
      const mockMealKeys = Object.keys(mockMeals);
      const randomKey = mockMealKeys[Math.floor(Math.random() * mockMealKeys.length)];
      
      resolve(mockMeals[randomKey]);
    }, 1500); // 1.5 second delay to simulate API call
  });
}

// Create a mock meal with the current timestamp
export function createMockMeal(imageUri: string, name: string, calories: number): Meal {
  const now = new Date();
  
  return {
    id: uuidv4(),
    imageUri,
    name,
    calories,
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
      timestamp: date.getTime(),
      date: format(date, 'yyyy-MM-dd'),
    });
  }
  
  return meals;
}