import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { getOrganizerById, getSavedItems, toggleSavedItem } from '@/services'

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
    <div className="px-space-4 py-space-6 space-y-space-4">
      <Link to="/organizers" className="text-label-sm text-primary-500">Back to organizers</Link>

      {loading && <LoadingState label="Loading organizer details..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && !organizer && <EmptyState message="Organizer not found." />}

      {!loading && !error && organizer && (
        <article className="rounded-lg border border-neutral-200 bg-white p-space-4 space-y-space-3">
          <div className="flex items-start justify-between gap-space-3">
            <h1 className="font-display text-heading-lg text-neutral-900">{organizer.name}</h1>
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
          <p className="font-body text-body-sm text-neutral-500">{organizer.city}</p>
          <p className="font-body text-body-sm text-neutral-500">Rating: {organizer.rating}</p>
          <p className="font-body text-body-sm text-neutral-500">Events handled: {organizer.eventsHandled}</p>
          <p className="font-body text-body-sm text-neutral-600">Specialties: {organizer.specialties.join(', ')}</p>
        </article>
      )}
    </div>
  )
}
