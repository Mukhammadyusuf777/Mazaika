import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

// Particle canvas background
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let animId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string }[] = []
    const colors = ['#1e90ff', '#00f5c4', '#a855f7', '#1e90ff']

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.6 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(30,144,255,${0.08 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2, '0')
        ctx.fill()

        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
      })

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="particle-canvas" />
}

// Mini flow preview node
function MiniNode({ title, color, x, y, delay = 0 }: { title: string; color: string; x: number; y: number; delay?: number }) {
  const isStart = title.includes('Boshlash')
  const leftPct = (x / 720) * 100
  const widthPct = (130 / 720) * 100
  return (
    <div 
      className="mini-node" 
      style={{ 
        left: `${leftPct}%`, 
        width: `${widthPct}%`, 
        top: y, 
        animationDelay: `${delay}ms`, 
        '--node-color': color 
      } as React.CSSProperties}
    >
      <div className="mini-node-bar" style={{ background: color }} />
      <div className="mini-node-title">{title}</div>
      {!isStart && <div className="mini-node-port-left" />}
      <div className="mini-node-port" />
    </div>
  )
}

const FEATURES = [
  {
    icon: '🧩',
    title: 'Vizual konstruktor',
    titleRu: 'Визуальный конструктор',
    desc: "Bloklarni suring va ulang — kod bilmasdan professional bot yarating. Mazaika — bu botlarni qurishning eng qulay usuli.",
    color: '#1e90ff',
  },
  {
    icon: '⚡',
    title: 'Real-time ishlaydi',
    titleRu: 'Работает в реальном времени',
    desc: "Sxemani saqlashingiz bilan bot darhol yangi mantiq bo'yicha ishlaydi. Serverlarni qayta yuklashning hojati yo'q.",
    color: '#00f5c4',
  },
  {
    icon: '🇺🇿',
    title: "O'zbek biznes uchun",
    titleRu: 'Для узбекского бизнеса',
    desc: "Payme, Click, Uzum to'lov tizimlari bilan integratsiya. Interfeys o'zbek tilida — biznes tilida gaplashing.",
    color: '#ffb830',
  },
  {
    icon: '📊',
    title: 'Kuchli analitika',
    titleRu: 'Мощная аналитика',
    desc: "Har bir foydalanuvchining yo'lini ko'ring. Qaysi blokda to'xtab qolishini, qaysi tugmani bosishini bilib oling.",
    color: '#a855f7',
  },
  {
    icon: '📣',
    title: 'Ommaviy tarqatmalar',
    titleRu: 'Массовые рассылки',
    desc: "Butun baza bo'ylab bir marta tugmani bosib xabar yuboring. Segmentatsiya, rejalashtirish va statistika.",
    color: '#ff4d8d',
  },
  {
    icon: '🔗',
    title: 'Kuchli integratsiyalar',
    titleRu: 'Мощные интеграции',
    desc: "Google Jadval, HTTP so'rovlar, Webhook, JavaScript interpreter — botingizni istalgan tizim bilan ulang.",
    color: '#06b6d4',
  },
]

const BLOCK_TYPES = [
  { name: 'Boshlash', color: '#10d974', emoji: '▶' },
  { name: 'Xabar', color: '#1e90ff', emoji: '💬' },
  { name: 'Savol', color: '#a855f7', emoji: '❓' },
  { name: 'Shart', color: '#ffb830', emoji: '🔀' },
  { name: 'Kechikish', color: '#64748b', emoji: '⏱' },
  { name: "To'lov", color: '#10d974', emoji: '💳' },
  { name: 'HTTP', color: '#06b6d4', emoji: '🌐' },
  { name: 'Google Sheet', color: '#34a853', emoji: '📊' },
  { name: 'Webhook', color: '#f97316', emoji: '🔗' },
  { name: 'Tag', color: '#8b5cf6', emoji: '🏷' },
  { name: 'A/B Test', color: '#ec4899', emoji: '⚗' },
  { name: 'Zanjir', color: '#00f5c4', emoji: '📎' },
]

