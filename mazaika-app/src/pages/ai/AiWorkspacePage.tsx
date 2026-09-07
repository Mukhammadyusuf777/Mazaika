import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  ArrowLeft, Sparkles, Send, Bot, Save, Globe, Menu, X, 
  Trash2, Paperclip, Zap, Code2, Check, 
  Copy, Smartphone, CheckCircle2,
  ShoppingBag, Plus, CreditCard, Cpu
} from 'lucide-react'
import { useChatStore } from '../../store/useChatStore'
import { useAuthStore } from '../../store/useAuthStore'
import { createBot, saveSiteConfig, getBotsByUser } from '../../api/firestore'
import './AiWorkspacePage.css'

const PRESET_TEMPLATES = [
  { id: 't1', emoji: '🛒', title: 'Mini App Do\'kon', prompt: 'Kiyim va aksessuarlar savdosi uchun to\'liq Telegram Mini App yarat: mahsulotlar katalogi, savat, Payme va Click to\'lovlari integratsiyasi bo\'lsin.' },
  { id: 't2', emoji: '🍕', title: 'Restoran & Yetkazish', prompt: 'Pitsariya va restoran uchun online taomlar menyusi, buyurtma savati, stol bron qilish va kuryer geolokatsiyasi botini yarat.' },
  { id: 't3', emoji: '🎓', title: 'IT & Fan Kurslari', prompt: 'Zamonaviy IT akademiyasi uchun kurslar ro\'yxati, videodarslar, o\'quvchi arizalari va avtomatik to\'lov tizimini yarat.' },
  { id: 't4', emoji: '🤖', title: '24/7 AI Konsultant', prompt: 'Mijozlarga 24/7 professional maslahat beruvchi, mahsulotlar bo\'yicha savollarga javob beruvchi aqlli AI bot va qo\'llab-quvvatlash Mini App yarat.' },
  { id: 't5', emoji: '💼', title: 'CRM & Lead Baza', prompt: 'Kompaniya xizmatlari uchun arizalar to\'plovchi, mijozlar telefon raqamini tasdiqlovchi va operatorlarga yuboruvchi CRM bot yarat.' }
]

