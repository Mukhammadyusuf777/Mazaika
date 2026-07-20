/**
 * Antigravity AI Copilot Engine — Mozaika Generative AI Engine
 * Queries the NestJS backend for Gemini AI generation and patches.
 */

export interface PatchOperation {
  op: 'replace' | 'add' | 'remove'
  path: string
  value: any
}

export interface AgentResponsePayload {
  explanation: string
  execution_mode: 'FULL_GENERATION' | 'PATCH'
  target_entity: 'bot' | 'mini_app' | 'website'
  project_data?: any
  patch_operations?: PatchOperation[]
}

/**
 * Primary Agent Query Function
 * Calls the secure NestJS backend at /api/ai/generate or /api/ai/patch.
 */
export async function queryAntigravityAgent(
  prompt: string,
  contextMeta?: {
    executionMode?: 'FULL_GENERATION' | 'PATCH'
    currentPage?: string
    selectedElementId?: string | null
    currentConfig?: any
  }
): Promise<AgentResponsePayload> {
  const lowerPrompt = prompt.toLowerCase()
  
  // STRICT PATCH MODE DETERMINATION:
  // If executionMode is explicitly FULL_GENERATION, isPatchMode MUST be false!
  const isExplicitFullGen = contextMeta?.executionMode === 'FULL_GENERATION'
  const isPatchMode = isExplicitFullGen ? false : (contextMeta?.executionMode === 'PATCH' || (!!contextMeta?.selectedElementId && !lowerPrompt.includes('yarat') && !lowerPrompt.includes('создай') && !lowerPrompt.includes('noldan') && !lowerPrompt.includes('yangi')))

  const endpoint = isPatchMode ? '/api/ai/patch' : '/api/ai/generate'
  // Use VITE_API_URL for production (Render backend), fallback to localhost for local dev
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  const backendUrl = `${baseUrl}${endpoint}`

  try {
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        currentPage: contextMeta?.currentPage,
        selectedBlockId: contextMeta?.selectedElementId,
        currentConfig: contextMeta?.currentConfig
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
    if (isPatchMode) {
      return {
        explanation: data.explanation || 'Элемент обновлен с помощью AI!',
        execution_mode: 'PATCH',
        target_entity: 'mini_app',
        patch_operations: data.patch_operations || []
      }
    } else {
      const projectData = data.project_data || {};
      const targetEntity = data.target_entity || 'mini_app';
      return {
        explanation: data.explanation || 'Проект сгенерирован с помощью AI!',
        execution_mode: 'FULL_GENERATION',
        target_entity: targetEntity,
        project_data: {
          target_entity: targetEntity,
          appName: projectData.appName || prompt,
          theme: projectData.theme || 'glassmorphism',
          themeColor: projectData.themeColor || '#1e90ff',
          blocks: projectData.blocks || []
        }
      }
    }
  } catch (error: any) {
    console.error("Failed to fetch from NestJS AI API:", error)
    
    const errMsg = error.message || 'Неизвестная ошибка сети'
    
    // Return a clean connection error state instead of fake hardcoded components
    return {
      explanation: `Ошибка API: ${errMsg}. Убедитесь, что бэкенд запущен и ключи API (Gemini) настроены верно.`,
      execution_mode: 'FULL_GENERATION',
      target_entity: 'mini_app',
      project_data: {
        appName: 'API Error',
        theme: 'minimalist',
        themeColor: '#ef4444',
        blocks: [
          {
            id: 'err1',
            type: 'hero',
            title: 'Ошибка сервера',
            subtitle: errMsg,
            img: 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=800'
          }
        ]
      }
    }
  }
}
