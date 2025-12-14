// Xchange Cars - Database Seed File
// Run with: npx prisma db seed

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (development only!)
  if (process.env.NODE_ENV === 'development') {
    console.log('🗑️  Clearing existing data...');
    await prisma.$transaction([
      prisma.favoriteListing.deleteMany(),
      prisma.review.deleteMany(),
      prisma.message.deleteMany(),
      prisma.notification.deleteMany(),
      prisma.transaction.deleteMany(),
      prisma.inspection.deleteMany(),
      prisma.listingImage.deleteMany(),
      prisma.listing.deleteMany(),
      prisma.vehicle.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  }

  // 1. Create Users
  console.log('👥 Creating users...');
  
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = await Promise.all([
    // Buyer
    prisma.user.create({
      data: {
        phone: '01012345678',
        password: hashedPassword,
        firstName: 'محمد',
        lastName: 'أحمد',
        governorate: 'Cairo',
        city: 'Nasr City',
        role: 'BUYER',
        verificationLevel: 'ID_VERIFIED',
        phoneVerified: true,
        rating: 4.8,
        totalReviews: 12,
      },
    }),
    
    // Seller (Verified)
    prisma.user.create({
      data: {
        phone: '01112345678',
        password: hashedPassword,
        firstName: 'أحمد',
        lastName: 'محمود',
        governorate: 'Giza',
        city: '6th of October',
        role: 'SELLER',
        verificationLevel: 'TRUSTED',
        phoneVerified: true,
        rating: 4.9,
        totalReviews: 25,
        successfulSales: 15,
      },
    }),
    
    // Dealer
    prisma.user.create({
      data: {
        phone: '01212345678',
        password: hashedPassword,
        firstName: 'كريم',
        lastName: 'سعيد',
        governorate: 'Cairo',
        city: 'Heliopolis',
        role: 'DEALER',
        verificationLevel: 'PROFESSIONAL',
        phoneVerified: true,
        businessName: 'معرض السلام للسيارات',
        taxId: 'TAX123456',
        commercialRegNo: 'CR789012',
        rating: 4.7,
        totalReviews: 48,
        successfulSales: 120,
      },
    }),
    
    // Inspector
    prisma.user.create({
      data: {
        phone: '01512345678',
        password: hashedPassword,
        firstName: 'خالد',
        lastName: 'حسن',
        governorate: 'Cairo',
        city: 'Maadi',
        role: 'INSPECTOR',
        verificationLevel: 'PROFESSIONAL',
        phoneVerified: true,
        rating: 4.9,
        totalReviews: 156,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // 2. Create Vehicles & Listings
  console.log('🚗 Creating vehicles and listings...');

  const listings = await Promise.all([
    // Listing 1: Toyota Corolla (Certified)
    prisma.listing.create({
      data: {
        title: 'تويوتا كورولا 2021 فابريكا بالكامل',
        description: 'سيارة في حالة ممتازة، صيانة دورية من الوكيل، لم تتعرض لأي حوادث. جميع المستندات سارية.',
        listingType: 'CERTIFIED',
        status: 'ACTIVE',
        sellerId: users[1].id,
        askingPrice: 480000,
        negotiable: true,
        governorate: 'Giza',
        city: '6th of October',
        acceptsTradeIn: true,
        acceptsBarter: true,
        hasOwnershipCard: true,
        hasInsurance: true,
        isCertified: true,
        certificationId: 'XCHG-CERT-00001',
        warrantyMonths: 6,
        publishedAt: new Date(),
        vehicle: {
          create: {
            make: 'Toyota',
            model: 'Corolla',
            year: 2021,
            vin: 'JT2BF22K2X0123456',
            vehicleType: 'SEDAN',
            fuelType: 'GASOLINE',
            transmissionType: 'AUTOMATIC',
            engineSize: 1.6,
            cylinders: 4,
            horsepower: 122,
            color: 'أبيض',
            seatingCapacity: 5,
            doors: 4,
            condition: 'USED_EXCELLENT',
            mileage: 45000,
            previousOwners: 1,
            assembledInEgypt: false,
            hasAccidents: false,
          },
        },
        images: {
          create: [
            {
              url: 'https://res.cloudinary.com/demo/image/upload/toyota-corolla-1.jpg',
              thumbnail: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_300/toyota-corolla-1.jpg',
              order: 0,
              isPrimary: true,
            },
            {
              url: 'https://res.cloudinary.com/demo/image/upload/toyota-corolla-2.jpg',
              thumbnail: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_300/toyota-corolla-2.jpg',
              order: 1,
            },
          ],
        },
      },
    }),

    // Listing 2: Hyundai Elantra (Marketplace)
    prisma.listing.create({
      data: {
        title: 'هيونداي النترا 2020 أوتوماتيك',
        description: 'سيارة نظيفة جداً، استعمال شخصي، صيانة منتظمة.',
        listingType: 'MARKETPLACE',
        status: 'ACTIVE',
        sellerId: users[1].id,
        askingPrice: 380000,
        negotiable: true,
        governorate: 'Cairo',
        city: 'Nasr City',
        acceptsTradeIn: false,
        acceptsBarter: true,
        hasOwnershipCard: true,
        hasInsurance: true,
        publishedAt: new Date(),
        vehicle: {
          create: {
            make: 'Hyundai',
            model: 'Elantra',
            year: 2020,
            vehicleType: 'SEDAN',
            fuelType: 'GASOLINE',
            transmissionType: 'AUTOMATIC',
            engineSize: 1.6,
            color: 'فضي',
            seatingCapacity: 5,
            doors: 4,
            condition: 'USED_GOOD',
            mileage: 80000,
            previousOwners: 1,
            assembledInEgypt: true,
            hasAccidents: false,
          },
        },
      },
    }),

    // Listing 3: Nissan Sunny (Dealer)
    prisma.listing.create({
      data: {
        title: 'نيسان صني 2022 زيرو',
        description: 'سيارة جديدة تماماً، ضمان الوكيل 3 سنوات',
        listingType: 'DEALER',
        status: 'ACTIVE',
        sellerId: users[2].id,
        askingPrice: 545000,
        negotiable: false,
        governorate: 'Cairo',
        city: 'Heliopolis',
        acceptsTradeIn: true,
        acceptsBarter: false,
        hasOwnershipCard: true,
        hasInsurance: true,
        publishedAt: new Date(),
        vehicle: {
          create: {
            make: 'Nissan',
            model: 'Sunny',
            year: 2022,
            vehicleType: 'SEDAN',
            fuelType: 'GASOLINE',
            transmissionType: 'AUTOMATIC',
            engineSize: 1.5,
            color: 'أسود',
            seatingCapacity: 5,
            doors: 4,
            condition: 'NEW',
            mileage: 0,
            previousOwners: 0,
            assembledInEgypt: true,
            hasAccidents: false,
          },
        },
      },
    }),

    // Listing 4: Mercedes C-Class (Certified)
    prisma.listing.create({
      data: {
        title: 'مرسيدس C180 2018 فل كامل',
        description: 'سيارة فاخرة بحالة ممتازة، جميع الصيانات من الوكيل',
        listingType: 'CERTIFIED',
        status: 'ACTIVE',
        sellerId: users[1].id,
        askingPrice: 650000,
        negotiable: true,
        governorate: 'Cairo',
        city: 'New Cairo',
        acceptsTradeIn: true,
        acceptsBarter: true,
        hasOwnershipCard: true,
        hasInsurance: true,
        isCertified: true,
        certificationId: 'XCHG-CERT-00002',
        warrantyMonths: 6,
        publishedAt: new Date(),
        vehicle: {
          create: {
            make: 'Mercedes',
            model: 'C-Class',
            year: 2018,
            vehicleType: 'SEDAN',
            fuelType: 'GASOLINE',
            transmissionType: 'AUTOMATIC',
            engineSize: 1.6,
            color: 'أبيض',
            seatingCapacity: 5,
            doors: 4,
            condition: 'USED_EXCELLENT',
            mileage: 60000,
            previousOwners: 1,
            assembledInEgypt: false,
            hasAccidents: false,
          },
        },
      },
    }),

    // Listing 5: Kia Sportage (SUV)
    prisma.listing.create({
      data: {
        title: 'كيا سبورتاج 2021 فابريكا',
        description: 'سيارة عائلية مثالية، استعمال خفيف',
        listingType: 'MARKETPLACE',
        status: 'ACTIVE',
        sellerId: users[1].id,
        askingPrice: 580000,
        negotiable: true,
        governorate: 'Alexandria',
        city: 'Smouha',
        acceptsTradeIn: true,
        acceptsBarter: true,
        hasOwnershipCard: true,
        hasInsurance: true,
        publishedAt: new Date(),
        vehicle: {
          create: {
            make: 'Kia',
            model: 'Sportage',
            year: 2021,
            vehicleType: 'SUV',
            fuelType: 'GASOLINE',
            transmissionType: 'AUTOMATIC',
            engineSize: 2.0,
            color: 'رمادي',
            seatingCapacity: 5,
            doors: 4,
            condition: 'USED_EXCELLENT',
            mileage: 35000,
            previousOwners: 1,
            assembledInEgypt: true,
            hasAccidents: false,
          },
        },
      },
    }),
  ]);

  console.log(`✅ Created ${listings.length} listings`);

  // 3. Create Inspections for Certified Vehicles
  console.log('🔍 Creating inspections...');

  const inspections = await Promise.all([
    prisma.inspection.create({
      data: {
        vehicleId: listings[0].vehicleId,
        listingId: listings[0].id,
        inspectorId: users[3].id,
        scheduledAt: new Date(),
        completedAt: new Date(),
        status: 'COMPLETED',
        inspectionAddress: 'معرض السيارة - التجمع الخامس',
        governorate: 'Cairo',
        city: 'New Cairo',
        overallGrade: 'A',
        overallScore: 92,
        exteriorScore: 95,
        interiorScore: 90,
        mechanicalScore: 88,
        electricalScore: 94,
        hasCriticalIssues: false,
        batteryHealth: 95,
        isPassed: true,
        certificationCode: 'XCHG-CERT-00001',
        inspectorNotes: 'السيارة في حالة ممتازة، لا توجد مشاكل',
      },
    }),

    prisma.inspection.create({
      data: {
        vehicleId: listings[3].vehicleId,
        listingId: listings[3].id,
        inspectorId: users[3].id,
        scheduledAt: new Date(),
        completedAt: new Date(),
        status: 'COMPLETED',
        inspectionAddress: 'معرض السيارة - القاهرة الجديدة',
        governorate: 'Cairo',
        city: 'New Cairo',
        overallGrade: 'A',
        overallScore: 90,
        exteriorScore: 92,
        interiorScore: 88,
        mechanicalScore: 90,
        electricalScore: 91,
        hasCriticalIssues: false,
        batteryHealth: 92,
        isPassed: true,
        certificationCode: 'XCHG-CERT-00002',
        inspectorNotes: 'سيارة فاخرة بحالة ممتازة',
      },
    }),
  ]);

  console.log(`✅ Created ${inspections.length} inspections`);

  // 4. Create Reviews
  console.log('⭐ Creating reviews...');

  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        authorId: users[0].id,
        targetId: users[1].id,
        rating: 5,
        communicationRating: 5,
        accuracyRating: 5,
        professionalismRating: 5,
        title: 'بائع ممتاز',
        comment: 'تعامل راقي جداً، السيارة كما في الوصف تماماً. أنصح بالتعامل معه',
        isVerified: true,
      },
    }),

    prisma.review.create({
      data: {
        authorId: users[0].id,
        targetId: users[2].id,
        rating: 4.5,
        communicationRating: 5,
        accuracyRating: 4,
        professionalismRating: 5,
        title: 'معرض موثوق',
        comment: 'تعامل احترافي، أسعار مناسبة',
        isVerified: true,
      },
    }),
  ]);

  console.log(`✅ Created ${reviews.length} reviews`);

  // 5. Create Favorites
  console.log('❤️ Creating favorites...');

  await prisma.favoriteListing.create({
    data: {
      userId: users[0].id,
      listingId: listings[0].id,
    },
  });

  // 6. Create System Config
  console.log('⚙️ Creating system config...');

  await Promise.all([
    prisma.systemConfig.create({
      data: {
        key: 'platform_fees',
        value: {
          marketplace: 3,
          certified: 5,
          dealer: 4,
        },
        description: 'Platform commission percentages by listing type',
      },
    }),

    prisma.systemConfig.create({
      data: {
        key: 'payment_providers',
        value: {
          paymob: {
            enabled: true,
            apiKey: process.env.PAYMOB_API_KEY || 'test_key',
          },
          fawry: {
            enabled: true,
            merchantCode: process.env.FAWRY_MERCHANT_CODE || 'test_code',
          },
        },
        description: 'Payment gateway configurations',
      },
    }),

    prisma.systemConfig.create({
      data: {
        key: 'financing_partners',
        value: [
          {
            id: 'CONTACT',
            name: 'كونتكت للتمويل',
            minDownPayment: 10,
            maxDuration: 60,
            interestRates: {
              '36': 22,
              '48': 24,
              '60': 26,
            },
          },
          {
            id: 'DRIVE',
            name: 'درايف للتمويل',
            minDownPayment: 15,
            maxDuration: 48,
            interestRates: {
              '36': 23,
              '48': 25,
            },
          },
        ],
        description: 'Financing partner configurations',
      },
    }),
  ]);

  console.log('✅ System config created');

  // Summary
  console.log('\n🎉 Seed completed successfully!');
  console.log('────────────────────────────────');
  console.log(`👥 Users: ${users.length}`);
  console.log(`🚗 Listings: ${listings.length}`);
  console.log(`🔍 Inspections: ${inspections.length}`);
  console.log(`⭐ Reviews: ${reviews.length}`);
  console.log('────────────────────────────────');
  console.log('\n📝 Test Credentials:');
  console.log('Phone: 01012345678');
  console.log('Password: password123');
  console.log('\n✅ Ready for development!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
