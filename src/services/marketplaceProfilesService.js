import { organizers, suppliers } from '@/data/marketplaceData'
import { db, firebaseEnabled, storage } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'

const DEFAULT_DELAY_MS = 120
const STORAGE_KEY = 'eventpinas-marketplace-profiles'

const MAX_TEXT = 200
const MAX_BIO = 1200
const MAX_URLS = 12
const MAX_UPLOAD_SIZE_FIREBASE = 8 * 1024 * 1024
const MAX_UPLOAD_SIZE_LOCAL = 700 * 1024

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function buildUploadFilename(name = 'image') {
  const base = String(name).replace(/[^a-zA-Z0-9.-]/g, '-').slice(-80) || 'image'
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${base}`
}

function validateImageUpload(file, maxSizeBytes) {
  if (!file) throw new Error('Please choose an image file to upload.')
  if (!String(file.type ?? '').startsWith('image/')) {
    throw new Error('Only image files are allowed.')
  }
  if (Number(file.size ?? 0) > maxSizeBytes) {
    const mb = Math.round((maxSizeBytes / 1024 / 1024) * 10) / 10
    throw new Error(`Image is too large. Please upload an image smaller than ${mb}MB.`)
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Unable to read the selected image file.'))
    reader.readAsDataURL(file)
  })
}

function normalizeText(value, maxLength = MAX_TEXT) {
  return String(value ?? '').trim().slice(0, maxLength)
}

function normalizeNumber(value, fallback = 0, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return fallback
  return Math.min(max, Math.max(min, numeric))
}

function normalizeArray(values, maxItems = MAX_URLS, maxLength = MAX_TEXT) {
  if (!Array.isArray(values)) return []
  const unique = []

  for (const value of values) {
    const normalized = normalizeText(value, maxLength)
    if (!normalized) continue
    if (!unique.includes(normalized)) unique.push(normalized)
    if (unique.length >= maxItems) break
  }

  return unique
}

function isValidHttpUrl(value) {
  if (!value) return false

  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function readProfileStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { suppliers: {}, organizers: {} }
    const parsed = JSON.parse(raw)
    return {
      suppliers: parsed?.suppliers && typeof parsed.suppliers === 'object' ? parsed.suppliers : {},
      organizers: parsed?.organizers && typeof parsed.organizers === 'object' ? parsed.organizers : {},
    }
  } catch {
    return { suppliers: {}, organizers: {} }
  }
}

function writeProfileStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

function getSeedSupplier(id) {
  return suppliers.find((item) => item.id === id) ?? null
}

function getSeedOrganizer(id) {
  return organizers.find((item) => item.id === id) ?? null
}

function withSupplierDefaults(source = {}) {
  const businessInfo = source.businessInfo ?? {}

  return {
    id: source.id,
    ownerUid: source.ownerUid ?? null,
    status: source.status ?? 'active',
    updatedAt: source.updatedAt ?? null,
    name: normalizeText(source.name),
    category: normalizeText(source.category),
    city: normalizeText(source.city),
    rating: normalizeNumber(source.rating, 0, { min: 0, max: 5 }),
    reviews: normalizeNumber(source.reviews, 0, { min: 0 }),
    startingPricePhp: normalizeNumber(source.startingPricePhp, 0, { min: 0 }),
    priceRangeLabel: normalizeText(source.priceRangeLabel),
    isVerified: Boolean(source.isVerified),
    isFeatured: Boolean(source.isFeatured),
    bookingsCount: normalizeNumber(source.bookingsCount, 0, { min: 0 }),
    eventsDone: normalizeNumber(source.eventsDone, 0, { min: 0 }),
    tag: normalizeText(source.tag),
    coverageAreas: normalizeArray(source.coverageAreas, 12),
    paymentMethods: normalizeArray(source.paymentMethods, 12),
    responseTime: normalizeText(source.responseTime),
    bio: normalizeText(source.bio, MAX_BIO),
    specializations: normalizeArray(source.specializations, 12),
    portfolio: normalizeArray(source.portfolio, MAX_URLS, 400),
    imageUrl: normalizeText(source.imageUrl, 400),
    packages: Array.isArray(source.packages) ? clone(source.packages) : [],
    reviewList: Array.isArray(source.reviewList) ? clone(source.reviewList) : [],
    businessInfo: {
      businessType: normalizeText(businessInfo.businessType),
      operatingSince: normalizeText(businessInfo.operatingSince),
      contact: normalizeText(businessInfo.contact),
      email: normalizeText(businessInfo.email),
      facebook: normalizeText(businessInfo.facebook),
      dtiVerified: Boolean(businessInfo.dtiVerified),
    },
  }
}

function withOrganizerDefaults(source = {}) {
  return {
    id: source.id,
    ownerUid: source.ownerUid ?? null,
    status: source.status ?? 'active',
    updatedAt: source.updatedAt ?? null,
    name: normalizeText(source.name),
    city: normalizeText(source.city),
    specialties: normalizeArray(source.specialties, 12),
    rating: normalizeNumber(source.rating, 0, { min: 0, max: 5 }),
    reviewsCount: normalizeNumber(source.reviewsCount, 0, { min: 0 }),
    eventsHandled: normalizeNumber(source.eventsHandled, 0, { min: 0 }),
    yearsActive: normalizeNumber(source.yearsActive, 0, { min: 0, max: 100 }),
    priceRangeLabel: normalizeText(source.priceRangeLabel),
    badge: normalizeText(source.badge),
    isVerified: Boolean(source.isVerified),
    isFeatured: Boolean(source.isFeatured),
    coverageAreas: normalizeArray(source.coverageAreas, 12),
    services: normalizeArray(source.services, 20),
    bio: normalizeText(source.bio, MAX_BIO),
    pricingPackages: Array.isArray(source.pricingPackages) ? clone(source.pricingPackages) : [],
    pastEvents: Array.isArray(source.pastEvents) ? clone(source.pastEvents) : [],
    reviewList: Array.isArray(source.reviewList) ? clone(source.reviewList) : [],
    avatarUrl: normalizeText(source.avatarUrl, 400),
  }
}

function computeCompleteness(profile, type) {
  const missing = []
  if (!profile.name) missing.push('name')
  if (!profile.city) missing.push('city')

  if (type === 'supplier') {
    if (!profile.category) missing.push('category')
    if ((profile.specializations ?? []).length === 0) missing.push('specializations')
    if (!profile.businessInfo?.contact && !profile.businessInfo?.email && !profile.businessInfo?.facebook) {
      missing.push('contact')
    }
  }

  if (type === 'organizer') {
    if ((profile.specialties ?? []).length === 0) missing.push('specialties')
    if ((profile.services ?? []).length === 0) missing.push('services')
  }

  const percent = Math.max(0, Math.round(((Math.max(1, 5 - missing.length)) / 5) * 100))

  return {
    percent,
    missingRequired: missing,
    isComplete: missing.length === 0,
  }
}

function withComputedFields(profile, type) {
  return {
    ...profile,
    completeness: computeCompleteness(profile, type),
  }
}

function buildSupplierValidation(profile) {
  const errors = []
  const fieldErrors = {}

  if (!profile.name) {
    errors.push('Supplier name is required.')
    fieldErrors.name = 'Supplier name is required.'
  }
  if (!profile.city) {
    errors.push('City is required.')
    fieldErrors.city = 'City is required.'
  }
  if (!profile.category) {
    errors.push('Category is required.')
    fieldErrors.category = 'Category is required.'
  }
  if ((profile.specializations ?? []).length === 0) {
    errors.push('At least one specialization is required.')
    fieldErrors.specializations = 'Add at least one specialization.'
  }
  if (!profile.businessInfo?.contact && !profile.businessInfo?.email && !profile.businessInfo?.facebook) {
    errors.push('At least one contact channel is required (contact, email, or facebook).')
    fieldErrors.contact = 'Add at least one contact channel.'
  }

  if (profile.businessInfo?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.businessInfo.email)) {
    errors.push('Business email format is invalid.')
    fieldErrors.email = 'Invalid email format.'
  }

  const invalidPortfolio = (profile.portfolio ?? []).find((url) => !isValidHttpUrl(url))
  if (invalidPortfolio) {
    errors.push(`Portfolio URL is invalid: ${invalidPortfolio}`)
    fieldErrors.portfolio = 'All portfolio URLs must be valid http/https links.'
  }

  if (profile.imageUrl && !isValidHttpUrl(profile.imageUrl) && !profile.imageUrl.startsWith('/')) {
    errors.push('Profile image URL must be a valid http/https URL or app-relative path.')
    fieldErrors.imageUrl = 'Invalid image URL.'
  }

  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors,
  }
}

function buildOrganizerValidation(profile) {
  const errors = []
  const fieldErrors = {}

  if (!profile.name) {
    errors.push('Organizer name is required.')
    fieldErrors.name = 'Organizer name is required.'
  }
  if (!profile.city) {
    errors.push('City is required.')
    fieldErrors.city = 'City is required.'
  }
  if ((profile.specialties ?? []).length === 0) {
    errors.push('At least one specialty is required.')
    fieldErrors.specialties = 'Add at least one specialty.'
  }
  if ((profile.services ?? []).length === 0) {
    errors.push('At least one service is required.')
    fieldErrors.services = 'Add at least one service.'
  }

  if (profile.avatarUrl && !isValidHttpUrl(profile.avatarUrl) && !profile.avatarUrl.startsWith('/')) {
    errors.push('Avatar URL must be a valid http/https URL or app-relative path.')
    fieldErrors.avatarUrl = 'Invalid avatar URL.'
  }

  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors,
  }
}

function mergeProfile(seed, persisted, type) {
  const merged = {
    ...seed,
    ...persisted,
  }

  if (type === 'supplier') {
    merged.businessInfo = {
      ...(seed.businessInfo ?? {}),
      ...(persisted?.businessInfo ?? {}),
    }
  }

  return merged
}

function getProfileRef(collectionName, id) {
  return doc(db, collectionName, id)
}

async function readPersistedProfile(collectionName, id, bucket) {
  if (firebaseEnabled && db) {
    try {
      const snap = await getDoc(getProfileRef(collectionName, id))
      if (snap.exists()) return snap.data()
    } catch {
      // Fall back to local mode quietly.
    }
  }

  const local = readProfileStore()
  return local[bucket]?.[id] ?? null
}

async function writePersistedProfile(collectionName, bucket, id, payload) {
  if (firebaseEnabled && db) {
    await setDoc(getProfileRef(collectionName, id), payload, { merge: true })
    return
  }

  const local = readProfileStore()
  local[bucket] = {
    ...(local[bucket] ?? {}),
    [id]: payload,
  }
  writeProfileStore(local)
}

async function ensureUploadActorAuthorized(profileType, profileId, actorUid) {
  if (!actorUid) throw new Error('Please sign in before uploading images.')

  const current = profileType === 'supplier'
    ? await getSupplierProfileById(profileId, { simulateLatency: false })
    : await getOrganizerProfileById(profileId, { simulateLatency: false })

  if (!current) {
    throw new Error(`${profileType === 'supplier' ? 'Supplier' : 'Organizer'} profile not found.`)
  }

  if (current.ownerUid && current.ownerUid !== actorUid) {
    throw new Error('You are not allowed to upload images for this profile.')
  }
}

export async function uploadMarketplaceProfileImage({
  profileType,
  profileId,
  actorUid,
  file,
  purpose = 'profile',
}) {
  if (profileType !== 'supplier' && profileType !== 'organizer') {
    throw new Error('Unsupported profile type for upload.')
  }

  await ensureUploadActorAuthorized(profileType, profileId, actorUid)

  if (firebaseEnabled && storage) {
    validateImageUpload(file, MAX_UPLOAD_SIZE_FIREBASE)
    const filename = buildUploadFilename(file?.name)
    const objectPath = `marketplaceProfiles/${profileType}/${profileId}/${actorUid}/${purpose}/${filename}`
    const targetRef = storageRef(storage, objectPath)
    const uploaded = await uploadBytes(targetRef, file, {
      contentType: file.type,
      cacheControl: 'public,max-age=3600',
    })
    return getDownloadURL(uploaded.ref)
  }

  validateImageUpload(file, MAX_UPLOAD_SIZE_LOCAL)
  return readFileAsDataUrl(file)
}

export function canEditProfile({
  viewerUid,
  viewerRole,
  profileType,
  ownerUid,
  profileId,
  viewerMarketplaceProfile,
}) {
  if (!viewerUid) return false

  const expectedRole = profileType === 'supplier' ? 'supplier' : 'organizer'
  if (viewerRole !== expectedRole) return false

  if (ownerUid) return ownerUid === viewerUid

  return viewerMarketplaceProfile?.type === profileType && viewerMarketplaceProfile?.profileId === profileId
}

export function validateSupplierProfile(profile) {
  const normalized = withSupplierDefaults(profile)
  return buildSupplierValidation(normalized)
}

export function validateOrganizerProfile(profile) {
  const normalized = withOrganizerDefaults(profile)
  return buildOrganizerValidation(normalized)
}

export async function getSupplierProfileById(id, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)

  const seed = getSeedSupplier(id)
  if (!seed) return null

  const persisted = await readPersistedProfile('supplierProfiles', id, 'suppliers')
  const merged = withSupplierDefaults(mergeProfile(seed, persisted, 'supplier'))
  return withComputedFields(merged, 'supplier')
}

export async function getOrganizerProfileById(id, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)

  const seed = getSeedOrganizer(id)
  if (!seed) return null

  const persisted = await readPersistedProfile('organizerProfiles', id, 'organizers')
  const merged = withOrganizerDefaults(mergeProfile(seed, persisted, 'organizer'))
  return withComputedFields(merged, 'organizer')
}

export async function updateSupplierProfile(id, payload, actorUid, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  if (!actorUid) throw new Error('Please sign in to update this profile.')

  const current = await getSupplierProfileById(id, { simulateLatency: false })
  if (!current) throw new Error('Supplier profile not found.')
  if (current.ownerUid && current.ownerUid !== actorUid) {
    throw new Error('You are not allowed to update this supplier profile.')
  }

  const next = withSupplierDefaults({
    ...current,
    ...clone(payload ?? {}),
    ownerUid: actorUid,
    updatedAt: new Date().toISOString(),
    status: 'active',
  })

  const validation = buildSupplierValidation(next)
  if (!validation.isValid) {
    throw new Error(validation.errors.join('\n'))
  }

  await writePersistedProfile('supplierProfiles', 'suppliers', id, next)
  return withComputedFields(next, 'supplier')
}

export async function updateOrganizerProfile(id, payload, actorUid, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  if (!actorUid) throw new Error('Please sign in to update this profile.')

  const current = await getOrganizerProfileById(id, { simulateLatency: false })
  if (!current) throw new Error('Organizer profile not found.')
  if (current.ownerUid && current.ownerUid !== actorUid) {
    throw new Error('You are not allowed to update this organizer profile.')
  }

  const next = withOrganizerDefaults({
    ...current,
    ...clone(payload ?? {}),
    ownerUid: actorUid,
    updatedAt: new Date().toISOString(),
    status: 'active',
  })

  const validation = buildOrganizerValidation(next)
  if (!validation.isValid) {
    throw new Error(validation.errors.join('\n'))
  }

  await writePersistedProfile('organizerProfiles', 'organizers', id, next)
  return withComputedFields(next, 'organizer')
}
