import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الذهب - Xchange',
  description: 'أسعار الذهب وتداول الذهب في مصر',
};

export default function GoldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
