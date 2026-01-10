import { Metadata } from 'next';
import { getPrimaryImageUrl } from '@/lib/api/items';

// ============================================
// SEO Configuration for Xchange Egypt
// ============================================

const SITE_NAME = 'Xchange Egypt';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://xchange.com.eg';
const SITE_DESCRIPTION =
  'منصة Xchange للتبادل والمقايضة في مصر - بيع، اشتري، وبادل الأغراض المستعملة والجديدة بأمان وسهولة';
const SITE_DESCRIPTION_EN =
  'Xchange Egypt - Buy, sell, and trade items safely in Egypt. The leading platform for barter and exchange.';

// Default OG Image
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-default.jpg`;

// Keywords
const DEFAULT_KEYWORDS = [
  'مقايضة',
  'تبادل',
  'بيع',
  'شراء',
  'مزاد',
  'سوق مستعمل',
  'مصر',
  'سيارات',
  'موبايلات',
  'عقارات',
  'ذهب',
  'فضة',
  'barter',
  'exchange',
  'buy',
  'sell',
  'Egypt',
  'marketplace',
  'auction',
];

// ============================================
// Generate Metadata Utility
// ============================================
interface GenerateMetadataOptions {
  title: string;
  description?: string;
  keywords?: string[];
  image?: string;
  path?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
}

export function generateMetadata({
  title,
  description = SITE_DESCRIPTION,
  keywords = [],
  image = DEFAULT_OG_IMAGE,
  path = '',
  noIndex = false,
  type = 'website',
}: GenerateMetadataOptions): Metadata {
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  const url = `${SITE_URL}${path}`;
  const allKeywords = [...DEFAULT_KEYWORDS, ...keywords];

  return {
    title: fullTitle,
    description,
    keywords: allKeywords.join(', '),
    authors: [{ name: 'Xchange Egypt Team' }],
    creator: 'Xchange Egypt',
    publisher: 'Xchange Egypt',
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    alternates: {
      canonical: url,
      languages: {
        'ar-EG': url,
        'en-US': `${url}?lang=en`,
      },
    },
    openGraph: {
      type,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url,
      locale: 'ar_EG',
      alternateLocale: 'en_US',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@XchangeEgypt',
    },
    other: {
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'format-detection': 'telephone=no',
    },
  };
}

// ============================================
// Page-Specific Metadata Generators
// ============================================

export const homeMetadata: Metadata = generateMetadata({
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  path: '/',
});

export const itemsMetadata: Metadata = generateMetadata({
  title: 'تصفح المنتجات',
  description: 'تصفح آلاف المنتجات المتاحة للبيع والمقايضة في Xchange - موبايلات، سيارات، إلكترونيات، وأكثر',
  keywords: ['منتجات', 'مستعمل', 'جديد', 'للبيع'],
  path: '/items',
});

export const auctionsMetadata: Metadata = generateMetadata({
  title: 'المزادات',
  description: 'شارك في مزادات Xchange واحصل على أفضل الأسعار - مزادات يومية على منتجات متنوعة',
  keywords: ['مزاد', 'مزايدة', 'auction'],
  path: '/auctions',
});

export const barterMetadata: Metadata = generateMetadata({
  title: 'المقايضة',
  description: 'بادل أغراضك بأغراض أخرى تحتاجها - نظام مقايضة ذكي يجد لك أفضل العروض',
  keywords: ['مقايضة', 'تبادل', 'بدون فلوس', 'barter'],
  path: '/barter',
});

export const carsMetadata: Metadata = generateMetadata({
  title: 'سيارات',
  description: 'سوق السيارات في Xchange - بيع واشتري وبادل سيارات مستعملة وجديدة في مصر',
  keywords: ['سيارات', 'سيارات مستعملة', 'cars', 'used cars'],
  path: '/cars',
});

export const mobilesMetadata: Metadata = generateMetadata({
  title: 'موبايلات',
  description: 'سوق الموبايلات في Xchange - iPhone, Samsung, Xiaomi وجميع الماركات',
  keywords: ['موبايلات', 'هواتف', 'iPhone', 'Samsung', 'mobiles'],
  path: '/mobiles',
});

export const propertiesMetadata: Metadata = generateMetadata({
  title: 'عقارات',
  description: 'سوق العقارات في Xchange - شقق، فيلات، أراضي للبيع والإيجار في جميع المحافظات',
  keywords: ['عقارات', 'شقق', 'فيلات', 'real estate', 'apartments'],
  path: '/properties',
});

export const goldMetadata: Metadata = generateMetadata({
  title: 'ذهب',
  description: 'سوق الذهب في Xchange - بيع واشتري ذهب بأسعار يومية محدثة',
  keywords: ['ذهب', 'gold', 'jewelry', 'مجوهرات'],
  path: '/gold',
});

export const silverMetadata: Metadata = generateMetadata({
  title: 'فضة',
  description: 'سوق الفضة في Xchange - بيع واشتري فضة ومجوهرات فضية',
  keywords: ['فضة', 'silver', 'مجوهرات فضية'],
  path: '/silver',
});

export const walletMetadata: Metadata = generateMetadata({
  title: 'المحفظة',
  description: 'محفظة Xchange الرقمية - إدارة رصيدك ومعاملاتك المالية بأمان',
  keywords: ['محفظة', 'wallet', 'رصيد'],
  path: '/wallet',
  noIndex: true,
});

export const dashboardMetadata: Metadata = generateMetadata({
  title: 'لوحة التحكم',
  description: 'لوحة تحكم حسابك في Xchange - إدارة إعلاناتك ومعاملاتك',
  path: '/dashboard',
  noIndex: true,
});

export const loginMetadata: Metadata = generateMetadata({
  title: 'تسجيل الدخول',
  description: 'سجل دخولك إلى Xchange للوصول لحسابك',
  path: '/login',
  noIndex: true,
});

export const registerMetadata: Metadata = generateMetadata({
  title: 'إنشاء حساب جديد',
  description: 'أنشئ حسابك في Xchange مجاناً وابدأ البيع والشراء والمقايضة',
  keywords: ['تسجيل', 'حساب جديد', 'register'],
  path: '/register',
});

export const dealsMetadata: Metadata = generateMetadata({
  title: 'العروض والتخفيضات',
  description: 'أفضل العروض والتخفيضات في Xchange - وفر حتى 70% على المنتجات المختلفة',
  keywords: ['عروض', 'تخفيضات', 'deals', 'offers'],
  path: '/deals',
});

export const tendersMetadata: Metadata = generateMetadata({
  title: 'المناقصات',
  description: 'منصة المناقصات في Xchange - شارك في مناقصات الشركات والمؤسسات',
  keywords: ['مناقصات', 'tenders', 'عطاءات'],
  path: '/tenders',
});

// ============================================
// Dynamic Metadata Generator for Items
// ============================================
export function generateItemMetadata(item: {
  id: string;
  title: string;
  description?: string;
  price?: number;
  images?: { url: string }[];
  category?: string;
}): Metadata {
  const description = item.description || `${item.title} متاح الآن على Xchange`;
  const image = getPrimaryImageUrl(item.images, DEFAULT_OG_IMAGE);
  const priceText = item.price ? ` - ${item.price.toLocaleString('ar-EG')} ج.م` : '';

  return generateMetadata({
    title: `${item.title}${priceText}`,
    description: description.substring(0, 160),
    keywords: item.category ? [item.category] : [],
    image,
    path: `/items/${item.id}`,
    type: 'article',
  });
}

// ============================================
// Dynamic Metadata Generator for Users/Stores
// ============================================
export function generateUserMetadata(user: {
  id: string;
  name: string;
  bio?: string;
  avatar?: string;
}): Metadata {
  const description = user.bio || `تصفح إعلانات ${user.name} على Xchange`;

  return generateMetadata({
    title: user.name,
    description,
    image: user.avatar || DEFAULT_OG_IMAGE,
    path: `/users/${user.id}`,
  });
}

// ============================================
// JSON-LD Structured Data
// ============================================
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      'https://facebook.com/xchangeegypt',
      'https://twitter.com/xchangeegypt',
      'https://instagram.com/xchangeegypt',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+20-xxx-xxx-xxxx',
      contactType: 'customer service',
      availableLanguage: ['Arabic', 'English'],
    },
  };
}

export function generateProductSchema(item: {
  id: string;
  title: string;
  description?: string;
  price: number;
  images?: { url: string }[];
  condition?: string;
  seller?: { name: string };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.title,
    description: item.description,
    image: item.images?.map((img) => typeof img === 'string' ? img : img.url).filter(Boolean) || [],
    offers: {
      '@type': 'Offer',
      price: item.price,
      priceCurrency: 'EGP',
      availability: 'https://schema.org/InStock',
      itemCondition:
        item.condition === 'NEW'
          ? 'https://schema.org/NewCondition'
          : 'https://schema.org/UsedCondition',
    },
    seller: item.seller
      ? {
          '@type': 'Person',
          name: item.seller.name,
        }
      : undefined,
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}
