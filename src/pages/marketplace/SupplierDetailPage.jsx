import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { getSavedItems, getSupplierById, toggleSavedItem } from '@/services'

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
    <div className="px-space-4 py-space-6 space-y-space-4">
      <Link to="/suppliers" className="text-label-sm text-primary-500">Back to suppliers</Link>

      {loading && <LoadingState label="Loading supplier details..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && !supplier && <EmptyState message="Supplier not found." />}

      {!loading && !error && supplier && (
        <article className="rounded-lg border border-neutral-200 bg-white p-space-4 space-y-space-3">
          <div className="flex items-start justify-between gap-space-3">
            <h1 className="font-display text-heading-lg text-neutral-900">{supplier.name}</h1>
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
          <p className="font-body text-body-sm text-neutral-500">{supplier.category} - {supplier.city}</p>
          <p className="font-body text-body-sm text-neutral-500">Rating: {supplier.rating} ({supplier.reviews} reviews)</p>
          <p className="font-display text-heading-md text-primary-500">Starts at {formatPrice(supplier.startingPricePhp)}</p>
          <p className="font-body text-body-sm text-neutral-600">{supplier.isVerified ? 'Verified supplier' : 'Verification pending'}</p>
        </article>
      )}
    </div>
  )
}
