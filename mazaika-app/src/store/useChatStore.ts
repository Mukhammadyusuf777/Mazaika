import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AgentResponsePayload, PatchOperation } from '../api/aiAgentEngine'
import { queryAntigravityAgent } from '../api/aiAgentEngine'

export interface ChatMessage {
  id: string
  sender: 'user' | 'agent'
  text: string
  timestamp: Date
  imageUrl?: string
  projectData?: any
  patchOperations?: PatchOperation[]
  explanation?: string
}

export interface ChatState {
  chats: Record<string, ChatMessage[]> // projectId -> messages
  isOpen: boolean
  isLoading: boolean
  projectId: string
  
  // Actions
  setProjectId: (id: string) => void
  setIsOpen: (isOpen: boolean) => void
  toggleOpen: () => void
  addMessage: (msg: ChatMessage) => void
  clearMessages: () => void
  
  // Config state
  activeConfig: any
  setActiveConfig: (config: any) => void
  applyPatchOperations: (ops: PatchOperation[]) => void

  sendMessage: (
    text: string,
    overrideMode?: 'FULL_GENERATION' | 'PATCH',
    targetEntity?: 'bot_and_mini_app' | 'site_only',
    imageBase64?: string,
    imageMimeType?: string,
    activeConfig?: any
  ) => Promise<AgentResponsePayload | null>

  migrateHistory: (oldId: string, newId: string) => void
}

function makeWelcomeMessages(projectId: string): ChatMessage[] {
  const isNew = projectId === 'default'
  return [{
    id: 'welcome_' + Date.now(),
    sender: 'agent',
    text: isNew
      ? `Salom! Men **Mazaika AI** — sizning shaxsiy AI developeringizman! 🚀\n\nMen quyidagilarda yordam bera olaman:\n- 🤖 **Telegram bot** yaratish\n- 🌐 **Sayt** yaratish\n- ✨ **Mini App** yaratish\n\nG'oyangizni yozing yoki rasm yuboring!`
      : `Bu loyiha uchun AI tayyor! ✨\n\nBotni yaxshilash yoki dizaynni o'zgartirish uchun yozing.`,
    timestamp: new Date()
  }]
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: {
        'default': makeWelcomeMessages('default')
      },
      isOpen: false,
      isLoading: false,
      projectId: 'default',
      activeConfig: null,

      setActiveConfig: (config) => set({ activeConfig: typeof config === 'function' ? config(get().activeConfig) : config }),
      
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

      setProjectId: (id) => set((state) => {
        if (state.projectId === id) return {}
        const newChats = { ...state.chats }
        if (!newChats[id]) {
          newChats[id] = makeWelcomeMessages(id)
        }
        return { projectId: id, chats: newChats }
      }),

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
          }
        }
      }),

      migrateHistory: (oldId, newId) => set((state) => {
        const history = state.chats[oldId] || []
        // We only migrate if there's actual history (more than just welcome message)
        if (history.length <= 1) return {} 
        
        const newChats = { ...state.chats }
        newChats[newId] = history.map(msg => ({ ...msg })) // clone
        delete newChats[oldId] // optional, clean up workspace chat
        
        return { chats: newChats, projectId: newId }
      }),

      sendMessage: async (text, overrideMode, targetEntity, imageBase64, imageMimeType, activeConfig) => {
        const { addMessage, projectId, chats } = get()
        
        const userMsg: ChatMessage = {
          id: 'user_' + Date.now(),
          sender: 'user',
          text,
          timestamp: new Date(),
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
              currentConfig: activeConfig,
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
              timestamp: new Date(),
              projectData: res.execution_mode === 'FULL_GENERATION' ? res : undefined,
              patchOperations: res.execution_mode === 'PATCH' ? res.patch_operations : undefined
            }
            addMessage(agentMsg)
            
            // ✅ AUTO-SYNC: Update activeConfig on FULL_GENERATION
            if (res.execution_mode === 'FULL_GENERATION' && res.project_data) {
              const { activeConfig, setActiveConfig } = get()
              setActiveConfig({
                ...activeConfig,
                ...res.project_data,
                has_more: res.project_data.has_more
              })
            }
          }
          return res
        } catch (e) {
          addMessage({
            id: 'err_' + Date.now(),
            sender: 'agent',
            text: "Xatolik yuz berdi. Iltimos qayta urinib ko'ring.",
            timestamp: new Date()
          })
          return null
        } finally {
          set({ isLoading: false })
        }
      }
    }),
    {
      name: 'mazaika-chat-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({ chats: state.chats, projectId: state.projectId }),
    }
  )
)
