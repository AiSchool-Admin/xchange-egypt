// ============================================
// Payment Method Selector Component
// ============================================

import React from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { Text, RadioButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../../constants/theme';
import { useSettingsStore } from '../../store/settingsStore';

interface PaymentMethod {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  type: 'card' | 'wallet' | 'cash' | 'fawry' | 'instapay';
  enabled: boolean;
  description?: string;
  descriptionAr?: string;
}

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selectedId: string;
  onSelect: (id: string) => void;
  isRTL: boolean;
}

const paymentIcons: Record<string, any> = {
  card: 'card-outline',
  wallet: 'wallet-outline',
  cash: 'cash-outline',
  fawry: 'qr-code-outline',
  instapay: 'phone-portrait-outline',
};

export default function PaymentMethodSelector({
  methods,
  selectedId,
  onSelect,
  isRTL,
}: PaymentMethodSelectorProps) {
  const { t } = useTranslation();
  const { isDarkMode } = useSettingsStore();

  const styles = createStyles(isDarkMode, isRTL);

  return (
    <View style={styles.container}>
      {methods.map((method) => {
        const isSelected = selectedId === method.id;

        return (
          <Pressable
            key={method.id}
            style={[styles.methodCard, isSelected && styles.methodCardSelected]}
            onPress={() => onSelect(method.id)}
            disabled={!method.enabled}
          >
            <RadioButton.Android
              value={method.id}
              status={isSelected ? 'checked' : 'unchecked'}
              onPress={() => onSelect(method.id)}
              color={theme.colors.primary}
              disabled={!method.enabled}
            />

            <View style={styles.iconContainer}>
              <Ionicons
                name={paymentIcons[method.type] || 'card-outline'}
                size={24}
                color={method.enabled ? theme.colors.primary : theme.colors.textSecondary}
              />
            </View>

            <View style={styles.methodInfo}>
              <Text
                style={[
                  styles.methodName,
                  !method.enabled && styles.methodNameDisabled,
                ]}
              >
                {isRTL ? method.nameAr : method.name}
              </Text>
              {method.description && (
                <Text style={styles.methodDescription}>
                  {isRTL ? method.descriptionAr : method.description}
                </Text>
              )}
            </View>

            {!method.enabled && (
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>{t('common.comingSoon')}</Text>
              </View>
            )}
          </Pressable>
        );
      })}

      {/* Security Notice */}
      <View style={styles.securityNotice}>
        <Ionicons name="lock-closed" size={16} color={theme.colors.success} />
        <Text style={styles.securityText}>{t('payment.securityNotice')}</Text>
      </View>
    </View>
  );
}

const createStyles = (isDarkMode: boolean, isRTL: boolean) =>
  StyleSheet.create({
    container: {
      gap: theme.spacing.md,
    },
    methodCard: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    methodCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight + '10',
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primaryLight + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: isRTL ? 0 : theme.spacing.md,
      marginLeft: isRTL ? theme.spacing.md : 0,
    },
    methodInfo: {
      flex: 1,
      alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    methodName: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
    },
    methodNameDisabled: {
      color: theme.colors.textSecondary,
    },
    methodDescription: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    comingSoonBadge: {
      backgroundColor: theme.colors.warning + '20',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
      marginLeft: isRTL ? 0 : theme.spacing.sm,
      marginRight: isRTL ? theme.spacing.sm : 0,
    },
    comingSoonText: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.warning,
    },
    securityNotice: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    securityText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.success,
    },
  });
