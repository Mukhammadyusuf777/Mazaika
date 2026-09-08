import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { 
  Webhook, Plus, Copy, Trash2, Globe, Play, Check, 
  Code, Layers
} from 'lucide-react'
import { getWebhooks, createWebhook, deleteWebhook } from '../../api/firestore'

interface WebhookItem {
  id: string
  name: string
  url: string
  method: string
  active: boolean
}

export default function WebhooksPage() {
  const { botId } = useParams<{ botId: string }>()
  
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  
  // Form states
  const [newWebhookName, setNewWebhookName] = useState('')
  const [newWebhookUrl, setNewWebhookUrl] = useState('')
  const [newWebhookMethod, setNewWebhookMethod] = useState('POST')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Tester states
  const [testTargetUrl, setTestTargetUrl] = useState('')
  const [testPayload, setTestPayload] = useState(
    JSON.stringify({
      event: 'lead_captured',
      botId: botId || 'bot_123',
      user: {
        id: 987654321,
        name: 'Алишер Усманов',
        phone: '+998901234567',
        username: 'alisher_dev'
      },
      data: {
        dealStage: 'new',
        amount: 250000,
        currency: 'UZS'
      },
      timestamp: new Date().toISOString()
    }, null, 2)
  )
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ status: number | string; ok: boolean; response: string; latency: number } | null>(null)

  // Code snippet tab
  const [snippetTab, setSnippetTab] = useState<'curl' | 'node' | 'python' | 'php'>('curl')
  const [copiedSnippet, setCopiedSnippet] = useState(false)

  const fetchWebhooks = async () => {
    if (!botId) return
    setIsLoading(true)
    try {
      const data = await getWebhooks(botId)
      setWebhooks(data as WebhookItem[])
      if (data && data.length > 0 && !testTargetUrl) {
        setTestTargetUrl((data[0] as WebhookItem).url)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWebhooks()
  }, [botId])

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!botId) return
    setIsLoading(true)
    try {
      await createWebhook(botId, {
        name: newWebhookName,
        url: newWebhookUrl,
        method: newWebhookMethod
      })
      setShowModal(false)
      setNewWebhookName('')
      setNewWebhookUrl('')
      setNewWebhookMethod('POST')
      fetchWebhooks()
    } catch (e) {
      console.error(e)
      alert("Ошибка при создании вебхука.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!botId) return
    if (!window.confirm("Вы уверены, что хотите удалить этот вебхук?")) return
    setIsLoading(true)
    try {
      await deleteWebhook(botId, webhookId)
      fetchWebhooks()
    } catch (e) {
      console.error(e)
      alert("Ошибка при удалении вебхука.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Run test ping
  const handleRunTest = async () => {
    if (!testTargetUrl.trim()) {
      alert('Укажите URL для тестирования')
      return
    }

    setTesting(true)
    setTestResult(null)
    const startTime = performance.now()

    try {
      let parsed = {}
      try {
        parsed = JSON.parse(testPayload)
      } catch (err) {
        alert('Некорректный JSON в теле запроса')
        setTesting(false)
        return
      }

      const res = await fetch(testTargetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Mazaika-Event': 'webhook_test'
        },
        body: JSON.stringify(parsed)
      })

      const latency = Math.round(performance.now() - startTime)
      let text = ''
      try {
        text = await res.text()
      } catch {
        text = '(Тело ответа пустое)'
      }

      setTestResult({
        status: res.status,
        ok: res.ok,
        response: text.slice(0, 500) || '(OK)',
        latency
      })
    } catch (err: any) {
      const latency = Math.round(performance.now() - startTime)
      setTestResult({
        status: 'CORS / Ошибка сети',
        ok: false,
        response: err.message || 'Сервер не вернул CORS-заголовки или недоступен.',
        latency
      })
    } finally {
      setTesting(false)
    }
  }

  // Inbound Webhook URL (for receiving leads into Mazaika)
  const inboundWebhookUrl = `https://api.mazaika.uz/webhooks/${botId || 'bot'}/lead`

  // Dynamic code snippets
  const codeSnippets = useMemo(() => {
    const target = testTargetUrl || inboundWebhookUrl
    return {
      curl: `curl -X POST "${target}" \\
  -H "Content-Type: application/json" \\
  -d '${testPayload.replace(/'/g, "\\'")}'`,
      node: `const response = await fetch("${target}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(${testPayload})
});
const data = await response.json();
console.log("Mazaika Webhook response:", data);`,
      python: `import requests

payload = ${testPayload}
response = requests.post("${target}", json=payload)
print("Status:", response.status_code)
print("Response:", response.text)`,
      php: `<?php
$ch = curl_init("${target}");
$payload = json_encode(${testPayload});
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type:application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
curl_close($ch);
echo $result;`
    }
  }, [testTargetUrl, testPayload, inboundWebhookUrl])

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(codeSnippets[snippetTab])
    setCopiedSnippet(true)
    setTimeout(() => setCopiedSnippet(false), 2000)
  }

  return (
    <div className="settings-container" style={{ maxWidth: '100%', padding: '24px 32px' }}>
      {/* Top Header */}
      <div className="page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Webhook size={24} style={{ color: '#00F5C4' }} />
            <span>Вебхуки и Интеграционный Хаб</span>
          </h2>
          <p style={{ color: '#94A3B8', fontSize: 13, marginTop: 4 }}>
            Связывайте вашего бота с Tilda, AmoCRM, 1C, Google Таблицами и внешними API
          </p>
        </div>
        <div className="page-header-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => setShowModal(true)}
            style={{ 
              background: 'linear-gradient(135deg, #00F5C4 0%, #1E90FF 100%)', 
              color: '#030712', 
              fontWeight: 700, 
              border: 'none', 
              padding: '9px 18px', 
              borderRadius: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              boxShadow: '0 4px 15px rgba(0, 245, 196, 0.25)'
            }}
          >
            <Plus size={16} /> Создать вебхук
          </button>
        </div>
      </div>

      {/* Integration Guide Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#0F131E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#FFF', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span>🌐 Tilda / Сайт</span>
            <span style={{ fontSize: 10, background: 'rgba(0,245,196,0.15)', color: '#00F5C4', padding: '2px 6px', borderRadius: 4 }}>Входящий</span>
          </div>
          <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>
            Отправляйте заявки из формы сайта в бота. Добавьте Webhook URL в настройки форм Tilda.
          </p>
        </div>

        <div style={{ background: '#0F131E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#FFF', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span>📊 Google Sheets</span>
            <span style={{ fontSize: 10, background: 'rgba(56,189,248,0.15)', color: '#38BDF8', padding: '2px 6px', borderRadius: 4 }}>Make / Zapier</span>
          </div>
          <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>
            Автоматическая запись каждого нового клиента и заказа в строки онлайн-таблицы.
          </p>
        </div>

        <div style={{ background: '#0F131E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#FFF', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span>🏢 AmoCRM & Битрикс24</span>
            <span style={{ fontSize: 10, background: 'rgba(168,85,247,0.15)', color: '#A855F7', padding: '2px 6px', borderRadius: 4 }}>Сделки</span>
          </div>
          <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>
            Мгновенное создание лидов и карточек клиентов в воронке продаж вашей CRM-системы.
          </p>
        </div>
      </div>

      {/* Webhooks Table */}
      <div style={{ background: '#090C15', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 28 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={16} style={{ color: '#00F5C4' }} />
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#FFF', margin: 0 }}>Зарегистрированные вебхуки</h3>
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0D111D', color: '#94A3B8' }}>
                <th style={{ padding: '14px 20px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Название</th>
                <th style={{ padding: '14px 20px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Метод</th>
                <th style={{ padding: '14px 20px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Целевой URL</th>
                <th style={{ padding: '14px 20px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Статус</th>
                <th style={{ padding: '14px 20px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'right' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {webhooks.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}>
                    <Globe size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Вебхуки пока не созданы</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                      Создайте вебхук, чтобы отправлять события бота в сторонние системы.
                    </div>
                  </td>
                </tr>
              ) : (
                webhooks.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(0,245,196,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00F5C4' }}>
                          <Webhook size={15} />
                        </div>
                        <span style={{ fontWeight: 600, color: '#F1F5F9' }}>{item.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ padding: '3px 8px', background: '#0F1424', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, fontFamily: 'monospace', fontSize: 11.5, color: '#00F5C4', fontWeight: 700 }}>
                        {item.method}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#94A3B8', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.url}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(item.url, item.id)}
                          style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 3 }}
                          title="Скопировать URL"
                        >
                          {copiedId === item.id ? <Check size={13} style={{ color: '#10B981' }} /> : <Copy size={13} />}
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        padding: '3px 9px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 700,
                        background: item.active !== false ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                        color: item.active !== false ? '#10B981' : '#EF4444',
                        border: `1px solid ${item.active !== false ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
                      }}>
                        {item.active !== false ? 'Активен' : 'Отключен'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button
                          onClick={() => {
                            setTestTargetUrl(item.url)
                            const el = document.getElementById('webhook-simulator')
                            if (el) el.scrollIntoView({ behavior: 'smooth' })
                          }}
                          style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', color: '#38BDF8', padding: '5px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                        >
                          Тест
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteWebhook(item.id)}
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 5 }}
                          title="Удалить вебхук"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Webhook Tester & Code Generator Split Section */}
      <div id="webhook-simulator" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
        {/* Left: Interactive Tester */}
        <div style={{ background: '#090C15', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#FFF', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Play size={16} style={{ color: '#00F5C4' }} />
            <span>Симулятор отправки (Webhook Tester)</span>
          </h3>
          <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>
            Отправьте тестовый запрос прямо из браузера для проверки доступности сервера.
          </p>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: '#CBD5E1' }}>
              Целевой URL:
            </label>
            <input
              type="url"
              value={testTargetUrl}
              onChange={e => setTestTargetUrl(e.target.value)}
              placeholder="https://your-server.com/api/webhook"
              style={{
                width: '100%',
                background: '#0F1424',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10,
                padding: '9px 12px',
                color: '#FFF',
                fontSize: 12.5,
                fontFamily: 'monospace'
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: '#CBD5E1' }}>
              Тестовый JSON Payload:
            </label>
            <textarea
              rows={8}
              value={testPayload}
              onChange={e => setTestPayload(e.target.value)}
              style={{
                width: '100%',
                background: '#0F1424',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10,
                padding: '10px 12px',
                color: '#38BDF8',
                fontFamily: 'monospace',
                fontSize: 12,
                lineHeight: 1.4,
                resize: 'vertical'
              }}
            />
          </div>

          <button
            onClick={handleRunTest}
            disabled={testing || !testTargetUrl}
            style={{
              width: '100%',
              padding: '11px 18px',
              borderRadius: 12,
              background: testing || !testTargetUrl ? '#1E293B' : 'linear-gradient(135deg, #00F5C4, #1E90FF)',
              color: testing || !testTargetUrl ? '#64748B' : '#030712',
              fontWeight: 800,
              fontSize: 13,
              border: 'none',
              cursor: testing || !testTargetUrl ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <Play size={15} />
            <span>{testing ? 'Отправка...' : 'Отправить тестовый POST-запрос'}</span>
          </button>

          {/* Test Response */}
          {testResult && (
            <div style={{ marginTop: 16, padding: 14, background: testResult.ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${testResult.ok ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: testResult.ok ? '#10B981' : '#EF4444' }}>
                  Статус: {testResult.status}
                </span>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>{testResult.latency} ms</span>
              </div>
              <pre style={{ margin: 0, fontSize: 11, color: '#CBD5E1', maxHeight: 120, overflowY: 'auto', background: '#080B12', padding: 8, borderRadius: 6 }}>
                {testResult.response}
              </pre>
            </div>
          )}
        </div>

        {/* Right: Code Generator */}
        <div style={{ background: '#090C15', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#FFF', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Code size={16} style={{ color: '#38BDF8' }} />
              <span>Сниппеты кода для разработчиков</span>
            </h3>
            <button
              onClick={handleCopySnippet}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#FFF', padding: '5px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 5 }}
            >
              {copiedSnippet ? <Check size={13} style={{ color: '#10B981' }} /> : <Copy size={13} />}
              <span>{copiedSnippet ? 'Скопировано' : 'Копировать'}</span>
            </button>
          </div>

          {/* Language Tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {[
              { id: 'curl', label: 'cURL' },
              { id: 'node', label: 'Node.js' },
              { id: 'python', label: 'Python' },
              { id: 'php', label: 'PHP' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setSnippetTab(t.id as any)}
                style={{
                  background: snippetTab === t.id ? 'rgba(56,189,248,0.15)' : '#0F1424',
                  color: snippetTab === t.id ? '#38BDF8' : '#94A3B8',
                  border: `1px solid ${snippetTab === t.id ? 'rgba(56,189,248,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <pre style={{
            margin: 0,
            background: '#070A11',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            padding: 14,
            fontSize: 12,
            color: '#E2E8F0',
            fontFamily: 'monospace',
            lineHeight: 1.45,
            overflowX: 'auto',
            maxHeight: 330
          }}>
            {codeSnippets[snippetTab]}
          </pre>
        </div>
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }} onClick={() => setShowModal(false)}>
          <div style={{ background: '#0D111D', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: 24, width: '100%', maxWidth: 480, boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#FFF', margin: 0 }}>Создать новый вебхук</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>

            <form onSubmit={handleCreateWebhook}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>Название вебхука</label>
                <input
                  type="text"
                  placeholder="Например: Интеграция с Google Sheets"
                  value={newWebhookName}
                  onChange={e => setNewWebhookName(e.target.value)}
                  required
                  style={{ width: '100%', background: '#13192B', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 14px', color: '#FFF', fontSize: 13 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>HTTP Метод</label>
                <select 
                  value={newWebhookMethod} 
                  onChange={e => setNewWebhookMethod(e.target.value)}
                  style={{ width: '100%', background: '#13192B', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 14px', color: '#FFF', fontSize: 13 }}
                >
                  <option>POST</option>
                  <option>GET</option>
                  <option>PUT</option>
                </select>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>Целевой URL (Target URL)</label>
                <input
                  type="url"
                  placeholder="https://hook.eu1.make.com/..."
                  value={newWebhookUrl}
                  onChange={e => setNewWebhookUrl(e.target.value)}
                  required
                  style={{ width: '100%', background: '#13192B', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 14px', color: '#FFF', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '10px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#94A3B8', cursor: 'pointer', fontWeight: 600 }}
                >
                  Отмена
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  style={{ flex: 1, padding: '10px 16px', background: 'linear-gradient(135deg, #00F5C4, #1E90FF)', border: 'none', borderRadius: 10, color: '#030712', cursor: 'pointer', fontWeight: 700 }}
                >
                  {isLoading ? 'Создание...' : 'Создать вебхук'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
