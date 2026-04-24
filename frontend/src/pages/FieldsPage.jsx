import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fieldsApi } from '../api/services'
import { PageHeader, StatusBadge, StageBadge, Modal, ConfirmDialog, EmptyState, Spinner, Alert, FormField, StatusReason } from '../components/ui/index'

const ALL_STAGES = ['planted','germinated','growing','flowering','maturing','ready','harvested']

function FieldForm({ initial, agents, onSubmit, loading, error }) {
  const [form, setForm] = useState(initial || {
    name:'', crop_type:'', planting_date:'', expected_harvest_date:'',
    stage:'planted', assigned_agent_id:'', location:'', area_hectares:'', notes:''
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const d = { ...form }
    if (!d.assigned_agent_id)     delete d.assigned_agent_id
    if (!d.area_hectares)         delete d.area_hectares
    if (!d.location)              delete d.location
    if (!d.notes)                 delete d.notes
    if (!d.expected_harvest_date) delete d.expected_harvest_date
    onSubmit(d)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert type="error" message={error} />
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <FormField label="Field Name" required>
            <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. North Block A" />
          </FormField>
        </div>
        <FormField label="Crop Type" required>
          <input className="input" value={form.crop_type} onChange={e => set('crop_type', e.target.value)} required placeholder="e.g. Maize" />
        </FormField>
        <FormField label="Current Stage" required>
          <select className="input" value={form.stage} onChange={e => set('stage', e.target.value)}>
            {ALL_STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </FormField>
        <FormField label="Planting Date" required>
          <input type="date" className="input" value={form.planting_date} onChange={e => set('planting_date', e.target.value)} required max={new Date().toISOString().split('T')[0]} />
        </FormField>
        <FormField label="Expected Harvest Date" hint="Used for risk status calculation">
          <input type="date" className="input" value={form.expected_harvest_date} onChange={e => set('expected_harvest_date', e.target.value)} />
        </FormField>
        <FormField label="Assigned Agent">
          <select className="input" value={form.assigned_agent_id} onChange={e => set('assigned_agent_id', e.target.value)}>
            <option value="">— Unassigned —</option>
            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </FormField>
        <FormField label="Area (hectares)">
          <input type="number" step="0.01" min="0.01" className="input" value={form.area_hectares} onChange={e => set('area_hectares', e.target.value)} placeholder="e.g. 12.5" />
        </FormField>
        <div className="col-span-2">
          <FormField label="Location">
            <input className="input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Eldoret, Rift Valley" />
          </FormField>
        </div>
        <div className="col-span-2">
          <FormField label="Notes">
            <textarea className="input resize-none" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Additional notes about this field…" />
          </FormField>
        </div>
      </div>
      <div className="flex justify-end pt-2 gap-3">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <Spinner size="sm" /> : (initial ? 'Save Changes' : 'Create Field')}
        </button>
      </div>
    </form>
  )
}

export default function FieldsPage() {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const isAdmin     = user?.role === 'admin'

  const [fields, setFields]       = useState([])
  const [agents, setAgents]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [search, setSearch]       = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterStage, setFilterStage]   = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [editField, setEditField]   = useState(null)
  const [deleteField, setDeleteField] = useState(null)
  const [abandonField, setAbandonField] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError]     = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setFetchError('')
    Promise.all([fieldsApi.list(), isAdmin ? fieldsApi.agents() : Promise.resolve(null)])
      .then(([fr, ar]) => { setFields(fr.data.fields); if (ar) setAgents(ar.data.agents) })
      .catch(() => setFetchError('Failed to load fields. Make sure the backend server is running on port 8000.'))
      .finally(() => setLoading(false))
  }, [isAdmin])

  useEffect(() => { load() }, [load])

  const filtered = fields.filter(f => {
    const s = search.toLowerCase()
    return (!s || f.name.toLowerCase().includes(s) || f.crop_type.toLowerCase().includes(s) || (f.location||'').toLowerCase().includes(s))
      && (!filterStatus || f.status === filterStatus)
      && (!filterStage  || f.stage  === filterStage)
  })

  const act = async (fn, after) => {
    setFormLoading(true); setFormError('')
    try { await fn(); after?.(); load() }
    catch(e) { setFormError(e.response?.data?.message || Object.values(e.response?.data?.errors||{})?.[0]?.[0] || 'Something went wrong.') }
    finally { setFormLoading(false) }
  }

  return (
    <div className="animate-fadeIn space-y-5">
      <PageHeader
        title="Fields"
        subtitle={`${filtered.length} of ${fields.length} fields`}
        action={isAdmin && <button className="btn-primary" onClick={() => { setFormError(''); setCreateOpen(true) }}>+ Add Field</button>}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input className="input max-w-xs" placeholder="Search by name, crop, location…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input w-36" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All statuses</option>
          {['active','at_risk','critical','completed','abandoned'].map(s => (
            <option key={s} value={s}>{s === 'at_risk' ? 'At Risk' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <select className="input w-36" value={filterStage} onChange={e => setFilterStage(e.target.value)}>
          <option value="">All stages</option>
          {ALL_STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        {(search || filterStatus || filterStage) && (
          <button className="btn-secondary btn-sm" onClick={() => { setSearch(''); setFilterStatus(''); setFilterStage('') }}>Clear filters</button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="text-4xl">⚠️</div>
          <p className="text-red-600 font-medium text-center max-w-md">{fetchError}</p>
          <button className="btn-primary" onClick={load}>Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No fields found"
          description={isAdmin ? 'Add your first field to get started.' : 'You have no assigned fields matching these filters.'}
          action={isAdmin && <button className="btn-primary" onClick={() => setCreateOpen(true)}>Add Field</button>}
        />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Crop</th>
                <th>Stage</th>
                <th>Status</th>
                <th>Planted</th>
                <th>Harvest Date</th>
                {isAdmin && <th>Agent</th>}
                <th>Area</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(field => (
                <tr key={field.id} className="cursor-pointer" onClick={() => navigate(`/app/fields/${field.id}`)}>
                  <td>
                    <div>
                      <p className="font-medium text-stone-800">{field.name}</p>
                      {field.location && <p className="text-xs text-stone-400 mt-0.5">📍 {field.location}</p>}
                    </div>
                  </td>
                  <td className="text-stone-600">{field.crop_type}</td>
                  <td><StageBadge stage={field.stage} /></td>
                  <td>
                    <div>
                      <StatusBadge status={field.status} />
                      {field.status !== 'active' && field.status !== 'completed' && (
                        <p className="text-xs text-stone-400 mt-1 max-w-[180px] leading-tight">{field.status_reason}</p>
                      )}
                    </div>
                  </td>
                  <td className="text-stone-500 text-sm whitespace-nowrap">
                    {field.planting_date}
                    <p className="text-xs text-stone-400">{field.days_since_planting}d ago</p>
                  </td>
                  <td className="text-sm whitespace-nowrap">
                    {field.expected_harvest_date ? (
                      <div>
                        <p className={field.days_to_harvest < 0 ? 'text-red-600 font-semibold' : field.days_to_harvest <= 7 ? 'text-harvest-600 font-semibold' : 'text-stone-600'}>
                          {field.expected_harvest_date}
                        </p>
                        <p className="text-xs text-stone-400">
                          {field.days_to_harvest < 0 ? `${Math.abs(field.days_to_harvest)}d overdue` : `in ${field.days_to_harvest}d`}
                        </p>
                      </div>
                    ) : <span className="text-stone-300">—</span>}
                  </td>
                  {isAdmin && (
                    <td className="text-sm">
                      {field.assigned_agent ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-soil-200 text-soil-700 flex items-center justify-center text-xs font-bold">
                            {field.assigned_agent.name.charAt(0)}
                          </div>
                          <span className="text-stone-600">{field.assigned_agent.name}</span>
                        </div>
                      ) : <span className="text-stone-300 italic text-xs">Unassigned</span>}
                    </td>
                  )}
                  <td className="text-stone-500 text-sm">{field.area_hectares ? `${field.area_hectares} ha` : '—'}</td>
                  {isAdmin && (
                    <td onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1 flex-wrap">
                        <button className="btn-secondary btn-sm" onClick={() => { setFormError(''); setEditField({ ...field, assigned_agent_id: field.assigned_agent?.id || '' }) }}>Edit</button>
                        {!field.is_abandoned
                          ? <button className="btn-amber btn-sm" onClick={() => setAbandonField(field)}>Abandon</button>
                          : <button className="btn-success btn-sm" onClick={() => act(() => fieldsApi.restore(field.id))}>Restore</button>
                        }
                        <button className="btn-danger btn-sm" onClick={() => setDeleteField(field)}>Del</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add New Field" size="lg">
        <FieldForm agents={agents} onSubmit={(d) => act(() => fieldsApi.create(d), () => setCreateOpen(false))} loading={formLoading} error={formError} />
      </Modal>

      <Modal open={!!editField} onClose={() => setEditField(null)} title="Edit Field" size="lg">
        {editField && <FieldForm initial={editField} agents={agents} onSubmit={(d) => act(() => fieldsApi.update(editField.id, d), () => setEditField(null))} loading={formLoading} error={formError} />}
      </Modal>

      <ConfirmDialog open={!!deleteField} onClose={() => setDeleteField(null)}
        onConfirm={() => act(() => fieldsApi.delete(deleteField.id), () => setDeleteField(null))}
        loading={formLoading} title="Delete Field"
        message={`Permanently delete "${deleteField?.name}"? All update history will be lost.`} />

      <ConfirmDialog open={!!abandonField} onClose={() => setAbandonField(null)}
        onConfirm={() => act(() => fieldsApi.abandon(abandonField.id), () => setAbandonField(null))}
        loading={formLoading} title="Mark as Abandoned"
        message={`Mark "${abandonField?.name}" as abandoned? It will be excluded from active monitoring.`}
        confirmLabel="Mark Abandoned" confirmClass="btn-amber" />
    </div>
  )
}