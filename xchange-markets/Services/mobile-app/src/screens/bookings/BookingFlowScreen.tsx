// ============================================
// Booking Flow Screen - Multi-step Booking Process
// ============================================

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Text, Button, TextInput, RadioButton, Checkbox, Divider, IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { theme, protectLevelConfig } from '../../constants/theme';
import { PAYMENT_METHODS, EXPRESS_CONFIG } from '../../constants/config';
import { useSettingsStore } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';
import { servicesApi } from '../../services/api/services';
import { bookingsApi } from '../../services/api/bookings';

import LoadingScreen from '../../components/common/LoadingScreen';
import AddressSelector from '../../components/booking/AddressSelector';
import ProtectionSelector from '../../components/booking/ProtectionSelector';
import PaymentMethodSelector from '../../components/booking/PaymentMethodSelector';
import TradeCreditsSlider from '../../components/booking/TradeCreditsSlider';
import PriceSummary from '../../components/booking/PriceSummary';

const STEPS = ['datetime', 'address', 'options', 'payment', 'review'];

export default function BookingFlowScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { serviceId, selectedPackage, selectedAddOns = [] } = route.params;

  const { isDarkMode, language } = useSettingsStore();
  const { user } = useAuthStore();
  const isRTL = language === 'ar';

  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    scheduledDate: new Date(),
    scheduledTime: new Date(),
    isExpress: false,
    addressId: null as string | null,
    newAddress: null as any,
    protectionLevel: 'BASIC' as keyof typeof protectLevelConfig,
    notes: '',
    paymentMethod: 'card',
    tradeCreditsAmount: 0,
    selectedAddOns: selectedAddOns,
    selectedPackage: selectedPackage,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Fetch service details
  const { data: service, isLoading: serviceLoading } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => servicesApi.getService(serviceId),
  });

  // Fetch user addresses
  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => bookingsApi.getAddresses(),
  });

  // Fetch user wallet
  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => bookingsApi.getWallet(),
  });

  // Calculate price mutation
  const calculatePriceMutation = useMutation({
    mutationFn: (data: any) => bookingsApi.calculatePrice(data),
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (data: any) => bookingsApi.createBooking(data),
    onSuccess: (data) => {
      navigation.replace('BookingConfirmation', {
        bookingId: data.data.id,
        bookingNumber: data.data.bookingNumber,
      });
    },
    onError: (error: any) => {
      Alert.alert(
        t('errors.bookingFailed'),
        error.response?.data?.messageAr || error.response?.data?.message || t('errors.tryAgain')
      );
    },
  });

  // Calculate pricing whenever relevant data changes
  const pricingData = useMemo(() => {
    if (!service?.data) return null;

    const basePrice = bookingData.selectedPackage?.price || service.data.basePrice;
    let addOnsTotal = 0;

    bookingData.selectedAddOns.forEach((addOnId: string) => {
      const addOn = service.data.addOns?.find((a: any) => a.id === addOnId);
      if (addOn) addOnsTotal += addOn.price;
    });

    const subtotal = basePrice + addOnsTotal;

    // Express surcharge
    let expressCharge = 0;
    if (bookingData.isExpress) {
      expressCharge = subtotal * (EXPRESS_CONFIG.extraChargePercentage / 100);
      const isWeekend = [5, 6].includes(bookingData.scheduledDate.getDay());
      if (isWeekend) {
        expressCharge += subtotal * (EXPRESS_CONFIG.weekendExtraChargePercentage / 100);
      }
    }

    // Protection charge
    const protectConfig = protectLevelConfig[bookingData.protectionLevel];
    const protectionCharge = subtotal * ((protectConfig?.percentage || 0) / 100);

    const total = subtotal + expressCharge + protectionCharge;
    const totalAfterCredits = total - bookingData.tradeCreditsAmount;

    return {
      basePrice,
      addOnsTotal,
      subtotal,
      expressCharge,
      protectionCharge,
      total,
      tradeCreditsApplied: bookingData.tradeCreditsAmount,
      totalAfterCredits: Math.max(0, totalAfterCredits),
    };
  }, [service, bookingData]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBookingData((prev) => ({ ...prev, scheduledDate: selectedDate }));
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setBookingData((prev) => ({ ...prev, scheduledTime: selectedTime }));
    }
  };

  const updateBookingData = (key: string, value: any) => {
    setBookingData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = () => {
    const bookingPayload = {
      serviceId,
      scheduledDate: bookingData.scheduledDate.toISOString().split('T')[0],
      scheduledTime: bookingData.scheduledTime.toTimeString().slice(0, 5),
      isExpress: bookingData.isExpress,
      addressId: bookingData.addressId,
      newAddress: bookingData.newAddress,
      protectionLevel: bookingData.protectionLevel,
      notes: bookingData.notes,
      paymentMethod: bookingData.paymentMethod,
      tradeCreditsAmount: bookingData.tradeCreditsAmount,
      selectedAddOns: bookingData.selectedAddOns,
      packageId: bookingData.selectedPackage?.id,
    };

    createBookingMutation.mutate(bookingPayload);
  };

  const canProceed = useCallback(() => {
    switch (STEPS[currentStep]) {
      case 'datetime':
        return true;
      case 'address':
        return bookingData.addressId !== null || bookingData.newAddress !== null;
      case 'options':
        return true;
      case 'payment':
        return bookingData.paymentMethod !== null;
      case 'review':
        return true;
      default:
        return true;
    }
  }, [currentStep, bookingData]);

  const styles = createStyles(isDarkMode, isRTL);

  if (serviceLoading) return <LoadingScreen />;

  const serviceData = service?.data;
  const provider = serviceData?.provider;
  const maxCredits = Math.min(
    wallet?.data?.tradeCredits || 0,
    (pricingData?.total || 0) * 0.5 // Max 50% can be paid with credits
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <IconButton icon="arrow-back" onPress={handleBack} />
        <Text style={styles.headerTitle}>{t('booking.title')}</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {STEPS.map((step, index) => (
          <View key={step} style={styles.progressItem}>
            <View
              style={[
                styles.progressDot,
                index <= currentStep && styles.progressDotActive,
              ]}
            >
              {index < currentStep ? (
                <Ionicons name="checkmark" size={14} color="#fff" />
              ) : (
                <Text style={styles.progressNumber}>{index + 1}</Text>
              )}
            </View>
            {index < STEPS.length - 1 && (
              <View
                style={[
                  styles.progressLine,
                  index < currentStep && styles.progressLineActive,
                ]}
              />
            )}
          </View>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 1: Date & Time */}
        {currentStep === 0 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t('booking.selectDateTime')}</Text>

            {/* Express Toggle */}
            {serviceData?.expressAvailable && (
              <Pressable
                style={[
                  styles.expressCard,
                  bookingData.isExpress && styles.expressCardActive,
                ]}
                onPress={() => updateBookingData('isExpress', !bookingData.isExpress)}
              >
                <View style={styles.expressIconContainer}>
                  <Ionicons
                    name="flash"
                    size={24}
                    color={bookingData.isExpress ? '#fff' : theme.colors.primary}
                  />
                </View>
                <View style={styles.expressInfo}>
                  <Text
                    style={[
                      styles.expressTitle,
                      bookingData.isExpress && styles.expressTitleActive,
                    ]}
                  >
                    {t('booking.express.title')}
                  </Text>
                  <Text style={styles.expressSubtitle}>
                    {t('booking.express.subtitle', { time: EXPRESS_CONFIG.responseTimeMinutes })}
                  </Text>
                </View>
                <Checkbox
                  status={bookingData.isExpress ? 'checked' : 'unchecked'}
                  color={bookingData.isExpress ? '#fff' : theme.colors.primary}
                />
              </Pressable>
            )}

            {/* Date Selection */}
            <View style={styles.dateTimeSection}>
              <Text style={styles.label}>{t('booking.date')}</Text>
              <Pressable
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.dateTimeText}>
                  {bookingData.scheduledDate.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </Pressable>
            </View>

            {/* Time Selection */}
            <View style={styles.dateTimeSection}>
              <Text style={styles.label}>{t('booking.time')}</Text>
              <Pressable
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.dateTimeText}>
                  {bookingData.scheduledTime.toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </Pressable>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={bookingData.scheduledDate}
                mode="date"
                display="spinner"
                minimumDate={new Date()}
                onChange={handleDateChange}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={bookingData.scheduledTime}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
              />
            )}
          </View>
        )}

        {/* Step 2: Address */}
        {currentStep === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t('booking.selectAddress')}</Text>
            <AddressSelector
              addresses={addresses?.data || []}
              selectedId={bookingData.addressId}
              onSelect={(id) => updateBookingData('addressId', id)}
              onAddNew={(address) => {
                updateBookingData('newAddress', address);
                updateBookingData('addressId', null);
              }}
              isRTL={isRTL}
            />
          </View>
        )}

        {/* Step 3: Options */}
        {currentStep === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t('booking.options')}</Text>

            {/* Xchange Protect */}
            <Text style={styles.sectionLabel}>{t('booking.xchangeProtect')}</Text>
            <ProtectionSelector
              selectedLevel={bookingData.protectionLevel}
              onSelect={(level) => updateBookingData('protectionLevel', level)}
              isRTL={isRTL}
            />

            {/* Notes */}
            <View style={styles.notesSection}>
              <Text style={styles.sectionLabel}>{t('booking.notes')}</Text>
              <TextInput
                mode="outlined"
                multiline
                numberOfLines={4}
                placeholder={t('booking.notesPlaceholder')}
                value={bookingData.notes}
                onChangeText={(text) => updateBookingData('notes', text)}
                style={styles.notesInput}
                outlineColor={theme.colors.border}
                activeOutlineColor={theme.colors.primary}
              />
            </View>
          </View>
        )}

        {/* Step 4: Payment */}
        {currentStep === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t('booking.payment')}</Text>

            {/* Trade Credits */}
            {maxCredits > 0 && (
              <View style={styles.creditsSection}>
                <Text style={styles.sectionLabel}>{t('booking.useTradeCredits')}</Text>
                <TradeCreditsSlider
                  maxCredits={maxCredits}
                  selectedAmount={bookingData.tradeCreditsAmount}
                  onAmountChange={(amount) => updateBookingData('tradeCreditsAmount', amount)}
                  availableCredits={wallet?.data?.tradeCredits || 0}
                  isRTL={isRTL}
                />
              </View>
            )}

            {/* Payment Methods */}
            <Text style={styles.sectionLabel}>{t('booking.paymentMethod')}</Text>
            <PaymentMethodSelector
              methods={PAYMENT_METHODS.filter((m) => m.enabled)}
              selectedId={bookingData.paymentMethod}
              onSelect={(id) => updateBookingData('paymentMethod', id)}
              isRTL={isRTL}
            />
          </View>
        )}

        {/* Step 5: Review */}
        {currentStep === 4 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t('booking.review')}</Text>

            {/* Service Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>{t('booking.serviceSummary')}</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('booking.service')}</Text>
                <Text style={styles.summaryValue}>
                  {isRTL ? serviceData?.titleAr : serviceData?.title}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('booking.provider')}</Text>
                <Text style={styles.summaryValue}>
                  {isRTL ? provider?.businessNameAr : provider?.businessName}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('booking.dateTime')}</Text>
                <Text style={styles.summaryValue}>
                  {bookingData.scheduledDate.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')} -{' '}
                  {bookingData.scheduledTime.toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              {bookingData.isExpress && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{t('booking.type')}</Text>
                  <View style={styles.expressBadge}>
                    <Ionicons name="flash" size={14} color="#fff" />
                    <Text style={styles.expressBadgeText}>{t('booking.express.badge')}</Text>
                  </View>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('booking.protection')}</Text>
                <Text style={styles.summaryValue}>
                  {isRTL
                    ? protectLevelConfig[bookingData.protectionLevel]?.label.ar
                    : protectLevelConfig[bookingData.protectionLevel]?.label.en}
                </Text>
              </View>
            </View>

            {/* Price Summary */}
            <PriceSummary pricing={pricingData} isRTL={isRTL} />

            {/* Terms */}
            <Text style={styles.termsText}>
              {t('booking.termsAgreement')}
            </Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        {pricingData && (
          <View style={styles.pricePreview}>
            <Text style={styles.pricePreviewLabel}>{t('booking.total')}</Text>
            <Text style={styles.pricePreviewValue}>
              {pricingData.totalAfterCredits.toLocaleString()} {t('common.egp')}
            </Text>
          </View>
        )}
        <Button
          mode="contained"
          style={styles.nextButton}
          labelStyle={styles.nextButtonLabel}
          onPress={currentStep === STEPS.length - 1 ? handleSubmit : handleNext}
          disabled={!canProceed()}
          loading={createBookingMutation.isPending}
        >
          {currentStep === STEPS.length - 1
            ? t('booking.confirmBooking')
            : t('common.continue')}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (isDarkMode: boolean, isRTL: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? theme.colors.backgroundDark : theme.colors.background,
    },
    header: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 50,
      paddingHorizontal: theme.spacing.sm,
      paddingBottom: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
    },
    progressContainer: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
    },
    progressItem: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
    },
    progressDot: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    progressDotActive: {
      backgroundColor: theme.colors.primary,
    },
    progressNumber: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.textSecondary,
    },
    progressLine: {
      width: 40,
      height: 2,
      backgroundColor: theme.colors.border,
    },
    progressLineActive: {
      backgroundColor: theme.colors.primary,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.md,
    },
    stepContent: {
      paddingTop: theme.spacing.md,
    },
    stepTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
      textAlign: isRTL ? 'right' : 'left',
      marginBottom: theme.spacing.lg,
    },
    expressCard: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 2,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.lg,
    },
    expressCardActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    expressIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primaryLight + '30',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: isRTL ? 0 : theme.spacing.md,
      marginLeft: isRTL ? theme.spacing.md : 0,
    },
    expressInfo: {
      flex: 1,
      alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    expressTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
    },
    expressTitleActive: {
      color: '#fff',
    },
    expressSubtitle: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
    },
    dateTimeSection: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.medium,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
      marginBottom: theme.spacing.sm,
      textAlign: isRTL ? 'right' : 'left',
    },
    dateTimeButton: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: theme.spacing.sm,
    },
    dateTimeText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
    },
    sectionLabel: {
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
      marginBottom: theme.spacing.md,
      textAlign: isRTL ? 'right' : 'left',
    },
    notesSection: {
      marginTop: theme.spacing.lg,
    },
    notesInput: {
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
      textAlign: isRTL ? 'right' : 'left',
    },
    creditsSection: {
      marginBottom: theme.spacing.lg,
    },
    summaryCard: {
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.lg,
    },
    summaryTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
      marginBottom: theme.spacing.md,
      textAlign: isRTL ? 'right' : 'left',
    },
    summaryRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    summaryLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
    },
    summaryValue: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
      maxWidth: '60%',
      textAlign: isRTL ? 'left' : 'right',
    },
    expressBadge: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
      gap: 4,
    },
    expressBadgeText: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: '#fff',
    },
    termsText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.md,
    },
    bottomBar: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
      padding: theme.spacing.md,
      paddingBottom: 34,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    pricePreview: {
      alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    pricePreviewLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
    },
    pricePreviewValue: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
    },
    nextButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.full,
    },
    nextButtonLabel: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
  });
