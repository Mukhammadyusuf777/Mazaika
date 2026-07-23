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
import { auth, googleProvider } from '../../api/firebase'
import { useAuthStore } from '../../store/useAuthStore'
import { createOrUpdateUser } from '../../api/firestore'
import './AuthPages.css'

type AuthTab = 'email' | 'phone' | 'google'

declare global {
  interface Window { recaptchaVerifier: RecaptchaVerifier }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [tab, setTab] = useState<AuthTab>('email')
  const [lang, setLang] = useState<'uz' | 'ru'>('uz')

  // Email form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

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
      title: 'Xush kelibsiz!', sub: 'Botlaringizni boshqarish uchun kiring',
      emailTab: 'Email', phoneTab: 'Telefon', googleTab: 'Google',
      emailLabel: 'Email manzil', passLabel: 'Parol',
      phoneLabel: 'Telefon raqami', otpLabel: 'SMS kod',
      btn: 'Kirish', sendOtp: 'SMS kod yuborish', verifyOtp: 'Tasdiqlash',
      forgot: 'Parolni unutdingizmi?', noAcc: "Hisob yo'q mi?", reg: "Ro'yxatdan o'tish",
      googleBtn: 'Google orqali kirish', phonePh: '+998 90 123 45 67', otpPh: '123456',
      otpSentMsg: 'SMS kod yuborildi! Iltimos kuting...',
    },
    ru: {
      title: 'Добро пожаловать!', sub: 'Войдите для управления ботами',
      emailTab: 'Email', phoneTab: 'Телефон', googleTab: 'Google',
      emailLabel: 'Адрес Email', passLabel: 'Пароль',
      phoneLabel: 'Номер телефона', otpLabel: 'SMS код',
      btn: 'Войти', sendOtp: 'Отправить SMS код', verifyOtp: 'Подтвердить',
      forgot: 'Забыли пароль?', noAcc: 'Нет аккаунта?', reg: 'Зарегистрироваться',
      googleBtn: 'Войти через Google', phonePh: '+998 90 123 45 67', otpPh: '123456',
      otpSentMsg: 'SMS код отправлен! Пожалуйста подождите...',
    },
  }[lang]

  const saveUser = async (firebaseUser: any) => {
    const name = firebaseUser.displayName || firebaseUser.email || firebaseUser.phoneNumber || 'User'
    // Save to Firestore (creates doc if not exists)
    await createOrUpdateUser(firebaseUser.uid, {
      name,
      email: firebaseUser.email || null,
      phone: firebaseUser.phoneNumber || null,
    })
    setUser({ id: firebaseUser.uid, name, email: firebaseUser.email, phone: firebaseUser.phoneNumber })
    navigate('/dashboard')
  }

  // GOOGLE LOGIN
  const handleGoogleLogin = async () => {
    setIsLoading(true); setError('')
    try {
      const result = await signInWithPopup(auth, googleProvider)
      saveUser(result.user)
    } catch (e: any) {
      setError(e.message)
    } finally { setIsLoading(false) }
  }

  // EMAIL LOGIN
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true); setError('')
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      saveUser(result.user)
    } catch (firebaseError: any) {
      setError(firebaseError.message)
    } finally {
      setIsLoading(false)
    }
  }


  // PHONE - Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true); setError(''); setInfo('')
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null as any;
      }
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' })
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier)
      setConfirmation(result)
      setOtpSent(true)
      setInfo(txt.otpSentMsg)
    } catch (e: any) {
      setError(e.message)
    } finally { setIsLoading(false) }
  }

  // PHONE - Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirmation) return
    setIsLoading(true); setError('')
    try {
      const result = await confirmation.confirm(otp)
      saveUser(result.user)
    } catch (e: any) {
      setError(lang === 'uz' ? 'SMS kod xato yoki muddati tugagan' : 'Неверный или просроченный SMS код')
    } finally { setIsLoading(false) }
  }

  const tabs: { key: AuthTab; icon: string; label: string }[] = [
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
          <form className="auth-form auth-form-animate" onSubmit={handleEmailLogin}>
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
                <input type="password" className="input input-padded" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <a href="#" className="auth-forgot" onClick={async (e) => {
                e.preventDefault();
                const resetEmail = prompt("Email manzilini kiriting / Введите email:", email);
                if (resetEmail) {
                  try {
                    await sendPasswordResetEmail(auth, resetEmail);
                    alert("Parolni tiklash havolasi emailga yuborildi!");
                  } catch (err: any) {
                    alert("Xatolik: " + err.message);
                  }
                }
              }}>{txt.forgot}</a>
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button type="submit" className="btn btn-primary w-full btn-lg auth-submit" disabled={isLoading}>
              {isLoading ? <span className="btn-spinner">⟳</span> : `${txt.btn} →`}
            </button>
          </form>
        )}

        {/* PHONE */}
        {tab === 'phone' && (
          <div className="auth-form auth-form-animate">
            <div id="recaptcha-container"></div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp}>
                <div className="input-group" style={{marginBottom:'16px'}}>
                  <label className="input-label">{txt.phoneLabel}</label>
                  <div className="input-with-icon">
                    <span className="input-icon">📱</span>
                    <input type="tel" className="input input-padded" placeholder={txt.phonePh} value={phone} onChange={e => setPhone(e.target.value)} required />
                  </div>
                  <p style={{fontSize:11,color:'var(--text-muted)',marginTop:6}}>
                    {lang === 'uz' ? 'Raqamni xalqaro formatda kiriting: +998901234567' : 'Введите номер в международном формате: +998901234567'}
                  </p>
                </div>
                {error && <div className="auth-error" style={{marginBottom:12}}>{error}</div>}
                <button type="submit" className="btn btn-primary w-full btn-lg auth-submit" disabled={isLoading}>
                  {isLoading ? <span className="btn-spinner">⟳</span> : `📨 ${txt.sendOtp}`}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                {info && <div style={{background:'rgba(0,245,196,0.08)',border:'1px solid rgba(0,245,196,0.2)',borderRadius:8,padding:'10px 14px',color:'var(--accent-aqua)',fontSize:13,marginBottom:12}}>{info}</div>}
                <div className="input-group" style={{marginBottom:'16px'}}>
                  <label className="input-label">{txt.otpLabel}</label>
                  <div className="input-with-icon">
                    <span className="input-icon">🔢</span>
                    <input type="text" className="input input-padded" placeholder={txt.otpPh} value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required autoFocus />
                  </div>
                </div>
                {error && <div className="auth-error" style={{marginBottom:12}}>{error}</div>}
                <button type="submit" className="btn btn-primary w-full btn-lg auth-submit" disabled={isLoading}>
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
                {lang === 'uz' ? 'Google hisobingiz bilan bir marta bosish orqali kiring' : 'Войдите в один клик через ваш Google аккаунт'}
              </p>
              {error && <div className="auth-error">{error}</div>}
              <button type="button" className="btn-google" onClick={handleGoogleLogin} disabled={isLoading}>
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
          {txt.noAcc} <Link to="/register">{txt.reg}</Link>
        </p>
      </div>
    </div>
  )
}
