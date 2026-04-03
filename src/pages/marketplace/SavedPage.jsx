import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { HeroBanner, PageShell, SectionHeader, SurfaceCard } from '@/components/ui/MarketplacePrimitives'
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

  function onClearAll() {
    clearSavedItems()
    setSavedCatalog({ events: [], suppliers: [], organizers: [] })
  }

  const hasItems =
    savedCatalog.events.length > 0 || savedCatalog.suppliers.length > 0 || savedCatalog.organizers.length > 0

  return (
    <PageShell className="space-y-space-6">
      <HeroBanner
        eyebrow="Saved Collection"
        title="Your bookmarked events, suppliers, and organizers."
        description="Keep planning momentum by pinning your top options and revisiting them anytime."
        tone="blue"
        actions={hasItems ? (
          <button type="button" onClick={onClearAll} className="rounded-full bg-white px-space-4 py-space-2 font-display text-label-md text-info">
            Clear all
          </button>
        ) : null}
      />

      {loading && <LoadingState label="Loading saved items..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && !hasItems && <EmptyState message="You have no saved items yet." />}

      {!loading && !error && hasItems && (
        <div className="space-y-space-5">
          {savedCatalog.events.length > 0 && (
            <section className="space-y-space-2">
              <SectionHeader title="Saved Events" />
              <div className="grid gap-space-3 md:grid-cols-2">
                {savedCatalog.events.map((event) => (
                  <SurfaceCard key={event.id}>
                    <div className="flex items-start justify-between gap-space-3">
                      <div>
                        <Link to={`/events/${event.id}`} className="font-display text-heading-md text-neutral-900 hover:text-info">
                          {event.title}
                        </Link>
                        <p className="mt-space-1 font-body text-body-sm text-neutral-500">{event.city} - {event.date}</p>
                      </div>
                      <button type="button" onClick={() => removeSaved('events', event.id)} className="text-label-sm text-primary-500">
                        Remove
                      </button>
                    </div>
                  </SurfaceCard>
                ))}
              </div>
            </section>
          )}

          {savedCatalog.suppliers.length > 0 && (
            <section className="space-y-space-2">
              <SectionHeader title="Saved Suppliers" />
              <div className="grid gap-space-3 md:grid-cols-2">
                {savedCatalog.suppliers.map((supplier) => (
                  <SurfaceCard key={supplier.id}>
                    <div className="flex items-start justify-between gap-space-3">
                      <div>
                        <Link to={`/suppliers/${supplier.id}`} className="font-display text-heading-md text-neutral-900 hover:text-info">
                          {supplier.name}
                        </Link>
                        <p className="mt-space-1 font-body text-body-sm text-neutral-500">{supplier.category} - {supplier.city}</p>
                      </div>
                      <button type="button" onClick={() => removeSaved('suppliers', supplier.id)} className="text-label-sm text-primary-500">
                        Remove
                      </button>
                    </div>
                  </SurfaceCard>
                ))}
              </div>
            </section>
          )}

          {savedCatalog.organizers.length > 0 && (
            <section className="space-y-space-2">
              <SectionHeader title="Saved Organizers" />
              <div className="grid gap-space-3 md:grid-cols-2">
                {savedCatalog.organizers.map((organizer) => (
                  <SurfaceCard key={organizer.id}>
                    <div className="flex items-start justify-between gap-space-3">
                      <div>
                        <Link to={`/organizers/${organizer.id}`} className="font-display text-heading-md text-neutral-900 hover:text-info">
                          {organizer.name}
                        </Link>
                        <p className="mt-space-1 font-body text-body-sm text-neutral-500">{organizer.city}</p>
                      </div>
                      <button type="button" onClick={() => removeSaved('organizers', organizer.id)} className="text-label-sm text-primary-500">
                        Remove
                      </button>
                    </div>
                  </SurfaceCard>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </PageShell>
  )
}
