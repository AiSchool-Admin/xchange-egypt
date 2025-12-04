import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { SocketProvider } from '@/lib/contexts/SocketContext';
import Navigation from '@/components/Navigation';
import FloatingAssistant from '@/components/FloatingAssistant';
import PWAProvider from '@/components/pwa/PWAProvider';

export const metadata: Metadata = {
  title: 'Xchange - منصة التبادل والمقايضة في مصر',
  description: 'بيع واشتري ومبادلة في مصر - منصة التبادل والمقايضة الأولى',
  manifest: '/manifest.json',
  themeColor: '#10b981',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Xchange',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-cairo antialiased bg-gray-50">
        <AuthProvider>
          <SocketProvider>
            <PWAProvider>
              <Navigation />
              {children}
              <FloatingAssistant />
            </PWAProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
