'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  LUXURY_BRANDS,
  LUXURY_CATEGORY_AR,
  LUXURY_CATEGORY_ICONS,
  LuxuryCategoryType,
  WATCH_MOVEMENT_AR,
  JEWELRY_METAL_AR,
  GEMSTONE_AR,
  WatchMovementType,
  JewelryMetalType,
  GemstoneType,
} from '@/lib/api/luxury-marketplace';

interface FormData {
  // Basic Info
  categoryType: LuxuryCategoryType | '';
  brand: string;
  model: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  referenceNumber: string;
  serialNumber: string;
  yearOfManufacture: string;

  // Pricing
  askingPrice: string;
  minOfferPrice: string;
  isNegotiable: boolean;
  acceptsOffers: boolean;
  acceptsBids: boolean;
  auctionDays: string;
  startingBid: string;

  // Condition
  conditionGrade: string;
  conditionNotes: string;
  hasOriginalBox: boolean;
  hasPapers: boolean;
  hasWarranty: boolean;
  warrantyExpires: string;
  hasReceipt: boolean;

  // Watch Details
  movementType: WatchMovementType | '';
  caseMaterial: string;
  caseDiameter: string;
  dialColor: string;
  strapMaterial: string;
  waterResistance: string;
  complications: string[];

  // Jewelry Details
  metalType: JewelryMetalType | '';
  metalWeight: string;
  primaryGemstone: GemstoneType | '';
  gemstoneCarat: string;
  gemstoneColor: string;
  gemstoneClarity: string;

  // Handbag Details
  bagMaterial: string;
  bagColor: string;
  bagSize: string;
  hardwareColor: string;

  // Location & Shipping
  governorate: string;
  city: string;
  canShip: boolean;
  shippingNotes: string;

  // Media
  images: string[];
  documents: string[];
}

const STEPS = [
  { id: 1, title: 'الفئة والماركة', icon: '📦' },
  { id: 2, title: 'التفاصيل', icon: '📝' },
  { id: 3, title: 'المواصفات', icon: '⚙️' },
  { id: 4, title: 'السعر', icon: '💰' },
  { id: 5, title: 'الصور', icon: '📷' },
  { id: 6, title: 'المراجعة', icon: '✅' },
];

const CONDITION_GRADES = [
  { value: 'A+', label: 'ممتاز (A+)', desc: 'حالة مثالية، بدون أي علامات استخدام' },
  { value: 'A', label: 'ممتاز (A)', desc: 'علامات استخدام طفيفة جداً' },
  { value: 'B+', label: 'جيد جداً (B+)', desc: 'علامات استخدام خفيفة' },
  { value: 'B', label: 'جيد (B)', desc: 'علامات استخدام واضحة' },
  { value: 'C', label: 'مقبول (C)', desc: 'علامات استخدام كثيرة' },
];

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'المنوفية',
  'القليوبية', 'البحيرة', 'الغربية', 'كفر الشيخ', 'دمياط', 'بورسعيد',
  'الإسماعيلية', 'السويس', 'شمال سيناء', 'جنوب سيناء', 'البحر الأحمر',
  'الوادي الجديد', 'مطروح', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط',
  'سوهاج', 'قنا', 'الأقصر', 'أسوان',
];

