import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { ManageButton, ManageCard, ManageKpiTile, ManageSectionHeader } from '@/components/ui/ManagePrimitives'
import { exportManageReport, getManageAnalytics } from '@/services'

const inputCls = 'h-10 rounded-md border border-mgmt-border bg-mgmt-raised px-space-3 text-body-sm text-mgmt-text placeholder:text-mgmt-dim focus:border-mgmt-gold/60 focus:outline-none focus:ring-1 focus:ring-mgmt-gold/30'

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
      <ManageSectionHeader title="Live Analytics & Exports" subtitle="Review operations metrics and export attendance or incident reports." />
      {error && <ErrorState message={error} />}

      {analytics && (
        <div className="grid grid-cols-2 gap-space-2 md:grid-cols-5">
          <ManageKpiTile label="Total guests" value={analytics.totalGuests} />
          <ManageKpiTile label="Checked in" value={analytics.checkedIn} />
          <ManageKpiTile label="Pending" value={analytics.pending} />
          <ManageKpiTile label="Walk-ins" value={analytics.walkIns} />
          <ManageKpiTile label="SLA breaches" value={analytics.slaBreaches} />
        </div>
      )}

      <div className="grid gap-space-3 md:grid-cols-3">
        <ManageCard>
          <h3 className="font-playfair text-heading-sm text-mgmt-text">Check-in Sources</h3>
          {checkInSourceRows.length === 0 && <p className="mt-space-1 font-body text-body-sm text-mgmt-muted">No data yet.</p>}
          {checkInSourceRows.length > 0 && (
            <ul className="mt-space-2 space-y-space-1">
              {checkInSourceRows.map((row) => (
                <li key={row.key} className="flex items-center justify-between font-body text-body-sm text-mgmt-text">
                  <span className="text-mgmt-muted">{row.key}</span>
                  <span>{row.value}</span>
                </li>
              ))}
            </ul>
          )}
        </ManageCard>

        <ManageCard>
          <h3 className="font-playfair text-heading-sm text-mgmt-text">Ticket Breakdown</h3>
          {ticketRows.length === 0 && <p className="mt-space-1 font-body text-body-sm text-mgmt-muted">No data yet.</p>}
          {ticketRows.length > 0 && (
            <ul className="mt-space-2 space-y-space-1">
              {ticketRows.map((row) => (
                <li key={row.key} className="flex items-center justify-between font-body text-body-sm text-mgmt-text">
                  <span className="text-mgmt-muted">{row.key}</span>
                  <span>{row.value}</span>
                </li>
              ))}
            </ul>
          )}
        </ManageCard>

        <ManageCard>
          <h3 className="font-playfair text-heading-sm text-mgmt-text">Check-ins Per Hour</h3>
          {hourlyRows.length === 0 && <p className="mt-space-1 font-body text-body-sm text-mgmt-muted">No data yet.</p>}
          {hourlyRows.length > 0 && (
            <ul className="mt-space-2 space-y-space-1">
              {hourlyRows.map((row) => (
                <li key={row.key} className="flex items-center justify-between font-body text-body-sm text-mgmt-text">
                  <span className="text-mgmt-muted">{row.key}</span>
                  <span>{row.value}</span>
                </li>
              ))}
            </ul>
          )}
        </ManageCard>
      </div>

      <ManageCard>
        <h3 className="font-playfair text-heading-sm text-mgmt-text">Export Reports</h3>
        <div className="mt-space-2 flex flex-wrap items-center gap-space-2">
          <select
            value={exportType}
            onChange={(event) => setExportType(event.target.value)}
            className={inputCls}
          >
            <option value="attendance">Attendance CSV</option>
            <option value="incidents">Incident CSV</option>
          </select>
          <ManageButton type="button" onClick={onExport}>Generate</ManageButton>
        </div>
        {exportFilename && (
          <p className="mt-space-2 font-body text-caption-lg text-mgmt-muted">Generated: {exportFilename}</p>
        )}
        {exportPreview && (
          <textarea
            readOnly
            value={exportPreview}
            className="mt-space-2 h-48 w-full rounded-md border border-mgmt-border bg-mgmt-raised px-space-3 py-space-2 font-mono text-caption-lg text-mgmt-muted focus:outline-none"
          />
        )}
      </ManageCard>
    </section>
  )
}
