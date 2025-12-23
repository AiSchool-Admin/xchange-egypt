// ============================================
// Section Header Component
// ============================================

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../../constants/theme';
import { useSettingsStore } from '../../store/settingsStore';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
  showSeeAll?: boolean;
}

export default function SectionHeader({
  title,
  subtitle,
  onSeeAll,
  showSeeAll = true,
}: SectionHeaderProps) {
  const { t } = useTranslation();
  const { isDarkMode, language } = useSettingsStore();
  const isRTL = language === 'ar';

  const styles = createStyles(isDarkMode, isRTL);

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {showSeeAll && onSeeAll && (
        <Pressable style={styles.seeAllButton} onPress={onSeeAll}>
          <Text style={styles.seeAllText}>{t('common.seeAll')}</Text>
          <Ionicons
            name={isRTL ? 'chevron-back' : 'chevron-forward'}
            size={16}
            color={theme.colors.primary}
          />
        </Pressable>
      )}
    </View>
  );
}

const createStyles = (isDarkMode: boolean, isRTL: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    textContainer: {
      flex: 1,
      alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    title: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    seeAllButton: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 4,
    },
    seeAllText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.primary,
    },
  });
