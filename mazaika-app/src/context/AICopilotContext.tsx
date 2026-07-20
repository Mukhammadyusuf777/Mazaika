import React, { createContext, useContext, useState } from 'react'
import { queryAntigravityAgent } from '../api/aiAgentEngine'
import type { AgentResponsePayload, PatchOperation } from '../api/aiAgentEngine'

export interface ChatMessage {
  id: string
  sender: 'user' | 'agent'
  text: string
  explanation?: string
  timestamp: Date
  projectData?: any
  patchOperations?: PatchOperation[]
}

interface AICopilotContextType {
  isWidgetOpen: boolean
  setWidgetOpen: (open: boolean) => void
  toggleWidget: () => void
  activeElementId: string | null
  setActiveElementId: (id: string | null) => void
  messages: ChatMessage[]
  isGenerating: boolean
  sendMessage: (text: string, overrideMode?: 'FULL_GENERATION' | 'PATCH') => Promise<AgentResponsePayload | null>
  activeConfig: any
  setActiveConfig: React.Dispatch<React.SetStateAction<any>>
  applyPatchOperations: (ops: PatchOperation[]) => void
}

const AICopilotContext = createContext<AICopilotContextType | undefined>(undefined)

export const AICopilotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isWidgetOpen, setWidgetOpen] = useState(false)
  const [activeElementId, setActiveElementId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeConfig, setActiveConfig] = useState<any>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'agent',
      text: 'Salom! Men sizning Antigravity AI Агентингизман 🤖. Istalgan g\'oyangizni yozing va men uni lahzalarda tayyor Mini App, bot yoki saytga aylantirib beraman!',
      explanation: 'Готов генерировать новые проекты или редактировать текущий интерфейс по вашему запросу.',
      timestamp: new Date()
    }
  ])

  const toggleWidget = () => setWidgetOpen(prev => !prev)

  const applyPatchOperations = (ops: PatchOperation[]) => {
    if (!ops || ops.length === 0) return

    setActiveConfig((prevConfig: any) => {
      if (!prevConfig) return prevConfig
      let updated = { ...prevConfig }

      ops.forEach(op => {
        if (op.path === 'themeColor') {
          updated.themeColor = op.value
        } else if (op.path === 'theme') {
          updated.theme = op.value
        } else if (op.path === 'appName') {
          updated.appName = op.value
        } else if (op.path === 'blocks' && op.op === 'add') {
          updated.blocks = [...(updated.blocks || []), op.value]
        } else if (op.path.startsWith('blocks.') && op.op === 'replace') {
          const parts = op.path.split('.')
          const blockIdx = parseInt(parts[1], 10)
          const field = parts[2]
          if (updated.blocks && updated.blocks[blockIdx]) {
            const newBlocks = [...updated.blocks]
            newBlocks[blockIdx] = { ...newBlocks[blockIdx], [field]: op.value }
            updated.blocks = newBlocks
          }
        }
      })

      return updated
    })
  }

  const sendMessage = async (text: string, overrideMode?: 'FULL_GENERATION' | 'PATCH') => {
    if (!text.trim() || isGenerating) return null

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMsg])
    setIsGenerating(true)

    try {
      const response = await queryAntigravityAgent(text, {
        executionMode: overrideMode,
        selectedElementId: activeElementId,
        currentConfig: activeConfig,
        currentPage: window.location.pathname
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

      setMessages(prev => [...prev, agentMsg])

      if (response.execution_mode === 'PATCH' && response.patch_operations) {
        applyPatchOperations(response.patch_operations)
      } else if (response.execution_mode === 'FULL_GENERATION' && response.project_data) {
        setActiveConfig(response.project_data)
      }

      return response
    } catch (err) {
      console.error("AI Agent error:", err)
      const errorMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        sender: 'agent',
        text: 'Kechirasiz, sorovni qayta ishlashda xatolik yuz berdi. Qaytadan urinib koring.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMsg])
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
      applyPatchOperations
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
