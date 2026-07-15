import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Globe, Save, Eye, Trash2 } from 'lucide-react'

import { getSiteConfig, saveSiteConfig } from '../../api/firestore'

interface SiteConfig {
  theme: string
  themeColor: string
  hero: { title: string; subtitle: string; ctaText: string; img: string }
  about: { title: string; text: string }
  catalog: { title: string; items: Array<{ id: string; name: string; price: number; desc: string }> }
  blog: { title: string; posts: Array<{ id: string; title: string; text: string }> }
  contacts: { title: string; phone: string; telegram: string }
}

const DEFAULT_CONFIG: SiteConfig = {
  theme: 'glassmorphism',
  themeColor: '#1e90ff',
  hero: {
    title: 'Premium Bot Xizmatlari',
    subtitle: 'Biznesingiz uchun eng kuchli Telegram botlar va Mini App tizimlari.',
    ctaText: 'Buyurtma berish',
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'
  },
  about: {
    title: 'Biz haqimizda',
    text: 'Mazaika yordamida kod yozmasdan turib shaxsiy Telegram botingizni, mini-ilovangizni va saytingizni yarating!'
  },
  catalog: {
    title: 'Mahsulotlar va Xizmatlar',
    items: [
      { id: '1', name: 'Telegram Bot (Boshlang\'ich)', price: 450000, desc: 'Oddiy savol-javob va aloqa boti.' },
      { id: '2', name: 'Premium Mini App Do\'kon', price: 950000, desc: 'Bot ichida ishlovchi to\'liq do\'kon tizimi.' }
    ]
  },
  blog: {
    title: 'Foydali Maqolalar',
    posts: [
      { id: '1', title: 'Mini ilovalar nega kerak?', text: 'Telegram Web App orqali mijozlar bilan muloqotni avtomatlashtirish.' }
    ]
  },
  contacts: {
    title: 'Kontaktlarimiz',
    phone: '+998 90 123 45 67',
    telegram: 'MazaikaSupportBot'
  }
}

