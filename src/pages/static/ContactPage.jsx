import { Link } from 'react-router-dom'
import { HeroBanner, PageShell, SectionHeader, SurfaceCard } from '@/components/ui/MarketplacePrimitives'

const CONTACT_METHODS = [
  {
    title: 'General Inquiries',
    email: 'hello@eventpinas.com',
    description: 'Questions about the platform, your account, or anything else — we\'re happy to help.',
  },
  {
    title: 'Organizer & Supplier Support',
    email: 'support@eventpinas.com',
    description: 'Need help with event listings, supplier profiles, or the Management Console? Reach our dedicated support team.',
  },
  {
    title: 'Press & Partnerships',
    email: 'press@eventpinas.com',
    description: 'Media inquiries, partnership proposals, and co-marketing opportunities.',
  },
]

export default function ContactPage() {
  return (
    <PageShell className="space-y-space-10">
      <HeroBanner
        eyebrow="Contact Us"
        title="We'd love to hear from you."
        description="Whether you have a question, feedback, or a partnership idea — our team is here and ready to help."
        tone="teal"
      />

      {/* Contact Methods */}
      <section className="space-y-space-4">
        <SectionHeader title="Get in Touch" />
        <div className="grid gap-space-4 md:grid-cols-3">
          {CONTACT_METHODS.map((method) => (
            <SurfaceCard key={method.title}>
              <p className="mb-space-1 font-display text-label-lg text-info">{method.title}</p>
              <a
                href={`mailto:${method.email}`}
                className="font-display text-body-sm font-semibold text-primary-500 hover:text-primary-600"
              >
                {method.email}
              </a>
              <p className="mt-space-2 font-body text-body-sm leading-relaxed text-neutral-600">
                {method.description}
              </p>
            </SurfaceCard>
          ))}
        </div>
      </section>

      {/* Office */}
      <section className="space-y-space-4">
        <SectionHeader title="Our Office" />
        <SurfaceCard className="max-w-lg">
          <p className="font-display text-label-lg text-info">EventPinas, Inc.</p>
          <p className="mt-space-2 font-body text-body-sm leading-relaxed text-neutral-600">
            Metro Manila, Philippines
          </p>
          <p className="mt-space-1 font-body text-body-sm text-neutral-500">
            Open Monday – Friday, 9:00 AM – 6:00 PM PHT
          </p>
        </SurfaceCard>
      </section>

      {/* Response Time */}
      <section className="space-y-space-4">
        <SectionHeader title="Response Times" />
        <SurfaceCard className="max-w-lg">
          <p className="font-body text-body-sm leading-relaxed text-neutral-700">
            We aim to respond to all inquiries within <span className="font-semibold text-neutral-900">1–2 business days</span>.
            For urgent organizer or supplier issues, please use{' '}
            <a href="mailto:support@eventpinas.com" className="text-primary-500 hover:text-primary-600">
              support@eventpinas.com
            </a>{' '}
            and include your account email in the subject line for faster routing.
          </p>
        </SurfaceCard>
      </section>

      {/* Follow us */}
      <section className="space-y-space-4">
        <SectionHeader title="Follow Us" />
        <SurfaceCard className="max-w-lg">
          <p className="font-body text-body-sm leading-relaxed text-neutral-700">
            Stay up to date with the latest events, features, and announcements by following EventPinas on
            Facebook, Instagram, X (Twitter), YouTube, and TikTok. You can find all our social links in
            the footer below.
          </p>
          <p className="mt-space-3 font-body text-body-sm text-neutral-500">
            Also check out our <Link to="/help" className="text-primary-500 hover:text-primary-600">Help Center</Link> for
            answers to common questions.
          </p>
        </SurfaceCard>
      </section>
    </PageShell>
  )
}
