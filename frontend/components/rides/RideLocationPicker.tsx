'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Egypt default center (Cairo)
const EGYPT_CENTER: [number, number] = [30.0444, 31.2357];
const DEFAULT_ZOOM = 12;

// Popular locations for quick selection
const POPULAR_LOCATIONS = [
  { id: 'cairo-airport', name: 'مطار القاهرة', nameEn: 'Cairo Airport', lat: 30.1219, lng: 31.4056, icon: '✈️' },
  { id: 'tahrir', name: 'ميدان التحرير', nameEn: 'Tahrir Square', lat: 30.0444, lng: 31.2357, icon: '🏛️' },
  { id: 'citystars', name: 'سيتي ستارز', nameEn: 'City Stars', lat: 30.0729, lng: 31.3456, icon: '🏬' },
  { id: 'mall-egypt', name: 'مول مصر', nameEn: 'Mall of Egypt', lat: 29.9725, lng: 31.0167, icon: '🏬' },
  { id: 'pyramids', name: 'الأهرامات', nameEn: 'Pyramids', lat: 29.9792, lng: 31.1342, icon: '🔺' },
  { id: 'maadi', name: 'المعادي', nameEn: 'Maadi', lat: 29.9602, lng: 31.2569, icon: '🏘️' },
  { id: 'nasr-city', name: 'مدينة نصر', nameEn: 'Nasr City', lat: 30.0511, lng: 31.3656, icon: '🏘️' },
  { id: 'heliopolis', name: 'مصر الجديدة', nameEn: 'Heliopolis', lat: 30.0866, lng: 31.3381, icon: '🏘️' },
  { id: 'zamalek', name: 'الزمالك', nameEn: 'Zamalek', lat: 30.0609, lng: 31.2193, icon: '🏘️' },
  { id: 'downtown', name: 'وسط البلد', nameEn: 'Downtown', lat: 30.0459, lng: 31.2243, icon: '🏙️' },
  { id: 'new-cairo', name: 'التجمع الخامس', nameEn: 'New Cairo', lat: 30.0131, lng: 31.4913, icon: '🏘️' },
  { id: 'sheikh-zayed', name: 'الشيخ زايد', nameEn: 'Sheikh Zayed', lat: 30.0392, lng: 30.9876, icon: '🏘️' },
];

export interface RideLocation {
  lat: number;
  lng: number;
  name: string;
  nameEn?: string;
  address?: string;
}

interface RideLocationPickerProps {
  mode: 'pickup' | 'dropoff';
  value: RideLocation | null;
  onChange: (location: RideLocation) => void;
  onClose: () => void;
  otherLocation?: RideLocation | null;
}

// Reverse geocode to get address from coordinates
const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ar`
    );
    const data = await response.json();
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

// Dynamic import of the Map component
const LocationPickerMap = dynamic(
  () => import('./LocationPickerMap'),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">جاري تحميل الخريطة...</p>
        </div>
      </div>
    )
  }
);

export default function RideLocationPicker({
  mode,
  value,
  onChange,
  onClose,
  otherLocation,
}: RideLocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<RideLocation | null>(value);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    value ? [value.lat, value.lng] : EGYPT_CENTER
  );

  // Handle map click
  const handleMapClick = async (lat: number, lng: number) => {
    setIsLoadingAddress(true);
    const address = await getAddressFromCoords(lat, lng);
    const location: RideLocation = {
      lat,
      lng,
      name: address.split(',')[0] || 'موقع على الخريطة',
      address,
    };
    setSelectedLocation(location);
    setIsLoadingAddress(false);
  };

  // Get current GPS location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('المتصفح لا يدعم خدمة الموقع');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setIsLoadingAddress(true);
        const address = await getAddressFromCoords(latitude, longitude);
        const location: RideLocation = {
          lat: latitude,
          lng: longitude,
          name: 'موقعي الحالي',
          nameEn: 'My Location',
          address,
        };
        setSelectedLocation(location);
        setMapCenter([latitude, longitude]);
        setIsLoadingAddress(false);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('تعذر الحصول على موقعك. تأكد من تفعيل خدمة الموقع.');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Select popular location
  const selectPopularLocation = (loc: typeof POPULAR_LOCATIONS[0]) => {
    setSelectedLocation({
      lat: loc.lat,
      lng: loc.lng,
      name: loc.name,
      nameEn: loc.nameEn,
    });
    setMapCenter([loc.lat, loc.lng]);
  };

  // Filter popular locations
  const filteredLocations = searchQuery
    ? POPULAR_LOCATIONS.filter(
        (loc) =>
          loc.name.includes(searchQuery) ||
          loc.nameEn?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : POPULAR_LOCATIONS;

  // Confirm selection
  const confirmSelection = () => {
    if (selectedLocation) {
      onChange(selectedLocation);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`p-4 ${mode === 'pickup' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{mode === 'pickup' ? '🟢' : '🔴'}</span>
              <div>
                <h2 className="text-xl font-bold">
                  {mode === 'pickup' ? 'اختر نقطة الانطلاق' : 'اختر الوجهة'}
                </h2>
                <p className="text-sm opacity-80">
                  اضغط على الخريطة أو اختر من الأماكن الشائعة
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar */}
          <div className="w-full md:w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن مكان..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            {/* Current Location Button */}
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {isGettingLocation ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري تحديد الموقع...</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl">📍</span>
                    <span className="font-medium">استخدم موقعي الحالي</span>
                  </>
                )}
              </button>
            </div>

            {/* Popular Locations */}
            <div className="p-4">
              <h3 className="text-sm font-bold text-gray-500 mb-3">أماكن شائعة</h3>
              <div className="space-y-2">
                {filteredLocations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => selectPopularLocation(loc)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-right ${
                      selectedLocation?.lat === loc.lat && selectedLocation?.lng === loc.lng
                        ? 'bg-purple-100 border-2 border-purple-500'
                        : 'bg-white hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <span className="text-xl">{loc.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{loc.name}</div>
                      <div className="text-sm text-gray-500">{loc.nameEn}</div>
                    </div>
                    {selectedLocation?.lat === loc.lat && selectedLocation?.lng === loc.lng && (
                      <span className="text-purple-600">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 relative min-h-[400px]">
            <LocationPickerMap
              center={mapCenter}
              zoom={value ? 15 : DEFAULT_ZOOM}
              selectedLocation={selectedLocation}
              otherLocation={otherLocation}
              mode={mode}
              onMapClick={handleMapClick}
              onCenterChange={setMapCenter}
            />

            {/* Loading address indicator */}
            {isLoadingAddress && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-[1000]">
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">جاري تحديد العنوان...</span>
              </div>
            )}

            {/* Instructions overlay */}
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-xs bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 z-[1000]">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-lg">👆</span>
                <span>اضغط على أي نقطة في الخريطة لتحديدها</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with selected location and confirm button */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              {selectedLocation ? (
                <div className="flex items-center gap-3">
                  <span className={`w-10 h-10 ${mode === 'pickup' ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center`}>
                    {mode === 'pickup' ? '🟢' : '🔴'}
                  </span>
                  <div>
                    <p className="font-bold text-gray-900">{selectedLocation.name}</p>
                    <p className="text-sm text-gray-500">
                      {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">لم تحدد موقعاً بعد</p>
              )}
            </div>
            <button
              onClick={confirmSelection}
              disabled={!selectedLocation}
              className={`px-8 py-3 rounded-xl font-bold text-white transition-all ${
                selectedLocation
                  ? mode === 'pickup'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              تأكيد الموقع
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
