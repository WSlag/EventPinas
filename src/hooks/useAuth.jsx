import { useEffect, useState, createContext, useContext } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, firebaseEnabled } from '@/lib/firebase'
import { ensureMarketplaceProfile } from '@/services/marketplaceProfilesService'

const AuthContext = createContext(null)
const LOCAL_AUTH_KEY = 'eventpinas-local-auth'
const LOCAL_USERS_KEY = 'eventpinas-local-users'
const LOCAL_AUTH_FALLBACK_ENABLED = Boolean(
  import.meta.env.VITEST
  || import.meta.env.DEV
  || import.meta.env.VITE_ENABLE_LOCAL_AUTH_FALLBACK === 'true',
)

function buildMarketplaceProfile(role, uid) {
  const normalizedUid = String(uid ?? '').trim().replaceAll('/', '_')
  if (!normalizedUid) return null
  if (role === 'supplier') {
    return { type: 'supplier', profileId: `sup-${normalizedUid}`, ownerUid: normalizedUid }
  }
  if (role === 'organizer') {
    return { type: 'organizer', profileId: `org-${normalizedUid}`, ownerUid: normalizedUid }
  }
  return null
}

function readLocalJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeLocalJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function getCryptoSubtle() {
  return globalThis.crypto?.subtle ?? null
}

