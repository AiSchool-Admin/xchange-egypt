import api from './client';

// ============================================
// سوق العقارات - Real Estate Marketplace API
// ============================================

// Types
export type PropertyType =
  | 'APARTMENT'
  | 'VILLA'
  | 'DUPLEX'
  | 'PENTHOUSE'
  | 'STUDIO'
  | 'CHALET'
  | 'TOWNHOUSE'
  | 'TWIN_HOUSE'
  | 'LAND'
  | 'COMMERCIAL'
  | 'OFFICE'
  | 'RETAIL'
  | 'WAREHOUSE'
  | 'BUILDING';

export type ListingType = 'SALE' | 'RENT';
export type TitleType = 'REGISTERED' | 'PRELIMINARY' | 'POA';
export type VerificationLevel = 'UNVERIFIED' | 'DOCUMENTS_VERIFIED' | 'FIELD_VERIFIED' | 'GOVERNMENT_VERIFIED';
export type FinishingLevel = 'NOT_FINISHED' | 'SEMI_FINISHED' | 'FULLY_FINISHED' | 'SUPER_LUX' | 'ULTRA_SUPER_LUX';
export type FurnishingStatus = 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FULLY_FURNISHED';
export type PropertyStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'SOLD' | 'RENTED' | 'INACTIVE' | 'REJECTED';
export type InspectionType = 'BASIC' | 'STANDARD' | 'COMPREHENSIVE' | 'PRE_PURCHASE' | 'PRE_RENTAL' | 'CHECKIN' | 'CHECKOUT';
export type InspectionStatus = 'REQUESTED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type BarterProposalStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTER_OFFERED' | 'EXPIRED' | 'CANCELLED' | 'COMPLETED';
export type RentalContractStatus = 'DRAFT' | 'PENDING_SIGNATURES' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'DISPUTED';
export type DepositStatus = 'PENDING' | 'PROTECTED' | 'RETURN_REQUESTED' | 'RELEASED' | 'DISPUTED' | 'PARTIALLY_RELEASED';

// Arabic translations
export const PROPERTY_TYPE_AR: Record<PropertyType, string> = {
  APARTMENT: 'شقة',
  VILLA: 'فيلا',
  DUPLEX: 'دوبلكس',
  PENTHOUSE: 'بنتهاوس',
  STUDIO: 'ستوديو',
  CHALET: 'شاليه',
  TOWNHOUSE: 'تاون هاوس',
  TWIN_HOUSE: 'توين هاوس',
  LAND: 'أرض',
  COMMERCIAL: 'تجاري',
  OFFICE: 'مكتب',
  RETAIL: 'محل',
  WAREHOUSE: 'مخزن',
  BUILDING: 'عمارة',
};

export const LISTING_TYPE_AR: Record<ListingType, string> = {
  SALE: 'للبيع',
  RENT: 'للإيجار',
};

export const TITLE_TYPE_AR: Record<TitleType, string> = {
  REGISTERED: 'عقد مسجل',
  PRELIMINARY: 'عقد ابتدائي',
  POA: 'توكيل',
};

export const VERIFICATION_LEVEL_AR: Record<VerificationLevel, string> = {
  UNVERIFIED: 'غير موثق',
  DOCUMENTS_VERIFIED: 'مستندات موثقة',
  FIELD_VERIFIED: 'فحص ميداني',
  GOVERNMENT_VERIFIED: 'موثق حكومياً',
};

export const FINISHING_LEVEL_AR: Record<FinishingLevel, string> = {
  NOT_FINISHED: 'بدون تشطيب',
  SEMI_FINISHED: 'نصف تشطيب',
  FULLY_FINISHED: 'تشطيب كامل',
  SUPER_LUX: 'سوبر لوكس',
  ULTRA_SUPER_LUX: 'الترا سوبر لوكس',
};

export const FURNISHING_STATUS_AR: Record<FurnishingStatus, string> = {
  UNFURNISHED: 'بدون فرش',
  SEMI_FURNISHED: 'مفروش جزئياً',
  FULLY_FURNISHED: 'مفروش بالكامل',
};

export const PROPERTY_STATUS_AR: Record<PropertyStatus, string> = {
  DRAFT: 'مسودة',
  PENDING_APPROVAL: 'قيد المراجعة',
  ACTIVE: 'نشط',
  SOLD: 'تم البيع',
  RENTED: 'مؤجر',
  INACTIVE: 'غير نشط',
  REJECTED: 'مرفوض',
};

