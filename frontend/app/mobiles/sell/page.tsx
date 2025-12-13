'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight, Camera, Smartphone, Battery, Shield, RefreshCw,
  Info, CheckCircle, Upload, X, Plus, Loader2, AlertCircle
} from 'lucide-react';

interface FormData {
  brand: string;
  model: string;
  variant: string;
  color: string;
  storageCapacity: string;
  ramSize: string;
  condition: string;
  conditionNotes: string;
  price: string;
  description: string;
  batteryHealth: string;
  screenCondition: string;
  bodyCondition: string;
  accessories: string[];
  warranty: boolean;
  warrantyExpiry: string;
  purchaseDate: string;
  acceptsBarter: boolean;
  barterPreferences: string[];
  governorate: string;
  city: string;
  imei: string;
}

const BRANDS = [
  { value: 'APPLE', label: 'Apple' },
  { value: 'SAMSUNG', label: 'Samsung' },
  { value: 'XIAOMI', label: 'Xiaomi' },
  { value: 'OPPO', label: 'OPPO' },
  { value: 'VIVO', label: 'Vivo' },
  { value: 'REALME', label: 'Realme' },
  { value: 'HUAWEI', label: 'Huawei' },
  { value: 'HONOR', label: 'Honor' },
  { value: 'INFINIX', label: 'Infinix' },
  { value: 'TECNO', label: 'Tecno' },
  { value: 'NOKIA', label: 'Nokia' },
  { value: 'MOTOROLA', label: 'Motorola' },
  { value: 'GOOGLE', label: 'Google' },
  { value: 'ONEPLUS', label: 'OnePlus' },
];

const CONDITIONS = [
  { value: 'A', label: 'ممتاز (A)', description: 'كالجديد تماماً - لا توجد أي علامات استخدام' },
  { value: 'B', label: 'جيد جداً (B)', description: 'استخدام خفيف - علامات بسيطة جداً' },
  { value: 'C', label: 'جيد (C)', description: 'علامات استخدام واضحة لكن يعمل بشكل ممتاز' },
  { value: 'D', label: 'مقبول (D)', description: 'قد يحتاج صيانة بسيطة' },
];

const STORAGE_OPTIONS = ['32', '64', '128', '256', '512', '1024'];
const RAM_OPTIONS = ['2', '3', '4', '6', '8', '12', '16'];

const ACCESSORIES = [
  'الشاحن الأصلي',
  'الكابل الأصلي',
  'سماعات',
  'العلبة الأصلية',
  'كتيب التعليمات',
  'واقي شاشة',
  'جراب',
  'شاحن لاسلكي',
];

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية', 'الشرقية',
  'الدقهلية', 'الغربية', 'المنوفية', 'البحيرة', 'كفر الشيخ',
  'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'الفيوم',
  'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا',
  'الأقصر', 'أسوان', 'البحر الأحمر', 'الوادي الجديد', 'مطروح',
  'شمال سيناء', 'جنوب سيناء'
];

