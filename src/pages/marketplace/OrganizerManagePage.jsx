import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useSpring, animated } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import { ErrorState, LoadingState } from '@/components/ui/PageStates'
import { ManageBadge, ManageKpiTile } from '@/components/ui/ManagePrimitives'
import { ManageIcon } from '@/components/layout/ManageIcons'
import { manageNavConfig } from '@/data'
import { getManageBootstrap, getManageRolePermissions, setManageOperatorRole, setManageSelectedEvent } from '@/services'

const operatorRoleOptions = [
  { id: 'admin',       label: 'Admin' },
  { id: 'checkinLead', label: 'Check-in Lead' },
  { id: 'seatingLead', label: 'Seating Lead' },
  { id: 'staff',       label: 'Staff' },
]

// ---------------------------------------------------------------------------
// DraggableNavItem — a sidebar nav item that can be dragged to reorder
// ---------------------------------------------------------------------------
function DraggableNavItem({ item, index, isActive, linkTo, total, onReorder }) {
  const [spring, api] = useSpring(() => ({ y: 0, scale: 1, zIndex: 0, shadow: 0 }))
  const itemHeight = 40 // approx px height of each nav item

  const bind = useDrag(
    ({ active, movement: [, my], last }) => {
      if (active) {
        api.start({
          y: my,
          scale: 1.03,
          zIndex: 20,
          shadow: 8,
          immediate: (key) => key === 'zIndex',
        })
      }
      if (last) {
        const delta = Math.round(my / itemHeight)
        api.start({ y: 0, scale: 1, zIndex: 0, shadow: 0 })
        if (delta !== 0) onReorder(index, index + delta)
      }
    },
    { axis: 'y', filterTaps: true },
  )

  return (
    <animated.div
      {...bind()}
      style={{
        y: spring.y,
        scale: spring.scale,
        zIndex: spring.zIndex,
        boxShadow: spring.shadow.to((s) => (s > 0 ? `0 ${s}px 20px rgba(255,107,74,0.20)` : 'none')),
        position: 'relative',
        touchAction: 'none',
      }}
    >
      <NavLink
        to={linkTo}
        className={() =>
          `flex cursor-grab items-center gap-space-2 rounded-lg border-l-2 px-space-2 py-[9px] transition-all duration-fast active:cursor-grabbing ${
            isActive
              ? 'border-l-mgmt-gold bg-gradient-accent-tint text-mgmt-gold'
              : 'border-l-transparent text-mgmt-muted hover:bg-mgmt-raised hover:text-mgmt-text'
          }`
        }
      >
        <ManageIcon id={item.id} active={isActive} />
        <span className="font-barlow text-[0.875rem] font-semibold uppercase tracking-[0.05em]">
          {item.label}
        </span>
      </NavLink>
    </animated.div>
  )
}

