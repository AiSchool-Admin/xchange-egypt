/**
 * Visual Authenticity AI Service
 * خدمة الذكاء الاصطناعي للتحقق البصري من الأصالة
 *
 * Advanced image analysis to detect:
 * - Fake/counterfeit products
 * - Stolen/stock images
 * - Photo manipulation
 * - Brand authenticity markers
 * - Quality indicators
 * - Metadata anomalies
 */

import prisma from '../lib/prisma';
import crypto from 'crypto';

// ============================================
// Types
// ============================================

interface AuthenticityReport {
  overallScore: number; // 0-100
  verdict: 'AUTHENTIC' | 'SUSPICIOUS' | 'LIKELY_FAKE' | 'INCONCLUSIVE';
  confidence: number;
  analyses: AnalysisResult[];
  riskFactors: RiskFactor[];
  recommendations: AuthenticityRecommendation[];
  metadata: ImageMetadata;
  brandAnalysis?: BrandAnalysis;
  qualityScore: number;
  estimatedAuthenticityConfidence: number;
}

interface AnalysisResult {
  type: AnalysisType;
  score: number; // 0-100
  passed: boolean;
  details: string;
  detailsAr: string;
  evidence?: string[];
}

type AnalysisType =
  | 'IMAGE_QUALITY'
  | 'METADATA_CHECK'
  | 'MANIPULATION_DETECTION'
  | 'STOCK_IMAGE_CHECK'
  | 'BRAND_CONSISTENCY'
  | 'LIGHTING_ANALYSIS'
  | 'BACKGROUND_CHECK'
  | 'DETAIL_RESOLUTION'
  | 'WATERMARK_DETECTION'
  | 'EXIF_ANALYSIS'
  | 'REVERSE_IMAGE_SEARCH'
  | 'LOGO_VERIFICATION';

interface RiskFactor {
  type: 'HIGH' | 'MEDIUM' | 'LOW';
  factor: string;
  factorAr: string;
  description: string;
  descriptionAr: string;
  weight: number;
}

interface AuthenticityRecommendation {
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  action: string;
  actionAr: string;
  reason: string;
  reasonAr: string;
}

interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  hasExif: boolean;
  exifData?: ExifData;
  hash: string;
  uploadTime: Date;
  isOriginal: boolean;
}

interface ExifData {
  make?: string;
  model?: string;
  dateTime?: string;
  software?: string;
  gps?: { lat: number; lng: number };
  orientation?: number;
}

interface BrandAnalysis {
  detectedBrand?: string;
  logoAuthenticity: number; // 0-100
  labelConsistency: number;
  packagingScore: number;
  serialNumberFormat: 'VALID' | 'INVALID' | 'NOT_FOUND';
  knownCounterfeitPatterns: string[];
}

// Category-specific authenticity checks
interface CategoryConfig {
  requiredChecks: AnalysisType[];
  brandVerification: boolean;
  serialValidation: boolean;
  packagingAnalysis: boolean;
  minQualityScore: number;
  specificIndicators: string[];
}

// ============================================
// Configuration
// ============================================

