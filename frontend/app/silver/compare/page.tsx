'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api';

const PURITY_LABELS: Record<string, string> = {
  S999: 'فضة نقية 999',
  S925: 'استرليني 925',
  S900: 'فضة 900',
  S800: 'فضة 800',
};

const CONDITION_LABELS: Record<string, string> = {
  EXCELLENT: 'ممتازة',
  GOOD: 'جيدة',
  FAIR: 'مقبولة',
};

export default function SilverComparePage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];
    if (ids.length > 0) {
      setSelectedIds(ids);
      fetchCompareItems(ids);
    } else {
      setLoading(false);
      setShowSelector(true);
    }
    fetchAllItems();
  }, [searchParams]);

  const fetchCompareItems = async (ids: string[]) => {
    try {
      const res = await apiClient.post('/silver/compare', { itemIds: ids });
      setItems(res.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllItems = async () => {
    try {
      const res = await apiClient.get('/silver/items?limit=20&status=ACTIVE');
      setAllItems(res.data.data?.items || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleItem = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else if (selectedIds.length < 5) {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const startCompare = () => {
    if (selectedIds.length >= 2) {
      fetchCompareItems(selectedIds);
      setShowSelector(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">مقارنة القطع</h1>
            <p className="text-gray-600">قارن حتى 5 قطع جنباً إلى جنب</p>
          </div>
          <button
            onClick={() => setShowSelector(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            + إضافة قطعة
          </button>
        </div>

        {/* No items selected */}
        {items.length === 0 && !showSelector && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">⚖️</div>
            <h2 className="text-xl font-bold mb-2">اختر قطعتين على الأقل للمقارنة</h2>
            <p className="text-gray-600 mb-6">قارن الأسعار والوزن والنقاء والمزيد</p>
            <button
              onClick={() => setShowSelector(true)}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg"
            >
              اختر القطع
            </button>
          </div>
        )}

        {/* Comparison Table */}
        {items.length >= 2 && (
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-right w-40">المواصفات</th>
                  {items.map((item) => (
                    <th key={item.id} className="p-4 text-center min-w-[200px]">
                      <div className="relative">
                        <button
                          onClick={() => {
                            setSelectedIds(prev => prev.filter(id => id !== item.id));
                            setItems(prev => prev.filter(i => i.id !== item.id));
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm"
                        >
                          ×
                        </button>
                        <img
                          src={item.images?.[0] || '/placeholder.jpg'}
                          alt={item.title}
                          className="w-32 h-32 object-cover rounded-lg mx-auto mb-2"
                        />
                        <Link href={`/silver/${item.id}`} className="font-semibold hover:text-gray-600">
                          {item.title}
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price */}
                <tr className="border-b bg-gray-50">
                  <td className="p-4 font-semibold">السعر</td>
                  {items.map((item) => (
                    <td key={item.id} className="p-4 text-center">
                      <span className="text-xl font-bold text-gray-600">
                        {item.askingPrice?.toLocaleString()} ج.م
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Buyer Pays */}
                <tr className="border-b">
                  <td className="p-4 font-semibold">المشتري يدفع</td>
                  {items.map((item) => (
                    <td key={item.id} className="p-4 text-center">
                      <span className="font-bold">
                        {item.buyerPays?.toLocaleString()} ج.م
                      </span>
                      <p className="text-sm text-gray-500">(شامل 2% عمولة)</p>
                    </td>
                  ))}
                </tr>

                {/* Savings */}
                <tr className="border-b bg-green-50">
                  <td className="p-4 font-semibold">التوفير مقارنة بالجديد</td>
                  {items.map((item) => (
                    <td key={item.id} className="p-4 text-center">
                      <span className="text-lg font-bold text-green-600">
                        {item.savings?.toLocaleString()} ج.م
                      </span>
                      <p className="text-green-600">({item.savingsPercent}%)</p>
                    </td>
                  ))}
                </tr>

                {/* Weight */}
                <tr className="border-b">
                  <td className="p-4 font-semibold">الوزن</td>
                  {items.map((item) => (
                    <td key={item.id} className="p-4 text-center font-bold">
                      {item.weightGrams} جرام
                    </td>
                  ))}
                </tr>

                {/* Price per Gram */}
                <tr className="border-b bg-gray-50">
                  <td className="p-4 font-semibold">السعر/جرام</td>
                  {items.map((item) => (
                    <td key={item.id} className="p-4 text-center">
                      {(item.askingPrice / item.weightGrams).toFixed(2)} ج.م/جرام
                    </td>
                  ))}
                </tr>

                {/* Purity */}
                <tr className="border-b">
                  <td className="p-4 font-semibold">النقاء</td>
                  {items.map((item) => (
                    <td key={item.id} className="p-4 text-center">
                      <span className="px-3 py-1 bg-gray-100 rounded-full">
                        {PURITY_LABELS[item.purity] || item.purity}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Condition */}
                <tr className="border-b bg-gray-50">
                  <td className="p-4 font-semibold">الحالة</td>
                  {items.map((item) => (
                    <td key={item.id} className="p-4 text-center">
                      {CONDITION_LABELS[item.condition] || item.condition}
                    </td>
                  ))}
                </tr>

                {/* Verification */}
                <tr className="border-b">
                  <td className="p-4 font-semibold">التحقق</td>
                  {items.map((item) => (
                    <td key={item.id} className="p-4 text-center">
                      {item.verificationLevel === 'CERTIFIED' ? (
                        <span className="text-green-600">✓ موثق</span>
                      ) : item.verificationLevel === 'VERIFIED' ? (
                        <span className="text-blue-600">✓ تم التحقق</span>
                      ) : (
                        <span className="text-gray-500">أساسي</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Location */}
                <tr className="border-b bg-gray-50">
                  <td className="p-4 font-semibold">الموقع</td>
                  {items.map((item) => (
                    <td key={item.id} className="p-4 text-center">
                      {item.governorate || 'غير محدد'}
                    </td>
                  ))}
                </tr>

                {/* Seller Rating */}
                <tr className="border-b">
                  <td className="p-4 font-semibold">تقييم البائع</td>
                  {items.map((item) => (
                    <td key={item.id} className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span>{item.seller?.rating?.toFixed(1) || '-'}</span>
                        <span className="text-gray-500 text-sm">
                          ({item.seller?.totalReviews || 0})
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Barter */}
                <tr className="border-b bg-gray-50">
                  <td className="p-4 font-semibold">قابل للمقايضة</td>
                  {items.map((item) => (
                    <td key={item.id} className="p-4 text-center">
                      {item.allowBarter ? (
                        <span className="text-green-600">✓ نعم</span>
                      ) : (
                        <span className="text-gray-500">لا</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Actions */}
                <tr>
                  <td className="p-4"></td>
                  {items.map((item) => (
                    <td key={item.id} className="p-4 text-center">
                      <Link
                        href={`/silver/${item.id}/purchase`}
                        className="block w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        اشتري الآن
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Item Selector Modal */}
        {showSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">اختر القطع للمقارنة</h2>
                <button onClick={() => setShowSelector(false)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>

              <p className="text-gray-600 mb-4">
                تم اختيار {selectedIds.length} من 5
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto mb-4">
                {allItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      selectedIds.includes(item.id)
                        ? 'border-gray-600 ring-2 ring-gray-600'
                        : 'hover:border-gray-400'
                    }`}
                  >
                    <div className="relative">
                      {selectedIds.includes(item.id) && (
                        <div className="absolute top-0 right-0 w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm">
                          ✓
                        </div>
                      )}
                      <img
                        src={item.images?.[0] || '/placeholder.jpg'}
                        alt={item.title}
                        className="w-full aspect-square object-cover rounded-lg mb-2"
                      />
                    </div>
                    <p className="font-semibold text-sm truncate">{item.title}</p>
                    <p className="text-gray-600">{item.askingPrice} ج.م</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowSelector(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  onClick={startCompare}
                  disabled={selectedIds.length < 2}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-lg disabled:bg-gray-300"
                >
                  مقارنة ({selectedIds.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
