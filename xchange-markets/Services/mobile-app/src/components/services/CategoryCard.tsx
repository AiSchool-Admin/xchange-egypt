// ============================================
// Category Card Component
// ============================================

import React from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '../../constants/theme';
import { useSettingsStore } from '../../store/settingsStore';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    nameAr: string;
    icon?: string;
    image?: string;
    serviceCount?: number;
    color?: string;
  };
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
}

export default function CategoryCard({ category, onPress, size = 'medium' }: CategoryCardProps) {
  const { isDarkMode, language } = useSettingsStore();
  const isRTL = language === 'ar';

  const styles = createStyles(isDarkMode, isRTL, size);

  const getGradientColors = () => {
    if (category.color) {
      return [category.color, category.color + 'CC'];
    }
    return [theme.colors.primary, theme.colors.primaryDark];
  };

  if (size === 'small') {
    return (
      <Pressable style={styles.smallContainer} onPress={onPress}>
        <View style={styles.smallIconContainer}>
          <Ionicons
            name={(category.icon as any) || 'grid'}
            size={24}
            color={theme.colors.primary}
          />
        </View>
        <Text style={styles.smallName} numberOfLines={2}>
          {isRTL ? category.nameAr : category.name}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable style={styles.container} onPress={onPress}>
      {category.image ? (
        <Image source={{ uri: category.image }} style={styles.image} resizeMode="cover" />
      ) : (
        <LinearGradient
          colors={getGradientColors() as [string, string]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons
            name={(category.icon as any) || 'grid'}
            size={size === 'large' ? 48 : 32}
            color="rgba(255,255,255,0.9)"
          />
        </LinearGradient>
      )}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {isRTL ? category.nameAr : category.name}
        </Text>
        {category.serviceCount !== undefined && (
          <Text style={styles.count}>
            {category.serviceCount} services
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const createStyles = (isDarkMode: boolean, isRTL: boolean, size: string) =>
  StyleSheet.create({
    container: {
      width: size === 'large' ? 160 : 120,
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    smallContainer: {
      width: 80,
      alignItems: 'center',
    },
    smallIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.primaryLight + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    smallName: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.medium,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
      textAlign: 'center',
    },
    image: {
      width: '100%',
      aspectRatio: 1,
    },
    gradient: {
      width: '100%',
      aspectRatio: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: theme.spacing.sm,
    },
    name: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
      textAlign: isRTL ? 'right' : 'left',
    },
    count: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
      marginTop: 2,
      textAlign: isRTL ? 'right' : 'left',
    },
  });
