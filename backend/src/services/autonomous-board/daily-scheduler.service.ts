/**
 * Daily Scheduler Service - خدمة الجدولة اليومية
 *
 * Responsible for:
 * - Pre-scheduling daily meetings at the start of each day
 * - Generating agendas for scheduled meetings
 * - Ensuring meetings appear in the UI before they start
 */

import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { generateMeetingAgenda } from './agenda-intelligence.service';
import { AGENDA_TEMPLATES } from '../board/meeting-scheduler.service';

/**
 * Schedule daily meetings for today
 * Called at 06:00 AM after morning intelligence
 */
export const scheduleDailyMeetings = async () => {
  logger.info('[DailyScheduler] Scheduling daily meetings...');

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  // Check if meetings for today already exist
  const existingMeetings = await prisma.boardMeeting.findMany({
    where: {
      scheduledAt: {
        gte: new Date(year, month, day, 0, 0, 0),
        lt: new Date(year, month, day, 23, 59, 59),
      },
      type: {
        in: ['STANDUP', 'WEEKLY'],
      },
    },
  });

  // Get all board members for attendance
  const boardMembers = await prisma.boardMember.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true },
  });

  const attendeeIds = boardMembers.map(m => m.id);

  const scheduledMeetings = [];

  // 1. Morning Strategic Meeting at 10:00 AM
  const morningExists = existingMeetings.some(m => {
    const hour = new Date(m.scheduledAt).getHours();
    return hour >= 9 && hour <= 11 && m.type === 'WEEKLY';
  });

  if (!morningExists) {
    const morningAgenda = await generateMeetingAgenda('MORNING', 45);
    const morningMeetingNumber = await generateMeetingNumber('STR');

    const morningMeeting = await prisma.boardMeeting.create({
      data: {
        meetingNumber: morningMeetingNumber,
        type: 'WEEKLY',
        status: 'SCHEDULED',
        title: 'Strategic Morning Meeting',
        titleAr: 'الاجتماع الاستراتيجي الصباحي',
        description: 'Daily strategic review and planning session',
        descriptionAr: 'جلسة المراجعة الاستراتيجية والتخطيط اليومية',
        scheduledAt: new Date(year, month, day, 10, 0, 0),
        duration: 45,
        agenda: morningAgenda.items.map((item, index) => ({
          order: index + 1,
          titleAr: item.titleAr,
          title: item.title,
          duration: item.timeAllocation,
          type: item.type,
          leadMember: item.leadMember,
        })),
        agendaTemplateId: 'strategic-morning',
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
      },
    });

    scheduledMeetings.push(morningMeeting);
    logger.info(`[DailyScheduler] Created morning meeting: ${morningMeetingNumber}`);
  }

  // 2. Afternoon Operational Meeting at 2:00 PM
  const afternoonExists = existingMeetings.some(m => {
    const hour = new Date(m.scheduledAt).getHours();
    return hour >= 13 && hour <= 15 && m.type === 'STANDUP';
  });

  if (!afternoonExists) {
    const afternoonAgenda = await generateMeetingAgenda('AFTERNOON', 30);
    const afternoonMeetingNumber = await generateMeetingNumber('OPS');

    const afternoonMeeting = await prisma.boardMeeting.create({
      data: {
        meetingNumber: afternoonMeetingNumber,
        type: 'STANDUP',
        status: 'SCHEDULED',
        title: 'Operational Afternoon Meeting',
        titleAr: 'الاجتماع التشغيلي المسائي',
        description: 'Daily operational review and action items',
        descriptionAr: 'المراجعة التشغيلية اليومية وبنود العمل',
        scheduledAt: new Date(year, month, day, 14, 0, 0),
        duration: 30,
        agenda: afternoonAgenda.items.map((item, index) => ({
          order: index + 1,
          titleAr: item.titleAr,
          title: item.title,
          duration: item.timeAllocation,
          type: item.type,
          leadMember: item.leadMember,
        })),
        agendaTemplateId: 'operational-afternoon',
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
      },
    });

    scheduledMeetings.push(afternoonMeeting);
    logger.info(`[DailyScheduler] Created afternoon meeting: ${afternoonMeetingNumber}`);
  }

  logger.info(`[DailyScheduler] Scheduled ${scheduledMeetings.length} meetings for today`);
  return scheduledMeetings;
};

/**
 * Generate meeting number
 */
const generateMeetingNumber = async (prefix: string): Promise<string> => {
  const year = new Date().getFullYear();

  const count = await prisma.boardMeeting.count({
    where: {
      meetingNumber: {
        startsWith: `${prefix}-${year}-`,
      },
    },
  });

  return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
};

/**
 * Schedule weekly strategic meetings
 * Called on Sunday and Thursday at 09:00 AM
 */
export const scheduleWeeklyMeeting = async () => {
  const today = new Date();
  const dayOfWeek = today.getDay();

  // Only run on Sunday (0) and Thursday (4)
  if (dayOfWeek !== 0 && dayOfWeek !== 4) {
    logger.info('[DailyScheduler] Not a weekly meeting day, skipping');
    return null;
  }

  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  // Check if weekly meeting already exists
  const existingWeekly = await prisma.boardMeeting.findFirst({
    where: {
      type: 'WEEKLY',
      scheduledAt: {
        gte: new Date(year, month, day, 0, 0, 0),
        lt: new Date(year, month, day, 23, 59, 59),
      },
      duration: 60, // Weekly meetings are 60 minutes
    },
  });

  if (existingWeekly) {
    logger.info('[DailyScheduler] Weekly meeting already exists for today');
    return existingWeekly;
  }

  const boardMembers = await prisma.boardMember.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true },
  });

  const meetingNumber = await generateMeetingNumber('WKL');
  const dayName = dayOfWeek === 0 ? 'الأحد' : 'الخميس';

  const weeklyMeeting = await prisma.boardMeeting.create({
    data: {
      meetingNumber,
      type: 'WEEKLY',
      status: 'SCHEDULED',
      title: `Weekly Strategic Meeting - ${dayName}`,
      titleAr: `اجتماع الاستراتيجية الأسبوعي - ${dayName}`,
      scheduledAt: new Date(year, month, day, 9, 0, 0),
      duration: 60,
      agenda: AGENDA_TEMPLATES.WEEKLY.items,
      agendaTemplateId: AGENDA_TEMPLATES.WEEKLY.id,
      attendees: {
        create: boardMembers.map(m => ({
          memberId: m.id,
          attended: false,
        })),
      },
    },
  });

  logger.info(`[DailyScheduler] Created weekly meeting: ${meetingNumber}`);
  return weeklyMeeting;
};

/**
 * Get today's scheduled meetings
 */
export const getTodaysMeetings = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  return prisma.boardMeeting.findMany({
    where: {
      scheduledAt: {
        gte: new Date(year, month, day, 0, 0, 0),
        lt: new Date(year, month, day, 23, 59, 59),
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
  });
};

export default {
  scheduleDailyMeetings,
  scheduleWeeklyMeeting,
  getTodaysMeetings,
};
