import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { dashboardApi } from '../api/services'
import { StatCard, StageBadge, StatusBadge, StatusReason, Spinner, PageHeader } from '../components/ui/index'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts'

/*helpers*/
function timeAgo(d) {
  if (!d) return '—'
  const s = Math.floor((Date.now() - new Date(d)) / 1000)
  if (s < 60)    return 'just now'
  if (s < 3600)  return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}
function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
}

const STAGE_COLORS  = { planted:'#f59e0b', germinated:'#84cc16', growing:'#22c55e', flowering:'#ec4899', maturing:'#f97316', ready:'#3b82f6', harvested:'#78716c' }
const STATUS_COLORS = { active:'#16a34a', at_risk:'#f59e0b', critical:'#ef4444', completed:'#78716c', abandoned:'#a8a29e' }

/*sub-components*/
function SectionTitle({ children, sub }) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-base text-soil-700">{children}</h2>
      {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function AlertCard({ field, onClick }) {
  const borderColor = field.status === 'critical' ? 'border-red-300 bg-red-50' : 'border-harvest-300 bg-harvest-50'
  return (
    <div onClick={onClick} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer hover:shadow-md transition-all ${borderColor}`}>
      <div className="text-xl flex-shrink-0 mt-0.5">{field.status === 'critical' ? '🚨' : '⚠️'}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-stone-800 truncate">{field.name}</span>
          <StatusBadge status={field.status} />
        </div>
        <p className="text-xs text-stone-600 mt-1">{field.status_reason}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <StageBadge stage={field.stage} />
          <span className="text-xs text-stone-400">· {field.agent}</span>
        </div>
      </div>
    </div>
  )
}

function HarvestCard({ field, onClick }) {
  const urgent = field.days_to_harvest <= 3
  return (
    <div onClick={onClick} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:shadow-md transition-all ${urgent ? 'border-blue-300 bg-blue-50' : 'border-stone-200 bg-white'}`}>
      <div className="text-xl flex-shrink-0">🌾</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-stone-800 truncate">{field.name}</p>
        <p className="text-xs text-stone-500">{field.crop_type}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-bold ${urgent ? 'text-blue-700' : 'text-stone-700'}`}>{field.days_to_harvest}d</p>
        <p className="text-xs text-stone-400">{field.expected_harvest_date}</p>
      </div>
    </div>
  )
}

/*main component*/
export default function DashboardPage() {
  const { user }              = useAuth()
  const navigate              = useNavigate()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const isAdmin               = user?.role === 'admin'

  useEffect(() => {
    dashboardApi.get()
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load dashboard data. Make sure the backend server is running on port 8000.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="text-4xl">⚠️</div>
      <p className="text-red-600 font-medium text-center max-w-md">{error}</p>
      <button className="btn-primary" onClick={() => { setError(''); setLoading(true); dashboardApi.get().then(r => setData(r.data)).catch(() => setError('Still failing. Check your backend.')).finally(() => setLoading(false)) }}>Retry</button>
    </div>
  )
  if (!data) return null

  /* chart data */
  const stagePieData = Object.entries(data.stage_breakdown)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: v, color: STAGE_COLORS[k] }))

  const statusBarData = Object.entries(data.status_breakdown)
    .map(([k, v]) => ({
      name: k === 'at_risk' ? 'At Risk' : k.charAt(0).toUpperCase() + k.slice(1),
      value: v, color: STATUS_COLORS[k]
    }))

  const cropBarData = Object.entries(data.crop_breakdown || {})
    .map(([k, v]) => ({ name: k, value: v }))

  return (
    <div className="animate-fadeIn space-y-6">
      {/* Header */}
      <PageHeader
        title={`Good ${greeting()}, ${user?.name?.split(' ')[0]}`}
        subtitle={isAdmin ? 'Season overview across all fields and agents.' : 'Overview of your assigned fields.'}
      />

      {/*Alerts strip (critical/at-risk)*/}
      {(data.alert_fields?.length > 0 || data.needs_action?.length > 0) && (() => {
        const alerts = isAdmin ? data.alert_fields : data.needs_action
        const criticals = alerts.filter(f => f.status === 'critical')
        return criticals.length > 0 ? (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-pulse-soft">            <strong>{criticals.length} critical field{criticals.length > 1 ? 's' : ''}</strong> require immediate attention.
            <button className="ml-auto text-xs underline" onClick={() => document.getElementById('alerts-section')?.scrollIntoView({ behavior: 'smooth' })}>View below</button>
          </div>
        ) : null
      })()}

      {/*KPI cards*/}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Fields"    value={data.summary.total_fields} colorClass="bg-soil-50 text-soil-600" />
        <StatCard label="Active"          value={data.summary.active_fields} colorClass="bg-crop-50 text-crop-600" />
        <StatCard label="At Risk"         value={data.summary.at_risk_fields} colorClass="bg-harvest-50 text-harvest-600" />
        <StatCard label="Critical"        value={data.summary.critical_fields} colorClass="bg-red-50 text-red-600" pulse={data.summary.critical_fields > 0} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {isAdmin ? (
          <>
            <StatCard label="Field Agents"     value={data.summary.total_agents} colorClass="bg-blue-50 text-blue-600" />
            <StatCard label="Unassigned"        value={data.summary.unassigned_fields} colorClass="bg-stone-100 text-stone-500" />
            <StatCard label="Upcoming Harvests" value={data.summary.upcoming_harvests} colorClass="bg-purple-50 text-purple-600" sub="next 14 days" />
            <StatCard label="Total Area"        value={`${data.summary.total_area_ha} ha`} colorClass="bg-teal-50 text-teal-600" />
          </>
        ) : (
          <>
            <StatCard label="Ready to Harvest" value={data.summary.ready_to_harvest} colorClass="bg-blue-50 text-blue-600" />
            <StatCard label="Completed"         value={data.summary.completed_fields} colorClass="bg-stone-100 text-stone-500" />
            <StatCard label="Upcoming Harvests" value={data.summary.upcoming_harvests} colorClass="bg-purple-50 text-purple-600" sub="next 14 days" />
            <StatCard label="Total Area"        value={`${data.summary.total_area_ha} ha`} colorClass="bg-teal-50 text-teal-600" />
          </>
        )}
      </div>

      {/*Charts row*/}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Stage donut */}
        <div className="card">
          <SectionTitle>Stage Breakdown</SectionTitle>
          {stagePieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stagePieData} cx="50%" cy="50%" innerRadius={52} outerRadius={82}
                  paddingAngle={2} dataKey="value">
                  {stagePieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [v, 'Fields']} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-stone-600">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-stone-400 text-sm text-center py-8">No fields yet</p>}
        </div>

        {/* Status bar */}
        <div className="card">
          <SectionTitle>Status Overview</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusBarData} margin={{ left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} formatter={(v) => [v, 'Fields']} />
              <Bar dataKey="value" radius={[5, 5, 0, 0]} maxBarSize={52}>
                {statusBarData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Crop breakdown (admin) or upcoming harvests (agent) */}
        {isAdmin && cropBarData.length > 0 ? (
          <div className="card">
            <SectionTitle>Crop Types</SectionTitle>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={cropBarData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={70} />
                <Tooltip formatter={(v) => [v, 'Fields']} />
                <Bar dataKey="value" fill="#8a4e1e" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="card">
            <SectionTitle sub="Next 14 days">Upcoming Harvests</SectionTitle>
            {data.upcoming_harvests?.length > 0 ? (
              <div className="space-y-2">
                {data.upcoming_harvests.map(f => (
                  <HarvestCard key={f.id} field={f} onClick={() => navigate(`/app/fields/${f.id}`)} />
                ))}
              </div>
            ) : <p className="text-stone-400 text-sm text-center py-8">No harvests in the next 14 days</p>}
          </div>
        )}
      </div>

      {/*Main content area*/}
      <div className={`grid gap-5 ${isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>

        {/* Alerts section */}
        <div id="alerts-section" className={isAdmin ? 'lg:col-span-2' : ''}>
          <SectionTitle>
            {isAdmin ? 'Fields Needing Attention' : 'Your Fields Needing Action'}
          </SectionTitle>
          {(() => {
            const alerts = isAdmin ? data.alert_fields : data.needs_action
            return alerts?.length > 0 ? (
              <div className="space-y-2">
                {alerts.map(f => (
                  <AlertCard key={f.id} field={f} onClick={() => navigate(`/app/fields/${f.id}`)} />
                ))}
              </div>
            ) : (
              <div className="card text-center py-8">
                <p className="text-sm text-stone-500">All fields are in good shape!</p>
              </div>
            )
          })()}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Upcoming harvests (admin right column) */}
          {isAdmin && (
            <div>
              <SectionTitle>Upcoming Harvests</SectionTitle>
              {data.upcoming_harvests?.length > 0 ? (
                <div className="space-y-2">
                  {data.upcoming_harvests.map(f => (
                    <HarvestCard key={f.id} field={f} onClick={() => navigate(`/app/fields/${f.id}`)} />
                  ))}
                </div>
              ) : (
                <div className="card text-center py-6">
                  <p className="text-stone-400 text-sm">No harvests in next 14 days</p>
                </div>
              )}
            </div>
          )}

          {/* Agent workload (admin) */}
          {isAdmin && data.agent_stats?.length > 0 && (
            <div>
              <SectionTitle>Agent Workload</SectionTitle>
              <div className="card space-y-3">
                {data.agent_stats.map(a => (
                  <div key={a.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-soil-100 text-soil-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {a.name.charAt(0)}
                      </div>
                      <span className="text-sm text-stone-700 truncate">{a.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-20 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-soil-400 rounded-full"
                          style={{ width: `${Math.min(100, (a.fields_count / Math.max(...data.agent_stats.map(x => x.fields_count))) * 100)}%` }} />
                      </div>
                      <span className="text-xs text-stone-500 w-12 text-right">{a.fields_count} field{a.fields_count !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/*Recent activity*/}
      <div>
        <SectionTitle>Recent Activity</SectionTitle>
        {data.recent_updates?.length > 0 ? (
          <div className="card divide-y divide-stone-100">
            {data.recent_updates.map(u => (
              <div key={u.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 cursor-pointer hover:bg-stone-50 -mx-1 px-1 rounded-lg transition-colors"
                onClick={() => navigate(`/app/fields/${u.field_id}`)}>
                <div className="w-8 h-8 rounded-full bg-soil-100 flex items-center justify-center text-sm flex-shrink-0">{u.stage_emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-stone-800">{u.field_name}</span>
                    <StageBadge stage={u.stage} />
                    {u.health_score && (
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${u.health_score >= 8 ? 'bg-crop-100 text-crop-700' : u.health_score >= 5 ? 'bg-harvest-100 text-harvest-700' : 'bg-red-100 text-red-700'}`}>
                        ❤️ {u.health_score}/10
                      </span>
                    )}
                  </div>
                  {u.notes && <p className="text-xs text-stone-500 mt-0.5 truncate">{u.notes}</p>}
                  <p className="text-xs text-stone-400 mt-0.5">
                    {isAdmin && u.updated_by ? `${u.updated_by} · ` : ''}{timeAgo(u.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-8">
            <p className="text-stone-400 text-sm">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  )
}