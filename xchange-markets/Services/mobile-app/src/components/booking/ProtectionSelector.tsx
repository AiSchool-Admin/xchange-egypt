// ============================================
// Protection Selector Component - Xchange Protect
// ============================================

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, RadioButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { theme, protectLevelConfig } from '../../constants/theme';
import { useSettingsStore } from '../../store/settingsStore';

type ProtectLevel = 'NONE' | 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ELITE';

interface ProtectionSelectorProps {
  selectedLevel: ProtectLevel;
  onSelect: (level: ProtectLevel) => void;
  isRTL: boolean;
}

export default function ProtectionSelector({
  selectedLevel,
  onSelect,
  isRTL,
}: ProtectionSelectorProps) {
  const { t } = useTranslation();
  const { isDarkMode } = useSettingsStore();

  const styles = createStyles(isDarkMode, isRTL);

  const protectionLevels: {
    key: ProtectLevel;
    icon: string;
    recommended?: boolean;
  }[] = [
    { key: 'NONE', icon: 'shield-outline' },
    { key: 'BASIC', icon: 'shield-checkmark-outline' },
    { key: 'STANDARD', icon: 'shield-checkmark', recommended: true },
    { key: 'PREMIUM', icon: 'shield' },
    { key: 'ELITE', icon: 'ribbon' },
  ];

  return (
    <View style={styles.container}>
      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={20} color={theme.colors.info} />
        <Text style={styles.infoText}>{t('protect.info')}</Text>
      </View>

      {/* Protection Options */}
      {protectionLevels.map((level) => {
        const config = protectLevelConfig[level.key];
        const isSelected = selectedLevel === level.key;

        return (
          <Pressable
            key={level.key}
            style={[
              styles.optionCard,
              isSelected && styles.optionCardSelected,
              { borderColor: isSelected ? config.color : theme.colors.border },
            ]}
            onPress={() => onSelect(level.key)}
          >
            <View style={styles.optionHeader}>
              <RadioButton.Android
                value={level.key}
                status={isSelected ? 'checked' : 'unchecked'}
                onPress={() => onSelect(level.key)}
                color={config.color}
              />
              <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
                <Ionicons name={level.icon as any} size={20} color={config.color} />
              </View>
              <View style={styles.optionInfo}>
                <View style={styles.optionTitleRow}>
                  <Text style={[styles.optionTitle, isSelected && { color: config.color }]}>
                    {isRTL ? config.label.ar : config.label.en}
                  </Text>
                  {level.recommended && (
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedText}>{t('common.recommended')}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.optionDuration}>
                  {config.days > 0
                    ? isRTL
                      ? `حماية ${config.days} يوم`
                      : `${config.days}-day protection`
                    : isRTL
                    ? 'بدون حماية'
                    : 'No protection'}
                </Text>
              </View>
              {config.percentage > 0 && (
                <View style={styles.percentageContainer}>
                  <Text style={[styles.percentageText, { color: config.color }]}>
                    +{config.percentage}%
                  </Text>
                </View>
              )}
            </View>

            {/* Features List */}
            {isSelected && level.key !== 'NONE' && (
              <View style={styles.featuresList}>
                {getFeatures(level.key, isRTL).map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color={config.color} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

function getFeatures(level: ProtectLevel, isRTL: boolean): string[] {
  const features: Record<ProtectLevel, { en: string[]; ar: string[] }> = {
    NONE: { en: [], ar: [] },
    BASIC: {
      en: ['14-day money-back guarantee', 'Basic dispute resolution', 'Email support'],
      ar: ['ضمان استرداد الأموال لمدة 14 يوم', 'حل النزاعات الأساسي', 'دعم بالبريد الإلكتروني'],
    },
    STANDARD: {
      en: [
        '30-day money-back guarantee',
        'Priority dispute resolution',
        'Phone & chat support',
        'Work quality guarantee',
      ],
      ar: [
        'ضمان استرداد الأموال لمدة 30 يوم',
        'حل النزاعات بالأولوية',
        'دعم هاتفي ومحادثة',
        'ضمان جودة العمل',
      ],
    },
    PREMIUM: {
      en: [
        '90-day money-back guarantee',
        'VIP dispute resolution',
        '24/7 dedicated support',
        'Full rework guarantee',
        'Damage coverage up to 10,000 EGP',
      ],
      ar: [
        'ضمان استرداد الأموال لمدة 90 يوم',
        'حل النزاعات VIP',
        'دعم مخصص على مدار الساعة',
        'ضمان إعادة العمل بالكامل',
        'تغطية الأضرار حتى 10,000 جنيه',
      ],
    },
    ELITE: {
      en: [
        '365-day money-back guarantee',
        'Instant dispute resolution',
        'Personal account manager',
        'Unlimited rework guarantee',
        'Full damage coverage',
        'Priority scheduling',
      ],
      ar: [
        'ضمان استرداد الأموال لمدة 365 يوم',
        'حل النزاعات الفوري',
        'مدير حساب شخصي',
        'ضمان إعادة العمل غير محدود',
        'تغطية الأضرار الكاملة',
        'أولوية في الجدولة',
      ],
    },
  };

  return isRTL ? features[level].ar : features[level].en;
}

const createStyles = (isDarkMode: boolean, isRTL: boolean) =>
  StyleSheet.create({
    container: {
      gap: theme.spacing.md,
    },
    infoBanner: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.info + '15',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
    },
    infoText: {
      flex: 1,
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.info,
      textAlign: isRTL ? 'right' : 'left',
    },
    optionCard: {
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    optionCardSelected: {
      backgroundColor: isDarkMode ? theme.colors.backgroundDark : theme.colors.background,
    },
    optionHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: isRTL ? 0 : theme.spacing.sm,
      marginLeft: isRTL ? theme.spacing.sm : 0,
    },
    optionInfo: {
      flex: 1,
      alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    optionTitleRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    optionTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
    },
    recommendedBadge: {
      backgroundColor: theme.colors.success + '20',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },
    recommendedText: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.success,
    },
    optionDuration: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    percentageContainer: {
      marginLeft: isRTL ? 0 : theme.spacing.md,
      marginRight: isRTL ? theme.spacing.md : 0,
    },
    percentageText: {
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.bold,
    },
    featuresList: {
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      gap: theme.spacing.sm,
    },
    featureItem: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    featureText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
    },
  });
