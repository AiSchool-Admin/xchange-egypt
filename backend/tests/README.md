# Backend Testing Suite

Comprehensive test suite for the Xchange E-commerce Platform backend.

## 🎯 Overview

This testing suite uses:
- **Jest**: Test framework
- **Supertest**: HTTP assertion library
- **ts-jest**: TypeScript support for Jest
- **Prisma**: Database testing with test database

## 📁 Test Structure

```
tests/
├── setup.ts                    # Global test setup
├── helpers/
│   ├── testDb.ts              # Database utilities
│   └── testHelpers.ts         # Common test helpers
└── integration/
    ├── health.test.ts         # Health endpoint tests
    ├── auth.test.ts           # Authentication tests
    └── category.test.ts       # Category tests
```

## 🚀 Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test auth.test.ts

# Run with coverage
pnpm test --coverage
```

## 🔧 Test Database Setup

Tests use a separate test database to avoid affecting production/development data.

### Option 1: Use Existing Database (Default)
Tests will use `DATABASE_URL` from your `.env` file but clean tables before each test.

### Option 2: Use Dedicated Test Database (Recommended)
Create a `.env.test` file:

```env
TEST_DATABASE_URL="postgresql://user:password@localhost:5432/xchange_test"
JWT_SECRET="test-jwt-secret"
JWT_REFRESH_SECRET="test-refresh-secret"
```

Then run migrations on test database:

```bash
# Create test database
createdb xchange_test

# Run migrations
DATABASE_URL="postgresql://user:password@localhost:5432/xchange_test" npx prisma migrate deploy
```

## 📝 Writing Tests

### Test Structure

```typescript
import { cleanDatabase, disconnectTestDb, getTestDb } from '../helpers/testDb';
import { createTestUser } from '../helpers/testHelpers';

describe('Feature Name', () => {
  const db = getTestDb();

  beforeEach(async () => {
    await cleanDatabase(); // Clean before each test
  });

  afterAll(async () => {
    await disconnectTestDb(); // Cleanup after all tests
  });

  it('should do something', async () => {
    // Test logic
  });
});
```

### Test Helpers

#### Database Helpers (`testDb.ts`)

- `getTestDb()` - Get Prisma test client
- `cleanDatabase()` - Clean all tables
- `disconnectTestDb()` - Disconnect test database
- `seedTestData()` - Seed minimal test data

#### Test Data Helpers (`testHelpers.ts`)

- `generateTestToken(userId, userType)` - Generate JWT token
- `createTestUser(overrides)` - Create test user
- `createTestAdmin(overrides)` - Create admin user
- `createTestCategory(overrides)` - Create test category
- `createTestItem(userId, categoryId, overrides)` - Create test item
- `mockRedis` - Mock Redis client

### Example Test

```typescript
describe('User Authentication', () => {
  it('should create user and verify password', async () => {
    const user = await createTestUser({
      email: 'test@example.com',
      full_name: 'Test User',
    });

    expect(user).toHaveProperty('id');
    expect(user.email).toBe('test@example.com');
  });
});
```

## 🎨 Test Coverage Goals

| Component | Target Coverage |
|-----------|----------------|
| Controllers | 80%+ |
| Services | 90%+ |
| Routes | 70%+ |
| Utilities | 95%+ |
| Overall | 80%+ |

## 🔒 Testing Best Practices

1. **Isolation**: Each test should be independent
2. **Clean State**: Use `cleanDatabase()` before each test
3. **Descriptive Names**: Use clear test descriptions
4. **AAA Pattern**: Arrange, Act, Assert
5. **Mock External Services**: Mock Redis, S3, etc.
6. **Test Edge Cases**: Not just happy paths

## 📊 Current Test Status

### ✅ Completed
- [x] Test infrastructure setup
- [x] Jest configuration
- [x] Database helpers
- [x] Test data factories
- [x] Health endpoint tests
- [x] Authentication logic tests
- [x] Category CRUD tests

### 🔄 In Progress
- [ ] Integration tests with full Express app
- [ ] Barter system tests
- [ ] Auction system tests
- [ ] Admin routes tests

### 📅 Planned
- [ ] E2E tests
- [ ] Performance tests
- [ ] Load tests
- [ ] Security tests

## 🐛 Debugging Tests

```bash
# Run tests with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Increase test timeout
jest --testTimeout=30000

# Run single test file
pnpm test auth.test.ts
```

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- [Testing Best Practices](https://testingjavascript.com/)

## 🤝 Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure tests pass before committing
3. Maintain test coverage above 80%
4. Update this README if adding new test utilities
