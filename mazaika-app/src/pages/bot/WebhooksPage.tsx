import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Webhook, Plus, Copy, Trash2, Globe } from 'lucide-react'
import { getWebhooks, createWebhook, deleteWebhook } from '../../api/firestore'

interface WebhookItem {
  id: string
  name: string
  url: string
  method: string
  active: boolean
}

export default function WebhooksPage() {
  const { botId } = useParams<{ botId: string }>()
  
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  
  // Form states
  const [newWebhookName, setNewWebhookName] = useState('')
  const [newWebhookUrl, setNewWebhookUrl] = useState('')
  const [newWebhookMethod, setNewWebhookMethod] = useState('POST')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchWebhooks = async () => {
    if (!botId) return
    setIsLoading(true)
    try {
      const data = await getWebhooks(botId)
      setWebhooks(data as WebhookItem[])
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWebhooks()
  }, [botId])

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!botId) return
    setIsLoading(true)
    try {
      await createWebhook(botId, {
        name: newWebhookName,
        url: newWebhookUrl,
        method: newWebhookMethod
      })
      setShowModal(false)
      setNewWebhookName('')
      setNewWebhookUrl('')
      setNewWebhookMethod('POST')
      fetchWebhooks()
    } catch (e) {
      alert("Webhook yaratishda xatolik yuz berdi.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!window.confirm("Haqiqatan ham ushbu webhookni o'chirmoqchimisiz?")) return
    setIsLoading(true)
    try {
      await deleteWebhook(botId, webhookId)
      fetchWebhooks()
    } catch (e) {
      alert("Webhookni o'chirishda xatolik yuz berdi.")
    } finally {
      setIsLoading(false)
    }
  }


  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div style={{ padding: 'var(--space-8)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Webhooks</h2>
          <p style={{ color: 'var(--text-muted)' }}>Tashqi xizmatlardan ma'lumot qabul qilish uchun webhooklar ro'yxati</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Webhook yaratish
        </button>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-primary)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-secondary)' }}>
              <th style={{ padding: 'var(--space-4)', color: 'var(--text-muted)', fontWeight: 500 }}>Nomi</th>
              <th style={{ padding: 'var(--space-4)', color: 'var(--text-muted)', fontWeight: 500 }}>Metod</th>
              <th style={{ padding: 'var(--space-4)', color: 'var(--text-muted)', fontWeight: 500 }}>URL Manzil</th>
              <th style={{ padding: 'var(--space-4)', color: 'var(--text-muted)', fontWeight: 500 }}>Holati</th>
              <th style={{ padding: 'var(--space-4)', color: 'var(--text-muted)', fontWeight: 500 }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {webhooks.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Globe size={32} style={{ margin: '0 auto var(--space-2)', opacity: 0.5 }} />
                  Haligacha webhooklar yaratilmagan. O'zingizning birinchi webhookingizni yarating!
                </td>
              </tr>
            ) : (
              webhooks.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'color-mix(in srgb, #f97316 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
                        <Webhook size={16} />
                      </div>
                      <span style={{ fontWeight: 600 }}>{item.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <span style={{ padding: '2px 8px', background: 'var(--bg-secondary)', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>
                      {item.method}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{item.url}</span>
                      <button
                        type="button"
                        className={`btn ${copiedId === item.id ? 'btn-success' : 'btn-ghost'} btn-icon`}
                        style={{ width: 24, height: 24 }}
                        onClick={() => handleCopyUrl(item.url, item.id)}
                        title="URL nusxalash"
                      >
                        <Copy size={12}/>
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <span className={`badge ${item.active ? 'badge-aqua' : ''}`}>{item.active ? 'Faol' : 'O\'chiq'}</span>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      style={{ color: '#ef4444' }}
                      onClick={() => handleDeleteWebhook(item.id)}
                      title="Webhookni o'chirish"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Yangi Webhook yaratish</h2>
              <button type="button" className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateWebhook}>
                <div className="input-group" style={{ marginBottom: '16px' }}>
                  <label className="input-label">Webhook Nomi</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Masalan: Google Sheets Integratsiyasi"
                    value={newWebhookName}
                    onChange={e => setNewWebhookName(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group" style={{ marginBottom: '16px' }}>
                  <label className="input-label">Metod</label>
                  <select className="input" value={newWebhookMethod} onChange={e => setNewWebhookMethod(e.target.value)}>
                    <option>POST</option>
                    <option>GET</option>
                    <option>PUT</option>
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: '24px' }}>
                  <label className="input-label">Nishon URL manzili (Target URL)</label>
                  <input
                    type="url"
                    className="input"
                    placeholder="https://api.tashqiservis.uz/webhook"
                    value={newWebhookUrl}
                    onChange={e => setNewWebhookUrl(e.target.value)}
                    required
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn btn-ghost flex-1" onClick={() => setShowModal(false)}>Bekor qilish</button>
                  <button type="submit" className="btn btn-primary flex-1" disabled={isLoading}>Yaratish →</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
