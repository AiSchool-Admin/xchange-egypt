/**
 * Meeting Scheduler Service - خدمة جدولة الاجتماعات
 *
 * المسؤوليات:
 * - توليد أرقام الاجتماعات التسلسلية (STD-2025-001)
 * - جدولة الاجتماعات الدورية
 * - إطلاق اجتماعات الطوارئ
 * - إدارة قوالب الأجندات
 */

import { PrismaClient } from '@prisma/client';

// Local type definitions matching Prisma schema exactly
type BoardMeetingType = 'STANDUP' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'EMERGENCY';
type BoardMeetingStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'EMERGENCY';

const prisma = new PrismaClient();

// Meeting type prefixes - بادئات أنواع الاجتماعات
const MEETING_PREFIXES: Record<BoardMeetingType, string> = {
  STANDUP: 'STD',
  WEEKLY: 'WKL',
  MONTHLY: 'MTH',
  QUARTERLY: 'QTR',
  EMERGENCY: 'EMR',
};

// Meeting durations in minutes - مدة الاجتماعات بالدقائق
const MEETING_DURATIONS: Record<BoardMeetingType, number> = {
  STANDUP: 15,
  WEEKLY: 60,
  MONTHLY: 240,  // 4 hours
  QUARTERLY: 480, // 8 hours (full day)
  EMERGENCY: 60,
};

// Agenda templates - قوالب الأجندات
export const AGENDA_TEMPLATES: Record<BoardMeetingType, AgendaTemplate> = {
  STANDUP: {
    id: 'standup-template',
    nameAr: 'أجندة الاجتماع اليومي',
    duration: 15,
    items: [
      { order: 1, titleAr: 'ما تم إنجازه أمس', duration: 3, type: 'REVIEW' },
      { order: 2, titleAr: 'خطة اليوم', duration: 3, type: 'PLANNING' },
      { order: 3, titleAr: 'العوائق والتحديات', duration: 5, type: 'DISCUSSION' },
      { order: 4, titleAr: 'تنبيهات KPIs', duration: 2, type: 'ALERTS' },
      { order: 5, titleAr: 'قرارات سريعة', duration: 2, type: 'DECISION' },
    ],
  },
  WEEKLY: {
    id: 'weekly-template',
    nameAr: 'أجندة الاجتماع الأسبوعي',
    duration: 60,
    items: [
      { order: 1, titleAr: 'مراجعة KPIs الأسبوعية', duration: 10, type: 'REVIEW' },
      { order: 2, titleAr: 'تحديث من كل قسم', duration: 20, type: 'UPDATES' },
      { order: 3, titleAr: 'مناقشة التحديات', duration: 15, type: 'DISCUSSION' },
      { order: 4, titleAr: 'بنود العمل المتأخرة', duration: 5, type: 'ACTION_ITEMS' },
      { order: 5, titleAr: 'القرارات المطلوبة', duration: 10, type: 'DECISION' },
    ],
  },
  MONTHLY: {
    id: 'monthly-template',
    nameAr: 'أجندة الاجتماع الشهري',
    duration: 240,
    items: [
      { order: 1, titleAr: 'مراجعة الأداء الشهري', duration: 30, type: 'REVIEW' },
      { order: 2, titleAr: 'تحليل KPIs والاتجاهات', duration: 30, type: 'ANALYSIS' },
      { order: 3, titleAr: 'تقرير المالية', duration: 20, type: 'FINANCIAL' },
      { order: 4, titleAr: 'تقرير العمليات', duration: 20, type: 'OPERATIONS' },
      { order: 5, titleAr: 'تقرير التقنية', duration: 20, type: 'TECHNICAL' },
      { order: 6, titleAr: 'تقرير التسويق', duration: 20, type: 'MARKETING' },
      { order: 7, titleAr: 'مناقشة استراتيجية', duration: 40, type: 'STRATEGY' },
      { order: 8, titleAr: 'القرارات الكبرى', duration: 30, type: 'DECISION' },
      { order: 9, titleAr: 'خطة الشهر القادم', duration: 20, type: 'PLANNING' },
      { order: 10, titleAr: 'بنود العمل', duration: 10, type: 'ACTION_ITEMS' },
    ],
  },
  QUARTERLY: {
    id: 'quarterly-template',
    nameAr: 'أجندة الاجتماع الربع سنوي',
    duration: 480,
    items: [
      { order: 1, titleAr: 'مراجعة أداء الربع', duration: 45, type: 'REVIEW' },
      { order: 2, titleAr: 'تحليل OKRs', duration: 30, type: 'OKRS' },
      { order: 3, titleAr: 'المراجعة المالية الشاملة', duration: 45, type: 'FINANCIAL' },
      { order: 4, titleAr: 'تحليل السوق والمنافسة', duration: 30, type: 'MARKET' },
      { order: 5, titleAr: 'استراحة', duration: 15, type: 'BREAK' },
      { order: 6, titleAr: 'مراجعة الاستراتيجية', duration: 60, type: 'STRATEGY' },
      { order: 7, titleAr: 'تحديات وفرص', duration: 45, type: 'SWOT' },
      { order: 8, titleAr: 'غداء', duration: 60, type: 'BREAK' },
      { order: 9, titleAr: 'التخطيط للربع القادم', duration: 60, type: 'PLANNING' },
      { order: 10, titleAr: 'تحديد OKRs الجديدة', duration: 45, type: 'OKRS' },
      { order: 11, titleAr: 'القرارات الاستراتيجية', duration: 30, type: 'DECISION' },
      { order: 12, titleAr: 'ملخص وبنود العمل', duration: 15, type: 'ACTION_ITEMS' },
    ],
  },
  EMERGENCY: {
    id: 'emergency-template',
    nameAr: 'أجندة اجتماع الطوارئ',
    duration: 60,
    items: [
      { order: 1, titleAr: 'شرح الموقف الطارئ', duration: 10, type: 'BRIEFING' },
      { order: 2, titleAr: 'تقييم التأثير', duration: 10, type: 'IMPACT' },
      { order: 3, titleAr: 'البدائل والخيارات', duration: 15, type: 'ALTERNATIVES' },
      { order: 4, titleAr: 'اتخاذ القرار', duration: 15, type: 'DECISION' },
      { order: 5, titleAr: 'خطة التنفيذ الفوري', duration: 10, type: 'ACTION_ITEMS' },
    ],
  },
};

