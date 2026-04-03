import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import OrganizerManagePage from './OrganizerManagePage'

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'u-1' },
    profile: { role: 'organizer', displayName: 'Lito Lagbas', email: 'lito@example.com' },
    loading: false,
    authBusy: false,
    login: vi.fn(async () => {}),
    register: vi.fn(async () => {}),
    logout: vi.fn(async () => {}),
  }),
}))

describe('OrganizerManagePage smoke', () => {
  it('renders organizer console shell', () => {
    render(
      <MemoryRouter future={routerFuture}>
        <OrganizerManagePage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /welcome, lito lagbas/i })).toBeInTheDocument()
    expect(screen.getByText(/quick actions/i)).toBeInTheDocument()
  })
})
