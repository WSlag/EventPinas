import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { LoadingState } from '@/components/ui/PageStates'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="px-space-4 py-space-6">
        <LoadingState label="Checking your account..." />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && profile?.role !== requiredRole) {
    return (
      <div className="px-space-4 py-space-6">
        <h1 className="font-display text-heading-lg text-neutral-900">Restricted</h1>
        <p className="font-body text-body-sm text-neutral-500 mt-space-2">
          This area is available for {requiredRole} accounts only.
        </p>
      </div>
    )
  }

  return children
}
