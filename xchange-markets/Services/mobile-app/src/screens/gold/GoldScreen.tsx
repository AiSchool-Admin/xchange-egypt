// ============================================
// Gold Trading Screen
// شاشة تجارة الذهب
// ============================================

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  I18nManager,
  Dimensions,
} from 'react-native';
import {
  Text,
  Surface,
  SegmentedButtons,
  FAB,
  ActivityIndicator,
  Chip,
  Card,
  Button,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

import { goldApi, GoldPrice, GoldListing, GoldDealer } from '../../services/api/gold';
import { GoldListingCard } from '../../components/gold/GoldListingCard';
import { GoldDealerCard } from '../../components/gold/GoldDealerCard';
import { GoldCalculator } from '../../components/gold/GoldCalculator';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');

type GoldTab = 'prices' | 'listings' | 'dealers' | 'calculator';

export const GoldScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  // State
  const [activeTab, setActiveTab] = useState<GoldTab>('prices');
  const [selectedKarat, setSelectedKarat] = useState<18 | 21 | 24>(21);
  const [chartPeriod, setChartPeriod] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M');

  // Fetch gold prices
  const { data: prices, isLoading: isLoadingPrices, refetch: refetchPrices } = useQuery({
    queryKey: ['goldPrices'],
    queryFn: goldApi.getPrices,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Fetch price history
  const { data: priceHistory } = useQuery({
    queryKey: ['goldPriceHistory', selectedKarat, chartPeriod],
    queryFn: () => goldApi.getPriceHistory(selectedKarat, chartPeriod),
  });

  // Fetch gold listings
  const {
    data: listingsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingListings,
    refetch: refetchListings,
  } = useInfiniteQuery({
    queryKey: ['goldListings'],
    queryFn: ({ pageParam = 1 }) => goldApi.getListings({ page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    enabled: activeTab === 'listings',
  });

  // Fetch gold dealers
  const { data: dealers, isLoading: isLoadingDealers, refetch: refetchDealers } = useQuery({
    queryKey: ['goldDealers'],
    queryFn: () => goldApi.getDealers(undefined, 1, 50),
    enabled: activeTab === 'dealers',
  });

  // Flatten listings
  const listings = useMemo(
    () => listingsData?.pages.flatMap((page) => page.data) ?? [],
    [listingsData]
  );

  // Get price for selected karat
  const currentPrice = useMemo(
    () => prices?.find((p) => p.karat === selectedKarat),
    [prices, selectedKarat]
  );

  // Chart data
  const chartData = useMemo(() => {
    if (!priceHistory?.prices?.length) return null;

    return {
      labels: priceHistory.prices.slice(-7).map((p) => {
        const date = new Date(p.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      datasets: [
        {
          data: priceHistory.prices.slice(-7).map((p) => p.sellPrice),
          color: () => theme.colors.gold,
          strokeWidth: 2,
        },
      ],
    };
  }, [priceHistory]);

  // Handlers
  const handleListingPress = useCallback((listing: GoldListing) => {
    navigation.navigate('GoldListingDetails', { listingId: listing.id });
  }, [navigation]);

  const handleDealerPress = useCallback((dealer: GoldDealer) => {
    navigation.navigate('GoldDealerDetails', { dealerId: dealer.id });
  }, [navigation]);

  const handleCreateListing = useCallback(() => {
    navigation.navigate('CreateGoldListing');
  }, [navigation]);

  // Render price cards
  const renderPriceCards = () => (
    <View style={styles.priceCardsContainer}>
      {[18, 21, 24].map((karat) => {
        const price = prices?.find((p) => p.karat === karat);
        const isSelected = karat === selectedKarat;

        return (
          <TouchableOpacity
            key={karat}
            onPress={() => setSelectedKarat(karat as 18 | 21 | 24)}
            style={[styles.priceCard, isSelected && styles.priceCardSelected]}
          >
            <Text style={[styles.karatLabel, isSelected && styles.karatLabelSelected]}>
              {t('gold.karat', { karat })}
            </Text>
            <Text style={[styles.priceValue, isSelected && styles.priceValueSelected]}>
              {price?.sellPrice.toLocaleString() || '-'}
            </Text>
            <Text style={styles.priceLabel}>{t('gold.perGram')}</Text>
            {price && (
              <View style={[
                styles.changeContainer,
                { backgroundColor: price.change24h >= 0 ? '#E8F5E9' : '#FFEBEE' }
              ]}>
                <Ionicons
                  name={price.change24h >= 0 ? 'arrow-up' : 'arrow-down'}
                  size={12}
                  color={price.change24h >= 0 ? '#4CAF50' : '#F44336'}
                />
                <Text style={[
                  styles.changeText,
                  { color: price.change24h >= 0 ? '#4CAF50' : '#F44336' }
                ]}>
                  {Math.abs(price.changePercent24h).toFixed(2)}%
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // Render price chart
  const renderPriceChart = () => {
    if (!chartData) return null;

    return (
      <Surface style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>{t('gold.priceChart')}</Text>
          <View style={styles.periodSelector}>
            {(['1D', '1W', '1M', '3M', '1Y'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                onPress={() => setChartPeriod(period)}
                style={[
                  styles.periodButton,
                  chartPeriod === period && styles.periodButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    chartPeriod === period && styles.periodButtonTextActive,
                  ]}
                >
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <LineChart
          data={chartData}
          width={width - 48}
          height={180}
          chartConfig={{
            backgroundColor: theme.colors.surface,
            backgroundGradientFrom: theme.colors.surface,
            backgroundGradientTo: theme.colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`,
            labelColor: () => theme.colors.textSecondary,
            style: { borderRadius: 12 },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: theme.colors.gold,
            },
          }}
          bezier
          style={styles.chart}
        />
      </Surface>
    );
  };

  // Render buy/sell prices
  const renderBuySellPrices = () => (
    <Surface style={styles.buySellContainer}>
      <View style={styles.buySellRow}>
        <View style={styles.buySellCard}>
          <Text style={styles.buySellLabel}>{t('gold.buyPrice')}</Text>
          <Text style={styles.buySellValue}>
            {currentPrice?.buyPrice.toLocaleString() || '-'} {t('common.egp')}
          </Text>
          <Text style={styles.buySellNote}>{t('gold.dealerBuysAt')}</Text>
        </View>
        <View style={[styles.buySellCard, styles.sellCard]}>
          <Text style={styles.buySellLabel}>{t('gold.sellPrice')}</Text>
          <Text style={[styles.buySellValue, styles.sellValue]}>
            {currentPrice?.sellPrice.toLocaleString() || '-'} {t('common.egp')}
          </Text>
          <Text style={styles.buySellNote}>{t('gold.dealerSellsAt')}</Text>
        </View>
      </View>
      <Text style={styles.lastUpdated}>
        {t('gold.lastUpdated')}: {currentPrice?.updatedAt ? new Date(currentPrice.updatedAt).toLocaleTimeString('ar-EG') : '-'}
      </Text>
    </Surface>
  );

  // Render prices tab content
  const renderPricesTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {renderPriceCards()}
      {renderBuySellPrices()}
      {renderPriceChart()}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Button
          mode="contained"
          icon="calculator"
          onPress={() => setActiveTab('calculator')}
          style={styles.quickActionButton}
        >
          {t('gold.calculator')}
        </Button>
        <Button
          mode="outlined"
          icon="store"
          onPress={() => setActiveTab('dealers')}
          style={styles.quickActionButton}
        >
          {t('gold.findDealers')}
        </Button>
      </View>
    </ScrollView>
  );

  // Render listings tab
  const renderListingsTab = () => (
    <FlatList
      data={listings}
      renderItem={({ item }) => (
        <GoldListingCard
          listing={item}
          onPress={() => handleListingPress(item)}
          style={styles.listingCard}
        />
      )}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        !isLoadingListings ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="gold" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.emptyTitle}>{t('gold.noListings')}</Text>
          </View>
        ) : null
      }
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={() => refetchListings()}
          colors={[theme.colors.gold]}
        />
      }
      contentContainerStyle={styles.listContent}
    />
  );

  // Render dealers tab
  const renderDealersTab = () => (
    <FlatList
      data={dealers?.data || []}
      renderItem={({ item }) => (
        <GoldDealerCard
          dealer={item}
          onPress={() => handleDealerPress(item)}
          style={styles.dealerCard}
        />
      )}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        !isLoadingDealers ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.emptyTitle}>{t('gold.noDealers')}</Text>
          </View>
        ) : null
      }
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={() => refetchDealers()}
          colors={[theme.colors.gold]}
        />
      }
      contentContainerStyle={styles.listContent}
    />
  );

  // Render calculator tab
  const renderCalculatorTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <GoldCalculator prices={prices || []} />
    </ScrollView>
  );

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'prices':
        return renderPricesTab();
      case 'listings':
        return renderListingsTab();
      case 'dealers':
        return renderDealersTab();
      case 'calculator':
        return renderCalculatorTab();
      default:
        return renderPricesTab();
    }
  };

  const isLoading = (activeTab === 'prices' && isLoadingPrices) ||
    (activeTab === 'listings' && isLoadingListings) ||
    (activeTab === 'dealers' && isLoadingDealers);

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <SegmentedButtons
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as GoldTab)}
        buttons={[
          { value: 'prices', label: t('gold.prices'), icon: 'chart-line' },
          { value: 'listings', label: t('gold.listings'), icon: 'shopping' },
          { value: 'dealers', label: t('gold.dealers'), icon: 'store' },
          { value: 'calculator', label: t('gold.calc'), icon: 'calculator' },
        ]}
        style={styles.segmentedButtons}
      />

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.gold} />
        </View>
      ) : (
        renderContent()
      )}

      {/* FAB for creating gold listing */}
      {activeTab === 'listings' && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={handleCreateListing}
          color="#FFF"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentedButtons: {
    margin: 16,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  priceCardsContainer: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  priceCardSelected: {
    borderColor: theme.colors.gold,
    backgroundColor: theme.colors.gold + '10',
  },
  karatLabel: {
    fontSize: 14,
    fontFamily: 'Cairo-Medium',
    color: theme.colors.textSecondary,
  },
  karatLabelSelected: {
    color: theme.colors.gold,
  },
  priceValue: {
    fontSize: 18,
    fontFamily: 'Cairo-Bold',
    color: theme.colors.text,
    marginVertical: 4,
  },
  priceValueSelected: {
    color: theme.colors.gold,
  },
  priceLabel: {
    fontSize: 11,
    fontFamily: 'Cairo-Regular',
    color: theme.colors.textSecondary,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  changeText: {
    fontSize: 11,
    fontFamily: 'Cairo-Medium',
    marginLeft: 2,
  },
  buySellContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  buySellRow: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
  },
  buySellCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  sellCard: {
    backgroundColor: '#FFF3E0',
  },
  buySellLabel: {
    fontSize: 12,
    fontFamily: 'Cairo-Regular',
    color: theme.colors.textSecondary,
  },
  buySellValue: {
    fontSize: 18,
    fontFamily: 'Cairo-Bold',
    color: '#1976D2',
    marginVertical: 4,
  },
  sellValue: {
    color: '#F57C00',
  },
  buySellNote: {
    fontSize: 10,
    fontFamily: 'Cairo-Regular',
    color: theme.colors.textSecondary,
  },
  lastUpdated: {
    fontSize: 11,
    fontFamily: 'Cairo-Regular',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  chartContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'Cairo-SemiBold',
    color: theme.colors.text,
  },
  periodSelector: {
    flexDirection: 'row',
  },
  periodButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 4,
    borderRadius: 4,
  },
  periodButtonActive: {
    backgroundColor: theme.colors.gold + '20',
  },
  periodButtonText: {
    fontSize: 12,
    fontFamily: 'Cairo-Medium',
    color: theme.colors.textSecondary,
  },
  periodButtonTextActive: {
    color: theme.colors.gold,
  },
  chart: {
    borderRadius: 12,
  },
  quickActions: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  listingCard: {
    marginBottom: 12,
  },
  dealerCard: {
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Cairo-Medium',
    color: theme.colors.textSecondary,
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: theme.colors.gold,
  },
});

export default GoldScreen;
