import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { user, loading, authBusy, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && user) {
      navigate(from, { replace: true })
    }
  }, [loading, user, from, navigate])

  async function onSubmit(event) {
    event.preventDefault()
    setError('')

    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (submitError) {
      setError(submitError?.message ?? 'Unable to sign in with those credentials.')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1180px] items-center justify-center px-space-4 py-space-8 md:px-space-6">
        <div className="grid w-full gap-space-4 rounded-3xl border border-neutral-200 bg-white p-space-4 shadow-lg md:grid-cols-2 md:p-space-6">
          <section className="rounded-2xl bg-gradient-to-br from-info via-info to-primary-700 p-space-6 text-white">
            <p className="font-display text-overline uppercase tracking-wide text-blue-100">EventPH Marketplace</p>
            <h1 className="mt-space-2 font-display text-display-lg leading-tight">Welcome back.</h1>
            <p className="mt-space-2 font-body text-body-sm text-blue-50">
              Sign in to manage saved events, connect with suppliers, and access organizer tools.
            </p>
          </section>

          <form onSubmit={onSubmit} className="space-y-space-3 rounded-2xl border border-neutral-200 bg-white p-space-4">
            <div>
              <h2 className="font-display text-heading-xl text-neutral-900">Sign in</h2>
              <p className="mt-space-1 font-body text-body-sm text-neutral-500">Continue to your account.</p>
            </div>

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
              <span className="font-body text-label-sm text-neutral-700">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                className="h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                placeholder="Enter your password"
              />
            </label>

            {error && <p className="font-body text-body-sm text-error">{error}</p>}

            <button
              type="submit"
              disabled={authBusy}
              className="h-10 w-full rounded-full bg-primary-400 font-display text-label-md text-white disabled:opacity-60"
            >
              {authBusy ? 'Signing in...' : 'Sign in'}
            </button>

            <p className="text-center font-body text-body-sm text-neutral-600">
              No account yet?{' '}
              <Link to="/register?role=attendee" className="font-medium text-primary-500">Create one</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
