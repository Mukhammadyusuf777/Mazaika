import re

file_path = 'C:/Mazaika/mazaika-app/src/context/AICopilotContext.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Context interface
new_interface = """
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
}
"""
content = re.sub(r'interface AICopilotContextType \{.*?\}', new_interface.strip(), content, flags=re.DOTALL)


new_state = """
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
        text: 'Salom! Men sizning Mazaika AI Агентингизман 🤖. Istalgan g\\'oyangizni yozing va men uni lahzalarda tayyor loyihaga aylantirib beraman!',
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

  // Persist messages whenever they change
  React.useEffect(() => {
    localStorage.setItem('mazaika_ai_messages_' + activeProjectId, JSON.stringify(messages))
  }, [messages, activeProjectId])

  // Persist config whenever it changes
  React.useEffect(() => {
    if (activeConfig) {
      localStorage.setItem('mazaika_ai_config_' + activeProjectId, JSON.stringify(activeConfig))
    } else {
      localStorage.removeItem('mazaika_ai_config_' + activeProjectId)
    }
  }, [activeConfig, activeProjectId])
"""

content = re.sub(r'  const \[isWidgetOpen, setWidgetOpen\].*?\}, \[activeConfig\]\)', new_state.strip(), content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Context Patched!")
