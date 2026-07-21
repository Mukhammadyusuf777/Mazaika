/**
 * Mazaika AI Copilot Engine
 * Queries the NestJS backend for Groq AI generation, patches, and conversation.
 */

export interface PatchOperation {
  op: 'replace' | 'add' | 'remove'
  path: string
  value: any
}

export interface AgentResponsePayload {
  explanation: string
  execution_mode: 'FULL_GENERATION' | 'PATCH' | 'DISCUSSION'
  target_entity: 'bot' | 'mini_app' | 'website' | 'bot_and_mini_app' | 'none'
  project_data?: any
  patch_operations?: PatchOperation[]
}

/**
 * Primary Agent Query Function
 * Calls the secure NestJS backend at /api/ai/generate.
 */
export async function queryAntigravityAgent(
  prompt: string,
  contextMeta?: {
    executionMode?: 'FULL_GENERATION' | 'PATCH' | 'DISCUSSION'
    currentPage?: string
    selectedElementId?: string | null
    currentConfig?: any
    chatHistory?: { role: string, content: string }[]
  }
): Promise<AgentResponsePayload> {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  const backendUrl = `${baseUrl}/api/ai/generate`

  try {
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        currentPage: contextMeta?.currentPage,
        selectedBlockId: contextMeta?.selectedElementId,
        currentConfig: contextMeta?.currentConfig,
        chatHistory: contextMeta?.chatHistory || []
      })
    })

    if (!res.ok) {
      let errBody = ''
      try {
        const errJson = await res.json()
        errBody = errJson.message || errJson.error || res.statusText
      } catch (e) {
        errBody = res.statusText
      }
      throw new Error(`[Status ${res.status}] ${errBody}`)
    }

    const data = await res.json()
    
    const executionMode = data.execution_mode || 'DISCUSSION'

    if (executionMode === 'PATCH') {
      return {
        explanation: data.explanation || 'Element updated via Mazaika AI!',
        execution_mode: 'PATCH',
        target_entity: 'none',
        patch_operations: data.patch_operations || []
      }
    } else if (executionMode === 'FULL_GENERATION') {
      const projectData = data.project_data || {};
      const targetEntity = data.target_entity || 'mini_app';
      return {
        explanation: data.explanation || 'Project generated via Mazaika AI!',
        execution_mode: 'FULL_GENERATION',
        target_entity: targetEntity,
        project_data: {
          target_entity: targetEntity,
          appName: projectData.appName || prompt,
          theme: projectData.theme || 'glassmorphism',
          themeColor: projectData.themeColor || '#1e90ff',
          blocks: projectData.blocks || [],
          bot_blocks: projectData.bot_blocks || [],
          site_blocks: projectData.site_blocks || []
        }
      }
    } else {
      // DISCUSSION MODE
      return {
        explanation: data.explanation || 'Mazaika AI is responding...',
        execution_mode: 'DISCUSSION',
        target_entity: 'none'
      }
    }
  } catch (error: any) {
    console.error("Failed to fetch from NestJS AI API:", error)
    const errMsg = error.message || 'Unknown network error'
    
    return {
      explanation: `API Error: ${errMsg}. Please ensure the backend is running.`,
      execution_mode: 'DISCUSSION',
      target_entity: 'none'
    }
  }
}
