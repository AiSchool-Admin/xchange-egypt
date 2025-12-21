/**
 * صفحة الملف الشخصي للمورد
 * Vendor Profile Page
 * سوق المناقصات - Xchange Egypt
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// ==================== Types ====================
interface Vendor {
  id: string;
  name: string;
  logo?: string;
  businessType: 'INDIVIDUAL' | 'COMPANY' | 'FACTORY' | 'AGENCY';
  description: string;
  establishedYear: number;
  employeeCount: string;
  annualRevenue: string;
  isVerified: boolean;
  verificationLevel: 'BASIC' | 'STANDARD' | 'PREMIUM';

  // Trust Score
  trustScore: number;
  trustScoreBreakdown: {
    deliveryRate: number;
    qualityRating: number;
    communicationRating: number;
    disputeRate: number;
  };

  // Statistics
  stats: {
    totalBids: number;
    wonTenders: number;
    completedContracts: number;
    activeContracts: number;
    totalContractValue: number;
    avgDeliveryTime: number;
    onTimeDeliveryRate: number;
  };

  // Categories
  categories: string[];
  governorates: string[];

  // Contact
  contact: {
    phone: string;
    email: string;
    website?: string;
    address: string;
  };

  // Documents
  documents: {
    commercialRegister: boolean;
    taxCard: boolean;
    socialInsurance: boolean;
    qualityCertificates: string[];
  };

  // Portfolio
  portfolio: PortfolioItem[];

  // Reviews
  reviews: Review[];

  memberSince: string;
  lastActive: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  clientName: string;
  completionDate: string;
  value: number;
  images: string[];
}

interface Review {
  id: string;
  reviewerName: string;
  reviewerType: string;
  rating: number;
  comment: string;
  projectTitle: string;
  date: string;
  response?: string;
}

// ==================== Component ====================
export default function VendorProfilePage() {
  const params = useParams();
  const vendorId = params?.id as string;

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadVendorData();
  }, [vendorId]);

  const loadVendorData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockVendor: Vendor = {
      id: vendorId,
      name: 'شركة النور للتقنية والتوريدات',
      logo: '/logos/alnoor.png',
      businessType: 'COMPANY',
      description: 'شركة رائدة في مجال توريد أجهزة الحاسب الآلي والمعدات التقنية للقطاعين الحكومي والخاص. نقدم حلولاً متكاملة تشمل التوريد والتركيب والصيانة والدعم الفني.',
      establishedYear: 2010,
      employeeCount: '50-100',
      annualRevenue: '10-50 مليون',
      isVerified: true,
      verificationLevel: 'PREMIUM',
      trustScore: 92,
      trustScoreBreakdown: {
        deliveryRate: 95,
        qualityRating: 90,
        communicationRating: 88,
        disputeRate: 3,
      },
      stats: {
        totalBids: 156,
        wonTenders: 42,
        completedContracts: 38,
        activeContracts: 4,
        totalContractValue: 12500000,
        avgDeliveryTime: 21,
        onTimeDeliveryRate: 95,
      },
      categories: ['معدات تقنية المعلومات', 'الأثاث والتجهيزات', 'الصيانة'],
      governorates: ['القاهرة', 'الجيزة', 'الإسكندرية', 'الشرقية'],
      contact: {
        phone: '+20 2 1234 5678',
        email: 'info@alnoor-tech.com',
        website: 'www.alnoor-tech.com',
        address: 'المعادي، القاهرة، مصر',
      },
      documents: {
        commercialRegister: true,
        taxCard: true,
        socialInsurance: true,
        qualityCertificates: ['ISO 9001:2015', 'ISO 14001:2015'],
      },
      portfolio: [
        {
          id: '1',
          title: 'توريد 500 جهاز حاسب آلي لوزارة التربية والتعليم',
          description: 'توريد وتركيب أجهزة حاسب آلي محمولة ومكتبية مع ضمان 3 سنوات',
          category: 'IT_EQUIPMENT',
          clientName: 'وزارة التربية والتعليم',
          completionDate: '2023-08',
          value: 3500000,
          images: [],
        },
        {
          id: '2',
          title: 'تجهيز مركز بيانات جامعة القاهرة',
          description: 'توريد وتركيب خوادم ومعدات شبكات وأنظمة تبريد',
          category: 'IT_EQUIPMENT',
          clientName: 'جامعة القاهرة',
          completionDate: '2023-05',
          value: 5200000,
          images: [],
        },
        {
          id: '3',
          title: 'توريد أثاث مكتبي لفروع البنك الأهلي',
          description: 'توريد أثاث مكتبي لـ 15 فرع جديد',
          category: 'FURNITURE',
          clientName: 'البنك الأهلي المصري',
          completionDate: '2023-02',
          value: 2800000,
          images: [],
        },
      ],
      reviews: [
        {
          id: '1',
          reviewerName: 'م. أحمد محمود',
          reviewerType: 'جهة حكومية',
          rating: 5,
          comment: 'تعامل ممتاز والتزام بالمواعيد. جودة المنتجات عالية والدعم الفني سريع.',
          projectTitle: 'توريد أجهزة حاسب آلي',
          date: '2024-01-15',
          response: 'شكراً لثقتكم. سعداء بخدمتكم دائماً.',
        },
        {
          id: '2',
          reviewerName: 'شركة مصر للتأمين',
          reviewerType: 'شركة خاصة',
          rating: 4,
          comment: 'خدمة جيدة وأسعار منافسة. كان هناك تأخير بسيط في التسليم لكن تم التعويض.',
          projectTitle: 'تجهيز مكاتب',
          date: '2023-11-20',
        },
        {
          id: '3',
          reviewerName: 'د. سارة حسن',
          reviewerType: 'جهة حكومية',
          rating: 5,
          comment: 'من أفضل الموردين الذين تعاملنا معهم. احترافية عالية في التعامل.',
          projectTitle: 'توريد معدات طبية',
          date: '2023-09-05',
        },
      ],
      memberSince: '2018-03-15',
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    };

    setVendor(mockVendor);
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
    });
  };

  const getVerificationBadge = (level: string) => {
    const config = {
      BASIC: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'موثق' },
      STANDARD: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'موثق معتمد' },
      PREMIUM: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'موثق متميز' },
    };
    const { bg, text, label } = config[level as keyof typeof config] || config.BASIC;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${bg} ${text} flex items-center gap-1`}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        {label}
      </span>
    );
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل بيانات المورد...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-600 text-lg">لم يتم العثور على المورد</p>
          <Link href="/vendors" className="mt-4 text-emerald-600 hover:underline">
            العودة إلى قائمة الموردين
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/vendors" className="text-gray-500 hover:text-gray-700 ml-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <h1 className="text-lg font-medium text-gray-900">الملف الشخصي للمورد</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-l from-emerald-500 to-teal-600 h-32"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16">
              {/* Logo */}
              <div className="w-32 h-32 bg-white rounded-xl border-4 border-white shadow-lg flex items-center justify-center">
                {vendor.logo ? (
                  <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className="text-4xl font-bold text-emerald-600">{vendor.name.charAt(0)}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
                  {vendor.isVerified && getVerificationBadge(vendor.verificationLevel)}
                </div>
                <p className="text-gray-500">
                  {vendor.businessType === 'COMPANY' ? 'شركة' :
                   vendor.businessType === 'FACTORY' ? 'مصنع' :
                   vendor.businessType === 'AGENCY' ? 'وكالة' : 'فردي'}
                  {' • '}تأسست عام {vendor.establishedYear}
                  {' • '}{vendor.employeeCount} موظف
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {vendor.categories.map((cat, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Trust Score */}
              <div className="text-center bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">درجة الثقة</p>
                <p className={`text-4xl font-bold ${getTrustScoreColor(vendor.trustScore)}`}>
                  {vendor.trustScore}
                </p>
                <div className="flex justify-center mt-1">
                  {renderStars(Math.round(vendor.trustScore / 20))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-xl border">
              <div className="border-b px-4">
                <nav className="flex gap-6">
                  {[
                    { id: 'overview', label: 'نظرة عامة' },
                    { id: 'portfolio', label: 'الأعمال السابقة' },
                    { id: 'reviews', label: 'التقييمات' },
                    { id: 'documents', label: 'الوثائق' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-emerald-500 text-emerald-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">نبذة عن الشركة</h3>
                      <p className="text-gray-600 leading-relaxed">{vendor.description}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-emerald-600">{vendor.stats.completedContracts}</p>
                        <p className="text-sm text-gray-500">عقد منجز</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">{vendor.stats.wonTenders}</p>
                        <p className="text-sm text-gray-500">مناقصة فائزة</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-purple-600">{vendor.stats.onTimeDeliveryRate}%</p>
                        <p className="text-sm text-gray-500">تسليم في الموعد</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-orange-600">{vendor.stats.avgDeliveryTime}</p>
                        <p className="text-sm text-gray-500">متوسط أيام التسليم</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">تحليل درجة الثقة</h3>
                      <div className="space-y-3">
                        {[
                          { label: 'معدل التسليم', value: vendor.trustScoreBreakdown.deliveryRate },
                          { label: 'جودة المنتجات', value: vendor.trustScoreBreakdown.qualityRating },
                          { label: 'التواصل', value: vendor.trustScoreBreakdown.communicationRating },
                        ].map(item => (
                          <div key={item.label}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">{item.label}</span>
                              <span className="font-medium">{item.value}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-emerald-500 h-2 rounded-full"
                                style={{ width: `${item.value}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">مناطق الخدمة</h3>
                      <div className="flex flex-wrap gap-2">
                        {vendor.governorates.map((gov, idx) => (
                          <span key={idx} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                            {gov}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Portfolio Tab */}
                {activeTab === 'portfolio' && (
                  <div className="space-y-4">
                    {vendor.portfolio.map(item => (
                      <div key={item.id} className="border rounded-lg p-4 hover:border-emerald-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-gray-900">{item.title}</h4>
                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                              <span>العميل: {item.clientName}</span>
                              <span>|</span>
                              <span>{formatDate(item.completionDate)}</span>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="text-lg font-bold text-emerald-600">{formatCurrency(item.value)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {/* Review Summary */}
                    <div className="bg-emerald-50 rounded-lg p-4 flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-emerald-600">
                          {(vendor.reviews.reduce((sum, r) => sum + r.rating, 0) / vendor.reviews.length).toFixed(1)}
                        </p>
                        <div className="flex justify-center mt-1">
                          {renderStars(Math.round(vendor.reviews.reduce((sum, r) => sum + r.rating, 0) / vendor.reviews.length))}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{vendor.reviews.length} تقييم</p>
                      </div>
                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map(stars => {
                          const count = vendor.reviews.filter(r => r.rating === stars).length;
                          const percentage = (count / vendor.reviews.length) * 100;
                          return (
                            <div key={stars} className="flex items-center gap-2">
                              <span className="text-sm text-gray-500 w-12">{stars} نجوم</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-yellow-400 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-500 w-8">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Individual Reviews */}
                    {vendor.reviews.map(review => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium text-gray-900">{review.reviewerName}</p>
                            <p className="text-sm text-gray-500">{review.reviewerType}</p>
                          </div>
                          <div className="text-left">
                            {renderStars(review.rating)}
                            <p className="text-xs text-gray-400 mt-1">{formatDate(review.date)}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">المشروع: {review.projectTitle}</p>
                        <p className="text-gray-700">{review.comment}</p>
                        {review.response && (
                          <div className="mt-3 bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-500 mb-1">رد المورد:</p>
                            <p className="text-sm text-gray-700">{review.response}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className={`border rounded-lg p-4 ${vendor.documents.commercialRegister ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                          {vendor.documents.commercialRegister ? (
                            <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          )}
                          <span className="font-medium text-gray-900">السجل التجاري</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          {vendor.documents.commercialRegister ? 'تم التحقق' : 'لم يتم الرفع'}
                        </p>
                      </div>

                      <div className={`border rounded-lg p-4 ${vendor.documents.taxCard ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                          {vendor.documents.taxCard ? (
                            <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          )}
                          <span className="font-medium text-gray-900">البطاقة الضريبية</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          {vendor.documents.taxCard ? 'تم التحقق' : 'لم يتم الرفع'}
                        </p>
                      </div>

                      <div className={`border rounded-lg p-4 ${vendor.documents.socialInsurance ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                          {vendor.documents.socialInsurance ? (
                            <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          )}
                          <span className="font-medium text-gray-900">شهادة التأمينات</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          {vendor.documents.socialInsurance ? 'تم التحقق' : 'لم يتم الرفع'}
                        </p>
                      </div>
                    </div>

                    {vendor.documents.qualityCertificates.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">شهادات الجودة</h4>
                        <div className="flex flex-wrap gap-2">
                          {vendor.documents.qualityCertificates.map((cert, idx) => (
                            <span key={idx} className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-center gap-2">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-bold text-gray-900 mb-4">معلومات الاتصال</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-600" dir="ltr">{vendor.contact.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600">{vendor.contact.email}</span>
                </div>
                {vendor.contact.website && (
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <a href={`https://${vendor.contact.website}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                      {vendor.contact.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-600">{vendor.contact.address}</span>
                </div>
              </div>

              <button className="w-full mt-4 px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">
                تواصل مع المورد
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-bold text-gray-900 mb-4">إحصائيات سريعة</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">إجمالي قيمة العقود</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(vendor.stats.totalContractValue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">معدل الفوز</span>
                  <span className="font-bold text-blue-600">
                    {Math.round((vendor.stats.wonTenders / vendor.stats.totalBids) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">العقود النشطة</span>
                  <span className="font-bold text-purple-600">{vendor.stats.activeContracts}</span>
                </div>
              </div>
            </div>

            {/* Member Info */}
            <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-500">
              <p>عضو منذ {formatDate(vendor.memberSince)}</p>
              <p className="mt-1">آخر نشاط: منذ ساعتين</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
