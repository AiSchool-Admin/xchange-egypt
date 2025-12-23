'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRightIcon,
  HomeIcon,
  BuildingOfficeIcon,
  HeartIcon,
  ClockIcon,
  MapPinIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  MagnifyingGlassIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { HomeIcon as HomeIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

// Address types
type AddressType = 'home' | 'work' | 'favorite' | 'recent';

interface SavedAddress {
  id: string;
  name: string;
  nameAr: string;
  type: AddressType;
  address: string;
  addressAr: string;
  lat: number;
  lng: number;
  buildingName?: string;
  floor?: string;
  apartment?: string;
  landmark?: string;
  instructions?: string;
  useCount: number;
  lastUsedAt?: string;
  createdAt: string;
}

// Icon mapping for address types
const ADDRESS_TYPE_CONFIG: Record<AddressType, { icon: typeof HomeIcon; iconSolid: typeof HomeIconSolid; color: string; label: string; labelAr: string }> = {
  home: { icon: HomeIcon, iconSolid: HomeIconSolid, color: 'text-blue-600 bg-blue-100', label: 'Home', labelAr: 'المنزل' },
  work: { icon: BuildingOfficeIcon, iconSolid: BuildingOfficeIcon, color: 'text-purple-600 bg-purple-100', label: 'Work', labelAr: 'العمل' },
  favorite: { icon: HeartIcon, iconSolid: HeartIconSolid, color: 'text-red-600 bg-red-100', label: 'Favorite', labelAr: 'مفضل' },
  recent: { icon: ClockIcon, iconSolid: ClockIcon, color: 'text-gray-600 bg-gray-100', label: 'Recent', labelAr: 'حديث' },
};

// Sample saved addresses
const INITIAL_ADDRESSES: SavedAddress[] = [
  {
    id: '1',
    name: 'Home',
    nameAr: 'المنزل',
    type: 'home',
    address: '25 Ahmed Orabi St, Mohandessin, Giza',
    addressAr: '25 شارع أحمد عرابي، المهندسين، الجيزة',
    lat: 30.0561,
    lng: 31.2017,
    buildingName: 'Nile Tower',
    floor: '5',
    apartment: '12',
    landmark: 'Next to Seoudi Market',
    instructions: 'Call when you arrive',
    useCount: 45,
    lastUsedAt: '2024-01-18T10:30:00Z',
    createdAt: '2023-06-15T08:00:00Z'
  },
  {
    id: '2',
    name: 'Work',
    nameAr: 'العمل',
    type: 'work',
    address: 'Smart Village, Building B2, 6th October',
    addressAr: 'القرية الذكية، مبنى B2، السادس من أكتوبر',
    lat: 30.0708,
    lng: 31.0169,
    buildingName: 'Building B2',
    floor: '3',
    landmark: 'Near Vodafone HQ',
    useCount: 62,
    lastUsedAt: '2024-01-17T18:00:00Z',
    createdAt: '2023-06-15T08:00:00Z'
  },
  {
    id: '3',
    name: 'Gym',
    nameAr: 'الجيم',
    type: 'favorite',
    address: 'Gold\'s Gym, Mall of Arabia, 6th October',
    addressAr: 'جولدز جيم، مول العرب، السادس من أكتوبر',
    lat: 29.9728,
    lng: 30.9428,
    useCount: 23,
    lastUsedAt: '2024-01-16T07:00:00Z',
    createdAt: '2023-09-01T10:00:00Z'
  },
  {
    id: '4',
    name: 'Parents House',
    nameAr: 'بيت الوالدين',
    type: 'favorite',
    address: '15 Tahrir Square, Downtown Cairo',
    addressAr: '15 ميدان التحرير، وسط البلد، القاهرة',
    lat: 30.0444,
    lng: 31.2357,
    buildingName: 'Tahrir Tower',
    floor: '8',
    apartment: '2',
    useCount: 12,
    lastUsedAt: '2024-01-14T14:00:00Z',
    createdAt: '2023-10-20T12:00:00Z'
  },
  {
    id: '5',
    name: 'Cairo Festival City',
    nameAr: 'كايرو فيستيفال سيتي',
    type: 'recent',
    address: 'Cairo Festival City Mall, New Cairo',
    addressAr: 'مول كايرو فيستيفال سيتي، التجمع الخامس',
    lat: 30.0285,
    lng: 31.4085,
    useCount: 5,
    lastUsedAt: '2024-01-15T19:00:00Z',
    createdAt: '2024-01-10T16:00:00Z'
  }
];

export default function SavedAddressesPage() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<AddressType | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load addresses from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('xchange_saved_addresses');
    if (stored) {
      setAddresses(JSON.parse(stored));
    } else {
      setAddresses(INITIAL_ADDRESSES);
      localStorage.setItem('xchange_saved_addresses', JSON.stringify(INITIAL_ADDRESSES));
    }
  }, []);

  // Save to localStorage when addresses change
  const saveAddresses = (newAddresses: SavedAddress[]) => {
    setAddresses(newAddresses);
    localStorage.setItem('xchange_saved_addresses', JSON.stringify(newAddresses));
  };

  // Filter addresses
  const filteredAddresses = addresses.filter(addr => {
    const matchesSearch = searchQuery === '' ||
      addr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      addr.nameAr.includes(searchQuery) ||
      addr.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      addr.addressAr.includes(searchQuery);

    const matchesType = selectedType === 'all' || addr.type === selectedType;

    return matchesSearch && matchesType;
  }).sort((a, b) => b.useCount - a.useCount);

  // Delete address
  const handleDelete = (id: string) => {
    const newAddresses = addresses.filter(a => a.id !== id);
    saveAddresses(newAddresses);
    setDeleteConfirm(null);
  };

  // Set as default (move to top)
  const handleSetDefault = (id: string, type: AddressType) => {
    const newAddresses = addresses.map(a => {
      if (a.id === id) {
        return { ...a, useCount: a.useCount + 100 };
      }
      return a;
    });
    saveAddresses(newAddresses);
  };

  // Address type tabs
  const typeTabs = [
    { id: 'all' as const, label: 'الكل', labelEn: 'All', count: addresses.length },
    { id: 'home' as const, label: 'المنزل', labelEn: 'Home', count: addresses.filter(a => a.type === 'home').length },
    { id: 'work' as const, label: 'العمل', labelEn: 'Work', count: addresses.filter(a => a.type === 'work').length },
    { id: 'favorite' as const, label: 'المفضلة', labelEn: 'Favorites', count: addresses.filter(a => a.type === 'favorite').length },
    { id: 'recent' as const, label: 'الأخيرة', labelEn: 'Recent', count: addresses.filter(a => a.type === 'recent').length },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Back Button */}
            <Link href="/rides" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
              <ArrowRightIcon className="w-5 h-5" />
              <span>العودة للنقل الذكي</span>
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">العناوين المحفوظة</h1>
                <p className="text-white/80">إدارة عناوينك المفضلة للوصول السريع</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-white text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 transition-all flex items-center gap-2 shadow-lg"
              >
                <PlusIcon className="w-5 h-5" />
                إضافة عنوان
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث في عناوينك..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Type Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
              {typeTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedType(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                    selectedType === tab.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedType === tab.id ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {['home', 'work'].map((type) => {
            const config = ADDRESS_TYPE_CONFIG[type as AddressType];
            const address = addresses.find(a => a.type === type);
            const IconSolid = config.iconSolid;

            return (
              <div
                key={type}
                className={`bg-white rounded-2xl p-4 border-2 transition-all ${
                  address ? 'border-transparent hover:border-purple-200 cursor-pointer' : 'border-dashed border-gray-300'
                }`}
                onClick={() => address && window.location.assign(`/rides?pickup=${address.lat},${address.lng}&pickupName=${encodeURIComponent(address.addressAr)}`)}
              >
                <div className={`w-12 h-12 rounded-xl ${config.color} flex items-center justify-center mb-3`}>
                  <IconSolid className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900">{config.labelAr}</h3>
                {address ? (
                  <p className="text-sm text-gray-500 line-clamp-1 mt-1">{address.addressAr}</p>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddModalOpen(true);
                    }}
                    className="text-sm text-purple-600 hover:text-purple-700 mt-1 flex items-center gap-1"
                  >
                    <PlusIcon className="w-4 h-4" />
                    إضافة
                  </button>
                )}
              </div>
            );
          })}

          {/* Import from Maps */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white cursor-pointer hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <MapPinIcon className="w-6 h-6" />
            </div>
            <h3 className="font-bold">استيراد من الخريطة</h3>
            <p className="text-sm text-white/80 mt-1">اختر من Google Maps</p>
          </div>

          {/* Recent Location */}
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-4 text-white cursor-pointer hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <ClockIcon className="w-6 h-6" />
            </div>
            <h3 className="font-bold">موقعك الحالي</h3>
            <p className="text-sm text-white/80 mt-1">استخدم GPS</p>
          </div>
        </div>

        {/* Addresses List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MapPinIcon className="w-6 h-6 text-purple-600" />
            جميع العناوين ({filteredAddresses.length})
          </h2>

          {filteredAddresses.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <MapPinIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد عناوين</h3>
              <p className="text-gray-500 mb-6">لم يتم العثور على عناوين مطابقة للبحث</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all"
              >
                إضافة عنوان جديد
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredAddresses.map((address) => {
                const config = ADDRESS_TYPE_CONFIG[address.type];
                const Icon = config.icon;

                return (
                  <div
                    key={address.id}
                    className="bg-white rounded-2xl p-4 border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-7 h-7" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{address.nameAr}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${config.color}`}>
                            {config.labelAr}
                          </span>
                          {address.useCount > 20 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
                              <StarIcon className="w-3 h-3" />
                              الأكثر استخداماً
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{address.addressAr}</p>

                        {/* Additional Details */}
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                          {address.buildingName && (
                            <span className="bg-gray-100 px-2 py-1 rounded-lg">🏢 {address.buildingName}</span>
                          )}
                          {address.floor && (
                            <span className="bg-gray-100 px-2 py-1 rounded-lg">🏠 الطابق {address.floor}</span>
                          )}
                          {address.apartment && (
                            <span className="bg-gray-100 px-2 py-1 rounded-lg">🚪 شقة {address.apartment}</span>
                          )}
                          {address.landmark && (
                            <span className="bg-gray-100 px-2 py-1 rounded-lg">📍 {address.landmark}</span>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                          <span>استخدم {address.useCount} مرة</span>
                          {address.lastUsedAt && (
                            <span>آخر استخدام: {new Date(address.lastUsedAt).toLocaleDateString('ar-EG')}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => window.location.assign(`/rides?pickup=${address.lat},${address.lng}&pickupName=${encodeURIComponent(address.addressAr)}`)}
                          className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                          title="استخدم كنقطة انطلاق"
                        >
                          <MapPinIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setEditingAddress(address)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="تعديل"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleSetDefault(address.id, address.type)}
                          className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors"
                          title="تعيين كافتراضي"
                        >
                          <StarIcon className="w-5 h-5" />
                        </button>
                        {deleteConfirm === address.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(address.id)}
                              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <CheckIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(address.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="حذف"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
          <h3 className="text-lg font-bold text-purple-900 mb-4">💡 نصائح لإدارة العناوين</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4">
              <div className="text-2xl mb-2">🏠</div>
              <h4 className="font-bold text-gray-900 mb-1">أضف التفاصيل</h4>
              <p className="text-sm text-gray-600">أضف اسم المبنى والطابق والشقة لتسهيل الوصول</p>
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="text-2xl mb-2">📍</div>
              <h4 className="font-bold text-gray-900 mb-1">استخدم المعالم</h4>
              <p className="text-sm text-gray-600">أضف معلم قريب ليسهل على السائق إيجادك</p>
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="text-2xl mb-2">📝</div>
              <h4 className="font-bold text-gray-900 mb-1">تعليمات التوصيل</h4>
              <p className="text-sm text-gray-600">أضف تعليمات خاصة مثل "اتصل عند الوصول"</p>
            </div>
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {(isAddModalOpen || editingAddress) && (
        <AddressModal
          address={editingAddress}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingAddress(null);
          }}
          onSave={(newAddress) => {
            if (editingAddress) {
              const updated = addresses.map(a => a.id === editingAddress.id ? newAddress : a);
              saveAddresses(updated);
            } else {
              saveAddresses([...addresses, { ...newAddress, id: Date.now().toString() }]);
            }
            setIsAddModalOpen(false);
            setEditingAddress(null);
          }}
        />
      )}
    </div>
  );
}

