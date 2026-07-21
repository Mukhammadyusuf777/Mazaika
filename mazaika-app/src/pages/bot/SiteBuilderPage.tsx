import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { 
  Globe, Save, Eye, Trash2, ArrowUp, ArrowDown, Settings,
  Layout, FileText, ShoppingBag, AlignLeft, MessageSquare, CheckSquare, Wallet,
  UserCheck, Laptop, Smartphone, Plus, Info, CheckCircle
} from 'lucide-react'

import { Reorder } from 'framer-motion'
import BuilderBlock from './BuilderBlock'
import { getSiteConfig, saveSiteConfig, updateBot } from '../../api/firestore'

export interface Block {
  id: string
  type: 'hero' | 'about' | 'catalog' | 'blog' | 'contacts' | 'form' | 'loyalty' | 'voting' | string
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
  styles?: {
    paddingTop?: number
    paddingBottom?: number
  }
}

interface SiteConfig {
  appName?: string
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
    title: 'Do\'kon / Katalog',
    items: [
      { id: 'item_1', name: 'VIP A\'zolar paketi', price: 99000, desc: 'Barcha imkoniyatlarga cheksiz kirish.', img: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=150' },
      { id: 'item_2', name: 'Konsultatsiya 1 soat', price: 150000, desc: 'Mutaxassis bilan yakkama-yakka suhbat.', img: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150' }
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
  appName: 'Mini App',
  theme: 'glassmorphism',
  themeColor: '#1e90ff',
  blocks: DEFAULT_BLOCKS
}

export default function SiteBuilderPage() {
  const { botId } = useParams<{ botId: string }>()
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>('1')
  
  // Google Sites layout states
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [activeTab, setActiveTab] = useState<'insert' | 'properties'>('insert')
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Interactive smartphone preview states
  const [previewCart, setPreviewCart] = useState<Array<{ id: string; name: string; price: number; qty: number }>>([])
  const [showPreviewOrderSheet, setShowPreviewOrderSheet] = useState(false)
  const [previewName, setPreviewName] = useState('')
  const [previewPhone, setPreviewPhone] = useState('')

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
      if (config.appName) {
        await updateBot(botId, { name: config.appName })
      }
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
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
          title: 'Yangi Banner',
          subtitle: 'Kompaniyangiz shiori yoki qisqacha ta\'rifi',
          ctaText: 'Batafsil',
          img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'
        }
        break
      case 'about':
        newBlock = {
          id,
          type,
          title: 'Biz haqimizda',
          text: 'Ushbu bo\'limda biznesingiz yoki xizmatlaringiz haqida batafsil ma\'lumot bering.'
        }
        break
      case 'catalog':
        newBlock = {
          id,
          type,
          title: 'Bizning Katalog',
          items: [
            { id: Date.now().toString() + '_1', name: 'Premium Xizmat', price: 150000, desc: 'Yuqori sifatli va tezkor xizmat', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=150' }
          ]
        }
        break
      case 'blog':
        newBlock = {
          id,
          type,
          title: 'Yangiliklar va Maqolalar',
          posts: [
            { id: Date.now().toString() + '_p1', title: 'IT sohasida yangiliklar', text: 'Mazaika platformasida yangi qulayliklar ishga tushdi.' }
          ]
        }
        break
      case 'contacts':
        newBlock = {
          id,
          type,
          title: 'Bog\'lanish',
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
          title: 'Sodiqlik Tizimi va Cashback'
        }
        break
      case 'voting':
        newBlock = {
          id,
          type,
          title: 'Hafta g\'olibini aniqlash',
          candidates: ['Nomzod A', 'Nomzod B']
        }
        break
    }

    const updatedBlocks = [...config.blocks, newBlock]
    setConfig({ ...config, blocks: updatedBlocks })
    setSelectedBlockId(id)
    setActiveTab('properties') // auto switch to properties when block added
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
    <div className="builder-container" style={{ background: '#090d16' }}>
      
      {/* 1. LEFT & CENTER AREA: Canvas and Layout Switcher */}
      <div className="builder-canvas-panel">
        
        {/* Top Control Bar */}
        <div className="builder-header">
          {/* Logo/Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Globe size={18} style={{ color: 'var(--accent-blue)' }} />
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '15px', color: '#fff', margin: 0 }}>Mazaika Builder</h3>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Site & Telegram Mini App constructor</span>
            </div>
          </div>

          {/* View Switcher Controls (Desktop / Mobile) */}
          <div className="builder-header-switcher">
            <button 
              onClick={() => setViewMode('desktop')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6, border: 'none',
                background: viewMode === 'desktop' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'desktop' ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.2s'
              }}
            >
              <Laptop size={14} /> Desktop (Veb-sayt)
            </button>
            <button 
              onClick={() => setViewMode('mobile')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6, border: 'none',
                background: viewMode === 'mobile' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'mobile' ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.2s'
              }}
            >
              <Smartphone size={14} /> Mobile (Mini App)
            </button>
          </div>

