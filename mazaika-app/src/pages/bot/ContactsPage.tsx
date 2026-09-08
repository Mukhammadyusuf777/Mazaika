import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { 
  Search, Filter, Download, Phone, Send, 
  ExternalLink, Copy, Check, Users, ShoppingCart, Clock
} from 'lucide-react'
import { getContacts } from '../../api/firestore'

interface Contact {
  id: string
  telegramId: string
  firstName: string | null
  lastName: string | null
  username: string | null
  phone?: string | null
  status?: string | null
  stage?: 'new' | 'in_progress' | 'completed' | 'cancelled' | string
  variables?: Record<string, any>
  createdAt: any
  lastSeen?: any
}

export default function ContactsPage() {
  const { botId } = useParams<{ botId: string }>()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStage, setSelectedStage] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (botId) {
      getContacts(botId)
        .then(data => {
          setContacts(data as Contact[])
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to load contacts:', err)
          setLoading(false)
        })
    }
  }, [botId])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const q = searchQuery.toLowerCase().trim()
      const fullName = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase()
      const uname = (c.username || '').toLowerCase()
      const tgId = String(c.telegramId || '')
      const phone = String(c.phone || c.variables?.phone || '').toLowerCase()

      const matchesSearch = !q || fullName.includes(q) || uname.includes(q) || tgId.includes(q) || phone.includes(q)
      
      const stage = c.stage || (c.variables?.status as string) || 'new'
      const matchesStage = selectedStage === 'all' || stage === selectedStage

      return matchesSearch && matchesStage
    })
  }, [contacts, searchQuery, selectedStage])

  // Export to Excel-compatible CSV (with UTF-8 BOM)
  const handleExportCsv = () => {
    if (contacts.length === 0) {
      alert('Нет контактов для экспорта.')
      return
    }

    const headers = ['Telegram ID', 'Имя', 'Фамилия', 'Username', 'Телефон', 'Статус/Воронка', 'Дата подписки']
    
    const rows = contacts.map(c => {
      const phone = c.phone || c.variables?.phone || ''
      const stage = c.stage || c.variables?.status || 'Новый'
      const date = c.createdAt ? new Date(c.createdAt).toLocaleDateString('ru-RU') : '-'
      
      return [
        `"${c.telegramId || ''}"`,
        `"${(c.firstName || '').replace(/"/g, '""')}"`,
        `"${(c.lastName || '').replace(/"/g, '""')}"`,
        `"${(c.username || '').replace(/"/g, '""')}"`,
        `"${phone}"`,
        `"${stage}"`,
        `"${date}"`
      ].join(';')
    })

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `mazaika_leads_${botId || 'bot'}_${new Date().toISOString().slice(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="settings-container" style={{ maxWidth: '100%', padding: '24px 32px' }}>
      {/* Top Header */}
      <div className="page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={24} style={{ color: '#00F5C4' }} />
            <span>Контакты и CRM Лиды</span>
          </h2>
          <p style={{ color: '#94A3B8', fontSize: 13, marginTop: 4 }}>
            База пользователей, собранные контакты и заявки из вашего Telegram-бота
          </p>
        </div>

        <div className="page-header-actions" style={{ display: 'flex', gap: 12 }}>
          <button 
            className="btn btn-primary" 
            onClick={handleExportCsv}
            style={{ 
              background: 'linear-gradient(135deg, #00F5C4 0%, #1E90FF 100%)', 
              color: '#030712', 
              fontWeight: 700, 
              border: 'none', 
              padding: '9px 18px', 
              borderRadius: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              boxShadow: '0 4px 15px rgba(0, 245, 196, 0.25)'
            }}
          >
            <Download size={16} /> 
            <span>Экспорт в Excel (CSV)</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#0F131E', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,245,196,0.1)', color: '#00F5C4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>Всего контактов</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#FFF' }}>{contacts.length}</div>
          </div>
        </div>

        <div style={{ background: '#0F131E', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(30,144,255,0.1)', color: '#1E90FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Phone size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>С номерами телефонов</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#FFF' }}>
              {contacts.filter(c => !!(c.phone || c.variables?.phone)).length}
            </div>
          </div>
        </div>

        <div style={{ background: '#0F131E', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(168,85,247,0.1)', color: '#A855F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingCart size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>Новые лиды</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#FFF' }}>
              {contacts.filter(c => !c.stage || c.stage === 'new').length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div style={{ background: '#090C15', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}>
        {/* Search & Filter Toolbar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', width: 340, maxWidth: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: 12, color: '#64748B' }} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск по имени, username, телефону..." 
              style={{ 
                paddingLeft: 40, 
                paddingRight: 14,
                paddingTop: 10,
                paddingBottom: 10,
                width: '100%',
                background: '#0F1424',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10,
                color: '#FFF',
                fontSize: 13,
                outline: 'none'
              }} 
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={15} style={{ color: '#64748B' }} />
            <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Статус:</span>
            <select
              value={selectedStage}
              onChange={e => setSelectedStage(e.target.value)}
              style={{
                background: '#0F1424',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                padding: '8px 12px',
                color: '#FFF',
                fontSize: 13,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">Все статусы ({contacts.length})</option>
              <option value="new">Новый лид</option>
              <option value="in_progress">В обработке</option>
              <option value="completed">Успешная сделка</option>
              <option value="cancelled">Отказ</option>
            </select>
          </div>
        </div>

        {/* Content Table */}
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94A3B8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, border: '3px solid rgba(0,245,196,0.2)', borderTopColor: '#00F5C4', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span>Загрузка базы контактов...</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0D111D' }}>
                  <th style={{ padding: '14px 20px', color: '#94A3B8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>Клиент / Username</th>
                  <th style={{ padding: '14px 20px', color: '#94A3B8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>Телефон</th>
                  <th style={{ padding: '14px 20px', color: '#94A3B8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>Telegram ID</th>
                  <th style={{ padding: '14px 20px', color: '#94A3B8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>Статус Лида</th>
                  <th style={{ padding: '14px 20px', color: '#94A3B8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>Дата подписки</th>
                  <th style={{ padding: '14px 20px', color: '#94A3B8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700, textAlign: 'right' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 48, textAlign: 'center' }}>
                      <div style={{ color: '#94A3B8', fontSize: 14, marginBottom: 6, fontWeight: 600 }}>
                        {searchQuery ? 'По вашему запросу ничего не найдено' : 'Подписчиков пока нет'}
                      </div>
                      <div style={{ color: '#64748B', fontSize: 12, maxWidth: 400, margin: '0 auto' }}>
                        Когда пользователи запускают вашего Telegram-бота (/start) или заполняют заявки, они автоматически появляются в этой таблице.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map(item => {
                    const phone = item.phone || item.variables?.phone || null
                    const stage = item.stage || item.variables?.status || 'new'
                    const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Недавно'

                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}>
                        {/* Name & Avatar */}
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ 
                              width: 38, 
                              height: 38, 
                              borderRadius: '50%', 
                              background: 'linear-gradient(135deg, #1E90FF, #A855F7)', 
                              color: '#FFF', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 14,
                              flexShrink: 0
                            }}>
                              {(item.firstName?.[0] || item.username?.[0] || 'U').toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 13.5 }}>
                                {item.firstName || ''} {item.lastName || ''} {!item.firstName && !item.lastName && 'Без имени'}
                              </div>
                              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                                {item.username ? (
                                  <a 
                                    href={`https://t.me/${item.username}`} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    style={{ color: '#00D9FF', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                  >
                                    @{item.username}
                                    <ExternalLink size={11} />
                                  </a>
                                ) : (
                                  '–'
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td style={{ padding: '14px 20px', color: '#CBD5E1', fontSize: 13 }}>
                          {phone ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#00F5C4', fontWeight: 600 }}>
                              <Phone size={13} />
                              {phone}
                            </span>
                          ) : (
                            <span style={{ color: '#64748B' }}>Не указан</span>
                          )}
                        </td>

                        {/* Telegram ID */}
                        <td style={{ padding: '14px 20px', fontSize: 12, fontFamily: 'monospace', color: '#94A3B8' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>{item.telegramId}</span>
                            <button 
                              onClick={() => copyToClipboard(item.telegramId, item.id)}
                              style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 2 }}
                              title="Скопировать Telegram ID"
                            >
                              {copiedId === item.id ? <Check size={13} style={{ color: '#10B981' }} /> : <Copy size={13} />}
                            </button>
                          </div>
                        </td>

                        {/* Stage Badge */}
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            background: stage === 'completed' ? 'rgba(16,185,129,0.15)' : stage === 'in_progress' ? 'rgba(245,158,11,0.15)' : stage === 'cancelled' ? 'rgba(239,68,68,0.15)' : 'rgba(30,144,255,0.15)',
                            color: stage === 'completed' ? '#10B981' : stage === 'in_progress' ? '#F59E0B' : stage === 'cancelled' ? '#EF4444' : '#1E90FF',
                            border: `1px solid ${stage === 'completed' ? 'rgba(16,185,129,0.3)' : stage === 'in_progress' ? 'rgba(245,158,11,0.3)' : stage === 'cancelled' ? 'rgba(239,68,68,0.3)' : 'rgba(30,144,255,0.3)'}`
                          }}>
                            {stage === 'completed' ? 'Сделка закрыта' : stage === 'in_progress' ? 'В обработке' : stage === 'cancelled' ? 'Отказ' : 'Новый лид'}
                          </span>
                        </td>

                        {/* Subscription Date */}
                        <td style={{ padding: '14px 20px', color: '#94A3B8', fontSize: 12.5 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Clock size={13} style={{ color: '#64748B' }} />
                            <span>{dateStr}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          {item.username ? (
                            <a
                              href={`https://t.me/${item.username}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                background: 'rgba(30,144,255,0.1)',
                                border: '1px solid rgba(30,144,255,0.25)',
                                color: '#38BDF8',
                                padding: '6px 12px',
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 600,
                                textDecoration: 'none',
                                transition: 'all 0.15s'
                              }}
                            >
                              <Send size={12} />
                              <span>Написать</span>
                            </a>
                          ) : (
                            <span style={{ color: '#475569', fontSize: 12 }}>–</span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
