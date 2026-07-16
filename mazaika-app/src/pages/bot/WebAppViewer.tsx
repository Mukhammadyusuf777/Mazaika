import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
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

export default function WebAppViewer() {
  const { botId } = useParams<{ botId: string; appId: string }>()
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [loading, setLoading] = useState(true)

  // Interactive app states
  const [cart, setCart] = useState<any[]>([])
  const [showOrderSheet, setShowOrderSheet] = useState(false)
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

  // Send Data helper to close WebApp and submit to Bot
  const sendDataToBot = (data: any) => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.sendData(JSON.stringify(data))
      window.Telegram.WebApp.close()
    } else {
      alert('Telegramdan tashqarida ochildi. Botga yuboriladigan ma\'lumot:\n' + JSON.stringify(data, null, 2))
    }
  }

  // Handle Catalog Order Submission
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName || !customerPhone || cart.length === 0) return

    const orderData = {
      action: 'order',
      items: cart.map(i => ({ name: i.name, price: i.price })),
      total: cart.reduce((acc, i) => acc + (i.price * (i.qty || 1)), 0),
      customer: { name: customerName, phone: customerPhone }
    }
    sendDataToBot(orderData)
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
    sendDataToBot(payload)
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
        <h3>Ilova sozlamalari topilmadi.</h3>
        <p style={{ color: '#94a3b8' }}>Konstruktorda loyihangizni yarating.</p>
      </div>
    )
  }

  const themeColor = config.themeColor || '#1e90ff'

  return (
    <div style={{ 
      background: '#090d16',
      color: '#fff',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      paddingBottom: cart.length > 0 ? 100 : 40
    }}>
      
      {/* App Header Banner */}
      <div style={{ background: themeColor, padding: '24px 20px', textAlign: 'center', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Telegram Mini App</h2>
        <span style={{ fontSize: 11, opacity: 0.8 }}>Mazaika Unified WebApp</span>
      </div>

      {/* Blocks List */}
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {config.blocks.map(block => (
          <section 
            key={block.id} 
            style={{ 
              padding: block.type === 'hero' ? '0' : '20px', 
              background: block.type === 'hero' ? 'transparent' : 'rgba(255,255,255,0.02)',
              borderRadius: 16,
              border: block.type === 'hero' ? 'none' : '1px solid rgba(255,255,255,0.04)'
            }}
          >
            {/* HERO BLOCK */}
            {block.type === 'hero' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {block.img && (
                  <img 
                    src={block.img} 
                    alt="Banner" 
                    style={{ width: '100%', height: 160, borderRadius: 16, objectFit: 'cover' }}
                  />
                )}
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px 0' }}>{block.title}</h3>
                  <p style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.8, margin: '0 0 16px 0' }}>{block.subtitle}</p>
                </div>
              </div>
            )}

            {/* ABOUT BLOCK */}
            {block.type === 'about' && (
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 10px 0', color: themeColor }}>{block.title}</h4>
                <p style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.8, margin: 0 }}>{block.text}</p>
              </div>
            )}

            {/* CATALOG BLOCK */}
            {block.type === 'catalog' && (
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 16px 0', color: themeColor, textAlign: 'center' }}>{block.title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(block.items || []).map(item => (
                    <div key={item.id} style={{ background: '#111827', borderRadius: 12, padding: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                      {item.img && <img src={item.img} alt={item.name} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />}
                      <div style={{ flex: 1 }}>
                        <h5 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{item.name}</h5>
                        <p style={{ margin: '2px 0 6px 0', fontSize: 11, opacity: 0.6 }}>{item.desc}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: themeColor }}>{item.price.toLocaleString()} UZS</span>
                          <button 
                            onClick={() => handleAddToCart(item)}
                            style={{ background: themeColor, border: 'none', color: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}
                          >
                            + Qo'shish
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BLOG BLOCK */}
            {block.type === 'blog' && (
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 16px 0', color: themeColor }}>{block.title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(block.posts || []).map(post => (
                    <div key={post.id} style={{ padding: 12, borderLeft: `3px solid ${themeColor}`, background: 'rgba(255,255,255,0.01)' }}>
                      <h5 style={{ margin: '0 0 4px 0', fontSize: 13, fontWeight: 700 }}>{post.title}</h5>
                      <p style={{ margin: 0, fontSize: 11, opacity: 0.7 }}>{post.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CONTACTS BLOCK */}
            {block.type === 'contacts' && (
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 12px 0', color: themeColor }}>{block.title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', fontSize: 13 }}>
                  {block.phone && <div>📞 Tel: <strong>{block.phone}</strong></div>}
                  {block.telegram && <div>✈ Telegram: <strong>@{block.telegram}</strong></div>}
                </div>
              </div>
            )}

            {/* FORM BLOCK */}
            {block.type === 'form' && (
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 12px 0', color: themeColor }}>{block.title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(block.fields || []).map(f => (
                    <div key={f.name}>
                      <label style={{ display: 'block', fontSize: 11, marginBottom: 4, color: '#94a3b8' }}>{f.label}</label>
                      {f.type === 'textarea' ? (
                        <textarea 
                          required={f.required}
                          className="input" 
                          placeholder={f.label} 
                          value={formResponses[f.name] || ''}
                          onChange={e => setFormResponses({ ...formResponses, [f.name]: e.target.value })}
                          style={{ width: '100%', fontSize: 13, minHeight: 60, background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: 8, padding: 8 }}
                        />
                      ) : (
                        <input 
                          type={f.type}
                          required={f.required}
                          className="input" 
                          placeholder={f.label} 
                          value={formResponses[f.name] || ''}
                          onChange={e => setFormResponses({ ...formResponses, [f.name]: e.target.value })}
                          style={{ width: '100%', fontSize: 13, background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: 8, padding: 8 }}
                        />
                      )}
                    </div>
                  ))}
                  <button 
                    onClick={() => handleFormSubmit(block.title || 'So\'rovnoma', block.fields || [])}
                    style={{ background: themeColor, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, fontSize: 12, fontWeight: 700, marginTop: 4 }}
                  >
                    Yuborish (Submit)
                  </button>
                </div>
              </div>
            )}

            {/* LOYALTY BLOCK */}
            {block.type === 'loyalty' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(16,217,116,0.08)', border: '1px solid #10d974', borderRadius: 12 }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 14, color: '#10d974', fontWeight: 800 }}>{block.title || 'Bonus balansingiz'}</h4>
                  <p style={{ margin: 0, fontSize: 11, opacity: 0.6, marginTop: 2 }}>Loyalty Balance</p>
                </div>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#10d974' }}>
                  {userBalance !== null ? `${userBalance.toLocaleString()} ball` : '75,000 ball'}
                </span>
              </div>
            )}

            {/* VOTING BLOCK */}
            {block.type === 'voting' && (
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 12px 0', color: themeColor }}>{block.title || 'Ovoz berish'}</h4>
                {votedFor ? (
                  <div style={{ padding: 10, background: 'rgba(16,217,116,0.1)', border: '1px solid #10d974', borderRadius: 8, color: '#10d974', fontSize: 12, fontWeight: 700 }}>
                    ✓ Siz ovoz bergansiz. Natija: "{votedFor}"
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                          padding: '8px 12px', 
                          borderRadius: 8, 
                          cursor: 'pointer'
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
                        padding: '10px 16px', 
                        borderRadius: 6, 
                        fontSize: 12, 
                        fontWeight: 700, 
                        cursor: votingState[block.id] ? 'pointer' : 'not-allowed', 
                        marginTop: 4 
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
      </div>

      {/* Cart Bottom Sheet */}
      {cart.length > 0 && (
        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          background: '#1e293b', 
          borderTopLeftRadius: 16, 
          borderTopRightRadius: 16, 
          borderTop: '1px solid #334155', 
          padding: 16,
          boxShadow: '0 -5px 20px rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 100
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Tanlangan: {cart.reduce((acc, i) => acc + (i.qty || 1), 0)} ta</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: themeColor }}>
              {cart.reduce((acc, i) => acc + (i.price * (i.qty || 1)), 0).toLocaleString()} UZS
            </div>
          </div>
          <button 
            onClick={() => setShowOrderSheet(true)}
            style={{ background: '#10d974', border: 'none', color: '#fff', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <ShoppingCart size={14} /> Buyurtma
          </button>
        </div>
      )}

      {/* Order Sheet Modal */}
      {showOrderSheet && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-end', zIndex: 1000 }}>
          <form onSubmit={handleCheckout} style={{ background: '#1e293b', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Buyurtma</h3>
              <button type="button" onClick={() => setShowOrderSheet(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 13 }}>Yopish</button>
            </div>
            
            <div style={{ fontSize: 12, background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 10, maxHeight: 100, overflowY: 'auto' }}>
              {cart.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                  <span>{item.name} x {item.qty || 1}</span>
                  <strong>{((item.price) * (item.qty || 1)).toLocaleString()} UZS</strong>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: '#94a3b8' }}>Ism</label>
              <input 
                type="text" 
                required
                style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: 8, color: '#fff', fontSize: 13 }}
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: '#94a3b8' }}>Telefon</label>
              <input 
                type="tel" 
                required
                style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: 8, color: '#fff', fontSize: 13 }}
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              style={{ background: '#10d974', border: 'none', color: '#fff', borderRadius: 8, padding: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 6 }}
            >
              Botga yuborish
            </button>
          </form>
        </div>
      )}

    </div>
  )
}
