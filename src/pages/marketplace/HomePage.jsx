import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import {
  ActionButton,
  HeroBanner,
  PageShell,
  SectionHeader,
  SurfaceCard,
} from '@/components/ui/MarketplacePrimitives'
import { marketplaceCategories } from '@/data'
import { getHomeFeed, getMarketplaceFilterOptions, getSavedItems, toggleSavedItem } from '@/services'
import { getFallbackImageHandler } from '@/utils/imageFallback'

const heroImageUrl = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=2200&q=80'

const supplierImageByCategory = {
  Florist:       'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=75',
  Catering:      'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=75',
  Photography:   'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=75',
  'Audio-Visual':'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=75',
}
const supplierFallbackImage = 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=75'

const organizerImageBySpecialty = {
  Concert:   'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=75',
  Festival:  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=600&q=75',
  Wedding:   'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=75',
  Debut:     'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=75',
  Corporate: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=600&q=75',
  Expo:      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=75',
  Community: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=75',
  Reunion:   'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=75',
}
const organizerFallbackImage = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=75'

function tagBadgeClass(tag) {
  if (tag === 'Hot') return 'bg-red-500'
  if (tag === 'Free') return 'bg-emerald-500'
  if (tag === 'New') return 'bg-secondary-500'
  if (tag === 'Selling Fast' || tag === 'Limited') return 'bg-primary-400'
  return 'bg-neutral-700/80'
}

const eventImageByCategory = {
  Wedding: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
  Reunion: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1000&q=80',
  Festival: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1000&q=80',
  Concert: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80',
  Corporate: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1000&q=80',
  Community: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=80',
  Debut: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1000&q=80',
  Expo: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=80',
}

