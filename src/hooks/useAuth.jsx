import { useEffect, useMemo, useState, createContext, useContext } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

const AuthContext = createContext(null)

async function fetchProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authBusy, setAuthBusy] = useState(false)

  useEffect(() => {
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
      const credentials = await createUserWithEmailAndPassword(auth, email, password)

      if (displayName) {
        await updateProfile(credentials.user, { displayName })
      }

      const profilePayload = {
        role: role ?? 'attendee',
        displayName: displayName ?? '',
        email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      await setDoc(doc(db, 'users', credentials.user.uid), profilePayload, { merge: true })

      setProfile({
        role: profilePayload.role,
        displayName: profilePayload.displayName,
        email: profilePayload.email,
      })

      return credentials.user
    } finally {
      setAuthBusy(false)
    }
  }

  async function logout() {
    setAuthBusy(true)
    try {
      await signOut(auth)
      setUser(null)
      setProfile(null)
    } finally {
      setAuthBusy(false)
    }
  }

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      authBusy,
      login,
      register,
      logout,
      isOrganizer: profile?.role === 'organizer',
    }),
    [user, profile, loading, authBusy],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
