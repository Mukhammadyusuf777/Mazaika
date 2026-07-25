import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { queryAntigravityAgent } from '../api/aiAgentEngine'
import type { AgentResponsePayload, PatchOperation } from '../api/aiAgentEngine'
import { useAuthStore } from '../store/useAuthStore'

export interface ChatMessage {
  id: string
  sender: 'user' | 'agent'
  text: string
  explanation?: string
  timestamp: Date
  projectData?: any
  patchOperations?: PatchOperation[]
  imageUrl?: string // for vision messages
}

interface AICopilotContextType {
  isWidgetOpen: boolean
  setWidgetOpen: (open: boolean) => void
  toggleWidget: () => void
  activeElementId: string | null
  setActiveElementId: (id: string | null) => void
  messages: ChatMessage[]
  isGenerating: boolean
  sendMessage: (
    text: string,
    overrideMode?: 'FULL_GENERATION' | 'PATCH',
    targetEntity?: 'bot_and_mini_app' | 'site_only',
    imageBase64?: string,
    imageMimeType?: string
  ) => Promise<AgentResponsePayload | null>
  activeConfig: any
  setActiveConfig: React.Dispatch<React.SetStateAction<any>>
  applyPatchOperations: (ops: PatchOperation[]) => void
  activeProjectId: string
  switchProject: (projectId: string, config: any) => void
  clearChat: () => void
}

const AICopilotContext = createContext<AICopilotContextType | undefined>(undefined)

function makeKey(userId: string | undefined, type: 'config' | 'messages', projectId: string) {
  return `mazaika_ai_${userId || 'anon'}_${type}_${projectId}`
}

