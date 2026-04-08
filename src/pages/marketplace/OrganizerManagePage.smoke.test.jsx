import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, vi } from 'vitest'
import OrganizerManagePage from './OrganizerManagePage'
import ManageDashboardPage from './manage/ManageDashboardPage'
import ManageEventsPage from './manage/ManageEventsPage'
import ManageIncidentsPage from './manage/ManageIncidentsPage'
import ManageCheckinPage from './manage/ManageCheckinPage'
import ManageWaitlistPage from './manage/ManageWaitlistPage'
import ManageAnalyticsPage from './manage/ManageAnalyticsPage'
import ManageAuditPage from './manage/ManageAuditPage'
import ManagePlannerPage from './manage/ManagePlannerPage'
import ManageSeatingPage from './manage/ManageSeatingPage'
import ManageGuestsPage from './manage/ManageGuestsPage'
import ManageOnsiteRegistrationPage from './manage/ManageOnsiteRegistrationPage'
import ManageQrPage from './manage/ManageQrPage'
import { createManageEvent, createManageGuest, listManageEvents, listManageWaitlist } from '@/services'

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}

const MANAGE_STORAGE_KEY = 'eventpinas-manage-state'
const MANAGE_NAV_ORDER_KEY = 'mgmt-nav-order'
const MANAGE_NAV_ORDER_V2_KEY = 'mgmt-nav-order-v2'

