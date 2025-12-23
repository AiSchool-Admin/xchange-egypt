// ============================================
// Home Screen - Main Discovery Screen
// ============================================

import React, { useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Pressable,
  Dimensions,
  I18nManager,
} from 'react-native';
import { Text, Searchbar, Avatar, Badge, IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '../../constants/theme';
import { SERVICE_CATEGORIES } from '../../constants/config';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { servicesApi } from '../../services/api/services';

import ServiceCard from '../../components/services/ServiceCard';
import CategoryCard from '../../components/services/CategoryCard';
import ProviderCard from '../../components/services/ProviderCard';
import PromoBanner from '../../components/common/PromoBanner';
import SectionHeader from '../../components/common/SectionHeader';
import LoadingScreen from '../../components/common/LoadingScreen';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { isDarkMode, language } = useSettingsStore();
  const isRTL = language === 'ar';

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => servicesApi.getCategories(),
  });

  // Fetch featured services
  const { data: featuredServices, isLoading: featuredLoading, refetch: refetchFeatured } = useQuery({
    queryKey: ['featuredServices'],
    queryFn: () => servicesApi.getFeaturedServices(),
  });

  // Fetch recommendations based on user's product purchases
  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => servicesApi.getRecommendations(),
    enabled: !!user,
  });

  // Fetch nearby providers
  const { data: nearbyProviders, isLoading: providersLoading } = useQuery({
    queryKey: ['nearbyProviders'],
    queryFn: () => servicesApi.searchServices({
      sortBy: 'distance',
      limit: 10,
    }),
  });

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchFeatured();
    setRefreshing(false);
  }, [refetchFeatured]);

  const handleSearch = () => {
    navigation.navigate('Search');
  };

  const handleCategoryPress = (categoryId: string) => {
    navigation.navigate('SearchResults', { categoryId });
  };

  const handleServicePress = (serviceId: string) => {
    navigation.navigate('ServiceDetail', { serviceId });
  };

  const handleProviderPress = (providerId: string) => {
    navigation.navigate('ProviderProfile', { providerId });
  };

  const handleAIChatbot = () => {
    navigation.navigate('AIChatbot');
  };

  const handleNotifications = () => {
    navigation.navigate('Notifications');
  };

  const styles = createStyles(isDarkMode, isRTL);

  if (categoriesLoading && featuredLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>
                {t('home.greeting', { name: user?.firstName || t('common.guest') })}
              </Text>
              <Text style={styles.subGreeting}>{t('home.subGreeting')}</Text>
            </View>
            <View style={styles.headerRight}>
              <IconButton
                icon="notifications-outline"
                iconColor="#fff"
                size={24}
                onPress={handleNotifications}
              />
              <Avatar.Image
                size={40}
                source={
                  user?.avatar
                    ? { uri: user.avatar }
                    : require('../../assets/images/default-avatar.png')
                }
              />
            </View>
          </View>

          {/* Search Bar */}
          <Pressable onPress={handleSearch} style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons
                name="search"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.searchIcon}
              />
              <Text style={styles.searchPlaceholder}>
                {t('home.searchPlaceholder')}
              </Text>
            </View>
          </Pressable>
        </LinearGradient>

        {/* AI Chatbot Quick Access */}
        <Pressable style={styles.aiChatbotBanner} onPress={handleAIChatbot}>
          <View style={styles.aiChatbotContent}>
            <View style={styles.aiChatbotIcon}>
              <Ionicons name="chatbubbles" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.aiChatbotText}>
              <Text style={styles.aiChatbotTitle}>{t('home.aiChatbot.title')}</Text>
              <Text style={styles.aiChatbotSubtitle}>{t('home.aiChatbot.subtitle')}</Text>
            </View>
          </View>
          <Ionicons
            name={isRTL ? 'chevron-back' : 'chevron-forward'}
            size={24}
            color={theme.colors.textSecondary}
          />
        </Pressable>

        {/* Promo Banners */}
        <PromoBanner />

        {/* Categories */}
        <View style={styles.section}>
          <SectionHeader
            title={t('home.categories')}
            onSeeAll={() => navigation.navigate('SearchTab')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories?.data?.map((category: any) => (
              <CategoryCard
                key={category.id}
                category={category}
                onPress={() => handleCategoryPress(category.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Smart Recommendations */}
        {recommendations?.data && recommendations.data.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title={t('home.recommendations')}
              subtitle={t('home.recommendationsSubtitle')}
              onSeeAll={() => navigation.navigate('SearchResults', { recommended: true })}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.servicesContainer}
            >
              {recommendations.data.map((service: any) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onPress={() => handleServicePress(service.id)}
                  style={styles.serviceCard}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Featured Services */}
        <View style={styles.section}>
          <SectionHeader
            title={t('home.featured')}
            onSeeAll={() => navigation.navigate('SearchResults', { featured: true })}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.servicesContainer}
          >
            {featuredServices?.data?.map((service: any) => (
              <ServiceCard
                key={service.id}
                service={service}
                onPress={() => handleServicePress(service.id)}
                style={styles.serviceCard}
              />
            ))}
          </ScrollView>
        </View>

        {/* Express Services */}
        <View style={styles.expressSection}>
          <LinearGradient
            colors={['#FF6B35', '#FF8A5C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.expressBanner}
          >
            <View style={styles.expressContent}>
              <Ionicons name="flash" size={32} color="#fff" />
              <View style={styles.expressText}>
                <Text style={styles.expressTitle}>{t('home.express.title')}</Text>
                <Text style={styles.expressSubtitle}>{t('home.express.subtitle')}</Text>
              </View>
            </View>
            <Pressable
              style={styles.expressButton}
              onPress={() => navigation.navigate('SearchResults', { express: true })}
            >
              <Text style={styles.expressButtonText}>{t('home.express.browse')}</Text>
            </Pressable>
          </LinearGradient>
        </View>

        {/* Marketplace Categories */}
        <View style={styles.section}>
          <SectionHeader
            title={t('home.marketplaceServices')}
            subtitle={t('home.marketplaceServicesSubtitle')}
          />
          <View style={styles.marketplaceGrid}>
            {Object.values(SERVICE_CATEGORIES).slice(0, 8).map((cat) => (
              <Pressable
                key={cat.id}
                style={styles.marketplaceItem}
                onPress={() => handleCategoryPress(cat.id)}
              >
                <View style={[styles.marketplaceIcon, { backgroundColor: theme.colors.primaryLight + '20' }]}>
                  <Ionicons name={cat.icon as any} size={24} color={theme.colors.primary} />
                </View>
                <Text style={styles.marketplaceName} numberOfLines={2}>
                  {isRTL ? cat.nameAr : cat.nameEn}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Nearby Providers */}
        <View style={styles.section}>
          <SectionHeader
            title={t('home.nearbyProviders')}
            onSeeAll={() => navigation.navigate('SearchResults', { sortBy: 'distance' })}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.providersContainer}
          >
            {nearbyProviders?.data?.map((provider: any) => (
              <ProviderCard
                key={provider.id}
                provider={provider.provider}
                onPress={() => handleProviderPress(provider.provider?.id)}
                style={styles.providerCard}
              />
            ))}
          </ScrollView>
        </View>

        {/* Xchange Protect Banner */}
        <View style={styles.section}>
          <Pressable style={styles.protectBanner}>
            <View style={styles.protectContent}>
              <View style={styles.protectIcon}>
                <Ionicons name="shield-checkmark" size={32} color={theme.colors.success} />
              </View>
              <View style={styles.protectText}>
                <Text style={styles.protectTitle}>{t('home.protect.title')}</Text>
                <Text style={styles.protectSubtitle}>{t('home.protect.subtitle')}</Text>
              </View>
            </View>
            <Text style={styles.protectLearnMore}>{t('common.learnMore')}</Text>
          </Pressable>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating AI Button */}
      <Pressable style={styles.floatingAIButton} onPress={handleAIChatbot}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.floatingAIGradient}
        >
          <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const createStyles = (isDarkMode: boolean, isRTL: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? theme.colors.backgroundDark : theme.colors.background,
    },
    header: {
      paddingTop: 60,
      paddingBottom: 30,
      paddingHorizontal: theme.spacing.md,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    headerTop: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    headerLeft: {
      alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    headerRight: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
    },
    greeting: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: '#fff',
    },
    subGreeting: {
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.regular,
      color: 'rgba(255,255,255,0.8)',
      marginTop: 4,
    },
    searchContainer: {
      marginTop: theme.spacing.sm,
    },
    searchBar: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm + 4,
    },
    searchIcon: {
      marginRight: isRTL ? 0 : theme.spacing.sm,
      marginLeft: isRTL ? theme.spacing.sm : 0,
    },
    searchPlaceholder: {
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
    },
    aiChatbotBanner: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      marginTop: -20,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.md,
    },
    aiChatbotContent: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
    },
    aiChatbotIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primaryLight + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: isRTL ? 0 : theme.spacing.md,
      marginLeft: isRTL ? theme.spacing.md : 0,
    },
    aiChatbotText: {
      alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    aiChatbotTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
    },
    aiChatbotSubtitle: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
    },
    section: {
      marginTop: theme.spacing.lg,
    },
    categoriesContainer: {
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    servicesContainer: {
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.md,
    },
    serviceCard: {
      width: width * 0.7,
    },
    providersContainer: {
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.md,
    },
    providerCard: {
      width: width * 0.5,
    },
    expressSection: {
      marginTop: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
    },
    expressBanner: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
    },
    expressContent: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
    },
    expressText: {
      marginLeft: isRTL ? 0 : theme.spacing.md,
      marginRight: isRTL ? theme.spacing.md : 0,
      alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    expressTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      color: '#fff',
    },
    expressSubtitle: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: 'rgba(255,255,255,0.9)',
    },
    expressButton: {
      backgroundColor: '#fff',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
    },
    expressButtonText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.primary,
    },
    marketplaceGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    marketplaceItem: {
      width: (width - theme.spacing.md * 2 - theme.spacing.sm * 3) / 4,
      alignItems: 'center',
      padding: theme.spacing.sm,
    },
    marketplaceIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    marketplaceName: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.medium,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
      textAlign: 'center',
    },
    protectBanner: {
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.success + '40',
    },
    protectContent: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
    },
    protectIcon: {
      marginRight: isRTL ? 0 : theme.spacing.md,
      marginLeft: isRTL ? theme.spacing.md : 0,
    },
    protectText: {
      flex: 1,
      alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    protectTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
    },
    protectSubtitle: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    protectLearnMore: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.success,
      marginTop: theme.spacing.sm,
      textAlign: isRTL ? 'right' : 'left',
    },
    floatingAIButton: {
      position: 'absolute',
      bottom: 90,
      right: isRTL ? undefined : 20,
      left: isRTL ? 20 : undefined,
      zIndex: 100,
    },
    floatingAIGradient: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.lg,
    },
  });
