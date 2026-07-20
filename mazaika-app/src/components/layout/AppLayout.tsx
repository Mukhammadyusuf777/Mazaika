import { useState } from 'react'
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom'
import {
  LayoutGrid, MessageSquare, Megaphone, Users, BarChart2,
  Webhook, Settings, ChevronLeft, Play, AlertCircle, Bot,
  AppWindow, Globe, Menu, Sparkles
} from 'lucide-react'
import FloatingAgentWidget from '../ai/FloatingAgentWidget'
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

  const currentPath = location.pathname.split('/').pop()

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
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="2" width="10" height="10" rx="3" fill="#1e90ff"/>
            <rect x="16" y="2" width="10" height="10" rx="3" fill="#00f5c4" opacity="0.8"/>
            <rect x="2" y="16" width="10" height="10" rx="3" fill="#00f5c4" opacity="0.8"/>
            <rect x="16" y="16" width="10" height="10" rx="3" fill="#1e90ff" opacity="0.5"/>
          </svg>
        </div>

        <div className="sidebar-divider" />

        {/* Nav items */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => {
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
            data-tooltip="AI Workspace"
            style={{ color: '#a855f7' }}
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
              style={{ display: 'none', alignItems: 'center', justifyContent: 'center' }}
            >
              <Menu size={18} />
            </button>

            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>
              <ChevronLeft size={16} /> <span className="mobile-hide">Bosh sahifa</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
              <Bot size={18} style={{ color: 'var(--accent-blue)' }} />
              <span style={{ fontWeight: 600, fontSize: '13px' }}>Mazaika Bot</span>
              <span className="badge badge-aqua" style={{ fontSize: '9px', padding: '1px 6px' }}>Faol</span>
            </div>
          </div>

          <div className="topbar-center">
            <div className="scenario-selector">
              <span>Asosiy ssenariy</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
          </div>

          <div className="topbar-right" style={{ gap: 8 }}>
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={() => navigate('/dashboard/ai-workspace')}
              style={{ gap: 6, color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)', background: 'rgba(168, 85, 247, 0.08)' }}
            >
              <Sparkles size={14} /> AI Workspace
            </button>
            <button className="btn btn-ghost btn-sm mobile-hide">
              <AlertCircle size={14} /> Tekshirish
            </button>
            <button className="btn btn-primary btn-sm" style={{ padding: '6px 12px', fontSize: 12 }}>
              <Play size={14} /> Ishga tushirish
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="app-page">
          <Outlet />
        </div>
      </div>

      {/* Global Floating AI Contextual Widget */}
      <FloatingAgentWidget />
    </div>
  )
}
