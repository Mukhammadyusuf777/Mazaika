import { Sparkles, Bot, Code2, Brain, ArrowRight, CheckCircle2 } from 'lucide-react';

const FEATURES = [
  {
    icon: Sparkles,
    label: 'UI BUILDER',
    heading: 'Design Without Code',
    sub: 'Drag-and-drop interface builder powered by AI — create production-ready Telegram Mini Apps and landing pages in minutes.',
    color: '#00f0ff',
    checks: ['Visual block editor', 'Real-time 3D preview', 'One-click deploy'],
  },
  {
    icon: Code2,
    label: 'SMART CODE',
    heading: 'Patch-Based AI Edits',
    sub: 'Unlike other AI tools, Mazaika never rewrites your code. It uses surgical SEARCH/REPLACE patches — preserving your logic, styles and structure.',
    color: '#9d00ff',
    checks: ['Zero context drift', 'TypeScript strict mode', 'Git-compatible patches'],
  },
  {
    icon: Brain,
    label: 'GEMINI AI ENGINE',
    heading: 'Intelligence at the Core',
    sub: 'Every bot and site is powered by a multi-agent Gemini pipeline with Chain-of-Thought analysis, fallback strategy, and prompt injection protection.',
    color: '#00f0ff',
    checks: ['Multi-agent routing', 'Retry + fallback policy', 'Anti-injection filter'],
  },
];

export function OverlayContent() {
  return (
    <div className="overlay-root">
      {/* HERO */}
      <section className="hero-section">
        <div className="hero-badge">
          <Bot size={13} />
          <span>AI-Powered SaaS Platform</span>
        </div>
        <h1 className="hero-title">
          Build the Future<br />
          <span className="gradient-text">One Layer at a Time</span>
        </h1>
        <p className="hero-sub">
          Mazaika is the first platform where AI doesn't just generate — it understands<br />
          the full architecture of your project and improves it surgically.
        </p>
        <div className="hero-cta-row">
          <a href="/dashboard" className="btn-primary">
            Start Building <ArrowRight size={16} />
          </a>
          <a href="#features" className="btn-ghost">
            See how it works
          </a>
        </div>
        <p className="scroll-hint">↓ Scroll to explore layers</p>
      </section>

      {/* FEATURE SECTIONS */}
      {FEATURES.map((f, i) => {
        const Icon = f.icon;
        return (
          <section key={i} className={`feature-section feature-section--${i % 2 === 0 ? 'left' : 'right'}`} id={`feature-${i}`}>
            <div className="feature-content">
              <div className="feature-badge" style={{ color: f.color, borderColor: f.color + '44', background: f.color + '11' }}>
                <Icon size={14} />
                <span>{f.label}</span>
              </div>
              <h2 className="feature-heading">{f.heading}</h2>
              <p className="feature-sub">{f.sub}</p>
              <ul className="feature-checks">
                {f.checks.map((c) => (
                  <li key={c} style={{ color: f.color }}>
                    <CheckCircle2 size={15} />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}

      {/* CTA FINAL */}
      <section className="cta-section">
        <div className="cta-inner">
          <div className="cta-glow" />
          <Sparkles className="cta-icon" size={40} />
          <h2 className="cta-heading">
            Ready to build your<br />
            <span className="gradient-text">AI ecosystem?</span>
          </h2>
          <p className="cta-sub">
            Join thousands of teams already building smarter with Mazaika.
          </p>
          <a href="/dashboard" className="btn-primary btn-primary--large">
            Start Free Today <ArrowRight size={18} />
          </a>
        </div>
      </section>
    </div>
  );
}
