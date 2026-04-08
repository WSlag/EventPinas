import { useEffect, useRef } from 'react'
import { useSpring, animated } from '@react-spring/web'
import { useMove, useHover } from '@use-gesture/react'

// ---------------------------------------------------------------------------
// TiltCard — 3D tilt effect driven by useMove + react-spring
// ---------------------------------------------------------------------------
export function TiltCard({ children, className = '', maxTilt = 5 }) {
  const ref = useRef(null)
  const [spring, api] = useSpring(() => ({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    config: { mass: 1, tension: 280, friction: 60 },
  }))

  const bindMove = useMove(({ xy: [px, py] }) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (px - rect.left - rect.width / 2) / (rect.width / 2)
    const y = (py - rect.top - rect.height / 2) / (rect.height / 2)
    api.start({ rotateX: -y * maxTilt, rotateY: x * maxTilt, scale: 1.02 })
  })

  const bindHover = useHover(({ hovering }) => {
    if (!hovering) api.start({ rotateX: 0, rotateY: 0, scale: 1 })
  })

  return (
    <animated.div
      ref={ref}
      {...bindMove()}
      {...bindHover()}
      className={className}
      style={{
        rotateX: spring.rotateX,
        rotateY: spring.rotateY,
        scale: spring.scale,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {children}
    </animated.div>
  )
}

// ---------------------------------------------------------------------------
// ManageSectionHeader
// ---------------------------------------------------------------------------
export function ManageSectionHeader({ title, subtitle, actions = null }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-space-2">
      <div className="flex items-start gap-space-3">
        <span
          aria-hidden="true"
          className="mt-1 block min-h-6 w-[3px] self-stretch rounded-full bg-gradient-accent-v"
        />
        <div>
          <h2 className="font-playfair text-heading-xl font-bold text-mgmt-text">{title}</h2>
          {subtitle && (
            <p className="mt-space-1 font-body text-body-sm text-mgmt-muted">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-space-2">{actions}</div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ManageCard — Art Deco corner bracket ornaments
// ---------------------------------------------------------------------------
export function ManageCard({ children, className = '' }) {
  return (
    <article
      className={`relative overflow-hidden rounded-xl border border-mgmt-border bg-mgmt-surface p-space-4 shadow-mgmt ${className}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-8 w-8 rounded-tl-xl border-l-2 border-t-2 border-mgmt-gold/30"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-8 w-8 rounded-br-xl border-b-2 border-r-2 border-mgmt-gold/30"
      />
      {children}
    </article>
  )
}

// ---------------------------------------------------------------------------
// ManageFilterBar
// ---------------------------------------------------------------------------
export function ManageFilterBar({ children, className = '' }) {
  return (
    <div
      className={`rounded-xl border border-mgmt-border border-t-mgmt-gold/20 bg-mgmt-raised p-space-3 shadow-mgmt ${className}`}
    >
      <div className="flex flex-wrap items-center gap-space-2">{children}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ManageButton
// ---------------------------------------------------------------------------
export function ManageButton({
  type = 'button',
  variant = 'primary',
  children,
  className = '',
  ...props
}) {
  const variants = {
    primary:
      'bg-primary-400 text-white hover:bg-primary-500 shadow-primary',
    secondary:
      'border border-mgmt-border bg-mgmt-raised text-mgmt-text hover:border-mgmt-gold/50 hover:text-mgmt-gold',
    ghost:
      'border border-mgmt-gold/50 bg-transparent text-mgmt-gold hover:bg-gradient-accent-tint hover:border-mgmt-gold',
    danger:
      'bg-error text-white hover:bg-error/90',
  }

  return (
    <button
      type={type}
      className={`min-h-10 rounded-full px-space-4 py-space-2 font-barlow text-[0.875rem] font-semibold uppercase tracking-[0.05em] transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mgmt-gold/30 disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant] ?? variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// ManageBadge
// ---------------------------------------------------------------------------
export function ManageBadge({ tone = 'neutral', children, className = '' }) {
  const tones = {
    neutral: 'border-mgmt-border bg-mgmt-raised text-mgmt-muted',
    success: 'border-green-200 bg-green-50 text-green-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    danger:  'border-red-200 bg-red-50 text-red-700',
    info:    'border-blue-200 bg-blue-50 text-blue-700',
  }

  return (
    <span
      className={`inline-flex rounded-full border px-space-2 py-0.5 font-barlow text-[0.75rem] font-semibold uppercase tracking-[0.06em] ${tones[tone] ?? tones.neutral} ${className}`}
    >
      {children}
    </span>
  )
}

// ---------------------------------------------------------------------------
// ManageFilterChip
// ---------------------------------------------------------------------------
export function ManageFilterChip({ active = false, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-9 rounded-full border px-space-3 py-space-1 font-barlow text-[0.8125rem] font-semibold uppercase tracking-[0.06em] transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mgmt-gold/30 ${
        active
          ? 'border-mgmt-gold bg-gradient-accent-tint text-mgmt-gold shadow-gold'
          : 'border-mgmt-border bg-mgmt-raised text-mgmt-muted hover:border-mgmt-border-bright hover:text-mgmt-text'
      }`}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// ManageKpiTile — TiltCard + oversized Playfair number + gradient accent line
// ---------------------------------------------------------------------------
export function ManageKpiTile({ label, value, hint = '' }) {
  return (
    <TiltCard>
      <div className="relative cursor-default overflow-hidden rounded-xl border border-mgmt-border bg-mgmt-surface p-space-4">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-accent-tint"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-accent-h"
        />
        <p className="relative font-playfair text-[2.5rem] font-bold leading-none tracking-tight text-mgmt-text">
          {value}
        </p>
        <p className="relative mt-space-2 font-barlow text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-mgmt-muted">
          {label}
        </p>
        {hint && (
          <p className="relative mt-space-1 font-barlow text-[0.75rem] tracking-wide text-mgmt-dim">
            {hint}
          </p>
        )}
      </div>
    </TiltCard>
  )
}

function getFocusableElements(node) {
  if (!node) return []
  return [...node.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )].filter((element) => !element.hasAttribute('disabled') && !element.getAttribute('aria-hidden'))
}

export function ManageDialog({
  isOpen,
  onClose,
  ariaLabel,
  children,
  maxWidthClass = 'max-w-2xl',
}) {
  const dialogRef = useRef(null)
  const lastFocusedRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined
    lastFocusedRef.current = document.activeElement
    const dialog = dialogRef.current
    const focusables = getFocusableElements(dialog)
    if (focusables.length > 0) {
      focusables[0].focus()
    } else {
      dialog?.focus()
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose?.()
        return
      }
      if (event.key !== 'Tab') return
      const nodes = getFocusableElements(dialogRef.current)
      if (!nodes.length) {
        event.preventDefault()
        return
      }
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (lastFocusedRef.current instanceof HTMLElement) {
        lastFocusedRef.current.focus()
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-mgmt-text/40 p-space-3 backdrop-blur-sm md:p-space-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        className={`mx-auto mt-[4vh] w-full ${maxWidthClass} rounded-xl border border-mgmt-border-bright bg-mgmt-surface p-space-4 shadow-mgmt`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
