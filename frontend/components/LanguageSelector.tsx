import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Language } from '../types';
import i18n from '../i18n';
import colors from '../constants/colors';

type LanguageSelectorProps = {
  selectedLanguage: Language;
  onSelectLanguage: (language: Language) => void;
};

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelectLanguage,
}) => {
  const languages: { code: Language; name: string; nativeName: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t('selectLanguage')}</Text>
      
      <View style={styles.languageGrid}>
        {languages.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageButton,
              selectedLanguage === language.code && styles.selectedLanguage,
            ]}
            onPress={() => onSelectLanguage(language.code)}
          >
            <Text 
              style={[
                styles.languageName,
                selectedLanguage === language.code && styles.selectedLanguageText,
              ]}
            >
              {language.nativeName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral[800],
    marginBottom: 24,
    textAlign: 'center',
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: -8,
  },
  languageButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    margin: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.white,
    minWidth: 120,
    alignItems: 'center',
  },
  selectedLanguage: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  languageName: {
    fontSize: 16,
    color: colors.neutral[800],
  },
  selectedLanguageText: {
    color: colors.white,
    fontWeight: '600',
  },
});

export default LanguageSelector;