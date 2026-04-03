import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { SectionHeader, SurfaceCard } from '@/components/ui/MarketplacePrimitives'
import { assignGuestSeat, listManageGuests, listManageTables } from '@/services'

export default function ManageSeatingPage() {
  const { selectedEventId, permissions } = useOutletContext()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tables, setTables] = useState([])
  const [guests, setGuests] = useState([])
  const [selectedGuestId, setSelectedGuestId] = useState('')
  const [selectedTableLabel, setSelectedTableLabel] = useState('')

  const canEditSeating = permissions.includes('seating')

  async function loadSeatingData() {
    if (!selectedEventId) return
    const [tablePayload, guestPayload] = await Promise.all([
      listManageTables(selectedEventId, { simulateLatency: false }),
      listManageGuests(selectedEventId, { status: 'all' }, { simulateLatency: false }),
    ])
    setTables(tablePayload)
    setGuests(guestPayload)
  }

  useEffect(() => {
    if (!selectedEventId) return
    if (!canEditSeating) {
      setLoading(false)
      return
    }

    let active = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        await loadSeatingData()
      } catch {
        if (active) setError('Unable to load seating data right now.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [selectedEventId, canEditSeating])

  async function onAssignSeat(event) {
    event.preventDefault()
    if (!selectedEventId || !selectedGuestId) return
    setError('')
    try {
      await assignGuestSeat(selectedEventId, selectedGuestId, selectedTableLabel || null, { simulateLatency: false })
      await loadSeatingData()
      setSelectedGuestId('')
      setSelectedTableLabel('')
    } catch (assignmentError) {
      setError(assignmentError?.message ?? 'Unable to assign table seat.')
    }
  }

  if (!selectedEventId) return <EmptyState message="Select an event first to manage seating." />
  if (loading) return <LoadingState label="Loading seating map..." />
  if (!canEditSeating) return <ErrorState message="Your current role has view-only access for seating." />
  if (error && tables.length === 0) return <ErrorState message={error} />

  const selectedGuest = guests.find((guest) => guest.id === selectedGuestId) ?? null

  return (
    <section className="space-y-space-4">
      <SectionHeader title="Seating & Tables" subtitle="Assign guests to tables and monitor available seats." />
      {error && <ErrorState message={error} />}

      <form onSubmit={onAssignSeat} className="grid gap-space-2 rounded-2xl border border-neutral-200 bg-white p-space-4 md:grid-cols-3">
        <select
          value={selectedGuestId}
          onChange={(event) => setSelectedGuestId(event.target.value)}
          className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
        >
          <option value="">Select guest</option>
          {guests.map((guest) => (
            <option key={guest.id} value={guest.id}>
              {guest.name} ({guest.ticketType})
            </option>
          ))}
        </select>

        <select
          value={selectedTableLabel}
          onChange={(event) => setSelectedTableLabel(event.target.value)}
          className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
        >
          <option value="">Unassign table</option>
          {tables.map((table) => (
            <option key={table.id} value={table.label}>
              {table.label} ({table.available} available)
            </option>
          ))}
        </select>

        <button type="submit" className="rounded-full bg-info px-space-4 py-space-2 font-display text-label-md text-white">
          {selectedGuest?.tableLabel ? 'Reassign Seat' : 'Assign Seat'}
        </button>
      </form>

      <div className="grid gap-space-2 md:grid-cols-3">
        {tables.map((table) => (
          <SurfaceCard key={table.id}>
            <div className="flex items-center justify-between gap-space-2">
              <p className="font-display text-heading-sm text-neutral-900">{table.label}</p>
              <span className={`rounded-full px-space-2 py-space-1 text-label-sm ${
                table.available === 0 ? 'bg-primary-50 text-primary-600' : 'bg-green-100 text-success'
              }`}
              >
                {table.seated}/{table.capacity}
              </span>
            </div>
            <p className="mt-space-1 font-body text-caption-lg text-neutral-500">{table.available} seats available</p>
            {table.guests.length > 0 && (
              <ul className="mt-space-2 space-y-space-1">
                {table.guests.map((guest) => (
                  <li key={guest.id} className="font-body text-caption-lg text-neutral-600">
                    {guest.name}
                  </li>
                ))}
              </ul>
            )}
          </SurfaceCard>
        ))}
      </div>
    </section>
  )
}

