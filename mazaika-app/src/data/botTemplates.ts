export const botTemplates = [
  {
    id: "online-shop",
    name: { en: "Online Shop", ru: "Интернет магазин", uz: "Onlayn do'kon" },
    description: "E-commerce bot with product catalog and ordering",
    icon: "🛍️",
    category: "commerce",
    nodes: [
      { id: "node_1", type: "start", position: { x: 100, y: 150 }, data: { label: "Start", emoji: "▶", color: "#10d974", text: "Welcome to our shop! Please select an option below." } },
      { id: "node_2", type: "button_group", position: { x: 100, y: 350 }, data: { label: "Main Menu", emoji: "🔘", color: "#a855f7", buttons: [{ label: "Catalog", nextNodeId: "node_3" }, { label: "My Orders", nextNodeId: "node_4" }] } },
      { id: "node_3", type: "message", position: { x: 400, y: 350 }, data: { label: "Product List", emoji: "💬", color: "#1e90ff", text: "Here is our product catalog:\n1. T-Shirt ($20)\n2. Jeans ($40)" } },
      { id: "node_4", type: "message", position: { x: 400, y: 550 }, data: { label: "Orders", emoji: "💬", color: "#1e90ff", text: "You have no active orders." } },
      { id: "node_5", type: "question", position: { x: 700, y: 350 }, data: { label: "Phone", emoji: "❓", color: "#ffb830", text: "Please enter your phone number to order:", variable: "phone" } },
      { id: "node_6", type: "message", position: { x: 1000, y: 350 }, data: { label: "Confirm", emoji: "💬", color: "#1e90ff", text: "Thank you! Your order has been placed. We will contact you soon." } },
      { id: "node_7", type: "message", position: { x: 1300, y: 350 }, data: { label: "Payment Info", emoji: "💬", color: "#1e90ff", text: "Please send payment to our card: 1234 5678 9012 3456" } }
    ],
    edges: [
      { id: "e1-2", source: "node_1", target: "node_2" },
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
      { id: "node_1", type: "start", position: { x: 100, y: 150 }, data: { label: "Start", emoji: "▶", color: "#10d974", text: "Welcome! Let's book your appointment." } },
      { id: "node_2", type: "button_group", position: { x: 100, y: 350 }, data: { label: "Services", emoji: "🔘", color: "#a855f7", buttons: [{ label: "Haircut", nextNodeId: "node_3" }, { label: "Styling", nextNodeId: "node_3" }] } },
      { id: "node_3", type: "question", position: { x: 400, y: 350 }, data: { label: "Time", emoji: "❓", color: "#ffb830", text: "What time would you like to come?", variable: "time" } },
      { id: "node_4", type: "question", position: { x: 700, y: 350 }, data: { label: "Name", emoji: "❓", color: "#ffb830", text: "Please enter your name:", variable: "name" } },
      { id: "node_5", type: "message", position: { x: 1000, y: 350 }, data: { label: "Confirm", emoji: "💬", color: "#1e90ff", text: "Perfect! Your appointment is confirmed." } }
    ],
    edges: [
      { id: "e1-2", source: "node_1", target: "node_2" },
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
      { id: "node_1", type: "start", position: { x: 100, y: 150 }, data: { label: "Start", emoji: "▶", color: "#10d974", text: "Hello! How can we help you today?" } },
      { id: "node_2", type: "button_group", position: { x: 100, y: 350 }, data: { label: "Menu", emoji: "🔘", color: "#a855f7", buttons: [{ label: "FAQ", nextNodeId: "node_3" }, { label: "Contact Operator", nextNodeId: "node_4" }] } },
      { id: "node_3", type: "message", position: { x: 400, y: 350 }, data: { label: "FAQ", emoji: "💬", color: "#1e90ff", text: "Q: What are your hours?\nA: 9 AM to 6 PM daily." } },
      { id: "node_4", type: "message", position: { x: 400, y: 550 }, data: { label: "Operator", emoji: "💬", color: "#1e90ff", text: "Connecting you to a human operator..." } }
    ],
    edges: [
      { id: "e1-2", source: "node_1", target: "node_2" }
    ]
  },
  {
    id: "restaurant",
    name: { en: "Restaurant", ru: "Ресторан", uz: "Restoran" },
    description: "Food delivery and restaurant menu",
    icon: "🍔",
    category: "food",
    nodes: [
      { id: "node_1", type: "start", position: { x: 100, y: 150 }, data: { label: "Start", emoji: "▶", color: "#10d974", text: "Welcome to our Restaurant!" } },
      { id: "node_2", type: "button_group", position: { x: 100, y: 350 }, data: { label: "Categories", emoji: "🔘", color: "#a855f7", buttons: [{ label: "Pizza", nextNodeId: "node_3" }, { label: "Sushi", nextNodeId: "node_3" }] } },
      { id: "node_3", type: "message", position: { x: 400, y: 350 }, data: { label: "Menu", emoji: "💬", color: "#1e90ff", text: "Select a dish from the menu." } },
      { id: "node_4", type: "button_group", position: { x: 700, y: 350 }, data: { label: "Order", emoji: "🔘", color: "#a855f7", buttons: [{ label: "Delivery", nextNodeId: "node_5" }, { label: "Pickup", nextNodeId: "node_6" }] } },
      { id: "node_5", type: "question", position: { x: 1000, y: 250 }, data: { label: "Address", emoji: "❓", color: "#ffb830", text: "Enter your delivery address:", variable: "address" } },
      { id: "node_6", type: "message", position: { x: 1000, y: 450 }, data: { label: "Pickup", emoji: "💬", color: "#1e90ff", text: "Your order will be ready in 20 minutes." } },
      { id: "node_7", type: "message", position: { x: 1300, y: 250 }, data: { label: "Confirm", emoji: "💬", color: "#1e90ff", text: "Order confirmed!" } }
    ],
    edges: [
      { id: "e1-2", source: "node_1", target: "node_2" },
      { id: "e3-4", source: "node_3", target: "node_4" },
      { id: "e5-7", source: "node_5", target: "node_7" }
    ]
  },
  {
    id: "course-bot",
    name: { en: "Course Bot", ru: "Обучение", uz: "O'quv kursi" },
    description: "Educational courses and enrollment",
    icon: "🎓",
    category: "education",
    nodes: [
      { id: "node_1", type: "start", position: { x: 100, y: 150 }, data: { label: "Start", emoji: "▶", color: "#10d974", text: "Welcome to our Academy!" } },
      { id: "node_2", type: "button_group", position: { x: 100, y: 350 }, data: { label: "Courses", emoji: "🔘", color: "#a855f7", buttons: [{ label: "Web Dev", nextNodeId: "node_3" }, { label: "Python", nextNodeId: "node_3" }] } },
      { id: "node_3", type: "message", position: { x: 400, y: 350 }, data: { label: "Details", emoji: "💬", color: "#1e90ff", text: "This course is 3 months long." } },
      { id: "node_4", type: "question", position: { x: 700, y: 350 }, data: { label: "Enroll", emoji: "❓", color: "#ffb830", text: "Send your name to enroll:", variable: "student_name" } },
      { id: "node_5", type: "message", position: { x: 1000, y: 350 }, data: { label: "Payment", emoji: "💬", color: "#1e90ff", text: "Payment info: $100 via card." } },
      { id: "node_6", type: "message", position: { x: 1300, y: 350 }, data: { label: "Success", emoji: "💬", color: "#1e90ff", text: "You are enrolled!" } }
    ],
    edges: [
      { id: "e1-2", source: "node_1", target: "node_2" },
      { id: "e3-4", source: "node_3", target: "node_4" },
      { id: "e4-5", source: "node_4", target: "node_5" },
      { id: "e5-6", source: "node_5", target: "node_6" }
    ]
  }
];
