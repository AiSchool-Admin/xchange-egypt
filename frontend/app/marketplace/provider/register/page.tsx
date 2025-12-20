'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Egyptian governorates
const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر',
  'البحيرة', 'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية',
  'المنيا', 'القليوبية', 'الوادي الجديد', 'السويس', 'أسوان',
  'أسيوط', 'بني سويف', 'بورسعيد', 'دمياط', 'الشرقية',
  'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر', 'قنا',
  'شمال سيناء', 'سوهاج'
];

// Vehicle types
const VEHICLE_TYPES = {
  shipping: [
    { value: 'MOTORCYCLE', label: 'موتوسيكل', icon: '🏍️', capacity: '5 كجم' },
    { value: 'CAR', label: 'سيارة', icon: '🚗', capacity: '50 كجم' },
    { value: 'VAN', label: 'فان', icon: '🚐', capacity: '500 كجم' },
    { value: 'PICKUP', label: 'بيك أب', icon: '🛻', capacity: '1 طن' },
    { value: 'TRUCK_SMALL', label: 'نقل صغير', icon: '🚚', capacity: '3 طن' },
    { value: 'TRUCK_MEDIUM', label: 'نقل متوسط', icon: '🚛', capacity: '7 طن' },
    { value: 'TRUCK_LARGE', label: 'نقل كبير', icon: '🚛', capacity: '15+ طن' },
  ],
  rides: [
    { value: 'SEDAN', label: 'سيدان', icon: '🚗', capacity: '4 ركاب' },
    { value: 'SUV', label: 'SUV', icon: '🚙', capacity: '6 ركاب' },
    { value: 'MINIVAN', label: 'ميني فان', icon: '🚐', capacity: '7 ركاب' },
    { value: 'BUS_SMALL', label: 'ميني باص', icon: '🚌', capacity: '14 راكب' },
    { value: 'BUS_LARGE', label: 'باص كبير', icon: '🚌', capacity: '50 راكب' },
  ],
};

interface FormData {
  // Step 1: Provider Type
  providerType: 'INDIVIDUAL' | 'SMALL_BUSINESS' | 'COMPANY' | '';
  // Step 2: Basic Info
  name: string;
  nameAr: string;
  phone: string;
  email: string;
  // Company info (if applicable)
  companyName: string;
  commercialRegister: string;
  taxNumber: string;
  // Step 3: Services
  serviceTypes: ('SHIPPING' | 'INTERCITY_RIDE')[];
  coverageAreas: string[];
  // Step 4: Vehicles
  vehicles: {
    type: string;
    make: string;
    model: string;
    year: string;
    plateNumber: string;
    color: string;
  }[];
}

