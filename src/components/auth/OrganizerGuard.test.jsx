import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'
import OrganizerGuard from './OrganizerGuard'

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}

let mockAuthState = {
  user: null,
  profile: null,
  loading: false,
  hasActiveSubscription: false,
}

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockAuthState,
}))

function renderGuard(initialPath = '/manage/dashboard') {
  return render(
    <MemoryRouter future={routerFuture} initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<h1>Login Screen</h1>} />
        <Route path="/subscribe" element={<h1>Subscribe Screen</h1>} />
        <Route
          path="/manage/*"
          element={(
            <OrganizerGuard>
              <h1>Manage Unlocked</h1>
            </OrganizerGuard>
          )}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('OrganizerGuard', () => {
  it('redirects anonymous users to login', () => {
    mockAuthState = {
      user: null,
      profile: null,
      loading: false,
      hasActiveSubscription: false,
    }

    renderGuard()
    expect(screen.getByRole('heading', { name: /login screen/i })).toBeInTheDocument()
  })

  it('blocks non-organizer roles', () => {
    mockAuthState = {
      user: { uid: 'u-1' },
      profile: { role: 'supplier' },
      loading: false,
      hasActiveSubscription: false,
    }

    renderGuard()
    expect(screen.getByRole('heading', { name: /this tool is for organizers only/i })).toBeInTheDocument()
  })

  it('redirects unpaid organizers to subscribe', () => {
    mockAuthState = {
      user: { uid: 'u-1' },
      profile: { role: 'organizer' },
      loading: false,
      hasActiveSubscription: false,
    }

    renderGuard()
    expect(screen.getByRole('heading', { name: /subscribe screen/i })).toBeInTheDocument()
  })

  it('allows paid organizers', () => {
    mockAuthState = {
      user: { uid: 'u-1' },
      profile: { role: 'organizer' },
      loading: false,
      hasActiveSubscription: true,
    }

    renderGuard()
    expect(screen.getByRole('heading', { name: /manage unlocked/i })).toBeInTheDocument()
  })
})
