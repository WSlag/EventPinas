export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="rounded-lg border border-mgmt-border bg-mgmt-surface p-space-4">
      <p className="font-barlow text-[0.875rem] uppercase tracking-wide text-mgmt-muted">{label}</p>
    </div>
  )
}

export function ErrorState({ message = 'Something went wrong. Please try again.' }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-space-4">
      <p className="font-body text-body-sm text-red-700">{message}</p>
    </div>
  )
}

export function EmptyState({ message = 'No results found.' }) {
  return (
    <div className="rounded-lg border border-mgmt-border bg-mgmt-surface p-space-4">
      <p className="font-body text-body-sm text-mgmt-muted">{message}</p>
    </div>
  )
}
