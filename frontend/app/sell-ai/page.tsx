'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  analyzeImage,
  analyzeText,
  updateDraft,
  publishDraft,
  discardDraft,
  AIAnalysisResult,
} from '@/lib/api/ai-listing';

const STEPS = [
  { id: 1, title: 'اختر الطريقة', icon: '📸' },
  { id: 2, title: 'تحليل AI', icon: '🤖' },
  { id: 3, title: 'مراجعة وتعديل', icon: '✏️' },
  { id: 4, title: 'نشر', icon: '🚀' },
];

export default function SellWithAIPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [inputType, setInputType] = useState<'image' | 'text' | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [editedData, setEditedData] = useState<{
    title: string;
    description: string;
    category: string;
    price: number;
    tags: string[];
  } | null>(null);

  const handleAnalyze = async () => {
    if (inputType === 'image' && !imageUrl) {
      alert('يرجى إدخال رابط الصورة');
      return;
    }
    if (inputType === 'text' && textInput.length < 10) {
      alert('يرجى إدخال وصف أطول (10 أحرف على الأقل)');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (inputType === 'image') {
        response = await analyzeImage(imageUrl);
      } else {
        response = await analyzeText(textInput);
      }

      const data = response.data as AIAnalysisResult;
      setResult(data);
      setEditedData({
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.estimatedPrice,
        tags: data.tags,
      });
      setStep(3);
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ في التحليل');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!result || !editedData) return;

    setLoading(true);
    try {
      // Update draft with edited data
      await updateDraft(result.draftId, {
        generatedTitle: editedData.title,
        generatedDesc: editedData.description,
        generatedCategory: editedData.category,
        estimatedPrice: editedData.price,
        generatedTags: editedData.tags,
      });

      // Publish
      const response = await publishDraft(result.draftId);
      const item = response.data?.item;

      setStep(4);
      setTimeout(() => {
        router.push(`/items/${item.id}`);
      }, 2000);
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ في النشر');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = async () => {
    if (!result) return;
    if (!confirm('هل أنت متأكد من إلغاء هذا الإعلان؟')) return;

    try {
      await discardDraft(result.draftId);
      setResult(null);
      setEditedData(null);
      setStep(1);
      setInputType(null);
    } catch (error) {
      console.error('Error discarding:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <span className="text-6xl mb-4 block">🤖</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">بيع بالـ AI</h2>
          <p className="text-gray-600 mb-4">سجل دخول لاستخدام هذه الميزة</p>
          <a
            href="/login"
            className="inline-block bg-gradient-to-l from-violet-500 to-purple-500 text-white px-6 py-3 rounded-lg font-bold"
          >
            تسجيل الدخول
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero */}
      <section className="bg-gradient-to-l from-violet-600 via-purple-500 to-pink-500 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-3">
            <span className="text-5xl">🤖</span>
            بيع بالـ AI
          </h1>
          <p className="text-xl text-white/90">أنشئ إعلانك في ثوانٍ باستخدام الذكاء الاصطناعي</p>
        </div>
      </section>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                  step >= s.id
                    ? 'bg-gradient-to-l from-violet-500 to-purple-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s.icon}
              </div>
              <span
                className={`mr-2 text-sm font-bold ${
                  step >= s.id ? 'text-purple-600' : 'text-gray-400'
                }`}
              >
                {s.title}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-20 h-1 mx-2 ${
                    step > s.id ? 'bg-purple-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Choose Method */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              كيف تريد إنشاء إعلانك؟
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => {
                  setInputType('image');
                  setStep(2);
                }}
                className="p-8 border-2 border-gray-200 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
              >
                <span className="text-6xl block mb-4 group-hover:scale-110 transition-transform">
                  📸
                </span>
                <h3 className="text-xl font-bold mb-2">من صورة</h3>
                <p className="text-gray-500">ارفع صورة المنتج وسنملأ الباقي</p>
              </button>
              <button
                onClick={() => {
                  setInputType('text');
                  setStep(2);
                }}
                className="p-8 border-2 border-gray-200 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
              >
                <span className="text-6xl block mb-4 group-hover:scale-110 transition-transform">
                  ✍️
                </span>
                <h3 className="text-xl font-bold mb-2">من وصف</h3>
                <p className="text-gray-500">اكتب وصفاً بسيطاً وسنحسّنه</p>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Input */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <button
              onClick={() => {
                setStep(1);
                setInputType(null);
              }}
              className="mb-4 text-gray-500 hover:text-gray-700"
            >
              → رجوع
            </button>

            {inputType === 'image' ? (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  📸 أدخل رابط صورة المنتج
                </h2>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
                  dir="ltr"
                />
                {imageUrl && (
                  <div className="mt-4">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="max-h-64 rounded-xl mx-auto"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  ✍️ صف منتجك
                </h2>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="مثال: آيفون 13 برو ماكس 256 جيجا لون أزرق، حالة ممتازة، مع الكرتونة والشاحن الأصلي، عمره 6 شهور"
                  className="w-full h-40 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 resize-none"
                />
                <p className="text-sm text-gray-500 mt-2">
                  {textInput.length}/200 حرف (الحد الأدنى 10)
                </p>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full mt-6 py-4 bg-gradient-to-l from-violet-500 to-purple-500 text-white rounded-xl font-bold text-lg hover:from-violet-600 hover:to-purple-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري التحليل...
                </>
              ) : (
                <>
                  <span>🤖</span>
                  تحليل بالذكاء الاصطناعي
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && result && editedData && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                ✏️ راجع وعدّل
              </h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                <span>🎯</span>
                دقة التحليل: {Math.round((result.confidence || 0.5) * 100)}%
              </div>
            </div>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  العنوان
                </label>
                <input
                  type="text"
                  value={editedData.title}
                  onChange={(e) =>
                    setEditedData({ ...editedData, title: e.target.value })
                  }
                  className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  الوصف
                </label>
                <textarea
                  value={editedData.description}
                  onChange={(e) =>
                    setEditedData({ ...editedData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Category & Price */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    الفئة
                  </label>
                  <input
                    type="text"
                    value={editedData.category}
                    onChange={(e) =>
                      setEditedData({ ...editedData, category: e.target.value })
                    }
                    className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    السعر التقديري (ج.م)
                  </label>
                  <input
                    type="number"
                    value={editedData.price}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  الوسوم
                </label>
                <div className="flex flex-wrap gap-2">
                  {editedData.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() =>
                          setEditedData({
                            ...editedData,
                            tags: editedData.tags.filter((_, idx) => idx !== i),
                          })
                        }
                        className="hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Detected Info */}
              {(result.brand || result.condition) && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-bold text-sm text-gray-700 mb-2">
                    معلومات مكتشفة:
                  </h4>
                  <div className="flex flex-wrap gap-3 text-sm">
                    {result.brand && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                        🏷️ {result.brand}
                      </span>
                    )}
                    {result.condition && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                        ✨ {result.condition}
                      </span>
                    )}
                    {result.color && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                        🎨 {result.color}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handlePublish}
                disabled={loading}
                className="flex-1 py-4 bg-gradient-to-l from-violet-500 to-purple-500 text-white rounded-xl font-bold text-lg hover:from-violet-600 hover:to-purple-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    جاري النشر...
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    نشر الإعلان
                  </>
                )}
              </button>
              <button
                onClick={handleDiscard}
                className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <span className="text-8xl block mb-6">🎉</span>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              تم نشر إعلانك بنجاح!
            </h2>
            <p className="text-gray-600 mb-6">جاري تحويلك لصفحة الإعلان...</p>
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>

      {/* Features Section */}
      {step === 1 && (
        <section className="max-w-4xl mx-auto px-4 pb-12">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '⚡',
                title: 'سرعة فائقة',
                desc: 'أنشئ إعلانك في أقل من دقيقة',
              },
              {
                icon: '🎯',
                title: 'دقة عالية',
                desc: 'AI يحدد الفئة والسعر تلقائياً',
              },
              {
                icon: '✨',
                title: 'تحسين تلقائي',
                desc: 'وصف احترافي يزيد من المبيعات',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 text-center shadow-sm"
              >
                <span className="text-4xl block mb-3">{feature.icon}</span>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
