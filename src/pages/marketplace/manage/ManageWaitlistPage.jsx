import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { SectionHeader, StatChip, SurfaceCard } from '@/components/ui/MarketplacePrimitives'
import {
  addManageWaitlistEntry,
  approveManageWaitlistEntry,
  getManageCapacitySnapshot,
  listManageWaitlist,
  removeManageWaitlistEntry,
} from '@/services'

function formatDateTime(value) {
  return new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function ManageWaitlistPage() {
  const { selectedEventId, permissions } = useOutletContext()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [capacity, setCapacity] = useState(null)
  const [waitlist, setWaitlist] = useState([])
  const [name, setName] = useState('')
  const [ticketType, setTicketType] = useState('General')
  const [phone, setPhone] = useState('')

  const canManageWaitlist = permissions.includes('waitlist')

  async function loadWaitlistData() {
    if (!selectedEventId) return
    const [capacityPayload, waitlistPayload] = await Promise.all([
      getManageCapacitySnapshot(selectedEventId, { simulateLatency: false }),
      listManageWaitlist(selectedEventId, { status: 'all' }, { simulateLatency: false }),
    ])
    setCapacity(capacityPayload)
    setWaitlist(waitlistPayload)
  }

  useEffect(() => {
    if (!selectedEventId) return
    if (!canManageWaitlist) {
      setLoading(false)
      return
    }

    let active = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        await loadWaitlistData()
      } catch {
        if (active) setError('Unable to load waitlist and capacity snapshot.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [selectedEventId, canManageWaitlist])

  async function onAddWaitlist(event) {
    event.preventDefault()
    if (!name.trim()) return
    setError('')
    try {
      await addManageWaitlistEntry(
        selectedEventId,
        { name: name.trim(), ticketType, phone: phone.trim() },
        { simulateLatency: false },
      )
      setName('')
      setPhone('')
      setTicketType('General')
      await loadWaitlistData()
    } catch (addError) {
      setError(addError?.message ?? 'Unable to add waitlist entry.')
    }
  }

  async function onApprove(entryId) {
    setError('')
    try {
      await approveManageWaitlistEntry(selectedEventId, entryId, { simulateLatency: false })
      await loadWaitlistData()
    } catch (approveError) {
      setError(approveError?.message ?? 'Unable to approve waitlist entry.')
    }
  }

  async function onRemove(entryId) {
    setError('')
    try {
      await removeManageWaitlistEntry(selectedEventId, entryId, { simulateLatency: false })
      await loadWaitlistData()
    } catch (removeError) {
      setError(removeError?.message ?? 'Unable to remove waitlist entry.')
    }
  }

  if (!selectedEventId) return <EmptyState message="Select an event first to manage waitlist and capacity." />
  if (loading) return <LoadingState label="Loading waitlist..." />
  if (!canManageWaitlist) return <ErrorState message="Your current role does not have waitlist permission." />
  if (error && waitlist.length === 0) return <ErrorState message={error} />

  return (
    <section className="space-y-space-4">
      <SectionHeader title="Waitlist & Capacity" subtitle="Track seat availability and promote waitlisted guests when slots open." />
      {error && <ErrorState message={error} />}

      {capacity && (
        <div className="grid grid-cols-2 gap-space-2 md:grid-cols-5">
          <StatChip label="Capacity" value={capacity.event.guestCapacity} />
          <StatChip label="Registered" value={capacity.registered} />
          <StatChip label="Checked in" value={capacity.checkedIn} />
          <StatChip label="Waitlist" value={capacity.waitlistCount} />
          <StatChip label="Available slots" value={capacity.availableSlots} />
        </div>
      )}

      <form onSubmit={onAddWaitlist} className="rounded-2xl border border-neutral-200 bg-white p-space-4">
        <p className="font-display text-heading-sm text-neutral-900">Add to waitlist</p>
        <div className="mt-space-2 grid gap-space-2 md:grid-cols-4">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Guest name"
            className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm md:col-span-2"
          />
          <select value={ticketType} onChange={(event) => setTicketType(event.target.value)} className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm">
            <option>General</option>
            <option>VIP</option>
            <option>Staff</option>
          </select>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Phone"
            className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
          />
        </div>
        <button type="submit" className="mt-space-2 rounded-full bg-info px-space-4 py-space-2 font-display text-label-md text-white">
          Add Entry
        </button>
      </form>

      <div className="space-y-space-2">
        {waitlist.length === 0 && <EmptyState message="No waitlist entries yet." />}
        {waitlist.map((entry) => (
          <SurfaceCard key={entry.id}>
            <div className="flex flex-wrap items-center justify-between gap-space-2">
              <div>
                <p className="font-display text-heading-sm text-neutral-900">{entry.name}</p>
                <p className="font-body text-caption-lg text-neutral-500">
                  {entry.ticketType} · {entry.phone || 'No phone'} · requested {formatDateTime(entry.requestedAt)}
                </p>
              </div>

              <div className="flex items-center gap-space-2">
                <span className={`rounded-full px-space-2 py-space-1 text-label-sm ${
                  entry.status === 'waiting'
                    ? 'bg-amber-100 text-warning'
                    : entry.status === 'approved'
                      ? 'bg-green-100 text-success'
                      : 'bg-neutral-100 text-neutral-600'
                }`}
                >
                  {entry.status}
                </span>

                {entry.status === 'waiting' && (
                  <>
                    <button
                      type="button"
                      onClick={() => onApprove(entry.id)}
                      className="rounded-full bg-info px-space-3 py-space-1 font-display text-label-sm text-white"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(entry.id)}
                      className="rounded-full bg-neutral-100 px-space-3 py-space-1 font-display text-label-sm text-neutral-700"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          </SurfaceCard>
        ))}
      </div>
    </section>
  )
}


