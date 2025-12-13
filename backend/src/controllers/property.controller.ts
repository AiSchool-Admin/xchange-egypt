import { Request, Response, NextFunction } from 'express';
import * as propertyService from '../services/property.service';
import * as propertyBarterService from '../services/property-barter.service';
import * as rentalService from '../services/rental.service';
import * as inspectionService from '../services/field-inspection.service';
import { successResponse } from '../utils/response';

// ============================================
// Property CRUD
// ============================================

/**
 * Create a new property listing
 */
export const createProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const property = await propertyService.createProperty(userId, req.body);
    return successResponse(res, property, 'Property created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get property by ID
 */
export const getProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const result = await propertyService.getPropertyById(id, userId);
    return successResponse(res, result, 'Property retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update property
 */
export const updateProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const property = await propertyService.updateProperty(id, userId, req.body);
    return successResponse(res, property, 'Property updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete property
 */
export const deleteProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    await propertyService.deleteProperty(id, userId);
    return successResponse(res, null, 'Property deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Search properties
 */
export const searchProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await propertyService.searchProperties(req.query as any);
    return successResponse(res, result, 'Properties retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's properties
 */
export const getUserProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { status } = req.query;
    const properties = await propertyService.getUserProperties(userId, status as any);
    return successResponse(res, properties, 'User properties retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Property Status Operations
// ============================================

/**
 * Submit property for verification
 */
export const submitForVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const property = await propertyService.submitForVerification(id, userId);
    return successResponse(res, property, 'Property submitted for verification');
  } catch (error) {
    next(error);
  }
};

/**
 * Activate property (admin)
 */
export const activateProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.id;
    const { verificationNotes } = req.body;
    const property = await propertyService.activateProperty(id, adminId, verificationNotes);
    return successResponse(res, property, 'Property activated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Reject property (admin)
 */
export const rejectProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const property = await propertyService.rejectProperty(id, reason);
    return successResponse(res, property, 'Property rejected');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark property as sold
 */
export const markAsSold = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const property = await propertyService.markPropertyAsSold(id, userId);
    return successResponse(res, property, 'Property marked as sold');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark property as rented
 */
export const markAsRented = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const property = await propertyService.markPropertyAsRented(id, userId);
    return successResponse(res, property, 'Property marked as rented');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Favorites
// ============================================

/**
 * Add property to favorites
 */
export const addToFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const favorite = await propertyService.addToFavorites(id, userId);
    return successResponse(res, favorite, 'Property added to favorites', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Remove property from favorites
 */
export const removeFromFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    await propertyService.removeFromFavorites(id, userId);
    return successResponse(res, null, 'Property removed from favorites');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's favorite properties
 */
export const getFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const favorites = await propertyService.getUserFavorites(userId);
    return successResponse(res, favorites, 'Favorites retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Price Estimation
// ============================================

/**
 * Estimate property value
 */
export const estimateValue = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const estimate = await propertyService.estimatePropertyValue(req.body);
    return successResponse(res, estimate, 'Value estimated successfully');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Property Barter
// ============================================

/**
 * Create barter proposal
 */
export const createBarterProposal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const result = await propertyBarterService.createBarterProposal(userId, req.body);
    return successResponse(res, result, 'Barter proposal created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get barter proposal
 */
export const getBarterProposal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const proposal = await propertyBarterService.getBarterProposalById(id, userId);
    return successResponse(res, proposal, 'Barter proposal retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Respond to barter proposal
 */
export const respondToBarterProposal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const result = await propertyBarterService.respondToProposal(id, userId, req.body);
    return successResponse(res, result, 'Response recorded successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel barter proposal
 */
export const cancelBarterProposal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const proposal = await propertyBarterService.cancelProposal(id, userId);
    return successResponse(res, proposal, 'Barter proposal cancelled');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's barter proposals
 */
export const getUserBarterProposals = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { type, status } = req.query;
    const proposals = await propertyBarterService.getUserBarterProposals(
      userId,
      type as any,
      status as any
    );
    return successResponse(res, proposals, 'Barter proposals retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get barter suggestions for a property
 */
export const getBarterSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const suggestions = await propertyService.getBarterSuggestions(id, userId);
    return successResponse(res, suggestions, 'Barter suggestions retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Rental Management
// ============================================

/**
 * Create rental contract
 */
export const createRentalContract = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const landlordId = req.user!.id;
    const result = await rentalService.createRentalContract(landlordId, req.body);
    return successResponse(res, result, 'Rental contract created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get rental contract
 */
export const getRentalContract = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const contract = await rentalService.getRentalContractById(id, userId);
    return successResponse(res, contract, 'Rental contract retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Activate rental contract
 */
export const activateRentalContract = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const contract = await rentalService.activateContract(id, userId);
    return successResponse(res, contract, 'Rental contract activated');
  } catch (error) {
    next(error);
  }
};

/**
 * Terminate rental contract
 */
export const terminateRentalContract = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { reason } = req.body;
    const contract = await rentalService.terminateContract(id, userId, reason);
    return successResponse(res, contract, 'Rental contract terminated');
  } catch (error) {
    next(error);
  }
};

/**
 * Protect deposit
 */
export const protectDeposit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const result = await rentalService.protectDeposit(id, userId);
    return successResponse(res, result, 'Deposit protection enabled');
  } catch (error) {
    next(error);
  }
};

/**
 * Request deposit return
 */
export const requestDepositReturn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { checkoutDate } = req.body;
    const result = await rentalService.requestDepositReturn(id, userId, new Date(checkoutDate));
    return successResponse(res, result, 'Deposit return requested');
  } catch (error) {
    next(error);
  }
};

/**
 * Release deposit
 */
export const releaseDeposit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { deductions } = req.body;
    const result = await rentalService.releaseDeposit(id, userId, deductions);
    return successResponse(res, result, 'Deposit released successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Dispute deposit
 */
export const disputeDeposit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const result = await rentalService.disputeDeposit(id, userId, req.body);
    return successResponse(res, result, 'Dispute opened successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Record rental payment
 */
export const recordRentalPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const payment = await rentalService.recordPayment(id, userId, req.body);
    return successResponse(res, payment, 'Payment recorded successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's rental contracts
 */
export const getUserRentalContracts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { role, status } = req.query;
    const contracts = await rentalService.getUserRentalContracts(
      userId,
      role as any,
      status as any
    );
    return successResponse(res, contracts, 'Rental contracts retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Field Inspection
// ============================================

/**
 * Request inspection
 */
export const requestInspection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const result = await inspectionService.requestInspection(userId, req.body);
    return successResponse(res, result, 'Inspection requested successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get inspection
 */
export const getInspection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const inspection = await inspectionService.getInspectionById(id, userId);
    return successResponse(res, inspection, 'Inspection retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Pay for inspection
 */
export const payForInspection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { paymentMethod, paymentReference } = req.body;
    const result = await inspectionService.payForInspection(id, userId, paymentMethod, paymentReference);
    return successResponse(res, result, 'Payment successful');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's inspections
 */
export const getUserInspections = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { status } = req.query;
    const inspections = await inspectionService.getUserInspections(userId, status as any);
    return successResponse(res, inspections, 'Inspections retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Schedule inspection (inspector)
 */
export const scheduleInspection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { scheduledAt } = req.body;
    const inspection = await inspectionService.scheduleInspection(id, userId, new Date(scheduledAt));
    return successResponse(res, inspection, 'Inspection scheduled successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Start inspection (inspector)
 */
export const startInspection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { gpsCoordinates } = req.body;
    const inspection = await inspectionService.startInspection(id, userId, gpsCoordinates);
    return successResponse(res, inspection, 'Inspection started');
  } catch (error) {
    next(error);
  }
};

/**
 * Complete inspection (inspector)
 */
export const completeInspection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const inspection = await inspectionService.completeInspection(id, userId, req.body);
    return successResponse(res, inspection, 'Inspection completed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Register as inspector
 */
export const registerAsInspector = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const inspector = await inspectionService.registerAsInspector(userId, req.body);
    return successResponse(res, inspector, 'Registered as inspector', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get inspector's inspections
 */
export const getInspectorInspections = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { status } = req.query;
    const inspections = await inspectionService.getInspectorInspections(userId, status as any);
    return successResponse(res, inspections, 'Inspector inspections retrieved successfully');
  } catch (error) {
    next(error);
  }
};
