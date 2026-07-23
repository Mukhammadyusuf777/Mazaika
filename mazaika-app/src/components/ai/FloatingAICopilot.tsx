import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Sparkles, Send, X, Loader2, Bot, Minimize2, Maximize2,
  Trash2, RefreshCw, Copy, Check, ChevronRight, Zap, Globe,
  MessageSquare, Code2, Palette, Layout, Plus
} from 'lucide-react'
import { useAICopilot } from '../../context/AICopilotContext'
import './FloatingAICopilot.css'

// Simple markdown-like renderer (bold, italic, bullet points, code)
function renderMarkdown(text: string) {
  if (!text) return null
  const lines = text.split('\n')
  return lines.map((line, i) => {
    // Headers
    if (line.startsWith('### ')) return <p key={i} style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0', margin: '8px 0 2px' }}>{line.slice(4)}</p>
    if (line.startsWith('## ')) return <p key={i} style={{ fontWeight: 700, fontSize: 14, color: '#fff', margin: '10px 0 4px' }}>{line.slice(3)}</p>
    // Bullet points
    if (line.startsWith('- ') || line.startsWith('• ')) {
      const content = line.slice(2)
      return (
        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 2 }}>
          <span style={{ color: '#a855f7', marginTop: 1, flexShrink: 0 }}>•</span>
          <span>{formatInline(content)}</span>
        </div>
      )
    }
    // Numbered list
    if (/^\d+\. /.test(line)) {
      const num = line.match(/^\d+/)?.[0]
      const content = line.replace(/^\d+\. /, '')
      return (
        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 2 }}>
          <span style={{ color: '#3b82f6', minWidth: 16, flexShrink: 0 }}>{num}.</span>
          <span>{formatInline(content)}</span>
        </div>
      )
    }
    // Empty line
    if (line.trim() === '') return <div key={i} style={{ height: 6 }} />
    return <p key={i} style={{ margin: '2px 0' }}>{formatInline(line)}</p>
  })
}

function formatInline(text: string) {
  // Bold **text**
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: '#fff', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: 4, fontSize: 12, color: '#00f5c4', fontFamily: 'monospace' }}>{part.slice(1, -1)}</code>
    }
    return part
  })
}

// Quick action chips
const BOT_QUICK_PROMPTS = [
  { icon: <Zap size={12} />, text: 'Internet do\'kon boti yaratish', label: 'Do\'kon' },
  { icon: <MessageSquare size={12} />, text: 'FAQ bot yaratish', label: 'FAQ bot' },
  { icon: <Layout size={12} />, text: 'Kurs savdo boti', label: 'Kurs' },
  { icon: <Plus size={12} />, text: 'Mini app bilan restoran boti', label: 'Restoran' },
]

const SITE_QUICK_PROMPTS = [
  { icon: <Globe size={12} />, text: 'Portfolio sayt yaratish', label: 'Portfolio' },
  { icon: <Layout size={12} />, text: 'Landing page yaratish', label: 'Landing' },
  { icon: <Palette size={12} />, text: 'Restoran menyu sayt', label: 'Menyu' },
  { icon: <Code2 size={12} />, text: 'SaaS mahsulot landing page', label: 'SaaS' },
]