const PLANS = [
  {
    name: 'Boshlang\'ich',
    nameRu: 'Начальный',
    price: 'Bepul',
    priceRu: 'Бесплатно',
    bots: '1 bot',
    contacts: '500 ta',
    color: '#64748b',
    features: ["1 ta bot", "500 ta kontakt", "Asosiy bloklar", "Telegram integratsiya"],
  },
  {
    name: 'Biznes',
    nameRu: 'Бизнес',
    price: "99 000 so'm",
    priceRu: '≈ $9',
    bots: '10 bot',
    contacts: '10 000 ta',
    color: '#1e90ff',
    popular: true,
    features: ["10 ta bot", "10 000 ta kontakt", "Barcha bloklar", "To'lov tizimlari", "API integratsiya", "Analitika"],
  },
  {
    name: 'Pro',
    nameRu: 'Про',
    price: "299 000 so'm",
    priceRu: '≈ $27',
    bots: 'Cheksiz',
    contacts: 'Cheksiz',
    color: '#00f5c4',
    features: ["Cheksiz bot", "Cheksiz kontakt", "Ustuvor qo'llab-quvvatlash", "White-label", "Maxsus integratsiyalar"],
  },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing">
      <ParticleCanvas />

      {/* ===== NAVBAR ===== */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <div className="nav-logo-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="10" height="10" rx="3" fill="#1e90ff"/>
              <rect x="16" y="2" width="10" height="10" rx="3" fill="#00f5c4" opacity="0.8"/>
              <rect x="2" y="16" width="10" height="10" rx="3" fill="#00f5c4" opacity="0.8"/>
              <rect x="16" y="16" width="10" height="10" rx="3" fill="#1e90ff" opacity="0.5"/>
            </svg>
          </div>
          <span className="nav-logo-text">Mazaika</span>
        </div>
        <div className="nav-links">
          <a href="#features">Imkoniyatlar</a>
          <a href="#blocks">Bloklar</a>
          <a href="#pricing">Narxlar</a>
        </div>
        <div className="nav-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Kirish</button>
          <button className="btn btn-aqua btn-sm" onClick={() => navigate('/register')}>Boshlash →</button>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-badge">
          <span className="badge badge-aqua">🇺🇿 O'zbekiston uchun yaratilgan</span>
        </div>
        <h1 className="hero-title">
          Telegram botlarni<br />
          <span className="gradient-text">Mazaika</span> kabi quring
        </h1>
        <p className="hero-desc">
          Bloklarni tortib ulang — professional bot tayyor. Kod yozmasdan,<br />
          dasturchi yollasdan. O'zbek biznes uchun ishlangan platforma.
        </p>
        <div className="hero-cta">
          <button className="btn btn-aqua btn-lg" onClick={() => navigate('/register')}>
            Bepul boshlash →
          </button>
          <button className="btn btn-ghost btn-lg" onClick={() => navigate('/dashboard')}>
            Demoni ko'rish
          </button>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-num gradient-text">50+</span>
            <span className="hero-stat-label">Blok turlari</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-num gradient-text">3</span>
            <span className="hero-stat-label">Til (UZ / RU / EN)</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-num gradient-text">0</span>
            <span className="hero-stat-label">Kod shart emas</span>
          </div>
        </div>

        {/* Mini Canvas Preview */}
        <div className="hero-preview">
          <div className="hero-preview-topbar">
            <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
            <span className="topbar-label">mazaika.uz — bot.app — redaktor</span>
          </div>
          <div className="hero-preview-canvas">
            <div className="preview-grid" />
            <MiniNode title="▶ Boshlash" color="#10d974" x={40} y={60} delay={0} />
            <MiniNode title="💬 Xabar" color="#1e90ff" x={200} y={40} delay={200} />
            <MiniNode title="❓ Savol" color="#a855f7" x={200} y={130} delay={400} />
            <MiniNode title="🔀 Shart" color="#ffb830" x={380} y={85} delay={600} />
            <MiniNode title="💳 To'lov" color="#10d974" x={550} y={50} delay={800} />
            <MiniNode title="📊 Jadval" color="#34a853" x={550} y={140} delay={1000} />
            {/* SVG connections */}
            <svg className="preview-connections" viewBox="0 0 720 220" preserveAspectRatio="none">
              <defs>
                <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#1e90ff" opacity="0.6" />
                </marker>
              </defs>
              <path d="M 170 77 C 185 77 185 57 200 57" stroke="#1e90ff" strokeWidth="1.5" fill="none" opacity="0.5" strokeDasharray="4 3" />
              <path d="M 170 77 C 185 77 185 147 200 147" stroke="#a855f7" strokeWidth="1.5" fill="none" opacity="0.5" strokeDasharray="4 3" />
              <path d="M 330 57 C 355 57 355 102 380 102" stroke="#ffb830" strokeWidth="1.5" fill="none" opacity="0.5" strokeDasharray="4 3" />
              <path d="M 330 147 C 355 147 355 102 380 102" stroke="#ffb830" strokeWidth="1.5" fill="none" opacity="0.5" strokeDasharray="4 3" />
              <path d="M 510 102 C 530 102 530 67 550 67" stroke="#10d974" strokeWidth="1.5" fill="none" opacity="0.5" strokeDasharray="4 3" />
              <path d="M 510 102 C 530 102 530 157 550 157" stroke="#34a853" strokeWidth="1.5" fill="none" opacity="0.5" strokeDasharray="4 3" />
            </svg>
          </div>
        </div>
      </section>

      {/* ===== BLOCK TYPES MARQUEE ===== */}
      <section className="marquee-section">
        <div className="marquee-track">
          {[...BLOCK_TYPES, ...BLOCK_TYPES].map((b, i) => (
            <div key={i} className="marquee-chip" style={{ '--chip-color': b.color } as React.CSSProperties}>
              <span>{b.emoji}</span>
              <span>{b.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="features-section" id="features">
        <div className="section-header">
          <span className="badge badge-blue">✨ Imkoniyatlar</span>
          <h2>Boshqa platformalardan<br /><span className="gradient-text">farqi bor</span></h2>
          <p>Mazaika — faqat o'zbek bozori uchun o'ylangan, mahalliy to'lov tizimlari bilan birlashtirilgan</p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card" style={{ '--feature-color': f.color, animationDelay: `${i * 80}ms` } as React.CSSProperties}>
              <div className="feature-icon" style={{ background: `${f.color}18`, color: f.color }}>
                {f.icon}
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
              <div className="feature-glow" style={{ background: f.color }} />
            </div>
          ))}
        </div>
      </section>

      {/* ===== BLOCKS SHOWCASE ===== */}
      <section className="blocks-section" id="blocks">
        <div className="section-header">
          <span className="badge badge-violet">🧩 50+ blok</span>
          <h2>Har bir holat uchun<br /><span className="gradient-text">to'g'ri blok</span></h2>
          <p>Xabardan tortib to'lovgacha — hamma narsa tayyor bloklarda</p>
        </div>
        <div className="blocks-grid">
          {BLOCK_TYPES.map((b, i) => (
            <div key={i} className="block-card" style={{ '--bcolor': b.color } as React.CSSProperties}>
              <div className="block-emoji">{b.emoji}</div>
              <div className="block-name">{b.name}</div>
              <div className="block-glow" style={{ background: b.color }} />
            </div>
          ))}
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="pricing-section" id="pricing">
        <div className="section-header">
          <span className="badge badge-amber">💰 Narxlar</span>
          <h2>Sodda va <span className="gradient-text">shaffof</span> narxlar</h2>
          <p>Yashirin to'lovlar yo'q. Biznes o'sishi bilan tarif almashtirasiz.</p>
        </div>
        <div className="pricing-grid">
          {PLANS.map((plan, i) => (
            <div key={i} className={`pricing-card ${plan.popular ? 'popular' : ''}`} style={{ '--plan-color': plan.color } as React.CSSProperties}>
              {plan.popular && <div className="popular-badge">⭐ Eng mashhur</div>}
              <div className="plan-name">{plan.name}</div>
              <div className="plan-name-ru">{plan.nameRu}</div>
              <div className="plan-price">{plan.price}</div>
              <div className="plan-price-sub">{plan.priceRu} / oy</div>
              <ul className="plan-features">
                {plan.features.map((f, fi) => (
                  <li key={fi}><span className="check" style={{ color: plan.color }}>✓</span> {f}</li>
                ))}
              </ul>
              <button className="btn w-full" style={{ background: plan.color === '#64748b' ? 'var(--bg-glass-light)' : `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`, color: plan.color === '#00f5c4' ? '#07090f' : '#fff', marginTop: '24px' }}
                onClick={() => navigate('/register')}>
                {plan.price === 'Bepul' ? 'Bepul boshlash' : "Tanlash →"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-section">
        <div className="cta-glow" />
        <h2>Botingizni <span className="gradient-text">bugun</span> yarating</h2>
        <p>Ro'yxatdan o'tish 30 soniya davom etadi. Kredit karta shart emas.</p>
        <button className="btn btn-aqua btn-lg animate-pulse-glow" onClick={() => navigate('/register')}>
          Bepul boshlash — 0 so'm →
        </button>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer">
        <div className="footer-logo">
          <div className="nav-logo-icon">
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="10" height="10" rx="3" fill="#1e90ff"/>
              <rect x="16" y="2" width="10" height="10" rx="3" fill="#00f5c4" opacity="0.8"/>
              <rect x="2" y="16" width="10" height="10" rx="3" fill="#00f5c4" opacity="0.8"/>
              <rect x="16" y="16" width="10" height="10" rx="3" fill="#1e90ff" opacity="0.5"/>
            </svg>
          </div>
          <span>Mazaika</span>
        </div>
        <div className="footer-links">
          <a href="#">Shartlar</a>
          <a href="#">Maxfiylik</a>
          <a href="#">Telegram</a>
          <a href="#">Yordam</a>
        </div>
        <div className="footer-copy">© 2026 Mazaika. O'zbekiston uchun yaratilgan 🇺🇿</div>
      </footer>
    </div>
  )
}
