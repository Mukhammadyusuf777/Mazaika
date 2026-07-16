import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Globe, Save, Eye, Trash2, ArrowUp, ArrowDown, PlusCircle, Layers, Settings } from 'lucide-react'

import { getSiteConfig, saveSiteConfig } from '../../api/firestore'

export interface Block {
  id: string
  type: 'hero' | 'about' | 'catalog' | 'blog' | 'contacts' | 'form' | 'loyalty' | 'voting'
  title?: string
  subtitle?: string
  text?: string
  img?: string
  ctaText?: string
  items?: Array<{ id: string; name: string; price: number; desc: string; img?: string }>
  posts?: Array<{ id: string; title: string; text: string }>
  phone?: string
  telegram?: string
  fields?: Array<{ name: string; label: string; type: string; required: boolean }>
  candidates?: string[]
}

interface SiteConfig {
  theme: string
  themeColor: string
  blocks: Block[]
}

const DEFAULT_BLOCKS: Block[] = [
  {
    id: '1',
    type: 'hero',
    title: 'Smart Bot va Mini Applar',
    subtitle: 'Biznesingizni Telegram orqali yangi darajaga olib chiqing! Sodiqlik tizimlari, internet-do\'kon va avtomatlashtirilgan xizmatlar.',
    ctaText: 'Katalogga o\'tish',
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'
  },
  {
    id: '2',
    type: 'about',
    title: 'Biz haqimizda',
    text: 'Mazaika - bu Telegram Mini Apps va botlarni dasturlashsiz (No-code) yaratish imkonini beruvchi eng zamonaviy platformadir. Biz bilan istalgan loyihangizni bir necha daqiqada ishga tushiring!'
  },
  {
    id: '3',
    type: 'catalog',
    title: 'Katalog va Do\'kon',
    items: [
      { id: 'c1', name: 'Pizza Margherita', price: 45000, desc: 'Pomidor, pishloq va rayhon barglari.', img: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=150' },
      { id: 'c2', name: 'Premium Telegram Bot', price: 990000, desc: 'Tizimingiz uchun to\'liq avtomatlashtirilgan bot.', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150' }
    ]
  },
  {
    id: '4',
    type: 'contacts',
    title: 'Aloqada bo\'ling',
    phone: '+998 90 123 45 67',
    telegram: 'MazaikaSupportBot'
  }
]

const DEFAULT_CONFIG: SiteConfig = {
  theme: 'glassmorphism',
  themeColor: '#1e90ff',
  blocks: DEFAULT_BLOCKS
}

export default function SiteBuilderPage() {
  const { botId } = useParams<{ botId: string }>()
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [showAddMenu, setShowAddMenu] = useState(false)

  useEffect(() => {
    const fetchConfig = async () => {
      if (!botId) return
      setIsLoading(true)
      try {
        const data = await getSiteConfig(botId)
        if (data && Array.isArray(data.blocks)) {
          setConfig(data as SiteConfig)
          if (data.blocks.length > 0) {
            setSelectedBlockId(data.blocks[0].id)
          }
        } else {
          // If old single-block model detected, migrate/reset to blocks layout
          setConfig(DEFAULT_CONFIG)
          setSelectedBlockId('1')
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchConfig()
  }, [botId])

  const handleSave = async () => {
    if (!botId) return
    setIsLoading(true)
    try {
      await saveSiteConfig(botId, config)
      alert('Mini ilova va Sayt dizayni muvaffaqiyatli saqlanib, sinxronlashtirildi!')
    } catch (e) {
      alert('Saqlashda xatolik yuz berdi!')
    } finally {
      setIsLoading(false)
    }
  }

  // Block management
  const addBlock = (type: Block['type']) => {
    const id = Date.now().toString()
    let newBlock: Block = { id, type }

    switch (type) {
      case 'hero':
        newBlock = {
          id,
          type,
          title: 'Yangi banner',
          subtitle: 'Qisqacha ta\'rif yozing',
          ctaText: 'Tugma matni',
          img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'
        }
        break
      case 'about':
        newBlock = {
          id,
          type,
          title: 'Biz haqimizda',
          text: 'Loyihangiz haqida batafsil ma\'lumot bering.'
        }
        break
      case 'catalog':
        newBlock = {
          id,
          type,
          title: 'Mahsulotlar katalogi',
          items: [
            { id: Date.now().toString() + '_1', name: 'Mahsulot 1', price: 50000, desc: 'Ta\'rif...', img: '' }
          ]
        }
        break
      case 'blog':
        newBlock = {
          id,
          type,
          title: 'Yangiliklar va Maqolalar',
          posts: [
            { id: Date.now().toString() + '_p1', title: 'Yangi maqola sarlavhasi', text: 'Matn...' }
          ]
        }
        break
      case 'contacts':
        newBlock = {
          id,
          type,
          title: 'Bizning kontaktlar',
          phone: '+998 90 123 45 67',
          telegram: 'MazaikaSupportBot'
        }
        break
      case 'form':
        newBlock = {
          id,
          type,
          title: 'Mijoz so\'rovnomasi',
          fields: [
            { name: 'name', label: 'Ismingiz', type: 'text', required: true },
            { name: 'phone', label: 'Telefon raqamingiz', type: 'tel', required: true }
          ]
        }
        break
      case 'loyalty':
        newBlock = {
          id,
          type,
          title: 'Shaxsiy bonus balansingiz'
        }
        break
      case 'voting':
        newBlock = {
          id,
          type,
          title: 'Ovoz berish so\'rovnomasi',
          candidates: ['Nomzod A', 'Nomzod B']
        }
        break
    }

    const updatedBlocks = [...config.blocks, newBlock]
    setConfig({ ...config, blocks: updatedBlocks })
    setSelectedBlockId(id)
    setShowAddMenu(false)
  }

  const deleteBlock = (id: string) => {
    const updated = config.blocks.filter(b => b.id !== id)
    setConfig({ ...config, blocks: updated })
    if (selectedBlockId === id) {
      setSelectedBlockId(updated.length > 0 ? updated[0].id : null)
    }
  }

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === config.blocks.length - 1) return

    const updated = [...config.blocks]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp

    setConfig({ ...config, blocks: updated })
  }

  const updateBlockData = (updatedBlock: Block) => {
    const updated = config.blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b)
    setConfig({ ...config, blocks: updated })
  }

  const selectedBlock = config.blocks.find(b => b.id === selectedBlockId)
  const liveUrl = `https://mazaika.pages.dev/site/${botId}`

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', height: '100%', overflow: 'hidden', background: '#0b0f19' }}>
      
      {/* Left panel: Unified Builder Controls */}
      <div style={{ borderRight: '1px solid var(--border-primary)', display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-card)' }}>
        
        {/* Header */}
        <div style={{ padding: 'var(--space-5)', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 'var(--text-lg)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe size={18} style={{ color: 'var(--accent-blue)' }} /> Mazaika Builder
            </h3>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Site & Telegram Mini App constructor</span>
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={isLoading}>
            <Save size={14} /> {isLoading ? 'Saqlash...' : 'Saqlash'}
          </button>
        </div>

        {/* Live link helper */}
        <div style={{ padding: 'var(--space-4)', background: '#1e293b', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
          <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 210 }}>
            {liveUrl}
          </span>
          <a href={`/site/${botId}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-xs" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Eye size={12} /> Ochish
          </a>
        </div>

        {/* Theme select section */}
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-primary)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Mavzu (Theme)</label>
            <select 
              className="input" 
              value={config.theme} 
              onChange={e => setConfig({ ...config, theme: e.target.value })}
              style={{ width: '100%', padding: '6px 10px', fontSize: 12 }}
            >
              <option value="glassmorphism">Glassmorphism (Dark)</option>
              <option value="minimalist">Minimalist Light (Oq)</option>
              <option value="neon">Neon Cyberpunk</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Rang</label>
            <input 
              type="color" 
              value={config.themeColor} 
              onChange={e => setConfig({ ...config, themeColor: e.target.value })}
              style={{ width: 45, height: 28, border: 'none', padding: 0, borderRadius: 4, cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Dynamic Blocks List (Like Google Sites sidebar) */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layers size={14} /> Sahifa bloklari (Blocks list)
            </span>
            <div style={{ position: 'relative' }}>
              <button 
                className="btn btn-ghost btn-xs" 
                onClick={() => setShowAddMenu(!showAddMenu)}
                style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-blue)' }}
              >
                <PlusCircle size={14} /> Blok qo'shish
              </button>
              {showAddMenu && (
                <div style={{ position: 'absolute', right: 0, top: 24, zIndex: 100, background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: 4, display: 'flex', flexDirection: 'column', gap: 2, width: 200, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                  <button className="btn btn-ghost btn-xs" style={{ textAlign: 'left', padding: '6px 12px' }} onClick={() => addBlock('hero')}>📺 Banner (Hero)</button>
                  <button className="btn btn-ghost btn-xs" style={{ textAlign: 'left', padding: '6px 12px' }} onClick={() => addBlock('about')}>📝 Biz haqimizda (About)</button>
                  <button className="btn btn-ghost btn-xs" style={{ textAlign: 'left', padding: '6px 12px' }} onClick={() => addBlock('catalog')}>🛒 Katalog (Catalog)</button>
                  <button className="btn btn-ghost btn-xs" style={{ textAlign: 'left', padding: '6px 12px' }} onClick={() => addBlock('blog')}>📰 Yangiliklar (Blog)</button>
                  <button className="btn btn-ghost btn-xs" style={{ textAlign: 'left', padding: '6px 12px' }} onClick={() => addBlock('contacts')}>📞 Kontaktlar (Contacts)</button>
                  <button className="btn btn-ghost btn-xs" style={{ textAlign: 'left', padding: '6px 12px' }} onClick={() => addBlock('form')}>📝 So'rovnoma (Form)</button>
                  <button className="btn btn-ghost btn-xs" style={{ textAlign: 'left', padding: '6px 12px' }} onClick={() => addBlock('loyalty')}>💰 Bonus balans (Loyalty)</button>
                  <button className="btn btn-ghost btn-xs" style={{ textAlign: 'left', padding: '6px 12px' }} onClick={() => addBlock('voting')}>🗳 Ovoz berish (Voting)</button>
                </div>
              )}
            </div>
          </div>

          {/* Blocks navigation list */}
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6, borderBottom: '1px solid var(--border-primary)' }}>
            {config.blocks.map((block, idx) => (
              <div 
                key={block.id} 
                onClick={() => setSelectedBlockId(block.id)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '8px 12px', 
                  background: selectedBlockId === block.id ? 'rgba(30,144,255,0.1)' : 'rgba(255,255,255,0.02)', 
                  borderRadius: 8, 
                  border: selectedBlockId === block.id ? '1px solid var(--accent-blue)' : '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  fontSize: 12,
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>#{idx + 1}</span>
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                    {block.type === 'hero' ? 'Banner' : block.type === 'about' ? 'Biz haqimizda' : block.type === 'catalog' ? 'Do\'kon / Katalog' : block.type === 'blog' ? 'Blog' : block.type === 'contacts' ? 'Kontaktlar' : block.type === 'form' ? 'Forma' : block.type === 'loyalty' ? 'Hamyon' : 'Ovoz berish'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                  <button className="btn btn-ghost btn-xs btn-icon" onClick={() => moveBlock(idx, 'up')} disabled={idx === 0}><ArrowUp size={11} /></button>
                  <button className="btn btn-ghost btn-xs btn-icon" onClick={() => moveBlock(idx, 'down')} disabled={idx === config.blocks.length - 1}><ArrowDown size={11} /></button>
                  <button className="btn btn-ghost btn-xs btn-icon" style={{ color: '#ef4444' }} onClick={() => deleteBlock(block.id)}><Trash2 size={11} /></button>
                </div>
              </div>
            ))}
            {config.blocks.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: 12 }}>Bloklar qo'shilmagan. Yuqoridan blok qo'shing.</p>
            )}
          </div>

          {/* Active selected block property settings form */}
          {selectedBlock && (
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>
                <Settings size={14} style={{ color: 'var(--accent-blue)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-blue)' }}>Blok sozlamalari</span>
              </div>

              {selectedBlock.type === 'hero' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Sarlavha (Title)</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={selectedBlock.title || ''} 
                      onChange={e => updateBlockData({ ...selectedBlock, title: e.target.value })}
                      style={{ width: '100%', fontSize: 12 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Sub-sarlavha (Subtitle)</label>
                    <textarea 
                      className="input" 
                      value={selectedBlock.subtitle || ''} 
                      onChange={e => updateBlockData({ ...selectedBlock, subtitle: e.target.value })}
                      style={{ width: '100%', minHeight: 60, fontSize: 12 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Tugma matni (CTA)</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={selectedBlock.ctaText || ''} 
                      onChange={e => updateBlockData({ ...selectedBlock, ctaText: e.target.value })}
                      style={{ width: '100%', fontSize: 12 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Banner rasmi (URL)</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={selectedBlock.img || ''} 
                      onChange={e => updateBlockData({ ...selectedBlock, img: e.target.value })}
                      style={{ width: '100%', fontSize: 12 }}
                    />
                  </div>
                </>
              )}

              {selectedBlock.type === 'about' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Bo'lim sarlavhasi</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={selectedBlock.title || ''} 
                      onChange={e => updateBlockData({ ...selectedBlock, title: e.target.value })}
                      style={{ width: '100%', fontSize: 12 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Biz haqimizda matni</label>
                    <textarea 
                      className="input" 
                      value={selectedBlock.text || ''} 
                      onChange={e => updateBlockData({ ...selectedBlock, text: e.target.value })}
                      style={{ width: '100%', minHeight: 100, fontSize: 12 }}
                    />
                  </div>
                </>
              )}

              {selectedBlock.type === 'catalog' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Katalog sarlavhasi</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={selectedBlock.title || ''} 
                      onChange={e => updateBlockData({ ...selectedBlock, title: e.target.value })}
                      style={{ width: '100%', fontSize: 12 }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(selectedBlock.items || []).map((item, idx) => (
                      <div key={item.id} style={{ background: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Tovarlar #{idx + 1}</span>
                          <button className="btn btn-ghost btn-xs" style={{ color: '#ef4444' }} onClick={() => {
                            const updatedItems = (selectedBlock.items || []).filter(i => i.id !== item.id)
                            updateBlockData({ ...selectedBlock, items: updatedItems })
                          }}><Trash2 size={10} /></button>
                        </div>
                        <input type="text" className="input" placeholder="Nomi" value={item.name} onChange={e => {
                          const updatedItems = [...(selectedBlock.items || [])]
                          updatedItems[idx].name = e.target.value
                          updateBlockData({ ...selectedBlock, items: updatedItems })
                        }} style={{ fontSize: 11, padding: 4 }} />
                        <input type="number" className="input" placeholder="Narxi (UZS)" value={item.price} onChange={e => {
                          const updatedItems = [...(selectedBlock.items || [])]
                          updatedItems[idx].price = parseInt(e.target.value) || 0
                          updateBlockData({ ...selectedBlock, items: updatedItems })
                        }} style={{ fontSize: 11, padding: 4 }} />
                        <input type="text" className="input" placeholder="Tavsif" value={item.desc} onChange={e => {
                          const updatedItems = [...(selectedBlock.items || [])]
                          updatedItems[idx].desc = e.target.value
                          updateBlockData({ ...selectedBlock, items: updatedItems })
                        }} style={{ fontSize: 11, padding: 4 }} />
                        <input type="text" className="input" placeholder="Rasm URL" value={item.img || ''} onChange={e => {
                          const updatedItems = [...(selectedBlock.items || [])]
                          updatedItems[idx].img = e.target.value
                          updateBlockData({ ...selectedBlock, items: updatedItems })
                        }} style={{ fontSize: 11, padding: 4 }} />
                      </div>
                    ))}
                    <button className="btn btn-ghost btn-xs" style={{ color: 'var(--accent-blue)' }} onClick={() => {
                      const newItem = { id: Date.now().toString(), name: 'Yangi mahsulot', price: 50000, desc: 'Ta\'rif...', img: '' }
                      updateBlockData({ ...selectedBlock, items: [...(selectedBlock.items || []), newItem] })
                    }}>+ Mahsulot qo'shish</button>
                  </div>
                </>
              )}

              {selectedBlock.type === 'blog' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Blog sarlavhasi</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={selectedBlock.title || ''} 
                      onChange={e => updateBlockData({ ...selectedBlock, title: e.target.value })}
                      style={{ width: '100%', fontSize: 12 }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(selectedBlock.posts || []).map((post, idx) => (
                      <div key={post.id} style={{ background: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Maqola #{idx + 1}</span>
                          <button className="btn btn-ghost btn-xs" style={{ color: '#ef4444' }} onClick={() => {
                            const updatedPosts = (selectedBlock.posts || []).filter(p => p.id !== post.id)
                            updateBlockData({ ...selectedBlock, posts: updatedPosts })
                          }}><Trash2 size={10} /></button>
                        </div>
                        <input type="text" className="input" placeholder="Mavzu" value={post.title} onChange={e => {
                          const updatedPosts = [...(selectedBlock.posts || [])]
                          updatedPosts[idx].title = e.target.value
                          updateBlockData({ ...selectedBlock, posts: updatedPosts })
                        }} style={{ fontSize: 11, padding: 4 }} />
                        <textarea className="input" placeholder="Matn" value={post.text} onChange={e => {
                          const updatedPosts = [...(selectedBlock.posts || [])]
                          updatedPosts[idx].text = e.target.value
                          updateBlockData({ ...selectedBlock, posts: updatedPosts })
                        }} style={{ fontSize: 11, padding: 4, minHeight: 40 }} />
                      </div>
                    ))}
                    <button className="btn btn-ghost btn-xs" style={{ color: 'var(--accent-blue)' }} onClick={() => {
                      const newPost = { id: Date.now().toString(), title: 'Yangi maqola sarlavhasi', text: 'Tafsilotlar...' }
                      updateBlockData({ ...selectedBlock, posts: [...(selectedBlock.posts || []), newPost] })
                    }}>+ Maqola qo'shish</button>
                  </div>
                </>
              )}

              {selectedBlock.type === 'contacts' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Kontakt sarlavhasi</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={selectedBlock.title || ''} 
                      onChange={e => updateBlockData({ ...selectedBlock, title: e.target.value })}
                      style={{ width: '100%', fontSize: 12 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Telefon raqami</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={selectedBlock.phone || ''} 
                      onChange={e => updateBlockData({ ...selectedBlock, phone: e.target.value })}
                      style={{ width: '100%', fontSize: 12 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Telegram nomi (@sizsiz)</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={selectedBlock.telegram || ''} 
                      onChange={e => updateBlockData({ ...selectedBlock, telegram: e.target.value })}
                      style={{ width: '100%', fontSize: 12 }}
                    />
                  </div>
                </>
              )}

              {selectedBlock.type === 'form' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Forma sarlavhasi</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={selectedBlock.title || ''} 
                      onChange={e => updateBlockData({ ...selectedBlock, title: e.target.value })}
                      style={{ width: '100%', fontSize: 12 }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Kiritish maydonlari:</span>
                    {(selectedBlock.fields || []).map((f, idx) => (
                      <div key={f.name} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <input type="text" className="input flex-1" value={f.label} onChange={e => {
                          const updated = [...(selectedBlock.fields || [])]
                          updated[idx].label = e.target.value
                          updateBlockData({ ...selectedBlock, fields: updated })
                        }} style={{ fontSize: 11, padding: 4 }} />
                        <select className="input" value={f.type} onChange={e => {
                          const updated = [...(selectedBlock.fields || [])]
                          updated[idx].type = e.target.value
                          updateBlockData({ ...selectedBlock, fields: updated })
                        }} style={{ fontSize: 11, padding: '4px 8px' }}>
                          <option value="text">Matn</option>
                          <option value="tel">Telefon</option>
                          <option value="number">Son</option>
                          <option value="textarea">Katta matn</option>
                        </select>
                        <button className="btn btn-ghost btn-xs" style={{ color: '#ef4444' }} onClick={() => {
                          const updated = (selectedBlock.fields || []).filter(item => item.name !== f.name)
                          updateBlockData({ ...selectedBlock, fields: updated })
                        }}><Trash2 size={10} /></button>
                      </div>
                    ))}
                    <button className="btn btn-ghost btn-xs" style={{ color: 'var(--accent-blue)' }} onClick={() => {
                      const name = 'field_' + Date.now().toString()
                      const newF = { name, label: 'Yangi maydon', type: 'text', required: true }
                      updateBlockData({ ...selectedBlock, fields: [...(selectedBlock.fields || []), newF] })
                    }}>+ Maydon qo'shish</button>
                  </div>
                </>
              )}

              {selectedBlock.type === 'loyalty' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Hamyon sarlavhasi</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={selectedBlock.title || ''} 
                      onChange={e => updateBlockData({ ...selectedBlock, title: e.target.value })}
                      style={{ width: '100%', fontSize: 12 }}
                    />
                  </div>
                </>
              )}

              {selectedBlock.type === 'voting' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Ovoz berish sarlavhasi</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={selectedBlock.title || ''} 
                      onChange={e => updateBlockData({ ...selectedBlock, title: e.target.value })}
                      style={{ width: '100%', fontSize: 12 }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Nomzodlar ro'yxati:</span>
                    {(selectedBlock.candidates || []).map((cand, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <input type="text" className="input flex-1" value={cand} onChange={e => {
                          const updated = [...(selectedBlock.candidates || [])]
                          updated[idx] = e.target.value
                          updateBlockData({ ...selectedBlock, candidates: updated })
                        }} style={{ fontSize: 11, padding: 4 }} />
                        <button className="btn btn-ghost btn-xs" style={{ color: '#ef4444' }} onClick={() => {
                          const updated = (selectedBlock.candidates || []).filter((_, cidx) => cidx !== idx)
                          updateBlockData({ ...selectedBlock, candidates: updated })
                        }}><Trash2 size={10} /></button>
                      </div>
                    ))}
                    <button className="btn btn-ghost btn-xs" style={{ color: 'var(--accent-blue)' }} onClick={() => {
                      updateBlockData({ ...selectedBlock, candidates: [...(selectedBlock.candidates || []), 'Yangi Nomzod'] })
                    }}>+ Nomzod qo'shish</button>
                  </div>
                </>
              )}

            </div>
          )}

        </div>
      </div>

      {/* Right panel: Real-time Live Preview Stack inside a premium CSS Smartphone shell */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '24px', 
        background: '#090d16', 
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 0)',
        backgroundSize: '24px 24px',
        overflowY: 'auto'
      }}>
        {/* The Smartphone Frame */}
        <div style={{
          position: 'relative',
          width: '360px',
          height: '740px',
          background: '#1e293b', 
          borderRadius: '44px',
          padding: '10px', 
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.1), 0 0 0 1px rgba(255,255,255,0.05)',
          display: 'flex',
          flexDirection: 'column',
          border: '1.5px solid rgba(255,255,255,0.08)'
        }}>
          
          {/* Top Notch (Dynamic Island) */}
          <div style={{
            position: 'absolute',
            top: '18px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100px',
            height: '22px',
            background: '#090d16',
            borderRadius: '11px',
            zIndex: 99,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1)'
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1c2230' }} />
            <div style={{ width: '24px', height: '3px', borderRadius: '1.5px', background: '#151b26' }} />
          </div>

          {/* Side Buttons (Volume / Power buttons) */}
          <div style={{ position: 'absolute', left: '-3px', top: '120px', width: '3px', height: '35px', background: '#334155', borderRadius: '3px 0 0 3px' }} />
          <div style={{ position: 'absolute', left: '-3px', top: '165px', width: '3px', height: '35px', background: '#334155', borderRadius: '3px 0 0 3px' }} />
          <div style={{ position: 'absolute', right: '-3px', top: '140px', width: '3px', height: '55px', background: '#334155', borderRadius: '0 3px 3px 0' }} />

          {/* Device Screen Area */}
          <div style={{
            flex: 1,
            borderRadius: '34px',
            overflow: 'hidden',
            background: config.theme === 'minimalist' ? '#f8fafc' : '#090d16',
            color: config.theme === 'minimalist' ? '#0f172a' : '#fff',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            border: '1px solid rgba(0,0,0,0.3)'
          }}>
            {/* Simulated Telegram WebApp Top Header */}
            <div style={{ 
              background: config.themeColor, 
              padding: '24px 16px 12px 16px', 
              textAlign: 'center', 
              color: '#fff',
              boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
              zIndex: 90
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, opacity: 0.8, marginBottom: 4, fontFamily: 'monospace' }}>
                <span>9:41</span>
                <span>📶 🔋</span>
              </div>
              <h4 style={{ margin: 0, fontSize: 13, fontWeight: 800 }}>Telegram Mini App</h4>
              <span style={{ fontSize: 9, opacity: 0.7, textDecoration: 'underline' }}>mazaika.pages.dev</span>
            </div>

            {/* Inner scroll viewport rendering dynamic block stack */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto',
              padding: '16px 12px 40px 12px',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              {config.blocks.map((block) => {
                const isActive = selectedBlockId === block.id;
                const blockStyle: React.CSSProperties = {
                  position: 'relative',
                  padding: '16px',
                  marginBottom: '20px',
                  borderRadius: '12px',
                  border: isActive ? '2px dashed var(--accent-blue)' : '1px solid rgba(255,255,255,0.03)',
                  background: config.theme === 'minimalist' 
                    ? (isActive ? '#eff6ff' : '#f1f5f9') 
                    : (isActive ? 'rgba(30,144,255,0.05)' : 'rgba(255,255,255,0.01)'),
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                };

                return (
                  <div 
                    key={block.id} 
                    style={blockStyle}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedBlockId(block.id)
                    }}
                  >
                    {isActive && (
                      <span style={{ position: 'absolute', top: -8, left: 8, background: 'var(--accent-blue)', color: '#fff', fontSize: 8, fontWeight: 700, padding: '1px 6px', borderRadius: 3 }}>
                        Tahrirlanmoqda
                      </span>
                    )}

                    {/* HERO block */}
                    {block.type === 'hero' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {block.img && (
                          <img 
                            src={block.img} 
                            alt="Banner" 
                            style={{ width: '100%', height: 110, borderRadius: 8, objectFit: 'cover' }}
                          />
                        )}
                        <div>
                          <h4 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 4px 0' }}>{block.title || 'Sarlavha'}</h4>
                          <p style={{ fontSize: 11, opacity: 0.8, margin: '0 0 10px 0', lineHeight: 1.4 }}>{block.subtitle || 'Tavsif...'}</p>
                          <button style={{ background: config.themeColor, color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                            {block.ctaText || 'CTA'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ABOUT block */}
                    {block.type === 'about' && (
                      <div>
                        <h5 style={{ fontSize: 13, fontWeight: 800, margin: '0 0 6px 0', color: config.themeColor }}>{block.title || 'Biz haqimizda'}</h5>
                        <p style={{ fontSize: 11, lineHeight: 1.5, opacity: 0.8, margin: 0 }}>{block.text || 'Matn...'}</p>
                      </div>
                    )}

                    {/* CATALOG block */}
                    {block.type === 'catalog' && (
                      <div>
                        <h5 style={{ fontSize: 13, fontWeight: 800, margin: '0 0 10px 0', color: config.themeColor, textAlign: 'center' }}>{block.title || 'Katalog'}</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {(block.items || []).map(item => (
                            <div key={item.id} style={{ background: config.theme === 'minimalist' ? '#fff' : '#111827', borderRadius: 8, padding: 10, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 10, alignItems: 'center' }}>
                              {item.img && <img src={item.img} alt={item.name} style={{ width: 45, height: 45, objectFit: 'cover', borderRadius: 6 }} />}
                              <div style={{ flex: 1 }}>
                                <h6 style={{ margin: '0 0 2px 0', fontSize: 12, fontWeight: 700 }}>{item.name}</h6>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                                  <span style={{ fontSize: 11, fontWeight: 800, color: config.themeColor }}>{item.price.toLocaleString()} UZS</span>
                                  <button style={{ background: 'none', border: `1px solid ${config.themeColor}`, color: config.themeColor, borderRadius: 4, padding: '2px 6px', fontSize: 9, fontWeight: 700 }}>
                                    Savatga
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* BLOG block */}
                    {block.type === 'blog' && (
                      <div>
                        <h5 style={{ fontSize: 13, fontWeight: 800, margin: '0 0 10px 0', color: config.themeColor }}>{block.title || 'Yangiliklar'}</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {(block.posts || []).map(post => (
                            <div key={post.id} style={{ padding: 10, borderLeft: `2.5px solid ${config.themeColor}`, background: 'rgba(255,255,255,0.02)' }}>
                              <h6 style={{ margin: '0 0 2px 0', fontSize: 12, fontWeight: 700 }}>{post.title}</h6>
                              <p style={{ margin: 0, fontSize: 10, opacity: 0.8 }}>{post.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CONTACTS block */}
                    {block.type === 'contacts' && (
                      <div style={{ textAlign: 'center' }}>
                        <h5 style={{ fontSize: 12, fontWeight: 800, margin: '0 0 8px 0', color: config.themeColor }}>{block.title || 'Kontaktlar'}</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11 }}>
                          <div>📞 Tel: <strong>{block.phone}</strong></div>
                          <div>✈ Telegram: <strong>@{block.telegram}</strong></div>
                        </div>
                      </div>
                    )}

                    {/* FORM block */}
                    {block.type === 'form' && (
                      <div>
                        <h5 style={{ fontSize: 13, fontWeight: 800, margin: '0 0 10px 0', color: config.themeColor }}>{block.title || 'Forma'}</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {(block.fields || []).map(f => (
                            <div key={f.name}>
                              <label style={{ display: 'block', fontSize: 10, marginBottom: 2 }}>{f.label}</label>
                              <input type={f.type} className="input" placeholder={f.label} disabled style={{ width: '100%', fontSize: 11, padding: 6 }} />
                            </div>
                          ))}
                          <button style={{ background: config.themeColor, color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, fontSize: 11, fontWeight: 700, marginTop: 4 }}>
                            Yuborish (Submit)
                          </button>
                        </div>
                      </div>
                    )}

                    {/* LOYALTY block */}
                    {block.type === 'loyalty' && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 10, background: 'rgba(16,217,116,0.1)', border: '1px solid #10d974', borderRadius: 8 }}>
                        <div>
                          <h6 style={{ margin: 0, fontSize: 12, color: '#10d974' }}>{block.title || 'Bonus balansingiz'}</h6>
                          <p style={{ margin: 0, fontSize: 9, opacity: 0.6 }}>Loyalty points</p>
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#10d974' }}>75,000 ball</span>
                      </div>
                    )}

                    {/* VOTING block */}
                    {block.type === 'voting' && (
                      <div>
                        <h5 style={{ fontSize: 13, fontWeight: 800, margin: '0 0 8px 0', color: config.themeColor }}>{block.title || 'Ovoz berish'}</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {(block.candidates || []).map((cand, cidx) => (
                            <label key={cidx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, background: 'rgba(255,255,255,0.02)', padding: '5px 10px', borderRadius: 5 }}>
                              <input type="radio" name={`vote_${block.id}`} disabled />
                              <span>{cand}</span>
                            </label>
                          ))}
                          <button style={{ background: config.themeColor, color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, fontSize: 11, fontWeight: 700, marginTop: 4 }}>
                            Ovoz berish
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}

              {config.blocks.length === 0 && (
                <div style={{ padding: 30, textAlign: 'center', opacity: 0.5, fontSize: 12 }}>
                  Sayt yoki Mini App bo'sh. Chap paneldan bloklar qo'shing.
                </div>
              )}
            </div>

            {/* Home indicator bar */}
            <div style={{
              position: 'absolute',
              bottom: '6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '110px',
              height: '4px',
              background: config.theme === 'minimalist' ? '#cbd5e1' : '#334155',
              borderRadius: '2px',
              zIndex: 99
            }} />

          </div>
        </div>
      </div>
    </div>
  )
}

