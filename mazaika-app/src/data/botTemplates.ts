export const botTemplates = [
  {
    id: "online-shop",
    name: { en: "Online Shop", ru: "Интернет магазин", uz: "Onlayn do'kon" },
    description: "E-commerce bot with product catalog and ordering",
    icon: "🛍️",
    category: "commerce",
    nodes: [
      { id: "node_1", type: "start", position: { x: 100, y: 150 }, data: { label: "Start", emoji: "▶", color: "#10d974", text: "Welcome to our shop! Please select an option below." } },
      { id: "node_2", type: "message", position: { x: 100, y: 350 }, data: { label: "Main Menu", emoji: "💬", color: "#1e90ff", text: "Katalogni tanlang:", buttons: [{ text: "Katalog", nextNodeId: "node_3" }, { text: "Mening buyurtmalarim", nextNodeId: "node_4" }] } },
      { id: "node_3", type: "message", position: { x: 400, y: 350 }, data: { label: "Product List", emoji: "💬", color: "#1e90ff", text: "Mahsulotlar katalogi:\n1. Futbolka ($20)\n2. Jinsi ($40)", buttons: [{ text: "Buyurtma berish", nextNodeId: "node_5" }] } },
      { id: "node_4", type: "message", position: { x: 400, y: 550 }, data: { label: "Orders", emoji: "💬", color: "#1e90ff", text: "Faol buyurtmalaringiz yo'q." } },
      { id: "node_5", type: "question", position: { x: 700, y: 350 }, data: { label: "Phone", emoji: "❓", color: "#ffb830", text: "Buyurtma uchun telefon raqamingizni kiriting:", variable: "phone" } },
      { id: "node_6", type: "message", position: { x: 1000, y: 350 }, data: { label: "Confirm", emoji: "💬", color: "#1e90ff", text: "Rahmat! Buyurtmangiz qabul qilindi. Tez orada siz bilan bog'lanamiz." } },
      { id: "node_7", type: "payme", position: { x: 1300, y: 350 }, data: { label: "To'lov", emoji: "💳", color: "#10d974", price: 250000, description: "Buyurtma uchun to'lov" } }
    ],
    edges: [
      { id: "e1-2", source: "node_1", target: "node_2" },
      { id: "e2-3", source: "node_2", target: "node_3" },
      { id: "e2-4", source: "node_2", target: "node_4" },
      { id: "e3-5", source: "node_3", target: "node_5" },
      { id: "e5-6", source: "node_5", target: "node_6" },
      { id: "e6-7", source: "node_6", target: "node_7" }
    ]
  },
  {
    id: "appointment",
    name: { en: "Booking Service", ru: "Запись на прием", uz: "Qabulga yozilish" },
    description: "Appointment scheduling and booking",
    icon: "📅",
    category: "service",
    nodes: [
      { id: "node_1", type: "start", position: { x: 100, y: 150 }, data: { label: "Start", emoji: "▶", color: "#10d974", text: "Xush kelibsiz! Qabulga yozilish uchun davom etamiz." } },
      { id: "node_2", type: "message", position: { x: 100, y: 350 }, data: { label: "Services", emoji: "💬", color: "#1e90ff", text: "Xizmat turini tanlang:", buttons: [{ text: "Soch turmagi", nextNodeId: "node_3" }, { text: "Ukladka", nextNodeId: "node_3" }] } },
      { id: "node_3", type: "question", position: { x: 400, y: 350 }, data: { label: "Time", emoji: "❓", color: "#ffb830", text: "Qaysi vaqtga kelmoqchisiz?", variable: "time" } },
      { id: "node_4", type: "question", position: { x: 700, y: 350 }, data: { label: "Name", emoji: "❓", color: "#ffb830", text: "Ismingizni kiriting:", variable: "name" } },
      { id: "node_5", type: "message", position: { x: 1000, y: 350 }, data: { label: "Confirm", emoji: "💬", color: "#1e90ff", text: "Ajoyib! Qabulingiz tasdiqlandi." } }
    ],
    edges: [
      { id: "e1-2", source: "node_1", target: "node_2" },
      { id: "e2-3", source: "node_2", target: "node_3" },
      { id: "e3-4", source: "node_3", target: "node_4" },
      { id: "e4-5", source: "node_4", target: "node_5" }
    ]
  },
  {
    id: "support-bot",
    name: { en: "Support Bot", ru: "Бот поддержки", uz: "Qo'llab-quvvatlash boti" },
    description: "FAQ and customer support",
    icon: "🎧",
    category: "support",
    nodes: [
      { id: "node_1", type: "start", position: { x: 100, y: 150 }, data: { label: "Start", emoji: "▶", color: "#10d974", text: "Salom! Sizga qanday yordam bera olamiz?" } },
      { id: "node_2", type: "message", position: { x: 100, y: 350 }, data: { label: "Menu", emoji: "💬", color: "#1e90ff", text: "Menyudan tanlang:", buttons: [{ text: "Ko'p beriladigan savollar", nextNodeId: "node_3" }, { text: "Operator bilan bog'lanish", nextNodeId: "node_4" }] } },
      { id: "node_3", type: "message", position: { x: 400, y: 350 }, data: { label: "FAQ", emoji: "💬", color: "#1e90ff", text: "S: Ish vaqtingiz qanaqa?\nJ: Har kuni 9:00 dan 18:00 gacha." } },
      { id: "node_4", type: "message", position: { x: 400, y: 550 }, data: { label: "Operator", emoji: "💬", color: "#1e90ff", text: "Sizni operator bilan bog'lamoqdamiz..." } }
    ],
    edges: [
      { id: "e1-2", source: "node_1", target: "node_2" },
      { id: "e2-3", source: "node_2", target: "node_3" },
      { id: "e2-4", source: "node_2", target: "node_4" }
    ]
  },
  {
    id: "restaurant",
    name: { en: "Restaurant", ru: "Ресторан", uz: "Restoran" },
    description: "Food delivery and restaurant menu",
    icon: "🍔",
    category: "food",
    nodes: [
      { id: "node_1", type: "start", position: { x: 100, y: 150 }, data: { label: "Start", emoji: "▶", color: "#10d974", text: "Restoranimizga xush kelibsiz!" } },
      { id: "node_2", type: "message", position: { x: 100, y: 350 }, data: { label: "Categories", emoji: "💬", color: "#1e90ff", text: "Kategoriyalardan birini tanlang:", buttons: [{ text: "Pitsa", nextNodeId: "node_3" }, { text: "Sushi", nextNodeId: "node_3" }] } },
      { id: "node_3", type: "message", position: { x: 400, y: 350 }, data: { label: "Menu", emoji: "💬", color: "#1e90ff", text: "Menyudan taom tanlang.", buttons: [{ text: "Yetkazib berish", nextNodeId: "node_4" }, { text: "Olib ketish", nextNodeId: "node_5" }] } },
      { id: "node_4", type: "question", position: { x: 700, y: 350 }, data: { label: "Address", emoji: "❓", color: "#ffb830", text: "Yetkazib berish manzilini kiriting:", variable: "address" } },
      { id: "node_5", type: "message", position: { x: 700, y: 550 }, data: { label: "Pickup", emoji: "💬", color: "#1e90ff", text: "Buyurtmangiz 20 daqiqada tayyor bo'ladi." } },
      { id: "node_6", type: "message", position: { x: 1000, y: 350 }, data: { label: "Confirm", emoji: "💬", color: "#1e90ff", text: "Buyurtma tasdiqlandi!" } }
    ],
    edges: [
      { id: "e1-2", source: "node_1", target: "node_2" },
      { id: "e2-3", source: "node_2", target: "node_3" },
      { id: "e3-4", source: "node_3", target: "node_4" },
      { id: "e3-5", source: "node_3", target: "node_5" },
      { id: "e4-6", source: "node_4", target: "node_6" }
    ]
  },
  {
    id: "course-bot",
    name: { en: "Course Bot", ru: "Обучение", uz: "O'quv kursi" },
    description: "Educational courses and enrollment",
    icon: "🎓",
    category: "education",
    nodes: [
      { id: "node_1", type: "start", position: { x: 100, y: 150 }, data: { label: "Start", emoji: "▶", color: "#10d974", text: "Akademiyamizga xush kelibsiz!" } },
      { id: "node_2", type: "message", position: { x: 100, y: 350 }, data: { label: "Courses", emoji: "💬", color: "#1e90ff", text: "Kursni tanlang:", buttons: [{ text: "Web Dasturlash", nextNodeId: "node_3" }, { text: "Python", nextNodeId: "node_3" }] } },
      { id: "node_3", type: "message", position: { x: 400, y: 350 }, data: { label: "Details", emoji: "💬", color: "#1e90ff", text: "Ushbu kurs 3 oy davom etadi.", buttons: [{ text: "Yozilish", nextNodeId: "node_4" }] } },
      { id: "node_4", type: "question", position: { x: 700, y: 350 }, data: { label: "Enroll", emoji: "❓", color: "#ffb830", text: "Yozilish uchun ismingizni yuboring:", variable: "student_name" } },
      { id: "node_5", type: "message", position: { x: 1000, y: 350 }, data: { label: "Payment", emoji: "💬", color: "#1e90ff", text: "To'lov ma'lumoti: 1,000,000 UZS karta orqali." } },
      { id: "node_6", type: "message", position: { x: 1300, y: 350 }, data: { label: "Success", emoji: "💬", color: "#1e90ff", text: "Siz kursga yozildingiz!" } }
    ],
    edges: [
      { id: "e1-2", source: "node_1", target: "node_2" },
      { id: "e2-3", source: "node_2", target: "node_3" },
      { id: "e3-4", source: "node_3", target: "node_4" },
      { id: "e4-5", source: "node_4", target: "node_5" },
      { id: "e5-6", source: "node_5", target: "node_6" }
    ]
  }
];
