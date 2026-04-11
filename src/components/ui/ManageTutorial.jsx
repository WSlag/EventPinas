import { useEffect, useState } from 'react'
import { useDrag } from '@use-gesture/react'

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------
const STEPS = [
  {
    id: 'welcome',
    desktopTarget: null,
    mobileTarget: null,
    desktopPosition: 'center',
    title: 'Welcome to Operations Cockpit',
    body: "Your event command center is ready. Let's take a quick 60-second tour so you know where everything lives.",
  },
  {
    id: 'sidebar',
    desktopTarget: '[data-tutorial="sidebar"]',
    mobileTarget: '[data-tutorial="module-bar"]',
    desktopPosition: 'right',
    title: 'Module Navigation',
    body: 'Switch between all management modules — Check-in, Guests, Seating, Analytics, Staff, and more. On desktop, drag modules to reorder them.',
  },
  {
    id: 'event-selector',
    desktopTarget: '[data-tutorial="event-selector"]',
    mobileTarget: '[data-tutorial="event-selector"]',
    desktopPosition: 'bottom',
    title: 'Active Event',
    body: "This shows which event you're currently managing. To switch events, go to My Events from the main menu.",
  },
  {
    id: 'role-selector',
    desktopTarget: '[data-tutorial="role-selector"]',
    mobileTarget: '[data-tutorial="role-selector"]',
    desktopPosition: 'bottom',
    title: 'Operator Role',
    body: 'Select your team role. Admin sees all modules. Check-in Lead, Seating Lead, and Staff get a focused tool set matching their responsibilities.',
  },
  {
    id: 'kpi-tiles',
    desktopTarget: '[data-tutorial="kpi-tiles"]',
    mobileTarget: '[data-tutorial="kpi-tiles"]',
    desktopPosition: 'bottom',
    title: 'Live Metrics',
    body: 'Your event KPIs — guests, check-in rate, walk-ins, incidents — all update in real-time. Drag tiles to arrange them in the order that matters most.',
  },
  {
    id: 'seating-snapshot',
    desktopTarget: '[data-tutorial="seating-snapshot"]',
    mobileTarget: '[data-tutorial="seating-snapshot"]',
    desktopPosition: 'top',
    title: 'Seating Snapshot',
    body: 'Monitor table occupancy and available seats at a glance. Head to the Seating module for full drag-to-assign control.',
  },
  {
    id: 'recent-checkins',
    desktopTarget: '[data-tutorial="recent-checkins"]',
    mobileTarget: '[data-tutorial="recent-checkins"]',
    desktopPosition: 'top',
    title: 'Recent Check-ins',
    body: 'Live attendance feed from the gate. Watch guests arrive in real-time, then jump to the Check-in module for QR scanning and manual registration.',
  },
  {
    id: 'done',
    desktopTarget: null,
    mobileTarget: null,
    desktopPosition: 'center',
    title: "You're all set!",
    body: 'Explore each module at your own pace. Click the Tour button in the header anytime to replay this walkthrough.',
  },
]

// ---------------------------------------------------------------------------
// useIsMobile
// ---------------------------------------------------------------------------
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    function onResize() { setIsMobile(window.innerWidth < 768) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return isMobile
}

