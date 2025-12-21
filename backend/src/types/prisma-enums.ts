/**
 * Prisma Enum Types and Values - Local Definitions
 * These types and const objects mirror the Prisma schema enums
 * for TypeScript compatibility when Prisma client generation is not available
 */

// ========================================
// User Types
// ========================================
export const UserType = {
  INDIVIDUAL: 'INDIVIDUAL',
  BUSINESS: 'BUSINESS',
} as const;
export type UserType = typeof UserType[keyof typeof UserType];

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED',
} as const;
export type UserStatus = typeof UserStatus[keyof typeof UserStatus];

// ========================================
// Item Types
// ========================================
export const ItemType = {
  GOOD: 'GOOD',
  SERVICE: 'SERVICE',
  CASH: 'CASH',
} as const;
export type ItemType = typeof ItemType[keyof typeof ItemType];

export const ItemCondition = {
  NEW: 'NEW',
  LIKE_NEW: 'LIKE_NEW',
  GOOD: 'GOOD',
  FAIR: 'FAIR',
  POOR: 'POOR',
} as const;
export type ItemCondition = typeof ItemCondition[keyof typeof ItemCondition];

export const ItemStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  SOLD: 'SOLD',
  TRADED: 'TRADED',
  ARCHIVED: 'ARCHIVED',
  RESERVED: 'RESERVED',
  PENDING_REVIEW: 'PENDING_REVIEW',
  REJECTED: 'REJECTED',
  DELETED: 'DELETED',
} as const;
export type ItemStatus = typeof ItemStatus[keyof typeof ItemStatus];

// ========================================
// Market Types
// ========================================
export const MarketType = {
  DISTRICT: 'DISTRICT',
  CITY: 'CITY',
  GOVERNORATE: 'GOVERNORATE',
  NATIONAL: 'NATIONAL',
} as const;
export type MarketType = typeof MarketType[keyof typeof MarketType];

export const PromotionTier = {
  BASIC: 'BASIC',
  FEATURED: 'FEATURED',
  PREMIUM: 'PREMIUM',
  GOLD: 'GOLD',
  PLATINUM: 'PLATINUM',
} as const;
export type PromotionTier = typeof PromotionTier[keyof typeof PromotionTier];

// ========================================
// Listing Types
// ========================================
export const ListingType = {
  DIRECT_SALE: 'DIRECT_SALE',
  AUCTION: 'AUCTION',
  REVERSE_AUCTION: 'REVERSE_AUCTION',
  BARTER: 'BARTER',
  DIRECT_BUY: 'DIRECT_BUY',
} as const;
export type ListingType = typeof ListingType[keyof typeof ListingType];

export const ListingStatus = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
} as const;
export type ListingStatus = typeof ListingStatus[keyof typeof ListingStatus];

// ========================================
// Order Types
// ========================================
export const OrderStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  DISPUTED: 'DISPUTED',
} as const;
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export const PaymentMethod = {
  CASH_ON_DELIVERY: 'CASH_ON_DELIVERY',
  FAWRY: 'FAWRY',
  PAYMOB: 'PAYMOB',
  INSTAPAY: 'INSTAPAY',
  WALLET: 'WALLET',
  BANK_TRANSFER: 'BANK_TRANSFER',
  INSTALLMENT: 'INSTALLMENT',
} as const;
export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

// ========================================
// Barter Types
// ========================================
export const BarterOfferStatus = {
  PENDING: 'PENDING',
  COUNTER_OFFERED: 'COUNTER_OFFERED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;
export type BarterOfferStatus = typeof BarterOfferStatus[keyof typeof BarterOfferStatus];

export const BarterChainStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  REJECTED: 'REJECTED',
  ACCEPTED: 'ACCEPTED',
} as const;
export type BarterChainStatus = typeof BarterChainStatus[keyof typeof BarterChainStatus];

export const ParticipantStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  REJECTED: 'REJECTED',
  DELIVERED: 'DELIVERED',
  RECEIVED: 'RECEIVED',
  ACCEPTED: 'ACCEPTED',
  COMPLETED: 'COMPLETED',
} as const;
export type ParticipantStatus = typeof ParticipantStatus[keyof typeof ParticipantStatus];

export const BarterPoolStatus = {
  OPEN: 'OPEN',
  MATCHING: 'MATCHING',
  LOCKED: 'LOCKED',
  EXECUTING: 'EXECUTING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  MATCHED: 'MATCHED',
  NEGOTIATING: 'NEGOTIATING',
  FAILED: 'FAILED',
} as const;
export type BarterPoolStatus = typeof BarterPoolStatus[keyof typeof BarterPoolStatus];

// ========================================
// Auction Types
// ========================================
export const AuctionStatus = {
  SCHEDULED: 'SCHEDULED',
  ACTIVE: 'ACTIVE',
  ENDED: 'ENDED',
  CANCELLED: 'CANCELLED',
  SOLD: 'SOLD',
  NO_SALE: 'NO_SALE',
  COMPLETED: 'COMPLETED',
} as const;
export type AuctionStatus = typeof AuctionStatus[keyof typeof AuctionStatus];

