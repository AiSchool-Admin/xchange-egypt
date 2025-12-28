import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المزادات',
  description: 'شارك في مزادات Xchange واحصل على أفضل الأسعار - مزادات يومية على سيارات، موبايلات، إلكترونيات، ذهب وأكثر. ادخل واربح!',
  keywords: ['مزاد', 'مزايدة', 'auction', 'bidding', 'أفضل سعر', 'عروض', 'مصر'],
  openGraph: {
    title: 'المزادات | Xchange Egypt',
    description: 'شارك في مزادات Xchange واحصل على أفضل الأسعار - مزادات يومية متنوعة',
    type: 'website',
    locale: 'ar_EG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'المزادات | Xchange Egypt',
    description: 'شارك في مزادات Xchange واحصل على أفضل الأسعار',
  },
};

export default function AuctionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
