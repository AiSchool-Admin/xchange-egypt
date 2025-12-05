/**
 * Product Authenticity Service
 * خدمة أصالة المنتجات
 *
 * Anti-counterfeit protection:
 * - Serial number verification
 * - Expert review
 * - AI-based analysis
 * - Authenticity certificates
 */

import prisma from '../config/database';
import { AuthenticityStatus } from '@prisma/client';
import crypto from 'crypto';

// ============================================
// Types
// ============================================

interface VerificationRequest {
  itemId: string;
  sellerId: string;
  requestedBy: string;
  method: 'SERIAL_CHECK' | 'EXPERT_REVIEW' | 'DOCUMENT_VERIFY' | 'AI_ANALYSIS';
  serialNumber?: string;
  purchaseReceipt?: string;
  originalBox?: boolean;
  warrantyCard?: boolean;
  evidenceUrls?: string[];
}

interface VerificationResult {
  status: AuthenticityStatus;
  confidenceScore: number;
  notes: string;
  certificateId?: string;
}

interface AuthenticityReport {
  itemId: string;
  reporterId: string;
  reportType: 'COUNTERFEIT' | 'MISREPRESENTED' | 'SUSPICIOUS';
  description: string;
  evidenceUrls: string[];
}

interface CertificateData {
  id: string;
  itemId: string;
  itemTitle: string;
  sellerName: string;
  status: AuthenticityStatus;
  method: string;
  verifiedAt: Date;
  confidenceScore: number;
  qrCode: string;
  certificateUrl: string;
}

// ============================================
// Verification Requests
// ============================================

/**
 * Request product verification
 */
export async function requestVerification(request: VerificationRequest) {
  const {
    itemId,
    sellerId,
    requestedBy,
    method,
    serialNumber,
    purchaseReceipt,
    originalBox = false,
    warrantyCard = false,
    evidenceUrls = [],
  } = request;

  // Check if already verified
  const existing = await prisma.productAuthenticity.findUnique({
    where: { itemId },
  });

  if (existing && existing.status === 'VERIFIED') {
    return {
      success: false,
      message: 'Product is already verified',
      messageAr: 'المنتج موثق بالفعل',
      existingVerification: existing,
    };
  }

  // Create or update verification request
  const verification = await prisma.productAuthenticity.upsert({
    where: { itemId },
    update: {
      method,
      serialNumber,
      purchaseReceipt,
      originalBox,
      warrantyCard,
      evidenceUrls,
      status: 'PENDING',
    },
    create: {
      itemId,
      sellerId,
      requestedBy,
      method,
      serialNumber,
      purchaseReceipt,
      originalBox,
      warrantyCard,
      evidenceUrls,
      status: 'PENDING',
    },
  });

  // For serial check, attempt auto-verification
  if (method === 'SERIAL_CHECK' && serialNumber) {
    const autoResult = await attemptAutoVerification(verification.id, serialNumber);
    if (autoResult) {
      return {
        success: true,
        message: 'Product verified automatically',
        messageAr: 'تم التحقق من المنتج تلقائياً',
        verification: autoResult,
      };
    }
  }

  // For AI analysis, run analysis
  if (method === 'AI_ANALYSIS' && evidenceUrls.length > 0) {
    const aiResult = await runAIAnalysis(verification.id, evidenceUrls);
    return {
      success: true,
      message: 'AI analysis completed',
      messageAr: 'تم تحليل الذكاء الاصطناعي',
      verification: aiResult,
    };
  }

  return {
    success: true,
    message: 'Verification request submitted for review',
    messageAr: 'تم تقديم طلب التحقق للمراجعة',
    verification,
  };
}

/**
 * Attempt automatic serial number verification
 */
async function attemptAutoVerification(
  verificationId: string,
  serialNumber: string
) {
  // TODO: Integrate with manufacturer APIs for serial verification
  // This is a placeholder implementation

  // Simulate checking against known databases
  const isValid = validateSerialFormat(serialNumber);

  if (!isValid) {
    await prisma.productAuthenticity.update({
      where: { id: verificationId },
      data: {
        status: 'INCONCLUSIVE',
        verifierNotes: 'Serial number format not recognized',
        confidenceScore: 30,
      },
    });
    return null;
  }

  // If format is valid, mark as pending expert review
  return prisma.productAuthenticity.update({
    where: { id: verificationId },
    data: {
      verifierNotes: 'Serial format valid, pending expert review',
      confidenceScore: 50,
    },
  });
}