export default function SellMobilePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [imeiStatus, setImeiStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'registered'>('idle');
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    brand: '',
    model: '',
    variant: '',
    color: '',
    storageCapacity: '',
    ramSize: '',
    condition: '',
    conditionNotes: '',
    price: '',
    description: '',
    batteryHealth: '',
    screenCondition: 'good',
    bodyCondition: 'good',
    accessories: [],
    warranty: false,
    warrantyExpiry: '',
    purchaseDate: '',
    acceptsBarter: false,
    barterPreferences: [],
    governorate: '',
    city: '',
    imei: '',
  });

  // Auto-fill governorate from user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.data) {
          const user = data.data;
          if (user.governorate && !formData.governorate) {
            setFormData(prev => ({
              ...prev,
              governorate: user.governorate || '',
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch models when brand changes
  useEffect(() => {
    if (formData.brand) {
      fetchModels(formData.brand);
    } else {
      setModels([]);
    }
  }, [formData.brand]);

  // Calculate suggested price when relevant fields change
  useEffect(() => {
    if (formData.brand && formData.model && formData.storageCapacity && formData.condition) {
      calculateSuggestedPrice();
    }
  }, [formData.brand, formData.model, formData.storageCapacity, formData.condition, formData.batteryHealth]);

  const fetchModels = async (brand: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mobiles/brands/${brand}/models`);
      const data = await response.json();
      if (data.success) {
        setModels(data.data);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const calculateSuggestedPrice = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mobiles/calculate-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: formData.brand,
          model: formData.model,
          storageCapacity: parseInt(formData.storageCapacity),
          condition: formData.condition,
          batteryHealth: formData.batteryHealth ? parseInt(formData.batteryHealth) : undefined,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSuggestedPrice(data.data.suggestedPrice);
      }
    } catch (error) {
      console.error('Error calculating price:', error);
    }
  };

  const checkIMEI = async () => {
    if (!formData.imei || formData.imei.length !== 15) return;

    setImeiStatus('checking');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mobiles/verify/imei/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imei: formData.imei }),
      });
      const data = await response.json();

      if (data.success) {
        // Check if IMEI is already registered with another listing
        if (data.data?.isRegistered) {
          setImeiStatus('registered');
          return;
        }

        // IMEI is clean if:
        // 1. No previous verification (lastVerification is null) - assume clean
        // 2. Or previous verification shows not blacklisted and not stolen
        const verification = data.data?.lastVerification;
        const isBlacklisted = verification?.isBlacklisted === true;
        const isStolen = verification?.isStolen === true;

        if (isBlacklisted || isStolen) {
          setImeiStatus('invalid');
        } else {
          setImeiStatus('valid');
        }
      } else {
        setImeiStatus('invalid');
      }
    } catch (error) {
      console.error('Error checking IMEI:', error);
      setImeiStatus('invalid');
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'brand') {
      setFormData(prev => ({ ...prev, model: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 10) {
      setError('الحد الأقصى 10 صور');
      return;
    }

    setImages(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const toggleAccessory = (accessory: string) => {
    setFormData(prev => ({
      ...prev,
      accessories: prev.accessories.includes(accessory)
        ? prev.accessories.filter(a => a !== accessory)
        : [...prev.accessories, accessory]
    }));
  };

  const validateStep = (currentStep: number): boolean => {
    setError(null);

    switch (currentStep) {
      case 1:
        if (!formData.brand || !formData.model || !formData.storageCapacity || !formData.ramSize) {
          setError('يرجى ملء جميع الحقول المطلوبة');
          return false;
        }
        return true;
      case 2:
        if (!formData.condition) {
          setError('يرجى اختيار حالة الجهاز');
          return false;
        }
        if (!formData.batteryHealth || parseInt(formData.batteryHealth) < 0 || parseInt(formData.batteryHealth) > 100) {
          setError('يرجى إدخال صحة البطارية (0-100)');
          return false;
        }
        return true;
      case 3:
        if (images.length < 3) {
          setError('يرجى إضافة 3 صور على الأقل');
          return false;
        }
        return true;
      case 4:
        if (!formData.price || parseInt(formData.price) < 100) {
          setError('يرجى إدخال سعر صحيح');
          return false;
        }
        if (!formData.governorate) {
          setError('يرجى اختيار المحافظة');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Upload images first
      const imageUrls: string[] = [];
      for (const image of images) {
        const formData = new FormData();
        formData.append('image', image);

        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const uploadData = await uploadResponse.json();
        if (uploadData.success) {
          imageUrls.push(uploadData.data.url);
        }
      }

      // Create listing
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mobiles/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          storageCapacity: parseInt(formData.storageCapacity),
          ramSize: parseInt(formData.ramSize),
          batteryHealth: parseInt(formData.batteryHealth),
          price: parseInt(formData.price),
          images: imageUrls,
        }),
      });

      const data = await response.json();
      if (data.success) {
        router.push(`/mobiles/${data.data.id}?created=true`);
      } else {
        setError(data.error?.message || 'حدث خطأ أثناء إنشاء الإعلان');
      }
    } catch (error) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowRight className="w-5 h-5 ml-1" />
            <span>رجوع</span>
          </button>
          <h1 className="font-bold text-lg">بيع موبايلك</h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            {['المواصفات', 'الحالة', 'الصور', 'السعر والموقع', 'المراجعة'].map((label, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step > idx + 1 ? 'bg-green-500 text-white' :
                  step === idx + 1 ? 'bg-indigo-600 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step > idx + 1 ? <CheckCircle className="w-5 h-5" /> : idx + 1}
                </div>
                <span className={`text-xs mt-1 ${step === idx + 1 ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Step 1: Specifications */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-indigo-600" />
              مواصفات الجهاز
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">العلامة التجارية *</label>
                <select
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3"
                >
                  <option value="">اختر العلامة التجارية</option>
                  {BRANDS.map(brand => (
                    <option key={brand.value} value={brand.value}>{brand.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">الموديل *</label>
                <select
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  disabled={!formData.brand}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 disabled:bg-gray-100"
                >
                  <option value="">اختر الموديل</option>
                  {models.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">الإصدار (اختياري)</label>
                <input
                  type="text"
                  value={formData.variant}
                  onChange={(e) => handleInputChange('variant', e.target.value)}
                  placeholder="مثال: Pro Max, Ultra"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">اللون</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="مثال: أسود، أزرق"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">السعة التخزينية *</label>
                <select
                  value={formData.storageCapacity}
                  onChange={(e) => handleInputChange('storageCapacity', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3"
                >
                  <option value="">اختر السعة</option>
                  {STORAGE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt} GB</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">الرام *</label>
                <select
                  value={formData.ramSize}
                  onChange={(e) => handleInputChange('ramSize', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3"
                >
                  <option value="">اختر الرام</option>
                  {RAM_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt} GB</option>
                  ))}
                </select>
              </div>
            </div>

            {/* IMEI Verification */}
            <div className="border-t pt-6">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                رقم IMEI (اختياري - للتحقق)
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={formData.imei}
                  onChange={(e) => handleInputChange('imei', e.target.value.replace(/\D/g, '').slice(0, 15))}
                  placeholder="أدخل 15 رقم IMEI"
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-3"
                />
                <button
                  onClick={checkIMEI}
                  disabled={formData.imei.length !== 15 || imeiStatus === 'checking'}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium disabled:bg-gray-300 flex items-center gap-2"
                >
                  {imeiStatus === 'checking' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Shield className="w-5 h-5" />
                  )}
                  تحقق
                </button>
              </div>
              {imeiStatus === 'valid' && (
                <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  IMEI نظيف - الجهاز غير مسروق وغير محظور
                </p>
              )}
              {imeiStatus === 'registered' && (
                <p className="mt-2 text-sm text-orange-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  هذا الـ IMEI مسجل بالفعل في إعلان آخر
                </p>
              )}
              {imeiStatus === 'invalid' && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  تحذير: هذا الـ IMEI مدرج في قائمة الأجهزة المحظورة أو المسروقة
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                للحصول على IMEI: اطلب *#06# أو من الإعدادات {'>'} حول الهاتف
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Condition */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-indigo-600" />
              حالة الجهاز
            </h2>

            <div>
              <label className="block text-sm font-medium mb-3">الحالة العامة *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CONDITIONS.map(cond => (
                  <label
                    key={cond.value}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.condition === cond.value
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="condition"
                      value={cond.value}
                      checked={formData.condition === cond.value}
                      onChange={(e) => handleInputChange('condition', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{cond.label}</span>
                      {formData.condition === cond.value && (
                        <CheckCircle className="w-5 h-5 text-indigo-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{cond.description}</p>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Battery className="w-4 h-4" />
                صحة البطارية *
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.batteryHealth}
                  onChange={(e) => handleInputChange('batteryHealth', e.target.value)}
                  placeholder="مثال: 85"
                  className="w-32 border border-gray-200 rounded-lg px-4 py-3"
                />
                <span className="text-gray-500">%</span>
                <div className={`flex-1 h-3 rounded-full overflow-hidden bg-gray-200`}>
                  <div
                    className={`h-full transition-all ${
                      parseInt(formData.batteryHealth) >= 80 ? 'bg-green-500' :
                      parseInt(formData.batteryHealth) >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${formData.batteryHealth || 0}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                للحصول على صحة البطارية: الإعدادات {'>'} البطارية {'>'} صحة البطارية
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">ملاحظات عن الحالة (اختياري)</label>
              <textarea
                value={formData.conditionNotes}
                onChange={(e) => handleInputChange('conditionNotes', e.target.value)}
                placeholder="مثال: خدش صغير في الزاوية اليمنى، الشاشة ممتازة..."
                className="w-full border border-gray-200 rounded-lg px-4 py-3 h-24 resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">الملحقات المتضمنة</label>
              <div className="flex flex-wrap gap-2">
                {ACCESSORIES.map(acc => (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => toggleAccessory(acc)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      formData.accessories.includes(acc)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {acc}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.warranty}
                  onChange={(e) => handleInputChange('warranty', e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
                <span>الجهاز ما زال بالضمان</span>
              </label>
              {formData.warranty && (
                <input
                  type="date"
                  value={formData.warrantyExpiry}
                  onChange={(e) => handleInputChange('warrantyExpiry', e.target.value)}
                  className="border border-gray-200 rounded-lg px-4 py-2"
                />
              )}
            </div>
          </div>
        )}

        {/* Step 3: Images */}
        {step === 3 && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Camera className="w-6 h-6 text-indigo-600" />
              صور الجهاز
            </h2>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">اضغط لإضافة صور</p>
                <p className="text-sm text-gray-500">أو اسحب الصور وأفلتها هنا</p>
                <p className="text-xs text-gray-400 mt-2">PNG, JPG حتى 5MB لكل صورة (3-10 صور)</p>
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-2 left-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded">
                        الرئيسية
                      </span>
                    )}
                  </div>
                ))}
                {imagePreviews.length < 10 && (
                  <label
                    htmlFor="image-upload"
                    className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50"
                  >
                    <Plus className="w-8 h-8 text-gray-400" />
                  </label>
                )}
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <Info className="w-5 h-5" />
                نصائح لصور أفضل
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• التقط صور واضحة في إضاءة جيدة</li>
                <li>• صوّر الجهاز من جميع الجهات</li>
                <li>• أظهر أي خدوش أو عيوب بوضوح</li>
                <li>• صوّر شاشة الجهاز وهي تعمل</li>
                <li>• صوّر الملحقات إن وجدت</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 4: Price & Location */}
        {step === 4 && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-bold">السعر والموقع</h2>

            <div>
              <label className="block text-sm font-medium mb-2">السعر *</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="أدخل السعر"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 pl-16"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">ج.م</span>
              </div>
              {suggestedPrice && (
                <div className="mt-3 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    السعر المقترح بناءً على السوق: <strong>{suggestedPrice.toLocaleString('ar-EG')} ج.م</strong>
                  </p>
                  <button
                    type="button"
                    onClick={() => handleInputChange('price', suggestedPrice.toString())}
                    className="mt-2 text-sm text-green-600 underline"
                  >
                    استخدم السعر المقترح
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">المحافظة *</label>
                <select
                  value={formData.governorate}
                  onChange={(e) => handleInputChange('governorate', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3"
                >
                  <option value="">اختر المحافظة</option>
                  {GOVERNORATES.map(gov => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">المدينة/المنطقة</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="مثال: مدينة نصر"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الوصف (اختياري)</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="اكتب وصفاً مفصلاً للجهاز..."
                className="w-full border border-gray-200 rounded-lg px-4 py-3 h-32 resize-none"
              ></textarea>
            </div>

            {/* Barter Options */}
            <div className="border-t pt-6">
              <label className="flex items-center gap-3 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.acceptsBarter}
                  onChange={(e) => handleInputChange('acceptsBarter', e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded"
                />
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">أقبل المقايضة</span>
                </div>
              </label>

              {formData.acceptsBarter && (
                <div>
                  <label className="block text-sm font-medium mb-2">ما الذي تبحث عنه؟</label>
                  <input
                    type="text"
                    placeholder="مثال: iPhone 14, Samsung S23 (اضغط Enter لإضافة)"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = (e.target as HTMLInputElement).value.trim();
                        if (value && !formData.barterPreferences.includes(value)) {
                          handleInputChange('barterPreferences', [...formData.barterPreferences, value]);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.barterPreferences.map((pref, idx) => (
                      <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {pref}
                        <button
                          onClick={() => handleInputChange('barterPreferences', formData.barterPreferences.filter((_, i) => i !== idx))}
                          className="hover:text-purple-900"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">مراجعة الإعلان</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-500 mb-2">الجهاز</h3>
                  <p className="text-lg font-bold">{formData.brand} {formData.model}</p>
                  <p className="text-gray-600">{formData.storageCapacity}GB / {formData.ramSize}GB RAM</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-500 mb-2">الحالة</h3>
                  <p className="text-lg font-bold">{CONDITIONS.find(c => c.value === formData.condition)?.label}</p>
                  <p className="text-gray-600">البطارية: {formData.batteryHealth}%</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-500 mb-2">السعر</h3>
                  <p className="text-2xl font-bold text-indigo-600">{parseInt(formData.price).toLocaleString('ar-EG')} ج.م</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-500 mb-2">الموقع</h3>
                  <p className="text-lg">{formData.governorate}</p>
                  {formData.city && <p className="text-gray-600">{formData.city}</p>}
                </div>
              </div>

              {/* Image Preview */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-medium text-gray-500 mb-3">الصور ({imagePreviews.length})</h3>
                <div className="flex gap-2 overflow-x-auto">
                  {imagePreviews.slice(0, 5).map((preview, idx) => (
                    <img key={idx} src={preview} alt="" className="w-20 h-20 object-cover rounded-lg" />
                  ))}
                  {imagePreviews.length > 5 && (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">+{imagePreviews.length - 5}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="mt-6 pt-6 border-t flex flex-wrap gap-3">
                {imeiStatus === 'valid' && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    IMEI موثق
                  </span>
                )}
                {formData.acceptsBarter && (
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <RefreshCw className="w-4 h-4" />
                    يقبل المقايضة
                  </span>
                )}
                {formData.warranty && (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                    بالضمان
                  </span>
                )}
              </div>
            </div>

            {/* Safety Notice */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h3 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                حماية البائع
              </h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• معاملاتك محمية عبر نظام Escrow</li>
                <li>• ستتلقى المبلغ بعد تأكيد استلام المشتري</li>
                <li>• فريق الدعم متاح لمساعدتك في أي وقت</li>
              </ul>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              السابق
            </button>
          ) : (
            <div></div>
          )}

          {step < 5 ? (
            <button
              onClick={nextStep}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2"
            >
              التالي
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري النشر...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  نشر الإعلان
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
