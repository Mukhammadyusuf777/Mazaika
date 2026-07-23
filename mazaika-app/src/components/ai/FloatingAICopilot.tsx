import React, { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, X, Loader2, Bot, Minimize2, Maximize2 } from 'lucide-react'
import { useAICopilot } from '../../context/AICopilotContext'
import './FloatingAICopilot.css'

export default function FloatingAICopilot({ projectType = 'bot' }: { projectType?: 'bot' | 'site' }) {
  const { isWidgetOpen, setWidgetOpen, messages, isGenerating, sendMessage } = useAICopilot()
  const [promptInput, setPromptInput] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isWidgetOpen, isMinimized])

  const handleSend = async () => {
    if (!promptInput.trim() || isGenerating) return
    const text = promptInput
    setPromptInput('')
    const targetEntity = projectType === 'site' ? 'site_only' : 'bot_and_mini_app'
    await sendMessage(text, 'MODIFICATION', targetEntity)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isWidgetOpen) {
    return (
      <button 
        className="floating-ai-toggle"
        onClick={() => setWidgetOpen(true)}
        title="Mazaika AI"
      >
        <Sparkles size={24} color="#fff" />
      </button>
    )
  }

  return (
    <div className={`floating-ai-widget ${isMinimized ? 'minimized' : ''}`}>
      <div className="fai-header">
        <div className="fai-header-title">
          <div className="fai-icon-bg">
            <Sparkles size={14} />
          </div>
          <span>Mazaika AI</span>
        </div>
        <div className="fai-header-actions">
          <button onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button onClick={() => setWidgetOpen(false)}>
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="fai-messages">
            {messages.map((m) => (
              <div key={m.id} className={`fai-msg-row ${m.sender === 'user' ? 'user' : 'agent'}`}>
                {m.sender === 'agent' && (
                  <div className="fai-avatar agent">
                    <Bot size={14} />
                  </div>
                )}
                <div className="fai-bubble">
                  {m.text}
                  {m.explanation && m.sender === 'agent' && (
                    <div className="fai-explanation">{m.explanation}</div>
                  )}
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="fai-msg-row agent">
                <div className="fai-avatar agent"><Bot size={14} /></div>
                <div className="fai-bubble generating">
                  <Loader2 className="animate-spin" size={14} /> O'ylanmoqda...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="fai-input-area">
            <textarea
              placeholder="Qanday o'zgartirish kiritamiz?"
              value={promptInput}
              onChange={e => setPromptInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
            />
            <button onClick={handleSend} disabled={!promptInput.trim() || isGenerating}>
              <Send size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
