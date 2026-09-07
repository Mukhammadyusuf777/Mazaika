import { useNavigate } from 'react-router-dom'
import {
  Sparkles, Loader2, Bot, Zap, Check, ArrowRight, Shield, Layers,
  CreditCard, Smartphone, CheckCircle2, ChevronDown,
  ChevronUp, MessageSquare, BarChart3, Cpu, Play
} from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useEffect, useState } from 'react'
import './LandingPage.css'
import { BackgroundScene3D } from '../components/3d/BackgroundScene3D'

// Multi-language translations for global investor readiness
const TRANSLATIONS = {
  UZ: {
    navFeatures: 'Imkoniyatlar',
    navDemo: 'Jonli Demo',
    navComparison: 'Taqqoslash',
    navPricing: 'Narxlar',
    navFaq: 'Savol-Javob',
    navLogin: 'Kirish',
    navStart: 'Boshlash →',
    
    heroBadge: 'Mazaika 2.0 • AI Architect & Telegram WebApps 3.0',
    heroTitle1: 'Telegram Biznesi Uchun',
    heroTitle2: 'Yagona No-Code Ekotizim',
    heroDesc: "Vizual blokli konstruktor, to'laqonli Telegram Mini App internet-do'koni, Payme & Click to'lovlari va DeepSeek-R1 AI yordamchisi — barchasi bir joyda, dasturchilarsiz 15 daqiqada.",
    heroCtaFree: 'Bepul boshlash (0 so\'m) →',
    heroCtaDemo: 'Jonli Demoni Sinash',
    heroTrust1: 'Kredit karta shart emas',
    heroTrust2: '500 ta kontakt bepul',
    heroTrust3: 'Payme & Click sertifikatlangan',

    showcaseTitle: 'Mazaika Studio • Interaktiv Mahsulot Simulyatori',
    tabFlow: 'Vizual Sxema (Node Graph)',
    tabMiniApp: 'Telegram Mini App (Do\'kon)',
    tabAI: 'Mazaika AI Copilot',
    tabPay: 'Payme & Click To\'lov',
    tabCRM: 'Jonli CRM & Analitika',

    statsBusinesses: 'Faol bizneslar',
    statsMessages: 'Yuborilgan xabarlar',
    statsUptime: 'Server uptime kafolati',
    statsTime: 'O\'rtacha ishga tushish',

    bentoBadge: 'Arxitektura',
    bentoTitle1: 'Biznesingizni avtomatlashtirish uchun',
    bentoTitle2: 'barcha vositalar',
    bentoDesc: 'Telegram-botdan tortib to to\'lovlar va to\'liq veb-ilovalargacha — yagona ekotizimda birlashtirilgan.',

    compBadge: 'Nega Mazaika?',
    compTitle1: 'Bozordagi muqobillar bilan',
    compTitle2: 'haqiqiy taqqoslash',
    compDesc: 'Nima uchun 500+ tadbirkorlar va startaplar agentliklar o\'rniga Mazaikani tanlamoqda.',

    howBadge: 'Tezkor Qadamlar',
    howTitle1: 'Uch oddiy qadamda',
    howTitle2: 'birinchi savdongizni boshlang',

    pricingBadge: 'Shaffof Narxlar',
    pricingTitle1: 'Yashirin to\'lovlarsiz',
    pricingTitle2: 'adolatli tariflar',
    pricingDesc: 'Kichik loyihalardan boshlab yirik korporativ tarmoqlargacha moslashtirilgan.',
    monthly: 'Oylik',
    yearly: 'Yillik (-20% chegirma)',

    faqBadge: 'Ko\'p So\'raladigan Savollar',
    faqTitle1: 'Savollaringiz bormi?',
    faqTitle2: 'Javob beramiz',

    ctaBadge: 'Kelajak Bugun Boshlanadi',
    ctaTitle1: 'Telegramdagi biznesingizni',
    ctaTitle2: 'bugunoq ishga tushiring',
    ctaDesc: 'Ro\'yxatdan o\'tish 30 soniya oladi. Hoziroq bepul botingizni yarating va birinchi buyurtmalarni qabul qiling.',
    ctaBtn: 'Hoziroq bepul boshlash →',

    footerDesc: 'O\'zbekiston va MDH bozori uchun professional Telegram botlar, Mini App veb-ilovalari va AI-savdo agentlari platformasi.',
    footerCopy: '© 2026 Mazaika Inc. Barcha huquqlar himoyalangan.'
  },
  RU: {
    navFeatures: 'Возможности',
    navDemo: 'Живое Демо',
    navComparison: 'Сравнение',
    navPricing: 'Тарифы',
    navFaq: 'Частые вопросы',
    navLogin: 'Войти',
    navStart: 'Начать →',

    heroBadge: 'Mazaika 2.0 • Движок DeepSeek-R1 и Telegram WebApps 3.0',
    heroTitle1: 'Следующее поколение',
    heroTitle2: 'экосистемы для Telegram',
    heroDesc: 'Визуальный конструктор сценариев, полноценные Telegram Mini Apps (магазины внутри чата), прием оплат Payme / Click и умный AI-ассистент — без строчки кода за 15 минут.',
    heroCtaFree: 'Начать бесплатно (0 сум) →',
    heroCtaDemo: 'Тестировать демо',
    heroTrust1: 'Банковская карта не требуется',
    heroTrust2: '500 контактов бесплатно навсегда',
    heroTrust3: 'Прямая интеграция Payme и Click',

    showcaseTitle: 'Mazaika Studio • Интерактивный Симулятор Продукта',
    tabFlow: 'Визуальный граф (Node Workflow)',
    tabMiniApp: 'Telegram Mini App (Магазин)',
    tabAI: 'Mazaika AI Copilot',
    tabPay: 'Платежи Payme & Click',
    tabCRM: 'CRM и Живая Аналитика',

    statsBusinesses: 'Активных компаний',
    statsMessages: 'Отправленных сообщений',
    statsUptime: 'Гарантия аптайма',
    statsTime: 'Среднее время запуска',

    bentoBadge: 'Архитектура платформы',
    bentoTitle1: 'Все инструменты для',
    bentoTitle2: 'масштабирования продаж',
    bentoDesc: 'От простого чат-бота до фискализированных оплат и автономных AI-агентов в одной экосистеме.',

    compBadge: 'Почему Mazaika?',
    compTitle1: 'Честное сравнение',
    compTitle2: 'с альтернативами на рынке',
    compDesc: 'Почему 500+ бизнесов и инвесторов выбирают платформу Mazaika вместо заказной разработки.',

    howBadge: 'Быстрый старт',
    howTitle1: 'Три простых шага',
    howTitle2: 'до первых продаж в Telegram',

    pricingBadge: 'Прозрачные тарифы',
    pricingTitle1: 'Инвестируйте в рост',
    pricingTitle2: 'без скрытых платежей',
    pricingDesc: 'Масштабируйтесь от небольшого пилота до федеральной сети.',
    monthly: 'Ежемесячно',
    yearly: 'Годовой план (-20% скидка)',

    faqBadge: 'База знаний',
    faqTitle1: 'Часто задаваемые',
    faqTitle2: 'вопросы инвесторов и клиентов',

    ctaBadge: 'Старт за 30 секунд',
    ctaTitle1: 'Создайте своего бота',
    ctaTitle2: 'и Mini App прямо сейчас',
    ctaDesc: 'Регистрация занимает меньше минуты. Начните с бесплатного тарифа и протестируйте всю мощь Mazaika.',
    ctaBtn: 'Создать проект бесплатно →',

    footerDesc: 'Инновационная No-Code платформа для Telegram-ботов, Mini Apps и AI-автоматизации бизнеса в Узбекистане и СНГ.',
    footerCopy: '© 2026 Mazaika Inc. Все права защищены.'
  },
  EN: {
    navFeatures: 'Features',
    navDemo: 'Live Demo',
    navComparison: 'Comparison',
    navPricing: 'Pricing',
    navFaq: 'FAQ',
    navLogin: 'Sign In',
    navStart: 'Get Started →',

    heroBadge: 'Mazaika 2.0 • DeepSeek-R1 Engine & Telegram WebApps 3.0',
    heroTitle1: 'Next-Generation',
    heroTitle2: 'Telegram Business Ecosystem',
    heroDesc: 'Visual node workflow builder, full-scale Telegram Mini Apps (embedded e-commerce), Payme & Click payments, and smart AI agent — all in one no-code suite in 15 minutes.',
    heroCtaFree: 'Start Free (0 UZS) →',
    heroCtaDemo: 'Explore Interactive Demo',
    heroTrust1: 'No credit card required',
    heroTrust2: '500 free contacts forever',
    heroTrust3: 'Certified Payme & Click sync',

    showcaseTitle: 'Mazaika Studio • Live Interactive Product Simulator',
    tabFlow: 'Visual Node Workflow',
    tabMiniApp: 'Telegram Mini App (Store)',
    tabAI: 'Mazaika AI Copilot',
    tabPay: 'Payme & Click Checkout',
    tabCRM: 'Live CRM & Analytics',

    statsBusinesses: 'Active businesses',
    statsMessages: 'Messages delivered',
    statsUptime: 'Server uptime guarantee',
    statsTime: 'Average time-to-market',

    bentoBadge: 'Ecosystem Architecture',
    bentoTitle1: 'All the tools you need',
    bentoTitle2: 'to scale in Telegram',
    bentoDesc: 'From interactive conversation flows to payments and web apps — natively connected.',

    compBadge: 'Why Mazaika?',
    compTitle1: 'Transparent comparison',
    compTitle2: 'with market alternatives',
    compDesc: 'Why 500+ businesses and venture investors choose Mazaika over agency custom coding.',

    howBadge: 'Quick Start',
    howTitle1: 'Three simple steps',
    howTitle2: 'to your first automated sale',

    pricingBadge: 'Transparent Pricing',
    pricingTitle1: 'Simple & predictable',
    pricingTitle2: 'value-driven plans',
    pricingDesc: 'Scale seamlessly from prototype to enterprise.',
    monthly: 'Monthly',
    yearly: 'Annual (-20% discount)',

    faqBadge: 'FAQ',
    faqTitle1: 'Frequently asked',
    faqTitle2: 'questions by investors',

    ctaBadge: 'Launch in Minutes',
    ctaTitle1: 'Launch your Telegram bot',
    ctaTitle2: '& Mini App today',
    ctaDesc: 'Sign up in 30 seconds. Build your first bot with free starter tier and zero risk.',
    ctaBtn: 'Start Free Now →',

    footerDesc: 'Next-generation No-Code builder for Telegram bots, Mini Apps, and conversational AI agents in Central Asia.',
    footerCopy: '© 2026 Mazaika Inc. All rights reserved.'
  }
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { lang, changeLanguage } = useTranslation()
  const currentLang = (lang && ['UZ', 'RU', 'EN'].includes(lang) ? lang : 'UZ') as 'UZ' | 'RU' | 'EN'
  const t = TRANSLATIONS[currentLang]

  // Interactive Studio Preview State
  const [activeTab, setActiveTab] = useState<'flow' | 'miniapp' | 'ai' | 'payments' | 'crm'>('flow')
  
  // Interactive Mini App Store Cart State
  const [cartCount, setCartCount] = useState(2)
  const [cartTotal, setCartTotal] = useState(66000)
  const [addedNotice, setAddedNotice] = useState<string | null>(null)

  // Interactive AI Generator Simulation State
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiStep, setAiStep] = useState(0)

  // Pricing Toggle (Monthly vs Annual)
  const [isYearly, setIsYearly] = useState(false)

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Add to cart handler in interactive simulator
  const handleAddToCart = (name: string, price: number) => {
    setCartCount(prev => prev + 1)
    setCartTotal(prev => prev + price)
    setAddedNotice(`${name} savatga qo'shildi!`)
    setTimeout(() => setAddedNotice(null), 2000)
  }

  // Trigger AI generation simulation
  const handleTriggerAISimulation = () => {
    if (aiGenerating) return
    setAiGenerating(true)
    setAiStep(1)
    setTimeout(() => setAiStep(2), 900)
    setTimeout(() => setAiStep(3), 1900)
    setTimeout(() => {
      setAiStep(4)
      setAiGenerating(false)
    }, 2800)
  }

  // Auto scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )

    const elements = document.querySelectorAll('.reveal')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [currentLang])

  return (
    <div className="landing-page">
      {/* Three.js Ambient Cyber Space Background (Z-index: 0) */}
      <BackgroundScene3D />

      {/* 1. FLOATING GLASS HEADER */}
      <header className="l-header">
        <div className="header-inner">
          <div className="l-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="l-logo-icon">
              <Sparkles size={16} color="#00D9FF" />
            </div>
            <span>Mazaika</span>
            <span className="l-logo-tag">2.0</span>
          </div>

          <nav className="l-nav-desktop">
            <a href="#features">{t.navFeatures}</a>
            <a href="#demo" className="nav-highlight">{t.navDemo}</a>
            <a href="#comparison">{t.navComparison}</a>
            <a href="#pricing">{t.navPricing}</a>
            <a href="#faq">{t.navFaq}</a>
          </nav>

          <div className="l-header-actions">
            <div className="l-lang-switcher">
              {(['UZ', 'RU', 'EN'] as const).map((l) => (
                <button
                  key={l}
                  className={currentLang === l ? 'active' : ''}
                  onClick={() => changeLanguage(l)}
                >
                  {l}
                </button>
              ))}
            </div>

            <button className="l-btn-login" onClick={() => navigate('/login')}>
              {t.navLogin}
            </button>

            <button className="l-btn-nav" onClick={() => navigate('/register')}>
              {t.navStart}
            </button>
          </div>
        </div>
      </header>

      {/* 2. GRAND HERO SECTION */}
      <section className="l-hero">
        <div className="container">
          <div className="l-hero-center reveal">
            <div className="l-hero-badge">
              <span className="l-hero-badge-dot"></span>
              <Cpu size={14} />
              <span>{t.heroBadge}</span>
            </div>

            <h1 className="l-hero-title">
              {t.heroTitle1} <br />
              <span className="l-gradient-text">{t.heroTitle2}</span>
            </h1>

            <p className="l-hero-desc">{t.heroDesc}</p>

            <div className="l-hero-cta">
              <button className="l-btn-primary" onClick={() => navigate('/register')}>
                <span>{t.heroCtaFree}</span>
                <ArrowRight size={18} />
              </button>

              <button
                className="l-btn-secondary"
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Play size={16} fill="currentColor" />
                <span>{t.heroCtaDemo}</span>
              </button>
            </div>

            <div className="l-hero-trust-row">
              <div className="trust-item">
                <CheckCircle2 size={15} color="#10B981" />
                <span>{t.heroTrust1}</span>
              </div>
              <div className="trust-divider">•</div>
              <div className="trust-item">
                <CheckCircle2 size={15} color="#10B981" />
                <span>{t.heroTrust2}</span>
              </div>
              <div className="trust-divider">•</div>
              <div className="trust-item">
                <CheckCircle2 size={15} color="#10B981" />
                <span>{t.heroTrust3}</span>
              </div>
            </div>
          </div>

          {/* 3. SHOWSTOPPING INTERACTIVE STUDIO SIMULATOR */}
          <div className="l-studio-showcase reveal" id="demo">
            <div className="showcase-window">
              {/* Window Titlebar */}
              <div className="showcase-titlebar">
                <div className="mac-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>

                <div className="showcase-tabs">
                  <button
                    className={`tab-btn ${activeTab === 'flow' ? 'active' : ''}`}
                    onClick={() => setActiveTab('flow')}
                  >
                    <Layers size={14} />
                    <span>{t.tabFlow}</span>
                  </button>

                  <button
                    className={`tab-btn ${activeTab === 'miniapp' ? 'active' : ''}`}
                    onClick={() => setActiveTab('miniapp')}
                  >
                    <Smartphone size={14} />
                    <span>{t.tabMiniApp}</span>
                  </button>

                  <button
                    className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ai')}
                  >
                    <Bot size={14} />
                    <span>{t.tabAI}</span>
                  </button>

                  <button
                    className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('payments')}
                  >
                    <CreditCard size={14} />
                    <span>{t.tabPay}</span>
                  </button>

                  <button
                    className={`tab-btn ${activeTab === 'crm' ? 'active' : ''}`}
                    onClick={() => setActiveTab('crm')}
                  >
                    <BarChart3 size={14} />
                    <span>{t.tabCRM}</span>
                  </button>
                </div>

                <div className="showcase-live-badge">
                  <span className="live-pulse"></span>
                  <span>LIVE DEMO</span>
                </div>
              </div>

              {/* Viewport Area */}
              <div className="showcase-viewport">
                {/* TAB 1: VISUAL NODE WORKFLOW EDITOR */}
                {activeTab === 'flow' && (
                  <div className="view-flow">
                    <div className="flow-canvas-mock">
                      {/* Node 1: Start Trigger */}
                      <div className="flow-node node-start">
                        <div className="node-head green">
                          <span className="node-icon">⚡</span>
                          <span className="node-type">TRIGGER</span>
                          <span className="node-status">LIVE</span>
                        </div>
                        <div className="node-body">
                          <div className="node-title">/start buyrug'i</div>
                          <div className="node-detail">Mijoz botga kirdi</div>
                        </div>
                        <div className="node-port out"></div>
                      </div>

                      <div className="flow-connector c1">
                        <div className="pulse-dot"></div>
                      </div>

                      {/* Node 2: AI Copilot Node */}
                      <div className="flow-node node-ai">
                        <div className="node-head cyan">
                          <span className="node-icon">🤖</span>
                          <span className="node-type">AI COPILOT</span>
                          <span className="node-status">ACTIVE</span>
                        </div>
                        <div className="node-body">
                          <div className="node-title">Mazaika AI Agent</div>
                          <div className="node-detail">DeepSeek R1 • Mijozni tahlil qilish</div>
                        </div>
                        <div className="node-port in"></div>
                        <div className="node-port out"></div>
                      </div>

                      <div className="flow-connector c2">
                        <div className="pulse-dot"></div>
                      </div>

                      {/* Node 3: Mini App Catalog Node */}
                      <div className="flow-node node-miniapp">
                        <div className="node-head purple">
                          <span className="node-icon">📱</span>
                          <span className="node-type">WEB APP</span>
                          <span className="node-status">SYNCED</span>
                        </div>
                        <div className="node-body">
                          <div className="node-title">Mini App Katalog</div>
                          <div className="node-detail">Taomlar menyusi va savatcha</div>
                        </div>
                        <div className="node-port in"></div>
                        <div className="node-port out"></div>
                      </div>

                      <div className="flow-connector c3">
                        <div className="pulse-dot"></div>
                      </div>

                      {/* Node 4: Payme Checkout Node */}
                      <div className="flow-node node-pay">
                        <div className="node-head amber">
                          <span className="node-icon">💳</span>
                          <span className="node-type">PAYMENT</span>
                          <span className="node-status">AUTO</span>
                        </div>
                        <div className="node-body">
                          <div className="node-title">Payme / Click Invoys</div>
                          <div className="node-detail">45 000 UZS • Avto tekshiruv</div>
                        </div>
                        <div className="node-port in"></div>
                        <div className="node-port out"></div>
                      </div>

                      <div className="flow-connector c4">
                        <div className="pulse-dot"></div>
                      </div>

                      {/* Node 5: Google Sheets & CRM */}
                      <div className="flow-node node-crm">
                        <div className="node-head pink">
                          <span className="node-icon">📊</span>
                          <span className="node-type">CRM SYNC</span>
                          <span className="node-status">200 OK</span>
                        </div>
                        <div className="node-body">
                          <div className="node-title">CRM & Google Sheets</div>
                          <div className="node-detail">Buyurtma #8491 yozildi</div>
                        </div>
                        <div className="node-port in"></div>
                      </div>
                    </div>

                    {/* Flow Sidebar Inspector */}
                    <div className="flow-inspector">
                      <div className="inspector-head">
                        <span>Blok Xususiyatlari</span>
                        <span className="badge-type">ReactFlow 12</span>
                      </div>
                      <div className="inspector-field">
                        <label>ID</label>
                        <code>node_ai_agent_04</code>
                      </div>
                      <div className="inspector-field">
                        <label>Mantiq modeli</label>
                        <div className="inspector-value">DeepSeek-R1 (16K Context)</div>
                      </div>
                      <div className="inspector-field">
                        <label>Navbatdagi harakat</label>
                        <div className="inspector-value">Mini App do'konini ochish</div>
                      </div>
                      <div className="inspector-action">
                        <button className="btn-test-run" onClick={() => setActiveTab('miniapp')}>
                          <Play size={13} fill="currentColor" />
                          <span>Ushbu oqimni sinash →</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: INTERACTIVE TELEGRAM MINI APP STORE */}
                {activeTab === 'miniapp' && (
                  <div className="view-miniapp">
                    <div className="telegram-app-phone">
                      {/* Telegram Chat Header */}
                      <div className="tg-header">
                        <div className="tg-avatar">☕</div>
                        <div className="tg-info">
                          <div className="tg-title">Mazaika Coffee & Bakery</div>
                          <div className="tg-sub">Telegram Mini App • bot</div>
                        </div>
                        <div className="tg-close">✕</div>
                      </div>

                      {/* Telegram WebApp Content */}
                      <div className="tg-body">
                        {addedNotice && (
                          <div className="tg-toast">{addedNotice}</div>
                        )}

                        <div className="tg-banner">
                          <div className="tg-banner-tag">🔥 20% Chegirma</div>
                          <div className="tg-banner-title">Birinchi buyurtmangiz uchun</div>
                        </div>

                        <div className="tg-section-title">Katalog & Mahsulotlar</div>

                        <div className="tg-product-list">
                          <div className="tg-product-card">
                            <div className="prod-img">☕</div>
                            <div className="prod-info">
                              <div className="prod-name">Americano Roast</div>
                              <div className="prod-desc">100% Arabica, 250ml</div>
                              <div className="prod-price">18 000 so'm</div>
                            </div>
                            <button
                              className="prod-btn"
                              onClick={() => handleAddToCart('Americano Roast', 18000)}
                            >
                              + Savatga
                            </button>
                          </div>

                          <div className="tg-product-card">
                            <div className="prod-img">🍰</div>
                            <div className="prod-info">
                              <div className="prod-name">San Sebastian Cake</div>
                              <div className="prod-desc">Ispaniyacha shirinlik</div>
                              <div className="prod-price">32 000 so'm</div>
                            </div>
                            <button
                              className="prod-btn"
                              onClick={() => handleAddToCart('San Sebastian', 32000)}
                            >
                              + Savatga
                            </button>
                          </div>

                          <div className="tg-product-card">
                            <div className="prod-img">🥐</div>
                            <div className="prod-info">
                              <div className="prod-name">Kruassan Shokoladli</div>
                              <div className="prod-desc">Yangi pishirilgan</div>
                              <div className="prod-price">16 000 so'm</div>
                            </div>
                            <button
                              className="prod-btn"
                              onClick={() => handleAddToCart('Kruassan', 16000)}
                            >
                              + Savatga
                            </button>
                          </div>
                        </div>

                        {/* Telegram MainButton Checkout Bar */}
                        <div
                          className="tg-main-button"
                          onClick={() => setActiveTab('payments')}
                        >
                          <span>Buyurtma berish ({cartCount} ta)</span>
                          <span className="main-btn-price">{cartTotal.toLocaleString()} UZS →</span>
                        </div>
                      </div>
                    </div>

                    <div className="miniapp-explainer">
                      <h3>Telegram ichidagi to'liq veb-ilova (Mini App)</h3>
                      <p>
                        Foydalanuvchi Telegram ilovasidan chiqmasdan tovarlarni tanlaydi,
                        savatga soladi va to'lovni amalga oshiradi. Mazaika vizual konstruktorida
                        o'zgartirilgan har qanday narx bir zumda WebAppda yangilanadi.
                      </p>
                      <div className="feature-checklist">
                        <div><Check size={16} color="#00D9FF" /> Real vaqtda katalog yangilanishi</div>
                        <div><Check size={16} color="#00D9FF" /> Telegram foydalanuvchi ma'lumotlari bilan avto-kirish</div>
                        <div><Check size={16} color="#00D9FF" /> Payme va Click orqali 1-bosishda to'lov</div>
                      </div>
                      <button className="btn-accent-glow" onClick={() => setActiveTab('payments')}>
                        To'lov jarayonini ko'rish →
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: MAZAIKA AI COPILOT SIMULATOR */}
                {activeTab === 'ai' && (
                  <div className="view-ai">
                    <div className="ai-sim-left">
                      <div className="ai-sim-header">
                        <Sparkles size={18} color="#00D9FF" />
                        <span>Mazaika AI Architect (DeepSeek-R1)</span>
                      </div>
                      <p className="ai-sim-desc">
                        O'zbek yoki rus tilida biznesingizni tasvirlang. AI to'liq bot mantig'ini,
                        bloklarni va Mini App kodini 30 soniyada o'zi yaratib beradi.
                      </p>

                      <div className="ai-prompt-box">
                        <div className="prompt-label">AI Buyrug'i:</div>
                        <div className="prompt-text">
                          "Yetkazib berish xizmatiga ega pitsaxona uchun Telegram-bot va Mini App yarat.
                          Menyuda 5 xil pitsa bo'lsin, Payme orqali to'lov va manzil so'rash bloki ulansin."
                        </div>
                        <button
                          className={`btn-generate ${aiGenerating ? 'loading' : ''}`}
                          onClick={handleTriggerAISimulation}
                        >
                          {aiGenerating ? (
                            <>
                              <Loader2 size={16} className="spin" />
                              <span>Generatsiya qilinmoqda...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles size={16} />
                              <span>AI bilan bot yaratishni boshlash</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="ai-sim-right">
                      <div className="ai-console">
                        <div className="console-bar">
                          <span className="dot red"></span>
                          <span className="dot yellow"></span>
                          <span className="dot green"></span>
                          <span className="console-title">ai-architect-runtime.ts</span>
                        </div>
                        <div className="console-content">
                          <div className="log-line">
                            <span className="time">00:01</span>
                            <span className="msg ok">✓ Prompt qabul qilindi va tahlil qilindi</span>
                          </div>

                          {aiStep >= 1 && (
                            <div className="log-line anim">
                              <span className="time">00:02</span>
                              <span className="msg info">🤖 DeepSeek-R1: 8 ta blok va 12 ta mantiqiy yo'l loyihalashtirilmoqda...</span>
                            </div>
                          )}

                          {aiStep >= 2 && (
                            <div className="log-line anim">
                              <span className="time">00:03</span>
                              <span className="msg ok">✓ Telegram Mini App katalogi generatsiya qilindi (HTML5 + CSS + JS)</span>
                            </div>
                          )}

                          {aiStep >= 3 && (
                            <div className="log-line anim">
                              <span className="time">00:04</span>
                              <span className="msg ok">✓ Payme & Click billing moduli avtomatik ulandi</span>
                            </div>
                          )}

                          {aiStep >= 4 && (
                            <div className="log-line success anim">
                              <span className="time">00:05</span>
                              <span className="msg success">🚀 TAYYOR! Bot 100% ishlashga tayyor. Telegram tokenini kiriting.</span>
                            </div>
                          )}

                          <div className="console-code">
                            <pre>{`// Mazaika AI Generated Flow
const PizzaBotFlow = {
  trigger: "/start",
  language: "UZ",
  components: ["Catalog", "LocationPicker", "PaymeCheckout"],
  security: "SHA-256 Verified"
};`}</pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: PAYME & CLICK CHECKOUT */}
                {activeTab === 'payments' && (
                  <div className="view-payments">
                    <div className="payment-receipt-card">
                      <div className="receipt-header">
                        <div className="receipt-brand">
                          <CreditCard size={20} color="#10B981" />
                          <span>Telegram To'lov Invoysi</span>
                        </div>
                        <span className="receipt-badge">Rasmiy Hamkorlik</span>
                      </div>

                      <div className="receipt-amount-box">
                        <div className="label">To'lov summasi:</div>
                        <div className="amount">66 000 UZS</div>
                        <div className="order-id">Buyurtma #MZ-88219 • Mazaika Cafe</div>
                      </div>

                      <div className="payment-gateways">
                        <div className="gateway-card active">
                          <span className="gw-logo">💳 Payme</span>
                          <span className="gw-fee">0% komissiya</span>
                        </div>
                        <div className="gateway-card">
                          <span className="gw-logo">⚡ Click Up</span>
                          <span className="gw-fee">0% komissiya</span>
                        </div>
                        <div className="gateway-card">
                          <span className="gw-logo">🏦 Uzum Bank</span>
                          <span className="gw-fee">Keshbek 2%</span>
                        </div>
                      </div>

                      <button
                        className="btn-pay-action"
                        onClick={() => alert("To'lov muvaffaqiyatli sinovdan o'tdi! ✅")}
                      >
                        <CheckCircle2 size={18} />
                        <span>Payme orqali 66 000 UZS to'lash</span>
                      </button>

                      <div className="security-note">
                        <Shield size={14} color="#10B981" />
                        <span>Fiskal chek va QR-kod avtomatik ravishda mijozga yuboriladi</span>
                      </div>
                    </div>

                    <div className="payments-info">
                      <h3>O'zbekistonning barcha milliy to'lovlari bir joyda</h3>
                      <p>
                        Dasturchilarsiz, murakkab bank shartnomalarisiz Payme, Click va Uzum
                        tizimlarini botingizga ulang. Xaridor to'lovni amalga oshirishi bilan
                        bot darhol buyurtmani oshxonaga yoki kuryerga yo'naltiradi.
                      </p>
                      <ul className="pay-benefits">
                        <li><span>✓</span> Avtomatik invoys yuborish va tekshirish</li>
                        <li><span>✓</span> Soliq qo'mitasi talabiga binoan fiskalizatsiya</li>
                        <li><span>✓</span> Qisman to'lov yoki oldindan to'lov (pre-order) funksiyasi</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* TAB 5: LIVE CRM & ANALYTICS */}
                {activeTab === 'crm' && (
                  <div className="view-crm">
                    <div className="crm-stats-row">
                      <div className="crm-stat-card">
                        <div className="stat-name">Bugungi savdo</div>
                        <div className="stat-val">3 420 000 UZS</div>
                        <div className="stat-delta green">+24.5% o'sish</div>
                      </div>
                      <div className="crm-stat-card">
                        <div className="stat-name">Faol foydalanuvchilar</div>
                        <div className="stat-val">1 428 nafar</div>
                        <div className="stat-delta green">+120 yangi mijoz</div>
                      </div>
                      <div className="crm-stat-card">
                        <div className="stat-name">Konversiya (Savat ➔ To'lov)</div>
                        <div className="stat-val">68.2%</div>
                        <div className="stat-delta green">+5.4% o'sish</div>
                      </div>
                    </div>

                    <div className="crm-chat-preview">
                      <div className="crm-chat-head">
                        <div className="chat-user-badge">
                          <span className="dot green"></span>
                          <span>Dilshod Karimov (@dilshod_k) — Jonli suhbat</span>
                        </div>
                        <button className="btn-takeover">
                          <MessageSquare size={13} />
                          <span>Operator sifatida chatga kirish</span>
                        </button>
                      </div>
                      <div className="crm-chat-body">
                        <div className="c-bubble bot">
                          Assalomu alaykum! Buyurtmangiz #MZ-88219 qabul qilindi. Kuryer 20 daqiqada yetkazadi 🛵
                        </div>
                        <div className="c-bubble user">
                          Rahmat! Manzilim: Mirobod tumani, 4-uy.
                        </div>
                        <div className="c-bubble system">
                          ⚡ Mazaika CRM: Buyurtma holati "Yetkazilmoqda" ga o'zgartirildi
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTEGRATIONS MARQUEE (ENTERPRISE TRUST) */}
      <section className="l-marquee-section">
        <div className="container">
          <div className="marquee-caption">
            <span>Rasmiy va to'g'ridan-to'g'ri integratsiyalar:</span>
          </div>
        </div>
        <div className="l-marquee-track">
          {[
            { icon: '💳', name: 'Payme Direct' },
            { icon: '⚡', name: 'Click Up' },
            { icon: '🏦', name: 'Uzum Bank' },
            { icon: '📱', name: 'Telegram WebApps SDK' },
            { icon: '📊', name: 'Google Sheets' },
            { icon: '🤖', name: 'DeepSeek-R1 AI' },
            { icon: '🌐', name: 'REST Webhooks API' },
            { icon: '🏢', name: 'Yclients CRM' },
            { icon: '🎓', name: 'GetCourse' },
            { icon: '⚡', name: 'JavaScript Engine' },
            { icon: '💳', name: 'Payme Direct' },
            { icon: '⚡', name: 'Click Up' },
            { icon: '🏦', name: 'Uzum Bank' },
            { icon: '📱', name: 'Telegram WebApps SDK' },
            { icon: '📊', name: 'Google Sheets' },
          ].map((item, i) => (
            <div key={i} className="l-marquee-item">
              <span className="marquee-icon">{item.icon}</span>
              <span className="marquee-text">{item.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. INVESTOR BENTO GRID (Deep Product Architecture) */}
      <section className="l-bento-section" id="features">
        <div className="container">
          <div className="section-header reveal">
            <div className="l-section-badge">
              <Layers size={13} />
              <span>{t.bentoBadge}</span>
            </div>
            <h2>
              {t.bentoTitle1} <span className="l-gradient-text">{t.bentoTitle2}</span>
            </h2>
            <p>{t.bentoDesc}</p>
          </div>

          <div className="bento-grid">
            {/* Bento Card 1: Visual Node Workflow (2-Col) */}
            <div className="bento-card bento-col-2 reveal">
              <div className="bento-glow"></div>
              <div className="bento-content">
                <div className="bento-tag">22+ BLOK TURLARI</div>
                <h3>Vizual No-Code Sxema Redaktori</h3>
                <p>
                  Mantiqiy shartlar (If/Else), foydalanuvchi ma'lumotlarini yig'ish,
                  avtomatik taymerlar va API so'rovlar. Barchasi sichqoncha yordamida ulanadi.
                </p>
                <div className="bento-feature-pills">
                  <span>✦ Shartli o'tishlar</span>
                  <span>✦ Dinamik o'zgaruvchilar</span>
                  <span>✦ O'rnatilgan JS skriptlar</span>
                </div>
              </div>
              <div className="bento-visual flow-visual-mini">
                <div className="mini-node n1">▶ /start</div>
                <div className="mini-line"></div>
                <div className="mini-node n2">🔀 Shart: Shaxar?</div>
                <div className="mini-line"></div>
                <div className="mini-node n3">💳 Payme Invoys</div>
              </div>
            </div>

            {/* Bento Card 2: Telegram Mini Apps */}
            <div className="bento-card reveal">
              <div className="bento-glow"></div>
              <div className="bento-tag">WEB APPS 3.0</div>
              <div className="bento-icon-lg">📱</div>
              <h3>Telegram Mini App Do'koni</h3>
              <p>
                Sayt va Telegram-botingiz uchun yagona ma'lumotlar bazasi.
                Mazaikada tovar narxini o'zgartiring — botda ham, Mini Appda ham bir vaqtda yangilanadi.
              </p>
              <div className="bento-highlight-stat">
                <div className="num">100%</div>
                <div className="sub">Mobile-First moslashuv</div>
              </div>
            </div>

            {/* Bento Card 3: DeepSeek-R1 AI */}
            <div className="bento-card reveal">
              <div className="bento-glow"></div>
              <div className="bento-tag">DEEPSEEK-R1</div>
              <div className="bento-icon-lg">🤖</div>
              <h3>Mazaika AI Copilot</h3>
              <p>
                Shunchaki o'zbek yoki rus tilida bot vazifasini yozing.
                AI arxitektor bir zumda to'liq mantiqni yaratib beradi va xatolarni to'g'irlaydi.
              </p>
              <div className="bento-highlight-stat">
                <div className="num">15 soniya</div>
                <div className="sub">Bot arxitekturasi tayyor</div>
              </div>
            </div>

            {/* Bento Card 4: Uzbek Payments */}
            <div className="bento-card reveal">
              <div className="bento-glow"></div>
              <div className="bento-tag">MILLIY TO'LOVLAR</div>
              <div className="bento-icon-lg">💳</div>
              <h3>Payme & Click Avtomatizatsiyasi</h3>
              <p>
                To'g'ridan-to'g'ri hisob-kitob. Pul to'g'ridan-to'g'ri sizning hisob raqamingizga tushadi.
                Mazaika tranzaksiyalardan ortiqcha komissiya ushlab qolmaydi.
              </p>
              <div className="bento-highlight-stat">
                <div className="num">0 so'm</div>
                <div className="sub">Platforma tranzaksiya komissiyasi</div>
              </div>
            </div>

            {/* Bento Card 5: Real-time CRM (2-Col) */}
            <div className="bento-card bento-col-2 reveal">
              <div className="bento-glow"></div>
              <div className="bento-content">
                <div className="bento-tag">CRM & BIRGALIKDA ISHLASH</div>
                <h3>Omnichannel CRM va Jonli Chatlar</h3>
                <p>
                  Mijozlaringiz xabarlarini bitta oynada ko'ring. Operator istalgan soniyada
                  botdan suhbatni o'z qo'liga olishi va xaridorni yopishi mumkin.
                  Barcha aloqalar va telefon raqamlar avtomatik Excel va Google Sheets ga eksport qilinadi.
                </p>
                <div className="bento-feature-pills">
                  <span>✦ 1-tugmada operatorga uzatish</span>
                  <span>✦ Mijozlar segmentatsiyasi</span>
                  <span>✦ Google Sheets eksport</span>
                </div>
              </div>
              <div className="bento-visual crm-visual-mini">
                <div className="crm-badge-active">🟢 1 428 ta kontakt yozib olindi</div>
                <div className="crm-export-btn">📊 Sheets bilan sinxron</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRACTION METRICS (INVESTOR PROOF) */}
      <section className="l-stats-showcase">
        <div className="container">
          <div className="stats-showcase-grid reveal">
            <div className="showcase-stat" style={{ '--s-color': '#00D9FF' } as React.CSSProperties}>
              <div className="showcase-value">500+</div>
              <div className="showcase-label">{t.statsBusinesses}</div>
              <div className="showcase-footnote">O'zbekiston bo'ylab faol kompaniyalar</div>
            </div>

            <div className="showcase-stat" style={{ '--s-color': '#7C3AED' } as React.CSSProperties}>
              <div className="showcase-value">1.2M+</div>
              <div className="showcase-label">{t.statsMessages}</div>
              <div className="showcase-footnote">Xatosiz uzatilgan tranzaksiyalar</div>
            </div>

            <div className="showcase-stat" style={{ '--s-color': '#10B981' } as React.CSSProperties}>
              <div className="showcase-value">99.98%</div>
              <div className="showcase-label">{t.statsUptime}</div>
              <div className="showcase-footnote">Klaus-server kafolati</div>
            </div>

            <div className="showcase-stat" style={{ '--s-color': '#F59E0B' } as React.CSSProperties}>
              <div className="showcase-value">15 min</div>
              <div className="showcase-label">{t.statsTime}</div>
              <div className="showcase-footnote">G'oyadan birinchi buyurtmagacha</div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. COMPARISON TABLE ("NEGA MAZAIKA?") */}
      <section className="l-comparison-section" id="comparison">
        <div className="container">
          <div className="section-header reveal">
            <div className="l-section-badge">
              <Shield size={13} />
              <span>{t.compBadge}</span>
            </div>
            <h2>
              {t.compTitle1} <span className="l-gradient-text">{t.compTitle2}</span>
            </h2>
            <p>{t.compDesc}</p>
          </div>

          <div className="comparison-table-wrap reveal">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th className="th-feat">Xususiyat / Imkoniyat</th>
                  <th className="th-agency">Dasturchi / Agentlik</th>
                  <th className="th-others">Xorijiy konstruktorlar</th>
                  <th className="th-mazaika">
                    <div className="mazaika-header-tag">
                      <Sparkles size={14} />
                      <span>MAZAIKA 2.0</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="feat-title">Ishga tushirish narxi</td>
                  <td className="agency-val">$1 500 – $5 000+</td>
                  <td className="others-val">$50 – $150 / oy</td>
                  <td className="mazaika-val highlighted">0 so'm (Bepul tarif)</td>
                </tr>
                <tr>
                  <td className="feat-title">Tayyor bo'lish muddati</td>
                  <td className="agency-val">1 oydan 3 oygacha</td>
                  <td className="others-val">3 – 7 kun</td>
                  <td className="mazaika-val highlighted">15 daqiqada</td>
                </tr>
                <tr>
                  <td className="feat-title">Payme & Click milliy to'lovlari</td>
                  <td className="agency-val">Qimmat API integratsiya</td>
                  <td className="others-val">❌ Umuman mavjud emas</td>
                  <td className="mazaika-val highlighted">✅ O'rnatilgan (1-bosishda)</td>
                </tr>
                <tr>
                  <td className="feat-title">Telegram Mini App (WebApp) do'koni</td>
                  <td className="agency-val">Alohida frontend kerak</td>
                  <td className="others-val">❌ Faqat oddiy matnli bot</td>
                  <td className="mazaika-val highlighted">✅ To'liq vizual do'kon</td>
                </tr>
                <tr>
                  <td className="feat-title">O'zbek tilidagi interfeys va AI</td>
                  <td className="agency-val">❌ Yo'q</td>
                  <td className="others-val">❌ Faqat Ingliz/Rus</td>
                  <td className="mazaika-val highlighted">✅ To'liq O'zbek, Rus, Ingliz</td>
                </tr>
                <tr>
                  <td className="feat-title">DeepSeek-R1 AI arxitektori</td>
                  <td className="agency-val">❌ Mavjud emas</td>
                  <td className="others-val">Pulli qo'shimcha plagin</td>
                  <td className="mazaika-val highlighted">✅ Barcha foydalanuvchilarga</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 8. STEP-BY-STEP WORKFLOW */}
      <section className="l-how-it-works">
        <div className="container">
          <div className="section-header reveal">
            <div className="l-section-badge">
              <Zap size={13} />
              <span>{t.howBadge}</span>
            </div>
            <h2>
              {t.howTitle1} <span className="l-gradient-text">{t.howTitle2}</span>
            </h2>
          </div>

          <div className="how-steps">
            <div className="how-step reveal">
              <div className="how-step-number">01</div>
              <div className="how-step-icon">✍️</div>
              <h3>Bloklarni ulang yoki AI ga ayting</h3>
              <p>
                Visual drag-and-drop orqali xabar, tugma va shartlarni joylashtiring
                yoki shunchaki "Pitsa yetkazish boti" deb yozing.
              </p>
            </div>

            <div className="how-connector"></div>

            <div className="how-step reveal" style={{ transitionDelay: '150ms' }}>
              <div className="how-step-number">02</div>
              <div className="how-step-icon">💳</div>
              <h3>Katalog va Payme to'lovlarini ulang</h3>
              <p>
                Mahsulotlaringiz rasmlari va narxlarini kiriting.
                Payme yoki Click billing ma'lumotlarini biriktiring.
              </p>
            </div>

            <div className="how-connector"></div>

            <div className="how-step reveal" style={{ transitionDelay: '300ms' }}>
              <div className="how-step-number">03</div>
              <div className="how-step-icon">🚀</div>
              <h3>1-bosishda Telegramda ishga tushiring</h3>
              <p>
                BotFather'dan olingan tokenni joylashtiring.
                Botingiz va Mini Appingiz shu zahotiyoq butun dunyodan buyurtmalarni qabul qiladi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. PRICING SECTION */}
      <section className="pricing-premium" id="pricing">
        <div className="container">
          <div className="section-header reveal">
            <div className="l-section-badge">
              <CreditCard size={13} />
              <span>{t.pricingBadge}</span>
            </div>
            <h2>
              {t.pricingTitle1} <span className="l-gradient-text">{t.pricingTitle2}</span>
            </h2>
            <p>{t.pricingDesc}</p>

            {/* Monthly / Yearly Toggle */}
            <div className="pricing-toggle-wrap">
              <span className={!isYearly ? 'active' : ''}>{t.monthly}</span>
              <div
                className={`toggle-pill ${isYearly ? 'yearly' : ''}`}
                onClick={() => setIsYearly(!isYearly)}
              >
                <div className="toggle-thumb"></div>
              </div>
              <span className={isYearly ? 'active' : ''}>
                {t.yearly}
                <span className="badge-discount">-20%</span>
              </span>
            </div>
          </div>

          <div className="pricing-cards">
            {/* Free Tier */}
            <div className="price-card reveal">
              <h3 className="plan-name">Boshlang'ich</h3>
              <p className="plan-desc">Sinab ko'rish va startaplar uchun</p>
              <div className="plan-price">
                <span className="amount">0</span>
                <span className="period"> so'm / doimiy bepul</span>
              </div>
              <div className="plan-divider"></div>
              <ul className="plan-features">
                <li><span className="check">✓</span> 1 ta faol Telegram-bot</li>
                <li><span className="check">✓</span> 500 ta kontaktlar bazasi</li>
                <li><span className="check">✓</span> Asosiy bloklar (xabar, savol, tugma)</li>
                <li><span className="check">✓</span> Drag & Drop visual muharrir</li>
                <li><span className="check">✓</span> Mazaika hamjamiyati forumi</li>
              </ul>
              <button className="btn-secondary-glass" onClick={() => navigate('/register')}>
                Bepul boshlash
              </button>
            </div>

            {/* Pro Tier (Popular) */}
            <div className="price-card popular reveal" style={{ transitionDelay: '100ms' }}>
              <div className="popular-tag">Eng Ommabop Tanlov ⭐</div>
              <h3 className="plan-name">Pro</h3>
              <p className="plan-desc">O'sayotgan biznes va do'konlar uchun</p>
              <div className="plan-price">
                <span className="amount">
                  {isYearly ? '119 000' : '149 000'}
                </span>
                <span className="period"> so'm / oy</span>
              </div>
              <div className="plan-divider"></div>
              <ul className="plan-features">
                <li><span className="check">✓</span> 5 ta professional bot</li>
                <li><span className="check">✓</span> 5 000 ta kontaktlar</li>
                <li><span className="check">✓</span> Barcha 22+ blok turlari</li>
                <li><span className="check">✓</span> <strong>Payme & Click to'lovlari</strong></li>
                <li><span className="check">✓</span> <strong>Telegram Mini App (Do'kon)</strong></li>
                <li><span className="check">✓</span> Mazaika AI Copilot (DeepSeek)</li>
                <li><span className="check">✓</span> Google Sheets va Webhook</li>
              </ul>
              <button className="btn-primary-neon" onClick={() => navigate('/register')}>
                Pro tarifini tanlash →
              </button>
            </div>

            {/* Business Tier */}
            <div className="price-card reveal" style={{ transitionDelay: '200ms' }}>
              <h3 className="plan-name">Biznes</h3>
              <p className="plan-desc">Yirik korxonalar va tarmoqlar uchun</p>
              <div className="plan-price">
                <span className="amount">
                  {isYearly ? '199 000' : '249 000'}
                </span>
                <span className="period"> so'm / oy</span>
              </div>
              <div className="plan-divider"></div>
              <ul className="plan-features">
                <li><span className="check">✓</span> 20 ta bot va cheksiz Mini App</li>
                <li><span className="check">✓</span> 50 000 ta kontaktlar</li>
                <li><span className="check">✓</span> White-label (brendingizsiz)</li>
                <li><span className="check">✓</span> Ko'p operatorli jonli CRM chatlar</li>
                <li><span className="check">✓</span> Yclients va GetCourse integratsiyasi</li>
                <li><span className="check">✓</span> Maxsus server va 24/7 VIP qo'llab-quvvatlash</li>
              </ul>
              <button className="btn-secondary-glass" onClick={() => navigate('/register')}>
                Biznes tarifini tanlash →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FAQ ACCORDION SECTION */}
      <section className="l-faq-section" id="faq">
        <div className="container">
          <div className="section-header reveal">
            <div className="l-section-badge">
              <MessageSquare size={13} />
              <span>{t.faqBadge}</span>
            </div>
            <h2>
              {t.faqTitle1} <span className="l-gradient-text">{t.faqTitle2}</span>
            </h2>
          </div>

          <div className="faq-list reveal">
            {[
              {
                q: "Mazaika bilan bot yaratish uchun dasturlashni bilish shartmi?",
                a: "Yo'q, mutlaqo shart emas! Mazaika 100% No-Code platforma hisoblanadi. Siz vizual bloklarni sichqoncha yordamida bir-biriga ulaysiz yoki shunchaki AI yordamchisiga o'zbek tilida qanday bot kerakligini aytasiz."
              },
              {
                q: "Payme va Click to'lovlari qanday ishlaydi? Komissiya bormi?",
                a: "Mazaika to'lovlardan hech qanday platforma komissiyasi olmaydi. To'langan mablag' to'g'ridan-to'g'ri sizning Payme/Click merchant hisobingizga tushadi. Bot avtomatik ravishda to'lov holatini tekshiradi va xaridorga chek beradi."
              },
              {
                q: "Telegram Mini App nima va u oddiy botdan nimasi bilan farq qiladi?",
                a: "Telegram Mini App — bu to'g'ridan-to'g'ri Telegram ichida ochiladigan zamonaviy internet-do'kon yoki xizmat ilovasi. Foydalanuvchi ilovadan chiqmasdan chiroyli rasm va tavsiflarga ega tovarlarni ko'radi, savatga yig'adi va to'laydi."
              },
              {
                q: "Mening botim serverlar to'xtaganda ham ishlayveradimi?",
                a: "Ha! Mazaika xalqaro kloud-serverlarda ishlaydi va 99.98% uptime kafolatini beradi. Barcha ma'lumotlar real-vaqtda Firebase va xavfsiz PostgreSQL bazalariga zaxiralanadi."
              },
              {
                q: "Bepul tarifdan qachongacha foydalanishim mumkin?",
                a: "Boshlang'ich tarif mutlaqo cheksiz muddatga bepul. Siz istalgan vaqtda 500 kontaktdan oshganingizda yoki qo'shimcha imkoniyatlar kerak bo'lganda Pro tarifiga o'tishingiz mumkin."
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className={`faq-item ${openFaq === idx ? 'open' : ''}`}
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <div className="faq-question">
                  <span>{item.q}</span>
                  <div className="faq-icon">
                    {openFaq === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
                {openFaq === idx && (
                  <div className="faq-answer">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. GRAND FINAL CTA BANNER */}
      <section className="l-cta-section">
        <div className="container">
          <div className="l-cta-inner reveal">
            <div className="cta-ambient-glow"></div>
            <div className="cta-badge">
              <Sparkles size={14} color="#00D9FF" />
              <span>{t.ctaBadge}</span>
            </div>

            <h2>
              {t.ctaTitle1} <br />
              <span className="l-gradient-text">{t.ctaTitle2}</span>
            </h2>

            <p>{t.ctaDesc}</p>

            <div className="cta-btn-group">
              <button className="btn-cta-grand" onClick={() => navigate('/register')}>
                <span>{t.ctaBtn}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 12. CORPORATE FOOTER */}
      <footer className="footer-premium">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand-col">
              <div className="footer-logo">
                <div className="l-logo-icon">
                  <Sparkles size={15} color="#00D9FF" />
                </div>
                <span>Mazaika</span>
                <span className="footer-badge">SaaS</span>
              </div>
              <p className="footer-desc">{t.footerDesc}</p>
              <div className="footer-status-pill">
                <span className="dot green"></span>
                <span>Barcha tizimlar barqaror ishlamoqda</span>
              </div>
            </div>

            <div className="footer-col">
              <h4>Mahsulot</h4>
              <a href="#features">Vizual Konstruktor</a>
              <a href="#demo">Telegram Mini Apps</a>
              <a href="#demo">Mazaika AI Copilot</a>
              <a href="#demo">Payme & Click Billing</a>
            </div>

            <div className="footer-col">
              <h4>Kompaniya</h4>
              <a href="#comparison">Taqqoslash</a>
              <a href="#pricing">Tariflar va Narxlar</a>
              <a href="#faq">Savol-Javob</a>
              <a href="/login">Shaxsiy Kabinet</a>
            </div>

            <div className="footer-col">
              <h4>Huquqiy</h4>
              <a href="#">Foydalanish shartlari</a>
              <a href="#">Maxfiylik siyosati</a>
              <a href="#">Xavfsizlik & SLA</a>
              <a href="#">Investorlar uchun brief</a>
            </div>
          </div>

          <div className="footer-bottom">
            <div>{t.footerCopy}</div>
            <div className="footer-lang-status">
              <span>🇺🇿 Toshkent, O'zbekiston</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
