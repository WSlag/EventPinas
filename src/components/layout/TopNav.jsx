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
    mobilePanel: 'border-t border-white/20 bg-[#204CA3]',
    mobileDivider: 'border-white/20',
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
    mobilePanel: 'border-t border-neutral-200 bg-white',
    mobileDivider: 'border-neutral-200',
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
    mobilePanel: 'border-t border-white/20 bg-[#146C70]',
    mobileDivider: 'border-white/20',
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
    mobilePanel: 'border-t border-white/20 bg-[#C44D2D]',
    mobileDivider: 'border-white/20',
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
    mobilePanel: 'border-t border-white/20 bg-[#2E323A]',
    mobileDivider: 'border-white/20',
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

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden="true">
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden="true">
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  )
}

export default function TopNav() {
  const [scrolled, setScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, profile, hasActiveSubscription, logout, authBusy } = useAuth()
  const location = useLocation()
  const tone = useMemo(() => resolveTone(location.pathname), [location.pathname])
  const styles = toneStyles[tone]
  const isHomepage = tone === 'home'
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

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isMobileMenuOpen])

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

  const onMobileMenuLinkClick = () => {
    setIsMobileMenuOpen(false)
  }

  async function onMobileLogout() {
    setIsMobileMenuOpen(false)
    await onLogout()
  }

  const mobileMenuPanelStateClass = isMobileMenuOpen
    ? 'max-h-[36rem] translate-y-0 opacity-100'
    : 'pointer-events-none max-h-0 -translate-y-1 opacity-0'

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
                <Link to="/login" className={`hidden font-display lg:inline-flex ${styles.auth} ${authTextClass}`}>
                  Sign in
                </Link>
                <Link to="/register" className={`hidden lg:inline-flex ${joinButtonClass}`}>
                  Join
                </Link>
              </>
            )}

            {user && (
              <button
                type="button"
                onClick={onLogout}
                disabled={authBusy}
                className={`hidden font-display lg:inline-flex ${styles.auth} disabled:opacity-60 ${authTextClass}`}
              >
                {authBusy ? 'Signing out...' : 'Sign out'}
              </button>
            )}

            <button
              type="button"
              className={`inline-flex rounded-full p-2 lg:hidden ${styles.menuButton}`}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-controls="mobile-menu-panel"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((open) => !open)}
            >
              {isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
            </button>

            <button type="button" className={`hidden rounded-full p-2 lg:inline-flex ${styles.menuButton}`} aria-label="Open apps">
              <AppsIcon />
            </button>
          </div>
        </div>
      </div>

      <nav
        id="mobile-menu-panel"
        aria-label="Mobile menu"
        aria-hidden={!isMobileMenuOpen}
        className={`${styles.mobilePanel} overflow-hidden transition-all duration-200 ease-out lg:hidden ${mobileMenuPanelStateClass}`}
      >
        <div className="mx-auto w-full max-w-[1680px] px-space-4 pb-space-3 pt-space-2 md:px-space-6">
            <div className="flex flex-col gap-space-1">
              {primaryNavItems.map((item) => {
                const active = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))
                return (
                  <Link
                    key={`mobile-${item.to}`}
                    to={item.to}
                    className={`rounded-full px-space-3 py-space-2 font-display text-label-md transition-colors duration-fast ${
                      active ? styles.navActive : styles.navIdle
                    }`}
                    onClick={onMobileMenuLinkClick}
                  >
                    {item.label}
                  </Link>
                )
              })}
              <Link
                to={createEventsLink}
                className={`rounded-full px-space-3 py-space-2 font-display text-label-md transition-colors duration-fast ${
                  location.pathname.startsWith('/manage') ? styles.navActive : styles.navIdle
                }`}
                onClick={onMobileMenuLinkClick}
              >
                {createEventsLabel}
              </Link>
            </div>

            <div className={`mt-space-3 border-t pt-space-3 ${styles.mobileDivider}`}>
              {!user && (
                <div className="flex flex-col gap-space-2">
                  <Link
                    to="/login"
                    className={`rounded-full px-space-3 py-space-2 font-display text-label-md transition-colors duration-fast ${styles.navIdle}`}
                    onClick={onMobileMenuLinkClick}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className={`${joinButtonClass} inline-flex items-center justify-center`}
                    onClick={onMobileMenuLinkClick}
                  >
                    Join
                  </Link>
                </div>
              )}

              {user && (
                <button
                  type="button"
                  onClick={onMobileLogout}
                  disabled={authBusy}
                  className={`w-full rounded-full px-space-3 py-space-2 text-left font-display text-label-md ${styles.auth} disabled:opacity-60`}
                >
                  {authBusy ? 'Signing out...' : 'Sign out'}
                </button>
              )}
            </div>
          </div>
      </nav>
    </header>
  )
}
