import AsyncStorage from '@react-native-async-storage/async-storage';
import { Meal, User } from '../types';

// Keys for AsyncStorage
const KEYS = {
  USER: 'snapcal_user',
  MEALS: 'snapcal_meals',
  ONBOARDED: 'snapcal_onboarded',
  NOTIFICATIONS: 'snapcal_notifications',
};

// Функция для получения ключа приемов пищи для конкретного пользователя
export const getUserMealsKey = (userId: string): string => {
  return `${KEYS.MEALS}_${userId}`;
};

// Функция для получения текущего пользователя
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id || user.user?.id || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
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

// Meal data storage с разделением по пользователям
export async function saveMeal(meal: Meal): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.error('No user ID found, cannot save meal');
      return;
    }

    const meals = await getMeals();
    
    // Найти существующий прием пищи и обновить его или добавить новый
    const existingIndex = meals.findIndex(m => m.id === meal.id);
    if (existingIndex >= 0) {
      meals[existingIndex] = meal;
    } else {
      meals.push(meal);
    }
    
    const userMealsKey = getUserMealsKey(userId);
    await AsyncStorage.setItem(userMealsKey, JSON.stringify(meals));
  } catch (error) {
    console.error('Error saving meal data:', error);
  }
}

export async function getMeals(): Promise<Meal[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.log('No user ID found, returning empty meals array');
      return [];
    }

    const userMealsKey = getUserMealsKey(userId);
    const mealsData = await AsyncStorage.getItem(userMealsKey);
    return mealsData ? JSON.parse(mealsData) : [];
  } catch (error) {
    console.error('Error getting meals data:', error);
    return [];
  }
}

export async function getMealsByDate(date: string): Promise<Meal[]> {
  try {
    const meals = await getMeals();
    return meals
      .filter(meal => meal.date === date)
      .sort((a, b) => b.timestamp - a.timestamp); // Новые блюда сверху
  } catch (error) {
    console.error('Error getting meals by date:', error);
    return [];
  }
}

export async function deleteMeal(id: string): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.error('No user ID found, cannot delete meal');
      return;
    }

    const meals = await getMeals();
    const updatedMeals = meals.filter(meal => meal.id !== id);
    
    const userMealsKey = getUserMealsKey(userId);
    await AsyncStorage.setItem(userMealsKey, JSON.stringify(updatedMeals));
  } catch (error) {
    console.error('Error deleting meal:', error);
  }
}

// Функция для очистки данных конкретного пользователя при выходе
export async function clearUserData(): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (userId) {
      const userMealsKey = getUserMealsKey(userId);
      await AsyncStorage.removeItem(userMealsKey);
    }
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
}

// Функция для очистки данных при смене пользователя
export async function clearDataForUserSwitch(newUserId: string): Promise<void> {
  try {
    const currentUserId = await getCurrentUserId();
    if (currentUserId && currentUserId !== newUserId) {
      console.log('Switching users, clearing old user data');
      // Очищаем данные только если пользователь действительно сменился
      const oldUserMealsKey = getUserMealsKey(currentUserId);
      await AsyncStorage.removeItem(oldUserMealsKey);
    }
  } catch (error) {
    console.error('Error clearing data for user switch:', error);
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

// Функции для работы с соответствием изображений
const getImageMappingKey = (userId: string): string => {
  return `snapcal_image_mapping_${userId}`;
};

// Сохранить соответствие ID изображения и локального пути
export async function saveImageMapping(imageId: string, localPath: string): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.error('No user ID found, cannot save image mapping');
      return;
    }

    const key = getImageMappingKey(userId);
    const existingMappings = await getImageMappings();
    const updatedMappings = {
      ...existingMappings,
      [imageId]: localPath
    };
    
    await AsyncStorage.setItem(key, JSON.stringify(updatedMappings));
    console.log('Image mapping saved:', imageId, '->', localPath);
  } catch (error) {
    console.error('Error saving image mapping:', error);
  }
}

// Получить все соответствия изображений
export async function getImageMappings(): Promise<{ [imageId: string]: string }> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {};
    }

    const key = getImageMappingKey(userId);
    const mappings = await AsyncStorage.getItem(key);
    return mappings ? JSON.parse(mappings) : {};
  } catch (error) {
    console.error('Error getting image mappings:', error);
    return {};
  }
}

// Получить локальный путь по ID изображения
export async function getLocalImagePath(imageId: string): Promise<string | null> {
  try {
    const mappings = await getImageMappings();
    return mappings[imageId] || null;
  } catch (error) {
    console.error('Error getting local image path:', error);
    return null;
  }
}