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

const AuthContext = createContext(null)
const LOCAL_AUTH_KEY = 'eventpinas-local-auth'
const LOCAL_USERS_KEY = 'eventpinas-local-users'

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

  useEffect(() => {
    if (!firebaseEnabled || !auth) {
      const session = readLocalJSON(LOCAL_AUTH_KEY, null)
      if (session) {
        setUser(toLocalSession(session))
        setProfile({
          role: session.role,
          displayName: session.displayName,
          email: session.email,
          subscription: session.subscription ?? null,
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
        const users = readLocalJSON(LOCAL_USERS_KEY, [])
        const matched = users.find((candidate) => candidate.email === email && candidate.password === password)
        if (!matched) {
          throw new Error('Invalid email or password.')
        }

        writeLocalJSON(LOCAL_AUTH_KEY, matched)
        setUser(toLocalSession(matched))
        setProfile({
          role: matched.role,
          displayName: matched.displayName,
          email: matched.email,
          subscription: matched.subscription ?? null,
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
        const users = readLocalJSON(LOCAL_USERS_KEY, [])
        if (users.some((candidate) => candidate.email === email)) {
          throw new Error('An account with this email already exists.')
        }

        const localUser = {
          uid: crypto.randomUUID(),
          email,
          password,
          displayName: displayName ?? '',
          role: role ?? 'attendee',
          subscription: role === 'organizer'
            ? { status: 'inactive', planId: null, expiresAt: null }
            : null,
        }

        writeLocalJSON(LOCAL_USERS_KEY, [...users, localUser])
        writeLocalJSON(LOCAL_AUTH_KEY, localUser)

        setUser(toLocalSession(localUser))
        setProfile({
          role: localUser.role,
          displayName: localUser.displayName,
          email: localUser.email,
          subscription: localUser.subscription,
        })
        return toLocalSession(localUser)
      }

      const credentials = await createUserWithEmailAndPassword(auth, email, password)

      if (displayName) {
        await updateProfile(credentials.user, { displayName })
      }

      const profilePayload = {
        role: role ?? 'attendee',
        displayName: displayName ?? '',
        email,
        subscription: role === 'organizer'
          ? { status: 'inactive', planId: null, expiresAt: null }
          : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      await setDoc(doc(db, 'users', credentials.user.uid), profilePayload, { merge: true })

      setProfile({
        role: profilePayload.role,
        displayName: profilePayload.displayName,
        email: profilePayload.email,
        subscription: profilePayload.subscription,
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
        }))
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
      }))
      return subscription
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
  return useContext(AuthContext)
}
