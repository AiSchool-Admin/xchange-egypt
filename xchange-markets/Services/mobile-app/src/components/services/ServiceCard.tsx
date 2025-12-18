// ============================================
// Service Card Component
// ============================================

import React from 'react';
import { View, StyleSheet, Pressable, Image, ViewStyle } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { theme, verificationLevelConfig } from '../../constants/theme';
import { useSettingsStore } from '../../store/settingsStore';
import StarRating from '../common/StarRating';

interface ServiceCardProps {
  service: {
    id: string;
    title: string;
    titleAr: string;
    images: string[];
    basePrice: number;
    rating: number;
    reviewCount: number;
    duration: number;
    expressAvailable?: boolean;
    provider?: {
      id: string;
      businessName: string;
      businessNameAr: string;
      avatar: string;
      verificationLevel: string;
    };
    category?: {
      name: string;
      nameAr: string;
    };
  };
  onPress: () => void;
  style?: ViewStyle;
  horizontal?: boolean;
}

export default function ServiceCard({ service, onPress, style, horizontal = false }: ServiceCardProps) {
  const { t } = useTranslation();
  const { isDarkMode, language } = useSettingsStore();
  const isRTL = language === 'ar';

  const verificationConfig = verificationLevelConfig[
    service.provider?.verificationLevel as keyof typeof verificationLevelConfig
  ];

  const styles = createStyles(isDarkMode, isRTL, horizontal);

  if (horizontal) {
    return (
      <Pressable style={[styles.horizontalContainer, style]} onPress={onPress}>
        <Image
          source={{ uri: service.images?.[0] }}
          style={styles.horizontalImage}
          resizeMode="cover"
        />
        <View style={styles.horizontalContent}>
          <View style={styles.categoryRow}>
            <Chip
              mode="outlined"
              style={styles.categoryChip}
              textStyle={styles.categoryChipText}
              compact
            >
              {isRTL ? service.category?.nameAr : service.category?.name}
            </Chip>
            {service.expressAvailable && (
              <View style={styles.expressBadge}>
                <Ionicons name="flash" size={12} color="#fff" />
              </View>
            )}
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {isRTL ? service.titleAr : service.title}
          </Text>

          <View style={styles.ratingRow}>
            <StarRating rating={service.rating} size={14} />
            <Text style={styles.ratingText}>
              {service.rating?.toFixed(1)} ({service.reviewCount})
            </Text>
          </View>

          <View style={styles.bottomRow}>
            <Text style={styles.price}>
              {service.basePrice.toLocaleString()} {t('common.egp')}
            </Text>
            <View style={styles.duration}>
              <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.durationText}>{service.duration} {t('common.min')}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable style={[styles.container, style]} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: service.images?.[0] }}
          style={styles.image}
          resizeMode="cover"
        />
        {service.expressAvailable && (
          <View style={styles.expressTag}>
            <Ionicons name="flash" size={14} color="#fff" />
            <Text style={styles.expressText}>{t('service.express')}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* Provider Info */}
        {service.provider && (
          <View style={styles.providerRow}>
            <Image
              source={
                service.provider.avatar
                  ? { uri: service.provider.avatar }
                  : require('../../assets/images/default-avatar.png')
              }
              style={styles.providerAvatar}
            />
            <Text style={styles.providerName} numberOfLines={1}>
              {isRTL ? service.provider.businessNameAr : service.provider.businessName}
            </Text>
            <Ionicons
              name={verificationConfig?.icon as any}
              size={14}
              color={verificationConfig?.color}
            />
          </View>
        )}

        <Text style={styles.title} numberOfLines={2}>
          {isRTL ? service.titleAr : service.title}
        </Text>

        <View style={styles.ratingRow}>
          <StarRating rating={service.rating} size={14} />
          <Text style={styles.ratingText}>
            {service.rating?.toFixed(1)} ({service.reviewCount})
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.price}>
            {service.basePrice.toLocaleString()} {t('common.egp')}
          </Text>
          <View style={styles.duration}>
            <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.durationText}>{service.duration} {t('common.min')}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (isDarkMode: boolean, isRTL: boolean, horizontal: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    horizontalContainer: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    imageContainer: {
      position: 'relative',
      aspectRatio: 16 / 10,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    horizontalImage: {
      width: 120,
      height: '100%',
    },
    expressTag: {
      position: 'absolute',
      top: theme.spacing.sm,
      left: isRTL ? undefined : theme.spacing.sm,
      right: isRTL ? theme.spacing.sm : undefined,
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
      gap: 4,
    },
    expressText: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: '#fff',
    },
    content: {
      padding: theme.spacing.md,
    },
    horizontalContent: {
      flex: 1,
      padding: theme.spacing.md,
      justifyContent: 'space-between',
    },
    categoryRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    categoryChip: {
      height: 24,
      borderColor: theme.colors.primary,
    },
    categoryChipText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.primary,
    },
    expressBadge: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    providerRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },
    providerAvatar: {
      width: 20,
      height: 20,
      borderRadius: 10,
    },
    providerName: {
      flex: 1,
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textSecondary,
    },
    title: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
      textAlign: isRTL ? 'right' : 'left',
      marginBottom: theme.spacing.xs,
    },
    ratingRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    ratingText: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
    },
    bottomRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    price: {
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.primary,
    },
    duration: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 4,
    },
    durationText: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
    },
  });
