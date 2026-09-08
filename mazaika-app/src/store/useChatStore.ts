import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AgentResponsePayload, PatchOperation } from '../api/aiAgentEngine'
import { queryAntigravityAgent } from '../api/aiAgentEngine'

export interface ChatMessage {
  id: string
  sender: 'user' | 'agent'
  text: string
  timestamp: Date | string
  imageUrl?: string
  projectData?: any
  patchOperations?: PatchOperation[]
  explanation?: string
}

export interface ChatState {
  chats: Record<string, ChatMessage[]> // projectId -> messages
  configs: Record<string, any> // projectId -> activeConfig
  isOpen: boolean
  isLoading: boolean
  projectId: string
  activeConfig: any
  
  // Actions
  setProjectId: (id: string, initialConfig?: any) => void
  startNewChat: (prefix?: string) => string
  setIsOpen: (isOpen: boolean) => void
  toggleOpen: () => void
  addMessage: (msg: ChatMessage) => void
  clearMessages: () => void
  
  // Config state
  setActiveConfig: (config: any) => void
  applyPatchOperations: (ops: PatchOperation[]) => void

  sendMessage: (
    text: string,
    overrideMode?: 'FULL_GENERATION' | 'PATCH',
    targetEntity?: 'bot_and_mini_app' | 'site_only',
    imageBase64?: string,
    imageMimeType?: string,
    customConfig?: any
  ) => Promise<AgentResponsePayload | null>

  migrateHistory: (oldId: string, newId: string) => void
  clearAllChats: () => void
}

