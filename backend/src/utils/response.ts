import { Response } from 'express';

/**
 * Standard API response format
 */
interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    details?: unknown;
  };
}

/**
 * Send success response
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  details?: unknown
): Response => {
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      details,
    },
  };
  return res.status(statusCode).json(response);
};

/**
 * Send created response (201)
 */
export const sendCreated = <T>(res: Response, data: T, message = 'Created'): Response => {
  return sendSuccess(res, data, message, 201);
};

/**
 * Send no content response (204)
 */
export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};

/**
 * Alias for sendSuccess (for backward compatibility)
 */
export const successResponse = sendSuccess;
