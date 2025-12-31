import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الإشعارات - Xchange',
  description: 'آخر التحديثات والإشعارات',
};

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