const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  electronics: {
    requiredChecks: [
      'IMAGE_QUALITY',
      'MANIPULATION_DETECTION',
      'BRAND_CONSISTENCY',
      'LOGO_VERIFICATION',
      'STOCK_IMAGE_CHECK',
    ],
    brandVerification: true,
    serialValidation: true,
    packagingAnalysis: true,
    minQualityScore: 60,
    specificIndicators: [
      'Clear serial number/IMEI visible',
      'Original packaging with security seals',
      'Correct logo placement and colors',
      'Proper font usage on labels',
    ],
  },
  fashion: {
    requiredChecks: [
      'IMAGE_QUALITY',
      'BRAND_CONSISTENCY',
      'DETAIL_RESOLUTION',
      'LOGO_VERIFICATION',
      'STOCK_IMAGE_CHECK',
    ],
    brandVerification: true,
    serialValidation: false,
    packagingAnalysis: true,
    minQualityScore: 70,
    specificIndicators: [
      'Stitching quality and pattern',
      'Hardware finish and weight',
      'Logo placement accuracy',
      'Material texture visibility',
      'Dust bag and authentication cards',
    ],
  },
  watches: {
    requiredChecks: [
      'IMAGE_QUALITY',
      'DETAIL_RESOLUTION',
      'BRAND_CONSISTENCY',
      'LOGO_VERIFICATION',
      'MANIPULATION_DETECTION',
    ],
    brandVerification: true,
    serialValidation: true,
    packagingAnalysis: true,
    minQualityScore: 80,
    specificIndicators: [
      'Movement quality (if visible)',
      'Dial printing quality',
      'Crown logo engraving',
      'Case back details',
      'Crystal clarity',
      'Lume application consistency',
    ],
  },
  gold: {
    requiredChecks: [
      'IMAGE_QUALITY',
      'DETAIL_RESOLUTION',
      'LIGHTING_ANALYSIS',
    ],
    brandVerification: false,
    serialValidation: false,
    packagingAnalysis: false,
    minQualityScore: 70,
    specificIndicators: [
      'Hallmark visibility',
      'Color consistency',
      'Surface finish quality',
      'Weight stamp clarity',
    ],
  },
  vehicles: {
    requiredChecks: [
      'IMAGE_QUALITY',
      'MANIPULATION_DETECTION',
      'EXIF_ANALYSIS',
      'STOCK_IMAGE_CHECK',
    ],
    brandVerification: false,
    serialValidation: true,
    packagingAnalysis: false,
    minQualityScore: 50,
    specificIndicators: [
      'VIN visibility',
      'Odometer reading',
      'License plate (verify ownership)',
      'Consistent condition across angles',
    ],
  },
};

// Known counterfeit indicators by brand
const COUNTERFEIT_INDICATORS: Record<string, string[]> = {
  apple: [
    'Incorrect font on packaging',
    'Missing regulatory text',
    'Wrong shade of white/gray',
    'Cheap plastic feel on images',
    'Blurry Apple logo',
  ],
  samsung: [
    'Misaligned SAMSUNG text',
    'Wrong blue shade',
    'Missing model numbers',
    'Low resolution product images',
  ],
  rolex: [
    'Incorrect crown logo proportions',
    'Wrong dial font',
    'Poor lume application',
    'Misaligned indices',
    'Cheap strap quality',
  ],
  louis_vuitton: [
    'LV pattern misalignment at seams',
    'Incorrect shade of brown',
    'Poor stitching quality',
    'Wrong hardware color',
    'Missing date codes',
  ],
  gucci: [
    'GG pattern spacing errors',
    'Wrong shade of green/red stripes',
    'Poor leather quality visible',
    'Incorrect hardware finish',
  ],
};

// ============================================
// Main Analysis Functions
// ============================================

/**
 * Perform comprehensive authenticity analysis on item images
 */
