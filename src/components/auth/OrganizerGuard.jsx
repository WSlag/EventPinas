import { Navigate, useLocation } from 'react-router-dom'
import { LoadingState } from '@/components/ui/PageStates'
import { useAuth } from '@/hooks/useAuth'

export default function OrganizerGuard({ children }) {
  const { user, profile, loading, hasActiveSubscription } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="px-space-4 py-space-6">
        <LoadingState label="Checking organizer access..." />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (profile?.role !== 'organizer') {
    return (
      <div className="mx-auto w-full max-w-[860px] px-space-4 py-space-8 md:px-space-6">
        <div className="rounded-2xl border border-neutral-200 bg-white p-space-6 shadow-sm">
          <h1 className="font-display text-heading-xl text-neutral-900">This tool is for organizers only</h1>
          <p className="mt-space-2 font-body text-body-md text-neutral-600">
            The Event Management Console is available for organizer accounts with active access.
          </p>
        </div>
      </div>
    )
  }

  if (!hasActiveSubscription) {
    return <Navigate to="/subscribe" state={{ from: location }} replace />
  }

  return children
}
