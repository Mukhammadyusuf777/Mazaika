import { Search, Filter, Download } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getContacts } from '../../api/firestore'

interface Contact {
  id: string
  telegramId: string
  firstName: string | null
  lastName: string | null
  username: string | null
  createdAt: any
}

export default function ContactsPage() {
  const { botId } = useParams<{ botId: string }>()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (botId) {
      getContacts(botId)
        .then(data => {
          setContacts(data as Contact[])
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setLoading(false)
        })
    }
  }, [botId])


  return (
    <div style={{ padding: 'var(--space-8)', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)' }}>Kontaktlar</h2>
          <p style={{ color: 'var(--text-muted)' }}>Barcha obunachilar ro'yxati</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost"><Filter size={16} /> Filtrlar</button>
          <button className="btn btn-ghost"><Download size={16} /> Eksport</button>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-primary)', overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 300 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }} />
            <input type="text" className="input" placeholder="Ism yoki ID bo'yicha qidirish" style={{ paddingLeft: 36, width: '100%' }} />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>Yuklanmoqda...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-secondary)' }}>
                <th style={{ padding: 'var(--space-4)', color: 'var(--text-muted)', fontWeight: 500 }}>Telegram ID</th>
                <th style={{ padding: 'var(--space-4)', color: 'var(--text-muted)', fontWeight: 500 }}>Ism / Username</th>
                <th style={{ padding: 'var(--space-4)', color: 'var(--text-muted)', fontWeight: 500 }}>Obuna sanasi</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Hali obunachilar yo'q
                  </td>
                </tr>
              ) : (
                contacts.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                    <td style={{ padding: 'var(--space-4)', color: 'var(--text-secondary)' }}>{item.telegramId}</td>
                    <td style={{ padding: 'var(--space-4)' }}>
                      <div style={{ fontWeight: 600 }}>{item.firstName} {item.lastName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.username ? `@${item.username}` : '-'}</div>
                    </td>
                    <td style={{ padding: 'var(--space-4)', color: 'var(--text-secondary)' }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
