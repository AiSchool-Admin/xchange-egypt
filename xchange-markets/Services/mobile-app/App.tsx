// ============================================
// Xchange Services Marketplace - Main App Entry
// ============================================

import React, { useEffect, useCallback } from 'react';
import { StatusBar, LogBox, I18nManager, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import * as Notifications from 'expo-notifications';
import Toast from 'react-native-toast-message';

import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store/authStore';
import { useSettingsStore } from './src/store/settingsStore';
import { initializeI18n } from './src/i18n';
import { socketService } from './src/services/socket';
import { toastConfig } from './src/components/common/ToastConfig';
import { theme } from './src/constants/theme';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Sending `onAnimatedValueUpdate` with no listeners registered',
]);

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes (previously cacheTime)
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Custom fonts to load
const customFonts = {
  'Cairo-Regular': require('./src/assets/fonts/Cairo-Regular.ttf'),
  'Cairo-Medium': require('./src/assets/fonts/Cairo-Medium.ttf'),
  'Cairo-SemiBold': require('./src/assets/fonts/Cairo-SemiBold.ttf'),
  'Cairo-Bold': require('./src/assets/fonts/Cairo-Bold.ttf'),
  'Cairo-Light': require('./src/assets/fonts/Cairo-Light.ttf'),
};

export default function App() {
  const [appIsReady, setAppIsReady] = React.useState(false);
  const { initializeAuth, isAuthenticated, user } = useAuthStore();
  const { isDarkMode, language, setLanguage } = useSettingsStore();

  // Prepare app resources
  useEffect(() => {
    async function prepare() {
      try {
        // Initialize i18n
        await initializeI18n();

        // Load fonts
        await Font.loadAsync(customFonts);

        // Initialize authentication (check stored tokens)
        await initializeAuth();

        // Set RTL for Arabic
        const isRTL = language === 'ar';
        if (I18nManager.isRTL !== isRTL) {
          I18nManager.forceRTL(isRTL);
          I18nManager.allowRTL(isRTL);
        }

        // Connect to WebSocket if authenticated
        if (isAuthenticated && user) {
          socketService.connect(user.id);
        }

        // Request notification permissions
        await requestNotificationPermissions();
      } catch (error) {
        console.warn('Error preparing app:', error);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Request notification permissions
  const requestNotificationPermissions = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B35',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  };

  // Hide splash screen when ready
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  // Paper theme configuration
  const paperTheme = isDarkMode
    ? {
        ...MD3DarkTheme,
        colors: {
          ...MD3DarkTheme.colors,
          primary: theme.colors.primary,
          secondary: theme.colors.secondary,
          background: theme.colors.backgroundDark,
          surface: theme.colors.surfaceDark,
        },
        fonts: {
          ...MD3DarkTheme.fonts,
          regular: { fontFamily: 'Cairo-Regular' },
          medium: { fontFamily: 'Cairo-Medium' },
          bold: { fontFamily: 'Cairo-Bold' },
        },
      }
    : {
        ...MD3LightTheme,
        colors: {
          ...MD3LightTheme.colors,
          primary: theme.colors.primary,
          secondary: theme.colors.secondary,
          background: theme.colors.background,
          surface: theme.colors.surface,
        },
        fonts: {
          ...MD3LightTheme.fonts,
          regular: { fontFamily: 'Cairo-Regular' },
          medium: { fontFamily: 'Cairo-Medium' },
          bold: { fontFamily: 'Cairo-Bold' },
        },
      };

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={paperTheme}>
          <SafeAreaProvider>
            <NavigationContainer
              theme={{
                dark: isDarkMode,
                colors: {
                  primary: theme.colors.primary,
                  background: isDarkMode ? theme.colors.backgroundDark : theme.colors.background,
                  card: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
                  text: isDarkMode ? theme.colors.textDark : theme.colors.text,
                  border: theme.colors.border,
                  notification: theme.colors.primary,
                },
              }}
            >
              <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={isDarkMode ? theme.colors.backgroundDark : theme.colors.background}
              />
              <RootNavigator />
              <Toast config={toastConfig} />
            </NavigationContainer>
          </SafeAreaProvider>
        </PaperProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