// Address Modal Component
function AddressModal({
  address,
  onClose,
  onSave
}: {
  address: SavedAddress | null;
  onClose: () => void;
  onSave: (address: SavedAddress) => void;
}) {
  const [formData, setFormData] = useState<Partial<SavedAddress>>(
    address || {
      name: '',
      nameAr: '',
      type: 'favorite',
      address: '',
      addressAr: '',
      lat: 30.0444,
      lng: 31.2357,
      buildingName: '',
      floor: '',
      apartment: '',
      landmark: '',
      instructions: '',
      useCount: 0,
      createdAt: new Date().toISOString()
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as SavedAddress);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {address ? 'تعديل العنوان' : 'إضافة عنوان جديد'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم (عربي)</label>
              <input
                type="text"
                value={formData.nameAr || ''}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                placeholder="مثال: المنزل"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name (English)</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Home"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع العنوان</label>
            <div className="grid grid-cols-4 gap-2">
              {(['home', 'work', 'favorite', 'recent'] as AddressType[]).map((type) => {
                const config = ADDRESS_TYPE_CONFIG[type];
                const Icon = config.icon;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type })}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                      formData.type === type
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${formData.type === type ? 'text-purple-600' : 'text-gray-400'}`} />
                    <span className="text-xs">{config.labelAr}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
            <textarea
              value={formData.addressAr || ''}
              onChange={(e) => setFormData({ ...formData, addressAr: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
              placeholder="العنوان بالتفصيل..."
              rows={2}
              required
            />
          </div>

          {/* Building Details */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المبنى</label>
              <input
                type="text"
                value={formData.buildingName || ''}
                onChange={(e) => setFormData({ ...formData, buildingName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                placeholder="اسم المبنى"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الطابق</label>
              <input
                type="text"
                value={formData.floor || ''}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                placeholder="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الشقة</label>
              <input
                type="text"
                value={formData.apartment || ''}
                onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                placeholder="12"
              />
            </div>
          </div>

          {/* Landmark */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">معلم قريب</label>
            <input
              type="text"
              value={formData.landmark || ''}
              onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
              placeholder="بجوار مول السوق..."
            />
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تعليمات للسائق</label>
            <input
              type="text"
              value={formData.instructions || ''}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
              placeholder="اتصل عند الوصول..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
            >
              {address ? 'حفظ التغييرات' : 'إضافة العنوان'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
