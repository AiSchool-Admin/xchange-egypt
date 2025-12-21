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
} as const;
export type BarterChainStatus = typeof BarterChainStatus[keyof typeof BarterChainStatus];

export const ParticipantStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  REJECTED: 'REJECTED',
  DELIVERED: 'DELIVERED',
  RECEIVED: 'RECEIVED',
} as const;
export type ParticipantStatus = typeof ParticipantStatus[keyof typeof ParticipantStatus];

export const BarterPoolStatus = {
  OPEN: 'OPEN',
  MATCHING: 'MATCHING',
  LOCKED: 'LOCKED',
  EXECUTING: 'EXECUTING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
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
  EXCHANGE: 'EXCHANGE',
  ESCROW: 'ESCROW',
  CHAIN: 'CHAIN',
  AUCTION: 'AUCTION',
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
  CANCELLED: 'CANCELLED',
  DISPUTED: 'DISPUTED',
  REFUNDED: 'REFUNDED',
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
} as const;
export type InspectionType = typeof InspectionType[keyof typeof InspectionType];

export const InspectionStatus = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
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
  AVAILABLE: 'AVAILABLE',
  UNDER_OFFER: 'UNDER_OFFER',
  SOLD: 'SOLD',
  RENTED: 'RENTED',
  OFF_MARKET: 'OFF_MARKET',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
} as const;
export type PropertyStatus = typeof PropertyStatus[keyof typeof PropertyStatus];

export const PropertyVerificationLevel = {
  UNVERIFIED: 'UNVERIFIED',
  BASIC: 'BASIC',
  STANDARD: 'STANDARD',
  PREMIUM: 'PREMIUM',
  CERTIFIED: 'CERTIFIED',
} as const;
export type PropertyVerificationLevel = typeof PropertyVerificationLevel[keyof typeof PropertyVerificationLevel];

// ========================================
// Admin Types
// ========================================
export const AdminRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  SUPPORT: 'SUPPORT',
  ANALYST: 'ANALYST',
} as const;
export type AdminRole = typeof AdminRole[keyof typeof AdminRole];

export const AdminStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  INACTIVE: 'INACTIVE',
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
  MESSAGE: 'MESSAGE',
  OFFER: 'OFFER',
  ORDER: 'ORDER',
  PAYMENT: 'PAYMENT',
  REVIEW: 'REVIEW',
  ALERT: 'ALERT',
  PROMOTION: 'PROMOTION',
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
  PAYMENT: 'PAYMENT',
  REFUND: 'REFUND',
  ESCROW_HOLD: 'ESCROW_HOLD',
  ESCROW_RELEASE: 'ESCROW_RELEASE',
  CASHBACK: 'CASHBACK',
  BONUS: 'BONUS',
  FEE: 'FEE',
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
  BASIC: 'BASIC',
  VERIFIED: 'VERIFIED',
  TRUSTED: 'TRUSTED',
  PREMIUM: 'PREMIUM',
} as const;
export type TrustLevel = typeof TrustLevel[keyof typeof TrustLevel];

// ========================================
// Verification Types
// ========================================
export const VerificationLevel = {
  NONE: 'NONE',
  EMAIL: 'EMAIL',
  PHONE: 'PHONE',
  ID: 'ID',
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
