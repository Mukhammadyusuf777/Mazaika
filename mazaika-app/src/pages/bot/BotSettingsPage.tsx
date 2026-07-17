import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, Copy, RefreshCw, AlertTriangle, Globe, Zap, CheckCircle, XCircle, Info } from 'lucide-react'
import { getBotById, updateBot, deleteBot, getMiniApps } from '../../api/firestore'
import { apiClient } from '../../api/apiClient'

export default function BotSettingsPage() {
  const { botId } = useParams<{ botId: string }>()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [token, setToken] = useState('')
  const [username, setUsername] = useState('')
  const [language, setLanguage] = useState("O'zbekcha")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  // Menu Button Web App State
  const [menuButtonEnabled, setMenuButtonEnabled] = useState(false)
  const [menuButtonText, setMenuButtonText] = useState('🌐 Saytimiz')
  const [menuButtonUrl, setMenuButtonUrl] = useState('')
  const [miniApps, setMiniApps] = useState<any[]>([])
  const [selectedAppId, setSelectedAppId] = useState<string>('site')
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState('')



  // Fetch bot details
  const fetchBotDetails = async () => {
    if (!botId) return
    setIsLoading(true)
    try {
      const data = await getBotById(botId)
      if (data) {
        setName(data.name || '')
        setToken(data.token || '')
        setMenuButtonEnabled(data.menuButtonEnabled || false)
        setMenuButtonText(data.menuButtonText || '🌐 Saytimiz')
        const url = data.menuButtonUrl || `https://mazaika.pages.dev/site/${botId}`
        setMenuButtonUrl(url)
        
        // Parse token to extract mock username or use username field
        const botToken = data.token || ''
        const idPart = botToken.split(':')[0] || '12345678'
        setUsername(`@Mazaika_${idPart}_bot`)

        // Fetch mini apps for the dropdown
        const apps = await getMiniApps(botId)
        setMiniApps(apps)

        // Calculate selectedAppId
        if (url.includes('/webapp/')) {
          const parts = url.split('/')
          const appId = parts[parts.length - 1]
          setSelectedAppId(appId)
        } else {
          setSelectedAppId('site')
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }


  useEffect(() => {
    fetchBotDetails()
  }, [botId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!botId) return
    setIsLoading(true)
    try {
      await updateBot(botId, {
        name,
        token,
        menuButtonEnabled,
        menuButtonText,
        menuButtonUrl
      })

      // Sync menu button state with Telegram API via NestJS backend
      if (token) {
        try {
          if (menuButtonEnabled) {
            await apiClient.post(`/bots/${botId}/menu-button`, {
              text: menuButtonText,
              url: menuButtonUrl || `https://mazaika.pages.dev/site/${botId}`
            })
          } else {
            await apiClient.delete(`/bots/${botId}/menu-button`)
          }
        } catch (apiErr) {
          console.error("Failed to update Telegram menu button:", apiErr)
        }
      }

      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    } catch (e) {
      alert("Sozlamalarni saqlashda xatolik yuz berdi. Tokenni tekshiring.")
    } finally {
      setIsLoading(false)
    }
  }


  const handleTestMenuButton = async () => {
    if (!token) {
      setTestStatus('error')
      setTestMessage('❌ Avval bot tokenini kiriting!')
      return
    }
    const finalUrl = menuButtonUrl || `https://mazaika.pages.dev/site/${botId}`
    const finalText = menuButtonText || '🌐 Open App'

    setTestStatus('testing')
    setTestMessage('Telegram API ga ulanilmoqda...')

    // Save to Firestore first
    if (botId) {
      await updateBot(botId, { menuButtonEnabled: true, menuButtonText: finalText, menuButtonUrl: finalUrl })
      setMenuButtonEnabled(true)
    }

    // Try direct Telegram API call (works without backend!)
    try {
      const telegramUrl = `https://api.telegram.org/bot${token}/setChatMenuButton`
      const body = {
        menu_button: {
          type: 'web_app',
          text: finalText,
          web_app: { url: finalUrl }
        }
      }
      const response = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await response.json()

      if (data.ok) {
        setTestStatus('success')
        setTestMessage('✅ Tugma muvaffaqiyatli o\'rnatildi! Telegram-ni yangilang.')
        return
      } else {
        // Telegram returned an error
        const errDesc = data.description || 'Unknown Telegram error'
        if (errDesc.includes('Unauthorized') || errDesc.includes('401')) {
          setTestStatus('error')
          setTestMessage('❌ Token noto\'g\'ri! @BotFather dan tokenni tekshiring.')
        } else if (errDesc.includes('Bad Request')) {
          setTestStatus('error')
          setTestMessage(`❌ URL noto'g'ri: ${errDesc}. HTTPS talab qilinadi.`)
        } else {
          setTestStatus('error')
          setTestMessage(`❌ Telegram xatosi: ${errDesc}`)
        }
        return
      }
    } catch (fetchErr: any) {
      // CORS error — fallback to backend
      if (fetchErr.message?.includes('Failed to fetch') || fetchErr.message?.includes('CORS')) {
        setTestMessage('Backend orqali urinilmoqda...')
        try {
          const res = await apiClient.post(`/bots/${botId}/menu-button`, { text: finalText, url: finalUrl })
          if (res.data?.success) {
            setTestStatus('success')
            setTestMessage('✅ Tugma backend orqali o\'rnatildi!')
          } else {
            throw new Error(res.data?.message || 'Backend error')
          }
        } catch {
          setTestStatus('error')
          setTestMessage('❌ Backend ishlamayapti. Quyidagi yo\'riqnomaga qarang.')
        }
      } else {
        setTestStatus('error')
        setTestMessage(`❌ ${fetchErr.message}`)
      }
    }
  }


  const handleCopyToken = () => {
    navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDeleteBot = async () => {
    if (!botId) return
    if (!window.confirm("Haqiqatan ham ushbu botni butunlay o'chirib tashlamoqchimisiz? Barcha ma'lumotlar qayta tiklanmaydi!")) return
    setIsLoading(true)
    try {
      await deleteBot(botId)
      navigate('/dashboard')
    } catch (e) {
      alert("Botni o'chirishda xatolik yuz berdi.")
      setIsLoading(false)
    }
  }


  return (
    <div className="settings-container">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Bot Sozlamalari</h2>
        <p style={{ color: 'var(--text-muted)' }}>Asosiy ma'lumotlar va API ulanishlar</p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* API TOKEN SECTION */}
        <div style={{ background: 'var(--bg-card)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-primary)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Telegram API Token</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            Botfather orqali olingan tokenni shu yerga kiriting. Tokenni hech kimga bermang!
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <input
              type="text"
              className="input flex-1"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="1234567890:AAH_XxYyZz..."
              required
            />
            <button
              type="button"
              className={`btn ${copied ? 'btn-success' : 'btn-ghost'} btn-icon`}
              onClick={handleCopyToken}
              title="Tokenni nusxalash"
            >
              <Copy size={18} />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={fetchBotDetails}
              title="Qayta yuklash"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* BASIC INFORMATION SECTION */}
        <div style={{ background: 'var(--bg-card)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-primary)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Asosiy ma'lumotlar</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Bot nomi</label>
              <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mening Yangi Boti"
                required
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Bot Username (Telegram tomonidan berilgan)</label>
              <input type="text" className="input" value={username} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Asosiy Til</label>
              <select className="input" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option>O'zbekcha</option>
                <option>Русский</option>
                <option>English</option>
              </select>
            </div>
          </div>
        </div>

        {/* TELEGRAM MENU BUTTON (WEB APP) SECTION */}
        <div style={{ background: 'var(--bg-card)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-primary)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={18} style={{ color: 'var(--accent-blue)' }} /> Chat Menu Tugmasi (Web App)
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>
            Foydalanuvchilar botingizga kirganda <strong>⚙️ belgisi yonida</strong> ko'rinadigan «Menu» tugmasi — shu yerda sozlanadi.
          </p>

          {/* INFO BOX */}
          <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 'var(--space-4)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Info size={16} style={{ color: '#3b82f6', flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Nega tugma ko'rinmayapti?</strong><br />
              Telegram Menu tugmasi faqat <strong>real HTTPS domain</strong> bilan ishlaydi. Localhost ishlaydi, lekin Telegram uni qabul qilmaydi.
              Tugmani ko'rish uchun quyidagilarni tekshiring:
              <ol style={{ margin: '6px 0 0 16px', padding: 0 }}>
                <li>Bot token to'g'ri va @BotFather dan olingan</li>
                <li>Bot «Start Bot» orqali ishga tushirilgan</li>
                <li>URL ochiq HTTPS domenga yo'naltirilgan</li>
                <li>«Saqlash» bosilgan va «Faollashtirish» checkbox yoqilgan</li>
              </ol>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={menuButtonEnabled} 
                onChange={(e) => setMenuButtonEnabled(e.target.checked)} 
              />
              <span style={{ fontSize: 'var(--text-sm)' }}>Sayt tugmasini faollashtirish</span>
            </label>

            {menuButtonEnabled && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Tugma matni (maksimal 12 ta belgi)</label>
                  <input
                    type="text"
                    className="input"
                    value={menuButtonText}
                    onChange={(e) => setMenuButtonText(e.target.value)}
                    placeholder="🌐 Saytimiz"
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Ochiladigan sahifa yoki ilova</label>
                  <select 
                    className="input"
                    value={selectedAppId}
                    onChange={(e) => {
                      const val = e.target.value
                      setSelectedAppId(val)
                      if (val === 'site') {
                        setMenuButtonUrl(`https://mazaika.pages.dev/site/${botId}`)
                      } else {
                        setMenuButtonUrl(`https://mazaika.pages.dev/webapp/${botId}/${val}`)
                      }
                    }}
                  >
                    <option value="site">Konstruktorda yaratilgan sayt (Lending)</option>
                    {miniApps.map(app => (
                      <option key={app.id} value={app.id}>
                        Mini Ilova: {app.name} ({app.type === 'store' ? 'Do\'kon' : app.type === 'form' ? 'So\'rovnoma' : 'G\'ildirak'})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Telegram Web App havolasi (URL)</label>
                  <input
                    type="url"
                    className="input"
                    value={menuButtonUrl}
                    disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Ushbu havola avtomatik ravishda botingizning «Menu» tugmasiga o'rnatiladi.
                  </span>
                </div>
              </>
            )}

            {/* QUICK ACTIVATE BUTTON */}
            <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: 'var(--space-4)', marginTop: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleTestMenuButton}
                  disabled={testStatus === 'testing' || !token}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Zap size={16} />
                  {testStatus === 'testing' ? 'Ulanilmoqda...' : '⚡ Telegram ga O\'rnatish'}
                </button>

                <a
                  href="https://t.me/BotFather"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 13, color: 'var(--accent-blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  🤖 @BotFather orqali sozlash →
                </a>
              </div>

              {testStatus !== 'idle' && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: testStatus === 'success' ? 'rgba(34,197,94,0.1)' : testStatus === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
                  border: `1px solid ${testStatus === 'success' ? 'rgba(34,197,94,0.3)' : testStatus === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)'}`,
                  color: testStatus === 'success' ? '#22c55e' : testStatus === 'error' ? '#ef4444' : '#3b82f6'
                }}>
                  {testStatus === 'success' ? <CheckCircle size={14} /> : testStatus === 'error' ? <XCircle size={14} /> : null}
                  {testMessage || 'Ulanilmoqda...'}
                </div>
              )}

              {testStatus === 'success' && (
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 10, lineHeight: 1.6 }}>
                  💡 <strong>Keyingi qadam:</strong><br />
                  Telegram-ni to'liq yopib qayta oching <strong>yoki</strong> botingizni yangilang.<br />
                  Tugma <strong>⚙️ belgisi yonida</strong> ko'rinishi kerak.
                  <br />
                  <span style={{ fontSize: 11, opacity: 0.7 }}>
                    Ko'rinmasa — Telegram mobil ilovani ham qayta ishga tushiring.
                  </span>
                </div>
              )}

              {testStatus === 'error' && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 8, lineHeight: 1.7 }}>
                  <strong>Qo'lda sozlash uchun:</strong><br />
                  1. <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)' }}>@BotFather</a> → /mybots → Bot tanlang<br />
                  2. <strong>Bot Settings</strong> → <strong>Menu Button</strong><br />
                  3. URL kiriting: <code style={{ background: 'var(--bg-card)', padding: '1px 6px', borderRadius: 4 }}>{menuButtonUrl || `https://mazaika.pages.dev/site/${botId}`}</code>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DANGER ZONE */}

        <div style={{ background: 'var(--bg-card)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-2)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} /> Xavfli Hudud
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            Botni o'chirish uning barcha ma'lumotlari, chatlari, ssenariylari va foydalanuvchilarini qaytarib bo'lmas tarzda yo'q qiladi.
          </p>
          <button
            type="button"
            className="btn"
            onClick={handleDeleteBot}
            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444' }}
            disabled={isLoading}
          >
            Botni o'chirish
          </button>
        </div>

        {/* SAVE BUTTON */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
          <button type="submit" className={`btn ${isSaved ? 'btn-success' : 'btn-primary'}`} style={{ padding: '0 32px' }} disabled={isLoading}>
            <Save size={18} /> {isSaved ? 'Saqlandi! ✓' : 'Saqlash'}
          </button>
        </div>
      </form>
    </div>
  )
}
