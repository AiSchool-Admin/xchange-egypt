import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الخدمات - Xchange',
  description: 'خدمات النقل والتوصيل',
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
