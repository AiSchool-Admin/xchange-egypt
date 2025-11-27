/**
 * Egyptian Geographic Data
 *
 * Complete list of Egypt's 27 governorates with major cities
 * Includes accurate latitude/longitude coordinates for distance calculations
 */

export interface EgyptCity {
  nameAr: string;
  nameEn: string;
  lat: number;
  lon: number;
}

export interface EgyptGovernorate {
  id: string;
  nameAr: string;
  nameEn: string;
  latitude: number;
  longitude: number;
  region: 'Greater Cairo' | 'Delta' | 'Canal' | 'Sinai' | 'Coast' | 'Upper Egypt';
  cities: EgyptCity[];
}

export const EGYPT_GOVERNORATES: EgyptGovernorate[] = [
  // ============================================
  // Greater Cairo Region
  // ============================================
  {
    id: 'cairo',
    nameAr: 'القاهرة',
    nameEn: 'Cairo',
    latitude: 30.0444,
    longitude: 31.2357,
    region: 'Greater Cairo',
    cities: [
      { nameAr: 'القاهرة', nameEn: 'Cairo', lat: 30.0444, lon: 31.2357 },
      { nameAr: 'القاهرة الجديدة', nameEn: 'New Cairo', lat: 30.0131, lon: 31.4769 },
      { nameAr: 'مصر الجديدة', nameEn: 'Heliopolis', lat: 30.0908, lon: 31.3220 },
      { nameAr: 'المعادي', nameEn: 'Maadi', lat: 29.9602, lon: 31.2569 },
      { nameAr: 'مدينة نصر', nameEn: 'Nasr City', lat: 30.0608, lon: 31.3461 },
      { nameAr: 'الزمالك', nameEn: 'Zamalek', lat: 30.0626, lon: 31.2218 },
      { nameAr: 'المقطم', nameEn: 'Mokattam', lat: 30.0125, lon: 31.3042 },
      { nameAr: 'حلوان', nameEn: 'Helwan', lat: 29.8500, lon: 31.3342 },
      { nameAr: 'الشروق', nameEn: 'El Shorouk', lat: 30.1214, lon: 31.6161 },
      { nameAr: 'مدينة بدر', nameEn: 'Badr City', lat: 30.1750, lon: 31.7000 },
    ],
  },
  {
    id: 'giza',
    nameAr: 'الجيزة',
    nameEn: 'Giza',
    latitude: 30.0131,
    longitude: 31.2089,
    region: 'Greater Cairo',
    cities: [
      { nameAr: 'الجيزة', nameEn: 'Giza', lat: 30.0131, lon: 31.2089 },
      { nameAr: '6 أكتوبر', nameEn: '6th October City', lat: 29.9394, lon: 30.9199 },
      { nameAr: 'الشيخ زايد', nameEn: 'Sheikh Zayed', lat: 30.0181, lon: 30.9714 },
      { nameAr: 'الدقي', nameEn: 'Dokki', lat: 30.0384, lon: 31.2123 },
      { nameAr: 'المهندسين', nameEn: 'Mohandessin', lat: 30.0600, lon: 31.2000 },
      { nameAr: 'الهرم', nameEn: 'Haram', lat: 29.9892, lon: 31.1425 },
      { nameAr: 'فيصل', nameEn: 'Faisal', lat: 30.0169, lon: 31.1672 },
      { nameAr: 'العمرانية', nameEn: 'Omraneya', lat: 30.0436, lon: 31.1772 },
    ],
  },
  {
    id: 'qalyubia',
    nameAr: 'القليوبية',
    nameEn: 'Qalyubia',
    latitude: 30.3079,
    longitude: 31.2126,
    region: 'Greater Cairo',
    cities: [
      { nameAr: 'بنها', nameEn: 'Banha', lat: 30.4667, lon: 31.1833 },
      { nameAr: 'شبرا الخيمة', nameEn: 'Shubra El Kheima', lat: 30.1286, lon: 31.2422 },
      { nameAr: 'القناطر الخيرية', nameEn: 'Al Qanater Al Khayreyah', lat: 30.1833, lon: 31.1333 },
      { nameAr: 'قليوب', nameEn: 'Qalyub', lat: 30.1794, lon: 31.2061 },
      { nameAr: 'الخانكة', nameEn: 'Al Khankah', lat: 30.2333, lon: 31.3667 },
    ],
  },

  // ============================================
  // Nile Delta Region
  // ============================================
  {
    id: 'alexandria',
    nameAr: 'الإسكندرية',
    nameEn: 'Alexandria',
    latitude: 31.2001,
    longitude: 29.9187,
    region: 'Coast',
    cities: [
      { nameAr: 'الإسكندرية', nameEn: 'Alexandria', lat: 31.2001, lon: 29.9187 },
      { nameAr: 'برج العرب', nameEn: 'Borg El Arab', lat: 30.9167, lon: 29.5500 },
      { nameAr: 'أبو قير', nameEn: 'Abu Qir', lat: 31.3167, lon: 30.0667 },
      { nameAr: 'العامرية', nameEn: 'El Amreya', lat: 31.0333, lon: 29.8667 },
      { nameAr: 'المنتزه', nameEn: 'El Montaza', lat: 31.2833, lon: 30.0167 },
    ],
  },
  {
    id: 'beheira',
    nameAr: 'البحيرة',
    nameEn: 'Beheira',
    latitude: 30.8481,
    longitude: 30.3436,
    region: 'Delta',
    cities: [
      { nameAr: 'دمنهور', nameEn: 'Damanhour', lat: 31.0341, lon: 30.4681 },
      { nameAr: 'كفر الدوار', nameEn: 'Kafr El Dawwar', lat: 31.1333, lon: 30.1333 },
      { nameAr: 'رشيد', nameEn: 'Rosetta', lat: 31.4000, lon: 30.4167 },
      { nameAr: 'إدكو', nameEn: 'Edku', lat: 31.3167, lon: 30.3000 },
    ],
  },
  {
    id: 'dakahlia',
    nameAr: 'الدقهلية',
    nameEn: 'Dakahlia',
    latitude: 31.0409,
    longitude: 31.3784,
    region: 'Delta',
    cities: [
      { nameAr: 'المنصورة', nameEn: 'Mansoura', lat: 31.0409, lon: 31.3785 },
      { nameAr: 'طلخا', nameEn: 'Talkha', lat: 31.0539, lon: 31.3783 },
      { nameAr: 'ميت غمر', nameEn: 'Mit Ghamr', lat: 30.7167, lon: 31.2500 },
      { nameAr: 'دكرنس', nameEn: 'Dekernes', lat: 30.6667, lon: 31.5833 },
    ],
  },
  {
    id: 'sharqia',
    nameAr: 'الشرقية',
    nameEn: 'Sharqia',
    latitude: 30.5965,
    longitude: 31.5041,
    region: 'Delta',
    cities: [
      { nameAr: 'الزقازيق', nameEn: 'Zagazig', lat: 30.5965, lon: 31.5041 },
      { nameAr: 'العاشر من رمضان', nameEn: '10th of Ramadan', lat: 30.3167, lon: 31.7500 },
      { nameAr: 'بلبيس', nameEn: 'Belbeis', lat: 30.4167, lon: 31.5667 },
      { nameAr: 'فاقوس', nameEn: 'Faqous', lat: 30.7333, lon: 31.7833 },
    ],
  },
  {
    id: 'gharbia',
    nameAr: 'الغربية',
    nameEn: 'Gharbia',
    latitude: 30.8754,
    longitude: 31.0335,
    region: 'Delta',
    cities: [
      { nameAr: 'طنطا', nameEn: 'Tanta', lat: 30.7865, lon: 31.0004 },
      { nameAr: 'المحلة الكبرى', nameEn: 'El Mahalla El Kubra', lat: 30.9714, lon: 31.1669 },
      { nameAr: 'كفر الزيات', nameEn: 'Kafr El Zayat', lat: 30.8167, lon: 30.8167 },
    ],
  },
  {
    id: 'monufia',
    nameAr: 'المنوفية',
    nameEn: 'Monufia',
    latitude: 30.5972,
    longitude: 30.9876,
    region: 'Delta',
    cities: [
      { nameAr: 'شبين الكوم', nameEn: 'Shibin El Kom', lat: 30.5522, lon: 31.0084 },
      { nameAr: 'منوف', nameEn: 'Menouf', lat: 30.4667, lon: 30.9333 },
      { nameAr: 'أشمون', nameEn: 'Ashmoun', lat: 30.3000, lon: 30.9833 },
    ],
  },
  {
    id: 'kafr-el-sheikh',
    nameAr: 'كفر الشيخ',
    nameEn: 'Kafr El Sheikh',
    latitude: 31.1107,
    longitude: 30.9388,
    region: 'Delta',
    cities: [
      { nameAr: 'كفر الشيخ', nameEn: 'Kafr El Sheikh', lat: 31.1107, lon: 30.9388 },
      { nameAr: 'دسوق', nameEn: 'Desouk', lat: 31.1333, lon: 30.6500 },
      { nameAr: 'فوه', nameEn: 'Fuwah', lat: 31.2000, lon: 30.5500 },
    ],
  },
  {
    id: 'damietta',
    nameAr: 'دمياط',
    nameEn: 'Damietta',
    latitude: 31.4175,
    longitude: 31.8144,
    region: 'Delta',
    cities: [
      { nameAr: 'دمياط', nameEn: 'Damietta', lat: 31.4175, lon: 31.8144 },
      { nameAr: 'رأس البر', nameEn: 'Ras El Bar', lat: 31.5000, lon: 31.8167 },
      { nameAr: 'فارسكور', nameEn: 'Faraskour', lat: 31.3286, lon: 31.7203 },
    ],
  },

  // ============================================
  // Suez Canal Region
  // ============================================
  {
    id: 'port-said',
    nameAr: 'بورسعيد',
    nameEn: 'Port Said',
    latitude: 31.2653,
    longitude: 32.3019,
    region: 'Canal',
    cities: [
      { nameAr: 'بورسعيد', nameEn: 'Port Said', lat: 31.2653, lon: 32.3019 },
      { nameAr: 'بورفؤاد', nameEn: 'Port Fuad', lat: 31.2500, lon: 32.3167 },
    ],
  },
  {
    id: 'ismailia',
    nameAr: 'الإسماعيلية',
    nameEn: 'Ismailia',
    latitude: 30.5833,
    longitude: 32.2667,
    region: 'Canal',
    cities: [
      { nameAr: 'الإسماعيلية', nameEn: 'Ismailia', lat: 30.5833, lon: 32.2667 },
      { nameAr: 'فايد', nameEn: 'Fayed', lat: 30.3236, lon: 32.3000 },
      { nameAr: 'القنطرة', nameEn: 'El Qantara', lat: 30.8500, lon: 32.3167 },
    ],
  },
  {
    id: 'suez',
    nameAr: 'السويس',
    nameEn: 'Suez',
    latitude: 29.9668,
    longitude: 32.5498,
    region: 'Canal',
    cities: [
      { nameAr: 'السويس', nameEn: 'Suez', lat: 29.9668, lon: 32.5498 },
      { nameAr: 'عتاقة', nameEn: 'Ataqah', lat: 29.9833, lon: 32.2833 },
    ],
  },

  // ============================================
  // Sinai Region
  // ============================================
  {
    id: 'north-sinai',
    nameAr: 'شمال سيناء',
    nameEn: 'North Sinai',
    latitude: 31.0456,
    longitude: 33.7959,
    region: 'Sinai',
    cities: [
      { nameAr: 'العريش', nameEn: 'El Arish', lat: 31.1319, lon: 33.7989 },
      { nameAr: 'رفح', nameEn: 'Rafah', lat: 31.2833, lon: 34.2500 },
      { nameAr: 'الشيخ زويد', nameEn: 'Sheikh Zuweid', lat: 31.1833, lon: 34.0833 },
    ],
  },
  {
    id: 'south-sinai',
    nameAr: 'جنوب سيناء',
    nameEn: 'South Sinai',
    latitude: 28.9697,
    longitude: 33.6173,
    region: 'Sinai',
    cities: [
      { nameAr: 'الطور', nameEn: 'El Tor', lat: 28.2392, lon: 33.6164 },
      { nameAr: 'شرم الشيخ', nameEn: 'Sharm El Sheikh', lat: 27.9158, lon: 34.3300 },
      { nameAr: 'دهب', nameEn: 'Dahab', lat: 28.5000, lon: 34.5167 },
      { nameAr: 'نويبع', nameEn: 'Nuweiba', lat: 29.0333, lon: 34.6667 },
      { nameAr: 'طابا', nameEn: 'Taba', lat: 29.4897, lon: 34.8917 },
    ],
  },

  // ============================================
  // Red Sea & Coast
  // ============================================
  {
    id: 'red-sea',
    nameAr: 'البحر الأحمر',
    nameEn: 'Red Sea',
    latitude: 24.6826,
    longitude: 34.1532,
    region: 'Coast',
    cities: [
      { nameAr: 'الغردقة', nameEn: 'Hurghada', lat: 27.2579, lon: 33.8116 },
      { nameAr: 'سفاجا', nameEn: 'Safaga', lat: 26.7333, lon: 33.9333 },
      { nameAr: 'القصير', nameEn: 'El Quseir', lat: 26.1056, lon: 34.2833 },
      { nameAr: 'مرسى علم', nameEn: 'Marsa Alam', lat: 25.0631, lon: 34.8944 },
    ],
  },
  {
    id: 'matrouh',
    nameAr: 'مطروح',
    nameEn: 'Matrouh',
    latitude: 31.3543,
    longitude: 27.2373,
    region: 'Coast',
    cities: [
      { nameAr: 'مرسى مطروح', nameEn: 'Marsa Matrouh', lat: 31.3543, lon: 27.2373 },
      { nameAr: 'السلوم', nameEn: 'Sallum', lat: 31.5667, lon: 25.1500 },
      { nameAr: 'الحمام', nameEn: 'El Hammam', lat: 30.7167, lon: 28.7500 },
    ],
  },

  // ============================================
  // Upper Egypt Region
  // ============================================
  {
    id: 'faiyum',
    nameAr: 'الفيوم',
    nameEn: 'Faiyum',
    latitude: 29.3084,
    longitude: 30.8428,
    region: 'Upper Egypt',
    cities: [
      { nameAr: 'الفيوم', nameEn: 'Faiyum', lat: 29.3084, lon: 30.8428 },
      { nameAr: 'إبشواي', nameEn: 'Ibshaway', lat: 29.3667, lon: 30.6833 },
      { nameAr: 'طامية', nameEn: 'Tamiya', lat: 29.4667, lon: 30.9667 },
    ],
  },
  {
    id: 'beni-suef',
    nameAr: 'بني سويف',
    nameEn: 'Beni Suef',
    latitude: 29.0661,
    longitude: 31.0994,
    region: 'Upper Egypt',
    cities: [
      { nameAr: 'بني سويف', nameEn: 'Beni Suef', lat: 29.0661, lon: 31.0994 },
      { nameAr: 'الواسطى', nameEn: 'El Wasta', lat: 29.3500, lon: 31.2000 },
      { nameAr: 'ناصر', nameEn: 'Nasser', lat: 29.1000, lon: 31.0833 },
    ],
  },
  {
    id: 'minya',
    nameAr: 'المنيا',
    nameEn: 'Minya',
    latitude: 28.0871,
    longitude: 30.7618,
    region: 'Upper Egypt',
    cities: [
      { nameAr: 'المنيا', nameEn: 'Minya', lat: 28.0871, lon: 30.7618 },
      { nameAr: 'ملوي', nameEn: 'Mallawi', lat: 27.7333, lon: 30.8333 },
      { nameAr: 'سمالوط', nameEn: 'Samalut', lat: 28.3167, lon: 30.7167 },
    ],
  },
  {
    id: 'asyut',
    nameAr: 'أسيوط',
    nameEn: 'Asyut',
    latitude: 27.1809,
    longitude: 31.1837,
    region: 'Upper Egypt',
    cities: [
      { nameAr: 'أسيوط', nameEn: 'Asyut', lat: 27.1809, lon: 31.1837 },
      { nameAr: 'ديروط', nameEn: 'Dairut', lat: 27.5500, lon: 30.8167 },
      { nameAr: 'منفلوط', nameEn: 'Manfalut', lat: 27.3167, lon: 30.9667 },
    ],
  },
  {
    id: 'sohag',
    nameAr: 'سوهاج',
    nameEn: 'Sohag',
    latitude: 26.5569,
    longitude: 31.6948,
    region: 'Upper Egypt',
    cities: [
      { nameAr: 'سوهاج', nameEn: 'Sohag', lat: 26.5569, lon: 31.6948 },
      { nameAr: 'أخميم', nameEn: 'Akhmim', lat: 26.5667, lon: 31.7500 },
      { nameAr: 'جرجا', nameEn: 'Girga', lat: 26.3333, lon: 31.8833 },
    ],
  },
  {
    id: 'qena',
    nameAr: 'قنا',
    nameEn: 'Qena',
    latitude: 26.1551,
    longitude: 32.7160,
    region: 'Upper Egypt',
    cities: [
      { nameAr: 'قنا', nameEn: 'Qena', lat: 26.1551, lon: 32.7160 },
      { nameAr: 'قوص', nameEn: 'Qus', lat: 25.9167, lon: 32.7667 },
      { nameAr: 'نقادة', nameEn: 'Naqada', lat: 25.8833, lon: 32.7167 },
    ],
  },
  {
    id: 'luxor',
    nameAr: 'الأقصر',
    nameEn: 'Luxor',
    latitude: 25.6872,
    longitude: 32.6396,
    region: 'Upper Egypt',
    cities: [
      { nameAr: 'الأقصر', nameEn: 'Luxor', lat: 25.6872, lon: 32.6396 },
      { nameAr: 'إسنا', nameEn: 'Esna', lat: 25.2933, lon: 32.5533 },
      { nameAr: 'الطود', nameEn: 'El Tod', lat: 25.6333, lon: 32.6833 },
    ],
  },
  {
    id: 'aswan',
    nameAr: 'أسوان',
    nameEn: 'Aswan',
    latitude: 24.0889,
    longitude: 32.8998,
    region: 'Upper Egypt',
    cities: [
      { nameAr: 'أسوان', nameEn: 'Aswan', lat: 24.0889, lon: 32.8998 },
      { nameAr: 'كوم أمبو', nameEn: 'Kom Ombo', lat: 24.4667, lon: 32.9500 },
      { nameAr: 'إدفو', nameEn: 'Edfu', lat: 24.9778, lon: 32.8742 },
      { nameAr: 'أبو سمبل', nameEn: 'Abu Simbel', lat: 22.3372, lon: 31.6258 },
    ],
  },
  {
    id: 'new-valley',
    nameAr: 'الوادي الجديد',
    nameEn: 'New Valley',
    latitude: 25.4552,
    longitude: 30.5428,
    region: 'Upper Egypt',
    cities: [
      { nameAr: 'الخارجة', nameEn: 'El Kharga', lat: 25.4419, lon: 30.5428 },
      { nameAr: 'الداخلة', nameEn: 'El Dakhla', lat: 25.5000, lon: 28.9833 },
      { nameAr: 'الفرافرة', nameEn: 'El Farafra', lat: 27.0583, lon: 27.9703 },
    ],
  },
];

