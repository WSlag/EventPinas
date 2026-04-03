import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import { LoadingState, ErrorState } from '@/components/ui/PageStates'
import { SectionHeader, SurfaceCard } from '@/components/ui/MarketplacePrimitives'
import { listManageEvents } from '@/services'

function formatDate(value) {
  return new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ManageEventsPage() {
  const { permissions } = useOutletContext()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [searchParams] = useSearchParams()
  const selectedEventId = searchParams.get('event')
  const navigate = useNavigate()
  const canAccessEvents = permissions.includes('events')

  useEffect(() => {
    if (!canAccessEvents) {
      setLoading(false)
      return
    }

    let active = true

    async function loadEvents() {
      setLoading(true)
      setError('')
      try {
        const payload = await listManageEvents({ query, status })
        if (active) setEvents(payload)
      } catch {
        if (active) setError('Unable to load your events right now.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadEvents()
    return () => {
      active = false
    }
  }, [query, status, canAccessEvents])

  function openEventConsole(eventId) {
    navigate(`/manage/dashboard?event=${eventId}`)
  }

  if (loading) return <LoadingState label="Loading organizer events..." />
  if (!canAccessEvents) return <ErrorState message="Your current role has no event-management permission." />
  if (error) return <ErrorState message={error} />

  return (
    <section className="space-y-space-3">
      <SectionHeader title="My Events" subtitle="Select an event to run event-day operations." />

      <div className="grid gap-space-2 md:grid-cols-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search event title, city, or venue"
          className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
        >
          <option value="All">All statuses</option>
          <option value="live">Live</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="grid gap-space-3 md:grid-cols-2">
        {events.map((event) => (
          <SurfaceCard key={event.id}>
            <div className="flex items-start justify-between gap-space-2">
              <div>
                <p className="font-display text-heading-md text-neutral-900">{event.title}</p>
                <p className="mt-space-1 font-body text-body-sm text-neutral-500">{event.venue}</p>
                <p className="font-body text-caption-lg text-neutral-500">{event.city} · {formatDate(event.date)}</p>
              </div>
              <span className={`rounded-full px-space-2 py-space-1 text-label-sm ${
                event.status === 'live'
                  ? 'bg-primary-50 text-primary-600'
                  : 'bg-neutral-100 text-neutral-600'
              }`}
              >
                {event.status}
              </span>
            </div>

            <div className="mt-space-3 flex items-center justify-between">
              <p className="font-body text-caption-lg text-neutral-500">Capacity: {event.guestCapacity}</p>
              <button
                type="button"
                onClick={() => openEventConsole(event.id)}
                className={`rounded-full px-space-3 py-space-1 font-display text-label-sm ${
                  selectedEventId === event.id
                    ? 'bg-info text-white'
                    : 'bg-neutral-100 text-neutral-700'
                }`}
              >
                {selectedEventId === event.id ? 'Active' : 'Open Console'}
              </button>
            </div>
          </SurfaceCard>
        ))}
      </div>
    </section>
  )
}