/**
 * Validate serial number format
 */
function validateSerialFormat(serialNumber: string): boolean {
  // Common serial number patterns
  const patterns = [
    /^[A-Z0-9]{10,20}$/, // Standard alphanumeric
    /^[0-9]{12,15}$/, // Numeric only (IMEI)
    /^[A-Z]{2}[0-9]{6,10}[A-Z0-9]*$/, // Mixed format
  ];

  return patterns.some(pattern => pattern.test(serialNumber.toUpperCase()));
}

/**
 * Run AI-based image analysis
 */
async function runAIAnalysis(
  verificationId: string,
  imageUrls: string[]
) {
  // TODO: Integrate with image analysis AI
  // This is a placeholder implementation

  // Simulate AI analysis
  const confidenceScore = 60 + Math.random() * 30; // 60-90%
  const isLikelyAuthentic = confidenceScore > 70;

  return prisma.productAuthenticity.update({
    where: { id: verificationId },
    data: {
      status: isLikelyAuthentic ? 'PENDING' : 'SUSPICIOUS',
      confidenceScore,
      verifierNotes: isLikelyAuthentic
        ? 'AI analysis suggests authentic product, pending expert confirmation'
        : 'AI analysis detected potential inconsistencies',
      verifiedBy: 'SYSTEM',
    },
  });
}

// ============================================
// Expert Review
// ============================================

/**
 * Get pending verifications for expert review
 */
export async function getPendingVerifications(options?: {
  limit?: number;
  offset?: number;
  method?: string;
}) {
  const { limit = 20, offset = 0, method } = options || {};

  return prisma.productAuthenticity.findMany({
    where: {
      status: 'PENDING',
      ...(method && { method }),
    },
    orderBy: { requestedAt: 'asc' },
    take: limit,
    skip: offset,
  });
}

/**
 * Submit expert verification result
 */
export async function submitExpertVerification(
  verificationId: string,
  expertId: string,
  result: VerificationResult
) {
  const verification = await prisma.productAuthenticity.findUnique({
    where: { id: verificationId },
  });

  if (!verification) {
    throw new Error('Verification not found');
  }

  // Generate certificate if verified
  let certificateId: string | undefined;
  let certificateUrl: string | undefined;
  let qrCode: string | undefined;

  if (result.status === 'VERIFIED') {
    certificateId = generateCertificateId();
    certificateUrl = `/certificates/${certificateId}`;
    qrCode = `https://xchange.eg/verify/${certificateId}`;
  }

  return prisma.productAuthenticity.update({
    where: { id: verificationId },
    data: {
      status: result.status,
      confidenceScore: result.confidenceScore,
      verifiedAt: new Date(),
      verifiedBy: expertId,
      verifierNotes: result.notes,
      certificateId,
      certificateUrl,
      qrCode,
    },
  });
}

/**
 * Generate unique certificate ID
 */
