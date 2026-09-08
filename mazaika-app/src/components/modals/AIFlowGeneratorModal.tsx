import { useState, useRef } from 'react'
import { X, Sparkles, Mic, MicOff, Loader2, Zap } from 'lucide-react'
import './AIFlowGeneratorModal.css'

interface AIFlowGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyFlow: (nodes: any[], edges: any[]) => void
}

const FLOW_PRESETS = [
  {
    id: 'shop',
    icon: '🛒',
    title: 'Интернет-магазин',
    desc: 'Приветствие, каталог товаров, оформление заказа и оплата через Payme',
    prompt: 'Создай воронку интернет-магазина с каталогом товаров, вопросом номера телефона и оплатой Payme'
  },
  {
    id: 'booking',
    icon: '📅',
    title: 'Запись на прием',
    desc: 'Выбор услуги, даты/времени, сбор контактов и подтверждение заявки',
    prompt: 'Создай бота записи на услуги с выбором времени, запросом имени и телефона'
  },
  {
    id: 'support',
    icon: '💬',
    title: 'Служба заботы & FAQ',
    desc: 'Частые вопросы, база знаний и кнопка вызова живого оператора',
    prompt: 'Создай бота службы поддержки с меню частых вопросов и связью с оператором'
  },
  {
    id: 'leadgen',
    icon: '🎯',
    title: 'Квиз и Лидогенерация',
    desc: 'Опрос клиента из 3 вопросов, сегментация и выдача скидки за контакт',
    prompt: 'Создай квиз-бота для сбора лидов с вопросами и промокодом'
  },
  {
    id: 'delivery',
    icon: '🍕',
    title: 'Кафе и Доставка еды',
    desc: 'Меню блюд, выбор адреса доставки, подсчет стоимости и заказ',
    prompt: 'Создай бота доставки еды с меню пиццы и бургеров и запросом адреса'
  }
]

