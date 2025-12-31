'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { founderFetch } from '@/lib/api/founder';

interface SPADEDecision {
  id: string;
  decisionNumber: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  status: 'INITIATED' | 'SETTING_PHASE' | 'PEOPLE_PHASE' | 'ALTERNATIVES_PHASE' | 'DECIDE_PHASE' | 'EXPLAIN_PHASE' | 'COMPLETED';
  deadline?: string;
  setting?: any;
  approver?: any;
  consultants?: any[];
  alternatives?: any[];
  selectedAlternative?: any;
  explanation?: string;
  createdAt: string;
}

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<SPADEDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    const fetchDecisions = async () => {
      try {
        const response = await founderFetch('/board/decisions');
        setDecisions(response.data || []);
      } catch (error) {
        console.error('Error fetching decisions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDecisions();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      INITIATED: { label: 'بدأ', color: 'bg-blue-500/20 text-blue-400' },
      SETTING_PHASE: { label: 'تحديد السياق', color: 'bg-purple-500/20 text-purple-400' },
      PEOPLE_PHASE: { label: 'تحديد الأشخاص', color: 'bg-pink-500/20 text-pink-400' },
      ALTERNATIVES_PHASE: { label: 'طرح البدائل', color: 'bg-orange-500/20 text-orange-400' },
      DECIDE_PHASE: { label: 'اتخاذ القرار', color: 'bg-yellow-500/20 text-yellow-400' },
      EXPLAIN_PHASE: { label: 'الشرح', color: 'bg-cyan-500/20 text-cyan-400' },
      COMPLETED: { label: 'مكتمل', color: 'bg-green-500/20 text-green-400' },
    };
    const s = statusMap[status] || { label: status, color: 'bg-gray-500/20 text-gray-400' };
    return <span className={`px-2 py-1 rounded-full text-xs ${s.color}`}>{s.label}</span>;
  };

  const getPhaseProgress = (status: string) => {
    const phases = ['INITIATED', 'SETTING_PHASE', 'PEOPLE_PHASE', 'ALTERNATIVES_PHASE', 'DECIDE_PHASE', 'EXPLAIN_PHASE', 'COMPLETED'];
    const index = phases.indexOf(status);
    return ((index + 1) / phases.length) * 100;
  };

  const filteredDecisions = decisions.filter(d => {
    if (filter === 'active') return d.status !== 'COMPLETED';
    if (filter === 'completed') return d.status === 'COMPLETED';
    return true;
  });

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
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/board" className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">القرارات</h1>
            <p className="text-gray-400">إطار SPADE لاتخاذ القرارات المنظمة</p>
          </div>
        </div>
        <Link
          href="/board/decisions/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          قرار جديد
        </Link>
      </div>

      {/* SPADE Framework Info */}
      <div className="mb-8 p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">إطار SPADE</h2>
        <div className="grid grid-cols-5 gap-4 text-center">
          <div className="p-3 bg-gray-700/30 rounded-lg">
            <span className="text-2xl mb-2 block">🎯</span>
            <p className="font-medium text-white">S</p>
            <p className="text-xs text-gray-400">Setting - السياق</p>
          </div>
          <div className="p-3 bg-gray-700/30 rounded-lg">
            <span className="text-2xl mb-2 block">👥</span>
            <p className="font-medium text-white">P</p>
            <p className="text-xs text-gray-400">People - الأشخاص</p>
          </div>
          <div className="p-3 bg-gray-700/30 rounded-lg">
            <span className="text-2xl mb-2 block">💡</span>
            <p className="font-medium text-white">A</p>
            <p className="text-xs text-gray-400">Alternatives - البدائل</p>
          </div>
          <div className="p-3 bg-gray-700/30 rounded-lg">
            <span className="text-2xl mb-2 block">⚡</span>
            <p className="font-medium text-white">D</p>
            <p className="text-xs text-gray-400">Decide - القرار</p>
          </div>
          <div className="p-3 bg-gray-700/30 rounded-lg">
            <span className="text-2xl mb-2 block">📢</span>
            <p className="font-medium text-white">E</p>
            <p className="text-xs text-gray-400">Explain - الشرح</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === f
                ? 'bg-primary-500 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            {f === 'all' ? 'الكل' : f === 'active' ? 'قيد العمل' : 'مكتملة'}
          </button>
        ))}
      </div>

      {/* Decisions List */}
      {filteredDecisions.length === 0 ? (
        <div className="p-12 bg-gray-800/50 rounded-2xl border border-gray-700/50 text-center">
          <span className="text-5xl mb-4 block">⚡</span>
          <h3 className="text-xl font-semibold text-white mb-2">لا توجد قرارات</h3>
          <p className="text-gray-400 mb-6">ابدأ بإنشاء قرار جديد باستخدام إطار SPADE</p>
          <Link
            href="/board/decisions/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            قرار جديد
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDecisions.map((decision) => (
            <Link
              key={decision.id}
              href={`/board/decisions/${decision.id}`}
              className="block p-6 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-gray-500">{decision.decisionNumber}</span>
                    {getStatusBadge(decision.status)}
                  </div>
                  <h3 className="text-lg font-semibold text-white">{decision.titleAr || decision.title}</h3>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                    {decision.descriptionAr || decision.description}
                  </p>
                </div>
                {decision.deadline && (
                  <div className="text-left">
                    <p className="text-xs text-gray-500">الموعد النهائي</p>
                    <p className="text-sm text-white">
                      {new Date(decision.deadline).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="pt-4 border-t border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">التقدم</span>
                  <span className="text-xs text-gray-400">{Math.round(getPhaseProgress(decision.status))}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all"
                    style={{ width: `${getPhaseProgress(decision.status)}%` }}
                  ></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
