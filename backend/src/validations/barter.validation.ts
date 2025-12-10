import { z } from 'zod';
import { BarterOfferStatus, BarterChainStatus } from '@prisma/client';

// Barter Offer Status validation
const barterOfferStatusEnum = z.nativeEnum(BarterOfferStatus, {
  errorMap: () => ({ message: 'Invalid barter offer status' }),
});

// Preference Set Schema
const preferenceSetSchema = z.object({
  priority: z.number().int().min(1).max(10, 'Priority must be between 1 and 10'),
  itemIds: z
    .array(z.string().min(1, 'Item ID is required'))
    .max(10, 'Maximum 10 items per preference set')
    .default([]),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
}).refine(
  (data) => data.itemIds.length > 0 || (data.description && data.description.trim().length > 0),
  {
    message: 'Must specify at least one item or provide a description',
    path: ['itemIds'],
  }
);

// Item Request Schema (for description-based requests)
const itemRequestSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500, 'Description must not exceed 500 characters'),
  categoryId: z.string().min(1).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
});

// Create Barter Offer Schema (with Bundle & Preferences support)
export const createBarterOfferSchema = z.object({
  body: z.object({
    offeredItemIds: z
      .array(z.string().min(1, 'Item ID is required'))
      .max(20, 'Maximum 20 items per bundle')
      .default([]),
    preferenceSets: z
      .array(preferenceSetSchema)
      .max(10, 'Maximum 10 preference sets')
      .default([]),
    itemRequests: z
      .array(itemRequestSchema)
      .max(5, 'Maximum 5 item requests')
      .optional(),
    recipientId: z.string().min(1).optional(),
    notes: z
      .string()
      .max(1000, 'Notes must not exceed 1000 characters')
      .optional(),
    expiresAt: z
      .string()
      .datetime('Invalid expiration date')
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
    isOpenOffer: z.boolean().default(false).optional(),
    offeredCashAmount: z.number().min(0, 'Cash amount must be positive').default(0).optional(),
    requestedCashAmount: z.number().min(0, 'Cash amount must be positive').default(0).optional(),
  }).refine(
    (data) => {
      // Must have something to offer (items or cash)
      return data.offeredItemIds.length > 0 || (data.offeredCashAmount && data.offeredCashAmount > 0);
    },
    {
      message: 'Must offer at least one item or cash',
      path: ['offeredItemIds'],
    }
  ).refine(
    (data) => {
      // Must have something to request (items, description, or cash)
      const hasPreferenceSets = data.preferenceSets.length > 0;
      const hasItemRequests = data.itemRequests && data.itemRequests.length > 0;
      const hasRequestedCash = data.requestedCashAmount && data.requestedCashAmount > 0;
      return hasPreferenceSets || hasItemRequests || hasRequestedCash;
    },
    {
      message: 'Must specify what you want (items, description, or cash)',
      path: ['preferenceSets'],
    }
  ).refine(
    (data) => {
      // Ensure priorities are unique (only if preferenceSets exist)
      if (data.preferenceSets.length === 0) return true;
      const priorities = data.preferenceSets.map((ps) => ps.priority);
      const uniquePriorities = new Set(priorities);
      return priorities.length === uniquePriorities.size;
    },
    {
      message: 'Preference set priorities must be unique',
      path: ['preferenceSets'],
    }
  ).refine(
    (data) => {
      // Check no overlap between offered and requested items
      if (data.preferenceSets.length === 0) return true;
      const offeredSet = new Set(data.offeredItemIds);
      const allRequestedIds = data.preferenceSets.flatMap((ps) => ps.itemIds);
      return !allRequestedIds.some((id) => offeredSet.has(id));
    },
    {
      message: 'Cannot request items you are offering',
      path: ['preferenceSets'],
    }
  ),
});

// Accept Barter Offer Schema (with preference set selection)
export const acceptBarterOfferSchema = z.object({
  params: z.object({
    offerId: z.string().min(1, 'Offer ID is required'),
  }),
  body: z.object({
    preferenceSetId: z.string().min(1).optional(),
    offeredItemIds: z
      .array(z.string().min(1, 'Item ID is required'))
      .min(1, 'Must offer at least one item')
      .optional(),
  }),
});

// Reject Barter Offer Schema
export const rejectBarterOfferSchema = z.object({
  params: z.object({
    offerId: z.string().min(1, 'Offer ID is required'),
  }),
  body: z.object({
    reason: z
      .string()
      .min(10, 'Rejection reason must be at least 10 characters')
      .max(500, 'Rejection reason must not exceed 500 characters')
      .optional(),
  }),
});

