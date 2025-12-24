'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { founderFetch } from '@/lib/api/founder';

interface AutonomousDashboard {
  morningIntelligence: any;
  stats: {
    pendingMOMs: number;
    todayMeetings: number;
    activeAlerts: number;
    activeIdeas: number;
    highThreatCompetitors: number;
  };
  latestEnvironmentScan: {
    scanNumber: string;
    date: string;
    confidenceLevel: number;
  } | null;
}

export default function AutonomousDashboardPage() {
  const [dashboard, setDashboard] = useState<AutonomousDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await founderFetch('/board/autonomous/dashboard');
        setDashboard(response.data);
      } catch (error) {
        console.error('Error fetching autonomous dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/board" className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">لوحة المجلس الذاتي</h1>
            <p className="text-gray-400">مراقبة العمليات الذاتية والاستخبارات</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">📋</span>
            <span className={`text-2xl font-bold ${dashboard?.stats.pendingMOMs ? 'text-yellow-400' : 'text-green-400'}`}>
              {dashboard?.stats.pendingMOMs || 0}
            </span>
          </div>
          <p className="text-gray-400 text-sm">محاضر بانتظار الموافقة</p>
        </div>

        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">📅</span>
            <span className="text-2xl font-bold text-white">{dashboard?.stats.todayMeetings || 0}</span>
          </div>
          <p className="text-gray-400 text-sm">اجتماعات اليوم</p>
        </div>

        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🚨</span>
            <span className={`text-2xl font-bold ${dashboard?.stats.activeAlerts ? 'text-red-400' : 'text-green-400'}`}>
              {dashboard?.stats.activeAlerts || 0}
            </span>
          </div>
          <p className="text-gray-400 text-sm">تنبيهات نشطة</p>
        </div>

        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">💡</span>
            <span className="text-2xl font-bold text-purple-400">{dashboard?.stats.activeIdeas || 0}</span>
          </div>
          <p className="text-gray-400 text-sm">أفكار نشطة</p>
        </div>

        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">👁️</span>
            <span className={`text-2xl font-bold ${dashboard?.stats.highThreatCompetitors ? 'text-orange-400' : 'text-green-400'}`}>
              {dashboard?.stats.highThreatCompetitors || 0}
            </span>
          </div>
          <p className="text-gray-400 text-sm">منافسون عالي الخطورة</p>
        </div>
      </div>

      {/* Latest Environment Scan */}
      {dashboard?.latestEnvironmentScan && (
        <div className="mb-8 p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🔍</span> آخر مسح بيئي
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-400">رقم المسح</p>
              <p className="font-medium text-white">{dashboard.latestEnvironmentScan.scanNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">التاريخ</p>
              <p className="font-medium text-white">
                {new Date(dashboard.latestEnvironmentScan.date).toLocaleDateString('ar-EG')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">مستوى الثقة</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${dashboard.latestEnvironmentScan.confidenceLevel}%` }}
                  ></div>
                </div>
                <span className="text-white font-medium">{dashboard.latestEnvironmentScan.confidenceLevel}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Morning Intelligence */}
      {dashboard?.morningIntelligence && (
        <div className="mb-8 p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🌅</span> الاستخبارات الصباحية
          </h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 whitespace-pre-wrap">
              {dashboard.morningIntelligence.summary || dashboard.morningIntelligence.executiveSummaryAr || 'لا توجد استخبارات صباحية لهذا اليوم'}
            </p>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/board/moms"
          className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-colors"
        >
          <span className="text-2xl mb-2 block">📋</span>
          <p className="font-medium text-white">محاضر الاجتماعات</p>
          <p className="text-sm text-gray-400">عرض وموافقة المحاضر</p>
        </Link>
        <Link
          href="/board/alerts"
          className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-colors"
        >
          <span className="text-2xl mb-2 block">🚨</span>
          <p className="font-medium text-white">التنبيهات</p>
          <p className="text-sm text-gray-400">إدارة التنبيهات</p>
        </Link>
        <Link
          href="/board/decisions"
          className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-colors"
        >
          <span className="text-2xl mb-2 block">⚡</span>
          <p className="font-medium text-white">القرارات</p>
          <p className="text-sm text-gray-400">قرارات SPADE</p>
        </Link>
        <Link
          href="/board/meetings"
          className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-colors"
        >
          <span className="text-2xl mb-2 block">📅</span>
          <p className="font-medium text-white">الاجتماعات</p>
          <p className="text-sm text-gray-400">جدول الاجتماعات</p>
        </Link>
      </div>
    </div>
  );
}
