/**
 * Enhanced Prisma Mock for Testing
 * Provides a comprehensive mock Prisma client with full feature support
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
 * Include options interface for nested queries
 */
interface IncludeOptions {
  include?: Record<string, boolean | IncludeOptions>;
  select?: Record<string, boolean | IncludeOptions>;
  where?: Record<string, any>;
  orderBy?: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[];
  skip?: number;
  take?: number;
}

/**
 * Relation definitions for models
 */
const MODEL_RELATIONS: Record<string, Record<string, { model: string; type: 'one' | 'many'; foreignKey: string }>> = {
  user: {
    items: { model: 'item', type: 'many', foreignKey: 'sellerId' },
    reviews: { model: 'review', type: 'many', foreignKey: 'revieweeId' },
    reviewsGiven: { model: 'review', type: 'many', foreignKey: 'reviewerId' },
    notifications: { model: 'notification', type: 'many', foreignKey: 'userId' },
    wallet: { model: 'wallet', type: 'one', foreignKey: 'userId' },
    bids: { model: 'auctionBid', type: 'many', foreignKey: 'bidderId' },
  },
  item: {
    seller: { model: 'user', type: 'one', foreignKey: 'sellerId' },
    category: { model: 'category', type: 'one', foreignKey: 'categoryId' },
    desiredCategory: { model: 'category', type: 'one', foreignKey: 'desiredCategoryId' },
    images: { model: 'itemImage', type: 'many', foreignKey: 'itemId' },
    auctions: { model: 'auction', type: 'many', foreignKey: 'itemId' },
    reviews: { model: 'review', type: 'many', foreignKey: 'itemId' },
  },
  category: {
    parent: { model: 'category', type: 'one', foreignKey: 'parentId' },
    subcategories: { model: 'category', type: 'many', foreignKey: 'parentId' },
    children: { model: 'category', type: 'many', foreignKey: 'parentId' }, // alias for subcategories
    items: { model: 'item', type: 'many', foreignKey: 'categoryId' },
  },
  auction: {
    seller: { model: 'user', type: 'one', foreignKey: 'sellerId' },
    item: { model: 'item', type: 'one', foreignKey: 'itemId' },
    bids: { model: 'auctionBid', type: 'many', foreignKey: 'auctionId' },
    winner: { model: 'user', type: 'one', foreignKey: 'winnerId' },
  },
  auctionBid: {
    auction: { model: 'auction', type: 'one', foreignKey: 'auctionId' },
    bidder: { model: 'user', type: 'one', foreignKey: 'bidderId' },
  },
  review: {
    reviewer: { model: 'user', type: 'one', foreignKey: 'reviewerId' },
    reviewee: { model: 'user', type: 'one', foreignKey: 'revieweeId' },
    item: { model: 'item', type: 'one', foreignKey: 'itemId' },
  },
  notification: {
    user: { model: 'user', type: 'one', foreignKey: 'userId' },
  },
  barter: {
    initiator: { model: 'user', type: 'one', foreignKey: 'initiatorId' },
    receiver: { model: 'user', type: 'one', foreignKey: 'receiverId' },
    initiatorItem: { model: 'item', type: 'one', foreignKey: 'initiatorItemId' },
    receiverItem: { model: 'item', type: 'one', foreignKey: 'receiverItemId' },
  },
  barterOffer: {
    barter: { model: 'barter', type: 'one', foreignKey: 'barterId' },
    offerer: { model: 'user', type: 'one', foreignKey: 'offererId' },
    item: { model: 'item', type: 'one', foreignKey: 'itemId' },
  },
  order: {
    user: { model: 'user', type: 'one', foreignKey: 'userId' },
    items: { model: 'orderItem', type: 'many', foreignKey: 'orderId' },
    shippingAddress: { model: 'shippingAddress', type: 'one', foreignKey: 'shippingAddressId' },
  },
  orderItem: {
    order: { model: 'order', type: 'one', foreignKey: 'orderId' },
    listing: { model: 'listing', type: 'one', foreignKey: 'listingId' },
    seller: { model: 'user', type: 'one', foreignKey: 'sellerId' },
  },
  shippingAddress: {
    user: { model: 'user', type: 'one', foreignKey: 'userId' },
    orders: { model: 'order', type: 'many', foreignKey: 'shippingAddressId' },
  },
  listing: {
    item: { model: 'item', type: 'one', foreignKey: 'itemId' },
    user: { model: 'user', type: 'one', foreignKey: 'userId' },
  },
  escrow: {
    buyer: { model: 'user', type: 'one', foreignKey: 'buyerId' },
    seller: { model: 'user', type: 'one', foreignKey: 'sellerId' },
    milestones: { model: 'escrowMilestone', type: 'many', foreignKey: 'escrowId' },
    dispute: { model: 'dispute', type: 'one', foreignKey: 'escrowId' },
    facilitator: { model: 'facilitator', type: 'one', foreignKey: 'facilitatorId' },
  },
  escrowMilestone: {
    escrow: { model: 'escrow', type: 'one', foreignKey: 'escrowId' },
  },
  dispute: {
    escrow: { model: 'escrow', type: 'one', foreignKey: 'escrowId' },
    initiator: { model: 'user', type: 'one', foreignKey: 'initiatorId' },
    respondent: { model: 'user', type: 'one', foreignKey: 'respondentId' },
    messages: { model: 'disputeMessage', type: 'many', foreignKey: 'disputeId' },
  },
  disputeMessage: {
    dispute: { model: 'dispute', type: 'one', foreignKey: 'disputeId' },
    sender: { model: 'user', type: 'one', foreignKey: 'senderId' },
  },
  facilitator: {
    user: { model: 'user', type: 'one', foreignKey: 'userId' },
    escrows: { model: 'escrow', type: 'many', foreignKey: 'facilitatorId' },
  },
};

