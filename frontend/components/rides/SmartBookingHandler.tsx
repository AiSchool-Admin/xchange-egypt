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

// App schemes that work on mobile
const APP_SCHEMES: Record<string, string> = {
  'indrive': 'indrive://app',
  'إن درايف': 'indrive://app',
  'didi': 'didiglobal://splash',
  'ديدي': 'didiglobal://splash',
  'swvl': 'swvl://home',
  'سويفل': 'swvl://home',
  'halan': 'halan://app',
  'هلان': 'halan://app',
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
  const [status, setStatus] = useState<'copying' | 'opening' | 'success' | 'fallback'>('copying');
  const [showToast, setShowToast] = useState(true);

  useEffect(() => {
    handleSmartBooking();
  }, []);

  const handleSmartBooking = async () => {
    try {
      // Step 1: Copy addresses to clipboard
      setStatus('copying');
      const addressText = `${pickup.name}\n${dropoff.name}`;

      await copyToClipboard(addressText);

      // Step 2: Open the app
      setStatus('opening');

      // Wait a moment to show the status
      await new Promise(resolve => setTimeout(resolve, 500));

      // Try to open native app
      const appOpened = await openNativeApp();

      if (appOpened) {
        setStatus('success');
        // Auto close after 2 seconds
        setTimeout(() => {
          onComplete();
        }, 2000);
      } else {
        // Fallback to web
        setStatus('fallback');
        setTimeout(() => {
          window.open(webFallbackUrl, '_blank');
          onComplete();
        }, 1500);
      }
    } catch (error) {
      console.error('Smart booking error:', error);
      setStatus('fallback');
      window.open(webFallbackUrl, '_blank');
      setTimeout(onComplete, 1500);
    }
  };

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const result = document.execCommand('copy');
        document.body.removeChild(textArea);
        return result;
      }
    } catch (e) {
      console.error('Copy failed:', e);
      return false;
    }
  };

  const openNativeApp = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      const scheme = APP_SCHEMES[providerName.toLowerCase()] ||
                     APP_SCHEMES[providerNameAr] ||
                     appScheme;

      // Create hidden iframe to try opening the app
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      let appOpened = false;

      // Set up visibility change listener (app opened = page hidden)
      const visibilityHandler = () => {
        if (document.hidden) {
          appOpened = true;
        }
      };
      document.addEventListener('visibilitychange', visibilityHandler);

      // Try to open the app
      const startTime = Date.now();

      // Use multiple methods to open app
      try {
        // Method 1: Direct location change
        window.location.href = scheme;
      } catch (e) {
        // Method 2: iframe
        try {
          iframe.src = scheme;
        } catch (e2) {
          console.log('Iframe method failed');
        }
      }

      // Check after delay if app opened
      setTimeout(() => {
        document.removeEventListener('visibilitychange', visibilityHandler);
        document.body.removeChild(iframe);

        // If page was hidden, app likely opened
        // Also check if more than 2 seconds passed without returning (app opened)
        const elapsed = Date.now() - startTime;

        if (appOpened || document.hidden) {
          resolve(true);
        } else if (elapsed < 1500) {
          // If we're still here quickly, app didn't open
          resolve(false);
        } else {
          // Assume app opened if there was a delay
          resolve(true);
        }
      }, 1500);
    });
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'copying':
        return { icon: '📋', text: 'جاري نسخ العناوين...', subtext: '' };
      case 'opening':
        return { icon: '🚀', text: `جاري فتح ${providerNameAr}...`, subtext: 'الصق العناوين في خانة البحث' };
      case 'success':
        return { icon: '✅', text: 'تم فتح التطبيق!', subtext: 'الصق العناوين بالضغط المطول في خانة البحث' };
      case 'fallback':
        return { icon: '🌐', text: 'جاري فتح الموقع...', subtext: 'التطبيق غير متاح، سيتم فتح الموقع' };
      default:
        return { icon: '⏳', text: 'جاري المعالجة...', subtext: '' };
    }
  };

  const statusInfo = getStatusMessage();

  if (!showToast) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <div
        className={`
          w-full max-w-md bg-white rounded-2xl shadow-2xl p-5
          pointer-events-auto animate-in slide-in-from-bottom-4 duration-300
          border-t-4 ${providerBgColor.replace('bg-', 'border-')}
        `}
        dir="rtl"
      >
        <div className="flex items-center gap-4">
          {/* Animated Icon */}
          <div className={`
            w-16 h-16 rounded-xl flex items-center justify-center text-3xl
            ${status === 'copying' || status === 'opening' ? 'animate-pulse' : ''}
            ${providerBgColor} ${providerBgColor === 'bg-yellow-500' ? 'text-black' : 'text-white'}
          `}>
            {status === 'success' ? '✅' : providerEmoji}
          </div>

          {/* Status Text */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">{statusInfo.icon}</span>
              <h3 className="font-bold text-gray-900 text-lg">{statusInfo.text}</h3>
            </div>
            {statusInfo.subtext && (
              <p className="text-gray-600 text-sm mt-1">{statusInfo.subtext}</p>
            )}
          </div>

          {/* Loading Spinner */}
          {(status === 'copying' || status === 'opening') && (
            <div className="w-8 h-8 border-3 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${providerBgColor} transition-all duration-1000 ease-out`}
            style={{
              width: status === 'copying' ? '33%' :
                     status === 'opening' ? '66%' :
                     '100%'
            }}
          />
        </div>

        {/* Instructions */}
        {status === 'success' && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 text-center">
            <p className="text-green-800 text-sm font-medium">
              💡 اضغط مطولاً على خانة "إلى أين؟" ثم اختر "لصق"
            </p>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onComplete}
          className="mt-4 w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-colors"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
}
