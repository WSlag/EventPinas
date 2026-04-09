import { adSlots, events, marketplaceCategories, organizers, suppliers } from '@/data/marketplaceData'

const DEFAULT_DELAY_MS = 120

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase()
}

function includesQuery(value, query) {
  if (!query) return true
  return normalizeText(value).includes(query)
}

function compareByDateAscending(a, b) {
  return new Date(a.date).getTime() - new Date(b.date).getTime()
}

function sortEvents(items, sortBy) {
  if (sortBy === 'priceAsc') return [...items].sort((a, b) => a.pricePhp - b.pricePhp)
  if (sortBy === 'priceDesc') return [...items].sort((a, b) => b.pricePhp - a.pricePhp)
  if (sortBy === 'popular') return [...items].sort((a, b) => b.soldPercent - a.soldPercent)
  return [...items].sort(compareByDateAscending)
}

function applyEventFilters(items, filters = {}) {
  const category = filters.category ?? 'All'
  const city = filters.city ?? 'All'
  const query = normalizeText(filters.query)

  return items.filter((item) => {
    const categoryMatch = category === 'All' || item.category === category
    const cityMatch = city === 'All' || item.city === city
    const queryMatch =
      includesQuery(item.title, query) ||
      includesQuery(item.venue, query) ||
      includesQuery(item.city, query) ||
      item.tags.some((tag) => includesQuery(tag, query))

    return categoryMatch && cityMatch && queryMatch
  })
}

function applySupplierFilters(items, filters = {}) {
  const category = filters.category ?? 'All'
  const city = filters.city ?? 'All'
  const query = normalizeText(filters.query)
  const featuredOnly = filters.featuredOnly ?? false

  return items.filter((item) => {
    const categoryMatch = category === 'All' || item.category === category
    const cityMatch = city === 'All' || item.city === city
    const featuredMatch = !featuredOnly || item.isFeatured
    const queryMatch =
      includesQuery(item.name, query) ||
      includesQuery(item.category, query) ||
      includesQuery(item.city, query) ||
      includesQuery(item.tag, query) ||
      (item.specializations ?? []).some((specialization) => includesQuery(specialization, query))

    return categoryMatch && cityMatch && featuredMatch && queryMatch
  })
}

function applyOrganizerFilters(items, filters = {}) {
  const city = filters.city ?? 'All'
  const specialty = filters.specialty ?? 'All'
  const query = normalizeText(filters.query)
  const featuredOnly = filters.featuredOnly ?? false

  return items.filter((item) => {
    const cityMatch = city === 'All' || item.city === city
    const specialtyMatch = specialty === 'All' || item.specialties.includes(specialty)
    const featuredMatch = !featuredOnly || item.isFeatured
    const queryMatch =
      includesQuery(item.name, query) ||
      includesQuery(item.city, query) ||
      item.specialties.some((specialty) => includesQuery(specialty, query))

    return cityMatch && specialtyMatch && featuredMatch && queryMatch
  })
}

function sortSuppliers(items, sortBy = 'ratingDesc') {
  const copy = [...items]

  if (sortBy === 'featuredFirst') {
    return copy.sort((a, b) => {
      const featuredDelta = Number(b.isFeatured) - Number(a.isFeatured)
      if (featuredDelta !== 0) return featuredDelta
      return b.rating - a.rating
    })
  }
  if (sortBy === 'reviewsDesc') return copy.sort((a, b) => b.reviews - a.reviews)
  if (sortBy === 'bookingsDesc') return copy.sort((a, b) => (b.bookingsCount ?? 0) - (a.bookingsCount ?? 0))

  return copy.sort((a, b) => b.rating - a.rating)
}

function sortOrganizers(items, sortBy = 'ratingDesc') {
  const copy = [...items]

  if (sortBy === 'eventsDesc') return copy.sort((a, b) => b.eventsHandled - a.eventsHandled)
  if (sortBy === 'cityAsc') return copy.sort((a, b) => a.city.localeCompare(b.city))

  return copy.sort((a, b) => b.rating - a.rating)
}

function maybeLimit(items, limit) {
  if (!limit || limit < 1) return items
  return items.slice(0, limit)
}

