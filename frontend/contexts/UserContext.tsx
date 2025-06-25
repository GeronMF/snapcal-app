import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserContextType, Language } from '../types';
import { calculateDailyCalories } from '../utils/calorieCalculator';
import i18n from '../i18n';

const STORAGE_KEY = '@user_data';

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      console.log('UserContext: Starting to load user data...');
      const userData = await AsyncStorage.getItem('user');
      console.log('UserContext: Raw userData:', userData);
      
      if (userData) {
        const parsedData = JSON.parse(userData);
        console.log('UserContext: Parsed data:', parsedData);
        
        // Если данные во вложенном объекте user, извлекаем их
        const userDataToSet = parsedData.user || parsedData;
        console.log('UserContext: User data to set:', userDataToSet);
        
        // Преобразуем activity_level в activityLevel если нужно
        const normalizedData = {
          ...userDataToSet,
          activityLevel: userDataToSet.activityLevel || userDataToSet.activity_level
        };

        console.log('UserContext: Normalized data:', normalizedData);
        setUser(prevUser => {
          // Проверяем, действительно ли данные изменились
          if (JSON.stringify(prevUser) === JSON.stringify(normalizedData)) {
            console.log('UserContext: Data unchanged, keeping previous user');
            return prevUser; // Возвращаем тот же объект, чтобы избежать ре-рендера
          }
          console.log('UserContext: Setting new user data');
          return normalizedData;
        });
      } else {
        console.log('UserContext: No user data found');
        setUser(null);
      }
    } catch (error) {
      console.error('UserContext: Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const setUserData = useCallback(async (data: Partial<User>) => {
    try {
      const updatedUser = { ...user, ...data };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser as User);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }, [user]);

  const reloadUser = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  const updateLanguage = useCallback(async (language: Language) => {
    i18n.locale = language;
    await setUserData({ language });
  }, [setUserData]);

  const calculateTargetCalories = useCallback(() => {
    // Если у пользователя уже есть рассчитанная дневная норма калорий, используем её
    if (user?.dailyCalories) {
      return user.dailyCalories;
    }

    // Иначе рассчитываем на основе данных профиля
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
  }, [user]);

  const contextValue = useMemo(() => ({
    user,
    setUserData,
    updateLanguage,
    calculateTargetCalories,
    reloadUser
  }), [user, setUserData, updateLanguage, calculateTargetCalories, reloadUser]);

  return (
    <UserContext.Provider value={contextValue}>
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