function makeWelcomeMessages(projectId: string): ChatMessage[] {
  const isDraft = projectId.startsWith('draft_') || projectId === 'default'
  return [{
    id: 'welcome_' + Date.now(),
    sender: 'agent',
    text: isDraft
      ? `Salom! Men **Mazaika AI** — sizning shaxsiy AI developeringizman! 🚀\n\nMen quyidagilarda yordam bera olaman:\n- 🤖 **Telegram bot** yaratish\n- 🌐 **Sayt** yaratish\n- ✨ **Mini App** yaratish\n\nG'oyangizni yozing yoki rasm yuboring!`
      : `Loyiha uchun AI tayyor! ✨\n\nBotni yaxshilash, yangi sahifa qo'shish yoki dizaynni o'zgartirish uchun yozing.`,
    timestamp: new Date().toISOString()
  }]
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: {
        'default': makeWelcomeMessages('default')
      },
      configs: {},
      isOpen: false,
      isLoading: false,
      projectId: 'default',
      activeConfig: null,

      setActiveConfig: (config) => set((state) => {
        const currId = state.projectId
        const newConf = typeof config === 'function' ? config(state.activeConfig) : config
        return {
          activeConfig: newConf,
          configs: {
            ...state.configs,
            [currId]: newConf
          }
        }
      }),
      
      applyPatchOperations: (ops) => {
        if (!ops || ops.length === 0) return
        const { activeConfig, setActiveConfig } = get()
        if (!activeConfig) return
        
        try {
          const normalizedOps = ops.map(op => ({
            ...op,
            path: op.path.startsWith('/') ? op.path : '/' + op.path.replace(/\./g, '/')
          }))
          import('fast-json-patch').then(jsonpatch => {
            const newDoc = jsonpatch.applyPatch({ ...activeConfig }, normalizedOps).newDocument
            setActiveConfig(newDoc)
          })
        } catch (e) {
          console.error('Patch application failed:', e)
        }
      },

      setProjectId: (id: string, initialConfig?: any) => set((state) => {
        const existingMessages = state.chats[id] || makeWelcomeMessages(id)
        const existingConfig = initialConfig !== undefined ? initialConfig : (state.configs[id] || null)
        return { 
          projectId: id, 
          chats: { ...state.chats, [id]: existingMessages },
          configs: { ...state.configs, [id]: existingConfig },
          activeConfig: existingConfig
        }
      }),

      startNewChat: (prefix = 'draft') => {
        const newId = `${prefix}_${Date.now()}`
        set((state) => ({
          projectId: newId,
          chats: {
            ...state.chats,
            [newId]: makeWelcomeMessages(newId)
          },
          configs: {
            ...state.configs,
            [newId]: null
          },
          activeConfig: null
        }))
        return newId
      },

      setIsOpen: (isOpen) => set({ isOpen }),
      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

      addMessage: (msg) => set((state) => {
        const id = state.projectId
        const currentMessages = state.chats[id] || []
        return {
          chats: {
            ...state.chats,
            [id]: [...currentMessages, msg]
          }
        }
      }),

      clearMessages: () => set((state) => {
        const id = state.projectId
        return {
          chats: {
            ...state.chats,
            [id]: makeWelcomeMessages(id)
          },
          configs: {
            ...state.configs,
            [id]: null
          },
          activeConfig: null
        }
      }),

      migrateHistory: (oldId, newId) => set((state) => {
        const history = state.chats[oldId] || []
        const savedConfig = state.configs[oldId] || state.activeConfig
        
        const newChats = { ...state.chats, [newId]: history.map(msg => ({ ...msg })) }
        const newConfigs = { ...state.configs, [newId]: savedConfig }

        if (oldId !== newId && oldId.startsWith('draft_')) {
          delete newChats[oldId]
          delete newConfigs[oldId]
        }
        
        return { 
          chats: newChats, 
          configs: newConfigs, 
          projectId: newId,
          activeConfig: savedConfig 
        }
      }),

      clearAllChats: () => set({ 
        chats: { 'default': makeWelcomeMessages('default') },
        configs: {},
        projectId: 'default',
        activeConfig: null
      }),

      sendMessage: async (text, overrideMode, targetEntity, imageBase64, imageMimeType, customConfig) => {
        const { addMessage, projectId, chats, activeConfig, configs, setActiveConfig } = get()
        const configToUse = customConfig || activeConfig || configs[projectId] || null
        
        const userMsg: ChatMessage = {
          id: 'user_' + Date.now(),
          sender: 'user',
          text,
          timestamp: new Date().toISOString(),
          imageUrl: imageBase64 ? `data:${imageMimeType || 'image/jpeg'};base64,${imageBase64}` : undefined
        }
        addMessage(userMsg)

        set({ isLoading: true })
        try {
          const currentMessages = chats[projectId] || []
          
          const chatHistory = currentMessages.slice(-10).map((m: any) => ({
            role: m.sender,
            content: m.text
          }))
          
          const res = await queryAntigravityAgent(
            text,
            {
              executionMode: overrideMode,
              targetEntity: targetEntity,
              currentConfig: configToUse,
              chatHistory,
              imageBase64,
              imageMimeType
            }
          )

          if (res) {
            const agentMsg: ChatMessage = {
              id: 'agent_' + Date.now(),
              sender: 'agent',
              text: res.explanation || "Generatsiya yakunlandi.",
              timestamp: new Date().toISOString(),
              projectData: res.execution_mode === 'FULL_GENERATION' ? res : undefined,
              patchOperations: res.execution_mode === 'PATCH' ? res.patch_operations : undefined
            }
            addMessage(agentMsg)
            
            // ✅ AUTO-SYNC: Update activeConfig and persist in configs[projectId] on FULL_GENERATION
            if (res.execution_mode === 'FULL_GENERATION' && res.project_data) {
              const mergedConfig = {
                ...(configToUse || {}),
                ...res.project_data,
                source_code: res.project_data.source_code || res.project_data.html || '',
                files: res.project_data.files || { 'index.html': res.project_data.source_code || res.project_data.html || '' },
                has_more: res.project_data.has_more
              }
              setActiveConfig(mergedConfig)
            }
            // ✅ AUTO-SYNC: Update activeConfig on PATCH
            if (res.execution_mode === 'PATCH' && res.patch_operations) {
              const { applyPatchOperations } = get()
              applyPatchOperations(res.patch_operations)
            }
          }
          return res
        } catch (e: any) {
          addMessage({
            id: 'err_' + Date.now(),
            sender: 'agent',
            text: `Xatolik yuz berdi: ${e?.message || 'Qayta urinib ko\'ring'}.`,
            timestamp: new Date().toISOString()
          })
          return null
        } finally {
          set({ isLoading: false })
        }
      }
    }),
    {
      name: 'mazaika-chat-storage-v2', // bump version to avoid legacy contaminated state
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        chats: state.chats, 
        configs: state.configs, 
        projectId: state.projectId 
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.projectId && state.configs) {
          state.activeConfig = state.configs[state.projectId] || null
        }
      }
    }
  )
)
