// ============================================
// Xchange Services Marketplace - Type Definitions
// تعريفات الأنواع لسوق الخدمات
// ============================================

// ============================================
// Enums
// ============================================

export enum ServiceProviderStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  VERIFIED = 'VERIFIED',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED',
  BANNED = 'BANNED',
}

export enum VerificationLevel {
  BASIC = 'BASIC',
  TRUSTED = 'TRUSTED',
  PRO = 'PRO',
  ELITE = 'ELITE',
  XCHANGE_CERTIFIED = 'XCHANGE_CERTIFIED',
}

export enum ProviderSubscriptionTier {
  FREE = 'FREE',
  TRUSTED = 'TRUSTED',
  PRO = 'PRO',
  ELITE = 'ELITE',
}

export enum ServicePricingType {
  FIXED = 'FIXED',
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  QUOTE_BASED = 'QUOTE_BASED',
  STARTING_FROM = 'STARTING_FROM',
  PACKAGE = 'PACKAGE',
}

export enum ServiceLocationType {
  AT_PROVIDER = 'AT_PROVIDER',
  AT_CUSTOMER = 'AT_CUSTOMER',
  ONLINE = 'ONLINE',
  BOTH = 'BOTH',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROVIDER_ON_WAY = 'PROVIDER_ON_WAY',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED_BY_CUSTOMER = 'CANCELLED_BY_CUSTOMER',
  CANCELLED_BY_PROVIDER = 'CANCELLED_BY_PROVIDER',
  NO_SHOW = 'NO_SHOW',
  DISPUTED = 'DISPUTED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  HELD_IN_ESCROW = 'HELD_IN_ESCROW',
  PARTIALLY_RELEASED = 'PARTIALLY_RELEASED',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'DISPUTED',
}

export enum ProtectLevel {
  NONE = 'NONE',
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
  ELITE = 'ELITE',
}

export enum LinkedMarketplace {
  CARS = 'CARS',
  PROPERTIES = 'PROPERTIES',
  MOBILES = 'MOBILES',
  GOLD = 'GOLD',
  SILVER = 'SILVER',
  LUXURY = 'LUXURY',
  SCRAP = 'SCRAP',
  AUCTIONS = 'AUCTIONS',
  TENDERS = 'TENDERS',
  BARTER = 'BARTER',
  GENERAL = 'GENERAL',
}

export enum DisputeStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  AWAITING_PROVIDER = 'AWAITING_PROVIDER',
  AWAITING_CUSTOMER = 'AWAITING_CUSTOMER',
  MEDIATION = 'MEDIATION',
  RESOLVED_REFUND = 'RESOLVED_REFUND',
  RESOLVED_PARTIAL = 'RESOLVED_PARTIAL',
  RESOLVED_NO_REFUND = 'RESOLVED_NO_REFUND',
  CLOSED = 'CLOSED',
}

// ============================================
// Core Interfaces
// ============================================

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  governorate?: string;
  city?: string;
  rating: number;
  totalReviews: number;
  createdAt: string;
  wallet?: Wallet;
}

export interface Wallet {
  id: string;
  balance: number;
  tradeCredits: number;
  frozenBalance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  lifetimeCreditsEarned: number;
  lifetimeCreditsSpent: number;
}

export interface ServiceProvider {
  id: string;
  userId: string;
  displayNameAr: string;
  displayNameEn?: string;
  bioAr?: string;
  bioEn?: string;
  profileImage?: string;
  coverImage?: string;
  businessType?: string;
  businessName?: string;
  phone: string;
  whatsapp?: string;
  email: string;
  website?: string;
  governorate: string;
  city: string;
  district?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  serviceRadius?: number;
  status: ServiceProviderStatus;
  verificationLevel: VerificationLevel;
  subscriptionTier: ProviderSubscriptionTier;
  commissionRate: number;
  rating: number;
  totalReviews: number;
  totalBookings: number;
  completedBookings: number;
  completionRate: number;
  responseTime?: number;
  isAvailable: boolean;
  acceptsInstantBooking: boolean;
  acceptsExpressService: boolean;
  services?: Service[];
  certifications?: ProviderCertification[];
  createdAt: string;
}

