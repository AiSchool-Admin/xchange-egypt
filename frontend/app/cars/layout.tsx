import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'السيارات - Xchange',
  description: 'سوق السيارات المستعملة والجديدة في مصر',
};

export default function CarsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
