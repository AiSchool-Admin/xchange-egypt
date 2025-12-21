/**
 * Prisma Mock for Testing
 * Provides a mock Prisma client when the real one is not available
 */

// Check if we're in a test environment
const isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

// Try to import real Prisma, fall back to mock
let PrismaClient: any;
let prismaInstance: any;

try {
  // Try to import real Prisma
  const prismaModule = require('@prisma/client');
  PrismaClient = prismaModule.PrismaClient;
} catch {
  // Prisma not generated, use mock
  PrismaClient = null;
}

/**
 * Mock Prisma Client for testing
 */
class MockPrismaClient {
  private mockData: Record<string, any[]> = {};

  constructor() {
    // Initialize mock tables
    this.mockData = {
      user: [],
      item: [],
      category: [],
      auction: [],
      barter: [],
      order: [],
      notification: [],
    };
  }

  // Helper: filter data by where clause
  private filterByWhere(data: any[], where: any): any[] {
    return data.filter((item: any) => {
      return Object.keys(where).every((key) => {
        const condition = where[key];
        if (key === 'AND') {
          return condition.every((c: any) => this.filterByWhere([item], c).length > 0);
        }
        if (key === 'OR') {
          return condition.some((c: any) => this.filterByWhere([item], c).length > 0);
        }
        if (key === 'NOT') {
          return this.filterByWhere([item], condition).length === 0;
        }
        if (typeof condition === 'object' && condition !== null) {
          if ('not' in condition) return item[key] !== condition.not;
          if ('in' in condition) return condition.in.includes(item[key]);
          if ('notIn' in condition) return !condition.notIn.includes(item[key]);
          if ('lt' in condition) return item[key] < condition.lt;
          if ('lte' in condition) return item[key] <= condition.lte;
          if ('gt' in condition) return item[key] > condition.gt;
          if ('gte' in condition) return item[key] >= condition.gte;
          if ('contains' in condition) return String(item[key]).includes(condition.contains);
          if ('startsWith' in condition) return String(item[key]).startsWith(condition.startsWith);
          if ('endsWith' in condition) return String(item[key]).endsWith(condition.endsWith);
        }
        return item[key] === condition;
      });
    });
  }

