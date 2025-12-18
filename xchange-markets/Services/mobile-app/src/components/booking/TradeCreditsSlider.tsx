// ============================================
// Trade Credits Slider Component
// ============================================

import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

import { theme } from '../../constants/theme';
import { useSettingsStore } from '../../store/settingsStore';

interface TradeCreditsSliderProps {
  maxCredits: number;
  selectedAmount: number;
  onAmountChange: (amount: number) => void;
  availableCredits: number;
  isRTL: boolean;
}

export default function TradeCreditsSlider({
  maxCredits,
  selectedAmount,
  onAmountChange,
  availableCredits,
  isRTL,
}: TradeCreditsSliderProps) {
  const { t } = useTranslation();
  const { isDarkMode } = useSettingsStore();

  const [inputValue, setInputValue] = useState(selectedAmount.toString());

  useEffect(() => {
    setInputValue(selectedAmount.toString());
  }, [selectedAmount]);

  const handleSliderChange = (value: number) => {
    const roundedValue = Math.round(value);
    onAmountChange(roundedValue);
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    const numValue = parseInt(text) || 0;
    if (numValue >= 0 && numValue <= maxCredits) {
      onAmountChange(numValue);
    }
  };

  const handleInputBlur = () => {
    const numValue = parseInt(inputValue) || 0;
    const clampedValue = Math.min(Math.max(numValue, 0), maxCredits);
    onAmountChange(clampedValue);
    setInputValue(clampedValue.toString());
  };

  const handleQuickSelect = (percentage: number) => {
    const value = Math.round(maxCredits * (percentage / 100));
    onAmountChange(value);
  };

  const styles = createStyles(isDarkMode, isRTL);

  return (
    <View style={styles.container}>
      {/* Credits Info */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <Ionicons name="wallet" size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{t('tradeCredits.available')}</Text>
            <Text style={styles.infoValue}>
              {availableCredits.toLocaleString()} {t('common.credits')}
            </Text>
          </View>
        </View>
        <View style={styles.maxUsableContainer}>
          <Text style={styles.maxUsableLabel}>{t('tradeCredits.maxUsable')}</Text>
          <Text style={styles.maxUsableValue}>
            {maxCredits.toLocaleString()} {t('common.credits')}
          </Text>
        </View>
      </View>

      {/* Slider */}
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>{t('tradeCredits.useCredits')}</Text>

        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={maxCredits}
          value={selectedAmount}
          onValueChange={handleSliderChange}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.border}
          thumbTintColor={theme.colors.primary}
          step={1}
        />

        <View style={styles.sliderLabels}>
          <Text style={styles.sliderMinMax}>0</Text>
          <Text style={styles.sliderMinMax}>{maxCredits.toLocaleString()}</Text>
        </View>
      </View>

      {/* Manual Input */}
      <View style={styles.inputContainer}>
        <TextInput
          mode="outlined"
          value={inputValue}
          onChangeText={handleInputChange}
          onBlur={handleInputBlur}
          keyboardType="numeric"
          style={styles.input}
          outlineColor={theme.colors.border}
          activeOutlineColor={theme.colors.primary}
          right={<TextInput.Affix text={t('common.credits')} />}
        />
      </View>

      {/* Quick Select Buttons */}
      <View style={styles.quickSelectContainer}>
        <Text style={styles.quickSelectLabel}>{t('tradeCredits.quickSelect')}</Text>
        <View style={styles.quickSelectButtons}>
          {[25, 50, 75, 100].map((percentage) => (
            <Button
              key={percentage}
              mode={selectedAmount === Math.round(maxCredits * (percentage / 100)) ? 'contained' : 'outlined'}
              compact
              style={styles.quickSelectButton}
              labelStyle={styles.quickSelectButtonLabel}
              onPress={() => handleQuickSelect(percentage)}
            >
              {percentage}%
            </Button>
          ))}
        </View>
      </View>

      {/* Savings Preview */}
      {selectedAmount > 0 && (
        <View style={styles.savingsContainer}>
          <Ionicons name="pricetag" size={16} color={theme.colors.success} />
          <Text style={styles.savingsText}>
            {isRTL
              ? `ستوفر ${selectedAmount.toLocaleString()} جنيه باستخدام رصيد التبادل`
              : `You'll save ${selectedAmount.toLocaleString()} EGP using Trade Credits`}
          </Text>
        </View>
      )}
    </View>
  );
}

const createStyles = (isDarkMode: boolean, isRTL: boolean) =>
  StyleSheet.create({
    container: {
      gap: theme.spacing.md,
    },
    infoCard: {
      backgroundColor: theme.colors.primaryLight + '15',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.primary + '30',
    },
    infoRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: isRTL ? 0 : theme.spacing.md,
      marginLeft: isRTL ? theme.spacing.md : 0,
    },
    infoContent: {
      flex: 1,
      alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    infoLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
    },
    infoValue: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.primary,
    },
    maxUsableContainer: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.primary + '30',
    },
    maxUsableLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
    },
    maxUsableValue: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
    },
    sliderContainer: {
      marginTop: theme.spacing.sm,
    },
    sliderLabel: {
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
      textAlign: isRTL ? 'right' : 'left',
      marginBottom: theme.spacing.sm,
    },
    slider: {
      width: '100%',
      height: 40,
      transform: isRTL ? [{ scaleX: -1 }] : [],
    },
    sliderLabels: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
    },
    sliderMinMax: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
    },
    inputContainer: {
      alignItems: 'center',
    },
    input: {
      width: 200,
      textAlign: 'center',
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
    },
    quickSelectContainer: {
      marginTop: theme.spacing.sm,
    },
    quickSelectLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
      textAlign: isRTL ? 'right' : 'left',
      marginBottom: theme.spacing.sm,
    },
    quickSelectButtons: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    quickSelectButton: {
      flex: 1,
    },
    quickSelectButtonLabel: {
      fontSize: theme.typography.fontSize.sm,
    },
    savingsContainer: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.success + '15',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    savingsText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.success,
    },
  });
