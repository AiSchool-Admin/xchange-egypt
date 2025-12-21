// ============================================
// Provider Dashboard Screen
// ============================================

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Text, Card, ProgressBar, Badge, IconButton, Switch } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { theme, verificationLevelConfig, subscriptionTierConfig } from '../../constants/theme';
import { useSettingsStore } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';
import { providersApi } from '../../services/api/providers';

import LoadingScreen from '../../components/common/LoadingScreen';
import StatCard from '../../components/provider/StatCard';
import BookingItem from '../../components/provider/BookingItem';

const { width } = Dimensions.get('window');

export default function ProviderDashboardScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { isDarkMode, language } = useSettingsStore();
  const { user } = useAuthStore();
  const isRTL = language === 'ar';

  const [refreshing, setRefreshing] = React.useState(false);

  // Fetch provider profile
  const { data: provider, isLoading: providerLoading } = useQuery({
    queryKey: ['myProvider'],
    queryFn: () => providersApi.getMyProfile(),
  });

  // Fetch statistics
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['providerStats'],
    queryFn: () => providersApi.getStatistics({ period: '30' }),
  });

  // Fetch today's bookings
  const { data: todayBookings, refetch: refetchBookings } = useQuery({
    queryKey: ['todayBookings'],
    queryFn: () => providersApi.getBookings({
      status: 'CONFIRMED,IN_PROGRESS',
      date: new Date().toISOString().split('T')[0],
    }),
  });

  // Fetch pending bookings
  const { data: pendingBookings } = useQuery({
    queryKey: ['pendingBookings'],
    queryFn: () => providersApi.getBookings({ status: 'PENDING', limit: 5 }),
  });

  // Toggle express mode mutation
  const toggleExpressMutation = useMutation({
    mutationFn: (enabled: boolean) => providersApi.toggleExpressMode(enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProvider'] });
    },
  });

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchBookings()]);
    setRefreshing(false);
  }, [refetchStats, refetchBookings]);

  const styles = createStyles(isDarkMode, isRTL);

  if (providerLoading || statsLoading) return <LoadingScreen />;

  const providerData = provider?.data;
  const statsData = stats?.data;
  const verificationConfig = verificationLevelConfig[
    providerData?.verificationLevel as keyof typeof verificationLevelConfig
  ];
  const tierConfig = subscriptionTierConfig[
    providerData?.subscriptionTier as keyof typeof subscriptionTierConfig
  ];

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
            <View style={styles.profileInfo}>
              <Text style={styles.greeting}>
                {t('provider.greeting', { name: providerData?.businessName })}
              </Text>
              <View style={styles.verificationBadge}>
                <Ionicons
                  name={verificationConfig?.icon as any}
                  size={16}
                  color="#fff"
                />
                <Text style={styles.verificationText}>
                  {isRTL ? verificationConfig?.label.ar : verificationConfig?.label.en}
                </Text>
              </View>
            </View>
            <IconButton
              icon="notifications-outline"
              iconColor="#fff"
              size={24}
              onPress={() => navigation.navigate('Notifications')}
            />
          </View>

          {/* Express Mode Toggle */}
          <View style={styles.expressToggle}>
            <View style={styles.expressInfo}>
              <Ionicons name="flash" size={20} color="#fff" />
              <Text style={styles.expressLabel}>{t('provider.expressMode')}</Text>
            </View>
            <Switch
              value={providerData?.expressEnabled}
              onValueChange={(value) => toggleExpressMutation.mutate(value)}
              color="#fff"
            />
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="cash-outline"
            label={t('provider.todayEarnings')}
            value={`${statsData?.earnings?.today?.toLocaleString() || 0} ${t('common.egp')}`}
            trend={statsData?.earnings?.todayGrowth}
            color={theme.colors.success}
          />
          <StatCard
            icon="calendar-outline"
            label={t('provider.todayBookings')}
            value={todayBookings?.data?.length || 0}
            color={theme.colors.info}
          />
          <StatCard
            icon="star-outline"
            label={t('provider.rating')}
            value={providerData?.rating?.toFixed(1) || '0.0'}
            subtext={`(${providerData?.reviewCount || 0})`}
            color={theme.colors.star}
          />
          <StatCard
            icon="time-outline"
            label={t('provider.pending')}
            value={pendingBookings?.data?.length || 0}
            color={theme.colors.warning}
            onPress={() => navigation.navigate('ProviderBookings', { filter: 'PENDING' })}
          />
        </View>

        {/* Monthly Progress */}
        <Card style={styles.progressCard}>
          <Card.Content>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>{t('provider.monthlyProgress')}</Text>
              <Text style={styles.progressValue}>
                {statsData?.overview?.completedBookings || 0} / {statsData?.overview?.targetBookings || 50}
              </Text>
            </View>
            <ProgressBar
              progress={(statsData?.overview?.completedBookings || 0) / (statsData?.overview?.targetBookings || 50)}
              color={theme.colors.primary}
              style={styles.progressBar}
            />
            <Text style={styles.progressSubtext}>
              {t('provider.bookingsToGoal', {
                remaining: (statsData?.overview?.targetBookings || 50) - (statsData?.overview?.completedBookings || 0),
              })}
            </Text>
          </Card.Content>
        </Card>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('provider.todaySchedule')}</Text>
            <Pressable onPress={() => navigation.navigate('Calendar')}>
              <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
            </Pressable>
          </View>

          {todayBookings?.data && todayBookings.data.length > 0 ? (
            todayBookings.data.map((booking: any) => (
              <BookingItem
                key={booking.id}
                booking={booking}
                onPress={() => navigation.navigate('BookingDetail', { bookingId: booking.id })}
                isRTL={isRTL}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>{t('provider.noBookingsToday')}</Text>
            </View>
          )}
        </View>

        {/* Pending Requests */}
        {pendingBookings?.data && pendingBookings.data.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>{t('provider.pendingRequests')}</Text>
                <Badge style={styles.badge}>{pendingBookings.data.length}</Badge>
              </View>
              <Pressable onPress={() => navigation.navigate('ProviderBookings', { filter: 'PENDING' })}>
                <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
              </Pressable>
            </View>

            {pendingBookings.data.slice(0, 3).map((booking: any) => (
              <BookingItem
                key={booking.id}
                booking={booking}
                onPress={() => navigation.navigate('BookingDetail', { bookingId: booking.id })}
                showActions
                isRTL={isRTL}
              />
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('provider.quickActions')}</Text>
          <View style={styles.actionsGrid}>
            <Pressable
              style={styles.actionItem}
              onPress={() => navigation.navigate('AddService')}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.actionLabel}>{t('provider.addService')}</Text>
            </Pressable>

            <Pressable
              style={styles.actionItem}
              onPress={() => navigation.navigate('ProviderEarnings')}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.success + '20' }]}>
                <Ionicons name="wallet" size={24} color={theme.colors.success} />
              </View>
              <Text style={styles.actionLabel}>{t('provider.earnings')}</Text>
            </Pressable>

            <Pressable
              style={styles.actionItem}
              onPress={() => navigation.navigate('ProviderReviews')}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.star + '20' }]}>
                <Ionicons name="star" size={24} color={theme.colors.star} />
              </View>
              <Text style={styles.actionLabel}>{t('provider.reviews')}</Text>
            </Pressable>

            <Pressable
              style={styles.actionItem}
              onPress={() => navigation.navigate('Academy')}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.info + '20' }]}>
                <Ionicons name="school" size={24} color={theme.colors.info} />
              </View>
              <Text style={styles.actionLabel}>{t('provider.academy')}</Text>
            </Pressable>
          </View>
        </View>

        {/* Subscription Card */}
        <Pressable
          style={styles.subscriptionCard}
          onPress={() => navigation.navigate('ProviderSettings', { section: 'subscription' })}
        >
          <LinearGradient
            colors={[tierConfig?.color || theme.colors.primary, (tierConfig?.color || theme.colors.primary) + 'CC']}
            style={styles.subscriptionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.subscriptionContent}>
              <View>
                <Text style={styles.subscriptionLabel}>{t('provider.currentPlan')}</Text>
                <Text style={styles.subscriptionTier}>
                  {isRTL ? tierConfig?.label.ar : tierConfig?.label.en}
                </Text>
              </View>
              <View style={styles.subscriptionStats}>
                <Text style={styles.commissionLabel}>{t('provider.commission')}</Text>
                <Text style={styles.commissionValue}>{tierConfig?.commission}%</Text>
              </View>
            </View>
            <Text style={styles.upgradeText}>
              {providerData?.subscriptionTier !== 'ELITE'
                ? t('provider.upgradeToSave')
                : t('provider.maxTier')}
            </Text>
          </LinearGradient>
        </Pressable>

        <View style={{ height: 100 }} />
      </ScrollView>
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
      paddingBottom: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    headerTop: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    profileInfo: {
      alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    greeting: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: '#fff',
    },
    verificationBadge: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 4,
    },
    verificationText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: 'rgba(255,255,255,0.9)',
    },
    expressToggle: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.2)',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      marginTop: theme.spacing.lg,
    },
    expressInfo: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    expressLabel: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: '#fff',
    },
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
      marginTop: -30,
    },
    progressCard: {
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.sm,
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
    },
    progressHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    progressTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
    },
    progressValue: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.primary,
    },
    progressBar: {
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.border,
    },
    progressSubtext: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
      textAlign: isRTL ? 'right' : 'left',
    },
    section: {
      marginTop: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
    },
    sectionHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    sectionTitleRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
    },
    badge: {
      backgroundColor: theme.colors.primary,
    },
    seeAll: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.primary,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
    },
    emptyText: {
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
    },
    actionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
    actionItem: {
      width: (width - theme.spacing.md * 2 - theme.spacing.md * 3) / 4,
      alignItems: 'center',
    },
    actionIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    actionLabel: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.medium,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
      textAlign: 'center',
    },
    subscriptionCard: {
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
    },
    subscriptionGradient: {
      padding: theme.spacing.lg,
    },
    subscriptionContent: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    subscriptionLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: 'rgba(255,255,255,0.8)',
    },
    subscriptionTier: {
      fontSize: theme.typography.fontSize.xxl,
      fontFamily: theme.typography.fontFamily.bold,
      color: '#fff',
    },
    subscriptionStats: {
      alignItems: isRTL ? 'flex-start' : 'flex-end',
    },
    commissionLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: 'rgba(255,255,255,0.8)',
    },
    commissionValue: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: '#fff',
    },
    upgradeText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: 'rgba(255,255,255,0.9)',
      marginTop: theme.spacing.md,
      textAlign: isRTL ? 'right' : 'left',
    },
  });
