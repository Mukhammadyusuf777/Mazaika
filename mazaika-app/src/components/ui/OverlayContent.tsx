import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, Check } from 'lucide-react';

// ─── Translations ─────────────────────────────────────────────────────────────
const T = {
  UZ: {
    heroBadge: "🇺🇿 O'zbekiston uchun yaratilgan",
    heroTitle1: 'Telegram botlarni',
    heroHighlight: 'Lego kabi',
    heroTitle2: 'quring',
    heroDesc: "Bloklarni tortib ulang — professional bot tayyor. Kod yozmasdan, dasturchi yollasdan. O'zbek biznes uchun ishlangan platforma.",
    heroCta: 'Bepul boshlash →',
    heroDemo: "Demoni ko'rish",
    stat1: '50+', stat1L: 'Blok turlari',
    stat2: '3', stat2L: 'Til',
    stat3: '0', stat3L: 'Kod shart emas',
    featBadge: '✨ Imkoniyatlar',
    featTitle1: 'Boshqa platformalardan',
    featTitle2: 'farqi bor',
    featDesc: "Mazaika — faqat o'zbek bozori uchun o'ylangan, mahalliy to'lov tizimlari bilan birlashtirilgan",
    features: [
      { icon: '🧩', title: 'Vizual konstruktor', desc: "Bloklarni suring va ulang — kod bilmasdan professional bot yarating. Mazaika — bu botlarni qurishning eng qulay usuli." },
      { icon: '⚡', title: 'Real-time ishlaydi', desc: "Sxemani saqlashingiz bilan bot darhol yangi mantiq bo'yicha ishlaydi. Serverlarni qayta yuklashning hojati yo'q." },
      { icon: '🤖', title: 'AI Yordamchi', desc: "AI yordamchimiz sizning so'rovlaringiz bo'yicha botlar va saytlar yaratishga yordam beradi." },
      { icon: '📊', title: 'Kuchli analitika', desc: "Har bir foydalanuvchining yo'lini ko'ring. Qaysi blokda to'xtab qolishini bilib oling." },
      { icon: '💳', title: "O'zbek to'lovlari", desc: "Payme, Click, Uzum to'lov tizimlari bilan integratsiya. Interfeys o'zbek tilida." },
      { icon: '🔗', title: 'Kuchli integratsiyalar', desc: "Google Jadval, HTTP so'rovlar, Webhook, JavaScript — botingizni istalgan tizim bilan ulang." },
    ],
    priceBadge: '💰 Narxlar',
    priceTitle: 'Sodda va shaffof narxlar',
    priceDesc: "Yashirin to'lovlar yo'q. Biznes o'sishi bilan tarif almashtirasiz.",
    plans: [
      { name: "Boshlang'ich", price: "Bepul", period: "", popular: false, desc: "Sinab ko'rish uchun ideal", features: ["1 ta bot", "500 ta kontakt", "Asosiy bloklar", "Telegram integratsiya", "Drag & drop editor", "Mazaika hamjamiyati"], btn: "Bepul boshlash" },
      { name: "Pro", price: "149 000 so'm", period: " / oy", popular: false, desc: "O'sayotgan biznes uchun", features: ["5 ta bot", "5 000 ta kontakt", "Barcha 50+ bloklar", "Payme & Click to'lovlari", "API & Webhook", "Analitika dashboard", "Mini App", "Email qo'llab-quvvatlash"], btn: "Tanlash →" },
      { name: "Biznes", price: "249 000 so'm", period: " / oy", popular: true, desc: "Jiddiy biznes uchun to'liq paket", features: ["20 ta bot", "50 000 ta kontakt", "Barcha Pro imkoniyatlar", "Mazaika AI Architect", "White-label brending", "Google Sheets", "Ustuvor 24/7 qo'llab-quvvatlash", "Bot klonlash"], btn: "Tanlash →" },
    ],
    ctaTitle1: 'Botingizni', ctaTitle2: 'bugun', ctaTitle3: 'yarating',
    ctaDesc: "Ro'yxatdan o'tish 30 soniya davom etadi. Kredit karta shart emas.",
    ctaBtn: "Bepul boshlash — 0 so'm →",
    footerCopy: "© 2026 Mazaika. O'zbekiston uchun yaratilgan 🇺🇿",
  },
  RU: {
    heroBadge: '🇺🇿 Создано для Узбекистана',
    heroTitle1: 'Создавайте ботов',
    heroHighlight: 'как Lego',
    heroTitle2: '',
    heroDesc: "Перетаскивайте блоки — профессиональный бот готов. Без написания кода, без найма программиста.",
    heroCta: 'Начать бесплатно →',
    heroDemo: 'Смотреть демо',
    stat1: '50+', stat1L: 'Типов блоков',
    stat2: '3', stat2L: 'Языков',
    stat3: '0', stat3L: 'Без кода',
    featBadge: '✨ Возможности',
    featTitle1: 'Отличие от других',
    featTitle2: 'платформ',
    featDesc: "Mazaika — создана специально для рынка Узбекистана с поддержкой локальных платёжных систем",
    features: [
      { icon: '🧩', title: 'Визуальный конструктор', desc: "Перетаскивайте и соединяйте блоки — создавайте ботов без кода." },
      { icon: '⚡', title: 'Работает в реальном времени', desc: "Как только вы сохраняете схему, бот сразу начинает работать по новой логике." },
      { icon: '🤖', title: 'AI Помощник', desc: "Наш AI помощник поможет создать ботов и сайты по вашим запросам." },
      { icon: '📊', title: 'Мощная аналитика', desc: "Видите путь каждого пользователя. Узнайте, где они останавливаются." },
      { icon: '💳', title: 'Узбекские платежи', desc: "Интеграция с Payme, Click, Uzum. Интерфейс на узбекском языке." },
      { icon: '🔗', title: 'Мощные интеграции', desc: "Google Таблицы, HTTP, Webhook, JavaScript — подключите к любой системе." },
    ],
    priceBadge: '💰 Цены',
    priceTitle: 'Простые и прозрачные цены',
    priceDesc: "Никаких скрытых платежей. Меняйте тариф по мере роста бизнеса.",
    plans: [
      { name: "Начальный", price: "Бесплатно", period: "", popular: false, desc: "Идеально для пробы", features: ["1 бот", "500 контактов", "Базовые блоки", "Интеграция Telegram", "Drag & drop редактор", "Сообщество Mazaika"], btn: "Начать бесплатно" },
      { name: "Pro", price: "149 000 сум", period: " / мес", popular: false, desc: "Для растущего бизнеса", features: ["5 ботов", "5 000 контактов", "Все 50+ блоков", "Payme & Click", "API & Webhook", "Дашборд аналитики", "Mini App", "Email поддержка"], btn: "Выбрать →" },
      { name: "Бизнес", price: "249 000 сум", period: " / мес", popular: true, desc: "Полный пакет для серьёзного бизнеса", features: ["20 ботов", "50 000 контактов", "Все Pro возможности", "Mazaika AI Architect", "White-label брендинг", "Google Sheets", "Приоритетная 24/7 поддержка", "Клонирование ботов"], btn: "Выбрать →" },
    ],
    ctaTitle1: 'Создайте своего бота', ctaTitle2: 'прямо сейчас', ctaTitle3: '',
    ctaDesc: "Регистрация занимает 30 секунд. Кредитная карта не нужна.",
    ctaBtn: "Начать бесплатно — 0 сум →",
    footerCopy: "© 2026 Mazaika. Создано для Узбекистана 🇺🇿",
  },
} as const;

