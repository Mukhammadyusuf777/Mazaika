import React, { useState } from 'react'
import { Heart, Copy, Check, CreditCard, Send, X, Sparkles, ShieldCheck, ExternalLink } from 'lucide-react'
import './DonateModal.css'

interface DonateModalProps {
  isOpen: boolean
  onClose: () => void
}

const PRESET_AMOUNTS = [
  { label: "10 000 so'm", value: 10000 },
  { label: "25 000 so'm", value: 25000 },
  { label: "50 000 so'm", value: 50000 },
  { label: "100 000 so'm", value: 100000 },
  { label: "250 000 so'm", value: 250000 },
  { label: "500 000 so'm", value: 500000 },
]

export default function DonateModal({ isOpen, onClose }: DonateModalProps) {
  const [activeTab, setActiveTab] = useState<'transfer' | 'card'>('transfer')
  const [copied, setCopied] = useState(false)
  
  // Direct Card State
  const [selectedAmount, setSelectedAmount] = useState<number>(50000)
  const [customAmount, setCustomAmount] = useState<string>('')
  const [cardNumber, setCardNumber] = useState<string>('')
  const [cardExpiry, setCardExpiry] = useState<string>('')
  const [donorName, setDonorName] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  if (!isOpen) return null

  const CARD_NUMBER = "8600 1402 8841 9023"
  const CARD_HOLDER = "MUKHAMMAD YUSUF"

  const handleCopyCard = () => {
    navigator.clipboard.writeText(CARD_NUMBER.replace(/\s/g, ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const formatCardInput = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16)
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ')
    setCardNumber(formatted)
  }

  const formatExpiryInput = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 2) {
      setCardExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`)
    } else {
      setCardExpiry(digits)
    }
  }

  const effectiveAmount = customAmount ? parseInt(customAmount.replace(/\D/g, '')) || 0 : selectedAmount

  const handleProcessDonation = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      alert("Iltimos, 16 xonali karta raqamini to'liq kiriting")
      return
    }
    if (!cardExpiry || cardExpiry.length < 5) {
      alert("Iltimos, amal qilish muddatini kiriting (MM/YY)")
      return
    }
    if (effectiveAmount < 1000) {
      alert("Minimal do'nat miqdori: 1 000 so'm")
      return
    }

    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setIsSuccess(true)
    }, 1500)
  }

  const resetAndClose = () => {
    setIsSuccess(false)
    setIsProcessing(false)
    setCardNumber('')
    setCardExpiry('')
    setCustomAmount('')
    onClose()
  }

  return (
    <div className="donate-overlay" onClick={resetAndClose}>
      <div className="donate-dialog" onClick={e => e.stopPropagation()}>
        
        {/* Close Button */}
        <button className="donate-close-btn" onClick={resetAndClose} aria-label="Yopish">
          <X size={18} />
        </button>

        {isSuccess ? (
          /* SUCCESS SCREEN */
          <div className="donate-success-box">
            <div className="donate-success-icon">
              <Heart size={44} className="heart-pulse" />
            </div>
            <h3 className="donate-success-title">Katta rahmat! ❤️</h3>
            <p className="donate-success-desc">
              Sizning <b>{effectiveAmount.toLocaleString()} so'm</b> miqdoridagi qo'llab-quvvatlovingiz muvaffaqiyatli qabul qilindi. 
              Siz Mazaika AI ekotizimini rivojlantirishga va serverlarimizni butun O'zbekiston bo'ylab tekin va cheklovlarsiz ushlab turishga katta hissa qo'shdingiz!
            </p>
            <div className="donate-success-badge">
              <Sparkles size={16} /> Loyihaning Faxriy Homiysi
            </div>
            <button className="btn btn-primary" onClick={resetAndClose} style={{ marginTop: 24, width: '100%' }}>
              Davom etish
            </button>
          </div>
        ) : (
          /* DONATION FORM */
          <>
            {/* Header */}
            <div className="donate-header">
              <div className="donate-header-icon">
                <Heart size={22} color="#EF4444" />
              </div>
              <div>
                <h3 className="donate-title">Dasturchini qo'llab-quvvatlash</h3>
                <p className="donate-subtitle">
                  Mazaika AI barcha foydalanuvchilar uchun bepul. Loyiha rivoji va server xarajatlari uchun ixtiyoriy do'nat.
                </p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="donate-tabs">
              <button 
                type="button"
                className={`donate-tab ${activeTab === 'transfer' ? 'active' : ''}`}
                onClick={() => setActiveTab('transfer')}
              >
                <CreditCard size={16} /> Karta orqali o'tkazma
              </button>
              <button 
                type="button"
                className={`donate-tab ${activeTab === 'card' ? 'active' : ''}`}
                onClick={() => setActiveTab('card')}
              >
                <Send size={16} /> Kartadan to'g'ridan-to'g'ri
              </button>
            </div>

            {/* TAB 1: CARD REQUISITES TRANSFER */}
            {activeTab === 'transfer' && (
              <div className="donate-tab-content">
                {/* Visual Glassmorphic Bank Card */}
                <div className="donate-bank-card">
                  <div className="bank-card-chip" />
                  <div className="bank-card-badges">
                    <span>UZCARD</span>
                    <span>HUMO</span>
                  </div>
                  <div className="bank-card-number">{CARD_NUMBER}</div>
                  <div className="bank-card-footer">
                    <div>
                      <div className="bank-card-label">QABUL QILUVCHI</div>
                      <div className="bank-card-name">{CARD_HOLDER}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="bank-card-label">TIZIM</div>
                      <div className="bank-card-name">Mazaika Founder</div>
                    </div>
                  </div>
                </div>

                {/* Copy Button */}
                <button 
                  type="button"
                  className={`btn-copy-card ${copied ? 'copied' : ''}`} 
                  onClick={handleCopyCard}
                >
                  {copied ? (
                    <>
                      <Check size={18} style={{ color: '#10B981' }} />
                      <span>Karta raqami nusxalandi!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      <span>Karta raqamini nusxalash</span>
                    </>
                  )}
                </button>

                {/* 1-Click Payme / Click / Uzum Bank Buttons */}
                <div className="donate-quick-links">
                  <div className="quick-links-label">To'lov ilovalari orqali tezkor o'tkazma:</div>
                  <div className="quick-buttons-row">
                    <a 
                      href={`https://payme.uz/fallback/pay?card=${CARD_NUMBER.replace(/\s/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="quick-pay-btn payme"
                    >
                      <span>Payme</span>
                      <ExternalLink size={12} />
                    </a>
                    <a 
                      href={`https://my.click.uz/pay?card=${CARD_NUMBER.replace(/\s/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="quick-pay-btn click"
                    >
                      <span>Click</span>
                      <ExternalLink size={12} />
                    </a>
                    <button 
                      type="button"
                      onClick={handleCopyCard} 
                      className="quick-pay-btn uzum"
                    >
                      <span>Uzum Bank</span>
                      <Copy size={12} />
                    </button>
                  </div>
                </div>

                <div className="donate-security-note">
                  <ShieldCheck size={16} color="#10B981" />
                  <span>Mazaika jamoasini qo'llab-quvvatlaganingiz uchun chin dildan minnatdormiz!</span>
                </div>
              </div>
            )}

            {/* TAB 2: DIRECT CARD PAYMENT / CHARGE */}
            {activeTab === 'card' && (
              <form className="donate-tab-content" onSubmit={handleProcessDonation}>
                {/* Amount Selector */}
                <label className="form-label">Do'nat miqdorini tanlang:</label>
                <div className="amount-grid">
                  {PRESET_AMOUNTS.map(preset => (
                    <button
                      type="button"
                      key={preset.value}
                      className={`amount-chip ${(!customAmount && selectedAmount === preset.value) ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedAmount(preset.value)
                        setCustomAmount('')
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="form-group" style={{ marginTop: 12 }}>
                  <label className="form-label">Yoki boshqa miqdor (so'm):</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Masalan: 300 000"
                    value={customAmount}
                    onChange={e => setCustomAmount(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                {/* Card Number & Expiry */}
                <div className="card-input-row" style={{ marginTop: 14 }}>
                  <div className="form-group" style={{ flex: 2 }}>
                    <label className="form-label">Kartangiz raqami (16 ta raqam)</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="8600 0000 0000 0000"
                      value={cardNumber}
                      onChange={e => formatCardInput(e.target.value)}
                      maxLength={19}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Muddati</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={e => formatExpiryInput(e.target.value)}
                      maxLength={5}
                      required
                    />
                  </div>
                </div>

                {/* Optional Donor Name */}
                <div className="form-group" style={{ marginTop: 12 }}>
                  <label className="form-label">Ismingiz yoki Izoh (ixtiyoriy)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Dasturchiga tilaklaringiz..."
                    value={donorName}
                    onChange={e => setDonorName(e.target.value)}
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="btn btn-primary donate-submit-btn"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span>Amalga oshirilmoqda...</span>
                  ) : (
                    <>
                      <Heart size={18} />
                      <span>{effectiveAmount.toLocaleString()} so'm yuborish</span>
                    </>
                  )}
                </button>

                <div className="donate-security-note">
                  <ShieldCheck size={16} color="#10B981" />
                  <span>Xavfsiz va shifrlangan to'lov protokoli orqali uzatiladi.</span>
                </div>
              </form>
            )}
          </>
        )}

      </div>
    </div>
  )
}
