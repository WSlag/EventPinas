import { useCallback, useEffect, useMemo, useState } from 'react'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import {
  approveFeaturedWithRankShift,
  listPendingFeaturedRequests,
  rejectFeaturedRequest,
} from '@/services'

function formatTimestamp(value) {
  if (!value) return 'N/A'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'N/A'
  return parsed.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function parseRankInput(value) {
  const normalized = String(value ?? '').trim()
  if (!normalized) return null
  if (!/^\d+$/.test(normalized)) return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

export default function AdminPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyActionKey, setBusyActionKey] = useState('')
  const [rankDrafts, setRankDrafts] = useState({})
  const [approveNoteDrafts, setApproveNoteDrafts] = useState({})
  const [rejectReasonDrafts, setRejectReasonDrafts] = useState({})
  const [itemErrors, setItemErrors] = useState({})
  const [bannerMessage, setBannerMessage] = useState('')

  const loadPending = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const payload = await listPendingFeaturedRequests({}, { simulateLatency: false })
      setItems(payload)
      setRankDrafts((current) => {
        const next = { ...current }
        payload.forEach((item, index) => {
          if (typeof next[item.id] === 'string') return
          next[item.id] = String(index)
        })
        return next
      })
    } catch (loadError) {
      setError(loadError?.message ?? 'Unable to load pending featured requests right now.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPending()
  }, [loadPending])

  const pendingCountLabel = useMemo(
    () => `${items.length} pending request${items.length === 1 ? '' : 's'}`,
    [items.length],
  )

  async function onApprove(item) {
    const rank = parseRankInput(rankDrafts[item.id])
    if (!Number.isInteger(rank)) {
      setItemErrors((current) => ({ ...current, [item.id]: 'Featured rank must be a non-negative integer.' }))
      return
    }

    setBusyActionKey(`${item.id}:approve`)
    setItemErrors((current) => ({ ...current, [item.id]: '' }))
    setBannerMessage('')
    try {
      await approveFeaturedWithRankShift(
        item.id,
        {
          featuredRank: rank,
          approveNote: approveNoteDrafts[item.id] ?? '',
        },
        { simulateLatency: false, syncLocalFallback: true },
      )
      setBannerMessage(`Approved featured placement for ${item.title}.`)
      await loadPending()
    } catch (approveError) {
      setItemErrors((current) => ({ ...current, [item.id]: approveError?.message ?? 'Unable to approve this featured request.' }))
    } finally {
      setBusyActionKey('')
    }
  }

  async function onReject(item) {
    const rejectReason = String(rejectReasonDrafts[item.id] ?? '').trim()
    if (!rejectReason) {
      setItemErrors((current) => ({ ...current, [item.id]: 'Reject reason is required.' }))
      return
    }

    setBusyActionKey(`${item.id}:reject`)
    setItemErrors((current) => ({ ...current, [item.id]: '' }))
    setBannerMessage('')
    try {
      await rejectFeaturedRequest(
        item.id,
        { rejectReason },
        { simulateLatency: false, syncLocalFallback: true },
      )
      setBannerMessage(`Rejected featured request for ${item.title}.`)
      await loadPending()
    } catch (rejectError) {
      setItemErrors((current) => ({ ...current, [item.id]: rejectError?.message ?? 'Unable to reject this featured request.' }))
    } finally {
      setBusyActionKey('')
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-space-4 py-space-6 md:px-space-6 md:py-space-8">
      <header className="rounded-2xl border border-neutral-200 bg-white p-space-4 shadow-sm md:p-space-6">
        <p className="font-display text-overline uppercase tracking-wide text-secondary-700">Platform Operations</p>
        <h1 className="mt-space-1 font-display text-display-lg text-neutral-900">Admin Console</h1>
        <p className="mt-space-2 font-body text-body-sm text-neutral-600">
          Moderate pending featured-event requests with explicit ranking and audit-safe actions.
        </p>
        <p className="mt-space-3 inline-flex rounded-full bg-neutral-100 px-space-3 py-space-1 font-body text-label-sm text-neutral-700">
          {pendingCountLabel}
        </p>
      </header>

      <section className="mt-space-4 space-y-space-3">
        {bannerMessage && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-space-3">
            <p className="font-body text-body-sm text-emerald-700">{bannerMessage}</p>
          </div>
        )}

        {loading && <LoadingState label="Loading pending featured requests..." />}
        {!loading && error && <ErrorState message={error} />}
        {!loading && !error && items.length === 0 && (
          <EmptyState message="No pending featured requests right now." />
        )}

        {!loading && !error && items.length > 0 && (
          <div className="space-y-space-3">
            {items.map((item) => {
              const approveBusy = busyActionKey === `${item.id}:approve`
              const rejectBusy = busyActionKey === `${item.id}:reject`
              const rowBusy = Boolean(busyActionKey) && (approveBusy || rejectBusy)
              const itemError = itemErrors[item.id]
              return (
                <article key={item.id} className="rounded-xl border border-neutral-200 bg-white p-space-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-space-2">
                    <div>
                      <h2 className="font-display text-heading-lg text-neutral-900">{item.title}</h2>
                      <p className="mt-space-1 font-body text-body-sm text-neutral-600">
                        {item.city} - {item.venue} - {item.date}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-space-3 py-space-1 font-body text-label-sm text-amber-700">
                      Pending
                    </span>
                  </div>

                  <div className="mt-space-3 grid gap-space-2 text-body-sm text-neutral-700 md:grid-cols-2">
                    <p>
                      Requested by: <span className="font-medium">{item.featureRequestedByUid ?? 'N/A'}</span>
                    </p>
                    <p>
                      Requested at: <span className="font-medium">{formatTimestamp(item.featureRequestedAt)}</span>
                    </p>
                  </div>

                  <div className="mt-space-4 grid gap-space-3 md:grid-cols-2">
                    <label className="block">
                      <span className="font-body text-label-sm text-neutral-700">Featured rank</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={rankDrafts[item.id] ?? ''}
                        onChange={(event) => setRankDrafts((current) => ({ ...current, [item.id]: event.target.value }))}
                        aria-label={`Featured rank for ${item.title}`}
                        className="mt-space-1 h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm text-neutral-900"
                      />
                    </label>

                    <label className="block">
                      <span className="font-body text-label-sm text-neutral-700">Approve note (optional)</span>
                      <input
                        value={approveNoteDrafts[item.id] ?? ''}
                        onChange={(event) => setApproveNoteDrafts((current) => ({ ...current, [item.id]: event.target.value }))}
                        aria-label={`Approve note for ${item.title}`}
                        className="mt-space-1 h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm text-neutral-900"
                        placeholder="Optional moderation note"
                      />
                    </label>
                  </div>

                  <label className="mt-space-3 block">
                    <span className="font-body text-label-sm text-neutral-700">Reject reason</span>
                    <textarea
                      value={rejectReasonDrafts[item.id] ?? ''}
                      onChange={(event) => setRejectReasonDrafts((current) => ({ ...current, [item.id]: event.target.value }))}
                      aria-label={`Reject reason for ${item.title}`}
                      rows={2}
                      className="mt-space-1 w-full rounded-md border border-neutral-200 bg-white px-space-3 py-space-2 text-body-sm text-neutral-900"
                      placeholder="Required if rejecting this request"
                    />
                  </label>

                  {itemError && (
                    <p className="mt-space-2 rounded-md border border-red-200 bg-red-50 p-space-2 font-body text-body-sm text-red-700">
                      {itemError}
                    </p>
                  )}

                  <div className="mt-space-3 flex flex-wrap gap-space-2">
                    <button
                      type="button"
                      disabled={rowBusy}
                      onClick={() => onApprove(item)}
                      className="rounded-full bg-primary-400 px-space-4 py-space-2 font-display text-label-md text-white disabled:opacity-60"
                    >
                      {approveBusy ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      disabled={rowBusy}
                      onClick={() => onReject(item)}
                      className="rounded-full bg-red-600 px-space-4 py-space-2 font-display text-label-md text-white disabled:opacity-60"
                    >
                      {rejectBusy ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
