'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

// Egyptian governorates with both Arabic and English names
const EGYPTIAN_GOVERNORATES = [
  { ar: 'القاهرة', en: 'Cairo' },
  { ar: 'الجيزة', en: 'Giza' },
  { ar: 'الإسكندرية', en: 'Alexandria' },
  { ar: 'الدقهلية', en: 'Dakahlia' },
  { ar: 'البحر الأحمر', en: 'Red Sea' },
  { ar: 'البحيرة', en: 'Beheira' },
  { ar: 'الفيوم', en: 'Fayoum' },
  { ar: 'الغربية', en: 'Gharbiya' },
  { ar: 'الإسماعيلية', en: 'Ismailia' },
  { ar: 'المنوفية', en: 'Menofia' },
  { ar: 'المنيا', en: 'Minya' },
  { ar: 'القليوبية', en: 'Qaliubiya' },
  { ar: 'الوادي الجديد', en: 'New Valley' },
  { ar: 'السويس', en: 'Suez' },
  { ar: 'أسوان', en: 'Aswan' },
  { ar: 'أسيوط', en: 'Assiut' },
  { ar: 'بني سويف', en: 'Beni Suef' },
  { ar: 'بورسعيد', en: 'Port Said' },
  { ar: 'دمياط', en: 'Damietta' },
  { ar: 'الشرقية', en: 'Sharkia' },
  { ar: 'جنوب سيناء', en: 'South Sinai' },
  { ar: 'كفر الشيخ', en: 'Kafr El Sheikh' },
  { ar: 'مطروح', en: 'Matrouh' },
  { ar: 'الأقصر', en: 'Luxor' },
  { ar: 'قنا', en: 'Qena' },
  { ar: 'شمال سيناء', en: 'North Sinai' },
  { ar: 'سوهاج', en: 'Sohag' },
];

// Translations
const translations = {
  ar: {
    // Page
    pageTitle: 'الملف الشخصي',
    pageSubtitle: 'إدارة بياناتك الشخصية وعناوينك',
    backToDashboard: '← العودة للوحة التحكم',

    // Tabs
    personalInfo: 'البيانات الشخصية',
    addresses: 'العناوين',

    // Personal Info
    fullName: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    phoneHint: 'مثال: 01012345678',
    businessName: 'اسم النشاط التجاري',
    taxId: 'الرقم الضريبي',
    commercialRegNo: 'رقم السجل التجاري',
    accountType: 'نوع الحساب',
    individual: 'فردي',
    business: 'تجاري',
    memberSince: 'عضو منذ',

    // Address Section
    primaryAddress: 'العنوان الأساسي',
    primaryAddressHint: 'يُستخدم كعنوان افتراضي للشحن',
    savedAddresses: 'العناوين المحفوظة',
    addNewAddress: 'إضافة عنوان جديد',
    noSavedAddresses: 'لا توجد عناوين محفوظة',
    addressName: 'اسم العنوان',
    addressNamePlaceholder: 'مثال: المنزل، العمل، منزل العائلة',
    governorate: 'المحافظة',
    city: 'المدينة',
    district: 'الحي',
    street: 'الشارع',
    buildingNo: 'رقم المبنى',
    floor: 'الطابق',
    apartment: 'رقم الشقة',
    landmark: 'علامة مميزة',
    landmarkPlaceholder: 'مثال: بجوار مسجد الرحمن',
    selectGovernorate: 'اختر المحافظة',
    setAsPrimary: 'تعيين كعنوان أساسي',
    deleteAddress: 'حذف العنوان',
    editAddress: 'تعديل',

    // GPS
    detectLocation: 'تحديد موقعي بـ GPS',
    detectingLocation: 'جاري تحديد الموقع...',
    locationDetected: 'تم تحديد الموقع بنجاح',
    locationError: 'تعذر تحديد الموقع',
    locationPermissionDenied: 'تم رفض إذن الموقع',

    // Buttons
    save: 'حفظ التغييرات',
    saving: 'جاري الحفظ...',
    cancel: 'إلغاء',
    edit: 'تعديل',
    delete: 'حذف',
    add: 'إضافة',

    // Messages
    saveSuccess: 'تم حفظ التغييرات بنجاح',
    saveError: 'حدث خطأ أثناء الحفظ',
    deleteConfirm: 'هل أنت متأكد من حذف هذا العنوان؟',
    required: '*',
    optional: '(اختياري)',
  },
  en: {
    // Page
    pageTitle: 'Profile',
    pageSubtitle: 'Manage your personal information and addresses',
    backToDashboard: '→ Back to Dashboard',

    // Tabs
    personalInfo: 'Personal Info',
    addresses: 'Addresses',

    // Personal Info
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone Number',
    phoneHint: 'e.g., 01012345678',
    businessName: 'Business Name',
    taxId: 'Tax ID',
    commercialRegNo: 'Commercial Reg. No.',
    accountType: 'Account Type',
    individual: 'Individual',
    business: 'Business',
    memberSince: 'Member since',

    // Address Section
    primaryAddress: 'Primary Address',
    primaryAddressHint: 'Used as default shipping address',
    savedAddresses: 'Saved Addresses',
    addNewAddress: 'Add New Address',
    noSavedAddresses: 'No saved addresses',
    addressName: 'Address Name',
    addressNamePlaceholder: 'e.g., Home, Work, Family House',
    governorate: 'Governorate',
    city: 'City',
    district: 'District',
    street: 'Street',
    buildingNo: 'Building No.',
    floor: 'Floor',
    apartment: 'Apartment No.',
    landmark: 'Landmark',
    landmarkPlaceholder: 'e.g., Next to Al-Rahman Mosque',
    selectGovernorate: 'Select Governorate',
    setAsPrimary: 'Set as Primary',
    deleteAddress: 'Delete Address',
    editAddress: 'Edit',

    // GPS
    detectLocation: 'Detect Location with GPS',
    detectingLocation: 'Detecting location...',
    locationDetected: 'Location detected successfully',
    locationError: 'Could not detect location',
    locationPermissionDenied: 'Location permission denied',

    // Buttons
    save: 'Save Changes',
    saving: 'Saving...',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',

    // Messages
    saveSuccess: 'Changes saved successfully',
    saveError: 'Error saving changes',
    deleteConfirm: 'Are you sure you want to delete this address?',
    required: '*',
    optional: '(optional)',
  },
};

