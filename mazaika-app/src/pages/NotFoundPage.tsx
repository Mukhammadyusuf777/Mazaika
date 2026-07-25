import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', textAlign: 'center', padding: '24px'
    }}>
      <AlertCircle size={64} style={{ color: 'var(--accent-red)', marginBottom: '24px' }} />
      <h1 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '16px', fontFamily: 'var(--font-display)' }}>404</h1>
      <h2 style={{ fontSize: '24px', marginBottom: '16px', color: 'var(--text-secondary)' }}>Sahifa topilmadi</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '400px' }}>
        Siz qidirayotgan sahifa o'chirilgan, nomi o'zgartirilgan yoki umuman mavjud bo'lmagan bo'lishi mumkin.
      </p>
      <button 
        className="btn btn-primary" 
        onClick={() => navigate('/')}
        style={{ padding: '12px 32px', fontSize: '16px' }}
      >
        Bosh sahifaga qaytish
      </button>
    </div>
  )
}
