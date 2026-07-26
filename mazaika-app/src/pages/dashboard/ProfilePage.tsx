import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, CreditCard, Key, Shield, LogOut, ChevronLeft, Save, Check } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { auth } from '../../api/firebase'
import './ProfilePage.css'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [activeTab, setActiveTab] = useState<'info' | 'billing' | 'api'>('info')
  
  // Form states
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // Fake save
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = () => {
    auth.signOut()
    navigate('/')
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
          <ChevronLeft size={20} /> Orqaga
        </button>
        <h2>Mening Profilim</h2>
      </header>

      <div className="profile-content">
        <div className="profile-sidebar">
          <button 
            className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <User size={18} /> Shaxsiy ma'lumotlar
          </button>
          <button 
            className={`tab-btn ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => setActiveTab('billing')}
          >
            <CreditCard size={18} /> Tarif & To'lovlar
          </button>
          <button 
            className={`tab-btn ${activeTab === 'api' ? 'active' : ''}`}
            onClick={() => setActiveTab('api')}
          >
            <Key size={18} /> API Kalitlar
          </button>

          <div className="sidebar-divider"></div>

          <button className="tab-btn text-red-500" onClick={handleLogout}>
            <LogOut size={18} /> Tizimdan chiqish
          </button>
        </div>

        <div className="profile-main">
          {activeTab === 'info' && (
            <div className="profile-card">
              <h3>Shaxsiy ma'lumotlar</h3>
              <p className="subtitle">Profilingizni sozlang</p>

              <div className="form-group">
                <label>F.I.O</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="input" 
                />
              </div>

              <div className="form-group">
                <label>Elektron pochta</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  className="input" 
                  disabled
                />
                <small className="help-text">Email manzilini o'zgartirish uchun qo'llab-quvvatlash xizmatiga yozing.</small>
              </div>

              <div className="form-actions">
                <button className="btn btn-primary" onClick={handleSave}>
                  {saved ? <><Check size={18} /> Saqlandi</> : <><Save size={18} /> Saqlash</>}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="profile-card">
              <h3>Tarif & To'lovlar</h3>
              <p className="subtitle">Joriy tarifingiz va xarajatlaringiz</p>

              <div className="billing-banner bg-gradient-to-r from-indigo-500 to-purple-500">
                <div className="plan-info">
                  <span className="plan-name">Pro Tarif</span>
                  <span className="plan-price">149 000 so'm / oy</span>
                </div>
                <button className="btn btn-white btn-sm" onClick={() => navigate('/#pricing')}>Tarifni o'zgartirish</button>
              </div>

              <div className="usage-stats">
                <div className="stat-card">
                  <h4>Botlar</h4>
                  <div className="progress-bar"><div className="fill" style={{width: '60%'}}></div></div>
                  <span>3 / 5 bot</span>
                </div>
                <div className="stat-card">
                  <h4>Saytlar</h4>
                  <div className="progress-bar"><div className="fill" style={{width: '20%'}}></div></div>
                  <span>1 / 5 sayt</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="profile-card">
              <h3>API Kalitlar</h3>
              <p className="subtitle">Mazaika imkoniyatlarini o'z loyihangizga ulang</p>

              <div className="api-key-box">
                <div className="api-key-header">
                  <Shield size={16} className="text-emerald-500" />
                  <span>Maxfiy kalit (Secret Key)</span>
                </div>
                <div className="api-key-value">
                  <input type="password" value="sk_test_1234567890abcdef" readOnly className="input font-mono" />
                  <button className="btn btn-secondary btn-sm">Nusxa olish</button>
                </div>
                <small className="help-text">Ushbu kalitni hech kimga bermang.</small>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
