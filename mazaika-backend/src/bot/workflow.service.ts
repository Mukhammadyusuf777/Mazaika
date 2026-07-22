import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(private firebaseService: FirebaseService) {}

  async processIncomingMessage(botId: string, telegramId: string, text: string, ctx: any) {
    this.logger.log(`Processing input from ${telegramId} for bot ${botId}: ${text}`);
    
    const bot = await this.firebaseService.getBot(botId);
    if (!bot) return;

    const workflow = await this.firebaseService.getBotWorkflow(botId);
    if (!workflow) return;

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

    // Intercept WebApp submissions
    if (text.startsWith('webapp:')) {
      const payloadStr = text.substring(7);
      try {
        const payload = JSON.parse(payloadStr);
        const contactRef = this.firebaseService.db.collection('bots').doc(botId).collection('contacts').doc(contact.id);
        
        let state = contact.state ? JSON.parse(contact.state) : { variables: {}, waitingFor: null };
        if (!state.variables) state.variables = {};
        const variables = { ...state.variables };
        let stage = contact.stage || 'Yangi';

        if (payload.action === 'order') {
          const itemNames = payload.items.map((i: any) => i.name).join(', ');
          const responseText = `🛒 Yangi buyurtma qabul qilindi!\n\n🛍 Mahsulotlar: ${itemNames}\n💰 Jami: ${payload.total.toLocaleString()} UZS\n👤 Mijoz: ${payload.customer.name}\n📞 Tel: ${payload.customer.phone}\n\nRahmat! Tez orada siz bilan bog'lanamiz.`;
          await ctx.reply(responseText);
          await this.firebaseService.addMessage(botId, contact.id, `Buyurtma: ${itemNames} (${payload.total} UZS)`, 'inbound');
          await this.firebaseService.addMessage(botId, contact.id, responseText, 'outbound');

          // Save variables
          variables.last_order_items = itemNames;
          variables.last_order_total = payload.total.toString();
          variables.customer_name = payload.customer.name;
          variables.customer_phone = payload.customer.phone;
          stage = 'Kelishuv'; // Transition CRM deal stage to Deal

        } else if (payload.action === 'form_submit') {
          let fieldSummary = '';
          for (const [key, val] of Object.entries(payload.responses)) {
            fieldSummary += `\n- ${key}: ${val}`;
            // Convert label to standard lowercase snake_case variable name
            const varName = key.toLowerCase().replace(/\s+/g, '_');
            variables[varName] = val;
          }
          const responseText = `📝 So'rovnoma qabul qilindi!${fieldSummary}\n\nRahmat!`;
          await ctx.reply(responseText);
          await this.firebaseService.addMessage(botId, contact.id, `So'rovnoma: ${payload.formName}`, 'inbound');
          await this.firebaseService.addMessage(botId, contact.id, responseText, 'outbound');
          stage = 'Muloqot'; // Transition CRM deal stage to Active communication

        } else if (payload.action === 'prize') {
          const responseText = `🎉 Tabriklaymiz! Omad G'ildiragida siz yutgan sovg'a: "${payload.prize}"\n\nYutuqni olish uchun ushbu xabarni adminga taqdim eting.`;
          await ctx.reply(responseText);
          await this.firebaseService.addMessage(botId, contact.id, `Yutuq: ${payload.prize}`, 'inbound');
          await this.firebaseService.addMessage(botId, contact.id, responseText, 'outbound');
          
          variables.last_prize = payload.prize;
        }

        // Save updated variables and stage back to contact document
        const updatedState = { ...state, variables };
        await contactRef.update({
          state: JSON.stringify(updatedState),
          stage,
          updatedAt: new Date()
        });

        // Resume workflow to the next connected node from current node
        if (state.currentNodeId) {
          const nodes = JSON.parse(workflow.nodes) as any[];
          const edges = JSON.parse(workflow.edges) as any[];
          const outgoingEdges = edges.filter(e => e.source === state.currentNodeId);
          if (outgoingEdges.length > 0) {
            const nextNodeId = outgoingEdges[0].target;
            // Execute resumeWorkflow to transition to the next block
            await this.resumeWorkflow(botId, contact.id, nextNodeId, ctx);
          }
        }
      } catch (err: any) {
        this.logger.error(`Failed to parse WebApp payload: ${err.message}`);
      }
      return;
    }

    // Save user message unless it's /start or structured share triggers
    if (!text.startsWith('/start') && !text.startsWith('btn_') && !text.startsWith('contact:') && !text.startsWith('location:')) {
      await this.firebaseService.addMessage(botId, contact.id, text, 'inbound');
    }


    const nodes = JSON.parse(workflow.nodes) as any[];
    const edges = JSON.parse(workflow.edges) as any[];
    let state = contact.state ? JSON.parse(contact.state) : { variables: {}, waitingFor: null };
    if (!state.variables) state.variables = {};

    let currentNode = nodes.find(n => n.id === state.currentNodeId);
    let nextNode = null;

    if (text.startsWith('/start')) {
      state = { variables: {}, waitingFor: null };
      const parts = text.trim().split(/\s+/);
      if (parts.length > 1) {
        state.variables['start_payload'] = parts[1];
      }
      currentNode = nodes.find(n => n.type === 'start');
      nextNode = currentNode;
    } else if (state.waitingFor === 'question') {
      const varName = currentNode?.data?.variable;
      if (varName) {
        let answer = text;
        // If they clicked an inline option button, resolve the button's text label
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
    } else if (state.waitingFor === 'phone') {
      const varName = currentNode?.data?.variable || 'phone';
      if (text.startsWith('contact:')) {
        state.variables[varName] = text.replace('contact:', '');
        state.waitingFor = null;
        nextNode = this.getNextNode(currentNode, null, edges, nodes, state);
      } else {
        const cleanText = text.replace(/[\s\-\(\)\+]/g, '');
        const isDigits = /^[0-9]{9,15}$/.test(cleanText);
        if (isDigits) {
          state.variables[varName] = text;
          state.waitingFor = null;
          nextNode = this.getNextNode(currentNode, null, edges, nodes, state);
        } else {
          const btnText = currentNode?.data?.buttonText || '📞 Raqamni yuborish';
          await ctx.reply(`Iltimos, "${btnText}" tugmasini bosing yoki telefon raqamingizni to'g'ri formatda yozib yuboring (Masalan: +998901234567).`);
          return;
        }
      }
    } else if (state.waitingFor === 'email') {
      const varName = currentNode?.data?.variable || 'email';
      const trimmedText = text.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(trimmedText)) {
        state.variables[varName] = trimmedText;
        state.waitingFor = null;
        nextNode = this.getNextNode(currentNode, null, edges, nodes, state);
      } else {
        await ctx.reply("Noto'g'ri email manzili kiritildi. Iltimos, elektron pochta manzilingizni to'g'ri formatda yozib yuboring (Masalan: user@domain.com):");
        return;
      }
    } else if (state.waitingFor === 'location') {
      const varName = currentNode?.data?.variable || 'location';
      if (text.startsWith('location:')) {
        state.variables[varName] = text.replace('location:', '');
        state.waitingFor = null;
        nextNode = this.getNextNode(currentNode, null, edges, nodes, state);
      } else {
        const btnText = currentNode?.data?.buttonText || '📍 Lokatsiyani yuborish';
        await ctx.reply(`Iltimos, "${btnText}" tugmasini bosing.`);
        return;
      }
    } else if (state.waitingFor === 'payment') {
      if (text.startsWith('payment_success:')) {
        const parts = text.split(':');
        const payload = parts[1];
        const amount = parts[2];
        state.variables['last_payment_payload'] = payload;
        state.variables['last_payment_amount'] = amount;
        state.waitingFor = null;
        nextNode = this.getNextNode(currentNode, null, edges, nodes, state);
      } else {
        await ctx.reply("Iltimos, to'lovni yakunlang. To'lov amalga oshirilgandan so'ng bot avtomatik ravishda davom etadi.");
        return;
      }
    } else if (currentNode && currentNode.type === 'message' && text.startsWith('btn_')) {
      nextNode = this.getNextNode(currentNode, text, edges, nodes, state);
    } else {
      if (!currentNode) {
        currentNode = nodes.find(n => n.type === 'start');
        nextNode = currentNode;
      }
    }

    const visitedNodeIds = new Set<string>();
    while (nextNode) {
      if (visitedNodeIds.has(nextNode.id)) {
        this.logger.error(`Infinite loop detected in workflow execution at node ${nextNode.id} for contact ${contact.id}. Stopping workflow.`);
        break;
      }
      visitedNodeIds.add(nextNode.id);

      const { wait, stateUpdates } = await this.executeNodeAction(ctx, nextNode, contact.id, state.variables, botId, edges);
      
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

  async resumeWorkflow(botId: string, contactId: string, nextNodeId: string, ctx: any) {
    this.logger.log(`Resuming workflow for contact ${contactId} at node ${nextNodeId}`);

    const workflow = await this.firebaseService.getBotWorkflow(botId);
    if (!workflow) return;

    const nodes = JSON.parse(workflow.nodes) as any[];
    const edges = JSON.parse(workflow.edges) as any[];

    const contactSnap = await this.firebaseService.db.collection('bots').doc(botId).collection('contacts').doc(contactId).get();
    if (!contactSnap.exists) return;
    const contact = contactSnap.data() as any;
    contact.id = contactSnap.id;

    let state = contact.state ? JSON.parse(contact.state) : { variables: {}, waitingFor: null };
    if (!state.variables) state.variables = {};

    let nextNode = nodes.find(n => n.id === nextNodeId);

    const visitedNodeIds = new Set<string>();
    while (nextNode) {
      if (visitedNodeIds.has(nextNode.id)) {
        this.logger.error(`Infinite loop detected in resumed workflow execution at node ${nextNode.id} for contact ${contact.id}. Stopping workflow.`);
        break;
      }
      visitedNodeIds.add(nextNode.id);

      const { wait, stateUpdates } = await this.executeNodeAction(ctx, nextNode, contact.id, state.variables, botId, edges);
      
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



  private getNextNode(currentNode: any, input: string | null, edges: any[], nodes: any[], state: any) {
    if (!currentNode) return null;

    let targetHandle = 'out'; // default

    if (currentNode.type === 'chain') {
      const targetId = currentNode.data?.targetNodeId;
      if (targetId) return nodes.find(n => n.id === targetId);
    }

    if (currentNode.type === 'message' && input?.startsWith('btn_')) {
      targetHandle = input;
    } else if (currentNode.type === 'question' || currentNode.type === 'phone' || currentNode.type === 'email' || currentNode.type === 'location') {
      targetHandle = 'answered';
    } else if (currentNode.type === 'condition') {
      const data = currentNode.data || {};
      const variableName = data.variable || '';
      const varRaw = state.variables[variableName];
      const varStr = varRaw !== undefined && varRaw !== null ? varRaw.toString() : '';
      
      let isTrue = false;
      const op = data.operator || '==';

      if (op === 'is_empty') {
        isTrue = varStr.trim() === '';
      } else if (op === 'is_filled') {
        isTrue = varStr.trim() !== '';
      } else if (op === 'regex') {
        try {
          const checkVal = data.value || '';
          const regex = new RegExp(checkVal);
          isTrue = regex.test(varStr);
        } catch (regexErr) {
          this.logger.error(`Invalid regex in condition node ${currentNode.id}: ${data.value}`);
          isTrue = false;
        }
      } else {
        // Try parsing float for numeric comparisons, fall back to string
        const parsedVar = parseFloat(varStr);
        const varValue = !isNaN(parsedVar) ? parsedVar : varStr;
        
        const checkStr = data.value?.toString() || '';
        const parsedCheck = parseFloat(checkStr);
        const checkValue = !isNaN(parsedCheck) ? parsedCheck : checkStr;
        
        if (op === 'contains') {
          isTrue = varStr.toLowerCase().includes(checkStr.toLowerCase());
        } else if (op === '!=') {
          isTrue = varValue !== checkValue;
        } else if (op === '>') {
          isTrue = varValue > checkValue;
        } else if (op === '<') {
          isTrue = varValue < checkValue;
        } else {
          isTrue = varValue === checkValue; // default '=='
        }
      }
      
      targetHandle = isTrue ? 'true' : 'false';
    } else if (currentNode.type === 'subscription') {
      const isTrue = !!state.lastSubscriptionCheck;
      targetHandle = isTrue ? 'true' : 'false';
    } else if (currentNode.type === 'abTest') {
      targetHandle = state.lastAbResult || (Math.random() < 0.5 ? 'A' : 'B');
    }

    // Find edge from current node with matching sourceHandle
    let edge = edges.find(e => e.source === currentNode.id && e.sourceHandle === targetHandle);
    
    // Fallback to first edge if no handle matches
    if (!edge && !['condition', 'subscription', 'message', 'abTest'].includes(currentNode.type)) {
      edge = edges.find(e => e.source === currentNode.id);
    }

    if (edge) {
      return nodes.find(n => n.id === edge.target);
    }
    return null;
  }

  private async executeNodeAction(ctx: any, node: any, contactId: string, variables: any, botId: string, edges: any[]): Promise<{wait: boolean, stateUpdates?: any}> {
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
        if (!text) return { wait: false };
        
        for (const [k, v] of Object.entries(variables)) {
           text = text.replace(new RegExp(`{${k}}`, 'g'), v as string);
        }

        const mediaUrl = node.data?.mediaUrl;
        const buttons = node.data?.buttons || [];
        const inlineKeyboard = buttons.map((btn: any, idx: number) => {
          const btnText = typeof btn === 'string' ? btn : (btn.text || 'Tugma');
          const parts = btnText.split('|');
          if (parts.length > 1) {
            const label = parts[0].trim();
            const urlVal = parts[1].trim();
            if (urlVal.startsWith('webapp:')) {
              return [{ text: label, web_app: { url: urlVal.substring(7).trim() } }];
            } else if (urlVal.startsWith('http://') || urlVal.startsWith('https://')) {
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
          // Check if video file
          const isVideo = mediaUrl.toLowerCase().endsWith('.mp4') || 
                          mediaUrl.toLowerCase().endsWith('.mov') || 
                          mediaUrl.toLowerCase().endsWith('.avi');
          try {
            if (isVideo) {
              await ctx.replyWithVideo(mediaUrl, { caption: text, ...extra });
            } else {
              await ctx.replyWithPhoto(mediaUrl, { caption: text, ...extra });
            }
          } catch (mediaErr: any) {
            this.logger.error(`Failed to send media message for bot ${botId}: ${mediaErr.message}. Falling back to text.`);
            await ctx.reply(text, extra);
          }
        } else {
          await ctx.reply(text, extra);
        }

        await this.firebaseService.addMessage(botId, contactId, text, 'outbound');
        
        if (buttons.length > 0) return { wait: true, stateUpdates: { waitingFor: 'button' } };

        return { wait: false };
      }

      if (node.type === 'chain') {
        return { wait: false }; // Handled directly in getNextNode
      }

      if (node.type === 'custom_code') {
        const code = node.data?.code;
        if (code) {
          try {
            // WARNING: In a production environment this needs a sandbox (like vm2). 
            // For this generative MVP, we use raw async eval to allow maximum AI freedom.
            const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
            const executor = new AsyncFunction('ctx', 'variables', 'botId', 'contactId', code);
            await executor(ctx, variables, botId, contactId);
          } catch (err: any) {
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
            // Obtain chat member status
            const userId = parseInt(contactId); // contactId is the Telegram user ID
            if (!isNaN(userId)) {
              const member = await ctx.telegram.getChatMember(chatTarget, userId);
              const allowedStatuses = ['member', 'creator', 'administrator'];
              if (allowedStatuses.includes(member.status)) {
                isSubscribed = true;
              }
            }
          } catch (err: any) {
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
        if (unit === 'minutes') ms = amount * 60000;
        else if (unit === 'hours') ms = amount * 3600000;
        else if (unit === 'days') ms = amount * 86400000;
        
        // If delay is longer than 5 seconds, offload it to Firestore timers
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
           text = text.replace(new RegExp(`{${k}}`, 'g'), v as string);
        }

        const mediaUrl = node.data?.mediaUrl;
        const buttons = node.data?.buttons || [];
        const inlineKeyboard = buttons.map((btn: any, idx: number) => {
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
            } else {
              await ctx.replyWithPhoto(mediaUrl, { caption: text, ...extra });
            }
          } catch (mediaErr: any) {
            this.logger.error(`Failed to send media question for bot ${botId}: ${mediaErr.message}. Falling back to text.`);
            await ctx.reply(text, extra);
          }
        } else {
          await ctx.reply(text, extra);
        }

        await this.firebaseService.addMessage(botId, contactId, text, 'outbound');
        return { wait: true, stateUpdates: { waitingFor: 'question' } };
      }


      if (node.type === 'phone') {
        let text = node.data?.text || 'Iltimos, telefon raqamingizni yuboring:';
        const btnText = node.data?.buttonText || '📞 Raqamni yuborish';
        for (const [k, v] of Object.entries(variables)) {
           text = text.replace(new RegExp(`{${k}}`, 'g'), v as string);
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
           text = text.replace(new RegExp(`{${k}}`, 'g'), v as string);
        }
        await ctx.reply(text);
        await this.firebaseService.addMessage(botId, contactId, text, 'outbound');
        return { wait: true, stateUpdates: { waitingFor: 'email' } };
      }

      if (node.type === 'location') {
        let text = node.data?.text || 'Iltimos, lokatsiyangizni ulashing:';
        const btnText = node.data?.buttonText || '📍 Lokatsiyani yuborish';
        for (const [k, v] of Object.entries(variables)) {
           text = text.replace(new RegExp(`{${k}}`, 'g'), v as string);
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
        return { wait: false }; // Evaluated in getNextNode
      }

      if (node.type === 'abTest') {
        const data = node.data || {};
        const ratioA = data.ratioA !== undefined && !isNaN(parseInt(data.ratioA)) ? parseInt(data.ratioA) : 50;
        
        const rolledValue = Math.random() * 100;
        const assigned = rolledValue < ratioA ? 'A' : 'B';
        
        const varName = data.variable;
        const stateUpdates: any = { lastAbResult: assigned };
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
          
          // 1. Interpolate variables (e.g. "Hello {name}")
          for (const [k, v] of Object.entries(variables)) {
            finalVal = finalVal.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
          }

          // 2. Safe mathematical expression evaluation (e.g. "12 + 1" or "2 * 3.5")
          const isMathExpr = /^[0-9\s\+\-\*\/\(\)\.]+$/.test(finalVal.trim());
          if (isMathExpr && finalVal.trim() !== '') {
            try {
              const result = Function(`"use strict"; return (${finalVal})`)();
              if (typeof result === 'number' && !isNaN(result)) {
                finalVal = result.toString();
              }
            } catch (mathErr) {
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
          const names = nameInput.split(',').map((n: string) => n.trim()).filter((n: string) => n !== '');
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
            // 1. Prepare casted variables scope to avoid string concatenation bugs (+ operator)
            const isValidIdentifier = (key: string) => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
            const validKeys = Object.keys(variables).filter(isValidIdentifier);
            const validVals = validKeys.map(k => {
              const val = variables[k];
              if (typeof val === 'string') {
                const num = Number(val);
                if (!isNaN(num) && val.trim() !== '') {
                  return num;
                }
              }
              return val;
            });

            // 2. Build the sandboxed evaluation function injecting variables as local scope variables
            const func = new Function('variables', ...validKeys, `return (${code})`);
            const result = func(variables, ...validVals);

            return { wait: false, stateUpdates: { variables: { ...variables, [target]: result } } };
          } catch (err: any) {
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
            // 1. Interpolate variables in URL
            let finalUrl = url.trim();
            for (const [k, v] of Object.entries(variables)) {
              finalUrl = finalUrl.replace(new RegExp(`{${k}}`, 'g'), encodeURIComponent(v !== undefined && v !== null ? v.toString() : ''));
            }

            // 2. Prepare request options
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
            // 3. Resolve JSON path if required
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
              } catch (jsonErr: any) {
                this.logger.error(`JSON path resolution failed for node ${node.id}: ${jsonErr.message}`);
              }
            }

            if (targetVar) {
              return { wait: false, stateUpdates: { variables: { ...variables, [targetVar]: savedVal.substring(0, 500) } } };
            }
          } catch (err: any) {
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
            // 1. Interpolate variables in webhook URL
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
          } catch (err: any) {
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
            // 1. Interpolate variables in Google Web App URL
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
          } catch (err: any) {
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
            // 1. Interpolate variables in Google Web App URL
            let finalUrl = url.trim();
            for (const [k, v] of Object.entries(variables)) {
              finalUrl = finalUrl.replace(new RegExp(`{${k}}`, 'g'), encodeURIComponent(v !== undefined && v !== null ? v.toString() : ''));
            }

            const res = await fetch(finalUrl, { method });
            const rawData = await res.text();
            
            let savedVal = rawData;
            // 2. Resolve JSON path if required
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
              } catch (jsonErr: any) {
                this.logger.error(`JSON path resolution failed for Sheets Read node ${node.id}: ${jsonErr.message}`);
              }
            }

            if (targetVar) {
              return { wait: false, stateUpdates: { variables: { ...variables, [targetVar]: savedVal.substring(0, 500) } } };
            }
          } catch (err: any) {
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
            
            // Build the user profile object
            const userPayload: any = {
              email: emailVal || `${contactId}@mazaika-bot.ru`, // GetCourse requires email
              phone: phoneVal || '',
              first_name: nameVal || 'Mijoz'
            };

            const payload: any = { user: userPayload };

            if (action === 'deal') {
              let offerCode = node.data?.offerCode || '';
              // Interpolate variables in offer code
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
          } catch (err: any) {
            this.logger.error(`GetCourse integration failed for node ${node.id}: ${err.message}`);
          }
        }
        return { wait: false };
      }

      if (node.type === 'yclients') {
        const companyId = node.data?.companyId;
        const apiKey = node.data?.apiKey; // Partner Token
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
          } catch (err: any) {
            this.logger.error(`YClients integration failed for node ${node.id}: ${err.message}`);
          }
        }
        return { wait: false };
      }



      if (['payme', 'click', 'yookassa', 'cryptopay'].includes(node.type)) {
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
        const currency = node.type === 'yookassa' ? 'RUB' : 'UZS';

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
          } catch (err: any) {
            this.logger.error(`Failed to send ${node.type} invoice: ${err.message}`);
            await ctx.reply(`To'lov xizmatini ishga tushirib bo'lmadi. Iltimos keyinroq urinib ko'ring.`);
          }
        } else {
          await ctx.reply(`[Hisob-faktura] To'lov sozlangan emas yoki narxi xato kiritilgan.`);
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
        
        let cart: any[] = [];
        try {
          if (variables.cart) {
            cart = JSON.parse(variables.cart);
            if (!Array.isArray(cart)) cart = [];
          }
        } catch (e) {
          cart = [];
        }

        if (action === 'add') {
          // Resolve variable expressions inside price and qty
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

          // Check if product is already in the cart, if so, increase quantity
          const existing = cart.find(i => i.name === itemName);
          if (existing) {
            existing.qty += qty;
          } else {
            cart.push({ name: itemName, price, qty });
          }
        } else if (action === 'remove') {
          cart = cart.filter(i => i.name !== itemName);
        } else if (action === 'clear') {
          cart = [];
        }

        // Calculate helper values
        let cartTotal = 0;
        let cartItemsCount = 0;
        let cartText = '';

        if (cart.length === 0) {
          cartText = "Savatingiz bo'sh.";
        } else {
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
        let cart: any[] = [];
        try {
          cart = JSON.parse(cartStr);
          if (!Array.isArray(cart)) cart = [];
        } catch (e) {
          cart = [];
        }

        if (cart.length === 0) {
          let emptyMsg = node.data?.emptyMessage || "Sizning savatingiz hozircha bo'sh.";
          for (const [k, v] of Object.entries(variables)) {
            emptyMsg = emptyMsg.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
          }
          await ctx.reply(emptyMsg);
        } else {
          let header = node.data?.headerText || "Sizning buyurtmalaringiz:";
          for (const [k, v] of Object.entries(variables)) {
            header = header.replace(new RegExp(`{${k}}`, 'g'), v !== undefined && v !== null ? v.toString() : '');
          }
          let listText = header + "\n";
          let total = 0;
          cart.forEach((c: any, idx: number) => {
            if (typeof c === 'string') {
              listText += `${idx + 1}. ${c}\n`;
            } else {
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
              const contactData = contactSnap.data() as any;
              let currentTags = Array.isArray(contactData.tags) ? contactData.tags : [];
              if (!currentTags.includes(tag)) {
                currentTags.push(tag);
                await contactRef.update({ tags: currentTags, updatedAt: new Date() });
              }
            }
          } catch (err: any) {
            this.logger.error(`Failed to update root contact tag in addTag: ${err.message}`);
          }

          const tags = variables.tags ? JSON.parse(variables.tags) : [];
          if (!tags.includes(tag)) tags.push(tag);
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
              const contactData = contactSnap.data() as any;
              let currentTags = Array.isArray(contactData.tags) ? contactData.tags : [];
              if (currentTags.includes(tag)) {
                currentTags = currentTags.filter((t: string) => t !== tag);
                await contactRef.update({ tags: currentTags, updatedAt: new Date() });
              }
            }
          } catch (err: any) {
            this.logger.error(`Failed to remove root contact tag in removeTag: ${err.message}`);
          }

          let tags = variables.tags ? JSON.parse(variables.tags) : [];
          tags = tags.filter((t: string) => t !== tag);
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

        // Sync with root level contact document
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
        const newBalance = Math.max(0, currentBalance - amount); // balance can't be negative in basic logic

        // Sync with root level contact document
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
            // Delete messages subcollection
            const msgSnap = await contactRef.collection('messages').get();
            const batch = this.firebaseService.db.batch();
            msgSnap.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            
            // Delete the contact document
            await contactRef.delete();
            this.logger.log(`Contact ${contactId} completely deleted from Firestore CRM.`);
          } catch (err: any) {
            this.logger.error(`Failed to delete contact from database in deleteUser: ${err.message}`);
          }
          return { wait: true, stateUpdates: { currentNodeId: null, waitingFor: null, variables: {} } };
        } else {
          // 'memory' - wipe variables and CRM contact metadata fields
          try {
            await contactRef.update({
              stage: 'Yangi',
              assignee: 'None',
              balance: 0,
              tags: [],
              updatedAt: new Date()
            });
          } catch (err: any) {
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

        // Check if they already voted
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
            } else {
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
        } catch (err: any) {
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
          } else {
            let text = "🏆 Reyting yetakchilari (Real vaqtda):\n\n";
            votesSnap.docs.forEach((doc, idx) => {
              const data = doc.data();
              text += `${idx + 1}. ${doc.id} - ${data.count || 0} ta ovoz\n`;
            });
            await ctx.reply(text);
          }
        } catch (err: any) {
          this.logger.error(`Failed to load vote leaders: ${err.message}`);
          await ctx.reply("Reytingni yuklab bo'lmadi. Iltimos keyinroq urinib ko'ring.");
        }
        return { wait: false };
      }


      return { wait: false };
    } catch (e: any) {
      this.logger.error(`Failed to execute node ${node.id}: ${e.message}`);
      return { wait: true };
    }
  }
}
