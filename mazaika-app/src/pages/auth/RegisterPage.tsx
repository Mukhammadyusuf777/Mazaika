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
import { auth, googleProvider } from '../../api/firebase'
import { useAuthStore } from '../../store/useAuthStore'
import { createOrUpdateUser } from '../../api/firestore'
import './AuthPages.css'

type RegTab = 'email' | 'phone' | 'google'

declare global {
  interface Window { recaptchaVerifierReg: RecaptchaVerifier }
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [tab, setTab] = useState<RegTab>('email')
  const [lang, setLang] = useState<'uz' | 'ru'>('uz')

  // Email form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Phone form
  const [namePhone, setNamePhone] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null)
  const [otpSent, setOtpSent] = useState(false)

  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const txt = {
    uz: {
      title: "Ro'yxatdan o'tish", sub: 'Bepul hisob oching — 30 soniya',
      emailTab: 'Email', phoneTab: 'Telefon', googleTab: 'Google',
      nameLabel: "To'liq ism", emailLabel: 'Email manzil', passLabel: 'Parol',
      phoneLabel: 'Telefon raqami', otpLabel: 'SMS kod',
      btn: "Ro'yxatdan o'tish", sendOtp: 'SMS kod yuborish', verifyOtp: 'Tasdiqlash',
      hasAcc: 'Allaqachon hisob bormi?', login: 'Kirish',
      googleBtn: "Google orqali ro'yxatdan o'tish", phonePh: '+998 90 123 45 67',
      terms: 'Foydalanish shartlari', agree: 'bilan roziman',
      otpSentMsg: 'SMS kod yuborildi!',
    },
    ru: {
      title: 'Регистрация', sub: 'Создайте бесплатный аккаунт — 30 секунд',
      emailTab: 'Email', phoneTab: 'Телефон', googleTab: 'Google',
      nameLabel: 'Полное имя', emailLabel: 'Адрес Email', passLabel: 'Пароль',
      phoneLabel: 'Номер телефона', otpLabel: 'SMS код',
      btn: 'Зарегистрироваться', sendOtp: 'Отправить SMS код', verifyOtp: 'Подтвердить',
      hasAcc: 'Уже есть аккаунт?', login: 'Войти',
      googleBtn: 'Зарегистрироваться через Google', phonePh: '+998 90 123 45 67',
      terms: 'Условия использования', agree: 'согласен',
      otpSentMsg: 'SMS код отправлен!',
    },
  }[lang]

  const saveUser = async (firebaseUser: any, displayName?: string) => {
    const name = displayName || firebaseUser.displayName || firebaseUser.email || firebaseUser.phoneNumber || 'User'
    await createOrUpdateUser(firebaseUser.uid, {
      name,
      email: firebaseUser.email || null,
      phone: firebaseUser.phoneNumber || null,
    })
    setUser({ id: firebaseUser.uid, name, email: firebaseUser.email, phone: firebaseUser.phoneNumber })
    navigate('/dashboard')
  }

  // GOOGLE REGISTER
  const handleGoogleRegister = async () => {
    setIsLoading(true); setError('')
    try {
      const result = await signInWithPopup(auth, googleProvider)
      saveUser(result.user)
    } catch (e: any) { setError(e.message) }
    finally { setIsLoading(false) }
  }

  // EMAIL REGISTER
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) { setError(lang === 'uz' ? 'Shartlarga rozilik bildiring' : 'Примите условия использования'); return }
    setIsLoading(true); setError('')
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(result.user, { displayName: name })
      saveUser(result.user, name)
    } catch (e: any) { setError(e.message) }
    finally { setIsLoading(false) }
  }

  // PHONE - Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true); setError(''); setInfo('')
    try {
      if (!window.recaptchaVerifierReg) {
        window.recaptchaVerifierReg = new RecaptchaVerifier(auth, 'recaptcha-container-reg', { size: 'invisible' })
      }
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifierReg)
      setConfirmation(result); setOtpSent(true); setInfo(txt.otpSentMsg)
    } catch (e: any) { setError(e.message) }
    finally { setIsLoading(false) }
  }

  // PHONE - Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirmation) return
    setIsLoading(true); setError('')
    try {
      const result = await confirmation.confirm(otp)
      if (namePhone) await updateProfile(result.user, { displayName: namePhone })
      saveUser(result.user, namePhone)
    } catch (e: any) {
      setError(lang === 'uz' ? 'SMS kod xato yoki muddati tugagan' : 'Неверный или просроченный SMS код')
    } finally { setIsLoading(false) }
  }

  const tabs: { key: RegTab; icon: string; label: string }[] = [
    { key: 'email', icon: '✉️', label: txt.emailTab },
    { key: 'phone', icon: '📱', label: txt.phoneTab },
    { key: 'google', icon: 'G', label: txt.googleTab },
  ]

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />
      </div>

      <div className="auth-card">
        <div className="auth-logo" onClick={() => navigate('/')}>
          <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="2" width="10" height="10" rx="3" fill="#1e90ff"/>
            <rect x="16" y="2" width="10" height="10" rx="3" fill="#00f5c4" opacity="0.8"/>
            <rect x="2" y="16" width="10" height="10" rx="3" fill="#00f5c4" opacity="0.8"/>
            <rect x="16" y="16" width="10" height="10" rx="3" fill="#1e90ff" opacity="0.5"/>
          </svg>
          <span>Mazaika</span>
        </div>

        <div className="auth-lang">
          <button className={lang === 'uz' ? 'active' : ''} onClick={() => setLang('uz')}>🇺🇿 UZ</button>
          <button className={lang === 'ru' ? 'active' : ''} onClick={() => setLang('ru')}>🇷🇺 RU</button>
        </div>

        <h1 className="auth-title">{txt.title}</h1>
        <p className="auth-sub">{txt.sub}</p>

        <div className="auth-tabs">
          {tabs.map(t => (
            <button key={t.key} className={`auth-tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => { setTab(t.key); setError(''); setInfo(''); setOtpSent(false) }}>
              {t.key === 'google'
                ? <svg width="20" height="20" viewBox="0 0 48 48" className="auth-tab-icon" style={{width:20,height:20}}>
                    <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/><path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/><path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/><path d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.021 35.738 44 30.29 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
                  </svg>
                : <span className="auth-tab-icon">{t.icon}</span>}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* EMAIL */}
        {tab === 'email' && (
          <form className="auth-form auth-form-animate" onSubmit={handleEmailRegister}>
            <div className="input-group">
              <label className="input-label">{txt.nameLabel}</label>
              <div className="input-with-icon">
                <span className="input-icon">👤</span>
                <input type="text" className="input input-padded" placeholder="Sardor Aliyev" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">{txt.emailLabel}</label>
              <div className="input-with-icon">
                <span className="input-icon">✉️</span>
                <input type="email" className="input input-padded" placeholder="example@gmail.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">{txt.passLabel}</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input type="password" className="input input-padded" placeholder="min 6 ta belgi" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>
            </div>
            <div className="register-agree">
              <input type="checkbox" id="agree-email" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
              <label htmlFor="agree-email"><Link to="#">{txt.terms}</Link> {txt.agree}</label>
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button type="submit" className="btn btn-aqua w-full btn-lg auth-submit" disabled={isLoading}>
              {isLoading ? <span className="btn-spinner">⟳</span> : `${txt.btn} →`}
            </button>
          </form>
        )}

        {/* PHONE */}
        {tab === 'phone' && (
          <div className="auth-form auth-form-animate">
            <div id="recaptcha-container-reg"></div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp}>
                <div className="input-group" style={{marginBottom:12}}>
                  <label className="input-label">{txt.nameLabel}</label>
                  <div className="input-with-icon">
                    <span className="input-icon">👤</span>
                    <input type="text" className="input input-padded" placeholder="Sardor Aliyev" value={namePhone} onChange={e => setNamePhone(e.target.value)} />
                  </div>
                </div>
                <div className="input-group" style={{marginBottom:16}}>
                  <label className="input-label">{txt.phoneLabel}</label>
                  <div className="input-with-icon">
                    <span className="input-icon">📱</span>
                    <input type="tel" className="input input-padded" placeholder={txt.phonePh} value={phone} onChange={e => setPhone(e.target.value)} required />
                  </div>
                  <p style={{fontSize:11,color:'var(--text-muted)',marginTop:6}}>
                    {lang === 'uz' ? 'Format: +998901234567' : 'Формат: +998901234567'}
                  </p>
                </div>
                {error && <div className="auth-error" style={{marginBottom:12}}>{error}</div>}
                <button type="submit" className="btn btn-aqua w-full btn-lg auth-submit" disabled={isLoading}>
                  {isLoading ? <span className="btn-spinner">⟳</span> : `📨 ${txt.sendOtp}`}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                {info && <div style={{background:'rgba(0,245,196,0.08)',border:'1px solid rgba(0,245,196,0.2)',borderRadius:8,padding:'10px 14px',color:'var(--accent-aqua)',fontSize:13,marginBottom:12}}>{info}</div>}
                <div className="input-group" style={{marginBottom:16}}>
                  <label className="input-label">{txt.otpLabel}</label>
                  <div className="input-with-icon">
                    <span className="input-icon">🔢</span>
                    <input type="text" className="input input-padded" placeholder="123456" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required autoFocus style={{letterSpacing:'0.3em',fontSize:'1.2em'}} />
                  </div>
                </div>
                {error && <div className="auth-error" style={{marginBottom:12}}>{error}</div>}
                <button type="submit" className="btn btn-aqua w-full btn-lg auth-submit" disabled={isLoading}>
                  {isLoading ? <span className="btn-spinner">⟳</span> : `✅ ${txt.verifyOtp}`}
                </button>
                <button type="button" className="btn btn-ghost w-full" style={{marginTop:8}} onClick={() => { setOtpSent(false); setOtp(''); setError(''); setInfo('') }}>
                  {lang === 'uz' ? '← Orqaga' : '← Назад'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* GOOGLE */}
        {tab === 'google' && (
          <div className="auth-form auth-form-animate">
            <div className="google-login-card">
              <div className="google-icon-big">
                <svg width="44" height="44" viewBox="0 0 48 48">
                  <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
                  <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
                  <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
                  <path d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.021 35.738 44 30.29 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
                </svg>
              </div>
              <p className="google-login-desc">
                {lang === 'uz' ? "Google bilan tezda ro'yxatdan o'ting. Parol kerak emas!" : 'Быстрая регистрация через Google. Пароль не нужен!'}
              </p>
              {error && <div className="auth-error">{error}</div>}
              <button type="button" className="btn-google" onClick={handleGoogleRegister} disabled={isLoading}>
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
                  <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
                  <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
                  <path d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.021 35.738 44 30.29 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
                </svg>
                {isLoading ? (lang === 'uz' ? 'Yuklanmoqda...' : 'Загрузка...') : txt.googleBtn}
              </button>
            </div>
          </div>
        )}

        <p className="auth-switch">
          {txt.hasAcc} <Link to="/login">{txt.login}</Link>
        </p>
      </div>
    </div>
  )
}