// ---------------------------------------------------------------------------
// OrganizerManagePage — main shell
// ---------------------------------------------------------------------------
export default function OrganizerManagePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [operatorRole, setOperatorRole] = useState('admin')

  // Persisted sidebar module order
  const [navOrder, setNavOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('mgmt-nav-order')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

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

  const orderedNavItems = useMemo(() => {
    if (!navOrder) return visibleNavItems
    return [...visibleNavItems].sort((a, b) => {
      const ai = navOrder.indexOf(a.id)
      const bi = navOrder.indexOf(b.id)
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
  }, [visibleNavItems, navOrder])

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
    return () => { active = false }
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
    if (selectedEvent?.id) nextParams.set('event', selectedEvent.id)
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

  function handleReorder(fromIndex, toIndex) {
    const clamped = Math.max(0, Math.min(orderedNavItems.length - 1, toIndex))
    if (clamped === fromIndex) return
    const next = [...orderedNavItems]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(clamped, 0, moved)
    const newOrder = next.map((item) => item.id)
    setNavOrder(newOrder)
    localStorage.setItem('mgmt-nav-order', JSON.stringify(newOrder))
  }

  if (loading) {
    return (
      <div className="mgmt-console min-h-screen bg-mgmt-bg p-space-8">
        <LoadingState label="Loading organizer console..." />
      </div>
    )
  }
  if (error) {
    return (
      <div className="mgmt-console min-h-screen bg-mgmt-bg p-space-8">
        <ErrorState message={error} />
      </div>
    )
  }

  return (
    <div className="mgmt-console min-h-screen bg-mgmt-bg px-space-4 py-space-6 md:px-space-8">

      {/* Art Deco console header */}
      <header className="mb-space-6 flex items-end justify-between border-b border-mgmt-border pb-space-4">
        <div>
          <p className="font-barlow text-overline uppercase tracking-[0.2em] text-mgmt-gold">
            Operations Cockpit
          </p>
          <h1 className="mt-space-1 font-playfair text-display-lg font-bold text-mgmt-text">
            Event Console
          </h1>
        </div>
        <span
          aria-hidden="true"
          className="mb-2 hidden h-[1px] w-48 bg-gradient-to-l from-mgmt-gold/40 via-mgmt-gold/15 to-transparent md:block"
        />
      </header>

      {/* Event & Role selectors + KPI strip */}
      <section className="mb-space-4 grid gap-space-2 md:grid-cols-4">
        {/* Active event selector */}
        <div className="rounded-xl border border-mgmt-border bg-mgmt-surface p-space-3">
          <p className="font-barlow text-[0.75rem] uppercase tracking-[0.12em] text-mgmt-muted">
            Active Event
          </p>
          <select
            value={selectedEvent?.id ?? ''}
            onChange={(e) => onSelectEvent(e.target.value)}
            className="mt-space-1 h-10 w-full rounded-md border border-mgmt-border bg-mgmt-raised px-space-3 font-body text-body-sm text-mgmt-text focus:border-mgmt-gold/60 focus:outline-none focus:ring-1 focus:ring-mgmt-gold/30"
          >
            {events.map((event) => (
              <option key={event.id} value={event.id} className="bg-mgmt-raised">
                {event.title}
              </option>
            ))}
          </select>
        </div>

        <ManageKpiTile label="Status" value={selectedEvent?.status ?? 'N/A'} />
        <ManageKpiTile label="Capacity" value={selectedEvent?.guestCapacity ?? 0} />

        {/* Operator role selector */}
        <div className="rounded-xl border border-mgmt-border bg-mgmt-surface p-space-3">
          <p className="font-barlow text-[0.75rem] uppercase tracking-[0.12em] text-mgmt-muted">
            Operator Role
          </p>
          <select
            value={operatorRole}
            onChange={(e) => onSelectOperatorRole(e.target.value)}
            className="mt-space-1 h-10 w-full rounded-md border border-mgmt-border bg-mgmt-raised px-space-3 font-body text-body-sm text-mgmt-text focus:border-mgmt-gold/60 focus:outline-none focus:ring-1 focus:ring-mgmt-gold/30"
          >
            {operatorRoleOptions.map((role) => (
              <option key={role.id} value={role.id} className="bg-mgmt-raised">
                {role.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Sidebar + content */}
      <section className="grid gap-space-3 md:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <aside className="hidden md:block">
          <div className="sticky top-[5.8rem] rounded-xl border border-l-2 border-mgmt-border border-l-mgmt-gold/40 bg-mgmt-surface p-space-2 shadow-mgmt">
            <p className="px-space-2 py-space-1 font-barlow text-[0.7rem] uppercase tracking-[0.18em] text-mgmt-gold">
              Modules
            </p>
            <nav aria-label="Manage modules" className="mt-space-1 space-y-[2px]">
              {orderedNavItems.map((item, index) => {
                const isActive = item.to === location.pathname
                return (
                  <DraggableNavItem
                    key={item.id}
                    item={item}
                    index={index}
                    total={orderedNavItems.length}
                    isActive={isActive}
                    linkTo={withEventSearch(item.to)}
                    onReorder={handleReorder}
                  />
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="space-y-space-3">
          {/* Active module header bar */}
          <div className="flex items-center justify-between rounded-xl border border-mgmt-border bg-mgmt-surface px-space-4 py-space-3">
            <div className="flex items-center gap-space-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-accent-tint text-mgmt-gold">
                <ManageIcon id={activeModule?.id ?? 'dashboard'} active />
              </span>
              <p className="font-playfair text-heading-sm font-bold text-mgmt-text">
                {activeModule?.label ?? 'Module'}
              </p>
            </div>
            <ManageBadge tone="neutral">{operatorRole}</ManageBadge>
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
    </div>
  )
}
