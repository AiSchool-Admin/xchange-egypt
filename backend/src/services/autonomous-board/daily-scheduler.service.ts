/**
 * Daily Scheduler Service - خدمة الجدولة اليومية
 *
 * Responsible for:
 * - Pre-scheduling daily meetings at the start of each day
 * - Generating agendas for scheduled meetings
 * - Ensuring meetings appear in the UI before they start
 *
 * Times are in Cairo timezone (Africa/Cairo, UTC+2)
 */

import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { generateMeetingAgenda } from './agenda-intelligence.service';
import { AGENDA_TEMPLATES } from '../board/meeting-scheduler.service';

/**
 * Create a Date object for Cairo timezone
 * Cairo is UTC+2 (Egypt no longer uses DST since 2014)
 */
const createCairoDate = (year: number, month: number, day: number, hour: number, minute: number = 0): Date => {
  // Create date in UTC, adjusting for Cairo offset (UTC+2)
  // If we want 10:00 Cairo, we store 08:00 UTC
  const cairoOffsetHours = 2;
  const utcHour = hour - cairoOffsetHours;

  // Handle day rollover
  let adjustedDay = day;
  let adjustedHour = utcHour;
  if (utcHour < 0) {
    adjustedHour = 24 + utcHour;
    adjustedDay = day - 1;
  }

  return new Date(Date.UTC(year, month, adjustedDay, adjustedHour, minute, 0, 0));
};

/**
 * Get today's date components in Cairo timezone
 */
const getCairoToday = (): { year: number; month: number; day: number; dayOfWeek: number } => {
  const now = new Date();
  // Add 2 hours to get Cairo time
  const cairoTime = new Date(now.getTime() + (2 * 60 * 60 * 1000));
  return {
    year: cairoTime.getUTCFullYear(),
    month: cairoTime.getUTCMonth(),
    day: cairoTime.getUTCDate(),
    dayOfWeek: cairoTime.getUTCDay(),
  };
};

/**
 * Schedule daily meetings for today
 * Called at 06:00 AM after morning intelligence
 * Also called at server startup to ensure meetings exist
 */