export const BidStatus = {
  ACTIVE: 'ACTIVE',
  OUTBID: 'OUTBID',
  WINNING: 'WINNING',
  WON: 'WON',
  LOST: 'LOST',
  CANCELLED: 'CANCELLED',
} as const;
export type BidStatus = typeof BidStatus[keyof typeof BidStatus];

export const ReverseAuctionStatus = {
  SCHEDULED: 'SCHEDULED',
  ACTIVE: 'ACTIVE',
  ENDED: 'ENDED',
  CANCELLED: 'CANCELLED',
  AWARDED: 'AWARDED',
  NO_BIDS: 'NO_BIDS',
} as const;
export type ReverseAuctionStatus = typeof ReverseAuctionStatus[keyof typeof ReverseAuctionStatus];

export const ReverseAuctionBidStatus = {
  ACTIVE: 'ACTIVE',
  OUTBID: 'OUTBID',
  WINNING: 'WINNING',
  WON: 'WON',
  LOST: 'LOST',
  WITHDRAWN: 'WITHDRAWN',
} as const;
export type ReverseAuctionBidStatus = typeof ReverseAuctionBidStatus[keyof typeof ReverseAuctionBidStatus];

// ========================================
// Lock Types
// ========================================
export const LockType = {
  SOFT: 'SOFT',
  HARD: 'HARD',
  RESERVED: 'RESERVED',
} as const;
export type LockType = typeof LockType[keyof typeof LockType];

export const LockStatus = {
  ACTIVE: 'ACTIVE',
  RELEASED: 'RELEASED',
  EXPIRED: 'EXPIRED',
} as const;
export type LockStatus = typeof LockStatus[keyof typeof LockStatus];

// ========================================
// Escrow Types
// ========================================
export const EscrowStatus = {
  PENDING: 'PENDING',
  FUNDED: 'FUNDED',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  RELEASED: 'RELEASED',
  DISPUTED: 'DISPUTED',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED',
  CREATED: 'CREATED',
  PENDING_DELIVERY: 'PENDING_DELIVERY',
  INSPECTION: 'INSPECTION',
  EXPIRED: 'EXPIRED',
} as const;
export type EscrowStatus = typeof EscrowStatus[keyof typeof EscrowStatus];

export const EscrowType = {
  ITEM_SALE: 'ITEM_SALE',
  BARTER: 'BARTER',
  SERVICE: 'SERVICE',
  AUCTION: 'AUCTION',
} as const;
export type EscrowType = typeof EscrowType[keyof typeof EscrowType];

export const DisputeStatus = {
  OPEN: 'OPEN',
  UNDER_REVIEW: 'UNDER_REVIEW',
  RESOLVED: 'RESOLVED',
  ESCALATED: 'ESCALATED',
  CLOSED: 'CLOSED',
} as const;
export type DisputeStatus = typeof DisputeStatus[keyof typeof DisputeStatus];

export const DisputeReason = {
  NOT_AS_DESCRIBED: 'NOT_AS_DESCRIBED',
  NOT_RECEIVED: 'NOT_RECEIVED',
  DAMAGED: 'DAMAGED',
  WRONG_ITEM: 'WRONG_ITEM',
  QUALITY_ISSUE: 'QUALITY_ISSUE',
  OTHER: 'OTHER',
} as const;
export type DisputeReason = typeof DisputeReason[keyof typeof DisputeReason];

export const DisputeResolution = {
  FULL_REFUND: 'FULL_REFUND',
  PARTIAL_REFUND: 'PARTIAL_REFUND',
  REPLACEMENT: 'REPLACEMENT',
  NO_ACTION: 'NO_ACTION',
  MUTUAL_AGREEMENT: 'MUTUAL_AGREEMENT',
  BUYER_FAVORED: 'BUYER_FAVORED',
  SELLER_FAVORED: 'SELLER_FAVORED',
} as const;
export type DisputeResolution = typeof DisputeResolution[keyof typeof DisputeResolution];

// ========================================
// Badge Types
// ========================================
export const BadgeType = {
  PHONE_VERIFIED: 'PHONE_VERIFIED',
  EMAIL_VERIFIED: 'EMAIL_VERIFIED',
  ID_VERIFIED: 'ID_VERIFIED',
  ADDRESS_VERIFIED: 'ADDRESS_VERIFIED',
  BUSINESS_VERIFIED: 'BUSINESS_VERIFIED',
  TRUSTED_SELLER: 'TRUSTED_SELLER',
  SUPER_SELLER: 'SUPER_SELLER',
  POWER_TRADER: 'POWER_TRADER',
  EARLY_ADOPTER: 'EARLY_ADOPTER',
  COMMUNITY_LEADER: 'COMMUNITY_LEADER',
  TRADE_MASTER: 'TRADE_MASTER',
  QUALITY_CHAMPION: 'QUALITY_CHAMPION',
  QUICK_RESPONDER: 'QUICK_RESPONDER',
  BARTER_PRO: 'BARTER_PRO',
  DEAL_MAKER: 'DEAL_MAKER',
} as const;
export type BadgeType = typeof BadgeType[keyof typeof BadgeType];