export const AICopilotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore()
  const userId = user?.id

  const [isWidgetOpen, setWidgetOpen] = useState(false)
  const [activeElementId, setActiveElementId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeProjectId, setActiveProjectId] = useState<string>('default')
  const prevUserIdRef = useRef<string | undefined>(userId)

  const [activeConfig, setActiveConfig] = useState<any>(() => {
    const saved = localStorage.getItem(makeKey(userId, 'config', 'default'))
    return saved ? JSON.parse(saved) : null
  })

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(makeKey(userId, 'messages', 'default'))
    if (saved) {
      const parsed = JSON.parse(saved)
      return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
    }
    return [
      {
        id: 'welcome_1',
        sender: 'agent',
        text: `Salom! Men **Mazaika AI** — sizning shaxsiy AI developeringizman! 🚀\n\nMen quyidagilarda yordam bera olaman:\n- 🤖 **Telegram bot** yaratish yoki takomillashtirish\n- 🌐 **Sayt** yaratish — to'liq HTML/CSS/JS\n- ✨ Mavjud loyihani o'zgartirish yoki kengaytirish\n- 📸 **Rasm yuboring** — men uni tahlil qilib sizga kerakli narsani yarataman!\n\nG'oyangizni yozing yoki rasm yuboring!`,
        timestamp: new Date()
      }
    ]
  })

  // Re-initialize when user changes (login/logout)
  useEffect(() => {
    if (prevUserIdRef.current !== userId) {
      prevUserIdRef.current = userId
      // Reload data for new user
      const savedConfig = localStorage.getItem(makeKey(userId, 'config', 'default'))
      const savedMessages = localStorage.getItem(makeKey(userId, 'messages', 'default'))
      setActiveConfig(savedConfig ? JSON.parse(savedConfig) : null)
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages)
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })))
      } else {
        setMessages([{
          id: 'welcome_' + Date.now(),
          sender: 'agent',
          text: `Salom! Men **Mazaika AI** — sizning shaxsiy AI developeringizman! 🚀\n\nG'oyangizni yozing yoki rasm yuboring!`,
          timestamp: new Date()
        }])
      }
      setActiveProjectId('default')
    }
  }, [userId])

  const switchProject = (projectId: string, config: any) => {
    setActiveProjectId(projectId)
    if (config !== null) {
      setActiveConfig(config)
    }

    const savedConfig = localStorage.getItem(makeKey(userId, 'config', projectId))
    if (savedConfig) {
      try { setActiveConfig(JSON.parse(savedConfig)) } catch {}
    }

    const savedMessages = localStorage.getItem(makeKey(userId, 'messages', projectId))
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages)
      setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })))
    } else {
      setMessages([
        {
          id: 'welcome_' + projectId,
          sender: 'agent',
          text: `Bu loyiha uchun AI tayyor! ✨\n\nBotni yaxshilash, yangi bloklar qo'shish yoki sayt yaratish uchun yozing.\n\n📸 Rasm yuborib ham ko'rsatishingiz mumkin!`,
          timestamp: new Date()
        }
      ])
    }
  }

  const clearChat = () => {
    setActiveConfig(null)
    const welcomeText = `Salom! Men **Mazaika AI** — sizning shaxsiy AI developeringizman! 🚀\n\nChat tozalandi. Yangi g'oyangizni yozing!`
    setMessages([{ id: 'welcome_' + Date.now(), sender: 'agent', text: welcomeText, timestamp: new Date() }])
    localStorage.removeItem(makeKey(userId, 'config', activeProjectId))
    localStorage.removeItem(makeKey(userId, 'messages', activeProjectId))
  }

  const toggleWidget = () => setWidgetOpen(prev => !prev)

  const applyPatchOperations = (ops: PatchOperation[]) => {
    if (!ops || ops.length === 0) return
    setActiveConfig((prevConfig: any) => {
      if (!prevConfig) return prevConfig
      const updated = { ...prevConfig }
      try {
        const normalizedOps = ops.map(op => ({
          ...op,
          path: op.path.startsWith('/') ? op.path : '/' + op.path.replace(/\./g, '/')
        }))
        import('fast-json-patch').then(jsonpatch => {
          const newDoc = jsonpatch.applyPatch(updated, normalizedOps).newDocument
          setActiveConfig(newDoc)
          localStorage.setItem(makeKey(userId, 'config', activeProjectId), JSON.stringify(newDoc))
        })
        return updated
      } catch (e) {
        console.error('Patch application failed:', e)
        return updated
      }
    })
  }

  const sendMessage = async (
    text: string,
    overrideMode?: 'FULL_GENERATION' | 'PATCH',
    targetEntity?: 'bot_and_mini_app' | 'site_only',
    imageBase64?: string,
    imageMimeType?: string
  ) => {
    if (!text.trim() || isGenerating) return null

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date(),
      imageUrl: imageBase64 ? `data:${imageMimeType || 'image/jpeg'};base64,${imageBase64}` : undefined
    }

    setMessages(prev => {
      const updated = [...prev, userMsg]
      try {
        localStorage.setItem(makeKey(userId, 'messages', activeProjectId), JSON.stringify(updated))
      } catch (e) {
        console.warn('LocalStorage quota exceeded, truncating messages')
        localStorage.setItem(makeKey(userId, 'messages', activeProjectId), JSON.stringify(updated.slice(-10)))
      }
      return updated
    })
    setIsGenerating(true)

    try {
      const chatHistory = messages.slice(-10).map(m => ({
        role: m.sender,
        content: m.text
      }))

      const response = await queryAntigravityAgent(text, {
        executionMode: overrideMode as 'FULL_GENERATION' | 'PATCH' | 'DISCUSSION' | undefined,
        selectedElementId: activeElementId,
        currentConfig: activeConfig,
        currentPage: window.location.pathname,
        chatHistory,
        targetEntity,
        imageBase64,
        imageMimeType
      })

      const agentMsg: ChatMessage = {
        id: 'agent_' + Date.now(),
        sender: 'agent',
        text: response.explanation,
        explanation: response.explanation,
        projectData: response.project_data,
        patchOperations: response.patch_operations,
        timestamp: new Date()
      }

      setMessages(prev => {
        const updated = [...prev, agentMsg]
        try {
          localStorage.setItem(makeKey(userId, 'messages', activeProjectId), JSON.stringify(updated))
        } catch (e) {
          console.warn('LocalStorage quota exceeded, truncating messages')
          localStorage.setItem(makeKey(userId, 'messages', activeProjectId), JSON.stringify(updated.slice(-10)))
        }
        return updated
      })

      if (response.execution_mode === 'PATCH' && response.patch_operations) {
        applyPatchOperations(response.patch_operations)
      } else if (response.execution_mode === 'FULL_GENERATION' && response.project_data) {
        setActiveConfig(response.project_data)
        localStorage.setItem(makeKey(userId, 'config', activeProjectId), JSON.stringify(response.project_data))
      }

      return response
    } catch (err) {
      console.error('AI Agent error:', err)
      const errorMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        sender: 'agent',
        text: 'Kechirasiz, so\'rovni qayta ishlashda xatolik yuz berdi. Qaytadan urinib ko\'ring.',
        timestamp: new Date()
      }
      setMessages(prev => {
        const updated = [...prev, errorMsg]
        try {
          localStorage.setItem(makeKey(userId, 'messages', activeProjectId), JSON.stringify(updated))
        } catch (e) {
          console.warn('LocalStorage quota exceeded, truncating messages')
          // Truncate to last 10 messages if quota exceeded
          localStorage.setItem(makeKey(userId, 'messages', activeProjectId), JSON.stringify(updated.slice(-10)))
        }
        return updated
      })
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <AICopilotContext.Provider value={{
      isWidgetOpen,
      setWidgetOpen,
      toggleWidget,
      activeElementId,
      setActiveElementId,
      messages,
      isGenerating,
      sendMessage,
      activeConfig,
      setActiveConfig,
      applyPatchOperations,
      activeProjectId,
      switchProject,
      clearChat
    }}>
      {children}
    </AICopilotContext.Provider>
  )
}

export function useAICopilot() {
  const context = useContext(AICopilotContext)
  if (!context) {
    throw new Error('useAICopilot must be used within an AICopilotProvider')
  }
  return context
}