// ---------------------------------------------------------------------------
// useSpotlightRect — clears immediately on step change, scrolls, then measures
// ---------------------------------------------------------------------------
function useSpotlightRect(selector, step) {
  const [rect, setRect] = useState(null)

  useEffect(() => {
    setRect(null) // clear immediately so old spotlight never bleeds into new step
    if (!selector) return

    let scrollTimer = null
    let debounceTimer = null

    function measure() {
      const el = document.querySelector(selector)
      if (!el) return
      setRect(el.getBoundingClientRect())
    }

    const el = document.querySelector(selector)
    if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    scrollTimer = setTimeout(measure, 300)

    function onResize() {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(measure, 100)
    }
    function onScroll() {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(measure, 80)
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, true)

    return () => {
      clearTimeout(scrollTimer)
      clearTimeout(debounceTimer)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [selector, step])

  return rect
}

// ---------------------------------------------------------------------------
// SpotlightSVG — single SVG layer, hole reveals actual page content
// ---------------------------------------------------------------------------
function SpotlightSVG({ rect }) {
  const [dims, setDims] = useState({ vw: window.innerWidth, vh: window.innerHeight })
  const [glowVisible, setGlowVisible] = useState(false)

  useEffect(() => {
    function onResize() { setDims({ vw: window.innerWidth, vh: window.innerHeight }) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    setGlowVisible(false)
    if (!rect) return
    const t = setTimeout(() => setGlowVisible(true), 80)
    return () => clearTimeout(t)
  }, [rect])

  const { vw, vh } = dims
  const padding = vw < 768 ? 10 : 12
  const r = 14

  if (!rect) {
    return (
      <svg
        className="pointer-events-none fixed inset-0"
        width={vw}
        height={vh}
        style={{ zIndex: 9990 }}
        aria-hidden="true"
      >
        <rect width={vw} height={vh} fill="rgba(10,14,28,0.82)" />
      </svg>
    )
  }

  const x = rect.left - padding
  const y = rect.top - padding
  const w = rect.width + padding * 2
  const h = rect.height + padding * 2

  const holePath = [
    `M ${x + r} ${y}`,
    `H ${x + w - r}`,
    `Q ${x + w} ${y} ${x + w} ${y + r}`,
    `V ${y + h - r}`,
    `Q ${x + w} ${y + h} ${x + w - r} ${y + h}`,
    `H ${x + r}`,
    `Q ${x} ${y + h} ${x} ${y + h - r}`,
    `V ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    'Z',
  ].join(' ')

  return (
    <svg
      className="pointer-events-none fixed inset-0"
      width={vw}
      height={vh}
      style={{ zIndex: 9990 }}
      aria-hidden="true"
    >
      <path
        d={`M 0 0 H ${vw} V ${vh} H 0 Z ${holePath}`}
        fill="rgba(10,14,28,0.82)"
        fillRule="evenodd"
      />
      <rect
        x={x} y={y} width={w} height={h}
        rx={r}
        fill="none"
        stroke="rgba(255,107,74,0.65)"
        strokeWidth="2"
        style={{ opacity: glowVisible ? 1 : 0, transition: 'opacity 280ms ease' }}
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// ArtDecoCorners
// ---------------------------------------------------------------------------
function ArtDecoCorners() {
  const s = { background: 'rgba(255,107,74,0.45)' }
  return (
    <>
      <span className="pointer-events-none absolute left-2 top-2 h-4 w-4">
        <span className="absolute left-0 top-0 h-[2px] w-full" style={s} />
        <span className="absolute left-0 top-0 h-full w-[2px]" style={s} />
      </span>
      <span className="pointer-events-none absolute right-2 top-2 h-4 w-4">
        <span className="absolute right-0 top-0 h-[2px] w-full" style={s} />
        <span className="absolute right-0 top-0 h-full w-[2px]" style={s} />
      </span>
      <span className="pointer-events-none absolute bottom-2 left-2 h-4 w-4">
        <span className="absolute bottom-0 left-0 h-[2px] w-full" style={s} />
        <span className="absolute bottom-0 left-0 h-full w-[2px]" style={s} />
      </span>
      <span className="pointer-events-none absolute bottom-2 right-2 h-4 w-4">
        <span className="absolute bottom-0 right-0 h-[2px] w-full" style={s} />
        <span className="absolute bottom-0 right-0 h-full w-[2px]" style={s} />
      </span>
    </>
  )
}

// ---------------------------------------------------------------------------
// StepDots
// ---------------------------------------------------------------------------
function StepDots({ step, total }) {
  return (
    <div className="flex items-center gap-[5px]" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`inline-block rounded-full transition-all duration-300 ${
            i < step
              ? 'h-1.5 w-1.5 bg-mgmt-gold/35'
              : i === step
              ? 'h-1.5 w-5 bg-mgmt-gold'
              : 'h-1.5 w-1.5 bg-mgmt-border-bright'
          }`}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// CardContent — shared interior
// ---------------------------------------------------------------------------
function CardContent({ stepData, step, total, onNext, onPrev, onDismiss }) {
  const isFirst = step === 0
  const isLast = step === total - 1

  return (
    <div className="relative px-space-5 pb-space-5 pt-space-4">
      <ArtDecoCorners />

      {/* Header row */}
      <div className="mb-space-3 flex items-center justify-between">
        <div className="flex items-center gap-space-2">
          <span aria-hidden="true" className="inline-block h-[5px] w-[5px] rotate-45 bg-mgmt-gold" />
          <span className="font-barlow text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-mgmt-gold">
            Step {step + 1} / {total}
          </span>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Skip tutorial"
          className="font-barlow text-[0.68rem] uppercase tracking-[0.1em] text-mgmt-dim transition-colors hover:text-mgmt-muted"
        >
          Skip ✕
        </button>
      </div>

      {/* Title */}
      <h2 className="font-playfair text-[1.0625rem] font-bold leading-snug text-mgmt-text">
        {stepData.title}
      </h2>

      {/* Body */}
      <p className="mt-space-2 font-body text-[0.875rem] leading-relaxed text-mgmt-muted">
        {stepData.body}
      </p>

      {/* Progress dots */}
      <div className="mt-space-3">
        <StepDots step={step} total={total} />
      </div>

      {/* Divider */}
      <div className="my-space-3 h-[1px] bg-mgmt-border" />

      {/* Footer */}
      <div className="flex items-center justify-between gap-space-3">
        {!isFirst ? (
          <button
            type="button"
            onClick={onPrev}
            className="font-barlow text-[0.775rem] uppercase tracking-[0.1em] text-mgmt-muted transition-colors hover:text-mgmt-text"
          >
            ← Back
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-1.5 rounded-lg bg-mgmt-gold px-space-4 py-[9px] font-barlow text-[0.775rem] font-semibold uppercase tracking-[0.1em] text-white shadow-primary transition-all duration-fast hover:brightness-110 active:scale-[0.97]"
        >
          {isLast ? (
            <>
              Finish
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </>
          ) : (
            <>{step === 0 ? "Let's go" : 'Next step'} →</>
          )}
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// DesktopCard — CSS fade-up animation, no Spring
// ---------------------------------------------------------------------------
const CARD_W = 340
const CARD_H_EST = 252

function computeDesktopPosition(rect, position) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const pad = 16

  // Center — use computed pixels to avoid transform conflicts
  if (!rect || position === 'center') {
    return {
      top:  Math.round(vh / 2 - CARD_H_EST / 2),
      left: Math.round(vw / 2 - CARD_W / 2),
    }
  }

  let top, left

  if (position === 'right') {
    top  = rect.top + rect.height / 2 - CARD_H_EST / 2
    left = rect.right + 20
  } else if (position === 'bottom') {
    top  = rect.bottom + 20
    left = rect.left + rect.width / 2 - CARD_W / 2
  } else if (position === 'top') {
    top  = rect.top - CARD_H_EST - 20
    left = rect.left + rect.width / 2 - CARD_W / 2
  } else {
    top  = rect.bottom + 20
    left = rect.left + rect.width / 2 - CARD_W / 2
  }

  return {
    top:  Math.max(pad, Math.min(vh - CARD_H_EST - pad, top)),
    left: Math.max(pad, Math.min(vw - CARD_W - pad, left)),
  }
}

function DesktopCard({ stepData, rect, step, total, onNext, onPrev, onDismiss }) {
  const { top, left } = computeDesktopPosition(rect, stepData.desktopPosition)

  return (
    <div
      className="tutorial-card-enter overflow-hidden rounded-2xl border border-mgmt-border-bright bg-mgmt-surface shadow-[0_8px_48px_rgba(10,14,28,0.45)]"
      style={{ position: 'fixed', top, left, width: CARD_W, zIndex: 9995 }}
    >
      <CardContent
        stepData={stepData}
        step={step}
        total={total}
        onNext={onNext}
        onPrev={onPrev}
        onDismiss={onDismiss}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// MobileBottomSheet — CSS slide-up animation; Spring only for drag-to-dismiss
// ---------------------------------------------------------------------------
function MobileBottomSheet({ stepData, step, total, onNext, onPrev, onDismiss }) {
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const bind = useDrag(
    ({ swipe: [sx], movement: [, my], last, first }) => {
      if (first) setIsDragging(true)
      // Horizontal swipe → navigate
      if (sx === -1) { setIsDragging(false); onNext(); return }
      if (sx === 1)  { setIsDragging(false); onPrev(); return }
      // Vertical drag-down → track position
      const clampedY = Math.max(0, my)
      setDragY(clampedY)
      if (last) {
        setIsDragging(false)
        if (clampedY > 90) {
          onDismiss()
        } else {
          setDragY(0)
        }
      }
    },
    {
      swipe: { distance: [40, 40], velocity: [0.3, 0.3] },
      axis: 'lock',
      filterTaps: true,
    },
  )

  return (
    <div
      {...bind()}
      className={`${isDragging ? '' : 'tutorial-sheet-enter'} fixed bottom-0 left-0 right-0 overflow-hidden rounded-t-2xl border border-b-0 border-mgmt-border-bright bg-mgmt-surface shadow-[0_-8px_48px_rgba(10,14,28,0.35)]`}
      style={{
        zIndex: 9995,
        paddingBottom: 'env(safe-area-inset-bottom)',
        touchAction: 'none',
        transform: isDragging ? `translateY(${dragY}px)` : undefined,
        transition: isDragging ? 'none' : 'transform 0.25s ease',
      }}
    >
      {/* Drag handle */}
      <div className="flex justify-center pb-1 pt-3" aria-hidden="true">
        <span className="h-[3px] w-10 rounded-full bg-mgmt-border" />
      </div>

      <div className="max-h-[58vh] overflow-y-auto">
        <CardContent
          stepData={stepData}
          step={step}
          total={total}
          onNext={onNext}
          onPrev={onPrev}
          onDismiss={onDismiss}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ManageTutorial — main export
// ---------------------------------------------------------------------------
export function ManageTutorial({ active, step, onNext, onPrev, onComplete, onDismiss }) {
  const isMobile = useIsMobile()
  const stepData = STEPS[step] ?? STEPS[0]
  const selector = isMobile ? stepData.mobileTarget : stepData.desktopTarget
  const rect = useSpotlightRect(selector, step)

  const total = STEPS.length
  const isLast = step === total - 1

  // ESC to dismiss
  useEffect(() => {
    if (!active) return
    function onKeyDown(e) {
      if (e.key === 'Escape') { e.preventDefault(); onDismiss() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [active, onDismiss])

  // Lock body scroll on mobile
  useEffect(() => {
    if (!active || !isMobile) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [active, isMobile])

  if (!active) return null

  function handleNext() {
    if (isLast) { onComplete() } else { onNext(total) }
  }

  const cardProps = { stepData, rect, step, total, onNext: handleNext, onPrev, onDismiss }

  return (
    <>
      {/* Click-blocker — stops page interactions during tour */}
      <div className="fixed inset-0" style={{ zIndex: 9988 }} aria-hidden="true" />

      <SpotlightSVG rect={rect} />

      {/* key={step} remounts the card on every step → re-triggers CSS animation */}
      {isMobile
        ? <MobileBottomSheet key={step} {...cardProps} />
        : <DesktopCard key={step} {...cardProps} />
      }
    </>
  )
}
