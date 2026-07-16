# Mazaika loyihasi bo'yicha yo'riqnoma va funksiyalar ro'yxati

Ushbu hujjatda loyihadagi har bir vizual blokning ishlash tamoyili, uning funksional imkoniyatlari va undan to'g'ri foydalanish bo'yicha batafsil ma'lumotlar berib boriladi.

---

## 1. Boshlash (Start / /start) bloki
Bot foydalanuvchi birinchi marta botga kirib `/start` buyrug'ini bosganda yoki botni qayta ishga tushirganda faollashadigan kirish nuqtasi.

### Imkoniyatlari:
*   **Referal va reklama kampaniyalarini aniqlash (Deep Linking):** Botga kelgan har qanday `/start payload` ko'rinishidagi havola parametrlari (masalan, `t.me/bot?start=promo_100`) avtomatlashtirilgan tarzda o'qiladi.
*   **Gator o'zgaruvchi:** Havoladagi parametr ajratib olinib, foydalanuvchining shaxsiy ma'lumotlaridagi `{start_payload}` o'zgaruvchisiga saqlanadi.
*   **Qanday ishlatiladi:** Ushbu parametrni keyingi har qanday Xabar bloklarida `{start_payload}` yozuvi orqali foydalanuvchiga ko'rsatishingiz yoki shart tekshirgich (If) bloki yordamida har xil yo'nalishlarga yo'llashingiz mumkin.

---

## 2. Xabar (Message / Text) bloki
Foydalanuvchiga matnli xabarlar va multimedia ma'lumotlarini (rasm, video) yuborish uchun asosiy blok.

### Imkoniyatlari:
*   **Dinamik o'zgaruvchilar:** Xabar matnida foydalanuvchidan olingan o'zgaruvchilarni `{o'zgaruvchi_nomi}` shaklida chiqarish imkoniyati (masalan: `Salom {name}, telefoningiz: {phone}`).
*   **Media qo'llab-quvvatlash (Rasm/Video):** Xabarga rasm yoki video havolasini (URL) biriktirish imkoniyati. Havola `.mp4`, `.mov` kabi video formatlari bilan tugasa, xabar video ko'rinishida yuboriladi. Boshqa barcha holatlarda rasm sifatida yuboriladi va matn taglavha (caption) sifatida biriktiriladi.
*   **Inline va Maxsus Tugmalar:** Xabar tagiga tugmalar qo'shish imkoniyati:
    *   **Standart o'tish tugmasi:** Shunchaki tugma nomi yoziladi (masalan: `Katalog`). Bosilganda bot ssenariy bo'yicha keyingi blokka o'tadi.
    *   **Veb-sayt ochish tugmasi:** `Tugma nomi|havola` formatida yoziladi (masalan: `Google|https://google.com`). Bosilganda foydalanuvchida brauzer orqali ko'rsatilgan sayt ochiladi.
    *   **Mini App (Telegram Web App) tugmasi:** `Tugma nomi|webapp:havola` formatida yoziladi (masalan: `Do'konimiz|webapp:https://mazaika.pages.dev/webapp/BOT_ID/APP_ID`). Bosilganda ko'rsatilgan Mini App bot ichida ochiladi.

---

## 3. Zanjir (Chain / Jump / Goto) bloki
Foydalanuvchini boshqa bir blokka hech qanday shartlarsiz va kutishlarsiz avtomatik yo'naltirish (jump) uchun mo'ljallangan blok.

### Imkoniyatlari:
*   **Oson blok tanlash (Dropdown):** Endi blok ID sini qo'lda yozish shart emas! Tizim avtomatik ravishda mavjud barcha bloklarning ro'yxatini va ulardagi matnlarning qisqartmasini ko'rsatib turadi. Siz shunchaki ro'yxatdan kerakli blokni tanlaysiz.
*   **Siklga qarshi himoya (Infinite Loop Protection):** Agar siz xatolik tufayli cheksiz zanjir yaratib qo'ysangiz (masalan, Blok A -> Blok B -> Blok A), botimizning ijro etish tizimi buni avtomatik aniqlaydi va botni to'xtatadi. Bu server ishdan chiqishining oldini oladi.

---

## 4. Kechikish (Timer / Delay) bloki
Ssenariy bajarilishini belgilangan vaqtga (soniya, daqiqa, soat yoki kun) to'xtatib turish uchun mo'ljallangan blok.

