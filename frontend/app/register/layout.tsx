import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إنشاء حساب - Xchange',
  description: 'انضم لمجتمع Xchange',
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
