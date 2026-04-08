import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ManageBottomNav from './ManageBottomNav'

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}

const allPermissions = [
  'dashboard',
  'events',
  'planner',
  'onlineRegistration',
  'onsiteRegistration',
  'checkin',
  'guests',
  'seating',
  'qr',
  'staff',
  'incidents',
  'waitlist',
  'analytics',
  'audit',
]

const getManageBootstrapMock = vi.fn(async () => ({ selectedOperatorRole: 'admin' }))
const getManageRolePermissionsMock = vi.fn(() => allPermissions)

vi.mock('@/services', () => ({
  getManageBootstrap: (...args) => getManageBootstrapMock(...args),
  getManageRolePermissions: (...args) => getManageRolePermissionsMock(...args),
}))

function renderBottomNav(route = '/manage/dashboard?event=m-evt-001') {
  return render(
    <MemoryRouter future={routerFuture} initialEntries={[route]}>
      <ManageBottomNav />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  getManageBootstrapMock.mockClear()
  getManageRolePermissionsMock.mockClear()
})

describe('ManageBottomNav', () => {
  it('keeps mobile core items as dashboard, check-in, guests, seating', async () => {
    renderBottomNav()
    await screen.findByRole('link', { name: /dashboard/i })

    const nav = screen.getByRole('navigation', { name: /manage navigation/i })
    const labels = within(nav).getAllByRole('link').map((link) => (link.textContent ?? '').trim())
    expect(labels).toEqual(['Dashboard', 'Check-in', 'Guests', 'Seating'])
    expect(within(nav).queryByRole('link', { name: /my events/i })).not.toBeInTheDocument()
    expect(within(nav).queryByRole('link', { name: /event planner/i })).not.toBeInTheDocument()
  })

  it('shows My Events and Event Planner under More tools', async () => {
    const user = userEvent.setup()
    renderBottomNav()
    await screen.findByRole('link', { name: /dashboard/i })

    await user.click(screen.getByRole('button', { name: /more modules/i }))

    const panel = await screen.findByRole('dialog', { name: /more manage modules/i })
    const labels = within(panel).getAllByRole('link').map((link) => (link.textContent ?? '').trim())
    expect(labels.slice(0, 2)).toEqual(['My Events', 'Event Planner'])
    expect(within(panel).getByRole('link', { name: /my events/i })).toBeInTheDocument()
    expect(within(panel).getByRole('link', { name: /event planner/i })).toBeInTheDocument()
  })
})
