import fs from 'node:fs'
import path from 'node:path'
import { initializeApp } from 'firebase/app'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore'

const REQUIRED_ENV_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
]

function readTextIfExists(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch {
    return null
  }
}

function parseSimpleEnv(text) {
  const map = new Map()
  if (!text) return map

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const equalsIndex = line.indexOf('=')
    if (equalsIndex < 0) continue
    const key = line.slice(0, equalsIndex).trim()
    const value = line.slice(equalsIndex + 1).trim()
    if (key) map.set(key, value)
  }
  return map
}

function readEnvMapFromWorkspace() {
  const root = process.cwd()
  const envPath = path.join(root, '.env.local')
  const envText = readTextIfExists(envPath)
  return parseSimpleEnv(envText)
}

function getEnvValue(key, envFileMap) {
  const fromProcess = process.env[key]
  if (typeof fromProcess === 'string' && fromProcess.length > 0) return fromProcess
  return envFileMap.get(key) ?? ''
}

function buildFirebaseConfig() {
  const envMap = readEnvMapFromWorkspace()
  const missing = []
  const config = {}

  for (const key of REQUIRED_ENV_KEYS) {
    const value = getEnvValue(key, envMap)
    if (!value) missing.push(key)
    config[key] = value
  }

  if (missing.length > 0) {
    throw new Error(`Missing Firebase env keys for smoke test: ${missing.join(', ')}`)
  }

  return {
    apiKey: config.VITE_FIREBASE_API_KEY,
    authDomain: config.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: config.VITE_FIREBASE_PROJECT_ID,
    storageBucket: config.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: config.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: config.VITE_FIREBASE_APP_ID,
  }
}

function isPermissionDenied(error) {
  const code = String(error?.code ?? '').toLowerCase()
  const message = String(error?.message ?? '').toLowerCase()
  return code.includes('permission-denied') || message.includes('permission_denied')
}

function isIndexBuilding(error) {
  const code = String(error?.code ?? '').toLowerCase()
  const message = String(error?.message ?? '').toLowerCase()
  return (
    code.includes('failed-precondition') &&
    message.includes('requires an index') &&
    message.includes('currently building')
  )
}

function ok(text) {
  console.log(`[OK] ${text}`)
}

function fail(text) {
  console.error(`[FAIL] ${text}`)
}

function pending(text) {
  console.log(`[PENDING] ${text}`)
}

function info(text) {
  console.log(`[INFO] ${text}`)
}

async function assertPermissionDenied(label, runner) {
  try {
    await runner()
    fail(`${label} unexpectedly succeeded (expected permission denied).`)
    return false
  } catch (error) {
    if (isPermissionDenied(error)) {
      ok(`${label} correctly denied by Firestore rules.`)
      return true
    }
    fail(`${label} failed with unexpected error: ${error?.message ?? String(error)}`)
    return false
  }
}

async function run() {
  console.log('Firebase post-deploy smoke test')
  console.log(`Workspace: ${process.cwd()}`)
  console.log('')

  let config
  try {
    config = buildFirebaseConfig()
  } catch (error) {
    fail(error.message)
    process.exitCode = 1
    return
  }

  const app = initializeApp(config)
  const db = getFirestore(app)
  let failed = false
  let hasPending = false

  try {
    const publicEventsQuery = query(
      collection(db, 'marketplaceEvents'),
      where('isPublic', '==', true),
      where('status', 'in', ['upcoming', 'live', 'past']),
      orderBy('date', 'asc'),
      limit(5),
    )
    const publicEventsSnap = await getDocs(publicEventsQuery)
    ok(`Public marketplace query succeeded (${publicEventsSnap.size} docs returned).`)
  } catch (error) {
    if (isIndexBuilding(error)) {
      hasPending = true
      pending(`Public marketplace query waiting for index build: ${error?.message ?? String(error)}`)
    } else {
      failed = true
      fail(`Public marketplace query failed: ${error?.message ?? String(error)}`)
    }
  }

  try {
    const featuredQuery = query(
      collection(db, 'marketplaceEvents'),
      where('isPublic', '==', true),
      where('isFeatured', '==', true),
      where('featureStatus', '==', 'approved'),
      orderBy('featuredRank', 'asc'),
      orderBy('date', 'asc'),
      limit(3),
    )
    const featuredSnap = await getDocs(featuredQuery)
    ok(`Featured marketplace query succeeded (${featuredSnap.size} docs returned).`)
  } catch (error) {
    if (isIndexBuilding(error)) {
      hasPending = true
      pending(`Featured marketplace query waiting for index build: ${error?.message ?? String(error)}`)
    } else {
      failed = true
      fail(`Featured marketplace query failed: ${error?.message ?? String(error)}`)
    }
  }

  try {
    const suppliersSnap = await getDocs(query(collection(db, 'supplierProfiles'), limit(1)))
    ok(`Public supplier profiles query succeeded (${suppliersSnap.size} docs returned).`)
  } catch (error) {
    failed = true
    fail(`Supplier profiles query failed: ${error?.message ?? String(error)}`)
  }

  try {
    const organizersSnap = await getDocs(query(collection(db, 'organizerProfiles'), limit(1)))
    ok(`Public organizer profiles query succeeded (${organizersSnap.size} docs returned).`)
  } catch (error) {
    failed = true
    fail(`Organizer profiles query failed: ${error?.message ?? String(error)}`)
  }

  const deniedUsers = await assertPermissionDenied(
    'Unauthenticated read on users/{uid}',
    () => getDoc(doc(db, 'users', 'smoke-user')),
  )
  if (!deniedUsers) failed = true

  const deniedManage = await assertPermissionDenied(
    'Unauthenticated read on organizers/{uid}/manage/meta',
    () => getDoc(doc(db, 'organizers', 'smoke-owner', 'manage', 'meta')),
  )
  if (!deniedManage) failed = true

  console.log('')
  info('This smoke test is read-only and does not perform writes.')
  info('Organizer/admin authenticated write flows should still be validated in UI after deploy.')

  if (failed) {
    console.error('')
    console.error('Smoke test failed.')
    process.exitCode = 1
    return
  }

  console.log('')
  if (hasPending) {
    console.log('Smoke test pending: required indexes are still building. Re-run after they are enabled.')
    return
  }

  console.log('Smoke test passed.')
}

run().catch((error) => {
  fail(`Unhandled smoke test error: ${error?.message ?? String(error)}`)
  process.exitCode = 1
})
