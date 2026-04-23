import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Counter({ to, suffix = '', duration = 1800 }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const prog = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - prog, 3)
      setVal(Math.floor(ease * to))
      if (prog < 1) requestAnimationFrame(step)
      else setVal(to)
    }
    const raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [to, duration])
  return <>{val.toLocaleString()}{suffix}</>
}

/* ── Feature card ──────────────────────────────────────────────────────────── */
function FeatureCard({ icon, title, desc, delay }) {
  return (
    <div
      className="feature-card"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{desc}</p>
    </div>
  )
}

/* ── Stage pill ─────────────────────────────────────────────────────────────── */
function StagePill({ emoji, label, active }) {
  return (
    <div className={`stage-pill ${active ? 'stage-pill-active' : ''}`}>
      <span>{emoji}</span>
      <span>{label}</span>
    </div>
  )
}

/* ── Role card ──────────────────────────────────────────────────────────────── */
function RoleCard({ icon, role, email, password, desc, onFill }) {
  return (
    <div className="role-card" onClick={onFill}>
      <div className="role-icon">{icon}</div>
      <div className="role-body">
        <p className="role-name">{role}</p>
        <p className="role-email">{email}</p>
        <p className="role-desc">{desc}</p>
      </div>
      <div className="role-arrow">→</div>
    </div>
  )
}

