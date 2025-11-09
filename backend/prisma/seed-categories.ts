import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed categories for Xchange platform
 * Categories for used goods, waste, and various product types
 */
const categories = [
  // Main Categories (Parents)
  {
    nameAr: 'إلكترونيات',
    nameEn: 'Electronics',
    slug: 'electronics',
    description: 'أجهزة إلكترونية وتقنية',
    icon: '📱',
    order: 1,
    subcategories: [
      { nameAr: 'هواتف محمولة', nameEn: 'Mobile Phones', slug: 'mobile-phones', order: 1 },
      { nameAr: 'أجهزة كمبيوتر', nameEn: 'Computers', slug: 'computers', order: 2 },
      { nameAr: 'أجهزة لوحية', nameEn: 'Tablets', slug: 'tablets', order: 3 },
      { nameAr: 'كاميرات', nameEn: 'Cameras', slug: 'cameras', order: 4 },
      { nameAr: 'سماعات وصوتيات', nameEn: 'Audio & Headphones', slug: 'audio-headphones', order: 5 },
      { nameAr: 'إكسسوارات إلكترونية', nameEn: 'Electronics Accessories', slug: 'electronics-accessories', order: 6 },
    ],
  },
  {
    nameAr: 'أثاث ومفروشات',
    nameEn: 'Furniture',
    slug: 'furniture',
    description: 'أثاث منزلي ومكتبي',
    icon: '🛋️',
    order: 2,
    subcategories: [
      { nameAr: 'أثاث غرف النوم', nameEn: 'Bedroom Furniture', slug: 'bedroom-furniture', order: 1 },
      { nameAr: 'أثاث غرف المعيشة', nameEn: 'Living Room Furniture', slug: 'living-room-furniture', order: 2 },
      { nameAr: 'أثاث مكتبي', nameEn: 'Office Furniture', slug: 'office-furniture', order: 3 },
      { nameAr: 'أثاث خارجي', nameEn: 'Outdoor Furniture', slug: 'outdoor-furniture', order: 4 },
    ],
  },
  {
    nameAr: 'سيارات ومركبات',
    nameEn: 'Vehicles',
    slug: 'vehicles',
    description: 'سيارات ودراجات ومركبات',
    icon: '🚗',
    order: 3,
    subcategories: [
      { nameAr: 'سيارات', nameEn: 'Cars', slug: 'cars', order: 1 },
      { nameAr: 'دراجات نارية', nameEn: 'Motorcycles', slug: 'motorcycles', order: 2 },
      { nameAr: 'قطع غيار', nameEn: 'Auto Parts', slug: 'auto-parts', order: 3 },
      { nameAr: 'إكسسوارات السيارات', nameEn: 'Car Accessories', slug: 'car-accessories', order: 4 },
    ],
  },
  {
    nameAr: 'عقارات',
    nameEn: 'Real Estate',
    slug: 'real-estate',
    description: 'شقق وفيلات وأراضي',
    icon: '🏠',
    order: 4,
    subcategories: [
      { nameAr: 'شقق', nameEn: 'Apartments', slug: 'apartments', order: 1 },
      { nameAr: 'فيلات', nameEn: 'Villas', slug: 'villas', order: 2 },
      { nameAr: 'محلات تجارية', nameEn: 'Commercial', slug: 'commercial', order: 3 },
      { nameAr: 'أراضي', nameEn: 'Land', slug: 'land', order: 4 },
    ],
  },
  {
    nameAr: 'أجهزة منزلية',
    nameEn: 'Home Appliances',
    slug: 'home-appliances',
    description: 'أجهزة كهربائية منزلية',
    icon: '🏡',
    order: 5,
    subcategories: [
      { nameAr: 'ثلاجات', nameEn: 'Refrigerators', slug: 'refrigerators', order: 1 },
      { nameAr: 'غسالات', nameEn: 'Washing Machines', slug: 'washing-machines', order: 2 },
      { nameAr: 'مكيفات', nameEn: 'Air Conditioners', slug: 'air-conditioners', order: 3 },
      { nameAr: 'أفران ومواقد', nameEn: 'Ovens & Stoves', slug: 'ovens-stoves', order: 4 },
      { nameAr: 'أدوات مطبخ', nameEn: 'Kitchen Appliances', slug: 'kitchen-appliances', order: 5 },
    ],
  },
  {
    nameAr: 'ملابس وأزياء',
    nameEn: 'Fashion',
    slug: 'fashion',
    description: 'ملابس وإكسسوارات',
    icon: '👔',
    order: 6,
    subcategories: [
      { nameAr: 'ملابس رجالية', nameEn: 'Men\'s Clothing', slug: 'mens-clothing', order: 1 },
      { nameAr: 'ملابس نسائية', nameEn: 'Women\'s Clothing', slug: 'womens-clothing', order: 2 },
      { nameAr: 'ملابس أطفال', nameEn: 'Kids Clothing', slug: 'kids-clothing', order: 3 },
      { nameAr: 'أحذية', nameEn: 'Shoes', slug: 'shoes', order: 4 },
      { nameAr: 'حقائب', nameEn: 'Bags', slug: 'bags', order: 5 },
      { nameAr: 'إكسسوارات', nameEn: 'Accessories', slug: 'accessories', order: 6 },
    ],
  },
  {
    nameAr: 'كتب ووسائط',
    nameEn: 'Books & Media',
    slug: 'books-media',
    description: 'كتب ومجلات ووسائط',
    icon: '📚',
    order: 7,
    subcategories: [
      { nameAr: 'كتب', nameEn: 'Books', slug: 'books', order: 1 },
      { nameAr: 'مجلات', nameEn: 'Magazines', slug: 'magazines', order: 2 },
      { nameAr: 'أقراص وألعاب', nameEn: 'DVDs & Games', slug: 'dvds-games', order: 3 },
    ],
  },
  {
    nameAr: 'رياضة وترفيه',
    nameEn: 'Sports & Hobbies',
    slug: 'sports-hobbies',
    description: 'معدات رياضية وهوايات',
    icon: '⚽',
    order: 8,
    subcategories: [
      { nameAr: 'معدات رياضية', nameEn: 'Sports Equipment', slug: 'sports-equipment', order: 1 },
      { nameAr: 'دراجات', nameEn: 'Bicycles', slug: 'bicycles', order: 2 },
      { nameAr: 'آلات موسيقية', nameEn: 'Musical Instruments', slug: 'musical-instruments', order: 3 },
      { nameAr: 'ألعاب', nameEn: 'Toys & Games', slug: 'toys-games', order: 4 },
    ],
  },
  {
    nameAr: 'مواد بناء ونفايات',
    nameEn: 'Building Materials & Waste',
    slug: 'building-waste',
    description: 'مواد بناء ونفايات قابلة لإعادة الاستخدام',
    icon: '🏗️',
    order: 9,
    subcategories: [
      { nameAr: 'خشب', nameEn: 'Wood', slug: 'wood', order: 1 },
      { nameAr: 'معادن', nameEn: 'Metals', slug: 'metals', order: 2 },
      { nameAr: 'بلاستيك', nameEn: 'Plastics', slug: 'plastics', order: 3 },
      { nameAr: 'زجاج', nameEn: 'Glass', slug: 'glass', order: 4 },
      { nameAr: 'مواد بناء متنوعة', nameEn: 'Other Materials', slug: 'other-materials', order: 5 },
    ],
  },
  {
    nameAr: 'خدمات',
    nameEn: 'Services',
    slug: 'services',
    description: 'خدمات متنوعة',
    icon: '🛠️',
    order: 10,
    subcategories: [
      { nameAr: 'صيانة وإصلاح', nameEn: 'Maintenance & Repair', slug: 'maintenance-repair', order: 1 },
      { nameAr: 'نقل وشحن', nameEn: 'Moving & Shipping', slug: 'moving-shipping', order: 2 },
      { nameAr: 'تنظيف', nameEn: 'Cleaning', slug: 'cleaning', order: 3 },
      { nameAr: 'خدمات أخرى', nameEn: 'Other Services', slug: 'other-services', order: 4 },
    ],
  },
];

async function seedCategories() {
  console.log('🌱 Seeding categories...');

  for (const category of categories) {
    // Create parent category
    const parent = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        nameAr: category.nameAr,
        nameEn: category.nameEn,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        order: category.order,
        isActive: true,
      },
    });

    console.log(`✅ Created parent category: ${category.nameEn}`);

    // Create subcategories
    if (category.subcategories) {
      for (const subcategory of category.subcategories) {
        await prisma.category.upsert({
          where: { slug: subcategory.slug },
          update: {},
          create: {
            nameAr: subcategory.nameAr,
            nameEn: subcategory.nameEn,
            slug: subcategory.slug,
            parentId: parent.id,
            order: subcategory.order,
            isActive: true,
          },
        });
      }
      console.log(`   ↳ Created ${category.subcategories.length} subcategories`);
    }
  }

  console.log('✅ Categories seeded successfully!');
}

// Run seeding
seedCategories()
  .catch((error) => {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
