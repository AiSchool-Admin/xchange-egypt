import { z } from 'zod';
import { BarterOfferStatus, BarterChainStatus } from '@prisma/client';

// Barter Offer Status validation
const barterOfferStatusEnum = z.nativeEnum(BarterOfferStatus, {
  errorMap: () => ({ message: 'Invalid barter offer status' }),
});

// Create Barter Offer Schema
export const createBarterOfferSchema = z.object({
  body: z.object({
    offeredItemId: z.string().uuid('Invalid offered item ID'),
    requestedItemId: z.string().uuid('Invalid requested item ID'),
    notes: z
      .string()
      .max(1000, 'Notes must not exceed 1000 characters')
      .optional(),
    expiresAt: z
      .string()
      .datetime('Invalid expiration date')
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
  }).refine(
    (data) => data.offeredItemId !== data.requestedItemId,
    {
      message: 'Cannot offer and request the same item',
      path: ['requestedItemId'],
    }
  ),
});

// Create Counter Offer Schema
export const createCounterOfferSchema = z.object({
  params: z.object({
    offerId: z.string().uuid('Invalid offer ID'),
  }),
  body: z.object({
    counterOfferItemId: z.string().uuid('Invalid counter offer item ID'),
    notes: z
      .string()
      .max(1000, 'Notes must not exceed 1000 characters')
      .optional(),
  }),
});

// Accept Barter Offer Schema
export const acceptBarterOfferSchema = z.object({
  params: z.object({
    offerId: z.string().uuid('Invalid offer ID'),
  }),
});

// Reject Barter Offer Schema
export const rejectBarterOfferSchema = z.object({
  params: z.object({
    offerId: z.string().uuid('Invalid offer ID'),
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
    offerId: z.string().uuid('Invalid offer ID'),
  }),
});

// Get Barter Offer by ID Schema
export const getBarterOfferByIdSchema = z.object({
  params: z.object({
    offerId: z.string().uuid('Invalid offer ID'),
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
    categoryId: z.string().uuid('Invalid category ID').optional(),
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
    itemId: z.string().uuid('Invalid item ID'),
  }),
  query: z.object({
    categoryId: z.string().uuid('Invalid category ID').optional(),
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
    offerId: z.string().uuid('Invalid offer ID'),
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
    itemId: z.string().uuid('Invalid item ID'),
  }),
});

// Create Smart Proposal Schema
export const createSmartProposalSchema = z.object({
  body: z.object({
    itemId: z.string().uuid('Invalid item ID'),
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
    chainId: z.string().uuid('Invalid chain ID'),
  }),
});

// Respond to Chain Proposal Schema
export const respondToChainSchema = z.object({
  params: z.object({
    chainId: z.string().uuid('Invalid chain ID'),
  }),
  body: z.object({
    accept: z.boolean(),
    message: z.string().max(500, 'Message must not exceed 500 characters').optional(),
  }),
});

// Cancel Barter Chain Schema
export const cancelBarterChainSchema = z.object({
  params: z.object({
    chainId: z.string().uuid('Invalid chain ID'),
  }),
});

// Execute Barter Chain Schema
export const executeBarterChainSchema = z.object({
  params: z.object({
    chainId: z.string().uuid('Invalid chain ID'),
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