export default function AiWorkspacePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const { chats, isLoading, sendMessage, activeConfig, setActiveConfig, clearMessages, projectId, setProjectId } = useChatStore()
  const messages = chats[projectId] || []
  const isGenerating = isLoading
  const activeProjectId = projectId

  const switchProject = (id: string, config: any) => {
    setProjectId(id)
    if (config !== null) setActiveConfig(config)
  }

  const [aiTargetEntity, setAiTargetEntity] = useState<'bot_and_mini_app' | 'site_only'>('bot_and_mini_app')
  const [promptInput, setPromptInput] = useState<string>((location.state as any)?.prompt || '')
  const [savingBot, setSavingBot] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [projects, setProjects] = useState<any[]>([])

  // Live Mini App Interactive state (cart, active tab)
  const [cartCount, setCartCount] = useState(0)
  const [cartTotal, setCartTotal] = useState(0)
  const [canvasViewMode, setCanvasViewMode] = useState<'miniapp' | 'flow' | 'code'>('miniapp')
  const [copiedCode, setCopiedCode] = useState(false)

  // Photo upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Show bot code panel
  const [showCodeEditor, setShowCodeEditor] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isGenerating])

  useEffect(() => {
    if (user) {
      getBotsByUser(user.id).then(setProjects).catch(console.error)
    }
  }, [user])

  const handleSelectProject = (proj: any) => {
    const siteConfig = localStorage.getItem(`mazaika_site_${proj.id}`)
    let config = { ...proj, target_entity: 'bot' }
    if (siteConfig) {
      try {
        const parsedSite = JSON.parse(siteConfig)
        config = { ...config, ...parsedSite, target_entity: 'bot_and_mini_app' }
      } catch {}
    }
    switchProject(proj.id, config)
    setDrawerOpen(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      const b64 = result.split(',')[1]
      setImageBase64(b64)
      setImageMimeType(file.type || 'image/jpeg')
      setImagePreview(result)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    setImageBase64(null)
  }

  const handleSendPrompt = async (textToUse?: string) => {
    const text = textToUse || promptInput
    if (!text.trim() || isGenerating) return
    if (!textToUse) setPromptInput('')

    const imgB64 = imageBase64 || undefined
    const imgMime = imageMimeType || undefined
    setImagePreview(null)
    setImageBase64(null)

    await sendMessage(text, 'FULL_GENERATION', aiTargetEntity, imgB64, imgMime)
  }

  const handleAddToCart = (price: number = 45000) => {
    setCartCount(prev => prev + 1)
    setCartTotal(prev => prev + price)
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleSaveProjectToBot = async () => {
    if (!user) {
      alert("Iltimos, avval tizimga kiring!")
      return
    }
    if (!activeConfig || (!activeConfig.blocks && !activeConfig.bot_blocks && !activeConfig.site_blocks && !activeConfig.source_code)) {
      alert("Avval AI orqali loyiha yarating!")
      return
    }

    setSavingBot(true)
    try {
      const isBot = activeConfig.target_entity === 'bot' || activeConfig.target_entity === 'bot_and_mini_app'
      const hasSite = activeConfig.target_entity === 'site' || activeConfig.target_entity === 'site_only' || activeConfig.target_entity === 'mini_app' || activeConfig.target_entity === 'bot_and_mini_app'
      const isStandaloneSite = activeConfig.target_entity === 'site' || activeConfig.target_entity === 'site_only'

      let customNodes: any[] = []
      let customEdges: any[] = []

      if (isBot) {
        let botBlocks = activeConfig.target_entity === 'bot_and_mini_app' || activeConfig.bot_blocks
          ? (activeConfig.bot_blocks || [])
          : (activeConfig.blocks || [])

        if (!Array.isArray(botBlocks)) botBlocks = []

        botBlocks.forEach((block: any, index: number) => {
          let nodeType = block.type || 'message'
          if (block.type === 'boshlash') nodeType = 'start'
          if (block.type === 'xabar') nodeType = 'message'
          if (block.type === 'matnli_savol') nodeType = 'question'
          if (block.type === 'shart') nodeType = 'condition'

          const col = index % 3
          const row = Math.floor(index / 3)
          const xPos = 100 + (col * 350)
          const yPos = 100 + (row * 200)

          const node: any = {
            id: block.id || `node-${index}`,
            type: nodeType,
            position: { x: xPos, y: yPos },
            data: {
              label: block.title || block.type,
              text: block.text || '',
              buttons: block.buttons || [],
              variable: block.variable || '',
              condition: block.condition || '',
            }
          }
          if (block.type === 'custom_code') {
            node.type = 'custom_code'
            node.data.code = block.code
          }
          customNodes.push(node)
        })

        botBlocks.forEach((block: any, index: number) => {
          let hasExplicitEdges = false
          if (block.true_node) {
            customEdges.push({ id: `e-${block.id}-true`, source: block.id, target: block.true_node, sourceHandle: 'true', type: 'buttonEdge', animated: true })
            hasExplicitEdges = true
          }
          if (block.false_node) {
            customEdges.push({ id: `e-${block.id}-false`, source: block.id, target: block.false_node, sourceHandle: 'false', type: 'buttonEdge', animated: true })
            hasExplicitEdges = true
          }
          if (block.next_node) {
            customEdges.push({ id: `e-${block.id}-next`, source: block.id, target: block.next_node, type: 'buttonEdge', animated: true })
            hasExplicitEdges = true
          }
          if (Array.isArray(block.buttons)) {
            block.buttons.forEach((btn: any, btnIdx: number) => {
              if (btn && typeof btn === 'object' && btn.target_node) {
                customEdges.push({ id: `e-${block.id}-btn${btnIdx}`, source: block.id, target: btn.target_node, sourceHandle: `btn_${btnIdx}`, type: 'buttonEdge', animated: true })
                hasExplicitEdges = true
              }
            })
          }
          if (!hasExplicitEdges && index < botBlocks.length - 1) {
            const nextBlock = botBlocks[index + 1]
            customEdges.push({
              id: `e-${block.id}-${nextBlock.id}`,
              source: block.id || `node-${index}`,
              target: nextBlock.id || `node-${index + 1}`,
              type: 'buttonEdge',
              animated: true
            })
          }
        })
      }

      const newBot = await createBot(user.id, {
        name: activeConfig.appName || 'Mazaika AI Loyiha',
        token: isStandaloneSite ? undefined : ('TEST_TOKEN_' + Date.now().toString().slice(-6)),
        creationType: (activeConfig.target_entity === 'bot') ? 'bot_only' : 'bot_and_webapp',
        projectType: isStandaloneSite ? 'site' : 'bot',
        customNodes,
        customEdges
      })

      if (hasSite) {
        const siteConfigToSave = activeConfig.target_entity === 'bot_and_mini_app'
          ? { ...activeConfig, blocks: activeConfig.site_blocks }
          : activeConfig
        await saveSiteConfig(newBot.id, siteConfigToSave)
      }

      useChatStore.getState().migrateHistory(projectId, newBot.id)

      if (isStandaloneSite) {
        navigate(`/bot/${newBot.id}/sitebuilder`)
      } else {
        navigate(`/bot/${newBot.id}/editor`)
      }
    } catch (e: any) {
      alert("Saqlashda xatolik yuz berdi: " + e.message)
    } finally {
      setSavingBot(false)
    }
  }

  // Render a block inside the preview phone
  const renderMiniAppBlock = (b: any, bIdx: number) => {
    return (
      <div key={b.id || bIdx} className="studio-canvas-block">
        {b.type === 'hero' && (
          <div className="studio-hero-block">
            {b.img && <img src={b.img} alt="" className="studio-hero-img" />}
            <h4 className="studio-hero-title">{b.title || 'Mazaika Mahsulotlari'}</h4>
            <p className="studio-hero-sub">{b.subtitle || 'Eng sara tovarlar va tezkor yetkazib berish xizmati'}</p>
            <button className="studio-hero-btn">{b.ctaText || "Xarid qilish →"}</button>
          </div>
        )}

        {b.type === 'catalog' && (
          <div className="studio-catalog-block">
            <h4 className="studio-catalog-heading">{b.title || 'Katalog & Tovarlar'}</h4>
            <div className="studio-products-grid">
              {(Array.isArray(b.items) && b.items.length > 0 ? b.items : [
                { id: '1', name: 'Premium Smart Watch v2', price: 340000, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80' },
                { id: '2', name: 'Simsiz Quloqchin Pro', price: 185000, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80' },
                { id: '3', name: 'Ergonomik Klaviatura', price: 290000, img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&q=80' }
              ]).map((item: any, idx: number) => (
                <div key={item.id || idx} className="studio-product-card">
                  {item.img && <img src={item.img} alt={item.name} className="studio-product-thumb" />}
                  <div className="studio-product-info">
                    <div className="studio-product-name">{item.name}</div>
                    <div className="studio-product-price">{(item.price || 45000).toLocaleString()} so'm</div>
                  </div>
                  <button 
                    className="studio-add-cart-btn"
                    onClick={() => handleAddToCart(item.price || 45000)}
                  >
                    + Savat
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {b.type === 'about' && (
          <div className="studio-about-block">
            <h4>{b.title || 'Biz haqimizda'}</h4>
            <p>{b.text || 'Mazaika AI orqali yaratilgan loyiha. Tezkor, ishonchli va xavfsiz xizmat ko\'rsatish.'}</p>
          </div>
        )}

        {b.type === 'form' && (
          <div className="studio-form-block">
            <h4>{b.title || 'Buyurtma berish / Bog\'lanish'}</h4>
            {(Array.isArray(b.fields) ? b.fields : [{ label: 'Ismingiz' }, { label: 'Telefon raqamingiz' }]).map((f: any, idx: number) => (
              <div key={idx} className="studio-form-field">
                <label>{f.label}</label>
                <input placeholder={f.placeholder || f.label} readOnly />
              </div>
            ))}
            <button className="studio-form-submit">Yuborish</button>
          </div>
        )}

        {b.type === 'message' && (
          <div className="studio-tg-msg-block">
            <div className="tg-msg-tag">💬 Telegram Xabari</div>
            <p>{b.text || 'Xush kelibsiz! Quyidagi tugmalardan birini tanlang:'}</p>
            {b.buttons && b.buttons.length > 0 && (
              <div className="studio-tg-buttons">
                {b.buttons.map((btn: any, bi: number) => (
                  <button key={bi}>{btn.text || btn}</button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="ai-workspace-cyber">
      {/* Projects Drawer */}
      {drawerOpen && (
        <div className="ai-drawer-backdrop" onClick={() => setDrawerOpen(false)}>
          <div className="ai-drawer-panel" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Mening Loyihalarim</h3>
              <button className="drawer-close-btn" onClick={() => setDrawerOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="drawer-list">
              <div 
                className="drawer-item new-draft"
                onClick={() => { switchProject('default', null); setDrawerOpen(false) }}
              >
                <Plus size={16} />
                <span>Yangi Loyiha (Qoralama)</span>
              </div>
              {projects.map(p => (
                <div 
                  key={p.id}
                  className={`drawer-item ${activeProjectId === p.id ? 'active' : ''}`}
                  onClick={() => handleSelectProject(p)}
                >
                  <Bot size={16} color="#00D9FF" />
                  <div className="drawer-item-info">
                    <span className="drawer-item-title">{p.name || 'Loyiha'}</span>
                    <span className="drawer-item-date">{new Date(p.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="ai-topbar-cyber">
        <div className="topbar-left">
          <button className="topbar-drawer-trigger" onClick={() => setDrawerOpen(true)} title="Loyihalar ro'yxati">
            <Menu size={18} />
          </button>
          
          <button className="topbar-back-btn" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} />
            <span className="topbar-back-text">Dashboard</span>
          </button>

          <div className="topbar-divider" />

          <div className="topbar-brand">
            <div className="brand-icon-box">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="brand-title">
                Mazaika AI Studio
                <span className="brand-model-pill">DeepSeek-R1</span>
              </div>
              <div className="brand-subtitle">Generativ AI Arxitektor va Kod Generator</div>
            </div>
          </div>
        </div>

        <div className="topbar-right">
          {/* Target Entity Switcher */}
          <div className="entity-switch-segmented">
            <button
              className={`entity-btn ${aiTargetEntity === 'bot_and_mini_app' ? 'active' : ''}`}
              onClick={() => setAiTargetEntity('bot_and_mini_app')}
            >
              <Bot size={14} />
              <span>Bot + Mini App</span>
            </button>
            <button
              className={`entity-btn ${aiTargetEntity === 'site_only' ? 'active' : ''}`}
              onClick={() => setAiTargetEntity('site_only')}
            >
              <Globe size={14} />
              <span>Sayt</span>
            </button>
          </div>

          {(activeConfig?.bot_code || activeConfig?.source_code) && (
            <button
              className={`topbar-code-toggle ${showCodeEditor ? 'active' : ''}`}
              onClick={() => setShowCodeEditor(prev => !prev)}
            >
              <Code2 size={15} />
              <span>Kod</span>
            </button>
          )}

          <button className="topbar-clear-btn" onClick={clearMessages} title="Chatni tozalash">
            <Trash2 size={15} />
            <span>Tozalash</span>
          </button>

          {activeConfig && (
            <button
              className="topbar-save-btn"
              onClick={handleSaveProjectToBot}
              disabled={savingBot}
            >
              <Save size={15} />
              <span>{savingBot ? "Saqlanmoqda..." : "Saqlash va Ochish"}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Split Screen Body */}
      <div className="ai-workspace-body-cyber">

        {/* Left: Chat & Prompt Panel */}
        <div className="ai-chat-panel-cyber">

          {/* Quick Preset Chips */}
          <div className="chat-presets-bar">
            {PRESET_TEMPLATES.map(tmpl => (
              <button
                key={tmpl.id}
                className="preset-chip-btn"
                onClick={() => handleSendPrompt(tmpl.prompt)}
              >
                <span>{tmpl.emoji}</span>
                <span>{tmpl.title}</span>
              </button>
            ))}
          </div>

          {/* Chat Messages Stream */}
          <div className="chat-messages-stream">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user'
              const timeString = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '00:00'
              
              return (
                <div key={msg.id} className={`chat-message-row ${isUser ? 'user' : 'ai'}`}>
                  {!isUser && (
                    <div className="ai-msg-avatar">
                      <Sparkles size={14} />
                    </div>
                  )}
                  
                  <div className={`chat-bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`}>
                    {msg.imageUrl && (
                      <div className="bubble-image-wrap">
                        <img src={msg.imageUrl} alt="attached visual" />
                      </div>
                    )}

                    <div className="bubble-text">{msg.text}</div>

                    {msg.projectData && (
                      <div className="bubble-project-card">
                        <div className="card-badge">
                          <CheckCircle2 size={13} color="#00F5C4" />
                          <span>Loyihangiz yaratildi: <strong>{msg.projectData.appName || 'Mazaika App'}</strong></span>
                        </div>
                        <div className="card-stats">
                          <span>• {msg.projectData.blocks?.length || msg.projectData.bot_blocks?.length || 4} ta blok</span>
                          <span>• Telegram Mini App tayyor</span>
                          <span>• Payme / Click ulangan</span>
                        </div>
                      </div>
                    )}

                    <div className="bubble-meta">
                      <span>{timeString}</span>
                      {isUser && <span className="tick-mark">✓✓</span>}
                    </div>
                  </div>
                </div>
              )
            })}

            {isGenerating && (
              <div className="chat-message-row ai">
                <div className="ai-msg-avatar pulsing">
                  <Sparkles size={14} />
                </div>
                <div className="chat-bubble ai-bubble generating">
                  <div className="typing-dots">
                    <span /><span /><span />
                  </div>
                  <span className="typing-text">Mazaika AI kod va arxitektura generatsiya qilmoqda...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Continuation Prompt Button */}
          {Boolean(activeConfig?.has_more) && !isGenerating && (
            <button
              className="continue-gen-btn"
              onClick={() => handleSendPrompt('Continue generation')}
            >
              <Zap size={15} />
              <span>Generatsiyani davom ettirish ⚡</span>
            </button>
          )}

          {/* Image Preview Bar */}
          {imagePreview && (
            <div className="chat-image-preview-bar">
              <img src={imagePreview} alt="upload preview" />
              <div className="image-info">
                <span>Rasm tahlil uchun yuklandi</span>
              </div>
              <button className="remove-img-btn" onClick={handleRemoveImage}>
                <X size={14} />
              </button>
            </div>
          )}

          {/* Input Dock */}
          <div className="chat-input-dock">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <button
              className={`dock-attach-btn ${imagePreview ? 'has-image' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              title="Rasm yuklash (AI Vision tahlil)"
            >
              <Paperclip size={16} />
            </button>

            <input
              id="ai-prompt-input"
              type="text"
              className="dock-text-input"
              placeholder={imagePreview ? "Rasm bo'yicha talablarni yozing..." : "Masalan: Toshkentda pitsa yetkazib beruvchi Mini App va bot yarat..."}
              value={promptInput}
              onChange={e => setPromptInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendPrompt()}
              disabled={isGenerating}
              autoFocus
            />

            <button
              className="dock-send-btn"
              onClick={() => handleSendPrompt()}
              disabled={isGenerating || (!promptInput.trim() && !imagePreview)}
            >
              <Send size={15} />
              <span>Yuborish ⚡</span>
            </button>
          </div>
        </div>

        {/* Right: Live Dynamic Canvas & Holographic Studio */}
        <div className="ai-canvas-panel-cyber">
          {/* Ambient Glowing Background Orbs */}
          <div className="canvas-orb cyan-orb" />
          <div className="canvas-orb violet-orb" />

          {activeConfig ? (
            <div className="studio-canvas-content">
              {/* Studio Canvas Control Bar */}
              <div className="studio-control-bar">
                <div className="studio-status-pill">
                  <span className="live-dot" />
                  <span>Jonli AI Dinamik Sinxronizatsiya</span>
                  <span className="sep">•</span>
                  <span className="app-name-tag">{activeConfig.appName || 'Mazaika Loyihasi'}</span>
                </div>

                <div className="studio-view-toggles">
                  <button 
                    className={`view-btn ${canvasViewMode === 'miniapp' ? 'active' : ''}`}
                    onClick={() => setCanvasViewMode('miniapp')}
                  >
                    <Smartphone size={14} />
                    <span>Telegram Mini App</span>
                  </button>
                  <button 
                    className={`view-btn ${canvasViewMode === 'flow' ? 'active' : ''}`}
                    onClick={() => setCanvasViewMode('flow')}
                  >
                    <Bot size={14} />
                    <span>Bot Flow</span>
                  </button>
                  <button 
                    className={`view-btn ${canvasViewMode === 'code' ? 'active' : ''}`}
                    onClick={() => setCanvasViewMode('code')}
                  >
                    <Code2 size={14} />
                    <span>Kod</span>
                  </button>
                </div>
              </div>

              {/* View 1: Telegram Mini App Viewport */}
              {canvasViewMode === 'miniapp' && (
                <div className="telegram-phone-viewport">
                  <div className="tg-phone-shell">
                    {/* Phone Status Bar */}
                    <div className="phone-hardware-notch">
                      <span>9:41</span>
                      <div className="notch-speaker" />
                      <div className="notch-icons">📶 🔋</div>
                    </div>

                    {/* Telegram Mini App Client Header */}
                    <div className="tg-client-header">
                      <button className="tg-close-btn">✕</button>
                      <div className="tg-bot-identity">
                        <div className="tg-bot-name">{activeConfig.appName || 'Mazaika Store'}</div>
                        <div className="tg-bot-handle">@mazaika_app_bot • bot</div>
                      </div>
                      <button className="tg-menu-dots">⋮</button>
                    </div>

                    {/* Phone Screen Scrollable Content */}
                    <div className="phone-screen-content">
                      {/* If HTML code was generated, render it cleanly inside iframe */}
                      {activeConfig.source_code ? (
                        <iframe 
                          srcDoc={activeConfig.source_code}
                          className="studio-live-iframe"
                          title="Telegram WebApp View"
                          sandbox="allow-scripts allow-same-origin"
                        />
                      ) : (
                        /* Otherwise render rich structured blocks */
                        <div className="phone-blocks-list">
                          {((activeConfig.site_blocks && activeConfig.site_blocks.length > 0) ? activeConfig.site_blocks : (activeConfig.blocks || [
                            { type: 'hero', title: activeConfig.appName || 'Mazaika Do\'koni', subtitle: 'Telegram ichidagi qulay vitrina va tezkor yetkazish', ctaText: 'Xarid qilish →', img: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=600&q=80' },
                            { type: 'catalog', title: 'Ommabop Mahsulotlar' },
                            { type: 'about', title: 'Bizning afzalliklarimiz', text: '100% original tovarlar, Toshkent bo\'ylab 2 soatda bepul yetkazib berish va Payme orqali xavfsiz to\'lov.' }
                          ])).map((b: any, bIdx: number) => renderMiniAppBlock(b, bIdx))}
                        </div>
                      )}

                      {/* Working Interactive Cart Footer inside Phone */}
                      <div className="phone-cart-sticky-bar">
                        <div className="cart-badge-info">
                          <ShoppingBag size={16} />
                          <span>{cartCount} ta mahsulot</span>
                        </div>
                        <div className="cart-checkout-btn">
                          <span>{cartTotal > 0 ? `${cartTotal.toLocaleString()} so'm` : "Buyurtma berish"} →</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* View 2: Bot Flow Preview */}
              {canvasViewMode === 'flow' && (
                <div className="studio-flow-viewport">
                  <div className="flow-cards-container">
                    <div className="flow-step-card start">
                      <div className="step-badge">1. Boshlash</div>
                      <div className="step-title">⚡ /start Trigger</div>
                      <p className="step-text">Foydalanuvchi botga kirganda avtomatik ishga tushadi va WebApp menyusini ochadi.</p>
                    </div>

                    <div className="flow-step-card message">
                      <div className="step-badge">2. Xush kelibsiz xabari</div>
                      <div className="step-title">💬 Telegram Xabar & Tugmalar</div>
                      <p className="step-text">"Assalomu alaykum! Do'konimizga xush kelibsiz. Mahsulotlarni ko'rish uchun pastdagi tugmani bosing."</p>
                      <div className="step-btn-pill">🛍 Mini App-ni ochish (WebApp)</div>
                    </div>

                    <div className="flow-step-card ai">
                      <div className="step-badge">3. Sun'iy Intellekt</div>
                      <div className="step-title">🤖 DeepSeek-R1 AI Mantiq</div>
                      <p className="step-text">Mijozning savollarini tahlil qiladi, tovarlar bo'yicha maslahat beradi va buyurtmani shakllantiradi.</p>
                    </div>

                    <div className="flow-step-card payment">
                      <div className="step-badge">4. To'lov</div>
                      <div className="step-title">💳 Payme & Click To'lov Tizimi</div>
                      <p className="step-text">Avtomatik hisob-faktura (invoice) generatsiyasi va muvaffaqiyatli to'lov xabarnomasi.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* View 3: Code Editor & Viewer */}
              {canvasViewMode === 'code' && (
                <div className="studio-code-viewport">
                  <div className="code-viewer-header">
                    <span className="code-file-tag">🤖 Telegram Bot Server Kodi (Node.js / Telegraf)</span>
                    <button 
                      className="code-copy-btn"
                      onClick={() => handleCopyCode(activeConfig.bot_code || '// Mazaika Bot Server Code\nconst { Telegraf } = require("telegraf");\nconst bot = new Telegraf(process.env.BOT_TOKEN);\n\nbot.start((ctx) => ctx.reply("Xush kelibsiz!"));\nbot.launch();')}
                    >
                      {copiedCode ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                      <span>{copiedCode ? "Nusxalandi!" : "Kodni nusxalash"}</span>
                    </button>
                  </div>
                  <pre className="code-viewer-pre">
                    <code>
                      {activeConfig.bot_code || `// =============================================
// MAZAIKA ENTERPRISE TELEGRAM BOT
// Generated with DeepSeek-R1 AI Engine
// =============================================

const { Telegraf, Markup } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  return ctx.reply(
    'Assalomu alaykum! Loyihangizga xush kelibsiz.',
    Markup.inlineKeyboard([
      [Markup.button.webApp('🛍 Mini App-ni ochish', process.env.WEBAPP_URL)],
      [Markup.button.callback('📞 Aloqa', 'contact_operator')]
    ])
  );
});

bot.action('contact_operator', (ctx) => {
  return ctx.reply('Operatorimiz tez orada siz bilan bog\\'lanadi.');
});

bot.launch();
console.log('Bot muvaffaqiyatli ishga tushdi!');`}
                    </code>
                  </pre>
                </div>
              )}
            </div>
          ) : (
            /* HOLOGRAPHIC STUDIO HUB (When empty - Solves Screenshot 2) */
            <div className="holographic-studio-hub">
              <div className="holo-centerpiece">
                <div className="holo-icon-badge">
                  <Cpu size={36} />
                </div>
                
                <h2 className="holo-title">Mazaika AI Arxitektura Studiyasi</h2>
                
                <p className="holo-subtitle">
                  Chatda o'z g'oyangizni bir jumlada yozing — DeepSeek-R1 bir zumda Telegram bot kodi, 
                  vizual Mini App interfeysi va to'lov integratsiyasini to'liq yaratadi.
                </p>

                {/* 4 Quick Starter Showcase Cards */}
                <div className="holo-starters-grid">
                  <div 
                    className="holo-starter-card"
                    onClick={() => handleSendPrompt(PRESET_TEMPLATES[0].prompt)}
                  >
                    <div className="card-top">
                      <span className="card-emoji">🛒</span>
                      <span className="card-tag">E-Commerce</span>
                    </div>
                    <div className="card-name">Mini App Do'kon</div>
                    <p className="card-desc">Telegram vitrina, tovarlar katalogi, savat va Payme/Click to'lovlari</p>
                    <div className="card-action">Bir klikda yaratish →</div>
                  </div>

                  <div 
                    className="holo-starter-card"
                    onClick={() => handleSendPrompt(PRESET_TEMPLATES[1].prompt)}
                  >
                    <div className="card-top">
                      <span className="card-emoji">🍕</span>
                      <span className="card-tag green">Yetkazish</span>
                    </div>
                    <div className="card-name">Restoran va Menyu</div>
                    <p className="card-desc">Taomlar menyusi, stol bron qilish, buyurtma qabul qilish va lokatsiya</p>
                    <div className="card-action">Bir klikda yaratish →</div>
                  </div>

                  <div 
                    className="holo-starter-card"
                    onClick={() => handleSendPrompt(PRESET_TEMPLATES[2].prompt)}
                  >
                    <div className="card-top">
                      <span className="card-emoji">🎓</span>
                      <span className="card-tag violet">Ta'lim</span>
                    </div>
                    <div className="card-name">IT & Fan Kurslari</div>
                    <p className="card-desc">Darslar katalogi, video darslar, to'lov va o'quvchi arizalari</p>
                    <div className="card-action">Bir klikda yaratish →</div>
                  </div>

                  <div 
                    className="holo-starter-card"
                    onClick={() => handleSendPrompt(PRESET_TEMPLATES[3].prompt)}
                  >
                    <div className="card-top">
                      <span className="card-emoji">🤖</span>
                      <span className="card-tag amber">AI LLM</span>
                    </div>
                    <div className="card-name">24/7 AI Maslahatchi</div>
                    <p className="card-desc">Mijozlar savollariga avtomatik aqlli javob beruvchi sun'iy intellekt agenti</p>
                    <div className="card-action">Bir klikda yaratish →</div>
                  </div>
                </div>

                <div className="holo-tips-row">
                  <div className="tip-item"><Sparkles size={14} color="#00D9FF" /> 1 daqiqada tayyor arxitektura</div>
                  <div className="tip-item"><Smartphone size={14} color="#00F5C4" /> Telegram WebApp SDK ulangan</div>
                  <div className="tip-item"><CreditCard size={14} color="#A78BFA" /> Payme va Click to'lovlari</div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
