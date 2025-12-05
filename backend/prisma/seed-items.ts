import { PrismaClient, ItemCondition } from '@prisma/client';

const prisma = new PrismaClient();

async function seedItems() {
  console.log('🌱 Seeding items...');

  // Get users
  const ahmed = await prisma.user.findUnique({ where: { email: 'ahmed.mohamed@example.com' } });
  const fatma = await prisma.user.findUnique({ where: { email: 'fatma.ali@example.com' } });
  const khaled = await prisma.user.findUnique({ where: { email: 'khaled.hassan@example.com' } });
  const mona = await prisma.user.findUnique({ where: { email: 'mona.ibrahim@example.com' } });
  const omar = await prisma.user.findUnique({ where: { email: 'omar.saeed@example.com' } });
  const techStore = await prisma.user.findUnique({ where: { email: 'contact@techstore.eg' } });
  const furnitureHub = await prisma.user.findUnique({ where: { email: 'info@furniturehub.eg' } });
  const autoParts = await prisma.user.findUnique({ where: { email: 'sales@autoparts.eg' } });

  if (!ahmed || !fatma || !khaled || !mona || !omar || !techStore || !furnitureHub || !autoParts) {
    throw new Error('Users not found. Please run seed-users.ts first');
  }

  // Get categories
  const electronics = await prisma.category.findFirst({ where: { slug: 'electronics' } });
  const mobilePhones = await prisma.category.findFirst({ where: { slug: 'mobile-phones' } });
  const computers = await prisma.category.findFirst({ where: { slug: 'computers' } });
  const cameras = await prisma.category.findFirst({ where: { slug: 'cameras' } });
  const furniture = await prisma.category.findFirst({ where: { slug: 'furniture' } });
  const bedroom = await prisma.category.findFirst({ where: { slug: 'bedroom' } });
  const livingRoom = await prisma.category.findFirst({ where: { slug: 'living-room' } });
  const vehicles = await prisma.category.findFirst({ where: { slug: 'vehicles' } });
  const cars = await prisma.category.findFirst({ where: { slug: 'cars' } });
  const homeAppliances = await prisma.category.findFirst({ where: { slug: 'home-appliances' } });
  const fashion = await prisma.category.findFirst({ where: { slug: 'fashion' } });

  if (!electronics || !furniture || !vehicles) {
    throw new Error('Categories not found. Please run seed-categories.ts first');
  }

  const items = [
    // Ahmed's items (Electronics)
    {
      sellerId: ahmed.id,
      categoryId: computers?.id || electronics.id,
      titleAr: 'لابتوب ديل XPS 13',
      titleEn: 'Dell XPS 13 Laptop',
      descriptionAr: 'لابتوب ديل XPS 13 في حالة ممتازة، معالج Intel Core i7 الجيل العاشر، 16GB RAM، 512GB SSD، شاشة 13.3 بوصة Full HD. استخدام شخصي خفيف لمدة 6 أشهر فقط.',
      descriptionEn: 'Dell XPS 13 in excellent condition, 10th Gen Intel Core i7, 16GB RAM, 512GB SSD, 13.3" Full HD display. Light personal use for only 6 months.',
      condition: ItemCondition.LIKE_NEW,
      quantity: 1,
      location: 'Nasr City',
      governorate: 'Cairo',
      images: [],
    },
    {
      sellerId: ahmed.id,
      categoryId: cameras?.id || electronics.id,
      titleAr: 'كاميرا كانون EOS 80D',
      titleEn: 'Canon EOS 80D Camera',
      descriptionAr: 'كاميرا كانون EOS 80D مع عدسة 18-135mm، في حالة جيدة جداً. تم استخدامها في التصوير الفوتوغرافي للهواة. تشمل حقيبة الكاميرا وبطاريتين وشاحن.',
      descriptionEn: 'Canon EOS 80D with 18-135mm lens, in very good condition. Used for amateur photography. Includes camera bag, two batteries, and charger.',
      condition: ItemCondition.GOOD,
      quantity: 1,
      location: 'Nasr City',
      governorate: 'Cairo',
      images: [],
    },
    // Fatma's items (Furniture & Electronics)
    {
      sellerId: fatma.id,
      categoryId: livingRoom?.id || furniture.id,
      titleAr: 'طقم أريكة جلد 3 قطع',
      titleEn: '3-Piece Leather Sofa Set',
      descriptionAr: 'طقم أريكة جلد طبيعي مكون من 3 قطع (أريكة 3 مقاعد + أريكة مقعدين + كرسي). لون بني داكن، حالة ممتازة، استخدام منزلي خفيف. السعر شامل التوصيل داخل الإسكندرية.',
      descriptionEn: 'Genuine leather sofa set of 3 pieces (3-seater + 2-seater + armchair). Dark brown color, excellent condition, light home use. Price includes delivery within Alexandria.',
      condition: ItemCondition.LIKE_NEW,
      quantity: 1,
      location: 'Smouha',
      governorate: 'Alexandria',
      images: [],
    },
    {
      sellerId: fatma.id,
      categoryId: mobilePhones?.id || electronics.id,
      titleAr: 'آيفون 12 برو 128 جيجا',
      titleEn: 'iPhone 12 Pro 128GB',
      descriptionAr: 'آيفون 12 Pro بسعة 128GB، لون أزرق باسيفيك، حالة ممتازة. البطارية 92%. معه العلبة الأصلية والشاحن. بدون خدوش.',
      descriptionEn: 'iPhone 12 Pro 128GB, Pacific Blue, excellent condition. Battery health 92%. Comes with original box and charger. No scratches.',
      condition: ItemCondition.LIKE_NEW,
      quantity: 1,
      location: 'Smouha',
      governorate: 'Alexandria',
      images: [],
    },
    // Khaled's items (Vehicles & Building Materials)
    {
      sellerId: khaled.id,
      categoryId: cars?.id || vehicles.id,
      titleAr: 'تويوتا كورولا 2018',
      titleEn: 'Toyota Corolla 2018',
      descriptionAr: 'تويوتا كورولا 2018، موديل 1.6L، أوتوماتيك، لون فضي. عداد 85,000 كم. حالة ممتازة، صيانة دورية في الوكالة. فحص كامل متاح.',
      descriptionEn: 'Toyota Corolla 2018, 1.6L model, automatic, silver color. 85,000 km mileage. Excellent condition, regular dealer maintenance. Full inspection available.',
      condition: ItemCondition.LIKE_NEW,
      quantity: 1,
      location: 'Dokki',
      governorate: 'Giza',
      images: [],
    },
    // Mona's items (Fashion & Home Appliances)
    {
      sellerId: mona.id,
      categoryId: homeAppliances?.id || electronics.id,
      titleAr: 'ثلاجة سامسونج 18 قدم',
      titleEn: 'Samsung 18 cu ft Refrigerator',
      descriptionAr: 'ثلاجة سامسونج نوفروست 18 قدم، لون فضي، حالة جيدة جداً. استخدام 3 سنوات، تعمل بكفاءة ممتازة. السبب في البيع: الانتقال لشقة مفروشة.',
      descriptionEn: 'Samsung No-Frost 18 cu ft refrigerator, silver color, very good condition. 3 years use, works excellently. Selling reason: moving to furnished apartment.',
      condition: ItemCondition.GOOD,
      quantity: 1,
      location: 'Heliopolis',
      governorate: 'Cairo',
      images: [],
    },
    {
      sellerId: mona.id,
      categoryId: fashion?.id || electronics.id,
      titleAr: 'حقيبة يد لويس فيتون أصلية',
      titleEn: 'Authentic Louis Vuitton Handbag',
      descriptionAr: 'حقيبة يد لويس فيتون أصلية، موديل Neverfull MM، كانفاس مونوجرام. حالة ممتازة، استخدام خفيف. معها الفاتورة الأصلية وكارت الضمان.',
      descriptionEn: 'Authentic Louis Vuitton handbag, Neverfull MM model, monogram canvas. Excellent condition, light use. Comes with original receipt and authenticity card.',
      condition: ItemCondition.LIKE_NEW,
      quantity: 1,
      location: 'Heliopolis',
      governorate: 'Cairo',
      images: [],
    },
    // Omar's items (Electronics & Furniture)
    {
      sellerId: omar.id,
      categoryId: computers?.id || electronics.id,
      titleAr: 'ماك بوك برو 16 إنش 2021',
      titleEn: 'MacBook Pro 16" 2021',
      descriptionAr: 'ماك بوك برو 16 إنش 2021، معالج M1 Pro، 32GB RAM، 1TB SSD، حالة ممتازة. استخدام احترافي للبرمجة والتصميم. معه الشاحن الأصلي والعلبة.',
      descriptionEn: 'MacBook Pro 16" 2021, M1 Pro chip, 32GB RAM, 1TB SSD, excellent condition. Professional use for coding and design. Includes original charger and box.',
      condition: ItemCondition.LIKE_NEW,
      quantity: 1,
      location: 'Maadi',
      governorate: 'Cairo',
      images: [],
    },
    {
      sellerId: omar.id,
      categoryId: bedroom?.id || furniture.id,
      titleAr: 'سرير خشب زان مع مرتبة',
      titleEn: 'Beech Wood Bed with Mattress',
      descriptionAr: 'سرير خشب زان طبيعي، مقاس 180×200 سم (كينج سايز)، مع مرتبة طبية يانسن. حالة جيدة جداً، نظيف ومريح. السعر شامل قاعدة السرير.',
      descriptionEn: 'Natural beech wood bed, 180x200 cm (King size), with Yanssen medical mattress. Very good condition, clean and comfortable. Price includes bed base.',
      condition: ItemCondition.GOOD,
      quantity: 1,
      location: 'Maadi',
      governorate: 'Cairo',
      images: [],
    },
    // Tech Store items (Business)
    {
      sellerId: techStore.id,
      categoryId: mobilePhones?.id || electronics.id,
      titleAr: 'سامسونج جالاكسي S23 جديد',
      titleEn: 'Samsung Galaxy S23 New',
      descriptionAr: 'سامسونج جالاكسي S23 جديد في الكرتونة، ضمان الوكيل عامين. سعة 256GB، جميع الألوان متوفرة. شحن سريع 25 واط مجاناً.',
      descriptionEn: 'Brand new Samsung Galaxy S23 in box, 2-year official warranty. 256GB capacity, all colors available. Free 25W fast charger included.',
      condition: ItemCondition.NEW,
      quantity: 10,
      location: 'Downtown',
      governorate: 'Cairo',
      images: [],
    },
    {
      sellerId: techStore.id,
      categoryId: computers?.id || electronics.id,
      titleAr: 'لابتوب HP Pavilion جديد',
      titleEn: 'HP Pavilion Laptop New',
      descriptionAr: 'لابتوب HP Pavilion جديد، معالج Intel Core i5 الجيل 12، 8GB RAM، 512GB SSD، شاشة 15.6 بوصة. ضمان سنة من HP.',
      descriptionEn: 'New HP Pavilion laptop, 12th Gen Intel Core i5, 8GB RAM, 512GB SSD, 15.6" display. 1-year HP warranty.',
      condition: ItemCondition.NEW,
      quantity: 5,
      location: 'Downtown',
      governorate: 'Cairo',
      images: [],
    },
    // Furniture Hub items (Business)
    {
      sellerId: furnitureHub.id,
      categoryId: livingRoom?.id || furniture.id,
      titleAr: 'طاولة طعام خشب 6 كراسي',
      titleEn: 'Wooden Dining Table 6 Chairs',
      descriptionAr: 'طاولة طعام خشب MDF مغطى بالقشرة، مع 6 كراسي مبطنة. تصميم عصري، لون بني فاتح. مقاسات الطاولة: 180×90 سم. التوصيل والتركيب مجاناً.',
      descriptionEn: 'MDF wood dining table with veneer finish, with 6 upholstered chairs. Modern design, light brown color. Table dimensions: 180x90 cm. Free delivery and assembly.',
      condition: ItemCondition.NEW,
      quantity: 3,
      location: '6th October City',
      governorate: 'Giza',
      images: [],
    },
    // Auto Parts items (Business)
    {
      sellerId: autoParts.id,
      categoryId: vehicles?.id || electronics.id,
      titleAr: 'إطارات ميشلان 4 قطع',
      titleEn: 'Michelin Tires 4 Pieces',
      descriptionAr: 'إطارات ميشلان Primacy 4، مقاس 205/55 R16. جودة ممتازة، مناسبة لجميع السيارات الصغيرة والمتوسطة. ضمان 3 سنوات من الشركة.',
      descriptionEn: 'Michelin Primacy 4 tires, size 205/55 R16. Excellent quality, suitable for all small and medium cars. 3-year company warranty.',
      condition: ItemCondition.NEW,
      quantity: 8,
      location: 'El-Manshia',
      governorate: 'Alexandria',
      images: [],
    },
  ];

  let createdCount = 0;
  for (const itemData of items) {
    const item = await prisma.item.create({
      data: itemData,
    });
    createdCount++;
    console.log(`✅ Created item: ${item.titleEn} by ${item.sellerId}`);
  }

  console.log(`\n✨ ${createdCount} items seeded successfully!\n`);
}

seedItems()
  .catch((e) => {
    console.error('❌ Error seeding items:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
