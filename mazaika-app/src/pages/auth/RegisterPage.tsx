import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from 'firebase/auth'
import type { ConfirmationResult } from 'firebase/auth'
import {
  Sparkles, Mail, Lock, Phone, ArrowRight, Eye, EyeOff,
  Loader2, KeyRound, CheckCircle2, User
} from 'lucide-react'
import { auth, googleProvider } from '../../api/firebase'
import { useAuthStore } from '../../store/useAuthStore'
import { createOrUpdateUser } from '../../api/firestore'
import './AuthPages.css'

type RegTab = 'google' | 'email' | 'phone'

declare global {
  interface Window { recaptchaVerifierReg: RecaptchaVerifier }
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [tab, setTab] = useState<RegTab>('google')
  const [lang, setLang] = useState<'uz' | 'ru'>('uz')

  // Email form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Phone form
  const [namePhone, setNamePhone] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null)
  const [otpSent, setOtpSent] = useState(false)

  const [agreed, setAgreed] = useState(true)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const txt = {
    uz: {
      brandTag: '2.0',
      showcaseTitle1: 'Telegramda O\'z',
      showcaseTitle2: 'Biznesingizni Boshlang',
      showcaseDesc: '30 soniyada bepul ro\'yxatdan o\'ting va birinchi Telegram-botingizni dasturchilarsiz yarating.',
      feat1: '500 ta bepul kontaktlar va xabarlar',
      feat2: 'Payme & Click to\'lov tizimlari 0% komissiya',
      feat3: 'Mazaika AI (DeepSeek-R1) orqali avto-loyihalash',
      feat4: 'Telegram Mini App (do\'kon) integratsiyasi',
      testimonial: '"Mazaika tufayli biz IT-agentlikka $3,000 sarflashdan qutulib qoldik. Hammasi oson va tushunarli."',
      author: 'Jamshid T. — "Express Market" rahbari',
      title: 'Ro\'yxatdan o\'tish',
      sub: 'Bepul hisob oching — atigi 30 soniya',
      tabGoogle: 'Google',
      tabEmail: 'Email',
      tabPhone: 'Telefon',
      nameLabel: 'Ism va familiyangiz',
      emailLabel: 'Elektron pochta',
      passLabel: 'Parol (kamida 6 belgi)',
      phoneLabel: 'Telefon raqamingiz',
      otpLabel: 'Tasdiqlash kodi (SMS)',
      btn: 'Hisob yaratish',
      sendOtp: 'SMS kod yuborish',
      verifyOtp: 'Tasdiqlash va kirish',
      hasAcc: 'Allaqachon hisobingiz bormi?',
      login: 'Tizimga kirish',
      googleBtn: 'Google orqali ro\'yxatdan o\'tish',
      googleDesc: 'Parolsiz, bir zumda Google akkauntingiz orqali ro\'yxatdan o\'ting',
      phonePh: '+998 90 123 45 67',
      otpPh: '123456',
      terms: 'Foydalanish shartlari',
      agree: 'va maxfiylik siyosatiga roziman',
      otpSentMsg: 'SMS tasdiqlash kodi telefoningizga yuborildi',
      back: 'Bosh sahifaga qaytish'
    },
    ru: {
      brandTag: '2.0',
      showcaseTitle1: 'Запустите Бизнес',
      showcaseTitle2: 'в Telegram за Минуты',
      showcaseDesc: 'Создайте бесплатный аккаунт за 30 секунд и соберите своего первого бота без программистов.',
      feat1: '500 бесплатных контактов навсегда',
      feat2: 'Подключение Payme и Click с 0% комиссии платформы',
      feat3: 'Генерация структуры через Mazaika AI',
      feat4: 'Полноценные Telegram Mini Apps с корзиной',
      testimonial: '"Mazaika сэкономила нам тысячи долларов на разработке. Мы запустили прием платежей в боте за один вечер."',
      author: 'Джамшид Т. — Руководитель "Express Market"',
      title: 'Создать аккаунт',
      sub: 'Быстрая регистрация — менее минуты',
      tabGoogle: 'Google',
      tabEmail: 'Email',
      tabPhone: 'Телефон',
      nameLabel: 'Ваше имя',
      emailLabel: 'Адрес Email',
      passLabel: 'Пароль (минимум 6 символов)',
      phoneLabel: 'Номер телефона',
      otpLabel: 'Код подтверждения (SMS)',
      btn: 'Зарегистрироваться',
      sendOtp: 'Отправить SMS код',
      verifyOtp: 'Подтвердить и войти',
      hasAcc: 'Уже зарегистрированы?',
      login: 'Войти',
      googleBtn: 'Регистрация через Google',
      googleDesc: 'Мгновенная регистрация в один клик без заполнения форм',
      phonePh: '+998 90 123 45 67',
      otpPh: '123456',
      terms: 'Условиями сервиса',
      agree: 'и политикой конфиденциальности согласен',
      otpSentMsg: 'SMS код подтверждения отправлен на ваш номер',
      back: 'На главную'
    }
  }[lang]

  const saveUser = async (firebaseUser: any, displayName?: string) => {
    const finalName = displayName || firebaseUser.displayName || firebaseUser.email || firebaseUser.phoneNumber || 'User'
    await createOrUpdateUser(firebaseUser.uid, {
      name: finalName,
      email: firebaseUser.email || null,
      phone: firebaseUser.phoneNumber || null,
    })
    setUser({ id: firebaseUser.uid, name: finalName, email: firebaseUser.email, phone: firebaseUser.phoneNumber })
    navigate('/dashboard')
  }

  // Google Register
  const handleGoogleRegister = async () => {
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

  // Email Register
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) {
      setError(lang === 'uz' ? 'Shartlarga rozilik bildiring' : 'Примите условия использования')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(result.user, { displayName: name })
      await saveUser(result.user, name)
    } catch (e: any) {
      setError(e.message)
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
      if (!window.recaptchaVerifierReg) {
        window.recaptchaVerifierReg = new RecaptchaVerifier(auth, 'recaptcha-container-reg', { size: 'invisible' })
      }
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifierReg)
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
      if (namePhone) {
        await updateProfile(result.user, { displayName: namePhone })
      }
      saveUser(result.user, namePhone)
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
        {/* LEFT: BRAND & BENEFIT SHOWCASE PANEL */}
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
              <div className="auth-test-avatar">JT</div>
              <span>{txt.author}</span>
            </div>
          </div>
        </div>

        {/* RIGHT: INTERACTIVE REGISTRATION FORM */}
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
                onClick={handleGoogleRegister}
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
            <form onSubmit={handleEmailRegister}>
              <div className="auth-input-group">
                <label className="auth-input-label">{txt.nameLabel}</label>
                <div className="auth-input-wrapper">
                  <div className="auth-input-icon"><User size={16} /></div>
                  <input
                    type="text"
                    className="auth-input-field"
                    placeholder="Alisher Navoiy"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

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
                <label className="auth-input-label">{txt.passLabel}</label>
                <div className="auth-input-wrapper">
                  <div className="auth-input-icon"><Lock size={16} /></div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input-field"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    minLength={6}
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

              <div className="auth-agree-wrap">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                />
                <label htmlFor="agree">
                  <a href="#" onClick={e => { e.preventDefault(); alert("Mazaika platformasidan foydalanish qoidalari") }}>
                    {txt.terms}
                  </a> {txt.agree}
                </label>
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
              <div id="recaptcha-container-reg"></div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp}>
                  <div className="auth-input-group">
                    <label className="auth-input-label">{txt.nameLabel}</label>
                    <div className="auth-input-wrapper">
                      <div className="auth-input-icon"><User size={16} /></div>
                      <input
                        type="text"
                        className="auth-input-field"
                        placeholder="Ismingiz"
                        value={namePhone}
                        onChange={e => setNamePhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

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
            {txt.hasAcc}
            <Link to="/login">{txt.login}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
