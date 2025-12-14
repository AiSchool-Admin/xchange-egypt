'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRightIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronDownIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ArrowsRightLeftIcon,
  PlusIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UserCircleIcon,
  TruckIcon,
  BoltIcon,
  ShieldCheckIcon,
  StarIcon,
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import {
  VEHICLE_MAKE_AR,
  VEHICLE_BODY_TYPE_AR,
  MOCK_VEHICLE_LISTINGS,
  type VehicleMake,
  type VehicleBodyType,
} from '@/lib/api/vehicle-marketplace';
import { findBarterMatches } from '@/lib/algorithms/vehicle-algorithms';

// Mock user's vehicle for barter
const USER_VEHICLE = {
  id: 'user-vehicle',
  make: 'TOYOTA' as VehicleMake,
  model: 'كامري',
  year: 2020,
  mileage: 45000,
  price: 850000,
  image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
  condition: 'EXCELLENT',
};

// Generate barter offers from mock listings
const BARTER_OFFERS = MOCK_VEHICLE_LISTINGS.filter(l => l.acceptsBarter).map(listing => ({
  id: listing.id,
  vehicle: {
    make: listing.make,
    model: listing.model,
    year: listing.year,
    mileage: listing.mileage,
    price: listing.price,
    image: listing.images[0],
    bodyType: listing.bodyType,
    condition: listing.condition,
  },
  owner: listing.seller,
  barterPreferences: listing.barterPreferences || 'مفتوح لجميع العروض',
  cashDifference: listing.price - USER_VEHICLE.price,
  compatibilityScore: Math.floor(Math.random() * 30) + 70, // 70-100%
  location: listing.location,
  createdAt: listing.createdAt,
}));

