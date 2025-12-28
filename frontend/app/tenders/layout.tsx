import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المناقصات - Xchange',
  description: 'تقديم وإدارة المناقصات',
};

export default function TendersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
