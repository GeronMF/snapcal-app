import AsyncStorage from '@react-native-async-storage/async-storage';
import { Meal, User } from '../types';

// Keys for AsyncStorage
const KEYS = {
  USER: 'snapcal_user',
  MEALS: 'snapcal_meals',
  ONBOARDED: 'snapcal_onboarded',
  NOTIFICATIONS: 'snapcal_notifications',
};

// User data storage
export async function saveUser(user: User): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

export async function getUser(): Promise<User | null> {
  try {
    const userData = await AsyncStorage.getItem(KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

// Meal data storage
export async function saveMeal(meal: Meal): Promise<void> {
  try {
    const meals = await getMeals();
    meals.push(meal);
    await AsyncStorage.setItem(KEYS.MEALS, JSON.stringify(meals));
  } catch (error) {
    console.error('Error saving meal data:', error);
  }
}

export async function getMeals(): Promise<Meal[]> {
  try {
    const mealsData = await AsyncStorage.getItem(KEYS.MEALS);
    return mealsData ? JSON.parse(mealsData) : [];
  } catch (error) {
    console.error('Error getting meals data:', error);
    return [];
  }
}

export async function getMealsByDate(date: string): Promise<Meal[]> {
  try {
    const meals = await getMeals();
    return meals.filter(meal => meal.date === date);
  } catch (error) {
    console.error('Error getting meals by date:', error);
    return [];
  }
}

export async function deleteMeal(id: string): Promise<void> {
  try {
    const meals = await getMeals();
    const updatedMeals = meals.filter(meal => meal.id !== id);
    await AsyncStorage.setItem(KEYS.MEALS, JSON.stringify(updatedMeals));
  } catch (error) {
    console.error('Error deleting meal:', error);
  }
}

// Onboarding status
export async function setOnboarded(value: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.ONBOARDED, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting onboarded status:', error);
  }
}

export async function isOnboarded(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(KEYS.ONBOARDED);
    return value === 'true';
  } catch (error) {
    console.error('Error getting onboarded status:', error);
    return false;
  }
}

// Notification settings
export async function saveNotificationSettings(settings: any): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
}

export async function getNotificationSettings(): Promise<any> {
  try {
    const settings = await AsyncStorage.getItem(KEYS.NOTIFICATIONS);
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return null;
  }
}

// Clear all data (for testing or logout)
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      KEYS.USER,
      KEYS.MEALS,
      KEYS.ONBOARDED,
      KEYS.NOTIFICATIONS,
    ]);
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
}