import { useCallback, useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { HeroBanner, PageShell } from '@/components/ui/MarketplacePrimitives'
import { ErrorState, LoadingState } from '@/components/ui/PageStates'
import { ManageBadge, ManageKpiTile } from '@/components/ui/ManagePrimitives'
import { ManageIcon } from '@/components/layout/ManageIcons'
import { manageNavConfig } from '@/data'
import { getManageBootstrap, getManageRolePermissions, setManageOperatorRole, setManageSelectedEvent } from '@/services'

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
    () => manageNavConfig.filter((item) => permissions.includes(item.permission)),
    [permissions],
  )
  const activeModule = useMemo(
    () => visibleNavItems.find((item) => item.to === location.pathname) ?? visibleNavItems[0] ?? null,
    [location.pathname, visibleNavItems],
  )

  const refreshManageBootstrap = useCallback(async () => {
    const payload = await getManageBootstrap({ simulateLatency: false })
    setEvents(payload.events)
    setOperatorRole(payload.selectedOperatorRole ?? 'admin')
    return payload
  }, [])

  useEffect(() => {
    let active = true

    async function loadBootstrap() {
      setLoading(true)
      setError('')
      try {
        await refreshManageBootstrap()
        if (!active) return
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
  }, [refreshManageBootstrap])

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

  const withEventSearch = useCallback((pathname) => {
    const nextParams = new URLSearchParams(searchParams)
    if (selectedEvent?.id) {
      nextParams.set('event', selectedEvent.id)
    }
    const search = nextParams.toString()
    return `${pathname}${search ? `?${search}` : ''}`
  }, [searchParams, selectedEvent?.id])

  useEffect(() => {
    const current = manageNavConfig.find((item) => item.to === location.pathname)
    if (!current) return
    if (permissions.includes(current.permission)) return
    const fallback = visibleNavItems[0]
    if (!fallback) return
    navigate(withEventSearch(fallback.to), { replace: true })
  }, [location.pathname, permissions, visibleNavItems, navigate, withEventSearch])

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

  if (loading) return <PageShell><LoadingState label="Loading organizer console..." /></PageShell>
  if (error) return <PageShell><ErrorState message={error} /></PageShell>

  return (
    <PageShell className="space-y-space-4">
      <HeroBanner
        eyebrow="Operations Cockpit"
        title="Run event-day operations from one console."
        description="Switch modules quickly, keep critical tools visible, and coordinate your event team in real time."
        tone="dark"
      />

      <section className="grid gap-space-2 md:grid-cols-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-space-3">
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
        <ManageKpiTile label="Status" value={selectedEvent?.status ?? 'N/A'} />
        <ManageKpiTile label="Capacity" value={selectedEvent?.guestCapacity ?? 0} />
        <div className="rounded-xl border border-neutral-200 bg-white p-space-3">
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

      <section className="grid gap-space-3 md:grid-cols-[250px_1fr]">
        <aside className="hidden md:block">
          <div className="sticky top-[5.8rem] rounded-2xl border border-neutral-200 bg-white p-space-2 shadow-sm">
            <p className="px-space-2 py-space-1 font-display text-caption-lg text-neutral-500">Modules</p>
            <nav aria-label="Manage modules" className="space-y-space-1">
              {visibleNavItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={withEventSearch(item.to)}
                  className={({ isActive }) => `flex items-center gap-space-2 rounded-xl px-space-2 py-space-2 ${
                    isActive ? 'bg-info text-white' : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {({ isActive }) => (
                    <>
                      <ManageIcon id={item.id} active={isActive} />
                      <span className="font-display text-label-md">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        <div className="space-y-space-3">
          <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-space-3">
            <div className="flex items-center gap-space-2">
              <ManageIcon id={activeModule?.id ?? 'dashboard'} active />
              <p className="font-display text-heading-sm text-neutral-900">{activeModule?.label ?? 'Module'}</p>
            </div>
            <ManageBadge tone="info">{operatorRole}</ManageBadge>
          </div>
          <Outlet
            context={{
              selectedEventId: selectedEvent?.id ?? null,
              selectedEvent,
              events,
              operatorRole,
              permissions,
              refreshManageBootstrap,
            }}
          />
        </div>
      </section>
    </PageShell>
  )
}
