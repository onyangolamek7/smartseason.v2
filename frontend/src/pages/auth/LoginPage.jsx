import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/ui/Spinner'
import { Alert } from '../../components/ui/index'

export default function LoginPage() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const location    = useLocation()
  const [form, setForm]       = useState(() => {
    const prefill = location.state?.prefill
    if (prefill) return { email: prefill, password: prefill.includes('admin') ? 'Admin@1234' : 'Agent@1234' }
    return { email: '', password: '' }
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  const fill = (email) => setForm({ email, password: email.includes('admin') ? 'Admin@1234' : 'Agent@1234' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/app/dashboard')
    } catch (err) {
      setError(err.response?.data?.errors?.email?.[0] || err.response?.data?.message || 'Login failed.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex bg-stone-50">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-soil-800 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 15% 85%, rgba(34,197,94,0.15) 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(166,98,40,0.25) 0%, transparent 55%)' }}
        />
        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-crop-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-5 h-5">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
            </svg>
          </div>
          <div>
            <p className="font-display font-bold text-white text-xl">SmartSeason</p>
            <p className="text-soil-400 text-xs tracking-wide">Field Monitoring System</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative space-y-5">
          <h2 className="font-display text-4xl text-white leading-tight">
            Track every field,<br />every season.
          </h2>
          <p className="text-soil-300 text-sm leading-relaxed max-w-sm">
            Monitor crop progress across all stages, get instant risk alerts, and keep your harvest on track — all from one place.
          </p>
          {/* Stage flow */}
          <div className="mt-6 flex flex-col gap-2">
            {[
              { label: 'Planted',    desc: 'Seeds in ground'       },
              { label: 'Germinated', desc: 'Seedlings emerging'    },
              { label: 'Growing',    desc: 'Active growth phase'   },
              { label: 'Flowering',  desc: 'Pollination stage'     },
              { label: 'Maturing',   desc: 'Crop filling & drying' },
              { label: 'Ready',      desc: 'Harvest window open'   },
              { label: 'Harvested',  desc: 'Season complete'       },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-soil-700 flex items-center justify-center text-sm">{s.emoji}</div>
                  {i < 6 && <div className="w-px h-3 bg-soil-600 mt-0.5" />}
                </div>
                <div>
                  <span className="text-white text-xs font-semibold">{s.label}</span>
                  <span className="text-soil-400 text-xs ml-2">{s.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-soil-500 text-xs">© {new Date().getFullYear()} SmartSeason</p>
      </div>

      {/* Right: login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-fadeIn">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-crop-500 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
              </svg>
            </div>
            <span className="font-display font-bold text-soil-800 text-xl">SmartSeason</span>
          </div>

          <h1 className="font-display text-3xl text-soil-800 mb-1">Welcome back</h1>
          <p className="text-stone-500 text-sm mb-7">Sign in to your monitoring account</p>

          <Alert type="error" message={error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required autoComplete="email" />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input pr-10" placeholder="••••••••"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-sm">
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full justify-center btn-lg mt-2" disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Sign in'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-stone-100 rounded-xl border border-stone-200">
            <p className="text-xs font-semibold text-stone-600 mb-3">Demo Accounts — click to fill</p>
            <div className="space-y-2">
              {[
                { label: 'Admin',       email: 'admin@smartseason.com' },
                { label: 'James (Agent)', email: 'james@smartseason.com' },
                { label: 'Grace (Agent)', email: 'grace@smartseason.com' },
                { label: 'David (Agent)', email: 'david@smartseason.com' },
              ].map(a => (
                <button key={a.email} type="button" onClick={() => fill(a.email)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-white border border-stone-200 hover:border-soil-300 hover:bg-soil-50 transition-colors">
                  <p className="text-xs font-medium text-stone-700">{a.label}</p>
                  <p className="text-xs text-stone-400 font-mono">{a.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}