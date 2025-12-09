import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

async function seedUsers() {
  console.log('🌱 Seeding users...');

  // Hash passwords
  const hashedPassword = await hashPassword('Password123!');

  // Individual Users
  const individuals = [
    {
      email: 'ahmed.mohamed@example.com',
      password: hashedPassword,
      fullName: 'Ahmed Mohamed',
      phone: '+201012345678',
      accountType: 'INDIVIDUAL',
      governorate: 'Cairo',
      address: '123 Nasr City, Cairo',
    },
    {
      email: 'fatma.ali@example.com',
      password: hashedPassword,
      fullName: 'Fatma Ali',
      phone: '+201023456789',
      accountType: 'INDIVIDUAL',
      governorate: 'Alexandria',
      address: '45 Smouha, Alexandria',
    },
    {
      email: 'khaled.hassan@example.com',
      password: hashedPassword,
      fullName: 'Khaled Hassan',
      phone: '+201034567890',
      accountType: 'INDIVIDUAL',
      governorate: 'Giza',
      address: '78 Dokki, Giza',
    },
    {
      email: 'mona.ibrahim@example.com',
      password: hashedPassword,
      fullName: 'Mona Ibrahim',
      phone: '+201045678901',
      accountType: 'INDIVIDUAL',
      governorate: 'Cairo',
      address: '12 Heliopolis, Cairo',
    },
    {
      email: 'omar.saeed@example.com',
      password: hashedPassword,
      fullName: 'Omar Saeed',
      phone: '+201056789012',
      accountType: 'INDIVIDUAL',
      governorate: 'Cairo',
      address: '90 Maadi, Cairo',
    },
  ];

  // Business Users
  const businesses = [
    {
      email: 'contact@techstore.eg',
      password: hashedPassword,
      fullName: 'Mohamed Samy',
      phone: '+201112345678',
      accountType: 'BUSINESS',
      businessName: 'Tech Store Egypt',
      businessType: 'Electronics Retailer',
      taxId: 'TAX123456',
      governorate: 'Cairo',
      address: '456 Downtown, Cairo',
    },
    {
      email: 'info@furniturehub.eg',
      password: hashedPassword,
      fullName: 'Sara Ahmed',
      phone: '+201123456789',
      accountType: 'BUSINESS',
      businessName: 'Furniture Hub',
      businessType: 'Furniture Retailer',
      taxId: 'TAX234567',
      governorate: 'Giza',
      address: '789 6th October City, Giza',
    },
    {
      email: 'sales@autoparts.eg',
      password: hashedPassword,
      fullName: 'Youssef Khalil',
      phone: '+201134567890',
      accountType: 'BUSINESS',
      businessName: 'Auto Parts Plus',
      businessType: 'Auto Parts Dealer',
      taxId: 'TAX345678',
      governorate: 'Alexandria',
      address: '321 El-Manshia, Alexandria',
    },
    {
      email: 'support@greencycle.eg',
      password: hashedPassword,
      fullName: 'Laila Mahmoud',
      phone: '+201145678901',
      accountType: 'BUSINESS',
      businessName: 'Green Cycle',
      businessType: 'Recycling Company',
      taxId: 'TAX456789',
      governorate: 'Cairo',
      address: '654 New Cairo, Cairo',
    },
  ];

  // Create individual users
  for (const userData of individuals) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
    console.log(`✅ Created individual user: ${user.fullName} (${user.email})`);
  }

  // Create business users
  for (const userData of businesses) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
    console.log(`✅ Created business user: ${user.businessName} (${user.email})`);
  }

  console.log('\n✨ Users seeded successfully!\n');
  console.log('📝 Demo Login Credentials:');
  console.log('   Individual: ahmed.mohamed@example.com / Password123!');
  console.log('   Business: contact@techstore.eg / Password123!');
  console.log('   All passwords: Password123!\n');
}

seedUsers()
  .catch((e) => {
    console.error('❌ Error seeding users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
