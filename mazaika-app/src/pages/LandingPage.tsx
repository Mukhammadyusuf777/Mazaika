import { useNavigate } from 'react-router-dom'
import { Sparkles, Loader2, Bot, Zap } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useRef, useCallback, useEffect, useState } from 'react'
import './LandingPage.css'
import { BackgroundScene3D } from '../components/3d/BackgroundScene3D';
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
        desc: "Sinab ko'rish uchun ideal",
        features: [
          "1 ta bot",
          "500 ta kontakt",
          "Asosiy bloklar (xabar, tugma, javob)",
          "Telegram integratsiya",
          "Drag & drop editor",
          "Mazaika hamjamiyati"
        ],
        btn: "Bepul boshlash"
      },
      {
        name: "Pro",
        price: "149 000 so'm",
        period: " / oy",
        popular: false,
        desc: "O'sayotgan biznes uchun",
        features: [
          "5 ta bot",
          "5 000 ta kontakt",
          "Barcha 50+ bloklar",
          "Payme & Click to'lovlari",
          "API & Webhook integratsiya",
          "Analitika dashboard",
          "Mini App (HTML sahifa)",
          "Email qo'llab-quvvatlash"
        ],
        btn: "Tanlash →"
      },
      {
        name: "Biznes",
        price: "249 000 so'm",
        period: " / oy",
        popular: true,
        desc: "Jiddiy biznes uchun to'liq paket",
        features: [
          "20 ta bot",
          "50 000 ta kontakt",
          "Barcha Pro imkoniyatlar",
          "Mazaika AI Architect",
          "White-label brending",
          "Google Sheets integratsiya",
          "Ustuvor 24/7 qo'llab-quvvatlash",
          "Maxsus integratsiyalar",
          "Bot klonlash"
        ],
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
        desc: "Идеально для старта",
        features: [
          "1 бот",
          "500 контактов",
          "Основные блоки (сообщение, кнопки, ответ)",
          "Интеграция Telegram",
          "Редактор Drag & drop",
          "Доступ к сообществу"
        ],
        btn: "Начать бесплатно"
      },
      {
        name: "Про",
        price: "149 000 сум",
        period: " / мес",
        popular: false,
        desc: "Для растущего бизнеса",
        features: [
          "5 ботов",
          "5 000 контактов",
          "Все 50+ блоков",
          "Платёжные системы Payme & Click",
          "API & Webhook интеграции",
          "Аналитика дашборд",
          "Mini App (HTML страница)",
          "Email поддержка"
        ],
        btn: "Выбрать →"
      },
      {
        name: "Бизнес",
        price: "249 000 сум",
        period: " / мес",
        popular: true,
        desc: "Полный пакет для серьёзного бизнеса",
        features: [
          "20 ботов",
          "50 000 контактов",
          "Все возможности Про",
          "Mazaika AI Architect",
          "White-label брендинг",
          "Интеграция Google Sheets",
          "Приоритетная поддержка 24/7",
          "Кастомные интеграции",
          "Клонирование ботов"
        ],
        btn: "Выбрать →"
      }
    ]
  },
  EN: {
    navFeatures: 'Features',
    navBlocks: 'Blocks',
    navPricing: 'Pricing',
    navLogin: 'Login',
    navStart: 'Get started →',
    heroBadge: '🇺🇿 Built for Uzbekistan',
    heroTitleLine1: 'Build Telegram bots',
    heroTitleLine2: 'like',
    heroDesc: "Drag and drop blocks — your professional bot is ready. No coding required, no developer needed. A platform built for Uzbek business.",
    heroCtaFree: 'Start for free →',
    heroCtaDemo: 'Watch demo',
    statBlocks: 'Block types',
    statLangs: 'Languages',
    statCode: 'No code needed',
    featBadge: '✨ Features',
    featTitleLine1: 'Different from other',
    featTitleLine2: 'platforms',
    featDesc: "Mazaika — designed specifically for the Uzbek market, integrated with local payment systems",
    blockBadge: '🧩 50+ blocks',
    blockTitleLine1: 'Right block for',
    blockTitleLine2: 'every situation',
    blockDesc: "From messages to payments — everything is in ready-made blocks",
    priceBadge: '💰 Pricing',
    priceTitleLine1: 'Simple &',
    priceTitleLine2: 'transparent',
    priceTitleLine3: 'pricing',
    priceDesc: "No hidden fees. Switch plans as your business grows.",
    ctaTitleLine1: 'Build your bot',
    ctaTitleLine2: 'today',
    ctaTitleLine3: '',
    ctaDesc: "Registration takes 30 seconds. No credit card needed.",
    ctaBtn: 'Start for free — 0 UZS →',
    footerTerms: 'Terms',
    footerPrivacy: 'Privacy',
    footerHelp: 'Help',
    footerCopy: '© 2026 Mazaika. Built for Uzbekistan 🇺🇿',
    features: [
      {
        icon: '🧩',
        title: 'Visual constructor',
        desc: "Drag and connect blocks — build professional bots without code. Mazaika is the easiest way to build bots.",
      },
      {
        icon: '⚡',
        title: 'Works in real-time',
        desc: "Once you save the scheme, the bot immediately starts working with the new logic. No need to reload servers.",
      },
      {
        icon: '🤖',
        title: 'AI Assistant',
        desc: "Our AI assistant helps you create bots and websites just from text requests.",
      },
      {
        icon: '📊',
        title: 'Powerful analytics',
        desc: "Track the path of every user. Find out which block they stop at and which buttons they press.",
      },
      {
        icon: '💳',
        title: "Uzbekistan payments",
        desc: "Integration with Payme, Click, Uzum. Interface in Uzbek — speak the language of business.",
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
        desc: "Perfect for testing",
        features: [
          "1 bot",
          "500 contacts",
          "Basic blocks (message, buttons, reply)",
          "Telegram integration",
          "Drag & drop editor",
          "Mazaika community"
        ],
        btn: "Start for free"
      },
      {
        name: "Pro",
        price: "149,000 UZS",
        period: " / mo",
        popular: false,
        desc: "For growing business",
        features: [
          "5 bots",
          "5,000 contacts",
          "All 50+ blocks",
          "Payme & Click payments",
          "API & Webhook integrations",
          "Analytics dashboard",
          "Mini App (HTML page)",
          "Email support"
        ],
        btn: "Select →"
      },
      {
        name: "Business",
        price: "249,000 UZS",
        period: " / mo",
        popular: true,
        desc: "Full package for serious business",
        features: [
          "20 bots",
          "50,000 contacts",
          "All Pro features",
          "Mazaika AI Architect",
          "White-label branding",
          "Google Sheets integration",
          "Priority 24/7 support",
          "Custom integrations",
          "Bot cloning"
        ],
        btn: "Select →"
      }
    ]
  }
}

