'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ClipboardCheck,
  Calendar,
  Phone,
  FileText,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Home,
  MapPin,
  Info,
} from 'lucide-react';
import api from '@/lib/api/client';

interface Property {
  id: string;
  title: string;
  titleAr?: string;
  propertyType: string;
  governorate: string;
  city?: string;
  district?: string;
  areaSqm: number;
  salePrice?: number;
  rentPrice?: number;
  images: any[];
  owner: {
    id: string;
    fullName: string;
    phone?: string;
  };
}

const INSPECTION_TYPES = [
  {
    value: 'BASIC',
    label: 'فحص أساسي',
    description: 'فحص سريع للحالة العامة للعقار',
    price: 500,
    duration: '1-2 ساعة',
    includes: ['الحالة الخارجية', 'الحالة الداخلية العامة', 'تقرير مختصر'],
  },
  {
    value: 'STANDARD',
    label: 'فحص قياسي',
    description: 'فحص شامل لجميع أنظمة العقار',
    price: 1000,
    duration: '2-3 ساعات',
    includes: ['جميع بنود الفحص الأساسي', 'فحص السباكة', 'فحص الكهرباء', 'فحص التشطيبات', 'تقرير مفصل'],
  },
  {
    value: 'COMPREHENSIVE',
    label: 'فحص شامل',
    description: 'فحص كامل مع تقييم احترافي',
    price: 2000,
    duration: '3-4 ساعات',
    includes: ['جميع بنود الفحص القياسي', 'فحص الهيكل الإنشائي', 'تقييم القيمة السوقية', 'توصيات الصيانة', 'تقرير PDF تفصيلي'],
  },
  {
    value: 'PRE_PURCHASE',
    label: 'فحص ما قبل الشراء',
    description: 'فحص متخصص للمشترين المحتملين',
    price: 1500,
    duration: '2-3 ساعات',
    includes: ['فحص شامل للعقار', 'التحقق من المستندات', 'تقييم السعر', 'نصائح التفاوض', 'تقرير للمشتري'],
  },
];

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'شقة',
  VILLA: 'فيلا',
  TOWNHOUSE: 'تاون هاوس',
  TWIN_HOUSE: 'توين هاوس',
  DUPLEX: 'دوبلكس',
  PENTHOUSE: 'بنتهاوس',
  STUDIO: 'ستوديو',
  CHALET: 'شاليه',
  LAND: 'أرض',
  OFFICE: 'مكتب',
  SHOP: 'محل',
  WAREHOUSE: 'مخزن',
  BUILDING: 'مبنى',
};

