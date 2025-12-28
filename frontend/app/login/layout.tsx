import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تسجيل الدخول - Xchange',
  description: 'تسجيل الدخول إلى حسابك',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
