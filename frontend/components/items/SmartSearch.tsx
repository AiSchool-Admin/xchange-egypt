'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface SearchSuggestion {
  type: 'history' | 'popular' | 'category' | 'item';
  text: string;
  icon: string;
  href?: string;
  count?: number;
}

interface SmartSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  placeholder?: string;
  categories?: Array<{ id: string; nameAr: string; slug: string; itemCount?: number }>;
}

// Popular searches - could be fetched from API
const POPULAR_SEARCHES = [
  { text: 'ايفون', icon: '📱', count: 1250 },
  { text: 'سيارة', icon: '🚗', count: 890 },
  { text: 'شقة', icon: '🏠', count: 2100 },
  { text: 'لابتوب', icon: '💻', count: 650 },
  { text: 'ذهب', icon: '💰', count: 430 },
  { text: 'موبايل سامسونج', icon: '📱', count: 780 },
  { text: 'اثاث', icon: '🪑', count: 560 },
  { text: 'ملابس', icon: '👕', count: 920 },
];

// Trending searches with fire emoji
const TRENDING_SEARCHES = [
  'ايفون 15 برو',
  'بلايستيشن 5',
  'ماك بوك',
  'سامسونج S24',
];

export default function SmartSearch({
  value,
  onChange,
  onSearch,
  placeholder = 'ابحث عن أي شيء...',
  categories = [],
}: SmartSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Voice search state
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isFocused, setIsFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('xchange_search_history');
    if (history) {
      try {
        setSearchHistory(JSON.parse(history).slice(0, 5));
      } catch (e) {
        console.error('Failed to parse search history');
      }
    }
  }, []);

  // Check for voice search support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setVoiceSupported(!!SpeechRecognition);
    }
  }, []);

  // Voice search function
  const startVoiceSearch = useCallback(() => {
    if (!voiceSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'ar-EG'; // Arabic (Egypt)
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let transcript = event.results[0][0].transcript;
      // Remove trailing punctuation (period, comma, Arabic punctuation) that speech recognition adds
      transcript = transcript.replace(/[.\u060C\u061B\u061F،؛؟,;?!]+$/g, '').trim();
      onChange(transcript);
      onSearch(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Voice search error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [voiceSupported, onChange, onSearch]);

  // Save to search history
  const saveToHistory = useCallback((searchText: string) => {
    if (!searchText.trim()) return;

    const history = localStorage.getItem('xchange_search_history');
    let historyArr: string[] = [];
    try {
      historyArr = history ? JSON.parse(history) : [];
    } catch (e) {
      historyArr = [];
    }

    // Remove duplicate and add to front
    historyArr = historyArr.filter(h => h.toLowerCase() !== searchText.toLowerCase());
    historyArr.unshift(searchText);
    historyArr = historyArr.slice(0, 10); // Keep only 10 items

    localStorage.setItem('xchange_search_history', JSON.stringify(historyArr));
    setSearchHistory(historyArr.slice(0, 5));
  }, []);

  // Generate suggestions based on input
  useEffect(() => {
    const newSuggestions: SearchSuggestion[] = [];
    const searchLower = value.toLowerCase().trim();

    if (!searchLower) {
      // Show history and popular when empty
      searchHistory.forEach(h => {
        newSuggestions.push({
          type: 'history',
          text: h,
          icon: '🕐',
        });
      });

      POPULAR_SEARCHES.slice(0, 5).forEach(p => {
        if (!searchHistory.includes(p.text)) {
          newSuggestions.push({
            type: 'popular',
            text: p.text,
            icon: p.icon,
            count: p.count,
          });
        }
      });
    } else {
      // Filter history
      searchHistory
        .filter(h => h.toLowerCase().includes(searchLower))
        .slice(0, 2)
        .forEach(h => {
          newSuggestions.push({
            type: 'history',
            text: h,
            icon: '🕐',
          });
        });

      // Filter popular searches
      POPULAR_SEARCHES
        .filter(p => p.text.toLowerCase().includes(searchLower))
        .slice(0, 3)
        .forEach(p => {
          newSuggestions.push({
            type: 'popular',
            text: p.text,
            icon: p.icon,
            count: p.count,
          });
        });

      // Filter categories
      categories
        .filter(c => c.nameAr.toLowerCase().includes(searchLower))
        .slice(0, 3)
        .forEach(c => {
          newSuggestions.push({
            type: 'category',
            text: c.nameAr,
            icon: '📂',
            href: `/items?category=${c.slug}`,
            count: c.itemCount,
          });
        });
    }

    setSuggestions(newSuggestions);
    setSelectedIndex(-1);
  }, [value, searchHistory, categories]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleSearch = () => {
    if (value.trim()) {
      saveToHistory(value.trim());
      onSearch(value.trim());
    }
    setIsFocused(false);
  };

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    if (suggestion.href) {
      router.push(suggestion.href);
    } else {
      onChange(suggestion.text);
      saveToHistory(suggestion.text);
      onSearch(suggestion.text);
    }
    setIsFocused(false);
  };

  const clearHistory = () => {
    localStorage.removeItem('xchange_search_history');
    setSearchHistory([]);
  };

  const removeFromHistory = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter(h => h !== text);
    setSearchHistory(newHistory);
    localStorage.setItem('xchange_search_history', JSON.stringify(newHistory));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-24 pr-5 py-4 bg-white rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all outline-none placeholder-gray-400 text-gray-900 text-lg shadow-sm"
        />

        {/* Voice Search Button */}
        {voiceSupported && (
          <button
            onClick={startVoiceSearch}
            disabled={isListening}
            className={`absolute left-14 top-1/2 -translate-y-1/2 p-2 transition-all ${
              isListening
                ? 'text-red-500 animate-pulse'
                : 'text-gray-400 hover:text-emerald-600'
            }`}
            title={isListening ? 'جاري الاستماع...' : 'البحث الصوتي'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        )}

        {/* Listening Indicator */}
        {isListening && (
          <div className="absolute left-24 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            <span className="text-sm text-red-500 font-medium">تحدث الآن...</span>
          </div>
        )}

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Clear Button */}
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute left-24 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isFocused && (suggestions.length > 0 || !value) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Trending Searches - shown when empty */}
          {!value && (
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <span>🔥</span>
                <span>الأكثر بحثاً الآن</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onChange(term);
                      saveToHistory(term);
                      onSearch(term);
                      setIsFocused(false);
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 rounded-full text-sm font-medium hover:from-orange-100 hover:to-red-100 transition-colors border border-orange-100"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* History Header */}
          {searchHistory.length > 0 && !value && (
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <span className="text-sm text-gray-500">🕐 عمليات البحث الأخيرة</span>
              <button
                onClick={clearHistory}
                className="text-xs text-red-500 hover:text-red-600"
              >
                مسح الكل
              </button>
            </div>
          )}

          {/* Suggestions List */}
          <div className="max-h-80 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.text}`}
                onClick={() => handleSelectSuggestion(suggestion)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-right transition-colors ${
                  index === selectedIndex
                    ? 'bg-emerald-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-xl w-8 text-center">{suggestion.icon}</span>
                <span className="flex-1 text-gray-800">{suggestion.text}</span>
                {suggestion.count && (
                  <span className="text-sm text-gray-400">
                    {suggestion.count.toLocaleString('ar-EG')} منتج
                  </span>
                )}
                {suggestion.type === 'history' && (
                  <button
                    onClick={(e) => removeFromHistory(suggestion.text, e)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {suggestion.type === 'category' && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                    فئة
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Tip */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono">Enter</span>
              <span>للبحث</span>
              <span className="mx-2">•</span>
              <span className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono">↑↓</span>
              <span>للتنقل</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
