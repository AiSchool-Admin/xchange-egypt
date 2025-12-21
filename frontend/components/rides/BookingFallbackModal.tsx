'use client';

import React, { useState, useEffect } from 'react';

interface Location {
  name: string;
  nameEn?: string;
  lat: number;
  lng: number;
  address?: string;
}

interface BookingFallbackModalProps {
  provider: {
    name: string;
    nameAr: string;
    emoji: string;
    color: string;
    bgColor: string;
    appStoreUrl?: string;
    playStoreUrl?: string;
  };
  pickup: Location;
  dropoff: Location;
  price: number;
  onClose: () => void;
  webFallbackUrl: string;
}

export default function BookingFallbackModal({
  provider,
  pickup,
  dropoff,
  price,
  onClose,
  webFallbackUrl,
}: BookingFallbackModalProps) {
  const [copiedPickup, setCopiedPickup] = useState(false);
  const [copiedDropoff, setCopiedDropoff] = useState(false);
  const [copiedBoth, setCopiedBoth] = useState(false);
  const [step, setStep] = useState(1);

  // Reset copied states after a delay
  useEffect(() => {
    if (copiedPickup) {
      const timer = setTimeout(() => setCopiedPickup(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedPickup]);

  useEffect(() => {
    if (copiedDropoff) {
      const timer = setTimeout(() => setCopiedDropoff(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedDropoff]);

  useEffect(() => {
    if (copiedBoth) {
      const timer = setTimeout(() => setCopiedBoth(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedBoth]);

  // Format address for copying
  const getDisplayAddress = (location: Location): string => {
    if (location.address) {
      return location.address;
    }
    // If no address, return name + coordinates
    return `${location.name} (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`;
  };

  // Copy single address to clipboard
  const copyAddress = async (type: 'pickup' | 'dropoff') => {
    const location = type === 'pickup' ? pickup : dropoff;
    const text = getDisplayAddress(location);

    try {
      await navigator.clipboard.writeText(text);
      if (type === 'pickup') {
        setCopiedPickup(true);
      } else {
        setCopiedDropoff(true);
      }
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      if (type === 'pickup') {
        setCopiedPickup(true);
      } else {
        setCopiedDropoff(true);
      }
    }
  };

  // Copy both addresses at once
  const copyBothAddresses = async () => {
    const text = `🟢 من: ${getDisplayAddress(pickup)}\n🔴 إلى: ${getDisplayAddress(dropoff)}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedBoth(true);
      setCopiedPickup(true);
      setCopiedDropoff(true);
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedBoth(true);
      setCopiedPickup(true);
      setCopiedDropoff(true);
    }
  };

  // Open the app/website
  const openApp = () => {
    // Try to open the native app first using various URL schemes
    const appSchemes: Record<string, string> = {
      'inDrive': 'indrive://',
      'إن درايف': 'indrive://',
      'DiDi': 'didiglobal://',
      'ديدي': 'didiglobal://',
      'Swvl': 'swvl://',
      'سويفل': 'swvl://',
      'Halan': 'halan://',
      'هلان': 'halan://',
    };

    const scheme = appSchemes[provider.name] || appSchemes[provider.nameAr];

    if (scheme) {
      // Try native app first
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = scheme;
      document.body.appendChild(iframe);

      // After a short delay, open web fallback (if app didn't open)
      setTimeout(() => {
        document.body.removeChild(iframe);
        window.open(webFallbackUrl, '_blank');
      }, 1500);
    } else {
      window.open(webFallbackUrl, '_blank');
    }

    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className={`${provider.bgColor} p-5 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{provider.emoji}</span>
              <div>
                <h2 className="text-xl font-bold">{provider.nameAr}</h2>
                <p className="text-sm opacity-80">السعر التقديري: {price} ج.م</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Info Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-bold text-amber-800 mb-1">الحجز عبر {provider.nameAr}</h3>
                <p className="text-sm text-amber-700">
                  انسخ العناوين أدناه ثم الصقها في تطبيق {provider.nameAr} لإتمام الحجز
                </p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {/* Step 1: Copy Pickup */}
            <div className={`rounded-xl border-2 transition-all ${step >= 1 ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>1</span>
                  <span className="text-sm font-bold text-gray-700">نقطة الانطلاق</span>
                  <span className="text-green-500">🟢</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-800">
                    {getDisplayAddress(pickup)}
                  </div>
                  <button
                    onClick={() => { copyAddress('pickup'); setStep(Math.max(step, 1)); }}
                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                      copiedPickup
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {copiedPickup ? '✓ تم' : '📋 نسخ'}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Copy Dropoff */}
            <div className={`rounded-xl border-2 transition-all ${step >= 2 || copiedDropoff ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 || copiedDropoff ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'}`}>2</span>
                  <span className="text-sm font-bold text-gray-700">الوجهة</span>
                  <span className="text-red-500">🔴</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-800">
                    {getDisplayAddress(dropoff)}
                  </div>
                  <button
                    onClick={() => { copyAddress('dropoff'); setStep(Math.max(step, 2)); }}
                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                      copiedDropoff
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {copiedDropoff ? '✓ تم' : '📋 نسخ'}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Copy Both */}
            <button
              onClick={copyBothAddresses}
              className={`w-full py-3 rounded-xl font-medium transition-all border-2 ${
                copiedBoth
                  ? 'bg-purple-100 border-purple-500 text-purple-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {copiedBoth ? '✓ تم نسخ العنوانين' : '📋 نسخ العنوانين معاً'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-2">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-gray-400 text-sm">ثم</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Step 3: Open App */}
            <button
              onClick={openApp}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${provider.bgColor} ${provider.bgColor === 'bg-yellow-500' ? 'text-black' : 'text-white'} hover:opacity-90 active:scale-[0.98]`}
            >
              <span className="text-xl">{provider.emoji}</span>
              <span>افتح تطبيق {provider.nameAr}</span>
              <span className="text-xl">←</span>
            </button>

            {/* Success Message */}
            {step === 3 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center animate-in fade-in slide-in-from-bottom-2">
                <span className="text-3xl">✅</span>
                <p className="text-green-800 font-medium mt-2">
                  الصق العناوين في التطبيق لإتمام الحجز
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-center text-gray-500">
            💡 نصيحة: بعد فتح التطبيق، الصق العنوان في خانة البحث باستخدام "Paste" أو الضغط المطول
          </p>
        </div>
      </div>
    </div>
  );
}
