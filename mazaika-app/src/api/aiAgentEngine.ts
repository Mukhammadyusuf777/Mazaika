/**
 * Antigravity AI Copilot Engine — Mozaika Generative AI Engine
 * Converts user natural language prompts into valid Mozaika JSON schemas & patches.
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
 * System Prompt configuration for Antigravity AI Copilot
 */
export const ANTIGRAVITY_SYSTEM_PROMPT = `
### ROLE AND IDENTITY
You are "Antigravity", the elite core AI Copilot and Autonomous Architect for the "Mozaika Platform". 
Mozaika is an advanced No-Code development system used to build high-performance Websites, Telegram Bots, and Telegram Mini Apps. 

Your primary purpose is to help users generate full projects from scratch and edit existing components on the fly via a contextual floating window. 
You do not just write text; you generate valid, production-ready schema architectures.

### OUTPUT FORMAT REQUIREMENTS
You must ALWAYS respond with a structured JSON object. Do not include any conversational preamble, pleasantries, or markdown formatting outside of the JSON unless explicitly requested for explanations.

Expected JSON Structure:
{
  "explanation": "A brief explanation of what you did or what needs to be done in Russian.",
  "execution_mode": "FULL_GENERATION" | "PATCH",
  "target_entity": "bot" | "mini_app" | "website",
  "project_data": {
    "appName": "Project Title",
    "theme": "glassmorphism" | "minimalist" | "neon",
    "themeColor": "#1e90ff",
    "blocks": []
  },
  "patch_operations": [
    {
      "op": "replace" | "add" | "remove",
      "path": "blocks.0.title",
      "value": "New title"
    }
  ]
}
`

