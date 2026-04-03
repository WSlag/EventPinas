import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { getMarketplaceFilterOptions, getSavedItems, listEvents, toggleSavedItem } from '@/services'

function formatPrice(value) {
  if (value === 0) return 'Free'
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value)
}

export default function EventsPage() {
  const filterOptions = useMemo(() => getMarketplaceFilterOptions(), [])
  const [category, setCategory] = useState('All')
  const [city, setCity] = useState('All')
  const [query, setQuery] = useState('')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savedMap, setSavedMap] = useState(() => getSavedItems())

  useEffect(() => {
    let active = true

    async function loadEvents() {
      setLoading(true)
      setError('')

      try {
        const items = await listEvents({ category, city, query, sortBy: 'dateAsc' })
        if (active) setEvents(items)
      } catch {
        if (active) setError('Unable to load events right now.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadEvents()
    return () => {
      active = false
    }
  }, [category, city, query])

  const savedEvents = useMemo(() => new Set(savedMap.events ?? []), [savedMap.events])

  function onToggleSaved(id) {
    const updated = toggleSavedItem('events', id)
    setSavedMap(updated)
  }

  return (
    <div className="px-space-4 py-space-6 space-y-space-4">
      <header>
        <h1 className="font-display text-heading-lg text-neutral-800">Events</h1>
        <p className="font-body text-body-sm text-neutral-500 mt-space-1">Find events across Mindanao, Visayas, and beyond.</p>
      </header>

      <div className="grid grid-cols-2 gap-space-2">
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
        >
          {filterOptions.categories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <select
          value={city}
          onChange={(event) => setCity(event.target.value)}
          className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
        >
          <option value="All">All cities</option>
          {filterOptions.cities.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search event title, venue, or tag"
        className="w-full h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
      />

      {loading && <LoadingState label="Loading events..." />}
      {error && <ErrorState message={error} />}

      {!loading && !error && events.length === 0 && <EmptyState message="No events matched your filters." />}

      {!loading && !error && events.length > 0 && (
        <div className="space-y-space-3">
          {events.map((event) => (
            <article key={event.id} className="rounded-lg border border-neutral-200 bg-white p-space-4">
              <div className="flex items-start justify-between gap-space-3">
                <div>
                  <Link to={`/events/${event.id}`} className="font-display text-heading-sm text-neutral-900 hover:text-primary-500">
                    {event.title}
                  </Link>
                  <p className="font-body text-body-sm text-neutral-500 mt-space-1">{event.venue}</p>
                  <p className="font-body text-body-sm text-neutral-500">{event.city} - {event.date}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleSaved(event.id)}
                  className={`text-label-sm px-space-2 py-space-1 rounded-full border ${
                    savedEvents.has(event.id)
                      ? 'border-primary-400 text-primary-500 bg-primary-50'
                      : 'border-neutral-200 text-neutral-500'
                  }`}
                >
                  {savedEvents.has(event.id) ? 'Saved' : 'Save'}
                </button>
              </div>
              <p className="font-display text-heading-sm text-primary-500 mt-space-3">{formatPrice(event.pricePhp)}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