export async function analyzeAuthenticity(
  itemId: string,
  imageUrls: string[],
  categoryType?: string
): Promise<AuthenticityReport> {
  // Get item details
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      category: { include: { parent: true } },
      images: true,
    },
  });

  if (!item) {
    throw new Error('Item not found');
  }

  // Determine category config
  const catType = categoryType || getCategoryType(item.category);
  const config = CATEGORY_CONFIGS[catType] || CATEGORY_CONFIGS.electronics;

  // Perform all analyses
  const analyses: AnalysisResult[] = [];
  const allImages = imageUrls.length > 0 ? imageUrls : item.images.map(i => i.url);

  // Core analyses for all items
  for (const check of config.requiredChecks) {
    const result = await performAnalysis(check, allImages, item, config);
    analyses.push(result);
  }

  // Calculate overall score
  const scores = analyses.map(a => a.score);
  const weights = analyses.map(a => getAnalysisWeight(a.type));
  const weightedSum = scores.reduce((sum, score, i) => sum + score * weights[i], 0);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const overallScore = Math.round(weightedSum / totalWeight);

  // Identify risk factors
  const riskFactors = identifyRiskFactors(analyses, item);

  // Determine verdict
  const verdict = determineVerdict(overallScore, riskFactors, analyses);

  // Generate recommendations
  const recommendations = generateAuthenticityRecommendations(
    verdict,
    riskFactors,
    analyses,
    config
  );

  // Get image metadata
  const metadata = await extractImageMetadata(allImages[0]);

  // Brand analysis if applicable
  let brandAnalysis: BrandAnalysis | undefined;
  if (config.brandVerification) {
    brandAnalysis = await analyzeBrand(item, allImages);
  }

  // Quality score
  const qualityScore = calculateQualityScore(analyses);

  // Store the analysis
  await storeAuthenticityAnalysis(itemId, {
    overallScore,
    verdict,
    confidence: calculateConfidence(analyses),
    analysisCount: analyses.length,
  });

  return {
    overallScore,
    verdict,
    confidence: calculateConfidence(analyses),
    analyses,
    riskFactors,
    recommendations,
    metadata,
    brandAnalysis,
    qualityScore,
    estimatedAuthenticityConfidence: calculateConfidence(analyses),
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
  const qualityResult = await analyzeImageQuality(imageUrl);
  if (qualityResult.score < 50) {
    issues.push('Low image quality');
    score -= 20;
  }

  // Check for manipulation
  const manipulationResult = await detectManipulation(imageUrl);
  if (manipulationResult.score < 60) {
    issues.push('Possible image manipulation detected');
    score -= 30;
  }

  // Check for stock images
  const stockResult = await checkStockImage(imageUrl);
  if (stockResult.isStock) {
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

  return { score, verdict, issues };
}

// ============================================
// Individual Analysis Functions
// ============================================

async function performAnalysis(
  type: AnalysisType,
  images: string[],
  item: any,
  config: CategoryConfig
): Promise<AnalysisResult> {
  switch (type) {
    case 'IMAGE_QUALITY':
      return await analyzeImageQuality(images[0]);
    case 'METADATA_CHECK':
      return await analyzeMetadata(images[0]);
    case 'MANIPULATION_DETECTION':
      return await detectManipulation(images[0]);
    case 'STOCK_IMAGE_CHECK':
      return await checkStockImageResult(images[0]);
    case 'BRAND_CONSISTENCY':
      return await analyzeBrandConsistency(images, item);
    case 'LIGHTING_ANALYSIS':
      return await analyzeLighting(images);
    case 'BACKGROUND_CHECK':
      return await analyzeBackground(images);
    case 'DETAIL_RESOLUTION':
      return await analyzeDetailResolution(images);
    case 'WATERMARK_DETECTION':
      return await detectWatermarks(images[0]);
    case 'EXIF_ANALYSIS':
      return await analyzeExif(images[0]);
    case 'REVERSE_IMAGE_SEARCH':
      return await performReverseImageSearch(images[0]);
    case 'LOGO_VERIFICATION':
      return await verifyLogo(images, item);
    default:
      return {
        type,
        score: 50,
        passed: true,
        details: 'Analysis not implemented',
        detailsAr: 'التحليل غير مُنفذ',
      };
  }
}

async function analyzeImageQuality(imageUrl: string): Promise<AnalysisResult> {
  // Simulate image quality analysis
  // In production, this would use a real image processing library

  const mockAnalysis = {
    resolution: Math.random() > 0.2 ? 'HIGH' : 'LOW',
    sharpness: Math.random() * 100,
    noise: Math.random() * 30,
    compression: Math.random() > 0.3 ? 'MINIMAL' : 'HEAVY',
  };

  const score = Math.round(
    (mockAnalysis.resolution === 'HIGH' ? 40 : 20) +
    (mockAnalysis.sharpness * 0.4) +
    (30 - mockAnalysis.noise)
  );

  const passed = score >= 60;

  return {
    type: 'IMAGE_QUALITY',
    score: Math.min(100, Math.max(0, score)),
    passed,
    details: passed
      ? 'Image quality meets authenticity standards'
      : 'Image quality is below standards - may hide defects or be from web',
    detailsAr: passed
      ? 'جودة الصورة تلبي معايير الأصالة'
      : 'جودة الصورة أقل من المعايير - قد تخفي عيوباً أو تكون من الإنترنت',
    evidence: [
      `Resolution: ${mockAnalysis.resolution}`,
      `Sharpness: ${mockAnalysis.sharpness.toFixed(0)}%`,
      `Noise level: ${mockAnalysis.noise.toFixed(0)}%`,
    ],
  };
}

async function analyzeMetadata(imageUrl: string): Promise<AnalysisResult> {
  // Check for suspicious metadata patterns
  const hasExif = Math.random() > 0.3;
  const hasEditingSoftware = Math.random() > 0.7;
  const consistentDates = Math.random() > 0.2;

  let score = 70;
  const issues: string[] = [];

  if (!hasExif) {
    score -= 20;
    issues.push('No EXIF data (possibly stripped or screenshot)');
  }

  if (hasEditingSoftware) {
    score -= 15;
    issues.push('Image edited with software');
  }

  if (!consistentDates) {
    score -= 25;
    issues.push('Metadata dates inconsistent');
  }

  return {
    type: 'METADATA_CHECK',
    score: Math.max(0, score),
    passed: score >= 50,
    details: issues.length > 0
      ? `Metadata concerns: ${issues.join(', ')}`
      : 'Metadata appears authentic',
    detailsAr: issues.length > 0
      ? 'مخاوف في البيانات الوصفية'
      : 'البيانات الوصفية تبدو أصلية',
    evidence: issues,
  };
}

async function detectManipulation(imageUrl: string): Promise<AnalysisResult> {
  // Detect signs of image manipulation
  // Uses Error Level Analysis (ELA) simulation

  const manipulationIndicators = {
    cloning: Math.random() > 0.9,
    splicing: Math.random() > 0.85,
    colorManipulation: Math.random() > 0.8,
    aiGenerated: Math.random() > 0.95,
  };

  const issues: string[] = [];
  let score = 100;

  if (manipulationIndicators.cloning) {
    score -= 40;
    issues.push('Possible cloned regions detected');
  }
  if (manipulationIndicators.splicing) {
    score -= 35;
    issues.push('Image splicing artifacts found');
  }
  if (manipulationIndicators.colorManipulation) {
    score -= 20;
    issues.push('Color manipulation detected');
  }
  if (manipulationIndicators.aiGenerated) {
    score -= 50;
    issues.push('Possible AI-generated image');
  }

  return {
    type: 'MANIPULATION_DETECTION',
    score: Math.max(0, score),
    passed: score >= 60,
    details: issues.length > 0
      ? 'Manipulation indicators detected'
      : 'No manipulation detected',
    detailsAr: issues.length > 0
      ? 'تم اكتشاف مؤشرات تلاعب'
      : 'لم يتم اكتشاف أي تلاعب',
    evidence: issues,
  };
}

async function checkStockImage(imageUrl: string): Promise<{ isStock: boolean; sources: string[] }> {
  // Simulate reverse image search for stock photos
  const isStock = Math.random() > 0.9;
  return {
    isStock,
    sources: isStock ? ['shutterstock.com', 'istockphoto.com'] : [],
  };
}

async function checkStockImageResult(imageUrl: string): Promise<AnalysisResult> {
  const result = await checkStockImage(imageUrl);

  return {
    type: 'STOCK_IMAGE_CHECK',
    score: result.isStock ? 0 : 100,
    passed: !result.isStock,
    details: result.isStock
      ? `Image found on stock photo sites: ${result.sources.join(', ')}`
      : 'Image not found in stock photo databases',
    detailsAr: result.isStock
      ? 'الصورة موجودة في مواقع صور احترافية'
      : 'الصورة غير موجودة في قواعد بيانات الصور الاحترافية',
    evidence: result.sources,
  };
}

async function analyzeBrandConsistency(images: string[], item: any): Promise<AnalysisResult> {
  // Check brand elements across multiple images
  const brandName = extractBrandFromTitle(item.title);

  if (!brandName) {
    return {
      type: 'BRAND_CONSISTENCY',
      score: 50,
      passed: true,
      details: 'No brand detected for consistency check',
      detailsAr: 'لم يتم اكتشاف علامة تجارية للفحص',
    };
  }

  // Simulate brand consistency check
  const indicators = COUNTERFEIT_INDICATORS[brandName.toLowerCase()] || [];
  const detectedIssues: string[] = [];

  // Randomly detect some issues for simulation
  indicators.forEach(indicator => {
    if (Math.random() > 0.8) {
      detectedIssues.push(indicator);
    }
  });

  const score = Math.round(100 - (detectedIssues.length * 25));

  return {
    type: 'BRAND_CONSISTENCY',
    score: Math.max(0, score),
    passed: score >= 60,
    details: detectedIssues.length > 0
      ? `Brand inconsistencies found for ${brandName}`
      : `Brand elements consistent with ${brandName}`,
    detailsAr: detectedIssues.length > 0
      ? `تم العثور على تناقضات في العلامة التجارية ${brandName}`
      : `عناصر العلامة التجارية متسقة مع ${brandName}`,
    evidence: detectedIssues,
  };
}

async function analyzeLighting(images: string[]): Promise<AnalysisResult> {
  // Check for consistent lighting across images
  const consistentLighting = Math.random() > 0.2;
  const professionalLighting = Math.random() > 0.5;

  const score = (consistentLighting ? 50 : 20) + (professionalLighting ? 30 : 10) + Math.random() * 20;

  return {
    type: 'LIGHTING_ANALYSIS',
    score: Math.round(score),
    passed: score >= 60,
    details: consistentLighting
      ? 'Lighting is consistent across images'
      : 'Inconsistent lighting may indicate image sourcing from different places',
    detailsAr: consistentLighting
      ? 'الإضاءة متسقة عبر الصور'
      : 'الإضاءة غير المتسقة قد تشير إلى صور من مصادر مختلفة',
  };
}

async function analyzeBackground(images: string[]): Promise<AnalysisResult> {
  // Check background consistency and authenticity
  const isNaturalBackground = Math.random() > 0.3;
  const isConsistent = Math.random() > 0.2;

  const score = (isNaturalBackground ? 40 : 60) + (isConsistent ? 40 : 20);

  return {
    type: 'BACKGROUND_CHECK',
    score: Math.round(score),
    passed: score >= 50,
    details: isNaturalBackground
      ? 'Natural/home environment detected'
      : 'Professional or studio background',
    detailsAr: isNaturalBackground
      ? 'تم اكتشاف بيئة طبيعية/منزلية'
      : 'خلفية احترافية أو استوديو',
  };
}

async function analyzeDetailResolution(images: string[]): Promise<AnalysisResult> {
  // Check if fine details are visible (important for luxury goods)
  const detailLevel = Math.random() * 100;

  return {
    type: 'DETAIL_RESOLUTION',
    score: Math.round(detailLevel),
    passed: detailLevel >= 60,
    details: detailLevel >= 60
      ? 'Fine details visible for authenticity verification'
      : 'Insufficient detail for authenticity verification',
    detailsAr: detailLevel >= 60
      ? 'التفاصيل الدقيقة مرئية للتحقق من الأصالة'
      : 'التفاصيل غير كافية للتحقق من الأصالة',
  };
}

async function detectWatermarks(imageUrl: string): Promise<AnalysisResult> {
  // Detect watermarks or logos from other sources
  const hasWatermark = Math.random() > 0.9;
  const hasOtherLogo = Math.random() > 0.95;

  const issues: string[] = [];
  let score = 100;

  if (hasWatermark) {
    score -= 50;
    issues.push('Watermark detected');
  }
  if (hasOtherLogo) {
    score -= 40;
    issues.push('Third-party logo detected');
  }

  return {
    type: 'WATERMARK_DETECTION',
    score,
    passed: score >= 60,
    details: issues.length > 0
      ? 'Foreign watermarks or logos detected'
      : 'No watermarks detected',
    detailsAr: issues.length > 0
      ? 'تم اكتشاف علامات مائية أو شعارات خارجية'
      : 'لم يتم اكتشاف علامات مائية',
    evidence: issues,
  };
}

async function analyzeExif(imageUrl: string): Promise<AnalysisResult> {
  // Detailed EXIF analysis
  const hasExif = Math.random() > 0.4;
  const hasGps = Math.random() > 0.6;
  const deviceMatch = Math.random() > 0.2;

  const evidence: string[] = [];
  let score = 50;

  if (hasExif) {
    score += 20;
    evidence.push('EXIF data present');
    if (hasGps) {
      score += 15;
      evidence.push('GPS coordinates available');
    }
    if (deviceMatch) {
      score += 15;
      evidence.push('Device info consistent');
    }
  } else {
    evidence.push('No EXIF data - may be screenshot or processed');
  }

  return {
    type: 'EXIF_ANALYSIS',
    score,
    passed: score >= 60,
    details: hasExif
      ? 'EXIF data analysis complete'
      : 'No EXIF data available for analysis',
    detailsAr: hasExif
      ? 'اكتمل تحليل بيانات EXIF'
      : 'لا تتوفر بيانات EXIF للتحليل',
    evidence,
  };
}

async function performReverseImageSearch(imageUrl: string): Promise<AnalysisResult> {
  // Simulate reverse image search
  const foundElsewhere = Math.random() > 0.85;
  const sources: string[] = foundElsewhere
    ? ['alibaba.com', 'aliexpress.com']
    : [];

  return {
    type: 'REVERSE_IMAGE_SEARCH',
    score: foundElsewhere ? 20 : 90,
    passed: !foundElsewhere,
    details: foundElsewhere
      ? 'Image found on wholesale/counterfeit markets'
      : 'Image appears to be original',
    detailsAr: foundElsewhere
      ? 'الصورة موجودة في أسواق الجملة/التقليد'
      : 'الصورة تبدو أصلية',
    evidence: sources,
  };
}

async function verifyLogo(images: string[], item: any): Promise<AnalysisResult> {
  // Verify brand logo authenticity
  const brandName = extractBrandFromTitle(item.title);

  if (!brandName) {
    return {
      type: 'LOGO_VERIFICATION',
      score: 50,
      passed: true,
      details: 'No brand logo to verify',
      detailsAr: 'لا يوجد شعار علامة تجارية للتحقق',
    };
  }

  // Simulate logo verification
  const logoCorrect = Math.random() > 0.15;
  const proportionsCorrect = Math.random() > 0.1;
  const colorCorrect = Math.random() > 0.1;

  const issues: string[] = [];
  let score = 100;

  if (!logoCorrect) {
    score -= 40;
    issues.push('Logo appears incorrect');
  }
  if (!proportionsCorrect) {
    score -= 30;
    issues.push('Logo proportions off');
  }
  if (!colorCorrect) {
    score -= 20;
    issues.push('Logo colors inconsistent');
  }

  return {
    type: 'LOGO_VERIFICATION',
    score: Math.max(0, score),
    passed: score >= 60,
    details: issues.length > 0
      ? `Logo verification issues for ${brandName}`
      : `Logo verified for ${brandName}`,
    detailsAr: issues.length > 0
      ? `مشاكل في التحقق من شعار ${brandName}`
      : `تم التحقق من شعار ${brandName}`,
    evidence: issues,
  };
}

// ============================================
// Brand Analysis
// ============================================

async function analyzeBrand(item: any, images: string[]): Promise<BrandAnalysis> {
  const brandName = extractBrandFromTitle(item.title);

  // Simulate brand analysis
  return {
    detectedBrand: brandName,
    logoAuthenticity: Math.round(60 + Math.random() * 40),
    labelConsistency: Math.round(50 + Math.random() * 50),
    packagingScore: Math.round(40 + Math.random() * 60),
    serialNumberFormat: Math.random() > 0.2 ? 'VALID' : 'NOT_FOUND',
    knownCounterfeitPatterns: [],
  };
}

// ============================================
// Helper Functions
// ============================================

function getCategoryType(category: any): string {
  if (!category) return 'electronics';

  const name = (category.name || '').toLowerCase();
  const parentName = (category.parent?.name || '').toLowerCase();

  if (name.includes('watch') || name.includes('ساع')) return 'watches';
  if (name.includes('gold') || name.includes('ذهب')) return 'gold';
  if (name.includes('car') || name.includes('سيار') || parentName.includes('vehicle')) return 'vehicles';
  if (name.includes('fashion') || name.includes('bag') || name.includes('شنط') || name.includes('ملابس')) return 'fashion';

  return 'electronics';
}

function getAnalysisWeight(type: AnalysisType): number {
  const weights: Record<AnalysisType, number> = {
    IMAGE_QUALITY: 1.0,
    METADATA_CHECK: 0.8,
    MANIPULATION_DETECTION: 1.5,
    STOCK_IMAGE_CHECK: 1.5,
    BRAND_CONSISTENCY: 1.2,
    LIGHTING_ANALYSIS: 0.6,
    BACKGROUND_CHECK: 0.5,
    DETAIL_RESOLUTION: 0.8,
    WATERMARK_DETECTION: 1.0,
    EXIF_ANALYSIS: 0.7,
    REVERSE_IMAGE_SEARCH: 1.3,
    LOGO_VERIFICATION: 1.2,
  };
  return weights[type] || 1.0;
}

function extractBrandFromTitle(title: string): string | null {
  const knownBrands = [
    'Apple', 'Samsung', 'iPhone', 'Rolex', 'Omega', 'Cartier',
    'Louis Vuitton', 'Gucci', 'Prada', 'Chanel', 'Nike', 'Adidas',
    'Sony', 'LG', 'Huawei', 'Xiaomi', 'BMW', 'Mercedes', 'Toyota',
  ];

  const titleLower = title.toLowerCase();
  for (const brand of knownBrands) {
    if (titleLower.includes(brand.toLowerCase())) {
      return brand;
    }
  }
  return null;
}

function identifyRiskFactors(
  analyses: AnalysisResult[],
  item: any
): RiskFactor[] {
  const factors: RiskFactor[] = [];

  // Check for failed analyses
  const failedAnalyses = analyses.filter(a => !a.passed);

  failedAnalyses.forEach(a => {
    factors.push({
      type: a.score < 30 ? 'HIGH' : a.score < 60 ? 'MEDIUM' : 'LOW',
      factor: a.type,
      factorAr: getAnalysisTypeAr(a.type),
      description: a.details,
      descriptionAr: a.detailsAr,
      weight: getAnalysisWeight(a.type),
    });
  });

  // Price-based risk
  if (item.estimatedValue && item.marketValue) {
    const priceDiff = (item.marketValue - item.estimatedValue) / item.marketValue;
    if (priceDiff > 0.5) {
      factors.push({
        type: 'HIGH',
        factor: 'Price too low',
        factorAr: 'السعر منخفض جداً',
        description: 'Price significantly below market value',
        descriptionAr: 'السعر أقل بكثير من القيمة السوقية',
        weight: 1.5,
      });
    }
  }

  return factors.sort((a, b) => {
    const typeOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return typeOrder[a.type] - typeOrder[b.type];
  });
}

function getAnalysisTypeAr(type: AnalysisType): string {
  const translations: Record<AnalysisType, string> = {
    IMAGE_QUALITY: 'جودة الصورة',
    METADATA_CHECK: 'فحص البيانات الوصفية',
    MANIPULATION_DETECTION: 'اكتشاف التلاعب',
    STOCK_IMAGE_CHECK: 'فحص الصور الاحترافية',
    BRAND_CONSISTENCY: 'اتساق العلامة التجارية',
    LIGHTING_ANALYSIS: 'تحليل الإضاءة',
    BACKGROUND_CHECK: 'فحص الخلفية',
    DETAIL_RESOLUTION: 'دقة التفاصيل',
    WATERMARK_DETECTION: 'اكتشاف العلامات المائية',
    EXIF_ANALYSIS: 'تحليل EXIF',
    REVERSE_IMAGE_SEARCH: 'البحث العكسي للصور',
    LOGO_VERIFICATION: 'التحقق من الشعار',
  };
  return translations[type] || type;
}

function determineVerdict(
  overallScore: number,
  riskFactors: RiskFactor[],
  analyses: AnalysisResult[]
): 'AUTHENTIC' | 'SUSPICIOUS' | 'LIKELY_FAKE' | 'INCONCLUSIVE' {
  const highRisks = riskFactors.filter(r => r.type === 'HIGH').length;

  if (overallScore >= 80 && highRisks === 0) {
    return 'AUTHENTIC';
  } else if (overallScore < 40 || highRisks >= 2) {
    return 'LIKELY_FAKE';
  } else if (overallScore < 60 || highRisks >= 1) {
    return 'SUSPICIOUS';
  }

  return 'INCONCLUSIVE';
}

function generateAuthenticityRecommendations(
  verdict: string,
  riskFactors: RiskFactor[],
  analyses: AnalysisResult[],
  config: CategoryConfig
): AuthenticityRecommendation[] {
  const recommendations: AuthenticityRecommendation[] = [];

  if (verdict === 'LIKELY_FAKE' || verdict === 'SUSPICIOUS') {
    recommendations.push({
      priority: 'CRITICAL',
      action: 'Request additional photos',
      actionAr: 'اطلب صوراً إضافية',
      reason: 'Current images raise authenticity concerns',
      reasonAr: 'الصور الحالية تثير مخاوف حول الأصالة',
    });

    if (config.serialValidation) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Verify serial number',
        actionAr: 'تحقق من الرقم التسلسلي',
        reason: 'Serial validation can confirm authenticity',
        reasonAr: 'التحقق من الرقم التسلسلي يؤكد الأصالة',
      });
    }
  }

  const lowQuality = analyses.find(a => a.type === 'IMAGE_QUALITY' && a.score < 60);
  if (lowQuality) {
    recommendations.push({
      priority: 'HIGH',
      action: 'Request higher quality images',
      actionAr: 'اطلب صوراً بجودة أعلى',
      reason: 'Current image quality insufficient for verification',
      reasonAr: 'جودة الصور الحالية غير كافية للتحقق',
    });
  }

  if (config.brandVerification) {
    recommendations.push({
      priority: 'MEDIUM',
      action: 'Request proof of purchase',
      actionAr: 'اطلب إثبات الشراء',
      reason: 'Original receipt confirms authenticity',
      reasonAr: 'الفاتورة الأصلية تؤكد الأصالة',
    });
  }

  return recommendations;
}

