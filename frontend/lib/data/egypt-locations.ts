/**
 * Egyptian Locations Data (Static)
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
  // Greater Cairo Region
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
          { id: 'banha-center', nameAr: 'بنها المركز', nameEn: 'Banha Center' },
        ],
      },
      {
        id: 'shubra-el-kheima',
        nameAr: 'شبرا الخيمة',
        nameEn: 'Shubra El Kheima',
        districts: [
          { id: 'shubra-kheima-center', nameAr: 'شبرا الخيمة المركز', nameEn: 'Shubra El Kheima Center' },
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
    ],
  },

  // Alexandria Region
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
          { id: 'el-mansheya', nameAr: 'المنشية', nameEn: 'El Mansheya' },
          { id: 'bahary', nameAr: 'بحري', nameEn: 'Bahary' },
          { id: 'el-gomrok', nameAr: 'الجمرك', nameEn: 'El Gomrok' },
          { id: 'karmouz', nameAr: 'كرموز', nameEn: 'Karmouz' },
          { id: 'el-dekhila', nameAr: 'الدخيلة', nameEn: 'El Dekhila' },
          { id: 'el-agamy', nameAr: 'العجمي', nameEn: 'El Agamy' },
          { id: 'el-amreya', nameAr: 'العامرية', nameEn: 'El Amreya' },
          { id: 'borg-el-arab', nameAr: 'برج العرب', nameEn: 'Borg El Arab' },
          { id: 'smouha', nameAr: 'سموحة', nameEn: 'Smouha' },
          { id: 'sidi-bishr', nameAr: 'سيدي بشر', nameEn: 'Sidi Bishr' },
          { id: 'miami', nameAr: 'ميامي', nameEn: 'Miami' },
          { id: 'mandara', nameAr: 'المندرة', nameEn: 'Mandara' },
          { id: 'abu-kir', nameAr: 'أبو قير', nameEn: 'Abu Kir' },
        ],
      },
    ],
  },

  // Delta Region
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
        id: 'sadat-city',
        nameAr: 'مدينة السادات',
        nameEn: 'Sadat City',
        districts: [
          { id: 'sadat-1', nameAr: 'المنطقة الأولى', nameEn: 'Zone 1' },
          { id: 'sadat-2', nameAr: 'المنطقة الثانية', nameEn: 'Zone 2' },
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
        id: 'wadi-el-natrun',
        nameAr: 'وادي النطرون',
        nameEn: 'Wadi El Natrun',
        districts: [
          { id: 'wadi-natrun-center', nameAr: 'وادي النطرون المركز', nameEn: 'Wadi El Natrun Center' },
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
    ],
  },

  // Canal Zone
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
          { id: 'el-sharq', nameAr: 'الشرق', nameEn: 'El Sharq' },
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
    ],
  },

  // Upper Egypt
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
        id: 'abu-simbel',
        nameAr: 'أبو سمبل',
        nameEn: 'Abu Simbel',
        districts: [
          { id: 'abu-simbel-center', nameAr: 'أبو سمبل المركز', nameEn: 'Abu Simbel Center' },
        ],
      },
    ],
  },

  // Frontier Governorates
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
          { id: 'sahl-hasheesh', nameAr: 'سهل حشيش', nameEn: 'Sahl Hasheesh' },
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
        id: 'marsa-alam',
        nameAr: 'مرسى علم',
        nameEn: 'Marsa Alam',
        districts: [
          { id: 'marsa-alam-center', nameAr: 'مرسى علم المركز', nameEn: 'Marsa Alam Center' },
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
        id: 'rafah',
        nameAr: 'رفح',
        nameEn: 'Rafah',
        districts: [
          { id: 'rafah-center', nameAr: 'رفح المركز', nameEn: 'Rafah Center' },
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
        ],
      },
      {
        id: 'dahab',
        nameAr: 'دهب',
        nameEn: 'Dahab',
        districts: [
          { id: 'dahab-center', nameAr: 'دهب المركز', nameEn: 'Dahab Center' },
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
    ],
  },
];

// Helper functions
export const getAllGovernorates = (): Governorate[] => egyptLocations;

export const getGovernorateById = (id: string): Governorate | undefined => {
  return egyptLocations.find(g => g.id === id);
};

export const getCitiesByGovernorate = (governorateId: string): City[] => {
  const governorate = getGovernorateById(governorateId);
  return governorate?.cities || [];
};

export const getDistrictsByCity = (governorateId: string, cityId: string): District[] => {
  const cities = getCitiesByGovernorate(governorateId);
  const city = cities.find(c => c.id === cityId);
  return city?.districts || [];
};

export default egyptLocations;