### Imkoniyatlari:
*   **Kengaytirilgan vaqt o'lchovlari:** Kutish vaqtini soniya, daqiqa, soat yoki kun formatida o'rnatish imkoni bor (masalan: 12 soatdan keyin eslatma yuborish).
*   **Asinxron persistent rejalashtiruvchi (Enterprise-grade Scheduler):** 
    *   Agar kechikish vaqti 5 soniyadan kam bo'lsa, u tezkorlik uchun to'g'ridan-to'g'ri xotirada bajariladi.
    *   Agar vaqt 5 soniyadan ko'p bo'lsa, u ma'lumotlar bazasidagi (`timers` kolleksiyasi) maxsus navbatga yozib qo'yiladi.
    *   **Nega bu muhim:** Server o'chib yonsa ham, qayta yuklansa ham yoki bot to'xtab qolsa ham rejalashtirilgan kutish timerlari yo'qolmaydi va belgilangan vaqtda aniq davom etadi. U uzoq davom etuvchi so'rovlarni bloklamaydi.

---

## 5. Matnli savol (Question) bloki
Foydalanuvchiga savol berib, uning javobini o'zgaruvchiga saqlash va ssenariyni davom ettirish uchun mo'ljallangan blok.

### Imkoniyatlari:
*   **Media qo'llab-quvvatlash (Rasm/Video):** Savol matniga ixtiyoriy ravishda rasm yoki video havolasini biriktirishingiz mumkin. Rasm / video foydalanuvchiga savol taglavhasi bilan birga ko'rsatiladi.
*   **O'zgaruvchilarga saqlash:** Foydalanuvchi yozgan har qanday javob matni siz belgilagan o'zgaruvchiga (masalan: `ism`, `yosh`, `shahar`) saqlanadi. Uni keyinchalik `{ism}` ko'rinishida xabarlarda ishlatish mumkin.
*   **Variantlar (Inline Buttons / Tanlovlar):** 
    *   Savolga ixtiyoriy tanlov tugmalarini biriktirishingiz mumkin (masalan: `Ha`, `Yo'q` yoki `Boshqa`).
    *   Foydalanuvchi tugmalardan birini bossa, ushbu tugma matni avtomatik ravishda uning javobi sifatida o'zgaruvchiga yoziladi va ssenariy keyingi blokka o'tadi.

---

## 6. Telefon raqam (Phone) bloki
Foydalanuvchidan telefon raqamini so'rash va uni o'zgaruvchiga saqlash uchun maxsus blok.

### Imkoniyatlari:
*   **Kontakt ulashish tugmasini sozlash (Custom Button Text):** Telefon yuborish tugmasi matnini xohlaganingizcha o'zgartirishingiz mumkin (masalan: `📞 Raqamni yuborish` yoki `📱 Telefon raqamni ulashish`).
*   **Ikki tomonlama tekshiruv (Smart Hybrid Input):**
    *   **Tugma orqali:** Foydalanuvchi tugmani bossa, Telegram uning kontakt raqamini xavfsiz shaklda uzatadi.
    *   **Qo'lda kiritish (Manual Input):** Agar foydalanuvchi tugmani bosmasdan, telefon raqamini matn ko'rinishida yozib yuborsa (masalan, `+998901234567` yoki `90 123-45-67`), bot uni avtomatik tarzda tozalaydi, validatsiyadan o'tkazadi va to'g'ri bo'lsa qabul qiladi.
    *   Agar noto'g'ri matn yozilsa, bot foydalanuvchidan tugmani bosishni yoki raqamni to'g'ri formatda yozishni so'raydi.

---

## 7. Email manzil (Email) bloki
Foydalanuvchidan elektron pochta (email) manzilini so'rash va uni o'zgaruvchiga saqlash uchun maxsus blok.

### Imkoniyatlari:
*   **Dinamik o'zgaruvchilar yordamida savol berish:** Savol matnining ichida boshqa o'zgaruvchilarni ishlatish imkoni (masalan: `Rahmat {name}, endi elektron pochtangizni kiriting:`).
*   **Formatni avtomatik tozalash va tekshirish (Smart Validation):**
    *   Foydalanuvchi email kiritganda, tizim avtomatik ravishda boshidagi va oxiridagi bo'shliqlarni olib tashlaydi (`trim`) va harflarni kichik ko'rinishga keltiradi (`toLowerCase()`).
    *   Tizim email manzilini to'g'riligini maxsus andoza (Regular Expression) orqali tekshiradi (masalan, `user@domain.com` kabi formatda ekanligini).
    *   Noto'g'ri format kiritilganda, bot xatolik haqida yozadi va foydalanuvchiga to'g'ri yozish bo'yicha namuna ko'rsatib, qayta so'raydi.

---

## 8. Lokatsiya (Location / Geolokatsiya) bloki
Foydalanuvchidan geografik joylashuvini (GPS koordinatalarini) so'rash va uni o'zgaruvchiga saqlash uchun maxsus blok.

