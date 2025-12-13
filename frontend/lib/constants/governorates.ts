// Egyptian Governorates - Standardized list matching backend validation
// These values must match the backend validation in item.validation.ts

export const EGYPTIAN_GOVERNORATES = [
  // Main governorates with Arabic labels
  { value: 'Cairo', labelAr: 'القاهرة', labelEn: 'Cairo' },
  { value: 'Giza', labelAr: 'الجيزة', labelEn: 'Giza' },
  { value: 'Alexandria', labelAr: 'الإسكندرية', labelEn: 'Alexandria' },
  { value: 'Dakahlia', labelAr: 'الدقهلية', labelEn: 'Dakahlia' },
  { value: 'Red Sea', labelAr: 'البحر الأحمر', labelEn: 'Red Sea' },
  { value: 'Beheira', labelAr: 'البحيرة', labelEn: 'Beheira' },
  { value: 'Fayoum', labelAr: 'الفيوم', labelEn: 'Fayoum' },
  { value: 'Gharbiya', labelAr: 'الغربية', labelEn: 'Gharbiya' },
  { value: 'Ismailia', labelAr: 'الإسماعيلية', labelEn: 'Ismailia' },
  { value: 'Menofia', labelAr: 'المنوفية', labelEn: 'Menofia' },
  { value: 'Minya', labelAr: 'المنيا', labelEn: 'Minya' },
  { value: 'Qaliubiya', labelAr: 'القليوبية', labelEn: 'Qaliubiya' },
  { value: 'New Valley', labelAr: 'الوادي الجديد', labelEn: 'New Valley' },
  { value: 'Suez', labelAr: 'السويس', labelEn: 'Suez' },
  { value: 'Aswan', labelAr: 'أسوان', labelEn: 'Aswan' },
  { value: 'Assiut', labelAr: 'أسيوط', labelEn: 'Assiut' },
  { value: 'Beni Suef', labelAr: 'بني سويف', labelEn: 'Beni Suef' },
  { value: 'Port Said', labelAr: 'بورسعيد', labelEn: 'Port Said' },
  { value: 'Damietta', labelAr: 'دمياط', labelEn: 'Damietta' },
  { value: 'Sharkia', labelAr: 'الشرقية', labelEn: 'Sharkia' },
  { value: 'South Sinai', labelAr: 'جنوب سيناء', labelEn: 'South Sinai' },
  { value: 'Kafr El Sheikh', labelAr: 'كفر الشيخ', labelEn: 'Kafr El Sheikh' },
  { value: 'Matrouh', labelAr: 'مطروح', labelEn: 'Matrouh' },
  { value: 'Luxor', labelAr: 'الأقصر', labelEn: 'Luxor' },
  { value: 'Qena', labelAr: 'قنا', labelEn: 'Qena' },
  { value: 'North Sinai', labelAr: 'شمال سيناء', labelEn: 'North Sinai' },
  { value: 'Sohag', labelAr: 'سوهاج', labelEn: 'Sohag' },
] as const;

export type Governorate = typeof EGYPTIAN_GOVERNORATES[number]['value'];

// Helper to get label for a governorate value
export const getGovernorateLabel = (value: string, lang: 'ar' | 'en' = 'ar'): string => {
  const gov = EGYPTIAN_GOVERNORATES.find(g => g.value === value);
  return gov ? (lang === 'ar' ? gov.labelAr : gov.labelEn) : value;
};

// Shipping costs by governorate
export const SHIPPING_COSTS: Record<string, number> = {
  'Cairo': 30,
  'Giza': 30,
  'Alexandria': 45,
  'Port Said': 50,
  'Suez': 50,
  'Luxor': 60,
  'Aswan': 65,
  'Red Sea': 55,
  'South Sinai': 55,
};

export const DEFAULT_SHIPPING_COST = 50;

export const getShippingCost = (governorate: string): number => {
  return SHIPPING_COSTS[governorate] || DEFAULT_SHIPPING_COST;
};
