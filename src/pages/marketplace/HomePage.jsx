import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { marketplaceCategories } from '@/data'
import { getHomeFeed, getSavedItems, toggleSavedItem } from '@/services'

function formatPhp(value) {
  if (value === 0) return 'Free'
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value)
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [feed, setFeed] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savedMap, setSavedMap] = useState(() => getSavedItems())

  useEffect(() => {
    let active = true

    async function loadFeed() {
      setLoading(true)
      setError('')

      try {
        const data = await getHomeFeed({ category: activeCategory })
        if (active) setFeed(data)
      } catch {
        if (active) setError('Unable to load homepage feed right now.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadFeed()
    return () => {
      active = false
    }
  }, [activeCategory])

  const savedEvents = useMemo(() => new Set(savedMap.events ?? []), [savedMap.events])
  const savedSuppliers = useMemo(() => new Set(savedMap.suppliers ?? []), [savedMap.suppliers])

  function onToggleSaved(type, id) {
    const updated = toggleSavedItem(type, id)
    setSavedMap(updated)
  }

  return (
    <div className="px-space-4 py-space-6 space-y-space-6">
      <header>
        <h1 className="font-display text-heading-lg text-neutral-800">Home</h1>
        <p className="font-body text-body-sm text-neutral-500 mt-space-1">Discover events and trusted suppliers near you.</p>
      </header>

      <section className="overflow-x-auto scrollbar-hide md:overflow-visible">
        <div className="flex gap-space-2 min-w-max md:min-w-0 md:flex-wrap">
          {marketplaceCategories.map((category) => {
            const active = category === activeCategory
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`px-space-3 py-space-1 rounded-full text-label-sm transition-all duration-fast ${
                  active
                    ? 'bg-primary-400 text-white shadow-primary'
                    : 'bg-white text-neutral-600 border border-neutral-200'
                }`}
              >
                {category}
              </button>
            )
          })}
        </div>
      </section>

      {loading && <LoadingState label="Loading marketplace feed..." />}
      {error && <ErrorState message={error} />}

      {!loading && !error && feed && (
        <>
          <section className="space-y-space-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-heading-md text-neutral-800">Featured Ads</h2>
            </div>
            <div className="space-y-space-3 md:grid md:grid-cols-2 md:gap-space-3 md:space-y-0 xl:grid-cols-3">
              {feed.adSlots.map((slot) => (
                <article key={slot.id} className="rounded-xl p-space-4 text-white" style={{ backgroundColor: slot.accent }}>
                  <p className="text-overline uppercase">{slot.tag}</p>
                  <h3 className="font-display text-heading-md mt-space-2">{slot.headline}</h3>
                  <p className="font-body text-body-sm mt-space-1">{slot.subtitle}</p>
                  <p className="font-body text-label-md mt-space-3">{slot.brand}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-space-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-heading-md text-neutral-800">Upcoming Events</h2>
              <Link to="/events" className="text-label-sm text-primary-500">See all</Link>
            </div>
            {feed.upcomingEvents.length === 0 && <EmptyState message="No events found for this category yet." />}
            <div className="space-y-space-3 md:grid md:grid-cols-2 md:gap-space-3 md:space-y-0">
              {feed.upcomingEvents.map((event) => (
                <article key={event.id} className="rounded-lg border border-neutral-200 bg-white p-space-4">
                  <div className="flex items-start justify-between gap-space-3">
                    <div>
                      <Link to={`/events/${event.id}`} className="font-display text-heading-sm text-neutral-900 hover:text-primary-500">
                        {event.title}
                      </Link>
                      <p className="font-body text-body-sm text-neutral-500 mt-space-1">{event.venue} - {event.city}</p>
                      <p className="font-body text-body-sm text-neutral-500">{event.date}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleSaved('events', event.id)}
                      className={`text-label-sm px-space-2 py-space-1 rounded-full border ${
                        savedEvents.has(event.id)
                          ? 'border-primary-400 text-primary-500 bg-primary-50'
                          : 'border-neutral-200 text-neutral-500'
                      }`}
                    >
                      {savedEvents.has(event.id) ? 'Saved' : 'Save'}
                    </button>
                  </div>
                  <p className="font-display text-heading-sm text-primary-500 mt-space-3">{formatPhp(event.pricePhp)}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-space-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-heading-md text-neutral-800">Featured Suppliers</h2>
              <Link to="/suppliers" className="text-label-sm text-primary-500">See all</Link>
            </div>
            {feed.featuredSuppliers.length === 0 && <EmptyState message="No featured suppliers available right now." />}
            <div className="space-y-space-3 md:grid md:grid-cols-2 md:gap-space-3 md:space-y-0 xl:grid-cols-3">
              {feed.featuredSuppliers.map((supplier) => (
                <article key={supplier.id} className="rounded-lg border border-neutral-200 bg-white p-space-4">
                  <div className="flex items-center justify-between gap-space-3">
                    <div>
                      <Link to={`/suppliers/${supplier.id}`} className="font-display text-heading-sm text-neutral-900 hover:text-primary-500">
                        {supplier.name}
                      </Link>
                      <p className="font-body text-body-sm text-neutral-500 mt-space-1">
                        {supplier.category} - {supplier.city}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleSaved('suppliers', supplier.id)}
                      className={`text-label-sm px-space-2 py-space-1 rounded-full border ${
                        savedSuppliers.has(supplier.id)
                          ? 'border-primary-400 text-primary-500 bg-primary-50'
                          : 'border-neutral-200 text-neutral-500'
                      }`}
                    >
                      {savedSuppliers.has(supplier.id) ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-space-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-heading-md text-neutral-800">Top Organizers</h2>
              <Link to="/organizers" className="text-label-sm text-primary-500">See all</Link>
            </div>
            {feed.topOrganizers.length === 0 && <EmptyState message="No organizer profiles available yet." />}
            <div className="space-y-space-3 md:grid md:grid-cols-2 md:gap-space-3 md:space-y-0 xl:grid-cols-3">
              {feed.topOrganizers.map((organizer) => (
                <article key={organizer.id} className="rounded-lg border border-neutral-200 bg-white p-space-4">
                  <Link to={`/organizers/${organizer.id}`} className="font-display text-heading-sm text-neutral-900 hover:text-primary-500">
                    {organizer.name}
                  </Link>
                  <p className="font-body text-body-sm text-neutral-500 mt-space-1">{organizer.city}</p>
                  <p className="font-body text-body-sm text-neutral-500 mt-space-1">
                    Specialties: {organizer.specialties.join(', ')}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
