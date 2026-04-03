import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { HeroBanner, PageShell, SectionHeader, StatChip, SurfaceCard } from '@/components/ui/MarketplacePrimitives'
import { getOrganizerById, getSavedItems, toggleSavedItem } from '@/services'

const organizerImageByCity = {
  'Davao City': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80',
  'Cagayan de Oro': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80',
  'Iloilo City': 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=80',
}

export default function OrganizerDetailPage() {
  const { id } = useParams()
  const [organizer, setOrganizer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savedMap, setSavedMap] = useState(() => getSavedItems())

  useEffect(() => {
    let active = true

    async function loadDetail() {
      setLoading(true)
      setError('')

      try {
        const item = await getOrganizerById(id)
        if (active) setOrganizer(item)
      } catch {
        if (active) setError('Unable to load organizer details right now.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDetail()
    return () => {
      active = false
    }
  }, [id])

  const isSaved = useMemo(() => (savedMap.organizers ?? []).includes(id), [savedMap.organizers, id])

  function onToggleSaved() {
    const updated = toggleSavedItem('organizers', id)
    setSavedMap(updated)
  }

  return (
    <PageShell className="space-y-space-6">
      <HeroBanner
        eyebrow="Organizer Profile"
        title={organizer?.name ?? 'Loading organizer...'}
        description={organizer ? `${organizer.city} - ${organizer.specialties.join(', ')}` : 'Fetching organizer profile and track record.'}
        tone="blue"
        actions={(
          <Link to="/organizers" className="rounded-full bg-white px-space-4 py-space-2 font-display text-label-md text-info">
            Back to organizers
          </Link>
        )}
      />

      {loading && <LoadingState label="Loading organizer details..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && !organizer && <EmptyState message="Organizer not found." />}

      {!loading && !error && organizer && (
        <>
          <SurfaceCard className="overflow-hidden p-0">
            <img
              src={organizerImageByCity[organizer.city] || organizerImageByCity['Davao City']}
              alt={organizer.name}
              className="h-64 w-full object-cover"
            />
            <div className="space-y-space-3 p-space-4">
              <div className="flex items-start justify-between gap-space-3">
                <div>
                  <span className="inline-flex rounded-full bg-primary-50 px-space-2 py-1 font-display text-overline uppercase text-primary-600">
                    Organizer
                  </span>
                  <h1 className="mt-space-1 font-display text-heading-xl text-neutral-900">{organizer.name}</h1>
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

              <p className="font-body text-body-md text-neutral-600">{organizer.city}</p>
              <p className="font-body text-body-md text-neutral-600">Specialties: {organizer.specialties.join(', ')}</p>
              <p className="font-body text-body-md text-neutral-600">Rating: {organizer.rating}</p>
            </div>
          </SurfaceCard>

          <section className="space-y-space-3">
            <SectionHeader title="Organizer Snapshot" />
            <div className="grid grid-cols-3 gap-space-2">
              <StatChip label="City" value={organizer.city} />
              <StatChip label="Rating" value={organizer.rating} />
              <StatChip label="Events Handled" value={organizer.eventsHandled} />
            </div>
          </section>
        </>
      )}
    </PageShell>
  )
}
