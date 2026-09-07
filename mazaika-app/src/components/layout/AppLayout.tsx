import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom'
import {
  LayoutGrid, MessageSquare, Megaphone, Users, BarChart2,
  Webhook, Settings, ChevronLeft, Play, AlertCircle, Bot,
  AppWindow, Globe, Menu, Sparkles
} from 'lucide-react'
import FloatingAICopilot from '../ai/FloatingAICopilot'
import { getBotById } from '../../api/firestore'
import './AppLayout.css'

const NAV_ITEMS = [
  { icon: LayoutGrid, label: 'Redaktor', path: 'editor', tooltip: 'Vizual redaktor' },
  { icon: AppWindow, label: 'Mini ilova', path: 'miniapps', tooltip: 'Telegram Mini Apps' },
  { icon: Globe, label: 'Konstruktor', path: 'sitebuilder', tooltip: 'No-code Sayt Konstruktori' },
  { icon: MessageSquare, label: 'Chatlar', path: 'chats', tooltip: 'CRM chatlar' },
  { icon: Megaphone, label: 'Tarqatma', path: 'broadcasts', tooltip: 'Avto-tarqatmalar' },
  { icon: Users, label: 'Kontaktlar', path: 'contacts', tooltip: 'Foydalanuvchilar' },
  { icon: BarChart2, label: 'Analitika', path: 'analytics', tooltip: 'Statistika' },
  { icon: Webhook, label: 'Webhooks', path: 'webhooks', tooltip: 'Kiruvchi webhook' },
  { icon: Settings, label: 'Sozlama', path: 'settings', tooltip: 'Bot sozlamalari' },
]

export default function AppLayout() {
  const navigate = useNavigate()
  const { botId } = useParams()
  const location = useLocation()
  
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [projectType, setProjectType] = useState<'bot' | 'site'>('bot')
  const [projectName, setProjectName] = useState('Mazaika Bot')

  useEffect(() => {
    const fetchBot = async () => {
      if (!botId) return
      try {
        const bot = await getBotById(botId)
        if (bot) {
          setProjectType(bot.projectType || 'bot')
          setProjectName(bot.name || (bot.projectType === 'site' ? 'Mening Saytim' : 'Mazaika Bot'))
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchBot()
  }, [botId])

  const currentPath = location.pathname.split('/').pop()

  const currentNavItems = projectType === 'site' 
    ? [
        { icon: Globe, label: 'Konstruktor', path: 'sitebuilder', tooltip: 'No-code Sayt Konstruktori' },
        { icon: Settings, label: 'Sozlama', path: 'settings', tooltip: 'Sayt sozlamalari' }
      ]
    : NAV_ITEMS

  return (
    <div className="app-layout">
      {/* Mobile Sidebar Toggle Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setIsMobileSidebarOpen(false)} 
        />
      )}

      {/* Narrow icon sidebar — like LeadTex */}
      <aside className={`app-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div 
          className="sidebar-logo" 
          onClick={() => {
            navigate('/dashboard')
            setIsMobileSidebarOpen(false)
          }} 
          data-tooltip="Dashboard"
        >
          <div style={{
            width: 28, height: 28,
            background: 'linear-gradient(135deg, rgba(0,217,255,0.25), rgba(124,58,237,0.35))',
            border: '1px solid rgba(0,217,255,0.4)',
            borderRadius: 8,
            display: 'grid',
            placeItems: 'center'
          }}>
            <Sparkles size={14} color="#00D9FF" />
          </div>
        </div>

        <div className="sidebar-divider" />

        {/* Nav items */}
        <nav className="sidebar-nav">
          {currentNavItems.map(item => {
            const Icon = item.icon
            const active = currentPath === item.path
            return (
              <button
                key={item.path}
                className={`sidebar-item ${active ? 'active' : ''}`}
                onClick={() => {
                  navigate(`/bot/${botId}/${item.path}`)
                  setIsMobileSidebarOpen(false)
                }}
                data-tooltip={item.tooltip}
              >
                <Icon size={20} />
              </button>
            )
          })}
        </nav>

        <div className="sidebar-bottom">
          <button 
            className="sidebar-item" 
            onClick={() => navigate('/dashboard/ai-workspace')}
            data-tooltip="Mazaika AI"
            style={{ color: '#00D9FF' }}
          >
            <Sparkles size={20} />
          </button>
        </div>
      </aside>

      {/* Content area */}
      <div className="app-content">
        {/* Top bar */}
        <header className="app-topbar">
          <div className="topbar-left" style={{ gap: 8 }}>
            {/* Hamburger menu button for mobile screens */}
            <button 
              className="btn btn-ghost btn-sm btn-icon mobile-menu-toggle"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Menu size={18} />
            </button>

            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>
              <ChevronLeft size={16} /> <span className="mobile-hide">Bosh sahifa</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
              {projectType === 'site' ? (
                <>
                  <Globe size={18} style={{ color: 'var(--accent-blue)' }} />
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>{projectName}</span>
                  <span className="badge badge-aqua" style={{ fontSize: '9px', padding: '1px 6px' }}>Sayt</span>
                </>
              ) : (
                <>
                  <Bot size={18} style={{ color: 'var(--accent-blue)' }} />
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>{projectName}</span>
                  <span className="badge badge-aqua" style={{ fontSize: '9px', padding: '1px 6px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }}></span>
                    Faol
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="topbar-center">
            {projectType === 'bot' && (
              <div className="scenario-selector">
                <span>Asosiy ssenariy</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
            )}
          </div>

          <div className="topbar-right" style={{ gap: 8 }}>
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={() => navigate('/dashboard/ai-workspace')}
              style={{ gap: 6, color: '#00D9FF', border: '1px solid rgba(0, 217, 255, 0.35)', background: 'rgba(0, 217, 255, 0.08)' }}
            >
              <Sparkles size={14} /> Mazaika AI
            </button>
            <button 
              className="btn btn-ghost btn-sm btn-icon"
              onClick={() => navigate('/dashboard/profile')}
              title="Profil"
              style={{ borderRadius: '50%', background: 'var(--bg-glass-light)', color: 'var(--text-main)', border: '1px solid var(--border-primary)' }}
            >
              <Users size={16} />
            </button>
            {projectType === 'bot' && (
              <>
                <button 
                  className="btn btn-ghost btn-sm mobile-hide"
                  onClick={() => navigate(`/bot/${botId}/editor`)}
                  title="Redaktorda ochish"
                >
                  <AlertCircle size={14} /> Tekshirish
                </button>
                <button 
                  className="btn btn-primary btn-sm" 
                  style={{ padding: '6px 12px', fontSize: 12 }}
                  onClick={() => {
                    if (botId) {
                      import('../../api/apiClient').then(({ apiClient }) => {
                        apiClient.post(`/bots/${botId}/start`).catch(console.error)
                      })
                    }
                    navigate(`/bot/${botId}/editor`)
                  }}
                >
                  <Play size={14} /> Ishga tushirish
                </button>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <div className="app-page">
          <Outlet />
        </div>
      </div>

      {/* Global Floating AI Contextual Widget */}
      {projectType === 'bot' && <FloatingAICopilot projectType={projectType} />}
    </div>
  )
}
