export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-space-4">
      <p className="font-body text-body-sm text-neutral-500">{label}</p>
    </div>
  )
}

export function ErrorState({ message = 'Something went wrong. Please try again.' }) {
  return (
    <div className="rounded-lg border border-error/20 bg-red-50 p-space-4">
      <p className="font-body text-body-sm text-error">{message}</p>
    </div>
  )
}

export function EmptyState({ message = 'No results found.' }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-surface-overlay p-space-4">
      <p className="font-body text-body-sm text-neutral-500">{message}</p>
    </div>
  )
}
