import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الفضة - Xchange',
  description: 'أسعار الفضة وتداول الفضة في مصر',
};

export default function SilverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
