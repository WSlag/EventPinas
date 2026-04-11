import { Link } from 'react-router-dom'
import { HeroBanner, PageShell, SectionHeader, SurfaceCard } from '@/components/ui/MarketplacePrimitives'

function ProseCard({ children }) {
  return (
    <SurfaceCard>
      <div className="space-y-space-2 font-body text-body-sm leading-relaxed text-neutral-700">
        {children}
      </div>
    </SurfaceCard>
  )
}

const COOKIE_TYPES = [
  {
    type: 'Essential',
    purpose: 'Required for the Platform to function — authentication sessions, security tokens, and route state. Cannot be disabled.',
    examples: 'Session ID, CSRF token',
    canDisable: false,
  },
  {
    type: 'Preferences',
    purpose: 'Remember your settings and choices across visits, such as language preference and filter state.',
    examples: 'Theme, search filters',
    canDisable: true,
  },
  {
    type: 'Analytics',
    purpose: 'Help us understand how users interact with the Platform so we can improve features and performance. Data is aggregated and anonymised.',
    examples: 'Page views, session duration',
    canDisable: true,
  },
  {
    type: 'Marketing',
    purpose: 'Used to deliver relevant event and service recommendations. We do not use advertising networks or sell this data.',
    examples: 'Saved-item signals',
    canDisable: true,
  },
]

export default function CookiesPage() {
  return (
    <PageShell className="space-y-space-10">
      <HeroBanner
        eyebrow="Legal"
        title="Cookie Policy"
        description="Effective date: April 11, 2025. This policy explains what cookies are, which ones we use, and how you can control them."
        tone="blue"
      />

      {/* 1 */}
      <section className="space-y-space-3">
        <SectionHeader title="1. What Are Cookies?" />
        <ProseCard>
          <p>
            Cookies are small text files placed on your device when you visit a website. They allow the site to
            remember your actions and preferences over a period of time, so you don't have to re-enter settings
            every time you return or navigate between pages.
          </p>
          <p>
            Cookies can be <span className="font-semibold text-neutral-900">session cookies</span> (deleted when you
            close your browser) or <span className="font-semibold text-neutral-900">persistent cookies</span> (stored
            for a set period).
          </p>
        </ProseCard>
      </section>

      {/* 2 */}
      <section className="space-y-space-3">
        <SectionHeader title="2. Cookies We Use" />
        <div className="space-y-space-3">
          {COOKIE_TYPES.map((row) => (
            <SurfaceCard key={row.type}>
              <div className="flex flex-wrap items-start justify-between gap-space-2">
                <p className="font-display text-label-lg text-info">{row.type}</p>
                <span className={`rounded-full px-space-3 py-0.5 font-display text-caption-lg ${row.canDisable ? 'bg-neutral-100 text-neutral-500' : 'bg-primary-50 text-primary-600'}`}>
                  {row.canDisable ? 'Optional' : 'Required'}
                </span>
              </div>
              <p className="mt-space-2 font-body text-body-sm leading-relaxed text-neutral-700">{row.purpose}</p>
              <p className="mt-space-1 font-body text-caption-lg text-neutral-500">
                <span className="font-semibold">Examples:</span> {row.examples}
              </p>
            </SurfaceCard>
          ))}
        </div>
      </section>

      {/* 3 */}
      <section className="space-y-space-3">
        <SectionHeader title="3. Managing Cookies" />
        <ProseCard>
          <p>
            You can control non-essential cookies through your browser settings. Most browsers allow you to block or
            delete cookies. Here's how in the most common browsers:
          </p>
          <ul className="ml-space-4 list-disc space-y-space-1">
            <li><span className="font-semibold text-neutral-900">Chrome</span> — Settings → Privacy and security → Cookies and other site data</li>
            <li><span className="font-semibold text-neutral-900">Firefox</span> — Settings → Privacy & Security → Cookies and Site Data</li>
            <li><span className="font-semibold text-neutral-900">Safari</span> — Preferences → Privacy → Cookies and website data</li>
            <li><span className="font-semibold text-neutral-900">Edge</span> — Settings → Cookies and site permissions → Cookies and site data</li>
          </ul>
          <p>
            Note that disabling essential cookies will prevent the Platform from functioning correctly — you may not
            be able to log in or complete registrations.
          </p>
        </ProseCard>
      </section>

      {/* 4 */}
      <section className="space-y-space-3">
        <SectionHeader title="4. Third-Party Cookies" />
        <ProseCard>
          <p>
            We may use third-party analytics services (e.g., aggregated analytics tools) that set their own cookies.
            These providers are contractually required to process data only as directed by EventPinas and in
            compliance with applicable data privacy laws.
          </p>
          <p>
            We do not use third-party advertising or tracking networks.
          </p>
        </ProseCard>
      </section>

      {/* 5 */}
      <section className="space-y-space-3">
        <SectionHeader title="5. Questions?" />
        <ProseCard>
          <p>
            For any questions about our use of cookies, please contact our Data Protection Officer at{' '}
            <a href="mailto:dpo@eventpinas.com" className="text-primary-500 hover:text-primary-600">
              dpo@eventpinas.com
            </a>{' '}
            or visit our{' '}
            <Link to="/privacy" className="text-primary-500 hover:text-primary-600">Privacy Policy</Link>.
          </p>
        </ProseCard>
      </section>
    </PageShell>
  )
}
