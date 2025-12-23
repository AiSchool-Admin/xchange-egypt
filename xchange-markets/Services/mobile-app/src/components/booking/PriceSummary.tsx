// ============================================
// Price Summary Component
// ============================================

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

import { theme } from '../../constants/theme';
import { useSettingsStore } from '../../store/settingsStore';

interface PricingData {
  basePrice: number;
  addOnsTotal: number;
  subtotal: number;
  expressCharge: number;
  protectionCharge: number;
  total: number;
  tradeCreditsApplied: number;
  totalAfterCredits: number;
}

interface PriceSummaryProps {
  pricing: PricingData | null;
  isRTL: boolean;
  showDetails?: boolean;
}

export default function PriceSummary({ pricing, isRTL, showDetails = true }: PriceSummaryProps) {
  const { t } = useTranslation();
  const { isDarkMode } = useSettingsStore();

  const [expanded, setExpanded] = useState(false);
  const expandAnimation = useSharedValue(0);

  const toggleExpand = () => {
    setExpanded(!expanded);
    expandAnimation.value = withTiming(expanded ? 0 : 1, { duration: 300 });
  };

  const expandAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(expandAnimation.value, [0, 1], [0, 200]),
      opacity: expandAnimation.value,
    };
  });

  const arrowAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${interpolate(expandAnimation.value, [0, 1], [0, 180])}deg` },
      ],
    };
  });

  const styles = createStyles(isDarkMode, isRTL);

  if (!pricing) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('booking.priceSummary')}</Text>

      {/* Collapsible Details */}
      {showDetails && (
        <Pressable style={styles.expandHeader} onPress={toggleExpand}>
          <Text style={styles.expandText}>
            {expanded ? t('booking.hideDetails') : t('booking.showDetails')}
          </Text>
          <Animated.View style={arrowAnimatedStyle}>
            <Ionicons name="chevron-down" size={20} color={theme.colors.primary} />
          </Animated.View>
        </Pressable>
      )}

      <Animated.View style={[styles.detailsContainer, expandAnimatedStyle]}>
        {/* Base Price */}
        <View style={styles.row}>
          <Text style={styles.label}>{t('booking.basePrice')}</Text>
          <Text style={styles.value}>
            {pricing.basePrice.toLocaleString()} {t('common.egp')}
          </Text>
        </View>

        {/* Add-ons */}
        {pricing.addOnsTotal > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>{t('booking.addOns')}</Text>
            <Text style={styles.value}>
              +{pricing.addOnsTotal.toLocaleString()} {t('common.egp')}
            </Text>
          </View>
        )}

        {/* Express Charge */}
        {pricing.expressCharge > 0 && (
          <View style={styles.row}>
            <View style={styles.labelWithIcon}>
              <Ionicons name="flash" size={14} color={theme.colors.warning} />
              <Text style={styles.label}>{t('booking.expressCharge')}</Text>
            </View>
            <Text style={styles.valueHighlight}>
              +{pricing.expressCharge.toLocaleString()} {t('common.egp')}
            </Text>
          </View>
        )}

        {/* Protection Charge */}
        {pricing.protectionCharge > 0 && (
          <View style={styles.row}>
            <View style={styles.labelWithIcon}>
              <Ionicons name="shield-checkmark" size={14} color={theme.colors.success} />
              <Text style={styles.label}>{t('booking.protectionFee')}</Text>
            </View>
            <Text style={styles.value}>
              +{pricing.protectionCharge.toLocaleString()} {t('common.egp')}
            </Text>
          </View>
        )}

        <Divider style={styles.divider} />

        {/* Subtotal */}
        <View style={styles.row}>
          <Text style={styles.subtotalLabel}>{t('booking.subtotal')}</Text>
          <Text style={styles.subtotalValue}>
            {pricing.total.toLocaleString()} {t('common.egp')}
          </Text>
        </View>
      </Animated.View>

      {/* Trade Credits */}
      {pricing.tradeCreditsApplied > 0 && (
        <View style={styles.creditsRow}>
          <View style={styles.labelWithIcon}>
            <Ionicons name="wallet" size={16} color={theme.colors.primary} />
            <Text style={styles.creditsLabel}>{t('booking.tradeCredits')}</Text>
          </View>
          <Text style={styles.creditsValue}>
            -{pricing.tradeCreditsApplied.toLocaleString()} {t('common.egp')}
          </Text>
        </View>
      )}

      <Divider style={styles.totalDivider} />

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>{t('booking.total')}</Text>
        <View style={styles.totalValueContainer}>
          {pricing.tradeCreditsApplied > 0 && (
            <Text style={styles.originalPrice}>
              {pricing.total.toLocaleString()} {t('common.egp')}
            </Text>
          )}
          <Text style={styles.totalValue}>
            {pricing.totalAfterCredits.toLocaleString()} {t('common.egp')}
          </Text>
        </View>
      </View>

      {/* Savings Indicator */}
      {pricing.tradeCreditsApplied > 0 && (
        <View style={styles.savingsIndicator}>
          <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
          <Text style={styles.savingsText}>
            {isRTL
              ? `وفرت ${pricing.tradeCreditsApplied.toLocaleString()} جنيه`
              : `You're saving ${pricing.tradeCreditsApplied.toLocaleString()} EGP`}
          </Text>
        </View>
      )}
    </View>
  );
}

const createStyles = (isDarkMode: boolean, isRTL: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.sm,
    },
    title: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
      textAlign: isRTL ? 'right' : 'left',
      marginBottom: theme.spacing.sm,
    },
    expandHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.sm,
    },
    expandText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.primary,
    },
    detailsContainer: {
      overflow: 'hidden',
    },
    row: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    labelWithIcon: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    label: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
    },
    value: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
    },
    valueHighlight: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.warning,
    },
    divider: {
      marginVertical: theme.spacing.sm,
    },
    subtotalLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
    },
    subtotalValue: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
    },
    creditsRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.primary + '10',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginTop: theme.spacing.sm,
    },
    creditsLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.primary,
    },
    creditsValue: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.primary,
    },
    totalDivider: {
      marginVertical: theme.spacing.md,
      height: 2,
      backgroundColor: theme.colors.border,
    },
    totalRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    totalLabel: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
    },
    totalValueContainer: {
      alignItems: isRTL ? 'flex-start' : 'flex-end',
    },
    originalPrice: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
      textDecorationLine: 'line-through',
    },
    totalValue: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.primary,
    },
    savingsIndicator: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.md,
      backgroundColor: theme.colors.success + '15',
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    savingsText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.success,
    },
  });
