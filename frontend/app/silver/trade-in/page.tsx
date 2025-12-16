'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api';

export default function SilverTradeInPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [estimation, setEstimation] = useState<any>(null);
  const [myTradeIns, setMyTradeIns] = useState<any[]>([]);
  const [targetItems, setTargetItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    oldItemDescription: '',
    oldItemCategory: 'JEWELRY',
    oldItemPurity: 'S925',
    oldItemWeightGrams: '',
    oldItemCondition: 'GOOD',
    oldItemImages: [] as string[],
    targetItemId: '',
    deliveryMethod: 'OFFICE_DROP',
    address: '',
    preferredDate: '',
  });

  useEffect(() => {
    fetchMyTradeIns();
    fetchTargetItems();
  }, []);

  const fetchMyTradeIns = async () => {
    try {
      const res = await apiClient.get('/silver/trade-in/my');
      setMyTradeIns(res.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchTargetItems = async () => {
    try {
      const res = await apiClient.get('/silver/items?limit=12&status=ACTIVE');
      setTargetItems(res.data.data?.items || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const calculateEstimation = async () => {
    if (!formData.oldItemWeightGrams) return;

    setLoading(true);
    try {
      const res = await apiClient.post('/silver/trade-in/calculate', {
        purity: formData.oldItemPurity,
        weightGrams: parseFloat(formData.oldItemWeightGrams),
        condition: formData.oldItemCondition,
      });
      setEstimation(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        oldItemImages: [...prev.oldItemImages, reader.result as string],
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await apiClient.post('/silver/trade-in/request', {
        ...formData,
        oldItemWeightGrams: parseFloat(formData.oldItemWeightGrams),
      });
      await fetchMyTradeIns();
      setStep(5); // Success
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">برنامج Trade-In</h1>
          <p className="text-gray-600">استبدل فضتك القديمة بقطعة جديدة واحصل على أفضل قيمة</p>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">كيف يعمل؟</h2>
          <div className="grid grid-cols-4 gap-4 text-center">
            {[
              { icon: '📷', title: 'صوّر قطعتك', desc: 'ارفع صور واضحة' },
              { icon: '💰', title: 'احصل على تقييم', desc: 'تقييم فوري' },
              { icon: '🔄', title: 'اختر الجديد', desc: 'اختر قطعة جديدة' },
              { icon: '✨', title: 'استلم', desc: 'ادفع الفرق واستلم' },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-3xl mb-2">{s.icon}</div>
                <p className="font-semibold text-sm">{s.title}</p>
                <p className="text-xs text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* My Trade-ins */}
        {myTradeIns.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-bold mb-4">طلباتي</h2>
            <div className="space-y-3">
              {myTradeIns.slice(0, 3).map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">{t.oldItemDescription?.substring(0, 30)}...</p>
                    <p className="text-sm text-gray-500">
                      الرصيد المقدر: {t.estimatedCredit} ج.م
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    t.status === 'OFFER_MADE' ? 'bg-green-100 text-green-800' :
                    t.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {t.status === 'OFFER_MADE' ? 'عرض متاح' :
                     t.status === 'PENDING_REVIEW' ? 'قيد المراجعة' :
                     t.status === 'COMPLETED' ? 'مكتمل' : t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Old Item Details */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-bold mb-6">وصف القطعة القديمة</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">وصف القطعة</label>
                <textarea
                  value={formData.oldItemDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, oldItemDescription: e.target.value }))}
                  className="w-full p-3 border rounded-lg"
                  rows={3}
                  placeholder="اوصف القطعة بالتفصيل..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                  <select
                    value={formData.oldItemCategory}
                    onChange={(e) => setFormData(prev => ({ ...prev, oldItemCategory: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="JEWELRY">مجوهرات</option>
                    <option value="FLATWARE">أدوات مائدة</option>
                    <option value="DECORATIVE">ديكور</option>
                    <option value="COINS">عملات</option>
                    <option value="ANTIQUE">أنتيكات</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">النقاء</label>
                  <select
                    value={formData.oldItemPurity}
                    onChange={(e) => setFormData(prev => ({ ...prev, oldItemPurity: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="S999">فضة نقية 999</option>
                    <option value="S925">فضة استرليني 925</option>
                    <option value="S900">فضة 900</option>
                    <option value="S800">فضة 800</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوزن (جرام)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.oldItemWeightGrams}
                    onChange={(e) => setFormData(prev => ({ ...prev, oldItemWeightGrams: e.target.value }))}
                    onBlur={calculateEstimation}
                    className="w-full p-3 border rounded-lg"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                  <select
                    value={formData.oldItemCondition}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, oldItemCondition: e.target.value }));
                      setTimeout(calculateEstimation, 100);
                    }}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="EXCELLENT">ممتازة (90% من القيمة)</option>
                    <option value="GOOD">جيدة (85% من القيمة)</option>
                    <option value="FAIR">مقبولة (80% من القيمة)</option>
                    <option value="POOR">سيئة (75% من القيمة)</option>
                  </select>
                </div>
              </div>

              {/* Estimation Box */}
              {estimation && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-bold text-green-800 mb-2">التقييم المبدئي</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">سعر السوق للجرام:</p>
                      <p className="font-bold">{estimation.marketPricePerGram} ج.م</p>
                    </div>
                    <div>
                      <p className="text-gray-600">القيمة السوقية:</p>
                      <p className="font-bold">{estimation.marketValue} ج.م</p>
                    </div>
                    <div>
                      <p className="text-gray-600">نسبة الاستبدال:</p>
                      <p className="font-bold">{estimation.creditRate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">رصيد الاستبدال:</p>
                      <p className="font-bold text-green-700 text-lg">{estimation.tradeInCredit} ج.م</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setStep(2)}
                disabled={!formData.oldItemDescription || !formData.oldItemWeightGrams}
                className="w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300"
              >
                التالي
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Upload Images */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-bold mb-6">صور القطعة</h2>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {formData.oldItemImages.map((img, i) => (
                <div key={i} className="relative aspect-square">
                  <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                  <button
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      oldItemImages: prev.oldItemImages.filter((_, idx) => idx !== i),
                    }))}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6"
                  >
                    ×
                  </button>
                </div>
              ))}
              {formData.oldItemImages.length < 6 && (
                <label className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50">
                  <div className="text-center">
                    <span className="text-3xl text-gray-400">+</span>
                    <p className="text-sm text-gray-500">إضافة صورة</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  />
                </label>
              )}
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-300 rounded-lg">
                السابق
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={formData.oldItemImages.length === 0}
                className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300"
              >
                التالي
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Choose Target Item */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-bold mb-2">اختر القطعة الجديدة</h2>
            <p className="text-gray-600 mb-6">اختياري - يمكنك تحديدها لاحقاً</p>

            {estimation && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-blue-800">
                  رصيدك المتاح: <span className="font-bold">{estimation.tradeInCredit} ج.م</span>
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 max-h-96 overflow-y-auto">
              {targetItems.map((item: any) => {
                const priceDiff = item.askingPrice - (estimation?.tradeInCredit || 0);
                return (
                  <div
                    key={item.id}
                    onClick={() => setFormData(prev => ({ ...prev, targetItemId: item.id }))}
                    className={`border rounded-lg p-3 cursor-pointer ${
                      formData.targetItemId === item.id ? 'border-gray-600 ring-2 ring-gray-600' : ''
                    }`}
                  >
                    <img
                      src={item.images?.[0] || '/placeholder.jpg'}
                      alt={item.title}
                      className="w-full aspect-square object-cover rounded-lg mb-2"
                    />
                    <p className="font-semibold text-sm truncate">{item.title}</p>
                    <p className="text-gray-600">{item.askingPrice} ج.م</p>
                    {priceDiff > 0 ? (
                      <p className="text-sm text-red-600">تدفع: +{priceDiff} ج.م</p>
                    ) : priceDiff < 0 ? (
                      <p className="text-sm text-green-600">لك: {Math.abs(priceDiff)} ج.م</p>
                    ) : (
                      <p className="text-sm text-blue-600">مطابق!</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="flex-1 py-3 border border-gray-300 rounded-lg">
                السابق
              </button>
              <button onClick={() => setStep(4)} className="flex-1 py-3 bg-gray-600 text-white rounded-lg">
                {formData.targetItemId ? 'التالي' : 'تخطي - حدد لاحقاً'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Delivery */}
        {step === 4 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-bold mb-6">تسليم القطعة القديمة</h2>

            <div className="space-y-4 mb-6">
              {[
                { id: 'MAIL', name: 'إرسال بالبريد', desc: 'سنرسل لك ملصق الشحن' },
                { id: 'OFFICE_DROP', name: 'تسليم في المكتب', desc: 'احضر القطعة لأقرب فرع' },
                { id: 'HOME_PICKUP', name: 'استلام من المنزل', desc: 'سنرسل مندوب' },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer ${
                    formData.deliveryMethod === m.id ? 'border-gray-600 bg-gray-50' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value={m.id}
                    checked={formData.deliveryMethod === m.id}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryMethod: e.target.value }))}
                  />
                  <div>
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-sm text-gray-500">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {formData.deliveryMethod === 'HOME_PICKUP' && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">العنوان</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                />
              </div>
            )}

            <div className="flex gap-4">
              <button onClick={() => setStep(3)} className="flex-1 py-3 border border-gray-300 rounded-lg">
                السابق
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300"
              >
                {submitting ? 'جاري الإرسال...' : 'تقديم الطلب'}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Success */}
        {step === 5 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">تم تقديم طلبك!</h2>
            <p className="text-gray-600 mb-6">سنراجع طلبك ونتواصل معك خلال 24-48 ساعة</p>
            <Link href="/silver" className="px-6 py-2 bg-gray-600 text-white rounded-lg">
              العودة للسوق
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
