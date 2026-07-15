import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { apiClient } from '../../api/apiClient'
import './AuthPages.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [lang, setLang] = useState<'uz' | 'ru'>('uz')

  const t = {
    uz: {
      title: 'Xush kelibsiz!',
      sub: 'Mazaikaga kiring va botlaringizni boshqaring',
      identifier: 'Email yoki Telefon raqami',
      pass: 'Parol',
      btn: 'Kirish',
      noAcc: 'Hisob yo\'q mi?',
      register: 'Ro\'yxatdan o\'tish',
      forgot: 'Parolni unutdingizmi?',
      google: 'Google orqali kirish',
      placeholderId: 'example@gmail.com yoki +998901234567',
    },
    ru: {
      title: 'Добро пожаловать!',
      sub: 'Войдите в Mazaika и управляйте ботами',
      identifier: 'Email или Номер телефона',
      pass: 'Пароль',
      btn: 'Войти',
      noAcc: 'Нет аккаунта?',
      register: 'Зарегистрироваться',
      forgot: 'Забыли пароль?',
      google: 'Войти через Google',
      placeholderId: 'example@gmail.com или +998901234567',
    },
  }[lang]

  const { setUser } = useAuthStore()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Handle Google Login Success callback
  const handleGoogleLoginSuccess = async (response: any) => {
    setIsLoading(true)
    setError('')
    try {
      const res = await apiClient.post('/auth/google', { credential: response.credential })
      if (res.data.success) {
        setUser(res.data.user)
        navigate('/dashboard')
      } else {
        setError(res.data.message)
      }
    } catch (err: any) {
      setError(lang === 'uz' ? 'Google orqali kirishda xatolik yuz berdi' : 'Ошибка авторизации Google')
    } finally {
      setIsLoading(false)
    }
  }

  // Load Google Client
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).google) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: '920803513360-1gfs8sh7i1gfs8sh7i1gfs8sh7i1gfs8s.apps.googleusercontent.com', // Generic Client ID
          callback: handleGoogleLoginSuccess,
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          { theme: 'filled_blue', size: 'large', width: 340, shape: 'pill' }
        );
      } catch (e) {
        console.error('Google Auth Init Error:', e)
      }
    }
  }, [lang])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const res = await apiClient.post('/auth/login', { identifier, password })
      if (res.data.success) {
        setUser(res.data.user)
        navigate('/dashboard')
      } else {
        setError(res.data.message)
      }
    } catch (err) {
      setError(lang === 'uz' ? 'Tizimda xatolik yuz berdi' : 'Произошла системная ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  // Mock Google Login for local/testing environment if Google SDK is blocked or needs simulation
  const handleMockGoogleLogin = async () => {
    const testEmail = prompt(lang === 'uz' ? 'Google test hisobi uchun email kiriting:' : 'Введите email для теста Google:')
    if (!testEmail) return
    setIsLoading(true)
    try {
      // Simulate validation request to Google endpoint but using custom verification
      const res = await apiClient.post('/auth/register', {
        name: 'Google Test User',
        email: testEmail,
        password: 'google_oauth_bypass',
      })
      if (res.data.success) {
        setUser(res.data.user)
        navigate('/dashboard')
      } else {
        // Try login
        const loginRes = await apiClient.post('/auth/login', {
          identifier: testEmail,
          password: 'google_oauth_bypass'
        })
        if (loginRes.data.success) {
          setUser(loginRes.data.user)
          navigate('/dashboard')
        } else {
          setError(loginRes.data.message)
        }
      }
    } catch (e) {
      setError('Test login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
      </div>

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo" onClick={() => navigate('/')}>
          <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="2" width="10" height="10" rx="3" fill="#1e90ff"/>
            <rect x="16" y="2" width="10" height="10" rx="3" fill="#00f5c4" opacity="0.8"/>
            <rect x="2" y="16" width="10" height="10" rx="3" fill="#00f5c4" opacity="0.8"/>
            <rect x="16" y="16" width="10" height="10" rx="3" fill="#1e90ff" opacity="0.5"/>
          </svg>
          <span>Mazaika</span>
        </div>

        {/* Lang switcher */}
        <div className="auth-lang">
          <button className={lang === 'uz' ? 'active' : ''} onClick={() => setLang('uz')}>🇺🇿 UZ</button>
          <button className={lang === 'ru' ? 'active' : ''} onClick={() => setLang('ru')}>🇷🇺 RU</button>
        </div>

        <h1 className="auth-title">{t.title}</h1>
        <p className="auth-sub">{t.sub}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">{t.identifier}</label>
            <input
              type="text"
              className="input"
              placeholder={t.placeholderId}
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">{t.pass}</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <a href="#" className="auth-forgot">{t.forgot}</a>
          </div>

          {error && <div style={{ color: '#ff4d4f', fontSize: '14px', marginBottom: '15px' }}>{error}</div>}

          <button type="submit" className="btn btn-primary w-full btn-lg auth-submit" disabled={isLoading}>
            {isLoading ? (lang === 'uz' ? 'Iltimos kuting...' : 'Загрузка...') : t.btn + ' →'}
          </button>
        </form>

        {/* Social */}
        <div className="auth-divider"><span>{lang === 'uz' ? 'yoki' : 'или'}</span></div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%' }}>
          {/* Official Google sign-in container */}
          <div id="google-signin-btn" style={{ minHeight: '40px', width: '100%' }}></div>
          
          <button 
            type="button" 
            className="btn btn-ghost w-full" 
            style={{ gap: '10px' }}
            onClick={handleMockGoogleLogin}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2a10.3 10.3 0 0 0-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92a8.78 8.78 0 0 0 2.68-6.62z" fill="#4285F4"/>
              <path d="M9 18a8.6 8.6 0 0 0 5.96-2.18l-2.92-2.26a5.44 5.44 0 0 1-8.1-2.85H.92v2.34A9 9 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.94 10.71A5.41 5.41 0 0 1 3.66 9c0-.6.1-1.18.28-1.71V4.95H.92A9 9 0 0 0 0 9a9 9 0 0 0 .92 4.05l3.02-2.34z" fill="#FBBC05"/>
              <path d="M9 3.58a4.86 4.86 0 0 1 3.44 1.35l2.58-2.58A8.64 8.64 0 0 0 9 0 9 9 0 0 0 .92 4.95l3.02 2.34A5.36 5.36 0 0 1 9 3.58z" fill="#EA4335"/>
            </svg>
            {t.google} (Bypass/Test)
          </button>
        </div>

        <p className="auth-switch">
          {t.noAcc} <Link to="/register">{t.register}</Link>
        </p>
      </div>
    </div>
  )
}
