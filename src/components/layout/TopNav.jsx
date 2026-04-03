import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const primaryNavItems = [
  { label: 'My Tickets', to: '/saved' },
  { label: 'Discover Events', to: '/events' },
  { label: 'Suppliers', to: '/suppliers' },
  { label: 'Organizers', to: '/organizers' },
]

const toneStyles = {
  home: {
    topRow: 'bg-[#204CA3]',
    topRowBorder: '',
    headerScrolled: 'shadow-sm',
    logo: 'text-white',
    navActive: 'bg-white/20 text-white',
    navIdle: 'text-white/90 hover:text-white',
    auth: 'text-neutral-100',
    menuButton: 'text-white/95 hover:bg-white/10',
    searchRowIdle: 'border-t border-white/20 bg-[#204CA3]',
    searchRowScrolled: 'border-t border-white/20 bg-[#204CA3]',
    searchButton: 'border-white/20 bg-white/10 text-white hover:bg-white/20',
  },
  discover: {
    topRow: 'bg-white',
    topRowBorder: 'border-b border-neutral-200',
    headerScrolled: 'shadow-sm',
    logo: 'text-neutral-900',
    navActive: 'bg-neutral-100 text-neutral-900',
    navIdle: 'text-neutral-700 hover:text-neutral-900',
    auth: 'text-neutral-700',
    menuButton: 'text-neutral-700 hover:bg-neutral-100',
    searchRowIdle: 'border-t border-[#204CA3] bg-[#204CA3]',
    searchRowScrolled: 'border-t border-[#204CA3] bg-[#204CA3]',
    searchButton: 'border-white/20 bg-white/10 text-white hover:bg-white/20',
  },
  suppliers: {
    topRow: 'bg-[#146C70]',
    topRowBorder: '',
    headerScrolled: 'shadow-sm',
    logo: 'text-white',
    navActive: 'bg-white/20 text-white',
    navIdle: 'text-white/90 hover:text-white',
    auth: 'text-neutral-100',
    menuButton: 'text-white/95 hover:bg-white/10',
    searchRowIdle: 'border-t border-white/20 bg-[#0F575A]',
    searchRowScrolled: 'border-t border-white/20 bg-[#0F575A]',
    searchButton: 'border-white/20 bg-white/10 text-white hover:bg-white/20',
  },
  organizers: {
    topRow: 'bg-[#C44D2D]',
    topRowBorder: '',
    headerScrolled: 'shadow-sm',
    logo: 'text-white',
    navActive: 'bg-white/20 text-white',
    navIdle: 'text-white/90 hover:text-white',
    auth: 'text-neutral-100',
    menuButton: 'text-white/95 hover:bg-white/10',
    searchRowIdle: 'border-t border-white/20 bg-[#9F3F26]',
    searchRowScrolled: 'border-t border-white/20 bg-[#9F3F26]',
    searchButton: 'border-white/20 bg-white/10 text-white hover:bg-white/20',
  },
  saved: {
    topRow: 'bg-[#2E323A]',
    topRowBorder: '',
    headerScrolled: 'shadow-sm',
    logo: 'text-white',
    navActive: 'bg-white/20 text-white',
    navIdle: 'text-white/90 hover:text-white',
    auth: 'text-neutral-100',
    menuButton: 'text-white/95 hover:bg-white/10',
    searchRowIdle: 'border-t border-white/20 bg-[#1F232A]',
    searchRowScrolled: 'border-t border-white/20 bg-[#1F232A]',
    searchButton: 'border-white/20 bg-white/10 text-white hover:bg-white/20',
  },
}

function resolveTone(pathname) {
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/suppliers')) return 'suppliers'
  if (pathname.startsWith('/organizers') || pathname.startsWith('/manage')) return 'organizers'
  if (pathname.startsWith('/saved')) return 'saved'
  return 'discover'
}

function AppsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="5" r="2.2" />
      <circle cx="12" cy="5" r="2.2" />
      <circle cx="19" cy="5" r="2.2" />
      <circle cx="5" cy="12" r="2.2" />
      <circle cx="12" cy="12" r="2.2" />
      <circle cx="19" cy="12" r="2.2" />
      <circle cx="5" cy="19" r="2.2" />
      <circle cx="12" cy="19" r="2.2" />
      <circle cx="19" cy="19" r="2.2" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
      <path d="M9 17a3 3 0 0 0 6 0" />
    </svg>
  )
}

