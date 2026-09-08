import React, { useState, useEffect } from 'react'
import { 
  Bot, Globe, Sparkles, CheckCircle2, ExternalLink, 
  X, Smartphone, Layers, AlertCircle, Loader2, ShieldCheck, Check
} from 'lucide-react'
import { getBotsByUser, updateBot, getWorkflows, saveWorkflow } from '../../api/firestore'
import { backendApi, getLiveSiteUrl } from '../../api/backendApi'
import { useAuthStore } from '../../store/useAuthStore'
import './ConnectBotModal.css'

export interface ConnectBotModalProps {
  isOpen: boolean
  onClose: () => void
  siteId: string
  siteName: string
  siteUrl?: string
  onSuccess?: (botId: string, botName: string) => void
}

export default function ConnectBotModal({
  isOpen,
  onClose,
  siteId,
  siteName,
  siteUrl,
  onSuccess
}: ConnectBotModalProps) {
  const { user } = useAuthStore()
  const userId = user?.id || (user as any)?.uid
  const [bots, setBots] = useState<any[]>([])
  const [loadingBots, setLoadingBots] = useState(true)
  const [selectedBotId, setSelectedBotId] = useState<string>('')
  const [buttonText, setButtonText] = useState<string>('🚀 Ilovani ochish')
  const [connectionMode, setConnectionMode] = useState<'both' | 'menu_only' | 'start_only'>('both')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [connectedBot, setConnectedBot] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Load user bots
  useEffect(() => {
    if (!isOpen || !userId) return
    let isMounted = true

    const fetchUserBots = async () => {
      setLoadingBots(true)
      setErrorMsg(null)
      try {
        const userBots = await getBotsByUser(userId)
        if (!isMounted) return
        // Filter to only bot projects
        const realBots = (userBots || []).filter((b: any) => b.projectType !== 'site')
        setBots(realBots)
        if (realBots.length > 0) {
          setSelectedBotId(realBots[0].id)
        }
      } catch (err: any) {
        console.error('Error fetching user bots:', err)
        setErrorMsg('Botlarni yuklashda xatolik yuz berdi')
      } finally {
        if (isMounted) setLoadingBots(false)
      }
    }

    fetchUserBots()
    return () => { isMounted = false }
  }, [isOpen, userId])

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false)
      setIsSubmitting(false)
      setErrorMsg(null)
      setButtonText(siteName ? `🚀 ${siteName.slice(0, 18)}` : '🚀 Ilovani ochish')
    }
  }, [isOpen, siteName])

  if (!isOpen) return null

  const effectiveUrl = siteUrl || getLiveSiteUrl(siteId)

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBotId) {
      setErrorMsg('Iltimos, ulanadigan botni tanlang')
      return
    }

    const targetBot = bots.find(b => b.id === selectedBotId)
    if (!targetBot) {
      setErrorMsg('Tanlangan bot topilmadi')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const willEnableMenu = connectionMode === 'both' || connectionMode === 'menu_only'
      const willAddStartButton = connectionMode === 'both' || connectionMode === 'start_only'

      // 1. Update bot doc in Firestore
      const botUpdatePayload: any = {
        menuButtonEnabled: willEnableMenu,
        menuButtonText: buttonText,
        menuButtonUrl: effectiveUrl,
        linkedSiteId: siteId,
        updatedAt: new Date()
      }
      await updateBot(selectedBotId, botUpdatePayload)

      // 2. Update bot in backend
      try {
        await backendApi.updateBot(selectedBotId, botUpdatePayload)
      } catch (e) {
        console.warn('Backend updateBot notice:', e)
      }

      // 3. If Menu Button is enabled, call backend to set chat menu button in Telegram
      if (willEnableMenu) {
        try {
          await backendApi.setMenuButton(selectedBotId, buttonText, effectiveUrl)
        } catch (err: any) {
          console.warn('Telegram setChatMenuButton notice:', err)
        }
      }

      // 4. If Start button is enabled, update the bot workflow to include an inline WebApp button
      if (willAddStartButton) {
        try {
          const workflows = await getWorkflows(selectedBotId)
          const mainWorkflow = workflows.find((w: any) => w.isMain) || workflows[0]
          if (mainWorkflow && mainWorkflow.nodes) {
            let nodes = Array.isArray(mainWorkflow.nodes) ? mainWorkflow.nodes : JSON.parse(mainWorkflow.nodes || '[]')
            let edges = Array.isArray(mainWorkflow.edges) ? mainWorkflow.edges : JSON.parse(mainWorkflow.edges || '[]')

            // Find first message node or create button on it
            let targetNode = nodes.find((n: any) => n.type === 'message') || nodes.find((n: any) => n.type === 'start')

            if (targetNode) {
              const currentButtons: any[] = targetNode.data?.buttons || []
              const buttonString = `${buttonText} | webapp: ${effectiveUrl}`

              // Check if button already exists
              const alreadyHas = currentButtons.some((b: any) => {
                const s = typeof b === 'string' ? b : (b.text || '')
                return s.includes(effectiveUrl) || s.includes(siteId)
              })

              if (!alreadyHas) {
                targetNode.data = {
                  ...targetNode.data,
                  buttons: [buttonString, ...currentButtons]
                }
                await saveWorkflow(selectedBotId, mainWorkflow.id, {
                  name: mainWorkflow.name || 'Asosiy Ssenariy',
                  nodes,
                  edges,
                  isMain: true
                })
              }
            }
          }
        } catch (wfErr) {
          console.warn('Error attaching webapp button to workflow:', wfErr)
        }
      }

      setConnectedBot(targetBot)
      setIsSuccess(true)
      if (onSuccess) {
        onSuccess(targetBot.id, targetBot.name || 'Telegram Bot')
      }
    } catch (err: any) {
      console.error('Error connecting site to bot:', err)
      setErrorMsg(err?.message || 'Ulashda xatolik yuz berdi. Qayta urinib ko\'ring.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Extract bot username if available
  const botUsername = connectedBot?.username || 
    (connectedBot?.token ? `Mazaika_${connectedBot.token.split(':')[0]}_bot` : '')

  return (
    <div className="cbm-overlay" onClick={onClose}>
      <div className="cbm-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="cbm-header">
          <div className="cbm-header-title-wrap">
            <div className="cbm-header-icon">
              <Smartphone size={22} color="#00F5C4" />
            </div>
            <div>
              <h2 className="cbm-title">Telegram Botga Ulash (Mini App)</h2>
              <p className="cbm-subtitle">
                Saytingizni Telegram ichida ochiladigan rasmiy Mini App ga aylantiring — $0 xarajat
              </p>
            </div>
          </div>
          <button className="cbm-close-btn" onClick={onClose} aria-label="Yopish">
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="cbm-body">
          {isSuccess ? (
            /* Success View */
            <div className="cbm-success-wrap">
              <div className="cbm-success-icon-badge">
                <CheckCircle2 size={48} color="#00F5C4" />
              </div>
              <h3 className="cbm-success-title">Muvaffaqiyatli Ulandi! 🎉</h3>
              <p className="cbm-success-desc">
                <strong>"{siteName}"</strong> sayti <strong>"{connectedBot?.name}"</strong> botiga 
                Telegram Mini App sifatida ulandi.
              </p>

              <div className="cbm-summary-card">
                <div className="cbm-summary-row">
                  <span className="cbm-summary-label">Telegram Bot:</span>
                  <span className="cbm-summary-val font-bold text-white">{connectedBot?.name}</span>
                </div>
                <div className="cbm-summary-row">
                  <span className="cbm-summary-label">Tugma nomi:</span>
                  <span className="cbm-summary-val text-cyan-400 font-semibold">{buttonText}</span>
                </div>
                <div className="cbm-summary-row">
                  <span className="cbm-summary-label">Mini App Havolasi:</span>
                  <span className="cbm-summary-val truncate text-xs text-slate-400">{effectiveUrl}</span>
                </div>
              </div>

              <div className="cbm-instructions-box">
                <h4 className="cbm-instructions-title">Qanday tekshirish mumkin?</h4>
                <ol className="cbm-instructions-list">
                  <li>Telegramni oching va botingizga kiring</li>
                  <li><code>/start</code> buyrug'ini yuboring</li>
                  <li>Pastki chap burchakdagi <strong>"Menu"</strong> yoki xabardagi tugmani bosing</li>
                  <li>Saytingiz Telegram oynasi ichida to'liq ekranli ilova sifatida ochiladi!</li>
                </ol>
              </div>

              <div className="cbm-actions-footer">
                {botUsername && (
                  <a 
                    href={`https://t.me/${botUsername.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="cbm-btn-primary"
                  >
                    <span>Telegramda Sinab Ko'rish</span>
                    <ExternalLink size={16} />
                  </a>
                )}
                <button className="cbm-btn-secondary" onClick={onClose}>
                  Tayyor
                </button>
              </div>
            </div>
          ) : (
            /* Form View */
            <form onSubmit={handleConnect} className="cbm-form">
              {errorMsg && (
                <div className="cbm-alert-error">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Site preview pill */}
              <div className="cbm-site-preview-card">
                <div className="cbm-site-avatar">
                  <Globe size={18} color="#00D9FF" />
                </div>
                <div className="cbm-site-info">
                  <span className="cbm-site-label">Ulanayotgan Sayt:</span>
                  <span className="cbm-site-name">{siteName || 'Mening Saytim'}</span>
                  <span className="cbm-site-url">{effectiveUrl}</span>
                </div>
                <span className="cbm-cost-badge">100% Bepul ($0)</span>
              </div>

              {/* Select Bot */}
              <div className="cbm-form-group">
                <label className="cbm-label">
                  <Bot size={15} color="#1E90FF" />
                  <span>Qaysi Telegram Botga ulamoqchisiz?</span>
                </label>

                {loadingBots ? (
                  <div className="cbm-loading-bots">
                    <Loader2 size={18} className="animate-spin" />
                    <span>Botlaringiz yuklanmoqda...</span>
                  </div>
                ) : bots.length === 0 ? (
                  <div className="cbm-no-bots-notice">
                    <AlertCircle size={20} color="#FFB830" />
                    <div>
                      <p className="font-semibold text-white">Sizda hali Telegram bot mavjud emas</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Saytni ulash uchun avval asosiy menyudan yangi Telegram bot yarating yoki @BotFather dan token oling.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="cbm-bots-list">
                    {bots.map((b) => {
                      const isSelected = b.id === selectedBotId
                      return (
                        <div 
                          key={b.id}
                          className={`cbm-bot-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => setSelectedBotId(b.id)}
                        >
                          <div className="cbm-bot-item-left">
                            <div className={`cbm-radio-circle ${isSelected ? 'checked' : ''}`}>
                              {isSelected && <Check size={12} />}
                            </div>
                            <div className="cbm-bot-avatar">
                              <Bot size={18} />
                            </div>
                            <div>
                              <div className="cbm-bot-name">{b.name || 'Nomsiz Bot'}</div>
                              <div className="cbm-bot-meta">
                                {b.menuButtonEnabled ? '🟢 Mini App ulangan' : '⚪ Mini App ulanmagan'}
                              </div>
                            </div>
                          </div>
                          {isSelected && <span className="cbm-selected-chip">Tanlandi</span>}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Button text input */}
              <div className="cbm-form-group">
                <label className="cbm-label">
                  <Sparkles size={15} color="#A855F7" />
                  <span>Telegramdagi Tugma Matni:</span>
                </label>
                <input 
                  type="text"
                  className="cbm-input"
                  value={buttonText}
                  onChange={e => setButtonText(e.target.value)}
                  placeholder="Masalan: 🚀 Do'konni ochish"
                  maxLength={32}
                  required
                />
                <span className="cbm-input-hint">
                  Ushbu matn Telegram chatidagi Menu tugmasida yoki xabar tugmasida aks etadi
                </span>
              </div>

              {/* Connection Mode Radios */}
              <div className="cbm-form-group">
                <label className="cbm-label">
                  <Layers size={15} color="#00F5C4" />
                  <span>Telegramda qanday ko'rinsin?</span>
                </label>
                
                <div className="cbm-mode-grid">
                  <div 
                    className={`cbm-mode-card ${connectionMode === 'both' ? 'active' : ''}`}
                    onClick={() => setConnectionMode('both')}
                  >
                    <div className="cbm-mode-badge-rec">Tavsiya etiladi</div>
                    <div className="cbm-mode-title">Ikkisi ham (Menu + /start)</div>
                    <div className="cbm-mode-desc">
                      Bot pastidagi doimiy "Menu" tugmasi hamda /start xabaridagi chiroyli inline tugma
                    </div>
                  </div>

                  <div 
                    className={`cbm-mode-card ${connectionMode === 'menu_only' ? 'active' : ''}`}
                    onClick={() => setConnectionMode('menu_only')}
                  >
                    <div className="cbm-mode-title">Faqat Menu Tugmasi</div>
                    <div className="cbm-mode-desc">
                      Chatning pastki chap burchagida doimiy ko'rinib turadigan Mini App tugmasi
                    </div>
                  </div>

                  <div 
                    className={`cbm-mode-card ${connectionMode === 'start_only' ? 'active' : ''}`}
                    onClick={() => setConnectionMode('start_only')}
                  >
                    <div className="cbm-mode-title">Faqat /start Tugmasi</div>
                    <div className="cbm-mode-desc">
                      Foydalanuvchi /start bosganda chiqadigan xabarga biriktirilgan inline tugma
                    </div>
                  </div>
                </div>
              </div>

              {/* Zero cost guarantee notice */}
              <div className="cbm-guarantee-box">
                <ShieldCheck size={18} color="#10B981" />
                <span>
                  <strong>100% Bepul va Cheklovlarsiz:</strong> Telegram Mini App va WebApp SDK funksiyalari to'liq bepul. Hech qanday abonent to'lovi yoki komissiya yo'q.
                </span>
              </div>

              {/* Footer CTA */}
              <div className="cbm-actions-footer">
                <button 
                  type="button" 
                  className="cbm-btn-secondary" 
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  className="cbm-btn-primary" 
                  disabled={isSubmitting || bots.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Ulanmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Ulash va Faollashtirish</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
