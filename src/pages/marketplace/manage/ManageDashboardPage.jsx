import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useSpring, animated } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import { LoadingState, ErrorState } from '@/components/ui/PageStates'
import { ManageCard, ManageSectionHeader, TiltCard } from '@/components/ui/ManagePrimitives'
import { getManageDashboard, listRecentCheckIns } from '@/services'

function formatCheckInTime(iso) {
  if (!iso) return 'Just now'
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const KPI_TILES = [
  { id: 'totalGuests',    label: 'Total Guests',    getValue: (d) => d.totalGuests },
  { id: 'checkedIn',      label: 'Checked In',      getValue: (d) => d.checkedIn },
  { id: 'pending',        label: 'Pending',         getValue: (d) => d.pending },
  { id: 'walkIns',        label: 'Walk-ins',        getValue: (d) => d.walkIns },
  { id: 'checkInRate',    label: 'Check-in Rate',   getValue: (d) => `${d.checkInRate}%` },
  { id: 'openIncidents',  label: 'Open Incidents',  getValue: (d) => d.openIncidents },
]

const TILE_W = 160  // approx min-width for hit-testing
const TILE_H = 104  // approx height for hit-testing

// ---------------------------------------------------------------------------
// DraggableKpiTile — animated KPI tile with drag-to-reorder
// ---------------------------------------------------------------------------
function DraggableKpiTile({ label, value, index, onReorder }) {
  const [spring, api] = useSpring(() => ({
    x: 0, y: 0, scale: 1, zIndex: 0, shadow: 0,
    config: { mass: 1, tension: 300, friction: 30 },
  }))

  const bind = useDrag(
    ({ active, movement: [mx, my], last }) => {
      if (active) {
        api.start({
          x: mx, y: my, scale: 1.06, zIndex: 40, shadow: 12,
          immediate: (key) => key === 'zIndex',
        })
      }
      if (last) {
        const deltaCol = Math.round(mx / TILE_W)
        const deltaRow = Math.round(my / TILE_H)
        const cols = window.innerWidth >= 768 ? 6 : 2
        const delta = deltaRow * cols + deltaCol
        api.start({ x: 0, y: 0, scale: 1, zIndex: 0, shadow: 0 })
        if (delta !== 0) onReorder(index, index + delta)
      }
    },
    { filterTaps: true },
  )

  return (
    <animated.div
      {...bind()}
      style={{
        x: spring.x,
        y: spring.y,
        scale: spring.scale,
        zIndex: spring.zIndex,
        boxShadow: spring.shadow.to((s) =>
          s > 0 ? `0 ${s}px 32px rgba(255,107,74,0.22)` : 'none',
        ),
        position: 'relative',
        touchAction: 'none',
        cursor: 'grab',
      }}
    >
      <div className="relative cursor-grab overflow-hidden rounded-xl border border-mgmt-border bg-mgmt-surface p-space-4 active:cursor-grabbing">
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-accent-tint" />
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-accent-h"
        />
        <p className="font-playfair text-[2.5rem] font-bold leading-none tracking-tight text-mgmt-text select-none">
          {value}
        </p>
        <p className="mt-space-2 font-barlow text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-mgmt-muted select-none">
          {label}
        </p>
      </div>
    </animated.div>
  )
}

// ---------------------------------------------------------------------------
// ManageDashboardPage
// ---------------------------------------------------------------------------
export default function ManageDashboardPage() {
  const { selectedEventId, permissions } = useOutletContext()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dashboard, setDashboard] = useState(null)
  const [recentCheckIns, setRecentCheckIns] = useState([])
  const [tileOrder, setTileOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('mgmt-dashboard-tile-order')
      return saved ? JSON.parse(saved) : KPI_TILES.map((t) => t.id)
    } catch {
      return KPI_TILES.map((t) => t.id)
    }
  })

  const canAccessDashboard = permissions.includes('dashboard')

  useEffect(() => {
    if (!selectedEventId || !canAccessDashboard) {
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
    return () => { active = false }
  }, [selectedEventId, canAccessDashboard])

  function handleReorder(fromIndex, toIndex) {
    const clamped = Math.max(0, Math.min(tileOrder.length - 1, toIndex))
    if (clamped === fromIndex) return
    const next = [...tileOrder]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(clamped, 0, moved)
    setTileOrder(next)
    localStorage.setItem('mgmt-dashboard-tile-order', JSON.stringify(next))
  }

  if (loading) return <LoadingState label="Loading dashboard metrics..." />
  if (!canAccessDashboard) return <ErrorState message="Your current role has no dashboard permission." />
  if (error) return <ErrorState message={error} />
  if (!dashboard) return <ErrorState message="No dashboard data found for this event." />

  const orderedTiles = tileOrder
    .map((id) => KPI_TILES.find((t) => t.id === id))
    .filter(Boolean)

  return (
    <div className="space-y-space-4">
      {/* Draggable KPI grid */}
      <section>
        <p className="mb-space-2 font-barlow text-[0.7rem] uppercase tracking-[0.18em] text-mgmt-dim">
          Drag tiles to reorder
        </p>
        <div className="grid grid-cols-2 gap-space-2 md:grid-cols-6">
          {orderedTiles.map((tile, index) => (
            <DraggableKpiTile
              key={tile.id}
              label={tile.label}
              value={tile.getValue(dashboard)}
              index={index}
              onReorder={handleReorder}
            />
          ))}
        </div>
      </section>

      {/* Seating Snapshot */}
      <section className="space-y-space-2">
        <ManageSectionHeader
          title="Seating Snapshot"
          subtitle="Current table occupancy and available seats."
        />
        <div className="grid gap-space-2 md:grid-cols-3">
          {dashboard.tableSummary.map((table) => (
            <TiltCard key={table.id}>
              <ManageCard>
                <p className="font-playfair text-heading-sm font-bold text-mgmt-text">{table.label}</p>
                <p className="mt-space-1 font-body text-body-sm text-mgmt-muted">
                  {table.seated} / {table.capacity} seated
                </p>
                <p className="font-barlow text-[0.8125rem] uppercase tracking-wide text-secondary-600">
                  {table.available} available
                </p>
              </ManageCard>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* Recent Check-ins */}
      <section className="space-y-space-2">
        <ManageSectionHeader
          title="Recent Check-ins"
          subtitle="Latest attendance activity from the gate."
        />
        <ManageCard>
          {recentCheckIns.length === 0 && (
            <p className="font-body text-body-sm text-mgmt-muted">No check-ins yet for this event.</p>
          )}
          {recentCheckIns.length > 0 && (
            <ul className="space-y-space-2">
              {recentCheckIns.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between border-b border-mgmt-border pb-space-2 last:border-b-0"
                >
                  <div>
                    <p className="font-barlow text-[0.9375rem] font-semibold uppercase tracking-wide text-mgmt-text">
                      {entry.name}
                    </p>
                    <p className="font-body text-caption-lg text-mgmt-muted">
                      {entry.ticketType} · {entry.source}
                    </p>
                  </div>
                  <span className="font-barlow text-[0.8125rem] tracking-wide text-mgmt-dim">
                    {formatCheckInTime(entry.checkedInAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </ManageCard>
      </section>
    </div>
  )
}
