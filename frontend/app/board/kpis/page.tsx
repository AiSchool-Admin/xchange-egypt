'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { founderFetch } from '@/lib/api/founder';

interface KPIMetric {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  category: 'FINANCIAL' | 'OPERATIONAL' | 'CUSTOMER' | 'TECHNICAL' | 'GROWTH' | 'LEGAL';
  currentValue: number;
  targetValue: number;
  unit: string;
  status: 'GREEN' | 'YELLOW' | 'RED';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

export default function KPIsPage() {
  const [kpis, setKpis] = useState<KPIMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const response = await founderFetch('/board/kpis');
        setKpis(response.data || []);
      } catch (error) {
        console.error('Error fetching KPIs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchKPIs();
  }, []);

  const getCategoryDisplay = (category: string) => {
    const categories: Record<string, { label: string; icon: string }> = {
      FINANCIAL: { label: 'مالي', icon: '💰' },
      OPERATIONAL: { label: 'تشغيلي', icon: '⚙️' },
      CUSTOMER: { label: 'عملاء', icon: '👥' },
      TECHNICAL: { label: 'تقني', icon: '💻' },
      GROWTH: { label: 'نمو', icon: '📈' },
      LEGAL: { label: 'قانوني', icon: '⚖️' },
    };
    return categories[category] || { label: category, icon: '📊' };
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      GREEN: 'bg-green-500',
      YELLOW: 'bg-yellow-500',
      RED: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <span className="text-green-400">↑</span>;
    if (trend === 'down') return <span className="text-red-400">↓</span>;
    return <span className="text-gray-400">→</span>;
  };

  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const filteredKPIs = kpis.filter(kpi => {
    if (filter === 'critical') return kpi.status === 'RED';
    if (filter === 'warning') return kpi.status === 'YELLOW';
    if (categoryFilter !== 'all') return kpi.category === categoryFilter;
    return true;
  });

  const categories = ['all', ...new Set(kpis.map(k => k.category))];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Summary stats
  const stats = {
    total: kpis.length,
    green: kpis.filter(k => k.status === 'GREEN').length,
    yellow: kpis.filter(k => k.status === 'YELLOW').length,
    red: kpis.filter(k => k.status === 'RED').length,
  };

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
            <h1 className="text-3xl font-bold text-white">مؤشرات الأداء</h1>
            <p className="text-gray-400">تتبع مؤشرات الأداء الرئيسية للشركة</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <p className="text-sm text-gray-400">إجمالي المؤشرات</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/30">
          <p className="text-sm text-green-400">في المستوى الأخضر</p>
          <p className="text-2xl font-bold text-green-400">{stats.green}</p>
        </div>
        <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
          <p className="text-sm text-yellow-400">تحذير</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.yellow}</p>
        </div>
        <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30">
          <p className="text-sm text-red-400">حرج</p>
          <p className="text-2xl font-bold text-red-400">{stats.red}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          {(['all', 'critical', 'warning'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === f
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              }`}
            >
              {f === 'all' ? 'الكل' : f === 'critical' ? 'حرج' : 'تحذير'}
            </button>
          ))}
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-gray-800/50 text-white border border-gray-700/50"
        >
          <option value="all">جميع الفئات</option>
          {categories.filter(c => c !== 'all').map(cat => (
            <option key={cat} value={cat}>{getCategoryDisplay(cat).label}</option>
          ))}
        </select>
      </div>

      {/* KPIs Grid */}
      {filteredKPIs.length === 0 ? (
        <div className="p-12 bg-gray-800/50 rounded-2xl border border-gray-700/50 text-center">
          <span className="text-5xl mb-4 block">📊</span>
          <h3 className="text-xl font-semibold text-white mb-2">لا توجد مؤشرات</h3>
          <p className="text-gray-400">لم يتم تهيئة مؤشرات الأداء بعد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredKPIs.map((kpi) => (
            <div
              key={kpi.id}
              className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getCategoryDisplay(kpi.category).icon}</span>
                  <div>
                    <p className="font-medium text-white">{kpi.nameAr || kpi.name}</p>
                    <p className="text-xs text-gray-500">{kpi.code}</p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(kpi.status)}`}></div>
              </div>

              <div className="flex items-end justify-between mb-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">{kpi.currentValue}</span>
                  <span className="text-sm text-gray-400">{kpi.unit}</span>
                  {getTrendIcon(kpi.trend)}
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-500">الهدف</p>
                  <p className="text-sm text-gray-300">{kpi.targetValue} {kpi.unit}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    kpi.status === 'GREEN' ? 'bg-green-500' :
                    kpi.status === 'YELLOW' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${calculateProgress(kpi.currentValue, kpi.targetValue)}%` }}
                ></div>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                آخر تحديث: {new Date(kpi.lastUpdated).toLocaleDateString('ar-EG')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
