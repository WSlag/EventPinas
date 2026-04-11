import { initializeApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}
const appCheckSiteKey = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY
const appCheckDebugToken = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN
const forceLocalServices = import.meta.env.VITE_FORCE_LOCAL_SERVICES === 'true'
const isVitestRuntime = Boolean(import.meta.env.VITEST)

function hasRequiredFirebaseConfig(config) {
  return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId)
}

const shouldEnableFirebase = !forceLocalServices && !isVitestRuntime
export const firebaseEnabled = shouldEnableFirebase && hasRequiredFirebaseConfig(firebaseConfig)

let app = null
let auth = null
let db = null
let storage = null
let appCheck = null

if (firebaseEnabled) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)

    const canEnableAppCheck = Boolean(appCheckSiteKey && typeof window !== 'undefined')
    if (canEnableAppCheck) {
      if (appCheckDebugToken) {
        globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN = appCheckDebugToken === 'true'
          ? true
          : appCheckDebugToken
      }
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(appCheckSiteKey),
        isTokenAutoRefreshEnabled: true,
      })
      if (import.meta.env.DEV) {
        console.info(`Firebase App Check initialized (${appCheckDebugToken ? 'debug' : 'standard'} mode).`)
      }
    } else if (import.meta.env.DEV) {
      const reason = !appCheckSiteKey
        ? 'missing VITE_FIREBASE_APPCHECK_SITE_KEY'
        : 'no browser window detected'
      console.info(`Firebase App Check not initialized (${reason}).`)
    }
  } catch (error) {
    // Keep app usable in local mode when Firebase setup is incomplete.
    console.warn('Firebase initialization failed. Falling back to local mode.', error)
  }
}

export { app, auth, db, storage, appCheck }
export default app
