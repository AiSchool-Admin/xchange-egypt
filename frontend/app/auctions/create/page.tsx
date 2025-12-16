'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getCategories, Category } from '@/lib/api/categories';
import { createAuction, AuctionType, AuctionCategory } from '@/lib/api/auctions';

// أنواع المزادات
const auctionTypes: { value: AuctionType; label: string; description: string; icon: string }[] = [
  { value: 'ENGLISH', label: 'مزاد إنجليزي', description: 'المزايدة التصاعدية - الأعلى سعراً يفوز', icon: '🔨' },
  { value: 'SEALED_BID', label: 'عرض مختوم', description: 'عروض سرية - الأعلى يفوز عند الكشف', icon: '📦' },
  { value: 'DUTCH', label: 'مزاد هولندي', description: 'السعر ينخفض تدريجياً حتى أول مشترٍ', icon: '🔻' },
];

// فئات المزادات
const auctionCategories: { value: AuctionCategory; label: string; icon: string }[] = [
  { value: 'GENERAL', label: 'عام', icon: '📦' },
  { value: 'CARS', label: 'سيارات', icon: '🚗' },
  { value: 'PROPERTIES', label: 'عقارات', icon: '🏠' },
  { value: 'ELECTRONICS', label: 'إلكترونيات', icon: '📱' },
  { value: 'ANTIQUES', label: 'تحف وأنتيكات', icon: '🏺' },
  { value: 'ART', label: 'فنون', icon: '🎨' },
  { value: 'JEWELRY', label: 'مجوهرات', icon: '💎' },
  { value: 'COLLECTIBLES', label: 'مقتنيات', icon: '🏆' },
  { value: 'INDUSTRIAL', label: 'معدات صناعية', icon: '🏭' },
];

// المحافظات المصرية
const governorates = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 'البحيرة',
  'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية', 'المنيا', 'القليوبية',
  'الوادي الجديد', 'السويس', 'أسوان', 'أسيوط', 'بني سويف', 'بورسعيد',
  'دمياط', 'الشرقية', 'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر',
  'قنا', 'شمال سيناء', 'سوهاج',
];

