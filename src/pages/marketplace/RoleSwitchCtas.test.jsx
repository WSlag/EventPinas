import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, vi } from 'vitest'
import SuppliersPage from './SuppliersPage'
import OrganizersPage from './OrganizersPage'

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}

const switchRoleMock = vi.fn(async () => {})
let authState

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => authState,
}))

function renderWithRouter(node) {
  return render(
    <MemoryRouter future={routerFuture}>
      {node}
    </MemoryRouter>,
  )
}

describe('Role switch CTAs on directory pages', () => {
  beforeEach(() => {
    switchRoleMock.mockReset()
    authState = {
      user: null,
      profile: null,
      loading: false,
      authBusy: false,
      switchRole: switchRoleMock,
    }
  })

  it('shows guest role signup links on suppliers page', () => {
    renderWithRouter(<SuppliersPage />)

    expect(screen.getByRole('link', { name: /join now/i })).toHaveAttribute('href', '/register?role=supplier')
    expect(screen.getByRole('link', { name: /join as organizer/i })).toHaveAttribute('href', '/register?role=organizer')
  })

  it('shows guest role signup links on organizers page', () => {
    renderWithRouter(<OrganizersPage />)

    expect(screen.getByRole('link', { name: /join as organizer/i })).toHaveAttribute('href', '/register?role=organizer')
    expect(screen.getByRole('link', { name: /join as supplier/i })).toHaveAttribute('href', '/register?role=supplier')
  })

  it('switches to supplier from suppliers page for signed-in attendees', async () => {
    const user = userEvent.setup()
    authState = {
      ...authState,
      user: { uid: 'att-1' },
      profile: { role: 'attendee' },
    }

    renderWithRouter(<SuppliersPage />)
    await user.click(screen.getByRole('button', { name: /become supplier/i }))

    expect(switchRoleMock).toHaveBeenCalledWith('supplier')
  })

  it('switches to organizer from organizers page for signed-in attendees', async () => {
    const user = userEvent.setup()
    authState = {
      ...authState,
      user: { uid: 'att-1' },
      profile: { role: 'attendee' },
    }

    renderWithRouter(<OrganizersPage />)
    await user.click(screen.getByRole('button', { name: /become organizer/i }))

    expect(switchRoleMock).toHaveBeenCalledWith('organizer')
  })
})
