import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الموبايلات - Xchange',
  description: 'بيع واشتري الموبايلات المستعملة والجديدة',
};

export default function MobilesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
