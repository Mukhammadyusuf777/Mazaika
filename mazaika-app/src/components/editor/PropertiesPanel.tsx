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
          {data.label || 'Blok'} sozlamalari
        </div>
        <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
      </div>

      <div className="properties-content">
        
        {/* === START NODE === */}
        {node.type === 'start' && (
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>
              Bu blok foydalanuvchi botni ilk bor ishga tushirganda (<strong>/start</strong> buyrug'ini yuborganda) faollashadi.
            </p>
            <div style={{ background: 'rgba(30,144,255,0.06)', borderLeft: '3px solid #1e90ff', padding: '10px 12px', borderRadius: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
              💡 <strong>Referal havola / Kampaniyalar:</strong><br />
              Agar foydalanuvchi botga referal havola orqali kirgan bo'lsa, havola parametri avtomatik ravishda <code>{"{start_payload}"}</code> o'zgaruvchisiga yoziladi. Uni boshqa bloklarda ishlatishingiz mumkin!
            </div>
          </div>
        )}


        {/* === MESSAGE NODE === */}
        {node.type === 'message' && (
          <>
            <div className="form-group">
              <label className="form-label">Xabar matni</label>
              <textarea
                className="input"
                rows={5}
                value={data.text || ''}
                onChange={(e) => onUpdate({ text: e.target.value })}
                placeholder="Foydalanuvchiga yuboriladigan xabar..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rasm yoki Video URL (ixtiyoriy)</label>
              <input
                type="text"
                className="input"
                value={data.mediaUrl || ''}
                onChange={(e) => onUpdate({ mediaUrl: e.target.value })}
                placeholder="Masalan: https://site.com/photo.jpg"
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Rasm (.jpg, .png) yoki video (.mp4) havolasi. Agar qo'shilsa, xabar matni taglavha (caption) bo'lib yuboriladi.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Tugmalar (Inline Buttons)</label>
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
                      placeholder="Tugma nomi yoki Nomi|havola"
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
                  onClick={() => onUpdate({ buttons: [...(data.buttons || []), 'Yangi tugma'] })}
                >
                  <Plus size={14} /> Tugma qo'shish
                </button>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: 6, fontSize: 11, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span>🔗 <strong>Tugma formatlari:</strong></span>
                  <span>- Oddiy tugma: <code>Katalog</code> (ssenariy bo'yicha o'tish)</span>
                  <span>- Sayt havolasi: <code>Sayt|https://site.com</code> (saytga o'tish)</span>
                  <span>- Telegram Mini App: <code>Do'kon|webapp:https://site.com</code> (Mini App ochish)</span>
                </div>
              </div>
            </div>
          </>
        )}


        {/* === CHAIN NODE === */}
        {node.type === 'chain' && (
          <div className="form-group">
            <label className="form-label">O'tish kerak bo'lgan Blok</label>
            <select
              className="input"
              value={data.targetNodeId || ''}
              onChange={(e) => onUpdate({ targetNodeId: e.target.value })}
            >
              <option value="">-- Blokni tanlang --</option>
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
              Tanlangan blok ssenariy bajarilganda foydalanuvchiga hech qanday xabarsiz va kutishlarsiz uzatiladi (Jump / Goto).
            </span>
          </div>
        )}


        {/* === TIMER (DELAY) NODE === */}
        {node.type === 'timer' && (
          <div className="form-group">
            <label className="form-label">Kutish vaqti</label>
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
                <option value="seconds">Soniya</option>
                <option value="minutes">Daqiqa</option>
                <option value="hours">Soat</option>
                <option value="days">Kun</option>
              </select>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              Belgilangan vaqt o'tgandan so'ng bot avtomatik ravishda keyingi blokka o'tadi.
            </span>
          </div>
        )}


        {/* === QUESTION NODE (MATNLI SAVOL) === */}
        {node.type === 'question' && (
          <>
            <div className="form-group">
              <label className="form-label">Savol matni (Mijozga yuboriladigan xabar)</label>
              <textarea
                className="input"
                rows={4}
                value={data.text || ''}
                onChange={(e) => onUpdate({ text: e.target.value })}
                placeholder="Mijozga yuboriladigan savol matnini bu yerga yozing..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rasm yoki video havolasi (Majburiy emas)</label>
              <input
                type="text"
                className="input"
                value={data.mediaUrl || ''}
                onChange={(e) => onUpdate({ mediaUrl: e.target.value })}
                placeholder="Masalan: https://site.com/photo.jpg"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Javobni eslab qolish uchun nom (O'zgaruvchi)</label>
              <input
                type="text"
                className="input"
                value={data.variable || ''}
                onChange={(e) => onUpdate({ variable: e.target.value })}
                placeholder="Masalan: ism, yosh, shahar"
                required
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Mijoz yozgan javob ushbu nom ostida saqlanadi va uni keyingi xabarlarda ishlatish mumkin.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Tayyor javob tugmalari (Mijoz tanlashi uchun - ixtiyoriy)</label>
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
                      placeholder="Masalan: Ha"
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
                  <Plus size={14} /> Variant tugma qo'shish
                </button>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Tugmalar qo'shsangiz, mijoz javobni qo'lda yozib o'tirmasdan, tugmani bosib osongina javob berishi mumkin.
                </span>
              </div>
            </div>
          </>
        )}

        {/* === PHONE NODE (TELEFON RAQAM) === */}
        {node.type === 'phone' && (
          <>
            <div className="form-group">
              <label className="form-label">Telefon so'rash matni</label>
              <textarea
                className="input"
                rows={3}
                value={data.text || ''}
                onChange={(e) => onUpdate({ text: e.target.value })}
                placeholder="Masalan: Iltimos, telefon raqamingizni yuboring:"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tugma ustidagi yozuv (ixtiyoriy)</label>
              <input
                type="text"
                className="input"
                value={data.buttonText || ''}
                onChange={(e) => onUpdate({ buttonText: e.target.value })}
                placeholder="📞 Raqamni yuborish"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Raqamni eslab qolish uchun nom (O'zgaruvchi)</label>
              <input
                type="text"
                className="input"
                value={data.variable || ''}
                onChange={(e) => onUpdate({ variable: e.target.value })}
                placeholder="Masalan: telefon"
              />
            </div>
          </>
        )}

        {/* === EMAIL NODE (EMAIL MANZIL) === */}
        {node.type === 'email' && (
          <>
            <div className="form-group">
              <label className="form-label">Email so'rash matni</label>
              <textarea
                className="input"
                rows={3}
                value={data.text || ''}
                onChange={(e) => onUpdate({ text: e.target.value })}
                placeholder="Masalan: Iltimos, email manzilingizni kiriting:"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Emailni eslab qolish uchun nom (O'zgaruvchi)</label>
              <input
                type="text"
                className="input"
                value={data.variable || ''}
                onChange={(e) => onUpdate({ variable: e.target.value })}
                placeholder="Masalan: email"
              />
            </div>
          </>
        )}

        {/* === LOCATION NODE (LOKATSIYA) === */}
        {node.type === 'location' && (
          <>
            <div className="form-group">
              <label className="form-label">Joylashuvni (lokatsiyani) so'rash matni</label>
              <textarea
                className="input"
                rows={3}
                value={data.text || ''}
                onChange={(e) => onUpdate({ text: e.target.value })}
                placeholder="Masalan: Buyurtmani yetkazish uchun turgan joyingizni (lokatsiyani) jo'nating:"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tugma ustidagi yozuv (ixtiyoriy)</label>
              <input
                type="text"
                className="input"
                value={data.buttonText || ''}
                onChange={(e) => onUpdate({ buttonText: e.target.value })}
                placeholder="📍 Lokatsiyani yuborish"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Joylashuvni eslab qolish uchun nom (O'zgaruvchi)</label>
              <input
                type="text"
                className="input"
                value={data.variable || ''}
                onChange={(e) => onUpdate({ variable: e.target.value })}
                placeholder="Masalan: manzil"
              />
            </div>
          </>
        )}





        {/* === CONDITION NODE === */}
        {node.type === 'condition' && (
          <>
            <div className="form-group">
              <label className="form-label">Tekshiriladigan ma'lumot (O'zgaruvchi)</label>
              <input
                type="text"
                className="input"
                value={data.variable || ''}
                onChange={(e) => onUpdate({ variable: e.target.value })}
                placeholder="Masalan: ism"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tekshirish turi (Shart)</label>
              <select
                className="input"
                value={data.operator || '=='}
                onChange={(e) => onUpdate({ operator: e.target.value })}
              >
                <option value="==">Teng bo'lsa (==)</option>
                <option value="!=">Teng emas bo'lsa (!=)</option>
                <option value="contains">Matn ichida qatnashsa (Contains)</option>
                <option value=">">Katta bo'lsa (&gt;)</option>
                <option value="<">Kichik bo'lsa (&lt;)</option>
                <option value="is_empty">Kiritilmagan bo'lsa (Bo'sh / Is Empty)</option>
                <option value="is_filled">Kiritilgan bo'lsa (To'ldirilgan / Is Set)</option>
                <option value="regex">Maxsus qolipga mos kelsa (Regex)</option>
              </select>
            </div>
            {!(data.operator === 'is_empty' || data.operator === 'is_filled') && (
              <div className="form-group">
                <label className="form-label">Solishtiriladigan qiymat (Nima bilan solishtiramiz?)</label>
                <input
                  type="text"
                  className="input"
                  value={data.value || ''}
                  onChange={(e) => onUpdate({ value: e.target.value })}
                  placeholder={data.operator === 'regex' ? 'Masalan: ^[0-9]+$ (Faqat raqamlar)' : 'Qiymat yozing...'}
                />
              </div>
            )}
          </>
        )}


        {/* === SUBSCRIPTION NODE (KANALGA A'ZOLIK) === */}
        {node.type === 'subscription' && (
          <>
            <div className="form-group">
              <label className="form-label">Telegram kanal manzili</label>
              <input
                type="text"
                className="input"
                value={data.channel || ''}
                onChange={(e) => onUpdate({ channel: e.target.value })}
                placeholder="Masalan: @kanal_nomi"
                required
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                ⚠️ <b>Muhim eslatma:</b> Botimiz ushbu kanalda <b>Administrator (admin)</b> bo'lishi va foydalanuvchilar ro'yxatini ko'rish huquqiga ega bo'lishi shart, aks holda tekshira olmaydi!
              </span>
            </div>
          </>
        )}

        {node.type === 'variable' && (
          <>
            <div className="form-group">
              <label className="form-label">Ma'lumot nomi (O'zgaruvchi)</label>
              <input
                type="text"
                className="input"
                value={data.variableName || ''}
                onChange={(e) => onUpdate({ variableName: e.target.value })}
                placeholder="Masalan: buyurtma_soni"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unga beriladigan qiymat</label>
              <input
                type="text"
                className="input"
                value={data.variableValue || ''}
                onChange={(e) => onUpdate({ variableValue: e.target.value })}
                placeholder="Masalan: 1 yoki Matn..."
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                💡 <b>Nima yozsa bo'ladi:</b><br />
                - Boshqa ma'lumotni qo'shish: <code>{`Salom {ism}!`}</code> (Mijoz ismini qo'yib beradi)<br />
                - Matematik hisob-kitoblar: <code>{`{ball} + 1`}</code> (Mijoz ballariga 1 qo'shadi)
              </span>
            </div>
          </>
        )}


        {/* === VARIABLE DELETE NODE === */}
        {node.type === 'deleteVariable' && (
          <div className="form-group">
            <label className="form-label">O'chiriladigan ma'lumotlar nomi</label>
            <input
              type="text"
              className="input"
              value={data.variableName || ''}
              onChange={(e) => onUpdate({ variableName: e.target.value })}
              placeholder="Masalan: ism, telefon"
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              💡 <b>Maslahat:</b> Bir nechta ma'lumotlarni birdaniga o'chirish uchun ularni vergul bilan ajratib yozing (Masalan: <code>ism, telefon, shahar</code>).
            </span>
          </div>
        )}


        {/* === A/B TEST NODE === */}
        {node.type === 'abTest' && (
          <>
            <div className="form-group">
              <label className="form-label">Variant A oqimi foizi (%)</label>
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
                <span>Variant A (Birinchi yo'nalish): {data.ratioA !== undefined ? data.ratioA : 50}%</span>
                <span>Variant B (Ikkinchi yo'nalish): {100 - (data.ratioA !== undefined ? data.ratioA : 50)}%</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Guruh nomini eslab qolish uchun o'zgaruvchi (ixtiyoriy)</label>
              <input
                type="text"
                className="input"
                value={data.variable || ''}
                onChange={(e) => onUpdate({ variable: e.target.value })}
                placeholder="Masalan: qaysi_guruh"
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Foydalanuvchi qaysi variantga tushganligini (A yoki B) eslab qoladi.
              </span>
            </div>
          </>
        )}


        {/* === JAVASCRIPT NODE === */}
        {node.type === 'javascript' && (
          <>
            <div className="form-group">
              <label className="form-label">Matematik amal yoki formula</label>
              <textarea
                className="input"
                rows={3}
                value={data.code || ''}
                onChange={(e) => onUpdate({ code: e.target.value })}
                placeholder="Masalan: narx * 0.15"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Natijani eslab qolish uchun o'zgaruvchi nomi</label>
              <input
                type="text"
                className="input"
                value={data.variable || ''}
                onChange={(e) => onUpdate({ variable: e.target.value })}
                placeholder="Masalan: soliq_miqdori"
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                💡 <b>Foydalanish qoidalari:</b><br />
                - Ma'lumotlarni to'g'ridan-to'g'ri ismlari bilan formulada ishlatish mumkin: <code>narx * 0.15</code> yoki <code>ism.toUpperCase()</code>.<br />
                - Raqam ko'rinishidagi yozuvlar avtomatik ravishda haqiqiy songa aylantiriladi.<br />
                - Matematik funksiyalarni ishlatish mumkin: <code>Math.max(10, ball)</code> yoki <code>Date.now()</code>.
              </span>
            </div>
          </>
        )}


        {/* === HTTP SO'ROV (HTTP REQUEST) NODE === */}
        {node.type === 'http' && (
          <>
            <div className="form-group">
              <label className="form-label">So'rov turi (GET yoki POST)</label>
              <select
                className="input"
                value={data.method || 'GET'}
                onChange={(e) => onUpdate({ method: e.target.value })}
              >
                <option value="GET">GET (Ma'lumot olish)</option>
                <option value="POST">POST (Ma'lumot yuborish)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tashqi tizim manzili (URL havola)</label>
              <input
                type="text"
                className="input"
                value={data.url || ''}
                onChange={(e) => onUpdate({ url: e.target.value })}
                placeholder="https://api.example.com/endpoint"
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Havola ichida o'zgaruvchilarni ishlatish mumkin. Masalan: <code>{`https://site.com/obhavo?shahar={shahar}`}</code>
              </span>
            </div>

            {data.method === 'POST' && (
              <div className="form-group">
                <label className="form-label">Yuboriladigan ma'lumotlar (Request Body - JSON formatda)</label>
                <textarea
                  className="input"
                  rows={4}
                  value={data.body || ''}
                  onChange={(e) => onUpdate({ body: e.target.value })}
                  placeholder='{"ism": "{ism}", "tel": "{telefon}"}'
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  JSON formatda ma'lumot jo'natishingiz mumkin. O'zgaruvchilar avtomatik joylashtiriladi.
                </span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Tizim javobini qaysi o'zgaruvchiga saqlaymiz?</label>
              <input
                type="text"
                className="input"
                value={data.variable || ''}
                onChange={(e) => onUpdate({ variable: e.target.value })}
                placeholder="Masalan: response_data"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Javobdan kerakli kalitni ajratib olish (JSON Path - Ixtiyoriy)</label>
              <input
                type="text"
                className="input"
                value={data.jsonPath || ''}
                onChange={(e) => onUpdate({ jsonPath: e.target.value })}
                placeholder="Masalan: obhavo.harorat yoki id"
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Agar tashqi tizim JSON javob qaytarsa, kerakli kalitni yozib faqat o'sha qiymatni ajratib olishingiz mumkin.
              </span>
            </div>
          </>
        )}

        {/* === WEBHOOK NODE (WEBHOOK JO'NATISH) === */}
        {node.type === 'webhook' && (
          <>
            <div className="form-group">
              <label className="form-label">Jo'natish turi (Method)</label>
              <select
                className="input"
                value={data.method || 'POST'}
                onChange={(e) => onUpdate({ method: e.target.value })}
              >
                <option value="POST">POST (Tavsiya etiladi - barcha ma'lumotlarni yuboradi)</option>
                <option value="GET">GET (Faqat havolaga murojaat qiladi)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tizim manzili (Webhook URL)</label>
              <input
                type="text"
                className="input"
                value={data.url || ''}
                onChange={(e) => onUpdate({ url: e.target.value })}
                placeholder="https://hook.us1.make.com/..."
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                💡 <b>Tushuntirish:</b> Ushbu blok botdagi barcha to'plangan mijoz ma'lumotlarini (ism, telefon va hk.) avtomatik ravishda boshqa servisga (masalan: Make.com, Zapier yoki Google Sheets) yuborish uchun xizmat qiladi. Havola ichida o'zgaruvchilarni ham ishlatish mumkin.
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
                <option value="POST">POST (Tavsiya etiladi - avtomatik ma'lumot uzatish)</option>
                <option value="GET">GET (O'zgaruvchilarni havola orqali uzatish)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Google Web App (Jadval) havolasi</label>
              <input
                type="text"
                className="input"
                value={data.url || ''}
                onChange={(e) => onUpdate({ url: e.target.value })}
                placeholder="https://script.google.com/macros/s/.../exec"
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                💡 <b>Tushuntirish:</b> Ushbu blok yordamida botdagi ma'lumotlarni Google Jadvalingizga (Google Sheets) avtomatik yozishingiz mumkin. Google Apps Script havolasini kiriting.<br />
                - Agar <code>GET</code> tanlansa, o'zgaruvchilarni havola ichida yuborishingiz mumkin: <code>.../exec?ism={"{ism}"}&amp;tel={"{telefon}"}</code>.
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
              <label className="form-label">Javobni eslab qolish uchun o'zgaruvchi</label>
              <input
                type="text"
                className="input"
                value={data.variable || ''}
                onChange={(e) => onUpdate({ variable: e.target.value })}
                placeholder="Masalan: jadval_javobi"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Javobdan kerakli kalitni ajratib olish (JSON Path - Ixtiyoriy)</label>
              <input
                type="text"
                className="input"
                value={data.jsonPath || ''}
                onChange={(e) => onUpdate({ jsonPath: e.target.value })}
                placeholder="Masalan: kurs.usd yoki narx"
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                💡 <b>Tushuntirish:</b> Google Jadvaldan ma'lumotlarni yuklab olish uchun mo'ljallangan. Agar jadval skripti JSON formatida javob qaytarsa, kerakli kalitni yozib, o'sha qiymatni ajratib olish mumkin.
              </span>
            </div>
          </>
        )}





        {/* === GETCOURSE INTEGRATION === */}
        {node.type === 'getCourse' && (
          <>
            <div className="form-group">
              <label className="form-label">Amal turi (GetCourse Action)</label>
              <select
                className="input"
                value={data.action || 'deal'}
                onChange={(e) => onUpdate({ action: e.target.value })}
              >
                <option value="deal">Buyurtma yaratish (Deal / Order)</option>
                <option value="user">Mijoz qo'shish (Add / Register User)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">GetCourse Maktab manzili (Domain)</label>
              <input
                type="text"
                className="input"
                value={data.domain || ''}
                onChange={(e) => onUpdate({ domain: e.target.value })}
                placeholder="Masalan: school.getcourse.ru"
              />
            </div>
            <div className="form-group">
              <label className="form-label">API Kalit (API Key)</label>
              <input
                type="text"
                className="input"
                value={data.apiKey || ''}
                onChange={(e) => onUpdate({ apiKey: e.target.value })}
                placeholder="GetCourse profilingizdan olingan API Kalit..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mijoz ismi saqlangan o'zgaruvchi</label>
              <input
                type="text"
                className="input"
                value={data.nameVar || 'ism'}
                onChange={(e) => onUpdate({ nameVar: e.target.value })}
                placeholder="Masalan: ism"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Telefon raqami saqlangan o'zgaruvchi</label>
              <input
                type="text"
                className="input"
                value={data.phoneVar || 'telefon'}
                onChange={(e) => onUpdate({ phoneVar: e.target.value })}
                placeholder="Masalan: telefon"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email manzili saqlangan o'zgaruvchi</label>
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
                <label className="form-label">Tarif kodi (Offer Code)</label>
                <input
                  type="text"
                  className="input"
                  value={data.offerCode || ''}
                  onChange={(e) => onUpdate({ offerCode: e.target.value })}
                  placeholder="Masalan: premium_tarif"
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  💡 GetCourse dagi taklif (offer) kodi. O'zgaruvchilarni ham ishlatish mumkin (Masalan: <code>{`{tarif}`}</code>).
                </span>
              </div>
            )}
          </>
        )}

        {/* === YCLIENTS INTEGRATION === */}
        {node.type === 'yclients' && (
          <>
            <div className="form-group">
              <label className="form-label">Kompaniya ID (Company / Salon ID)</label>
              <input
                type="text"
                className="input"
                value={data.companyId || ''}
                onChange={(e) => onUpdate({ companyId: e.target.value })}
                placeholder="Masalan: 123456"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hamkor kaliti (Partner Token / API Key)</label>
              <input
                type="text"
                className="input"
                value={data.apiKey || ''}
                onChange={(e) => onUpdate({ apiKey: e.target.value })}
                placeholder="Yclients hamkorlik kaliti..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Foydalanuvchi kaliti (User Token - ixtiyoriy)</label>
              <input
                type="text"
                className="input"
                value={data.userToken || ''}
                onChange={(e) => onUpdate({ userToken: e.target.value })}
                placeholder="Yclients xodimining shaxsiy kaliti..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mijoz ismi saqlangan o'zgaruvchi</label>
              <input
                type="text"
                className="input"
                value={data.nameVar || 'ism'}
                onChange={(e) => onUpdate({ nameVar: e.target.value })}
                placeholder="Masalan: ism"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Telefon raqami saqlangan o'zgaruvchi</label>
              <input
                type="text"
                className="input"
                value={data.phoneVar || 'telefon'}
                onChange={(e) => onUpdate({ phoneVar: e.target.value })}
                placeholder="Masalan: telefon"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email manzili saqlangan o'zgaruvchi</label>
              <input
                type="text"
                className="input"
                value={data.emailVar || 'email'}
                onChange={(e) => onUpdate({ emailVar: e.target.value })}
                placeholder="Masalan: email"
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                💡 <b>Tushuntirish:</b> Bot orqali kelgan yangi mijozlar ro'yxatini Yclients bazasiga avtomatik ravishda yangi mijoz kartasi qilib yozib boradi.
              </span>
            </div>
          </>
        )}


        {/* === PAYMENTS (PAYME, CLICK, YOOKASSA, CRYPTOPAY) === */}
        {['payme', 'click', 'yookassa', 'cryptopay'].includes(node.type || '') && (
          <>
            <div className="form-group">
              <label className="form-label">Mahsulot yoki xizmat nomi</label>
              <input
                type="text"
                className="input"
                value={data.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Masalan: Kurs uchun to'lov"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Narxi (so'mda)</label>
              <input
                type="text"
                className="input"
                value={data.price || ''}
                onChange={(e) => onUpdate({ price: e.target.value })}
                placeholder="Masalan: 99000 yoki {jami_narx}"
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                💡 Maydonga to'g'ridan-to'g'ri raqam yozish yoki oldingi hisoblangan narx o'zgaruvchisini qavs ichida yozish mumkin (Masalan: <code>{`{jami_narx}`}</code>).
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
                placeholder="Provider Token..."
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                💡 Ushbu kalit Telegramdagi @BotFather boti orqali to'lov tizimini ulanganda beriladi.
              </span>
            </div>
          </>
        )}

        {/* === CRM BLOCK (DEALSTAGE, ASSIGNEE) === */}
        {node.type === 'dealStage' && (
          <div className="form-group">
            <label className="form-label">Mijozning CRM dagi bosqichi (Ustun)</label>
            <select
              className="input"
              value={data.stage || 'Yangi'}
              onChange={(e) => onUpdate({ stage: e.target.value })}
            >
              <option value="Yangi">Yangi (New)</option>
              <option value="Jarayonda">Jarayonda (In Progress)</option>
              <option value="Muvaffaqiyatli">Muvaffaqiyatli (Done)</option>
              <option value="Rad etildi">Rad etildi (Rejected)</option>
            </select>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              💡 <b>Tushuntirish:</b> Mijoz ushbu bosqichga yetib kelganida, u Mazaika panelidagi (Kanban doskasi) mos ustunga avtomatik ravishda ko'chib o'tadi (Masalan: to'lov qilgandan keyin "Muvaffaqiyatli" ustuniga).
            </span>
          </div>
        )}

        {node.type === 'assignee' && (
          <div className="form-group">
            <label className="form-label">Mas'ul xodim (Adminga biriktirish)</label>
            <input
              type="text"
              className="input"
              value={data.agent || ''}
              onChange={(e) => onUpdate({ agent: e.target.value })}
              placeholder="Masalan: Azizbek"
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              💡 <b>Tushuntirish:</b> Ushbu mijoz bilan yozishmalarni nazorat qilishni belgilangan mas'ul xodimga avtomatik ravishda topshiradi.
            </span>
          </div>
        )}

        {/* === CART & ORDERS === */}
        {node.type === 'cart' && (
          <>
            <div className="form-group">
              <label className="form-label">Savat amali (Action)</label>
              <select
                className="input"
                value={data.cartAction || 'add'}
                onChange={(e) => onUpdate({ cartAction: e.target.value })}
              >
                <option value="add">Mahsulot qo'shish (Add to cart)</option>
                <option value="remove">Mahsulotni o'chirish (Remove from cart)</option>
                <option value="clear">Savatni tozalash (Clear cart)</option>
              </select>
            </div>
            
            {data.cartAction !== 'clear' && (
              <div className="form-group">
                <label className="form-label">Mahsulot nomi</label>
                <input
                  type="text"
                  className="input"
                  value={data.itemName || ''}
                  onChange={(e) => onUpdate({ itemName: e.target.value })}
                  placeholder="Masalan: Pizza Margerita"
                />
              </div>
            )}

            {data.cartAction === 'add' && (
              <>
                <div className="form-group">
                  <label className="form-label">Mahsulot narxi (so'mda - ixtiyoriy)</label>
                  <input
                    type="text"
                    className="input"
                    value={data.itemPrice || ''}
                    onChange={(e) => onUpdate({ itemPrice: e.target.value })}
                    placeholder="Masalan: 55000"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mahsulot soni / miqdori (ixtiyoriy)</label>
                  <input
                    type="text"
                    className="input"
                    value={data.itemQty || ''}
                    onChange={(e) => onUpdate({ itemQty: e.target.value })}
                    placeholder="Masalan: 1 yoki {miqdori}"
                  />
                </div>
              </>
            )}

            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginTop: 8 }}>
              💡 <b>Tushuntirish:</b> Savat avtomatik ravishda quyidagi o'zgaruvchilarni yangilaydi va ularni keyingi xabarlarda ishlatish mumkin:<br />
              - <code>{`{cart_text}`}</code>: Savatdagi mahsulotlar ro'yxati matni.<br />
              - <code>{`{cart_total}`}</code>: Savatdagi jami summa (Payme/Click ga berish uchun).<br />
              - <code>{`{cart_items_count}`}</code>: Savatdagi jami mahsulotlar soni.
            </span>
          </>
        )}
        {/* === ORDERLIST BLOCK === */}
        {node.type === 'orderList' && (
          <>
            <div className="form-group">
              <label className="form-label">Savat bo'sh bo'lgandagi xabar</label>
              <input
                type="text"
                className="input"
                value={data.emptyMessage || ''}
                onChange={(e) => onUpdate({ emptyMessage: e.target.value })}
                placeholder="Masalan: Savatingiz hozircha bo'sh."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Buyurtma ro'yxati sarlavhasi</label>
              <input
                type="text"
                className="input"
                value={data.headerText || ''}
                onChange={(e) => onUpdate({ headerText: e.target.value })}
                placeholder="Masalan: Sizning buyurtmalaringiz:"
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                💡 <b>Tushuntirish:</b> Ushbu blok mijozga uning savatidagi barcha mahsulotlarni, ularning narxi, soni va jami hisob-kitob summasini to'liq ko'rsatib beradi.
              </span>
            </div>
          </>
        )}


        {/* === SUBSCRIBER MANAGEMENT (ADDTAG, REMOVETAG) === */}
        {node.type === 'addTag' && (
          <div className="form-group">
            <label className="form-label">Qo'shiladigan teg (kategoriya) nomi</label>
            <input
              type="text"
              className="input"
              value={data.tagName || ''}
              onChange={(e) => onUpdate({ tagName: e.target.value })}
              placeholder="Masalan: VIP, Doimiy_mijoz, Kurs_talabasi"
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              💡 <b>Tushuntirish:</b> Mijoz ushbu bosqichga yetib kelganida, uning profiliga ushbu belgi (teg) avtomatik ravishda yopishtiriladi. Keyinchalik admin panelda mijozlarni teglari bo'yicha saralash juda oson bo'ladi.
            </span>
          </div>
        )}

        {node.type === 'removeTag' && (
          <div className="form-group">
            <label className="form-label">O'chiriladigan teg (kategoriya) nomi</label>
            <input
              type="text"
              className="input"
              value={data.tagName || ''}
              onChange={(e) => onUpdate({ tagName: e.target.value })}
              placeholder="Masalan: Yangi_mijoz"
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              💡 <b>Tushuntirish:</b> Mijoz ushbu bosqichga kelganda, uning profilidan belgilangan teg (belgi) avtomatik tarzda olib tashlanadi (Masalan: doimiy mijozga aylanganida "Yangi_mijoz" tegi o'chiriladi).
            </span>
          </div>
        )}

        {/* === BALANCE MANAGEMENT (TOPUPBALANCE, DEBITBALANCE) === */}
        {node.type === 'topUpBalance' && (
          <div className="form-group">
            <label className="form-label">Balansni to'ldirish summasi (so'mda)</label>
            <input
              type="text"
              className="input"
              value={data.amount || ''}
              onChange={(e) => onUpdate({ amount: e.target.value })}
              placeholder="Masalan: 5000 yoki {bonus_summasi}"
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              💡 <b>Tushuntirish:</b> Mijozning bot ichidagi shaxsiy virtual hamyonini belgilangan summaga to'ldiradi (Keshbek yoki sodiqlik bonuslari uchun). O'zgaruvchilarni qavs ichida yozish mumkin (Masalan: <code>{`{cashback}`}</code>).
            </span>
          </div>
        )}

        {node.type === 'debitBalance' && (
          <div className="form-group">
            <label className="form-label">Balansdan yechib olish summasi (so'mda)</label>
            <input
              type="text"
              className="input"
              value={data.amount || ''}
              onChange={(e) => onUpdate({ amount: e.target.value })}
              placeholder="Masalan: 3000 yoki {yechish_summasi}"
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              💡 <b>Tushuntirish:</b> Mijozning bot ichidagi virtual hamyonidan belgilangan summani yechib oladi (Masalan: bonus ballar hisobiga chegirma berish uchun).
            </span>
          </div>
        )}

        {/* === DELETEUSER BLOCK === */}
        {node.type === 'deleteUser' && (
          <div className="form-group">
            <label className="form-label">Tozalash / O'chirish turi</label>
            <select
              className="input"
              value={data.deleteType || 'memory'}
              onChange={(e) => onUpdate({ deleteType: e.target.value })}
            >
              <option value="memory">Faqat bot xotirasini tozalash (Wipe variables)</option>
              <option value="database">Mijozni CRM bazasidan butunlay o'chirish (Delete Contact)</option>
            </select>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, display: 'block' }}>
              💡 <b>Bot xotirasi tozalanganda:</b> Mijozning barcha to'plangan o'zgaruvchilari (ism, telefon, email va h.k.) va savat ma'lumotlari o'chiriladi. Mijoz CRM panelida saqlanib qoladi.<br /><br />
              💡 <b>CRM bazasidan o'chirilganda:</b> Mijoz profili, u bilan bo'lgan barcha chat yozishmalari va ma'lumotlar butunlay o'chiriladi. Mijoz botga qayta kirganida yangi obunachi sifatida boshlaydi.
            </span>
          </div>
        )}

        {/* === VOTING BLOCKS === */}
        {node.type === 'voterRegister' && (
          <div className="form-group">
            <label className="form-label">Nomzod yoki loyiha nomi</label>
            <input
              type="text"
              className="input"
              value={data.candidate || ''}
              onChange={(e) => onUpdate({ candidate: e.target.value })}
              placeholder="Masalan: Nomzod A yoki {tanlov}"
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              💡 <b>Tushuntirish:</b> Mijoz ushbu blokdan o'tganida u ko'rsatilgan nomzod uchun 1 ta ovoz beradi. Tizim takroriy ovoz berishni (nakrutkani) butunlay cheklaydi (bir kishi faqat 1 marta ovoz beradi).
            </span>
          </div>
        )}

        {node.type === 'voteLeaders' && (
          <div className="form-group">
            <label className="form-label">Reytingni ko'rsatish sozlamasi</label>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              💡 Ushbu blok mijozga barcha nomzodlarning to'plagan ovozlarini real vaqtda saralab (eng ko'p ovoz olganidan kamiga) ko'rsatib beradi. Qo'shimcha sozlamalar talab etilmaydi.
            </p>
          </div>
        )}
      </div>

      <div className="properties-footer" style={{ display: 'flex', gap: '8px' }}>
        {onDelete && (
          <button className="btn btn-error" onClick={onDelete} style={{ padding: '8px 12px' }}>
            <Trash2 size={14}/> O'chirish
          </button>
        )}
        <button className="btn btn-primary flex-1" onClick={onClose}><Save size={14}/> Yopish</button>
      </div>
    </div>
  )
}