beforeEach(() => {
  localStorage.removeItem(MANAGE_STORAGE_KEY)
  localStorage.removeItem(MANAGE_NAV_ORDER_KEY)
  localStorage.removeItem(MANAGE_NAV_ORDER_V2_KEY)
})

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

    expect(await screen.findByText(/drag tiles to reorder/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(await screen.findByText(/seating snapshot/i)).toBeInTheDocument()
  })

  it('uses lifecycle-first default module order in desktop sidebar', async () => {
    render(
      <MemoryRouter future={routerFuture} initialEntries={['/manage/dashboard']}>
        <Routes>
          <Route path="/manage" element={<OrganizerManagePage />}>
            <Route path="dashboard" element={<ManageDashboardPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const nav = await screen.findByRole('navigation', { name: /manage modules/i })
    const labels = within(nav).getAllByRole('link').map((link) => (link.textContent ?? '').trim().toLowerCase())
    expect(labels.slice(0, 3)).toEqual(['dashboard', 'my events', 'event planner'])
  })

  it('ignores legacy module-order key so new default order is applied', async () => {
    localStorage.setItem(
      MANAGE_NAV_ORDER_KEY,
      JSON.stringify(['checkin', 'guests', 'seating', 'dashboard', 'events', 'planner']),
    )

    render(
      <MemoryRouter future={routerFuture} initialEntries={['/manage/dashboard']}>
        <Routes>
          <Route path="/manage" element={<OrganizerManagePage />}>
            <Route path="dashboard" element={<ManageDashboardPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const nav = await screen.findByRole('navigation', { name: /manage modules/i })
    const labels = within(nav).getAllByRole('link').map((link) => (link.textContent ?? '').trim().toLowerCase())
    expect(labels.slice(0, 3)).toEqual(['dashboard', 'my events', 'event planner'])
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

  it('renders check-in scan log filters and export action', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter future={routerFuture} initialEntries={['/manage/checkin?event=m-evt-001']}>
        <Routes>
          <Route path="/manage" element={<OrganizerManagePage />}>
            <Route path="checkin" element={<ManageCheckinPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: /check-in \/ scanner/i })).toBeInTheDocument()
    const scanInput = screen.getByPlaceholderText(/paste guest id, payload, or \/qr\/event\/guest url/i)
    await user.type(scanInput, 'invalid-qr-code')
    await user.click(screen.getByRole('button', { name: /^scan$/i }))
    expect(await screen.findByText(/invalid qr scan/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^error$/i }))
    expect(screen.getByRole('button', { name: /export scan log csv/i })).toBeInTheDocument()
  })

  it('renders qr module with copy/link/download/export actions', async () => {
    const user = userEvent.setup()
    const clipboardWrite = vi.fn(async () => {})
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: clipboardWrite },
      configurable: true,
    })

    render(
      <MemoryRouter future={routerFuture} initialEntries={['/manage/qr?event=m-evt-001']}>
        <Routes>
          <Route path="/manage" element={<OrganizerManagePage />}>
            <Route path="qr" element={<ManageQrPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: /qr generator & validator/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /download qr png/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /export all qr bundle/i })).toBeInTheDocument()

    const copyShareLinkButton = await screen.findByRole('button', { name: /copy share link/i })
    expect(copyShareLinkButton).toBeEnabled()
    await user.click(copyShareLinkButton)
    expect(await screen.findByText(/share link copied/i)).toBeInTheDocument()
    expect(clipboardWrite).toHaveBeenCalled()
  })

  it('validates csv preview state on guests page', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter future={routerFuture} initialEntries={['/manage/guests?event=m-evt-001']}>
        <Routes>
          <Route path="/manage" element={<OrganizerManagePage />}>
            <Route path="guests" element={<ManageGuestsPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: /guest management/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^import$/i }))
    expect(await screen.findByText(/ready|needs fixes/i)).toBeInTheDocument()

    const csvInput = screen.getByLabelText(/guest csv input/i)
    await user.clear(csvInput)
    await user.type(csvInput, 'ticketType,phone\nVIP,+639111111111')
    expect(await screen.findByText(/missing required "name" header/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /import csv/i })).toBeDisabled()

    const uploadInput = screen.getByLabelText(/upload csv file/i)
    const uploadFile = new File(['name,ticketType\nUploaded Guest,VIP\n'], 'guests.csv', { type: 'text/csv' })
    await user.upload(uploadInput, uploadFile)
    const fileBadges = await screen.findAllByText(/guests\.csv/i)
    expect(fileBadges.length).toBeGreaterThan(0)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /import csv/i })).toBeEnabled()
    })
  })

  it('supports inline seat assignment in guests page and guards checked-in guests', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter future={routerFuture} initialEntries={['/manage/guests?event=m-evt-001']}>
        <Routes>
          <Route path="/manage" element={<OrganizerManagePage />}>
            <Route path="guests" element={<ManageGuestsPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: /guest management/i })).toBeInTheDocument()

    const carlosSelects = screen.getAllByRole('combobox', { name: /seat for carlos reyes/i })
    const carlosTableSelect = carlosSelects[0]
    await user.selectOptions(carlosTableSelect, 'T3')
    const selectContainer = carlosTableSelect.closest('div')
    await user.click(within(selectContainer).getByRole('button', { name: /^set$/i }))
    expect(await screen.findByText(/seat assigned for carlos reyes: t3/i)).toBeInTheDocument()

    expect(screen.queryByRole('combobox', { name: /seat for ana reyes/i })).not.toBeInTheDocument()
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

  it('creates a new event from the two-step wizard and routes to planner', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter future={routerFuture} initialEntries={['/manage/events?event=m-evt-001']}>
        <Routes>
          <Route path="/manage" element={<OrganizerManagePage />}>
            <Route path="events" element={<ManageEventsPage />} />
            <Route path="planner" element={<ManagePlannerPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: /my events/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /\+ create event/i }))

    const titleInput = screen.getByLabelText(/event title/i)
    await user.type(titleInput, 'Lagbas Homecoming 2026')
    await user.type(screen.getByLabelText(/event date/i), '2026-11-22')
    await user.clear(screen.getByLabelText(/guest capacity/i))
    await user.type(screen.getByLabelText(/guest capacity/i), '160')
    await user.type(screen.getByLabelText(/^city$/i), 'Davao City')
    await user.type(screen.getByLabelText(/^venue$/i), 'Abreeza Hall B')

    await user.click(screen.getByRole('button', { name: /^next$/i }))
    expect(screen.getByText(/auto-generated seating/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^create event$/i }))
    expect(await screen.findByRole('heading', { name: /event planner/i })).toBeInTheDocument()
  })

  it('edits an event from my events and updates visible details', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter future={routerFuture} initialEntries={['/manage/events?event=m-evt-001']}>
        <Routes>
          <Route path="/manage" element={<OrganizerManagePage />}>
            <Route path="events" element={<ManageEventsPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: /my events/i })).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: /^edit$/i })[0])

    const titleInput = screen.getByLabelText(/event title/i)
    await user.clear(titleInput)
    await user.type(titleInput, 'Edited Reunion Name')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    const events = await listManageEvents({}, { simulateLatency: false })
    expect(events.some((event) => event.title === 'Edited Reunion Name')).toBe(true)
  })

  it('handles table add, seat update, and remove controls on seating page', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter future={routerFuture} initialEntries={['/manage/seating?event=m-evt-001']}>
        <Routes>
          <Route path="/manage" element={<OrganizerManagePage />}>
            <Route path="seating" element={<ManageSeatingPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: /seating & tables/i })).toBeInTheDocument()
    expect(screen.getByText(/checked-in guests are locked and cannot be dragged/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /liza mangubat is checked in and locked/i })).toBeDisabled()
    expect(screen.getByText(/total seats: 60/i)).toBeInTheDocument()

    await user.type(screen.getByPlaceholderText(/optional label/i), 'QA-1')
    await user.clear(screen.getByPlaceholderText(/^seats$/i))
    await user.type(screen.getByPlaceholderText(/^seats$/i), '4')
    await user.click(screen.getByRole('button', { name: /^add table$/i }))
    expect(await screen.findByRole('heading', { name: /auto-adjust to event capacity/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(screen.queryByRole('heading', { name: /auto-adjust to event capacity/i })).not.toBeInTheDocument()
    expect(screen.getByText(/total seats: 60/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^add table$/i }))
    expect(await screen.findByRole('heading', { name: /auto-adjust to event capacity/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /apply & auto-adjust/i }))
    expect(await screen.findByText(/table qa-1 added/i)).toBeInTheDocument()
    expect(await screen.findByText(/total seats: 250/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /qa-1/i }))
    const detailSeatsInput = screen.getByRole('spinbutton', { name: /seats/i })
    await user.clear(detailSeatsInput)
    await user.type(detailSeatsInput, '6')
    await user.click(screen.getByRole('button', { name: /^save seats$/i }))
    expect(await screen.findByRole('heading', { name: /auto-adjust to event capacity/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /apply & auto-adjust/i }))
    expect(await screen.findByText(/updated seats for qa-1/i)).toBeInTheDocument()
    expect(await screen.findByText(/total seats: 250/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /t1/i }))
    expect(screen.getByText(/table has assigned guests/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^remove table$/i })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /qa-1/i }))
    await user.click(screen.getByRole('button', { name: /^remove table$/i }))
    expect(await screen.findByRole('heading', { name: /auto-adjust to event capacity/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /apply & auto-adjust/i }))
    expect(await screen.findByText(/removed table qa-1/i)).toBeInTheDocument()
    expect(await screen.findByText(/total seats: 250/i)).toBeInTheDocument()
  })

  it('shows full-capacity reminder on on-site registration when no slots remain', async () => {
    const created = await createManageEvent(
      {
        title: 'Onsite Full Capacity QA',
        date: '2026-12-30',
        city: 'Davao City',
        venue: 'Hall Z',
        guestCapacity: 1,
      },
      { simulateLatency: false },
    )
    await createManageGuest(
      created.event.id,
      { name: 'Capacity Filled Guest', ticketType: 'General' },
      { simulateLatency: false },
    )

    render(
      <MemoryRouter future={routerFuture} initialEntries={[`/manage/registration-onsite?event=${created.event.id}`]}>
        <Routes>
          <Route path="/manage" element={<OrganizerManagePage />}>
            <Route path="registration-onsite" element={<ManageOnsiteRegistrationPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: /on-site registration/i })).toBeInTheDocument()
    expect(await screen.findByText(/available slots: 0/i)).toBeInTheDocument()
    expect(screen.getByText(/walk-ins paused: event is full/i)).toBeInTheDocument()
  })

  it('sends walk-in draft to waitlist from on-site registration when full', async () => {
    const user = userEvent.setup()
    const created = await createManageEvent(
      {
        title: 'Onsite Waitlist Bridge QA',
        date: '2026-12-31',
        city: 'Davao City',
        venue: 'Hall Y',
        guestCapacity: 1,
      },
      { simulateLatency: false },
    )
    await createManageGuest(
      created.event.id,
      { name: 'Capacity Full Guest', ticketType: 'General' },
      { simulateLatency: false },
    )

    render(
      <MemoryRouter future={routerFuture} initialEntries={[`/manage/registration-onsite?event=${created.event.id}`]}>
        <Routes>
          <Route path="/manage" element={<OrganizerManagePage />}>
            <Route path="registration-onsite" element={<ManageOnsiteRegistrationPage />} />
            <Route path="waitlist" element={<ManageWaitlistPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: /on-site registration/i })).toBeInTheDocument()
    expect(await screen.findByText(/available slots: 0/i)).toBeInTheDocument()

    await user.type(screen.getByPlaceholderText(/guest full name/i), 'Late Walkin Person')
    await user.click(screen.getByRole('button', { name: /send to waitlist/i }))
    expect(await screen.findByText(/late walkin person added to waitlist/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /open waitlist module/i }))
    expect(await screen.findByRole('heading', { name: /waitlist & capacity/i })).toBeInTheDocument()

    const waitlist = await listManageWaitlist(created.event.id, { status: 'waiting' }, { simulateLatency: false })
    expect(waitlist.some((entry) => entry.name === 'Late Walkin Person')).toBe(true)
  })
})