/* ── Main ───────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate()
  const [activePill, setActivePill] = useState(0)

  /* cycle through stage pills */
  useEffect(() => {
    const t = setInterval(() => setActivePill(p => (p + 1) % 7), 900)
    return () => clearInterval(t)
  }, [])

  const goToLogin = (email) => {
    navigate('/login', { state: { prefill: email } })
  }

  const stages = [
    { emoji: '🌱', label: 'Planted' },
    { emoji: '🌿', label: 'Germinated' },
    { emoji: '🌾', label: 'Growing' },
    { emoji: '🌸', label: 'Flowering' },
    { emoji: '🍃', label: 'Maturing' },
    { emoji: '✅', label: 'Ready' },
    { emoji: '🏆', label: 'Harvested' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --soil-800: #522c12;
          --soil-700: #6e3c18;
          --soil-600: #8a4e1e;
          --soil-400: #c08040;
          --soil-300: #d4a574;
          --soil-200: #e8ccaa;
          --soil-100: #f5e9d8;
          --soil-50:  #fdf8f3;
          --crop-600: #16a34a;
          --crop-500: #22c55e;
          --crop-100: #dcfce7;
          --harvest-600: #d97706;
          --harvest-500: #f59e0b;
          --harvest-100: #fef3c7;
          --red-600: #dc2626;
          --stone-800: #292524;
          --stone-600: #57534e;
          --stone-400: #a8a29e;
          --stone-200: #e7e5e4;
          --stone-100: #f5f5f4;
          --white: #ffffff;
        }

        body { font-family: 'DM Sans', system-ui, sans-serif; background: var(--soil-50); color: var(--stone-800); -webkit-font-smoothing: antialiased; }

        /* ── NAV ─────────────────────────────────────────────── */
        .nav {
          position: sticky; top: 0; z-index: 50;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 clamp(1.5rem, 5vw, 4rem); height: 64px;
          background: rgba(253,248,243,0.92); backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--soil-200);
        }
        .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .nav-logo-icon {
          width: 36px; height: 36px; background: var(--crop-500); border-radius: 10px;
          display: flex; align-items: center; justify-content: center; font-size: 18px;
          box-shadow: 0 2px 8px rgba(34,197,94,0.3);
        }
        .nav-logo-text { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 1.2rem; color: var(--soil-800); }
        .nav-logo-sub  { font-size: 0.65rem; color: var(--soil-400); letter-spacing: 0.06em; margin-top: -2px; }
        .nav-cta {
          display: flex; align-items: center; gap: 10px;
        }
        .btn-outline {
          padding: 8px 18px; border-radius: 8px; border: 1.5px solid var(--soil-300);
          background: transparent; color: var(--soil-700); font-family: 'DM Sans', sans-serif;
          font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: all 0.15s;
        }
        .btn-outline:hover { background: var(--soil-100); border-color: var(--soil-400); }
        .btn-solid {
          padding: 8px 18px; border-radius: 8px; border: none;
          background: var(--soil-700); color: white; font-family: 'DM Sans', sans-serif;
          font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: all 0.15s;
        }
        .btn-solid:hover { background: var(--soil-800); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(82,44,18,0.25); }

        /* ── HERO ─────────────────────────────────────────────── */
        .hero {
          min-height: calc(100vh - 64px);
          display: grid; grid-template-columns: 1fr 1fr;
          align-items: center; gap: 0;
          padding: 0 clamp(1.5rem, 5vw, 4rem);
          max-width: 1280px; margin: 0 auto;
        }
        @media (max-width: 768px) {
          .hero { grid-template-columns: 1fr; padding-top: 3rem; padding-bottom: 3rem; min-height: auto; }
          .hero-visual { display: none; }
        }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--crop-100); color: var(--crop-600);
          padding: 5px 14px; border-radius: 100px; font-size: 0.78rem; font-weight: 600;
          margin-bottom: 1.5rem; border: 1px solid rgba(34,197,94,0.2);
          animation: fadeUp 0.6s ease both;
        }
        .hero-eyebrow-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--crop-500); animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .hero-h1 {
          font-family: 'Playfair Display', serif; font-size: clamp(2.6rem, 5vw, 4rem);
          font-weight: 900; color: var(--soil-800); line-height: 1.1;
          margin-bottom: 1.25rem;
          animation: fadeUp 0.6s 0.1s ease both;
        }
        .hero-h1 em { font-style: normal; color: var(--crop-600); }
        .hero-sub {
          font-size: 1.05rem; color: var(--stone-600); line-height: 1.65;
          max-width: 480px; margin-bottom: 2.25rem;
          animation: fadeUp 0.6s 0.2s ease both;
        }
        .hero-actions {
          display: flex; gap: 12px; flex-wrap: wrap;
          animation: fadeUp 0.6s 0.3s ease both;
        }
        .btn-hero-primary {
          padding: 13px 28px; border-radius: 10px; border: none;
          background: var(--soil-700); color: white;
          font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.95rem;
          cursor: pointer; transition: all 0.18s;
          display: flex; align-items: center; gap: 8px;
        }
        .btn-hero-primary:hover { background: var(--soil-800); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(82,44,18,0.28); }
        .btn-hero-secondary {
          padding: 13px 24px; border-radius: 10px; border: 1.5px solid var(--soil-300);
          background: white; color: var(--soil-700);
          font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.95rem;
          cursor: pointer; transition: all 0.18s;
        }
        .btn-hero-secondary:hover { border-color: var(--soil-500); background: var(--soil-50); }
        .hero-stats {
          display: flex; gap: 2.5rem; margin-top: 3rem; padding-top: 2rem;
          border-top: 1px solid var(--soil-200);
          animation: fadeUp 0.6s 0.4s ease both;
        }
        .stat-item {}
        .stat-num { font-family: 'Playfair Display', serif; font-size: 1.9rem; font-weight: 700; color: var(--soil-800); line-height: 1; }
        .stat-label { font-size: 0.78rem; color: var(--stone-400); margin-top: 4px; font-weight: 500; }

        /* ── HERO VISUAL ─────────────────────────────────────── */
        .hero-visual {
          display: flex; justify-content: center; align-items: center;
          padding: 3rem 0 3rem 2rem;
          animation: fadeUp 0.7s 0.2s ease both;
        }
        .dashboard-mockup {
          width: 100%; max-width: 500px;
          background: white; border-radius: 20px;
          box-shadow: 0 32px 80px rgba(82,44,18,0.18), 0 4px 16px rgba(82,44,18,0.08);
          overflow: hidden; border: 1px solid var(--soil-200);
        }
        .mockup-topbar {
          background: var(--soil-800); padding: 14px 18px;
          display: flex; align-items: center; gap: 10px;
        }
        .mockup-dots { display: flex; gap: 5px; }
        .mockup-dot { width: 10px; height: 10px; border-radius: 50%; }
        .mockup-title { color: rgba(255,255,255,0.7); font-size: 0.78rem; font-weight: 500; margin-left: 6px; }
        .mockup-body { padding: 18px; }
        .mockup-kpis { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin-bottom: 14px; }
        .kpi-card {
          background: var(--soil-50); border-radius: 10px; padding: 10px 8px;
          text-align: center; border: 1px solid var(--soil-200);
        }
        .kpi-num { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700; color: var(--soil-800); line-height: 1; }
        .kpi-label { font-size: 0.6rem; color: var(--stone-400); margin-top: 3px; font-weight: 500; }
        .mockup-row { display: flex; gap: 10px; margin-bottom: 14px; }
        .mockup-panel {
          flex: 1; background: var(--stone-100); border-radius: 10px; height: 80px;
          border: 1px solid var(--stone-200); padding: 10px;
          display: flex; flex-direction: column; justify-content: space-between;
        }
        .panel-label { font-size: 0.6rem; font-weight: 600; color: var(--stone-600); }
        .panel-bars { display: flex; align-items: flex-end; gap: 4px; height: 42px; }
        .panel-bar { flex: 1; border-radius: 3px 3px 0 0; }
        .mockup-alerts { display: flex; flex-direction: column; gap: 6px; }
        .alert-row {
          display: flex; align-items: center; gap: 8px;
          padding: 7px 10px; border-radius: 8px; font-size: 0.7rem;
        }
        .alert-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .alert-name { font-weight: 600; color: var(--stone-800); flex: 1; }
        .alert-badge { padding: 2px 7px; border-radius: 100px; font-size: 0.6rem; font-weight: 600; }

        /* ── STAGES STRIP ─────────────────────────────────────── */
        .stages-strip {
          background: var(--soil-800); padding: 2.5rem clamp(1.5rem, 5vw, 4rem);
        }
        .stages-inner { max-width: 1280px; margin: 0 auto; }
        .stages-label { font-size: 0.75rem; color: var(--soil-400); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; margin-bottom: 1.25rem; }
        .stages-pills { display: flex; gap: 10px; flex-wrap: wrap; }
        .stage-pill {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 16px; border-radius: 100px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5); font-size: 0.82rem; font-weight: 500;
          transition: all 0.4s ease;
        }
        .stage-pill-active {
          background: rgba(34,197,94,0.18); border-color: rgba(34,197,94,0.4);
          color: white; transform: scale(1.05);
        }
        .stages-connector { color: var(--soil-600); font-size: 0.7rem; display: flex; align-items: center; }

        /* ── FEATURES ─────────────────────────────────────────── */
        .features-section {
          padding: clamp(4rem, 8vw, 7rem) clamp(1.5rem, 5vw, 4rem);
          max-width: 1280px; margin: 0 auto;
        }
        .section-eyebrow { font-size: 0.78rem; font-weight: 600; color: var(--crop-600); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.75rem; }
        .section-h2 { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 3.5vw, 2.75rem); font-weight: 700; color: var(--soil-800); margin-bottom: 1rem; }
        .section-sub { font-size: 1rem; color: var(--stone-600); max-width: 520px; line-height: 1.65; margin-bottom: 3.5rem; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; }
        .feature-card {
          background: white; border-radius: 16px; padding: 1.75rem;
          border: 1px solid var(--soil-200); transition: all 0.2s;
          animation: fadeUp 0.5s ease both;
        }
        .feature-card:hover { box-shadow: 0 12px 32px rgba(82,44,18,0.12); transform: translateY(-3px); border-color: var(--soil-300); }
        .feature-icon { font-size: 1.9rem; margin-bottom: 1rem; }
        .feature-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; color: var(--soil-800); margin-bottom: 0.5rem; }
        .feature-desc { font-size: 0.875rem; color: var(--stone-600); line-height: 1.65; }

        /* ── STATUS SECTION ───────────────────────────────────── */
        .status-section {
          background: var(--soil-50); border-top: 1px solid var(--soil-200); border-bottom: 1px solid var(--soil-200);
          padding: clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 4rem);
        }
        .status-inner { max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
        @media (max-width: 768px) { .status-inner { grid-template-columns: 1fr; gap: 2.5rem; } }
        .status-cards { display: flex; flex-direction: column; gap: 10px; }
        .status-row {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 1rem 1.25rem; border-radius: 12px; border: 1px solid;
          transition: transform 0.2s;
        }
        .status-row:hover { transform: translateX(4px); }
        .status-row.active    { background: #f0fdf0; border-color: #bbf7d0; }
        .status-row.at_risk   { background: #fffbeb; border-color: #fde68a; }
        .status-row.critical  { background: #fef2f2; border-color: #fecaca; }
        .status-row.completed { background: var(--stone-100); border-color: var(--stone-200); }
        .status-row.abandoned { background: #fafaf9; border-color: #e7e5e4; }
        .status-emoji { font-size: 1.4rem; flex-shrink: 0; margin-top: 1px; }
        .status-body {}
        .status-name { font-weight: 600; font-size: 0.9rem; color: var(--stone-800); margin-bottom: 3px; }
        .status-desc { font-size: 0.8rem; color: var(--stone-600); line-height: 1.5; }

        /* ── DEMO SECTION ─────────────────────────────────────── */
        .demo-section {
          padding: clamp(4rem, 8vw, 7rem) clamp(1.5rem, 5vw, 4rem);
          max-width: 1280px; margin: 0 auto;
        }
        .roles-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; margin-top: 2.5rem; }
        .role-card {
          display: flex; align-items: center; gap: 14px;
          padding: 1.1rem 1.25rem; border-radius: 14px;
          background: white; border: 1.5px solid var(--soil-200);
          cursor: pointer; transition: all 0.18s; text-align: left;
        }
        .role-card:hover { border-color: var(--soil-400); box-shadow: 0 6px 20px rgba(82,44,18,0.1); transform: translateY(-2px); }
        .role-icon { font-size: 1.6rem; flex-shrink: 0; }
        .role-body { flex: 1; }
        .role-name  { font-weight: 700; font-size: 0.9rem; color: var(--soil-800); }
        .role-email { font-family: monospace; font-size: 0.75rem; color: var(--stone-400); margin-top: 1px; }
        .role-desc  { font-size: 0.78rem; color: var(--stone-600); margin-top: 4px; line-height: 1.45; }
        .role-arrow { color: var(--soil-400); font-size: 1rem; flex-shrink: 0; transition: transform 0.15s; }
        .role-card:hover .role-arrow { transform: translateX(3px); color: var(--soil-700); }

        /* ── API REFERENCE STRIP ──────────────────────────────── */
        .api-strip {
          background: var(--stone-800); padding: 2rem clamp(1.5rem, 5vw, 4rem);
        }
        .api-inner { max-width: 1280px; margin: 0 auto; }
        .api-label { font-size: 0.7rem; font-weight: 600; color: var(--stone-400); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1rem; }
        .api-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .api-chip {
          display: flex; align-items: center; gap: 7px;
          padding: 5px 12px; border-radius: 7px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05); font-size: 0.72rem; font-family: monospace;
          color: rgba(255,255,255,0.65);
        }
        .method { font-weight: 700; font-size: 0.65rem; padding: 1px 5px; border-radius: 4px; }
        .method-get    { background: rgba(34,197,94,0.2);  color: #4ade80; }
        .method-post   { background: rgba(251,191,36,0.2); color: #fbbf24; }
        .method-put    { background: rgba(96,165,250,0.2); color: #93c5fd; }
        .method-delete { background: rgba(248,113,113,0.2);color: #f87171; }

        /* ── FOOTER ───────────────────────────────────────────── */
        .footer {
          background: var(--soil-800); padding: 2rem clamp(1.5rem, 5vw, 4rem);
          display: flex; align-items: center; justify-content: space-between; flex-wrap: gap;
          gap: 1rem;
        }
        .footer-logo { display: flex; align-items: center; gap: 8px; }
        .footer-name { font-family: 'Playfair Display', serif; font-weight: 700; color: white; font-size: 1rem; }
        .footer-copy { font-size: 0.78rem; color: var(--soil-400); }
        .footer-stack { display: flex; gap: 8px; flex-wrap: wrap; }
        .stack-badge {
          font-size: 0.68rem; padding: 3px 9px; border-radius: 5px;
          background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.1); font-weight: 500;
        }

        @keyframes fadeUp { from { opacity:0; transform: translateY(18px); } to { opacity:1; transform: translateY(0); } }
      `}</style>

      <nav className="nav">
        <a className="nav-logo" href="/">
          <div className="nav-logo-icon">🌿</div>
          <div>
            <div className="nav-logo-text">SmartSeason</div>
            <div className="nav-logo-sub">Field Monitoring System</div>
          </div>
        </a>
        <div className="nav-cta">
          <button className="btn-outline" onClick={() => navigate('/login')}>Sign in</button>
          <button className="btn-solid"  onClick={() => navigate('/login')}>Get Started →</button>
        </div>
      </nav>

      <section style={{ background: 'linear-gradient(135deg, #fdf8f3 0%, #f5e9d8 100%)' }}>
        <div className="hero">
          {/* Left copy */}
          <div>
            <h1 className="hero-h1">
              Track every field,<br />
              <em>every season.</em>
            </h1>
            <p className="hero-sub">
              SmartSeason gives your team real-time crop monitoring, automatic risk detection, and complete field history — all in one place.
            </p>
            <div className="hero-actions">
              <button className="btn-hero-primary" onClick={() => navigate('/login')}>
                <span>Open Dashboard</span>
                <span>→</span>
              </button>
              <button className="btn-hero-secondary" onClick={() => document.getElementById('demo-section').scrollIntoView({ behavior: 'smooth' })}>
                View Demo Accounts
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-num"><Counter to={12} /></div>
                <div className="stat-label">Fields</div>
              </div>
              <div className="stat-item">
                <div className="stat-num"><Counter to={5} /></div>
                <div className="stat-label">Status levels</div>
              </div>
              <div className="stat-item">
                <div className="stat-num"><Counter to={7} /></div>
                <div className="stat-label">Crop stages</div>
              </div>
            </div>
          </div>

          {/* Right visual */}
          <div className="hero-visual">
            <div className="dashboard-mockup">
              <div className="mockup-topbar">
                <div className="mockup-dots">
                  <div className="mockup-dot" style={{ background: '#ff5f56' }} />
                  <div className="mockup-dot" style={{ background: '#ffbd2e' }} />
                  <div className="mockup-dot" style={{ background: '#27c93f' }} />
                </div>
                <span className="mockup-title">SmartSeason — Admin Dashboard</span>
              </div>
              <div className="mockup-body">
                <div className="mockup-kpis">
                  {[
                    { n: 12, l: 'Total Fields' },
                    { n: 4,  l: 'Active' },
                    { n: 3,  l: 'At Risk' },
                    { n: 2,  l: 'Critical' },
                  ].map(k => (
                    <div className="kpi-card" key={k.l}>
                      <div className="kpi-num">{k.n}</div>
                      <div className="kpi-label">{k.l}</div>
                    </div>
                  ))}
                </div>
                <div className="mockup-row">
                  <div className="mockup-panel">
                    <div className="panel-label">Stage Breakdown</div>
                    <div className="panel-bars">
                      {[55, 35, 70, 45, 60, 40, 25].map((h, i) => (
                        <div key={i} className="panel-bar" style={{
                          height: `${h}%`,
                          background: ['#f59e0b','#84cc16','#22c55e','#ec4899','#f97316','#3b82f6','#78716c'][i]
                        }} />
                      ))}
                    </div>
                  </div>
                  <div className="mockup-panel">
                    <div className="panel-label">Status Overview</div>
                    <div className="panel-bars" style={{ alignItems: 'center', gap: '6px', height: '42px' }}>
                      {[
                        { h: 60, c: '#16a34a', l: 'Active' },
                        { h: 40, c: '#f59e0b', l: 'Risk' },
                        { h: 25, c: '#ef4444', l: 'Crit' },
                        { h: 15, c: '#78716c', l: 'Done' },
                      ].map((b, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, height: '100%', justifyContent: 'flex-end' }}>
                          <div style={{ width: '100%', height: `${b.h}%`, background: b.c, borderRadius: '3px 3px 0 0' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mockup-alerts">
                  {[
                    { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', name: 'Rift Valley — Block C', badge: 'Critical', badgeBg: '#fef2f2', badgeC: '#dc2626' },
                    { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', name: 'Nyanza — Section 2',   badge: 'At Risk',  badgeBg: '#fef9c3', badgeC: '#b45309' },
                    { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', name: 'Coast Region — Farm A',badge: 'At Risk',  badgeBg: '#fef9c3', badgeC: '#b45309' },
                  ].map((a, i) => (
                    <div key={i} className="alert-row" style={{ background: a.bg, border: `1px solid ${a.border}` }}>
                      <div className="alert-dot" style={{ background: a.color }} />
                      <span className="alert-name">{a.name}</span>
                      <span className="alert-badge" style={{ background: a.badgeBg, color: a.badgeC }}>{a.badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STAGES STRIP ─────────────────────────────────────────────────────── */}
      <div className="stages-strip">
        <div className="stages-inner">
          <div className="stages-label">7-Stage Crop Lifecycle Tracking</div>
          <div className="stages-pills">
            {stages.map((s, i) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <StagePill emoji={s.emoji} label={s.label} active={activePill === i} />
                {i < stages.length - 1 && (
                  <div className="stages-connector">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/*FEATURES*/}
      <section className="features-section">
        <div className="section-eyebrow">What SmartSeason does</div>
        <h2 className="section-h2">Everything your team needs to manage the season</h2>
        <p className="section-sub">From the moment seeds go in the ground to the final harvest — SmartSeason keeps every field monitored, every risk flagged, and every agent accountable.</p>
        <div className="features-grid">
          <FeatureCard delay={0}   title="Role-Based Dashboards"       desc="Admins see every field, all agents, KPI cards, charts, and alert summaries. Field agents see only their assigned crops with action-focused views." />
          <FeatureCard delay={80}  title="Automatic Risk Detection"    desc="Status is computed live at runtime — no cron jobs. Fields are flagged Critical or At Risk based on stage duration, agent assignment, harvest proximity, and update frequency." />
          <FeatureCard delay={160} title="Full Field Management"       desc="Admins can create, edit, abandon, and restore fields. Assign agents, set harvest dates, record location and area, and track every change." />
          <FeatureCard delay={240} title="Field Update Timeline"       desc="Agents submit stage updates with a health score (1–10) and notes. Every field has a complete, paginated history of all submissions." />
          <FeatureCard delay={320} title="User Management"             desc="Create and manage admin and field-agent accounts. Deleting an agent unassigns their fields cleanly. Edit roles and passwords any time." />
          <FeatureCard delay={560} title="Fields Database"       desc="The database stores the fields details spanning every status scenario that is; Active, At Risk, Critical, Completed, and Abandoned ready to explore." />
        </div>
      </section>

      {/*STATUS SECTION */}
      <div className="status-section">
        <div className="status-inner">
          <div>
            <div className="section-eyebrow">Smart Status Engine</div>
            <h2 className="section-h2">Five statuses, always accurate</h2>
            <p className="section-sub" style={{ marginBottom: 0 }}>
              Field status is computed fresh on every API request from live data — no stale flags, no manual updates. The system evaluates harvest dates, stage durations, agent assignment, and update recency to classify each field automatically.
            </p>
          </div>
          <div className="status-cards">
            {[
              { key: 'active',    emoji: '✅', name: 'Active',    desc: 'Progressing normally within all expected timelines. No action required.' },
              { key: 'at_risk',   emoji: '⚠️', name: 'At Risk',   desc: 'Early warning — harvest approaching, stage overdue, or no agent assigned. Action recommended soon.' },
              { key: 'critical',  emoji: '🚨', name: 'Critical',  desc: 'Urgent intervention required — overdue harvest, missed harvest window, or no oversight on active crop.' },
              { key: 'completed', emoji: '🏆', name: 'Completed', desc: 'Stage has reached Harvested. Terminal state — the season is done for this field.' },
              { key: 'abandoned', emoji: '🚫', name: 'Abandoned', desc: 'Admin explicitly marked field as abandoned. Excluded from active monitoring and alerts.' },
            ].map(s => (
              <div className={`status-row ${s.key}`} key={s.key}>
                <div className="status-emoji">{s.emoji}</div>
                <div className="status-body">
                  <div className="status-name">{s.name}</div>
                  <div className="status-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── DEMO ACCOUNTS ────────────────────────────────────────────────────── */}
      <section className="demo-section" id="demo-section">
        <div className="section-eyebrow">Try it now</div>
        <h2 className="section-h2">Four demo accounts, ready to log in</h2>
        <p className="section-sub">Click any account below to go straight to the login page with credentials pre-filled. Explore the admin view, then switch to an agent to see the role-scoped experience.</p>
        <div className="roles-grid">
          <RoleCard
            icon="🔐" role="Sarah Kimani — Admin"
            email="admin@smartseason.com" password="Admin@1234"
            desc="Full access: all fields, all agents, user management, and global dashboard with charts."
            onFill={() => goToLogin('admin@smartseason.com')}
          />
          <RoleCard
            icon="👤" role="James Odhiambo — Field Agent"
            email="james@smartseason.com" password="Agent@1234"
            desc="Sees 4 assigned fields — Rift Valley blocks and North Rift. Can submit stage updates."
            onFill={() => goToLogin('james@smartseason.com')}
          />
          <RoleCard
            icon="👤" role="Grace Wanjiku — Field Agent"
            email="grace@smartseason.com" password="Agent@1234"
            desc="Manages Central Highlands plots and Nyanza sugarcane. Has a critical overdue field."
            onFill={() => goToLogin('grace@smartseason.com')}
          />
          <RoleCard
            icon="👤" role="David Mwangi — Field Agent"
            email="david@smartseason.com" password="Agent@1234"
            desc="Handles Nyanza rice (at risk), Coast cassava, and Western sunflower farm."
            onFill={() => goToLogin('david@smartseason.com')}
          />
        </div>
      </section>

      {/* ── API STRIP ────────────────────────────────────────────────────────── */}
      <div className="api-strip">
        <div className="api-inner">
          <div className="api-label">REST API — Base URL: http://localhost:8000/api</div>
          <div className="api-chips">
            {[
              { m:'POST', p:'/auth/login' },
              { m:'GET',  p:'/auth/me' },
              { m:'GET',  p:'/dashboard' },
              { m:'GET',  p:'/fields' },
              { m:'POST', p:'/fields' },
              { m:'GET',  p:'/fields/{id}' },
              { m:'PUT',  p:'/fields/{id}' },
              { m:'DELETE',p:'/fields/{id}' },
              { m:'POST', p:'/fields/{id}/abandon' },
              { m:'POST', p:'/fields/{id}/restore' },
              { m:'GET',  p:'/fields/{id}/updates' },
              { m:'POST', p:'/fields/{id}/updates' },
              { m:'GET',  p:'/agents' },
              { m:'GET',  p:'/users' },
              { m:'POST', p:'/users' },
              { m:'PUT',  p:'/users/{id}' },
              { m:'DELETE',p:'/users/{id}' },
            ].map(e => (
              <div key={e.p+e.m} className="api-chip">
                <span className={`method method-${e.m.toLowerCase()}`}>{e.m}</span>
                <span>{e.p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-logo">
          <div className="nav-logo-icon" style={{ width: 28, height: 28, fontSize: 14 }}>🌿</div>
          <div>
            <div className="footer-name">SmartSeason</div>
            <div className="footer-copy">© {new Date().getFullYear()} Field Monitoring System</div>
          </div>
        </div>
        <div className="footer-stack">
          {['Laravel 11', 'React 18', 'MySQL 8', 'Sanctum', 'Vite', 'Tailwind CSS', 'Recharts'].map(t => (
            <span key={t} className="stack-badge">{t}</span>
          ))}
        </div>
      </footer>
    </>
  )
}