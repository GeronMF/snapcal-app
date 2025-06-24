import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import i18n from '@/i18n';
import colors from '@/constants/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const router = useRouter();

  useEffect(() => {
    // Проверяем, есть ли уже токен
    checkAuthStatus();
    // Загружаем выбранный язык
    loadLanguage();
  }, []);

  const showSuccessNotification = () => {
    setShowSuccessMessage(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Автоматически скрываем и переходим через 1.5 секунды
    setTimeout(() => {
      setShowSuccessMessage(false);
      // Проверяем данные пользователя для определения куда переходить
      AsyncStorage.getItem('user').then(userData => {
        if (userData) {
          const user = JSON.parse(userData);
          // Проверяем activityLevel и activity_level для совместимости
          if (!user.age || !user.height || !user.weight || (!user.activityLevel && !user.activity_level) || !user.goal) {
            router.replace('/profile-setup');
          } else {
            router.replace('/(tabs)');
          }
        } else {
          router.replace('/(tabs)');
        }
      });
    }, 1500);
  };

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.log('Error checking auth status:', error);
    }
  };

  const loadLanguage = async () => {
    try {
      const lang = await AsyncStorage.getItem('selectedLanguage');
      if (lang) {
        setLanguage(lang);
        i18n.locale = lang;
      } else {
        setLanguage(i18n.locale || 'en');
      }
    } catch (error) {
      console.log('Error loading language:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(i18n.t('error'), i18n.t('formError'));
      return;
    }
    setLoading(true);
    try {
      console.log('Отправка запроса логина...');
      const response = await fetch('https://snapcal.fun/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      console.log('Ответ сервера:', data);
      
      if (response.ok && data.success) {
        console.log('Сохранение токена и данных пользователя...');
        await AsyncStorage.setItem('token', data.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
        
        console.log('Данные пользователя сохранены, показываем уведомление...');
        showSuccessNotification();
      } else {
        console.log('Ошибка логина:', data.error);
        Alert.alert(i18n.t('error'), data.error || i18n.t('loginError'));
      }
    } catch (e) {
      console.log('Ошибка сети:', e);
      Alert.alert(i18n.t('error'), i18n.t('serverError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {showSuccessMessage && (
        <Animated.View style={[styles.successNotification, { opacity: fadeAnim }]}>
          <Text style={styles.successText}>{i18n.t('loginSuccess')}</Text>
        </Animated.View>
      )}
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>{i18n.t('login')}</Text>
          <Text style={{ textAlign: 'center', marginBottom: 24, color: '#888' }}>{i18n.t('currentLanguage')}: {language}</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={i18n.t('email')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={i18n.t('password')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin} 
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? i18n.t('loading') : i18n.t('signIn')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.link} 
            onPress={() => router.replace('/register')}
          >
            <Text style={styles.linkText}>{i18n.t('noAccount')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  successNotification: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: colors.success[500] || '#10B981',
    padding: 16,
    borderRadius: 12,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  successText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: colors.primary[400],
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.primary[400],
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: colors.white,
    color: '#333',
  },
  button: {
    backgroundColor: colors.primary[400],
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.primary[400],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#FFB088',
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  link: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: colors.primary[400],
    fontSize: 16,
    fontWeight: '500',
  },
}); 