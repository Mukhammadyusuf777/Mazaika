import { useState } from 'react'
import { Megaphone, Send, Loader2 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { apiClient } from '../../api/apiClient'

export default function BroadcastsPage() {
  const { botId } = useParams()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ successCount: number; failCount: number } | null>(null)

  const handleBroadcast = async () => {
    if (!text.trim() || !botId) return

    if (!window.confirm("Barcha foydalanuvchilarga xabar yuborilsinmi?")) return

    setSending(true)
    setResult(null)
    
    try {
      const res = await apiClient.post(`/bots/${botId}/broadcast`, { text })
      setResult(res.data)
      setText('')
    } catch (e) {
      console.error(e)
      alert('Xatolik yuz berdi')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="settings-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)' }}>Tarqatmalar</h2>
          <p style={{ color: 'var(--text-muted)' }}>Foydalanuvchilarga ommaviy xabarlar yuborish</p>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-primary)', padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-aqua)' }}>
            <Megaphone size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: 'var(--text-lg)' }}>Yangi tarqatma yaratish</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Xabar barcha obunachilarga darhol yuboriladi.</p>
          </div>
        </div>

        <div style={{ marginBottom: 'var(--space-6)' }}>
          <label style={{ display: 'block', marginBottom: 'var(--space-2)', color: 'var(--text-secondary)' }}>Xabar matni</label>
          <textarea 
            className="input" 
            style={{ width: '100%', minHeight: 150, resize: 'vertical' }} 
            placeholder="Xabaringizni kiriting..."
            value={text}
            onChange={e => setText(e.target.value)}
          />
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleBroadcast} 
          disabled={!text.trim() || sending}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {sending ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
          {sending ? 'Yuborilmoqda...' : 'Barchaga yuborish'}
        </button>

        {result && (
          <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
            <h4 style={{ marginBottom: 'var(--space-2)' }}>Natija:</h4>
            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <span style={{ color: 'var(--accent-green)' }}>✓ {result.successCount} ta muvaffaqiyatli</span>
              <span style={{ color: '#ef4444' }}>✗ {result.failCount} ta xatolik</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
