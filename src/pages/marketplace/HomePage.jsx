import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { marketplaceCategories } from '@/data'
import { getHomeFeed, getMarketplaceFilterOptions, getSavedItems, toggleSavedItem } from '@/services'
import { getFallbackImageHandler } from '@/utils/imageFallback'

const heroImages = [
  {
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=2200&q=80',
    label: 'Concerts & Festivals',
    position: '70% center',
  },
  {
    url: 'https://unsplash.com/photos/ULHxWq8reao/download?force=true&w=2200',
    label: 'Wine Toast Celebrations',
    position: 'center center',
  },
  {
    url: 'https://unsplash.com/photos/Knt1jl1r8Kk/download?force=true&w=2200',
    label: 'Wedding Moments',
    position: 'center 35%',
  },
  {
    url: 'https://unsplash.com/photos/nOvIa_x_tfo/download?force=true&w=2200',
    label: 'Lobby Networking',
    position: 'center center',
  },
]

const supplierImageByCategory = {
  Florist:        'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=75',
  Catering:       'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=75',
  Photography:    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=75',
  'Audio-Visual': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=75',
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
  Wedding:   'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
  Reunion:   'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1000&q=80',
  Festival:  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1000&q=80',
  Concert:   'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80',
  Corporate: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1000&q=80',
  Community: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=80',
  Debut:     'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1000&q=80',
  Expo:      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=80',
}

// Category-specific gradient overlays for event cards — inspired by Eventbrite 2025 energy auras
const categoryGradient = {
  Concert:   'from-violet-900/85 via-purple-800/40 to-transparent',
  Festival:  'from-amber-900/85 via-orange-700/35 to-transparent',
  Wedding:   'from-rose-900/85 via-pink-800/35 to-transparent',
  Debut:     'from-pink-900/85 via-rose-700/35 to-transparent',
  Corporate: 'from-slate-900/85 via-blue-900/35 to-transparent',
  Community: 'from-emerald-900/85 via-green-800/35 to-transparent',
  Reunion:   'from-amber-800/85 via-yellow-800/35 to-transparent',
  Expo:      'from-sky-900/85 via-blue-800/35 to-transparent',
}
const defaultCategoryGradient = 'from-neutral-900/85 via-neutral-700/35 to-transparent'

