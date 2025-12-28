import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ذهب',
  description: 'سوق الذهب في Xchange - بيع واشتري ذهب وسبائك ومجوهرات بأسعار السوق اليومية المحدثة. ذهب عيار 21، 18، 24 كيرات. أسعار تنافسية وتعامل آمن.',
  keywords: ['ذهب', 'gold', 'سبائك', 'مجوهرات', 'jewelry', 'عيار 21', 'عيار 18', 'أسعار الذهب', 'مصر', 'شراء ذهب', 'بيع ذهب'],
  openGraph: {
    title: 'سوق الذهب | Xchange Egypt',
    description: 'بيع واشتري ذهب ومجوهرات بأسعار السوق اليومية',
    type: 'website',
    locale: 'ar_EG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'سوق الذهب | Xchange Egypt',
    description: 'بيع واشتري ذهب بأسعار السوق المحدثة',
  },
};

export default function GoldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
