import fs from 'node:fs'
import path from 'node:path'

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

function readJsonIfExists(filePath) {
  const content = readTextIfExists(filePath)
  if (!content) return null
  try {
    return JSON.parse(content)
  } catch {
    return null
  }
}

function existsFile(filePath) {
  try {
    return fs.statSync(filePath).isFile()
  } catch {
    return false
  }
}

function mark(ok, text) {
  const icon = ok ? '[OK]' : '[FAIL]'
  console.log(`${icon} ${text}`)
}

function warn(text) {
  console.log(`[WARN] ${text}`)
}

function main() {
  const root = process.cwd()
  let hasFailure = false

  console.log('Firebase preflight checks for EventPinas')
  console.log(`Workspace: ${root}`)
  console.log('')

  const firebasercPath = path.join(root, '.firebaserc')
  const firebaserc = readJsonIfExists(firebasercPath)
  const defaultProject = firebaserc?.projects?.default ?? null
  const projectOk = defaultProject === 'eventpinas'
  mark(projectOk, `.firebaserc default project is "${defaultProject ?? 'missing'}" (expected "eventpinas")`)
  hasFailure ||= !projectOk

  const firebaseJsonPath = path.join(root, 'firebase.json')
  const firebaseJson = readJsonIfExists(firebaseJsonPath)
  const hasFirestoreRules = firebaseJson?.firestore?.rules === 'firestore.rules'
  const hasFirestoreIndexes = firebaseJson?.firestore?.indexes === 'firestore.indexes.json'
  const hasStorageRules = firebaseJson?.storage?.rules === 'storage.rules'
  mark(hasFirestoreRules, 'firebase.json firestore.rules points to "firestore.rules"')
  mark(hasFirestoreIndexes, 'firebase.json firestore.indexes points to "firestore.indexes.json"')
  mark(hasStorageRules, 'firebase.json storage.rules points to "storage.rules"')
  hasFailure ||= !hasFirestoreRules || !hasFirestoreIndexes || !hasStorageRules

  const requiredFiles = [
    'firestore.rules',
    'firestore.indexes.json',
    'storage.rules',
  ]
  for (const relativePath of requiredFiles) {
    const fullPath = path.join(root, relativePath)
    const ok = existsFile(fullPath)
    mark(ok, `File exists: ${relativePath}`)
    hasFailure ||= !ok
  }

  const envLocalPath = path.join(root, '.env.local')
  const envLocalText = readTextIfExists(envLocalPath)
  const hasEnvLocal = envLocalText != null
  mark(hasEnvLocal, '.env.local exists')
  if (!hasEnvLocal) {
    hasFailure = true
    console.log('       Create one with: Copy-Item .env.example .env.local')
  } else {
    const envMap = parseSimpleEnv(envLocalText)
    for (const key of REQUIRED_ENV_KEYS) {
      const value = envMap.get(key)
      const ok = typeof value === 'string' && value.length > 0
      mark(ok, `.env.local has ${key}`)
      hasFailure ||= !ok
    }

    const projectId = envMap.get('VITE_FIREBASE_PROJECT_ID')
    const projectMatches = projectId === 'eventpinas'
    mark(projectMatches, `VITE_FIREBASE_PROJECT_ID is "${projectId ?? 'missing'}" (expected "eventpinas")`)
    hasFailure ||= !projectMatches

    const appCheckSiteKey = envMap.get('VITE_FIREBASE_APPCHECK_SITE_KEY')
    if (!appCheckSiteKey) {
      warn('.env.local missing VITE_FIREBASE_APPCHECK_SITE_KEY (App Check will stay disabled in app runtime).')
    } else {
      mark(true, '.env.local has VITE_FIREBASE_APPCHECK_SITE_KEY')
    }
  }

  console.log('')
  if (hasFailure) {
    console.error('Preflight failed. Fix the failed checks before deploying Firebase resources.')
    process.exitCode = 1
    return
  }

  console.log('Preflight passed. Ready for Firebase deploy commands.')
}

main()
