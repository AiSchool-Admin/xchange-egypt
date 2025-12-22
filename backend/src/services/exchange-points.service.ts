import prisma from '../lib/prisma';

// ============================================
// Exchange Points Service
// خدمة نقاط التبادل الآمنة
// ============================================

export class ExchangePointsService {
  /**
   * Get all exchange points with filters
   */
  async getExchangePoints(filters?: {
    governorate?: string;
    city?: string;
    type?: string;
    latitude?: number;
    longitude?: number;
    radius?: number; // in km
  }) {
    const where: any = {
      status: 'ACTIVE',
    };

    if (filters?.governorate) {
      where.governorate = filters.governorate;
    }

    if (filters?.city) {
      where.city = filters.city;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    let points = await prisma.exchangePoint.findMany({
      where,
      include: {
        reviews: {
          take: 3,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { bookings: true, reviews: true },
        },
      },
      orderBy: [
        { totalExchanges: 'desc' },
        { avgRating: 'desc' },
      ],
    });

    // Filter by distance if coordinates provided
    if (filters?.latitude && filters?.longitude && filters?.radius) {
      points = points.filter(point => {
        const distance = this.calculateDistance(
          filters.latitude,
          filters.longitude,
          point.latitude,
          point.longitude
        );
        return distance <= filters.radius;
      });

      // Sort by distance
      points.sort((a, b) => {
        const distA = this.calculateDistance(filters.latitude, filters.longitude, a.latitude, a.longitude);
        const distB = this.calculateDistance(filters.latitude, filters.longitude, b.latitude, b.longitude);
        return distA - distB;
      });
    }

    return points;
  }

  /**
   * Get exchange point by ID
   */
  async getExchangePoint(id: string) {
    const point = await prisma.exchangePoint.findUnique({
      where: { id },
      include: {
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        bookings: {
          where: {
            scheduledDate: { gte: new Date() },
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
          orderBy: { scheduledDate: 'asc' },
          take: 20,
        },
      },
    });

    if (!point) {
      throw new Error('نقطة التبادل غير موجودة');
    }

    return point;
  }

  /**
   * Get nearby exchange points
   */
  async getNearbyPoints(latitude: number, longitude: number, radius = 10) {
    const points = await this.getExchangePoints({
      latitude,
      longitude,
      radius,
    });

    return points.map(point => ({
      ...point,
      distance: this.calculateDistance(latitude, longitude, point.latitude, point.longitude),
    }));
  }

  /**
   * Create booking
   */
  async createBooking(data: {
    pointId: string;
    user1Id: string;
    user2Id: string;
    transactionType: string;
    transactionId?: string;
    offerId?: string;
    scheduledDate: Date;
    scheduledTime: string;
    duration?: number;
  }) {
    // Verify point exists and is active
    const point = await prisma.exchangePoint.findFirst({
      where: { id: data.pointId, status: 'ACTIVE' },
    });

    if (!point) {
      throw new Error('نقطة التبادل غير متاحة');
    }

    // Check for time slot conflicts
    const existingBooking = await prisma.exchangeBooking.findFirst({
      where: {
        pointId: data.pointId,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
      },
    });

    if (existingBooking) {
      throw new Error('هذا الموعد محجوز بالفعل. يرجى اختيار موعد آخر');
    }

    // Create booking
    const booking = await prisma.exchangeBooking.create({
      data: {
        pointId: data.pointId,
        user1Id: data.user1Id,
        user2Id: data.user2Id,
        transactionType: data.transactionType,
        transactionId: data.transactionId,
        offerId: data.offerId,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        duration: data.duration || 30,
        confirmedByUser1: true, // Creator automatically confirms
      },
      include: {
        point: true,
      },
    });

    return booking;
  }

  /**
   * Get user's bookings
   */
  async getUserBookings(userId: string, status?: string) {
    const where: any = {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    };

    if (status) {
      where.status = status;
    }

    return prisma.exchangeBooking.findMany({
      where,
      include: {
        point: true,
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  /**
   * Confirm booking
   */
  async confirmBooking(bookingId: string, userId: string) {
    const booking = await prisma.exchangeBooking.findFirst({
      where: {
        id: bookingId,
        OR: [{ user1Id: userId }, { user2Id: userId }],
        status: 'PENDING',
      },
    });

    if (!booking) {
      throw new Error('الحجز غير موجود');
    }

    const isUser1 = booking.user1Id === userId;

    const updateData: any = {};
    if (isUser1) {
      updateData.confirmedByUser1 = true;
    } else {
      updateData.confirmedByUser2 = true;
    }

    // Check if both confirmed
    const otherConfirmed = isUser1 ? booking.confirmedByUser2 : booking.confirmedByUser1;
    if (otherConfirmed) {
      updateData.status = 'CONFIRMED';
    }

    return prisma.exchangeBooking.update({
      where: { id: bookingId },
      data: updateData,
      include: { point: true },
    });
  }

  /**
   * Check in to booking
   */
  async checkIn(bookingId: string, userId: string) {
    const booking = await prisma.exchangeBooking.findFirst({
      where: {
        id: bookingId,
        OR: [{ user1Id: userId }, { user2Id: userId }],
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
      },
    });

    if (!booking) {
      throw new Error('الحجز غير موجود أو غير مؤكد');
    }

    const isUser1 = booking.user1Id === userId;
    const now = new Date();

    const updateData: any = {
      status: 'IN_PROGRESS',
    };

    if (isUser1) {
      updateData.user1CheckedIn = now;
    } else {
      updateData.user2CheckedIn = now;
    }

    return prisma.exchangeBooking.update({
      where: { id: bookingId },
      data: updateData,
      include: { point: true },
    });
  }

  /**
   * Complete booking
   */
  async completeBooking(bookingId: string, userId: string, notes?: string) {
    const booking = await prisma.exchangeBooking.findFirst({
      where: {
        id: bookingId,
        OR: [{ user1Id: userId }, { user2Id: userId }],
        status: 'IN_PROGRESS',
      },
    });

    if (!booking) {
      throw new Error('الحجز غير موجود أو غير جاري');
    }

    // Update booking
    const updatedBooking = await prisma.exchangeBooking.update({
      where: { id: bookingId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        completionNotes: notes,
      },
      include: { point: true },
    });

    // Update exchange point stats
    await prisma.exchangePoint.update({
      where: { id: booking.pointId },
      data: {
        totalExchanges: { increment: 1 },
      },
    });

    return updatedBooking;
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string, userId: string, reason?: string) {
    const booking = await prisma.exchangeBooking.findFirst({
      where: {
        id: bookingId,
        OR: [{ user1Id: userId }, { user2Id: userId }],
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (!booking) {
      throw new Error('الحجز غير موجود أو لا يمكن إلغاؤه');
    }

    return prisma.exchangeBooking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: userId,
        cancelReason: reason,
      },
      include: { point: true },
    });
  }

  /**
   * Add review
   */
  async addReview(data: {
    pointId: string;
    userId: string;
    bookingId?: string;
    rating: number;
    safetyRating?: number;
    cleanlinessRating?: number;
    accessibilityRating?: number;
    comment?: string;
  }) {
    // Create review
    const review = await prisma.exchangePointReview.create({
      data: {
        pointId: data.pointId,
        userId: data.userId,
        bookingId: data.bookingId,
        rating: data.rating,
        safetyRating: data.safetyRating,
        cleanlinessRating: data.cleanlinessRating,
        accessibilityRating: data.accessibilityRating,
        comment: data.comment,
      },
    });

    // Update point rating
    const reviews = await prisma.exchangePointReview.findMany({
      where: { pointId: data.pointId },
      select: { rating: true },
    });

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.exchangePoint.update({
      where: { id: data.pointId },
      data: {
        avgRating,
        ratingCount: reviews.length,
      },
    });

    return review;
  }

  /**
   * Get available time slots
   */
  async getAvailableSlots(pointId: string, date: Date) {
    const point = await prisma.exchangePoint.findUnique({
      where: { id: pointId },
    });

    if (!point) {
      throw new Error('نقطة التبادل غير موجودة');
    }

    // Get existing bookings for the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedSlots = await prisma.exchangeBooking.findMany({
      where: {
        pointId,
        scheduledDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
      },
      select: { scheduledTime: true },
    });

    const bookedTimes = new Set(bookedSlots.map(b => b.scheduledTime));

    // Generate all possible slots
    const workingHours = point.workingHours;
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayHours = workingHours[dayOfWeek];

    if (!dayHours && !point.is24Hours) {
      return []; // Closed on this day
    }

    const slots: string[] = [];
    const openHour = point.is24Hours ? 0 : parseInt(dayHours?.open?.split(':')[0] || '9');
    const closeHour = point.is24Hours ? 24 : parseInt(dayHours?.close?.split(':')[0] || '22');

    for (let hour = openHour; hour < closeHour; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      if (!bookedTimes.has(time)) {
        slots.push(time);
      }
      const halfHour = `${hour.toString().padStart(2, '0')}:30`;
      if (!bookedTimes.has(halfHour)) {
        slots.push(halfHour);
      }
    }

    return slots;
  }

  /**
   * Get governorates with exchange points
   */
  async getGovernorates() {
    const governorates = await prisma.exchangePoint.groupBy({
      by: ['governorate'],
      where: { status: 'ACTIVE' },
      _count: true,
    });

    return governorates.map(g => ({
      name: g.governorate,
      count: g._count,
    }));
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const exchangePointsService = new ExchangePointsService();
