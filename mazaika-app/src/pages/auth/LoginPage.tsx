import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  sendPasswordResetEmail,
} from 'firebase/auth'
import type { ConfirmationResult } from 'firebase/auth'
import {
  Sparkles, Mail, Lock, Phone, ArrowRight, Eye, EyeOff,
  Loader2, KeyRound, CheckCircle2
} from 'lucide-react'
import { auth, googleProvider } from '../../api/firebase'
import { useAuthStore } from '../../store/useAuthStore'
import { createOrUpdateUser } from '../../api/firestore'
import './AuthPages.css'

type AuthTab = 'google' | 'email' | 'phone'

declare global {
  interface Window { recaptchaVerifier: RecaptchaVerifier }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [tab, setTab] = useState<AuthTab>('google')
  const [lang, setLang] = useState<'uz' | 'ru'>('uz')

  // Email form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Phone form
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null)
  const [otpSent, setOtpSent] = useState(false)

  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const txt = {
    uz: {
      brandTag: '2.0',
      showcaseTitle1: 'Telegram Biznesi Uchun',
      showcaseTitle2: 'Yagona Boshqaruv Markazi',
      showcaseDesc: 'No-code botlar, Telegram Mini App internet-do\'konlari, Payme & Click to\'lovlari va Mazaika AI yordamchisi.',
      feat1: 'Vizual blokli sxema (22+ blok turlari)',
      feat2: 'Telegram Mini App (WebApp) avto-sinxronizatsiya',
      feat3: 'Mazaika AI (DeepSeek-R1) arxitektori',
      feat4: 'Fiskal chekli Payme va Click to\'lovlari',
      testimonial: '"Mazaika yordamida buyurtmalarimiz soni 3 baravarga oshdi, mijozlar esa Telegram ilovasining o\'zidayoq to\'lov qilmoqda."',
      author: 'Akmal R. — "Coffee & Bakery" asoschisi',
      title: 'Tizimga kirish',
      sub: 'Mazaika boshqaruv kabinetiga xush kelibsiz',
      tabGoogle: 'Google',
      tabEmail: 'Email',
      tabPhone: 'Telefon',
      emailLabel: 'Elektron pochta',
      passLabel: 'Parol',
      phoneLabel: 'Telefon raqamingiz',
      otpLabel: 'Tasdiqlash kodi (SMS)',
      btn: 'Kirish',
      sendOtp: 'SMS kod yuborish',
      verifyOtp: 'Tasdiqlash',
      forgot: 'Parolni unutdingizmi?',
      noAcc: 'Hisobingiz yo\'qmi?',
      reg: 'Ro\'yxatdan o\'tish',
      googleBtn: 'Google orqali davom etish',
      googleDesc: 'Bir marta bosish orqali xavfsiz va tezkor kirish',
      phonePh: '+998 90 123 45 67',
      otpPh: '123456',
      otpSentMsg: 'SMS tasdiqlash kodi raqamingizga yuborildi',
      back: 'Bosh sahifaga qaytish'
    },
    ru: {
      brandTag: '2.0',
      showcaseTitle1: 'Единый Центр Управления',
      showcaseTitle2: 'для Telegram-Бизнеса',
      showcaseDesc: 'No-Code конструктор ботов, интерактивные Telegram Mini Apps, платежи Payme / Click и Mazaika AI.',
      feat1: 'Визуальный граф сценариев (22+ типа блоков)',
      feat2: 'Telegram Mini App магазины с корзиной',
      feat3: 'Mazaika AI (на базе DeepSeek-R1)',
      feat4: 'Прямой прием оплат Payme, Click и Uzum',
      testimonial: '"С Mazaika мы автоматизировали 80% рутинных заказов и запустили продажи в Telegram буквально за один день."',
      author: 'Акмаль Р. — Основатель "Coffee & Bakery"',
      title: 'Вход в аккаунт',
      sub: 'Добро пожаловать в панель управления Mazaika',
      tabGoogle: 'Google',
      tabEmail: 'Email',
      tabPhone: 'Телефон',
      emailLabel: 'Адрес Email',
      passLabel: 'Пароль',
      phoneLabel: 'Номер телефона',
      otpLabel: 'Код подтверждения (SMS)',
      btn: 'Войти',
      sendOtp: 'Отправить SMS код',
      verifyOtp: 'Подтвердить код',
      forgot: 'Забыли пароль?',
      noAcc: 'Еще нет аккаунта?',
      reg: 'Зарегистрироваться',
      googleBtn: 'Продолжить с Google',
      googleDesc: 'Безопасный вход в один клик без паролей',
      phonePh: '+998 90 123 45 67',
      otpPh: '123456',
      otpSentMsg: 'SMS код подтверждения отправлен на ваш номер',
      back: 'На главную'
    }
  }[lang]

  const saveUser = async (firebaseUser: any) => {
    const name = firebaseUser.displayName || firebaseUser.email || firebaseUser.phoneNumber || 'User'
    await createOrUpdateUser(firebaseUser.uid, {
      name,
      email: firebaseUser.email || null,
      phone: firebaseUser.phoneNumber || null,
    })
    setUser({ id: firebaseUser.uid, name, email: firebaseUser.email, phone: firebaseUser.phoneNumber })
    navigate('/dashboard')
  }

  // Google Login
  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError('')
    try {
      const result = await signInWithPopup(auth, googleProvider)
      await saveUser(result.user)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Email Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      await saveUser(result.user)
    } catch (firebaseError: any) {
      setError(firebaseError.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Phone OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setInfo('')
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = null as any
      }
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' })
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier)
      setConfirmation(result)
      setOtpSent(true)
      setInfo(txt.otpSentMsg)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Verify Phone OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirmation) return
    setIsLoading(true)
    setError('')
    try {
      const result = await confirmation.confirm(otp)
      saveUser(result.user)
    } catch (e: any) {
      setError(lang === 'uz' ? 'SMS kod xato yoki muddati tugagan' : 'Неверный или просроченный SMS код')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Background ambient lighting */}
      <div className="auth-bg-ambient">
        <div className="auth-ambient-glow-1" />
        <div className="auth-ambient-glow-2" />
        <div className="auth-ambient-grid" />
      </div>

      <div className="auth-split-wrapper">
        {/* LEFT: BRAND & PRODUCT SHOWCASE PANEL */}
        <div className="auth-showcase-panel">
          <div className="auth-brand-head" onClick={() => navigate('/')}>
            <div className="auth-brand-icon">
              <Sparkles size={18} color="#00D9FF" />
            </div>
            <span className="auth-brand-name">Mazaika</span>
            <span className="auth-brand-tag">{txt.brandTag}</span>
          </div>

          <div className="auth-showcase-center">
            <h2 className="auth-showcase-title">
              {txt.showcaseTitle1} <br />
              <span className="text-cyan">{txt.showcaseTitle2}</span>
            </h2>
            <p className="auth-showcase-desc">{txt.showcaseDesc}</p>

            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <span className="auth-feature-dot"></span>
                <span>{txt.feat1}</span>
              </div>
              <div className="auth-feature-item">
                <span className="auth-feature-dot"></span>
                <span>{txt.feat2}</span>
              </div>
              <div className="auth-feature-item">
                <span className="auth-feature-dot"></span>
                <span>{txt.feat3}</span>
              </div>
              <div className="auth-feature-item">
                <span className="auth-feature-dot"></span>
                <span>{txt.feat4}</span>
              </div>
            </div>
          </div>

          <div className="auth-testimonial-card">
            <p className="auth-test-text">{txt.testimonial}</p>
            <div className="auth-test-author">
              <div className="auth-test-avatar">AR</div>
              <span>{txt.author}</span>
            </div>
          </div>
        </div>

        {/* RIGHT: INTERACTIVE FORM PANEL */}
        <div className="auth-form-panel">
          <div className="auth-panel-topbar">
            <span className="auth-back-link" onClick={() => navigate('/')}>
              ← {txt.back}
            </span>

            <div className="auth-lang-pills">
              <button className={lang === 'uz' ? 'active' : ''} onClick={() => setLang('uz')}>
                UZ
              </button>
              <button className={lang === 'ru' ? 'active' : ''} onClick={() => setLang('ru')}>
                RU
              </button>
            </div>
          </div>

          <h1 className="auth-form-title">{txt.title}</h1>
          <p className="auth-form-subtitle">{txt.sub}</p>

          {/* Clean Method Tabs */}
          <div className="auth-method-tabs">
            <button
              type="button"
              className={`auth-method-tab ${tab === 'google' ? 'active' : ''}`}
              onClick={() => { setTab('google'); setError(''); setInfo('') }}
            >
              <svg width="16" height="16" viewBox="0 0 48 48">
                <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
                <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
                <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
                <path d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.021 35.738 44 30.29 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
              </svg>
              <span>{txt.tabGoogle}</span>
            </button>

            <button
              type="button"
              className={`auth-method-tab ${tab === 'email' ? 'active' : ''}`}
              onClick={() => { setTab('email'); setError(''); setInfo('') }}
            >
              <Mail size={15} />
              <span>{txt.tabEmail}</span>
            </button>

            <button
              type="button"
              className={`auth-method-tab ${tab === 'phone' ? 'active' : ''}`}
              onClick={() => { setTab('phone'); setError(''); setInfo(''); setOtpSent(false) }}
            >
              <Phone size={15} />
              <span>{txt.tabPhone}</span>
            </button>
          </div>

          {/* TAB 1: GOOGLE ONE-CLICK */}
          {tab === 'google' && (
            <div className="google-auth-box">
              <div className="google-icon-orb">
                <svg width="32" height="32" viewBox="0 0 48 48">
                  <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
                  <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
                  <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
                  <path d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.021 35.738 44 30.29 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
                </svg>
              </div>
              <p className="google-auth-text">{txt.googleDesc}</p>

              {error && <div className="auth-alert-error">{error}</div>}

              <button
                type="button"
                className="btn-google-action"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 size={18} className="spin" />
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
                      <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
                      <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
                      <path d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.021 35.738 44 30.29 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
                    </svg>
                    <span>{txt.googleBtn}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: EMAIL FORM */}
          {tab === 'email' && (
            <form onSubmit={handleEmailLogin}>
              <div className="auth-input-group">
                <label className="auth-input-label">{txt.emailLabel}</label>
                <div className="auth-input-wrapper">
                  <div className="auth-input-icon"><Mail size={16} /></div>
                  <input
                    type="email"
                    className="auth-input-field"
                    placeholder="name@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="auth-input-label">{txt.passLabel}</label>
                  <button
                    type="button"
                    className="auth-forgot-btn"
                    onClick={async (e) => {
                      e.preventDefault()
                      const resetEmail = prompt("Email manzilini kiriting / Введите email:", email)
                      if (resetEmail) {
                        try {
                          await sendPasswordResetEmail(auth, resetEmail)
                          alert("Parolni tiklash havolasi emailga yuborildi!")
                        } catch (err: any) {
                          alert("Xatolik: " + err.message)
                        }
                      }
                    }}
                  >
                    {txt.forgot}
                  </button>
                </div>
                <div className="auth-input-wrapper">
                  <div className="auth-input-icon"><Lock size={16} /></div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input-field"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && <div className="auth-alert-error">{error}</div>}

              <button type="submit" className="btn-auth-submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 size={18} className="spin" />
                ) : (
                  <>
                    <span>{txt.btn}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: PHONE OTP */}
          {tab === 'phone' && (
            <div>
              <div id="recaptcha-container"></div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp}>
                  <div className="auth-input-group">
                    <label className="auth-input-label">{txt.phoneLabel}</label>
                    <div className="auth-input-wrapper">
                      <div className="auth-input-icon"><Phone size={16} /></div>
                      <input
                        type="tel"
                        className="auth-input-field"
                        placeholder={txt.phonePh}
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {error && <div className="auth-alert-error">{error}</div>}

                  <button type="submit" className="btn-auth-submit" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 size={18} className="spin" />
                    ) : (
                      <>
                        <span>{txt.sendOtp}</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp}>
                  {info && <div className="auth-alert-info">{info}</div>}

                  <div className="auth-input-group">
                    <label className="auth-input-label">{txt.otpLabel}</label>
                    <div className="auth-input-wrapper">
                      <div className="auth-input-icon"><KeyRound size={16} /></div>
                      <input
                        type="text"
                        className="auth-input-field"
                        placeholder={txt.otpPh}
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        maxLength={6}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {error && <div className="auth-alert-error">{error}</div>}

                  <button type="submit" className="btn-auth-submit" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 size={18} className="spin" />
                    ) : (
                      <>
                        <span>{txt.verifyOtp}</span>
                        <CheckCircle2 size={16} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn btn-ghost w-full"
                    style={{ marginTop: 10, justifyContent: 'center' }}
                    onClick={() => { setOtpSent(false); setOtp(''); setError(''); setInfo('') }}
                  >
                    {lang === 'uz' ? '← Orqaga qaytish' : '← Вернуться назад'}
                  </button>
                </form>
              )}
            </div>
          )}

          <p className="auth-switch-prompt">
            {txt.noAcc}
            <Link to="/register">{txt.reg}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