          {/* Save & Live Links */}
          <div className="builder-header-actions">
            {saveSuccess && (
              <span style={{ fontSize: 12, color: '#10d974', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={14} /> Saqlandi!
              </span>
            )}
            <button 
              className="btn btn-primary btn-sm" 
              onClick={handleSave} 
              disabled={isLoading}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Save size={14} /> {isLoading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
            <a 
              href={`/site/${botId}`} 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-ghost btn-sm" 
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Eye size={14} /> Saytni ochish
            </a>
          </div>
        </div>

        {/* Dynamic Canvas Workspace */}
        <div className="builder-canvas-workspace" style={{ alignItems: viewMode === 'mobile' ? 'center' : 'flex-start' }}>
          
          {/* DESKTOP CANVAS VIEW */}
          {viewMode === 'desktop' && (
            <div style={{ 
              width: '100%', 
              maxWidth: '900px', 
              background: config.theme === 'minimalist' ? '#ffffff' : 'rgba(30,41,59,0.4)',
              backdropFilter: config.theme === 'glassmorphism' ? 'blur(16px)' : 'none',
              borderRadius: '24px',
              border: config.theme === 'minimalist' ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              overflow: 'hidden',
              minHeight: '600px',
              color: config.theme === 'minimalist' ? '#0f172a' : '#fff'
            }}>
              
              {/* Simulated browser header */}
              <div style={{ 
                background: config.theme === 'minimalist' ? '#f1f5f9' : 'rgba(15,23,42,0.6)', 
                borderBottom: config.theme === 'minimalist' ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.08)',
                padding: '12px 20px', 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
                </div>
                <div style={{ 
                  background: config.theme === 'minimalist' ? '#e2e8f0' : 'rgba(0,0,0,0.2)', 
                  borderRadius: 6, 
                  fontSize: 11, 
                  padding: '4px 32px', 
                  color: 'var(--text-muted)' 
                }}>
                  {liveUrl}
                </div>
                <div style={{ width: 40 }} />
              </div>

              {/* Desktop Rendered Blocks Stack */}
              <div style={{ padding: '32px' }}>
                <Reorder.Group 
                  axis="y" 
                  values={config.blocks} 
                  onReorder={(newOrder) => setConfig({ ...config, blocks: newOrder })}
                  style={{ listStyle: 'none', padding: 0, margin: 0 }}
                >
                  {config.blocks.map((block) => (
                    <BuilderBlock
                      key={block.id}
                      block={block}
                      config={config}
                      isActive={selectedBlockId === block.id}
                      onClick={() => {
                        setSelectedBlockId(block.id)
                        setActiveTab('properties')
                      }}
                      onUpdateBlock={(updatedBlock) => {
                        const newBlocks = config.blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b)
                        setConfig({ ...config, blocks: newBlocks })
                      }}
                    />
                  ))}
                </Reorder.Group>

                {config.blocks.length === 0 && (
                  <div style={{ padding: '60px 0', textAlign: 'center', opacity: 0.5, fontSize: 14 }}>
                    Oyna bo'sh. O'ng paneldagi "Bloklar" yordamida yangi bloklar qo'shing.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* MOBILE PREVIEW VIEW (Smartphone Shell) */}
          {viewMode === 'mobile' && (
            <div className="builder-mobile-shell">
              {/* Dynamic Island */}
              <div style={{
                position: 'absolute', top: '18px', left: '50%', transform: 'translateX(-50%)',
                width: '100px', height: '22px', background: '#090d16', borderRadius: '11px', zIndex: 99,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1)'
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1c2230' }} />
                <div style={{ width: '24px', height: '3px', borderRadius: '1.5px', background: '#151b26' }} />
              </div>

              {/* Mobile Screen Viewport */}
              <div style={{
                flex: 1,
                borderRadius: '34px',
                overflow: 'hidden',
                background: config.theme === 'minimalist' ? '#f8fafc' : '#090d16',
                color: config.theme === 'minimalist' ? '#0f172a' : '#fff',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}>
                {/* Header inside WebApp */}
                <div style={{ 
                  background: config.themeColor, padding: '24px 16px 12px 16px', textAlign: 'center', color: '#fff', zIndex: 90
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, opacity: 0.8, marginBottom: 4, fontFamily: 'monospace' }}>
                    <span>9:41</span>
                    <span>📶 🔋</span>
                  </div>
                  <h4 style={{ margin: 0, fontSize: 13, fontWeight: 800 }}>Telegram Mini App</h4>
                  <span style={{ fontSize: 9, opacity: 0.7 }}>mazaika.pages.dev</span>
                </div>

                {/* Inner Scroll container */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px 60px 12px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  <Reorder.Group 
                    axis="y" 
                    values={config.blocks} 
                    onReorder={(newOrder) => setConfig({ ...config, blocks: newOrder })}
                    style={{ listStyle: 'none', padding: 0, margin: 0 }}
                  >
                    {config.blocks.map((block) => (
                      <BuilderBlock
                        key={block.id}
                        block={block}
                        config={config}
                        viewMode="mobile"
                        isActive={selectedBlockId === block.id}
                        onClick={() => {
                          setSelectedBlockId(block.id)
                          setActiveTab('properties')
                        }}
                        onUpdateBlock={(updatedBlock) => {
                          const newBlocks = config.blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b)
                          setConfig({ ...config, blocks: newBlocks })
                        }}
                      />
                    ))}
                  </Reorder.Group>
                </div>

                {/* Cart Bottom Sheet in Mobile Preview */}
                {previewCart.length > 0 && !showPreviewOrderSheet && (
                  <div style={{
                    position: 'absolute', bottom: 16, left: 12, right: 12, zIndex: 100,
                    background: 'rgba(30, 41, 59, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 12, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    boxShadow: '0 -10px 25px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)'
                  }}>
                    <div>
                      <span style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#fff' }}>🛒 Savatda: {previewCart.reduce((acc, i) => acc + i.qty, 0)} ta</span>
                      <span style={{ fontSize: 10, color: config.themeColor, fontWeight: 700 }}>
                        Jami: {previewCart.reduce((acc, i) => acc + (i.price * i.qty), 0).toLocaleString()} UZS
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewCart([]);
                        }}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '4px 8px', borderRadius: 6, fontSize: 10, cursor: 'pointer' }}
                      >
                        Tozalash
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPreviewOrderSheet(true);
                        }}
                        style={{ background: config.themeColor, color: '#fff', border: 'none', padding: '4px 12px', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                      >
                        Buyurtma
                      </button>
                    </div>
                  </div>
                )}

                {/* Checkout Modal in Mobile Preview */}
                {showPreviewOrderSheet && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 110,
                    background: 'rgba(15, 23, 42, 0.95)', padding: '24px 16px', display: 'flex', flexDirection: 'column',
                    color: '#fff', fontFamily: 'system-ui, sans-serif'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 800, margin: 0 }}>🛒 Buyurtmani Rasmiylashtirish</h4>
                      <button 
                        onClick={() => setShowPreviewOrderSheet(false)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}
                      >
                        Yopish
                      </button>
                    </div>

                    {/* Cart Summary */}
                    <div style={{ 
                      flex: 1, overflowY: 'auto', background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 10, marginBottom: 16,
                      display: 'flex', flexDirection: 'column', gap: 6
                    }}>
                      {previewCart.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 4 }}>
                          <span>{item.name} (x{item.qty})</span>
                          <span style={{ fontWeight: 700 }}>{(item.price * item.qty).toLocaleString()} UZS</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, marginTop: 'auto', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)', color: config.themeColor }}>
                        <span>Jami summasi:</span>
                        <span>{previewCart.reduce((acc, i) => acc + (i.price * i.qty), 0).toLocaleString()} UZS</span>
                      </div>
                    </div>

                    {/* Delivery details form */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>Ismingiz</label>
                        <input 
                          type="text" 
                          className="input" 
                          value={previewName} 
                          onChange={e => setPreviewName(e.target.value)} 
                          placeholder="Ismingizni kiriting"
                          style={{ width: '100%', padding: '6px 8px', fontSize: 11 }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>Telefon raqamingiz</label>
                        <input 
                          type="text" 
                          className="input" 
                          value={previewPhone} 
                          onChange={e => setPreviewPhone(e.target.value)} 
                          placeholder="+998 90 123 45 67"
                          style={{ width: '100%', padding: '6px 8px', fontSize: 11 }}
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        if (!previewName || !previewPhone) {
                          alert("Iltimos, ism va telefon raqamini kiriting!");
                          return;
                        }
                        const orderJSON = {
                          action: 'order',
                          items: previewCart.map(i => ({ name: i.name, price: i.price, qty: i.qty })),
                          total: previewCart.reduce((acc, i) => acc + (i.price * i.qty), 0),
                          customer: { name: previewName, phone: previewPhone }
                        };
                        
                        alert(
                          `🚀 [Mazaika WebApp] Buyurtma muvaffaqiyatli jo'natildi!\n\n` + 
                          `Bu ma'lumot botga quyidagi formatda uzatiladi:\n` +
                          `-----------------------------------\n` +
                          `🛍 Mahsulotlar: ${orderJSON.items.map(i => `${i.name} (x${i.qty})`).join(', ')}\n` +
                          `💰 Jami: ${orderJSON.total.toLocaleString()} UZS\n` +
                          `👤 Mijoz: ${orderJSON.customer.name}\n` +
                          `📞 Tel: ${orderJSON.customer.phone}\n` +
                          `-----------------------------------\n` +
                          `Telegram bot ushbu buyurtmani qabul qilib, foydalanuvchiga tasdiqlash xabari yuboradi va buyurtma Mazaika boshqaruv panelining "Chatlar" bo'limida zudlik bilan paydo bo'ladi!`
                        );

                        setPreviewCart([]);
                        setShowPreviewOrderSheet(false);
                      }}
                      style={{ 
                        background: '#10d974', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, 
                        fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                      }}
                    >
                      <CheckCircle size={14} /> Botga yuborish
                    </button>
                  </div>
                )}

                {/* Home Indicator */}
                <div style={{ position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)', width: '110px', height: '4px', background: '#334155', borderRadius: '2px' }} />
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 2. RIGHT SIDEBAR: Google Sites style Widget Drawer */}
      <div className="builder-settings-sidebar" style={{ 
        background: 'var(--bg-secondary)', 
        display: 'flex', 
        flexDirection: 'column'
      }}>
        
        {/* Tab Buttons (Вставка / Свойства) */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-primary)', flexShrink: 0 }}>
          <button 
            onClick={() => setActiveTab('insert')}
            style={{
              flex: 1, padding: '16px 0', border: 'none', background: 'transparent',
              borderBottom: activeTab === 'insert' ? `2px solid var(--accent-blue)` : '2px solid transparent',
              color: activeTab === 'insert' ? '#fff' : 'var(--text-muted)',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
            }}
          >
            <Plus size={16} /> Bloklar (Insert)
          </button>
          <button 
            onClick={() => setActiveTab('properties')}
            style={{
              flex: 1, padding: '16px 0', border: 'none', background: 'transparent',
              borderBottom: activeTab === 'properties' ? `2px solid var(--accent-blue)` : '2px solid transparent',
              color: activeTab === 'properties' ? '#fff' : 'var(--text-muted)',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
            }}
          >
            <Settings size={15} /> Sozlamalar (Properties)
          </button>
        </div>

        {/* Scrollable Panel Area (styled scrollbars automatically appear when needed) */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}>
          
          {/* TAB 1: INSERT BLOCKS */}
          {activeTab === 'insert' && (
            <>
              {/* Theme selection quick widget */}
              <div style={{ background: 'var(--bg-card)', padding: 14, borderRadius: 12, border: '1px solid var(--border-primary)' }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>MAVZU & SOZLAMA</h4>
                
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Mini App / Bot Nomi</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={config.appName || ''} 
                    onChange={e => setConfig({ ...config, appName: e.target.value })} 
                    placeholder="Masalan: Mazaika Store" 
                    style={{ width: '100%', fontSize: 12 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <select 
                      className="input" 
                      value={config.theme} 
                      onChange={e => setConfig({ ...config, theme: e.target.value })}
                      style={{ width: '100%', padding: '6px 10px', fontSize: 11 }}
                    >
                      <option value="glassmorphism">Glassmorphism</option>
                      <option value="minimalist">Minimalist Light</option>
                      <option value="neon">Neon Cyberpunk</option>
                    </select>
                  </div>
                  <input 
                    type="color" 
                    value={config.themeColor} 
                    onChange={e => setConfig({ ...config, themeColor: e.target.value })}
                    style={{ width: 36, height: 28, border: 'none', padding: 0, borderRadius: 6, cursor: 'pointer' }}
                  />
                </div>
              </div>

              {/* Grid of Addable Blocks */}
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase' }}>Blok qo'shish</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button onClick={() => addBlock('hero')} style={addWidgetBtnStyle}>
                    <Layout size={18} style={{ color: 'var(--accent-blue)' }} /> Banner (Hero)
                  </button>
                  <button onClick={() => addBlock('about')} style={addWidgetBtnStyle}>
                    <FileText size={18} style={{ color: 'var(--accent-aqua)' }} /> Biz haqimizda
                  </button>
                  <button onClick={() => addBlock('catalog')} style={addWidgetBtnStyle}>
                    <ShoppingBag size={18} style={{ color: '#fbbf24' }} /> Do'kon (Catalog)
                  </button>
                  <button onClick={() => addBlock('blog')} style={addWidgetBtnStyle}>
                    <AlignLeft size={18} style={{ color: '#ec4899' }} /> Yangiliklar (Blog)
                  </button>
                  <button onClick={() => addBlock('contacts')} style={addWidgetBtnStyle}>
                    <MessageSquare size={18} style={{ color: '#a855f7' }} /> Kontaktlar
                  </button>
                  <button onClick={() => addBlock('form')} style={addWidgetBtnStyle}>
                    <CheckSquare size={18} style={{ color: '#3b82f6' }} /> Forma (Form)
                  </button>
                  <button onClick={() => addBlock('loyalty')} style={addWidgetBtnStyle}>
                    <Wallet size={18} style={{ color: '#10d974' }} /> Cashback (Wallet)
                  </button>
                  <button onClick={() => addBlock('voting')} style={addWidgetBtnStyle}>
                    <UserCheck size={18} style={{ color: '#f43f5e' }} /> Ovoz berish
                  </button>
                </div>
              </div>

              {/* Re-order / Delete blocks */}
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase' }}>Bloklar tartibi ({config.blocks.length})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {config.blocks.map((block, idx) => (
                    <div 
                      key={block.id} 
                      onClick={() => {
                        setSelectedBlockId(block.id)
                        setActiveTab('properties')
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 12px', background: 'var(--bg-card)', borderRadius: 10,
                        border: selectedBlockId === block.id ? `1px solid var(--accent-blue)` : '1px solid var(--border-primary)',
                        cursor: 'pointer', fontSize: 12
                      }}
                    >
                      <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                        {idx + 1}. {block.type === 'hero' ? 'Banner' : block.type === 'about' ? 'Biz haqimizda' : block.type === 'catalog' ? 'Katalog' : block.type === 'blog' ? 'Yangiliklar' : block.type === 'contacts' ? 'Kontaktlar' : block.type === 'form' ? 'Forma' : block.type === 'loyalty' ? 'Hamyon' : 'Ovoz berish'}
                      </span>
                      <div style={{ display: 'flex', gap: 2 }} onClick={e => e.stopPropagation()}>
                        <button className="btn btn-ghost btn-xs btn-icon" onClick={() => moveBlock(idx, 'up')} disabled={idx === 0}><ArrowUp size={11} /></button>
                        <button className="btn btn-ghost btn-xs btn-icon" onClick={() => moveBlock(idx, 'down')} disabled={idx === config.blocks.length - 1}><ArrowDown size={11} /></button>
                        <button className="btn btn-ghost btn-xs btn-icon" style={{ color: '#ef4444' }} onClick={() => deleteBlock(block.id)}><Trash2 size={11} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: ACTIVE BLOCK PROPERTIES */}
          {activeTab === 'properties' && (
            <>
              {selectedBlock ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ borderBottom: '1px solid var(--border-primary)', paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Settings size={16} style={{ color: config.themeColor }} />
                    <div>
                      <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, textTransform: 'capitalize' }}>{selectedBlock.type === 'hero' ? 'Banner' : selectedBlock.type} sozlamalari</h4>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>ID: {selectedBlock.id}</span>
                    </div>
                  </div>

                  {/* HERO PROPERTIES */}
                  {selectedBlock.type === 'hero' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Sarlavha (Title)</label>
                        <input type="text" className="input" value={selectedBlock.title || ''} onChange={e => updateBlockData({ ...selectedBlock, title: e.target.value })} style={{ width: '100%', fontSize: 12 }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Sub-sarlavha (Subtitle)</label>
                        <textarea className="input" value={selectedBlock.subtitle || ''} onChange={e => updateBlockData({ ...selectedBlock, subtitle: e.target.value })} style={{ width: '100%', minHeight: 60, fontSize: 12 }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Banner rasmi (URL)</label>
                        <input type="url" className="input" value={selectedBlock.img || ''} onChange={e => updateBlockData({ ...selectedBlock, img: e.target.value })} style={{ width: '100%', fontSize: 12 }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Tugma matni (CTA Text)</label>
                        <input type="text" className="input" value={selectedBlock.ctaText || ''} onChange={e => updateBlockData({ ...selectedBlock, ctaText: e.target.value })} style={{ width: '100%', fontSize: 12 }} />
                      </div>
                    </>
                  )}

                  {/* ABOUT PROPERTIES */}
                  {selectedBlock.type === 'about' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Sarlavha</label>
                        <input type="text" className="input" value={selectedBlock.title || ''} onChange={e => updateBlockData({ ...selectedBlock, title: e.target.value })} style={{ width: '100%', fontSize: 12 }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Batafsil matn (Text)</label>
                        <textarea className="input" value={selectedBlock.text || ''} onChange={e => updateBlockData({ ...selectedBlock, text: e.target.value })} style={{ width: '100%', minHeight: 140, fontSize: 12 }} />
                      </div>
                    </>
                  )}

                  {/* CATALOG PROPERTIES */}
                  {selectedBlock.type === 'catalog' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Katalog sarlavhasi</label>
                        <input type="text" className="input" value={selectedBlock.title || ''} onChange={e => updateBlockData({ ...selectedBlock, title: e.target.value })} style={{ width: '100%', fontSize: 12 }} />
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>MAHSULOTLAR RO'YXATI</span>
                        {(selectedBlock.items || []).map((item, idx) => (
                          <div key={item.id} style={{ background: 'var(--bg-card)', padding: 10, borderRadius: 8, border: '1px solid var(--border-primary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Mahsulot #{idx + 1}</span>
                              <button className="btn btn-ghost btn-xs" style={{ color: '#ef4444' }} onClick={() => {
                                const updated = (selectedBlock.items || []).filter(i => i.id !== item.id)
                                updateBlockData({ ...selectedBlock, items: updated })
                              }}><Trash2 size={12} /></button>
                            </div>
                            <input type="text" className="input" placeholder="Nomi" value={item.name} onChange={e => {
                              const updated = [...(selectedBlock.items || [])]
                              updated[idx].name = e.target.value
                              updateBlockData({ ...selectedBlock, items: updated })
                            }} style={{ padding: '4px 8px', fontSize: 11 }} />
                            <input type="number" className="input" placeholder="Narxi (UZS)" value={item.price || ''} onChange={e => {
                              const updated = [...(selectedBlock.items || [])]
                              updated[idx].price = Number(e.target.value) || 0
                              updateBlockData({ ...selectedBlock, items: updated })
                            }} style={{ padding: '4px 8px', fontSize: 11 }} />
                            <input type="text" className="input" placeholder="Tavsif" value={item.desc} onChange={e => {
                              const updated = [...(selectedBlock.items || [])]
                              updated[idx].desc = e.target.value
                              updateBlockData({ ...selectedBlock, items: updated })
                            }} style={{ padding: '4px 8px', fontSize: 11 }} />
                            <input type="url" className="input" placeholder="Rasm havolasi (URL)" value={item.img || ''} onChange={e => {
                              const updated = [...(selectedBlock.items || [])]
                              updated[idx].img = e.target.value
                              updateBlockData({ ...selectedBlock, items: updated })
                            }} style={{ padding: '4px 8px', fontSize: 11 }} />
                          </div>
                        ))}
                        <button 
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            const newItem = { id: Date.now().toString(), name: 'Yangi mahsulot', price: 10000, desc: 'Tavsif', img: '' }
                            updateBlockData({ ...selectedBlock, items: [...(selectedBlock.items || []), newItem] })
                          }}
                          style={{ fontSize: 11 }}
                        >
                          + Mahsulot qo'shish
                        </button>
                      </div>
                    </>
                  )}

                  {/* FORM PROPERTIES */}
                  {selectedBlock.type === 'form' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Forma sarlavhasi</label>
                        <input type="text" className="input" value={selectedBlock.title || ''} onChange={e => updateBlockData({ ...selectedBlock, title: e.target.value })} style={{ width: '100%', fontSize: 12 }} />
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>SO'ROVNOMA MAYDONLARI</span>
                        {(selectedBlock.fields || []).map((f, idx) => (
                          <div key={idx} style={{ background: 'var(--bg-card)', padding: 10, borderRadius: 8, border: '1px solid var(--border-primary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Maydon #{idx + 1}</span>
                              <button className="btn btn-ghost btn-xs" style={{ color: '#ef4444' }} onClick={() => {
                                const updated = (selectedBlock.fields || []).filter((_, i) => i !== idx)
                                updateBlockData({ ...selectedBlock, fields: updated })
                              }}><Trash2 size={12} /></button>
                            </div>
                            <input type="text" className="input" placeholder="Maydon nomi" value={f.label} onChange={e => {
                              const updated = [...(selectedBlock.fields || [])]
                              updated[idx].label = e.target.value
                              updated[idx].name = e.target.value.toLowerCase().replace(/\s+/g, '_')
                              updateBlockData({ ...selectedBlock, fields: updated })
                            }} style={{ padding: '4px 8px', fontSize: 11 }} />
                            <select className="input" value={f.type} onChange={e => {
                              const updated = [...(selectedBlock.fields || [])]
                              updated[idx].type = e.target.value
                              updateBlockData({ ...selectedBlock, fields: updated })
                            }} style={{ padding: '4px 8px', fontSize: 11 }}>
                              <option value="text">Matn</option>
                              <option value="tel">Telefon</option>
                              <option value="number">Son</option>
                              <option value="textarea">Uzoq matn</option>
                            </select>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, cursor: 'pointer' }}>
                              <input type="checkbox" checked={f.required} onChange={e => {
                                const updated = [...(selectedBlock.fields || [])]
                                updated[idx].required = e.target.checked
                                updateBlockData({ ...selectedBlock, fields: updated })
                              }} />
                              To'ldirish majburiy (Required)
                            </label>
                          </div>
                        ))}
                        <button 
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            const newField = { name: 'field_' + Date.now(), label: 'Yangi maydon', type: 'text', required: true }
                            updateBlockData({ ...selectedBlock, fields: [...(selectedBlock.fields || []), newField] })
                          }}
                          style={{ fontSize: 11 }}
                        >
                          + Maydon qo'shish
                        </button>
                      </div>
                    </>
                  )}

                  {/* BLOG PROPERTIES */}
                  {selectedBlock.type === 'blog' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Blog sarlavhasi</label>
                        <input type="text" className="input" value={selectedBlock.title || ''} onChange={e => updateBlockData({ ...selectedBlock, title: e.target.value })} style={{ width: '100%', fontSize: 12 }} />
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>MAQOLALAR RO'YXATI</span>
                        {(selectedBlock.posts || []).map((post, idx) => (
                          <div key={post.id} style={{ background: 'var(--bg-card)', padding: 10, borderRadius: 8, border: '1px solid var(--border-primary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Post #{idx + 1}</span>
                              <button className="btn btn-ghost btn-xs" style={{ color: '#ef4444' }} onClick={() => {
                                const updated = (selectedBlock.posts || []).filter(p => p.id !== post.id)
                                updateBlockData({ ...selectedBlock, posts: updated })
                              }}><Trash2 size={12} /></button>
                            </div>
                            <input type="text" className="input" placeholder="Maqola sarlavhasi" value={post.title} onChange={e => {
                              const updated = [...(selectedBlock.posts || [])]
                              updated[idx].title = e.target.value
                              updateBlockData({ ...selectedBlock, posts: updated })
                            }} style={{ padding: '4px 8px', fontSize: 11 }} />
                            <textarea className="input" placeholder="Maqola matni" value={post.text} onChange={e => {
                              const updated = [...(selectedBlock.posts || [])]
                              updated[idx].text = e.target.value
                              updateBlockData({ ...selectedBlock, posts: updated })
                            }} style={{ padding: '4px 8px', fontSize: 11, minHeight: 60 }} />
                          </div>
                        ))}
                        <button 
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            const newPost = { id: Date.now().toString(), title: 'Yangi sarlavha', text: 'Tafsilotlar...' }
                            updateBlockData({ ...selectedBlock, posts: [...(selectedBlock.posts || []), newPost] })
                          }}
                          style={{ fontSize: 11 }}
                        >
                          + Maqola qo'shish
                        </button>
                      </div>
                    </>
                  )}

                  {/* CONTACTS PROPERTIES */}
                  {selectedBlock.type === 'contacts' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Sarlavha</label>
                        <input type="text" className="input" value={selectedBlock.title || ''} onChange={e => updateBlockData({ ...selectedBlock, title: e.target.value })} style={{ width: '100%', fontSize: 12 }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Telefon raqam</label>
                        <input type="text" className="input" value={selectedBlock.phone || ''} onChange={e => updateBlockData({ ...selectedBlock, phone: e.target.value })} style={{ width: '100%', fontSize: 12 }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Telegram username (@-siz)</label>
                        <input type="text" className="input" value={selectedBlock.telegram || ''} onChange={e => updateBlockData({ ...selectedBlock, telegram: e.target.value })} style={{ width: '100%', fontSize: 12 }} />
                      </div>
                    </>
                  )}

                  {/* VOTING PROPERTIES */}
                  {selectedBlock.type === 'voting' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Sarlavha</label>
                        <input type="text" className="input" value={selectedBlock.title || ''} onChange={e => updateBlockData({ ...selectedBlock, title: e.target.value })} style={{ width: '100%', fontSize: 12 }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>NOMZODLAR</span>
                        {(selectedBlock.candidates || []).map((cand, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input type="text" className="input" value={cand} onChange={e => {
                              const updated = [...(selectedBlock.candidates || [])]
                              updated[idx] = e.target.value
                              updateBlockData({ ...selectedBlock, candidates: updated })
                            }} style={{ flex: 1, padding: '4px 8px', fontSize: 11 }} />
                            <button className="btn btn-ghost btn-xs" style={{ color: '#ef4444' }} onClick={() => {
                              const updated = (selectedBlock.candidates || []).filter((_, i) => i !== idx)
                              updateBlockData({ ...selectedBlock, candidates: updated })
                            }}><Trash2 size={12} /></button>
                          </div>
                        ))}
                        <button 
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            updateBlockData({ ...selectedBlock, candidates: [...(selectedBlock.candidates || []), 'Yangi nomzod'] })
                          }}
                          style={{ fontSize: 11 }}
                        >
                          + Nomzod qo'shish
                        </button>
                      </div>
                    </>
                  )}

                  {/* LOYALTY PROPERTIES */}
                  {selectedBlock.type === 'loyalty' && (
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Sarlavha</label>
                      <input type="text" className="input" value={selectedBlock.title || ''} onChange={e => updateBlockData({ ...selectedBlock, title: e.target.value })} style={{ width: '100%', fontSize: 12 }} />
                      <div style={{ marginTop: 16, padding: 12, background: 'rgba(59,130,246,0.06)', borderRadius: 10, border: '1px solid rgba(59,130,246,0.15)', display: 'flex', gap: 8 }}>
                        <Info size={16} style={{ color: '#3b82f6', flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          Loyalty (Keshbek) bloki foydalanuvchilarning botdagi virtual balansini real vaqt rejimida avtomatlashtirilgan tarzda ko'rsatib turadi. Sozlama talab qilinmaydi.
                        </span>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
                  <Settings size={32} style={{ opacity: 0.2, marginBottom: 12 }} />
                  <p style={{ fontSize: 13 }}>Sozlash uchun chap tomondagi canvasdan yoki "Bloklar" ro'yxatidan biror blokni tanlang.</p>
                </div>
              )}
            </>
          )}

        </div>
      </div>

    </div>
  )
}

const addWidgetBtnStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '16px 12px',
  background: 'var(--bg-card)',
  border: '1px solid var(--border-primary)',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '11px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s',
  textAlign: 'center',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)'
}
