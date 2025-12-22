// ============================================
// Listings Screen - Browse & Search Items
// شاشة الإعلانات - تصفح وبحث المنتجات
// ============================================

import React, { useState, useCallback, useMemo } from 'react';
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
  Chip,
  FAB,
  ActivityIndicator,
  Surface,
  IconButton,
  Badge,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { listingsApi, Listing, ListingsFilter, Category } from '../../services/api/listings';
import { ListingCard } from '../../components/listings/ListingCard';
import { FilterModal } from '../../components/listings/FilterModal';
import { CategorySelector } from '../../components/listings/CategorySelector';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export const ListingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ListingsFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: listingsApi.getCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Fetch listings with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['listings', filters, searchQuery, selectedCategory],
    queryFn: ({ pageParam = 1 }) =>
      listingsApi.getListings({
        ...filters,
        search: searchQuery || undefined,
        categoryId: selectedCategory || undefined,
        page: pageParam,
        limit: 20,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
  });

  // Flatten listings from all pages
  const listings = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.governorate) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.condition?.length) count++;
    if (filters.allowBarter) count++;
    return count;
  }, [filters]);

  // Handlers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategorySelect = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleApplyFilters = useCallback((newFilters: ListingsFilter) => {
    setFilters(newFilters);
    setShowFilters(false);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setSelectedCategory(null);
    setSearchQuery('');
  }, []);

  const handleListingPress = useCallback((listing: Listing) => {
    navigation.navigate('ListingDetails', { listingId: listing.id });
  }, [navigation]);

  const handleCreateListing = useCallback(() => {
    navigation.navigate('CreateListing');
  }, [navigation]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Render item
  const renderItem = useCallback(
    ({ item, index }: { item: Listing; index: number }) => (
      <ListingCard
        listing={item}
        onPress={() => handleListingPress(item)}
        style={[
          styles.card,
          viewMode === 'grid' && {
            width: CARD_WIDTH,
            marginLeft: index % 2 === 0 ? 16 : 8,
            marginRight: index % 2 === 1 ? 16 : 8,
          },
        ]}
        variant={viewMode}
      />
    ),
    [viewMode, handleListingPress]
  );

  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search Bar */}
      <View style={styles.searchRow}>
        <Searchbar
          placeholder={t('listings.searchPlaceholder')}
          value={searchQuery}
          onChangeText={handleSearch}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          icon={() => <Ionicons name="search" size={20} color={theme.colors.textSecondary} />}
        />
        <IconButton
          icon={viewMode === 'grid' ? 'view-list' : 'view-grid'}
          size={24}
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        />
      </View>

      {/* Categories */}
      <CategorySelector
        categories={categories || []}
        selectedId={selectedCategory}
        onSelect={handleCategorySelect}
      />

      {/* Filter Chips */}
      <View style={styles.filtersRow}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.filterButtonText}>{t('common.filters')}</Text>
          {activeFiltersCount > 0 && (
            <Badge size={18} style={styles.filterBadge}>
              {activeFiltersCount}
            </Badge>
          )}
        </TouchableOpacity>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { key: 'sortBy', label: t('listings.sortBy') },
            { key: 'condition', label: t('listings.condition') },
            { key: 'price', label: t('listings.price') },
          ]}
          renderItem={({ item }) => (
            <Chip
              mode="outlined"
              style={styles.chip}
              textStyle={styles.chipText}
              onPress={() => setShowFilters(true)}
            >
              {item.label}
            </Chip>
          )}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.chipsContainer}
        />
      </View>

      {/* Results count */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>
          {t('listings.resultsCount', { count: data?.pages[0]?.pagination.total || 0 })}
        </Text>
        {activeFiltersCount > 0 && (
          <TouchableOpacity onPress={handleClearFilters}>
            <Text style={styles.clearFilters}>{t('common.clearAll')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
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
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={64} color={theme.colors.textSecondary} />
        <Text style={styles.emptyTitle}>{t('listings.noResults')}</Text>
        <Text style={styles.emptySubtitle}>{t('listings.noResultsSubtitle')}</Text>
        {activeFiltersCount > 0 && (
          <TouchableOpacity onPress={handleClearFilters} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>{t('common.clearFilters')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={listings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode} // Force re-render when switching view modes
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB for creating listing */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateListing}
        color="#FFF"
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onDismiss={() => setShowFilters(false)}
        filters={filters}
        onApply={handleApplyFilters}
        categories={categories || []}
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
  searchRow: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    elevation: 0,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  searchInput: {
    fontSize: 14,
  },
  filtersRow: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterButton: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontFamily: 'Cairo-Medium',
    marginLeft: 4,
  },
  filterBadge: {
    backgroundColor: theme.colors.primary,
    marginLeft: 4,
  },
  chipsContainer: {
    paddingRight: 16,
  },
  chip: {
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  chipText: {
    fontSize: 12,
  },
  resultsRow: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontFamily: 'Cairo-Regular',
  },
  clearFilters: {
    fontSize: 13,
    color: theme.colors.primary,
    fontFamily: 'Cairo-Medium',
  },
  listContent: {
    paddingBottom: 80,
  },
  card: {
    marginBottom: 16,
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
  clearButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
  },
  clearButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Cairo-Medium',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: theme.colors.primary,
  },
});

export default ListingsScreen;