// ========================================
// Cash Flow Types
// ========================================
export const CashFlowStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED',
} as const;
export type CashFlowStatus = typeof CashFlowStatus[keyof typeof CashFlowStatus];

export const CashFlowType = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAWAL: 'WITHDRAWAL',
  TRANSFER: 'TRANSFER',
  PAYMENT: 'PAYMENT',
  REFUND: 'REFUND',
  FEE: 'FEE',
  ADJUSTMENT: 'ADJUSTMENT',
  CHAIN_BALANCE: 'CHAIN_BALANCE',
  COMMISSION: 'COMMISSION',
} as const;
export type CashFlowType = typeof CashFlowType[keyof typeof CashFlowType];

// ========================================
// Facilitator Types
// ========================================
export const FacilitatorLevel = {
  BRONZE: 'BRONZE',
  SILVER: 'SILVER',
  GOLD: 'GOLD',
  PLATINUM: 'PLATINUM',
} as const;
export type FacilitatorLevel = typeof FacilitatorLevel[keyof typeof FacilitatorLevel];

export const FacilitatorStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  INACTIVE: 'INACTIVE',
  REVOKED: 'REVOKED',
} as const;
export type FacilitatorStatus = typeof FacilitatorStatus[keyof typeof FacilitatorStatus];

// ========================================
// Field Inspection Types
// ========================================
export const InspectionType = {
  STANDARD: 'STANDARD',
  COMPREHENSIVE: 'COMPREHENSIVE',
  TECHNICAL: 'TECHNICAL',
  SPECIALIZED: 'SPECIALIZED',
  PRE_PURCHASE: 'PRE_PURCHASE',
  FINAL: 'FINAL',
  BASIC: 'BASIC',
  PRE_RENTAL: 'PRE_RENTAL',
  CHECKIN: 'CHECKIN',
  CHECKOUT: 'CHECKOUT',
} as const;
export type InspectionType = typeof InspectionType[keyof typeof InspectionType];

export const InspectionStatus = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
  REQUESTED: 'REQUESTED',
} as const;
export type InspectionStatus = typeof InspectionStatus[keyof typeof InspectionStatus];

export const InspectionRecommendation = {
  APPROVE: 'APPROVE',
  APPROVE_WITH_CONDITIONS: 'APPROVE_WITH_CONDITIONS',
  REJECT: 'REJECT',
  REQUIRES_REVIEW: 'REQUIRES_REVIEW',
  DEFER: 'DEFER',
} as const;
export type InspectionRecommendation = typeof InspectionRecommendation[keyof typeof InspectionRecommendation];

export const PropertyStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  AVAILABLE: 'AVAILABLE',
  UNDER_OFFER: 'UNDER_OFFER',
  RESERVED: 'RESERVED',
  SOLD: 'SOLD',
  RENTED: 'RENTED',
  OFF_MARKET: 'OFF_MARKET',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  REJECTED: 'REJECTED',
} as const;
export type PropertyStatus = typeof PropertyStatus[keyof typeof PropertyStatus];

export const PropertyVerificationLevel = {
  UNVERIFIED: 'UNVERIFIED',
  BASIC: 'BASIC',
  STANDARD: 'STANDARD',
  PREMIUM: 'PREMIUM',
  CERTIFIED: 'CERTIFIED',
  FIELD_VERIFIED: 'FIELD_VERIFIED',
  DOCUMENTS_VERIFIED: 'DOCUMENTS_VERIFIED',
  GOVERNMENT_VERIFIED: 'GOVERNMENT_VERIFIED',
} as const;
export type PropertyVerificationLevel = typeof PropertyVerificationLevel[keyof typeof PropertyVerificationLevel];

export const PropertyType = {
  APARTMENT: 'APARTMENT',
  VILLA: 'VILLA',
  TOWNHOUSE: 'TOWNHOUSE',
  TWIN_HOUSE: 'TWIN_HOUSE',
  DUPLEX: 'DUPLEX',
  PENTHOUSE: 'PENTHOUSE',
  STUDIO: 'STUDIO',
  CHALET: 'CHALET',
  LAND: 'LAND',
  OFFICE: 'OFFICE',
  SHOP: 'SHOP',
  WAREHOUSE: 'WAREHOUSE',
  BUILDING: 'BUILDING',
  FARM: 'FARM',
  ROOF: 'ROOF',
} as const;
export type PropertyType = typeof PropertyType[keyof typeof PropertyType];

export const TitleType = {
  REGISTERED: 'REGISTERED',
  PRELIMINARY: 'PRELIMINARY',
  POA: 'POA',
} as const;
export type TitleType = typeof TitleType[keyof typeof TitleType];

