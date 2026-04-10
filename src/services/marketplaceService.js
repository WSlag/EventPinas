import { adSlots, events as seedEvents, marketplaceCategories, organizers, suppliers } from '@/data/marketplaceData'
import { auth, db, firebaseEnabled } from '@/lib/firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit as limitConstraint,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore'

const DEFAULT_DELAY_MS = 120
const MARKETPLACE_EVENTS_COLLECTION = 'marketplaceEvents'
const LOCAL_PUBLIC_OWNER_UID = 'local-organizer'
const PUBLIC_EVENT_STATUSES = ['draft', 'upcoming', 'live', 'past']
const DEFAULT_PUBLIC_EVENT_STATUS = 'upcoming'
const DEFAULT_PUBLIC_EVENT_CATEGORY = 'Community'
const DEFAULT_PUBLIC_EVENT_START_TIME = '09:00'
const DEFAULT_PUBLIC_EVENT_DATE = '2099-12-31'
const DEFAULT_FEATURE_STATUS = 'none'
export const PUBLIC_MARKETPLACE_EVENTS_STORAGE_KEY = 'eventpinas-marketplace-public-events'

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase()
}

function includesQuery(value, queryValue) {
  if (!queryValue) return true
  return normalizeText(value).includes(queryValue)
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
  const queryValue = normalizeText(filters.query)
  const featuredOnly = Boolean(filters.featuredOnly)

  return items.filter((item) => {
    const categoryMatch = category === 'All' || item.category === category
    const cityMatch = city === 'All' || item.city === city
    const featuredMatch = !featuredOnly || item.isFeatured
    const queryMatch =
      includesQuery(item.title, queryValue) ||
      includesQuery(item.venue, queryValue) ||
      includesQuery(item.city, queryValue) ||
      item.tags.some((tag) => includesQuery(tag, queryValue))

    return categoryMatch && cityMatch && featuredMatch && queryMatch
  })
}

function applySupplierFilters(items, filters = {}) {
  const category = filters.category ?? 'All'
  const city = filters.city ?? 'All'
  const queryValue = normalizeText(filters.query)
  const featuredOnly = filters.featuredOnly ?? false

  return items.filter((item) => {
    const categoryMatch = category === 'All' || item.category === category
    const cityMatch = city === 'All' || item.city === city
    const featuredMatch = !featuredOnly || item.isFeatured
    const queryMatch =
      includesQuery(item.name, queryValue) ||
      includesQuery(item.category, queryValue) ||
      includesQuery(item.city, queryValue) ||
      includesQuery(item.tag, queryValue) ||
      (item.specializations ?? []).some((specialization) => includesQuery(specialization, queryValue))

    return categoryMatch && cityMatch && featuredMatch && queryMatch
  })
}

