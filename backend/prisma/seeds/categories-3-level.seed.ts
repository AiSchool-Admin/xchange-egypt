/**
 * 3-Level Category Hierarchy Seed Data
 *
 * Structure: Category > Sub-Category > Sub-Sub-Category
 * Example: Home Appliances > Refrigerators > 24 Feet
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CategoryData {
  nameEn: string;
  nameAr: string;
  slug: string;
  description?: string;
  icon?: string;
  children?: CategoryData[];
}

const categories: CategoryData[] = [
  // 1. Electronics
  {
    nameEn: 'Electronics',
    nameAr: 'الإلكترونيات',
    slug: 'electronics',
    icon: '📱',
    children: [
      {
        nameEn: 'Smartphones',
        nameAr: 'الهواتف الذكية',
        slug: 'smartphones',
        children: [
          { nameEn: 'iPhone', nameAr: 'آيفون', slug: 'iphone' },
          { nameEn: 'Samsung', nameAr: 'سامسونج', slug: 'samsung' },
          { nameEn: 'Xiaomi', nameAr: 'شاومي', slug: 'xiaomi' },
          { nameEn: 'Oppo', nameAr: 'أوبو', slug: 'oppo' },
          { nameEn: 'Vivo', nameAr: 'فيفو', slug: 'vivo' },
          { nameEn: 'Huawei', nameAr: 'هواوي', slug: 'huawei' },
          { nameEn: 'Other Brands', nameAr: 'ماركات أخرى', slug: 'other-phone-brands' },
        ],
      },
      {
        nameEn: 'Laptops',
        nameAr: 'أجهزة الكمبيوتر المحمولة',
        slug: 'laptops',
        children: [
          { nameEn: 'MacBook', nameAr: 'ماك بوك', slug: 'macbook' },
          { nameEn: 'Gaming Laptops', nameAr: 'أجهزة الألعاب', slug: 'gaming-laptops' },
          { nameEn: 'Business Laptops', nameAr: 'أجهزة الأعمال', slug: 'business-laptops' },
          { nameEn: 'Ultrabooks', nameAr: 'الترابوك', slug: 'ultrabooks' },
          { nameEn: 'Budget Laptops', nameAr: 'أجهزة اقتصادية', slug: 'budget-laptops' },
        ],
      },
      {
        nameEn: 'Tablets',
        nameAr: 'الأجهزة اللوحية',
        slug: 'tablets',
        children: [
          { nameEn: 'iPad', nameAr: 'آيباد', slug: 'ipad' },
          { nameEn: 'Samsung Tablets', nameAr: 'سامسونج', slug: 'samsung-tablets' },
          { nameEn: 'Other Tablets', nameAr: 'أجهزة أخرى', slug: 'other-tablets' },
        ],
      },
      {
        nameEn: 'Cameras',
        nameAr: 'الكاميرات',
        slug: 'cameras',
        children: [
          { nameEn: 'DSLR', nameAr: 'دي إس إل آر', slug: 'dslr' },
          { nameEn: 'Mirrorless', nameAr: 'ميرورليس', slug: 'mirrorless' },
          { nameEn: 'Action Cameras', nameAr: 'كاميرات الأكشن', slug: 'action-cameras' },
          { nameEn: 'Point & Shoot', nameAr: 'كاميرات صغيرة', slug: 'point-shoot' },
        ],
      },
      {
        nameEn: 'TVs',
        nameAr: 'أجهزة التلفزيون',
        slug: 'tvs',
        children: [
          { nameEn: 'Smart TVs', nameAr: 'تلفزيون ذكي', slug: 'smart-tvs' },
          { nameEn: '32 Inch', nameAr: '32 بوصة', slug: '32-inch' },
          { nameEn: '43 Inch', nameAr: '43 بوصة', slug: '43-inch' },
          { nameEn: '55 Inch', nameAr: '55 بوصة', slug: '55-inch' },
          { nameEn: '65 Inch & Above', nameAr: '65 بوصة وأكثر', slug: '65-inch-above' },
        ],
      },
    ],
  },

  // 2. Home Appliances
  {
    nameEn: 'Home Appliances',
    nameAr: 'الأجهزة المنزلية',
    slug: 'home-appliances',
    icon: '🏠',
    children: [
      {
        nameEn: 'Refrigerators',
        nameAr: 'الثلاجات',
        slug: 'refrigerators',
        children: [
          { nameEn: '16 Feet', nameAr: '16 قدم', slug: '16-feet' },
          { nameEn: '18 Feet', nameAr: '18 قدم', slug: '18-feet' },
          { nameEn: '20 Feet', nameAr: '20 قدم', slug: '20-feet' },
          { nameEn: '24 Feet', nameAr: '24 قدم', slug: '24-feet' },
          { nameEn: 'Side by Side', nameAr: 'جنب إلى جنب', slug: 'side-by-side' },
        ],
      },
      {
        nameEn: 'Washing Machines',
        nameAr: 'الغسالات',
        slug: 'washing-machines',
        children: [
          { nameEn: 'Top Load', nameAr: 'تحميل علوي', slug: 'top-load' },
          { nameEn: 'Front Load', nameAr: 'تحميل أمامي', slug: 'front-load' },
          { nameEn: '7 KG', nameAr: '7 كيلو', slug: '7-kg' },
          { nameEn: '8-10 KG', nameAr: '8-10 كيلو', slug: '8-10-kg' },
          { nameEn: '11 KG & Above', nameAr: '11 كيلو وأكثر', slug: '11-kg-above' },
        ],
      },
      {
        nameEn: 'Air Conditioners',
        nameAr: 'مكيفات الهواء',
        slug: 'air-conditioners',
        children: [
          { nameEn: '1.5 HP', nameAr: '1.5 حصان', slug: '1-5-hp' },
          { nameEn: '2.25 HP', nameAr: '2.25 حصان', slug: '2-25-hp' },
          { nameEn: '3 HP', nameAr: '3 حصان', slug: '3-hp' },
          { nameEn: 'Split AC', nameAr: 'سبليت', slug: 'split-ac' },
          { nameEn: 'Window AC', nameAr: 'شباك', slug: 'window-ac' },
        ],
      },
      {
        nameEn: 'Microwaves',
        nameAr: 'الميكروويف',
        slug: 'microwaves',
        children: [
          { nameEn: 'Solo', nameAr: 'عادي', slug: 'solo' },
          { nameEn: 'Grill', nameAr: 'شواية', slug: 'grill' },
          { nameEn: 'Convection', nameAr: 'حراري', slug: 'convection' },
        ],
      },
      {
        nameEn: 'Vacuum Cleaners',
        nameAr: 'المكانس الكهربائية',
        slug: 'vacuum-cleaners',
        children: [
          { nameEn: 'Upright', nameAr: 'عمودي', slug: 'upright' },
          { nameEn: 'Canister', nameAr: 'أسطواني', slug: 'canister' },
          { nameEn: 'Handheld', nameAr: 'محمول', slug: 'handheld' },
          { nameEn: 'Robot', nameAr: 'روبوت', slug: 'robot' },
        ],
      },
    ],
  },

  // 3. Furniture
  {
    nameEn: 'Furniture',
    nameAr: 'الأثاث',
    slug: 'furniture',
    icon: '🛋️',
    children: [
      {
        nameEn: 'Living Room',
        nameAr: 'غرفة المعيشة',
        slug: 'living-room',
        children: [
          { nameEn: 'Sofas', nameAr: 'الكنب', slug: 'sofas' },
          { nameEn: 'Coffee Tables', nameAr: 'طاولات القهوة', slug: 'coffee-tables' },
          { nameEn: 'TV Units', nameAr: 'وحدات التلفزيون', slug: 'tv-units' },
          { nameEn: 'Bookshelves', nameAr: 'رفوف الكتب', slug: 'bookshelves' },
        ],
      },
      {
        nameEn: 'Bedroom',
        nameAr: 'غرفة النوم',
        slug: 'bedroom',
        children: [
          { nameEn: 'Beds', nameAr: 'الأسرة', slug: 'beds' },
          { nameEn: 'Wardrobes', nameAr: 'الخزائن', slug: 'wardrobes' },
          { nameEn: 'Dressers', nameAr: 'التسريحات', slug: 'dressers' },
          { nameEn: 'Nightstands', nameAr: 'الكوميدينو', slug: 'nightstands' },
        ],
      },
      {
        nameEn: 'Dining Room',
        nameAr: 'غرفة الطعام',
        slug: 'dining-room',
        children: [
          { nameEn: 'Dining Tables', nameAr: 'طاولات الطعام', slug: 'dining-tables' },
          { nameEn: 'Chairs', nameAr: 'الكراسي', slug: 'chairs' },
          { nameEn: 'Buffets', nameAr: 'البوفيهات', slug: 'buffets' },
        ],
      },
      {
        nameEn: 'Office',
        nameAr: 'المكتب',
        slug: 'office',
        children: [
          { nameEn: 'Desks', nameAr: 'المكاتب', slug: 'desks' },
          { nameEn: 'Office Chairs', nameAr: 'كراسي المكتب', slug: 'office-chairs' },
          { nameEn: 'Filing Cabinets', nameAr: 'خزائن الملفات', slug: 'filing-cabinets' },
        ],
      },
    ],
  },

  // 4. Vehicles
  {
    nameEn: 'Vehicles',
    nameAr: 'المركبات',
    slug: 'vehicles',
    icon: '🚗',
    children: [
      {
        nameEn: 'Cars',
        nameAr: 'السيارات',
        slug: 'cars',
        children: [
          { nameEn: 'Sedans', nameAr: 'سيدان', slug: 'sedans' },
          { nameEn: 'SUVs', nameAr: 'دفع رباعي', slug: 'suvs' },
          { nameEn: 'Hatchbacks', nameAr: 'هاتشباك', slug: 'hatchbacks' },
          { nameEn: 'Pickup Trucks', nameAr: 'شاحنات صغيرة', slug: 'pickup-trucks' },
          { nameEn: 'Vans', nameAr: 'ميكروباص', slug: 'vans' },
        ],
      },
      {
        nameEn: 'Motorcycles',
        nameAr: 'الدراجات النارية',
        slug: 'motorcycles',
        children: [
          { nameEn: 'Sport Bikes', nameAr: 'رياضية', slug: 'sport-bikes' },
          { nameEn: 'Cruisers', nameAr: 'كروزر', slug: 'cruisers' },
          { nameEn: 'Scooters', nameAr: 'سكوتر', slug: 'scooters' },
          { nameEn: 'Touring', nameAr: 'للرحلات', slug: 'touring' },
        ],
      },
      {
        nameEn: 'Bicycles',
        nameAr: 'الدراجات',
        slug: 'bicycles',
        children: [
          { nameEn: 'Mountain Bikes', nameAr: 'جبلية', slug: 'mountain-bikes' },
          { nameEn: 'Road Bikes', nameAr: 'طريق', slug: 'road-bikes' },
          { nameEn: 'Electric Bikes', nameAr: 'كهربائية', slug: 'electric-bikes' },
          { nameEn: 'Kids Bikes', nameAr: 'للأطفال', slug: 'kids-bikes' },
        ],
      },
    ],
  },

  // 5. Fashion & Clothing
  {
    nameEn: 'Fashion & Clothing',
    nameAr: 'الأزياء والملابس',
    slug: 'fashion-clothing',
    icon: '👔',
    children: [
      {
        nameEn: "Men's Clothing",
        nameAr: 'ملابس رجالية',
        slug: 'mens-clothing',
        children: [
          { nameEn: 'Shirts', nameAr: 'قمصان', slug: 'shirts' },
          { nameEn: 'T-Shirts', nameAr: 'تيشرتات', slug: 't-shirts' },
          { nameEn: 'Pants', nameAr: 'بناطيل', slug: 'pants' },
          { nameEn: 'Suits', nameAr: 'بدل', slug: 'suits' },
          { nameEn: 'Jackets', nameAr: 'جاكيتات', slug: 'jackets' },
        ],
      },
      {
        nameEn: "Women's Clothing",
        nameAr: 'ملابس نسائية',
        slug: 'womens-clothing',
        children: [
          { nameEn: 'Dresses', nameAr: 'فساتين', slug: 'dresses' },
          { nameEn: 'Tops', nameAr: 'بلوزات', slug: 'tops' },
          { nameEn: 'Skirts', nameAr: 'تنانير', slug: 'skirts' },
          { nameEn: 'Pants', nameAr: 'بناطيل', slug: 'womens-pants' },
          { nameEn: 'Abayas', nameAr: 'عبايات', slug: 'abayas' },
        ],
      },
      {
        nameEn: 'Shoes',
        nameAr: 'الأحذية',
        slug: 'shoes',
        children: [
          { nameEn: 'Sneakers', nameAr: 'أحذية رياضية', slug: 'sneakers' },
          { nameEn: 'Formal Shoes', nameAr: 'أحذية رسمية', slug: 'formal-shoes' },
          { nameEn: 'Sandals', nameAr: 'صنادل', slug: 'sandals' },
          { nameEn: 'Boots', nameAr: 'أحذية طويلة', slug: 'boots' },
        ],
      },
      {
        nameEn: 'Bags',
        nameAr: 'الحقائب',
        slug: 'bags',
        children: [
          { nameEn: 'Handbags', nameAr: 'حقائب يد', slug: 'handbags' },
          { nameEn: 'Backpacks', nameAr: 'حقائب ظهر', slug: 'backpacks' },
          { nameEn: 'Wallets', nameAr: 'محافظ', slug: 'wallets' },
          { nameEn: 'Travel Bags', nameAr: 'حقائب سفر', slug: 'travel-bags' },
        ],
      },
    ],
  },

  // 6. Sports & Fitness
  {
    nameEn: 'Sports & Fitness',
    nameAr: 'الرياضة واللياقة',
    slug: 'sports-fitness',
    icon: '⚽',
    children: [
      {
        nameEn: 'Gym Equipment',
        nameAr: 'معدات الجيم',
        slug: 'gym-equipment',
        children: [
          { nameEn: 'Treadmills', nameAr: 'جهاز المشي', slug: 'treadmills' },
          { nameEn: 'Dumbbells', nameAr: 'دمبلز', slug: 'dumbbells' },
          { nameEn: 'Benches', nameAr: 'مقاعد', slug: 'benches' },
          { nameEn: 'Exercise Bikes', nameAr: 'دراجات التمرين', slug: 'exercise-bikes' },
        ],
      },
      {
        nameEn: 'Outdoor Sports',
        nameAr: 'رياضات خارجية',
        slug: 'outdoor-sports',
        children: [
          { nameEn: 'Football', nameAr: 'كرة القدم', slug: 'football' },
          { nameEn: 'Basketball', nameAr: 'كرة السلة', slug: 'basketball' },
          { nameEn: 'Tennis', nameAr: 'التنس', slug: 'tennis' },
          { nameEn: 'Swimming', nameAr: 'السباحة', slug: 'swimming' },
        ],
      },
    ],
  },

  // 7. Books & Media
  {
    nameEn: 'Books & Media',
    nameAr: 'الكتب والوسائط',
    slug: 'books-media',
    icon: '📚',
    children: [
      {
        nameEn: 'Books',
        nameAr: 'الكتب',
        slug: 'books',
        children: [
          { nameEn: 'Fiction', nameAr: 'روايات', slug: 'fiction' },
          { nameEn: 'Non-Fiction', nameAr: 'غير روائية', slug: 'non-fiction' },
          { nameEn: 'Educational', nameAr: 'تعليمية', slug: 'educational' },
          { nameEn: 'Religious', nameAr: 'دينية', slug: 'religious' },
          { nameEn: 'Children', nameAr: 'للأطفال', slug: 'children-books' },
        ],
      },
      {
        nameEn: 'Video Games',
        nameAr: 'ألعاب الفيديو',
        slug: 'video-games',
        children: [
          { nameEn: 'PlayStation', nameAr: 'بلايستيشن', slug: 'playstation' },
          { nameEn: 'Xbox', nameAr: 'إكس بوكس', slug: 'xbox' },
          { nameEn: 'Nintendo', nameAr: 'نينتندو', slug: 'nintendo' },
          { nameEn: 'PC Games', nameAr: 'ألعاب كمبيوتر', slug: 'pc-games' },
        ],
      },
    ],
  },

  // 8. Kids & Baby
  {
    nameEn: 'Kids & Baby',
    nameAr: 'الأطفال والرضع',
    slug: 'kids-baby',
    icon: '👶',
    children: [
      {
        nameEn: 'Baby Gear',
        nameAr: 'معدات الأطفال',
        slug: 'baby-gear',
        children: [
          { nameEn: 'Strollers', nameAr: 'عربات الأطفال', slug: 'strollers' },
          { nameEn: 'Car Seats', nameAr: 'مقاعد السيارة', slug: 'car-seats' },
          { nameEn: 'Cribs', nameAr: 'أسرة الأطفال', slug: 'cribs' },
          { nameEn: 'High Chairs', nameAr: 'كراسي الطعام', slug: 'high-chairs' },
        ],
      },
      {
        nameEn: 'Toys',
        nameAr: 'الألعاب',
        slug: 'toys',
        children: [
          { nameEn: 'Educational Toys', nameAr: 'ألعاب تعليمية', slug: 'educational-toys' },
          { nameEn: 'Dolls', nameAr: 'عرائس', slug: 'dolls' },
          { nameEn: 'Action Figures', nameAr: 'شخصيات', slug: 'action-figures' },
          { nameEn: 'Building Blocks', nameAr: 'مكعبات', slug: 'building-blocks' },
        ],
      },
    ],
  },
];

async function createCategoryHierarchy(
  categoryData: CategoryData,
  parentId: string | null = null,
  order: number = 0
): Promise<void> {
  const category = await prisma.category.create({
    data: {
      nameEn: categoryData.nameEn,
      nameAr: categoryData.nameAr,
      slug: categoryData.slug,
      description: categoryData.description,
      icon: categoryData.icon,
      parentId,
      order,
      isActive: true,
    },
  });

  console.log(`✓ Created: ${categoryData.nameEn} (${category.id})`);

  if (categoryData.children && categoryData.children.length > 0) {
    for (let i = 0; i < categoryData.children.length; i++) {
      await createCategoryHierarchy(categoryData.children[i], category.id, i);
    }
  }
}

async function main() {
  console.log('🌱 Starting 3-level category hierarchy seed...\n');

  // Delete existing categories (optional - comment out if you want to keep existing)
  console.log('🗑️  Clearing existing categories...');
  await prisma.category.deleteMany({});
  console.log('✓ Cleared\n');

  console.log('📦 Creating category hierarchy...\n');

  for (let i = 0; i < categories.length; i++) {
    await createCategoryHierarchy(categories[i], null, i);
    console.log(''); // Empty line between root categories
  }

  console.log('✅ Category hierarchy seed completed!\n');

  // Print summary
  const totalCategories = await prisma.category.count();
  const rootCategories = await prisma.category.count({ where: { parentId: null } });
  const level2Categories = await prisma.category.count({
    where: { parentId: { not: null }, parent: { parentId: null } },
  });
  const level3Categories = await prisma.category.count({
    where: { parentId: { not: null }, parent: { parentId: { not: null } } },
  });

  console.log('📊 Summary:');
  console.log(`   Total Categories: ${totalCategories}`);
  console.log(`   Level 1 (Root): ${rootCategories}`);
  console.log(`   Level 2 (Sub): ${level2Categories}`);
  console.log(`   Level 3 (Sub-Sub): ${level3Categories}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
