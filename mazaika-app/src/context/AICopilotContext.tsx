import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
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
  imageUrl?: string
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

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function safeWrite(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    try {
      if (Array.isArray(value)) {
        localStorage.setItem(key, JSON.stringify(value.slice(-15)))
      }
    } catch {
      console.error('Unable to save to localStorage')
    }
  }
}

function makeWelcomeMessages(projectId: string): ChatMessage[] {
  const isNew = projectId === 'default'
  return [{
    id: 'welcome_' + Date.now(),
    sender: 'agent',
    text: isNew
      ? `Salom! Men **Mazaika AI** — sizning shaxsiy AI developeringizman! 🚀\n\nMen quyidagilarda yordam bera olaman:\n- 🤖 **Telegram bot** yaratish — to'liq ishlaydigan kod bilan\n- 🌐 **Sayt** yaratish — to'liq HTML/CSS/JS\n- ✨ **Mini App** yaratish — Telegram ichida ishlaydi\n- 📸 **Rasm yuboring** — men uni tahlil qilib sizga kerakli narsani yarataman!\n- 🏪 **To'liq ekosistem** — Bot + Mini App + Sayt bir vaqtda!\n\nG'oyangizni yozing yoki rasm yuboring!`
      : `Bu loyiha uchun AI tayyor! ✨\n\nBotni yaxshilash, yangi bloklar qo'shish, sayt yoki Mini App yaratish uchun yozing.\n\n📸 Rasm yuborib ham ko'rsatishingiz mumkin!`,
    timestamp: new Date()
  }]
}

export const AICopilotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore()
  const userId = user?.id

  const [isWidgetOpen, setWidgetOpen] = useState(false)
  const [activeElementId, setActiveElementId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Use ref to always have the latest projectId in async callbacks (prevents stale closure)
  const activeProjectIdRef = useRef<string>('default')
  const [activeProjectId, _setActiveProjectId] = useState<string>('default')
  const setActiveProjectId = useCallback((id: string) => {
    activeProjectIdRef.current = id
    _setActiveProjectId(id)
  }, [])

  const prevUserIdRef = useRef<string | undefined>(userId)

  const [activeConfig, setActiveConfig] = useState<any>(() => {
    return safeRead(makeKey(userId, 'config', 'default'), null)
  })

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = safeRead<any[]>(makeKey(userId, 'messages', 'default'), [])
    if (saved.length > 0) {
      return saved
        .filter((m: any) => !m.text?.includes('PREVIOUS RESPONSE WAS INVALID HTML'))
        .map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
    }
    return makeWelcomeMessages('default')
  })

  // Re-initialize when user changes (login/logout)
  useEffect(() => {
    if (prevUserIdRef.current !== userId) {
      prevUserIdRef.current = userId
      const pid = activeProjectIdRef.current
      const savedConfig = safeRead(makeKey(userId, 'config', pid), null)
      const savedMessages = safeRead<any[]>(makeKey(userId, 'messages', pid), [])
      setActiveConfig(savedConfig)
      if (savedMessages.length > 0) {
        setMessages(savedMessages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })))
      } else {
        setMessages(makeWelcomeMessages(pid))
      }
      setActiveProjectId('default')
    }
  }, [userId, setActiveProjectId])

  const switchProject = useCallback((projectId: string, config: any) => {
    setActiveProjectId(projectId)

    const savedConfig = safeRead(makeKey(userId, 'config', projectId), null)
    if (savedConfig) {
      setActiveConfig(savedConfig)
    } else if (config !== null) {
      setActiveConfig(config)
    } else {
      setActiveConfig(null)
    }

    const savedMessages = safeRead<any[]>(makeKey(userId, 'messages', projectId), [])
    if (savedMessages.length > 0) {
      setMessages(
        savedMessages
          .filter((m: any) => !m.text?.includes('PREVIOUS RESPONSE WAS INVALID HTML'))
          .map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
      )
    } else {
      setMessages(makeWelcomeMessages(projectId))
    }
  }, [userId, setActiveProjectId])

  const clearChat = useCallback(() => {
    const pid = activeProjectIdRef.current
    setActiveConfig(null)
    const welcome = makeWelcomeMessages(pid)
    setMessages(welcome)
    localStorage.removeItem(makeKey(userId, 'config', pid))
    safeWrite(makeKey(userId, 'messages', pid), welcome)
  }, [userId])

  const toggleWidget = () => setWidgetOpen(prev => !prev)

  const applyPatchOperations = useCallback((ops: PatchOperation[]) => {
    if (!ops || ops.length === 0) return
    const pid = activeProjectIdRef.current
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
          safeWrite(makeKey(userId, 'config', pid), newDoc)
        })
        return updated
      } catch (e) {
        console.error('Patch application failed:', e)
        return updated
      }
    })
  }, [userId])

  const sendMessage = useCallback(async (
    text: string,
    overrideMode?: 'FULL_GENERATION' | 'PATCH',
    targetEntity?: 'bot_and_mini_app' | 'site_only',
    imageBase64?: string,
    imageMimeType?: string
  ) => {
    if (!text.trim() || isGenerating) return null

    // Capture projectId at call time — avoids stale closure bug
    const currentProjectId = activeProjectIdRef.current

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date(),
      imageUrl: imageBase64 ? `data:${imageMimeType || 'image/jpeg'};base64,${imageBase64}` : undefined
    }

    let currentMessages: ChatMessage[] = []
    setMessages(prev => {
      currentMessages = prev
      const updated = [...prev, userMsg]
      safeWrite(makeKey(userId, 'messages', currentProjectId), updated)
      return updated
    })
    setIsGenerating(true)

    try {
      const chatHistory = currentMessages.slice(-10).map(m => ({
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
        safeWrite(makeKey(userId, 'messages', currentProjectId), updated)
        return updated
      })

      if (response.execution_mode === 'PATCH' && response.patch_operations) {
        applyPatchOperations(response.patch_operations)
      } else if (response.execution_mode === 'FULL_GENERATION' && response.project_data) {
        setActiveConfig(response.project_data)
        safeWrite(makeKey(userId, 'config', currentProjectId), response.project_data)
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
        safeWrite(makeKey(userId, 'messages', currentProjectId), updated)
        return updated
      })
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [isGenerating, userId, activeElementId, activeConfig, applyPatchOperations])

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
