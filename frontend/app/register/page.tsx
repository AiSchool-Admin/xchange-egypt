'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';

// Countries with phone codes
const COUNTRIES = [
  { code: 'EG', name: { ar: 'مصر', en: 'Egypt' }, phoneCode: '+20', flag: '🇪🇬', phoneFormat: '10 digits starting with 1' },
  { code: 'SA', name: { ar: 'السعودية', en: 'Saudi Arabia' }, phoneCode: '+966', flag: '🇸🇦', phoneFormat: '9 digits starting with 5' },
  { code: 'AE', name: { ar: 'الإمارات', en: 'UAE' }, phoneCode: '+971', flag: '🇦🇪', phoneFormat: '9 digits starting with 5' },
  { code: 'KW', name: { ar: 'الكويت', en: 'Kuwait' }, phoneCode: '+965', flag: '🇰🇼', phoneFormat: '8 digits' },
  { code: 'QA', name: { ar: 'قطر', en: 'Qatar' }, phoneCode: '+974', flag: '🇶🇦', phoneFormat: '8 digits' },
  { code: 'BH', name: { ar: 'البحرين', en: 'Bahrain' }, phoneCode: '+973', flag: '🇧🇭', phoneFormat: '8 digits' },
  { code: 'OM', name: { ar: 'عمان', en: 'Oman' }, phoneCode: '+968', flag: '🇴🇲', phoneFormat: '8 digits' },
  { code: 'JO', name: { ar: 'الأردن', en: 'Jordan' }, phoneCode: '+962', flag: '🇯🇴', phoneFormat: '9 digits' },
  { code: 'LB', name: { ar: 'لبنان', en: 'Lebanon' }, phoneCode: '+961', flag: '🇱🇧', phoneFormat: '8 digits' },
  { code: 'IQ', name: { ar: 'العراق', en: 'Iraq' }, phoneCode: '+964', flag: '🇮🇶', phoneFormat: '10 digits' },
  { code: 'SY', name: { ar: 'سوريا', en: 'Syria' }, phoneCode: '+963', flag: '🇸🇾', phoneFormat: '9 digits' },
  { code: 'PS', name: { ar: 'فلسطين', en: 'Palestine' }, phoneCode: '+970', flag: '🇵🇸', phoneFormat: '9 digits' },
  { code: 'LY', name: { ar: 'ليبيا', en: 'Libya' }, phoneCode: '+218', flag: '🇱🇾', phoneFormat: '9 digits' },
  { code: 'TN', name: { ar: 'تونس', en: 'Tunisia' }, phoneCode: '+216', flag: '🇹🇳', phoneFormat: '8 digits' },
  { code: 'DZ', name: { ar: 'الجزائر', en: 'Algeria' }, phoneCode: '+213', flag: '🇩🇿', phoneFormat: '9 digits' },
  { code: 'MA', name: { ar: 'المغرب', en: 'Morocco' }, phoneCode: '+212', flag: '🇲🇦', phoneFormat: '9 digits' },
  { code: 'SD', name: { ar: 'السودان', en: 'Sudan' }, phoneCode: '+249', flag: '🇸🇩', phoneFormat: '9 digits' },
  { code: 'YE', name: { ar: 'اليمن', en: 'Yemen' }, phoneCode: '+967', flag: '🇾🇪', phoneFormat: '9 digits' },
];

// Egyptian governorates list
const EGYPTIAN_GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'البحر الأحمر',
  'البحيرة',
  'الفيوم',
  'الغربية',
  'الإسماعيلية',
  'المنوفية',
  'المنيا',
  'القليوبية',
  'الوادي الجديد',
  'السويس',
  'أسوان',
  'أسيوط',
  'بني سويف',
  'بورسعيد',
  'دمياط',
  'الشرقية',
  'جنوب سيناء',
  'كفر الشيخ',
  'مطروح',
  'الأقصر',
  'قنا',
  'شمال سيناء',
  'سوهاج',
];

// Cities by governorate
const CITIES_BY_GOVERNORATE: Record<string, string[]> = {
  'القاهرة': ['مدينة نصر', 'المعادي', 'الزمالك', 'مصر الجديدة', 'التجمع الخامس', 'المقطم', 'شبرا', 'حلوان', 'عين شمس', '6 أكتوبر'],
  'الجيزة': ['الدقي', 'المهندسين', 'الهرم', 'فيصل', 'العجوزة', 'الشيخ زايد', 'أكتوبر', 'البدرشين', 'العياط'],
  'الإسكندرية': ['المنتزه', 'سيدي جابر', 'محرم بك', 'سموحة', 'العصافرة', 'المندرة', 'العجمي', 'برج العرب'],
};

