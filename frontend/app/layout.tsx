import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { SocketProvider } from '@/lib/contexts/SocketContext';
import Navigation from '@/components/Navigation';
import FloatingAssistant from '@/components/FloatingAssistant';
import PWAProvider from '@/components/pwa/PWAProvider';

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Xchange - منصة التبادل والمقايضة في مصر',
  description: 'بيع واشتري ومبادلة في مصر - منصة التبادل والمقايضة الأولى',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Xchange',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const fontClass = locale === 'ar' ? 'font-cairo' : 'font-sans';

  return (
    <html lang={locale} dir={dir}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${fontClass} antialiased bg-gray-50`}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <SocketProvider>
              <PWAProvider>
                <Navigation />
                {children}
                <FloatingAssistant />
              </PWAProvider>
            </SocketProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
