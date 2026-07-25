import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

type Language = 'UZ' | 'RU' | 'EN'

const TRANSLATIONS = {
  UZ: {
    navFeatures: 'Imkoniyatlar',
    navBlocks: 'Bloklar',
    navPricing: 'Narxlar',
    navLogin: 'Kirish',
    navStart: 'Boshlash →',
    heroBadge: '🇺🇿 O\'zbekiston uchun yaratilgan',
    heroTitleLine1: 'Telegram botlarni',
    heroTitleLine2: 'kabi quring',
    heroDesc: "Bloklarni tortib ulang — professional bot tayyor. Kod yozmasdan, dasturchi yollasdan. O'zbek biznes uchun ishlangan platforma.",
    heroCtaFree: 'Bepul boshlash →',
    heroCtaDemo: 'Demoni ko\'rish',
    statBlocks: 'Blok turlari',
    statLangs: 'Til',
    statCode: 'Kod shart emas',
    featBadge: '✨ Imkoniyatlar',
    featTitleLine1: 'Boshqa platformalardan',
    featTitleLine2: 'farqi bor',
    featDesc: "Mazaika — faqat o'zbek bozori uchun o'ylangan, mahalliy to'lov tizimlari bilan birlashtirilgan",
    blockBadge: '🧩 50+ blok',
    blockTitleLine1: 'Har bir holat uchun',
    blockTitleLine2: 'to\'g\'ri blok',
    blockDesc: "Xabardan tortib to'lovgacha — hamma narsa tayyor bloklarda",
    priceBadge: '💰 Narxlar',
    priceTitleLine1: 'Sodda va',
    priceTitleLine2: 'shaffof',
    priceTitleLine3: 'narxlar',
    priceDesc: "Yashirin to'lovlar yo'q. Biznes o'sishi bilan tarif almashtirasiz.",
    ctaTitleLine1: 'Botingizni',
    ctaTitleLine2: 'bugun',
    ctaTitleLine3: 'yarating',
    ctaDesc: "Ro'yxatdan o'tish 30 soniya davom etadi. Kredit karta shart emas.",
    ctaBtn: 'Bepul boshlash — 0 so\'m →',
    footerTerms: 'Shartlar',
    footerPrivacy: 'Maxfiylik',
    footerHelp: 'Yordam',
    footerCopy: '© 2026 Mazaika. O\'zbekiston uchun yaratilgan 🇺🇿',
    features: [
      {
        icon: '🧩',
        title: 'Vizual konstruktor',
        desc: "Bloklarni suring va ulang — kod bilmasdan professional bot yarating. Mazaika — bu botlarni qurishning eng qulay usuli.",
      },
      {
        icon: '⚡',
        title: 'Real-time ishlaydi',
        desc: "Sxemani saqlashingiz bilan bot darhol yangi mantiq bo'yicha ishlaydi. Serverlarni qayta yuklashning hojati yo'q.",
      },
      {
        icon: '🤖',
        title: 'AI Yordamchi',
        desc: "AI yordamchimiz sizning so'rovlaringiz bo'yicha botlar va saytlar yaratishga yordam beradi.",
      },
      {
        icon: '📊',
        title: 'Kuchli analitika',
        desc: "Har bir foydalanuvchining yo'lini ko'ring. Qaysi blokda to'xtab qolishini, qaysi tugmani bosishini bilib oling.",
      },
      {
        icon: '💳',
        title: "O'zbek to'lovlari",
        desc: "Payme, Click, Uzum to'lov tizimlari bilan integratsiya. Interfeys o'zbek tilida — biznes tilida gaplashing.",
      },
      {
        icon: '🔗',
        title: 'Kuchli integratsiyalar',
        desc: "Google Jadval, HTTP so'rovlar, Webhook, JavaScript interpreter — botingizni istalgan tizim bilan ulang.",
      },
    ],
    plans: [
      {
        name: "Boshlang'ich",
        price: "Bepul",
        period: "",
        popular: false,
        features: ["1 ta bot", "500 ta kontakt", "Asosiy bloklar", "Telegram integratsiya"],
        btn: "Bepul boshlash"
      },
      {
        name: "Biznes",
        price: "99 000 so'm",
        period: " / oy",
        popular: true,
        features: ["10 ta bot", "10 000 ta kontakt", "Barcha bloklar", "To'lov tizimlari", "API integratsiya", "Analitika"],
        btn: "Tanlash →"
      },
      {
        name: "Pro",
        price: "299 000 so'm",
        period: " / oy",
        popular: false,
        features: ["Cheksiz bot", "Cheksiz kontakt", "Ustuvor qo'llab-quvvatlash", "White-label", "Maxsus integratsiyalar"],
        btn: "Tanlash →"
      }
    ]
  },
  RU: {
    navFeatures: 'Возможности',
    navBlocks: 'Блоки',
    navPricing: 'Цены',
    navLogin: 'Войти',
    navStart: 'Начать →',
    heroBadge: '🇺🇿 Создано для Узбекистана',
    heroTitleLine1: 'Создавайте ботов',
    heroTitleLine2: 'как',
    heroDesc: "Перетаскивайте блоки — профессиональный бот готов. Без написания кода, без найма программиста.",
    heroCtaFree: 'Начать бесплатно →',
    heroCtaDemo: 'Смотреть демо',
    statBlocks: 'Типов блоков',
    statLangs: 'Языков',
    statCode: 'Без кода',
    featBadge: '✨ Возможности',
    featTitleLine1: 'Отличие от других',
    featTitleLine2: 'платформ',
    featDesc: "Mazaika — создана специально для рынка Узбекистана с поддержкой локальных платежных систем",
    blockBadge: '🧩 50+ блоков',
    blockTitleLine1: 'Правильный блок',
    blockTitleLine2: 'для любой задачи',
    blockDesc: "От сообщений до оплат — все в готовых блоках",
    priceBadge: '💰 Цены',
    priceTitleLine1: 'Простые и',
    priceTitleLine2: 'прозрачные',
    priceTitleLine3: 'цены',
    priceDesc: "Никаких скрытых платежей. Меняйте тариф по мере роста бизнеса.",
    ctaTitleLine1: 'Создайте своего бота',
    ctaTitleLine2: 'прямо сейчас',
    ctaTitleLine3: '',
    ctaDesc: "Регистрация занимает 30 секунд. Кредитная карта не нужна.",
    ctaBtn: 'Начать бесплатно — 0 сум →',
    footerTerms: 'Условия',
    footerPrivacy: 'Конфиденциальность',
    footerHelp: 'Помощь',
    footerCopy: '© 2026 Mazaika. Создано для Узбекистана 🇺🇿',
    features: [
      {
        icon: '🧩',
        title: 'Визуальный конструктор',
        desc: "Перетаскивайте и соединяйте блоки — создавайте ботов без кода. Mazaika — самый удобный способ создания ботов.",
      },
      {
        icon: '⚡',
        title: 'Работает в реальном времени',
        desc: "Как только вы сохраняете схему, бот сразу начинает работать по новой логике. Не нужно перезагружать серверы.",
      },
      {
        icon: '🤖',
        title: 'AI Ассистент',
        desc: "Наш AI-помощник поможет вам создавать ботов и сайты просто по текстовому описанию или фото.",
      },
      {
        icon: '📊',
        title: 'Мощная аналитика',
        desc: "Отслеживайте путь каждого пользователя. Узнайте, на каком блоке они останавливаются и какие кнопки нажимают.",
      },
      {
        icon: '💳',
        title: "Платежи Узбекистана",
        desc: "Интеграция с Payme, Click, Uzum. Интерфейс на узбекском языке — общайтесь на языке бизнеса.",
      },
      {
        icon: '🔗',
        title: 'Мощные интеграции',
        desc: "Google Таблицы, HTTP-запросы, Webhook, интерпретатор JavaScript — свяжите вашего бота с любой системой.",
      },
    ],
    plans: [
      {
        name: "Начальный",
        price: "Бесплатно",
        period: "",
        popular: false,
        features: ["1 бот", "500 контактов", "Базовые блоки", "Интеграция Telegram"],
        btn: "Начать бесплатно"
      },
      {
        name: "Бизнес",
        price: "99 000 сум",
        period: " / мес",
        popular: true,
        features: ["10 ботов", "10 000 контактов", "Все блоки", "Платежные системы", "Интеграция API", "Аналитика"],
        btn: "Выбрать →"
      },
      {
        name: "Про",
        price: "299 000 сум",
        period: " / мес",
        popular: false,
        features: ["Безлимитные боты", "Безлимитные контакты", "Приоритетная поддержка", "White-label", "Пользовательские интеграции"],
        btn: "Выбрать →"
      }
    ]
  },
  EN: {
    navFeatures: 'Features',
    navBlocks: 'Blocks',
    navPricing: 'Pricing',
    navLogin: 'Login',
    navStart: 'Start →',
    heroBadge: '🇺🇿 Built for Uzbekistan',
    heroTitleLine1: 'Build Telegram bots like',
    heroTitleLine2: 'with Mazaika',
    heroDesc: "Drag and drop blocks — your professional bot is ready. No coding, no hiring developers.",
    heroCtaFree: 'Start for free →',
    heroCtaDemo: 'Watch Demo',
    statBlocks: 'Block Types',
    statLangs: 'Languages',
    statCode: 'No Code required',
    featBadge: '✨ Features',
    featTitleLine1: 'What makes us',
    featTitleLine2: 'different',
    featDesc: "Mazaika — built specifically for the local market, integrated with local payment systems",
    blockBadge: '🧩 50+ blocks',
    blockTitleLine1: 'The right block',
    blockTitleLine2: 'for every case',
    blockDesc: "From messages to payments — everything is available as ready blocks",
    priceBadge: '💰 Pricing',
    priceTitleLine1: 'Simple and',
    priceTitleLine2: 'transparent',
    priceTitleLine3: 'pricing',
    priceDesc: "No hidden fees. Upgrade your plan as your business grows.",
    ctaTitleLine1: 'Build your bot',
    ctaTitleLine2: 'today',
    ctaTitleLine3: '',
    ctaDesc: "Registration takes 30 seconds. No credit card required.",
    ctaBtn: 'Start for free — $0 →',
    footerTerms: 'Terms',
    footerPrivacy: 'Privacy',
    footerHelp: 'Help',
    footerCopy: '© 2026 Mazaika. Built for Uzbekistan 🇺🇿',
    features: [
      {
        icon: '🧩',
        title: 'Visual builder',
        desc: "Drag and connect blocks — create professional bots without coding. Mazaika is the most convenient way to build bots.",
      },
      {
        icon: '⚡',
        title: 'Real-time sync',
        desc: "As soon as you save the flow, the bot immediately works according to the new logic. No need to reload servers.",
      },
      {
        icon: '🤖',
        title: 'AI Assistant',
        desc: "Our AI assistant helps you create bots and websites based on your requests or even image references.",
      },
      {
        icon: '📊',
        title: 'Powerful analytics',
        desc: "See the path of every user. Find out which block they stop at and which buttons they press.",
      },
      {
        icon: '💳',
        title: "Uzbek Payments",
        desc: "Integration with Payme, Click, Uzum payment systems. Interface in local languages.",
      },
      {
        icon: '🔗',
        title: 'Powerful integrations',
        desc: "Google Sheets, HTTP requests, Webhook, JavaScript interpreter — connect your bot to any system.",
      },
    ],
    plans: [
      {
        name: "Starter",
        price: "Free",
        period: "",
        popular: false,
        features: ["1 bot", "500 contacts", "Basic blocks", "Telegram integration"],
        btn: "Start for free"
      },
      {
        name: "Business",
        price: "99,000 UZS",
        period: " / mo",
        popular: true,
        features: ["10 bots", "10,000 contacts", "All blocks", "Payment systems", "API integration", "Analytics"],
        btn: "Select →"
      },
      {
        name: "Pro",
        price: "299,000 UZS",
        period: " / mo",
        popular: false,
        features: ["Unlimited bots", "Unlimited contacts", "Priority support", "White-label", "Custom integrations"],
        btn: "Select →"
      }
    ]
  }
}