// Translations
const translations = {
  ar: {
    title: 'Xchange',
    subtitle: 'إنشاء حساب جديد',
    accountType: 'نوع الحساب',
    individual: 'فردي',
    business: 'تجاري',
    fullName: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    optional: '(اختياري)',
    required: '*',
    businessName: 'اسم النشاط التجاري',
    taxId: 'الرقم الضريبي',
    commercialRegNo: 'رقم السجل التجاري',
    country: 'الدولة',
    selectCountry: 'اختر الدولة',
    governorate: 'المحافظة',
    city: 'المدينة',
    selectGovernorate: 'اختر المحافظة',
    selectCity: 'اختر المدينة',
    phoneHint: 'أدخل الرقم بدون رمز الدولة',
    passwordHint: '8 أحرف على الأقل، حرف كبير، حرف صغير، ورقم',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    createAccount: 'إنشاء حساب',
    creating: 'جاري إنشاء الحساب...',
    haveAccount: 'لديك حساب بالفعل؟',
    loginHere: 'سجل دخول هنا',
    backToHome: '← العودة للرئيسية',
    nameHint: 'أدخل اسمك الكامل كما هو في الهوية',
    emailHint: 'سيتم استخدامه لتسجيل الدخول',
    confirmPasswordHint: 'أعد كتابة كلمة المرور للتأكيد',
    businessNameHint: 'الاسم التجاري المسجل',
    taxIdHint: 'الرقم الضريبي المكون من 9 أرقام',
    commercialRegHint: 'رقم السجل التجاري',
    passwordStrength: {
      veryWeak: 'ضعيفة جداً',
      weak: 'ضعيفة',
      medium: 'متوسطة',
      strong: 'قوية',
      veryStrong: 'قوية جداً',
    },
    errors: {
      fullNameRequired: 'الاسم الكامل مطلوب',
      fullNameMin: 'الاسم يجب أن يكون 3 أحرف على الأقل',
      emailRequired: 'البريد الإلكتروني مطلوب',
      emailInvalid: 'البريد الإلكتروني غير صالح',
      phoneInvalid: 'رقم الهاتف غير صالح (مثال: 01012345678)',
      businessNameRequired: 'اسم النشاط التجاري مطلوب',
      passwordRequired: 'كلمة المرور مطلوبة',
      passwordMin: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
      passwordStrength: 'كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم',
      confirmPasswordRequired: 'تأكيد كلمة المرور مطلوب',
      passwordsMismatch: 'كلمات المرور غير متطابقة',
    },
  },
  en: {
    title: 'Xchange',
    subtitle: 'Create New Account',
    accountType: 'Account Type',
    individual: 'Individual',
    business: 'Business',
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone Number',
    optional: '(Optional)',
    required: '*',
    businessName: 'Business Name',
    taxId: 'Tax ID',
    commercialRegNo: 'Commercial Reg. No.',
    country: 'Country',
    selectCountry: 'Select Country',
    governorate: 'Governorate',
    city: 'City',
    selectGovernorate: 'Select Governorate',
    selectCity: 'Select City',
    phoneHint: 'Enter number without country code',
    passwordHint: 'Min 8 chars, uppercase, lowercase, and number',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    createAccount: 'Create Account',
    creating: 'Creating Account...',
    haveAccount: 'Already have an account?',
    loginHere: 'Login here',
    backToHome: '→ Back to Home',
    nameHint: 'Enter your full name as on ID',
    emailHint: 'Will be used for login',
    confirmPasswordHint: 'Re-enter password to confirm',
    businessNameHint: 'Registered business name',
    taxIdHint: '9-digit tax number',
    commercialRegHint: 'Commercial registration number',
    passwordStrength: {
      veryWeak: 'Very Weak',
      weak: 'Weak',
      medium: 'Medium',
      strong: 'Strong',
      veryStrong: 'Very Strong',
    },
    errors: {
      fullNameRequired: 'Full name is required',
      fullNameMin: 'Name must be at least 3 characters',
      emailRequired: 'Email is required',
      emailInvalid: 'Invalid email address',
      phoneInvalid: 'Invalid phone number (e.g., 01012345678)',
      businessNameRequired: 'Business name is required',
      passwordRequired: 'Password is required',
      passwordMin: 'Password must be at least 8 characters',
      passwordStrength: 'Password must contain uppercase, lowercase, and number',
      confirmPasswordRequired: 'Confirm password is required',
      passwordsMismatch: 'Passwords do not match',
    },
  },
};

type Language = 'ar' | 'en';

