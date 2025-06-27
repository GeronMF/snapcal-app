import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import colors from '@/constants/colors';

export default function IndexRedirect() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Checking auth status...');
      
      // Проверяем наличие токена
      const token = await AsyncStorage.getItem('token');
      console.log('🔑 Token found:', token ? 'Yes' : 'No');
      
      // Проверяем наличие пользовательских данных
      const userData = await AsyncStorage.getItem('user');
      console.log('👤 User data found:', userData ? 'Yes' : 'No');
      
      if (token && userData) {
        // Пользователь авторизован, перенаправляем в основное приложение
        console.log('✅ User is authenticated, redirecting to main app');
        router.replace('/(tabs)');
      } else {
        // Пользователь не авторизован, перенаправляем на выбор языка
        console.log('❌ User not authenticated, redirecting to language selection');
        router.replace('/language');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // В случае ошибки перенаправляем на выбор языка
      router.replace('/language');
    } finally {
      setIsChecking(false);
    }
  };

  // Показываем индикатор загрузки пока проверяем авторизацию
  if (isChecking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary[400]} />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
}); 