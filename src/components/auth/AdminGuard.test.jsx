import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'
import AdminGuard from './AdminGuard'

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}

let mockAuthState = {
  user: null,
  profile: null,
  loading: false,
}

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockAuthState,
}))

function renderGuard(initialPath = '/admin') {
  return render(
    <MemoryRouter future={routerFuture} initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<h1>Login Screen</h1>} />
        <Route
          path="/admin"
          element={(
            <AdminGuard>
              <h1>Admin Unlocked</h1>
            </AdminGuard>
          )}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AdminGuard', () => {
  it('redirects anonymous users to login', () => {
    mockAuthState = {
      user: null,
      profile: null,
      loading: false,
    }

    renderGuard()
    expect(screen.getByRole('heading', { name: /login screen/i })).toBeInTheDocument()
  })

  it('blocks non-admin users', () => {
    mockAuthState = {
      user: { uid: 'u-1' },
      profile: { role: 'organizer' },
      loading: false,
    }

    renderGuard()
    expect(screen.getByRole('heading', { name: /admin access only/i })).toBeInTheDocument()
  })

  it('allows admin users', () => {
    mockAuthState = {
      user: { uid: 'u-1' },
      profile: { role: 'admin' },
      loading: false,
    }

    renderGuard()
    expect(screen.getByRole('heading', { name: /admin unlocked/i })).toBeInTheDocument()
  })
})
