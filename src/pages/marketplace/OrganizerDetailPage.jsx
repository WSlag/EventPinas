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

const tabs = [
  { id: 'about', label: 'About' },
  { id: 'past-events', label: 'Past Events' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'pricing', label: 'Pricing' },
]

function formatPrice(value) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value)
}

export default function OrganizerDetailPage() {
  const { id } = useParams()
  const [organizer, setOrganizer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savedMap, setSavedMap] = useState(() => getSavedItems())
  const [activeTab, setActiveTab] = useState('about')

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

  useEffect(() => {
    setActiveTab('about')
  }, [id])

  const isSaved = useMemo(() => (savedMap.organizers ?? []).includes(id), [savedMap.organizers, id])

  const reviewStats = useMemo(() => {
    const reviewList = organizer?.reviewList ?? []
    const total = reviewList.length

    return [5, 4, 3, 2, 1].map((stars) => {
      const count = reviewList.filter((item) => item.rating === stars).length
      const percent = total > 0 ? Math.round((count / total) * 100) : 0
      return { stars, count, percent }
    })
  }, [organizer])

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
              src={organizer.avatarUrl || organizerImageByCity[organizer.city] || organizerImageByCity['Davao City']}
              alt={organizer.name}
              className="h-64 w-full object-cover"
            />
            <div className="space-y-space-3 p-space-4">
              <div className="mb-space-1 flex flex-wrap items-center gap-space-1">
                <span className="inline-flex rounded-full bg-primary-50 px-space-2 py-space-1 font-display text-overline uppercase text-primary-600">
                  Organizer
                </span>
                {organizer.isVerified && (
                  <span className="inline-flex rounded-full bg-secondary-50 px-space-2 py-space-1 font-display text-overline uppercase text-secondary-700">
                    Verified
                  </span>
                )}
                {organizer.badge && (
                  <span className="inline-flex rounded-full bg-primary-500 px-space-2 py-space-1 font-display text-overline uppercase text-white">
                    {organizer.badge}
                  </span>
                )}
              </div>

              <h1 className="font-display text-heading-xl text-neutral-900">{organizer.name}</h1>
              <p className="font-body text-body-md text-neutral-600">{organizer.city}</p>
              <p className="font-body text-body-md text-neutral-600">Specialties: {organizer.specialties.join(', ')}</p>
              <p className="font-body text-body-md text-neutral-600">Rating: {organizer.rating} ({organizer.reviewsCount} reviews)</p>
              <p className="font-display text-display-lg text-info">{organizer.priceRangeLabel}</p>

              <div className="flex flex-wrap gap-space-2 pt-space-1">
                <button type="button" className="rounded-full bg-primary-500 px-space-4 py-space-2 font-display text-label-md text-white">
                  Hire This Organizer
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
            <SectionHeader title="Organizer Snapshot" />
            <div className="grid grid-cols-3 gap-space-2">
              <StatChip label="Events Managed" value={organizer.eventsHandled} />
              <StatChip label="Avg Rating" value={organizer.rating} />
              <StatChip label="Years Active" value={organizer.yearsActive} />
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

            {activeTab === 'about' && (
              <div className="space-y-space-3">
                <p className="font-body text-body-sm text-neutral-700">{organizer.bio}</p>
                <div className="grid gap-space-2 sm:grid-cols-2 md:grid-cols-4">
                  <StatChip label="Events Managed" value={organizer.eventsHandled} />
                  <StatChip label="Avg Rating" value={organizer.rating} />
                  <StatChip label="Coverage" value={(organizer.coverageAreas ?? []).length} />
                  <StatChip label="Years Active" value={organizer.yearsActive} />
                </div>
                <div className="flex flex-wrap gap-space-2">
                  {(organizer.services ?? []).map((service) => (
                    <span key={service} className="rounded-full bg-secondary-50 px-space-3 py-space-1 font-body text-caption-lg text-secondary-700">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'past-events' && (
              <div className="space-y-space-2">
                {(organizer.pastEvents ?? []).map((event) => (
                  <article key={event.id} className="rounded-2xl border border-neutral-200 p-space-3">
                    <div className="flex items-start justify-between gap-space-2">
                      <div>
                        <h3 className="font-display text-heading-md text-neutral-900">{event.title}</h3>
                        <p className="font-body text-caption-lg text-neutral-500">{event.type} - {event.year}</p>
                      </div>
                      <span className="rounded-full bg-neutral-100 px-space-2 py-space-1 font-body text-caption-lg text-neutral-600">
                        {event.guests} guests
                      </span>
                    </div>
                    <p className="mt-space-2 font-body text-body-sm text-neutral-700">Rating: {event.rating}/5</p>
                  </article>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-space-3">
                <div className="space-y-space-2 rounded-2xl border border-neutral-200 p-space-3">
                  <p className="font-display text-heading-lg text-neutral-900">{organizer.rating} Overall Rating</p>
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
                  {(organizer.reviewList ?? []).map((review) => (
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

            {activeTab === 'pricing' && (
              <div className="grid gap-space-3 md:grid-cols-3">
                {(organizer.pricingPackages ?? []).map((pkg) => (
                  <article key={pkg.id} className="rounded-2xl border border-neutral-200 p-space-3">
                    <div className="flex items-center justify-between gap-space-2">
                      <h3 className="font-display text-heading-md text-neutral-900">{pkg.name}</h3>
                      {pkg.badge && (
                        <span className="rounded-full bg-primary-50 px-space-2 py-space-1 font-display text-overline uppercase text-primary-600">
                          {pkg.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-space-1 font-display text-heading-lg text-info">{formatPrice(pkg.pricePhp)}</p>
                    <p className="mt-space-1 font-body text-body-sm text-neutral-600">{pkg.description}</p>
                    <ul className="mt-space-2 space-y-1 font-body text-body-sm text-neutral-600">
                      {(pkg.inclusions ?? []).map((inclusion) => (
                        <li key={inclusion}>- {inclusion}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            )}
          </SurfaceCard>
        </>
      )}
    </PageShell>
  )
}