type Language = 'ar' | 'en';

interface Address {
  id: string;
  name: string;
  governorate: string;
  city: string;
  district: string;
  street: string;
  buildingNo?: string;
  floor?: string;
  apartment?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  isPrimary: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, updateUser } = useAuth();

  // Language state
  const [lang, setLang] = useState<Language>('ar');
  const t = translations[lang];
  const isRTL = lang === 'ar';

  // Tabs
  const [activeTab, setActiveTab] = useState<'personal' | 'addresses'>('personal');

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    businessName: '',
    taxId: '',
    commercialRegNo: '',
  });

  // Primary address
  const [primaryAddress, setPrimaryAddress] = useState<Partial<Address>>({
    governorate: '',
    city: '',
    district: '',
    street: '',
    buildingNo: '',
    floor: '',
    apartment: '',
    landmark: '',
  });

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    name: '',
    governorate: '',
    city: '',
    district: '',
    street: '',
    buildingNo: '',
    floor: '',
    apartment: '',
    landmark: '',
    isPrimary: false,
  });

  // UI states
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsTarget, setGpsTarget] = useState<'primary' | 'new' | null>(null);

  // Load user data
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        businessName: user.businessName || '',
        taxId: user.taxId || '',
        commercialRegNo: user.commercialRegNo || '',
      });

      setPrimaryAddress({
        governorate: user.governorate || '',
        city: user.city || '',
        district: user.district || '',
        street: user.street || '',
      });

      // Load saved addresses from localStorage (in real app, this would be from API)
      const saved = localStorage.getItem(`addresses_${user.id}`);
      if (saved) {
        setSavedAddresses(JSON.parse(saved));
      }
    }
  }, [user, loading, router]);

  // GPS Location Detection
  const detectLocation = useCallback((target: 'primary' | 'new') => {
    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: t.locationError });
      return;
    }

    setGpsLoading(true);
    setGpsTarget(target);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=${lang}&addressdetails=1`
          );

          if (!response.ok) throw new Error('Geocoding failed');

          const data = await response.json();
          const address = data.address;

          // Extract address components
          const stateOrCounty = address.state || address.county || address.governorate || '';
          const matchedGov = EGYPTIAN_GOVERNORATES.find(g =>
            stateOrCounty.includes(g.ar) ||
            stateOrCounty.includes(g.en) ||
            g.ar.includes(stateOrCounty) ||
            g.en.toLowerCase().includes(stateOrCounty.toLowerCase())
          );

          const locationData = {
            governorate: matchedGov ? (isRTL ? matchedGov.ar : matchedGov.en) : '',
            city: address.city || address.town || address.village || '',
            district: address.suburb || address.neighbourhood || address.district || '',
            street: address.road || address.street || '',
            latitude,
            longitude,
          };

          if (target === 'primary') {
            setPrimaryAddress(prev => ({ ...prev, ...locationData }));
          } else {
            setNewAddress(prev => ({ ...prev, ...locationData }));
          }

          setMessage({ type: 'success', text: t.locationDetected });
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          setMessage({ type: 'error', text: t.locationError });
        } finally {
          setGpsLoading(false);
          setGpsTarget(null);
        }
      },
      (error) => {
        setGpsLoading(false);
        setGpsTarget(null);
        if (error.code === error.PERMISSION_DENIED) {
          setMessage({ type: 'error', text: t.locationPermissionDenied });
        } else {
          setMessage({ type: 'error', text: t.locationError });
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [lang, isRTL, t]);

  // Save personal info
  const handleSavePersonalInfo = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await updateUser({
        fullName: formData.fullName,
        phone: formData.phone || undefined,
        businessName: formData.businessName || undefined,
        taxId: formData.taxId || undefined,
        commercialRegNo: formData.commercialRegNo || undefined,
        governorate: primaryAddress.governorate || undefined,
        city: primaryAddress.city || undefined,
        district: primaryAddress.district || undefined,
        street: primaryAddress.street || undefined,
      });

      setMessage({ type: 'success', text: t.saveSuccess });
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: t.saveError });
    } finally {
      setSaving(false);
    }
  };

  // Add new address
  const handleAddAddress = () => {
    if (!newAddress.name || !newAddress.governorate) return;

    const address: Address = {
      id: Date.now().toString(),
      name: newAddress.name || '',
      governorate: newAddress.governorate || '',
      city: newAddress.city || '',
      district: newAddress.district || '',
      street: newAddress.street || '',
      buildingNo: newAddress.buildingNo,
      floor: newAddress.floor,
      apartment: newAddress.apartment,
      landmark: newAddress.landmark,
      latitude: newAddress.latitude,
      longitude: newAddress.longitude,
      isPrimary: false,
    };

    const updatedAddresses = [...savedAddresses, address];
    setSavedAddresses(updatedAddresses);

    // Save to localStorage
    if (user) {
      localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updatedAddresses));
    }

    // Reset form
    setNewAddress({
      name: '',
      governorate: '',
      city: '',
      district: '',
      street: '',
      buildingNo: '',
      floor: '',
      apartment: '',
      landmark: '',
      isPrimary: false,
    });
    setShowAddressForm(false);
    setMessage({ type: 'success', text: t.saveSuccess });
  };

  // Delete address
  const handleDeleteAddress = (id: string) => {
    if (!confirm(t.deleteConfirm)) return;

    const updatedAddresses = savedAddresses.filter(a => a.id !== id);
    setSavedAddresses(updatedAddresses);

    if (user) {
      localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updatedAddresses));
    }
  };

  // Set as primary
  const handleSetAsPrimary = async (address: Address) => {
    setPrimaryAddress({
      governorate: address.governorate,
      city: address.city,
      district: address.district,
      street: address.street,
      buildingNo: address.buildingNo,
      floor: address.floor,
      apartment: address.apartment,
      landmark: address.landmark,
    });

    // Update user profile
    try {
      await updateUser({
        governorate: address.governorate,
        city: address.city,
        district: address.district,
        street: address.street,
      });
      setMessage({ type: 'success', text: t.saveSuccess });
    } catch (error) {
      setMessage({ type: 'error', text: t.saveError });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t.pageTitle}</h1>
              <p className="text-gray-600 text-sm">{t.pageSubtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <span>{lang === 'ar' ? '🇬🇧' : '🇪🇬'}</span>
                <span className="text-sm">{lang === 'ar' ? 'English' : 'العربية'}</span>
              </button>
              <Link
                href="/dashboard"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                {t.backToDashboard}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('personal')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'personal'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            👤 {t.personalInfo}
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'addresses'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📍 {t.addresses}
          </button>
        </div>

        {/* Personal Info Tab */}
        {activeTab === 'personal' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid gap-6">
              {/* Account Type Badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t.accountType}:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.userType === 'BUSINESS'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {user.userType === 'BUSINESS' ? t.business : t.individual}
                </span>
                {user.createdAt && (
                  <span className="text-sm text-gray-400">
                    • {t.memberSince} {new Date(user.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                  </span>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.fullName} <span className="text-red-500">{t.required}</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.email}
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.phone} <span className="text-gray-400">{t.optional}</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  dir="ltr"
                  placeholder="01012345678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">{t.phoneHint}</p>
              </div>

              {/* Business Fields */}
              {user.userType === 'BUSINESS' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.businessName}
                    </label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.taxId}
                      </label>
                      <input
                        type="text"
                        value={formData.taxId}
                        onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                        dir="ltr"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.commercialRegNo}
                      </label>
                      <input
                        type="text"
                        value={formData.commercialRegNo}
                        onChange={(e) => setFormData({ ...formData, commercialRegNo: e.target.value })}
                        dir="ltr"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Primary Address Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">📍 {t.primaryAddress}</h3>
                    <p className="text-sm text-gray-500">{t.primaryAddressHint}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => detectLocation('primary')}
                    disabled={gpsLoading && gpsTarget === 'primary'}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-50"
                  >
                    {gpsLoading && gpsTarget === 'primary' ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {t.detectingLocation}
                      </>
                    ) : (
                      <>
                        <span>📍</span>
                        {t.detectLocation}
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.governorate}</label>
                    <select
                      value={primaryAddress.governorate}
                      onChange={(e) => setPrimaryAddress({ ...primaryAddress, governorate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                    >
                      <option value="">{t.selectGovernorate}</option>
                      {EGYPTIAN_GOVERNORATES.map(gov => (
                        <option key={gov.ar} value={isRTL ? gov.ar : gov.en}>
                          {isRTL ? gov.ar : gov.en}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.city}</label>
                    <input
                      type="text"
                      value={primaryAddress.city}
                      onChange={(e) => setPrimaryAddress({ ...primaryAddress, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.district}</label>
                    <input
                      type="text"
                      value={primaryAddress.district}
                      onChange={(e) => setPrimaryAddress({ ...primaryAddress, district: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.street}</label>
                    <input
                      type="text"
                      value={primaryAddress.street}
                      onChange={(e) => setPrimaryAddress({ ...primaryAddress, street: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSavePersonalInfo}
                  disabled={saving}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {saving ? t.saving : t.save}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            {/* Saved Addresses */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{t.savedAddresses}</h3>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <span>➕</span>
                  {t.addNewAddress}
                </button>
              </div>

              {savedAddresses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{t.noSavedAddresses}</p>
              ) : (
                <div className="space-y-4">
                  {savedAddresses.map((address) => (
                    <div
                      key={address.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary-200 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{address.name}</h4>
                          <p className="text-gray-600 text-sm mt-1">
                            {[address.street, address.district, address.city, address.governorate]
                              .filter(Boolean)
                              .join('، ')}
                          </p>
                          {address.landmark && (
                            <p className="text-gray-500 text-sm mt-1">📍 {address.landmark}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSetAsPrimary(address)}
                            className="text-sm text-primary-600 hover:text-primary-700"
                          >
                            {t.setAsPrimary}
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            {t.delete}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Address Form */}
            {showAddressForm && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{t.addNewAddress}</h3>
                  <button
                    type="button"
                    onClick={() => detectLocation('new')}
                    disabled={gpsLoading && gpsTarget === 'new'}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-50"
                  >
                    {gpsLoading && gpsTarget === 'new' ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {t.detectingLocation}
                      </>
                    ) : (
                      <>
                        <span>📍</span>
                        {t.detectLocation}
                      </>
                    )}
                  </button>
                </div>

                <div className="grid gap-4">
                  {/* Address Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.addressName} <span className="text-red-500">{t.required}</span>
                    </label>
                    <input
                      type="text"
                      value={newAddress.name}
                      onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                      placeholder={t.addressNamePlaceholder}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.governorate} <span className="text-red-500">{t.required}</span>
                      </label>
                      <select
                        value={newAddress.governorate}
                        onChange={(e) => setNewAddress({ ...newAddress, governorate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                      >
                        <option value="">{t.selectGovernorate}</option>
                        {EGYPTIAN_GOVERNORATES.map(gov => (
                          <option key={gov.ar} value={isRTL ? gov.ar : gov.en}>
                            {isRTL ? gov.ar : gov.en}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.city}</label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.district}</label>
                      <input
                        type="text"
                        value={newAddress.district}
                        onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.street}</label>
                      <input
                        type="text"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.buildingNo}</label>
                      <input
                        type="text"
                        value={newAddress.buildingNo}
                        onChange={(e) => setNewAddress({ ...newAddress, buildingNo: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.floor}</label>
                      <input
                        type="text"
                        value={newAddress.floor}
                        onChange={(e) => setNewAddress({ ...newAddress, floor: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.apartment}</label>
                      <input
                        type="text"
                        value={newAddress.apartment}
                        onChange={(e) => setNewAddress({ ...newAddress, apartment: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.landmark}</label>
                    <input
                      type="text"
                      value={newAddress.landmark}
                      onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                      placeholder={t.landmarkPlaceholder}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowAddressForm(false);
                        setNewAddress({
                          name: '',
                          governorate: '',
                          city: '',
                          district: '',
                          street: '',
                          buildingNo: '',
                          floor: '',
                          apartment: '',
                          landmark: '',
                          isPrimary: false,
                        });
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {t.cancel}
                    </button>
                    <button
                      onClick={handleAddAddress}
                      disabled={!newAddress.name || !newAddress.governorate}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {t.add}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
