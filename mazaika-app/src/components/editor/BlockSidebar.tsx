import { Search } from 'lucide-react'

const CATEGORIES = [
  {
    id: 'basic',
    name: 'Базовые блоки',
    blocks: [
      { type: 'start',   name: 'Старт / Запуск',     emoji: '▶',  color: '#10d974' },
      { type: 'message', name: 'Текстовое сообщение',emoji: '💬', color: '#1e90ff' },
      { type: 'chain',   name: 'Переход (Jump)',      emoji: '📎', color: '#00f5c4' },
      { type: 'timer',   name: 'Задержка',            emoji: '⏱',  color: '#ff4d8d' },
    ]
  },
  {
    id: 'media',
    name: '📸 Медиа блоки',
    blocks: [
      { type: 'photo',    name: 'Отправить фото',     emoji: '🖼️', color: '#0ea5e9' },
      { type: 'video',    name: 'Отправить видео',    emoji: '🎬', color: '#6366f1' },
      { type: 'document', name: 'Отправить файл',     emoji: '📄', color: '#64748b' },
      { type: 'audio',    name: 'Аудио сообщение',    emoji: '🎵', color: '#8b5cf6' },
      { type: 'sticker',  name: 'Стикер',             emoji: '🎭', color: '#ec4899' },
    ]
  },
  {
    id: 'input',
    name: 'Ввод данных пользователя',
    blocks: [
      { type: 'question', name: 'Текстовый вопрос',   emoji: '❓', color: '#a855f7' },
      { type: 'phone',    name: 'Номер телефона',     emoji: '📱', color: '#a855f7' },
      { type: 'email',    name: 'Email адрес',        emoji: '📧', color: '#a855f7' },
      { type: 'location', name: 'Геолокация',         emoji: '📍', color: '#a855f7' },
      { type: 'poll',     name: 'Опрос',              emoji: '📊', color: '#f97316' },
      { type: 'quiz',     name: 'Тест / Викторина',   emoji: '🎯', color: '#10b981' },
    ]
  },
  {
    id: 'logic',
    name: 'Логика и переменные',
    blocks: [
      { type: 'condition',      name: 'Условие (If)',        emoji: '🔀', color: '#ffb830' },
      { type: 'subscription',   name: 'Проверка подписки',   emoji: '📢', color: '#8b5cf6' },
      { type: 'variable',       name: 'Задать переменную',   emoji: '📝', color: '#06b6d4' },
      { type: 'deleteVariable', name: 'Удалить переменную',  emoji: '❌', color: '#ef4444' },
      { type: 'abTest',         name: 'A/B Тест',            emoji: '⚗',  color: '#ec4899' },
      { type: 'javascript',     name: 'JS Код / Формулы',    emoji: '⚙️', color: '#f59e0b' },
    ]
  },
  {
    id: 'ai',
    name: '🤖 AI Блоки',
    blocks: [
      { type: 'aiReply',    name: 'AI Ответ (Чат)',      emoji: '🧠', color: '#a855f7' },
      { type: 'aiAnalyze',  name: 'AI Анализ текста',    emoji: '🔍', color: '#6366f1' },
      { type: 'aiTranslate',name: 'AI Переводчик',       emoji: '🌐', color: '#0ea5e9' },
      { type: 'aiImage',    name: 'AI Генерация картинок',emoji: '🎨', color: '#ec4899' },
    ]
  },
  {
    id: 'notifications',
    name: '📣 Уведомления',
    blocks: [
      { type: 'notifyOperator', name: 'Уведомить оператора', emoji: '👨‍💼', color: '#f97316' },
      { type: 'notifyGroup',    name: 'Сообщение в группу',  emoji: '👥', color: '#0ea5e9' },
      { type: 'notifyChannel',  name: 'Пост в канал',        emoji: '📡', color: '#8b5cf6' },
      { type: 'email_notify',   name: 'Отправить Email',     emoji: '📨', color: '#10b981' },
    ]
  },
  {
    id: 'scheduler',
    name: '⏰ Планировщик',
    blocks: [
      { type: 'schedule',    name: 'Отложенная рассылка (Cron)', emoji: '📅', color: '#6366f1' },
      { type: 'reminder',    name: 'Напоминание',               emoji: '⏰', color: '#f59e0b' },
      { type: 'sequence',    name: 'Авто-воронка',              emoji: '🔁', color: '#10d974' },
    ]
  },
  {
    id: 'referral',
    name: '🤝 Реферальная система',
    blocks: [
      { type: 'refCreate',   name: 'Создать реф-ссылку',  emoji: '🔗', color: '#00f5c4' },
      { type: 'refCheck',    name: 'Проверка реферала',   emoji: '✅', color: '#10d974' },
      { type: 'refLeaders',  name: 'Топ рефералов',       emoji: '🏆', color: '#ffb830' },
    ]
  },
  {
    id: 'integrations',
    name: 'Интеграции & API',
    blocks: [
      { type: 'http',             name: 'HTTP Запрос (API)',     emoji: '🌐', color: '#06b6d4' },
      { type: 'webhook',          name: 'Отправить Webhook',     emoji: '🔗', color: '#f97316' },
      { type: 'googleSheetsAdd',  name: 'Google Sheets: Запись', emoji: '📊', color: '#34a853' },
      { type: 'googleSheetsRead', name: 'Google Sheets: Чтение', emoji: '📖', color: '#34a853' },
      { type: 'getCourse',        name: 'GetCourse',             emoji: '🎓', color: '#1d4ed8' },
      { type: 'yclients',         name: 'Yclients',              emoji: '📅', color: '#059669' },
      { type: 'amocrm',           name: 'AmoCRM',                emoji: '💼', color: '#ef4444' },
      { type: 'bitrix',           name: 'Bitrix24',              emoji: '🏢', color: '#1e90ff' },
    ]
  },
  {
    id: 'payments',
    name: 'Платежные системы',
    blocks: [
      { type: 'payme',       name: 'Payme',             emoji: '💳', color: '#10d974' },
      { type: 'click',       name: 'Click',             emoji: '💳', color: '#00aaff' },
      { type: 'yookassa',    name: 'ЮKassa',            emoji: '💵', color: '#8b5cf6' },
      { type: 'cryptopay',   name: 'Crypto Pay',        emoji: '🪙', color: '#f59e0b' },
      { type: 'stars',       name: 'Telegram Stars ⭐',  emoji: '⭐', color: '#fbbf24' },
      { type: 'uzumbank',    name: 'Uzum Bank',         emoji: '🟣', color: '#7c3aed' },
    ]
  },
  {
    id: 'crm',
    name: 'CRM и Заказы',
    blocks: [
      { type: 'dealStage', name: 'Этап сделки',    emoji: '📈', color: '#eab308' },
      { type: 'assignee',  name: 'Ответственный',  emoji: '👤', color: '#3b82f6' },
      { type: 'cart',      name: 'Корзина',        emoji: '🛒', color: '#ec4899' },
      { type: 'orderList', name: 'Список заказов', emoji: '📦', color: '#8b5cf6' },
    ]
  },
  {
    id: 'contacts',
    name: 'Работа с подписчиками',
    blocks: [
      { type: 'addTag',       name: 'Добавить тег',      emoji: '🏷️', color: '#14b8a6' },
      { type: 'removeTag',    name: 'Удалить тег',       emoji: '🏷️', color: '#ef4444' },
      { type: 'topUpBalance', name: 'Баланс: Пополнить', emoji: '💰', color: '#10d974' },
      { type: 'debitBalance', name: 'Баланс: Списать',   emoji: '💸', color: '#f43f5e' },
      { type: 'deleteUser',   name: 'Удалить пользователя', emoji: '🗑️', color: '#64748b' },
    ]
  },
  {
    id: 'voting',
    name: 'Группы и голосование',
    blocks: [
      { type: 'voterRegister', name: 'Голосование: Запись', emoji: '🗳️', color: '#6366f1' },
      { type: 'voteLeaders',   name: 'Голосование: Лидеры', emoji: '🏆', color: '#eab308' },
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
        <span className="sidebar-title">Блоки бота</span>
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
            placeholder="Поиск блоков..."
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
