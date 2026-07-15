import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, Copy, RefreshCw, AlertTriangle } from 'lucide-react'
import { getBotById, updateBot, deleteBot } from '../../api/firestore'

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

  // Fetch bot details
  const fetchBotDetails = async () => {
    if (!botId) return
    setIsLoading(true)
    try {
      const data = await getBotById(botId)
      if (data) {
        setName(data.name || '')
        setToken(data.token || '')
        // Parse token to extract mock username or use username field
        const botToken = data.token || ''
        const idPart = botToken.split(':')[0] || '12345678'
        setUsername(`@Mazaika_${idPart}_bot`)
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
        token
      })
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    } catch (e) {
      alert("Sozlamalarni saqlashda xatolik yuz berdi. Tokenni tekshiring.")
    } finally {
      setIsLoading(false)
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
    <div style={{ padding: 'var(--space-8)', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
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
