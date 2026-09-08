import React, { useState } from 'react'
import { Bot, Key, ExternalLink, X, Check, AlertCircle, Loader2 } from 'lucide-react'
import './TokenInputModal.css'

interface TokenInputModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (token: string) => Promise<void>
  initialToken?: string
  botName?: string
}

export default function TokenInputModal({
  isOpen,
  onClose,
  onSubmit,
  initialToken = '',
  botName = 'Telegram Бот'
}: TokenInputModalProps) {
  const [token, setToken] = useState(initialToken)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanToken = token.trim()
    if (!cleanToken) {
      setError('Пожалуйста, введите токен бота')
      return
    }

    // Basic format check: Telegram tokens are typically 123456789:ABC...
    if (!cleanToken.includes(':') || cleanToken.length < 25) {
      setError('Неверный формат токена. Пример: 123456789:AAHk...')
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      await onSubmit(cleanToken)
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Ошибка запуска бота с этим токеном')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="token-modal-overlay" onClick={onClose}>
      <div className="token-modal-card" onClick={e => e.stopPropagation()}>
        <div className="token-modal-header">
          <div className="token-modal-badge">
            <Bot size={20} className="text-cyan-400" />
            <span>Подключение к Telegram</span>
          </div>
          <button className="token-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="token-modal-body">
          <h2 className="token-modal-title">Активация бота в Telegram</h2>
          <p className="token-modal-desc">
            Чтобы запустить бота <strong>«{botName}»</strong>, укажите API токен, полученный от официального бота Telegram:
          </p>

          <div className="token-instruction-card">
            <div className="token-step">
              <span className="step-num">1</span>
              <div>
                Откройте официального бота <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="botfather-link">@BotFather <ExternalLink size={12} /></a> в Telegram.
              </div>
            </div>
            <div className="token-step">
              <span className="step-num">2</span>
              <div>
                Отправьте команду <code>/newbot</code> и придумайте имя и username (оканчивающийся на <code>bot</code>).
              </div>
            </div>
            <div className="token-step">
              <span className="step-num">3</span>
              <div>
                Скопируйте полученный <strong>HTTP API токен</strong> и вставьте его в поле ниже:
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="token-form">
            <div className="token-input-group">
              <Key size={16} className="token-input-icon" />
              <input
                type="text"
                placeholder="7123456789:AAFq_xXXXXXXXXXX..."
                value={token}
                onChange={e => {
                  setToken(e.target.value)
                  if (error) setError(null)
                }}
                autoFocus
                className="token-input"
              />
            </div>

            {error && (
              <div className="token-error-banner">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <div className="token-modal-actions">
              <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>
                Отмена
              </button>
              <button type="submit" className="btn-submit" disabled={isSubmitting || !token.trim()}>
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Проверка и запуск...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Активировать и запустить</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
