import { User } from '@prisma/client';

// User type returned from auth middleware (subset of full User model)
export type AuthUser = Pick<User, 'id' | 'email' | 'fullName' | 'userType' | 'status' | 'avatar' | 'rating'>;

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      userId?: string;
    }
  }
}