export const FinishingLevel = {
  SUPER_LUX: 'SUPER_LUX',
  LUX: 'LUX',
  SEMI_FINISHED: 'SEMI_FINISHED',
  UNFINISHED: 'UNFINISHED',
  CORE_SHELL: 'CORE_SHELL',
} as const;
export type FinishingLevel = typeof FinishingLevel[keyof typeof FinishingLevel];

export const FurnishedStatus = {
  FURNISHED: 'FURNISHED',
  SEMI_FURNISHED: 'SEMI_FURNISHED',
  UNFURNISHED: 'UNFURNISHED',
} as const;
export type FurnishedStatus = typeof FurnishedStatus[keyof typeof FurnishedStatus];

export const PropertyListingType = {
  SALE: 'SALE',
  RENT: 'RENT',
  BOTH: 'BOTH',
} as const;
export type PropertyListingType = typeof PropertyListingType[keyof typeof PropertyListingType];

export const PropertyDeliveryStatus = {
  READY: 'READY',
  UNDER_CONSTRUCTION: 'UNDER_CONSTRUCTION',
  OFF_PLAN: 'OFF_PLAN',
} as const;
export type PropertyDeliveryStatus = typeof PropertyDeliveryStatus[keyof typeof PropertyDeliveryStatus];

export const PropertyEscrowStatus = {
  NOT_INITIATED: 'NOT_INITIATED',
  PENDING_DEPOSIT: 'PENDING_DEPOSIT',
  DEPOSITED: 'DEPOSITED',
  VERIFICATION_IN_PROGRESS: 'VERIFICATION_IN_PROGRESS',
  VERIFIED: 'VERIFIED',
  RELEASED: 'RELEASED',
  REFUNDED: 'REFUNDED',
  DISPUTED: 'DISPUTED',
} as const;
export type PropertyEscrowStatus = typeof PropertyEscrowStatus[keyof typeof PropertyEscrowStatus];

export const PropertyBarterStatus = {
  PENDING: 'PENDING',
  VIEWED: 'VIEWED',
  COUNTER_OFFERED: 'COUNTER_OFFERED',
  ACCEPTED: 'ACCEPTED',
  APPRAISAL_PENDING: 'APPRAISAL_PENDING',
  LEGAL_REVIEW: 'LEGAL_REVIEW',
  ESCROW_PENDING: 'ESCROW_PENDING',
  REGISTRATION_PENDING: 'REGISTRATION_PENDING',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
} as const;
export type PropertyBarterStatus = typeof PropertyBarterStatus[keyof typeof PropertyBarterStatus];

export const RentalContractStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  RENEWED: 'RENEWED',
  TERMINATED: 'TERMINATED',
  EXPIRED: 'EXPIRED',
  DISPUTED: 'DISPUTED',
} as const;
export type RentalContractStatus = typeof RentalContractStatus[keyof typeof RentalContractStatus];

export const RentalContractType = {
  NEW_RENT: 'NEW_RENT',
  OLD_RENT: 'OLD_RENT',
} as const;
export type RentalContractType = typeof RentalContractType[keyof typeof RentalContractType];

// ========================================
// Scrap Marketplace Types
// ========================================
export const ScrapType = {
  ELECTRONICS: 'ELECTRONICS',
  HOME_APPLIANCES: 'HOME_APPLIANCES',
  COMPUTERS: 'COMPUTERS',
  PHONES: 'PHONES',
  CABLES_WIRES: 'CABLES_WIRES',
  MOTORS: 'MOTORS',
  BATTERIES: 'BATTERIES',
  METAL_SCRAP: 'METAL_SCRAP',
  CAR_PARTS: 'CAR_PARTS',
  FURNITURE_PARTS: 'FURNITURE_PARTS',
  WOOD: 'WOOD',
  PLASTIC: 'PLASTIC',
  TEXTILES: 'TEXTILES',
  PAPER: 'PAPER',
  GLASS: 'GLASS',
  OTHER: 'OTHER',
} as const;
export type ScrapType = typeof ScrapType[keyof typeof ScrapType];

export const ScrapCondition = {
  TOTALLY_DAMAGED: 'TOTALLY_DAMAGED',
  NOT_WORKING: 'NOT_WORKING',
  PARTIALLY_WORKING: 'PARTIALLY_WORKING',
  WORKING_OLD: 'WORKING_OLD',
} as const;
export type ScrapCondition = typeof ScrapCondition[keyof typeof ScrapCondition];

export const MetalType = {
  COPPER: 'COPPER',
  ALUMINUM: 'ALUMINUM',
  IRON: 'IRON',
  STEEL: 'STEEL',
  BRASS: 'BRASS',
  BRONZE: 'BRONZE',
  LEAD: 'LEAD',
  ZINC: 'ZINC',
  NICKEL: 'NICKEL',
  TIN: 'TIN',
  GOLD: 'GOLD',
  SILVER: 'SILVER',
  STAINLESS_STEEL: 'STAINLESS_STEEL',
  MIXED: 'MIXED',
} as const;
export type MetalType = typeof MetalType[keyof typeof MetalType];

