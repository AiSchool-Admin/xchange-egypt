/**
 * Visual Authenticity AI Service (Simplified)
 * خدمة الذكاء الاصطناعي للتحقق البصري من الأصالة - نسخة مبسطة
 */

import prisma from '../lib/prisma';

// ============================================
// Types
// ============================================

interface AuthenticityReport {
  overallScore: number;
  verdict: 'AUTHENTIC' | 'SUSPICIOUS' | 'LIKELY_FAKE' | 'INCONCLUSIVE';
  confidence: number;
  qualityScore: number;
  riskFactors: RiskFactor[];
  recommendations: AuthenticityRecommendation[];
  brandAnalysis?: BrandAnalysis;
}

interface RiskFactor {
  type: 'HIGH' | 'MEDIUM' | 'LOW';
  factor: string;
  factorAr: string;
  description: string;
  descriptionAr: string;
}

interface AuthenticityRecommendation {
  priority: string;
  action: string;
  actionAr: string;
  reason: string;
  reasonAr: string;
}

interface BrandAnalysis {
  detectedBrand?: string;
  logoAuthenticity: number;
  labelConsistency: number;
  packagingScore: number;
  serialNumberFormat: 'VALID' | 'INVALID' | 'NOT_FOUND';
}

// Known brands for detection
const KNOWN_BRANDS = [
  'Apple', 'Samsung', 'iPhone', 'Rolex', 'Omega', 'Cartier',
  'Louis Vuitton', 'Gucci', 'Prada', 'Chanel', 'Nike', 'Adidas',
  'Sony', 'LG', 'Huawei', 'Xiaomi', 'BMW', 'Mercedes', 'Toyota',
];

// ============================================
// Main Functions
// ============================================

/**
 * Analyze item authenticity
 */
export async function analyzeAuthenticity(
  itemId: string,
  imageUrls?: string[],
  categoryType?: string
): Promise<AuthenticityReport> {
  // Get item details
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: {
      id: true,
      title: true,
      description: true,
      images: true, // This is String[]
      estimatedValue: true,
      condition: true,
      category: {
        select: {
          nameAr: true,
          nameEn: true,
          parent: {
            select: {
              nameAr: true,
              nameEn: true,
            },
          },
        },
      },
    },
  });

  if (!item) {
    throw new Error('Item not found');
  }

  // Use provided images or item's images (images is already String[])
  const allImages = imageUrls && imageUrls.length > 0 ? imageUrls : item.images;

  // Perform quality analysis
  const qualityScore = analyzeImageQuality(allImages);

  // Detect manipulation
  const manipulationScore = detectManipulation(allImages);

  // Check for stock images
  const stockImageScore = checkStockImage(allImages);

  // Brand analysis
  const brandAnalysis = analyzeBrand(item.title);

  // Calculate overall score
  const overallScore = Math.round(
    qualityScore * 0.3 +
    manipulationScore * 0.4 +
    stockImageScore * 0.3
  );

  // Determine verdict
  const verdict = determineVerdict(overallScore);

  // Identify risk factors
  const riskFactors = identifyRiskFactors(qualityScore, manipulationScore, stockImageScore);

  // Generate recommendations
  const recommendations = generateRecommendations(verdict, riskFactors);

  return {
    overallScore,
    verdict,
    confidence: Math.min(85 + Math.floor(allImages.length * 3), 95),
    qualityScore,
    riskFactors,
    recommendations,
    brandAnalysis,
  };
}

/**
 * Quick authenticity check (lightweight)
 */
export async function quickAuthenticityCheck(
  imageUrl: string
): Promise<{
  score: number;
  verdict: 'PASS' | 'REVIEW' | 'FAIL';
  issues: string[];
}> {
  const issues: string[] = [];
  let score = 100;

  // Check image quality
  const qualityScore = analyzeImageQuality([imageUrl]);
  if (qualityScore < 50) {
    issues.push('Low image quality');
    score -= 20;
  }

  // Check for manipulation
  const manipulationScore = detectManipulation([imageUrl]);
  if (manipulationScore < 60) {
    issues.push('Possible image manipulation detected');
    score -= 30;
  }

  // Check for stock images
  const stockScore = checkStockImage([imageUrl]);
  if (stockScore < 50) {
    issues.push('Appears to be a stock photo');
    score -= 40;
  }

  // Determine verdict
  let verdict: 'PASS' | 'REVIEW' | 'FAIL';
  if (score >= 80) {
    verdict = 'PASS';
  } else if (score >= 50) {
    verdict = 'REVIEW';
  } else {
    verdict = 'FAIL';
  }

  return { score: Math.max(0, score), verdict, issues };
}

/**
 * Get authenticity report for an item
 */
export async function getAuthenticityReport(
  itemId: string
): Promise<AuthenticityReport> {
  return analyzeAuthenticity(itemId);
}

/**
 * Verify brand authenticity
 */
export async function verifyBrand(
  itemId?: string,
  imageUrls?: string[],
  brandName?: string
): Promise<{
  brandAnalysis: BrandAnalysis;
  verdict: string;
  confidence: number;
}> {
  let title = brandName || '';

  if (itemId) {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      select: { title: true },
    });
    title = item?.title || title;
  }

  const brandAnalysis = analyzeBrand(title);
  const overallScore = Math.round(
    (brandAnalysis.logoAuthenticity + brandAnalysis.labelConsistency + brandAnalysis.packagingScore) / 3
  );

  let verdict: string;
  if (overallScore >= 80) {
    verdict = 'AUTHENTIC';
  } else if (overallScore >= 60) {
    verdict = 'NEEDS_VERIFICATION';
  } else {
    verdict = 'SUSPICIOUS';
  }

  return {
    brandAnalysis,
    verdict,
    confidence: Math.min(70 + Math.floor(overallScore / 5), 95),
  };
}