export default function SiteBuilderPage() {
  const { botId } = useParams<{ botId: string }>()
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'catalog' | 'blog' | 'contacts' | 'design'>('design')

  useEffect(() => {
    const fetchConfig = async () => {
      if (!botId) return
      setIsLoading(true)
      try {
        const data = await getSiteConfig(botId)
        if (data) {
          setConfig(data as SiteConfig)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchConfig()
  }, [botId])

  const handleSave = async () => {
    if (!botId) return
    setIsLoading(true)
    try {
      await saveSiteConfig(botId, config)
      alert('Sayt dizayni muvaffaqiyatli saqlanib, internetda chop etildi!')
    } catch (e) {
      alert('Saytni saqlashda xatolik yuz berdi!')
    } finally {
      setIsLoading(false)
    }
  }

  const liveUrl = `https://mazaika.pages.dev/site/${botId}`

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', height: '100%', overflow: 'hidden', background: '#0b0f19' }}>
      
      {/* Left panel: Builder controls */}
      <div style={{ borderRight: '1px solid var(--border-primary)', display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-card)' }}>
        
        {/* Header */}
        <div style={{ padding: 'var(--space-5)', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 'var(--text-lg)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe size={18} style={{ color: 'var(--accent-blue)' }} /> Sayt Konstruktori
            </h3>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>No-code sayt va landing page yaratish</span>
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={isLoading}>
            <Save size={14} /> {isLoading ? 'Saqlash...' : 'Saqlash'}
          </button>
        </div>

        {/* Live link helper */}
        <div style={{ padding: 'var(--space-4)', background: '#1e293b', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
          <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
            {liveUrl}
          </span>
          <a href={`/site/${botId}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-xs" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Eye size={12} /> Ochish
          </a>
        </div>

        {/* Tab buttons */}
        <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.03)', padding: 4, borderBottom: '1px solid var(--border-primary)' }}>
          {(['design', 'hero', 'about', 'catalog', 'blog', 'contacts'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '8px 4px',
                fontSize: 11,
                fontWeight: 600,
                border: 'none',
                background: activeTab === tab ? '#1e90ff' : 'transparent',
                color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {tab === 'catalog' ? 'Katalog' : tab === 'contacts' ? 'Kontakt' : tab === 'design' ? 'Mavzu' : tab}
            </button>
          ))}
        </div>

        {/* Config Inputs panel */}
        <div style={{ padding: 'var(--space-5)', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          
          {activeTab === 'design' && (
            <>
              <h4 style={{ fontWeight: 600, fontSize: 14 }}>Mavzu va ranglar</h4>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Sayt mavzusi</label>
                <select 
                  className="input" 
                  value={config.theme} 
                  onChange={e => setConfig({ ...config, theme: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="glassmorphism">Modern Glassmorphism (Dark)</option>
                  <option value="minimalist">Minimalist Light (Oq)</option>
                  <option value="neon">Neon Cyberpunk</option>
                  <option value="retro">Sunset Warm</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Asosiy rang</label>
                <input 
                  type="color" 
                  value={config.themeColor} 
                  onChange={e => setConfig({ ...config, themeColor: e.target.value })}
                  style={{ width: 60, height: 35, border: 'none', padding: 0, borderRadius: 4, cursor: 'pointer' }}
                />
              </div>
            </>
          )}

          {activeTab === 'hero' && (
            <>
              <h4 style={{ fontWeight: 600, fontSize: 14 }}>Bosh ekran (Hero Banner)</h4>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Sarlavha</label>
                <input 
                  type="text" 
                  className="input" 
                  value={config.hero.title} 
                  onChange={e => setConfig({ ...config, hero: { ...config.hero, title: e.target.value } })}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Sub-sarlavha</label>
                <textarea 
                  className="input" 
                  value={config.hero.subtitle} 
                  onChange={e => setConfig({ ...config, hero: { ...config.hero, subtitle: e.target.value } })}
                  style={{ width: '100%', minHeight: 60 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Tugma matni (CTA)</label>
                <input 
                  type="text" 
                  className="input" 
                  value={config.hero.ctaText} 
                  onChange={e => setConfig({ ...config, hero: { ...config.hero, ctaText: e.target.value } })}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Banner rasmi (URL)</label>
                <input 
                  type="text" 
                  className="input" 
                  value={config.hero.img} 
                  onChange={e => setConfig({ ...config, hero: { ...config.hero, img: e.target.value } })}
                  style={{ width: '100%' }}
                />
              </div>
            </>
          )}

          {activeTab === 'about' && (
            <>
              <h4 style={{ fontWeight: 600, fontSize: 14 }}>Biz haqimizda</h4>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Bo'lim sarlavhasi</label>
                <input 
                  type="text" 
                  className="input" 
                  value={config.about.title} 
                  onChange={e => setConfig({ ...config, about: { ...config.about, title: e.target.value } })}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Matn</label>
                <textarea 
                  className="input" 
                  value={config.about.text} 
                  onChange={e => setConfig({ ...config, about: { ...config.about, text: e.target.value } })}
                  style={{ width: '100%', minHeight: 120 }}
                />
              </div>
            </>
          )}

          {activeTab === 'catalog' && (
            <>
              <h4 style={{ fontWeight: 600, fontSize: 14 }}>Katalog (Mahsulotlar/Xizmatlar)</h4>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Bo'lim sarlavhasi</label>
                <input 
                  type="text" 
                  className="input" 
                  value={config.catalog.title} 
                  onChange={e => setConfig({ ...config, catalog: { ...config.catalog, title: e.target.value } })}
                  style={{ width: '100%' }}
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                {config.catalog.items.map((item, idx) => (
                  <div key={item.id} style={{ background: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-primary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>№ {idx + 1}</span>
                      <button className="btn btn-ghost btn-xs" style={{ color: '#ef4444' }} onClick={() => {
                        const updated = config.catalog.items.filter(i => i.id !== item.id)
                        setConfig({ ...config, catalog: { ...config.catalog, items: updated } })
                      }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="Nomi" 
                      value={item.name} 
                      onChange={e => {
                        const updated = [...config.catalog.items]
                        updated[idx].name = e.target.value
                        setConfig({ ...config, catalog: { ...config.catalog, items: updated } })
                      }}
                    />
                    <input 
                      type="number" 
                      className="input" 
                      placeholder="Narxi (UZS)" 
                      value={item.price} 
                      onChange={e => {
                        const updated = [...config.catalog.items]
                        updated[idx].price = parseInt(e.target.value) || 0
                        setConfig({ ...config, catalog: { ...config.catalog, items: updated } })
                      }}
                    />
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="Tavsif" 
                      value={item.desc} 
                      onChange={e => {
                        const updated = [...config.catalog.items]
                        updated[idx].desc = e.target.value
                        setConfig({ ...config, catalog: { ...config.catalog, items: updated } })
                      }}
                    />
                  </div>
                ))}

                <button className="btn btn-ghost btn-sm" onClick={() => {
                  const newItem = { id: Date.now().toString(), name: 'Yangi xizmat/mahsulot', price: 100000, desc: 'Tavsif' }
                  setConfig({ ...config, catalog: { ...config.catalog, items: [...config.catalog.items, newItem] } })
                }}>
                  + Maxsulot qo'shish
                </button>
              </div>
            </>
          )}

          {activeTab === 'blog' && (
            <>
              <h4 style={{ fontWeight: 600, fontSize: 14 }}>Blog / Maqolalar</h4>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Bo'lim sarlavhasi</label>
                <input 
                  type="text" 
                  className="input" 
                  value={config.blog.title} 
                  onChange={e => setConfig({ ...config, blog: { ...config.blog, title: e.target.value } })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                {config.blog.posts.map((post, idx) => (
                  <div key={post.id} style={{ background: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-primary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>Maqola № {idx + 1}</span>
                      <button className="btn btn-ghost btn-xs" style={{ color: '#ef4444' }} onClick={() => {
                        const updated = config.blog.posts.filter(p => p.id !== post.id)
                        setConfig({ ...config, blog: { ...config.blog, posts: updated } })
                      }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="Mavzu nomi" 
                      value={post.title} 
                      onChange={e => {
                        const updated = [...config.blog.posts]
                        updated[idx].title = e.target.value
                        setConfig({ ...config, blog: { ...config.blog, posts: updated } })
                      }}
                    />
                    <textarea 
                      className="input" 
                      placeholder="Maqola matni" 
                      value={post.text} 
                      onChange={e => {
                        const updated = [...config.blog.posts]
                        updated[idx].text = e.target.value
                        setConfig({ ...config, blog: { ...config.blog, posts: updated } })
                      }}
                      style={{ minHeight: 60 }}
                    />
                  </div>
                ))}

                <button className="btn btn-ghost btn-sm" onClick={() => {
                  const newPost = { id: Date.now().toString(), title: 'Yangi maqola sarlavhasi', text: 'Maqola matni bu yerda bo\'ladi.' }
                  setConfig({ ...config, blog: { ...config.blog, posts: [...config.blog.posts, newPost] } })
                }}>
                  + Maqola qo'shish
                </button>
              </div>
            </>
          )}

          {activeTab === 'contacts' && (
            <>
              <h4 style={{ fontWeight: 600, fontSize: 14 }}>Kontaktlar</h4>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Bo'lim sarlavhasi</label>
                <input 
                  type="text" 
                  className="input" 
                  value={config.contacts.title} 
                  onChange={e => setConfig({ ...config, contacts: { ...config.contacts, title: e.target.value } })}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Telefon raqam</label>
                <input 
                  type="text" 
                  className="input" 
                  value={config.contacts.phone} 
                  onChange={e => setConfig({ ...config, contacts: { ...config.contacts, phone: e.target.value } })}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Telegram username (kuchukchasiz)</label>
                <input 
                  type="text" 
                  className="input" 
                  value={config.contacts.telegram} 
                  onChange={e => setConfig({ ...config, contacts: { ...config.contacts, telegram: e.target.value } })}
                  style={{ width: '100%' }}
                />
              </div>
            </>
          )}

        </div>
      </div>

      {/* Right panel: Live Preview in simulated browser */}
      <div style={{ padding: 30, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ background: '#1e293b', borderRadius: '12px 12px 0 0', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #334155' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fbbf24' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }} />
          </div>
          <div style={{ background: '#0f172a', borderRadius: 6, padding: '4px 12px', fontSize: 11, flex: 1, color: '#94a3b8', textAlign: 'center', fontFamily: 'monospace' }}>
            {liveUrl}
          </div>
        </div>

        {/* Preview Frame */}
        <div style={{ 
          flex: 1, 
          background: config.theme === 'minimalist' ? '#f8fafc' : '#090d16', 
          color: config.theme === 'minimalist' ? '#0f172a' : '#fff',
          overflowY: 'auto',
          border: '1px solid #334155',
          borderTop: 'none',
          borderRadius: '0 0 12px 12px',
          padding: 30,
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          {/* Header */}
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 50 }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: config.themeColor }}>⭐ Website</h1>
            <nav style={{ display: 'flex', gap: 20, fontSize: 13, fontWeight: 500, color: config.theme === 'minimalist' ? '#475569' : '#94a3b8' }}>
              <span>Bosh sahifa</span>
              <span>Katalog</span>
              <span>Maqolalar</span>
              <span>Kontakt</span>
            </nav>
          </header>

          {/* Hero Banner */}
          <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 30, alignItems: 'center', marginBottom: 80 }}>
            <div>
              <h2 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, margin: '0 0 16px 0' }}>{config.hero.title}</h2>
              <p style={{ fontSize: 15, lineHeight: 1.5, opacity: 0.8, margin: '0 0 24px 0' }}>{config.hero.subtitle}</p>
              <button style={{ background: config.themeColor, color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                {config.hero.ctaText}
              </button>
            </div>
            <img 
              src={config.hero.img || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400'} 
              alt="Hero banner" 
              style={{ width: '100%', height: 220, borderRadius: 16, objectFit: 'cover' }}
            />
          </section>

          {/* About section */}
          <section style={{ marginBottom: 80, padding: 30, background: config.theme === 'minimalist' ? '#f1f5f9' : 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 12px 0', color: config.themeColor }}>{config.about.title}</h3>
            <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.8, margin: 0 }}>{config.about.text}</p>
          </section>

          {/* Catalog / Products Section */}
          <section style={{ marginBottom: 80 }}>
            <h3 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 24px 0', color: config.themeColor }}>{config.catalog.title}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {config.catalog.items.map(item => (
                <div key={item.id} style={{ background: config.theme === 'minimalist' ? '#fff' : '#111827', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 20, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 700 }}>{item.name}</h4>
                  <p style={{ margin: '0 0 16px 0', fontSize: 12, opacity: 0.7, minHeight: 36 }}>{item.desc}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: config.themeColor }}>{item.price.toLocaleString()} UZS</span>
                    <button style={{ background: 'none', border: `1.5px solid ${config.themeColor}`, color: config.themeColor, borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>
                      Buyurtma
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Blog Section */}
          <section style={{ marginBottom: 80 }}>
            <h3 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 24px 0', color: config.themeColor }}>{config.blog.title}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {config.blog.posts.map(post => (
                <div key={post.id} style={{ padding: 20, borderLeft: `3px solid ${config.themeColor}`, background: config.theme === 'minimalist' ? '#fff' : 'rgba(255,255,255,0.01)' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 700 }}>{post.title}</h4>
                  <p style={{ margin: 0, fontSize: 13, opacity: 0.8, lineHeight: 1.5 }}>{post.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Contacts Section */}
          <section style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 40, textAlign: 'center' }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 16px 0', color: config.themeColor }}>{config.contacts.title}</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 30, fontSize: 14 }}>
              <div>📞 Tel: <strong style={{ color: config.themeColor }}>{config.contacts.phone}</strong></div>
              <div>✈ Telegram: <strong style={{ color: config.themeColor }}>@{config.contacts.telegram}</strong></div>
            </div>
          </section>

        </div>
      </div>

    </div>
  )
}
