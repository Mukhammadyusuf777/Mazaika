"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AntigravityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntigravityService = void 0;
const common_1 = require("@nestjs/common");
const prompts_1 = require("./prompts");
const mazaika_db_service_1 = require("../cloud/mazaika-db.service");
let AntigravityService = AntigravityService_1 = class AntigravityService {
    mazaikaDb;
    logger = new common_1.Logger(AntigravityService_1.name);
    constructor(mazaikaDb) {
        this.mazaikaDb = mazaikaDb;
    }
    applyWebPatches(sourceCode, patches) {
        let result = sourceCode;
        let appliedCount = 0;
        for (const patch of patches) {
            if (!patch.search || !patch.replace)
                continue;
            const idx = result.indexOf(patch.search);
            if (idx !== -1) {
                result = result.substring(0, idx) + patch.replace + result.substring(idx + patch.search.length);
                appliedCount++;
                this.logger.log(`✅ Patch applied (search length: ${patch.search.length})`);
            }
            else {
                this.logger.warn(`⚠️ Patch search string NOT FOUND in source. Patch skipped.`);
            }
        }
        this.logger.log(`🔧 Applied ${appliedCount}/${patches.length} patches`);
        return result;
    }
    applyBotPatches(currentBlocks, currentEdges, patchResult) {
        let blocks = [...(currentBlocks || [])];
        let edges = [...(currentEdges || [])];
        if (patchResult.add_nodes?.length) {
            blocks = [...blocks, ...patchResult.add_nodes];
        }
        if (patchResult.modify_nodes?.length) {
            for (const modified of patchResult.modify_nodes) {
                const idx = blocks.findIndex(b => b.id === modified.id);
                if (idx !== -1)
                    blocks[idx] = modified;
            }
        }
        if (patchResult.remove_node_ids?.length) {
            blocks = blocks.filter(b => !patchResult.remove_node_ids.includes(b.id));
        }
        if (patchResult.add_edges?.length) {
            edges = [...edges, ...patchResult.add_edges];
        }
        if (patchResult.remove_edge_ids?.length) {
            edges = edges.filter(e => !patchResult.remove_edge_ids.includes(e.id));
        }
        this.logger.log(`🔧 Bot patch: +${patchResult.add_nodes?.length || 0} nodes, ~${patchResult.modify_nodes?.length || 0} modified, -${patchResult.remove_node_ids?.length || 0} removed`);
        return { blocks, edges };
    }
    async generate(rawInput) {
        return this.generateFullProject(rawInput);
    }
    async generatePatch(promptText, currentPageUrl, selectedBlockId, currentConfig) {
        return this.generateFullProject(promptText, [], currentConfig, 'bot_and_mini_app');
    }
    async generateFullProject(rawInput, chatHistory = [], currentConfig, targetEntity) {
        try {
            let promptText = '';
            let existingHtml = '';
            let imageBase64 = '';
            let imageMimeType = 'image/jpeg';
            let projectState = null;
            if (typeof rawInput === 'string') {
                promptText = rawInput;
            }
            else if (typeof rawInput === 'object' && rawInput !== null) {
                promptText = rawInput.prompt || rawInput.message || rawInput.text || rawInput.promptText || '';
                existingHtml = rawInput.currentHtml || rawInput.html || rawInput.siteHtml || rawInput.currentConfig?.source_code || rawInput.currentConfig?.html || '';
                imageBase64 = rawInput.imageBase64 || '';
                imageMimeType = rawInput.imageMimeType || 'image/jpeg';
                projectState = rawInput.projectState || rawInput.currentConfig?.project_state || null;
                if (rawInput.chatHistory?.length > 0)
                    chatHistory = rawInput.chatHistory;
                if (rawInput.targetEntity)
                    targetEntity = rawInput.targetEntity;
            }
            if (!existingHtml && currentConfig) {
                existingHtml = currentConfig.source_code || currentConfig.html || '';
                projectState = projectState || currentConfig.project_state || null;
            }
            const googleKey = (rawInput?.googleKey ||
                process.env.GOOGLE_AI_STUDIO_KEY ||
                process.env.GEMINI_API_KEY ||
                '').trim();
            const rawExecutionMode = rawInput?.executionMode || rawInput?.mode || null;
            const isNewProjectIntent = /(yarat|tuz|yangi|boshla|sozla|qur|ishlab chiq|создай|сделай|разработай|новый|с нуля|сгенерируй|create|build|generate|new|start)/i.test(promptText);
            const isEditIntent = /(o'zgartir|qo'sh|rang|almashtir|tahrirla|yangila|olib tashla|o'chir|tuzat|измени|поменяй|добавь|удали|исправь|обнови|перекрась|edit|change|update|modify|add|remove|fix)/i.test(promptText);
            let isEditMode = false;
            if (rawExecutionMode === 'FULL_GENERATION') {
                isEditMode = false;
            }
            else if (rawExecutionMode === 'PATCH') {
                isEditMode = existingHtml.trim().length > 50;
            }
            else if (isNewProjectIntent) {
                isEditMode = false;
            }
            else if (isEditIntent && existingHtml.trim().length > 50) {
                isEditMode = true;
            }
            else {
                isEditMode = existingHtml.trim().length > 50 && promptText.trim().length < 60 && !isNewProjectIntent;
            }
            if (!isEditMode) {
                existingHtml = '';
                projectState = null;
            }
            let target = targetEntity;
            if (!target) {
                const routeRes = await this.callAI(prompts_1.ROUTING_AGENT_PROMPT, promptText, '', '', 0, true, googleKey);
                if (routeRes && routeRes.target) {
                    target = routeRes.target === 'bot_only' ? 'bot_and_mini_app' : routeRes.target;
                }
                else {
                    target = 'bot_and_mini_app';
                }
            }
            this.logger.log(`🚀 Routing: target=${target} | mode=${isEditMode ? 'PATCH' : 'FULL'}`);
            const historyContext = chatHistory.length > 0
                ? `\n\nCONVERSATION HISTORY (last 5 messages):\n${chatHistory.slice(-5).map(m => `${m.role === 'user' ? 'User' : 'Antigravity'}: ${m.content}`).join('\n')}\n`
                : '';
            const stateContext = projectState
                ? `\n\nPROJECT ARCHITECTURE & CONTEXT (do NOT deviate from this):\n${JSON.stringify(projectState, null, 2)}\n`
                : '';
            let botData = null;
            let siteData = null;
            if (isEditMode) {
                const userRequestForPatch = `USER REQUEST: "${promptText}"${historyContext}${stateContext}

CURRENT SITE CODE (apply patches to this):
\`\`\`html
${existingHtml.substring(0, 12000)}${existingHtml.length > 12000 ? '\n... (truncated for token limit)' : ''}
\`\`\``;
                const currentBotBlocks = rawInput?.currentConfig?.bot_blocks || [];
                const currentBotEdges = rawInput?.currentConfig?.bot_edges || [];
                const userRequestForBotPatch = `USER REQUEST: "${promptText}"${historyContext}${stateContext}

CURRENT BOT FLOW (apply patches to this):
Bot Nodes: ${JSON.stringify(currentBotBlocks.slice(0, 20))}
Bot Edges: ${JSON.stringify(currentBotEdges.slice(0, 20))}`;
                if (target === 'site_only') {
                    siteData = await this.callAI(prompts_1.WEBAPP_PATCH_PROMPT, userRequestForPatch, imageBase64, imageMimeType, 0, false, googleKey);
                }
                else {
                    const tasks = [
                        this.callAI(prompts_1.BOT_PATCH_PROMPT, userRequestForBotPatch, '', '', 0, false, googleKey),
                        this.callAI(prompts_1.WEBAPP_PATCH_PROMPT, userRequestForPatch, imageBase64, imageMimeType, 0, false, googleKey)
                    ];
                    const [botPatch, sitePatch] = await Promise.all(tasks);
                    botData = botPatch;
                    siteData = sitePatch;
                }
                let finalHtml = existingHtml;
                if (siteData?.patches?.length > 0) {
                    finalHtml = this.applyWebPatches(existingHtml, siteData.patches);
                }
                else if (siteData?.html) {
                    finalHtml = siteData.html;
                    this.logger.warn('⚠️ AI returned full HTML in patch mode. Accepting full HTML as fallback.');
                }
                let finalBotBlocks = currentBotBlocks;
                let finalBotEdges = currentBotEdges;
                if (botData && (botData.add_nodes || botData.modify_nodes || botData.remove_node_ids)) {
                    const patched = this.applyBotPatches(currentBotBlocks, currentBotEdges, botData);
                    finalBotBlocks = patched.blocks;
                    finalBotEdges = patched.edges;
                }
                else if (botData?.bot_blocks) {
                    finalBotBlocks = botData.bot_blocks;
                    finalBotEdges = botData.bot_edges || currentBotEdges;
                }
                const updatedProjectState = siteData?.project_state || botData?.project_state || projectState;
                const finalResult = {
                    type: target === 'site_only' ? 'site' : 'bot_and_mini_app',
                    execution_mode: 'PATCH',
                    target_entity: target,
                    title: 'AI Patched Project',
                    explanation: siteData?.explanation || botData?.explanation || 'Muvaffaqiyatli yangilandi!',
                    analysis: siteData?.analysis || botData?.analysis || '',
                    html: finalHtml,
                    source_code: finalHtml,
                    website_html: finalHtml,
                    project_state: updatedProjectState,
                    project_data: {
                        target_entity: target,
                        source_code: finalHtml,
                        html: finalHtml,
                        bot_blocks: finalBotBlocks,
                        bot_edges: finalBotEdges,
                        bot_code: botData?.bot_code || rawInput?.currentConfig?.bot_code || '',
                        project_state: updatedProjectState
                    }
                };
                return finalResult;
            }
            else {
                const userRequest = `USER REQUEST: "${promptText}"${historyContext}`;
                if (target === 'site_only') {
                    siteData = await this.callAI(prompts_1.WEBAPP_AGENT_PROMPT, userRequest, imageBase64, imageMimeType, 0, false, googleKey);
                }
                else if (target === 'bot_and_mini_app') {
                    const tasks = [
                        this.callAI(prompts_1.BOT_AGENT_PROMPT, userRequest, imageBase64, imageMimeType, 0, false, googleKey),
                        this.callAI(prompts_1.WEBAPP_AGENT_PROMPT, userRequest, imageBase64, imageMimeType, 0, false, googleKey)
                    ];
                    const [botRes, siteRes] = await Promise.all(tasks);
                    botData = botRes;
                    siteData = siteRes;
                }
                const isRu = isRawRussian(promptText);
                const richFallback = this.generateRichFallbackProject(promptText, target || 'bot_and_mini_app', isRu);
                let finalHtml = siteData?.html || siteData?.source_code || '';
                if (!finalHtml || finalHtml.trim().length < 250) {
                    this.logger.warn('⚠️ AI generated HTML was too short or empty. Enhancing with rich production UI.');
                    finalHtml = richFallback.html;
                }
                let finalBotBlocks = botData?.bot_blocks || [];
                let finalBotEdges = botData?.bot_edges || [];
                let finalBotCode = botData?.bot_code || '';
                if (!finalBotBlocks || finalBotBlocks.length < 3) {
                    finalBotBlocks = richFallback.bot_blocks;
                    finalBotEdges = richFallback.bot_edges;
                    finalBotCode = richFallback.bot_code;
                }
                const files = siteData?.files && Object.keys(siteData.files).length > 0
                    ? siteData.files
                    : { 'index.html': finalHtml };
                const appName = siteData?.project_state?.appName || botData?.project_state?.appName || richFallback.appName;
                const newProjectState = siteData?.project_state || botData?.project_state || null;
                const finalResult = {
                    type: target === 'site_only' ? 'site' : 'bot_and_mini_app',
                    execution_mode: 'FULL_GENERATION',
                    target_entity: target,
                    title: appName,
                    appName: appName,
                    explanation: siteData?.explanation || botData?.explanation || (isRu
                        ? `Проект "${appName}" успешно создан! 🚀 Полнофункциональный Telegram бот и интерактивный Mini App с каталогом, корзиной и оформлением заказа готовы к работе.`
                        : `"${appName}" loyihasi muvaffaqiyatli yaratildi! 🚀 To'liq Telegram bot va interaktiv tovarlar katalogi, savat hamda to'lov tizimiga ega Mini App tayyor.`),
                    html: finalHtml,
                    source_code: finalHtml,
                    website_html: finalHtml,
                    files: files,
                    project_state: newProjectState,
                    project_data: {
                        appName: appName,
                        target_entity: target,
                        source_code: finalHtml,
                        html: finalHtml,
                        files: files,
                        bot_blocks: finalBotBlocks,
                        bot_edges: finalBotEdges,
                        bot_code: finalBotCode,
                        project_state: newProjectState
                    }
                };
                if (finalResult.html) {
                    const translit = (str) => {
                        const ruMap = { 'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya' };
                        return str.toLowerCase().split('').map(c => ruMap[c] || c).join('');
                    };
                    const slug = translit(promptText).replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 24) || `site-${Date.now().toString().slice(-6)}`;
                    await this.mazaikaDb.save('global', `site_${slug}`, finalResult);
                    finalResult.explanation += isRu
                        ? `\n\n🌐 Ваш проект опубликован в Mazaika Cloud: /cloud/sites/${slug}`
                        : `\n\n🌐 Sening sayting Mazaika Cloud'da tayyor: /cloud/sites/${slug}`;
                }
                return finalResult;
            }
        }
        catch (error) {
            this.logger.error(`Fatal Service Error: ${error.message}`);
            return {
                type: 'site',
                execution_mode: 'ERROR',
                target_entity: 'site_only',
                title: 'Error',
                explanation: 'Xatolik yuz berdi. Qayta urinib koring.',
                html: rawInput?.currentHtml || rawInput?.currentConfig?.html || ''
            };
        }
    }
    async callAI(systemInstruction, userPrompt, imageBase64, imageMimeType, attempt, jsonMode, googleKey) {
        if (googleKey) {
            return this.callGemini(googleKey, systemInstruction, userPrompt, imageBase64, imageMimeType, attempt, jsonMode);
        }
        const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';
        const cfApiToken = process.env.CLOUDFLARE_API_TOKEN || '';
        if (!cfAccountId || !cfApiToken) {
            throw new Error('No API key provided for either Gemini or Cloudflare.');
        }
        return this.callCloudflareAI(cfAccountId, cfApiToken, systemInstruction, userPrompt);
    }
    async callCloudflareAI(accountId, apiToken, systemInstruction, userPrompt) {
        const models = [
            '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
            '@cf/qwen/qwen2.5-coder-32b-instruct',
            '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
            '@cf/meta/llama-3.1-70b-instruct',
            '@cf/meta/llama-3.2-11b-vision-instruct',
        ];
        for (const model of models) {
            try {
                const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
                this.logger.log(`🤖 Mazaika AI → Cloudflare (${model})`);
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messages: [
                            { role: 'system', content: systemInstruction },
                            { role: 'user', content: userPrompt }
                        ],
                        max_tokens: 16384,
                        temperature: 0.2,
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    let text = data.result?.choices?.[0]?.message?.content || data.result?.response || '';
                    text = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
                    if (text) {
                        const parsed = this.extractJsonObjectWithSelfHeal(text);
                        if (parsed) {
                            this.logger.log(`✅ Mazaika AI (${model}) — success`);
                            return parsed;
                        }
                    }
                }
                else {
                    const errText = await res.text().catch(() => '');
                    this.logger.warn(`⚠️ Mazaika AI (${model}) HTTP ${res.status}: ${errText.substring(0, 200)}`);
                }
            }
            catch (e) {
                this.logger.warn(`⚠️ Mazaika AI (${model}) error: ${e.message}`);
            }
        }
        this.logger.error('❌ All Cloudflare AI models failed');
        return null;
    }
    async callGemini(apiKey, systemInstruction, userPrompt, imageBase64, imageMimeType, attempt, jsonMode) {
        const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
        const temperature = attempt === 0 ? 0.7 : 0.3;
        for (const model of models) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
                const parts = [{ text: `${systemInstruction}\n\n${userPrompt}` }];
                if (imageBase64 && imageBase64.length > 10) {
                    parts.push({
                        inline_data: {
                            mime_type: imageMimeType || 'image/jpeg',
                            data: imageBase64
                        }
                    });
                }
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts }],
                        generationConfig: {
                            temperature,
                            maxOutputTokens: 16384
                        }
                    })
                });
                if (!res.ok) {
                    this.logger.warn(`Gemini API Error: ${res.status}`);
                    continue;
                }
                const data = await res.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text)
                    continue;
                const parsed = this.extractJsonObjectWithSelfHeal(text);
                if (parsed)
                    return parsed;
            }
            catch (e) {
                this.logger.warn(`Gemini ${model} Error: ${e.message}`);
            }
        }
        if (attempt === 0) {
            this.logger.warn('Self-healing retry triggered');
            return this.callGemini(apiKey, systemInstruction, userPrompt, imageBase64, imageMimeType, 1, jsonMode);
        }
        return null;
    }
    extractJsonObjectWithSelfHeal(text) {
        if (!text)
            return null;
        let jsonText = text;
        let files = {};
        const fileRegex = /<file\s+path=["']([^"']+)["']>([\s\S]*?)<\/file>/gi;
        let match;
        let hasFiles = false;
        while ((match = fileRegex.exec(text)) !== null) {
            files[match[1]] = match[2].trim();
            hasFiles = true;
        }
        if (hasFiles) {
            jsonText = text.replace(/<file\s+path=["']([^"']+)["']>([\s\S]*?)<\/file>/gi, '').trim();
        }
        jsonText = jsonText.replace(/\`\`\`json/gi, '').replace(/\`\`\`/gi, '').trim();
        let parsedJson = null;
        const firstBrace = jsonText.indexOf('{');
        const lastBrace = jsonText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const jsonCandidate = jsonText.substring(firstBrace, lastBrace + 1);
            try {
                const cleaned = jsonCandidate.replace(/,\s*([\]}])/g, '$1');
                parsedJson = JSON.parse(cleaned);
            }
            catch (e) {
                this.logger.warn('JSON Parse failed on first attempt: ' + e);
            }
        }
        let htmlPart = '';
        if (!parsedJson) {
            parsedJson = {
                type: 'site',
                execution_mode: 'FULL_GENERATION',
                target_entity: 'site_only',
                explanation: 'Sayt muvaffaqiyatli yaratildi!'
            };
            if (!hasFiles) {
                let rawHtml = text.replace(/^```html\s*/i, '').replace(/```\s*$/i, '').trim();
                const fallbackMatch = rawHtml.match(/(?:<!DOCTYPE html>\s*)?<html[\s\S]*/i);
                if (fallbackMatch) {
                    htmlPart = fallbackMatch[0];
                    parsedJson.explanation = isRawRussian(text) ? rawHtml.replace(fallbackMatch[0], '').trim() || 'Код готов!' : rawHtml.replace(fallbackMatch[0], '').trim() || 'Kod tayyor!';
                }
                else {
                    htmlPart = rawHtml;
                }
                parsedJson.html = htmlPart;
                parsedJson.source_code = htmlPart;
            }
        }
        else {
            htmlPart = parsedJson.html || parsedJson.source_code || parsedJson.website_html || '';
            if (!htmlPart && typeof parsedJson.explanation === 'string' && parsedJson.explanation.includes('<html')) {
                const fallbackMatch = parsedJson.explanation.match(/(?:<!DOCTYPE html>\s*)?<html[\s\S]*/i);
                if (fallbackMatch) {
                    htmlPart = fallbackMatch[0];
                    parsedJson.source_code = htmlPart;
                    parsedJson.html = htmlPart;
                    parsedJson.explanation = parsedJson.explanation.replace(fallbackMatch[0], '').trim();
                    if (!parsedJson.explanation) {
                        parsedJson.explanation = isRawRussian(text) ? 'Готово! Код сгенерирован.' : 'Tayyor! Kod yaratildi.';
                    }
                }
            }
        }
        if (hasFiles) {
            parsedJson.files = files;
            if (files['index.html']) {
                parsedJson.html = files['index.html'];
                parsedJson.source_code = files['index.html'];
                htmlPart = files['index.html'];
            }
            if (parsedJson.ecosystem && Array.isArray(parsedJson.ecosystem.components)) {
                parsedJson.ecosystem.components.forEach((comp) => {
                    if (comp.source_file && files[comp.source_file]) {
                        comp.source_code = files[comp.source_file];
                    }
                });
            }
        }
        let hasMore = false;
        if (htmlPart && htmlPart.toLowerCase().includes('<html')) {
            const lowerHtml = htmlPart.toLowerCase();
            if (!lowerHtml.includes('</html>')) {
                hasMore = true;
                this.logger.warn('⚠️ HTML was truncated by token limit. Auto-closing tags & setting has_more=true');
                if (lowerHtml.lastIndexOf('<style') > lowerHtml.lastIndexOf('</style>')) {
                    htmlPart += '\n</style>';
                }
                if (lowerHtml.lastIndexOf('<script') > lowerHtml.lastIndexOf('</script>')) {
                    htmlPart += '\n</script>';
                }
                if (!lowerHtml.includes('</body>')) {
                    htmlPart += '\n</body>';
                }
                htmlPart += '\n</html>';
                parsedJson.explanation = isRawRussian(text)
                    ? '⚡ Я создал основную структуру и первые страницы! Нажмите кнопку "Продолжить генерацию", чтобы я достроил остальные разделы!'
                    : '⚡ Saytning asosiy qismi yaratildi! Qolgan sahifa va bo\'limlarni qo\'shish uchun "Davom ettirish" tugmasini bosing!';
            }
            if (hasFiles && files['index.html']) {
                parsedJson.files['index.html'] = htmlPart;
            }
            parsedJson.html = htmlPart;
            parsedJson.source_code = htmlPart;
        }
        else if (text) {
            const lowerText = text.toLowerCase();
            if (lowerText.includes('continue') || lowerText.includes('продолжить') || lowerText.includes('davom ettirish')) {
                hasMore = true;
            }
        }
        if (hasMore) {
            parsedJson.has_more = true;
            parsedJson.execution_mode = 'FULL_GENERATION';
            parsedJson.target_entity = 'site_only';
        }
        if (hasFiles && Object.keys(files).length > 0) {
            let combinedHtml = files['index.html'] || files['index.tsx'] || '';
            if (combinedHtml) {
                combinedHtml = combinedHtml.replace(/^```[a-z]*\s*/im, '').replace(/```\s*$/m, '');
                const cssContent = files['style.css'] || files['index.css'] || files['styles.css'];
                const jsContent = files['script.js'] || files['main.js'] || files['app.js'];
                if (cssContent && combinedHtml.includes('</head>')) {
                    const cleanCss = cssContent.replace(/^```[a-z]*\s*/im, '').replace(/```\s*$/m, '');
                    combinedHtml = combinedHtml.replace('</head>', `<style>\n${cleanCss}\n</style>\n</head>`);
                }
                if (jsContent && combinedHtml.includes('</body>')) {
                    const cleanJs = jsContent.replace(/^```[a-z]*\s*/im, '').replace(/```\s*$/m, '');
                    combinedHtml = combinedHtml.replace('</body>', `<script>\n${cleanJs}\n</script>\n</body>`);
                }
                parsedJson.html = combinedHtml;
                parsedJson.source_code = combinedHtml;
            }
        }
        return parsedJson;
    }
    generateRichFallbackProject(promptText, target, isRu) {
        const isFood = /(restoran|kafe|pitsa|burger|fastfood|ovqat|taom|yetkaz|еда|пицц|ресторан|кафе|доставк|блюд|бургер|шаурма)/i.test(promptText);
        const isAcademy = /(kurs|akadem|maktab|dars|ta'lim|it|school|обучени|курс|академи|школ|урок|студент)/i.test(promptText);
        const isBeauty = /(salon|barber|go'zallik|soch|makiyaj|красот|салон|барбер|парикмахер)/i.test(promptText);
        let appName = isRu ? 'LuxeStyle Fashion' : 'LuxeStyle Kiyim Do\'koni';
        let appCategory = isRu ? 'Магазин одежды и обуви' : 'Kiyim va poyabzal do\'koni';
        let products = [
            {
                id: 1,
                title: isRu ? "Oversize Худи 'Midnight'" : "Oversize Xudi 'Midnight'",
                price: 320000,
                priceFormatted: isRu ? "320 000 сум" : "320 000 so'm",
                category: isRu ? "Худи" : "Xudi",
                badge: isRu ? "Хит" : "Xit",
                rating: "★ 4.9 (142)",
                img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80",
                desc: isRu ? "100% турецкий хлопок плотностью 380г. Идеальная посадка." : "100% turk paxtasi 380g. Qulay va zamonaviy bichim."
            },
            {
                id: 2,
                title: isRu ? "Кроссовки CloudWalk Pro" : "Krossovka CloudWalk Pro",
                price: 540000,
                priceFormatted: isRu ? "540 000 сум" : "540 000 so'm",
                category: isRu ? "Обувь" : "Poyabzal",
                badge: isRu ? "New" : "Yangi",
                rating: "★ 5.0 (89)",
                img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
                desc: isRu ? "Амортизирующая подошва Air Cushion, дышащий верх." : "Air Cushion amortizatsiya va havo o'tkazuvchi to'qima."
            },
            {
                id: 3,
                title: isRu ? "Джинсы Denim Classic Slim" : "Djinlar Denim Classic Slim",
                price: 290000,
                priceFormatted: isRu ? "290 000 сум" : "290 000 so'm",
                category: isRu ? "Джинсы" : "Djinlar",
                badge: isRu ? "-15%" : "-15%",
                rating: "★ 4.8 (64)",
                img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80",
                desc: isRu ? "Классический деним с добавлением спандекса для свободы движений." : "Klassik sifatli denim, harakat uchun qulay elastan bilan."
            },
            {
                id: 4,
                title: isRu ? "Кожаная Куртка Urban Rider" : "Charm Kurtka Urban Rider",
                price: 780000,
                priceFormatted: isRu ? "780 000 сум" : "780 000 so'm",
                category: isRu ? "Куртки" : "Kurtkalar",
                badge: isRu ? "Top" : "Top",
                rating: "★ 4.9 (118)",
                img: "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=600&q=80",
                desc: isRu ? "Премиум эко-кожа высокой износостойкости с металлической фурнитурой." : "Premium eko-charm va metall furnituralar."
            },
            {
                id: 5,
                title: isRu ? "Спортивный Костюм TechPro" : "Sport Kostyumi TechPro",
                price: 430000,
                priceFormatted: isRu ? "430 000 сум" : "430 000 so'm",
                category: isRu ? "Костюмы" : "Kostyumlar",
                badge: isRu ? "Aksiya" : "Aksiya",
                rating: "★ 4.7 (75)",
                img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
                desc: isRu ? "Дышащая технологичная ткань для тренировок и повседневной носки." : "Sport va kundalik kiyish uchun maxsus nafas oluvchi mato."
            },
            {
                id: 6,
                title: isRu ? "Футболка Oversize Minimal" : "Futbolka Oversize Minimal",
                price: 160000,
                priceFormatted: isRu ? "160 000 сум" : "160 000 so'm",
                category: isRu ? "Футболки" : "Futbolkalar",
                badge: isRu ? "Basic" : "Asosiy",
                rating: "★ 4.8 (210)",
                img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80",
                desc: isRu ? "Базовый оверсайз крой из премиального мерсеризованного хлопка." : "Premium paxtali minimal dizayndagi qulay futbolka."
            }
        ];
        if (isFood) {
            appName = isRu ? "Bella Pizza & Burger" : "Bella Pitsa & Burger";
            appCategory = isRu ? "Ресторан и доставка еды" : "Restoran va taom yetkazish";
            products = [
                { id: 1, title: isRu ? "Пицца Пепперони Grand" : "Pitsa Pepperoni Grand", price: 79000, priceFormatted: isRu ? "79 000 сум" : "79 000 so'm", category: isRu ? "Пицца" : "Pitsa", badge: isRu ? "Хит" : "Xit", rating: "★ 5.0 (310)", img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80", desc: isRu ? "Сыр моцарелла, пряные колбаски пепперони, итальянский томатный соус." : "Sertom Mozzarella pishlog'i va achchiq pepperoni kolbasasi." },
                { id: 2, title: isRu ? "Бургер Black Angus Double" : "Burger Black Angus Double", price: 58000, priceFormatted: isRu ? "58 000 сум" : "58 000 so'm", category: isRu ? "Бургеры" : "Burgerlar", badge: isRu ? "Top" : "Top", rating: "★ 4.9 (185)", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80", desc: isRu ? "Две сочные котлеты из говядины Ангус, сыр чеддер, фирменный соус." : "Ikkita sersuv go'shtli kotlet, cheddor pishlog'i va maxsus sous." },
                { id: 3, title: isRu ? "Сет Суши Филадельфия Lux" : "Sushi Set Filadelfiya Lux", price: 110000, priceFormatted: isRu ? "110 000 сум" : "110 000 so'm", category: isRu ? "Суши" : "Sushi", badge: isRu ? "New" : "Yangi", rating: "★ 4.9 (92)", img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80", desc: isRu ? "Свежий лосось, сливочный сыр, авокадо, икра тобико." : "Yangi losos balig'i, qaymoqli pishloq va avokado." },
                { id: 4, title: isRu ? "Стейк Рибай Прайм" : "Stéyk Ribay Praym", price: 145000, priceFormatted: isRu ? "145 000 сум" : "145 000 so'm", category: isRu ? "Мясо" : "Go'sht", badge: isRu ? "Premium" : "Premium", rating: "★ 5.0 (64)", img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80", desc: isRu ? "Мраморная говядина зернового откорма, обжаренная на углях с розмарином." : "Don bilan boqilgan mol go'shti, ko'mirda pishirilgan steyk." },
                { id: 5, title: isRu ? "Салат Цезарь с креветками" : "Tsezar Salati krevetka bilan", price: 49000, priceFormatted: isRu ? "49 000 сум" : "49 000 so'm", category: isRu ? "Салаты" : "Salatlar", badge: isRu ? "Classic" : "Klassik", rating: "★ 4.8 (83)", img: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&q=80", desc: isRu ? "Тигровые креветки, хрустящий айсберг, соус цезарь, пармезан." : "Yo'lbars krevetkalari, qarsildoq aysberg, parmesan pishlog'i." },
                { id: 6, title: isRu ? "Цитрусовый Лимонад Berry" : "Sitrus Limonad Berry", price: 25000, priceFormatted: isRu ? "25 000 сум" : "25 000 so'm", category: isRu ? "Напитки" : "Ichimliklar", badge: isRu ? "Fresh" : "Muzdek", rating: "★ 4.9 (120)", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&q=80", desc: isRu ? "Натуральный свежевыжатый сок лайма, мята, клубника и лед." : "Laym sharbati, yalpiz va tabiiy qulupnayli tetiklantiruvchi limonad." }
            ];
        }
        else if (isAcademy) {
            appName = isRu ? "CodeCraft IT Academy" : "CodeCraft IT Akademiyasi";
            appCategory = isRu ? "Образовательная IT-платформа" : "Zamonaviy IT ta'lim platformasi";
            products = [
                { id: 1, title: isRu ? "Frontend Pro: React & Next.js" : "Frontend Pro: React & Next.js", price: 1200000, priceFormatted: isRu ? "1 200 000 сум/мес" : "1 200 000 so'm/oy", category: "Frontend", badge: isRu ? "Хит" : "Xit", rating: "★ 5.0 (280)", img: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80", desc: isRu ? "Полный курс: TypeScript, React, Next.js 14, Tailwind, портфолио из 5 проектов." : "Noldan kuchli darajagacha: TypeScript, React, Next.js va 5 ta real loyiha." },
                { id: 2, title: isRu ? "Python AI & Deep Learning" : "Python AI & Mashinali O'rganish", price: 1400000, priceFormatted: isRu ? "1 400 000 сум/мес" : "1 400 000 so'm/oy", category: "AI & ML", badge: isRu ? "Top" : "Top", rating: "★ 4.9 (195)", img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80", desc: isRu ? "Нейросети, LLM, компьютерное зрение, работа с PyTorch и OpenAI API." : "Sun'iy intellekt, LLM va neyrotarmoqlar bo'yicha amaliy darslar." },
                { id: 3, title: isRu ? "Backend Engineering: Node & NestJS" : "Backend Engineering: Node & NestJS", price: 1200000, priceFormatted: isRu ? "1 200 000 сум/мес" : "1 200 000 so'm/oy", category: "Backend", badge: isRu ? "Pro" : "Pro", rating: "★ 4.9 (140)", img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80", desc: isRu ? "Микросервисы, PostgreSQL, Redis, Docker, архитектура баз данных." : "Mikroservislar, ma'lumotlar bazasi va yuksak yuklamali tizimlar." },
                { id: 4, title: isRu ? "Mobile Dev: Flutter & Dart" : "Mobile Dev: Flutter & Dart", price: 1300000, priceFormatted: isRu ? "1 300 000 сум/мес" : "1 300 000 so'm/oy", category: "Mobile", badge: isRu ? "New" : "Yangi", rating: "★ 4.8 (85)", img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80", desc: isRu ? "Кроссплатформенная разработка для iOS и Android с публикацией в App Store." : "iOS va Android uchun ilovalar yaratish va do'konlarga joylash." },
                { id: 5, title: isRu ? "UI/UX & Product Design" : "UI/UX Mahsulot Dizayni", price: 950000, priceFormatted: isRu ? "950 000 сум/мес" : "950 000 so'm/oy", category: "Design", badge: isRu ? "Pop" : "Ommabop", rating: "★ 4.9 (160)", img: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600&q=80", desc: isRu ? "Figma, дизайн-системы, UX исследования, прототипирование и анимации." : "Figma, dizayn tizimlari va zamonaviy mobil interfeyslar arxitekturasi." },
                { id: 6, title: isRu ? "DevOps & Cloud Architect" : "DevOps & Bulutli Texnologiyalar", price: 1500000, priceFormatted: isRu ? "1 500 000 сум/мес" : "1 500 000 so'm/oy", category: "DevOps", badge: isRu ? "VIP" : "VIP", rating: "★ 5.0 (45)", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80", desc: isRu ? "CI/CD, Kubernetes, AWS, Terraform, мониторинг и защита серверов." : "CI/CD avtomatlashtirish, Kubernetes va AWS bulutli infratuzilmasi." }
            ];
        }
        else if (isBeauty) {
            appName = isRu ? "BarberKing & Beauty Lounge" : "BarberKing & Go'zallik Saloni";
            appCategory = isRu ? "Салон красоты и барбершоп" : "Go'zallik saloni va barbershop";
            products = [
                { id: 1, title: isRu ? "Комплекс: Стрижка + Борода" : "Kompleks: Soch + Soqol", price: 150000, priceFormatted: isRu ? "150 000 сум" : "150 000 so'm", category: "Barber", badge: isRu ? "Хит" : "Xit", rating: "★ 5.0 (215)", img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80", desc: isRu ? "Модельная стрижка, распаривание, королевское бритье и стайлинг." : "Klassik soch turmagi, soqol tekislash va professional styling." },
                { id: 2, title: isRu ? "Премиум Уход за кожей лица" : "Yuz terisi parvarishi (Spa)", price: 220000, priceFormatted: isRu ? "220 000 сум" : "220 000 so'm", category: "Spa", badge: isRu ? "Relax" : "Relax", rating: "★ 4.9 (98)", img: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80", desc: isRu ? "Ультразвуковая чистка, увлажняющая маска и массаж лица." : "Yuzni tozalash, namlantiruvchi niqob va yuz massaji." },
                { id: 3, title: isRu ? "Мужской Маникюр & Уход" : "Erkaklar manikyuri", price: 120000, priceFormatted: isRu ? "120 000 сум" : "120 000 so'm", category: "Nails", badge: isRu ? "Clean" : "Toza", rating: "★ 4.8 (65)", img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80", desc: isRu ? "Аппаратный уход за ногтями и смягчающий крем." : "Qo'llar va tirnoqlarni sifatli parvarishlash." },
                { id: 4, title: isRu ? "Камуфляж седины Hair Tone" : "Soch va soqol ranglash", price: 180000, priceFormatted: isRu ? "180 000 сум" : "180 000 so'm", category: "Color", badge: isRu ? "Top" : "Top", rating: "★ 4.9 (78)", img: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&q=80", desc: isRu ? "Естественное тонирование седины профессиональными красителями." : "Soch va soqolga tabiiy tus beruvchi maxsus bo'yoq." }
            ];
        }
        const categories = Array.from(new Set(products.map(p => p.category)));
        const productsJson = JSON.stringify(products);
        const html = `<!DOCTYPE html>
<html lang="${isRu ? 'ru' : 'uz'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #07090E; color: #F8FAFC; }
    h1, h2, h3, h4 { font-family: 'Outfit', sans-serif; }
    .glass-card { background: rgba(255, 255, 255, 0.04); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .glass-card:hover { border-color: rgba(0, 217, 255, 0.3); transform: translateY(-2px); }
    .glow-cyan { box-shadow: 0 0 25px rgba(0, 217, 255, 0.25); }
    .cart-drawer { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
  </style>
</head>
<body class="min-h-screen flex flex-col pb-24 selection:bg-cyan-500 selection:text-black">

  <!-- Top Sticky Header -->
  <header class="sticky top-0 z-40 bg-[#07090E]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
    <div class="max-w-5xl mx-auto flex items-center justify-between gap-3">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-lg glow-cyan">
          ${appName.charAt(0)}
        </div>
        <div>
          <div class="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
            ${appName}
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div class="text-[11px] text-slate-400 font-medium">${appCategory}</div>
        </div>
      </div>

      <button onclick="toggleCart()" class="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 transition flex items-center gap-2">
        <i class="fa-solid fa-bag-shopping text-base"></i>
        <span id="headerCartCount" class="bg-cyan-500 text-black text-[11px] font-black px-1.5 py-0.5 rounded-full">0</span>
      </button>
    </div>
  </header>

  <!-- Hero Banner -->
  <section class="max-w-5xl mx-auto px-4 pt-6 pb-2 w-full">
    <div class="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-purple-950/30 border border-cyan-500/20 glow-cyan">
      <div class="relative z-10 max-w-lg">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-3">
          <i class="fa-solid fa-bolt"></i> ${isRu ? "Официальный Telegram Mini App" : "Rasmiy Telegram Mini App"}
        </span>
        <h1 class="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
          ${isRu ? "Эксклюзивные товары & Быстрая доставка" : "Eng sara tovarlar va tezkor yetkazib berish"}
        </h1>
        <p class="text-slate-300 text-xs sm:text-sm leading-relaxed mb-5">
          ${isRu ? "Выберите понравившиеся позиции, оплатите в 1 клик через Payme или Click прямо в Telegram!" : "O'zingizga ma'qul tovarlarni tanlang va Telegram ichida Payme yoki Click orqali xarid qiling!"}
        </p>
        <div class="flex items-center gap-3">
          <a href="#catalog" class="px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs sm:text-sm hover:bg-cyan-400 transition glow-cyan flex items-center gap-2">
            <span>${isRu ? "Смотреть каталог" : "Katalogni ko'rish"}</span>
            <i class="fa-solid fa-arrow-down"></i>
          </a>
        </div>
      </div>
      <div class="absolute -right-12 -bottom-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  </section>

  <!-- Search & Category Filters -->
  <section id="catalog" class="max-w-5xl mx-auto px-4 pt-6 pb-4 w-full">
    <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-4">
      <div class="relative flex-1">
        <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
        <input 
          id="searchInput"
          type="text" 
          placeholder="${isRu ? 'Поиск товаров по каталогу...' : 'Katalog bo\'yicha tovar qidirish...'}"
          oninput="searchProducts(this.value)"
          class="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition"
        />
      </div>

      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        <button onclick="filterCategory('all')" class="cat-pill active px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap bg-cyan-500 text-black transition">
          ${isRu ? "Все" : "Barchasi"}
        </button>
        ${categories.map(cat => `
          <button onclick="filterCategory('${cat}')" class="cat-pill px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition">
            ${cat}
          </button>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Products Grid -->
  <main class="max-w-5xl mx-auto px-4 w-full flex-1">
    <div id="productsGrid" class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4"></div>
    <div id="noResults" class="hidden text-center py-16">
      <i class="fa-solid fa-box-open text-3xl text-slate-600 mb-2"></i>
      <p class="text-sm text-slate-400">${isRu ? "Товары не найдены" : "Hech narsa topilmadi"}</p>
    </div>
  </main>

  <!-- Slide-Over Shopping Cart Drawer -->
  <div id="cartModal" class="fixed inset-0 z-50 pointer-events-none opacity-0 transition-opacity duration-300">
    <div onclick="toggleCart()" class="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto"></div>
    <div class="cart-drawer absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#0D111A] border-l border-white/10 p-5 flex flex-col pointer-events-auto translate-x-full shadow-2xl">
      <div class="flex items-center justify-between pb-4 border-b border-white/10">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-bag-shopping text-cyan-400"></i>
          <h3 class="font-bold text-base text-white">${isRu ? "Ваша Корзина" : "Savatchangiz"}</h3>
          <span id="cartCountBadge" class="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold">0</span>
        </div>
        <button onclick="toggleCart()" class="w-8 h-8 rounded-lg bg-white/5 text-slate-400 hover:text-white flex items-center justify-center">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <div id="cartItemsList" class="flex-1 overflow-y-auto py-4 space-y-3"></div>

      <div class="pt-4 border-t border-white/10 space-y-3">
        <div class="flex justify-between text-xs text-slate-400">
          <span>${isRu ? "Доставка" : "Yetkazib berish"}</span>
          <span class="text-emerald-400 font-bold">${isRu ? "Бесплатно" : "Bepul"}</span>
        </div>
        <div class="flex justify-between text-base font-black text-white">
          <span>${isRu ? "Итого к оплате:" : "Jami to'lov:"}</span>
          <span id="cartTotalSum" class="text-cyan-400">0 so'm</span>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-1">
          <button onclick="checkout('payme')" class="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition">
            <i class="fa-solid fa-credit-card"></i> Payme
          </button>
          <button onclick="checkout('click')" class="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition">
            <i class="fa-solid fa-mobile-screen"></i> Click
          </button>
        </div>
        <button onclick="checkout('telegram')" class="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs sm:text-sm transition glow-cyan flex items-center justify-center gap-2">
          <span>${isRu ? "Оформить заказ в Telegram" : "Telegram orqali buyurtma berish"}</span>
          <i class="fa-solid fa-paper-plane"></i>
        </button>
      </div>
    </div>
  </div>

  <script>
    const ALL_PRODUCTS = ${productsJson};
    let cart = [];
    let currentFilter = 'all';

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }

    function renderProducts(items) {
      const grid = document.getElementById('productsGrid');
      const noResults = document.getElementById('noResults');
      if (items.length === 0) {
        grid.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
      }
      noResults.classList.add('hidden');
      grid.innerHTML = items.map(p => \`
        <div class="glass-card rounded-2xl overflow-hidden flex flex-col p-2.5 sm:p-3 transition duration-200">
          <div class="relative aspect-square rounded-xl overflow-hidden mb-2 bg-slate-800">
            <img src="\${p.img}" alt="\${p.title}" class="w-full h-full object-cover" loading="lazy" />
            <span class="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-black bg-black/60 backdrop-blur-md text-cyan-300 border border-white/10">
              \${p.badge}
            </span>
            <span class="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/60 backdrop-blur-md text-amber-300">
              \${p.rating}
            </span>
          </div>

          <div class="flex-1 flex flex-col justify-between">
            <div>
              <div class="text-[11px] text-cyan-400 font-semibold mb-0.5">\${p.category}</div>
              <h4 class="text-xs sm:text-sm font-bold text-white line-clamp-1 leading-snug">\${p.title}</h4>
              <p class="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-tight">\${p.desc}</p>
            </div>

            <div class="mt-3 pt-2 border-t border-white/5 flex items-center justify-between gap-2">
              <div class="font-black text-xs sm:text-sm text-cyan-400 tracking-tight">\${p.priceFormatted}</div>
              <button 
                onclick="addToCart(\${p.id})"
                class="px-2.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-[11px] font-black flex items-center gap-1 transition active:scale-95 glow-cyan"
              >
                <i class="fa-solid fa-plus text-[10px]"></i>
                <span>${isRu ? "В корзину" : "Savatga"}</span>
              </button>
            </div>
          </div>
        </div>
      \`).join('');
    }

    function filterCategory(cat) {
      currentFilter = cat;
      document.querySelectorAll('.cat-pill').forEach(btn => {
        btn.classList.remove('bg-cyan-500', 'text-black');
        btn.classList.add('bg-white/5', 'text-slate-300');
      });
      event.target.classList.remove('bg-white/5', 'text-slate-300');
      event.target.classList.add('bg-cyan-500', 'text-black');

      const filtered = cat === 'all' ? ALL_PRODUCTS : ALL_PRODUCTS.filter(p => p.category === cat);
      renderProducts(filtered);
    }

    function searchProducts(q) {
      const val = q.toLowerCase().trim();
      const filtered = ALL_PRODUCTS.filter(p => 
        (currentFilter === 'all' || p.category === currentFilter) &&
        (p.title.toLowerCase().includes(val) || p.desc.toLowerCase().includes(val))
      );
      renderProducts(filtered);
    }

    function toggleCart() {
      const modal = document.getElementById('cartModal');
      const drawer = modal.querySelector('.cart-drawer');
      const isOpen = !modal.classList.contains('opacity-0');

      if (isOpen) {
        modal.classList.add('opacity-0', 'pointer-events-none');
        drawer.classList.add('translate-x-full');
      } else {
        renderCartItems();
        modal.classList.remove('opacity-0', 'pointer-events-none');
        drawer.classList.remove('translate-x-full');
      }
    }

    function addToCart(id) {
      const prod = ALL_PRODUCTS.find(p => p.id === id);
      if (!prod) return;
      const existing = cart.find(item => item.id === id);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ ...prod, qty: 1 });
      }
      updateCartState();
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    }

    function updateCartQty(id, delta) {
      const idx = cart.findIndex(i => i.id === id);
      if (idx === -1) return;
      cart[idx].qty += delta;
      if (cart[idx].qty <= 0) {
        cart.splice(idx, 1);
      }
      updateCartState();
      renderCartItems();
    }

    function updateCartState() {
      const totalCount = cart.reduce((sum, i) => sum + i.qty, 0);
      const totalSum = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

      document.getElementById('headerCartCount').innerText = totalCount;
      document.getElementById('cartCountBadge').innerText = totalCount;
      document.getElementById('cartTotalSum').innerText = totalSum.toLocaleString() + " so'm";
    }

    function renderCartItems() {
      const list = document.getElementById('cartItemsList');
      if (cart.length === 0) {
        list.innerHTML = \`
          <div class="text-center py-16 text-slate-500">
            <i class="fa-solid fa-cart-arrow-down text-4xl mb-3 opacity-40"></i>
            <p class="text-xs font-semibold">${isRu ? "Ваша корзина пуста" : "Savat hozircha bo'sh"}</p>
          </div>
        \`;
        return;
      }

      list.innerHTML = cart.map(item => \`
        <div class="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
          <img src="\${item.img}" class="w-12 h-12 rounded-lg object-cover" alt="" />
          <div class="flex-1 min-w-0">
            <h5 class="text-xs font-bold text-white line-clamp-1">\${item.title}</h5>
            <div class="text-[11px] text-cyan-400 font-semibold">\${item.priceFormatted}</div>
          </div>
          <div class="flex items-center gap-1.5 bg-black/40 rounded-lg p-1 border border-white/10">
            <button onclick="updateCartQty(\${item.id}, -1)" class="w-6 h-6 rounded bg-white/10 text-white font-bold flex items-center justify-center text-xs hover:bg-white/20">-</button>
            <span class="text-xs font-bold text-white px-1.5">\${item.qty}</span>
            <button onclick="updateCartQty(\${item.id}, 1)" class="w-6 h-6 rounded bg-white/10 text-white font-bold flex items-center justify-center text-xs hover:bg-white/20">+</button>
          </div>
        </div>
      \`).join('');
    }

    function checkout(method) {
      if (cart.length === 0) {
        alert('${isRu ? "Сначала добавьте товары в корзину!" : "Avval savatchaga tovar qo'shing!"}');
        return;
      }
      const totalSum = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
      const payload = {
        app: '${appName}',
        method,
        items: cart.map(i => ({ id: i.id, title: i.title, qty: i.qty, price: i.price })),
        total: totalSum,
        timestamp: Date.now()
      };

      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.sendData(JSON.stringify(payload));
      } else {
        alert(\`${isRu ? 'Заказ на сумму ' : 'Jami '}\${totalSum.toLocaleString()} \${isRu ? 'сум успешно оформлен через ' : "so'mlik buyurtma qabul qilindi ("}\${method.toUpperCase()})!\`);
        cart = [];
        updateCartState();
        toggleCart();
      }
    }

    renderProducts(ALL_PRODUCTS);
  </script>
</body>
</html>`;
        const bot_blocks = [
            {
                id: "node_1",
                type: "start",
                position: { x: 100, y: 150 },
                data: { label: isRu ? "Старт" : "Boshlash", emoji: "▶", color: "#10d974", text: "/start" }
            },
            {
                id: "node_2",
                type: "message",
                position: { x: 450, y: 150 },
                data: {
                    label: isRu ? "Приветствие" : "Xush kelibsiz",
                    emoji: "💬",
                    color: "#1e90ff",
                    text: isRu
                        ? `Здравствуйте! Добро пожаловать в ${appName}. Выберите действие:`
                        : `Assalomu alaykum! ${appName}ga xush kelibsiz. Quyidagi bo'limlardan birini tanlang:`,
                    buttons: [
                        isRu ? "🛍 Открыть Mini App" : "🛍 Mini App-ni ochish",
                        isRu ? "🛒 Корзина" : "🛒 Savat",
                        isRu ? "📞 Связаться с нами" : "📞 Bog'lanish",
                        isRu ? "ℹ️ О нас" : "ℹ️ Biz haqimizda"
                    ]
                }
            },
            {
                id: "node_3",
                type: "phone",
                position: { x: 150, y: 380 },
                data: {
                    label: isRu ? "Номер телефона" : "Telefon raqam",
                    emoji: "📱",
                    color: "#06b6d4",
                    text: isRu ? "Для связи отправьте ваш номер телефона:" : "Bog'lanish uchun telefon raqamingizni yuboring:",
                    variable: "user_phone"
                }
            },
            {
                id: "node_4",
                type: "condition",
                position: { x: 450, y: 380 },
                data: {
                    label: isRu ? "Проверка" : "Tekshiruv",
                    emoji: "🔀",
                    color: "#ff6b6b",
                    variable: "user_phone",
                    operator: "!=",
                    value: ""
                }
            },
            {
                id: "node_5",
                type: "cart",
                position: { x: 800, y: 380 },
                data: {
                    label: isRu ? "Корзина" : "Savat",
                    emoji: "🛒",
                    color: "#a855f7",
                    title: isRu ? "Детали вашего заказа" : "Xaridlar savatchasi"
                }
            },
            {
                id: "node_6",
                type: "payme",
                position: { x: 200, y: 620 },
                data: {
                    label: "Payme To'lov",
                    emoji: "💳",
                    color: "#10b981",
                    price: 320000,
                    description: isRu ? "Оплата заказа через Payme" : "Buyurtma uchun Payme to'lovi"
                }
            },
            {
                id: "node_7",
                type: "click",
                position: { x: 500, y: 620 },
                data: {
                    label: "Click To'lov",
                    emoji: "💳",
                    color: "#3b82f6",
                    price: 320000,
                    description: isRu ? "Оплата заказа через Click" : "Buyurtma uchun Click to'lovi"
                }
            },
            {
                id: "node_8",
                type: "message",
                position: { x: 500, y: 840 },
                data: {
                    label: isRu ? "Подтверждение" : "Tasdiq xabari",
                    emoji: "✅",
                    color: "#10d974",
                    text: isRu
                        ? "Спасибо! Ваш заказ принят. Мы свяжемся с вами в течение 10 минут."
                        : "Rahmat! Buyurtmangiz qabul qilindi. Tez orada operatorimiz siz bilan bog'lanadi."
                }
            }
        ];
        const bot_edges = [
            { id: "e1-2", source: "node_1", target: "node_2", animated: true },
            { id: "e2-3", source: "node_2", target: "node_3" },
            { id: "e3-4", source: "node_3", target: "node_4" },
            { id: "e2-5", source: "node_2", target: "node_5" },
            { id: "e4-6", source: "node_4", target: "node_6" },
            { id: "e4-7", source: "node_4", target: "node_7" },
            { id: "e6-8", source: "node_6", target: "node_8" },
            { id: "e7-8", source: "node_7", target: "node_8" }
        ];
        const bot_code = `// =============================================
// ${appName.toUpperCase()} TELEGRAM BOT SERVER
// Generated by Mazaika AI Studio
// =============================================

const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN');
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://mazaika.app';

// /start command
bot.start((ctx) => {
  const firstName = ctx.from.first_name || 'Foydalanuvchi';
  return ctx.reply(
    \`Assalomu alaykum, \${firstName}! \${appName} rasmiy botiga xush kelibsiz.\`,
    Markup.inlineKeyboard([
      [Markup.button.webApp('🛍 Mini App-ni ochish', WEBAPP_URL)],
      [Markup.button.callback('📞 Aloqa / Yordam', 'contact_support')]
    ])
  );
});

// Mini App Order Data handler
bot.on('message', async (ctx) => {
  if (ctx.message.web_app_data) {
    try {
      const data = JSON.parse(ctx.message.web_app_data.data);
      let summary = \`✅ Yangi buyurtma qabul qilindi!\\n\\nJami summa: \${data.total?.toLocaleString()} so'm\\nTo'lov usuli: \${data.method}\\n\\nMahsulotlar:\\n\`;
      (data.items || []).forEach(item => {
        summary += \`• \${item.title} x \${item.qty}\\n\`;
      });
      await ctx.reply(summary);
    } catch (e) {
      await ctx.reply('Buyurtma qabul qilindi! Tez orada bog\\'lanamiz.');
    }
  }
});

bot.action('contact_support', (ctx) => {
  return ctx.reply('Biz bilan bog\\'lanish: @mazaika_support yoki +998 90 123 45 67');
});

bot.launch().then(() => {
  console.log('🚀 ${appName} Telegram bot running successfully!');
});
`;
        return { html, bot_blocks, bot_edges, bot_code, appName };
    }
};
exports.AntigravityService = AntigravityService;
exports.AntigravityService = AntigravityService = AntigravityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mazaika_db_service_1.MazaikaDbService])
], AntigravityService);
function isRawRussian(rawInput) {
    const text = typeof rawInput === 'string' ? rawInput : (rawInput?.prompt || '');
    return /[а-яА-ЯёЁ]/.test(text);
}
//# sourceMappingURL=antigravity.service.js.map