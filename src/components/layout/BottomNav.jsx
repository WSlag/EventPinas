import { Link, useLocation } from 'react-router-dom'

const iconStrokeWidth = 1.9

function DiscoverIcon({ active }) {
  if (active) {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M12 2.75a9.25 9.25 0 1 0 9.25 9.25A9.26 9.26 0 0 0 12 2.75Zm3.16 5.59-4.85 2.08a.76.76 0 0 0-.39.39l-2.08 4.85a.44.44 0 0 0 .59.59l4.85-2.08a.76.76 0 0 0 .39-.39l2.08-4.85a.44.44 0 0 0-.59-.59Z"
          clipRule="evenodd"
        />
      </svg>
    )
  }

  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={iconStrokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="m10.4 10.4 5.2-2.2-2.2 5.2-5.2 2.2 2.2-5.2Z" />
    </svg>
  )
}

function EventsIcon({ active }) {
  if (active) {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M7.5 2.25A.75.75 0 0 1 8.25 3v1.5h7.5V3a.75.75 0 0 1 1.5 0v1.5h.75A2.25 2.25 0 0 1 20.25 6.75v11A2.25 2.25 0 0 1 18 20H6a2.25 2.25 0 0 1-2.25-2.25v-11A2.25 2.25 0 0 1 6 4.5h.75V3a.75.75 0 0 1 .75-.75ZM5.25 9.75v8A.75.75 0 0 0 6 18.5h12a.75.75 0 0 0 .75-.75v-8h-13.5Z"
          clipRule="evenodd"
        />
      </svg>
    )
  }

  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={iconStrokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
      <line x1="16" y1="2.75" x2="16" y2="6.25" />
      <line x1="8" y1="2.75" x2="8" y2="6.25" />
      <line x1="3.5" y1="10" x2="20.5" y2="10" />
    </svg>
  )
}

function VendorsIcon({ active }) {
  if (active) {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10.5 4.5A2.5 2.5 0 0 0 8 7v.5H5.75A2.75 2.75 0 0 0 3 10.25v7A2.75 2.75 0 0 0 5.75 20h12.5A2.75 2.75 0 0 0 21 17.25v-7A2.75 2.75 0 0 0 18.25 7.5H16V7a2.5 2.5 0 0 0-2.5-2.5h-3ZM9.5 7v-.1c0-.55.45-1 1-1h3c.55 0 1 .45 1 1V7h-5Zm-5 6v4.25c0 .69.56 1.25 1.25 1.25h12.5c.69 0 1.25-.56 1.25-1.25V13h-15Z"
          clipRule="evenodd"
        />
      </svg>
    )
  }

  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={iconStrokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3.5" y="7.5" width="17" height="12" rx="2.5" />
      <path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5" />
      <path d="M3.5 13h17" />
    </svg>
  )
}

function OrganizersIcon({ active }) {
  if (active) {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8.5 11.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M16.5 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
        <path d="M2.75 20v-1.5c0-2.6 2.11-4.7 4.75-4.7h2c2.62 0 4.75 2.1 4.75 4.7V20H2.75Z" />
        <path d="M13.75 20v-1.3c0-1.41-.6-2.69-1.58-3.59a5.8 5.8 0 0 1 1.73-.26h1.2a4.1 4.1 0 0 1 4.1 4.1V20h-5.45Z" />
      </svg>
    )
  }

  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={iconStrokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="2.8" />
      <circle cx="16.5" cy="9" r="2.2" />
      <path d="M4.5 18a4.5 4.5 0 0 1 9 0" />
      <path d="M14 18c.18-1.78 1.22-3.15 2.9-3.8 1-.34 2.03-.25 2.9.22" />
    </svg>
  )
}

function SavedIcon({ active }) {
  if (active) {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M6 4.25h12A1.75 1.75 0 0 1 19.75 6v13.6a.65.65 0 0 1-1.03.53L12 15.2l-6.72 4.93a.65.65 0 0 1-1.03-.53V6A1.75 1.75 0 0 1 6 4.25Z" />
      </svg>
    )
  }

  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={iconStrokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 4.25h12A1.75 1.75 0 0 1 19.75 6v13.6a.65.65 0 0 1-1.03.53L12 15.2l-6.72 4.93a.65.65 0 0 1-1.03-.53V6A1.75 1.75 0 0 1 6 4.25Z" />
    </svg>
  )
}

const tabs = [
  {
    label: 'Discover',
    to: '/',
    Icon: DiscoverIcon,
  },
  {
    label: 'Events',
    to: '/events',
    Icon: EventsIcon,
  },
  {
    label: 'Suppliers',
    to: '/suppliers',
    Icon: VendorsIcon,
  },
  {
    label: 'Organizers',
    to: '/organizers',
    Icon: OrganizersIcon,
  },
  {
    label: 'Saved',
    to: '/saved',
    Icon: SavedIcon,
  },
]

export default function BottomNav() {
  const location = useLocation()

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-info/40 bg-info text-white shadow-xl md:hidden"
    >
      <div className="flex">
        {tabs.map((tab) => {
          const active = location.pathname === tab.to || (tab.to !== '/' && location.pathname.startsWith(tab.to))
          const Icon = tab.Icon

          return (
            <Link
              key={tab.to}
              to={tab.to}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
              className={`group relative flex h-16 flex-1 flex-col items-center justify-center gap-0.5 px-1 transition-colors duration-fast ${
                active ? 'text-white' : 'text-white/80 hover:text-white'
              }`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-secondary-300" aria-hidden="true" />
              )}
              <span className={`transition-colors duration-fast ${active ? 'text-secondary-300' : 'text-white/80 group-hover:text-white'}`}>
                <Icon active={active} />
              </span>
              <span
                className={`max-w-full whitespace-nowrap text-center font-display font-semibold leading-none tracking-[0.01em] transition-colors duration-fast ${
                  active ? 'text-white' : 'text-white/80 group-hover:text-white'
                }`}
                style={{ fontSize: 'clamp(0.52rem, 2.6vw, 0.64rem)' }}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
