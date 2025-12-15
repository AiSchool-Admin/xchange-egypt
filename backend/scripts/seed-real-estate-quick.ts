/**
 * Quick Real Estate Seed Script - يمكن تشغيله على Railway
 * التشغيل: npx tsx scripts/seed-real-estate-quick.ts
 */

import { PrismaClient, PropertyType, PropertyStatus, FinishingLevel } from '@prisma/client';

const prisma = new PrismaClient();

const SAMPLE_PROPERTIES = [
  {
    title: 'Luxury Apartment in New Cairo',
    titleAr: 'شقة فاخرة في التجمع الخامس',
    description: 'Stunning 3-bedroom apartment with panoramic views',
    descriptionAr: 'شقة مذهلة 3 غرف نوم مع إطلالة بانورامية',
    propertyType: PropertyType.APARTMENT,
    governorate: 'Cairo',
    city: 'New Cairo',
    district: 'Fifth Settlement',
    compoundName: 'Mivida',
    areaSqm: 185,
    bedrooms: 3,
    bathrooms: 2,
    floorNumber: 5,
    totalFloors: 8,
    finishingLevel: FinishingLevel.SUPER_LUX,
    salePrice: 4500000,
    pricePerSqm: 24324,
    status: PropertyStatus.ACTIVE,
    viewsCount: 120,
    favoritesCount: 15,
  },
  {
    title: 'Villa in Sheikh Zayed',
    titleAr: 'فيلا في الشيخ زايد',
    description: 'Standalone villa with private garden and pool',
    descriptionAr: 'فيلا مستقلة بحديقة خاصة وحمام سباحة',
    propertyType: PropertyType.VILLA,
    governorate: 'Giza',
    city: 'Sheikh Zayed',
    district: 'District 1',
    compoundName: 'Allegria',
    areaSqm: 450,
    bedrooms: 5,
    bathrooms: 4,
    floorNumber: null,
    totalFloors: 3,
    finishingLevel: FinishingLevel.LUX,
    salePrice: 12000000,
    pricePerSqm: 26667,
    status: PropertyStatus.ACTIVE,
    viewsCount: 200,
    favoritesCount: 35,
  },
  {
    title: 'Penthouse in Maadi',
    titleAr: 'بنتهاوس في المعادي',
    description: 'Spacious penthouse with rooftop terrace',
    descriptionAr: 'بنتهاوس واسع مع تراس على السطح',
    propertyType: PropertyType.PENTHOUSE,
    governorate: 'Cairo',
    city: 'Maadi',
    district: 'Degla',
    compoundName: 'Sarayat Maadi',
    areaSqm: 320,
    bedrooms: 4,
    bathrooms: 3,
    floorNumber: 10,
    totalFloors: 10,
    finishingLevel: FinishingLevel.SUPER_LUX,
    salePrice: 8500000,
    pricePerSqm: 26563,
    status: PropertyStatus.ACTIVE,
    viewsCount: 180,
    favoritesCount: 28,
  },
  {
    title: 'Studio in 6 October',
    titleAr: 'ستوديو في 6 أكتوبر',
    description: 'Fully furnished studio, ready to move',
    descriptionAr: 'ستوديو مفروش بالكامل، جاهز للسكن',
    propertyType: PropertyType.STUDIO,
    governorate: 'Giza',
    city: '6th of October',
    district: 'District 2',
    compoundName: 'Palm Parks',
    areaSqm: 55,
    bedrooms: 1,
    bathrooms: 1,
    floorNumber: 3,
    totalFloors: 6,
    finishingLevel: FinishingLevel.LUX,
    salePrice: 950000,
    pricePerSqm: 17273,
    status: PropertyStatus.ACTIVE,
    viewsCount: 90,
    favoritesCount: 12,
  },
  {
    title: 'Duplex in Heliopolis',
    titleAr: 'دوبلكس في مصر الجديدة',
    description: 'Modern duplex in prime location',
    descriptionAr: 'دوبلكس حديث في موقع متميز',
    propertyType: PropertyType.DUPLEX,
    governorate: 'Cairo',
    city: 'Heliopolis',
    district: 'Sheraton',
    compoundName: null,
    areaSqm: 280,
    bedrooms: 4,
    bathrooms: 3,
    floorNumber: 7,
    totalFloors: 10,
    finishingLevel: FinishingLevel.SEMI_FINISHED,
    salePrice: 5200000,
    pricePerSqm: 18571,
    status: PropertyStatus.ACTIVE,
    viewsCount: 145,
    favoritesCount: 20,
  },
  {
    title: 'Chalet in North Coast',
    titleAr: 'شاليه في الساحل الشمالي',
    description: 'Beachfront chalet with sea view',
    descriptionAr: 'شاليه على البحر مباشرة بإطلالة بحرية',
    propertyType: PropertyType.CHALET,
    governorate: 'Matrouh',
    city: 'North Coast',
    district: 'Sidi Abdel Rahman',
    compoundName: 'Marassi',
    areaSqm: 120,
    bedrooms: 2,
    bathrooms: 2,
    floorNumber: 1,
    totalFloors: 2,
    finishingLevel: FinishingLevel.LUX,
    salePrice: 6500000,
    pricePerSqm: 54167,
    status: PropertyStatus.ACTIVE,
    viewsCount: 250,
    favoritesCount: 42,
  },
  {
    title: 'Townhouse in Rehab',
    titleAr: 'تاون هاوس في الرحاب',
    description: 'Family townhouse in gated community',
    descriptionAr: 'تاون هاوس عائلي في كمبوند مغلق',
    propertyType: PropertyType.TOWNHOUSE,
    governorate: 'Cairo',
    city: 'New Cairo',
    district: 'Rehab',
    compoundName: 'Rehab City',
    areaSqm: 350,
    bedrooms: 4,
    bathrooms: 3,
    floorNumber: null,
    totalFloors: 3,
    finishingLevel: FinishingLevel.LUX,
    salePrice: 7200000,
    pricePerSqm: 20571,
    status: PropertyStatus.ACTIVE,
    viewsCount: 165,
    favoritesCount: 25,
  },
  {
    title: 'Office in Downtown',
    titleAr: 'مكتب في وسط البلد',
    description: 'Commercial office space in business district',
    descriptionAr: 'مساحة مكتبية تجارية في منطقة الأعمال',
    propertyType: PropertyType.OFFICE,
    governorate: 'Cairo',
    city: 'Downtown',
    district: 'Tahrir',
    compoundName: null,
    areaSqm: 95,
    bedrooms: 0,
    bathrooms: 1,
    floorNumber: 6,
    totalFloors: 12,
    finishingLevel: FinishingLevel.LUX,
    salePrice: 2800000,
    pricePerSqm: 29474,
    status: PropertyStatus.ACTIVE,
    viewsCount: 80,
    favoritesCount: 8,
  },
];

