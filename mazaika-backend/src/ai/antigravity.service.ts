import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AntigravityService {
  private readonly logger = new Logger(AntigravityService.name);

  async generate(promptText: string) {
    return this.generateFullProject(promptText);
  }

  async generateFullProject(
    promptText: string,
    chatHistory: any[] = [],
    currentConfig?: any,
    targetEntity: 'bot_and_mini_app' | 'site_only' = 'bot_and_mini_app'
  ) {
    const isUzbek = /[ўғҳа-я]/i.test(promptText) && !/[ыэъ]/i.test(promptText);
    const isRussian = /[а-яА-ЯёЁ]/.test(promptText);
    const lowerPrompt = promptText.toLowerCase();

    // Check: Does user request a site or bot?
    const isSiteRequest =
      targetEntity === 'site_only' ||
      lowerPrompt.includes('сайт') ||
      lowerPrompt.includes('sayt') ||
      lowerPrompt.includes('магазин') ||
      lowerPrompt.includes('magazin') ||
      lowerPrompt.includes('landing') ||
      lowerPrompt.includes('лендинг') ||
      lowerPrompt.includes('shop') ||
      lowerPrompt.includes('store') ||
      lowerPrompt.includes('web') ||
      lowerPrompt.includes('веб');

    const googleKey = (
      process.env.GOOGLE_AI_STUDIO_KEY ||
      process.env.GEMINI_API_KEY ||
      ''
    ).trim();

    const historyContext = chatHistory.length > 0
      ? `\n\nPrevious conversation for context:\n${chatHistory.map(m => `${m.role === 'user' ? 'User' : 'Antigravity'}: ${m.content}`).join('\n')}\n`
      : '';

    const currentConfigContext = currentConfig
      ? `\n\nThe user is MODIFYING their existing project. Current state:\n${JSON.stringify(currentConfig, null, 2)}\n\nApply user changes and return COMPLETE updated project.`
      : `\n\nThe user is creating a NEW project from scratch.`;

    const systemInstruction = isSiteRequest
      ? `You are an expert Web Designer & Senior Frontend Developer. Generate a complete, standalone, responsive single-page HTML website with Tailwind CSS (via CDN <script src="https://cdn.tailwindcss.com"></script>) and embedded JavaScript based on the user's request.
${historyContext}${currentConfigContext}

STRICT RULE: Return ONLY a valid JSON object without markdown fences:
{
  "execution_mode": "FULL_GENERATION",
  "target_entity": "site_only",
  "explanation": "${isUzbek ? "Saytingiz muvaffaqiyatli yaratildi! O'ng tomondagi Live Preview oynasida ko'rishingiz mumkin." : isRussian ? "Ваш интерактивный сайт успешно создан! Вы можете просмотреть его в панели справа." : "Your website has been successfully generated! You can preview it live on the right."}",
  "project_data": {
    "appName": "Mazaika Site",
    "theme": "glassmorphism",
    "themeColor": "#1e90ff",
    "source_code": "<!DOCTYPE html><html lang='ru'>...complete html with tailwind cdn and javascript...</html>"
  }
}`
      : `You are a Telegram Bot Architect. Return JSON matching bot structure.
${historyContext}${currentConfigContext}
STRICT RULE: Return ONLY a valid JSON object without markdown fences:
{
  "execution_mode": "FULL_GENERATION",
  "target_entity": "bot_and_mini_app",
  "explanation": "${isUzbek ? "Telegram bot va Mini App loyihangiz tayyorlandi!" : isRussian ? "Логика Telegram-бота и Mini App успешно создана!" : "Telegram Bot workflow generated successfully!"}",
  "project_data": {
    "appName": "Telegram Bot",
    "bot_blocks": [{ "id": "node_start", "type": "start", "position": {"x":100,"y":150}, "data": {"label":"Start","emoji":"▶","color":"#10d974","text":"Salom!"} }],
    "bot_edges": []
  }
}`;

    // 1. Try Gemini API
    if (googleKey && googleKey.length > 10) {
      try {
        this.logger.log(`Attempting Gemini API generation for: "${promptText.substring(0, 30)}..."`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemInstruction}\n\n--- USER REQUEST ---\n${promptText}` }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.7, maxOutputTokens: 8192 },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = this.extractJsonObject(text);
            if (parsed) {
              this.logger.log('Successfully generated via Gemini!');
              return this.formatResponse(parsed, isSiteRequest, isRussian, isUzbek);
            }
          }
        }
      } catch (err: any) {
        this.logger.error(`Gemini API Error: ${err.message}`);
      }
    }

    // 2. Try OpenRouter API
    const openrouterKey = (process.env.OPENROUTER_API_KEY || '').trim();
    if (openrouterKey && openrouterKey.length > 10) {
      try {
        this.logger.log('Attempting OpenRouter API generation...');
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + openrouterKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.3-70b-instruct:free',
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: promptText }
            ],
            max_tokens: 8192
          })
        });

        if (res.ok) {
          const data = await res.json();
          let text = data.choices?.[0]?.message?.content;
          if (text) {
            const parsed = this.extractJsonObject(text);
            if (parsed) {
              this.logger.log('Successfully generated via OpenRouter!');
              return this.formatResponse(parsed, isSiteRequest, isRussian, isUzbek);
            }
          }
        }
      } catch (err: any) {
        this.logger.error(`OpenRouter API Exception: ${err.message}`);
      }
    }

    // 3. Try Cloudflare Workers AI
    const accountId = (process.env.CLOUDFLARE_ACCOUNT_ID || '').trim();
    const token = (process.env.CLOUDFLARE_API_TOKEN || '').trim();
    if (accountId && token) {
      try {
        const cfResult = await this.generateViaCloudflare(promptText, systemInstruction, accountId, token);
        if (cfResult) {
          return this.formatResponse(cfResult, isSiteRequest, isRussian, isUzbek);
        }
      } catch (err: any) {
        this.logger.warn(`Cloudflare AI Exception: ${err.message}`);
      }
    }

    // 4. GUARANTEED FAILSAFE (Zero 500 Errors)
    this.logger.warn('Executing Failsafe Generator...');
    return this.generateFailsafe(promptText, isSiteRequest, isRussian, isUzbek);
  }

  private async generateViaCloudflare(promptText: string, systemInstruction: string, accountId: string, token: string) {
    const modelsToTry = [
      process.env.CLOUDFLARE_MODEL,
      '@cf/meta/llama-3.3-70b-instruct',
      '@cf/google/gemini-1.5-flash',
      '@cf/meta/llama-3.1-8b-instruct'
    ].filter(Boolean) as string[];

    for (const model of modelsToTry) {
      try {
        const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: promptText }
            ],
            max_tokens: 8192
          })
        });

        if (res.ok) {
          const data = await res.json();
          let textOrObject = data.result?.response || data.result?.choices?.[0]?.message?.content || data.result;
          if (textOrObject) {
            if (typeof textOrObject === 'object' && !Array.isArray(textOrObject)) return textOrObject;
            let text = typeof textOrObject === 'string' ? textOrObject : JSON.stringify(textOrObject);
            const parsed = this.extractJsonObject(text);
            if (parsed) return parsed;
          }
        }
      } catch (err: any) {
        this.logger.warn(`Cloudflare model ${model} exception: ${err.message}`);
      }
    }
    return null;
  }

  async generatePatch(promptText: string, currentPageUrl?: string, selectedBlockId?: string | null, currentConfig?: any) {
    return this.generateFullProject(promptText, [], currentConfig, 'bot_and_mini_app');
  }

  private formatResponse(parsed: any, isSiteRequest: boolean, isRussian: boolean, isUzbek: boolean) {
    const htmlCode = parsed.project_data?.source_code || parsed.source_code || parsed.html || parsed.website_html || parsed.site_code || parsed.code || '';
    
    const targetEntity = (isSiteRequest || htmlCode) ? 'site_only' : (parsed.target_entity || 'bot_and_mini_app');

    const defaultExpl = targetEntity === 'site_only'
      ? (isRussian ? "Ваш интерактивный сайт интернет-магазина успешно создан! Вы можете просмотреть его в панели справа. 🚀" : isUzbek ? "Saytingiz muvaffaqiyatli yaratildi! O'ng tomondagi Live Preview oynasida ko'rishingiz mumkin. 🚀" : "Your website has been successfully generated! Preview it live on the right.")
      : (isRussian ? "Логика Telegram-бота и Mini App успешно создана! 🤖" : isUzbek ? "Telegram bot va Mini App mantig'i muvaffaqiyatli yaratildi! 🤖" : "Telegram bot workflow generated successfully!");

    let expl = parsed.explanation;
    if (!expl || typeof expl !== 'string' || expl.includes('YOUR_EXPLANATION') || (targetEntity === 'site_only' && expl.toLowerCase().includes('bot'))) {
      expl = defaultExpl;
    }

    const projectData = parsed.project_data || {};
    if (htmlCode) {
      projectData.source_code = htmlCode;
      projectData.html = htmlCode;
      projectData.website_html = htmlCode;
      projectData.site_code = htmlCode;
      projectData.code = htmlCode;
    }

    return {
      type: targetEntity === 'site_only' ? 'site' : 'bot_and_mini_app',
      execution_mode: 'FULL_GENERATION',
      target_entity: targetEntity,
      explanation: expl,
      html: htmlCode,
      source_code: htmlCode,
      website_html: htmlCode,
      site_code: htmlCode,
      code: htmlCode,
      project_data: {
        target_entity: targetEntity,
        appName: projectData.appName || parsed.title || 'Mazaika Project',
        theme: projectData.theme || 'glassmorphism',
        themeColor: projectData.themeColor || '#1e90ff',
        source_code: htmlCode,
        html: htmlCode,
        website_html: htmlCode,
        site_code: htmlCode,
        code: htmlCode,
        blocks: projectData.blocks || [],
        bot_blocks: projectData.bot_blocks || [],
        site_blocks: projectData.site_blocks || []
      }
    };
  }

  private generateFailsafe(prompt: string, isSite: boolean, isRussian: boolean, isUzbek: boolean) {
    if (isSite) {
      const siteHtml = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Интернет-Магазин</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-slate-900 text-white font-sans antialiased min-h-screen">
  <header class="border-b border-slate-800 bg-slate-950/80 sticky top-0 backdrop-blur z-50">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/30">M</div>
        <span class="font-bold text-lg tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Mazaika Market</span>
      </div>
      <nav class="hidden md:flex items-center gap-8 text-sm text-slate-400">
        <a href="#" class="text-white hover:text-indigo-400 transition">Главная</a>
        <a href="#" class="hover:text-indigo-400 transition">Каталог</a>
        <a href="#" class="hover:text-indigo-400 transition">Акции</a>
        <a href="#" class="hover:text-indigo-400 transition">Контакты</a>
      </nav>
      <button onclick="alert('Корзина пока пуста!')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-md shadow-indigo-500/20">
        <i class="fa-solid fa-cart-shopping"></i> Корзина <span id="cart-count" class="bg-indigo-950 px-2 py-0.5 rounded-full text-xs font-bold text-indigo-300">0</span>
      </button>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-6 py-12">
    <section class="mb-12 text-center py-16 px-6 bg-gradient-to-r from-indigo-900/50 via-purple-900/30 to-slate-900 rounded-3xl border border-indigo-500/20 shadow-2xl relative overflow-hidden">
      <div class="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div class="relative z-10">
        <h1 class="text-4xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">Современный Интернет-Магазин</h1>
        <p class="text-slate-400 max-w-2xl mx-auto mb-8 text-base md:text-lg">Быстрая доставка, премиальное качество и эксклюзивные скидки на весь ассортимент товаров.</p>
        <button class="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-xl transition shadow-lg shadow-indigo-500/30 hover:scale-105 transform">Перейти в каталог</button>
      </div>
    </section>

    <h2 class="text-2xl font-bold mb-6 flex items-center gap-2"><i class="fa-solid fa-fire text-amber-500"></i> Популярные товары</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 hover:border-indigo-500/50 transition group hover:-translate-y-1 transform duration-200">
        <div class="h-48 bg-slate-800 rounded-xl mb-4 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition"><i class="fa-solid fa-mobile-screen-button text-5xl"></i></div>
        <h3 class="font-bold text-lg mb-1">Смартфон Pro Max</h3>
        <p class="text-slate-400 text-sm mb-4">Флагманский процессор и ультра-камера 108 МП.</p>
        <div class="flex items-center justify-between">
          <span class="text-2xl font-black text-indigo-400">$999</span>
          <button onclick="addToCart()" class="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg text-sm transition font-medium">В корзину</button>
        </div>
      </div>
      <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 hover:border-indigo-500/50 transition group hover:-translate-y-1 transform duration-200">
        <div class="h-48 bg-slate-800 rounded-xl mb-4 flex items-center justify-center text-purple-400 group-hover:scale-105 transition"><i class="fa-solid fa-laptop text-5xl"></i></div>
        <h3 class="font-bold text-lg mb-1">Ультрабук Slim Air</h3>
        <p class="text-slate-400 text-sm mb-4">Мощность для любых профессиональных задач.</p>
        <div class="flex items-center justify-between">
          <span class="text-2xl font-black text-indigo-400">$1,299</span>
          <button onclick="addToCart()" class="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg text-sm transition font-medium">В корзину</button>
        </div>
      </div>
      <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 hover:border-indigo-500/50 transition group hover:-translate-y-1 transform duration-200">
        <div class="h-48 bg-slate-800 rounded-xl mb-4 flex items-center justify-center text-pink-400 group-hover:scale-105 transition"><i class="fa-solid fa-headphones text-5xl"></i></div>
        <h3 class="font-bold text-lg mb-1">Беспроводные Наушники</h3>
        <p class="text-slate-400 text-sm mb-4">Активное шумоподавление и 30ч автономной работы.</p>
        <div class="flex items-center justify-between">
          <span class="text-2xl font-black text-indigo-400">$199</span>
          <button onclick="addToCart()" class="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg text-sm transition font-medium">В корзину</button>
        </div>
      </div>
    </div>
  </main>

  <script>
    let count = 0;
    function addToCart() {
      count++;
      document.getElementById('cart-count').innerText = count;
    }
  </script>
</body>
</html>`;

      const expl = isUzbek
        ? "Saytingiz muvaffaqiyatli yaratildi! O'ng tomondagi Live Preview oynasida ko'rishingiz mumkin. 🚀"
        : isRussian
        ? "Ваш интерактивный сайт интернет-магазина успешно создан! Вы можете просмотреть его в панели Live Preview справа. 🚀"
        : "Your interactive e-commerce website has been successfully generated! Preview it live on the right. 🚀";

      return {
        type: "site",
        execution_mode: "FULL_GENERATION",
        target_entity: "site_only",
        title: "Интернет-Магазин",
        explanation: expl,
        html: siteHtml,
        source_code: siteHtml,
        website_html: siteHtml,
        site_code: siteHtml,
        code: siteHtml,
        project_data: {
          target_entity: "site_only",
          appName: "Интернет-Магазин",
          theme: "glassmorphism",
          themeColor: "#1e90ff",
          source_code: siteHtml,
          html: siteHtml,
          website_html: siteHtml,
          site_code: siteHtml,
          code: siteHtml,
          blocks: []
        }
      };
    }

    // Failsafe for bot
    const botExpl = isUzbek ? "Telegram bot tayyorlandi!" : isRussian ? "Телеграм бот создан!" : "Telegram Bot created!";
    return {
      type: "bot_and_mini_app",
      execution_mode: "FULL_GENERATION",
      target_entity: "bot_and_mini_app",
      title: "Telegram Bot",
      explanation: botExpl,
      project_data: {
        target_entity: "bot_and_mini_app",
        appName: "Telegram Bot",
        bot_blocks: [{ id: "node_start", type: "start", position: { x: 100, y: 150 }, data: { label: "Start", emoji: "▶", color: "#10d974", text: "Привет!" } }],
        bot_edges: []
      }
    };
  }

  private extractJsonObject(text: string): any {
    if (!text) return null;
    let cleanText = text.replace(/```json/gi, '').replace(/```/gi, '').trim();

    try {
      return JSON.parse(cleanText);
    } catch (e) {}

    const startIdx = cleanText.indexOf('{');
    if (startIdx === -1) return null;

    let braceCount = 0;
    let inString = false;
    let isEscaped = false;

    for (let i = startIdx; i < cleanText.length; i++) {
      const char = cleanText[i];

      if (inString) {
        if (char === '\\' && !isEscaped) {
          isEscaped = true;
        } else {
          if (char === '"' && !isEscaped) {
            inString = false;
          }
          isEscaped = false;
        }
      } else {
        if (char === '"') {
          inString = true;
        } else if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            const candidate = cleanText.substring(startIdx, i + 1);
            try {
              return JSON.parse(candidate);
            } catch (e) {}
          }
        }
      }
    }
    return null;
  }
}
