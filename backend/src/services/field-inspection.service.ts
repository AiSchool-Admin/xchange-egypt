import {
  InspectionType,
  InspectionStatus,
  InspectionRecommendation,
  PropertyStatus,
  PropertyPropertyVerificationLevel,
  Prisma,
} from '@prisma/client';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import prisma from '../lib/prisma';

// ============================================
// Types & Interfaces
// ============================================

interface RequestInspectionData {
  propertyId: string;
  inspectionType: InspectionType;
  preferredDates?: Date[];
  contactPhone?: string;
  notes?: string;
}

interface InspectionFindings {
  exterior?: { condition: string; issues: string[] };
  interior?: { condition: string; issues: string[] };
  plumbing?: { condition: string; issues: string[] };
  electrical?: { condition: string; issues: string[] };
  structure?: { condition: string; issues: string[] };
  finishing?: { quality: string; condition: string };
  [key: string]: any;
}

interface CompleteInspectionData {
  overallScore: number;
  findings: InspectionFindings;
  inspectionPhotos: Array<{ url: string; category: string; gps?: any; timestamp?: string }>;
  addressMatches: boolean;
  areaMatches: boolean;
  recommendation: InspectionRecommendation;
  estimatedRepairCost?: number;
  reportNotes?: string;
}

// ============================================
// Inspection Request Operations
// ============================================

/**
 * Request a field inspection for a property
 */
export const requestInspection = async (
  userId: string,
  data: RequestInspectionData
): Promise<any> => {
  // Validate property
  const property = await prisma.property.findUnique({
    where: { id: data.propertyId },
    include: {
      owner: {
        select: { id: true, fullName: true },
      },
    },
  });

  if (!property) {
    throw new NotFoundError('Property not found');
  }

  // Check for existing pending inspection
  const existingInspection = await prisma.fieldInspection.findFirst({
    where: {
      propertyId: data.propertyId,
      inspectionType: data.inspectionType,
      status: { in: [InspectionStatus.REQUESTED, InspectionStatus.SCHEDULED] },
    },
  });

  if (existingInspection) {
    throw new BadRequestError('An inspection of this type is already pending for this property');
  }

  // Get inspection fee based on type
  const inspectionFee = getInspectionFee(data.inspectionType);

  // Find available inspector
  const inspector = await findAvailableInspector(property.governorate);

  // Create inspection request
  const inspection = await prisma.fieldInspection.create({
    data: {
      propertyId: data.propertyId,
      requestedById: userId,
      inspectorId: inspector?.id,
      inspectionType: data.inspectionType,
      scheduledAt: data.preferredDates?.[0],
      inspectionFee,
      status: InspectionStatus.REQUESTED,
      reportNotes: data.notes,
    },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          governorate: true,
          city: true,
          address: true,
        },
      },
      inspector: {
        include: {
          user: {
            select: {
              fullName: true,
            },
          },
        },
      },
      requestedBy: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  return {
    inspection,
    inspector: inspector
      ? {
          id: inspector.id,
          name: inspection.inspector?.user.fullName,
          rating: inspector.rating,
          totalInspections: inspector.totalInspections,
        }
      : null,
    fee: inspectionFee,
    estimatedSchedule: inspector ? 'خلال 2-3 أيام عمل' : 'سيتم تحديد موعد قريباً',
    paymentRequired: true,
  };
};

/**
 * Get inspection fee based on type
 */
function getInspectionFee(type: InspectionType): number {
  switch (type) {
    case InspectionType.BASIC:
      return 300;
    case InspectionType.STANDARD:
      return 500;
    case InspectionType.COMPREHENSIVE:
      return 800;
    case InspectionType.PRE_PURCHASE:
      return 1000;
    case InspectionType.PRE_RENTAL:
      return 400;
    case InspectionType.CHECKIN:
    case InspectionType.CHECKOUT:
      return 350;
    default:
      return 500;
  }
}

/**
 * Find available inspector for a location
 */
async function findAvailableInspector(governorate: string): Promise<any> {
  return prisma.inspector.findFirst({
    where: {
      isActive: true,
      isVerified: true,
      serviceAreas: {
        path: [],
        array_contains: governorate,
      },
    },
    orderBy: [{ rating: 'desc' }, { totalInspections: 'desc' }],
  });
}

/**
 * Get inspection by ID
 */