const categoryShowcase = [
  { key: 'Wedding',   label: 'Wedding',   image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=700&q=80' },
  { key: 'Reunion',   label: 'Reunion',   image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=700&q=80' },
  { key: 'Festival',  label: 'Festival',  image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=700&q=80' },
  { key: 'Concert',   label: 'Concert',   image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=700&q=80' },
  { key: 'Corporate', label: 'Corporate', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=700&q=80' },
  { key: 'Community', label: 'Community', image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=700&q=80' },
  { key: 'Debut',     label: 'Debut',     image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=700&q=80' },
]

const whyUseCards = [
  {
    num: '01',
    title: 'Create & launch events in minutes',
    description: 'Design your event page, collect registrations, and track every RSVP — all from one powerful dashboard built for Philippine organizers.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=85',
    alt: 'Stunning event conference setup with stage lighting',
    ctaLabel: 'Create your event',
    ctaTo: '/register?role=organizer',
    gradient: 'from-orange-700/95 via-primary-600/60 to-transparent',
    pill: 'bg-primary-400',
  },
  {
    num: '02',
    title: 'Connect with verified suppliers',
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
    return () => { active = false }
  }, [activeCategory, quickCity, quickQuery])

  const savedEvents = useMemo(() => new Set(savedMap.events ?? []), [savedMap.events])
  const featuredEvents = useMemo(() => feed?.featuredEvents?.slice(0, 3) ?? [], [feed?.featuredEvents])

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

  function onDiscoverSubmit(e) {
    e.preventDefault()
    navigate(toDiscoverPath('/events'))
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── 1. HERO ── full-screen rotating photography + energy aura overlay */}
      <section className="relative min-h-screen min-h-[100svh] overflow-hidden bg-[#0C1D5E]">

        {/* Full-bleed crossfade photography */}
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

        {/* Dark directional overlay — text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Energy aura tints on top of photo */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_70%_at_0%_100%,rgba(217,58,24,0.35)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_55%_at_100%_0%,rgba(107,33,168,0.25)_0%,transparent_60%)]" />

        {/* Content — single column, left-aligned */}
        <div className="relative mx-auto flex min-h-screen min-h-[100svh] max-w-[1680px] items-center
                        px-space-4 pb-24 pt-24 md:px-space-8">
          <div className="w-full max-w-2xl">
          <div className="flex flex-col justify-center">
            <p className="font-display text-overline uppercase tracking-[0.14em] text-primary-300">
              EventPinas Marketplace
            </p>

            <h1 className="mt-space-3 font-display font-extrabold leading-[1.05] tracking-tight text-white
                           text-[2.75rem] sm:text-[3.5rem] md:text-[4.5rem] lg:text-[4.75rem]">
              Where great{' '}
              <span className="text-primary-300">events</span>
              <br />begin.
            </h1>

            <p className="mt-space-5 max-w-xl font-body text-white/75 text-body-md md:text-body-lg">
              Manage events, find trusted suppliers, and connect with top organizers — everything Philippine event creators need, in one place.
            </p>

            {/* Integrated search form */}
            <form className="mt-space-6 w-full max-w-xl space-y-space-3" onSubmit={onDiscoverSubmit}>
              <input
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Search event title, venue, tag, or city"
                className="h-14 w-full rounded-2xl border border-white/20 bg-white/10
                           px-space-5 font-body text-body-md text-white
                           placeholder:text-white/40 backdrop-blur-sm
                           focus:outline-none focus:ring-2 focus:ring-primary-300/60"
              />

              <div className="grid grid-cols-2 gap-space-3">
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                  className="h-12 rounded-xl border border-white/20 bg-white/10 px-space-4
                             font-body text-body-sm text-white backdrop-blur-sm
                             focus:outline-none focus:ring-2 focus:ring-primary-300/60"
                >
                  {filterOptions.categories.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>

                <select
                  value={quickCity}
                  onChange={(e) => setQuickCity(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                  className="h-12 rounded-xl border border-white/20 bg-white/10 px-space-4
                             font-body text-body-sm text-white backdrop-blur-sm
                             focus:outline-none focus:ring-2 focus:ring-primary-300/60"
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
                  className="inline-flex h-12 min-w-[148px] items-center justify-center rounded-full
                             bg-primary-400 px-space-6 font-display text-label-md text-white shadow-primary
                             transition-all duration-fast hover:bg-primary-500 hover:shadow-lg hover:scale-[1.02]
                             active:scale-[0.98]"
                >
                  Search events
                </button>
                <Link
                  to={toDiscoverPath('/suppliers')}
                  className="inline-flex h-12 min-w-[148px] items-center justify-center rounded-full
                             border border-white/35 bg-white/10 px-space-6 font-display text-label-md text-white
                             backdrop-blur-sm transition-all duration-fast hover:bg-white/20 active:scale-[0.98]"
                >
                  Find suppliers
                </Link>
              </div>
            </form>

            {/* Primary CTAs */}
            <div className="mt-space-5 flex flex-wrap gap-space-3">
              <Link
                to="/register?role=organizer"
                className="inline-flex items-center rounded-full bg-primary-400 px-space-6 py-space-3
                           font-display text-label-lg text-white shadow-primary
                           transition-all duration-fast hover:bg-primary-500 hover:shadow-lg hover:scale-[1.02]
                           active:scale-[0.98]"
              >
                Create event
              </Link>
              <Link
                to="/suppliers"
                className="inline-flex items-center rounded-full border border-white/40 bg-white/10
                           px-space-6 py-space-3 font-display text-label-lg text-white
                           backdrop-blur-sm transition-all duration-fast hover:bg-white/20 active:scale-[0.98]"
              >
                Explore suppliers
              </Link>
            </div>

            {/* Slide indicators */}
            <div className="mt-space-8 flex items-center gap-space-3">
              {heroImages.map((img, i) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => setHeroIndex(i)}
                  aria-label={`View ${img.label}`}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === heroIndex
                      ? 'w-10 bg-primary-300'
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
        </div>

        {/* Stats ticker strip */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden
                        border-t border-white/10 bg-black/20 py-space-2
                        pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur-sm md:pb-space-2">
          <div className="ticker-track">
            {[...Array(2)].map((_, setIdx) => (
              <span key={setIdx} className="flex flex-shrink-0 items-center gap-space-8">
                <span className="font-display text-caption-lg text-white/65">500+ Active Suppliers</span>
                <span className="text-white/25">·</span>
                <span className="font-display text-caption-lg text-white/65">2,000+ Event Organizers</span>
                <span className="text-white/25">·</span>
                <span className="font-display text-caption-lg font-semibold text-primary-300">₱0 Listing Fee</span>
                <span className="text-white/25">·</span>
                <span className="font-display text-caption-lg text-white/65">Built for the Philippines</span>
                <span className="text-white/25">·</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. CATEGORIES ── portrait card carousel */}
      <section className="relative bg-white py-space-12 md:py-space-14">
        {/* Subtle gradient bleed from hero above */}
        <div className="pointer-events-none absolute left-0 right-0 top-0 h-20 bg-gradient-to-b from-[#0C1D5E]/5 to-transparent" />

        <div className="relative mx-auto max-w-[1280px] px-space-4 md:px-space-6">
          <div className="flex items-end justify-between gap-space-3">
            <div>
              <p className="font-display text-overline uppercase tracking-[0.15em] text-neutral-400">Explore by type</p>
              <h2 className="mt-space-1 font-display font-extrabold leading-tight text-[#0C1D5E] text-2xl md:text-3xl">
                Browse by Category
              </h2>
            </div>
            <p className="hidden font-body text-body-sm text-neutral-400 md:block">
              Filter events and suppliers by what you need
            </p>
          </div>
        </div>

        {/* Portrait card scroll */}
        <div className="relative mx-auto mt-space-6 max-w-[1280px]">
          <div className="flex gap-space-3 overflow-x-auto scroll-smooth snap-x snap-mandatory
                          px-space-4 pb-space-3 scrollbar-hide md:px-space-6">
            {categoryShowcase.map((item) => {
              const active = activeCategory === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveCategory(item.key)}
                  className={`group snap-start relative w-36 flex-shrink-0 overflow-hidden rounded-2xl
                              border-2 transition-all duration-300 md:w-44 ${
                    active
                      ? 'border-primary-400 shadow-lg shadow-primary-400/20'
                      : 'border-transparent hover:border-neutral-200'
                  }`}
                >
                  <div className="aspect-[3/4] w-full overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.label}
                      className="h-full w-full object-cover transition-transform duration-slow group-hover:scale-[1.06]"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-space-3">
                    <span className="font-display text-label-sm font-semibold text-white">{item.label}</span>
                    {active && (
                      <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary-400 align-middle" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Category pill filters */}
        <div className="mx-auto mt-space-4 max-w-[1280px] px-space-4 md:px-space-6">
          <div className="flex flex-wrap gap-space-2">
            <button
              type="button"
              onClick={() => setActiveCategory('All')}
              className={`rounded-full border px-space-3 py-space-1 font-display text-label-sm
                          transition-all duration-fast active:scale-[0.97] ${
                activeCategory === 'All'
                  ? 'border-primary-400 bg-primary-400 text-white'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-primary-300 hover:text-primary-500'
              }`}
            >
              All
            </button>
            {marketplaceCategories.filter((c) => c !== 'All').map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-space-3 py-space-1 font-display text-label-sm
                            transition-all duration-fast active:scale-[0.97] ${
                  activeCategory === category
                    ? 'border-primary-400 bg-primary-400 text-white'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-primary-300 hover:text-primary-500'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. FEATURED EVENTS ── category-colored card overlays */}
      <section className="bg-neutral-50 py-space-10 md:py-space-14">
        <div className="mx-auto max-w-[1280px] px-space-4 md:px-space-6">

          {/* Section header */}
          <div className="flex items-start justify-between gap-space-3">
            <div className="flex items-center gap-space-4">
              <span className="hidden select-none font-display text-[3rem] font-black leading-none text-primary-400/15 md:block">
                01
              </span>
              <div>
                <p className="font-display text-overline uppercase tracking-[0.15em] text-primary-500">Happening now</p>
                <h2 className="font-display font-extrabold leading-tight text-[#0C1D5E] text-2xl md:text-3xl">
                  Featured Events
                </h2>
              </div>
            </div>
            <Link
              to="/events"
              className="shrink-0 font-display text-label-md text-secondary-600 transition-colors duration-fast hover:text-secondary-700"
            >
              View all →
            </Link>
          </div>

          <div className="mt-space-6">
            {loading && <LoadingState label="Loading featured events..." />}
            {error && <ErrorState message={error} />}
            {!loading && !error && featuredEvents.length === 0 && (
              <EmptyState message="No featured events available for this category right now." />
            )}

            {!loading && !error && featuredEvents.length > 0 && (
              <div className="grid gap-space-4 grid-cols-1 md:grid-cols-3">

                {/* Large feature card */}
                {(() => {
                  const event = featuredEvents[0]
                  const fallbackImage = eventImageByCategory[event.category] || eventImageByCategory.Festival
                  const isSaved = savedEvents.has(event.id)
                  const cardGradient = categoryGradient[event.category] ?? defaultCategoryGradient
                  return (
                    <article
                      key={event.id}
                      className={`stagger-item stagger-delay-1 group relative min-h-[380px] overflow-hidden rounded-3xl md:min-h-[460px] ${
                        featuredEvents.length === 1 ? 'md:col-span-3' : 'md:col-span-2'
                      }`}
                    >
                      <img
                        src={event.imageUrl || fallbackImage}
                        alt={event.title}
                        onError={getFallbackImageHandler(fallbackImage)}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${cardGradient}`} />

                      {/* Date pill */}
                      <div className="absolute left-space-4 top-space-4">
                        <span className="rounded-full bg-white/15 px-space-3 py-1 font-display text-caption-lg text-white backdrop-blur-sm">
                          {formatDate(event.date)}
                        </span>
                      </div>

                      {/* Tag */}
                      {event.tags[0] && (
                        <span className={`absolute left-space-4 top-14 rounded-full px-space-2 py-0.5 font-display text-caption-sm text-white shadow-sm ${tagBadgeClass(event.tags[0])}`}>
                          {event.tags[0]}
                        </span>
                      )}

                      {/* Heart */}
                      <button
                        type="button"
                        onClick={() => onToggleSavedEvent(event.id)}
                        aria-label={isSaved ? 'Remove from saved' : 'Save event'}
                        className={`absolute right-space-4 top-space-4 rounded-full p-2 shadow-md transition-colors duration-fast ${
                          isSaved ? 'bg-secondary-500 text-white' : 'bg-white/20 text-white hover:bg-white/35'
                        }`}
                      >
                        <HeartIcon filled={isSaved} />
                      </button>

                      {/* Bottom overlay */}
                      <div className="absolute inset-x-0 bottom-0 p-space-5 md:p-space-6">
                        <Link
                          to={`/events/${event.id}`}
                          className="block line-clamp-2 font-display font-extrabold leading-tight text-white text-2xl hover:text-white/90 md:text-3xl"
                        >
                          {event.title}
                        </Link>
                        <div className="mt-space-3 flex items-center justify-between gap-space-3">
                          <p className="flex items-center gap-1 font-body text-body-sm text-white/70">
                            <PinIcon />
                            {event.city}
                          </p>
                          <div className="flex items-center gap-space-3">
                            <span className="font-display text-label-md text-white/80">
                              {formatPhp(event.pricePhp)}
                            </span>
                            <Link
                              to={`/events/${event.id}`}
                              className="rounded-full bg-primary-400 px-space-4 py-space-2 font-display text-label-sm text-white
                                         transition-all duration-fast hover:bg-primary-500 active:scale-[0.97]"
                            >
                              Let&apos;s go
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })()}

                {/* Smaller stacked cards */}
                {featuredEvents.length > 1 && (
                  <div className="flex flex-col gap-space-4">
                    {featuredEvents.slice(1, 3).map((event, idx) => {
                      const fallbackImage = eventImageByCategory[event.category] || eventImageByCategory.Festival
                      const isSaved = savedEvents.has(event.id)
                      const cardGradient = categoryGradient[event.category] ?? defaultCategoryGradient
                      return (
                        <article
                          key={event.id}
                          className={`stagger-item stagger-delay-${idx + 2} group relative min-h-[180px] flex-1 overflow-hidden rounded-2xl`}
                        >
                          <img
                            src={event.imageUrl || fallbackImage}
                            alt={event.title}
                            onError={getFallbackImageHandler(fallbackImage)}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                          />
                          <div className={`absolute inset-0 bg-gradient-to-t ${cardGradient}`} />

                          <button
                            type="button"
                            onClick={() => onToggleSavedEvent(event.id)}
                            aria-label={isSaved ? 'Remove from saved' : 'Save event'}
                            className={`absolute right-space-3 top-space-3 rounded-full p-1.5 shadow-md transition-colors duration-fast ${
                              isSaved ? 'bg-secondary-500 text-white' : 'bg-white/20 text-white hover:bg-white/35'
                            }`}
                          >
                            <HeartIcon filled={isSaved} />
                          </button>

                          <div className="absolute inset-x-0 bottom-0 p-space-4">
                            <p className="font-display text-caption-sm font-semibold uppercase tracking-wide text-white/65">
                              {formatDate(event.date)}
                            </p>
                            <Link
                              to={`/events/${event.id}`}
                              className="mt-0.5 block line-clamp-2 font-display font-bold text-white text-heading-sm hover:text-white/90"
                            >
                              {event.title}
                            </Link>
                            <div className="mt-space-2 flex items-center justify-between">
                              <p className="flex items-center gap-1 font-body text-caption-sm text-white/60">
                                <PinIcon />
                                {event.city}
                              </p>
                              <span className="font-display text-label-sm text-white/75">
                                {formatPhp(event.pricePhp)}
                              </span>
                            </div>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {!loading && !error && (
              <div className="mt-space-8 flex justify-center">
                <Link
                  to={toDiscoverPath('/events')}
                  className="rounded-full border-2 border-neutral-300 px-space-8 py-space-3
                             font-display text-label-lg text-neutral-700
                             transition-all duration-fast hover:border-primary-400 hover:text-primary-500
                             active:scale-[0.98]"
                >
                  View more events
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 4. FEATURED SUPPLIERS ── light teal-tinted section */}
      {!loading && !error && (feed?.featuredSuppliers?.length ?? 0) > 0 && (
        <section className="bg-secondary-50 py-space-10 md:py-space-12">
          <div className="mx-auto max-w-[1280px] px-space-4 md:px-space-6">
            <div className="flex items-start justify-between gap-space-3">
              <div className="flex items-center gap-space-4">
                <span className="hidden select-none font-display text-[3rem] font-black leading-none text-secondary-200 md:block">
                  02
                </span>
                <div>
                  <p className="font-display text-overline uppercase tracking-[0.15em] text-secondary-600">Trusted partners</p>
                  <h2 className="font-display font-extrabold leading-tight text-[#060F2E] text-2xl md:text-3xl">
                    Featured Suppliers
                  </h2>
                  <p className="mt-space-1 font-body text-neutral-500 text-body-sm">
                    Verified businesses ready to make your event unforgettable
                  </p>
                </div>
              </div>
              <Link to="/suppliers" className="shrink-0 font-display text-label-md text-secondary-600 transition-colors duration-fast hover:text-secondary-700">
                Browse all →
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-space-6 max-w-[1280px]">
            <div className="flex gap-space-4 overflow-x-auto px-space-4 pb-space-3 md:px-space-6 scrollbar-hide">
              {feed.featuredSuppliers.map((supplier, idx) => {
                const fallbackImage = supplierImageByCategory[supplier.category] || supplierFallbackImage
                return (
                  <Link
                    key={supplier.id}
                    to={`/suppliers/${supplier.id}`}
                    className={`stagger-item stagger-delay-${Math.min(idx + 1, 6)} w-72 flex-shrink-0`}
                  >
                    <article className="group h-full overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-fast hover:-translate-y-1 hover:shadow-xl">
                      <div className="relative overflow-hidden">
                        <img
                          src={supplier.imageUrl || fallbackImage}
                          alt={supplier.name}
                          onError={getFallbackImageHandler(fallbackImage)}
                          className="aspect-[4/3] w-full object-cover transition-transform duration-slow group-hover:scale-[1.04]"
                        />
                        {/* Category pill — teal */}
                        <span className="absolute left-space-3 top-space-3 rounded-full bg-secondary-500 px-space-2 py-0.5 font-display text-caption-sm text-white shadow-sm">
                          {supplier.category}
                        </span>
                        {/* Verified badge */}
                        {supplier.isVerified && (
                          <span className="absolute right-space-2 top-space-2 rounded-full bg-white/90 px-space-2 py-0.5 font-display text-caption-sm text-secondary-700 shadow-sm">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <div className="p-space-4">
                        <p className="line-clamp-1 font-display text-heading-sm font-bold text-neutral-900">{supplier.name}</p>
                        <p className="mt-0.5 font-body text-caption-sm text-neutral-500">{supplier.city}</p>
                        <div className="mt-space-2 flex items-center gap-1 font-body text-caption-sm">
                          <span className="text-amber-400">★</span>
                          <span className="font-semibold text-neutral-800">{supplier.rating}</span>
                          <span className="text-neutral-400">({supplier.reviews} reviews)</span>
                        </div>
                        <div className="mt-space-3 flex items-center justify-between">
                          <p className="font-display text-label-md font-bold text-primary-400">
                            {supplier.startingPricePhp != null
                              ? `From ${formatPhp(supplier.startingPricePhp)}`
                              : (supplier.priceRangeLabel ?? '—')}
                          </p>
                          <span className="font-display text-label-sm text-secondary-600">View →</span>
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

      {/* ── 5. WHY USE ── white, 2×2 grid unchanged */}
      <section className="bg-white py-space-12 md:py-space-16">
        <div className="mx-auto max-w-[1280px] px-space-4 md:px-space-6">
          <div className="flex items-start gap-space-4">
            <span className="hidden select-none font-display text-[3rem] font-black leading-none text-neutral-100 md:block">
              03
            </span>
            <div className="flex-1">
              <p className="font-display text-overline uppercase tracking-[0.15em] text-secondary-600">Built for practical wins</p>
              <div className="mt-space-3 flex flex-col gap-space-4 md:flex-row md:items-end md:justify-between">
                <h2 className="font-display font-extrabold leading-tight text-[#060F2E] text-3xl sm:text-4xl md:text-5xl">
                  Why Use EventPinas
                </h2>
                <p className="max-w-sm font-body text-neutral-500 text-body-sm md:text-right">
                  From planning to post-event insights — everything Philippine event creators need, in one place.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-space-8 max-w-[1280px] px-space-4 md:px-space-6">
          <div className="grid grid-cols-1 gap-space-4 md:grid-cols-2">
            {whyUseCards.map((card) => (
              <div
                key={card.title}
                className="group relative min-h-[320px] overflow-hidden rounded-3xl md:min-h-[400px] lg:min-h-[440px]"
              >
                <img
                  src={card.image}
                  alt={card.alt}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-transparent" />
                <div className={`absolute inset-0 bg-gradient-to-t ${card.gradient}`} />
                <div className="absolute left-space-5 top-space-5">
                  <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${card.pill} font-display text-label-sm font-bold text-white shadow-lg`}>
                    {card.num}
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-space-5 md:p-space-6">
                  <h3 className="font-display font-extrabold leading-tight text-white text-xl md:text-2xl">
                    {card.title}
                  </h3>
                  <p className="mt-space-2 font-body text-white/80 text-body-sm leading-relaxed">
                    {card.description}
                  </p>
                  <Link
                    to={card.ctaTo}
                    className={`mt-space-4 inline-flex items-center gap-2 rounded-full ${card.pill} px-space-5 py-space-2
                                font-display text-label-sm font-semibold text-white shadow-md
                                transition-all duration-fast hover:brightness-110 hover:shadow-lg hover:scale-[1.02]
                                active:scale-[0.98]`}
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

      {/* ── 6. TOP ORGANIZERS ── neutral-50, improved cards */}
      {!loading && !error && (feed?.topOrganizers?.length ?? 0) > 0 && (
        <section className="bg-neutral-50 py-space-10 md:py-space-12">
          <div className="mx-auto max-w-[1280px] px-space-4 md:px-space-6">
            <div className="flex items-start justify-between gap-space-3">
              <div className="flex items-center gap-space-4">
                <span className="hidden select-none font-display text-[3rem] font-black leading-none text-neutral-200 md:block">
                  04
                </span>
                <div>
                  <p className="font-display text-overline uppercase tracking-[0.15em] text-[#0C1D5E]">Top rated</p>
                  <h2 className="font-display font-extrabold leading-tight text-[#0C1D5E] text-2xl md:text-3xl">
                    Top Organizers
                  </h2>
                  <p className="mt-space-1 font-body text-body-sm text-neutral-500">
                    Trusted by hundreds of events across the Philippines
                  </p>
                </div>
              </div>
              <Link to="/organizers" className="shrink-0 font-display text-label-md text-secondary-600 transition-colors duration-fast hover:text-secondary-700">
                View all →
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-space-6 max-w-[1280px]">
            <div className="flex gap-space-4 overflow-x-auto px-space-4 pb-space-3 md:px-space-6 scrollbar-hide">
              {feed.topOrganizers.map((org) => {
                const fallbackImage = organizerImageBySpecialty[org.specialties[0]] || organizerFallbackImage
                return (
                  <Link key={org.id} to={`/organizers/${org.id}`} className="w-72 flex-shrink-0">
                    <article className="group h-full overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-md transition-all duration-fast hover:-translate-y-1 hover:shadow-xl">
                      <div className="relative overflow-hidden">
                        <img
                          src={org.avatarUrl || fallbackImage}
                          alt={org.name}
                          onError={getFallbackImageHandler(fallbackImage)}
                          className="aspect-[4/3] w-full object-cover transition-transform duration-slow group-hover:scale-[1.04]"
                        />
                        {/* Badge — coral, top-left */}
                        {org.badge && (
                          <span className="absolute left-space-2 top-space-2 rounded-full bg-primary-400/90 px-space-2 py-0.5 font-display text-caption-sm text-white shadow-sm">
                            {org.badge}
                          </span>
                        )}
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
                          <span className="text-neutral-400">({org.reviewsCount} reviews)</span>
                        </div>
                        <p className="mt-space-1 font-body text-caption-sm text-neutral-500">
                          <span className="font-semibold text-[#0C1D5E]">{org.eventsHandled}</span> events handled
                        </p>
                      </div>
                    </article>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── 7. BUSINESS CTA ── dark navy + energy auras */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#060F2E]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_0%_50%,rgba(255,107,74,0.18)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_70%_at_100%_50%,rgba(31,168,165,0.12)_0%,transparent_60%)]" />

        <div className="relative mx-auto max-w-[1280px] px-space-4 py-space-12 md:px-space-6 md:py-space-16">
          <div className="max-w-2xl">
            <p className="font-display text-overline uppercase tracking-[0.15em] text-primary-300">For Businesses</p>
            <h2 className="mt-space-3 font-display font-extrabold leading-tight text-white text-3xl sm:text-4xl md:text-5xl">
              Grow your events business with EventPinas
            </h2>
            <p className="mt-space-4 max-w-lg font-body text-white/70 text-body-md">
              List your services and get discovered by thousands of event organizers across the Philippines. Join the marketplace that powers Philippine events.
            </p>

            {/* Stats */}
            <div className="mt-space-6 flex flex-wrap gap-space-3">
              {[
                { value: '500+',   label: 'Active suppliers' },
                { value: '2,000+', label: 'Event organizers' },
                { value: '₱0',     label: 'Listing fee', highlight: true },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/15 bg-white/10 px-space-4 py-space-3">
                  <p className={`font-display font-extrabold text-xl ${stat.highlight ? 'text-primary-300' : 'text-white'}`}>
                    {stat.value}
                  </p>
                  <p className="font-body text-caption-lg text-white/50">{stat.label}</p>
                </div>
              ))}
            </div>

            <Link
              to="/suppliers"
              className="mt-space-6 inline-flex items-center gap-2 rounded-full bg-primary-400
                         px-space-6 py-space-3 font-display text-label-lg text-white shadow-primary
                         transition-all duration-fast hover:bg-primary-500 hover:shadow-lg hover:scale-[1.02]
                         active:scale-[0.98]"
            >
              List your business
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
