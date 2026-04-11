import { useCallback, useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useSpring, animated } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import { ErrorState, LoadingState } from '@/components/ui/PageStates'
import { ManageBadge, ManageKpiTile } from '@/components/ui/ManagePrimitives'
import { ManageIcon } from '@/components/layout/ManageIcons'
import { ManageTutorial } from '@/components/ui/ManageTutorial'
import { useTutorial } from '@/hooks/useTutorial'
import { manageNavConfig } from '@/data'
import {
  getManageBootstrap,
  getManageRolePermissions,
  setManageOperatorRole,
  subscribeManageEvents,
} from '@/services'

const operatorRoleOptions = [
  { id: 'admin',       label: 'Admin' },
  { id: 'checkinLead', label: 'Check-in Lead' },
  { id: 'seatingLead', label: 'Seating Lead' },
  { id: 'staff',       label: 'Staff' },
]
const MANAGE_NAV_ORDER_KEY = 'mgmt-nav-order-v2'

// ---------------------------------------------------------------------------
// DraggableNavItem — a sidebar nav item that can be dragged to reorder
// ---------------------------------------------------------------------------
function DraggableNavItem({ item, index, isActive, linkTo, onReorder }) {
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
  const tutorial = useTutorial()
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [operatorRole, setOperatorRole] = useState('admin')
  const [bootstrapSelectedEventId, setBootstrapSelectedEventId] = useState(null)

  // Persisted sidebar module order
  const [navOrder, setNavOrder] = useState(() => {
    try {
      const saved = localStorage.getItem(MANAGE_NAV_ORDER_KEY)
      if (!saved) return null
      const parsed = JSON.parse(saved)
      return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : null
    } catch {
      return null
    }
  })

  const selectedEventIdFromUrl = searchParams.get('event')
  const resolvedSelectedEventId = useMemo(() => {
    if (selectedEventIdFromUrl && events.some((event) => event.id === selectedEventIdFromUrl)) {
      return selectedEventIdFromUrl
    }
    if (bootstrapSelectedEventId && events.some((event) => event.id === bootstrapSelectedEventId)) {
      return bootstrapSelectedEventId
    }
    return events[0]?.id ?? null
  }, [events, selectedEventIdFromUrl, bootstrapSelectedEventId])
  const selectedEvent = useMemo(
    () => events.find((event) => event.id === resolvedSelectedEventId) ?? null,
    [events, resolvedSelectedEventId],
  )
  const permissions = useMemo(() => getManageRolePermissions(operatorRole), [operatorRole])

  const visibleNavItems = useMemo(
    () => manageNavConfig.filter((item) => permissions.includes(item.permission)),
    [permissions],
  )

  const orderedNavItems = useMemo(() => {
    if (!navOrder) return visibleNavItems
    const visibleById = new Map(visibleNavItems.map((item) => [item.id, item]))
    const orderedFromSaved = navOrder.map((id) => visibleById.get(id)).filter(Boolean)
    if (!orderedFromSaved.length) return visibleNavItems
    const includedIds = new Set(orderedFromSaved.map((item) => item.id))
    const missingVisibleItems = visibleNavItems.filter((item) => !includedIds.has(item.id))
    return [...orderedFromSaved, ...missingVisibleItems]
  }, [visibleNavItems, navOrder])

  const activeModule = useMemo(
    () => visibleNavItems.find((item) => item.to === location.pathname) ?? visibleNavItems[0] ?? null,
    [location.pathname, visibleNavItems],
  )

  const refreshManageBootstrap = useCallback(async () => {
    const payload = await getManageBootstrap({ simulateLatency: false })
    setEvents(payload.events)
    setBootstrapSelectedEventId(payload.selectedEventId ?? null)
    setOperatorRole(payload.selectedOperatorRole ?? 'admin')
    return payload
  }, [])

  useEffect(() => {
    let active = true
    let unsubscribe = null
    async function loadBootstrap() {
      setLoading(true)
      setError('')
      try {
        await refreshManageBootstrap()
        unsubscribe = subscribeManageEvents({}, async () => {
          if (!active) return
          await refreshManageBootstrap()
        })
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
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [refreshManageBootstrap])

  useEffect(() => {
    if (!events.length || !resolvedSelectedEventId) return
    if (selectedEventIdFromUrl === resolvedSelectedEventId) return
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('event', resolvedSelectedEventId)
      return next
    }, { replace: true })
  }, [events, selectedEventIdFromUrl, resolvedSelectedEventId, setSearchParams])

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
    localStorage.setItem(MANAGE_NAV_ORDER_KEY, JSON.stringify(newOrder))
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
        <div className="mb-2 hidden items-center gap-space-4 md:flex">
          <span
            aria-hidden="true"
            className="h-[1px] w-32 bg-gradient-to-l from-mgmt-gold/40 via-mgmt-gold/15 to-transparent"
          />
          <button
            type="button"
            onClick={tutorial.start}
            className="flex items-center gap-1.5 rounded-lg border border-mgmt-border px-space-3 py-[7px] font-barlow text-[0.7rem] uppercase tracking-[0.14em] text-mgmt-muted transition-all duration-fast hover:border-mgmt-gold/50 hover:text-mgmt-gold"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            Tour
          </button>
        </div>
      </header>

      {/* Event & Role selectors + KPI strip */}
      <section className="mb-space-4 grid gap-space-2 md:grid-cols-4">
        {/* Active event display (read-only) */}
        <div data-tutorial="event-selector" className="rounded-xl border border-mgmt-border bg-mgmt-surface p-space-3">
          <p className="font-barlow text-label-md font-semibold uppercase tracking-[0.14em] text-mgmt-muted">
            Active Event
          </p>
          <div className="mt-space-1 flex h-10 w-full items-center rounded-md border border-mgmt-border bg-mgmt-raised px-space-3">
            <span className={`truncate font-body text-body-md font-semibold md:text-heading-sm ${selectedEvent ? 'text-mgmt-text' : 'text-mgmt-dim'}`}>
              {selectedEvent?.title ?? 'No active event selected'}
            </span>
          </div>
          <p className="mt-1 font-body text-[0.75rem] text-mgmt-dim">
            Change in My Events
          </p>
        </div>

        <ManageKpiTile label="Status" value={selectedEvent?.status ?? 'N/A'} />
        <ManageKpiTile label="Capacity" value={selectedEvent?.guestCapacity ?? 0} />

        {/* Operator role selector */}
        <div data-tutorial="role-selector" className="rounded-xl border border-mgmt-border bg-mgmt-surface p-space-3">
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

      {/* Mobile Tour FAB — visible only on mobile */}
      <button
        type="button"
        onClick={tutorial.start}
        aria-label="Start tutorial"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)', zIndex: 50 }}
        className="fixed right-4 flex h-11 w-11 items-center justify-center rounded-full border border-mgmt-border bg-mgmt-surface shadow-mgmt md:hidden"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="text-mgmt-gold">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </button>

      {/* Sidebar + content */}
      <section className="grid gap-space-3 md:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <aside data-tutorial="sidebar" className="hidden md:block">
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
          <div data-tutorial="module-bar" className="flex items-center justify-between rounded-xl border border-mgmt-border bg-mgmt-surface px-space-4 py-space-3">
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

      {/* Onboarding Tutorial */}
      <ManageTutorial
        active={tutorial.active}
        step={tutorial.step}
        onNext={tutorial.next}
        onPrev={tutorial.prev}
        onComplete={tutorial.complete}
        onDismiss={tutorial.dismiss}
      />
    </div>
  )
}
