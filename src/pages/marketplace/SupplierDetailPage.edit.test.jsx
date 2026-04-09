import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SupplierDetailPage from './SupplierDetailPage'

const authState = {
  user: null,
  profile: null,
  loading: false,
  authBusy: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  activateSubscription: vi.fn(),
  isOrganizer: false,
  hasActiveSubscription: false,
  authMode: 'local',
}

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => authState,
}))

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}

describe('Supplier detail ownership and edit flow', () => {
  beforeEach(() => {
    localStorage.clear()
    authState.user = null
    authState.profile = null
  })

  it('hides edit controls for public/non-owner viewers', async () => {
    render(
      <MemoryRouter future={routerFuture} initialEntries={['/suppliers/sup-001']}>
        <Routes>
          <Route path="/suppliers/:id" element={<SupplierDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText(/last updated/i)).toBeInTheDocument()
    })

    expect(screen.queryByRole('button', { name: /edit profile/i })).not.toBeInTheDocument()
  })

  it('shows edit profile for owner and saves updates', async () => {
    const user = userEvent.setup()

    authState.user = { uid: 'owner-sup-1' }
    authState.profile = {
      role: 'supplier',
      marketplaceProfile: { type: 'supplier', profileId: 'sup-001' },
    }

    render(
      <MemoryRouter future={routerFuture} initialEntries={['/suppliers/sup-001']}>
        <Routes>
          <Route path="/suppliers/:id" element={<SupplierDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /edit profile/i }))

    const nameInput = await screen.findByLabelText(/supplier name/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Blooms and Petals Updated')

    await user.click(screen.getByRole('button', { name: /save profile/i }))

    await waitFor(() => {
      expect(screen.getAllByRole('heading', { name: /blooms and petals updated/i }).length).toBeGreaterThan(0)
    })
  })
})
