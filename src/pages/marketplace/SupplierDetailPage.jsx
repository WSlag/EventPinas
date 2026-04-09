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

const tabs = [
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'packages', label: 'Packages' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'info', label: 'Info' },
]

function formatPrice(value) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value)
}

export default function SupplierDetailPage() {
  const { id } = useParams()
  const [supplier, setSupplier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savedMap, setSavedMap] = useState(() => getSavedItems())
  const [activeTab, setActiveTab] = useState('portfolio')

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

  useEffect(() => {
    setActiveTab('portfolio')
  }, [id])

  const isSaved = useMemo(() => (savedMap.suppliers ?? []).includes(id), [savedMap.suppliers, id])

  const reviewStats = useMemo(() => {
    const reviewList = supplier?.reviewList ?? []
    const total = reviewList.length

    return [5, 4, 3, 2, 1].map((stars) => {
      const count = reviewList.filter((item) => item.rating === stars).length
      const percent = total > 0 ? Math.round((count / total) * 100) : 0
      return { stars, count, percent }
    })
  }, [supplier])

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
              src={supplier.imageUrl || supplierImageByCategory[supplier.category] || supplierImageByCategory.Photography}
              alt={supplier.name}
              className="h-64 w-full object-cover"
            />
            <div className="space-y-space-3 p-space-4">
              <div>
                <div className="mb-space-1 flex flex-wrap items-center gap-space-1">
                  <span className="inline-flex rounded-full bg-secondary-50 px-space-2 py-space-1 font-display text-overline uppercase text-secondary-700">
                    {supplier.category}
                  </span>
                  {supplier.isVerified && (
                    <span className="inline-flex rounded-full bg-primary-50 px-space-2 py-space-1 font-display text-overline uppercase text-primary-600">
                      Verified
                    </span>
                  )}
                  {supplier.isFeatured && (
                    <span className="inline-flex rounded-full bg-primary-500 px-space-2 py-space-1 font-display text-overline uppercase text-white">
                      Featured
                    </span>
                  )}
                </div>
                <h1 className="mt-space-1 font-display text-heading-xl text-neutral-900">{supplier.name}</h1>
              </div>

              <p className="font-body text-body-md text-neutral-600">{supplier.category} - {supplier.city}</p>
              <p className="font-body text-body-md text-neutral-600">Rating: {supplier.rating} ({supplier.reviews} reviews)</p>
              <p className="font-display text-display-lg text-info">{supplier.priceRangeLabel || `Starts at ${formatPrice(supplier.startingPricePhp)}`}</p>
              {supplier.tag && <p className="font-body text-body-sm text-primary-600">{supplier.tag}</p>}

              {(supplier.specializations ?? []).length > 0 && (
                <div className="flex flex-wrap gap-space-2">
                  {supplier.specializations.map((item) => (
                    <span key={item} className="rounded-full bg-primary-50 px-space-3 py-space-1 font-body text-caption-lg text-primary-600">
                      {item}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-space-2 pt-space-1">
                <button type="button" className="rounded-full bg-primary-500 px-space-4 py-space-2 font-display text-label-md text-white">
                  Get Quote
                </button>
                <button type="button" className="rounded-full border border-neutral-300 bg-white px-space-4 py-space-2 font-display text-label-md text-neutral-700">
                  Message
                </button>
                <button
                  type="button"
                  onClick={onToggleSaved}
                  className={`rounded-full border px-space-4 py-space-2 font-display text-label-md ${
                    isSaved ? 'border-secondary-500 bg-secondary-50 text-secondary-700' : 'border-neutral-300 text-neutral-500'
                  }`}
                >
                  {isSaved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
          </SurfaceCard>

          <section className="space-y-space-3">
            <SectionHeader title="Supplier Snapshot" />
            <div className="grid grid-cols-3 gap-space-2">
              <StatChip label="Events Done" value={supplier.eventsDone ?? 0} />
              <StatChip label="Starting At" value={supplier.priceRangeLabel || formatPrice(supplier.startingPricePhp)} />
              <StatChip label="Location" value={supplier.city} />
            </div>
          </section>

          <SurfaceCard className="space-y-space-4">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex min-w-max gap-space-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full border px-space-3 py-space-1 text-label-sm transition-all duration-fast ${
                      activeTab === tab.id
                        ? 'border-primary-400 bg-primary-50 text-primary-600'
                        : 'border-neutral-200 text-neutral-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'portfolio' && (
              <div className="space-y-space-3">
                <div className="grid gap-space-2 sm:grid-cols-2 lg:grid-cols-3">
                  {(supplier.portfolio ?? []).map((image, index) => (
                    <img key={`${image}-${index}`} src={image} alt={`${supplier.name} portfolio ${index + 1}`} className="h-40 w-full rounded-xl object-cover" />
                  ))}
                </div>
                <p className="font-body text-body-sm text-neutral-600">{supplier.bio}</p>
                <div className="flex flex-wrap gap-space-2">
                  {(supplier.specializations ?? []).map((item) => (
                    <span key={item} className="rounded-full bg-secondary-50 px-space-3 py-space-1 font-body text-caption-lg text-secondary-700">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'packages' && (
              <div className="grid gap-space-3 md:grid-cols-3">
                {(supplier.packages ?? []).map((pkg) => (
                  <article key={pkg.id} className="rounded-2xl border border-neutral-200 p-space-3">
                    <div className="flex items-center justify-between gap-space-2">
                      <h3 className="font-display text-heading-md text-neutral-900">{pkg.name}</h3>
                      {pkg.isPopular && (
                        <span className="rounded-full bg-primary-50 px-space-2 py-space-1 font-display text-overline uppercase text-primary-600">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="mt-space-1 font-display text-heading-lg text-info">{formatPrice(pkg.pricePhp)}</p>
                    <ul className="mt-space-2 space-y-1 font-body text-body-sm text-neutral-600">
                      {(pkg.inclusions ?? []).map((inclusion) => (
                        <li key={inclusion}>- {inclusion}</li>
                      ))}
                    </ul>
                    <button type="button" className="mt-space-3 w-full rounded-full bg-primary-500 px-space-3 py-space-2 font-display text-label-md text-white">
                      Select This Package
                    </button>
                  </article>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-space-3">
                <div className="space-y-space-2 rounded-2xl border border-neutral-200 p-space-3">
                  <p className="font-display text-heading-lg text-neutral-900">{supplier.rating} Overall Rating</p>
                  {reviewStats.map((row) => (
                    <div key={row.stars} className="flex items-center gap-space-2">
                      <span className="w-12 font-body text-caption-lg text-neutral-600">{row.stars} star</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                        <div className="h-full rounded-full bg-primary-500" style={{ width: `${row.percent}%` }} />
                      </div>
                      <span className="w-10 text-right font-body text-caption-lg text-neutral-500">{row.count}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-space-2">
                  {(supplier.reviewList ?? []).map((review) => (
                    <article key={review.id} className="rounded-2xl border border-neutral-200 p-space-3">
                      <p className="font-display text-heading-sm text-neutral-900">{review.name}</p>
                      <p className="font-body text-caption-lg text-neutral-500">{review.eventType} - {review.date}</p>
                      <p className="mt-space-1 font-body text-body-sm text-neutral-600">Rating: {review.rating}/5</p>
                      <p className="mt-space-1 font-body text-body-sm text-neutral-700">{review.comment}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'info' && (
              <div className="space-y-space-3">
                <div className="grid gap-space-2 sm:grid-cols-2">
                  <StatChip label="Business Type" value={supplier.businessInfo?.businessType || 'N/A'} />
                  <StatChip label="Operating Since" value={supplier.businessInfo?.operatingSince || 'N/A'} />
                  <StatChip label="Response Time" value={supplier.responseTime || 'N/A'} />
                  <StatChip label="Contact" value={supplier.businessInfo?.contact || 'N/A'} />
                </div>
                <div className="rounded-2xl border border-neutral-200 p-space-3">
                  <p className="font-body text-body-sm text-neutral-700">Coverage: {(supplier.coverageAreas ?? []).join(', ')}</p>
                  <p className="mt-space-1 font-body text-body-sm text-neutral-700">Payment Methods: {(supplier.paymentMethods ?? []).join(', ')}</p>
                  <p className="mt-space-1 font-body text-body-sm text-neutral-700">Email: {supplier.businessInfo?.email || 'N/A'}</p>
                  <p className="mt-space-1 font-body text-body-sm text-neutral-700">Facebook: {supplier.businessInfo?.facebook || 'N/A'}</p>
                </div>
                {supplier.businessInfo?.dtiVerified && (
                  <div className="rounded-2xl bg-secondary-50 p-space-3 font-body text-body-sm text-secondary-700">
                    DTI verification is on file for this supplier profile.
                  </div>
                )}
              </div>
            )}
          </SurfaceCard>
        </>
      )}
    </PageShell>
  )
}
