import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach } from 'vitest'
import AdminPage from './AdminPage'
import {
  createManageEvent,
  getPublicEventById,
  listAdminModerationLogs,
  listPendingFeaturedRequests,
  publishManageEvent,
  requestManageEventFeatured,
} from '@/services'

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}

async function seedPendingFeaturedEvent(title = 'Admin Pending Event') {
  const created = await createManageEvent(
    {
      title,
      date: '2026-12-18',
      city: 'Davao City',
      venue: 'Admin QA Hall',
      guestCapacity: 120,
    },
    { simulateLatency: false },
  )
  await publishManageEvent(created.event.id, { simulateLatency: false })
  await requestManageEventFeatured(created.event.id, { simulateLatency: false, forceLocalMarketplace: true })
  return created.event.id
}

function renderPage() {
  return render(
    <MemoryRouter future={routerFuture} initialEntries={['/admin']}>
      <AdminPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
})

describe('AdminPage', () => {
  it('lists pending featured requests', async () => {
    await seedPendingFeaturedEvent('Featured Queue Event')
    renderPage()

    expect(await screen.findByRole('heading', { name: /admin console/i })).toBeInTheDocument()
    expect(await screen.findByText(/featured queue event/i)).toBeInTheDocument()
    expect(screen.getByText(/1 pending request/i)).toBeInTheDocument()
  })

  it('approves pending requests with manual rank and writes moderation logs', async () => {
    const user = userEvent.setup()
    const eventId = await seedPendingFeaturedEvent('Approve Flow Event')
    renderPage()

    const rankInput = await screen.findByLabelText(/featured rank for approve flow event/i)
    await user.clear(rankInput)
    await user.type(rankInput, '2')
    await user.type(screen.getByLabelText(/approve note for approve flow event/i), 'Prioritize this event.')
    await user.click(screen.getByRole('button', { name: /^approve$/i }))

    await waitFor(async () => {
      const pending = await listPendingFeaturedRequests({}, { simulateLatency: false, forceLocal: true })
      expect(pending.some((entry) => entry.id === eventId)).toBe(false)
    })
    expect(await screen.findByText(/approved featured placement for approve flow event/i)).toBeInTheDocument()

    const updated = await getPublicEventById(eventId, {
      includeUnpublished: true,
      simulateLatency: false,
      forceLocal: true,
    })
    expect(updated?.featureStatus).toBe('approved')
    expect(updated?.isFeatured).toBe(true)
    expect(updated?.featuredRank).toBe(2)
    expect(updated?.featureApproveNote).toBe('Prioritize this event.')

    const logs = await listAdminModerationLogs({}, { simulateLatency: false, forceLocal: true })
    expect(logs.some((entry) => entry.eventId === eventId && entry.action === 'feature_approved')).toBe(true)
  })

  it('requires a reject reason before rejecting a request', async () => {
    const user = userEvent.setup()
    const eventId = await seedPendingFeaturedEvent('Reject Flow Event')
    renderPage()

    await user.click(await screen.findByRole('button', { name: /^reject$/i }))
    expect(await screen.findByText(/reject reason is required/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/reject reason for reject flow event/i), 'Missing event quality threshold.')
    await user.click(screen.getByRole('button', { name: /^reject$/i }))

    await waitFor(async () => {
      const pending = await listPendingFeaturedRequests({}, { simulateLatency: false, forceLocal: true })
      expect(pending.some((entry) => entry.id === eventId)).toBe(false)
    })

    const updated = await getPublicEventById(eventId, {
      includeUnpublished: true,
      simulateLatency: false,
      forceLocal: true,
    })
    expect(updated?.featureStatus).toBe('rejected')
    expect(updated?.isFeatured).toBe(false)
    expect(updated?.featureRejectReason).toBe('Missing event quality threshold.')
  })
})