async function main() {
  console.log('🚀 Starting Quick Real Estate Seed...\n');

  try {
    // Get or create a test user
    let testUser = await prisma.user.findFirst({
      where: { email: 'admin@xchange.eg' }
    });

    if (!testUser) {
      console.log('Creating test user...');
      testUser = await prisma.user.create({
        data: {
          email: 'admin@xchange.eg',
          fullName: 'Xchange Admin',
          password: '$2b$10$XYZ123...', // Placeholder - not used for seed
          phoneNumber: '+201000000000',
          isEmailVerified: true,
          isPhoneVerified: true,
          rating: 5.0,
        },
      });
    }

    console.log(`✅ Using user: ${testUser.fullName} (${testUser.email})\n`);

    // Create properties
    console.log('Creating sample properties...');
    let createdCount = 0;

    for (const propData of SAMPLE_PROPERTIES) {
      try {
        await prisma.property.create({
          data: {
            ...propData,
            ownerId: testUser.id,
            images: [
              'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
              'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
            ],
            amenities: {
              parking: true,
              elevator: true,
              garden: propData.propertyType === PropertyType.VILLA,
              pool: propData.propertyType === PropertyType.VILLA || propData.propertyType === PropertyType.CHALET,
              security: true,
            },
          },
        });
        createdCount++;
        console.log(`  ✓ ${propData.titleAr}`);
      } catch (error: any) {
        console.log(`  ✗ Failed: ${propData.titleAr} - ${error.message}`);
      }
    }

    console.log(`\n✅ Created ${createdCount}/${SAMPLE_PROPERTIES.length} properties`);
    console.log('\n🎉 Seed completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