function applyOrganizerFilters(items, filters = {}) {
  const city = filters.city ?? 'All'
  const specialty = filters.specialty ?? 'All'
  const queryValue = normalizeText(filters.query)
  const featuredOnly = filters.featuredOnly ?? false

  return items.filter((item) => {
    const cityMatch = city === 'All' || item.city === city
    const specialtyMatch = specialty === 'All' || item.specialties.includes(specialty)
    const featuredMatch = !featuredOnly || item.isFeatured
    const queryMatch =
      includesQuery(item.name, queryValue) ||
      includesQuery(item.city, queryValue) ||
      item.specialties.some((value) => includesQuery(value, queryValue))

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

function maybeLimit(items, limitValue) {
  if (!limitValue || limitValue < 1) return items
  return items.slice(0, limitValue)
}

function normalizeStatus(status, fallback = DEFAULT_PUBLIC_EVENT_STATUS) {
  const normalized = String(status ?? '').trim().toLowerCase()
  if (PUBLIC_EVENT_STATUSES.includes(normalized)) return normalized
  return fallback
}

function normalizeFeatureStatus(input, isFeatured = false) {
  const normalized = String(input ?? '').trim().toLowerCase()
  if (['none', 'pending', 'approved', 'rejected'].includes(normalized)) return normalized
  return isFeatured ? 'approved' : DEFAULT_FEATURE_STATUS
}

function toISODate(value) {
  if (!value) return DEFAULT_PUBLIC_EVENT_DATE
  const asString = String(value).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(asString)) return asString
  const parsed = new Date(asString)
  if (Number.isNaN(parsed.getTime())) return DEFAULT_PUBLIC_EVENT_DATE
  return parsed.toISOString().slice(0, 10)
}

function clampPercent(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return 0
  return Math.max(0, Math.min(Math.round(numeric), 100))
}

function normalizeNumber(value, fallback = 0) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return fallback
  return numeric
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return []
  return tags.map((tag) => String(tag ?? '').trim()).filter(Boolean)
}

function inferStatusFromDate(dateValue) {
  const parsed = new Date(`${dateValue}T23:59:59`)
  if (Number.isNaN(parsed.getTime())) return DEFAULT_PUBLIC_EVENT_STATUS
  return parsed.getTime() < Date.now() ? 'past' : 'upcoming'
}

function normalizePublicEvent(rawEvent = {}, overrides = {}) {
  const nowIso = new Date().toISOString()
  const source = { ...rawEvent, ...overrides }
  const dateValue = toISODate(source.date)
  const statusFallback = inferStatusFromDate(dateValue)
  const status = normalizeStatus(source.status, statusFallback)
  const isFeatured = Boolean(source.isFeatured)
  const featureStatus = normalizeFeatureStatus(source.featureStatus, isFeatured)
  const featuredRankRaw = source.featuredRank
  const featuredRank = Number.isInteger(featuredRankRaw)
    ? featuredRankRaw
    : (Number.isFinite(Number(featuredRankRaw)) ? Math.round(Number(featuredRankRaw)) : null)

  return {
    id: String(source.id ?? '').trim(),
    ownerUid: source.ownerUid ? String(source.ownerUid) : null,
    organizerId: source.organizerId ? String(source.organizerId) : (source.ownerUid ? String(source.ownerUid) : null),
    title: String(source.title ?? '').trim(),
    date: dateValue,
    city: String(source.city ?? '').trim(),
    venue: String(source.venue ?? '').trim(),
    category: String(source.category ?? DEFAULT_PUBLIC_EVENT_CATEGORY).trim() || DEFAULT_PUBLIC_EVENT_CATEGORY,
    pricePhp: Math.max(0, Math.round(normalizeNumber(source.pricePhp, 0))),
    imageUrl: source.imageUrl ? String(source.imageUrl) : '',
    startTime: String(source.startTime ?? DEFAULT_PUBLIC_EVENT_START_TIME).trim() || DEFAULT_PUBLIC_EVENT_START_TIME,
    soldPercent: clampPercent(source.soldPercent),
    tags: normalizeTags(source.tags),
    status,
    isPublic: Boolean(source.isPublic),
    isFeatured: isFeatured && featureStatus === 'approved',
    featureStatus,
    featuredRank: featureStatus === 'approved' ? featuredRank : null,
    createdAt: source.createdAt ? String(source.createdAt) : nowIso,
    updatedAt: source.updatedAt ? String(source.updatedAt) : nowIso,
  }
}

function normalizeSeedEvent(event) {
  return normalizePublicEvent(event, {
    ownerUid: event.ownerUid ?? null,
    organizerId: event.organizerId ?? null,
    status: event.status ?? inferStatusFromDate(event.date),
    isPublic: true,
    isFeatured: Boolean(event.isFeatured),
    featureStatus: event.isFeatured ? 'approved' : 'none',
    featuredRank: Number.isInteger(event.featuredRank) ? event.featuredRank : null,
  })
}

function getSeedPublicEvents() {
  return seedEvents.map(normalizeSeedEvent)
}

function readLocalPublicEventStore() {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(PUBLIC_MARKETPLACE_EVENTS_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    return parsed.map((event) => normalizePublicEvent(event)).filter((event) => event.id)
  } catch {
    return []
  }
}

function writeLocalPublicEventStore(eventsInput) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(PUBLIC_MARKETPLACE_EVENTS_STORAGE_KEY, JSON.stringify(eventsInput))
}

