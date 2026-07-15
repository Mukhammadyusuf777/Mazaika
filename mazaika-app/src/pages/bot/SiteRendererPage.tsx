import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getSiteConfig } from '../../api/firestore'
import { Globe, ArrowRight, ShoppingCart, MessageCircle, Phone, Award } from 'lucide-react'

declare global {
  interface Window {
    Telegram?: any
  }
}

interface SiteConfig {
  theme: string
  themeColor: string
  hero: { title: string; subtitle: string; ctaText: string; img: string }
  about: { title: string; text: string }
  catalog: { title: string; items: Array<{ id: string; name: string; price: number; desc: string }> }
  blog: { title: string; posts: Array<{ id: string; title: string; text: string }> }
  contacts: { title: string; phone: string; telegram: string }
}

export default function SiteRendererPage() {
  const { botId } = useParams<{ botId: string }>()
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [loading, setLoading] = useState(true)

  // Order state
  const [cart, setCart] = useState<any[]>([])
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  useEffect(() => {
    // Inject Telegram WebApp SDK script just in case it's opened as a Web App
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-web-app.js'
    script.async = true
    document.body.appendChild(script)

    const fetchConfig = async () => {
      if (!botId) return
      try {
        const data = await getSiteConfig(botId)
        if (data) {
          setConfig(data as SiteConfig)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()

    return () => {
      document.body.removeChild(script)
    }
  }, [botId])

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready()
      window.Telegram.WebApp.expand()
    }
  }, [config])

  const sendOrderToBot = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName || !customerPhone || cart.length === 0) return

    const orderData = {
      action: 'order',
      items: cart.map(i => ({ name: i.name, price: i.price })),
      total: cart.reduce((acc, i) => acc + i.price, 0),
      customer: { name: customerName, phone: customerPhone }
    }

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.sendData(JSON.stringify(orderData))
      window.Telegram.WebApp.close()
    } else {
      alert(`Buyurtma qabul qilindi!\nIsm: ${customerName}\nTel: ${customerPhone}\nJami: ${orderData.total.toLocaleString()} UZS\n\nTez orada bog'lanamiz!`)
      setShowOrderModal(false)
      setCart([])
    }
  }

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0b0f19', color: '#fff' }}>Yuklanmoqda...</div>
  }

  if (!config) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0b0f19', color: '#fff', padding: 20, textAlign: 'center' }}>
        <Globe size={48} style={{ color: '#ef4444', marginBottom: 16 }} />
        <h3>Ushbu loyiha uchun veb-sayt hali yaratilmagan.</h3>
        <p style={{ color: '#94a3b8' }}>Konstruktordan foydalanib ilk saytingizni yarating.</p>
      </div>
    )
  }

  const isLight = config.theme === 'minimalist'
  const isNeon = config.theme === 'neon'
  const themeColor = config.themeColor || '#1e90ff'

  return (
    <div style={{ 
      background: isLight ? '#f8fafc' : isNeon ? '#05050d' : '#090d16',
      color: isLight ? '#0f172a' : '#fff',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      scrollBehavior: 'smooth',
      paddingBottom: 80
    }}>
      
      {/* Navbar */}
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 50, 
        backdropFilter: 'blur(12px)', 
        background: isLight ? 'rgba(248, 250, 252, 0.8)' : 'rgba(9, 13, 22, 0.8)',
        borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.05)',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: themeColor, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Award size={20} /> sayt
        </h1>
        <div style={{ display: 'flex', gap: 16 }}>
          {cart.length > 0 && (
            <button 
              onClick={() => setShowOrderModal(true)}
              style={{ background: '#10d974', border: 'none', color: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
            >
              <ShoppingCart size={14} /> Savat ({cart.length})
            </button>
          )}
          <a href={`https://t.me/${config.contacts.telegram}`} target="_blank" rel="noreferrer" style={{ background: themeColor, color: '#fff', borderRadius: 8, padding: '6px 16px', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <MessageCircle size={14} /> Telegram
          </a>
        </div>
      </header>

      {/* Hero Banner */}
      <section style={{ 
        maxWidth: 1000, 
        margin: '0 auto', 
        padding: '60px 24px', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: 40, 
        alignItems: 'center' 
      }}>
        <div>
          <h2 style={{ fontSize: 'clamp(32px, 8vw, 48px)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 20px 0', letterSpacing: '-0.02em' }}>
            {config.hero.title}
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.6, opacity: 0.8, margin: '0 0 32px 0' }}>
            {config.hero.subtitle}
          </p>
          <button 
            onClick={() => {
              const el = document.getElementById('catalog')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
            style={{ background: themeColor, color: '#fff', border: 'none', padding: '14px 36px', borderRadius: 8, fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: `0 6px 20px color-mix(in srgb, ${themeColor} 30%, transparent)`, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {config.hero.ctaText} <ArrowRight size={16} />
          </button>
        </div>
        <img 
          src={config.hero.img || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'} 
          alt="Banner" 
          style={{ width: '100%', height: 320, borderRadius: 24, objectFit: 'cover', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
        />
      </section>

      {/* About Section */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ 
          background: isLight ? '#fff' : 'rgba(255,255,255,0.02)', 
          borderRadius: 24, 
          padding: '40px 30px', 
          border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
        }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 16px 0', color: themeColor }}>{config.about.title}</h3>
          <p style={{ fontSize: 15, lineHeight: 1.7, opacity: 0.8, margin: 0 }}>{config.about.text}</p>
        </div>
      </section>

      {/* Catalog Section */}
      <section id="catalog" style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px' }}>
        <h3 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 32px 0', textAlign: 'center', letterSpacing: '-0.01em' }}>
          {config.catalog.title}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {config.catalog.items.map(item => (
            <div 
              key={item.id} 
              style={{ 
                background: isLight ? '#fff' : '#111827', 
                borderRadius: 16, 
                padding: 24, 
                border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s'
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 700 }}>{item.name}</h4>
                <p style={{ margin: '0 0 20px 0', fontSize: 13, opacity: 0.7, lineHeight: 1.5 }}>{item.desc}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 16, fontWeight: 900, color: themeColor }}>{item.price.toLocaleString()} UZS</span>
                <button 
                  onClick={() => setCart(prev => [...prev, item])}
                  style={{ background: `color-mix(in srgb, ${themeColor} 10%, transparent)`, border: 'none', color: themeColor, borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  Buyurtma
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Blog Section */}
      {config.blog.posts.length > 0 && (
        <section style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px' }}>
          <h3 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 32px 0', textAlign: 'center' }}>
            {config.blog.title}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {config.blog.posts.map(post => (
              <div 
                key={post.id} 
                style={{ 
                  padding: 24, 
                  borderRadius: 16, 
                  background: isLight ? '#fff' : 'rgba(255,255,255,0.01)', 
                  borderLeft: `4px solid ${themeColor}`,
                  borderTop: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.03)',
                  borderRight: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.03)',
                  borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.03)',
                }}
              >
                <h4 style={{ margin: '0 0 10px 0', fontSize: 18, fontWeight: 700 }}>{post.title}</h4>
                <p style={{ margin: 0, fontSize: 14, opacity: 0.8, lineHeight: 1.6 }}>{post.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contacts Section */}
      <footer style={{ 
        borderTop: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.05)', 
        background: isLight ? '#f1f5f9' : '#05070c', 
        padding: '60px 24px', 
        textAlign: 'center' 
      }}>
        <h3 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 16px 0', color: themeColor }}>{config.contacts.title}</h3>
        <p style={{ margin: '0 0 32px 0', color: isLight ? '#475569' : '#94a3b8' }}>Savollaringiz bormi? Biz bilan bog'laning:</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 24 }}>
          <a href={`tel:${config.contacts.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit', fontWeight: 600, fontSize: 15 }}>
            <Phone size={18} style={{ color: themeColor }} /> {config.contacts.phone}
          </a>
          <a href={`https://t.me/${config.contacts.telegram}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit', fontWeight: 600, fontSize: 15 }}>
            <MessageCircle size={18} style={{ color: themeColor }} /> @{config.contacts.telegram}
          </a>
        </div>
      </footer>

      {/* Checkout Modal */}
      {showOrderModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <form onSubmit={sendOrderToBot} style={{ background: isLight ? '#fff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: 20, padding: 24, width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Buyurtma berish</h3>
              <button type="button" onClick={() => setShowOrderModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 14, cursor: 'pointer' }}>Yopish</button>
            </div>
            
            <div style={{ fontSize: 14, background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8 }}>
              {cart.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                  <span>{item.name}</span>
                  <strong>{item.price.toLocaleString()} UZS</strong>
                </div>
              ))}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                <span>Jami:</span>
                <span style={{ color: themeColor }}>{cart.reduce((acc, i) => acc + i.price, 0).toLocaleString()} UZS</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 13, color: '#94a3b8' }}>Ismingiz</label>
              <input 
                type="text" 
                required
                style={{ background: isLight ? '#fff' : '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: 10, color: isLight ? '#0f172a' : '#fff', fontSize: 14 }}
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 13, color: '#94a3b8' }}>Telefon raqamingiz</label>
              <input 
                type="tel" 
                required
                style={{ background: isLight ? '#fff' : '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: 10, color: isLight ? '#0f172a' : '#fff', fontSize: 14 }}
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              style={{ background: '#10d974', border: 'none', color: '#fff', borderRadius: 8, padding: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 10, boxShadow: '0 4px 12px rgba(16, 217, 116, 0.2)' }}
            >
              Tasdiqlash va botga yuborish
            </button>
          </form>
        </div>
      )}

    </div>
  )
}
