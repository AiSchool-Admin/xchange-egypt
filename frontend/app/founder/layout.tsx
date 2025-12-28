import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المؤسس - Xchange',
  description: 'لوحة تحكم المؤسس',
};

export default function FounderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
