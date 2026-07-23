import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Copy, Eye, Save, Check, RefreshCw, Sparkles } from 'lucide-react'
import { getBotById, updateBot, getSiteConfig, saveSiteConfig } from '../../api/firestore'

export default function MiniAppsPage() {
  const { botId } = useParams<{ botId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [savingBot, setSavingBot] = useState(false)
  const [savingDesign, setSavingDesign] = useState(false)
  const [copied, setCopied] = useState(false)

  // Bot & App Title State
  const [appName, setAppName] = useState('Mini App')

  // Bot Settings State
  const [menuButtonEnabled, setMenuButtonEnabled] = useState(false)
  const [menuButtonText, setMenuButtonText] = useState('Mini App')

  // Site Config State
  const [theme, setTheme] = useState('glassmorphism')
  const [themeColor, setThemeColor] = useState('#1e90ff')

  // Simulator State Key to force reload iframe
  const [simKey, setSimKey] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      if (!botId) return
      setLoading(true)
      try {
        const botData = await getBotById(botId)
        const siteData = await getSiteConfig(botId)

        if (botData) {
          setMenuButtonEnabled(botData.menuButtonEnabled || false)
          setMenuButtonText(botData.menuButtonText || 'Mini App')
        }

        if (siteData) {
          setTheme(siteData.theme || 'glassmorphism')
          setThemeColor(siteData.themeColor || '#1e90ff')
        }

        setAppName(siteData?.appName || botData?.name || 'Mini App')
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [botId])

  const handleCopyLink = () => {
    const url = `https://mazaika.pages.dev/site/${botId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveTelegram = async () => {
    if (!botId) return
    setSavingBot(true)
    try {
      await updateBot(botId, {
        name: appName,
        menuButtonEnabled,
        menuButtonText,
        menuButtonUrl: `https://mazaika.pages.dev/site/${botId}`
      })
      const currentConfig = await getSiteConfig(botId) || { blocks: [] }
      await saveSiteConfig(botId, {
        ...currentConfig,
        appName
      })
      setSimKey(prev => prev + 1)
      alert("Telegram va Mini App ma'lumotlari muvaffaqiyatli saqlandi!")
    } catch (e) {
      alert("Xatolik yuz berdi!")
    } finally {
      setSavingBot(false)
    }
  }

  const handleSaveDesign = async () => {
    if (!botId) return
    setSavingDesign(true)
    try {
      const currentConfig = await getSiteConfig(botId) || { blocks: [] }
      await saveSiteConfig(botId, {
        ...currentConfig,
        appName,
        theme,
        themeColor
      })
      await updateBot(botId, {
        name: appName
      })
      // Force reload simulator iframe
      setSimKey(prev => prev + 1)
      alert("Mini App dizayni muvaffaqiyatli saqlandi!")
    } catch (e) {
      alert("Xatolik yuz berdi!")
    } finally {
      setSavingDesign(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
        <RefreshCw className="spin" size={24} style={{ marginRight: 8 }} /> Yuklanmoqda...
      </div>
    )
  }

  const appLink = `https://mazaika.pages.dev/site/${botId}`

  return (
    <div className="miniapps-container" style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 'var(--space-8)', height: '100%', overflow: 'hidden' }}>
      
      {/* Left side: Premium Smartphone Simulator (hidden on small screen viewports via CSS) */}
      <div className="mobile-hide" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-2)' }}>
        {/* Phone wrapper */}
        <div style={{ 
          width: 320, 
          height: 600, 
          borderRadius: 40, 
          border: '12px solid #1e293b', 
          background: '#090d16',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255,255,255,0.05)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Status bar mock */}
          <div style={{ height: 24, background: '#090d16', display: 'flex', justifyContent: 'space-between', padding: '4px 20px', fontSize: 10, color: '#94a3b8', zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
            <span>9:41</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <span>📶</span>
              <span>🔋</span>
            </div>
          </div>

          {/* Screen Content Iframe */}
          <div style={{ flex: 1, position: 'relative' }}>
            <iframe 
              key={simKey}
              src={`/site/${botId}`} 
              title="Mini App Live Preview" 
              style={{ width: '100%', height: '100%', border: 'none', background: '#090d16' }}
            />
          </div>
        </div>

        <button 
          className="btn btn-ghost btn-sm" 
          onClick={() => setSimKey(prev => prev + 1)}
          style={{ marginTop: 'var(--space-3)', gap: 6 }}
        >
          <RefreshCw size={14} /> Simulyatorni yangilash
        </button>
      </div>

      {/* Right side: Unified Dashboard and Settings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', overflowY: 'auto', paddingRight: 'var(--space-2)' }}>
        
        {/* Title Header */}
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Mini Ilova & Web App</h2>
            <p style={{ color: 'var(--text-muted)' }}>Telegram bot ichida ochiladigan smart interfeysni (WebApp) sozlang.</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={() => navigate(`/bot/${botId}/sitebuilder`)} style={{ gap: 8, background: 'linear-gradient(135deg, #a855f7, #3b82f6)', border: 'none', boxShadow: '0 4px 14px rgba(168,85,247,0.3)' }}>
              <Sparkles size={16} /> AI Architect Konstruktoriga o'tish
            </button>
          </div>
        </div>

        {/* Info Banner explaining AI Architect integration */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(30,144,255,0.1))', 
          border: '1px solid rgba(168,85,247,0.3)', 
          borderRadius: 'var(--radius-xl)', 
          padding: 'var(--space-4)', 
          fontSize: 13, 
          lineHeight: 1.5,
          display: 'flex',
          gap: 12
        }}>
          <Sparkles size={20} style={{ color: '#a855f7', flexShrink: 0, marginTop: 2 }} />
          <div>
            <b>AI Architect Generator:</b> Mazaika platformasida Telegram Mini Ilova va Veb-saytlar sun'iy intellekt (Mazaika AI Architect) yordamida avtomatik ravishda yaratiladi. 
            Disaynni o'zgartirish, yangi bo'limlar qo'shish va Mini App interfeysini yaratish uchun <b>AI Architect Konstruktoriga o'tish</b> tugmasini bosing.
          </div>
        </div>

        {/* Card 1: Shareable Link */}
        <div style={{ background: 'var(--bg-card)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-primary)' }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 'var(--space-3)' }}>Mini Ilova va Sayt manzili</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 'var(--space-4)' }}>Ushbu havola yordamida Mini ilovani istalgan joyda ulashish yoki bot ichidagi tugmalarga bog'lash mumkin.</p>
          
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <input 
              type="text" 
              className="input" 
              value={appLink} 
              readOnly 
              style={{ flex: 1, background: 'var(--bg-secondary)', color: 'var(--text-muted)' }} 
            />
            <button className="btn btn-ghost" onClick={handleCopyLink} style={{ gap: 6, minWidth: 100, justifyContent: 'center' }}>
              {copied ? <Check size={14} style={{ color: 'var(--accent-green)' }} /> : <Copy size={14} />}
              {copied ? 'Nusxalandi' : 'Nusxalash'}
            </button>
            <a href={appLink} target="_blank" rel="noreferrer" className="btn btn-ghost btn-icon" title="Brauzerda ochish">
              <Eye size={16} />
            </a>
          </div>
        </div>

        {/* Card 2: Telegram Menu Button & App Name */}
        <div style={{ background: 'var(--bg-card)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-primary)' }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 'var(--space-1)' }}>Telegram Bot & Mini App sozlamalari</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 'var(--space-4)' }}>Mini Ilova nomi va Telegram bot menyusidagi tugma sozlamalari.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Mini App va Bot Nomi (App Title)</label>
              <input 
                type="text" 
                className="input" 
                value={appName} 
                onChange={e => setAppName(e.target.value)} 
                placeholder="Masalan: Mazaika Store, Express Delivery"
                style={{ maxWidth: 400 }}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ushbu nom Telegram Mini App yuqori qismida va veb-sayt sarlavhasida ko'rinadi.</span>
            </div>

            <hr style={{ borderColor: 'var(--border-primary)', margin: '4px 0' }} />

            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer', userSelect: 'none' }}>
              <input 
                type="checkbox" 
                checked={menuButtonEnabled} 
                onChange={e => setMenuButtonEnabled(e.target.checked)} 
                style={{ width: 18, height: 18, accentColor: 'var(--accent-blue)' }}
              />
              <div>
                <span style={{ fontWeight: 600, fontSize: 14, display: 'block' }}>Menyuda Mini App tugmasini yoqish</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Yoqilgan bo'lsa, Telegram bot ichida maxsus tugma paydo bo'ladi.</span>
              </div>
            </label>

            {menuButtonEnabled && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', borderLeft: '3px solid var(--border-primary)', paddingLeft: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Telegram Menyu tugmasi matni (Label)</label>
                <input 
                  type="text" 
                  className="input" 
                  value={menuButtonText} 
                  onChange={e => setMenuButtonText(e.target.value)} 
                  placeholder="Masalan: Buyurtma berish, Do'kon"
                  style={{ maxWidth: 300 }}
                />
              </div>
            )}

            <button 
              className="btn btn-primary" 
              onClick={handleSaveTelegram} 
              disabled={savingBot}
              style={{ alignSelf: 'flex-start', gap: 8, marginTop: 'var(--space-2)' }}
            >
              <Save size={16} /> {savingBot ? "Saqlanmoqda..." : "Integratsiyani saqlash"}
            </button>
          </div>
        </div>

        {/* Card 3: Design & Themes */}
        <div style={{ background: 'var(--bg-card)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-primary)' }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 'var(--space-1)' }}>Dizayn va Mavzular</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 'var(--space-4)' }}>Mini App interfeysining asosiy uslubi va brend rangini boshqaring.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>Mavzu uslubi</label>
                <select 
                  className="input" 
                  value={theme} 
                  onChange={e => setTheme(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="glassmorphism">Glassmorphism (Zamonaviy)</option>
                  <option value="minimalist">Minimalist Light (Oq rangli)</option>
                  <option value="neon">Neon Cyberpunk (To'q rangli)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>Mavzu rangi</label>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                  <input 
                    type="color" 
                    value={themeColor} 
                    onChange={e => setThemeColor(e.target.value)}
                    style={{ width: 45, height: 35, border: 'none', padding: 0, borderRadius: 6, cursor: 'pointer' }}
                  />
                  <input 
                    type="text" 
                    className="input" 
                    value={themeColor} 
                    onChange={e => setThemeColor(e.target.value)}
                    style={{ width: 100, fontSize: 12, padding: '6px 8px' }}
                  />
                </div>
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              onClick={handleSaveDesign} 
              disabled={savingDesign}
              style={{ alignSelf: 'flex-start', gap: 8, marginTop: 'var(--space-2)' }}
            >
              <Save size={16} /> {savingDesign ? "Saqlanmoqda..." : "Dizaynni saqlash"}
            </button>
          </div>
        </div>

      </div>

    </div>
  )
}
