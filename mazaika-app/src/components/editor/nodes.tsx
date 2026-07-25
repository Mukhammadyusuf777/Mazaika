import { Handle, Position, type NodeProps } from '@xyflow/react'
import React from 'react'

function StartNode({ data, selected }: NodeProps) {
  const d = data as Record<string, any>
  return (
    <div className={`custom-node ${selected ? 'selected' : ''}`} style={{ '--node-color': '#10d974' } as React.CSSProperties}>
      <div className="node-header">
        <div className="node-icon">▶</div>
        <div className="node-title">{d.label || 'Boshlash'}</div>
      </div>
      <div className="node-content">
        <div className="node-text-preview" style={{ fontSize: 11, color: 'var(--text-muted)' }}>Bot ishga tushganda</div>
      </div>
      <Handle type="source" position={Position.Right} className="react-flow__handle-right" />
    </div>
  )
}

function MessageNode({ data, selected }: NodeProps) {
  const d = data as Record<string, any>
  const buttons = (d.buttons || []) as string[]

  return (
    <div className={`custom-node ${selected ? 'selected' : ''}`} style={{ '--node-color': '#1e90ff' } as React.CSSProperties}>
      <Handle type="target" position={Position.Left} className="react-flow__handle-left" />
      <div className="node-header">
        <div className="node-icon">💬</div>
        <div className="node-title">{d.label || 'Xabar'}</div>
      </div>
      <div className="node-content" style={{ paddingBottom: 0 }}>
        {d.text && <div className="node-text-preview">{d.text}</div>}
      </div>
      
      {buttons.length === 0 && (
        <Handle type="source" position={Position.Right} className="react-flow__handle-right" />
      )}

      {buttons.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 4 }}>
          {buttons.map((btn, i) => (
            <div key={i} style={{ position: 'relative', background: 'var(--bg-card)', padding: '6px 8px', borderRadius: 4, fontSize: 12, border: '1px solid var(--border-primary)', textAlign: 'center' }}>
              {typeof btn === 'string' ? btn : ((btn as any).text || (btn as any).label || 'Tugma')}
              <Handle type="source" position={Position.Right} id={`btn_${i}`} style={{ top: '50%', right: -6, width: 8, height: 8 }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ConditionNode({ data, selected }: NodeProps) {
  const d = data as Record<string, any>
  return (
    <div className={`custom-node ${selected ? 'selected' : ''}`} style={{ '--node-color': '#ffb830' } as React.CSSProperties}>
      <Handle type="target" position={Position.Left} className="react-flow__handle-left" />
      <div className="node-header">
        <div className="node-icon">🔀</div>
        <div className="node-title">{d.label || 'Shart'}</div>
      </div>
      <div className="node-content">
        <div className="node-text-preview" style={{ fontSize: 11 }}>
          {d.variable ? `Agar ${d.variable} ${d.operator || '=='} ${d.value || ''}` : 'Shart o\'rnatilmagan'}
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 4 }}>
        <div style={{ position: 'relative', background: 'rgba(16, 217, 116, 0.1)', color: '#10d974', padding: '4px', borderRadius: 4, fontSize: 11, textAlign: 'right', paddingRight: 10 }}>
          To'g'ri (True)
          <Handle type="source" position={Position.Right} id="true" style={{ top: '50%', right: -6, width: 8, height: 8, background: '#10d974' }} />
        </div>
        <div style={{ position: 'relative', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '4px', borderRadius: 4, fontSize: 11, textAlign: 'right', paddingRight: 10 }}>
          Noto'g'ri (False)
          <Handle type="source" position={Position.Right} id="false" style={{ top: '50%', right: -6, width: 8, height: 8, background: '#ef4444' }} />
        </div>
      </div>
    </div>
  )
}

function AbTestNode({ selected }: NodeProps) {
  return (
    <div className={`custom-node ${selected ? 'selected' : ''}`} style={{ '--node-color': '#ec4899' } as React.CSSProperties}>
      <Handle type="target" position={Position.Left} className="react-flow__handle-left" />
      <div className="node-header">
        <div className="node-icon">⚗</div>
        <div className="node-title">A/B Test</div>
      </div>
      <div className="node-content">
        <div className="node-text-preview" style={{ fontSize: 11, color: 'var(--text-muted)' }}>Trafikni 50/50 taqsimlash</div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 4 }}>
        <div style={{ position: 'relative', background: 'rgba(30, 144, 255, 0.1)', color: '#1e90ff', padding: '4px', borderRadius: 4, fontSize: 11, textAlign: 'right', paddingRight: 10 }}>
          Variant A
          <Handle type="source" position={Position.Right} id="A" style={{ top: '50%', right: -6, width: 8, height: 8, background: '#1e90ff' }} />
        </div>
        <div style={{ position: 'relative', background: 'rgba(0, 245, 196, 0.1)', color: '#00f5c4', padding: '4px', borderRadius: 4, fontSize: 11, textAlign: 'right', paddingRight: 10 }}>
          Variant B
          <Handle type="source" position={Position.Right} id="B" style={{ top: '50%', right: -6, width: 8, height: 8, background: '#00f5c4' }} />
        </div>
      </div>
    </div>
  )
}

function SmartNode({ data, selected, type }: NodeProps) {
  const d = data as Record<string, any>
  const color = d.color || '#64748b'

  const renderContent = () => {
    switch (type) {
      case 'chain':
        return <div className="node-text-preview">O'tish: {d.targetNodeId || 'Tanlanmagan'}</div>
      case 'timer':
        return <div className="node-text-preview">{d.delayAmount || 0} {d.delayUnit === 'minutes' ? 'Daqiqa' : 'Soniya'}</div>
      case 'question':
      case 'phone':
      case 'email':
      case 'location':
        return (
          <>
            {d.text && <div className="node-text-preview">{d.text}</div>}
            <div style={{ fontSize: 10, color: 'var(--accent-aqua)', marginTop: 4 }}>
              ↳ Saqlash: {d.variable || 'o\'zgaruvchi'}
            </div>
          </>
        )
      case 'variable':
        return <div className="node-text-preview">{d.variableName ? `${d.variableName} = ${d.variableValue}` : 'O\'rnatilmagan'}</div>
      case 'deleteVariable':
        return <div className="node-text-preview">O'chirish: {d.variableName || 'Tanlanmagan'}</div>
      case 'javascript':
      case 'custom_code':
        return <div className="node-text-preview" style={{ fontFamily: 'monospace', fontSize: 10 }}>{d.code || 'x = 1'}</div>
      case 'http':
      case 'webhook':
        return (
          <>
            <div className="node-text-preview" style={{ fontWeight: 'bold' }}>{d.method || 'GET'}</div>
            <div className="node-text-preview" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{d.url || 'URL kiritilmagan'}</div>
          </>
        )
      case 'googleSheetsAdd':
      case 'googleSheetsRead':
        return <div className="node-text-preview">{d.url ? 'Jadval ulangan' : 'Jadval kiritilmagan'}</div>
      case 'getCourse':
        return <div className="node-text-preview">Buyurtma yaratish</div>
      case 'yclients':
        return <div className="node-text-preview">Uchrashuv bron qilish</div>
      case 'payme':
      case 'click':
      case 'yookassa':
      case 'cryptopay':
        return <div className="node-text-preview" style={{ fontWeight: 'bold', color: '#10d974' }}>{d.price ? `${d.price.toLocaleString()} UZS` : 'Narx yo\'q'}</div>
      case 'dealStage':
        return <div className="node-text-preview">Bosqich: {d.stage || 'Tanlanmagan'}</div>
      case 'assignee':
        return <div className="node-text-preview">Xodim: {d.agent || 'Tanlanmagan'}</div>
      case 'cart':
        return <div className="node-text-preview">Amal: {d.cartAction || 'Tanlanmagan'}</div>
      case 'orderList':
        return <div className="node-text-preview">Buyurtmalarni ko'rsatish</div>
      case 'addTag':
      case 'removeTag':
        return <div className="node-text-preview">Teg: {d.tagName || 'Tanlanmagan'}</div>
      case 'topUpBalance':
      case 'debitBalance':
        return <div className="node-text-preview">Summa: {d.amount || 0} UZS</div>
      case 'deleteUser':
        return <div className="node-text-preview" style={{ color: '#ef4444' }}>Ma'lumotlarni tozalash</div>
      case 'voterRegister':
        return <div className="node-text-preview">A'zo qilish</div>
      case 'voteLeaders':
        return <div className="node-text-preview">Natijalarni ko'rsatish</div>
      case 'photo':
        return <div className="node-text-preview" style={{ color: '#0ea5e9' }}>📷 {d.caption || 'Rasm yuboriladi'}</div>
      case 'video':
        return <div className="node-text-preview" style={{ color: '#6366f1' }}>🎬 {d.caption || 'Video yuboriladi'}</div>
      case 'document':
        return <div className="node-text-preview" style={{ color: '#64748b' }}>📄 {d.fileName || 'Fayl yuboriladi'}</div>
      case 'audio':
        return <div className="node-text-preview" style={{ color: '#8b5cf6' }}>🎵 {d.caption || 'Audio yuboriladi'}</div>
      case 'sticker':
        return <div className="node-text-preview">🎭 Sticker yuboriladi</div>
      case 'poll':
        return (
          <>
            {d.question && <div className="node-text-preview">{d.question}</div>}
            <div style={{ fontSize: 10, color: 'var(--accent-aqua)', marginTop: 4 }}>📊 {d.options?.length || 0} variant</div>
          </>
        )
      case 'quiz':
        return (
          <>
            {d.question && <div className="node-text-preview">{d.question}</div>}
            <div style={{ fontSize: 10, color: '#10b981', marginTop: 4 }}>🎯 Test: {d.options?.length || 0} javob</div>
          </>
        )
      case 'aiReply':
        return <div className="node-text-preview" style={{ color: '#a855f7' }}>🧠 Model: {d.model || 'gemini-flash'}</div>
      case 'aiAnalyze':
        return <div className="node-text-preview" style={{ color: '#6366f1' }}>🔍 Tahlil: {d.field || 'foydalanuvchi xabari'}</div>
      case 'aiTranslate':
        return <div className="node-text-preview" style={{ color: '#0ea5e9' }}>🌐 {d.fromLang || 'RU'} → {d.toLang || 'UZ'}</div>
      case 'aiImage':
        return <div className="node-text-preview" style={{ color: '#ec4899' }}>🎨 {d.prompt || 'Rasm yaratiladi'}</div>
      case 'notifyOperator':
        return <div className="node-text-preview" style={{ color: '#f97316' }}>👨‍💼 {d.chatId || 'Operator chat ID'}</div>
      case 'notifyGroup':
        return <div className="node-text-preview" style={{ color: '#0ea5e9' }}>👥 {d.groupId || 'Guruh ID'}</div>
      case 'notifyChannel':
        return <div className="node-text-preview" style={{ color: '#8b5cf6' }}>📡 {d.channelId || 'Kanal ID'}</div>
      case 'email_notify':
        return <div className="node-text-preview" style={{ color: '#10b981' }}>📨 {d.to || 'email@domain.com'}</div>
      case 'schedule':
        return <div className="node-text-preview" style={{ color: '#6366f1' }}>📅 Cron: {d.cron || '0 9 * * *'}</div>
      case 'reminder':
        return <div className="node-text-preview" style={{ color: '#f59e0b' }}>⏰ {d.delayAmount || 0} {d.delayUnit || 'daqiqa'}</div>
      case 'sequence':
        return <div className="node-text-preview" style={{ color: '#10d974' }}>🔁 {d.count || 0} ta ketma-ket xabar</div>
      case 'refCreate':
        return <div className="node-text-preview" style={{ color: '#00f5c4' }}>🔗 Ref-link saqlash: {d.variable || 'ref_link'}</div>
      case 'refCheck':
        return <div className="node-text-preview" style={{ color: '#10d974' }}>✅ Ref tekshiruvi</div>
      case 'refLeaders':
        return <div className="node-text-preview" style={{ color: '#ffb830' }}>🏆 Top {d.count || 10} referral</div>
      case 'stars':
        return <div className="node-text-preview" style={{ fontWeight: 'bold', color: '#fbbf24' }}>⭐ {d.amount || 0} Stars</div>
      case 'uzumbank':
        return <div className="node-text-preview" style={{ fontWeight: 'bold', color: '#7c3aed' }}>{d.price ? `${d.price.toLocaleString()} UZS` : 'Narx yo\'q'}</div>
      case 'amocrm':
        return <div className="node-text-preview" style={{ color: '#ef4444' }}>💼 AmoCRM: {d.action || 'Kontakt yaratish'}</div>
      case 'bitrix':
        return <div className="node-text-preview" style={{ color: '#1e90ff' }}>🏢 Bitrix24: {d.action || 'Lead yaratish'}</div>
      default:
        return <div className="node-text-preview">Leadtex block</div>
    }
  }

  return (
    <div className={`custom-node ${selected ? 'selected' : ''}`} style={{ '--node-color': color } as React.CSSProperties}>
      <Handle type="target" position={Position.Left} className="react-flow__handle-left" />
      <div className="node-header">
        <div className="node-icon">{d.emoji || '⚙'}</div>
        <div className="node-title">{d.label}</div>
      </div>
      <div className="node-content">
        {renderContent()}
      </div>
      <Handle type="source" position={Position.Right} className="react-flow__handle-right" />
    </div>
  )
}

function SubscriptionNode({ data, selected }: NodeProps) {
  const d = data as Record<string, any>
  return (
    <div className={`custom-node ${selected ? 'selected' : ''}`} style={{ '--node-color': '#8b5cf6' } as React.CSSProperties}>
      <Handle type="target" position={Position.Left} className="react-flow__handle-left" />
      <div className="node-header">
        <div className="node-icon">📢</div>
        <div className="node-title">{d.label || 'Kanalga a\'zolik'}</div>
      </div>
      <div className="node-content">
        <div className="node-text-preview" style={{ fontSize: 11 }}>
          Kanal: {d.channel || 'Tanlanmagan'}
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 4 }}>
        <div style={{ position: 'relative', background: 'rgba(16, 217, 116, 0.1)', color: '#10d974', padding: '4px', borderRadius: 4, fontSize: 11, textAlign: 'right', paddingRight: 10 }}>
          A'zo bo'lgan (True)
          <Handle type="source" position={Position.Right} id="true" style={{ top: '50%', right: -6, width: 8, height: 8, background: '#10d974' }} />
        </div>
        <div style={{ position: 'relative', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '4px', borderRadius: 4, fontSize: 11, textAlign: 'right', paddingRight: 10 }}>
          A'zo bo'lmagan (False)
          <Handle type="source" position={Position.Right} id="false" style={{ top: '50%', right: -6, width: 8, height: 8, background: '#ef4444' }} />
        </div>
      </div>
    </div>
  )
}

