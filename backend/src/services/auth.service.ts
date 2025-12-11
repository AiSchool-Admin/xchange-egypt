import prisma from '../config/database';
import { UserType } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, generatePasswordResetToken, verifyPasswordResetToken } from '../utils/jwt';
import {
  ConflictError,
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
} from '../utils/errors';
import type {
  RegisterIndividualInput,
  RegisterBusinessInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../validations/auth.validation';

/**
 * Register a new individual user
 */
export const registerIndividual = async (data: RegisterIndividualInput) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Check if phone number already exists (if provided)
  if (data.phone) {
    const existingPhone = await prisma.user.findUnique({
      where: { phone: data.phone },
    });

    if (existingPhone) {
      throw new ConflictError('User with this phone number already exists');
    }
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      phone: data.phone,
      city: data.city,
      governorate: data.governorate,
      userType: UserType.INDIVIDUAL,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      userType: true,
      city: true,
      governorate: true,
      createdAt: true,
    },
  });

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    userType: user.userType,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    userType: user.userType,
  });

  // Store refresh token in database
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};

/**
 * Register a new business user
 */
export const registerBusiness = async (data: RegisterBusinessInput) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Check if phone number already exists (only if phone is provided)
  if (data.phone) {
    const existingPhone = await prisma.user.findUnique({
      where: { phone: data.phone },
    });

    if (existingPhone) {
      throw new ConflictError('User with this phone number already exists');
    }
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      phone: data.phone,
      city: data.city,
      governorate: data.governorate,
      businessName: data.businessName,
      taxId: data.taxId,
      commercialRegNo: data.commercialRegNo,
      userType: UserType.BUSINESS,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      userType: true,
      businessName: true,
      taxId: true,
      commercialRegNo: true,
      city: true,
      governorate: true,
      createdAt: true,
    },
  });

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    userType: user.userType,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    userType: user.userType,
  });

  // Store refresh token in database
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};

/**
 * Login user
 */
export const login = async (data: LoginInput) => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Check if account is active
  if (user.status !== 'ACTIVE') {
    throw new UnauthorizedError('Your account has been suspended');
  }

  // Compare password
  const isPasswordValid = await comparePassword(data.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    userType: user.userType,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    userType: user.userType,
  });

  // Store refresh token in database
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  // Return user data (without password)
  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (refreshToken: string) => {
  // Verify refresh token
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  // Check if refresh token exists in database
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!storedToken) {
    throw new UnauthorizedError('Refresh token not found');
  }

  // Check if token is expired
  if (storedToken.expiresAt < new Date()) {
    // Delete expired token
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });
    throw new UnauthorizedError('Refresh token has expired');
  }

  // Check if user is active
  if (storedToken.user.status !== 'ACTIVE') {
    throw new UnauthorizedError('User account is not active');
  }

  // Generate new access token
  const newAccessToken = generateAccessToken({
    userId: decoded.userId,
    email: decoded.email,
    userType: decoded.userType,
  });

  return {
    accessToken: newAccessToken,
    refreshToken, // Return the same refresh token
  };
};

/**
 * Logout user (invalidate refresh token)
 */
export const logout = async (refreshToken: string) => {
  // Delete refresh token from database
  const deleted = await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });

  if (deleted.count === 0) {
    throw new NotFoundError('Refresh token not found');
  }

  return { message: 'Logged out successfully' };
};

/**
 * Logout from all devices (invalidate all refresh tokens for user)
 */
export const logoutAll = async (userId: string) => {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });

  return { message: 'Logged out from all devices' };
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      userType: true,
      status: true,
      emailVerified: true,
      phoneVerified: true,
      avatar: true,
      bio: true,
      address: true,
      city: true,
      governorate: true,
      postalCode: true,
      businessName: true,
      taxId: true,
      commercialRegNo: true,
      rating: true,
      totalReviews: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

/**
 * Update user profile
 */
export interface UpdateProfileInput {
  fullName?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  address?: string;
  city?: string;
  governorate?: string;
  district?: string;
  street?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  businessName?: string;
  taxId?: string;
  commercialRegNo?: string;
}

export const updateProfile = async (userId: string, data: UpdateProfileInput) => {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new NotFoundError('User not found');
  }

  // Check if phone number is being changed and is unique
  if (data.phone && data.phone !== existingUser.phone) {
    const existingPhone = await prisma.user.findUnique({
      where: { phone: data.phone },
    });

    if (existingPhone) {
      throw new ConflictError('User with this phone number already exists');
    }
  }

  // Update user
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      fullName: data.fullName,
      phone: data.phone,
      avatar: data.avatar,
      bio: data.bio,
      address: data.address,
      city: data.city,
      governorate: data.governorate,
      postalCode: data.postalCode,
      businessName: data.businessName,
      taxId: data.taxId,
      commercialRegNo: data.commercialRegNo,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      userType: true,
      status: true,
      emailVerified: true,
      phoneVerified: true,
      avatar: true,
      bio: true,
      address: true,
      city: true,
      governorate: true,
      postalCode: true,
      businessName: true,
      taxId: true,
      commercialRegNo: true,
      rating: true,
      totalReviews: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

/**
 * Request password reset
 * Returns reset token (in production, this would be sent via email)
 */
export const forgotPassword = async (data: ForgotPasswordInput) => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true, email: true, fullName: true, status: true },
  });

  // Always return success to prevent email enumeration attacks
  if (!user || user.status !== 'ACTIVE') {
    return { message: 'If your email is registered, you will receive a password reset link.' };
  }

  // Generate password reset token
  const resetToken = generatePasswordResetToken({
    userId: user.id,
    email: user.email,
  });

  // In production, send email with reset link
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  // TODO: Send email with reset link using email service
  // await sendEmail({
  //   to: user.email,
  //   subject: 'Password Reset Request',
  //   template: 'USER_PASSWORD_RESET',
  //   data: { userName: user.fullName, actionUrl: resetUrl }
  // });

  console.log(`Password reset URL for ${user.email}: ${resetUrl}`);

  return {
    message: 'If your email is registered, you will receive a password reset link.',
    // Only include resetUrl in development for testing
    ...(process.env.NODE_ENV === 'development' ? { resetUrl, resetToken } : {}),
  };
};

/**
 * Reset password using token
 */
export const resetPassword = async (data: ResetPasswordInput) => {
  // Verify reset token
  let decoded;
  try {
    decoded = verifyPasswordResetToken(data.token);
  } catch (error) {
    throw new BadRequestError('Invalid or expired password reset token');
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.status !== 'ACTIVE') {
    throw new BadRequestError('User account is not active');
  }

  // Hash new password
  const passwordHash = await hashPassword(data.password);

  // Update password
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  // Invalidate all refresh tokens for security
  await prisma.refreshToken.deleteMany({
    where: { userId: user.id },
  });

  return { message: 'Password has been reset successfully. Please log in with your new password.' };
};
