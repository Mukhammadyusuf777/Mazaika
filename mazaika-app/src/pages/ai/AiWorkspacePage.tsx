import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, Send, Bot, Save, Globe, Menu, X, MessageSquare, Trash2, Paperclip, Zap, Code2 } from 'lucide-react'
import { useAICopilot } from '../../context/AICopilotContext'
import { useAuthStore } from '../../store/useAuthStore'
import { createBot, saveSiteConfig, getBotsByUser } from '../../api/firestore'
import './AiWorkspacePage.css'

const PRESET_TEMPLATES = [
  { id: 't1', title: '🚗 Avto Ehtiyot Qismlar', prompt: 'Avto-magazin va STO servisiga yozilish uchun Mini App va bot yarat. To\'liq ekosistem kerak.' },
  { id: 't2', title: '🍕 Issiq Pitsa Yetkazish', prompt: 'Pitsariya uchun online menyu, korzina, keshbek tizimi va yetkazib berish botini yarat. Bot + Mini App + sayt kerak.' },
  { id: 't3', title: '🎓 IT Akademiya', prompt: 'IT akademiyasi uchun kurslar katalogi, ariza shakli va to\'lov tizimi bilan bot va Mini App yarat.' },
  { id: 't4', title: '🏪 Internet Do\'kon', prompt: 'Internet do\'kon uchun to\'liq ekosistem yarat: Telegram bot buyurtma qabul qilsin, Mini App katalog ko\'rsatsin, landing page vitrina bo\'lsin.' }
]

