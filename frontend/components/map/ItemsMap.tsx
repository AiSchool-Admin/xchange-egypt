'use client';

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Item, getPrimaryImageUrl } from '@/lib/api/items';
import 'leaflet/dist/leaflet.css';
import {
  createGovernorateIcon,
  createItemIcon,
  getGovernorateArabicName,
} from './MapIcons';

// Egypt governorate coordinates (Arabic and English names)
const GOVERNORATE_COORDS: Record<string, [number, number]> = {
  // Arabic names
  'القاهرة': [30.0444, 31.2357],
  'الجيزة': [30.0131, 31.2089],
  'الإسكندرية': [31.2001, 29.9187],
  'الدقهلية': [31.0409, 31.3785],
  'الشرقية': [30.7327, 31.7195],
  'القليوبية': [30.3297, 31.2421],
  'المنوفية': [30.5972, 30.9876],
  'الغربية': [30.8754, 31.0297],
  'البحيرة': [31.1107, 30.4684],
  'كفر الشيخ': [31.3085, 30.9395],
  'دمياط': [31.4175, 31.8133],
  'بورسعيد': [31.2653, 32.3019],
  'الإسماعيلية': [30.5965, 32.2715],
  'السويس': [29.9668, 32.5498],
  'شمال سيناء': [31.0000, 33.8000],
  'جنوب سيناء': [28.9000, 34.1000],
  'البحر الأحمر': [26.0000, 34.0000],
  'الفيوم': [29.3084, 30.8428],
  'بني سويف': [29.0661, 31.0994],
  'المنيا': [28.1099, 30.7503],
  'أسيوط': [27.1783, 31.1837],
  'سوهاج': [26.5569, 31.6948],
  'قنا': [26.1551, 32.7160],
  'الأقصر': [25.6872, 32.6396],
  'أسوان': [24.0889, 32.8998],
  'الوادي الجديد': [25.4500, 30.5500],
  'مطروح': [31.3525, 27.2453],
  // English names (for compatibility with database)
  'Cairo': [30.0444, 31.2357],
  'cairo': [30.0444, 31.2357],
  'Giza': [30.0131, 31.2089],
  'giza': [30.0131, 31.2089],
  'Alexandria': [31.2001, 29.9187],
  'alexandria': [31.2001, 29.9187],
  'Dakahlia': [31.0409, 31.3785],
  'dakahlia': [31.0409, 31.3785],
  'Sharqia': [30.7327, 31.7195],
  'sharqia': [30.7327, 31.7195],
  'Qalyubia': [30.3297, 31.2421],
  'qalyubia': [30.3297, 31.2421],
  'Menoufia': [30.5972, 30.9876],
  'menoufia': [30.5972, 30.9876],
  'Gharbia': [30.8754, 31.0297],
  'gharbia': [30.8754, 31.0297],
  'Beheira': [31.1107, 30.4684],
  'beheira': [31.1107, 30.4684],
  'Kafr El Sheikh': [31.3085, 30.9395],
  'kafr-el-sheikh': [31.3085, 30.9395],
  'Damietta': [31.4175, 31.8133],
  'damietta': [31.4175, 31.8133],
  'Port Said': [31.2653, 32.3019],
  'port-said': [31.2653, 32.3019],
  'Ismailia': [30.5965, 32.2715],
  'ismailia': [30.5965, 32.2715],
  'Suez': [29.9668, 32.5498],
  'suez': [29.9668, 32.5498],
  'North Sinai': [31.0000, 33.8000],
  'north-sinai': [31.0000, 33.8000],
  'South Sinai': [28.9000, 34.1000],
  'south-sinai': [28.9000, 34.1000],
  'Red Sea': [26.0000, 34.0000],
  'red-sea': [26.0000, 34.0000],
  'Fayoum': [29.3084, 30.8428],
  'fayoum': [29.3084, 30.8428],
  'Beni Suef': [29.0661, 31.0994],
  'beni-suef': [29.0661, 31.0994],
  'Minya': [28.1099, 30.7503],
  'minya': [28.1099, 30.7503],
  'Assiut': [27.1783, 31.1837],
  'assiut': [27.1783, 31.1837],
  'Sohag': [26.5569, 31.6948],
  'sohag': [26.5569, 31.6948],
  'Qena': [26.1551, 32.7160],
  'qena': [26.1551, 32.7160],
  'Luxor': [25.6872, 32.6396],
  'luxor': [25.6872, 32.6396],
  'Aswan': [24.0889, 32.8998],
  'aswan': [24.0889, 32.8998],
  'New Valley': [25.4500, 30.5500],
  'new-valley': [25.4500, 30.5500],
  'Matrouh': [31.3525, 27.2453],
  'matrouh': [31.3525, 27.2453],
};