### Imkoniyatlari:
*   **Dinamik o'zgaruvchilar yordamida savol berish:** Savol matnining ichida boshqa o'zgaruvchilarni ishlatish imkoni (masalan: `Salom {name}, yetkazib berish manzilini ulashing:`).
*   **Geolokatsiya yuborish tugmasini sozlash (Custom Button Text):** Lokatsiya yuborish tugmasi matnini xohlaganingizcha o'zgartirishingiz mumkin (masalan: `📍 Lokatsiyani yuborish` yoki `🗺 Turgan joyimni jo'natish`).
*   **O'zgaruvchiga saqlash:** Foydalanuvchi yuborgan geolokatsiyaning koordinatalari (masalan, `41.311081,69.240562` formatida) siz belgilagan o'zgaruvchiga yoziladi. Bu ma'lumotni kuryerlar uchun yetkazib berish lokatsiyasi sifatida ishlatish juda qulay.

---

## 9. Shart (If / Condition) bloki
O'zgaruvchilar qiymatini tekshirish orqali ssenariyni ikki xil yo'nalishga — **To'g'ri (True)** va **Noto'g'ri (False)** tarmoqlarga ajratish (branching) uchun mo'ljallangan blok.

### Imkoniyatlari:
*   **Kengaytirilgan mantiqiy operatorlar:**
    *   `==` (Teng): O'zgaruvchi va kiritilgan qiymat teng bo'lsa.
    *   `!=` (Teng emas): O'zgaruvchi va kiritilgan qiymat teng bo'lmasa.
    *   `>` (Katta) va `<` (Kichik): Sonlarni solishtirish uchun.
    *   `Contains` (O'z ichiga oladi): Matnlarni solishtirish uchun. Bu operator endi **registrsiz (case-insensitive)** ishlaydi (masalan, "olma" so'zi "Olma"ni ham, "OLMA"ni ham qamrab oladi).
    *   `Is Empty` (Qiymatga ega emas): O'zgaruvchi bo'sh bo'lsa yoki hali yaratilmagan bo'lsa.
    *   `Is Set` (Qiymatga ega): O'zgaruvchida biror qiymat mavjud bo'lsa.
    *   `Regex` (Muntazam ifoda): O'zgaruvchi qiymati siz yozgan regex patterniga mos kelishini tekshirish uchun (masalan, `^[0-9]+$` raqam ekanligini tekshirish).
*   **Dinamik UI:**
    *   Agar siz `Is Empty` yoki `Is Set` operatorlarini tanlasangiz, frontenddagi "Tekshiriladigan qiymat" kiritish maydoni avtomatik ravishda yashiriladi. Bu ortiqcha chalkashliklarning oldini oladi.

---

## 10. Kanalga a'zolik (Subscription Check) bloki
Foydalanuvchining Telegram kanaliga yoki guruhiga a'zoligini (obunasini) avtomatik ravishda tekshirish va ssenariyni mos ravishda tarmoqlash uchun mo'ljallangan blok.

### Imkoniyatlari:
*   **Kanallar va Guruhlarni qo'llab-quvvatlash:** Kanal usernameni `@` bilan (masalan: `@my_channel`) yoki guruh ID sini `-100` bilan (masalan: `-100123456789`) yozib tekshirishingiz mumkin.
*   **Ikki tarmoqli chiqish (Branching):**
    *   **A'zo bo'lgan (True):** Foydalanuvchi kanalga a'zo bo'lsa (yoki uning yaratuvchisi/administratori bo'lsa), bot ssenariy bo'yicha ushbu tarmoqdan davom etadi.
    *   **A'zo bo'lmagan (False):** Foydalanuvchi a'zo bo'lmasa, bot ushbu tarmoqdan davom etadi (masalan, siz uni "Iltimos kanalga a'zo bo'ling: @channel" matnli blokiga yo'naltirishingiz va u yerda "Tekshirish" tugmasini qo'shib, ssenariyni qayta obuna tekshiruvchi blokka bog'lashingiz mumkin).
*   **Diqqat:** Ushbu tekshiruv to'g'ri ishlashi uchun, sizning botingiz mazkur kanalda yoki guruhda **Administrator** huquqiga ega bo'lishi va foydalanuvchilar ro'yxatini ko'ra olishi shart.

---

## 11. O'zgaruvchi (Variable Set / Assignment) bloki
Tizimdagi o'zgaruvchilarga qiymat yuklash yoki ularning qiymatlarini o'zgartirish uchun mo'ljallangan blok.

### Imkoniyatlari:
*   **O'zgaruvchilarni dinamik almashtirish (Variable Interpolation):** Qiymat sifatida shunchaki statik matn yozish o'rniga, boshqa o'zgaruvchilarning qiymatlarini ham ishlata olasiz. 
    *   *Misol:* `Salom {ism}, buyurtmangiz tayyor!` deb yozsangiz, bot avtomatik ravishda `{ism}` o'rniga foydalanuvchining ismini qo'yib, yangi o'zgaruvchiga yozadi.
*   **Matematik hisob-kitoblar (Smart Math Engine):** O'zgaruvchi ustida turli matematik amallarni bajarish imkoniyati qo'shildi.
    *   *Misol (qiymatni oshirish):* `{ball} + 1` (foydalanuvchining ballariga 1 qo'shish).
    *   *Misol (chegirma hisoblash):* `({narx} * 0.9) - 5000` (narxni 10% ga kamaytirib, yana 5000 so'm ayirish).
    *   **Xavfsizlik:** Matematik dvigatel faqat raqamlar, qavslar va matematik amallardan (`+`, `-`, `*`, `/`, `.`) iborat xavfsiz ifodalarni hisoblaydi, bu tizim xavfsizligini ta'minlaydi.

---

## 12. O'zg. O'chirish (Delete Variable) bloki
Tizimdagi foydalanuvchi ma'lumotlaridan keraksiz o'zgaruvchilarni butunlay o'chirish / tozalash uchun mo'ljallangan blok.

### Imkoniyatlari:
*   **Guruhlab o'chirish (Batch Deletion):** Endi har bir o'zgaruvchini alohida blok orqali o'chirish shart emas! O'chiriladigan o'zgaruvchilarni shunchaki vergul bilan ajratib yozish orqali bitta blokda bir vaqtning o'zida bir nechta o'zgaruvchini tozalash imkoni mavjud.
    *   *Misol:* `session_id, user_name, temp_cart, has_discount` deb yozsangiz, bot foydalanuvchi ma'lumotlari ichidan ushbu to'rtta o'zgaruvchini bitta amalda o'chirib tashlaydi. Bu ssenariy diagrammasini sodda va toza saqlashga yordam beradi.

---

## 13. A/B Test (Split Traffic) bloki
Marketing va konversiyalarni sinash uchun foydalanuvchilarni tasodifiy ravishda ikki xil yo'nalishga — **Variant A** va **Variant B** tarmoqlariga ajratuvchi blok.

### Imkoniyatlari:
*   **Moslashuvchan taqsimot foizi (Custom Split Ratio Slider):** Oqimni faqat 50/50 emas, balki istalgan nisbatda (masalan, 80/20 yoki 90/10) taqsimlash mumkin. Buni sozlash uchun qulay slayder (range slider) o'rnatildi. Variant B foizi slayder asosida avtomatik ravishda hisoblab ko'rsatiladi.
    *   *Ishlatish:* Yangi ssenariyni sinab ko'rish uchun foydalanuvchilarning faqat 10% ini yangi oqimga (Variant A) va 90% ini eski oqimga (Variant B) yo'naltirishingiz mumkin.
*   **Guruhni o'zgaruvchiga yozish (Group Assignment Variable):** Foydalanuvchiga qaysi variant tayinlanganligini (A yoki B) o'zgaruvchiga saqlab qo'yish imkoniyati bor.
    *   *Nega bu muhim:* Ushbu o'zgaruvchini Google Sheets ga eksport qilib, qaysi variant ko'proq savdo yoki konversiya olib kelganini aniq tahlil qilish imkonini beradi.

---

## 14. JS Hisoblagich (JavaScript Calculator) bloki
Foydalanuvchi o'zgaruvchilari ustida JavaScript yordamida murakkab hisob-kitoblar va matnli amallarni bajarish uchun mo'ljallangan dasturlash bloki.

### Imkoniyatlari:
*   **O'zgaruvchilarni to'g'ridan-to'g'ri ishlatish (Local variables binding):** Kod yozishda o'zgaruvchilarga murojaat qilish uchun har safar `variables.price` deb yozish shart emas! Tizim mavjud barcha to'g'ri nomlangan o'zgaruvchilarni to'g'ridan-to'g'ri mahalliy o'zgaruvchi (local variable) sifatida kod ichiga olib kiradi.
    *   *Misol:* `price * 0.15` (soliq miqdorini hisoblash).
    *   *Misol:* `name.toUpperCase()` (ismni katta harflarga o'tkazish).
*   **Avtomatik tip o'zgarishi (Auto Number Parsing):** Agar o'zgaruvchi matn ko'rinishida saqlangan bo'lsa (masalan, `'100'`), matematik amallar xatosiz bajarilishi uchun tizim uni avtomatik tarzda haqiqiy songa (`number`) aylantiradi. Bu JavaScriptdagi mashhur `'100' + 5 = '1005'` xatoligini oldini olib, `105` natijasini beradi.
*   **Kutubxonalar yordamida hisoblash:** Tizim JavaScriptning standart kutubxonalarini to'liq qo'llab-quvvatlaydi.
    *   *Misol:* `Math.min(100, score)` yoki `Math.round(total)` yoki `Date.now()`.

---

## 15. HTTP So'rov (HTTP Request) bloki
Tashqi internet saytlariga yoki dasturiy tizimlarga (API) bog'lanib, bot orqali ma'lumot olish yoki yuborish uchun mo'ljallangan integratsiya bloki.

### Imkoniyatlari:
*   **Dinamik havola (URL) va ma'lumotlar:** So'rov yuboriladigan havolaning (URL) va yuboriladigan ma'lumotlarning (POST Body) ichiga o'zgaruvchilarni eslab qolingan nomlari bilan yozishingiz mumkin (masalan: `https://api.weather.com/v1?city={shahar}`). Bot yuborishdan oldin o'zgaruvchilarni avtomatik joylashtiradi.
*   **JSON ma'lumotlar yuborish (POST Request Body):** POST so'rovlari tanlanganda, yuboriladigan ma'lumotlar JSON formatida maxsus maydonda kiritiladi.
*   **Javobdan kerakli kalitni ajratib olish (JSON Path Selector):** Agar tashqi tizim JSON formatida murakkab ma'lumot qaytarsa (masalan: `{"temp": {"current": 25}}`), siz "Javobdan kerakli kalitni ajratib olish" maydoniga `temp.current` deb yozib, butun javob matni o'rniga faqat `25` raqamini ajratib olib, o'zgaruvchiga saqlashingiz mumkin. Bu hech qanday kod yozmasdan tashqi API lardan foydalanish imkonini beradi.

