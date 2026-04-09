import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { FilterPanel, HeroBanner, PageShell, SectionHeader, StatChip, SurfaceCard } from '@/components/ui/MarketplacePrimitives'
import { getMarketplaceFilterOptions, listOrganizers } from '@/services'
import { getFallbackImageHandler } from '@/utils/imageFallback'

const organizerSortOptions = [
  { id: 'ratingDesc', label: 'Top Rated' },
  { id: 'eventsDesc', label: 'Most Events' },
  { id: 'cityAsc', label: 'City A-Z' },
]

const organizerImageByCity = {
  'Davao City': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80',
  'Cagayan de Oro': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80',
  'Iloilo City': 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80',
}

export default function OrganizersPage() {
  const filterOptions = useMemo(() => getMarketplaceFilterOptions(), [])
  const [city, setCity] = useState('All')
  const [specialty, setSpecialty] = useState('All')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('ratingDesc')
  const [organizers, setOrganizers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadOrganizers() {
      setLoading(true)
      setError('')

      try {
        const items = await listOrganizers({ city, specialty, query, sortBy })
        if (active) setOrganizers(items)
      } catch {
        if (active) setError('Unable to load organizers right now.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadOrganizers()
    return () => {
      active = false
    }
  }, [city, specialty, query, sortBy])

  const hasFilters = city !== 'All' || specialty !== 'All' || query.trim().length > 0 || sortBy !== 'ratingDesc'

  function resetFilters() {
    setCity('All')
    setSpecialty('All')
    setQuery('')
    setSortBy('ratingDesc')
  }

  return (
    <PageShell className="space-y-space-6">
      <HeroBanner
        eyebrow="Organizer Directory"
        title="Connect with organizers who can run your event end-to-end."
        description="Find specialist teams by city, event type, and proven execution track record."
        tone="blue"
      />

      <SurfaceCard className="overflow-hidden border-none bg-gradient-to-r from-secondary-700 via-teal-500 to-info text-white shadow-md">
        <div className="flex flex-col gap-space-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-overline uppercase tracking-wide text-white/85">Organizer Network</p>
            <h3 className="mt-space-1 font-display text-heading-xl">Are you an organizer?</h3>
            <p className="mt-space-1 font-body text-body-sm text-white/90">
              Build your profile, showcase your track record, and get matched with event clients.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full bg-white px-space-4 py-space-2 font-display text-label-md text-info"
          >
            Join as Organizer
          </button>
        </div>
      </SurfaceCard>

      <FilterPanel title="Filter organizers" showReset={hasFilters} onReset={resetFilters}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search organizer name or specialty"
          className="h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
        />

        <div className="grid grid-cols-1 gap-space-2 md:grid-cols-2">
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

          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex min-w-max gap-space-2">
              {organizerSortOptions.map((option) => (
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
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex min-w-max gap-space-2">
            <button
              type="button"
              onClick={() => setSpecialty('All')}
              className={`rounded-full border px-space-3 py-space-1 text-label-sm transition-all duration-fast ${
                specialty === 'All'
                  ? 'border-secondary-500 bg-secondary-50 text-secondary-700'
                  : 'border-neutral-200 text-neutral-600'
              }`}
            >
              All Specialties
            </button>
            {filterOptions.organizerSpecialties.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSpecialty(item)}
                className={`rounded-full border px-space-3 py-space-1 text-label-sm transition-all duration-fast ${
                  specialty === item
                    ? 'border-secondary-500 bg-secondary-50 text-secondary-700'
                    : 'border-neutral-200 text-neutral-600'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-space-2">
          <StatChip label="Results" value={organizers.length} />
          <StatChip label="City" value={city === 'All' ? 'All' : city} />
          <StatChip label="Specialty" value={specialty === 'All' ? 'All' : specialty} />
        </div>
      </FilterPanel>

      {loading && <LoadingState label="Loading organizers..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && organizers.length === 0 && <EmptyState message="No organizers matched your filters." />}

      {!loading && !error && organizers.length > 0 && (
        <section className="space-y-space-3">
          <SectionHeader title="Results" subtitle="Browse teams with strong delivery history." />
          <div className="grid gap-space-3 md:grid-cols-2">
            {organizers.map((organizer) => {
              const fallbackImage = organizerImageByCity[organizer.city] || organizerImageByCity['Davao City']

              return (
                <SurfaceCard key={organizer.id} className={`overflow-hidden p-0 ${organizer.badge ? 'border-primary-300 shadow-primary' : ''}`}>
                  <img
                    src={organizer.avatarUrl || fallbackImage}
                    alt={organizer.name}
                    onError={getFallbackImageHandler(fallbackImage)}
                    className="h-40 w-full object-cover"
                  />
                  <div className="space-y-space-2 p-space-4">
                    <div className="flex items-start justify-between gap-space-2">
                      <div>
                        <Link to={`/organizers/${organizer.id}`} className="font-display text-heading-lg text-neutral-900 hover:text-info">
                          {organizer.name}
                        </Link>
                        <p className="mt-space-1 font-body text-body-sm text-neutral-500">{organizer.city}</p>
                      </div>
                      {organizer.badge && (
                        <span className="rounded-full bg-primary-50 px-space-2 py-space-1 font-display text-overline uppercase text-primary-600">
                          {organizer.badge}
                        </span>
                      )}
                    </div>

                    <p className="font-body text-body-sm text-neutral-500">Specialties: {organizer.specialties.join(', ')}</p>
                    <div className="flex flex-wrap items-center gap-space-2">
                      {organizer.isVerified && (
                        <span className="rounded-full bg-secondary-50 px-space-2 py-space-1 font-display text-overline uppercase text-secondary-700">
                          Verified
                        </span>
                      )}
                      <span className="rounded-full bg-neutral-100 px-space-2 py-space-1 font-body text-caption-lg text-neutral-600">
                        {organizer.eventsHandled} events handled
                      </span>
                    </div>
                    <p className="font-body text-body-sm text-neutral-600">
                      Rating: {organizer.rating} ({organizer.reviewsCount} reviews)
                    </p>
                    <p className="font-display text-heading-md text-info">{organizer.priceRangeLabel}</p>
                  </div>
                </SurfaceCard>
              )
            })}
          </div>
        </section>
      )}
    </PageShell>
  )
}