// Mock 3-way barter chains
const THREE_WAY_CHAINS = [
  {
    id: 'chain-1',
    score: 92,
    cashFlow: -15000,
    participants: [
      { name: 'أنت', vehicle: 'تويوتا كامري 2020', image: USER_VEHICLE.image },
      { name: 'محمد أحمد', vehicle: 'هيونداي توسان 2021', image: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=400' },
      { name: 'أحمد خالد', vehicle: 'نيسان سنترا 2022', image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400' },
    ],
    description: 'تحصل على نيسان سنترا 2022 مع دفع 15,000 جنيه',
  },
  {
    id: 'chain-2',
    score: 88,
    cashFlow: 25000,
    participants: [
      { name: 'أنت', vehicle: 'تويوتا كامري 2020', image: USER_VEHICLE.image },
      { name: 'سارة محمود', vehicle: 'كيا سبورتاج 2020', image: 'https://images.unsplash.com/photo-1619767886558-efdc259b6e09?w=400' },
      { name: 'علي حسن', vehicle: 'شيفروليه كروز 2021', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400' },
    ],
    description: 'تحصل على شيفروليه كروز 2021 وتستلم 25,000 جنيه',
  },
  {
    id: 'chain-3',
    score: 85,
    cashFlow: 0,
    participants: [
      { name: 'أنت', vehicle: 'تويوتا كامري 2020', image: USER_VEHICLE.image },
      { name: 'منى عبدالله', vehicle: 'مازدا 3 2021', image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400' },
      { name: 'كريم سعيد', vehicle: 'هوندا سيفيك 2020', image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400' },
    ],
    description: 'مبادلة متوازنة - تحصل على هوندا سيفيك 2020 بدون فرق نقدي',
  },
];

export default function BarterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMakes, setSelectedMakes] = useState<VehicleMake[]>([]);
  const [selectedBodyTypes, setSelectedBodyTypes] = useState<VehicleBodyType[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000000]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'direct' | '3way' | 'chain'>('direct');
  const [isSearching, setIsSearching] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const filteredOffers = BARTER_OFFERS.filter(offer => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const makeAr = VEHICLE_MAKE_AR[offer.vehicle.make].toLowerCase();
      const model = offer.vehicle.model.toLowerCase();
      if (!makeAr.includes(query) && !model.includes(query)) {
        return false;
      }
    }
    if (selectedMakes.length > 0 && !selectedMakes.includes(offer.vehicle.make)) {
      return false;
    }
    if (selectedBodyTypes.length > 0 && !selectedBodyTypes.includes(offer.vehicle.bodyType)) {
      return false;
    }
    if (offer.vehicle.price < priceRange[0] || offer.vehicle.price > priceRange[1]) {
      return false;
    }
    return true;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(price);
  };

  const runAISearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-l from-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/vehicles" className="flex items-center gap-2 text-white/80 hover:text-white">
              <ArrowRightIcon className="w-5 h-5" />
              <span>سوق السيارات</span>
            </Link>
            <h1 className="text-xl font-bold">نظام المقايضة</h1>
            <Link
              href="/vehicles/my-barters"
              className="text-white/80 hover:text-white text-sm"
            >
              مقايضاتي
            </Link>
          </div>
        </div>

        {/* User's Vehicle Card */}
        <div className="max-w-7xl mx-auto px-4 pb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <img
                src={USER_VEHICLE.image}
                alt={USER_VEHICLE.model}
                className="w-20 h-20 rounded-xl object-cover"
              />
              <div className="flex-1">
                <div className="text-white/70 text-sm mb-1">سيارتك للمقايضة</div>
                <h3 className="text-xl font-bold text-white">
                  {VEHICLE_MAKE_AR[USER_VEHICLE.make]} {USER_VEHICLE.model} {USER_VEHICLE.year}
                </h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-white/80">
                  <span>{formatPrice(USER_VEHICLE.mileage)} كم</span>
                  <span>•</span>
                  <span className="text-yellow-300 font-medium">{formatPrice(USER_VEHICLE.price)} جنيه</span>
                </div>
              </div>
              <Link
                href="/vehicles/sell"
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors"
              >
                تغيير السيارة
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* AI Search Banner */}
      <div className="bg-gradient-to-l from-amber-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold">البحث الذكي بالذكاء الاصطناعي</div>
                <div className="text-sm text-white/80">نجد لك أفضل صفقات المقايضة تلقائياً</div>
              </div>
            </div>
            <button
              onClick={runAISearch}
              disabled={isSearching}
              className="px-6 py-2 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  جاري البحث...
                </>
              ) : (
                <>
                  <BoltIcon className="w-5 h-5" />
                  ابحث الآن
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1">
            {[
              { id: 'direct', label: 'مقايضة مباشرة', icon: ArrowsRightLeftIcon, count: filteredOffers.length },
              { id: '3way', label: 'مقايضة ثلاثية', icon: ArrowPathIcon, count: THREE_WAY_CHAINS.length },
              { id: 'chain', label: 'سلاسل المقايضة', icon: TruckIcon, count: 5 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'direct' | '3way' | 'chain')}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Direct Barter Tab */}
        {activeTab === 'direct' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-4 sticky top-20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">تصفية النتائج</h3>
                  <button
                    onClick={() => {
                      setSelectedMakes([]);
                      setSelectedBodyTypes([]);
                      setPriceRange([0, 3000000]);
                    }}
                    className="text-sm text-purple-600 hover:underline"
                  >
                    مسح الكل
                  </button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن سيارة..."
                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Makes */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">الشركة المصنعة</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {Object.entries(VEHICLE_MAKE_AR).slice(0, 10).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedMakes.includes(key as VehicleMake)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMakes([...selectedMakes, key as VehicleMake]);
                            } else {
                              setSelectedMakes(selectedMakes.filter(m => m !== key));
                            }
                          }}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">{value}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Body Types */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">نوع الهيكل</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(VEHICLE_BODY_TYPE_AR).map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => {
                          if (selectedBodyTypes.includes(key as VehicleBodyType)) {
                            setSelectedBodyTypes(selectedBodyTypes.filter(b => b !== key));
                          } else {
                            setSelectedBodyTypes([...selectedBodyTypes, key as VehicleBodyType]);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          selectedBodyTypes.includes(key as VehicleBodyType)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">نطاق السعر</h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      placeholder="من"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 3000000])}
                      placeholder="إلى"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <div className="text-gray-600">
                  <span className="font-bold text-gray-900">{filteredOffers.length}</span> عرض مقايضة متاح
                </div>
                <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500">
                  <option>الأكثر توافقاً</option>
                  <option>الأحدث</option>
                  <option>الأقل فرق سعر</option>
                  <option>الأعلى تقييماً</option>
                </select>
              </div>

              <div className="space-y-4">
                {filteredOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Image */}
                      <div className="relative w-full sm:w-56 h-48 sm:h-auto flex-shrink-0">
                        <img
                          src={offer.vehicle.image}
                          alt={offer.vehicle.model}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => toggleFavorite(offer.id)}
                          className="absolute top-2 left-2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                        >
                          {favorites.has(offer.id) ? (
                            <HeartSolidIcon className="w-5 h-5 text-red-500" />
                          ) : (
                            <HeartIcon className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                        <div className="absolute top-2 right-2 px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-lg">
                          توافق {offer.compatibilityScore}%
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {VEHICLE_MAKE_AR[offer.vehicle.make]} {offer.vehicle.model} {offer.vehicle.year}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                              <span>{formatPrice(offer.vehicle.mileage)} كم</span>
                              <span>•</span>
                              <span>{VEHICLE_BODY_TYPE_AR[offer.vehicle.bodyType]}</span>
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="text-lg font-bold text-purple-600">{formatPrice(offer.vehicle.price)} جنيه</div>
                            <div className={`text-sm font-medium ${
                              offer.cashDifference > 0 ? 'text-red-600' : offer.cashDifference < 0 ? 'text-green-600' : 'text-gray-600'
                            }`}>
                              {offer.cashDifference === 0 ? (
                                'مبادلة متوازنة'
                              ) : offer.cashDifference > 0 ? (
                                `تدفع +${formatPrice(offer.cashDifference)}`
                              ) : (
                                `تستلم ${formatPrice(Math.abs(offer.cashDifference))}`
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Barter Preferences */}
                        <div className="bg-purple-50 rounded-lg p-3 mb-3">
                          <div className="text-xs text-purple-600 font-medium mb-1">تفضيلات المقايضة:</div>
                          <div className="text-sm text-gray-700">{offer.barterPreferences}</div>
                        </div>

                        {/* Owner Info & Location */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <UserCircleIcon className="w-6 h-6 text-gray-500" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{offer.owner.name}</div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPinIcon className="w-3 h-3" />
                                {offer.location.governorate}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors">
                              <ChatBubbleLeftRightIcon className="w-4 h-4 inline ml-1" />
                              تواصل
                            </button>
                            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                              <ArrowsRightLeftIcon className="w-4 h-4 inline ml-1" />
                              اعرض مقايضة
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3-Way Barter Tab */}
        {activeTab === '3way' && (
          <div>
            <div className="bg-gradient-to-l from-purple-100 to-indigo-100 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ArrowPathIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">المقايضة الثلاثية الذكية</h2>
                  <p className="text-gray-600">
                    يقوم الذكاء الاصطناعي بتحليل جميع عروض المقايضة وإيجاد سلاسل ثلاثية تحقق فيها كل الأطراف ما يريدونه.
                    هذا يزيد فرص نجاح المقايضة بنسبة 340%!
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {THREE_WAY_CHAINS.map((chain) => (
                <div key={chain.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Score Header */}
                  <div className="bg-gradient-to-l from-purple-600 to-indigo-600 text-white px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-yellow-300" />
                        <span className="font-bold">توافق {chain.score}%</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        chain.cashFlow > 0 ? 'bg-green-500' : chain.cashFlow < 0 ? 'bg-red-400' : 'bg-gray-500'
                      }`}>
                        {chain.cashFlow === 0 ? 'متوازن' : chain.cashFlow > 0 ? `+${formatPrice(chain.cashFlow)}` : formatPrice(chain.cashFlow)}
                      </div>
                    </div>
                  </div>

                  {/* Chain Visualization */}
                  <div className="p-4">
                    <div className="space-y-3">
                      {chain.participants.map((participant, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={participant.image}
                              alt={participant.vehicle}
                              className="w-14 h-14 rounded-lg object-cover"
                            />
                            {index === 0 && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                                <StarIcon className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                            <div className="text-xs text-gray-500">{participant.vehicle}</div>
                          </div>
                          {index < chain.participants.length - 1 && (
                            <ArrowLongLeftIcon className="w-6 h-6 text-purple-400" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Description */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{chain.description}</p>
                    </div>

                    {/* Action */}
                    <button className="w-full mt-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors">
                      عرض التفاصيل والموافقة
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">كيف تعمل المقايضة الثلاثية؟</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { step: 1, title: 'تحليل العروض', desc: 'نحلل جميع عروض المقايضة في السوق' },
                  { step: 2, title: 'إيجاد التطابقات', desc: 'نجد سلاسل حيث كل طرف يحصل على ما يريد' },
                  { step: 3, title: 'حساب الفروقات', desc: 'نحسب الفروقات النقدية بين الأطراف' },
                  { step: 4, title: 'إتمام الصفقة', desc: 'نسهل التواصل والإتمام الآمن' },
                ].map((item) => (
                  <div key={item.step} className="text-center">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                      {item.step}
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chain Barter Tab */}
        {activeTab === 'chain' && (
          <div>
            <div className="bg-gradient-to-l from-amber-100 to-orange-100 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TruckIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">سلاسل المقايضة المتقدمة</h2>
                  <p className="text-gray-600">
                    سلاسل تصل إلى 6 أطراف! يقوم النظام بإيجاد أطول سلاسل ممكنة حيث يحصل كل طرف على سيارة أقرب لما يبحث عنه.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">قريباً...</h3>
              <p className="text-gray-600 mb-6">
                نعمل على تطوير خوارزمية متقدمة للسلاسل الطويلة. سيتم إطلاقها قريباً!
              </p>
              <button className="px-6 py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors">
                أعلمني عند الإطلاق
              </button>
            </div>
          </div>
        )}
      </div>

      {/* How Barter Works */}
      <div className="bg-white border-t border-gray-200 py-12 mt-8">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">لماذا المقايضة في Xchange؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheckIcon, title: 'ضمان آمن', desc: 'نظام ضمان يحمي جميع الأطراف' },
              { icon: SparklesIcon, title: 'ذكاء اصطناعي', desc: 'نجد أفضل التطابقات تلقائياً' },
              { icon: ArrowPathIcon, title: 'مقايضة متعددة', desc: 'دعم المقايضة الثنائية والثلاثية' },
              { icon: CurrencyDollarIcon, title: 'بدون عمولة', desc: 'المقايضة مجانية 100%' },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-7 h-7 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