const categoryShowcase = [
  { key: 'Wedding', label: 'Wedding', image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=700&q=80' },
  { key: 'Reunion', label: 'Reunion', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=700&q=80' },
  { key: 'Festival', label: 'Festival', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=700&q=80' },
  { key: 'Concert', label: 'Concert', image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=700&q=80' },
  { key: 'Corporate', label: 'Corporate', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=700&q=80' },
  { key: 'Community', label: 'Community', image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=700&q=80' },
  { key: 'Debut', label: 'Debut', image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=700&q=80' },
]

const whyUseCards = [
  {
    title: 'Plan events in one workspace',
    description: 'Build event pages, send RSVP links, and keep guest tracking in one clear flow from setup to launch.',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
    alt: 'Organizer team planning an event timeline together',
    ctaLabel: 'Create your event',
    ctaTo: '/register',
    toneClass: 'from-primary-500/70 via-primary-600/35 to-transparent',
  },
  {
    title: 'Book trusted suppliers faster',
    description: 'Compare featured vendors, shortlist the right fit, and move from discovery to booking-ready conversations quickly.',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80',
    alt: 'Event supplier preparing catering service setup',
    ctaLabel: 'Browse suppliers',
    ctaTo: '/suppliers',
    toneClass: 'from-secondary-600/70 via-secondary-700/35 to-transparent',
  },
  {
    title: 'Run event day with control',
    description: 'Coordinate check-in and onsite operations with organizer-ready tools built to keep teams aligned during live events.',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
    alt: 'Event team coordinating guests during live event operations',
    ctaLabel: 'Meet organizers',
    ctaTo: '/organizers',
    toneClass: 'from-info/75 via-info/40 to-transparent',
  },
  {
    title: 'Track performance and grow',
    description: 'Follow attendance and event momentum with practical insights that help you improve your next launch.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    alt: 'Analytics dashboard showing event performance trends',
    ctaLabel: 'Explore events',
    ctaTo: '/events',
    toneClass: 'from-neutral-800/80 via-neutral-700/45 to-transparent',
  },
]

const whyUseFallbackImage = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80'

function formatPhp(value) {
  if (value === 0) return 'Free'
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value)
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-PH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const filterOptions = useMemo(() => getMarketplaceFilterOptions(), [])
  const [activeCategory, setActiveCategory] = useState('All')
  const [quickCity, setQuickCity] = useState('All')
  const [quickQuery, setQuickQuery] = useState('')
  const [feed, setFeed] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savedMap, setSavedMap] = useState(() => getSavedItems())

  useEffect(() => {
    let active = true

    async function loadFeed() {
      setLoading(true)
      setError('')

      try {
        const data = await getHomeFeed({
          category: activeCategory,
          city: quickCity,
          query: quickQuery,
          eventsLimit: 6,
          suppliersLimit: 6,
          organizersLimit: 6,
        })
        if (active) setFeed(data)
      } catch {
        if (active) setError('Unable to load homepage feed right now.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadFeed()
    return () => {
      active = false
    }
  }, [activeCategory, quickCity, quickQuery])

  const savedEvents = useMemo(() => new Set(savedMap.events ?? []), [savedMap.events])
  const featuredEvents = useMemo(() => feed?.featuredEvents?.slice(0, 3) ?? [], [feed?.featuredEvents])
  const featuredEventIds = useMemo(() => new Set(featuredEvents.map((event) => event.id)), [featuredEvents])
  const moreEvents = (feed?.upcomingEvents ?? []).filter((event) => !featuredEventIds.has(event.id))

  function onToggleSavedEvent(id) {
    const updated = toggleSavedItem('events', id)
    setSavedMap(updated)
  }

  function toDiscoverPath(basePath) {
    const params = new URLSearchParams()
    if (activeCategory !== 'All') params.set('category', activeCategory)
    if (quickCity !== 'All') params.set('city', quickCity)
    if (quickQuery.trim().length > 0) params.set('query', quickQuery.trim())
    const queryString = params.toString()
    return queryString ? `${basePath}?${queryString}` : basePath
  }

  function onDiscoverSubmit(event) {
    event.preventDefault()
    navigate(toDiscoverPath('/events'))
  }

  return (
    <div className="space-y-space-8">
      <section className="relative min-h-[68vh] overflow-hidden bg-info">
        <img src={heroImageUrl} alt="Event crowd" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-info/70 to-info/50" />
        <div className="pointer-events-none absolute inset-y-0 left-[38%] hidden w-[560px] -translate-x-1/2 rounded-full border border-white/35 md:block" />
        <div className="pointer-events-none absolute inset-y-0 left-[42%] hidden w-[760px] -translate-x-1/2 rounded-full border border-white/20 md:block" />

        <div className="relative mx-auto flex min-h-[68vh] w-full max-w-[1680px] items-center px-space-4 py-space-12 md:px-space-8">
          <div className="max-w-3xl">
            <HeroBanner
              eyebrow="EventPH Marketplace"
              title="Great events start here."
              description="Empowering event creators through every stage of the journey: Manage events, promote events, and discover trusted suppliers — everything Philippine event creators need, in one place."
              tone="soft"
              className="border-none bg-none p-0 shadow-none"
              actions={(
                <>
                  <ActionButton to="/register">Create event</ActionButton>
                  <ActionButton to="/suppliers" tone="soft">Let&apos;s talk</ActionButton>
                </>
              )}
            />
          </div>
        </div>
      </section>

      <PageShell className="space-y-space-8">
        <section className="relative z-10 -mt-space-16 space-y-space-4">
          <div className="rounded-3xl border border-white/65 bg-white/95 p-space-5 shadow-lg backdrop-blur md:p-space-6">
            <p className="font-display text-overline uppercase tracking-wide text-secondary-700">Built for practical wins</p>
            <h2 className="mt-space-2 font-display text-heading-xl text-neutral-900 md:text-display-lg">Why Use EventPinas</h2>
            <p className="mt-space-2 max-w-3xl font-body text-body-sm text-neutral-600 md:text-body-md">
              From planning and supplier booking to event-day coordination and performance tracking, EventPinas helps teams move faster with less friction.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-space-4 md:grid-cols-2">
            {whyUseCards.map((card) => (
              <SurfaceCard
                key={card.title}
                className="group overflow-hidden border border-neutral-200/90 bg-white p-0 shadow-sm transition-all duration-fast hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.alt}
                    onError={getFallbackImageHandler(whyUseFallbackImage)}
                    className="h-full w-full object-cover transition-transform duration-slow group-hover:scale-[1.03]"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${card.toneClass}`} />
                  <div className="absolute inset-x-space-4 bottom-space-3">
                    <h3 className="font-display text-heading-lg text-white">{card.title}</h3>
                  </div>
                </div>

                <div className="space-y-space-3 p-space-4">
                  <p className="font-body text-body-sm text-neutral-600">{card.description}</p>
                  <Link
                    to={card.ctaTo}
                    className="inline-flex items-center rounded-full border border-info/20 bg-info px-space-4 py-space-2 font-display text-label-sm text-white transition-colors duration-fast hover:bg-info/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/50 focus-visible:ring-offset-2"
                  >
                    {card.ctaLabel}
                  </Link>
                </div>
              </SurfaceCard>
            ))}
          </div>
        </section>

        <section>
          <SurfaceCard className="space-y-space-4 border border-white/70 bg-white/95 p-space-4 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between gap-space-2">
              <h2 className="font-display text-heading-lg text-neutral-900">Discover fast</h2>
              <p className="rounded-full bg-info/10 px-space-2 py-1 font-display text-caption-lg text-info">
                {feed?.upcomingEvents?.length ?? 0} matches
              </p>
            </div>
            <p className="font-body text-body-sm text-neutral-600">
              Search events, tune category and city, then jump straight to booking-ready results.
            </p>

            <form className="space-y-space-3" onSubmit={onDiscoverSubmit}>
              <input
                value={quickQuery}
                onChange={(event) => setQuickQuery(event.target.value)}
                placeholder="Search event title, venue, tag, or city"
                className="h-11 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
              />

              <div className="grid grid-cols-1 gap-space-2 sm:grid-cols-2">
                <select
                  value={activeCategory}
                  onChange={(event) => setActiveCategory(event.target.value)}
                  className="h-11 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                >
                  {filterOptions.categories.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>

                <select
                  value={quickCity}
                  onChange={(event) => setQuickCity(event.target.value)}
                  className="h-11 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                >
                  <option value="All">All cities</option>
                  {filterOptions.cities.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-space-2">
                <button
                  type="submit"
                  className="inline-flex h-11 min-w-[148px] items-center justify-center rounded-full bg-info px-space-4 font-display text-label-md text-white"
                >
                  Search events
                </button>
                <Link
                  to={toDiscoverPath('/suppliers')}
                  className="inline-flex h-11 min-w-[148px] items-center justify-center rounded-full border border-info/30 bg-white px-space-4 font-display text-label-md text-info"
                >
                  Find vendors
                </Link>
              </div>
            </form>
          </SurfaceCard>
        </section>

        <section className="space-y-space-4">
          <SectionHeader title="Featured events" actionLabel="View all" actionTo="/events" />

          {loading && <LoadingState label="Loading featured events..." />}
          {error && <ErrorState message={error} />}
          {!loading && !error && featuredEvents.length === 0 && (
            <EmptyState message="No featured events available for this category right now." />
          )}

          {!loading && !error && featuredEvents.length > 0 && (
            <div className="grid gap-space-4 md:grid-cols-3">
              {featuredEvents.map((event) => {
                const fallbackImage = eventImageByCategory[event.category] || eventImageByCategory.Festival

                return (
                  <SurfaceCard key={event.id} className="overflow-hidden p-0">
                    <div className="relative">
                      <img
                        src={event.imageUrl || fallbackImage}
                        alt={event.title}
                        onError={getFallbackImageHandler(fallbackImage)}
                        className="h-48 w-full object-cover"
                      />
                      {event.tags[0] && (
                        <span className={`absolute left-space-3 top-space-3 rounded-full px-space-2 py-0.5 font-display text-caption-sm text-white ${tagBadgeClass(event.tags[0])}`}>
                          {event.tags[0]}
                        </span>
                      )}
                    </div>
                    <div className="p-space-4">
                      <div className="mb-space-2 flex items-center justify-between gap-space-3">
                        <p className="font-display text-heading-sm text-info">{formatDate(event.date)}</p>
                        <button
                          type="button"
                          onClick={() => onToggleSavedEvent(event.id)}
                          className={`rounded-full border px-space-2 py-1 text-label-sm ${
                            savedEvents.has(event.id)
                              ? 'border-secondary-500 bg-secondary-50 text-secondary-700'
                              : 'border-neutral-300 text-neutral-500'
                          }`}
                        >
                          {savedEvents.has(event.id) ? 'Saved' : 'Save'}
                        </button>
                      </div>

                      <Link to={`/events/${event.id}`} className="line-clamp-2 font-display text-heading-xl text-neutral-900 hover:text-info">
                        {event.title}
                      </Link>

                      <div className="mt-space-3 flex items-center justify-between gap-space-2">
                        <p className="flex items-center gap-1 font-body text-body-sm text-neutral-600">
                          <PinIcon />
                          {event.city}
                        </p>
                        <Link to={`/events/${event.id}`} className="rounded-full bg-info px-space-4 py-1 font-display text-label-sm text-white">
                          Let&apos;s go
                        </Link>
                      </div>

                      <div className="mt-space-3 flex flex-wrap gap-space-1">
                        {event.tags.map((tag) => (
                          <span key={`${event.id}-${tag}`} className="rounded-full bg-neutral-100 px-space-2 py-1 font-body text-caption-sm text-neutral-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="mt-space-3 font-display text-heading-sm text-info">{formatPhp(event.pricePhp)}</p>
                      <div className="mt-space-2">
                        <p className="font-body text-caption-sm text-neutral-500">{event.soldPercent}% sold</p>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className={`h-full rounded-full ${event.soldPercent >= 80 ? 'bg-red-500' : event.soldPercent >= 50 ? 'bg-amber-400' : 'bg-secondary-500'}`}
                            style={{ width: `${event.soldPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </SurfaceCard>
                )
              })}
            </div>
          )}

          {!loading && !error && moreEvents.length > 0 && (
            <div className="grid gap-space-3 sm:grid-cols-2 lg:grid-cols-3">
              {moreEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="rounded-2xl border border-neutral-200 bg-white p-space-3 transition-all duration-fast hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <p className="font-display text-label-md text-info">{event.title}</p>
                  <p className="mt-space-1 font-body text-body-sm text-neutral-500">{event.venue} - {event.city}</p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {!loading && !error && (feed?.featuredSuppliers?.length ?? 0) > 0 && (
          <section className="space-y-space-4">
            <SectionHeader title="Featured Suppliers" actionLabel="Browse all" actionTo="/suppliers" />
            <div className="-mx-space-4 flex gap-space-4 overflow-x-auto px-space-4 pb-space-2 md:mx-0 md:px-0">
              {feed.featuredSuppliers.map((supplier) => (
                <Link key={supplier.id} to={`/suppliers/${supplier.id}`} className="w-56 flex-shrink-0">
                  <SurfaceCard className="h-full overflow-hidden p-0">
                    <div className="relative">
                      {(() => {
                        const fallbackImage = supplierImageByCategory[supplier.category] || supplierFallbackImage

                        return (
                          <img
                            src={supplier.imageUrl || fallbackImage}
                            alt={supplier.name}
                            onError={getFallbackImageHandler(fallbackImage)}
                            className="h-36 w-full object-cover"
                          />
                        )
                      })()}
                      {supplier.isFeatured && (
                        <span className="absolute right-space-2 top-space-2 rounded-full bg-info px-space-2 py-0.5 font-display text-caption-sm text-white">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="p-space-3">
                      <p className="line-clamp-1 font-display text-heading-sm text-neutral-900">{supplier.name}</p>
                      <p className="font-body text-caption-sm text-neutral-500">{supplier.category} · {supplier.city}</p>
                      <div className="mt-space-2 flex items-center gap-1 font-body text-caption-sm text-neutral-600">
                        <span className="text-amber-400">★</span>
                        <span>{supplier.rating}</span>
                        <span className="text-neutral-400">({supplier.reviews})</span>
                      </div>
                    </div>
                  </SurfaceCard>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-secondary-600 via-info to-secondary-500 p-space-6 text-white">
          <p className="font-display text-heading-sm uppercase tracking-wide opacity-80">For Businesses</p>
          <h2 className="mt-space-1 font-display text-heading-2xl">Are you an Event Supplier?</h2>
          <p className="mt-space-2 max-w-md font-body text-body-sm opacity-90">
            List your services on EventPH and get discovered by thousands of event organizers across the Philippines.
          </p>
          <Link
            to="/suppliers"
            className="mt-space-4 inline-flex items-center rounded-full bg-white px-space-5 py-space-2 font-display text-label-md text-info transition-opacity hover:opacity-90"
          >
            List your business →
          </Link>
        </section>

        {!loading && !error && (feed?.topOrganizers?.length ?? 0) > 0 && (
          <section className="space-y-space-4">
            <SectionHeader title="Top Organizers" actionLabel="View all" actionTo="/organizers" />
            <div className="-mx-space-4 flex gap-space-4 overflow-x-auto px-space-4 pb-space-2 md:mx-0 md:px-0">
              {feed.topOrganizers.map((org) => (
                <Link key={org.id} to={`/organizers/${org.id}`} className="w-56 flex-shrink-0">
                  <SurfaceCard className="h-full overflow-hidden p-0">
                    <div className="relative">
                      {(() => {
                        const fallbackImage = organizerImageBySpecialty[org.specialties[0]] || organizerFallbackImage

                        return (
                          <img
                            src={org.avatarUrl || fallbackImage}
                            alt={org.name}
                            onError={getFallbackImageHandler(fallbackImage)}
                            className="h-36 w-full object-cover"
                          />
                        )
                      })()}
                      {org.isVerified && (
                        <span className="absolute right-space-2 top-space-2 rounded-full bg-info px-space-2 py-0.5 font-display text-caption-sm text-white">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="p-space-3">
                      <p className="line-clamp-1 font-display text-heading-sm text-neutral-900">{org.name}</p>
                      <p className="font-body text-caption-sm text-neutral-500">{org.specialties[0]} · {org.city}</p>
                      <div className="mt-space-2 flex items-center gap-1 font-body text-caption-sm text-neutral-600">
                        <span className="text-amber-400">★</span>
                        <span>{org.rating}</span>
                        <span className="text-neutral-400">({org.eventsHandled} events)</span>
                      </div>
                    </div>
                  </SurfaceCard>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-space-4">
          <SectionHeader title="Categories" subtitle="Filter your feed" />
          <div className="grid grid-cols-2 gap-space-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {categoryShowcase.map((item) => {
              const active = activeCategory === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveCategory(item.key)}
                  className="group flex flex-col items-center gap-space-2"
                >
                  <span className={`inline-flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 transition-all duration-fast md:h-36 md:w-36 ${
                    active ? 'border-secondary-500 shadow-lg shadow-secondary-100' : 'border-white'
                  }`}>
                    <img src={item.image} alt={item.label} className="h-full w-full object-cover" />
                  </span>
                  <span className={`font-display text-heading-md ${active ? 'text-info' : 'text-neutral-800'}`}>
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-space-2">
            <button
              type="button"
              onClick={() => setActiveCategory('All')}
              className={`rounded-full border px-space-3 py-space-1 font-display text-label-sm ${
                activeCategory === 'All'
                  ? 'border-info bg-info text-white'
                  : 'border-neutral-300 bg-white text-neutral-600'
              }`}
            >
              All
            </button>
            {marketplaceCategories.filter((category) => category !== 'All').map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-space-3 py-space-1 font-display text-label-sm ${
                  activeCategory === category
                    ? 'border-info bg-info text-white'
                    : 'border-neutral-300 bg-white text-neutral-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

      </PageShell>
    </div>
  )
}
