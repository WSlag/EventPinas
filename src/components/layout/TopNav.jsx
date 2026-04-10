import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const primaryNavItems = [
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

const SCROLL_SHADOW_OFFSET = 8
const MOBILE_NEAR_TOP_OFFSET = 12
const MOBILE_SCROLL_DELTA_THRESHOLD = 6
const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)'

function isDesktopViewport() {
  if (typeof window === 'undefined') return false
  if (typeof window.matchMedia === 'function') {
    return window.matchMedia(DESKTOP_MEDIA_QUERY).matches
  }
  return window.innerWidth >= 1024
}

function resolveTone(pathname) {
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/suppliers')) return 'suppliers'
  if (pathname.startsWith('/organizers') || pathname.startsWith('/manage')) return 'organizers'
  if (pathname.startsWith('/saved')) return 'saved'
  return 'discover'
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
  const [isMobileHeaderHidden, setIsMobileHeaderHidden] = useState(false)
  const previousScrollYRef = useRef(0)
  const { user, profile, hasActiveSubscription, logout, authBusy, register, activateSubscription } = useAuth()
  const navigate = useNavigate()
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
    previousScrollYRef.current = window.scrollY

    const onScroll = () => {
      const currentScrollY = Math.max(window.scrollY, 0)
      setScrolled(currentScrollY > SCROLL_SHADOW_OFFSET)

      if (isDesktopViewport() || isMobileMenuOpen) {
        setIsMobileHeaderHidden(false)
        previousScrollYRef.current = currentScrollY
        return
      }

      if (currentScrollY <= MOBILE_NEAR_TOP_OFFSET) {
        setIsMobileHeaderHidden(false)
        previousScrollYRef.current = currentScrollY
        return
      }

      const delta = currentScrollY - previousScrollYRef.current
      if (Math.abs(delta) < MOBILE_SCROLL_DELTA_THRESHOLD) return

      setIsMobileHeaderHidden(delta > 0)
      previousScrollYRef.current = currentScrollY
    }

    const onResize = () => {
      if (isDesktopViewport()) {
        setIsMobileHeaderHidden(false)
      }
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsMobileHeaderHidden(false)
    previousScrollYRef.current = window.scrollY
  }, [location.pathname, location.search])

  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsMobileHeaderHidden(false)
    }
  }, [isMobileMenuOpen])

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

  async function onBypassManage() {
    const stamp = Date.now()
    try {
      await register({
        email: `organizer.test.${stamp}@eventpinas.com`,
        password: `test${stamp}`.slice(0, 12),
        displayName: 'Organizer Test User',
        role: 'organizer',
      })
      await activateSubscription({ planId: 'pro', durationDays: 30 })
      navigate('/manage/dashboard', { replace: true })
    } catch {
      // silent — already logged in as organizer, just navigate
      navigate('/manage/dashboard', { replace: true })
    }
  }

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

  async function onMobileBypassManage() {
    setIsMobileMenuOpen(false)
    await onBypassManage()
  }

  async function onMobileLogout() {
    setIsMobileMenuOpen(false)
    await onLogout()
  }

  const mobileMenuPanelStateClass = isMobileMenuOpen
    ? 'max-h-[36rem] translate-y-0 opacity-100'
    : 'pointer-events-none max-h-0 -translate-y-1 opacity-0'
  const mobileDevManageClass =
    tone === 'discover'
      ? 'border-neutral-300 text-neutral-700 hover:border-neutral-500 hover:text-neutral-900'
      : 'border-white/50 text-white/80 hover:border-white hover:text-white'
  const mobileHeaderVisibilityClass = isMobileHeaderHidden
    ? '-translate-y-full opacity-0 lg:translate-y-0 lg:opacity-100'
    : 'translate-y-0 opacity-100'

  return (
    <header
      className={`sticky top-0 z-50 transition-[transform,opacity,box-shadow] duration-200 ease-out ${mobileHeaderVisibilityClass} ${
        scrolled ? styles.headerScrolled : ''
      }`}
    >
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
            <button
              type="button"
              onClick={onBypassManage}
              className="rounded-full border border-dashed border-white/50 px-space-3 py-1 font-display text-caption-sm text-white/70 hover:border-white hover:text-white"
            >
              [dev] manage
            </button>
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
              className="rounded-full bg-primary-400 px-space-4 py-space-2 font-display text-label-md text-white transition-opacity duration-fast hover:opacity-90"
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
              <button
                type="button"
                onClick={onMobileBypassManage}
                className={`w-full rounded-full border border-dashed px-space-3 py-space-2 text-left font-display text-label-md ${mobileDevManageClass}`}
              >
                [dev] manage
              </button>
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
                className="inline-flex items-center justify-center rounded-full bg-primary-400 px-space-4 py-space-2 font-display text-label-md text-white"
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
