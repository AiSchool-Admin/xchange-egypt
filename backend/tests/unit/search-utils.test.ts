/**
 * Search Utilities Tests
 * Tests search-related functions and algorithms
 */

describe('Search Utilities Tests', () => {
  // ============================================
  // Text Search Utilities
  // ============================================

  describe('Text Search', () => {
    const normalizeArabicText = (text: string): string => {
      return text
        .replace(/[أإآا]/g, 'ا')
        .replace(/[ة]/g, 'ه')
        .replace(/[ى]/g, 'ي')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
    };

    const searchScore = (query: string, text: string): number => {
      const normalizedQuery = normalizeArabicText(query);
      const normalizedText = normalizeArabicText(text);

      if (normalizedText === normalizedQuery) return 100;
      if (normalizedText.includes(normalizedQuery)) return 80;
      if (normalizedText.startsWith(normalizedQuery)) return 90;

      const words = normalizedQuery.split(' ');
      const matchedWords = words.filter((w) => normalizedText.includes(w));
      return (matchedWords.length / words.length) * 60;
    };

    it('should normalize Arabic text correctly', () => {
      expect(normalizeArabicText('أحمد')).toBe('احمد');
      expect(normalizeArabicText('إسلام')).toBe('اسلام');
      expect(normalizeArabicText('مدرسة')).toBe('مدرسه');
    });

    it('should handle multiple spaces', () => {
      expect(normalizeArabicText('كلمة   أخرى')).toBe('كلمه اخري');
    });

    it('should score exact matches highest', () => {
      expect(searchScore('iPhone', 'iPhone')).toBe(100);
    });

    it('should score partial matches', () => {
      expect(searchScore('iPhone', 'iPhone 15 Pro')).toBe(80);
    });

    it('should score word matches', () => {
      const score = searchScore('red car', 'blue car fast');
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(80);
    });
  });

  // ============================================
  // Filter Utilities
  // ============================================

  describe('Filter Utilities', () => {
    interface Item {
      id: string;
      price: number;
      category: string;
      condition: string;
      governorate: string;
    }

    const items: Item[] = [
      { id: '1', price: 1000, category: 'electronics', condition: 'new', governorate: 'Cairo' },
      { id: '2', price: 500, category: 'electronics', condition: 'used', governorate: 'Alexandria' },
      { id: '3', price: 2000, category: 'vehicles', condition: 'new', governorate: 'Cairo' },
      { id: '4', price: 300, category: 'furniture', condition: 'used', governorate: 'Giza' },
    ];

    const filterByPriceRange = (items: Item[], min: number, max: number): Item[] => {
      return items.filter((item) => item.price >= min && item.price <= max);
    };

    const filterByCategory = (items: Item[], category: string): Item[] => {
      return items.filter((item) => item.category === category);
    };

    const filterByCondition = (items: Item[], condition: string): Item[] => {
      return items.filter((item) => item.condition === condition);
    };

    const filterByGovernorate = (items: Item[], governorate: string): Item[] => {
      return items.filter((item) => item.governorate === governorate);
    };

    it('should filter by price range', () => {
      const result = filterByPriceRange(items, 400, 1500);
      expect(result).toHaveLength(2);
      expect(result.map((i) => i.id)).toEqual(['1', '2']);
    });

    it('should filter by category', () => {
      const result = filterByCategory(items, 'electronics');
      expect(result).toHaveLength(2);
    });

    it('should filter by condition', () => {
      const newItems = filterByCondition(items, 'new');
      expect(newItems).toHaveLength(2);

      const usedItems = filterByCondition(items, 'used');
      expect(usedItems).toHaveLength(2);
    });

    it('should filter by governorate', () => {
      const cairoItems = filterByGovernorate(items, 'Cairo');
      expect(cairoItems).toHaveLength(2);
    });

    it('should handle no matches', () => {
      const result = filterByCategory(items, 'nonexistent');
      expect(result).toHaveLength(0);
    });
  });

  // ============================================
  // Sorting Utilities
  // ============================================

  describe('Sorting Utilities', () => {
    interface Item {
      id: string;
      price: number;
      createdAt: Date;
      views: number;
    }

    const items: Item[] = [
      { id: '1', price: 1000, createdAt: new Date('2024-01-01'), views: 100 },
      { id: '2', price: 500, createdAt: new Date('2024-01-15'), views: 50 },
      { id: '3', price: 2000, createdAt: new Date('2024-01-10'), views: 200 },
    ];

    const sortByPrice = (items: Item[], ascending: boolean = true): Item[] => {
      return [...items].sort((a, b) =>
        ascending ? a.price - b.price : b.price - a.price
      );
    };

    const sortByDate = (items: Item[], newest: boolean = true): Item[] => {
      return [...items].sort((a, b) =>
        newest
          ? b.createdAt.getTime() - a.createdAt.getTime()
          : a.createdAt.getTime() - b.createdAt.getTime()
      );
    };

    const sortByPopularity = (items: Item[]): Item[] => {
      return [...items].sort((a, b) => b.views - a.views);
    };

    it('should sort by price ascending', () => {
      const result = sortByPrice(items, true);
      expect(result[0].id).toBe('2');
      expect(result[2].id).toBe('3');
    });

    it('should sort by price descending', () => {
      const result = sortByPrice(items, false);
      expect(result[0].id).toBe('3');
      expect(result[2].id).toBe('2');
    });

    it('should sort by date newest first', () => {
      const result = sortByDate(items, true);
      expect(result[0].id).toBe('2');
    });

    it('should sort by date oldest first', () => {
      const result = sortByDate(items, false);
      expect(result[0].id).toBe('1');
    });

    it('should sort by popularity', () => {
      const result = sortByPopularity(items);
      expect(result[0].id).toBe('3');
      expect(result[2].id).toBe('2');
    });
  });

  // ============================================
  // Pagination Utilities
  // ============================================

  describe('Pagination Utilities', () => {
    const paginate = <T>(
      items: T[],
      page: number,
      limit: number
    ): { data: T[]; totalPages: number; hasMore: boolean } => {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const data = items.slice(startIndex, endIndex);
      const totalPages = Math.ceil(items.length / limit);

      return {
        data,
        totalPages,
        hasMore: page < totalPages,
      };
    };

    const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

    it('should return correct page of items', () => {
      const result = paginate(items, 1, 10);
      expect(result.data).toHaveLength(10);
      expect(result.data[0].id).toBe(1);
    });

    it('should calculate total pages correctly', () => {
      const result = paginate(items, 1, 10);
      expect(result.totalPages).toBe(3);
    });

    it('should indicate if there are more pages', () => {
      expect(paginate(items, 1, 10).hasMore).toBe(true);
      expect(paginate(items, 3, 10).hasMore).toBe(false);
    });

    it('should handle last page with fewer items', () => {
      const result = paginate(items, 3, 10);
      expect(result.data).toHaveLength(5);
    });

    it('should handle empty results for out of range pages', () => {
      const result = paginate(items, 10, 10);
      expect(result.data).toHaveLength(0);
    });
  });

  // ============================================
  // Location-based Search
  // ============================================

  describe('Location-based Search', () => {
    const EGYPTIAN_GOVERNORATES = [
      'Cairo', 'Giza', 'Alexandria', 'Dakahlia', 'Sharqia',
      'Qalyubia', 'Gharbia', 'Monufia', 'Beheira', 'Kafr El Sheikh',
    ];

    const isValidGovernorate = (governorate: string): boolean => {
      return EGYPTIAN_GOVERNORATES.includes(governorate);
    };

    const getNeighboringGovernorates = (governorate: string): string[] => {
      const neighbors: Record<string, string[]> = {
        Cairo: ['Giza', 'Qalyubia'],
        Giza: ['Cairo', 'Faiyum', 'Beni Suef'],
        Alexandria: ['Beheira', 'Matrouh'],
      };
      return neighbors[governorate] || [];
    };

    it('should validate Egyptian governorates', () => {
      expect(isValidGovernorate('Cairo')).toBe(true);
      expect(isValidGovernorate('InvalidCity')).toBe(false);
    });

    it('should return neighboring governorates', () => {
      const neighbors = getNeighboringGovernorates('Cairo');
      expect(neighbors).toContain('Giza');
      expect(neighbors).toContain('Qalyubia');
    });

    it('should return empty array for unknown governorate', () => {
      expect(getNeighboringGovernorates('Unknown')).toEqual([]);
    });
  });
});
