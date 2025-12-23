'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/pushNotifications';

/**
 * PWA Provider - Registers service worker for offline support
 * Install banners are disabled
 */
export default function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register service worker for offline support
    registerServiceWorker();

    // Prevent browser's default install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  return <>{children}</>;
}
