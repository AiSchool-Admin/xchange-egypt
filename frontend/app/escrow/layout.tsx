import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الضمان - Xchange',
  description: 'معاملات آمنة مع نظام الضمان',
};

export default function EscrowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
