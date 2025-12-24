'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getCompanyPhase,
  updateCompanyPhase,
  CompanyPhase,
  CompanyPhaseResponse,
  getPhaseDisplayName,
  getPhaseColor,
} from '@/lib/api/board';

export default function BoardSettings() {
  const [phaseData, setPhaseData] = useState<CompanyPhaseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchPhase = async () => {
      try {
        const data = await getCompanyPhase();
        setPhaseData(data);
      } catch (error) {
        console.error('Error fetching phase:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPhase();
  }, []);

  const handlePhaseChange = async (newPhase: CompanyPhase) => {
    if (newPhase === phaseData?.currentPhase) return;

    setUpdating(true);
    setMessage(null);

    try {
      const result = await updateCompanyPhase(newPhase);
      setPhaseData(prev => prev ? {
        ...prev,
        currentPhase: result.currentPhase,
        config: result.config,
      } : null);
      setMessage({ type: 'success', text: `تم تحديث المرحلة إلى: ${getPhaseDisplayName(newPhase)}` });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'حدث خطأ أثناء التحديث' });
    } finally {
      setUpdating(false);
    }
  };

  const phaseIcons: Record<CompanyPhase, string> = {
    MVP: '🚀',
    PRODUCT_MARKET_FIT: '🎯',
    GROWTH: '📈',
    SCALE: '🏢',
    MATURITY: '👑',
  };

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
          <Link
            href="/board"
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">إعدادات المجلس</h1>
            <p className="text-gray-400">إدارة إعدادات مجلس الإدارة ومرحلة الشركة</p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl ${
          message.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-400' :
          'bg-red-500/20 border border-red-500/30 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Company Phase Section */}
      <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-2">مرحلة الشركة</h2>
        <p className="text-gray-400 mb-6">
          اختر المرحلة الحالية للشركة. هذا يؤثر على أولويات المجلس ومؤشرات الأداء.
        </p>

        {/* Current Phase */}
        {phaseData && (
          <div className="mb-8 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getPhaseColor(phaseData.currentPhase)} flex items-center justify-center text-3xl`}>
                {phaseIcons[phaseData.currentPhase]}
              </div>
              <div>
                <p className="text-sm text-gray-400">المرحلة الحالية</p>
                <p className="text-2xl font-bold text-white">{getPhaseDisplayName(phaseData.currentPhase)}</p>
                {phaseData.config?.primaryGoalAr && (
                  <p className="text-gray-400 mt-1">{phaseData.config.primaryGoalAr}</p>
                )}
              </div>
            </div>

            {/* Phase Details */}
            {phaseData.config && (
              <div className="mt-4 pt-4 border-t border-gray-600/30 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">تحمل المخاطر</p>
                  <p className={`font-medium ${
                    phaseData.config.riskTolerance === 'HIGH' ? 'text-red-400' :
                    phaseData.config.riskTolerance === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {phaseData.config.riskTolerance === 'HIGH' ? 'عالي' :
                     phaseData.config.riskTolerance === 'MEDIUM' ? 'متوسط' : 'منخفض'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">نمط الابتكار</p>
                  <p className="text-white font-medium">
                    {phaseData.config.innovationMode === 'EXPERIMENTAL' ? 'تجريبي' :
                     phaseData.config.innovationMode === 'BALANCED' ? 'متوازن' : 'محافظ'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">مشاركة المؤسس</p>
                  <p className="text-white font-medium">
                    {phaseData.config.founderInvolvement === 'HIGH' ? 'عالية' :
                     phaseData.config.founderInvolvement === 'MODERATE' ? 'متوسطة' : 'محدودة'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Phase Selection Grid */}
        <h3 className="text-lg font-medium text-white mb-4">اختر مرحلة جديدة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {phaseData?.allPhases.map((phase) => (
            <button
              key={phase.phase}
              onClick={() => handlePhaseChange(phase.phase)}
              disabled={updating || phase.phase === phaseData.currentPhase}
              className={`p-4 rounded-xl border transition-all text-right ${
                phase.phase === phaseData.currentPhase
                  ? 'bg-primary-500/20 border-primary-500/50 cursor-default'
                  : 'bg-gray-700/30 border-gray-600/30 hover:border-gray-500 hover:bg-gray-700/50'
              } ${updating ? 'opacity-50 cursor-wait' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getPhaseColor(phase.phase)} flex items-center justify-center text-xl flex-shrink-0`}>
                  {phaseIcons[phase.phase]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{phase.nameAr}</p>
                    {phase.phase === phaseData.currentPhase && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-primary-500/30 text-primary-400">
                        الحالية
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{phase.descriptionAr}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">روابط سريعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/board/autonomous"
            className="p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors"
          >
            <span className="text-2xl mb-2 block">🤖</span>
            <p className="font-medium text-white">لوحة المجلس الذاتي</p>
            <p className="text-sm text-gray-400">الاستخبارات والتقارير</p>
          </Link>
          <Link
            href="/board/moms"
            className="p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors"
          >
            <span className="text-2xl mb-2 block">📋</span>
            <p className="font-medium text-white">محاضر الاجتماعات</p>
            <p className="text-sm text-gray-400">عرض وموافقة المحاضر</p>
          </Link>
          <Link
            href="/board/decisions"
            className="p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors"
          >
            <span className="text-2xl mb-2 block">⚡</span>
            <p className="font-medium text-white">القرارات</p>
            <p className="text-sm text-gray-400">إطار SPADE</p>
          </Link>
          <Link
            href="/board/kpis"
            className="p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors"
          >
            <span className="text-2xl mb-2 block">📊</span>
            <p className="font-medium text-white">مؤشرات الأداء</p>
            <p className="text-sm text-gray-400">KPIs والتتبع</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
