import { Search } from 'lucide-react'

const CATEGORIES = [
  {
    id: 'basic',
    name: 'Asosiy bloklar',
    blocks: [
      { type: 'start',   name: 'Boshlash',       emoji: '▶',  color: '#10d974' },
      { type: 'message', name: 'Matn Xabar',     emoji: '💬', color: '#1e90ff' },
      { type: 'chain',   name: 'Zanjir (Jump)',   emoji: '📎', color: '#00f5c4' },
      { type: 'timer',   name: 'Kechikish',       emoji: '⏱',  color: '#ff4d8d' },
    ]
  },
  {
    id: 'media',
    name: '📸 Media Bloklar',
    blocks: [
      { type: 'photo',    name: 'Rasm Yuborish',  emoji: '🖼️', color: '#0ea5e9' },
      { type: 'video',    name: 'Video Yuborish',  emoji: '🎬', color: '#6366f1' },
      { type: 'document', name: 'Fayl Yuborish',  emoji: '📄', color: '#64748b' },
      { type: 'audio',    name: 'Audio Xabar',    emoji: '🎵', color: '#8b5cf6' },
      { type: 'sticker',  name: 'Sticker',        emoji: '🎭', color: '#ec4899' },
    ]
  },
  {
    id: 'input',
    name: 'Foydalanuvchi ma\'lumotlari',
    blocks: [
      { type: 'question', name: 'Matnli Savol',   emoji: '❓', color: '#a855f7' },
      { type: 'phone',    name: 'Telefon Raqam',  emoji: '📱', color: '#a855f7' },
      { type: 'email',    name: 'Email Manzil',   emoji: '📧', color: '#a855f7' },
      { type: 'location', name: 'Lokatsiya',      emoji: '📍', color: '#a855f7' },
      { type: 'poll',     name: 'Ovoz Berish',    emoji: '📊', color: '#f97316' },
      { type: 'quiz',     name: 'Test / Viktorina',emoji: '🎯', color: '#10b981' },
    ]
  },
  {
    id: 'logic',
    name: 'Mantiq va O\'zgaruvchilar',
    blocks: [
      { type: 'condition',      name: 'Shart (If)',       emoji: '🔀', color: '#ffb830' },
      { type: 'subscription',   name: 'Kanalga A\'zolik', emoji: '📢', color: '#8b5cf6' },
      { type: 'variable',       name: 'O\'zgaruvchi',     emoji: '📝', color: '#06b6d4' },
      { type: 'deleteVariable', name: 'O\'zg. O\'chirish', emoji: '❌', color: '#ef4444' },
      { type: 'abTest',         name: 'A/B Test',         emoji: '⚗',  color: '#ec4899' },
      { type: 'javascript',     name: 'JS Hisoblagich',   emoji: '⚙️', color: '#f59e0b' },
    ]
  },
  {
    id: 'ai',
    name: '🤖 AI Bloklar',
    blocks: [
      { type: 'aiReply',    name: 'AI Javob',         emoji: '🧠', color: '#a855f7' },
      { type: 'aiAnalyze',  name: 'AI Tahlil',        emoji: '🔍', color: '#6366f1' },
      { type: 'aiTranslate',name: 'AI Tarjima',       emoji: '🌐', color: '#0ea5e9' },
      { type: 'aiImage',    name: 'AI Rasm Yaratish', emoji: '🎨', color: '#ec4899' },
    ]
  },
  {
    id: 'notifications',
    name: '📣 Bildirishnomalar',
    blocks: [
      { type: 'notifyOperator', name: 'Operator Bildirishnomasi', emoji: '👨‍💼', color: '#f97316' },
      { type: 'notifyGroup',    name: 'Guruhga Xabar',            emoji: '👥', color: '#0ea5e9' },
      { type: 'notifyChannel',  name: 'Kanalga Post',             emoji: '📡', color: '#8b5cf6' },
      { type: 'email_notify',   name: 'Email Yuborish',           emoji: '📨', color: '#10b981' },
    ]
  },
  {
    id: 'scheduler',
    name: '⏰ Rejalashtiruv',
    blocks: [
      { type: 'schedule',    name: 'Rejali Xabar (Cron)',  emoji: '📅', color: '#6366f1' },
      { type: 'reminder',    name: 'Eslatma',              emoji: '⏰', color: '#f59e0b' },
      { type: 'sequence',    name: 'Avtomatik Zanjir',     emoji: '🔁', color: '#10d974' },
    ]
  },
  {
    id: 'referral',
    name: '🤝 Referral tizimi',
    blocks: [
      { type: 'refCreate',   name: 'Ref-link Yaratish',   emoji: '🔗', color: '#00f5c4' },
      { type: 'refCheck',    name: 'Ref Tekshirish',      emoji: '✅', color: '#10d974' },
      { type: 'refLeaders',  name: 'Top Referallar',      emoji: '🏆', color: '#ffb830' },
    ]
  },
  {
    id: 'integrations',
    name: 'Integratsiyalar',
    blocks: [
      { type: 'http',             name: 'HTTP So\'rov',         emoji: '🌐', color: '#06b6d4' },
      { type: 'webhook',          name: 'Webhook Jo\'natish',   emoji: '🔗', color: '#f97316' },
      { type: 'googleSheetsAdd',  name: 'Sheet: Yozish',       emoji: '📊', color: '#34a853' },
      { type: 'googleSheetsRead', name: 'Sheet: O\'qish',      emoji: '📖', color: '#34a853' },
      { type: 'getCourse',        name: 'GetCourse',           emoji: '🎓', color: '#1d4ed8' },
      { type: 'yclients',         name: 'Yclients',            emoji: '📅', color: '#059669' },
      { type: 'amocrm',           name: 'AmoCRM',              emoji: '💼', color: '#ef4444' },
      { type: 'bitrix',           name: 'Bitrix24',            emoji: '🏢', color: '#1e90ff' },
    ]
  },
  {
    id: 'payments',
    name: 'To\'lovlar',
    blocks: [
      { type: 'payme',       name: 'Payme',             emoji: '💳', color: '#10d974' },
      { type: 'click',       name: 'Click',             emoji: '💳', color: '#00aaff' },
      { type: 'yookassa',    name: 'ЮKassa',            emoji: '💵', color: '#8b5cf6' },
      { type: 'cryptopay',   name: 'Crypto Pay',        emoji: '🪙', color: '#f59e0b' },
      { type: 'stars',       name: 'Telegram Stars ⭐', emoji: '⭐', color: '#fbbf24' },
      { type: 'uzumbank',    name: 'Uzum Bank',         emoji: '🟣', color: '#7c3aed' },
    ]
  },
  {
    id: 'crm',
    name: 'CRM va Buyurtmalar',
    blocks: [
      { type: 'dealStage', name: 'Bitim Bosqichi',  emoji: '📈', color: '#eab308' },
      { type: 'assignee',  name: 'Mas\'ul Xodim',   emoji: '👤', color: '#3b82f6' },
      { type: 'cart',      name: 'Savat',           emoji: '🛒', color: '#ec4899' },
      { type: 'orderList', name: 'Buyurtmalar',     emoji: '📦', color: '#8b5cf6' },
    ]
  },
  {
    id: 'contacts',
    name: 'Obunachilar bilan ishlash',
    blocks: [
      { type: 'addTag',       name: 'Teg Qo\'shish',     emoji: '🏷️', color: '#14b8a6' },
      { type: 'removeTag',    name: 'Teg O\'chirish',    emoji: '🏷️', color: '#ef4444' },
      { type: 'topUpBalance', name: 'Balans: Qo\'shish', emoji: '💰', color: '#10d974' },
      { type: 'debitBalance', name: 'Balans: Yechish',  emoji: '💸', color: '#f43f5e' },
      { type: 'deleteUser',   name: 'User O\'chirish',  emoji: '🗑️', color: '#64748b' },
    ]
  },
  {
    id: 'voting',
    name: 'Guruhlar va Ovoz berish',
    blocks: [
      { type: 'voterRegister', name: 'Ovoz: Qo\'shilish', emoji: '🗳️', color: '#6366f1' },
      { type: 'voteLeaders',   name: 'Ovoz: Yetakchilar',emoji: '🏆', color: '#eab308' },
    ]
  }
]

