/**
 * Mock Prisma client for testing
 */

import { getTestDb } from '../../../tests/helpers/testDb';

// Export the mock Prisma client
const prisma = getTestDb();

export default prisma;
