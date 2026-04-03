import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { HeroBanner, PageShell, SectionHeader, StatChip, SurfaceCard } from '@/components/ui/MarketplacePrimitives'
import { getEventById, getSavedItems, toggleSavedItem } from '@/services'

const eventImageByCategory = {
  Wedding: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80',
  Reunion: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1400&q=80',
  Festival: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1400&q=80',
  Concert: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80',
  Corporate: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1400&q=80',
  Community: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1400&q=80',
  Debut: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1400&q=80',
  Expo: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1400&q=80',
}

function formatPrice(value) {
  if (value === 0) return 'Free'
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value)
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-PH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
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
    <PageShell className="space-y-space-6">
      <HeroBanner
        eyebrow="Event Details"
        title={event?.title ?? 'Loading event...'}
        description={event ? `${event.venue} - ${event.city}` : 'Fetching event info, pricing, and availability.'}
        tone="dark"
        actions={(
          <Link to="/events" className="rounded-full bg-white px-space-4 py-space-2 font-display text-label-md text-info">
            Back to events
          </Link>
        )}
      />

      {loading && <LoadingState label="Loading event details..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && !event && <EmptyState message="Event not found." />}

      {!loading && !error && event && (
        <>
          <SurfaceCard className="overflow-hidden p-0">
            <img
              src={eventImageByCategory[event.category] || eventImageByCategory.Festival}
              alt={event.title}
              className="h-64 w-full object-cover"
            />
            <div className="space-y-space-3 p-space-4">
              <div className="flex items-start justify-between gap-space-3">
                <div>
                  <span className="inline-flex rounded-full bg-primary-50 px-space-2 py-1 font-display text-overline uppercase text-primary-600">
                    {event.category}
                  </span>
                  <h1 className="mt-space-1 font-display text-heading-xl text-neutral-900">{event.title}</h1>
                </div>
                <button
                  type="button"
                  onClick={onToggleSaved}
                  className={`rounded-full border px-space-2 py-space-1 text-label-sm ${
                    isSaved ? 'border-secondary-500 bg-secondary-50 text-secondary-700' : 'border-neutral-300 text-neutral-500'
                  }`}
                >
                  {isSaved ? 'Saved' : 'Save'}
                </button>
              </div>

              <p className="font-body text-body-md text-neutral-600">{event.venue} - {event.city}</p>
              <p className="font-body text-body-md text-neutral-600">{formatDate(event.date)} at {event.startTime}</p>
              <p className="font-display text-display-lg text-info">{formatPrice(event.pricePhp)}</p>
            </div>
          </SurfaceCard>

          <section className="space-y-space-3">
            <SectionHeader title="Event Snapshot" />
            <div className="grid grid-cols-3 gap-space-2">
              <StatChip label="Category" value={event.category} />
              <StatChip label="Sold" value={`${event.soldPercent}%`} />
              <StatChip label="Price" value={formatPrice(event.pricePhp)} />
            </div>
          </section>
        </>
      )}
    </PageShell>
  )
}
