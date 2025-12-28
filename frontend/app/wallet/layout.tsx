import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المحفظة - Xchange',
  description: 'رصيدك ومعاملاتك المالية',
};

export default function WalletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