// Scroll reveal hook
function useScrollReveal(dependency?: any) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    // Initial check
    const elements = document.querySelectorAll('.reveal');
    elements.forEach(el => observer.observe(el));

    // Fallback: If page loads already scrolled or fast scroll
    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 40) {
          el.classList.add('revealed');
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [dependency]);
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { lang, changeLanguage } = useTranslation()
  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS['UZ']

  useScrollReveal(lang)

  // ── 3D tilt phone ──────────────────────────────────────────
  const phoneRef = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)
  const rafRef   = useRef<number>(0)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const el = phoneRef.current
      const glare = glareRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width  / 2
      const cy = rect.top  + rect.height / 2
      const dx = (e.clientX - cx) / (rect.width  / 2)
      const dy = (e.clientY - cy) / (rect.height / 2)
      const maxTilt = 22
      const rotY =  dx * maxTilt
      const rotX = -dy * maxTilt
      el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.06)`
      el.style.boxShadow = [
        `0 0 0 6px rgba(124,60,250,${0.12 + Math.abs(dx)*0.2})`,
        `${-rotY*2}px ${rotX*2}px 80px rgba(0,0,0,0.9)`,
        `0 0 ${80 + Math.abs(dx)*60}px rgba(124,60,250,${0.15 + Math.abs(dx)*0.25})`,
        `0 0 ${60 + Math.abs(dy)*40}px rgba(0,245,212,${0.08 + Math.abs(dy)*0.18})`,
      ].join(',')
      if (glare) {
        const glareX = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1)
        const glareY = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1)
        glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.22) 0%, transparent 65%)`
        glare.style.opacity = '1'
      }
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    const el    = phoneRef.current
    const glare = glareRef.current
    if (el) {
      el.style.transform  = ''
      el.style.boxShadow  = ''
    }
    if (glare) glare.style.opacity = '0'
  }, [])

  // Gyroscope for mobile 3D tilt
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const el = phoneRef.current
      if (!el) return
      const beta = Math.max(-20, Math.min(20, (e.beta || 0) - 45)) // front-back tilt
      const gamma = Math.max(-20, Math.min(20, e.gamma || 0)) // left-right tilt
      el.style.transform = `perspective(900px) rotateX(${-beta * 0.5}deg) rotateY(${gamma * 0.8}deg) scale(1.02)`
    }
    window.addEventListener('deviceorientation', handleOrientation as any)
    return () => window.removeEventListener('deviceorientation', handleOrientation as any)
  }, [])

  // Magnetic button effect
  const [magnetPos, setMagnetPos] = useState({ x: 0, y: 0 })
  const magnetRef = useRef<HTMLButtonElement>(null)
  const handleMagnetMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = magnetRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    setMagnetPos({
      x: (e.clientX - cx) * 0.3,
      y: (e.clientY - cy) * 0.3,
    })
  }
  const handleMagnetLeave = () => setMagnetPos({ x: 0, y: 0 })

  return (
    <div className="landing-page lp-main">
      <BackgroundScene3D />

      {/* HEADER */}
      <header className="l-header">
        <div className="l-container header-inner">
          <div className="l-logo">
            <div className="l-logo-icon">
              <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
                <rect x="2" y="2" width="10" height="10" rx="3" fill="white"/>
                <rect x="16" y="2" width="10" height="10" rx="3" fill="rgba(255,255,255,0.6)"/>
                <rect x="2" y="16" width="10" height="10" rx="3" fill="rgba(255,255,255,0.6)"/>
                <rect x="16" y="16" width="10" height="10" rx="3" fill="rgba(255,255,255,0.3)"/>
              </svg>
            </div>
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
            <button className="l-btn-nav" onClick={() => navigate('/register')}>{t.navStart}</button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="l-hero">
        <div className="l-container l-hero-inner">
          <div className="l-hero-content">
            <div className="l-hero-badge"><span className="l-hero-badge-dot"></span> <Zap size={16} /> {t.heroBadge}</div>
            <h1 className="l-hero-title">
              {t.heroTitleLine1} <br/>
              <span className="l-gradient-text">Lego</span> <span className="l-gradient-text-2">{t.heroTitleLine2}</span>
            </h1>
            <p className="l-hero-desc">{t.heroDesc}</p>
            <div className="l-hero-cta">
              <button
                ref={magnetRef}
                className="l-btn-primary magnetic-btn"
                onClick={() => navigate('/register')}
                onMouseMove={handleMagnetMove}
                onMouseLeave={handleMagnetLeave}
                style={{ transform: `translate(${magnetPos.x}px, ${magnetPos.y}px)` }}
              >
                {t.heroCtaFree}
              </button>
              <button className="l-btn-secondary" onClick={() => document.getElementById('ai-agent')?.scrollIntoView({ behavior: 'smooth' })}>
                <Sparkles size={20} /> {t.heroCtaDemo}
              </button>
            </div>
            <div className="l-stats-row">
              <div className="l-stat-item">
                <span className="l-stat-value counter" data-target="50">50+</span>
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
            <div
              className="hero-mockup-wrap"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Floating node cards */}
              <div className="mock-node mock-node-1">🧩 Greeting node</div>
              <div className="mock-node mock-node-2">💳 Payment node</div>
              <div className="mock-node mock-node-3">✅ Built!</div>
              <div className="mock-node mock-node-4">📊 Analytics</div>

              {/* Phone — ref receives 3D transform */}
              <div className="hero-mockup" ref={phoneRef}>
                {/* Glare overlay follows cursor */}
                <div className="mockup-glare" ref={glareRef}></div>

                <div className="hero-mockup-notch"></div>
                <div className="hero-mockup-screen">
                  <div className="hero-mockup-header">
                    <div className="hero-mockup-avatar"></div>
                    <div>
                      <div className="hero-mockup-name">Mazaika Shop</div>
                      <div className="hero-mockup-status">● online</div>
                    </div>
                  </div>
                  <div className="hero-mockup-chat">
                    {/* SCENE 1: Order flow — Real Telegram UI */}
                    <div className="mockup-scene mockup-scene-1">

                      {/* Bot message 1 */}
                      <div className="tg-msg-row bot-row anim-1">
                        <div className="tg-avatar">🛒</div>
                        <div className="tg-bubble bot">
                          Assalomu alaykum! Bizning do'konga xush kelibsiz 👋
                          <div className="tg-meta"><span>09:41</span></div>
                        </div>
                      </div>

                      {/* User message 1 */}
                      <div className="tg-msg-row user-row anim-2">
                        <div className="tg-bubble user">
                          Menyu ko'rish
                          <div className="tg-meta"><span>09:41</span><span className="tg-tick">✓✓</span></div>
                        </div>
                      </div>

                      {/* Bot message 2 */}
                      <div className="tg-msg-row bot-row anim-3">
                        <div className="tg-avatar">🛒</div>
                        <div className="tg-bubble bot">
                          Katalogimiz:<br/>☕ Qahva — 15,000 so'm<br/>🍰 Tort — 25,000 so'm<br/>🍔 Burger — 35,000 so'm
                          <div className="tg-meta"><span>09:41</span></div>
                        </div>
                      </div>

                      {/* User message 2 */}
                      <div className="tg-msg-row user-row anim-4">
                        <div className="tg-bubble user">
                          Qahva
                          <div className="tg-meta"><span>09:42</span><span className="tg-tick">✓✓</span></div>
                        </div>
                      </div>

                      {/* Bot payment message */}
                      <div className="tg-msg-row bot-row anim-5">
                        <div className="tg-avatar">🛒</div>
                        <div className="tg-bubble bot">
                          💳 To'lov: <strong>15,000 so'm</strong>
                          <button className="mockup-pay-btn">Payme orqali to'lash</button>
                          <div className="tg-meta"><span>09:42</span></div>
                        </div>
                      </div>

                      {/* Typing indicator */}
                      <div className="tg-msg-row bot-row">
                        <div className="tg-avatar" style={{opacity: 0.6}}>🛒</div>
                        <div className="hero-mockup-typing">
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                    </div>

                    {/* SCENE 2: Delivery */}
                    <div className="mockup-scene mockup-scene-2">
                      <div className="s2-status-bar">
                        <span className="s2-dot"></span> Yetkazilmoqda
                      </div>

                      <div className="tg-msg-row bot-row s2-anim-1">
                        <div className="tg-avatar">🛒</div>
                        <div className="tg-bubble bot">
                          ✅ Buyurtmangiz qabul qilindi!<br/>
                          <span style={{color:'#4fc3f7', fontWeight:700}}>Buyurtma #2847</span>
                          <div className="tg-meta"><span>09:43</span></div>
                        </div>
                      </div>

                      <div className="s2-track">
                        <div className="s2-step done s2-anim-2">
                          <div className="s2-step-icon">✅</div>
                          <div className="s2-step-text">Buyurtma qabul qilindi</div>
                        </div>
                        <div className="s2-connector s2-anim-3"></div>
                        <div className="s2-step done s2-anim-4">
                          <div className="s2-step-icon">🍕</div>
                          <div className="s2-step-text">Tayyorlanmoqda</div>
                        </div>
                        <div className="s2-connector s2-anim-5"></div>
                        <div className="s2-step active s2-anim-6">
                          <div className="s2-step-icon">🛵</div>
                          <div className="s2-step-text">Yo'lda</div>
                        </div>
                        <div className="s2-connector s2-anim-7"></div>
                        <div className="s2-step s2-anim-8">
                          <div className="s2-step-icon">🎉</div>
                          <div className="s2-step-text">Yetkazildi</div>
                        </div>
                      </div>

                      <div className="tg-msg-row bot-row s2-anim-9">
                        <div className="tg-avatar">🛒</div>
                        <div className="tg-bubble bot">
                          📍 Kuryer yo'lda! ETA: <strong>15 daqiqa</strong>
                          <div className="tg-meta"><span>09:44</span></div>
                        </div>
                      </div>

                      <div className="s2-map-preview s2-anim-10">
                        <div className="s2-map-pin">📍</div>
                        <div className="s2-map-route"></div>
                        <div className="s2-map-bike">🛵</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator">
          <div className="scroll-mouse">
            <div className="scroll-wheel"></div>
          </div>
          <span>Scroll</span>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="l-marquee-section">
        <div className="l-marquee-track">
          {['💳 Payme','💳 Click','🏦 Uzum','📱 Telegram','📊 Google Sheets','🌐 HTTP API','🤖 Gemini AI','⚡ Zapier','📧 Email','📦 WooCommerce','🔗 Webhook','💰 To\'lov','📈 Analitika','🛒 E-commerce','💳 Payme','💳 Click','🏦 Uzum','📱 Telegram','📊 Google Sheets','🌐 HTTP API'].map((item, i) => (
            <div key={i} className="l-marquee-item">{item}</div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-premium" id="features">
        <div className="container">
          <div className="section-header reveal">
            <div className="l-section-badge blue"><Zap size={13} /> {t.featBadge.replace('✨ ', '')}</div>
            <h2>{t.featTitleLine1} <span className="gradient-text-neon">{t.featTitleLine2}</span></h2>
            <p>{t.featDesc}</p>
          </div>
          <div className="features-grid">
            {t.features.map((f, idx) => (
              <div key={idx} className={`l-feature-card reveal`} style={{ transitionDelay: `${idx * 80}ms` }}>
                <div className="feature-card-glow"></div>
                <span className="l-feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS COUNTER SECTION */}
      <section className="l-stats-showcase">
        <div className="container">
          <div className="stats-showcase-grid reveal">
            {[
              { value: '500+', label: lang === 'UZ' ? 'Faol biznes' : lang === 'RU' ? 'Активных бизнесов' : 'Active businesses', color: '#7c3cfa' },
              { value: '10K+', label: lang === 'UZ' ? 'Yaratilgan botlar' : lang === 'RU' ? 'Созданных ботов' : 'Bots created', color: '#00f5d4' },
              { value: '1M+', label: lang === 'UZ' ? 'Yuborilgan xabarlar' : lang === 'RU' ? 'Отправленных сообщений' : 'Messages sent', color: '#f72585' },
              { value: '99.9%', label: lang === 'UZ' ? 'Uptime kafolati' : lang === 'RU' ? 'Гарантия аптайма' : 'Uptime guarantee', color: '#fbbf24' },
            ].map((s, i) => (
              <div key={i} className="showcase-stat" style={{ '--s-color': s.color } as React.CSSProperties}>
                <div className="showcase-value">{s.value}</div>
                <div className="showcase-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI SECTION */}
      <section id="ai-agent" className="l-ai-section">
        <div className="l-container">
          <div className="l-ai-grid">
            <div className="reveal">
              <div className="l-section-badge violet"><Sparkles size={13} /> AI Yordamchi</div>
              <h2>Mazaika <span className="gradient-text-neon">AI</span> Architect</h2>
              <p>{lang === 'UZ' ? 'Faqat so\'z bilan tushuntiring, AI yaratadi. Kod yozish shart emas.' : lang === 'RU' ? 'Просто объясните словами, AI создаст всё сам.' : 'Just explain in words, AI will create it.'}</p>
              <ul>
                <li><Sparkles size={18}/> {lang === 'UZ' ? 'Matndan bot yaratish — 30 soniyada' : lang === 'RU' ? 'Создание ботов из текста — за 30 секунд' : 'Text to Bot — in 30 seconds'}</li>
                <li><Bot size={18}/> {lang === 'UZ' ? 'Bloklarni avtomatik ulash' : lang === 'RU' ? 'Авто-соединение блоков' : 'Auto block linking'}</li>
                <li><Zap size={18}/> {lang === 'UZ' ? 'Mini App HTML generatsiya' : lang === 'RU' ? 'Генерация Mini App HTML' : 'Mini App HTML generation'}</li>
                <li><Sparkles size={18}/> {lang === 'UZ' ? "To'lov va API integratsiyalar" : lang === 'RU' ? 'Платёжные и API-интеграции' : 'Payment & API integrations'}</li>
              </ul>
            </div>
            
            <div className="ai-mockup reveal" style={{ transitionDelay: '200ms' }}>
              <div className="ai-mockup-header">
                <div className="ai-mockup-dots"><span></span><span></span><span></span></div>
                <div className="ai-mockup-title">Mazaika AI Agent — Active</div>
                <div className="ai-live-dot"></div>
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
                {/* AI progress bar */}
                <div className="ai-progress-wrap">
                  <div className="ai-progress-label">Generatsiya: 87%</div>
                  <div className="ai-progress-bar">
                    <div className="ai-progress-fill"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — Timeline */}
      <section className="l-how-it-works">
        <div className="container">
          <div className="section-header reveal">
            <div className="l-section-badge cyan"><Zap size={13} /> {lang === 'UZ' ? 'Qanday ishlaydi' : lang === 'RU' ? 'Как это работает' : 'How it works'}</div>
            <h2>{lang === 'UZ' ? 'Uch qadam — bot' : lang === 'RU' ? 'Три шага — и бот' : 'Three steps — bot'} <span className="gradient-text-neon">{lang === 'UZ' ? 'tayyor!' : lang === 'RU' ? 'готов!' : 'ready!'}</span></h2>
          </div>
          <div className="how-steps">
            {[
              { icon: '✍️', step: '01', title: lang === 'UZ' ? "So'z bilan tushuntiring" : lang === 'RU' ? 'Опишите словами' : 'Describe in words', desc: lang === 'UZ' ? "AI ga botingiz haqida yozing" : lang === 'RU' ? 'Напишите AI что должен делать бот' : 'Tell AI what your bot should do' },
              { icon: '🤖', step: '02', title: lang === 'UZ' ? 'AI yaratadi' : lang === 'RU' ? 'AI создаёт' : 'AI builds', desc: lang === 'UZ' ? 'Mazaika AI barcha bloklarni avtomatik quradi' : lang === 'RU' ? 'Mazaika AI строит все блоки автоматически' : 'Mazaika AI builds all blocks automatically' },
              { icon: '🚀', step: '03', title: lang === 'UZ' ? 'Ishga tushiring' : lang === 'RU' ? 'Запустите' : 'Launch it', desc: lang === 'UZ' ? 'Bir tugma bilan Telegram da joylashing' : lang === 'RU' ? 'Разместите в Telegram одной кнопкой' : 'Deploy to Telegram with one button' },
            ].map((s, i) => (
              <div key={i} className="how-step reveal" style={{ transitionDelay: `${i * 150}ms` }}>
                <div className="how-step-number">{s.step}</div>
                <div className="how-step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {i < 2 && <div className="how-connector"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="l-testimonials">
        <div className="container">
          <div className="section-header reveal">
            <div className="l-section-badge cyan"><Sparkles size={13} /> Mijozlar</div>
            <h2>Haqiqiy <span className="gradient-text-neon">Natijalar</span></h2>
            <p>{lang === 'UZ' ? "O'zbekiston bo'ylab 500+ biznes Mazaika ishlatmoqda" : lang === 'RU' ? 'Более 500 бизнесов по всему Узбекистану' : '500+ businesses across Uzbekistan'}</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card reveal">
              <div className="t-stars">⭐⭐⭐⭐⭐</div>
              <div className="t-text">"Mazaika tufayli botimni 1 kunda yaratdim. Endi har kuni 50+ buyurtma kelmoqda! AI barcha bloklarni o'zi uladi."</div>
              <div className="t-header">
                <div className="t-avatar blue">BT</div>
                <div className="t-info">
                  <h4>Bobur Toshmatov</h4>
                  <p>Online Do'kon Egasi · Toshkent</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card reveal" style={{ transitionDelay: '100ms' }}>
              <div className="t-stars">⭐⭐⭐⭐⭐</div>
              <div className="t-text">"Telegram orqali dars jadvalini ulashdim va to'lovni ham. Mazaika — bu kelajak!"</div>
              <div className="t-header">
                <div className="t-avatar violet">DR</div>
                <div className="t-info">
                  <h4>Dilnoza Rashidova</h4>
                  <p>Fitnes Trener · Samarqand</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card reveal" style={{ transitionDelay: '200ms' }}>
              <div className="t-stars">⭐⭐⭐⭐⭐</div>
              <div className="t-text">"Mazaika AI 10 daqiqada bizning menuimizni yaratdi va Payme'ni uladi. Hayron qoldim!"</div>
              <div className="t-header">
                <div className="t-avatar amber">SM</div>
                <div className="t-info">
                  <h4>Sardor Mirzayev</h4>
                  <p>Restoran Egasi · Buxoro</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing-premium" id="pricing">
        <div className="container">
          <div className="section-header reveal">
            <div className="l-section-badge blue">💰 {t.priceBadge.replace('💰 ', '')}</div>
            <h2>{t.priceTitleLine1} <span className="gradient-text-neon">{t.priceTitleLine2}</span> {t.priceTitleLine3}</h2>
            <p>{t.priceDesc}</p>
          </div>

          <div className="pricing-cards">
            {t.plans.map((plan, i) => (
              <div key={i} className={`price-card reveal ${plan.popular ? 'popular' : ''}`} style={{ transitionDelay: `${i * 100}ms` }}>
                {plan.popular && <div className="popular-tag">Eng mashhur ⭐</div>}
                <h3 className="plan-name">{plan.name}</h3>
                {(plan as any).desc && <p className="plan-desc">{(plan as any).desc}</p>}
                <div className="plan-price">
                  <span className="amount">{plan.price}</span>
                  <span className="period">{plan.period}</span>
                </div>
                <div className="plan-divider"></div>
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
        <div className="l-cta-inner reveal">
          <div className="cta-3d-scene">
            <div className="cta-cube">
              <div className="cube-face cube-front"></div>
              <div className="cube-face cube-back"></div>
              <div className="cube-face cube-left"></div>
              <div className="cube-face cube-right"></div>
              <div className="cube-face cube-top"></div>
              <div className="cube-face cube-bottom"></div>
            </div>
          </div>
          <h2><span className="l-gradient-text">{t.ctaTitleLine1}</span><br/><span className="l-gradient-text-2">{t.ctaTitleLine2}</span> {t.ctaTitleLine3}</h2>
          <p>{t.ctaDesc}</p>
          <button className="btn-3d" onClick={() => navigate('/register')}>
            <span className="btn-3d-text">{t.ctaBtn}</span>
            <div className="btn-3d-shine"></div>
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-premium">
        <div className="container">
          <div className="footer-content">
            <div>
              <div className="footer-logo">
                <div className="l-logo-icon" style={{ width:28, height:28 }}>
                  <svg width="16" height="16" viewBox="0 0 28 28" fill="none">
                    <rect x="2" y="2" width="10" height="10" rx="3" fill="white"/>
                    <rect x="16" y="2" width="10" height="10" rx="3" fill="rgba(255,255,255,0.6)"/>
                    <rect x="2" y="16" width="10" height="10" rx="3" fill="rgba(255,255,255,0.6)"/>
                    <rect x="16" y="16" width="10" height="10" rx="3" fill="rgba(255,255,255,0.3)"/>
                  </svg>
                </div>
                Mazaika
              </div>
              <p className="footer-desc">{lang === 'UZ' ? "O'zbek biznes uchun professional Telegram bot va Mini App platformasi." : lang === 'RU' ? 'Профессиональная платформа для бизнеса Узбекистана.' : 'Professional bot platform for Uzbek businesses.'}</p>
            </div>
            <div className="footer-col">
              <h4>Platforma</h4>
              <a href="#features">{t.navFeatures}</a>
              <a href="#pricing">{t.navPricing}</a>
              <a href="#ai-agent">Mazaika AI</a>
              <a href="/register">Boshlash</a>
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
