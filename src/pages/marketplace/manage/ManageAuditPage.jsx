import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { SectionHeader, SurfaceCard } from '@/components/ui/MarketplacePrimitives'
import { listManageAuditTrail } from '@/services'

function formatDateTime(value) {
  return new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const moduleOptions = [
  'all',
  'checkin',
  'seating',
  'staff',
  'incidents',
  'waitlist',
]

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
      <SectionHeader title="Audit Trail" subtitle="Track who changed operational data and when." />
      {error && <ErrorState message={error} />}

      <div className="grid gap-space-2 md:grid-cols-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search summary, action, or role"
          className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
        />

        <select
          value={module}
          onChange={(event) => setModule(event.target.value)}
          className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
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
          className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
        >
          {severityOptions.map((option) => (
            <option key={option} value={option}>
              {option === 'all' ? 'All severities' : option}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-space-2">
        {entries.length === 0 && <EmptyState message="No audit entries matched your filters." />}
        {entries.map((entry) => (
          <SurfaceCard key={entry.id}>
            <div className="flex items-start justify-between gap-space-2">
              <div>
                <p className="font-display text-heading-sm text-neutral-900">{entry.summary}</p>
                <p className="font-body text-caption-lg text-neutral-500">
                  {entry.module} - {entry.action} - {entry.actorRole}
                </p>
              </div>
              <div className="text-right">
                <span className={`rounded-full px-space-2 py-space-1 text-label-sm ${
                  entry.severity === 'warning' ? 'bg-amber-100 text-warning' : 'bg-neutral-100 text-neutral-600'
                }`}
                >
                  {entry.severity}
                </span>
                <p className="mt-space-1 font-body text-caption-lg text-neutral-500">{formatDateTime(entry.createdAt)}</p>
              </div>
            </div>
          </SurfaceCard>
        ))}
      </div>
    </section>
  )
}

