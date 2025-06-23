import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import i18n from '@/i18n';
import colors from '@/constants/colors';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.language && typeof params.language === 'string') {
      setLanguage(params.language);
      i18n.locale = params.language;
    } else {
      AsyncStorage.getItem('selectedLanguage').then((lang) => {
        if (lang) {
          setLanguage(lang);
          i18n.locale = lang;
        } else {
          setLanguage(i18n.locale || 'en');
        }
      });
    }
  }, [params.language]);

  const showSuccessNotification = () => {
    setShowSuccessMessage(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Автоматически скрываем через 2 секунды
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowSuccessMessage(false);
        router.replace('/(tabs)');
      });
    }, 2000);
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert(i18n.t('formError'));
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('https://snapcal.fun/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, language }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        await AsyncStorage.setItem('token', data.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
        showSuccessNotification();
      } else {
        Alert.alert(i18n.t('error') || 'Ошибка', data.error || 'Ошибка регистрации');
      }
    } catch (e) {
      Alert.alert(i18n.t('error') || 'Ошибка', 'Не удалось связаться с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      {showSuccessMessage && (
        <Animated.View style={[styles.successNotification, { opacity: fadeAnim }]}>
          <Text style={styles.successText}>{i18n.t('mealSaved')}</Text>
        </Animated.View>
      )}
      
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text style={styles.title}>{i18n.t('appName')}</Text>
          <Text style={styles.subtitle}>{i18n.t('welcome')}</Text>
          <Text style={{ textAlign: 'center', marginBottom: 8, color: '#888' }}>{i18n.t('currentLanguage')}: {language}</Text>
          <TextInput
            style={styles.input}
            placeholder={i18n.t('name') || 'Имя'}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            placeholder={i18n.t('email') || 'Email'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder={i18n.t('password') || 'Пароль'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? i18n.t('loading') || 'Загрузка...' : i18n.t('register') || 'Зарегистрироваться'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.link} onPress={() => router.replace('/login')}>
            <Text style={styles.linkText}>{i18n.t('alreadyHaveAccount') || 'Уже есть аккаунт? Войти'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: colors.primary[400],
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
    color: colors.neutral[600],
  },
  input: {
    borderWidth: 1,
    borderColor: colors.primary[400],
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  button: {
    backgroundColor: colors.primary[400],
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    alignItems: 'center',
    marginTop: 8,
  },
  linkText: {
    color: colors.primary[400],
    fontSize: 16,
  },
}); 