export const INSPECTION_TYPE_AR: Record<InspectionType, string> = {
  BASIC: 'فحص أساسي',
  STANDARD: 'فحص قياسي',
  COMPREHENSIVE: 'فحص شامل',
  PRE_PURCHASE: 'فحص ما قبل الشراء',
  PRE_RENTAL: 'فحص ما قبل الإيجار',
  CHECKIN: 'فحص الاستلام',
  CHECKOUT: 'فحص التسليم',
};

export const INSPECTION_STATUS_AR: Record<InspectionStatus, string> = {
  REQUESTED: 'مطلوب',
  SCHEDULED: 'مجدول',
  IN_PROGRESS: 'قيد التنفيذ',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
};

// ============================================
// Property Interfaces
// ============================================

export interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  titleType: TitleType;
  verificationLevel: VerificationLevel;
  status: PropertyStatus;
  price: number;
  pricePerMeter?: number;
  currency: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  totalFloors?: number;
  buildYear?: number;
  finishingLevel?: FinishingLevel;
  furnishingStatus?: FurnishingStatus;
  direction?: string;
  governorate: string;
  city: string;
  district?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  virtualTourUrl?: string;
  amenities: string[];
  openToBarter: boolean;
  barterPreferences: string[];
  hasEscrow: boolean;
  viewCount: number;
  favoritesCount: number;
  isFavorite?: boolean;
  owner: {
    id: string;
    fullName: string;
    avatar?: string;
    phone?: string;
    isVerified: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFilters {
  search?: string;
  governorate?: string;
  city?: string;
  district?: string;
  propertyTypes?: PropertyType[];
  listingType?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  titleTypes?: TitleType[];
  verificationLevels?: VerificationLevel[];
  hasEscrow?: boolean;
  openToBarter?: boolean;
  sortBy?: 'createdAt' | 'price' | 'area';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreatePropertyData {
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  titleType: TitleType;
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  totalFloors?: number;
  buildYear?: number;
  finishingLevel?: FinishingLevel;
  furnishingStatus?: FurnishingStatus;
  direction?: string;
  governorate: string;
  city: string;
  district?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  virtualTourUrl?: string;
  amenities?: string[];
  openToBarter?: boolean;
  barterPreferences?: string[];
  hasEscrow?: boolean;
}

export interface BarterProposal {
  id: string;
  offeredPropertyId: string;
  targetPropertyId: string;
  cashDifference?: number;
  notes?: string;
  status: BarterProposalStatus;
  offeredProperty: Property;
  targetProperty: Property;
  createdAt: string;
}

export interface RentalContract {
  id: string;
  propertyId: string;
  landlordId: string;
  tenantId: string;
  monthlyRent: number;
  depositAmount: number;
  depositStatus: DepositStatus;
  startDate: string;
  endDate: string;
  status: RentalContractStatus;
  property: Property;
  createdAt: string;
}

export interface FieldInspection {
  id: string;
  propertyId: string;
  inspectionType: InspectionType;
  status: InspectionStatus;
  inspectionFee: number;
  paid: boolean;
  scheduledAt?: string;
  completedAt?: string;
  overallScore?: number;
  findings?: any;
  recommendation?: string;
  property: Property;
  createdAt: string;
}

// ============================================
// API Functions
// ============================================

// Search properties
export async function searchProperties(filters: PropertyFilters = {}): Promise<{
  properties: Property[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const params = new URLSearchParams();

  // Text search
  if (filters.search) params.append('search', filters.search);

  // Location filters
  if (filters.governorate) params.append('governorate', filters.governorate);
  if (filters.city) params.append('city', filters.city);
  if (filters.district) params.append('district', filters.district);

  // Property type filter - backend expects 'propertyType' (can be array)
  if (filters.propertyTypes?.length) params.append('propertyType', filters.propertyTypes.join(','));

  // Listing type filter
  if (filters.listingType) params.append('listingType', filters.listingType);

  // Price filters - backend expects 'priceMin' and 'priceMax'
  if (filters.minPrice !== undefined) params.append('priceMin', filters.minPrice.toString());
  if (filters.maxPrice !== undefined) params.append('priceMax', filters.maxPrice.toString());

  // Area filters - backend expects 'areaMin' and 'areaMax'
  if (filters.minArea !== undefined) params.append('areaMin', filters.minArea.toString());
  if (filters.maxArea !== undefined) params.append('areaMax', filters.maxArea.toString());

  // Rooms filters - backend expects 'bedroomsMin' and 'bathroomsMin'
  if (filters.bedrooms) params.append('bedroomsMin', filters.bedrooms.toString());
  if (filters.bathrooms) params.append('bathroomsMin', filters.bathrooms.toString());

  // Title type filter - backend expects 'titleType'
  if (filters.titleTypes?.length) params.append('titleType', filters.titleTypes.join(','));

  // Verification level filter - backend expects 'verificationLevel'
  if (filters.verificationLevels?.length) params.append('verificationLevel', filters.verificationLevels.join(','));

  // Barter filter - backend expects 'openForBarter'
  if (filters.openToBarter !== undefined) params.append('openForBarter', filters.openToBarter.toString());

  // Sorting
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  // Pagination
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const response = await api.get(`/properties?${params.toString()}`);
  // Backend returns { success, message, data: { properties, pagination } }
  const data = response.data.data || { properties: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };

  // Normalize all properties in the result
  return {
    ...data,
    properties: (data.properties || []).map(normalizeProperty),
  };
}

// Helper to normalize property data from backend to frontend format
function normalizeProperty(raw: any): Property {
  if (!raw) return raw;

  // Map backend field names to frontend interface
  const price = raw.salePrice ?? raw.rentPrice ?? raw.price ?? 0;
  const area = raw.areaSqm ?? raw.area ?? 0;

  // Ensure images is always an array of strings
  let images: string[] = [];
  if (Array.isArray(raw.images)) {
    images = raw.images
      .filter((img: any) => img !== null && img !== undefined)
      .map((img: any) => {
        if (typeof img === 'string') return img;
        if (typeof img === 'object' && img.url) return img.url;
        return '';
      })
      .filter((url: string) => url !== '');
  }

  // Normalize amenities (backend may send as JSON object with items array)
  let amenities: string[] = [];
  if (Array.isArray(raw.amenities)) {
    amenities = raw.amenities;
  } else if (raw.amenities?.items && Array.isArray(raw.amenities.items)) {
    amenities = raw.amenities.items;
  }

  // Normalize barter preferences
  let barterPreferences: string[] = [];
  if (Array.isArray(raw.barterPreferences)) {
    barterPreferences = raw.barterPreferences;
  } else if (raw.barterPreferences?.items && Array.isArray(raw.barterPreferences.items)) {
    barterPreferences = raw.barterPreferences.items;
  }

  return {
    ...raw,
    price,
    area,
    images,
    amenities,
    barterPreferences,
    pricePerMeter: raw.pricePerSqm ?? raw.pricePerMeter,
    // Backend uses openForBarter, frontend uses openToBarter
    openToBarter: raw.openForBarter ?? raw.openToBarter ?? false,
    // Backend uses viewsCount, frontend uses viewCount
    viewCount: raw.viewsCount ?? raw.viewCount ?? 0,
    // Normalize owner data
    owner: raw.owner ? {
      ...raw.owner,
      fullName: raw.owner.fullName ?? raw.owner.name ?? 'مستخدم',
      isVerified: raw.owner.isVerified ?? raw.owner.userType === 'VERIFIED',
    } : undefined,
  };
}

// Get property by ID
export async function getProperty(id: string): Promise<Property> {
  const response = await api.get(`/properties/${id}`);
  // Backend returns { success, message, data: { property, ... } }
  const rawProperty = response.data.data?.property || response.data.property;
  return normalizeProperty(rawProperty);
}

// Get user's properties
export async function getUserProperties(): Promise<Property[]> {
  const response = await api.get('/properties/my-properties');
  const properties = response.data.data?.properties || response.data.properties || [];
  return properties.map(normalizeProperty);
}

// Create property
export async function createProperty(data: CreatePropertyData): Promise<Property> {
  // Transform frontend field names to backend field names
  const backendData = {
    title: data.title,
    titleAr: data.title,
    description: data.description,
    descriptionAr: data.description,
    propertyType: data.propertyType,
    listingType: data.listingType,
    titleType: data.titleType,
    // Backend expects areaSqm, not area
    areaSqm: data.area,
    // Backend expects salePrice or rentPrice, not price
    salePrice: data.listingType === 'SALE' ? data.price : undefined,
    rentPrice: data.listingType === 'RENT' ? data.price : undefined,
    priceNegotiable: true,
    // Location
    governorate: data.governorate,
    city: data.city,
    district: data.district,
    address: data.address,
    latitude: data.latitude,
    longitude: data.longitude,
    // Specs
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    floorNumber: data.floor,
    totalFloors: data.totalFloors,
    // Finishing
    finishingLevel: data.finishingLevel,
    furnished: data.furnishingStatus,
    // Media
    images: data.images,
    virtualTourUrl: data.virtualTourUrl,
    // Amenities - send as object if it's an array
    amenities: data.amenities?.length ? { items: data.amenities } : undefined,
    // Backend expects openForBarter, not openToBarter
    openForBarter: data.openToBarter,
    barterPreferences: data.barterPreferences?.length ? { items: data.barterPreferences } : undefined,
  };

  const response = await api.post('/properties', backendData);
  return normalizeProperty(response.data.data || response.data.property);
}

// Update property
export async function updateProperty(id: string, data: Partial<CreatePropertyData>): Promise<Property> {
  // Transform frontend field names to backend field names
  const backendData: Record<string, any> = {};

  if (data.title !== undefined) {
    backendData.title = data.title;
    backendData.titleAr = data.title;
  }
  if (data.description !== undefined) {
    backendData.description = data.description;
    backendData.descriptionAr = data.description;
  }
  if (data.propertyType !== undefined) backendData.propertyType = data.propertyType;
  if (data.listingType !== undefined) backendData.listingType = data.listingType;
  if (data.titleType !== undefined) backendData.titleType = data.titleType;
  if (data.area !== undefined) backendData.areaSqm = data.area;
  if (data.price !== undefined) {
    if (data.listingType === 'RENT') {
      backendData.rentPrice = data.price;
    } else {
      backendData.salePrice = data.price;
    }
  }
  if (data.governorate !== undefined) backendData.governorate = data.governorate;
  if (data.city !== undefined) backendData.city = data.city;
  if (data.district !== undefined) backendData.district = data.district;
  if (data.address !== undefined) backendData.address = data.address;
  if (data.latitude !== undefined) backendData.latitude = data.latitude;
  if (data.longitude !== undefined) backendData.longitude = data.longitude;
  if (data.bedrooms !== undefined) backendData.bedrooms = data.bedrooms;
  if (data.bathrooms !== undefined) backendData.bathrooms = data.bathrooms;
  if (data.floor !== undefined) backendData.floorNumber = data.floor;
  if (data.totalFloors !== undefined) backendData.totalFloors = data.totalFloors;
  if (data.finishingLevel !== undefined) backendData.finishingLevel = data.finishingLevel;
  if (data.furnishingStatus !== undefined) backendData.furnished = data.furnishingStatus;
  if (data.images !== undefined) backendData.images = data.images;
  if (data.virtualTourUrl !== undefined) backendData.virtualTourUrl = data.virtualTourUrl;
  if (data.amenities !== undefined) backendData.amenities = data.amenities?.length ? { items: data.amenities } : undefined;
  if (data.openToBarter !== undefined) backendData.openForBarter = data.openToBarter;
  if (data.barterPreferences !== undefined) backendData.barterPreferences = data.barterPreferences?.length ? { items: data.barterPreferences } : undefined;

  const response = await api.put(`/properties/${id}`, backendData);
  return normalizeProperty(response.data.data || response.data.property);
}

// Delete property
export async function deleteProperty(id: string): Promise<void> {
  await api.delete(`/properties/${id}`);
}

// Submit for verification
export async function submitForVerification(id: string, documents: string[]): Promise<Property> {
  const response = await api.post(`/properties/${id}/submit-verification`, { documents });
  return response.data.data || response.data.property;
}

// Mark as sold
export async function markAsSold(id: string): Promise<Property> {
  const response = await api.post(`/properties/${id}/mark-sold`);
  return response.data.data || response.data.property;
}

// Mark as rented
export async function markAsRented(id: string): Promise<Property> {
  const response = await api.post(`/properties/${id}/mark-rented`);
  return response.data.data || response.data.property;
}

// ============================================
// Favorites
// ============================================

// Get favorites
export async function getFavorites(): Promise<Property[]> {
  const response = await api.get('/properties/favorites');
  const favorites = response.data.data?.favorites || response.data.favorites || [];
  return favorites.map(normalizeProperty);
}

// Add to favorites
export async function addToFavorites(id: string): Promise<void> {
  await api.post(`/properties/${id}/favorite`);
}

// Remove from favorites
export async function removeFromFavorites(id: string): Promise<void> {
  await api.delete(`/properties/${id}/favorite`);
}

// ============================================
// Barter
// ============================================

// Get barter suggestions
export async function getBarterSuggestions(propertyId: string): Promise<Property[]> {
  const response = await api.get(`/properties/${propertyId}/barter-suggestions`);
  const suggestions = response.data.data?.suggestions || response.data.suggestions || [];
  return suggestions.map(normalizeProperty);
}

// Create barter proposal
export async function createBarterProposal(data: {
  offeredPropertyId: string;
  targetPropertyId: string;
  cashDifference?: number;
  notes?: string;
}): Promise<BarterProposal> {
  const response = await api.post('/properties/barter/propose', data);
  return response.data.data || response.data.proposal;
}

// Get user's barter proposals
export async function getUserBarterProposals(): Promise<{
  sent: BarterProposal[];
  received: BarterProposal[];
}> {
  const response = await api.get('/properties/barter/proposals');
  return response.data.data || response.data || { sent: [], received: [] };
}

// Respond to barter proposal
export async function respondToBarterProposal(
  id: string,
  action: 'accept' | 'reject' | 'counter',
  counterOffer?: { cashDifference?: number; notes?: string }
): Promise<BarterProposal> {
  const response = await api.post(`/properties/barter/${id}/respond`, { action, counterOffer });
  return response.data.data || response.data.proposal;
}

// Cancel barter proposal
export async function cancelBarterProposal(id: string): Promise<void> {
  await api.delete(`/properties/barter/${id}`);
}

// ============================================
// Rentals
// ============================================

// Get user's rental contracts
export async function getUserRentalContracts(): Promise<RentalContract[]> {
  const response = await api.get('/properties/rentals/contracts');
  return response.data.data?.contracts || response.data.contracts || [];
}

// Create rental contract
export async function createRentalContract(data: {
  propertyId: string;
  tenantId: string;
  monthlyRent: number;
  depositAmount: number;
  startDate: string;
  endDate: string;
}): Promise<RentalContract> {
  const response = await api.post('/properties/rentals/contracts', data);
  return response.data.data || response.data.contract;
}

// Protect deposit
export async function protectDeposit(contractId: string): Promise<RentalContract> {
  const response = await api.post(`/properties/rentals/contracts/${contractId}/protect-deposit`);
  return response.data.data || response.data.contract;
}

// Request deposit return
export async function requestDepositReturn(contractId: string): Promise<RentalContract> {
  const response = await api.post(`/properties/rentals/contracts/${contractId}/request-deposit-return`);
  return response.data.data || response.data.contract;
}

// Release deposit
export async function releaseDeposit(contractId: string): Promise<RentalContract> {
  const response = await api.post(`/properties/rentals/contracts/${contractId}/release-deposit`);
  return response.data.data || response.data.contract;
}

// Dispute deposit
export async function disputeDeposit(contractId: string, reason: string): Promise<RentalContract> {
  const response = await api.post(`/properties/rentals/contracts/${contractId}/dispute-deposit`, { reason });
  return response.data.data || response.data.contract;
}

// ============================================
// Field Inspection
// ============================================

// Get user's inspections
export async function getUserInspections(): Promise<FieldInspection[]> {
  const response = await api.get('/properties/inspections');
  return response.data.data?.inspections || response.data.inspections || [];
}

// Request inspection
export async function requestInspection(data: {
  propertyId: string;
  inspectionType: InspectionType;
  preferredDates?: string[];
  contactPhone?: string;
  notes?: string;
}): Promise<FieldInspection> {
  const response = await api.post('/properties/inspections', data);
  return response.data.data || response.data.inspection;
}

// Get inspection by ID
export async function getInspection(id: string): Promise<FieldInspection> {
  const response = await api.get(`/properties/inspections/${id}`);
  return response.data.data?.inspection || response.data.inspection;
}

// Pay for inspection
export async function payForInspection(
  id: string,
  paymentMethod: string,
  paymentReference?: string
): Promise<FieldInspection> {
  const response = await api.post(`/properties/inspections/${id}/pay`, {
    paymentMethod,
    paymentReference,
  });
  return response.data.data || response.data.inspection;
}

// ============================================
// Value Estimation
// ============================================

// Estimate property value
export async function estimatePropertyValue(data: {
  propertyType: PropertyType;
  governorate: string;
  city: string;
  area: number;
  bedrooms?: number;
  finishingLevel?: FinishingLevel;
  floor?: number;
  buildYear?: number;
}): Promise<{
  estimatedValue: { min: number; max: number; average: number };
  pricePerMeter: { min: number; max: number; average: number };
  comparables: number;
  confidence: 'low' | 'medium' | 'high';
}> {
  const response = await api.post('/properties/estimate-value', data);
  return response.data.data || response.data;
}

export default {
  searchProperties,
  getProperty,
  getUserProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  submitForVerification,
  markAsSold,
  markAsRented,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  getBarterSuggestions,
  createBarterProposal,
  getUserBarterProposals,
  respondToBarterProposal,
  cancelBarterProposal,
  getUserRentalContracts,
  createRentalContract,
  protectDeposit,
  requestDepositReturn,
  releaseDeposit,
  disputeDeposit,
  getUserInspections,
  requestInspection,
  getInspection,
  payForInspection,
  estimatePropertyValue,
};
