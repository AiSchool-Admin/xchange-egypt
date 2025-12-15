'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '@/lib/contexts/SocketContext';
import { COLLECTION_STATUS_AR, CollectionRequestStatus } from '@/lib/api/scrap-marketplace';

interface CollectorLocation {
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

interface CollectorTrackingProps {
  collectionId: string;
  collectorId?: string;
  collectorName?: string;
  collectorPhone?: string;
  status: CollectionRequestStatus;
  destinationAddress: string;
  destinationLat?: number;
  destinationLng?: number;
  onStatusUpdate?: (status: CollectionRequestStatus) => void;
}

const STATUS_COLORS: Record<CollectionRequestStatus, string> = {
  PENDING: 'bg-yellow-500',
  ACCEPTED: 'bg-blue-500',
  SCHEDULED: 'bg-indigo-500',
  IN_TRANSIT: 'bg-purple-500',
  ARRIVED: 'bg-cyan-500',
  WEIGHING: 'bg-orange-500',
  COMPLETED: 'bg-green-500',
  CANCELLED: 'bg-gray-500',
  DISPUTED: 'bg-red-500',
};

const STATUS_ICONS: Record<CollectionRequestStatus, string> = {
  PENDING: '⏳',
  ACCEPTED: '✓',
  SCHEDULED: '📅',
  IN_TRANSIT: '🚛',
  ARRIVED: '📍',
  WEIGHING: '⚖️',
  COMPLETED: '✅',
  CANCELLED: '❌',
  DISPUTED: '⚠️',
};

export function CollectorTracking({
  collectionId,
  collectorId,
  collectorName,
  collectorPhone,
  status,
  destinationAddress,
  destinationLat,
  destinationLng,
  onStatusUpdate,
}: CollectorTrackingProps) {
  const { socket, connected } = useSocket();
  const [location, setLocation] = useState<CollectorLocation | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isLive, setIsLive] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Subscribe to collector location updates
  useEffect(() => {
    if (!socket || !connected || !collectorId) return;

    // Join collection tracking room
    socket.emit('join_tracking', { collectionId, collectorId });

    const handleLocationUpdate = (data: {
      collectorId: string;
      latitude: number;
      longitude: number;
      timestamp: string;
      accuracy?: number;
      heading?: number;
      speed?: number;
    }) => {
      if (data.collectorId === collectorId) {
        const newLocation: CollectorLocation = {
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: new Date(data.timestamp),
          accuracy: data.accuracy,
          heading: data.heading,
          speed: data.speed,
        };
        setLocation(newLocation);
        setIsLive(true);

        // Calculate ETA if we have destination
        if (destinationLat && destinationLng) {
          const dist = calculateDistance(
            data.latitude,
            data.longitude,
            destinationLat,
            destinationLng
          );
          setDistance(dist);

          // Estimate time based on average speed (30 km/h in city)
          const avgSpeed = data.speed || 30;
          const timeHours = dist / avgSpeed;
          setEta(Math.round(timeHours * 60)); // Convert to minutes
        }
      }
    };

    const handleStatusChange = (data: {
      collectionId: string;
      status: CollectionRequestStatus;
    }) => {
      if (data.collectionId === collectionId) {
        onStatusUpdate?.(data.status);
      }
    };

    socket.on('collector_location', handleLocationUpdate);
    socket.on('collection_status_update', handleStatusChange);

    return () => {
      socket.emit('leave_tracking', { collectionId });
      socket.off('collector_location', handleLocationUpdate);
      socket.off('collection_status_update', handleStatusChange);
    };
  }, [socket, connected, collectionId, collectorId, destinationLat, destinationLng, onStatusUpdate]);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Format ETA
  const formatEta = (minutes: number): string => {
    if (minutes < 1) return 'أقل من دقيقة';
    if (minutes < 60) return `${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} ساعة ${mins > 0 ? `و ${mins} دقيقة` : ''}`;
  };

  // Format distance
  const formatDistance = (km: number): string => {
    if (km < 1) return `${Math.round(km * 1000)} متر`;
    return `${km.toFixed(1)} كم`;
  };

  // Status timeline
  const statusOrder: CollectionRequestStatus[] = [
    'PENDING',
    'ACCEPTED',
    'SCHEDULED',
    'IN_TRANSIT',
    'ARRIVED',
    'WEIGHING',
    'COMPLETED',
  ];

  const currentStatusIndex = statusOrder.indexOf(status);