function getMergedLocalPublicEvents() {
  const merged = new Map()
  for (const event of getSeedPublicEvents()) {
    merged.set(event.id, event)
  }
  for (const event of readLocalPublicEventStore()) {
    merged.set(event.id, event)
  }
  return [...merged.values()]
}

function upsertLocalPublicEvent(eventInput) {
  const normalized = normalizePublicEvent(eventInput)
  if (!normalized.id) throw new Error('Public event id is required.')
  const current = readLocalPublicEventStore()
  const next = current.filter((event) => event.id !== normalized.id)
  next.push(normalized)
  writeLocalPublicEventStore(next)
  return normalized
}

function buildStatusFilter(filters = {}) {
  if (Array.isArray(filters.statuses) && filters.statuses.length > 0) {
    return filters.statuses.map((value) => normalizeStatus(value)).filter(Boolean)
  }
  const singleStatus = String(filters.status ?? '').trim()
  if (singleStatus && singleStatus.toLowerCase() !== 'all') {
    return [normalizeStatus(singleStatus)]
  }
  if (filters.includePast) return ['upcoming', 'live', 'past']
  return ['upcoming', 'live']
}

function applyStatusFilters(items, statuses) {
  if (!Array.isArray(statuses) || statuses.length === 0) return items
  const allowed = new Set(statuses)
  return items.filter((item) => allowed.has(item.status))
}

function sortFeaturedEvents(items) {
  return [...items].sort((left, right) => {
    const leftRank = Number.isInteger(left.featuredRank) ? left.featuredRank : Number.MAX_SAFE_INTEGER
    const rightRank = Number.isInteger(right.featuredRank) ? right.featuredRank : Number.MAX_SAFE_INTEGER
    if (leftRank !== rightRank) return leftRank - rightRank
    return compareByDateAscending(left, right)
  })
}

function eventDocRef(eventId) {
  return doc(db, MARKETPLACE_EVENTS_COLLECTION, eventId)
}

function eventsCollectionRef() {
  return collection(db, MARKETPLACE_EVENTS_COLLECTION)
}

async function listPublicEventsFromFirestore(filters = {}) {
  const statuses = buildStatusFilter(filters).slice(0, 10)
  const clauses = [where('isPublic', '==', true)]
  if (statuses.length === 1) {
    clauses.push(where('status', '==', statuses[0]))
  } else if (statuses.length > 1) {
    clauses.push(where('status', 'in', statuses))
  }
  clauses.push(orderBy('date', 'asc'))
  const sourceQuery = query(eventsCollectionRef(), ...clauses)
  const snapshot = await getDocs(sourceQuery)
  return snapshot.docs.map((entry) => normalizePublicEvent({ id: entry.id, ...entry.data() })).filter((event) => event.id)
}

async function listFeaturedEventsFromFirestore(limitValue) {
  const clauses = [
    where('isPublic', '==', true),
    where('isFeatured', '==', true),
    where('featureStatus', '==', 'approved'),
    orderBy('featuredRank', 'asc'),
    orderBy('date', 'asc'),
  ]
  if (limitValue && limitValue > 0) clauses.push(limitConstraint(limitValue))
  const sourceQuery = query(eventsCollectionRef(), ...clauses)
  const snapshot = await getDocs(sourceQuery)
  return snapshot.docs.map((entry) => normalizePublicEvent({ id: entry.id, ...entry.data() })).filter((event) => event.id)
}

