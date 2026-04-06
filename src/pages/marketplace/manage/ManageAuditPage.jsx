import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { ManageBadge, ManageCard, ManageFilterBar, ManageSectionHeader } from '@/components/ui/ManagePrimitives'
import { listManageAuditTrail } from '@/services'

const inputCls = 'h-10 rounded-md border border-mgmt-border bg-mgmt-raised px-space-3 text-body-sm text-mgmt-text placeholder:text-mgmt-dim focus:border-mgmt-gold/60 focus:outline-none focus:ring-1 focus:ring-mgmt-gold/30'

function formatDateTime(value) {
  return new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const moduleOptions = ['all', 'checkin', 'seating', 'staff', 'incidents', 'waitlist']
const severityOptions = ['all', 'info', 'warning']

export default function ManageAuditPage() {
  const { selectedEventId, permissions } = useOutletContext()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [entries, setEntries] = useState([])
  const [query, setQuery] = useState('')
  const [module, setModule] = useState('all')
  const [severity, setSeverity] = useState('all')

  const canAccessAudit = permissions.includes('audit')

  useEffect(() => {
    if (!selectedEventId) return
    if (!canAccessAudit) {
      setLoading(false)
      return
    }
    let active = true
    async function loadAuditTrail() {
      setLoading(true)
      setError('')
      try {
        const payload = await listManageAuditTrail(
          selectedEventId,
          { query, module, severity },
          { simulateLatency: false },
        )
        if (active) setEntries(payload)
      } catch {
        if (active) setError('Unable to load audit trail right now.')
      } finally {
        if (active) setLoading(false)
      }
    }
    loadAuditTrail()
    return () => {
      active = false
    }
  }, [selectedEventId, query, module, severity, canAccessAudit])

  if (!selectedEventId) return <EmptyState message="Select an event first to view audit activity." />
  if (loading) return <LoadingState label="Loading audit trail..." />
  if (!canAccessAudit) return <ErrorState message="Your current role does not have audit-log access." />
  if (error && entries.length === 0) return <ErrorState message={error} />

  return (
    <section className="space-y-space-4">
      <ManageSectionHeader title="Audit Trail" subtitle="Track who changed operational data and when." />
      {error && <ErrorState message={error} />}

      <ManageFilterBar>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search summary, action, or role"
          className={`flex-1 ${inputCls}`}
        />
        <select
          value={module}
          onChange={(event) => setModule(event.target.value)}
          className={inputCls}
        >
          {moduleOptions.map((option) => (
            <option key={option} value={option}>
              {option === 'all' ? 'All modules' : option}
            </option>
          ))}
        </select>
        <select
          value={severity}
          onChange={(event) => setSeverity(event.target.value)}
          className={inputCls}
        >
          {severityOptions.map((option) => (
            <option key={option} value={option}>
              {option === 'all' ? 'All severities' : option}
            </option>
          ))}
        </select>
      </ManageFilterBar>

      <div className="space-y-space-2">
        {entries.length === 0 && <EmptyState message="No audit entries matched your filters." />}
        {entries.map((entry) => (
          <ManageCard key={entry.id}>
            <div className="flex items-start justify-between gap-space-2">
              <div>
                <p className="font-barlow text-[0.9375rem] font-semibold uppercase tracking-wide text-mgmt-text">{entry.summary}</p>
                <p className="font-body text-caption-lg text-mgmt-muted">
                  {entry.module} - {entry.action} - {entry.actorRole}
                </p>
              </div>
              <div className="text-right">
                <ManageBadge tone={entry.severity === 'warning' ? 'warning' : 'neutral'}>
                  {entry.severity}
                </ManageBadge>
                <p className="mt-space-1 font-body text-caption-lg text-mgmt-muted">{formatDateTime(entry.createdAt)}</p>
              </div>
            </div>
          </ManageCard>
        ))}
      </div>
    </section>
  )
}
