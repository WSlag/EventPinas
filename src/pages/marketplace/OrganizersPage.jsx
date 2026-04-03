import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { getMarketplaceFilterOptions, listOrganizers } from '@/services'

export default function OrganizersPage() {
  const filterOptions = useMemo(() => getMarketplaceFilterOptions(), [])
  const [city, setCity] = useState('All')
  const [query, setQuery] = useState('')
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

  return (
    <div className="px-space-4 py-space-6 space-y-space-4">
      <header>
        <h1 className="font-display text-heading-lg text-neutral-800">Organizers</h1>
        <p className="font-body text-body-sm text-neutral-500 mt-space-1">Connect with experienced organizers for your event goals.</p>
      </header>

      <select
        value={city}
        onChange={(event) => setCity(event.target.value)}
        className="h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
      >
        <option value="All">All cities</option>
        {filterOptions.cities.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search organizer name or specialty"
        className="w-full h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
      />

      {loading && <LoadingState label="Loading organizers..." />}
      {error && <ErrorState message={error} />}

      {!loading && !error && organizers.length === 0 && <EmptyState message="No organizers matched your filters." />}

      {!loading && !error && organizers.length > 0 && (
        <div className="space-y-space-3">
          {organizers.map((organizer) => (
            <article key={organizer.id} className="rounded-lg border border-neutral-200 bg-white p-space-4">
              <Link to={`/organizers/${organizer.id}`} className="font-display text-heading-sm text-neutral-900 hover:text-primary-500">
                {organizer.name}
              </Link>
              <p className="font-body text-body-sm text-neutral-500 mt-space-1">{organizer.city}</p>
              <p className="font-body text-body-sm text-neutral-500 mt-space-1">Specialties: {organizer.specialties.join(', ')}</p>
              <p className="font-body text-body-sm text-neutral-500 mt-space-1">Rating: {organizer.rating} · {organizer.eventsHandled} events handled</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
