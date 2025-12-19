'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPinIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  MapIcon,
  HomeIcon,
  BuildingOfficeIcon,
  ClockIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';

// Declare Google Maps types
declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
  }
}

interface Location {
  lat: number;
  lng: number;
  address: string;
  addressAr?: string;
  placeId?: string;
}

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: Location) => void;
  type: 'pickup' | 'dropoff';
  initialLocation?: Location;
  savedAddresses?: Array<{
    id: string;
    name: string;
    nameAr: string;
    type: string;
    lat: number;
    lng: number;
    address: string;
    addressAr: string;
  }>;
  recentLocations?: Location[];
}

// Popular locations in Egypt
const POPULAR_LOCATIONS: Location[] = [
  { lat: 30.1219, lng: 31.4056, address: 'Cairo International Airport', addressAr: 'مطار القاهرة الدولي' },
  { lat: 30.0444, lng: 31.2357, address: 'Tahrir Square', addressAr: 'ميدان التحرير' },
  { lat: 30.0708, lng: 31.0169, address: 'Smart Village', addressAr: 'القرية الذكية' },
  { lat: 30.0285, lng: 31.4085, address: 'Cairo Festival City', addressAr: 'كايرو فيستيفال سيتي' },
  { lat: 29.9728, lng: 30.9428, address: 'Mall of Arabia', addressAr: 'مول العرب' },
  { lat: 30.0131, lng: 31.4089, address: 'City Stars Mall', addressAr: 'مول سيتي ستارز' },
  { lat: 29.9873, lng: 31.4391, address: 'American University in Cairo', addressAr: 'الجامعة الأمريكية بالقاهرة' },
  { lat: 30.0561, lng: 31.2017, address: 'Mohandessin', addressAr: 'المهندسين' },
  { lat: 29.9602, lng: 31.2569, address: 'Maadi', addressAr: 'المعادي' },
  { lat: 30.0866, lng: 31.3400, address: 'Heliopolis', addressAr: 'مصر الجديدة' },
];

