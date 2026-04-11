import { beforeEach, describe, expect, it } from 'vitest'
import {
  ADMIN_MODERATION_LOGS_STORAGE_KEY,
  PUBLIC_MARKETPLACE_EVENTS_STORAGE_KEY,
  approveFeaturedWithRankShift,
  getPublicEventById,
  listAdminModerationLogs,
  listPendingFeaturedRequests,
  rejectFeaturedRequest,
  upsertPublicMarketplaceEvent,
} from './marketplaceService'

describe('marketplaceService admin moderation', () => {
  beforeEach(() => {
    localStorage.removeItem(PUBLIC_MARKETPLACE_EVENTS_STORAGE_KEY)
    localStorage.removeItem(ADMIN_MODERATION_LOGS_STORAGE_KEY)
  })

  it('lists pending featured requests ordered by request timestamp', async () => {
    await upsertPublicMarketplaceEvent(
      {
        id: 'pending-001',
        title: 'Pending Early',
        date: '2026-12-11',
        city: 'Davao City',
        venue: 'Hall A',
        isPublic: true,
        featureStatus: 'pending',
        isFeatured: false,
        featuredRank: null,
        featureRequestedAt: '2026-01-01T08:00:00.000Z',
        featureRequestedByUid: 'org-1',
      },
      { forceLocal: true },
    )
    await upsertPublicMarketplaceEvent(
      {
        id: 'pending-002',
        title: 'Pending Late',
        date: '2026-12-12',
        city: 'Davao City',
        venue: 'Hall B',
        isPublic: true,
        featureStatus: 'pending',
        isFeatured: false,
        featuredRank: null,
        featureRequestedAt: '2026-01-02T08:00:00.000Z',
        featureRequestedByUid: 'org-2',
      },
      { forceLocal: true },
    )
    await upsertPublicMarketplaceEvent(
      {
        id: 'approved-001',
        title: 'Already Featured',
        date: '2026-12-10',
        city: 'Davao City',
        venue: 'Hall C',
        isPublic: true,
        featureStatus: 'approved',
        isFeatured: true,
        featuredRank: 0,
      },
      { forceLocal: true },
    )

    const pending = await listPendingFeaturedRequests({}, { forceLocal: true, simulateLatency: false })
    expect(pending.map((event) => event.id)).toEqual(['pending-001', 'pending-002'])
  })

  it('requires reject reason and writes rejected moderation state', async () => {
    await upsertPublicMarketplaceEvent(
      {
        id: 'pending-reject-001',
        title: 'Reject Me',
        date: '2026-12-20',
        city: 'Davao City',
        venue: 'Hall R',
        isPublic: true,
        featureStatus: 'pending',
        isFeatured: false,
        featureRequestedAt: '2026-01-03T08:00:00.000Z',
      },
      { forceLocal: true },
    )

    await expect(
      rejectFeaturedRequest(
        'pending-reject-001',
        { rejectReason: '' },
        { forceLocal: true, simulateLatency: false },
      ),
    ).rejects.toThrow(/reject reason is required/i)

    await rejectFeaturedRequest(
      'pending-reject-001',
      { rejectReason: 'Missing quality baseline.' },
      { forceLocal: true, simulateLatency: false, actorUid: 'admin-1' },
    )

    const updated = await getPublicEventById('pending-reject-001', {
      forceLocal: true,
      includeUnpublished: true,
      simulateLatency: false,
    })
    expect(updated?.featureStatus).toBe('rejected')
    expect(updated?.featureRejectReason).toBe('Missing quality baseline.')
    expect(updated?.featureModeratedByUid).toBe('admin-1')
  })

  it('approves with rank-shift and records moderation logs', async () => {
    await upsertPublicMarketplaceEvent(
      {
        id: 'approved-rank-0',
        title: 'Rank 0',
        date: '2026-12-01',
        city: 'Davao City',
        venue: 'Hall A',
        isPublic: true,
        featureStatus: 'approved',
        isFeatured: true,
        featuredRank: 0,
      },
      { forceLocal: true },
    )
    await upsertPublicMarketplaceEvent(
      {
        id: 'approved-rank-1',
        title: 'Rank 1',
        date: '2026-12-02',
        city: 'Davao City',
        venue: 'Hall B',
        isPublic: true,
        featureStatus: 'approved',
        isFeatured: true,
        featuredRank: 1,
      },
      { forceLocal: true },
    )
    await upsertPublicMarketplaceEvent(
      {
        id: 'pending-approve-001',
        title: 'Pending Target',
        date: '2026-12-03',
        city: 'Davao City',
        venue: 'Hall C',
        isPublic: true,
        featureStatus: 'pending',
        isFeatured: false,
        featureRequestedAt: '2026-01-04T08:00:00.000Z',
      },
      { forceLocal: true },
    )

    const result = await approveFeaturedWithRankShift(
      'pending-approve-001',
      { featuredRank: 1, approveNote: 'Fits homepage campaign.' },
      { forceLocal: true, simulateLatency: false, actorUid: 'admin-2' },
    )

    expect(result.shifted).toEqual([{ eventId: 'approved-rank-1', fromRank: 1, toRank: 2 }])

    const shifted = await getPublicEventById('approved-rank-1', {
      forceLocal: true,
      includeUnpublished: true,
      simulateLatency: false,
    })
    const approved = await getPublicEventById('pending-approve-001', {
      forceLocal: true,
      includeUnpublished: true,
      simulateLatency: false,
    })
    expect(shifted?.featuredRank).toBe(2)
    expect(approved?.featureStatus).toBe('approved')
    expect(approved?.featuredRank).toBe(1)
    expect(approved?.featureApproveNote).toBe('Fits homepage campaign.')

    const logs = await listAdminModerationLogs({}, { forceLocal: true, simulateLatency: false })
    expect(logs.some((entry) => entry.eventId === 'pending-approve-001' && entry.action === 'feature_approved')).toBe(true)
  })

  it('keeps unique ranks for back-to-back approvals at same target rank', async () => {
    await upsertPublicMarketplaceEvent(
      {
        id: 'approved-existing',
        title: 'Existing Featured',
        date: '2026-12-07',
        city: 'Davao City',
        venue: 'Hall Existing',
        isPublic: true,
        featureStatus: 'approved',
        isFeatured: true,
        featuredRank: 0,
      },
      { forceLocal: true },
    )
    await upsertPublicMarketplaceEvent(
      {
        id: 'pending-a',
        title: 'Pending A',
        date: '2026-12-08',
        city: 'Davao City',
        venue: 'Hall A',
        isPublic: true,
        featureStatus: 'pending',
        isFeatured: false,
      },
      { forceLocal: true },
    )
    await upsertPublicMarketplaceEvent(
      {
        id: 'pending-b',
        title: 'Pending B',
        date: '2026-12-09',
        city: 'Davao City',
        venue: 'Hall B',
        isPublic: true,
        featureStatus: 'pending',
        isFeatured: false,
      },
      { forceLocal: true },
    )

    await Promise.all([
      approveFeaturedWithRankShift('pending-a', { featuredRank: 1 }, { forceLocal: true, simulateLatency: false, actorUid: 'admin-1' }),
      approveFeaturedWithRankShift('pending-b', { featuredRank: 1 }, { forceLocal: true, simulateLatency: false, actorUid: 'admin-2' }),
    ])

    const approvedA = await getPublicEventById('pending-a', { forceLocal: true, includeUnpublished: true, simulateLatency: false })
    const approvedB = await getPublicEventById('pending-b', { forceLocal: true, includeUnpublished: true, simulateLatency: false })
    const existing = await getPublicEventById('approved-existing', { forceLocal: true, includeUnpublished: true, simulateLatency: false })
    const ranks = [approvedA?.featuredRank, approvedB?.featuredRank, existing?.featuredRank].filter(Number.isInteger)
    expect(new Set(ranks).size).toBe(ranks.length)
  })
})
