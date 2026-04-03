import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const roleLinks = [
  { label: 'Attendee', to: '/' },
  { label: 'Organizer', to: '/manage' },
  { label: 'Supplier', to: '/suppliers' },
]

export default function TopNav() {
  const [scrolled, setScrolled] = useState(false)
  const { user, profile, logout, authBusy } = useAuth()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function onLogout() {
    try {
      await logout()
    } catch {
      // Keep nav stable even if sign out fails.
    }
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-normal ${scrolled ? 'glass shadow-sm' : 'bg-surface-base'}`}>
      <div className="bg-neutral-900">
        <div className="w-full px-space-4 py-space-1 flex items-center justify-between">
          <div className="flex items-center gap-space-2">
            {roleLinks.map((roleLink) => {
              const active = location.pathname === roleLink.to || (roleLink.to !== '/' && location.pathname.startsWith(roleLink.to))
              return (
                <Link
                  key={roleLink.to}
                  to={roleLink.to}
                  className={`text-overline uppercase px-space-2 py-space-1 rounded-full ${
                    active ? 'text-white bg-primary-400' : 'text-neutral-400'
                  }`}
                >
                  {roleLink.label}
                </Link>
              )
            })}
          </div>

          {!user && (
            <div className="flex items-center gap-space-2">
              <Link to="/login" className="text-label-sm font-display text-neutral-300">Sign in</Link>
              <Link to="/register" className="text-label-sm font-display text-white bg-primary-400 px-space-2 py-space-1 rounded-full">Join</Link>
            </div>
          )}

          {user && (
            <div className="flex items-center gap-space-2">
              <span className="text-label-sm text-neutral-300 hidden sm:inline">{profile?.displayName || user.email}</span>
              <button
                type="button"
                onClick={onLogout}
                disabled={authBusy}
                className="text-label-sm font-display text-neutral-300 disabled:opacity-60"
              >
                {authBusy ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-space-4 h-14 flex items-center gap-space-3 border-b border-neutral-200">
        <div className="w-full flex items-center gap-space-3">
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
      </div>
    </header>
  )
}
