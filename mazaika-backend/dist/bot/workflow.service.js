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
var WorkflowService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../firebase/firebase.service");
const mazaika_engine_service_1 = require("../cloud/mazaika-engine.service");
let WorkflowService = WorkflowService_1 = class WorkflowService {
    firebaseService;
    mazaikaEngineService;
    logger = new common_1.Logger(WorkflowService_1.name);
    constructor(firebaseService, mazaikaEngineService) {
        this.firebaseService = firebaseService;
        this.mazaikaEngineService = mazaikaEngineService;
    }
    async processIncomingMessage(botId, telegramId, text, ctx) {
        this.logger.log(`Processing input from ${telegramId} for bot ${botId}: ${text}`);
        const bot = await this.firebaseService.getBot(botId);
        if (!bot)
            return;
        const workflow = await this.firebaseService.getBotWorkflow(botId);
        if (!workflow)
            return;
        let contact = await this.firebaseService.getContact(botId, telegramId);
        if (!contact) {
            contact = await this.firebaseService.createContact(botId, {
                telegramId,
                botId,
                state: JSON.stringify({ currentNodeId: null, variables: {}, waitingFor: null }),
                firstName: ctx.from?.first_name || null,
                lastName: ctx.from?.last_name || null,
                username: ctx.from?.username || null,
                languageCode: ctx.from?.language_code || null
            });
        }
        if (text.startsWith('webapp:')) {
            const payloadStr = text.substring(7);
            try {
                const payload = JSON.parse(payloadStr);
                const contactRef = this.firebaseService.db.collection('bots').doc(botId).collection('contacts').doc(contact.id);
                let state = contact.state ? JSON.parse(contact.state) : { variables: {}, waitingFor: null };
                if (!state.variables)
                    state.variables = {};
                const variables = { ...state.variables };
                let stage = contact.stage || 'Yangi';
                if (payload.action === 'order') {
                    const itemNames = payload.items.map((i) => i.name).join(', ');
                    const responseText = `🛒 Yangi buyurtma qabul qilindi!\n\n🛍 Mahsulotlar: ${itemNames}\n💰 Jami: ${payload.total.toLocaleString()} UZS\n👤 Mijoz: ${payload.customer.name}\n📞 Tel: ${payload.customer.phone}\n\nRahmat! Tez orada siz bilan bog'lanamiz.`;
                    await ctx.reply(responseText);
                    await this.firebaseService.addMessage(botId, contact.id, `Buyurtma: ${itemNames} (${payload.total} UZS)`, 'inbound');
                    await this.firebaseService.addMessage(botId, contact.id, responseText, 'outbound');
                    variables.last_order_items = itemNames;
                    variables.last_order_total = payload.total.toString();
                    variables.customer_name = payload.customer.name;
                    variables.customer_phone = payload.customer.phone;
                    stage = 'Kelishuv';
                }
                else if (payload.action === 'form_submit') {
                    let fieldSummary = '';
                    for (const [key, val] of Object.entries(payload.responses)) {
                        fieldSummary += `\n- ${key}: ${val}`;
                        const varName = key.toLowerCase().replace(/\s+/g, '_');
                        variables[varName] = val;
                    }
                    const responseText = `📝 So'rovnoma qabul qilindi!${fieldSummary}\n\nRahmat!`;
                    await ctx.reply(responseText);
                    await this.firebaseService.addMessage(botId, contact.id, `So'rovnoma: ${payload.formName}`, 'inbound');
                    await this.firebaseService.addMessage(botId, contact.id, responseText, 'outbound');
                    stage = 'Muloqot';
                }
                else if (payload.action === 'prize') {
                    const responseText = `🎉 Tabriklaymiz! Omad G'ildiragida siz yutgan sovg'a: "${payload.prize}"\n\nYutuqni olish uchun ushbu xabarni adminga taqdim eting.`;
                    await ctx.reply(responseText);
                    await this.firebaseService.addMessage(botId, contact.id, `Yutuq: ${payload.prize}`, 'inbound');
                    await this.firebaseService.addMessage(botId, contact.id, responseText, 'outbound');
                    variables.last_prize = payload.prize;
                }
                const updatedState = { ...state, variables };
                await contactRef.update({
                    state: JSON.stringify(updatedState),
                    stage,
                    updatedAt: new Date()
                });
                if (state.currentNodeId) {
                    const nodes = JSON.parse(workflow.nodes);
                    const edges = JSON.parse(workflow.edges);
                    const outgoingEdges = edges.filter(e => e.source === state.currentNodeId);
                    if (outgoingEdges.length > 0) {
                        const nextNodeId = outgoingEdges[0].target;
                        await this.resumeWorkflow(botId, contact.id, nextNodeId, ctx);
                    }
                }
            }
            catch (err) {
                this.logger.error(`Failed to parse WebApp payload: ${err.message}`);
            }
            return;
        }
        if (!text.startsWith('/start') && !text.startsWith('btn_') && !text.startsWith('contact:') && !text.startsWith('location:')) {
            await this.firebaseService.addMessage(botId, contact.id, text, 'inbound');
        }
        const nodes = JSON.parse(workflow.nodes);
        const edges = JSON.parse(workflow.edges);
        let state = contact.state ? JSON.parse(contact.state) : { variables: {}, waitingFor: null };
        if (!state.variables)
            state.variables = {};
        let currentNode = nodes.find(n => n.id === state.currentNodeId);
        let nextNode = null;
        if (text.startsWith('/start')) {
            state = { variables: {}, waitingFor: null };
            const parts = text.trim().split(/\s+/);
            if (parts.length > 1) {
                const payload = parts[1];
                state.variables['start_payload'] = payload;
                if (payload.startsWith('ref_')) {
                    const referrerId = payload.substring(4);
                    state.variables['referrer_id'] = referrerId;
                    try {
                        const contactRef = this.firebaseService.db.collection('bots').doc(botId).collection('contacts').doc(contact.id);
                        const contactDoc = await contactRef.get();
                        const contactData = contactDoc.data() || {};
                        if (!contactData.referredBy && referrerId !== contact.id && referrerId !== telegramId) {
                            await contactRef.update({ referredBy: referrerId, updatedAt: new Date() });
                            const refDocRef = this.firebaseService.db.collection('bots').doc(botId).collection('contacts').doc(referrerId);
                            const refSnap = await refDocRef.get();
                            if (refSnap.exists) {
                                const refData = refSnap.data() || {};
                                await refDocRef.update({ referralCount: (refData.referralCount || 0) + 1 });
                            }
                        }
                    }
                    catch (refErr) {
                        this.logger.error(`Referral tracking error: ${refErr.message}`);
                    }
                }
            }
            currentNode = nodes.find(n => n.type === 'start');
            nextNode = currentNode;
        }
        else if (state.waitingFor === 'question') {
            const varName = currentNode?.data?.variable;
            if (varName) {
                let answer = text;
                if (text.startsWith('btn_') && currentNode?.data?.buttons) {
                    const idx = parseInt(text.split('_')[1]);
                    if (!isNaN(idx) && currentNode.data.buttons[idx]) {
                        const btn = currentNode.data.buttons[idx];
                        answer = typeof btn === 'string' ? btn : (btn.text || 'Tugma');
                    }
                }
                state.variables[varName] = answer;
            }
            state.waitingFor = null;
            nextNode = this.getNextNode(currentNode, null, edges, nodes, state);
        }
        else if (state.waitingFor === 'phone') {
            const varName = currentNode?.data?.variable || 'phone';
            if (text.startsWith('contact:')) {
                state.variables[varName] = text.replace('contact:', '');
                state.waitingFor = null;
                nextNode = this.getNextNode(currentNode, null, edges, nodes, state);
            }
            else {
                const cleanText = text.replace(/[\s\-\(\)\+]/g, '');
                const isDigits = /^[0-9]{9,15}$/.test(cleanText);
                if (isDigits) {
                    state.variables[varName] = text;
                    state.waitingFor = null;
                    nextNode = this.getNextNode(currentNode, null, edges, nodes, state);
                }
                else {
                    const btnText = currentNode?.data?.buttonText || '📞 Raqamni yuborish';
                    await ctx.reply(`Iltimos, "${btnText}" tugmasini bosing yoki telefon raqamingizni to'g'ri formatda yozib yuboring (Masalan: +998901234567).`);
                    return;
                }
            }
        }
        else if (state.waitingFor === 'email') {
            const varName = currentNode?.data?.variable || 'email';
            const trimmedText = text.trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(trimmedText)) {
                state.variables[varName] = trimmedText;
                state.waitingFor = null;
                nextNode = this.getNextNode(currentNode, null, edges, nodes, state);
            }
            else {
                await ctx.reply("Noto'g'ri email manzili kiritildi. Iltimos, elektron pochta manzilingizni to'g'ri formatda yozib yuboring (Masalan: user@domain.com):");
                return;
            }
        }
        else if (state.waitingFor === 'location') {
            const varName = currentNode?.data?.variable || 'location';
            if (text.startsWith('location:')) {
                state.variables[varName] = text.replace('location:', '');
                state.waitingFor = null;
                nextNode = this.getNextNode(currentNode, null, edges, nodes, state);
            }
            else {
                const btnText = currentNode?.data?.buttonText || '📍 Lokatsiyani yuborish';
                await ctx.reply(`Iltimos, "${btnText}" tugmasini bosing.`);
                return;
            }
        }
        else if (state.waitingFor === 'payment') {
            if (text.startsWith('payment_success:')) {
                const parts = text.split(':');
                const payload = parts[1];
                const amount = parts[2];
                state.variables['last_payment_payload'] = payload;
                state.variables['last_payment_amount'] = amount;
                state.waitingFor = null;
                nextNode = this.getNextNode(currentNode, null, edges, nodes, state);
            }
            else {
                await ctx.reply("Iltimos, to'lovni yakunlang. To'lov amalga oshirilgandan so'ng bot avtomatik ravishda davom etadi.");
                return;
            }
        }
        else if (currentNode && currentNode.type === 'message' && text.startsWith('btn_')) {
            nextNode = this.getNextNode(currentNode, text, edges, nodes, state);
        }
        else {
            if (!currentNode) {
                currentNode = nodes.find(n => n.type === 'start');
                nextNode = currentNode;
            }
        }
        const visitedNodeIds = new Set();
        while (nextNode) {
            if (visitedNodeIds.has(nextNode.id)) {
                this.logger.error(`Infinite loop detected in workflow execution at node ${nextNode.id} for contact ${contact.id}. Stopping workflow.`);
                break;
            }
            visitedNodeIds.add(nextNode.id);
            const { wait, stateUpdates } = await this.executeNodeAction(ctx, nextNode, contact.id, state.variables, botId, edges, bot);
            if (stateUpdates) {
                state = { ...state, ...stateUpdates };
            }
            state.currentNodeId = nextNode.id;
            await this.firebaseService.updateContactState(botId, contact.id, JSON.stringify(state));
            if (wait) {
                break;
            }
            nextNode = this.getNextNode(nextNode, null, edges, nodes, state);
        }
    }
    async resumeWorkflow(botId, contactId, nextNodeId, ctx) {
        this.logger.log(`Resuming workflow for contact ${contactId} at node ${nextNodeId}`);
        const workflow = await this.firebaseService.getBotWorkflow(botId);
        if (!workflow)
            return;
        const bot = await this.firebaseService.getBot(botId);
        const nodes = JSON.parse(workflow.nodes);
        const edges = JSON.parse(workflow.edges);
        const contactSnap = await this.firebaseService.db.collection('bots').doc(botId).collection('contacts').doc(contactId).get();
        if (!contactSnap.exists)
            return;
        const contact = contactSnap.data();
        contact.id = contactSnap.id;
        let state = contact.state ? JSON.parse(contact.state) : { variables: {}, waitingFor: null };
        if (!state.variables)
            state.variables = {};
        let nextNode = nodes.find(n => n.id === nextNodeId);
        const visitedNodeIds = new Set();
        while (nextNode) {
            if (visitedNodeIds.has(nextNode.id)) {
                this.logger.error(`Infinite loop detected in resumed workflow execution at node ${nextNode.id} for contact ${contact.id}. Stopping workflow.`);
                break;
            }
            visitedNodeIds.add(nextNode.id);
            const { wait, stateUpdates } = await this.executeNodeAction(ctx, nextNode, contact.id, state.variables, botId, edges, bot);
            if (stateUpdates) {
                state = { ...state, ...stateUpdates };
            }
            state.currentNodeId = nextNode.id;
            await this.firebaseService.updateContactState(botId, contact.id, JSON.stringify(state));
            if (wait) {
                break;
            }
            nextNode = this.getNextNode(nextNode, null, edges, nodes, state);
        }
    }
    getNextNode(currentNode, input, edges, nodes, state) {
        if (!currentNode)
            return null;
        let targetHandle = 'out';
        if (currentNode.type === 'chain') {
            const targetId = currentNode.data?.targetNodeId;
            if (targetId)
                return nodes.find(n => n.id === targetId);
        }
        if (currentNode.type === 'message' && input?.startsWith('btn_')) {
            targetHandle = input;
        }
        else if (currentNode.type === 'question' || currentNode.type === 'phone' || currentNode.type === 'email' || currentNode.type === 'location') {
            targetHandle = 'answered';
        }
        else if (currentNode.type === 'condition') {
            const data = currentNode.data || {};
            const variableName = data.variable || '';
            const varRaw = state.variables[variableName];
            const varStr = varRaw !== undefined && varRaw !== null ? varRaw.toString() : '';
            let isTrue = false;
            const op = data.operator || '==';
            if (op === 'is_empty') {
                isTrue = varStr.trim() === '';
            }
            else if (op === 'is_filled') {
                isTrue = varStr.trim() !== '';
            }
            else if (op === 'regex') {
                try {
                    const checkVal = data.value || '';
                    const regex = new RegExp(checkVal);
                    isTrue = regex.test(varStr);
                }
                catch (regexErr) {
                    this.logger.error(`Invalid regex in condition node ${currentNode.id}: ${data.value}`);
                    isTrue = false;
                }
            }
            else {
                const parsedVar = parseFloat(varStr);
                const varValue = !isNaN(parsedVar) ? parsedVar : varStr;
                const checkStr = data.value?.toString() || '';
                const parsedCheck = parseFloat(checkStr);
                const checkValue = !isNaN(parsedCheck) ? parsedCheck : checkStr;
                if (op === 'contains') {
                    isTrue = varStr.toLowerCase().includes(checkStr.toLowerCase());
                }
                else if (op === '!=') {
                    isTrue = varValue !== checkValue;
                }
                else if (op === '>') {
                    isTrue = varValue > checkValue;
                }
                else if (op === '<') {
                    isTrue = varValue < checkValue;
                }
                else {
                    isTrue = varValue === checkValue;
                }
            }
            targetHandle = isTrue ? 'true' : 'false';
        }
        else if (currentNode.type === 'subscription') {
            const isTrue = !!state.lastSubscriptionCheck;
            targetHandle = isTrue ? 'true' : 'false';
        }
        else if (currentNode.type === 'abTest') {
            targetHandle = state.lastAbResult || (Math.random() < 0.5 ? 'A' : 'B');
        }
        let edge = edges.find(e => e.source === currentNode.id && e.sourceHandle === targetHandle);
        if (!edge && !['condition', 'subscription', 'message', 'abTest'].includes(currentNode.type)) {
            edge = edges.find(e => e.source === currentNode.id);
        }
        if (edge) {
            return nodes.find(n => n.id === edge.target);
        }
        return null;
    }
    async executeNodeAction(ctx, node, contactId, variables, botId, edges, bot) {
        try {
            if (node.type === 'start') {
                const text = node.data?.text;
                if (text) {
                    await ctx.reply(text);
                    await this.firebaseService.addMessage(botId, contactId, text, 'outbound');
                }
                return { wait: false };
            }
            if (node.type === 'message') {
                let text = node.data?.text;
                if (!text)
                    return { wait: false };
                for (const [k, v] of Object.entries(variables)) {
                    text = text.replace(new RegExp(`{${k}}`, 'g'), v);
                }
                const mediaUrl = node.data?.mediaUrl;
                const buttons = node.data?.buttons || [];
                const inlineKeyboard = buttons.map((btn, idx) => {
                    const btnText = typeof btn === 'string' ? btn : (btn.text || 'Tugma');
                    const parts = btnText.split('|');
                    if (parts.length > 1) {
                        const label = parts[0].trim();
                        const urlVal = parts[1].trim();
                        if (urlVal.startsWith('webapp:')) {
                            return [{ text: label, web_app: { url: urlVal.substring(7).trim() } }];
                        }
                        else if (urlVal.startsWith('http://') || urlVal.startsWith('https://')) {
                            return [{ text: label, url: urlVal }];
                        }
                    }
                    return [{ text: btnText, callback_data: `btn_${idx}` }];
                });
                const extra = inlineKeyboard.length > 0 ? {
                    reply_markup: {
                        inline_keyboard: inlineKeyboard
                    }
                } : undefined;
                if (mediaUrl && (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://'))) {
                    const isVideo = mediaUrl.toLowerCase().endsWith('.mp4') ||
                        mediaUrl.toLowerCase().endsWith('.mov') ||
                        mediaUrl.toLowerCase().endsWith('.avi');
                    try {
                        if (isVideo) {
                            await ctx.replyWithVideo(mediaUrl, { caption: text, ...extra });
                        }
                        else {
                            await ctx.replyWithPhoto(mediaUrl, { caption: text, ...extra });
                        }
                    }
                    catch (mediaErr) {
                        this.logger.error(`Failed to send media message for bot ${botId}: ${mediaErr.message}. Falling back to text.`);
                        await ctx.reply(text, extra);
                    }
                }
                else {
                    await ctx.reply(text, extra);
                }
                await this.firebaseService.addMessage(botId, contactId, text, 'outbound');
                if (buttons.length > 0)
                    return { wait: true, stateUpdates: { waitingFor: 'button' } };
                return { wait: false };
            }
            if (node.type === 'chain') {
                return { wait: false };
            }
            if (node.type === 'custom_code') {
                const code = node.data?.code;
                if (code) {
                    try {
                        const vm = await import('node:vm');
                        const sandbox = {
                            ctx: {
                                reply: async (text) => ctx.reply(text),
                                replyWithPhoto: async (url, opts) => ctx.replyWithPhoto(url, opts),
                            },
                            variables: { ...variables },
                            botId,
                            contactId,
                            console: { log: (msg) => this.logger.log(`[custom_code bot:${botId}]: ${msg}`) },
                        };
                        const script = new vm.Script(`
              (async () => {
                ${code}
              })()
            `);
                        const context = vm.createContext(sandbox);
                        await script.runInContext(context, { timeout: 5000 });
                    }
                    catch (err) {
                        this.logger.error(`Custom code execution failed for node ${node.id}: ${err.message}`);
                    }
                }
                return { wait: false };
            }
            if (node.type === 'subscription') {
                const channel = node.data?.channel;
                let isSubscribed = false;
                if (channel) {
                    try {
                        let chatTarget = channel.trim();
                        if (!chatTarget.startsWith('@') && !chatTarget.startsWith('-')) {
                            chatTarget = '@' + chatTarget;
                        }
                        const userId = parseInt(contactId);
                        if (!isNaN(userId)) {
                            const member = await ctx.telegram.getChatMember(chatTarget, userId);
                            const allowedStatuses = ['member', 'creator', 'administrator'];
                            if (allowedStatuses.includes(member.status)) {
                                isSubscribed = true;
                            }
                        }
                    }
                    catch (err) {
                        this.logger.error(`Failed to check chat member in subscription node ${node.id} for user ${contactId}: ${err.message}`);
                        isSubscribed = false;
                    }
                }
                return { wait: false, stateUpdates: { lastSubscriptionCheck: isSubscribed } };
            }
            if (node.type === 'timer') {
                const amount = parseInt(node.data?.delayAmount) || 0;
                const unit = node.data?.delayUnit || 'seconds';
                let ms = amount * 1000;
                if (unit === 'minutes')
                    ms = amount * 60000;
                else if (unit === 'hours')
                    ms = amount * 3600000;
                else if (unit === 'days')
                    ms = amount * 86400000;
                if (ms > 5000) {
                    const executeAt = Date.now() + ms;
                    const nextNode = this.getNextNode(node, null, edges, [], {});
                    const nextNodeId = nextNode?.id || null;
                    await this.firebaseService.db.collection('bots').doc(botId).collection('timers').add({
                        contactId,
                        currentNodeId: node.id,
                        nextNodeId,
                        executeAt,
                        createdAt: Date.now()
                    });
                    this.logger.log(`Scheduled timer for contact ${contactId} to run in ${amount} ${unit} (at ${new Date(executeAt).toISOString()})`);
                    return { wait: true, stateUpdates: { waitingFor: 'timer' } };
                }
                if (ms > 0) {
                    await new Promise(res => setTimeout(res, ms));
                }
                return { wait: false };
            }
            if (node.type === 'question') {
                let text = node.data?.text || 'Savol?';
                for (const [k, v] of Object.entries(variables)) {
                    text = text.replace(new RegExp(`{${k}}`, 'g'), v);
                }
                const mediaUrl = node.data?.mediaUrl;
                const buttons = node.data?.buttons || [];
                const inlineKeyboard = buttons.map((btn, idx) => {
                    const btnText = typeof btn === 'string' ? btn : (btn.text || 'Tugma');
                    return [{ text: btnText, callback_data: `btn_${idx}` }];
                });
                const extra = inlineKeyboard.length > 0 ? {
                    reply_markup: {
                        inline_keyboard: inlineKeyboard
                    }
                } : undefined;
                if (mediaUrl && (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://'))) {
                    const isVideo = mediaUrl.toLowerCase().endsWith('.mp4') ||
                        mediaUrl.toLowerCase().endsWith('.mov') ||
                        mediaUrl.toLowerCase().endsWith('.avi');
                    try {
                        if (isVideo) {
                            await ctx.replyWithVideo(mediaUrl, { caption: text, ...extra });
                        }
                        else {
                            await ctx.replyWithPhoto(mediaUrl, { caption: text, ...extra });
                        }
                    }
                    catch (mediaErr) {
                        this.logger.error(`Failed to send media question for bot ${botId}: ${mediaErr.message}. Falling back to text.`);
                        await ctx.reply(text, extra);
                    }
                }
                else {
                    await ctx.reply(text, extra);
                }
                await this.firebaseService.addMessage(botId, contactId, text, 'outbound');
                return { wait: true, stateUpdates: { waitingFor: 'question' } };
            }
            if (node.type === 'phone') {
                let text = node.data?.text || 'Iltimos, telefon raqamingizni yuboring:';
                const btnText = node.data?.buttonText || '📞 Raqamni yuborish';
                for (const [k, v] of Object.entries(variables)) {
                    text = text.replace(new RegExp(`{${k}}`, 'g'), v);
                }
                await ctx.reply(text, {
                    reply_markup: {
                        keyboard: [[{ text: btnText, request_contact: true }]],
                        one_time_keyboard: true,
                        resize_keyboard: true
                    }
                });
                await this.firebaseService.addMessage(botId, contactId, text, 'outbound');
                return { wait: true, stateUpdates: { waitingFor: 'phone' } };
            }
            if (node.type === 'email') {
                let text = node.data?.text || 'Iltimos, email manzilingizni kiriting:';
                for (const [k, v] of Object.entries(variables)) {
                    text = text.replace(new RegExp(`{${k}}`, 'g'), v);
                }
                await ctx.reply(text);
                await this.firebaseService.addMessage(botId, contactId, text, 'outbound');
                return { wait: true, stateUpdates: { waitingFor: 'email' } };
            }
            if (node.type === 'location') {
                let text = node.data?.text || 'Iltimos, lokatsiyangizni ulashing:';
                const btnText = node.data?.buttonText || '📍 Lokatsiyani yuborish';
                for (const [k, v] of Object.entries(variables)) {
                    text = text.replace(new RegExp(`{${k}}`, 'g'), v);
                }
                await ctx.reply(text, {
                    reply_markup: {
                        keyboard: [[{ text: btnText, request_location: true }]],
                        one_time_keyboard: true,
                        resize_keyboard: true
                    }
                });
                await this.firebaseService.addMessage(botId, contactId, text, 'outbound');
                return { wait: true, stateUpdates: { waitingFor: 'location' } };
            }
            if (node.type === 'condition') {
                return { wait: false };
            }
            if (node.type === 'abTest') {
                const data = node.data || {};
                const ratioA = data.ratioA !== undefined && !isNaN(parseInt(data.ratioA)) ? parseInt(data.ratioA) : 50;
                const rolledValue = Math.random() * 100;
                const assigned = rolledValue < ratioA ? 'A' : 'B';
                const varName = data.variable;
                const stateUpdates = { lastAbResult: assigned };
                if (varName) {
                    stateUpdates.variables = { ...variables, [varName]: assigned };
                }
                return { wait: false, stateUpdates };
            }
            if (node.type === 'variable') {
                const name = node.data?.variableName;
                const val = node.data?.variableValue;
                if (name) {
                    let finalVal = val !== undefined && val !== null ? val.toString() : '';
                    for (const [k, v] of Object.entries(variables)) {
                        finalVal = finalVal.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
                    }
                    const isMathExpr = /^[0-9\s\+\-\*\/\(\)\.]+$/.test(finalVal.trim());
                    if (isMathExpr && finalVal.trim() !== '') {
                        try {
                            const result = Function(`"use strict"; return (${finalVal})`)();
                            if (typeof result === 'number' && !isNaN(result)) {
                                finalVal = result.toString();
                            }
                        }
                        catch (mathErr) {
                            this.logger.warn(`Failed to evaluate math expression in variable block: ${finalVal}. Using raw string.`);
                        }
                    }
                    return { wait: false, stateUpdates: { variables: { ...variables, [name]: finalVal } } };
                }
                return { wait: false };
            }
            if (node.type === 'deleteVariable') {
                const nameInput = node.data?.variableName;
                if (nameInput) {
                    const newVars = { ...variables };
                    const names = nameInput.split(',').map((n) => n.trim()).filter((n) => n !== '');
                    for (const name of names) {
                        delete newVars[name];
                    }
                    return { wait: false, stateUpdates: { variables: newVars } };
                }
                return { wait: false };
            }
            if (node.type === 'javascript') {
                const code = node.data?.code;
                const target = node.data?.variable;
                if (code && target) {
                    try {
                        const result = await this.mazaikaEngineService.runUserScript(botId, code, variables);
                        if (result && !result.error) {
                            return { wait: false, stateUpdates: { variables: { ...variables, [target]: result } } };
                        }
                        else if (result && result.error) {
                            this.logger.error(`JS Engine error in node ${node.id} for bot ${botId}: ${result.error}`);
                        }
                    }
                    catch (err) {
                        this.logger.error(`JS Node error in node ${node.id} for bot ${botId}: ${err.message}`);
                    }
                }
                return { wait: false };
            }
            if (node.type === 'http') {
                const url = node.data?.url;
                const method = node.data?.method || 'GET';
                const targetVar = node.data?.variable;
                const jsonPath = node.data?.jsonPath;
                if (url) {
                    try {
                        let finalUrl = url.trim();
                        for (const [k, v] of Object.entries(variables)) {
                            finalUrl = finalUrl.replace(new RegExp(`{${k}}`, 'g'), encodeURIComponent(v !== undefined && v !== null ? v.toString() : ''));
                        }
                        let body = undefined;
                        if (method === 'POST') {
                            let rawBody = node.data?.body || '';
                            if (rawBody) {
                                for (const [k, v] of Object.entries(variables)) {
                                    rawBody = rawBody.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
                                }
                                body = rawBody;
                            }
                        }
                        const res = await fetch(finalUrl, {
                            method,
                            headers: body ? { 'Content-Type': 'application/json' } : undefined,
                            body
                        });
                        const rawData = await res.text();
                        let savedVal = rawData;
                        if (jsonPath && (rawData.trim().startsWith('{') || rawData.trim().startsWith('['))) {
                            try {
                                const parsed = JSON.parse(rawData);
                                const parts = jsonPath.split('.');
                                let current = parsed;
                                for (const part of parts) {
                                    current = current?.[part];
                                }
                                if (current !== undefined && current !== null) {
                                    savedVal = typeof current === 'object' ? JSON.stringify(current) : current.toString();
                                }
                            }
                            catch (jsonErr) {
                                this.logger.error(`JSON path resolution failed for node ${node.id}: ${jsonErr.message}`);
                            }
                        }
                        if (targetVar) {
                            return { wait: false, stateUpdates: { variables: { ...variables, [targetVar]: savedVal.substring(0, 500) } } };
                        }
                    }
                    catch (err) {
                        this.logger.error(`HTTP Outbound API call failed for node ${node.id}: ${err.message}`);
                    }
                }
                return { wait: false };
            }
            if (node.type === 'webhook') {
                const url = node.data?.url;
                const method = node.data?.method || 'POST';
                const targetVar = node.data?.variable;
                if (url) {
                    try {
                        let finalUrl = url.trim();
                        for (const [k, v] of Object.entries(variables)) {
                            finalUrl = finalUrl.replace(new RegExp(`{${k}}`, 'g'), encodeURIComponent(v !== undefined && v !== null ? v.toString() : ''));
                        }
                        const body = method === 'POST' ? JSON.stringify({ variables, contactId }) : undefined;
                        const res = await fetch(finalUrl, {
                            method,
                            headers: body ? { 'Content-Type': 'application/json' } : undefined,
                            body
                        });
                        const data = await res.text();
                        if (targetVar) {
                            return { wait: false, stateUpdates: { variables: { ...variables, [targetVar]: data.substring(0, 500) } } };
                        }
                    }
                    catch (err) {
                        this.logger.error(`Webhook send failed for node ${node.id}: ${err.message}`);
                    }
                }
                return { wait: false };
            }
            if (node.type === 'googleSheetsAdd') {
                const url = node.data?.url;
                const method = node.data?.method || 'POST';
                if (url) {
                    try {
                        let finalUrl = url.trim();
                        for (const [k, v] of Object.entries(variables)) {
                            finalUrl = finalUrl.replace(new RegExp(`{${k}}`, 'g'), encodeURIComponent(v !== undefined && v !== null ? v.toString() : ''));
                        }
                        const body = method === 'POST' ? JSON.stringify({ variables, contactId }) : undefined;
                        await fetch(finalUrl, {
                            method,
                            headers: body ? { 'Content-Type': 'application/json' } : undefined,
                            body
                        });
                    }
                    catch (err) {
                        this.logger.error(`Google Sheets Add failed for node ${node.id}: ${err.message}`);
                    }
                }
                return { wait: false };
            }
            if (node.type === 'googleSheetsRead') {
                const url = node.data?.url;
                const method = 'GET';
                const targetVar = node.data?.variable;
                const jsonPath = node.data?.jsonPath;
                if (url) {
                    try {
                        let finalUrl = url.trim();
                        for (const [k, v] of Object.entries(variables)) {
                            finalUrl = finalUrl.replace(new RegExp(`{${k}}`, 'g'), encodeURIComponent(v !== undefined && v !== null ? v.toString() : ''));
                        }
                        const res = await fetch(finalUrl, { method });
                        const rawData = await res.text();
                        let savedVal = rawData;
                        if (jsonPath && (rawData.trim().startsWith('{') || rawData.trim().startsWith('['))) {
                            try {
                                const parsed = JSON.parse(rawData);
                                const parts = jsonPath.split('.');
                                let current = parsed;
                                for (const part of parts) {
                                    current = current?.[part];
                                }
                                if (current !== undefined && current !== null) {
                                    savedVal = typeof current === 'object' ? JSON.stringify(current) : current.toString();
                                }
                            }
                            catch (jsonErr) {
                                this.logger.error(`JSON path resolution failed for Sheets Read node ${node.id}: ${jsonErr.message}`);
                            }
                        }
                        if (targetVar) {
                            return { wait: false, stateUpdates: { variables: { ...variables, [targetVar]: savedVal.substring(0, 500) } } };
                        }
                    }
                    catch (err) {
                        this.logger.error(`Google Sheets Read failed for node ${node.id}: ${err.message}`);
                    }
                }
                return { wait: false };
            }
            if (node.type === 'getCourse') {
                const domain = node.data?.domain;
                const apiKey = node.data?.apiKey;
                const action = node.data?.action || 'deal';
                const nameVar = node.data?.nameVar || 'ism';
                const phoneVar = node.data?.phoneVar || 'telefon';
                const emailVar = node.data?.emailVar || 'email';
                const nameVal = variables[nameVar];
                const phoneVal = variables[phoneVar];
                const emailVal = variables[emailVar];
                if (domain && apiKey) {
                    try {
                        const endpoint = action === 'deal' ? 'deals' : 'users';
                        const userPayload = {
                            email: emailVal || `${contactId}@mazaika-bot.ru`,
                            phone: phoneVal || '',
                            first_name: nameVal || 'Mijoz'
                        };
                        const payload = { user: userPayload };
                        if (action === 'deal') {
                            let offerCode = node.data?.offerCode || '';
                            for (const [k, v] of Object.entries(variables)) {
                                offerCode = offerCode.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
                            }
                            payload.deal = {
                                offer_code: offerCode,
                                status: 'new'
                            };
                        }
                        const formBody = new URLSearchParams();
                        formBody.append('action', 'add');
                        formBody.append('key', apiKey);
                        formBody.append('params', Buffer.from(JSON.stringify(payload)).toString('base64'));
                        const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
                        const res = await fetch(`https://${cleanDomain}/pl/api/${endpoint}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: formBody.toString()
                        });
                        const data = await res.text();
                        this.logger.log(`GetCourse integration result: ${data}`);
                    }
                    catch (err) {
                        this.logger.error(`GetCourse integration failed for node ${node.id}: ${err.message}`);
                    }
                }
                return { wait: false };
            }
            if (node.type === 'yclients') {
                const companyId = node.data?.companyId;
                const apiKey = node.data?.apiKey;
                const userToken = node.data?.userToken;
                const nameVar = node.data?.nameVar || 'ism';
                const phoneVar = node.data?.phoneVar || 'telefon';
                const emailVar = node.data?.emailVar || 'email';
                const nameVal = variables[nameVar];
                const phoneVal = variables[phoneVar];
                const emailVal = variables[emailVar];
                if (companyId && apiKey) {
                    try {
                        const authHeader = userToken
                            ? `Bearer ${apiKey}, User ${userToken}`
                            : `Bearer ${apiKey}`;
                        const res = await fetch(`https://api.yclients.com/api/v1/clients/${companyId}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': authHeader,
                                'Accept': 'application/vnd.yclients.v2+json'
                            },
                            body: JSON.stringify({
                                name: nameVal || 'Mijoz',
                                phone: phoneVal || '',
                                email: emailVal || ''
                            })
                        });
                        const data = await res.text();
                        this.logger.log(`YClients integration result: ${data}`);
                    }
                    catch (err) {
                        this.logger.error(`YClients integration failed for node ${node.id}: ${err.message}`);
                    }
                }
                return { wait: false };
            }
            if (['payme', 'click', 'yookassa', 'cryptopay', 'uzumbank'].includes(node.type)) {
                let title = node.data?.title || 'To\'lov';
                for (const [k, v] of Object.entries(variables)) {
                    title = title.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
                }
                let rawPrice = node.data?.price || '';
                for (const [k, v] of Object.entries(variables)) {
                    rawPrice = rawPrice.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
                }
                const price = parseInt(rawPrice) || 0;
                const providerToken = node.data?.providerToken;
                const currency = node.type === 'yookassa' ? 'RUB' : (node.type === 'cryptopay' ? 'USD' : 'UZS');
                if (providerToken && price > 0) {
                    try {
                        await ctx.replyWithInvoice({
                            title,
                            description: `${title} uchun to'lov`,
                            payload: `pay_${contactId}_${Date.now()}`,
                            provider_token: providerToken,
                            currency,
                            prices: [{ label: title, amount: price * 100 }]
                        });
                        await this.firebaseService.addMessage(botId, contactId, `[Invoice sent: ${title} - ${price} ${currency}]`, 'outbound');
                        return { wait: true, stateUpdates: { waitingFor: 'payment' } };
                    }
                    catch (err) {
                        this.logger.error(`Failed to send ${node.type} invoice: ${err.message}`);
                        await ctx.reply(`To'lov xizmatini ishga tushirib bo'lmadi. Iltimos keyinroq urinib ko'ring.`);
                    }
                }
                else {
                    await ctx.reply(`[Hisob-faktura] To'lov sozlangan emas yoki narxi xato kiritilgan.`);
                }
                return { wait: false };
            }
            if (node.type === 'stars') {
                let title = node.data?.title || 'Telegram Stars To\'lovi ⭐';
                for (const [k, v] of Object.entries(variables)) {
                    title = title.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
                }
                let rawPrice = node.data?.price || node.data?.stars || '10';
                for (const [k, v] of Object.entries(variables)) {
                    rawPrice = rawPrice.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
                }
                const starsAmount = Math.max(1, parseInt(rawPrice) || 10);
                let description = node.data?.description || `${title} (${starsAmount} Stars ⭐)`;
                try {
                    await ctx.replyWithInvoice({
                        title,
                        description,
                        payload: `stars_${contactId}_${Date.now()}`,
                        provider_token: '',
                        currency: 'XTR',
                        prices: [{ label: title, amount: starsAmount }]
                    });
                    await this.firebaseService.addMessage(botId, contactId, `[Stars Invoice sent: ${title} - ${starsAmount} XTR]`, 'outbound');
                    return { wait: true, stateUpdates: { waitingFor: 'payment' } };
                }
                catch (err) {
                    this.logger.error(`Failed to send Telegram Stars invoice: ${err.message}`);
                    await ctx.reply(`Telegram Stars to'lovini ochib bo'lmadi. Iltimos keyinroq urinib ko'ring.`);
                }
                return { wait: false };
            }
            if (node.type === 'dealStage') {
                const stage = node.data?.stage || 'New';
                await this.firebaseService.db.collection('bots').doc(botId).collection('contacts').doc(contactId).update({
                    stage,
                    updatedAt: new Date()
                }).catch((err) => {
                    this.logger.error(`Failed to update contact root stage: ${err.message}`);
                });
                return { wait: false, stateUpdates: { variables: { ...variables, deal_stage: stage } } };
            }
            if (node.type === 'assignee') {
                const agent = node.data?.agent || 'None';
                await this.firebaseService.db.collection('bots').doc(botId).collection('contacts').doc(contactId).update({
                    assignee: agent,
                    updatedAt: new Date()
                }).catch((err) => {
                    this.logger.error(`Failed to update contact root assignee: ${err.message}`);
                });
                return { wait: false, stateUpdates: { variables: { ...variables, deal_agent: agent } } };
            }
            if (node.type === 'cart') {
                const action = node.data?.cartAction || 'add';
                const itemName = node.data?.itemName || 'Maxsulot';
                let cart = [];
                try {
                    if (variables.cart) {
                        cart = JSON.parse(variables.cart);
                        if (!Array.isArray(cart))
                            cart = [];
                    }
                }
                catch (e) {
                    cart = [];
                }
                if (action === 'add') {
                    let rawPrice = node.data?.itemPrice || '0';
                    for (const [k, v] of Object.entries(variables)) {
                        rawPrice = rawPrice.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
                    }
                    const price = parseInt(rawPrice) || 0;
                    let rawQty = node.data?.itemQty || '1';
                    for (const [k, v] of Object.entries(variables)) {
                        rawQty = rawQty.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
                    }
                    const qty = parseInt(rawQty) || 1;
                    const existing = cart.find(i => i.name === itemName);
                    if (existing) {
                        existing.qty += qty;
                    }
                    else {
                        cart.push({ name: itemName, price, qty });
                    }
                }
                else if (action === 'remove') {
                    cart = cart.filter(i => i.name !== itemName);
                }
                else if (action === 'clear') {
                    cart = [];
                }
                let cartTotal = 0;
                let cartItemsCount = 0;
                let cartText = '';
                if (cart.length === 0) {
                    cartText = "Savatingiz bo'sh.";
                }
                else {
                    cart.forEach((i, idx) => {
                        const sum = i.price * i.qty;
                        cartTotal += sum;
                        cartItemsCount += i.qty;
                        cartText += `${idx + 1}. ${i.name} (${i.price.toLocaleString()} UZS) x ${i.qty} = ${sum.toLocaleString()} UZS\n`;
                    });
                    cartText += `\nJami: ${cartTotal.toLocaleString()} UZS`;
                }
                return {
                    wait: false,
                    stateUpdates: {
                        variables: {
                            ...variables,
                            cart: JSON.stringify(cart),
                            cart_total: cartTotal.toString(),
                            cart_items_count: cartItemsCount.toString(),
                            cart_text: cartText
                        }
                    }
                };
            }
            if (node.type === 'orderList') {
                const cartStr = variables.cart || '[]';
                let cart = [];
                try {
                    cart = JSON.parse(cartStr);
                    if (!Array.isArray(cart))
                        cart = [];
                }
                catch (e) {
                    cart = [];
                }
                if (cart.length === 0) {
                    let emptyMsg = node.data?.emptyMessage || "Sizning savatingiz hozircha bo'sh.";
                    for (const [k, v] of Object.entries(variables)) {
                        emptyMsg = emptyMsg.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
                    }
                    await ctx.reply(emptyMsg);
                }
                else {
                    let header = node.data?.headerText || "Sizning buyurtmalaringiz:";
                    for (const [k, v] of Object.entries(variables)) {
                        header = header.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
                    }
                    let listText = header + "\n";
                    let total = 0;
                    cart.forEach((c, idx) => {
                        if (typeof c === 'string') {
                            listText += `${idx + 1}. ${c}\n`;
                        }
                        else {
                            const sum = (c.price || 0) * (c.qty || 1);
                            total += sum;
                            listText += `${idx + 1}. ${c.name} (${c.price ? c.price.toLocaleString() : 0} UZS) x ${c.qty || 1} = ${sum.toLocaleString()} UZS\n`;
                        }
                    });
                    if (total > 0) {
                        listText += `\nJami: ${total.toLocaleString()} UZS`;
                    }
                    await ctx.reply(listText);
                }
                return { wait: false };
            }
            if (node.type === 'addTag') {
                const tag = node.data?.tagName;
                if (tag) {
                    try {
                        const contactRef = this.firebaseService.db.collection('bots').doc(botId).collection('contacts').doc(contactId);
                        const contactSnap = await contactRef.get();
                        if (contactSnap.exists) {
                            const contactData = contactSnap.data();
                            let currentTags = Array.isArray(contactData.tags) ? contactData.tags : [];
                            if (!currentTags.includes(tag)) {
                                currentTags.push(tag);
                                await contactRef.update({ tags: currentTags, updatedAt: new Date() });
                            }
                        }
                    }
                    catch (err) {
                        this.logger.error(`Failed to update root contact tag in addTag: ${err.message}`);
                    }
                    const tags = variables.tags ? JSON.parse(variables.tags) : [];
                    if (!tags.includes(tag))
                        tags.push(tag);
                    return { wait: false, stateUpdates: { variables: { ...variables, tags: JSON.stringify(tags) } } };
                }
                return { wait: false };
            }
            if (node.type === 'removeTag') {
                const tag = node.data?.tagName;
                if (tag) {
                    try {
                        const contactRef = this.firebaseService.db.collection('bots').doc(botId).collection('contacts').doc(contactId);
                        const contactSnap = await contactRef.get();
                        if (contactSnap.exists) {
                            const contactData = contactSnap.data();
                            let currentTags = Array.isArray(contactData.tags) ? contactData.tags : [];
                            if (currentTags.includes(tag)) {
                                currentTags = currentTags.filter((t) => t !== tag);
                                await contactRef.update({ tags: currentTags, updatedAt: new Date() });
                            }
                        }
                    }
                    catch (err) {
                        this.logger.error(`Failed to remove root contact tag in removeTag: ${err.message}`);
                    }
                    let tags = variables.tags ? JSON.parse(variables.tags) : [];
                    tags = tags.filter((t) => t !== tag);
                    return { wait: false, stateUpdates: { variables: { ...variables, tags: JSON.stringify(tags) } } };
                }
                return { wait: false };
            }
            if (node.type === 'topUpBalance') {
                let rawAmount = node.data?.amount || '0';
                for (const [k, v] of Object.entries(variables)) {
                    rawAmount = rawAmount.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
                }
                const amount = parseInt(rawAmount) || 0;
                const currentBalance = parseInt(variables.balance || '0') || 0;
                const newBalance = currentBalance + amount;
                const contactRef = this.firebaseService.db.collection('bots').doc(botId).collection('contacts').doc(contactId);
                await contactRef.update({ balance: newBalance, updatedAt: new Date() }).catch((err) => {
                    this.logger.error(`Failed to update contact root balance in topUp: ${err.message}`);
                });
                return { wait: false, stateUpdates: { variables: { ...variables, balance: newBalance.toString() } } };
            }
            if (node.type === 'debitBalance') {
                let rawAmount = node.data?.amount || '0';
                for (const [k, v] of Object.entries(variables)) {
                    rawAmount = rawAmount.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
                }
                const amount = parseInt(rawAmount) || 0;
                const currentBalance = parseInt(variables.balance || '0') || 0;
                const newBalance = Math.max(0, currentBalance - amount);
                const contactRef = this.firebaseService.db.collection('bots').doc(botId).collection('contacts').doc(contactId);
                await contactRef.update({ balance: newBalance, updatedAt: new Date() }).catch((err) => {
                    this.logger.error(`Failed to update contact root balance in debit: ${err.message}`);
                });
                return { wait: false, stateUpdates: { variables: { ...variables, balance: newBalance.toString() } } };
            }
            if (node.type === 'deleteUser') {
                const deleteType = node.data?.deleteType || 'memory';
                const contactRef = this.firebaseService.db.collection('bots').doc(botId).collection('contacts').doc(contactId);
                if (deleteType === 'database') {
                    try {
                        const msgSnap = await contactRef.collection('messages').get();
                        const batch = this.firebaseService.db.batch();
                        msgSnap.docs.forEach(doc => batch.delete(doc.ref));
                        await batch.commit();
                        await contactRef.delete();
                        this.logger.log(`Contact ${contactId} completely deleted from Firestore CRM.`);
                    }
                    catch (err) {
                        this.logger.error(`Failed to delete contact from database in deleteUser: ${err.message}`);
                    }
                    return { wait: true, stateUpdates: { currentNodeId: null, waitingFor: null, variables: {} } };
                }
                else {
                    try {
                        await contactRef.update({
                            stage: 'Yangi',
                            assignee: 'None',
                            balance: 0,
                            tags: [],
                            updatedAt: new Date()
                        });
                    }
                    catch (err) {
                        this.logger.error(`Failed to clear contact CRM metadata in deleteUser: ${err.message}`);
                    }
                    return { wait: false, stateUpdates: { variables: {}, waitingFor: null } };
                }
            }
            if (node.type === 'voterRegister') {
                let candidate = node.data?.candidate || 'Option';
                for (const [k, v] of Object.entries(variables)) {
                    candidate = candidate.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
                }
                if (variables.voted_for) {
                    await ctx.reply("Kechirasiz, siz allaqachon ovoz bergansiz.");
                    return { wait: false };
                }
                try {
                    const voteDocRef = this.firebaseService.db
                        .collection('bots')
                        .doc(botId)
                        .collection('votes')
                        .doc(candidate);
                    await this.firebaseService.db.runTransaction(async (transaction) => {
                        const sfDoc = await transaction.get(voteDocRef);
                        if (!sfDoc.exists) {
                            transaction.set(voteDocRef, { count: 1, voters: [contactId] });
                        }
                        else {
                            const data = sfDoc.data();
                            const newCount = (data?.count || 0) + 1;
                            const voters = data?.voters || [];
                            if (!voters.includes(contactId)) {
                                voters.push(contactId);
                                transaction.update(voteDocRef, { count: newCount, voters });
                            }
                        }
                    });
                    await ctx.reply(`Rahmat! Siz muvaffaqiyatli "${candidate}" uchun ovoz berdingiz.`);
                }
                catch (err) {
                    this.logger.error(`Voting database update failed: ${err.message}`);
                    await ctx.reply("Ovoz berish jarayonida xatolik yuz berdi. Iltimos keyinroq urinib ko'ring.");
                    return { wait: false };
                }
                return { wait: false, stateUpdates: { variables: { ...variables, voted_for: candidate } } };
            }
            if (node.type === 'voteLeaders') {
                try {
                    const votesSnap = await this.firebaseService.db
                        .collection('bots')
                        .doc(botId)
                        .collection('votes')
                        .orderBy('count', 'desc')
                        .get();
                    if (votesSnap.empty) {
                        await ctx.reply("🏆 Hozircha ovozlar yo'q.");
                    }
                    else {
                        let text = "🏆 Reyting yetakchilari (Real vaqtda):\n\n";
                        votesSnap.docs.forEach((doc, idx) => {
                            const data = doc.data();
                            text += `${idx + 1}. ${doc.id} - ${data.count || 0} ta ovoz\n`;
                        });
                        await ctx.reply(text);
                    }
                }
                catch (err) {
                    this.logger.error(`Failed to load vote leaders: ${err.message}`);
                    await ctx.reply("Reytingni yuklab bo'lmadi. Iltimos keyinroq urinib ko'ring.");
                }
                return { wait: false };
            }
            if (node.type === 'refCreate') {
                let botUsername = bot?.username;
                if (!botUsername) {
                    try {
                        const me = await ctx.telegram.getMe();
                        botUsername = me.username;
                    }
                    catch (e) {
                        botUsername = 'bot';
                    }
                }
                const refLink = `https://t.me/${botUsername}?start=ref_${contactId}`;
                let text = node.data?.text || "🔗 Sizning shaxsiy taklif havolangiz:\n{ref_link}\n\nUshbu havolani do'stlaringizga yuboring va har bir yangi a'zo uchun ball / chegirmalarga ega bo'ling!";
                text = text.replace(/{ref_link}/g, refLink);
                for (const [k, v] of Object.entries(variables)) {
                    text = text.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
                }
                const shareText = node.data?.shareText || "Ushbu foydali botga qo'shiling!";
                const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(shareText)}`;
                await ctx.reply(text, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "📤 Do'stlarga ulashish", url: shareUrl }]
                        ]
                    }
                });
                await this.firebaseService.addMessage(botId, contactId, text, 'outbound');
                return { wait: false, stateUpdates: { variables: { ...variables, ref_link: refLink } } };
            }
            if (node.type === 'refCheck') {
                let refCount = 0;
                try {
                    const contactDoc = await this.firebaseService.db.collection('bots').doc(botId).collection('contacts').doc(contactId).get();
                    if (contactDoc.exists) {
                        refCount = contactDoc.data()?.referralCount || 0;
                    }
                }
                catch (e) {
                    this.logger.error(`Error checking referrals: ${e.message}`);
                }
                const varName = node.data?.variable || 'ref_count';
                let notify = node.data?.notifyUser !== false;
                if (notify) {
                    let text = node.data?.text || `📊 Sizning statistikangiz:\nSiz hozirgacha {ref_count} ta do'stingizni taklif qildingiz!`;
                    text = text.replace(/{ref_count}/g, refCount.toString());
                    for (const [k, v] of Object.entries(variables)) {
                        text = text.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
                    }
                    await ctx.reply(text);
                    await this.firebaseService.addMessage(botId, contactId, text, 'outbound');
                }
                return { wait: false, stateUpdates: { variables: { ...variables, [varName]: refCount.toString(), ref_count: refCount.toString() } } };
            }
            if (node.type === 'refLeaders') {
                try {
                    const topSnap = await this.firebaseService.db.collection('bots').doc(botId).collection('contacts')
                        .where('referralCount', '>', 0)
                        .orderBy('referralCount', 'desc')
                        .limit(10)
                        .get();
                    let text = "🏆 Eng ko'p do'stlarini taklif qilgan liderlar (Top-10):\n\n";
                    if (topSnap.empty) {
                        text += "Hozircha yetakchilar mavjud emas. Birinchi bo'lib do'stlaringizni taklif qiling!";
                    }
                    else {
                        topSnap.docs.forEach((d, i) => {
                            const data = d.data();
                            const name = data.firstName || (data.username ? `@${data.username}` : `Foydalanuvchi #${i + 1}`);
                            text += `${i + 1}. ${name} — ${data.referralCount} ta taklif\n`;
                        });
                    }
                    await ctx.reply(text);
                    await this.firebaseService.addMessage(botId, contactId, text, 'outbound');
                }
                catch (err) {
                    this.logger.error(`Failed to get referral leaders: ${err.message}`);
                    await ctx.reply("Reytingni yuklashda xatolik yuz berdi.");
                }
                return { wait: false };
            }
            if (node.type === 'photo') {
                const url = node.data?.mediaUrl || node.data?.url || node.data?.fileId;
                let caption = node.data?.caption || node.data?.text || '';
                for (const [k, v] of Object.entries(variables)) {
                    caption = caption.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
                }
                const buttons = node.data?.buttons || [];
                const inlineKeyboard = buttons.map((btn, idx) => {
                    const btnText = typeof btn === 'string' ? btn : (btn.text || 'Tugma');
                    const parts = btnText.split('|');
                    if (parts.length > 1) {
                        const label = parts[0].trim();
                        const urlVal = parts[1].trim();
                        if (urlVal.startsWith('webapp:')) {
                            return [{ text: label, web_app: { url: urlVal.substring(7).trim() } }];
                        }
                        else if (urlVal.startsWith('http://') || urlVal.startsWith('https://')) {
                            return [{ text: label, url: urlVal }];
                        }
                    }
                    return [{ text: btnText, callback_data: `btn_${idx}` }];
                });
                const extra = {};
                if (caption)
                    extra.caption = caption;
                if (inlineKeyboard.length > 0) {
                    extra.reply_markup = { inline_keyboard: inlineKeyboard };
                }
                if (url) {
                    try {
                        await ctx.replyWithPhoto(url, extra);
                    }
                    catch (e) {
                        this.logger.error(`Photo sending failed: ${e.message}`);
                        if (caption)
                            await ctx.reply(caption, extra);
                    }
                }
                else if (caption) {
                    await ctx.reply(caption, extra);
                }
                if (buttons.length > 0)
                    return { wait: true, stateUpdates: { waitingFor: 'button' } };
                return { wait: false };
            }
            if (node.type === 'video') {
                const url = node.data?.mediaUrl || node.data?.url || node.data?.fileId;
                let caption = node.data?.caption || node.data?.text || '';
                for (const [k, v] of Object.entries(variables)) {
                    caption = caption.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
                }
                if (url) {
                    try {
                        await ctx.replyWithVideo(url, { caption: caption || undefined });
                    }
                    catch (e) {
                        this.logger.error(`Video sending failed: ${e.message}`);
                        if (caption)
                            await ctx.reply(caption);
                    }
                }
                return { wait: false };
            }
            if (node.type === 'document') {
                const url = node.data?.mediaUrl || node.data?.url || node.data?.fileId;
                let caption = node.data?.caption || node.data?.text || '';
                for (const [k, v] of Object.entries(variables)) {
                    caption = caption.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
                }
                if (url) {
                    try {
                        await ctx.replyWithDocument(url, { caption: caption || undefined });
                    }
                    catch (e) {
                        this.logger.error(`Document sending failed: ${e.message}`);
                        if (caption)
                            await ctx.reply(caption);
                    }
                }
                return { wait: false };
            }
            if (node.type === 'audio') {
                const url = node.data?.mediaUrl || node.data?.url || node.data?.fileId;
                let caption = node.data?.caption || node.data?.text || '';
                for (const [k, v] of Object.entries(variables)) {
                    caption = caption.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
                }
                if (url) {
                    try {
                        await ctx.replyWithAudio(url, { caption: caption || undefined });
                    }
                    catch (e) {
                        this.logger.error(`Audio sending failed: ${e.message}`);
                        if (caption)
                            await ctx.reply(caption);
                    }
                }
                return { wait: false };
            }
            if (node.type === 'sticker') {
                const stickerId = node.data?.stickerId || node.data?.fileId || node.data?.url;
                if (stickerId) {
                    try {
                        await ctx.replyWithSticker(stickerId);
                    }
                    catch (e) {
                        this.logger.error(`Sticker sending failed: ${e.message}`);
                    }
                }
                return { wait: false };
            }
            if (node.type === 'poll' || node.type === 'quiz') {
                let question = node.data?.question || node.data?.text || 'Savol:';
                for (const [k, v] of Object.entries(variables)) {
                    question = question.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
                }
                const options = Array.isArray(node.data?.options) && node.data.options.length >= 2
                    ? node.data.options
                    : ['Variant A', 'Variant B'];
                const isQuiz = node.type === 'quiz' || node.data?.isQuiz;
                const correctId = parseInt(node.data?.correctOptionId) || 0;
                try {
                    await ctx.replyWithPoll(question, options, {
                        is_anonymous: false,
                        type: isQuiz ? 'quiz' : 'regular',
                        correct_option_id: isQuiz ? Math.min(correctId, options.length - 1) : undefined
                    });
                }
                catch (e) {
                    this.logger.error(`Poll/quiz failed: ${e.message}`);
                }
                return { wait: false };
            }
            if (node.type === 'notifyOperator') {
                const targetChatId = node.data?.chatId || node.data?.operatorId || bot?.ownerTelegramId;
                let message = node.data?.message || node.data?.text || `🔔 Yangi murojaat!\nMijoz: ${contactId}\nTelefon: {user_phone}`;
                for (const [k, v] of Object.entries(variables)) {
                    message = message.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
                }
                if (targetChatId) {
                    try {
                        await ctx.telegram.sendMessage(targetChatId, message);
                    }
                    catch (e) {
                        this.logger.error(`Failed to notify operator: ${e.message}`);
                    }
                }
                return { wait: false };
            }
            if (node.type === 'notifyGroup' || node.type === 'notifyChannel') {
                const targetChatId = node.data?.chatId || node.data?.channelId;
                let message = node.data?.message || node.data?.text || '';
                for (const [k, v] of Object.entries(variables)) {
                    message = message.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
                }
                if (targetChatId && message) {
                    try {
                        await ctx.telegram.sendMessage(targetChatId, message);
                    }
                    catch (e) {
                        this.logger.error(`Failed to send notification to ${targetChatId}: ${e.message}`);
                    }
                }
                return { wait: false };
            }
            if (node.type === 'email_notify') {
                let text = node.data?.text || 'Email bildirishnomasi';
                for (const [k, v] of Object.entries(variables)) {
                    text = text.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
                }
                this.logger.log(`[Email Notification for bot ${botId}]: ${text}`);
                return { wait: false };
            }
            if (node.type === 'schedule' || node.type === 'reminder' || node.type === 'sequence') {
                const amount = parseInt(node.data?.delayAmount) || parseInt(node.data?.hours) || 1;
                const unit = node.data?.delayUnit || 'hours';
                let ms = amount * 3600000;
                if (unit === 'minutes')
                    ms = amount * 60000;
                else if (unit === 'seconds')
                    ms = amount * 1000;
                else if (unit === 'days')
                    ms = amount * 86400000;
                const executeAt = Date.now() + ms;
                const nextNode = this.getNextNode(node, null, edges, [], {});
                const nextNodeId = nextNode?.id || null;
                await this.firebaseService.db.collection('bots').doc(botId).collection('timers').add({
                    contactId,
                    currentNodeId: node.id,
                    nextNodeId,
                    executeAt,
                    createdAt: Date.now()
                });
                return { wait: true, stateUpdates: { waitingFor: 'timer' } };
            }
            if (node.type === 'aiReply' || node.type === 'aiAnalyze' || node.type === 'aiTranslate') {
                const userPrompt = node.data?.text || variables.last_user_message || ctx.message?.text || 'Assalomu alaykum';
                let systemPrompt = node.data?.prompt || "Siz Telegram bot yordamchisisiz. Foydalanuvchining savoliga qisqa, aniq va xushmuomala javob bering.";
                if (node.type === 'aiTranslate') {
                    const targetLang = node.data?.targetLang || 'uzbek';
                    systemPrompt = `Translate the user's message accurately into ${targetLang}. Return only the translation.`;
                }
                else if (node.type === 'aiAnalyze') {
                    systemPrompt = `Analyze the sentiment, intent, and key details of the user's input. Return a concise structured analysis.`;
                }
                let replyText = '';
                if (process.env.GEMINI_API_KEY) {
                    try {
                        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
                        const res = await fetch(endpoint, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                system_instruction: { parts: [{ text: systemPrompt }] },
                                contents: [{ parts: [{ text: userPrompt }] }]
                            })
                        });
                        const data = await res.json();
                        replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    }
                    catch (e) {
                        this.logger.error(`AI API call failed: ${e.message}`);
                    }
                }
                if (!replyText) {
                    replyText = `Mazaika AI: Xabaringiz qabul qilindi. Sizga qanday yordam bera olaman?`;
                }
                await ctx.reply(replyText);
                await this.firebaseService.addMessage(botId, contactId, replyText, 'outbound');
                return { wait: false, stateUpdates: { variables: { ...variables, ai_response: replyText } } };
            }
            if (node.type === 'aiImage') {
                let prompt = node.data?.prompt || 'Beautiful digital art';
                for (const [k, v] of Object.entries(variables)) {
                    prompt = prompt.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
                }
                const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=800&nologo=true`;
                try {
                    await ctx.replyWithPhoto(imageUrl, { caption: `🎨 AI tomonidan yaratildi: ${prompt}` });
                }
                catch (e) {
                    this.logger.error(`AI image failed: ${e.message}`);
                }
                return { wait: false };
            }
            if (node.type === 'amocrm' || node.type === 'bitrix') {
                const webhookUrl = node.data?.webhookUrl || node.data?.url;
                if (webhookUrl) {
                    try {
                        await fetch(webhookUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                crm: node.type,
                                contactId,
                                variables,
                                timestamp: new Date().toISOString()
                            })
                        });
                        this.logger.log(`${node.type} CRM webhook triggered for contact ${contactId}`);
                    }
                    catch (e) {
                        this.logger.error(`${node.type} CRM failed: ${e.message}`);
                    }
                }
                return { wait: false };
            }
            return { wait: false };
        }
        catch (e) {
            this.logger.error(`Failed to execute node ${node.id}: ${e.message}`);
            return { wait: true };
        }
    }
};
exports.WorkflowService = WorkflowService;
exports.WorkflowService = WorkflowService = WorkflowService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService,
        mazaika_engine_service_1.MazaikaEngineService])
], WorkflowService);
//# sourceMappingURL=workflow.service.js.map