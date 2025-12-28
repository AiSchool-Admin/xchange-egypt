import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الرسائل - Xchange',
  description: 'محادثاتك مع المستخدمين',
};

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
