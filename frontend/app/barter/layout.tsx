import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المقايضة - Xchange',
  description: 'تبادل السلع والمنتجات مع الآخرين',
};

export default function BarterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
