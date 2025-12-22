/**
 * Prisma type overrides to fix JSON type compatibility issues
 * This file extends Prisma's types to be more permissive with JSON fields
 */

import { Prisma } from '@prisma/client';

// Extend the InputJsonValue type to accept more types
declare module '@prisma/client' {
  namespace Prisma {
    // Make JSON input types more permissive
    type InputJsonValue =
      | string
      | number
      | boolean
      | null
      | { [key: string]: any }
      | any[];

    type JsonValue =
      | string
      | number
      | boolean
      | null
      | { [key: string]: any }
      | any[];
  }
}

// Extend global to avoid type conflicts
declare global {
  namespace PrismaJson {
    type InputValue = Record<string, any> | any[] | string | number | boolean | null;
  }
}

export {};
