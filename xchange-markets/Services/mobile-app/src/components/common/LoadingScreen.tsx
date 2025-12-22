// ============================================
// Loading Screen Component
// ============================================

import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';

import { theme } from '../../constants/theme';
import { useSettingsStore } from '../../store/settingsStore';

interface LoadingScreenProps {
  message?: string;
  showAnimation?: boolean;
}

export default function LoadingScreen({ message, showAnimation = true }: LoadingScreenProps) {
  const { t } = useTranslation();
  const { isDarkMode } = useSettingsStore();

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      {showAnimation ? (
        <LottieView
          source={require('../../assets/animations/loading.json')}
          autoPlay
          loop
          style={styles.animation}
        />
      ) : (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      )}
      <Text style={[styles.message, isDarkMode && styles.messageDark]}>
        {message || t('common.loading')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  containerDark: {
    backgroundColor: theme.colors.backgroundDark,
  },
  animation: {
    width: 150,
    height: 150,
  },
  message: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
  },
  messageDark: {
    color: theme.colors.textSecondaryDark,
  },
});
