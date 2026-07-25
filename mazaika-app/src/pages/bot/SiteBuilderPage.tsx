import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import {
  Globe, Save, Eye, CheckCircle, Sparkles, Bot, Loader2, Send,
  Copy, Check, RefreshCw, Zap, Laptop, Smartphone,
  Sliders, X, ImagePlus, AlertCircle, Code
} from 'lucide-react'

import Editor from '@monaco-editor/react'

import { getSiteConfig, saveSiteConfig, updateBot } from '../../api/firestore'
import { useAICopilot } from '../../context/AICopilotContext'
import { useAuthStore } from '../../store/useAuthStore'

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
  appName: 'My Website',
  theme: 'glassmorphism',
  themeColor: '#1e90ff',
  blocks: [],
  source_code: ''
}

const getSafeSourceCode = (html: string | undefined) => {
  if (!html) return '';
  // Inject a script at the end of the body to prevent ALL default link navigation inside iframe
  const scriptToInject = `
    <script>
      document.addEventListener('click', function(e) {
        let target = e.target;
        while (target && target.tagName !== 'A') {
          target = target.parentNode;
        }
        if (target && target.tagName === 'A') {
          const href = target.getAttribute('href');
          const targetAttr = target.getAttribute('target');
          
          // If it's an external link opening in a new tab, allow it
          if (targetAttr === '_blank') return;
          
          // OTHERWISE, PREVENT DEFAULT NAVIGATION (This stops the iframe from reloading Mazaika!)
          e.preventDefault();
          
          // If it was a simple anchor link (e.g. href="#about"), manually scroll to it
          if (href && href.startsWith('#') && href.length > 1) {
            const el = document.getElementById(href.substring(1));
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    </script>
  `;
  
  if (html.includes('</body>')) {
    return html.replace('</body>', scriptToInject + '</body>');
  }
  return html + scriptToInject;
};
export default function SiteBuilderPage() {
  const { botId } = useParams<{ botId: string }>()
  const { user } = useAuthStore()
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG)
  const [isLoading, setIsLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [siteTitle, setSiteTitle] = useState('')
  const [siteSlug, setSiteSlug] = useState('')
  const [siteDesc, setSiteDesc] = useState('')
  const [updateCounter, setUpdateCounter] = useState(0) // ✅ for iframe re-render
  const [selfHealingStatus, setSelfHealingStatus] = useState<'idle' | 'healing' | 'failed'>('idle')
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')

  // Image upload state
  const [pendingImage, setPendingImage] = useState<{ base64: string; mimeType: string; previewUrl: string } | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleOpenInNewTab = () => {
    const htmlToOpen = config.source_code || ''
    if (!htmlToOpen) {
      alert('Sayt hali yaratilmagan!')
      return
    }
    const blob = new Blob([htmlToOpen], { type: 'text/html;charset=utf-8' })
    const blobUrl = URL.createObjectURL(blob)
    window.open(blobUrl, '_blank')
  }

  const { activeConfig, messages, sendMessage, isGenerating, clearChat, switchProject } = useAICopilot()
  const [promptInput, setPromptInput] = useState('')
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const selfHealRetryCount = useRef(0)

  // Sync botId with AI context
  useEffect(() => {
    if (botId) switchProject(botId, null)
  }, [botId])

  // Automatically switch to 'code' tab when AI starts generating
  useEffect(() => {
    if (isGenerating) {
      setActiveTab('code')
    }
  }, [isGenerating])

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
          setSiteTitle(data.appName || '')
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

  // ✅ Sync activeConfig to SiteConfig
  useEffect(() => {
    if (!activeConfig) return
    const newHtml = activeConfig.source_code || activeConfig.html || ''
    if (!newHtml) return

    selfHealRetryCount.current = 0
    setSelfHealingStatus('idle')
    
    const nextConfig = {
      ...config,
      theme: activeConfig.theme || config.theme,
      themeColor: activeConfig.themeColor || config.themeColor,
      appName: activeConfig.appName || config.appName,
      blocks: activeConfig.blocks || config.blocks,
      source_code: newHtml
    };
    
    setConfig(nextConfig)
    setUpdateCounter(c => c + 1) // ✅ force iframe re-render

    // ✅ AUTO-SAVE to prevent data loss on reload
    if (botId && newHtml !== config.source_code) {
      saveSiteConfig(botId, nextConfig as any).catch(console.error);
    }
  }, [activeConfig, botId])

  // Image upload handler
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Faqat rasm fayllari qabul qilinadi (jpg, png, gif, webp)')
      return
    }
    try {
      const { compressImage } = await import('../../utils/imageUtils')
      const compressed = await compressImage(file)
      setPendingImage(compressed)
    } catch (err) {
      alert('Rasm yuklashda xatolik yuz berdi')
    }
    // Reset input
    e.target.value = ''
  }

  const handleSend = useCallback(async (text?: string) => {
    const msg = text || promptInput
    if (!msg.trim() || isGenerating) return
    
    const image = pendingImage
    setPromptInput('')
    setPendingImage(null)
    if (textareaRef.current) textareaRef.current.style.height = '48px'
    
    await sendMessage(
      msg,
      'FULL_GENERATION',
      'site_only',
      image?.base64,
      image?.mimeType
    )
  }, [promptInput, pendingImage, isGenerating, sendMessage])

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

  const userInitials = user?.name
    ? user.name.substring(0, 2).toUpperCase()
    : 'AI'

  const SITE_QUICK_PROMPTS = [
    { icon: '🎨', label: 'Rang o\'zgartir', text: 'Asosiy rangni to\'q ko\'k-binafsha gradientga o\'zgartir' },
    { icon: '⚡', label: 'Animatsiya', text: 'Hero bo\'limiga chiroyli kirish animatsiyasini qo\'sh' },
    { icon: '📱', label: 'Mobil', text: 'Mobil qurilmalarda yaxshiroq ko\'rinishi uchun optimizatsiya qil' },
    { icon: '🛒', label: 'Mahsulot', text: 'Tovarlar katalogi va xarid bo\'limini qo\'sh' },
    { icon: '📞', label: 'Aloqa', text: 'Bog\'lanish formasi va Telegram tugmasini qo\'sh' },
    { icon: '✨', label: 'Modernlashtir', text: 'Butun dizaynni zamonaviy glassmorphism ko\'rinishga o\'zgartir' },
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
            ? <strong key={j} style={{ color: '#fff' }}>{p.slice(2, -2)}</strong>
            : p
          )}
        </p>
      )
    })
  }

  return (
    <div style={{ display: 'flex', height: '100%', background: '#090d16', color: '#fff', width: '100%', fontFamily: 'inherit' }}>
      {/* ===== LEFT: AI CHAT ===== */}
      <div style={{ width: '420px', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', background: 'linear-gradient(160deg, #0d1526 0%, #0a0f1e 100%)' }}>
        {/* Chat Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(168,85,247,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: 'linear-gradient(135deg, #a855f7, #3b82f6)', padding: 8, borderRadius: 12, boxShadow: '0 4px 12px rgba(168,85,247,0.4)' }}>
              <Sparkles size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>Mazaika AI Architect</div>
              <div style={{ fontSize: 10, color: isGenerating ? '#a855f7' : selfHealingStatus === 'healing' ? '#ffb830' : '#10d974' }}>
                {isGenerating ? '● Ishlayapti...' : selfHealingStatus === 'healing' ? '● Tuzatmoqda...' : selfHealingStatus === 'failed' ? '● Xatolik' : '● Tayyor'}
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

        {/* Self-healing alert */}
        {selfHealingStatus === 'failed' && (
          <div style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.1)', borderBottom: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#fca5a5' }}>
            <AlertCircle size={13} />
            ИИ не смог исправить HTML. Попробуйте другой запрос.
            <button onClick={() => setSelfHealingStatus('idle')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer' }}>
              <X size={12} />
            </button>
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14, scrollbarWidth: 'thin' }}>
          {messages.length <= 1 && (
            <div style={{ textAlign: 'center', padding: '16px 8px' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(59,130,246,0.2))', border: '1px solid rgba(168,85,247,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#a855f7' }}>
                <Globe size={20} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: '0 0 6px' }}>Sayt yaratishni boshlaylik!</p>
              <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 16px', lineHeight: 1.5 }}>📸 Rasm yuboring yoki quyidagi misollardan birini tanlang</p>
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
                {/* Image preview in message */}
                {m.imageUrl && (
                  <img src={m.imageUrl} alt="uploaded" style={{ maxWidth: 200, maxHeight: 150, borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', marginBottom: 4 }} />
                )}
                <div style={{
                  padding: '10px 14px', borderRadius: 14, fontSize: 13, lineHeight: 1.55, wordBreak: 'break-word',
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
                <div style={{ background: 'linear-gradient(135deg, #a855f7, #1e90ff)', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, fontSize: 9, fontWeight: 700, color: '#fff' }}>
                  {userInitials}
                </div>
              )}
            </div>
          ))}

          {(isGenerating || selfHealingStatus === 'healing') && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ background: 'linear-gradient(135deg, #1e90ff, #a855f7)', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot size={12} color="#fff" />
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, borderBottomLeftRadius: 4, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 5 }}>
                {selfHealingStatus === 'healing' && <span style={{ fontSize: 11, color: '#ffb830', marginRight: 4 }}>🔧</span>}
                {[0, 200, 400].map((delay, i) => (
                  <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: selfHealingStatus === 'healing' ? 'linear-gradient(135deg, #ffb830, #f97316)' : 'linear-gradient(135deg, #1e90ff, #a855f7)', display: 'inline-block', animation: `siteTypingBounce 1.3s ease-in-out ${delay}ms infinite` }} />
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

        {/* Continuation Button */}
        {Boolean(activeConfig?.has_more) && !isGenerating && (
          <button
            onClick={() => handleSend('Продолжи генерацию и добавь оставшиеся страницы и секции сайта')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '10px 16px', borderRadius: 12, marginBottom: 10,
              background: 'linear-gradient(135deg, #10d974, #1e90ff)', color: '#fff',
              border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(16,217,116,0.3)', transition: 'all 0.2s', animation: 'pulse 2s infinite'
            }}
          >
            <Zap size={16} /> ⚡ Продолжить генерацию сайта (Добавить страницы)
          </button>
        )}

        {/* Input Area */}
        <div style={{ padding: '14px 16px 16px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Image preview */}
          {pendingImage && (
            <div style={{ marginBottom: 10, position: 'relative', display: 'inline-block' }}>
              <img src={pendingImage.previewUrl} alt="preview" style={{ maxWidth: 120, maxHeight: 80, borderRadius: 8, border: '2px solid rgba(168,85,247,0.5)' }} />
              <button
                onClick={() => setPendingImage(null)}
                style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}
              >
                <X size={10} />
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, background: promptInput || pendingImage ? 'rgba(30,144,255,0.05)' : 'rgba(255,255,255,0.03)', border: `1px solid ${promptInput || pendingImage ? 'rgba(30,144,255,0.4)' : 'rgba(255,255,255,0.09)'}`, borderRadius: 14, padding: '8px 8px 8px 14px', transition: 'all 0.2s', boxShadow: promptInput ? '0 0 0 3px rgba(30,144,255,0.08)' : 'none' }}>
            <textarea
              ref={textareaRef}
              value={promptInput}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              placeholder="Saytga nimalar qo'shamiz? Yoki 📸 rasm yuboring..."
              style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: 13, resize: 'none', outline: 'none', minHeight: 48, maxHeight: 140, lineHeight: 1.5, fontFamily: 'inherit', padding: 0 }}
            />
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, flexShrink: 0, paddingBottom: 2 }}>
              {/* Image upload button */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageSelect}
              />
              <button
                onClick={() => imageInputRef.current?.click()}
                disabled={isGenerating}
                title="Rasm yuborish (Vision AI)"
                style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: pendingImage ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.07)',
                  border: `1px solid ${pendingImage ? 'rgba(168,85,247,0.6)' : 'rgba(255,255,255,0.1)'}`,
                  color: pendingImage ? '#a855f7' : '#94a3b8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: isGenerating ? 'not-allowed' : 'pointer', transition: 'all 0.2s', flexShrink: 0,
                  opacity: isGenerating ? 0.4 : 1
                }}
              >
                <ImagePlus size={14} />
              </button>

              {/* Send button */}
              <button
                onClick={() => handleSend()}
                disabled={(!promptInput.trim() && !pendingImage) || isGenerating}
                style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: ((promptInput.trim() || pendingImage) && !isGenerating) ? 'linear-gradient(135deg, #1e90ff, #a855f7)' : 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: ((promptInput.trim() || pendingImage) && !isGenerating) ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  boxShadow: ((promptInput.trim() || pendingImage) && !isGenerating) ? '0 4px 14px rgba(30,144,255,0.4)' : 'none',
                  flexShrink: 0
                }}
              >
                {isGenerating ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
              </button>
            </div>
          </div>
          <div style={{ fontSize: 10, color: '#475569', marginTop: 8, textAlign: 'center' }}>
            AI yaratgan sayt o'ng tomonda ko'rinadi • 📸 Rasm yuborib dizayn ko'rsating
          </div>
        </div>
      </div>

      {/* ===== RIGHT: LIVE PREVIEW ===== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#020617', padding: 16, gap: 12, position: 'relative' }}>
        {/* Preview Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 3 }}>
              <button 
                onClick={() => setActiveTab('code')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: activeTab === 'code' ? 600 : 400, color: activeTab === 'code' ? '#fff' : '#94a3b8', background: activeTab === 'code' ? 'rgba(30,144,255,0.2)' : 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
                <Code size={14} color={activeTab === 'code' ? '#1e90ff' : 'currentColor'} /> Code
              </button>
              <button 
                onClick={() => setActiveTab('preview')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: activeTab === 'preview' ? 600 : 400, color: activeTab === 'preview' ? '#fff' : '#94a3b8', background: activeTab === 'preview' ? 'rgba(168,85,247,0.2)' : 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
                <Globe size={14} color={activeTab === 'preview' ? '#a855f7' : 'currentColor'} /> Preview
              </button>
            </div>
            {config.source_code && (
              <span style={{ fontSize: 10, color: '#10d974', background: 'rgba(16,217,116,0.1)', border: '1px solid rgba(16,217,116,0.2)', borderRadius: 20, padding: '2px 8px' }}>
                ● Tayyor
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: 3, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', visibility: activeTab === 'preview' ? 'visible' : 'hidden' }}>
            <button onClick={() => setDeviceMode('desktop')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, fontSize: 12, border: 'none', background: deviceMode === 'desktop' ? 'rgba(30,144,255,0.2)' : 'transparent', color: deviceMode === 'desktop' ? '#1e90ff' : '#94a3b8', cursor: 'pointer', fontWeight: deviceMode === 'desktop' ? 600 : 400 }}>
              <Laptop size={14} /> Desktop
            </button>
            <button onClick={() => setDeviceMode('mobile')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, fontSize: 12, border: 'none', background: deviceMode === 'mobile' ? 'rgba(168,85,247,0.2)' : 'transparent', color: deviceMode === 'mobile' ? '#a855f7' : '#94a3b8', cursor: 'pointer', fontWeight: deviceMode === 'mobile' ? 600 : 400 }}>
              <Smartphone size={14} /> Mobile
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {saveSuccess && <span style={{ color: '#10d974', display: 'flex', alignItems: 'center', fontSize: 13, gap: 5 }}><CheckCircle size={14} /> Saqlandi!</span>}
            <button onClick={() => setIsSettingsOpen(true)} style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,0.05)', fontSize: 13, color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>
              <Sliders size={14} /> Sozlamalar
            </button>
            <button onClick={handleSave} disabled={isLoading} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, background: '#1e90ff', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer' }}>
              <Save size={14} /> {isLoading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
            <button onClick={handleOpenInNewTab} style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,0.05)', fontSize: 13, color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>
              <Eye size={14} /> Ochish
            </button>
          </div>
        </div>

        {/* Preview / Code Frame */}
        <div style={{ flex: 1, background: '#0d1526', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'code' ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e' }}>
              {/* VS Code Top File Bar */}
              <div style={{ height: 36, background: '#252526', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', borderBottom: '1px solid #333', userSelect: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1e1e1e', padding: '6px 12px', borderTop: '2px solid #007acc', fontSize: 12, color: '#cccccc', borderRight: '1px solid #333' }}>
                  <span style={{ color: '#e34c26', fontWeight: 'bold' }}>&lt;&gt;</span>
                  <span>index.html</span>
                  {isGenerating && <Loader2 size={12} style={{ animation: 'spin 1s linear infinite', color: '#1e90ff', marginLeft: 4 }} />}
                </div>
                {isGenerating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#1e90ff', background: 'rgba(30,144,255,0.1)', padding: '3px 10px', borderRadius: 12, border: '1px solid rgba(30,144,255,0.2)' }}>
                    <Sparkles size={12} style={{ animation: 'pulse 1.5s infinite' }} />
                    <span>AI kod yozmoqda...</span>
                  </div>
                )}
              </div>

              {/* Editor */}
              <div style={{ flex: 1, position: 'relative' }}>
                <Editor
                  height="100%"
                  defaultLanguage="html"
                  theme="vs-dark"
                  value={config.source_code || ''}
                  onChange={(value) => {
                    setConfig(prev => ({ ...prev, source_code: value || '' }))
                  }}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    padding: { top: 12, bottom: 12 },
                    formatOnPaste: true,
                    scrollBeyondLastLine: false,
                    smoothScrolling: true
                  }}
                />
              </div>

              {/* VS Code Bottom Status Bar */}
              <div style={{ height: 24, background: '#007acc', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px', fontSize: 11, fontWeight: 500 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <span>● Ready</span>
                  <span>UTF-8</span>
                  <span>HTML</span>
                </div>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <span>Mazaika AI Architect</span>
                </div>
              </div>
            </div>
          ) : !config.source_code ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', flexDirection: 'column', gap: 16 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(168,85,247,0.1)', border: '2px dashed rgba(168,85,247,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Globe size={36} style={{ opacity: 0.4, color: '#a855f7' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#94a3b8', margin: '0 0 8px' }}>Sayt hali yaratilmagan</p>
                <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>Chap tomondagi AI chatdan yozing yoki 📸 rasm yuboring</p>
              </div>
            </div>
          ) : deviceMode === 'desktop' ? (
            <iframe
              key={`desktop_${updateCounter}`}
              srcDoc={getSafeSourceCode(config.source_code)}
              style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
              title="Live Site Preview"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          ) : (
            <div style={{ width: 360, height: '92%', maxHeight: 720, borderRadius: 40, border: '12px solid #1e293b', background: '#000', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ height: 24, background: '#000', display: 'flex', justifyContent: 'space-between', padding: '4px 20px', fontSize: 10, color: '#94a3b8', zIndex: 10 }}>
                <span>9:41</span>
                <div style={{ width: 80, height: 12, background: '#1e293b', borderRadius: 10, marginTop: 2 }} />
                <span>100%</span>
              </div>
              <iframe
                key={`mobile_${updateCounter}`}
                srcDoc={getSafeSourceCode(config.source_code)}
                style={{ width: '100%', flex: 1, border: 'none', background: '#fff' }}
                title="Mobile Site Preview"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
              <div style={{ height: 20, background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: 120, height: 4, background: '#334155', borderRadius: 4 }} />
              </div>
            </div>
          )}
        </div>

        {/* Settings Slide-over */}
        {isSettingsOpen && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: 320, height: '100%', background: '#0f172a', borderLeft: '1px solid rgba(255,255,255,0.1)', padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>Sayt Nomi</label>
                    <input type="text" value={siteTitle} onChange={e => setSiteTitle(e.target.value)} style={{ width: '100%', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>Domen / Slug</label>
                    <input type="text" value={siteSlug} onChange={e => setSiteSlug(e.target.value)} style={{ width: '100%', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>SEO Tavsifi</label>
                    <textarea rows={4} value={siteDesc} onChange={e => setSiteDesc(e.target.value)} style={{ width: '100%', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, outline: 'none', resize: 'none' }} />
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setConfig(prev => ({ ...prev, appName: siteTitle }))
                  handleSave()
                  setIsSettingsOpen(false)
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
