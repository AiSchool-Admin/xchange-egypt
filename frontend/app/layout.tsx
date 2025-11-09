import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { SocketProvider } from '@/lib/contexts/SocketContext';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
        <AuthProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