  // Helper: sort data by orderBy clause
  private sortByOrderBy(data: any[], orderBy: any): any[] {
    const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
    return [...data].sort((a, b) => {
      for (const order of orderByArray) {
        const [key, direction] = Object.entries(order)[0];
        const aVal = a[key];
        const bVal = b[key];
        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Generic model methods
  private createModelMethods(modelName: string) {
    return {
      findMany: async (args?: any) => {
        let data = [...(this.mockData[modelName] || [])];
        if (args?.where) {
          data = this.filterByWhere(data, args.where);
        }
        if (args?.orderBy) {
          data = this.sortByOrderBy(data, args.orderBy);
        }
        if (args?.skip) data = data.slice(args.skip);
        if (args?.take) data = data.slice(0, args.take);
        return data;
      },
      findUnique: async (args: any) => {
        const data = this.mockData[modelName] || [];
        return data.find((item: any) => {
          return Object.keys(args.where).every((key) => {
            const condition = args.where[key];
            if (typeof condition === 'object' && condition !== null) {
              // Handle compound unique constraints like { email_phone: { email, phone } }
              return Object.keys(condition).every((k) => item[k] === condition[k]);
            }
            return item[key] === condition;
          });
        }) || null;
      },
      findFirst: async (args?: any) => {
        let data = [...(this.mockData[modelName] || [])];
        if (args?.where) {
          data = this.filterByWhere(data, args.where);
        }
        if (args?.orderBy) {
          data = this.sortByOrderBy(data, args.orderBy);
        }
        return data[0] || null;
      },
      create: async (args: any) => {
        const newItem = {
          id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...args.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        if (!this.mockData[modelName]) this.mockData[modelName] = [];
        this.mockData[modelName].push(newItem);
        return newItem;
      },
      update: async (args: any) => {
        const data = this.mockData[modelName] || [];
        // Find by any field in where clause
        const index = data.findIndex((item: any) => {
          return Object.keys(args.where).every((key) => item[key] === args.where[key]);
        });
        if (index !== -1) {
          // Handle special Prisma operators
          const updateData: any = {};
          for (const [key, value] of Object.entries(args.data)) {
            if (typeof value === 'object' && value !== null) {
              const op = value as any;
              if ('increment' in op) {
                updateData[key] = (data[index][key] || 0) + op.increment;
              } else if ('decrement' in op) {
                updateData[key] = (data[index][key] || 0) - op.decrement;
              } else if ('set' in op) {
                updateData[key] = op.set;
              } else if ('multiply' in op) {
                updateData[key] = (data[index][key] || 0) * op.multiply;
              } else if ('divide' in op) {
                updateData[key] = (data[index][key] || 0) / op.divide;
              } else if ('push' in op) {
                updateData[key] = [...(data[index][key] || []), op.push];
              } else {
                updateData[key] = value;
              }
            } else {
              updateData[key] = value;
            }
          }
          data[index] = { ...data[index], ...updateData, updatedAt: new Date() };
          return data[index];
        }
        throw new Error('Record not found');
      },
      delete: async (args: any) => {
        const data = this.mockData[modelName] || [];
        const index = data.findIndex((item: any) => item.id === args.where.id);
        if (index !== -1) {
          const deleted = data.splice(index, 1);
          return deleted[0];
        }
        throw new Error('Record not found');
      },
      count: async (args?: any) => {
        let data = this.mockData[modelName] || [];
        if (args?.where) {
          data = data.filter((item: any) => {
            return Object.keys(args.where).every((key) => item[key] === args.where[key]);
          });
        }
        return data.length;
      },
      createMany: async (args: any) => {
        const items = args.data.map((d: any) => ({
          id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...d,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
        if (!this.mockData[modelName]) this.mockData[modelName] = [];
        this.mockData[modelName].push(...items);
        return { count: items.length };
      },
      updateMany: async (args: any) => {
        let data = this.mockData[modelName] || [];
        let count = 0;
        if (args?.where) {
          data.forEach((item: any, index: number) => {
            const matches = Object.keys(args.where).every((key) => item[key] === args.where[key]);
            if (matches) {
              this.mockData[modelName][index] = { ...item, ...args.data, updatedAt: new Date() };
              count++;
            }
          });
        }
        return { count };
      },
      deleteMany: async (args?: any) => {
        let data = this.mockData[modelName] || [];
        if (args?.where) {
          const toDelete = data.filter((item: any) => {
            return Object.keys(args.where).every((key) => item[key] === args.where[key]);
          });
          this.mockData[modelName] = data.filter((item: any) => !toDelete.includes(item));
          return { count: toDelete.length };
        }
        const count = data.length;
        this.mockData[modelName] = [];
        return { count };
      },
      aggregate: async (_args?: any) => {
        return { _count: { _all: this.mockData[modelName]?.length || 0 }, _sum: {}, _avg: {}, _min: {}, _max: {} };
      },
      groupBy: async (_args?: any) => {
        return [];
      },
      upsert: async (args: any) => {
        const data = this.mockData[modelName] || [];
        const existing = data.find((item: any) => item.id === args.where.id);
        if (existing) {
          const index = data.findIndex((item: any) => item.id === args.where.id);
          data[index] = { ...data[index], ...args.update, updatedAt: new Date() };
          return data[index];
        }
        const newItem = {
          id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...args.create,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        if (!this.mockData[modelName]) this.mockData[modelName] = [];
        this.mockData[modelName].push(newItem);
        return newItem;
      },
    };
  }

  // Model accessors
  get user() { return this.createModelMethods('user'); }
  get item() { return this.createModelMethods('item'); }
  get category() { return this.createModelMethods('category'); }
  get auction() { return this.createModelMethods('auction'); }
  get bid() { return this.createModelMethods('bid'); }
  get barter() { return this.createModelMethods('barter'); }
  get barterRequest() { return this.createModelMethods('barterRequest'); }
  get barterOffer() { return this.createModelMethods('barterOffer'); }
  get order() { return this.createModelMethods('order'); }
  get notification() { return this.createModelMethods('notification'); }
  get review() { return this.createModelMethods('review'); }
  get message() { return this.createModelMethods('message'); }
  get wallet() { return this.createModelMethods('wallet'); }
  get transaction() { return this.createModelMethods('transaction'); }
  get payment() { return this.createModelMethods('payment'); }
  get escrow() { return this.createModelMethods('escrow'); }
  get subscription() { return this.createModelMethods('subscription'); }
  get badge() { return this.createModelMethods('badge'); }
  get userBadge() { return this.createModelMethods('userBadge'); }
  get searchAlert() { return this.createModelMethods('searchAlert'); }
  get priceAlert() { return this.createModelMethods('priceAlert'); }
  get favoriteItem() { return this.createModelMethods('favoriteItem'); }
  get itemImage() { return this.createModelMethods('itemImage'); }
  get refreshToken() { return this.createModelMethods('refreshToken'); }

  // Prisma methods
  async $connect() { return Promise.resolve(); }
  async $disconnect() { return Promise.resolve(); }
  async $executeRaw() { return 0; }
  async $executeRawUnsafe() { return 0; }
  async $queryRaw() { return []; }
  async $queryRawUnsafe() { return []; }
  async $transaction(fn: any) {
    if (Array.isArray(fn)) {
      return Promise.all(fn);
    }
    return fn(this);
  }

  // Reset mock data
  $reset() {
    Object.keys(this.mockData).forEach((key) => {
      this.mockData[key] = [];
    });
  }

  // Seed mock data
  $seed(modelName: string, data: any[]) {
    this.mockData[modelName] = data;
  }
}

/**
 * Get Prisma client (real or mock)
 */
export const getTestDb = (): any => {
  if (!prismaInstance) {
    if (PrismaClient && !isTestEnvironment) {
      // Use real Prisma in non-test environments
      prismaInstance = new PrismaClient({
        datasources: {
          db: {
            url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
          },
        },
      });
    } else {
      // Use mock in test environment or when Prisma is not available
      prismaInstance = new MockPrismaClient();
    }
  }
  return prismaInstance;
};

/**
 * Clean database (works with both real and mock)
 */
export const cleanDatabase = async () => {
  const db = getTestDb();
  if (db.$reset) {
    db.$reset();
  } else {
    // Real Prisma cleanup
    await db.$executeRawUnsafe('SET session_replication_role = replica;');
    const tables = (await db.$queryRawUnsafe(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename != '_prisma_migrations'
    `)) as Array<{ tablename: string }>;
    for (const { tablename } of tables) {
      await db.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
    }
    await db.$executeRawUnsafe('SET session_replication_role = DEFAULT;');
  }
};

/**
 * Disconnect database
 */
export const disconnectTestDb = async () => {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
};

/**
 * Seed test data
 */
export const seedTestData = async () => {
  const db = getTestDb();

  const category = await db.category.create({
    data: {
      nameEn: 'Test Electronics',
      nameAr: 'إلكترونيات تجريبية',
      slug: 'test-electronics',
      icon: '📱',
      level: 1,
      isActive: true,
    },
  });

  return { category };
};

export { MockPrismaClient };
export default getTestDb;