export const ScrapPricingType = {
  PER_PIECE: 'PER_PIECE',
  PER_KG: 'PER_KG',
  PER_LOT: 'PER_LOT',
  REVERSE_AUCTION: 'REVERSE_AUCTION',
} as const;
export type ScrapPricingType = typeof ScrapPricingType[keyof typeof ScrapPricingType];

export const ScrapDealerType = {
  INDIVIDUAL_COLLECTOR: 'INDIVIDUAL_COLLECTOR',
  SCRAP_DEALER: 'SCRAP_DEALER',
  RECYCLING_COMPANY: 'RECYCLING_COMPANY',
  REPAIR_TECHNICIAN: 'REPAIR_TECHNICIAN',
  FACTORY: 'FACTORY',
  EXPORT_COMPANY: 'EXPORT_COMPANY',
} as const;
export type ScrapDealerType = typeof ScrapDealerType[keyof typeof ScrapDealerType];

export const ScrapDealerStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
} as const;
export type ScrapDealerStatus = typeof ScrapDealerStatus[keyof typeof ScrapDealerStatus];

// ========================================
// Admin Types (match Prisma schema exactly)
// ========================================
export const AdminRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  SUPPORT: 'SUPPORT',
} as const;
export type AdminRole = typeof AdminRole[keyof typeof AdminRole];

export const AdminStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED',
} as const;
export type AdminStatus = typeof AdminStatus[keyof typeof AdminStatus];

// ========================================
// Mobile Types
// ========================================
export const MobileBrand = {
  APPLE: 'APPLE',
  SAMSUNG: 'SAMSUNG',
  HUAWEI: 'HUAWEI',
  XIAOMI: 'XIAOMI',
  OPPO: 'OPPO',
  VIVO: 'VIVO',
  REALME: 'REALME',
  ONEPLUS: 'ONEPLUS',
  GOOGLE: 'GOOGLE',
  NOKIA: 'NOKIA',
  MOTOROLA: 'MOTOROLA',
  LG: 'LG',
  SONY: 'SONY',
  ASUS: 'ASUS',
  HONOR: 'HONOR',
  INFINIX: 'INFINIX',
  TECNO: 'TECNO',
  OTHER: 'OTHER',
} as const;
export type MobileBrand = typeof MobileBrand[keyof typeof MobileBrand];

export const MobileListingStatus = {
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  ACTIVE: 'ACTIVE',
  SOLD: 'SOLD',
  BARTERED: 'BARTERED',
  RESERVED: 'RESERVED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
} as const;
export type MobileListingStatus = typeof MobileListingStatus[keyof typeof MobileListingStatus];

export const MobileTransactionStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  DISPUTED: 'DISPUTED',
} as const;
export type MobileTransactionStatus = typeof MobileTransactionStatus[keyof typeof MobileTransactionStatus];