export default function FloatingAICopilot({ projectType = 'bot' }: { projectType?: 'bot' | 'site' }) {
  const { isWidgetOpen, setWidgetOpen, messages, isGenerating, sendMessage, clearChat, activeConfig } = useAICopilot()
  const [promptInput, setPromptInput] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const quickPrompts = projectType === 'site' ? SITE_QUICK_PROMPTS : BOT_QUICK_PROMPTS

  useEffect(() => {
    if (!isMinimized && isWidgetOpen) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [messages, isWidgetOpen, isMinimized])

  const handleSend = useCallback(async (text?: string) => {
    const msg = text || promptInput
    if (!msg.trim() || isGenerating) return
    setPromptInput('')
    if (textareaRef.current) textareaRef.current.style.height = '40px'
    const targetEntity = projectType === 'site' ? 'site_only' : 'bot_and_mini_app'
    await sendMessage(msg, 'FULL_GENERATION', targetEntity)
  }, [promptInput, isGenerating, projectType, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptInput(e.target.value)
    // Auto-resize textarea
    e.target.style.height = '40px'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleRetry = async () => {
    // Resend the last user message
    const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user')
    if (lastUserMsg) {
      await handleSend(lastUserMsg.text)
    }
  }

  // Get stats from activeConfig
  const configStats = activeConfig ? {
    nodes: activeConfig.bot_blocks?.length || 0,
    hasSite: !!activeConfig.source_code,
  } : null

  if (!isWidgetOpen) {
    return (
      <button
        className="floating-ai-toggle"
        onClick={() => setWidgetOpen(true)}
        title="Mazaika AI — qo'llab-quvvatlash"
      >
        <div className="fai-toggle-inner">
          <Sparkles size={22} color="#fff" />
          {messages.length > 1 && (
            <span className="fai-badge">{messages.filter(m => m.sender === 'agent').length}</span>
          )}
        </div>
      </button>
    )
  }

  return (
    <div className={`floating-ai-widget ${isMinimized ? 'minimized' : ''} ${isExpanded ? 'expanded' : ''}`}>
      {/* Header */}
      <div className="fai-header">
        <div className="fai-header-title">
          <div className="fai-icon-bg">
            <Sparkles size={13} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.2 }}>Mazaika AI</div>
            {!isMinimized && (
              <div style={{ fontSize: 10, color: '#a855f7', lineHeight: 1 }}>
                {isGenerating ? '● Ishlayapti...' : '● Tayyor'}
              </div>
            )}
          </div>
        </div>
        <div className="fai-header-actions">
          {!isMinimized && configStats && configStats.nodes > 0 && (
            <div className="fai-stats-chip">
              <Zap size={10} /> {configStats.nodes} blok
            </div>
          )}
          <button onClick={handleRetry} title="Qayta yuborish" disabled={isGenerating || messages.length < 2} className="fai-icon-btn">
            <RefreshCw size={13} />
          </button>
          <button onClick={() => { if (window.confirm('Chatni tozalashni tasdiqlaysizmi?')) clearChat() }} title="Chatni tozalash" className="fai-icon-btn">
            <Trash2 size={13} />
          </button>
          <button onClick={() => setIsMinimized(!isMinimized)} title={isMinimized ? 'Ochish' : 'Yig\'ish'} className="fai-icon-btn">
            <Minimize2 size={13} />
          </button>
          <button onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? 'Kichiklashtirish' : 'Kattalashtirish'} className="fai-icon-btn">
            {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
          <button onClick={() => setWidgetOpen(false)} className="fai-icon-btn">
            <X size={13} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="fai-messages">
            {/* Welcome / Quick prompts */}
            {messages.length <= 1 && (
              <div className="fai-welcome">
                <div className="fai-welcome-icon">
                  <Sparkles size={20} />
                </div>
                <p className="fai-welcome-title">
                  {projectType === 'site' ? 'Sayt yaratishni boshlaylik!' : 'Botingizni yarataylik!'}
                </p>
                <p className="fai-welcome-sub">Quyidagi misollardan birini tanlang yoki o\'z g\'oyangizni yozing</p>
                <div className="fai-quick-prompts">
                  {quickPrompts.map((q, i) => (
                    <button key={i} className="fai-quick-chip" onClick={() => handleSend(q.text)}>
                      {q.icon} {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`fai-msg-row ${m.sender === 'user' ? 'user' : 'agent'}`}>
                {m.sender === 'agent' && (
                  <div className="fai-avatar agent">
                    <Bot size={12} />
                  </div>
                )}
                <div className="fai-msg-content-wrap">
                  <div className="fai-bubble">
                    {m.sender === 'agent' ? (
                      <div className="fai-md">{renderMarkdown(m.text)}</div>
                    ) : (
                      m.text
                    )}
                  </div>
                  {/* Agent message actions */}
                  {m.sender === 'agent' && (
                    <div className="fai-msg-actions">
                      <button
                        className="fai-msg-action-btn"
                        onClick={() => handleCopyMessage(m.id, m.text)}
                        title="Nusxa olish"
                      >
                        {copiedId === m.id ? <Check size={11} /> : <Copy size={11} />}
                        {copiedId === m.id ? 'Nusxalandi' : 'Nusxa'}
                      </button>
                    </div>
                  )}
                </div>
                {m.sender === 'user' && (
                  <div className="fai-avatar user">
                    <span style={{ fontSize: 10, fontWeight: 700 }}>SZ</span>
                  </div>
                )}
              </div>
            ))}

            {/* Generating indicator — animated dots */}
            {isGenerating && (
              <div className="fai-msg-row agent">
                <div className="fai-avatar agent">
                  <Bot size={12} />
                </div>
                <div className="fai-bubble fai-typing">
                  <span className="fai-dot" />
                  <span className="fai-dot" />
                  <span className="fai-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="fai-input-area">
            <div className={`fai-input-box ${promptInput ? 'active' : ''}`}>
              <textarea
                ref={textareaRef}
                placeholder={projectType === 'site'
                  ? "Saytga nimalar qo'shaylik? Masalan: 'Animatsiyali hero section qo'sh'"
                  : "Botga nimalar qo'shaylik? Masalan: 'FAQ bo'limi qo'sh'"}
                value={promptInput}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                disabled={isGenerating}
                rows={1}
              />
              <div className="fai-input-actions">
                {promptInput && (
                  <span className="fai-input-hint">↵ yuborish</span>
                )}
                <button
                  onClick={() => handleSend()}
                  disabled={!promptInput.trim() || isGenerating}
                  className={`fai-send-btn ${promptInput.trim() && !isGenerating ? 'active' : ''}`}
                >
                  {isGenerating ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                </button>
              </div>
            </div>
            <div className="fai-footer-hint">
              <ChevronRight size={10} />
              AI o'zgartirishlar vizual redaktorda ko'rinadi
            </div>
          </div>
        </>
      )}
    </div>
  )
}
