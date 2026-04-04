export function ManageSectionHeader({ title, subtitle, actions = null }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-space-2">
      <div>
        <h2 className="font-display text-heading-xl text-neutral-900">{title}</h2>
        {subtitle && <p className="mt-space-1 font-body text-body-sm text-neutral-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-space-2">{actions}</div>}
    </div>
  )
}

export function ManageCard({ children, className = '' }) {
  return (
    <article className={`rounded-2xl border border-neutral-200 bg-white p-space-4 shadow-sm ${className}`}>
      {children}
    </article>
  )
}

export function ManageFilterBar({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-neutral-200 bg-white p-space-3 shadow-sm ${className}`}>
      <div className="flex flex-wrap items-center gap-space-2">{children}</div>
    </div>
  )
}

export function ManageButton({ type = 'button', variant = 'primary', children, className = '', ...props }) {
  const variants = {
    primary: 'bg-info text-white hover:bg-info/90',
    secondary: 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200',
    ghost: 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50',
    danger: 'bg-error text-white hover:bg-error/90',
  }

  return (
    <button
      type={type}
      className={`min-h-10 rounded-full px-space-4 py-space-2 font-display text-label-md transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/40 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant] ?? variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function ManageBadge({ tone = 'neutral', children, className = '' }) {
  const tones = {
    neutral: 'bg-neutral-100 text-neutral-700',
    success: 'bg-green-100 text-success',
    warning: 'bg-amber-100 text-warning',
    danger: 'bg-red-100 text-error',
    info: 'bg-blue-100 text-info',
  }

  return (
    <span className={`inline-flex rounded-full px-space-2 py-space-1 font-display text-label-sm ${tones[tone] ?? tones.neutral} ${className}`}>
      {children}
    </span>
  )
}

export function ManageFilterChip({ active = false, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-10 rounded-full border px-space-3 py-space-1 font-display text-label-sm transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/40 ${
        active
          ? 'border-info bg-info text-white'
          : 'border-neutral-300 bg-white text-neutral-700 hover:border-info/50'
      }`}
    >
      {children}
    </button>
  )
}

export function ManageKpiTile({ label, value, hint = '' }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-space-3">
      <p className="font-display text-heading-md text-neutral-900">{value}</p>
      <p className="font-body text-caption-lg text-neutral-500">{label}</p>
      {hint && <p className="mt-space-1 font-body text-caption-sm text-neutral-400">{hint}</p>}
    </div>
  )
}
