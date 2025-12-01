// Egyptian Locations Data - الموقع الجغرافي في مصر
// Hierarchy: Country > Governorate > City > District

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

export interface Country {
  id: string;
  nameAr: string;
  nameEn: string;
  governorates: Governorate[];
}

// Egyptian Governorates with Cities and Districts
export const EGYPT: Country = {
  id: 'egypt',
  nameAr: 'مصر',
  nameEn: 'Egypt',
  governorates: [
    {
      id: 'cairo',
      nameAr: 'القاهرة',
      nameEn: 'Cairo',
      cities: [
        {
          id: 'cairo-city',
          nameAr: 'القاهرة',
          nameEn: 'Cairo',
          districts: [
            { id: 'nasr-city', nameAr: 'مدينة نصر', nameEn: 'Nasr City' },
            { id: 'heliopolis', nameAr: 'مصر الجديدة', nameEn: 'Heliopolis' },
            { id: 'maadi', nameAr: 'المعادي', nameEn: 'Maadi' },
            { id: 'zamalek', nameAr: 'الزمالك', nameEn: 'Zamalek' },
            { id: 'dokki', nameAr: 'الدقي', nameEn: 'Dokki' },
            { id: 'mohandessin', nameAr: 'المهندسين', nameEn: 'Mohandessin' },
            { id: 'garden-city', nameAr: 'جاردن سيتي', nameEn: 'Garden City' },
            { id: 'downtown', nameAr: 'وسط البلد', nameEn: 'Downtown' },
            { id: 'shubra', nameAr: 'شبرا', nameEn: 'Shubra' },
            { id: 'ain-shams', nameAr: 'عين شمس', nameEn: 'Ain Shams' },
            { id: 'el-matareya', nameAr: 'المطرية', nameEn: 'El Matareya' },
            { id: 'el-marg', nameAr: 'المرج', nameEn: 'El Marg' },
            { id: 'el-salam', nameAr: 'السلام', nameEn: 'El Salam' },
            { id: 'el-nozha', nameAr: 'النزهة', nameEn: 'El Nozha' },
            { id: 'el-zeitoun', nameAr: 'الزيتون', nameEn: 'El Zeitoun' },
            { id: 'hadayek-el-kobba', nameAr: 'حدائق القبة', nameEn: 'Hadayek El Kobba' },
            { id: 'el-weili', nameAr: 'الوايلي', nameEn: 'El Weili' },
            { id: 'bab-el-shaareya', nameAr: 'باب الشعرية', nameEn: 'Bab El Shaareya' },
            { id: 'el-azbakeya', nameAr: 'الأزبكية', nameEn: 'El Azbakeya' },
            { id: 'abdeen', nameAr: 'عابدين', nameEn: 'Abdeen' },
            { id: 'el-sayeda-zeinab', nameAr: 'السيدة زينب', nameEn: 'El Sayeda Zeinab' },
            { id: 'el-khalifa', nameAr: 'الخليفة', nameEn: 'El Khalifa' },
            { id: 'el-mosky', nameAr: 'الموسكي', nameEn: 'El Mosky' },
            { id: 'el-darb-el-ahmar', nameAr: 'الدرب الأحمر', nameEn: 'El Darb El Ahmar' },
            { id: 'el-gamaliya', nameAr: 'الجمالية', nameEn: 'El Gamaliya' },
            { id: 'manshiyet-nasser', nameAr: 'منشية ناصر', nameEn: 'Manshiyet Nasser' },
            { id: 'el-basateen', nameAr: 'البساتين', nameEn: 'El Basateen' },
            { id: 'dar-el-salam', nameAr: 'دار السلام', nameEn: 'Dar El Salam' },
            { id: 'el-tebeen', nameAr: 'التبين', nameEn: 'El Tebeen' },
            { id: 'helwan', nameAr: 'حلوان', nameEn: 'Helwan' },
            { id: '15-may', nameAr: '15 مايو', nameEn: '15 May' },
          ],
        },
        {
          id: 'new-cairo',
          nameAr: 'القاهرة الجديدة',
          nameEn: 'New Cairo',
          districts: [
            { id: 'first-settlement', nameAr: 'التجمع الأول', nameEn: 'First Settlement' },
            { id: 'fifth-settlement', nameAr: 'التجمع الخامس', nameEn: 'Fifth Settlement' },
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
          nameEn: 'Giza',
          districts: [
            { id: 'dokki-giza', nameAr: 'الدقي', nameEn: 'Dokki' },
            { id: 'agouza', nameAr: 'العجوزة', nameEn: 'Agouza' },
            { id: 'mohandessin-giza', nameAr: 'المهندسين', nameEn: 'Mohandessin' },
            { id: 'imbaba', nameAr: 'إمبابة', nameEn: 'Imbaba' },
            { id: 'boulaq-el-dakrour', nameAr: 'بولاق الدكرور', nameEn: 'Boulaq El Dakrour' },
            { id: 'el-omraniya', nameAr: 'العمرانية', nameEn: 'El Omraniya' },
            { id: 'el-haram', nameAr: 'الهرم', nameEn: 'El Haram' },
            { id: 'faisal', nameAr: 'فيصل', nameEn: 'Faisal' },
            { id: 'el-warraq', nameAr: 'الوراق', nameEn: 'El Warraq' },
            { id: 'oseem', nameAr: 'أوسيم', nameEn: 'Oseem' },
            { id: 'kerdasa', nameAr: 'كرداسة', nameEn: 'Kerdasa' },
            { id: 'el-badrasheen', nameAr: 'البدرشين', nameEn: 'El Badrasheen' },
            { id: 'el-saf', nameAr: 'الصف', nameEn: 'El Saf' },
            { id: 'atfeeh', nameAr: 'أطفيح', nameEn: 'Atfeeh' },
            { id: 'el-ayat', nameAr: 'العياط', nameEn: 'El Ayat' },
          ],
        },
        {
          id: '6-october',
          nameAr: '6 أكتوبر',
          nameEn: '6th of October',
          districts: [
            { id: 'first-district', nameAr: 'الحي الأول', nameEn: 'First District' },
            { id: 'second-district', nameAr: 'الحي الثاني', nameEn: 'Second District' },
            { id: 'third-district', nameAr: 'الحي الثالث', nameEn: 'Third District' },
            { id: 'fourth-district', nameAr: 'الحي الرابع', nameEn: 'Fourth District' },
            { id: 'fifth-district', nameAr: 'الحي الخامس', nameEn: 'Fifth District' },
            { id: 'sixth-district', nameAr: 'الحي السادس', nameEn: 'Sixth District' },
            { id: 'seventh-district', nameAr: 'الحي السابع', nameEn: 'Seventh District' },
            { id: 'eighth-district', nameAr: 'الحي الثامن', nameEn: 'Eighth District' },
            { id: 'dream-land', nameAr: 'دريم لاند', nameEn: 'Dream Land' },
            { id: 'el-sheikh-zayed', nameAr: 'الشيخ زايد', nameEn: 'El Sheikh Zayed' },
            { id: 'beverly-hills', nameAr: 'بيفرلي هيلز', nameEn: 'Beverly Hills' },
            { id: 'palm-hills', nameAr: 'بالم هيلز', nameEn: 'Palm Hills' },
          ],
        },
      ],
    },
    {
      id: 'alexandria',
      nameAr: 'الإسكندرية',
      nameEn: 'Alexandria',
      cities: [
        {
          id: 'alexandria-city',
          nameAr: 'الإسكندرية',
          nameEn: 'Alexandria',
          districts: [
            { id: 'el-montaza', nameAr: 'المنتزه', nameEn: 'El Montaza' },
            { id: 'el-mandara', nameAr: 'المندرة', nameEn: 'El Mandara' },
            { id: 'el-maamoura', nameAr: 'المعمورة', nameEn: 'El Maamoura' },
            { id: 'miami', nameAr: 'ميامي', nameEn: 'Miami' },
            { id: 'sidi-bishr', nameAr: 'سيدي بشر', nameEn: 'Sidi Bishr' },
            { id: 'victoria', nameAr: 'فيكتوريا', nameEn: 'Victoria' },
            { id: 'el-raml', nameAr: 'الرمل', nameEn: 'El Raml' },
            { id: 'stanley', nameAr: 'ستانلي', nameEn: 'Stanley' },
            { id: 'gleem', nameAr: 'جليم', nameEn: 'Gleem' },
            { id: 'san-stefano', nameAr: 'سان ستيفانو', nameEn: 'San Stefano' },
            { id: 'sidi-gaber', nameAr: 'سيدي جابر', nameEn: 'Sidi Gaber' },
            { id: 'el-ibrahimeya', nameAr: 'الإبراهيمية', nameEn: 'El Ibrahimeya' },
            { id: 'sporting', nameAr: 'سبورتينج', nameEn: 'Sporting' },
            { id: 'smouha', nameAr: 'سموحة', nameEn: 'Smouha' },
            { id: 'loran', nameAr: 'لوران', nameEn: 'Loran' },
            { id: 'roushdy', nameAr: 'رشدي', nameEn: 'Roushdy' },
            { id: 'el-shatby', nameAr: 'الشاطبي', nameEn: 'El Shatby' },
            { id: 'kamp-shizar', nameAr: 'كامب شيزار', nameEn: 'Camp Shizar' },
            { id: 'el-manshiya', nameAr: 'المنشية', nameEn: 'El Manshiya' },
            { id: 'el-attareen', nameAr: 'العطارين', nameEn: 'El Attareen' },
            { id: 'moharam-bek', nameAr: 'محرم بك', nameEn: 'Moharam Bek' },
            { id: 'el-labban', nameAr: 'اللبان', nameEn: 'El Labban' },
            { id: 'el-gomrok', nameAr: 'الجمرك', nameEn: 'El Gomrok' },
            { id: 'el-dekheila', nameAr: 'الدخيلة', nameEn: 'El Dekheila' },
            { id: 'el-amreya', nameAr: 'العامرية', nameEn: 'El Amreya' },
            { id: 'borg-el-arab', nameAr: 'برج العرب', nameEn: 'Borg El Arab' },
            { id: 'new-borg-el-arab', nameAr: 'برج العرب الجديدة', nameEn: 'New Borg El Arab' },
            { id: 'agami', nameAr: 'العجمي', nameEn: 'Agami' },
            { id: 'el-bitash', nameAr: 'البيطاش', nameEn: 'El Bitash' },
            { id: 'hannoville', nameAr: 'هانوفيل', nameEn: 'Hannoville' },
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
            { id: 'banha-center', nameAr: 'مركز بنها', nameEn: 'Banha Center' },
          ],
        },
        {
          id: 'shubra-el-kheima',
          nameAr: 'شبرا الخيمة',
          nameEn: 'Shubra El Kheima',
          districts: [
            { id: 'shubra-kheima-center', nameAr: 'مركز شبرا الخيمة', nameEn: 'Shubra El Kheima Center' },
          ],
        },
        {
          id: 'qalyub',
          nameAr: 'قليوب',
          nameEn: 'Qalyub',
          districts: [
            { id: 'qalyub-center', nameAr: 'مركز قليوب', nameEn: 'Qalyub Center' },
          ],
        },
        {
          id: 'el-khanka',
          nameAr: 'الخانكة',
          nameEn: 'El Khanka',
          districts: [
            { id: 'el-khanka-center', nameAr: 'مركز الخانكة', nameEn: 'El Khanka Center' },
          ],
        },
        {
          id: 'kafr-shukr',
          nameAr: 'كفر شكر',
          nameEn: 'Kafr Shukr',
          districts: [
            { id: 'kafr-shukr-center', nameAr: 'مركز كفر شكر', nameEn: 'Kafr Shukr Center' },
          ],
        },
        {
          id: 'tukh',
          nameAr: 'طوخ',
          nameEn: 'Tukh',
          districts: [
            { id: 'tukh-center', nameAr: 'مركز طوخ', nameEn: 'Tukh Center' },
          ],
        },
        {
          id: 'el-qanater-el-khayreya',
          nameAr: 'القناطر الخيرية',
          nameEn: 'El Qanater El Khayreya',
          districts: [
            { id: 'qanater-center', nameAr: 'مركز القناطر الخيرية', nameEn: 'El Qanater El Khayreya Center' },
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
            { id: 'zagazig-center', nameAr: 'مركز الزقازيق', nameEn: 'Zagazig Center' },
          ],
        },
        {
          id: '10th-of-ramadan',
          nameAr: 'العاشر من رمضان',
          nameEn: '10th of Ramadan',
          districts: [
            { id: '10th-ramadan-center', nameAr: 'مركز العاشر', nameEn: '10th of Ramadan Center' },
          ],
        },
        {
          id: 'belbeis',
          nameAr: 'بلبيس',
          nameEn: 'Belbeis',
          districts: [
            { id: 'belbeis-center', nameAr: 'مركز بلبيس', nameEn: 'Belbeis Center' },
          ],
        },
        {
          id: 'minya-el-qamh',
          nameAr: 'منيا القمح',
          nameEn: 'Minya El Qamh',
          districts: [
            { id: 'minya-qamh-center', nameAr: 'مركز منيا القمح', nameEn: 'Minya El Qamh Center' },
          ],
        },
        {
          id: 'abu-hammad',
          nameAr: 'أبو حماد',
          nameEn: 'Abu Hammad',
          districts: [
            { id: 'abu-hammad-center', nameAr: 'مركز أبو حماد', nameEn: 'Abu Hammad Center' },
          ],
        },
        {
          id: 'faqous',
          nameAr: 'فاقوس',
          nameEn: 'Faqous',
          districts: [
            { id: 'faqous-center', nameAr: 'مركز فاقوس', nameEn: 'Faqous Center' },
          ],
        },
        {
          id: 'abu-kabir',
          nameAr: 'أبو كبير',
          nameEn: 'Abu Kabir',
          districts: [
            { id: 'abu-kabir-center', nameAr: 'مركز أبو كبير', nameEn: 'Abu Kabir Center' },
          ],
        },
        {
          id: 'el-husseiniya',
          nameAr: 'الحسينية',
          nameEn: 'El Husseiniya',
          districts: [
            { id: 'husseiniya-center', nameAr: 'مركز الحسينية', nameEn: 'El Husseiniya Center' },
          ],
        },
      ],
    },
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
            { id: 'mansoura-center', nameAr: 'مركز المنصورة', nameEn: 'Mansoura Center' },
            { id: 'talkha', nameAr: 'طلخا', nameEn: 'Talkha' },
          ],
        },
        {
          id: 'mit-ghamr',
          nameAr: 'ميت غمر',
          nameEn: 'Mit Ghamr',
          districts: [
            { id: 'mit-ghamr-center', nameAr: 'مركز ميت غمر', nameEn: 'Mit Ghamr Center' },
          ],
        },
        {
          id: 'dekernes',
          nameAr: 'دكرنس',
          nameEn: 'Dekernes',
          districts: [
            { id: 'dekernes-center', nameAr: 'مركز دكرنس', nameEn: 'Dekernes Center' },
          ],
        },
        {
          id: 'aga',
          nameAr: 'أجا',
          nameEn: 'Aga',
          districts: [
            { id: 'aga-center', nameAr: 'مركز أجا', nameEn: 'Aga Center' },
          ],
        },
        {
          id: 'belqas',
          nameAr: 'بلقاس',
          nameEn: 'Belqas',
          districts: [
            { id: 'belqas-center', nameAr: 'مركز بلقاس', nameEn: 'Belqas Center' },
          ],
        },
        {
          id: 'sherbin',
          nameAr: 'شربين',
          nameEn: 'Sherbin',
          districts: [
            { id: 'sherbin-center', nameAr: 'مركز شربين', nameEn: 'Sherbin Center' },
          ],
        },
        {
          id: 'el-senbellawein',
          nameAr: 'السنبلاوين',
          nameEn: 'El Senbellawein',
          districts: [
            { id: 'senbellawein-center', nameAr: 'مركز السنبلاوين', nameEn: 'El Senbellawein Center' },
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
            { id: 'tanta-center', nameAr: 'مركز طنطا', nameEn: 'Tanta Center' },
          ],
        },
        {
          id: 'el-mahalla-el-kubra',
          nameAr: 'المحلة الكبرى',
          nameEn: 'El Mahalla El Kubra',
          districts: [
            { id: 'mahalla-center', nameAr: 'مركز المحلة الكبرى', nameEn: 'El Mahalla El Kubra Center' },
          ],
        },
        {
          id: 'kafr-el-zayat',
          nameAr: 'كفر الزيات',
          nameEn: 'Kafr El Zayat',
          districts: [
            { id: 'kafr-zayat-center', nameAr: 'مركز كفر الزيات', nameEn: 'Kafr El Zayat Center' },
          ],
        },
        {
          id: 'zefta',
          nameAr: 'زفتى',
          nameEn: 'Zefta',
          districts: [
            { id: 'zefta-center', nameAr: 'مركز زفتى', nameEn: 'Zefta Center' },
          ],
        },
        {
          id: 'samanoud',
          nameAr: 'سمنود',
          nameEn: 'Samanoud',
          districts: [
            { id: 'samanoud-center', nameAr: 'مركز سمنود', nameEn: 'Samanoud Center' },
          ],
        },
        {
          id: 'el-santa',
          nameAr: 'السنطة',
          nameEn: 'El Santa',
          districts: [
            { id: 'santa-center', nameAr: 'مركز السنطة', nameEn: 'El Santa Center' },
          ],
        },
        {
          id: 'basyoun',
          nameAr: 'بسيون',
          nameEn: 'Basyoun',
          districts: [
            { id: 'basyoun-center', nameAr: 'مركز بسيون', nameEn: 'Basyoun Center' },
          ],
        },
        {
          id: 'kotour',
          nameAr: 'قطور',
          nameEn: 'Kotour',
          districts: [
            { id: 'kotour-center', nameAr: 'مركز قطور', nameEn: 'Kotour Center' },
          ],
        },
      ],
    },
    {
      id: 'menoufia',
      nameAr: 'المنوفية',
      nameEn: 'Menoufia',
      cities: [
        {
          id: 'shebin-el-kom',
          nameAr: 'شبين الكوم',
          nameEn: 'Shebin El Kom',
          districts: [
            { id: 'shebin-kom-center', nameAr: 'مركز شبين الكوم', nameEn: 'Shebin El Kom Center' },
          ],
        },
        {
          id: 'menouf',
          nameAr: 'منوف',
          nameEn: 'Menouf',
          districts: [
            { id: 'menouf-center', nameAr: 'مركز منوف', nameEn: 'Menouf Center' },
          ],
        },
        {
          id: 'sadat-city',
          nameAr: 'مدينة السادات',
          nameEn: 'Sadat City',
          districts: [
            { id: 'sadat-center', nameAr: 'مركز السادات', nameEn: 'Sadat City Center' },
          ],
        },
        {
          id: 'ashmoun',
          nameAr: 'أشمون',
          nameEn: 'Ashmoun',
          districts: [
            { id: 'ashmoun-center', nameAr: 'مركز أشمون', nameEn: 'Ashmoun Center' },
          ],
        },
        {
          id: 'el-bagour',
          nameAr: 'الباجور',
          nameEn: 'El Bagour',
          districts: [
            { id: 'bagour-center', nameAr: 'مركز الباجور', nameEn: 'El Bagour Center' },
          ],
        },
        {
          id: 'quesna',
          nameAr: 'قويسنا',
          nameEn: 'Quesna',
          districts: [
            { id: 'quesna-center', nameAr: 'مركز قويسنا', nameEn: 'Quesna Center' },
          ],
        },
        {
          id: 'berket-el-sab',
          nameAr: 'بركة السبع',
          nameEn: 'Berket El Sab',
          districts: [
            { id: 'berket-sab-center', nameAr: 'مركز بركة السبع', nameEn: 'Berket El Sab Center' },
          ],
        },
        {
          id: 'tala',
          nameAr: 'تلا',
          nameEn: 'Tala',
          districts: [
            { id: 'tala-center', nameAr: 'مركز تلا', nameEn: 'Tala Center' },
          ],
        },
        {
          id: 'el-shohada',
          nameAr: 'الشهداء',
          nameEn: 'El Shohada',
          districts: [
            { id: 'shohada-center', nameAr: 'مركز الشهداء', nameEn: 'El Shohada Center' },
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
            { id: 'damanhour-center', nameAr: 'مركز دمنهور', nameEn: 'Damanhour Center' },
          ],
        },
        {
          id: 'kafr-el-dawwar',
          nameAr: 'كفر الدوار',
          nameEn: 'Kafr El Dawwar',
          districts: [
            { id: 'kafr-dawwar-center', nameAr: 'مركز كفر الدوار', nameEn: 'Kafr El Dawwar Center' },
          ],
        },
        {
          id: 'rashid',
          nameAr: 'رشيد',
          nameEn: 'Rashid',
          districts: [
            { id: 'rashid-center', nameAr: 'مركز رشيد', nameEn: 'Rashid Center' },
          ],
        },
        {
          id: 'edku',
          nameAr: 'إدكو',
          nameEn: 'Edku',
          districts: [
            { id: 'edku-center', nameAr: 'مركز إدكو', nameEn: 'Edku Center' },
          ],
        },
        {
          id: 'abu-el-matamir',
          nameAr: 'أبو المطامير',
          nameEn: 'Abu El Matamir',
          districts: [
            { id: 'abu-matamir-center', nameAr: 'مركز أبو المطامير', nameEn: 'Abu El Matamir Center' },
          ],
        },
        {
          id: 'hosh-issa',
          nameAr: 'حوش عيسى',
          nameEn: 'Hosh Issa',
          districts: [
            { id: 'hosh-issa-center', nameAr: 'مركز حوش عيسى', nameEn: 'Hosh Issa Center' },
          ],
        },
        {
          id: 'el-delengat',
          nameAr: 'الدلنجات',
          nameEn: 'El Delengat',
          districts: [
            { id: 'delengat-center', nameAr: 'مركز الدلنجات', nameEn: 'El Delengat Center' },
          ],
        },
        {
          id: 'itay-el-barud',
          nameAr: 'إيتاي البارود',
          nameEn: 'Itay El Barud',
          districts: [
            { id: 'itay-barud-center', nameAr: 'مركز إيتاي البارود', nameEn: 'Itay El Barud Center' },
          ],
        },
        {
          id: 'shubrakhit',
          nameAr: 'شبراخيت',
          nameEn: 'Shubrakhit',
          districts: [
            { id: 'shubrakhit-center', nameAr: 'مركز شبراخيت', nameEn: 'Shubrakhit Center' },
          ],
        },
        {
          id: 'kom-hamada',
          nameAr: 'كوم حمادة',
          nameEn: 'Kom Hamada',
          districts: [
            { id: 'kom-hamada-center', nameAr: 'مركز كوم حمادة', nameEn: 'Kom Hamada Center' },
          ],
        },
        {
          id: 'el-mahmoudia',
          nameAr: 'المحمودية',
          nameEn: 'El Mahmoudia',
          districts: [
            { id: 'mahmoudia-center', nameAr: 'مركز المحمودية', nameEn: 'El Mahmoudia Center' },
          ],
        },
        {
          id: 'el-rahmaniya',
          nameAr: 'الرحمانية',
          nameEn: 'El Rahmaniya',
          districts: [
            { id: 'rahmaniya-center', nameAr: 'مركز الرحمانية', nameEn: 'El Rahmaniya Center' },
          ],
        },
        {
          id: 'wadi-el-natroun',
          nameAr: 'وادي النطرون',
          nameEn: 'Wadi El Natroun',
          districts: [
            { id: 'wadi-natroun-center', nameAr: 'مركز وادي النطرون', nameEn: 'Wadi El Natroun Center' },
          ],
        },
        {
          id: 'el-nobariya',
          nameAr: 'النوبارية الجديدة',
          nameEn: 'New Nobariya',
          districts: [
            { id: 'nobariya-center', nameAr: 'مركز النوبارية', nameEn: 'New Nobariya Center' },
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
          id: 'kafr-sheikh-city',
          nameAr: 'كفر الشيخ',
          nameEn: 'Kafr El Sheikh',
          districts: [
            { id: 'kafr-sheikh-center', nameAr: 'مركز كفر الشيخ', nameEn: 'Kafr El Sheikh Center' },
          ],
        },
        {
          id: 'desouk',
          nameAr: 'دسوق',
          nameEn: 'Desouk',
          districts: [
            { id: 'desouk-center', nameAr: 'مركز دسوق', nameEn: 'Desouk Center' },
          ],
        },
        {
          id: 'fuwwah',
          nameAr: 'فوة',
          nameEn: 'Fuwwah',
          districts: [
            { id: 'fuwwah-center', nameAr: 'مركز فوة', nameEn: 'Fuwwah Center' },
          ],
        },
        {
          id: 'metobas',
          nameAr: 'مطوبس',
          nameEn: 'Metobas',
          districts: [
            { id: 'metobas-center', nameAr: 'مركز مطوبس', nameEn: 'Metobas Center' },
          ],
        },
        {
          id: 'el-burullus',
          nameAr: 'البرلس',
          nameEn: 'El Burullus',
          districts: [
            { id: 'burullus-center', nameAr: 'مركز البرلس', nameEn: 'El Burullus Center' },
          ],
        },
        {
          id: 'baltim',
          nameAr: 'بلطيم',
          nameEn: 'Baltim',
          districts: [
            { id: 'baltim-center', nameAr: 'مركز بلطيم', nameEn: 'Baltim Center' },
          ],
        },
        {
          id: 'sidi-salem',
          nameAr: 'سيدي سالم',
          nameEn: 'Sidi Salem',
          districts: [
            { id: 'sidi-salem-center', nameAr: 'مركز سيدي سالم', nameEn: 'Sidi Salem Center' },
          ],
        },
        {
          id: 'beyala',
          nameAr: 'بيلا',
          nameEn: 'Beyala',
          districts: [
            { id: 'beyala-center', nameAr: 'مركز بيلا', nameEn: 'Beyala Center' },
          ],
        },
        {
          id: 'el-reyad',
          nameAr: 'الرياض',
          nameEn: 'El Reyad',
          districts: [
            { id: 'reyad-center', nameAr: 'مركز الرياض', nameEn: 'El Reyad Center' },
          ],
        },
        {
          id: 'qallin',
          nameAr: 'قلين',
          nameEn: 'Qallin',
          districts: [
            { id: 'qallin-center', nameAr: 'مركز قلين', nameEn: 'Qallin Center' },
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
          nameEn: 'Damietta',
          districts: [
            { id: 'damietta-center', nameAr: 'مركز دمياط', nameEn: 'Damietta Center' },
          ],
        },
        {
          id: 'new-damietta',
          nameAr: 'دمياط الجديدة',
          nameEn: 'New Damietta',
          districts: [
            { id: 'new-damietta-center', nameAr: 'مركز دمياط الجديدة', nameEn: 'New Damietta Center' },
          ],
        },
        {
          id: 'ras-el-bar',
          nameAr: 'رأس البر',
          nameEn: 'Ras El Bar',
          districts: [
            { id: 'ras-bar-center', nameAr: 'مركز رأس البر', nameEn: 'Ras El Bar Center' },
          ],
        },
        {
          id: 'faraskour',
          nameAr: 'فارسكور',
          nameEn: 'Faraskour',
          districts: [
            { id: 'faraskour-center', nameAr: 'مركز فارسكور', nameEn: 'Faraskour Center' },
          ],
        },
        {
          id: 'kafr-saad',
          nameAr: 'كفر سعد',
          nameEn: 'Kafr Saad',
          districts: [
            { id: 'kafr-saad-center', nameAr: 'مركز كفر سعد', nameEn: 'Kafr Saad Center' },
          ],
        },
        {
          id: 'el-zarqa',
          nameAr: 'الزرقا',
          nameEn: 'El Zarqa',
          districts: [
            { id: 'zarqa-center', nameAr: 'مركز الزرقا', nameEn: 'El Zarqa Center' },
          ],
        },
      ],
    },
    {
      id: 'port-said',
      nameAr: 'بورسعيد',
      nameEn: 'Port Said',
      cities: [
        {
          id: 'port-said-city',
          nameAr: 'بورسعيد',
          nameEn: 'Port Said',
          districts: [
            { id: 'el-sharq', nameAr: 'حي الشرق', nameEn: 'El Sharq' },
            { id: 'el-arab', nameAr: 'حي العرب', nameEn: 'El Arab' },
            { id: 'el-manakh', nameAr: 'حي المناخ', nameEn: 'El Manakh' },
            { id: 'el-zohour', nameAr: 'حي الزهور', nameEn: 'El Zohour' },
            { id: 'el-dawahi', nameAr: 'حي الضواحي', nameEn: 'El Dawahi' },
            { id: 'port-fouad', nameAr: 'بور فؤاد', nameEn: 'Port Fouad' },
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
          nameEn: 'Ismailia',
          districts: [
            { id: 'ismailia-center', nameAr: 'مركز الإسماعيلية', nameEn: 'Ismailia Center' },
          ],
        },
        {
          id: 'fayed',
          nameAr: 'فايد',
          nameEn: 'Fayed',
          districts: [
            { id: 'fayed-center', nameAr: 'مركز فايد', nameEn: 'Fayed Center' },
          ],
        },
        {
          id: 'el-qantara-sharq',
          nameAr: 'القنطرة شرق',
          nameEn: 'El Qantara Sharq',
          districts: [
            { id: 'qantara-sharq-center', nameAr: 'مركز القنطرة شرق', nameEn: 'El Qantara Sharq Center' },
          ],
        },
        {
          id: 'el-qantara-gharb',
          nameAr: 'القنطرة غرب',
          nameEn: 'El Qantara Gharb',
          districts: [
            { id: 'qantara-gharb-center', nameAr: 'مركز القنطرة غرب', nameEn: 'El Qantara Gharb Center' },
          ],
        },
        {
          id: 'el-tal-el-kabir',
          nameAr: 'التل الكبير',
          nameEn: 'El Tal El Kabir',
          districts: [
            { id: 'tal-kabir-center', nameAr: 'مركز التل الكبير', nameEn: 'El Tal El Kabir Center' },
          ],
        },
        {
          id: 'abu-sawir',
          nameAr: 'أبو صوير',
          nameEn: 'Abu Sawir',
          districts: [
            { id: 'abu-sawir-center', nameAr: 'مركز أبو صوير', nameEn: 'Abu Sawir Center' },
          ],
        },
        {
          id: 'el-kasaseen',
          nameAr: 'القصاصين',
          nameEn: 'El Kasaseen',
          districts: [
            { id: 'kasaseen-center', nameAr: 'مركز القصاصين', nameEn: 'El Kasaseen Center' },
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
          nameEn: 'Suez',
          districts: [
            { id: 'el-suez', nameAr: 'حي السويس', nameEn: 'El Suez' },
            { id: 'el-arbaaen', nameAr: 'حي الأربعين', nameEn: 'El Arbaaen' },
            { id: 'attaka', nameAr: 'حي عتاقة', nameEn: 'Attaka' },
            { id: 'el-ganayen', nameAr: 'حي الجناين', nameEn: 'El Ganayen' },
            { id: 'faisal-suez', nameAr: 'حي فيصل', nameEn: 'Faisal' },
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
            { id: 'arish-center', nameAr: 'مركز العريش', nameEn: 'El Arish Center' },
          ],
        },
        {
          id: 'sheikh-zuweid',
          nameAr: 'الشيخ زويد',
          nameEn: 'Sheikh Zuweid',
          districts: [
            { id: 'sheikh-zuweid-center', nameAr: 'مركز الشيخ زويد', nameEn: 'Sheikh Zuweid Center' },
          ],
        },
        {
          id: 'rafah',
          nameAr: 'رفح',
          nameEn: 'Rafah',
          districts: [
            { id: 'rafah-center', nameAr: 'مركز رفح', nameEn: 'Rafah Center' },
          ],
        },
        {
          id: 'bir-el-abd',
          nameAr: 'بئر العبد',
          nameEn: 'Bir El Abd',
          districts: [
            { id: 'bir-abd-center', nameAr: 'مركز بئر العبد', nameEn: 'Bir El Abd Center' },
          ],
        },
        {
          id: 'el-hasana',
          nameAr: 'الحسنة',
          nameEn: 'El Hasana',
          districts: [
            { id: 'hasana-center', nameAr: 'مركز الحسنة', nameEn: 'El Hasana Center' },
          ],
        },
        {
          id: 'nakhl',
          nameAr: 'نخل',
          nameEn: 'Nakhl',
          districts: [
            { id: 'nakhl-center', nameAr: 'مركز نخل', nameEn: 'Nakhl Center' },
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
          id: 'el-tor',
          nameAr: 'الطور',
          nameEn: 'El Tor',
          districts: [
            { id: 'tor-center', nameAr: 'مركز الطور', nameEn: 'El Tor Center' },
          ],
        },
        {
          id: 'sharm-el-sheikh',
          nameAr: 'شرم الشيخ',
          nameEn: 'Sharm El Sheikh',
          districts: [
            { id: 'naama-bay', nameAr: 'خليج نعمة', nameEn: 'Naama Bay' },
            { id: 'el-hadaba', nameAr: 'الهضبة', nameEn: 'El Hadaba' },
            { id: 'nabq-bay', nameAr: 'خليج نبق', nameEn: 'Nabq Bay' },
            { id: 'sharks-bay', nameAr: 'خليج القرش', nameEn: 'Sharks Bay' },
          ],
        },
        {
          id: 'dahab',
          nameAr: 'دهب',
          nameEn: 'Dahab',
          districts: [
            { id: 'dahab-center', nameAr: 'مركز دهب', nameEn: 'Dahab Center' },
          ],
        },
        {
          id: 'nuweiba',
          nameAr: 'نويبع',
          nameEn: 'Nuweiba',
          districts: [
            { id: 'nuweiba-center', nameAr: 'مركز نويبع', nameEn: 'Nuweiba Center' },
          ],
        },
        {
          id: 'taba',
          nameAr: 'طابا',
          nameEn: 'Taba',
          districts: [
            { id: 'taba-center', nameAr: 'مركز طابا', nameEn: 'Taba Center' },
          ],
        },
        {
          id: 'saint-catherine',
          nameAr: 'سانت كاترين',
          nameEn: 'Saint Catherine',
          districts: [
            { id: 'saint-catherine-center', nameAr: 'مركز سانت كاترين', nameEn: 'Saint Catherine Center' },
          ],
        },
        {
          id: 'ras-sidr',
          nameAr: 'رأس سدر',
          nameEn: 'Ras Sidr',
          districts: [
            { id: 'ras-sidr-center', nameAr: 'مركز رأس سدر', nameEn: 'Ras Sidr Center' },
          ],
        },
        {
          id: 'abu-rudeis',
          nameAr: 'أبو رديس',
          nameEn: 'Abu Rudeis',
          districts: [
            { id: 'abu-rudeis-center', nameAr: 'مركز أبو رديس', nameEn: 'Abu Rudeis Center' },
          ],
        },
        {
          id: 'abu-zenima',
          nameAr: 'أبو زنيمة',
          nameEn: 'Abu Zenima',
          districts: [
            { id: 'abu-zenima-center', nameAr: 'مركز أبو زنيمة', nameEn: 'Abu Zenima Center' },
          ],
        },
      ],
    },
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
            { id: 'sekalla', nameAr: 'السقالة', nameEn: 'Sekalla' },
            { id: 'el-kawther', nameAr: 'الكوثر', nameEn: 'El Kawther' },
            { id: 'el-hadaba-hurghada', nameAr: 'الهضبة', nameEn: 'El Hadaba' },
            { id: 'el-mamsha', nameAr: 'الممشى', nameEn: 'El Mamsha' },
            { id: 'sahl-hasheesh', nameAr: 'سهل حشيش', nameEn: 'Sahl Hasheesh' },
            { id: 'el-gouna', nameAr: 'الجونة', nameEn: 'El Gouna' },
          ],
        },
        {
          id: 'safaga',
          nameAr: 'سفاجا',
          nameEn: 'Safaga',
          districts: [
            { id: 'safaga-center', nameAr: 'مركز سفاجا', nameEn: 'Safaga Center' },
          ],
        },
        {
          id: 'el-quseir',
          nameAr: 'القصير',
          nameEn: 'El Quseir',
          districts: [
            { id: 'quseir-center', nameAr: 'مركز القصير', nameEn: 'El Quseir Center' },
          ],
        },
        {
          id: 'marsa-alam',
          nameAr: 'مرسى علم',
          nameEn: 'Marsa Alam',
          districts: [
            { id: 'marsa-alam-center', nameAr: 'مركز مرسى علم', nameEn: 'Marsa Alam Center' },
          ],
        },
        {
          id: 'ras-ghareb',
          nameAr: 'رأس غارب',
          nameEn: 'Ras Ghareb',
          districts: [
            { id: 'ras-ghareb-center', nameAr: 'مركز رأس غارب', nameEn: 'Ras Ghareb Center' },
          ],
        },
        {
          id: 'shalatin',
          nameAr: 'شلاتين',
          nameEn: 'Shalatin',
          districts: [
            { id: 'shalatin-center', nameAr: 'مركز شلاتين', nameEn: 'Shalatin Center' },
          ],
        },
        {
          id: 'halayeb',
          nameAr: 'حلايب',
          nameEn: 'Halayeb',
          districts: [
            { id: 'halayeb-center', nameAr: 'مركز حلايب', nameEn: 'Halayeb Center' },
          ],
        },
      ],
    },
    {
      id: 'matrouh',
      nameAr: 'مطروح',
      nameEn: 'Matrouh',
      cities: [
        {
          id: 'marsa-matrouh',
          nameAr: 'مرسى مطروح',
          nameEn: 'Marsa Matrouh',
          districts: [
            { id: 'matrouh-center', nameAr: 'مركز مرسى مطروح', nameEn: 'Marsa Matrouh Center' },
          ],
        },
        {
          id: 'el-alamein',
          nameAr: 'العلمين',
          nameEn: 'El Alamein',
          districts: [
            { id: 'alamein-center', nameAr: 'مركز العلمين', nameEn: 'El Alamein Center' },
          ],
        },
        {
          id: 'new-alamein',
          nameAr: 'العلمين الجديدة',
          nameEn: 'New Alamein',
          districts: [
            { id: 'new-alamein-center', nameAr: 'مركز العلمين الجديدة', nameEn: 'New Alamein Center' },
          ],
        },
        {
          id: 'el-hamam',
          nameAr: 'الحمام',
          nameEn: 'El Hamam',
          districts: [
            { id: 'hamam-center', nameAr: 'مركز الحمام', nameEn: 'El Hamam Center' },
          ],
        },
        {
          id: 'el-dabaa',
          nameAr: 'الضبعة',
          nameEn: 'El Dabaa',
          districts: [
            { id: 'dabaa-center', nameAr: 'مركز الضبعة', nameEn: 'El Dabaa Center' },
          ],
        },
        {
          id: 'sidi-barani',
          nameAr: 'سيدي براني',
          nameEn: 'Sidi Barani',
          districts: [
            { id: 'sidi-barani-center', nameAr: 'مركز سيدي براني', nameEn: 'Sidi Barani Center' },
          ],
        },
        {
          id: 'salloum',
          nameAr: 'السلوم',
          nameEn: 'Salloum',
          districts: [
            { id: 'salloum-center', nameAr: 'مركز السلوم', nameEn: 'Salloum Center' },
          ],
        },
        {
          id: 'siwa',
          nameAr: 'سيوة',
          nameEn: 'Siwa',
          districts: [
            { id: 'siwa-center', nameAr: 'مركز سيوة', nameEn: 'Siwa Center' },
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
          id: 'el-kharga',
          nameAr: 'الخارجة',
          nameEn: 'El Kharga',
          districts: [
            { id: 'kharga-center', nameAr: 'مركز الخارجة', nameEn: 'El Kharga Center' },
          ],
        },
        {
          id: 'el-dakhla',
          nameAr: 'الداخلة',
          nameEn: 'El Dakhla',
          districts: [
            { id: 'dakhla-center', nameAr: 'مركز الداخلة', nameEn: 'El Dakhla Center' },
          ],
        },
        {
          id: 'el-farafra',
          nameAr: 'الفرافرة',
          nameEn: 'El Farafra',
          districts: [
            { id: 'farafra-center', nameAr: 'مركز الفرافرة', nameEn: 'El Farafra Center' },
          ],
        },
        {
          id: 'baris',
          nameAr: 'باريس',
          nameEn: 'Baris',
          districts: [
            { id: 'baris-center', nameAr: 'مركز باريس', nameEn: 'Baris Center' },
          ],
        },
        {
          id: 'balat',
          nameAr: 'بلاط',
          nameEn: 'Balat',
          districts: [
            { id: 'balat-center', nameAr: 'مركز بلاط', nameEn: 'Balat Center' },
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
          nameEn: 'Fayoum',
          districts: [
            { id: 'fayoum-center', nameAr: 'مركز الفيوم', nameEn: 'Fayoum Center' },
          ],
        },
        {
          id: 'tamiya',
          nameAr: 'طامية',
          nameEn: 'Tamiya',
          districts: [
            { id: 'tamiya-center', nameAr: 'مركز طامية', nameEn: 'Tamiya Center' },
          ],
        },
        {
          id: 'snores',
          nameAr: 'سنورس',
          nameEn: 'Snores',
          districts: [
            { id: 'snores-center', nameAr: 'مركز سنورس', nameEn: 'Snores Center' },
          ],
        },
        {
          id: 'ibsheway',
          nameAr: 'إبشواي',
          nameEn: 'Ibsheway',
          districts: [
            { id: 'ibsheway-center', nameAr: 'مركز إبشواي', nameEn: 'Ibsheway Center' },
          ],
        },
        {
          id: 'itsa',
          nameAr: 'إطسا',
          nameEn: 'Itsa',
          districts: [
            { id: 'itsa-center', nameAr: 'مركز إطسا', nameEn: 'Itsa Center' },
          ],
        },
        {
          id: 'youssef-el-seddik',
          nameAr: 'يوسف الصديق',
          nameEn: 'Youssef El Seddik',
          districts: [
            { id: 'youssef-seddik-center', nameAr: 'مركز يوسف الصديق', nameEn: 'Youssef El Seddik Center' },
          ],
        },
      ],
    },
    {
      id: 'beni-suef',
      nameAr: 'بني سويف',
      nameEn: 'Beni Suef',
      cities: [
        {
          id: 'beni-suef-city',
          nameAr: 'بني سويف',
          nameEn: 'Beni Suef',
          districts: [
            { id: 'beni-suef-center', nameAr: 'مركز بني سويف', nameEn: 'Beni Suef Center' },
          ],
        },
        {
          id: 'nasser',
          nameAr: 'ناصر',
          nameEn: 'Nasser',
          districts: [
            { id: 'nasser-center', nameAr: 'مركز ناصر', nameEn: 'Nasser Center' },
          ],
        },
        {
          id: 'el-wasta',
          nameAr: 'الواسطى',
          nameEn: 'El Wasta',
          districts: [
            { id: 'wasta-center', nameAr: 'مركز الواسطى', nameEn: 'El Wasta Center' },
          ],
        },
        {
          id: 'bebaa',
          nameAr: 'ببا',
          nameEn: 'Bebaa',
          districts: [
            { id: 'bebaa-center', nameAr: 'مركز ببا', nameEn: 'Bebaa Center' },
          ],
        },
        {
          id: 'ihnasya',
          nameAr: 'إهناسيا',
          nameEn: 'Ihnasya',
          districts: [
            { id: 'ihnasya-center', nameAr: 'مركز إهناسيا', nameEn: 'Ihnasya Center' },
          ],
        },
        {
          id: 'el-fashn',
          nameAr: 'الفشن',
          nameEn: 'El Fashn',
          districts: [
            { id: 'fashn-center', nameAr: 'مركز الفشن', nameEn: 'El Fashn Center' },
          ],
        },
        {
          id: 'sumusta',
          nameAr: 'سمسطا',
          nameEn: 'Sumusta',
          districts: [
            { id: 'sumusta-center', nameAr: 'مركز سمسطا', nameEn: 'Sumusta Center' },
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
          nameEn: 'Minya',
          districts: [
            { id: 'minya-center', nameAr: 'مركز المنيا', nameEn: 'Minya Center' },
          ],
        },
        {
          id: 'new-minya',
          nameAr: 'المنيا الجديدة',
          nameEn: 'New Minya',
          districts: [
            { id: 'new-minya-center', nameAr: 'مركز المنيا الجديدة', nameEn: 'New Minya Center' },
          ],
        },
        {
          id: 'mallawi',
          nameAr: 'ملوي',
          nameEn: 'Mallawi',
          districts: [
            { id: 'mallawi-center', nameAr: 'مركز ملوي', nameEn: 'Mallawi Center' },
          ],
        },
        {
          id: 'beni-mazar',
          nameAr: 'بني مزار',
          nameEn: 'Beni Mazar',
          districts: [
            { id: 'beni-mazar-center', nameAr: 'مركز بني مزار', nameEn: 'Beni Mazar Center' },
          ],
        },
        {
          id: 'maghagha',
          nameAr: 'مغاغة',
          nameEn: 'Maghagha',
          districts: [
            { id: 'maghagha-center', nameAr: 'مركز مغاغة', nameEn: 'Maghagha Center' },
          ],
        },
        {
          id: 'mattay',
          nameAr: 'مطاي',
          nameEn: 'Mattay',
          districts: [
            { id: 'mattay-center', nameAr: 'مركز مطاي', nameEn: 'Mattay Center' },
          ],
        },
        {
          id: 'samalut',
          nameAr: 'سمالوط',
          nameEn: 'Samalut',
          districts: [
            { id: 'samalut-center', nameAr: 'مركز سمالوط', nameEn: 'Samalut Center' },
          ],
        },
        {
          id: 'abu-qurqas',
          nameAr: 'أبو قرقاص',
          nameEn: 'Abu Qurqas',
          districts: [
            { id: 'abu-qurqas-center', nameAr: 'مركز أبو قرقاص', nameEn: 'Abu Qurqas Center' },
          ],
        },
        {
          id: 'deir-mawas',
          nameAr: 'دير مواس',
          nameEn: 'Deir Mawas',
          districts: [
            { id: 'deir-mawas-center', nameAr: 'مركز دير مواس', nameEn: 'Deir Mawas Center' },
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
          nameEn: 'Assiut',
          districts: [
            { id: 'assiut-center', nameAr: 'مركز أسيوط', nameEn: 'Assiut Center' },
          ],
        },
        {
          id: 'new-assiut',
          nameAr: 'أسيوط الجديدة',
          nameEn: 'New Assiut',
          districts: [
            { id: 'new-assiut-center', nameAr: 'مركز أسيوط الجديدة', nameEn: 'New Assiut Center' },
          ],
        },
        {
          id: 'dayrut',
          nameAr: 'ديروط',
          nameEn: 'Dayrut',
          districts: [
            { id: 'dayrut-center', nameAr: 'مركز ديروط', nameEn: 'Dayrut Center' },
          ],
        },
        {
          id: 'manfalut',
          nameAr: 'منفلوط',
          nameEn: 'Manfalut',
          districts: [
            { id: 'manfalut-center', nameAr: 'مركز منفلوط', nameEn: 'Manfalut Center' },
          ],
        },
        {
          id: 'el-qusiya',
          nameAr: 'القوصية',
          nameEn: 'El Qusiya',
          districts: [
            { id: 'qusiya-center', nameAr: 'مركز القوصية', nameEn: 'El Qusiya Center' },
          ],
        },
        {
          id: 'abnoub',
          nameAr: 'أبنوب',
          nameEn: 'Abnoub',
          districts: [
            { id: 'abnoub-center', nameAr: 'مركز أبنوب', nameEn: 'Abnoub Center' },
          ],
        },
        {
          id: 'el-fath',
          nameAr: 'الفتح',
          nameEn: 'El Fath',
          districts: [
            { id: 'fath-center', nameAr: 'مركز الفتح', nameEn: 'El Fath Center' },
          ],
        },
        {
          id: 'sahel-selim',
          nameAr: 'ساحل سليم',
          nameEn: 'Sahel Selim',
          districts: [
            { id: 'sahel-selim-center', nameAr: 'مركز ساحل سليم', nameEn: 'Sahel Selim Center' },
          ],
        },
        {
          id: 'el-badari',
          nameAr: 'البداري',
          nameEn: 'El Badari',
          districts: [
            { id: 'badari-center', nameAr: 'مركز البداري', nameEn: 'El Badari Center' },
          ],
        },
        {
          id: 'sidfa',
          nameAr: 'صدفا',
          nameEn: 'Sidfa',
          districts: [
            { id: 'sidfa-center', nameAr: 'مركز صدفا', nameEn: 'Sidfa Center' },
          ],
        },
        {
          id: 'el-ghanaim',
          nameAr: 'الغنايم',
          nameEn: 'El Ghanaim',
          districts: [
            { id: 'ghanaim-center', nameAr: 'مركز الغنايم', nameEn: 'El Ghanaim Center' },
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
          nameEn: 'Sohag',
          districts: [
            { id: 'sohag-center', nameAr: 'مركز سوهاج', nameEn: 'Sohag Center' },
          ],
        },
        {
          id: 'new-sohag',
          nameAr: 'سوهاج الجديدة',
          nameEn: 'New Sohag',
          districts: [
            { id: 'new-sohag-center', nameAr: 'مركز سوهاج الجديدة', nameEn: 'New Sohag Center' },
          ],
        },
        {
          id: 'akhmim',
          nameAr: 'أخميم',
          nameEn: 'Akhmim',
          districts: [
            { id: 'akhmim-center', nameAr: 'مركز أخميم', nameEn: 'Akhmim Center' },
          ],
        },
        {
          id: 'girga',
          nameAr: 'جرجا',
          nameEn: 'Girga',
          districts: [
            { id: 'girga-center', nameAr: 'مركز جرجا', nameEn: 'Girga Center' },
          ],
        },
        {
          id: 'el-balyana',
          nameAr: 'البلينا',
          nameEn: 'El Balyana',
          districts: [
            { id: 'balyana-center', nameAr: 'مركز البلينا', nameEn: 'El Balyana Center' },
          ],
        },
        {
          id: 'el-maragha',
          nameAr: 'المراغة',
          nameEn: 'El Maragha',
          districts: [
            { id: 'maragha-center', nameAr: 'مركز المراغة', nameEn: 'El Maragha Center' },
          ],
        },
        {
          id: 'tima',
          nameAr: 'طما',
          nameEn: 'Tima',
          districts: [
            { id: 'tima-center', nameAr: 'مركز طما', nameEn: 'Tima Center' },
          ],
        },
        {
          id: 'tahta',
          nameAr: 'طهطا',
          nameEn: 'Tahta',
          districts: [
            { id: 'tahta-center', nameAr: 'مركز طهطا', nameEn: 'Tahta Center' },
          ],
        },
        {
          id: 'el-monsha',
          nameAr: 'المنشأة',
          nameEn: 'El Monsha',
          districts: [
            { id: 'monsha-center', nameAr: 'مركز المنشأة', nameEn: 'El Monsha Center' },
          ],
        },
        {
          id: 'dar-el-salam-sohag',
          nameAr: 'دار السلام',
          nameEn: 'Dar El Salam',
          districts: [
            { id: 'dar-salam-center', nameAr: 'مركز دار السلام', nameEn: 'Dar El Salam Center' },
          ],
        },
        {
          id: 'sakulta',
          nameAr: 'ساقلتة',
          nameEn: 'Sakulta',
          districts: [
            { id: 'sakulta-center', nameAr: 'مركز ساقلتة', nameEn: 'Sakulta Center' },
          ],
        },
        {
          id: 'juhayna',
          nameAr: 'جهينة',
          nameEn: 'Juhayna',
          districts: [
            { id: 'juhayna-center', nameAr: 'مركز جهينة', nameEn: 'Juhayna Center' },
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
          nameEn: 'Qena',
          districts: [
            { id: 'qena-center', nameAr: 'مركز قنا', nameEn: 'Qena Center' },
          ],
        },
        {
          id: 'new-qena',
          nameAr: 'قنا الجديدة',
          nameEn: 'New Qena',
          districts: [
            { id: 'new-qena-center', nameAr: 'مركز قنا الجديدة', nameEn: 'New Qena Center' },
          ],
        },
        {
          id: 'nag-hammadi',
          nameAr: 'نجع حمادي',
          nameEn: 'Nag Hammadi',
          districts: [
            { id: 'nag-hammadi-center', nameAr: 'مركز نجع حمادي', nameEn: 'Nag Hammadi Center' },
          ],
        },
        {
          id: 'dishna',
          nameAr: 'دشنا',
          nameEn: 'Dishna',
          districts: [
            { id: 'dishna-center', nameAr: 'مركز دشنا', nameEn: 'Dishna Center' },
          ],
        },
        {
          id: 'qus',
          nameAr: 'قوص',
          nameEn: 'Qus',
          districts: [
            { id: 'qus-center', nameAr: 'مركز قوص', nameEn: 'Qus Center' },
          ],
        },
        {
          id: 'farshut',
          nameAr: 'فرشوط',
          nameEn: 'Farshut',
          districts: [
            { id: 'farshut-center', nameAr: 'مركز فرشوط', nameEn: 'Farshut Center' },
          ],
        },
        {
          id: 'abu-tesht',
          nameAr: 'أبو تشت',
          nameEn: 'Abu Tesht',
          districts: [
            { id: 'abu-tesht-center', nameAr: 'مركز أبو تشت', nameEn: 'Abu Tesht Center' },
          ],
        },
        {
          id: 'naqada',
          nameAr: 'نقادة',
          nameEn: 'Naqada',
          districts: [
            { id: 'naqada-center', nameAr: 'مركز نقادة', nameEn: 'Naqada Center' },
          ],
        },
        {
          id: 'el-waqf',
          nameAr: 'الوقف',
          nameEn: 'El Waqf',
          districts: [
            { id: 'waqf-center', nameAr: 'مركز الوقف', nameEn: 'El Waqf Center' },
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
          nameEn: 'Luxor',
          districts: [
            { id: 'luxor-center', nameAr: 'مركز الأقصر', nameEn: 'Luxor Center' },
            { id: 'karnak', nameAr: 'الكرنك', nameEn: 'Karnak' },
            { id: 'el-awamia', nameAr: 'العوامية', nameEn: 'El Awamia' },
          ],
        },
        {
          id: 'new-luxor',
          nameAr: 'الأقصر الجديدة',
          nameEn: 'New Luxor',
          districts: [
            { id: 'new-luxor-center', nameAr: 'مركز الأقصر الجديدة', nameEn: 'New Luxor Center' },
          ],
        },
        {
          id: 'esna',
          nameAr: 'إسنا',
          nameEn: 'Esna',
          districts: [
            { id: 'esna-center', nameAr: 'مركز إسنا', nameEn: 'Esna Center' },
          ],
        },
        {
          id: 'armant',
          nameAr: 'أرمنت',
          nameEn: 'Armant',
          districts: [
            { id: 'armant-center', nameAr: 'مركز أرمنت', nameEn: 'Armant Center' },
          ],
        },
        {
          id: 'el-bayadiya',
          nameAr: 'البياضية',
          nameEn: 'El Bayadiya',
          districts: [
            { id: 'bayadiya-center', nameAr: 'مركز البياضية', nameEn: 'El Bayadiya Center' },
          ],
        },
        {
          id: 'el-qurna',
          nameAr: 'القرنة',
          nameEn: 'El Qurna',
          districts: [
            { id: 'qurna-center', nameAr: 'مركز القرنة', nameEn: 'El Qurna Center' },
          ],
        },
        {
          id: 'el-ziniya',
          nameAr: 'الزينية',
          nameEn: 'El Ziniya',
          districts: [
            { id: 'ziniya-center', nameAr: 'مركز الزينية', nameEn: 'El Ziniya Center' },
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
          nameEn: 'Aswan',
          districts: [
            { id: 'aswan-center', nameAr: 'مركز أسوان', nameEn: 'Aswan Center' },
          ],
        },
        {
          id: 'new-aswan',
          nameAr: 'أسوان الجديدة',
          nameEn: 'New Aswan',
          districts: [
            { id: 'new-aswan-center', nameAr: 'مركز أسوان الجديدة', nameEn: 'New Aswan Center' },
          ],
        },
        {
          id: 'edfu',
          nameAr: 'إدفو',
          nameEn: 'Edfu',
          districts: [
            { id: 'edfu-center', nameAr: 'مركز إدفو', nameEn: 'Edfu Center' },
          ],
        },
        {
          id: 'kom-ombo',
          nameAr: 'كوم أمبو',
          nameEn: 'Kom Ombo',
          districts: [
            { id: 'kom-ombo-center', nameAr: 'مركز كوم أمبو', nameEn: 'Kom Ombo Center' },
          ],
        },
        {
          id: 'daraw',
          nameAr: 'دراو',
          nameEn: 'Daraw',
          districts: [
            { id: 'daraw-center', nameAr: 'مركز دراو', nameEn: 'Daraw Center' },
          ],
        },
        {
          id: 'nasr-el-nuba',
          nameAr: 'نصر النوبة',
          nameEn: 'Nasr El Nuba',
          districts: [
            { id: 'nasr-nuba-center', nameAr: 'مركز نصر النوبة', nameEn: 'Nasr El Nuba Center' },
          ],
        },
        {
          id: 'kalabsha',
          nameAr: 'كلابشة',
          nameEn: 'Kalabsha',
          districts: [
            { id: 'kalabsha-center', nameAr: 'مركز كلابشة', nameEn: 'Kalabsha Center' },
          ],
        },
        {
          id: 'el-sebaiya',
          nameAr: 'السباعية',
          nameEn: 'El Sebaiya',
          districts: [
            { id: 'sebaiya-center', nameAr: 'مركز السباعية', nameEn: 'El Sebaiya Center' },
          ],
        },
        {
          id: 'abu-simbel',
          nameAr: 'أبو سمبل',
          nameEn: 'Abu Simbel',
          districts: [
            { id: 'abu-simbel-center', nameAr: 'مركز أبو سمبل', nameEn: 'Abu Simbel Center' },
          ],
        },
      ],
    },
  ],
};

// Helper functions
export const getAllGovernorates = () => EGYPT.governorates;

export const getGovernorateById = (id: string) =>
  EGYPT.governorates.find(gov => gov.id === id);

export const getCitiesByGovernorate = (governorateId: string) => {
  const governorate = getGovernorateById(governorateId);
  return governorate?.cities || [];
};

export const getDistrictsByCity = (governorateId: string, cityId: string) => {
  const cities = getCitiesByGovernorate(governorateId);
  const city = cities.find(c => c.id === cityId);
  return city?.districts || [];
};

export const getLocationLabel = (
  governorateId?: string,
  cityId?: string,
  districtId?: string
): string => {
  const parts: string[] = [];

  if (governorateId) {
    const gov = getGovernorateById(governorateId);
    if (gov) parts.push(gov.nameAr);

    if (cityId) {
      const city = gov?.cities.find(c => c.id === cityId);
      if (city) parts.push(city.nameAr);

      if (districtId) {
        const district = city?.districts.find(d => d.id === districtId);
        if (district) parts.push(district.nameAr);
      }
    }
  }

  return parts.length > 0 ? parts.join(' - ') : 'كل مصر';
};

// Market scope levels
export type MarketScope = 'NATIONAL' | 'GOVERNORATE' | 'CITY' | 'DISTRICT';

export const MARKET_SCOPES: { id: MarketScope; nameAr: string; nameEn: string; icon: string }[] = [
  { id: 'NATIONAL', nameAr: 'كل مصر', nameEn: 'All Egypt', icon: '🇪🇬' },
  { id: 'GOVERNORATE', nameAr: 'المحافظة', nameEn: 'Governorate', icon: '🏛️' },
  { id: 'CITY', nameAr: 'المدينة', nameEn: 'City', icon: '🏙️' },
  { id: 'DISTRICT', nameAr: 'الحي', nameEn: 'District', icon: '📍' },
];
