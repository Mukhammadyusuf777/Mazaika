import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Bot, Settings, BarChart2, Zap, MessageSquare, TrendingUp, Users, Activity, Globe, Mail, Trash2 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { apiClient } from '../../api/apiClient'
import { useAuthStore } from '../../store/useAuthStore'
import './DashboardPage.css'

const TEMPLATES = [
  { name: 'Internet do\'kon', emoji: '🛒', color: '#1e90ff', desc: 'Tovarlar, savat va to\'lov' },
  { name: 'Yetkazib berish', emoji: '🚚', color: '#00f5c4', desc: 'Buyurtma qabul va tracking' },
  { name: 'Restoran', emoji: '🍕', color: '#ffb830', desc: 'Menyu va bron qilish' },
  { name: 'Kurs savdo', emoji: '🎓', color: '#a855f7', desc: 'Kurslar va to\'lov' },
  { name: 'Xizmatlar', emoji: '⚙️', color: '#06b6d4', desc: 'Arizalar va bog\'lanish' },
  { name: 'Referral', emoji: '🤝', color: '#ff4d8d', desc: 'Referal tizimi' },
]

const MOCK_ANALYTICS_DATA = [
  { name: 'Dush', users: 420, msgs: 1200 },
  { name: 'Sesh', users: 510, msgs: 1450 },
  { name: 'Chor', users: 680, msgs: 2100 },
  { name: 'Pay', users: 720, msgs: 1980 },
  { name: 'Juma', users: 900, msgs: 2600 },
  { name: 'Shan', users: 1100, msgs: 3100 },
  { name: 'Yak', users: 1250, msgs: 2890 },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [bots, setBots] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'bots' | 'analytics' | 'templates' | 'settings'>('bots')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newBotName, setNewBotName] = useState('')
  const [newBotToken, setNewBotToken] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  // Settings tab state
  const [profileName, setProfileName] = useState(user?.name || '')
  const [profileEmail, setProfileEmail] = useState(user?.email || '')
  const [settingsSaved, setSettingsSaved] = useState(false)

  const fetchBots = async () => {
    if (!user) return
    try {
      const res = await apiClient.get(`/bots/user/${user.id}`)
      setBots(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchBots()
  }, [user])

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    try {
      const res = await apiClient.post('/bots', {
        name: newBotName,
        token: newBotToken,
        userId: user.id,
        template: selectedTemplate || undefined
      })
      if (res.data.id) {
        navigate(`/bot/${res.data.id}/editor`)
      }
    } catch (e) {
      alert("Botni yaratishda xatolik yuz berdi. Token to'g'riligini tekshiring.")
    }
  }

  const handleDeleteBot = async (botId: string, botName: string) => {
    if (!window.confirm(`Haqiqatan ham "${botName}" botini o'chirmoqchimisiz?`)) return
    try {
      await apiClient.delete(`/bots/${botId}`)
      fetchBots()
    } catch (e) {
      console.error(e)
      alert("Botni o'chirishda xatolik yuz berdi.")
    }
  }

  const handleTemplateClick = (templateName: string) => {
    setSelectedTemplate(templateName)
    setNewBotName(templateName + ' Boti')
    setNewBotToken('')
    setShowCreateModal(true)
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 2000)
  }

  const totalUsers = bots.reduce((a, b) => a + (b.users || 0), 0)
  const totalMessages = bots.reduce((a, b) => a + (b.messages || 0), 0)
  const activeBots = bots.filter(b => b.status === 'active').length

  return (
    <div className="dashboard">
      {/* ===== SIDEBAR ===== */}
      <aside className="dash-sidebar">
        <div className="dash-logo" onClick={() => navigate('/')}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="2" width="10" height="10" rx="3" fill="#1e90ff"/>
            <rect x="16" y="2" width="10" height="10" rx="3" fill="#00f5c4" opacity="0.8"/>
            <rect x="2" y="16" width="10" height="10" rx="3" fill="#00f5c4" opacity="0.8"/>
            <rect x="16" y="16" width="10" height="10" rx="3" fill="#1e90ff" opacity="0.5"/>
          </svg>
          <span>Mazaika</span>
        </div>

        <nav className="dash-nav">
          <button className={`dash-nav-item ${activeTab === 'bots' ? 'active' : ''}`} onClick={() => setActiveTab('bots')}>
            <Bot size={18} />
            <span>Botlar</span>
          </button>
          <button className={`dash-nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <BarChart2 size={18} />
            <span>Analitika</span>
          </button>
          <button className={`dash-nav-item ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>
            <Zap size={18} />
            <span>Shablonlar</span>
          </button>
          <button className={`dash-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={18} />
            <span>Sozlamalar</span>
          </button>
        </nav>

        <div className="dash-user">
          <div className="dash-avatar">{user?.name?.substring(0, 1).toUpperCase() || 'M'}</div>
          <div className="dash-user-info">
            <div className="dash-user-name">{user?.name || 'Foydalanuvchi'}</div>
            <div className="dash-user-plan">
              <span className="badge badge-aqua">Pro</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="dash-main">
        {/* BOTS TAB */}
        {activeTab === 'bots' && (
          <>
            <div className="dash-topbar">
              <div>
                <h1 className="dash-title">Mening botlarim</h1>
                <p className="dash-subtitle">Barcha Telegram botlaringizni boshqaring</p>
              </div>
              <button className="btn btn-aqua" onClick={() => { setSelectedTemplate(''); setNewBotName(''); setNewBotToken(''); setShowCreateModal(true); }}>
                <Plus size={16} /> Yangi bot
              </button>
            </div>

            <div className="dash-stats">
              <div className="dash-stat-card">
                <div className="stat-icon" style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}>
                  <Bot size={20} />
                </div>
                <div>
                  <div className="stat-value">{bots.length}</div>
                  <div className="stat-label">Jami botlar</div>
                </div>
              </div>
              <div className="dash-stat-card">
                <div className="stat-icon" style={{ background: 'var(--accent-aqua-dim)', color: 'var(--accent-aqua)' }}>
                  <Users size={20} />
                </div>
                <div>
                  <div className="stat-value">{totalUsers.toLocaleString()}</div>
                  <div className="stat-label">Jami foydalanuvchi</div>
                </div>
              </div>
              <div className="dash-stat-card">
                <div className="stat-icon" style={{ background: 'var(--accent-amber-dim)', color: 'var(--accent-amber)' }}>
                  <MessageSquare size={20} />
                </div>
                <div>
                  <div className="stat-value">{totalMessages.toLocaleString()}</div>
                  <div className="stat-label">Jami xabarlar</div>
                </div>
              </div>
              <div className="dash-stat-card">
                <div className="stat-icon" style={{ background: 'var(--accent-emerald-dim)', color: 'var(--accent-emerald)' }}>
                  <Activity size={20} />
                </div>
                <div>
                  <div className="stat-value">{activeBots}</div>
                  <div className="stat-label">Faol botlar</div>
                </div>
              </div>
            </div>

            <div className="bots-section">
              <h2 className="section-title">Botlarim</h2>
              <div className="bots-grid">
                <div className="bot-card create-card" onClick={() => { setSelectedTemplate(''); setNewBotName(''); setNewBotToken(''); setShowCreateModal(true); }}>
                  <div className="create-icon"><Plus size={32} /></div>
                  <div className="create-label">Yangi bot yaratish</div>
                  <div className="create-sub">Token kiritib boshlang</div>
                </div>

                {bots.map(bot => (
                  <div key={bot.id} className="bot-card" onClick={() => navigate(`/bot/${bot.id}/editor`)}
                    style={{ '--bot-color': bot.color || '#1e90ff' } as React.CSSProperties}>
                    <div className="bot-card-header" style={{ position: 'relative' }}>
                      <div className="bot-avatar" style={{ background: `${bot.color || '#1e90ff'}22`, color: bot.color || '#1e90ff' }}>
                        <Bot size={22} />
                      </div>
                      <span className={`bot-status ${bot.status}`} style={{ marginRight: '24px' }}>
                        {bot.status === 'active' ? '● Faol' : '● To\'xtatilgan'}
                      </span>
                      <button
                        style={{
                          position: 'absolute',
                          top: '0px',
                          right: '0px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          border: 'none',
                          borderRadius: '6px',
                          width: '26px',
                          height: '26px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          zIndex: 10
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBot(bot.id, bot.name);
                        }}
                        title="Botni o'chirish"
                        onMouseEnter={(e) => e.currentTarget.style.background = '#ef4444' + '22'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="bot-name">{bot.name}</div>
                    <div className="bot-username">{(bot.token || '').substring(0, 15)}...</div>
                    <div className="bot-stats-row">
                      <div className="bot-stat">
                        <Users size={12} />
                        <span>{(bot.users || 0).toLocaleString()}</span>
                      </div>
                      <div className="bot-stat">
                        <MessageSquare size={12} />
                        <span>{(bot.messages || 0).toLocaleString()}</span>
                      </div>
                      <div className="bot-stat">
                        <TrendingUp size={12} />
                        <span>Ssenariy</span>
                      </div>
                    </div>
                    <div className="bot-glow" style={{ background: bot.color || '#1e90ff' }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="templates-section">
              <h2 className="section-title">Tayyor shablonlar</h2>
              <div className="templates-grid">
                {TEMPLATES.map((t, i) => (
                  <div key={i} className="template-card" style={{ '--t-color': t.color } as React.CSSProperties}
                    onClick={() => handleTemplateClick(t.name)}>
                    <div className="template-emoji">{t.emoji}</div>
                    <div className="template-name">{t.name}</div>
                    <div className="template-desc">{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <>
            <div className="dash-topbar">
              <div>
                <h1 className="dash-title">Tizim Analitikasi</h1>
                <p className="dash-subtitle">Loyihalar bo'yicha umumiy statistika va foydalanuvchilar o'sishi</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '24px' }}>
              <div className="analytics-card" style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-primary)' }}>
                <h3 style={{ marginBottom: '16px', fontWeight: 600 }}>Umumiy o'sish dinamikasi</h3>
                <div style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_ANALYTICS_DATA}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
                      <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                      <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 8 }} />
                      <Area type="monotone" dataKey="users" stroke="var(--accent-blue)" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="analytics-card" style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(30,144,255,0.1)', color: 'var(--accent-blue)' }}><TrendingUp size={20} /></div>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Konversiya koeffitsiyenti</span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800 }}>87.4%</div>
                </div>
                <div className="analytics-card" style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(0,245,196,0.1)', color: 'var(--accent-aqua)' }}><MessageSquare size={20} /></div>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Javob berilgan xabarlar</span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800 }}>98.9%</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <>
            <div className="dash-topbar">
              <div>
                <h1 className="dash-title">Tayyor shablonlar</h1>
                <p className="dash-subtitle">Loyihangizni tezroq boshlash uchun tayyor shablonlardan foydalaning</p>
              </div>
            </div>

            <div className="templates-grid" style={{ marginTop: '24px' }}>
              {TEMPLATES.map((t, i) => (
                <div key={i} className="template-card" style={{ '--t-color': t.color } as React.CSSProperties}
                  onClick={() => handleTemplateClick(t.name)}>
                  <div className="template-emoji">{t.emoji}</div>
                  <div className="template-name">{t.name}</div>
                  <div className="template-desc">{t.desc}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <>
            <div className="dash-topbar">
              <div>
                <h1 className="dash-title">Hisob sozlamalari</h1>
                <p className="dash-subtitle">Profil ma'lumotlarini boshqarish va xavfsizlik sozlamalari</p>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-primary)', marginTop: '24px', maxWidth: '600px' }}>
              <form onSubmit={handleSaveSettings}>
                <div className="input-group" style={{ marginBottom: '16px' }}>
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={16}/> Email manzil</label>
                  <input type="email" className="input" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} required />
                </div>
                <div className="input-group" style={{ marginBottom: '24px' }}>
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Globe size={16}/> Foydalanuvchi ismi</label>
                  <input type="text" className="input" value={profileName} onChange={e => setProfileName(e.target.value)} required />
                </div>

                <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--border-primary)', paddingTop: '24px' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px' }}>
                    {settingsSaved ? 'Saqlandi! ✓' : 'Saqlash'}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </main>

      {/* ===== CREATE MODAL ===== */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Yangi bot yaratish {selectedTemplate && `(${selectedTemplate} shabloni)`}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="token-hint">
                <div className="hint-icon">ℹ</div>
                <p>Token olish uchun <strong>@BotFather</strong> ga boring va <code>/newbot</code> buyrug'ini yuboring</p>
              </div>
              <form onSubmit={handleCreateBot}>
                <div className="input-group" style={{ marginBottom: '16px' }}>
                  <label className="input-label">Bot nomi</label>
                  <input type="text" className="input" placeholder="Mening Do'konim Boti" value={newBotName} onChange={e => setNewBotName(e.target.value)} required />
                </div>
                <div className="input-group" style={{ marginBottom: '24px' }}>
                  <label className="input-label">Telegram API Token</label>
                  <input type="text" className="input" placeholder="123456789:ABCdef..." value={newBotToken} onChange={e => setNewBotToken(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn btn-ghost flex-1" onClick={() => setShowCreateModal(false)}>Bekor qilish</button>
                  <button type="submit" className="btn btn-primary flex-1">Yaratish →</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