// Google Maps API Key placeholder - should be in environment
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default function LocationPicker({
  isOpen,
  onClose,
  onSelect,
  type,
  initialLocation,
  savedAddresses = [],
  recentLocations = []
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMapReady, setIsMapReady] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'search' | 'saved'>('map');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);

  // Default center (Cairo)
  const defaultCenter = { lat: 30.0444, lng: 31.2357 };

  // Load Google Maps script
  useEffect(() => {
    if (!isOpen) return;

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsMapReady(true);
        return;
      }

      if (!GOOGLE_MAPS_API_KEY) {
        console.warn('Google Maps API key not configured');
        setIsMapReady(true); // Still show map with limited functionality
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=ar&region=EG`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsMapReady(true);
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, [isOpen]);

  // Initialize map
  useEffect(() => {
    if (!isMapReady || !mapRef.current || !isOpen) return;

    // Check if Google Maps is available
    if (!window.google || !window.google.maps) {
      // Fallback: Show a simple location selector without actual map
      return;
    }

    const center = initialLocation
      ? { lat: initialLocation.lat, lng: initialLocation.lng }
      : currentPosition || defaultCenter;

    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom: 14,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER,
      },
    });

    mapInstanceRef.current = map;

    // Add marker
    const marker = new google.maps.Marker({
      map,
      position: center,
      draggable: true,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: type === 'pickup' ? '#22C55E' : '#EF4444',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 3,
      },
    });

    markerRef.current = marker;

    // Handle marker drag
    marker.addListener('dragend', () => {
      const position = marker.getPosition();
      if (position) {
        reverseGeocode(position.lat(), position.lng());
      }
    });

    // Handle map click
    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        marker.setPosition(e.latLng);
        reverseGeocode(e.latLng.lat(), e.latLng.lng());
      }
    });

    // Initialize autocomplete
    if (searchInputRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
        componentRestrictions: { country: 'eg' },
        fields: ['geometry', 'formatted_address', 'name', 'place_id'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          map.setCenter({ lat, lng });
          map.setZoom(16);
          marker.setPosition({ lat, lng });

          setSelectedLocation({
            lat,
            lng,
            address: place.formatted_address || place.name || '',
            placeId: place.place_id,
          });
        }
      });

      autocompleteRef.current = autocomplete;
    }

    // Set initial location if provided
    if (initialLocation) {
      setSelectedLocation(initialLocation);
    }

    return () => {
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, [isMapReady, isOpen, type]);

  // Get current position
  useEffect(() => {
    if (!isOpen) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  }, [isOpen]);

  // Reverse geocode
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsLoading(true);

    if (window.google && window.google.maps) {
      const geocoder = new google.maps.Geocoder();
      try {
        const response = await geocoder.geocode({ location: { lat, lng } });
        if (response.results[0]) {
          setSelectedLocation({
            lat,
            lng,
            address: response.results[0].formatted_address,
            placeId: response.results[0].place_id,
          });
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        setSelectedLocation({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
      }
    } else {
      // Fallback without Google Maps
      setSelectedLocation({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
    }

    setIsLoading(false);
  }, []);

  // Go to current location
  const goToCurrentLocation = () => {
    if (currentPosition && mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setCenter(currentPosition);
      mapInstanceRef.current.setZoom(16);
      markerRef.current.setPosition(currentPosition);
      reverseGeocode(currentPosition.lat, currentPosition.lng);
    }
  };

  // Select a predefined location
  const selectPredefinedLocation = (location: Location) => {
    setSelectedLocation(location);
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setCenter({ lat: location.lat, lng: location.lng });
      mapInstanceRef.current.setZoom(16);
      markerRef.current.setPosition({ lat: location.lat, lng: location.lng });
    }
    setActiveTab('map');
  };

  // Confirm selection
  const handleConfirm = () => {
    if (selectedLocation) {
      onSelect(selectedLocation);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" dir="rtl">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className={`p-4 ${type === 'pickup' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold">
              {type === 'pickup' ? 'تحديد نقطة الانطلاق' : 'تحديد الوجهة'}
            </h2>
            <div className="w-10" />
          </div>

          {/* Search Input */}
          <div className="mt-4 relative">
            <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="ابحث عن موقع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12 pl-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === 'map'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MapIcon className="w-5 h-5 inline-block ml-2" />
            الخريطة
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === 'saved'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <HomeIcon className="w-5 h-5 inline-block ml-2" />
            المحفوظة
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === 'search'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ClockIcon className="w-5 h-5 inline-block ml-2" />
            الأماكن الشائعة
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {/* Map Tab */}
          {activeTab === 'map' && (
            <div className="relative">
              {/* Map Container */}
              <div
                ref={mapRef}
                className="w-full h-[300px] sm:h-[400px] bg-gray-100"
                style={{ minHeight: '300px' }}
              >
                {!isMapReady && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full"></div>
                  </div>
                )}

                {/* Fallback when no Google Maps */}
                {isMapReady && !window.google && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 p-4">
                    <MapPinIcon className="w-16 h-16 text-gray-400 mb-4" />
                    <p className="text-gray-600 text-center mb-4">
                      خريطة Google غير متاحة حالياً
                      <br />
                      يمكنك اختيار موقع من القائمة
                    </p>
                    <button
                      onClick={() => setActiveTab('search')}
                      className="bg-purple-600 text-white px-6 py-2 rounded-xl font-medium"
                    >
                      اختر من الأماكن الشائعة
                    </button>
                  </div>
                )}
              </div>

              {/* Current Location Button */}
              <button
                onClick={goToCurrentLocation}
                className="absolute bottom-4 left-4 bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                title="موقعي الحالي"
              >
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v3m0 14v3M2 12h3m14 0h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              {/* Center Pin Indicator */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none">
                <div className={`text-3xl ${type === 'pickup' ? 'text-green-600' : 'text-red-600'}`}>
                  📍
                </div>
              </div>
            </div>
          )}

          {/* Saved Addresses Tab */}
          {activeTab === 'saved' && (
            <div className="p-4 space-y-3">
              {savedAddresses.length === 0 ? (
                <div className="text-center py-8">
                  <HomeIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">لا توجد عناوين محفوظة</p>
                </div>
              ) : (
                savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    onClick={() => selectPredefinedLocation({
                      lat: addr.lat,
                      lng: addr.lng,
                      address: addr.address,
                      addressAr: addr.addressAr,
                    })}
                    className="w-full p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-3 text-right"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      addr.type === 'home' ? 'bg-blue-100 text-blue-600' :
                      addr.type === 'work' ? 'bg-purple-100 text-purple-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {addr.type === 'home' ? <HomeIcon className="w-5 h-5" /> :
                       addr.type === 'work' ? <BuildingOfficeIcon className="w-5 h-5" /> :
                       <MapPinIcon className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{addr.nameAr}</p>
                      <p className="text-sm text-gray-500 truncate">{addr.addressAr}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Popular Locations Tab */}
          {activeTab === 'search' && (
            <div className="p-4 space-y-3">
              <h3 className="text-sm font-medium text-gray-500 mb-2">الأماكن الشائعة</h3>
              {POPULAR_LOCATIONS.map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => selectPredefinedLocation(loc)}
                  className="w-full p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-3 text-right"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <MapPinIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{loc.addressAr}</p>
                    <p className="text-sm text-gray-500">{loc.address}</p>
                  </div>
                </button>
              ))}

              {/* Recent Locations */}
              {recentLocations.length > 0 && (
                <>
                  <h3 className="text-sm font-medium text-gray-500 mt-6 mb-2">الأماكن الأخيرة</h3>
                  {recentLocations.map((loc, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectPredefinedLocation(loc)}
                      className="w-full p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-3 text-right"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <ClockIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 truncate">{loc.addressAr || loc.address}</p>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Selected Location & Confirm */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {selectedLocation ? (
            <div className="mb-3 p-3 bg-white rounded-xl border border-gray-200">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  type === 'pickup' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <MapPinIcon className={`w-4 h-4 ${type === 'pickup' ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500">
                    {type === 'pickup' ? 'نقطة الانطلاق' : 'الوجهة'}
                  </p>
                  <p className="font-medium text-gray-900 truncate">
                    {selectedLocation.addressAr || selectedLocation.address}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
              <p className="text-sm text-yellow-700 text-center">
                اختر موقعاً على الخريطة أو من القائمة
              </p>
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={!selectedLocation || isLoading}
            className={`w-full py-3 rounded-xl font-bold transition-all ${
              selectedLocation && !isLoading
                ? type === 'pickup'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري التحميل...
              </span>
            ) : (
              'تأكيد الموقع'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
