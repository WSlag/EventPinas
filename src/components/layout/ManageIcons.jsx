const stroke = 1.8

function IconBase({ children, active = false }) {
  if (active) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        {children}
      </svg>
    )
  }
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function ManageIcon({ id, active = false }) {
  switch (id) {
    case 'dashboard':
      return (
        <IconBase active={active}>
          <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h5A1.5 1.5 0 0 1 12 5.5v5a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 4 10.5v-5ZM12 13.5A1.5 1.5 0 0 1 13.5 12h5a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 12 18.5v-5ZM12 5.5A1.5 1.5 0 0 1 13.5 4h5A1.5 1.5 0 0 1 20 5.5v3a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 12 8.5v-3ZM4 15.5A1.5 1.5 0 0 1 5.5 14h3a1.5 1.5 0 0 1 1.5 1.5v3A1.5 1.5 0 0 1 8.5 20h-3A1.5 1.5 0 0 1 4 18.5v-3Z" />
        </IconBase>
      )
    case 'events':
      return (
        <IconBase active={active}>
          <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
          <path d="M3.5 10h17" />
          <path d="M8 3.5v4" />
          <path d="M16 3.5v4" />
        </IconBase>
      )
    case 'planner':
      return (
        <IconBase active={active}>
          <rect x="5" y="3.5" width="14" height="17" rx="2.5" />
          <path d="M8.5 8h7" />
          <path d="M8.5 12h7" />
          <path d="m8.5 16 1.6 1.6 3.4-3.4" />
        </IconBase>
      )
    case 'registrationOnline':
      return (
        <IconBase active={active}>
          <path d="M4 8a8 8 0 1 1 16 0v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" />
          <path d="M8 10h8" />
          <path d="M8 14h5" />
        </IconBase>
      )
    case 'registrationOnsite':
      return (
        <IconBase active={active}>
          <rect x="6" y="3.5" width="12" height="17" rx="2.5" />
          <path d="M9 8h6" />
          <path d="M9 12h6" />
          <circle cx="12" cy="16.5" r="1" />
        </IconBase>
      )
    case 'checkin':
      return (
        <IconBase active={active}>
          <path d="M8 6H6a2 2 0 0 0-2 2v2" />
          <path d="M16 6h2a2 2 0 0 1 2 2v2" />
          <path d="M8 18H6a2 2 0 0 1-2-2v-2" />
          <path d="M16 18h2a2 2 0 0 0 2-2v-2" />
          <path d="m9 12 2 2 4-4" />
        </IconBase>
      )
    case 'guests':
      return (
        <IconBase active={active}>
          <circle cx="9" cy="8" r="2.5" />
          <circle cx="16.5" cy="9" r="2" />
          <path d="M4.5 18a4.5 4.5 0 0 1 9 0" />
          <path d="M14.5 18a3.7 3.7 0 0 1 5 0" />
        </IconBase>
      )
    case 'seating':
      return (
        <IconBase active={active}>
          <circle cx="12" cy="12" r="3.5" />
          <circle cx="12" cy="4.5" r="1.5" />
          <circle cx="18.5" cy="8.5" r="1.5" />
          <circle cx="18.5" cy="15.5" r="1.5" />
          <circle cx="12" cy="19.5" r="1.5" />
          <circle cx="5.5" cy="15.5" r="1.5" />
          <circle cx="5.5" cy="8.5" r="1.5" />
        </IconBase>
      )
    case 'staff':
      return (
        <IconBase active={active}>
          <path d="M12 4 5 7.4v5.2c0 3.2 2 6.2 5.1 7.4L12 21l1.9-1c3.1-1.2 5.1-4.2 5.1-7.4V7.4L12 4Z" />
          <path d="M9.5 12h5" />
        </IconBase>
      )
    case 'qr':
      return (
        <IconBase active={active}>
          <path d="M4.5 4.5h6v6h-6z" />
          <path d="M13.5 4.5h6v6h-6z" />
          <path d="M4.5 13.5h6v6h-6z" />
          <path d="M13.5 13.5h2v2h-2zM17.5 13.5h2v2h-2zM17.5 17.5h2v2h-2zM13.5 17.5h2v2h-2z" />
        </IconBase>
      )
    case 'incidents':
      return (
        <IconBase active={active}>
          <path d="m12 3.8 9 15.6a1 1 0 0 1-.9 1.5H3.9a1 1 0 0 1-.9-1.5L12 3.8Z" />
          <path d="M12 9v5" />
          <circle cx="12" cy="17.2" r=".8" />
        </IconBase>
      )
    case 'waitlist':
      return (
        <IconBase active={active}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7v5l3 2" />
        </IconBase>
      )
    case 'analytics':
      return (
        <IconBase active={active}>
          <path d="M4 19h16" />
          <rect x="6" y="11" width="3" height="6" rx=".8" />
          <rect x="11" y="8" width="3" height="9" rx=".8" />
          <rect x="16" y="5" width="3" height="12" rx=".8" />
        </IconBase>
      )
    case 'audit':
      return (
        <IconBase active={active}>
          <path d="M7.5 3.5h9A2.5 2.5 0 0 1 19 6v12a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 18V6a2.5 2.5 0 0 1 2.5-2.5Z" />
          <path d="M8.5 8h7" />
          <path d="M8.5 12h7" />
          <path d="M8.5 16h4" />
        </IconBase>
      )
    case 'more':
      return (
        <IconBase active={active}>
          <circle cx="6" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="18" cy="12" r="1.8" />
        </IconBase>
      )
    default:
      return (
        <IconBase active={active}>
          <circle cx="12" cy="12" r="8.5" />
        </IconBase>
      )
  }
}
