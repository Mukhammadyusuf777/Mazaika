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
  target_entity: 'bot' | 'mini_app' | 'website' | 'bot_and_mini_app' | 'site_only' | 'none'
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
    imageBase64?: string
    imageMimeType?: string
  }
): Promise<AgentResponsePayload> {
  const baseUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname.includes('pages.dev') ? 'https://mazaika.onrender.com' : 'http://localhost:3000')
  const backendUrl = `${baseUrl}/api/ai/generate`

  try {
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        executionMode: contextMeta?.executionMode,
        currentHtml: contextMeta?.currentConfig?.source_code || contextMeta?.currentConfig?.html || '',
        html: contextMeta?.currentConfig?.source_code || contextMeta?.currentConfig?.html || '',
        siteHtml: contextMeta?.currentConfig?.source_code || contextMeta?.currentConfig?.html || '',
        currentPage: contextMeta?.currentPage,
        selectedBlockId: contextMeta?.selectedElementId,
        currentConfig: contextMeta?.currentConfig,
        chatHistory: contextMeta?.chatHistory || [],
        targetEntity: contextMeta?.targetEntity,
        // Vision fields
        imageBase64: contextMeta?.imageBase64 || null,
        imageMimeType: contextMeta?.imageMimeType || null,
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

    const executionMode = data.execution_mode || (
      data.type === 'site' || data.html || data.source_code || data.website_html
        ? 'FULL_GENERATION'
        : 'DISCUSSION'
    )

    if (executionMode === 'PATCH') {
      return {
        explanation: data.explanation || 'Element muvaffaqiyatli yangilandi! ✨',
        execution_mode: 'PATCH',
        target_entity: 'none',
        patch_operations: data.patch_operations || []
      }
    } else if (
      executionMode === 'FULL_GENERATION' ||
      data.type === 'site' ||
      data.html ||
      data.source_code ||
      data.website_html
    ) {
      const projectData = data.project_data || data
      const htmlCode =
        projectData.source_code ||
        projectData.html ||
        projectData.website_html ||
        projectData.site_code ||
        projectData.code ||
        data.html ||
        data.source_code ||
        data.website_html ||
        data.site_code ||
        data.code ||
        ''
      let targetEntity: any = 'bot_and_mini_app'
      if (data.target_entity) {
        targetEntity = data.target_entity
      } else if (contextMeta?.targetEntity) {
        targetEntity = contextMeta.targetEntity
      } else if (data.type === 'site' || projectData.type === 'site') {
        targetEntity = 'site_only'
      } else if (data.type === 'bot' || projectData.type === 'bot') {
        targetEntity = 'bot'
      }

      const isRu = /[а-яА-ЯёЁ]/.test(prompt)
      const defaultExplanation = isRu
        ? (targetEntity === 'bot_and_mini_app'
            ? 'Ваш Telegram бот и Mini App успешно созданы! 🚀 Вы можете протестировать их в правой панели.'
            : 'Ваш проект успешно создан! 🚀 Вы можете просмотреть его в панели справа.')
        : (targetEntity === 'bot_and_mini_app'
            ? 'Telegram bot va Mini App muvaffaqiyatli yaratildi! 🚀 O\'ng tomondagi jonli oynada ko\'rishingiz mumkin.'
            : 'Loyiha muvaffaqiyatli yaratildi! 🚀 O\'ng tomondagi jonli oynada ko\'rishingiz mumkin.')

      return {
        explanation: data.explanation || defaultExplanation,
        execution_mode: 'FULL_GENERATION',
        target_entity: targetEntity,
        project_data: {
          target_entity: targetEntity,
          appName: projectData.appName || projectData.title || prompt,
          theme: projectData.theme || 'glassmorphism',
          themeColor: projectData.themeColor || '#1e90ff',
          source_code: htmlCode,
          files: projectData.files || data.files || (htmlCode ? { 'index.html': htmlCode } : {}),
          blocks: projectData.blocks || [],
          bot_blocks: projectData.bot_blocks || data.bot_blocks || [],
          bot_edges: projectData.bot_edges || data.bot_edges || [],
          bot_code: projectData.bot_code || data.bot_code || '',
          site_blocks: projectData.site_blocks || [],
          has_more: data.has_more || false
        }
      }
    } else {
      // DISCUSSION MODE
      const isRu = /[а-яА-ЯёЁ]/.test(prompt)
      return {
        explanation: data.explanation || (
          isRu
            ? 'Ответ готов! Что мы добавим или изменим дальше?'
            : 'Javob tayyor! Qanday yangi bo\'lim qo\'shamiz?'
        ),
        execution_mode: 'DISCUSSION',
        target_entity: 'none'
      }
    }
  } catch (error: any) {
    console.error('Failed to fetch from NestJS AI API:', error)
    const errMsg = error.message || 'Unknown network error'

    return {
      explanation: `Xatolik: ${errMsg}. Backend ishga tushirilganini tekshiring.`,
      execution_mode: 'DISCUSSION',
      target_entity: 'none'
    }
  }
}
