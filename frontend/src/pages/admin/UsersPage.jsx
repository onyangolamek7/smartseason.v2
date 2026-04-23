import { useEffect, useState, useCallback } from 'react'
import { usersApi } from '../../api/services'
import { useAuth } from '../../context/AuthContext'
import { PageHeader, Modal, ConfirmDialog, Spinner, Alert, FormField, EmptyState } from '../../components/ui/index'

function UserForm({ initial, onSubmit, loading, error }) {
  const [form, setForm] = useState(initial || { name:'', email:'', password:'', role:'field_agent' })
  const isEdit = !!initial
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const d = { ...form }
    if (isEdit && !d.password) delete d.password
    onSubmit(d)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert type="error" message={error} />
      <FormField label="Full Name" required>
        <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Jane Mwangi" />
      </FormField>
      <FormField label="Email Address" required>
        <input type="email" className="input" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="jane@example.com" />
      </FormField>
      <FormField label={isEdit ? 'New Password' : 'Password'} required={!isEdit} hint={isEdit ? 'Leave blank to keep current password' : 'Min 8 chars, mixed case + number'}>
        <input type="password" className="input" value={form.password}
          onChange={e => set('password', e.target.value)} required={!isEdit}
          placeholder={isEdit ? 'Leave blank to keep current' : 'Min 8 chars, e.g. Secret@1'}
          autoComplete="new-password" />
      </FormField>
      <FormField label="Role" required>
        <select className="input" value={form.role} onChange={e => set('role', e.target.value)}>
          <option value="field_agent">Field Agent</option>
          <option value="admin">Admin</option>
        </select>
      </FormField>
      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <Spinner size="sm" /> : (isEdit ? 'Save Changes' : 'Create User')}
        </button>
      </div>
    </form>
  )
}

export default function UsersPage() {
  const { user: me }          = useAuth()
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser]     = useState(null)
  const [deleteUser, setDeleteUser] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError]     = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setFetchError('')
    usersApi.list()
      .then(r => {
        console.log("API RESPONSE:", r.data)

        const data =
        r.data.users ||
        r.data.data ||
        r.data ||
        []

        setUsers(Array.isArray(data) ? data : [])
      })

      .catch(() => setFetchError('Failed to load users. Make sure the backend server is running on port 8000.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const act = async (fn, after) => {
    setFormLoading(true); setFormError('')
    try { await fn(); after?.(); load() }
    catch(e) {
      const errs = e.response?.data?.errors
      setFormError(errs ? Object.values(errs).flat()[0] : (e.response?.data?.message || 'Something went wrong.'))
    } finally { setFormLoading(false) }
  }

  const safeUsers = Array.isArray(users) ? users : []

  const admins = safeUsers.filter(u => u.role === 'admin')
  const agents = safeUsers.filter(u => u.role === 'field_agent')

  return (
    <div className="animate-fadeIn space-y-6">
      <PageHeader
        title="Users"
        subtitle={`${safeUsers.length} user${safeUsers.length !== 1 ? 's' : ''} · ${admins.length} admin${admins.length !== 1 ? 's' : ''}, ${agents.length} agent${agents.length !== 1 ? 's' : ''}`}
        action={<button className="btn-primary" onClick={() => { setFormError(''); setCreateOpen(true) }}>+ Add User</button>}
      />

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="text-4xl">⚠️</div>
          <p className="text-red-600 font-medium text-center max-w-md">{fetchError}</p>
          <button className="btn-primary" onClick={load}>Retry</button>
        </div>
      ) : safeUsers.length === 0 ? (
        <EmptyState title="No users yet" action={<button className="btn-primary" onClick={() => setCreateOpen(true)}>Add User</button>} />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Fields</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(users) && users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-soil-100 text-soil-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-stone-800">{u.name}</p>
                        {u.id === me?.id && <span className="text-xs text-stone-400">(You)</span>}
                      </div>
                    </div>
                  </td>
                  <td className="text-stone-500">{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'bg-soil-100 text-soil-700' : 'bg-crop-50 text-crop-700'}`}>
                      {u.role_label}
                    </span>
                  </td>
                  <td>
                    {u.role === 'field_agent'
                      ? <span className="text-sm font-semibold text-stone-700">{u.fields_count}</span>
                      : <span className="text-stone-300 text-sm">—</span>
                    }
                  </td>
                  <td className="text-stone-400 text-sm">{u.created_at}</td>
                  <td>
                    <div className="flex gap-1.5">
                      <button className="btn-secondary btn-sm" onClick={() => { setFormError(''); setEditUser({ ...u, password: '' }) }}>
                        Edit
                      </button>
                      {u.id !== me?.id && (
                        <button className="btn-danger btn-sm" onClick={() => setDeleteUser(u)}>Del</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add New User">
        <UserForm onSubmit={d => act(() => usersApi.create(d), () => setCreateOpen(false))} loading={formLoading} error={formError} />
      </Modal>

      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        {editUser && <UserForm initial={editUser} onSubmit={d => act(() => usersApi.update(editUser.id, d), () => setEditUser(null))} loading={formLoading} error={formError} />}
      </Modal>

      <ConfirmDialog open={!!deleteUser} onClose={() => setDeleteUser(null)}
        onConfirm={() => act(() => usersApi.delete(deleteUser.id), () => setDeleteUser(null))}
        loading={formLoading} title="Delete User"
        message={`Delete "${deleteUser?.name}"? Their assigned fields will become unassigned.`} />
    </div>
  )
}