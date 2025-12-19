'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface RideLocation {
  lat: number;
  lng: number;
  name: string;
  nameEn?: string;
  address?: string;
}

interface LocationPickerMapProps {
  center: [number, number];
  zoom: number;
  selectedLocation: RideLocation | null;
  otherLocation?: RideLocation | null;
  mode: 'pickup' | 'dropoff';
  onMapClick: (lat: number, lng: number) => void;
  onCenterChange: (center: [number, number]) => void;
}

// Component to handle map events
function MapEventHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to update map center
function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}

// Create custom marker icons
const createIcon = (color: string, emoji: string) => {
  return L.divIcon({
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 3px solid white;
      ">
        <span style="transform: rotate(45deg); font-size: 18px;">${emoji}</span>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const pickupIcon = createIcon('#22c55e', '🟢');
const dropoffIcon = createIcon('#ef4444', '🔴');

export default function LocationPickerMap({
  center,
  zoom,
  selectedLocation,
  otherLocation,
  mode,
  onMapClick,
  onCenterChange,
}: LocationPickerMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', minHeight: '400px' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap &copy; CARTO'
      />

      {/* Map click handler */}
      <MapEventHandler onMapClick={onMapClick} />

      {/* Map center updater */}
      <MapCenterUpdater center={center} />

      {/* Selected location marker */}
      {selectedLocation && (
        <Marker
          position={[selectedLocation.lat, selectedLocation.lng]}
          icon={mode === 'pickup' ? pickupIcon : dropoffIcon}
        >
          <Popup>
            <div className="text-center p-2" dir="rtl">
              <p className="font-bold">{selectedLocation.name}</p>
              {selectedLocation.address && (
                <p className="text-xs text-gray-500 mt-1">{selectedLocation.address}</p>
              )}
            </div>
          </Popup>
        </Marker>
      )}

      {/* Other location marker (pickup or dropoff) */}
      {otherLocation && (
        <Marker
          position={[otherLocation.lat, otherLocation.lng]}
          icon={mode === 'pickup' ? dropoffIcon : pickupIcon}
          opacity={0.6}
        >
          <Popup>
            <div className="text-center p-2" dir="rtl">
              <p className="font-bold">{otherLocation.name}</p>
              <p className="text-xs text-gray-500">
                {mode === 'pickup' ? 'الوجهة' : 'نقطة الانطلاق'}
              </p>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
