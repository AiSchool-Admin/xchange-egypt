import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { SocketProvider } from '@/lib/contexts/SocketContext';
import Navigation from '@/components/Navigation';
import { PWAProvider } from '@/components/pwa/PWAProvider';

export const metadata: Metadata = {
  title: 'Xchange - E-commerce Platform',
  description: 'Trade, barter, and auction your items on Xchange',
  manifest: '/manifest.json',
  themeColor: '#7c3aed',
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
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <SocketProvider>
            <PWAProvider>
              <Navigation />
              {children}
            </PWAProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
