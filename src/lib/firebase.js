import { initializeApp } from 'firebase/app'
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

function hasRequiredFirebaseConfig(config) {
  return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId)
}

export const firebaseEnabled = hasRequiredFirebaseConfig(firebaseConfig)

let app = null
let auth = null
let db = null
let storage = null

if (firebaseEnabled) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
  } catch (error) {
    // Keep app usable in local mode when Firebase setup is incomplete.
    console.warn('Firebase initialization failed. Falling back to local mode.', error)
  }
}

export { app, auth, db, storage }
export default app
