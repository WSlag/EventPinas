import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { authBusy, register } = useAuth()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('attendee')
  const [error, setError] = useState('')

  async function onSubmit(event) {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      await register({ email, password, displayName, role })
      navigate(role === 'organizer' ? '/manage' : '/', { replace: true })
    } catch (submitError) {
      setError(submitError?.message ?? 'Unable to create your account right now.')
    }
  }

  return (
    <div className="min-h-screen bg-surface-base flex flex-col items-center justify-center px-space-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white border border-neutral-200 rounded-xl p-space-6 space-y-space-4">
        <div>
          <h1 className="font-display text-display-lg text-neutral-900">Create Account</h1>
          <p className="font-body text-body-sm text-neutral-500 mt-space-1">Join EventPinas in less than a minute.</p>
        </div>

        <label className="block space-y-space-1">
          <span className="font-body text-label-sm text-neutral-700">Full name</span>
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
            className="w-full h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
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
            className="w-full h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
            placeholder="you@example.com"
          />
        </label>

        <label className="block space-y-space-1">
          <span className="font-body text-label-sm text-neutral-700">Role</span>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="w-full h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
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
            className="w-full h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
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
            className="w-full h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
            placeholder="Re-enter password"
          />
        </label>

        {error && <p className="font-body text-body-sm text-error">{error}</p>}

        <button
          type="submit"
          disabled={authBusy}
          className="w-full h-10 rounded-md bg-primary-400 text-white font-display text-label-md disabled:opacity-60"
        >
          {authBusy ? 'Creating account...' : 'Create account'}
        </button>

        <p className="font-body text-body-sm text-neutral-600 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-500 font-medium">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
