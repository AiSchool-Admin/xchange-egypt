'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getUserESGCertificates,
  verifyESGCertificate,
  ESGCertificate,
} from '@/lib/api/scrap-marketplace';

export default function ESGCertificatesPage() {
  const [tab, setTab] = useState<'my' | 'verify'>('my');
  const [certificates, setCertificates] = useState<ESGCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyNumber, setVerifyNumber] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<ESGCertificate | null | 'not_found'>(null);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const data = await getUserESGCertificates();
      setCertificates(data || []);
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyNumber.trim()) return;

    try {
      setVerifying(true);
      setVerifyResult(null);
      const result = await verifyESGCertificate(verifyNumber.trim());
      setVerifyResult(result || 'not_found');
    } catch (error) {
      setVerifyResult('not_found');
    } finally {
      setVerifying(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-emerald-600 to-teal-600 text-white py-12">
        <div className="container mx-auto px-4">
          <Link href="/scrap" className="text-white/80 hover:text-white mb-4 inline-block">
            &rarr; العودة لسوق التوالف
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-5xl">🌍</div>
            <div>
              <h1 className="text-4xl font-bold mb-2">شهادات ESG البيئية</h1>
              <p className="text-xl opacity-90">
                شهادة تثبت مساهمتك في حماية البيئة من خلال إعادة التدوير
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="bg-emerald-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold">
                {certificates.reduce((sum, c) => sum + c.totalWeightKg, 0).toFixed(0)}
              </div>
              <div className="text-sm opacity-80">كجم تم تدويرها</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {certificates.reduce((sum, c) => sum + c.totalCO2SavedKg, 0).toFixed(1)}
              </div>
              <div className="text-sm opacity-80">كجم CO₂ تم توفيرها</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {certificates.reduce((sum, c) => sum + (c.treesEquivalent || 0), 0).toFixed(0)}
              </div>
              <div className="text-sm opacity-80">شجرة معادلة</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{certificates.length}</div>
              <div className="text-sm opacity-80">شهادة حصلت عليها</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setTab('my')}
              className={`py-4 px-6 font-medium border-b-2 transition ${
                tab === 'my'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              شهاداتي
            </button>
            <button
              onClick={() => setTab('verify')}
              className={`py-4 px-6 font-medium border-b-2 transition ${
                tab === 'verify'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              التحقق من شهادة
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {tab === 'my' ? (
          /* My Certificates */
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : certificates.length > 0 ? (
              <div className="space-y-6">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-white rounded-xl shadow-sm overflow-hidden"
                  >
                    {/* Certificate Header */}
                    <div className="bg-gradient-to-l from-emerald-600 to-teal-600 text-white p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm opacity-80 mb-1">شهادة ESG</div>
                          <div className="text-xl font-bold">{cert.certificateNumber}</div>
                        </div>
                        <div className="text-left">
                          <div className="text-sm opacity-80">تاريخ الإصدار</div>
                          <div>{formatDate(cert.issuedAt)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Certificate Body */}
                    <div className="p-6">
                      {/* Impact */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-emerald-50 rounded-lg">
                          <div className="text-2xl mb-1">⚖️</div>
                          <div className="text-2xl font-bold text-emerald-700">
                            {cert.totalWeightKg.toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-500">كجم</div>
                        </div>
                        <div className="text-center p-4 bg-emerald-50 rounded-lg">
                          <div className="text-2xl mb-1">🌫️</div>
                          <div className="text-2xl font-bold text-emerald-700">
                            {cert.totalCO2SavedKg.toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-500">كجم CO₂</div>
                        </div>
                        {cert.treesEquivalent && (
                          <div className="text-center p-4 bg-emerald-50 rounded-lg">
                            <div className="text-2xl mb-1">🌳</div>
                            <div className="text-2xl font-bold text-emerald-700">
                              {cert.treesEquivalent.toFixed(0)}
                            </div>
                            <div className="text-sm text-gray-500">شجرة</div>
                          </div>
                        )}
                        {cert.waterSavedLiters && (
                          <div className="text-center p-4 bg-emerald-50 rounded-lg">
                            <div className="text-2xl mb-1">💧</div>
                            <div className="text-2xl font-bold text-emerald-700">
                              {cert.waterSavedLiters.toFixed(0)}
                            </div>
                            <div className="text-sm text-gray-500">لتر ماء</div>
                          </div>
                        )}
                      </div>

                      {/* Materials */}
                      <div className="mb-6">
                        <h4 className="font-medium mb-3">المواد المعاد تدويرها</h4>
                        <div className="flex flex-wrap gap-2">
                          {cert.materials.map((m, i) => (
                            <span
                              key={i}
                              className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                            >
                              {m.materialType}: {m.weightKg} كجم
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        {cert.pdfUrl && (
                          <a
                            href={cert.pdfUrl}
                            target="_blank"
                            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                          >
                            <span>📄</span>
                            <span>تحميل PDF</span>
                          </a>
                        )}
                        <button
                          onClick={() => {
                            navigator.share?.({
                              title: 'شهادة ESG البيئية',
                              text: `حصلت على شهادة ESG! وفرت ${cert.totalCO2SavedKg.toFixed(1)} كجم من CO₂`,
                              url: window.location.href,
                            });
                          }}
                          className="flex items-center gap-2 border border-emerald-600 text-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-50"
                        >
                          <span>📤</span>
                          <span>مشاركة</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl">
                <div className="text-6xl mb-4">🌱</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  لم تحصل على شهادات بعد
                </h3>
                <p className="text-gray-500 mb-6">
                  قم ببيع الخردة واحصل على شهادة ESG تثبت مساهمتك البيئية
                </p>
                <Link
                  href="/scrap/collection"
                  className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700"
                >
                  اطلب جمع الآن
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* Verify Certificate */
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6 text-center">التحقق من شهادة ESG</h2>

              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-2">رقم الشهادة</label>
                  <input
                    type="text"
                    value={verifyNumber}
                    onChange={(e) => setVerifyNumber(e.target.value)}
                    placeholder="مثال: ESG-2024-XXXXX"
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>

                <button
                  onClick={handleVerify}
                  disabled={verifying || !verifyNumber.trim()}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {verifying ? 'جاري التحقق...' : 'تحقق'}
                </button>
              </div>

              {/* Verify Result */}
              {verifyResult && (
                <div className="mt-6">
                  {verifyResult === 'not_found' ? (
                    <div className="p-4 bg-red-50 rounded-lg text-center">
                      <div className="text-4xl mb-2">❌</div>
                      <div className="font-medium text-red-700">
                        الشهادة غير موجودة أو غير صالحة
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-center mb-4">
                        <div className="text-4xl mb-2">✅</div>
                        <div className="font-bold text-green-700">شهادة صالحة ومعتمدة</div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">رقم الشهادة:</span>
                          <span className="font-medium">{verifyResult.certificateNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">تاريخ الإصدار:</span>
                          <span className="font-medium">{formatDate(verifyResult.issuedAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">الوزن الإجمالي:</span>
                          <span className="font-medium">{verifyResult.totalWeightKg} كجم</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">CO₂ الموفر:</span>
                          <span className="font-medium text-green-600">
                            {verifyResult.totalCO2SavedKg.toFixed(1)} كجم
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-emerald-50 rounded-lg text-sm">
              <h3 className="font-bold text-emerald-800 mb-2">ما هي شهادة ESG؟</h3>
              <p className="text-emerald-700 leading-relaxed">
                شهادة ESG (البيئة والمجتمع والحوكمة) هي وثيقة رسمية تثبت مساهمتك في حماية
                البيئة من خلال إعادة تدوير المواد. تحتوي الشهادة على معلومات عن كمية المواد
                المعاد تدويرها وكمية ثاني أكسيد الكربون التي تم توفيرها.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
