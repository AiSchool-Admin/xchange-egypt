'use client';

import React, { useState, useEffect } from 'react';

interface Location {
  name: string;
  nameEn?: string;
  lat: number;
  lng: number;
}

interface SmartBookingHandlerProps {
  providerName: string;
  providerNameAr: string;
  providerEmoji: string;
  providerBgColor: string;
  pickup: Location;
  dropoff: Location;
  appScheme: string;
  webFallbackUrl: string;
  onComplete: () => void;
}

// App info for each provider
const APP_INFO: Record<string, {
  scheme: string;
  androidPackage: string;
  iosAppId: string;
  universalLink?: string;
}> = {
  'indrive': {
    scheme: 'indrive',
    androidPackage: 'sinet.startup.inDriver',
    iosAppId: '789066289',
    universalLink: 'https://indrive.com/deeplink',
  },
  'إن درايف': {
    scheme: 'indrive',
    androidPackage: 'sinet.startup.inDriver',
    iosAppId: '789066289',
  },
  'didi': {
    scheme: 'didiglobal',
    androidPackage: 'com.didiglobal.passenger',
    iosAppId: '1489604832',
  },
  'ديدي': {
    scheme: 'didiglobal',
    androidPackage: 'com.didiglobal.passenger',
    iosAppId: '1489604832',
  },
  'swvl': {
    scheme: 'swvl',
    androidPackage: 'com.swvl.rider',
    iosAppId: '1210151498',
  },
  'سويفل': {
    scheme: 'swvl',
    androidPackage: 'com.swvl.rider',
    iosAppId: '1210151498',
  },
  'halan': {
    scheme: 'halan',
    androidPackage: 'com.mwasalat.halan',
    iosAppId: '1434633092',
  },
  'هلان': {
    scheme: 'halan',
    androidPackage: 'com.mwasalat.halan',
    iosAppId: '1434633092',
  },
};

export default function SmartBookingHandler({
  providerName,
  providerNameAr,
  providerEmoji,
  providerBgColor,
  pickup,
  dropoff,
  appScheme,
  webFallbackUrl,
  onComplete,
}: SmartBookingHandlerProps) {
  const [status, setStatus] = useState<'ready' | 'copied' | 'opening' | 'manual'>('ready');
  const [copied, setCopied] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // Detect platform
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    setIsAndroid(/android/i.test(ua));
    setIsIOS(/iphone|ipad|ipod/i.test(ua));
  }, []);

  // Auto-copy addresses on mount
  useEffect(() => {
    copyAddresses();
  }, []);

  const copyAddresses = async () => {
    const addressText = `من: ${pickup.name}\nإلى: ${dropoff.name}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(addressText);
      } else {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = addressText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setStatus('copied');
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  const getAppInfo = () => {
    return APP_INFO[providerName.toLowerCase()] ||
           APP_INFO[providerNameAr] ||
           null;
  };

  const openApp = () => {
    setStatus('opening');
    const appInfo = getAppInfo();

    if (!appInfo) {
      // Fallback to web
      window.open(webFallbackUrl, '_blank');
      setStatus('manual');
      return;
    }

    if (isAndroid) {
      // Use Android Intent URL - more reliable
      const intentUrl = `intent://#Intent;scheme=${appInfo.scheme};package=${appInfo.androidPackage};end`;
      window.location.href = intentUrl;

      // If still here after 2 seconds, app not installed
      setTimeout(() => {
        setStatus('manual');
      }, 2000);
    } else if (isIOS) {
      // Try app scheme first
      const appUrl = `${appInfo.scheme}://`;
      window.location.href = appUrl;

      // Fallback after timeout
      setTimeout(() => {
        setStatus('manual');
      }, 2000);
    } else {
      // Desktop - just open web
      window.open(webFallbackUrl, '_blank');
      setStatus('manual');
    }
  };

  const openAppStore = () => {
    const appInfo = getAppInfo();
    if (!appInfo) return;

    if (isAndroid) {
      window.open(`https://play.google.com/store/apps/details?id=${appInfo.androidPackage}`, '_blank');
    } else if (isIOS) {
      window.open(`https://apps.apple.com/app/id${appInfo.iosAppId}`, '_blank');
    }
  };

  const openWebsite = () => {
    window.open(webFallbackUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className={`${providerBgColor} p-5 ${providerBgColor === 'bg-yellow-500' ? 'text-black' : 'text-white'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{providerEmoji}</span>
              <div>
                <h2 className="text-xl font-bold">الحجز عبر {providerNameAr}</h2>
                <p className="text-sm opacity-80">
                  {copied ? '✅ تم نسخ العناوين' : 'جاري نسخ العناوين...'}
                </p>
              </div>
            </div>
            <button
              onClick={onComplete}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Addresses */}
        <div className="p-5 space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-700 text-sm font-medium mb-1">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              نقطة الانطلاق
            </div>
            <p className="text-gray-900 font-medium">{pickup.name}</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-700 text-sm font-medium mb-1">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              الوجهة
            </div>
            <p className="text-gray-900 font-medium">{dropoff.name}</p>
          </div>

          {/* Copy confirmation */}
          {copied && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
              <span className="text-purple-700 font-medium">📋 تم نسخ العناوين - الصقها في التطبيق</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-5 pt-0 space-y-3">
          {/* Main action button */}
          <button
            onClick={openApp}
            disabled={status === 'opening'}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${providerBgColor} ${providerBgColor === 'bg-yellow-500' ? 'text-black' : 'text-white'} hover:opacity-90 active:scale-[0.98] disabled:opacity-50`}
          >
            {status === 'opening' ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>جاري فتح التطبيق...</span>
              </>
            ) : (
              <>
                <span>📱</span>
                <span>افتح تطبيق {providerNameAr}</span>
              </>
            )}
          </button>

          {/* Secondary actions - show after attempting to open */}
          {status === 'manual' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
              <p className="text-center text-gray-600 text-sm">
                ⚠️ إذا لم يفتح التطبيق:
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={openAppStore}
                  className="py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <span>📥</span>
                  <span>تحميل التطبيق</span>
                </button>

                <button
                  onClick={openWebsite}
                  className="py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <span>🌐</span>
                  <span>فتح الموقع</span>
                </button>
              </div>
            </div>
          )}

          {/* Re-copy button */}
          <button
            onClick={copyAddresses}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <span>📋</span>
            <span>{copied ? 'نسخ العناوين مرة أخرى' : 'نسخ العناوين'}</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-center text-gray-500">
            💡 بعد فتح التطبيق، اضغط مطولاً على خانة "إلى أين؟" ثم اختر "لصق"
          </p>
        </div>
      </div>
    </div>
  );
}