  const isTrackingActive = ['IN_TRANSIT', 'ARRIVED'].includes(status);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden" dir="rtl">
      {/* Header */}
      <div className={`${STATUS_COLORS[status]} text-white p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{STATUS_ICONS[status]}</span>
            <div>
              <h3 className="font-bold text-lg">{COLLECTION_STATUS_AR[status]}</h3>
              {isTrackingActive && isLive && (
                <p className="text-sm opacity-90 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                  تتبع مباشر
                </p>
              )}
            </div>
          </div>

          {isTrackingActive && eta !== null && (
            <div className="text-left">
              <p className="text-sm opacity-80">الوصول المتوقع</p>
              <p className="text-xl font-bold">{formatEta(eta)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Timeline */}
      <div className="p-4 border-b">
        <div className="flex justify-between relative">
          <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200"></div>
          <div
            className="absolute top-3 right-0 h-0.5 bg-green-500 transition-all duration-500"
            style={{ width: `${(currentStatusIndex / (statusOrder.length - 1)) * 100}%` }}
          ></div>

          {statusOrder.map((s, i) => (
            <div key={s} className="relative flex flex-col items-center z-10">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                  i <= currentStatusIndex
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {i < currentStatusIndex ? '✓' : i + 1}
              </div>
              <span
                className={`text-xs mt-1 hidden md:block ${
                  i <= currentStatusIndex ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {COLLECTION_STATUS_AR[s]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Map Area */}
      {isTrackingActive && (
        <div className="relative">
          <div
            ref={mapContainerRef}
            className="h-64 bg-gradient-to-br from-blue-100 to-blue-50 relative overflow-hidden"
          >
            {/* Simulated Map View */}
            <div className="absolute inset-0 flex items-center justify-center">
              {location ? (
                <div className="text-center">
                  {/* Animated truck icon */}
                  <div className="relative">
                    <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center animate-bounce">
                      <span className="text-4xl">🚛</span>
                    </div>
                    {location.heading !== undefined && (
                      <div
                        className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-blue-500"
                        style={{ transform: `rotate(${location.heading}deg)` }}
                      >
                        ↑
                      </div>
                    )}
                  </div>

                  {/* Distance indicator */}
                  {distance !== null && (
                    <div className="mt-4 bg-white rounded-lg shadow px-4 py-2">
                      <p className="text-sm text-gray-500">المسافة المتبقية</p>
                      <p className="text-xl font-bold text-blue-600">{formatDistance(distance)}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p>جاري تحديد موقع الجامع...</p>
                </div>
              )}
            </div>

            {/* Destination marker */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow p-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="text-xs text-gray-500">وجهتك</p>
                  <p className="text-sm font-medium truncate max-w-32">{destinationAddress}</p>
                </div>
              </div>
            </div>

            {/* Open in Maps button */}
            {location && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${destinationLat},${destinationLng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 left-4 bg-white rounded-lg shadow px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
              >
                فتح في الخريطة
              </a>
            )}
          </div>
        </div>
      )}

      {/* Collector Info */}
      {collectorId && (
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <p className="font-bold">{collectorName || 'الجامع'}</p>
                <p className="text-sm text-gray-500">جامع معتمد</p>
              </div>
            </div>

            {collectorPhone && (
              <div className="flex gap-2">
                <a
                  href={`tel:${collectorPhone}`}
                  className="p-3 bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200 transition"
                >
                  📞
                </a>
                <a
                  href={`https://wa.me/${collectorPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  className="p-3 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition"
                >
                  📱
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live updates indicator */}
      {isTrackingActive && (
        <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            {connected ? (
              <>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>متصل - تحديثات مباشرة</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span>غير متصل</span>
              </>
            )}
          </div>

          {location && (
            <span className="text-gray-400">
              آخر تحديث: {location.timestamp.toLocaleTimeString('ar-EG')}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Component for collectors to update their location
export function CollectorLocationUpdater({
  collectorId,
  isOnline,
  onStatusChange,
}: {
  collectorId: string;
  isOnline: boolean;
  onStatusChange?: (online: boolean) => void;
}) {
  const { socket, connected } = useSocket();
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('الموقع الجغرافي غير مدعوم في هذا المتصفح');
      return;
    }

    setTracking(true);
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        if (socket && connected) {
          socket.emit('update_collector_location', {
            collectorId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: new Date().toISOString(),
          });
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('لا يمكن الوصول للموقع. تأكد من تفعيل خدمات الموقع');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );
  }, [socket, connected, collectorId]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
  }, []);

  useEffect(() => {
    if (isOnline && !tracking) {
      startTracking();
    } else if (!isOnline && tracking) {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [isOnline, tracking, startTracking, stopTracking]);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-4 h-4 rounded-full ${tracking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}
          ></div>
          <span className="font-medium">
            {tracking ? 'التتبع نشط' : 'التتبع متوقف'}
          </span>
        </div>

        <button
          onClick={() => {
            if (tracking) {
              stopTracking();
              onStatusChange?.(false);
            } else {
              startTracking();
              onStatusChange?.(true);
            }
          }}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            tracking
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-green-100 text-green-600 hover:bg-green-200'
          }`}
        >
          {tracking ? 'إيقاف' : 'تشغيل'}
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}

      {tracking && (
        <p className="text-green-600 text-sm mt-2">
          يتم مشاركة موقعك مع العملاء الذين ينتظرون جمع
        </p>
      )}
    </div>
  );
}
