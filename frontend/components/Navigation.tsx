'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useSocket } from '@/lib/contexts/SocketContext';
import { getUnreadCount } from '@/lib/api/notifications';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { onMatchFound, offMatchFound } = useSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch unread count on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    } else {
      setUnreadCount(0);
    }
  }, [user]);

  // Listen for real-time notifications
  useEffect(() => {
    const handleMatchNotification = (notification: any) => {
      setUnreadCount(prev => prev + 1);
      const score = Math.round(notification.averageMatchScore * 100);
      setToastMessage(`تم العثور على مطابقة! نسبة التوافق ${score}%`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    };

    onMatchFound(handleMatchNotification);

    return () => {
      offMatchFound(handleMatchNotification);
    };
  }, [onMatchFound, offMatchFound]);

  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Don't show navigation on login/register pages
  const hideNavRoutes = ['/login', '/register'];
  if (hideNavRoutes.includes(pathname)) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navLinks = [
    { href: '/deals', label: 'عروض فلاش', icon: '⚡' },
    { href: '/inventory', label: 'مخزوني', icon: '📦' },
    { href: '/items', label: 'السوق', icon: '🛒' },
    { href: '/luxury', label: 'سوق الفاخرة', icon: '👑' },
    { href: '/wallet', label: 'المحفظة', icon: '💳' },
    { href: '/exchange-points', label: 'نقاط التبادل', icon: '📍' },
    { href: '/escrow', label: 'الضمان', icon: '🔒' },
    { href: '/pools', label: 'الصناديق', icon: '🤝' },
    { href: '/facilitators', label: 'الوسطاء', icon: '👔' },
    { href: '/barter-chains', label: 'السلاسل', icon: '🔗' },
    { href: '/auctions', label: 'المزادات', icon: '🔨' },
    { href: '/saved-searches', label: 'التنبيهات', icon: '🔍' },
    { href: '/messages', label: 'الرسائل', icon: '💬' },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-2xl">🔄</span>
            <span className="bg-gradient-to-l from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Xchange
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  isActive(link.href)
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="ml-1">{link.icon}</span>
                {link.label}
              </Link>
            ))}
            {/* Notifications with badge */}
            <Link
              href="/notifications"
              className={`relative px-4 py-2 rounded-lg font-medium transition ${
                isActive('/notifications')
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="ml-1">🔔</span>
              الإشعارات
              {unreadCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/assistant"
                  className="px-3 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition flex items-center gap-1"
                  title="المساعد الذكي"
                >
                  <span>🤖</span>
                </Link>
                <Link
                  href="/sell-ai"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition flex items-center gap-2"
                >
                  <span>✨</span>
                  بيع بالـ AI
                </Link>
                <Link
                  href="/inventory/add"
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition flex items-center gap-2"
                >
                  <span>➕</span>
                  أضف إعلان
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {user.fullName?.charAt(0).toUpperCase() || 'م'}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.fullName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition"
                >
                  خروج
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition"
                >
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-50"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-1">
              {user && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <Link
                    href="/sell-ai"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium text-center"
                  >
                    ✨ بيع بالـ AI
                  </Link>
                  <Link
                    href="/inventory/add"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 bg-emerald-500 text-white rounded-lg font-medium text-center"
                  >
                    ➕ أضف إعلان
                  </Link>
                </div>
              )}
              {user && (
                <Link
                  href="/assistant"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 bg-purple-500 text-white rounded-lg font-medium mb-3 text-center"
                >
                  🤖 المساعد الذكي
                </Link>
              )}

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg font-medium transition ${
                    isActive(link.href)
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="ml-2">{link.icon}</span>
                  {link.label}
                </Link>
              ))}

              {/* Notifications with badge - Mobile */}
              <Link
                href="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-2 rounded-lg font-medium transition ${
                  isActive('/notifications')
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>
                  <span className="ml-2">🔔</span>
                  الإشعارات
                </span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>

              <div className="border-t border-gray-200 my-3 pt-3">
                {user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-gray-600 flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                        {user.fullName?.charAt(0).toUpperCase() || 'م'}
                      </div>
                      <span className="font-medium">{user.fullName}</span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-right px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition"
                    >
                      🚪 تسجيل الخروج
                    </button>
                  </>
                ) : (
                  <div className="space-y-2 px-4">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition text-center border border-gray-200"
                    >
                      تسجيل الدخول
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition text-center"
                    >
                      إنشاء حساب جديد
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 left-4 z-50 animate-slide-up" dir="rtl">
          <div className="bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="font-bold">تم العثور على مطابقة!</p>
              <p className="text-sm text-emerald-100">{toastMessage}</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="mr-4 text-emerald-200 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
