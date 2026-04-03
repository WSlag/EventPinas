import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { clearSavedItems, getSavedItems, getSavedMarketplaceItems, toggleSavedItem } from '@/services'

export default function SavedPage() {
  const [savedCatalog, setSavedCatalog] = useState({ events: [], suppliers: [], organizers: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadSaved() {
      setLoading(true)
      setError('')

      try {
        const map = getSavedItems()
        const payload = await getSavedMarketplaceItems(map)
        if (active) setSavedCatalog(payload)
      } catch {
        if (active) setError('Unable to load saved items right now.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadSaved()
    return () => {
      active = false
    }
  }, [])

  async function removeSaved(type, id) {
    toggleSavedItem(type, id)
    const map = getSavedItems()
    const payload = await getSavedMarketplaceItems(map, { simulateLatency: false })
    setSavedCatalog(payload)
  }

  async function onClearAll() {
    clearSavedItems()
    setSavedCatalog({ events: [], suppliers: [], organizers: [] })
  }

  const hasItems =
    savedCatalog.events.length > 0 || savedCatalog.suppliers.length > 0 || savedCatalog.organizers.length > 0

  return (
    <div className="px-space-4 py-space-6 space-y-space-4">
      <header className="flex items-center justify-between gap-space-3">
        <div>
          <h1 className="font-display text-heading-lg text-neutral-800">Saved</h1>
          <p className="font-body text-body-sm text-neutral-500 mt-space-1">Your bookmarked events, suppliers, and organizers.</p>
        </div>
        {hasItems && (
          <button type="button" onClick={onClearAll} className="text-label-sm text-primary-500">
            Clear all
          </button>
        )}
      </header>

      {loading && <LoadingState label="Loading saved items..." />}
      {error && <ErrorState message={error} />}

      {!loading && !error && !hasItems && <EmptyState message="You have no saved items yet." />}

      {!loading && !error && hasItems && (
        <div className="space-y-space-4">
          {savedCatalog.events.length > 0 && (
            <section className="space-y-space-2">
              <h2 className="font-display text-heading-md text-neutral-800">Events</h2>
              {savedCatalog.events.map((event) => (
                <article key={event.id} className="rounded-lg border border-neutral-200 bg-white p-space-4">
                  <div className="flex items-center justify-between gap-space-3">
                    <Link to={`/events/${event.id}`} className="font-display text-heading-sm text-neutral-900 hover:text-primary-500">
                      {event.title}
                    </Link>
                    <button type="button" onClick={() => removeSaved('events', event.id)} className="text-label-sm text-primary-500">
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </section>
          )}

          {savedCatalog.suppliers.length > 0 && (
            <section className="space-y-space-2">
              <h2 className="font-display text-heading-md text-neutral-800">Suppliers</h2>
              {savedCatalog.suppliers.map((supplier) => (
                <article key={supplier.id} className="rounded-lg border border-neutral-200 bg-white p-space-4">
                  <div className="flex items-center justify-between gap-space-3">
                    <Link to={`/suppliers/${supplier.id}`} className="font-display text-heading-sm text-neutral-900 hover:text-primary-500">
                      {supplier.name}
                    </Link>
                    <button type="button" onClick={() => removeSaved('suppliers', supplier.id)} className="text-label-sm text-primary-500">
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </section>
          )}

          {savedCatalog.organizers.length > 0 && (
            <section className="space-y-space-2">
              <h2 className="font-display text-heading-md text-neutral-800">Organizers</h2>
              {savedCatalog.organizers.map((organizer) => (
                <article key={organizer.id} className="rounded-lg border border-neutral-200 bg-white p-space-4">
                  <div className="flex items-center justify-between gap-space-3">
                    <Link to={`/organizers/${organizer.id}`} className="font-display text-heading-sm text-neutral-900 hover:text-primary-500">
                      {organizer.name}
                    </Link>
                    <button type="button" onClick={() => removeSaved('organizers', organizer.id)} className="text-label-sm text-primary-500">
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  )
}
