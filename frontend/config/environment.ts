import Constants from 'expo-constants';

// Определяем окружение
const ENV = Constants.expoConfig?.extra?.ENV || 'development';

// Конфигурация для разных окружений
const config = {
  development: {
    API_URL: 'http://192.168.0.101:3333',
    WEB_URL: 'http://192.168.0.101:3333',
    ENV: 'development'
  },
  production: {
    API_URL: 'https://snapcal.fun',
    WEB_URL: 'https://snapcal.fun',
    ENV: 'production'
  }
};

// Экспортируем конфигурацию для текущего окружения
export const environment = config[ENV as keyof typeof config] || config.development;

// Переменные окружения для Expo
export const EXPO_PUBLIC_API_URL = environment.API_URL;
export const EXPO_PUBLIC_WEB_URL = environment.WEB_URL; 