export const MobileBarterProposalStatus = {
  PENDING: 'PENDING',
  COUNTER_OFFERED: 'COUNTER_OFFERED',
  COUNTERED: 'COUNTERED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;
export type MobileBarterProposalStatus = typeof MobileBarterProposalStatus[keyof typeof MobileBarterProposalStatus];

// ========================================
// Notification Types
// ========================================
export const NotificationType = {
  SYSTEM: 'SYSTEM',
  SYSTEM_ANNOUNCEMENT: 'SYSTEM_ANNOUNCEMENT',
  MESSAGE: 'MESSAGE',
  OFFER: 'OFFER',
  ORDER: 'ORDER',
  PAYMENT: 'PAYMENT',
  REVIEW: 'REVIEW',
  USER_REVIEW_RECEIVED: 'USER_REVIEW_RECEIVED',
  ALERT: 'ALERT',
  PROMOTION: 'PROMOTION',
  BARTER_MATCH: 'BARTER_MATCH',
  AUCTION_OUTBID: 'AUCTION_OUTBID',
  REVERSE_AUCTION_AWARDED: 'REVERSE_AUCTION_AWARDED',
} as const;
export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export const NotificationChannel = {
  IN_APP: 'IN_APP',
  PUSH: 'PUSH',
  EMAIL: 'EMAIL',
  SMS: 'SMS',
} as const;
export type NotificationChannel = typeof NotificationChannel[keyof typeof NotificationChannel];

export const NotificationPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;
export type NotificationPriority = typeof NotificationPriority[keyof typeof NotificationPriority];

// ========================================
// Payment Types
// ========================================
export const TransactionType = {
  PAYMENT: 'PAYMENT',
  REFUND: 'REFUND',
  TRANSFER: 'TRANSFER',
  WITHDRAWAL: 'WITHDRAWAL',
} as const;
export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

export const PaymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;
export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export const DeliveryStatus = {
  PENDING: 'PENDING',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
} as const;
export type DeliveryStatus = typeof DeliveryStatus[keyof typeof DeliveryStatus];

// ========================================
// Review Types
// ========================================
export const ReviewStatus = {
  PENDING: 'PENDING',
  PUBLISHED: 'PUBLISHED',
  HIDDEN: 'HIDDEN',
  REMOVED: 'REMOVED',
} as const;
export type ReviewStatus = typeof ReviewStatus[keyof typeof ReviewStatus];

export const ReviewType = {
  BUYER: 'BUYER',
  SELLER: 'SELLER',
} as const;
export type ReviewType = typeof ReviewType[keyof typeof ReviewType];

// ========================================
// Wallet Types
// ========================================
export const WalletTransactionType = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAWAL: 'WITHDRAWAL',
  TRANSFER_IN: 'TRANSFER_IN',
  TRANSFER_OUT: 'TRANSFER_OUT',
  SENT_TO_USER: 'SENT_TO_USER',
  RECEIVED_FROM_USER: 'RECEIVED_FROM_USER',
  PAYMENT: 'PAYMENT',
  REFUND: 'REFUND',
  ESCROW_HOLD: 'ESCROW_HOLD',
  ESCROW_RELEASE: 'ESCROW_RELEASE',
  ESCROW_FREEZE: 'ESCROW_FREEZE',
  ESCROW_REFUND: 'ESCROW_REFUND',
  CASHBACK: 'CASHBACK',
  BONUS: 'BONUS',
  FEE: 'FEE',
  REWARD_SIGNUP: 'REWARD_SIGNUP',
  REWARD_FIRST_DEAL: 'REWARD_FIRST_DEAL',
  REWARD_REFERRAL: 'REWARD_REFERRAL',
  REWARD_REVIEW: 'REWARD_REVIEW',
  REWARD_DAILY_LOGIN: 'REWARD_DAILY_LOGIN',
  REWARD_ACHIEVEMENT: 'REWARD_ACHIEVEMENT',
  REWARD_CHALLENGE: 'REWARD_CHALLENGE',
  PROMOTE_LISTING: 'PROMOTE_LISTING',
  UNLOCK_CONTACT: 'UNLOCK_CONTACT',
} as const;
export type WalletTransactionType = typeof WalletTransactionType[keyof typeof WalletTransactionType];

export const WalletTransactionStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REVERSED: 'REVERSED',
} as const;
export type WalletTransactionStatus = typeof WalletTransactionStatus[keyof typeof WalletTransactionStatus];

// ========================================
// Trust Types
// ========================================
export const TrustLevel = {
  NEW: 'NEW',
  NEWCOMER: 'NEWCOMER',
  BASIC: 'BASIC',
  BRONZE: 'BRONZE',
  SILVER: 'SILVER',
  VERIFIED: 'VERIFIED',
  TRUSTED: 'TRUSTED',
  PREMIUM: 'PREMIUM',
  GOLD: 'GOLD',
  PLATINUM: 'PLATINUM',
  DIAMOND: 'DIAMOND',
  ELITE: 'ELITE',
} as const;
export type TrustLevel = typeof TrustLevel[keyof typeof TrustLevel];

// ========================================
// Verification Types
// ========================================
export const VerificationLevel = {
  NONE: 'NONE',
  UNVERIFIED: 'UNVERIFIED',
  BASIC: 'BASIC',
  EMAIL: 'EMAIL',
  PHONE: 'PHONE',
  ID: 'ID',
  VERIFIED: 'VERIFIED',
  BUSINESS: 'BUSINESS',
  PREMIUM: 'PREMIUM',
  TRUSTED: 'TRUSTED',
  FULL: 'FULL',
} as const;
export type VerificationLevel = typeof VerificationLevel[keyof typeof VerificationLevel];

export const VerificationStatus = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
} as const;
export type VerificationStatus = typeof VerificationStatus[keyof typeof VerificationStatus];

// ========================================
// Service Types
// ========================================
export const ServiceCategory = {
  TRANSPORT: 'TRANSPORT',
  INSTALLATION: 'INSTALLATION',
  REPAIR: 'REPAIR',
  CLEANING: 'CLEANING',
  ASSEMBLY: 'ASSEMBLY',
  INSPECTION: 'INSPECTION',
  OTHER: 'OTHER',
} as const;
export type ServiceCategory = typeof ServiceCategory[keyof typeof ServiceCategory];

export const ServiceRequestStatus = {
  PENDING: 'PENDING',
  QUOTED: 'QUOTED',
  ACCEPTED: 'ACCEPTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  DISPUTED: 'DISPUTED',
} as const;
export type ServiceRequestStatus = typeof ServiceRequestStatus[keyof typeof ServiceRequestStatus];

export const ServiceQuoteStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
  WITHDRAWN: 'WITHDRAWN',
} as const;
export type ServiceQuoteStatus = typeof ServiceQuoteStatus[keyof typeof ServiceQuoteStatus];

