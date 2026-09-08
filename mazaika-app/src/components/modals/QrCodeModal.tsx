import { useState, useEffect } from 'react'
import { X, Download, Copy, Check, QrCode as QrIcon } from 'lucide-react'
import QRCode from 'qrcode'
import './QrCodeModal.css'

interface QrCodeModalProps {
  isOpen: boolean
  onClose: () => void
  url: string
  title?: string
}

export default function QrCodeModal({
  isOpen,
  onClose,
  url,
  title = 'Telegram Бот / Mini App'
}: QrCodeModalProps) {
  const [styleTheme, setStyleTheme] = useState<'obsidian' | 'classic' | 'gold'>('obsidian')
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isOpen || !url) return

    const generateQR = async () => {
      let darkColor = '#00F5C4'
      let lightColor = '#060911'

      if (styleTheme === 'classic') {
        darkColor = '#000000'
        lightColor = '#FFFFFF'
      } else if (styleTheme === 'gold') {
        darkColor = '#F59E0B'
        lightColor = '#0F172A'
      }

      try {
        const dataUrl = await QRCode.toDataURL(url, {
          width: 320,
          margin: 2,
          color: {
            dark: darkColor,
            light: lightColor
          }
        })
        setQrDataUrl(dataUrl)
      } catch (err) {
        console.error('QR generation error:', err)
      }
    }

    generateQR()
  }, [isOpen, url, styleTheme])

  if (!isOpen) return null

  const handleDownload = () => {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_qr.png`
    a.click()
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-window" onClick={e => e.stopPropagation()}>
        <div className="qr-modal-header">
          <div className="qr-title-wrap">
            <div className="qr-icon-box">
              <QrIcon size={18} />
            </div>
            <div>
              <h3>Дизайнерский QR-Код ($0.00)</h3>
              <p>Для печати на меню, визитках, наклейках и упаковке</p>
            </div>
          </div>
          <button className="qr-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="qr-modal-body">
          {/* Theme Switcher */}
          <div className="qr-theme-row">
            <button
              className={`qr-theme-btn ${styleTheme === 'obsidian' ? 'active' : ''}`}
              onClick={() => setStyleTheme('obsidian')}
            >
              <span className="qr-color-dot cyan" />
              <span>Cyber Neon</span>
            </button>
            <button
              className={`qr-theme-btn ${styleTheme === 'gold' ? 'active' : ''}`}
              onClick={() => setStyleTheme('gold')}
            >
              <span className="qr-color-dot gold" />
              <span>Gold VIP</span>
            </button>
            <button
              className={`qr-theme-btn ${styleTheme === 'classic' ? 'active' : ''}`}
              onClick={() => setStyleTheme('classic')}
            >
              <span className="qr-color-dot white" />
              <span>Печатный (Белый)</span>
            </button>
          </div>

          {/* QR Display Frame */}
          <div className={`qr-display-frame ${styleTheme}`}>
            {qrDataUrl ? (
              <div className="qr-image-wrapper">
                <img src={qrDataUrl} alt="QR Code" className="qr-code-img" />
                <div className="qr-center-badge">
                  <span>✈️</span>
                </div>
              </div>
            ) : (
              <div className="qr-loading-text">Генерация QR-кода...</div>
            )}
            <div className="qr-frame-title">{title}</div>
            <div className="qr-frame-url">{url}</div>
          </div>

          {/* Action Buttons */}
          <div className="qr-actions-row">
            <button className="qr-copy-btn" onClick={handleCopyLink}>
              {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
              <span>{copied ? 'Ссылка скопирована' : 'Скопировать ссылку'}</span>
            </button>

            <button className="qr-download-btn" onClick={handleDownload} disabled={!qrDataUrl}>
              <Download size={14} />
              <span>Скачать PNG (Высокое качество)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
