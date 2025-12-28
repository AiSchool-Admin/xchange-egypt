import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المخزون - Xchange',
  description: 'إدارة مخزونك',
};

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
