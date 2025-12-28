import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سيارات',
  description: 'سوق السيارات في Xchange - بيع واشتري وبادل سيارات مستعملة وجديدة في مصر. تويوتا، هيونداي، نيسان، شيفروليه وجميع الماركات. فحص معتمد وضمان.',
  keywords: ['سيارات', 'سيارات مستعملة', 'سيارات جديدة', 'cars', 'used cars', 'تويوتا', 'هيونداي', 'نيسان', 'مصر', 'بيع سيارة'],
  openGraph: {
    title: 'سوق السيارات | Xchange Egypt',
    description: 'بيع واشتري وبادل سيارات مستعملة وجديدة في مصر - جميع الماركات',
    type: 'website',
    locale: 'ar_EG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'سوق السيارات | Xchange Egypt',
    description: 'بيع واشتري سيارات مستعملة وجديدة في مصر',
  },
};

export default function CarsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
