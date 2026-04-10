import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { marketplaceCategories } from '@/data'
import { getHomeFeed, getMarketplaceFilterOptions, getSavedItems, toggleSavedItem } from '@/services'
import { getFallbackImageHandler } from '@/utils/imageFallback'

const heroImages = [
  {
    // Concert — person raising hand, electric blue/purple stage lighting (matches events.com slide 1)
    url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=2400&q=90',
    label: 'Concerts & Festivals',
    position: '70% center',
  },
  {
    // Wedding — first dance with circular golden bokeh (matches events.com slide 2 vibe)
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=2400&q=90',
    label: 'Weddings',
    position: 'right center',
  },
  {
    // Debut — elegant gown, warm ballroom lights and bokeh
    url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=2400&q=90',
    label: 'Debut',
    position: 'right center',
  },
]

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
    num: '01',
    title: 'Create & launch events in minutes',
    description: 'Design your event page, collect registrations, and track every RSVP — all from one powerful dashboard built for Philippine organizers.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=85',
    alt: 'Stunning event conference setup with stage lighting',
    ctaLabel: 'Create your event',
    ctaTo: '/register',
    gradient: 'from-orange-700/95 via-primary-600/60 to-transparent',
    pill: 'bg-primary-400',
  },
  {
    num: '02',
    title: 'Connect with 500+ verified suppliers',
    description: 'Find catering, photography, décor, and AV suppliers instantly. Compare, shortlist, and message them — without leaving the platform.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=85',
    alt: 'Beautiful event catering and gourmet spread',
    ctaLabel: 'Browse suppliers',
    ctaTo: '/suppliers',
    gradient: 'from-emerald-800/95 via-secondary-600/60 to-transparent',
    pill: 'bg-secondary-500',
  },
  {
    num: '03',
    title: 'Run your event day without chaos',
    description: 'Check in guests, coordinate teams, and handle last-minute changes with real-time tools that keep everything moving on schedule.',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1400&q=85',
    alt: 'Live concert performance with vibrant stage lighting',
    ctaLabel: 'Meet organizers',
    ctaTo: '/organizers',
    gradient: 'from-blue-900/95 via-info/60 to-transparent',
    pill: 'bg-info',
  },
  {
    num: '04',
    title: 'Turn every event into your next win',
    description: 'Track ticket sales, attendance trends, and guest engagement — then use those insights to make your next event even bigger.',
    image: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1400&q=85',
    alt: 'Celebratory confetti at a successful event',
    ctaLabel: 'Explore events',
    ctaTo: '/events',
    gradient: 'from-violet-900/95 via-purple-700/60 to-transparent',
    pill: 'bg-violet-600',
  },
]

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

function HeartIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
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
  const [heroIndex, setHeroIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

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
    <div className="min-h-screen bg-white">

      {/* ── HERO ── full-bleed, deep navy + auto-rotating photography */}
      <section className="relative min-h-[88vh] overflow-hidden bg-[#0C1D5E]">
        {/* Crossfade images */}
        {heroImages.map((img, i) => (
          <img
            key={img.url}
            src={img.url}
            alt={img.label}
            style={{ objectPosition: img.position }}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ease-in-out ${
              i === heroIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-[#060F2E]/90 via-[#0C1D5E]/50 to-transparent" />

        {/* Radar rings */}
        <div className="pointer-events-none absolute inset-y-0 left-[40%] hidden w-[500px] -translate-x-1/2 rounded-full border border-white/50 md:block" />
        <div className="pointer-events-none absolute inset-y-0 left-[44%] hidden w-[720px] -translate-x-1/2 rounded-full border border-white/35 md:block" />
        <div className="pointer-events-none absolute inset-y-0 left-[48%] hidden w-[960px] -translate-x-1/2 rounded-full border border-white/20 md:block" />

        <div className="relative mx-auto flex min-h-[88vh] w-full max-w-[1680px] items-center px-space-4 py-space-16 md:px-space-8">
          <div className="max-w-3xl">
            <p className="font-display text-overline uppercase tracking-[0.12em] text-secondary-300">
              EventPH Marketplace
            </p>
            <h1 className="mt-space-3 font-display font-extrabold leading-tight tracking-tight text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
              Great events<br />start here.
            </h1>
            <p className="mt-space-4 max-w-2xl font-body text-white/85 text-body-md md:text-body-lg">
              Empowering event creators through every stage of the journey: Manage events, promote events, and discover trusted suppliers — everything Philippine event creators need, in one place.
            </p>
            <div className="mt-space-6 flex flex-wrap gap-space-3">
              <Link
                to="/register"
                className="inline-flex items-center rounded-full bg-secondary-500 px-space-6 py-space-3 font-display text-label-lg text-white transition-colors duration-fast hover:bg-secondary-400"
              >
                Create event
              </Link>
              <Link
                to="/suppliers"
                className="inline-flex items-center rounded-full border border-white/40 bg-white/10 px-space-6 py-space-3 font-display text-label-lg text-white transition-colors duration-fast hover:bg-white/20"
              >
                Let&apos;s talk
              </Link>
            </div>

            {/* Slide indicators + current label */}
            <div className="mt-space-8 flex items-center gap-space-3">
              {heroImages.map((img, i) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => setHeroIndex(i)}
                  aria-label={`View ${img.label}`}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === heroIndex
                      ? 'w-10 bg-secondary-400'
                      : 'w-1.5 bg-white/35 hover:bg-white/60'
                  }`}
                />
              ))}
              <span className="ml-space-1 font-display text-caption-lg text-white/55">
                {heroImages[heroIndex].label}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY USE ── dark premium full-bleed section */}
      <section className="bg-[#060F2E] py-space-12 md:py-space-16 lg:py-space-16">
        {/* Section header */}
        <div className="mx-auto max-w-[1280px] px-space-4 md:px-space-6">
          <p className="font-display text-overline uppercase tracking-[0.15em] text-secondary-400">Built for practical wins</p>
          <div className="mt-space-3 flex flex-col gap-space-4 md:flex-row md:items-end md:justify-between">
            <h2 className="font-display font-extrabold leading-tight text-white text-3xl sm:text-4xl md:text-5xl">
              Why Use EventPinas
            </h2>
            <p className="max-w-sm font-body text-white/55 text-body-sm md:text-right">
              From planning to post-event insights — everything Philippine event creators need, in one place.
            </p>
          </div>
        </div>

        {/* 2×2 immersive card grid */}
        <div className="mx-auto mt-space-8 max-w-[1280px] px-space-4 md:px-space-6">
          <div className="grid grid-cols-1 gap-space-4 md:grid-cols-2">
            {whyUseCards.map((card) => (
              <div
                key={card.title}
                className="group relative min-h-[320px] overflow-hidden rounded-3xl md:min-h-[400px] lg:min-h-[440px]"
              >
                {/* Full-bleed background image */}
                <img
                  src={card.image}
                  alt={card.alt}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                />

                {/* Top dark vignette so card number stays readable */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-transparent" />

                {/* Bottom vibrant color gradient — unique per card */}
                <div className={`absolute inset-0 bg-gradient-to-t ${card.gradient}`} />

                {/* Card number — top left */}
                <div className="absolute left-space-5 top-space-5">
                  <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${card.pill} font-display text-label-sm font-bold text-white shadow-lg`}>
                    {card.num}
                  </span>
                </div>

                {/* Content — pinned to bottom */}
                <div className="absolute inset-x-0 bottom-0 p-space-5 md:p-space-6">
                  <h3 className="font-display font-extrabold leading-tight text-white text-xl md:text-2xl">
                    {card.title}
                  </h3>
                  <p className="mt-space-2 font-body text-white/80 text-body-sm leading-relaxed">
                    {card.description}
                  </p>
                  <Link
                    to={card.ctaTo}
                    className={`mt-space-4 inline-flex items-center gap-2 rounded-full ${card.pill} px-space-5 py-space-2 font-display text-label-sm font-semibold text-white shadow-md transition-all duration-fast hover:brightness-110 hover:shadow-lg`}
                  >
                    {card.ctaLabel}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DISCOVER FAST ── full-bleed deep navy */}
      <section className="bg-[#0C1D5E] py-space-10 md:py-space-14">
        <div className="mx-auto max-w-[1280px] px-space-4 md:px-space-6">
          <div className="flex items-center justify-between gap-space-2">
            <h2 className="font-display font-bold text-white text-xl md:text-2xl">Discover fast</h2>
            <span className="rounded-full bg-white/15 px-space-3 py-1 font-display text-caption-lg text-white">
              {feed?.upcomingEvents?.length ?? 0} matches
            </span>
          </div>
          <p className="mt-space-2 font-body text-white/70 text-body-sm">
            Search events, tune category and city, then jump straight to booking-ready results.
          </p>

          <form className="mt-space-5 space-y-space-3" onSubmit={onDiscoverSubmit}>
            <input
              value={quickQuery}
              onChange={(event) => setQuickQuery(event.target.value)}
              placeholder="Search event title, venue, tag, or city"
              className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-space-4 font-body text-body-sm text-white placeholder:text-white/50 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-secondary-400/60"
            />

            <div className="grid grid-cols-1 gap-space-3 sm:grid-cols-2">
              <select
                value={activeCategory}
                onChange={(event) => setActiveCategory(event.target.value)}
                className="h-12 rounded-xl border border-white/20 bg-white/10 px-space-4 font-body text-body-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary-400/60 [color-scheme:dark]"
              >
                {filterOptions.categories.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>

              <select
                value={quickCity}
                onChange={(event) => setQuickCity(event.target.value)}
                className="h-12 rounded-xl border border-white/20 bg-white/10 px-space-4 font-body text-body-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary-400/60 [color-scheme:dark]"
              >
                <option value="All">All cities</option>
                {filterOptions.cities.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-space-3">
              <button
                type="submit"
                className="inline-flex h-12 min-w-[160px] items-center justify-center rounded-full bg-secondary-500 px-space-5 font-display text-label-md text-white transition-colors duration-fast hover:bg-secondary-400"
              >
                Search events
              </button>
              <Link
                to={toDiscoverPath('/suppliers')}
                className="inline-flex h-12 min-w-[160px] items-center justify-center rounded-full border border-white/30 bg-white/10 px-space-5 font-display text-label-md text-white transition-colors duration-fast hover:bg-white/20"
              >
                Find vendors
              </Link>
            </div>
          </form>
        </div>
      </section>

      {/* ── FEATURED EVENTS ── white section */}
      <section className="bg-white py-space-10 md:py-space-14">
        <div className="mx-auto max-w-[1280px] px-space-4 md:px-space-6">
          <div className="flex items-end justify-between gap-space-3">
            <h2 className="font-display font-bold text-[#0C1D5E] text-xl md:text-2xl">Featured events</h2>
            <Link to="/events" className="font-display text-label-md text-secondary-600 hover:text-secondary-700">
              View all
            </Link>
          </div>

          <div className="mt-space-6">
            {loading && <LoadingState label="Loading featured events..." />}
            {error && <ErrorState message={error} />}
            {!loading && !error && featuredEvents.length === 0 && (
              <EmptyState message="No featured events available for this category right now." />
            )}

            {!loading && !error && featuredEvents.length > 0 && (
              <div className="grid gap-space-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {featuredEvents.map((event) => {
                  const fallbackImage = eventImageByCategory[event.category] || eventImageByCategory.Festival
                  const isSaved = savedEvents.has(event.id)

                  return (
                    <article key={event.id} className="group overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-fast hover:-translate-y-1 hover:shadow-xl">
                      {/* Image — landscape 16:10, tag badge + heart overlay */}
                      <div className="relative overflow-hidden">
                        <img
                          src={event.imageUrl || fallbackImage}
                          alt={event.title}
                          onError={getFallbackImageHandler(fallbackImage)}
                          className="aspect-[16/10] w-full object-cover transition-transform duration-slow group-hover:scale-[1.03]"
                        />
                        {event.tags[0] && (
                          <span className={`absolute left-space-3 top-space-3 rounded-full px-space-2 py-0.5 font-display text-caption-sm text-white shadow-sm ${tagBadgeClass(event.tags[0])}`}>
                            {event.tags[0]}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => onToggleSavedEvent(event.id)}
                          aria-label={isSaved ? 'Remove from saved' : 'Save event'}
                          className={`absolute right-space-3 top-space-3 rounded-full p-2 shadow-md transition-colors duration-fast ${
                            isSaved
                              ? 'bg-secondary-500 text-white'
                              : 'bg-white/90 text-neutral-500 hover:text-secondary-500'
                          }`}
                        >
                          <HeartIcon filled={isSaved} />
                        </button>
                      </div>

                      {/* Card content */}
                      <div className="p-space-4">
                        {/* Date */}
                        <p className="font-display text-caption-lg font-semibold uppercase tracking-wide text-[#0C1D5E]">
                          {formatDate(event.date)}
                        </p>

                        {/* Title */}
                        <Link
                          to={`/events/${event.id}`}
                          className="mt-space-1 block line-clamp-2 font-display text-heading-lg font-bold text-neutral-900 hover:text-[#0C1D5E]"
                        >
                          {event.title}
                        </Link>

                        {/* Location + CTA — same row like events.com */}
                        <div className="mt-space-3 flex items-center justify-between gap-space-2">
                          <p className="flex items-center gap-1 font-body text-body-sm text-neutral-500">
                            <PinIcon />
                            {event.city}
                          </p>
                          <Link
                            to={`/events/${event.id}`}
                            className="shrink-0 rounded-lg bg-secondary-500 px-space-4 py-space-2 font-display text-label-sm text-white transition-colors duration-fast hover:bg-secondary-400"
                          >
                            Let&apos;s go
                          </Link>
                        </div>

                        {/* Tags row */}
                        {event.tags.length > 0 && (
                          <div className="mt-space-3 flex flex-wrap gap-space-1">
                            {event.tags.map((tag) => (
                              <span key={`${event.id}-${tag}`} className="rounded-full bg-neutral-100 px-space-2 py-0.5 font-body text-caption-sm text-neutral-600">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Price — small footer */}
                        <p className="mt-space-3 font-display text-label-md text-[#0C1D5E]">
                          {formatPhp(event.pricePhp)}
                        </p>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}

            {/* View more events — events.com style centered button */}
            {!loading && !error && (
              <div className="mt-space-8 flex justify-center">
                <Link
                  to={toDiscoverPath('/events')}
                  className="rounded-full border-2 border-[#0C1D5E] px-space-8 py-space-3 font-display text-label-lg text-[#0C1D5E] transition-colors duration-fast hover:bg-[#0C1D5E] hover:text-white"
                >
                  View more events
                </Link>
              </div>
            )}

            {!loading && !error && moreEvents.length > 0 && (
              <div className="mt-space-5 grid gap-space-3 sm:grid-cols-2 lg:grid-cols-3">
                {moreEvents.map((event) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="rounded-2xl border border-neutral-100 bg-white p-space-3 shadow-sm transition-all duration-fast hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <p className="font-display text-label-md text-[#0C1D5E]">{event.title}</p>
                    <p className="mt-space-1 font-body text-body-sm text-neutral-500">{event.venue} - {event.city}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FEATURED SUPPLIERS ── dark premium section */}
      {!loading && !error && (feed?.featuredSuppliers?.length ?? 0) > 0 && (
        <section className="bg-[#060F2E] py-space-10 md:py-space-12">
          <div className="mx-auto max-w-[1280px] px-space-4 md:px-space-6">
            <div className="flex items-end justify-between gap-space-3">
              <div>
                <p className="font-display text-overline uppercase tracking-[0.15em] text-secondary-400">Trusted partners</p>
                <h2 className="mt-space-1 font-display font-bold text-white text-2xl md:text-3xl">Featured Suppliers</h2>
                <p className="mt-space-1 font-body text-white/50 text-body-sm">Verified businesses ready to make your event unforgettable</p>
              </div>
              <Link to="/suppliers" className="shrink-0 font-display text-label-md text-secondary-400 hover:text-secondary-300">
                Browse all
              </Link>
            </div>
          </div>
          <div className="mx-auto mt-space-6 max-w-[1280px]">
            <div className="flex gap-space-4 overflow-x-auto px-space-4 pb-space-3 md:px-space-6 scrollbar-hide">
              {feed.featuredSuppliers.map((supplier) => {
                const fallbackImage = supplierImageByCategory[supplier.category] || supplierFallbackImage
                return (
                  <Link key={supplier.id} to={`/suppliers/${supplier.id}`} className="w-64 flex-shrink-0">
                    <article className="group h-full overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-fast hover:-translate-y-1 hover:shadow-2xl">
                      <div className="relative overflow-hidden">
                        <img
                          src={supplier.imageUrl || fallbackImage}
                          alt={supplier.name}
                          onError={getFallbackImageHandler(fallbackImage)}
                          className="aspect-[4/3] w-full object-cover transition-transform duration-slow group-hover:scale-[1.04]"
                        />
                        {supplier.isFeatured && (
                          <span className="absolute right-space-2 top-space-2 rounded-full bg-secondary-500 px-space-2 py-0.5 font-display text-caption-sm text-white shadow-sm">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="p-space-4">
                        <p className="line-clamp-1 font-display text-heading-sm font-bold text-neutral-900">{supplier.name}</p>
                        <p className="mt-0.5 font-body text-caption-sm text-neutral-500">{supplier.category} · {supplier.city}</p>
                        <div className="mt-space-2 flex items-center gap-1 font-body text-caption-sm">
                          <span className="text-amber-400">★</span>
                          <span className="font-semibold text-neutral-800">{supplier.rating}</span>
                          <span className="text-neutral-400">({supplier.reviews} reviews)</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── BUSINESS CTA ── full-bleed dark navy with rings + stats */}
      <section className="relative overflow-hidden bg-[#0C1D5E] w-full">
        {/* Decorative concentric rings (right side) */}
        <div className="pointer-events-none absolute -right-40 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full border border-white/8" />
        <div className="pointer-events-none absolute -right-24 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full border border-white/12" />
        <div className="pointer-events-none absolute right-4 top-1/2 h-[260px] w-[260px] -translate-y-1/2 rounded-full border border-white/18" />

        <div className="relative mx-auto max-w-[1280px] px-space-4 py-space-12 md:px-space-6 md:py-space-16">
          <div className="max-w-2xl">
            <p className="font-display text-overline uppercase tracking-[0.15em] text-secondary-400">For Businesses</p>
            <h2 className="mt-space-3 font-display font-extrabold leading-tight text-white text-3xl sm:text-4xl md:text-5xl">
              Grow your events business with EventPinas
            </h2>
            <p className="mt-space-4 max-w-lg font-body text-white/70 text-body-md">
              List your services and get discovered by thousands of event organizers across the Philippines. Join the marketplace that powers Philippine events.
            </p>

            {/* Stats row */}
            <div className="mt-space-6 flex flex-wrap gap-space-3">
              {[
                { value: '500+', label: 'Active suppliers' },
                { value: '2,000+', label: 'Event organizers' },
                { value: '₱0', label: 'Listing fee', highlight: true },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/15 bg-white/8 px-space-4 py-space-3">
                  <p className={`font-display font-extrabold text-xl ${stat.highlight ? 'text-secondary-400' : 'text-white'}`}>
                    {stat.value}
                  </p>
                  <p className="font-body text-caption-lg text-white/55">{stat.label}</p>
                </div>
              ))}
            </div>

            <Link
              to="/suppliers"
              className="mt-space-6 inline-flex items-center gap-2 rounded-full bg-secondary-500 px-space-6 py-space-3 font-display text-label-lg text-white transition-colors duration-fast hover:bg-secondary-400"
            >
              List your business
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── TOP ORGANIZERS ── white section, elevated */}
      {!loading && !error && (feed?.topOrganizers?.length ?? 0) > 0 && (
        <section className="bg-white py-space-10 md:py-space-12">
          <div className="mx-auto max-w-[1280px] px-space-4 md:px-space-6">
            <div className="flex items-end justify-between gap-space-3">
              <div>
                <p className="font-display text-overline uppercase tracking-[0.15em] text-[#0C1D5E]">Top rated</p>
                <h2 className="mt-space-1 font-display font-bold text-[#0C1D5E] text-2xl md:text-3xl">Top Organizers</h2>
                <p className="mt-space-1 font-body text-body-sm text-neutral-500">
                  Trusted by hundreds of events across the Philippines
                </p>
              </div>
              <Link to="/organizers" className="shrink-0 font-display text-label-md text-secondary-600 hover:text-secondary-700">
                View all
              </Link>
            </div>
          </div>
          <div className="mx-auto mt-space-6 max-w-[1280px]">
            <div className="flex gap-space-4 overflow-x-auto px-space-4 pb-space-3 md:px-space-6 scrollbar-hide">
              {feed.topOrganizers.map((org) => {
                const fallbackImage = organizerImageBySpecialty[org.specialties[0]] || organizerFallbackImage
                return (
                  <Link key={org.id} to={`/organizers/${org.id}`} className="w-64 flex-shrink-0">
                    <article className="group h-full overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-fast hover:-translate-y-1 hover:shadow-xl">
                      <div className="relative overflow-hidden">
                        <img
                          src={org.avatarUrl || fallbackImage}
                          alt={org.name}
                          onError={getFallbackImageHandler(fallbackImage)}
                          className="aspect-[4/3] w-full object-cover transition-transform duration-slow group-hover:scale-[1.04]"
                        />
                        {org.isVerified && (
                          <span className="absolute right-space-2 top-space-2 rounded-full bg-secondary-500 px-space-2 py-0.5 font-display text-caption-sm text-white shadow-sm">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="p-space-4">
                        <p className="line-clamp-1 font-display text-heading-sm font-bold text-neutral-900">{org.name}</p>
                        <p className="mt-0.5 font-body text-caption-sm text-neutral-500">{org.specialties[0]} · {org.city}</p>
                        <div className="mt-space-2 flex items-center gap-1 font-body text-caption-sm">
                          <span className="text-amber-400">★</span>
                          <span className="font-semibold text-neutral-800">{org.rating}</span>
                          <span className="text-neutral-400">({org.eventsHandled} events)</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CATEGORIES ── dark premium with vibrant circle images */}
      <section className="bg-[#060F2E] py-space-10 md:py-space-14">
        <div className="mx-auto max-w-[1280px] px-space-4 md:px-space-6">
          <p className="font-display text-overline uppercase tracking-[0.15em] text-secondary-400">Explore by type</p>
          <div className="mt-space-1 flex items-end justify-between gap-space-3">
            <h2 className="font-display font-bold text-white text-2xl md:text-3xl">Browse by Category</h2>
            <p className="hidden font-body text-body-sm text-white/45 md:block">Filter events and suppliers by what you need</p>
          </div>

          <div className="mt-space-8 grid grid-cols-3 gap-x-space-4 gap-y-space-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
            {categoryShowcase.map((item) => {
              const active = activeCategory === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveCategory(item.key)}
                  className="group flex flex-col items-center gap-space-2"
                >
                  <span className={`inline-flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 transition-all duration-fast sm:h-28 sm:w-28 md:h-32 md:w-32 ${
                    active
                      ? 'border-secondary-500 shadow-lg shadow-secondary-500/30 scale-105'
                      : 'border-white/20 group-hover:border-white/50'
                  }`}>
                    <img src={item.image} alt={item.label} className="h-full w-full object-cover transition-transform duration-slow group-hover:scale-[1.08]" />
                  </span>
                  <span className={`font-display text-label-sm font-semibold transition-colors duration-fast ${active ? 'text-secondary-400' : 'text-white/65 group-hover:text-white'}`}>
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-space-6 flex flex-wrap gap-space-2">
            <button
              type="button"
              onClick={() => setActiveCategory('All')}
              className={`rounded-full border px-space-3 py-space-1 font-display text-label-sm transition-colors duration-fast ${
                activeCategory === 'All'
                  ? 'border-secondary-500 bg-secondary-500 text-white'
                  : 'border-white/20 text-white/65 hover:border-white/40 hover:text-white'
              }`}
            >
              All
            </button>
            {marketplaceCategories.filter((category) => category !== 'All').map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-space-3 py-space-1 font-display text-label-sm transition-colors duration-fast ${
                  activeCategory === category
                    ? 'border-secondary-500 bg-secondary-500 text-white'
                    : 'border-white/20 text-white/65 hover:border-white/40 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