/**
 * Unique field definitions for each model
 * Note: Only include fields that are tested for uniqueness
 */
const UNIQUE_FIELDS: Record<string, string[]> = {
  user: ['email', 'phone'],
  refreshToken: ['token'],
};

/**
 * Enhanced Mock Prisma Client for testing
 */
class MockPrismaClient {
  private mockData: Record<string, any[]> = {};

  constructor() {
    // Initialize mock tables - include ALL models used in tests
    this.mockData = {
      user: [],
      item: [],
      category: [],
      listing: [],
      auction: [],
      bid: [],
      auctionBid: [],
      barter: [],
      barterRequest: [],
      barterOffer: [],
      order: [],
      orderItem: [],
      shippingAddress: [],
      notification: [],
      review: [],
      message: [],
      wallet: [],
      walletTransaction: [],
      transaction: [],
      payment: [],
      escrow: [],
      escrowMilestone: [],
      dispute: [],
      disputeMessage: [],
      facilitator: [],
      facilitatorAssignment: [],
      subscription: [],
      badge: [],
      userBadge: [],
      searchAlert: [],
      priceAlert: [],
      favoriteItem: [],
      itemImage: [],
      refreshToken: [],
      reverseAuction: [],
      rentalContract: [],
      rentalPayment: [],
      cashFlow: [],
      match: [],
      adminActivityLog: [],
      cart: [],
      cartItem: [],
    };
  }

  // Helper: filter data by where clause
  private filterByWhere(data: any[], where: any): any[] {
    if (!where || Object.keys(where).length === 0) return data;

    return data.filter((item: any) => {
      return Object.keys(where).every((key) => {
        const condition = where[key];

        // Handle logical operators
        if (key === 'AND') {
          return (Array.isArray(condition) ? condition : [condition])
            .every((c: any) => this.filterByWhere([item], c).length > 0);
        }
        if (key === 'OR') {
          return (Array.isArray(condition) ? condition : [condition])
            .some((c: any) => this.filterByWhere([item], c).length > 0);
        }
        if (key === 'NOT') {
          return this.filterByWhere([item], condition).length === 0;
        }

        // Handle object conditions
        if (typeof condition === 'object' && condition !== null) {
          // Handle null check
          if (condition === null) return item[key] === null;

          // Check if it's a Prisma operator object (has known operators)
          const prismaOperators = ['equals', 'not', 'in', 'notIn', 'lt', 'lte', 'gt', 'gte', 'contains', 'startsWith', 'endsWith', 'mode'];
          const hasOperators = Object.keys(condition).some((k) => prismaOperators.includes(k));

          if (hasOperators) {
            // Handle Prisma operators - ALL conditions must be satisfied
            const checks: boolean[] = [];

            if ('equals' in condition) checks.push(item[key] === condition.equals);
            if ('not' in condition) {
              if (typeof condition.not === 'object' && condition.not !== null) {
                checks.push(!this.filterByWhere([item], { [key]: condition.not }).length);
              } else {
                checks.push(item[key] !== condition.not);
              }
            }
            if ('in' in condition) checks.push(condition.in.includes(item[key]));
            if ('notIn' in condition) checks.push(!condition.notIn.includes(item[key]));
            if ('lt' in condition) checks.push(item[key] < condition.lt);
            if ('lte' in condition) checks.push(item[key] <= condition.lte);
            if ('gt' in condition) checks.push(item[key] > condition.gt);
            if ('gte' in condition) checks.push(item[key] >= condition.gte);
            if ('contains' in condition) {
              const mode = condition.mode === 'insensitive' ? 'i' : '';
              const regex = new RegExp(condition.contains, mode);
              checks.push(regex.test(String(item[key] || '')));
            }
            if ('startsWith' in condition) {
              const mode = condition.mode === 'insensitive' ? 'i' : '';
              const regex = new RegExp(`^${condition.startsWith}`, mode);
              checks.push(regex.test(String(item[key] || '')));
            }
            if ('endsWith' in condition) {
              const mode = condition.mode === 'insensitive' ? 'i' : '';
              const regex = new RegExp(`${condition.endsWith}$`, mode);
              checks.push(regex.test(String(item[key] || '')));
            }

            return checks.every((check) => check === true);
          }

          // Handle nested object (compound keys)
          return Object.keys(condition).every((k) => item[k] === condition[k]);
        }

        // Direct comparison
        return item[key] === condition;
      });
    });
  }

