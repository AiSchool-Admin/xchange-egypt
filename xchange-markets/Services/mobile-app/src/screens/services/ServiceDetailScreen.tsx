// ============================================
// Service Detail Screen - Full Service View
// ============================================

import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
  Image,
  Share,
} from 'react-native';
import { Text, Button, Chip, Divider, IconButton, Portal, Modal } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import Carousel from 'react-native-reanimated-carousel';

import { theme, verificationLevelConfig, protectLevelConfig } from '../../constants/theme';
import { useSettingsStore } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';
import { servicesApi } from '../../services/api/services';
import { bookingsApi } from '../../services/api/bookings';

import LoadingScreen from '../../components/common/LoadingScreen';
import ErrorScreen from '../../components/common/ErrorScreen';
import StarRating from '../../components/common/StarRating';
import ReviewCard from '../../components/services/ReviewCard';
import AddOnItem from '../../components/booking/AddOnItem';
import PackageCard from '../../components/booking/PackageCard';

const { width, height } = Dimensions.get('window');

export default function ServiceDetailScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const queryClient = useQueryClient();
  const { serviceId } = route.params;

  const { isDarkMode, language } = useSettingsStore();
  const { user, isAuthenticated } = useAuthStore();
  const isRTL = language === 'ar';

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPackagesModal, setShowPackagesModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  // Fetch service details
  const {
    data: service,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => servicesApi.getService(serviceId),
  });

  // Fetch reviews
  const { data: reviews } = useQuery({
    queryKey: ['serviceReviews', serviceId],
    queryFn: () => bookingsApi.getServiceReviews(serviceId, { limit: 5 }),
    enabled: !!serviceId,
  });

  // Check if favorited
  const { data: favoriteStatus } = useQuery({
    queryKey: ['favorite', serviceId],
    queryFn: () => servicesApi.checkFavorite(serviceId),
    enabled: isAuthenticated,
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: () =>
      favoriteStatus?.isFavorite
        ? servicesApi.removeFromFavorites(serviceId)
        : servicesApi.addToFavorites(serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${isRTL ? service?.data?.titleAr : service?.data?.title} - ${t('share.checkOut')}`,
        url: `https://xchange.eg/services/${serviceId}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    toggleFavoriteMutation.mutate();
  };

  const handleBook = () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('BookingFlow', {
      serviceId,
      selectedPackage,
      selectedAddOns,
    });
  };

  const handleProviderPress = () => {
    navigation.navigate('ProviderProfile', { providerId: service?.data?.provider?.id });
  };

  const handleAllReviews = () => {
    navigation.navigate('AllReviews', { serviceId });
  };

  const handleChat = () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('ChatRoom', {
      providerId: service?.data?.provider?.id,
      serviceId,
    });
  };

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addOnId)
        ? prev.filter((id) => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  const calculateTotal = useCallback(() => {
    if (!service?.data) return 0;

    let total = selectedPackage?.price || service.data.basePrice;

    selectedAddOns.forEach((addOnId) => {
      const addOn = service.data.addOns?.find((a: any) => a.id === addOnId);
      if (addOn) {
        total += addOn.price;
      }
    });

    return total;
  }, [service, selectedPackage, selectedAddOns]);

  const styles = createStyles(isDarkMode, isRTL);

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen onRetry={refetch} />;
  if (!service?.data) return <ErrorScreen message={t('errors.serviceNotFound')} />;

  const serviceData = service.data;
  const provider = serviceData.provider;
  const verificationConfig = verificationLevelConfig[provider?.verificationLevel as keyof typeof verificationLevelConfig];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.carouselContainer}>
          <Carousel
            width={width}
            height={height * 0.4}
            data={serviceData.images || []}
            onSnapToItem={setCurrentImageIndex}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.carouselImage} resizeMode="cover" />
            )}
          />

          {/* Header Buttons */}
          <View style={styles.headerButtons}>
            <IconButton
              icon="arrow-back"
              iconColor="#fff"
              size={24}
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
            />
            <View style={styles.headerRightButtons}>
              <IconButton
                icon={favoriteStatus?.isFavorite ? 'heart' : 'heart-outline'}
                iconColor={favoriteStatus?.isFavorite ? theme.colors.error : '#fff'}
                size={24}
                style={styles.headerButton}
                onPress={handleToggleFavorite}
              />
              <IconButton
                icon="share-outline"
                iconColor="#fff"
                size={24}
                style={styles.headerButton}
                onPress={handleShare}
              />
            </View>
          </View>

          {/* Image Pagination */}
          <View style={styles.pagination}>
            {serviceData.images?.map((_: any, index: number) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentImageIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Category & Express Badge */}
          <View style={styles.badgesRow}>
            <Chip
              mode="outlined"
              style={styles.categoryChip}
              textStyle={styles.categoryChipText}
            >
              {isRTL ? serviceData.category?.nameAr : serviceData.category?.name}
            </Chip>
            {serviceData.expressAvailable && (
              <Chip
                mode="flat"
                style={styles.expressChip}
                icon={() => <Ionicons name="flash" size={14} color="#fff" />}
              >
                {t('service.express')}
              </Chip>
            )}
          </View>

          {/* Title & Price */}
          <Text style={styles.title}>
            {isRTL ? serviceData.titleAr : serviceData.title}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {serviceData.basePrice.toLocaleString()} {t('common.egp')}
            </Text>
            {serviceData.pricingType !== 'FIXED' && (
              <Text style={styles.pricingType}>
                / {t(`pricing.${serviceData.pricingType.toLowerCase()}`)}
              </Text>
            )}
          </View>

          {/* Rating & Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <StarRating rating={serviceData.rating} size={18} />
              <Text style={styles.statText}>
                {serviceData.rating?.toFixed(1)} ({serviceData.reviewCount})
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Ionicons name="time-outline" size={18} color={theme.colors.textSecondary} />
              <Text style={styles.statText}>
                {serviceData.duration} {t('common.minutes')}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Ionicons name="checkmark-circle-outline" size={18} color={theme.colors.success} />
              <Text style={styles.statText}>
                {serviceData.completedCount} {t('service.completed')}
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Provider Card */}
          <Pressable style={styles.providerCard} onPress={handleProviderPress}>
            <Image
              source={
                provider?.avatar
                  ? { uri: provider.avatar }
                  : require('../../assets/images/default-avatar.png')
              }
              style={styles.providerAvatar}
            />
            <View style={styles.providerInfo}>
              <View style={styles.providerNameRow}>
                <Text style={styles.providerName}>
                  {isRTL ? provider?.businessNameAr : provider?.businessName}
                </Text>
                <Ionicons
                  name={verificationConfig?.icon as any}
                  size={16}
                  color={verificationConfig?.color}
                />
              </View>
              <View style={styles.providerStats}>
                <StarRating rating={provider?.rating} size={14} />
                <Text style={styles.providerRating}>
                  {provider?.rating?.toFixed(1)} ({provider?.reviewCount})
                </Text>
              </View>
              <Text style={styles.verificationLabel}>
                {isRTL ? verificationConfig?.label.ar : verificationConfig?.label.en}
              </Text>
            </View>
            <IconButton
              icon="chatbubble-outline"
              iconColor={theme.colors.primary}
              size={24}
              onPress={handleChat}
            />
          </Pressable>

          <Divider style={styles.divider} />

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('service.description')}</Text>
            <Text style={styles.description}>
              {isRTL ? serviceData.descriptionAr : serviceData.description}
            </Text>
          </View>

          {/* Packages */}
          {serviceData.packages && serviceData.packages.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('service.packages')}</Text>
              {serviceData.packages.map((pkg: any, index: number) => (
                <PackageCard
                  key={pkg.id || index}
                  package={pkg}
                  isSelected={selectedPackage?.id === pkg.id}
                  onSelect={() => setSelectedPackage(pkg)}
                  isRTL={isRTL}
                />
              ))}
            </View>
          )}

          {/* Add-ons */}
          {serviceData.addOns && serviceData.addOns.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('service.addOns')}</Text>
              {serviceData.addOns.map((addOn: any, index: number) => (
                <AddOnItem
                  key={addOn.id || index}
                  addOn={addOn}
                  isSelected={selectedAddOns.includes(addOn.id)}
                  onToggle={() => toggleAddOn(addOn.id)}
                  isRTL={isRTL}
                />
              ))}
            </View>
          )}

          {/* Requirements */}
          {serviceData.requirements && serviceData.requirements.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('service.requirements')}</Text>
              {serviceData.requirements.map((req: string, index: number) => (
                <View key={index} style={styles.requirementItem}>
                  <Ionicons name="checkmark" size={20} color={theme.colors.success} />
                  <Text style={styles.requirementText}>{req}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Xchange Protect */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('service.xchangeProtect')}</Text>
            <View style={styles.protectInfo}>
              <Ionicons name="shield-checkmark" size={24} color={theme.colors.success} />
              <View style={styles.protectText}>
                <Text style={styles.protectTitle}>{t('protect.title')}</Text>
                <Text style={styles.protectSubtitle}>{t('protect.subtitle')}</Text>
              </View>
            </View>
            <View style={styles.protectOptions}>
              {Object.entries(protectLevelConfig).map(([key, config]) => {
                if (key === 'NONE') return null;
                return (
                  <View key={key} style={styles.protectOption}>
                    <View style={[styles.protectDot, { backgroundColor: config.color }]} />
                    <Text style={styles.protectOptionText}>
                      {isRTL ? config.label.ar : config.label.en}
                      {config.percentage > 0 && ` (+${config.percentage}%)`}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* FAQs */}
          {serviceData.faqs && serviceData.faqs.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('service.faqs')}</Text>
              {serviceData.faqs.map((faq: any, index: number) => (
                <View key={index} style={styles.faqItem}>
                  <Text style={styles.faqQuestion}>
                    {isRTL ? faq.questionAr : faq.question}
                  </Text>
                  <Text style={styles.faqAnswer}>
                    {isRTL ? faq.answerAr : faq.answer}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Reviews */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {t('service.reviews')} ({serviceData.reviewCount})
              </Text>
              {reviews?.data && reviews.data.length > 0 && (
                <Pressable onPress={handleAllReviews}>
                  <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
                </Pressable>
              )}
            </View>

            {reviews?.data && reviews.data.length > 0 ? (
              reviews.data.slice(0, 3).map((review: any) => (
                <ReviewCard key={review.id} review={review} isRTL={isRTL} />
              ))
            ) : (
              <Text style={styles.noReviews}>{t('service.noReviews')}</Text>
            )}
          </View>

          {/* Related Services */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('service.related')}</Text>
            {/* Add related services carousel here */}
          </View>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Bottom Booking Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>{t('booking.total')}</Text>
          <Text style={styles.totalPrice}>
            {calculateTotal().toLocaleString()} {t('common.egp')}
          </Text>
        </View>
        <Button
          mode="contained"
          style={styles.bookButton}
          labelStyle={styles.bookButtonLabel}
          onPress={handleBook}
        >
          {t('booking.bookNow')}
        </Button>
      </View>
    </View>
  );
}

const createStyles = (isDarkMode: boolean, isRTL: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? theme.colors.backgroundDark : theme.colors.background,
    },
    carouselContainer: {
      position: 'relative',
    },
    carouselImage: {
      width: '100%',
      height: '100%',
    },
    headerButtons: {
      position: 'absolute',
      top: 50,
      left: 0,
      right: 0,
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.sm,
    },
    headerRightButtons: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
    },
    headerButton: {
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    pagination: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
    },
    paginationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255,255,255,0.5)',
    },
    paginationDotActive: {
      backgroundColor: '#fff',
      width: 24,
    },
    content: {
      padding: theme.spacing.md,
      backgroundColor: isDarkMode ? theme.colors.backgroundDark : theme.colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      marginTop: -24,
    },
    badgesRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    categoryChip: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.primary,
    },
    categoryChipText: {
      color: theme.colors.primary,
      fontSize: theme.typography.fontSize.sm,
    },
    expressChip: {
      backgroundColor: theme.colors.primary,
    },
    title: {
      fontSize: theme.typography.fontSize.xxl,
      fontFamily: theme.typography.fontFamily.bold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
      textAlign: isRTL ? 'right' : 'left',
    },
    priceRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'baseline',
      marginTop: theme.spacing.sm,
    },
    price: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.primary,
    },
    pricingType: {
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
      marginLeft: isRTL ? 0 : 4,
      marginRight: isRTL ? 4 : 0,
    },
    statsRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      marginTop: theme.spacing.md,
    },
    stat: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 4,
    },
    statText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textSecondary,
    },
    statDivider: {
      width: 1,
      height: 16,
      backgroundColor: theme.colors.border,
      marginHorizontal: theme.spacing.md,
    },
    divider: {
      marginVertical: theme.spacing.lg,
    },
    providerCard: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.sm,
    },
    providerAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
    },
    providerInfo: {
      flex: 1,
      marginLeft: isRTL ? 0 : theme.spacing.md,
      marginRight: isRTL ? theme.spacing.md : 0,
      alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    providerNameRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 6,
    },
    providerName: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
    },
    providerStats: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 4,
    },
    providerRating: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
    },
    verificationLabel: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.primary,
      marginTop: 2,
    },
    section: {
      marginTop: theme.spacing.lg,
    },
    sectionHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
      textAlign: isRTL ? 'right' : 'left',
      marginBottom: theme.spacing.sm,
    },
    seeAll: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.primary,
    },
    description: {
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.regular,
      color: isDarkMode ? theme.colors.textSecondaryDark : theme.colors.textSecondary,
      lineHeight: 24,
      textAlign: isRTL ? 'right' : 'left',
    },
    requirementItem: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    requirementText: {
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.regular,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
    },
    protectInfo: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.success + '10',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
    },
    protectText: {
      marginLeft: isRTL ? 0 : theme.spacing.md,
      marginRight: isRTL ? theme.spacing.md : 0,
      alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    protectTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.success,
    },
    protectSubtitle: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
    },
    protectOptions: {
      gap: theme.spacing.sm,
    },
    protectOption: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    protectDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    protectOptionText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
    },
    faqItem: {
      marginBottom: theme.spacing.md,
    },
    faqQuestion: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
      textAlign: isRTL ? 'right' : 'left',
    },
    faqAnswer: {
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
      marginTop: 4,
      textAlign: isRTL ? 'right' : 'left',
    },
    noReviews: {
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      paddingVertical: theme.spacing.lg,
    },
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
      padding: theme.spacing.md,
      paddingBottom: 34,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      ...theme.shadows.lg,
    },
    totalContainer: {
      alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    totalLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
    },
    totalPrice: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
    },
    bookButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.full,
    },
    bookButtonLabel: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
  });
