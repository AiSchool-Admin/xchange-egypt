import prisma from '../config/database';
import { UserType, UserStatus } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
  ConflictError,
} from '../utils/errors';
import type {
  UpdateIndividualProfileInput,
  UpdateBusinessProfileInput,
  ChangePasswordInput,
} from '../validations/user.validation';

/**
 * Get user by ID (public profile)
 * Returns only public information
 */
export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      userType: true,
      avatar: true,
      bio: true,
      city: true,
      governorate: true,
      businessName: true,
      rating: true,
      totalReviews: true,
      createdAt: true,
      // Exclude sensitive information
      email: false,
      phone: false,
      passwordHash: false,
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.status === UserStatus.DELETED) {
    throw new NotFoundError('User not found');
  }

  return user;
};

/**
 * Update user profile (Individual)
 */
export const updateIndividualProfile = async (
  userId: string,
  data: UpdateIndividualProfileInput
) => {
  // Get current user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.userType !== UserType.INDIVIDUAL) {
    throw new BadRequestError('This endpoint is for individual accounts only');
  }

  // Check if phone is being updated and if it's already taken
  if (data.phone && data.phone !== user.phone) {
    const existingPhone = await prisma.user.findUnique({
      where: { phone: data.phone },
    });

    if (existingPhone) {
      throw new ConflictError('Phone number is already in use');
    }
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      fullName: data.fullName,
      phone: data.phone,
      bio: data.bio,
      address: data.address,
      city: data.city,
      governorate: data.governorate,
      postalCode: data.postalCode,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      userType: true,
      avatar: true,
      bio: true,
      address: true,
      city: true,
      governorate: true,
      postalCode: true,
      rating: true,
      totalReviews: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

/**
 * Update user profile (Business)
 */
export const updateBusinessProfile = async (
  userId: string,
  data: UpdateBusinessProfileInput
) => {
  // Get current user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.userType !== UserType.BUSINESS) {
    throw new BadRequestError('This endpoint is for business accounts only');
  }

  // Check if phone is being updated and if it's already taken
  if (data.phone && data.phone !== user.phone) {
    const existingPhone = await prisma.user.findUnique({
      where: { phone: data.phone },
    });

    if (existingPhone) {
      throw new ConflictError('Phone number is already in use');
    }
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      fullName: data.fullName,
      phone: data.phone,
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
      updatedAt: true,
    },
  });

  return updatedUser;
};

/**
 * Change user password
 */
export const changePassword = async (userId: string, data: ChangePasswordInput) => {
  // Validate confirm password
  if (data.newPassword !== data.confirmPassword) {
    throw new BadRequestError('New password and confirm password do not match');
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Verify current password
  const isPasswordValid = await comparePassword(data.currentPassword, user.passwordHash);

  if (!isPasswordValid) {
    throw new BadRequestError('Current password is incorrect');
  }

  // Check if new password is same as old password
  const isSamePassword = await comparePassword(data.newPassword, user.passwordHash);

  if (isSamePassword) {
    throw new BadRequestError('New password must be different from current password');
  }

  // Hash new password
  const newPasswordHash = await hashPassword(data.newPassword);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });

  // Invalidate all refresh tokens (logout from all devices)
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });

  return { message: 'Password changed successfully. Please login again.' };
};

/**
 * Update user avatar
 */
export const updateAvatar = async (userId: string, avatarUrl: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { avatar: avatarUrl },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatar: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

/**
 * Delete user avatar
 */
export const deleteAvatar = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (!user.avatar) {
    throw new BadRequestError('No avatar to delete');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { avatar: null },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatar: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

/**
 * Delete user account (soft delete)
 */
export const deleteAccount = async (userId: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new BadRequestError('Password is incorrect');
  }

  // Soft delete (change status to DELETED)
  await prisma.user.update({
    where: { id: userId },
    data: {
      status: UserStatus.DELETED,
      // Optionally anonymize data
      email: `deleted_${userId}@deleted.com`,
      phone: null,
    },
  });

  // Delete all refresh tokens
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });

  return { message: 'Account deleted successfully' };
};

/**
 * Get user statistics (for profile)
 */
export const getUserStats = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Get counts
  const [itemsCount, activeListingsCount, completedTransactionsCount] = await Promise.all([
    prisma.item.count({
      where: { sellerId: userId, status: { not: 'DELETED' } },
    }),
    prisma.listing.count({
      where: { userId, status: 'ACTIVE' },
    }),
    prisma.transaction.count({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
        paymentStatus: 'COMPLETED',
      },
    }),
  ]);

  return {
    itemsCount,
    activeListingsCount,
    completedTransactionsCount,
    rating: user.rating,
    totalReviews: user.totalReviews,
  };
};