function generateCertificateId(): string {
  const prefix = 'XC';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// ============================================
// Verification Lookup
// ============================================

/**
 * Get product authenticity status
 */
export async function getProductAuthenticity(itemId: string) {
  const authenticity = await prisma.productAuthenticity.findUnique({
    where: { itemId },
  });

  if (!authenticity) {
    return {
      isVerified: false,
      status: null,
      message: 'Product has not been verified',
      messageAr: 'المنتج غير موثق',
    };
  }

  return {
    isVerified: authenticity.status === 'VERIFIED',
    status: authenticity.status,
    confidenceScore: authenticity.confidenceScore,
    verifiedAt: authenticity.verifiedAt,
    certificateId: authenticity.certificateId,
    qrCode: authenticity.qrCode,
    showBadge: authenticity.showBadge,
  };
}

/**
 * Verify certificate by ID
 */
export async function verifyCertificate(certificateId: string): Promise<CertificateData | null> {
  const authenticity = await prisma.productAuthenticity.findUnique({
    where: { certificateId },
  });

  if (!authenticity || authenticity.status !== 'VERIFIED') {
    return null;
  }

  // Get item and seller details
  const item = await prisma.item.findUnique({
    where: { id: authenticity.itemId },
    include: {
      seller: {
        select: { fullName: true },
      },
    },
  });

  if (!item) return null;

  return {
    id: authenticity.certificateId!,
    itemId: authenticity.itemId,
    itemTitle: item.title,
    sellerName: item.seller.fullName,
    status: authenticity.status,
    method: authenticity.method,
    verifiedAt: authenticity.verifiedAt!,
    confidenceScore: authenticity.confidenceScore || 0,
    qrCode: authenticity.qrCode!,
    certificateUrl: authenticity.certificateUrl!,
  };
}

/**
 * Get seller's verified products
 */
export async function getSellerVerifiedProducts(sellerId: string) {
  return prisma.productAuthenticity.findMany({
    where: {
      sellerId,
      status: 'VERIFIED',
    },
    orderBy: { verifiedAt: 'desc' },
  });
}

// ============================================
// Reporting
// ============================================

/**
 * Report a potentially counterfeit product
 */
export async function reportProduct(report: AuthenticityReport) {
  const { itemId, reporterId, reportType, description, evidenceUrls } = report;

  // Check if already reported by this user
  const existing = await prisma.authenticityReport.findFirst({
    where: {
      itemId,
      reporterId,
      status: 'PENDING',
    },
  });

  if (existing) {
    throw new Error('You have already reported this product');
  }

  const created = await prisma.authenticityReport.create({
    data: {
      itemId,
      reporterId,
      reportType,
      description,
      evidenceUrls,
      status: 'PENDING',
    },
  });

  // If multiple reports, flag for review
  const reportCount = await prisma.authenticityReport.count({
    where: { itemId },
  });

  if (reportCount >= 3) {
    // Update product authenticity status
    await prisma.productAuthenticity.upsert({
      where: { itemId },
      update: { status: 'SUSPICIOUS' },
      create: {
        itemId,
        sellerId: '', // Will be filled by system
        requestedBy: 'SYSTEM',
        method: 'DOCUMENT_VERIFY',
        status: 'SUSPICIOUS',
        verifierNotes: `Flagged due to ${reportCount} user reports`,
      },
    });
  }

  return created;
}

/**
 * Get reports for an item
 */
export async function getItemReports(itemId: string) {
  return prisma.authenticityReport.findMany({
    where: { itemId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Resolve a report
 */
export async function resolveReport(
  reportId: string,
  resolverId: string,
  resolution: string,
  dismiss: boolean = false
) {
  return prisma.authenticityReport.update({
    where: { id: reportId },
    data: {
      status: dismiss ? 'DISMISSED' : 'RESOLVED',
      resolution,
      resolvedAt: new Date(),
      resolvedBy: resolverId,
    },
  });
}

// ============================================
// Statistics
// ============================================

/**
 * Get authenticity statistics
 */
export async function getStats() {
  const [
    totalVerifications,
    verifiedCount,
    suspiciousCount,
    counterfeitCount,
    totalReports,
    pendingReports,
  ] = await Promise.all([
    prisma.productAuthenticity.count(),
    prisma.productAuthenticity.count({ where: { status: 'VERIFIED' } }),
    prisma.productAuthenticity.count({ where: { status: 'SUSPICIOUS' } }),
    prisma.productAuthenticity.count({ where: { status: 'COUNTERFEIT' } }),
    prisma.authenticityReport.count(),
    prisma.authenticityReport.count({ where: { status: 'PENDING' } }),
  ]);

  return {
    totalVerifications,
    verifiedCount,
    suspiciousCount,
    counterfeitCount,
    verificationRate: totalVerifications > 0
      ? (verifiedCount / totalVerifications) * 100
      : 0,
    counterfeitRate: totalVerifications > 0
      ? (counterfeitCount / totalVerifications) * 100
      : 0,
    totalReports,
    pendingReports,
  };
}

/**
 * Get category-wise authenticity stats
 */
export async function getCategoryStats() {
  // This would need a join with items table
  // Simplified implementation
  return prisma.productAuthenticity.groupBy({
    by: ['status'],
    _count: true,
  });
}

// ============================================
// Badge Display
// ============================================

/**
 * Toggle authenticity badge visibility
 */
export async function toggleBadgeVisibility(
  itemId: string,
  sellerId: string,
  show: boolean
) {
  const authenticity = await prisma.productAuthenticity.findUnique({
    where: { itemId },
  });

  if (!authenticity) {
    throw new Error('No authenticity record found');
  }

  if (authenticity.sellerId !== sellerId) {
    throw new Error('Unauthorized');
  }

  return prisma.productAuthenticity.update({
    where: { itemId },
    data: { showBadge: show },
  });
}
