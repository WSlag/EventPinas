import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { SectionHeader, SurfaceCard } from '@/components/ui/MarketplacePrimitives'
import { checkInGuest, listManageGuests, listRecentCheckIns, registerWalkIn, validateManageQrCode } from '@/services'

function formatTime(value) {
  if (!value) return 'Just now'
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ManageCheckinPage() {
  const { selectedEventId, permissions } = useOutletContext()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingGuests, setPendingGuests] = useState([])
  const [recentCheckIns, setRecentCheckIns] = useState([])
  const [scanCode, setScanCode] = useState('')
  const [walkInName, setWalkInName] = useState('')
  const [walkInTicket, setWalkInTicket] = useState('General')
  const [walkInPhone, setWalkInPhone] = useState('')

  const canOperateCheckin = permissions.includes('checkin')

  async function loadCheckInData() {
    if (!selectedEventId) return
    const [pendingPayload, recentPayload] = await Promise.all([
      listManageGuests(selectedEventId, { status: 'pending' }, { simulateLatency: false }),
      listRecentCheckIns(selectedEventId, 8, { simulateLatency: false }),
    ])
    setPendingGuests(pendingPayload)
    setRecentCheckIns(recentPayload)
  }

  useEffect(() => {
    if (!selectedEventId) return
    if (!canOperateCheckin) {
      setLoading(false)
      return
    }

    let active = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        await loadCheckInData()
      } catch {
        if (active) setError('Unable to load check-in queue right now.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [selectedEventId, canOperateCheckin])

  const pendingById = useMemo(() => {
    const map = new Map()
    pendingGuests.forEach((guest) => map.set(guest.id.toLowerCase(), guest))
    return map
  }, [pendingGuests])

  async function onCheckIn(guestId, source = 'manual') {
    if (!selectedEventId) return
    setError('')
    try {
      await checkInGuest(selectedEventId, guestId, { source }, { simulateLatency: false })
      await loadCheckInData()
    } catch (checkInError) {
      setError(checkInError?.message ?? 'Unable to check in guest right now.')
    }
  }

  async function onScanSubmit(event) {
    event.preventDefault()
    if (!scanCode.trim()) return

    try {
      const matchedGuest = await validateManageQrCode(selectedEventId, scanCode.trim(), { simulateLatency: false })
      if (!pendingById.get(matchedGuest.id.toLowerCase())) {
        setError('Guest is already checked in.')
        return
      }
      await onCheckIn(matchedGuest.id, 'qr')
      setScanCode('')
    } catch (scanError) {
      setError(scanError?.message ?? 'Invalid QR input.')
    }
  }

  async function onWalkInSubmit(event) {
    event.preventDefault()
    if (!selectedEventId) return
    if (!walkInName.trim()) return
    setError('')

    try {
      await registerWalkIn(
        selectedEventId,
        { name: walkInName.trim(), ticketType: walkInTicket, phone: walkInPhone.trim() },
        { simulateLatency: false },
      )
      setWalkInName('')
      setWalkInPhone('')
      setWalkInTicket('General')
      await loadCheckInData()
    } catch (walkInError) {
      setError(walkInError?.message ?? 'Unable to register walk-in right now.')
    }
  }

  if (!selectedEventId) return <EmptyState message="Select an event first to run check-in." />
  if (loading) return <LoadingState label="Loading check-in queue..." />
  if (!canOperateCheckin) return <ErrorState message="Your current role has no check-in permission." />
  if (error && pendingGuests.length === 0 && recentCheckIns.length === 0) return <ErrorState message={error} />

  return (
    <section className="space-y-space-4">
      <SectionHeader title="Check-in Console" subtitle="Scan or confirm attendees, then register walk-ins at the gate." />

      {error && <ErrorState message={error} />}

      <div className="grid gap-space-3 md:grid-cols-2">
        <SurfaceCard>
          <h3 className="font-display text-heading-md text-neutral-900">QR Scan Simulation</h3>
          <p className="mt-space-1 font-body text-body-sm text-neutral-600">
            Scan by guest id, EVENTPH payload, or a /qr/event/guest URL.
          </p>
          <form onSubmit={onScanSubmit} className="mt-space-3 flex gap-space-2">
            <input
              value={scanCode}
              onChange={(event) => setScanCode(event.target.value)}
              placeholder="Guest ID or QR payload"
              className="h-10 flex-1 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
            />
            <button type="submit" className="rounded-full bg-info px-space-4 py-space-2 font-display text-label-md text-white">
              Scan
            </button>
          </form>
        </SurfaceCard>

        <SurfaceCard>
          <h3 className="font-display text-heading-md text-neutral-900">Walk-in Registration</h3>
          <form onSubmit={onWalkInSubmit} className="mt-space-3 space-y-space-2">
            <input
              value={walkInName}
              onChange={(event) => setWalkInName(event.target.value)}
              placeholder="Guest full name"
              className="h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
            />
            <div className="grid grid-cols-2 gap-space-2">
              <select
                value={walkInTicket}
                onChange={(event) => setWalkInTicket(event.target.value)}
                className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
              >
                <option>General</option>
                <option>VIP</option>
                <option>Staff</option>
              </select>
              <input
                value={walkInPhone}
                onChange={(event) => setWalkInPhone(event.target.value)}
                placeholder="Phone number"
                className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
              />
            </div>
            <button type="submit" className="rounded-full bg-primary-400 px-space-4 py-space-2 font-display text-label-md text-white">
              Register Walk-in
            </button>
          </form>
        </SurfaceCard>
      </div>

      <div className="grid gap-space-3 md:grid-cols-2">
        <section className="space-y-space-2">
          <SectionHeader title="Pending Queue" subtitle={`${pendingGuests.length} guest(s) waiting`} />
          <div className="space-y-space-2">
            {pendingGuests.length === 0 && <EmptyState message="All guests are checked in." />}
            {pendingGuests.map((guest) => (
              <SurfaceCard key={guest.id}>
                <div className="flex items-center justify-between gap-space-2">
                  <div>
                    <p className="font-display text-heading-sm text-neutral-900">{guest.name}</p>
                    <p className="font-body text-caption-lg text-neutral-500">{guest.id} · {guest.ticketType} · Table {guest.tableLabel ?? 'N/A'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onCheckIn(guest.id)}
                    className="rounded-full bg-info px-space-3 py-space-1 font-display text-label-sm text-white"
                  >
                    Check in
                  </button>
                </div>
              </SurfaceCard>
            ))}
          </div>
        </section>

        <section className="space-y-space-2">
          <SectionHeader title="Recent Activity" subtitle="Latest successful entries." />
          <div className="space-y-space-2">
            {recentCheckIns.length === 0 && <EmptyState message="No check-ins logged yet." />}
            {recentCheckIns.map((entry) => (
              <SurfaceCard key={entry.id}>
                <div className="flex items-center justify-between gap-space-2">
                  <div>
                    <p className="font-display text-heading-sm text-neutral-900">{entry.name}</p>
                    <p className="font-body text-caption-lg text-neutral-500">{entry.ticketType} · via {entry.source}</p>
                  </div>
                  <span className="font-body text-caption-lg text-neutral-500">{formatTime(entry.checkedInAt)}</span>
                </div>
              </SurfaceCard>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}


