import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function TopNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-normal ${scrolled ? 'glass shadow-sm' : 'bg-surface-base'}`}>
      {/* Row 1 — Role switcher */}
      <div className="bg-neutral-900 px-space-4 py-space-1 flex items-center justify-between">
        <div className="flex items-center gap-space-2">
          <button className="text-overline text-white uppercase px-space-2 py-space-1 rounded-full bg-primary-400">
            Attendee
          </button>
          <button className="text-overline text-neutral-400 uppercase px-space-2 py-space-1">
            Organizer
          </button>
          <button className="text-overline text-neutral-400 uppercase px-space-2 py-space-1">
            Supplier
          </button>
        </div>
        <Link to="/login" className="text-label-sm font-display text-neutral-300">
          Sign in
        </Link>
      </div>

      {/* Row 2 — Logo + Search */}
      <div className="px-space-4 h-14 flex items-center gap-space-3">
        <Link to="/" className="font-display font-bold text-heading-md text-primary-400 shrink-0">
          EventPinas
        </Link>
        <div className="flex-1 relative">
          <input
            type="search"
            placeholder="Search events, suppliers..."
            className="w-full h-9 pl-9 pr-space-3 bg-surface-overlay rounded-md text-body-sm font-body text-neutral-800 placeholder:text-neutral-400 border border-neutral-200 focus:outline-none focus:border-primary-400 focus:shadow-sm transition-all duration-fast"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
      </div>
    </header>
  )
}
