import { X, Save, Trash2, Plus } from 'lucide-react'

interface NodeLike {
  id: string
  type?: string
  data: Record<string, any>
}

interface PropertiesPanelProps {
  node: NodeLike
  onClose: () => void
  onUpdate: (data: any) => void
  onDelete?: () => void
}

export function PropertiesPanel({ node, onClose, onUpdate, onDelete }: PropertiesPanelProps) {
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
              </div>
            </div>
          </>
        )}

        {/* === CHAIN NODE === */}
        {node.type === 'chain' && (
          <div className="form-group">
            <label className="form-label">O'tish kerak bo'lgan Blok ID</label>
            <input
              type="text"
              className="input"
              value={data.targetNodeId || ''}
              onChange={(e) => onUpdate({ targetNodeId: e.target.value })}
              placeholder="Masalan: node-5"
            />
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
              </select>
            </div>
          </div>
        )}

        {/* === INPUT NODES (QUESTION, PHONE, EMAIL, LOCATION) === */}
        {['question', 'phone', 'email', 'location'].includes(node.type || '') && (
          <>
            <div className="form-group">
              <label className="form-label">Xabar / Savol matni</label>
              <textarea
                className="input"
                rows={3}
                value={data.text || ''}
                onChange={(e) => onUpdate({ text: e.target.value })}
                placeholder="Savol matnini kiriting..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Javobni saqlash (O'zgaruvchi nomi)</label>
              <input
                type="text"
                className="input"
                value={data.variable || ''}
                onChange={(e) => onUpdate({ variable: e.target.value })}
                placeholder="Masalan: customer_phone"
              />
            </div>
          </>
        )}

        {/* === CONDITION NODE === */}
        {node.type === 'condition' && (
          <>
            <div className="form-group">
              <label className="form-label">O'zgaruvchi nomi</label>
              <input
                type="text"
                className="input"
                value={data.variable || ''}
                onChange={(e) => onUpdate({ variable: e.target.value })}
                placeholder="Masalan: name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Shart operatori</label>
              <select
                className="input"
                value={data.operator || '=='}
                onChange={(e) => onUpdate({ operator: e.target.value })}
              >
                <option value="==">Teng (==)</option>
                <option value="!=">Teng emas (!=)</option>
                <option value="contains">O'z ichiga oladi</option>
                <option value=">">Katta (&gt;)</option>
                <option value="<">Kichik (&lt;)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tekshiriladigan qiymat</label>
              <input
                type="text"
                className="input"
                value={data.value || ''}
                onChange={(e) => onUpdate({ value: e.target.value })}
                placeholder="Qiymat..."
              />
            </div>
          </>
        )}

        {/* === VARIABLE SET NODE === */}
        {node.type === 'variable' && (
          <>
            <div className="form-group">
              <label className="form-label">O'zgaruvchi nomi</label>
              <input
                type="text"
                className="input"
                value={data.variableName || ''}
                onChange={(e) => onUpdate({ variableName: e.target.value })}
                placeholder="Masalan: is_member"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Qiymati</label>
              <input
                type="text"
                className="input"
                value={data.variableValue || ''}
                onChange={(e) => onUpdate({ variableValue: e.target.value })}
                placeholder="Masalan: true"
              />
            </div>
          </>
        )}

        {/* === VARIABLE DELETE NODE === */}
        {node.type === 'deleteVariable' && (
          <div className="form-group">
            <label className="form-label">O'chiriladigan o'zgaruvchi nomi</label>
            <input
              type="text"
              className="input"
              value={data.variableName || ''}
              onChange={(e) => onUpdate({ variableName: e.target.value })}
              placeholder="Masalan: session_id"
            />
          </div>
        )}

        {/* === JAVASCRIPT NODE === */}
        {node.type === 'javascript' && (
          <>
            <div className="form-group">
              <label className="form-label">JavaScript Kod (Expression)</label>
              <textarea
                className="input"
                rows={3}
                value={data.code || ''}
                onChange={(e) => onUpdate({ code: e.target.value })}
                placeholder="Masalan: variables.price * 0.15"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Natijani saqlash (O'zgaruvchi)</label>
              <input
                type="text"
                className="input"
                value={data.variable || ''}
                onChange={(e) => onUpdate({ variable: e.target.value })}
                placeholder="Masalan: tax_amount"
              />
            </div>
          </>
        )}

        {/* === HTTP API / WEBHOOK / GOOGLE SHEETS NODES === */}
        {['http', 'webhook', 'googleSheetsAdd', 'googleSheetsRead'].includes(node.type || '') && (
          <>
            <div className="form-group">
              <label className="form-label">So'rov turi (Method)</label>
              <select
                className="input"
                value={data.method || 'GET'}
                onChange={(e) => onUpdate({ method: e.target.value })}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Manzil (URL)</label>
              <input
                type="text"
                className="input"
                value={data.url || ''}
                onChange={(e) => onUpdate({ url: e.target.value })}
                placeholder="https://api.example.com/endpoint"
              />
            </div>
            {['http', 'googleSheetsRead'].includes(node.type || '') && (
              <div className="form-group">
                <label className="form-label">Javobni saqlash (O'zgaruvchi)</label>
                <input
                  type="text"
                  className="input"
                  value={data.variable || ''}
                  onChange={(e) => onUpdate({ variable: e.target.value })}
                  placeholder="Masalan: response_data"
                />
              </div>
            )}
          </>
        )}

        {/* === GETCOURSE / YCLIENTS INTEGRATIONS === */}
        {['getCourse', 'yclients'].includes(node.type || '') && (
          <>
            <div className="form-group">
              <label className="form-label">API Kalit (API Key)</label>
              <input
                type="text"
                className="input"
                value={data.apiKey || ''}
                onChange={(e) => onUpdate({ apiKey: e.target.value })}
                placeholder="API Key..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Domain nomi / ID</label>
              <input
                type="text"
                className="input"
                value={data.domain || ''}
                onChange={(e) => onUpdate({ domain: e.target.value })}
                placeholder="Masalan: school.getcourse.ru"
              />
            </div>
          </>
        )}

        {/* === PAYMENTS (PAYME, CLICK, YOOKASSA, CRYPTOPAY) === */}
        {['payme', 'click', 'yookassa', 'cryptopay'].includes(node.type || '') && (
          <>
            <div className="form-group">
              <label className="form-label">Mahsulot nomi (Title)</label>
              <input
                type="text"
                className="input"
                value={data.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Masalan: Kursga a'zolik"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mahsulot narxi</label>
              <input
                type="number"
                className="input"
                value={data.price || ''}
                onChange={(e) => onUpdate({ price: parseInt(e.target.value) || 0 })}
                placeholder="Masalan: 99000"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Provider Token (BotFather'dan)</label>
              <input
                type="text"
                className="input"
                value={data.providerToken || ''}
                onChange={(e) => onUpdate({ providerToken: e.target.value })}
                placeholder="Provider Token..."
              />
            </div>
          </>
        )}

        {/* === CRM BLOCK (DEALSTAGE, ASSIGNEE) === */}
        {node.type === 'dealStage' && (
          <div className="form-group">
            <label className="form-label">Bitim bosqichi (Stage)</label>
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
          </div>
        )}

        {node.type === 'assignee' && (
          <div className="form-group">
            <label className="form-label">Mas'ul xodimni tanglang</label>
            <input
              type="text"
              className="input"
              value={data.agent || ''}
              onChange={(e) => onUpdate({ agent: e.target.value })}
              placeholder="Xodim ismi..."
            />
          </div>
        )}

        {/* === CART & ORDERS === */}
        {node.type === 'cart' && (
          <>
            <div className="form-group">
              <label className="form-label">Savat amali</label>
              <select
                className="input"
                value={data.cartAction || 'add'}
                onChange={(e) => onUpdate({ cartAction: e.target.value })}
              >
                <option value="add">Mahsulot qo'shish</option>
                <option value="clear">Savatni tozalash</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Mahsulot nomi (Agar qo'shish bo'lsa)</label>
              <input
                type="text"
                className="input"
                value={data.itemName || ''}
                onChange={(e) => onUpdate({ itemName: e.target.value })}
                placeholder="Mahsulot nomi..."
              />
            </div>
          </>
        )}

        {/* === SUBSCRIBER MANAGEMENT (ADDTAG, REMOVETAG, TOPUPBALANCE, DEBITBALANCE) === */}
        {['addTag', 'removeTag'].includes(node.type || '') && (
          <div className="form-group">
            <label className="form-label">Teg nomi (Tag)</label>
            <input
              type="text"
              className="input"
              value={data.tagName || ''}
              onChange={(e) => onUpdate({ tagName: e.target.value })}
              placeholder="Masalan: VIP_USER"
            />
          </div>
        )}

        {['topUpBalance', 'debitBalance'].includes(node.type || '') && (
          <div className="form-group">
            <label className="form-label">Mablag' miqdori (UZS)</label>
            <input
              type="number"
              className="input"
              value={data.amount || ''}
              onChange={(e) => onUpdate({ amount: parseInt(e.target.value) || 0 })}
              placeholder="Masalan: 5000"
            />
          </div>
        )}

        {/* === VOTING BLOCKS === */}
        {node.type === 'voterRegister' && (
          <div className="form-group">
            <label className="form-label">Nomzod / Loyiha nomi</label>
            <input
              type="text"
              className="input"
              value={data.candidate || ''}
              onChange={(e) => onUpdate({ candidate: e.target.value })}
              placeholder="Nomzod..."
            />
          </div>
        )}

        {node.type === 'voteLeaders' && (
          <div className="form-group">
            <p style={{ color: 'var(--text-muted)' }}>Ovoz berish reytingini ko'rsatish bloki. Qo'shimcha sozlama shart emas.</p>
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