  // Helper: sort data by orderBy clause
  private sortByOrderBy(data: any[], orderBy: any): any[] {
    if (!orderBy) return data;
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

  // Helper: populate relations
  private populateRelations(modelName: string, item: any, include: any, select?: any): any {
    if (!item) return null;

    const result = select ? {} : { ...item };
    const relations = MODEL_RELATIONS[modelName] || {};

    // Handle select
    if (select) {
      for (const [key, value] of Object.entries(select)) {
        if (value === true) {
          result[key] = item[key];
        } else if (typeof value === 'object' && relations[key]) {
          // Nested select on relation
          const relation = relations[key];
          const relatedData = this.mockData[relation.model] || [];

          if (relation.type === 'one') {
            const related = relatedData.find((r: any) => r.id === item[relation.foreignKey]);
            result[key] = related ? this.populateRelations(relation.model, related, null, value) : null;
          } else {
            const related = relatedData.filter((r: any) => r[relation.foreignKey] === item.id);
            result[key] = related.map((r: any) => this.populateRelations(relation.model, r, null, value));
          }
        }
      }
      return result;
    }

    // Handle include
    if (include) {
      for (const [key, value] of Object.entries(include)) {
        const relation = relations[key];
        if (!relation) continue;

        const relatedData = this.mockData[relation.model] || [];
        const includeOptions: IncludeOptions = typeof value === 'object' ? value as IncludeOptions : {};

        if (relation.type === 'one') {
          const related = relatedData.find((r: any) => r.id === item[relation.foreignKey]);
          result[key] = related ? this.populateRelations(relation.model, related, includeOptions.include, includeOptions.select) : null;
        } else {
          let related = relatedData.filter((r: any) => r[relation.foreignKey] === item.id);

          // Apply where filter to related
          if (includeOptions.where) {
            related = this.filterByWhere(related, includeOptions.where);
          }
          // Apply orderBy to related
          if (includeOptions.orderBy) {
            related = this.sortByOrderBy(related, includeOptions.orderBy);
          }
          // Apply take/skip to related
          if (includeOptions.skip) {
            related = related.slice(includeOptions.skip);
          }
          if (includeOptions.take) {
            related = related.slice(0, includeOptions.take);
          }

          result[key] = related.map((r: any) =>
            this.populateRelations(relation.model, r, includeOptions.include, includeOptions.select)
          );
        }
      }
    }

    return result;
  }

  // Helper: apply distinct
  private applyDistinct(data: any[], distinct: string | string[]): any[] {
    const fields = Array.isArray(distinct) ? distinct : [distinct];
    const seen = new Set<string>();

    return data.filter((item) => {
      const key = fields.map((f) => JSON.stringify(item[f])).join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Helper: calculate aggregations
  private calculateAggregate(data: any[], args: any): any {
    const result: any = {};

    if (args._count) {
      if (args._count === true || args._count._all) {
        result._count = { _all: data.length };
      } else {
        result._count = {};
        for (const field of Object.keys(args._count)) {
          if (args._count[field]) {
            result._count[field] = data.filter((item) => item[field] != null).length;
          }
        }
      }
    }

    if (args._sum) {
      result._sum = {};
      for (const field of Object.keys(args._sum)) {
        if (args._sum[field]) {
          result._sum[field] = data.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
        }
      }
    }

    if (args._avg) {
      result._avg = {};
      for (const field of Object.keys(args._avg)) {
        if (args._avg[field]) {
          const values = data.map((item) => Number(item[field])).filter((v) => !isNaN(v));
          result._avg[field] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
        }
      }
    }

    if (args._min) {
      result._min = {};
      for (const field of Object.keys(args._min)) {
        if (args._min[field]) {
          const values = data.map((item) => item[field]).filter((v) => v != null);
          result._min[field] = values.length > 0 ? Math.min(...values) : null;
        }
      }
    }

    if (args._max) {
      result._max = {};
      for (const field of Object.keys(args._max)) {
        if (args._max[field]) {
          const values = data.map((item) => item[field]).filter((v) => v != null);
          result._max[field] = values.length > 0 ? Math.max(...values) : null;
        }
      }
    }

    return result;
  }

  // Generic model methods
  private createModelMethods(modelName: string) {
    return {
      findMany: async (args?: any) => {
        let data = [...(this.mockData[modelName] || [])];

        if (args?.where) {
          data = this.filterByWhere(data, args.where);
        }
        if (args?.distinct) {
          data = this.applyDistinct(data, args.distinct);
        }
        if (args?.orderBy) {
          data = this.sortByOrderBy(data, args.orderBy);
        }
        if (args?.skip) data = data.slice(args.skip);
        if (args?.take) data = data.slice(0, args.take);

        // Handle include/select
        if (args?.include || args?.select) {
          data = data.map((item) => this.populateRelations(modelName, item, args.include, args.select));
        }

        return data;
      },

      findUnique: async (args: any) => {
        const data = this.mockData[modelName] || [];
        const found = data.find((item: any) => {
          return Object.keys(args.where).every((key) => {
            const condition = args.where[key];
            if (typeof condition === 'object' && condition !== null) {
              // Handle compound unique constraints
              return Object.keys(condition).every((k) => item[k] === condition[k]);
            }
            return item[key] === condition;
          });
        }) || null;

        if (found && (args?.include || args?.select)) {
          return this.populateRelations(modelName, found, args.include, args.select);
        }
        return found;
      },

      findFirst: async (args?: any) => {
        let data = [...(this.mockData[modelName] || [])];

        if (args?.where) {
          data = this.filterByWhere(data, args.where);
        }
        if (args?.orderBy) {
          data = this.sortByOrderBy(data, args.orderBy);
        }

        const found = data[0] || null;

        if (found && (args?.include || args?.select)) {
          return this.populateRelations(modelName, found, args.include, args.select);
        }
        return found;
      },

      create: async (args: any) => {
        // Check for unique field violations
        const uniqueFields = UNIQUE_FIELDS[modelName] || [];
        const existingData = this.mockData[modelName] || [];

        for (const field of uniqueFields) {
          if (args.data[field] !== undefined && args.data[field] !== null) {
            const duplicate = existingData.find((item: any) => item[field] === args.data[field]);
            if (duplicate) {
              const error: any = new Error(
                `Unique constraint failed on the fields: (${field})`
              );
              error.code = 'P2002';
              error.meta = { target: [field] };
              throw error;
            }
          }
        }

        const newItem = {
          id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...args.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        if (!this.mockData[modelName]) this.mockData[modelName] = [];
        this.mockData[modelName].push(newItem);

        if (args?.include || args?.select) {
          return this.populateRelations(modelName, newItem, args.include, args.select);
        }
        return newItem;
      },

      update: async (args: any) => {
        const data = this.mockData[modelName] || [];
        const index = data.findIndex((item: any) => {
          return Object.keys(args.where).every((key) => item[key] === args.where[key]);
        });

        if (index !== -1) {
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

          if (args?.include || args?.select) {
            return this.populateRelations(modelName, data[index], args.include, args.select);
          }
          return data[index];
        }
        throw new Error(`Record not found in ${modelName}`);
      },

      delete: async (args: any) => {
        const data = this.mockData[modelName] || [];
        const index = data.findIndex((item: any) => {
          return Object.keys(args.where).every((key) => item[key] === args.where[key]);
        });

        if (index !== -1) {
          const deleted = data.splice(index, 1);
          return deleted[0];
        }
        throw new Error(`Record not found in ${modelName}`);
      },

      count: async (args?: any) => {
        let data = this.mockData[modelName] || [];

        if (args?.where) {
          data = this.filterByWhere(data, args.where);
        }
        if (args?.distinct) {
          data = this.applyDistinct(data, args.distinct);
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

        const indices: number[] = [];
        if (args?.where) {
          data.forEach((item: any, index: number) => {
            if (this.filterByWhere([item], args.where).length > 0) {
              indices.push(index);
            }
          });
        }

        for (const index of indices) {
          this.mockData[modelName][index] = {
            ...this.mockData[modelName][index],
            ...args.data,
            updatedAt: new Date()
          };
          count++;
        }

        return { count };
      },

      deleteMany: async (args?: any) => {
        let data = this.mockData[modelName] || [];

        if (args?.where) {
          const toKeep = data.filter((item: any) => {
            return this.filterByWhere([item], args.where).length === 0;
          });
          const deletedCount = data.length - toKeep.length;
          this.mockData[modelName] = toKeep;
          return { count: deletedCount };
        }

        const count = data.length;
        this.mockData[modelName] = [];
        return { count };
      },

      aggregate: async (args?: any) => {
        let data = this.mockData[modelName] || [];

        if (args?.where) {
          data = this.filterByWhere(data, args.where);
        }

        return this.calculateAggregate(data, args || {});
      },

      groupBy: async (args?: any) => {
        let data = this.mockData[modelName] || [];

        if (args?.where) {
          data = this.filterByWhere(data, args.where);
        }

        if (!args?.by || args.by.length === 0) return [];

        const groups = new Map<string, any[]>();
        const byFields = Array.isArray(args.by) ? args.by : [args.by];

        for (const item of data) {
          const key = byFields.map((f: string) => JSON.stringify(item[f])).join('|');
          if (!groups.has(key)) {
            groups.set(key, []);
          }
          groups.get(key)!.push(item);
        }

        const result: any[] = [];
        for (const [key, groupData] of groups) {
          const groupResult: any = {};
          const keyParts = key.split('|');
          byFields.forEach((f: string, i: number) => {
            groupResult[f] = JSON.parse(keyParts[i]);
          });

          // Add aggregations
          const agg = this.calculateAggregate(groupData, args);
          Object.assign(groupResult, agg);

          result.push(groupResult);
        }

        // Apply having
        if (args?.having) {
          return result.filter((r) => this.filterByWhere([r], args.having).length > 0);
        }

        return result;
      },

      upsert: async (args: any) => {
        const data = this.mockData[modelName] || [];
        const existing = data.find((item: any) => {
          return Object.keys(args.where).every((key) => item[key] === args.where[key]);
        });

        if (existing) {
          const index = data.indexOf(existing);
          data[index] = { ...data[index], ...args.update, updatedAt: new Date() };

          if (args?.include || args?.select) {
            return this.populateRelations(modelName, data[index], args.include, args.select);
          }
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

        if (args?.include || args?.select) {
          return this.populateRelations(modelName, newItem, args.include, args.select);
        }
        return newItem;
      },
    };
  }

  // Model accessors - all models used in tests
  get user() { return this.createModelMethods('user'); }
  get item() { return this.createModelMethods('item'); }
  get category() { return this.createModelMethods('category'); }
  get auction() { return this.createModelMethods('auction'); }
  get bid() { return this.createModelMethods('bid'); }
  get auctionBid() { return this.createModelMethods('auctionBid'); }
  get barter() { return this.createModelMethods('barter'); }
  get barterRequest() { return this.createModelMethods('barterRequest'); }
  get barterOffer() { return this.createModelMethods('barterOffer'); }
  get order() { return this.createModelMethods('order'); }
  get notification() { return this.createModelMethods('notification'); }
  get review() { return this.createModelMethods('review'); }
  get message() { return this.createModelMethods('message'); }
  get wallet() { return this.createModelMethods('wallet'); }
  get walletTransaction() { return this.createModelMethods('walletTransaction'); }
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
  get reverseAuction() { return this.createModelMethods('reverseAuction'); }
  get rentalContract() { return this.createModelMethods('rentalContract'); }
  get rentalPayment() { return this.createModelMethods('rentalPayment'); }
  get cashFlow() { return this.createModelMethods('cashFlow'); }
  get match() { return this.createModelMethods('match'); }
  get adminActivityLog() { return this.createModelMethods('adminActivityLog'); }
  get listing() { return this.createModelMethods('listing'); }
  get shippingAddress() { return this.createModelMethods('shippingAddress'); }
  get orderItem() { return this.createModelMethods('orderItem'); }
  get escrowMilestone() { return this.createModelMethods('escrowMilestone'); }
  get dispute() { return this.createModelMethods('dispute'); }
  get disputeMessage() { return this.createModelMethods('disputeMessage'); }
  get facilitator() { return this.createModelMethods('facilitator'); }
  get facilitatorAssignment() { return this.createModelMethods('facilitatorAssignment'); }
  get cart() { return this.createModelMethods('cart'); }
  get cartItem() { return this.createModelMethods('cartItem'); }

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

  // Get mock data (for testing)
  $getData(modelName: string) {
    return this.mockData[modelName] || [];
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
