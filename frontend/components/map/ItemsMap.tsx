'use client';

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Item } from '@/lib/api/items';
import 'leaflet/dist/leaflet.css';

// Egypt governorate coordinates
const GOVERNORATE_COORDS: Record<string, [number, number]> = {
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
};

// Default Egypt center
const EGYPT_CENTER: [number, number] = [26.8206, 30.8025];
const DEFAULT_ZOOM = 6;

interface ItemsMapProps {
  items: Item[];
  selectedGovernorate?: string | null;
  onGovernorateSelect?: (governorate: string | null) => void;
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

  if (!coords) return null;

  return (
    <Marker position={coords}>
      <Popup>
        <div className="min-w-[200px]" dir="rtl">
          {item.images && item.images.length > 0 && (
            <img
              src={item.images[0].url}
              alt={item.title}
              className="w-full h-24 object-cover rounded mb-2"
            />
          )}
          <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{item.title}</h3>
          <p className="text-emerald-600 font-bold mb-2">{formatPrice(item.estimatedValue || 0)} ج.م</p>
          <div className="text-xs text-gray-500 mb-2">
            {item.governorate || 'مصر'}
          </div>
          <Link
            href={`/items/${item.id}`}
            className="block text-center py-2 bg-emerald-500 text-white rounded text-sm font-medium hover:bg-emerald-600"
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
  const coords = GOVERNORATE_COORDS[governorate];
  if (!coords) return null;

  return (
    <Marker position={coords}>
      <Popup>
        <div className="text-center p-2" dir="rtl">
          <h3 className="font-bold text-lg mb-1">{governorate}</h3>
          <p className="text-gray-600 mb-2">{itemCount} إعلان</p>
          <button
            onClick={onClick}
            className="w-full py-2 bg-emerald-500 text-white rounded text-sm font-medium hover:bg-emerald-600"
          >
            عرض الإعلانات
          </button>
        </div>
      </Popup>
    </Marker>
  );
}

export default function ItemsMap({
  items,
  selectedGovernorate,
  onGovernorateSelect,
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

  // Filter items for selected governorate
  const displayItems = useMemo(() => {
    if (!selectedGovernorate) return items;
    return items.filter((item) => item.governorate === selectedGovernorate);
  }, [items, selectedGovernorate]);

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
    <div className="relative" dir="rtl">
      {/* Filters */}
      {showFilters && (
        <div className="absolute top-4 right-4 z-[1000] bg-white rounded-xl shadow-lg p-3 flex gap-2">
          <button
            onClick={() => setViewMode('governorates')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              viewMode === 'governorates'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            المحافظات
          </button>
          <button
            onClick={() => setViewMode('items')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              viewMode === 'items'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            الإعلانات
          </button>
        </div>
      )}

      {/* Selected Governorate Info */}
      {selectedGovernorate && (
        <div className="absolute top-4 left-4 z-[1000] bg-white rounded-xl shadow-lg p-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">{selectedGovernorate}</span>
            <span className="text-sm text-gray-500">
              ({itemsByGovernorate[selectedGovernorate]?.length || 0} إعلان)
            </span>
            <button
              onClick={() => onGovernorateSelect?.(null)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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
        className="rounded-xl z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {viewMode === 'governorates' ? (
          // Show governorate clusters
          Object.entries(itemsByGovernorate).map(([gov, govItems]) => (
            <GovernorateMarker
              key={gov}
              governorate={gov}
              itemCount={govItems.length}
              onClick={() => onGovernorateSelect?.(gov)}
            />
          ))
        ) : (
          // Show individual items
          displayItems.map((item) => (
            <ItemMarker key={item.id} item={item} />
          ))
        )}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white rounded-xl shadow-lg p-3">
        <div className="text-xs text-gray-500 mb-1">إجمالي الإعلانات</div>
        <div className="text-lg font-bold text-emerald-600">{items.length}</div>
      </div>
    </div>
  );
}