export interface ServiceCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  descriptionAr?: string;
  descriptionEn?: string;
  icon?: string;
  image?: string;
  parentId?: string;
  linkedMarketplace?: LinkedMarketplace;
  isActive: boolean;
  isFeatured: boolean;
  children?: ServiceCategory[];
}

export interface Service {
  id: string;
  providerId: string;
  categoryId: string;
  titleAr: string;
  titleEn?: string;
  descriptionAr: string;
  descriptionEn?: string;
  shortDescriptionAr?: string;
  shortDescriptionEn?: string;
  images: string[];
  videos: string[];
  pricingType: ServicePricingType;
  price: number;
  priceMax?: number;
  currency: string;
  durationMinutes?: number;
  durationHours?: number;
  locationType: ServiceLocationType;
  includedItemsAr: string[];
  includedItemsEn: string[];
  excludedItemsAr: string[];
  excludedItemsEn: string[];
  requirementsAr: string[];
  requirementsEn: string[];
  tags: string[];
  linkedMarketplace?: LinkedMarketplace;
  rating: number;
  totalReviews: number;
  totalBookings: number;
  viewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  acceptsInstantBooking: boolean;
  acceptsExpressService: boolean;
  expressExtraCharge?: number;
  protectAvailable: boolean;
  provider?: ServiceProvider;
  category?: ServiceCategory;
  addOns?: ServiceAddOn[];
  packages?: ServicePackage[];
  reviews?: ServiceReview[];
}

export interface ServiceAddOn {
  id: string;
  serviceId: string;
  nameAr: string;
  nameEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number;
  isRequired: boolean;
  isActive: boolean;
}

export interface ServicePackage {
  id: string;
  serviceId: string;
  nameAr: string;
  nameEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number;
  originalPrice?: number;
  includedItemsAr: string[];
  includedItemsEn: string[];
  isPopular: boolean;
  isActive: boolean;
}

export interface ServiceBooking {
  id: string;
  bookingNumber: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  scheduledDate: string;
  scheduledTimeStart: string;
  scheduledTimeEnd?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  locationType: ServiceLocationType;
  serviceAddress?: string;
  serviceCity?: string;
  serviceGovernorate?: string;
  serviceLatitude?: number;
  serviceLongitude?: number;
  basePrice: number;
  addOnsPrice: number;
  expressCharge: number;
  protectCharge: number;
  discountAmount: number;
  discountCode?: string;
  subtotal: number;
  commissionAmount: number;
  providerPayout: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paidWithCash: number;
  paidWithCredits: number;
  paymentMethod?: string;
  protectLevel: ProtectLevel;
  protectExpiresAt?: string;
  status: BookingStatus;
  isExpressService: boolean;
  customerNotes?: string;
  beforePhotos: string[];
  afterPhotos: string[];
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  linkedProductId?: string;
  linkedProductType?: string;
  createdAt: string;
  confirmedAt?: string;
  completedAt?: string;
  customer?: User;
  provider?: ServiceProvider;
  service?: Service;
  escrow?: ServiceEscrow;
  review?: ServiceReview;
  dispute?: ServiceDispute;
  milestones?: BookingMilestone[];
  selectedAddOns?: BookingAddOn[];
}

export interface BookingAddOn {
  id: string;
  bookingId: string;
  addOnName: string;
  addOnPrice: number;
}

export interface BookingMilestone {
  id: string;
  bookingId: string;
  titleAr: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  amount: number;
  percentage: number;
  order: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED' | 'DISPUTED';
  dueDate?: string;
  completedAt?: string;
  approvedAt?: string;
  evidence: string[];
  customerFeedback?: string;
}

