// ============================================
// Settings Store - User Preferences
// ============================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';

export type Language = 'ar' | 'en';

interface SettingsState {
  // State
  language: Language;
  isDarkMode: boolean;
  notificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  biometricEnabled: boolean;
  locationEnabled: boolean;
  defaultGovernorate: string | null;
  defaultCity: string | null;

  // Actions
  setLanguage: (language: Language) => void;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setPushNotificationsEnabled: (enabled: boolean) => void;
  setEmailNotificationsEnabled: (enabled: boolean) => void;
  setSmsNotificationsEnabled: (enabled: boolean) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setLocationEnabled: (enabled: boolean) => void;
  setDefaultLocation: (governorate: string | null, city: string | null) => void;
  resetSettings: () => void;
}

const initialState = {
  language: 'ar' as Language,
  isDarkMode: false,
  notificationsEnabled: true,
  pushNotificationsEnabled: true,
  emailNotificationsEnabled: true,
  smsNotificationsEnabled: true,
  biometricEnabled: false,
  locationEnabled: true,
  defaultGovernorate: null,
  defaultCity: null,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setLanguage: (language: Language) => {
        i18n.changeLanguage(language);
        set({ language });
      },

      toggleDarkMode: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }));
      },

      setDarkMode: (enabled: boolean) => {
        set({ isDarkMode: enabled });
      },

      setNotificationsEnabled: (enabled: boolean) => {
        set({ notificationsEnabled: enabled });
      },

      setPushNotificationsEnabled: (enabled: boolean) => {
        set({ pushNotificationsEnabled: enabled });
      },

      setEmailNotificationsEnabled: (enabled: boolean) => {
        set({ emailNotificationsEnabled: enabled });
      },

      setSmsNotificationsEnabled: (enabled: boolean) => {
        set({ smsNotificationsEnabled: enabled });
      },

      setBiometricEnabled: (enabled: boolean) => {
        set({ biometricEnabled: enabled });
      },

      setLocationEnabled: (enabled: boolean) => {
        set({ locationEnabled: enabled });
      },

      setDefaultLocation: (governorate: string | null, city: string | null) => {
        set({ defaultGovernorate: governorate, defaultCity: city });
      },

      resetSettings: () => {
        set(initialState);
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Selector hooks
export const useLanguage = () => useSettingsStore((state) => state.language);
export const useIsDarkMode = () => useSettingsStore((state) => state.isDarkMode);
