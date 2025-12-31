import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'السوق - Xchange',
  description: 'تصفح آلاف المنتجات المتاحة للبيع والشراء',
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
