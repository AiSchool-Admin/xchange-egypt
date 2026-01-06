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
  // 0. Mobiles (Main Category with Brands & Models)
  {
    nameEn: 'Mobiles',
    nameAr: 'الموبايلات',
    slug: 'mobiles',
    icon: '📱',
    description: 'هواتف ذكية جديدة ومستعملة',
    children: [
      {
        nameEn: 'Apple',
        nameAr: 'آبل',
        slug: 'apple-mobiles',
        children: [
          { nameEn: 'iPhone 16 Pro Max', nameAr: 'آيفون 16 برو ماكس', slug: 'iphone-16-pro-max' },
          { nameEn: 'iPhone 16 Pro', nameAr: 'آيفون 16 برو', slug: 'iphone-16-pro' },
          { nameEn: 'iPhone 16 Plus', nameAr: 'آيفون 16 بلس', slug: 'iphone-16-plus' },
          { nameEn: 'iPhone 16', nameAr: 'آيفون 16', slug: 'iphone-16' },
          { nameEn: 'iPhone 15 Pro Max', nameAr: 'آيفون 15 برو ماكس', slug: 'iphone-15-pro-max' },
          { nameEn: 'iPhone 15 Pro', nameAr: 'آيفون 15 برو', slug: 'iphone-15-pro' },
          { nameEn: 'iPhone 15 Plus', nameAr: 'آيفون 15 بلس', slug: 'iphone-15-plus' },
          { nameEn: 'iPhone 15', nameAr: 'آيفون 15', slug: 'iphone-15' },
          { nameEn: 'iPhone 14 Pro Max', nameAr: 'آيفون 14 برو ماكس', slug: 'iphone-14-pro-max' },
          { nameEn: 'iPhone 14 Pro', nameAr: 'آيفون 14 برو', slug: 'iphone-14-pro' },
          { nameEn: 'iPhone 14 Plus', nameAr: 'آيفون 14 بلس', slug: 'iphone-14-plus' },
          { nameEn: 'iPhone 14', nameAr: 'آيفون 14', slug: 'iphone-14' },
          { nameEn: 'iPhone 13 Pro Max', nameAr: 'آيفون 13 برو ماكس', slug: 'iphone-13-pro-max' },
          { nameEn: 'iPhone 13 Pro', nameAr: 'آيفون 13 برو', slug: 'iphone-13-pro' },
          { nameEn: 'iPhone 13', nameAr: 'آيفون 13', slug: 'iphone-13' },
          { nameEn: 'iPhone 12 Pro Max', nameAr: 'آيفون 12 برو ماكس', slug: 'iphone-12-pro-max' },
          { nameEn: 'iPhone 12 Pro', nameAr: 'آيفون 12 برو', slug: 'iphone-12-pro' },
          { nameEn: 'iPhone 12', nameAr: 'آيفون 12', slug: 'iphone-12' },
          { nameEn: 'iPhone 11 Pro Max', nameAr: 'آيفون 11 برو ماكس', slug: 'iphone-11-pro-max' },
          { nameEn: 'iPhone 11 Pro', nameAr: 'آيفون 11 برو', slug: 'iphone-11-pro' },
          { nameEn: 'iPhone 11', nameAr: 'آيفون 11', slug: 'iphone-11' },
          { nameEn: 'iPhone SE', nameAr: 'آيفون SE', slug: 'iphone-se' },
          { nameEn: 'Other iPhone', nameAr: 'آيفون آخر', slug: 'other-iphone' },
        ],
      },
      {
        nameEn: 'Samsung',
        nameAr: 'سامسونج',
        slug: 'samsung-mobiles',
        children: [
          { nameEn: 'Galaxy S24 Ultra', nameAr: 'جالاكسي S24 ألترا', slug: 'galaxy-s24-ultra' },
          { nameEn: 'Galaxy S24+', nameAr: 'جالاكسي S24+', slug: 'galaxy-s24-plus' },
          { nameEn: 'Galaxy S24', nameAr: 'جالاكسي S24', slug: 'galaxy-s24' },
          { nameEn: 'Galaxy S23 Ultra', nameAr: 'جالاكسي S23 ألترا', slug: 'galaxy-s23-ultra' },
          { nameEn: 'Galaxy S23+', nameAr: 'جالاكسي S23+', slug: 'galaxy-s23-plus' },
          { nameEn: 'Galaxy S23', nameAr: 'جالاكسي S23', slug: 'galaxy-s23' },
          { nameEn: 'Galaxy S22 Ultra', nameAr: 'جالاكسي S22 ألترا', slug: 'galaxy-s22-ultra' },
          { nameEn: 'Galaxy S22+', nameAr: 'جالاكسي S22+', slug: 'galaxy-s22-plus' },
          { nameEn: 'Galaxy S22', nameAr: 'جالاكسي S22', slug: 'galaxy-s22' },
          { nameEn: 'Galaxy Z Fold 5', nameAr: 'جالاكسي Z فولد 5', slug: 'galaxy-z-fold-5' },
          { nameEn: 'Galaxy Z Flip 5', nameAr: 'جالاكسي Z فليب 5', slug: 'galaxy-z-flip-5' },
          { nameEn: 'Galaxy Z Fold 4', nameAr: 'جالاكسي Z فولد 4', slug: 'galaxy-z-fold-4' },
          { nameEn: 'Galaxy Z Flip 4', nameAr: 'جالاكسي Z فليب 4', slug: 'galaxy-z-flip-4' },
          { nameEn: 'Galaxy A54', nameAr: 'جالاكسي A54', slug: 'galaxy-a54' },
          { nameEn: 'Galaxy A34', nameAr: 'جالاكسي A34', slug: 'galaxy-a34' },
          { nameEn: 'Galaxy A24', nameAr: 'جالاكسي A24', slug: 'galaxy-a24' },
          { nameEn: 'Galaxy A14', nameAr: 'جالاكسي A14', slug: 'galaxy-a14' },
          { nameEn: 'Galaxy M Series', nameAr: 'سلسلة جالاكسي M', slug: 'galaxy-m-series' },
          { nameEn: 'Other Samsung', nameAr: 'سامسونج آخر', slug: 'other-samsung' },
        ],
      },
      {
        nameEn: 'Xiaomi',
        nameAr: 'شاومي',
        slug: 'xiaomi-mobiles',
        children: [
          { nameEn: 'Xiaomi 14 Ultra', nameAr: 'شاومي 14 ألترا', slug: 'xiaomi-14-ultra' },
          { nameEn: 'Xiaomi 14 Pro', nameAr: 'شاومي 14 برو', slug: 'xiaomi-14-pro' },
          { nameEn: 'Xiaomi 14', nameAr: 'شاومي 14', slug: 'xiaomi-14' },
          { nameEn: 'Xiaomi 13 Ultra', nameAr: 'شاومي 13 ألترا', slug: 'xiaomi-13-ultra' },
          { nameEn: 'Xiaomi 13 Pro', nameAr: 'شاومي 13 برو', slug: 'xiaomi-13-pro' },
          { nameEn: 'Xiaomi 13', nameAr: 'شاومي 13', slug: 'xiaomi-13' },
          { nameEn: 'Redmi Note 13 Pro+', nameAr: 'ريدمي نوت 13 برو+', slug: 'redmi-note-13-pro-plus' },
          { nameEn: 'Redmi Note 13 Pro', nameAr: 'ريدمي نوت 13 برو', slug: 'redmi-note-13-pro' },
          { nameEn: 'Redmi Note 13', nameAr: 'ريدمي نوت 13', slug: 'redmi-note-13' },
          { nameEn: 'Redmi Note 12 Pro+', nameAr: 'ريدمي نوت 12 برو+', slug: 'redmi-note-12-pro-plus' },
          { nameEn: 'Redmi Note 12 Pro', nameAr: 'ريدمي نوت 12 برو', slug: 'redmi-note-12-pro' },
          { nameEn: 'Redmi Note 12', nameAr: 'ريدمي نوت 12', slug: 'redmi-note-12' },
          { nameEn: 'Poco X6 Pro', nameAr: 'بوكو X6 برو', slug: 'poco-x6-pro' },
          { nameEn: 'Poco X6', nameAr: 'بوكو X6', slug: 'poco-x6' },
          { nameEn: 'Poco F5 Pro', nameAr: 'بوكو F5 برو', slug: 'poco-f5-pro' },
          { nameEn: 'Poco F5', nameAr: 'بوكو F5', slug: 'poco-f5' },
          { nameEn: 'Other Xiaomi', nameAr: 'شاومي آخر', slug: 'other-xiaomi' },
        ],
      },
      {
        nameEn: 'OPPO',
        nameAr: 'أوبو',
        slug: 'oppo-mobiles',
        children: [
          { nameEn: 'OPPO Find X7 Ultra', nameAr: 'أوبو فايند X7 ألترا', slug: 'oppo-find-x7-ultra' },
          { nameEn: 'OPPO Find X6 Pro', nameAr: 'أوبو فايند X6 برو', slug: 'oppo-find-x6-pro' },
          { nameEn: 'OPPO Find X6', nameAr: 'أوبو فايند X6', slug: 'oppo-find-x6' },
          { nameEn: 'OPPO Reno 11 Pro', nameAr: 'أوبو رينو 11 برو', slug: 'oppo-reno-11-pro' },
          { nameEn: 'OPPO Reno 11', nameAr: 'أوبو رينو 11', slug: 'oppo-reno-11' },
          { nameEn: 'OPPO Reno 10 Pro+', nameAr: 'أوبو رينو 10 برو+', slug: 'oppo-reno-10-pro-plus' },
          { nameEn: 'OPPO Reno 10 Pro', nameAr: 'أوبو رينو 10 برو', slug: 'oppo-reno-10-pro' },
          { nameEn: 'OPPO Reno 10', nameAr: 'أوبو رينو 10', slug: 'oppo-reno-10' },
          { nameEn: 'OPPO A Series', nameAr: 'سلسلة أوبو A', slug: 'oppo-a-series' },
          { nameEn: 'Other OPPO', nameAr: 'أوبو آخر', slug: 'other-oppo' },
        ],
      },
      {
        nameEn: 'Vivo',
        nameAr: 'فيفو',
        slug: 'vivo-mobiles',
        children: [
          { nameEn: 'Vivo X100 Pro', nameAr: 'فيفو X100 برو', slug: 'vivo-x100-pro' },
          { nameEn: 'Vivo X100', nameAr: 'فيفو X100', slug: 'vivo-x100' },
          { nameEn: 'Vivo X90 Pro', nameAr: 'فيفو X90 برو', slug: 'vivo-x90-pro' },
          { nameEn: 'Vivo X90', nameAr: 'فيفو X90', slug: 'vivo-x90' },
          { nameEn: 'Vivo V29 Pro', nameAr: 'فيفو V29 برو', slug: 'vivo-v29-pro' },
          { nameEn: 'Vivo V29', nameAr: 'فيفو V29', slug: 'vivo-v29' },
          { nameEn: 'Vivo Y Series', nameAr: 'سلسلة فيفو Y', slug: 'vivo-y-series' },
          { nameEn: 'Other Vivo', nameAr: 'فيفو آخر', slug: 'other-vivo' },
        ],
      },
      {
        nameEn: 'Huawei',
        nameAr: 'هواوي',
        slug: 'huawei-mobiles',
        children: [
          { nameEn: 'Huawei Mate 60 Pro', nameAr: 'هواوي ميت 60 برو', slug: 'huawei-mate-60-pro' },
          { nameEn: 'Huawei Mate 60', nameAr: 'هواوي ميت 60', slug: 'huawei-mate-60' },
          { nameEn: 'Huawei P60 Pro', nameAr: 'هواوي P60 برو', slug: 'huawei-p60-pro' },
          { nameEn: 'Huawei P60', nameAr: 'هواوي P60', slug: 'huawei-p60' },
          { nameEn: 'Huawei Nova 12', nameAr: 'هواوي نوفا 12', slug: 'huawei-nova-12' },
          { nameEn: 'Huawei Nova 11', nameAr: 'هواوي نوفا 11', slug: 'huawei-nova-11' },
          { nameEn: 'Huawei Y Series', nameAr: 'سلسلة هواوي Y', slug: 'huawei-y-series' },
          { nameEn: 'Other Huawei', nameAr: 'هواوي آخر', slug: 'other-huawei' },
        ],
      },
      {
        nameEn: 'Honor',
        nameAr: 'هونر',
        slug: 'honor-mobiles',
        children: [
          { nameEn: 'Honor Magic 6 Pro', nameAr: 'هونر ماجيك 6 برو', slug: 'honor-magic-6-pro' },
          { nameEn: 'Honor Magic 6', nameAr: 'هونر ماجيك 6', slug: 'honor-magic-6' },
          { nameEn: 'Honor 90 Pro', nameAr: 'هونر 90 برو', slug: 'honor-90-pro' },
          { nameEn: 'Honor 90', nameAr: 'هونر 90', slug: 'honor-90' },
          { nameEn: 'Honor X Series', nameAr: 'سلسلة هونر X', slug: 'honor-x-series' },
          { nameEn: 'Other Honor', nameAr: 'هونر آخر', slug: 'other-honor' },
        ],
      },
      {
        nameEn: 'Realme',
        nameAr: 'ريلمي',
        slug: 'realme-mobiles',
        children: [
          { nameEn: 'Realme GT 5 Pro', nameAr: 'ريلمي GT 5 برو', slug: 'realme-gt-5-pro' },
          { nameEn: 'Realme GT 5', nameAr: 'ريلمي GT 5', slug: 'realme-gt-5' },
          { nameEn: 'Realme 12 Pro+', nameAr: 'ريلمي 12 برو+', slug: 'realme-12-pro-plus' },
          { nameEn: 'Realme 12 Pro', nameAr: 'ريلمي 12 برو', slug: 'realme-12-pro' },
          { nameEn: 'Realme 11 Pro+', nameAr: 'ريلمي 11 برو+', slug: 'realme-11-pro-plus' },
          { nameEn: 'Realme 11 Pro', nameAr: 'ريلمي 11 برو', slug: 'realme-11-pro' },
          { nameEn: 'Realme C Series', nameAr: 'سلسلة ريلمي C', slug: 'realme-c-series' },
          { nameEn: 'Other Realme', nameAr: 'ريلمي آخر', slug: 'other-realme' },
        ],
      },
      {
        nameEn: 'Infinix',
        nameAr: 'إنفينكس',
        slug: 'infinix-mobiles',
        children: [
          { nameEn: 'Infinix Zero 30', nameAr: 'إنفينكس زيرو 30', slug: 'infinix-zero-30' },
          { nameEn: 'Infinix Note 30 Pro', nameAr: 'إنفينكس نوت 30 برو', slug: 'infinix-note-30-pro' },
          { nameEn: 'Infinix Note 30', nameAr: 'إنفينكس نوت 30', slug: 'infinix-note-30' },
          { nameEn: 'Infinix Hot 40 Pro', nameAr: 'إنفينكس هوت 40 برو', slug: 'infinix-hot-40-pro' },
          { nameEn: 'Infinix Hot 40', nameAr: 'إنفينكس هوت 40', slug: 'infinix-hot-40' },
          { nameEn: 'Infinix Smart Series', nameAr: 'سلسلة إنفينكس سمارت', slug: 'infinix-smart-series' },
          { nameEn: 'Other Infinix', nameAr: 'إنفينكس آخر', slug: 'other-infinix' },
        ],
      },
      {
        nameEn: 'Tecno',
        nameAr: 'تكنو',
        slug: 'tecno-mobiles',
        children: [
          { nameEn: 'Tecno Phantom V Fold', nameAr: 'تكنو فانتوم V فولد', slug: 'tecno-phantom-v-fold' },
          { nameEn: 'Tecno Phantom X2 Pro', nameAr: 'تكنو فانتوم X2 برو', slug: 'tecno-phantom-x2-pro' },
          { nameEn: 'Tecno Camon 20 Pro', nameAr: 'تكنو كامون 20 برو', slug: 'tecno-camon-20-pro' },
          { nameEn: 'Tecno Camon 20', nameAr: 'تكنو كامون 20', slug: 'tecno-camon-20' },
          { nameEn: 'Tecno Spark 20 Pro', nameAr: 'تكنو سبارك 20 برو', slug: 'tecno-spark-20-pro' },
          { nameEn: 'Tecno Spark Series', nameAr: 'سلسلة تكنو سبارك', slug: 'tecno-spark-series' },
          { nameEn: 'Tecno Pop Series', nameAr: 'سلسلة تكنو بوب', slug: 'tecno-pop-series' },
          { nameEn: 'Other Tecno', nameAr: 'تكنو آخر', slug: 'other-tecno' },
        ],
      },
      {
        nameEn: 'OnePlus',
        nameAr: 'ون بلس',
        slug: 'oneplus-mobiles',
        children: [
          { nameEn: 'OnePlus 12', nameAr: 'ون بلس 12', slug: 'oneplus-12' },
          { nameEn: 'OnePlus 11', nameAr: 'ون بلس 11', slug: 'oneplus-11' },
          { nameEn: 'OnePlus Open', nameAr: 'ون بلس أوبن', slug: 'oneplus-open' },
          { nameEn: 'OnePlus Nord CE', nameAr: 'ون بلس نورد CE', slug: 'oneplus-nord-ce' },
          { nameEn: 'OnePlus Nord Series', nameAr: 'سلسلة ون بلس نورد', slug: 'oneplus-nord-series' },
          { nameEn: 'Other OnePlus', nameAr: 'ون بلس آخر', slug: 'other-oneplus' },
        ],
      },
      {
        nameEn: 'Google',
        nameAr: 'جوجل',
        slug: 'google-mobiles',
        children: [
          { nameEn: 'Pixel 8 Pro', nameAr: 'بيكسل 8 برو', slug: 'pixel-8-pro' },
          { nameEn: 'Pixel 8', nameAr: 'بيكسل 8', slug: 'pixel-8' },
          { nameEn: 'Pixel 8a', nameAr: 'بيكسل 8a', slug: 'pixel-8a' },
          { nameEn: 'Pixel 7 Pro', nameAr: 'بيكسل 7 برو', slug: 'pixel-7-pro' },
          { nameEn: 'Pixel 7', nameAr: 'بيكسل 7', slug: 'pixel-7' },
          { nameEn: 'Other Pixel', nameAr: 'بيكسل آخر', slug: 'other-pixel' },
        ],
      },
      {
        nameEn: 'Nokia',
        nameAr: 'نوكيا',
        slug: 'nokia-mobiles',
        children: [
          { nameEn: 'Nokia G Series', nameAr: 'سلسلة نوكيا G', slug: 'nokia-g-series' },
          { nameEn: 'Nokia X Series', nameAr: 'سلسلة نوكيا X', slug: 'nokia-x-series' },
          { nameEn: 'Nokia C Series', nameAr: 'سلسلة نوكيا C', slug: 'nokia-c-series' },
          { nameEn: 'Other Nokia', nameAr: 'نوكيا آخر', slug: 'other-nokia' },
        ],
      },
      {
        nameEn: 'Motorola',
        nameAr: 'موتورولا',
        slug: 'motorola-mobiles',
        children: [
          { nameEn: 'Motorola Edge', nameAr: 'موتورولا إيدج', slug: 'motorola-edge' },
          { nameEn: 'Motorola Razr', nameAr: 'موتورولا ريزر', slug: 'motorola-razr' },
          { nameEn: 'Motorola G Series', nameAr: 'سلسلة موتورولا G', slug: 'motorola-g-series' },
          { nameEn: 'Other Motorola', nameAr: 'موتورولا آخر', slug: 'other-motorola' },
        ],
      },
      {
        nameEn: 'Other Brands',
        nameAr: 'ماركات أخرى',
        slug: 'other-mobile-brands',
        children: [
          { nameEn: 'Asus', nameAr: 'أسوس', slug: 'asus-mobiles' },
          { nameEn: 'Sony', nameAr: 'سوني', slug: 'sony-mobiles' },
          { nameEn: 'LG', nameAr: 'إل جي', slug: 'lg-mobiles' },
          { nameEn: 'ZTE', nameAr: 'زد تي إي', slug: 'zte-mobiles' },
          { nameEn: 'Other', nameAr: 'أخرى', slug: 'other-mobiles' },
        ],
      },
    ],
  },

  // 1. Electronics
  {
    nameEn: 'Electronics',
    nameAr: 'الإلكترونيات',
    slug: 'electronics',
    icon: '💻',
    children: [
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

  // 9. Luxury Goods
  {
    nameEn: 'Luxury Goods',
    nameAr: 'سلع فاخرة',
    slug: 'luxury',
    icon: '👑',
    children: [
      {
        nameEn: 'Luxury Watches',
        nameAr: 'ساعات فاخرة',
        slug: 'luxury-watches',
        children: [
          { nameEn: 'Rolex', nameAr: 'رولكس', slug: 'rolex' },
          { nameEn: 'Omega', nameAr: 'أوميغا', slug: 'omega' },
          { nameEn: 'Cartier', nameAr: 'كارتييه', slug: 'cartier-watches' },
          { nameEn: 'Patek Philippe', nameAr: 'باتيك فيليب', slug: 'patek-philippe' },
          { nameEn: 'Other Brands', nameAr: 'ماركات أخرى', slug: 'other-luxury-watches' },
        ],
      },
      {
        nameEn: 'Jewelry',
        nameAr: 'مجوهرات',
        slug: 'jewelry',
        children: [
          { nameEn: 'Rings', nameAr: 'خواتم', slug: 'rings' },
          { nameEn: 'Necklaces', nameAr: 'قلادات', slug: 'necklaces' },
          { nameEn: 'Bracelets', nameAr: 'أساور', slug: 'bracelets' },
          { nameEn: 'Earrings', nameAr: 'أقراط', slug: 'earrings' },
          { nameEn: 'Gold', nameAr: 'ذهب', slug: 'gold' },
          { nameEn: 'Diamonds', nameAr: 'ألماس', slug: 'diamonds' },
        ],
      },
      {
        nameEn: 'Luxury Bags',
        nameAr: 'حقائب فاخرة',
        slug: 'luxury-bags',
        children: [
          { nameEn: 'Louis Vuitton', nameAr: 'لويس فيتون', slug: 'louis-vuitton' },
          { nameEn: 'Gucci', nameAr: 'غوتشي', slug: 'gucci' },
          { nameEn: 'Chanel', nameAr: 'شانيل', slug: 'chanel' },
          { nameEn: 'Hermès', nameAr: 'هيرميس', slug: 'hermes' },
          { nameEn: 'Other Brands', nameAr: 'ماركات أخرى', slug: 'other-luxury-bags' },
        ],
      },
      {
        nameEn: 'Perfumes',
        nameAr: 'عطور أصلية',
        slug: 'perfumes',
        children: [
          { nameEn: 'Men\'s Perfumes', nameAr: 'عطور رجالية', slug: 'mens-perfumes' },
          { nameEn: 'Women\'s Perfumes', nameAr: 'عطور نسائية', slug: 'womens-perfumes' },
          { nameEn: 'Unisex', nameAr: 'عطور مشتركة', slug: 'unisex-perfumes' },
          { nameEn: 'Arabian Oud', nameAr: 'عود عربي', slug: 'arabian-oud' },
        ],
      },
    ],
  },

  // 10. Art & Collectibles
  {
    nameEn: 'Art & Collectibles',
    nameAr: 'فنون ومقتنيات',
    slug: 'art-collectibles',
    icon: '🖼️',
    children: [
      {
        nameEn: 'Paintings',
        nameAr: 'لوحات فنية',
        slug: 'paintings',
        children: [
          { nameEn: 'Oil Paintings', nameAr: 'لوحات زيتية', slug: 'oil-paintings' },
          { nameEn: 'Watercolor', nameAr: 'ألوان مائية', slug: 'watercolor' },
          { nameEn: 'Modern Art', nameAr: 'فن حديث', slug: 'modern-art' },
          { nameEn: 'Egyptian Art', nameAr: 'فن مصري', slug: 'egyptian-art' },
        ],
      },
      {
        nameEn: 'Antiques',
        nameAr: 'تحف أثرية',
        slug: 'antiques',
        children: [
          { nameEn: 'Furniture', nameAr: 'أثاث أثري', slug: 'antique-furniture' },
          { nameEn: 'Pottery', nameAr: 'فخار', slug: 'pottery' },
          { nameEn: 'Clocks', nameAr: 'ساعات أثرية', slug: 'antique-clocks' },
          { nameEn: 'Decorative Items', nameAr: 'ديكورات أثرية', slug: 'decorative-antiques' },
        ],
      },
      {
        nameEn: 'Coins & Currency',
        nameAr: 'عملات ومسكوكات',
        slug: 'coins-currency',
        children: [
          { nameEn: 'Ancient Coins', nameAr: 'عملات قديمة', slug: 'ancient-coins' },
          { nameEn: 'Gold Coins', nameAr: 'عملات ذهبية', slug: 'gold-coins' },
          { nameEn: 'Paper Money', nameAr: 'عملات ورقية', slug: 'paper-money' },
          { nameEn: 'Foreign Currency', nameAr: 'عملات أجنبية', slug: 'foreign-currency' },
        ],
      },
    ],
  },

  // 11. Real Estate (Luxury)
  {
    nameEn: 'Real Estate',
    nameAr: 'عقارات',
    slug: 'real-estate',
    icon: '🏰',
    children: [
      {
        nameEn: 'Luxury Apartments',
        nameAr: 'شقق فاخرة',
        slug: 'luxury-apartments',
        children: [
          { nameEn: 'Penthouse', nameAr: 'بنتهاوس', slug: 'penthouse' },
          { nameEn: 'Duplex', nameAr: 'دوبلكس', slug: 'duplex' },
          { nameEn: 'Smart Apartments', nameAr: 'شقق ذكية', slug: 'smart-apartments' },
        ],
      },
      {
        nameEn: 'Villas',
        nameAr: 'فيلات',
        slug: 'villas',
        children: [
          { nameEn: 'Standalone Villas', nameAr: 'فيلات مستقلة', slug: 'standalone-villas' },
          { nameEn: 'Twin Houses', nameAr: 'توين هاوس', slug: 'twin-houses' },
          { nameEn: 'Town Houses', nameAr: 'تاون هاوس', slug: 'town-houses' },
          { nameEn: 'Palace', nameAr: 'قصور', slug: 'palace' },
        ],
      },
      {
        nameEn: 'Chalets & Resorts',
        nameAr: 'شاليهات ومنتجعات',
        slug: 'chalets-resorts',
        children: [
          { nameEn: 'North Coast', nameAr: 'الساحل الشمالي', slug: 'north-coast' },
          { nameEn: 'Ain Sokhna', nameAr: 'العين السخنة', slug: 'ain-sokhna' },
          { nameEn: 'Red Sea', nameAr: 'البحر الأحمر', slug: 'red-sea' },
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
