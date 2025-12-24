'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getBoardMembers,
  getConversations,
  getServiceStatus,
  getKPIDashboard,
  getAlertDashboard,
  getUpcomingMeetings,
  getDecisionDashboard,
  getCompanyPhase,
  BoardMember,
  BoardConversation,
  ServiceStatus,
  KPIDashboard,
  AlertDashboard,
  BoardMeeting,
  DecisionDashboard,
  CompanyPhaseResponse,
  getRoleDisplayName,
  getAlertSeverityColor,
  getMeetingTypeDisplay,
  getPhaseDisplayName,
  getPhaseColor,
} from '@/lib/api/board';

export default function BoardDashboard() {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [conversations, setConversations] = useState<BoardConversation[]>([]);
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const [kpiDashboard, setKpiDashboard] = useState<KPIDashboard | null>(null);
  const [alertDashboard, setAlertDashboard] = useState<AlertDashboard | null>(null);
  const [upcomingMeetings, setUpcomingMeetings] = useState<BoardMeeting[]>([]);
  const [decisionDashboard, setDecisionDashboard] = useState<DecisionDashboard | null>(null);
  const [companyPhase, setCompanyPhase] = useState<CompanyPhaseResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          membersData,
          conversationsData,
          statusData,
          kpiData,
          alertData,
          meetingsData,
          decisionData,
          phaseData,
        ] = await Promise.all([
          getBoardMembers(),
          getConversations(),
          getServiceStatus(),
          getKPIDashboard().catch(() => null),
          getAlertDashboard().catch(() => null),
          getUpcomingMeetings().catch(() => []),
          getDecisionDashboard().catch(() => null),
          getCompanyPhase().catch(() => null),
        ]);
        setMembers(membersData);
        setConversations(conversationsData);
        setStatus(statusData);
        setKpiDashboard(kpiData);
        setAlertDashboard(alertData);
        setUpcomingMeetings(meetingsData);
        setDecisionDashboard(decisionData);
        setCompanyPhase(phaseData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const roleColors: Record<string, string> = {
    CEO: 'from-purple-500 to-purple-600',
    CTO: 'from-blue-500 to-blue-600',
    CFO: 'from-green-500 to-green-600',
    CMO: 'from-orange-500 to-orange-600',
    COO: 'from-yellow-500 to-yellow-600',
    CLO: 'from-red-500 to-red-600',
  };

  const quickActions = [
    {
      title: 'اسأل سؤال سريع',
      description: 'احصل على إجابة فورية من أحد أعضاء المجلس',
      href: '/board/chat?type=QUESTION',
      icon: '💬',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'عقد اجتماع',
      description: 'ناقش موضوع مع كل أعضاء المجلس',
      href: '/board/chat?type=MEETING',
      icon: '🎯',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'عصف ذهني',
      description: 'استكشف أفكار جديدة مع الفريق',
      href: '/board/chat?type=BRAINSTORM',
      icon: '💡',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      title: 'قرار SPADE',
      description: 'ابدأ عملية قرار منظمة',
      href: '/board/decisions/new',
      icon: '⚡',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header with Company Phase */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">مرحباً بك في مجلس الإدارة</h1>
          <p className="text-gray-400">فريقك التنفيذي من الذكاء الاصطناعي جاهز لمساعدتك</p>
        </div>

        {/* Company Phase Badge */}
        {companyPhase && (
          <Link
            href="/board/settings"
            className="group flex items-center gap-3 p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50 hover:border-gray-600 transition-all"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPhaseColor(companyPhase.currentPhase)} flex items-center justify-center`}>
              <span className="text-2xl">
                {companyPhase.currentPhase === 'MVP' ? '🚀' :
                 companyPhase.currentPhase === 'PRODUCT_MARKET_FIT' ? '🎯' :
                 companyPhase.currentPhase === 'GROWTH' ? '📈' :
                 companyPhase.currentPhase === 'SCALE' ? '🏢' : '👑'}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400">مرحلة الشركة</p>
              <p className="font-semibold text-white">{getPhaseDisplayName(companyPhase.currentPhase)}</p>
              {companyPhase.config?.primaryGoalAr && (
                <p className="text-xs text-gray-500 mt-0.5 max-w-[200px] truncate">
                  {companyPhase.config.primaryGoalAr}
                </p>
              )}
            </div>
            <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      {/* Status Bar */}
      {status && (
        <div className="mb-8 p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${status.claude.isAvailable ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-gray-300">
              {status.claude.isAvailable ? 'المجلس جاهز ومتاح' : 'خدمة Claude غير متاحة حالياً'}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {status.claude.requestsThisMinute}/{status.claude.maxRequestsPerMinute} طلب/دقيقة
          </div>
        </div>
      )}

      {/* Governance Overview - نظرة عامة على الحوكمة */}
      <div className="mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPIs Summary */}
        <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-400">مؤشرات الأداء</h3>
            <span className="text-2xl">📊</span>
          </div>
          {kpiDashboard ? (
            <>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-white">{kpiDashboard.summary.healthScore}%</div>
                <div className="flex gap-1">
                  <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">
                    {kpiDashboard.summary.green}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                    {kpiDashboard.summary.yellow}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400">
                    {kpiDashboard.summary.red}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">صحة النظام العامة</p>
            </>
          ) : (
            <p className="text-gray-500 text-sm">لم يتم تهيئة المؤشرات بعد</p>
          )}
        </div>

        {/* Alerts Summary */}
        <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-400">التنبيهات النشطة</h3>
            <span className="text-2xl">🚨</span>
          </div>
          {alertDashboard ? (
            <>
              <div className="flex items-center gap-3">
                <div className={`text-3xl font-bold ${alertDashboard.summary.total > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {alertDashboard.summary.total}
                </div>
                {alertDashboard.summary.emergency > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-red-600/20 text-red-400 animate-pulse">
                    {alertDashboard.summary.emergency} طوارئ
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {alertDashboard.summary.critical} حرج • {alertDashboard.summary.warning} تحذير
              </p>
            </>
          ) : (
            <div className="text-3xl font-bold text-green-400">0</div>
          )}
        </div>

        {/* Meetings Summary */}
        <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-400">الاجتماعات القادمة</h3>
            <span className="text-2xl">📅</span>
          </div>
          <div className="text-3xl font-bold text-white">{upcomingMeetings.length}</div>
          {upcomingMeetings.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              القادم: {upcomingMeetings[0].titleAr || upcomingMeetings[0].title}
            </p>
          )}
        </div>

        {/* Decisions Summary */}
        <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-400">القرارات</h3>
            <span className="text-2xl">⚡</span>
          </div>
          {decisionDashboard ? (
            <>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-white">{decisionDashboard.summary.inProgress}</div>
                <span className="text-sm text-gray-400">قيد العمل</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {decisionDashboard.actionItems.overdue > 0 && (
                  <span className="text-red-400">{decisionDashboard.actionItems.overdue} متأخرة • </span>
                )}
                {decisionDashboard.actionItems.pending} بنود معلقة
              </p>
            </>
          ) : (
            <div className="text-3xl font-bold text-white">0</div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group relative overflow-hidden rounded-2xl p-6 bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              <div className="text-4xl mb-4">{action.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
              <p className="text-sm text-gray-400">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Critical KPIs */}
        {kpiDashboard && kpiDashboard.criticalKPIs && kpiDashboard.criticalKPIs.length > 0 && (
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="text-red-400">⚠️</span> مؤشرات تحتاج اهتمام
              </h2>
              <Link href="/board/kpis" className="text-primary-400 hover:text-primary-300 text-sm">
                عرض الكل ←
              </Link>
            </div>
            <div className="space-y-3">
              {kpiDashboard.criticalKPIs.slice(0, 3).map((kpi: any) => (
                <div key={kpi.code} className="flex items-center justify-between p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                  <div>
                    <p className="font-medium text-white">{kpi.nameAr}</p>
                    <p className="text-sm text-gray-400">{kpi.code}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-red-400">{kpi.currentValue} {kpi.unit}</p>
                    <p className="text-xs text-gray-500">الهدف: {kpi.targetValue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Alerts */}
        {alertDashboard && alertDashboard.recentAlerts && alertDashboard.recentAlerts.length > 0 && (
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span>🚨</span> تنبيهات نشطة
              </h2>
              <Link href="/board/alerts" className="text-primary-400 hover:text-primary-300 text-sm">
                عرض الكل ←
              </Link>
            </div>
            <div className="space-y-3">
              {alertDashboard.recentAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl">
                  <div className={`w-2 h-2 rounded-full ${getAlertSeverityColor(alert.severity)}`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{alert.titleAr}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(alert.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    alert.severity === 'EMERGENCY' ? 'bg-red-600/20 text-red-400' :
                    alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {alert.severity === 'EMERGENCY' ? 'طوارئ' :
                     alert.severity === 'CRITICAL' ? 'حرج' : 'تحذير'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upcoming Meetings */}
      {upcomingMeetings.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span>📅</span> الاجتماعات القادمة
            </h2>
            <Link href="/board/meetings" className="text-primary-400 hover:text-primary-300 text-sm">
              عرض الكل ←
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingMeetings.slice(0, 3).map((meeting) => (
              <div key={meeting.id} className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    meeting.type === 'EMERGENCY' ? 'bg-red-500/20 text-red-400' :
                    meeting.type === 'STANDUP' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {getMeetingTypeDisplay(meeting.type)}
                  </span>
                  <span className="text-xs text-gray-500">{meeting.meetingNumber}</span>
                </div>
                <h4 className="font-medium text-white">{meeting.titleAr || meeting.title}</h4>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(meeting.scheduledAt).toLocaleDateString('ar-EG', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Board Members */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">أعضاء المجلس</h2>
          <Link href="/board/members" className="text-primary-400 hover:text-primary-300 text-sm">
            عرض الكل ←
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {members.map((member) => (
            <Link
              key={member.id}
              href={`/board/chat?member=${member.id}`}
              className="group relative p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50 hover:border-gray-600 transition-all duration-300 text-center"
            >
              <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${roleColors[member.role]} p-0.5`}>
                {member.avatar ? (
                  <img src={member.avatar} alt={member.nameAr} className="w-full h-full rounded-[14px] object-cover" />
                ) : (
                  <div className="w-full h-full rounded-[14px] bg-gray-800 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{member.nameAr.charAt(0)}</span>
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-white">{member.nameAr}</h3>
              <p className="text-sm text-gray-400">{getRoleDisplayName(member.role)}</p>
              <div className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs ${
                member.model === 'OPUS'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                {member.model}
              </div>
              <div className={`absolute top-3 left-3 w-2.5 h-2.5 rounded-full ${
                member.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'
              }`}></div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Conversations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">المحادثات الأخيرة</h2>
          <Link href="/board/conversations" className="text-primary-400 hover:text-primary-300 text-sm">
            عرض الكل ←
          </Link>
        </div>

        {conversations.length === 0 ? (
          <div className="p-12 bg-gray-800/50 rounded-2xl border border-gray-700/50 text-center">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-white mb-2">لا توجد محادثات بعد</h3>
            <p className="text-gray-400 mb-6">ابدأ أول محادثة مع مجلس الإدارة</p>
            <Link
              href="/board/chat"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              محادثة جديدة
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.slice(0, 5).map((conv) => (
              <Link
                key={conv.id}
                href={`/board/chat/${conv.id}`}
                className="block p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">{conv.topic}</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      {conv._count?.messages || 0} رسالة • {new Date(conv.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs ${
                    conv.status === 'ACTIVE'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {conv.status === 'ACTIVE' ? 'نشطة' : 'مكتملة'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