const BLOCK_TYPES = [
  { name: 'Start', color: '#10d974', emoji: '▶' },
  { name: 'Message', color: '#1e90ff', emoji: '💬' },
  { name: 'AI Reply', color: '#a855f7', emoji: '🧠' },
  { name: 'Condition', color: '#ffb830', emoji: '🔀' },
  { name: 'Delay', color: '#64748b', emoji: '⏱' },
  { name: 'Payment', color: '#10d974', emoji: '💳' },
  { name: 'HTTP', color: '#06b6d4', emoji: '🌐' },
  { name: 'Google Sheet', color: '#34a853', emoji: '📊' },
  { name: 'Webhook', color: '#f97316', emoji: '🔗' },
  { name: 'Stars', color: '#fbbf24', emoji: '⭐' },
  { name: 'Video', color: '#6366f1', emoji: '🎬' },
  { name: 'Poll', color: '#f97316', emoji: '📊' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('mazaika_lang') as Language) || 'UZ'
  })

  const t = TRANSLATIONS[lang]

  useEffect(() => {
    localStorage.setItem('mazaika_lang', lang)
  }, [lang])

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    }, { threshold: 0.1 })

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="landing-premium">
      {/* Background Effects */}
      <div className="bg-effects">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
      </div>

      <div className="landing-grid-bg"></div>

      {/* ===== NAVBAR ===== */}
      <nav className="landing-nav-premium">
        <div className="nav-container">
          <div className="nav-logo">
            <div className="nav-logo-icon">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <rect x="2" y="2" width="10" height="10" rx="3" fill="#1e90ff"/>
                <rect x="16" y="2" width="10" height="10" rx="3" fill="#00f5c4" opacity="0.8"/>
                <rect x="2" y="16" width="10" height="10" rx="3" fill="#00f5c4" opacity="0.8"/>
                <rect x="16" y="16" width="10" height="10" rx="3" fill="#1e90ff" opacity="0.5"/>
              </svg>
            </div>
            <span className="nav-logo-text">Mazaika</span>
          </div>
          <div className="nav-links">
            <a href="#features">{t.navFeatures}</a>
            <a href="#blocks">{t.navBlocks}</a>
            <a href="#pricing">{t.navPricing}</a>
          </div>
          <div className="nav-actions">
            <div className="lang-switcher">
              {(['UZ', 'RU', 'EN'] as Language[]).map(l => (
                <button
                  key={l}
                  className={`lang-btn ${lang === l ? 'active' : ''}`}
                  onClick={() => setLang(l)}
                >
                  {l}
                </button>
              ))}
            </div>
            <button className="btn-login" onClick={() => navigate('/login')}>{t.navLogin}</button>
            <button className="btn-primary-neon" onClick={() => navigate('/register')}>{t.navStart}</button>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="hero-premium">
        <div className="hero-content">
          <div className="hero-badge animate-fade-in-up">
            <span className="badge-text">{t.heroBadge}</span>
          </div>
          <h1 className="hero-title animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {t.heroTitleLine1}<br />
            <span className="gradient-text-neon">Mazaika</span> {t.heroTitleLine2}
          </h1>
          <p className="hero-desc animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {t.heroDesc}
          </p>
          <div className="hero-cta animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <button className="btn-primary-neon large" onClick={() => navigate('/register')}>
              {t.heroCtaFree}
            </button>
            <button className="btn-secondary-glass large" onClick={() => navigate('/dashboard')}>
              {t.heroCtaDemo}
            </button>
          </div>
          
          <div className="hero-stats animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="stat-item">
              <span className="stat-num">50+</span>
              <span className="stat-label">{t.statBlocks}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-num">3</span>
              <span className="stat-label">{t.statLangs}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-num">0</span>
              <span className="stat-label">{t.statCode}</span>
            </div>
          </div>
        </div>

        {/* 3D Flow Preview */}
        <div className="hero-3d-wrapper animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="hero-3d-scene">
            <div className="node-3d node-start">
              <div className="node-icon" style={{ background: '#10d97422', color: '#10d974' }}>▶</div>
              <span>Start</span>
            </div>
            <div className="node-3d node-msg">
              <div className="node-icon" style={{ background: '#1e90ff22', color: '#1e90ff' }}>💬</div>
              <span>Welcome</span>
            </div>
            <div className="node-3d node-ai">
              <div className="node-icon" style={{ background: '#a855f722', color: '#a855f7' }}>🧠</div>
              <span>AI Agent</span>
            </div>
            <div className="node-3d node-pay">
              <div className="node-icon" style={{ background: '#fbbf2422', color: '#fbbf24' }}>⭐</div>
              <span>Stars Pay</span>
            </div>
            
            {/* Glowing Connections */}
            <svg className="connections-3d" viewBox="0 0 600 400">
              <path d="M 150 100 C 200 100 200 150 250 150" className="path-glow" stroke="#1e90ff" />
              <path d="M 350 150 C 400 150 350 80 420 80" className="path-glow" stroke="#a855f7" />
              <path d="M 350 150 C 400 150 350 220 420 220" className="path-glow" stroke="#fbbf24" />
            </svg>
          </div>
        </div>
      </section>

      {/* ===== BLOCK TYPES MARQUEE ===== */}
      <section className="marquee-premium">
        <div className="marquee-track">
          {[...BLOCK_TYPES, ...BLOCK_TYPES, ...BLOCK_TYPES].map((b, i) => (
            <div key={i} className="marquee-chip-premium" style={{ '--color': b.color } as any}>
              <div className="marquee-icon">{b.emoji}</div>
              <span className="marquee-text">{b.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="features-premium" id="features">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <div className="badge-glow">{t.featBadge}</div>
            <h2>{t.featTitleLine1} <span className="gradient-text-neon">{t.featTitleLine2}</span></h2>
            <p>{t.featDesc}</p>
          </div>
          
          <div className="features-grid">
            {t.features.map((f, i) => (
              <div key={i} className="feature-card-premium animate-on-scroll" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="feature-icon-wrapper">
                  <span className="feature-emoji">{f.icon}</span>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <div className="card-border-gradient"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="pricing-premium" id="pricing">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <div className="badge-glow">💰 {t.priceBadge.replace('💰 ', '')}</div>
            <h2>{t.priceTitleLine1} <span className="gradient-text-neon">{t.priceTitleLine2}</span> {t.priceTitleLine3}</h2>
            <p>{t.priceDesc}</p>
          </div>

          <div className="pricing-cards">
            {t.plans.map((plan, i) => (
              <div key={i} className={`price-card ${plan.popular ? 'popular' : ''} animate-on-scroll`} style={{ transitionDelay: `${i * 100}ms` }}>
                {plan.popular && <div className="popular-tag">Eng mashhur</div>}
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  <span className="amount">{plan.price}</span>
                  <span className="period">{plan.period}</span>
                </div>
                <ul className="plan-features">
                  {plan.features.map((feat, fi) => (
                    <li key={fi}>
                      <span className="check">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <button 
                  className={plan.popular ? 'btn-primary-neon w-full' : 'btn-secondary-glass w-full'}
                  onClick={() => navigate('/register')}
                >
                  {plan.btn}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-premium animate-on-scroll">
        <div className="cta-container">
          <div className="cta-glow-bg"></div>
          <h2>{t.ctaTitleLine1} <span className="gradient-text-neon">{t.ctaTitleLine2}</span> {t.ctaTitleLine3}</h2>
          <p>{t.ctaDesc}</p>
          <button className="btn-primary-neon giant" onClick={() => navigate('/register')}>
            {t.ctaBtn}
          </button>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer-premium">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <rect x="2" y="2" width="10" height="10" rx="3" fill="#1e90ff"/>
                <rect x="16" y="2" width="10" height="10" rx="3" fill="#00f5c4" opacity="0.8"/>
                <rect x="2" y="16" width="10" height="10" rx="3" fill="#00f5c4" opacity="0.8"/>
                <rect x="16" y="16" width="10" height="10" rx="3" fill="#1e90ff" opacity="0.5"/>
              </svg>
              <span>Mazaika</span>
            </div>
            <div className="footer-links">
              <a href="#">{t.footerTerms}</a>
              <a href="#">{t.footerPrivacy}</a>
              <a href="#">{t.footerHelp}</a>
            </div>
          </div>
          <div className="footer-bottom">
            {t.footerCopy}
          </div>
        </div>
      </footer>
    </div>
  )
}