// ========================================
// Flash Deal Types
// ========================================
export const FlashDealStatus = {
  SCHEDULED: 'SCHEDULED',
  ACTIVE: 'ACTIVE',
  ENDED: 'ENDED',
  SOLD_OUT: 'SOLD_OUT',
  CANCELLED: 'CANCELLED',
} as const;
export type FlashDealStatus = typeof FlashDealStatus[keyof typeof FlashDealStatus];

// ========================================
// Gamification Types
// ========================================
export const AchievementCategory = {
  TRADING: 'TRADING',
  BARTER: 'BARTER',
  SOCIAL: 'SOCIAL',
  REPUTATION: 'REPUTATION',
  SPECIAL: 'SPECIAL',
  SEASONAL: 'SEASONAL',
} as const;
export type AchievementCategory = typeof AchievementCategory[keyof typeof AchievementCategory];

export const AchievementRarity = {
  COMMON: 'COMMON',
  UNCOMMON: 'UNCOMMON',
  RARE: 'RARE',
  EPIC: 'EPIC',
  LEGENDARY: 'LEGENDARY',
} as const;
export type AchievementRarity = typeof AchievementRarity[keyof typeof AchievementRarity];

export const ChallengeType = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  SPECIAL: 'SPECIAL',
} as const;
export type ChallengeType = typeof ChallengeType[keyof typeof ChallengeType];

// ========================================
// Group Buy Types
// ========================================
export const GroupBuyStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  TARGET_REACHED: 'TARGET_REACHED',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;
export type GroupBuyStatus = typeof GroupBuyStatus[keyof typeof GroupBuyStatus];

// ========================================
// Subscription Types
// ========================================
export const SubscriptionTier = {
  FREE: 'FREE',
  BASIC: 'BASIC',
  PROFESSIONAL: 'PROFESSIONAL',
  BUSINESS: 'BUSINESS',
  ENTERPRISE: 'ENTERPRISE',
} as const;
export type SubscriptionTier = typeof SubscriptionTier[keyof typeof SubscriptionTier];

export const SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  PAUSED: 'PAUSED',
  PENDING: 'PENDING',
} as const;
export type SubscriptionStatus = typeof SubscriptionStatus[keyof typeof SubscriptionStatus];

// ========================================
// Warranty Types
// ========================================
export const WarrantyType = {
  SELLER_WARRANTY: 'SELLER_WARRANTY',
  PLATFORM_WARRANTY: 'PLATFORM_WARRANTY',
  EXTENDED_WARRANTY: 'EXTENDED_WARRANTY',
  INSURANCE: 'INSURANCE',
} as const;
export type WarrantyType = typeof WarrantyType[keyof typeof WarrantyType];

export const WarrantyStatus = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  CLAIMED: 'CLAIMED',
  VOIDED: 'VOIDED',
} as const;
export type WarrantyStatus = typeof WarrantyStatus[keyof typeof WarrantyStatus];

export const WarrantyClaimStatus = {
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  CLOSED: 'CLOSED',
  REFUNDED: 'REFUNDED',
  REPLACED: 'REPLACED',
} as const;
export type WarrantyClaimStatus = typeof WarrantyClaimStatus[keyof typeof WarrantyClaimStatus];

// ========================================
// Product Authenticity Types
// ========================================
export const AuthenticityStatus = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  SUSPICIOUS: 'SUSPICIOUS',
  COUNTERFEIT: 'COUNTERFEIT',
  INCONCLUSIVE: 'INCONCLUSIVE',
} as const;
export type AuthenticityStatus = typeof AuthenticityStatus[keyof typeof AuthenticityStatus];

// ========================================
// Gold Types
// ========================================
export const GoldKarat = {
  K24: 'K24',
  K22: 'K22',
  K21: 'K21',
  K18: 'K18',
  K14: 'K14',
  K10: 'K10',
  K9: 'K9',
} as const;
export type GoldKarat = typeof GoldKarat[keyof typeof GoldKarat];

export const GoldItemCategory = {
  JEWELRY: 'JEWELRY',
  COINS: 'COINS',
  BARS: 'BARS',
  BULLION: 'BULLION',
  SCRAP: 'SCRAP',
  ANTIQUE: 'ANTIQUE',
  ACCESSORIES: 'ACCESSORIES',
  OTHER: 'OTHER',
} as const;
export type GoldItemCategory = typeof GoldItemCategory[keyof typeof GoldItemCategory];

export const GoldItemCondition = {
  NEW: 'NEW',
  EXCELLENT: 'EXCELLENT',
  GOOD: 'GOOD',
  FAIR: 'FAIR',
  WORN: 'WORN',
} as const;
export type GoldItemCondition = typeof GoldItemCondition[keyof typeof GoldItemCondition];

