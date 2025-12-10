'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import apiClient from '@/lib/api/client';

interface StockItem {
  id: string;
  title: string;
  sku: string | null;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number | null;
  isNegative: boolean;
  isLow: boolean;
  category: string | null;
}

interface StockAdjustment {
  id: string;
  type: string;
  quantityBefore: number;
  quantityChange: number;
  quantityAfter: number;
  reason: string | null;
  createdAt: string;
}

export default function InventoryStockPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [items, setItems] = useState<StockItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'low' | 'negative'>('all');
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);

  // Adjustment form state
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');
  const [adjustmentQty, setAdjustmentQty] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [adjustmentLoading, setAdjustmentLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    negativeCount: 0,
    lowCount: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadInventory();
    }
  }, [user]);

  const loadInventory = async () => {
    try {
      setIsLoading(true);

      // Fetch all inventory items
      const response = await apiClient.get('/inventory?limit=100');
      const inventoryItems = response.data.data.items || [];

      // Map to stock items
      const stockItems: StockItem[] = inventoryItems.map((item: any) => ({
        id: item.id,
        title: item.title,
        sku: item.sku || null,
        stockQuantity: item.stockQuantity || 0,
        reservedQuantity: item.reservedQuantity || 0,
        availableQuantity: (item.stockQuantity || 0) - (item.reservedQuantity || 0),
        lowStockThreshold: item.lowStockThreshold || null,
        isNegative: (item.stockQuantity || 0) < 0,
        isLow: item.lowStockThreshold ? (item.stockQuantity || 0) <= item.lowStockThreshold : false,
        category: item.categoryName || null,
      }));

      setItems(stockItems);

      // Calculate stats
      const negativeCount = stockItems.filter(i => i.isNegative).length;
      const lowCount = stockItems.filter(i => i.isLow && !i.isNegative).length;

      setStats({
        total: stockItems.length,
        negativeCount,
        lowCount,
      });

      setLowStockItems(stockItems.filter(i => i.isNegative || i.isLow));
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdjustStock = async () => {
    if (!selectedItem || !adjustmentQty) return;

    try {
      setAdjustmentLoading(true);

      const quantity = parseInt(adjustmentQty);
      const quantityChange = adjustmentType === 'add' ? quantity : -quantity;

      await apiClient.post(`/inventory/${selectedItem.id}/stock/adjust`, {
        type: adjustmentType === 'add' ? 'MANUAL_ADD' : 'MANUAL_SUBTRACT',
        quantityChange,
        reason: adjustmentReason || undefined,
      });

      // Reload inventory
      await loadInventory();

      // Close modal
      setShowAdjustModal(false);
      setSelectedItem(null);
      setAdjustmentQty('');
      setAdjustmentReason('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'فشل في تعديل المخزون');
    } finally {
      setAdjustmentLoading(false);
    }
  };

  const loadAdjustments = async (itemId: string) => {
    try {
      const response = await apiClient.get(`/inventory/${itemId}/stock/adjustments`);
      setAdjustments(response.data.data.adjustments || []);
    } catch (error) {
      console.error('Failed to load adjustments:', error);
    }
  };

  const getAdjustmentTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'SALE': 'بيع',
      'PURCHASE': 'شراء',
      'MANUAL_ADD': 'إضافة يدوية',
      'MANUAL_SUBTRACT': 'خصم يدوي',
      'RETURN': 'مرتجع',
      'DAMAGE': 'تالف',
      'TRANSFER_IN': 'نقل وارد',
      'TRANSFER_OUT': 'نقل صادر',
      'INITIAL': 'رصيد افتتاحي',
      'CORRECTION': 'تصحيح',
    };
    return labels[type] || type;
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل المخزون...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const filteredItems = activeTab === 'all'
    ? items
    : activeTab === 'negative'
      ? items.filter(i => i.isNegative)
      : items.filter(i => i.isLow && !i.isNegative);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-purple-600 to-indigo-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">إدارة المخزون</h1>
              <p className="text-purple-100">تتبع كميات المنتجات وإدارة المخزون</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/inventory/bulk-import"
                className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition"
              >
                <span>📥</span>
                استيراد مجمع
              </Link>
              <Link
                href="/inventory/add"
                className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition shadow-lg"
              >
                <span>+</span>
                إضافة منتج
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-purple-100">إجمالي المنتجات</div>
            </div>
            <div className={`rounded-xl p-4 ${stats.negativeCount > 0 ? 'bg-red-500/80' : 'bg-white/10'}`}>
              <div className="text-3xl font-bold">{stats.negativeCount}</div>
              <div className={stats.negativeCount > 0 ? 'text-red-100' : 'text-purple-100'}>مخزون سالب</div>
            </div>
            <div className={`rounded-xl p-4 ${stats.lowCount > 0 ? 'bg-yellow-500/80' : 'bg-white/10'}`}>
              <div className="text-3xl font-bold">{stats.lowCount}</div>
              <div className={stats.lowCount > 0 ? 'text-yellow-100' : 'text-purple-100'}>مخزون منخفض</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            الكل ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('low')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'low'
                ? 'bg-yellow-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            منخفض ({stats.lowCount})
          </button>
          <button
            onClick={() => setActiveTab('negative')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'negative'
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            سالب ({stats.negativeCount})
          </button>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">المنتج</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">SKU</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">الكمية</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">محجوز</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">متاح</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">الحالة</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    {activeTab === 'all' ? 'لا توجد منتجات' : 'لا توجد منتجات في هذه الفئة'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{item.title}</div>
                      {item.category && (
                        <div className="text-sm text-gray-500">{item.category}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 font-mono text-sm">
                      {item.sku || '-'}
                    </td>
                    <td className={`px-4 py-3 text-center font-bold ${
                      item.isNegative ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {item.stockQuantity}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {item.reservedQuantity}
                    </td>
                    <td className={`px-4 py-3 text-center font-medium ${
                      item.availableQuantity < 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {item.availableQuantity}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.isNegative ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          سالب
                        </span>
                      ) : item.isLow ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                          منخفض
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          متوفر
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowAdjustModal(true);
                            loadAdjustments(item.id);
                          }}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition"
                        >
                          تعديل
                        </button>
                        <Link
                          href={`/items/${item.id}`}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                        >
                          عرض
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal */}
      {showAdjustModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">تعديل المخزون</h2>
                  <p className="text-gray-600">{selectedItem.title}</p>
                </div>
                <button
                  onClick={() => {
                    setShowAdjustModal(false);
                    setSelectedItem(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Current Stock */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className={`text-2xl font-bold ${selectedItem.isNegative ? 'text-red-600' : 'text-gray-900'}`}>
                      {selectedItem.stockQuantity}
                    </div>
                    <div className="text-sm text-gray-500">الكمية الحالية</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-600">{selectedItem.reservedQuantity}</div>
                    <div className="text-sm text-gray-500">محجوز</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${selectedItem.availableQuantity < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedItem.availableQuantity}
                    </div>
                    <div className="text-sm text-gray-500">متاح</div>
                  </div>
                </div>
              </div>

              {/* Adjustment Form */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setAdjustmentType('add')}
                    className={`flex-1 py-3 rounded-xl font-medium transition ${
                      adjustmentType === 'add'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    + إضافة للمخزون
                  </button>
                  <button
                    onClick={() => setAdjustmentType('subtract')}
                    className={`flex-1 py-3 rounded-xl font-medium transition ${
                      adjustmentType === 'subtract'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    - خصم من المخزون
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الكمية</label>
                  <input
                    type="number"
                    value={adjustmentQty}
                    onChange={(e) => setAdjustmentQty(e.target.value)}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="أدخل الكمية"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السبب (اختياري)</label>
                  <input
                    type="text"
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="مثال: استلام بضاعة جديدة"
                  />
                </div>

                <button
                  onClick={handleAdjustStock}
                  disabled={!adjustmentQty || adjustmentLoading}
                  className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {adjustmentLoading ? 'جاري التعديل...' : 'تأكيد التعديل'}
                </button>
              </div>

              {/* Adjustment History */}
              {adjustments.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">سجل التعديلات</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {adjustments.map((adj) => (
                      <div key={adj.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg text-sm">
                        <div>
                          <span className="font-medium">{getAdjustmentTypeLabel(adj.type)}</span>
                          {adj.reason && <span className="text-gray-500 mr-2">- {adj.reason}</span>}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={adj.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}>
                            {adj.quantityChange > 0 ? '+' : ''}{adj.quantityChange}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {new Date(adj.createdAt).toLocaleDateString('ar-EG')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
