import { useNavigate } from 'react-router-dom'
import { Sparkles, Loader2, Bot, Zap } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import './LandingPage.css'

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
        price: "149 000 so'm",
        period: " / oy",
        popular: true,
        features: ["10 ta bot", "10 000 ta kontakt", "Barcha bloklar", "To'lov tizimlari", "API integratsiya", "Analitika"],
        btn: "Tanlash →"
      },
      {
        name: "Pro",
        price: "399 000 so'm",
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
        price: "149 000 сум",
        period: " / мес",
        popular: true,
        features: ["10 ботов", "10 000 контактов", "Все блоки", "Платежные системы", "Интеграция API", "Аналитика"],
        btn: "Выбрать →"
      },
      {
        name: "Про",
        price: "399 000 сум",
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
        price: "149,000 UZS",
        period: " / mo",
        popular: true,
        features: ["10 bots", "10,000 contacts", "All blocks", "Payment systems", "API integration", "Analytics"],
        btn: "Select →"
      },
      {
        name: "Pro",
        price: "399,000 UZS",
        period: " / mo",
        popular: false,
        features: ["Unlimited bots", "Unlimited contacts", "Priority support", "White-label", "Custom integrations"],
        btn: "Select →"
      }
    ]
  }
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { lang, changeLanguage } = useTranslation()
  
  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS['UZ']

  return (
    <div className="landing-page">
      <div className="l-animated-orb l-orb-1"></div>
      <div className="l-animated-orb l-orb-2"></div>
      <div className="l-animated-orb l-orb-3"></div>
      <div className="l-animated-orb l-orb-4"></div>
      <div className="l-animated-orb l-orb-5"></div>

      {/* HEADER */}
      <header className="l-header">
        <div className="l-container header-inner">
          <div className="l-logo">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="10" height="10" rx="3" fill="#2563eb"/>
              <rect x="16" y="2" width="10" height="10" rx="3" fill="#06b6d4"/>
              <rect x="2" y="16" width="10" height="10" rx="3" fill="#06b6d4"/>
              <rect x="16" y="16" width="10" height="10" rx="3" fill="#7c3aed"/>
            </svg>
            Mazaika
          </div>
          <nav className="l-nav-desktop">
            <a href="#features">{t.navFeatures}</a>
            <a href="#ai-agent">Mazaika AI 🚀</a>
            <a href="#pricing">{t.navPricing}</a>
          </nav>
          <div className="l-header-actions">
            <div className="l-lang-switcher">
              {(['UZ', 'RU', 'EN'] as const).map(l => (
                <button key={l} className={lang === l ? 'active' : ''} onClick={() => changeLanguage(l)}>{l}</button>
              ))}
            </div>
            <button onClick={() => navigate('/register')}>{t.navStart}</button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="l-hero">
        <div className="l-container l-hero-inner">
          <div className="l-hero-content">
            <div className="l-hero-badge"><Zap size={16} /> {t.heroBadge}</div>
            <h1 className="l-hero-title">
              {t.heroTitleLine1} <br/>
              <span className="l-gradient-text">Lego</span> <span className="l-gradient-text-2">{t.heroTitleLine2}</span>
            </h1>
            <p className="l-hero-desc">{t.heroDesc}</p>
            <div className="l-hero-cta">
              <button className="l-btn-primary" onClick={() => navigate('/register')}>{t.heroCtaFree}</button>
              <button className="l-btn-secondary" onClick={() => document.getElementById('ai-agent')?.scrollIntoView({ behavior: 'smooth' })}>
                <Sparkles size={20} /> {t.heroCtaDemo}
              </button>
            </div>
            <div className="l-stats-row">
              <div className="l-stat-item">
                <span className="l-stat-value">50+</span>
                <span className="l-stat-label">Bloklar</span>
              </div>
              <div className="l-stat-item">
                <span className="l-stat-value">3</span>
                <span className="l-stat-label">Til</span>
              </div>
              <div className="l-stat-item">
                <span className="l-stat-value">AI</span>
                <span className="l-stat-label">Generatsiya</span>
              </div>
              <div className="l-stat-item">
                <span className="l-stat-value">0</span>
                <span className="l-stat-label">Kod</span>
              </div>
            </div>
          </div>
          <div className="l-hero-mockup-side">
            <div className="hero-mockup-wrap">
              <div className="hero-mockup">
                <div className="hero-mockup-notch"></div>
                <div className="hero-mockup-screen">
                  <div className="hero-mockup-header">
                    <div className="hero-mockup-avatar"></div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>Mazaika Shop</div>
                      <div style={{ color: '#06b6d4', fontSize: 12 }}>bot</div>
                    </div>
                  </div>
                  <div className="hero-mockup-chat">
                    <div className="hero-mockup-bubble bot">Assalomu alaykum! Bizning do'konga xush kelibsiz. Nima buyurtma qilasiz?</div>
                    <div className="hero-mockup-bubble user">Menyu ko'rish</div>
                    <div className="hero-mockup-bubble bot">Katalogimiz bilan tanishing:<br/>- Qahva<br/>- Shirinliklar<br/>- Fast food</div>
                    <div className="hero-mockup-bubble user">Qahva</div>
                    <div className="hero-mockup-bubble bot">💳 To'lovni amalga oshiring:<br/><br/><button style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 8, width: '100%' }}>Payme orqali to'lash</button></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="l-marquee-section">
        <div className="l-marquee-track">
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: '32px' }}>
              <div className="l-marquee-item">💳 Payme</div>
              <div className="l-marquee-item">💳 Click</div>
              <div className="l-marquee-item">🏦 Uzum</div>
              <div className="l-marquee-item">📱 Telegram</div>
              <div className="l-marquee-item">📊 Google Sheets</div>
              <div className="l-marquee-item">🌐 HTTP API</div>
              <div className="l-marquee-item">🤖 Gemini AI</div>
              <div className="l-marquee-item">⚡ Zapier</div>
              <div className="l-marquee-item">📧 Email</div>
              <div className="l-marquee-item">📦 WooCommerce</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-premium" id="features">
        <div className="container">
          <div className="section-header">
            <div className="l-section-badge"><Zap size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }}/> {t.featBadge.replace('✨ ', '')}</div>
            <h2>{t.featTitleLine1} <span className="gradient-text-neon">{t.featTitleLine2}</span></h2>
            <p>{t.featDesc}</p>
          </div>
          
          <div className="features-grid">
            {t.features.map((f, idx) => (
              <div key={idx} className="l-feature-card">
                <span>{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI SECTION */}
      <section id="ai-agent" className="l-ai-section">
        <div className="l-container">
          <div className="l-ai-grid">
            <div>
              <div className="l-section-badge"><Sparkles size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }}/> AI Yordamchi</div>
              <h2>Mazaika AI Architect</h2>
              <p>{lang === 'UZ' ? 'Faqat so\'z bilan tushuntiring, AI yaratadi. Kod yozish shart emas.' : lang === 'RU' ? 'Просто объясните словами, AI создаст всё сам.' : 'Just explain in words, AI will create it.'}</p>
              <ul>
                <li><Sparkles size={20}/> {lang === 'UZ' ? 'Matndan bot yaratish' : lang === 'RU' ? 'Создание ботов из текста' : 'Text to Bot'}</li>
                <li><Bot size={20}/> {lang === 'UZ' ? 'Bloklarni avtomatik ulash' : lang === 'RU' ? 'Авто-соединение блоков' : 'Auto block linking'}</li>
              </ul>
            </div>
            
            <div className="ai-mockup">
              <div className="ai-mockup-header">
                <div className="ai-mockup-dots"><span></span><span></span><span></span></div>
                <div className="ai-mockup-title">Mazaika AI Agent</div>
              </div>
              <div className="ai-mockup-body">
                <div className="chat-msg user">
                  <div className="bubble">Qahvaxona uchun buyurtma oladigan bot yasab ber. Menyu va to'lov ulangan bo'lsin.</div>
                </div>
                <div className="chat-msg ai">
                  <div className="bubble">
                    <div className="ai-icon-wrap"><Sparkles size={16} color="white" /></div>
                    <div>
                      <div>Tushundim! Qahvaxona botini yaratmoqdaman...</div>
                      <div className="ai-code-block">
                        <div><span className="keyword">const</span> flow <span className="keyword">=</span> <span className="function">createBotFlow</span>({'{'}</div>
                        <div>  name: <span className="string">'CoffeeShopBot'</span>,</div>
                        <div>  steps: [<span className="string">'Greeting'</span>, <span className="string">'Menu'</span>, <span className="string">'Payment'</span>]</div>
                        <div>{'}'});</div>
                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Loader2 size={12} className="spin" color="#a855f7" /> 
                          <span style={{ color: '#a855f7' }}>Sxema chizilmoqda...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="l-testimonials">
        <div className="container">
          <div className="section-header">
            <h2>Mijozlarimiz <span className="gradient-text-neon">Fikri</span></h2>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="t-header">
                <div className="t-avatar">BT</div>
                <div className="t-info">
                  <h4>Bobur Toshmatov</h4>
                  <p>Online Do'kon Egasi</p>
                </div>
              </div>
              <div className="t-text">"Mazaika tufayli botimni 1 kunda yaratdim. Endi har kuni 50+ buyurtma kelmoqda!"</div>
            </div>
            <div className="testimonial-card">
              <div className="t-header">
                <div className="t-avatar" style={{ background: '#7c3aed' }}>DR</div>
                <div className="t-info">
                  <h4>Dilnoza Rashidova</h4>
                  <p>Fitnes Trener</p>
                </div>
              </div>
              <div className="t-text">"Telegram orqali dars jadvalini ulashdim. Mijozlar juda xursand!"</div>
            </div>
            <div className="testimonial-card">
              <div className="t-header">
                <div className="t-avatar" style={{ background: '#f59e0b' }}>SM</div>
                <div className="t-info">
                  <h4>Sardor Mirzayev</h4>
                  <p>Restoran Egasi</p>
                </div>
              </div>
              <div className="t-text">"Mazaika AI 10 daqiqada bizning menuimizni yaratdi. Hayron qoldim!"</div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing-premium" id="pricing">
        <div className="container">
          <div className="section-header">
            <div className="l-section-badge">💰 {t.priceBadge.replace('💰 ', '')}</div>
            <h2>{t.priceTitleLine1} <span className="gradient-text-neon">{t.priceTitleLine2}</span> {t.priceTitleLine3}</h2>
            <p>{t.priceDesc}</p>
          </div>

          <div className="pricing-cards">
            {t.plans.map((plan, i) => (
              <div key={i} className={`price-card ${plan.popular ? 'popular' : ''}`}>
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
                  className={plan.popular ? 'btn-primary-neon' : 'btn-secondary-glass'}
                  onClick={() => navigate('/register')}
                >
                  {plan.btn}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="l-cta-section">
        <div className="container">
          <h2>{t.ctaTitleLine1} <span className="gradient-text-neon">{t.ctaTitleLine2}</span> {t.ctaTitleLine3}</h2>
          <p>{t.ctaDesc}</p>
          <button className="btn-3d" onClick={() => navigate('/register')}>
            {t.ctaBtn}
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-premium">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <svg width="32" height="32" viewBox="0 0 28 28" fill="none" style={{ marginRight: 8, verticalAlign: 'middle' }}>
                <rect x="2" y="2" width="10" height="10" rx="3" fill="#2563eb"/>
                <rect x="16" y="2" width="10" height="10" rx="3" fill="#06b6d4"/>
                <rect x="2" y="16" width="10" height="10" rx="3" fill="#06b6d4"/>
                <rect x="16" y="16" width="10" height="10" rx="3" fill="#7c3aed"/>
              </svg>
              Mazaika
            </div>
            <div className="footer-col">
              <h4>Platforma</h4>
              <a href="#features">{t.navFeatures}</a>
              <a href="#pricing">{t.navPricing}</a>
              <a href="#">Mazaika AI</a>
            </div>
            <div className="footer-col">
              <h4>Huquqiy</h4>
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
