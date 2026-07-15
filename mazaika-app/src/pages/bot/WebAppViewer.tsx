import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getMiniAppById } from '../../api/firestore'
import { ShoppingCart, Send, Sparkles } from 'lucide-react'


declare global {
  interface Window {
    Telegram?: any
  }
}

export default function WebAppViewer() {
  const { botId, appId } = useParams<{ botId: string; appId: string }>()
  const [app, setApp] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Store Cart State
  const [cart, setCart] = useState<any[]>([])
  const [showOrderSheet, setShowOrderSheet] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  // Form State
  const [formResponses, setFormResponses] = useState<Record<string, string>>({})

  // Wheel State
  const [isSpinning, setIsSpinning] = useState(false)
  const [prizeResult, setPrizeResult] = useState<string | null>(null)
  const [wheelRotation, setWheelRotation] = useState(0)

  useEffect(() => {
    // Inject Telegram WebApp script
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-web-app.js'
    script.async = true
    document.body.appendChild(script)

    const fetchApp = async () => {
      if (!botId || !appId) return
      try {
        const data = await getMiniAppById(botId, appId)
        setApp(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchApp()

    return () => {
      document.body.removeChild(script)
    }
  }, [botId, appId])

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready()
      window.Telegram.WebApp.expand()
    }
  }, [app])

  // Send Data helper
  const sendDataToBot = (data: any) => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.sendData(JSON.stringify(data))
      window.Telegram.WebApp.close()
    } else {
      alert('Telegramdan tashqarida ochildi. Botga yuboriladigan ma\'lumot:\n' + JSON.stringify(data, null, 2))
    }
  }

  // Store Actions
  const addToCart = (item: any) => {
    setCart(prev => [...prev, item])
  }

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName || !customerPhone) return
    const orderData = {
      action: 'order',
      items: cart.map(i => ({ name: i.name, price: i.price })),
      total: cart.reduce((acc, i) => acc + i.price, 0),
      customer: { name: customerName, phone: customerPhone }
    }
    sendDataToBot(orderData)
  }

  // Form Actions
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const responseData = {
      action: 'form_submit',
      formName: app.name,
      responses: formResponses
    }
    sendDataToBot(responseData)
  }

  // Wheel Actions
  const spinWheel = () => {
    if (isSpinning) return
    setIsSpinning(true)
    const prizes = app.config?.prizes || []
    if (prizes.length === 0) return

    // Spin multiple full rotations plus extra degrees
    const prizeIndex = Math.floor(Math.random() * prizes.length)
    const degreesPerPrize = 360 / prizes.length
    const extraDegrees = 360 - (prizeIndex * degreesPerPrize) - (degreesPerPrize / 2)
    const totalRotation = wheelRotation + (360 * 5) + extraDegrees
    
    setWheelRotation(totalRotation)

    setTimeout(() => {
      setIsSpinning(false)
      setPrizeResult(prizes[prizeIndex].label)
    }, 4000)
  }

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a', color: '#fff' }}>Yuklanmoqda...</div>
  }

  if (!app) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a', color: '#fff' }}>Ilova topilmadi.</div>
  }

  const themeColor = app.config?.themeColor || '#1e90ff'

  return (
    <div style={{ 
      background: '#0f172a', 
      color: '#fff', 
      minHeight: '100vh', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      paddingBottom: app.type === 'store' && cart.length > 0 ? 80 : 20,
      overflowX: 'hidden'
    }}>
      {/* App Header */}
      <div style={{ background: themeColor, padding: '30px 20px', textAlign: 'center', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{app.name}</h2>
        <p style={{ margin: '8px 0 0 0', opacity: 0.8, fontSize: 13 }}>{app.config?.desc || 'Telegram Web App'}</p>
      </div>

      <div style={{ padding: 20 }}>
        
        {/* CATALOG / STORE VIEW */}
        {app.type === 'store' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {(app.config?.items || []).map((item: any) => (
              <div 
                key={item.id} 
                style={{ 
                  background: '#1e293b', 
                  borderRadius: 16, 
                  border: '1px solid #334155', 
                  overflow: 'hidden', 
                  display: 'flex',
                  alignItems: 'center',
                  padding: 12,
                  gap: 12
                }}
              >
                <img 
                  src={item.img || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'} 
                  alt={item.name} 
                  style={{ width: 70, height: 70, borderRadius: 12, objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{item.name}</h4>
                  <p style={{ margin: '4px 0', fontSize: 12, color: '#94a3b8' }}>{item.desc}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <span style={{ fontWeight: 800, color: themeColor }}>{item.price.toLocaleString()} UZS</span>
                    <button 
                      onClick={() => addToCart(item)}
                      style={{ background: themeColor, border: 'none', color: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    >
                      + Qo'shish
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FEEDBACK / SURVEY FORM VIEW */}
        {app.type === 'form' && (
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, background: '#1e293b', padding: 20, borderRadius: 16, border: '1px solid #334155' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, textAlign: 'center', color: themeColor }}>{app.config?.title}</h3>
            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>{app.config?.desc}</p>
            
            {(app.config?.fields || []).map((field: any) => (
              <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 13, color: '#94a3b8' }}>{field.label} {field.required && <span style={{ color: '#f43f5e' }}>*</span>}</label>
                {field.type === 'textarea' ? (
                  <textarea 
                    style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: 10, color: '#fff', fontSize: 14, minHeight: 80 }}
                    required={field.required}
                    value={formResponses[field.name] || ''}
                    onChange={e => setFormResponses({ ...formResponses, [field.name]: e.target.value })}
                  />
                ) : (
                  <input 
                    type={field.type} 
                    style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: 10, color: '#fff', fontSize: 14 }}
                    required={field.required}
                    value={formResponses[field.name] || ''}
                    onChange={e => setFormResponses({ ...formResponses, [field.name]: e.target.value })}
                  />
                )}
              </div>
            ))}
            
            <button 
              type="submit" 
              style={{ background: themeColor, border: 'none', color: '#fff', borderRadius: 8, padding: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10 }}
            >
              <Send size={16} /> Yuborish
            </button>
          </form>
        )}

        {/* WHEEL OF FORTUNE GAME VIEW */}
        {app.type === 'wheel' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            {/* Spinning Wheel */}
            <div style={{ position: 'relative', width: 280, height: 280, margin: '20px auto' }}>
              {/* Wheel Container */}
              <div 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  borderRadius: '50%', 
                  border: `6px solid ${themeColor}`, 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0.85, 0.35, 1)' : 'none',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {(app.config?.prizes || []).map((prize: any, idx: number) => {
                  const deg = 360 / app.config.prizes.length
                  return (
                    <div 
                      key={prize.id || idx}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        transform: `rotate(${idx * deg}deg)`,
                        transformOrigin: '50% 50%',
                      }}
                    >
                      {/* Sector Line */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        width: 2,
                        height: '50%',
                        background: '#334155',
                      }} />
                      {/* Label Text */}
                      <div style={{
                        position: 'absolute',
                        top: '15%',
                        left: 0,
                        right: 0,
                        textAlign: 'center',
                        transform: `rotate(${deg / 2}deg)`,
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#fff',
                        textShadow: '1px 1px 2px #000'
                      }}>
                        {prize.label}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Center Pointer */}
              <div style={{ 
                position: 'absolute', 
                top: -10, 
                left: '50%', 
                transform: 'translateX(-50%)', 
                width: 0, 
                height: 0, 
                borderLeft: '15px solid transparent', 
                borderRight: '15px solid transparent', 
                borderTop: `25px solid ${themeColor}`,
                zIndex: 10
              }} />

              {/* Center Pin */}
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)', 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                background: '#fff', 
                border: `4px solid ${themeColor}`,
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
              }}>
                <Sparkles size={16} style={{ color: themeColor }} />
              </div>
            </div>

            <button 
              onClick={spinWheel} 
              disabled={isSpinning || prizeResult !== null}
              style={{ background: themeColor, border: 'none', color: '#fff', borderRadius: 24, padding: '12px 36px', fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}
            >
              {isSpinning ? 'Aylanmoqda...' : prizeResult ? 'O\'yin tugadi' : 'G\'ildirakni aylantirish'}
            </button>

            {prizeResult && (
              <div style={{ background: '#1e293b', border: `2px solid ${themeColor}`, padding: 20, borderRadius: 16, width: '100%', textAlign: 'center', animation: 'scaleUp 0.3s ease' }}>
                <h3 style={{ margin: 0, fontSize: 18, color: themeColor }}>Tabriklaymiz! 🎉</h3>
                <p style={{ margin: '8px 0 16px 0', fontSize: 20, fontWeight: 800 }}>Siz "{prizeResult}" yutib oldingiz!</p>
                <button 
                  onClick={() => sendDataToBot({ action: 'prize', prize: prizeResult })}
                  style={{ background: '#10d974', border: 'none', color: '#fff', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Yutuqni botga yuborish
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cart Bottom Sheet (Internet Store only) */}
      {app.type === 'store' && cart.length > 0 && (
        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          background: '#1e293b', 
          borderTopLeftRadius: 20, 
          borderTopRightRadius: 20, 
          borderTop: '1px solid #334155', 
          padding: 16,
          boxShadow: '0 -5px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 100
        }}>
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Tanlangan: {cart.length} ta maxsulot</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: themeColor }}>
              {cart.reduce((acc, i) => acc + i.price, 0).toLocaleString()} UZS
            </div>
          </div>
          <button 
            onClick={() => setShowOrderSheet(true)}
            style={{ background: '#10d974', border: 'none', color: '#fff', borderRadius: 8, padding: '12px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <ShoppingCart size={16} /> Buyurtma berish
          </button>
        </div>
      )}

      {/* Order Info Modal (Internet Store only) */}
      {showOrderSheet && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', zIndex: 1000 }}>
          <form onSubmit={handleCheckout} style={{ background: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Buyurtma ma'lumotlari</h3>
              <button type="button" onClick={() => setShowOrderSheet(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 14 }}>Yopish</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 13, color: '#94a3b8' }}>Ismingiz</label>
              <input 
                type="text" 
                required
                className="input"
                style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: 10, color: '#fff', fontSize: 14 }}
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 13, color: '#94a3b8' }}>Telefon raqamingiz</label>
              <input 
                type="tel" 
                required
                className="input"
                style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: 10, color: '#fff', fontSize: 14 }}
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              style={{ background: '#10d974', border: 'none', color: '#fff', borderRadius: 8, padding: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 10 }}
            >
              Tasdiqlash va botga yuborish
            </button>
          </form>
        </div>
      )}

    </div>
  )
}