export default function PropertyInspectionPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    inspectionType: 'STANDARD',
    preferredDate1: '',
    preferredDate2: '',
    preferredDate3: '',
    contactPhone: '',
    notes: '',
  });

  useEffect(() => {
    fetchProperty();
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/properties/${propertyId}`);
      if (response.data.success) {
        setProperty(response.data.data.property);
      }
    } catch (err) {
      console.error('Error fetching property:', err);
      setError('فشل في تحميل بيانات العقار');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setSubmitting(true);

      const preferredDates = [
        formData.preferredDate1,
        formData.preferredDate2,
        formData.preferredDate3,
      ].filter(Boolean).map(d => new Date(d).toISOString());

      const response = await api.post('/properties/inspections', {
        propertyId,
        inspectionType: formData.inspectionType,
        preferredDates,
        contactPhone: formData.contactPhone,
        notes: formData.notes,
      });

      if (response.data.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      console.error('Error requesting inspection:', err);
      // Handle error object properly - error might be string or object
      const errorMessage = err.response?.data?.error;
      if (typeof errorMessage === 'string') {
        setError(errorMessage);
      } else if (errorMessage?.message) {
        setError(errorMessage.message);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('فشل في إرسال طلب الفحص. يرجى المحاولة لاحقاً.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectedType = INSPECTION_TYPES.find(t => t.value === formData.inspectionType);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">تم إرسال طلب الفحص بنجاح!</h2>
          <p className="text-gray-600 mb-6">
            سيتواصل معك أحد المفتشين المعتمدين لدينا خلال 24 ساعة لتأكيد الموعد
          </p>
          <div className="flex gap-3">
            <Link
              href={`/properties/${propertyId}`}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700"
            >
              العودة للعقار
            </Link>
            <Link
              href="/properties"
              className="flex-1 border border-gray-200 py-3 rounded-xl font-medium hover:bg-gray-50"
            >
              تصفح العقارات
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => router.back()} className="text-white/80 hover:text-white">
              <ArrowRight className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">طلب فحص ميداني</h1>
          </div>
          <p className="text-white/80">احصل على تقرير مفصل عن حالة العقار من مفتش معتمد</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Property Info Card */}
        {property && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex gap-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={property.images?.[0]?.url || property.images?.[0] || '/placeholder-property.jpg'}
                  alt={property.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{property.titleAr || property.title}</h3>
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {property.district || property.city}, {property.governorate}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {PROPERTY_TYPE_LABELS[property.propertyType] || property.propertyType}
                  </span>
                  <span>{property.areaSqm} م²</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">لماذا تطلب فحص ميداني؟</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• التأكد من حالة العقار الفعلية قبل الشراء أو الإيجار</li>
                <li>• اكتشاف أي مشاكل خفية في البنية أو التشطيبات</li>
                <li>• الحصول على تقرير رسمي موثق للتفاوض</li>
                <li>• حماية استثمارك من المفاجآت غير السارة</li>
              </ul>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Inspection Type Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
              اختر نوع الفحص
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INSPECTION_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    formData.inspectionType === type.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="inspectionType"
                    value={type.value}
                    checked={formData.inspectionType === type.value}
                    onChange={(e) => setFormData({ ...formData, inspectionType: e.target.value })}
                    className="sr-only"
                  />
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">{type.label}</h3>
                    <span className="text-blue-600 font-bold">{type.price} ج.م</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{type.description}</p>
                  <div className="text-xs text-gray-400">المدة: {type.duration}</div>
                  {formData.inspectionType === type.value && (
                    <CheckCircle className="absolute top-4 left-4 w-5 h-5 text-blue-600" />
                  )}
                </label>
              ))}
            </div>

            {/* Selected Type Details */}
            {selectedType && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">يشمل الفحص:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {selectedType.includes.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Preferred Dates */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              المواعيد المفضلة
            </h2>
            <p className="text-sm text-gray-500 mb-4">اختر حتى 3 مواعيد مفضلة للفحص</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">الموعد الأول *</label>
                <input
                  type="datetime-local"
                  value={formData.preferredDate1}
                  onChange={(e) => setFormData({ ...formData, preferredDate1: e.target.value })}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الموعد الثاني (اختياري)</label>
                <input
                  type="datetime-local"
                  value={formData.preferredDate2}
                  onChange={(e) => setFormData({ ...formData, preferredDate2: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الموعد الثالث (اختياري)</label>
                <input
                  type="datetime-local"
                  value={formData.preferredDate3}
                  onChange={(e) => setFormData({ ...formData, preferredDate3: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-600" />
              معلومات التواصل
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">رقم الهاتف للتواصل *</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  required
                  placeholder="01xxxxxxxxx"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ملاحظات إضافية</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="أي ملاحظات أو طلبات خاصة..."
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Summary & Submit */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">نوع الفحص:</span>
              <span className="font-medium">{selectedType?.label}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">رسوم الفحص:</span>
              <span className="text-xl font-bold text-blue-600">{selectedType?.price} ج.م</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              * يتم الدفع بعد تأكيد الموعد مع المفتش
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <ClipboardCheck className="w-5 h-5" />
                  طلب الفحص الميداني
                </>
              )}
            </button>
          </div>

          {/* Trust Badges */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <Shield className="w-5 h-5" />
              <span className="font-medium">خدمة موثوقة ومعتمدة</span>
            </div>
            <ul className="text-sm text-green-600 space-y-1">
              <li>• مفتشون معتمدون ومدربون</li>
              <li>• تقارير مفصلة وموثقة</li>
              <li>• ضمان جودة الفحص</li>
              <li>• استرداد كامل في حالة عدم الرضا</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
}
