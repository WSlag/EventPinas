import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { FilterPanel, HeroBanner, PageShell, SectionHeader, StatChip, SurfaceCard } from '@/components/ui/MarketplacePrimitives'
import { getMarketplaceFilterOptions, listOrganizers } from '@/services'

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
        const items = await listOrganizers({ city, query })
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
  }, [city, query])

  const sortedOrganizers = useMemo(() => {
    const copy = [...organizers]
    if (sortBy === 'eventsDesc') return copy.sort((a, b) => b.eventsHandled - a.eventsHandled)
    if (sortBy === 'cityAsc') return copy.sort((a, b) => a.city.localeCompare(b.city))
    return copy.sort((a, b) => b.rating - a.rating)
  }, [organizers, sortBy])

  const hasFilters = city !== 'All' || query.trim().length > 0 || sortBy !== 'ratingDesc'

  function resetFilters() {
    setCity('All')
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

        <div className="grid grid-cols-3 gap-space-2">
          <StatChip label="Results" value={sortedOrganizers.length} />
          <StatChip label="City" value={city === 'All' ? 'All' : city} />
          <StatChip label="Sort" value={organizerSortOptions.find((item) => item.id === sortBy)?.label ?? 'Top Rated'} />
        </div>
      </FilterPanel>

      {loading && <LoadingState label="Loading organizers..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && sortedOrganizers.length === 0 && <EmptyState message="No organizers matched your filters." />}

      {!loading && !error && sortedOrganizers.length > 0 && (
        <section className="space-y-space-3">
          <SectionHeader title="Results" subtitle="Browse teams with strong delivery history." />
          <div className="grid gap-space-3 md:grid-cols-2">
            {sortedOrganizers.map((organizer) => (
              <SurfaceCard key={organizer.id} className="overflow-hidden p-0">
                <img
                  src={organizerImageByCity[organizer.city] || organizerImageByCity['Davao City']}
                  alt={organizer.name}
                  className="h-40 w-full object-cover"
                />
                <div className="p-space-4">
                  <Link to={`/organizers/${organizer.id}`} className="font-display text-heading-lg text-neutral-900 hover:text-info">
                    {organizer.name}
                  </Link>
                  <p className="mt-space-1 font-body text-body-sm text-neutral-500">{organizer.city}</p>
                  <p className="mt-space-1 font-body text-body-sm text-neutral-500">Specialties: {organizer.specialties.join(', ')}</p>
                  <p className="mt-space-2 font-body text-body-sm text-neutral-600">Rating: {organizer.rating} - {organizer.eventsHandled} events handled</p>
                </div>
              </SurfaceCard>
            ))}
          </div>
        </section>
      )}
    </PageShell>
  )
}
