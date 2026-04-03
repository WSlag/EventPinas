import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import TopNav from './TopNav'

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

function renderNav(route = '/') {
  return render(
    <MemoryRouter future={routerFuture} initialEntries={[route]}>
      <TopNav />
    </MemoryRouter>,
  )
}

describe('TopNav', () => {
  it('hides the search bar on homepage and uses larger homepage typography', () => {
    renderNav('/')
    const brandText = screen.getByRole('link', { name: /eventpinas/i }).querySelector('span')

    expect(screen.queryByPlaceholderText(/search events, suppliers/i)).not.toBeInTheDocument()
    expect(brandText).toHaveClass('text-display-lg')
  })

  it('shows the search bar on non-homepage routes', () => {
    renderNav('/events')
    const brandText = screen.getByRole('link', { name: /eventpinas/i }).querySelector('span')

    expect(screen.getByPlaceholderText(/search events, suppliers/i)).toBeInTheDocument()
    expect(brandText).toHaveClass('text-heading-xl')
  })
})
