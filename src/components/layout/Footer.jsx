import { Link } from 'react-router-dom'

const EXPLORE = [
  { label: 'Browse Events',  to: '/events' },
  { label: 'Find Suppliers', to: '/suppliers' },
  { label: 'Top Organizers', to: '/organizers' },
  { label: 'Saved Items',    to: '/saved' },
  { label: 'Subscribe',      to: '/subscribe' },
]

const FOR_BUSINESS = [
  { label: 'Create an Event',    to: '/register' },
  { label: 'List Your Business', to: '/suppliers' },
  { label: 'Management Console', to: '/manage' },
  { label: 'Pricing & Plans',    to: '/subscribe' },
]

const COMPANY = [
  { label: 'About EventPinas', to: '/about' },
  { label: 'Contact Us',       to: '/contact' },
  { label: 'Help Center',      to: '/help' },
  { label: 'Careers',          to: '/careers' },
]

const LEGAL = [
  { label: 'Terms of Service',      to: '/terms' },
  { label: 'Privacy Policy',        to: '/privacy' },
  { label: 'Cookie Policy',         to: '/cookies' },
  { label: 'Data Privacy Act (PH)', to: '/privacy#dpa' },
  { label: 'Acceptable Use',        to: '/acceptable-use' },
]

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon fill="#060F2E" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.22 8.22 0 0 0 4.81 1.54V6.78a4.85 4.85 0 0 1-1.04-.09z" />
    </svg>
  )
}

const SOCIALS = [
  { label: 'Facebook',  Icon: FacebookIcon,  href: 'https://facebook.com' },
  { label: 'Instagram', Icon: InstagramIcon, href: 'https://instagram.com' },
  { label: 'X',         Icon: XIcon,         href: 'https://x.com' },
  { label: 'YouTube',   Icon: YouTubeIcon,   href: 'https://youtube.com' },
  { label: 'TikTok',   Icon: TikTokIcon,    href: 'https://tiktok.com' },
]

function FooterLinkGroup({ heading, links, className = '' }) {
  return (
    <div className={className}>
      <p className="font-display text-overline uppercase tracking-[0.12em] text-neutral-500">
        {heading}
      </p>
      <ul className="mt-space-4 space-y-space-1">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              className="block py-space-1 font-body text-body-sm text-neutral-400
                         transition-colors duration-fast hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/8 bg-[#060F2E]">
      {/* Energy aura accents */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_0%_100%,rgba(255,107,74,0.10)_0%,transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_50%_at_100%_0%,rgba(31,168,165,0.07)_0%,transparent_60%)]" />

      <div className="relative mx-auto max-w-[1280px] px-space-4 pt-space-12 md:px-space-6 md:pt-space-16">

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-space-10 md:grid-cols-2 lg:grid-cols-12">

          {/* ── Brand column ── */}
          <div className="lg:col-span-4">
            {/* Logo mark */}
            <Link to="/" className="inline-flex items-center gap-space-3">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary-400">
                <span className="font-display text-sm font-black leading-none text-white">E</span>
              </span>
              <span className="font-display text-lg font-extrabold text-white">EventPinas</span>
            </Link>

            <p className="mt-space-4 max-w-xs font-body text-body-sm leading-relaxed text-neutral-400">
              The home of Philippine events. Connect with trusted suppliers, manage registrations, and
              celebrate every milestone — all in one place.
            </p>

            {/* Social icons */}
            <div className="mt-space-6 flex items-center gap-space-1">
              {SOCIALS.map(({ label, Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="rounded-lg p-2 text-neutral-500 transition-colors duration-fast hover:text-white"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* ── Explore ── */}
          <div className="border-t border-white/8 pt-space-6 md:border-0 md:pt-0 lg:col-span-2">
            <FooterLinkGroup heading="Explore" links={EXPLORE} />
          </div>

          {/* ── For Business ── */}
          <div className="border-t border-white/8 pt-space-6 md:border-0 md:pt-0 lg:col-span-2">
            <FooterLinkGroup heading="For Business" links={FOR_BUSINESS} />
          </div>

          {/* ── Company + Legal ── */}
          <div className="border-t border-white/8 pt-space-6 md:col-span-2 md:border-0 md:pt-0 lg:col-span-4">
            <div className="grid grid-cols-2 gap-space-8">
              <FooterLinkGroup heading="Company" links={COMPANY} />
              <FooterLinkGroup heading="Legal" links={LEGAL} />
            </div>
          </div>

        </div>

        {/* ── Bottom strip ── */}
        <div className="mt-space-10 border-t border-white/6 pt-space-5 pb-16 md:pb-space-6">
          <div className="flex flex-col items-center gap-space-2 text-center md:flex-row md:justify-between md:text-left">
            <p className="font-body text-caption-sm text-neutral-600">
              © {new Date().getFullYear()} EventPinas. All rights reserved.
            </p>
            <p className="font-body text-caption-sm text-neutral-600">
              🇵🇭 Built for the Philippines
            </p>
          </div>
        </div>

      </div>
    </footer>
  )
}
