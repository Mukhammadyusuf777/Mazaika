import { useState, useRef, useEffect } from 'react'
import { FileText, CheckCircle2, ArrowDown, Check } from 'lucide-react'
import './TermsModal.css'

interface TermsModalProps {
  isOpen: boolean
  onAccept: () => void
}

export default function TermsModal({ isOpen, onAccept }: TermsModalProps) {
  const [lang, setLang] = useState<'UZ' | 'RU'>('UZ')
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Non-dismissable: handle Escape key to prevent closing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!isOpen) return null

  const handleScroll = () => {
    const el = scrollContainerRef.current
    if (!el) return
    // Allow small 30px threshold for different screen zoom/resolutions
    const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 30
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true)
    }
  }

  const scrollToBottom = () => {
    const el = scrollContainerRef.current
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
  }

  const handleConfirm = () => {
    if (!hasScrolledToBottom || !agreed) return
    onAccept()
  }

  return (
    <div className="terms-overlay">
      <div className="terms-dialog">
        
        {/* Header */}
        <div className="terms-header">
          <div className="terms-header-left">
            <div className="terms-header-icon">
              <FileText size={22} color="#00D9FF" />
            </div>
            <div>
              <h3 className="terms-title">
                {lang === 'UZ' ? "Foydalanish Qoidalari va Ommaviy Oferta" : "Условия использования и Публичная Оферта"}
              </h3>
              <p className="terms-subtitle">
                {lang === 'UZ' 
                  ? "Mazaika AI platformasidan foydalanishni davom ettirish uchun shartlar bilan tanishib chiqing."
                  : "Для продолжения работы с Mazaika AI ознакомьтесь с условиями пользовательского соглашения."}
              </p>
            </div>
          </div>

          {/* Lang switcher */}
          <div className="terms-lang-toggle">
            <button 
              className={`terms-lang-btn ${lang === 'UZ' ? 'active' : ''}`}
              onClick={() => setLang('UZ')}
            >
              O'zb
            </button>
            <button 
              className={`terms-lang-btn ${lang === 'RU' ? 'active' : ''}`}
              onClick={() => setLang('RU')}
            >
              Рус
            </button>
          </div>
        </div>

        {/* Scrollable Terms Content */}
        <div 
          className="terms-body" 
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {lang === 'UZ' ? (
            /* UZBEK TERMS */
            <div className="terms-text-content">
              <h4>1. UMUMIY QOIDALAR VA ATAMALAR</h4>
              <p>
                1.1. Ushbu Ommaviy Oferta (keyingi o'rinlarda «Oferta») <b>Mazaika AI</b> (Mazaika Inc.) tomonidan taqdim etilayotgan barcha xizmatlar, shu jumladan sun'iy intellekt arxitektori, Telegram-bot konstruktori, WebApp Mini App integratsiyalari va veb-sayt yaratish platformasidan foydalanish tartibini belgilaydi.
              </p>
              <p>
                1.2. Platformada ro'yxatdan o'tish, hisob qaydnomasini yaratish yoki tizimga kirish ushbu Ofertaning barcha shartlarini to'liq va so'zsiz qabul qilish (aksept) hisoblanadi.
              </p>

              <h4>2. MAZAIKA AI VA XIZMATLAR KO'RSATISH TARTIBI</h4>
              <p>
                2.1. Foydalanuvchiga Telegram botlar, Mini Ilovalar va veb-saytlarni yaratish, tahrirlash hamda o'z serverlarimizda cheklovlarsiz (no-limit hosting) joylashtirish imkoniyati beriladi.
              </p>
              <p>
                2.2. Foydalanuvchi sun'iy intellekt (Mazaika AI) yordamida yaratilgan har qanday bot ssenariylari, veb-sahifalar va kontentning O'zbekiston Respublikasi qonunchiligiga to'liq muvofiqligi uchun shaxsan javobgardir.
              </p>

              <h4>3. TAQIQLANGAN HARAKATLAR VA XAVFSIZLIK</h4>
              <p>
                3.1. Platformadan quyidagi maqsadlarda foydalanish qat'iyan man etiladi:
              </p>
              <ul>
                <li>Spam tarqatish, firibgarlik (phishing) yoki noqonuniy moliyaviy piramidalar yaratish;</li>
                <li>Zararli dasturiy ta'minotlar (viruslar) va xakerlik skriptlarini tarqatish;</li>
                <li>Boshqa shaxslarning intellektual mulk huquqlarini buzish;</li>
                <li>Davlat suvereniteti, axloq normalari yoki qonunchilikka zid keluvchi noqonuniy materiallar tarqatish.</li>
              </ul>
              <p>
                3.2. Mazkur qoidalar buzilgan taqdirda Ma'muriyat foydalanuvchi hisobini ogohlantirishsiz bloklash huquqiga ega.
              </p>

              <h4>4. BETA-DAVRI VA TARIFLAR</h4>
              <p>
                4.1. Hozirgi kunda platforma Ochiq Beta bosqichida faoliyat ko'rsatmoqda. Barcha professional va biznes tariflar foydalanuvchilar uchun <b>mutlaqo BEPUL (0 so'm)</b> etib belgilangan.
              </p>
              <p>
                4.2. Loyihani qo'llab-quvvatlash uchun kiritilgan har qanday ixtiyoriy do'natlar (ehsonlar) qaytarib berilmaydi va serverlar faoliyatini ushlab turish hamda AI modellarini rivojlantirishga sarflanadi.
              </p>

              <h4>5. INTELLEKTUAL MULK VA FOYDALANUVCHI HUQUQLARI</h4>
              <p>
                5.1. Foydalanuvchi tomonidan Mazaika platformasida yaratilgan barcha botlar, saytlar, matnlar va mahsulotlar to'liq foydalanuvchining o'z mulki hisoblanadi.
              </p>
              <p>
                5.2. Mazaika AI tizimi yaratilgan kod yoki ma'lumotlar bazalariga egalik huquqini da'vo qilmaydi.
              </p>

              <h4>6. MAXFIYLIK VA SHAXSIY MA'LUMOTLAR</h4>
              <p>
                6.1. Platforma foydalanuvchining shaxsiy ma'lumotlari, Telegram bot tokenlari va mijozlar ma'lumotlar bazasini uchinchi shaxslarga bermaslikni kafolatlaydi.
              </p>
              <p>
                6.2. Bot tokenlari va maxfiy kalitlar shifrlangan holatda saqlanadi.
              </p>

              <h4>7. YAKUNIY QOIDALAR</h4>
              <p>
                7.1. Oferta shartlarini qabul qilish uchun ushbu matnni to'liq oxirigacha ko'rib chiqish va quyidagi rozilikni tasdiqlash talab etiladi.
              </p>
              <div className="terms-end-badge">
                <CheckCircle2 size={16} color="#10B981" />
                <span>Oferta matnining oxiri. Barcha qoidalar bilan tanishildi.</span>
              </div>
            </div>
          ) : (
            /* RUSSIAN TERMS */
            <div className="terms-text-content">
              <h4>1. ОБЩИЕ ПОЛОЖЕНИЯ И ТЕРМИНЫ</h4>
              <p>
                1.1. Настоящая Публичная Оферта (далее — «Соглашение») определяет условия использования сервисов экосистемы <b>Mazaika AI</b> (Mazaika Inc.), включая генеративный искусственный интеллект, конструктор Telegram-ботов, Telegram Mini Apps и платформу хостинга сайтов.
              </p>
              <p>
                1.2. Регистрация, авторизация или вход в аккаунт является полным и безоговорочным акцептом условий настоящей Оферты.
              </p>

              <h4>2. ПРАВИЛА ИСПОЛЬЗОВАНИЯ MAZAIKA AI</h4>
              <p>
                2.1. Пользователю предоставляется доступ к созданию ботов, веб-приложений и веб-сайтов на базе выделенных серверов платформы без тарификационных ограничений.
              </p>
              <p>
                2.2. Пользователь несет персональную ответственность за генерируемый и публикуемый контент, сценарии ботов и собираемые данные пользователей.
              </p>

              <h4>3. ЗАПРЕЩЕННЫЕ ДЕЙСТВИЯ</h4>
              <p>
                3.1. Запрещается использование платформы Mazaika для:
              </p>
              <ul>
                <li>Распространения спама, фишинга, организации мошеннических схем;</li>
                <li>Создания и внедрения вредоносного программного кода;</li>
                <li>Нарушения интеллектуальных прав третьих лиц и законодательства;</li>
                <li>Сбора конфиденциальных платежных данных пользователей в обход официальных шлюзов.</li>
              </ul>
              <p>
                3.2. При выявлении нарушений учетная запись блокируется без права восстановления.
              </p>

              <h4>4. БЕТА-ПЕРИОД И ТАРИФЫ</h4>
              <p>
                4.1. В рамках открытого тестирования (Early Access Beta) все тарифные планы и AI-инструменты предоставляются на <b>100% БЕСПЛАТНОЙ основе (0 сум)</b>.
              </p>
              <p>
                4.2. Любые добровольные пожертвования (донаты) осуществляются по желанию пользователя и направляются на покрытие серверов и развитие Mazaika AI.
              </p>

              <h4>5. ИНТЕЛЛЕКТУАЛЬНЫЕ ПРАВА</h4>
              <p>
                5.1. Все права на созданных ботов, исходный код сайтов и Mini Apps принадлежат Пользователю. Платформа Mazaika не претендует на владение продуктами пользователей.
              </p>

              <h4>6. КОНФИДЕНЦИАЛЬНОСТЬ</h4>
              <p>
                6.1. Платформа обеспечивает надежное шифрование токенов Telegram BotFather и не передает пользовательские базы данных третьим лицам.
              </p>

              <h4>7. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ</h4>
              <p>
                7.1. Для продолжения работы требуется пролистать текст Соглашения до конца и подтвердить согласие с правилами сервиса.
              </p>
              <div className="terms-end-badge">
                <CheckCircle2 size={16} color="#10B981" />
                <span>Конец текста Оферты. Все положения соглашения изучены.</span>
              </div>
            </div>
          )}
        </div>

        {/* Scroll Warning / Helper Pill */}
        {!hasScrolledToBottom ? (
          <div className="terms-scroll-notice pulsing" onClick={scrollToBottom}>
            <ArrowDown size={15} />
            <span>
              {lang === 'UZ' 
                ? "Tasdiqlash uchun ofertani eng oxirigacha aylantiring" 
                : "Пролистайте оферту до самого конца, чтобы продолжить"}
            </span>
          </div>
        ) : (
          <div className="terms-scroll-notice ready">
            <CheckCircle2 size={15} />
            <span>
              {lang === 'UZ' 
                ? "Oferta oxiriga yetib kelindi. Rozilikni tasdiqlashingiz mumkin." 
                : "Вы дошли до конца документа. Теперь можно подтвердить согласие."}
            </span>
          </div>
        )}

        {/* Footer Confirmation Controls */}
        <div className="terms-footer">
          <label className={`terms-checkbox-label ${!hasScrolledToBottom ? 'disabled' : ''}`}>
            <input 
              type="checkbox" 
              checked={agreed} 
              disabled={!hasScrolledToBottom}
              onChange={e => setAgreed(e.target.checked)}
              className="terms-checkbox"
            />
            <span className="terms-checkbox-text">
              {lang === 'UZ' 
                ? "Men Ommaviy Oferta va foydalanish shartlari bilan to'liq tanishdim va ularga roziman."
                : "Я полностью прочитал(а) Публичную Оферту, принимаю условия и правила сервиса."}
            </span>
          </label>

          <button 
            type="button"
            className="btn btn-primary terms-accept-btn"
            disabled={!hasScrolledToBottom || !agreed}
            onClick={handleConfirm}
          >
            <Check size={18} />
            <span>
              {lang === 'UZ' ? "Qabul qilish va davom etish" : "Принять и продолжить"}
            </span>
          </button>
        </div>

      </div>
    </div>
  )
}
