import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { 
  Globe, Save, Eye, CheckCircle, Sparkles, Bot, Loader2, Send,
  Copy, Check, RefreshCw, Zap, ExternalLink, Laptop, Smartphone, Sliders, X
} from 'lucide-react'

import { getSiteConfig, saveSiteConfig, updateBot } from '../../api/firestore'
import { useAICopilot } from '../../context/AICopilotContext'

export interface Block {
  id: string
  type: string
  title?: string
  subtitle?: string
  text?: string
  img?: string
  ctaText?: string
  html?: string
  source_code?: string
}

interface SiteConfig {
  theme: 'neon' | 'minimalist' | 'glassmorphism' | string
  themeColor: string
  appName: string
  blocks: Block[]
  source_code?: string
}

const DEFAULT_CONFIG: SiteConfig = {
  appName: 'Mini App & Website',
  theme: 'glassmorphism',
  themeColor: '#1e90ff',
  blocks: [],
  source_code: ''
}

export default function SiteBuilderPage() {
  const { botId } = useParams<{ botId: string }>()
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG)
  const [isLoading, setIsLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [siteTitle, setSiteTitle] = useState('Panda World')
  const [siteSlug, setSiteSlug] = useState('panda-world')
  const [siteDesc, setSiteDesc] = useState('Заповедный мир панд...')

  const handleOpenInNewTab = () => {
    const htmlToOpen = config.source_code || ''
    if (!htmlToOpen) {
      alert("Sayt hali yaratilmagan!")
      return
    }
    const blob = new Blob([htmlToOpen], { type: 'text/html;charset=utf-8' })
    const blobUrl = URL.createObjectURL(blob)
    window.open(blobUrl, '_blank')
  }
  
  const { activeConfig, messages, sendMessage, isGenerating, clearChat } = useAICopilot()
  const [promptInput, setPromptInput] = useState('')
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const fetchConfig = async () => {
      if (!botId) return
      setIsLoading(true)
      try {
        const data = await getSiteConfig(botId)
        if (data) {
          setConfig(data as SiteConfig)
        } else {
          setConfig(DEFAULT_CONFIG)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchConfig()
  }, [botId])

  useEffect(() => {
    if (activeConfig) {
      setConfig(prev => ({
        ...prev,
        theme: activeConfig.theme || prev.theme,
        themeColor: activeConfig.themeColor || prev.themeColor,
        appName: activeConfig.appName || prev.appName,
        blocks: activeConfig.blocks || prev.blocks,
        source_code: activeConfig.source_code || prev.source_code
      }))
    }
  }, [activeConfig])

  const handleSend = useCallback(async (text?: string) => {
    const msg = text || promptInput
    if (!msg.trim() || isGenerating) return
    setPromptInput('')
    if (textareaRef.current) textareaRef.current.style.height = '48px'
    await sendMessage(msg, 'FULL_GENERATION', 'site_only')
  }, [promptInput, isGenerating, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptInput(e.target.value)
    e.target.style.height = '48px'
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px'
  }

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

  const copyMsg = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedMsgId(id)
    setTimeout(() => setCopiedMsgId(null), 2000)
  }

  const retryLast = async () => {
    const lastUser = [...messages].reverse().find(m => m.sender === 'user')
    if (lastUser) await handleSend(lastUser.text)
  }

  const SITE_QUICK_PROMPTS = [
    { icon: '🎨', label: 'Rangi o\'zgartir', text: 'Asosiy rangni to\'q ko\'k-binafsha gradientga o\'zgartir' },
    { icon: '⚡', label: 'Animatsiya', text: 'Hero bo\'limiga chiroyli kirish animatsiyasini qo\'sh' },
    { icon: '📱', label: 'Mobil', text: 'Mobil qurilmalarda yaxshiroq ko\'rinishi uchun optimizatsiya qil' },
    { icon: '🛒', label: 'Mahsulot', text: 'Tovarlar katalogi va xarid bo\'limini qo\'sh' },
    { icon: '📞', label: 'Aloqa', text: 'Bog\'lanish formasi va Telegram tugmasini qo\'sh' },
    { icon: '✨', label: 'Modernlashtir', text: 'Butun dizaynni zamonaviy va premium ko\'rinishga o\'zgartir' },
  ]

  const renderMarkdown = (text: string) => {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      if (line.startsWith('## ')) return <p key={i} style={{ fontWeight: 700, fontSize: 14, color: '#fff', margin: '10px 0 4px' }}>{line.slice(3)}</p>
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 3 }}>
            <span style={{ color: '#a855f7', marginTop: 2, flexShrink: 0 }}>•</span>
            <span style={{ color: '#e2e8f0' }}>{line.slice(2)}</span>
          </div>
        )
      }
      if (line.trim() === '') return <div key={i} style={{ height: 6 }} />
      const parts = line.split(/(\*\*.*?\*\*)/g)
      return (
        <p key={i} style={{ margin: '2px 0', color: '#e2e8f0' }}>
          {parts.map((p, j) => p.startsWith('**') && p.endsWith('**')
            ? <strong key={j} style={{ color: '#fff' }}>{p.slice(2,-2)}</strong>
            : p
          )}
        </p>
      )
    })
  }

  return (
    <div style={{ display: 'flex', height: '100%', background: '#090d16', color: '#fff', width: '100%', fontFamily: 'inherit' }}>
      <div style={{ width: '420px', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', background: 'linear-gradient(160deg, #0d1526 0%, #0a0f1e 100%)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(168,85,247,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: 'linear-gradient(135deg, #a855f7, #3b82f6)', padding: 8, borderRadius: 12, boxShadow: '0 4px 12px rgba(168,85,247,0.4)' }}>
              <Sparkles size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>Mazaika AI Architect</div>
              <div style={{ fontSize: 10, color: isGenerating ? '#a855f7' : '#10d974' }}>
                {isGenerating ? '● Ishlayapti...' : '● Tayyor'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={retryLast} title="Qayta yuborish" disabled={isGenerating || messages.length < 2} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 6, borderRadius: 7, display: 'flex', alignItems: 'center', opacity: (isGenerating || messages.length < 2) ? 0.3 : 1 }}>
              <RefreshCw size={13} />
            </button>
            <button onClick={() => { if (window.confirm('Chatni tozalash?')) clearChat() }} title="Tozalash" style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 6, borderRadius: 7, display: 'flex', alignItems: 'center' }}>
              <Zap size={13} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14, scrollbarWidth: 'thin' }}>
          {messages.length <= 1 && (
            <div style={{ textAlign: 'center', padding: '16px 8px' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(59,130,246,0.2))', border: '1px solid rgba(168,85,247,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#a855f7' }}>
                <Globe size={20} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: '0 0 6px' }}>Sayt yaratishni boshlaylik!</p>
              <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 16px', lineHeight: 1.5 }}>Quyidagi misollardan birini tanlang yoki o'z g'oyangizni yozing</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {SITE_QUICK_PROMPTS.map((q, i) => (
                  <button key={i} onClick={() => handleSend(q.text)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '6px 12px', fontSize: 11, color: '#94a3b8', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => { (e.currentTarget as any).style.background = 'rgba(168,85,247,0.15)'; (e.currentTarget as any).style.color = '#e2e8f0'; (e.currentTarget as any).style.borderColor = 'rgba(168,85,247,0.4)' }}
                    onMouseLeave={e => { (e.currentTarget as any).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as any).style.color = '#94a3b8'; (e.currentTarget as any).style.borderColor = 'rgba(255,255,255,0.1)' }}
                  >{q.icon} {q.label}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexDirection: m.sender === 'user' ? 'row-reverse' : 'row' }}>
              {m.sender === 'agent' && (
                <div style={{ background: 'linear-gradient(135deg, #1e90ff, #a855f7)', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, boxShadow: '0 2px 8px rgba(168,85,247,0.3)' }}>
                  <Bot size={12} color="#fff" />
                </div>
              )}
              <div style={{ flex: 1, maxWidth: '84%', display: 'flex', flexDirection: 'column', gap: 4, alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 14,
                  fontSize: 13,
                  lineHeight: 1.55,
                  wordBreak: 'break-word',
                  ...(m.sender === 'user'
                    ? { background: 'linear-gradient(135deg, #1e90ff, #2563eb)', color: '#fff', borderBottomRightRadius: 4, boxShadow: '0 4px 14px rgba(30,144,255,0.25)' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderBottomLeftRadius: 4, color: '#e2e8f0' })
                }}>
                  {m.sender === 'agent' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{renderMarkdown(m.text)}</div>
                  ) : m.text}
                </div>
                {m.sender === 'agent' && (
                  <button onClick={() => copyMsg(m.id, m.text)} style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: '2px 7px', fontSize: 10, color: '#64748b', cursor: 'pointer', opacity: 0.8 }}>
                    {copiedMsgId === m.id ? <><Check size={10} /> Nusxalandi</> : <><Copy size={10} /> Nusxa</>}
                  </button>
                )}
              </div>
              {m.sender === 'user' && (
                <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, fontSize: 10, fontWeight: 700, color: '#fff' }}>
                  SZ
                </div>
              )}
            </div>
          ))}

          {isGenerating && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ background: 'linear-gradient(135deg, #1e90ff, #a855f7)', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot size={12} color="#fff" />
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, borderBottomLeftRadius: 4, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 5 }}>
                {[0, 200, 400].map((delay, i) => (
                  <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'linear-gradient(135deg, #1e90ff, #a855f7)', display: 'inline-block', animation: `siteTypingBounce 1.3s ease-in-out ${delay}ms infinite` }} />
                ))}
              </div>
            </div>
          )}
          <style>{`
            @keyframes siteTypingBounce {
              0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
              40% { transform: translateY(-6px); opacity: 1; }
            }
          `}</style>

          <div ref={messagesEndRef} />
        </div>

        <div style={{ padding: '14px 16px 16px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, background: promptInput ? 'rgba(30,144,255,0.05)' : 'rgba(255,255,255,0.03)', border: `1px solid ${promptInput ? 'rgba(30,144,255,0.4)' : 'rgba(255,255,255,0.09)'}`, borderRadius: 14, padding: '8px 8px 8px 14px', transition: 'all 0.2s', boxShadow: promptInput ? '0 0 0 3px rgba(30,144,255,0.08)' : 'none' }}>
            <textarea
              ref={textareaRef}
              value={promptInput}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              placeholder="Saytga nimalar qo'shamiz? Masalan: 'Animatsiyali hero bo'limini yarat'"
              style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: 13, resize: 'none', outline: 'none', minHeight: 48, maxHeight: 140, lineHeight: 1.5, fontFamily: 'inherit', padding: 0 }}
            />
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, flexShrink: 0, paddingBottom: 2 }}>
              {promptInput && <span style={{ fontSize: 10, color: '#334155', whiteSpace: 'nowrap', paddingBottom: 4 }}>↵ yuborish</span>}
              <button onClick={() => handleSend()} disabled={!promptInput.trim() || isGenerating} style={{ width: 34, height: 34, borderRadius: 10, background: (promptInput.trim() && !isGenerating) ? 'linear-gradient(135deg, #1e90ff, #a855f7)' : 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (promptInput.trim() && !isGenerating) ? 'pointer' : 'not-allowed', transition: 'all 0.2s', boxShadow: (promptInput.trim() && !isGenerating) ? '0 4px 14px rgba(30,144,255,0.4)' : 'none', flexShrink: 0 }}>
                {isGenerating ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#334155', marginTop: 8, paddingLeft: 4 }}>
            <ExternalLink size={9} />
            <button
              onClick={() => handleSend()}
              disabled={!promptInput.trim() || isGenerating}
              style={{
                position: 'absolute',
                right: 8,
                bottom: 8,
                width: 34,
                height: 34,
                borderRadius: 10,
                background: promptInput.trim() && !isGenerating ? '#1e90ff' : 'rgba(255,255,255,0.05)',
                color: promptInput.trim() && !isGenerating ? '#fff' : '#64748b',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: promptInput.trim() && !isGenerating ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              <Send size={15} />
            </button>
          </div>
          <div style={{ fontSize: 10, color: '#475569', marginTop: 8, textAlign: 'center' }}>
            AI yaratgan sayt o'ng tomonda ko'rinadi
          </div>
        </div>
      </div>

      {/* Right Canvas / Live Preview */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#020617', padding: 16, gap: 12, position: 'relative' }}>
        {/* Top Preview Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Globe size={20} color="#1e90ff" />
            <h1 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#fff' }}>Live Preview</h1>
            {config.source_code && (
              <span style={{ fontSize: 10, color: '#10d974', background: 'rgba(16,217,116,0.1)', border: '1px solid rgba(16,217,116,0.2)', borderRadius: 20, padding: '2px 8px' }}>
                ● Tayyor
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: 3, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
            <button 
              onClick={() => setDeviceMode('desktop')} 
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, fontSize: 12, border: 'none', background: deviceMode === 'desktop' ? 'rgba(30,144,255,0.2)' : 'transparent', color: deviceMode === 'desktop' ? '#1e90ff' : '#94a3b8', cursor: 'pointer', fontWeight: deviceMode === 'desktop' ? 600 : 400 }}
            >
              <Laptop size={14} /> Desktop
            </button>
            <button 
              onClick={() => setDeviceMode('mobile')} 
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, fontSize: 12, border: 'none', background: deviceMode === 'mobile' ? 'rgba(168,85,247,0.2)' : 'transparent', color: deviceMode === 'mobile' ? '#a855f7' : '#94a3b8', cursor: 'pointer', fontWeight: deviceMode === 'mobile' ? 600 : 400 }}
            >
              <Smartphone size={14} /> Mobile
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {saveSuccess && <span style={{ color: '#10d974', display: 'flex', alignItems: 'center', fontSize: 13, gap: 5 }}><CheckCircle size={14} /> Saqlandi!</span>}
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="btn btn-ghost" 
              style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,0.05)', fontSize: 13, color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}
            >
              <Sliders size={14} /> Sozlamalar
            </button>
            <button onClick={handleSave} disabled={isLoading} className="btn btn-primary" style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, background: '#1e90ff', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer' }}>
              <Save size={14} /> {isLoading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
            <button 
              onClick={handleOpenInNewTab} 
              className="btn btn-ghost" 
              style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,0.05)', fontSize: 13, color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}
            >
              <Eye size={14} /> Ochish
            </button>
          </div>
        </div>

        {/* Live Preview Frame Canvas */}
        <div style={{ 
          flex: 1, 
          background: '#0d1526', 
          borderRadius: 16, 
          overflow: 'hidden', 
          border: '1px solid rgba(255,255,255,0.08)', 
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)', 
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {!config.source_code ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', flexDirection: 'column', gap: 16 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(168,85,247,0.1)', border: '2px dashed rgba(168,85,247,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Globe size={36} style={{ opacity: 0.4, color: '#a855f7' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#94a3b8', margin: '0 0 8px' }}>Sayt hali yaratilmagan</p>
                <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>Chap tomondagi AI chatdan sayt g'oyangizni yozing</p>
              </div>
            </div>
          ) : (
            deviceMode === 'desktop' ? (
                <iframe
                  key={(config.source_code?.length || 0) + '_desktop'}
                srcDoc={config.source_code || '<!DOCTYPE html><html><body style="background:#0f172a;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;"><h2>Загрузка сайта...</h2></body></html>'}
                style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
                title="Live Site Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <div style={{
                width: 360,
                height: '92%',
                maxHeight: 720,
                borderRadius: 40,
                border: '12px solid #1e293b',
                background: '#000',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <div style={{ height: 24, background: '#000', display: 'flex', justifyContent: 'space-between', padding: '4px 20px', fontSize: 10, color: '#94a3b8', zIndex: 10 }}>
                  <span>9:41</span>
                  <div style={{ width: 80, height: 12, background: '#1e293b', borderRadius: 10, marginTop: 2 }} />
                  <span>100%</span>
                </div>

                <iframe
                  key={(config.source_code?.length || 0) + '_mobile'}
                  srcDoc={config.source_code || '<!DOCTYPE html><html><body style="background:#0f172a;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;"><h2>Загрузка сайта...</h2></body></html>'}
                  style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
                  title="Mobile App Live Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            )
          )}
        </div>

        {/* SITE SETTINGS SLIDE-OVER MODAL */}
        {isSettingsOpen && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <div style={{
              width: 320,
              height: '100%',
              background: '#0f172a',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
                    <Sliders size={18} style={{ color: '#1e90ff' }} /> Sayt Sozlamalari
                  </h3>
                  <button onClick={() => setIsSettingsOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>Sayt Nomi (Title)</label>
                    <input
                      type="text"
                      value={siteTitle}
                      onChange={e => setSiteTitle(e.target.value)}
                      style={{ width: '100%', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>Domen / Slug</label>
                    <input
                      type="text"
                      value={siteSlug}
                      onChange={e => setSiteSlug(e.target.value)}
                      style={{ width: '100%', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>SEO Tavsifi (Description)</label>
                    <textarea
                      rows={4}
                      value={siteDesc}
                      onChange={e => setSiteDesc(e.target.value)}
                      style={{ width: '100%', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, outline: 'none', resize: 'none' }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setConfig(prev => ({ ...prev, appName: siteTitle }));
                  setIsSettingsOpen(false);
                }}
                style={{ width: '100%', padding: '12px', background: '#1e90ff', color: '#fff', fontWeight: 600, borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13 }}
              >
                O'zgarishlarni Saqlash
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
