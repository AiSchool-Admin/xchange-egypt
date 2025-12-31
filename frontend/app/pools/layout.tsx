import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المجموعات - Xchange',
  description: 'انضم لمجموعات المقايضة',
};

export default function PoolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
