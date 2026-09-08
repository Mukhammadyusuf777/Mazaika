import { useState, useEffect, useRef, useMemo } from 'react'
import { Send, User, CheckCheck, Loader2, ShoppingCart, Sparkles, Search, MessageSquare } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { apiClient } from '../../api/apiClient'
import { getContacts, getMessages } from '../../api/firestore'
import './ChatsPage.css'

interface Contact {
  id: string
  telegramId: string
  firstName: string | null
  lastName: string | null
  createdAt: any
  state?: string
}

interface Message {
  id: string
  text: string | null
  direction: string
  createdAt: any
}

export default function ChatsPage() {
  const { botId } = useParams<{ botId: string }>()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [activeContactId, setActiveContactId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [isAiGenerating, setIsAiGenerating] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (botId) {
      getContacts(botId)
        .then(data => {
          setContacts(data as Contact[])
          if (data.length > 0 && window.innerWidth > 768 && !activeContactId) {
            setActiveContactId(data[0].id)
          }
        })
        .catch(console.error)
    }
  }, [botId])

  useEffect(() => {
    if (botId && activeContactId) {
      setLoading(true)
      getMessages(botId, activeContactId)
        .then(data => {
          setMessages(data as Message[])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [botId, activeContactId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Filter contacts by search query
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts
    const q = searchQuery.toLowerCase().trim()
    return contacts.filter(c => {
      const name = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase()
      const tgId = String(c.telegramId || '')
      return name.includes(q) || tgId.includes(q)
    })
  }, [contacts, searchQuery])

  // Last inbound message from client
  const lastInboundMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].direction === 'inbound' && messages[i].text) {
        return messages[i].text!
      }
    }
    return null
  }, [messages])

  // AI Smart Reply Generator ($0.00 client-side intelligent heuristics + fallback)
  const handleGenerateAiReply = (tone: 'polite' | 'sales' | 'support' = 'polite') => {
    setIsAiGenerating(true)
    setTimeout(() => {
      let reply = ''
      const prompt = (lastInboundMessage || '').toLowerCase()

      if (prompt.includes('доставк') || prompt.includes('yetkaz') || prompt.includes('где заказ') || prompt.includes('курьер')) {
        reply = 'Здравствуйте! Спасибо за ожидание. Ваш заказ уже передан курьеру и будет доставлен в течение 30-40 минут. Если потребуется уточнить детали, мы сразу с вами свяжемся!'
      } else if (prompt.includes('цена') || prompt.includes('стоим') || prompt.includes('narx') || prompt.includes('скидк') || prompt.includes('skidka')) {
        reply = 'Добрый день! Актуальные цены и спецпредложения со скидкой до 20% доступны в нашем каталоге. Подсказать вам подробнее по конкретной позиции?'
      } else if (prompt.includes('привет') || prompt.includes('здравствуй') || prompt.includes('салом') || prompt.includes('salom')) {
        reply = 'Здравствуйте! Рад приветствовать вас. Чем я могу помочь вам сегодня?'
      } else if (prompt.includes('оплат') || prompt.includes('tolov') || prompt.includes('click') || prompt.includes('payme')) {
        reply = 'Здравствуйте! Оплатить можно моментально через Payme, Click или картой. Ссылка на оплату формируется автоматически при подтверждении заказа.'
      } else if (tone === 'sales') {
        reply = 'Добрый день! Спасибо за обращение. Сейчас у нас действует эксклюзивное предложение для новых клиентов. Хотите оформить заказ прямо сейчас с персональным бонусом?'
      } else if (tone === 'support') {
        reply = 'Здравствуйте! Я внимательно ознакомился с вашим вопросом. Уже проверяю информацию и вернусь с решением в течение нескольких минут.'
      } else {
        reply = 'Здравствуйте! Спасибо за обращение. Подскажите, пожалуйста, детали вашего вопроса, чтобы я мог максимально быстро вам помочь.'
      }

      setInputText(reply)
      setIsAiGenerating(false)
    }, 450)
  }

  const handleSend = async () => {
    if (!inputText.trim() || !activeContactId || !botId) return
    
    setSending(true)
    try {
      const res = await apiClient.post(`/bots/${botId}/contacts/${activeContactId}/messages`, {
        text: inputText
      })
      if (!res.data.error) {
        setMessages(prev => [...prev, res.data])
        setInputText('')
      } else {
        alert(res.data.error)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  const activeContact = contacts.find(c => c.id === activeContactId)

  return (
    <div className={`chats-container ${activeContactId ? 'has-active' : ''}`}>
      {/* Sidebar */}
      <div className="chats-sidebar">
        <div className="chats-header">
          <h2>Чаты с клиентами</h2>
          <span className="badge badge-aqua">{contacts.length} диалогов</span>
        </div>
        <div style={{ padding: '0 16px 12px 16px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#64748B' }} />
            <input 
              type="text" 
              className="input" 
              placeholder="Поиск по имени или ID..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, fontSize: 13 }}
            />
          </div>
        </div>
        <div className="chats-list">
          {filteredContacts.map(contact => {
            let lastOrderTotal = ''
            try {
              const parsedState = contact.state ? JSON.parse(contact.state) : null
              lastOrderTotal = parsedState?.variables?.last_order_total || ''
            } catch (e) {}

            return (
              <div 
                key={contact.id} 
                className={`chat-item ${activeContactId === contact.id ? 'active' : ''}`}
                onClick={() => setActiveContactId(contact.id)}
              >
                <div className="chat-avatar">
                  {contact.firstName ? contact.firstName.charAt(0).toUpperCase() : <User size={18} />}
                </div>
                <div className="chat-info" style={{ flex: 1, minWidth: 0 }}>
                  <div className="chat-name-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="chat-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {contact.firstName || 'Клиент'} {contact.lastName || ''}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      {contact.createdAt ? new Date(contact.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <div className="chat-msg-row" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span className="chat-msg" style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>ID: {contact.telegramId}</span>
                    {lastOrderTotal && (
                      <span style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: 4, 
                        fontSize: 10, background: 'rgba(16, 217, 116, 0.1)', color: '#10d974', 
                        padding: '2px 6px', borderRadius: 4, width: 'fit-content', fontWeight: 700, marginTop: 2
                      }}>
                        <ShoppingCart size={10} /> Заказ: {Number(lastOrderTotal).toLocaleString()} UZS
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          {filteredContacts.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              {searchQuery ? 'Диалоги не найдены' : 'Диалогов пока нет'}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeContact ? (
        <div className="chat-main">
          <div className="chat-main-header">
            {/* Back button visible only on mobile */}
            <button 
              className="btn btn-ghost btn-sm mobile-back-btn" 
              onClick={() => setActiveContactId(null)}
              style={{ display: 'none', alignItems: 'center', gap: 4, marginRight: 8, padding: '4px 8px' }}
            >
              ← Назад
            </button>
            <div className="chat-avatar">
              <User size={20} />
            </div>
            <div>
              <h3>{activeContact.firstName || 'Клиент'} {activeContact.lastName || ''}</h3>
              <span className="chat-status">Telegram ID: {activeContact.telegramId}</span>
            </div>
          </div>

          <div className="chat-messages" style={{ overflowY: 'auto', flex: 1, padding: 20 }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Загрузка сообщений...</span>
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }}>
                <MessageSquare size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                <div>Сообщений пока нет</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Напишите первое сообщение клиенту прямо отсюда</div>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`message ${msg.direction === 'inbound' ? 'in' : 'out'}`}>
                  <div className="msg-bubble">{msg.text || '[Медиа/Действие]'}</div>
                  <span className="msg-time">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    {msg.direction === 'outbound' && <CheckCheck size={12} style={{ marginLeft: 4 }} />}
                  </span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* AI Smart Reply Quick Bar */}
          <div style={{ padding: '8px 16px', background: '#0D111D', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#00F5C4', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Sparkles size={12} /> AI Ответ:
            </span>
            <button
              onClick={() => handleGenerateAiReply('polite')}
              disabled={isAiGenerating}
              style={{ background: 'rgba(0,245,196,0.1)', border: '1px solid rgba(0,245,196,0.25)', color: '#00F5C4', padding: '3px 10px', borderRadius: 14, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
            >
              {isAiGenerating ? 'Думает...' : '🤝 Вежливый ответ'}
            </button>
            <button
              onClick={() => handleGenerateAiReply('sales')}
              disabled={isAiGenerating}
              style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', color: '#38BDF8', padding: '3px 10px', borderRadius: 14, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
            >
              💰 Продающий оффер
            </button>
            <button
              onClick={() => handleGenerateAiReply('support')}
              disabled={isAiGenerating}
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: '#A855F7', padding: '3px 10px', borderRadius: 14, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
            >
              ⚡ Помощь и FAQ
            </button>
          </div>

          <div className="chat-input-area">
            <input 
              type="text" 
              className="input flex-1" 
              placeholder="Напишите ответ клиенту или используйте AI Подсказку..." 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button className="btn btn-primary btn-icon" onClick={handleSend} disabled={sending || !inputText.trim()}>
              {sending ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={18} />}
            </button>
          </div>
        </div>
      ) : (
        <div className="chat-main placeholder" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <MessageSquare size={44} style={{ marginBottom: 12, opacity: 0.3 }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: '#FFF' }}>Выберите диалог из списка слева</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Вы сможете читать историю сообщений и отвечать клиентам в реальном времени</div>
        </div>
      )}
    </div>
  )
}