// Cancel Barter Offer Schema
export const cancelBarterOfferSchema = z.object({
  params: z.object({
    offerId: z.string().min(1, 'Offer ID is required'),
  }),
});

// Get Barter Offer by ID Schema
export const getBarterOfferByIdSchema = z.object({
  params: z.object({
    offerId: z.string().min(1, 'Offer ID is required'),
  }),
});

// Get My Barter Offers Schema
export const getMyBarterOffersSchema = z.object({
  query: z.object({
    type: z.enum(['sent', 'received', 'all']).default('all').optional(),
    status: barterOfferStatusEnum.optional(),
    page: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(1))
      .default('1')
      .optional(),
    limit: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(1).max(100))
      .default('20')
      .optional(),
  }),
});

// Search Barterable Items Schema
export const searchBarterableItemsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    categoryId: z.string().min(1).optional(),
    condition: z.string().optional(),
    governorate: z.string().optional(),
    excludeMyItems: z
      .string()
      .transform((val) => val === 'true')
      .default('true')
      .optional(),
    page: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(1))
      .default('1')
      .optional(),
    limit: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(1).max(100))
      .default('20')
      .optional(),
  }),
});

// Find Barter Matches Schema
export const findBarterMatchesSchema = z.object({
  params: z.object({
    itemId: z.string().min(1, 'Item ID is required'),
  }),
  query: z.object({
    categoryId: z.string().min(1).optional(),
    maxDistance: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(1).max(100))
      .default('50')
      .optional(),
  }),
});

// Complete Barter Exchange Schema
export const completeBarterExchangeSchema = z.object({
  params: z.object({
    offerId: z.string().min(1, 'Offer ID is required'),
  }),
  body: z.object({
    confirmationNotes: z
      .string()
      .max(500, 'Confirmation notes must not exceed 500 characters')
      .optional(),
  }),
});

// ============================================
// Multi-Party Barter Chain Validation
// ============================================

// Barter Chain Status validation
const barterChainStatusEnum = z.nativeEnum(BarterChainStatus, {
  errorMap: () => ({ message: 'Invalid barter chain status' }),
});

// Discover Barter Opportunities Schema
export const discoverOpportunitiesSchema = z.object({
  params: z.object({
    itemId: z.string().min(1, 'Item ID is required'),
  }),
});

// Create Smart Proposal Schema
export const createSmartProposalSchema = z.object({
  body: z.object({
    itemId: z.string().min(1, 'Item ID is required'),
    maxParticipants: z
      .number()
      .int()
      .min(3, 'Minimum 3 participants for multi-party barter')
      .max(10, 'Maximum 10 participants allowed')
      .default(5)
      .optional(),
    preferCycles: z.boolean().default(true).optional(),
  }),
});

// Get Barter Chain Schema
export const getBarterChainSchema = z.object({
  params: z.object({
    chainId: z.string().min(1, 'Chain ID is required'),
  }),
});

// Respond to Chain Proposal Schema
export const respondToChainSchema = z.object({
  params: z.object({
    chainId: z.string().min(1, 'Chain ID is required'),
  }),
  body: z.object({
    accept: z.boolean(),
    message: z.string().max(500, 'Message must not exceed 500 characters').optional(),
  }),
});

// Cancel Barter Chain Schema
export const cancelBarterChainSchema = z.object({
  params: z.object({
    chainId: z.string().min(1, 'Chain ID is required'),
  }),
});

// Execute Barter Chain Schema
export const executeBarterChainSchema = z.object({
  params: z.object({
    chainId: z.string().min(1, 'Chain ID is required'),
  }),
});

// Get My Barter Chains Schema
export const getMyBarterChainsSchema = z.object({
  query: z.object({
    status: barterChainStatusEnum.optional(),
    page: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(1))
      .default('1')
      .optional(),
    limit: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(1).max(100))
      .default('20')
      .optional(),
  }),
});

// Get Pending Proposals Schema
export const getPendingProposalsSchema = z.object({
  query: z.object({}),
});

// ============================================
// Bundle & Preference-specific Schemas
// ============================================

// Get Matching Offers Schema
export const getMatchingOffersSchema = z.object({
  query: z.object({
    page: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(1))
      .default('1')
      .optional(),
    limit: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(1).max(100))
      .default('20')
      .optional(),
  }),
});

// Get Best Match For Offer Schema
export const getBestMatchSchema = z.object({
  params: z.object({
    offerId: z.string().min(1, 'Offer ID is required'),
  }),
});
