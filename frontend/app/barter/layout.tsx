import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المقايضة',
  description: 'نظام المقايضة الذكي في Xchange - بادل أغراضك بأغراض أخرى تحتاجها بدون دفع فلوس. سيارة بشقة، موبايل بلابتوب، وأكثر! مطابقة ذكية وآمنة.',
  keywords: ['مقايضة', 'تبادل', 'بدون فلوس', 'barter', 'trade', 'exchange', 'swap', 'مصر', 'تبديل'],
  openGraph: {
    title: 'نظام المقايضة | Xchange Egypt',
    description: 'بادل أغراضك بأغراض أخرى تحتاجها - نظام مقايضة ذكي يجد لك أفضل العروض',
    type: 'website',
    locale: 'ar_EG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'نظام المقايضة | Xchange Egypt',
    description: 'بادل أغراضك بأغراض أخرى بدون فلوس',
  },
};

export default function BarterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