// Default Egypt center
const EGYPT_CENTER: [number, number] = [26.8206, 30.8025];
const DEFAULT_ZOOM = 6;

interface ItemsMapProps {
  items: Item[];
  selectedGovernorate?: string | null;
  selectedCity?: string | null;
  onGovernorateSelect?: (governorate: string | null) => void;
  onCitySelect?: (city: string | null) => void;
  height?: string;
  showFilters?: boolean;
}

// Dynamically import map components (no SSR)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// Marker cluster for better performance with many items
function ItemMarker({ item }: { item: Item }) {
  const [icon, setIcon] = useState<any>(null);

  useEffect(() => {
    // Create icon on client side only
    const newIcon = createItemIcon(
      getPrimaryImageUrl(item.images),
      item.category?.slug,
      item.isFeatured || (item.promotionTier && item.promotionTier !== 'BASIC')
    );
    setIcon(newIcon);
  }, [item]);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} مليون`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)} ألف`;
    }
    return price.toLocaleString('ar-EG');
  };

  // Get coordinates from governorate
  const coords = item.governorate && GOVERNORATE_COORDS[item.governorate]
    ? GOVERNORATE_COORDS[item.governorate]
    : null;

  if (!coords || !icon) return null;

  // Add slight offset for items in same governorate to avoid overlap
  const offset = Math.random() * 0.1 - 0.05;
  const position: [number, number] = [coords[0] + offset, coords[1] + offset];

  return (
    <Marker position={position} icon={icon}>
      <Popup>
        <div className="min-w-[220px] max-w-[280px]" dir="rtl">
          {getPrimaryImageUrl(item.images) && (
            <img
              src={getPrimaryImageUrl(item.images)}
              alt={item.title}
              className="w-full h-32 object-cover rounded-lg mb-3"
            />
          )}
          <h3 className="font-bold text-gray-900 mb-1 text-base line-clamp-2">{item.title}</h3>
          <p className="text-emerald-600 font-bold text-lg mb-2">{formatPrice(item.estimatedValue || 0)} ج.م</p>

          {/* Location info */}
          <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
            {item.governorate && (
              <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                <span>📍</span> {getGovernorateArabicName(item.governorate)}
              </span>
            )}
            {item.city && (
              <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                <span>🏘️</span> {item.city}
              </span>
            )}
            {item.district && (
              <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                <span>🏠</span> {item.district}
              </span>
            )}
          </div>

          {/* Category badge */}
          {item.category && (
            <span className="inline-block bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full mb-3">
              {item.category.nameAr}
            </span>
          )}

          {/* Featured badge */}
          {(item.isFeatured || item.promotionTier) && (
            <div className="flex items-center gap-1 text-amber-600 text-xs mb-3">
              <span>⭐</span>
              <span>إعلان مميز</span>
            </div>
          )}

          <Link
            href={`/items/${item.id}`}
            className="block text-center py-2.5 bg-gradient-to-l from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm"
          >
            عرض التفاصيل
          </Link>
        </div>
      </Popup>
    </Marker>
  );
}

// Governorate cluster marker
function GovernorateMarker({
  governorate,
  itemCount,
  onClick,
}: {
  governorate: string;
  itemCount: number;
  onClick: () => void;
}) {
  const [icon, setIcon] = useState<any>(null);
  const coords = GOVERNORATE_COORDS[governorate];

  useEffect(() => {
    if (coords) {
      const displayName = getGovernorateArabicName(governorate);
      const newIcon = createGovernorateIcon(displayName, itemCount);
      setIcon(newIcon);
    }
  }, [governorate, itemCount, coords]);

  if (!coords || !icon) return null;

  return (
    <Marker position={coords} icon={icon} eventHandlers={{ click: onClick }}>
      <Popup>
        <div className="text-center p-3 min-w-[180px]" dir="rtl">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
            <span className="text-white font-bold text-lg">{itemCount}</span>
          </div>
          <h3 className="font-bold text-lg text-gray-900 mb-1">{getGovernorateArabicName(governorate)}</h3>
          <p className="text-gray-600 text-sm mb-3">{itemCount} إعلان متاح</p>
          <button
            onClick={onClick}
            className="w-full py-2.5 bg-gradient-to-l from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm"
          >
            استعراض الإعلانات
          </button>
        </div>
      </Popup>
    </Marker>
  );
}

