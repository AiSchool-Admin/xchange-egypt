/**
 * Error Handler Middleware
 * Re-exports error classes from utils/errors.ts for backwards compatibility
 */

// Re-export all error classes from the canonical source
export {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
} from '../utils/errors';