export default function TopNav() {
  const [scrolled, setScrolled] = useState(false)
  const { user, profile, hasActiveSubscription, logout, authBusy } = useAuth()
  const location = useLocation()
  const tone = useMemo(() => resolveTone(location.pathname), [location.pathname])
  const styles = toneStyles[tone]
  const isHomepage = tone === 'home'
  const showSearchBar = location.pathname !== '/'
  const topRowHeightClass = isHomepage ? 'h-20' : 'h-16'
  const logoTextClass = isHomepage ? 'text-display-lg md:text-display-xl' : 'text-heading-xl'
  const navTextClass = isHomepage ? 'text-heading-sm' : 'text-label-md'
  const authTextClass = isHomepage ? 'text-heading-sm' : 'text-label-md'
  const joinButtonClass = isHomepage
    ? 'rounded-full bg-primary-400 px-space-4 py-space-2 font-display text-label-md text-white'
    : 'rounded-full bg-primary-400 px-space-3 py-space-1 font-display text-label-sm text-white'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const createEventsLink = useMemo(() => {
    if (!user) return '/register'
    if (profile?.role === 'organizer') {
      return hasActiveSubscription ? '/manage/dashboard' : '/subscribe'
    }
    return '/register'
  }, [user, profile?.role, hasActiveSubscription])

  const createEventsLabel = useMemo(() => {
    if (!user) return 'Create Events'
    if (profile?.role === 'organizer') {
      return hasActiveSubscription ? 'Organizer Console' : 'Upgrade'
    }
    return 'Create Events'
  }, [user, profile?.role, hasActiveSubscription])

  async function onLogout() {
    try {
      await logout()
    } catch {
      // Keep nav stable even if sign out fails.
    }
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-normal ${scrolled ? styles.headerScrolled : ''}`}>
      <div className={`${styles.topRow} ${styles.topRowBorder}`}>
        <div className={`mx-auto flex w-full max-w-[1680px] items-center justify-between px-space-4 md:px-space-6 ${topRowHeightClass}`}>
          <Link to="/" className="shrink-0">
            <span className={`font-display font-extrabold tracking-tight ${styles.logo} ${logoTextClass}`}>
              eventpinas
              <span className="text-secondary-300">.</span>
              com
            </span>
          </Link>

          <nav className="hidden items-center gap-space-2 lg:flex">
            {primaryNavItems.map((item) => {
              const active = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-full px-space-3 py-space-2 font-display transition-colors duration-fast ${navTextClass} ${
                    active ? styles.navActive : styles.navIdle
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            <Link
              to={createEventsLink}
              className={`rounded-full px-space-3 py-space-2 font-display transition-colors duration-fast ${navTextClass} ${
                location.pathname.startsWith('/manage') ? styles.navActive : styles.navIdle
              }`}
            >
              {createEventsLabel}
            </Link>
          </nav>

          <div className="flex items-center gap-space-2">
            {!user && (
              <>
                <Link to="/login" className={`font-display ${styles.auth} ${authTextClass}`}>
                  Sign in
                </Link>
                <Link to="/register" className={joinButtonClass}>
                  Join
                </Link>
              </>
            )}

            {user && (
              <button
                type="button"
                onClick={onLogout}
                disabled={authBusy}
                className={`font-display ${styles.auth} disabled:opacity-60 ${authTextClass}`}
              >
                {authBusy ? 'Signing out...' : 'Sign out'}
              </button>
            )}

            <button type="button" className={`hidden rounded-full p-2 md:inline-flex ${styles.menuButton}`} aria-label="Open menu">
              <AppsIcon />
            </button>
          </div>
        </div>
      </div>

      {showSearchBar && (
        <div className={scrolled ? styles.searchRowScrolled : styles.searchRowIdle}>
          <div className="mx-auto flex h-12 w-full max-w-[1680px] items-center gap-space-3 px-space-4 md:px-space-6">
            <div className="relative flex-1">
              <input
                type="search"
                placeholder="Search events, suppliers..."
                className="h-9 w-full rounded-full border border-white/20 bg-white/95 pl-9 pr-space-3 font-body text-body-sm text-neutral-700 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <button type="button" className={`inline-flex h-9 w-9 items-center justify-center rounded-full border ${styles.searchButton}`} aria-label="Open notifications">
              <BellIcon />
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
