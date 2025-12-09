/**
 * Seed Script - Create Initial Super Admin
 * Run with: npx ts-node src/scripts/create-admin.ts
 */

import { PrismaClient, AdminRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  // ========================================
  // قم بتغيير هذه البيانات حسب احتياجك
  // ========================================
  const ADMIN_EMAIL = 'admin@xchange.eg';
  const ADMIN_PASSWORD = 'Admin@123456'; // غير كلمة المرور!
  const ADMIN_NAME = 'مدير النظام';
  // ========================================

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (existingAdmin) {
      console.log('❌ المدير موجود بالفعل:', ADMIN_EMAIL);
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        email: ADMIN_EMAIL,
        passwordHash,
        fullName: ADMIN_NAME,
        role: AdminRole.SUPER_ADMIN,
      },
    });

    console.log('✅ تم إنشاء مدير النظام بنجاح!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 البريد:', ADMIN_EMAIL);
    console.log('🔑 كلمة المرور:', ADMIN_PASSWORD);
    console.log('👤 الاسم:', ADMIN_NAME);
    console.log('🎭 الدور:', AdminRole.SUPER_ADMIN);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔗 رابط الدخول: /admin/login');

    // Initialize default settings
    const defaultSettings = [
      { key: 'site_name', value: 'XChange Egypt', category: 'general', description: 'اسم المنصة' },
      { key: 'site_description', value: 'منصة التبادل والمقايضة في مصر', category: 'general', description: 'وصف المنصة' },
      { key: 'maintenance_mode', value: false, category: 'general', description: 'وضع الصيانة' },
      { key: 'registration_enabled', value: true, category: 'general', description: 'تفعيل التسجيل' },
      { key: 'commission_percentage', value: 2.5, category: 'payments', description: 'نسبة العمولة' },
      { key: 'support_email', value: 'support@xchange.eg', category: 'contact', description: 'بريد الدعم' },
    ];

    for (const setting of defaultSettings) {
      await prisma.platformSetting.upsert({
        where: { key: setting.key },
        update: {},
        create: setting,
      });
    }

    console.log('\n✅ تم إنشاء الإعدادات الافتراضية');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
