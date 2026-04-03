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
    <div className="min-h-screen bg-surface-base flex flex-col items-center justify-center px-space-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white border border-neutral-200 rounded-xl p-space-6 space-y-space-4">
        <div>
          <h1 className="font-display text-display-lg text-neutral-900">EventPinas</h1>
          <p className="font-body text-body-sm text-neutral-500 mt-space-1">Sign in to continue</p>
        </div>

        <label className="block space-y-space-1">
          <span className="font-body text-label-sm text-neutral-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
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
            className="w-full h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
            placeholder="Enter your password"
          />
        </label>

        {error && <p className="font-body text-body-sm text-error">{error}</p>}

        <button
          type="submit"
          disabled={authBusy}
          className="w-full h-10 rounded-md bg-primary-400 text-white font-display text-label-md disabled:opacity-60"
        >
          {authBusy ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="font-body text-body-sm text-neutral-600 text-center">
          No account yet?{' '}
          <Link to="/register" className="text-primary-500 font-medium">Create one</Link>
        </p>
      </form>
    </div>
  )
}