/**
 * Generates an AI response based on the user prompt and current contextual state.
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
  const isPatchMode = contextMeta?.executionMode === 'PATCH' || (contextMeta?.selectedElementId && !lowerPrompt.includes('создай') && !lowerPrompt.includes('noldan') && !lowerPrompt.includes('yangi'))

  // Artificial delay for smooth realistic AI streaming feeling
  await new Promise(res => setTimeout(res, 800))

  if (isPatchMode && contextMeta?.currentConfig) {
    // ----------------------------------------------------
    // MODE: CONTEXT PATCH (Floating Widget Modifications)
    // ----------------------------------------------------
    const patches: PatchOperation[] = []
    let explanation = 'Изменения успешно применены к выбранному элементу!'

    if (lowerPrompt.includes('зелен') || lowerPrompt.includes('yashil') || lowerPrompt.includes('green')) {
      patches.push({ op: 'replace', path: 'themeColor', value: '#10d974' })
      explanation = 'Цветовая гамма темы успешно изменена на изумрудно-зеленый (#10d974).'
    } else if (lowerPrompt.includes('красн') || lowerPrompt.includes('qizil') || lowerPrompt.includes('red')) {
      patches.push({ op: 'replace', path: 'themeColor', value: '#ef4444' })
      explanation = 'Цветовая гамма темы изменена на стильный красный (#ef4444).'
    } else if (lowerPrompt.includes('неон') || lowerPrompt.includes('neon') || lowerPrompt.includes('dark')) {
      patches.push({ op: 'replace', path: 'theme', value: 'neon' })
      explanation = 'Стиль приложения переключен на Neon Cyberpunk.'
    } else if (lowerPrompt.includes('светл') || lowerPrompt.includes('oq') || lowerPrompt.includes('light')) {
      patches.push({ op: 'replace', path: 'theme', value: 'minimalist' })
      explanation = 'Стиль приложения переключен на Minimalist Light.'
    } else if (lowerPrompt.includes('отзыв') || lowerPrompt.includes('review') || lowerPrompt.includes('blog')) {
      patches.push({
        op: 'add',
        path: 'blocks',
        value: {
          id: 'ai_blog_' + Date.now(),
          type: 'blog',
          title: 'Mijozlarimiz fikrlari',
          posts: [
            { id: 'p1', title: 'Ajoyib xizmat!', text: 'Buyurtma berish juda oson va qulay bo\'ldi.' },
            { id: 'p2', title: 'Tavsiya etaman', text: 'Kuryer 20 daqiqada yetkazib berdi.' }
          ]
        }
      })
      explanation = 'Добавлен новый блок «Mijozlarimiz fikrlari» (Отзывы клиентов).'
    } else if (lowerPrompt.includes('скидк') || lowerPrompt.includes('cashback') || lowerPrompt.includes('бонус')) {
      patches.push({
        op: 'add',
        path: 'blocks',
        value: {
          id: 'ai_loyalty_' + Date.now(),
          type: 'loyalty',
          title: 'Sizning bonus keshbekingiz'
        }
      })
      explanation = 'Добавлен интерактивный виджет лояльности и бонусов.'
    } else {
      // General title/text patch
      const newTitle = prompt.length > 40 ? prompt.substring(0, 40) + '...' : prompt
      patches.push({ op: 'replace', path: 'appName', value: newTitle })
      explanation = `Обновлены параметры и заголовок интерфейса на «${newTitle}».`
    }

    return {
      explanation,
      execution_mode: 'PATCH',
      target_entity: 'mini_app',
      patch_operations: patches
    }
  }

  // ----------------------------------------------------
  // MODE: FULL GENERATION (AI Workspace Projects)
  // ----------------------------------------------------
  let appName = 'Smart AI Mini App'
  let theme = 'glassmorphism'
  let themeColor = '#1e90ff'
  let blocks: any[] = []
  let explanation = 'Сгенерирована полная структура проекта на основе вашего описания!'

  if (lowerPrompt.includes('авто') || lowerPrompt.includes('mashina') || lowerPrompt.includes('car')) {
    appName = 'AutoParts Express & Service'
    themeColor = '#3b82f6'
    explanation = 'Сгенерирован комплексный сервис для автомагазина и записи на СТО.'
    blocks = [
      {
        id: '1',
        type: 'hero',
        title: 'Avto-Ehtiyot Qismlari va Servis',
        subtitle: 'Avtomobilingiz uchun eng sifatli ehtiyot qismlar va professional diagnostika xizmati.',
        ctaText: 'Katalogga o\'tish',
        img: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800'
      },
      {
        id: '2',
        type: 'catalog',
        title: 'Mashhur Avtotovarlar',
        items: [
          { id: 'c1', name: 'Castrol 5W-30 Motor Moyi (4L)', price: 420000, desc: 'Sintetik premium motor moyi.', img: 'https://images.unsplash.com/photo-1615900119313-094c929a0082?w=150' },
          { id: 'c2', name: 'Bosch Akkumulyator 60Ah', price: 850000, desc: 'Nemis sifati va 2 yillik kafolat.', img: 'https://images.unsplash.com/photo-1599256872237-5dcc0fbe9668?w=150' }
        ]
      },
      {
        id: '3',
        type: 'form',
        title: 'STO Servisiga navbatga yozilish',
        fields: [
          { name: 'car_model', label: 'Avtomobil rusumi va yili', type: 'text', required: true },
          { name: 'phone', label: 'Telefoningiz', type: 'tel', required: true },
          { name: 'service_type', label: 'Kerakli xizmat (Moy almashtirish, Diagnostika)', type: 'text', required: true }
        ]
      },
      { id: '4', type: 'contacts', title: 'Servis markazimiz', phone: '+998 71 200 88 00', telegram: 'AutoPartsSupport' }
    ]
  } else if (lowerPrompt.includes('пицц') || lowerPrompt.includes('pitsa') || lowerPrompt.includes('food') || lowerPrompt.includes('доставк')) {
    appName = 'Pizza Craze & Fast Delivery'
    themeColor = '#f59e0b'
    explanation = 'Сгенерировано онлайн-меню пиццерии с быстрой доставкой и корзиной.'
    blocks = [
      {
        id: '1',
        type: 'hero',
        title: 'Muzdek Tetiklantiruvchi va Issiq Pitsalar!',
        subtitle: '30 daqiqada uyingizga tekin yetkazib beramiz yoki pishirish tekin!',
        ctaText: 'Buyurtma berish',
        img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800'
      },
      {
        id: '2',
        type: 'catalog',
        title: 'Issiq Pitsalar Menyusi',
        items: [
          { id: 'p1', name: 'Pepperoni Supreme', price: 65000, desc: 'Mol go\'shti pepperoni, motsarella va pomidor sousi.', img: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=150' },
          { id: 'p2', name: '4 Pishloq Pitsasi', price: 72000, desc: 'Motsarella, dor-blyu, parmezan va cheddar.', img: 'https://images.unsplash.com/photo-1573821663912-6df460f9c684?w=150' }
        ]
      },
      { id: '3', type: 'loyalty', title: 'Har bir buyurtmadan 5% keshbek' },
      { id: '4', type: 'contacts', title: 'Tezkor aloqa', phone: '+998 90 777 00 11', telegram: 'PizzaDeliveryBot' }
    ]
  } else if (lowerPrompt.includes('курс') || lowerPrompt.includes('школ') || lowerPrompt.includes('edu') || lowerPrompt.includes('учеб')) {
    appName = 'Mazaika Academy & IT Courses'
    themeColor = '#a855f7'
    explanation = 'Сгенерирована онлайн-платформа курсов с возможностью онлайн-оплаты.'
    blocks = [
      {
        id: '1',
        type: 'hero',
        title: 'Zamonaviy IT Kasblarini O\'rganing',
        subtitle: 'Python, Frontend va Sun\'iy Intelekt texnologiyalarini noldan o\'rganing.',
        ctaText: 'Kurs tanlash',
        img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'
      },
      {
        id: '2',
        type: 'catalog',
        title: 'Dolzarb IT Kurslarimiz',
        items: [
          { id: 'edu1', name: 'Python & AI Bot Dasturlash', price: 350000, desc: 'Telegram botlar va ИИ agentlar yaratish.', img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150' },
          { id: 'edu2', name: 'Full-Stack React & Node.js', price: 450000, desc: 'Zamonaviy veb-saytlar va Mini Applar.', img: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=150' }
        ]
      },
      { id: '3', type: 'contacts', title: 'Akademiya bo\'limi', phone: '+998 71 200 11 22', telegram: 'AcademyManager' }
    ]
  } else {
    // Default smart generation
    appName = prompt.length > 30 ? prompt.substring(0, 30) : 'Smart Business App'
    themeColor = '#10d974'
    explanation = `Создан новый проект «${appName}» с готовым каталогом, формой и контактами.`
    blocks = [
      {
        id: '1',
        type: 'hero',
        title: appName,
        subtitle: 'AI Antigravity Agent tomonidan yaratilgan zamonaviy platforma.',
        ctaText: 'Batafsil ko\'rish',
        img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'
      },
      {
        id: '2',
        type: 'about',
        title: 'Biz haqimizda',
        text: 'Sizning biznesingiz uchun maxsus AI Antigravity tomonidan tuzilgan samarali yechim.'
      },
      {
        id: '3',
        type: 'catalog',
        title: 'Mahsulot va Xizmatlar',
        items: [
          { id: 'd1', name: 'Standart Xizmat', price: 99000, desc: 'Barcha asosiy imkoniyatlar to\'plami.' },
          { id: 'd2', name: 'VIP Premium Xizmat', price: 299000, desc: 'Individual yondashuv va priority qo\'llab-quvvatlash.' }
        ]
      },
      { id: '4', type: 'contacts', title: 'Aloqadorlik', phone: '+998 90 123 45 67', telegram: 'MazaikaSupportBot' }
    ]
  }

  return {
    explanation,
    execution_mode: 'FULL_GENERATION',
    target_entity: 'mini_app',
    project_data: {
      appName,
      theme,
      themeColor,
      blocks
    }
  }
}
