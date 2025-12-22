// ============================================
// Search Screen - Service Discovery with Filters
// ============================================

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  FlatList,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, Searchbar, Chip, Button, Portal, Modal, RadioButton, Checkbox, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import debounce from 'lodash/debounce';

import { theme } from '../../constants/theme';
import { GOVERNORATES, SERVICE_CATEGORIES } from '../../constants/config';
import { useSettingsStore } from '../../store/settingsStore';
import { servicesApi } from '../../services/api/services';

import ServiceCard from '../../components/services/ServiceCard';
import CategoryCard from '../../components/services/CategoryCard';
import LoadingScreen from '../../components/common/LoadingScreen';

const { width } = Dimensions.get('window');

interface Filters {
  categoryId?: string;
  governorate?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy: 'relevance' | 'rating' | 'price_low' | 'price_high' | 'distance' | 'newest';
  expressOnly: boolean;
  verifiedOnly: boolean;
}

const SORT_OPTIONS = [
  { value: 'relevance', labelKey: 'search.sort.relevance' },
  { value: 'rating', labelKey: 'search.sort.rating' },
  { value: 'price_low', labelKey: 'search.sort.priceLow' },
  { value: 'price_high', labelKey: 'search.sort.priceHigh' },
  { value: 'distance', labelKey: 'search.sort.distance' },
  { value: 'newest', labelKey: 'search.sort.newest' },
];

const RATING_OPTIONS = [4.5, 4.0, 3.5, 3.0];

