import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fieldsApi, updatesApi } from '../api/services'
import { StageBadge, StatusBadge, StatusReason, Spinner, Alert, FormField, HealthBar } from '../components/ui/index'

const ALL_STAGES = ['planted','germinated','growing','flowering','maturing','ready','harvested']

function StageProgressBar({ current }) {
  const idx = ALL_STAGES.indexOf(current)
  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="flex items-center min-w-max gap-0">
        {ALL_STAGES.map((s, i) => {
          const done   = i < idx
          const active = i === idx
          return (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${done   ? 'bg-crop-500 text-white'                         : ''}
                  ${active ? 'bg-soil-600 text-white ring-4 ring-soil-200/60'  : ''}
                  ${!done && !active ? 'bg-stone-200 text-stone-400'           : ''}
                `}>
                  {done ? '✓' : i + 1}
                </div>
                <span className={`text-[10px] capitalize font-medium ${active ? 'text-soil-700' : 'text-stone-400'}`}>{s}</span>
              </div>
              {i < ALL_STAGES.length - 1 && (
                <div className={`h-0.5 w-8 mx-1 mb-5 rounded ${done ? 'bg-crop-400' : 'bg-stone-200'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function timeAgo(d) {
  if (!d) return '—'
  const s = Math.floor((Date.now() - new Date(d)) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function FieldDetailPage() {
  const { id }                = useParams()
  const { user }              = useAuth()
  const navigate              = useNavigate()
  const isAdmin               = user?.role === 'admin'

  const [field, setField]     = useState(null)
  const [loading, setLoading] = useState(true)

  const [form, setForm]                   = useState({ stage: '', notes: '', health_score: '' })
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateError, setUpdateError]     = useState('')
  const [updateSuccess, setUpdateSuccess] = useState('')

  const reload = () => {
    setLoading(true)
    fieldsApi.get(id)
      .then(r => {
        setField(r.data.field)
        setForm(f => ({ ...f, stage: r.data.field.stage }))
      })
      .catch(() => navigate('/app/fields'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { reload() }, [id])

  const canUpdate = isAdmin || field?.assigned_agent?.id === user?.id

  const handleUpdate = async (e) => {
    e.preventDefault()
    setUpdateLoading(true); setUpdateError(''); setUpdateSuccess('')
    try {
      const payload = { stage: form.stage }
      if (form.notes.trim())  payload.notes        = form.notes.trim()
      if (form.health_score)  payload.health_score = parseInt(form.health_score)
      await updatesApi.create(id, payload)
      setUpdateSuccess('Update submitted!')
      setForm(f => ({ ...f, notes: '', health_score: '' }))
      reload()
      setTimeout(() => setUpdateSuccess(''), 3000)
    } catch (e) {
      setUpdateError(e.response?.data?.message || 'Failed to submit update.')
    } finally { setUpdateLoading(false) }
  }

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>
  if (!field) return null

  const allowedStages = isAdmin
    ? ALL_STAGES
    : ALL_STAGES.filter(s => ALL_STAGES.indexOf(s) >= ALL_STAGES.indexOf(field.stage))

  const showUpdateForm = canUpdate && field.stage !== 'harvested' && !field.is_abandoned

  return (
    <div className="animate-fadeIn space-y-5 max-w-5xl">
      {/* Back */}
      <button onClick={() => navigate('/app/fields')} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-soil-700 transition-colors font-medium">
        ← Back to Fields
      </button>

      {/* Header */}
      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="font-display text-2xl text-soil-800">{field.name}</h1>
            {field.location && <p className="text-stone-400 text-sm mt-1">📍 {field.location}</p>}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StageBadge stage={field.stage} />
            <StatusBadge status={field.status} />
            {field.is_abandoned && <span className="badge badge-abandoned">🚫 Abandoned</span>}
          </div>
        </div>

        {/* Status reason */}
        <StatusReason status={field.status} reason={field.status_reason} />

        {/* Stage progress bar */}
        <div className="mt-5 mb-1">
          <StageProgressBar current={field.stage} />
        </div>

        {/* Detail grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Crop Type',      value: field.crop_type },
            { label: 'Planting Date',  value: field.planting_date },
            { label: 'Days Active',    value: `${field.days_since_planting} days` },
            { label: 'Area',           value: field.area_hectares ? `${field.area_hectares} ha` : '—' },
          ].map(d => (
            <div key={d.label} className="bg-stone-50 rounded-lg px-3 py-2.5 border border-stone-100">
              <p className="text-xs text-stone-400 mb-0.5">{d.label}</p>
              <p className="text-sm font-semibold text-stone-700">{d.value}</p>
            </div>
          ))}
        </div>

        {/* Harvest date */}
        {field.expected_harvest_date && (
          <div className={`mt-3 flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm ${
            field.days_to_harvest < 0 ? 'bg-red-50 border border-red-200 text-red-700'
            : field.days_to_harvest <= 7 ? 'bg-harvest-50 border border-harvest-200 text-harvest-700'
            : 'bg-blue-50 border border-blue-200 text-blue-700'
          }`}>
            <span>Expected harvest: <strong>{field.expected_harvest_date}</strong></span>
            <span className="ml-auto text-xs font-semibold">
              {field.days_to_harvest < 0 ? `${Math.abs(field.days_to_harvest)} days overdue` : `${field.days_to_harvest} days away`}
            </span>
          </div>
        )}

        {/* Agent */}
        <div className="mt-3 flex items-center gap-3 p-3 bg-soil-50 rounded-lg border border-soil-100">
          <div className="w-9 h-9 rounded-full bg-soil-200 text-soil-700 flex items-center justify-center font-bold flex-shrink-0">
            {field.assigned_agent?.name?.charAt(0) ?? '?'}
          </div>
          <div>
            <p className="text-sm font-medium text-stone-700">{field.assigned_agent?.name ?? 'No agent assigned'}</p>
            <p className="text-xs text-stone-400">{field.assigned_agent?.email ?? 'Field is unassigned'}</p>
          </div>
        </div>

        {field.notes && (
          <div className="mt-3 px-3 py-2.5 bg-stone-50 rounded-lg border border-stone-100 text-sm text-stone-600">
            <span className="text-xs font-semibold text-stone-400 block mb-1">Field Notes</span>
            {field.notes}
          </div>
        )}
      </div>

      {/* Update form + History */}
      <div className={`grid gap-5 ${showUpdateForm ? 'lg:grid-cols-5' : 'lg:grid-cols-1'}`}>

        {/* Update form */}
        {showUpdateForm && (
          <div className="lg:col-span-2 card">
            <h3 className="font-display text-base text-soil-700 mb-4">Submit Update</h3>
            <Alert type="error"   message={updateError}   onClose={() => setUpdateError('')} />
            <Alert type="success" message={updateSuccess} />
            <form onSubmit={handleUpdate} className="space-y-4">
              <FormField label="Update Stage" required>
                <select className="input" value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}>
                  {allowedStages.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </FormField>

              <FormField label="Health Score" hint="Rate crop health from 1 (poor) to 10 (excellent)">
                <div className="flex items-center gap-3">
                  <input type="range" min="1" max="10" className="flex-1 accent-soil-600"
                    value={form.health_score || 5}
                    onChange={e => setForm(f => ({ ...f, health_score: e.target.value }))} />
                  <span className={`text-sm font-bold w-6 text-center ${
                    form.health_score >= 8 ? 'text-crop-600' : form.health_score >= 5 ? 'text-harvest-600' : 'text-red-600'
                  }`}>{form.health_score || '—'}</span>
                </div>
              </FormField>

              <FormField label="Observations / Notes">
                <textarea className="input resize-none" rows={4}
                  placeholder="Describe field conditions, treatments applied, issues observed…"
                  value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  maxLength={2000} />
                <p className="text-xs text-stone-400 text-right mt-1">{form.notes.length}/2000</p>
              </FormField>

              <button type="submit" className="btn-primary w-full justify-center" disabled={updateLoading}>
                {updateLoading ? <Spinner size="sm" /> : 'Submit Update'}
              </button>
            </form>
          </div>
        )}

        {/* History timeline */}
        <div className={showUpdateForm ? 'lg:col-span-3 card' : 'card'}>
          <h3 className="font-display text-base text-soil-700 mb-4">
            Update History
            <span className="ml-2 text-xs font-body font-normal text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
              {field.updates?.length ?? 0}
            </span>
          </h3>

          {!field.updates?.length ? (
            <div className="text-center py-10 text-stone-400">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm">No updates recorded yet</p>
            </div>
          ) : (
            <div className="space-y-0">
              {field.updates.map((u, i) => (
                <div key={u.id} className="flex gap-3">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-soil-400 mt-1.5 ring-2 ring-white ring-offset-0" />
                    {i < field.updates.length - 1 && <div className="w-px flex-1 bg-stone-200 mt-1 min-h-[20px]" />}
                  </div>
                  <div className="pb-5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-base">{u.stage_emoji}</span>
                      <StageBadge stage={u.stage} />
                      {u.health_score && (
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${u.health_score >= 8 ? 'bg-crop-100 text-crop-700' : u.health_score >= 5 ? 'bg-harvest-100 text-harvest-700' : 'bg-red-100 text-red-700'}`}>
                          ❤️ {u.health_score}/10
                        </span>
                      )}
                      <span className="text-xs text-stone-400 ml-auto">{timeAgo(u.created_at)}</span>
                    </div>
                    {u.notes && (
                      <div className="bg-stone-50 border border-stone-100 rounded-lg px-3 py-2 text-sm text-stone-600 mb-1.5">
                        {u.notes}
                      </div>
                    )}
                    <p className="text-xs text-stone-400">
                      By <span className="font-medium text-stone-500">{u.updated_by ?? 'Unknown'}</span>
                      {' · '}{formatDate(u.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}