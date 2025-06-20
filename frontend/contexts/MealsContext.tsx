import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Meal } from '../types';
import { getMeals, saveMeal, getMealsByDate, deleteMeal } from '../utils/storage';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

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

  // Load meals from storage
  const loadMeals = async () => {
    try {
      setLoading(true);
      const allMeals = await getMeals();
      setMeals(allMeals);
      
      // Filter for today's meals
      const today = format(new Date(), 'yyyy-MM-dd');
      const todaysMeals = allMeals.filter(meal => meal.date === today);
      setTodayMeals(todaysMeals);
      
      // Filter for favorite meals
      const favorites = allMeals.filter(meal => meal.isFavorite);
      setFavoriteMeals(favorites);
    } catch (error) {
      console.error('Error loading meals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add a new meal
  const addMeal = async (mealData: Omit<Meal, 'id' | 'date' | 'timestamp'>) => {
    try {
      const now = new Date();
      const newMeal: Meal = {
        id: uuidv4(),
        date: format(now, 'yyyy-MM-dd'),
        timestamp: now.getTime(),
        ...mealData
      };
      
      await saveMeal(newMeal);
      
      // Update local state
      setMeals(prevMeals => [...prevMeals, newMeal]);
      
      // Update today's meals if the new meal is from today
      const today = format(new Date(), 'yyyy-MM-dd');
      if (newMeal.date === today) {
        setTodayMeals(prevMeals => [...prevMeals, newMeal]);
      }
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
      await deleteMeal(id);
      
      // Update local state
      setMeals(prevMeals => prevMeals.filter(meal => meal.id !== id));
      setTodayMeals(prevMeals => prevMeals.filter(meal => meal.id !== id));
    } catch (error) {
      console.error('Error removing meal:', error);
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (id: string) => {
    try {
      const updatedMeals = meals.map(meal => 
        meal.id === id ? { ...meal, isFavorite: !meal.isFavorite } : meal
      );
      
      // Save to storage (this is simplified - you might want to save individually)
      await Promise.all(updatedMeals.map(meal => saveMeal(meal)));
      
      // Update local state
      setMeals(updatedMeals);
      
      // Update today's meals if needed
      const today = format(new Date(), 'yyyy-MM-dd');
      const todaysMeals = updatedMeals.filter(meal => meal.date === today);
      setTodayMeals(todaysMeals);
      
      // Update favorites
      const favorites = updatedMeals.filter(meal => meal.isFavorite);
      setFavoriteMeals(favorites);
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
      
      await saveMeal(newMeal);
      
      // Update local state
      setMeals(prevMeals => [...prevMeals, newMeal]);
      
      // Update today's meals
      const today = format(new Date(), 'yyyy-MM-dd');
      if (newMeal.date === today) {
        setTodayMeals(prevMeals => [...prevMeals, newMeal]);
      }
    } catch (error) {
      console.error('Error adding meal from favorite:', error);
    }
  };

  // Refresh meals data
  const refreshMeals = async () => {
    await loadMeals();
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
        refreshMeals
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