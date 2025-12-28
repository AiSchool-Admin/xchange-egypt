import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إتمام الشراء - Xchange',
  description: 'أكمل عملية الشراء',
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
