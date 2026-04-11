import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, vi } from 'vitest'
import TopNav from './TopNav'

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}

const logoutMock = vi.fn(async () => {})
let authState

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => authState,
}))

function renderNav(route = '/') {
  return render(
    <MemoryRouter future={routerFuture} initialEntries={[route]}>
      <TopNav />
    </MemoryRouter>,
  )
}

function setViewportWidth(width) {
  act(() => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: width,
    })
    window.dispatchEvent(new Event('resize'))
  })
}

function setScrollY(value) {
  act(() => {
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value,
    })
    window.dispatchEvent(new Event('scroll'))
  })
}

beforeEach(() => {
  logoutMock.mockReset()
  setViewportWidth(1280)
  setScrollY(0)
  authState = {
    user: null,
    profile: null,
    loading: false,
    authBusy: false,
    login: vi.fn(async () => {}),
    register: vi.fn(async () => {}),
    logout: logoutMock,
    hasActiveSubscription: false,
  }
})

describe('TopNav', () => {
  it('hides the search bar on homepage and uses larger homepage typography', () => {
    renderNav('/')
    const brandText = screen.getByRole('link', { name: /eventpinas/i }).querySelector('span')

    expect(screen.queryByPlaceholderText(/search events, suppliers/i)).not.toBeInTheDocument()
    expect(brandText).toHaveClass('text-display-lg')
  })

  it('hides the search bar on non-homepage routes', () => {
    renderNav('/events')
    const brandText = screen.getByRole('link', { name: /eventpinas/i }).querySelector('span')

    expect(screen.queryByPlaceholderText(/search events, suppliers/i)).not.toBeInTheDocument()
    expect(brandText).toHaveClass('text-heading-xl')
  })

  it('renders an accessible mobile trigger and keeps menu closed by default', () => {
    renderNav('/events')

    const trigger = screen.getByRole('button', { name: /open menu/i })
    expect(trigger).toHaveAttribute('aria-controls', 'mobile-menu-panel')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('navigation', { name: /mobile menu/i })).not.toBeInTheDocument()
  })

  it('opens mobile menu with nav links and guest auth actions', async () => {
    const user = userEvent.setup()
    renderNav('/events')

    await user.click(screen.getByRole('button', { name: /open menu/i }))

    const panel = screen.getByRole('navigation', { name: /mobile menu/i })
    expect(within(panel).getByRole('link', { name: /discover events/i })).toBeInTheDocument()
    expect(within(panel).getByRole('link', { name: /suppliers/i })).toBeInTheDocument()
    expect(within(panel).getByRole('link', { name: /organizers/i })).toBeInTheDocument()
    expect(within(panel).getByRole('link', { name: /go to event app/i })).toHaveAttribute('href', '/register?role=organizer')
    expect(within(panel).getByRole('link', { name: /^sign in$/i })).toBeInTheDocument()
    expect(within(panel).getByRole('link', { name: /^join$/i })).toHaveAttribute('href', '/register?role=attendee')
    expect(screen.getByRole('button', { name: /close menu/i })).toHaveAttribute('aria-expanded', 'true')
  })

  it('shows go to event app CTA for guests and routes to organizer registration', () => {
    renderNav('/events')

    expect(screen.getByRole('link', { name: /^go to event app$/i })).toHaveAttribute('href', '/register?role=organizer')
  })

  it('routes desktop join CTA to attendee registration', () => {
    renderNav('/events')

    expect(screen.getByRole('link', { name: /^join$/i })).toHaveAttribute('href', '/register?role=attendee')
  })

  it('routes go to event app CTA for signed-in non-organizers to role-upgrade flow', () => {
    authState = {
      ...authState,
      user: { uid: 'user-2' },
      profile: { role: 'attendee' },
      hasActiveSubscription: false,
    }
    renderNav('/events')

    expect(screen.getByRole('link', { name: /^go to event app$/i })).toHaveAttribute('href', '/subscribe')
  })

  it('shows go to event app CTA for subscribed organizers and keeps dashboard destination', () => {
    authState = {
      ...authState,
      user: { uid: 'user-1' },
      profile: { role: 'organizer' },
      hasActiveSubscription: true,
    }
    renderNav('/events')

    expect(screen.getByRole('link', { name: /^go to event app$/i })).toHaveAttribute('href', '/manage/dashboard')
  })

  it('shows go to event app CTA for unsubscribed organizers and keeps subscribe destination', () => {
    authState = {
      ...authState,
      user: { uid: 'user-1' },
      profile: { role: 'organizer' },
      hasActiveSubscription: false,
    }
    renderNav('/events')

    expect(screen.getByRole('link', { name: /^go to event app$/i })).toHaveAttribute('href', '/subscribe')
  })

  it('closes mobile menu when a menu link is tapped', async () => {
    const user = userEvent.setup()
    renderNav('/events')

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    const panel = screen.getByRole('navigation', { name: /mobile menu/i })

    await user.click(within(panel).getByRole('link', { name: /suppliers/i }))

    await waitFor(() => {
      expect(screen.queryByRole('navigation', { name: /mobile menu/i })).not.toBeInTheDocument()
    })
  })

  it('closes mobile menu when escape is pressed', async () => {
    const user = userEvent.setup()
    renderNav('/events')

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    expect(screen.getByRole('navigation', { name: /mobile menu/i })).toBeInTheDocument()

    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('navigation', { name: /mobile menu/i })).not.toBeInTheDocument()
    })
  })

  it('shows sign out in mobile menu for authenticated users', async () => {
    authState = {
      ...authState,
      user: { uid: 'user-1' },
      profile: { role: 'organizer' },
      hasActiveSubscription: true,
    }

    const user = userEvent.setup()
    renderNav('/events')

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    const panel = screen.getByRole('navigation', { name: /mobile menu/i })

    expect(within(panel).getByRole('link', { name: /my profile/i })).toHaveAttribute('href', '/organizers')
    expect(within(panel).getByRole('button', { name: /sign out/i })).toBeInTheDocument()
    expect(within(panel).queryByRole('link', { name: /^sign in$/i })).not.toBeInTheDocument()
    expect(within(panel).queryByRole('link', { name: /^join$/i })).not.toBeInTheDocument()
  })

  it('shows desktop account menu trigger and organizer profile link for signed-in organizers', async () => {
    authState = {
      ...authState,
      user: { uid: 'user-1' },
      profile: { role: 'organizer', marketplaceProfile: { type: 'organizer', profileId: 'org-001' } },
      hasActiveSubscription: true,
    }

    const user = userEvent.setup()
    renderNav('/events')

    const trigger = screen.getByRole('button', { name: /account menu/i })
    expect(trigger).toHaveAttribute('aria-controls', 'account-menu-panel')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)

    const panel = screen.getByRole('menu', { name: /account menu panel/i })
    expect(within(panel).getByRole('menuitem', { name: /my profile/i })).toHaveAttribute('href', '/organizers/org-001')
    expect(within(panel).getByRole('menuitem', { name: /sign out/i })).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('shows admin console menu item only for admin accounts', async () => {
    authState = {
      ...authState,
      user: { uid: 'admin-1' },
      profile: { role: 'admin' },
      hasActiveSubscription: false,
    }

    const user = userEvent.setup()
    renderNav('/events')

    await user.click(screen.getByRole('button', { name: /account menu/i }))
    const panel = screen.getByRole('menu', { name: /account menu panel/i })

    expect(within(panel).getByRole('menuitem', { name: /admin console/i })).toHaveAttribute('href', '/admin')
  })

  it('does not show admin console menu item for non-admin accounts', async () => {
    authState = {
      ...authState,
      user: { uid: 'user-1' },
      profile: { role: 'organizer', marketplaceProfile: { type: 'organizer', profileId: 'org-001' } },
      hasActiveSubscription: true,
    }

    const user = userEvent.setup()
    renderNav('/events')

    await user.click(screen.getByRole('button', { name: /account menu/i }))
    const panel = screen.getByRole('menu', { name: /account menu panel/i })

    expect(within(panel).queryByRole('menuitem', { name: /admin console/i })).not.toBeInTheDocument()
  })

  it('routes my profile to organizer directory when organizer profile id is missing', async () => {
    authState = {
      ...authState,
      user: { uid: 'user-1' },
      profile: { role: 'organizer' },
      hasActiveSubscription: true,
    }

    const user = userEvent.setup()
    renderNav('/events')

    await user.click(screen.getByRole('button', { name: /account menu/i }))
    const panel = screen.getByRole('menu', { name: /account menu panel/i })

    expect(within(panel).getByRole('menuitem', { name: /my profile/i })).toHaveAttribute('href', '/organizers')
  })

  it('routes my profile to supplier detail page for signed-in suppliers', async () => {
    authState = {
      ...authState,
      user: { uid: 'user-2' },
      profile: { role: 'supplier', marketplaceProfile: { type: 'supplier', profileId: 'sup-001' } },
      hasActiveSubscription: false,
    }

    const user = userEvent.setup()
    renderNav('/events')

    await user.click(screen.getByRole('button', { name: /account menu/i }))
    const panel = screen.getByRole('menu', { name: /account menu panel/i })

    expect(within(panel).getByRole('menuitem', { name: /my profile/i })).toHaveAttribute('href', '/suppliers/sup-001')
  })

  it('hides the header on mobile when scrolling down past threshold', async () => {
    setViewportWidth(390)
    renderNav('/events')
    const header = screen.getByRole('banner')

    setScrollY(48)

    await waitFor(() => {
      expect(header).toHaveClass('-translate-y-full')
      expect(header).toHaveClass('opacity-0')
    })
  })

  it('reveals the header on mobile when scrolling up', async () => {
    setViewportWidth(390)
    renderNav('/events')
    const header = screen.getByRole('banner')

    setScrollY(72)
    await waitFor(() => {
      expect(header).toHaveClass('-translate-y-full')
    })

    setScrollY(28)
    await waitFor(() => {
      expect(header).toHaveClass('translate-y-0')
      expect(header).toHaveClass('opacity-100')
    })
  })

  it('keeps the header visible on mobile while the menu is open', async () => {
    setViewportWidth(390)
    const user = userEvent.setup()
    renderNav('/events')
    const header = screen.getByRole('banner')

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    setScrollY(140)

    await waitFor(() => {
      expect(header).not.toHaveClass('-translate-y-full')
      expect(header).toHaveClass('translate-y-0')
    })
  })

  it('does not hide the header on desktop scroll', async () => {
    setViewportWidth(1280)
    renderNav('/events')
    const header = screen.getByRole('banner')

    setScrollY(140)

    await waitFor(() => {
      expect(header).not.toHaveClass('-translate-y-full')
      expect(header).toHaveClass('translate-y-0')
    })
  })

  it('reveals the header near the top on mobile', async () => {
    setViewportWidth(390)
    renderNav('/events')
    const header = screen.getByRole('banner')

    setScrollY(120)
    await waitFor(() => {
      expect(header).toHaveClass('-translate-y-full')
    })

    setScrollY(6)
    await waitFor(() => {
      expect(header).toHaveClass('translate-y-0')
      expect(header).toHaveClass('opacity-100')
    })
  })
})