---

## 16. Webhook Jo'natish (Send Webhook) bloki
Mijozdan yig'ilgan barcha ma'lumotlarni bitta tugma bilan avtomatik ravishda Make.com, Zapier, Google Sheets yoki shaxsiy CRM tizimlariga jo'natish uchun xizmat qiluvchi qulay integratsiya bloki.

### Imkoniyatlari:
*   **Barcha ma'lumotlarni avtomatik eksport qilish:** POST so'rov turi tanlanganda, bot ushbu blokda foydalanuvchidan olingan barcha ma'lumotlarni (o'zgaruvchilar va Telegram ID raqamini) avtomatik ravishda JSON ko'rinishida yig'ib yuboradi. Foydalanuvchi ma'lumotlarni qo'lda terib o'tirishi shart emas.
*   **Dinamik havolalar (URL Interpolation):** Agar ma'lumotlarni URL manzilining o'zida yuborish kerak bo'lsa (GET so'rovi uchun), havolaga o'zgaruvchilarni qavslar ichida yozishingiz mumkin (masalan: `https://hook.make.com/xxx?name={ism}&phone={telefon}`). Bot ularni yuborishdan oldin to'g'ri qiymatlar bilan to'ldiradi.

---

## 17. Sheet: Yozish (Google Sheets Add Row) bloki
Mijozdan to'plangan buyurtmalar, so'rovnomalar yoki telefon raqamlarni avtomatik ravishda Google Jadvalga (Google Sheets) yangi qator qilib yozib borish bloki.