export const GoldVerificationLevel = {
  UNVERIFIED: 'UNVERIFIED',
  SELLER_VERIFIED: 'SELLER_VERIFIED',
  JEWELER_VERIFIED: 'JEWELER_VERIFIED',
  CERTIFIED: 'CERTIFIED',
  HALLMARKED: 'HALLMARKED',
} as const;
export type GoldVerificationLevel = typeof GoldVerificationLevel[keyof typeof GoldVerificationLevel];

export const GoldListingStatus = {
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  ACTIVE: 'ACTIVE',
  SOLD: 'SOLD',
  RESERVED: 'RESERVED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
} as const;
export type GoldListingStatus = typeof GoldListingStatus[keyof typeof GoldListingStatus];

export const GoldTransactionStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PAID: 'PAID',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  DISPUTED: 'DISPUTED',
  REFUNDED: 'REFUNDED',
} as const;
export type GoldTransactionStatus = typeof GoldTransactionStatus[keyof typeof GoldTransactionStatus];

export const GoldDeliveryMethod = {
  PICKUP: 'PICKUP',
  STANDARD_DELIVERY: 'STANDARD_DELIVERY',
  SECURE_DELIVERY: 'SECURE_DELIVERY',
  INSURED_DELIVERY: 'INSURED_DELIVERY',
  ESCROW_MEETUP: 'ESCROW_MEETUP',
} as const;
export type GoldDeliveryMethod = typeof GoldDeliveryMethod[keyof typeof GoldDeliveryMethod];

// ========================================
// Rental Types
// ========================================
export const RentalPaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;
export type RentalPaymentStatus = typeof RentalPaymentStatus[keyof typeof RentalPaymentStatus];

export const RentalDisputeStatus = {
  OPEN: 'OPEN',
  UNDER_REVIEW: 'UNDER_REVIEW',
  RESOLVED: 'RESOLVED',
  ESCALATED: 'ESCALATED',
  CLOSED: 'CLOSED',
} as const;
export type RentalDisputeStatus = typeof RentalDisputeStatus[keyof typeof RentalDisputeStatus];

// ========================================
// Prisma Model Type Placeholders
// ========================================
// These interfaces provide type definitions when Prisma client is not generated

export interface RentalContract {
  id: string;
  propertyId: string;
  landlordId: string;
  tenantId: string;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  securityDeposit: number;
  annualIncreasePercent: number | null;
  protectDeposit: boolean;
  requireCheckinInspection: boolean;
  contractType: RentalContractType;
  status: RentalContractStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RentalPayment {
  id: string;
  contractId: string;
  amount: number;
  dueDate: Date;
  paidDate: Date | null;
  status: RentalPaymentStatus;
  paymentMethod: string | null;
  transactionId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  propertyType: PropertyType;
  titleType: TitleType | null;
  governorate: string;
  city: string;
  district: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  areaSqm: number | null;
  buildingAge: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  totalFloors: number | null;
  finishingLevel: FinishingLevel | null;
  furnishedStatus: FurnishedStatus | null;
  amenities: string[];
  images: string[];
  documents: string[];
  listingType: PropertyListingType;
  salePrice: number | null;
  monthlyRent: number | null;
  estimatedValue: number | null;
  openForBarter: boolean;
  barterPreferences: Record<string, unknown> | null;
  verificationLevel: PropertyVerificationLevel;
  status: PropertyStatus;
  viewsCount: number;
  favoritesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  phone: string;
  email: string | null;
  fullName: string | null;
  avatar: string | null;
  businessName: string | null;
  userType: UserType;
  status: UserStatus;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FieldInspection {
  id: string;
  propertyId: string | null;
  itemId: string | null;
  requesterId: string;
  inspectorId: string | null;
  type: InspectionType;
  status: InspectionStatus;
  scheduledAt: Date | null;
  completedAt: Date | null;
  report: Record<string, unknown> | null;
  recommendation: InspectionRecommendation | null;
  photos: string[];
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RentalDispute {
  id: string;
  contractId: string;
  raisedById: string;
  type: string;
  description: string;
  evidence: string[];
  status: RentalDisputeStatus;
  resolution: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  icon: string | null;
  image: string | null;
  parentId: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;
  sellerId: string;
  categoryId: string | null;
  title: string;
  description: string | null;
  condition: ItemCondition;
  type: ItemType;
  status: ItemStatus;
  images: string[];
  videos: string[];
  basePrice: number | null;
  currency: string;
  location: string | null;
  governorate: string | null;
  city: string | null;
  viewsCount: number;
  favoritesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Listing {
  id: string;
  itemId: string;
  sellerId: string;
  listingType: ListingType;
  status: ListingStatus;
  price: number | null;
  currency: string;
  minPrice: number | null;
  maxPrice: number | null;
  negotiable: boolean;
  expiresAt: Date | null;
  promotionTier: PromotionTier | null;
  promotedAt: Date | null;
  promotionExpiresAt: Date | null;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus | null;
  paidAt: Date | null;
  deliveryStatus: DeliveryStatus | null;
  deliveredAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
