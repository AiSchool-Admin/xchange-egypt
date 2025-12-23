import prisma from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import {
  generateFounderAccessToken,
  generateFounderRefreshToken,
  verifyFounderRefreshToken
} from '../utils/founderJwt';
import { UnauthorizedError } from '../utils/errors';

// ==========================================
// Founder Authentication - المؤسس ورئيس مجلس الإدارة
// ==========================================

interface FounderLoginInput {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Login founder - تسجيل دخول المؤسس
 */
export const loginFounder = async (input: FounderLoginInput) => {
  const { email, password, ipAddress, userAgent } = input;

  const founder = await prisma.founder.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!founder) {
    throw new UnauthorizedError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  // Check if account is locked
  if (founder.lockedUntil && new Date(founder.lockedUntil) > new Date()) {
    const remainingMinutes = Math.ceil(
      (new Date(founder.lockedUntil).getTime() - Date.now()) / 60000
    );
    throw new UnauthorizedError(`الحساب مقفل. يرجى المحاولة بعد ${remainingMinutes} دقيقة`);
  }

  // Verify password
  const isValidPassword = await comparePassword(password, founder.passwordHash);

  if (!isValidPassword) {
    // Increment failed attempts
    const failedAttempts = founder.failedLoginAttempts + 1;
    const updates: any = { failedLoginAttempts: failedAttempts };

    // Lock account after 3 failed attempts (stricter for founder)
    if (failedAttempts >= 3) {
      updates.lockedUntil = new Date(Date.now() + 60 * 60000); // 60 minutes
      updates.failedLoginAttempts = 0;
    }

    await prisma.founder.update({
      where: { id: founder.id },
      data: updates,
    });

    throw new UnauthorizedError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  // Generate tokens
  const accessToken = generateFounderAccessToken({
    founderId: founder.id,
    email: founder.email,
  });

  const refreshToken = generateFounderRefreshToken({
    founderId: founder.id,
    email: founder.email,
  });

  // Store refresh token
  await prisma.founderRefreshToken.create({
    data: {
      token: refreshToken,
      founderId: founder.id,
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
      ipAddress,
      userAgent,
    },
  });

  // Update login info and reset failed attempts
  await prisma.founder.update({
    where: { id: founder.id },
    data: {
      lastLoginAt: new Date(),
      lastLoginIp: ipAddress,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  return {
    accessToken,
    refreshToken,
    founder: {
      id: founder.id,
      email: founder.email,
      fullName: founder.fullName,
      title: founder.title,
      companyName: founder.companyName,
      avatar: founder.avatar,
    },
  };
};

/**
 * Refresh founder token - تحديث رمز المؤسس
 */
export const refreshFounderToken = async (refreshToken: string, ipAddress?: string, userAgent?: string) => {
  // Verify token
  let decoded;
  try {
    decoded = verifyFounderRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError('رمز التحديث غير صالح');
  }

  // Check if token exists in database
  const storedToken = await prisma.founderRefreshToken.findUnique({
    where: { token: refreshToken },
    include: { founder: true },
  });

  if (!storedToken) {
    throw new UnauthorizedError('رمز التحديث غير موجود');
  }

  if (new Date(storedToken.expiresAt) < new Date()) {
    // Delete expired token
    await prisma.founderRefreshToken.delete({
      where: { id: storedToken.id },
    });
    throw new UnauthorizedError('انتهت صلاحية رمز التحديث');
  }

  const founder = storedToken.founder;

  // Generate new tokens
  const newAccessToken = generateFounderAccessToken({
    founderId: founder.id,
    email: founder.email,
  });

  const newRefreshToken = generateFounderRefreshToken({
    founderId: founder.id,
    email: founder.email,
  });

  // Delete old refresh token
  await prisma.founderRefreshToken.delete({
    where: { id: storedToken.id },
  });

  // Create new refresh token
  await prisma.founderRefreshToken.create({
    data: {
      token: newRefreshToken,
      founderId: founder.id,
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
      ipAddress,
      userAgent,
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * Logout founder - تسجيل خروج المؤسس
 */
export const logoutFounder = async (refreshToken: string) => {
  try {
    await prisma.founderRefreshToken.delete({
      where: { token: refreshToken },
    });
  } catch {
    // Token already deleted or doesn't exist
  }
};

/**
 * Get founder profile - الحصول على بيانات المؤسس
 */
export const getFounderProfile = async (founderId: string) => {
  const founder = await prisma.founder.findUnique({
    where: { id: founderId },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      avatar: true,
      title: true,
      companyName: true,
      twoFactorEnabled: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  if (!founder) {
    throw new UnauthorizedError('المؤسس غير موجود');
  }

  return founder;
};

/**
 * Update founder profile - تحديث بيانات المؤسس
 */
export const updateFounderProfile = async (
  founderId: string,
  data: {
    fullName?: string;
    phone?: string;
    avatar?: string;
    title?: string;
    companyName?: string;
  }
) => {
  return prisma.founder.update({
    where: { id: founderId },
    data,
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      avatar: true,
      title: true,
      companyName: true,
    },
  });
};

/**
 * Change founder password - تغيير كلمة مرور المؤسس
 */
export const changeFounderPassword = async (
  founderId: string,
  currentPassword: string,
  newPassword: string
) => {
  const founder = await prisma.founder.findUnique({
    where: { id: founderId },
  });

  if (!founder) {
    throw new UnauthorizedError('المؤسس غير موجود');
  }

  const isValid = await comparePassword(currentPassword, founder.passwordHash);
  if (!isValid) {
    throw new UnauthorizedError('كلمة المرور الحالية غير صحيحة');
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.founder.update({
    where: { id: founderId },
    data: { passwordHash },
  });

  // Invalidate all refresh tokens (force re-login)
  await prisma.founderRefreshToken.deleteMany({
    where: { founderId },
  });

  return { message: 'تم تغيير كلمة المرور بنجاح' };
};

/**
 * Get board statistics for founder - إحصائيات مجلس الإدارة
 */
export const getFounderBoardStats = async (founderId: string) => {
  const [
    totalConversations,
    activeConversations,
    totalMessages,
    totalDecisions,
    pendingTasks,
  ] = await Promise.all([
    prisma.boardConversation.count({ where: { founderId } }),
    prisma.boardConversation.count({ where: { founderId, status: 'ACTIVE' } }),
    prisma.boardMessage.count({ where: { founderId } }),
    prisma.boardDecision.count({ where: { decidedById: founderId } }),
    prisma.boardTask.count({ where: { approvedById: founderId, status: 'PENDING' } }),
  ]);

  return {
    totalConversations,
    activeConversations,
    totalMessages,
    totalDecisions,
    pendingTasks,
  };
};
