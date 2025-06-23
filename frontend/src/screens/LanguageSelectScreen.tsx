import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import i18n, { changeLanguage, getCurrentLanguage } from '@/i18n';
import colors from '@/constants/colors';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'uk', label: 'Українська' },
  { code: 'pl', label: 'Polski' },
  { code: 'es', label: 'Español' },
];

export default function LanguageSelectScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState('en');

  useEffect(() => {
    // Получаем текущий язык из i18n или AsyncStorage
    AsyncStorage.getItem('selectedLanguage').then((lang) => {
      if (lang) setSelected(lang);
      else setSelected(getCurrentLanguage() || 'en');
    });
  }, []);

  const handleSelect = async (lang: string) => {
    changeLanguage(lang as any);
    await AsyncStorage.setItem('selectedLanguage', lang);
    setSelected(lang);
    router.replace({ pathname: '/register', params: { language: lang } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Выберите язык / Select language</Text>
      {languages.map((lang) => {
        const isActive = selected === lang.code;
        return (
          <TouchableOpacity
            key={lang.code}
            style={[styles.button, isActive && styles.buttonActive]}
            onPress={() => handleSelect(lang.code)}
          >
            <Text style={[styles.buttonText, isActive && styles.buttonTextActive]}>{lang.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary[400],
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 16,
    minWidth: 200,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  buttonActive: {
    backgroundColor: colors.white,
    borderColor: colors.primary[400],
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '500',
  },
  buttonTextActive: {
    color: colors.primary[400],
    fontWeight: 'bold',
  },
}); 