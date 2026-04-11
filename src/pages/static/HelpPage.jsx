import { Link } from 'react-router-dom'
import { HeroBanner, PageShell, SectionHeader, SurfaceCard } from '@/components/ui/MarketplacePrimitives'

const FAQ_SECTIONS = [
  {
    heading: 'Getting Started',
    items: [
      {
        q: 'How do I create an account?',
        a: 'Click "Sign Up" at the top of any page. You can register as an Event-Goer (to discover and attend events) or as an Organizer / Supplier (to list events and services). You can always switch roles later from your account settings.',
      },
      {
        q: 'What is the difference between an Organizer and a Supplier?',
        a: 'Organizers create and manage events on EventPinas. Suppliers (caterers, photographers, florists, AV teams, etc.) list their services so organizers and event-goers can discover and hire them.',
      },
      {
        q: 'Is EventPinas free to use?',
        a: 'Browsing events and supplier listings is free for everyone. Organizers and suppliers have access to free and paid plan tiers — see our Pricing & Plans page for details.',
      },
    ],
  },
  {
    heading: 'For Event-Goers',
    items: [
      {
        q: 'How do I find events near me?',
        a: 'Go to Browse Events and use the filters to narrow down by city, category, or date. You can also search by keyword.',
      },
      {
        q: 'How do I save events or suppliers I\'m interested in?',
        a: 'Tap the bookmark icon on any event or supplier card. All your bookmarks are collected in your Saved Items page.',
      },
      {
        q: 'How do I register for an event?',
        a: 'On the event detail page, click the "Register" button. Follow the steps to complete your registration. You\'ll receive a confirmation and QR code by email.',
      },
    ],
  },
  {
    heading: 'For Organizers',
    items: [
      {
        q: 'How do I create an event listing?',
        a: 'From your Management Console, go to Events and click "Create Event". Fill in your event details, upload photos, set registration options, and publish when ready.',
      },
      {
        q: 'How does QR code check-in work?',
        a: 'When attendees register, they receive a unique QR code. On event day, your staff can scan codes using the Check-In tool in the Management Console — no extra app required.',
      },
      {
        q: 'Can I manage staff and assign roles for my event?',
        a: 'Yes. In the Management Console, go to Staff to invite team members and assign roles such as Check-in Staff, Waitlist Manager, or Incident Responder.',
      },
      {
        q: 'How do I track registrations and attendance?',
        a: 'The Analytics section of your Management Console shows real-time registration counts, check-in rates, waitlist activity, and more.',
      },
    ],
  },
  {
    heading: 'For Suppliers',
    items: [
      {
        q: 'How do I list my business on EventPinas?',
        a: 'Register or switch to a Supplier role, then complete your supplier profile. Include your service category, location, portfolio photos, and contact details. Your listing goes live after a brief review.',
      },
      {
        q: 'How do organizers find and contact me?',
        a: 'Your supplier profile is searchable from the Find Suppliers page. Organizers can view your portfolio and reach you through your listed contact information.',
      },
      {
        q: 'Can I appear in multiple categories?',
        a: 'Currently each supplier profile is associated with one primary category. If you offer multiple services, you can describe them all within your profile description and portfolio.',
      },
    ],
  },
]

export default function HelpPage() {
  return (
    <PageShell className="space-y-space-10">
      <HeroBanner
        eyebrow="Help Center"
        title="How can we help?"
        description="Find answers to common questions about EventPinas. Can't find what you're looking for? Our support team is just one email away."
        tone="blue"
      />

      {FAQ_SECTIONS.map((section) => (
        <section key={section.heading} className="space-y-space-4">
          <SectionHeader title={section.heading} />
          <div className="space-y-space-3">
            {section.items.map((item) => (
              <SurfaceCard key={item.q}>
                <p className="font-display text-label-lg text-neutral-900">{item.q}</p>
                <p className="mt-space-2 font-body text-body-sm leading-relaxed text-neutral-600">{item.a}</p>
              </SurfaceCard>
            ))}
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="space-y-space-4">
        <SectionHeader title="Still need help?" />
        <SurfaceCard className="max-w-lg">
          <p className="font-body text-body-sm leading-relaxed text-neutral-700">
            Can&apos;t find the answer you&apos;re looking for? Send us a message at{' '}
            <a href="mailto:support@eventpinas.com" className="text-primary-500 hover:text-primary-600">
              support@eventpinas.com
            </a>{' '}
            or visit our{' '}
            <Link to="/contact" className="text-primary-500 hover:text-primary-600">
              Contact page
            </Link>.
            We respond within 1–2 business days.
          </p>
        </SurfaceCard>
      </section>
    </PageShell>
  )
}