export const scheduleDailyMeetings = async () => {
  logger.info('[DailyScheduler] Scheduling daily meetings...');

  // Get today's date in Cairo timezone
  const { year, month, day } = getCairoToday();

  // Create date range for today in Cairo timezone
  const todayStart = createCairoDate(year, month, day, 0, 0);
  const todayEnd = createCairoDate(year, month, day, 23, 59);

  logger.info(`[DailyScheduler] Today (Cairo): ${year}-${month + 1}-${day}`);
  logger.info(`[DailyScheduler] Date range: ${todayStart.toISOString()} to ${todayEnd.toISOString()}`);

  // Check if meetings for today already exist
  const existingMeetings = await prisma.boardMeeting.findMany({
    where: {
      scheduledAt: {
        gte: todayStart,
        lt: todayEnd,
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

  // 1. Morning Strategic Meeting at 10:00 AM Cairo
  // Check if a meeting exists around 10:00 Cairo time (08:00 UTC)
  const morningMeetingTime = createCairoDate(year, month, day, 10, 0);
  const morningExists = existingMeetings.some(m => {
    const meetingTime = new Date(m.scheduledAt).getTime();
    const targetTime = morningMeetingTime.getTime();
    // Allow 1 hour tolerance
    return Math.abs(meetingTime - targetTime) < 60 * 60 * 1000;
  });

  if (!morningExists) {
    const morningAgenda = await generateMeetingAgenda('MORNING', 45);
    const morningMeetingNumber = await generateMeetingNumber('STR');

    logger.info(`[DailyScheduler] Creating morning meeting at ${morningMeetingTime.toISOString()} (10:00 Cairo)`);

    const morningMeeting = await prisma.boardMeeting.create({
      data: {
        meetingNumber: morningMeetingNumber,
        type: 'WEEKLY',
        status: 'SCHEDULED',
        title: 'Strategic Morning Meeting',
        titleAr: 'الاجتماع الاستراتيجي الصباحي',
        description: 'Daily strategic review and planning session',
        descriptionAr: 'جلسة المراجعة الاستراتيجية والتخطيط اليومية',
        scheduledAt: morningMeetingTime,
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
    logger.info(`[DailyScheduler] Created morning meeting: ${morningMeetingNumber} at 10:00 Cairo`);
  } else {
    logger.info('[DailyScheduler] Morning meeting already exists');
  }

  // 2. Afternoon Operational Meeting at 2:00 PM Cairo
  const afternoonMeetingTime = createCairoDate(year, month, day, 14, 0);
  const afternoonExists = existingMeetings.some(m => {
    const meetingTime = new Date(m.scheduledAt).getTime();
    const targetTime = afternoonMeetingTime.getTime();
    // Allow 1 hour tolerance
    return Math.abs(meetingTime - targetTime) < 60 * 60 * 1000;
  });

  if (!afternoonExists) {
    const afternoonAgenda = await generateMeetingAgenda('AFTERNOON', 30);
    const afternoonMeetingNumber = await generateMeetingNumber('OPS');

    logger.info(`[DailyScheduler] Creating afternoon meeting at ${afternoonMeetingTime.toISOString()} (14:00 Cairo)`);

    const afternoonMeeting = await prisma.boardMeeting.create({
      data: {
        meetingNumber: afternoonMeetingNumber,
        type: 'STANDUP',
        status: 'SCHEDULED',
        title: 'Operational Afternoon Meeting',
        titleAr: 'الاجتماع التشغيلي المسائي',
        description: 'Daily operational review and action items',
        descriptionAr: 'المراجعة التشغيلية اليومية وبنود العمل',
        scheduledAt: afternoonMeetingTime,
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
    logger.info(`[DailyScheduler] Created afternoon meeting: ${afternoonMeetingNumber} at 14:00 Cairo`);
  } else {
    logger.info('[DailyScheduler] Afternoon meeting already exists');
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
 * Called on Sunday and Thursday at 09:00 AM Cairo
 */
export const scheduleWeeklyMeeting = async () => {
  const { year, month, day, dayOfWeek } = getCairoToday();

  // Only run on Sunday (0) and Thursday (4)
  if (dayOfWeek !== 0 && dayOfWeek !== 4) {
    logger.info('[DailyScheduler] Not a weekly meeting day, skipping');
    return null;
  }

  const todayStart = createCairoDate(year, month, day, 0, 0);
  const todayEnd = createCairoDate(year, month, day, 23, 59);

  // Check if weekly meeting already exists
  const existingWeekly = await prisma.boardMeeting.findFirst({
    where: {
      type: 'WEEKLY',
      scheduledAt: {
        gte: todayStart,
        lt: todayEnd,
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
  const weeklyMeetingTime = createCairoDate(year, month, day, 9, 0);

  const weeklyMeeting = await prisma.boardMeeting.create({
    data: {
      meetingNumber,
      type: 'WEEKLY',
      status: 'SCHEDULED',
      title: `Weekly Strategic Meeting - ${dayName}`,
      titleAr: `اجتماع الاستراتيجية الأسبوعي - ${dayName}`,
      scheduledAt: weeklyMeetingTime,
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

  logger.info(`[DailyScheduler] Created weekly meeting: ${meetingNumber} at 09:00 Cairo`);
  return weeklyMeeting;
};

/**
 * Get today's scheduled meetings (Cairo timezone)
 */
export const getTodaysMeetings = async () => {
  const { year, month, day } = getCairoToday();
  const todayStart = createCairoDate(year, month, day, 0, 0);
  const todayEnd = createCairoDate(year, month, day, 23, 59);

  logger.info(`[DailyScheduler] Getting meetings for Cairo date: ${year}-${month + 1}-${day}`);

  return prisma.boardMeeting.findMany({
    where: {
      scheduledAt: {
        gte: todayStart,
        lt: todayEnd,
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

/**
 * Initialize daily meetings at server startup
 * Ensures meetings exist even if cron hasn't run yet
 */
export const initializeDailyMeetingsOnStartup = async () => {
  logger.info('[DailyScheduler] Initializing daily meetings on server startup...');
  try {
    const meetings = await scheduleDailyMeetings();
    if (meetings.length > 0) {
      logger.info(`[DailyScheduler] Created ${meetings.length} meetings at startup`);
    } else {
      logger.info('[DailyScheduler] All daily meetings already exist');
    }
    return meetings;
  } catch (error) {
    logger.error('[DailyScheduler] Error initializing daily meetings:', error);
    // Don't throw - this is optional initialization
    return [];
  }
};

export default {
  scheduleDailyMeetings,
  scheduleWeeklyMeeting,
  getTodaysMeetings,
  initializeDailyMeetingsOnStartup,
};
