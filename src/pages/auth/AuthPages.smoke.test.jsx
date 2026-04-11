import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

function renderRegisterPage(initialEntry = '/register') {
  render(
    <MemoryRouter future={routerFuture} initialEntries={[initialEntry]}>
      <RegisterPage />
    </MemoryRouter>,
  )
}

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

  it('routes login create-one CTA to attendee registration', () => {
    render(
      <MemoryRouter future={routerFuture}>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /create one/i })).toHaveAttribute('href', '/register?role=attendee')
  })

  it('defaults plain register route to attendee role and attendee highlight', () => {
    renderRegisterPage('/register')

    const roleSelect = screen.getByLabelText(/role/i)
    expect(roleSelect).toHaveValue('attendee')
    expect(roleSelect).toHaveClass('bg-blue-50')
    expect(screen.getByText(/^role$/i)).toHaveClass('text-info')
  })

  it('prefills organizer role from query parameter with organizer highlight', () => {
    renderRegisterPage('/register?role=organizer')

    const roleSelect = screen.getByLabelText(/role/i)
    expect(roleSelect).toHaveValue('organizer')
    expect(roleSelect).toHaveClass('bg-primary-50')
    expect(screen.getByText(/^role$/i)).toHaveClass('text-primary-700')
  })

  it('prefills supplier role from query parameter with supplier highlight', () => {
    renderRegisterPage('/register?role=supplier')

    const roleSelect = screen.getByLabelText(/role/i)
    expect(roleSelect).toHaveValue('supplier')
    expect(roleSelect).toHaveClass('bg-secondary-50')
    expect(screen.getByText(/^role$/i)).toHaveClass('text-secondary-700')
  })

  it('updates role highlight when selection changes', async () => {
    const user = userEvent.setup()

    renderRegisterPage('/register?role=attendee')

    const roleSelect = screen.getByLabelText(/role/i)
    expect(roleSelect).toHaveClass('bg-blue-50')

    await user.selectOptions(roleSelect, 'supplier')

    expect(roleSelect).toHaveValue('supplier')
    expect(roleSelect).toHaveClass('bg-secondary-50')
    expect(screen.getByText(/^role$/i)).toHaveClass('text-secondary-700')
  })

  it('prefills role from register query parameter', () => {
    render(
      <MemoryRouter future={routerFuture} initialEntries={['/register?role=organizer']}>
        <RegisterPage />
      </MemoryRouter>,
    )

    expect(screen.getByLabelText(/role/i)).toHaveValue('organizer')
  })
})
