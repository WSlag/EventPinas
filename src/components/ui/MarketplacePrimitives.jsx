import { Link } from 'react-router-dom'

const heroToneClasses = {
  blue: 'from-info via-info to-primary-700',
  dark: 'from-neutral-900 via-neutral-800 to-primary-700',
  teal: 'from-secondary-700 via-secondary-600 to-primary-600',
  soft: 'from-info/85 via-info/75 to-primary-600/80',
}

export function PageShell({ children, className = '' }) {
  return (
    <div className={`mx-auto w-full max-w-[1280px] px-space-4 py-space-6 md:px-space-6 md:py-space-8 ${className}`}>
      {children}
    </div>
  )
}

export function HeroBanner({ eyebrow, title, description, tone = 'blue', actions = null, className = '' }) {
  const toneClass = heroToneClasses[tone] ?? heroToneClasses.blue

  return (
    <section className={`rounded-3xl border border-white/10 bg-gradient-to-r ${toneClass} p-space-6 text-white shadow-md ${className}`}>
      {eyebrow && <p className="font-display text-overline uppercase tracking-wide text-blue-100">{eyebrow}</p>}
      <h1 className="mt-space-2 font-display text-display-lg leading-tight md:text-display-xl">{title}</h1>
      {description && <p className="mt-space-2 max-w-3xl font-body text-body-sm text-blue-50 md:text-body-md">{description}</p>}
      {actions && <div className="mt-space-4 flex flex-wrap gap-space-2">{actions}</div>}
    </section>
  )
}

export function SectionHeader({ title, actionLabel, actionTo, subtitle, className = '' }) {
  return (
    <div className={`flex items-end justify-between gap-space-3 ${className}`}>
      <div>
        <h2 className="font-display text-heading-xl text-info">{title}</h2>
        {subtitle && <p className="mt-space-1 font-body text-body-sm text-neutral-500">{subtitle}</p>}
      </div>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="font-display text-label-md text-secondary-600 hover:text-secondary-700">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}

export function FilterPanel({ title, showReset = false, onReset, children }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-space-4 space-y-space-3 shadow-sm">
      <div className="flex items-center justify-between gap-space-2">
        <h3 className="font-display text-heading-md text-neutral-900">{title}</h3>
        {showReset && (
          <button type="button" onClick={onReset} className="text-label-sm text-primary-500 hover:text-primary-600">
            Reset
          </button>
        )}
      </div>
      {children}
    </section>
  )
}

export function StatChip({ label, value }) {
  return (
    <div className="rounded-xl bg-neutral-100 p-space-2">
      <p className="font-display text-heading-sm text-neutral-900">{value}</p>
      <p className="font-body text-caption-lg text-neutral-500">{label}</p>
    </div>
  )
}

export function SurfaceCard({ children, className = '' }) {
  return (
    <article className={`rounded-2xl border border-neutral-200 bg-white p-space-4 shadow-sm ${className}`}>
      {children}
    </article>
  )
}

export function ActionButton({ children, to, tone = 'primary', className = '' }) {
  const toneClass = tone === 'ghost'
    ? 'border border-white/50 bg-transparent text-white'
    : tone === 'soft'
      ? 'bg-white text-info'
      : 'bg-primary-400 text-white shadow-primary'

  return (
    <Link to={to} className={`rounded-full px-space-4 py-space-2 font-display text-label-md ${toneClass} ${className}`}>
      {children}
    </Link>
  )
}
