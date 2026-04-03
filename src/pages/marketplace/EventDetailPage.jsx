import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { getEventById, getSavedItems, toggleSavedItem } from '@/services'

function formatPrice(value) {
  if (value === 0) return 'Free'
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value)
}

export default function EventDetailPage() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savedMap, setSavedMap] = useState(() => getSavedItems())

  useEffect(() => {
    let active = true

    async function loadDetail() {
      setLoading(true)
      setError('')

      try {
        const item = await getEventById(id)
        if (active) setEvent(item)
      } catch {
        if (active) setError('Unable to load event details right now.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDetail()
    return () => {
      active = false
    }
  }, [id])

  const isSaved = useMemo(() => (savedMap.events ?? []).includes(id), [savedMap.events, id])

  function onToggleSaved() {
    const updated = toggleSavedItem('events', id)
    setSavedMap(updated)
  }

  return (
    <div className="px-space-4 py-space-6 space-y-space-4">
      <Link to="/events" className="text-label-sm text-primary-500">Back to events</Link>

      {loading && <LoadingState label="Loading event details..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && !event && <EmptyState message="Event not found." />}

      {!loading && !error && event && (
        <article className="rounded-lg border border-neutral-200 bg-white p-space-4 space-y-space-3">
          <div className="flex items-start justify-between gap-space-3">
            <h1 className="font-display text-heading-lg text-neutral-900">{event.title}</h1>
            <button
              type="button"
              onClick={onToggleSaved}
              className={`text-label-sm px-space-2 py-space-1 rounded-full border ${
                isSaved ? 'border-primary-400 text-primary-500 bg-primary-50' : 'border-neutral-200 text-neutral-500'
              }`}
            >
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
          <p className="font-body text-body-sm text-neutral-500">{event.venue} - {event.city}</p>
          <p className="font-body text-body-sm text-neutral-500">{event.date} at {event.startTime}</p>
          <p className="font-display text-heading-md text-primary-500">{formatPrice(event.pricePhp)}</p>
          <p className="font-body text-body-sm text-neutral-600">Category: {event.category}</p>
          <p className="font-body text-body-sm text-neutral-600">Sold: {event.soldPercent}%</p>
        </article>
      )}
    </div>
  )
}