// ============================================
// Analysis Functions
// ============================================

function analyzeImageQuality(images: string[]): number {
  // Simulate image quality analysis
  // In production, use actual image processing
  const baseScore = 60 + Math.random() * 30;
  const imageCountBonus = Math.min(images.length * 5, 20);
  return Math.min(100, Math.round(baseScore + imageCountBonus));
}

function detectManipulation(images: string[]): number {
  // Simulate manipulation detection
  // Higher score = less manipulation detected
  const hasMultipleImages = images.length > 1;
  const baseScore = hasMultipleImages ? 75 : 65;
  return Math.round(baseScore + Math.random() * 20);
}

function checkStockImage(images: string[]): number {
  // Simulate stock image check
  // Higher score = less likely to be stock image
  return Math.round(70 + Math.random() * 25);
}

function analyzeBrand(title: string): BrandAnalysis {
  const detectedBrand = extractBrand(title);

  return {
    detectedBrand,
    logoAuthenticity: Math.round(60 + Math.random() * 35),
    labelConsistency: Math.round(55 + Math.random() * 40),
    packagingScore: Math.round(50 + Math.random() * 45),
    serialNumberFormat: Math.random() > 0.3 ? 'VALID' : 'NOT_FOUND',
  };
}

function extractBrand(title: string): string | undefined {
  const titleLower = title.toLowerCase();
  for (const brand of KNOWN_BRANDS) {
    if (titleLower.includes(brand.toLowerCase())) {
      return brand;
    }
  }
  return undefined;
}

function determineVerdict(
  score: number
): 'AUTHENTIC' | 'SUSPICIOUS' | 'LIKELY_FAKE' | 'INCONCLUSIVE' {
  if (score >= 80) return 'AUTHENTIC';
  if (score >= 60) return 'INCONCLUSIVE';
  if (score >= 40) return 'SUSPICIOUS';
  return 'LIKELY_FAKE';
}

function identifyRiskFactors(
  qualityScore: number,
  manipulationScore: number,
  stockScore: number
): RiskFactor[] {
  const factors: RiskFactor[] = [];

  if (qualityScore < 60) {
    factors.push({
      type: qualityScore < 40 ? 'HIGH' : 'MEDIUM',
      factor: 'Image Quality',
      factorAr: 'جودة الصورة',
      description: 'Image quality is below standard for verification',
      descriptionAr: 'جودة الصورة أقل من المعيار المطلوب للتحقق',
    });
  }

  if (manipulationScore < 70) {
    factors.push({
      type: manipulationScore < 50 ? 'HIGH' : 'MEDIUM',
      factor: 'Possible Manipulation',
      factorAr: 'احتمال تلاعب',
      description: 'Signs of image manipulation detected',
      descriptionAr: 'تم اكتشاف علامات تلاعب بالصورة',
    });
  }

  if (stockScore < 60) {
    factors.push({
      type: 'HIGH',
      factor: 'Stock Image',
      factorAr: 'صورة احترافية',
      description: 'Image may be from stock photo site',
      descriptionAr: 'الصورة قد تكون من موقع صور احترافية',
    });
  }

  return factors;
}

function generateRecommendations(
  verdict: 'AUTHENTIC' | 'SUSPICIOUS' | 'LIKELY_FAKE' | 'INCONCLUSIVE',
  riskFactors: RiskFactor[]
): AuthenticityRecommendation[] {
  const recommendations: AuthenticityRecommendation[] = [];

  if (verdict === 'LIKELY_FAKE' || verdict === 'SUSPICIOUS') {
    recommendations.push({
      priority: 'HIGH',
      action: 'Request additional photos',
      actionAr: 'اطلب صوراً إضافية',
      reason: 'More photos help verify authenticity',
      reasonAr: 'المزيد من الصور يساعد في التحقق من الأصالة',
    });

    recommendations.push({
      priority: 'HIGH',
      action: 'Verify serial number',
      actionAr: 'تحقق من الرقم التسلسلي',
      reason: 'Serial numbers confirm genuine products',
      reasonAr: 'الأرقام التسلسلية تؤكد المنتجات الأصلية',
    });
  }

  if (riskFactors.some(f => f.factor === 'Image Quality')) {
    recommendations.push({
      priority: 'MEDIUM',
      action: 'Request higher quality images',
      actionAr: 'اطلب صوراً بجودة أعلى',
      reason: 'Better images enable thorough verification',
      reasonAr: 'صور أفضل تتيح التحقق الشامل',
    });
  }

  if (verdict === 'INCONCLUSIVE' || verdict === 'AUTHENTIC') {
    recommendations.push({
      priority: 'LOW',
      action: 'Request proof of purchase',
      actionAr: 'اطلب إثبات الشراء',
      reason: 'Original receipt provides additional assurance',
      reasonAr: 'الفاتورة الأصلية توفر ضماناً إضافياً',
    });
  }

  return recommendations;
}

// ============================================
// Exports
// ============================================

export type {
  AuthenticityReport,
  RiskFactor,
  AuthenticityRecommendation,
  BrandAnalysis,
};
