import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Sparkles, X, Send, Bot, Maximize2, RefreshCw, Zap, CheckCircle2 } from 'lucide-react'
import { useAICopilot } from '../../context/AICopilotContext'
import './FloatingAgentWidget.css'

export default function FloatingAgentWidget() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    isWidgetOpen,
    toggleWidget,
    activeElementId,
    messages,
    isGenerating,
    sendMessage
  } = useAICopilot()

  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isWidgetOpen) {
      scrollToBottom()
    }
  }, [messages, isWidgetOpen])

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return
    const currentText = input
    setInput('')
    await sendMessage(currentText)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handlePresetClick = async (presetText: string) => {
    if (isGenerating) return
    await sendMessage(presetText)
  }

  const getContextName = () => {
    const path = location.pathname
    if (path.includes('sitebuilder')) return 'Mini App & Sayt Konstruktori'
    if (path.includes('editor')) return 'Flow Diagrammatsiyasi'
    if (path.includes('miniapps')) return 'Mini Apps Boshqaruvi'
    if (path.includes('dashboard')) return 'Boshqaruv Paneli'
    return 'Mozaika Платформаси'
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <button 
        className="floating-agent-trigger" 
        onClick={toggleWidget}
        title="Antigravity AI Copilot — Sun'iy Intellekt Агенти"
      >
        <span className="floating-agent-badge" />
        {isWidgetOpen ? <X size={24} /> : <Sparkles size={24} />}
      </button>

      {/* Floating Modal Window */}
      {isWidgetOpen && (
        <div className="floating-agent-window">
          {/* Header */}
          <div className="agent-header">
            <div className="agent-header-title">
              <div className="agent-avatar">
                <Bot size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#fff' }}>Antigravity AI Copilot</h4>
                <span style={{ fontSize: 10, color: '#10d974', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10d974' }} /> Online (Контекстный)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <button 
                className="btn btn-ghost btn-xs btn-icon" 
                onClick={() => navigate('/dashboard/ai-workspace')}
                title="AI Workspace полноэкранный хаб"
                style={{ color: '#94a3b8' }}
              >
                <Maximize2 size={14} />
              </button>
              <button 
                className="btn btn-ghost btn-xs btn-icon" 
                onClick={toggleWidget}
                style={{ color: '#94a3b8' }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Context Banner */}
          <div className="agent-context-banner">
            <Zap size={12} style={{ color: '#1e90ff' }} />
            <span><b>Joylashuv:</b> {getContextName()}</span>
            {activeElementId && <span style={{ color: '#00f5c4', marginLeft: 'auto' }}>[Element #{activeElementId}]</span>}
          </div>

          {/* Chat Messages Body */}
          <div className="agent-messages-body">
            {messages.map((msg) => (
              <div key={msg.id} className={`agent-message-item ${msg.sender}`}>
                {msg.text}
                {msg.patchOperations && msg.patchOperations.length > 0 && (
                  <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 11, color: '#00f5c4', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={12} /> {msg.patchOperations.length} patch qo'llanildi
                  </div>
                )}
              </div>
            ))}
            {isGenerating && (
              <div className="agent-message-item agent" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RefreshCw size={14} className="spin" /> Antigravity kodingizni va interfeysni tahlil qilmoqda...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Preset Chips */}
          <div className="agent-presets">
            <button className="agent-preset-chip" onClick={() => handlePresetClick("Mavzu rangini yashil qil")}>
              ❇️ Yashil tema
            </button>
            <button className="agent-preset-chip" onClick={() => handlePresetClick("Neon uslubga o'tkaz")}>
              🌙 Neon tema
            </button>
            <button className="agent-preset-chip" onClick={() => handlePresetClick("Mijozlar fikrlari (отзывы) blokini qo'sh")}>
              ⭐ Otzivlar
            </button>
            <button className="agent-preset-chip" onClick={() => handlePresetClick("Bonus keshbek виджетini qo'sh")}>
              🎁 Keshbek
            </button>
          </div>

          {/* Input Box */}
          <div className="agent-input-container">
            <input 
              type="text" 
              className="agent-input" 
              placeholder="Antigravity-ga buyruq bering..." 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isGenerating}
            />
            <button 
              className="btn btn-primary btn-sm btn-icon" 
              onClick={handleSend}
              disabled={isGenerating || !input.trim()}
              style={{ borderRadius: 12, width: 36, height: 36 }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