export default function AIFlowGeneratorModal({
  isOpen,
  onClose,
  onApplyFlow
}: AIFlowGeneratorModalProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  // Voice Input ($0.00 Web Speech API)
  const toggleVoice = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRec) {
      alert('Голосовой ввод поддерживается в браузерах Chrome / Edge / Safari')
      return
    }
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop()
      setIsListening(false)
      return
    }
    try {
      const recognition = new SpeechRec()
      recognition.lang = 'ru-RU'
      recognition.continuous = false
      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onerror = () => setIsListening(false)
      recognition.onresult = (e: any) => {
        const text = e.results?.[0]?.[0]?.transcript
        if (text) {
          setPrompt(prev => (prev ? prev + ' ' + text : text))
        }
      }
      recognitionRef.current = recognition
      recognition.start()
    } catch {
      setIsListening(false)
    }
  }

  // Generates ReactFlow nodes & edges for a specific concept
  const buildFlowFromPrompt = (userPrompt: string) => {
    setIsGenerating(true)

    setTimeout(() => {
      let nodes: any[] = []
      let edges: any[] = []
      const lower = userPrompt.toLowerCase()

      if (lower.includes('магазин') || lower.includes('товар') || lower.includes('shop')) {
        nodes = [
          { id: 'node-1', type: 'start', position: { x: 100, y: 220 }, data: { label: 'Boshlash', emoji: '▶', color: '#10d974', text: 'Добро пожаловать в наш магазин! 👋 Выберите категорию товаров ниже:' } },
          { id: 'node-2', type: 'message', position: { x: 420, y: 220 }, data: { label: 'Главное Меню', emoji: '💬', color: '#1e90ff', text: 'Каталог популярных товаров со скидкой до 20%:', buttons: ['📱 Смартфоны', '🎧 Аксессуары', '📞 Связаться с нами'] } },
          { id: 'node-3', type: 'message', position: { x: 740, y: 100 }, data: { label: 'Каталог Смартфонов', emoji: '📱', color: '#0ea5e9', text: 'В наличии флагманские модели:\n• iPhone 16 Pro — 12 500 000 UZS\n• Samsung S24 Ultra — 11 800 000 UZS', buttons: ['Оформить заказ', 'Назад в меню'] } },
          { id: 'node-4', type: 'question', position: { x: 1060, y: 100 }, data: { label: 'Запрос Телефона', emoji: '❓', color: '#ffb830', text: 'Для оформления заказа введите ваш номер телефона:', variable: 'customer_phone' } },
          { id: 'node-5', type: 'payme', position: { x: 1380, y: 100 }, data: { label: 'Оплата Payme', emoji: '💳', color: '#10d974', title: 'Оплата смартфона', price: 12500000 } },
          { id: 'node-6', type: 'operator', position: { x: 740, y: 380 }, data: { label: 'Служба Заботы', emoji: '👨‍💼', color: '#a855f7', text: 'Оператор на связи! Напишите ваш вопрос, мы ответим в течение 2 минут.' } }
        ]
        edges = [
          { id: 'e1', source: 'node-1', target: 'node-2', type: 'buttonEdge', animated: true },
          { id: 'e2', source: 'node-2', sourceHandle: 'btn_0', target: 'node-3', type: 'buttonEdge', animated: true },
          { id: 'e3', source: 'node-2', sourceHandle: 'btn_2', target: 'node-6', type: 'buttonEdge', animated: true },
          { id: 'e4', source: 'node-3', sourceHandle: 'btn_0', target: 'node-4', type: 'buttonEdge', animated: true },
          { id: 'e5', source: 'node-3', sourceHandle: 'btn_1', target: 'node-2', type: 'buttonEdge', animated: true },
          { id: 'e6', source: 'node-4', target: 'node-5', type: 'buttonEdge', animated: true }
        ]
      } else if (lower.includes('запис') || lower.includes('врач') || lower.includes('услуг') || lower.includes('booking')) {
        nodes = [
          { id: 'node-1', type: 'start', position: { x: 100, y: 220 }, data: { label: 'Boshlash', emoji: '▶', color: '#10d974', text: 'Здравствуйте! Онлайн-запись 24/7. Выберите желаемую услугу:' } },
          { id: 'node-2', type: 'message', position: { x: 420, y: 220 }, data: { label: 'Выбор Услуги', emoji: '💬', color: '#1e90ff', text: 'Доступные специалисты:', buttons: ['Мастер Анна (Стрижка)', 'Мастер Тимур (Барбер)', 'Прайс-лист'] } },
          { id: 'node-3', type: 'question', position: { x: 740, y: 150 }, data: { label: 'Выбор Времени', emoji: '❓', color: '#ffb830', text: 'На какой день и удобное время вы хотите записаться? (Например: Завтра в 14:00)', variable: 'booking_time' } },
          { id: 'node-4', type: 'question', position: { x: 1060, y: 150 }, data: { label: 'Номер Телефона', emoji: '📞', color: '#ffb830', text: 'Введите ваш номер телефона для отправки SMS-напоминания:', variable: 'client_phone' } },
          { id: 'node-5', type: 'message', position: { x: 1380, y: 150 }, data: { label: 'Подтверждение', emoji: '✅', color: '#10b981', text: '🎉 Вы успешно записаны! Наш администратор свяжется с вами по номеру {client_phone}. До встречи!' } }
        ]
        edges = [
          { id: 'e1', source: 'node-1', target: 'node-2', type: 'buttonEdge', animated: true },
          { id: 'e2', source: 'node-2', sourceHandle: 'btn_0', target: 'node-3', type: 'buttonEdge', animated: true },
          { id: 'e3', source: 'node-2', sourceHandle: 'btn_1', target: 'node-3', type: 'buttonEdge', animated: true },
          { id: 'e4', source: 'node-3', target: 'node-4', type: 'buttonEdge', animated: true },
          { id: 'e5', source: 'node-4', target: 'node-5', type: 'buttonEdge', animated: true }
        ]
      } else if (lower.includes('поддержк') || lower.includes('faq') || lower.includes('оператор')) {
        nodes = [
          { id: 'node-1', type: 'start', position: { x: 100, y: 220 }, data: { label: 'Boshlash', emoji: '▶', color: '#10d974', text: 'Приветствуем в центре заботы! Чем мы можем вам помочь?' } },
          { id: 'node-2', type: 'message', position: { x: 420, y: 220 }, data: { label: 'Меню FAQ', emoji: '💬', color: '#1e90ff', text: 'Выберите интересующий вопрос:', buttons: ['📦 Доставка и сроки', '💳 Способы оплаты', '👨‍💼 Связаться с оператором'] } },
          { id: 'node-3', type: 'message', position: { x: 740, y: 100 }, data: { label: 'Доставка', emoji: '📦', color: '#0ea5e9', text: 'Доставка по городу осуществляется в течение 24 часов бесплатно при заказе от 200 000 UZS.', buttons: ['Назад к вопросам'] } },
          { id: 'node-4', type: 'message', position: { x: 740, y: 260 }, data: { label: 'Оплата', emoji: '💳', color: '#10b981', text: 'Мы принимаем Payme, Click, Uzum, а также наличными при получении.', buttons: ['Назад к вопросам'] } },
          { id: 'node-5', type: 'operator', position: { x: 740, y: 420 }, data: { label: 'Оператор', emoji: '👨‍💼', color: '#a855f7', text: 'Оператор службы поддержки подключен. Напишите ваш вопрос:' } }
        ]
        edges = [
          { id: 'e1', source: 'node-1', target: 'node-2', type: 'buttonEdge', animated: true },
          { id: 'e2', source: 'node-2', sourceHandle: 'btn_0', target: 'node-3', type: 'buttonEdge', animated: true },
          { id: 'e3', source: 'node-2', sourceHandle: 'btn_1', target: 'node-4', type: 'buttonEdge', animated: true },
          { id: 'e4', source: 'node-2', sourceHandle: 'btn_2', target: 'node-5', type: 'buttonEdge', animated: true },
          { id: 'e5', source: 'node-3', sourceHandle: 'btn_0', target: 'node-2', type: 'buttonEdge', animated: true },
          { id: 'e6', source: 'node-4', sourceHandle: 'btn_0', target: 'node-2', type: 'buttonEdge', animated: true }
        ]
      } else {
        // Universal Smart Flow
        nodes = [
          { id: 'node-1', type: 'start', position: { x: 100, y: 220 }, data: { label: 'Boshlash', emoji: '▶', color: '#10d974', text: `Здравствуйте! Рады видеть вас. Чем бот может вам помочь по запросу: "${userPrompt}"?` } },
          { id: 'node-2', type: 'message', position: { x: 420, y: 220 }, data: { label: 'Меню опций', emoji: '💬', color: '#1e90ff', text: 'Выберите удобный вариант:', buttons: ['✨ Узнать подробнее', '📝 Оставить заявку', '📞 Связаться'] } },
          { id: 'node-3', type: 'question', position: { x: 740, y: 150 }, data: { label: 'Заявка', emoji: '❓', color: '#ffb830', text: 'Введите ваше имя и номер телефона, мы мгновенно свяжемся с вами:', variable: 'user_lead' } },
          { id: 'node-4', type: 'message', position: { x: 1060, y: 150 }, data: { label: 'Спасибо!', emoji: '✅', color: '#10b981', text: 'Спасибо! Ваша заявка принята в обработку. Менеджер ответит вам прямо в этот чат.' } },
          { id: 'node-5', type: 'operator', position: { x: 740, y: 380 }, data: { label: 'Оператор', emoji: '👨‍💼', color: '#a855f7', text: 'Оператор службы поддержки на связи. Задайте ваш вопрос.' } }
        ]
        edges = [
          { id: 'e1', source: 'node-1', target: 'node-2', type: 'buttonEdge', animated: true },
          { id: 'e2', source: 'node-2', sourceHandle: 'btn_1', target: 'node-3', type: 'buttonEdge', animated: true },
          { id: 'e3', source: 'node-2', sourceHandle: 'btn_2', target: 'node-5', type: 'buttonEdge', animated: true },
          { id: 'e4', source: 'node-3', target: 'node-4', type: 'buttonEdge', animated: true }
        ]
      }

      setIsGenerating(false)
      onApplyFlow(nodes, edges)
      onClose()
    }, 600)
  }

  if (!isOpen) return null

  return (
    <div className="flow-gen-overlay" onClick={onClose}>
      <div className="flow-gen-modal" onClick={e => e.stopPropagation()}>
        <div className="flow-gen-header">
          <div className="flow-gen-title-wrap">
            <div className="flow-gen-icon">
              <Sparkles size={18} />
            </div>
            <div>
              <h3>AI Генератор Воронки Бота</h3>
              <p>Опишите логику бота, и нейросеть мгновенно создаст соединенные блоки на холсте</p>
            </div>
          </div>
          <button className="flow-gen-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="flow-gen-body">
          {/* Quick Presets */}
          <div className="flow-gen-presets-label">
            <span>⚡ Популярные готовые воронки:</span>
          </div>
          <div className="flow-gen-presets-grid">
            {FLOW_PRESETS.map((p) => (
              <button
                key={p.id}
                className="flow-gen-preset-card"
                onClick={() => buildFlowFromPrompt(p.prompt)}
                disabled={isGenerating}
              >
                <span className="flow-gen-preset-emoji">{p.icon}</span>
                <div>
                  <div className="flow-gen-preset-name">{p.title}</div>
                  <div className="flow-gen-preset-desc">{p.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Custom Prompt Input */}
          <div className="flow-gen-prompt-section">
            <label>Или введите произвольную задачу для ИИ:</label>
            <div className="flow-gen-input-box">
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Например: Создай бота автосервиса для записи на диагностику с проверкой промокода и вопросом телефона..."
                rows={3}
                disabled={isGenerating}
              />
              <div className="flow-gen-input-actions">
                <button
                  type="button"
                  className={`flow-gen-mic-btn ${isListening ? 'listening' : ''}`}
                  onClick={toggleVoice}
                  title="Голосовой ввод ($0.00)"
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
                <button
                  type="button"
                  className="flow-gen-submit-btn"
                  onClick={() => buildFlowFromPrompt(prompt)}
                  disabled={!prompt.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <><Loader2 size={16} className="animate-spin" /> Генерация блоков...</>
                  ) : (
                    <><Zap size={16} /> Создать воронку на холсте</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
