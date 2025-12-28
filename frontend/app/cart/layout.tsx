import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سلة التسوق - Xchange',
  description: 'إدارة مشترياتك',
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
