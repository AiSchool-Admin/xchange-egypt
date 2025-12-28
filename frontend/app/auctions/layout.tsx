import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المزادات - Xchange',
  description: 'شارك في المزادات واربح أفضل الصفقات',
};

export default function AuctionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
