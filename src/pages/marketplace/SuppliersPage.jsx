import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { FilterPanel, HeroBanner, PageShell, SectionHeader, StatChip, SurfaceCard } from '@/components/ui/MarketplacePrimitives'
import { getMarketplaceFilterOptions, getSavedItems, listSuppliers, toggleSavedItem } from '@/services'

const supplierSortOptions = [
  { id: 'ratingDesc', label: 'Top Rated' },
  { id: 'priceAsc', label: 'Lowest Price' },
  { id: 'priceDesc', label: 'Highest Price' },
  { id: 'reviewsDesc', label: 'Most Reviews' },
]

const supplierImageByCategory = {
  Florist: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80',
  Catering: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1000&q=80',
  Photography: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80',
  'Audio-Visual': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1000&q=80',
}

function formatPrice(value) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value)
}

export default function SuppliersPage() {
  const filterOptions = useMemo(() => getMarketplaceFilterOptions(), [])
  const [category, setCategory] = useState('All')
  const [city, setCity] = useState('All')
  const [query, setQuery] = useState('')
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [sortBy, setSortBy] = useState('ratingDesc')
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
        const items = await listSuppliers({ category, city, query, featuredOnly })
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
  }, [category, city, query, featuredOnly])

  const savedSuppliers = useMemo(() => new Set(savedMap.suppliers ?? []), [savedMap.suppliers])
  const sortedSuppliers = useMemo(() => {
    const copy = [...suppliers]
    if (sortBy === 'priceAsc') return copy.sort((a, b) => a.startingPricePhp - b.startingPricePhp)
    if (sortBy === 'priceDesc') return copy.sort((a, b) => b.startingPricePhp - a.startingPricePhp)
    if (sortBy === 'reviewsDesc') return copy.sort((a, b) => b.reviews - a.reviews)
    return copy.sort((a, b) => b.rating - a.rating)
  }, [suppliers, sortBy])

  const hasFilters = category !== 'All' || city !== 'All' || query.trim().length > 0 || featuredOnly || sortBy !== 'ratingDesc'

  function onToggleSaved(id) {
    const updated = toggleSavedItem('suppliers', id)
    setSavedMap(updated)
  }

  function resetFilters() {
    setCategory('All')
    setCity('All')
    setQuery('')
    setFeaturedOnly(false)
    setSortBy('ratingDesc')
  }

  return (
    <PageShell className="space-y-space-6">
      <HeroBanner
        eyebrow="Supplier Directory"
        title="Discover trusted vendors for every event type."
        description="Find caterers, florists, photographers, and production teams with pricing and reputation signals in one place."
        tone="teal"
      />

      <FilterPanel title="Filter suppliers" showReset={hasFilters} onReset={resetFilters}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search supplier name or category"
          className="h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
        />

        <div className="grid grid-cols-1 gap-space-2 md:grid-cols-2">
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

        <div>
          <button
            type="button"
            onClick={() => setFeaturedOnly((prev) => !prev)}
            className={`rounded-full border px-space-3 py-space-1 text-label-sm transition-all duration-fast ${
              featuredOnly
                ? 'border-secondary-500 bg-secondary-50 text-secondary-700'
                : 'border-neutral-200 text-neutral-600'
            }`}
          >
            Featured Only
          </button>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex min-w-max gap-space-2">
            {supplierSortOptions.map((option) => (
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

        <div className="grid grid-cols-3 gap-space-2">
          <StatChip label="Results" value={sortedSuppliers.length} />
          <StatChip label="Saved" value={savedSuppliers.size} />
          <StatChip label="Location" value={city === 'All' ? 'All' : city} />
        </div>
      </FilterPanel>

      {loading && <LoadingState label="Loading suppliers..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && sortedSuppliers.length === 0 && <EmptyState message="No suppliers matched your filters." />}

      {!loading && !error && sortedSuppliers.length > 0 && (
        <section className="space-y-space-3">
          <SectionHeader title="Results" subtitle="Compare quality, pricing, and availability at a glance." />
          <div className="grid gap-space-3 md:grid-cols-2">
            {sortedSuppliers.map((supplier) => (
              <SurfaceCard key={supplier.id} className="overflow-hidden p-0">
                <img
                  src={supplierImageByCategory[supplier.category] || supplierImageByCategory.Photography}
                  alt={supplier.name}
                  className="h-44 w-full object-cover"
                />
                <div className="p-space-4">
                  <div className="flex items-start justify-between gap-space-3">
                    <div>
                      <div className="mb-space-1 flex items-center gap-space-1">
                        <span className="rounded-full bg-secondary-50 px-space-2 py-1 font-display text-overline uppercase text-secondary-700">
                          {supplier.category}
                        </span>
                        {supplier.isVerified && (
                          <span className="rounded-full bg-primary-50 px-space-2 py-1 font-display text-overline uppercase text-primary-600">
                            Verified
                          </span>
                        )}
                      </div>
                      <Link to={`/suppliers/${supplier.id}`} className="font-display text-heading-lg text-neutral-900 hover:text-info">
                        {supplier.name}
                      </Link>
                      <p className="font-body text-body-sm text-neutral-500">{supplier.category} - {supplier.city}</p>
                      <p className="font-body text-body-sm text-neutral-500">Rating: {supplier.rating} ({supplier.reviews} reviews)</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleSaved(supplier.id)}
                      className={`rounded-full border px-space-2 py-space-1 text-label-sm ${
                        savedSuppliers.has(supplier.id)
                          ? 'border-secondary-500 bg-secondary-50 text-secondary-700'
                          : 'border-neutral-300 text-neutral-500'
                      }`}
                    >
                      {savedSuppliers.has(supplier.id) ? 'Saved' : 'Save'}
                    </button>
                  </div>

                  <div className="mt-space-3 flex items-center justify-between">
                    <p className="font-display text-heading-md text-info">Starts at {formatPrice(supplier.startingPricePhp)}</p>
                    <Link to={`/suppliers/${supplier.id}`} className="text-label-sm text-secondary-700 hover:text-secondary-800">
                      View Profile
                    </Link>
                  </div>
                </div>
              </SurfaceCard>
            ))}
          </div>
        </section>
      )}
    </PageShell>
  )
}
