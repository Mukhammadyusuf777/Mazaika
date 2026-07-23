/**
 * Mazaika AI
 * aiAgentEngine.ts
 * Queries the NestJS backend for Gemini AI generation, patches, and conversation.
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
    targetEntity?: 'bot_and_mini_app' | 'site_only'
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
        chatHistory: contextMeta?.chatHistory || [],
        targetEntity: contextMeta?.targetEntity
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
    
    const executionMode = data.execution_mode || (data.type === 'site' || data.html || data.source_code || data.website_html ? 'FULL_GENERATION' : 'DISCUSSION')

    if (executionMode === 'PATCH') {
      return {
        explanation: data.explanation || 'Element muvaffaqiyatli yangilandi! ✨',
        execution_mode: 'PATCH',
        target_entity: 'none',
        patch_operations: data.patch_operations || []
      }
    } else if (executionMode === 'FULL_GENERATION' || data.type === 'site' || data.html || data.source_code || data.website_html) {
      const projectData = data.project_data || data;
      const htmlCode = projectData.source_code || projectData.html || projectData.website_html || projectData.site_code || projectData.code || data.html || data.source_code || data.website_html || data.site_code || data.code || '';
      const targetEntity = (htmlCode || data.type === 'site') ? 'site_only' : (data.target_entity || 'site_only');
      const isRu = /[а-яА-ЯёЁ]/.test(prompt);

      return {
        explanation: data.explanation || (isRu ? "Ваш сайт успешно создан! 🚀 Вы можете просмотреть его в панели справа." : "Sayt muvaffaqiyatli yaratildi! 🚀 O'ng tomondagi jonli oynada ko'rishingiz mumkin."),
        execution_mode: 'FULL_GENERATION',
        target_entity: targetEntity,
        project_data: {
          target_entity: targetEntity,
          appName: projectData.appName || projectData.title || prompt,
          theme: projectData.theme || 'glassmorphism',
          themeColor: projectData.themeColor || '#1e90ff',
          source_code: htmlCode,
          blocks: projectData.blocks || [],
          bot_blocks: projectData.bot_blocks || [],
          site_blocks: projectData.site_blocks || []
        }
      }
    } else {
      // DISCUSSION MODE
      const isRu = /[а-яА-ЯёЁ]/.test(prompt);
      return {
        explanation: data.explanation || (isRu ? "Ответ готов! Что мы добавим или изменим дальше?" : "Javob tayyor! Qanday yangi bo'lim qo'shamiz?"),
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
