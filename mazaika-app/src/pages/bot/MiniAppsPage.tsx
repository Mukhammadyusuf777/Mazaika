import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { AppWindow, Plus, Copy, Trash2, Settings2, Eye } from 'lucide-react'
import { getMiniApps, createMiniApp, updateMiniApp, deleteMiniApp } from '../../api/firestore'

interface MiniAppItem {
  id: string
  name: string
  type: 'store' | 'form' | 'wheel'
  active: boolean
  config: any
  updatedAt: any
}

export default function MiniAppsPage() {
  const { botId } = useParams<{ botId: string }>()
  const [apps, setApps] = useState<MiniAppItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)



  // Edit State
  const [editingApp, setEditingApp] = useState<MiniAppItem | null>(null)

  // Form State
  const [newAppName, setNewAppName] = useState('')
  const [newAppType, setNewAppType] = useState<'store' | 'form' | 'wheel'>('store')

  // Fetch Apps
  const fetchApps = async () => {
    if (!botId) return
    setIsLoading(true)
    try {
      const data = await getMiniApps(botId)
      setApps(data as MiniAppItem[])
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchApps()
  }, [botId])

  // Create App
  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!botId || !newAppName.trim()) return
    setIsLoading(true)
    try {
      let defaultConfig: any = {}
      if (newAppType === 'store') {
        defaultConfig = {
          themeColor: '#1e90ff',
          items: [
            { id: '1', name: 'Pizza Margherita', desc: 'Pomidor, motsarella, rayhon', price: 45000, img: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=150' },
            { id: '2', name: 'Burger Classic', desc: 'Mol go\'shti, sir, maxsus sous', price: 25000, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150' }
          ]
        }
      } else if (newAppType === 'form') {
        defaultConfig = {
          themeColor: '#00f5c4',
          title: 'Fikr-mulohaza',
          desc: 'Xizmat sifatini oshirish uchun so\'rovnoma',
          fields: [
            { name: 'name', label: 'Ismingiz', type: 'text', required: true },
            { name: 'phone', label: 'Telefon raqam', type: 'tel', required: true },
            { name: 'rating', label: 'Baholang (1-5)', type: 'number', required: false },
            { name: 'comment', label: 'Izohingiz', type: 'textarea', required: false }
          ]
        }
      } else if (newAppType === 'wheel') {
        defaultConfig = {
          themeColor: '#ec4899',
          title: 'Omad G\'ildiragi',
          desc: 'G\'ildirakni aylantiring va kafolatlangan sovg\'alardan birini yutib oling!',
          prizes: [
            { id: '1', label: '10% Chegirma', color: '#1e90ff' },
            { id: '2', label: 'Bepul Pitsa', color: '#ec4899' },
            { id: '3', label: 'Sovg\'a quti', color: '#8b5cf6' },
            { id: '4', label: 'Keshbek 5000 UZS', color: '#10d974' },
            { id: '5', label: 'Yana bir bor', color: '#ffb830' },
            { id: '6', label: 'Kupon 20%', color: '#f43f5e' }
          ]
        }
      }

      await createMiniApp(botId, {
        name: newAppName,
        type: newAppType,
        config: defaultConfig
      })
      setShowCreateModal(false)
      setNewAppName('')
      fetchApps()
    } catch (e) {
      alert('Mini ilova yaratishda xatolik!')
    } finally {
      setIsLoading(false)
    }
  }

  // Delete App
  const handleDeleteApp = async (appId: string) => {
    if (!botId) return
    if (!window.confirm("Haqiqatan ham ushbu mini ilovani butunlay o'chirib tashlamoqchimisiz?")) return
    setIsLoading(true)
    try {
      await deleteMiniApp(botId, appId)
      if (editingApp?.id === appId) setEditingApp(null)
      fetchApps()
    } catch (e) {
      alert("Ilovani o'chirishda xatolik yuz berdi.")
    } finally {
      setIsLoading(false)
    }
  }

  // Save Configuration Updates
  const handleSaveConfig = async () => {
    if (!botId || !editingApp) return
    setIsLoading(true)
    try {
      await updateMiniApp(botId, editingApp.id, {
        config: editingApp.config,
        name: editingApp.name
      })
      alert('Ilova sozlamalari muvaffaqiyatli saqlanib, e\'lon qilindi!')
      fetchApps()
    } catch (e) {
      alert('Sozlamalarni saqlashda xatolik!')
    } finally {
      setIsLoading(false)
    }
  }

  // Copy Link Helper
  const handleCopyLink = (appId: string) => {
    const url = `https://mazaika.pages.dev/webapp/${botId}/${appId}`
    navigator.clipboard.writeText(url)
    setCopiedId(appId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div style={{ padding: 'var(--space-8)', display: 'grid', gridTemplateColumns: editingApp ? '1.2fr 1fr' : '1fr', gap: 'var(--space-8)', height: '100%', overflowY: 'auto' }}>
      
      {/* Left side: List of Apps */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Mini Ilovalar (Web Apps)</h2>
            <p style={{ color: 'var(--text-muted)' }}>Telegram boti ichida ochiladigan smart interfeyslarni yarating va sozlang. {isLoading && '🔄'}</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Mini ilova yaratish
          </button>
        </div>

        <div style={{ background: 'rgba(30,144,255,0.08)', border: '1px solid var(--accent-blue)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-4)', marginBottom: 'var(--space-6)', fontSize: 13, lineHeight: 1.5 }}>
          💡 <b>Birlashgan Tizim (Unified Platform):</b> Mazaika platformasida Telegram Mini Ilova (WebApp) va jamoat veb-sayti yagona blok-konstruktor orqali ishlaydi. <b>Konstruktor</b> bo'limida yaratgan bloklaringiz (katalog, so'rovnoma, hamyon, ovoz berish va h.k.) avtomatik ravishda mini ilovangizda ham aks etadi. Sozlash uchun Konstruktor bo'limiga o'ting!
        </div>


        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {apps.map(app => (
            <div 
              key={app.id} 
              style={{ 
                background: 'var(--bg-card)', 
                borderRadius: 'var(--radius-xl)', 
                border: editingApp?.id === app.id ? '2px solid var(--accent-blue)' : '1px solid var(--border-primary)', 
                padding: 'var(--space-5)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s',
                boxShadow: editingApp?.id === app.id ? '0 8px 30px rgba(30,144,255,0.15)' : 'none'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                  <div style={{ 
                    width: 42, 
                    height: 42, 
                    borderRadius: 10, 
                    background: `color-mix(in srgb, ${app.config?.themeColor || '#1e90ff'} 15%, transparent)`, 
                    color: app.config?.themeColor || '#1e90ff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <AppWindow size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, fontSize: 'var(--text-md)' }}>{app.name}</h4>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {app.type === 'store' ? 'Store / Katalog' : app.type === 'form' ? 'So\'rovnoma' : 'Omad G\'ildiragi'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
                <button className="btn btn-ghost btn-sm flex-1" onClick={() => setEditingApp(app)}>
                  <Settings2 size={14} /> Sozlash
                </button>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleCopyLink(app.id)} title="Telegram uchun havolani nusxalash">
                  <Copy size={14} style={{ color: copiedId === app.id ? 'var(--accent-green)' : 'inherit' }} />
                </button>
                <a className="btn btn-ghost btn-sm btn-icon" href={`/webapp/${botId}/${app.id}`} target="_blank" rel="noreferrer" title="Brauzerda ko'rish">
                  <Eye size={14} />
                </a>
                <button className="btn btn-ghost btn-sm btn-icon" style={{ color: '#ef4444' }} onClick={() => handleDeleteApp(app.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {apps.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-primary)' }}>
              <AppWindow size={32} style={{ margin: '0 auto var(--space-3)', opacity: 0.5 }} />
              Hali mini ilovalar yaratilmagan. Ilk smart ilovangizni yarating!
            </div>
          )}
        </div>
      </div>

      {/* Right side: Config Editor */}
      {editingApp && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)', borderBottom: '1px solid var(--border-primary)', paddingBottom: 'var(--space-3)' }}>
            <h3 style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>Ilova sozlamalari</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditingApp(null)}>Yopish</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 'var(--space-1)', color: 'var(--text-secondary)' }}>Ilova nomi</label>
              <input 
                type="text" 
                className="input" 
                value={editingApp.name} 
                onChange={e => setEditingApp({ ...editingApp, name: e.target.value })} 
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 'var(--space-1)', color: 'var(--text-secondary)' }}>Mavzu rangi</label>
              <input 
                type="color" 
                value={editingApp.config?.themeColor || '#1e90ff'} 
                onChange={e => setEditingApp({
                  ...editingApp,
                  config: { ...editingApp.config, themeColor: e.target.value }
                })} 
                style={{ width: 60, height: 35, border: 'none', padding: 0, borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
              />
            </div>

            {/* Custom fields depending on Type */}
            {editingApp.type === 'store' && (
              <div>
                <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 'var(--space-2)' }}>Katalog maxsulotlari</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {(editingApp.config?.items || []).map((item: any, index: number) => (
                    <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 'var(--space-2)', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        className="input" 
                        placeholder="Nomi" 
                        value={item.name} 
                        onChange={e => {
                          const updated = [...editingApp.config.items]
                          updated[index].name = e.target.value
                          setEditingApp({ ...editingApp, config: { ...editingApp.config, items: updated } })
                        }}
                      />
                      <input 
                        type="number" 
                        className="input" 
                        placeholder="Narxi (UZS)" 
                        value={item.price} 
                        onChange={e => {
                          const updated = [...editingApp.config.items]
                          updated[index].price = parseFloat(e.target.value) || 0
                          setEditingApp({ ...editingApp, config: { ...editingApp.config, items: updated } })
                        }}
                      />
                      <button className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }} onClick={() => {
                        const updated = (editingApp.config.items || []).filter((_: any, i: number) => i !== index)
                        setEditingApp({ ...editingApp, config: { ...editingApp.config, items: updated } })
                      }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button className="btn btn-ghost btn-sm" onClick={() => {
                    const newItem = { id: Date.now().toString(), name: 'Yangi mahsulot', desc: 'Tavsif', price: 10000, img: '' }
                    const updated = [...(editingApp.config.items || []), newItem]
                    setEditingApp({ ...editingApp, config: { ...editingApp.config, items: updated } })
                  }}>
                    + Mahsulot qo'shish
                  </button>
                </div>
              </div>
            )}

            {editingApp.type === 'form' && (
              <div>
                <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 'var(--space-2)' }}>So'rovnoma maydonlari</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {(editingApp.config?.fields || []).map((field: any, index: number) => (
                    <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr auto', gap: 'var(--space-2)', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        className="input" 
                        placeholder="Sarlavha" 
                        value={field.label} 
                        onChange={e => {
                          const updated = [...editingApp.config.fields]
                          updated[index].label = e.target.value
                          setEditingApp({ ...editingApp, config: { ...editingApp.config, fields: updated } })
                        }}
                      />
                      <select 
                        className="input"
                        value={field.type}
                        onChange={e => {
                          const updated = [...editingApp.config.fields]
                          updated[index].type = e.target.value
                          setEditingApp({ ...editingApp, config: { ...editingApp.config, fields: updated } })
                        }}
                      >
                        <option value="text">Matn</option>
                        <option value="tel">Telefon</option>
                        <option value="number">Raqam</option>
                        <option value="textarea">Uzoq matn</option>
                      </select>
                      <button className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }} onClick={() => {
                        const updated = (editingApp.config.fields || []).filter((_: any, i: number) => i !== index)
                        setEditingApp({ ...editingApp, config: { ...editingApp.config, fields: updated } })
                      }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button className="btn btn-ghost btn-sm" onClick={() => {
                    const newField = { name: `field_${Date.now()}`, label: 'Yangi maydon', type: 'text', required: false }
                    const updated = [...(editingApp.config.fields || []), newField]
                    setEditingApp({ ...editingApp, config: { ...editingApp.config, fields: updated } })
                  }}>
                    + Maydon qo'shish
                  </button>
                </div>
              </div>
            )}

            {editingApp.type === 'wheel' && (
              <div>
                <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 'var(--space-2)' }}>G'ildirak sovg'alari</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {(editingApp.config?.prizes || []).map((prize: any, index: number) => (
                    <div key={prize.id || index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 'var(--space-2)', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        className="input" 
                        placeholder="Sovg'a nomi" 
                        value={prize.label} 
                        onChange={e => {
                          const updated = [...editingApp.config.prizes]
                          updated[index].label = e.target.value
                          setEditingApp({ ...editingApp, config: { ...editingApp.config, prizes: updated } })
                        }}
                      />
                      <input 
                        type="color" 
                        value={prize.color} 
                        onChange={e => {
                          const updated = [...editingApp.config.prizes]
                          updated[index].color = e.target.value
                          setEditingApp({ ...editingApp, config: { ...editingApp.config, prizes: updated } })
                        }}
                        style={{ border: 'none', padding: 0, height: 35, width: '100%', cursor: 'pointer', borderRadius: 4 }}
                      />
                      <button className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }} onClick={() => {
                        const updated = (editingApp.config.prizes || []).filter((_: any, i: number) => i !== index)
                        setEditingApp({ ...editingApp, config: { ...editingApp.config, prizes: updated } })
                      }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button className="btn btn-ghost btn-sm" onClick={() => {
                    const newPrize = { id: Date.now().toString(), label: 'Yangi sovg\'a', color: '#e2e8f0' }
                    const updated = [...(editingApp.config.prizes || []), newPrize]
                    setEditingApp({ ...editingApp, config: { ...editingApp.config, prizes: updated } })
                  }}>
                    + Sovg'a qo'shish
                  </button>
                </div>
              </div>
            )}

            <button 
              className="btn btn-primary" 
              onClick={handleSaveConfig} 
              style={{ marginTop: 'var(--space-4)', justifyContent: 'center' }}
            >
              Saqlash va e'lon qilish
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleCreateApp} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', width: 400 }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Yangi Mini Ilova Yaratish</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 'var(--space-1)' }}>Ilova nomi</label>
                <input 
                  type="text" 
                  className="input" 
                  value={newAppName} 
                  onChange={e => setNewAppName(e.target.value)} 
                  placeholder="Masalan: Do'kon katalogi"
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 'var(--space-1)' }}>Ilova turi</label>
                <select 
                  className="input" 
                  value={newAppType} 
                  onChange={e => setNewAppType(e.target.value as any)}
                  style={{ width: '100%' }}
                >
                  <option value="store">Internet Do'kon / Katalog</option>
                  <option value="form">Foydalanuvchi So'rovnomasi</option>
                  <option value="wheel">Omad G'ildiragi / O'yin</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>Bekor qilish</button>
              <button type="submit" className="btn btn-primary">Yaratish</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
