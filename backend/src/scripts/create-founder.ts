/**
 * Seed Script - Create Founder Account
 * إنشاء حساب المؤسس ورئيس مجلس الإدارة
 *
 * Run with: npx ts-node src/scripts/create-founder.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createFounder() {
  // ========================================
  // بيانات المؤسس - قم بتغييرها حسب احتياجك
  // ========================================
  const FOUNDER_EMAIL = 'founder@xchange.eg';
  const FOUNDER_PASSWORD = 'Founder@XChange2024'; // كلمة مرور قوية
  const FOUNDER_NAME = 'محمد أحمد'; // اسم المؤسس
  const FOUNDER_TITLE = 'المؤسس ورئيس مجلس الإدارة';
  const COMPANY_NAME = 'XChange Egypt';
  // ========================================

  try {
    // Check if founder already exists
    const existingFounder = await prisma.founder.findUnique({
      where: { email: FOUNDER_EMAIL },
    });

    if (existingFounder) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⚠️  المؤسس موجود بالفعل');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 البريد:', existingFounder.email);
      console.log('👤 الاسم:', existingFounder.fullName);
      console.log('🏢 المنصب:', existingFounder.title);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return;
    }

    // Hash password with high security (14 rounds)
    const passwordHash = await bcrypt.hash(FOUNDER_PASSWORD, 14);

    // Create founder
    const founder = await prisma.founder.create({
      data: {
        email: FOUNDER_EMAIL,
        passwordHash,
        fullName: FOUNDER_NAME,
        title: FOUNDER_TITLE,
        companyName: COMPANY_NAME,
      },
    });

    console.log('');
    console.log('✅ تم إنشاء حساب المؤسس بنجاح!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 البريد الإلكتروني:', FOUNDER_EMAIL);
    console.log('🔑 كلمة المرور:', FOUNDER_PASSWORD);
    console.log('👤 الاسم:', FOUNDER_NAME);
    console.log('🏢 المنصب:', FOUNDER_TITLE);
    console.log('🏛️ الشركة:', COMPANY_NAME);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🔗 رابط الدخول: /founder/login');
    console.log('🔗 مجلس الإدارة: /board');
    console.log('');
    console.log('⚠️  مهم: قم بتغيير كلمة المرور فور تسجيل الدخول!');
    console.log('');

  } catch (error) {
    console.error('❌ خطأ في إنشاء حساب المؤسس:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createFounder();