function currentOwnerUid(options = {}) {
  return String(options.ownerUid ?? auth?.currentUser?.uid ?? LOCAL_PUBLIC_OWNER_UID)
}

export async function upsertPublicMarketplaceEvent(payload = {}, options = {}) {
  const nowIso = new Date().toISOString()
  const normalized = normalizePublicEvent(payload, {
    ownerUid: payload.ownerUid ?? currentOwnerUid(options),
    createdAt: payload.createdAt ?? nowIso,
    updatedAt: nowIso,
  })
  if (!normalized.id) {
    throw new Error('Public marketplace event id is required.')
  }

  const canUseFirestore = firebaseEnabled && db && options.forceLocal !== true
  if (canUseFirestore) {
    await setDoc(eventDocRef(normalized.id), normalized, { merge: true })
  }

  if (!canUseFirestore || options.syncLocalFallback) {
    upsertLocalPublicEvent(normalized)
  }

  return normalized
}

export async function patchPublicMarketplaceEvent(eventId, patch = {}, options = {}) {
  const id = String(eventId ?? '').trim()
  if (!id) throw new Error('Public marketplace event id is required.')
  const nowIso = new Date().toISOString()

  const canUseFirestore = firebaseEnabled && db && options.forceLocal !== true
  if (canUseFirestore) {
    const ref = eventDocRef(id)
    const snapshot = await getDoc(ref)
    const baseEvent = snapshot.exists()
      ? normalizePublicEvent({ id, ...snapshot.data() })
      : normalizePublicEvent({
        id,
        ownerUid: currentOwnerUid(options),
        title: '',
        date: DEFAULT_PUBLIC_EVENT_DATE,
        city: '',
        venue: '',
        isPublic: false,
        createdAt: nowIso,
        updatedAt: nowIso,
      })
    const next = normalizePublicEvent({ ...baseEvent, ...patch }, { id, updatedAt: nowIso })
    await setDoc(ref, next, { merge: true })
    if (options.syncLocalFallback) upsertLocalPublicEvent(next)
    return next
  }

  const local = getMergedLocalPublicEvents()
  const baseEvent = local.find((event) => event.id === id) ?? normalizePublicEvent({
    id,
    ownerUid: currentOwnerUid(options),
    title: '',
    date: DEFAULT_PUBLIC_EVENT_DATE,
    city: '',
    venue: '',
    isPublic: false,
  })
  const next = normalizePublicEvent({ ...baseEvent, ...patch }, { id, updatedAt: nowIso })
  upsertLocalPublicEvent(next)
  return next
}

export async function requestPublicEventFeatured(eventId, options = {}) {
  return patchPublicMarketplaceEvent(
    eventId,
    {
      featureStatus: 'pending',
      isFeatured: false,
      featuredRank: null,
    },
    options,
  )
}

export async function approvePublicEventFeatured(eventId, payload = {}, options = {}) {
  const featuredRank = Number.isFinite(Number(payload.featuredRank))
    ? Math.max(0, Math.round(Number(payload.featuredRank)))
    : null
  return patchPublicMarketplaceEvent(
    eventId,
    {
      featureStatus: 'approved',
      isFeatured: true,
      featuredRank,
    },
    options,
  )
}

export async function rejectPublicEventFeatured(eventId, options = {}) {
  return patchPublicMarketplaceEvent(
    eventId,
    {
      featureStatus: 'rejected',
      isFeatured: false,
      featuredRank: null,
    },
    options,
  )
}

export async function listPublicEvents(filters = {}, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const statuses = buildStatusFilter(filters)

  let source
  if (firebaseEnabled && db && options.forceLocal !== true) {
    try {
      source = await listPublicEventsFromFirestore(filters)
    } catch {
      source = getMergedLocalPublicEvents()
    }
  } else {
    source = getMergedLocalPublicEvents()
  }

  const statusFiltered = applyStatusFilters(source, statuses)
  const filtered = applyEventFilters(statusFiltered, filters)
  const sorted = sortEvents(filtered, filters.sortBy)
  return maybeLimit(sorted, filters.limit)
}

