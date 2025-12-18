// ============================================
// i18n Configuration - Arabic & English
// ============================================

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ar from './translations/ar';
import en from './translations/en';

const LANGUAGE_STORAGE_KEY = 'user_language';

export const initializeI18n = async () => {
  // Try to get saved language preference
  let savedLanguage: string | null = null;
  try {
    savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch (error) {
    console.warn('Error reading saved language:', error);
  }

  // Default to Arabic, fallback to device locale
  const defaultLanguage = savedLanguage ||
    (Localization.locale?.startsWith('en') ? 'en' : 'ar');

  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        ar: { translation: ar },
        en: { translation: en },
      },
      lng: defaultLanguage,
      fallbackLng: 'ar',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });

  return i18n;
};

// Save language preference
export const setLanguage = async (language: 'ar' | 'en') => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

export default i18n;
