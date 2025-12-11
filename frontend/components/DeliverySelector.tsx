'use client';

import React, { useState, useEffect } from 'react';
import {
  getDeliveryOptions,
  DELIVERY_PROVIDERS,
  DeliveryOption,
} from '@/lib/api/delivery';

// ============================================
// Delivery Selector Component
// مكون اختيار التوصيل
// ============================================

interface DeliverySelectorProps {
  pickupGovernorate: string;
  pickupCity?: string;
  deliveryGovernorate: string;
  deliveryCity?: string;
  packageWeight?: number;
  isCOD?: boolean;
  onSelect: (option: DeliveryOption | null) => void;
  selectedOption?: DeliveryOption | null;
}

export default function DeliverySelector({
  pickupGovernorate,
  pickupCity,
  deliveryGovernorate,
  deliveryCity,
  packageWeight = 1,
  isCOD = false,
  onSelect,
  selectedOption,
}: DeliverySelectorProps) {
  const [options, setOptions] = useState<DeliveryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (pickupGovernorate && deliveryGovernorate) {
      loadOptions();
    }
  }, [pickupGovernorate, pickupCity, deliveryGovernorate, deliveryCity, packageWeight, isCOD]);

  const loadOptions = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getDeliveryOptions({
        pickupGovernorate,
        pickupCity,
        deliveryGovernorate,
        deliveryCity,
        packageWeight,
        isCOD,
      });

      setOptions(response.data.options);

      // Auto-select cheapest option if none selected
      if (!selectedOption && response.data.options.length > 0) {
        const cheapest = response.data.options.reduce((prev, curr) =>
          prev.cost < curr.cost ? prev : curr
        );
        onSelect(cheapest);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل خيارات التوصيل');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!pickupGovernorate || !deliveryGovernorate) {
    return (
      <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-500">
        يرجى تحديد موقع الاستلام والتوصيل
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-xl">
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="mr-2 text-gray-600 text-sm">جاري تحميل خيارات التوصيل...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-xl">
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={loadOptions}
          className="mt-2 text-sm text-red-700 underline"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-gray-900 flex items-center gap-2">
        🚚 خيارات التوصيل
      </h3>

      <div className="space-y-2">
        {options.map((option, index) => {
          const providerInfo = DELIVERY_PROVIDERS[option.provider as keyof typeof DELIVERY_PROVIDERS];
          const isSelected =
            selectedOption?.provider === option.provider &&
            selectedOption?.speed === option.speed;

          return (
            <button
              key={`${option.provider}-${option.speed}-${index}`}
              onClick={() => onSelect(option)}
              className={`w-full p-4 rounded-xl border-2 transition text-right ${
                isSelected
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{providerInfo?.icon || '📦'}</span>
                    <span className="font-medium text-gray-900">
                      {option.providerNameAr}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {option.speedNameAr}
                    {option.estimatedDays > 0 && (
                      <span className="mr-2">
                        • {option.estimatedDays === 1 ? 'يوم واحد' : `${option.estimatedDays} أيام`}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {option.features.slice(0, 3).map((feature, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-left">
                  <div className={`text-lg font-bold ${option.cost === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {option.cost === 0 ? 'مجاناً' : formatCurrency(option.cost)}
                  </div>
                  {option.insuranceCost && option.insuranceCost > 0 && (
                    <div className="text-xs text-gray-500">
                      + {formatCurrency(option.insuranceCost)} تأمين
                    </div>
                  )}
                </div>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 left-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Self Pickup Info */}
      {options.some((o) => o.provider === 'SELF_DELIVERY') && (
        <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
          💡 يمكنك اختيار الاستلام الشخصي والاتفاق مع البائع على مكان وموعد التسليم
        </div>
      )}
    </div>
  );
}

// ============================================
// Delivery Tracker Component
// مكون تتبع الشحنة
// ============================================

interface DeliveryTrackerProps {
  bookingId: string;
  status: string;
  trackingHistory?: Array<{
    status: string;
    description?: string;
    location?: string;
    timestamp: string;
  }>;
}

export function DeliveryTracker({ bookingId, status, trackingHistory = [] }: DeliveryTrackerProps) {
  const STATUSES = [
    { key: 'PENDING', label: 'في الانتظار', icon: '⏳' },
    { key: 'CONFIRMED', label: 'تم التأكيد', icon: '✅' },
    { key: 'PICKED_UP', label: 'تم الاستلام', icon: '📦' },
    { key: 'IN_TRANSIT', label: 'في الطريق', icon: '🚚' },
    { key: 'OUT_FOR_DELIVERY', label: 'خارج للتوصيل', icon: '🏃' },
    { key: 'DELIVERED', label: 'تم التوصيل', icon: '🎉' },
  ];

  const currentIndex = STATUSES.findIndex((s) => s.key === status);

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm">
      <h3 className="font-bold text-gray-900 mb-4">تتبع الشحنة</h3>

      {/* Progress Bar */}
      <div className="relative mb-6">
        <div className="flex justify-between">
          {STATUSES.map((step, index) => {
            const isComplete = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={step.key} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 ${
                    isComplete
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}
                >
                  {step.icon}
                </div>
                <span
                  className={`text-xs mt-2 text-center ${
                    isComplete ? 'text-green-600 font-medium' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress Line */}
        <div className="absolute top-5 right-0 left-0 h-0.5 bg-gray-200 -z-0">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${(currentIndex / (STATUSES.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Tracking History */}
      {trackingHistory.length > 0 && (
        <div className="border-t border-gray-100 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">سجل التتبع</h4>
          <div className="space-y-3">
            {trackingHistory.map((entry, index) => (
              <div key={index} className="flex gap-3 text-sm">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5" />
                <div className="flex-1">
                  <p className="text-gray-900">{entry.description}</p>
                  {entry.location && (
                    <p className="text-gray-500 text-xs">📍 {entry.location}</p>
                  )}
                  <p className="text-gray-400 text-xs">
                    {new Date(entry.timestamp).toLocaleString('ar-EG')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
