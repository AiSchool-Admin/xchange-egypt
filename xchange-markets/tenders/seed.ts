// ═══════════════════════════════════════════════════════════════════════════════
// XCHANGE TENDER MARKETPLACE - SEED DATA
// البيانات التجريبية لسوق المناقصات
// ═══════════════════════════════════════════════════════════════════════════════

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════════════════════════════════════

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية',
  'المنوفية', 'القليوبية', 'البحيرة', 'الغربية', 'كفر الشيخ'
];

const CITIES = {
  'القاهرة': ['مدينة نصر', 'المعادي', 'مصر الجديدة', 'المهندسين', 'الزمالك', 'العباسية', 'شبرا', 'حلوان'],
  'الجيزة': ['6 أكتوبر', 'الشيخ زايد', 'الهرم', 'فيصل', 'الدقي', 'العجوزة'],
  'الإسكندرية': ['سموحة', 'المنتزه', 'العصافرة', 'كليوباترا', 'ستانلي', 'سيدي جابر']
};

const TENDER_TITLES = {
  'IT_HARDWARE': [
    'توريد أجهزة حاسب آلي',
    'توريد طابعات وماسحات ضوئية',
    'توريد سيرفرات وأجهزة تخزين',
    'توريد أجهزة شبكات',
    'توريد شاشات عرض تفاعلية'
  ],
  'IT_SOFTWARE': [
    'تطوير نظام إدارة موارد بشرية',
    'تطوير تطبيق موبايل',
    'تطوير موقع إلكتروني',
    'توريد تراخيص برمجيات',
    'تطوير نظام ERP متكامل'
  ],
  'CONSTRUCTION': [
    'إنشاء مبنى إداري',
    'تشطيب وتجهيز مكاتب',
    'أعمال صيانة مباني',
    'إنشاء مجمع سكني',
    'تطوير بنية تحتية'
  ],
  'MEDICAL_SUPPLIES': [
    'توريد مستلزمات طبية',
    'توريد أجهزة طبية',
    'توريد أدوية ومستحضرات',
    'توريد معدات مختبرات',
    'توريد أثاث طبي'
  ],
  'CONSULTING': [
    'استشارات إدارية',
    'استشارات مالية',
    'استشارات قانونية',
    'دراسة جدوى اقتصادية',
    'استشارات تقنية'
  ],
  'CLEANING': [
    'خدمات نظافة مباني',
    'خدمات صيانة دورية',
    'خدمات تعقيم وتطهير',
    'خدمات إدارة مرافق'
  ],
  'SECURITY_SERVICES': [
    'خدمات حراسة وأمن',
    'تركيب كاميرات مراقبة',
    'أنظمة إنذار وحريق',
    'خدمات أمن سيبراني'
  ],
  'FURNITURE': [
    'توريد أثاث مكتبي',
    'توريد أثاث مدرسي',
    'توريد أثاث طبي',
    'تجهيز قاعات اجتماعات'
  ],
  'TRANSPORT': [
    'خدمات نقل بضائع',
    'توريد مركبات',
    'خدمات نقل موظفين',
    'خدمات لوجستية'
  ],
  'TRAINING': [
    'برامج تدريب موظفين',
    'دورات تدريبية متخصصة',
    'برامج تطوير قيادات',
    'تدريب على أنظمة جديدة'
  ]
};

const COMPANIES = [
  { name: 'شركة التقنية المتقدمة', nameAr: 'شركة التقنية المتقدمة', type: 'IT' },
  { name: 'شركة المقاولون العرب', nameAr: 'شركة المقاولون العرب', type: 'CONSTRUCTION' },
  { name: 'شركة النيل للتوريدات', nameAr: 'شركة النيل للتوريدات', type: 'SUPPLIES' },
  { name: 'مجموعة الفتح للاستشارات', nameAr: 'مجموعة الفتح للاستشارات', type: 'CONSULTING' },
  { name: 'شركة الأمان للحراسة', nameAr: 'شركة الأمان للحراسة', type: 'SECURITY' },
  { name: 'شركة النظافة الحديثة', nameAr: 'شركة النظافة الحديثة', type: 'CLEANING' },
  { name: 'مؤسسة الإتقان للأثاث', nameAr: 'مؤسسة الإتقان للأثاث', type: 'FURNITURE' },
  { name: 'شركة الصقر للنقل', nameAr: 'شركة الصقر للنقل', type: 'TRANSPORT' }
];

