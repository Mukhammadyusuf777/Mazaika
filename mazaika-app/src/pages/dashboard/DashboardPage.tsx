import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, Bot, Settings, BarChart2, Zap, MessageSquare, 
  TrendingUp, Users, Activity, Globe, Trash2, Sparkles, 
  AppWindow, Search, Copy, Check, ExternalLink, ArrowRight, 
  Cpu, LogOut, Smartphone, Eye
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/useAuthStore'
import { auth } from '../../api/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { getBotsByUser, createBot, deleteBot, createOrUpdateUser } from '../../api/firestore'
import { getLiveSiteUrl } from '../../api/backendApi'
import { useTranslation } from '../../hooks/useTranslation'
import type { Language } from '../../i18n/translations'
import DonateModal from '../../components/modals/DonateModal'
import TermsModal from '../../components/modals/TermsModal'
import ConnectBotModal from '../../components/modals/ConnectBotModal'
import './DashboardPage.css'

interface TemplateItem {
  id: string
  name: string
  emoji: string
  color: string
  desc: string
  category: 'ecommerce' | 'service' | 'ai' | 'food' | 'education'
  tag: string
}

const TEMPLATES: TemplateItem[] = [
  { id: 'shop', name: "Интернет-магазин", emoji: '🛒', color: '#00D9FF', desc: "Витрина Telegram Mini App, корзина и прием оплат Payme/Click/ЮKassa", category: 'ecommerce', tag: 'Топ Выбор' },
  { id: 'delivery', name: 'Служба доставки', emoji: '🚚', color: '#00F5C4', desc: "Прием заказов, геолокация и оповещения курьеров", category: 'service', tag: 'Быстрый' },
  { id: 'restaurant', name: 'Ресторан & Кафе', emoji: '🍕', color: '#F59E0B', desc: "Интерактивное меню, бронь столов и авто-расчет чека", category: 'food', tag: 'Популярный' },
  { id: 'ai-faq', name: 'Mazaika AI Консультант', emoji: '🤖', color: '#7C3AED', desc: "Умный LLM-бот 24/7 с ответами на вопросы клиентов", category: 'ai', tag: 'DeepSeek-R1' },
  { id: 'courses', name: 'Онлайн-школа & Курсы', emoji: '🎓', color: '#EC4899', desc: "Каталог уроков, видеоматериалы и прием платежей", category: 'education', tag: 'Автоматика' },
  { id: 'referral', name: 'Рефералы & Кэшбэк', emoji: '🤝', color: '#10B981', desc: "Многоуровневая реферальная система, баллы и бонусы", category: 'service', tag: "Вирусный рост" },
]

const QUICK_PROMPT_PILLS = [
  { text: "🛒 Интернет-магазин Mini App", prompt: "Создай стильный магазин одежды и аксессуаров в виде Telegram Mini App с корзиной и чекаутом" },
  { text: '🍕 Доставка пиццы & FastFood', prompt: 'Создай бота пиццерии с интерактивным меню, корзиной, выбором соусов и геолокацией' },
  { text: "🎓 IT Курсы и онлайн-оплата", prompt: "Создай бота для академии программирования с каталогом курсов, записью на пробный урок и оплатой" },
  { text: '🤖 24/7 AI Консультант', prompt: "Создай умного AI-ассистента для поддержки клиентов компании, который отвечает на любые вопросы о сервисе" },
  { text: '💼 CRM & Сбор лидов', prompt: "Создай удобного бота для сбора заявок, квалификации клиентов и мгновенной отправки лидов операторам" }
]