export interface ServiceEscrow {
  id: string;
  bookingId: string;
  totalAmount: number;
  heldAmount: number;
  releasedAmount: number;
  refundedAmount: number;
  creditsHeld: number;
  creditsReleased: number;
  currency: string;
  status: PaymentStatus;
  heldAt?: string;
  releasedAt?: string;
  refundedAt?: string;
  autoReleaseAt?: string;
  autoReleaseHours: number;
}

export interface ServiceReview {
  id: string;
  bookingId: string;
  serviceId: string;
  providerId: string;
  customerId: string;
  overallRating: number;
  qualityRating?: number;
  punctualityRating?: number;
  communicationRating?: number;
  valueRating?: number;
  reviewText?: string;
  reviewImages: string[];
  reviewVideos: string[];
  providerResponse?: string;
  providerRespondedAt?: string;
  isVerified: boolean;
  isVisible: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: string;
  customer?: User;
}

export interface ServiceDispute {
  id: string;
  disputeNumber: string;
  bookingId: string;
  initiatorId: string;
  initiatorType: 'CUSTOMER' | 'PROVIDER';
  reason: string;
  descriptionAr: string;
  descriptionEn?: string;
  evidence: string[];
  status: DisputeStatus;
  resolutionType?: string;
  resolutionAmount?: number;
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface ProviderCertification {
  id: string;
  providerId: string;
  type: string;
  titleAr: string;
  titleEn?: string;
  issuingAuthority: string;
  certificateNumber?: string;
  certificateImage?: string;
  issuedAt: string;
  expiresAt?: string;
  isVerified: boolean;
}

export interface ProviderAvailability {
  id: string;
  providerId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface ServiceRecommendation {
  serviceId: string;
  serviceName: string;
  provider: ServiceProvider;
  price: number;
  timing: string;
  badge?: string;
  discount?: string;
  description?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderType: 'CUSTOMER' | 'PROVIDER';
  message?: string;
  attachments: string[];
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface ServiceNotification {
  id: string;
  userId: string;
  type: string;
  titleAr: string;
  titleEn?: string;
  bodyAr: string;
  bodyEn?: string;
  bookingId?: string;
  serviceId?: string;
  providerId?: string;
  deepLink?: string;
  isRead: boolean;
  createdAt: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

// ============================================
// Search & Filter Types
// ============================================

export interface ServiceSearchParams {
  query?: string;
  categoryId?: string;
  linkedMarketplace?: LinkedMarketplace;
  governorate?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  pricingType?: ServicePricingType;
  locationType?: ServiceLocationType;
  isExpressAvailable?: boolean;
  sortBy?: 'price' | 'rating' | 'reviews' | 'distance' | 'newest';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export interface ProviderSearchParams {
  query?: string;
  categoryId?: string;
  governorate?: string;
  city?: string;
  minRating?: number;
  verificationLevel?: VerificationLevel;
  isAvailable?: boolean;
  acceptsExpressService?: boolean;
  sortBy?: 'rating' | 'reviews' | 'completionRate' | 'distance';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ============================================
// Booking Flow Types
// ============================================

export interface CreateBookingPayload {
  serviceId: string;
  scheduledDate: string;
  scheduledTimeStart: string;
  scheduledTimeEnd?: string;
  locationType: ServiceLocationType;
  serviceAddress?: string;
  serviceCity?: string;
  serviceGovernorate?: string;
  serviceLatitude?: number;
  serviceLongitude?: number;
  customerNotes?: string;
  selectedAddOnIds?: string[];
  protectLevel: ProtectLevel;
  payWithCredits?: number;
  discountCode?: string;
  linkedProductId?: string;
  linkedProductType?: string;
  isExpressService?: boolean;
}

export interface BookingPriceCalculation {
  basePrice: number;
  addOnsPrice: number;
  expressCharge: number;
  protectCharge: number;
  discountAmount: number;
  subtotal: number;
  totalAmount: number;
  maxCreditsUsable: number;
  protectDetails: {
    level: ProtectLevel;
    cost: number;
    coverage: string;
    duration: string;
  };
}

// ============================================
// Provider Registration Types
// ============================================

export interface ProviderRegistrationPayload {
  displayNameAr: string;
  displayNameEn?: string;
  bioAr?: string;
  bioEn?: string;
  businessType: 'INDIVIDUAL' | 'COMPANY' | 'FREELANCER';
  businessName?: string;
  phone: string;
  alternatePhone?: string;
  whatsapp?: string;
  email: string;
  website?: string;
  governorate: string;
  city: string;
  district?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  serviceRadius?: number;
  nationalIdNumber: string;
  nationalIdImage: string;
  selfieWithId: string;
  categoryIds: string[];
}

// ============================================
// Navigation Types
// ============================================

export type RootStackParamList = {
  // Auth
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyOtp: { phone: string };

  // Main Tabs
  MainTabs: undefined;

  // Home
  Home: undefined;

  // Search
  Search: { categoryId?: string; query?: string };
  SearchResults: ServiceSearchParams;

  // Services
  ServiceDetail: { serviceId: string };
  ProviderProfile: { providerId: string };
  AllReviews: { serviceId?: string; providerId?: string };

  // Booking
  BookingFlow: { serviceId: string; providerId: string };
  BookingConfirmation: { bookingId: string };
  BookingDetail: { bookingId: string };
  BookingChat: { bookingId: string; chatId: string };

  // Reviews
  WriteReview: { bookingId: string };

  // Disputes
  CreateDispute: { bookingId: string };
  DisputeDetail: { disputeId: string };

  // Wallet
  Wallet: undefined;
  TransactionHistory: undefined;

  // Profile
  Profile: undefined;
  EditProfile: undefined;
  Addresses: undefined;
  AddAddress: undefined;
  PaymentMethods: undefined;
  NotificationSettings: undefined;

  // Provider
  ProviderDashboard: undefined;
  ProviderServices: undefined;
  AddService: undefined;
  EditService: { serviceId: string };
  ProviderBookings: undefined;
  ProviderCalendar: undefined;
  ProviderEarnings: undefined;
  ProviderPayouts: undefined;
  RequestPayout: undefined;
  ProviderReviews: undefined;
  ProviderSettings: undefined;
  ProviderRegistration: undefined;

  // Admin
  AdminDashboard: undefined;
  PendingProviders: undefined;
  ProviderApproval: { providerId: string };
  AllDisputes: undefined;
  DisputeResolution: { disputeId: string };

  // Chat
  ChatList: undefined;
  ChatRoom: { chatId: string; bookingId: string };

  // AI Chatbot
  AIChatbot: undefined;

  // Academy
  Academy: undefined;
  CourseDetail: { courseId: string };
  CourseModule: { moduleId: string };

  // Settings
  Settings: undefined;
  Language: undefined;
  About: undefined;
  Help: undefined;

  // Xchange Egypt Marketplace
  Listings: { categoryId?: string; search?: string } | undefined;
  ListingDetail: { listingId: string };
  CreateListing: undefined;
  EditListing: { listingId: string };
  Auctions: { status?: string } | undefined;
  AuctionDetail: { auctionId: string };
  CreateAuction: undefined;
  Gold: undefined;
  GoldDetail: { goldId: string };
  XchangeWallet: undefined;
  TransferMoney: undefined;
  TransactionDetail: { transactionId: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  MarketTab: undefined;
  AuctionsTab: undefined;
  WalletTab: undefined;
  ProfileTab: undefined;
};

export type ProviderTabParamList = {
  Dashboard: undefined;
  Services: undefined;
  Bookings: undefined;
  Calendar: undefined;
  Account: undefined;
};
