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
    { name: 'لوحة التحكم', href: '/board', icon: 'dashboard' },
    { name: 'محادثة جديدة', href: '/board/chat', icon: 'chat' },
    { name: 'المحادثات السابقة', href: '/board/conversations', icon: 'history' },
    { name: 'أعضاء المجلس', href: '/board/members', icon: 'members' },
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
      <aside className="fixed top-0 right-0 h-full w-72 bg-gray-800/50 backdrop-blur-xl border-l border-gray-700/50 flex flex-col z-40">
        {/* Header - Founder Info */}
        <div className="p-6 border-b border-gray-700/50">
          <Link href="/board" className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <span className="text-2xl">🏛️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">مجلس الإدارة</h1>
              <p className="text-sm text-gray-400">AI Board of Directors</p>
            </div>
          </Link>

          {/* Founder Badge */}
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-3 border border-purple-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                {founder.fullName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{founder.fullName}</p>
                <p className="text-purple-300 text-xs truncate">{founder.title}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                title="تسجيل الخروج"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500/20 text-primary-400 shadow-lg shadow-primary-500/10'
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                {item.icon === 'dashboard' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                )}
                {item.icon === 'chat' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                )}
                {item.icon === 'history' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {item.icon === 'members' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )}
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Board Members Quick View */}
        <div className="p-4 border-t border-gray-700/50">
          <h3 className="text-sm font-medium text-gray-400 mb-3">أعضاء المجلس</h3>
          <div className="grid grid-cols-3 gap-2">
            {members.slice(0, 6).map((member) => (
              <Link
                key={member.id}
                href={`/board/members/${member.id}`}
                className="group relative"
                title={`${member.nameAr} - ${member.role}`}
              >
                <div className={`w-full aspect-square rounded-xl bg-gradient-to-br ${roleColors[member.role]} p-0.5 transition-transform group-hover:scale-105`}>
                  <div className="w-full h-full rounded-[10px] bg-gray-800 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">{member.nameAr.charAt(0)}</span>
                  </div>
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${member.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'} border-2 border-gray-800`}></div>
              </Link>
            ))}
          </div>
        </div>

        {/* Service Status */}
        {status && (
          <div className="p-4 border-t border-gray-700/50">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status.claude.isAvailable ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-400">
                {status.claude.isAvailable ? 'Claude متاح' : 'Claude غير متاح'}
              </span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="mr-72 min-h-screen">
        {children}
      </main>
    </div>
  );
}