const MOCK_ANALYTICS_DATA = [
  { name: 'Пн', users: 420, msgs: 1200 },
  { name: 'Вт', users: 510, msgs: 1450 },
  { name: 'Ср', users: 680, msgs: 2100 },
  { name: 'Чт', users: 720, msgs: 1980 },
  { name: 'Пт', users: 900, msgs: 2600 },
  { name: 'Сб', users: 1100, msgs: 3100 },
  { name: 'Вс', users: 1250, msgs: 2890 },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()
  
  const [bots, setBots] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'bots' | 'sites' | 'analytics' | 'templates'>('bots')
  const { t, lang, changeLanguage } = useTranslation()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [modalType, setModalType] = useState<'bot' | 'site'>('bot')
  const [newBotName, setNewBotName] = useState('')
  const [newBotToken, setNewBotToken] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [creationType, setCreationType] = useState<'bot_only' | 'bot_and_webapp'>('bot_and_webapp')
  
  const [aiPrompt, setAiPrompt] = useState('')
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null)
  
  // Modals state
  const [showDonateModal, setShowDonateModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [connectModalSite, setConnectModalSite] = useState<{ id: string; name: string; url?: string } | null>(null)

  // Check if terms are accepted on account entry
  useEffect(() => {
    if (user?.id) {
      const accepted = localStorage.getItem(`mazaika_terms_accepted_${user.id}`) === 'true' || (user as any).termsAccepted
      if (!accepted) {
        setShowTermsModal(true)
      }
    }
  }, [user?.id])

  const handleAcceptTerms = async () => {
    if (user?.id) {
      localStorage.setItem(`mazaika_terms_accepted_${user.id}`, 'true')
      try {
        await createOrUpdateUser(user.id, { termsAccepted: true, termsAcceptedAt: new Date().toISOString() })
      } catch (err) {
        console.warn('Terms accept sync warning:', err)
      }
    }
    setShowTermsModal(false)
  }

  const fetchBots = async (userId?: string) => {
    const uid = userId || user?.id
    if (!uid) return
    try {
      const data = await getBotsByUser(uid)
      setBots(data || [])
    } catch (err) {
      console.error('Fetch bots error:', err)
      setBots([])
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !user) {
        const fbUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || firebaseUser.phoneNumber || 'Пользователь',
          email: firebaseUser.email || '',
          phone: firebaseUser.phoneNumber || '',
        }
        await createOrUpdateUser(firebaseUser.uid, { name: fbUser.name, email: fbUser.email, phone: fbUser.phone })
        setUser(fbUser)
        fetchBots(firebaseUser.uid)
      }
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (user?.id) fetchBots(user.id)
  }, [user?.id])

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    try {
      const bot = await createBot(user.id, {
        name: newBotName.trim(),
        token: modalType === 'bot' ? newBotToken.trim() : undefined,
        template: selectedTemplate || undefined,
        creationType: modalType === 'bot' ? creationType : undefined,
        projectType: modalType
      })
      setShowCreateModal(false)
      setNewBotName('')
      setNewBotToken('')
      setSelectedTemplate('')
      
      if (modalType === 'site') {
        navigate(`/bot/${bot.id}/sitebuilder`)
      } else {
        navigate(`/bot/${bot.id}/editor`)
      }
    } catch (e: any) {
      alert('Ошибка при создании проекта: ' + e.message)
    }
  }

  const handleDeleteBot = async (botId: string, botName: string) => {
    if (!window.confirm(`Вы действительно хотите удалить проект "${botName}"? Это действие необратимо.`)) return
    try {
      await deleteBot(botId)
      localStorage.removeItem('mazaika_ai_messages_' + botId)
      localStorage.removeItem('mazaika_ai_config_' + botId)
      localStorage.removeItem('mazaika_site_' + botId)
      fetchBots()
    } catch (e) {
      console.error(e)
      alert("Произошла ошибка при удалении проекта.")
    }
  }

  const handleTemplateClick = (templateName: string) => {
    setSelectedTemplate(templateName)
    setNewBotName(templateName + ' (Бот)')
    setNewBotToken('')
    setCreationType('bot_and_webapp')
    setModalType('bot')
    setShowCreateModal(true)
  }

  const handleCopyToken = (e: React.MouseEvent, id: string, token?: string) => {
    e.stopPropagation()
    if (!token) return
    navigator.clipboard.writeText(token)
    setCopiedTokenId(id)
    setTimeout(() => setCopiedTokenId(null), 2000)
  }

  const handleLaunchAiWithPrompt = (promptText?: string) => {
    const textToSend = promptText || aiPrompt
    navigate('/dashboard/ai-workspace', {
      state: { prompt: textToSend }
    })
  }

  const handleLogout = () => {
    auth.signOut()
    navigate('/')
  }

  const botProjects = useMemo(() => bots.filter(b => b.projectType !== 'site'), [bots])
  const siteProjects = useMemo(() => bots.filter(b => b.projectType === 'site'), [bots])

  const filteredBots = useMemo(() => {
    return botProjects.filter(bot => {
      const matchesSearch = (bot.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (bot.token || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = filterStatus === 'all' 
        ? true 
        : filterStatus === 'active' 
          ? bot.status === 'active' 
          : bot.status !== 'active'
      return matchesSearch && matchesStatus
    })
  }, [botProjects, searchQuery, filterStatus])

  const totalUsers = useMemo(() => bots.reduce((a, b) => a + (b.users || 0), 0), [bots])
  const totalMessages = useMemo(() => bots.reduce((a, b) => a + (b.messages || 0), 0), [bots])
  const activeBots = useMemo(() => botProjects.filter(b => b.status === 'active').length, [botProjects])

  const userDisplayName = user?.name || 'Пользователь'
  const userInitials = userDisplayName.substring(0, 2).toUpperCase()

  return (
    <div className="dashboard-cyber">
      {/* ===== SIDEBAR ===== */}
      <aside className="dash-sidebar">
        <div className="dash-logo" onClick={() => navigate('/')}>
          <div className="dash-logo-icon">
            <Sparkles size={18} color="#00D9FF" />
          </div>
          <div className="dash-logo-text">
            <span>Mazaika</span>
            <span className="dash-logo-badge">AI v2.5</span>
          </div>
        </div>

        <div className="dash-nav-section-label">ГЛАВНОЕ МЕНЮ</div>

        <nav className="dash-nav">
          <button 
            className={`dash-nav-item ${activeTab === 'bots' ? 'active' : ''}`} 
            onClick={() => setActiveTab('bots')}
          >
            <Bot size={18} />
            <span className="nav-label">{t('sidebar_bots')}</span>
            {botProjects.length > 0 && <span className="nav-count">{botProjects.length}</span>}
          </button>
          
          <button 
            className={`dash-nav-item ${activeTab === 'sites' ? 'active' : ''}`} 
            onClick={() => setActiveTab('sites')}
          >
            <Globe size={18} />
            <span className="nav-label">Mini App & Сайты</span>
            {siteProjects.length > 0 && <span className="nav-count">{siteProjects.length}</span>}
          </button>
          
          <button 
            className={`dash-nav-item ${activeTab === 'analytics' ? 'active' : ''}`} 
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart2 size={18} />
            <span className="nav-label">Аналитика</span>
            <span className="nav-live-dot" />
          </button>
          
          <button 
            className={`dash-nav-item ${activeTab === 'templates' ? 'active' : ''}`} 
            onClick={() => setActiveTab('templates')}
          >
            <Zap size={18} />
            <span className="nav-label">Шаблоны</span>
            <span className="nav-tag-hot">HOT</span>
          </button>

          <button 
            className="dash-nav-item" 
            onClick={() => navigate('/dashboard/profile')}
          >
            <Settings size={18} />
            <span className="nav-label">Настройки</span>
          </button>
        </nav>

        {/* AI Quick Banner in Sidebar */}
        <div className="dash-sidebar-ai-box" onClick={() => handleLaunchAiWithPrompt()}>
          <div className="dash-sidebar-ai-icon">
            <Cpu size={16} />
          </div>
          <div className="dash-sidebar-ai-info">
            <div className="dash-sidebar-ai-title">Mazaika AI Studio</div>
            <div className="dash-sidebar-ai-sub">На базе DeepSeek AI</div>
          </div>
          <ArrowRight size={14} className="dash-sidebar-ai-arrow" />
        </div>

        {/* Language Switcher */}
        <div className="dash-lang-bar">
          {(['UZ', 'RU', 'EN'] as Language[]).map(l => (
            <button 
              key={l}
              onClick={() => changeLanguage(l)}
              className={`dash-lang-btn ${lang === l ? 'active' : ''}`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Developer Donation Widget ABOVE User Profile */}
        <div className="dash-donate-banner" onClick={() => setShowDonateModal(true)}>
          <div className="dash-donate-icon">❤️</div>
          <div className="dash-donate-info">
            <div className="dash-donate-title">Поддержать автора</div>
            <div className="dash-donate-sub">Донат на развитие проекта</div>
          </div>
          <button className="dash-donate-btn" type="button">
            Донат
          </button>
        </div>

        {/* User profile footer */}
        <div className="dash-user-card">
          <div className="dash-user-avatar" onClick={() => navigate('/dashboard/profile')}>
            {userInitials}
          </div>
          <div className="dash-user-meta" onClick={() => navigate('/dashboard/profile')}>
            <div className="dash-user-name" title={userDisplayName}>{userDisplayName}</div>
            <div className="dash-user-plan-badge">
              <span className="plan-pill" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
                ⚡ VIP Pro (Бесплатно)
              </span>
            </div>
          </div>
          <button className="dash-user-logout" onClick={handleLogout} title="Выйти">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ===== MAIN DASHBOARD ===== */}
      <main className="dash-main">
        {/* BOTS TAB */}
        {activeTab === 'bots' && (
          <div className="dash-tab-content">
            {/* UNIFIED GRAND COMMAND HEADER */}
            <div className="dash-grand-header">
              <div className="dash-header-left">
                <div className="dash-status-pill">
                  <span className="pulse-indicator" />
                  <span>Все системы работают в штатном режиме (99.98% SLA)</span>
                  <span className="sep">•</span>
                  <span className="ai-model-tag">DeepSeek-R1</span>
                </div>
                <h1 className="dash-welcome-title">
                  Salom, <span className="text-glow-gradient">{userDisplayName}</span> 👋
                </h1>
                <p className="dash-welcome-subtitle">
                  {new Date().toLocaleDateString(lang === 'RU' ? 'ru-RU' : lang === 'EN' ? 'en-US' : 'uz-UZ', { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                  })} — Telegram botlari va Mini App loyihalaringiz markazi
                </p>
              </div>

              <div className="dash-header-actions">
                <button 
                  className="btn-cyber-primary" 
                  onClick={() => handleLaunchAiWithPrompt()}
                >
                  <Sparkles size={16} />
                  <span>Mazaika AI Studio</span>
                </button>

                <button 
                  className="btn-cyber-accent" 
                  onClick={() => {
                    setSelectedTemplate('')
                    setNewBotName('')
                    setNewBotToken('')
                    setModalType('bot')
                    setShowCreateModal(true)
                  }}
                >
                  <Plus size={16} />
                  <span>Создать нового бота</span>
                </button>
              </div>
            </div>

            {/* INTERACTIVE AI PROMPT LAUNCHPAD BAR */}
            <div className="dash-ai-launchpad">
              <div className="launchpad-header">
                <div className="launchpad-icon-wrap">
                  <Sparkles size={16} />
                </div>
                <div className="launchpad-title-group">
                  <span className="launchpad-title">Mazaika AI Tezkor Generator</span>
                  <span className="launchpad-subtitle">G'oyangizni bir jumlada yozing — AI bir daqiqada to'liq bot va Mini App arxitekturasini yaratadi</span>
                </div>
              </div>

              <form 
                className="launchpad-input-row"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (aiPrompt.trim()) handleLaunchAiWithPrompt()
                }}
              >
                <input 
                  type="text" 
                  className="launchpad-input" 
                  placeholder="Например: Доставка цветов с каталогом букетов, корзиной и онлайн-оплатой..."
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                />
                <button type="submit" className="launchpad-submit-btn">
                  <Cpu size={15} />
                  <span>Создать с помощью AI ⚡</span>
                </button>
              </form>

              <div className="launchpad-quick-pills">
                <span className="pills-label">Ommabop g'oyalar:</span>
                {QUICK_PROMPT_PILLS.map((pill, idx) => (
                  <button 
                    key={idx} 
                    type="button" 
                    className="quick-pill-btn"
                    onClick={() => {
                      setAiPrompt(pill.prompt)
                    }}
                  >
                    {pill.text}
                  </button>
                ))}
              </div>
            </div>

            {/* PRESTIGIOUS OBSIDIAN STAT METRICS */}
            <div className="dash-metrics-grid">
              <motion.div 
                className="metric-card metric-cyan"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="metric-header">
                  <div className="metric-icon"><Bot size={22} /></div>
                  <span className="metric-trend"><TrendingUp size={12} /> +12% bu oy</span>
                </div>
                <div className="metric-value">{botProjects.length}</div>
                <div className="metric-title">{t('dashboard_projects')}</div>
                <div className="metric-foot">Telegram integratsiyalari</div>
              </motion.div>

              <motion.div 
                className="metric-card metric-aqua"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
              >
                <div className="metric-header">
                  <div className="metric-icon"><Users size={22} /></div>
                  <span className="metric-trend"><TrendingUp size={12} /> +18.4%</span>
                </div>
                <div className="metric-value">{totalUsers.toLocaleString()}</div>
                <div className="metric-title">{t('dashboard_total_users')}</div>
                <div className="metric-foot">Активная аудитория ботов</div>
              </motion.div>

              <motion.div 
                className="metric-card metric-violet"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="metric-header">
                  <div className="metric-icon"><MessageSquare size={22} /></div>
                  <span className="metric-trend"><TrendingUp size={12} /> +24% bugun</span>
                </div>
                <div className="metric-value">{totalMessages.toLocaleString()}</div>
                <div className="metric-title">{t('dashboard_messages_today')}</div>
                <div className="metric-foot">Qayta ishlangan so'rovlar</div>
              </motion.div>

              <motion.div 
                className="metric-card metric-emerald"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                <div className="metric-header">
                  <div className="metric-icon"><Sparkles size={22} /></div>
                  <span className="metric-badge">DeepSeek-R1</span>
                </div>
                <div className="metric-value">99.8%</div>
                <div className="metric-title">Mazaika AI Мощность</div>
                <div className="metric-foot">0.4s o'rtacha javob tezligi</div>
              </motion.div>
            </div>

            {/* PROJECTS HUB / BOTLARIM */}
            <div className="dash-projects-hub">
              <div className="hub-topbar">
                <div className="hub-title-group">
                  <h2 className="hub-title">Loyiha Markazi</h2>
                  <span className="hub-badge">{botProjects.length} активных проектов</span>
                </div>

                <div className="hub-controls">
                  <div className="hub-search-box">
                    <Search size={15} />
                    <input 
                      type="text" 
                      placeholder="Bot nomi yoki tokeni..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="hub-filter-tabs">
                    <button 
                      className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                      onClick={() => setFilterStatus('all')}
                    >
                      Все
                    </button>
                    <button 
                      className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
                      onClick={() => setFilterStatus('active')}
                    >
                      Активные ({activeBots})
                    </button>
                    <button 
                      className={`filter-btn ${filterStatus === 'inactive' ? 'active' : ''}`}
                      onClick={() => setFilterStatus('inactive')}
                    >
                      Остановленные
                    </button>
                  </div>
                </div>
              </div>

              {/* EMPTY STATE OR BOTS GRID */}
              {botProjects.length === 0 ? (
                /* STARTER LAUNCHPAD HUB (When no bots exist) */
                <motion.div 
                  className="starter-launchpad-hub"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="starter-hub-glow" />
                  
                  <div className="starter-hub-header">
                    <div className="starter-hub-icon">
                      <Bot size={36} />
                    </div>
                    <h3 className="starter-hub-title">Создайте свой первый Telegram-бот</h3>
                    <p className="starter-hub-desc">
                      У вас пока нет созданных ботов. Выберите готовый шаблон ниже или опишите задачу нашему AI — проект будет готов за 1 минуту.
                    </p>
                  </div>

                  <div className="starter-templates-row">
                    <div 
                      className="starter-template-card"
                      onClick={() => handleTemplateClick("Internet do'kon")}
                    >
                      <div className="starter-card-tag">Tavsiya etiladi</div>
                      <div className="starter-card-emoji">🛒</div>
                      <div className="starter-card-title">Mini App Do'kon</div>
                      <div className="starter-card-desc">Tovarlar katalogi, savat, Payme va Click to'lovlari integratsiyasi</div>
                      <div className="starter-card-cta">Bir klikda boshlash →</div>
                    </div>

                    <div 
                      className="starter-template-card"
                      onClick={() => handleTemplateClick('Mazaika AI Konsultant')}
                    >
                      <div className="starter-card-tag cyan">AI Powered</div>
                      <div className="starter-card-emoji">🤖</div>
                      <div className="starter-card-title">Mazaika AI Konsultant</div>
                      <div className="starter-card-desc">Mijozlar bilan aqlli muloqot, savollarga javob va CRM integratsiyasi</div>
                      <div className="starter-card-cta">Bir klikda boshlash →</div>
                    </div>

                    <div 
                      className="starter-template-card"
                      onClick={() => handleTemplateClick('Yetkazib berish')}
                    >
                      <div className="starter-card-tag green">Logistika</div>
                      <div className="starter-card-emoji">🍕</div>
                      <div className="starter-card-title">Restoran & Yetkazish</div>
                      <div className="starter-card-desc">Taomlar menyusi, buyurtma qabul qilish, kuryer va lokatsiya</div>
                      <div className="starter-card-cta">Bir klikda boshlash →</div>
                    </div>
                  </div>

                  <div className="starter-hub-actions">
                    <button 
                      className="btn-cyber-primary"
                      onClick={() => handleLaunchAiWithPrompt()}
                    >
                      <Sparkles size={16} />
                      <span>Создать через Mazaika AI</span>
                    </button>

                    <button 
                      className="btn-cyber-outline"
                      onClick={() => {
                        setSelectedTemplate('')
                        setNewBotName('')
                        setNewBotToken('')
                        setModalType('bot')
                        setShowCreateModal(true)
                      }}
                    >
                      <Plus size={16} />
                      <span>Создать чистый бот (по токену)</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* BOTS GRID (When bots exist) */
                <div className="bots-cards-grid">
                  {/* Create New Card */}
                  <motion.div 
                    className="bot-card-cyber create-card-cyber"
                    onClick={() => {
                      setSelectedTemplate('')
                      setNewBotName('')
                      setNewBotToken('')
                      setModalType('bot')
                      setShowCreateModal(true)
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="create-cyber-icon">
                      <Plus size={28} />
                    </div>
                    <div className="create-cyber-title">Yangi Bot Qo'shish</div>
                    <div className="create-cyber-sub">BotFather tokeni orqali</div>
                  </motion.div>

                  <AnimatePresence>
                    {filteredBots.map((bot, i) => {
                      const isCopied = copiedTokenId === bot.id
                      const botTokenSnippet = bot.token ? `${bot.token.substring(0, 10)}...${bot.token.slice(-4)}` : 'Token ulanmagan'

                      return (
                        <motion.div 
                          key={bot.id}
                          className="bot-card-cyber"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.04 }}
                          whileHover={{ translateY: -4 }}
                          onClick={() => navigate(`/bot/${bot.id}/editor`)}
                        >
                          <div className="bot-card-top">
                            <div className="bot-card-avatar" style={{ background: `${bot.color || '#00D9FF'}20`, color: bot.color || '#00D9FF' }}>
                              <Bot size={22} />
                            </div>

                            <div className="bot-status-pill">
                              <span className={`status-dot ${bot.status === 'active' ? 'active' : ''}`} />
                              <span>{bot.status === 'active' ? 'Активен' : 'Остановлен'}</span>
                            </div>

                            <button 
                              className="bot-delete-btn"
                              title="Loyihani o'chirish"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteBot(bot.id, bot.name)
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <div className="bot-card-body">
                            <h3 className="bot-card-title">{bot.name}</h3>
                            
                            <div 
                              className="bot-card-token-pill"
                              title="Token nusxalash"
                              onClick={(e) => handleCopyToken(e, bot.id, bot.token)}
                            >
                              <code>{botTokenSnippet}</code>
                              <span className="token-copy-icon">
                                {isCopied ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                              </span>
                            </div>
                          </div>

                          <div className="bot-card-stats">
                            <div className="bot-card-stat">
                              <Users size={13} />
                              <span>{(bot.users || 0).toLocaleString()}</span>
                            </div>
                            <div className="bot-card-stat">
                              <MessageSquare size={13} />
                              <span>{(bot.messages || 0).toLocaleString()}</span>
                            </div>
                            <div className="bot-card-stat">
                              <Activity size={13} />
                              <span>Stsenariy</span>
                            </div>
                          </div>

                          <div className="bot-card-footer">
                            <button 
                              className="bot-open-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/bot/${bot.id}/editor`)
                              }}
                            >
                              <span>Redaktorga o'tish</span>
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* CURATED TEMPLATES SECTION */}
            <div className="dash-templates-showcase">
              <div className="section-header-row">
                <div>
                  <h2 className="section-heading">Готовые шаблоны</h2>
                  <p className="section-subheading">O'zbekiston bozori uchun optimallashtirilgan professional Telegram yechimlari</p>
                </div>
              </div>

              <div className="templates-cyber-grid">
                {TEMPLATES.map((tItem) => (
                  <motion.div 
                    key={tItem.id}
                    className="template-cyber-card"
                    whileHover={{ translateY: -4 }}
                    onClick={() => handleTemplateClick(tItem.name)}
                  >
                    <div className="t-card-header">
                      <span className="t-card-emoji">{tItem.emoji}</span>
                      <span className="t-card-tag">{tItem.tag}</span>
                    </div>
                    <h4 className="t-card-title">{tItem.name}</h4>
                    <p className="t-card-desc">{tItem.desc}</p>
                    <div className="t-card-footer">
                      <span>Shablonni tanlash</span>
                      <ArrowRight size={13} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SITES TAB */}
        {activeTab === 'sites' && (
          <div className="dash-tab-content">
            <div className="dash-grand-header">
              <div className="dash-header-left">
                <div className="dash-status-pill">
                  <Globe size={13} />
                  <span>Veb-saytlar va Telegram WebApps</span>
                </div>
                <h1 className="dash-welcome-title">Mening Saytlarim</h1>
                <p className="dash-welcome-subtitle">
                  No-code konstruktorda yaratilgan veb-sahifalar, vitrinalar va Mini App interfeyslari
                </p>
              </div>

              <div className="dash-header-actions">
                <button 
                  className="btn-cyber-primary"
                  onClick={() => {
                    setSelectedTemplate('')
                    setNewBotName('Yangi AI Sayt')
                    setNewBotToken('')
                    setModalType('site')
                    setShowCreateModal(true)
                  }}
                >
                  <Sparkles size={16} />
                  <span>Создать сайт через AI</span>
                </button>

                <button 
                  className="btn-cyber-accent"
                  onClick={() => {
                    setSelectedTemplate('')
                    setNewBotName('')
                    setNewBotToken('')
                    setModalType('site')
                    setShowCreateModal(true)
                  }}
                >
                  <Plus size={16} />
                  <span>Yangi Sayt</span>
                </button>
              </div>
            </div>

            <div className="dash-projects-hub">
              {siteProjects.length === 0 ? (
                <div className="starter-launchpad-hub">
                  <div className="starter-hub-header">
                    <div className="starter-hub-icon">
                      <Globe size={36} />
                    </div>
                    <h3 className="starter-hub-title">Birinchi Veb-Saytingizni Yarating</h3>
                    <p className="starter-hub-desc">
                      Telegram ichida ishlaydigan Mini App yoki mustaqil veb-sayt yarating. Hech qanday dasturlash bilimi talab etilmaydi.
                    </p>
                  </div>

                  <div className="starter-hub-actions">
                    <button 
                      className="btn-cyber-primary"
                      onClick={() => {
                        setSelectedTemplate('')
                        setNewBotName('Mening Saytim')
                        setModalType('site')
                        setShowCreateModal(true)
                      }}
                    >
                      <Sparkles size={16} />
                      <span>Konstruktorni ochish</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bots-cards-grid">
                  {siteProjects.map(site => {
                    const linkedBot = botProjects.find(b => b.linkedSiteId === site.id || (b.menuButtonUrl && b.menuButtonUrl.includes(site.id)))
                    const liveSiteUrl = site.cloudflareUrl || getLiveSiteUrl(site.id)

                    return (
                      <div 
                        key={site.id}
                        className="bot-card-cyber"
                        onClick={() => navigate(`/bot/${site.id}/sitebuilder`)}
                      >
                        <div className="bot-card-top">
                          <div className="bot-card-avatar" style={{ background: 'rgba(0,245,196,0.15)', color: '#00F5C4' }}>
                            <Globe size={22} />
                          </div>
                          <button 
                            className="bot-delete-btn"
                            title="Saytni o'chirish"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteBot(site.id, site.name)
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <div className="bot-card-body">
                          <h3 className="bot-card-title">{site.name || 'Nomsiz sayt'}</h3>
                          <div className="bot-card-token-pill">
                            <code>Tashriflar: {(site.users || 0).toLocaleString()}</code>
                          </div>
                          {linkedBot && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, background: 'rgba(0,245,196,0.12)', color: '#00F5C4', padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(0,245,196,0.25)', marginTop: 8 }}>
                              <Smartphone size={11} />
                              <span>{linkedBot.name} ga ulangan</span>
                            </div>
                          )}
                        </div>
                        <div className="bot-card-footer" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 12 }}>
                          <button 
                            className="bot-open-btn"
                            style={{ flex: 1, minWidth: '110px' }}
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/bot/${site.id}/sitebuilder`)
                            }}
                          >
                            <span>Konstruktor</span>
                            <ArrowRight size={13} />
                          </button>
                          <button 
                            className="bot-open-btn"
                            title="Подключить к Telegram боту как Mini App ($0 бесплатно)"
                            style={{ 
                              background: 'linear-gradient(135deg, rgba(0,245,196,0.18) 0%, rgba(30,144,255,0.18) 100%)', 
                              borderColor: 'rgba(0,245,196,0.4)', 
                              color: '#00F5C4',
                              padding: '7px 11px',
                              fontSize: 12,
                              fontWeight: 600
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              setConnectModalSite({ id: site.id, name: site.name || 'Mening Saytim', url: liveSiteUrl })
                            }}
                          >
                            <Smartphone size={13} />
                            <span>Botga ulash</span>
                          </button>
                          <button 
                            className="bot-open-btn"
                            title="Saytni yangi oynada ochish"
                            style={{ padding: '7px 10px', background: 'rgba(255,255,255,0.06)' }}
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(liveSiteUrl, '_blank')
                            }}
                          >
                            <Eye size={13} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="dash-tab-content">
            <div className="dash-grand-header">
              <div className="dash-header-left">
                <div className="dash-status-pill">
                  <Activity size={13} />
                  <span>Real-Vaqt Metrikalari</span>
                </div>
                <h1 className="dash-welcome-title">Tizim Analitikasi</h1>
                <p className="dash-welcome-subtitle">
                  Auditoriya o'sishi, xabarlar konversiyasi va botlar samaradorligi
                </p>
              </div>
            </div>

            <div className="dash-analytics-wrapper">
              <div className="analytics-main-chart-card">
                <div className="chart-header">
                  <div>
                    <h3 className="chart-title">Haftalik Auditoriya Dinamikasi</h3>
                    <p className="chart-subtitle">Динамика аудитории и сообщений в Telegram ботах</p>
                  </div>
                  <span className="chart-pill">+28.4% o'sish</span>
                </div>

                <div className="chart-body">
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={MOCK_ANALYTICS_DATA}>
                      <defs>
                        <linearGradient id="cyberAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#00D9FF" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#0B0E17', border: '1px solid rgba(0,217,255,0.3)', borderRadius: 10, color: '#fff' }} />
                      <Area type="monotone" dataKey="users" stroke="#00D9FF" strokeWidth={3} fillOpacity={1} fill="url(#cyberAreaGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="analytics-sidebar-metrics">
                <div className="analytics-mini-card">
                  <div className="mini-card-icon cyan"><TrendingUp size={20} /></div>
                  <div className="mini-card-label">Konversiya koeffitsiyenti</div>
                  <div className="mini-card-val">87.4%</div>
                  <div className="mini-card-sub">Botga kirganlarning buyurtma berish ulushi</div>
                </div>

                <div className="analytics-mini-card">
                  <div className="mini-card-icon aqua"><MessageSquare size={20} /></div>
                  <div className="mini-card-label">Avtomatik javoblar</div>
                  <div className="mini-card-val">99.2%</div>
                  <div className="mini-card-sub">O'rtacha javob berish vaqti &lt; 1 soniya</div>
                </div>

                <div className="analytics-mini-card">
                  <div className="mini-card-icon violet"><Cpu size={20} /></div>
                  <div className="mini-card-label">Server Barqarorligi</div>
                  <div className="mini-card-val">99.98%</div>
                  <div className="mini-card-sub">Высоконагруженная облачная архитектура</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <div className="dash-tab-content">
            <div className="dash-grand-header">
              <div className="dash-header-left">
                <div className="dash-status-pill">
                  <Zap size={13} />
                  <span>Каталог готовых решений</span>
                </div>
                <h1 className="dash-welcome-title">Шаблоны и готовые решения</h1>
                <p className="dash-welcome-subtitle">
                  Запустите проект мгновенно: выберите отраслевой шаблон и настройте под свой бренд
                </p>
              </div>
            </div>

            <div className="templates-categories-row">
              {[
                { name: 'Шаблоны ботов', icon: <Bot size={28} />, color: '#00D9FF', desc: "Готовые сценарии и воронки для Telegram ботов" },
                { name: 'Mini App Dizaynlari', icon: <AppWindow size={28} />, color: '#00F5C4', desc: "Telegram WebApp ilovasi uchun vizual interfeyslar" },
                { name: 'Veb-Saytlar', icon: <Globe size={28} />, color: '#F59E0B', desc: "Landing page va kompaniya sahifalari" },
                { name: 'Mazaika AI Agentlar', icon: <Sparkles size={28} />, color: '#7C3AED', desc: "Sun'iy intellekt asosidagi avtomatik yordamchilar" },
              ].map((cat, idx) => (
                <div 
                  key={idx} 
                  className="template-cat-box"
                  onClick={() => handleTemplateClick(cat.name)}
                >
                  <div className="cat-box-icon" style={{ color: cat.color }}>{cat.icon}</div>
                  <div className="cat-box-title">{cat.name}</div>
                  <div className="cat-box-desc">{cat.desc}</div>
                </div>
              ))}
            </div>

            <h3 className="section-heading" style={{ marginTop: 40, marginBottom: 20 }}>Все шаблоны</h3>
            <div className="templates-cyber-grid">
              {TEMPLATES.map((tItem) => (
                <div 
                  key={tItem.id}
                  className="template-cyber-card"
                  onClick={() => handleTemplateClick(tItem.name)}
                >
                  <div className="t-card-header">
                    <span className="t-card-emoji">{tItem.emoji}</span>
                    <span className="t-card-tag">{tItem.tag}</span>
                  </div>
                  <h4 className="t-card-title">{tItem.name}</h4>
                  <p className="t-card-desc">{tItem.desc}</p>
                  <div className="t-card-footer">
                    <span>Shablonni tanlash</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ===== CREATE MODAL ===== */}
      {showCreateModal && (
        <div className="modal-cyber-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-cyber-box" onClick={e => e.stopPropagation()}>
            <div className="modal-cyber-header">
              <div className="modal-cyber-title-wrap">
                <div className="modal-cyber-icon">
                  {modalType === 'site' ? <Globe size={20} /> : <Bot size={20} />}
                </div>
                <div>
                  <h2 className="modal-cyber-title">
                    {modalType === 'site' ? 'Создание нового сайта' : 'Новый Telegram-бот'}
                  </h2>
                  {selectedTemplate && <span className="modal-template-tag">{selectedTemplate}</span>}
                </div>
              </div>
              <button className="modal-cyber-close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>

            <div className="modal-cyber-body">
              {modalType === 'bot' && (
                <div className="botfather-hint-box">
                  <div className="hint-badge">BotFather</div>
                  <p>
                    Token olish uchun rasmiy <strong>@BotFather</strong> ga kiring va <code>/newbot</code> buyrug'ini yuboring.
                  </p>
                  <a 
                    href="https://t.me/BotFather" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="botfather-link"
                  >
                    <span>@BotFather ga o'tish</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

              <form onSubmit={handleCreateBot}>
                <div className="cyber-form-group">
                  <label className="cyber-label">
                    {modalType === 'site' ? 'Sayt Nomi' : 'Bot Nomi'}
                  </label>
                  <input 
                    type="text" 
                    className="cyber-input" 
                    placeholder={modalType === 'site' ? "Мой лендинг" : "Например: Express Доставка"} 
                    value={newBotName} 
                    onChange={e => setNewBotName(e.target.value)} 
                    required 
                    autoFocus
                  />
                </div>

                {modalType === 'bot' && (
                  <>
                    <div className="cyber-form-group">
                      <label className="cyber-label">Telegram Bot API Token</label>
                      <input 
                        type="text" 
                        className="cyber-input font-mono" 
                        placeholder="1234567890:AAHfj..." 
                        value={newBotToken} 
                        onChange={e => setNewBotToken(e.target.value)} 
                        required 
                      />
                    </div>

                    <div className="cyber-form-group">
                      <label className="cyber-label">Arxitektura turi</label>
                      <div className="creation-type-selector">
                        <label className={`type-card ${creationType === 'bot_and_webapp' ? 'active' : ''}`}>
                          <input 
                            type="radio" 
                            name="creationType" 
                            value="bot_and_webapp" 
                            checked={creationType === 'bot_and_webapp'} 
                            onChange={() => setCreationType('bot_and_webapp')}
                          />
                          <div className="type-card-content">
                            <span className="type-card-badge">Tavsiya etiladi</span>
                            <div className="type-card-title">Bot + Mini App</div>
                            <p className="type-card-desc">Telegram chat stsenariysi bilan birga zamonaviy vizual WebApp ilovasi yaratiladi</p>
                          </div>
                        </label>

                        <label className={`type-card ${creationType === 'bot_only' ? 'active' : ''}`}>
                          <input 
                            type="radio" 
                            name="creationType" 
                            value="bot_only" 
                            checked={creationType === 'bot_only'} 
                            onChange={() => setCreationType('bot_only')}
                          />
                          <div className="type-card-content">
                            <div className="type-card-title">Faqat Bot</div>
                            <p className="type-card-desc">Faqat standart klaviatura va tugmali xabarlar stsenariysi</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </>
                )}

                <div className="modal-cyber-actions">
                  <button 
                    type="button" 
                    className="btn-modal-cancel" 
                    onClick={() => setShowCreateModal(false)}
                  >
                    {t('btn_cancel')}
                  </button>
                  <button 
                    type="submit" 
                    className="btn-modal-submit"
                  >
                    <span>Tasdiqlash va Ochish</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Developer Donation Modal */}
      <DonateModal 
        isOpen={showDonateModal} 
        onClose={() => setShowDonateModal(false)} 
      />

      {/* Mandatory First-Time Terms of Service Modal (Scroll to bottom required) */}
      <TermsModal 
        isOpen={showTermsModal} 
        onAccept={handleAcceptTerms} 
      />

      {/* 1-Click Connect Website to Telegram Bot (Mini App) Modal */}
      {connectModalSite && (
        <ConnectBotModal
          isOpen={!!connectModalSite}
          onClose={() => setConnectModalSite(null)}
          siteId={connectModalSite.id}
          siteName={connectModalSite.name}
          siteUrl={connectModalSite.url}
          onSuccess={() => {
            const uid = user?.id || (user as any)?.uid || ''
            getBotsByUser(uid).then(res => {
              if (res) setBots(res)
            })
          }}
        />
      )}
    </div>
  )
}