export default function CreateAuctionPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');

  // بيانات المزاد
  const [formData, setFormData] = useState({
    // معلومات المنتج
    title: '',
    description: '',
    condition: 'NEW' as 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR',
    categoryId: '',

    // نوع المزاد
    auctionType: 'ENGLISH' as AuctionType,
    auctionCategory: 'GENERAL' as AuctionCategory,

    // التسعير
    startingPrice: '',
    reservePrice: '',
    buyNowPrice: '',
    minBidIncrement: '',

    // الموقع
    governorate: '',
    city: '',

    // التوقيت
    startDate: '',
    startTime: '',
    duration: '7', // أيام

    // خيارات متقدمة
    autoExtend: true,
    extensionMinutes: '5',
    requiresDeposit: false,
    depositPercentage: '10',
    isFeatured: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/auctions/create');
      return;
    }
    loadCategories();
  }, [isAuthenticated]);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const addImage = () => {
    if (imageUrl && images.length < 10) {
      setImages([...images, imageUrl]);
      setImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // حساب تاريخ البداية والنهاية
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(formData.duration) * 24 * 60 * 60 * 1000);

      const auctionData = {
        title: formData.title,
        description: formData.description,
        condition: formData.condition,
        categoryId: formData.categoryId || undefined,
        images,
        auctionType: formData.auctionType,
        auctionCategory: formData.auctionCategory,
        startingPrice: parseFloat(formData.startingPrice),
        reservePrice: formData.reservePrice ? parseFloat(formData.reservePrice) : undefined,
        buyNowPrice: formData.buyNowPrice ? parseFloat(formData.buyNowPrice) : undefined,
        minBidIncrement: parseFloat(formData.minBidIncrement) || 1,
        governorate: formData.governorate,
        city: formData.city,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        autoExtend: formData.autoExtend,
        extensionMinutes: parseInt(formData.extensionMinutes),
        requiresDeposit: formData.requiresDeposit,
        depositPercentage: formData.requiresDeposit ? parseFloat(formData.depositPercentage) : undefined,
        isFeatured: formData.isFeatured,
      };

      const result = await createAuction(auctionData);
      router.push(`/auctions/${result.data.id}?created=true`);
    } catch (error: any) {
      alert(error.message || 'حدث خطأ أثناء إنشاء المزاد');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحقق...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/auctions" className="text-purple-600 hover:text-purple-700 mb-4 inline-block">
            → العودة للمزادات
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">إنشاء مزاد جديد</h1>
          <p className="text-gray-600 mt-2">أنشئ مزادك واحصل على أفضل سعر لمنتجك</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {['معلومات المنتج', 'نوع المزاد', 'التسعير والتوقيت', 'المراجعة'].map((label, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step > index + 1 ? 'bg-green-500 text-white' :
                  step === index + 1 ? 'bg-purple-600 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step > index + 1 ? '✓' : index + 1}
                </div>
                <span className={`mr-2 text-sm ${step === index + 1 ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
                  {label}
                </span>
                {index < 3 && <div className={`w-16 h-1 mx-4 ${step > index + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: معلومات المنتج */}
          {step === 1 && (
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">معلومات المنتج</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان المزاد *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="مثال: iPhone 15 Pro Max 256GB جديد"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الوصف التفصيلي *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="اكتب وصفاً تفصيلياً للمنتج يشمل المواصفات والحالة وأي معلومات مهمة..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الحالة *</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="NEW">جديد</option>
                    <option value="LIKE_NEW">كالجديد</option>
                    <option value="GOOD">جيد</option>
                    <option value="FAIR">مقبول</option>
                    <option value="POOR">يحتاج إصلاح</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">التصنيف</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">اختر التصنيف</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nameAr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المحافظة *</label>
                  <select
                    name="governorate"
                    value={formData.governorate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">اختر المحافظة</option>
                    {governorates.map(gov => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المدينة/المنطقة *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="مثال: مدينة نصر"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* الصور */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">صور المنتج (حتى 10 صور)</label>
                <div className="flex gap-2 mb-4">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="أدخل رابط الصورة"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addImage}
                    disabled={images.length >= 10}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                  >
                    إضافة
                  </button>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-5 gap-2">
                    {images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img src={img} alt="" className="w-full h-24 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: نوع المزاد */}
          {step === 2 && (
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">نوع المزاد</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">اختر نوع المزاد *</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {auctionTypes.map(type => (
                    <div
                      key={type.value}
                      onClick={() => setFormData(prev => ({ ...prev, auctionType: type.value }))}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.auctionType === type.value
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{type.icon}</div>
                      <h3 className="font-bold text-gray-900">{type.label}</h3>
                      <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">فئة المزاد *</label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {auctionCategories.map(cat => (
                    <div
                      key={cat.value}
                      onClick={() => setFormData(prev => ({ ...prev, auctionCategory: cat.value }))}
                      className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${
                        formData.auctionCategory === cat.value
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{cat.icon}</div>
                      <span className="text-sm font-medium">{cat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: التسعير والتوقيت */}
          {step === 3 && (
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">التسعير والتوقيت</h2>

              {/* التسعير */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">سعر البداية (جنيه) *</label>
                  <input
                    type="number"
                    name="startingPrice"
                    value={formData.startingPrice}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الحد الأدنى للمزايدة (جنيه)</label>
                  <input
                    type="number"
                    name="minBidIncrement"
                    value={formData.minBidIncrement}
                    onChange={handleChange}
                    min="1"
                    placeholder="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">السعر الاحتياطي (جنيه)</label>
                  <input
                    type="number"
                    name="reservePrice"
                    value={formData.reservePrice}
                    onChange={handleChange}
                    min="0"
                    placeholder="اختياري"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">الحد الأدنى للبيع (لن يُعلن عنه)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">سعر الشراء الفوري (جنيه)</label>
                  <input
                    type="number"
                    name="buyNowPrice"
                    value={formData.buyNowPrice}
                    onChange={handleChange}
                    min="0"
                    placeholder="اختياري"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* التوقيت */}
              <div className="border-t pt-6">
                <h3 className="font-bold text-gray-900 mb-4">توقيت المزاد</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ البداية *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">وقت البداية *</label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">مدة المزاد *</label>
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="1">يوم واحد</option>
                      <option value="3">3 أيام</option>
                      <option value="5">5 أيام</option>
                      <option value="7">7 أيام</option>
                      <option value="10">10 أيام</option>
                      <option value="14">14 يوم</option>
                      <option value="30">30 يوم</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* خيارات متقدمة */}
              <div className="border-t pt-6">
                <h3 className="font-bold text-gray-900 mb-4">خيارات متقدمة</h3>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="autoExtend"
                      checked={formData.autoExtend}
                      onChange={handleChange}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div>
                      <span className="font-medium text-gray-900">تمديد تلقائي</span>
                      <p className="text-sm text-gray-500">تمديد المزاد إذا تمت مزايدة قبل الانتهاء بدقائق</p>
                    </div>
                  </label>

                  {formData.autoExtend && (
                    <div className="mr-8">
                      <label className="block text-sm font-medium text-gray-700 mb-2">دقائق التمديد</label>
                      <select
                        name="extensionMinutes"
                        value={formData.extensionMinutes}
                        onChange={handleChange}
                        className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="2">2 دقائق</option>
                        <option value="5">5 دقائق</option>
                        <option value="10">10 دقائق</option>
                      </select>
                    </div>
                  )}

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="requiresDeposit"
                      checked={formData.requiresDeposit}
                      onChange={handleChange}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div>
                      <span className="font-medium text-gray-900">طلب إيداع ضمان</span>
                      <p className="text-sm text-gray-500">يجب على المزايدين دفع نسبة قبل المشاركة</p>
                    </div>
                  </label>

                  {formData.requiresDeposit && (
                    <div className="mr-8">
                      <label className="block text-sm font-medium text-gray-700 mb-2">نسبة الإيداع (%)</label>
                      <input
                        type="number"
                        name="depositPercentage"
                        value={formData.depositPercentage}
                        onChange={handleChange}
                        min="5"
                        max="50"
                        className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div>
                      <span className="font-medium text-gray-900">مزاد مميز ⭐</span>
                      <p className="text-sm text-gray-500">يظهر في الصفحة الرئيسية (رسوم إضافية)</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: المراجعة */}
          {step === 4 && (
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">مراجعة المزاد</h2>

              <div className="grid grid-cols-2 gap-6">
                {/* معلومات المنتج */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-700 border-b pb-2">معلومات المنتج</h3>
                  <div>
                    <span className="text-gray-500 text-sm">العنوان:</span>
                    <p className="font-medium">{formData.title || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">الحالة:</span>
                    <p className="font-medium">{
                      { NEW: 'جديد', LIKE_NEW: 'كالجديد', GOOD: 'جيد', FAIR: 'مقبول', POOR: 'يحتاج إصلاح' }[formData.condition]
                    }</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">الموقع:</span>
                    <p className="font-medium">{formData.city}, {formData.governorate}</p>
                  </div>
                  {images.length > 0 && (
                    <div>
                      <span className="text-gray-500 text-sm">الصور:</span>
                      <div className="flex gap-2 mt-2">
                        {images.slice(0, 4).map((img, i) => (
                          <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded" />
                        ))}
                        {images.length > 4 && (
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-sm">
                            +{images.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* معلومات المزاد */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-700 border-b pb-2">معلومات المزاد</h3>
                  <div>
                    <span className="text-gray-500 text-sm">نوع المزاد:</span>
                    <p className="font-medium">{auctionTypes.find(t => t.value === formData.auctionType)?.label}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">سعر البداية:</span>
                    <p className="font-medium text-purple-600">{parseFloat(formData.startingPrice || '0').toLocaleString('ar-EG')} جنيه</p>
                  </div>
                  {formData.buyNowPrice && (
                    <div>
                      <span className="text-gray-500 text-sm">سعر الشراء الفوري:</span>
                      <p className="font-medium text-green-600">{parseFloat(formData.buyNowPrice).toLocaleString('ar-EG')} جنيه</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500 text-sm">المدة:</span>
                    <p className="font-medium">{formData.duration} يوم</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">البداية:</span>
                    <p className="font-medium">{formData.startDate} - {formData.startTime}</p>
                  </div>
                </div>
              </div>

              {/* الخيارات */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-700 mb-3">الخيارات المفعّلة</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.autoExtend && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">تمديد تلقائي</span>
                  )}
                  {formData.requiresDeposit && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">إيداع ضمان {formData.depositPercentage}%</span>
                  )}
                  {formData.isFeatured && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">⭐ مزاد مميز</span>
                  )}
                  {formData.reservePrice && (
                    <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">سعر احتياطي</span>
                  )}
                </div>
              </div>

              {/* تنبيه */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  ⚠️ بإنشاء هذا المزاد، أنت توافق على شروط وأحكام المنصة. لا يمكن حذف المزاد بعد بدء المزايدات.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                السابق
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                التالي
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    🔨 إنشاء المزاد
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