const renderCanvasBlock = (b: any, bIdx: number, activeConfig: any, onEditClick?: (b: any) => void) => {
  return (
    <div
      key={b.id || bIdx}
      className="canvas-block-wrapper"
      style={{
        position: 'relative',
        animationDelay: `${bIdx * 0.15}s`,
        marginBottom: 16,
        padding: 12,
        borderRadius: 12,
        background: activeConfig.theme === 'minimalist' ? '#fff' : 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)'
      }}
    >
      {onEditClick && (
        <button
          onClick={() => onEditClick(b)}
          title="AI bilan tahrirlash"
          style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(16, 217, 116, 0.15)', border: 'none', color: '#10d974', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Sparkles size={14} />
        </button>
      )}
      {b.type === 'hero' && (
        <div>
          {b.img && <img src={b.img} alt="" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />}
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>{b.title}</h4>
          <p style={{ fontSize: 11, color: activeConfig.theme === 'minimalist' ? '#64748b' : '#94a3b8', margin: '4px 0 8px 0' }}>{b.subtitle}</p>
          <button style={{ background: activeConfig.themeColor || '#1e90ff', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{b.ctaText || 'Batafsil'}</button>
        </div>
      )}

      {b.type === 'about' && (
        <div>
          <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{b.title}</h4>
          <p style={{ fontSize: 11, color: activeConfig.theme === 'minimalist' ? '#64748b' : '#94a3b8', margin: '4px 0 0 0' }}>{b.text}</p>
        </div>
      )}

      {b.type === 'catalog' && (
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: 13, fontWeight: 700 }}>{b.title}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(Array.isArray(b.items) ? b.items : []).map((item: any, iIdx: number) => (
              <div key={item.id || iIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 6, borderRadius: 6, background: 'rgba(255,255,255,0.02)' }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, display: 'block' }}>{item.name}</span>
                  <span style={{ fontSize: 10, color: activeConfig.themeColor || '#1e90ff' }}>{item.price?.toLocaleString()} so'm</span>
                </div>
                <button style={{ background: 'rgba(30,144,255,0.1)', border: '1px solid #1e90ff', color: '#1e90ff', borderRadius: 4, padding: '2px 8px', fontSize: 10 }}>+ Savat</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {b.type === 'form' && (
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: 13, fontWeight: 700 }}>{b.title}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(Array.isArray(b.fields) ? b.fields : []).map((f: any, idx: number) => (
              <div key={idx}>
                <label style={{ display: 'block', fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>{f.label}</label>
                <input style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 8px', color: '#fff', fontSize: 11 }} placeholder={f.placeholder} readOnly />
              </div>
            ))}
          </div>
        </div>
      )}

      {b.type === 'message' && (
        <div style={{ padding: '8px 12px', background: 'rgba(30,144,255,0.08)', borderRadius: 10, borderLeft: `3px solid ${activeConfig.themeColor || '#1e90ff'}` }}>
          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>💬 Bot xabari</div>
          <p style={{ margin: 0, fontSize: 12 }}>{b.text}</p>
          {b.buttons && b.buttons.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
              {b.buttons.map((btn: any, bi: number) => (
                <button key={bi} style={{ background: activeConfig.themeColor || '#1e90ff', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 10, fontWeight: 700 }}>
                  {btn.text || btn}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {b.type === 'start' && (
        <div style={{ padding: '8px 12px', background: 'rgba(16,217,116,0.08)', borderRadius: 10, borderLeft: '3px solid #10d974' }}>
          <div style={{ fontSize: 10, color: '#10d974', marginBottom: 4, fontWeight: 700 }}>🚀 /start</div>
          <p style={{ margin: 0, fontSize: 12 }}>{b.text}</p>
        </div>
      )}

      {(b.type === 'question' || b.type === 'input') && (
        <div style={{ padding: '8px 12px', background: 'rgba(251,191,36,0.08)', borderRadius: 10, borderLeft: '3px solid #fbbf24' }}>
          <div style={{ fontSize: 10, color: '#fbbf24', marginBottom: 4 }}>❓ Savol</div>
          <p style={{ margin: 0, fontSize: 12 }}>{b.text}</p>
        </div>
      )}

      {b.type === 'custom_code' && (
        <div style={{ padding: '8px 12px', background: 'rgba(168,85,247,0.08)', borderRadius: 10, borderLeft: '3px solid #a855f7' }}>
          <div style={{ fontSize: 10, color: '#a855f7', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><Code2 size={10} /> Custom Kod</div>
          <pre style={{ margin: 0, fontSize: 10, color: '#d4d4d4', overflow: 'auto', maxHeight: 80 }}>{b.code?.slice(0, 200)}{b.code?.length > 200 ? '...' : ''}</pre>
        </div>
      )}

      {b.type === 'custom_html' && (
        <div style={{ padding: '8px 12px', background: 'rgba(251,191,36,0.08)', borderRadius: 10, borderLeft: '3px solid #fbbf24', marginTop: 8 }}>
          <div style={{ fontSize: 10, color: '#fbbf24', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>📱 Mini App / Web View</div>
          <div
            style={{ 
              borderRadius: 8, 
              overflow: 'hidden', 
              background: '#fff', 
              border: '1px solid rgba(255,255,255,0.1)',
              position: 'relative'
            }}
          >
            <iframe
              srcDoc={b.html || b.code || '<div>Bo\'sh HTML</div>'}
              style={{ width: '100%', height: 200, border: 'none' }}
              sandbox="allow-scripts allow-same-origin"
              title="Mini App View"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function AiWorkspacePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { messages, isGenerating, sendMessage, activeConfig, setActiveConfig, clearChat, activeProjectId, switchProject } = useAICopilot()

  const [aiTargetEntity, setAiTargetEntity] = useState<'bot_and_mini_app' | 'site_only'>('bot_and_mini_app')
  const [promptInput, setPromptInput] = useState('')
  const [savingBot, setSavingBot] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [projects, setProjects] = useState<any[]>([])

  // Photo upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Show bot code panel
  const [showCodeEditor, setShowCodeEditor] = useState(false)

  const handleEditBlockClick = (b: any) => {
    setPromptInput(`Ushbu blokni o'zgartiring (ID: ${b.id}, Tip: ${b.type}): `)
    setTimeout(() => {
      const inputEl = document.getElementById('ai-prompt-input')
      if (inputEl) inputEl.focus()
    }, 50)
  }

  useEffect(() => {
    if (user) {
      getBotsByUser(user.id).then(setProjects)
    }
  }, [user])

  const handleSelectProject = (proj: any) => {
    const siteConfig = localStorage.getItem(`mazaika_site_${proj.id}`)
    let config = { ...proj, target_entity: 'bot' }
    if (siteConfig) {
      const parsedSite = JSON.parse(siteConfig)
      config = { ...config, ...parsedSite, target_entity: 'bot_and_mini_app' }
    }
    switchProject(proj.id, config)
    setDrawerOpen(false)
  }

  const messagesEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle photo upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      // result is "data:image/jpeg;base64,..."
      const b64 = result.split(',')[1]
      setImageBase64(b64)
      setImageMimeType(file.type || 'image/jpeg')
      setImagePreview(result)
    }
    reader.readAsDataURL(file)
    // Reset input so same file can be selected again
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
    // Clear image after sending
    setImagePreview(null)
    setImageBase64(null)

    await sendMessage(text, 'FULL_GENERATION', aiTargetEntity, imgB64, imgMime)
  }

  const handleSaveProjectToBot = async () => {
    if (!user) {
      alert("Iltimos, avval tizimga kiring!")
      return
    }
    if (!activeConfig || (!activeConfig.blocks && !activeConfig.bot_blocks && !activeConfig.site_blocks)) {
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
        name: activeConfig.appName || 'AI Generated Project',
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

      alert(`🎉 "${activeConfig.appName || 'AI Loyiha'}" muvaffaqiyatli saqlandi!`)

      if (activeConfig.target_entity === 'bot') {
        navigate(`/bot/${newBot.id}/editor`)
      } else if (activeConfig.target_entity === 'bot_and_mini_app') {
        navigate(`/bot/${newBot.id}/editor`)
      } else {
        navigate(`/bot/${newBot.id}/sitebuilder`)
      }
    } catch (e: any) {
      alert("Saqlashda xatolik yuz berdi: " + e.message)
    } finally {
      setSavingBot(false)
    }
  }

  return (
    <div className="ai-workspace-container">

      {/* Projects Drawer */}
      {drawerOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: 300, height: '100vh',
          background: '#090d16', borderRight: '1px solid rgba(255,255,255,0.1)',
          zIndex: 9999, display: 'flex', flexDirection: 'column',
          boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
          animation: 'slideInLeft 0.3s ease'
        }}>
          <div style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>Mening Loyihalarim</h3>
            <button className="btn btn-ghost" style={{ padding: 4 }} onClick={() => setDrawerOpen(false)}><X size={20} /></button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            <div
              style={{ padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.05)', cursor: 'pointer', marginBottom: 8, border: '1px dashed rgba(255,255,255,0.2)' }}
              onClick={() => { switchProject('default', null); setDrawerOpen(false) }}
            >
              <div style={{ fontSize: 13, fontWeight: 700 }}>+ Yangi Loyiha (Qoralama)</div>
            </div>
            {projects.map(p => (
              <div
                key={p.id}
                style={{ padding: 12, borderRadius: 8, background: activeProjectId === p.id ? 'rgba(30,144,255,0.1)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, border: activeProjectId === p.id ? '1px solid rgba(30,144,255,0.3)' : '1px solid transparent' }}
                onClick={() => handleSelectProject(p)}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={16} color="#10d974" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name || 'Loyiha'}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{new Date(p.createdAt?.seconds * 1000).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="ai-workspace-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setDrawerOpen(true)} style={{ padding: '6px 8px' }}>
            <Menu size={20} />
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')} style={{ gap: 6 }}>
            <ArrowLeft size={16} /> <span className="topbar-back-label">Dashboard</span>
          </button>

          <div style={{ height: 24, width: 1, background: 'rgba(255,255,255,0.1)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 6, borderRadius: 8, background: 'linear-gradient(135deg, #1e90ff, #a855f7)', color: '#fff' }}>
              <Sparkles size={16} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                Mazaika AI
                {activeProjectId === 'default' && (
                  <span style={{ marginLeft: 8, background: '#1e293b', padding: '2px 6px', borderRadius: 4, fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>
                    Qoralama
                  </span>
                )}
              </h3>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Generativ AI Arxitektor</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 3 }}>
            <button
              className={`btn btn-sm ${aiTargetEntity === 'bot_and_mini_app' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setAiTargetEntity('bot_and_mini_app')}
              style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, minHeight: 28 }}
            >
              🤖 Bot & Mini App
            </button>
            <button
              className={`btn btn-sm ${aiTargetEntity === 'site_only' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setAiTargetEntity('site_only')}
              style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, minHeight: 28 }}
            >
              🌐 Sayt
            </button>
          </div>

          {(activeConfig?.bot_code || activeConfig?.source_code) && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowCodeEditor(prev => !prev)}
              style={{ gap: 4, fontSize: 11, color: '#a855f7' }}
            >
              <Code2 size={14} /> Kod muharriri
            </button>
          )}

          <button
            className="btn btn-ghost btn-sm"
            onClick={clearChat}
            style={{ gap: 4, color: '#ef4444', fontSize: 12, padding: '6px 10px' }}
          >
            <Trash2 size={14} /> Tozalash
          </button>
          {activeConfig && (
            <button
              className="btn btn-primary"
              onClick={handleSaveProjectToBot}
              disabled={savingBot}
              style={{ gap: 6, background: 'linear-gradient(135deg, #10d974, #00f5c4)', color: '#090d16', fontWeight: 700, fontSize: 12 }}
            >
              <Save size={14} /> {savingBot ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          )}
        </div>
      </header>

      {/* Main Split Screen Body */}
      <div className="ai-workspace-body">

        {/* Left Chat Panel */}
        <div className="ai-chat-panel">

          {/* Preset Cards */}
          <div className="ai-template-cards">
            {PRESET_TEMPLATES.map(tmpl => (
              <div
                key={tmpl.id}
                className="ai-template-card"
                onClick={() => handleSendPrompt(tmpl.prompt)}
              >
                <span style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 4 }}>{tmpl.title}</span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Bosing</span>
              </div>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="agent-messages-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, padding: '16px 20px', overflowY: 'auto' }}>
            {messages.map((msg) => {
              const isUser = msg.sender === 'user'
              const timeString = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '00:00'
              
              return (
                <div key={msg.id} className={`tg-msg-row ${isUser ? 'user-row' : 'bot-row'}`}>
                  {!isUser && <div className="tg-avatar">🛒</div>}
                  <div className={`tg-bubble ${isUser ? 'user' : 'bot'}`}>
                    
                    {/* Image preview in message */}
                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt="uploaded"
                        style={{ width: '100%', maxWidth: 200, borderRadius: 8, marginBottom: 8, display: 'block' }}
                      />
                    )}
                    
                    {/* Message text */}
                    {msg.text}
                    
                    {/* Project Data block */}
                    {msg.projectData && (
                      <div style={{ marginTop: 8, padding: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', fontSize: 12 }}>
                        <span style={{ fontWeight: 700, color: '#00f5d4' }}>🚀 Generatsiya yakunlandi:</span> {msg.projectData.appName || msg.projectData.ecosystem?.name}
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                          {msg.projectData.target_entity === 'ecosystem' ? (
                            <>• Ekosistem: {msg.projectData.ecosystem?.components?.length || 0} komponent</>
                          ) : (
                            <>• Bloklar: {msg.projectData.blocks?.length || msg.projectData.bot_blocks?.length || 0}</>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Telegram Timestamp & Read Receipt */}
                    <div className="tg-meta">
                      <span>{timeString}</span>
                      {isUser && <span className="tg-tick" style={{ color: '#4fc3f7' }}>✓✓</span>}
                    </div>
                  </div>
                </div>
              )
            })}
            
            {isGenerating && (
              <div className="tg-msg-row bot-row">
                <div className="tg-avatar" style={{opacity: 0.6}}>🛒</div>
                <div className="hero-mockup-typing" style={{ background: '#182533', padding: '10px 14px', borderRadius: '4px 12px 12px 12px' }}>
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Image Preview Bar */}
          {imagePreview && (
            <div style={{
              padding: '8px 12px',
              background: 'rgba(30,144,255,0.08)',
              borderTop: '1px solid rgba(30,144,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <img src={imagePreview} alt="preview" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>Rasm yuborilishga tayyor</div>
              </div>
              <button
                onClick={handleRemoveImage}
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Input Bar */}
          <div className="agent-input-container">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {/* Photo attach button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Rasm yuklash"
              style={{
                background: imagePreview ? 'rgba(30,144,255,0.2)' : 'rgba(255,255,255,0.05)',
                border: imagePreview ? '1px solid rgba(30,144,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
                color: imagePreview ? '#1e90ff' : '#94a3b8',
                borderRadius: 10,
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.2s'
              }}
            >
              <Paperclip size={16} />
            </button>
            <input
              id="ai-prompt-input"
              type="text"
              className="agent-input"
              placeholder={imagePreview ? "Rasm haqida yozing yoki shunchaki yuboring..." : "Bot, Mini App yoki Sayt yaratish uchun yozing..."}
              value={promptInput}
              onChange={e => setPromptInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendPrompt()}
              disabled={isGenerating}
            />
            <button
              className="btn btn-primary"
              onClick={() => handleSendPrompt()}
              disabled={isGenerating || (!promptInput.trim() && !imagePreview)}
              style={{ gap: 6, flexShrink: 0 }}
            >
              <Send size={16} /> <span className="send-label">Yuborish</span>
            </button>
          </div>
        </div>

        {/* Right Live Preview Panel */}
        <div className="ai-preview-panel" style={{ padding: 16 }}>
          {activeConfig ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, height: '100%', width: '100%' }}>

              {/* Universal Code Editor Panel (shown when toggled) */}
              {showCodeEditor && (activeConfig.bot_code || activeConfig.source_code) && (
                <div style={{
                  width: '100%',
                  background: '#0d1117',
                  border: '1px solid rgba(168,85,247,0.3)',
                  borderRadius: 12,
                  padding: 16,
                  height: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  zIndex: 10
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#a855f7', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Code2 size={16} /> Kod Muharriri
                    </span>
                    <button
                      onClick={() => setShowCodeEditor(false)}
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      Yopish
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 16, flex: 1, overflow: 'hidden' }}>
                    {activeConfig.bot_code && (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>🤖 Bot Node.js Kodi</span>
                        <textarea 
                          value={activeConfig.bot_code}
                          onChange={(e) => setActiveConfig((prev: any) => ({ ...prev, bot_code: e.target.value }))}
                          style={{ flex: 1, background: '#050505', color: '#10d974', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 12, fontFamily: 'monospace', fontSize: 11, resize: 'none', outline: 'none' }}
                          spellCheck={false}
                        />
                      </div>
                    )}
                    
                    {activeConfig.source_code && (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>🌐 Veb/Mini App (HTML/CSS/JS)</span>
                        <textarea 
                          value={activeConfig.source_code}
                          onChange={(e) => setActiveConfig((prev: any) => ({ ...prev, source_code: e.target.value }))}
                          style={{ flex: 1, background: '#050505', color: '#38bdf8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 12, fontFamily: 'monospace', fontSize: 11, resize: 'none', outline: 'none' }}
                          spellCheck={false}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8' }}>
                <Globe size={14} style={{ color: '#10d974' }} />
                <span>Live AI Dynamic Canvas</span>
                {activeConfig.target_entity === 'ecosystem' && (
                  <span style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
                    🏪 Ekosistem
                  </span>
                )}
              </div>

              {/* Ecosystem view */}
              {activeConfig.target_entity === 'ecosystem' && activeConfig.ecosystem ? (
                <div style={{ width: '100%', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ padding: 16, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 12 }}>
                    <h4 style={{ margin: '0 0 8px', color: '#fbbf24' }}>🏪 {activeConfig.ecosystem.name}</h4>
                    <p style={{ margin: '0 0 12px', fontSize: 13, color: '#94a3b8' }}>{activeConfig.ecosystem.description}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {activeConfig.ecosystem.components?.map((comp: any, i: number) => (
                        <div key={i} style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
                          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                            {comp.type === 'bot' ? '🤖' : comp.type === 'mini_app' ? '📱' : '🌐'} {comp.name}
                          </div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{comp.purpose}</div>
                        </div>
                      ))}
                    </div>
                    {activeConfig.ecosystem.integrations && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#10d974', marginBottom: 6 }}>🔗 Integratsiyalar:</div>
                        {activeConfig.ecosystem.integrations.map((int: string, i: number) => (
                          <div key={i} style={{ fontSize: 11, color: '#94a3b8', padding: '2px 0' }}>• {int}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : activeConfig.source_code ? (
                <div style={{ width: '100%', flex: 1, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', background: '#fff' }}>
                  <iframe
                    key={activeConfig.source_code.length}
                    srcDoc={activeConfig.source_code}
                    style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
                    title="Live AI Generated Site Preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              ) : activeConfig.target_entity === 'bot_and_mini_app' ? (
                <div style={{ display: 'flex', gap: 16, flex: 1, width: '100%', justifyContent: 'center' }}>
                  {/* Bot Flow */}
                  <div className="ai-constructor-shell" style={{ height: '100%', flex: 1, maxWidth: 380, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: 40, background: '#1e293b', display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Bot size={14} style={{ color: '#a855f7' }} /> Bot Flow
                      </div>
                      <span style={{ fontSize: 10, color: '#94a3b8' }}>{(activeConfig.bot_blocks || activeConfig.blocks || []).length} blok</span>
                    </div>
                    <div style={{ flex: 1, padding: 16, overflowY: 'auto', background: activeConfig.theme === 'minimalist' ? '#f8fafc' : '#090d16', color: activeConfig.theme === 'minimalist' ? '#0f172a' : '#fff' }}>
                      {(activeConfig.bot_blocks || activeConfig.blocks || []).map((b: any, bIdx: number) => renderCanvasBlock(b, bIdx, activeConfig, handleEditBlockClick))}
                    </div>
                  </div>

                  {/* Mini App Preview */}
                  <div className="ai-phone-shell" style={{ height: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: 24, background: '#090d16', display: 'flex', justifyContent: 'space-between', padding: '4px 20px', fontSize: 10, color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <span>9:41</span><div style={{ display: 'flex', gap: 4 }}><span>📶</span><span>🔋</span></div>
                    </div>
                    <div style={{ flex: 1, padding: 16, overflowY: 'auto', background: activeConfig.theme === 'minimalist' ? '#f8fafc' : '#090d16', color: activeConfig.theme === 'minimalist' ? '#0f172a' : '#fff' }}>
                      <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 16, fontWeight: 900, color: activeConfig.themeColor || '#1e90ff' }}>
                        📱 {activeConfig.appName} (Mini App)
                      </div>
                      {(activeConfig.site_blocks || []).map((b: any, bIdx: number) => renderCanvasBlock(b, bIdx, activeConfig, handleEditBlockClick))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={
                  activeConfig.target_entity === 'bot' ? 'ai-constructor-shell' :
                  activeConfig.target_entity === 'site' ? 'ai-desktop-shell' :
                  'ai-phone-shell'
                }>
                  {activeConfig.target_entity !== 'bot' && activeConfig.target_entity !== 'site' && (
                    <div style={{ height: 24, background: '#090d16', display: 'flex', justifyContent: 'space-between', padding: '4px 20px', fontSize: 10, color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <span>9:41</span><div style={{ display: 'flex', gap: 4 }}><span>📶</span><span>🔋</span></div>
                    </div>
                  )}
                  {activeConfig.target_entity === 'site' && (
                    <div style={{ height: 32, background: '#1e293b', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></div>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#eab308' }}></div>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }}></div>
                      </div>
                      <div style={{ flex: 1, background: '#0f172a', height: 20, borderRadius: 4, display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: 10, color: '#94a3b8' }}><Globe size={10} style={{ marginRight: 6 }} />mazaika-live.com</div>
                    </div>
                  )}
                  {activeConfig.target_entity === 'bot' && (
                    <div style={{ height: 40, background: '#1e293b', display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><Bot size={14} style={{ color: '#a855f7' }} /> Bot Flow</div>
                    </div>
                  )}
                  <div style={{ flex: 1, padding: 16, overflowY: 'auto', background: activeConfig.theme === 'minimalist' ? '#f8fafc' : activeConfig.theme === 'neon' ? '#05050d' : '#090d16', color: activeConfig.theme === 'minimalist' ? '#0f172a' : '#fff' }}>
                    <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 16, fontWeight: 900, color: activeConfig.themeColor || '#1e90ff' }}>
                      🏆 {activeConfig.appName}
                    </div>
                    {(activeConfig.blocks || activeConfig.bot_blocks || activeConfig.site_blocks || []).map((b: any, bIdx: number) => renderCanvasBlock(b, bIdx, activeConfig, handleEditBlockClick))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#94a3b8', maxWidth: 400, padding: '0 24px' }}>
              <Zap size={48} style={{ color: '#fbbf24', marginBottom: 16, opacity: 0.8 }} />
              <h3 style={{ color: '#fff', fontSize: 20, marginBottom: 8 }}>Mazaika AI Workspace</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                Chatda loyihangizni tavsiflang. AI avtomatik ravishda sizning botingiz, Mini App va saytingizni yaratib beradi.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
                {['🤖 Bot yaratish — to\'liq ishlaydigan kod', '📱 Mini App — Telegram ichida', '🌐 Veb sayt — HTML/CSS/JS', '🏪 To\'liq ekosistem — hammasini bir vaqtda', '📸 Rasm yuboring — AI tahlil qiladi'].map((item, i) => (
                  <div key={i} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: 13, color: '#cbd5e1' }}>{item}</div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