type Lang = keyof typeof T;

export function OverlayContent() {
  const [lang, setLang] = useState<Lang>('UZ');
  const navigate = useNavigate();
  const t = T[lang];

  return (
    <div className="overlay-root">

      {/* ─── NAVBAR ─────────────────────────────────────────────── */}
      <nav className="lp-nav">
        <div className="lp-nav-logo">
          <div className="lp-nav-logo-icon">M</div>
          <span>Mazaika</span>
        </div>
        <div className="lp-nav-actions">
          <div className="lp-lang-switch">
            {(['UZ', 'RU'] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`lp-lang-btn${lang === l ? ' active' : ''}`}>{l}</button>
            ))}
          </div>
          <button onClick={() => navigate('/login')} className="lp-nav-login">Kirish / Войти</button>
          <button onClick={() => navigate('/register')} className="btn-primary">
            {t.heroCta}
          </button>
        </div>
      </nav>

      {/* ─── HERO ───────────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          {t.heroBadge}
        </div>
        <h1 className="hero-title">
          {t.heroTitle1}{' '}
          <span className="gradient-text">{t.heroHighlight}</span>
          {t.heroTitle2 && <>{' '}{t.heroTitle2}</>}
        </h1>
        <p className="hero-sub">{t.heroDesc}</p>
        <div className="hero-cta-row">
          <button onClick={() => navigate('/register')} className="btn-primary">
            {t.heroCta} <ArrowRight size={16} />
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-ghost">
            {t.heroDemo}
          </button>
        </div>
        {/* Stats */}
        <div className="hero-stats">
          {[
            { val: t.stat1, label: t.stat1L },
            { val: t.stat2, label: t.stat2L },
            { val: t.stat3, label: t.stat3L },
          ].map((s, i) => (
            <div key={i} className="hero-stat">
              <span className="hero-stat-val gradient-text">{s.val}</span>
              <span className="hero-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
        <p className="scroll-hint">↓ Scroll to explore</p>
      </section>

      {/* ─── FEATURES ───────────────────────────────────────────── */}
      <section className="feature-section feature-section--left" id="feature-0">
        <div className="feature-content">
          <div className="feature-badge" style={{ color: '#00f0ff', borderColor: '#00f0ff44', background: '#00f0ff11' }}>
            <Sparkles size={13} />
            <span>{t.featBadge}</span>
          </div>
          <h2 className="feature-heading">
            {t.featTitle1}<br />
            <span className="gradient-text">{t.featTitle2}</span>
          </h2>
          <p className="feature-sub">{t.featDesc}</p>
          <div className="features-grid-mini">
            {t.features.map((f, i) => (
              <div key={i} className="feature-mini-card">
                <span className="feature-mini-icon">{f.icon}</span>
                <div>
                  <div className="feature-mini-title">{f.title}</div>
                  <div className="feature-mini-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI ENGINE SECTION ──────────────────────────────────── */}
      <section className="feature-section feature-section--right" id="feature-1">
        <div className="feature-content">
          <div className="feature-badge" style={{ color: '#9d00ff', borderColor: '#9d00ff44', background: '#9d00ff11' }}>
            <Sparkles size={13} />
            <span>🤖 AI ENGINE</span>
          </div>
          <h2 className="feature-heading">
            {lang === 'UZ' ? "Bir so'zdan — to'liq bot va sayt" : 'Из одного слова — полный бот и сайт'}
          </h2>
          <p className="feature-sub">
            {lang === 'UZ'
              ? "Mazaika AI sizning so'rovingizni tahlil qilib, bot sxemasini, Telegram Mini App saytini va barcha ma'lumotlarni bir vaqtda yaratadi."
              : 'Mazaika AI анализирует ваш запрос и одновременно создаёт схему бота, Telegram Mini App и все данные.'}
          </p>
          <ul className="feature-checks">
            {[
              lang === 'UZ' ? 'Gemini AI bilan ishlaydi' : 'Работает на Gemini AI',
              lang === 'UZ' ? 'Patch-based kod tahrirlash' : 'Patch-based редактирование кода',
              lang === 'UZ' ? 'Multi-agent arxitektura' : 'Мультиагентная архитектура',
            ].map((c) => (
              <li key={c} style={{ color: '#9d00ff' }}>
                <CheckCircle2 size={15} />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── PRICING ────────────────────────────────────────────── */}
      <section className="feature-section feature-section--center" id="feature-2">
        <div className="pricing-block">
          <div className="feature-badge" style={{ color: '#00f0ff', borderColor: '#00f0ff44', background: '#00f0ff11', margin: '0 auto 20px' }}>
            <span>{t.priceBadge}</span>
          </div>
          <h2 className="feature-heading" style={{ textAlign: 'center', marginBottom: 8 }}>
            <span className="gradient-text">{t.priceTitle}</span>
          </h2>
          <p className="feature-sub" style={{ textAlign: 'center', marginBottom: 36 }}>{t.priceDesc}</p>
          <div className="pricing-grid">
            {t.plans.map((plan, i) => (
              <div key={i} className={`pricing-card${plan.popular ? ' pricing-card--popular' : ''}`}>
                {plan.popular && <div className="pricing-popular-badge">⭐ {lang === 'UZ' ? 'Eng mashhur' : 'Популярный'}</div>}
                <div className="pricing-name">{plan.name}</div>
                <div className="pricing-price">
                  {plan.price}
                  {plan.period && <span className="pricing-period">{plan.period}</span>}
                </div>
                <div className="pricing-desc">{plan.desc}</div>
                <ul className="pricing-features">
                  {plan.features.map((f) => (
                    <li key={f}>
                      <Check size={13} color="#00f0ff" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate('/register')} className={plan.popular ? 'btn-primary' : 'btn-ghost'} style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}>
                  {plan.btn}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ──────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="cta-inner">
          <div className="cta-glow" />
          <Sparkles className="cta-icon" size={40} />
          <h2 className="cta-heading">
            <span className="gradient-text">{t.ctaTitle1}</span>{' '}
            {t.ctaTitle2}{t.ctaTitle3 && <> {t.ctaTitle3}</>}
          </h2>
          <p className="cta-sub">{t.ctaDesc}</p>
          <button onClick={() => navigate('/register')} className="btn-primary btn-primary--large">
            {t.ctaBtn} <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <span className="lp-footer-logo">Mazaika</span>
          <span className="lp-footer-copy">{t.footerCopy}</span>
        </div>
      </footer>

    </div>
  );
}