// Types
interface AgendaItem {
  order: number;
  titleAr: string;
  duration: number;
  type: string;
}

interface AgendaTemplate {
  id: string;
  nameAr: string;
  duration: number;
  items: AgendaItem[];
}

interface ScheduleMeetingParams {
  type: BoardMeetingType;
  title: string;
  titleAr: string;
  description?: string;
  descriptionAr?: string;
  scheduledAt: Date;
  attendeeIds: string[];
  customAgenda?: AgendaItem[];
}

interface EmergencyMeetingParams {
  alertId: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  attendeeIds?: string[];
}

export class MeetingSchedulerService {
  /**
   * Generate sequential meeting number - توليد رقم تسلسلي للاجتماع
   * Format: PREFIX-YEAR-SEQUENCE (e.g., STD-2025-001)
   */
  async generateMeetingNumber(type: BoardMeetingType): Promise<string> {
    const prefix = MEETING_PREFIXES[type];
    const year = new Date().getFullYear();

    // Count existing meetings of this type in this year
    const count = await prisma.boardMeeting.count({
      where: {
        type,
        meetingNumber: {
          startsWith: `${prefix}-${year}-`,
        },
      },
    });

    const sequence = String(count + 1).padStart(3, '0');
    return `${prefix}-${year}-${sequence}`;
  }

  /**
   * Schedule a new meeting - جدولة اجتماع جديد
   */
  async scheduleMeeting(params: ScheduleMeetingParams) {
    const meetingNumber = await this.generateMeetingNumber(params.type);
    const template = AGENDA_TEMPLATES[params.type];
    const agenda = params.customAgenda || template.items;

    // Create meeting
    const meeting = await prisma.boardMeeting.create({
      data: {
        meetingNumber,
        type: params.type,
        status: 'SCHEDULED',
        title: params.title,
        titleAr: params.titleAr,
        description: params.description,
        descriptionAr: params.descriptionAr,
        scheduledAt: params.scheduledAt,
        duration: MEETING_DURATIONS[params.type],
        agenda: agenda,
        agendaTemplateId: template.id,
        attendees: {
          create: params.attendeeIds.map(memberId => ({
            memberId,
            attended: false,
          })),
        },
      },
      include: {
        attendees: {
          include: {
            member: true,
          },
        },
      },
    });

    return meeting;
  }