interface BlockSidebarProps {
  open: boolean
  searchQuery: string
  onSearchChange: (q: string) => void
  onClose?: () => void
}

export function BlockSidebar({ open, searchQuery, onSearchChange, onClose }: BlockSidebarProps) {
  const onDragStart = (
    event: React.DragEvent,
    nodeType: string,
    label: string,
    color: string,
    emoji: string
  ) => {
    event.dataTransfer.setData('nodeType', nodeType)
    event.dataTransfer.setData('nodeLabel', label)
    event.dataTransfer.setData('nodeColor', color)
    event.dataTransfer.setData('nodeEmoji', emoji)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <aside className={`block-sidebar ${open ? '' : 'closed'}`}>
      <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="sidebar-title">Bloklar</span>
        {onClose && (
          <button 
            onClick={onClose} 
            className="btn btn-ghost btn-icon" 
            style={{ 
              width: 28, height: 28, borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              color: 'var(--text-muted)', border: 'none', background: 'transparent', 
              cursor: 'pointer', fontSize: 14 
            }}
          >
            ✕
          </button>
        )}
      </div>

      <div className="sidebar-search">
        <div className="search-input-wrapper" style={{ marginTop: '16px' }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="input"
            placeholder="Blok qidirish..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="sidebar-content">
        {CATEGORIES.map(category => {
          const filteredBlocks = category.blocks.filter(b =>
            b.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          if (filteredBlocks.length === 0) return null

          return (
            <div key={category.id} className="category-group">
              <div className="category-title">{category.name}</div>
              {filteredBlocks.map(block => (
                <div
                  key={block.type}
                  className="block-item"
                  style={{ '--block-color': block.color } as React.CSSProperties}
                  draggable
                  onDragStart={(e) => onDragStart(e, block.type, block.name, block.color, block.emoji)}
                >
                  <div className="block-icon-wrapper" style={{ background: `${block.color}22` }}>
                    {block.emoji}
                  </div>
                  <span className="block-item-name">{block.name}</span>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