const GOVERNMENT_ENTITIES = [
  'وزارة الاتصالات وتكنولوجيا المعلومات',
  'وزارة الصحة والسكان',
  'وزارة التربية والتعليم',
  'وزارة الإسكان والمرافق',
  'الهيئة العامة للتنمية الصناعية',
  'جامعة القاهرة',
  'جامعة عين شمس',
  'مستشفى الدمرداش الجامعي',
  'الهيئة القومية للتأمين الاجتماعي',
  'الجهاز المركزي للتعبئة العامة والإحصاء'
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('🌱 بدء إنشاء البيانات التجريبية...');

  // Clean existing data
  console.log('🗑️ حذف البيانات القديمة...');
  await prisma.auditLog.deleteMany();
  await prisma.platformAnalytics.deleteMany();
  await prisma.tenderAnalytics.deleteMany();
  await prisma.savedSearch.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.disputeMessage.deleteMany();
  await prisma.disputeEvidence.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.review.deleteMany();
  await prisma.escrowTransaction.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.contractAmendment.deleteMany();
  await prisma.contractDocument.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.auctionDeposit.deleteMany();
  await prisma.reverseAuctionBid.deleteMany();
  await prisma.reverseAuction.deleteMany();
  await prisma.bidDocument.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.tenderWatchlist.deleteMany();
  await prisma.tenderInvitation.deleteMany();
  await prisma.tenderQuestion.deleteMany();
  await prisma.evaluationCriteria.deleteMany();
  await prisma.tenderDocument.deleteMany();
  await prisma.tender.deleteMany();
  await prisma.portfolioItem.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE USERS
  // ═══════════════════════════════════════════════════════════════════════════

  console.log('👥 إنشاء المستخدمين...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // Government Users
  const govUsers = await Promise.all(
    GOVERNMENT_ENTITIES.map((name, i) =>
      prisma.user.create({
        data: {
          email: `gov${i + 1}@gov.eg`,
          phone: `0100000000${i}`,
          passwordHash,
          fullName: name,
          fullNameAr: name,
          userType: 'GOVERNMENT',
          trustLevel: 'ELITE',
          trustScore: 100,
          kycStatus: 'APPROVED',
          governorate: randomFromArray(GOVERNORATES),
          city: 'وسط المدينة',
          isActive: true,
          totalTendersCreated: randomBetween(10, 50)
        }
      })
    )
  );

  // Company Users (Buyers)
  const companyBuyers = await Promise.all(
    [...Array(10)].map((_, i) =>
      prisma.user.create({
        data: {
          email: `company${i + 1}@example.com`,
          phone: `0111111111${i}`,
          passwordHash,
          fullName: `شركة ${['النور', 'الفجر', 'الأمل', 'النهضة', 'التقدم', 'الريادة', 'الإبداع', 'التميز', 'الجودة', 'الكفاءة'][i]} للتجارة`,
          fullNameAr: `شركة ${['النور', 'الفجر', 'الأمل', 'النهضة', 'التقدم', 'الريادة', 'الإبداع', 'التميز', 'الجودة', 'الكفاءة'][i]} للتجارة`,
          commercialRegister: `CR-${100000 + i}`,
          taxId: `TAX-${200000 + i}`,
          userType: 'COMPANY',
          trustLevel: randomFromArray(['VERIFIED', 'TRUSTED', 'PROFESSIONAL']),
          trustScore: randomBetween(60, 95),
          kycStatus: 'APPROVED',
          governorate: randomFromArray(GOVERNORATES),
          city: 'منطقة الأعمال',
          isActive: true,
          totalTendersCreated: randomBetween(5, 30)
        }
      })
    )
  );

  // Vendor Users
  const vendorUsers = await Promise.all(
    COMPANIES.map((company, i) =>
      prisma.user.create({
        data: {
          email: `vendor${i + 1}@example.com`,
          phone: `0122222222${i}`,
          passwordHash,
          fullName: company.name,
          fullNameAr: company.nameAr,
          commercialRegister: `CR-${300000 + i}`,
          taxId: `TAX-${400000 + i}`,
          userType: 'COMPANY',
          trustLevel: randomFromArray(['VERIFIED', 'TRUSTED', 'PROFESSIONAL', 'ELITE']),
          trustScore: randomBetween(70, 98),
          kycStatus: 'APPROVED',
          governorate: randomFromArray(GOVERNORATES),
          city: 'المنطقة الصناعية',
          isActive: true,
          totalBidsSubmitted: randomBetween(20, 100),
          totalContractsWon: randomBetween(5, 40),
          averageRating: randomBetween(35, 50) / 10
        }
      })
    )
  );

  // Individual Users (C2C)
  const individualUsers = await Promise.all(
    [...Array(20)].map((_, i) =>
      prisma.user.create({
        data: {
          email: `user${i + 1}@example.com`,
          phone: `0133333333${i}`,
          passwordHash,
          fullName: `${['أحمد', 'محمد', 'علي', 'عمر', 'خالد', 'حسن', 'إبراهيم', 'يوسف', 'مصطفى', 'سامي'][i % 10]} ${['محمود', 'عبدالله', 'السيد', 'حسين', 'أحمد'][i % 5]}`,
          fullNameAr: `${['أحمد', 'محمد', 'علي', 'عمر', 'خالد', 'حسن', 'إبراهيم', 'يوسف', 'مصطفى', 'سامي'][i % 10]} ${['محمود', 'عبدالله', 'السيد', 'حسين', 'أحمد'][i % 5]}`,
          nationalId: `2${randomBetween(85, 99)}${String(randomBetween(1, 12)).padStart(2, '0')}${String(randomBetween(1, 28)).padStart(2, '0')}${randomBetween(1000, 9999)}${randomBetween(1, 9)}`,
          nationalIdVerified: true,
          userType: randomFromArray(['INDIVIDUAL', 'FREELANCER', 'CONTRACTOR']),
          trustLevel: randomFromArray(['NEW', 'VERIFIED', 'TRUSTED']),
          trustScore: randomBetween(40, 85),
          kycStatus: 'APPROVED',
          governorate: randomFromArray(GOVERNORATES),
          isActive: true
        }
      })
    )
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE VENDORS
  // ═══════════════════════════════════════════════════════════════════════════

  console.log('🏢 إنشاء ملفات الموردين...');

  const vendors = await Promise.all(
    vendorUsers.map((user, i) => {
      const company = COMPANIES[i];
      const categories = {
        'IT': ['IT_HARDWARE', 'IT_SOFTWARE', 'IT_SERVICES'],
        'CONSTRUCTION': ['CONSTRUCTION', 'FINISHING', 'MAINTENANCE'],
        'SUPPLIES': ['OFFICE_SUPPLIES', 'FURNITURE', 'MEDICAL_SUPPLIES'],
        'CONSULTING': ['CONSULTING', 'TRAINING', 'LEGAL'],
        'SECURITY': ['SECURITY_SERVICES'],
        'CLEANING': ['CLEANING', 'MAINTENANCE'],
        'FURNITURE': ['FURNITURE', 'OFFICE_SUPPLIES'],
        'TRANSPORT': ['TRANSPORT', 'VEHICLES']
      };

      return prisma.vendor.create({
        data: {
          userId: user.id,
          companyName: company.name,
          companyNameAr: company.nameAr,
          companySize: randomFromArray(['SMALL', 'MEDIUM', 'LARGE']),
          yearEstablished: randomBetween(2000, 2020),
          employeeCount: randomFromArray(['10-50', '50-100', '100-250', '250+']),
          bio: `${company.nameAr} - شركة رائدة في مجال ${company.type === 'IT' ? 'تكنولوجيا المعلومات' : company.type === 'CONSTRUCTION' ? 'المقاولات' : 'التوريدات'}`,
          bioAr: `${company.nameAr} - شركة رائدة في مجال ${company.type === 'IT' ? 'تكنولوجيا المعلومات' : company.type === 'CONSTRUCTION' ? 'المقاولات' : 'التوريدات'}`,
          categories: categories[company.type as keyof typeof categories] || ['OTHER'],
          specializations: ['متخصصون', 'خبرة طويلة', 'جودة عالية'],
          headquarters: randomFromArray(GOVERNORATES),
          operatingGovernorate: GOVERNORATES.slice(0, randomBetween(3, 8)),
          trustScore: randomBetween(70, 98),
          responseRate: randomBetween(70, 99),
          responseTime: randomBetween(1, 24),
          winRate: randomBetween(20, 60),
          completedProjects: randomBetween(10, 100),
          totalContractValue: randomBetween(1000000, 50000000),
          onTimeDelivery: randomBetween(80, 100),
          qualityScore: randomBetween(75, 100),
          averageRating: randomBetween(35, 50) / 10,
          totalReviews: randomBetween(10, 100),
          qualityRating: randomBetween(35, 50) / 10,
          communicationRating: randomBetween(35, 50) / 10,
          timelinessRating: randomBetween(35, 50) / 10,
          valueRating: randomBetween(35, 50) / 10,
          isVerified: true,
          verificationLevel: randomFromArray(['BASIC', 'DOCUMENTS', 'PREMIUM']),
          subscriptionTier: randomFromArray(['FREE', 'BASIC', 'PROFESSIONAL']),
          isActive: true,
          isFeatured: Math.random() > 0.7
        }
      });
    })
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE TENDERS
  // ═══════════════════════════════════════════════════════════════════════════

  console.log('📋 إنشاء المناقصات...');

  const allBuyers = [...govUsers, ...companyBuyers];
  const categories = Object.keys(TENDER_TITLES);
  const tenders: any[] = [];

  for (let i = 0; i < 50; i++) {
    const category = randomFromArray(categories) as keyof typeof TENDER_TITLES;
    const title = randomFromArray(TENDER_TITLES[category]);
    const owner = randomFromArray(allBuyers);
    const governorate = randomFromArray(GOVERNORATES);
    const budgetBase = randomBetween(50000, 5000000);
    const hasReverseAuction = Math.random() > 0.7;

    const submissionDeadline = randomDate(
      new Date(),
      new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    );

    const tender = await prisma.tender.create({
      data: {
        referenceNumber: `TND-2025-${String(1000 + i).padStart(6, '0')}`,
        ownerId: owner.id,
        title: title,
        titleAr: title,
        description: `مناقصة ${title} - ${owner.fullName}`,
        descriptionAr: `مناقصة ${title} - ${owner.fullName}\n\nالمطلوب:\n- توريد وتركيب\n- ضمان لمدة سنتين\n- تدريب على الاستخدام\n\nالشروط:\n- خبرة لا تقل عن 3 سنوات\n- سابقة أعمال مماثلة`,
        tenderType: randomFromArray(['OPEN', 'RFQ', 'RFP']),
        category: category,
        businessType: owner.userType === 'GOVERNMENT' ? 'G2B' : 'B2B',
        budgetType: randomFromArray(['FIXED', 'RANGE']),
        budgetMin: budgetBase,
        budgetMax: budgetBase * 1.3,
        currency: 'EGP',
        showBudget: true,
        publishDate: new Date(),
        submissionDeadline,
        questionDeadline: new Date(submissionDeadline.getTime() - 7 * 24 * 60 * 60 * 1000),
        awardDate: new Date(submissionDeadline.getTime() + 14 * 24 * 60 * 60 * 1000),
        governorate,
        city: randomFromArray(CITIES[governorate as keyof typeof CITIES] || ['وسط المدينة']),
        requirements: `المتطلبات:\n- أن يكون المتقدم شركة مسجلة\n- خبرة لا تقل عن 3 سنوات\n- سابقة أعمال مماثلة`,
        requirementsAr: `المتطلبات:\n- أن يكون المتقدم شركة مسجلة\n- خبرة لا تقل عن 3 سنوات\n- سابقة أعمال مماثلة`,
        qualifications: ['سجل تجاري', 'بطاقة ضريبية', 'شهادة خبرة'],
        visibility: 'PUBLIC',
        isNegotiable: Math.random() > 0.8,
        requireDeposit: hasReverseAuction,
        depositPercentage: hasReverseAuction ? 5 : null,
        evaluationMethod: randomFromArray(['LOWEST_PRICE', 'BEST_VALUE']),
        status: 'ACTIVE',
        hasReverseAuction,
        viewCount: randomBetween(50, 500),
        bidCount: 0,
        watchlistCount: randomBetween(10, 100),
        moderationStatus: 'APPROVED',
        isFeatured: Math.random() > 0.8,
        publishedAt: new Date()
      }
    });

    tenders.push(tender);

    // Add evaluation criteria
    await prisma.evaluationCriteria.createMany({
      data: [
        { tenderId: tender.id, name: 'السعر', nameAr: 'السعر', weight: 40, maxScore: 100, order: 1 },
        { tenderId: tender.id, name: 'الجودة الفنية', nameAr: 'الجودة الفنية', weight: 30, maxScore: 100, order: 2 },
        { tenderId: tender.id, name: 'سابقة الأعمال', nameAr: 'سابقة الأعمال', weight: 20, maxScore: 100, order: 3 },
        { tenderId: tender.id, name: 'فترة الضمان', nameAr: 'فترة الضمان', weight: 10, maxScore: 100, order: 4 }
      ]
    });

    // Add documents
    await prisma.tenderDocument.createMany({
      data: [
        {
          tenderId: tender.id,
          name: 'كراسة الشروط والمواصفات',
          nameAr: 'كراسة الشروط والمواصفات',
          type: 'SPECIFICATIONS',
          url: `https://storage.xchange.eg/tenders/${tender.id}/specs.pdf`,
          size: randomBetween(500000, 5000000),
          isPublic: true,
          downloadCount: randomBetween(10, 100)
        },
        {
          tenderId: tender.id,
          name: 'جدول الكميات',
          nameAr: 'جدول الكميات',
          type: 'BOQ',
          url: `https://storage.xchange.eg/tenders/${tender.id}/boq.xlsx`,
          size: randomBetween(100000, 500000),
          isPublic: true,
          downloadCount: randomBetween(10, 80)
        }
      ]
    });

    // Create reverse auction if applicable
    if (hasReverseAuction) {
      const auctionStart = new Date(submissionDeadline.getTime() + 24 * 60 * 60 * 1000);
      await prisma.reverseAuction.create({
        data: {
          tenderId: tender.id,
          startTime: auctionStart,
          endTime: new Date(auctionStart.getTime() + 4 * 60 * 60 * 1000),
          extendOnBid: true,
          extensionMinutes: 3,
          maxExtensions: 10,
          startingPrice: budgetBase * 1.3,
          reservePrice: budgetBase * 0.8,
          minimumDecrement: Math.round(budgetBase * 0.01),
          status: 'SCHEDULED',
          requireDeposit: true,
          depositPercentage: 5
        }
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE BIDS
  // ═══════════════════════════════════════════════════════════════════════════

  console.log('💰 إنشاء العروض...');

  for (const tender of tenders.slice(0, 30)) {
    const numBids = randomBetween(3, 15);
    const shuffledVendors = [...vendors].sort(() => Math.random() - 0.5);

    for (let i = 0; i < numBids && i < shuffledVendors.length; i++) {
      const vendor = shuffledVendors[i];
      const vendorUser = vendorUsers.find(u => u.id === vendor.userId);
      const bidAmount = (tender.budgetMin || tender.budgetFixed) * (0.8 + Math.random() * 0.4);

      await prisma.bid.create({
        data: {
          referenceNumber: `BID-2025-${randomBetween(100000, 999999)}`,
          tenderId: tender.id,
          bidderId: vendorUser!.id,
          vendorId: vendor.id,
          totalPrice: Math.round(bidAmount),
          currency: 'EGP',
          proposedDuration: `${randomBetween(2, 12)} أسبوع`,
          warrantyPeriod: `${randomBetween(1, 3)} سنة`,
          technicalProposal: 'نقدم حلاً متكاملاً يشمل التوريد والتركيب والتدريب',
          status: 'SUBMITTED',
          submittedAt: new Date()
        }
      });
    }

    // Update tender bid count
    await prisma.tender.update({
      where: { id: tender.id },
      data: { bidCount: numBids }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE SERVICE REQUESTS (C2C)
  // ═══════════════════════════════════════════════════════════════════════════

  console.log('🏠 إنشاء طلبات الخدمات...');

  const serviceCategories = ['HOME_SERVICES', 'MAINTENANCE', 'CLEANING', 'ELECTRICAL', 'PLUMBING'];
  const serviceTitles = [
    'تجديد شقة كاملة',
    'صيانة تكييف',
    'تركيب كاميرات مراقبة',
    'تشطيب حمام',
    'إصلاح تسريب مياه',
    'تركيب أرضيات',
    'دهان شقة',
    'تركيب مطبخ',
    'صيانة كهرباء',
    'تركيب سباكة'
  ];

  for (let i = 0; i < 20; i++) {
    const requester = randomFromArray(individualUsers);
    const governorate = randomFromArray(GOVERNORATES);

    await prisma.serviceRequest.create({
      data: {
        referenceNumber: `SR-2025-${String(1000 + i).padStart(6, '0')}`,
        requesterId: requester.id,
        title: randomFromArray(serviceTitles),
        titleAr: randomFromArray(serviceTitles),
        description: 'طلب خدمة منزلية - يرجى التواصل لمزيد من التفاصيل',
        descriptionAr: 'طلب خدمة منزلية - يرجى التواصل لمزيد من التفاصيل',
        category: randomFromArray(serviceCategories),
        budgetType: 'RANGE',
        budgetMin: randomBetween(500, 5000),
        budgetMax: randomBetween(5000, 20000),
        governorate,
        city: randomFromArray(CITIES[governorate as keyof typeof CITIES] || ['وسط المدينة']),
        urgency: randomFromArray(['FLEXIBLE', 'NORMAL', 'URGENT']),
        flexibleDate: true,
        status: 'OPEN',
        autoMatch: true,
        maxQuotes: 5,
        viewCount: randomBetween(10, 100),
        quoteCount: randomBetween(0, 5)
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE SYSTEM CONFIG
  // ═══════════════════════════════════════════════════════════════════════════

  console.log('⚙️ إنشاء إعدادات النظام...');

  await prisma.systemConfig.createMany({
    data: [
      {
        key: 'platform_fees',
        value: {
          tenderPostingFee: 0,
          bidSubmissionFee: 0,
          successFee: 0.02,
          escrowFee: 0.005
        },
        description: 'رسوم المنصة'
      },
      {
        key: 'auction_rules',
        value: {
          minDecrement: 1000,
          extensionMinutes: 3,
          maxExtensions: 10,
          antiSnipingEnabled: true
        },
        description: 'قواعد المزاد العكسي'
      },
      {
        key: 'deposit_rules',
        value: {
          percentage: 5,
          minAmount: 1000,
          maxAmount: 100000
        },
        description: 'قواعد الودائع'
      },
      {
        key: 'governorates',
        value: GOVERNORATES,
        description: 'قائمة المحافظات'
      }
    ]
  });

  console.log('✅ تم إنشاء البيانات التجريبية بنجاح!');
  console.log(`
  📊 ملخص البيانات المنشأة:
  - المستخدمين الحكوميين: ${govUsers.length}
  - الشركات المشترية: ${companyBuyers.length}
  - الموردين: ${vendors.length}
  - المستخدمين الأفراد: ${individualUsers.length}
  - المناقصات: ${tenders.length}
  - طلبات الخدمات: 20
  `);
}

main()
  .catch((e) => {
    console.error('❌ خطأ في إنشاء البيانات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