### Imkoniyatlari:
*   **Google Apps Script yordamida ishlash:** Google Apps Script orqali yaratilgan Web App havolasini kiritish orqali to'g'ridan-to'g'ri jadval bilan ishlaydi.
*   **POST (Avtomatik jo'natish):** POST usuli tanlanganda bot barcha foydalanuvchi ma'lumotlarini to'plam shaklida jadvalga yuboradi.
*   **GET (Tanlab yuborish):** Havola (URL) ichida o'zgaruvchilarni qavs ichida yozib yuborish imkoniyati bor (masalan: `.../exec?ism={ism}&telefon={telefon}`).

---

## 18. Sheet: O'qish (Google Sheets Read) bloki
Google Jadvaldan kerakli ma'lumotlarni (masalan: kunlik kurs, aksiya matni yoki chegirmalar ro'yxatini) bot o'zgaruvchisiga avtomatik yuklab olish bloki.

### Imkoniyatlari:
*   Jadval skripti qaytargan javob matnini ko'rsatilgan o'zgaruvchiga saqlaydi, so'ngra bu ma'lumotni bot xabarlarida mijozga ko'rsatish mumkin.

---

## 19. GetCourse Integratsiyasi bloki
Ta'lim maktabingizdagi mijozlar va buyurtmalarni to'g'ridan-to'g'ri GetCourse CRM platformasi bilan sinxronizatsiya qiluvchi professional integratsiya bloki.

### Imkoniyatlari:
*   **Mijozlarni ro'yxatga olish (Register User):** Bot orqali kelgan yangi mijozning ismi, telefoni va email manzilini GetCourse bazasiga avtomatik qo'shib beradi.
*   **Buyurtma yaratish (Create Deal):** Bot ichida tanlangan tarif yoki to'lov uchun GetCourse da yangi buyurtma ochib beradi.
*   **Moslashuvchan o'zgaruvchilar bog'lanishi (Custom Mapping):** Mijozning ismi, telefoni va email manzili qaysi o'zgaruvchilarda saqlanganini o'zingiz ko'rsatishingiz mumkin (masalan: `ism`, `telefon`, `email`).
*   **Tarif kodi (Offer Code):** GetCourse dagi taklif (offer) kodini yozishingiz mumkin. O'zgaruvchilarni ham qo'llab-quvvatlaydi (masalan: `{kurs_tarifi}`).