  /**
   * Trigger emergency meeting - إطلاق اجتماع طوارئ
   * Called automatically when critical alert is created
   */
  async triggerEmergencyMeeting(params: EmergencyMeetingParams) {
    const meetingNumber = await this.generateMeetingNumber('EMERGENCY');

    // Get all active board members if no specific attendees
    let attendeeIds = params.attendeeIds;
    if (!attendeeIds || attendeeIds.length === 0) {
      const members = await prisma.boardMember.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true },
      });
      attendeeIds = members.map(m => m.id);
    }

    // Schedule for NOW (Africa/Cairo timezone)
    const now = new Date();

    const meeting = await prisma.boardMeeting.create({
      data: {
        meetingNumber,
        type: 'EMERGENCY',
        status: 'SCHEDULED',
        title: params.title,
        titleAr: params.titleAr,
        description: params.description,
        descriptionAr: params.descriptionAr,
        scheduledAt: now,
        duration: MEETING_DURATIONS.EMERGENCY,
        agenda: AGENDA_TEMPLATES.EMERGENCY.items,
        agendaTemplateId: AGENDA_TEMPLATES.EMERGENCY.id,
        triggerAlertId: params.alertId,
        attendees: {
          create: attendeeIds.map(memberId => ({
            memberId,
            attended: false,
          })),
        },
      },
      include: {
        attendees: {
          include: {
            member: true,
          },
        },
        triggerAlert: true,
      },
    });

    return meeting;
  }

  /**
   * Get upcoming meetings - الاجتماعات القادمة
   */
  async getUpcomingMeetings(limit = 10) {
    return prisma.boardMeeting.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          gte: new Date(),
        },
      },
      include: {
        attendees: {
          include: {
            member: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
      take: limit,
    });
  }

  /**
   * Start meeting - بدء الاجتماع
   */
  async startMeeting(meetingId: string) {
    return prisma.boardMeeting.update({
      where: { id: meetingId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });
  }

  /**
   * End meeting - إنهاء الاجتماع
   */
  async endMeeting(meetingId: string, summary: string, summaryAr: string) {
    return prisma.boardMeeting.update({
      where: { id: meetingId },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
        summary,
        summaryAr,
      },
    });
  }

  /**
   * Record attendance - تسجيل الحضور
   */
  async recordAttendance(meetingId: string, memberId: string, attended: boolean) {
    return prisma.boardMeetingAttendee.update({
      where: {
        meetingId_memberId: {
          meetingId,
          memberId,
        },
      },
      data: {
        attended,
        joinedAt: attended ? new Date() : null,
      },
    });
  }

  /**
   * Get agenda template - الحصول على قالب الأجندة
   */
  getAgendaTemplate(type: BoardMeetingType): AgendaTemplate {
    return AGENDA_TEMPLATES[type];
  }

  /**
   * Schedule recurring standup - جدولة الاجتماعات اليومية
   */
  async scheduleRecurringStandups(
    startDate: Date,
    endDate: Date,
    attendeeIds: string[],
    skipWeekends = true
  ) {
    const meetings = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      // Skip weekends if configured
      const dayOfWeek = current.getDay();
      if (skipWeekends && (dayOfWeek === 5 || dayOfWeek === 6)) {
        // Friday and Saturday (Egypt weekend)
        current.setDate(current.getDate() + 1);
        continue;
      }

      // Set time to 9:00 AM Cairo
      const meetingTime = new Date(current);
      meetingTime.setHours(9, 0, 0, 0);

      const meeting = await this.scheduleMeeting({
        type: 'STANDUP',
        title: `Daily Standup - ${current.toISOString().split('T')[0]}`,
        titleAr: `الاجتماع اليومي - ${current.toLocaleDateString('ar-EG')}`,
        scheduledAt: meetingTime,
        attendeeIds,
      });

      meetings.push(meeting);
      current.setDate(current.getDate() + 1);
    }

    return meetings;
  }
}

export const meetingSchedulerService = new MeetingSchedulerService();
