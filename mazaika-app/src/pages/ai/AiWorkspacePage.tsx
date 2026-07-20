import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, Send, Bot, RefreshCw, Save, Globe } from 'lucide-react'
import { useAICopilot } from '../../context/AICopilotContext'
import { useAuthStore } from '../../store/useAuthStore'
import { createBot, saveSiteConfig } from '../../api/firestore'
import './AiWorkspacePage.css'

const PRESET_TEMPLATES = [
  { id: 't1', title: '🚗 Avto Ehtiyot Qismlar', prompt: 'Avto-magazin va STO servisiga yozilish uchun Mini App va bot yarat' },
  { id: 't2', title: '🍕 Issiq Pitsa Yetkazish', prompt: 'Pitsariya uchun online menyu, korzina va keshbek tizimi yarat' },
  { id: 't3', title: '🎓 IT Akademiya', prompt: 'IT akademiyasi uchun kurslar katalogi va ariza shaklini yarat' },
  { id: 't4', title: '🛍️ Smart Internet Do\'kon', prompt: 'Elektronika va kiyim-kechak do\'koni uchun Mini App yarat' }
]

export default function AiWorkspacePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { messages, isGenerating, sendMessage, activeConfig } = useAICopilot()

  const [promptInput, setPromptInput] = useState('')
  const [savingBot, setSavingBot] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendPrompt = async (textToUse?: string) => {
    const text = textToUse || promptInput
    if (!text.trim() || isGenerating) return
    if (!textToUse) setPromptInput('')

    await sendMessage(text, 'FULL_GENERATION')
  }

  const handleSaveProjectToBot = async () => {
    if (!user) {
      alert("Iltimos, avval tizimga kiring!")
      return
    }
    if (!activeConfig || !activeConfig.blocks) {
      alert("Avval AI orqali loyiha yarating!")
      return
    }

    setSavingBot(true)
    try {
      const isBot = activeConfig.target_entity === 'bot'
      
      let customNodes = undefined;
      let customEdges = undefined;

      if (isBot) {
        // Translate AI flat blocks into React Flow Nodes and Edges
        customNodes = [];
        customEdges = [];
        
        let yOffset = 100;
        activeConfig.blocks.forEach((block: any, index: number) => {
          let nodeType = 'message';
          if (block.type === 'boshlash') nodeType = 'start';
          if (block.type === 'xabar') nodeType = 'message';
          if (block.type === 'matnli_savol') nodeType = 'question';
          if (block.type === 'shart') nodeType = 'condition';

          const node = {
            id: block.id || `node-${index}`,
            type: nodeType,
            position: { x: 300, y: yOffset },
            data: {
              label: block.title || block.type,
              text: block.text || '',
              buttons: block.buttons || [],
              variable: block.variable || '',
              condition: block.condition || '',
            }
          }
          customNodes.push(node)

          // Connect sequential nodes
          if (index > 0) {
            const prevBlock = activeConfig.blocks[index - 1]
            customEdges.push({
              id: `e-${index}`,
              source: prevBlock.id || `node-${index - 1}`,
              target: node.id,
              type: 'buttonEdge',
              animated: true
            })
          }
          yOffset += 150;
        })
      }

      // 1. Create Bot in Firestore
      const newBot = await createBot(user.id, {
        name: activeConfig.appName || 'AI Generated Project',
        token: 'TEST_TOKEN_' + Date.now().toString().slice(-6),
        creationType: isBot ? 'bot_only' : 'bot_and_webapp',
        customNodes,
        customEdges
      })

      // 2. Save Generated SiteConfig to Firestore (if it's a site/mini app)
      if (!isBot) {
        await saveSiteConfig(newBot.id, activeConfig)
      }

      alert(`🎉 "${activeConfig.appName || 'AI Loyiha'}" muvaffaqiyatli saqlandi!`)
      
      // 3. Navigate depending on target_entity
      if (isBot) {
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
      {/* Top Navigation Bar */}
      <header className="ai-workspace-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')} style={{ gap: 8 }}>
            <ArrowLeft size={16} /> Boshqaruv Paneliga qaytish
          </button>

          <div style={{ height: 24, width: 1, background: 'rgba(255,255,255,0.1)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 6, borderRadius: 8, background: 'linear-gradient(135deg, #1e90ff, #a855f7)', color: '#fff' }}>
              <Sparkles size={16} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Antigravity AI Workspace</h3>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Generativ AI Arxitektor & Copilot</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {activeConfig && (
            <button 
              className="btn btn-primary" 
              onClick={handleSaveProjectToBot}
              disabled={savingBot}
              style={{ gap: 8, background: 'linear-gradient(135deg, #10d974, #00f5c4)', color: '#090d16', fontWeight: 700 }}
            >
              <Save size={16} /> {savingBot ? "Saqlanmoqda..." : "Loyihani Saqlash & Botga Aylantirish"}
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
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Generatsiya qilish uchun bosing</span>
              </div>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="agent-messages-body" style={{ flex: 1 }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`agent-message-item ${msg.sender}`} style={{ maxWidth: '90%' }}>
                {msg.text}
                {msg.projectData && (
                  <div style={{ marginTop: 8, padding: 10, background: 'rgba(30,144,255,0.1)', borderRadius: 10, border: '1px solid rgba(30,144,255,0.3)', fontSize: 12 }}>
                    <span style={{ fontWeight: 700, color: '#1e90ff' }}>🚀 Generatsiya yakunlandi:</span> {msg.projectData.appName}
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                      • Bloklar soni: {msg.projectData.blocks?.length || 0}<br />
                      • Tema uslubi: {msg.projectData.theme} ({msg.projectData.themeColor})
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isGenerating && (
              <div className="agent-message-item agent" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RefreshCw size={16} className="spin" style={{ color: '#1e90ff' }} /> Antigravity yangi loyiha strukturasini generatsiya qilmoqda...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="agent-input-container">
            <input 
              type="text" 
              className="agent-input" 
              placeholder="Antigravity AI ga qanday loyiha yaratish kerakligini yozing..." 
              value={promptInput}
              onChange={e => setPromptInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendPrompt()}
              disabled={isGenerating}
            />
            <button 
              className="btn btn-primary" 
              onClick={() => handleSendPrompt()}
              disabled={isGenerating || !promptInput.trim()}
              style={{ gap: 6 }}
            >
              <Send size={16} /> Generatsiya
            </button>
          </div>
        </div>

        {/* Right Live Preview Panel */}
        <div className="ai-preview-panel">
          {activeConfig ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, height: '100%', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8' }}>
                <Globe size={14} style={{ color: '#10d974' }} />
                <span>Live AI Dynamic Canvas (Mazaika Generative Engine)</span>
              </div>

              {/* Smartphone Preview Shell */}
              <div className="ai-phone-shell">
                <div style={{ height: 24, background: '#090d16', display: 'flex', justifyContent: 'space-between', padding: '4px 20px', fontSize: 10, color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <span>9:41</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <span>📶</span>
                    <span>🔋</span>
                  </div>
                </div>

                {/* Render Mock Canvas */}
                <div style={{ flex: 1, padding: 16, overflowY: 'auto', background: activeConfig.theme === 'minimalist' ? '#f8fafc' : activeConfig.theme === 'neon' ? '#05050d' : '#090d16', color: activeConfig.theme === 'minimalist' ? '#0f172a' : '#fff' }}>
                  
                  {/* Header Bar */}
                  <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 16, fontWeight: 900, color: activeConfig.themeColor || '#1e90ff' }}>
                    🏆 {activeConfig.appName}
                  </div>

                  {/* Render Generated Blocks */}
                  {(Array.isArray(activeConfig.blocks) ? activeConfig.blocks : []).map((b: any, bIdx: number) => (
                    <div key={b.id || bIdx} style={{ marginBottom: 16, padding: 12, borderRadius: 12, background: activeConfig.theme === 'minimalist' ? '#fff' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
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
                                <input type="text" disabled placeholder={f.label} style={{ width: '100%', padding: 4, fontSize: 10, borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {b.type === 'voting' && (
                        <div>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: 13, fontWeight: 700 }}>{b.title}</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {(Array.isArray(b.candidates) ? b.candidates : []).map((cand: any, idx: number) => (
                              <button key={idx} style={{ textAlign: 'left', padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontSize: 11, cursor: 'pointer' }}>
                                {typeof cand === 'string' ? cand : cand.name || 'Nomzod'}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {b.type === 'loyalty' && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 11, fontWeight: 700 }}>{b.title}</span>
                          <span style={{ fontSize: 11, fontWeight: 800, color: '#10d974' }}>15,000 pts</span>
                        </div>
                      )}

                      {b.type === 'contacts' && (
                        <div>
                          <h4 style={{ margin: 0, fontSize: 12, fontWeight: 700 }}>{b.title}</h4>
                          <span style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginTop: 4 }}>📞 {b.phone}</span>
                          <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>💬 @{b.telegram}</span>
                        </div>
                      )}

                      {/* --- NEW: BOT FLOW LOGIC NODES --- */}
                      {['boshlash', 'xabar', 'matnli_savol', 'shart'].includes(b.type) && (
                        <div style={{ borderLeft: `3px solid ${activeConfig.themeColor || '#8b5cf6'}`, paddingLeft: 8 }}>
                          <h4 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>Node: {b.title} <span style={{ fontSize: 9, opacity: 0.6, background: '#334155', padding: '2px 4px', borderRadius: 4 }}>{b.type}</span></h4>
                          {b.text && <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0 0' }}>{b.text}</p>}
                          {b.condition && <p style={{ fontSize: 10, color: '#fbbf24', margin: '4px 0 0 0', fontFamily: 'monospace' }}>if ({b.condition})</p>}
                          {b.variable && <p style={{ fontSize: 10, color: '#38bdf8', margin: '4px 0 0 0', fontFamily: 'monospace' }}>-{'>'} {b.variable}</p>}
                          
                          {Array.isArray(b.buttons) && b.buttons.length > 0 && (
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                              {b.buttons.map((btn: any, i: number) => (
                                <span key={i} style={{ fontSize: 9, padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: 12, color: '#e2e8f0' }}>{typeof btn === 'string' ? btn : btn.text || 'Tugma'}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* --- NEW: INTERACTIVE QUIZ (for Math/Testing bots) --- */}
                      {b.type === 'quiz' && (
                        <div>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: 13, fontWeight: 700 }}>{b.title || 'Testing / Quiz'}</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {(Array.isArray(b.questions) ? b.questions : []).map((q: any, idx: number) => (
                              <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 8 }}>
                                <p style={{ fontSize: 11, margin: '0 0 6px 0', color: '#e2e8f0' }}>{idx + 1}. {q.q || q.question}</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                  {(Array.isArray(q.options) ? q.options : []).map((opt: any, oIdx: number) => (
                                    <span key={oIdx} style={{ fontSize: 10, padding: '4px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, color: '#94a3b8', cursor: 'pointer' }}>{typeof opt === 'string' ? opt : opt.text || opt.label || 'Variant'}</span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  ))}

                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#94a3b8', maxWidth: 400 }}>
              <Bot size={48} style={{ color: '#1e90ff', marginBottom: 16, opacity: 0.8 }} />
              <h3 style={{ color: '#fff', fontSize: 18, marginBottom: 8 }}>Antigravity AI Live Preview</h3>
              <p style={{ fontSize: 13, lineHeight: 1.5 }}>Чатида лойиҳангизни баён қилинг ёки юқоридаги тайёр шаблонлардан бирини босинг. ИИ автоматик тарзда сайтингиз, мини апп ва ботингизни алгоритмини тузиб беради.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