---

## 20. Yclients Integratsiyasi bloki
Go'zallik salonlari, tibbiyot klinikalari va sport klublari uchun mijozlar ro'yxatini to'g'ridan-to'g'ri Yclients CRM tizimiga yozib boruvchi integratsiya bloki.

### Imkoniyatlari:
*   **Mijoz kartasini ochish (Create Client Card):** Bot orqali buyurtma qilgan yoki ro'yxatdan o'tgan mijozlarni kompaniyangiz (saloningiz) bazasiga ism va telefon raqamlari bilan avtomatik ravishda yangi mijoz qilib qo'shadi.
*   **Kompaniya (Salon) ID boyicha bog'lanish:** Sizga tegishli Yclients salonining raqamini yozish orqali aniq kerakli salonga mijoz yuboriladi.
*   **Xavfsiz avtorizatsiya (Bearer Auth):** Hamkorlik kaliti (Partner Token) va shaxsiy kalit (User Token) orqali ma'lumotlarni xavfsiz uzatadi.

---

## 21. Payme (To'lov tizimi) bloki
Mijozlarga to'g'ridan-to'g'ri Telegram bot ichida Payme orqali to'lov hisob-fakturasini yuborish va xavfsiz to'lovlarni qabul qilish bloki.

### Imkoniyatlari:
*   **Xavfsiz va to'liq avtomatlashtirilgan to'lov (Native Payments):** Bot mijozga rasmiy Telegram to'lov xabarnomasini yuboradi. Mijoz kartasini kiritib to'lov qilgandan so'ng, Telegram buni botga tasdiqlaydi.
*   **To'lovni kutish tizimi (Wait for payment):** Mijoz to'lovni muvaffaqiyatli yakunlamaguncha, bot keyingi bloklarga o'tmaydi (bu firibgarlik yoki to'lov qilmasdan mahsulotga kirish olishni butunlay to'sadi). To'lov tugagach bot avtomatik ravishda keyingi xabarga o'tadi.
*   **Dinamik narxlar (Dynamic Price Variables):** Narx maydoniga statik raqamdan tashqari, bot ichida hisoblangan o'zgaruvchini ham yozish mumkin (Masalan: `Narxi` maydoniga `99000` o'rniga `{jami_narx}` deb yozsa bo'ladi).
*   **To'lov ma'lumotlarini eslab qolish:** To'lov muvaffaqiyatli yakunlanganda, bot avtomatik tarzda `last_payment_payload` (to'lov kodi) va `last_payment_amount` (to'lov summasi) o'zgaruvchilarini saqlab qo'yadi.

---

## 22. Click (To'lov tizimi) bloki
Mijozlarga to'g'ridan-to'g'ri Telegram bot ichida Click to'lov tizimi orqali to'lov hisob-fakturasini yuborish va xavfsiz to'lovlarni qabul qilish bloki.

### Imkoniyatlari:
*   **Xavfsiz to'lov (Telegram Click Integration):** Telegramning rasmiy to'lov tizimi yordamida to'lov fakturasini shakllantiradi.
*   **To'lov tasdiqlanishini kutish:** Bot to'lov yakunlanmaguncha keyingi bloklarga o'tishga yo'l qo'ymaydi. Mijoz to'lovni tasdiqlagandan so'ngгина bot avtomatik davom etadi.
*   **Dinamik narxlarni qo'llab-quvvatlash:** Narx sifatida oldingi bosqichlarda hisoblangan o'zgaruvchini ishlatish imkoni bor (Masalan: `{jami_summa}`).
*   **To'lov tafsilotlarini saqlash:** To'lovdan so'ng `last_payment_payload` (kod) va `last_payment_amount` (to'lov summasi) o'zgaruvchilari avtomatik yoziladi.

---

## 23. Bitim Bosqichi (CRM Deal Stage) bloki
Mazaika boshqaruv panelidagi Kanban jadvalida (mijozlar oqimi doskasida) foydalanuvchining turgan ustunini (bosqichini) bot orqali avtomatik ravishda o'zgartirish bloki.

### Imkoniyatlari:
*   **Real vaqtda Kanban doskasini yangilash (Real-time CRM Sync):** Mijoz botda ma'lum bir tugmani bosganida yoki to'lov qilganida, uning kartochkasi boshqaruv panelida avtomatik ravishda mos ustunga (masalan: "Jarayonda" yoki "Muvaffaqiyatli") ko'chib o'tadi. Bu admin uchun juda qulay.

---

## 24. Mas'ul Xodim (Assignee) bloki
Mijoz yozishmalarini boshqarish va unga javob berish mas'uliyatini bot orqali aniq bir admin / operator profiliga avtomatik topshirish bloki.

### Imkoniyatlari:
*   **Avtomatik mas'ul biriktirish:** Mijoz ushbu blokdan o'tishi bilan, Mazaika chatlar bo'limida uning yozishmalari belgilangan xodimga (masalan: `Azizbek`) avtomatik biriktiriladi.

