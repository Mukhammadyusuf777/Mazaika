import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { apiClient } from '../../api/apiClient'
import './AuthPages.css'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [lang, setLang] = useState<'uz' | 'ru'>('uz')

  const { setUser } = useAuthStore()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const res = await apiClient.post('/auth/register', { name, email, password })
      if (res.data.success) {
        setUser(res.data.user)
        navigate('/dashboard')
      } else {
        setError(res.data.message)
      }
    } catch (err) {
      setError('Tizimda xatolik yuz berdi')
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

        <h1 className="auth-title">{lang === 'uz' ? "Ro'yxatdan o'tish" : 'Регистрация'}</h1>
        <p className="auth-sub">{lang === 'uz' ? 'Bepul hisob oching — 30 soniya' : 'Создайте бесплатный аккаунт — 30 секунд'}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">{lang === 'uz' ? 'To\'liq ism' : 'Полное имя'}</label>
            <input type="text" className="input" placeholder={lang === 'uz' ? 'Sardor Aliyev' : 'Sardor Aliyev'} value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input type="email" className="input" placeholder="example@gmail.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label className="input-label">{lang === 'uz' ? 'Parol' : 'Пароль'}</label>
            <input type="password" className="input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <div className="register-agree">
            <input type="checkbox" id="agree" required />
            <label htmlFor="agree">
              {lang === 'uz'
                ? <><Link to="#">Shartlar</Link> va <Link to="#">Maxfiylik siyosati</Link> bilan roziman</>
                : <>Согласен с <Link to="#">условиями</Link> и <Link to="#">политикой конфиденциальности</Link></>}
            </label>
          </div>

          {error && <div style={{ color: '#ff4d4f', fontSize: '14px', marginBottom: '15px' }}>{error}</div>}

          <button type="submit" className="btn btn-aqua w-full btn-lg auth-submit" disabled={isLoading}>
            {isLoading ? 'Iltimos kuting...' : (lang === 'uz' ? "Bepul boshlash →" : 'Начать бесплатно →')}
          </button>
        </form>

        <p className="auth-switch">
          {lang === 'uz' ? "Allaqachon hisob bormi?" : 'Уже есть аккаунт?'}{' '}
          <Link to="/login">{lang === 'uz' ? 'Kirish' : 'Войти'}</Link>
        </p>
      </div>
    </div>
  )
}
