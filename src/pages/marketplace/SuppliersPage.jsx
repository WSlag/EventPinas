import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { getMarketplaceFilterOptions, getSavedItems, listSuppliers, toggleSavedItem } from '@/services'

function formatPrice(value) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value)
}

export default function SuppliersPage() {
  const filterOptions = useMemo(() => getMarketplaceFilterOptions(), [])
  const [category, setCategory] = useState('All')
  const [city, setCity] = useState('All')
  const [query, setQuery] = useState('')
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savedMap, setSavedMap] = useState(() => getSavedItems())

  useEffect(() => {
    let active = true

    async function loadSuppliers() {
      setLoading(true)
      setError('')

      try {
        const items = await listSuppliers({ category, city, query })
        if (active) setSuppliers(items)
      } catch {
        if (active) setError('Unable to load suppliers right now.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadSuppliers()
    return () => {
      active = false
    }
  }, [category, city, query])

  const savedSuppliers = useMemo(() => new Set(savedMap.suppliers ?? []), [savedMap.suppliers])

  function onToggleSaved(id) {
    const updated = toggleSavedItem('suppliers', id)
    setSavedMap(updated)
  }

  return (
    <div className="px-space-4 py-space-6 space-y-space-4">
      <header>
        <h1 className="font-display text-heading-lg text-neutral-800">Suppliers</h1>
        <p className="font-body text-body-sm text-neutral-500 mt-space-1">Discover trusted vendors for your event.</p>
      </header>

      <div className="grid grid-cols-2 gap-space-2">
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
        >
          <option value="All">All categories</option>
          {filterOptions.supplierCategories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

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
      </div>

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search supplier name or category"
        className="w-full h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
      />

      {loading && <LoadingState label="Loading suppliers..." />}
      {error && <ErrorState message={error} />}

      {!loading && !error && suppliers.length === 0 && <EmptyState message="No suppliers matched your filters." />}

      {!loading && !error && suppliers.length > 0 && (
        <div className="space-y-space-3">
          {suppliers.map((supplier) => (
            <article key={supplier.id} className="rounded-lg border border-neutral-200 bg-white p-space-4">
              <div className="flex items-center justify-between gap-space-3">
                <div>
                  <Link to={`/suppliers/${supplier.id}`} className="font-display text-heading-sm text-neutral-900 hover:text-primary-500">
                    {supplier.name}
                  </Link>
                  <p className="font-body text-body-sm text-neutral-500 mt-space-1">{supplier.category} - {supplier.city}</p>
                  <p className="font-body text-body-sm text-neutral-500">Rating: {supplier.rating} ({supplier.reviews} reviews)</p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleSaved(supplier.id)}
                  className={`text-label-sm px-space-2 py-space-1 rounded-full border ${
                    savedSuppliers.has(supplier.id)
                      ? 'border-primary-400 text-primary-500 bg-primary-50'
                      : 'border-neutral-200 text-neutral-500'
                  }`}
                >
                  {savedSuppliers.has(supplier.id) ? 'Saved' : 'Save'}
                </button>
              </div>
              <p className="font-display text-heading-sm text-primary-500 mt-space-3">Starts at {formatPrice(supplier.startingPricePhp)}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
