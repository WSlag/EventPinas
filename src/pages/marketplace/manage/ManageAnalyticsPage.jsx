import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { SectionHeader, StatChip, SurfaceCard } from '@/components/ui/MarketplacePrimitives'
import { exportManageReport, getManageAnalytics } from '@/services'

function mapRecordToRows(record) {
  return Object.entries(record ?? {}).map(([key, value]) => ({ key, value }))
}

export default function ManageAnalyticsPage() {
  const { selectedEventId, permissions } = useOutletContext()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [analytics, setAnalytics] = useState(null)
  const [exportType, setExportType] = useState('attendance')
  const [exportPreview, setExportPreview] = useState('')
  const [exportFilename, setExportFilename] = useState('')

  const canAccessAnalytics = permissions.includes('analytics')
  const checkInSourceRows = useMemo(() => mapRecordToRows(analytics?.checkInBySource), [analytics])
  const ticketRows = useMemo(() => mapRecordToRows(analytics?.ticketBreakdown), [analytics])
  const hourlyRows = useMemo(() => mapRecordToRows(analytics?.hourlyCheckIns), [analytics])

  useEffect(() => {
    if (!selectedEventId) return
    if (!canAccessAnalytics) {
      setLoading(false)
      return
    }

    let active = true

    async function loadAnalytics() {
      setLoading(true)
      setError('')
      try {
        const payload = await getManageAnalytics(selectedEventId, { simulateLatency: false })
        if (active) setAnalytics(payload)
      } catch {
        if (active) setError('Unable to load analytics right now.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadAnalytics()
    return () => {
      active = false
    }
  }, [selectedEventId, canAccessAnalytics])

  async function onExport() {
    if (!selectedEventId) return
    setError('')
    try {
      const report = await exportManageReport(selectedEventId, exportType, { simulateLatency: false })
      setExportFilename(report.filename)
      setExportPreview(report.content)
    } catch (exportError) {
      setError(exportError?.message ?? 'Unable to generate export.')
    }
  }

  if (!selectedEventId) return <EmptyState message="Select an event first to view analytics." />
  if (loading) return <LoadingState label="Loading analytics..." />
  if (!canAccessAnalytics) return <ErrorState message="Your current role does not have analytics access." />
  if (error && !analytics) return <ErrorState message={error} />

  return (
    <section className="space-y-space-4">
      <SectionHeader title="Live Analytics & Exports" subtitle="Review operations metrics and export attendance or incident reports." />
      {error && <ErrorState message={error} />}

      {analytics && (
        <div className="grid grid-cols-2 gap-space-2 md:grid-cols-5">
          <StatChip label="Total guests" value={analytics.totalGuests} />
          <StatChip label="Checked in" value={analytics.checkedIn} />
          <StatChip label="Pending" value={analytics.pending} />
          <StatChip label="Walk-ins" value={analytics.walkIns} />
          <StatChip label="SLA breaches" value={analytics.slaBreaches} />
        </div>
      )}

      <div className="grid gap-space-3 md:grid-cols-3">
        <SurfaceCard>
          <h3 className="font-display text-heading-sm text-neutral-900">Check-in Sources</h3>
          {checkInSourceRows.length === 0 && <p className="mt-space-1 font-body text-body-sm text-neutral-500">No data yet.</p>}
          {checkInSourceRows.length > 0 && (
            <ul className="mt-space-2 space-y-space-1">
              {checkInSourceRows.map((row) => (
                <li key={row.key} className="flex items-center justify-between font-body text-body-sm text-neutral-700">
                  <span>{row.key}</span>
                  <span>{row.value}</span>
                </li>
              ))}
            </ul>
          )}
        </SurfaceCard>

        <SurfaceCard>
          <h3 className="font-display text-heading-sm text-neutral-900">Ticket Breakdown</h3>
          {ticketRows.length === 0 && <p className="mt-space-1 font-body text-body-sm text-neutral-500">No data yet.</p>}
          {ticketRows.length > 0 && (
            <ul className="mt-space-2 space-y-space-1">
              {ticketRows.map((row) => (
                <li key={row.key} className="flex items-center justify-between font-body text-body-sm text-neutral-700">
                  <span>{row.key}</span>
                  <span>{row.value}</span>
                </li>
              ))}
            </ul>
          )}
        </SurfaceCard>

        <SurfaceCard>
          <h3 className="font-display text-heading-sm text-neutral-900">Check-ins Per Hour</h3>
          {hourlyRows.length === 0 && <p className="mt-space-1 font-body text-body-sm text-neutral-500">No data yet.</p>}
          {hourlyRows.length > 0 && (
            <ul className="mt-space-2 space-y-space-1">
              {hourlyRows.map((row) => (
                <li key={row.key} className="flex items-center justify-between font-body text-body-sm text-neutral-700">
                  <span>{row.key}</span>
                  <span>{row.value}</span>
                </li>
              ))}
            </ul>
          )}
        </SurfaceCard>
      </div>

      <SurfaceCard>
        <h3 className="font-display text-heading-sm text-neutral-900">Export Reports</h3>
        <div className="mt-space-2 flex flex-wrap items-center gap-space-2">
          <select
            value={exportType}
            onChange={(event) => setExportType(event.target.value)}
            className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
          >
            <option value="attendance">Attendance CSV</option>
            <option value="incidents">Incident CSV</option>
          </select>
          <button type="button" onClick={onExport} className="rounded-full bg-info px-space-4 py-space-2 font-display text-label-md text-white">
            Generate
          </button>
        </div>
        {exportFilename && (
          <p className="mt-space-2 font-body text-caption-lg text-neutral-500">Generated: {exportFilename}</p>
        )}
        {exportPreview && (
          <textarea
            readOnly
            value={exportPreview}
            className="mt-space-2 h-48 w-full rounded-md border border-neutral-200 bg-neutral-50 px-space-3 py-space-2 font-mono text-caption-lg text-neutral-700"
          />
        )}
      </SurfaceCard>
    </section>
  )
}

