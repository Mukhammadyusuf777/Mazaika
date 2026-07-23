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

export async function createBot(userId: string, data: { name: string; token?: string; template?: string; creationType?: 'bot_only' | 'bot_and_webapp', customNodes?: any[], customEdges?: any[], projectType?: 'bot' | 'site' }): Promise<any> {
  const isSite = data.projectType === 'site';
  
  const ref = await addDoc(collection(db, 'bots'), {
    name: data.name,
    token: isSite ? '' : (data.token || ''),
    projectType: data.projectType || 'bot',
    userId,
    status: isSite ? 'active' : 'active',
    users: 0,
    messages: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  const isWebappEnabled = data.creationType !== 'bot_only';

  // Create workflow template nodes and edges
  let nodes: any[] = [];
  let edges: any[] = [];

  if (data.customNodes && data.customEdges) {
    nodes = data.customNodes;
    edges = data.customEdges;
  } else if (data.template === 'Internet do\'kon') {
    nodes = [
      { id: 'node-1', type: 'start', position: { x: 100, y: 200 }, data: { label: 'Boshlash', emoji: '▶', color: '#10d974' } },
      { 
        id: 'node-2', 
        type: 'message', 
        position: { x: 300, y: 200 }, 
        data: { 
          label: 'Salomlashish', 
          emoji: '💬', 
          color: '#1e90ff', 
          text: isWebappEnabled 
            ? 'Xush kelibsiz! Bizning mini-do\'konda mahsulotlarni tanlash va buyurtma berish uchun pastdagi tugmani bosing:' 
            : 'Xush kelibsiz! Internet do\'konda mahsulotlarni sotib olishingiz mumkin.', 
          buttons: isWebappEnabled 
            ? [`🛒 Do'konni ochish | webapp: https://mazaika.pages.dev/site/${ref.id}`, '📞 Aloqa'] 
            : ['Katalog', 'Savatcha', 'Aloqa'] 
        } 
      },
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
      { 
        id: 'node-2', 
        type: 'message', 
        position: { x: 300, y: 200 }, 
        data: { 
          label: 'Salomlashish', 
          emoji: '💬', 
          color: '#1e90ff', 
          text: isWebappEnabled 
            ? 'Kuryerlik xizmatiga xush kelibsiz! Kuryer chaqirish uchun quyidagi tugmani bosing:' 
            : 'Kuryerlik xizmatiga xush kelibsiz!', 
          buttons: isWebappEnabled 
            ? [`🚚 Kuryer chaqirish | webapp: https://mazaika.pages.dev/site/${ref.id}`] 
            : ['Buyurtma berish', 'Statusni tekshirish'] 
        } 
      },
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
      { 
        id: 'node-2', 
        type: 'message', 
        position: { x: 300, y: 200 }, 
        data: { 
          label: 'Xabar', 
          emoji: '💬', 
          color: '#1e90ff', 
          text: isWebappEnabled 
            ? 'Restoranimizga xush kelibsiz! Stol bron qilish va menyuni ko\'rish uchun quyidagi tugmani bosing:' 
            : 'Restoranimizga xush kelibsiz! Stol bron qilishni xohlaysizmi?', 
          buttons: isWebappEnabled 
            ? [`🍽 Stol band qilish | webapp: https://mazaika.pages.dev/site/${ref.id}`] 
            : ['Stol bron qilish', 'Menyu'] 
        } 
      },
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
      { 
        id: 'node-2', 
        type: 'message', 
        position: { x: 300, y: 200 }, 
        data: { 
          label: 'Kurslar', 
          emoji: '💬', 
          color: '#1e90ff', 
          text: isWebappEnabled 
            ? 'Dasturlash akademiyamizga xush kelibsiz! Kurslarni tanlash va cashback balansingizni tekshirish uchun pastdagi tugmani bosing:' 
            : 'Dasturlash kurslarimizga ro\'yxatdan o\'ting!', 
          buttons: isWebappEnabled 
            ? [`🎓 Kurslar ro'yxati | webapp: https://mazaika.pages.dev/site/${ref.id}`] 
            : ['Python Kursi', 'VIP Statusini tekshirish'] 
        } 
      },
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
      { 
        id: 'node-2', 
        type: 'message', 
        position: { x: 300, y: 200 }, 
        data: { 
          label: 'Murojaat', 
          emoji: '💬', 
          color: '#1e90ff', 
          text: isWebappEnabled 
            ? 'Professional xizmatlar arizasini to\'ldirish uchun pastdagi tugmani bosing:' 
            : 'Markazimiz xizmatlari ro\'yxati. Bizga ariza yuborasizmi?', 
          buttons: isWebappEnabled 
            ? [`⚙️ Arizani yuborish | webapp: https://mazaika.pages.dev/site/${ref.id}`] 
            : ['Ariza qoldirish', 'Xizmatlar ro\'yxati'] 
        } 
      },
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
      { 
        id: 'node-2', 
        type: 'message', 
        position: { x: 300, y: 200 }, 
        data: { 
          label: 'Referal', 
          emoji: '💬', 
          color: '#1e90ff', 
          text: isWebappEnabled 
            ? 'Hamkorlik dasturi va so\'rovnomaga xush kelibsiz! Ovoz berish uchun quyidagi tugmani bosing:' 
            : 'Hamkorlik dasturimizga xush kelibsiz!', 
          buttons: isWebappEnabled 
            ? [`🗳 So'rovnomada qatnashish | webapp: https://mazaika.pages.dev/site/${ref.id}`] 
            : ['Mening Balansim', 'Taklif qilish'] 
        } 
      },
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

  // Pre-configure WebApp Blocks layout if requested
  if (isWebappEnabled) {
    let blocks: any[] = [];
    if (data.template === 'Internet do\'kon') {
      blocks = [
        { id: '1', type: 'hero', title: 'Smart Internet Do\'kon', subtitle: 'Bizning katalogdan eng shirin taomlarni topishingiz mumkin. Buyurtma bering va uyingizga yetkazib beramiz!', ctaText: 'Katalogga o\'tish', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800' },
        { id: '2', type: 'about', title: 'Biz haqimizda', text: 'Bizning pitsareyamiz 10 yildan ortiq vaqtdan beri mijozlarga faqat yangi va eng sifatli masalliqlardan pitsa tayyorlab yetkazib beradi.' },
        { id: '3', type: 'catalog', title: 'Pitsalar Menyusi', items: [
          { id: 'item_1', name: 'Pizza Margherita', price: 45000, desc: 'Pomidor sousi, motsarella, rayhon va zaytun moyi.', img: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=150' },
          { id: 'item_2', name: 'Pizza Pepperoni', price: 55000, desc: 'Pomidor sousi, achchiq pepperoni, motsarella.', img: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=150' },
          { id: 'item_3', name: 'Coca-Cola 1.5L', price: 12000, desc: 'Muzdek tetiklantiruvchi ichimlik.', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=150' }
        ] },
        { id: '4', type: 'contacts', title: 'Biz bilan bog\'lanish', phone: '+998 90 123 45 67', telegram: 'MazaikaSupportBot' }
      ];
    } else if (data.template === 'Yetkazib berish') {
      blocks = [
        { id: '1', type: 'hero', title: 'Kuryer Yetkazib berish xizmati', subtitle: 'Hujjatlar, buyumlar yoki oziq-ovqatlarni shaharning istalgan nuqtasiga tezkor kuryerlarimiz orqali yetkazamiz!', ctaText: 'Kuryer chaqirish', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800' },
        { id: '2', type: 'form', title: 'Tezkor kuryer chaqirish', fields: [
          { name: 'name', label: 'Ismingiz', type: 'text', required: true },
          { name: 'phone', label: 'Telefon raqamingiz', type: 'tel', required: true },
          { name: 'pickup_address', label: 'Yukni olish manzili', type: 'text', required: true },
          { name: 'delivery_address', label: 'Yetkazish manzili', type: 'text', required: true },
          { name: 'comment', label: 'Kuryer uchun izoh', type: 'textarea', required: false }
        ] },
        { id: '3', type: 'contacts', title: 'Murojaat uchun', phone: '+998 90 999 88 77', telegram: 'DeliverySupport' }
      ];
    } else if (data.template === 'Restoran') {
      blocks = [
        { id: '1', type: 'hero', title: 'Premium Milliy Taomlar', subtitle: 'Sharqona shinamlik va lazzatli taomlar maskaniga xush kelibsiz! Stollar va kabinalarni bron qilishingiz mumkin.', ctaText: 'Stol band qilish', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800' },
        { id: '2', type: 'catalog', title: 'Bizning shohona menyu', items: [
          { id: 'item_r1', name: 'Shohona Palov', price: 35000, desc: 'Dombira guruch, barra go\'sht va bedana tuxumi bilan.', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150' },
          { id: 'item_r2', name: 'Tandir Kebab', price: 75000, desc: 'Tandirda pishgan yumshoq qo\'y go\'shti.', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=150' }
        ] },
        { id: '3', type: 'form', title: 'Stol yoki kabina bron qilish', fields: [
          { name: 'name', label: 'Ismingiz', type: 'text', required: true },
          { name: 'phone', label: 'Telefoningiz', type: 'tel', required: true },
          { name: 'guests', label: 'Mehmonlar soni', type: 'number', required: true },
          { name: 'datetime', label: 'Sana va vaqt', type: 'text', required: true }
        ] }
      ];
    } else if (data.template === 'Kurs savdo') {
      blocks = [
        { id: '1', type: 'hero', title: 'Mazaika IT Akademiyasi', subtitle: 'Noldan boshlab dasturchi kasbini egallang! Darslar oson va qiziqarli tilda o\'rgatiladi.', ctaText: 'Kurslar ro\'yxati', img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800' },
        { id: '2', type: 'catalog', title: 'Akademiya kurslari', items: [
          { id: 'item_c1', name: 'Python Boshlang\'ich', price: 150000, desc: 'Python tili asoslari va Telegram botlar yaratish.', img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150' },
          { id: 'item_c2', name: 'Frontend React.js', price: 250000, desc: 'Veb-saytlar yaratish va React frameworki.', img: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=150' }
        ] },
        { id: '3', type: 'loyalty', title: 'Sizning cashback hisobingiz' },
        { id: '4', type: 'contacts', title: 'Sertifikat va savollar', phone: '+998 71 200 00 20', telegram: 'AcademySupport' }
      ];
    } else if (data.template === 'Xizmatlar') {
      blocks = [
        { id: '1', type: 'hero', title: 'Professional Konsalting va Saytlar', subtitle: 'Kompaniyangiz uchun saytlar yaratish, SMM va logotiplarni noldan sifatli tayyorlaymiz!', ctaText: 'Ariza qoldirish', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800' },
        { id: '2', type: 'form', title: 'Xizmat turi va arizalar', fields: [
          { name: 'name', label: 'Kompaniya nomi', type: 'text', required: true },
          { name: 'phone', label: 'Bog\'lanish telefoni', type: 'tel', required: true },
          { name: 'service', label: 'Kerakli xizmat (SMM, Sayt, Dizayn)', type: 'text', required: true }
        ] }
      ];
    } else if (data.template === 'Referral') {
      blocks = [
        { id: '1', type: 'hero', title: 'Smart Ovoz Berish Tizimi', subtitle: 'Jamoatchilik tanlovi yoki eng faol loyihani aniqlash so\'rovnomasi.', ctaText: 'Nomzodlar ro\'yxati', img: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800' },
        { id: '2', type: 'voting', title: 'Mazaika Eng Faol Nomzodi', candidates: ['Nomzod A', 'Nomzod B', 'Nomzod C'] },
        { id: '3', type: 'loyalty', title: 'Sizning bonus hisobingiz' }
      ];
    } else {
      blocks = [
        { id: '1', type: 'hero', title: 'Mening yangi loyiham', subtitle: 'Konstruktor yordamida ushbu saytni o\'zingizga moslashtiring!', ctaText: 'Aloqa', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800' },
        { id: '2', type: 'about', title: 'Biz haqimizda', text: 'Bu yerga o\'zingiz yoki jamoangiz haqida batafsil ma\'lumot yozishingiz mumkin.' },
        { id: '3', type: 'contacts', title: 'Bog\'lanish', phone: '+998 90 123 45 67', telegram: 'MazaikaSupportBot' }
      ];
    }

    if (blocks.length > 0) {
      await setDoc(doc(db, 'bots', ref.id, 'site', 'config'), {
        theme: 'glassmorphism',
        themeColor: '#1e90ff',
        blocks,
        updatedAt: serverTimestamp()
      });

      // Enable WebApp button on bot document by default!
      await updateDoc(doc(db, 'bots', ref.id), {
        menuButtonEnabled: true,
        menuButtonText: 'Mini App',
        menuButtonUrl: `https://mazaika.pages.dev/site/${ref.id}`
      });

      // Create matching Mini App so it appears under 'Mini Ilovalar' tab
      let appName = 'Mini Ilova';
      let appType: 'store' | 'form' | 'wheel' = 'store';
      let appConfig: any = {};

      if (data.template === 'Internet do\'kon') {
        appName = 'Pitsa Do\'koni';
        appType = 'store';
        appConfig = {
          themeColor: '#1e90ff',
          items: [
            { id: 'item_1', name: 'Pizza Margherita', desc: 'Pomidor sousi, motsarella, rayhon va zaytun moyi.', price: 45000, img: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=150' },
            { id: 'item_2', name: 'Pizza Pepperoni', desc: 'Pomidor sousi, achchiq pepperoni, motsarella.', price: 55000, img: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=150' },
            { id: 'item_3', name: 'Coca-Cola 1.5L', desc: 'Muzdek tetiklantiruvchi ichimlik.', price: 12000, img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=150' }
          ]
        };
      } else if (data.template === 'Yetkazib berish') {
        appName = 'Tezkor Kuryer';
        appType = 'form';
        appConfig = {
          themeColor: '#1e90ff',
          title: 'Tezkor kuryer chaqirish',
          desc: 'Buyurtmani to\'ldiring va kuryer tezda manzilga yetib boradi',
          fields: [
            { name: 'name', label: 'Ismingiz', type: 'text', required: true },
            { name: 'phone', label: 'Telefon raqamingiz', type: 'tel', required: true },
            { name: 'pickup_address', label: 'Yukni olish manzili', type: 'text', required: true },
            { name: 'delivery_address', label: 'Yetkazish manzili', type: 'text', required: true },
            { name: 'comment', label: 'Kuryer uchun izoh', type: 'textarea', required: false }
          ]
        };
      } else if (data.template === 'Restoran') {
        appName = 'Stol Bron Qilish';
        appType = 'form';
        appConfig = {
          themeColor: '#1e90ff',
          title: 'Stol yoki kabina bron qilish',
          desc: 'Tashrif buyurish uchun stol band qiling',
          fields: [
            { name: 'name', label: 'Ismingiz', type: 'text', required: true },
            { name: 'phone', label: 'Telefoningiz', type: 'tel', required: true },
            { name: 'guests', label: 'Mehmonlar soni', type: 'number', required: true },
            { name: 'datetime', label: 'Sana va vaqt', type: 'text', required: true }
          ]
        };
      } else if (data.template === 'Kurs savdo') {
        appName = 'IT Kurslar';
        appType = 'store';
        appConfig = {
          themeColor: '#1e90ff',
          items: [
            { id: 'item_c1', name: 'Python Boshlang\'ich', desc: 'Python tili asoslari va Telegram botlar yaratish.', price: 150000, img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150' },
            { id: 'item_c2', name: 'Frontend React.js', desc: 'Veb-saytlar yaratish va React frameworki.', price: 250000, img: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=150' }
          ]
        };
      } else if (data.template === 'Xizmatlar') {
        appName = 'Ariza Qoldirish';
        appType = 'form';
        appConfig = {
          themeColor: '#1e90ff',
          title: 'Xizmat turi va arizalar',
          desc: 'Biznesingiz uchun eng yaxshi xizmatlar arizasi',
          fields: [
            { name: 'name', label: 'Kompaniya nomi', type: 'text', required: true },
            { name: 'phone', label: 'Bog\'lanish telefoni', type: 'tel', required: true },
            { name: 'service', label: 'Kerakli xizmat (SMM, Sayt, Dizayn)', type: 'text', required: true }
          ]
        };
      } else if (data.template === 'Referral') {
        appName = 'Omad G\'ildiragi';
        appType = 'wheel';
        appConfig = {
          themeColor: '#1e90ff',
          title: 'Omad G\'ildiragi',
          desc: 'G\'ildirakni aylantiring va kafolatlangan sovg\'alardan birini yutib oling!',
          prizes: [
            { id: '1', label: '10% Chegirma', color: '#1e90ff' },
            { id: '2', label: 'Bepul Pitsa', color: '#ec4899' },
            { id: '3', label: 'Sovg\'a quti', color: '#8b5cf6' },
            { id: '4', label: 'Keshbek 5000 UZS', color: '#10d974' },
            { id: '5', label: 'Yana bir bor', color: '#ffb830' },
            { id: '6', label: 'Kupon 20%', color: '#f43f5e' }
          ]
        };
      } else {
        appName = 'Mini Ilova';
        appType = 'store';
        appConfig = {
          themeColor: '#1e90ff',
          items: [
            { id: 'item_1', name: 'Birinchi mahsulot', desc: 'Tavsif', price: 10000, img: '' }
          ]
        };
      }

      await addDoc(collection(db, 'bots', ref.id, 'miniapps'), {
        name: appName,
        type: appType,
        config: appConfig,
        createdAt: serverTimestamp()
      });
    }
  }

  return { id: ref.id, ...data, userId, status: 'active' }
}



export async function updateBot(
  botId: string,
  data: Partial<{
    name: string;
    token: string;
    status: string;
    menuButtonEnabled: boolean;
    menuButtonText: string;
    menuButtonUrl: string;
  }>
) {
  await updateDoc(doc(db, 'bots', botId), { ...data, updatedAt: serverTimestamp() })
}


export async function deleteBot(botId: string) {
  try {
    // 1. Delete site config document
    await deleteDoc(doc(db, 'bots', botId, 'site', 'config')).catch(() => {})

    // 2. Delete all docs in workflows subcollection
    const wfSnap = await getDocs(collection(db, 'bots', botId, 'workflows')).catch(() => null)
    if (wfSnap) {
      for (const d of wfSnap.docs) {
        await deleteDoc(d.ref).catch(() => {})
      }
    }

    // 3. Delete all docs in miniapps subcollection
    const appSnap = await getDocs(collection(db, 'bots', botId, 'miniapps')).catch(() => null)
    if (appSnap) {
      for (const d of appSnap.docs) {
        await deleteDoc(d.ref).catch(() => {})
      }
    }

    // 4. Delete all docs in contacts subcollection
    const cSnap = await getDocs(collection(db, 'bots', botId, 'contacts')).catch(() => null)
    if (cSnap) {
      for (const d of cSnap.docs) {
        await deleteDoc(d.ref).catch(() => {})
      }
    }

    // 5. Delete all docs in webhooks subcollection
    const wSnap = await getDocs(collection(db, 'bots', botId, 'webhooks')).catch(() => null)
    if (wSnap) {
      for (const d of wSnap.docs) {
        await deleteDoc(d.ref).catch(() => {})
      }
    }
  } catch (e) {
    console.error("Error wiping subcollections for bot:", e)
  }

  // 6. Delete main bot document
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

  // Bidirectional Synchronization: Sync Mini App settings back to Site Config blocks!
  try {
    const siteConfigRef = doc(db, 'bots', botId, 'site', 'config')
    const siteSnap = await getDoc(siteConfigRef)
    if (siteSnap.exists()) {
      const siteData = siteSnap.data()
      let blocks = siteData.blocks || []
      
      const appSnap = await getDoc(doc(db, 'bots', botId, 'miniapps', appId))
      if (appSnap.exists()) {
        const appData = appSnap.data()
        const appType = appData.type
        
        let updated = false
        blocks = blocks.map((block: any) => {
          if (appType === 'store' && block.type === 'catalog') {
            updated = true
            return {
              ...block,
              title: data.name || block.title,
              items: data.config?.items || block.items || []
            }
          }
          if (appType === 'form' && block.type === 'form') {
            updated = true
            return {
              ...block,
              title: data.name || block.title,
              fields: data.config?.fields || block.fields || []
            }
          }
          return block
        })

        if (updated) {
          await setDoc(siteConfigRef, {
            ...siteData,
            blocks,
            updatedAt: serverTimestamp()
          }, { merge: true })
        }
      }
    }
  } catch (e) {
    console.error("Failed to sync mini-app to site config:", e)
  }
}

export async function deleteMiniApp(botId: string, appId: string) {
  await deleteDoc(doc(db, 'bots', botId, 'miniapps', appId))
}

// ============================================================
// SITE CONFIG (No-Code Website Builder)
// ============================================================
export async function getSiteConfig(botId: string): Promise<any> {
  const snap = await getDoc(doc(db, 'bots', botId, 'site', 'config'))
  if (snap.exists()) return snap.data()
  return null
}

export async function saveSiteConfig(botId: string, config: any): Promise<void> {
  await setDoc(doc(db, 'bots', botId, 'site', 'config'), {
    ...config,
    updatedAt: serverTimestamp(),
  }, { merge: true })

  // Bidirectional Synchronization: Sync Site Config blocks back to Mini Apps!
  try {
    const miniappsRef = collection(db, 'bots', botId, 'miniapps')
    const snap = await getDocs(miniappsRef)
    
    for (const d of snap.docs) {
      const appData = d.data()
      const appType = appData.type
      
      if (appType === 'store') {
        const catalogBlock = config.blocks?.find((b: any) => b.type === 'catalog')
        if (catalogBlock) {
          await updateDoc(doc(db, 'bots', botId, 'miniapps', d.id), {
            name: catalogBlock.title || appData.name,
            config: {
              ...appData.config,
              items: catalogBlock.items || []
            },
            updatedAt: serverTimestamp()
          })
        }
      } else if (appType === 'form') {
        const formBlock = config.blocks?.find((b: any) => b.type === 'form')
        if (formBlock) {
          await updateDoc(doc(db, 'bots', botId, 'miniapps', d.id), {
            name: formBlock.title || appData.name,
            config: {
              ...appData.config,
              fields: formBlock.fields || []
            },
            updatedAt: serverTimestamp()
          })
        }
      }
    }
  } catch (e) {
    console.error("Failed to sync site config back to mini-apps:", e)
  }
}


