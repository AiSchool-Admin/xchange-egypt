/**
 * Auction Data Export Service
 * خدمة تصدير بيانات المزادات
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// صيغ التصدير المدعومة
export enum ExportFormat {
  CSV = 'csv',
  XLSX = 'xlsx',
  PDF = 'pdf',
  JSON = 'json',
}

// أنواع البيانات القابلة للتصدير
export enum ExportDataType {
  AUCTIONS = 'auctions',
  BIDS = 'bids',
  USERS = 'users',
  TRANSACTIONS = 'transactions',
  DEPOSITS = 'deposits',
  DISPUTES = 'disputes',
  REVIEWS = 'reviews',
  WATCHLIST = 'watchlist',
}

// خيارات التصدير
interface ExportOptions {
  dataType: ExportDataType;
  format: ExportFormat;
  filters?: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
    category?: string;
    userId?: string;
    auctionId?: string;
  };
  columns?: string[];
  limit?: number;
  includeHeaders?: boolean;
}

// نتيجة التصدير
interface ExportResult {
  success: boolean;
  filename?: string;
  data?: string | Buffer;
  mimeType?: string;
  rowCount?: number;
  error?: string;
}

export class AuctionExportService {
  /**
   * تصدير البيانات
   */
  async exportData(options: ExportOptions): Promise<ExportResult> {
    try {
      const { dataType, format, filters } = options;

      // جلب البيانات
      let data: any[];
      switch (dataType) {
        case ExportDataType.AUCTIONS:
          data = await this.fetchAuctions(filters);
          break;
        case ExportDataType.BIDS:
          data = await this.fetchBids(filters);
          break;
        case ExportDataType.USERS:
          data = await this.fetchUsers(filters);
          break;
        case ExportDataType.TRANSACTIONS:
          data = await this.fetchTransactions(filters);
          break;
        case ExportDataType.DEPOSITS:
          data = await this.fetchDeposits(filters);
          break;
        case ExportDataType.DISPUTES:
          data = await this.fetchDisputes(filters);
          break;
        case ExportDataType.REVIEWS:
          data = await this.fetchReviews(filters);
          break;
        case ExportDataType.WATCHLIST:
          data = await this.fetchWatchlist(filters);
          break;
        default:
          return { success: false, error: 'نوع بيانات غير مدعوم' };
      }

      if (options.limit) {
        data = data.slice(0, options.limit);
      }

      // تحويل البيانات للصيغة المطلوبة
      let exportedData: string | Buffer;
      let mimeType: string;
      let extension: string;

      switch (format) {
        case ExportFormat.CSV:
          exportedData = this.convertToCSV(data, options.columns, options.includeHeaders !== false);
          mimeType = 'text/csv';
          extension = 'csv';
          break;
        case ExportFormat.JSON:
          exportedData = JSON.stringify(data, null, 2);
          mimeType = 'application/json';
          extension = 'json';
          break;
        case ExportFormat.XLSX:
          exportedData = await this.convertToXLSX(data, options.columns);
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          extension = 'xlsx';
          break;
        case ExportFormat.PDF:
          exportedData = await this.convertToPDF(data, dataType);
          mimeType = 'application/pdf';
          extension = 'pdf';
          break;
        default:
          return { success: false, error: 'صيغة تصدير غير مدعومة' };
      }

      const filename = `${dataType}_export_${Date.now()}.${extension}`;

      return {
        success: true,
        filename,
        data: exportedData,
        mimeType,
        rowCount: data.length,
      };

    } catch (error: any) {
      console.error('Export error:', error);
      return { success: false, error: error.message || 'حدث خطأ في عملية التصدير' };
    }
  }

  /**
   * جلب بيانات المزادات
   */
  private async fetchAuctions(filters?: ExportOptions['filters']): Promise<any[]> {
    const whereClause: any = {};

    if (filters?.startDate) {
      whereClause.createdAt = { ...whereClause.createdAt, gte: filters.startDate };
    }
    if (filters?.endDate) {
      whereClause.createdAt = { ...whereClause.createdAt, lte: filters.endDate };
    }
    if (filters?.status) {
      whereClause.status = filters.status;
    }
    if (filters?.category) {
      whereClause.auctionCategory = filters.category;
    }

    const auctions = await prisma.auction.findMany({
      where: whereClause,
      include: {
        listing: {
          include: {
            item: true,
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
        _count: { select: { bids: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return auctions.map(auction => ({
      'معرف المزاد': auction.id,
      'عنوان المنتج': auction.listing?.item?.title || '',
      'الوصف': auction.listing?.item?.description || '',
      'نوع المزاد': this.translateAuctionType(auction.auctionType),
      'الفئة': this.translateCategory(auction.auctionCategory),
      'السعر الابتدائي': auction.startingPrice,
      'السعر الحالي': auction.currentPrice,
      'الحد الأدنى للزيادة': auction.minBidIncrement,
      'السعر الفوري': auction.buyNowPrice || '-',
      'الحالة': this.translateStatus(auction.status),
      'البائع': auction.listing?.user?.fullName || '',
      'البريد الإلكتروني للبائع': auction.listing?.user?.email || '',
      'الفائز': auction.winnerId || '-',
      'عدد المزايدات': auction._count.bids,
      'عدد المتابعين': auction.watchlistCount,
      'تاريخ البداية': auction.startTime?.toISOString() || '',
      'تاريخ النهاية': auction.endTime?.toISOString() || '',
      'تاريخ الإنشاء': auction.createdAt.toISOString(),
    }));
  }

  /**
   * جلب بيانات المزايدات
   */
  private async fetchBids(filters?: ExportOptions['filters']): Promise<any[]> {
    const whereClause: any = {};

    if (filters?.startDate) {
      whereClause.createdAt = { ...whereClause.createdAt, gte: filters.startDate };
    }
    if (filters?.endDate) {
      whereClause.createdAt = { ...whereClause.createdAt, lte: filters.endDate };
    }
    if (filters?.auctionId) {
      whereClause.auctionId = filters.auctionId;
    }
    if (filters?.userId) {
      whereClause.bidderId = filters.userId;
    }

    const bids = await prisma.auctionBid.findMany({
      where: whereClause,
      include: {
        auction: {
          include: {
            listing: { include: { item: true } },
          },
        },
        bidder: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bids.map(bid => ({
      'معرف المزايدة': bid.id,
      'معرف المزاد': bid.auctionId,
      'عنوان المزاد': bid.auction?.listing?.item?.title || '',
      'المزايد': bid.bidder?.fullName || '',
      'البريد الإلكتروني': bid.bidder?.email || '',
      'مبلغ المزايدة': bid.bidAmount,
      'حالة المزايدة': bid.status,
      'مزايدة تلقائية': bid.isAutoBid ? 'نعم' : 'لا',
      'الحد الأقصى للمزايدة': bid.maxAutoBid || '-',
      'تاريخ المزايدة': bid.createdAt.toISOString(),
    }));
  }

  /**
   * جلب بيانات المستخدمين
   */
  private async fetchUsers(filters?: ExportOptions['filters']): Promise<any[]> {
    const whereClause: any = {};

    if (filters?.startDate) {
      whereClause.createdAt = { ...whereClause.createdAt, gte: filters.startDate };
    }
    if (filters?.endDate) {
      whereClause.createdAt = { ...whereClause.createdAt, lte: filters.endDate };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        governorate: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            auctionBids: true,
            auctionWatchlist: true,
            listings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map(user => ({
      'معرف المستخدم': user.id,
      'الاسم': user.fullName,
      'البريد الإلكتروني': user.email,
      'رقم الهاتف': user.phone || '-',
      'المحافظة': user.governorate || '-',
      'موثق': user.emailVerified ? 'نعم' : 'لا',
      'عدد المزايدات': user._count.auctionBids,
      'عدد الإعلانات': user._count.listings,
      'قائمة المتابعة': user._count.auctionWatchlist,
      'تاريخ التسجيل': user.createdAt.toISOString(),
    }));
  }

  /**
   * جلب بيانات المعاملات المالية
   */
  private async fetchTransactions(filters?: ExportOptions['filters']): Promise<any[]> {
    const whereClause: any = {};

    if (filters?.startDate) {
      whereClause.createdAt = { ...whereClause.createdAt, gte: filters.startDate };
    }
    if (filters?.endDate) {
      whereClause.createdAt = { ...whereClause.createdAt, lte: filters.endDate };
    }

    // جلب الإيداعات المدفوعة كمعاملات
    const deposits = await prisma.auctionDeposit.findMany({
      where: {
        ...whereClause,
        status: 'PAID',
      },
      include: {
        user: { select: { fullName: true, email: true } },
        auction: {
          include: { listing: { include: { item: true } } },
        },
      },
      orderBy: { paidAt: 'desc' },
    });

    return deposits.map(deposit => ({
      'معرف المعاملة': deposit.paymentReference || deposit.id,
      'النوع': 'إيداع',
      'المبلغ': deposit.amount,
      'المستخدم': deposit.user?.fullName || '',
      'البريد الإلكتروني': deposit.user?.email || '',
      'المزاد': deposit.auction?.listing?.item?.title || '',
      'طريقة الدفع': deposit.paymentMethod || '-',
      'الحالة': this.translateDepositStatus(deposit.status),
      'تاريخ الدفع': deposit.paidAt?.toISOString() || '-',
    }));
  }

  /**
   * جلب بيانات الإيداعات
   */
  private async fetchDeposits(filters?: ExportOptions['filters']): Promise<any[]> {
    const whereClause: any = {};

    if (filters?.startDate) {
      whereClause.createdAt = { ...whereClause.createdAt, gte: filters.startDate };
    }
    if (filters?.endDate) {
      whereClause.createdAt = { ...whereClause.createdAt, lte: filters.endDate };
    }
    if (filters?.status) {
      whereClause.status = filters.status;
    }
    if (filters?.auctionId) {
      whereClause.auctionId = filters.auctionId;
    }

    const deposits = await prisma.auctionDeposit.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        auction: {
          include: { listing: { include: { item: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return deposits.map(deposit => ({
      'معرف الإيداع': deposit.id,
      'معرف المزاد': deposit.auctionId,
      'عنوان المزاد': deposit.auction?.listing?.item?.title || '',
      'المستخدم': deposit.user?.fullName || '',
      'البريد الإلكتروني': deposit.user?.email || '',
      'المبلغ': deposit.amount,
      'الحالة': this.translateDepositStatus(deposit.status),
      'طريقة الدفع': deposit.paymentMethod || '-',
      'مرجع الدفع': deposit.paymentReference || '-',
      'تاريخ الدفع': deposit.paidAt?.toISOString() || '-',
      'تاريخ الاسترداد': deposit.refundedAt?.toISOString() || '-',
      'سبب الاسترداد': deposit.refundReason || '-',
      'تاريخ الإنشاء': deposit.createdAt.toISOString(),
    }));
  }

  /**
   * جلب بيانات النزاعات
   */
  private async fetchDisputes(filters?: ExportOptions['filters']): Promise<any[]> {
    const whereClause: any = {};

    if (filters?.startDate) {
      whereClause.createdAt = { ...whereClause.createdAt, gte: filters.startDate };
    }
    if (filters?.endDate) {
      whereClause.createdAt = { ...whereClause.createdAt, lte: filters.endDate };
    }
    if (filters?.status) {
      whereClause.status = filters.status;
    }

    const disputes = await prisma.auctionDispute.findMany({
      where: whereClause,
      include: {
        auction: {
          include: { listing: { include: { item: true } } },
        },
        initiator: { select: { fullName: true, email: true } },
        respondent: { select: { fullName: true, email: true } },
        resolvedBy: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return disputes.map(dispute => ({
      'معرف النزاع': dispute.id,
      'معرف المزاد': dispute.auctionId,
      'عنوان المزاد': dispute.auction?.listing?.item?.title || '',
      'المُشتكي': dispute.initiator?.fullName || '',
      'المُشتكى عليه': dispute.respondent?.fullName || '',
      'السبب': dispute.reason || '',
      'الوصف': dispute.description || '',
      'الحالة': this.translateDisputeStatus(dispute.status),
      'القرار': dispute.resolution || '-',
      'المسؤول': dispute.resolvedBy?.fullName || '-',
      'تاريخ الإنشاء': dispute.createdAt.toISOString(),
      'تاريخ الحل': dispute.resolvedAt?.toISOString() || '-',
    }));
  }

  /**
   * جلب بيانات التقييمات
   */
  private async fetchReviews(filters?: ExportOptions['filters']): Promise<any[]> {
    const whereClause: any = {};

    if (filters?.startDate) {
      whereClause.createdAt = { ...whereClause.createdAt, gte: filters.startDate };
    }
    if (filters?.endDate) {
      whereClause.createdAt = { ...whereClause.createdAt, lte: filters.endDate };
    }
    if (filters?.auctionId) {
      whereClause.auctionId = filters.auctionId;
    }

    const reviews = await prisma.auctionReview.findMany({
      where: whereClause,
      include: {
        auction: {
          include: { listing: { include: { item: true } } },
        },
        reviewer: { select: { fullName: true } },
        reviewee: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map(review => ({
      'معرف التقييم': review.id,
      'معرف المزاد': review.auctionId,
      'عنوان المزاد': review.auction?.listing?.item?.title || '',
      'المُقيِّم': review.reviewer?.fullName || '',
      'المُقيَّم': review.reviewee?.fullName || '',
      'التقييم': review.overallRating,
      'التعليق': review.comment || '-',
      'تاريخ التقييم': review.createdAt.toISOString(),
    }));
  }

  /**
   * جلب بيانات قائمة المتابعة
   */
  private async fetchWatchlist(filters?: ExportOptions['filters']): Promise<any[]> {
    const whereClause: any = {};

    if (filters?.userId) {
      whereClause.userId = filters.userId;
    }

    const watchlist = await prisma.auctionWatchlist.findMany({
      where: whereClause,
      include: {
        auction: {
          include: {
            listing: { include: { item: true } },
          },
        },
        user: { select: { fullName: true, email: true } },
      },
      orderBy: { addedAt: 'desc' },
    });

    return watchlist.map(item => ({
      'معرف المتابعة': item.id,
      'المستخدم': item.user?.fullName || '',
      'البريد الإلكتروني': item.user?.email || '',
      'معرف المزاد': item.auctionId,
      'عنوان المزاد': item.auction?.listing?.item?.title || '',
      'السعر الحالي': item.auction?.currentPrice || 0,
      'حالة المزاد': this.translateStatus(item.auction?.status || ''),
      'تاريخ المتابعة': item.addedAt.toISOString(),
    }));
  }

  /**
   * تحويل البيانات إلى CSV
   */
  private convertToCSV(data: any[], columns?: string[], includeHeaders: boolean = true): string {
    if (data.length === 0) return '';

    const keys = columns || Object.keys(data[0]);
    const rows: string[] = [];

    if (includeHeaders) {
      rows.push(keys.join(','));
    }

    for (const item of data) {
      const values = keys.map(key => {
        const value = item[key];
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        // إضافة علامات الاقتباس إذا كانت القيمة تحتوي على فاصلة أو سطر جديد
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      rows.push(values.join(','));
    }

    // إضافة BOM لدعم الأحرف العربية في Excel
    return '\uFEFF' + rows.join('\n');
  }

  /**
   * تحويل البيانات إلى Excel
   */
  private async convertToXLSX(data: any[], columns?: string[]): Promise<Buffer> {
    // في الإنتاج، استخدم مكتبة مثل exceljs أو xlsx
    // هنا نحن نعيد CSV كـ buffer كحل مؤقت
    const csvData = this.convertToCSV(data, columns);
    return Buffer.from(csvData, 'utf-8');
  }

  /**
   * تحويل البيانات إلى PDF
   */
  private async convertToPDF(data: any[], dataType: ExportDataType): Promise<Buffer> {
    // في الإنتاج، استخدم مكتبة مثل pdfkit أو puppeteer
    // هنا نعيد نص بسيط كحل مؤقت
    const title = this.getExportTitle(dataType);
    const content = `
${title}
${'='.repeat(50)}
تاريخ التصدير: ${new Date().toLocaleString('ar-EG')}
عدد السجلات: ${data.length}
${'='.repeat(50)}

${JSON.stringify(data, null, 2)}
    `;
    return Buffer.from(content, 'utf-8');
  }

  // ============ وظائف الترجمة ============

  private translateAuctionType(type: string | null): string {
    const types: Record<string, string> = {
      ENGLISH: 'مزاد إنجليزي (تصاعدي)',
      SEALED_BID: 'مزاد مغلق',
      DUTCH: 'مزاد هولندي (تنازلي)',
    };
    return types[type || ''] || type || '-';
  }

  private translateCategory(category: string | null): string {
    const categories: Record<string, string> = {
      GENERAL: 'عام',
      CARS: 'سيارات',
      PROPERTIES: 'عقارات',
      ELECTRONICS: 'إلكترونيات',
      ANTIQUES: 'تحف',
      ART: 'فنون',
      JEWELRY: 'مجوهرات',
      COLLECTIBLES: 'مقتنيات',
      INDUSTRIAL: 'صناعي',
    };
    return categories[category || ''] || category || '-';
  }

  private translateStatus(status: string): string {
    const statuses: Record<string, string> = {
      DRAFT: 'مسودة',
      SCHEDULED: 'مجدول',
      ACTIVE: 'نشط',
      ENDED: 'منتهي',
      COMPLETED: 'مكتمل',
      CANCELLED: 'ملغي',
    };
    return statuses[status] || status;
  }

  private translateDepositStatus(status: string): string {
    const statuses: Record<string, string> = {
      PENDING: 'قيد الانتظار',
      PAID: 'مدفوع',
      HELD: 'محتجز',
      REFUNDED: 'مسترد',
      FORFEITED: 'مصادر',
      APPLIED: 'مطبق',
    };
    return statuses[status] || status;
  }

  private translateDisputeStatus(status: string): string {
    const statuses: Record<string, string> = {
      OPEN: 'مفتوح',
      UNDER_REVIEW: 'قيد المراجعة',
      EVIDENCE_REQUESTED: 'طلب أدلة',
      ESCALATED: 'تصعيد',
      RESOLVED_BUYER: 'حل لصالح المشتري',
      RESOLVED_SELLER: 'حل لصالح البائع',
      CLOSED: 'مغلق',
    };
    return statuses[status] || status;
  }

  private getExportTitle(dataType: ExportDataType): string {
    const titles: Record<string, string> = {
      auctions: 'تقرير المزادات',
      bids: 'تقرير المزايدات',
      users: 'تقرير المستخدمين',
      transactions: 'تقرير المعاملات',
      deposits: 'تقرير الإيداعات',
      disputes: 'تقرير النزاعات',
      reviews: 'تقرير التقييمات',
      watchlist: 'تقرير قائمة المتابعة',
    };
    return titles[dataType] || 'تقرير البيانات';
  }

  /**
   * الحصول على صيغ التصدير المتاحة
   */
  getAvailableFormats(): { format: ExportFormat; label: string; icon: string }[] {
    return [
      { format: ExportFormat.CSV, label: 'CSV (Excel)', icon: '📊' },
      { format: ExportFormat.XLSX, label: 'Excel (XLSX)', icon: '📗' },
      { format: ExportFormat.JSON, label: 'JSON', icon: '📄' },
      { format: ExportFormat.PDF, label: 'PDF', icon: '📕' },
    ];
  }

  /**
   * الحصول على أنواع البيانات القابلة للتصدير
   */
  getExportableDataTypes(): { type: ExportDataType; label: string; description: string }[] {
    return [
      { type: ExportDataType.AUCTIONS, label: 'المزادات', description: 'جميع بيانات المزادات' },
      { type: ExportDataType.BIDS, label: 'المزايدات', description: 'سجل المزايدات' },
      { type: ExportDataType.USERS, label: 'المستخدمين', description: 'بيانات المستخدمين' },
      { type: ExportDataType.TRANSACTIONS, label: 'المعاملات', description: 'المعاملات المالية' },
      { type: ExportDataType.DEPOSITS, label: 'الإيداعات', description: 'إيداعات المزادات' },
      { type: ExportDataType.DISPUTES, label: 'النزاعات', description: 'النزاعات والشكاوى' },
      { type: ExportDataType.REVIEWS, label: 'التقييمات', description: 'تقييمات المستخدمين' },
      { type: ExportDataType.WATCHLIST, label: 'المتابعة', description: 'قوائم المتابعة' },
    ];
  }
}

export const auctionExportService = new AuctionExportService();
