import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'موبايلات',
  description: 'سوق الموبايلات في Xchange - iPhone, Samsung, Xiaomi, Oppo, Huawei وجميع الماركات. موبايلات جديدة ومستعملة بأسعار مميزة مع ضمان.',
  keywords: ['موبايلات', 'هواتف', 'iPhone', 'Samsung', 'Xiaomi', 'Oppo', 'Huawei', 'mobiles', 'phones', 'smartphones', 'مصر'],
  openGraph: {
    title: 'سوق الموبايلات | Xchange Egypt',
    description: 'iPhone, Samsung, Xiaomi وجميع الماركات - موبايلات جديدة ومستعملة بأسعار مميزة',
    type: 'website',
    locale: 'ar_EG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'سوق الموبايلات | Xchange Egypt',
    description: 'بيع واشتري موبايلات جديدة ومستعملة',
  },
};

export default function MobilesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
