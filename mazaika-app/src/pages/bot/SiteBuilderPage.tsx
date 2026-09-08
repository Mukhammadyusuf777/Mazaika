import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import {
  Globe, Save, Eye, CheckCircle, Sparkles, Bot, Loader2, Send,
  Copy, Check, RefreshCw, Zap, Laptop, Smartphone,
  Sliders, X, ImagePlus, AlertCircle, Code, ExternalLink, Cloud
} from 'lucide-react'
import Editor from '@monaco-editor/react'

import { getSiteConfig, saveSiteConfig, updateBot } from '../../api/firestore'
import { backendApi, getLiveSiteUrl } from '../../api/backendApi'
import { useChatStore } from '../../store/useChatStore'
import { useAuthStore } from '../../store/useAuthStore'
import { siteTemplates } from '../../data/siteTemplates'
import ConnectBotModal from '../../components/modals/ConnectBotModal'
import './SiteBuilderPage.css'

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
  files?: Record<string, string> // VFS files
}

const DEFAULT_CONFIG: SiteConfig = {
  appName: 'My Website',
  theme: 'glassmorphism',
  themeColor: '#00D9FF',
  blocks: [],
  source_code: '',
  files: {}
}

const getSafeSourceCode = (html: string | undefined) => {
  if (!html) return ''
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
          if (targetAttr === '_blank') return;
          e.preventDefault();
          if (href && href.startsWith('#') && href.length > 1) {
            const el = document.getElementById(href.substring(1));
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    </script>
  `
  if (html.includes('</body>')) {
    return html.replace('</body>', scriptToInject + '</body>')
  }
  return html + scriptToInject
}

export default function SiteBuilderPage() {
  const { botId } = useParams<{ botId: string }>()
  const { user } = useAuthStore()
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [siteTitle, setSiteTitle] = useState('')
  const [siteSlug, setSiteSlug] = useState('')
  const [siteDesc, setSiteDesc] = useState('')
  const [updateCounter, setUpdateCounter] = useState(0)
  const [selfHealingStatus, setSelfHealingStatus] = useState<'idle' | 'healing' | 'failed'>('idle')
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')
  const [activeFile, setActiveFile] = useState<string>('index.html')
  const [cloudflareUrl, setCloudflareUrl] = useState<string>('')
  const [isDeployingCloudflare, setIsDeployingCloudflare] = useState<boolean>(false)
  const [isConnectBotOpen, setIsConnectBotOpen] = useState<boolean>(false)

  // Image upload state
  const [pendingImage, setPendingImage] = useState<{ base64: string; mimeType: string; previewUrl: string } | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const selfHealRetryCount = useRef(0)

  const { activeConfig, chats, sendMessage, isLoading, clearMessages, projectId, setProjectId, setActiveConfig } = useChatStore()
  const messages = chats[projectId] || []
  const isGenerating = isLoading
  const activeProjectId = projectId

  const switchProject = (id: string, conf: any) => {
    setProjectId(id)
    if (conf !== null) setActiveConfig(conf)
  }

  const [promptInput, setPromptInput] = useState('')
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null)

  const generateUnifiedHtml = (files: Record<string, string> | undefined, fallbackHtml: string | undefined) => {
    if (!files || Object.keys(files).length === 0) return fallbackHtml || ''
    
    let combinedHtml = files['index.html'] || files['index.tsx'] || ''
    if (!combinedHtml) return fallbackHtml || ''

    const cssContent = files['style.css'] || files['index.css'] || files['styles.css']
    const jsContent = files['script.js'] || files['main.js'] || files['app.js']
    
    if (cssContent && combinedHtml.includes('</head>')) {
      combinedHtml = combinedHtml.replace('</head>', `<style>\n${cssContent}\n</style>\n</head>`)
    }
    
    if (jsContent && combinedHtml.includes('</body>')) {
      combinedHtml = combinedHtml.replace('</body>', `<script>\n${jsContent}\n</script>\n</body>`)
    }
    
    return combinedHtml
  }

  const handleOpenInNewTab = () => {
    if (cloudflareUrl) {
      window.open(cloudflareUrl, '_blank')
      return
    }
    if (botId) {
      window.open(getLiveSiteUrl(botId), '_blank')
      return
    }
    const htmlToOpen = generateUnifiedHtml(config.files, config.source_code)
    if (!htmlToOpen) {
      alert('Sayt hali yaratilmagan!')
      return
    }
    const blob = new Blob([htmlToOpen], { type: 'text/html;charset=utf-8' })
    const blobUrl = URL.createObjectURL(blob)
    window.open(blobUrl, '_blank')
  }

  const handlePublishCloudflare = async () => {
    if (!botId) return
    setIsDeployingCloudflare(true)
    try {
      const html = generateUnifiedHtml(config.files, config.source_code)
      const res = await backendApi.publishToCloudflare(botId, html, config.appName)
      if (res && res.url) {
        setCloudflareUrl(res.url)
        alert(res.message || `Loyiha muvaffaqiyatli nashr etildi!\nHavola: ${res.url}`)
      } else {
        const edgeUrl = getLiveSiteUrl(botId)
        setCloudflareUrl(edgeUrl)
        alert(`Loyiha Mazaika Edge serverida faol!\nHavola: ${edgeUrl}`)
      }
    } catch (err) {
      console.error('Cloudflare deploy error:', err)
      const edgeUrl = getLiveSiteUrl(botId)
      setCloudflareUrl(edgeUrl)
      alert(`Loyiha Mazaika Edge serverida faol!\nHavola: ${edgeUrl}`)
    } finally {
      setIsDeployingCloudflare(false)
    }
  }

  // Sync botId with AI context
  useEffect(() => {
    if (botId) setProjectId(botId)
  }, [botId, setProjectId])

  // Automatically switch to 'code' tab when AI starts generating
  useEffect(() => {
    if (isGenerating) {
      setActiveTab('code')
    }
  }, [isGenerating])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isGenerating])

  useEffect(() => {
    const fetchConfig = async () => {
      if (!botId) return
      setIsSaving(true)
      setConfig(DEFAULT_CONFIG)
      try {
        let data = await backendApi.getSiteConfig(botId)
        if (!data) {
          data = await getSiteConfig(botId)
        }
        if (data) {
          setConfig(data as SiteConfig)
          setSiteTitle(data.appName || '')
          if (data.cloudflareUrl) {
            setCloudflareUrl(data.cloudflareUrl)
          }
          switchProject(botId, data)
        } else {
          setConfig(DEFAULT_CONFIG)
          switchProject(botId, DEFAULT_CONFIG)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsSaving(false)
      }
    }
    fetchConfig()
  }, [botId])

  // Sync activeConfig to SiteConfig
  useEffect(() => {
    if (!activeConfig) return
    if (botId && activeProjectId !== botId) return

    const newHtml = activeConfig.source_code || activeConfig.html || ''
    if (!newHtml) return

    selfHealRetryCount.current = 0
    setSelfHealingStatus('idle')
    
    const nextConfig: SiteConfig = {
      theme: activeConfig.theme || config.theme,
      themeColor: activeConfig.themeColor || config.themeColor,
      appName: activeConfig.appName || config.appName,
      blocks: activeConfig.blocks || config.blocks,
      source_code: newHtml,
      files: activeConfig.files || config.files
    }
    
    setConfig(nextConfig)
    setUpdateCounter(c => c + 1)

    if (botId && newHtml !== config.source_code) {
      saveSiteConfig(botId, nextConfig as any).catch(console.error)
    }
  }, [activeConfig, botId, activeProjectId])

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
    e.target.value = ''
  }

  const handleSend = useCallback(async (text?: string) => {
    const msg = text || promptInput
    if (!msg.trim() || isGenerating) return
    
    const image = pendingImage
    setPromptInput('')
    setPendingImage(null)
    if (textareaRef.current) textareaRef.current.style.height = '44px'
    
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
    e.target.style.height = '44px'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const handleSave = async () => {
    if (!botId) return
    setIsSaving(true)
    try {
      await saveSiteConfig(botId, config)
      await backendApi.saveSiteConfig(botId, config, user?.id)
      if (config.appName) {
        await updateBot(botId, { name: config.appName })
      }
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (e) {
      alert('Saqlashda xatolik yuz berdi!')
    } finally {
      setIsSaving(false)
    }
  }

  const handleApplyTemplate = (tmpl: any) => {
    const files = tmpl.files || { 'index.html': tmpl.html || '' }
    const sourceHtml = files['index.html'] || tmpl.html || ''
    const newConfig: SiteConfig = {
      appName: tmpl.name,
      theme: 'glassmorphism',
      themeColor: '#00D9FF',
      blocks: [],
      source_code: sourceHtml,
      files: files
    }
    setConfig(newConfig)
    setSiteTitle(tmpl.name)
    setUpdateCounter(c => c + 1)
    setActiveTab('preview')
    if (botId) {
      saveSiteConfig(botId, newConfig as any).catch(console.error)
      updateBot(botId, { name: tmpl.name }).catch(console.error)
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
    { icon: '🚀', label: 'SaaS Landing', text: 'AI servislar uchun zamonaviy dark theme SaaS landing sahifa yarat' },
    { icon: '🎨', label: 'Obsidian Neon', text: 'Asosiy ranglarni neon cyan (#00D9FF) va dark obsidian uslubiga mosla' },
    { icon: '⚡', label: 'Animatsiya', text: 'Hero bo\'limiga chiroyli 3D kirish animatsiyalarini qo\'sh' },
    { icon: '📱', label: 'Mobil Moslashuv', text: 'Mobil qurilmalarda to\'liq qulay ko\'rinishi uchun mosla' },
    { icon: '🛒', label: 'Katalog', text: 'Mahsulotlar katalogi, narxlar jadvali va xarid tugmasini qo\'sh' },
    { icon: '📞', label: 'Aloqa & Form', text: 'Mijozlar buyurtmasi uchun chiroyli forma va Telegram tugmasini qo\'sh' }
  ]

  const renderMarkdown = (text: string) => {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      if (line.startsWith('## ')) return <p key={i} style={{ fontWeight: 700, fontSize: 13.5, color: '#FFF', margin: '8px 0 4px' }}>{line.slice(3)}</p>
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 2 }}>
            <span style={{ color: '#00D9FF', marginTop: 1, flexShrink: 0 }}>•</span>
            <span style={{ color: '#E2E8F0' }}>{line.slice(2)}</span>
          </div>
        )
      }
      if (line.trim() === '') return <div key={i} style={{ height: 4 }} />
      const parts = line.split(/(\*\*.*?\*\*)/g)
      return (
        <p key={i} style={{ margin: '2px 0', color: '#E2E8F0' }}>
          {parts.map((p, j) => p.startsWith('**') && p.endsWith('**')
            ? <strong key={j} style={{ color: '#FFF' }}>{p.slice(2, -2)}</strong>
            : p
          )}
        </p>
      )
    })
  }

  return (
    <div className="site-builder-cyber">
      {/* ===== LEFT: AI CHAT ===== */}
      <div className="sb-chat-panel">
        {/* Chat Header */}
        <div className="sb-chat-header">
          <div className="sb-brand-wrap">
            <div className="sb-brand-icon">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="sb-brand-title">
                Mazaika AI
                <span className="sb-model-tag">DeepSeek-R1</span>
              </div>
              <div className={`sb-status-indicator ${isGenerating ? 'working' : selfHealingStatus === 'healing' ? 'healing' : selfHealingStatus === 'failed' ? 'error' : 'ready'}`}>
                <span className="sb-status-dot" />
                <span>{isGenerating ? 'AI kod yozmoqda...' : selfHealingStatus === 'healing' ? 'Kodni tekshirmoqda...' : selfHealingStatus === 'failed' ? 'Xatolik yuz berdi' : 'Veb-Sayt Studiyasi Tayyor'}</span>
              </div>
            </div>
          </div>
          <div className="sb-header-actions">
            <button className="sb-header-btn" onClick={retryLast} title="Qayta yuborish" disabled={isGenerating || messages.length < 2}>
              <RefreshCw size={14} />
            </button>
            <button className="sb-header-btn" onClick={() => { if (window.confirm('Chatni tozalashni xohlaysizmi?')) clearMessages() }} title="Tozalash">
              <Zap size={14} />
            </button>
          </div>
        </div>

        {/* Self-healing alert */}
        {selfHealingStatus === 'failed' && (
          <div style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.1)', borderBottom: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#fca5a5' }}>
            <AlertCircle size={13} />
            <span>HTML kodni tuzatishda xatolik yuz berdi. Boshqa so'rov yuborib ko'ring.</span>
            <button onClick={() => setSelfHealingStatus('idle')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer' }}>
              <X size={12} />
            </button>
          </div>
        )}

        {/* Quick Presets Bar */}
        <div className="sb-presets-bar">
          {SITE_QUICK_PROMPTS.map((q, i) => (
            <button key={i} className="sb-preset-chip" onClick={() => handleSend(q.text)}>
              <span>{q.icon}</span>
              <span>{q.label}</span>
            </button>
          ))}
        </div>

        {/* Messages Stream */}
        <div className="sb-messages-stream">
          {messages.map((m) => (
            <div key={m.id} className={`sb-message-row ${m.sender === 'user' ? 'user' : 'ai'}`}>
              {m.sender === 'agent' ? (
                <div className="sb-msg-avatar ai">
                  <Bot size={14} />
                </div>
              ) : (
                <div className="sb-msg-avatar user">
                  {userInitials}
                </div>
              )}

              <div className="sb-bubble-wrap">
                {m.imageUrl && (
                  <img src={m.imageUrl} alt="uploaded visual" style={{ maxWidth: 220, maxHeight: 150, borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', marginBottom: 4 }} />
                )}
                <div className={`sb-bubble ${m.sender === 'user' ? 'user' : 'ai'}`}>
                  {m.sender === 'agent' ? renderMarkdown(m.text) : m.text}
                </div>
                {m.sender === 'agent' && (
                  <button className="sb-copy-btn" onClick={() => copyMsg(m.id, m.text)}>
                    {copiedMsgId === m.id ? <><Check size={10} /> Nusxalandi</> : <><Copy size={10} /> Nusxa olish</>}
                  </button>
                )}
              </div>
            </div>
          ))}

          {(isGenerating || selfHealingStatus === 'healing') && (
            <div className="sb-message-row ai">
              <div className="sb-msg-avatar ai">
                <Sparkles size={14} />
              </div>
              <div className="sb-typing-bubble">
                <div className="sb-typing-dots">
                  <span /><span /><span />
                </div>
                <span className="sb-typing-text">
                  {selfHealingStatus === 'healing' ? 'HTML struktura optimallashmoqda...' : 'Mazaika AI sayt kodini generatsiya qilmoqda...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Continuation Button */}
        {Boolean(activeConfig?.has_more) && !isGenerating && (
          <button
            onClick={() => handleSend('Davom ettir va qolgan bo\'limlar hamda sahifalar kodini to\'liq yoz')}
            style={{
              margin: '0 16px 10px', padding: '10px 16px', borderRadius: 12,
              background: 'rgba(0, 245, 196, 0.12)', border: '1px solid rgba(0, 245, 196, 0.3)',
              color: '#00F5C4', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
          >
            <Zap size={14} /> Generatsiyani davom ettirish (Sahifalarni qo'shish) ⚡
          </button>
        )}

        {/* Prompt Input Dock */}
        <div className="sb-input-dock">
          {pendingImage && (
            <div className="sb-image-preview-badge">
              <img src={pendingImage.previewUrl} alt="preview" />
              <button className="sb-image-preview-remove" onClick={() => setPendingImage(null)}>
                <X size={10} />
              </button>
            </div>
          )}

          <div className={`sb-input-box ${promptInput || pendingImage ? 'active' : ''}`}>
            <textarea
              ref={textareaRef}
              value={promptInput}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              placeholder={pendingImage ? "Rasm bo'yicha talablarni yozing..." : "Saytingizni tasvirlang yoki 📸 rasm yuboring..."}
              className="sb-textarea"
            />
            <div className="sb-dock-buttons">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageSelect}
              />
              <button
                className={`sb-dock-attach-btn ${pendingImage ? 'has-image' : ''}`}
                onClick={() => imageInputRef.current?.click()}
                disabled={isGenerating}
                title="Rasm yuborish (Vision AI)"
              >
                <ImagePlus size={15} />
              </button>

              <button
                className="sb-dock-send-btn"
                onClick={() => handleSend()}
                disabled={(!promptInput.trim() && !pendingImage) || isGenerating}
              >
                {isGenerating ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
              </button>
            </div>
          </div>
          <div className="sb-dock-hint">
            Mazaika AI • O'ng tomonda jonli sayt ko'rinadi
          </div>
        </div>
      </div>

      {/* ===== RIGHT: LIVE PREVIEW & CODE CANVAS ===== */}
      <div className="sb-canvas-panel">
        <div className="sb-canvas-ambient-orb cyan" />
        <div className="sb-canvas-ambient-orb violet" />

        {/* Canvas Controls Bar */}
        <div className="sb-canvas-controls">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Code / Preview Switcher */}
            <div className="sb-toggle-group">
              <button 
                className={`sb-toggle-btn ${activeTab === 'preview' ? 'active preview' : ''}`}
                onClick={() => setActiveTab('preview')}
              >
                <Globe size={14} />
                <span>Ko'rinish</span>
              </button>
              <button 
                className={`sb-toggle-btn ${activeTab === 'code' ? 'active code' : ''}`}
                onClick={() => setActiveTab('code')}
              >
                <Code size={14} />
                <span>Kod (Monaco)</span>
              </button>
            </div>

            {config.source_code && (
              <span style={{ fontSize: 11, color: '#10B981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                <span>{config.appName || 'Sayt'} Tayyor</span>
              </span>
            )}
          </div>

          {/* Desktop / Mobile Switcher */}
          {activeTab === 'preview' && (
            <div className="sb-toggle-group">
              <button 
                className={`sb-toggle-btn ${deviceMode === 'desktop' ? 'active' : ''}`}
                onClick={() => setDeviceMode('desktop')}
              >
                <Laptop size={14} />
                <span>Kompyuter</span>
              </button>
              <button 
                className={`sb-toggle-btn ${deviceMode === 'mobile' ? 'active' : ''}`}
                onClick={() => setDeviceMode('mobile')}
              >
                <Smartphone size={14} />
                <span>Telefon</span>
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="sb-canvas-actions">
            {saveSuccess && (
              <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', fontSize: 12, gap: 5, fontWeight: 600 }}>
                <CheckCircle size={14} /> Saqlandi!
              </span>
            )}
            <button className="sb-action-btn" onClick={() => setIsSettingsOpen(true)}>
              <Sliders size={14} />
              <span>Sozlamalar</span>
            </button>
            <button className="sb-action-btn primary" onClick={handleSave} disabled={isSaving}>
              <Save size={14} />
              <span>{isSaving ? 'Saqlanmoqda...' : 'Saqlash'}</span>
            </button>
            <button 
              className={`sb-action-btn cloudflare-btn ${isDeployingCloudflare ? 'deploying' : ''}`}
              onClick={handlePublishCloudflare}
              disabled={isDeployingCloudflare}
              title={cloudflareUrl ? `Cloudflare Pages: ${cloudflareUrl}` : "Cloudflare Pages va Mazaika Edge-ga 1-klik bilan nashr qilish"}
            >
              {isDeployingCloudflare ? (
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Cloud size={14} />
              )}
              <span>{isDeployingCloudflare ? 'Nashr qilinmoqda...' : cloudflareUrl ? 'Cloudflare Pages' : 'Cloudflare Deploy'}</span>
              <span className="edge-live-dot" title="Mazaika Edge Server Faol" />
            </button>
            <button 
              className="sb-action-btn connect-bot-btn" 
              onClick={() => setIsConnectBotOpen(true)}
              title="Saytni Telegram Botga ulash va Mini App qilish ($0 bepul)"
              style={{ background: 'linear-gradient(135deg, rgba(0,245,196,0.18) 0%, rgba(30,144,255,0.18) 100%)', borderColor: 'rgba(0,245,196,0.4)', color: '#00F5C4', fontWeight: 600 }}
            >
              <Smartphone size={14} />
              <span>Botga ulash (Mini App)</span>
            </button>
            <button className="sb-action-btn" onClick={handleOpenInNewTab}>
              <Eye size={14} />
              <span>Ochish</span>
            </button>
          </div>
        </div>

        {/* Main Canvas Frame */}
        <div className="sb-main-frame">
          {activeTab === 'code' ? (
            /* Monaco Code Editor */
            <div style={{ width: '100%', height: '100%', display: 'flex', background: '#0B0E17' }}>
              {/* Explorer Sidebar */}
              <div style={{ width: 220, borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', background: '#090B12' }}>
                <div style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span>Fayllar (VFS)</span>
                  <button 
                    onClick={() => {
                      const name = window.prompt('Fayl nomini kiriting (masalan, style.css):')
                      if (name && name.trim()) {
                        const fileName = name.trim()
                        if (!config.files?.[fileName]) {
                          setConfig(prev => ({
                            ...prev,
                            files: { ...(prev.files || {}), [fileName]: '' }
                          }))
                          setActiveFile(fileName)
                        } else {
                          alert('Bunday fayl allaqachon mavjud!')
                        }
                      }
                    }}
                    style={{ background: 'none', border: 'none', color: '#00D9FF', cursor: 'pointer', fontSize: 14, fontWeight: 'bold' }}
                    title="Yangi fayl qo'shish"
                  >
                    +
                  </button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                  {Object.keys(config.files || { 'index.html': config.source_code || '' }).map(fileName => (
                    <div 
                      key={fileName}
                      onClick={() => setActiveFile(fileName)}
                      style={{ 
                        padding: '8px 16px', 
                        fontSize: 12.5, 
                        color: activeFile === fileName ? '#FFF' : '#94A3B8',
                        background: activeFile === fileName ? 'rgba(0,217,255,0.1)' : 'transparent',
                        borderLeft: activeFile === fileName ? '3px solid #00D9FF' : '3px solid transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all 0.15s'
                      }}
                    >
                      <span style={{ color: fileName.endsWith('.html') ? '#E34C26' : fileName.endsWith('.css') ? '#264DE4' : fileName.endsWith('.js') ? '#F7DF1E' : '#94A3B8' }}>
                        {fileName.endsWith('.js') ? '{}' : fileName.endsWith('.css') ? '#' : '<>'}
                      </span>
                      <span>{fileName}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editor Workspace */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ height: 38, background: '#090B12', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#00D9FF', fontWeight: 600 }}>
                    <span>{activeFile}</span>
                    {isGenerating && <Loader2 size={12} style={{ animation: 'spin 1s linear infinite', marginLeft: 4 }} />}
                  </div>
                  {isGenerating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#00D9FF', background: 'rgba(0,217,255,0.1)', padding: '3px 10px', borderRadius: 12 }}>
                      <Sparkles size={12} />
                      <span>AI kod yozmoqda...</span>
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, position: 'relative' }}>
                  <Editor
                    height="100%"
                    language={activeFile.endsWith('.html') ? 'html' : activeFile.endsWith('.css') ? 'css' : activeFile.endsWith('.js') ? 'javascript' : 'plaintext'}
                    theme="vs-dark"
                    value={config.files ? (config.files[activeFile] || '') : (activeFile === 'index.html' ? config.source_code || '' : '')}
                    onChange={(value) => {
                      const files = config.files || { 'index.html': config.source_code || '' }
                      setConfig(prev => ({
                        ...prev,
                        files: {
                          ...files,
                          [activeFile]: value || ''
                        },
                        source_code: activeFile === 'index.html' ? (value || '') : prev.source_code
                      }))
                    }}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13.5,
                      wordWrap: 'on',
                      padding: { top: 12, bottom: 12 },
                      formatOnPaste: true,
                      scrollBeyondLastLine: false,
                      smoothScrolling: true
                    }}
                  />
                </div>
              </div>
            </div>
          ) : !Boolean(generateUnifiedHtml(config.files, config.source_code)?.trim()?.length > 30) ? (
            /* HOLOGRAPHIC WEBSITE STUDIO HUB (When empty - Solves Screenshot 3) */
            <div className="sb-empty-hub">
              <div className="sb-hub-center">
                <div className="sb-hub-icon-badge">
                  <Globe size={38} />
                </div>

                <h2 className="sb-hub-title">Mazaika AI Veb-Sayt Studiyasi</h2>

                <p className="sb-hub-subtitle">
                  Chatda o'z saytingiz g'oyasini yozing yoki pastdagi tayyor shablonlardan birini tanlang. 
                  DeepSeek-R1 1 daqiqada to'liq veb-sahifa, Tailwind dizayni va interaktiv kodni yaratadi.
                </p>

                {/* 4 1-Click Starter Cards */}
                <div className="sb-starters-grid">
                  {siteTemplates.map(tmpl => (
                    <div 
                      key={tmpl.id}
                      className="sb-starter-card"
                      onClick={() => handleApplyTemplate(tmpl)}
                    >
                      <div className="sb-card-header">
                        <span className="sb-card-emoji">{tmpl.icon || '🚀'}</span>
                        <span className={`sb-card-badge ${tmpl.id === 'saas-landing' ? '' : tmpl.id === 'agency' ? 'purple' : tmpl.id === 'portfolio' ? 'green' : 'amber'}`}>
                          {tmpl.category}
                        </span>
                      </div>
                      <div className="sb-card-title">{tmpl.name}</div>
                      <p className="sb-card-desc">{tmpl.description}</p>
                      <div className="sb-card-cta">
                        <span>Bir klikda ochish</span>
                        <ExternalLink size={13} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="sb-hub-tips">
                  <div className="sb-tip-item"><Sparkles size={14} color="#00D9FF" /> 1 daqiqada tayyor sayt</div>
                  <div className="sb-tip-item"><Laptop size={14} color="#00F5C4" /> Tailwind CSS & Responsiv dizayn</div>
                  <div className="sb-tip-item"><Code size={14} color="#A78BFA" /> Monaco Editor & Erkin kod tahrirlash</div>
                </div>
              </div>
            </div>
          ) : deviceMode === 'desktop' ? (
            /* macOS Desktop Browser Frame */
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
              <div className="sb-browser-header">
                <div className="sb-traffic-lights">
                  <div className="sb-dot red" />
                  <div className="sb-dot yellow" />
                  <div className="sb-dot green" />
                </div>
                <div className="sb-browser-url-bar">
                  <span className="lock">🔒</span>
                  <span>{cloudflareUrl || (botId ? getLiveSiteUrl(botId) : 'https://mazaika.app/sites/preview')}</span>
                </div>
                <div className="sb-browser-actions">
                  <button onClick={() => setUpdateCounter(c => c + 1)} title="Qayta yuklash" style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                    <RefreshCw size={13} />
                  </button>
                </div>
              </div>
              <div className="sb-preview-viewport">
                <iframe
                  key={`desktop_${updateCounter}`}
                  srcDoc={getSafeSourceCode(generateUnifiedHtml(config.files, config.source_code))}
                  className="sb-site-iframe"
                  title="Live Site Preview"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              </div>
            </div>
          ) : (
            /* Mobile Device Frame */
            <div className="sb-mobile-wrapper">
              <div className="sb-mobile-phone">
                <div className="sb-mobile-notch">
                  <span>9:41</span>
                  <span>📶 🔋</span>
                </div>
                <iframe
                  key={`mobile_${updateCounter}`}
                  srcDoc={getSafeSourceCode(generateUnifiedHtml(config.files, config.source_code))}
                  style={{ width: '100%', flex: 1, border: 'none', background: '#0B0E17' }}
                  title="Mobile Site Preview"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
                <div className="sb-mobile-home-bar">
                  <div className="sb-mobile-home-bar-pill" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings Slide-over */}
        {isSettingsOpen && (
          <div className="sb-settings-overlay" onClick={() => setIsSettingsOpen(false)}>
            <div className="sb-settings-drawer" onClick={e => e.stopPropagation()}>
              <div>
                <div className="sb-settings-header">
                  <h3>
                    <Sliders size={18} style={{ color: '#00D9FF' }} />
                    <span>Sayt Sozlamalari</span>
                  </h3>
                  <button onClick={() => setIsSettingsOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>

                <div className="sb-settings-fields">
                  <div className="sb-form-group">
                    <label>Sayt Nomi</label>
                    <input type="text" value={siteTitle} onChange={e => setSiteTitle(e.target.value)} />
                  </div>
                  <div className="sb-form-group">
                    <label>Domen / Slug</label>
                    <input type="text" value={siteSlug} onChange={e => setSiteSlug(e.target.value)} placeholder="masalan: meningsaytim" />
                  </div>
                  <div className="sb-form-group">
                    <label>SEO Tavsifi</label>
                    <textarea rows={4} value={siteDesc} onChange={e => setSiteDesc(e.target.value)} placeholder="Qidiruv tizimlari uchun tavsif..." />
                  </div>
                </div>
              </div>

              <button
                className="sb-settings-save-btn"
                onClick={() => {
                  setConfig(prev => ({ ...prev, appName: siteTitle }))
                  handleSave()
                  setIsSettingsOpen(false)
                }}
              >
                O'zgarishlarni Saqlash
              </button>
            </div>
          </div>
        )}

        {/* Connect Bot Modal */}
        <ConnectBotModal
          isOpen={isConnectBotOpen}
          onClose={() => setIsConnectBotOpen(false)}
          siteId={botId || ''}
          siteName={config.appName || siteTitle || 'Mening Saytim'}
          siteUrl={cloudflareUrl || (botId ? getLiveSiteUrl(botId) : undefined)}
          onSuccess={(connectedBotId, connectedBotName) => {
            console.log(`Connected site ${botId} to bot ${connectedBotId} (${connectedBotName})`)
          }}
        />
      </div>
    </div>
  )
}
