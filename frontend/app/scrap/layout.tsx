import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الخردة - Xchange',
  description: 'بيع وشراء الخردة والمعادن',
};

export default function ScrapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
