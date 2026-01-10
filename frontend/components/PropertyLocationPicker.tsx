'use client';

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Navigation, Loader2, X } from 'lucide-react';

// Import Leaflet dynamically to avoid SSR issues
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
const useMapEvents = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMapEvents) as any,
  { ssr: false }
) as any;

interface PropertyLocationPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number) => void;
  onClose?: () => void;
}

// Default center (Cairo)
const DEFAULT_CENTER: [number, number] = [30.0444, 31.2357];

// Component to handle map clicks and dragging
function MapClickHandler({
  onLocationSelect
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const MapEventsComponent = () => {
    const map = (useMapEvents as any)({
      click: (e: any) => {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  return <MapEventsComponent />;
}

export default function PropertyLocationPicker({
  latitude,
  longitude,
  onLocationChange,
  onClose,
}: PropertyLocationPickerProps) {
  const [isClient, setIsClient] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    latitude && longitude ? [latitude, longitude] : null
  );
  const [gpsLoading, setGpsLoading] = useState(false);
  const [customIcon, setCustomIcon] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    // Create custom icon on client side
    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        const icon = L.divIcon({
          html: `
            <div style="
              width: 40px;
              height: 40px;
              background: #3b82f6;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              border: 3px solid white;
              cursor: grab;
            ">
              <span style="transform: rotate(45deg); font-size: 18px;">🏠</span>
            </div>
          `,
          className: 'property-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });
        setCustomIcon(icon);
      });
    }
  }, []);

  // Update marker when props change
  useEffect(() => {
    if (latitude && longitude) {
      setMarkerPosition([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const handleMapClick = (lat: number, lng: number) => {
    setMarkerPosition([lat, lng]);
    onLocationChange(lat, lng);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('الموقع الجغرافي غير مدعوم في متصفحك');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMarkerPosition([latitude, longitude]);
        onLocationChange(latitude, longitude);
        setGpsLoading(false);
      },
      (error) => {
        console.error('GPS Error:', error);
        alert('فشل في تحديد موقعك. يرجى التأكد من تفعيل خدمات الموقع.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (!isClient) {
    return (
      <div className="h-[400px] bg-gray-100 rounded-xl flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">تحديد موقع العقار على الخريطة</h3>
          <p className="text-sm text-gray-500">انقر على الخريطة أو اسحب العلامة لتحديد الموقع</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* GPS Button */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={gpsLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
        >
          {gpsLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          <span>تحديد موقعي الحالي</span>
        </button>
      </div>

      {/* Map */}
      <div className="h-[400px] rounded-xl overflow-hidden border border-gray-200">
        <MapContainer
          center={markerPosition || DEFAULT_CENTER}
          zoom={markerPosition ? 15 : 10}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap &copy; CARTO'
          />

          {/* Map click handler */}
          <MapClickHandler onLocationSelect={handleMapClick} />

          {/* Property marker */}
          {markerPosition && customIcon && (
            <Marker
              position={markerPosition}
              icon={customIcon}
              draggable={true}
              eventHandlers={{
                dragend: (e: any) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  setMarkerPosition([position.lat, position.lng]);
                  onLocationChange(position.lat, position.lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Instructions */}
      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">كيفية تحديد الموقع:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-600">
              <li>انقر على أي مكان في الخريطة لوضع العلامة</li>
              <li>اسحب العلامة لتعديل الموقع بدقة</li>
              <li>أو استخدم زر "تحديد موقعي الحالي"</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Selected coordinates */}
      {markerPosition && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700">
            <span className="font-medium">الإحداثيات:</span>{' '}
            {markerPosition[0].toFixed(6)}, {markerPosition[1].toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}
