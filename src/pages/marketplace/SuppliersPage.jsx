import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { FilterPanel, HeroBanner, PageShell, SectionHeader, StatChip, SurfaceCard } from '@/components/ui/MarketplacePrimitives'
import { getMarketplaceFilterOptions, getSavedItems, listSuppliers, toggleSavedItem } from '@/services'
import { getFallbackImageHandler } from '@/utils/imageFallback'

const supplierSortOptions = [
  { id: 'featuredFirst', label: 'Featured First' },
  { id: 'ratingDesc', label: 'Top Rated' },
  { id: 'reviewsDesc', label: 'Most Reviews' },
  { id: 'bookingsDesc', label: 'Most Booked' },
]

const supplierImageByCategory = {
  Florist: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80',
  Catering: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1000&q=80',
  Photography: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80',
  'Audio-Visual': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1000&q=80',
  'Live Band': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1000&q=80',
  DJ: 'https://images.unsplash.com/photo-1571266028243-d220c9f7b6ca?auto=format&fit=crop&w=1000&q=80',
  'Party Rental': 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=80',
  'Event Styling': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1000&q=80',
}

function formatPrice(value) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value)
}

function resolveSupplierFiltersFromSearch(search, supplierCategories, cities) {
  const params = new URLSearchParams(search)
  const rawCategory = params.get('category') ?? 'All'
  const rawCity = params.get('city') ?? 'All'
  const query = params.get('query') ?? ''

  return {
    category: rawCategory === 'All' || supplierCategories.includes(rawCategory) ? rawCategory : 'All',
    city: rawCity === 'All' || cities.includes(rawCity) ? rawCity : 'All',
    query,
  }
}

export default function SuppliersPage() {
  const location = useLocation()
  const filterOptions = useMemo(() => getMarketplaceFilterOptions(), [])
  const searchDefaults = useMemo(
    () => resolveSupplierFiltersFromSearch(location.search, filterOptions.supplierCategories, filterOptions.cities),
    [location.search, filterOptions.supplierCategories, filterOptions.cities],
  )
  const [category, setCategory] = useState(searchDefaults.category)
  const [city, setCity] = useState(searchDefaults.city)
  const [query, setQuery] = useState(searchDefaults.query)
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [sortBy, setSortBy] = useState('featuredFirst')
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savedMap, setSavedMap] = useState(() => getSavedItems())

  useEffect(() => {
    setCategory(searchDefaults.category)
    setCity(searchDefaults.city)
    setQuery(searchDefaults.query)
  }, [searchDefaults.category, searchDefaults.city, searchDefaults.query])

  useEffect(() => {
    let active = true

    async function loadSuppliers() {
      setLoading(true)
      setError('')

      try {
        const items = await listSuppliers({ category, city, query, featuredOnly, sortBy })
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
  }, [category, city, query, featuredOnly, sortBy])

  const savedSuppliers = useMemo(() => new Set(savedMap.suppliers ?? []), [savedMap.suppliers])

  const hasFilters =
    category !== 'All' ||
    city !== 'All' ||
    query.trim().length > 0 ||
    featuredOnly ||
    sortBy !== 'featuredFirst'

  function onToggleSaved(id) {
    const updated = toggleSavedItem('suppliers', id)
    setSavedMap(updated)
  }

  function resetFilters() {
    setCategory('All')
    setCity('All')
    setQuery('')
    setFeaturedOnly(false)
    setSortBy('featuredFirst')
  }

  return (
    <PageShell className="space-y-space-6">
      <HeroBanner
        eyebrow="Supplier Directory"
        title="Discover trusted vendors for every event type."
        description="Find caterers, florists, photographers, and production teams with pricing and reputation signals in one place."
        tone="teal"
      />

      <SurfaceCard className="overflow-hidden border-none bg-gradient-to-r from-primary-400 via-orange-500 to-primary-600 text-white shadow-md">
        <div className="flex flex-col gap-space-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-overline uppercase tracking-wide text-white/85">Grow Your Supplier Brand</p>
            <h3 className="mt-space-1 font-display text-heading-xl">List your services for free</h3>
            <p className="mt-space-1 font-body text-body-sm text-white/90">
              Get discovered by event organizers looking for trusted local teams.
            </p>
          </div>
          <Link
            to="/register?role=supplier"
            className="inline-flex items-center justify-center rounded-full bg-white px-space-4 py-space-2 font-display text-label-md text-primary-600"
          >
            Join Now
          </Link>
        </div>
      </SurfaceCard>

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

        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex min-w-max gap-space-2">
            <button
              type="button"
              onClick={() => setCategory('All')}
              className={`rounded-full border px-space-3 py-space-1 text-label-sm transition-all duration-fast ${
                category === 'All'
                  ? 'border-secondary-500 bg-secondary-50 text-secondary-700'
                  : 'border-neutral-200 text-neutral-600'
              }`}
            >
              All
            </button>
            {filterOptions.supplierCategories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full border px-space-3 py-space-1 text-label-sm transition-all duration-fast ${
                  category === item
                    ? 'border-secondary-500 bg-secondary-50 text-secondary-700'
                    : 'border-neutral-200 text-neutral-600'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
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
          <StatChip label="Results" value={suppliers.length} />
          <StatChip label="Saved" value={savedSuppliers.size} />
          <StatChip label="Location" value={city === 'All' ? 'All' : city} />
        </div>
      </FilterPanel>

      {loading && <LoadingState label="Loading suppliers..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && suppliers.length === 0 && <EmptyState message="No suppliers matched your filters." />}

      {!loading && !error && suppliers.length > 0 && (
        <section className="space-y-space-3">
          <SectionHeader title="Results" subtitle="Compare quality, pricing, and availability at a glance." />
          <div className="grid gap-space-3 md:grid-cols-2">
            {suppliers.map((supplier) => {
              const fallbackImage = supplierImageByCategory[supplier.category] || supplierImageByCategory.Photography

              return (
                <SurfaceCard
                  key={supplier.id}
                  className={`overflow-hidden p-0 ${supplier.isFeatured ? 'border-primary-300 shadow-primary' : ''}`}
                >
                  <div className="relative">
                    <img
                      src={supplier.imageUrl || fallbackImage}
                      alt={supplier.name}
                      onError={getFallbackImageHandler(fallbackImage)}
                      className="h-44 w-full object-cover"
                    />
                    {supplier.isFeatured && (
                      <span className="absolute left-space-2 top-space-2 rounded-full bg-primary-500 px-space-2 py-1 font-display text-overline uppercase text-white">
                        Featured
                      </span>
                    )}
                  </div>

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

                    {supplier.tag && (
                      <p className="mt-space-2 font-body text-caption-lg text-primary-600">{supplier.tag}</p>
                    )}

                    <div className="mt-space-3 flex items-center justify-between">
                      <p className="font-display text-heading-md text-info">
                        {supplier.priceRangeLabel || `Starts at ${formatPrice(supplier.startingPricePhp)}`}
                      </p>
                      <Link to={`/suppliers/${supplier.id}`} className="text-label-sm text-secondary-700 hover:text-secondary-800">
                        View Profile
                      </Link>
                    </div>
                  </div>
                </SurfaceCard>
              )
            })}
          </div>
        </section>
      )}
    </PageShell>
  )
}
