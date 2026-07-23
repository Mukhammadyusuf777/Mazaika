"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AntigravityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntigravityService = void 0;
const common_1 = require("@nestjs/common");
let AntigravityService = AntigravityService_1 = class AntigravityService {
    logger = new common_1.Logger(AntigravityService_1.name);
    async generate(rawPrompt) {
        return this.generateFullProject(rawPrompt);
    }
    async generateFullProject(rawPrompt, chatHistory = [], currentConfig, targetEntity = 'bot_and_mini_app') {
        try {
            const promptText = typeof rawPrompt === 'string' ? rawPrompt : String(rawPrompt || '');
            const lowerPrompt = promptText.toLowerCase();
            const isUzbek = /[ўғҳа-я]/i.test(promptText) && !/[ыэъ]/i.test(promptText);
            const isRussian = /[а-яА-ЯёЁ]/.test(promptText);
            const isSiteRequest = targetEntity === 'site_only' ||
                lowerPrompt.includes('сайт') ||
                lowerPrompt.includes('sayt') ||
                lowerPrompt.includes('магазин') ||
                lowerPrompt.includes('magazin') ||
                lowerPrompt.includes('landing') ||
                lowerPrompt.includes('лендинг') ||
                lowerPrompt.includes('shop') ||
                lowerPrompt.includes('store') ||
                lowerPrompt.includes('web') ||
                lowerPrompt.includes('веб') ||
                lowerPrompt.includes('панд');
            const googleKey = (process.env.GOOGLE_AI_STUDIO_KEY ||
                process.env.GEMINI_API_KEY ||
                '').trim();
            const historyContext = chatHistory.length > 0
                ? `\n\nPrevious conversation for context:\n${chatHistory.map(m => `${m.role === 'user' ? 'User' : 'Antigravity'}: ${m.content}`).join('\n')}\n`
                : '';
            const currentConfigContext = currentConfig
                ? `\n\nThe user is MODIFYING their existing project. Current state:\n${JSON.stringify(currentConfig, null, 2)}\n\nApply user changes and return COMPLETE updated project.`
                : `\n\nThe user is creating a NEW project from scratch.`;
            if (googleKey) {
                try {
                    this.logger.log(`Generating via Gemini API for: "${promptText.substring(0, 35)}..."`);
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleKey}`;
                    const systemInstruction = isSiteRequest
                        ? `You are a Senior UI/UX Frontend Architect specializing in FULLY RESPONSIVE MOBILE-FIRST web design.
Generate a high-end multi-page SPA inside ONE standalone HTML file.
${historyContext}${currentConfigContext}

CRITICAL MOBILE & RESPONSIVE RULES:
1. MOBILE MENU: Include a working Hamburger Menu button (<button id="hamburger-btn" onclick="toggleMobileMenu()">) for small screens (visible on mobile, hidden on md:).
2. RESPONSIVE LAYOUTS: Use flex-col for mobile, flex-row for desktop (e.g. "flex flex-col md:flex-row"). Grid MUST be "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3".
3. MULTI-PAGE ROUTING: Include a working JavaScript page switcher for multiple tabs/pages (e.g., "Home/Главная", "About/О нас", "Gallery/Галерея", "Contact/Контакты"). Clicking header links MUST switch visible sections smoothly without page reload!
4. STYLING: Tailwind CSS + FontAwesome 6 icons + Google Font Inter + Glassmorphism UI.
5. IMAGES: Use REAL high-resolution Unsplash photos with matching keywords. NEVER use placeholder dog images!
6. JSON OUTPUT ONLY:
{
  "type": "site",
  "execution_mode": "FULL_GENERATION",
  "target_entity": "site_only",
  "title": "Site Title",
  "explanation": "${isUzbek ? "Mobil va PC uchun moslashuvchan premium sayt yaratildi!" : isRussian ? "Адаптированный для телефонов и ПК многостраничный сайт успешно создан!" : "Responsive multi-page website generated!"}",
  "html": "<!DOCTYPE html><html class='scroll-smooth'>...RESPONSIVE MULTI-PAGE HTML CODE WITH MOBILE HAMBURGER MENU JS...</html>"
}`
                        : `You are a Telegram Bot Architect. Return JSON matching bot structure.
${historyContext}${currentConfigContext}
STRICT RULE: Return ONLY a valid JSON object without markdown fences:
{
  "type": "bot_and_mini_app",
  "execution_mode": "FULL_GENERATION",
  "target_entity": "bot_and_mini_app",
  "title": "Telegram Bot",
  "explanation": "${isUzbek ? "Telegram bot va Mini App loyihangiz tayyorlandi!" : isRussian ? "Логика Telegram-бота и Mini App успешно создана!" : "Telegram Bot workflow generated successfully!"}",
  "project_data": {
    "appName": "Telegram Bot",
    "bot_blocks": [{ "id": "node_start", "type": "start", "position": {"x":100,"y":150}, "data": {"label":"Start","emoji":"▶","color":"#10d974","text":"Salom!"} }],
    "bot_edges": []
  }
}`;
                    const res = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: `${systemInstruction}\n\nUser Prompt: ${promptText}` }] }],
                            generationConfig: {
                                responseMimeType: 'application/json',
                                temperature: 0.4
                            },
                        }),
                    });
                    if (res.ok) {
                        const data = await res.json();
                        let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (text) {
                            const parsed = this.extractJsonObject(text);
                            if (parsed) {
                                this.logger.log('Successfully generated via Gemini!');
                                return this.formatResponse(parsed, isSiteRequest, isRussian, isUzbek, promptText);
                            }
                        }
                    }
                }
                catch (apiErr) {
                    this.logger.error(`Gemini API Error: ${apiErr.message}`);
                }
            }
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
                                { role: 'system', content: `Generate JSON with type: "site", explanation, html (Tailwind multi-page HTML)` },
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
                                return this.formatResponse(parsed, isSiteRequest, isRussian, isUzbek, promptText);
                            }
                        }
                    }
                }
                catch (err) {
                    this.logger.error(`OpenRouter API Exception: ${err.message}`);
                }
            }
            const accountId = (process.env.CLOUDFLARE_ACCOUNT_ID || '').trim();
            const token = (process.env.CLOUDFLARE_API_TOKEN || '').trim();
            if (accountId && token) {
                try {
                    const cfResult = await this.generateViaCloudflare(promptText, accountId, token);
                    if (cfResult) {
                        return this.formatResponse(cfResult, isSiteRequest, isRussian, isUzbek, promptText);
                    }
                }
                catch (err) {
                    this.logger.warn(`Cloudflare AI Exception: ${err.message}`);
                }
            }
            this.logger.warn('Executing Multi-Page Failsafe Generator...');
            return this.generateMultiPageFailsafe(promptText, isRussian, isUzbek);
        }
        catch (fatalError) {
            this.logger.error(`Fatal Service Error: ${fatalError.message}`);
            return this.generateMultiPageFailsafe('Премиум Сайт', false, false);
        }
    }
    async generateViaCloudflare(promptText, accountId, token) {
        const modelsToTry = [
            process.env.CLOUDFLARE_MODEL,
            '@cf/meta/llama-3.3-70b-instruct',
            '@cf/google/gemini-1.5-flash',
            '@cf/meta/llama-3.1-8b-instruct'
        ].filter(Boolean);
        const sysPrompt = `Return JSON with type:"site", explanation, html (complete Tailwind HTML SPA with tab navigation).`;
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
                            { role: 'system', content: sysPrompt },
                            { role: 'user', content: promptText }
                        ],
                        max_tokens: 8192
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    let textOrObject = data.result?.response || data.result?.choices?.[0]?.message?.content || data.result;
                    if (textOrObject) {
                        if (typeof textOrObject === 'object' && !Array.isArray(textOrObject))
                            return textOrObject;
                        let text = typeof textOrObject === 'string' ? textOrObject : JSON.stringify(textOrObject);
                        const parsed = this.extractJsonObject(text);
                        if (parsed)
                            return parsed;
                    }
                }
            }
            catch (err) {
                this.logger.warn(`Cloudflare model ${model} exception: ${err.message}`);
            }
        }
        return null;
    }
    async generatePatch(promptText, currentPageUrl, selectedBlockId, currentConfig) {
        return this.generateFullProject(promptText, [], currentConfig, 'bot_and_mini_app');
    }
    formatResponse(parsed, isSiteRequest, isRussian, isUzbek, promptText) {
        const htmlCode = parsed.html || parsed.source_code || parsed.website_html || parsed.site_code || parsed.code || parsed.project_data?.source_code || '';
        const targetEntity = (isSiteRequest || htmlCode) ? 'site_only' : (parsed.target_entity || 'bot_and_mini_app');
        const defaultExpl = targetEntity === 'site_only'
            ? (isRussian ? "Премиальный многостраничный сайт успешно создан! Вы можете переключаться между страницами в меню шапки. 🚀" : isUzbek ? "Ko'p sahifali premium veb-sayt yaratildi! Menyu orqali sahifalarni almashtirishingiz mumkin. 🚀" : "High-end multi-page website generated with SPA tab navigation!")
            : (isRussian ? "Логика Telegram-бота и Mini App успешно создана! 🤖" : isUzbek ? "Telegram bot va Mini App mantig'i muvaffaqiyatli yaratildi! 🤖" : "Telegram bot workflow generated successfully!");
        let expl = parsed.explanation;
        if (!expl || typeof expl !== 'string' || expl.includes('YOUR_EXPLANATION') || (targetEntity === 'site_only' && expl.toLowerCase().includes('bot'))) {
            expl = defaultExpl;
        }
        const title = parsed.title || parsed.project_data?.appName || 'Премиум Сайт';
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
            title,
            explanation: expl,
            html: htmlCode,
            source_code: htmlCode,
            website_html: htmlCode,
            site_code: htmlCode,
            code: htmlCode,
            project_data: {
                target_entity: targetEntity,
                appName: title,
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
    generateMultiPageFailsafe(prompt, isRussian, isUzbek) {
        const topic = prompt || 'Panda World Premium';
        const siteHtml = `<!DOCTYPE html>
<html lang="ru" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${topic}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    .page-section { display: none; }
    .page-section.active { display: block; animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-between selection:bg-emerald-500 selection:text-white">

  <!-- HEADER / MULTI-PAGE NAVIGATION -->
  <header class="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div class="flex items-center gap-3 cursor-pointer" onclick="navigateTo('home')">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-extrabold text-xl shadow-lg shadow-emerald-500/20">
          <i class="fa-solid fa-paw"></i>
        </div>
        <span class="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">PandaWorld</span>
      </div>

      <!-- PAGE TABS -->
      <nav class="flex items-center gap-1 md:gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
        <button onclick="navigateTo('home')" id="tab-home" class="nav-tab px-5 py-2 rounded-xl text-sm font-semibold transition-all bg-emerald-500 text-slate-950 shadow-md">Главная</button>
        <button onclick="navigateTo('about')" id="tab-about" class="nav-tab px-5 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-all">О пандах</button>
        <button onclick="navigateTo('gallery')" id="tab-gallery" class="nav-tab px-5 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-all">Галерея</button>
        <button onclick="navigateTo('contact')" id="tab-contact" class="nav-tab px-5 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-all">Контакты</button>
      </nav>
    </div>
  </header>

  <!-- MAIN CONTENT CONTAINER -->
  <main class="max-w-7xl mx-auto px-6 py-12 flex-grow w-full">

    <!-- PAGE 1: HOME -->
    <section id="page-home" class="page-section active">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
        <div class="space-y-6">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
            <i class="fa-solid fa-sparkles"></i> Уникальный мир фауны
          </div>
          <h1 class="text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white">
            Заповедный мир <span class="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">Панд</span>
          </h1>
          <p class="text-slate-400 text-lg leading-relaxed">
            Погрузитесь в удивительную жизнь гигантских панд. Узнайте всё об их привычках, диете и борьбе за сохранение вида в современном мире.
          </p>
          <div class="flex items-center gap-4 pt-4">
            <button onclick="navigateTo('gallery')" class="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/25 flex items-center gap-2">
              <i class="fa-solid fa-images"></i> Открыть галерею
            </button>
            <button onclick="navigateTo('about')" class="px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold rounded-2xl transition-all">
              Узнать больше
            </button>
          </div>
        </div>
        <div class="relative group">
          <div class="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
          <img src="https://images.unsplash.com/photo-1564349683136-77e08dba1ef9?auto=format&fit=crop&w=1000&q=80" alt="Панда" class="relative rounded-3xl object-cover w-full h-[450px] shadow-2xl border border-slate-800">
        </div>
      </div>
    </section>

    <!-- PAGE 2: ABOUT -->
    <section id="page-about" class="page-section">
      <div class="max-w-4xl mx-auto space-y-12">
        <div class="text-center space-y-4">
          <h2 class="text-4xl font-extrabold text-white">Факты о Гигантских Пандах</h2>
          <p class="text-slate-400">Уникальные особенности самых дружелюбных животных на Земле</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/40 transition">
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mb-6"><i class="fa-solid fa-leaf"></i></div>
            <h3 class="text-xl font-bold mb-3 text-white">Бамбуковая диета</h3>
            <p class="text-slate-400 leading-relaxed text-sm">До 99% рациона панды составляет бамбук. В день взрослая панда съедает от 12 до 38 кг свежих побегов.</p>
          </div>
          <div class="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/40 transition">
            <div class="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center text-2xl mb-6"><i class="fa-solid fa-weight-scale"></i></div>
            <h3 class="text-xl font-bold mb-3 text-white">Размеры и вес</h3>
            <p class="text-slate-400 leading-relaxed text-sm">Взрослые особи достигают массы от 70 до 120 кг, а при рождении детеныш панды весит всего около 100 грамм.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- PAGE 3: GALLERY -->
    <section id="page-gallery" class="page-section">
      <div class="space-y-8">
        <div class="text-center space-y-3">
          <h2 class="text-4xl font-extrabold text-white">Фотогалерея высокого разрешения</h2>
          <p class="text-slate-400">Галерея естественной среды обитания панд</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="overflow-hidden rounded-3xl border border-slate-800 group relative">
            <img src="https://images.unsplash.com/photo-1564349683136-77e08dba1ef9?auto=format&fit=crop&w=800&q=80" alt="Panda 1" class="w-full h-72 object-cover group-hover:scale-110 transition duration-500">
          </div>
          <div class="overflow-hidden rounded-3xl border border-slate-800 group relative">
            <img src="https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=800&q=80" alt="Panda 2" class="w-full h-72 object-cover group-hover:scale-110 transition duration-500">
          </div>
          <div class="overflow-hidden rounded-3xl border border-slate-800 group relative">
            <img src="https://images.unsplash.com/photo-1538100591392-12f5347b8509?auto=format&fit=crop&w=800&q=80" alt="Panda 3" class="w-full h-72 object-cover group-hover:scale-110 transition duration-500">
          </div>
        </div>
      </div>
    </section>

    <!-- PAGE 4: CONTACT -->
    <section id="page-contact" class="page-section">
      <div class="max-w-xl mx-auto p-10 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-6">
        <h2 class="text-3xl font-bold text-center text-white">Связаться с Заповедником</h2>
        <form onsubmit="event.preventDefault(); alert('Сообщение отправлено!');" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ваше Имя</label>
            <input type="text" placeholder="Александр" required class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-emerald-500 focus:outline-none text-white">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
            <input type="email" placeholder="panda@example.com" required class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-emerald-500 focus:outline-none text-white">
          </div>
          <button type="submit" class="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-emerald-500/20">Отправить</button>
        </form>
      </div>
    </section>

  </main>

  <!-- FOOTER -->
  <footer class="border-t border-slate-900 bg-slate-950/50 py-8 text-center text-slate-500 text-sm">
    <p>© 2026 PandaWorld. Сгенерировано Mazaika AI Architect</p>
  </footer>

  <!-- SPA ROUTER SCRIPT -->
  <script>
    function navigateTo(pageId) {
      document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
      const targetPage = document.getElementById('page-' + pageId);
      if (targetPage) targetPage.classList.add('active');

      document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.classList.remove('bg-emerald-500', 'text-slate-950', 'shadow-md');
        btn.classList.add('text-slate-400');
      });

      const activeTab = document.getElementById('tab-' + pageId);
      if (activeTab) {
        activeTab.classList.add('bg-emerald-500', 'text-slate-950', 'shadow-md');
        activeTab.classList.remove('text-slate-400');
      }
    }
  </script>
</body>
</html>`;
        const expl = isUzbek
            ? "Mazaika AI tomonidan premium ko'p sahifali veb-sayt yaratildi! Menyu orqali sahifalarni almashtirishingiz mumkin. 🚀"
            : isRussian
                ? "Создан премиальный многостраничный веб-сайт с интерактивным переключением страниц в шапке! 🚀"
                : "High-end multi-page website generated with live SPA tab navigation!";
        return {
            type: "site",
            execution_mode: "FULL_GENERATION",
            target_entity: "site_only",
            title: topic,
            explanation: expl,
            html: siteHtml,
            source_code: siteHtml,
            website_html: siteHtml,
            site_code: siteHtml,
            code: siteHtml,
            project_data: {
                target_entity: "site_only",
                appName: topic,
                theme: "glassmorphism",
                themeColor: "#10b981",
                source_code: siteHtml,
                html: siteHtml,
                website_html: siteHtml,
                site_code: siteHtml,
                code: siteHtml,
                blocks: []
            }
        };
    }
    extractJsonObject(text) {
        if (!text)
            return null;
        let cleanText = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
        try {
            return JSON.parse(cleanText);
        }
        catch (e) { }
        const startIdx = cleanText.indexOf('{');
        if (startIdx === -1)
            return null;
        let braceCount = 0;
        let inString = false;
        let isEscaped = false;
        for (let i = startIdx; i < cleanText.length; i++) {
            const char = cleanText[i];
            if (inString) {
                if (char === '\\' && !isEscaped) {
                    isEscaped = true;
                }
                else {
                    if (char === '"' && !isEscaped) {
                        inString = false;
                    }
                    isEscaped = false;
                }
            }
            else {
                if (char === '"') {
                    inString = true;
                }
                else if (char === '{') {
                    braceCount++;
                }
                else if (char === '}') {
                    braceCount--;
                    if (braceCount === 0) {
                        const candidate = cleanText.substring(startIdx, i + 1);
                        try {
                            return JSON.parse(candidate);
                        }
                        catch (e) { }
                    }
                }
            }
        }
        return null;
    }
};
exports.AntigravityService = AntigravityService;
exports.AntigravityService = AntigravityService = AntigravityService_1 = __decorate([
    (0, common_1.Injectable)()
], AntigravityService);
//# sourceMappingURL=antigravity.service.js.map