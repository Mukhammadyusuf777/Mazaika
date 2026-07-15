import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom'
import {
  LayoutGrid, MessageSquare, Megaphone, Users, BarChart2,
  Webhook, Settings, ChevronLeft, Play, AlertCircle, Bot
} from 'lucide-react'
import './AppLayout.css'

const NAV_ITEMS = [
  { icon: LayoutGrid, label: 'Redaktor', path: 'editor', tooltip: 'Vizual redaktor' },
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

  const currentPath = location.pathname.split('/').pop()

  return (
    <div className="app-layout">
      {/* Narrow icon sidebar — like LeadTex */}
      <aside className="app-sidebar">
        {/* Logo */}
        <div className="sidebar-logo" onClick={() => navigate('/dashboard')} data-tooltip="Dashboard">
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
                onClick={() => navigate(`/bot/${botId}/${item.path}`)}
                data-tooltip={item.tooltip}
              >
                <Icon size={20} />
              </button>
            )
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-item" data-tooltip="Yordam">?</div>
        </div>
      </aside>

      {/* Content area */}
      <div className="app-content">
        {/* Top bar */}
        <header className="app-topbar">
          <div className="topbar-left">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>
              <ChevronLeft size={14} /> Loyiha
            </button>
            <div className="topbar-bot-name">
              <Bot size={14} />
              <span>Do'kon Boti</span>
              <span className="badge badge-aqua" style={{ fontSize: '10px', padding: '1px 8px' }}>Faol</span>
            </div>
          </div>

          <div className="topbar-center">
            <div className="scenario-selector">
              <span>Asosiy ssenariy</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
          </div>

          <div className="topbar-right">
            <button className="btn btn-ghost btn-sm">
              <AlertCircle size={14} /> Tekshirish
            </button>
            <button className="btn btn-primary btn-sm">
              <Play size={14} /> Ishga tushirish
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="app-page">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
