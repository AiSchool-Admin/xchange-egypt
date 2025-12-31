import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'عقارات',
  description: 'سوق العقارات في Xchange - شقق، فيلات، أراضي، محلات للبيع والإيجار في جميع محافظات مصر. القاهرة، الجيزة، الإسكندرية، الساحل الشمالي وأكثر.',
  keywords: ['عقارات', 'شقق', 'فيلات', 'أراضي', 'محلات', 'real estate', 'apartments', 'villas', 'القاهرة', 'الجيزة', 'مصر', 'للبيع', 'للإيجار'],
  openGraph: {
    title: 'سوق العقارات | Xchange Egypt',
    description: 'شقق، فيلات، أراضي للبيع والإيجار في جميع محافظات مصر',
    type: 'website',
    locale: 'ar_EG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'سوق العقارات | Xchange Egypt',
    description: 'شقق وعقارات للبيع والإيجار في مصر',
  },
};

export default function PropertiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
