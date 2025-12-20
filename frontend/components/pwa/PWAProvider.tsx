'use client';

import { useEffect, useState } from 'react';
import { registerServiceWorker } from '@/lib/pushNotifications';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    // Register service worker
    registerServiceWorker();

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed this session
    if (sessionStorage.getItem('pwa-install-dismissed')) {
      return;
    }

    // Detect iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;

    if (isIOS && !isInStandaloneMode) {
      // Show iOS-specific prompt after delay
      setTimeout(() => {
        setShowIOSPrompt(true);
      }, 5000);
    }

    // Listen for beforeinstallprompt (Android/Chrome)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => {
        setShowInstallBanner(true);
      }, 3000);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setShowIOSPrompt(false);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setInstallPrompt(null);
    setShowInstallBanner(false);
  };

  const dismissBanner = () => {
    setShowInstallBanner(false);
    setShowIOSPrompt(false);
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  return (
    <>
      {children}

      {/* Android/Chrome Install Banner */}
      {showInstallBanner && !isInstalled && installPrompt && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-emerald-500 shadow-2xl p-4 z-50 animate-slide-up safe-area-bottom">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-4">
              {/* App Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 8L12 12L7 16" />
                  <path d="M17 8L12 12L17 16" />
                </svg>
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg">حمّل تطبيق Xchange</h3>
                <p className="text-gray-600 text-sm mt-0.5">
                  أضف التطبيق للشاشة الرئيسية للوصول السريع
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="inline-flex items-center text-xs text-emerald-600">
                    <svg className="w-3.5 h-3.5 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    بدون إنترنت
                  </span>
                  <span className="inline-flex items-center text-xs text-emerald-600">
                    <svg className="w-3.5 h-3.5 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    إشعارات
                  </span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={dismissBanner}
                className="flex-1 px-4 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors font-medium"
              >
                لاحقاً
              </button>
              <button
                onClick={handleInstall}
                className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-bold shadow-lg shadow-emerald-500/30"
              >
                تثبيت الآن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Install Instructions */}
      {showIOSPrompt && !isInstalled && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-emerald-500 shadow-2xl p-4 z-50 animate-slide-up safe-area-bottom">
          <div className="max-w-lg mx-auto">
            <div className="flex items-start gap-4">
              {/* App Icon */}
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 8L12 12L7 16" />
                  <path d="M17 8L12 12L17 16" />
                </svg>
              </div>

              {/* Instructions */}
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">أضف Xchange للشاشة الرئيسية</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">1</span>
                    <span>اضغط على</span>
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>في الأسفل</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">2</span>
                    <span>اختر &quot;إضافة إلى الشاشة الرئيسية&quot;</span>
                  </div>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={dismissBanner}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .safe-area-bottom {
          padding-bottom: max(1rem, env(safe-area-inset-bottom));
        }
      `}</style>
    </>
  );
}