---

## 25. Savat (Cart) bloki
Bot orqali tovarlar sotishni tashkil qilish uchun to'liq savat tizimi (mijoz tanlagan tovarlar ro'yxatini, narxlarini va sonini saqlash bloki).

### Imkoniyatlari:
*   **Har xil amallar:** Mahsulot qo'shish (Add), mahsulotni savatdan o'chirish (Remove) va savatni tozalash (Clear) amallarini bajaradi.
*   **Narx va miqdor nazorati:** Tovarni qo'shish vaqtida uning narxi va miqdorini (sonini) yozish mumkin. O'zgaruvchilarni ham qo'llab-quvvatlaydi (masalan: `{miqdori}`).
*   **Avtomatik hisob-kitob (Variables auto-update):** Savatga har gal mahsulot qo'shilganda bot quyidagi o'zgaruvchilarni avtomatik yangilaydi:
    *   `{cart_total}` — savatdagi tovarlarning umumiy summasi (bu qiymatni to'g'ridan-to'g'ri Payme/Click to'lov blokiga narx qilib ulash mumkin!).
    *   `{cart_items_count}` — savatdagi tovarlar umumiy soni.
    *   `{cart_text}` — chiroyli tarzda shakllantirilgan tovarlar ro'yxati matni. Xabarlarda ushbu o'zgaruvchini yozish orqali mijozga savatini chiroyli ko'rinishda ko'rsatish mumkin.

---

## 26. Teg Qo'shish (Add Tag) bloki
Mijozlarning turgan bosqichi, qiziqishi yoki toifasini belgilash uchun ularning profiliga Mazaika tizimida teg (yorliq/kategoriya) yopishtirish bloki.

### Imkoniyatlari:
*   **Real vaqtda teglash (Real-time CRM Tagging):** Mijoz botda ma'lum bir amalni bajarganida (masalan: tugma bossa, savolga javob bersa), uning profili Mazaika CRM bazasida avtomatik ravishda belgilangan teg (yorliq) bilan belgilanadi.
*   **Mijozlar segmentatsiyasi:** CRM panelida mijozlarni ushbu teglar orqali osongina filtrlash, segmentlarga ajratish va maqsadli guruhlarga xabarlar yuborish (rassilka) mumkin.

---

## 27. Teg O'chirish (Remove Tag) bloki
Mijoz o'z holatini o'zgartirganda (masalan: yangi mijozdan doimiy mijozga aylanganida), uning profilidan keraksiz teglarni avtomatik tarzda olib tashlash bloki.

### Imkoniyatlari:
*   **Eski teglarni tozalash:** Profilni toza va tartibli saqlash uchun keraksiz belgilarni olib tashlaydi.

---

## 28. Balans: Qo'shish (Top Up Balance) bloki
Foydalanuvchining bot ichidagi shaxsiy virtual hamyoniga sodiqlik bonuslari, keshbek yoki ballarni avtomatik tarzda qo'shib borish bloki.

### Imkoniyatlari:
*   **Virtual hamyon va sodiqlik dasturi:** Har bir mijoz uchun alohida virtual hamyon yaratib beradi. Tizimda uning balansi saqlanib boradi.
*   **Dinamik to'ldirish (Dynamic variables):** To'ldiriladigan summani statik raqamda yozish yoki oldingi bosqichlarda hisoblangan o'zgaruvchi orqali berish mumkin (Masalan: `{bonus_ballar}`).
*   **Real vaqtda CRM bilan sinxronizatsiya:** Ballar qo'shilishi bilan, Mazaika boshqaruv panelidagi mijoz kartochkasida uning balansi darhol yangilanib ko'rinadi.

---

## 29. Balans: Yechish (Debit Balance) bloki
Chegirmalar berish yoki sotib olingan tovarlar uchun to'lov qilishda foydalanuvchining shaxsiy virtual balansidan ballar/mablag'larni yechib olish bloki.

### Imkoniyatlari:
*   **Ballarni yechish va to'lov:** Balansdan hisob-kitob qilib mablag'larni yechadi (balans 0 dan pastga tushib ketmaydi).

---

## 30. User O'chirish (Ma'lumotlarni tozalash / O'chirish) bloki
Foydalanuvchining bot xotirasidagi ma'lumotlarini tozalash yoki uni Mazaika CRM bazasidan butunlay o'chirib tashlash bloki.

### Imkoniyatlari:
*   **Faqat bot xotirasini tozalash (Wipe variables):** Mijozning bot ichida to'plangan barcha javoblari (o'zgaruvchilari) va savati o'chiriladi. Uning balansini `0` ga, bosqichini esa boshlang'ich `Yangi` holatiga qaytaradi. Mijoz CRM ro'yxatida saqlanib qoladi.
*   **Mijozni CRM dan butunlay o'chirish (Delete Contact):** Mijoz profilini, u bilan bo'lgan barcha chat yozishmalarini va ma'lumotlarni bazadan butunlay o'chiradi. Bu ma'lumotlar xavfsizligini ta'minlash yoki test jarayonida mijozlarni tozalash uchun juda asqotadi.

