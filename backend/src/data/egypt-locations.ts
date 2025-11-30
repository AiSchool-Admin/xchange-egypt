/**
 * Egyptian Locations Data
 * Complete hierarchy: Governorate -> City -> District
 */

export interface District {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface City {
  id: string;
  nameAr: string;
  nameEn: string;
  districts: District[];
}

export interface Governorate {
  id: string;
  nameAr: string;
  nameEn: string;
  cities: City[];
}

export const egyptLocations: Governorate[] = [
  // ============================================
  // Greater Cairo Region
  // ============================================
  {
    id: 'cairo',
    nameAr: 'القاهرة',
    nameEn: 'Cairo',
    cities: [
      {
        id: 'cairo-city',
        nameAr: 'القاهرة',
        nameEn: 'Cairo City',
        districts: [
          { id: 'maadi', nameAr: 'المعادي', nameEn: 'Maadi' },
          { id: 'heliopolis', nameAr: 'مصر الجديدة', nameEn: 'Heliopolis' },
          { id: 'nasr-city', nameAr: 'مدينة نصر', nameEn: 'Nasr City' },
          { id: 'zamalek', nameAr: 'الزمالك', nameEn: 'Zamalek' },
          { id: 'garden-city', nameAr: 'جاردن سيتي', nameEn: 'Garden City' },
          { id: 'downtown', nameAr: 'وسط البلد', nameEn: 'Downtown' },
          { id: 'dokki', nameAr: 'الدقي', nameEn: 'Dokki' },
          { id: 'mohandessin', nameAr: 'المهندسين', nameEn: 'Mohandessin' },
          { id: 'shubra', nameAr: 'شبرا', nameEn: 'Shubra' },
          { id: 'ain-shams', nameAr: 'عين شمس', nameEn: 'Ain Shams' },
          { id: 'el-matareya', nameAr: 'المطرية', nameEn: 'El Matareya' },
          { id: 'el-zeitoun', nameAr: 'الزيتون', nameEn: 'El Zeitoun' },
          { id: 'hadayek-el-kobba', nameAr: 'حدائق القبة', nameEn: 'Hadayek El Kobba' },
          { id: 'el-nozha', nameAr: 'النزهة', nameEn: 'El Nozha' },
          { id: 'el-salam', nameAr: 'السلام', nameEn: 'El Salam' },
          { id: 'el-marg', nameAr: 'المرج', nameEn: 'El Marg' },
          { id: 'el-basateen', nameAr: 'البساتين', nameEn: 'El Basateen' },
          { id: 'dar-el-salam', nameAr: 'دار السلام', nameEn: 'Dar El Salam' },
          { id: 'old-cairo', nameAr: 'مصر القديمة', nameEn: 'Old Cairo' },
          { id: 'el-sayeda-zeinab', nameAr: 'السيدة زينب', nameEn: 'El Sayeda Zeinab' },
          { id: 'el-khalifa', nameAr: 'الخليفة', nameEn: 'El Khalifa' },
          { id: 'el-mokattam', nameAr: 'المقطم', nameEn: 'El Mokattam' },
          { id: 'el-tagamoa-el-khames', nameAr: 'التجمع الخامس', nameEn: 'New Cairo (5th Settlement)' },
          { id: 'el-rehab', nameAr: 'الرحاب', nameEn: 'El Rehab' },
          { id: 'madinaty', nameAr: 'مدينتي', nameEn: 'Madinaty' },
          { id: 'el-shorouk', nameAr: 'الشروق', nameEn: 'El Shorouk' },
          { id: 'badr-city', nameAr: 'مدينة بدر', nameEn: 'Badr City' },
          { id: 'el-obour', nameAr: 'العبور', nameEn: 'El Obour' },
        ],
      },
    ],
  },
  {
    id: 'giza',
    nameAr: 'الجيزة',
    nameEn: 'Giza',
    cities: [
      {
        id: 'giza-city',
        nameAr: 'الجيزة',
        nameEn: 'Giza City',
        districts: [
          { id: 'dokki-giza', nameAr: 'الدقي', nameEn: 'Dokki' },
          { id: 'agouza', nameAr: 'العجوزة', nameEn: 'Agouza' },
          { id: 'mohandessin-giza', nameAr: 'المهندسين', nameEn: 'Mohandessin' },
          { id: 'imbaba', nameAr: 'إمبابة', nameEn: 'Imbaba' },
          { id: 'bulaq-dakrour', nameAr: 'بولاق الدكرور', nameEn: 'Bulaq Dakrour' },
          { id: 'el-omraneya', nameAr: 'العمرانية', nameEn: 'El Omraneya' },
          { id: 'el-haram', nameAr: 'الهرم', nameEn: 'El Haram' },
          { id: 'faisal', nameAr: 'فيصل', nameEn: 'Faisal' },
          { id: 'el-hawamdeya', nameAr: 'الحوامدية', nameEn: 'El Hawamdeya' },
          { id: 'el-badrasheen', nameAr: 'البدرشين', nameEn: 'El Badrasheen' },
          { id: 'el-saf', nameAr: 'الصف', nameEn: 'El Saf' },
          { id: 'atfih', nameAr: 'أطفيح', nameEn: 'Atfih' },
          { id: 'el-ayat', nameAr: 'العياط', nameEn: 'El Ayat' },
          { id: 'abu-nomros', nameAr: 'أبو النمرس', nameEn: 'Abu Nomros' },
          { id: 'kerdasa', nameAr: 'كرداسة', nameEn: 'Kerdasa' },
          { id: 'auseem', nameAr: 'أوسيم', nameEn: 'Auseem' },
        ],
      },
      {
        id: '6-october',
        nameAr: 'السادس من أكتوبر',
        nameEn: '6th of October City',
        districts: [
          { id: '6oct-1st', nameAr: 'الحي الأول', nameEn: '1st District' },
          { id: '6oct-2nd', nameAr: 'الحي الثاني', nameEn: '2nd District' },
          { id: '6oct-3rd', nameAr: 'الحي الثالث', nameEn: '3rd District' },
          { id: '6oct-4th', nameAr: 'الحي الرابع', nameEn: '4th District' },
          { id: '6oct-5th', nameAr: 'الحي الخامس', nameEn: '5th District' },
          { id: '6oct-6th', nameAr: 'الحي السادس', nameEn: '6th District' },
          { id: '6oct-7th', nameAr: 'الحي السابع', nameEn: '7th District' },
          { id: '6oct-8th', nameAr: 'الحي الثامن', nameEn: '8th District' },
          { id: '6oct-9th', nameAr: 'الحي التاسع', nameEn: '9th District' },
          { id: '6oct-10th', nameAr: 'الحي العاشر', nameEn: '10th District' },
          { id: '6oct-11th', nameAr: 'الحي الحادي عشر', nameEn: '11th District' },
          { id: '6oct-12th', nameAr: 'الحي الثاني عشر', nameEn: '12th District' },
          { id: 'sheikh-zayed', nameAr: 'الشيخ زايد', nameEn: 'Sheikh Zayed' },
          { id: 'dreamland', nameAr: 'دريم لاند', nameEn: 'Dreamland' },
          { id: 'beverly-hills', nameAr: 'بيفرلي هيلز', nameEn: 'Beverly Hills' },
          { id: 'palm-hills', nameAr: 'بالم هيلز', nameEn: 'Palm Hills' },
        ],
      },
    ],
  },
  {
    id: 'qalyubia',
    nameAr: 'القليوبية',
    nameEn: 'Qalyubia',
    cities: [
      {
        id: 'banha',
        nameAr: 'بنها',
        nameEn: 'Banha',
        districts: [
          { id: 'banha-1', nameAr: 'بنها أول', nameEn: 'Banha First' },
          { id: 'banha-2', nameAr: 'بنها ثان', nameEn: 'Banha Second' },
          { id: 'kafr-el-gebel', nameAr: 'كفر الجبل', nameEn: 'Kafr El Gebel' },
        ],
      },
      {
        id: 'shubra-el-kheima',
        nameAr: 'شبرا الخيمة',
        nameEn: 'Shubra El Kheima',
        districts: [
          { id: 'shubra-kheima-1', nameAr: 'شبرا الخيمة أول', nameEn: 'Shubra El Kheima First' },
          { id: 'shubra-kheima-2', nameAr: 'شبرا الخيمة ثان', nameEn: 'Shubra El Kheima Second' },
          { id: 'mostorod', nameAr: 'مسطرد', nameEn: 'Mostorod' },
        ],
      },
      {
        id: 'qalyub',
        nameAr: 'قليوب',
        nameEn: 'Qalyub',
        districts: [
          { id: 'qalyub-center', nameAr: 'قليوب المركز', nameEn: 'Qalyub Center' },
        ],
      },
      {
        id: 'khanka',
        nameAr: 'الخانكة',
        nameEn: 'Khanka',
        districts: [
          { id: 'khanka-center', nameAr: 'الخانكة المركز', nameEn: 'Khanka Center' },
        ],
      },
      {
        id: 'shibin-el-qanater',
        nameAr: 'شبين القناطر',
        nameEn: 'Shibin El Qanater',
        districts: [
          { id: 'shibin-qanater-center', nameAr: 'شبين القناطر المركز', nameEn: 'Shibin El Qanater Center' },
        ],
      },
      {
        id: 'el-qanater-el-khayreya',
        nameAr: 'القناطر الخيرية',
        nameEn: 'El Qanater El Khayreya',
        districts: [
          { id: 'qanater-khayreya-center', nameAr: 'القناطر الخيرية المركز', nameEn: 'El Qanater El Khayreya Center' },
        ],
      },
      {
        id: 'toukh',
        nameAr: 'طوخ',
        nameEn: 'Toukh',
        districts: [
          { id: 'toukh-center', nameAr: 'طوخ المركز', nameEn: 'Toukh Center' },
        ],
      },
      {
        id: 'kafr-shukr',
        nameAr: 'كفر شكر',
        nameEn: 'Kafr Shukr',
        districts: [
          { id: 'kafr-shukr-center', nameAr: 'كفر شكر المركز', nameEn: 'Kafr Shukr Center' },
        ],
      },
    ],
  },

  // ============================================
  // Alexandria Region
  // ============================================
  {
    id: 'alexandria',
    nameAr: 'الإسكندرية',
    nameEn: 'Alexandria',
    cities: [
      {
        id: 'alexandria-city',
        nameAr: 'الإسكندرية',
        nameEn: 'Alexandria City',
        districts: [
          { id: 'el-montaza', nameAr: 'المنتزه', nameEn: 'El Montaza' },
          { id: 'el-raml', nameAr: 'الرمل', nameEn: 'El Raml' },
          { id: 'sidi-gaber', nameAr: 'سيدي جابر', nameEn: 'Sidi Gaber' },
          { id: 'sporting', nameAr: 'سبورتنج', nameEn: 'Sporting' },
          { id: 'stanley', nameAr: 'ستانلي', nameEn: 'Stanley' },
          { id: 'gleem', nameAr: 'جليم', nameEn: 'Gleem' },
          { id: 'san-stefano', nameAr: 'سان ستيفانو', nameEn: 'San Stefano' },
          { id: 'el-shatby', nameAr: 'الشاطبي', nameEn: 'El Shatby' },
          { id: 'el-ibrahimia', nameAr: 'الإبراهيمية', nameEn: 'El Ibrahimia' },
          { id: 'el-azarita', nameAr: 'الأزاريطة', nameEn: 'El Azarita' },
          { id: 'el-mansheya', nameAr: 'المنشية', nameEn: 'El Mansheya' },
          { id: 'bahary', nameAr: 'بحري', nameEn: 'Bahary' },
          { id: 'el-gomrok', nameAr: 'الجمرك', nameEn: 'El Gomrok' },
          { id: 'el-labban', nameAr: 'اللبان', nameEn: 'El Labban' },
          { id: 'el-attarin', nameAr: 'العطارين', nameEn: 'El Attarin' },
          { id: 'karmouz', nameAr: 'كرموز', nameEn: 'Karmouz' },
          { id: 'mina-el-basal', nameAr: 'مينا البصل', nameEn: 'Mina El Basal' },
          { id: 'el-dekhila', nameAr: 'الدخيلة', nameEn: 'El Dekhila' },
          { id: 'el-agamy', nameAr: 'العجمي', nameEn: 'El Agamy' },
          { id: 'bitash', nameAr: 'بيطاش', nameEn: 'Bitash' },
          { id: 'el-hanoveel', nameAr: 'الهانوفيل', nameEn: 'El Hanoveel' },
          { id: 'el-amreya', nameAr: 'العامرية', nameEn: 'El Amreya' },
          { id: 'borg-el-arab', nameAr: 'برج العرب', nameEn: 'Borg El Arab' },
          { id: 'smouha', nameAr: 'سموحة', nameEn: 'Smouha' },
          { id: 'sidi-bishr', nameAr: 'سيدي بشر', nameEn: 'Sidi Bishr' },
          { id: 'miami', nameAr: 'ميامي', nameEn: 'Miami' },
          { id: 'mandara', nameAr: 'المندرة', nameEn: 'Mandara' },
          { id: 'asafra', nameAr: 'العصافرة', nameEn: 'Asafra' },
          { id: 'abu-kir', nameAr: 'أبو قير', nameEn: 'Abu Kir' },
        ],
      },
    ],
  },

  // ============================================
  // Delta Region
  // ============================================
  {
    id: 'dakahlia',
    nameAr: 'الدقهلية',
    nameEn: 'Dakahlia',
    cities: [
      {
        id: 'mansoura',
        nameAr: 'المنصورة',
        nameEn: 'Mansoura',
        districts: [
          { id: 'mansoura-1', nameAr: 'المنصورة أول', nameEn: 'Mansoura First' },
          { id: 'mansoura-2', nameAr: 'المنصورة ثان', nameEn: 'Mansoura Second' },
          { id: 'talkha', nameAr: 'طلخا', nameEn: 'Talkha' },
        ],
      },
      {
        id: 'mit-ghamr',
        nameAr: 'ميت غمر',
        nameEn: 'Mit Ghamr',
        districts: [
          { id: 'mit-ghamr-center', nameAr: 'ميت غمر المركز', nameEn: 'Mit Ghamr Center' },
        ],
      },
      {
        id: 'dekernes',
        nameAr: 'دكرنس',
        nameEn: 'Dekernes',
        districts: [
          { id: 'dekernes-center', nameAr: 'دكرنس المركز', nameEn: 'Dekernes Center' },
        ],
      },
      {
        id: 'aga',
        nameAr: 'أجا',
        nameEn: 'Aga',
        districts: [
          { id: 'aga-center', nameAr: 'أجا المركز', nameEn: 'Aga Center' },
        ],
      },
      {
        id: 'belqas',
        nameAr: 'بلقاس',
        nameEn: 'Belqas',
        districts: [
          { id: 'belqas-center', nameAr: 'بلقاس المركز', nameEn: 'Belqas Center' },
        ],
      },
      {
        id: 'sherbin',
        nameAr: 'شربين',
        nameEn: 'Sherbin',
        districts: [
          { id: 'sherbin-center', nameAr: 'شربين المركز', nameEn: 'Sherbin Center' },
        ],
      },
      {
        id: 'el-senbellawein',
        nameAr: 'السنبلاوين',
        nameEn: 'El Senbellawein',
        districts: [
          { id: 'senbellawein-center', nameAr: 'السنبلاوين المركز', nameEn: 'El Senbellawein Center' },
        ],
      },
      {
        id: 'el-manzala',
        nameAr: 'المنزلة',
        nameEn: 'El Manzala',
        districts: [
          { id: 'manzala-center', nameAr: 'المنزلة المركز', nameEn: 'El Manzala Center' },
        ],
      },
      {
        id: 'gamasa',
        nameAr: 'جمصة',
        nameEn: 'Gamasa',
        districts: [
          { id: 'gamasa-center', nameAr: 'جمصة المركز', nameEn: 'Gamasa Center' },
        ],
      },
    ],
  },
  {
    id: 'sharqia',
    nameAr: 'الشرقية',
    nameEn: 'Sharqia',
    cities: [
      {
        id: 'zagazig',
        nameAr: 'الزقازيق',
        nameEn: 'Zagazig',
        districts: [
          { id: 'zagazig-1', nameAr: 'الزقازيق أول', nameEn: 'Zagazig First' },
          { id: 'zagazig-2', nameAr: 'الزقازيق ثان', nameEn: 'Zagazig Second' },
        ],
      },
      {
        id: '10th-ramadan',
        nameAr: 'العاشر من رمضان',
        nameEn: '10th of Ramadan City',
        districts: [
          { id: '10th-1', nameAr: 'الحي الأول', nameEn: '1st District' },
          { id: '10th-2', nameAr: 'الحي الثاني', nameEn: '2nd District' },
          { id: '10th-industrial', nameAr: 'المنطقة الصناعية', nameEn: 'Industrial Zone' },
        ],
      },
      {
        id: 'belbeis',
        nameAr: 'بلبيس',
        nameEn: 'Belbeis',
        districts: [
          { id: 'belbeis-center', nameAr: 'بلبيس المركز', nameEn: 'Belbeis Center' },
        ],
      },
      {
        id: 'abu-hammad',
        nameAr: 'أبو حماد',
        nameEn: 'Abu Hammad',
        districts: [
          { id: 'abu-hammad-center', nameAr: 'أبو حماد المركز', nameEn: 'Abu Hammad Center' },
        ],
      },
      {
        id: 'minya-el-qamh',
        nameAr: 'منيا القمح',
        nameEn: 'Minya El Qamh',
        districts: [
          { id: 'minya-qamh-center', nameAr: 'منيا القمح المركز', nameEn: 'Minya El Qamh Center' },
        ],
      },
      {
        id: 'fakous',
        nameAr: 'فاقوس',
        nameEn: 'Fakous',
        districts: [
          { id: 'fakous-center', nameAr: 'فاقوس المركز', nameEn: 'Fakous Center' },
        ],
      },
      {
        id: 'abu-kebir',
        nameAr: 'أبو كبير',
        nameEn: 'Abu Kebir',
        districts: [
          { id: 'abu-kebir-center', nameAr: 'أبو كبير المركز', nameEn: 'Abu Kebir Center' },
        ],
      },
      {
        id: 'el-husseiniya',
        nameAr: 'الحسينية',
        nameEn: 'El Husseiniya',
        districts: [
          { id: 'husseiniya-center', nameAr: 'الحسينية المركز', nameEn: 'El Husseiniya Center' },
        ],
      },
      {
        id: 'hehya',
        nameAr: 'ههيا',
        nameEn: 'Hehya',
        districts: [
          { id: 'hehya-center', nameAr: 'ههيا المركز', nameEn: 'Hehya Center' },
        ],
      },
      {
        id: 'kafr-saqr',
        nameAr: 'كفر صقر',
        nameEn: 'Kafr Saqr',
        districts: [
          { id: 'kafr-saqr-center', nameAr: 'كفر صقر المركز', nameEn: 'Kafr Saqr Center' },
        ],
      },
      {
        id: 'awlad-saqr',
        nameAr: 'أولاد صقر',
        nameEn: 'Awlad Saqr',
        districts: [
          { id: 'awlad-saqr-center', nameAr: 'أولاد صقر المركز', nameEn: 'Awlad Saqr Center' },
        ],
      },
      {
        id: 'el-ibrahimiya',
        nameAr: 'الإبراهيمية',
        nameEn: 'El Ibrahimiya',
        districts: [
          { id: 'ibrahimiya-center', nameAr: 'الإبراهيمية المركز', nameEn: 'El Ibrahimiya Center' },
        ],
      },
      {
        id: 'diyarb-negm',
        nameAr: 'ديرب نجم',
        nameEn: 'Diyarb Negm',
        districts: [
          { id: 'diyarb-negm-center', nameAr: 'ديرب نجم المركز', nameEn: 'Diyarb Negm Center' },
        ],
      },
    ],
  },
  {
    id: 'gharbia',
    nameAr: 'الغربية',
    nameEn: 'Gharbia',
    cities: [
      {
        id: 'tanta',
        nameAr: 'طنطا',
        nameEn: 'Tanta',
        districts: [
          { id: 'tanta-1', nameAr: 'طنطا أول', nameEn: 'Tanta First' },
          { id: 'tanta-2', nameAr: 'طنطا ثان', nameEn: 'Tanta Second' },
          { id: 'el-sayed-el-badawy', nameAr: 'السيد البدوي', nameEn: 'El Sayed El Badawy' },
        ],
      },
      {
        id: 'el-mahalla-el-kubra',
        nameAr: 'المحلة الكبرى',
        nameEn: 'El Mahalla El Kubra',
        districts: [
          { id: 'mahalla-1', nameAr: 'المحلة الكبرى أول', nameEn: 'El Mahalla First' },
          { id: 'mahalla-2', nameAr: 'المحلة الكبرى ثان', nameEn: 'El Mahalla Second' },
        ],
      },
      {
        id: 'kafr-el-zayat',
        nameAr: 'كفر الزيات',
        nameEn: 'Kafr El Zayat',
        districts: [
          { id: 'kafr-zayat-center', nameAr: 'كفر الزيات المركز', nameEn: 'Kafr El Zayat Center' },
        ],
      },
      {
        id: 'zefta',
        nameAr: 'زفتى',
        nameEn: 'Zefta',
        districts: [
          { id: 'zefta-center', nameAr: 'زفتى المركز', nameEn: 'Zefta Center' },
        ],
      },
      {
        id: 'samannoud',
        nameAr: 'سمنود',
        nameEn: 'Samannoud',
        districts: [
          { id: 'samannoud-center', nameAr: 'سمنود المركز', nameEn: 'Samannoud Center' },
        ],
      },
      {
        id: 'el-santa',
        nameAr: 'السنطة',
        nameEn: 'El Santa',
        districts: [
          { id: 'santa-center', nameAr: 'السنطة المركز', nameEn: 'El Santa Center' },
        ],
      },
      {
        id: 'basyoun',
        nameAr: 'بسيون',
        nameEn: 'Basyoun',
        districts: [
          { id: 'basyoun-center', nameAr: 'بسيون المركز', nameEn: 'Basyoun Center' },
        ],
      },
      {
        id: 'kotour',
        nameAr: 'قطور',
        nameEn: 'Kotour',
        districts: [
          { id: 'kotour-center', nameAr: 'قطور المركز', nameEn: 'Kotour Center' },
        ],
      },
    ],
  },
  {
    id: 'kafr-el-sheikh',
    nameAr: 'كفر الشيخ',
    nameEn: 'Kafr El Sheikh',
    cities: [
      {
        id: 'kafr-el-sheikh-city',
        nameAr: 'كفر الشيخ',
        nameEn: 'Kafr El Sheikh City',
        districts: [
          { id: 'kafr-sheikh-center', nameAr: 'كفر الشيخ المركز', nameEn: 'Kafr El Sheikh Center' },
        ],
      },
      {
        id: 'desouk',
        nameAr: 'دسوق',
        nameEn: 'Desouk',
        districts: [
          { id: 'desouk-center', nameAr: 'دسوق المركز', nameEn: 'Desouk Center' },
        ],
      },
      {
        id: 'baltim',
        nameAr: 'بلطيم',
        nameEn: 'Baltim',
        districts: [
          { id: 'baltim-center', nameAr: 'بلطيم المركز', nameEn: 'Baltim Center' },
        ],
      },
      {
        id: 'fuwwah',
        nameAr: 'فوه',
        nameEn: 'Fuwwah',
        districts: [
          { id: 'fuwwah-center', nameAr: 'فوه المركز', nameEn: 'Fuwwah Center' },
        ],
      },
      {
        id: 'metobas',
        nameAr: 'مطوبس',
        nameEn: 'Metobas',
        districts: [
          { id: 'metobas-center', nameAr: 'مطوبس المركز', nameEn: 'Metobas Center' },
        ],
      },
      {
        id: 'el-hamoul',
        nameAr: 'الحامول',
        nameEn: 'El Hamoul',
        districts: [
          { id: 'hamoul-center', nameAr: 'الحامول المركز', nameEn: 'El Hamoul Center' },
        ],
      },
      {
        id: 'biala',
        nameAr: 'بيلا',
        nameEn: 'Biala',
        districts: [
          { id: 'biala-center', nameAr: 'بيلا المركز', nameEn: 'Biala Center' },
        ],
      },
      {
        id: 'sidi-salem',
        nameAr: 'سيدي سالم',
        nameEn: 'Sidi Salem',
        districts: [
          { id: 'sidi-salem-center', nameAr: 'سيدي سالم المركز', nameEn: 'Sidi Salem Center' },
        ],
      },
      {
        id: 'qallin',
        nameAr: 'قلين',
        nameEn: 'Qallin',
        districts: [
          { id: 'qallin-center', nameAr: 'قلين المركز', nameEn: 'Qallin Center' },
        ],
      },
      {
        id: 'el-riad',
        nameAr: 'الرياض',
        nameEn: 'El Riad',
        districts: [
          { id: 'riad-center', nameAr: 'الرياض المركز', nameEn: 'El Riad Center' },
        ],
      },
    ],
  },
  {
    id: 'monufia',
    nameAr: 'المنوفية',
    nameEn: 'Monufia',
    cities: [
      {
        id: 'shibin-el-kom',
        nameAr: 'شبين الكوم',
        nameEn: 'Shibin El Kom',
        districts: [
          { id: 'shibin-kom-center', nameAr: 'شبين الكوم المركز', nameEn: 'Shibin El Kom Center' },
        ],
      },
      {
        id: 'menouf',
        nameAr: 'منوف',
        nameEn: 'Menouf',
        districts: [
          { id: 'menouf-center', nameAr: 'منوف المركز', nameEn: 'Menouf Center' },
        ],
      },
      {
        id: 'ashmoun',
        nameAr: 'أشمون',
        nameEn: 'Ashmoun',
        districts: [
          { id: 'ashmoun-center', nameAr: 'أشمون المركز', nameEn: 'Ashmoun Center' },
        ],
      },
      {
        id: 'el-bagour',
        nameAr: 'الباجور',
        nameEn: 'El Bagour',
        districts: [
          { id: 'bagour-center', nameAr: 'الباجور المركز', nameEn: 'El Bagour Center' },
        ],
      },
      {
        id: 'quesna',
        nameAr: 'قويسنا',
        nameEn: 'Quesna',
        districts: [
          { id: 'quesna-center', nameAr: 'قويسنا المركز', nameEn: 'Quesna Center' },
        ],
      },
      {
        id: 'berket-el-sab',
        nameAr: 'بركة السبع',
        nameEn: 'Berket El Sab',
        districts: [
          { id: 'berket-sab-center', nameAr: 'بركة السبع المركز', nameEn: 'Berket El Sab Center' },
        ],
      },
      {
        id: 'tala',
        nameAr: 'تلا',
        nameEn: 'Tala',
        districts: [
          { id: 'tala-center', nameAr: 'تلا المركز', nameEn: 'Tala Center' },
        ],
      },
      {
        id: 'el-shohada',
        nameAr: 'الشهداء',
        nameEn: 'El Shohada',
        districts: [
          { id: 'shohada-center', nameAr: 'الشهداء المركز', nameEn: 'El Shohada Center' },
        ],
      },
      {
        id: 'sadat-city',
        nameAr: 'مدينة السادات',
        nameEn: 'Sadat City',
        districts: [
          { id: 'sadat-1', nameAr: 'المنطقة الأولى', nameEn: 'Zone 1' },
          { id: 'sadat-2', nameAr: 'المنطقة الثانية', nameEn: 'Zone 2' },
          { id: 'sadat-industrial', nameAr: 'المنطقة الصناعية', nameEn: 'Industrial Zone' },
        ],
      },
    ],
  },
  {
    id: 'beheira',
    nameAr: 'البحيرة',
    nameEn: 'Beheira',
    cities: [
      {
        id: 'damanhour',
        nameAr: 'دمنهور',
        nameEn: 'Damanhour',
        districts: [
          { id: 'damanhour-center', nameAr: 'دمنهور المركز', nameEn: 'Damanhour Center' },
        ],
      },
      {
        id: 'kafr-el-dawwar',
        nameAr: 'كفر الدوار',
        nameEn: 'Kafr El Dawwar',
        districts: [
          { id: 'kafr-dawwar-center', nameAr: 'كفر الدوار المركز', nameEn: 'Kafr El Dawwar Center' },
        ],
      },
      {
        id: 'rashid',
        nameAr: 'رشيد',
        nameEn: 'Rashid (Rosetta)',
        districts: [
          { id: 'rashid-center', nameAr: 'رشيد المركز', nameEn: 'Rashid Center' },
        ],
      },
      {
        id: 'edko',
        nameAr: 'إدكو',
        nameEn: 'Edko',
        districts: [
          { id: 'edko-center', nameAr: 'إدكو المركز', nameEn: 'Edko Center' },
        ],
      },
      {
        id: 'abu-el-matamir',
        nameAr: 'أبو المطامير',
        nameEn: 'Abu El Matamir',
        districts: [
          { id: 'abu-matamir-center', nameAr: 'أبو المطامير المركز', nameEn: 'Abu El Matamir Center' },
        ],
      },
      {
        id: 'abu-hommos',
        nameAr: 'أبو حمص',
        nameEn: 'Abu Hommos',
        districts: [
          { id: 'abu-hommos-center', nameAr: 'أبو حمص المركز', nameEn: 'Abu Hommos Center' },
        ],
      },
      {
        id: 'el-delengat',
        nameAr: 'الدلنجات',
        nameEn: 'El Delengat',
        districts: [
          { id: 'delengat-center', nameAr: 'الدلنجات المركز', nameEn: 'El Delengat Center' },
        ],
      },
      {
        id: 'el-mahmoudiya',
        nameAr: 'المحمودية',
        nameEn: 'El Mahmoudiya',
        districts: [
          { id: 'mahmoudiya-center', nameAr: 'المحمودية المركز', nameEn: 'El Mahmoudiya Center' },
        ],
      },
      {
        id: 'el-rahmaniya',
        nameAr: 'الرحمانية',
        nameEn: 'El Rahmaniya',
        districts: [
          { id: 'rahmaniya-center', nameAr: 'الرحمانية المركز', nameEn: 'El Rahmaniya Center' },
        ],
      },
      {
        id: 'itay-el-barud',
        nameAr: 'إيتاي البارود',
        nameEn: 'Itay El Barud',
        districts: [
          { id: 'itay-barud-center', nameAr: 'إيتاي البارود المركز', nameEn: 'Itay El Barud Center' },
        ],
      },
      {
        id: 'hosh-issa',
        nameAr: 'حوش عيسى',
        nameEn: 'Hosh Issa',
        districts: [
          { id: 'hosh-issa-center', nameAr: 'حوش عيسى المركز', nameEn: 'Hosh Issa Center' },
        ],
      },
      {
        id: 'shubrakhit',
        nameAr: 'شبراخيت',
        nameEn: 'Shubrakhit',
        districts: [
          { id: 'shubrakhit-center', nameAr: 'شبراخيت المركز', nameEn: 'Shubrakhit Center' },
        ],
      },
      {
        id: 'kom-hamada',
        nameAr: 'كوم حمادة',
        nameEn: 'Kom Hamada',
        districts: [
          { id: 'kom-hamada-center', nameAr: 'كوم حمادة المركز', nameEn: 'Kom Hamada Center' },
        ],
      },
      {
        id: 'badr-beheira',
        nameAr: 'بدر',
        nameEn: 'Badr',
        districts: [
          { id: 'badr-beheira-center', nameAr: 'بدر المركز', nameEn: 'Badr Center' },
        ],
      },
      {
        id: 'wadi-el-natrun',
        nameAr: 'وادي النطرون',
        nameEn: 'Wadi El Natrun',
        districts: [
          { id: 'wadi-natrun-center', nameAr: 'وادي النطرون المركز', nameEn: 'Wadi El Natrun Center' },
        ],
      },
      {
        id: 'nubariya',
        nameAr: 'النوبارية',
        nameEn: 'Nubariya',
        districts: [
          { id: 'nubariya-center', nameAr: 'النوبارية المركز', nameEn: 'Nubariya Center' },
        ],
      },
    ],
  },
  {
    id: 'damietta',
    nameAr: 'دمياط',
    nameEn: 'Damietta',
    cities: [
      {
        id: 'damietta-city',
        nameAr: 'دمياط',
        nameEn: 'Damietta City',
        districts: [
          { id: 'damietta-center', nameAr: 'دمياط المركز', nameEn: 'Damietta Center' },
        ],
      },
      {
        id: 'new-damietta',
        nameAr: 'دمياط الجديدة',
        nameEn: 'New Damietta',
        districts: [
          { id: 'new-damietta-center', nameAr: 'دمياط الجديدة المركز', nameEn: 'New Damietta Center' },
        ],
      },
      {
        id: 'ras-el-bar',
        nameAr: 'رأس البر',
        nameEn: 'Ras El Bar',
        districts: [
          { id: 'ras-bar-center', nameAr: 'رأس البر المركز', nameEn: 'Ras El Bar Center' },
        ],
      },
      {
        id: 'faraskour',
        nameAr: 'فارسكور',
        nameEn: 'Faraskour',
        districts: [
          { id: 'faraskour-center', nameAr: 'فارسكور المركز', nameEn: 'Faraskour Center' },
        ],
      },
      {
        id: 'kafr-saad',
        nameAr: 'كفر سعد',
        nameEn: 'Kafr Saad',
        districts: [
          { id: 'kafr-saad-center', nameAr: 'كفر سعد المركز', nameEn: 'Kafr Saad Center' },
        ],
      },
      {
        id: 'el-zarqa',
        nameAr: 'الزرقا',
        nameEn: 'El Zarqa',
        districts: [
          { id: 'zarqa-center', nameAr: 'الزرقا المركز', nameEn: 'El Zarqa Center' },
        ],
      },
    ],
  },

  // ============================================
  // Canal Zone
  // ============================================
  {
    id: 'port-said',
    nameAr: 'بورسعيد',
    nameEn: 'Port Said',
    cities: [
      {
        id: 'port-said-city',
        nameAr: 'بورسعيد',
        nameEn: 'Port Said City',
        districts: [
          { id: 'port-fouad', nameAr: 'بور فؤاد', nameEn: 'Port Fouad' },
          { id: 'el-arab', nameAr: 'العرب', nameEn: 'El Arab' },
          { id: 'el-manakh', nameAr: 'المناخ', nameEn: 'El Manakh' },
          { id: 'el-sharq', nameAr: 'الشرق', nameEn: 'El Sharq' },
          { id: 'el-dawahy', nameAr: 'الضواحي', nameEn: 'El Dawahy' },
          { id: 'el-zohour', nameAr: 'الزهور', nameEn: 'El Zohour' },
        ],
      },
    ],
  },
  {
    id: 'suez',
    nameAr: 'السويس',
    nameEn: 'Suez',
    cities: [
      {
        id: 'suez-city',
        nameAr: 'السويس',
        nameEn: 'Suez City',
        districts: [
          { id: 'el-arbain', nameAr: 'الأربعين', nameEn: 'El Arbain' },
          { id: 'el-ganayen', nameAr: 'الجناين', nameEn: 'El Ganayen' },
          { id: 'faisal-suez', nameAr: 'فيصل', nameEn: 'Faisal' },
          { id: 'ataka', nameAr: 'عتاقة', nameEn: 'Ataka' },
          { id: 'suez-port', nameAr: 'ميناء السويس', nameEn: 'Suez Port' },
        ],
      },
    ],
  },
  {
    id: 'ismailia',
    nameAr: 'الإسماعيلية',
    nameEn: 'Ismailia',
    cities: [
      {
        id: 'ismailia-city',
        nameAr: 'الإسماعيلية',
        nameEn: 'Ismailia City',
        districts: [
          { id: 'ismailia-1', nameAr: 'الإسماعيلية أول', nameEn: 'Ismailia First' },
          { id: 'ismailia-2', nameAr: 'الإسماعيلية ثان', nameEn: 'Ismailia Second' },
          { id: 'ismailia-3', nameAr: 'الإسماعيلية ثالث', nameEn: 'Ismailia Third' },
        ],
      },
      {
        id: 'fayed',
        nameAr: 'فايد',
        nameEn: 'Fayed',
        districts: [
          { id: 'fayed-center', nameAr: 'فايد المركز', nameEn: 'Fayed Center' },
        ],
      },
      {
        id: 'el-qantara',
        nameAr: 'القنطرة شرق',
        nameEn: 'El Qantara East',
        districts: [
          { id: 'qantara-east-center', nameAr: 'القنطرة شرق المركز', nameEn: 'El Qantara East Center' },
        ],
      },
      {
        id: 'el-qantara-west',
        nameAr: 'القنطرة غرب',
        nameEn: 'El Qantara West',
        districts: [
          { id: 'qantara-west-center', nameAr: 'القنطرة غرب المركز', nameEn: 'El Qantara West Center' },
        ],
      },
      {
        id: 'el-tal-el-kebir',
        nameAr: 'التل الكبير',
        nameEn: 'El Tal El Kebir',
        districts: [
          { id: 'tal-kebir-center', nameAr: 'التل الكبير المركز', nameEn: 'El Tal El Kebir Center' },
        ],
      },
      {
        id: 'abu-soweir',
        nameAr: 'أبو صوير',
        nameEn: 'Abu Soweir',
        districts: [
          { id: 'abu-soweir-center', nameAr: 'أبو صوير المركز', nameEn: 'Abu Soweir Center' },
        ],
      },
      {
        id: 'el-kassassin',
        nameAr: 'القصاصين',
        nameEn: 'El Kassassin',
        districts: [
          { id: 'kassassin-center', nameAr: 'القصاصين المركز', nameEn: 'El Kassassin Center' },
        ],
      },
    ],
  },

  // ============================================
  // Upper Egypt
  // ============================================
  {
    id: 'beni-suef',
    nameAr: 'بني سويف',
    nameEn: 'Beni Suef',
    cities: [
      {
        id: 'beni-suef-city',
        nameAr: 'بني سويف',
        nameEn: 'Beni Suef City',
        districts: [
          { id: 'beni-suef-center', nameAr: 'بني سويف المركز', nameEn: 'Beni Suef Center' },
        ],
      },
      {
        id: 'el-wasta',
        nameAr: 'الواسطى',
        nameEn: 'El Wasta',
        districts: [
          { id: 'wasta-center', nameAr: 'الواسطى المركز', nameEn: 'El Wasta Center' },
        ],
      },
      {
        id: 'nasser',
        nameAr: 'ناصر',
        nameEn: 'Nasser',
        districts: [
          { id: 'nasser-center', nameAr: 'ناصر المركز', nameEn: 'Nasser Center' },
        ],
      },
      {
        id: 'ehnasia',
        nameAr: 'إهناسيا',
        nameEn: 'Ehnasia',
        districts: [
          { id: 'ehnasia-center', nameAr: 'إهناسيا المركز', nameEn: 'Ehnasia Center' },
        ],
      },
      {
        id: 'beba',
        nameAr: 'ببا',
        nameEn: 'Beba',
        districts: [
          { id: 'beba-center', nameAr: 'ببا المركز', nameEn: 'Beba Center' },
        ],
      },
      {
        id: 'el-fashn',
        nameAr: 'الفشن',
        nameEn: 'El Fashn',
        districts: [
          { id: 'fashn-center', nameAr: 'الفشن المركز', nameEn: 'El Fashn Center' },
        ],
      },
      {
        id: 'sumusta',
        nameAr: 'سمسطا',
        nameEn: 'Sumusta',
        districts: [
          { id: 'sumusta-center', nameAr: 'سمسطا المركز', nameEn: 'Sumusta Center' },
        ],
      },
    ],
  },
  {
    id: 'fayoum',
    nameAr: 'الفيوم',
    nameEn: 'Fayoum',
    cities: [
      {
        id: 'fayoum-city',
        nameAr: 'الفيوم',
        nameEn: 'Fayoum City',
        districts: [
          { id: 'fayoum-center', nameAr: 'الفيوم المركز', nameEn: 'Fayoum Center' },
        ],
      },
      {
        id: 'ibsheway',
        nameAr: 'إبشواي',
        nameEn: 'Ibsheway',
        districts: [
          { id: 'ibsheway-center', nameAr: 'إبشواي المركز', nameEn: 'Ibsheway Center' },
        ],
      },
      {
        id: 'itsa',
        nameAr: 'إطسا',
        nameEn: 'Itsa',
        districts: [
          { id: 'itsa-center', nameAr: 'إطسا المركز', nameEn: 'Itsa Center' },
        ],
      },
      {
        id: 'sinnuris',
        nameAr: 'سنورس',
        nameEn: 'Sinnuris',
        districts: [
          { id: 'sinnuris-center', nameAr: 'سنورس المركز', nameEn: 'Sinnuris Center' },
        ],
      },
      {
        id: 'tamiya',
        nameAr: 'طامية',
        nameEn: 'Tamiya',
        districts: [
          { id: 'tamiya-center', nameAr: 'طامية المركز', nameEn: 'Tamiya Center' },
        ],
      },
      {
        id: 'yusuf-el-siddiq',
        nameAr: 'يوسف الصديق',
        nameEn: 'Yusuf El Siddiq',
        districts: [
          { id: 'yusuf-siddiq-center', nameAr: 'يوسف الصديق المركز', nameEn: 'Yusuf El Siddiq Center' },
        ],
      },
    ],
  },
  {
    id: 'minya',
    nameAr: 'المنيا',
    nameEn: 'Minya',
    cities: [
      {
        id: 'minya-city',
        nameAr: 'المنيا',
        nameEn: 'Minya City',
        districts: [
          { id: 'minya-center', nameAr: 'المنيا المركز', nameEn: 'Minya Center' },
        ],
      },
      {
        id: 'mallawi',
        nameAr: 'ملوي',
        nameEn: 'Mallawi',
        districts: [
          { id: 'mallawi-center', nameAr: 'ملوي المركز', nameEn: 'Mallawi Center' },
        ],
      },
      {
        id: 'samalout',
        nameAr: 'سمالوط',
        nameEn: 'Samalout',
        districts: [
          { id: 'samalout-center', nameAr: 'سمالوط المركز', nameEn: 'Samalout Center' },
        ],
      },
      {
        id: 'el-edwa',
        nameAr: 'العدوة',
        nameEn: 'El Edwa',
        districts: [
          { id: 'edwa-center', nameAr: 'العدوة المركز', nameEn: 'El Edwa Center' },
        ],
      },
      {
        id: 'maghagha',
        nameAr: 'مغاغة',
        nameEn: 'Maghagha',
        districts: [
          { id: 'maghagha-center', nameAr: 'مغاغة المركز', nameEn: 'Maghagha Center' },
        ],
      },
      {
        id: 'bani-mazar',
        nameAr: 'بني مزار',
        nameEn: 'Bani Mazar',
        districts: [
          { id: 'bani-mazar-center', nameAr: 'بني مزار المركز', nameEn: 'Bani Mazar Center' },
        ],
      },
      {
        id: 'matay',
        nameAr: 'مطاي',
        nameEn: 'Matay',
        districts: [
          { id: 'matay-center', nameAr: 'مطاي المركز', nameEn: 'Matay Center' },
        ],
      },
      {
        id: 'abu-qurqas',
        nameAr: 'أبو قرقاص',
        nameEn: 'Abu Qurqas',
        districts: [
          { id: 'abu-qurqas-center', nameAr: 'أبو قرقاص المركز', nameEn: 'Abu Qurqas Center' },
        ],
      },
      {
        id: 'deir-mawas',
        nameAr: 'دير مواس',
        nameEn: 'Deir Mawas',
        districts: [
          { id: 'deir-mawas-center', nameAr: 'دير مواس المركز', nameEn: 'Deir Mawas Center' },
        ],
      },
    ],
  },
  {
    id: 'assiut',
    nameAr: 'أسيوط',
    nameEn: 'Assiut',
    cities: [
      {
        id: 'assiut-city',
        nameAr: 'أسيوط',
        nameEn: 'Assiut City',
        districts: [
          { id: 'assiut-1', nameAr: 'أسيوط أول', nameEn: 'Assiut First' },
          { id: 'assiut-2', nameAr: 'أسيوط ثان', nameEn: 'Assiut Second' },
        ],
      },
      {
        id: 'dayrout',
        nameAr: 'ديروط',
        nameEn: 'Dayrout',
        districts: [
          { id: 'dayrout-center', nameAr: 'ديروط المركز', nameEn: 'Dayrout Center' },
        ],
      },
      {
        id: 'manfalut',
        nameAr: 'منفلوط',
        nameEn: 'Manfalut',
        districts: [
          { id: 'manfalut-center', nameAr: 'منفلوط المركز', nameEn: 'Manfalut Center' },
        ],
      },
      {
        id: 'el-qusiya',
        nameAr: 'القوصية',
        nameEn: 'El Qusiya',
        districts: [
          { id: 'qusiya-center', nameAr: 'القوصية المركز', nameEn: 'El Qusiya Center' },
        ],
      },
      {
        id: 'abnoub',
        nameAr: 'أبنوب',
        nameEn: 'Abnoub',
        districts: [
          { id: 'abnoub-center', nameAr: 'أبنوب المركز', nameEn: 'Abnoub Center' },
        ],
      },
      {
        id: 'abu-tig',
        nameAr: 'أبو تيج',
        nameEn: 'Abu Tig',
        districts: [
          { id: 'abu-tig-center', nameAr: 'أبو تيج المركز', nameEn: 'Abu Tig Center' },
        ],
      },
      {
        id: 'el-ghanayem',
        nameAr: 'الغنايم',
        nameEn: 'El Ghanayem',
        districts: [
          { id: 'ghanayem-center', nameAr: 'الغنايم المركز', nameEn: 'El Ghanayem Center' },
        ],
      },
      {
        id: 'sahel-selim',
        nameAr: 'ساحل سليم',
        nameEn: 'Sahel Selim',
        districts: [
          { id: 'sahel-selim-center', nameAr: 'ساحل سليم المركز', nameEn: 'Sahel Selim Center' },
        ],
      },
      {
        id: 'el-badari',
        nameAr: 'البداري',
        nameEn: 'El Badari',
        districts: [
          { id: 'badari-center', nameAr: 'البداري المركز', nameEn: 'El Badari Center' },
        ],
      },
      {
        id: 'sidfa',
        nameAr: 'صدفا',
        nameEn: 'Sidfa',
        districts: [
          { id: 'sidfa-center', nameAr: 'صدفا المركز', nameEn: 'Sidfa Center' },
        ],
      },
      {
        id: 'el-fateh',
        nameAr: 'الفتح',
        nameEn: 'El Fateh',
        districts: [
          { id: 'fateh-center', nameAr: 'الفتح المركز', nameEn: 'El Fateh Center' },
        ],
      },
    ],
  },
  {
    id: 'sohag',
    nameAr: 'سوهاج',
    nameEn: 'Sohag',
    cities: [
      {
        id: 'sohag-city',
        nameAr: 'سوهاج',
        nameEn: 'Sohag City',
        districts: [
          { id: 'sohag-1', nameAr: 'سوهاج أول', nameEn: 'Sohag First' },
          { id: 'sohag-2', nameAr: 'سوهاج ثان', nameEn: 'Sohag Second' },
        ],
      },
      {
        id: 'akhmim',
        nameAr: 'أخميم',
        nameEn: 'Akhmim',
        districts: [
          { id: 'akhmim-center', nameAr: 'أخميم المركز', nameEn: 'Akhmim Center' },
        ],
      },
      {
        id: 'girga',
        nameAr: 'جرجا',
        nameEn: 'Girga',
        districts: [
          { id: 'girga-center', nameAr: 'جرجا المركز', nameEn: 'Girga Center' },
        ],
      },
      {
        id: 'el-balyana',
        nameAr: 'البلينا',
        nameEn: 'El Balyana',
        districts: [
          { id: 'balyana-center', nameAr: 'البلينا المركز', nameEn: 'El Balyana Center' },
        ],
      },
      {
        id: 'el-maragha',
        nameAr: 'المراغة',
        nameEn: 'El Maragha',
        districts: [
          { id: 'maragha-center', nameAr: 'المراغة المركز', nameEn: 'El Maragha Center' },
        ],
      },
      {
        id: 'tahta',
        nameAr: 'طهطا',
        nameEn: 'Tahta',
        districts: [
          { id: 'tahta-center', nameAr: 'طهطا المركز', nameEn: 'Tahta Center' },
        ],
      },
      {
        id: 'el-minshah',
        nameAr: 'المنشاة',
        nameEn: 'El Minshah',
        districts: [
          { id: 'minshah-center', nameAr: 'المنشاة المركز', nameEn: 'El Minshah Center' },
        ],
      },
      {
        id: 'sakolta',
        nameAr: 'ساقلتة',
        nameEn: 'Sakolta',
        districts: [
          { id: 'sakolta-center', nameAr: 'ساقلتة المركز', nameEn: 'Sakolta Center' },
        ],
      },
      {
        id: 'tema',
        nameAr: 'طما',
        nameEn: 'Tema',
        districts: [
          { id: 'tema-center', nameAr: 'طما المركز', nameEn: 'Tema Center' },
        ],
      },
      {
        id: 'dar-el-salam-sohag',
        nameAr: 'دار السلام',
        nameEn: 'Dar El Salam',
        districts: [
          { id: 'dar-salam-sohag-center', nameAr: 'دار السلام المركز', nameEn: 'Dar El Salam Center' },
        ],
      },
      {
        id: 'juhayna',
        nameAr: 'جهينة',
        nameEn: 'Juhayna',
        districts: [
          { id: 'juhayna-center', nameAr: 'جهينة المركز', nameEn: 'Juhayna Center' },
        ],
      },
    ],
  },
  {
    id: 'qena',
    nameAr: 'قنا',
    nameEn: 'Qena',
    cities: [
      {
        id: 'qena-city',
        nameAr: 'قنا',
        nameEn: 'Qena City',
        districts: [
          { id: 'qena-center', nameAr: 'قنا المركز', nameEn: 'Qena Center' },
        ],
      },
      {
        id: 'nag-hammadi',
        nameAr: 'نجع حمادي',
        nameEn: 'Nag Hammadi',
        districts: [
          { id: 'nag-hammadi-center', nameAr: 'نجع حمادي المركز', nameEn: 'Nag Hammadi Center' },
        ],
      },
      {
        id: 'luxor',
        nameAr: 'الأقصر',
        nameEn: 'Luxor',
        districts: [
          { id: 'luxor-center', nameAr: 'الأقصر المركز', nameEn: 'Luxor Center' },
        ],
      },
      {
        id: 'esna',
        nameAr: 'إسنا',
        nameEn: 'Esna',
        districts: [
          { id: 'esna-center', nameAr: 'إسنا المركز', nameEn: 'Esna Center' },
        ],
      },
      {
        id: 'qus',
        nameAr: 'قوص',
        nameEn: 'Qus',
        districts: [
          { id: 'qus-center', nameAr: 'قوص المركز', nameEn: 'Qus Center' },
        ],
      },
      {
        id: 'deshna',
        nameAr: 'دشنا',
        nameEn: 'Deshna',
        districts: [
          { id: 'deshna-center', nameAr: 'دشنا المركز', nameEn: 'Deshna Center' },
        ],
      },
      {
        id: 'farshut',
        nameAr: 'فرشوط',
        nameEn: 'Farshut',
        districts: [
          { id: 'farshut-center', nameAr: 'فرشوط المركز', nameEn: 'Farshut Center' },
        ],
      },
      {
        id: 'abu-tesht',
        nameAr: 'أبو تشت',
        nameEn: 'Abu Tesht',
        districts: [
          { id: 'abu-tesht-center', nameAr: 'أبو تشت المركز', nameEn: 'Abu Tesht Center' },
        ],
      },
      {
        id: 'el-waqf',
        nameAr: 'الوقف',
        nameEn: 'El Waqf',
        districts: [
          { id: 'waqf-center', nameAr: 'الوقف المركز', nameEn: 'El Waqf Center' },
        ],
      },
    ],
  },
  {
    id: 'luxor',
    nameAr: 'الأقصر',
    nameEn: 'Luxor',
    cities: [
      {
        id: 'luxor-city',
        nameAr: 'الأقصر',
        nameEn: 'Luxor City',
        districts: [
          { id: 'karnak', nameAr: 'الكرنك', nameEn: 'Karnak' },
          { id: 'luxor-west-bank', nameAr: 'البر الغربي', nameEn: 'West Bank' },
          { id: 'luxor-east-bank', nameAr: 'البر الشرقي', nameEn: 'East Bank' },
        ],
      },
      {
        id: 'armant',
        nameAr: 'أرمنت',
        nameEn: 'Armant',
        districts: [
          { id: 'armant-center', nameAr: 'أرمنت المركز', nameEn: 'Armant Center' },
        ],
      },
      {
        id: 'esna-luxor',
        nameAr: 'إسنا',
        nameEn: 'Esna',
        districts: [
          { id: 'esna-luxor-center', nameAr: 'إسنا المركز', nameEn: 'Esna Center' },
        ],
      },
      {
        id: 'el-bayadiya',
        nameAr: 'البياضية',
        nameEn: 'El Bayadiya',
        districts: [
          { id: 'bayadiya-center', nameAr: 'البياضية المركز', nameEn: 'El Bayadiya Center' },
        ],
      },
      {
        id: 'el-qurna',
        nameAr: 'القرنة',
        nameEn: 'El Qurna',
        districts: [
          { id: 'qurna-center', nameAr: 'القرنة المركز', nameEn: 'El Qurna Center' },
        ],
      },
      {
        id: 'el-zeiniya',
        nameAr: 'الزينية',
        nameEn: 'El Zeiniya',
        districts: [
          { id: 'zeiniya-center', nameAr: 'الزينية المركز', nameEn: 'El Zeiniya Center' },
        ],
      },
      {
        id: 'el-tod',
        nameAr: 'الطود',
        nameEn: 'El Tod',
        districts: [
          { id: 'tod-center', nameAr: 'الطود المركز', nameEn: 'El Tod Center' },
        ],
      },
    ],
  },
  {
    id: 'aswan',
    nameAr: 'أسوان',
    nameEn: 'Aswan',
    cities: [
      {
        id: 'aswan-city',
        nameAr: 'أسوان',
        nameEn: 'Aswan City',
        districts: [
          { id: 'aswan-center', nameAr: 'أسوان المركز', nameEn: 'Aswan Center' },
          { id: 'elephantine', nameAr: 'جزيرة إلفنتين', nameEn: 'Elephantine Island' },
        ],
      },
      {
        id: 'kom-ombo',
        nameAr: 'كوم أمبو',
        nameEn: 'Kom Ombo',
        districts: [
          { id: 'kom-ombo-center', nameAr: 'كوم أمبو المركز', nameEn: 'Kom Ombo Center' },
        ],
      },
      {
        id: 'edfu',
        nameAr: 'إدفو',
        nameEn: 'Edfu',
        districts: [
          { id: 'edfu-center', nameAr: 'إدفو المركز', nameEn: 'Edfu Center' },
        ],
      },
      {
        id: 'daraw',
        nameAr: 'دراو',
        nameEn: 'Daraw',
        districts: [
          { id: 'daraw-center', nameAr: 'دراو المركز', nameEn: 'Daraw Center' },
        ],
      },
      {
        id: 'nasr-el-nuba',
        nameAr: 'نصر النوبة',
        nameEn: 'Nasr El Nuba',
        districts: [
          { id: 'nasr-nuba-center', nameAr: 'نصر النوبة المركز', nameEn: 'Nasr El Nuba Center' },
        ],
      },
      {
        id: 'kalabsha',
        nameAr: 'كلابشة',
        nameEn: 'Kalabsha',
        districts: [
          { id: 'kalabsha-center', nameAr: 'كلابشة المركز', nameEn: 'Kalabsha Center' },
        ],
      },
      {
        id: 'abu-simbel',
        nameAr: 'أبو سمبل',
        nameEn: 'Abu Simbel',
        districts: [
          { id: 'abu-simbel-center', nameAr: 'أبو سمبل المركز', nameEn: 'Abu Simbel Center' },
        ],
      },
    ],
  },

  // ============================================
  // Frontier Governorates
  // ============================================
  {
    id: 'red-sea',
    nameAr: 'البحر الأحمر',
    nameEn: 'Red Sea',
    cities: [
      {
        id: 'hurghada',
        nameAr: 'الغردقة',
        nameEn: 'Hurghada',
        districts: [
          { id: 'el-dahar', nameAr: 'الدهار', nameEn: 'El Dahar' },
          { id: 'sekalla', nameAr: 'سقالة', nameEn: 'Sekalla' },
          { id: 'el-mamsha', nameAr: 'الممشى', nameEn: 'El Mamsha' },
          { id: 'el-kawther', nameAr: 'الكوثر', nameEn: 'El Kawther' },
          { id: 'el-ahyaa', nameAr: 'الأحياء', nameEn: 'El Ahyaa' },
          { id: 'sahl-hasheesh', nameAr: 'سهل حشيش', nameEn: 'Sahl Hasheesh' },
          { id: 'makadi', nameAr: 'مكادي', nameEn: 'Makadi' },
        ],
      },
      {
        id: 'safaga',
        nameAr: 'سفاجا',
        nameEn: 'Safaga',
        districts: [
          { id: 'safaga-center', nameAr: 'سفاجا المركز', nameEn: 'Safaga Center' },
        ],
      },
      {
        id: 'el-quseir',
        nameAr: 'القصير',
        nameEn: 'El Quseir',
        districts: [
          { id: 'quseir-center', nameAr: 'القصير المركز', nameEn: 'El Quseir Center' },
        ],
      },
      {
        id: 'marsa-alam',
        nameAr: 'مرسى علم',
        nameEn: 'Marsa Alam',
        districts: [
          { id: 'marsa-alam-center', nameAr: 'مرسى علم المركز', nameEn: 'Marsa Alam Center' },
        ],
      },
      {
        id: 'ras-ghareb',
        nameAr: 'رأس غارب',
        nameEn: 'Ras Ghareb',
        districts: [
          { id: 'ras-ghareb-center', nameAr: 'رأس غارب المركز', nameEn: 'Ras Ghareb Center' },
        ],
      },
      {
        id: 'shalateen',
        nameAr: 'شلاتين',
        nameEn: 'Shalateen',
        districts: [
          { id: 'shalateen-center', nameAr: 'شلاتين المركز', nameEn: 'Shalateen Center' },
        ],
      },
      {
        id: 'halayeb',
        nameAr: 'حلايب',
        nameEn: 'Halayeb',
        districts: [
          { id: 'halayeb-center', nameAr: 'حلايب المركز', nameEn: 'Halayeb Center' },
        ],
      },
    ],
  },
  {
    id: 'new-valley',
    nameAr: 'الوادي الجديد',
    nameEn: 'New Valley',
    cities: [
      {
        id: 'kharga',
        nameAr: 'الخارجة',
        nameEn: 'Kharga',
        districts: [
          { id: 'kharga-center', nameAr: 'الخارجة المركز', nameEn: 'Kharga Center' },
        ],
      },
      {
        id: 'dakhla',
        nameAr: 'الداخلة',
        nameEn: 'Dakhla',
        districts: [
          { id: 'dakhla-center', nameAr: 'الداخلة المركز', nameEn: 'Dakhla Center' },
        ],
      },
      {
        id: 'farafra',
        nameAr: 'الفرافرة',
        nameEn: 'Farafra',
        districts: [
          { id: 'farafra-center', nameAr: 'الفرافرة المركز', nameEn: 'Farafra Center' },
        ],
      },
      {
        id: 'baris',
        nameAr: 'باريس',
        nameEn: 'Baris',
        districts: [
          { id: 'baris-center', nameAr: 'باريس المركز', nameEn: 'Baris Center' },
        ],
      },
      {
        id: 'balat',
        nameAr: 'بلاط',
        nameEn: 'Balat',
        districts: [
          { id: 'balat-center', nameAr: 'بلاط المركز', nameEn: 'Balat Center' },
        ],
      },
    ],
  },
  {
    id: 'matruh',
    nameAr: 'مطروح',
    nameEn: 'Matruh',
    cities: [
      {
        id: 'marsa-matruh',
        nameAr: 'مرسى مطروح',
        nameEn: 'Marsa Matruh',
        districts: [
          { id: 'matruh-center', nameAr: 'مرسى مطروح المركز', nameEn: 'Marsa Matruh Center' },
          { id: 'rommel-beach', nameAr: 'شاطئ روميل', nameEn: 'Rommel Beach' },
          { id: 'agiba-beach', nameAr: 'شاطئ عجيبة', nameEn: 'Agiba Beach' },
        ],
      },
      {
        id: 'el-alamein',
        nameAr: 'العلمين',
        nameEn: 'El Alamein',
        districts: [
          { id: 'alamein-center', nameAr: 'العلمين المركز', nameEn: 'El Alamein Center' },
          { id: 'new-alamein', nameAr: 'العلمين الجديدة', nameEn: 'New Alamein' },
        ],
      },
      {
        id: 'el-hamam',
        nameAr: 'الحمام',
        nameEn: 'El Hamam',
        districts: [
          { id: 'hamam-center', nameAr: 'الحمام المركز', nameEn: 'El Hamam Center' },
        ],
      },
      {
        id: 'el-dabaa',
        nameAr: 'الضبعة',
        nameEn: 'El Dabaa',
        districts: [
          { id: 'dabaa-center', nameAr: 'الضبعة المركز', nameEn: 'El Dabaa Center' },
        ],
      },
      {
        id: 'sidi-barani',
        nameAr: 'سيدي براني',
        nameEn: 'Sidi Barani',
        districts: [
          { id: 'sidi-barani-center', nameAr: 'سيدي براني المركز', nameEn: 'Sidi Barani Center' },
        ],
      },
      {
        id: 'salloum',
        nameAr: 'السلوم',
        nameEn: 'Salloum',
        districts: [
          { id: 'salloum-center', nameAr: 'السلوم المركز', nameEn: 'Salloum Center' },
        ],
      },
      {
        id: 'siwa',
        nameAr: 'سيوة',
        nameEn: 'Siwa',
        districts: [
          { id: 'siwa-center', nameAr: 'سيوة المركز', nameEn: 'Siwa Center' },
        ],
      },
    ],
  },
  {
    id: 'north-sinai',
    nameAr: 'شمال سيناء',
    nameEn: 'North Sinai',
    cities: [
      {
        id: 'el-arish',
        nameAr: 'العريش',
        nameEn: 'El Arish',
        districts: [
          { id: 'arish-center', nameAr: 'العريش المركز', nameEn: 'El Arish Center' },
        ],
      },
      {
        id: 'sheikh-zuweid',
        nameAr: 'الشيخ زويد',
        nameEn: 'Sheikh Zuweid',
        districts: [
          { id: 'sheikh-zuweid-center', nameAr: 'الشيخ زويد المركز', nameEn: 'Sheikh Zuweid Center' },
        ],
      },
      {
        id: 'rafah',
        nameAr: 'رفح',
        nameEn: 'Rafah',
        districts: [
          { id: 'rafah-center', nameAr: 'رفح المركز', nameEn: 'Rafah Center' },
        ],
      },
      {
        id: 'bir-el-abd',
        nameAr: 'بئر العبد',
        nameEn: 'Bir El Abd',
        districts: [
          { id: 'bir-abd-center', nameAr: 'بئر العبد المركز', nameEn: 'Bir El Abd Center' },
        ],
      },
      {
        id: 'el-hasana',
        nameAr: 'الحسنة',
        nameEn: 'El Hasana',
        districts: [
          { id: 'hasana-center', nameAr: 'الحسنة المركز', nameEn: 'El Hasana Center' },
        ],
      },
      {
        id: 'nekhl',
        nameAr: 'نخل',
        nameEn: 'Nekhl',
        districts: [
          { id: 'nekhl-center', nameAr: 'نخل المركز', nameEn: 'Nekhl Center' },
        ],
      },
    ],
  },
  {
    id: 'south-sinai',
    nameAr: 'جنوب سيناء',
    nameEn: 'South Sinai',
    cities: [
      {
        id: 'sharm-el-sheikh',
        nameAr: 'شرم الشيخ',
        nameEn: 'Sharm El Sheikh',
        districts: [
          { id: 'naama-bay', nameAr: 'خليج نعمة', nameEn: 'Naama Bay' },
          { id: 'hadaba', nameAr: 'الهضبة', nameEn: 'Hadaba' },
          { id: 'shark-bay', nameAr: 'خليج القرش', nameEn: 'Shark Bay' },
          { id: 'nabq', nameAr: 'نبق', nameEn: 'Nabq' },
          { id: 'ras-mohammed', nameAr: 'رأس محمد', nameEn: 'Ras Mohammed' },
        ],
      },
      {
        id: 'dahab',
        nameAr: 'دهب',
        nameEn: 'Dahab',
        districts: [
          { id: 'dahab-center', nameAr: 'دهب المركز', nameEn: 'Dahab Center' },
          { id: 'blue-hole', nameAr: 'الحفرة الزرقاء', nameEn: 'Blue Hole' },
        ],
      },
      {
        id: 'nuweiba',
        nameAr: 'نويبع',
        nameEn: 'Nuweiba',
        districts: [
          { id: 'nuweiba-center', nameAr: 'نويبع المركز', nameEn: 'Nuweiba Center' },
        ],
      },
      {
        id: 'taba',
        nameAr: 'طابا',
        nameEn: 'Taba',
        districts: [
          { id: 'taba-center', nameAr: 'طابا المركز', nameEn: 'Taba Center' },
        ],
      },
      {
        id: 'saint-catherine',
        nameAr: 'سانت كاترين',
        nameEn: 'Saint Catherine',
        districts: [
          { id: 'saint-catherine-center', nameAr: 'سانت كاترين المركز', nameEn: 'Saint Catherine Center' },
        ],
      },
      {
        id: 'el-tor',
        nameAr: 'الطور',
        nameEn: 'El Tor',
        districts: [
          { id: 'tor-center', nameAr: 'الطور المركز', nameEn: 'El Tor Center' },
        ],
      },
      {
        id: 'abu-rudeis',
        nameAr: 'أبو رديس',
        nameEn: 'Abu Rudeis',
        districts: [
          { id: 'abu-rudeis-center', nameAr: 'أبو رديس المركز', nameEn: 'Abu Rudeis Center' },
        ],
      },
      {
        id: 'abu-zenima',
        nameAr: 'أبو زنيمة',
        nameEn: 'Abu Zenima',
        districts: [
          { id: 'abu-zenima-center', nameAr: 'أبو زنيمة المركز', nameEn: 'Abu Zenima Center' },
        ],
      },
    ],
  },
];

// Helper functions
export const getGovernorateById = (id: string): Governorate | undefined => {
  return egyptLocations.find(g => g.id === id);
};

export const getCityById = (governorateId: string, cityId: string): City | undefined => {
  const governorate = getGovernorateById(governorateId);
  return governorate?.cities.find(c => c.id === cityId);
};

export const getDistrictById = (governorateId: string, cityId: string, districtId: string): District | undefined => {
  const city = getCityById(governorateId, cityId);
  return city?.districts.find(d => d.id === districtId);
};

export const getAllGovernorates = (): Pick<Governorate, 'id' | 'nameAr' | 'nameEn'>[] => {
  return egyptLocations.map(({ id, nameAr, nameEn }) => ({ id, nameAr, nameEn }));
};

export const getCitiesByGovernorate = (governorateId: string): Pick<City, 'id' | 'nameAr' | 'nameEn'>[] => {
  const governorate = getGovernorateById(governorateId);
  return governorate?.cities.map(({ id, nameAr, nameEn }) => ({ id, nameAr, nameEn })) || [];
};

export const getDistrictsByCity = (governorateId: string, cityId: string): District[] => {
  const city = getCityById(governorateId, cityId);
  return city?.districts || [];
};

export default egyptLocations;
