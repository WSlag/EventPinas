import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import {
  ManageBadge,
  ManageButton,
  ManageCard,
  ManageKpiTile,
  ManageSectionHeader,
} from '@/components/ui/ManagePrimitives'
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

  const loadWaitlistData = useCallback(async () => {
    if (!selectedEventId) return
    const [capacityPayload, waitlistPayload] = await Promise.all([
      getManageCapacitySnapshot(selectedEventId, { simulateLatency: false }),
      listManageWaitlist(selectedEventId, { status: 'all' }, { simulateLatency: false }),
    ])
    setCapacity(capacityPayload)
    setWaitlist(waitlistPayload)
  }, [selectedEventId])

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
  }, [selectedEventId, canManageWaitlist, loadWaitlistData])

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
      <ManageSectionHeader title="Waitlist & Capacity" subtitle="Track seat availability and promote waitlisted guests when slots open." />
      {error && <ErrorState message={error} />}

      {capacity && (
        <div className="grid grid-cols-2 gap-space-2 md:grid-cols-5">
          <ManageKpiTile label="Capacity" value={capacity.event.guestCapacity} />
          <ManageKpiTile label="Registered" value={capacity.registered} />
          <ManageKpiTile label="Checked in" value={capacity.checkedIn} />
          <ManageKpiTile label="Waitlist" value={capacity.waitlistCount} />
          <ManageKpiTile label="Available slots" value={capacity.availableSlots} />
        </div>
      )}

      <ManageCard>
        <form onSubmit={onAddWaitlist}>
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
          <ManageButton type="submit" className="mt-space-2">Add Entry</ManageButton>
        </form>
      </ManageCard>

      <div className="space-y-space-2">
        {waitlist.length === 0 && <EmptyState message="No waitlist entries yet." />}
        {waitlist.map((entry) => (
          <ManageCard key={entry.id}>
            <div className="flex flex-wrap items-center justify-between gap-space-2">
              <div>
                <p className="font-display text-heading-sm text-neutral-900">{entry.name}</p>
                <p className="font-body text-caption-lg text-neutral-500">
                  {entry.ticketType} - {entry.phone || 'No phone'} - requested {formatDateTime(entry.requestedAt)}
                </p>
              </div>

              <div className="flex items-center gap-space-2">
                <ManageBadge tone={entry.status === 'waiting' ? 'warning' : entry.status === 'approved' ? 'success' : 'neutral'}>
                  {entry.status}
                </ManageBadge>

                {entry.status === 'waiting' && (
                  <>
                    <ManageButton type="button" onClick={() => onApprove(entry.id)}>Approve</ManageButton>
                    <ManageButton type="button" variant="secondary" onClick={() => onRemove(entry.id)}>Remove</ManageButton>
                  </>
                )}
              </div>
            </div>
          </ManageCard>
        ))}
      </div>
    </section>
  )
}
