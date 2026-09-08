import { useState } from 'react'
import { X, Globe, Sparkles, Check, Share2 } from 'lucide-react'
import './SeoPreviewModal.css'

interface SeoPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  siteTitle: string
  siteDesc: string
  siteUrl: string
  currentHtml: string
  onApplySeo: (updatedHtml: string, title: string, desc: string) => void
}

export default function SeoPreviewModal({
  isOpen,
  onClose,
  siteTitle,
  siteDesc,
  siteUrl,
  currentHtml,
  onApplySeo
}: SeoPreviewModalProps) {
  const [title, setTitle] = useState(siteTitle || 'Мой Веб-сайт')
  const [desc, setDesc] = useState(siteDesc || 'Современный интерактивный веб-сайт, созданный на платформе Mazaika AI.')
  const [keywords, setKeywords] = useState('telegram bot, mini app, mazaika, веб-сайт, стартап')
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop')
  const [activeTab, setActiveTab] = useState<'telegram' | 'google' | 'whatsapp'>('telegram')

  if (!isOpen) return null

  const domain = siteUrl ? siteUrl.replace(/^https?:\/\//, '').split('/')[0] : 'mazaika.app'

  // AI Auto-Generate SEO Tags
  const handleAutoGenerate = () => {
    const cleanTitle = title.trim() || 'Инновационный проект'
    setTitle(`${cleanTitle} — Официальный сайт и Mini App`)
    setDesc(`${cleanTitle}: современный сервис с быстрой доставкой, онлайн-заказом и удобным Telegram-ботом. Откройте для себя лучшие предложения прямо сейчас.`)
    setKeywords('сервис, онлайн заказ, telegram mini app, скидки, каталог, mazaika')
  }

  // Inject Meta Tags into HTML <head>
  const handleSaveAndInject = () => {
    let updatedHtml = currentHtml || '<!DOCTYPE html><html><head></head><body></body></html>'

    const seoTags = `
  <!-- Primary SEO Tags -->
  <title>${title}</title>
  <meta name="title" content="${title}">
  <meta name="description" content="${desc}">
  <meta name="keywords" content="${keywords}">

  <!-- Open Graph / Facebook / Telegram -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${siteUrl || 'https://mazaika.app'}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="${imageUrl}">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${siteUrl || 'https://mazaika.app'}">
  <meta property="twitter:title" content="${title}">
  <meta property="twitter:description" content="${desc}">
  <meta property="twitter:image" content="${imageUrl}">
`

    if (updatedHtml.includes('</head>')) {
      updatedHtml = updatedHtml.replace(/<title>[\s\S]*?<\/title>/i, '')
      updatedHtml = updatedHtml.replace('</head>', `${seoTags}\n</head>`)
    } else {
      updatedHtml = `<head>${seoTags}</head>\n${updatedHtml}`
    }

    onApplySeo(updatedHtml, title, desc)
    onClose()
  }

  return (
    <div className="seo-modal-overlay" onClick={onClose}>
      <div className="seo-modal-window" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="seo-modal-header">
          <div className="seo-title-wrap">
            <div className="seo-icon-box">
              <Share2 size={18} />
            </div>
            <div>
              <h3>SEO & Соцсети Live Previewer</h3>
              <p>Предпросмотр ссылки в Telegram, WhatsApp и поисковой выдаче Google</p>
            </div>
          </div>
          <button className="seo-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="seo-modal-body">
          {/* Platform Switcher */}
          <div className="seo-tabs-row">
            <button
              className={`seo-tab-btn ${activeTab === 'telegram' ? 'active' : ''}`}
              onClick={() => setActiveTab('telegram')}
            >
              <span className="seo-tab-dot blue" />
              <span>Telegram Preview</span>
            </button>
            <button
              className={`seo-tab-btn ${activeTab === 'google' ? 'active' : ''}`}
              onClick={() => setActiveTab('google')}
            >
              <span className="seo-tab-dot green" />
              <span>Google SERP</span>
            </button>
            <button
              className={`seo-tab-btn ${activeTab === 'whatsapp' ? 'active' : ''}`}
              onClick={() => setActiveTab('whatsapp')}
            >
              <span className="seo-tab-dot emerald" />
              <span>WhatsApp Preview</span>
            </button>
          </div>

          {/* Live Preview Screen */}
          <div className="seo-preview-screen">
            {activeTab === 'telegram' && (
              <div className="seo-tg-card">
                <div className="seo-tg-link-bubble">
                  <span className="seo-tg-url-text">{siteUrl || 'https://mazaika.app/sites/preview'}</span>
                </div>
                <div className="seo-tg-rich-card">
                  <div className="seo-tg-image-wrap">
                    <img src={imageUrl} alt="preview" onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800' }} />
                  </div>
                  <div className="seo-tg-content">
                    <div className="seo-tg-domain">{domain}</div>
                    <div className="seo-tg-title">{title}</div>
                    <div className="seo-tg-desc">{desc}</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'google' && (
              <div className="seo-google-card">
                <div className="seo-google-meta">
                  <div className="seo-google-favicon">
                    <Globe size={13} />
                  </div>
                  <div className="seo-google-url-wrap">
                    <div className="seo-google-site-name">{title.split('—')[0].trim() || 'Mazaika Site'}</div>
                    <div className="seo-google-breadcrumb">https://{domain} › site</div>
                  </div>
                </div>
                <div className="seo-google-title">{title}</div>
                <div className="seo-google-desc">{desc}</div>
              </div>
            )}

            {activeTab === 'whatsapp' && (
              <div className="seo-wa-card">
                <div className="seo-wa-bubble">
                  <div className="seo-wa-inner">
                    <img src={imageUrl} alt="preview" className="seo-wa-thumb" />
                    <div className="seo-wa-text-box">
                      <div className="seo-wa-title">{title}</div>
                      <div className="seo-wa-desc">{desc}</div>
                      <div className="seo-wa-domain">{domain}</div>
                    </div>
                  </div>
                  <div className="seo-wa-link">{siteUrl || 'https://mazaika.app/sites/preview'}</div>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="seo-form-grid">
            <div className="seo-field">
              <label>Meta Заголовок (Title):</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Заголовок для соцсетей и поисковиков..."
              />
            </div>

            <div className="seo-field">
              <label>Meta Описание (Description):</label>
              <textarea
                rows={2}
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Краткое описание ссылки..."
              />
            </div>

            <div className="seo-field">
              <label>Обложка соцсетей (og:image URL):</label>
              <input
                type="text"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="seo-footer-actions">
            <button
              type="button"
              className="seo-ai-gen-btn"
              onClick={handleAutoGenerate}
            >
              <Sparkles size={14} />
              <span>AI Оптимизация тегов</span>
            </button>

            <button
              type="button"
              className="seo-apply-btn"
              onClick={handleSaveAndInject}
            >
              <Check size={15} />
              <span>Внедрить SEO в код сайта</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
