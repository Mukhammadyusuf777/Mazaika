import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Loader2 } from 'lucide-react'
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

export default function LandingPage() {
  const navigate = useNavigate()
  const { lang, changeLanguage } = useTranslation()
  
  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS['UZ']

  return (
    <div className="landing-page">
      <motion.header className="l-header" initial={{ y: -100 }} animate={{ y: 0 }}>
        <div className="l-container header-inner">
          <div className="l-logo">Mazaika</div>
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
      </motion.header>

      <section className="l-hero">
        <motion.div className="l-container l-hero-content" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <motion.div className="l-hero-badge">{t.heroBadge}</motion.div>
          <h1 className="l-hero-title">{t.heroTitleLine1} <span className="l-gradient-text">Lego</span> {t.heroTitleLine2}</h1>
          <p className="l-hero-desc">{t.heroDesc}</p>
          <div className="l-hero-cta">
            <button className="l-btn-primary" onClick={() => navigate('/register')}>{t.heroCtaFree}</button>
            <button className="l-btn-secondary" onClick={() => document.getElementById('ai-agent')?.scrollIntoView({ behavior: 'smooth' })}>
              <Sparkles size={18} /> {t.heroCtaDemo}
            </button>
          </div>
        </motion.div>
      </section>

      <section id="ai-agent" className="l-ai-section">
        <div className="l-container">
          <div className="l-ai-grid">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2>Mazaika AI Architect</h2>
              <p>{lang === 'UZ' ? 'Faqat so\'z bilan tushuntiring, AI yaratadi.' : lang === 'RU' ? 'Просто объясните словами, AI создаст всё сам.' : 'Just explain in words, AI will create it.'}</p>
              <ul>
                <li><Sparkles size={16}/> {lang === 'UZ' ? 'Matndan bot yaratish' : lang === 'RU' ? 'Создание ботов из текста' : 'Text to Bot'}</li>
              </ul>
            </motion.div>
            <motion.div className="ai-mockup" initial={{ scale: 0.9 }} whileInView={{ scale: 1 }}>
              <div className="chat-msg ai"><div className="bubble"><Loader2 size={14} className="spin" /> {lang === 'UZ' ? 'Kod yozmoqdaman...' : 'Writing code...'}</div></div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="features-premium">
        <div className="container">
          <div className="features-grid">
            {t.features.map((f, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="l-feature-card"
              >
                <span>{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
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
