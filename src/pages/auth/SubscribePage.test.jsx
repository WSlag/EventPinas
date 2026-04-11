import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, vi } from 'vitest'
import SubscribePage from './SubscribePage'

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}

const switchRoleMock = vi.fn(async () => {})
let authState

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => authState,
}))

function renderPage() {
  return render(
    <MemoryRouter future={routerFuture} initialEntries={['/subscribe']}>
      <SubscribePage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  switchRoleMock.mockReset()
  authState = {
    user: { uid: 'user-1', email: 'sample@example.com' },
    profile: { role: 'attendee', displayName: 'Sample User', email: 'sample@example.com' },
    loading: false,
    authBusy: false,
    hasActiveSubscription: false,
    activateSubscription: vi.fn(async () => {}),
    switchRole: switchRoleMock,
  }
})

describe('SubscribePage role upgrade', () => {
  it('shows become supplier/organizer actions for attendee accounts', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: /become a supplier or organizer/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /become a supplier/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /become an organizer/i })).toBeInTheDocument()
  })

  it('switches role to supplier when attendee clicks become supplier', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /become a supplier/i }))

    expect(switchRoleMock).toHaveBeenCalledWith('supplier')
  })

  it('switches role to organizer when attendee clicks become organizer', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /become an organizer/i }))

    expect(switchRoleMock).toHaveBeenCalledWith('organizer')
  })
})
