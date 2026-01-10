/**
 * Database Cleanup Script - تنظيف قاعدة البيانات
 *
 * يقوم بإزالة:
 * 1. الفئات المتكررة
 * 2. العناصر المتكررة
 * 3. المستخدمين التجريبيين
 * 4. الإشعارات القديمة
 * 5. التوكنات المنتهية
 * 6. سجل البحث القديم
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CleanupStats {
  categoriesCleaned: number;
  itemsCleaned: number;
  usersCleaned: number;
  notificationsCleaned: number;
  tokensCleaned: number;
  searchHistoryCleaned: number;
  totalCleaned: number;
}

const stats: CleanupStats = {
  categoriesCleaned: 0,
  itemsCleaned: 0,
  usersCleaned: 0,
  notificationsCleaned: 0,
  tokensCleaned: 0,
  searchHistoryCleaned: 0,
  totalCleaned: 0,
};

// ============================================
// 1. تنظيف الفئات المتكررة
// ============================================
async function cleanupDuplicateCategories() {
  console.log('\n📁 تنظيف الفئات المتكررة...');

  // Find duplicate categories by slug
  const allCategories = await prisma.category.findMany({
    orderBy: { createdAt: 'asc' },
  });

  const slugMap = new Map<string, string[]>();
  const nameMap = new Map<string, string[]>();

  for (const cat of allCategories) {
    // Group by slug
    const slugKey = cat.slug.toLowerCase();
    if (!slugMap.has(slugKey)) {
      slugMap.set(slugKey, []);
    }
    slugMap.get(slugKey)!.push(cat.id);

    // Group by Arabic name (for same parent)
    const nameKey = `${cat.parentId || 'root'}_${cat.nameAr}`;
    if (!nameMap.has(nameKey)) {
      nameMap.set(nameKey, []);
    }
    nameMap.get(nameKey)!.push(cat.id);
  }

  // Delete duplicates (keep first, delete rest)
  const toDelete: string[] = [];

  for (const [, ids] of slugMap) {
    if (ids.length > 1) {
      toDelete.push(...ids.slice(1)); // Keep first, delete rest
    }
  }

  for (const [, ids] of nameMap) {
    if (ids.length > 1) {
      const remaining = ids.filter(id => !toDelete.includes(id));
      if (remaining.length > 1) {
        toDelete.push(...remaining.slice(1));
      }
    }
  }

  const uniqueToDelete = [...new Set(toDelete)];

  if (uniqueToDelete.length > 0) {
    // First, update items that reference these categories
    for (const catId of uniqueToDelete) {
      await prisma.item.updateMany({
        where: { categoryId: catId },
        data: { categoryId: null },
      });
      await prisma.item.updateMany({
        where: { desiredCategoryId: catId },
        data: { desiredCategoryId: null },
      });
    }

    // Then delete the duplicate categories
    const deleted = await prisma.category.deleteMany({
      where: { id: { in: uniqueToDelete } },
    });
    stats.categoriesCleaned = deleted.count;
    console.log(`   ✅ تم حذف ${deleted.count} فئة متكررة`);
  } else {
    console.log('   ✅ لا توجد فئات متكررة');
  }
}

// ============================================
// 2. تنظيف العناصر المتكررة
// ============================================
async function cleanupDuplicateItems() {
  console.log('\n📦 تنظيف العناصر المتكررة...');

  // Find duplicate items by title + seller
  const allItems = await prisma.item.findMany({
    select: { id: true, title: true, sellerId: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const itemMap = new Map<string, string[]>();

  for (const item of allItems) {
    const key = `${item.sellerId}_${item.title.toLowerCase().trim()}`;
    if (!itemMap.has(key)) {
      itemMap.set(key, []);
    }
    itemMap.get(key)!.push(item.id);
  }

  const toDelete: string[] = [];
  for (const [, ids] of itemMap) {
    if (ids.length > 1) {
      toDelete.push(...ids.slice(1)); // Keep first
    }
  }

  if (toDelete.length > 0) {
    const deleted = await prisma.item.deleteMany({
      where: { id: { in: toDelete } },
    });
    stats.itemsCleaned = deleted.count;
    console.log(`   ✅ تم حذف ${deleted.count} عنصر متكرر`);
  } else {
    console.log('   ✅ لا توجد عناصر متكررة');
  }
}

// ============================================
// 3. تنظيف المستخدمين التجريبيين
// ============================================
async function cleanupTestUsers() {
  console.log('\n👤 تنظيف المستخدمين التجريبيين...');

  // Delete test users (email contains 'test' or specific patterns)
  const testPatterns = [
    '%test%@%',
    '%demo%@%',
    '%example%@%',
    '%fake%@%',
    '%temp%@%',
  ];

  let totalDeleted = 0;

  for (const pattern of testPatterns) {
    // First check if users exist
    const testUsers = await prisma.user.findMany({
      where: {
        email: { contains: pattern.replace(/%/g, ''), mode: 'insensitive' },
        // Don't delete admin users
        userType: { not: 'BUSINESS' },
      },
      select: { id: true, email: true },
    });

    if (testUsers.length > 0) {
      // Delete related data first
      const userIds = testUsers.map(u => u.id);

      await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.item.deleteMany({ where: { sellerId: { in: userIds } } });

      const deleted = await prisma.user.deleteMany({
        where: { id: { in: userIds } },
      });
      totalDeleted += deleted.count;
    }
  }

  stats.usersCleaned = totalDeleted;
  if (totalDeleted > 0) {
    console.log(`   ✅ تم حذف ${totalDeleted} مستخدم تجريبي`);
  } else {
    console.log('   ✅ لا يوجد مستخدمون تجريبيون');
  }
}

// ============================================
// 4. تنظيف الإشعارات القديمة
// ============================================
async function cleanupOldNotifications() {
  console.log('\n🔔 تنظيف الإشعارات القديمة...');

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Delete read notifications older than 30 days
  const deleted = await prisma.notification.deleteMany({
    where: {
      AND: [
        { isRead: true },
        { createdAt: { lt: thirtyDaysAgo } },
      ],
    },
  });

  stats.notificationsCleaned = deleted.count;
  if (deleted.count > 0) {
    console.log(`   ✅ تم حذف ${deleted.count} إشعار قديم`);
  } else {
    console.log('   ✅ لا توجد إشعارات قديمة');
  }
}

// ============================================
// 5. تنظيف التوكنات المنتهية
// ============================================
async function cleanupExpiredTokens() {
  console.log('\n🔑 تنظيف التوكنات المنتهية...');

  const deleted = await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });

  stats.tokensCleaned = deleted.count;
  if (deleted.count > 0) {
    console.log(`   ✅ تم حذف ${deleted.count} توكن منتهي`);
  } else {
    console.log('   ✅ لا توجد توكنات منتهية');
  }
}

// ============================================
// 6. تنظيف سجل البحث القديم
// ============================================
async function cleanupOldSearchHistory() {
  console.log('\n🔍 تنظيف سجل البحث القديم...');

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  try {
    const deleted = await prisma.searchHistory.deleteMany({
      where: {
        createdAt: { lt: ninetyDaysAgo },
      },
    });

    stats.searchHistoryCleaned = deleted.count;
    if (deleted.count > 0) {
      console.log(`   ✅ تم حذف ${deleted.count} سجل بحث قديم`);
    } else {
      console.log('   ✅ لا يوجد سجل بحث قديم');
    }
  } catch {
    console.log('   ⚠️ جدول سجل البحث غير موجود');
  }
}

// ============================================
// 7. إصلاح العلاقات المعطلة
// ============================================
async function fixOrphanedRelations() {
  console.log('\n🔗 إصلاح العلاقات المعطلة...');

  // Fix items with non-existent categories
  const itemsWithBadCategory = await prisma.item.updateMany({
    where: {
      categoryId: { not: null },
      category: null,
    },
    data: { categoryId: null },
  });

  if (itemsWithBadCategory.count > 0) {
    console.log(`   ✅ تم إصلاح ${itemsWithBadCategory.count} عنصر بفئة معطلة`);
  }

  // Fix items with non-existent desired category
  const itemsWithBadDesiredCategory = await prisma.item.updateMany({
    where: {
      desiredCategoryId: { not: null },
      desiredCategory: null,
    },
    data: { desiredCategoryId: null },
  });

  if (itemsWithBadDesiredCategory.count > 0) {
    console.log(`   ✅ تم إصلاح ${itemsWithBadDesiredCategory.count} عنصر بفئة مطلوبة معطلة`);
  }

  console.log('   ✅ تم إصلاح العلاقات');
}

// ============================================
// تشغيل التنظيف
// ============================================
async function runCleanup() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('        🧹 بدء تنظيف قاعدة البيانات                             ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`   الوقت: ${new Date().toLocaleString('ar-EG')}`);

  try {
    await cleanupDuplicateCategories();
    await cleanupDuplicateItems();
    await cleanupTestUsers();
    await cleanupOldNotifications();
    await cleanupExpiredTokens();
    await cleanupOldSearchHistory();
    await fixOrphanedRelations();

    // Calculate total
    stats.totalCleaned =
      stats.categoriesCleaned +
      stats.itemsCleaned +
      stats.usersCleaned +
      stats.notificationsCleaned +
      stats.tokensCleaned +
      stats.searchHistoryCleaned;

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('        📊 ملخص التنظيف                                         ');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`   الفئات المحذوفة:        ${stats.categoriesCleaned}`);
    console.log(`   العناصر المحذوفة:       ${stats.itemsCleaned}`);
    console.log(`   المستخدمون المحذوفون:   ${stats.usersCleaned}`);
    console.log(`   الإشعارات المحذوفة:     ${stats.notificationsCleaned}`);
    console.log(`   التوكنات المحذوفة:      ${stats.tokensCleaned}`);
    console.log(`   سجلات البحث المحذوفة:   ${stats.searchHistoryCleaned}`);
    console.log('───────────────────────────────────────────────────────────────');
    console.log(`   الإجمالي:               ${stats.totalCleaned}`);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   ✅ تم التنظيف بنجاح!');

  } catch (error) {
    console.error('\n❌ خطأ أثناء التنظيف:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
runCleanup()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

export { runCleanup, stats };
