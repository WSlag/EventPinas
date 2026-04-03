import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { SectionHeader, SurfaceCard } from '@/components/ui/MarketplacePrimitives'
import { listManageGuests } from '@/services'

export default function ManageGuestsPage() {
  const { selectedEventId, permissions } = useOutletContext()
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const canAccessGuests = permissions.includes('guests')

  useEffect(() => {
    if (!selectedEventId) return
    if (!canAccessGuests) {
      setLoading(false)
      return
    }

    let active = true

    async function loadGuests() {
      setLoading(true)
      setError('')

      try {
        const payload = await listManageGuests(selectedEventId, { query, status })
        if (active) setGuests(payload)
      } catch {
        if (active) setError('Unable to load guests for this event.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadGuests()
    return () => {
      active = false
    }
  }, [selectedEventId, query, status, canAccessGuests])

  const ticketTypes = useMemo(() => {
    const all = new Set(guests.map((guest) => guest.ticketType))
    return Array.from(all).sort()
  }, [guests])

  if (!selectedEventId) return <EmptyState message="Select an event first to view guests." />
  if (loading) return <LoadingState label="Loading guest list..." />
  if (!canAccessGuests) return <ErrorState message="Your current role has no guest-list permission." />
  if (error) return <ErrorState message={error} />

  return (
    <section className="space-y-space-3">
      <SectionHeader title="Guest Management" subtitle="Search attendees, monitor check-in state, and verify table assignments." />

      <div className="grid gap-space-2 md:grid-cols-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by guest name, id, table, ticket"
          className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm md:col-span-2"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
        >
          <option value="all">All statuses</option>
          <option value="checkedIn">Checked in</option>
          <option value="pending">Pending</option>
          <option value="walkIn">Walk-ins</option>
        </select>
      </div>

      <SurfaceCard>
        <p className="font-body text-caption-lg text-neutral-500">Ticket types in current result: {ticketTypes.join(', ') || 'N/A'}</p>
      </SurfaceCard>

      {guests.length === 0 && <EmptyState message="No guests matched your filters." />}

      {guests.length > 0 && (
        <div className="grid gap-space-2">
          {guests.map((guest) => (
            <SurfaceCard key={guest.id}>
              <div className="flex items-start justify-between gap-space-2">
                <div>
                  <p className="font-display text-heading-sm text-neutral-900">{guest.name}</p>
                  <p className="font-body text-caption-lg text-neutral-500">{guest.id} · {guest.ticketType}</p>
                  <p className="font-body text-caption-lg text-neutral-500">
                    Table: {guest.tableLabel ?? 'Unassigned'} · {guest.phone || 'No phone'}
                  </p>
                </div>
                <span className={`rounded-full px-space-2 py-space-1 text-label-sm ${
                  guest.checkedInAt
                    ? 'bg-green-100 text-success'
                    : 'bg-neutral-100 text-neutral-600'
                }`}
                >
                  {guest.checkedInAt ? 'Checked in' : 'Pending'}
                </span>
              </div>
            </SurfaceCard>
          ))}
        </div>
      )}
    </section>
  )
}


