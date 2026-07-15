import { useState, useEffect, useRef } from 'react'
import { Send, User, CheckCheck, Loader2 } from 'lucide-react'
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
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (botId) {
      getContacts(botId)
        .then(data => {
          setContacts(data as Contact[])
          if (data.length > 0) {
            setActiveContactId(data[0].id)
          }
        })
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
    <div className="chats-container">
      {/* Sidebar */}
      <div className="chats-sidebar">
        <div className="chats-header">
          <h2>Chatlar</h2>
          <span className="badge badge-aqua">{contacts.length} ta faol</span>
        </div>
        <div className="chats-list">
          {contacts.map(contact => (
            <div 
              key={contact.id} 
              className={`chat-item ${activeContactId === contact.id ? 'active' : ''}`}
              onClick={() => setActiveContactId(contact.id)}
            >
              <div className="chat-avatar">
                <User size={20} />
              </div>
              <div className="chat-info">
                <div className="chat-name-row">
                  <span className="chat-name">{contact.firstName} {contact.lastName}</span>
                </div>
                <div className="chat-msg-row">
                  <span className="chat-msg" style={{fontSize: 12}}>{contact.telegramId}</span>
                </div>
              </div>
            </div>
          ))}
          {contacts.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
              Kontaktlar topilmadi
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeContact ? (
        <div className="chat-main">
          <div className="chat-main-header">
            <div className="chat-avatar">
              <User size={20} />
            </div>
            <div>
              <h3>{activeContact.firstName} {activeContact.lastName}</h3>
              <span className="chat-status">Telegram ID: {activeContact.telegramId}</span>
            </div>
          </div>

          <div className="chat-messages" style={{ overflowY: 'auto', flex: 1, padding: 20 }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 20 }}>Yuklanmoqda...</div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 20 }}>Xabarlar yo'q</div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`message ${msg.direction === 'inbound' ? 'in' : 'out'}`}>
                  <div className="msg-bubble">{msg.text || '[Media/Action]'}</div>
                  <span className="msg-time">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {msg.direction === 'outbound' && <CheckCheck size={12} style={{ marginLeft: 4 }} />}
                  </span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input 
              type="text" 
              className="input flex-1" 
              placeholder="Xabar yozish..." 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button className="btn btn-primary btn-icon" onClick={handleSend} disabled={sending || !inputText.trim()}>
              {sending ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          Suhbatni tanlang
        </div>
      )}
    </div>
  )
}