export async function listEvents(filters = {}, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const filtered = applyEventFilters(events, filters)
  const sorted = sortEvents(filtered, filters.sortBy)
  return maybeLimit(sorted, filters.limit)
}

export async function listSuppliers(filters = {}, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const filtered = applySupplierFilters(suppliers, filters)
  const sorted = sortSuppliers(filtered, filters.sortBy)
  return maybeLimit(sorted, filters.limit)
}

export async function listOrganizers(filters = {}, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const filtered = applyOrganizerFilters(organizers, filters)
  const sorted = sortOrganizers(filtered, filters.sortBy)
  return maybeLimit(sorted, filters.limit)
}

export async function getHomeFeed(filters = {}, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)

  const upcomingEvents = await listEvents(
    { ...filters, limit: filters.eventsLimit ?? 4, sortBy: filters.sortBy ?? 'dateAsc' },
    { simulateLatency: false },
  )
  const featuredSuppliers = await listSuppliers(
    { ...filters, featuredOnly: true, limit: filters.suppliersLimit ?? 6 },
    { simulateLatency: false },
  )
  const topOrganizers = await listOrganizers(
    { ...filters, featuredOnly: true, limit: filters.organizersLimit ?? 4 },
    { simulateLatency: false },
  )

  return {
    adSlots,
    upcomingEvents,
    featuredSuppliers,
    topOrganizers,
  }
}

export async function getEventById(id, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  return events.find((item) => item.id === id) ?? null
}

export async function getSupplierById(id, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  return suppliers.find((item) => item.id === id) ?? null
}

export async function getOrganizerById(id, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  return organizers.find((item) => item.id === id) ?? null
}

export async function searchMarketplace(query, filters = {}, options = {}) {
  const normalizedQuery = normalizeText(query)
  const [matchingEvents, matchingSuppliers, matchingOrganizers] = await Promise.all([
    listEvents({ ...filters, query: normalizedQuery, limit: filters.eventsLimit ?? 5 }, options),
    listSuppliers({ ...filters, query: normalizedQuery, limit: filters.suppliersLimit ?? 5 }, options),
    listOrganizers({ ...filters, query: normalizedQuery, limit: filters.organizersLimit ?? 5 }, options),
  ])

  return {
    query: normalizedQuery,
    total: matchingEvents.length + matchingSuppliers.length + matchingOrganizers.length,
    events: matchingEvents,
    suppliers: matchingSuppliers,
    organizers: matchingOrganizers,
  }
}

export function getMarketplaceFilterOptions() {
  const eventCities = Array.from(new Set(events.map((item) => item.city))).sort()
  const supplierCities = Array.from(new Set(suppliers.map((item) => item.city))).sort()
  const organizerCities = Array.from(new Set(organizers.map((item) => item.city))).sort()
  const organizerSpecialties = Array.from(
    new Set(organizers.flatMap((item) => item.specialties)),
  ).sort()

  return {
    categories: marketplaceCategories,
    cities: Array.from(new Set([...eventCities, ...supplierCities, ...organizerCities])).sort(),
    supplierCategories: Array.from(new Set(suppliers.map((item) => item.category))).sort(),
    organizerSpecialties,
  }
}

export async function getSavedMarketplaceItems(savedMap, options = {}) {
  const source = savedMap ?? { events: [], suppliers: [], organizers: [] }
  const eventIds = Array.isArray(source.events) ? source.events : []
  const supplierIds = Array.isArray(source.suppliers) ? source.suppliers : []
  const organizerIds = Array.isArray(source.organizers) ? source.organizers : []

  const [savedEvents, savedSuppliers, savedOrganizers] = await Promise.all([
    Promise.all(eventIds.map((id) => getEventById(id, options))),
    Promise.all(supplierIds.map((id) => getSupplierById(id, options))),
    Promise.all(organizerIds.map((id) => getOrganizerById(id, options))),
  ])

  return {
    events: savedEvents.filter(Boolean),
    suppliers: savedSuppliers.filter(Boolean),
    organizers: savedOrganizers.filter(Boolean),
  }
}
