import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, CreditCard, Key, Shield, LogOut, ChevronLeft, Save, Check, Heart, Sparkles } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useChatStore } from '../../store/useChatStore'
import { auth } from '../../api/firebase'
import DonateModal from '../../components/modals/DonateModal'
import './ProfilePage.css'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [activeTab, setActiveTab] = useState<'info' | 'billing' | 'api'>('info')
  const [showDonateModal, setShowDonateModal] = useState(false)
  
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
    useChatStore.getState().clearAllChats()
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
          {/* Developer Donation Card in Sidebar */}
          <div className="profile-donate-card" onClick={() => setShowDonateModal(true)}>
            <div className="donate-icon-glow">
              <Heart size={18} fill="#FF4D6D" color="#FF4D6D" />
            </div>
            <div className="donate-meta">
              <span className="donate-title">Dasturchini qo'llash</span>
              <span className="donate-sub">Loyiha rivoji uchun do'nat</span>
            </div>
            <button type="button" className="btn-donate-sm">Do'nat</button>
          </div>

          <div className="sidebar-divider"></div>

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
          {/* Top Developer Donation Banner Directly Above Profile */}
          <div className="profile-top-donate-banner">
            <div className="top-donate-content">
              <div className="top-donate-icon">
                <Heart size={26} fill="#FF4D6D" color="#FF4D6D" className="heart-pulse" />
              </div>
              <div className="top-donate-text">
                <h4>Dasturchini qo'llab-quvvatlash ❤️</h4>
                <p>Mazaika platformasi barcha foydalanuvchilar uchun hozircha 100% BEPUL taqdim etilmoqda. Agar loyiha sizga ma'qul kelsa, server va rivojlantirish xarajatlariga o'z hissangizni qo'shishingiz mumkin.</p>
              </div>
            </div>
            <button className="btn-top-donate" onClick={() => setShowDonateModal(true)}>
              <Heart size={16} fill="white" />
              <span>Do'nat qilish</span>
            </button>
          </div>

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

              <div className="billing-banner beta-pro">
                <div className="plan-info">
                  <div className="plan-badge-beta">
                    <Sparkles size={14} />
                    <span>Beta Erta Foydalanish Aksiyasi</span>
                  </div>
                  <span className="plan-name">VIP Pro Tarif (Cheksiz)</span>
                  <div className="plan-price-row">
                    <span className="plan-price-free">0 so'm</span>
                    <span className="plan-price-old">149 000 so'm / oy</span>
                    <span className="plan-free-tag">100% Bepul</span>
                  </div>
                </div>
                <button className="btn-donate-action" onClick={() => setShowDonateModal(true)}>
                  <Heart size={16} fill="#FF4D6D" color="#FF4D6D" />
                  <span>Dasturchiga do'nat</span>
                </button>
              </div>

              <div className="usage-stats">
                <div className="stat-card">
                  <h4>Botlar</h4>
                  <div className="progress-bar"><div className="fill" style={{width: '100%'}}></div></div>
                  <span>Cheksiz (Beta Aksiyasi)</span>
                </div>
                <div className="stat-card">
                  <h4>Mini App & Saytlar</h4>
                  <div className="progress-bar"><div className="fill" style={{width: '100%'}}></div></div>
                  <span>Cheksiz (Beta Aksiyasi)</span>
                </div>
              </div>

              <div className="developer-support-box">
                <div className="dev-box-header">
                  <Heart size={18} fill="#FF4D6D" color="#FF4D6D" />
                  <h4>Loyiha Rivojiga Hissa Qo'shing</h4>
                </div>
                <p>
                  Mazaika jamoasi serverlar, Cloudflare CDN va DeepSeek-R1 AI modellarini uzluksiz ushlab turish uchun ishlamoqda. 
                  Karta orqali yoki to'g'ridan-to'g'ri o'tkazma bilan loyihani qo'llab-quvvatlashingiz mumkin.
                </p>
                <div className="dev-box-actions">
                  <button className="btn-dev-donate" onClick={() => setShowDonateModal(true)}>
                    <Heart size={16} fill="white" />
                    <span>Karta orqali do'nat qilish</span>
                  </button>
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

      {/* Developer Donation Modal */}
      <DonateModal 
        isOpen={showDonateModal} 
        onClose={() => setShowDonateModal(false)} 
      />
    </div>
  )
}
