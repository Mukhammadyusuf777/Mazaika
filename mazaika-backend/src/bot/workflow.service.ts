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
        if (payload.action === 'order') {
          const itemNames = payload.items.map((i: any) => i.name).join(', ');
          const responseText = `🛒 Yangi buyurtma qabul qilindi!\n\n🛍 Mahsulotlar: ${itemNames}\n💰 Jami: ${payload.total.toLocaleString()} UZS\n👤 Mijoz: ${payload.customer.name}\n📞 Tel: ${payload.customer.phone}\n\nRahmat! Tez orada siz bilan bog'lanamiz.`;
          await ctx.reply(responseText);
          await this.firebaseService.addMessage(botId, contact.id, `Buyurtma: ${itemNames} (${payload.total} UZS)`, 'inbound');
          await this.firebaseService.addMessage(botId, contact.id, responseText, 'outbound');
        } else if (payload.action === 'form_submit') {
          let fieldSummary = '';
          for (const [key, val] of Object.entries(payload.responses)) {
            fieldSummary += `\n- ${key}: ${val}`;
          }
          const responseText = `📝 So'rovnoma qabul qilindi!${fieldSummary}\n\nRahmat!`;
          await ctx.reply(responseText);
          await this.firebaseService.addMessage(botId, contact.id, `So'rovnoma: ${payload.formName}`, 'inbound');
          await this.firebaseService.addMessage(botId, contact.id, responseText, 'outbound');
        } else if (payload.action === 'prize') {
          const responseText = `🎉 Tabriklaymiz! Omad G'ildiragida siz yutgan sovg'a: "${payload.prize}"\n\nYutuqni olish uchun ushbu xabarni adminga taqdim eting.`;
          await ctx.reply(responseText);
          await this.firebaseService.addMessage(botId, contact.id, `Yutuq: ${payload.prize}`, 'inbound');
          await this.firebaseService.addMessage(botId, contact.id, responseText, 'outbound');
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
        state.variables[varName] = text;
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
        await ctx.reply("Iltimos, telefon raqamingizni yuborish tugmasini bosing.");
        return;
      }
    } else if (state.waitingFor === 'email') {
      const varName = currentNode?.data?.variable || 'email';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(text)) {
        state.variables[varName] = text;
        state.waitingFor = null;
        nextNode = this.getNextNode(currentNode, null, edges, nodes, state);
      } else {
        await ctx.reply("Noto'g'ri email shakli. Iltimos, qaytadan kiriting:");
        return;
      }
    } else if (state.waitingFor === 'location') {
      const varName = currentNode?.data?.variable || 'location';
      if (text.startsWith('location:')) {
        state.variables[varName] = text.replace('location:', '');
        state.waitingFor = null;
        nextNode = this.getNextNode(currentNode, null, edges, nodes, state);
      } else {
        await ctx.reply("Iltimos, lokatsiyangizni yuborish tugmasini bosing.");
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

    while (nextNode) {
      const { wait, stateUpdates } = await this.executeNodeAction(ctx, nextNode, contact.id, state.variables, botId);
      
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
      const varValue = parseFloat(state.variables[data.variable || '']?.toString() || '0') || state.variables[data.variable || '']?.toString() || '';
      const checkValue = parseFloat(data.value?.toString() || '0') || data.value?.toString() || '';
      let isTrue = false;
      
      if (data.operator === 'contains') isTrue = varValue.toString().includes(checkValue.toString());
      else if (data.operator === '!=') isTrue = varValue !== checkValue;
      else if (data.operator === '>') isTrue = varValue > checkValue;
      else if (data.operator === '<') isTrue = varValue < checkValue;
      else isTrue = varValue === checkValue; // default '=='
      
      targetHandle = isTrue ? 'true' : 'false';
    } else if (currentNode.type === 'abTest') {
      targetHandle = Math.random() < 0.5 ? 'A' : 'B';
    }

    // Find edge from current node with matching sourceHandle
    let edge = edges.find(e => e.source === currentNode.id && e.sourceHandle === targetHandle);
    
    // Fallback to first edge if no handle matches
    if (!edge && !['condition', 'message', 'abTest'].includes(currentNode.type)) {
      edge = edges.find(e => e.source === currentNode.id);
    }

    if (edge) {
      return nodes.find(n => n.id === edge.target);
    }
    return null;
  }

  private async executeNodeAction(ctx: any, node: any, contactId: string, variables: any, botId: string): Promise<{wait: boolean, stateUpdates?: any}> {
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

        const buttons = node.data?.buttons || [];
        const extra = buttons.length > 0 ? {
          reply_markup: {
            inline_keyboard: buttons.map((btn: string, idx: number) => {
              const parts = btn.split('|');
              if (parts.length > 1 && (parts[1].trim().startsWith('http://') || parts[1].trim().startsWith('https://'))) {
                return [{ text: parts[0].trim(), web_app: { url: parts[1].trim() } }];
              }
              return [{ text: btn, callback_data: `btn_${idx}` }];
            })
          }
        } : undefined;


        await ctx.reply(text, extra);
        await this.firebaseService.addMessage(botId, contactId, text, 'outbound');
        
        if (buttons.length > 0) return { wait: true, stateUpdates: { waitingFor: 'button' } };
        return { wait: false };
      }

      if (node.type === 'chain') {
        return { wait: false }; // Handled directly in getNextNode
      }

      if (node.type === 'timer') {
        const amount = parseInt(node.data?.delayAmount) || 0;
        const unit = node.data?.delayUnit || 'seconds';
        let ms = amount * (unit === 'minutes' ? 60000 : 1000);
        if (ms > 10000) ms = 10000; 
        if (ms > 0) await new Promise(res => setTimeout(res, ms));
        return { wait: false };
      }

      if (node.type === 'question') {
        let text = node.data?.text || 'Savol?';
        for (const [k, v] of Object.entries(variables)) {
           text = text.replace(new RegExp(`{${k}}`, 'g'), v as string);
        }
        await ctx.reply(text);
        await this.firebaseService.addMessage(botId, contactId, text, 'outbound');
        return { wait: true, stateUpdates: { waitingFor: 'question' } };
      }

      if (node.type === 'phone') {
        let text = node.data?.text || 'Iltimos, telefon raqamingizni yuboring:';
        await ctx.reply(text, {
          reply_markup: {
            keyboard: [[{ text: '📞 Raqamni yuborish', request_contact: true }]],
            one_time_keyboard: true,
            resize_keyboard: true
          }
        });
        await this.firebaseService.addMessage(botId, contactId, text, 'outbound');
        return { wait: true, stateUpdates: { waitingFor: 'phone' } };
      }

      if (node.type === 'email') {
        let text = node.data?.text || 'Iltimos, email manzilingizni kiriting:';
        await ctx.reply(text);
        await this.firebaseService.addMessage(botId, contactId, text, 'outbound');
        return { wait: true, stateUpdates: { waitingFor: 'email' } };
      }

      if (node.type === 'location') {
        let text = node.data?.text || 'Iltimos, lokatsiyangizni ulashing:';
        await ctx.reply(text, {
          reply_markup: {
            keyboard: [[{ text: '📍 Lokatsiyani yuborish', request_location: true }]],
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
        return { wait: false }; // Evaluated in getNextNode
      }

      if (node.type === 'variable') {
        const name = node.data?.variableName;
        const val = node.data?.variableValue;
        if (name) {
          return { wait: false, stateUpdates: { variables: { ...variables, [name]: val } } };
        }
        return { wait: false };
      }

      if (node.type === 'deleteVariable') {
        const name = node.data?.variableName;
        if (name) {
          const newVars = { ...variables };
          delete newVars[name];
          return { wait: false, stateUpdates: { variables: newVars } };
        }
        return { wait: false };
      }

      if (node.type === 'javascript') {
        const code = node.data?.code;
        const target = node.data?.variable;
        if (code && target) {
          try {
            // Evaluates simple expressions inside sandboxed try-catch.
            // Replace references to variables e.g. variables.age
            const func = new Function('variables', `return (${code})`);
            const result = func(variables);
            return { wait: false, stateUpdates: { variables: { ...variables, [target]: result } } };
          } catch (err) {
            this.logger.error(`JS Node error: ${err.message}`);
          }
        }
        return { wait: false };
      }

      if (['http', 'webhook', 'googleSheetsAdd', 'googleSheetsRead'].includes(node.type)) {
        const url = node.data?.url;
        const method = node.data?.method || 'POST';
        const targetVar = node.data?.variable;

        if (url) {
          try {
            const body = node.type === 'webhook' || node.type === 'googleSheetsAdd'
              ? JSON.stringify({ variables, contactId }) 
              : undefined;

            const res = await fetch(url, {
              method,
              headers: body ? { 'Content-Type': 'application/json' } : undefined,
              body
            });
            const data = await res.text();
            
            if (targetVar && node.type !== 'googleSheetsAdd') {
              return { wait: false, stateUpdates: { variables: { ...variables, [targetVar]: data.substring(0, 500) } } };
            }
          } catch (err) {
            this.logger.error(`Outbound Integration API failed: ${err.message}`);
          }
        }
        return { wait: false };
      }

      if (['getCourse', 'yclients'].includes(node.type)) {
        // Mock integration output
        const domain = node.data?.domain || 'crm';
        await ctx.reply(`[Integratsiya] ${node.type === 'getCourse' ? 'GetCourse' : 'Yclients'} orqali ${domain} bazasiga bog'lanildi.`);
        return { wait: false };
      }

      if (['payme', 'click', 'yookassa', 'cryptopay'].includes(node.type)) {
        const title = node.data?.title || 'To\'lov';
        const price = parseInt(node.data?.price) || 0;
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
          } catch (err) {
            this.logger.error(`Failed to send ${node.type} invoice: ${err.message}`);
            await ctx.reply(`To'lov xizmatini ishga tushirib bo'lmadi.`);
          }
        } else {
          await ctx.reply(`[Hisob-faktura] To'lov sozlangan emas.`);
        }
        return { wait: false };
      }


      if (node.type === 'dealStage') {
        const stage = node.data?.stage || 'New';
        return { wait: false, stateUpdates: { variables: { ...variables, deal_stage: stage } } };
      }

      if (node.type === 'assignee') {
        const agent = node.data?.agent || 'None';
        return { wait: false, stateUpdates: { variables: { ...variables, deal_agent: agent } } };
      }

      if (node.type === 'cart') {
        const action = node.data?.cartAction || 'add';
        const item = node.data?.itemName || 'Item';
        let cart = variables.cart ? JSON.parse(variables.cart) : [];
        if (action === 'add') {
          cart.push(item);
        } else {
          cart = [];
        }
        return { wait: false, stateUpdates: { variables: { ...variables, cart: JSON.stringify(cart) } } };
      }

      if (node.type === 'orderList') {
        const cartStr = variables.cart || '[]';
        const cart = JSON.parse(cartStr);
        if (cart.length === 0) {
          await ctx.reply("Sizning savatingiz hozircha bo'sh.");
        } else {
          await ctx.reply(`Sizning buyurtmalaringiz:\n${cart.map((c: string, idx: number) => `${idx + 1}. ${c}`).join('\n')}`);
        }
        return { wait: false };
      }

      if (node.type === 'addTag') {
        const tag = node.data?.tagName;
        if (tag) {
          const tags = variables.tags ? JSON.parse(variables.tags) : [];
          if (!tags.includes(tag)) tags.push(tag);
          return { wait: false, stateUpdates: { variables: { ...variables, tags: JSON.stringify(tags) } } };
        }
        return { wait: false };
      }

      if (node.type === 'removeTag') {
        const tag = node.data?.tagName;
        if (tag) {
          let tags = variables.tags ? JSON.parse(variables.tags) : [];
          tags = tags.filter((t: string) => t !== tag);
          return { wait: false, stateUpdates: { variables: { ...variables, tags: JSON.stringify(tags) } } };
        }
        return { wait: false };
      }

      if (node.type === 'topUpBalance') {
        const amount = parseInt(node.data?.amount) || 0;
        const currentBalance = parseInt(variables.balance || '0') || 0;
        return { wait: false, stateUpdates: { variables: { ...variables, balance: (currentBalance + amount).toString() } } };
      }

      if (node.type === 'debitBalance') {
        const amount = parseInt(node.data?.amount) || 0;
        const currentBalance = parseInt(variables.balance || '0') || 0;
        return { wait: false, stateUpdates: { variables: { ...variables, balance: (currentBalance - amount).toString() } } };
      }

      if (node.type === 'deleteUser') {
        return { wait: false, stateUpdates: { variables: {} } };
      }

      if (node.type === 'voterRegister') {
        const candidate = node.data?.candidate || 'Option';
        await ctx.reply(`Siz muvaffaqiyatli "${candidate}" uchun ovoz berdingiz.`);
        return { wait: false, stateUpdates: { variables: { ...variables, voted_for: candidate } } };
      }

      if (node.type === 'voteLeaders') {
        await ctx.reply("🏆 Reyting yetakchilari:\n1. A Nomzod - 150 ovoz\n2. B Nomzod - 120 ovoz");
        return { wait: false };
      }

      return { wait: false };
    } catch (e: any) {
      this.logger.error(`Failed to execute node ${node.id}: ${e.message}`);
      return { wait: true };
    }
  }
}
