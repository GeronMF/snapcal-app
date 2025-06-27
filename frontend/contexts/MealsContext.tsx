import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Meal } from '../types';
import { getMeals, saveMeal, getMealsByDate, deleteMeal, getCurrentUserId, getUserMealsKey, saveImageMapping, getLocalImagePath } from '../utils/storage';
import { apiClient } from '../utils/api';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

type MealsContextType = {
  meals: Meal[];
  todayMeals: Meal[];
  favoriteMeals: Meal[];
  loading: boolean;
  addMeal: (meal: Omit<Meal, 'id' | 'date' | 'timestamp'>) => Promise<void>;
  getMealsByDate: (date: string) => Promise<Meal[]>;
  removeMeal: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  addMealFromFavorite: (meal: Meal) => Promise<void>;
  refreshMeals: () => Promise<void>;
  clearMealsForNewUser: () => void;
};

const MealsContext = createContext<MealsContextType | undefined>(undefined);

export const MealsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [favoriteMeals, setFavoriteMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load meals on app start
  useEffect(() => {
    loadMeals();
  }, []);

  // Load meals from storage and sync with server
  const loadMeals = async () => {
    try {
      setLoading(true);
      
      console.log('MealsContext: Starting to load meals...');
      
      // Сначала загружаем из локального хранилища (быстро)
      const localMeals = await loadMealsFromStorage();
      console.log('MealsContext: Loaded from local storage:', localMeals.length, 'meals');
      setMeals(localMeals);
      updateDerivedState(localMeals);
      
      // Затем синхронизируемся с сервером
      try {
        console.log('MealsContext: Syncing with server...');
        const response = await apiClient.getMeals();
        if (response.success && response.data) {
          const serverMeals = response.data;
          console.log('MealsContext: Received from server:', serverMeals.length, 'meals');
          
          // Показываем первые несколько приемов с сервера для диагностики
          console.log('MealsContext: Server meals sample:', serverMeals.slice(0, 3).map(m => `${m.name} (${m.date}) - raw date: ${JSON.stringify(m.date)}`));
          
          // Восстанавливаем локальные пути изображений
          const mealsWithLocalImages = await restoreLocalImagePaths(serverMeals);
          
          setMeals(mealsWithLocalImages);
          updateDerivedState(mealsWithLocalImages);
          
          // Сохраняем в локальное хранилище
          await saveMealsToStorage(mealsWithLocalImages);
          console.log('Synced with server:', mealsWithLocalImages.length, 'meals');
        }
      } catch (error) {
        console.log('Server sync failed, using local data:', error);
        
        // Проверяем тип ошибки
        if (error instanceof TypeError && error.message.includes('Network request failed')) {
          console.log('MealsContext: Network error - server may be unavailable, continuing with local data');
        } else if (error instanceof Error && error.message.includes('401')) {
          console.log('MealsContext: Authentication error (401) - user needs to login');
          // Для ошибки 401 просто работаем с локальными данными
          // Пользователь увидит экран входа при следующем запуске
        } else {
          console.log('MealsContext: API error:', error);
        }
        
        // Продолжаем работать с локальными данными - это нормально
      }
    } catch (error) {
      console.error('Error loading meals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Загружаем приемы пищи из локального хранилища
  const loadMealsFromStorage = async (): Promise<Meal[]> => {
    try {
      const userId = await getCurrentUserId();
      console.log('MealsContext: Loading meals for user:', userId);
      
      if (!userId) {
        console.log('MealsContext: No user ID found, returning empty array');
        return [];
      }

      const key = getUserMealsKey(userId);
      console.log('MealsContext: Using storage key:', key);
      
      const storedMeals = await AsyncStorage.getItem(key);
      console.log('MealsContext: Raw stored data:', storedMeals ? storedMeals.substring(0, 100) + '...' : 'null');
      
      if (storedMeals) {
        const parsed = JSON.parse(storedMeals);
        console.log('MealsContext: Parsed', parsed.length, 'meals from storage');
        console.log('MealsContext: Storage meals:', parsed.map((m: Meal) => `${m.name} (${m.date}, fav: ${m.isFavorite})`));
        return parsed;
      } else {
        console.log('MealsContext: No stored meals found');
        return [];
      }
    } catch (error) {
      console.error('MealsContext: Error loading from storage:', error);
      return [];
    }
  };

  // Сохраняем массив приемов пищи в локальное хранилище
  const saveMealsToStorage = async (meals: Meal[]): Promise<void> => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        console.error('MealsContext: No user ID found, cannot save meals');
        return;
      }

      const key = getUserMealsKey(userId);
      await AsyncStorage.setItem(key, JSON.stringify(meals));
      console.log('MealsContext: Saved', meals.length, 'meals to storage');
    } catch (error) {
      console.error('MealsContext: Error saving meals to storage:', error);
    }
  };

  // Восстанавливаем локальные пути изображений из ID и нормализуем данные
  const restoreLocalImagePaths = async (serverMeals: Meal[]): Promise<Meal[]> => {
    const restoredMeals = await Promise.all(
      serverMeals.map(async (meal) => {
        // Пытаемся получить imageUri из любого из полей
        const imageUri = meal.imageUri || (meal as any).image_uri;
        
        console.log('MealsContext: Processing meal from server:', meal.name, 'imageUri:', meal.imageUri, 'image_uri:', (meal as any).image_uri);
        
        // Нормализуем числовые поля (они могут приходить как строки)
        const normalizedMeal = {
          ...meal,
          calories: typeof meal.calories === 'string' ? parseFloat(meal.calories) || 0 : meal.calories || 0,
          protein: typeof meal.protein === 'string' ? parseFloat(meal.protein) || 0 : meal.protein || 0,
          carbs: typeof meal.carbs === 'string' ? parseFloat(meal.carbs) || 0 : meal.carbs || 0,
          fat: typeof meal.fat === 'string' ? parseFloat(meal.fat) || 0 : meal.fat || 0,
          confidence: typeof meal.confidence === 'string' ? parseFloat(meal.confidence) || 0 : meal.confidence || 0,
        };
        
        // Если imageUri это ID (не содержит file:// или http), восстанавливаем локальный путь
        if (imageUri && !imageUri.includes('://')) {
          console.log('MealsContext: Found image ID from server:', imageUri);
          
          // Пытаемся восстановить локальный путь
          const localPath = await getLocalImagePath(imageUri);
          if (localPath) {
            console.log('MealsContext: Restored local path:', localPath);
            return { ...normalizedMeal, imageUri: localPath };
          } else {
            console.log('MealsContext: Could not find local path for ID:', imageUri);
            // Оставляем без изображения
            return { ...normalizedMeal, imageUri: undefined };
          }
        } else if (!imageUri) {
          console.log('MealsContext: Meal has no imageUri or image_uri');
        } else {
          console.log('MealsContext: Meal has full imageUri:', imageUri);
        }
        
        return { ...normalizedMeal, imageUri };
      })
    );
    
    return restoredMeals;
  };

  // Обновляем производные состояния
  const updateDerivedState = (allMeals: Meal[]) => {
    console.log('MealsContext: Updating derived state with', allMeals.length, 'meals');
    
    // Filter for today's meals
    const today = format(new Date(), 'yyyy-MM-dd');
    console.log('MealsContext: Today is', today);
    
    // Нормализуем даты для корректного сравнения
    const todaysMeals = allMeals.filter(meal => {
      const mealDate = meal.date.includes('T') ? meal.date.split('T')[0] : meal.date;
      return mealDate === today;
    });
    console.log('MealsContext: Found', todaysMeals.length, 'meals for today');
    console.log('MealsContext: Today meals:', todaysMeals.map(m => `${m.name} (${m.date})`));
    
    setTodayMeals(todaysMeals);
    
    // Filter for favorite meals
    const favorites = allMeals.filter(meal => meal.isFavorite);
    console.log('MealsContext: Found', favorites.length, 'favorite meals');
    console.log('MealsContext: Favorite meals:', favorites.map(m => `${m.name} (favorite: ${m.isFavorite})`));
    
    setFavoriteMeals(favorites);
  };

  // Add a new meal
  const addMeal = async (mealData: Omit<Meal, 'id' | 'date' | 'timestamp'>) => {
    try {
      const now = new Date();
      
      console.log('MealsContext: Adding meal with imageUri:', mealData.imageUri);
      
      const newMeal: Meal = {
        id: uuidv4(),
        date: format(now, 'yyyy-MM-dd'),
        timestamp: now.getTime(),
        ...mealData
      };
      
      console.log('MealsContext: Created meal object with imageUri:', newMeal.imageUri);
      
      // Сначала сохраняем локально
      await saveMeal(newMeal);
      
      // Пытаемся сохранить на сервер
      try {
        // Для сервера отправляем только ID изображения, а не путь к файлу
        let imageId: string | undefined = undefined;
        if (newMeal.imageUri) {
          // Извлекаем ID из пути к файлу (например, из file:///path/image-123.jpg получаем image-123)
          const fileName = newMeal.imageUri.split('/').pop();
          imageId = fileName?.split('.')[0] || undefined;
          console.log('MealsContext: Extracted image ID for server:', imageId);
          
          // Сохраняем соответствие ID изображения и локального пути
          if (imageId) {
            await saveImageMapping(imageId, newMeal.imageUri);
          }
        } else {
          console.log('MealsContext: No imageUri found, sending without image');
        }
        
        const response = await apiClient.createMeal({
          name: newMeal.name,
          calories: newMeal.calories,
          protein: newMeal.protein,
          carbs: newMeal.carbs,
          fat: newMeal.fat,
          imageUri: imageId, // Отправляем только ID изображения
          comment: newMeal.comment,
          date: newMeal.date,
        });
        
        console.log('MealsContext: Sent to server:', {
          name: newMeal.name,
          imageUri: imageId,
          comment: newMeal.comment
        });
        
        if (response.success && response.data) {
          console.log('Meal saved to server');
          console.log('MealsContext: Server response data:', response.data);
          // Обновляем ID с сервера если нужно
          newMeal.id = response.data.id;
          await saveMeal(newMeal);
        }
      } catch (error) {
        console.log('Failed to save meal to server, keeping local copy:', error);
      }
      
      // Update local state
      const updatedMeals = [...meals, newMeal];
      setMeals(updatedMeals);
      updateDerivedState(updatedMeals);
    } catch (error) {
      console.error('Error adding meal:', error);
    }
  };

  // Get meals by specific date
  const fetchMealsByDate = async (date: string) => {
    try {
      return await getMealsByDate(date);
    } catch (error) {
      console.error('Error getting meals by date:', error);
      return [];
    }
  };

  // Remove a meal
  const removeMeal = async (id: string) => {
    try {
      // Сначала удаляем локально
      await deleteMeal(id);

      // Пытаемся удалить на сервере
      try {
        await apiClient.deleteMeal(id);
        console.log('Meal deleted from server');
      } catch (error) {
        console.log('Failed to delete meal from server:', error);
      }
      
      // Update local state
      const updatedMeals = meals.filter(meal => meal.id !== id);
      setMeals(updatedMeals);
      updateDerivedState(updatedMeals);
    } catch (error) {
      console.error('Error removing meal:', error);
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (id: string) => {
    try {
      const mealToUpdate = meals.find(meal => meal.id === id);
      if (!mealToUpdate) return;

      const updatedMeal = { ...mealToUpdate, isFavorite: !mealToUpdate.isFavorite };
      
      // Сначала обновляем локально
      await saveMeal(updatedMeal);

      // Пытаемся обновить на сервере
      try {
        await apiClient.updateMeal(id, { isFavorite: updatedMeal.isFavorite || false });
        console.log('Meal favorite status updated on server');
      } catch (error) {
        console.log('Failed to update favorite status on server:', error);
      }
      
      // Update local state
      const updatedMeals = meals.map(meal => 
        meal.id === id ? updatedMeal : meal
      );
      
      setMeals(updatedMeals);
      updateDerivedState(updatedMeals);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Add meal from favorite
  const addMealFromFavorite = async (favoriteMeal: Meal) => {
    try {
      const now = new Date();
      const newMeal: Meal = {
        ...favoriteMeal,
        id: uuidv4(),
        date: format(now, 'yyyy-MM-dd'),
        timestamp: now.getTime(),
        isFavorite: false, // Don't mark the new instance as favorite
      };
      
      // Сначала сохраняем локально
      await saveMeal(newMeal);

      // Пытаемся сохранить на сервер
      try {
        // Для сервера отправляем только ID изображения, а не путь к файлу
        let imageId: string | undefined = undefined;
        if (newMeal.imageUri) {
          // Извлекаем ID из пути к файлу (например, из file:///path/image-123.jpg получаем image-123)
          const fileName = newMeal.imageUri.split('/').pop();
          imageId = fileName?.split('.')[0] || undefined;
        }
        
        // Подготавливаем данные для сервера
        const serverData: any = {
          name: newMeal.name,
          calories: newMeal.calories,
          protein: newMeal.protein,
          carbs: newMeal.carbs,
          fat: newMeal.fat,
          comment: newMeal.comment,
          date: newMeal.date,
        };
        
        // Добавляем imageUri только если он не пустой
        if (imageId) {
          serverData.imageUri = imageId;
        }
        
        const response = await apiClient.createMeal(serverData);
        
        if (response.success && response.data) {
          console.log('Favorite meal saved to server');
          // Обновляем ID с сервера если нужно
          newMeal.id = response.data.id;
          await saveMeal(newMeal);
        }
      } catch (error) {
        console.log('Failed to save favorite meal to server:', error);
      }
      
      // Update local state
      const updatedMeals = [...meals, newMeal];
      setMeals(updatedMeals);
      updateDerivedState(updatedMeals);
    } catch (error) {
      console.error('Error adding meal from favorite:', error);
    }
  };

  // Refresh meals data
  const refreshMeals = async () => {
    await loadMeals();
  };

  // Clear meals for a new user
  const clearMealsForNewUser = () => {
    setMeals([]);
    setTodayMeals([]);
    setFavoriteMeals([]);
    setLoading(true);
  };

  return (
    <MealsContext.Provider 
      value={{ 
        meals, 
        todayMeals,
        favoriteMeals,
        loading, 
        addMeal, 
        getMealsByDate: fetchMealsByDate, 
        removeMeal,
        toggleFavorite,
        addMealFromFavorite,
        refreshMeals,
        clearMealsForNewUser
      }}
    >
      {children}
    </MealsContext.Provider>
  );
};

// Custom hook to use the MealsContext
export const useMeals = () => {
  const context = useContext(MealsContext);
  if (context === undefined) {
    throw new Error('useMeals must be used within a MealsProvider');
  }
  return context;
};