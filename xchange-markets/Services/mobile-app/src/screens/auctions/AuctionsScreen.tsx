// ============================================
// Auctions Screen - Live Auctions
// شاشة المزادات الحية
// ============================================

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
import {
  Text,
  Searchbar,
  SegmentedButtons,
  FAB,
  ActivityIndicator,
  Chip,
  Badge,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { auctionsApi, Auction, AuctionsFilter } from '../../services/api/auctions';
import { AuctionCard } from '../../components/auctions/AuctionCard';
import { CountdownTimer } from '../../components/common/CountdownTimer';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');

type AuctionTab = 'active' | 'ending_soon' | 'upcoming' | 'my_bids';

export const AuctionsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  // State
  const [activeTab, setActiveTab] = useState<AuctionTab>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<AuctionsFilter>({});

  // Fetch active auctions
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['auctions', activeTab, filters, searchQuery],
    queryFn: ({ pageParam = 1 }) => {
      const baseFilters: AuctionsFilter = {
        ...filters,
        search: searchQuery || undefined,
        page: pageParam,
        limit: 20,
      };

      switch (activeTab) {
        case 'ending_soon':
          return auctionsApi.getAuctions({ ...baseFilters, status: 'ACTIVE', sortBy: 'ending_soon' });
        case 'upcoming':
          return auctionsApi.getAuctions({ ...baseFilters, status: 'UPCOMING' });
        default:
          return auctionsApi.getAuctions({ ...baseFilters, status: 'ACTIVE' });
      }
    },
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    enabled: activeTab !== 'my_bids',
  });

  // Fetch user's bids
  const { data: myBids, isLoading: isLoadingMyBids, refetch: refetchMyBids } = useQuery({
    queryKey: ['myBids'],
    queryFn: () => auctionsApi.getMyBids(undefined, 1, 50),
    enabled: activeTab === 'my_bids',
  });

  // Fetch ending soon for highlight
  const { data: endingSoon } = useQuery({
    queryKey: ['endingSoon'],
    queryFn: () => auctionsApi.getEndingSoon(5),
    staleTime: 60 * 1000, // 1 minute
  });

  // Fetch hot auctions
  const { data: hotAuctions } = useQuery({
    queryKey: ['hotAuctions'],
    queryFn: () => auctionsApi.getHotAuctions(5),
    staleTime: 60 * 1000,
  });

  // Flatten auctions from all pages
  const auctions = useMemo(() => {
    if (activeTab === 'my_bids') {
      return myBids?.data.map(item => item.auction) ?? [];
    }
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data, myBids, activeTab]);

  // Handlers
  const handleAuctionPress = useCallback((auction: Auction) => {
    navigation.navigate('AuctionDetails', { auctionId: auction.id });
  }, [navigation]);

  const handleCreateAuction = useCallback(() => {
    navigation.navigate('CreateAuction');
  }, [navigation]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && activeTab !== 'my_bids') {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, activeTab]);

  // Render ending soon section
  const renderEndingSoonSection = () => {
    if (!endingSoon?.length || activeTab !== 'active') return null;

    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Ionicons name="time-outline" size={20} color={theme.colors.error} />
          <Text style={styles.sectionTitle}>{t('auctions.endingSoon')}</Text>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={endingSoon}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.endingSoonCard}
              onPress={() => handleAuctionPress(item)}
            >
              <View style={styles.endingSoonTimer}>
                <CountdownTimer
                  endTime={item.endTime}
                  compact
                  style={styles.timer}
                />
              </View>
              <Text style={styles.endingSoonTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.endingSoonPrice}>
                {item.currentPrice.toLocaleString()} {t('common.egp')}
              </Text>
              <Text style={styles.bidsCount}>
                {t('auctions.bidsCount', { count: item.bidsCount })}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => `ending-${item.id}`}
          contentContainerStyle={styles.horizontalList}
        />
      </View>
    );
  };

  // Render hot auctions section
  const renderHotSection = () => {
    if (!hotAuctions?.length || activeTab !== 'active') return null;

    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Ionicons name="flame-outline" size={20} color={theme.colors.warning} />
          <Text style={styles.sectionTitle}>{t('auctions.hotAuctions')}</Text>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={hotAuctions}
          renderItem={({ item }) => (
            <AuctionCard
              auction={item}
              onPress={() => handleAuctionPress(item)}
              variant="compact"
              style={styles.hotCard}
            />
          )}
          keyExtractor={(item) => `hot-${item.id}`}
          contentContainerStyle={styles.horizontalList}
        />
      </View>
    );
  };

  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search Bar */}
      <Searchbar
        placeholder={t('auctions.searchPlaceholder')}
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
      />

      {/* Tabs */}
      <SegmentedButtons
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as AuctionTab)}
        buttons={[
          { value: 'active', label: t('auctions.active') },
          { value: 'ending_soon', label: t('auctions.endingSoon') },
          { value: 'upcoming', label: t('auctions.upcoming') },
          { value: 'my_bids', label: t('auctions.myBids') },
        ]}
        style={styles.segmentedButtons}
      />

      {/* Ending Soon Section */}
      {renderEndingSoonSection()}

      {/* Hot Auctions Section */}
      {renderHotSection()}

      {/* All Auctions Header */}
      <View style={styles.allAuctionsHeader}>
        <Text style={styles.allAuctionsTitle}>
          {activeTab === 'my_bids' ? t('auctions.myBidsTitle') : t('auctions.allAuctions')}
        </Text>
        <Text style={styles.resultsCount}>
          {activeTab === 'my_bids'
            ? t('auctions.bidsResultsCount', { count: myBids?.pagination.total || 0 })
            : t('auctions.resultsCount', { count: data?.pages[0]?.pagination.total || 0 })}
        </Text>
      </View>
    </View>
  );

  // Render item
  const renderItem = useCallback(
    ({ item }: { item: Auction }) => (
      <AuctionCard
        auction={item}
        onPress={() => handleAuctionPress(item)}
        style={styles.auctionCard}
      />
    ),
    [handleAuctionPress]
  );

  // Render footer
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  // Render empty state
  const renderEmpty = () => {
    if (isLoading || isLoadingMyBids) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="hammer-outline" size={64} color={theme.colors.textSecondary} />
        <Text style={styles.emptyTitle}>
          {activeTab === 'my_bids' ? t('auctions.noBids') : t('auctions.noAuctions')}
        </Text>
        <Text style={styles.emptySubtitle}>
          {activeTab === 'my_bids'
            ? t('auctions.noBidsSubtitle')
            : t('auctions.noAuctionsSubtitle')}
        </Text>
      </View>
    );
  };

  const currentIsLoading = activeTab === 'my_bids' ? isLoadingMyBids : isLoading;
  const currentRefetch = activeTab === 'my_bids' ? refetchMyBids : refetch;
  const currentIsRefetching = activeTab === 'my_bids' ? false : isRefetching;

  return (
    <View style={styles.container}>
      {currentIsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={auctions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={currentIsRefetching}
              onRefresh={() => currentRefetch()}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB for creating auction */}
      <FAB
        icon="gavel"
        style={styles.fab}
        onPress={handleCreateAuction}
        color="#FFF"
      />
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
  header: {
    paddingTop: 8,
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 0,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  searchInput: {
    fontSize: 14,
  },
  segmentedButtons: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Cairo-SemiBold',
    color: theme.colors.text,
    marginLeft: 8,
  },
  horizontalList: {
    paddingHorizontal: 16,
  },
  endingSoonCard: {
    width: 160,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: theme.colors.error + '30',
  },
  endingSoonTimer: {
    marginBottom: 8,
  },
  timer: {
    backgroundColor: theme.colors.error + '15',
  },
  endingSoonTitle: {
    fontSize: 14,
    fontFamily: 'Cairo-Medium',
    color: theme.colors.text,
    marginBottom: 4,
  },
  endingSoonPrice: {
    fontSize: 16,
    fontFamily: 'Cairo-Bold',
    color: theme.colors.primary,
  },
  bidsCount: {
    fontSize: 12,
    fontFamily: 'Cairo-Regular',
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  hotCard: {
    width: 200,
    marginRight: 12,
  },
  allAuctionsHeader: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  allAuctionsTitle: {
    fontSize: 18,
    fontFamily: 'Cairo-Bold',
    color: theme.colors.text,
  },
  resultsCount: {
    fontSize: 13,
    fontFamily: 'Cairo-Regular',
    color: theme.colors.textSecondary,
  },
  listContent: {
    paddingBottom: 80,
  },
  auctionCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Cairo-SemiBold',
    color: theme.colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: theme.colors.primary,
  },
});

export default AuctionsScreen;
