import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, Send, Bot, Save, Globe, Menu, X, MessageSquare, Trash2 } from 'lucide-react'
import { useAICopilot } from '../../context/AICopilotContext'
import { useAuthStore } from '../../store/useAuthStore'
import { createBot, saveSiteConfig, getBotsByUser } from '../../api/firestore'
import './AiWorkspacePage.css'

const PRESET_TEMPLATES = [
  { id: 't1', title: '🚗 Avto Ehtiyot Qismlar', prompt: 'Avto-magazin va STO servisiga yozilish uchun Mini App va bot yarat' },
  { id: 't2', title: '🍕 Issiq Pitsa Yetkazish', prompt: 'Pitsariya uchun online menyu, korzina va keshbek tizimi yarat' },
  { id: 't3', title: '🎓 IT Akademiya', prompt: 'IT akademiyasi uchun kurslar katalogi va ariza shaklini yarat' },
  { id: 't4', title: '🛍️ Smart Internet Do\'kon', prompt: 'Elektronika va kiyim-kechak do\'koni uchun Mini App yarat' }
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

      {['boshlash', 'xabar', 'matnli_savol', 'shart', 'custom_code'].includes(b.type) && (
        <div style={{ borderLeft: `3px solid ${b.type === 'custom_code' ? '#f59e0b' : activeConfig.themeColor || "#8b5cf6"}`, paddingLeft: 8 }}>
          <h4 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>
            Node: {b.title || 'Dynamic Logic'}{' '}
            <span style={{ fontSize: 9, opacity: 0.6, background: b.type === 'custom_code' ? '#f59e0b' : '#334155', color: b.type === 'custom_code' ? '#000' : '#fff', padding: '2px 4px', borderRadius: 4 }}>{b.type}</span>
          </h4>
          
          {b.type === 'custom_code' && b.code && (
            <div style={{ marginTop: 8, background: '#0f172a', padding: 8, borderRadius: 6, border: '1px solid #1e293b', overflowX: 'auto' }}>
              <pre style={{ margin: 0, fontSize: 10, color: '#10b981', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                {b.code}
              </pre>
            </div>
          )}

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

      {/* DYNAMIC AI BLOCKS */}
      {b.type === 'custom_html' && (
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: 13, fontWeight: 700 }}>
            {b.title || 'Maxsus Blok'}{' '}
            <span style={{ fontSize: 9, opacity: 0.6, background: '#10b981', color: '#000', padding: '2px 4px', borderRadius: 4, marginLeft: 4 }}>AI Jeneratsiyasi</span>
          </h4>
          {b.css && <style dangerouslySetInnerHTML={{ __html: b.css }} />}
          {b.html && (
            <div 
              className="ai-custom-html-wrapper" 
              dangerouslySetInnerHTML={{ __html: b.html }} 
              style={{ fontSize: 12, lineHeight: 1.5 }}
            />
          )}
        </div>
      )}

      {/* Fallback for unknown AI generated types so they don't appear as empty boxes */}
      {!['hero', 'about', 'catalog', 'form', 'voting', 'loyalty', 'contacts', 'quiz', 'boshlash', 'xabar', 'matnli_savol', 'shart', 'custom_html'].includes(b.type) && (
        <div>
          <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
            {b.title || 'Qo\'shimcha blok'}{' '}
            <span style={{ fontSize: 9, opacity: 0.6, background: '#334155', padding: '2px 4px', borderRadius: 4, marginLeft: 4 }}>{b.type}</span>
          </h4>
          {(b.text || b.desc || b.subtitle || b.content) && (
            <p style={{ fontSize: 11, color: '#94a3b8', margin: '6px 0 0 0' }}>{b.text || b.desc || b.subtitle || b.content}</p>
          )}
          {Array.isArray(b.items) && b.items.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
              {b.items.map((item: any, idx: number) => (
                <div key={idx} style={{ fontSize: 10, padding: 6, background: 'rgba(255,255,255,0.02)', borderRadius: 4 }}>
                  {item.name || item.title || item.text || JSON.stringify(item)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function AiWorkspacePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { messages, isGenerating, sendMessage, activeConfig, clearChat, activeProjectId, switchProject } = useAICopilot()

  // NEW STATE: AI Target Entity
  const [aiTargetEntity, setAiTargetEntity] = useState<'bot_and_mini_app' | 'site_only'>('bot_and_mini_app')
  const [promptInput, setPromptInput] = useState('')
  const [savingBot, setSavingBot] = useState(false)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  
  const handleEditBlockClick = (b: any) => {
    setPromptInput(`Ushbu blokni o'zgartiring (ID: ${b.id}, Tip: ${b.type}): `);
    setTimeout(() => {
      const inputEl = document.getElementById('ai-prompt-input');
      if (inputEl) inputEl.focus();
    }, 50);
  };

  useEffect(() => {
    if (user) {
      getBotsByUser(user.id).then(setProjects)
    }
  }, [user])

  const handleSelectProject = (proj: any) => {
    const siteConfig = localStorage.getItem(`mazaika_site_${proj.id}`)
    let config = { ...proj, target_entity: 'bot' };
    if (siteConfig) {
       const parsedSite = JSON.parse(siteConfig);
       config = { ...config, ...parsedSite, target_entity: 'bot_and_mini_app' }
    }
    
    switchProject(proj.id, config)
    setDrawerOpen(false)
  }

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendPrompt = async (textToUse?: string) => {
    const text = textToUse || promptInput
    if (!text.trim() || isGenerating) return
    if (!textToUse) setPromptInput('')

    await sendMessage(text, 'FULL_GENERATION', aiTargetEntity)
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
      
      let customNodes = undefined;
      let customEdges = undefined;

      if (isBot) {
        customNodes = [];
        customEdges = [];
        
        let botBlocks = activeConfig.target_entity === 'bot_and_mini_app' || activeConfig.bot_blocks 
          ? (activeConfig.bot_blocks || []) 
          : (activeConfig.blocks || []);
        
        if (!Array.isArray(botBlocks)) {
          botBlocks = [];
        }
        
        let yOffset = 100;

        
        botBlocks.forEach((block: any, index: number) => {
          let nodeType = block.type || 'message';
          // Backward compatibility for old presets:
          if (block.type === 'boshlash') nodeType = 'start';
          if (block.type === 'xabar') nodeType = 'message';
          if (block.type === 'matnli_savol') nodeType = 'question';
          if (block.type === 'shart') nodeType = 'condition';

          // Layout algorithm (Zig-zag or simple wrap)
          // Just alternate between left and right slightly to make it readable, or just vertical spacing
          // React Flow auto-layout is best done via library, but a simple grid works:
          const col = index % 3;
          const row = Math.floor(index / 3);
          
          const xPos = 100 + (col * 350);
          const yPos = 100 + (row * 200);

          const node = {
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
          // Add custom_code mapping
          if (block.type === 'custom_code') {
            node.type = 'custom_code';
            (node.data as any).code = block.code;
          }

          customNodes.push(node)
          yOffset += 150;
        })

        // Pass 2: Generate Edges based on AI routing or sequential fallback
        botBlocks.forEach((block: any, index: number) => {
          let hasExplicitEdges = false;
          
          if (block.true_node) {
            customEdges.push({ id: `e-${block.id}-true`, source: block.id, target: block.true_node, sourceHandle: 'true', type: 'buttonEdge', animated: true });
            hasExplicitEdges = true;
          }
          if (block.false_node) {
            customEdges.push({ id: `e-${block.id}-false`, source: block.id, target: block.false_node, sourceHandle: 'false', type: 'buttonEdge', animated: true });
            hasExplicitEdges = true;
          }
          if (block.next_node) {
            customEdges.push({ id: `e-${block.id}-next`, source: block.id, target: block.next_node, type: 'buttonEdge', animated: true });
            hasExplicitEdges = true;
          }
          if (Array.isArray(block.buttons)) {
            block.buttons.forEach((btn: any, btnIdx: number) => {
              if (btn && typeof btn === 'object' && btn.target_node) {
                customEdges.push({ id: `e-${block.id}-btn${btnIdx}`, source: block.id, target: btn.target_node, sourceHandle: `btn_${btnIdx}`, type: 'buttonEdge', animated: true });
                hasExplicitEdges = true;
              }
            });
          }
          
          if (!hasExplicitEdges && index < botBlocks.length - 1) {
             const nextBlock = botBlocks[index + 1];
             customEdges.push({
               id: `e-${block.id}-${nextBlock.id}`,
               source: block.id || `node-${index}`,
               target: nextBlock.id || `node-${index + 1}`,
               type: 'buttonEdge',
               animated: true
             });
          }
        });
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
          : activeConfig;
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
              onClick={() => { switchProject('default', null); setDrawerOpen(false); }}
            >
              <div style={{ fontSize: 13, fontWeight: 700 }}>+ Yangi Loyiha (Qoralama)</div>
            </div>
            {projects.map(p => (
              <div 
                key={p.id} 
                style={{ padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.02)', cursor: 'pointer', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setDrawerOpen(true)} style={{ padding: '6px 8px' }}>
            <Menu size={20} />
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')} style={{ gap: 8 }}>
            <ArrowLeft size={16} /> Boshqaruv Paneliga qaytish
          </button>

          <div style={{ height: 24, width: 1, background: 'rgba(255,255,255,0.1)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 6, borderRadius: 8, background: 'linear-gradient(135deg, #1e90ff, #a855f7)', color: '#fff' }}>
              <Sparkles size={16} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                Mazaika AI Workspace 
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

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 4, marginRight: 16 }}>
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
              🌐 Veb Sayt
            </button>
          </div>

          <button 
            className="btn btn-ghost btn-sm" 
            onClick={clearChat}
            style={{ gap: 6, color: '#ef4444', fontSize: 12, padding: '6px 12px' }}
          >
            <Trash2 size={14} /> Tozalash
          </button>
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
              <div className="agent-message-item agent" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="thinking-dots">
                  <span></span><span></span><span></span>
                </div>
                <span style={{ fontSize: 13 }}>Mazaika AI o'ylamoqda...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="agent-input-container">
            <input 
              id="ai-prompt-input"
              type="text" 
              className="agent-input" 
              placeholder="Mazaika AI ga qanday loyiha yaratish kerakligini yozing..." 
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
        <div className="ai-preview-panel" style={{ padding: 16 }}>
          {activeConfig ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, height: '100%', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8' }}>
                <Globe size={14} style={{ color: '#10d974' }} />
                <span>Live AI Dynamic Canvas (Mazaika Generative Engine)</span>
              </div>

              {activeConfig.target_entity === 'bot_and_mini_app' ? (
                <div style={{ display: 'flex', gap: 24, flex: 1, width: '100%', justifyContent: 'center' }}>
                  {/* Left Shell: BOT CONSTRUCTOR */}
                  <div className="ai-constructor-shell" style={{ height: '100%', flex: 1, maxWidth: 400, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: 40, background: '#1e293b', display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Bot size={14} style={{ color: '#a855f7' }} /> Bot Constructor
                      </div>
                    </div>
                    <div style={{ flex: 1, padding: 16, overflowY: 'auto', background: activeConfig.theme === 'minimalist' ? '#f8fafc' : activeConfig.theme === 'neon' ? '#05050d' : '#090d16', color: activeConfig.theme === 'minimalist' ? '#0f172a' : '#fff' }}>
                      <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 16, fontWeight: 900, color: activeConfig.themeColor || '#1e90ff' }}>
                        🏆 {activeConfig.appName} (Bot Logic)
                      </div>
                      {(activeConfig.bot_blocks || activeConfig.blocks || []).map((b: any, bIdx: number) => renderCanvasBlock(b, bIdx, activeConfig, handleEditBlockClick))}
                    </div>
                  </div>

                  {/* Right Shell: MINI APP (Phone) */}
                  <div className="ai-phone-shell" style={{ height: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: 24, background: '#090d16', display: 'flex', justifyContent: 'space-between', padding: '4px 20px', fontSize: 10, color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <span>9:41</span><div style={{ display: 'flex', gap: 4 }}><span>📶</span><span>🔋</span></div>
                    </div>
                    <div style={{ flex: 1, padding: 16, overflowY: 'auto', background: activeConfig.theme === 'minimalist' ? '#f8fafc' : activeConfig.theme === 'neon' ? '#05050d' : '#090d16', color: activeConfig.theme === 'minimalist' ? '#0f172a' : '#fff' }}>
                      <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 16, fontWeight: 900, color: activeConfig.themeColor || '#1e90ff' }}>
                        📱 {activeConfig.appName} (Mini App UI)
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
                      <div style={{ display: 'flex', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></div><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#eab308' }}></div><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }}></div></div>
                      <div style={{ flex: 1, background: '#0f172a', height: 20, borderRadius: 4, display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: 10, color: '#94a3b8' }}><Globe size={10} style={{ marginRight: 6 }} /> mazaika-live.com</div>
                    </div>
                  )}
                  {activeConfig.target_entity === 'bot' && (
                    <div style={{ height: 40, background: '#1e293b', display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><Bot size={14} style={{ color: '#a855f7' }} /> Bot Constructor Board</div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>Drag & Drop Nodes Enabled</div>
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
            <div style={{ textAlign: 'center', color: '#94a3b8', maxWidth: 400 }}>
              <Bot size={48} style={{ color: '#1e90ff', marginBottom: 16, opacity: 0.8 }} />
              <h3 style={{ color: '#fff', fontSize: 18, marginBottom: 8 }}>Mazaika AI Live Preview</h3>
              <p style={{ fontSize: 13, lineHeight: 1.5 }}>Чатида лойиҳангизни баён қилинг ёки юқоридаги тайёр шаблонлардан бирини босинг. ИИ автоматик тарзда сайтингиз, мини апп ва ботингизни алгоритмини тузиб беради.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