export default function ItemsMap({
  items,
  selectedGovernorate,
  selectedCity,
  onGovernorateSelect,
  onCitySelect,
  height = '500px',
  showFilters = true,
}: ItemsMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [viewMode, setViewMode] = useState<'items' | 'governorates'>('governorates');

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Group items by governorate
  const itemsByGovernorate = useMemo(() => {
    const grouped: Record<string, Item[]> = {};
    items.forEach((item) => {
      const gov = item.governorate || 'أخرى';
      if (!grouped[gov]) grouped[gov] = [];
      grouped[gov].push(item);
    });
    return grouped;
  }, [items]);

  // Filter items for display
  const displayItems = useMemo(() => {
    let filtered = items;
    if (selectedGovernorate) {
      filtered = filtered.filter((item) => item.governorate === selectedGovernorate);
    }
    if (selectedCity) {
      filtered = filtered.filter((item) => item.city === selectedCity);
    }
    return filtered;
  }, [items, selectedGovernorate, selectedCity]);

  if (!isClient) {
    return (
      <div className="bg-gray-100 rounded-xl flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">جاري تحميل الخريطة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg" dir="rtl">
      {/* View Mode Toggle */}
      {showFilters && (
        <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-2 flex gap-2">
          <button
            onClick={() => setViewMode('governorates')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'governorates'
                ? 'bg-gradient-to-l from-emerald-500 to-teal-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>🗺️</span>
              المحافظات
            </span>
          </button>
          <button
            onClick={() => setViewMode('items')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'items'
                ? 'bg-gradient-to-l from-emerald-500 to-teal-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>📍</span>
              الإعلانات
            </span>
          </button>
        </div>
      )}

      {/* Selected Location Info */}
      {(selectedGovernorate || selectedCity) && (
        <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3">
          <div className="flex items-center gap-2 flex-wrap">
            {selectedGovernorate && (
              <span className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-medium">
                <span>📍</span>
                {getGovernorateArabicName(selectedGovernorate)}
                <button
                  onClick={() => onGovernorateSelect?.(null)}
                  className="hover:bg-emerald-200 rounded-full p-0.5 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {selectedCity && (
              <span className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium">
                <span>🏘️</span>
                {selectedCity}
                <button
                  onClick={() => onCitySelect?.(null)}
                  className="hover:bg-blue-200 rounded-full p-0.5 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            <span className="text-sm text-gray-500">
              ({displayItems.length} إعلان)
            </span>
          </div>
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={selectedGovernorate && GOVERNORATE_COORDS[selectedGovernorate]
          ? GOVERNORATE_COORDS[selectedGovernorate]
          : EGYPT_CENTER}
        zoom={selectedGovernorate ? 10 : DEFAULT_ZOOM}
        style={{ height, width: '100%' }}
        className="z-0"
      >
        {/* Modern map tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {viewMode === 'governorates' ? (
          // Show governorate clusters
          Object.entries(itemsByGovernorate).map(([gov, govItems]) => (
            <GovernorateMarker
              key={gov}
              governorate={gov}
              itemCount={govItems.length}
              onClick={() => {
                onGovernorateSelect?.(gov);
                setViewMode('items');
              }}
            />
          ))
        ) : (
          // Show individual items
          displayItems.map((item) => (
            <ItemMarker key={item.id} item={item} />
          ))
        )}
      </MapContainer>

      {/* Stats Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-l from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              {displayItems.length}
            </div>
            <div className="text-xs text-gray-500">إعلان</div>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-l from-blue-500 to-indigo-500 bg-clip-text text-transparent">
              {Object.keys(itemsByGovernorate).length}
            </div>
            <div className="text-xs text-gray-500">محافظة</div>
          </div>
        </div>
      </div>

      {/* Map Style Credit */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <span className="text-xs text-gray-400 bg-white/80 px-2 py-1 rounded">
          خريطة تفاعلية
        </span>
      </div>
    </div>
  );
}
