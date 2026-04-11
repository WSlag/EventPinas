import { useSpring, animated } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'

// ---------------------------------------------------------------------------
// KanbanBoard — horizontal scroll container
// ---------------------------------------------------------------------------
export function KanbanBoard({ children }) {
  return (
    <div className="-mx-space-4 flex gap-space-3 overflow-x-auto px-space-4 pb-space-4 snap-x snap-mandatory scrollbar-hide">
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// KanbanColumn — labeled status column with card stack
// ---------------------------------------------------------------------------
export function KanbanColumn({ id, label, count, accentColor, children, isOver = false, colRef }) {
  return (
    <div
      ref={colRef}
      data-column-id={id}
      className={`flex w-72 flex-shrink-0 snap-start flex-col rounded-xl border transition-colors duration-fast ${
        isOver
          ? 'border-mgmt-gold/50 bg-gradient-accent-tint'
          : 'border-mgmt-border bg-mgmt-surface'
      }`}
    >
      {/* Column header */}
      <div className={`flex items-center justify-between border-b px-space-3 py-space-2 ${isOver ? 'border-mgmt-gold/30 bg-gradient-accent-tint' : 'border-mgmt-border'}`}>
        <div className="flex items-center gap-space-2">
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
          <p className="font-barlow text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-mgmt-muted">
            {label}
          </p>
        </div>
        <span className="font-playfair text-[1rem] font-bold text-mgmt-gold">{count}</span>
      </div>
      {/* Card stack */}
      <div className="flex flex-col gap-space-2 p-space-2 min-h-32">
        {children}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// KanbanDragCard — draggable card with react-spring + useDrag
//
// Props:
//   id             — unique card identifier
//   currentColumnId — which column this card currently lives in
//   onDrop(id, targetColumnId) — called when dropped onto a different column
//   columnRefs     — Map<columnId, React.RefObject<HTMLElement>>
//   children       — card content
// ---------------------------------------------------------------------------
export function KanbanDragCard({ id, children, currentColumnId, onDrop, columnRefs }) {
  const [spring, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
    zIndex: 0,
    opacity: 1,
    config: { mass: 1, tension: 300, friction: 30 },
  }))

  const bind = useDrag(
    ({ active, movement: [mx, my], xy: [cx, cy], last }) => {
      if (active) {
        api.start({
          x: mx,
          y: my,
          scale: 1.06,
          zIndex: 50,
          opacity: 0.92,
          immediate: (key) => key === 'zIndex',
        })
      }
      if (last) {
        // Hit-test: find which column the pointer is over
        let targetColumnId = null
        columnRefs.forEach((ref, colId) => {
          if (!ref.current) return
          const rect = ref.current.getBoundingClientRect()
          if (
            cx >= rect.left &&
            cx <= rect.right &&
            cy >= rect.top &&
            cy <= rect.bottom
          ) {
            targetColumnId = colId
          }
        })

        api.start({ x: 0, y: 0, scale: 1, zIndex: 0, opacity: 1 })

        if (targetColumnId && targetColumnId !== currentColumnId) {
          onDrop(id, targetColumnId)
        }
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
        opacity: spring.opacity,
        position: 'relative',
        touchAction: 'none',
      }}
    >
      {children}
    </animated.div>
  )
}

// ---------------------------------------------------------------------------
// KanbanCard — visual card surface (use inside KanbanDragCard)
// ---------------------------------------------------------------------------
export function KanbanCard({ children, className = '' }) {
  return (
    <div
      className={`relative cursor-grab overflow-hidden rounded-lg border border-mgmt-border bg-mgmt-surface p-space-3 transition-shadow duration-fast active:cursor-grabbing hover:border-mgmt-gold/40 hover:shadow-gold ${className}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-6 w-6 rounded-tl-lg border-l-2 border-t-2 border-mgmt-gold/25"
      />
      {children}
    </div>
  )
}