/**
 * Regional clusters for broader geographic grouping
 */
export const REGIONAL_CLUSTERS = {
  'Greater Cairo': ['cairo', 'giza', 'qalyubia'],
  'Delta': ['dakahlia', 'sharqia', 'gharbia', 'monufia', 'beheira', 'kafr-el-sheikh', 'damietta'],
  'Canal': ['port-said', 'ismailia', 'suez'],
  'Sinai': ['north-sinai', 'south-sinai'],
  'Coast': ['alexandria', 'red-sea', 'matrouh'],
  'Upper Egypt': ['faiyum', 'beni-suef', 'minya', 'asyut', 'sohag', 'qena', 'luxor', 'aswan', 'new-valley'],
};

/**
 * Get governorate by ID
 */
export function getGovernorateById(id: string): EgyptGovernorate | undefined {
  return EGYPT_GOVERNORATES.find(g => g.id === id);
}

/**
 * Get governorate by name (Arabic or English)
 */
export function getGovernorateByName(name: string): EgyptGovernorate | undefined {
  const normalized = name.trim().toLowerCase();
  return EGYPT_GOVERNORATES.find(
    g => g.nameEn.toLowerCase() === normalized || g.nameAr === name
  );
}

/**
 * Find city in a governorate
 */
export function findCity(governorateId: string, cityName: string): EgyptCity | undefined {
  const gov = getGovernorateById(governorateId);
  if (!gov) return undefined;

  const normalized = cityName.trim().toLowerCase();
  return gov.cities.find(
    c => c.nameEn.toLowerCase() === normalized || c.nameAr === cityName
  );
}

/**
 * Get all governorates in a region
 */
export function getGovernoratesByRegion(region: string): EgyptGovernorate[] {
  return EGYPT_GOVERNORATES.filter(g => g.region === region);
}
