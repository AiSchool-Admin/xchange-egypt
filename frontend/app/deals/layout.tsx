import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'العروض والتخفيضات',
  description: 'أفضل العروض والتخفيضات في Xchange - وفر حتى 70% على الموبايلات، الإلكترونيات، الملابس وأكثر. عروض يومية وأسبوعية حصرية.',
  keywords: ['عروض', 'تخفيضات', 'خصومات', 'deals', 'offers', 'discounts', 'sale', 'توفير'],
  openGraph: {
    title: 'العروض والتخفيضات | Xchange Egypt',
    description: 'أفضل العروض والتخفيضات - وفر حتى 70% على المنتجات المختلفة',
    type: 'website',
  },
};

export default function DealsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
