import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import {
  Globe, Save, Eye, CheckCircle, Sparkles, Bot, Loader2, Send,
  Copy, Check, RefreshCw, Zap, Laptop, Smartphone, Tablet, RotateCcw,
  Sliders, X, ImagePlus, AlertCircle, Code, ExternalLink, Cloud,
  Mic, MicOff, Target, Download, Trash2, Edit3
} from 'lucide-react'
import Editor from '@monaco-editor/react'

import { getSiteConfig, saveSiteConfig, updateBot } from '../../api/firestore'
import { backendApi, getLiveSiteUrl } from '../../api/backendApi'
import { useChatStore } from '../../store/useChatStore'
import { useAuthStore } from '../../store/useAuthStore'
import { siteTemplates } from '../../data/siteTemplates'
import { exportProjectToZip } from '../../utils/zipExport'
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
  appName: 'Мой Веб-сайт',
  theme: 'glassmorphism',
  themeColor: '#00D9FF',
  blocks: [],
  source_code: '',
  files: {}
}

const getSafeSourceCode = (html: string | undefined, isInspectorActive = false) => {
  if (!html) return ''
  let scriptToInject = `
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

  if (isInspectorActive) {
    scriptToInject += `
      <style id="mz-inspector-styles">
        .__mz-hover {
          outline: 2px dashed #00F5C4 !important;
          outline-offset: 3px !important;
          cursor: crosshair !important;
          transition: outline 0.1s ease !important;
        }
        .__mz-active {
          outline: 3px solid #1E90FF !important;
          outline-offset: 3px !important;
          box-shadow: 0 0 25px rgba(30,144,255,0.7) !important;
        }
        .__mz-pill {
          position: fixed;
          background: #00F5C4;
          color: #030712;
          font-family: monospace;
          font-size: 11px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 4px;
          pointer-events: none;
          z-index: 2147483647;
          box-shadow: 0 4px 14px rgba(0,0,0,0.6);
          letter-spacing: 0.5px;
        }
      </style>
      <script id="mz-inspector-script">
        (function() {
          var currentHover = null;
          var pill = null;
          function updatePill(el) {
            if (!pill) {
              pill = document.createElement('div');
              pill.className = '__mz-pill';
              document.body.appendChild(pill);
            }
            var r = el.getBoundingClientRect();
            pill.textContent = '<' + el.tagName.toLowerCase() + '>';
            pill.style.top = Math.max(6, r.top - 26) + 'px';
            pill.style.left = Math.max(6, r.left) + 'px';
            pill.style.display = 'block';
          }
          function removePill() {
            if (pill) pill.style.display = 'none';
          }
          document.addEventListener('mouseover', function(e) {
            if (!e.target || e.target === document.body || e.target === document.documentElement || (e.target.closest && e.target.closest('.__mz-pill'))) return;
            if (currentHover && currentHover !== e.target) {
              currentHover.classList.remove('__mz-hover');
            }
            currentHover = e.target;
            currentHover.classList.add('__mz-hover');
            updatePill(currentHover);
          }, true);
          document.addEventListener('mouseout', function(e) {
            if (currentHover) {
              currentHover.classList.remove('__mz-hover');
              currentHover = null;
            }
            removePill();
          }, true);
          document.addEventListener('click', function(e) {
            if (!e.target || e.target === document.body || e.target === document.documentElement) return;
            e.preventDefault();
            e.stopPropagation();
            document.querySelectorAll('.__mz-active').forEach(function(el) {
              el.classList.remove('__mz-active');
            });
            e.target.classList.add('__mz-active');
            var txt = (e.target.innerText || '').trim();
            window.parent.postMessage({
              type: 'MAZAIKA_INSPECTOR_SELECT',
              tagName: e.target.tagName,
              innerText: txt.slice(0, 300),
              outerHtml: e.target.outerHTML
            }, '*');
          }, true);
        })();
      </script>
    `
  }

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
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile' | 'tablet'>('desktop')
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [siteTitle, setSiteTitle] = useState('')
  const [siteSlug, setSiteSlug] = useState('')
  const [siteDesc, setSiteDesc] = useState('')
  const [updateCounter, setUpdateCounter] = useState(0)
  const [selfHealingStatus, setSelfHealingStatus] = useState<'idle' | 'healing' | 'failed'>('idle')
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'split'>('preview')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [activeFile, setActiveFile] = useState<string>('index.html')
  const [cloudflareUrl, setCloudflareUrl] = useState<string>('')
  const [isDeployingCloudflare, setIsDeployingCloudflare] = useState<boolean>(false)
  const [isConnectBotOpen, setIsConnectBotOpen] = useState<boolean>(false)
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false)

  // AI Visual Inspector State
  const [isInspectorActive, setIsInspectorActive] = useState<boolean>(false)
  const [inspectedElement, setInspectedElement] = useState<{
    tagName: string
    innerText: string
    outerHtml: string
  } | null>(null)
  const [inspectorDirectText, setInspectorDirectText] = useState<string>('')
  const [inspectorEditPrompt, setInspectorEditPrompt] = useState<string>('')

  // AI Voice Input State
  const [isListening, setIsListening] = useState<boolean>(false)
  const recognitionRef = useRef<any>(null)

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

  // Listen for Inspector message from iframe
  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data && e.data.type === 'MAZAIKA_INSPECTOR_SELECT') {
        setInspectedElement({
          tagName: e.data.tagName || 'DIV',
          innerText: e.data.innerText || '',
          outerHtml: e.data.outerHtml || ''
        })
        setInspectorDirectText(e.data.innerText || '')
        setInspectorEditPrompt('')
      }
    }
    window.addEventListener('message', handleMsg)
    return () => window.removeEventListener('message', handleMsg)
  }, [])

  // Toggle Voice Input ($0.00 Web Speech API)
  const toggleVoiceInput = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRec) {
      setToast({ message: 'Голосовой ввод не поддерживается браузером (рекомендуется Chrome/Edge)', type: 'error' })
      setTimeout(() => setToast(null), 3000)
      return
    }
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsListening(false)
      return
    }
    try {
      const recognition = new SpeechRec()
      recognition.lang = 'ru-RU'
      recognition.continuous = false
      recognition.interimResults = false
      recognition.onstart = () => {
        setIsListening(true)
        setToast({ message: 'Слушаю вас... Говорите описание сайта', type: 'info' })
      }
      recognition.onend = () => {
        setIsListening(false)
      }
      recognition.onerror = (err: any) => {
        console.error('Speech recognition error:', err)
        setIsListening(false)
      }
      recognition.onresult = (evt: any) => {
        const transcript = evt.results?.[0]?.[0]?.transcript
        if (transcript) {
          setPromptInput(prev => (prev ? prev + ' ' + transcript : transcript))
          setToast({ message: `Распознано: "${transcript}"`, type: 'success' })
          setTimeout(() => setToast(null), 3000)
        }
      }
      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      console.error('Voice start failed', err)
      setIsListening(false)
    }
  }

  // Handle ZIP Export
  const handleExportZip = async () => {
    setIsExportingZip(true)
    try {
      const html = generateUnifiedHtml(config.files, config.source_code)
      await exportProjectToZip({
        appName: config.appName || siteTitle || 'mazaika-site',
        sourceCode: html,
        files: config.files,
        botToken: 'YOUR_BOT_TOKEN_HERE'
      })
      setToast({ message: 'Проект успешно экспортирован в ZIP архив!', type: 'success' })
      setTimeout(() => setToast(null), 4000)
    } catch (e) {
      console.error('Export zip failed:', e)
      setToast({ message: 'Ошибка при экспорте ZIP архива', type: 'error' })
      setTimeout(() => setToast(null), 4000)
    } finally {
      setIsExportingZip(false)
    }
  }

  // Apply Direct Text Edit in Inspector
  const handleApplyDirectText = () => {
    if (!inspectedElement || !inspectedElement.innerText || !inspectorDirectText.trim()) return
    const currentHtml = generateUnifiedHtml(config.files, config.source_code)
    if (currentHtml.includes(inspectedElement.innerText)) {
      const updatedHtml = currentHtml.replace(inspectedElement.innerText, inspectorDirectText.trim())
      const files = config.files ? { ...config.files, 'index.html': updatedHtml } : undefined
      setConfig(prev => ({
        ...prev,
        source_code: updatedHtml,
        files: files || prev.files
      }))
      setUpdateCounter(c => c + 1)
      setToast({ message: 'Текст элемента успешно изменен!', type: 'success' })
      setTimeout(() => setToast(null), 3000)
      setInspectedElement(null)
    } else {
      setToast({ message: 'Текст не найден напрямую. Отправляем запрос AI...', type: 'info' })
      handleSend(`Замени текст "${inspectedElement.innerText}" на "${inspectorDirectText.trim()}"`)
      setInspectedElement(null)
    }
  }

  // Apply AI Edit to Inspected Element
  const handleApplyAIElem = () => {
    if (!inspectedElement || !inspectorEditPrompt.trim()) return
    const p = `В элементе <${inspectedElement.tagName}> с содержимым "${inspectedElement.innerText}": ${inspectorEditPrompt.trim()}`
    handleSend(p)
    setInspectedElement(null)
  }

  // Delete Inspected Element
  const handleDeleteInspectedElement = () => {
    if (!inspectedElement) return
    const currentHtml = generateUnifiedHtml(config.files, config.source_code)
    if (inspectedElement.outerHtml && currentHtml.includes(inspectedElement.outerHtml)) {
      const updatedHtml = currentHtml.replace(inspectedElement.outerHtml, '')
      const files = config.files ? { ...config.files, 'index.html': updatedHtml } : undefined
      setConfig(prev => ({
        ...prev,
        source_code: updatedHtml,
        files: files || prev.files
      }))
      setUpdateCounter(c => c + 1)
      setToast({ message: 'Элемент удален из структуры сайта!', type: 'success' })
      setTimeout(() => setToast(null), 3000)
      setInspectedElement(null)
    } else {
      handleSend(`Удали блок <${inspectedElement.tagName}> с текстом "${inspectedElement.innerText}" из разметки`)
      setInspectedElement(null)
    }
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
      alert('Сайт еще не создан!')
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
        setToast({ message: `Сайт успешно опубликован на Cloudflare! Ссылка: ${res.url}`, type: 'success' })
      } else {
        const edgeUrl = getLiveSiteUrl(botId)
        setCloudflareUrl(edgeUrl)
        setToast({ message: `Сайт активен на сервере Mazaika Edge! Ссылка: ${edgeUrl}`, type: 'success' })
      }
    } catch (err) {
      console.error('Cloudflare deploy error:', err)
      const edgeUrl = getLiveSiteUrl(botId)
      setCloudflareUrl(edgeUrl)
      setToast({ message: `Сайт активен на сервере Mazaika Edge! Ссылка: ${edgeUrl}`, type: 'success' })
    } finally {
      setIsDeployingCloudflare(false)
    }
  }

  // Sync botId with AI context
  useEffect(() => {
    if (botId) setProjectId(botId)
  }, [botId, setProjectId])

  // Track generation completion to automatically switch back to 'preview'
  const wasGeneratingRef = useRef(false)
  useEffect(() => {
    if (isGenerating) {
      wasGeneratingRef.current = true
    } else if (wasGeneratingRef.current) {
      wasGeneratingRef.current = false
      setActiveTab('preview') // Always return to visual preview!
      setToast({ message: 'Сайт успешно сгенерирован и готов к просмотру!', type: 'success' })
      setTimeout(() => setToast(null), 4000)
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
      alert('Принимаются только изображения (jpg, png, gif, webp)')
      return
    }
    try {
      const { compressImage } = await import('../../utils/imageUtils')
      const compressed = await compressImage(file)
      setPendingImage(compressed)
    } catch (err) {
      setToast({ message: 'Ошибка при загрузке изображения', type: 'error' })
      setTimeout(() => setToast(null), 3000)
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

    const currentCode = config?.source_code || ''
    const hasExistingCode = currentCode.trim().length > 50
    const isExplicitNew = /(yarat|tuz|yangi|boshla|sozla|qur|создай|сделай|разработай|новый|с нуля|сгенерируй|create|build|generate|new|start)/i.test(msg)
    const isExplicitEdit = /(o'zgartir|qo'sh|rang|almashtir|tahrirla|yangila|olib tashla|o'chir|tuzat|измени|поменяй|добавь|удали|исправь|обнови|перекрась|edit|change|update|modify|add|remove|fix)/i.test(msg)

    const mode: 'FULL_GENERATION' | 'PATCH' = (hasExistingCode && (isExplicitEdit || !isExplicitNew))
      ? 'PATCH'
      : 'FULL_GENERATION'
    
    await sendMessage(
      msg,
      mode,
      'site_only',
      image?.base64,
      image?.mimeType
    )
  }, [promptInput, pendingImage, isGenerating, sendMessage, config])

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
      setToast({ message: 'Сайт успешно сохранен!', type: 'success' })
      setTimeout(() => {
        setSaveSuccess(false)
        setToast(null)
      }, 3000)
    } catch (e) {
      setToast({ message: 'Ошибка при сохранении!', type: 'error' })
      setTimeout(() => setToast(null), 3000)
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
    { icon: '🚀', label: 'SaaS Лендинг', text: 'Создай современный темный SaaS лендинг для AI сервисов с неоновыми акцентами' },
    { icon: '🎨', label: 'Неон & Обсидиан', text: 'Оформи сайт в стильном стиле темного обсидиана с неоновым цианом (#00D9FF)' },
    { icon: '⚡', label: '3D Анимации', text: 'Добавь плавные 3D эффекты и интерактивные анимации в Hero секцию' },
    { icon: '📱', label: 'Мобильный UI', text: 'Адаптируй все элементы под мобильные устройства и сенсорные экраны' },
    { icon: '🛒', label: 'Каталог товаров', text: 'Добавь сетку каталога товаров с карточками, ценами и кнопкой заказа' },
    { icon: '📞', label: 'Форма & Telegram', text: 'Добавь форму обратной связи и кнопку прямого перехода в Telegram' }
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

  const unifiedHtmlContent = generateUnifiedHtml(config.files, config.source_code)
  const safeIframeCode = getSafeSourceCode(unifiedHtmlContent, isInspectorActive)

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
                <span>{isGenerating ? 'AI генерирует сайт...' : selfHealingStatus === 'healing' ? 'Проверка и оптимизация кода...' : selfHealingStatus === 'failed' ? 'Произошла ошибка' : 'Студия веб-сайтов готова'}</span>
              </div>
            </div>
          </div>
          <div className="sb-header-actions">
            <button className="sb-header-btn" onClick={retryLast} title="Повторить" disabled={isGenerating || messages.length < 2}>
              <RefreshCw size={14} />
            </button>
            <button className="sb-header-btn" onClick={() => { if (window.confirm('Вы уверены, что хотите очистить чат?')) clearMessages() }} title="Очистить чат">
              <Zap size={14} />
            </button>
          </div>
        </div>

        {/* Self-healing alert */}
        {selfHealingStatus === 'failed' && (
          <div style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.1)', borderBottom: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#fca5a5' }}>
            <AlertCircle size={13} />
            <span>При генерации разметки возникла ошибка. Попробуйте уточнить запрос.</span>
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
                    {copiedMsgId === m.id ? <><Check size={10} /> Скопировано</> : <><Copy size={10} /> Копировать</>}
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
                  {selfHealingStatus === 'healing' ? 'Оптимизация HTML структуры...' : 'Mazaika AI генерирует исходный код сайта...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Continuation Button */}
        {Boolean(activeConfig?.has_more) && !isGenerating && (
          <button
            onClick={() => handleSend('Продолжи генерацию и напиши остальные секции и страницы полностью')}
            style={{
              margin: '0 16px 10px', padding: '10px 16px', borderRadius: 12,
              background: 'rgba(0, 245, 196, 0.12)', border: '1px solid rgba(0, 245, 196, 0.3)',
              color: '#00F5C4', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
          >
            <Zap size={14} /> Продолжить генерацию (Добавить страницы) ⚡
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
              placeholder={pendingImage ? "Опишите требования по фото..." : "Опишите ваш сайт или отправьте 📸 фото референса..."}
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
                type="button"
                className={`sb-dock-attach-btn ${pendingImage ? 'has-image' : ''}`}
                onClick={() => imageInputRef.current?.click()}
                disabled={isGenerating}
                title="Отправить изображение (Vision AI)"
              >
                <ImagePlus size={15} />
              </button>

              {/* Free Voice Input Button */}
              <button
                type="button"
                className={`sb-dock-mic-btn ${isListening ? 'listening' : ''}`}
                onClick={toggleVoiceInput}
                disabled={isGenerating}
                title={isListening ? "Идет запись... Нажмите, чтобы остановить" : "Голосовой ввод (Русский язык, $0.00)"}
              >
                {isListening ? <MicOff size={15} /> : <Mic size={15} />}
              </button>

              <button
                type="button"
                className="sb-dock-send-btn"
                onClick={() => handleSend()}
                disabled={(!promptInput.trim() && !pendingImage) || isGenerating}
                title="Отправить запрос AI"
              >
                {isGenerating ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
              </button>
            </div>
          </div>
          <div className="sb-dock-hint">
            Mazaika AI • Интерактивный живой сайт отображается справа
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
            {/* Code / Preview / Split Switcher */}
            <div className="sb-toggle-group">
              <button 
                className={`sb-toggle-btn ${activeTab === 'preview' ? 'active preview' : ''}`}
                onClick={() => setActiveTab('preview')}
                title="Визуальный интерактивный предпросмотр сайта"
              >
                <Globe size={14} />
                <span>Предпросмотр</span>
              </button>
              <button 
                className={`sb-toggle-btn ${activeTab === 'code' ? 'active code' : ''}`}
                onClick={() => setActiveTab('code')}
                title="Редактор исходного HTML/CSS/JS кода"
              >
                <Code size={14} />
                <span>Код</span>
              </button>
              <button 
                className={`sb-toggle-btn split ${activeTab === 'split' ? 'active' : ''}`}
                onClick={() => setActiveTab('split')}
                title="Код и предпросмотр бок о бок на одном экране"
              >
                <Zap size={14} />
                <span>Сплит</span>
              </button>
            </div>

            {config.source_code && (
              <span style={{ fontSize: 11, color: '#10B981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                <span>{config.appName || 'Сайт'} готов</span>
              </span>
            )}
          </div>

          {/* Device Simulator Switcher */}
          {activeTab === 'preview' && (
            <div className="sb-toggle-group">
              <button 
                className={`sb-toggle-btn ${deviceMode === 'desktop' ? 'active' : ''}`}
                onClick={() => setDeviceMode('desktop')}
                title="Компьютер / Десктоп"
              >
                <Laptop size={14} />
                <span>Компьютер</span>
              </button>
              <button 
                className={`sb-toggle-btn ${deviceMode === 'mobile' ? 'active' : ''}`}
                onClick={() => setDeviceMode('mobile')}
                title="iPhone 16 Pro (Симулятор смартфона)"
              >
                <Smartphone size={14} />
                <span>iPhone 16 Pro</span>
              </button>
              <button 
                className={`sb-toggle-btn ${deviceMode === 'tablet' ? 'active' : ''}`}
                onClick={() => setDeviceMode('tablet')}
                title="iPad Pro (Симулятор планшета)"
              >
                <Tablet size={14} />
                <span>iPad Pro</span>
              </button>
              {deviceMode !== 'desktop' && (
                <button 
                  className="sb-toggle-btn orientation-btn"
                  onClick={() => setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait')}
                  title={orientation === 'portrait' ? "Переключить в горизонтальный альбомный режим" : "Переключить в портретный вертикальный режим"}
                >
                  <RotateCcw size={13} />
                  <span>{orientation === 'portrait' ? 'Вертикально' : 'Горизонтально'}</span>
                </button>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="sb-canvas-actions">
            {saveSuccess && (
              <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', fontSize: 12, gap: 5, fontWeight: 600 }}>
                <CheckCircle size={14} /> Сохранено!
              </span>
            )}

            {/* AI Visual Inspector Toggle */}
            <button 
              className={`sb-action-btn inspector-btn ${isInspectorActive ? 'active' : ''}`}
              onClick={() => {
                setIsInspectorActive(!isInspectorActive)
                setInspectedElement(null)
              }}
              title="Нажмите на любой элемент сайта в предпросмотре для редактирования текста или удаления"
            >
              <Target size={14} />
              <span>{isInspectorActive ? 'Инспектор Вкл' : 'Инспектор'}</span>
            </button>

            {/* ZIP Project Export */}
            <button 
              className="sb-action-btn zip-export-btn"
              onClick={handleExportZip}
              disabled={isExportingZip}
              title="Скачать весь исходный код проекта с PWA и автономным ботом ($0.00)"
            >
              {isExportingZip ? (
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Download size={14} />
              )}
              <span>{isExportingZip ? 'Сборка...' : 'Экспорт ZIP'}</span>
            </button>

            <button className="sb-action-btn" onClick={() => setIsSettingsOpen(true)}>
              <Sliders size={14} />
              <span>Настройки</span>
            </button>

            <button className="sb-action-btn primary" onClick={handleSave} disabled={isSaving}>
              <Save size={14} />
              <span>{isSaving ? 'Сохранение...' : 'Сохранить'}</span>
            </button>

            <button 
              className={`sb-action-btn cloudflare-btn ${isDeployingCloudflare ? 'deploying' : ''}`}
              onClick={handlePublishCloudflare}
              disabled={isDeployingCloudflare}
              title={cloudflareUrl ? `Cloudflare Pages: ${cloudflareUrl}` : "Cloudflare Pages и Mazaika Edge публикация в 1 клик"}
            >
              {isDeployingCloudflare ? (
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Cloud size={14} />
              )}
              <span>{isDeployingCloudflare ? 'Публикация...' : cloudflareUrl ? 'Cloudflare Pages' : 'Cloudflare Deploy'}</span>
              <span className="edge-live-dot" title="Mazaika Edge Server активен" />
            </button>

            <button 
              className="sb-action-btn connect-bot-btn" 
              onClick={() => setIsConnectBotOpen(true)}
              title="Подключить сайт к Telegram боту как интерактивное Mini App ($0.00)"
              style={{ background: 'linear-gradient(135deg, rgba(0,245,196,0.18) 0%, rgba(30,144,255,0.18) 100%)', borderColor: 'rgba(0,245,196,0.4)', color: '#00F5C4', fontWeight: 600 }}
            >
              <Smartphone size={14} />
              <span>Подключить к боту (Mini App)</span>
            </button>

            <button className="sb-action-btn" onClick={handleOpenInNewTab}>
              <Eye size={14} />
              <span>Открыть</span>
            </button>
          </div>
        </div>

        {/* Main Canvas Frame */}
        <div className="sb-main-frame">
          {/* Floating AI Visual Inspector HUD Card */}
          {isInspectorActive && inspectedElement && (
            <div className="sb-inspector-hud">
              <div className="sb-hud-header">
                <div className="sb-hud-tag-info">
                  <span className="sb-hud-tag-badge">&lt;{inspectedElement.tagName.toLowerCase()}&gt;</span>
                  {inspectedElement.innerText && (
                    <span className="sb-hud-tag-text-preview" title={inspectedElement.innerText}>
                      "{inspectedElement.innerText.slice(0, 35)}{inspectedElement.innerText.length > 35 ? '...' : ''}"
                    </span>
                  )}
                </div>
                <button className="sb-hud-close" onClick={() => setInspectedElement(null)} title="Закрыть">
                  <X size={14} />
                </button>
              </div>

              <div className="sb-hud-body">
                {/* 1. Direct text editing */}
                {inspectedElement.innerText && (
                  <div className="sb-hud-field-group">
                    <label className="sb-hud-label">
                      <Edit3 size={12} /> Изменить текст напрямую:
                    </label>
                    <div className="sb-hud-input-row">
                      <input 
                        type="text" 
                        value={inspectorDirectText} 
                        onChange={e => setInspectorDirectText(e.target.value)}
                        placeholder="Новый текст..."
                        className="sb-hud-input"
                      />
                      <button onClick={handleApplyDirectText} className="sb-hud-apply-btn">
                        Применить
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. AI element modification */}
                <div className="sb-hud-field-group">
                  <label className="sb-hud-label">
                    <Sparkles size={12} /> Изменить блок с помощью AI:
                  </label>
                  <div className="sb-hud-input-row">
                    <input 
                      type="text" 
                      value={inspectorEditPrompt} 
                      onChange={e => setInspectorEditPrompt(e.target.value)}
                      placeholder="Сделай фон неоновым, добавь иконку..."
                      onKeyDown={e => { if (e.key === 'Enter') handleApplyAIElem() }}
                      className="sb-hud-input"
                    />
                    <button onClick={handleApplyAIElem} disabled={!inspectorEditPrompt.trim() || isGenerating} className="sb-hud-ai-btn">
                      <Sparkles size={13} />
                      <span>AI Изменить</span>
                    </button>
                  </div>
                </div>

                {/* 3. Delete element */}
                <div className="sb-hud-actions-row">
                  <button onClick={handleDeleteInspectedElement} className="sb-hud-delete-btn">
                    <Trash2 size={13} />
                    <span>Удалить этот элемент</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' ? (
            /* Monaco Code Editor */
            <div style={{ width: '100%', height: '100%', display: 'flex', background: '#0B0E17' }}>
              {/* Explorer Sidebar */}
              <div style={{ width: 220, borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', background: '#090B12' }}>
                <div style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span>Файлы (VFS)</span>
                  <button 
                    onClick={() => {
                      const name = window.prompt('Введите имя файла (например, style.css):')
                      if (name && name.trim()) {
                        const fileName = name.trim()
                        if (!config.files?.[fileName]) {
                          setConfig(prev => ({
                            ...prev,
                            files: { ...(prev.files || {}), [fileName]: '' }
                          }))
                          setActiveFile(fileName)
                        } else {
                          alert('Такой файл уже существует!')
                        }
                      }
                    }}
                    style={{ background: 'none', border: 'none', color: '#00D9FF', cursor: 'pointer', fontSize: 14, fontWeight: 'bold' }}
                    title="Добавить новый файл"
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
                      <span>AI пишет код...</span>
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
          ) : activeTab === 'split' ? (
            /* Split View: Left half Monaco Code, Right half Live Preview */
            <div className="sb-split-container">
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.08)', background: '#090B12', overflow: 'hidden' }}>
                <div style={{ height: 38, background: '#090B12', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 12, color: '#C084FC', fontWeight: 600 }}>
                    💻 Исходный код ({activeFile})
                  </div>
                </div>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Editor
                    height="100%"
                    language={activeFile.endsWith('.html') ? 'html' : activeFile.endsWith('.css') ? 'css' : activeFile.endsWith('.js') ? 'javascript' : 'html'}
                    theme="vs-dark"
                    value={config.files ? (config.files[activeFile] || '') : (config.source_code || '')}
                    onChange={(value) => {
                      const files = config.files || { 'index.html': config.source_code || '' }
                      setConfig(prev => ({
                        ...prev,
                        files: { ...files, [activeFile]: value || '' },
                        source_code: activeFile === 'index.html' ? (value || '') : prev.source_code
                      }))
                    }}
                    options={{ minimap: { enabled: false }, fontSize: 13, wordWrap: 'on' }}
                  />
                </div>
              </div>
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#07090E', overflow: 'hidden' }}>
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
                    <button onClick={() => setUpdateCounter(c => c + 1)} title="Обновить" style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                      <RefreshCw size={13} />
                    </button>
                  </div>
                </div>
                <div className="sb-preview-viewport" style={{ background: '#07090E' }}>
                  <iframe
                    key={`split_${updateCounter}`}
                    srcDoc={safeIframeCode}
                    className="sb-site-iframe"
                    title="Live Site Preview Split"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', backgroundColor: '#07090E' }}
                  />
                </div>
              </div>
            </div>
          ) : !Boolean(unifiedHtmlContent?.trim()?.length > 30) ? (
            /* HOLOGRAPHIC WEBSITE STUDIO HUB (When empty) */
            <div className="sb-empty-hub">
              <div className="sb-hub-center">
                <div className="sb-hub-icon-badge">
                  <Globe size={38} />
                </div>

                <h2 className="sb-hub-title">Mazaika AI Студия Веб-Сайтов</h2>

                <p className="sb-hub-subtitle">
                  Опишите идею вашего сайта в чате слева или выберите один из готовых интерактивных шаблонов ниже. 
                  Нейросеть за 1 минуту разработает адаптивный лендинг, современный дизайн и чистый код.
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
                        <span>Открыть в 1 клик</span>
                        <ExternalLink size={13} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="sb-hub-tips">
                  <div className="sb-tip-item"><Sparkles size={14} color="#00D9FF" /> Готовый сайт за 1 минуту</div>
                  <div className="sb-tip-item"><Laptop size={14} color="#00F5C4" /> Tailwind CSS & Адаптивный дизайн</div>
                  <div className="sb-tip-item"><Code size={14} color="#A78BFA" /> Встроенный Monaco Editor & свободный код</div>
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
                  <button onClick={() => setUpdateCounter(c => c + 1)} title="Обновить предпросмотр" style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                    <RefreshCw size={13} />
                  </button>
                </div>
              </div>
              <div className="sb-preview-viewport" style={{ background: '#07090E' }}>
                <iframe
                  key={`desktop_${updateCounter}_${isInspectorActive ? 'ins' : 'norm'}`}
                  srcDoc={safeIframeCode}
                  className="sb-site-iframe"
                  title="Live Site Preview"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', backgroundColor: '#07090E' }}
                />
              </div>
            </div>
          ) : deviceMode === 'mobile' ? (
            /* iPhone 16 Pro Device Frame (Realistic Simulator) */
            <div className="sb-sim-canvas-viewport">
              <div className={`sb-sim-device-frame iphone-16-pro ${orientation}`}>
                <div className="sb-iphone-outer-rim">
                  {/* Dynamic Island Pill */}
                  <div className="sb-dynamic-island">
                    <div className="sb-island-camera" />
                    <div className="sb-island-sensor" />
                  </div>

                  {/* Status Bar */}
                  <div className="sb-sim-status-bar">
                    <span className="sb-status-time">9:41</span>
                    <div className="sb-status-icons">
                      <span className="sb-status-signal">📶</span>
                      <span className="sb-status-wifi">5G</span>
                      <span className="sb-status-battery">🔋</span>
                    </div>
                  </div>

                  {/* Screen Content Iframe */}
                  <div className="sb-sim-screen-container">
                    <iframe
                      key={`iphone_${updateCounter}_${orientation}_${isInspectorActive ? 'ins' : 'norm'}`}
                      srcDoc={safeIframeCode}
                      className="sb-sim-iframe"
                      title="iPhone 16 Pro Simulator"
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    />
                  </div>

                  {/* iOS Home Indicator Pill */}
                  <div className="sb-sim-home-pill" />
                </div>
              </div>
            </div>
          ) : (
            /* iPad Pro Device Frame */
            <div className="sb-sim-canvas-viewport">
              <div className={`sb-sim-device-frame ipad-pro ${orientation}`}>
                <div className="sb-ipad-outer-rim">
                  {/* iPad Camera Notch */}
                  <div className="sb-ipad-camera-dot" />

                  {/* Status Bar */}
                  <div className="sb-sim-status-bar ipad">
                    <span className="sb-status-time">9:41</span>
                    <span className="sb-ipad-brand-label">iPad Pro 11"</span>
                    <div className="sb-status-icons">
                      <span className="sb-status-wifi">Wi-Fi</span>
                      <span className="sb-status-battery">100% 🔋</span>
                    </div>
                  </div>

                  {/* Screen Content Iframe */}
                  <div className="sb-sim-screen-container">
                    <iframe
                      key={`ipad_${updateCounter}_${orientation}_${isInspectorActive ? 'ins' : 'norm'}`}
                      srcDoc={safeIframeCode}
                      className="sb-sim-iframe"
                      title="iPad Pro Simulator"
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    />
                  </div>

                  {/* iOS Home Indicator Pill */}
                  <div className="sb-sim-home-pill ipad" />
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
                    <span>Настройки Сайта</span>
                  </h3>
                  <button onClick={() => setIsSettingsOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>

                <div className="sb-settings-fields">
                  <div className="sb-form-group">
                    <label>Название сайта</label>
                    <input type="text" value={siteTitle} onChange={e => setSiteTitle(e.target.value)} />
                  </div>
                  <div className="sb-form-group">
                    <label>Домен / ЧПУ (Slug)</label>
                    <input type="text" value={siteSlug} onChange={e => setSiteSlug(e.target.value)} placeholder="например: my-cool-project" />
                  </div>
                  <div className="sb-form-group">
                    <label>SEO Описание</label>
                    <textarea rows={4} value={siteDesc} onChange={e => setSiteDesc(e.target.value)} placeholder="Описание для поисковых систем и соцсетей..." />
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
                Сохранить изменения
              </button>
            </div>
          </div>
        )}

        {/* Connect Bot Modal */}
        <ConnectBotModal
          isOpen={isConnectBotOpen}
          onClose={() => setIsConnectBotOpen(false)}
          siteId={botId || ''}
          siteName={config.appName || siteTitle || 'Мой Веб-сайт'}
          siteUrl={cloudflareUrl || (botId ? getLiveSiteUrl(botId) : undefined)}
          onSuccess={(connectedBotId, connectedBotName) => {
            console.log(`Connected site ${botId} to bot ${connectedBotId} (${connectedBotName})`)
          }}
        />

        {/* In-App Modern Glass Toast */}
        {toast && (
          <div style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 99999,
            background: toast.type === 'error' ? 'rgba(239,68,68,0.92)' : 'rgba(13,17,26,0.96)',
            border: `1px solid ${toast.type === 'error' ? '#ef4444' : '#10b981'}`,
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 16,
            boxShadow: '0 10px 35px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            fontWeight: 600,
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    </div>
  )
}
