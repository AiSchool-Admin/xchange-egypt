import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'العقارات - Xchange',
  description: 'شقق وعقارات للبيع والإيجار في مصر',
};

export default function PropertiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
