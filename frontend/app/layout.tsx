import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { SocketProvider } from '@/lib/contexts/SocketContext';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Xchange - E-commerce Platform',
  description: 'Trade, barter, and auction your items on Xchange',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <SocketProvider>
            <Navigation />
            {children}
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
