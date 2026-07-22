import builtins

file_path = 'C:/Mazaika/mazaika-app/src/context/AICopilotContext.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the two useEffects that persist to localStorage
import re

# Remove messages useEffect
content = re.sub(r'  // Persist messages whenever they change\n  React\.useEffect\(\(\) => \{\n    localStorage\.setItem\(\'mazaika_ai_messages_\' \+ activeProjectId, JSON\.stringify\(messages\)\)\n  \}, \[messages, activeProjectId\]\)\n', '', content)

# Remove config useEffect
content = re.sub(r'  // Persist config whenever it changes\n  React\.useEffect\(\(\) => \{\n    if \(activeConfig\) \{\n      localStorage\.setItem\(\'mazaika_ai_config_\' \+ activeProjectId, JSON\.stringify\(activeConfig\)\)\n    \} else \{\n      localStorage\.removeItem\(\'mazaika_ai_config_\' \+ activeProjectId\)\n    \}\n  \}, \[activeConfig, activeProjectId\]\)\n', '', content)

# 2. Update applyPatchOperations to save to localStorage
def replace_patch_ops(match):
    return """  const applyPatchOperations = (ops: PatchOperation[]) => {
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
      
      localStorage.setItem('mazaika_ai_config_' + activeProjectId, JSON.stringify(updated))
      return updated
    })
  }"""

content = re.sub(r'  const applyPatchOperations = \(ops: PatchOperation\[\]\) => \{[\s\S]*?      return updated\n    \}\)\n  \}', replace_patch_ops, content)

# 3. Update sendMessage to save messages and config
def replace_send_message(match):
    return """  const sendMessage = async (text: string, overrideMode?: 'FULL_GENERATION' | 'PATCH') => {
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
  }"""

content = re.sub(r'  const sendMessage = async \(text: string, overrideMode\?: \'FULL_GENERATION\' \| \'PATCH\'\) => \{[\s\S]*?  return \(\n    <AICopilotContext\.Provider', lambda m: replace_send_message(m) + '\n  return (\n    <AICopilotContext.Provider', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Context patched successfully to prevent localStorage races.")
