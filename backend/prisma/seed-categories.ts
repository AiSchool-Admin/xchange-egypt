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
      {
        nameAr: 'هواتف محمولة',
        nameEn: 'Mobile Phones',
        slug: 'mobile-phones',
        order: 1,
        subsubcategories: [
          { nameAr: 'آيفون', nameEn: 'iPhone', slug: 'iphone', order: 1 },
          { nameAr: 'سامسونج', nameEn: 'Samsung', slug: 'samsung-phones', order: 2 },
          { nameAr: 'شاومي', nameEn: 'Xiaomi', slug: 'xiaomi-phones', order: 3 },
          { nameAr: 'هواوي', nameEn: 'Huawei', slug: 'huawei-phones', order: 4 },
          { nameAr: 'أوبو', nameEn: 'Oppo', slug: 'oppo-phones', order: 5 },
          { nameAr: 'ريلمي', nameEn: 'Realme', slug: 'realme-phones', order: 6 },
          { nameAr: 'هواتف أخرى', nameEn: 'Other Phones', slug: 'other-phones', order: 7 },
        ],
      },
      {
        nameAr: 'أجهزة كمبيوتر',
        nameEn: 'Computers',
        slug: 'computers',
        order: 2,
        subsubcategories: [
          { nameAr: 'لابتوب', nameEn: 'Laptops', slug: 'laptops', order: 1 },
          { nameAr: 'كمبيوتر مكتبي', nameEn: 'Desktop PCs', slug: 'desktop-pcs', order: 2 },
          { nameAr: 'شاشات', nameEn: 'Monitors', slug: 'monitors', order: 3 },
          { nameAr: 'قطع كمبيوتر', nameEn: 'Computer Parts', slug: 'computer-parts', order: 4 },
          { nameAr: 'طابعات وماسحات', nameEn: 'Printers & Scanners', slug: 'printers-scanners', order: 5 },
        ],
      },
      {
        nameAr: 'أجهزة لوحية',
        nameEn: 'Tablets',
        slug: 'tablets',
        order: 3,
        subsubcategories: [
          { nameAr: 'آيباد', nameEn: 'iPad', slug: 'ipad', order: 1 },
          { nameAr: 'تابلت سامسونج', nameEn: 'Samsung Tablets', slug: 'samsung-tablets', order: 2 },
          { nameAr: 'تابلت أخرى', nameEn: 'Other Tablets', slug: 'other-tablets', order: 3 },
        ],
      },
      {
        nameAr: 'كاميرات',
        nameEn: 'Cameras',
        slug: 'cameras',
        order: 4,
        subsubcategories: [
          { nameAr: 'كاميرات DSLR', nameEn: 'DSLR Cameras', slug: 'dslr-cameras', order: 1 },
          { nameAr: 'كاميرات ميرورليس', nameEn: 'Mirrorless Cameras', slug: 'mirrorless-cameras', order: 2 },
          { nameAr: 'كاميرات فيديو', nameEn: 'Video Cameras', slug: 'video-cameras', order: 3 },
          { nameAr: 'عدسات', nameEn: 'Lenses', slug: 'camera-lenses', order: 4 },
          { nameAr: 'إكسسوارات كاميرا', nameEn: 'Camera Accessories', slug: 'camera-accessories', order: 5 },
        ],
      },
      {
        nameAr: 'سماعات وصوتيات',
        nameEn: 'Audio & Headphones',
        slug: 'audio-headphones',
        order: 5,
        subsubcategories: [
          { nameAr: 'سماعات لاسلكية', nameEn: 'Wireless Headphones', slug: 'wireless-headphones', order: 1 },
          { nameAr: 'سماعات سلكية', nameEn: 'Wired Headphones', slug: 'wired-headphones', order: 2 },
          { nameAr: 'سماعات بلوتوث', nameEn: 'Bluetooth Speakers', slug: 'bluetooth-speakers', order: 3 },
          { nameAr: 'مكبرات صوت', nameEn: 'Sound Systems', slug: 'sound-systems', order: 4 },
        ],
      },
      {
        nameAr: 'إكسسوارات إلكترونية',
        nameEn: 'Electronics Accessories',
        slug: 'electronics-accessories',
        order: 6,
        subsubcategories: [
          { nameAr: 'شواحن وكابلات', nameEn: 'Chargers & Cables', slug: 'chargers-cables', order: 1 },
          { nameAr: 'حافظات وأغطية', nameEn: 'Cases & Covers', slug: 'cases-covers', order: 2 },
          { nameAr: 'باور بانك', nameEn: 'Power Banks', slug: 'power-banks', order: 3 },
          { nameAr: 'ساعات ذكية', nameEn: 'Smart Watches', slug: 'smart-watches', order: 4 },
        ],
      },
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
      {
        nameAr: 'أثاث غرف النوم',
        nameEn: 'Bedroom Furniture',
        slug: 'bedroom-furniture',
        order: 1,
        subsubcategories: [
          { nameAr: 'أسِرَّة', nameEn: 'Beds', slug: 'beds', order: 1 },
          { nameAr: 'دواليب', nameEn: 'Wardrobes', slug: 'wardrobes', order: 2 },
          { nameAr: 'كومودينو', nameEn: 'Nightstands', slug: 'nightstands', order: 3 },
          { nameAr: 'تسريحات', nameEn: 'Dressers', slug: 'dressers', order: 4 },
        ],
      },
      {
        nameAr: 'أثاث غرف المعيشة',
        nameEn: 'Living Room Furniture',
        slug: 'living-room-furniture',
        order: 2,
        subsubcategories: [
          { nameAr: 'كنب وأرائك', nameEn: 'Sofas & Couches', slug: 'sofas-couches', order: 1 },
          { nameAr: 'طاولات', nameEn: 'Tables', slug: 'tables', order: 2 },
          { nameAr: 'مكتبات وأرفف', nameEn: 'Shelves & Bookcases', slug: 'shelves-bookcases', order: 3 },
          { nameAr: 'وحدات تلفزيون', nameEn: 'TV Units', slug: 'tv-units', order: 4 },
        ],
      },
      {
        nameAr: 'أثاث مكتبي',
        nameEn: 'Office Furniture',
        slug: 'office-furniture',
        order: 3,
        subsubcategories: [
          { nameAr: 'مكاتب', nameEn: 'Desks', slug: 'desks', order: 1 },
          { nameAr: 'كراسي مكتب', nameEn: 'Office Chairs', slug: 'office-chairs', order: 2 },
          { nameAr: 'خزائن ملفات', nameEn: 'Filing Cabinets', slug: 'filing-cabinets', order: 3 },
        ],
      },
      {
        nameAr: 'أثاث خارجي',
        nameEn: 'Outdoor Furniture',
        slug: 'outdoor-furniture',
        order: 4,
        subsubcategories: [
          { nameAr: 'جلسات حدائق', nameEn: 'Garden Sets', slug: 'garden-sets', order: 1 },
          { nameAr: 'مظلات', nameEn: 'Umbrellas', slug: 'umbrellas', order: 2 },
          { nameAr: 'أراجيح', nameEn: 'Swings', slug: 'swings', order: 3 },
        ],
      },
    ],
  },
  // NEW: Home & Garden Category
  {
    nameAr: 'المنزل والحديقة',
    nameEn: 'Home & Garden',
    slug: 'home-garden',
    description: 'مستلزمات المنزل والحديقة',
    icon: '🏡',
    order: 13,
    subcategories: [
      {
        nameAr: 'المطبخ والطعام',
        nameEn: 'Kitchen & Food',
        slug: 'kitchen-food',
        order: 1,
        subsubcategories: [
          { nameAr: 'أواني طهي', nameEn: 'Cookware', slug: 'cookware', order: 1 },
          { nameAr: 'أدوات مائدة', nameEn: 'Tableware', slug: 'tableware', order: 2 },
          { nameAr: 'أجهزة مطبخ صغيرة', nameEn: 'Small Kitchen Appliances', slug: 'small-kitchen-appliances', order: 3 },
          { nameAr: 'تخزين طعام', nameEn: 'Food Storage', slug: 'food-storage', order: 4 },
          { nameAr: 'أدوات خَبز', nameEn: 'Bakeware', slug: 'bakeware', order: 5 },
        ],
      },
      {
        nameAr: 'الحمام',
        nameEn: 'Bathroom',
        slug: 'bathroom',
        order: 2,
        subsubcategories: [
          { nameAr: 'إكسسوارات حمام', nameEn: 'Bathroom Accessories', slug: 'bathroom-accessories', order: 1 },
          { nameAr: 'مناشف', nameEn: 'Towels', slug: 'towels', order: 2 },
          { nameAr: 'ستائر حمام', nameEn: 'Shower Curtains', slug: 'shower-curtains', order: 3 },
        ],
      },
      {
        nameAr: 'الحديقة',
        nameEn: 'Garden',
        slug: 'garden',
        order: 3,
        subsubcategories: [
          { nameAr: 'نباتات وأصص', nameEn: 'Plants & Pots', slug: 'plants-pots', order: 1 },
          { nameAr: 'أدوات حديقة', nameEn: 'Garden Tools', slug: 'garden-tools', order: 2 },
          { nameAr: 'ري وخراطيم', nameEn: 'Watering & Hoses', slug: 'watering-hoses', order: 3 },
          { nameAr: 'إضاءة حديقة', nameEn: 'Garden Lighting', slug: 'garden-lighting', order: 4 },
        ],
      },
      {
        nameAr: 'ديكور منزلي',
        nameEn: 'Home Decor',
        slug: 'home-decor',
        order: 4,
        subsubcategories: [
          { nameAr: 'لوحات وإطارات', nameEn: 'Art & Frames', slug: 'art-frames', order: 1 },
          { nameAr: 'مرايا', nameEn: 'Mirrors', slug: 'mirrors', order: 2 },
          { nameAr: 'شموع ومعطرات', nameEn: 'Candles & Fragrances', slug: 'candles-fragrances', order: 3 },
          { nameAr: 'سجاد', nameEn: 'Rugs', slug: 'rugs', order: 4 },
          { nameAr: 'ستائر', nameEn: 'Curtains', slug: 'curtains', order: 5 },
        ],
      },
      {
        nameAr: 'مفروشات',
        nameEn: 'Bedding & Linens',
        slug: 'bedding-linens',
        order: 5,
        subsubcategories: [
          { nameAr: 'ملايات', nameEn: 'Bed Sheets', slug: 'bed-sheets', order: 1 },
          { nameAr: 'لحافات', nameEn: 'Comforters', slug: 'comforters', order: 2 },
          { nameAr: 'وسائد', nameEn: 'Pillows', slug: 'pillows', order: 3 },
          { nameAr: 'بطانيات', nameEn: 'Blankets', slug: 'blankets', order: 4 },
        ],
      },
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
  // Luxury Categories for high-end items
  {
    nameAr: 'سلع فاخرة',
    nameEn: 'Luxury Goods',
    slug: 'luxury',
    description: 'منتجات فاخرة وعالية القيمة',
    icon: '👑',
    order: 11,
    subcategories: [
      { nameAr: 'ساعات فاخرة', nameEn: 'Luxury Watches', slug: 'luxury-watches', order: 1 },
      { nameAr: 'مجوهرات', nameEn: 'Jewelry', slug: 'jewelry', order: 2 },
      { nameAr: 'حقائب فاخرة', nameEn: 'Luxury Bags', slug: 'luxury-bags', order: 3 },
      { nameAr: 'عطور أصلية', nameEn: 'Perfumes', slug: 'perfumes', order: 4 },
      { nameAr: 'نظارات شمسية', nameEn: 'Sunglasses', slug: 'sunglasses', order: 5 },
      { nameAr: 'أقلام فاخرة', nameEn: 'Luxury Pens', slug: 'luxury-pens', order: 6 },
    ],
  },
  {
    nameAr: 'فنون ومقتنيات',
    nameEn: 'Art & Collectibles',
    slug: 'art-collectibles',
    description: 'لوحات فنية وتحف ومقتنيات نادرة',
    icon: '🖼️',
    order: 12,
    subcategories: [
      { nameAr: 'لوحات فنية', nameEn: 'Paintings', slug: 'paintings', order: 1 },
      { nameAr: 'تحف أثرية', nameEn: 'Antiques', slug: 'antiques', order: 2 },
      { nameAr: 'منحوتات', nameEn: 'Sculptures', slug: 'sculptures', order: 3 },
      { nameAr: 'عملات ومسكوكات', nameEn: 'Coins & Currency', slug: 'coins-currency', order: 4 },
      { nameAr: 'طوابع', nameEn: 'Stamps', slug: 'stamps', order: 5 },
      { nameAr: 'مقتنيات رياضية', nameEn: 'Sports Memorabilia', slug: 'sports-memorabilia', order: 6 },
    ],
  },
];

async function seedCategories() {
  console.log('🌱 Seeding categories...');

  for (const category of categories) {
    // Create parent category (Level 1)
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

    // Create subcategories (Level 2)
    if (category.subcategories) {
      let subsubCount = 0;
      for (const subcategory of category.subcategories) {
        const subcat = await prisma.category.upsert({
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

        // Create sub-subcategories (Level 3)
        if ('subsubcategories' in subcategory && subcategory.subsubcategories) {
          for (const subsubcategory of subcategory.subsubcategories) {
            await prisma.category.upsert({
              where: { slug: subsubcategory.slug },
              update: {},
              create: {
                nameAr: subsubcategory.nameAr,
                nameEn: subsubcategory.nameEn,
                slug: subsubcategory.slug,
                parentId: subcat.id,
                order: subsubcategory.order,
                isActive: true,
              },
            });
            subsubCount++;
          }
        }
      }
      console.log(`   ↳ Created ${category.subcategories.length} subcategories, ${subsubCount} sub-subcategories`);
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
