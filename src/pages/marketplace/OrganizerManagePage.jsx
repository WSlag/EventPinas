import { useAuth } from '@/hooks/useAuth'

export default function OrganizerManagePage() {
  const { profile } = useAuth()

  return (
    <div className="px-space-4 py-space-6 space-y-space-3">
      <h1 className="font-display text-heading-lg text-neutral-900">Organizer Console</h1>
      <p className="font-body text-body-sm text-neutral-500">
        This organizer-only route is protected and ready for the event-day tool modules.
      </p>
      <div className="rounded-lg border border-neutral-200 bg-white p-space-4">
        <p className="font-body text-body-sm text-neutral-600">Signed in as: {profile?.displayName || profile?.email || 'Organizer'}</p>
        <p className="font-body text-body-sm text-neutral-600 mt-space-1">Role: {profile?.role || 'organizer'}</p>
      </div>
    </div>
  )
}
