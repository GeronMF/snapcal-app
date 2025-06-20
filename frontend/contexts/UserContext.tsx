import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserContextType, Language } from '../types';
import { calculateDailyCalories } from '../utils/calorieCalculator';
import i18n from '../i18n';

const STORAGE_KEY = '@user_data';

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEY);
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setUserData = async (data: Partial<User>) => {
    try {
      const updatedUser = { ...user, ...data };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser as User);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const updateLanguage = async (language: Language) => {
    i18n.locale = language;
    await setUserData({ language });
  };

  const calculateTargetCalories = () => {
    if (!user?.age || !user?.gender || !user?.height || !user?.weight || !user?.activityLevel) {
      return 2000; // Default value if user data is incomplete
    }

    const baseCalories = calculateDailyCalories(
      user.age,
      user.gender,
      user.weight,
      user.height,
      user.activityLevel
    );

    // Adjust calories based on goal
    switch (user.goal) {
      case 'lose':
        return Math.round(baseCalories * 0.85); // 15% deficit
      case 'gain':
        return Math.round(baseCalories * 1.15); // 15% surplus
      default:
        return baseCalories; // maintain
    }
  };

  return (
    <UserContext.Provider value={{ user, setUserData, updateLanguage, calculateTargetCalories }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}