export const nodeTypes = {
  start: StartNode,
  message: MessageNode,
  condition: ConditionNode,
  abTest: AbTestNode,
  subscription: SubscriptionNode,

  // All other blocks styled dynamically using SmartNode
  chain: (props: NodeProps) => <SmartNode {...props} type="chain" />,
  timer: (props: NodeProps) => <SmartNode {...props} type="timer" />,
  question: (props: NodeProps) => <SmartNode {...props} type="question" />,
  phone: (props: NodeProps) => <SmartNode {...props} type="phone" />,
  email: (props: NodeProps) => <SmartNode {...props} type="email" />,
  location: (props: NodeProps) => <SmartNode {...props} type="location" />,
  variable: (props: NodeProps) => <SmartNode {...props} type="variable" />,
  deleteVariable: (props: NodeProps) => <SmartNode {...props} type="deleteVariable" />,
  javascript: (props: NodeProps) => <SmartNode {...props} type="javascript" />,
  custom_code: (props: NodeProps) => <SmartNode {...props} type="custom_code" />,
  http: (props: NodeProps) => <SmartNode {...props} type="http" />,
  webhook: (props: NodeProps) => <SmartNode {...props} type="webhook" />,
  googleSheetsAdd: (props: NodeProps) => <SmartNode {...props} type="googleSheetsAdd" />,
  googleSheetsRead: (props: NodeProps) => <SmartNode {...props} type="googleSheetsRead" />,
  getCourse: (props: NodeProps) => <SmartNode {...props} type="getCourse" />,
  yclients: (props: NodeProps) => <SmartNode {...props} type="yclients" />,
  payme: (props: NodeProps) => <SmartNode {...props} type="payme" />,
  click: (props: NodeProps) => <SmartNode {...props} type="click" />,
  yookassa: (props: NodeProps) => <SmartNode {...props} type="yookassa" />,
  cryptopay: (props: NodeProps) => <SmartNode {...props} type="cryptopay" />,
  dealStage: (props: NodeProps) => <SmartNode {...props} type="dealStage" />,
  assignee: (props: NodeProps) => <SmartNode {...props} type="assignee" />,
  cart: (props: NodeProps) => <SmartNode {...props} type="cart" />,
  orderList: (props: NodeProps) => <SmartNode {...props} type="orderList" />,
  addTag: (props: NodeProps) => <SmartNode {...props} type="addTag" />,
  removeTag: (props: NodeProps) => <SmartNode {...props} type="removeTag" />,
  topUpBalance: (props: NodeProps) => <SmartNode {...props} type="topUpBalance" />,
  debitBalance: (props: NodeProps) => <SmartNode {...props} type="debitBalance" />,
  deleteUser: (props: NodeProps) => <SmartNode {...props} type="deleteUser" />,
  voterRegister: (props: NodeProps) => <SmartNode {...props} type="voterRegister" />,
  voteLeaders: (props: NodeProps) => <SmartNode {...props} type="voteLeaders" />,

  // 🆕 Media Blocks
  photo: (props: NodeProps) => <SmartNode {...props} type="photo" />,
  video: (props: NodeProps) => <SmartNode {...props} type="video" />,
  document: (props: NodeProps) => <SmartNode {...props} type="document" />,
  audio: (props: NodeProps) => <SmartNode {...props} type="audio" />,
  sticker: (props: NodeProps) => <SmartNode {...props} type="sticker" />,

  // 🆕 Input Blocks
  poll: (props: NodeProps) => <SmartNode {...props} type="poll" />,
  quiz: (props: NodeProps) => <SmartNode {...props} type="quiz" />,

  // 🆕 AI Blocks
  aiReply: (props: NodeProps) => <SmartNode {...props} type="aiReply" />,
  aiAnalyze: (props: NodeProps) => <SmartNode {...props} type="aiAnalyze" />,
  aiTranslate: (props: NodeProps) => <SmartNode {...props} type="aiTranslate" />,
  aiImage: (props: NodeProps) => <SmartNode {...props} type="aiImage" />,

  // 🆕 Notification Blocks
  notifyOperator: (props: NodeProps) => <SmartNode {...props} type="notifyOperator" />,
  notifyGroup: (props: NodeProps) => <SmartNode {...props} type="notifyGroup" />,
  notifyChannel: (props: NodeProps) => <SmartNode {...props} type="notifyChannel" />,
  email_notify: (props: NodeProps) => <SmartNode {...props} type="email_notify" />,

  // 🆕 Scheduler Blocks
  schedule: (props: NodeProps) => <SmartNode {...props} type="schedule" />,
  reminder: (props: NodeProps) => <SmartNode {...props} type="reminder" />,
  sequence: (props: NodeProps) => <SmartNode {...props} type="sequence" />,

  // 🆕 Referral Blocks
  refCreate: (props: NodeProps) => <SmartNode {...props} type="refCreate" />,
  refCheck: (props: NodeProps) => <SmartNode {...props} type="refCheck" />,
  refLeaders: (props: NodeProps) => <SmartNode {...props} type="refLeaders" />,

  // 🆕 Payment Blocks
  stars: (props: NodeProps) => <SmartNode {...props} type="stars" />,
  uzumbank: (props: NodeProps) => <SmartNode {...props} type="uzumbank" />,

  // 🆕 CRM Integrations
  amocrm: (props: NodeProps) => <SmartNode {...props} type="amocrm" />,
  bitrix: (props: NodeProps) => <SmartNode {...props} type="bitrix" />,
}
