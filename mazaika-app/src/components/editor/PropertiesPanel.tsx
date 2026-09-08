import { X, Save, Trash2, Plus } from 'lucide-react'

interface NodeLike {
  id: string
  type?: string
  data: Record<string, any>
}

interface PropertiesPanelProps {
  node: NodeLike
  nodes: NodeLike[]
  onClose: () => void
  onUpdate: (data: any) => void
  onDelete?: () => void
}

export function PropertiesPanel({ node, nodes, onClose, onUpdate, onDelete }: PropertiesPanelProps) {

  const data = node.data as any
  const color = data.color || '#1e90ff'

  return (
    <div className="properties-panel">
      <div className="properties-header">
        <div className="properties-header-title">
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: color }} />
          {data.label || 'Блок'} — Настройки
        </div>
        <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
      </div>

      <div className="properties-content">
        
        {/* === START NODE === */}
        {node.type === 'start' && (
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>
              Этот блок активируется, когда пользователь впервые запускает бота (отправляет команду <strong>/start</strong>).
            </p>
            <div style={{ background: 'rgba(30,144,255,0.06)', borderLeft: '3px solid #1e90ff', padding: '10px 12px', borderRadius: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
              💡 <strong>Реферальная ссылка / Источники:</strong><br />
              Если пользователь перешел по реферальной ссылке, параметр ссылки автоматически сохранится в переменную <code>{"{start_payload}"}</code>. Её можно использовать в других блоках!
            </div>
          </div>
        )}


        {/* === MESSAGE NODE === */}
        {node.type === 'message' && (
          <>
            <div className="form-group">
              <label className="form-label">Текст сообщения</label>
              <textarea
                className="input"
                rows={5}
                value={data.text || ''}
                onChange={(e) => onUpdate({ text: e.target.value })}
                placeholder="Текст сообщения для отправки пользователю..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">URL фото или видео (необязательно)</label>
              <input
                type="text"
                className="input"
                value={data.mediaUrl || ''}
                onChange={(e) => onUpdate({ mediaUrl: e.target.value })}
                placeholder="Masalan: https://site.com/photo.jpg"
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Прямая ссылка на фото (.jpg, .png) или видео (.mp4). Текст сообщения будет отправлен как подпись к медиа.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Кнопки (Inline кнопки)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(data.buttons || []).map((btn: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="input"
                      value={btn}
                      onChange={(e) => {
                        const newBtns = [...data.buttons]
                        newBtns[i] = e.target.value
                        onUpdate({ buttons: newBtns })
                      }}
                      placeholder="Название кнопки или Текст|ссылка"
                    />
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => {
                        const newBtns = data.buttons.filter((_: any, idx: number) => idx !== i)
                        onUpdate({ buttons: newBtns })
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ alignSelf: 'flex-start' }}
                  onClick={() => onUpdate({ buttons: [...(data.buttons || []), 'Новая кнопка'] })}
                >
                  <Plus size={14} /> Добавить кнопку
                </button>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: 6, fontSize: 11, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span>🔗 <strong>Форматы кнопок:</strong></span>
                  <span>- Обычная кнопка: <code>Каталог</code> (переход по сценарию)</span>
                  <span>- Ссылка на сайт: <code>Сайт|https://site.com</code> (открытие URL)</span>
                  <span>- Telegram Mini App: <code>Магазин|webapp:https://site.com</code> (открытие Mini App)</span>
                </div>
              </div>
            </div>
          </>
        )}


        {/* === CHAIN NODE === */}
        {node.type === 'chain' && (
          <div className="form-group">
            <label className="form-label">Целевой блок для перехода</label>
            <select
              className="input"
              value={data.targetNodeId || ''}
              onChange={(e) => onUpdate({ targetNodeId: e.target.value })}
            >
              <option value="">-- Выберите блок --</option>
              {nodes
                .filter((n) => n.id !== node.id)
                .map((n) => {
                  let label = n.data?.label || n.type || 'Blok';
                  if (n.data?.text) {
                    const shortText = n.data.text.length > 25 ? n.data.text.substring(0, 25) + '...' : n.data.text;
                    label = `${label} (${shortText})`;
                  }
                  return (
                    <option key={n.id} value={n.id}>
                      {label} [{n.id}]
                    </option>
                  );
                })}
            </select>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              Сценарий мгновенно перейдет к выбранному блоку без дополнительных сообщений и задержек (Jump / Goto).
            </span>
          </div>
        )}


        {/* === TIMER (DELAY) NODE === */}
        {node.type === 'timer' && (
          <div className="form-group">
            <label className="form-label">Время ожидания (Задержка)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                className="input"
                placeholder="0"
                value={data.delayAmount || ''}
                onChange={(e) => onUpdate({ delayAmount: parseInt(e.target.value) || 0 })}
              />
              <select
                className="input"
                value={data.delayUnit || 'seconds'}
                onChange={(e) => onUpdate({ delayUnit: e.target.value })}
              >
                <option value="seconds">Секунды</option>
                <option value="minutes">Минуты</option>
                <option value="hours">Часы</option>
                <option value="days">Дни</option>
              </select>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              По истечении указанного времени бот автоматически перейдет к следующему шагу сценария.
            </span>
          </div>
        )}


        {/* === QUESTION NODE (MATNLI SAVOL) === */}
        {node.type === 'question' && (
          <>
            <div className="form-group">
              <label className="form-label">Текст вопроса (Сообщение клиенту)</label>
              <textarea
                className="input"
                rows={4}
                value={data.text || ''}
                onChange={(e) => onUpdate({ text: e.target.value })}
                placeholder="Введите текст вопроса, который получит клиент..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ссылка на фото или видео (необязательно)</label>
              <input
                type="text"
                className="input"
                value={data.mediaUrl || ''}
                onChange={(e) => onUpdate({ mediaUrl: e.target.value })}
                placeholder="Masalan: https://site.com/photo.jpg"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Имя переменной для сохранения ответа</label>
              <input
                type="text"
                className="input"
                value={data.variable || ''}
                onChange={(e) => onUpdate({ variable: e.target.value })}
                placeholder="Например: name, age, city"
                required
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Ответ пользователя запишется в эту переменную, и её можно использовать в следующих сообщениях.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Кнопки с готовыми ответами (опционально)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(data.buttons || []).map((btn: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="input"
                      value={btn}
                      onChange={(e) => {
                        const newBtns = [...data.buttons]
                        newBtns[i] = e.target.value
                        onUpdate({ buttons: newBtns })
                      }}
                      placeholder="Например: Да"
                    />
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => {
                        const newBtns = data.buttons.filter((_: any, idx: number) => idx !== i)
                        onUpdate({ buttons: newBtns })
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ alignSelf: 'flex-start' }}
                  onClick={() => onUpdate({ buttons: [...(data.buttons || []), ''] })}
                >
                  <Plus size={14} /> Добавить вариант ответа
                </button>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Если добавить кнопки, клиент сможет выбрать готовый ответ в один клик вместо ручного ввода.
                </span>
              </div>
            </div>
          </>
        )}

        {/* === PHONE NODE (TELEFON RAQAM) === */}
        {node.type === 'phone' && (
          <>
            <div className="form-group">
              <label className="form-label">Текст запроса номера телефона</label>
              <textarea
                className="input"
                rows={3}
                value={data.text || ''}
                onChange={(e) => onUpdate({ text: e.target.value })}
                placeholder="Например: Пожалуйста, отправьте ваш номер телефона:"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Текст на кнопке (необязательно)</label>
              <input
                type="text"
                className="input"
                value={data.buttonText || ''}
                onChange={(e) => onUpdate({ buttonText: e.target.value })}
                placeholder="📞 Отправить номер телефона"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Имя переменной для номера телефона</label>
              <input
                type="text"
                className="input"
                value={data.variable || ''}
                onChange={(e) => onUpdate({ variable: e.target.value })}
                placeholder="Например: phone"
              />
            </div>
          </>
        )}

        {/* === EMAIL NODE (EMAIL MANZIL) === */}
        {node.type === 'email' && (
          <>
            <div className="form-group">
              <label className="form-label">Текст запроса Email</label>
              <textarea
                className="input"
                rows={3}
                value={data.text || ''}
                onChange={(e) => onUpdate({ text: e.target.value })}
                placeholder="Например: Пожалуйста, введите ваш email:"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Имя переменной для Email</label>
              <input
                type="text"
                className="input"
                value={data.variable || ''}
                onChange={(e) => onUpdate({ variable: e.target.value })}
                placeholder="Например: email"
              />
            </div>
          </>
        )}

        {/* === LOCATION NODE (LOKATSIYA) === */}
        {node.type === 'location' && (
          <>
            <div className="form-group">
              <label className="form-label">Текст запроса геолокации</label>
              <textarea
                className="input"
                rows={3}
                value={data.text || ''}
                onChange={(e) => onUpdate({ text: e.target.value })}
                placeholder="Например: Отправьте геолокацию для точной доставки:"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Текст на кнопке (необязательно)</label>
              <input
                type="text"
                className="input"
                value={data.buttonText || ''}
                onChange={(e) => onUpdate({ buttonText: e.target.value })}
                placeholder="📍 Отправить локацию"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Имя переменной для геолокации</label>
              <input
                type="text"
                className="input"
                value={data.variable || ''}
                onChange={(e) => onUpdate({ variable: e.target.value })}
                placeholder="Например: location"
              />
            </div>
          </>
        )}





        {/* === CONDITION NODE === */}
        {node.type === 'condition' && (
          <>
            <div className="form-group">
              <label className="form-label">Проверяемая переменная</label>
              <input
                type="text"
                className="input"
                value={data.variable || ''}
                onChange={(e) => onUpdate({ variable: e.target.value })}
                placeholder="Например: name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Тип условия (Сравнение)</label>
              <select
                className="input"
                value={data.operator || '=='}
                onChange={(e) => onUpdate({ operator: e.target.value })}
              >
                <option value="==">Равно (==)</option>
                <option value="!=">Не равно (!=)</option>
                <option value="contains">Содержит подстроку (Contains)</option>
                <option value=">">Больше (&gt;)</option>
                <option value="<">Меньше (&lt;)</option>
                <option value="is_empty">Не заполнено (Пусто / Is Empty)</option>
                <option value="is_filled">Заполнено (Есть значение / Is Set)</option>
                <option value="regex">Соответствует регулярному выражению (Regex)</option>
              </select>
            </div>
            {!(data.operator === 'is_empty' || data.operator === 'is_filled') && (
              <div className="form-group">
                <label className="form-label">Значение для сравнения</label>
                <input
                  type="text"
                  className="input"
                  value={data.value || ''}
                  onChange={(e) => onUpdate({ value: e.target.value })}
                  placeholder={data.operator === 'regex' ? 'Например: ^[0-9]+$ (Только цифры)' : 'Введите значение...'}
                />
              </div>
            )}
          </>
        )}


        {/* === SUBSCRIPTION NODE (KANALGA A'ZOLIK) === */}
        {node.type === 'subscription' && (
          <>
            <div className="form-group">
              <label className="form-label">Адрес Telegram канала</label>
              <input
                type="text"
                className="input"
                value={data.channel || ''}
                onChange={(e) => onUpdate({ channel: e.target.value })}
                placeholder="Например: @channel_name"
                required
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                ⚠️ <b>Важное примечание:</b> Бот должен быть назначен <b>Администратором</b> в данном канале с правами просмотра подписчиков, иначе проверка не сработает!
              </span>
            </div>
          </>
        )}

        {node.type === 'variable' && (
          <>
            <div className="form-group">
              <label className="form-label">Имя переменной</label>
              <input
                type="text"
                className="input"
                value={data.variableName || ''}
                onChange={(e) => onUpdate({ variableName: e.target.value })}
                placeholder="Например: order_count"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Присваиваемое значение</label>
              <input
                type="text"
                className="input"
                value={data.variableValue || ''}
                onChange={(e) => onUpdate({ variableValue: e.target.value })}
                placeholder="Например: 1 или Текст..."
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                💡 <b>Примеры использования:</b><br />
                - Подстановка других переменных: <code>{`Привет, {name}!`}</code><br />
                - Математические вычисления: <code>{`{score} + 1`}</code>
              </span>
            </div>
          </>
        )}


        {/* === VARIABLE DELETE NODE === */}
        {node.type === 'deleteVariable' && (
          <div className="form-group">
            <label className="form-label">Имена удаляемых переменных</label>
            <input
              type="text"
              className="input"
              value={data.variableName || ''}
              onChange={(e) => onUpdate({ variableName: e.target.value })}
              placeholder="Например: name, phone"
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              💡 <b>Подсказка:</b> Чтобы удалить сразу несколько переменных, перечислите их через запятую (например: <code>name, phone, city</code>).
            </span>
          </div>
        )}


        {/* === A/B TEST NODE === */}
        {node.type === 'abTest' && (
          <>
            <div className="form-group">
              <label className="form-label">Доля трафика для Варианта A (%)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={data.ratioA !== undefined ? data.ratioA : 50}
                  onChange={(e) => onUpdate({ ratioA: parseInt(e.target.value) || 0 })}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: 14, fontWeight: 'bold', width: '45px', textAlign: 'right' }}>
                  {data.ratioA !== undefined ? data.ratioA : 50}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                <span>Вариант A (Первое направление): {data.ratioA !== undefined ? data.ratioA : 50}%</span>
                <span>Вариант B (Второе направление): {100 - (data.ratioA !== undefined ? data.ratioA : 50)}%</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Переменная для сохранения группы (опционально)</label>
              <input
                type="text"
                className="input"
                value={data.variable || ''}
                onChange={(e) => onUpdate({ variable: e.target.value })}
                placeholder="Например: test_group"
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Сохраняет, в какой вариант (A или B) попал пользователь.
              </span>
            </div>
          </>
        )}


        {/* === JAVASCRIPT NODE === */}
        {node.type === 'javascript' && (
          <>
            <div className="form-group">
              <label className="form-label">JS Формула или выражение</label>
              <textarea
                className="input"
                rows={3}
                value={data.code || ''}
                onChange={(e) => onUpdate({ code: e.target.value })}
                placeholder="Например: price * 0.15"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Имя переменной для результата</label>
              <input
                type="text"
                className="input"
                value={data.variable || ''}
                onChange={(e) => onUpdate({ variable: e.target.value })}
                placeholder="Например: total_tax"
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                💡 <b>Правила использования:</b><br />
                - Переменные можно использовать напрямую: <code>price * 0.15</code> или <code>name.toUpperCase()</code>.<br />
                - Числовые строки автоматически конвертируются в числа.<br />
                - Доступны стандартные функции: <code>Math.max(10, score)</code> или <code>Date.now()</code>.
              </span>
            </div>
          </>
        )}


        {/* === HTTP SO'ROV (HTTP REQUEST) NODE === */}
        {node.type === 'http' && (
          <>
            <div className="form-group">
              <label className="form-label">Метод запроса (GET или POST)</label>
              <select
                className="input"
                value={data.method || 'GET'}
                onChange={(e) => onUpdate({ method: e.target.value })}
              >
                <option value="GET">GET (Получить данные)</option>
                <option value="POST">POST (Отправить данные)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">URL адрес внешнего сервиса (API Endpoint)</label>
              <input
                type="text"
                className="input"
                value={data.url || ''}
                onChange={(e) => onUpdate({ url: e.target.value })}
                placeholder="https://api.example.com/endpoint"
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                В URL можно использовать переменные. Например: <code>{`https://site.com/weather?city={city}`}</code>
              </span>
            </div>

            {data.method === 'POST' && (
              <div className="form-group">
                <label className="form-label">Тело запроса (Request Body — JSON)</label>
                <textarea
                  className="input"
                  rows={4}
                  value={data.body || ''}
                  onChange={(e) => onUpdate({ body: e.target.value })}
                  placeholder='{"ism": "{ism}", "tel": "{telefon}"}'
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Передавайте данные в формате JSON. Переменные будут автоматически подставлены.
                </span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">В какую переменную сохранить ответ API?</label>
              <input
                type="text"
                className="input"
                value={data.variable || ''}
                onChange={(e) => onUpdate({ variable: e.target.value })}
                placeholder="Например: response_data"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Извлечь поле из JSON ответа (JSON Path, опционально)</label>
              <input
                type="text"
                className="input"
                value={data.jsonPath || ''}
                onChange={(e) => onUpdate({ jsonPath: e.target.value })}
                placeholder="Например: data.temperature или id"
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Если внешний API возвращает JSON, укажите ключ, чтобы сохранить только нужное поле.
              </span>
            </div>
          </>
        )}

        {/* === WEBHOOK NODE (WEBHOOK JO'NATISH) === */}
        {node.type === 'webhook' && (
          <>
            <div className="form-group">
              <label className="form-label">Метод отправки (Method)</label>
              <select
                className="input"
                value={data.method || 'POST'}
                onChange={(e) => onUpdate({ method: e.target.value })}
              >
                <option value="POST">POST (Рекомендуется — отправляет все данные)</option>
                <option value="GET">GET (Только переход по URL)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Адрес вебхука (Webhook URL)</label>
              <input
                type="text"
                className="input"
                value={data.url || ''}
                onChange={(e) => onUpdate({ url: e.target.value })}
                placeholder="https://hook.us1.make.com/..."
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                💡 <b>Описание:</b> Блок автоматически отправляет все собранные ботом данные клиента (имя, телефон и т.д.) во внешний сервис (Make.com, Zapier, n8n). Поддерживаются переменные в URL.
              </span>
            </div>
          </>
        )}

        {/* === GOOGLE SHEETS ADD NODE (SHEET YOZISH) === */}
        {node.type === 'googleSheetsAdd' && (
          <>
            <div className="form-group">
              <label className="form-label">So'rov turi (GET yoki POST)</label>
              <select
                className="input"
                value={data.method || 'POST'}
                onChange={(e) => onUpdate({ method: e.target.value })}
              >
                <option value="POST">POST (Рекомендуется — автоматическая запись)</option>
                <option value="GET">GET (Передача через query-параметры)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">URL Google Web App (Таблицы)</label>
              <input
                type="text"
                className="input"
                value={data.url || ''}
                onChange={(e) => onUpdate({ url: e.target.value })}
                placeholder="https://script.google.com/macros/s/.../exec"
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                💡 <b>Описание:</b> Автоматически записывает данные из бота в Google Таблицу. Укажите URL веб-приложения Google Apps Script.<br />
                - При выборе <code>GET</code> переменные передаются в строке запроса: <code>.../exec?name={"{name}"}&amp;phone={"{phone}"}</code>.
              </span>
            </div>
          </>
        )}

        {/* === GOOGLE SHEETS READ NODE (SHEET O'QISH) === */}
        {node.type === 'googleSheetsRead' && (
          <>
            <div className="form-group">
              <label className="form-label">Google Web App (Jadval) havolasi</label>
              <input
                type="text"
                className="input"
                value={data.url || ''}
                onChange={(e) => onUpdate({ url: e.target.value })}
                placeholder="https://script.google.com/macros/s/.../exec"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Переменная для сохранения ответа таблицы</label>
              <input
                type="text"
                className="input"
                value={data.variable || ''}
                onChange={(e) => onUpdate({ variable: e.target.value })}
                placeholder="Например: sheet_response"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Javobdan kerakli kalitni ajratib olish (JSON Path - Ixtiyoriy)</label>
              <input
                type="text"
                className="input"
                value={data.jsonPath || ''}
                onChange={(e) => onUpdate({ jsonPath: e.target.value })}
                placeholder="Например: rate.usd или price"
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                💡 <b>Описание:</b> Загружает данные из Google Таблицы. Если скрипт возвращает JSON, укажите ключ для извлечения нужного значения.
              </span>
            </div>
          </>
        )}





        {/* === GETCOURSE INTEGRATION === */}
        {node.type === 'getCourse' && (
          <>
            <div className="form-group">
              <label className="form-label">Действие в GetCourse</label>
              <select
                className="input"
                value={data.action || 'deal'}
                onChange={(e) => onUpdate({ action: e.target.value })}
              >
                <option value="deal">Создать заказ (Deal / Order)</option>
                <option value="user">Зарегистрировать пользователя (Add User)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Домен онлайн-школы GetCourse</label>
              <input
                type="text"
                className="input"
                value={data.domain || ''}
                onChange={(e) => onUpdate({ domain: e.target.value })}
                placeholder="Masalan: school.getcourse.ru"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Секретный API ключ</label>
              <input
                type="text"
                className="input"
                value={data.apiKey || ''}
                onChange={(e) => onUpdate({ apiKey: e.target.value })}
                placeholder="API ключ из профиля GetCourse..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Переменная с именем клиента</label>
              <input
                type="text"
                className="input"
                value={data.nameVar || 'ism'}
                onChange={(e) => onUpdate({ nameVar: e.target.value })}
                placeholder="Masalan: ism"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Переменная с номером телефона</label>
              <input
                type="text"
                className="input"
                value={data.phoneVar || 'telefon'}
                onChange={(e) => onUpdate({ phoneVar: e.target.value })}
                placeholder="Masalan: telefon"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Переменная с Email клиента</label>
              <input
                type="text"
                className="input"
                value={data.emailVar || 'email'}
                onChange={(e) => onUpdate({ emailVar: e.target.value })}
                placeholder="Masalan: email"
              />
            </div>
            {data.action === 'deal' && (
              <div className="form-group">
                <label className="form-label">Код тарифа / предложения (Offer Code)</label>
                <input
                  type="text"
                  className="input"
                  value={data.offerCode || ''}
                  onChange={(e) => onUpdate({ offerCode: e.target.value })}
                  placeholder="Masalan: premium_tarif"
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  💡 Код оффера в GetCourse. Можно использовать переменные (например: <code>{`{tariff_code}`}</code>).
                </span>
              </div>
            )}
          </>
        )}

        {/* === YCLIENTS INTEGRATION === */}
        {node.type === 'yclients' && (
          <>
            <div className="form-group">
              <label className="form-label">ID компании / филиала (Company ID)</label>
              <input
                type="text"
                className="input"
                value={data.companyId || ''}
                onChange={(e) => onUpdate({ companyId: e.target.value })}
                placeholder="Masalan: 123456"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Партнерский токен (Partner Token)</label>
              <input
                type="text"
                className="input"
                value={data.apiKey || ''}
                onChange={(e) => onUpdate({ apiKey: e.target.value })}
                placeholder="Партнерский токен Yclients..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Токен пользователя (User Token, опционально)</label>
              <input
                type="text"
                className="input"
                value={data.userToken || ''}
                onChange={(e) => onUpdate({ userToken: e.target.value })}
                placeholder="Токен сотрудника Yclients..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Переменная с именем клиента</label>
              <input
                type="text"
                className="input"
                value={data.nameVar || 'ism'}
                onChange={(e) => onUpdate({ nameVar: e.target.value })}
                placeholder="Masalan: ism"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Переменная с номером телефона</label>
              <input
                type="text"
                className="input"
                value={data.phoneVar || 'telefon'}
                onChange={(e) => onUpdate({ phoneVar: e.target.value })}
                placeholder="Masalan: telefon"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Переменная с Email клиента</label>
              <input
                type="text"
                className="input"
                value={data.emailVar || 'email'}
                onChange={(e) => onUpdate({ emailVar: e.target.value })}
                placeholder="Masalan: email"
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                💡 <b>Описание:</b> Автоматически создает карточку нового клиента в CRM Yclients при прохождении блока.
              </span>
            </div>
          </>
        )}


        {/* === PAYMENTS (PAYME, CLICK, YOOKASSA, CRYPTOPAY) === */}
        {['payme', 'click', 'yookassa', 'cryptopay'].includes(node.type || '') && (
          <>
            <div className="form-group">
              <label className="form-label">Название товара или услуги</label>
              <input
                type="text"
                className="input"
                value={data.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Например: Оплата онлайн-курса"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Стоимость (UZS / валюта)</label>
              <input
                type="text"
                className="input"
                value={data.price || ''}
                onChange={(e) => onUpdate({ price: e.target.value })}
                placeholder="Например: 99000 или {total_price}"
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                💡 Укажите число или имя переменной с рассчитанной ценой (например: <code>{`{total_price}`}</code>).
              </span>
            </div>
            <div className="form-group">
              <label className="form-label">
                To'lov tizimi kaliti ({node.type === 'payme' ? 'Payme' : node.type === 'click' ? 'Click' : node.type === 'yookassa' ? 'Yookassa' : 'CryptoPay'} Provider Token)
              </label>
              <input
                type="text"
                className="input"
                value={data.providerToken || ''}
                onChange={(e) => onUpdate({ providerToken: e.target.value })}
                placeholder="Токен провайдера платежей..."
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                💡 Этот токен выдается ботом @BotFather при подключении платежного провайдера.
              </span>
            </div>
          </>
        )}

        {/* === CRM BLOCK (DEALSTAGE, ASSIGNEE) === */}
        {node.type === 'dealStage' && (
          <div className="form-group">
            <label className="form-label">Стадия клиента в CRM (Колонка)</label>
            <select
              className="input"
              value={data.stage || 'Yangi'}
              onChange={(e) => onUpdate({ stage: e.target.value })}
            >
              <option value="Yangi">Новый (New)</option>
              <option value="Jarayonda">В обработке (In Progress)</option>
              <option value="Muvaffaqiyatli">Успешно (Done)</option>
              <option value="Rad etildi">Отказ (Rejected)</option>
            </select>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              💡 <b>Описание:</b> При прохождении блока клиент автоматически перемещается в соответствующую колонку на канбан-доске CRM (например, после оплаты — в «Успешно»).
            </span>
          </div>
        )}

        {node.type === 'assignee' && (
          <div className="form-group">
            <label className="form-label">Ответственный менеджер</label>
            <input
              type="text"
              className="input"
              value={data.agent || ''}
              onChange={(e) => onUpdate({ agent: e.target.value })}
              placeholder="Например: Алексей"
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              💡 <b>Описание:</b> Автоматически закрепляет диалог с клиентом за выбранным сотрудником.
            </span>
          </div>
        )}

        {/* === CART & ORDERS === */}
        {node.type === 'cart' && (
          <>
            <div className="form-group">
              <label className="form-label">Действие с корзиной</label>
              <select
                className="input"
                value={data.cartAction || 'add'}
                onChange={(e) => onUpdate({ cartAction: e.target.value })}
              >
                <option value="add">Добавить товар (Add to cart)</option>
                <option value="remove">Удалить товар (Remove from cart)</option>
                <option value="clear">Очистить корзину (Clear cart)</option>
              </select>
            </div>
            
            {data.cartAction !== 'clear' && (
              <div className="form-group">
                <label className="form-label">Название товара</label>
                <input
                  type="text"
                  className="input"
                  value={data.itemName || ''}
                  onChange={(e) => onUpdate({ itemName: e.target.value })}
                  placeholder="Например: Пицца Маргарита"
                />
              </div>
            )}

            {data.cartAction === 'add' && (
              <>
                <div className="form-group">
                  <label className="form-label">Цена товара (UZS, опционально)</label>
                  <input
                    type="text"
                    className="input"
                    value={data.itemPrice || ''}
                    onChange={(e) => onUpdate({ itemPrice: e.target.value })}
                    placeholder="Masalan: 55000"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Количество товара (опционально)</label>
                  <input
                    type="text"
                    className="input"
                    value={data.itemQty || ''}
                    onChange={(e) => onUpdate({ itemQty: e.target.value })}
                    placeholder="Например: 1 или {qty}"
                  />
                </div>
              </>
            )}

            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginTop: 8 }}>
              💡 <b>Описание:</b> Корзина автоматически обновляет переменные для использования в сообщениях:<br />
              - <code>{`{cart_text}`}</code>: Текстовый список товаров в корзине.<br />
              - <code>{`{cart_total}`}</code>: Итоговая сумма корзины.<br />
              - <code>{`{cart_items_count}`}</code>: Общее количество товаров.
            </span>
          </>
        )}
        {/* === ORDERLIST BLOCK === */}
        {node.type === 'orderList' && (
          <>
            <div className="form-group">
              <label className="form-label">Сообщение при пустой корзине</label>
              <input
                type="text"
                className="input"
                value={data.emptyMessage || ''}
                onChange={(e) => onUpdate({ emptyMessage: e.target.value })}
                placeholder="Например: Ваша корзина пока пуста."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Заголовок списка товаров</label>
              <input
                type="text"
                className="input"
                value={data.headerText || ''}
                onChange={(e) => onUpdate({ headerText: e.target.value })}
                placeholder="Например: Содержимое вашего заказа:"
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                💡 <b>Описание:</b> Отображает клиенту детальный состав корзины с ценами, количеством и итоговой суммой.
              </span>
            </div>
          </>
        )}


        {/* === SUBSCRIBER MANAGEMENT (ADDTAG, REMOVETAG) === */}
        {node.type === 'addTag' && (
          <div className="form-group">
            <label className="form-label">Название присваиваемого тега</label>
            <input
              type="text"
              className="input"
              value={data.tagName || ''}
              onChange={(e) => onUpdate({ tagName: e.target.value })}
              placeholder="Например: VIP, Постоянный, Студент"
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              💡 <b>Описание:</b> При прохождении блока клиенту автоматически присваивается тег для быстрой сегментации в панели управления.
            </span>
          </div>
        )}

        {node.type === 'removeTag' && (
          <div className="form-group">
            <label className="form-label">Название удаляемого тега</label>
            <input
              type="text"
              className="input"
              value={data.tagName || ''}
              onChange={(e) => onUpdate({ tagName: e.target.value })}
              placeholder="Например: Новый_клиент"
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              💡 <b>Описание:</b> Удаляет указанный тег из карточки клиента (например, тег «Новый_клиент» при первой покупке).
            </span>
          </div>
        )}

        {/* === BALANCE MANAGEMENT (TOPUPBALANCE, DEBITBALANCE) === */}
        {node.type === 'topUpBalance' && (
          <div className="form-group">
            <label className="form-label">Сумма пополнения баланса</label>
            <input
              type="text"
              className="input"
              value={data.amount || ''}
              onChange={(e) => onUpdate({ amount: e.target.value })}
              placeholder="Например: 5000 или {cashback_sum}"
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              💡 <b>Описание:</b> Пополняет виртуальный счет пользователя в боте (бонусы, кэшбэк). Поддерживаются переменные (например: <code>{`{cashback}`}</code>).
            </span>
          </div>
        )}

        {node.type === 'debitBalance' && (
          <div className="form-group">
            <label className="form-label">Сумма списания с баланса</label>
            <input
              type="text"
              className="input"
              value={data.amount || ''}
              onChange={(e) => onUpdate({ amount: e.target.value })}
              placeholder="Например: 3000 или {debit_sum}"
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              💡 <b>Описание:</b> Списывает сумму с виртуального счета клиента (например, при оплате бонусами).
            </span>
          </div>
        )}

        {/* === DELETEUSER BLOCK === */}
        {node.type === 'deleteUser' && (
          <div className="form-group">
            <label className="form-label">Тип сброса / удаления</label>
            <select
              className="input"
              value={data.deleteType || 'memory'}
              onChange={(e) => onUpdate({ deleteType: e.target.value })}
            >
              <option value="memory">Очистить только переменные сессии (Wipe memory)</option>
              <option value="database">Полностью удалить контакт из базы CRM (Delete Contact)</option>
            </select>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, display: 'block' }}>
              💡 <b>При очистке переменных:</b> Удаляются все сохраненные переменные (имя, телефон, корзина). Сам контакт сохраняется в базе CRM.<br /><br />
              💡 <b>При удалении из CRM:</b> Контакт и вся история переписки удаляются полностью. При следующем старте пользователь начнет как новый подписчик.
            </span>
          </div>
        )}

        {/* === VOTING BLOCKS === */}
        {node.type === 'voterRegister' && (
          <div className="form-group">
            <label className="form-label">Имя кандидата или название проекта</label>
            <input
              type="text"
              className="input"
              value={data.candidate || ''}
              onChange={(e) => onUpdate({ candidate: e.target.value })}
              placeholder="Например: Кандидат 1 или {candidate}"
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              💡 <b>Описание:</b> Добавляет 1 голос за указанного кандидата с защитой от накрутки (один голос на пользователя).
            </span>
          </div>
        )}

        {node.type === 'voteLeaders' && (
          <div className="form-group">
            <label className="form-label">Настройки отображения рейтинга</label>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              💡 Выводит рейтинг кандидатов в реальном времени, отсортированный по убыванию голосов. Дополнительных настроек не требуется.
            </p>
          </div>
        )}
        
        {/* === NEW MEDIA BLOCKS === */}
        {node.type === 'photo' && (
          <div className="form-group">
            <label className="form-label">URL ссылка на фото</label>
            <input type="text" className="input" value={data.fileUrl || ''} onChange={(e) => onUpdate({ fileUrl: e.target.value })} placeholder="https://site.com/photo.jpg" />
            <label className="form-label" style={{marginTop: 12}}>Подпись к медиа (Caption)</label>
            <textarea className="input" rows={2} value={data.caption || ''} onChange={(e) => onUpdate({ caption: e.target.value })} placeholder="Текст под фото..." />
          </div>
        )}
        {node.type === 'video' && (
          <div className="form-group">
            <label className="form-label">URL видео или Telegram File ID</label>
            <input type="text" className="input" value={data.fileUrl || ''} onChange={(e) => onUpdate({ fileUrl: e.target.value })} placeholder="https://site.com/video.mp4" />
            <label className="form-label" style={{marginTop: 12}}>Taglavha (Caption)</label>
            <textarea className="input" rows={2} value={data.caption || ''} onChange={(e) => onUpdate({ caption: e.target.value })} placeholder="Текст под видео..." />
          </div>
        )}
        {node.type === 'document' && (
          <div className="form-group">
            <label className="form-label">URL документа (PDF, DOCX)</label>
            <input type="text" className="input" value={data.fileUrl || ''} onChange={(e) => onUpdate({ fileUrl: e.target.value })} placeholder="https://site.com/doc.pdf" />
            <label className="form-label" style={{marginTop: 12}}>Имя файла (необязательно)</label>
            <input type="text" className="input" value={data.fileName || ''} onChange={(e) => onUpdate({ fileName: e.target.value })} placeholder="Например: report.pdf" />
          </div>
        )}
        {node.type === 'audio' && (
          <div className="form-group">
            <label className="form-label">URL аудиозаписи (MP3)</label>
            <input type="text" className="input" value={data.fileUrl || ''} onChange={(e) => onUpdate({ fileUrl: e.target.value })} placeholder="https://site.com/audio.mp3" />
            <label className="form-label" style={{marginTop: 12}}>Taglavha (Caption)</label>
            <textarea className="input" rows={2} value={data.caption || ''} onChange={(e) => onUpdate({ caption: e.target.value })} placeholder="Описание аудиозаписи..." />
          </div>
        )}
        {node.type === 'sticker' && (
          <div className="form-group">
            <label className="form-label">Sticker File ID</label>
            <input type="text" className="input" value={data.fileId || ''} onChange={(e) => onUpdate({ fileId: e.target.value })} placeholder="CAACAgIAAxkBAAE..." />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Укажите file_id стикера из Telegram.</span>
          </div>
        )}

        {/* === NEW INPUT BLOCKS (POLL / QUIZ) === */}
        {(node.type === 'poll' || node.type === 'quiz') && (
          <>
            <div className="form-group">
              <label className="form-label">Текст вопроса (Опрос / Викторина)</label>
              <textarea className="input" rows={2} value={data.question || ''} onChange={(e) => onUpdate({ question: e.target.value })} placeholder="Введите текст вопроса..." />
            </div>
            <div className="form-group">
              <label className="form-label">Варианты ответов</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(data.options || []).map((opt: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" className="input" value={opt} onChange={(e) => {
                      const newOpts = [...data.options]; newOpts[i] = e.target.value; onUpdate({ options: newOpts });
                    }} placeholder={`Вариант ${i + 1}`} />
                    {node.type === 'quiz' && (
                      <input type="radio" name="correctOption" checked={data.correctIndex === i} onChange={() => onUpdate({ correctIndex: i })} title="Правильный ответ" />
                    )}
                    <button className="btn btn-ghost btn-icon" onClick={() => {
                      const newOpts = data.options.filter((_: any, idx: number) => idx !== i); onUpdate({ options: newOpts });
                    }}><Trash2 size={14} /></button>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => onUpdate({ options: [...(data.options || []), 'Yangi variant'] })}>
                  <Plus size={14} /> Добавить вариант
                </button>
              </div>
              {node.type === 'poll' && (
                <div style={{marginTop: 12}}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-main)' }}>
                    <input type="checkbox" checked={data.isMultiple || false} onChange={(e) => onUpdate({ isMultiple: e.target.checked })} />
                    Множественный выбор (Multiple choice)
                  </label>
                </div>
              )}
              {node.type === 'quiz' && (
                <div className="form-group" style={{marginTop: 12}}>
                  <label className="form-label">Пояснение (Показывается при выборе ответа)</label>
                  <input type="text" className="input" value={data.explanation || ''} onChange={(e) => onUpdate({ explanation: e.target.value })} placeholder="Например: Правильный ответ А, потому что..." />
                </div>
              )}
            </div>
          </>
        )}

        {/* === NEW AI BLOCKS === */}
        {node.type === 'aiReply' && (
          <div className="form-group">
            <label className="form-label">AI Model</label>
            <select className="input" value={data.model || 'gemini-1.5-flash'} onChange={(e) => onUpdate({ model: e.target.value })}>
              <option value="gemini-1.5-flash">Google Gemini 1.5 Flash</option>
              <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
              <option value="gpt-4o">OpenAI GPT-4o</option>
              <option value="gpt-4o-mini">OpenAI GPT-4o Mini</option>
              <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
            </select>
            <label className="form-label" style={{marginTop: 12}}>Системный промпт (Инструкция для AI)</label>
            <textarea className="input" rows={4} value={data.prompt || ''} onChange={(e) => onUpdate({ prompt: e.target.value })} placeholder="Ты — профессиональный консультант компании..." />
            <label className="form-label" style={{marginTop: 12}}>Max tokens</label>
            <input type="number" className="input" value={data.maxTokens || 1000} onChange={(e) => onUpdate({ maxTokens: parseInt(e.target.value) })} />
          </div>
        )}
        {node.type === 'aiAnalyze' && (
          <div className="form-group">
            <label className="form-label">Текст для AI анализа</label>
            <input type="text" className="input" value={data.text || ''} onChange={(e) => onUpdate({ text: e.target.value })} placeholder="{user_message}" />
            <label className="form-label" style={{marginTop: 12}}>Извлекаемая информация</label>
            <input type="text" className="input" value={data.field || ''} onChange={(e) => onUpdate({ field: e.target.value })} placeholder="Например: имя, телефон, дата" />
            <label className="form-label" style={{marginTop: 12}}>Сохранить результат в переменную</label>
            <input type="text" className="input" value={data.variable || ''} onChange={(e) => onUpdate({ variable: e.target.value })} placeholder="Masalan: extracted_phone" />
          </div>
        )}
        {node.type === 'aiTranslate' && (
          <div className="form-group">
            <label className="form-label">Исходный текст для перевода</label>
            <input type="text" className="input" value={data.text || ''} onChange={(e) => onUpdate({ text: e.target.value })} placeholder="{user_message}" />
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <div style={{flex: 1}}>
                <label className="form-label">С какого языка</label>
                <input type="text" className="input" value={data.fromLang || 'auto'} onChange={(e) => onUpdate({ fromLang: e.target.value })} placeholder="auto" />
              </div>
              <div style={{flex: 1}}>
                <label className="form-label">На какой язык</label>
                <input type="text" className="input" value={data.toLang || 'UZ'} onChange={(e) => onUpdate({ toLang: e.target.value })} placeholder="UZ" />
              </div>
            </div>
            <label className="form-label" style={{marginTop: 12}}>Сохранить результат (Переменная)</label>
            <input type="text" className="input" value={data.variable || 'translated_text'} onChange={(e) => onUpdate({ variable: e.target.value })} placeholder="translated_text" />
          </div>
        )}
        {node.type === 'aiImage' && (
          <div className="form-group">
            <label className="form-label">Промпт для генерации картинки</label>
            <textarea className="input" rows={3} value={data.prompt || ''} onChange={(e) => onUpdate({ prompt: e.target.value })} placeholder="Закат на морском побережье, фотореализм..." />
            <label className="form-label" style={{marginTop: 12}}>Model</label>
            <select className="input" value={data.model || 'dall-e-3'} onChange={(e) => onUpdate({ model: e.target.value })}>
              <option value="dall-e-3">DALL-E 3</option>
              <option value="midjourney">Midjourney API</option>
              <option value="stable-diffusion">Stable Diffusion 3</option>
            </select>
          </div>
        )}

        {/* === NEW NOTIFICATION BLOCKS === */}
        {node.type === 'notifyOperator' && (
          <div className="form-group">
            <label className="form-label">Telegram ID оператора</label>
            <input type="text" className="input" value={data.chatId || ''} onChange={(e) => onUpdate({ chatId: e.target.value })} placeholder="123456789" />
            <label className="form-label" style={{marginTop: 12}}>Текст сообщения</label>
            <textarea className="input" rows={3} value={data.text || ''} onChange={(e) => onUpdate({ text: e.target.value })} placeholder="Новый клиент: {name}, телефон: {phone}..." />
          </div>
        )}
        {node.type === 'notifyGroup' && (
          <div className="form-group">
            <label className="form-label">ID группы Telegram</label>
            <input type="text" className="input" value={data.groupId || ''} onChange={(e) => onUpdate({ groupId: e.target.value })} placeholder="-1001234567890" />
            <label className="form-label" style={{marginTop: 12}}>Текст сообщения</label>
            <textarea className="input" rows={3} value={data.text || ''} onChange={(e) => onUpdate({ text: e.target.value })} placeholder="Сообщение для группы..." />
          </div>
        )}
        {node.type === 'notifyChannel' && (
          <div className="form-group">
            <label className="form-label">ID или @username канала</label>
            <input type="text" className="input" value={data.channelId || ''} onChange={(e) => onUpdate({ channelId: e.target.value })} placeholder="@channel_name или -100123" />
            <label className="form-label" style={{marginTop: 12}}>Текст сообщения</label>
            <textarea className="input" rows={3} value={data.text || ''} onChange={(e) => onUpdate({ text: e.target.value })} placeholder="Текст сообщения для канала..." />
          </div>
        )}
        {node.type === 'email_notify' && (
          <div className="form-group">
            <label className="form-label">Email адрес получателя</label>
            <input type="email" className="input" value={data.to || ''} onChange={(e) => onUpdate({ to: e.target.value })} placeholder="admin@site.com" />
            <label className="form-label" style={{marginTop: 12}}>Тема письма (Subject)</label>
            <input type="text" className="input" value={data.subject || ''} onChange={(e) => onUpdate({ subject: e.target.value })} placeholder="Новый заказ с бота" />
            <label className="form-label" style={{marginTop: 12}}>Текст сообщения</label>
            <textarea className="input" rows={3} value={data.body || ''} onChange={(e) => onUpdate({ body: e.target.value })} placeholder="Данные клиента: {name}, телефон: {phone}..." />
          </div>
        )}

        {/* === NEW SCHEDULER BLOCKS === */}
        {node.type === 'schedule' && (
          <div className="form-group">
            <label className="form-label">Расписание Cron</label>
            <input type="text" className="input" value={data.cron || '* * * * *'} onChange={(e) => onUpdate({ cron: e.target.value })} placeholder="0 9 * * 1-5" />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Периодическая автоматическая рассылка в формате Cron.</span>
          </div>
        )}
        {node.type === 'reminder' && (
          <div className="form-group">
            <label className="form-label">Kutish vaqti</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="number" className="input" value={data.delayAmount || ''} onChange={(e) => onUpdate({ delayAmount: parseInt(e.target.value) || 0 })} placeholder="24" />
              <select className="input" value={data.delayUnit || 'hours'} onChange={(e) => onUpdate({ delayUnit: e.target.value })}>
                <option value="minutes">Daqiqa</option>
                <option value="hours">Soat</option>
                <option value="days">Kun</option>
              </select>
            </div>
            <label className="form-label" style={{marginTop: 12}}>Текст напоминания</label>
            <textarea className="input" rows={2} value={data.text || ''} onChange={(e) => onUpdate({ text: e.target.value })} placeholder="Вы не завершили оформление заказа в корзине..." />
          </div>
        )}
        {node.type === 'sequence' && (
          <div className="form-group">
            <label className="form-label">Количество сообщений в цепочке</label>
            <input type="number" className="input" value={data.count || 3} onChange={(e) => onUpdate({ count: parseInt(e.target.value) })} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Позволяет настроить автоматическую воронку сообщений по дням.</span>
          </div>
        )}

        {/* === NEW REFERRAL BLOCKS === */}
        {node.type === 'refCreate' && (
          <div className="form-group">
            <label className="form-label">Переменная для реферальной ссылки</label>
            <input type="text" className="input" value={data.variable || 'ref_link'} onChange={(e) => onUpdate({ variable: e.target.value })} placeholder="ref_link" />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Персональная реферальная ссылка клиента будет сохранена в эту переменную.</span>
          </div>
        )}
        {node.type === 'refCheck' && (
          <div className="form-group">
            <label className="form-label">Бонус пригласившему (баллы / рубли)</label>
            <input type="number" className="input" value={data.bonus || 0} onChange={(e) => onUpdate({ bonus: parseInt(e.target.value) })} placeholder="5000" />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>При переходе нового пользователя пригласивший автоматически получает эту сумму бонусов.</span>
          </div>
        )}
        {node.type === 'refLeaders' && (
          <div className="form-group">
            <label className="form-label">Количество участников в топе</label>
            <input type="number" className="input" value={data.count || 10} onChange={(e) => onUpdate({ count: parseInt(e.target.value) })} placeholder="10" />
            <label className="form-label" style={{marginTop: 12}}>Заголовок топа</label>
            <input type="text" className="input" value={data.title || '🏆 Топ лидеров по рефералам:'} onChange={(e) => onUpdate({ title: e.target.value })} />
          </div>
        )}

        {/* === NEW PAYMENT BLOCKS === */}
        {node.type === 'stars' && (
          <div className="form-group">
            <label className="form-label">Количество Telegram Stars</label>
            <input type="number" className="input" value={data.amount || ''} onChange={(e) => onUpdate({ amount: parseInt(e.target.value) || 0 })} placeholder="Например: 50" />
            <label className="form-label" style={{marginTop: 12}}>Название товара или услуги</label>
            <input type="text" className="input" value={data.title || ''} onChange={(e) => onUpdate({ title: e.target.value })} placeholder="VIP Подписка" />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Клиент оплачивает покупку напрямую через Telegram Stars в один клик.</span>
          </div>
        )}
        {node.type === 'uzumbank' && (
          <div className="form-group">
            <label className="form-label">Сумма к оплате (UZS)</label>
            <input type="number" className="input" value={data.price || ''} onChange={(e) => onUpdate({ price: parseInt(e.target.value) || 0 })} placeholder="Masalan: 50000" />
            <label className="form-label" style={{marginTop: 12}}>Назначение платежа</label>
            <input type="text" className="input" value={data.title || ''} onChange={(e) => onUpdate({ title: e.target.value })} placeholder="Оплата заказа..." />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Создает ссылку для быстрой оплаты через Uzum Bank.</span>
          </div>
        )}

        {/* === NEW CRM INTEGRATION BLOCKS === */}
        {node.type === 'amocrm' && (
          <div className="form-group">
            <label className="form-label">Действие в AmoCRM</label>
            <select className="input" value={data.action || 'create_contact'} onChange={(e) => onUpdate({ action: e.target.value })}>
              <option value="create_contact">Создать контакт</option>
              <option value="create_lead">Создать сделку (Lead)</option>
              <option value="add_note">Добавить примечание</option>
            </select>
            <label className="form-label" style={{marginTop: 12}}>Переменная с именем</label>
            <input type="text" className="input" value={data.nameVar || '{name}'} onChange={(e) => onUpdate({ nameVar: e.target.value })} />
            <label className="form-label" style={{marginTop: 12}}>Переменная с телефоном</label>
            <input type="text" className="input" value={data.phoneVar || '{phone}'} onChange={(e) => onUpdate({ phoneVar: e.target.value })} />
          </div>
        )}
        {node.type === 'bitrix' && (
          <div className="form-group">
            <label className="form-label">Действие в Bitrix24</label>
            <select className="input" value={data.action || 'crm.lead.add'} onChange={(e) => onUpdate({ action: e.target.value })}>
              <option value="crm.lead.add">Создать лид</option>
              <option value="crm.contact.add">Создать контакт</option>
              <option value="crm.deal.add">Создать сделку</option>
            </select>
            <label className="form-label" style={{marginTop: 12}}>Переменная с именем</label>
            <input type="text" className="input" value={data.nameVar || '{name}'} onChange={(e) => onUpdate({ nameVar: e.target.value })} />
            <label className="form-label" style={{marginTop: 12}}>Переменная с телефоном</label>
            <input type="text" className="input" value={data.phoneVar || '{phone}'} onChange={(e) => onUpdate({ phoneVar: e.target.value })} />
          </div>
        )}
      </div>

      <div className="properties-footer" style={{ display: 'flex', gap: '8px' }}>
        {onDelete && (
          <button className="btn btn-error" onClick={onDelete} style={{ padding: '8px 12px' }}>
            <Trash2 size={14}/> Удалить
          </button>
        )}
        <button className="btn btn-primary flex-1" onClick={onClose}><Save size={14}/> Закрыть</button>
      </div>
    </div>
  )
}
