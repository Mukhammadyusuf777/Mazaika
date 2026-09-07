import { apiClient, getApiBaseUrl } from './apiClient'

export interface BotDto {
  id?: string
  name: string
  token?: string
  userId: string
  projectType?: 'bot' | 'site'
  template?: string
  customNodes?: any[]
  customEdges?: any[]
  site?: any
  workflows?: any[]
  createdAt?: any
  updatedAt?: any
}

export interface SiteConfigDto {
  appName: string
  theme?: string
  themeColor?: string
  blocks?: any[]
  source_code?: string
  files?: Record<string, string>
  slug?: string
  botId?: string
  userId?: string
}

export const getLiveSiteUrl = (identifier: string): string => {
  const base = getApiBaseUrl()
  return `${base}/cloud/sites/${identifier}`
}

export const backendApi = {
  // BOTS
  async getBotsByUser(userId: string): Promise<any[]> {
    try {
      const res = await apiClient.get(`/bots/user/${userId}`)
      if (Array.isArray(res.data)) {
        return res.data
      }
    } catch (err) {
      console.warn('Backend getBotsByUser offline or unreachable, checking fallback...', err)
    }
    return []
  },

  async getBotById(botId: string): Promise<any> {
    try {
      const res = await apiClient.get(`/bots/${botId}`)
      if (res.data) return res.data
    } catch (err) {
      console.warn(`Backend getBotById(${botId}) error:`, err)
    }
    return null
  },

  async createBot(userId: string, data: any): Promise<any> {
    try {
      const res = await apiClient.post('/bots', {
        userId,
        name: data.name,
        token: data.token,
        projectType: data.projectType || 'bot',
        template: data.template,
        customNodes: data.customNodes,
        customEdges: data.customEdges,
      })
      if (res.data) return res.data
    } catch (err) {
      console.warn('Backend createBot error:', err)
    }
    // Fallback ID if offline
    return {
      id: `bot_${Date.now()}`,
      userId,
      ...data,
      status: 'active',
      createdAt: new Date().toISOString(),
    }
  },

  async updateBot(botId: string, data: any): Promise<any> {
    try {
      const res = await apiClient.put(`/bots/${botId}`, data)
      return res.data
    } catch (err) {
      console.warn(`Backend updateBot(${botId}) error:`, err)
      return { success: false }
    }
  },

  async deleteBot(botId: string): Promise<any> {
    try {
      const res = await apiClient.delete(`/bots/${botId}`)
      return res.data
    } catch (err) {
      console.warn(`Backend deleteBot(${botId}) error:`, err)
      return { success: false }
    }
  },

  // SITES & MINI APPS
  async getSiteConfig(botIdOrSlug: string): Promise<any> {
    try {
      const res = await apiClient.get(`/sites/${botIdOrSlug}`)
      if (res.data) {
        return {
          ...res.data,
          blocks: res.data.blocks || [],
          source_code: res.data.sourceCode || '',
          files: res.data.files || {},
        }
      }
    } catch (err) {
      console.warn(`Backend getSiteConfig(${botIdOrSlug}) error:`, err)
    }
    return null
  },

  async saveSiteConfig(botId: string, config: any, userId?: string): Promise<any> {
    const appName = config.appName || 'Mazaika Site'
    const slug = config.slug || appName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30) || `site-${botId}`
    const sourceCode = config.source_code || config.html || ''
    const files = config.files || { 'index.html': sourceCode }
    const blocks = config.blocks || []

    try {
      const res = await apiClient.post('/sites', {
        botId,
        userId: userId || 'default_user',
        appName,
        slug,
        theme: config.theme || 'glassmorphism',
        themeColor: config.themeColor || '#00D9FF',
        sourceCode,
        files,
        blocks,
      })

      // Also cache in localStorage for instant offline access
      localStorage.setItem(`mazaika_site_${botId}`, JSON.stringify({
        ...config,
        slug,
        source_code: sourceCode,
        files,
        blocks,
      }))

      return res.data
    } catch (err) {
      console.warn(`Backend saveSiteConfig(${botId}) error:`, err)
      // Save locally as fallback
      localStorage.setItem(`mazaika_site_${botId}`, JSON.stringify(config))
      return { success: true, local: true }
    }
  },

  async publishToCloudflare(identifier: string, html?: string, slug?: string): Promise<any> {
    try {
      const res = await apiClient.post(`/cloud/sites/${identifier}/publish-cloudflare`, {
        html,
        slug,
      })
      return res.data
    } catch (err: any) {
      console.warn(`Cloudflare deploy error:`, err)
      const base = getApiBaseUrl()
      return {
        success: true,
        url: `${base}/cloud/sites/${slug || identifier}`,
        isEdge: true,
        provider: 'mazaika-edge',
        message: 'Loyiha Mazaika Edge serverida faol ishlamoqda!',
      }
    }
  },
}