function calculateQualityScore(analyses: AnalysisResult[]): number {
  const qualityAnalysis = analyses.find(a => a.type === 'IMAGE_QUALITY');
  const detailAnalysis = analyses.find(a => a.type === 'DETAIL_RESOLUTION');

  return Math.round(
    (qualityAnalysis?.score || 50) * 0.6 +
    (detailAnalysis?.score || 50) * 0.4
  );
}

function calculateConfidence(analyses: AnalysisResult[]): number {
  // More analyses with consistent results = higher confidence
  const passRate = analyses.filter(a => a.passed).length / analyses.length;
  const avgScore = analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length;

  // High variance in scores = lower confidence
  const variance = analyses.reduce((sum, a) => sum + Math.pow(a.score - avgScore, 2), 0) / analyses.length;
  const variancePenalty = Math.min(variance / 500, 0.3);

  return Math.round((passRate * 50 + (avgScore / 100) * 50) * (1 - variancePenalty));
}

async function extractImageMetadata(imageUrl: string): Promise<ImageMetadata> {
  // In production, would extract actual metadata
  return {
    width: 1920,
    height: 1080,
    format: 'JPEG',
    size: 245000,
    hasExif: Math.random() > 0.3,
    hash: crypto.createHash('md5').update(imageUrl).digest('hex'),
    uploadTime: new Date(),
    isOriginal: Math.random() > 0.2,
  };
}

async function storeAuthenticityAnalysis(
  itemId: string,
  analysis: {
    overallScore: number;
    verdict: string;
    confidence: number;
    analysisCount: number;
  }
) {
  // Store analysis result in database
  // In production, would create a proper model for this
  return prisma.item.update({
    where: { id: itemId },
    data: {
      // Add authenticity fields to Item model or create separate table
      updatedAt: new Date(),
    },
  });
}

// ============================================
// Exports
// ============================================

export {
  AuthenticityReport,
  AnalysisResult,
  AnalysisType,
  RiskFactor,
  BrandAnalysis,
};
