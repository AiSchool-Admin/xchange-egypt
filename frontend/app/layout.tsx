import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { SocketProvider } from '@/lib/contexts/SocketContext';
import Navigation from '@/components/Navigation';
import FloatingAssistant from '@/components/FloatingAssistant';
import PWAProvider from '@/components/pwa/PWAProvider';
import SkipLinks from '@/components/accessibility/SkipLinks';

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'Xchange Egypt - منصة التبادل والمقايضة في مصر',
    template: '%s | Xchange Egypt',
  },
  description: 'منصة Xchange للتبادل والمقايضة في مصر - بيع، اشتري، وبادل الأغراض المستعملة والجديدة بأمان وسهولة. سيارات، موبايلات، عقارات، ذهب وأكثر.',
  keywords: ['مقايضة', 'تبادل', 'بيع', 'شراء', 'مزاد', 'سوق مستعمل', 'مصر', 'سيارات', 'موبايلات', 'عقارات', 'barter', 'exchange', 'Egypt', 'marketplace'],
  authors: [{ name: 'Xchange Egypt' }],
  creator: 'Xchange Egypt',
  publisher: 'Xchange Egypt',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Xchange',
  },
  openGraph: {
    type: 'website',
    siteName: 'Xchange Egypt',
    title: 'Xchange Egypt - منصة التبادل والمقايضة في مصر',
    description: 'منصة Xchange للتبادل والمقايضة في مصر - بيع، اشتري، وبادل الأغراض المستعملة والجديدة بأمان وسهولة',
    locale: 'ar_EG',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Xchange Egypt',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Xchange Egypt - منصة التبادل والمقايضة في مصر',
    description: 'بيع، اشتري، وبادل الأغراض المستعملة والجديدة بأمان وسهولة',
    creator: '@XchangeEgypt',
  },
  alternates: {
    canonical: 'https://xchange.com.eg',
  },
  category: 'shopping',
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
        <SkipLinks />
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <SocketProvider>
              <PWAProvider>
                <Navigation />
                <main id="main-content" role="main" aria-label="المحتوى الرئيسي">
                  {children}
                </main>
                <FloatingAssistant />
              </PWAProvider>
            </SocketProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