export default function SearchScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { isDarkMode, language } = useSettingsStore();
  const isRTL = language === 'ar';

  const initialCategoryId = route.params?.categoryId;
  const initialExpress = route.params?.express;

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    categoryId: initialCategoryId,
    sortBy: 'relevance',
    expressOnly: initialExpress || false,
    verifiedOnly: false,
  });
  const [tempFilters, setTempFilters] = useState<Filters>(filters);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => servicesApi.getCategories(),
  });

  // Search services with infinite scroll
  const {
    data: searchResults,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['searchServices', searchQuery, filters],
    queryFn: ({ pageParam = 1 }) =>
      servicesApi.searchServices({
        query: searchQuery,
        categoryId: filters.categoryId,
        governorate: filters.governorate,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        minRating: filters.minRating,
        sortBy: filters.sortBy,
        expressOnly: filters.expressOnly,
        verifiedOnly: filters.verifiedOnly,
        page: pageParam,
        limit: 20,
      }),
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.data.length < 20) return undefined;
      return pages.length + 1;
    },
    initialPageParam: 1,
  });

  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        setSearchQuery(query);
      }, 500),
    []
  );

  const handleSearch = (query: string) => {
    debouncedSearch(query);
  };

  const handleCategoryPress = (categoryId: string) => {
    setFilters((prev) => ({
      ...prev,
      categoryId: prev.categoryId === categoryId ? undefined : categoryId,
    }));
  };

  const handleServicePress = (serviceId: string) => {
    navigation.navigate('ServiceDetail', { serviceId });
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    const defaultFilters: Filters = {
      sortBy: 'relevance',
      expressOnly: false,
      verifiedOnly: false,
    };
    setTempFilters(defaultFilters);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.categoryId) count++;
    if (filters.governorate) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.minRating) count++;
    if (filters.expressOnly) count++;
    if (filters.verifiedOnly) count++;
    return count;
  }, [filters]);

  const allServices = useMemo(() => {
    return searchResults?.pages.flatMap((page) => page.data) || [];
  }, [searchResults]);

  const styles = createStyles(isDarkMode, isRTL);

  const renderServiceItem = useCallback(
    ({ item }: { item: any }) => (
      <ServiceCard
        service={item}
        onPress={() => handleServicePress(item.id)}
        horizontal
        style={styles.serviceItem}
      />
    ),
    [styles]
  );

  const renderHeader = () => (
    <View>
      {/* Categories */}
      {!searchQuery && (
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>{t('search.categories')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories?.data?.map((category: any) => (
              <Pressable
                key={category.id}
                style={[
                  styles.categoryChip,
                  filters.categoryId === category.id && styles.categoryChipActive,
                ]}
                onPress={() => handleCategoryPress(category.id)}
              >
                <Ionicons
                  name={category.icon || 'grid'}
                  size={20}
                  color={filters.categoryId === category.id ? '#fff' : theme.colors.primary}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    filters.categoryId === category.id && styles.categoryChipTextActive,
                  ]}
                >
                  {isRTL ? category.nameAr : category.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Results Header */}
      {(searchQuery || filters.categoryId) && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {allServices.length} {t('search.results')}
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>{t('search.noResults')}</Text>
      <Text style={styles.emptySubtitle}>{t('search.noResultsSubtitle')}</Text>
      {activeFiltersCount > 0 && (
        <Button
          mode="outlined"
          onPress={() => {
            setFilters({
              sortBy: 'relevance',
              expressOnly: false,
              verifiedOnly: false,
            });
          }}
        >
          {t('search.clearFilters')}
        </Button>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Search Header */}
      <View style={styles.header}>
        <Searchbar
          placeholder={t('search.placeholder')}
          onChangeText={handleSearch}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          icon={isRTL ? 'arrow-forward' : 'arrow-back'}
          onIconPress={() => navigation.goBack()}
        />
        <Pressable
          style={[styles.filterButton, activeFiltersCount > 0 && styles.filterButtonActive]}
          onPress={() => {
            setTempFilters(filters);
            setShowFilters(true);
          }}
        >
          <Ionicons
            name="options"
            size={24}
            color={activeFiltersCount > 0 ? '#fff' : theme.colors.primary}
          />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.activeFiltersContainer}
          contentContainerStyle={styles.activeFiltersContent}
        >
          {filters.expressOnly && (
            <Chip
              mode="flat"
              icon="flash"
              onClose={() => setFilters((prev) => ({ ...prev, expressOnly: false }))}
              style={styles.activeFilterChip}
            >
              {t('search.filters.express')}
            </Chip>
          )}
          {filters.verifiedOnly && (
            <Chip
              mode="flat"
              icon="checkmark-circle"
              onClose={() => setFilters((prev) => ({ ...prev, verifiedOnly: false }))}
              style={styles.activeFilterChip}
            >
              {t('search.filters.verified')}
            </Chip>
          )}
          {filters.minRating && (
            <Chip
              mode="flat"
              icon="star"
              onClose={() => setFilters((prev) => ({ ...prev, minRating: undefined }))}
              style={styles.activeFilterChip}
            >
              {filters.minRating}+
            </Chip>
          )}
          {filters.governorate && (
            <Chip
              mode="flat"
              icon="location"
              onClose={() => setFilters((prev) => ({ ...prev, governorate: undefined }))}
              style={styles.activeFilterChip}
            >
              {filters.governorate}
            </Chip>
          )}
        </ScrollView>
      )}

      {/* Results */}
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <FlatList
          data={allServices}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
        />
      )}

      {/* Filters Modal */}
      <Portal>
        <Modal
          visible={showFilters}
          onDismiss={() => setShowFilters(false)}
          contentContainerStyle={styles.filtersModal}
        >
          <View style={styles.filtersHeader}>
            <Text style={styles.filtersTitle}>{t('search.filters.title')}</Text>
            <Button onPress={handleResetFilters}>{t('search.filters.reset')}</Button>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Sort By */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>{t('search.filters.sortBy')}</Text>
              <RadioButton.Group
                value={tempFilters.sortBy}
                onValueChange={(value) =>
                  setTempFilters((prev) => ({ ...prev, sortBy: value as any }))
                }
              >
                {SORT_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    style={styles.radioItem}
                    onPress={() =>
                      setTempFilters((prev) => ({ ...prev, sortBy: option.value as any }))
                    }
                  >
                    <RadioButton value={option.value} />
                    <Text style={styles.radioLabel}>{t(option.labelKey)}</Text>
                  </Pressable>
                ))}
              </RadioButton.Group>
            </View>

            <Divider />

            {/* Quick Filters */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>{t('search.filters.quickFilters')}</Text>
              <Pressable
                style={styles.checkboxItem}
                onPress={() =>
                  setTempFilters((prev) => ({ ...prev, expressOnly: !prev.expressOnly }))
                }
              >
                <Checkbox
                  status={tempFilters.expressOnly ? 'checked' : 'unchecked'}
                  onPress={() =>
                    setTempFilters((prev) => ({ ...prev, expressOnly: !prev.expressOnly }))
                  }
                />
                <View style={styles.checkboxContent}>
                  <Ionicons name="flash" size={20} color={theme.colors.primary} />
                  <Text style={styles.checkboxLabel}>{t('search.filters.expressOnly')}</Text>
                </View>
              </Pressable>
              <Pressable
                style={styles.checkboxItem}
                onPress={() =>
                  setTempFilters((prev) => ({ ...prev, verifiedOnly: !prev.verifiedOnly }))
                }
              >
                <Checkbox
                  status={tempFilters.verifiedOnly ? 'checked' : 'unchecked'}
                  onPress={() =>
                    setTempFilters((prev) => ({ ...prev, verifiedOnly: !prev.verifiedOnly }))
                  }
                />
                <View style={styles.checkboxContent}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                  <Text style={styles.checkboxLabel}>{t('search.filters.verifiedOnly')}</Text>
                </View>
              </Pressable>
            </View>

            <Divider />

            {/* Rating Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>{t('search.filters.minRating')}</Text>
              <View style={styles.ratingOptions}>
                {RATING_OPTIONS.map((rating) => (
                  <Pressable
                    key={rating}
                    style={[
                      styles.ratingChip,
                      tempFilters.minRating === rating && styles.ratingChipActive,
                    ]}
                    onPress={() =>
                      setTempFilters((prev) => ({
                        ...prev,
                        minRating: prev.minRating === rating ? undefined : rating,
                      }))
                    }
                  >
                    <Ionicons
                      name="star"
                      size={16}
                      color={tempFilters.minRating === rating ? '#fff' : theme.colors.star}
                    />
                    <Text
                      style={[
                        styles.ratingChipText,
                        tempFilters.minRating === rating && styles.ratingChipTextActive,
                      ]}
                    >
                      {rating}+
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Divider />

            {/* Location Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>{t('search.filters.location')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.locationOptions}>
                  {GOVERNORATES.slice(0, 10).map((gov) => (
                    <Chip
                      key={gov.value}
                      mode={tempFilters.governorate === gov.value ? 'flat' : 'outlined'}
                      selected={tempFilters.governorate === gov.value}
                      onPress={() =>
                        setTempFilters((prev) => ({
                          ...prev,
                          governorate: prev.governorate === gov.value ? undefined : gov.value,
                        }))
                      }
                      style={styles.locationChip}
                    >
                      {isRTL ? gov.labelAr : gov.label}
                    </Chip>
                  ))}
                </View>
              </ScrollView>
            </View>
          </ScrollView>

          {/* Apply Button */}
          <View style={styles.filtersFooter}>
            <Button
              mode="contained"
              onPress={handleApplyFilters}
              style={styles.applyButton}
            >
              {t('search.filters.apply')}
            </Button>
          </View>
        </Modal>
      </Portal>
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
      paddingTop: 50,
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    searchBar: {
      flex: 1,
      elevation: 0,
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
    },
    searchInput: {
      textAlign: isRTL ? 'right' : 'left',
    },
    filterButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    filterButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    filterBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme.colors.error,
      justifyContent: 'center',
      alignItems: 'center',
    },
    filterBadgeText: {
      fontSize: 10,
      fontFamily: theme.typography.fontFamily.bold,
      color: '#fff',
    },
    activeFiltersContainer: {
      maxHeight: 50,
    },
    activeFiltersContent: {
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.sm,
      flexDirection: isRTL ? 'row-reverse' : 'row',
    },
    activeFilterChip: {
      backgroundColor: theme.colors.primaryLight + '20',
    },
    categoriesSection: {
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
      textAlign: isRTL ? 'right' : 'left',
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    categoriesContainer: {
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    categoryChip: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    categoryChipActive: {
      backgroundColor: theme.colors.primary,
    },
    categoryChipText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.primary,
    },
    categoryChipTextActive: {
      color: '#fff',
    },
    resultsHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    resultsCount: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
    },
    listContent: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: 100,
    },
    serviceItem: {
      marginBottom: theme.spacing.md,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xl * 2,
    },
    emptyTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
      marginTop: theme.spacing.md,
    },
    emptySubtitle: {
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    filtersModal: {
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
      margin: theme.spacing.md,
      borderRadius: theme.borderRadius.xl,
      maxHeight: '80%',
    },
    filtersHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    filtersTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
    },
    filterSection: {
      padding: theme.spacing.md,
    },
    filterSectionTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
      marginBottom: theme.spacing.md,
      textAlign: isRTL ? 'right' : 'left',
    },
    radioItem: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
    },
    radioLabel: {
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.regular,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
    },
    checkboxItem: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    checkboxContent: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    checkboxLabel: {
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.regular,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
    },
    ratingOptions: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      gap: theme.spacing.sm,
    },
    ratingChip: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      backgroundColor: isDarkMode ? theme.colors.backgroundDark : theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.star,
    },
    ratingChipActive: {
      backgroundColor: theme.colors.star,
    },
    ratingChipText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.star,
    },
    ratingChipTextActive: {
      color: '#fff',
    },
    locationOptions: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      gap: theme.spacing.sm,
    },
    locationChip: {
      marginRight: theme.spacing.sm,
    },
    filtersFooter: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    applyButton: {
      borderRadius: theme.borderRadius.full,
    },
  });