export default function SellLuxuryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') as LuxuryCategoryType | null;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    categoryType: initialCategory || '',
    brand: '',
    model: '',
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    referenceNumber: '',
    serialNumber: '',
    yearOfManufacture: '',
    askingPrice: '',
    minOfferPrice: '',
    isNegotiable: true,
    acceptsOffers: true,
    acceptsBids: false,
    auctionDays: '7',
    startingBid: '',
    conditionGrade: '',
    conditionNotes: '',
    hasOriginalBox: false,
    hasPapers: false,
    hasWarranty: false,
    warrantyExpires: '',
    hasReceipt: false,
    movementType: '',
    caseMaterial: '',
    caseDiameter: '',
    dialColor: '',
    strapMaterial: '',
    waterResistance: '',
    complications: [],
    metalType: '',
    metalWeight: '',
    primaryGemstone: '',
    gemstoneCarat: '',
    gemstoneColor: '',
    gemstoneClarity: '',
    bagMaterial: '',
    bagColor: '',
    bagSize: '',
    hardwareColor: '',
    governorate: '',
    city: '',
    canShip: true,
    shippingNotes: '',
    images: [],
    documents: [],
  });

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getBrandsForCategory = (): string[] => {
    if (!formData.categoryType) return [];
    return LUXURY_BRANDS[formData.categoryType] || [];
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // In production, this would call the API
      console.log('Submitting:', formData);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert('تم إضافة المنتج بنجاح! سيتم مراجعته من قبل فريق التوثيق.');
      router.push('/luxury');
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ، يرجى المحاولة مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!formData.categoryType && !!formData.brand;
      case 2:
        return !!formData.titleAr && !!formData.conditionGrade;
      case 3:
        return true; // Specs are optional
      case 4:
        return !!formData.askingPrice;
      case 5:
        return formData.images.length >= 3;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            {/* Category Selection */}
            <div>
              <label className="text-white font-bold text-lg block mb-4">اختر الفئة</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(Object.keys(LUXURY_CATEGORY_AR) as LuxuryCategoryType[])
                  .filter((cat) => ['WATCHES', 'JEWELRY', 'HANDBAGS', 'PERFUMES', 'PENS', 'SUNGLASSES'].includes(cat))
                  .map((cat) => (
                    <button
                      key={cat}
                      onClick={() => updateField('categoryType', cat)}
                      className={`p-4 rounded-xl border-2 transition text-center ${
                        formData.categoryType === cat
                          ? 'border-amber-500 bg-amber-500/20'
                          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <span className="text-3xl block mb-2">{LUXURY_CATEGORY_ICONS[cat]}</span>
                      <span className="text-white font-medium">{LUXURY_CATEGORY_AR[cat]}</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Brand Selection */}
            {formData.categoryType && (
              <div>
                <label className="text-white font-bold text-lg block mb-4">اختر الماركة</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {getBrandsForCategory().map((brand) => (
                    <button
                      key={brand}
                      onClick={() => updateField('brand', brand)}
                      className={`p-3 rounded-lg border transition ${
                        formData.brand === brand
                          ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                          : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                  <button
                    onClick={() => updateField('brand', 'other')}
                    className={`p-3 rounded-lg border transition ${
                      formData.brand === 'other'
                        ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                        : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    ماركة أخرى
                  </button>
                </div>

                {formData.brand === 'other' && (
                  <input
                    type="text"
                    placeholder="أدخل اسم الماركة"
                    className="mt-4 w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    onChange={(e) => updateField('brand', e.target.value)}
                  />
                )}
              </div>
            )}

            {/* Model */}
            {formData.brand && (
              <div>
                <label className="text-white font-bold text-lg block mb-4">الموديل</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => updateField('model', e.target.value)}
                  placeholder="مثال: Submariner Date, Birkin 30, Classic Flap"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="text-white font-medium block mb-2">عنوان الإعلان *</label>
              <input
                type="text"
                value={formData.titleAr}
                onChange={(e) => updateField('titleAr', e.target.value)}
                placeholder={`${formData.brand} ${formData.model} - حالة ممتازة`}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Reference & Serial */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-white font-medium block mb-2">رقم المرجع (Reference)</label>
                <input
                  type="text"
                  value={formData.referenceNumber}
                  onChange={(e) => updateField('referenceNumber', e.target.value)}
                  placeholder="مثال: 126610LN"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-white font-medium block mb-2">الرقم التسلسلي</label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => updateField('serialNumber', e.target.value)}
                  placeholder="اختياري - سري"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                />
                <p className="text-gray-500 text-xs mt-1">لن يظهر للمشترين، للتوثيق فقط</p>
              </div>
            </div>

            {/* Year */}
            <div>
              <label className="text-white font-medium block mb-2">سنة الصنع</label>
              <input
                type="number"
                value={formData.yearOfManufacture}
                onChange={(e) => updateField('yearOfManufacture', e.target.value)}
                placeholder="مثال: 2023"
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Condition */}
            <div>
              <label className="text-white font-bold text-lg block mb-4">حالة المنتج *</label>
              <div className="space-y-3">
                {CONDITION_GRADES.map((grade) => (
                  <button
                    key={grade.value}
                    onClick={() => updateField('conditionGrade', grade.value)}
                    className={`w-full p-4 rounded-lg border text-right transition ${
                      formData.conditionGrade === grade.value
                        ? 'border-amber-500 bg-amber-500/20'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded text-sm font-bold ${
                        grade.value === 'A+' ? 'bg-emerald-500 text-white' :
                        grade.value === 'A' ? 'bg-green-500 text-white' :
                        grade.value === 'B+' ? 'bg-blue-500 text-white' :
                        grade.value === 'B' ? 'bg-indigo-500 text-white' :
                        'bg-amber-500 text-white'
                      }`}>
                        {grade.value}
                      </span>
                      <div>
                        <div className="text-white font-medium">{grade.label}</div>
                        <div className="text-gray-400 text-sm">{grade.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Accessories */}
            <div>
              <label className="text-white font-bold text-lg block mb-4">الملحقات</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: 'hasOriginalBox', label: 'العلبة الأصلية', icon: '📦' },
                  { key: 'hasPapers', label: 'الأوراق والضمان', icon: '📜' },
                  { key: 'hasWarranty', label: 'ضمان ساري', icon: '🛡️' },
                  { key: 'hasReceipt', label: 'فاتورة الشراء', icon: '🧾' },
                ].map((acc) => (
                  <button
                    key={acc.key}
                    onClick={() => updateField(acc.key as keyof FormData, !formData[acc.key as keyof FormData])}
                    className={`p-4 rounded-lg border transition text-center ${
                      formData[acc.key as keyof FormData]
                        ? 'border-emerald-500 bg-emerald-500/20'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <span className="text-2xl block mb-2">{acc.icon}</span>
                    <span className={formData[acc.key as keyof FormData] ? 'text-emerald-400' : 'text-gray-400'}>
                      {acc.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-white font-medium block mb-2">وصف تفصيلي</label>
              <textarea
                value={formData.descriptionAr}
                onChange={(e) => updateField('descriptionAr', e.target.value)}
                placeholder="اكتب وصفاً تفصيلياً للمنتج، تاريخ الشراء، سبب البيع، أي ملاحظات..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none resize-none"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {formData.categoryType === 'WATCHES' && (
              <>
                <h3 className="text-white font-bold text-lg">مواصفات الساعة</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">نوع الحركة</label>
                    <select
                      value={formData.movementType}
                      onChange={(e) => updateField('movementType', e.target.value as WatchMovementType)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">اختر</option>
                      {(Object.keys(WATCH_MOVEMENT_AR) as WatchMovementType[]).map((type) => (
                        <option key={type} value={type}>{WATCH_MOVEMENT_AR[type]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">مادة العلبة</label>
                    <input
                      type="text"
                      value={formData.caseMaterial}
                      onChange={(e) => updateField('caseMaterial', e.target.value)}
                      placeholder="مثال: ستانلس ستيل، ذهب"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">قطر العلبة (مم)</label>
                    <input
                      type="number"
                      value={formData.caseDiameter}
                      onChange={(e) => updateField('caseDiameter', e.target.value)}
                      placeholder="مثال: 41"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">لون الميناء</label>
                    <input
                      type="text"
                      value={formData.dialColor}
                      onChange={(e) => updateField('dialColor', e.target.value)}
                      placeholder="مثال: أسود، أزرق"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">مادة السوار</label>
                    <input
                      type="text"
                      value={formData.strapMaterial}
                      onChange={(e) => updateField('strapMaterial', e.target.value)}
                      placeholder="مثال: أويستر، جوبيلي، جلد"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">مقاومة الماء (متر)</label>
                    <input
                      type="number"
                      value={formData.waterResistance}
                      onChange={(e) => updateField('waterResistance', e.target.value)}
                      placeholder="مثال: 100"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {formData.categoryType === 'JEWELRY' && (
              <>
                <h3 className="text-white font-bold text-lg">مواصفات المجوهرات</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">نوع المعدن</label>
                    <select
                      value={formData.metalType}
                      onChange={(e) => updateField('metalType', e.target.value as JewelryMetalType)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">اختر</option>
                      {(Object.keys(JEWELRY_METAL_AR) as JewelryMetalType[]).map((type) => (
                        <option key={type} value={type}>{JEWELRY_METAL_AR[type]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">الوزن (جرام)</label>
                    <input
                      type="number"
                      value={formData.metalWeight}
                      onChange={(e) => updateField('metalWeight', e.target.value)}
                      placeholder="مثال: 15.5"
                      step="0.1"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">الحجر الكريم</label>
                    <select
                      value={formData.primaryGemstone}
                      onChange={(e) => updateField('primaryGemstone', e.target.value as GemstoneType)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">اختر</option>
                      {(Object.keys(GEMSTONE_AR) as GemstoneType[]).map((type) => (
                        <option key={type} value={type}>{GEMSTONE_AR[type]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">عدد القيراط</label>
                    <input
                      type="number"
                      value={formData.gemstoneCarat}
                      onChange={(e) => updateField('gemstoneCarat', e.target.value)}
                      placeholder="مثال: 1.5"
                      step="0.01"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {formData.categoryType === 'HANDBAGS' && (
              <>
                <h3 className="text-white font-bold text-lg">مواصفات الحقيبة</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">المادة</label>
                    <input
                      type="text"
                      value={formData.bagMaterial}
                      onChange={(e) => updateField('bagMaterial', e.target.value)}
                      placeholder="مثال: جلد Togo، Canvas"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">اللون</label>
                    <input
                      type="text"
                      value={formData.bagColor}
                      onChange={(e) => updateField('bagColor', e.target.value)}
                      placeholder="مثال: أسود، بني"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">الحجم</label>
                    <select
                      value={formData.bagSize}
                      onChange={(e) => updateField('bagSize', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">اختر</option>
                      <option value="mini">ميني</option>
                      <option value="small">صغير</option>
                      <option value="medium">متوسط</option>
                      <option value="large">كبير</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">لون الإكسسوارات</label>
                    <select
                      value={formData.hardwareColor}
                      onChange={(e) => updateField('hardwareColor', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">اختر</option>
                      <option value="gold">ذهبي</option>
                      <option value="silver">فضي</option>
                      <option value="palladium">باللاديوم</option>
                      <option value="rose-gold">ذهبي وردي</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Location */}
            <div className="pt-6 border-t border-gray-700">
              <h3 className="text-white font-bold text-lg mb-4">الموقع والشحن</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm block mb-2">المحافظة *</label>
                  <select
                    value={formData.governorate}
                    onChange={(e) => updateField('governorate', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">اختر المحافظة</option>
                    {GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-2">المدينة</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="اختياري"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
              <label className="flex items-center gap-3 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.canShip}
                  onChange={(e) => updateField('canShip', e.target.checked)}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-gray-300">أوفر خدمة الشحن لجميع المحافظات</span>
              </label>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Asking Price */}
            <div>
              <label className="text-white font-bold text-lg block mb-2">السعر المطلوب *</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.askingPrice}
                  onChange={(e) => updateField('askingPrice', e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white text-2xl focus:border-amber-500 focus:outline-none"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">ج.م</span>
              </div>
            </div>

            {/* Min Offer */}
            <div>
              <label className="text-white font-medium block mb-2">أقل سعر مقبول</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.minOfferPrice}
                  onChange={(e) => updateField('minOfferPrice', e.target.value)}
                  placeholder="اختياري - لن يظهر للمشترين"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">ج.م</span>
              </div>
              <p className="text-gray-500 text-xs mt-1">سنرفض العروض أقل من هذا السعر تلقائياً</p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-800 rounded-lg">
                <input
                  type="checkbox"
                  checked={formData.isNegotiable}
                  onChange={(e) => updateField('isNegotiable', e.target.checked)}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-amber-500 focus:ring-amber-500"
                />
                <div>
                  <span className="text-white font-medium">السعر قابل للتفاوض</span>
                  <p className="text-gray-400 text-sm">المشترين يمكنهم التفاوض على السعر</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-800 rounded-lg">
                <input
                  type="checkbox"
                  checked={formData.acceptsOffers}
                  onChange={(e) => updateField('acceptsOffers', e.target.checked)}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-amber-500 focus:ring-amber-500"
                />
                <div>
                  <span className="text-white font-medium">قبول عروض الأسعار</span>
                  <p className="text-gray-400 text-sm">المشترين يمكنهم تقديم عروض سعر</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-4 bg-purple-900/30 border border-purple-500/30 rounded-lg">
                <input
                  type="checkbox"
                  checked={formData.acceptsBids}
                  onChange={(e) => updateField('acceptsBids', e.target.checked)}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500"
                />
                <div>
                  <span className="text-white font-medium">🔨 تفعيل المزاد</span>
                  <p className="text-gray-400 text-sm">اسمح للمشترين بالمزايدة على منتجك</p>
                </div>
              </label>
            </div>

            {/* Auction Settings */}
            {formData.acceptsBids && (
              <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg space-y-4">
                <h4 className="text-purple-400 font-medium">إعدادات المزاد</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">مدة المزاد</label>
                    <select
                      value={formData.auctionDays}
                      onChange={(e) => updateField('auctionDays', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="3">3 أيام</option>
                      <option value="5">5 أيام</option>
                      <option value="7">7 أيام</option>
                      <option value="14">14 يوم</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">سعر البداية</label>
                    <input
                      type="number"
                      value={formData.startingBid}
                      onChange={(e) => updateField('startingBid', e.target.value)}
                      placeholder="اختياري"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="text-white font-bold text-lg block mb-2">صور المنتج *</label>
              <p className="text-gray-400 mb-4">أضف 3 صور على الأقل. الصور الواضحة تزيد فرص البيع.</p>

              {/* Image Upload Area */}
              <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-amber-500/50 transition cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    // In production, upload to server and get URLs
                    const mockUrls = files.map((_, i) => `https://picsum.photos/800/600?random=${Date.now() + i}`);
                    updateField('images', [...formData.images, ...mockUrls]);
                  }}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <span className="text-5xl mb-4 block">📷</span>
                  <span className="text-white font-medium block mb-2">اضغط لرفع الصور</span>
                  <span className="text-gray-400 text-sm">PNG, JPG حتى 10MB</span>
                </label>
              </div>

              {/* Image Guidelines */}
              <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <h4 className="text-amber-400 font-medium mb-2">📸 نصائح للصور المثالية</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• صور واضحة بإضاءة جيدة</li>
                  <li>• صورة أمامية للمنتج</li>
                  <li>• صورة للعلبة والأوراق إن وجدت</li>
                  <li>• صور تفصيلية لأي علامات استخدام</li>
                </ul>
              </div>

              {/* Uploaded Images Preview */}
              {formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 md:grid-cols-5 gap-3">
                  {formData.images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img src={img} alt={`صورة ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => updateField('images', formData.images.filter((_, idx) => idx !== i))}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        ×
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-amber-500 text-xs text-gray-900 rounded">
                          الرئيسية
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <p className={`mt-2 text-sm ${formData.images.length >= 3 ? 'text-emerald-400' : 'text-gray-400'}`}>
                {formData.images.length}/3 صور مطلوبة كحد أدنى
              </p>
            </div>

            {/* Documents */}
            <div className="pt-6 border-t border-gray-700">
              <label className="text-white font-medium block mb-2">مستندات التوثيق (اختياري)</label>
              <p className="text-gray-400 text-sm mb-4">أضف شهادات الأصالة، فواتير الشراء، أو أي مستندات داعمة</p>
              <div className="border border-gray-700 rounded-lg p-4 text-center">
                <span className="text-gray-400">📄 اسحب الملفات هنا أو اضغط للرفع</span>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <span className="text-5xl mb-4 block">👀</span>
              <h3 className="text-2xl font-bold text-white">مراجعة الإعلان</h3>
              <p className="text-gray-400">تأكد من صحة المعلومات قبل النشر</p>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Product Info */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h4 className="text-amber-400 font-medium mb-4">معلومات المنتج</h4>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-gray-400">الفئة</dt>
                    <dd className="text-white">{LUXURY_CATEGORY_AR[formData.categoryType as LuxuryCategoryType]}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">الماركة</dt>
                    <dd className="text-white">{formData.brand}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">الموديل</dt>
                    <dd className="text-white">{formData.model || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">الحالة</dt>
                    <dd className="text-white">{formData.conditionGrade}</dd>
                  </div>
                </dl>
              </div>

              {/* Pricing */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h4 className="text-amber-400 font-medium mb-4">السعر</h4>
                <div className="text-3xl font-bold text-white mb-2">
                  {Number(formData.askingPrice).toLocaleString('ar-EG')} ج.م
                </div>
                <div className="flex gap-2">
                  {formData.isNegotiable && (
                    <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">قابل للتفاوض</span>
                  )}
                  {formData.acceptsBids && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">مزاد</span>
                  )}
                </div>
              </div>

              {/* Accessories */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h4 className="text-amber-400 font-medium mb-4">الملحقات</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.hasOriginalBox && <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded">📦 العلبة</span>}
                  {formData.hasPapers && <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded">📜 الأوراق</span>}
                  {formData.hasWarranty && <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded">🛡️ ضمان</span>}
                  {formData.hasReceipt && <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded">🧾 فاتورة</span>}
                </div>
              </div>

              {/* Images */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h4 className="text-amber-400 font-medium mb-4">الصور ({formData.images.length})</h4>
                <div className="flex gap-2 overflow-x-auto">
                  {formData.images.slice(0, 4).map((img, i) => (
                    <img key={i} src={img} alt="" className="w-16 h-16 rounded object-cover" />
                  ))}
                </div>
              </div>
            </div>

            {/* Verification Notice */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h4 className="text-blue-400 font-medium mb-2">🔍 ملاحظة التوثيق</h4>
              <p className="text-gray-300 text-sm">
                بعد النشر، سيقوم فريق الخبراء بمراجعة إعلانك للتحقق من أصالة المنتج.
                قد نتواصل معك لطلب صور أو معلومات إضافية.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-950" dir="rtl">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/luxury" className="text-gray-400 hover:text-white mb-4 inline-block">
            → العودة للسوق
          </Link>
          <h1 className="text-2xl font-bold text-white">أضف منتجك الفاخر</h1>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, i) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                  className={`flex flex-col items-center ${
                    step.id <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                    step.id === currentStep
                      ? 'bg-amber-500 text-gray-900'
                      : step.id < currentStep
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {step.id < currentStep ? '✓' : step.icon}
                  </div>
                  <span className={`text-xs hidden md:block ${
                    step.id === currentStep ? 'text-amber-400' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    step.id < currentStep ? 'bg-emerald-500' : 'bg-gray-700'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {renderStep()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-800">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            السابق
          </button>

          {currentStep < STEPS.length ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
              className="px-8 py-3 bg-amber-500 text-gray-900 rounded-lg font-bold hover:bg-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              التالي
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-bold hover:from-emerald-400 hover:to-teal-400 transition disabled:opacity-50"
            >
              {isSubmitting ? 'جاري النشر...' : '🚀 نشر الإعلان'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
