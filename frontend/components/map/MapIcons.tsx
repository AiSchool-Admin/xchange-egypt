'use client';

import L from 'leaflet';

// Category color mapping
const CATEGORY_COLORS: Record<string, string> = {
  'electronics': '#3B82F6', // blue
  'vehicles': '#EF4444', // red
  'fashion': '#EC4899', // pink
  'home': '#F59E0B', // amber
  'sports': '#10B981', // emerald
  'books': '#8B5CF6', // purple
  'toys': '#F97316', // orange
  'jewelry': '#D4AF37', // gold
  'default': '#059669', // emerald-600
};

// Get color for category
export const getCategoryColor = (categorySlug?: string): string => {
  if (!categorySlug) return CATEGORY_COLORS.default;
  const key = Object.keys(CATEGORY_COLORS).find(k =>
    categorySlug.toLowerCase().includes(k)
  );
  return key ? CATEGORY_COLORS[key] : CATEGORY_COLORS.default;
};

// Create custom marker icon
export const createMarkerIcon = (color: string = '#059669', size: 'small' | 'medium' | 'large' = 'medium'): L.DivIcon => {
  const sizes = {
    small: { width: 24, height: 32, fontSize: 12 },
    medium: { width: 32, height: 42, fontSize: 14 },
    large: { width: 40, height: 52, fontSize: 16 },
  };

  const { width, height, fontSize } = sizes[size];

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${width}px;
        height: ${height}px;
        position: relative;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      ">
        <svg viewBox="0 0 24 36" width="${width}" height="${height}">
          <path d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24C24 5.4 18.6 0 12 0z" fill="${color}"/>
          <circle cx="12" cy="12" r="6" fill="white"/>
        </svg>
      </div>
    `,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height + 5],
  });
};

// Create cluster icon for governorate
export const createClusterIcon = (count: number, color: string = '#059669'): L.DivIcon => {
  const size = count > 50 ? 56 : count > 20 ? 48 : count > 10 ? 42 : 36;

  return L.divIcon({
    className: 'cluster-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -20)} 100%);
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${size > 48 ? 16 : size > 40 ? 14 : 12}px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: transform 0.2s;
      "
      onmouseover="this.style.transform='scale(1.1)'"
      onmouseout="this.style.transform='scale(1)'"
      >
        ${count}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

// Create governorate label icon
export const createGovernorateIcon = (name: string, count: number): L.DivIcon => {
  const baseSize = 48;
  const extraSize = Math.min(count * 0.5, 20);
  const size = baseSize + extraSize;

  // Color based on count
  const getGradient = (c: number) => {
    if (c >= 30) return ['#059669', '#047857']; // Dark green
    if (c >= 20) return ['#10B981', '#059669']; // Green
    if (c >= 10) return ['#34D399', '#10B981']; // Light green
    return ['#6EE7B7', '#34D399']; // Very light green
  };

  const [color1, color2] = getGradient(count);

  return L.divIcon({
    className: 'governorate-marker',
    html: `
      <div style="
        position: relative;
        text-align: center;
      ">
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: linear-gradient(135deg, ${color1} 0%, ${color2} 100%);
          border: 4px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${size > 60 ? 18 : size > 50 ? 16 : 14}px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.35);
          cursor: pointer;
          transition: all 0.3s ease;
        "
        onmouseover="this.style.transform='scale(1.15)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.4)';"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.35)';"
        >
          ${count}
        </div>
        <div style="
          margin-top: 4px;
          background: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          color: #374151;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          white-space: nowrap;
        ">
          ${name}
        </div>
      </div>
    `,
    iconSize: [size + 40, size + 24],
    iconAnchor: [(size + 40) / 2, size / 2],
    popupAnchor: [0, -size / 2 - 10],
  });
};

// Item marker with image preview
export const createItemIcon = (
  imageUrl?: string,
  categorySlug?: string,
  isFeatured?: boolean
): L.DivIcon => {
  const color = getCategoryColor(categorySlug);
  const size = isFeatured ? 48 : 40;
  const borderColor = isFeatured ? '#D4AF37' : 'white';
  const borderWidth = isFeatured ? 4 : 3;

  const hasImage = imageUrl && imageUrl.length > 0;

  return L.divIcon({
    className: 'item-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size + 8}px;
        position: relative;
        filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3));
      ">
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: ${borderWidth}px solid ${borderColor};
          overflow: hidden;
          background: ${hasImage ? '#f3f4f6' : color};
          ${isFeatured ? 'box-shadow: 0 0 12px rgba(212, 175, 55, 0.6);' : ''}
        ">
          ${hasImage
            ? `<img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='📦';" />`
            : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: ${size * 0.4}px;">📦</div>`
          }
        </div>
        <div style="
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 10px solid ${borderColor};
        "></div>
        ${isFeatured ? `
          <div style="
            position: absolute;
            top: -4px;
            right: -4px;
            width: 18px;
            height: 18px;
            background: #D4AF37;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            border: 2px solid white;
          ">⭐</div>
        ` : ''}
      </div>
    `,
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 4)],
  });
};

// Utility to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// Egypt cities by governorate
export const EGYPT_CITIES: Record<string, string[]> = {
  'Cairo': ['مدينة نصر', 'المعادي', 'الزمالك', 'مصر الجديدة', 'شبرا', 'حلوان', 'التجمع الخامس', 'الرحاب', 'مدينتي', 'العبور', 'القاهرة الجديدة', '6 أكتوبر'],
  'القاهرة': ['مدينة نصر', 'المعادي', 'الزمالك', 'مصر الجديدة', 'شبرا', 'حلوان', 'التجمع الخامس', 'الرحاب', 'مدينتي', 'العبور', 'القاهرة الجديدة'],
  'Giza': ['الدقي', 'المهندسين', 'العجوزة', 'الهرم', 'فيصل', 'الشيخ زايد', 'أكتوبر', 'حدائق الأهرام', 'البدرشين'],
  'الجيزة': ['الدقي', 'المهندسين', 'العجوزة', 'الهرم', 'فيصل', 'الشيخ زايد', 'أكتوبر', 'حدائق الأهرام', 'البدرشين'],
  'Alexandria': ['المنتزه', 'سيدي جابر', 'سموحة', 'العصافرة', 'المندرة', 'ميامي', 'جليم', 'سان ستيفانو', 'ستانلي', 'كامب شيزار'],
  'الإسكندرية': ['المنتزه', 'سيدي جابر', 'سموحة', 'العصافرة', 'المندرة', 'ميامي', 'جليم', 'سان ستيفانو', 'ستانلي', 'كامب شيزار'],
  'Dakahlia': ['المنصورة', 'ميت غمر', 'طلخا', 'دكرنس', 'شربين', 'أجا', 'السنبلاوين'],
  'الدقهلية': ['المنصورة', 'ميت غمر', 'طلخا', 'دكرنس', 'شربين', 'أجا', 'السنبلاوين'],
  'Sharqia': ['الزقازيق', 'بلبيس', 'منيا القمح', 'أبو حماد', 'فاقوس', 'العاشر من رمضان', 'الحسينية'],
  'الشرقية': ['الزقازيق', 'بلبيس', 'منيا القمح', 'أبو حماد', 'فاقوس', 'العاشر من رمضان', 'الحسينية'],
};

// Governorate Arabic/English mapping
export const GOVERNORATE_NAMES: Record<string, string> = {
  'Cairo': 'القاهرة',
  'Giza': 'الجيزة',
  'Alexandria': 'الإسكندرية',
  'Dakahlia': 'الدقهلية',
  'Sharqia': 'الشرقية',
  'Qalyubia': 'القليوبية',
  'Menoufia': 'المنوفية',
  'Gharbia': 'الغربية',
  'Beheira': 'البحيرة',
  'Kafr El Sheikh': 'كفر الشيخ',
  'Damietta': 'دمياط',
  'Port Said': 'بورسعيد',
  'Ismailia': 'الإسماعيلية',
  'Suez': 'السويس',
  'North Sinai': 'شمال سيناء',
  'South Sinai': 'جنوب سيناء',
  'Red Sea': 'البحر الأحمر',
  'Fayoum': 'الفيوم',
  'Beni Suef': 'بني سويف',
  'Minya': 'المنيا',
  'Assiut': 'أسيوط',
  'Sohag': 'سوهاج',
  'Qena': 'قنا',
  'Luxor': 'الأقصر',
  'Aswan': 'أسوان',
  'New Valley': 'الوادي الجديد',
  'Matrouh': 'مطروح',
};

// Get Arabic name for governorate
export const getGovernorateArabicName = (name: string): string => {
  return GOVERNORATE_NAMES[name] || name;
};
