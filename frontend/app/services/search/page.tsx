'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

// Sample search results
const SAMPLE_RESULTS = [
  { id: '1', name: 'محمد الفني', service: 'كهرباء منازل', category: 'home', rating: 4.9, reviews: 156, price: 150 },
  { id: '2', name: 'أحمد السباك', service: 'سباكة', category: 'home', rating: 4.8, reviews: 203, price: 120 },
  { id: '3', name: 'سارة المصممة', service: 'تصميم جرافيك', category: 'tech', rating: 5.0, reviews: 89, price: 200 },
  { id: '4', name: 'كريم المعلم', service: 'دروس رياضيات', category: 'education', rating: 4.7, reviews: 124, price: 180 },
  { id: '5', name: 'نور الدين', service: 'صيانة موبايل', category: 'tech', rating: 4.6, reviews: 98, price: 100 },
  { id: '6', name: 'فاطمة محمد', service: 'تجميل', category: 'beauty', rating: 4.9, reviews: 167, price: 160 },
];

export default function ServicesSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/services/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const filteredResults = SAMPLE_RESULTS.filter(
    (r) => r.name.includes(query) || r.service.includes(query)
  );

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <section className="bg-gradient-to-r from-indigo-600 to-blue-600 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-2 text-white/70 text-sm mb-4">
            <Link href="/" className="hover:text-white">الرئيسية</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-white">الخدمات</Link>
            <span>/</span>
            <span className="text-white">البحث</span>
          </nav>

          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن خدمة..."
                className="w-full px-6 py-4 pr-14 bg-white rounded-xl text-gray-800 placeholder-gray-400 shadow-lg focus:ring-4 focus:ring-white/30 outline-none"
              />
              <button
                type="submit"
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-gray-600 mb-6">
            {query && (
              <>
                نتائج البحث عن "<span className="font-bold text-gray-900">{query}</span>" -
                <span className="font-bold text-gray-900"> {filteredResults.length}</span> نتيجة
              </>
            )}
          </p>

          {filteredResults.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResults.map((result) => (
                <div
                  key={result.id}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center text-xl">
                      👨‍🔧
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{result.name}</h3>
                      <p className="text-sm text-gray-500">{result.service}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-amber-500 font-bold">⭐ {result.rating}</span>
                    <span className="text-gray-500 text-sm">{result.reviews} مراجعة</span>
                    <span className="text-green-600 font-bold">{result.price} ج.م</span>
                  </div>

                  <Link
                    href={`/services/provider/${result.id}`}
                    className="block w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-center hover:bg-indigo-700 transition-colors"
                  >
                    عرض الملف
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">لا توجد نتائج</h2>
              <p className="text-gray-500 mb-6">جرب البحث بكلمات مختلفة</p>
              <Link href="/services" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                تصفح جميع الخدمات
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
