import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { LoadingState, ErrorState } from '@/components/ui/PageStates'
import { ManageCard, ManageKpiTile, ManageSectionHeader } from '@/components/ui/ManagePrimitives'
import { getManageDashboard, listRecentCheckIns } from '@/services'

function formatCheckInTime(iso) {
  if (!iso) return 'Just now'
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ManageDashboardPage() {
  const { selectedEventId, permissions } = useOutletContext()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dashboard, setDashboard] = useState(null)
  const [recentCheckIns, setRecentCheckIns] = useState([])
  const canAccessDashboard = permissions.includes('dashboard')

  useEffect(() => {
    if (!selectedEventId) return
    if (!canAccessDashboard) {
      setLoading(false)
      return
    }

    let active = true
    async function loadDashboard() {
      setLoading(true)
      setError('')
      try {
        const [dashboardPayload, checkInsPayload] = await Promise.all([
          getManageDashboard(selectedEventId, { simulateLatency: false }),
          listRecentCheckIns(selectedEventId, 8, { simulateLatency: false }),
        ])
        if (!active) return
        setDashboard(dashboardPayload)
        setRecentCheckIns(checkInsPayload)
      } catch {
        if (active) setError('Unable to load dashboard metrics right now.')
      } finally {
        if (active) setLoading(false)
      }
    }
    loadDashboard()
    return () => {
      active = false
    }
  }, [selectedEventId, canAccessDashboard])

  if (loading) return <LoadingState label="Loading organizer dashboard..." />
  if (!canAccessDashboard) return <ErrorState message="Your current role has no dashboard permission." />
  if (error) return <ErrorState message={error} />
  if (!dashboard) return <ErrorState message="No dashboard data found for this event." />

  return (
    <div className="space-y-space-4">
      <section className="grid grid-cols-2 gap-space-2 md:grid-cols-6">
        <ManageKpiTile label="Total guests" value={dashboard.totalGuests} />
        <ManageKpiTile label="Checked in" value={dashboard.checkedIn} />
        <ManageKpiTile label="Pending" value={dashboard.pending} />
        <ManageKpiTile label="Walk-ins" value={dashboard.walkIns} />
        <ManageKpiTile label="Check-in rate" value={`${dashboard.checkInRate}%`} />
        <ManageKpiTile label="Open incidents" value={dashboard.openIncidents} />
      </section>

      <section className="space-y-space-2">
        <ManageSectionHeader title="Seating Snapshot" subtitle="Current table occupancy and available seats." />
        <div className="grid gap-space-2 md:grid-cols-3">
          {dashboard.tableSummary.map((table) => (
            <ManageCard key={table.id}>
              <p className="font-display text-heading-sm text-neutral-900">{table.label}</p>
              <p className="mt-space-1 font-body text-body-sm text-neutral-600">
                {table.seated} / {table.capacity} seated
              </p>
              <p className="font-body text-caption-lg text-secondary-700">{table.available} seats available</p>
            </ManageCard>
          ))}
        </div>
      </section>

      <section className="space-y-space-2">
        <ManageSectionHeader title="Recent Check-ins" subtitle="Latest attendance activity from the gate." />
        <ManageCard>
          {recentCheckIns.length === 0 && (
            <p className="font-body text-body-sm text-neutral-500">No check-ins yet for this event.</p>
          )}
          {recentCheckIns.length > 0 && (
            <ul className="space-y-space-2">
              {recentCheckIns.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between border-b border-neutral-200 pb-space-2 last:border-b-0">
                  <div>
                    <p className="font-display text-label-md text-neutral-900">{entry.name}</p>
                    <p className="font-body text-caption-lg text-neutral-500">
                      {entry.ticketType} - {entry.source}
                    </p>
                  </div>
                  <span className="font-body text-caption-lg text-neutral-500">{formatCheckInTime(entry.checkedInAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </ManageCard>
      </section>
    </div>
  )
}