interface FieldErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  businessName?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const [lang, setLang] = useState<Language>('ar');
  const t = translations[lang];
  const isRTL = lang === 'ar';

  const [userType, setUserType] = useState<'INDIVIDUAL' | 'BUSINESS'>('INDIVIDUAL');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'EG',
    phone: '',
    city: '',
    governorate: '',
    businessName: '',
    taxId: '',
    commercialRegNo: '',
  });

  const selectedCountry = COUNTRIES.find(c => c.code === formData.country) || COUNTRIES[0];
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerIndividual, registerBusiness } = useAuth();

  const availableCities = formData.governorate ? (CITIES_BY_GOVERNORATE[formData.governorate] || []) : [];

  // Memoized validation function
  const validateField = useCallback((name: string, value: string): string | undefined => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return t.errors.fullNameRequired;
        if (value.trim().length < 3) return t.errors.fullNameMin;
        break;
      case 'email':
        if (!value.trim()) return t.errors.emailRequired;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return t.errors.emailInvalid;
        break;
      case 'phone':
        if (value.trim()) {
          const phoneRegex = /^(\+?20)?1[0125]\d{8}$/;
          if (!phoneRegex.test(value.replace(/\s/g, ''))) return t.errors.phoneInvalid;
        }
        break;
      case 'businessName':
        if (userType === 'BUSINESS' && !value.trim()) return t.errors.businessNameRequired;
        break;
      case 'password':
        if (!value) return t.errors.passwordRequired;
        if (value.length < 8) return t.errors.passwordMin;
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        if (!hasUpper || !hasLower || !hasNumber) return t.errors.passwordStrength;
        break;
      case 'confirmPassword':
        if (!value) return t.errors.confirmPasswordRequired;
        if (value !== formData.password) return t.errors.passwordsMismatch;
        break;
    }
    return undefined;
  }, [t.errors, userType, formData.password]);

  // Simple change handler - no validation
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Clear city if governorate changes
      if (name === 'governorate') {
        newData.city = '';
      }
      return newData;
    });
    // Clear error when user starts typing
    setErrors(prev => prev[name as keyof FieldErrors] ? { ...prev, [name]: undefined } : prev);
  }, []);

  // Validate only on blur
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [validateField]);

  // Revalidate confirm password when password changes (only if already touched)
  useEffect(() => {
    if (touched.confirmPassword && formData.confirmPassword) {
      const error = formData.password !== formData.confirmPassword ? t.errors.passwordsMismatch : undefined;
      setErrors(prev => ({ ...prev, confirmPassword: error }));
    }
  }, [formData.password, formData.confirmPassword, touched.confirmPassword, t.errors.passwordsMismatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');

    // Validate all fields
    const newErrors: FieldErrors = {};
    const fieldsToValidate = ['fullName', 'email', 'password', 'confirmPassword'];
    if (formData.phone) fieldsToValidate.push('phone');
    if (userType === 'BUSINESS') fieldsToValidate.push('businessName');

    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) newErrors[field as keyof FieldErrors] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(fieldsToValidate.reduce((acc, f) => ({ ...acc, [f]: true }), {}));
      return;
    }

    setLoading(true);

    try {
      if (userType === 'INDIVIDUAL') {
        await registerIndividual({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
          city: formData.city || undefined,
          governorate: formData.governorate || undefined,
        });
      } else {
        await registerBusiness({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
          businessName: formData.businessName,
          taxId: formData.taxId || undefined,
          commercialRegNo: formData.commercialRegNo || undefined,
          city: formData.city || undefined,
          governorate: formData.governorate || undefined,
        });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.response?.data?.message || 'Registration failed. Please try again.';
      setGlobalError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Password strength calculation - memoized
  const passwordStrength = useMemo(() => {
    const password = formData.password;
    if (!password) return { level: 0, text: '', color: 'bg-gray-200' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const strengthTexts = [
      '',
      t.passwordStrength.veryWeak,
      t.passwordStrength.weak,
      t.passwordStrength.medium,
      t.passwordStrength.strong,
      t.passwordStrength.veryStrong,
    ];
    const strengthColors = [
      'bg-gray-200',
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-green-500',
      'bg-green-600',
    ];

    return { level: strength, text: strengthTexts[strength], color: strengthColors[strength] };
  }, [formData.password, t.passwordStrength]);

  // Helper to get input classes
  const getInputClasses = (fieldName: keyof FieldErrors) => {
    const hasError = errors[fieldName] && touched[fieldName];
    return `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors ${
      hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'
    }`;
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full">
        {/* Language Switcher */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg">{lang === 'ar' ? '🇬🇧' : '🇪🇬'}</span>
            <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {globalError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {globalError}
              </div>
            )}

            {/* User Type Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.accountType} <span className="text-red-500">{t.required}</span>
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setUserType('INDIVIDUAL')}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                    userType === 'INDIVIDUAL'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {t.individual}
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('BUSINESS')}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                    userType === 'BUSINESS'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {t.business}
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                {t.fullName} <span className="text-red-500">{t.required}</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClasses('fullName')}
                placeholder={isRTL ? 'محمد أحمد' : 'John Doe'}
              />
              {!(errors.fullName && touched.fullName) && (
                <p className="mt-1 text-xs text-gray-500">{t.nameHint}</p>
              )}
              {errors.fullName && touched.fullName && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠</span> {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t.email} <span className="text-red-500">{t.required}</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                dir="ltr"
                className={getInputClasses('email')}
                placeholder="example@email.com"
              />
              {!(errors.email && touched.email) && (
                <p className="mt-1 text-xs text-gray-500">{t.emailHint}</p>
              )}
              {errors.email && touched.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠</span> {errors.email}
                </p>
              )}
            </div>

            {/* Country and Phone */}
            <div className="space-y-3">
              {/* Country Selector */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  {t.country} <span className="text-gray-400">{t.optional}</span>
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white"
                >
                  {COUNTRIES.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name[lang]} ({country.phoneCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone with country code */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  {t.phone} <span className="text-gray-400">{t.optional}</span>
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium min-w-[80px] justify-center">
                    {selectedCountry.flag} {selectedCountry.phoneCode}
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    dir="ltr"
                    className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors ${
                      errors.phone && touched.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder={formData.country === 'EG' ? '1012345678' : '512345678'}
                  />
                </div>
                {!(errors.phone && touched.phone) && (
                  <p className="mt-1 text-xs text-gray-500">{t.phoneHint}</p>
                )}
                {errors.phone && touched.phone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠</span> {errors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Business-specific fields */}
            {userType === 'BUSINESS' && (
              <>
                {/* Business Name */}
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                    {t.businessName} <span className="text-red-500">{t.required}</span>
                  </label>
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClasses('businessName')}
                    placeholder={isRTL ? 'شركة التجارة' : 'Trading Company'}
                  />
                  {!(errors.businessName && touched.businessName) && (
                    <p className="mt-1 text-xs text-gray-500">{t.businessNameHint}</p>
                  )}
                  {errors.businessName && touched.businessName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <span>⚠</span> {errors.businessName}
                    </p>
                  )}
                </div>

                {/* Tax ID */}
                <div>
                  <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
                    {t.taxId} <span className="text-gray-400">{t.optional}</span>
                  </label>
                  <input
                    id="taxId"
                    name="taxId"
                    type="text"
                    value={formData.taxId}
                    onChange={handleChange}
                    dir="ltr"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="123456789"
                  />
                  <p className="mt-1 text-xs text-gray-500">{t.taxIdHint}</p>
                </div>

                {/* Commercial Reg No */}
                <div>
                  <label htmlFor="commercialRegNo" className="block text-sm font-medium text-gray-700 mb-1">
                    {t.commercialRegNo} <span className="text-gray-400">{t.optional}</span>
                  </label>
                  <input
                    id="commercialRegNo"
                    name="commercialRegNo"
                    type="text"
                    value={formData.commercialRegNo}
                    onChange={handleChange}
                    dir="ltr"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="CR123456"
                  />
                  <p className="mt-1 text-xs text-gray-500">{t.commercialRegHint}</p>
                </div>
              </>
            )}

            {/* Governorate and City */}
            <div className="grid grid-cols-2 gap-4">
              <div className={isRTL ? 'order-2' : 'order-1'}>
                <label htmlFor="governorate" className="block text-sm font-medium text-gray-700 mb-1">
                  {t.governorate} <span className="text-gray-400">{t.optional}</span>
                </label>
                <select
                  id="governorate"
                  name="governorate"
                  value={formData.governorate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="">{t.selectGovernorate}</option>
                  {EGYPTIAN_GOVERNORATES.map(gov => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>

              <div className={isRTL ? 'order-1' : 'order-2'}>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  {t.city} <span className="text-gray-400">{t.optional}</span>
                </label>
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!formData.governorate || availableCities.length === 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">{t.selectCity}</option>
                  {availableCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t.password} <span className="text-red-500">{t.required}</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClasses('password')}
                placeholder="••••••••"
              />
              {/* Password strength indicator */}
              {formData.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded ${i <= passwordStrength.level ? passwordStrength.color : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">{passwordStrength.text}</p>
                </div>
              )}
              {!(errors.password && touched.password) && formData.password.length === 0 && (
                <p className="mt-1 text-xs text-gray-500">{t.passwordHint}</p>
              )}
              {errors.password && touched.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠</span> {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                {t.confirmPassword} <span className="text-red-500">{t.required}</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClasses('confirmPassword')}
                placeholder="••••••••"
              />
              {!(errors.confirmPassword && touched.confirmPassword) && (
                <p className="mt-1 text-xs text-gray-500">{t.confirmPasswordHint}</p>
              )}
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠</span> {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {loading ? t.creating : t.createAccount}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {t.haveAccount}{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              {t.loginHere}
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-800">
            {t.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
