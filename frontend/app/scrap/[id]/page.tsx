'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getScrapItemDetails,
  SCRAP_TYPE_AR,
  SCRAP_CONDITION_AR,
  METAL_TYPE_AR,
  SCRAP_PRICING_AR,
  ScrapType,
  ScrapCondition,
  MetalType,
  ScrapPricingType,
} from '@/lib/api/scrap-marketplace';

// Category icons
const SCRAP_TYPE_ICONS: Record<ScrapType, string> = {
  ELECTRONICS: '📱',
  HOME_APPLIANCES: '🔌',
  COMPUTERS: '💻',
  PHONES: '📞',
  CABLES_WIRES: '🔗',
  MOTORS: '⚙️',
  BATTERIES: '🔋',
  METAL_SCRAP: '🔩',
  CAR_PARTS: '🚗',
  FURNITURE_PARTS: '🪑',
  WOOD: '🪵',
  PLASTIC: '♻️',
  TEXTILES: '👕',
  PAPER: '📄',
  GLASS: '🪟',
  CONSTRUCTION: '🏗️',
  INDUSTRIAL: '🏭',
  MEDICAL: '⚕️',
  OTHER: '📦',
};

export default function ScrapItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadItem(params.id as string);
    }
  }, [params.id]);

  const loadItem = async (id: string) => {
    try {
      setLoading(true);
      const data = await getScrapItemDetails(id);
      setItem(data);
    } catch (err: any) {
      setError('فشل في تحميل بيانات المنتج');
      console.error('Error loading item:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-xl" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-12 bg-gray-200 rounded w-1/3 mt-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">{error || 'المنتج غير موجود'}</h2>
          <Link
            href="/scrap"
            className="inline-block mt-4 bg-orange-600 text-white px-6 py-3 rounded-lg font-bold"
          >
            العودة للسوق
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/scrap" className="hover:text-orange-600">
              سوق التوالف
            </Link>
            <span>/</span>
            <span className="text-gray-700">{SCRAP_TYPE_AR[item.scrapType as ScrapType]}</span>
            <span>/</span>
            <span className="text-gray-700">{item.title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative h-96">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[selectedImage]}
                    alt={item.title}
                    className="w-full h-full object-contain bg-gray-100"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-8xl">
                      {SCRAP_TYPE_ICONS[item.scrapType as ScrapType] || '📦'}
                    </span>
                  </div>
                )}
                {/* Badges */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <span className="bg-orange-500 text-white text-sm px-3 py-1 rounded-full">
                    {SCRAP_CONDITION_AR[item.scrapCondition as ScrapCondition]}
                  </span>
                  {item.isRepairable && (
                    <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full">
                      قابل للإصلاح
                    </span>
                  )}
                </div>
              </div>
              {/* Thumbnails */}
              {item.images && item.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {item.images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                        selectedImage === i ? 'border-orange-500' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Item Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h1 className="text-2xl font-bold mb-2">{item.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <span>{SCRAP_TYPE_ICONS[item.scrapType as ScrapType]}</span>
                  {SCRAP_TYPE_AR[item.scrapType as ScrapType]}
                </span>
                <span>•</span>
                <span>{item.governorate}</span>
                <span>•</span>
                <span>{new Date(item.createdAt).toLocaleDateString('ar-EG')}</span>
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">{item.description}</p>

              {/* Specifications */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">الحالة</div>
                  <div className="font-medium">
                    {SCRAP_CONDITION_AR[item.scrapCondition as ScrapCondition]}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">طريقة التسعير</div>
                  <div className="font-medium">
                    {SCRAP_PRICING_AR[item.scrapPricingType as ScrapPricingType]}
                  </div>
                </div>
                {item.weightKg && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">الوزن</div>
                    <div className="font-medium">{item.weightKg} كجم</div>
                  </div>
                )}
                {item.metalType && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">نوع المعدن</div>
                    <div className="font-medium">
                      {METAL_TYPE_AR[item.metalType as MetalType]}
                    </div>
                  </div>
                )}
                {item.pricePerKg && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">السعر للكيلو</div>
                    <div className="font-medium text-green-600">{item.pricePerKg} ج.م</div>
                  </div>
                )}
                {item.metalPurity && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">نقاء المعدن</div>
                    <div className="font-medium">{item.metalPurity}%</div>
                  </div>
                )}
              </div>

              {/* Defect & Repair Info */}
              {(item.defectDescription || item.workingPartsDesc || item.repairCostEstimate) && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-bold mb-4">معلومات العطل والإصلاح</h3>
                  <div className="space-y-3">
                    {item.defectDescription && (
                      <div>
                        <div className="text-sm text-gray-500 mb-1">وصف العطل</div>
                        <p className="text-gray-700">{item.defectDescription}</p>
                      </div>
                    )}
                    {item.workingPartsDesc && (
                      <div>
                        <div className="text-sm text-gray-500 mb-1">الأجزاء الشغالة</div>
                        <p className="text-gray-700">{item.workingPartsDesc}</p>
                      </div>
                    )}
                    {item.repairCostEstimate && (
                      <div className="p-3 bg-amber-50 rounded-lg">
                        <div className="text-sm text-amber-700 mb-1">تكلفة الإصلاح المتوقعة</div>
                        <div className="font-bold text-amber-800">
                          {item.repairCostEstimate.toLocaleString()} ج.م
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <div className="text-center mb-6">
                <div className="text-sm text-gray-500 mb-1">السعر المطلوب</div>
                <div className="text-4xl font-bold text-green-600">
                  {item.estimatedValue?.toLocaleString()} ج.م
                </div>
                {item.scrapPricingType === 'PER_KG' && item.pricePerKg && (
                  <div className="text-sm text-gray-500 mt-1">
                    ({item.pricePerKg} ج.م/كجم)
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowContact(true)}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition"
                >
                  تواصل مع البائع
                </button>
                <Link
                  href={`https://wa.me/${item.seller?.phoneNumber || ''}?text=${encodeURIComponent(
                    `مرحباً، أنا مهتم بـ: ${item.title}`
                  )}`}
                  target="_blank"
                  className="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition"
                >
                  <span>واتساب</span>
                  <span>📱</span>
                </Link>
              </div>

              {/* Contact Info (if shown) */}
              {showContact && item.seller && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-2">معلومات البائع</div>
                  <div className="font-medium">{item.seller.fullName}</div>
                  {item.seller.phoneNumber && (
                    <a
                      href={`tel:${item.seller.phoneNumber}`}
                      className="text-orange-600 hover:underline"
                    >
                      {item.seller.phoneNumber}
                    </a>
                  )}
                </div>
              )}

              {/* Seller Info */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <div className="font-medium">{item.seller?.fullName || 'بائع'}</div>
                    <div className="text-sm text-gray-500">
                      عضو منذ{' '}
                      {item.seller?.createdAt
                        ? new Date(item.seller.createdAt).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                          })
                        : 'غير معروف'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-xl">📍</span>
                  <div>
                    <div className="font-medium">
                      {item.city && `${item.city}، `}
                      {item.governorate}
                    </div>
                    {item.district && (
                      <div className="text-sm text-gray-500">{item.district}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Safety Tips */}
              <div className="mt-6 p-4 bg-amber-50 rounded-lg text-sm">
                <div className="font-medium text-amber-800 mb-2">نصائح الأمان</div>
                <ul className="text-amber-700 space-y-1">
                  <li>• تأكد من معاينة المنتج قبل الشراء</li>
                  <li>• اتفق على السعر مسبقاً</li>
                  <li>• استخدم وسيلة دفع آمنة</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Items */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">منتجات مشابهة</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {/* Placeholder for similar items */}
            <div className="text-center py-8 text-gray-500 col-span-4">
              جاري تحميل المنتجات المشابهة...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
