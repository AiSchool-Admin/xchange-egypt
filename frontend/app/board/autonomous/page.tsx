'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { founderFetch } from '@/lib/api/founder';

// Modal Component for Report Details
const ReportModal = ({
  isOpen,
  onClose,
  report,
  type,
}: {
  isOpen: boolean;
  onClose: () => void;
  report: any;
  type: 'content' | 'financial' | 'operations' | 'closing';
}) => {
  if (!isOpen || !report) return null;

  const getTitle = () => {
    switch (type) {
      case 'content': return 'حزمة المحتوى اليومية';
      case 'financial': return 'التقرير المالي اليومي';
      case 'operations': return 'تقرير العمليات اليومي';
      case 'closing': return 'تقرير الإغلاق اليومي';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'content': return 'pink';
      case 'financial': return 'green';
      case 'operations': return 'orange';
      case 'closing': return 'indigo';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl border border-${getColor()}-500/50 shadow-2xl`}>
        {/* Header */}
        <div className={`sticky top-0 p-4 bg-gray-900 border-b border-${getColor()}-500/30 flex items-center justify-between`}>
          <div>
            <h2 className="text-xl font-bold text-white">{getTitle()}</h2>
            <p className="text-sm text-gray-400">{report.reportNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <span className="text-2xl text-gray-400">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary */}
          {(report.summaryAr || report.summary || report.executiveSummaryAr || report.executiveSummary) && (
            <div className="p-4 bg-gray-800/50 rounded-xl">
              <h3 className="text-sm font-medium text-gray-400 mb-2">الملخص</h3>
              <p className="text-white leading-relaxed">
                {report.summaryAr || report.summary || report.executiveSummaryAr || report.executiveSummary}
              </p>
            </div>
          )}

          {/* Content Package Details */}
          {type === 'content' && report.content && (
            <div className="space-y-4">
              {/* Social Posts */}
              {report.content.socialPosts && (
                <div className="p-4 bg-pink-500/10 border border-pink-500/30 rounded-xl">
                  <h3 className="text-sm font-medium text-pink-400 mb-3">📱 المنشورات الاجتماعية</h3>
                  <div className="space-y-3">
                    {report.content.socialPosts.map((post: any, i: number) => (
                      <div key={i} className="p-3 bg-gray-900/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">
                            {post.platform === 'facebook' ? '📘' : post.platform === 'instagram' ? '📸' : post.platform === 'twitter' ? '🐦' : '📱'}
                          </span>
                          <span className="text-sm font-medium text-white capitalize">{post.platform}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${post.type === 'promo' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {post.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{post.content}</p>
                        {post.hashtags && post.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {post.hashtags.map((tag: string, j: number) => (
                              <span key={j} className="text-xs text-blue-400">#{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stories */}
              {report.content.stories && report.content.stories.length > 0 && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                  <h3 className="text-sm font-medium text-purple-400 mb-3">📖 القصص</h3>
                  <div className="space-y-2">
                    {report.content.stories.map((story: any, i: number) => (
                      <div key={i} className="p-3 bg-gray-900/50 rounded-lg">
                        <p className="text-sm font-medium text-white">{story.title}</p>
                        <p className="text-xs text-gray-400">{story.platform} • {story.type}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Email Campaigns */}
              {report.content.emailCampaigns && report.content.emailCampaigns.length > 0 && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <h3 className="text-sm font-medium text-blue-400 mb-3">📧 حملات البريد</h3>
                  <div className="space-y-2">
                    {report.content.emailCampaigns.map((email: any, i: number) => (
                      <div key={i} className="p-3 bg-gray-900/50 rounded-lg">
                        <p className="text-sm font-medium text-white">{email.subject}</p>
                        <p className="text-xs text-gray-400 mt-1">{email.preview}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Key Metrics */}
          {report.keyMetrics && Object.keys(report.keyMetrics).length > 0 && (
            <div className="p-4 bg-gray-800/50 rounded-xl">
              <h3 className="text-sm font-medium text-gray-400 mb-3">📊 المقاييس الرئيسية</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(report.keyMetrics).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-900/50 rounded-lg text-center">
                    <p className="text-xs text-gray-400 mb-1">{key}</p>
                    <p className={`text-lg font-bold text-${getColor()}-400`}>{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alerts */}
          {report.alerts && report.alerts.length > 0 && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <h3 className="text-sm font-medium text-red-400 mb-3">🚨 التنبيهات</h3>
              <ul className="space-y-2">
                {report.alerts.map((alert: any, i: number) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    {alert.message || alert}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Insights */}
          {report.insights && report.insights.length > 0 && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <h3 className="text-sm font-medium text-yellow-400 mb-3">💡 الرؤى</h3>
              <ul className="space-y-2">
                {report.insights.map((insight: any, i: number) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    {insight.insight || insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Generated Time */}
          {report.generatedAt && (
            <p className="text-xs text-gray-500 text-center">
              تم التوليد: {new Date(report.generatedAt).toLocaleString('ar-EG')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Agenda Modal Component
const AgendaModal = ({
  isOpen,
  onClose,
  agenda,
}: {
  isOpen: boolean;
  onClose: () => void;
  agenda: any;
}) => {
  if (!isOpen || !agenda) return null;

  const priorityColors: Record<string, string> = {
    CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/50',
    HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    LOW: 'bg-green-500/20 text-green-400 border-green-500/50',
  };

  const typeIcons: Record<string, string> = {
    STRATEGIC: '🎯',
    OPERATIONAL: '⚙️',
    INNOVATION: '💡',
    CRISIS: '🚨',
    REVIEW: '📊',
    DECISION: '⚖️',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl border border-cyan-500/50 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 p-4 bg-gray-900 border-b border-cyan-500/30 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📋</span>
              أجندة الاجتماع {agenda.meetingType === 'MORNING' ? 'الصباحي' : 'المسائي'}
            </h2>
            <p className="text-sm text-gray-400">
              {new Date(agenda.date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <span className="text-2xl text-gray-400">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Executive Summary */}
          <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
            <h3 className="text-sm font-medium text-cyan-400 mb-2">الملخص التنفيذي</h3>
            <p className="text-white leading-relaxed">{agenda.executiveSummaryAr || agenda.executiveSummary}</p>
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
              <span>⏱️ المدة الكلية: {agenda.totalDuration} دقيقة</span>
              <span>📌 عدد البنود: {agenda.items?.length || 0}</span>
            </div>
          </div>

          {/* Phase Context */}
          {agenda.phaseContext && (
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <span className="text-sm text-purple-400">🏢 سياق المرحلة: {agenda.phaseContext}</span>
            </div>
          )}

          {/* Agenda Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>📝</span> بنود الأجندة
            </h3>

            {agenda.items?.map((item: any, index: number) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border ${priorityColors[item.priority]} bg-opacity-10`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{typeIcons[item.type] || '📋'}</span>
                    <span className="text-white font-semibold">{index + 1}. {item.titleAr || item.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${priorityColors[item.priority]}`}>
                      {item.priority === 'CRITICAL' ? 'حرج' : item.priority === 'HIGH' ? 'عالي' : item.priority === 'MEDIUM' ? 'متوسط' : 'منخفض'}
                    </span>
                    <span className="text-xs text-gray-400">⏱️ {item.timeAllocation} د</span>
                  </div>
                </div>

                <p className="text-sm text-gray-300 mb-3">{item.description}</p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <span>👤</span> المسؤول: <span className="text-white">{item.leadMember}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span>👥</span> المشاركون: <span className="text-white">{item.participants?.join(', ')}</span>
                  </span>
                  {item.requiredDecision && (
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">⚖️ يتطلب قرار</span>
                  )}
                </div>

                {item.relatedKPIs?.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-500">📊 KPIs ذات صلة:</span>
                    {item.relatedKPIs.map((kpi: string) => (
                      <span key={kpi} className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">{kpi}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-3 pt-4 border-t border-gray-700">
            <div className="text-center p-3 bg-red-500/10 rounded-lg">
              <p className="text-2xl font-bold text-red-400">{agenda.items?.filter((i: any) => i.priority === 'CRITICAL').length || 0}</p>
              <p className="text-xs text-gray-400">بنود حرجة</p>
            </div>
            <div className="text-center p-3 bg-orange-500/10 rounded-lg">
              <p className="text-2xl font-bold text-orange-400">{agenda.items?.filter((i: any) => i.priority === 'HIGH').length || 0}</p>
              <p className="text-xs text-gray-400">أولوية عالية</p>
            </div>
            <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
              <p className="text-2xl font-bold text-yellow-400">{agenda.items?.filter((i: any) => i.requiredDecision).length || 0}</p>
              <p className="text-xs text-gray-400">قرارات مطلوبة</p>
            </div>
            <div className="text-center p-3 bg-cyan-500/10 rounded-lg">
              <p className="text-2xl font-bold text-cyan-400">{agenda.totalDuration}</p>
              <p className="text-xs text-gray-400">دقيقة</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface KPISnapshot {
  code: string;
  name: string;
  currentValue: number;
  targetValue: number;
  status: 'GREEN' | 'YELLOW' | 'RED';
  changePercent: number;
  flag: string;
}

interface MorningIntelligence {
  reportNumber: string;
  date: string;
  executiveSummary: string;
  executiveSummaryAr: string;
  kpiSnapshot: KPISnapshot[];
  anomalies: Array<{ kpi: string; severity: string; explanation: string }>;
  opportunities: Array<{ title: string; priority: string }>;
  threats: Array<{ title: string; priority: string }>;
  keyInsights: {
    totalKPIs: number;
    greenCount: number;
    yellowCount: number;
    redCount: number;
    anomalyCount: number;
  };
}

interface BoardMemberReport {
  reportNumber: string;
  title: string;
  titleAr: string;
  summary: string | null;
  summaryAr: string | null;
  scheduledTime: string | null;
  memberName: string;
  generatedAt: string | null;
  content?: any;
  keyMetrics?: any;
  alerts?: any;
  insights?: any;
}

interface ClosingReport {
  reportNumber: string;
  executiveSummary: string | null;
  executiveSummaryAr: string | null;
  meetingsHeld: number;
  decisionsCount: number;
  actionItemsCreated: number;
  date: string;
}

interface AutonomousDashboard {
  morningIntelligence: MorningIntelligence | null;
  contentPackage: BoardMemberReport | null;
  financialReport: BoardMemberReport | null;
  operationsReport: BoardMemberReport | null;
  closingReport: ClosingReport | null;
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
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedReport, setSelectedReport] = useState<{ report: any; type: 'content' | 'financial' | 'operations' | 'closing' } | null>(null);

  const fetchDashboard = async () => {
    try {
      const response = await founderFetch('/board/autonomous/dashboard');
      setDashboard(response.data);
    } catch (error) {
      console.error('Error fetching autonomous dashboard:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchDashboard();
      setLoading(false);
    };
    fetchData();
  }, []);

  // Initialize KPIs
  const handleInitializeKPIs = async () => {
    setActionLoading('initialize');
    setActionResult(null);
    try {
      const response = await founderFetch('/board/kpis/initialize', { method: 'POST' });
      setActionResult({ type: 'success', message: `تم تهيئة ${response.data?.created || 0} مؤشر أداء` });
      await fetchDashboard();
    } catch (error: any) {
      setActionResult({ type: 'error', message: error.message || 'فشل تهيئة المؤشرات' });
    } finally {
      setActionLoading(null);
    }
  };

  // Calculate KPIs
  const handleCalculateKPIs = async () => {
    setActionLoading('calculate');
    setActionResult(null);
    try {
      const response = await founderFetch('/board/kpis/calculate', { method: 'POST' });
      setActionResult({ type: 'success', message: `تم تحديث ${response.data?.updated || 0} مؤشر أداء من البيانات الفعلية` });
      await fetchDashboard();
    } catch (error: any) {
      setActionResult({ type: 'error', message: error.message || 'فشل حساب المؤشرات' });
    } finally {
      setActionLoading(null);
    }
  };

  // Generate Reports
  const handleGenerateReports = async () => {
    setActionLoading('reports');
    setActionResult(null);
    try {
      const response = await founderFetch('/board/reports/generate', { method: 'POST' });
      const generated = response.data?.results?.generated?.length || 0;
      setActionResult({ type: 'success', message: `تم توليد ${generated} تقارير يومية` });
      await fetchDashboard();
    } catch (error: any) {
      setActionResult({ type: 'error', message: error.message || 'فشل توليد التقارير' });
    } finally {
      setActionLoading(null);
    }
  };

  // Generate Morning Intelligence
  const handleGenerateMorningIntelligence = async () => {
    setActionLoading('intelligence');
    setActionResult(null);
    try {
      const response = await founderFetch('/board/autonomous/morning-intelligence/generate', { method: 'POST' });
      setActionResult({ type: 'success', message: 'تم توليد الاستخبارات الصباحية بنجاح' });
      await fetchDashboard();
    } catch (error: any) {
      setActionResult({ type: 'error', message: error.message || 'فشل توليد الاستخبارات الصباحية' });
    } finally {
      setActionLoading(null);
    }
  };

  // Run Autonomous Meeting
  const handleRunMeeting = async (type: 'MORNING' | 'AFTERNOON') => {
    setActionLoading('meeting');
    setActionResult(null);
    try {
      const response = await founderFetch('/board/autonomous/meetings/run', {
        method: 'POST',
        body: JSON.stringify({ type }),
      });
      const meetingType = type === 'MORNING' ? 'الصباحي' : 'المسائي';
      setActionResult({
        type: 'success',
        message: `تم عقد الاجتماع ${meetingType} بنجاح - MOM: ${response.data?.mom?.momNumber || 'N/A'}`,
      });
      await fetchDashboard();
    } catch (error: any) {
      setActionResult({ type: 'error', message: error.message || 'فشل عقد الاجتماع' });
    } finally {
      setActionLoading(null);
    }
  };

  // Generate Meeting Agenda
  const [showAgenda, setShowAgenda] = useState(false);
  const [agenda, setAgenda] = useState<any>(null);

  const handleGenerateAgenda = async () => {
    setActionLoading('agenda');
    setActionResult(null);
    try {
      const response = await founderFetch('/board/autonomous/agenda/generate', {
        method: 'POST',
        body: JSON.stringify({ type: 'MORNING', maxDuration: 45 }),
      });
      setAgenda(response.data);
      setShowAgenda(true);
      setActionResult({ type: 'success', message: 'تم توليد أجندة الاجتماع الصباحي' });
    } catch (error: any) {
      setActionResult({ type: 'error', message: error.message || 'فشل توليد الأجندة' });
    } finally {
      setActionLoading(null);
    }
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
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

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGenerateMorningIntelligence}
              disabled={actionLoading !== null}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {actionLoading === 'intelligence' ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span>🌅</span>
              )}
              الاستخبارات
            </button>
            <button
              onClick={handleInitializeKPIs}
              disabled={actionLoading !== null}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {actionLoading === 'initialize' ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span>⚙️</span>
              )}
              تهيئة
            </button>
            <button
              onClick={handleCalculateKPIs}
              disabled={actionLoading !== null}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {actionLoading === 'calculate' ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span>📊</span>
              )}
              حساب KPIs
            </button>
            <button
              onClick={handleGenerateReports}
              disabled={actionLoading !== null}
              className="px-3 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {actionLoading === 'reports' ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span>📝</span>
              )}
              التقارير
            </button>
            <button
              onClick={handleGenerateAgenda}
              disabled={actionLoading !== null}
              className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {actionLoading === 'agenda' ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span>📋</span>
              )}
              الأجندة
            </button>
            <button
              onClick={() => handleRunMeeting('MORNING')}
              disabled={actionLoading !== null}
              className="px-3 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {actionLoading === 'meeting' ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span>☀️</span>
              )}
              عقد اجتماع
            </button>
          </div>
        </div>

        {/* Action Result Message */}
        {actionResult && (
          <div className={`p-3 rounded-lg mb-4 ${
            actionResult.type === 'success'
              ? 'bg-green-500/20 border border-green-500/50 text-green-400'
              : 'bg-red-500/20 border border-red-500/50 text-red-400'
          }`}>
            <div className="flex items-center gap-2">
              <span>{actionResult.type === 'success' ? '✅' : '❌'}</span>
              <span>{actionResult.message}</span>
              <button
                onClick={() => setActionResult(null)}
                className="mr-auto text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}
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
      <div className="mb-8 p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl border border-blue-700/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🌅</span> الاستخبارات الصباحية
          </h2>
          {dashboard?.morningIntelligence && (
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
              {dashboard.morningIntelligence.reportNumber}
            </span>
          )}
        </div>

        {dashboard?.morningIntelligence ? (
          <div className="space-y-6">
            {/* Executive Summary */}
            <div className="p-4 bg-gray-900/50 rounded-xl">
              <h3 className="text-sm font-medium text-gray-400 mb-2">الملخص التنفيذي</h3>
              <p className="text-white leading-relaxed">
                {dashboard.morningIntelligence.executiveSummaryAr || dashboard.morningIntelligence.executiveSummary}
              </p>
            </div>

            {/* KPI Overview */}
            {dashboard.morningIntelligence.keyInsights && (
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                  <span className="text-2xl">🟢</span>
                  <p className="text-2xl font-bold text-green-400">{dashboard.morningIntelligence.keyInsights.greenCount}</p>
                  <p className="text-xs text-gray-400">مؤشرات سليمة</p>
                </div>
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
                  <span className="text-2xl">🟡</span>
                  <p className="text-2xl font-bold text-yellow-400">{dashboard.morningIntelligence.keyInsights.yellowCount}</p>
                  <p className="text-xs text-gray-400">تحتاج انتباه</p>
                </div>
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                  <span className="text-2xl">🔴</span>
                  <p className="text-2xl font-bold text-red-400">{dashboard.morningIntelligence.keyInsights.redCount}</p>
                  <p className="text-xs text-gray-400">حرجة</p>
                </div>
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-center">
                  <span className="text-2xl">⚠️</span>
                  <p className="text-2xl font-bold text-purple-400">{dashboard.morningIntelligence.keyInsights.anomalyCount}</p>
                  <p className="text-xs text-gray-400">شذوذات</p>
                </div>
              </div>
            )}

            {/* Anomalies */}
            {dashboard.morningIntelligence.anomalies && dashboard.morningIntelligence.anomalies.length > 0 && (
              <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                <h3 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                  <span>⚠️</span> شذوذات مكتشفة
                </h3>
                <ul className="space-y-2">
                  {dashboard.morningIntelligence.anomalies.map((anomaly, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className={anomaly.severity === 'RED' ? 'text-red-400' : 'text-yellow-400'}>
                        {anomaly.severity === 'RED' ? '🔴' : '🟡'}
                      </span>
                      <span className="text-gray-300">{anomaly.explanation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Opportunities & Threats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboard.morningIntelligence.opportunities && dashboard.morningIntelligence.opportunities.length > 0 && (
                <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
                  <h3 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                    <span>💡</span> الفرص
                  </h3>
                  <ul className="space-y-2">
                    {dashboard.morningIntelligence.opportunities.map((opp, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                        {opp.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {dashboard.morningIntelligence.threats && dashboard.morningIntelligence.threats.length > 0 && (
                <div className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-xl">
                  <h3 className="text-sm font-medium text-orange-400 mb-3 flex items-center gap-2">
                    <span>⚡</span> التهديدات
                  </h3>
                  <ul className="space-y-2">
                    {dashboard.morningIntelligence.threats.map((threat, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                        {threat.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Link to full report */}
            <div className="flex justify-end">
              <Link
                href="/board/intelligence"
                className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
              >
                عرض التقرير الكامل
                <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="text-4xl mb-4 block">😴</span>
            <p className="text-gray-400">لم يتم توليد الاستخبارات الصباحية لهذا اليوم بعد</p>
            <p className="text-sm text-gray-500 mt-2">يتم توليد التقرير تلقائياً في الساعة 6:00 صباحاً</p>
          </div>
        )}
      </div>

      {/* Board Member Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Content Package - حزمة المحتوى (07:00 AM - Youssef CMO) */}
        <div
          onClick={() => dashboard?.contentPackage && setSelectedReport({ report: dashboard.contentPackage, type: 'content' })}
          className={`p-6 bg-gradient-to-br from-pink-900/30 to-red-900/30 rounded-2xl border border-pink-700/50 ${dashboard?.contentPackage ? 'cursor-pointer hover:border-pink-500/70 hover:shadow-lg hover:shadow-pink-500/10 transition-all' : ''}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-xl">📣</span> حزمة المحتوى
            </h2>
            <span className="text-xs text-gray-400">07:00 صباحاً</span>
          </div>
          {dashboard?.contentPackage ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-pink-400">{dashboard.contentPackage.reportNumber}</span>
                <span className="text-xs text-gray-500">{dashboard.contentPackage.memberName}</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {dashboard.contentPackage.summaryAr || dashboard.contentPackage.summary || 'تم إنشاء حزمة المحتوى اليومية'}
              </p>
              {/* Content Preview */}
              {dashboard.contentPackage.content?.socialPosts && (
                <div className="pt-2 border-t border-pink-500/20">
                  <p className="text-xs text-pink-400 mb-1">📱 {dashboard.contentPackage.content.socialPosts.length} منشورات جاهزة</p>
                </div>
              )}
              {dashboard.contentPackage.generatedAt && (
                <p className="text-xs text-gray-500">
                  تم التوليد: {new Date(dashboard.contentPackage.generatedAt).toLocaleTimeString('ar-EG')}
                </p>
              )}
              <p className="text-xs text-pink-400 text-center mt-2">اضغط لعرض التفاصيل ←</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <span className="text-2xl mb-2 block">⏳</span>
              <p className="text-sm text-gray-400">لم يتم توليد حزمة المحتوى بعد</p>
            </div>
          )}
        </div>

        {/* Financial Report - التقرير المالي (07:30 AM - Laila CFO) */}
        <div
          onClick={() => dashboard?.financialReport && setSelectedReport({ report: dashboard.financialReport, type: 'financial' })}
          className={`p-6 bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-2xl border border-green-700/50 ${dashboard?.financialReport ? 'cursor-pointer hover:border-green-500/70 hover:shadow-lg hover:shadow-green-500/10 transition-all' : ''}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-xl">💰</span> التقرير المالي
            </h2>
            <span className="text-xs text-gray-400">07:30 صباحاً</span>
          </div>
          {dashboard?.financialReport ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-400">{dashboard.financialReport.reportNumber}</span>
                <span className="text-xs text-gray-500">{dashboard.financialReport.memberName}</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {dashboard.financialReport.summaryAr || dashboard.financialReport.summary || 'تقرير الحالة المالية اليومية'}
              </p>
              {dashboard.financialReport.keyMetrics && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(dashboard.financialReport.keyMetrics as Record<string, any>).slice(0, 4).map(([key, value]) => (
                    <div key={key} className="p-2 bg-gray-900/50 rounded text-center">
                      <p className="text-xs text-gray-400">{key}</p>
                      <p className="text-sm font-bold text-green-400">{String(value)}</p>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-green-400 text-center mt-2">اضغط لعرض التفاصيل ←</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <span className="text-2xl mb-2 block">⏳</span>
              <p className="text-sm text-gray-400">لم يتم توليد التقرير المالي بعد</p>
            </div>
          )}
        </div>

        {/* Operations Report - تقرير العمليات (05:00 PM - Omar COO) */}
        <div
          onClick={() => dashboard?.operationsReport && setSelectedReport({ report: dashboard.operationsReport, type: 'operations' })}
          className={`p-6 bg-gradient-to-br from-orange-900/30 to-amber-900/30 rounded-2xl border border-orange-700/50 ${dashboard?.operationsReport ? 'cursor-pointer hover:border-orange-500/70 hover:shadow-lg hover:shadow-orange-500/10 transition-all' : ''}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-xl">⚙️</span> تقرير العمليات
            </h2>
            <span className="text-xs text-gray-400">05:00 مساءً</span>
          </div>
          {dashboard?.operationsReport ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-orange-400">{dashboard.operationsReport.reportNumber}</span>
                <span className="text-xs text-gray-500">{dashboard.operationsReport.memberName}</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {dashboard.operationsReport.summaryAr || dashboard.operationsReport.summary || 'ملخص العمليات اليومية'}
              </p>
              {dashboard.operationsReport.insights && Array.isArray(dashboard.operationsReport.insights) && (
                <ul className="space-y-1 mt-2">
                  {(dashboard.operationsReport.insights as Array<{insight: string}>).slice(0, 3).map((item, i) => (
                    <li key={i} className="text-xs text-gray-400 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-orange-400"></span>
                      {item.insight}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-orange-400 text-center mt-2">اضغط لعرض التفاصيل ←</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <span className="text-2xl mb-2 block">⏳</span>
              <p className="text-sm text-gray-400">لم يتم توليد تقرير العمليات بعد</p>
            </div>
          )}
        </div>

        {/* Closing Report - تقرير الإغلاق (06:00 PM) */}
        <div
          onClick={() => dashboard?.closingReport && setSelectedReport({ report: dashboard.closingReport, type: 'closing' })}
          className={`p-6 bg-gradient-to-br from-indigo-900/30 to-violet-900/30 rounded-2xl border border-indigo-700/50 ${dashboard?.closingReport ? 'cursor-pointer hover:border-indigo-500/70 hover:shadow-lg hover:shadow-indigo-500/10 transition-all' : ''}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-xl">📊</span> تقرير الإغلاق
            </h2>
            <span className="text-xs text-gray-400">06:00 مساءً</span>
          </div>
          {dashboard?.closingReport ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-indigo-400">{dashboard.closingReport.reportNumber}</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {dashboard.closingReport.executiveSummaryAr || dashboard.closingReport.executiveSummary || 'ملخص نهاية اليوم'}
              </p>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="p-2 bg-gray-900/50 rounded text-center">
                  <p className="text-xs text-gray-400">اجتماعات</p>
                  <p className="text-lg font-bold text-indigo-400">{dashboard.closingReport.meetingsHeld}</p>
                </div>
                <div className="p-2 bg-gray-900/50 rounded text-center">
                  <p className="text-xs text-gray-400">قرارات</p>
                  <p className="text-lg font-bold text-indigo-400">{dashboard.closingReport.decisionsCount}</p>
                </div>
                <div className="p-2 bg-gray-900/50 rounded text-center">
                  <p className="text-xs text-gray-400">بنود عمل</p>
                  <p className="text-lg font-bold text-indigo-400">{dashboard.closingReport.actionItemsCreated}</p>
                </div>
              </div>
              <p className="text-xs text-indigo-400 text-center mt-2">اضغط لعرض التفاصيل ←</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <span className="text-2xl mb-2 block">⏳</span>
              <p className="text-sm text-gray-400">لم يتم توليد تقرير الإغلاق بعد</p>
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        report={selectedReport?.report}
        type={selectedReport?.type || 'content'}
      />

      {/* Agenda Modal */}
      <AgendaModal
        isOpen={showAgenda}
        onClose={() => setShowAgenda(false)}
        agenda={agenda}
      />

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
        <Link
          href="/board/testing"
          className="p-4 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl border border-purple-500/50 hover:border-purple-400 transition-colors"
        >
          <span className="text-2xl mb-2 block">🧪</span>
          <p className="font-medium text-white">صفحة الاختبارات</p>
          <p className="text-sm text-gray-400">اختبار جميع الوظائف</p>
        </Link>
      </div>
    </div>
  );
}
