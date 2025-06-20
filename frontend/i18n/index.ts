import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import { Language } from '../types';

import en from './translations/en';
import es from './translations/es';
import pl from './translations/pl';
import ru from './translations/ru';
import uk from './translations/uk';

// Create i18n instance
const i18n = new I18n({
  en,
  es,
  pl,
  ru,
  uk
});

// Set default locale
i18n.defaultLocale = 'en';

// Set fallback locale for missing translations
i18n.enableFallback = true;

// Get device locale for initial setting
const deviceLocale = Localization.locale.split('-')[0] as Language;

// Use device locale if available, otherwise use English
const supportedLocales = ['en', 'es', 'pl', 'ru', 'uk'];
i18n.locale = supportedLocales.includes(deviceLocale) ? deviceLocale : 'en';

export default i18n;

// Helper function to change the language
export function changeLanguage(language: Language): void {
  if (['en', 'es', 'pl', 'ru', 'uk'].includes(language)) {
    i18n.locale = language;
  }
}

// Helper function to get the current language
export function getCurrentLanguage(): Language {
  return i18n.locale as Language;
}