import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { FilterPanel, HeroBanner, PageShell, SectionHeader, StatChip, SurfaceCard } from '@/components/ui/MarketplacePrimitives'
import { getMarketplaceFilterOptions, getSavedItems, listEvents, toggleSavedItem } from '@/services'

const sortOptions = [
  { id: 'dateAsc', label: 'Soonest' },
  { id: 'popular', label: 'Popular' },
  { id: 'priceAsc', label: 'Lowest Price' },
  { id: 'priceDesc', label: 'Highest Price' },
]

const eventImageByCategory = {
  Wedding: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
  Reunion: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1000&q=80',
  Festival: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1000&q=80',
  Concert: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80',
  Corporate: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1000&q=80',
  Community: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=80',
  Debut: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1000&q=80',
  Expo: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=80',
}

function formatPrice(value) {
  if (value === 0) return 'Free'
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value)
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

export default function EventsPage() {
  const filterOptions = useMemo(() => getMarketplaceFilterOptions(), [])
  const [category, setCategory] = useState('All')
  const [city, setCity] = useState('All')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('dateAsc')
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
        const items = await listEvents({ category, city, query, sortBy })
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
  }, [category, city, query, sortBy])

  const savedEvents = useMemo(() => new Set(savedMap.events ?? []), [savedMap.events])
  const hasFilters = category !== 'All' || city !== 'All' || query.trim().length > 0 || sortBy !== 'dateAsc'

  function onToggleSaved(id) {
    const updated = toggleSavedItem('events', id)
    setSavedMap(updated)
  }

  function resetFilters() {
    setCategory('All')
    setCity('All')
    setQuery('')
    setSortBy('dateAsc')
  }

  return (
    <PageShell className="space-y-space-6">
      <HeroBanner
        eyebrow="Event Discovery"
        title="Find events your community will remember."
        description="Browse public events across Mindanao, Visayas, and beyond. Save what you like and book fast."
        tone="dark"
      />

      <FilterPanel title="Filter events" showReset={hasFilters} onReset={resetFilters}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search event title, venue, or tag"
          className="h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
        />

        <div className="grid grid-cols-1 gap-space-2 md:grid-cols-2">
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

        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex min-w-max gap-space-2">
            {sortOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSortBy(option.id)}
                className={`rounded-full border px-space-3 py-space-1 text-label-sm transition-all duration-fast ${
                  sortBy === option.id
                    ? 'border-primary-400 bg-primary-50 text-primary-600'
                    : 'border-neutral-200 text-neutral-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-space-2">
          <StatChip label="Results" value={events.length} />
          <StatChip label="Saved" value={savedEvents.size} />
          <StatChip label="Location" value={city === 'All' ? 'All' : city} />
        </div>
      </FilterPanel>

      {loading && <LoadingState label="Loading events..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && events.length === 0 && <EmptyState message="No events matched your filters." />}

      {!loading && !error && events.length > 0 && (
        <section className="space-y-space-3">
          <SectionHeader title="Results" subtitle="Book what fits your audience and budget." />
          <div className="grid gap-space-3 md:grid-cols-2">
            {events.map((event) => (
              <SurfaceCard key={event.id} className="overflow-hidden p-0">
                <img
                  src={eventImageByCategory[event.category] || eventImageByCategory.Festival}
                  alt={event.title}
                  className="h-44 w-full object-cover"
                />
                <div className="p-space-4">
                  <div className="flex items-start justify-between gap-space-3">
                    <div>
                      <span className="inline-flex rounded-full bg-primary-50 px-space-2 py-1 font-display text-overline uppercase text-primary-600">
                        {event.category}
                      </span>
                      <Link to={`/events/${event.id}`} className="mt-space-1 block font-display text-heading-lg text-neutral-900 hover:text-info">
                        {event.title}
                      </Link>
                      <p className="font-body text-body-sm text-neutral-500">{event.venue}</p>
                      <p className="font-body text-body-sm text-neutral-500">{event.city} - {formatDate(event.date)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleSaved(event.id)}
                      className={`rounded-full border px-space-2 py-1 text-label-sm ${
                        savedEvents.has(event.id)
                          ? 'border-secondary-500 bg-secondary-50 text-secondary-700'
                          : 'border-neutral-300 text-neutral-500'
                      }`}
                    >
                      {savedEvents.has(event.id) ? 'Saved' : 'Save'}
                    </button>
                  </div>

                  {event.tags?.length > 0 && (
                    <div className="mt-space-2 flex flex-wrap gap-space-1">
                      {event.tags.map((tag) => (
                        <span key={`${event.id}-${tag}`} className="rounded-full bg-neutral-100 px-space-2 py-1 font-body text-caption-lg text-neutral-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-space-3">
                    <div className="mb-space-1 flex items-center justify-between">
                      <span className="font-body text-caption-lg text-neutral-500">Tickets sold</span>
                      <span className="font-display text-caption-lg text-neutral-700">{event.soldPercent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                      <div className="h-full rounded-full bg-primary-400" style={{ width: `${event.soldPercent}%` }} />
                    </div>
                  </div>

                  <p className="mt-space-3 font-display text-heading-md text-info">{formatPrice(event.pricePhp)}</p>
                </div>
              </SurfaceCard>
            ))}
          </div>
        </section>
      )}
    </PageShell>
  )
}