export const getInspectionById = async (
  inspectionId: string,
  userId: string
): Promise<any> => {
  const inspection = await prisma.fieldInspection.findUnique({
    where: { id: inspectionId },
    include: {
      property: {
        include: {
          owner: {
            select: { id: true, fullName: true },
          },
        },
      },
      inspector: {
        include: {
          user: {
            select: {
              fullName: true,
              avatar: true,
              phone: true,
            },
          },
        },
      },
      requestedBy: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  if (!inspection) {
    throw new NotFoundError('Inspection not found');
  }

  // Check if user is involved (property owner, requester, or inspector)
  const isOwner = inspection.property.ownerId === userId;
  const isRequester = inspection.requestedById === userId;
  const isInspector = inspection.inspector?.userId === userId;

  if (!isOwner && !isRequester && !isInspector) {
    throw new ForbiddenError('You are not authorized to view this inspection');
  }

  return inspection;
};

/**
 * Pay for inspection
 */
export const payForInspection = async (
  inspectionId: string,
  userId: string,
  paymentMethod: string,
  paymentReference?: string
): Promise<any> => {
  const inspection = await prisma.fieldInspection.findUnique({
    where: { id: inspectionId },
  });

  if (!inspection) {
    throw new NotFoundError('Inspection not found');
  }

  if (inspection.requestedById !== userId) {
    throw new ForbiddenError('Only the requester can pay for this inspection');
  }

  if (inspection.paid) {
    throw new BadRequestError('Inspection has already been paid');
  }

  // TODO: Integrate with actual payment gateway

  const updatedInspection = await prisma.fieldInspection.update({
    where: { id: inspectionId },
    data: {
      paid: true,
      paidAt: new Date(),
      status: inspection.inspectorId
        ? InspectionStatus.SCHEDULED
        : InspectionStatus.REQUESTED,
    },
  });

  return {
    inspection: updatedInspection,
    message: 'تم الدفع بنجاح. سيتم التواصل معك لتحديد موعد الفحص.',
  };
};

// ============================================
// Inspector Operations
// ============================================

/**
 * Schedule inspection (by inspector)
 */
export const scheduleInspection = async (
  inspectionId: string,
  inspectorUserId: string,
  scheduledAt: Date
): Promise<any> => {
  const inspector = await prisma.inspector.findUnique({
    where: { userId: inspectorUserId },
  });

  if (!inspector) {
    throw new ForbiddenError('You are not a registered inspector');
  }

  const inspection = await prisma.fieldInspection.findUnique({
    where: { id: inspectionId },
  });

  if (!inspection) {
    throw new NotFoundError('Inspection not found');
  }

  if (inspection.inspectorId !== inspector.id) {
    throw new ForbiddenError('This inspection is not assigned to you');
  }

  if (!inspection.paid) {
    throw new BadRequestError('Inspection must be paid before scheduling');
  }

  return prisma.fieldInspection.update({
    where: { id: inspectionId },
    data: {
      scheduledAt,
      status: InspectionStatus.SCHEDULED,
    },
  });
};

/**
 * Start inspection (by inspector)
 */
export const startInspection = async (
  inspectionId: string,
  inspectorUserId: string,
  gpsCoordinates: { lat: number; lng: number }
): Promise<any> => {
  const inspector = await prisma.inspector.findUnique({
    where: { userId: inspectorUserId },
  });

  if (!inspector) {
    throw new ForbiddenError('You are not a registered inspector');
  }

  const inspection = await prisma.fieldInspection.findUnique({
    where: { id: inspectionId },
    include: { property: true },
  });

  if (!inspection) {
    throw new NotFoundError('Inspection not found');
  }

  if (inspection.inspectorId !== inspector.id) {
    throw new ForbiddenError('This inspection is not assigned to you');
  }

  if (inspection.status !== InspectionStatus.SCHEDULED) {
    throw new BadRequestError('Inspection must be scheduled before starting');
  }

  // Verify location (if property has coordinates)
  let locationVerified = false;
  if (inspection.property.latitude && inspection.property.longitude) {
    const distance = calculateDistance(
      gpsCoordinates.lat,
      gpsCoordinates.lng,
      inspection.property.latitude,
      inspection.property.longitude
    );
    locationVerified = distance < 0.5; // Within 500 meters
  }

  return prisma.fieldInspection.update({
    where: { id: inspectionId },
    data: {
      status: InspectionStatus.IN_PROGRESS,
      gpsCoordinates,
      locationVerified,
    },
  });
};

/**
 * Complete inspection (by inspector)
 */
export const completeInspection = async (
  inspectionId: string,
  inspectorUserId: string,
  data: CompleteInspectionData
): Promise<any> => {
  const inspector = await prisma.inspector.findUnique({
    where: { userId: inspectorUserId },
  });

  if (!inspector) {
    throw new ForbiddenError('You are not a registered inspector');
  }

  const inspection = await prisma.fieldInspection.findUnique({
    where: { id: inspectionId },
    include: { property: true },
  });

  if (!inspection) {
    throw new NotFoundError('Inspection not found');
  }

  if (inspection.inspectorId !== inspector.id) {
    throw new ForbiddenError('This inspection is not assigned to you');
  }

  if (inspection.status !== InspectionStatus.IN_PROGRESS) {
    throw new BadRequestError('Inspection must be in progress to complete');
  }

  // Validate score
  if (data.overallScore < 0 || data.overallScore > 100) {
    throw new BadRequestError('Overall score must be between 0 and 100');
  }

  // Update inspection
  const completedInspection = await prisma.$transaction(async (tx) => {
    // Update inspection
    const updated = await tx.fieldInspection.update({
      where: { id: inspectionId },
      data: {
        status: InspectionStatus.COMPLETED,
        completedAt: new Date(),
        overallScore: data.overallScore,
        findings: data.findings,
        inspectionPhotos: data.inspectionPhotos,
        addressMatches: data.addressMatches,
        areaMatches: data.areaMatches,
        recommendation: data.recommendation,
        estimatedRepairCost: data.estimatedRepairCost,
        reportNotes: data.reportNotes,
      },
    });

    // Update property verification level
    await tx.property.update({
      where: { id: inspection.propertyId },
      data: {
        verificationLevel: PropertyVerificationLevel.FIELD_VERIFIED,
        verificationDate: new Date(),
      },
    });

    // Update inspector stats
    await tx.inspector.update({
      where: { id: inspector.id },
      data: {
        totalInspections: { increment: 1 },
      },
    });

    return updated;
  });

  return completedInspection;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// ============================================
// Inspector Registration
// ============================================

/**
 * Register as an inspector
 */
export const registerAsInspector = async (
  userId: string,
  data: {
    specializations?: string[];
    certifications?: any[];
    serviceAreas: string[];
    baseFee?: number;
  }
): Promise<any> => {
  // Check if already registered
  const existing = await prisma.inspector.findUnique({
    where: { userId },
  });

  if (existing) {
    throw new BadRequestError('You are already registered as an inspector');
  }

  return prisma.inspector.create({
    data: {
      userId,
      specializations: data.specializations,
      certifications: data.certifications,
      serviceAreas: data.serviceAreas,
      baseFee: data.baseFee || 500,
      isActive: true,
      isVerified: false, // Requires admin verification
    },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
          phone: true,
        },
      },
    },
  });
};

/**
 * Get inspections for an inspector
 */
export const getInspectorInspections = async (
  inspectorUserId: string,
  status?: InspectionStatus
): Promise<any[]> => {
  const inspector = await prisma.inspector.findUnique({
    where: { userId: inspectorUserId },
  });

  if (!inspector) {
    throw new NotFoundError('Inspector profile not found');
  }

  const where: Prisma.FieldInspectionWhereInput = {
    inspectorId: inspector.id,
  };

  if (status) {
    where.status = status;
  }

  return prisma.fieldInspection.findMany({
    where,
    include: {
      property: {
        select: {
          id: true,
          title: true,
          propertyType: true,
          governorate: true,
          city: true,
          address: true,
          images: true,
        },
      },
      requestedBy: {
        select: {
          id: true,
          fullName: true,
          phone: true,
        },
      },
    },
    orderBy: { scheduledAt: 'asc' },
  });
};

/**
 * Get user's inspection requests
 */
export const getUserInspections = async (
  userId: string,
  status?: InspectionStatus
): Promise<any[]> => {
  const where: Prisma.FieldInspectionWhereInput = {
    requestedById: userId,
  };

  if (status) {
    where.status = status;
  }

  return prisma.fieldInspection.findMany({
    where,
    include: {
      property: {
        select: {
          id: true,
          title: true,
          propertyType: true,
          governorate: true,
          city: true,
          images: true,
        },
      },
      inspector: {
        include: {
          user: {
            select: {
              fullName: true,
              avatar: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export default {
  requestInspection,
  getInspectionById,
  payForInspection,
  scheduleInspection,
  startInspection,
  completeInspection,
  registerAsInspector,
  getInspectorInspections,
  getUserInspections,
};
