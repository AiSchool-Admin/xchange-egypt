import { UserType, UserStatus } from '../middleware/auth';
import { AdminRole, AdminStatus } from '../middleware/adminAuth';

// User type returned from auth middleware (subset of full User model)
export interface AuthUser {
  id: string;
  email: string | null;
  fullName: string | null;
  userType: UserType;
  status: UserStatus;
  avatar: string | null;
  rating: number;
}

// Admin type returned from admin auth middleware (subset of full Admin model)
export interface AuthAdmin {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  status: AdminStatus;
  avatar: string | null;
  customPermissions: string[];
  twoFactorEnabled: boolean;
  lockedUntil: Date | null;
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      userId?: string;
      admin?: AuthAdmin;
      adminId?: string;
    }
  }
}
