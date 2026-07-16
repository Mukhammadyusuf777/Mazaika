import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Globe, ArrowRight, ShoppingCart, MessageCircle, Phone, Award } from 'lucide-react'
import { doc, getDoc, collection, query, where, getDocs, runTransaction } from 'firebase/firestore'
import { db } from '../../api/firebase'

declare global {
  interface Window {
    Telegram?: any
  }
}

interface Block {
  id: string
  type: 'hero' | 'about' | 'catalog' | 'blog' | 'contacts' | 'form' | 'loyalty' | 'voting'
  title?: string
  subtitle?: string
  text?: string
  img?: string
  ctaText?: string
  items?: Array<{ id: string; name: string; price: number; desc: string; img?: string }>
  posts?: Array<{ id: string; title: string; text: string }>
  phone?: string
  telegram?: string
  fields?: Array<{ name: string; label: string; type: string; required: boolean }>
  candidates?: string[]
}

interface SiteConfig {
  theme: string
  themeColor: string
  blocks: Block[]
}

export default function SiteRendererPage() {
  const { botId } = useParams<{ botId: string }>()
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [loading, setLoading] = useState(true)

  // Interactive app states
  const [cart, setCart] = useState<any[]>([])
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [telegramUser, setTelegramUser] = useState<any>(null)
  const [userBalance, setUserBalance] = useState<number | null>(null)
  const [votedFor, setVotedFor] = useState<string | null>(null)
  const [votingState, setVotingState] = useState<{ [blockId: string]: string }>({})
  const [formResponses, setFormResponses] = useState<{ [fieldName: string]: string }>({})

  // Fetch Config & Telegram WebApp User
  useEffect(() => {
    // Inject Telegram WebApp SDK script
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-web-app.js'
    script.async = true
    document.body.appendChild(script)

    const fetchConfig = async () => {
      if (!botId) return
      try {
        const docRef = doc(db, 'bots', botId, 'site', 'config')
        const snap = await getDoc(docRef)
        if (snap.exists()) {
          setConfig(snap.data() as SiteConfig)
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
      
      const tgUser = window.Telegram.WebApp.initDataUnsafe?.user
      if (tgUser) {
        setTelegramUser(tgUser)
        setCustomerName(`${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim())
        fetchUserCRMData(tgUser.id.toString())
      }
    }
  }, [config])

  const fetchUserCRMData = async (telegramId: string) => {
    if (!botId) return
    try {
      const contactsRef = collection(db, 'bots', botId, 'contacts')
      const q = query(contactsRef, where('telegramId', '==', telegramId))
      const snap = await getDocs(q)
      if (!snap.empty) {
        const contactDoc = snap.docs[0].data()
        // Load real balance if available
        if (contactDoc.balance !== undefined) {
          setUserBalance(Number(contactDoc.balance))
        }
        // Load vote status if available
        if (contactDoc.state) {
          const stateObj = JSON.parse(contactDoc.state)
          if (stateObj.variables?.voted_for) {
            setVotedFor(stateObj.variables.voted_for)
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch CRM user data:', e)
    }
  }

  // Handle Catalog Order Submission
  const sendOrderToBot = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName || !customerPhone || cart.length === 0) return

    const orderData = {
      action: 'order',
      items: cart.map(i => ({ name: i.name, price: i.price })),
      total: cart.reduce((acc, i) => acc + (i.price * (i.qty || 1)), 0),
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

  // Handle Form Submission
  const handleFormSubmit = (blockTitle: string, fields: any[]) => {
    const responses: { [key: string]: string } = {}
    fields.forEach(f => {
      responses[f.label] = formResponses[f.name] || ''
    })

    const payload = {
      action: 'form_submit',
      formName: blockTitle,
      responses
    }

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.sendData(JSON.stringify(payload))
      window.Telegram.WebApp.close()
    } else {
      let summary = ''
      for (const [k, v] of Object.entries(responses)) {
        summary += `\n- ${k}: ${v}`
      }
      alert(`So'rovnoma yuborildi: "${blockTitle}"${summary}\n\nRahmat!`)
      setFormResponses({})
    }
  }

  // Handle Vote Submission
  const castVote = async (blockId: string) => {
    const candidate = votingState[blockId]
    if (!candidate || !botId) return

    if (votedFor) {
      alert("Kechirasiz, siz allaqachon ovoz bergansiz.")
      return
    }

    try {
      const voterId = telegramUser ? telegramUser.id.toString() : 'guest_' + Date.now()
      const voteDocRef = doc(db, 'bots', botId, 'votes', candidate)

      await runTransaction(db, async (transaction) => {
        const sfDoc = await transaction.get(voteDocRef)
        if (!sfDoc.exists()) {
          transaction.set(voteDocRef, { count: 1, voters: [voterId] })
        } else {
          const data = sfDoc.data()
          const newCount = (data?.count || 0) + 1
          const voters = data?.voters || []
          if (!voters.includes(voterId)) {
            voters.push(voterId)
            transaction.update(voteDocRef, { count: newCount, voters })
          }
        }
      })

      setVotedFor(candidate)
      alert(`Rahmat! Siz muvaffaqiyatli "${candidate}" uchun ovoz berdingiz.`)
    } catch (e: any) {
      console.error(e)
      alert("Ovoz berishda xatolik yuz berdi.")
    }
  }

  // Add Item Helper (Cart)
  const handleAddToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: (i.qty || 1) + 1 } : i)
      }
      return [...prev, { ...item, qty: 1 }]
    })
  }

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0b0f19', color: '#fff' }}>Yuklanmoqda...</div>
  }

  if (!config || !Array.isArray(config.blocks)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0b0f19', color: '#fff', padding: 20, textAlign: 'center' }}>
        <Globe size={48} style={{ color: '#ef4444', marginBottom: 16 }} />
        <h3>Ushbu loyiha uchun sayt yoki mini-ilova hali yaratilmagan.</h3>
        <p style={{ color: '#94a3b8' }}>Mazaika Builder orqali ilk sahifangizni yarating.</p>
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
      
      {/* Dynamic Header Navbar */}
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
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: themeColor, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Award size={20} /> sayt
        </h1>
        <div style={{ display: 'flex', gap: 16 }}>
          {cart.length > 0 && (
            <button 
              onClick={() => setShowOrderModal(true)}
              style={{ background: '#10d974', border: 'none', color: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
            >
              <ShoppingCart size={14} /> Savat ({cart.reduce((acc, i) => acc + (i.qty || 1), 0)})
            </button>
          )}
        </div>
      </header>

      {/* Main Blocks Renderer */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '30px 20px' }}>
        {config.blocks.map(block => (
          <section 
            key={block.id} 
            style={{ 
              marginBottom: 48,
              padding: block.type === 'hero' ? '0' : '30px', 
              background: block.type === 'hero' ? 'transparent' : (isLight ? '#fff' : 'rgba(255,255,255,0.02)'),
              borderRadius: 24,
              border: block.type === 'hero' ? 'none' : (isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.04)'),
              boxShadow: block.type === 'hero' ? 'none' : '0 4px 20px rgba(0,0,0,0.02)'
            }}
          >
            {/* HERO BLOCK */}
            {block.type === 'hero' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40, alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: 'clamp(28px, 6vw, 42px)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 16px 0', letterSpacing: '-0.02em' }}>
                    {block.title}
                  </h2>
                  <p style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.8, margin: '0 0 28px 0' }}>
                    {block.subtitle}
                  </p>
                  <button 
                    onClick={() => {
                      const firstCatalog = document.getElementById('catalog_section')
                      if (firstCatalog) firstCatalog.scrollIntoView({ behavior: 'smooth' })
                    }}
                    style={{ background: themeColor, color: '#fff', border: 'none', padding: '12px 30px', borderRadius: 8, fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: `0 6px 20px color-mix(in srgb, ${themeColor} 30%, transparent)`, display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    {block.ctaText} <ArrowRight size={14} />
                  </button>
                </div>
                {block.img && (
                  <img 
                    src={block.img} 
                    alt="Banner" 
                    style={{ width: '100%', height: 280, borderRadius: 20, objectFit: 'cover', boxShadow: '0 15px 30px rgba(0,0,0,0.2)' }}
                  />
                )}
              </div>
            )}

            {/* ABOUT BLOCK */}
            {block.type === 'about' && (
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 16px 0', color: themeColor }}>{block.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, opacity: 0.8, margin: 0 }}>{block.text}</p>
              </div>
            )}

            {/* CATALOG / DO'KON BLOCK */}
            {block.type === 'catalog' && (
              <div id="catalog_section">
                <h3 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 24px 0', color: themeColor, textAlign: 'center' }}>
                  {block.title}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
                  {(block.items || []).map(item => (
                    <div 
                      key={item.id} 
                      style={{ 
                        background: isLight ? '#f8fafc' : '#0d1321', 
                        borderRadius: 16, 
                        padding: 20, 
                        border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div>
                        {item.img && <img src={item.img} alt={item.name} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10, marginBottom: 12 }} />}
                        <h4 style={{ margin: '0 0 6px 0', fontSize: 15, fontWeight: 700 }}>{item.name}</h4>
                        <p style={{ margin: '0 0 16px 0', fontSize: 12, opacity: 0.7, lineHeight: 1.4 }}>{item.desc}</p>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: themeColor }}>{item.price.toLocaleString()} UZS</span>
                        <button 
                          onClick={() => handleAddToCart(item)}
                          style={{ background: `color-mix(in srgb, ${themeColor} 12%, transparent)`, border: 'none', color: themeColor, borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                        >
                          Savatga
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BLOG / YANGILIKLAR BLOCK */}
            {block.type === 'blog' && (
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 24px 0', color: themeColor }}>{block.title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {(block.posts || []).map(post => (
                    <div 
                      key={post.id} 
                      style={{ 
                        padding: 16, 
                        borderRadius: 12, 
                        background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.01)', 
                        borderLeft: `4px solid ${themeColor}`,
                        borderTop: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.03)',
                        borderRight: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.03)',
                        borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.03)',
                      }}
                    >
                      <h4 style={{ margin: '0 0 6px 0', fontSize: 15, fontWeight: 700 }}>{post.title}</h4>
                      <p style={{ margin: 0, fontSize: 12, opacity: 0.8, lineHeight: 1.5 }}>{post.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CONTACTS BLOCK */}
            {block.type === 'contacts' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px 0', color: themeColor }}>{block.title}</h3>
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 24 }}>
                  {block.phone && (
                    <a href={`tel:${block.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit', fontWeight: 600, fontSize: 14 }}>
                      <Phone size={16} style={{ color: themeColor }} /> {block.phone}
                    </a>
                  )}
                  {block.telegram && (
                    <a href={`https://t.me/${block.telegram}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit', fontWeight: 600, fontSize: 14 }}>
                      <MessageCircle size={16} style={{ color: themeColor }} /> @{block.telegram}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* DYNAMIC FORM BLOCK */}
            {block.type === 'form' && (
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px 0', color: themeColor }}>{block.title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
                  {(block.fields || []).map(f => (
                    <div key={f.name}>
                      <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: isLight ? '#475569' : '#94a3b8' }}>
                        {f.label} {f.required && <span style={{ color: '#ef4444' }}>*</span>}
                      </label>
                      {f.type === 'textarea' ? (
                        <textarea 
                          required={f.required}
                          className="input" 
                          placeholder={f.label} 
                          value={formResponses[f.name] || ''}
                          onChange={e => setFormResponses({ ...formResponses, [f.name]: e.target.value })}
                          style={{ width: '100%', fontSize: 13, minHeight: 60 }}
                        />
                      ) : (
                        <input 
                          type={f.type}
                          required={f.required}
                          className="input" 
                          placeholder={f.label} 
                          value={formResponses[f.name] || ''}
                          onChange={e => setFormResponses({ ...formResponses, [f.name]: e.target.value })}
                          style={{ width: '100%', fontSize: 13 }}
                        />
                      )}
                    </div>
                  ))}
                  <button 
                    onClick={() => handleFormSubmit(block.title || 'So\'rovnoma', block.fields || [])}
                    style={{ background: themeColor, color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}
                  >
                    Yuborish (Submit)
                  </button>
                </div>
              </div>
            )}

            {/* LOYALTY CARD BLOCK */}
            {block.type === 'loyalty' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(16,217,116,0.08)', border: '1px solid #10d974', borderRadius: 16 }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 16, color: '#10d974', fontWeight: 800 }}>{block.title || 'Bonus balansingiz'}</h4>
                  <p style={{ margin: 0, fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                    {telegramUser ? `Telegram ID: ${telegramUser.id}` : 'Faqat Telegram bot ichida ko\'rinadi'}
                  </p>
                </div>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#10d974' }}>
                  {userBalance !== null ? `${userBalance.toLocaleString()} ball` : '75,000 ball'}
                </span>
              </div>
            )}

            {/* VOTING POLL BLOCK */}
            {block.type === 'voting' && (
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px 0', color: themeColor }}>{block.title || 'Ovoz berish'}</h3>
                {votedFor ? (
                  <div style={{ padding: 12, background: 'rgba(16,217,116,0.1)', border: '1px solid #10d974', borderRadius: 10, color: '#10d974', fontSize: 13, fontWeight: 700 }}>
                    ✓ Rahmat! Siz allaqachon ovoz bergansiz. (Ovozingiz: "{votedFor}")
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 320 }}>
                    {(block.candidates || []).map((cand, idx) => (
                      <label 
                        key={idx} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 10, 
                          fontSize: 13, 
                          background: votingState[block.id] === cand ? 'rgba(30,144,255,0.08)' : 'rgba(255,255,255,0.02)', 
                          border: votingState[block.id] === cand ? `1.5px solid ${themeColor}` : '1.5px solid rgba(255,255,255,0.05)',
                          padding: '10px 16px', 
                          borderRadius: 10, 
                          cursor: 'pointer',
                          fontWeight: 600,
                          transition: 'all 0.2s'
                        }}
                      >
                        <input 
                          type="radio" 
                          name={`vote_group_${block.id}`} 
                          value={cand}
                          checked={votingState[block.id] === cand}
                          onChange={() => setVotingState({ ...votingState, [block.id]: cand })}
                          style={{ accentColor: themeColor }}
                        />
                        <span>{cand}</span>
                      </label>
                    ))}
                    <button 
                      onClick={() => castVote(block.id)}
                      disabled={!votingState[block.id]}
                      style={{ 
                        background: votingState[block.id] ? themeColor : '#475569', 
                        color: '#fff', 
                        border: 'none', 
                        padding: '10px 20px', 
                        borderRadius: 8, 
                        fontSize: 13, 
                        fontWeight: 700, 
                        cursor: votingState[block.id] ? 'pointer' : 'not-allowed', 
                        marginTop: 8 
                      }}
                    >
                      Ovoz berish
                    </button>
                  </div>
                )}
              </div>
            )}

          </section>
        ))}
      </main>

      {/* Checkout Modal */}
      {showOrderModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <form onSubmit={sendOrderToBot} style={{ background: isLight ? '#fff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: 24, padding: 28, width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Buyurtmani rasmiylashtirish</h3>
              <button type="button" onClick={() => setShowOrderModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 14, cursor: 'pointer' }}>Yopish</button>
            </div>
            
            <div style={{ fontSize: 13, background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 12, maxHeight: 150, overflowY: 'auto' }}>
              {cart.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0' }}>
                  <span>{item.name} x {item.qty || 1}</span>
                  <strong>{((item.price) * (item.qty || 1)).toLocaleString()} UZS</strong>
                </div>
              ))}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 14 }}>
                <span>Jami:</span>
                <span style={{ color: themeColor }}>{cart.reduce((acc, i) => acc + (i.price * (i.qty || 1)), 0).toLocaleString()} UZS</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, color: '#94a3b8' }}>Mijoz ismi</label>
              <input 
                type="text" 
                required
                style={{ background: isLight ? '#fff' : '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: 10, color: isLight ? '#0f172a' : '#fff', fontSize: 14 }}
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, color: '#94a3b8' }}>Telefon raqam</label>
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
              style={{ background: '#10d974', border: 'none', color: '#fff', borderRadius: 10, padding: 14, fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 10, boxShadow: '0 4px 12px rgba(16, 217, 116, 0.2)' }}
            >
              Tasdiqlash va botga yuborish
            </button>
          </form>
        </div>
      )}

    </div>
  )
}
