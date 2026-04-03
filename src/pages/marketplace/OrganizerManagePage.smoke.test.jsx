import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'
import OrganizerManagePage from './OrganizerManagePage'
import ManageDashboardPage from './manage/ManageDashboardPage'
import ManageIncidentsPage from './manage/ManageIncidentsPage'
import ManageWaitlistPage from './manage/ManageWaitlistPage'
import ManageAnalyticsPage from './manage/ManageAnalyticsPage'
import ManageAuditPage from './manage/ManageAuditPage'

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
  it('renders organizer console shell and nested dashboard route', async () => {
    render(
      <MemoryRouter future={routerFuture} initialEntries={['/manage/dashboard']}>
        <Routes>
          <Route path="/manage" element={<OrganizerManagePage />}>
            <Route path="dashboard" element={<ManageDashboardPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: /operate your event day in one place/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(await screen.findByText(/total guests/i)).toBeInTheDocument()
  })

  it('renders incidents module route', async () => {
    render(
      <MemoryRouter future={routerFuture} initialEntries={['/manage/incidents?event=m-evt-001']}>
        <Routes>
          <Route path="/manage" element={<OrganizerManagePage />}>
            <Route path="incidents" element={<ManageIncidentsPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: /incident log/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add incident/i })).toBeInTheDocument()
  })

  it('renders waitlist module route', async () => {
    render(
      <MemoryRouter future={routerFuture} initialEntries={['/manage/waitlist?event=m-evt-001']}>
        <Routes>
          <Route path="/manage" element={<OrganizerManagePage />}>
            <Route path="waitlist" element={<ManageWaitlistPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: /waitlist & capacity/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add entry/i })).toBeInTheDocument()
  })

  it('renders analytics module route', async () => {
    render(
      <MemoryRouter future={routerFuture} initialEntries={['/manage/analytics?event=m-evt-001']}>
        <Routes>
          <Route path="/manage" element={<OrganizerManagePage />}>
            <Route path="analytics" element={<ManageAnalyticsPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: /live analytics & exports/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument()
  })

  it('renders audit module route', async () => {
    render(
      <MemoryRouter future={routerFuture} initialEntries={['/manage/audit?event=m-evt-001']}>
        <Routes>
          <Route path="/manage" element={<OrganizerManagePage />}>
            <Route path="audit" element={<ManageAuditPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: /audit trail/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/search summary, action, or role/i)).toBeInTheDocument()
  })
})