async function hashLocalPassword(password, salt) {
  const subtle = getCryptoSubtle()
  if (!subtle) {
    throw new Error('Secure password hashing is unavailable in this environment.')
  }
  const payload = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await subtle.digest('SHA-256', payload)
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function buildLocalPasswordRecord(password) {
  const salt = crypto.randomUUID()
  const hash = await hashLocalPassword(password, salt)
  return { passwordSalt: salt, passwordHash: hash }
}

async function verifyLocalPassword(candidate, password) {
  if (typeof candidate?.password === 'string') {
    return candidate.password === password
  }
  if (!candidate?.passwordSalt || !candidate?.passwordHash) {
    return false
  }
  const digest = await hashLocalPassword(password, candidate.passwordSalt)
  return digest === candidate.passwordHash
}

function toLocalStoredSession(localUser) {
  return {
    uid: localUser.uid,
    email: localUser.email,
    displayName: localUser.displayName,
    role: localUser.role,
    subscription: localUser.subscription ?? null,
    marketplaceProfile: localUser.marketplaceProfile ?? null,
  }
}

async function fetchProfile(uid) {
  if (!firebaseEnabled || !db) return null
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

function toLocalSession(localUser) {
  return {
    uid: localUser.uid,
    email: localUser.email,
    displayName: localUser.displayName,
  }
}

function hasActiveOrganizerSubscription(profile) {
  if (!profile || profile.role !== 'organizer') return false
  const subscription = profile.subscription
  if (!subscription || subscription.status !== 'active') return false
  if (!subscription.expiresAt) return true
  const expiryValue = subscription.expiresAt?.toDate
    ? subscription.expiresAt.toDate()
    : subscription.expiresAt
  const expiry = new Date(expiryValue).getTime()
  return Number.isFinite(expiry) && expiry > Date.now()
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authBusy, setAuthBusy] = useState(false)

  async function provisionMarketplaceProfileForRole({ role, uid, displayName, email, marketplaceProfile }) {
    const profile = marketplaceProfile ?? buildMarketplaceProfile(role, uid)
    if (!profile || (profile.type !== 'supplier' && profile.type !== 'organizer')) return
    await ensureMarketplaceProfile({
      profileType: profile.type,
      profileId: profile.profileId,
      ownerUid: uid,
      displayName,
      email,
      simulateLatency: false,
    })
  }

  useEffect(() => {
    if (!firebaseEnabled || !auth) {
      if (!LOCAL_AUTH_FALLBACK_ENABLED) {
        setUser(null)
        setProfile(null)
        setLoading(false)
        return undefined
      }
      const session = readLocalJSON(LOCAL_AUTH_KEY, null)
      if (session) {
        setUser(toLocalSession(session))
        setProfile({
          role: session.role,
          displayName: session.displayName,
          email: session.email,
          subscription: session.subscription ?? null,
          marketplaceProfile: session.marketplaceProfile ?? null,
        })
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
      return undefined
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser)
          const data = await fetchProfile(firebaseUser.uid)
          setProfile(data)
        } else {
          setUser(null)
          setProfile(null)
        }
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  async function login(email, password) {
    setAuthBusy(true)

    try {
      if (!firebaseEnabled || !auth) {
        if (!LOCAL_AUTH_FALLBACK_ENABLED) {
          throw new Error('Local auth fallback is disabled. Configure Firebase to continue.')
        }
        const users = readLocalJSON(LOCAL_USERS_KEY, [])
        let matchedIndex = -1
        for (let index = 0; index < users.length; index += 1) {
          const candidate = users[index]
          if (candidate.email !== email) continue
          if (await verifyLocalPassword(candidate, password)) {
            matchedIndex = index
            break
          }
        }

        if (matchedIndex < 0) {
          throw new Error('Invalid email or password.')
        }

        let matched = users[matchedIndex]
        if (typeof matched.password === 'string') {
          const upgradedPassword = await buildLocalPasswordRecord(password)
          const rest = { ...matched }
          delete rest.password
          matched = { ...rest, ...upgradedPassword }
          users[matchedIndex] = matched
          writeLocalJSON(LOCAL_USERS_KEY, users)
        }

        writeLocalJSON(LOCAL_AUTH_KEY, toLocalStoredSession(matched))
        setUser(toLocalSession(matched))
        setProfile({
          role: matched.role,
          displayName: matched.displayName,
          email: matched.email,
          subscription: matched.subscription ?? null,
          marketplaceProfile: matched.marketplaceProfile ?? null,
        })
        return toLocalSession(matched)
      }

      const credentials = await signInWithEmailAndPassword(auth, email, password)
      const data = await fetchProfile(credentials.user.uid)
      setProfile(data)
      return credentials.user
    } finally {
      setAuthBusy(false)
    }
  }

  async function register({ email, password, displayName, role }) {
    setAuthBusy(true)

    try {
      if (!firebaseEnabled || !auth || !db) {
        if (!LOCAL_AUTH_FALLBACK_ENABLED) {
          throw new Error('Local auth fallback is disabled. Configure Firebase to continue.')
        }
        const users = readLocalJSON(LOCAL_USERS_KEY, [])
        if (users.some((candidate) => candidate.email === email)) {
          throw new Error('An account with this email already exists.')
        }

        const uid = crypto.randomUUID()
        const normalizedRole = role ?? 'attendee'
        const passwordRecord = await buildLocalPasswordRecord(password)
        const localUser = {
          uid,
          email,
          displayName: displayName ?? '',
          role: normalizedRole,
          subscription: normalizedRole === 'organizer'
            ? { status: 'inactive', planId: null, expiresAt: null }
            : null,
          marketplaceProfile: buildMarketplaceProfile(normalizedRole, uid),
          ...passwordRecord,
        }

        writeLocalJSON(LOCAL_USERS_KEY, [...users, localUser])
        writeLocalJSON(LOCAL_AUTH_KEY, toLocalStoredSession(localUser))

        setUser(toLocalSession(localUser))
        setProfile({
          role: localUser.role,
          displayName: localUser.displayName,
          email: localUser.email,
          subscription: localUser.subscription,
          marketplaceProfile: localUser.marketplaceProfile,
        })
        await provisionMarketplaceProfileForRole({
          role: normalizedRole,
          uid: localUser.uid,
          displayName: localUser.displayName,
          email: localUser.email,
          marketplaceProfile: localUser.marketplaceProfile,
        })
        return toLocalSession(localUser)
      }

      const credentials = await createUserWithEmailAndPassword(auth, email, password)
      const normalizedRole = role ?? 'attendee'
      const marketplaceProfile = buildMarketplaceProfile(normalizedRole, credentials.user.uid)

      if (displayName) {
        await updateProfile(credentials.user, { displayName })
      }

      const profilePayload = {
        role: normalizedRole,
        displayName: displayName ?? '',
        email,
        subscription: normalizedRole === 'organizer'
          ? { status: 'inactive', planId: null, expiresAt: null }
          : null,
        marketplaceProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      await setDoc(doc(db, 'users', credentials.user.uid), profilePayload, { merge: true })

      setProfile({
        role: profilePayload.role,
        displayName: profilePayload.displayName,
        email: profilePayload.email,
        subscription: profilePayload.subscription,
        marketplaceProfile: profilePayload.marketplaceProfile,
      })

      await provisionMarketplaceProfileForRole({
        role: normalizedRole,
        uid: credentials.user.uid,
        displayName: displayName ?? '',
        email,
        marketplaceProfile,
      })

      return credentials.user
    } finally {
      setAuthBusy(false)
    }
  }

  async function activateSubscription({ planId = 'pro', durationDays = 30 } = {}) {
    if (!user) {
      throw new Error('Please sign in first.')
    }
    if (profile?.role !== 'organizer') {
      throw new Error('Only organizers can activate this feature.')
    }

    setAuthBusy(true)

    try {
      const now = new Date()
      const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString()
      const subscription = {
        status: 'active',
        planId,
        activatedAt: now.toISOString(),
        expiresAt,
      }

      if (!firebaseEnabled || !db) {
        const users = readLocalJSON(LOCAL_USERS_KEY, [])
        const nextUsers = users.map((candidate) =>
          candidate.uid === user.uid
            ? { ...candidate, subscription }
            : candidate,
        )
        writeLocalJSON(LOCAL_USERS_KEY, nextUsers)

        const currentSession = readLocalJSON(LOCAL_AUTH_KEY, null)
        if (currentSession?.uid === user.uid) {
          writeLocalJSON(LOCAL_AUTH_KEY, { ...currentSession, subscription })
        }

        setProfile((current) => ({
          ...(current ?? {}),
          role: 'organizer',
          displayName: current?.displayName ?? '',
          email: current?.email ?? user.email ?? '',
          subscription,
          marketplaceProfile: current?.marketplaceProfile ?? buildMarketplaceProfile('organizer', user.uid),
        }))
        await provisionMarketplaceProfileForRole({
          role: 'organizer',
          uid: user.uid,
          displayName: profile?.displayName ?? user.displayName ?? '',
          email: profile?.email ?? user.email ?? '',
          marketplaceProfile: profile?.marketplaceProfile ?? buildMarketplaceProfile('organizer', user.uid),
        })
        return subscription
      }

      await setDoc(doc(db, 'users', user.uid), {
        subscription,
        updatedAt: serverTimestamp(),
      }, { merge: true })

      setProfile((current) => ({
        ...(current ?? {}),
        role: current?.role ?? 'organizer',
        displayName: current?.displayName ?? user.displayName ?? '',
        email: current?.email ?? user.email ?? '',
        subscription,
        marketplaceProfile: current?.marketplaceProfile ?? buildMarketplaceProfile('organizer', user.uid),
      }))
      await provisionMarketplaceProfileForRole({
        role: 'organizer',
        uid: user.uid,
        displayName: profile?.displayName ?? user.displayName ?? '',
        email: profile?.email ?? user.email ?? '',
        marketplaceProfile: profile?.marketplaceProfile ?? buildMarketplaceProfile('organizer', user.uid),
      })
      return subscription
    } finally {
      setAuthBusy(false)
    }
  }

  async function switchRole(nextRole) {
    if (!user) {
      throw new Error('Please sign in first.')
    }

    const normalizedRole = nextRole === 'organizer' || nextRole === 'supplier' || nextRole === 'attendee'
      ? nextRole
      : 'attendee'
    const nextSubscription = normalizedRole === 'organizer'
      ? (profile?.subscription ?? { status: 'inactive', planId: null, expiresAt: null })
      : null
    const nextMarketplaceProfile = buildMarketplaceProfile(normalizedRole, user.uid)

    setAuthBusy(true)

    try {
      if (!firebaseEnabled || !db || !auth) {
        const users = readLocalJSON(LOCAL_USERS_KEY, [])
        const nextUsers = users.map((candidate) =>
          candidate.uid === user.uid
            ? {
                ...candidate,
                role: normalizedRole,
                subscription: nextSubscription,
                marketplaceProfile: nextMarketplaceProfile,
              }
            : candidate,
        )
        writeLocalJSON(LOCAL_USERS_KEY, nextUsers)

        const currentSession = readLocalJSON(LOCAL_AUTH_KEY, null)
        if (currentSession?.uid === user.uid) {
          writeLocalJSON(LOCAL_AUTH_KEY, {
            ...currentSession,
            role: normalizedRole,
            subscription: nextSubscription,
            marketplaceProfile: nextMarketplaceProfile,
          })
        }

        setProfile((current) => ({
          ...(current ?? {}),
          role: normalizedRole,
          displayName: current?.displayName ?? user.displayName ?? '',
          email: current?.email ?? user.email ?? '',
          subscription: nextSubscription,
          marketplaceProfile: nextMarketplaceProfile,
        }))
        await provisionMarketplaceProfileForRole({
          role: normalizedRole,
          uid: user.uid,
          displayName: user.displayName ?? '',
          email: user.email ?? '',
          marketplaceProfile: nextMarketplaceProfile,
        })
        return
      }

      await setDoc(doc(db, 'users', user.uid), {
        role: normalizedRole,
        subscription: nextSubscription,
        marketplaceProfile: nextMarketplaceProfile,
        updatedAt: serverTimestamp(),
      }, { merge: true })

      setProfile((current) => ({
        ...(current ?? {}),
        role: normalizedRole,
        displayName: current?.displayName ?? user.displayName ?? '',
        email: current?.email ?? user.email ?? '',
        subscription: nextSubscription,
        marketplaceProfile: nextMarketplaceProfile,
      }))
      await provisionMarketplaceProfileForRole({
        role: normalizedRole,
        uid: user.uid,
        displayName: user.displayName ?? '',
        email: user.email ?? '',
        marketplaceProfile: nextMarketplaceProfile,
      })
    } finally {
      setAuthBusy(false)
    }
  }

  async function logout() {
    setAuthBusy(true)

    try {
      if (!firebaseEnabled || !auth) {
        localStorage.removeItem(LOCAL_AUTH_KEY)
        setUser(null)
        setProfile(null)
        return
      }

      await signOut(auth)
      setUser(null)
      setProfile(null)
    } finally {
      setAuthBusy(false)
    }
  }

  const value = {
    user,
    profile,
    loading,
    authBusy,
    login,
    register,
    logout,
    activateSubscription,
    switchRole,
    isOrganizer: profile?.role === 'organizer',
    hasActiveSubscription: hasActiveOrganizerSubscription(profile),
    authMode: firebaseEnabled ? 'firebase' : 'local',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext) ?? {
    user: null,
    profile: null,
    loading: false,
    authBusy: false,
    login: async () => {},
    register: async () => {},
    logout: async () => {},
    activateSubscription: async () => {},
    switchRole: async () => {},
    isOrganizer: false,
    hasActiveSubscription: false,
    authMode: firebaseEnabled ? 'firebase' : 'local',
  }
}
