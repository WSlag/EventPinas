import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { HeroBanner, PageShell, StatChip } from '@/components/ui/MarketplacePrimitives'
import { ErrorState, LoadingState } from '@/components/ui/PageStates'
import { getManageBootstrap, getManageRolePermissions, setManageOperatorRole, setManageSelectedEvent } from '@/services'

const manageNavItems = [
  { to: '/manage/dashboard', label: 'Dashboard', permission: 'dashboard' },
  { to: '/manage/events', label: 'My Events', permission: 'events' },
  { to: '/manage/checkin', label: 'Check-in', permission: 'checkin' },
  { to: '/manage/guests', label: 'Guests', permission: 'guests' },
  { to: '/manage/seating', label: 'Seating', permission: 'seating' },
  { to: '/manage/staff', label: 'Staff', permission: 'staff' },
  { to: '/manage/qr', label: 'QR Tools', permission: 'qr' },
  { to: '/manage/incidents', label: 'Incidents', permission: 'incidents' },
  { to: '/manage/waitlist', label: 'Waitlist', permission: 'waitlist' },
  { to: '/manage/analytics', label: 'Analytics', permission: 'analytics' },
  { to: '/manage/audit', label: 'Audit Trail', permission: 'audit' },
]

const operatorRoleOptions = [
  { id: 'admin', label: 'Admin' },
  { id: 'checkinLead', label: 'Check-in Lead' },
  { id: 'seatingLead', label: 'Seating Lead' },
  { id: 'staff', label: 'Staff' },
]

export default function OrganizerManagePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [operatorRole, setOperatorRole] = useState('admin')

  const selectedEventId = searchParams.get('event')
  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? events[0] ?? null,
    [events, selectedEventId],
  )
  const permissions = useMemo(() => getManageRolePermissions(operatorRole), [operatorRole])
  const visibleNavItems = useMemo(
    () => manageNavItems.filter((item) => permissions.includes(item.permission)),
    [permissions],
  )

  useEffect(() => {
    let active = true

    async function loadBootstrap() {
      setLoading(true)
      setError('')
      try {
        const payload = await getManageBootstrap()
        if (!active) return
        setEvents(payload.events)
        setOperatorRole(payload.selectedOperatorRole ?? 'admin')
      } catch {
        if (active) setError('Unable to load organizer console right now.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadBootstrap()
    return () => {
      active = false
    }
  }, [setSearchParams])

  useEffect(() => {
    if (!events.length) return
    const hasValidSelection = selectedEventId && events.some((event) => event.id === selectedEventId)
    if (hasValidSelection) return
    const fallbackId = events[0].id
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('event', fallbackId)
      return next
    }, { replace: true })
  }, [events, selectedEventId, setSearchParams])

  useEffect(() => {
    const current = manageNavItems.find((item) => item.to === location.pathname)
    if (!current) return
    if (permissions.includes(current.permission)) return
    const fallback = visibleNavItems[0]
    if (!fallback) return
    navigate(withEventSearch(fallback.to), { replace: true })
  }, [location.pathname, permissions, visibleNavItems])

  async function onSelectEvent(eventId) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('event', eventId)
      return next
    })
    await setManageSelectedEvent(eventId, { simulateLatency: false })
  }

  async function onSelectOperatorRole(nextRole) {
    setOperatorRole(nextRole)
    await setManageOperatorRole(nextRole, { simulateLatency: false })
  }

  function withEventSearch(pathname) {
    const nextParams = new URLSearchParams(searchParams)
    if (selectedEvent?.id) {
      nextParams.set('event', selectedEvent.id)
    }
    const search = nextParams.toString()
    return `${pathname}${search ? `?${search}` : ''}`
  }

  if (loading) return <PageShell><LoadingState label="Loading organizer console..." /></PageShell>
  if (error) return <PageShell><ErrorState message={error} /></PageShell>

  return (
    <PageShell className="space-y-space-4">
      <HeroBanner
        eyebrow="Organizer Console"
        title="Operate your event day in one place."
        description="Run check-in, monitor guests, and track live operations from a single organizer workspace."
        tone="dark"
      />

      <section className="grid gap-space-2 md:grid-cols-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-space-2">
          <p className="font-body text-caption-lg text-neutral-500">Active event</p>
          <select
            value={selectedEvent?.id ?? ''}
            onChange={(event) => onSelectEvent(event.target.value)}
            className="mt-space-1 h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>
        <StatChip label="Status" value={selectedEvent?.status ?? 'N/A'} />
        <StatChip label="Capacity" value={selectedEvent?.guestCapacity ?? 0} />
        <div className="rounded-xl border border-neutral-200 bg-white p-space-2">
          <p className="font-body text-caption-lg text-neutral-500">Operator role</p>
          <select
            value={operatorRole}
            onChange={(event) => onSelectOperatorRole(event.target.value)}
            className="mt-space-1 h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
          >
            {operatorRoleOptions.map((role) => (
              <option key={role.id} value={role.id}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="overflow-x-auto scrollbar-hide">
        <div className="flex min-w-max gap-space-2">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={withEventSearch(item.to)}
              className={({ isActive }) => `rounded-full px-space-3 py-space-1 font-display text-label-sm ${
                isActive || location.pathname === item.to
                  ? 'bg-info text-white'
                  : 'border border-neutral-200 bg-white text-neutral-700'
              }`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </section>

      <Outlet context={{ selectedEventId: selectedEvent?.id ?? null, selectedEvent, events, operatorRole, permissions }} />
    </PageShell>
  )
}
