// =================================================================
// MAZAIKA AI DYNAMIC NICHE SYNTHESIZER
// High-converting, production-ready website & bot generator
// 20+ specialized industries with tailored copy, imagery and UI
// =================================================================

export interface NicheProduct {
  id: number;
  title: string;
  price: number;
  priceFormatted: string;
  category: string;
  badge: string;
  rating: string;
  img: string;
  desc: string;
}

export interface NicheConfig {
  nicheKey: string;
  appName: string;
  appCategory: string;
  themeColor: string;
  accentHex: string;
  gradientFrom: string;
  gradientTo: string;
  heroBadge: string;
  heroTitle: string;
  heroDesc: string;
  ctaText: string;
  products: NicheProduct[];
}

export function detectNiche(promptText: string): string {
  const p = promptText.toLowerCase();

  // 1. Clinic / Medical / Dental
  if (/(стоматолог|зубн|зуб|клиник|врач|доктор|медицин|госпитал|аптек|shifokor|klinika|tish|dental|clinic|medic)/i.test(p)) {
    return 'clinic';
  }
  // 2. Flowers / Florist
  if (/(цвет[ыаовея]|букет|флорист|розы|тюльпан|gullar|gul|flower|floris)/i.test(p)) {
    return 'flowers';
  }
  // 3. Cleaning
  if (/(клининг|уборк|химчистк|мойка окон|cleaning|uborka|tozalash)/i.test(p)) {
    return 'cleaning';
  }
  // 4. Auto / Car Repair / Tuning / Detailing
  if (/(автосервис|авто|машин|ремонт авто|\bсто\b|шиномонтаж|детейлинг|запчаст|мойка авто|avto|moshina|car|tuning|detailing|motors)/i.test(p)) {
    return 'auto';
  }
  // 5. Restaurant / Food / Pizza / Sushi
  if (/(ресторан|кафе|пицц|бургер|суши|шаурма|доставка еды|кухн|блюд|меню|fastfood|taom|ovqat|oshxona|pizza|burger|sushi|food)/i.test(p)) {
    return 'restaurant';
  }
  // 6. Fitness / Gym / Sport
  if (/(фитнес|тренажер|спортзал|тренировк|кроссфит|бодибилдинг|zal|sport|fitnes|gym|workout)/i.test(p)) {
    return 'fitness';
  }
  // 7. Beauty / Barber / Salon
  if (/(салон красот|барбер|стрижк|маникюр|педикюр|парикмахер|макияж|косметик|barbershop|soch|go'zallik|beauty|salon)/i.test(p)) {
    return 'beauty';
  }
  // 8. Crypto / Web3 / Trading
  if (/(крипт|биткоин|трейдинг|web3|блокчейн|сигнал|инвестиц|kripto|crypto|trading|binance)/i.test(p)) {
    return 'crypto';
  }
  // 9. Electronics / Gadgets / Apple
  if (/(электроник|смартфон|ноутбук|айфон|iphone|macbook|гаджет|техник|telefon|noutbuk|gadget)/i.test(p)) {
    return 'electronics';
  }
  // 10. Coffee / Bakery
  if (/(кофе|кофейн|выпечк|десерт|пекарн|круассан|qahva|kofe|coffee|bakery)/i.test(p)) {
    return 'coffee';
  }
  // 11. Education / Courses / School
  if (/(курс|обучен|школ|урок|академи|репетитор|ielts|it kurs|ta'lim|education|study|school)/i.test(p)) {
    return 'education';
  }
  // 12. Real Estate / Housing / Rent
  if (/(недвижим|квартир|новостройк|аренда квартир|риелтор|жилой комплекс|пентхаус|ijara|uy|xonadon|realty|real estate)/i.test(p)) {
    return 'realestate';
  }
  // 13. IT Agency / Web Studio / SMM
  if (/(веб студия|it агентств|разработка сайтов|диджитал|digital|smm|studio|agency)/i.test(p)) {
    return 'it_agency';
  }
  // 14. Portfolio / Resume
  if (/(портфолио|резюме|обо мне|личный сайт|дизайнер|разработчик|portfolio|resume)/i.test(p)) {
    return 'portfolio';
  }
  // 15. Legal / Law / Lawyer
  if (/(юрист|адвокат|нотариус|юридическ|консалтинг|advokat|huquq|lawyer|legal)/i.test(p)) {
    return 'legal';
  }
  // 16. Photography / Video Studio
  if (/(фотограф|фотостуди|видеограф|видеосъемк|фотосесси|photo|video studio)/i.test(p)) {
    return 'photo';
  }
  // 17. Travel / Tourism
  if (/(туроператор|турагентств|путешестви|горящие тур|отел|sayohat|travel|tour)/i.test(p)) {
    return 'travel';
  }
  // 18. Kids / Toys
  if (/(детск|игрушк|коляск|детский сад|bolalar|toys|baby)/i.test(p)) {
    return 'kids';
  }

  // Default: Fashion / E-commerce
  return 'fashion';
}

export function getNicheConfig(niche: string, isRu: boolean): NicheConfig {
  switch (niche) {
    case 'clinic':
      return {
        nicheKey: 'clinic',
        appName: isRu ? 'DentArt Elite' : 'DentArt Stomatologiya',
        appCategory: isRu ? 'Премиум стоматология & медицина' : 'Premium stomatologiya va tibbiyot',
        themeColor: 'emerald',
        accentHex: '#10B981',
        gradientFrom: 'from-emerald-950/50',
        gradientTo: 'to-teal-950/40',
        heroBadge: isRu ? 'Медицинская лицензия №7489' : 'Tibbiy litsenziya №7489',
        heroTitle: isRu ? 'Безупречная улыбка и здоровье ваших зубов' : 'Mukammal tabassum va mustahkam tishlar',
        heroDesc: isRu ? 'Лечение под микроскопом, безболезненная имплантация и отбеливание Zoom 4 по европейским стандартам.' : 'Mikroskop ostida davolash, og\'riqsiz implantatsiya va Zoom 4 oqartirish xizmatlari.',
        ctaText: isRu ? 'Записаться на прием' : 'Qabulga yozilish',
        products: [
          { id: 1, title: isRu ? "Консультация главврача + 3D снимок" : "Bosh shifokor ko'rigi + 3D tomografiya", price: 150000, priceFormatted: isRu ? "150 000 сум" : "150 000 so'm", category: isRu ? "Диагностика" : "Diagnostika", badge: isRu ? "Хит" : "Xit", rating: "★ 5.0 (340)", img: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&q=80", desc: isRu ? "Полный осмотр, составление персонального плана лечения и ортопантомограмма." : "To'liq ko'rik, shaxsiy davolash rejasi va kompyuter tomografiyasi." },
          { id: 2, title: isRu ? "Комплексная гигиена AirFlow" : "AirFlow professional tozalash", price: 380000, priceFormatted: isRu ? "380 000 сум" : "380 000 so'm", category: isRu ? "Гигиена" : "Gigiyena", badge: isRu ? "Top" : "Top", rating: "★ 4.9 (210)", img: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&q=80", desc: isRu ? "Ультразвуковое снятие камня, чистка AirFlow швейцарской пудрой и фторирование." : "Ultratovushli tozalash, shveytsariya kukuni bilan AirFlow va emalni mustahkamlash." },
          { id: 3, title: isRu ? "Лечение кариеса под микроскопом" : "Mikroskop ostida karies davolash", price: 420000, priceFormatted: isRu ? "420 000 сум" : "420 000 so'm", category: isRu ? "Терапия" : "Terapiya", badge: isRu ? "New" : "Yangi", rating: "★ 5.0 (180)", img: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&q=80", desc: isRu ? "Германские нанокомпозитные пломбы, коффердам и пожизненная эстетика зуба." : "Germaniya nanokompozit plombasi, kafferdam va tish anatomiyasini tiklash." },
          { id: 4, title: isRu ? "Швейцарский имплантат Straumann" : "Straumann Shveytsariya implantati", price: 3500000, priceFormatted: isRu ? "3 500 000 сум" : "3 500 000 so'm", category: isRu ? "Имплантация" : "Implantatsiya", badge: isRu ? "VIP" : "VIP", rating: "★ 5.0 (95)", img: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&q=80", desc: isRu ? "Пожизненная гарантия производителя, 99.8% приживаемость, титановый стержень." : "Ishlab chiqaruvchidan umrbod kafolat, 99.8% moslashuvchanlik, titan asos." },
          { id: 5, title: isRu ? "Лазерное отбеливание Zoom 4" : "Zoom 4 lazerli oqartirish", price: 1800000, priceFormatted: isRu ? "1 800 000 сум" : "1 800 000 so'm", category: isRu ? "Эстетика" : "Estetika", badge: isRu ? "White" : "Oq", rating: "★ 4.9 (140)", img: "https://images.unsplash.com/photo-1571772996211-2f02c9727629?w=600&q=80", desc: isRu ? "Осветление эмали до 8 оттенков за 1 визит без повреждения структуры." : "Tish emalini zararlamasdan 1 ta seansda 8 ranggacha oqartirish." },
          { id: 6, title: isRu ? "Брекет-система Damon Q (США)" : "Damon Q breket-tizimi (AQSH)", price: 4200000, priceFormatted: isRu ? "4 200 000 сум" : "4 200 000 so'm", category: isRu ? "Ортодонтия" : "Ortodontiya", badge: isRu ? "Pro" : "Pro", rating: "★ 4.9 (76)", img: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&q=80", desc: isRu ? "Самолигирующие миниатюрные брекеты для быстрого и комфортного исправления прикуса." : "Tishlar qatorini tez va qulay to'g'rilovchi zamonaviy samoligiruyushiy breketlar." }
        ]
      };

    case 'auto':
      return {
        nicheKey: 'auto',
        appName: isRu ? 'Drive Motors Pro' : 'Drive Motors Avtoservis',
        appCategory: isRu ? 'Автосервис, Тюнинг & Детейлинг' : 'Avtoservis, Tyuning va Deteyling',
        themeColor: 'blue',
        accentHex: '#2563EB',
        gradientFrom: 'from-blue-950/50',
        gradientTo: 'to-slate-900/60',
        heroBadge: isRu ? 'Сертифицированный автотехцентр' : 'Sertifikatlangan avtotexmarkaz',
        heroTitle: isRu ? 'Профессиональный ремонт и тюнинг автомобилей' : 'Avtomobillarni professional ta\'mirlash va tyuning',
        heroDesc: isRu ? 'Компьютерная диагностика дилерского уровня, замена масел, премиум детейлинг и гарантия на все работы.' : 'Dilerlik darajasidagi kompyuter diagnostikasi, moy almashtirish va yuqori sifat kafolati.',
        ctaText: isRu ? 'Записаться на ТО' : 'Diagnostikaga yozilish',
        products: [
          { id: 1, title: isRu ? "Комплексная диагностика авто (40 пунктов)" : "To'liq kompyuter diagnostikasi (40 punkt)", price: 120000, priceFormatted: isRu ? "120 000 сум" : "120 000 so'm", category: isRu ? "Диагностика" : "Diagnostika", badge: isRu ? "Хит" : "Xit", rating: "★ 5.0 (410)", img: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80", desc: isRu ? "Проверка двигателя, АКПП, датчиков, ходовой части и тормозной системы сканером." : "Dvigatel, AKPP, datchiklar, xodovoy va tormoz tizimini to'liq tekshirish." },
          { id: 2, title: isRu ? "Премиум Детейлинг: 3-фазная полировка" : "Premium Deteyling: 3 bosqichli polirovka", price: 950000, priceFormatted: isRu ? "950 000 сум" : "950 000 so'm", category: isRu ? "Детейлинг" : "Deteyling", badge: isRu ? "Top" : "Top", rating: "★ 5.0 (165)", img: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600&q=80", desc: isRu ? "Удаление царапин, восстановительная полировка и нанесение керамики 9H Ceramic Pro." : "Tirishlarni yo'qotish, kuzovni qayta tiklash va 9H sopol himoya qatlami." },
          { id: 3, title: isRu ? "Замена масла в ДВС + фильтры" : "Dvigatel moyi va filtrlarini almashtirish", price: 280000, priceFormatted: isRu ? "280 000 сум" : "280 000 so'm", category: isRu ? "ТО" : "Moy almashtirish", badge: isRu ? "Хит" : "Xit", rating: "★ 4.9 (530)", img: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&q=80", desc: isRu ? "Оригинальные масла Motul / Castrol / Mobil1 + бесплатная замена масляного фильтра." : "Original Motul / Castrol moylari va filtrni bepul almashtirish xizmati." },
          { id: 4, title: isRu ? "Чип-тюнинг Stage 1 (+25% мощности)" : "Chip-tyuning Stage 1 (+25% quvvat)", price: 850000, priceFormatted: isRu ? "850 000 сум" : "850 000 so'm", category: isRu ? "Тюнинг" : "Tyuning", badge: isRu ? "Power" : "Quvvat", rating: "★ 4.9 (88)", img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80", desc: isRu ? "Прошивка блока управления ЭБУ: быстрый отклик педали газа и снижение расхода." : "EBU blokini xavfsiz proshivka qilish, tezlik dinamikasi va tejamkorlik." },
          { id: 5, title: isRu ? "Ремонт ходовой части & Развал-схождение 3D" : "Xodovoy ta'mirlash va 3D Razval", price: 220000, priceFormatted: isRu ? "220 000 сум" : "220 000 so'm", category: isRu ? "Ходовая" : "Xodovoy", badge: isRu ? "3D" : "3D", rating: "★ 4.8 (210)", img: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=600&q=80", desc: isRu ? "Высокоточная лазерная регулировка углов установки колес Hunter 3D." : "Hunter 3D stendida g'ildiraklarni yuqori aniqlikda sozlash." },
          { id: 6, title: isRu ? "Заправка и антибактериальная чистка кондиционера" : "Konditsionerni to'ldirish va tozalash", price: 190000, priceFormatted: isRu ? "190 000 сум" : "190 000 so'm", category: isRu ? "Климат" : "Klimat", badge: isRu ? "Fresh" : "Toza", rating: "★ 4.9 (135)", img: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&q=80", desc: isRu ? "Вакуумация, заправка фреоном R134a и устранение неприятных запахов озоном." : "Freon quyish, bosimni tekshirish va mikroblarga qarshi ozonlash." }
        ]
      };

    case 'fitness':
      return {
        nicheKey: 'fitness',
        appName: isRu ? 'Titan Fitness Club' : 'Titan Sport Majmuasi',
        appCategory: isRu ? 'Фитнес-клуб, СПА & Тренировки' : 'Fitnes klub, SPA va Mashg\'ulotlar',
        themeColor: 'emerald',
        accentHex: '#10B981',
        gradientFrom: 'from-emerald-950/50',
        gradientTo: 'to-zinc-950/60',
        heroBadge: isRu ? 'Премиум фитнес пространство 2500 м²' : 'Premium 2500 m² sport majmuasi',
        heroTitle: isRu ? 'Твое лучшее тело и несокрушимая энергия' : 'Kuchli tana, salomatlik va yuqori energiya',
        heroDesc: isRu ? 'Тренажеры Hammer Strength, олимпийский бассейн, кроссфит-зона и персональные тренеры чемпионы.' : 'Hammer Strength uskunalari, suzish havzasi, krossfit va chempion murabbiylar.',
        ctaText: isRu ? 'Выбрать абонемент' : 'Abonement tanlash',
        products: [
          { id: 1, title: isRu ? "Абонемент 'Безлимит' (1 месяц)" : "'Cheksiz' Abonement (1 oy)", price: 450000, priceFormatted: isRu ? "450 000 сум" : "450 000 so'm", category: isRu ? "Абонементы" : "Abonement", badge: isRu ? "Хит" : "Xit", rating: "★ 5.0 (290)", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80", desc: isRu ? "Доступ во все зоны: тренажерный зал, кардио, финская сауна без ограничений по времени." : "Barcha zallarga kirish: trenajyor, kardio, fin saunasi cheklovlarsiz." },
          { id: 2, title: isRu ? "Персональный тренинг (12 занятий)" : "Shaxsiy murabbiy bilan 12 mashg'ulot", price: 800000, priceFormatted: isRu ? "800 000 сум" : "800 000 so'm", category: isRu ? "Тренер" : "Murabbiy", badge: isRu ? "Top" : "Top", rating: "★ 5.0 (185)", img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80", desc: isRu ? "Индивидуальная программа тренировок, расчет КБЖУ и контроль каждого упражнения." : "Shaxsiy mashqlar rejasi, to'g'ri ovqatlanish ratsioni va to'liq nazorat." },
          { id: 3, title: isRu ? "Годовой VIP абонемент + Бассейн" : "Yillik VIP Abonement + Suzish havzasi", price: 3600000, priceFormatted: isRu ? "3 600 000 сум" : "3 600 000 so'm", category: isRu ? "VIP" : "VIP", badge: isRu ? "Best Offer" : "Aksiya", rating: "★ 5.0 (90)", img: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&q=80", desc: isRu ? "365 дней безлимитного фитнеса, бассейн 25м, 10 сеансов массажа и гостевые визиты." : "365 kun cheksiz fitnes, 25m basseyin, 10 ta massaj seansi va do'stlar uchun vizit." },
          { id: 4, title: isRu ? "Кроссфит & Бокс интенсив" : "Krossfit va Boks intensiv kursi", price: 500000, priceFormatted: isRu ? "500 000 сум" : "500 000 so'm", category: isRu ? "Групповые" : "Guruhli", badge: isRu ? "Power" : "Kuch", rating: "★ 4.9 (110)", img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80", desc: isRu ? "Взрывная выносливость, постановка удара и функциональная прокачка всего тела." : "Chidamlilikni oshirish, zarba texnikasi va funksional jismoniy tayyorgarlik." }
        ]
      };

    case 'crypto':
      return {
        nicheKey: 'crypto',
        appName: isRu ? 'CryptoAlpha Hub' : 'CryptoAlpha Hub',
        appCategory: isRu ? 'Web3, Крипто-сигналы & Аналитика' : 'Web3, Kripto-signallar va Tahlil',
        themeColor: 'purple',
        accentHex: '#8B5CF6',
        gradientFrom: 'from-purple-950/50',
        gradientTo: 'to-slate-950/60',
        heroBadge: isRu ? 'Винрейт сигналов 84.7% в 2024-2025' : 'Signallar aniqligi 84.7%',
        heroTitle: isRu ? 'Интеллектуальный трейдинг и Web3 инвестиции' : 'Aqlli kripto treyding va Web3 investitsiyalar',
        heroDesc: isRu ? 'Закрытый канал торговых сетапов, алгоритмические торговые боты и персональный ончейн-анализ портфеля.' : 'VIP treyding kanali, avtomatik savdo botlari va professional on-chain tahlil.',
        ctaText: isRu ? 'Вступить в клуб' : 'Klubga a\'zo bo\'lish',
        products: [
          { id: 1, title: isRu ? "Подписка VIP Signals Club (1 месяц)" : "VIP Signals Club (1 oylik obuna)", price: 490000, priceFormatted: isRu ? "490 000 сум" : "490 000 so'm", category: isRu ? "Сигналы" : "Signallar", badge: isRu ? "Хит" : "Xit", rating: "★ 5.0 (420)", img: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=600&q=80", desc: isRu ? "Ежедневные сетапы на фьючерсы и спот с точками входа, тейк-профитами и риск-менеджментом." : "Fyuchers va spot uchun har kungi tahlillar, kirish nuqtalari va risk nazorati." },
          { id: 2, title: isRu ? "Автоматический Торговый Бот Grid Pro" : "Grid Pro avtomatik savdo boti", price: 1200000, priceFormatted: isRu ? "1 200 000 сум" : "1 200 000 so'm", category: isRu ? "Боты" : "Botlar", badge: isRu ? "Auto" : "Avto", rating: "★ 4.9 (135)", img: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=600&q=80", desc: isRu ? "Круглосуточная автоматическая сетка ордеров на Binance / Bybit с доходностью до 15% в месяц." : "Binance va Bybit birjalarida 24/7 ishlovchi, xavfsiz foyda keltiruvchi bot." },
          { id: 3, title: isRu ? "Курс: 'Мастер Криптотрейдинга от 0 до Pro'" : "'Noldan Pro treydergacha' to'liq kursi", price: 1500000, priceFormatted: isRu ? "1 500 000 сум" : "1 500 000 so'm", category: isRu ? "Обучение" : "Ta'lim", badge: isRu ? "Top" : "Top", rating: "★ 5.0 (240)", img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80", desc: isRu ? "Smart Money концепция, чтение стакана ордеров, ончейн-метрики и психология трейдинга." : "Smart Money konsepsiyasi, birja stakani, texnik tahlil va treyder psixologiyasi." },
          { id: 4, title: isRu ? "Персональный аудит инвестиционного портфеля" : "Shaxsiy kripto-portfel auditi", price: 750000, priceFormatted: isRu ? "750 000 сум" : "750 000 so'm", category: isRu ? "Консалтинг" : "Maslahat", badge: isRu ? "1 on 1" : "1 ga 1", rating: "★ 4.9 (62)", img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&q=80", desc: isRu ? "1.5 часовая консультация в Zoom: перебалансировка монет, хеджирование и защита от скама." : "Zoom orqali 1.5 soatlik tahlil: xavfli tangalarni tozalash va to'g'ri taqsimlash." }
        ]
      };

    case 'flowers':
      return {
        nicheKey: 'flowers',
        appName: isRu ? 'Bloom & Rose' : 'Bloom & Rose Gullar',
        appCategory: isRu ? 'Премиум флористика & Доставка цветов' : 'Premium floristika va yetkazib berish',
        themeColor: 'rose',
        accentHex: '#F43F5E',
        gradientFrom: 'from-rose-950/50',
        gradientTo: 'to-pink-950/40',
        heroBadge: isRu ? 'Свежие голландские цветы каждый день' : 'Har kuni yangi golland gullari',
        heroTitle: isRu ? 'Цветы, которые дарят искреннее счастье' : 'Chin dildan quvonch ulashuvchi guldastalar',
        heroDesc: isRu ? 'Авторские букеты от топ-флористов с бесплатной доставкой в течение 45 минут и открыткой в подарок.' : 'Top floristlardan mualliflik guldastalari, 45 daqiqada bepul yetkazish va tabriknoma.',
        ctaText: isRu ? 'Выбрать букет' : 'Guldasta tanlash',
        products: [
          { id: 1, title: isRu ? "101 Голландская Роза 'Red Naomi' 70см" : "101 ta Qizil Golland Atirgul 70sm", price: 1200000, priceFormatted: isRu ? "1 200 000 сум" : "1 200 000 so'm", category: isRu ? "Розы" : "Atirgullar", badge: isRu ? "Хит" : "Xit", rating: "★ 5.0 (380)", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80", desc: isRu ? "Огромный роскошный букет из свежайших алых роз в премиальной матовой упаковке с атласной лентой." : "Barra va iforli qizil atirgullardan iborat hashamatli katta guldasta." },
          { id: 2, title: isRu ? "Авторский букет 'Нежное облако' с пионами" : "Mualliflik 'Nafis bulut' guldastasi", price: 450000, priceFormatted: isRu ? "450 000 сум" : "450 000 so'm", category: isRu ? "Микс" : "Miks", badge: isRu ? "Top" : "Top", rating: "★ 4.9 (195)", img: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&q=80", desc: isRu ? "Нежные пионы, гортензии, эустомы и эвкалипт. Идеальный подарок для любимой." : "Pionlar, gortenziya va evkalipt aralashmasi. Sevimli inson uchun ajoyib sovg'a." },
          { id: 3, title: isRu ? "Шляпная коробка 'Pastel Dreams' + Raffaello" : "Shlyapa qutisidagi guldasta + Raffaello", price: 380000, priceFormatted: isRu ? "380 000 сум" : "380 000 so'm", category: isRu ? "В коробках" : "Qutilarda", badge: isRu ? "New" : "Yangi", rating: "★ 5.0 (140)", img: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=600&q=80", desc: isRu ? "Цветы на флористической губке не требуют вазы и сохраняют свежесть более 14 дней." : "Suvli gubka ustida terilgan, 14 kundan ortiq so'lmay turuvchi qulay kompozitsiya." },
          { id: 4, title: isRu ? "Букет '51 Белый Тюльпан' Весенний бриз" : "51 ta oq lola 'Bahor nafasi'", price: 350000, priceFormatted: isRu ? "350 000 сум" : "350 000 so'm", category: isRu ? "Тюльпаны" : "Lolalar", badge: isRu ? "Fresh" : "Yangi", rating: "★ 4.9 (110)", img: "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=600&q=80", desc: isRu ? "Хрустящие отборные белые тюльпаны с нежным весенним ароматом." : "Qarsildoq yangi oq lolalar to'plami." }
        ]
      };

    case 'coffee':
      return {
        nicheKey: 'coffee',
        appName: isRu ? 'Aroma Specialty Coffee' : 'Aroma Qahvaxonasi',
        appCategory: isRu ? 'Спешелти кофейня & Свежая выпечка' : 'Specialty qahva va shirinliklar',
        themeColor: 'amber',
        accentHex: '#F59E0B',
        gradientFrom: 'from-amber-950/50',
        gradientTo: 'to-stone-950/60',
        heroBadge: isRu ? '100% Арабика свежей обжарки' : '100% yangi qovurilgan Arabika',
        heroTitle: isRu ? 'Вкус настоящего кофе и тепло уютных встреч' : 'Haqiqiy qahva ta\'mi va shinam muhit',
        heroDesc: isRu ? 'Зерна класса Specialty, авторские кофейные напитки, хрустящие парижские круассаны и десерты.' : 'Specialty toifadagi qahva donlari, yangi pishirilgan kruassanlar va mazali shirinliklar.',
        ctaText: isRu ? 'Посмотреть меню' : 'Menyuni ko\'rish',
        products: [
          { id: 1, title: isRu ? "Авторский Раф 'Цитрус & Соленая карамель'" : "Mualliflik Rafi 'Sitrus va tuzli karamel'", price: 34000, priceFormatted: isRu ? "34 000 сум" : "34 000 so'm", category: isRu ? "Кофе" : "Qahva", badge: isRu ? "Хит" : "Xit", rating: "★ 5.0 (460)", img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&q=80", desc: isRu ? "Двойной эспрессо, взбитый с натуральными сливками, цедрой апельсина и домашней карамелью." : "Tabiiy qaymoq, apelsin qobig'i va qo'lda tayyorlangan karamelli nozik qahva." },
          { id: 2, title: isRu ? "Классический Капучино на миндальном молоке" : "Bodom sutli klassik kapuchino", price: 28000, priceFormatted: isRu ? "28 000 сум" : "28 000 so'm", category: isRu ? "Кофе" : "Qahva", badge: isRu ? "Classic" : "Klassik", rating: "★ 4.9 (320)", img: "https://images.unsplash.com/photo-1572442388796-11668ba69e53?w=600&q=80", desc: isRu ? "Шелковистая кремовая пенка, насыщенный сбалансированный шоколадно-ореховый профиль." : "Yong'oqli muvozanatli ta'm va ipakdek mayin ko'pikli kapuchino." },
          { id: 3, title: isRu ? "Французский миндальный круассан" : "Fransuzcha bodomli kruassan", price: 26000, priceFormatted: isRu ? "26 000 сум" : "26 000 so'm", category: isRu ? "Выпечка" : "Pishiriq", badge: isRu ? "Fresh" : "Issiq", rating: "★ 5.0 (280)", img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80", desc: isRu ? "Хрустящее сливочное слоеное тесто, запеченное с нежным франжипаном и лепестками миндаля." : "Qarsildoq sariyog'li qatlama, bodom kremi va qovurilgan bodom parraklari." },
          { id: 4, title: isRu ? "Баскский обожженный чизкейк Сан-Себастьян" : "Baskcha San-Sebastian chizkeyki", price: 38000, priceFormatted: isRu ? "380 000 сум" : "380 000 so'm", category: isRu ? "Десерты" : "Shirinlik", badge: isRu ? "Top" : "Top", rating: "★ 5.0 (195)", img: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&q=80", desc: isRu ? "Тающая кремовая текстура из сыра Филадельфия с аппетитной карамелизированной корочкой." : "Haqiqiy Filadelfiya pishlog'idan tayyorlangan, og'izda eriydigan mashhur desert." }
        ]
      };

    case 'electronics':
      return {
        nicheKey: 'electronics',
        appName: isRu ? 'TechStore Official' : 'TechStore Do\'koni',
        appCategory: isRu ? 'Оригинальная электроника & Гаджеты' : 'Original elektronika va gadjetlar',
        themeColor: 'cyan',
        accentHex: '#00D9FF',
        gradientFrom: 'from-cyan-950/50',
        gradientTo: 'to-slate-900/60',
        heroBadge: isRu ? '1 год официальной гарантии' : '1 yil rasmiy kafolat',
        heroTitle: isRu ? 'Флагманские гаджеты по честным ценам' : 'Eng so\'nggi gadjetlar halol narxlarda',
        heroDesc: isRu ? 'Смартфоны Apple iPhone 16 Pro, MacBook, консоли PlayStation 5 и умные аксессуары с быстрой доставкой.' : 'Apple iPhone, MacBook, PlayStation 5 va barcha original aksessuarlar Toshkent bo\'ylab 2 soatda yetkaziladi.',
        ctaText: isRu ? 'Открыть витрину' : 'Vitrinani ochish',
        products: [
          { id: 1, title: isRu ? "Apple iPhone 16 Pro Max 256GB Desert Titanium" : "Apple iPhone 16 Pro Max 256GB Desert Titanium", price: 15400000, priceFormatted: isRu ? "15 400 000 сум" : "15 400 000 so'm", category: "Apple", badge: isRu ? "Хит" : "Xit", rating: "★ 5.0 (310)", img: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80", desc: isRu ? "Процессор A18 Pro, кнопка Camera Control, титановый корпус и рекордная автономность." : "A18 Pro protsessor, yangi Camera Control tugmasi va eng kuchli batareya." },
          { id: 2, title: isRu ? "MacBook Air 15\" M3 (16GB / 512GB) Space Gray" : "MacBook Air 15\" M3 (16GB / 512GB)", price: 17200000, priceFormatted: isRu ? "17 200 000 сум" : "17 200 000 so'm", category: "Laptops", badge: isRu ? "Pro" : "Pro", rating: "★ 5.0 (180)", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80", desc: isRu ? "Невероятно тонкий алюминиевый корпус, экран Liquid Retina и до 18 часов работы без подзарядки." : "Ultra yupqa metall korpus, Liquid Retina ekran va 18 soatlik zaryad." },
          { id: 3, title: isRu ? "Наушники Apple AirPods Pro 2 (USB-C)" : "Apple AirPods Pro 2 quloqchinlari (USB-C)", price: 2950000, priceFormatted: isRu ? "2 950 000 сум" : "2 950 000 so'm", category: "Audio", badge: isRu ? "Top" : "Top", rating: "★ 4.9 (420)", img: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80", desc: isRu ? "Адаптивное активное шумоподавление, режим прозрачности и пространственное аудио." : "Kuchli shovqin so'ndirish (ANC), shaffof rejim va yuqori sifatli fazoviy ovoz." },
          { id: 4, title: isRu ? "Sony PlayStation 5 Slim 1TB + 2 геймпада" : "Sony PlayStation 5 Slim 1TB + 2 ta pult", price: 7100000, priceFormatted: isRu ? "7 100 000 сум" : "7 100 000 so'm", category: "Gaming", badge: isRu ? "New" : "Yangi", rating: "★ 5.0 (250)", img: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&q=80", desc: isRu ? "Поддержка 4K 120 FPS, трассировка лучей и сверхбыстрый накопитель SSD на 1 терабайт." : "4K 120 FPS qo'llab-quvvatlash, tezkor 1TB SSD xotira va 2 ta DualSense pulti." }
        ]
      };


    case 'restaurant':
      return {
        nicheKey: 'restaurant',
        appName: isRu ? 'Bella Italia Trattoria' : 'Bella Italia Restoran',
        appCategory: isRu ? 'Ресторан, Пицца & Доставка еды' : 'Restoran, Pitsa va Taom yetkazish',
        themeColor: 'amber',
        accentHex: '#F59E0B',
        gradientFrom: 'from-amber-950/50',
        gradientTo: 'to-red-950/40',
        heroBadge: isRu ? 'Дровяная печь & Свежие ингредиенты' : 'O\'tinli pech va yangi mahsulotlar',
        heroTitle: isRu ? 'Настоящая неаполитанская пицца и паста' : 'Haqiqiy italyancha pitsa va mazali taomlar',
        heroDesc: isRu ? 'Традиционные рецепты из Неаполя, хрустящее воздушное тесто, сыр Моцарелла и доставка за 30 минут.' : 'Neapol an\'anasi, qarsildoq xamir, haqiqiy motsarella va 30 daqiqada tezkor yetkazib berish.',
        ctaText: isRu ? 'Заказать столик / Еду' : 'Buyurtma berish',
        products: [
          { id: 1, title: isRu ? "Пицца 'Маргарита D.O.P.' (32см)" : "Margarita D.O.P. pitsasi (32sm)", price: 68000, priceFormatted: isRu ? "68 000 сум" : "68 000 so'm", category: isRu ? "Пицца" : "Pitsa", badge: isRu ? "Хит" : "Xit", rating: "★ 5.0 (520)", img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80", desc: isRu ? "Томаты Сан-Марцано, свежая сливочная моцарелла, базилик и оливковое масло Extra Virgin." : "San-Martsano pomidorlari, yangi motsarella va rayhon." },
          { id: 2, title: isRu ? "Пицца 'Пепперони Диаволо' с перчиком" : "Pepperoni Diavolo achchiq pitsasi", price: 82000, priceFormatted: isRu ? "82 000 сум" : "82 000 so'm", category: isRu ? "Пицца" : "Pitsa", badge: isRu ? "Spicy" : "Achchiq", rating: "★ 4.9 (410)", img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80", desc: isRu ? "Пикантные итальянские колбаски пепперони, моцарелла и острый перец халапеньо." : "Pikant kolbasa, motsarella pishlog'i va xalapenyo." },
          { id: 3, title: isRu ? "Паста Карбонара с хрустящим панчетта" : "Klassik Karbonara pastasi", price: 62000, priceFormatted: isRu ? "62 000 сум" : "62 000 so'm", category: isRu ? "Паста" : "Pasta", badge: isRu ? "Top" : "Top", rating: "★ 5.0 (340)", img: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80", desc: isRu ? "Спагетти аль денте, соус из фермерских желтков, выдержанный пармезан и вяленая грудинка." : "Al dente spagetti, tuxum sarig'i sousi, parmezan va qovurilgan go'sht." },
          { id: 4, title: isRu ? "Стейк Рибай Прайм с розмарином" : "Ribay Steyk Prime rozmarin bilan", price: 145000, priceFormatted: isRu ? "145 000 сум" : "145 000 so'm", category: isRu ? "Мясо" : "Go'sht", badge: isRu ? "Chef" : "Shef", rating: "★ 5.0 (180)", img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80", desc: isRu ? "Сочная говядина зернового откорма медиум прожарки с чесночным маслом и овощами гриль." : "Don bilan boqilgan mol go'shti, sarimsoq moyi va grilda pishgan sabzavotlar." },
          { id: 5, title: isRu ? "Воздушный Тирамису по семейному рецепту" : "Klassik Tiramisu shirinligi", price: 38000, priceFormatted: isRu ? "38 000 сум" : "38 000 so'm", category: isRu ? "Десерты" : "Desert", badge: isRu ? "Sweet" : "Shirin", rating: "★ 4.9 (290)", img: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80", desc: isRu ? "Нежный маскарпоне, печенье Савоярди, пропитанное эспрессо и какао Barry Callebaut." : "Savoyardi pechenyesi, tabiiy maskarpone va qahva siropi." }
        ]
      };

    case 'realestate':
      return {
        nicheKey: 'realestate',
        appName: isRu ? 'Grand Elite Residence' : 'Grand Elite Ko\'chmas Mulk',
        appCategory: isRu ? 'Элитная недвижимость & Новостройки' : 'Elita xonadonlar va yangi uylar',
        themeColor: 'amber',
        accentHex: '#F59E0B',
        gradientFrom: 'from-amber-950/50',
        gradientTo: 'to-slate-900/60',
        heroBadge: isRu ? 'Агентство недвижимости №1' : '1-raqamli ko\'chmas mulk agentligi',
        heroTitle: isRu ? 'Квартиры бизнес-класса и загородные виллы' : 'Biznes-klass xonadonlar va hashamatli villalar',
        heroDesc: isRu ? 'Прямые цены от надежных застройщиков, юридическая чистота 100%, рассрочка 0% и подбор за 15 минут.' : 'Ishonchli quruvchilardan to\'g\'ridan-to\'g\'ri narxlar, 0% muddatli to\'lov va professional tanlov.',
        ctaText: isRu ? 'Получить каталог квартир' : 'Katalogni yuklab olish',
        products: [
          { id: 1, title: isRu ? "Пентхаус 140м² с видовой террасой" : "140m² Pentxaus panoramali terassa bilan", price: 1850000000, priceFormatted: isRu ? "1.85 млрд сум" : "1.85 mlrd so'm", category: isRu ? "Пентхаусы" : "Pentxaus", badge: isRu ? "VIP" : "VIP", rating: "★ 5.0 (42)", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80", desc: isRu ? "Панорамное остекление, потолки 3.4м, система умного дома и 2 машиноместа в подземном паркинге." : "Panoramali derazalar, baland shiftlar va aqlli uy tizimi." },
          { id: 2, title: isRu ? "3-комнатная квартира 92м² в ЖК 'Park View'" : "'Park View' turar-joyida 92m² 3 xonali uy", price: 920000000, priceFormatted: isRu ? "920 млн сум" : "920 mln so'm", category: isRu ? "Квартиры" : "Xonadon", badge: isRu ? "Top" : "Top", rating: "★ 4.9 (88)", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80", desc: isRu ? "Предчистовая отделка White Box, изолированные спальни, 2 санузла и парк во дворе." : "White Box holatida, 2 ta sanuzel, shinam hovli va bolalar maydonchasi." },
          { id: 3, title: isRu ? "Загородная вилла 350м² с бассейном" : "Hovuzli 350m² shahar tashqarisidagi villa", price: 3200000000, priceFormatted: isRu ? "3.2 млрд сум" : "3.2 mlrd so'm", category: isRu ? "Виллы" : "Villa", badge: isRu ? "Lux" : "Lux", rating: "★ 5.0 (19)", img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80", desc: isRu ? "Участок 8 соток, ландшафтный дизайн, бассейн с подогревом, финская сауна и барбекю-зона." : "8 sotix yer, isitiladigan hovuz, sauna va landshaft dizayni." },
          { id: 4, title: isRu ? "Студия 42м² с готовым дизайнерским ремонтом" : "Dizaynerlik ta'mirli 42m² studiya", price: 460000000, priceFormatted: isRu ? "460 млн сум" : "460 mln so'm", category: isRu ? "Студии" : "Studiya", badge: isRu ? "Invest" : "Invest", rating: "★ 4.8 (115)", img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80", desc: isRu ? "Полностью меблирована техникой Bosch. Идеально под дорогую посуточную аренду (ROI 14%)." : "Mebel va texnikasi bilan to'liq jihozlangan. Ijara uchun tayyor investitsiya." }
        ]
      };

    case 'beauty':
      return {
        nicheKey: 'beauty',
        appName: isRu ? 'Blade & Razor Barbershop' : 'Blade & Razor Sartaroshxona',
        appCategory: isRu ? 'Премиум барбершоп & Мужской клуб' : 'Premium sartaroshxona va erkaklar klubi',
        themeColor: 'amber',
        accentHex: '#F59E0B',
        gradientFrom: 'from-amber-950/50',
        gradientTo: 'to-zinc-950/60',
        heroBadge: isRu ? 'Мастера международного класса' : 'Xalqaro toifadagi ustalar',
        heroTitle: isRu ? 'Мужской стиль, стрижки и королевское бритье' : 'Erkaklar uslubi, zamonaviy soch va soqol parvarishi',
        heroDesc: isRu ? 'Индивидуальный подбор формы бороды, мужской спа-уход, кофе и виски в подарок каждому гостю.' : 'Yuz tuzilishiga mos soch turmagi, soqol tekislash, bepul qahva va yuqori darajadagi servis.',
        ctaText: isRu ? 'Записаться онлайн' : 'Navbatga yozilish',
        products: [
          { id: 1, title: isRu ? "Стрижка 'Fade & Crop' + Мытье головы" : "'Fade & Crop' soch turmagi va bosh yuvish", price: 90000, priceFormatted: isRu ? "90 000 сум" : "90 000 so'm", category: isRu ? "Стрижки" : "Soch", badge: isRu ? "Хит" : "Xit", rating: "★ 5.0 (610)", img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80", desc: isRu ? "Консультация барбера, моделирование стрижки, мытье премиум шампунем и укладка глиной." : "Usta maslahati, soch olish va zamonaviy uslubda turmaklash." },
          { id: 2, title: isRu ? "Королевское бритье опасной бритвой" : "Xavfli ustara bilan 'Qirollik qirish'", price: 75000, priceFormatted: isRu ? "75 000 сум" : "75 000 so'm", category: isRu ? "Борода" : "Soqol", badge: isRu ? "Classic" : "Klassik", rating: "★ 4.9 (340)", img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80", desc: isRu ? "Распаривание горячим полотенцем с эфирными маслами, идеальное бритье и охлаждающий лосьон." : "Issiq sochiq bilan bug'lash, ustara bilan tozalash va tetiklantiruvchi balzam." },
          { id: 3, title: isRu ? "Комплекс 'Отец + Сын'" : "'Ota va O'g'il' birgalikdagi kompleksi", price: 150000, priceFormatted: isRu ? "150 000 сум" : "150 000 so'm", category: isRu ? "Комплексы" : "Kompleks", badge: isRu ? "Family" : "Oila", rating: "★ 5.0 (210)", img: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&q=80", desc: isRu ? "Две стрижки в одно время у топ-мастеров. Отличная мужская традиция." : "Ota va o'g'il uchun bir vaqtning o'zida ikkita usta tomonidan professional xizmat." },
          { id: 4, title: isRu ? "Черная маска от черных точек + Патчи" : "Qora niqob va yuz terisi parvarishi", price: 55000, priceFormatted: isRu ? "55 000 сум" : "55 000 so'm", category: isRu ? "Спа" : "SPA", badge: isRu ? "Fresh" : "Toza", rating: "★ 4.8 (145)", img: "https://images.unsplash.com/photo-1512290900672-1a013d31b0e3?w=600&q=80", desc: isRu ? "Глубокое очищение пор углем, увлажняющие гидрогелевые патчи под глаза." : "Yuz terisini chuqur tozalash va ko'z osti charchoqlarini ketkazish." }
        ]
      };

    case 'it_agency':
      return {
        nicheKey: 'it_agency',
        appName: isRu ? 'Apex Digital Studio' : 'Apex Digital Agentligi',
        appCategory: isRu ? 'IT разработка, Дизайн & Маркетинг' : 'IT xizmatlar, Saytlar va Dasturlash',
        themeColor: 'cyan',
        accentHex: '#00D9FF',
        gradientFrom: 'from-cyan-950/50',
        gradientTo: 'to-blue-950/60',
        heroBadge: isRu ? 'Создали 180+ успешных digital-проектов' : '180 dan ortiq muvaffaqiyatli loyihalar',
        heroTitle: isRu ? 'Разработка сайтов, Telegram Mini Apps и CRM' : 'Zamonaviy veb-saytlar va Telegram botlar yaratish',
        heroDesc: isRu ? 'Запускаем цифровые продукты для бизнеса под ключ: от прототипа в Figma до серверной инфраструктуры.' : 'Biznesingiz uchun to\'liq raqamli yechimlar: dizayndan tortib murakkab server tizimlarigacha.',
        ctaText: isRu ? 'Рассчитать стоимость' : 'Loyihani hisoblash',
        products: [
          { id: 1, title: isRu ? "Разработка Telegram Mini App магазина под ключ" : "Telegram Mini App do\'kon yaratish", price: 4500000, priceFormatted: isRu ? "4 500 000 сум" : "4 500 000 so'm", category: isRu ? "Mini App" : "Mini App", badge: isRu ? "Хит" : "Xit", rating: "★ 5.0 (98)", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80", desc: isRu ? "Интерактивная витрина, корзина, Payme/Click платежи, push-уведомления и админ-панель." : "Interaktiv vitrina, savat, to'lov tizimlari va qulay admin paneli." },
          { id: 2, title: isRu ? "Корпоративный сайт / Landing Page с высокой конверсией" : "Yuqori konversiyali Landing Page / Sayt", price: 3200000, priceFormatted: isRu ? "3 200 000 сум" : "3 200 000 so'm", category: isRu ? "Сайты" : "Saytlar", badge: isRu ? "Top" : "Top", rating: "★ 4.9 (145)", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80", desc: isRu ? "Премиум дизайн в Figma, адаптивная верстка, скорость загрузки 95+ в Google PageSpeed." : "Figma dizayn, mobil moslashuv va Google PageSpeed 95+ tezlik." },
          { id: 3, title: isRu ? "Внедрение и настройка CRM (AmoCRM / Bitrix24)" : "CRM tizimini o'rnatish va sozlash", price: 2800000, priceFormatted: isRu ? "2 800 000 сум" : "2 800 000 so'm", category: isRu ? "CRM" : "CRM", badge: isRu ? "Pro" : "Pro", rating: "★ 5.0 (72)", img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&q=80", desc: isRu ? "Воронка продаж, сквозная аналитика, интеграция с телефонией и обучение сотрудников." : "Sotuv voronkasi, telefon integratsiyasi va xodimlarni o'qitish." },
          { id: 4, title: isRu ? "UI/UX Дизайн мобильного приложения (Figma)" : "Mobil ilova UI/UX dizayni (Figma)", price: 2200000, priceFormatted: isRu ? "2 200 000 сум" : "2 200 000 so'm", category: isRu ? "Дизайн" : "Dizayn", badge: isRu ? "Design" : "Dizayn", rating: "★ 4.9 (84)", img: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&q=80", desc: isRu ? "Интерактивный кликабельный прототип, дизайн-система, темная и светлая тема." : "Interaktiv prototip, komponentlar bazasi, qorong'u va yorug' rejim." }
        ]
      };

    case 'education':
      return {
        nicheKey: 'education',
        appName: isRu ? 'FutureTech Academy' : 'FutureTech IT Akademiya',
        appCategory: isRu ? 'Онлайн-курсы, IT профессии & Языки' : 'Onlayn kurslar va IT kasblari',
        themeColor: 'emerald',
        accentHex: '#10B981',
        gradientFrom: 'from-emerald-950/50',
        gradientTo: 'to-indigo-950/50',
        heroBadge: isRu ? '93% выпускников трудоустроены' : '93% bitiruvchilar ishga joylashdi',
        heroTitle: isRu ? 'Освой востребованную профессию с нуля' : 'Zamonaviy IT kasbini noldan professionalgacha o\'rganing',
        heroDesc: isRu ? 'Практические онлайн-курсы с персональным ментором, реальными проектами в портфолио и гарантией стажировки.' : 'Shaxsiy mentor ko\'magi, real loyihalar va amaliyot kafolati bilan sifatli ta\'lim.',
        ctaText: isRu ? 'Записаться на пробный урок' : 'Bepul darsga yozilish',
        products: [
          { id: 1, title: isRu ? "Профессия: Fullstack Разработчик (React + Node.js)" : "Fullstack Dasturchi kursi (React + Node.js)", price: 1800000, priceFormatted: isRu ? "1 800 000 сум/мес" : "1 800 000 so'm/oy", category: isRu ? "IT Курсы" : "Dasturlash", badge: isRu ? "Хит" : "Xit", rating: "★ 5.0 (480)", img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80", desc: isRu ? "6 месяцев: HTML/CSS, JavaScript, TypeScript, React, Express, PostgreSQL, Docker и 5 проектов в резюме." : "6 oylik to'liq dastur, noldan tayyor loyihalargacha va portfolio yaratish." },
          { id: 2, title: isRu ? "Курс: Python, Анализ Данных и Создание Ботов" : "Python va Telegram botlar yaratish", price: 1200000, priceFormatted: isRu ? "1 200 000 сум/мес" : "1 200 000 so'm/oy", category: isRu ? "Python" : "Python", badge: isRu ? "Top" : "Top", rating: "★ 4.9 (350)", img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80", desc: isRu ? "Синтаксис Python, парсинг сайтов, библиотеки Pandas, базы данных и Aiogram боты." : "Python asoslari, veb-skraping, ma'lumotlar tahlili va murakkab botlar." },
          { id: 3, title: isRu ? "Профессия: UI/UX Продуктовый дизайнер в Figma" : "UI/UX Dizaynerlik kursi (Figma)", price: 1400000, priceFormatted: isRu ? "1 400 000 сум/мес" : "1 400 000 so'm/oy", category: isRu ? "Дизайн" : "Dizayn", badge: isRu ? "Pro" : "Pro", rating: "★ 5.0 (210)", img: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600&q=80", desc: isRu ? "Исследования пользователей, CJM, вайрфреймы, мобильные интерфейсы и презентация клиенту." : "Foydalanuvchi tajribasi, mobil interfeyslar va professional portfolio." },
          { id: 4, title: isRu ? "Интенсивный курс английского языка для IT (B1 -> C1)" : "IT sohasi uchun Ingliz tili kursi", price: 850000, priceFormatted: isRu ? "850 000 сум/мес" : "850 000 so'm/oy", category: isRu ? "Языки" : "Tillar", badge: isRu ? "Speak" : "Nutq", rating: "★ 4.8 (180)", img: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&q=80", desc: isRu ? "Разговорная практика, прохождение собеседований в зарубежные компании и деловая переписка." : "Xorijiy kompaniyalarga intervyu topshirish va erkin muloqot qilish." }
        ]
      };

    case 'travel':
      return {
        nicheKey: 'travel',
        appName: isRu ? 'Horizon Travel Club' : 'Horizon Sayohat Agentligi',
        appCategory: isRu ? 'Туры по миру, Горящие путевки & Визы' : 'Xalqaro sayohatlar va qaynoq turlar',
        themeColor: 'cyan',
        accentHex: '#06B6D4',
        gradientFrom: 'from-cyan-950/50',
        gradientTo: 'to-blue-950/50',
        heroBadge: isRu ? 'Надежный туроператор с 2018 года' : '2018-yildan beri ishonchli turoperator',
        heroTitle: isRu ? 'Незабываемые путешествия в любую точку планеты' : 'Dunyoning eng go\'zal burchaklariga unutilmas sayohat',
        heroDesc: isRu ? 'Прямые рейсы, проверенные 5-звездочные отели, визовая поддержка и круглосуточный русскоязычный гид.' : 'To\'g\'ridan-to\'g\'ri parvozlar, 5 yulduzli mehmonxonalar va 24/7 shaxsiy gid xizmati.',
        ctaText: isRu ? 'Подобрать тур' : 'Turni tanlash',
        products: [
          { id: 1, title: isRu ? "Дубай (ОАЭ): 7 дней в отеле 5★ у пляжа JBR" : "Dubay (BAA): 7 kun JBR 5★ mehmonxonasida", price: 8400000, priceFormatted: isRu ? "8 400 000 сум" : "8 400 000 so'm", category: isRu ? "ОАЭ" : "BAA", badge: isRu ? "Хит" : "Xit", rating: "★ 5.0 (310)", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80", desc: isRu ? "Перелет туда-обратно, завтраки, трансфер на премиум авто и сафари по пустыне в подарок." : "Aviachipta, nonushta, transfer va cho'l safari ekskursiyasi." },
          { id: 2, title: isRu ? "Мальдивы: Водная вилла 'All Inclusive' (6 ночей)" : "Maldiv orollari: Suv ustidagi villa (All Inclusive)", price: 19800000, priceFormatted: isRu ? "19 800 000 сум" : "19 800 000 so'm", category: isRu ? "Острова" : "Orollar", badge: isRu ? "VIP" : "VIP", rating: "★ 5.0 (125)", img: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80", desc: isRu ? "Бирюзовая лагуна, трехразовое питание, гидросамолет от Мале и романтический ужин на закате." : "Moviy dengiz, gidrosamolyotda transfer va romantik kechki ovqat." },
          { id: 3, title: isRu ? "Стамбул + Каппадокия: Полет на воздушных шарах" : "Istanbul va Kapadokiya: Havo sharlarida parvoz", price: 6200000, priceFormatted: isRu ? "6 200 000 сум" : "6 200 000 so'm", category: isRu ? "Турция" : "Turkiya", badge: isRu ? "Top" : "Top", rating: "★ 4.9 (240)", img: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80", desc: isRu ? "Экскурсии по Босфору, пещерный отель в Гёреме и фотосессия на рассвете с шарами." : "Bosfor bo'ylab sayr, g'or mehmonxonasi va afsonaviy sharlar parvozi." },
          { id: 4, title: isRu ? "Анталья: Семейный отдых 'Ultra All Inclusive'" : "Antaliya: Oila uchun Ultra All Inclusive", price: 7100000, priceFormatted: isRu ? "7 100 000 сум" : "7 100 000 so'm", category: isRu ? "Турция" : "Turkiya", badge: isRu ? "Family" : "Oila", rating: "★ 4.9 (410)", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", desc: isRu ? "Первая линия, песчаный пляж, огромный аквапарк для детей и бесплатное мороженое." : "Birinchi qatorda joylashgan mehmonxona, qumli sohil va katta akvapark." }
        ]
      };

    default:
      return {
        nicheKey: 'fashion',
        appName: isRu ? 'LuxeStyle Fashion' : 'LuxeStyle Do\'koni',
        appCategory: isRu ? 'Брендовая одежда & Обувь' : 'Brend kiyimlar va poyabzal',
        themeColor: 'cyan',
        accentHex: '#00D9FF',
        gradientFrom: 'from-cyan-950/40',
        gradientTo: 'to-slate-900/60',
        heroBadge: isRu ? 'Новая коллекция 2025' : 'Yangi kolleksiya 2025',
        heroTitle: isRu ? 'Трендовая одежда и премиальный стиль' : 'Trenddagi kiyimlar va premium uslub',
        heroDesc: isRu ? 'Эксклюзивный стритвир, натуральный турецкий хлопок, идеальный оверсайз крой и доставка по городу.' : 'Eksklyuziv ko\'cha uslubi, sifatli turk paxtasi va qulay buyurtma berish imkoniyati.',
        ctaText: isRu ? 'Смотреть каталог' : 'Katalogni ko\'rish',
        products: [
          { id: 1, title: isRu ? "Oversize Худи 'Midnight Heavy' (420г)" : "Oversize Xudi 'Midnight Heavy' (420g)", price: 320000, priceFormatted: isRu ? "320 000 сум" : "320 000 so'm", category: isRu ? "Худи" : "Xudi", badge: isRu ? "Хит" : "Xit", rating: "★ 5.0 (310)", img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80", desc: isRu ? "100% турецкий плотный футер с начесом. Держит объемную форму." : "100% turk paxtasi, qalin va qulay xudi." },
          { id: 2, title: isRu ? "Кроссовки CloudWalk Pro White" : "CloudWalk Pro oq krossovkasi", price: 540000, priceFormatted: isRu ? "540 000 сум" : "540 000 so'm", category: isRu ? "Обувь" : "Poyabzal", badge: isRu ? "New" : "Yangi", rating: "★ 4.9 (185)", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", desc: isRu ? "Амортизирующая подошва Air Cushion, дышащий верх и ортопедическая стелька." : "Air Cushion qulay taglik, havo o'tkazuvchi to'qima." },
          { id: 3, title: isRu ? "Джинсы Denim Classic Wide-Leg" : "Keng bichimdagi klassik denim jinsi", price: 290000, priceFormatted: isRu ? "290 000 сум" : "290 000 so'm", category: isRu ? "Джинсы" : "Djinlar", badge: isRu ? "-15%" : "-15%", rating: "★ 4.8 (120)", img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80", desc: isRu ? "Классический плотный деним винтажной варки с надежной металлической молнией YKK." : "Klassik sifatli paxtali denim, zamonaviy erkin bichim." },
          { id: 4, title: isRu ? "Кожаная Куртка Urban Rider" : "Charm kurtka Urban Rider", price: 780000, priceFormatted: isRu ? "780 000 сум" : "780 000 so'm", category: isRu ? "Куртки" : "Kurtkalar", badge: isRu ? "Top" : "Top", rating: "★ 5.0 (94)", img: "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=600&q=80", desc: isRu ? "Премиум эко-кожа высокой плотности, ветрозащита и сатиновая подкладка." : "Premium eko-charm va shamolga chidamli qulay astar." }
        ]
      };
  }
}

export function generateComprehensiveProject(
  promptText: string,
  target: 'site_only' | 'bot_and_mini_app',
  isRu: boolean
): {
  html: string;
  bot_blocks: any[];
  bot_edges: any[];
  bot_code: string;
  appName: string;
} {
  const nicheKey = detectNiche(promptText);
  const cfg = getNicheConfig(nicheKey, isRu);

  const appName = cfg.appName;
  const categories = Array.from(new Set(cfg.products.map(p => p.category)));
  const productsJson = JSON.stringify(cfg.products);

  const html = `<!DOCTYPE html>
<html lang="${isRu ? 'ru' : 'uz'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${appName} • ${cfg.appCategory}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
    :root {
      --primary: ${cfg.accentHex};
      --glow: rgba(0, 217, 255, 0.25);
    }
    body { font-family: 'Inter', sans-serif; background-color: #07090E; color: #F8FAFC; }
    h1, h2, h3, h4 { font-family: 'Outfit', sans-serif; }
    .glass-card { background: rgba(255, 255, 255, 0.04); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .glass-card:hover { border-color: ${cfg.accentHex}66; transform: translateY(-2px); transition: all 0.2s ease; }
    .glow-accent { box-shadow: 0 0 25px ${cfg.accentHex}40; }
    .cart-drawer { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
  </style>
</head>
<body class="min-h-screen flex flex-col pb-24 selection:bg-cyan-500 selection:text-black">

  <!-- Top Sticky Header -->
  <header class="sticky top-0 z-40 bg-[#07090E]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
    <div class="max-w-5xl mx-auto flex items-center justify-between gap-3">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-lg glow-accent">
          ${appName.charAt(0)}
        </div>
        <div>
          <div class="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
            ${appName}
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div class="text-[11px] text-slate-400 font-medium">${cfg.appCategory}</div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button onclick="toggleAppointmentModal()" class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-1.5">
          <i class="fa-regular fa-calendar-check text-cyan-400"></i>
          <span class="hidden sm:inline">${isRu ? "Запись" : "Yozilish"}</span>
        </button>
        <button onclick="toggleCart()" class="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 transition flex items-center gap-2">
          <i class="fa-solid fa-bag-shopping text-base"></i>
          <span id="headerCartCount" class="bg-cyan-500 text-black text-[11px] font-black px-1.5 py-0.5 rounded-full">0</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Stories Bar -->
  <section class="max-w-5xl mx-auto px-4 pt-3 pb-1 w-full overflow-x-auto scrollbar-none flex gap-3.5 items-center">
    <div class="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0" onclick="openStory(0)">
      <div class="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 animate-pulse">
        <img src="${cfg.products[0].img}" class="w-full h-full rounded-full object-cover border-2 border-[#07090E]" />
      </div>
      <span class="text-[11px] text-slate-300 font-medium">${isRu ? "Хиты 🔥" : "Xitlar 🔥"}</span>
    </div>
    <div class="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0" onclick="openStory(1)">
      <div class="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-rose-500 to-pink-500">
        <img src="${cfg.products[1]?.img || cfg.products[0].img}" class="w-full h-full rounded-full object-cover border-2 border-[#07090E]" />
      </div>
      <span class="text-[11px] text-slate-300 font-medium">${isRu ? "Скидки 🎁" : "Aksiya 🎁"}</span>
    </div>
    <div class="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0" onclick="openStory(2)">
      <div class="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-emerald-400 to-cyan-500">
        <img src="${cfg.products[2]?.img || cfg.products[0].img}" class="w-full h-full rounded-full object-cover border-2 border-[#07090E]" />
      </div>
      <span class="text-[11px] text-slate-300 font-medium">${isRu ? "Новинки ✨" : "Yangilar ✨"}</span>
    </div>
    <div class="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0" onclick="toggleWheelModal()">
      <div class="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-amber-600 animate-bounce">
        <div class="w-full h-full rounded-full bg-[#0D111A] flex items-center justify-center text-2xl border-2 border-[#07090E]">
          🎡
        </div>
      </div>
      <span class="text-[11px] text-amber-400 font-bold">${isRu ? "Рулетка 🎁" : "Yutuq 🎡"}</span>
    </div>
  </section>

  <!-- Hero Section -->
  <section class="max-w-5xl mx-auto px-4 pt-6 pb-2 w-full">
    <div class="relative overflow-hidden rounded-3xl p-6 sm:p-10 bg-gradient-to-br ${cfg.gradientFrom} via-slate-900/60 ${cfg.gradientTo} border border-white/10 glow-accent">
      <div class="relative z-10 max-w-xl">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-cyan-400 border border-white/10 mb-3.5">
          <i class="fa-solid fa-sparkles"></i> ${cfg.heroBadge}
        </span>
        <h1 class="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3 leading-tight">
          ${cfg.heroTitle}
        </h1>
        <p class="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
          ${cfg.heroDesc}
        </p>
        <div class="flex flex-wrap items-center gap-3">
          <a href="#catalog" class="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs sm:text-sm transition glow-accent flex items-center gap-2">
            <span>${cfg.ctaText}</span>
            <i class="fa-solid fa-arrow-down"></i>
          </a>
          <button onclick="toggleAppointmentModal()" class="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-xs sm:text-sm transition flex items-center gap-2">
            <i class="fa-regular fa-comment-dots text-cyan-400"></i>
            <span>${isRu ? "Консультация" : "Maslahat olish"}</span>
          </button>
        </div>
      </div>
      <div class="absolute -right-12 -bottom-12 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  </section>

  <!-- Search & Category Filters -->
  <section id="catalog" class="max-w-5xl mx-auto px-4 pt-8 pb-4 w-full">
    <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-4">
      <div class="relative flex-1">
        <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
        <input 
          id="searchInput"
          type="text" 
          placeholder="${isRu ? 'Поиск позиций по каталогу...' : 'Katalog bo\'yicha qidirish...'}"
          oninput="searchProducts(this.value)"
          class="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition"
        />
      </div>

      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        <button onclick="filterCategory('all')" class="cat-pill active px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap bg-cyan-500 text-black transition">
          ${isRu ? "Все" : "Barchasi"}
        </button>
        ${categories.map(cat => `
          <button onclick="filterCategory('${cat}')" class="cat-pill px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition">
            ${cat}
          </button>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Products Grid -->
  <main class="max-w-5xl mx-auto px-4 w-full flex-1">
    <div id="productsGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"></div>
    <div id="noResults" class="hidden text-center py-16">
      <i class="fa-solid fa-box-open text-3xl text-slate-600 mb-2"></i>
      <p class="text-sm text-slate-400">${isRu ? "Позиции не найдены" : "Hech narsa topilmadi"}</p>
    </div>
  </main>

  <!-- Interactive Appointment / Consultation Modal -->
  <div id="appointmentModal" class="fixed inset-0 z-50 pointer-events-none opacity-0 transition-opacity duration-300 flex items-center justify-center p-4">
    <div onclick="toggleAppointmentModal()" class="absolute inset-0 bg-black/75 backdrop-blur-sm pointer-events-auto"></div>
    <div class="relative z-10 w-full max-w-md bg-[#0D111A] border border-white/10 rounded-3xl p-6 pointer-events-auto shadow-2xl">
      <div class="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
        <h3 class="font-bold text-base text-white flex items-center gap-2">
          <i class="fa-regular fa-calendar-check text-cyan-400"></i>
          <span>${isRu ? "Онлайн Запись & Консультация" : "Online Yozilish"}</span>
        </h3>
        <button onclick="toggleAppointmentModal()" class="w-8 h-8 rounded-lg bg-white/5 text-slate-400 hover:text-white flex items-center justify-center">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>
      <form onsubmit="handleAppointmentSubmit(event)" class="space-y-3.5 text-xs">
        <div>
          <label class="text-slate-400 font-medium block mb-1">${isRu ? "Ваше имя" : "Ismingiz"}</label>
          <input required type="text" id="clientName" placeholder="${isRu ? 'Азиз Каримов' : 'Aziz Karimov'}" class="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition" />
        </div>
        <div>
          <label class="text-slate-400 font-medium block mb-1">${isRu ? "Номер телефона" : "Telefon raqam"}</label>
          <input required type="tel" id="clientPhone" placeholder="+998 90 123-45-67" class="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition" />
        </div>
        <div>
          <label class="text-slate-400 font-medium block mb-1">${isRu ? "Желаемая дата или услуга" : "Xizmat turi"}</label>
          <input type="text" id="clientNote" placeholder="${isRu ? 'Например: Завтра в 14:00' : 'Ertaga soat 14:00 da'}" class="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition" />
        </div>
        <button type="submit" class="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm transition glow-accent mt-4">
          ${isRu ? "Подтвердить запись 🚀" : "Yozilishni tasdiqlash 🚀"}
        </button>
      </form>
    </div>
  </div>

  <!-- Slide-Over Shopping Cart Drawer -->
  <div id="cartModal" class="fixed inset-0 z-50 pointer-events-none opacity-0 transition-opacity duration-300">
    <div onclick="toggleCart()" class="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto"></div>
    <div class="cart-drawer absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#0D111A] border-l border-white/10 p-5 flex flex-col pointer-events-auto translate-x-full shadow-2xl">
      <div class="flex items-center justify-between pb-4 border-b border-white/10">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-bag-shopping text-cyan-400"></i>
          <h3 class="font-bold text-base text-white">${isRu ? "Ваш Заказ" : "Buyurtmangiz"}</h3>
          <span id="cartCountBadge" class="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold">0</span>
        </div>
        <button onclick="toggleCart()" class="w-8 h-8 rounded-lg bg-white/5 text-slate-400 hover:text-white flex items-center justify-center">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <div id="cartItemsList" class="flex-1 overflow-y-auto py-4 space-y-3"></div>

      <div class="pt-4 border-t border-white/10 space-y-3">
        <div class="flex justify-between text-xs text-slate-400">
          <span>${isRu ? "Сервисный сбор" : "Xizmat haqi"}</span>
          <span class="text-emerald-400 font-bold">${isRu ? "0 сум (Бесплатно)" : "0 so'm (Bepul)"}</span>
        </div>
        <div class="flex justify-between text-base font-black text-white">
          <span>${isRu ? "Итого к оплате:" : "Jami to'lov:"}</span>
          <span id="cartTotalSum" class="text-cyan-400">0 so'm</span>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-2">
          <button onclick="checkout('payme')" class="py-2.5 rounded-xl bg-[#00cccc]/20 hover:bg-[#00cccc]/30 border border-[#00cccc]/40 text-[#00cccc] font-bold text-xs transition flex items-center justify-center gap-1.5">
            <span>Payme</span>
          </button>
          <button onclick="checkout('click')" class="py-2.5 rounded-xl bg-[#0070ba]/20 hover:bg-[#0070ba]/30 border border-[#0070ba]/40 text-[#38bdf8] font-bold text-xs transition flex items-center justify-center gap-1.5">
            <span>Click</span>
          </button>
        </div>

        <button onclick="checkout('telegram')" class="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition glow-accent flex items-center justify-center gap-2">
          <i class="fa-brands fa-telegram text-sm"></i>
          <span>${isRu ? "Оформить через Telegram" : "Telegram orqali yuborish"}</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Wheel of Fortune Modal -->
  <div id="wheelModal" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
    <div class="relative w-full max-w-sm bg-[#0D111A] border border-amber-500/30 rounded-3xl p-6 text-center shadow-2xl">
      <button onclick="toggleWheelModal()" class="absolute right-4 top-4 text-slate-400 hover:text-white">
        <i class="fa-solid fa-xmark text-lg"></i>
      </button>
      <div class="text-2xl mb-1">🎡</div>
      <h3 class="font-bold text-lg text-white mb-1">${isRu ? "Колесо Скидок & Призов" : "Omad G'ildiragi"}</h3>
      <p class="text-xs text-slate-400 mb-4">${isRu ? "Вращайте колесо и получайте гарантированные подарки!" : "G'ildirakni aylantiring va kafolatlangan sovg'alarga ega bo'ling!"}</p>
      
      <div class="relative w-64 h-64 mx-auto mb-4">
        <canvas id="wheelCanvas" width="256" height="256" class="w-full h-full transition-transform duration-[4000ms] ease-out"></canvas>
        <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 text-amber-400 text-xl">▼</div>
      </div>

      <div id="wheelPrizeBox" class="hidden mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
        🎉 ${isRu ? "Ваш приз:" : "Sizning yutug'ingiz:"} <span id="wheelPrizeText"></span>
      </div>

      <button id="spinBtn" onclick="spinWheel()" class="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold text-sm transition shadow-lg">
        ${isRu ? "Вращать Колесо! 🎯" : "Aylantirish! 🎯"}
      </button>
    </div>
  </div>

  <!-- Live Social Proof Toast -->
  <div id="socialProofToast" class="fixed bottom-4 left-4 z-40 max-w-xs bg-[#0D111A]/95 border border-white/10 rounded-2xl p-3 shadow-2xl backdrop-blur-xl transform -translate-x-full opacity-0 transition-all duration-500 flex items-center gap-3">
    <div class="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 text-sm">
      <i class="fa-solid fa-check"></i>
    </div>
    <div class="text-xs">
      <div id="socialProofText" class="text-white font-semibold line-clamp-1">Азиз оформил заказ</div>
      <div id="socialProofSub" class="text-[10px] text-slate-400">🔥 2 мин назад • Проверенный клиент</div>
    </div>
  </div>

  <script>
    const ALL_PRODUCTS = ${productsJson};
    let cart = [];

    function renderProducts(items) {
      const grid = document.getElementById('productsGrid');
      const noRes = document.getElementById('noResults');
      if (!grid) return;

      if (!items || items.length === 0) {
        grid.innerHTML = '';
        if (noRes) noRes.classList.remove('hidden');
        return;
      }
      if (noRes) noRes.classList.add('hidden');

      grid.innerHTML = items.map(p => \`
        <div class="glass-card rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div class="relative w-full h-44 rounded-xl overflow-hidden mb-3.5 bg-slate-900">
              <img src="\${p.img}" alt="\${p.title}" class="w-full h-full object-cover" loading="lazy" />
              \${p.badge ? \`<span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/10">\${p.badge}</span>\` : ''}
              <span class="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/70 backdrop-blur-md text-amber-300">\${p.rating}</span>
            </div>
            <div class="text-[11px] text-cyan-400 font-semibold mb-1">\${p.category}</div>
            <h3 class="font-bold text-sm text-white mb-1.5 leading-snug">\${p.title}</h3>
            <p class="text-[11px] text-slate-400 leading-relaxed mb-3 line-clamp-2">\${p.desc}</p>
          </div>
          <div class="flex items-center justify-between pt-3 border-t border-white/5">
            <div class="font-black text-sm text-white">\${p.priceFormatted}</div>
            <button onclick="addToCart(\${p.id})" class="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition glow-accent flex items-center gap-1.5">
              <i class="fa-solid fa-plus text-[10px]"></i>
              <span>\${'${isRu ? "В корзину" : "Qo'shish"}'}</span>
            </button>
          </div>
        </div>
      \`).join('');
    }

    function searchProducts(q) {
      const filtered = ALL_PRODUCTS.filter(p => 
        p.title.toLowerCase().includes(q.toLowerCase()) || 
        p.desc.toLowerCase().includes(q.toLowerCase()) ||
        p.category.toLowerCase().includes(q.toLowerCase())
      );
      renderProducts(filtered);
    }

    function filterCategory(cat) {
      document.querySelectorAll('.cat-pill').forEach(btn => {
        btn.classList.remove('bg-cyan-500', 'text-black');
        btn.classList.add('bg-white/5', 'text-slate-300');
      });
      event?.target?.classList?.remove('bg-white/5', 'text-slate-300');
      event?.target?.classList?.add('bg-cyan-500', 'text-black');

      if (cat === 'all') {
        renderProducts(ALL_PRODUCTS);
      } else {
        renderProducts(ALL_PRODUCTS.filter(p => p.category === cat));
      }
    }

    function addToCart(id) {
      const prod = ALL_PRODUCTS.find(p => p.id === id);
      if (!prod) return;
      const exist = cart.find(c => c.id === id);
      if (exist) {
        exist.qty += 1;
      } else {
        cart.push({ ...prod, qty: 1 });
      }
      updateCartState();
      showToast(\`\${prod.title} \${'${isRu ? "добавлен в корзину" : "savatchaga qo'shildi"}'}\`);
    }

    function updateCartState() {
      const count = cart.reduce((sum, i) => sum + i.qty, 0);
      const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
      
      const countEl = document.getElementById('headerCartCount');
      if (countEl) countEl.innerText = count;
      const badgeEl = document.getElementById('cartCountBadge');
      if (badgeEl) badgeEl.innerText = count;
      const totalEl = document.getElementById('cartTotalSum');
      if (totalEl) totalEl.innerText = total.toLocaleString() + ' so\\\'m';

      renderCartList();
    }

    function renderCartList() {
      const list = document.getElementById('cartItemsList');
      if (!list) return;

      if (cart.length === 0) {
        list.innerHTML = \`<div class="text-center py-10 text-slate-500 text-xs">\${'${isRu ? "Корзина пуста" : "Savatcha bo'sh"}'}</div>\`;
        return;
      }

      list.innerHTML = cart.map(item => \`
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
          <div class="flex items-center gap-2.5">
            <img src="\${item.img}" class="w-10 h-10 rounded-lg object-cover" />
            <div>
              <div class="text-xs font-bold text-white line-clamp-1">\${item.title}</div>
              <div class="text-[10px] text-cyan-400 font-semibold">\${(item.price * item.qty).toLocaleString()} so'm</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="changeQty(\${item.id}, -1)" class="w-6 h-6 rounded bg-white/10 text-white flex items-center justify-center text-xs">-</button>
            <span class="text-xs font-bold text-white w-4 text-center">\${item.qty}</span>
            <button onclick="changeQty(\${item.id}, 1)" class="w-6 h-6 rounded bg-white/10 text-white flex items-center justify-center text-xs">+</button>
          </div>
        </div>
      \`).join('');
    }

    function changeQty(id, delta) {
      const item = cart.find(c => c.id === id);
      if (!item) return;
      item.qty += delta;
      if (item.qty <= 0) {
        cart = cart.filter(c => c.id !== id);
      }
      updateCartState();
    }

    function toggleCart() {
      const modal = document.getElementById('cartModal');
      const drawer = modal?.querySelector('.cart-drawer');
      if (!modal) return;
      const isOpen = !modal.classList.contains('pointer-events-none');
      if (isOpen) {
        modal.classList.add('pointer-events-none', 'opacity-0');
        drawer?.classList.add('translate-x-full');
      } else {
        modal.classList.remove('pointer-events-none', 'opacity-0');
        drawer?.classList.remove('translate-x-full');
      }
    }

    function toggleAppointmentModal() {
      const modal = document.getElementById('appointmentModal');
      if (!modal) return;
      modal.classList.toggle('pointer-events-none');
      modal.classList.toggle('opacity-0');
    }

    function handleAppointmentSubmit(e) {
      e.preventDefault();
      const name = document.getElementById('clientName')?.value;
      const phone = document.getElementById('clientPhone')?.value;
      const note = document.getElementById('clientNote')?.value;

      const payload = {
        action: 'appointment',
        name,
        phone,
        note,
        timestamp: Date.now()
      };

      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.sendData(JSON.stringify(payload));
      } else {
        alert(\`\${'${isRu ? "Спасибо, " : "Rahmat, "}'}\${name}! \${'${isRu ? "Ваша заявка принята. Мы свяжемся с вами по номеру " : "Arizangiz qabul qilindi: "}'}\${phone}\`);
      }
      toggleAppointmentModal();
    }

    function checkout(method) {
      if (cart.length === 0) {
        alert('${isRu ? "Сначала добавьте товары или услуги в корзину!" : "Avval savatchaga tovar qo\'shing!"}');
        return;
      }
      const totalSum = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
      const payload = {
        app: '${appName}',
        method,
        items: cart.map(i => ({ id: i.id, title: i.title, qty: i.qty, price: i.price })),
        total: totalSum,
        timestamp: Date.now()
      };

      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.sendData(JSON.stringify(payload));
      } else {
        alert(\`\${'${isRu ? "Заказ на сумму " : "Jami "}'}\${totalSum.toLocaleString()} \${'${isRu ? "сум успешно оформлен через " : "so\'mlik buyurtma qabul qilindi ("}'}\${method.toUpperCase()})!\`);
        cart = [];
        updateCartState();
        toggleCart();
      }
    }

    function showToast(text) {
      const t = document.getElementById('socialProofToast');
      if (!t) return;
      document.getElementById('socialProofText').innerText = text;
      document.getElementById('socialProofSub').innerText = '🔥 ' + '${isRu ? "Только что" : "Hozirgina"}';
      t.classList.remove('-translate-x-full', 'opacity-0');
      setTimeout(() => t.classList.add('-translate-x-full', 'opacity-0'), 3000);
    }

    // Initialize
    renderProducts(ALL_PRODUCTS);
  </script>
</body>
</html>`;

  const bot_blocks = [
    {
      id: "node_1",
      type: "start",
      position: { x: 100, y: 150 },
      data: { label: isRu ? "Старт" : "Boshlash", emoji: "▶", color: "#10d974", text: "/start" }
    },
    {
      id: "node_sub",
      type: "subscription",
      position: { x: 400, y: 150 },
      data: {
        label: isRu ? "Проверка подписки" : "Kanalga a'zolik",
        emoji: "📢",
        color: "#8b5cf6",
        channel: "@mazaika_official"
      }
    },
    {
      id: "node_sub_msg",
      type: "message",
      position: { x: 400, y: 380 },
      data: {
        label: isRu ? "Требуется подписка" : "Kanalga obuna",
        emoji: "⚠️",
        color: "#f59e0b",
        text: isRu
          ? "Для доступа к функциям бота, пожалуйста, подпишитесь на наш официальный Telegram канал:"
          : "Bot imkoniyatlaridan foydalanish uchun, iltimos rasmiy kanalimizga a'zo bo'ling:",
        buttons: [
          isRu ? "📢 Перейти в канал | https://t.me/mazaika_official" : "📢 Kanalga o'tish | https://t.me/mazaika_official",
          isRu ? "✅ Проверить подписку" : "✅ Tekshirish"
        ]
      }
    },
    {
      id: "node_2",
      type: "message",
      position: { x: 750, y: 150 },
      data: {
        label: isRu ? "Главное меню" : "Asosiy menyu",
        emoji: "💬",
        color: "#1e90ff",
        text: isRu
          ? `Здравствуйте! Добро пожаловать в ${appName} (${cfg.appCategory}). Выберите нужное действие:`
          : `Assalomu alaykum! ${appName}ga xush kelibsiz. Quyidagi bo'limlardan birini tanlang:`,
        buttons: [
          isRu ? "🛍 Открыть Mini App" : "🛍 Mini App-ni ochish",
          isRu ? "📅 Записаться онлайн" : "📅 Online yozilish",
          isRu ? "🔗 Пригласить друзей" : "🔗 Do'stlarni taklif qilish",
          isRu ? "📞 Связаться с оператором" : "📞 Operator bilan aloqa"
        ]
      }
    },
    {
      id: "node_ref",
      type: "refCreate",
      position: { x: 1100, y: 150 },
      data: {
        label: isRu ? "Реферальная ссылка" : "Referral havola",
        emoji: "🔗",
        color: "#00f5c4",
        text: isRu
          ? "🔗 Ваша персональная ссылка для приглашений:\n{ref_link}\n\nПриглашайте друзей и получайте бонусы за каждого участника!"
          : "🔗 Sizning taklif havolangiz:\n{ref_link}\n\nDo'stlaringizni taklif qiling va har bir do'stingiz uchun ballarga ega bo'ling!"
      }
    },
    {
      id: "node_phone",
      type: "phone",
      position: { x: 750, y: 380 },
      data: {
        label: isRu ? "Сбор телефона" : "Telefon raqam",
        emoji: "📱",
        color: "#06b6d4",
        text: isRu ? "Для связи и подтверждения отправьте ваш номер телефона:" : "Bog'lanish uchun telefon raqamingizni yuboring:",
        variable: "user_phone"
      }
    },
    {
      id: "node_notify",
      type: "notifyOperator",
      position: { x: 750, y: 600 },
      data: {
        label: isRu ? "Уведомление менеджеру" : "Operatorga xabar",
        emoji: "👨‍💼",
        color: "#f97316",
        text: isRu ? `🔥 Новый клиент в ${appName}!\nТелефон: {user_phone}` : `🔥 Yangi mijoz!\nTelefon: {user_phone}`
      }
    },
    {
      id: "node_confirm",
      type: "message",
      position: { x: 750, y: 820 },
      data: {
        label: isRu ? "Подтверждение" : "Tasdiq xabari",
        emoji: "✅",
        color: "#10d974",
        text: isRu
          ? `Спасибо! Ваш запрос принят. Администратор ${appName} свяжется с вами в течение 5 минут.`
          : `Rahmat! So'rovingiz qabul qilindi. Tez orada ${appName} operatori siz bilan bog'lanadi.`
      }
    }
  ];

  const bot_edges = [
    { id: "e1-sub", source: "node_1", target: "node_sub", animated: true },
    { id: "esub-2", source: "node_sub", target: "node_2", sourceHandle: "true" },
    { id: "esub-msg", source: "node_sub", target: "node_sub_msg", sourceHandle: "false" },
    { id: "emsg-sub", source: "node_sub_msg", target: "node_sub" },
    { id: "e2-ref", source: "node_2", target: "node_ref" },
    { id: "e2-phone", source: "node_2", target: "node_phone" },
    { id: "ephone-notify", source: "node_phone", target: "node_notify" },
    { id: "enotify-confirm", source: "node_notify", target: "node_confirm" }
  ];

  const bot_code = `// =============================================
// ${appName.toUpperCase()} TELEGRAM BOT
// Generated by Mazaika AI Studio
// =============================================
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN');
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://mazaika.app';

bot.start((ctx) => {
  const name = ctx.from.first_name || 'Foydalanuvchi';
  return ctx.reply(
    \`\${name}, \${appName} rasmiy botiga xush kelibsiz!\`,
    Markup.inlineKeyboard([
      [Markup.button.webApp('🚀 Ochish / Mini App', WEBAPP_URL)],
      [Markup.button.callback('📞 Aloqa / Yordam', 'contact_help')]
    ])
  );
});

bot.on('message', async (ctx) => {
  if (ctx.message.web_app_data) {
    try {
      const data = JSON.parse(ctx.message.web_app_data.data);
      await ctx.reply(\`✅ Qabul qilindi: \${data.action || 'Buyurtma'}\\nSumma: \${data.total || 0} so'm\`);
    } catch(e) {}
  }
});

bot.action('contact_help', (ctx) => ctx.reply('Biz bilan aloqa: @mazaika_support'));
bot.launch();
`;

  return { html, bot_blocks, bot_edges, bot_code, appName };
}
