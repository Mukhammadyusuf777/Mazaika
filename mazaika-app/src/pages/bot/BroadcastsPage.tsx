import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { 
  Megaphone, Send, Loader2, ImagePlus, Plus, Trash2, 
  ExternalLink, CheckCircle2, Clock, Sparkles,
  Bold, Italic, Code, Eye
} from 'lucide-react'
import { apiClient } from '../../api/apiClient'
import { getContacts, getBotById } from '../../api/firestore'

interface InlineBtn {
  id: string
  text: string
  url: string
}

interface BroadcastHistoryItem {
  id: string
  text: string
  imageUrl?: string
  buttonsCount: number
  sentAt: string
  successCount: number
  failCount: number
}

export default function BroadcastsPage() {
  const { botId } = useParams<{ botId: string }>()
  const [text, setText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [buttons, setButtons] = useState<InlineBtn[]>([])
  const [newBtnText, setNewBtnText] = useState('')
  const [newBtnUrl, setNewBtnUrl] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ successCount: number; failCount: number } | null>(null)
  const [subscriberCount, setSubscriberCount] = useState<number>(0)
  const [botName, setBotName] = useState<string>('Mazaika Bot')
  const [history, setHistory] = useState<BroadcastHistoryItem[]>([])

  // Load bot info & contact count
  useEffect(() => {
    if (botId) {
      getContacts(botId)
        .then(contacts => setSubscriberCount(contacts.length))
        .catch(console.error)

      getBotById(botId)
        .then(b => {
          if (b?.name) setBotName(b.name)
        })
        .catch(console.error)

      // Load history from localStorage
      const savedHistory = localStorage.getItem(`mz_broadcast_history_${botId}`)
      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory))
        } catch (e) {
          console.error(e)
        }
      }
    }
  }, [botId])

  // Formatting helpers
  const applyFormat = (prefix: string, suffix: string) => {
    setText(prev => prev ? `${prev} ${prefix}текст${suffix}` : `${prefix}текст${suffix}`)
  }

  const addEmoji = (emoji: string) => {
    setText(prev => prev + emoji)
  }

  // Button management
  const handleAddButton = () => {
    if (!newBtnText.trim() || !newBtnUrl.trim()) return
    setButtons(prev => [...prev, {
      id: String(Date.now()),
      text: newBtnText.trim(),
      url: newBtnUrl.trim()
    }])
    setNewBtnText('')
    setNewBtnUrl('')
  }

  const handleRemoveButton = (id: string) => {
    setButtons(prev => prev.filter(b => b.id !== id))
  }

  // Live formatted text preview
  const formattedPreviewText = useMemo(() => {
    if (!text) return 'Ваш текст сообщения появится здесь...'
    return text
  }, [text])

  // Send broadcast
  const handleBroadcast = async () => {
    if (!text.trim() || !botId) return

    const confirmMsg = subscriberCount > 0 
      ? `Отправить рассылку ${subscriberCount} подписчикам бота?`
      : 'Отправить рассылку всем пользователям бота?'

    if (!window.confirm(confirmMsg)) return

    setSending(true)
    setResult(null)

    // Build payload text: if buttons exist, append them as clickable markdown links
    let fullText = text
    if (imageUrl) {
      // Telegram invisible link for banner photo preview: [​](url)
      fullText = `[\u200B](${imageUrl})${fullText}`
    }
    if (buttons.length > 0) {
      fullText += '\n\n' + buttons.map(b => `👉 [${b.text}](${b.url})`).join('\n')
    }

    try {
      const res = await apiClient.post(`/bots/${botId}/broadcast`, { text: fullText })
      const resData = res.data || { successCount: subscriberCount, failCount: 0 }
      setResult(resData)

      // Save to history
      const newHistoryItem: BroadcastHistoryItem = {
        id: String(Date.now()),
        text: text.slice(0, 120),
        imageUrl: imageUrl || undefined,
        buttonsCount: buttons.length,
        sentAt: new Date().toLocaleString('ru-RU'),
        successCount: resData.successCount ?? subscriberCount,
        failCount: resData.failCount ?? 0
      }

      const updatedHistory = [newHistoryItem, ...history]
      setHistory(updatedHistory)
      localStorage.setItem(`mz_broadcast_history_${botId}`, JSON.stringify(updatedHistory))

      setText('')
      setImageUrl('')
      setButtons([])
    } catch (e) {
      console.error(e)
      alert('Ошибка при отправке рассылки. Проверьте подключение.')
    } finally {
      setSending(false)
    }
  }

  const currentTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="settings-container" style={{ maxWidth: '100%', padding: '24px 32px' }}>
      {/* Top Header */}
      <div className="page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Megaphone size={24} style={{ color: '#00F5C4' }} />
            <span>Массовые Рассылки (Broadcasts Pro)</span>
          </h2>
          <p style={{ color: '#94A3B8', fontSize: 13, marginTop: 4 }}>
            Создавайте рекламные кампании и оповещения с живым предпросмотром в стиле Telegram
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0F131E', border: '1px solid rgba(255,255,255,0.08)', padding: '8px 16px', borderRadius: 12 }}>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>Активная база:</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#00F5C4' }}>{subscriberCount} подписчиков</span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)', gap: 24, alignItems: 'start' }}>
        {/* Left Column: Composer Form */}
        <div style={{ background: '#090C15', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#FFF', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} style={{ color: '#1E90FF' }} />
            <span>Конструктор сообщения</span>
          </h3>

          {/* Formatting Toolbar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12, padding: '8px 12px', background: '#0F1424', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
            <button 
              type="button" 
              onClick={() => applyFormat('**', '**')} 
              style={{ background: 'none', border: 'none', color: '#CBD5E1', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
              title="Жирный шрифт (**текст**)"
            >
              <Bold size={13} /> <span>Жирный</span>
            </button>
            <button 
              type="button" 
              onClick={() => applyFormat('*', '*')} 
              style={{ background: 'none', border: 'none', color: '#CBD5E1', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
              title="Курсив (*текст*)"
            >
              <Italic size={13} /> <span>Курсив</span>
            </button>
            <button 
              type="button" 
              onClick={() => applyFormat('`', '`')} 
              style={{ background: 'none', border: 'none', color: '#CBD5E1', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
              title="Моноширинный код (`код`)"
            >
              <Code size={13} /> <span>Код</span>
            </button>
            <button 
              type="button" 
              onClick={() => applyFormat('||', '||')} 
              style={{ background: 'none', border: 'none', color: '#CBD5E1', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
              title="Спойлер (скрытый текст)"
            >
              <Eye size={13} /> <span>Спойлер</span>
            </button>

            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)', margin: 'auto 4px' }} />

            {['🔥', '🎉', '⚡', '🎁', '🚀', '💰', '📍', '📢'].map(e => (
              <button 
                key={e} 
                type="button" 
                onClick={() => addEmoji(e)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, padding: '2px 4px' }}
              >
                {e}
              </button>
            ))}
          </div>

          {/* Text Area */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>
              Текст сообщения:
            </label>
            <textarea
              rows={6}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Напишите текст рассылки... Поддерживаются эмодзи и разметка."
              style={{
                width: '100%',
                background: '#0F1424',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12,
                padding: '12px 14px',
                color: '#FFF',
                fontSize: 13.5,
                lineHeight: 1.5,
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Banner Image Input */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>
              <ImagePlus size={15} style={{ color: '#00F5C4' }} />
              <span>Ссылка на изображение/баннер (опционально):</span>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... (прямая ссылка на .jpg / .png)"
              style={{
                width: '100%',
                background: '#0F1424',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#FFF',
                fontSize: 13,
                outline: 'none'
              }}
            />
          </div>

          {/* Inline Buttons Builder */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>
              Интерактивные Inline-кнопки (до 4 шт):
            </label>

            {buttons.map(b => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, background: '#0F1424', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#38BDF8', flex: 1 }}>{b.text}</span>
                <span style={{ fontSize: 11, color: '#64748B', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.url}</span>
                <button 
                  type="button" 
                  onClick={() => handleRemoveButton(b.id)}
                  style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 4 }}
                  title="Удалить кнопку"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {buttons.length < 4 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <input
                  type="text"
                  placeholder="Текст кнопки (например: 🌐 Открыть сайт)"
                  value={newBtnText}
                  onChange={e => setNewBtnText(e.target.value)}
                  style={{ flex: 1, background: '#0F1424', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 12px', color: '#FFF', fontSize: 12.5 }}
                />
                <input
                  type="url"
                  placeholder="Ссылка (https://...)"
                  value={newBtnUrl}
                  onChange={e => setNewBtnUrl(e.target.value)}
                  style={{ flex: 1, background: '#0F1424', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 12px', color: '#FFF', fontSize: 12.5 }}
                />
                <button
                  type="button"
                  onClick={handleAddButton}
                  style={{ background: 'rgba(0,245,196,0.15)', border: '1px solid rgba(0,245,196,0.3)', color: '#00F5C4', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Plus size={14} /> Добавить
                </button>
              </div>
            )}
          </div>

          {/* Action Send Button */}
          <button
            onClick={handleBroadcast}
            disabled={!text.trim() || sending}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: 14,
              background: !text.trim() || sending ? '#1E293B' : 'linear-gradient(135deg, #00F5C4 0%, #1E90FF 100%)',
              color: !text.trim() || sending ? '#64748B' : '#030712',
              fontWeight: 800,
              fontSize: 14,
              border: 'none',
              cursor: !text.trim() || sending ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: !text.trim() || sending ? 'none' : '0 6px 20px rgba(0,245,196,0.3)'
            }}
          >
            {sending ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={18} />}
            <span>{sending ? 'Отправка рассылки...' : `Отправить всем подписчикам (${subscriberCount} чел)`}</span>
          </button>

          {/* Result Alert */}
          {result && (
            <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle2 size={18} style={{ color: '#10B981', flexShrink: 0 }} />
              <div style={{ fontSize: 13, color: '#E2E8F0' }}>
                <strong>Рассылка успешно выполнена!</strong> Доставлено: <span style={{ color: '#10B981', fontWeight: 700 }}>{result.successCount}</span>, Ошибок: <span style={{ color: '#EF4444' }}>{result.failCount}</span>.
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Realistic Telegram Mobile Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Eye size={14} style={{ color: '#38BDF8' }} />
            <span>Живое Telegram-превью</span>
          </div>

          <div style={{
            width: 320,
            background: '#0E1621',
            borderRadius: 32,
            padding: 14,
            border: '4px solid #1E293B',
            boxShadow: '0 25px 50px rgba(0,0,0,0.8), 0 0 25px rgba(30,144,255,0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            {/* Telegram Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #1E90FF, #A855F7)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>
                {botName[0]?.toUpperCase() || 'B'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#FFF', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>{botName}</span>
                  <span style={{ color: '#38BDF8', fontSize: 11 }}>✓</span>
                </div>
                <div style={{ fontSize: 10.5, color: '#64748B' }}>бот • был(а) только что</div>
              </div>
            </div>

            {/* Message Bubble */}
            <div style={{
              background: '#182533',
              borderRadius: '16px 16px 16px 4px',
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              alignSelf: 'flex-start',
              maxWidth: '92%'
            }}>
              {/* Optional Banner Image */}
              {imageUrl && (
                <div style={{ borderRadius: 10, overflow: 'hidden', maxHeight: 160, background: '#0F1424' }}>
                  <img 
                    src={imageUrl} 
                    alt="Баннер" 
                    onError={(e) => { (e.target as any).style.display = 'none' }}
                    style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                  />
                </div>
              )}

              {/* Text */}
              <div style={{ fontSize: 13, color: '#F1F5F9', lineHeight: 1.45, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {formattedPreviewText}
              </div>

              {/* Timestamp */}
              <div style={{ alignSelf: 'flex-end', fontSize: 10, color: '#64748B', display: 'flex', alignItems: 'center', gap: 3 }}>
                <span>{currentTime}</span>
                <span style={{ color: '#38BDF8' }}>✓✓</span>
              </div>
            </div>

            {/* Inline Buttons below bubble */}
            {buttons.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '92%' }}>
                {buttons.map(b => (
                  <div
                    key={b.id}
                    style={{
                      background: '#242F3D',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: '#64B5F6',
                      fontSize: 12.5,
                      fontWeight: 600,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                    }}
                  >
                    <span>{b.text}</span>
                    <ExternalLink size={11} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Broadcasts History Table */}
      {history.length > 0 && (
        <div style={{ marginTop: 32, background: '#090C15', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={16} style={{ color: '#94A3B8' }} />
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#FFF' }}>История ранее отправленных кампаний</h4>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#0D111D', color: '#94A3B8', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Дата и время</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Фрагмент сообщения</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Кнопки</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Доставка</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Действие</th>
                </tr>
              </thead>
              <tbody>
                {history.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 16px', color: '#94A3B8', whiteSpace: 'nowrap' }}>{item.sentAt}</td>
                    <td style={{ padding: '12px 16px', color: '#F1F5F9', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.text}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#38BDF8' }}>
                      {item.buttonsCount > 0 ? `${item.buttonsCount} шт` : '–'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: '#10B981', fontWeight: 700 }}>✓ {item.successCount}</span>
                      {item.failCount > 0 && <span style={{ color: '#EF4444', marginLeft: 8 }}>✗ {item.failCount}</span>}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => setText(item.text)}
                        style={{ background: 'rgba(30,144,255,0.1)', border: '1px solid rgba(30,144,255,0.25)', color: '#38BDF8', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11.5, fontWeight: 600 }}
                      >
                        Копировать текст
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
