import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

function resolveInitialRole(search) {
  const rawRole = new URLSearchParams(search).get('role')
  if (rawRole === 'organizer' || rawRole === 'supplier' || rawRole === 'attendee') {
    return rawRole
  }
  return 'attendee'
}

const roleFieldClassMap = {
  attendee: {
    label: 'text-info',
    select: 'border-blue-200 bg-blue-50 text-info focus:border-info focus:ring-2 focus:ring-blue-200',
  },
  organizer: {
    label: 'text-primary-700',
    select: 'border-primary-200 bg-primary-50 text-primary-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-200',
  },
  supplier: {
    label: 'text-secondary-700',
    select: 'border-secondary-200 bg-secondary-50 text-secondary-700 focus:border-secondary-400 focus:ring-2 focus:ring-secondary-200',
  },
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { authBusy, register } = useAuth()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const roleFromSearch = useMemo(() => resolveInitialRole(location.search), [location.search])
  const [role, setRole] = useState(roleFromSearch)
  const [error, setError] = useState('')
  const roleFieldClasses = roleFieldClassMap[role] ?? roleFieldClassMap.attendee

  useEffect(() => {
    setRole(roleFromSearch)
  }, [roleFromSearch])

  async function onSubmit(event) {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      await register({ email, password, displayName, role })
      navigate(role === 'organizer' ? '/subscribe' : '/', { replace: true })
    } catch (submitError) {
      setError(submitError?.message ?? 'Unable to create your account right now.')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1180px] items-center justify-center px-space-4 py-space-8 md:px-space-6">
        <div className="grid w-full gap-space-4 rounded-3xl border border-neutral-200 bg-white p-space-4 shadow-lg md:grid-cols-2 md:p-space-6">
          <section className="rounded-2xl bg-gradient-to-br from-secondary-700 via-secondary-600 to-primary-600 p-space-6 text-white">
            <p className="font-display text-overline uppercase tracking-wide text-secondary-100">Join EventPH</p>
            <h1 className="mt-space-2 font-display text-display-lg leading-tight">Create your account.</h1>
            <p className="mt-space-2 font-body text-body-sm text-secondary-50">
              Start as attendee, supplier, or organizer and build your next event journey.
            </p>
          </section>

          <form onSubmit={onSubmit} className="space-y-space-3 rounded-2xl border border-neutral-200 bg-white p-space-4">
            <div>
              <h2 className="font-display text-heading-xl text-neutral-900">Register</h2>
              <p className="mt-space-1 font-body text-body-sm text-neutral-500">It takes less than a minute.</p>
            </div>

            <label className="block space-y-space-1">
              <span className="font-body text-label-sm text-neutral-700">Full name</span>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                required
                className="h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                placeholder="Your name"
              />
            </label>

            <label className="block space-y-space-1">
              <span className="font-body text-label-sm text-neutral-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                placeholder="you@example.com"
              />
            </label>

            <label className="block space-y-space-1">
              <span className={`font-body text-label-sm ${roleFieldClasses.label}`}>Role</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className={`h-10 w-full rounded-md border px-space-3 text-body-sm transition-colors duration-fast focus:outline-none ${roleFieldClasses.select}`}
              >
                <option value="attendee">Attendee</option>
                <option value="organizer">Organizer</option>
                <option value="supplier">Supplier</option>
              </select>
            </label>

            <label className="block space-y-space-1">
              <span className="font-body text-label-sm text-neutral-700">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                className="h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                placeholder="At least 6 characters"
              />
            </label>

            <label className="block space-y-space-1">
              <span className="font-body text-label-sm text-neutral-700">Confirm password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={6}
                className="h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                placeholder="Re-enter password"
              />
            </label>

            {error && <p className="font-body text-body-sm text-error">{error}</p>}

            <button
              type="submit"
              disabled={authBusy}
              className="h-10 w-full rounded-full bg-primary-400 font-display text-label-md text-white disabled:opacity-60"
            >
              {authBusy ? 'Creating account...' : 'Create account'}
            </button>

            <p className="text-center font-body text-body-sm text-neutral-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-500">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