---

## 31. Ovoz: Qo'shilish (Voter Register) bloki
Bot orqali tanlovlar, so'rovnomalar va ovoz berish tadbirlarini tashkil qilish bloki.

### Imkoniyatlari:
*   **Ovoz berish xavfsizligi (No double voting):** Har bir Telegram foydalanuvchisi faqat bir marta ovoz bera oladi. Bot takroriy ovoz berish (nakrutka) harakatlarini avtomatik ravishda to'sadi.
*   **Dinamik nomzodlar:** Ovoz berilayotgan nomzod nomi sifatida o'zgaruvchilarni ham yozish mumkin (Masalan: `{tanlangan_loyiha}`).
*   **Xavfsiz hisob-kitob (Firestore Transactions):** Ko'p foydalanuvchi bir vaqtda ovoz berganida ham, tranzaksiyalar yordamida ovozlar soni bazada xatolarsiz to'g'ri qo'shib boriladi.

---

## 32. Ovoz: Reyting (Vote Leaders) bloki
Ovoz berish natijalarini real vaqtda saralangan holda eng ko'p ovoz olgandan kamiga qarab ko'rsatuvchi yetakchilar doskasi (Leaderboard) bloki.

### Imkoniyatlari:
*   **Jonli natijalar (Real-time Leaderboard):** Firestore ma'lumotlar bazasidan real vaqtda joriy ovoz berish holatini tortib, chiroyli reyting ko'rinishida taqdim etadi.

---

## 33. Mazaika Unified Builder (Birlashgan Blok Konstruktori)
Mazaika platformasida Telegram Mini Ilova (WebApp) va jamoat veb-saytlarini yagona Google Sites kabi bloklar tizimi orqali vizual yaratish.

### Imkoniyatlari:
*   **Yagona dizayn (Unified Config):** Konstruktorda yaratilgan barcha bloklar (Banner, Katalog, Maqolalar, Kontaktlar, Formalar, Balans hamyoni va Ovoz berish) ham brauzer saytida, ham Telegram Mini App interfeysida bir xil ko'rinishda ishlaydi.
*   **Bloklarni tartiblash (Drag & Reorder):** Google Sites kabi bloklarni sichqoncha yordamida yoki ko'rsatgichlar (Yuqoriga/Pastga) orqali osongina tartibga solish, o'chirish va yangilarini qo'shish imkoniyati.
*   **Haqiqiy funksiyalar (Real-world Features):**
    *   *Katalog (Internet do'kon / Kafe):* Tovarlarni savatga qo'shib, to'g'ridan-to'g'ri Telegram botiga buyurtma yuborish.
    *   *So'rovnomalar (Feedback Forms):* Dinamik maydonlar yaratib, mijozlar yuborgan javoblarni botga uzatish.
    *   *Hamyon widgeti (Loyalty Widget):* Mijozning botdagi joriy virtual balansini (`{balance}`) real vaqtda ekranda ko'rsatish.
    *   *Ovoz berish blocki (Voting widget):* Mini App ichida real vaqt rejimida tranzaksiyalar bilan ovoz qabul qilish va takroriy ovoz berishdan himoyalash.

---

## 34. WebApp va Bot Sinxronizatsiyasi (Flow Automation)
Telegram Mini App (WebApp) ichidagi harakatlar yakunlanganda (buyurtma berilganda yoki forma to'ldirilganda) bot stsenariysi va CRM tizimining avtomatik yangilanishi va davom etishi.

### Imkoniyatlari:
*   **CRM Deal Transitions (Kelishuv bosqichlari):** 
    *   Mijoz savat orqali buyurtma yuborganida, uning CRM bosqichi avtomatik ravishda `Kelishuv` holatiga o'tadi.
    *   Mijoz ma'lumot formasini to'ldirib yuborganida, uning CRM bosqichi `Muloqot` holatiga o'tkaziladi.
*   **O'zgaruvchilarni sinxronlash (Variables Sync):** WebApp orqali kiritilgan barcha ma'lumotlar (buyurtma ro'yxati, jami summa, forma maydonlarining javoblari) foydalanuvchining bot o'zgaruvchilariga (variables) saqlanadi. Keyingi bloklarda bu o'zgaruvchilarni `{ismingiz}`, `{last_order_total}` kabi ishlatish mumkin.
*   **Stsenariyning davom etishi (Resume Workflow):** WebApp yopilishi bilan bot foydalanuvchini stsenariy bo'yicha keyingi ulangan blokga avtomatik ravishda o'tkazadi va suhbatni davom ettiradi.



























