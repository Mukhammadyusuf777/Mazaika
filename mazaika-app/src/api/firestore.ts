/**
 * Firebase Firestore — все операции с базой данных
 * Коллекции: users, bots, workflows, contacts, webhooks
 */
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// ============================================================
// USERS
// ============================================================
export async function createOrUpdateUser(uid: string, data: { name: string; email?: string | null; phone?: string | null }) {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

export async function getUser(uid: string): Promise<any> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (snap.exists()) return { id: snap.id, ...snap.data() } as any
  return null
}

// ============================================================
// BOTS
// ============================================================
export async function getBotsByUser(userId: string): Promise<any[]> {
  const q = query(collection(db, 'bots'), where('userId', '==', userId))
  const snap = await getDocs(q)
  const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as any))
  return list.sort((a, b) => {
    const t1 = a.createdAt?.seconds || 0
    const t2 = b.createdAt?.seconds || 0
    return t2 - t1
  })
}


export async function getBotById(botId: string): Promise<any> {
  const snap = await getDoc(doc(db, 'bots', botId))
  if (snap.exists()) return { id: snap.id, ...snap.data() } as any
  return null
}

export async function createBot(userId: string, data: { name: string; token: string; template?: string }): Promise<any> {
  const ref = await addDoc(collection(db, 'bots'), {
    name: data.name,
    token: data.token,
    userId,
    status: 'active',
    users: 0,
    messages: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  // Create workflow template nodes and edges
  let nodes: any[] = [];
  let edges: any[] = [];

  if (data.template === 'Internet do\'kon') {
    nodes = [
      { id: 'node-1', type: 'start', position: { x: 100, y: 200 }, data: { label: 'Boshlash', emoji: '▶', color: '#10d974' } },
      { id: 'node-2', type: 'message', position: { x: 300, y: 200 }, data: { label: 'Salomlashish', emoji: '💬', color: '#1e90ff', text: 'Xush kelibsiz! Internet do\'konda mahsulotlarni sotib olishingiz mumkin.', buttons: ['Katalog', 'Savatcha', 'Aloqa'] } },
      { id: 'node-3', type: 'cart', position: { x: 580, y: 100 }, data: { label: 'Savatga VIP qo\'shish', emoji: '🛒', color: '#ec4899', cartAction: 'add', itemName: 'VIP Kurs' } },
      { id: 'node-4', type: 'message', position: { x: 820, y: 100 }, data: { label: 'Xabar (VIP)', emoji: '💬', color: '#1e90ff', text: 'VIP Kurs savatga muvaffaqiyatli qo\'shildi!', buttons: ['To\'lov qilish'] } },
      { id: 'node-5', type: 'orderList', position: { x: 580, y: 250 }, data: { label: 'Buyurtmalar ro\'yxati', emoji: '📦', color: '#8b5cf6' } },
      { id: 'node-6', type: 'message', position: { x: 820, y: 250 }, data: { label: 'Xabar (Buyurtma)', emoji: '💬', color: '#1e90ff', text: 'Yuqorida buyurtmalaringiz ro\'yxati.', buttons: ['To\'lov qilish'] } },
      { id: 'node-7', type: 'message', position: { x: 580, y: 400 }, data: { label: 'Xabar (Aloqa)', emoji: '💬', color: '#1e90ff', text: 'Biz bilan bog\'lanish uchun: @MazaikaSupportBot' } },
      { id: 'node-8', type: 'payme', position: { x: 1100, y: 180 }, data: { label: 'Payme Invoys', emoji: '💳', color: '#10d974', title: 'Buyurtma uchun to\'lov', price: 99000, providerToken: 'TEST_PROVIDER_TOKEN' } }
    ];
    edges = [
      { id: 'e1', source: 'node-1', target: 'node-2', type: 'buttonEdge', animated: true, style: { stroke: '#1e90ff', strokeWidth: 2, opacity: 0.7 } },
      { id: 'e2', source: 'node-2', sourceHandle: 'btn_0', target: 'node-3', type: 'buttonEdge', animated: true, style: { stroke: '#1e90ff', strokeWidth: 2, opacity: 0.7 } },
      { id: 'e3', source: 'node-3', target: 'node-4', type: 'buttonEdge', animated: true, style: { stroke: '#1e90ff', strokeWidth: 2, opacity: 0.7 } },
      { id: 'e4', source: 'node-2', sourceHandle: 'btn_1', target: 'node-5', type: 'buttonEdge', animated: true, style: { stroke: '#1e90ff', strokeWidth: 2, opacity: 0.7 } },
      { id: 'e5', source: 'node-5', target: 'node-6', type: 'buttonEdge', animated: true, style: { stroke: '#1e90ff', strokeWidth: 2, opacity: 0.7 } },
      { id: 'e6', source: 'node-2', sourceHandle: 'btn_2', target: 'node-7', type: 'buttonEdge', animated: true, style: { stroke: '#1e90ff', strokeWidth: 2, opacity: 0.7 } },
      { id: 'e7', source: 'node-4', sourceHandle: 'btn_0', target: 'node-8', type: 'buttonEdge', animated: true, style: { stroke: '#1e90ff', strokeWidth: 2, opacity: 0.7 } },
      { id: 'e8', source: 'node-6', sourceHandle: 'btn_0', target: 'node-8', type: 'buttonEdge', animated: true, style: { stroke: '#1e90ff', strokeWidth: 2, opacity: 0.7 } }
    ];
  } else if (data.template === 'Yetkazib berish') {
    nodes = [
      { id: 'node-1', type: 'start', position: { x: 100, y: 200 }, data: { label: 'Boshlash', emoji: '▶', color: '#10d974' } },
      { id: 'node-2', type: 'message', position: { x: 300, y: 200 }, data: { label: 'Salomlashish', emoji: '💬', color: '#1e90ff', text: 'Kuryerlik xizmatiga xush kelibsiz!', buttons: ['Buyurtma berish', 'Statusni tekshirish'] } },
      { id: 'node-3', type: 'phone', position: { x: 580, y: 100 }, data: { label: 'Telefon raqam', emoji: '📱', color: '#a855f7', text: 'Iltimos, telefon raqamingizni yuboring:', variable: 'phone' } },
      { id: 'node-4', type: 'location', position: { x: 820, y: 100 }, data: { label: 'Lokatsiya', emoji: '📍', color: '#a855f7', text: 'Yetkazib berish manzilini ulashing:', variable: 'loc' } },
      { id: 'node-5', type: 'message', position: { x: 1060, y: 100 }, data: { label: 'Qabul', emoji: '💬', color: '#1e90ff', text: 'Rahmat! Kuryer tez orada yo\'lga chiqadi.' } },
      { id: 'node-6', type: 'message', position: { x: 580, y: 300 }, data: { label: 'Status', emoji: '💬', color: '#1e90ff', text: 'Kuryer hozirda ombordan yukingizni olib chiqdi.' } }
    ];
    edges = [
      { id: 'e1', source: 'node-1', target: 'node-2', type: 'buttonEdge', animated: true },
      { id: 'e2', source: 'node-2', sourceHandle: 'btn_0', target: 'node-3', type: 'buttonEdge', animated: true },
      { id: 'e3', source: 'node-3', target: 'node-4', type: 'buttonEdge', animated: true },
      { id: 'e4', source: 'node-4', target: 'node-5', type: 'buttonEdge', animated: true },
      { id: 'e5', source: 'node-2', sourceHandle: 'btn_1', target: 'node-6', type: 'buttonEdge', animated: true }
    ];
  } else if (data.template === 'Restoran') {
    nodes = [
      { id: 'node-1', type: 'start', position: { x: 100, y: 200 }, data: { label: 'Boshlash', emoji: '▶', color: '#10d974' } },
      { id: 'node-2', type: 'message', position: { x: 300, y: 200 }, data: { label: 'Xabar', emoji: '💬', color: '#1e90ff', text: 'Restoranimizga xush kelibsiz! Stol bron qilishni xohlaysizmi?', buttons: ['Stol bron qilish', 'Menyu'] } },
      { id: 'node-3', type: 'question', position: { x: 580, y: 100 }, data: { label: 'Ism so\'rash', emoji: '❓', color: '#a855f7', text: 'Iltimos, ismingizni yozib yuboring:', variable: 'client_name' } },
      { id: 'node-4', type: 'phone', position: { x: 820, y: 100 }, data: { label: 'Telefon so\'rash', emoji: '📱', color: '#a855f7', text: 'Aloqa uchun telefon raqam:', variable: 'client_phone' } },
      { id: 'node-5', type: 'message', position: { x: 1060, y: 100 }, data: { label: 'Tasdiqlash', emoji: '💬', color: '#1e90ff', text: 'Rahmat, {client_name}! Stol muvaffaqiyatli bron qilindi. Telefoningiz: {client_phone}' } },
      { id: 'node-6', type: 'message', position: { x: 580, y: 300 }, data: { label: 'Menyu', emoji: '💬', color: '#1e90ff', text: 'Bugungi menyu:\n1. Pitsa - 45 000 UZS\n2. Burger - 25 000 UZS\n3. Limonad - 12 000 UZS' } }
    ];
    edges = [
      { id: 'e1', source: 'node-1', target: 'node-2', type: 'buttonEdge', animated: true },
      { id: 'e2', source: 'node-2', sourceHandle: 'btn_0', target: 'node-3', type: 'buttonEdge', animated: true },
      { id: 'e3', source: 'node-3', target: 'node-4', type: 'buttonEdge', animated: true },
      { id: 'e4', source: 'node-4', target: 'node-5', type: 'buttonEdge', animated: true },
      { id: 'e5', source: 'node-2', sourceHandle: 'btn_1', target: 'node-6', type: 'buttonEdge', animated: true }
    ];
  } else if (data.template === 'Kurs savdo') {
    nodes = [
      { id: 'node-1', type: 'start', position: { x: 100, y: 200 }, data: { label: 'Boshlash', emoji: '▶', color: '#10d974' } },
      { id: 'node-2', type: 'message', position: { x: 300, y: 200 }, data: { label: 'Kurslar', emoji: '💬', color: '#1e90ff', text: 'Dasturlash kurslarimizga ro\'yxatdan o\'ting!', buttons: ['Python Kursi', 'VIP Statusini tekshirish'] } },
      { id: 'node-3', type: 'click', position: { x: 580, y: 100 }, data: { label: 'Click Invoys', emoji: '💳', color: '#00aaff', title: 'Python Kursi', price: 150000, providerToken: 'TEST_PROVIDER_TOKEN' } },
      { id: 'node-4', type: 'condition', position: { x: 580, y: 300 }, data: { label: 'Teg tekshirish', emoji: '🔀', color: '#ffb830', variable: 'tags', operator: 'contains', value: 'VIP' } },
      { id: 'node-5', type: 'message', position: { x: 850, y: 250 }, data: { label: 'VIP Xabar', emoji: '💬', color: '#1e90ff', text: 'Siz VIP a\'zosisiz!' } },
      { id: 'node-6', type: 'message', position: { x: 850, y: 380 }, data: { label: 'Oddiy Xabar', emoji: '💬', color: '#1e90ff', text: 'Kursni sotib olib, VIP statusga ega bo\'ling.' } }
    ];
    edges = [
      { id: 'e1', source: 'node-1', target: 'node-2', type: 'buttonEdge', animated: true },
      { id: 'e2', source: 'node-2', sourceHandle: 'btn_0', target: 'node-3', type: 'buttonEdge', animated: true },
      { id: 'e3', source: 'node-2', sourceHandle: 'btn_1', target: 'node-4', type: 'buttonEdge', animated: true },
      { id: 'e4', source: 'node-4', sourceHandle: 'true', target: 'node-5', type: 'buttonEdge', animated: true },
      { id: 'e5', source: 'node-4', sourceHandle: 'false', target: 'node-6', type: 'buttonEdge', animated: true }
    ];
  } else if (data.template === 'Xizmatlar') {
    nodes = [
      { id: 'node-1', type: 'start', position: { x: 100, y: 200 }, data: { label: 'Boshlash', emoji: '▶', color: '#10d974' } },
      { id: 'node-2', type: 'message', position: { x: 300, y: 200 }, data: { label: 'Murojaat', emoji: '💬', color: '#1e90ff', text: 'Markazimiz xizmatlari ro\'yxati. Bizga ariza yuborasizmi?', buttons: ['Ariza qoldirish', 'Xizmatlar ro\'yxati'] } },
      { id: 'node-3', type: 'question', position: { x: 580, y: 100 }, data: { label: 'Xizmat turi', emoji: '❓', color: '#a855f7', text: 'Qanday xizmat kerak? (yozing):', variable: 'service_type' } },
      { id: 'node-4', type: 'email', position: { x: 820, y: 100 }, data: { label: 'Email', emoji: '📧', color: '#a855f7', text: 'Siz bilan bog\'lanish uchun Email:', variable: 'client_email' } },
      { id: 'node-5', type: 'message', position: { x: 1060, y: 100 }, data: { label: 'Tasdiqlash', emoji: '💬', color: '#1e90ff', text: 'Rahmat! Ariza qabul qilindi. Xizmat: {service_type}, Email: {client_email}' } },
      { id: 'node-6', type: 'message', position: { x: 580, y: 300 }, data: { label: 'Narxlar', emoji: '💬', color: '#1e90ff', text: '1. Sayt yaratish - 500 000 UZS dan\n2. Logotip dizayn - 150 000 UZS' } }
    ];
    edges = [
      { id: 'e1', source: 'node-1', target: 'node-2', type: 'buttonEdge', animated: true },
      { id: 'e2', source: 'node-2', sourceHandle: 'btn_0', target: 'node-3', type: 'buttonEdge', animated: true },
      { id: 'e3', source: 'node-3', target: 'node-4', type: 'buttonEdge', animated: true },
      { id: 'e4', source: 'node-4', target: 'node-5', type: 'buttonEdge', animated: true },
      { id: 'e5', source: 'node-2', sourceHandle: 'btn_1', target: 'node-6', type: 'buttonEdge', animated: true }
    ];
  } else if (data.template === 'Referral') {
    nodes = [
      { id: 'node-1', type: 'start', position: { x: 100, y: 200 }, data: { label: 'Boshlash', emoji: '▶', color: '#10d974' } },
      { id: 'node-2', type: 'message', position: { x: 300, y: 200 }, data: { label: 'Referal', emoji: '💬', color: '#1e90ff', text: 'Hamkorlik dasturimizga xush kelibsiz!', buttons: ['Mening Balansim', 'Taklif qilish'] } },
      { id: 'node-3', type: 'message', position: { x: 580, y: 100 }, data: { label: 'Balans', emoji: '💬', color: '#1e90ff', text: 'Sizning virtual balansingiz: {balance} UZS' } },
      { id: 'node-4', type: 'topUpBalance', position: { x: 580, y: 250 }, data: { label: 'Balans to\'ldirish', emoji: '💰', color: '#10d974', amount: 5000 } },
      { id: 'node-5', type: 'message', position: { x: 820, y: 250 }, data: { label: 'Yutuq xabari', emoji: '💬', color: '#1e90ff', text: 'Hamkor chaqirildi! Balansingizga 5 000 UZS qo\'shildi!' } }
    ];
    edges = [
      { id: 'e1', source: 'node-1', target: 'node-2', type: 'buttonEdge', animated: true },
      { id: 'e2', source: 'node-2', sourceHandle: 'btn_0', target: 'node-3', type: 'buttonEdge', animated: true },
      { id: 'e3', source: 'node-2', sourceHandle: 'btn_1', target: 'node-4', type: 'buttonEdge', animated: true },
      { id: 'e4', source: 'node-4', target: 'node-5', type: 'buttonEdge', animated: true }
    ];
  } else {
    nodes = [
      { id: '1', type: 'start', position: { x: 100, y: 150 }, data: { label: 'Boshlash', emoji: '▶', color: '#10d974', text: 'Bot ishga tushganda ( /start )' } }
    ];
  }

  // Set default main workflow template
  await setDoc(doc(db, 'bots', ref.id, 'workflows', 'main'), {
    name: 'Main Flow',
    isMain: true,
    nodes: JSON.stringify(nodes),
    edges: JSON.stringify(edges),
    botId: ref.id,
    updatedAt: serverTimestamp(),
  })

  return { id: ref.id, ...data, userId, status: 'active' }
}


export async function updateBot(botId: string, data: Partial<{ name: string; token: string; status: string }>) {
  await updateDoc(doc(db, 'bots', botId), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteBot(botId: string) {
  await deleteDoc(doc(db, 'bots', botId))
}

// ============================================================
// WORKFLOWS
// ============================================================
export async function getWorkflows(botId: string): Promise<any[]> {
  const q = query(collection(db, 'bots', botId, 'workflows'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as any))
}

export async function getWorkflow(botId: string, workflowId: string): Promise<any> {
  const snap = await getDoc(doc(db, 'bots', botId, 'workflows', workflowId))
  if (snap.exists()) return { id: snap.id, ...snap.data() } as any
  return null
}

export async function saveWorkflow(botId: string, workflowId: string, data: { name: string; nodes: any[]; edges: any[]; isMain?: boolean }) {
  await setDoc(doc(db, 'bots', botId, 'workflows', workflowId), {
    ...data,
    nodes: JSON.stringify(data.nodes),
    edges: JSON.stringify(data.edges),
    botId,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

export async function createWorkflow(botId: string, data: { name: string; nodes: any[]; edges: any[]; isMain?: boolean }): Promise<string> {
  const ref = await addDoc(collection(db, 'bots', botId, 'workflows'), {
    ...data,
    nodes: JSON.stringify(data.nodes),
    edges: JSON.stringify(data.edges),
    botId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function deleteWorkflow(botId: string, workflowId: string) {
  await deleteDoc(doc(db, 'bots', botId, 'workflows', workflowId))
}

// ============================================================
// WEBHOOKS
// ============================================================
export async function getWebhooks(botId: string): Promise<any[]> {
  const snap = await getDocs(collection(db, 'bots', botId, 'webhooks'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as any))
}

export async function createWebhook(botId: string, data: { name: string; url: string; method: string }): Promise<any> {
  const ref = await addDoc(collection(db, 'bots', botId, 'webhooks'), {
    ...data,
    active: true,
    botId,
    createdAt: serverTimestamp(),
  })
  return { id: ref.id, ...data, active: true }
}

export async function deleteWebhook(botId: string, webhookId: string) {
  await deleteDoc(doc(db, 'bots', botId, 'webhooks', webhookId))
}

// ============================================================
// CONTACTS
// ============================================================
export async function getContacts(botId: string): Promise<any[]> {
  const q = query(collection(db, 'bots', botId, 'contacts'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as any))
}

// ============================================================
// MESSAGES (Chats)
// ============================================================
export async function getMessages(botId: string, contactId: string): Promise<any[]> {
  const q = query(collection(db, 'bots', botId, 'contacts', contactId, 'messages'), orderBy('createdAt', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as any))
}

// ============================================================
// MINI APPS
// ============================================================
export async function getMiniApps(botId: string): Promise<any[]> {
  const snap = await getDocs(collection(db, 'bots', botId, 'miniapps'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as any))
}

export async function getMiniAppById(botId: string, appId: string): Promise<any> {
  const snap = await getDoc(doc(db, 'bots', botId, 'miniapps', appId))
  if (snap.exists()) return { id: snap.id, ...snap.data() } as any
  return null
}

export async function createMiniApp(botId: string, data: { name: string; type: string; config: any }): Promise<any> {
  const ref = await addDoc(collection(db, 'bots', botId, 'miniapps'), {
    ...data,
    botId,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return { id: ref.id, ...data, botId, active: true }
}

export async function updateMiniApp(botId: string, appId: string, data: any) {
  await updateDoc(doc(db, 'bots', botId, 'miniapps', appId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteMiniApp(botId: string, appId: string) {
  await deleteDoc(doc(db, 'bots', botId, 'miniapps', appId))
}

