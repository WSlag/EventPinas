import { Navigate, useLocation } from 'react-router-dom'
import { LoadingState } from '@/components/ui/PageStates'
import { useAuth } from '@/hooks/useAuth'

export default function AdminGuard({ children }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="px-space-4 py-space-6">
        <LoadingState label="Checking admin access..." />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="mx-auto w-full max-w-[860px] px-space-4 py-space-8 md:px-space-6">
        <div className="rounded-2xl border border-neutral-200 bg-white p-space-6 shadow-sm">
          <h1 className="font-display text-heading-xl text-neutral-900">Admin access only</h1>
          <p className="mt-space-2 font-body text-body-md text-neutral-600">
            This console is available for platform admin accounts.
          </p>
        </div>
      </div>
    )
  }

  return children
}
