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
  activeProjectId: string
  switchProject: (projectId: string, config: any) => void
  startNewProject: () => void
}

const AICopilotContext = createContext<AICopilotContextType | undefined>(undefined)

export const AICopilotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
const [isWidgetOpen, setWidgetOpen] = useState(false)
  const [activeElementId, setActiveElementId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeProjectId, setActiveProjectId] = useState<string>('default')
  
  const [activeConfig, setActiveConfig] = useState<any>(() => {
    const savedConfig = localStorage.getItem('mazaika_ai_config_default')
    return savedConfig ? JSON.parse(savedConfig) : null
  })

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const savedMessages = localStorage.getItem('mazaika_ai_messages_default')
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages)
      return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
    }
    return [
      {
        id: 'welcome_1',
        sender: 'agent',
        text: 'Salom! Men sizning Mazaika AI Агентингизман 🤖. Istalgan g\'oyangizni yozing va men uni lahzalarda tayyor loyihaga aylantirib beraman!',
        timestamp: new Date()
      }
    ]
  })

  const switchProject = (projectId: string, config: any) => {
    setActiveProjectId(projectId)
    setActiveConfig(config)
    
    // Load project messages
    const savedMessages = localStorage.getItem('mazaika_ai_messages_' + projectId)
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages)
      setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })))
    } else {
      setMessages([
        {
          id: 'welcome_' + projectId,
          sender: 'agent',
          text: `Salom! Bu loyiha uchun yordam berishga tayyorman.`,
          timestamp: new Date()
        }
      ])
    }
  }

  const startNewProject = () => {
    const newId = 'new_' + Date.now();
    setActiveProjectId(newId);
    setActiveConfig(null);
    setMessages([
      {
        id: 'welcome_' + newId,
        sender: 'agent',
        text: 'Salom! Men sizning Mazaika AI Агентингизман 🤖. Istalgan g\'oyangizni yozing va men uni lahzalarda tayyor loyihaga aylantirib beraman!',
        timestamp: new Date()
      }
    ]);
  }



  const toggleWidget = () => setWidgetOpen(prev => !prev)

  const applyPatchOperations = (ops: PatchOperation[]) => {
    if (!ops || ops.length === 0) return

    setActiveConfig((prevConfig: any) => {
      if (!prevConfig) return prevConfig
      let updated = { ...prevConfig }

      try {
        // Fast JSON Patch supports RFC6902 (path: '/blocks/0/title' instead of 'blocks.0.title')
        // We will adapt the AI's paths if they use dot notation to slash notation for safety.
        const normalizedOps = ops.map(op => ({
          ...op,
          path: op.path.startsWith('/') ? op.path : '/' + op.path.replace(/\./g, '/')
        }));
        
        import('fast-json-patch').then(jsonpatch => {
          const newDoc = jsonpatch.applyPatch(updated, normalizedOps).newDocument;
          setActiveConfig(newDoc);
          localStorage.setItem('mazaika_ai_config_' + activeProjectId, JSON.stringify(newDoc));
        });
        return updated; // Temporary return while async patch processes
      } catch (e) {
        console.error("Patch application failed:", e);
        return updated;
      }
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

    setMessages(prev => {
      const updated = [...prev, userMsg]
      localStorage.setItem('mazaika_ai_messages_' + activeProjectId, JSON.stringify(updated))
      return updated
    })
    setIsGenerating(true)

    try {
      const chatHistory = messages.slice(-10).map(m => ({
        role: m.sender,
        content: m.text
      }));

      const response = await queryAntigravityAgent(text, {
        executionMode: overrideMode as 'FULL_GENERATION' | 'PATCH' | 'DISCUSSION' | undefined,
        selectedElementId: activeElementId,
        currentConfig: activeConfig,
        currentPage: window.location.pathname,
        chatHistory
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
        localStorage.setItem('mazaika_ai_messages_' + activeProjectId, JSON.stringify(updated))
        return updated
      })

      if (response.execution_mode === 'PATCH' && response.patch_operations) {
        applyPatchOperations(response.patch_operations)
      } else if (response.execution_mode === 'FULL_GENERATION' && response.project_data) {
        setActiveConfig(response.project_data)
        localStorage.setItem('mazaika_ai_config_' + activeProjectId, JSON.stringify(response.project_data))
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
      setMessages(prev => {
        const updated = [...prev, errorMsg]
        localStorage.setItem('mazaika_ai_messages_' + activeProjectId, JSON.stringify(updated))
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
      startNewProject
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
