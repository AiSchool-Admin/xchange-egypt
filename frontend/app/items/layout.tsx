import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تصفح المنتجات',
  description: 'تصفح آلاف المنتجات المتاحة للبيع والمقايضة في Xchange - موبايلات، سيارات، إلكترونيات، أجهزة منزلية وأكثر. أسعار تنافسية وتعامل آمن.',
  keywords: ['منتجات', 'مستعمل', 'جديد', 'للبيع', 'مقايضة', 'items', 'products', 'buy', 'sell'],
  openGraph: {
    title: 'تصفح المنتجات | Xchange Egypt',
    description: 'تصفح آلاف المنتجات المتاحة للبيع والمقايضة في Xchange',
    type: 'website',
  },
};

export default function ItemsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
