import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    loading: false,
    authBusy: false,
    login: vi.fn(async () => {}),
    register: vi.fn(async () => {}),
    logout: vi.fn(async () => {}),
  }),
}))

describe('Auth pages smoke', () => {
  it('renders login and register headings', () => {
    const { rerender } = render(
      <MemoryRouter future={routerFuture}>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()

    rerender(
      <MemoryRouter future={routerFuture}>
        <RegisterPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument()
  })
})