export default function ProviderRegistrationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    providerType: '',
    name: '',
    nameAr: '',
    phone: '',
    email: '',
    companyName: '',
    commercialRegister: '',
    taxNumber: '',
    serviceTypes: [],
    coverageAreas: [],
    vehicles: [],
  });

  const [newVehicle, setNewVehicle] = useState({
    type: '',
    make: '',
    model: '',
    year: '',
    plateNumber: '',
    color: '',
  });

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleServiceType = (type: 'SHIPPING' | 'INTERCITY_RIDE') => {
    setFormData(prev => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(type)
        ? prev.serviceTypes.filter(t => t !== type)
        : [...prev.serviceTypes, type],
    }));
  };

  const toggleCoverageArea = (gov: string) => {
    setFormData(prev => ({
      ...prev,
      coverageAreas: prev.coverageAreas.includes(gov)
        ? prev.coverageAreas.filter(a => a !== gov)
        : [...prev.coverageAreas, gov],
    }));
  };

  const selectAllGovernorate = () => {
    setFormData(prev => ({
      ...prev,
      coverageAreas: prev.coverageAreas.length === GOVERNORATES.length ? [] : [...GOVERNORATES],
    }));
  };

  const addVehicle = () => {
    if (newVehicle.type && newVehicle.make && newVehicle.plateNumber) {
      setFormData(prev => ({
        ...prev,
        vehicles: [...prev.vehicles, { ...newVehicle }],
      }));
      setNewVehicle({
        type: '',
        make: '',
        model: '',
        year: '',
        plateNumber: '',
        color: '',
      });
    }
  };

  const removeVehicle = (index: number) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Redirect to success page
      router.push('/marketplace/provider/register/success');
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.providerType !== '';
      case 2:
        const hasBasicInfo = formData.name && formData.phone;
        if (formData.providerType === 'COMPANY') {
          return hasBasicInfo && formData.companyName && formData.commercialRegister;
        }
        return hasBasicInfo;
      case 3:
        return formData.serviceTypes.length > 0 && formData.coverageAreas.length > 0;
      case 4:
        return formData.vehicles.length > 0;
      case 5:
        return agreedToTerms;
      default:
        return true;
    }
  };

  const getAvailableVehicleTypes = () => {
    const types: typeof VEHICLE_TYPES.shipping = [];
    if (formData.serviceTypes.includes('SHIPPING')) {
      types.push(...VEHICLE_TYPES.shipping);
    }
    if (formData.serviceTypes.includes('INTERCITY_RIDE')) {
      types.push(...VEHICLE_TYPES.rides);
    }
    return types;
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-green-600 to-green-700 text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            رجوع
          </button>
          <h1 className="text-2xl font-bold">التسجيل كمزود خدمة</h1>
          <p className="text-green-100 mt-1">انضم إلى شبكة مزودي خدمات النقل</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s < step
                      ? 'bg-green-500 text-white'
                      : s === step
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s < step ? '✓' : s}
                </div>
                {s < 5 && (
                  <div
                    className={`w-12 sm:w-16 h-1 mx-1 ${
                      s < step ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>النوع</span>
            <span>البيانات</span>
            <span>الخدمات</span>
            <span>المركبات</span>
            <span>التأكيد</span>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Step 1: Provider Type */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="font-bold text-lg mb-4">اختر نوع مزود الخدمة</h2>

              <div className="space-y-3">
                {[
                  {
                    value: 'INDIVIDUAL',
                    label: 'فرد',
                    description: 'سائق أو ناقل فردي',
                    icon: '👤',
                    benefits: ['تسجيل سريع', 'بدون مستندات تجارية', 'ابدأ فوراً'],
                  },
                  {
                    value: 'SMALL_BUSINESS',
                    label: 'نشاط تجاري صغير',
                    description: 'مكتب نقل أو مجموعة سائقين',
                    icon: '🏪',
                    benefits: ['إدارة عدة مركبات', 'هوية تجارية', 'دعم مخصص'],
                  },
                  {
                    value: 'COMPANY',
                    label: 'شركة',
                    description: 'شركة نقل أو شحن مرخصة',
                    icon: '🏢',
                    benefits: ['تحقق رسمي', 'أولوية في الطلبات', 'عقود مؤسسية'],
                  },
                ].map(type => (
                  <button
                    key={type.value}
                    onClick={() => updateField('providerType', type.value as FormData['providerType'])}
                    className={`w-full p-4 rounded-xl border-2 text-right ${
                      formData.providerType === type.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{type.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{type.label}</h3>
                        <p className="text-gray-600 text-sm mb-2">{type.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {type.benefits.map(b => (
                            <span key={b} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              ✓ {b}
                            </span>
                          ))}
                        </div>
                      </div>
                      {formData.providerType === type.value && (
                        <span className="text-green-500 text-xl">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Basic Info */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">👤</span>
                البيانات الشخصية
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم بالعربية *
                  </label>
                  <input
                    type="text"
                    value={formData.nameAr}
                    onChange={e => updateField('nameAr', e.target.value)}
                    placeholder="محمد أحمد"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم بالإنجليزية
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => updateField('name', e.target.value)}
                    placeholder="Mohamed Ahmed"
                    dir="ltr"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => updateField('phone', e.target.value)}
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-right"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => updateField('email', e.target.value)}
                    placeholder="example@email.com"
                    dir="ltr"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-right"
                  />
                </div>
              </div>
            </div>

            {(formData.providerType === 'SMALL_BUSINESS' || formData.providerType === 'COMPANY') && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="text-2xl">🏢</span>
                  بيانات النشاط التجاري
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      اسم الشركة / النشاط *
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={e => updateField('companyName', e.target.value)}
                      placeholder="شركة النيل للشحن"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  {formData.providerType === 'COMPANY' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          رقم السجل التجاري *
                        </label>
                        <input
                          type="text"
                          value={formData.commercialRegister}
                          onChange={e => updateField('commercialRegister', e.target.value)}
                          placeholder="xxxxxxxx"
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          الرقم الضريبي
                        </label>
                        <input
                          type="text"
                          value={formData.taxNumber}
                          onChange={e => updateField('taxNumber', e.target.value)}
                          placeholder="xxx-xxx-xxx"
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Services & Coverage */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">🚚</span>
                نوع الخدمات
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'SHIPPING', label: 'خدمات الشحن', icon: '📦', desc: 'نقل بضائع وطرود' },
                  { value: 'INTERCITY_RIDE', label: 'رحلات بين المدن', icon: '🚗', desc: 'نقل ركاب' },
                ].map(service => (
                  <button
                    key={service.value}
                    onClick={() => toggleServiceType(service.value as 'SHIPPING' | 'INTERCITY_RIDE')}
                    className={`p-4 rounded-xl border-2 text-center ${
                      formData.serviceTypes.includes(service.value as any)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <span className="text-3xl block mb-2">{service.icon}</span>
                    <span className="font-medium block">{service.label}</span>
                    <span className="text-sm text-gray-500">{service.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <span className="text-2xl">📍</span>
                  مناطق التغطية
                </h2>
                <button
                  onClick={selectAllGovernorate}
                  className="text-sm text-green-600 hover:underline"
                >
                  {formData.coverageAreas.length === GOVERNORATES.length ? 'إلغاء الكل' : 'تحديد الكل'}
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                اختر المحافظات التي تغطيها خدماتك ({formData.coverageAreas.length} محافظة)
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                {GOVERNORATES.map(gov => (
                  <button
                    key={gov}
                    onClick={() => toggleCoverageArea(gov)}
                    className={`p-2 rounded-lg text-sm ${
                      formData.coverageAreas.includes(gov)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {gov}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Vehicles */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">🚛</span>
                إضافة مركبة
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نوع المركبة *
                  </label>
                  <select
                    value={newVehicle.type}
                    onChange={e => setNewVehicle(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">اختر نوع المركبة</option>
                    {getAvailableVehicleTypes().map(v => (
                      <option key={v.value} value={v.value}>
                        {v.icon} {v.label} ({v.capacity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الماركة *
                    </label>
                    <input
                      type="text"
                      value={newVehicle.make}
                      onChange={e => setNewVehicle(prev => ({ ...prev, make: e.target.value }))}
                      placeholder="تويوتا"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الموديل
                    </label>
                    <input
                      type="text"
                      value={newVehicle.model}
                      onChange={e => setNewVehicle(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="هايلكس"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      سنة الصنع
                    </label>
                    <input
                      type="text"
                      value={newVehicle.year}
                      onChange={e => setNewVehicle(prev => ({ ...prev, year: e.target.value }))}
                      placeholder="2022"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      اللون
                    </label>
                    <input
                      type="text"
                      value={newVehicle.color}
                      onChange={e => setNewVehicle(prev => ({ ...prev, color: e.target.value }))}
                      placeholder="أبيض"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم اللوحة *
                  </label>
                  <input
                    type="text"
                    value={newVehicle.plateNumber}
                    onChange={e => setNewVehicle(prev => ({ ...prev, plateNumber: e.target.value }))}
                    placeholder="أ ب ج 1234"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <button
                  onClick={addVehicle}
                  disabled={!newVehicle.type || !newVehicle.make || !newVehicle.plateNumber}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-700"
                >
                  + إضافة مركبة
                </button>
              </div>
            </div>

            {/* Added Vehicles */}
            {formData.vehicles.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h2 className="font-bold text-lg mb-4">
                  المركبات المضافة ({formData.vehicles.length})
                </h2>

                <div className="space-y-3">
                  {formData.vehicles.map((vehicle, index) => {
                    const vehicleType = getAvailableVehicleTypes().find(v => v.value === vehicle.type);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{vehicleType?.icon || '🚗'}</span>
                          <div>
                            <p className="font-medium">
                              {vehicle.make} {vehicle.model}
                            </p>
                            <p className="text-sm text-gray-500">
                              {vehicleType?.label} • {vehicle.plateNumber}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeVehicle(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Review & Confirm */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                مراجعة البيانات
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">نوع المزود</span>
                  <span className="font-medium">
                    {formData.providerType === 'INDIVIDUAL' ? 'فرد' :
                     formData.providerType === 'SMALL_BUSINESS' ? 'نشاط تجاري' : 'شركة'}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">الاسم</span>
                  <span className="font-medium">{formData.nameAr || formData.name}</span>
                </div>

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">الهاتف</span>
                  <span className="font-medium" dir="ltr">{formData.phone}</span>
                </div>

                {formData.companyName && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">الشركة</span>
                    <span className="font-medium">{formData.companyName}</span>
                  </div>
                )}

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">الخدمات</span>
                  <span className="font-medium">
                    {formData.serviceTypes.map(t => t === 'SHIPPING' ? 'شحن' : 'رحلات').join('، ')}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">مناطق التغطية</span>
                  <span className="font-medium">{formData.coverageAreas.length} محافظة</span>
                </div>

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">المركبات</span>
                  <span className="font-medium">{formData.vehicles.length} مركبة</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="font-bold text-lg mb-4">الشروط والأحكام</h2>

              <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto text-sm text-gray-600 mb-4">
                <p className="mb-2">بتسجيلك كمزود خدمة في منصة Xchange، فإنك توافق على:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>الالتزام بتقديم خدمات عالية الجودة</li>
                  <li>الاستجابة للطلبات في الوقت المناسب</li>
                  <li>التعامل باحترام مع العملاء</li>
                  <li>الحفاظ على سلامة الشحنات والركاب</li>
                  <li>الالتزام بالأسعار المتفق عليها</li>
                  <li>توفير المستندات المطلوبة عند الطلب</li>
                </ul>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={e => setAgreedToTerms(e.target.checked)}
                  className="w-5 h-5 text-green-600 rounded"
                />
                <span className="text-sm">أوافق على الشروط والأحكام وسياسة الخصوصية</span>
              </label>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex gap-3">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <h3 className="font-medium text-amber-800">ماذا بعد التسجيل؟</h3>
                  <ul className="mt-2 text-sm text-amber-700 space-y-1">
                    <li>• سيتم مراجعة طلبك خلال 24-48 ساعة</li>
                    <li>• ستتلقى إشعاراً عند تفعيل حسابك</li>
                    <li>• يمكنك البدء في استلام طلبات العملاء</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="max-w-2xl mx-auto flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50"
              >
                السابق
              </button>
            )}

            {step < 5 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className={`flex-1 py-3 rounded-xl font-medium ${
                  canProceed()
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                التالي
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className={`flex-1 py-3 rounded-xl font-medium ${
                  canProceed() && !isSubmitting
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    جاري التسجيل...
                  </span>
                ) : (
                  'إرسال طلب التسجيل'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Spacer for fixed bottom nav */}
        <div className="h-24" />
      </div>
    </div>
  );
}
