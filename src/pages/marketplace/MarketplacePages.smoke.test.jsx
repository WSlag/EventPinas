import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import EventsPage from './EventsPage'
import SuppliersPage from './SuppliersPage'
import OrganizersPage from './OrganizersPage'
import SavedPage from './SavedPage'
import EventDetailPage from './EventDetailPage'
import SupplierDetailPage from './SupplierDetailPage'
import OrganizerDetailPage from './OrganizerDetailPage'

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}

describe('Marketplace pages smoke', () => {
  it('renders key list page hero headings', () => {
    const { rerender } = render(
      <MemoryRouter future={routerFuture}>
        <EventsPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /find events your community will remember/i })).toBeInTheDocument()

    rerender(
      <MemoryRouter future={routerFuture}>
        <SuppliersPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /discover trusted vendors for every event type/i })).toBeInTheDocument()

    rerender(
      <MemoryRouter future={routerFuture}>
        <OrganizersPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /connect with organizers who can run your event end-to-end/i })).toBeInTheDocument()
  })

  it('routes supplier join CTA to supplier registration', () => {
    render(
      <MemoryRouter future={routerFuture}>
        <SuppliersPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /join now/i })).toHaveAttribute('href', '/register?role=supplier')
  })

  it('routes organizer join CTA to organizer registration', () => {
    render(
      <MemoryRouter future={routerFuture}>
        <OrganizersPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /join as organizer/i })).toHaveAttribute('href', '/register?role=organizer')
  })

  it('renders saved page shell', async () => {
    render(
      <MemoryRouter future={routerFuture}>
        <SavedPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /your bookmarked events, suppliers, and organizers/i })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByText(/loading saved items/i)).not.toBeInTheDocument()
    })
  })

  it('renders event detail route shell', () => {
    render(
      <MemoryRouter future={routerFuture} initialEntries={['/events/evt-001']}>
        <Routes>
          <Route path="/events/:id" element={<EventDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText(/loading event details/i)).toBeInTheDocument()
  })

  it('renders supplier detail route shell', () => {
    render(
      <MemoryRouter future={routerFuture} initialEntries={['/suppliers/sup-001']}>
        <Routes>
          <Route path="/suppliers/:id" element={<SupplierDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText(/loading supplier details/i)).toBeInTheDocument()
  })

  it('renders organizer detail route shell', () => {
    render(
      <MemoryRouter future={routerFuture} initialEntries={['/organizers/org-001']}>
        <Routes>
          <Route path="/organizers/:id" element={<OrganizerDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText(/loading organizer details/i)).toBeInTheDocument()
  })

  it('renders supplier detail CTAs and tab content', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter future={routerFuture} initialEntries={['/suppliers/sup-001']}>
        <Routes>
          <Route path="/suppliers/:id" element={<SupplierDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /get quote/i })).toBeInTheDocument()
    })

    expect(screen.getByRole('link', { name: /message/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^save$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /portfolio/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /packages/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /packages/i }))
    expect(screen.getAllByRole('button', { name: /select this package/i }).length).toBeGreaterThan(0)
  })

  it('renders organizer detail CTAs and tab content', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter future={routerFuture} initialEntries={['/organizers/org-001']}>
        <Routes>
          <Route path="/organizers/:id" element={<OrganizerDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /hire this organizer/i })).toBeInTheDocument()
    })

    expect(screen.getByRole('link', { name: /message/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^save$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /overview/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /pricing/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /pricing/i }))
    expect(screen.getByText(/day-of coordination/i)).toBeInTheDocument()
  })
})