export async function listFeaturedPublicEvents(filters = {}, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const limitValue = filters.limit ?? filters.featuredLimit ?? 3
  const statuses = buildStatusFilter({ ...filters, statuses: filters.statuses ?? ['upcoming', 'live'] })

  let source
  if (firebaseEnabled && db && options.forceLocal !== true) {
    try {
      source = await listFeaturedEventsFromFirestore(limitValue)
    } catch {
      source = getMergedLocalPublicEvents()
    }
  } else {
    source = getMergedLocalPublicEvents()
  }

  const featured = source.filter((event) => event.isPublic && event.isFeatured && event.featureStatus === 'approved')
  const statusFiltered = applyStatusFilters(featured, statuses)
  const filtered = applyEventFilters(statusFiltered, filters)
  const sorted = sortFeaturedEvents(filtered)
  return maybeLimit(sorted, limitValue)
}

export async function getPublicEventById(id, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const eventId = String(id ?? '').trim()
  if (!eventId) return null

  if (firebaseEnabled && db && options.forceLocal !== true) {
    try {
      const snapshot = await getDoc(eventDocRef(eventId))
      if (snapshot.exists()) {
        const normalized = normalizePublicEvent({ id: snapshot.id, ...snapshot.data() })
        if (options.includeUnpublished || normalized.isPublic) return normalized
        return null
      }
      return null
    } catch {
      // Continue to local fallback below.
    }
  }

  const items = getMergedLocalPublicEvents()
  const found = items.find((event) => event.id === eventId) ?? null
  if (!found) return null
  if (options.includeUnpublished || found.isPublic) return found
  return null
}

export async function listEvents(filters = {}, options = {}) {
  return listPublicEvents(filters, options)
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

  const upcomingEvents = await listPublicEvents(
    { ...filters, limit: filters.eventsLimit ?? 6, sortBy: filters.sortBy ?? 'dateAsc', statuses: ['upcoming', 'live'] },
    { simulateLatency: false, forceLocal: options.forceLocal },
  )
  const featuredEvents = await listFeaturedPublicEvents(
    { ...filters, limit: filters.featuredEventsLimit ?? 3, statuses: ['upcoming', 'live'] },
    { simulateLatency: false, forceLocal: options.forceLocal },
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
    featuredEvents,
    upcomingEvents,
    featuredSuppliers,
    topOrganizers,
  }
}

export async function getEventById(id, options = {}) {
  return getPublicEventById(id, options)
}

export async function getSupplierById(id, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  return suppliers.find((item) => item.id === id) ?? null
}

export async function getOrganizerById(id, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  return organizers.find((item) => item.id === id) ?? null
}

export async function searchMarketplace(queryValue, filters = {}, options = {}) {
  const normalizedQuery = normalizeText(queryValue)
  const [matchingEvents, matchingSuppliers, matchingOrganizers] = await Promise.all([
    listPublicEvents(
      { ...filters, query: normalizedQuery, limit: filters.eventsLimit ?? 5, statuses: filters.statuses ?? ['upcoming', 'live'] },
      options,
    ),
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
  const sourceEvents = getMergedLocalPublicEvents()
  const eventCities = Array.from(new Set(sourceEvents.map((item) => item.city))).sort()
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
    Promise.all(eventIds.map((id) => getPublicEventById(id, options))),
    Promise.all(supplierIds.map((id) => getSupplierById(id, options))),
    Promise.all(organizerIds.map((id) => getOrganizerById(id, options))),
  ])

  return {
    events: savedEvents.filter(Boolean),
    suppliers: savedSuppliers.filter(Boolean),
    organizers: savedOrganizers.filter(Boolean),
  }
}
