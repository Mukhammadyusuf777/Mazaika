import { useState, useEffect, useRef } from 'react'
import { X, Send, RotateCcw, Bot, ChevronDown, ChevronUp, CheckCheck } from 'lucide-react'
import './BotSimulatorModal.css'

interface SimMessage {
  id: string
  sender: 'bot' | 'user'
  text: string
  buttons?: Array<string | { text: string; nextNodeId?: string }>
  mediaUrl?: string
  time: string
}

interface BotSimulatorModalProps {
  isOpen: boolean
  onClose: () => void
  nodes: any[]
  edges: any[]
  botName?: string
}

export default function BotSimulatorModal({
  isOpen,
  onClose,
  nodes,
  edges,
  botName = 'Mazaika Telegram Bot'
}: BotSimulatorModalProps) {
  const [messages, setMessages] = useState<SimMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null)
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [waitingFor, setWaitingFor] = useState<'text' | 'button' | 'phone' | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [showVars, setShowVars] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const getCurrentTime = () => {
    const now = new Date()
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0')
  }

  // Helper to substitute {variable}
  const substituteVars = (text: string, currentVars: Record<string, string>) => {
    if (!text) return ''
    let res = text
    for (const [k, v] of Object.entries(currentVars)) {
      res = res.replace(new RegExp(`{${k}}`, 'g'), v)
    }
    return res
  }

  // Execute a specific node by ID
  const processNode = (nodeId: string, currentVars: Record<string, string>) => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return

    setCurrentNodeId(nodeId)
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      const time = getCurrentTime()

      if (node.type === 'start') {
        const startText = node.data?.text || 'Assalomu alaykum! Botga xush kelibsiz.'
        setMessages(prev => [...prev, {
          id: 'msg_' + Date.now(),
          sender: 'bot',
          text: substituteVars(startText, currentVars),
          time
        }])

        // Follow first outgoing edge automatically
        const nextEdge = edges.find(e => e.source === node.id)
        if (nextEdge) {
          setTimeout(() => processNode(nextEdge.target, currentVars), 600)
        }
      } else if (node.type === 'message') {
        const msgText = node.data?.text || ''
        const buttons = node.data?.buttons || []
        const mediaUrl = node.data?.mediaUrl

        setMessages(prev => [...prev, {
          id: 'msg_' + Date.now(),
          sender: 'bot',
          text: substituteVars(msgText, currentVars),
          buttons: buttons.length > 0 ? buttons : undefined,
          mediaUrl,
          time
        }])

        if (buttons.length > 0) {
          setWaitingFor('button')
        } else {
          // If no buttons, follow standard outgoing edge
          const nextEdge = edges.find(e => e.source === node.id)
          if (nextEdge) {
            setTimeout(() => processNode(nextEdge.target, currentVars), 700)
          }
        }
      } else if (node.type === 'question') {
        const qText = node.data?.text || 'Savolingizni kiriting:'
        setMessages(prev => [...prev, {
          id: 'msg_' + Date.now(),
          sender: 'bot',
          text: substituteVars(qText, currentVars),
          time
        }])
        setWaitingFor('text')
      } else if (node.type === 'condition') {
        const varName = node.data?.variable || ''
        const op = node.data?.operator || '=='
        const checkVal = node.data?.value || ''
        const currentVal = currentVars[varName] || ''

        let isTrue = false
        if (op === '==') isTrue = currentVal.toLowerCase() === checkVal.toLowerCase()
        else if (op === '!=') isTrue = currentVal.toLowerCase() !== checkVal.toLowerCase()
        else if (op === 'contains') isTrue = currentVal.toLowerCase().includes(checkVal.toLowerCase())
        else if (op === '>') isTrue = parseFloat(currentVal) > parseFloat(checkVal)
        else if (op === '<') isTrue = parseFloat(currentVal) < parseFloat(checkVal)
        else isTrue = Boolean(currentVal)

        const targetHandle = isTrue ? 'true' : 'false'
        const matchedEdge = edges.find(e => e.source === node.id && e.sourceHandle === targetHandle) || edges.find(e => e.source === node.id)

        if (matchedEdge) {
          processNode(matchedEdge.target, currentVars)
        }
      } else if (node.type === 'variable') {
        const vName = node.data?.variableName || 'var'
        const vVal = node.data?.variableValue || 'val'
        const updated = { ...currentVars, [vName]: vVal }
        setVariables(updated)

        const nextEdge = edges.find(e => e.source === node.id)
        if (nextEdge) {
          processNode(nextEdge.target, updated)
        }
      } else if (node.type === 'payme' || node.type === 'click') {
        const title = node.data?.title || 'Оплата заказа'
        const price = node.data?.price || 0
        setMessages(prev => [...prev, {
          id: 'msg_' + Date.now(),
          sender: 'bot',
          text: `💳 Счёт к оплате: ${title}\n💰 Сумма: ${Number(price).toLocaleString()} UZS`,
          buttons: ['Оплатить (Тест)', 'Отмена'],
          time
        }])
        setWaitingFor('button')
      } else if (node.type === 'operator') {
        setMessages(prev => [...prev, {
          id: 'msg_' + Date.now(),
          sender: 'bot',
          text: '👨‍💼 Вы переведены на оператора поддержки. Напишите ваш вопрос, и специалист ответит вам прямо сюда.',
          time
        }])
        setWaitingFor('text')
      } else {
        // Fallback for custom code or other blocks
        const nextEdge = edges.find(e => e.source === node.id)
        if (nextEdge) {
          processNode(nextEdge.target, currentVars)
        }
      }
    }, 450)
  }

  // Start / Restart Simulation
  const handleRestart = () => {
    setMessages([])
    setVariables({})
    setWaitingFor(null)
    setInputText('')

    const startNode = nodes.find(n => n.type === 'start')
    if (startNode) {
      processNode(startNode.id, {})
    } else if (nodes.length > 0) {
      processNode(nodes[0].id, {})
    } else {
      setMessages([{
        id: 'empty_msg',
        sender: 'bot',
        text: '⚠️ На холсте нет блоков. Добавьте блоки или сгенерируйте воронку с помощью AI.',
        time: getCurrentTime()
      }])
    }
  }

  useEffect(() => {
    if (isOpen) {
      handleRestart()
    }
  }, [isOpen])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Handle user clicks on inline buttons
  const handleButtonClick = (btn: any, btnIndex: number) => {
    const btnLabel = typeof btn === 'string' ? btn : (btn.text || 'Кнопка')
    const time = getCurrentTime()

    // Add user message
    setMessages(prev => [...prev, {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: btnLabel,
      time
    }])

    setWaitingFor(null)

    if (!currentNodeId) return

    // Check if button has explicit nextNodeId
    if (typeof btn === 'object' && btn.nextNodeId) {
      processNode(btn.nextNodeId, variables)
      return
    }

    // Check for edge connected to btn_0, btn_1, etc.
    const handleId = `btn_${btnIndex}`
    let matchedEdge = edges.find(e => e.source === currentNodeId && e.sourceHandle === handleId)
    
    // Fallback to label match or any edge
    if (!matchedEdge) {
      matchedEdge = edges.find(e => e.source === currentNodeId)
    }

    if (matchedEdge) {
      processNode(matchedEdge.target, variables)
    }
  }

  // Handle user text submission
  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const text = inputText.trim()
    if (!text) return

    const time = getCurrentTime()
    setMessages(prev => [...prev, {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text,
      time
    }])
    setInputText('')

    if (text === '/start') {
      handleRestart()
      return
    }

    if (waitingFor === 'text' && currentNodeId) {
      const node = nodes.find(n => n.id === currentNodeId)
      let updatedVars = { ...variables }
      if (node && node.data?.variable) {
        updatedVars[node.data.variable] = text
        setVariables(updatedVars)
      }

      setWaitingFor(null)

      const nextEdge = edges.find(e => e.source === currentNodeId)
      if (nextEdge) {
        processNode(nextEdge.target, updatedVars)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="tg-sim-overlay" onClick={onClose}>
      <div className="tg-sim-window" onClick={e => e.stopPropagation()}>
        {/* Telegram Header */}
        <div className="tg-sim-header">
          <div className="tg-sim-bot-info">
            <div className="tg-sim-avatar">
              <Bot size={18} />
              <span className="tg-sim-online-dot" />
            </div>
            <div>
              <div className="tg-sim-title">
                {botName}
                <span className="tg-sim-bot-badge">bot</span>
              </div>
              <div className="tg-sim-status">
                {isTyping ? 'печатает...' : 'онлайн (Симулятор $0.00)'}
              </div>
            </div>
          </div>

          <div className="tg-sim-header-actions">
            <button 
              className="tg-sim-btn-icon" 
              onClick={handleRestart} 
              title="Перезапустить (/start)"
            >
              <RotateCcw size={15} />
            </button>
            <button 
              className="tg-sim-btn-icon" 
              onClick={onClose} 
              title="Закрыть симулятор"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Telegram Chat Body */}
        <div className="tg-sim-body">
          <div className="tg-sim-date-pill">Сегодня</div>

          {messages.map((m) => (
            <div key={m.id} className={`tg-sim-row ${m.sender}`}>
              <div className={`tg-sim-bubble ${m.sender}`}>
                {m.mediaUrl && (
                  <img src={m.mediaUrl} alt="media" className="tg-sim-bubble-media" />
                )}
                <div className="tg-sim-bubble-text">{m.text}</div>
                <div className="tg-sim-bubble-meta">
                  <span className="tg-sim-bubble-time">{m.time}</span>
                  {m.sender === 'user' && <CheckCheck size={12} className="tg-sim-check" />}
                </div>
              </div>

              {/* Inline Buttons if any */}
              {m.buttons && m.buttons.length > 0 && (
                <div className="tg-sim-inline-keyboard">
                  {m.buttons.map((btn, bIdx) => {
                    const label = typeof btn === 'string' ? btn : (btn.text || 'Кнопка')
                    return (
                      <button
                        key={bIdx}
                        className="tg-sim-inline-btn"
                        onClick={() => handleButtonClick(btn, bIdx)}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="tg-sim-row bot">
              <div className="tg-sim-bubble bot typing">
                <span className="tg-sim-dot" />
                <span className="tg-sim-dot" />
                <span className="tg-sim-dot" />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Variables Inspector Drawer */}
        <div className="tg-sim-vars-drawer">
          <button 
            type="button"
            className="tg-sim-vars-toggle" 
            onClick={() => setShowVars(!showVars)}
          >
            <span>Переменные сессии ({Object.keys(variables).length})</span>
            {showVars ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
          {showVars && (
            <div className="tg-sim-vars-content">
              {Object.keys(variables).length === 0 ? (
                <span style={{ color: '#64748B', fontSize: 11 }}>Переменные пока не собраны</span>
              ) : (
                Object.entries(variables).map(([k, v]) => (
                  <div key={k} className="tg-sim-var-item">
                    <span className="tg-sim-var-key">{k}:</span>
                    <span className="tg-sim-var-val">{v}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form className="tg-sim-input-bar" onSubmit={handleSendText}>
          <input
            type="text"
            className="tg-sim-input"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={waitingFor === 'button' ? 'Выберите кнопку выше или введите текст...' : 'Напишите сообщение...'}
          />
          <button 
            type="submit" 
            className="tg-sim-send-btn" 
            disabled={!inputText.trim()}
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  )
}
