'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';

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
  // Add more cities as needed - for now showing top governorates
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
    governorate: 'المحافظة',
    city: 'المدينة',
    selectGovernorate: 'اختر المحافظة',
    selectCity: 'اختر المدينة',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    createAccount: 'إنشاء حساب',
    creating: 'جاري إنشاء الحساب...',
    haveAccount: 'لديك حساب بالفعل؟',
    loginHere: 'سجل دخول هنا',
    backToHome: '← العودة للرئيسية',
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
    governorate: 'Governorate',
    city: 'City',
    selectGovernorate: 'Select Governorate',
    selectCity: 'Select City',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    createAccount: 'Create Account',
    creating: 'Creating Account...',
    haveAccount: 'Already have an account?',
    loginHere: 'Login here',
    backToHome: '→ Back to Home',
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
    phone: '',
    city: '',
    governorate: '',
    businessName: '',
    taxId: '',
    commercialRegNo: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerIndividual, registerBusiness } = useAuth();

  // Get cities for selected governorate
  const availableCities = formData.governorate ? (CITIES_BY_GOVERNORATE[formData.governorate] || []) : [];

  // Validation functions
  const validateField = (name: string, value: string): string | undefined => {
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
  };

  // Real-time validation on change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear city if governorate changes
    if (name === 'governorate') {
      setFormData(prev => ({ ...prev, city: '' }));
    }

    // Validate if field was touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Validate on blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Revalidate confirm password when password changes
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

  // Input field component with inline error
  const InputField = ({
    name,
    label,
    type = 'text',
    required = false,
    placeholder,
    dir,
  }: {
    name: keyof typeof formData;
    label: string;
    type?: string;
    required?: boolean;
    placeholder?: string;
    dir?: string;
  }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required ? <span className="text-red-500">{t.required}</span> : <span className="text-gray-400">{t.optional}</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={formData[name]}
        onChange={handleChange}
        onBlur={handleBlur}
        required={required}
        dir={dir}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors ${
          errors[name as keyof FieldErrors] && touched[name] ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}
        placeholder={placeholder}
      />
      {errors[name as keyof FieldErrors] && touched[name] && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <span>⚠</span> {errors[name as keyof FieldErrors]}
        </p>
      )}
    </div>
  );

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

            <InputField name="fullName" label={t.fullName} required placeholder={isRTL ? 'محمد أحمد' : 'John Doe'} />
            <InputField name="email" label={t.email} type="email" required placeholder="example@email.com" dir="ltr" />
            <InputField name="phone" label={t.phone} type="tel" placeholder="01012345678" dir="ltr" />

            {/* Business-specific fields */}
            {userType === 'BUSINESS' && (
              <>
                <InputField name="businessName" label={t.businessName} required placeholder={isRTL ? 'شركة التجارة' : 'Trading Company'} />
                <InputField name="taxId" label={t.taxId} placeholder="123456789" dir="ltr" />
                <InputField name="commercialRegNo" label={t.commercialRegNo} placeholder="CR123456" dir="ltr" />
              </>
            )}

            {/* Governorate and City - Governorate on the right for RTL */}
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

            <InputField name="password" label={t.password} type="password" required placeholder="••••••••" />
            <InputField name="confirmPassword" label={t.confirmPassword} type="password" required placeholder="••••••••" />

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
