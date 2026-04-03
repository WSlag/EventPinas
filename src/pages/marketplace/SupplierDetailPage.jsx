import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { HeroBanner, PageShell, SectionHeader, StatChip, SurfaceCard } from '@/components/ui/MarketplacePrimitives'
import { getSavedItems, getSupplierById, toggleSavedItem } from '@/services'

const supplierImageByCategory = {
  Florist: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1400&q=80',
  Catering: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1400&q=80',
  Photography: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1400&q=80',
  'Audio-Visual': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1400&q=80',
}

function formatPrice(value) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value)
}

export default function SupplierDetailPage() {
  const { id } = useParams()
  const [supplier, setSupplier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savedMap, setSavedMap] = useState(() => getSavedItems())

  useEffect(() => {
    let active = true

    async function loadDetail() {
      setLoading(true)
      setError('')

      try {
        const item = await getSupplierById(id)
        if (active) setSupplier(item)
      } catch {
        if (active) setError('Unable to load supplier details right now.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDetail()
    return () => {
      active = false
    }
  }, [id])

  const isSaved = useMemo(() => (savedMap.suppliers ?? []).includes(id), [savedMap.suppliers, id])

  function onToggleSaved() {
    const updated = toggleSavedItem('suppliers', id)
    setSavedMap(updated)
  }

  return (
    <PageShell className="space-y-space-6">
      <HeroBanner
        eyebrow="Supplier Profile"
        title={supplier?.name ?? 'Loading supplier...'}
        description={supplier ? `${supplier.category} - ${supplier.city}` : 'Fetching supplier profile and pricing details.'}
        tone="teal"
        actions={(
          <Link to="/suppliers" className="rounded-full bg-white px-space-4 py-space-2 font-display text-label-md text-secondary-700">
            Back to suppliers
          </Link>
        )}
      />

      {loading && <LoadingState label="Loading supplier details..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && !supplier && <EmptyState message="Supplier not found." />}

      {!loading && !error && supplier && (
        <>
          <SurfaceCard className="overflow-hidden p-0">
            <img
              src={supplierImageByCategory[supplier.category] || supplierImageByCategory.Photography}
              alt={supplier.name}
              className="h-64 w-full object-cover"
            />
            <div className="space-y-space-3 p-space-4">
              <div className="flex items-start justify-between gap-space-3">
                <div>
                  <span className="inline-flex rounded-full bg-secondary-50 px-space-2 py-1 font-display text-overline uppercase text-secondary-700">
                    {supplier.category}
                  </span>
                  <h1 className="mt-space-1 font-display text-heading-xl text-neutral-900">{supplier.name}</h1>
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

              <p className="font-body text-body-md text-neutral-600">{supplier.category} - {supplier.city}</p>
              <p className="font-body text-body-md text-neutral-600">Rating: {supplier.rating} ({supplier.reviews} reviews)</p>
              <p className="font-display text-display-lg text-info">Starts at {formatPrice(supplier.startingPricePhp)}</p>
              <p className="font-body text-body-sm text-neutral-600">{supplier.isVerified ? 'Verified supplier' : 'Verification pending'}</p>
            </div>
          </SurfaceCard>

          <section className="space-y-space-3">
            <SectionHeader title="Supplier Snapshot" />
            <div className="grid grid-cols-3 gap-space-2">
              <StatChip label="Category" value={supplier.category} />
              <StatChip label="Rating" value={supplier.rating} />
              <StatChip label="Reviews" value={supplier.reviews} />
            </div>
          </section>
        </>
      )}
    </PageShell>
  )
}
