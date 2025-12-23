/**
 * Category Routes Integration Tests
 */

import { cleanDatabase, disconnectTestDb, getTestDb } from '../helpers/testDb';
import { createTestCategory } from '../helpers/testHelpers';

// Check if Prisma is available
let prismaAvailable = false;
try {
  require('@prisma/client');
  prismaAvailable = true;
} catch {
  console.log('⚠️ Prisma not available - skipping Category tests');
}

const describeIfPrisma = prismaAvailable ? describe : describe.skip;

describeIfPrisma('Category Tests', () => {
  const db = getTestDb();

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  describe('Category Creation', () => {
    it('should create category with valid data', async () => {
      const category = await createTestCategory({
        name_en: 'Electronics',
        name_ar: 'إلكترونيات',
        slug: 'electronics',
      });

      expect(category).toHaveProperty('id');
      expect(category.name_en).toBe('Electronics');
      expect(category.name_ar).toBe('إلكترونيات');
      expect(category.slug).toBe('electronics');
    });

    it('should create root category (level 1)', async () => {
      const category = await createTestCategory({
        level: 1,
        parent_id: null,
      });

      expect(category.level).toBe(1);
      expect(category.parent_id).toBeNull();
    });

    it('should create sub-category (level 2) with parent', async () => {
      const parent = await createTestCategory({
        level: 1,
        slug: 'parent-category',
      });

      const subCategory = await createTestCategory({
        level: 2,
        parent_id: parent.id,
        slug: 'sub-category',
      });

      expect(subCategory.level).toBe(2);
      expect(subCategory.parent_id).toBe(parent.id);
    });

    it('should create sub-sub-category (level 3)', async () => {
      const parent = await createTestCategory({
        level: 1,
        slug: 'root',
      });

      const subCategory = await createTestCategory({
        level: 2,
        parent_id: parent.id,
        slug: 'sub',
      });

      const subSubCategory = await createTestCategory({
        level: 3,
        parent_id: subCategory.id,
        slug: 'sub-sub',
      });

      expect(subSubCategory.level).toBe(3);
      expect(subSubCategory.parent_id).toBe(subCategory.id);
    });
  });

  describe('Category Queries', () => {
    it('should find category by slug', async () => {
      await createTestCategory({
        slug: 'unique-slug',
      });

      const category = await db.category.findUnique({
        where: { slug: 'unique-slug' },
      });

      expect(category).not.toBeNull();
      expect(category?.slug).toBe('unique-slug');
    });

    it('should find category by ID', async () => {
      const created = await createTestCategory();

      const category = await db.category.findUnique({
        where: { id: created.id },
      });

      expect(category).not.toBeNull();
      expect(category?.id).toBe(created.id);
    });

    it('should get all root categories (level 1)', async () => {
      await createTestCategory({ level: 1, slug: 'root1' });
      await createTestCategory({ level: 1, slug: 'root2' });
      await createTestCategory({ level: 1, slug: 'root3' });

      const rootCategories = await db.category.findMany({
        where: { level: 1 },
      });

      expect(rootCategories.length).toBe(3);
    });

    it('should get active categories only', async () => {
      await createTestCategory({ is_active: true, slug: 'active1' });
      await createTestCategory({ is_active: true, slug: 'active2' });
      await createTestCategory({ is_active: false, slug: 'inactive1' });

      const activeCategories = await db.category.findMany({
        where: { is_active: true },
      });

      expect(activeCategories.length).toBe(2);
      expect(activeCategories.every((cat) => cat.is_active)).toBe(true);
    });

    it('should get sub-categories of a parent', async () => {
      const parent = await createTestCategory({
        level: 1,
        slug: 'parent',
      });

      await createTestCategory({
        level: 2,
        parent_id: parent.id,
        slug: 'child1',
      });

      await createTestCategory({
        level: 2,
        parent_id: parent.id,
        slug: 'child2',
      });

      const children = await db.category.findMany({
        where: { parent_id: parent.id },
      });

      expect(children.length).toBe(2);
    });
  });

  describe('Category Hierarchy', () => {
    it('should maintain 3-level hierarchy structure', async () => {
      const level1 = await createTestCategory({
        level: 1,
        slug: 'electronics',
        name_en: 'Electronics',
      });

      const level2 = await createTestCategory({
        level: 2,
        parent_id: level1.id,
        slug: 'mobile-phones',
        name_en: 'Mobile Phones',
      });

      const level3 = await createTestCategory({
        level: 3,
        parent_id: level2.id,
        slug: 'smartphones',
        name_en: 'Smartphones',
      });

      expect(level1.level).toBe(1);
      expect(level2.level).toBe(2);
      expect(level3.level).toBe(3);
      expect(level2.parent_id).toBe(level1.id);
      expect(level3.parent_id).toBe(level2.id);
    });

    it('should get full category path', async () => {
      const level1 = await createTestCategory({
        level: 1,
        slug: 'vehicles',
        name_en: 'Vehicles',
      });

      const level2 = await createTestCategory({
        level: 2,
        parent_id: level1.id,
        slug: 'cars',
        name_en: 'Cars',
      });

      const level3 = await createTestCategory({
        level: 3,
        parent_id: level2.id,
        slug: 'sedans',
        name_en: 'Sedans',
      });

      // Get full path
      const category = await db.category.findUnique({
        where: { id: level3.id },
        include: {
          parent: {
            include: {
              parent: true,
            },
          },
        },
      });

      expect(category?.name_en).toBe('Sedans');
      expect(category?.parent?.name_en).toBe('Cars');
      expect(category?.parent?.parent?.name_en).toBe('Vehicles');
    });
  });

  describe('Category Features', () => {
    it('should store bilingual names', async () => {
      const category = await createTestCategory({
        name_en: 'Real Estate',
        name_ar: 'العقارات',
      });

      expect(category.name_en).toBe('Real Estate');
      expect(category.name_ar).toBe('العقارات');
    });

    it('should store category icon', async () => {
      const category = await createTestCategory({
        icon: '🏠',
      });

      expect(category.icon).toBe('🏠');
    });

    it('should allow description fields', async () => {
      const category = await createTestCategory({
        description_en: 'All electronic devices',
        description_ar: 'جميع الأجهزة الإلكترونية',
      });

      expect(category.description_en).toBe('All electronic devices');
      expect(category.description_ar).toBe('جميع الأجهزة الإلكترونية');
    });

    it('should track category statistics', async () => {
      const category = await createTestCategory({
        total_items: 150,
        total_active_items: 120,
      });

      expect(category.total_items).toBe(150);
      expect(category.total_active_items).toBe(120);
    });
  });
});
