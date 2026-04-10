import { initializeApp } from 'firebase/app'
import { getFirestore, writeBatch, doc } from 'firebase/firestore'
import { events as seedEvents } from '../src/data/marketplaceData.js'

const requiredKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
]

function toIsoDate(value) {
  const text = String(value ?? '').trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text
  const parsed = new Date(text)
  if (Number.isNaN(parsed.getTime())) return '2099-12-31'
  return parsed.toISOString().slice(0, 10)
}

function inferStatus(dateValue) {
  const parsed = new Date(`${dateValue}T23:59:59`)
  if (Number.isNaN(parsed.getTime())) return 'upcoming'
  return parsed.getTime() < Date.now() ? 'past' : 'upcoming'
}

function normalizeSeedEvent(seed) {
  const nowIso = new Date().toISOString()
  const date = toIsoDate(seed.date)
  const isFeatured = Boolean(seed.isFeatured)
  return {
    id: String(seed.id ?? '').trim(),
    ownerUid: seed.ownerUid ?? null,
    organizerId: seed.organizerId ?? null,
    title: String(seed.title ?? '').trim(),
    date,
    city: String(seed.city ?? '').trim(),
    venue: String(seed.venue ?? '').trim(),
    category: String(seed.category ?? 'Community').trim() || 'Community',
    pricePhp: Math.max(0, Math.round(Number(seed.pricePhp ?? 0) || 0)),
    imageUrl: seed.imageUrl ? String(seed.imageUrl) : '',
    startTime: String(seed.startTime ?? '09:00').trim() || '09:00',
    soldPercent: Math.max(0, Math.min(100, Math.round(Number(seed.soldPercent ?? 0) || 0))),
    tags: Array.isArray(seed.tags) ? seed.tags.map((tag) => String(tag ?? '').trim()).filter(Boolean) : [],
    status: seed.status ?? inferStatus(date),
    isPublic: true,
    isFeatured,
    featureStatus: isFeatured ? 'approved' : 'none',
    featuredRank: Number.isInteger(seed.featuredRank) ? seed.featuredRank : null,
    createdAt: nowIso,
    updatedAt: nowIso,
  }
}

function getFirebaseConfigFromEnv() {
  const missing = requiredKeys.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`Missing Firebase env keys: ${missing.join(', ')}`)
  }
  return {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
  }
}

async function run() {
  const firebaseConfig = getFirebaseConfigFromEnv()
  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)
  const normalized = seedEvents.map(normalizeSeedEvent).filter((event) => event.id)

  if (normalized.length === 0) {
    console.log('No seed events to backfill.')
    return
  }

  const chunkSize = 400
  let cursor = 0
  while (cursor < normalized.length) {
    const chunk = normalized.slice(cursor, cursor + chunkSize)
    const batch = writeBatch(db)
    for (const event of chunk) {
      batch.set(doc(db, 'marketplaceEvents', event.id), event, { merge: true })
    }
    await batch.commit()
    cursor += chunk.length
  }

  console.log(`Backfilled ${normalized.length} marketplaceEvents documents.`)
}

run().catch((error) => {
  console.error('Backfill failed:', error.message)
  process.exitCode = 1
})
