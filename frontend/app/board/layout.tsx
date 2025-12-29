'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { isFounderAuthenticated, getFounderData, logoutFounder, FounderData } from '@/lib/api/founder';
import { getBoardMembers, getServiceStatus, BoardMember, ServiceStatus } from '@/lib/api/board';

interface BoardLayoutProps {
  children: React.ReactNode;
}

export default function BoardLayout({ children }: BoardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [founder, setFounder] = useState<FounderData | null>(null);
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Check founder authentication
  useEffect(() => {
    if (!isFounderAuthenticated()) {
      router.push('/founder/login');
      return;
    }
    setFounder(getFounderData());
    setAuthChecked(true);
  }, [router]);

  // Fetch board data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersData, statusData] = await Promise.all([
          getBoardMembers(),
          getServiceStatus(),
        ]);
        setMembers(membersData);
        setStatus(statusData);
      } catch (error) {
        console.error('Error fetching board data:', error);
        // If auth error, redirect to login
        if (error instanceof Error && error.message.includes('غير مسجل')) {
          router.push('/founder/login');
        }
      } finally {
        setLoading(false);
      }
    };

    if (authChecked && founder) {
      fetchData();
    }
  }, [authChecked, founder, router]);

  const handleLogout = async () => {
    await logoutFounder();
    router.push('/founder/login');
  };

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-primary-500/30 animate-ping"></div>
            <div className="absolute inset-2 rounded-full border-4 border-t-primary-500 border-r-primary-500/50 border-b-primary-500/25 border-l-transparent animate-spin"></div>
            <div className="absolute inset-4 rounded-full bg-primary-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-gray-400 text-lg">جاري تحميل مجلس الإدارة...</p>
        </div>
      </div>
    );
  }

  if (!founder) {
    return null;
  }

  const navigation = [
    { name: 'لوحة التحكم', href: '/board', icon: '📊' },
    { name: 'محادثة جديدة', href: '/board/chat', icon: '💬' },
    { name: 'المحادثات السابقة', href: '/board/conversations', icon: '🕒' },
    { name: 'أعضاء المجلس', href: '/board/members', icon: '👥' },
  ];

  const governanceNavigation = [
    { name: 'مؤشرات الأداء', href: '/board/kpis', icon: '📈' },
    { name: 'التنبيهات', href: '/board/alerts', icon: '🚨' },
    { name: 'الاجتماعات', href: '/board/meetings', icon: '📅' },
    { name: 'القرارات', href: '/board/decisions', icon: '⚡' },
  ];

  const autonomousNavigation = [
    { name: 'المجلس الذاتي', href: '/board/autonomous', icon: '🤖' },
    { name: 'محاضر الاجتماعات', href: '/board/moms', icon: '📋' },
    { name: 'الإعدادات', href: '/board/settings', icon: '⚙️' },
  ];

  const roleColors: Record<string, string> = {
    CEO: 'from-purple-500 to-purple-600',
    CTO: 'from-blue-500 to-blue-600',
    CFO: 'from-green-500 to-green-600',
    CMO: 'from-orange-500 to-orange-600',
    COO: 'from-yellow-500 to-yellow-600',
    CLO: 'from-red-500 to-red-600',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" dir="rtl">
      {/* Sidebar */}
      <aside className="fixed top-0 right-0 h-full w-64 bg-gray-800/50 backdrop-blur-xl border-l border-gray-700/50 flex flex-col z-40">
        {/* Header - Compact */}
        <div className="p-4 border-b border-gray-700/50">
          <Link href="/board" className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <span className="text-xl">🏛️</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">مجلس الإدارة</h1>
              <p className="text-xs text-gray-400">AI Board</p>
            </div>
          </Link>

          {/* Founder Badge - Compact */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-2 border border-purple-500/30">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {founder.fullName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{founder.fullName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
              title="تسجيل الخروج"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {/* Main Navigation */}
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Governance Section */}
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <p className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">الحوكمة</p>
            <div className="space-y-1">
              {governanceNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-500/20 text-primary-400'
                        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Autonomous Section */}
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <p className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">المجلس الذاتي</p>
            <div className="space-y-1">
              {autonomousNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-500/20 text-primary-400'
                        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Board Members - Compact Row */}
        <div className="p-3 border-t border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">أعضاء المجلس</span>
            <Link href="/board/members" className="text-xs text-primary-400 hover:text-primary-300">
              عرض الكل
            </Link>
          </div>
          <div className="flex gap-1">
            {members.slice(0, 6).map((member) => (
              <Link
                key={member.id}
                href={`/board/chat?member=${member.id}`}
                className="group relative"
                title={`${member.nameAr} - ${member.role}`}
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${roleColors[member.role]} p-0.5 transition-transform group-hover:scale-110`}>
                  <div className="w-full h-full rounded-md bg-gray-800 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{member.nameAr.charAt(0)}</span>
                  </div>
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ${member.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'} border border-gray-800`}></div>
              </Link>
            ))}
          </div>
        </div>

        {/* Service Status - Minimal */}
        {status && (
          <div className="px-3 py-2 border-t border-gray-700/50 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status.claude.isAvailable ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-400">
              {status.claude.isAvailable ? 'Claude متاح' : 'Claude غير متاح'}
            </span>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="mr-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
