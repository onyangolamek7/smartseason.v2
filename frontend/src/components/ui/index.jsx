import Spinner from './Spinner'

// ── Status Badge ──────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const cfg = {
    active:    { cls: 'badge-active',    dot: 'bg-crop-500',     label: 'Active'    },
    at_risk:   { cls: 'badge-at_risk',   dot: 'bg-harvest-500',  label: 'At Risk'   },
    critical:  { cls: 'badge-critical',  dot: 'bg-red-500',      label: 'Critical'  },
    completed: { cls: 'badge-completed', dot: 'bg-stone-400',    label: 'Completed' },
    abandoned: { cls: 'badge-abandoned', dot: 'bg-stone-400',    label: 'Abandoned' },
  }[status] ?? { cls: 'badge-active', dot: 'bg-crop-500', label: status }

  return (
    <span className={cfg.cls}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot} ${status === 'critical' ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  )
}

// ── Stage Badge ───────────────────────────────────────────────────────────────
export function StageBadge({ stage }) {
  const labels = {
    planted: 'Planted', germinated: 'Germinated', growing: 'Growing',
    flowering: 'Flowering', maturing: 'Maturing', ready: 'Ready', harvested: 'Harvested',
  }
  return <span className={`stage-${stage}`}>{labels[stage] ?? stage}</span>
}

// ── Alert ─────────────────────────────────────────────────────────────────────
export function Alert({ type = 'error', message, onClose }) {
  if (!message) return null
  const styles = {
    error:   'bg-red-50 border-red-200 text-red-700',
    success: 'bg-crop-50 border-crop-200 text-crop-700',
    warning: 'bg-harvest-50 border-harvest-200 text-harvest-700',
    info:    'bg-blue-50 border-blue-200 text-blue-700',
  }
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-sm mb-3 ${styles[type]}`}>
      <span className="flex-1">{message}</span>
      {onClose && <button onClick={onClose} className="opacity-60 hover:opacity-100 text-lg leading-none ml-2">×</button>}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${widths[size]} max-h-[90vh] overflow-y-auto animate-fadeIn`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
            <h2 className="font-display text-lg text-soil-800">{title}</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 text-xl">×</button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, loading, confirmLabel = 'Delete', confirmClass = 'btn-danger' }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-stone-600 text-sm mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
        <button className={confirmClass} onClick={onConfirm} disabled={loading}>
          {loading ? <Spinner size="sm" /> : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-5xl mb-4">{icon}</div>}
      <h3 className="font-display text-xl text-stone-600 mb-2">{title}</h3>
      {description && <p className="text-stone-400 text-sm max-w-xs mb-6">{description}</p>}
      {action}
    </div>
  )
}

// ── Page Header ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4">
      <div>
        <h1 className="font-display text-2xl text-soil-800">{title}</h1>
        {subtitle && <p className="text-stone-500 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon, colorClass = 'bg-soil-50 text-soil-600', sub, pulse }) {
  return (
    <div className={`card flex items-center gap-4 ${pulse ? 'ring-2 ring-red-300 ring-offset-1' : ''}`}>
      {icon && (
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${colorClass}`}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-2xl font-display font-bold text-soil-800 leading-none">{value}</p>
        <p className="text-stone-500 text-xs mt-1">{label}</p>
        {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── Form Field ────────────────────────────────────────────────────────────────
export function FormField({ label, error, children, required, hint }) {
  return (
    <div>
      <label className="label">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-stone-400 mt-1">{hint}</p>}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

// ── Health Score Bar ──────────────────────────────────────────────────────────
export function HealthBar({ score }) {
  if (!score) return <span className="text-stone-300 text-xs">—</span>
  const pct = (score / 10) * 100
  const color = score >= 8 ? 'bg-crop-500' : score >= 5 ? 'bg-harvest-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-stone-500 w-4">{score}</span>
    </div>
  )
}

// ── Status Reason Tooltip ─────────────────────────────────────────────────────
export function StatusReason({ status, reason }) {
  if (!reason || status === 'active' || status === 'completed') return null
  const colors = {
    at_risk:   'bg-harvest-50 border-harvest-200 text-harvest-700',
    critical:  'bg-red-50 border-red-200 text-red-700',
    abandoned: 'bg-stone-100 border-stone-200 text-stone-600',
  }
  return (
    <div className={`flex items-start gap-2 px-3 py-2 rounded-lg border text-xs mt-2 ${colors[status] ?? colors.at_risk}`}>
      <span className="mt-0.5 flex-shrink-0">{status === 'critical' ? '🚨' : status === 'abandoned' ? '🚫' : '⚠️'}</span>
      <span>{reason}</span>
    </div>
  )
}

export { Spinner }