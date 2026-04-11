import { HeroBanner, PageShell, SectionHeader, SurfaceCard } from '@/components/ui/MarketplacePrimitives'

const VALUES = [
  {
    title: 'Community First',
    description:
      'Every feature we build is shaped by the people who use EventPinas — event-goers, organizers, and suppliers across the Philippines.',
  },
  {
    title: 'Trust & Transparency',
    description:
      'We verify organizers and suppliers so attendees can book with confidence. Honest reviews, clear policies, no hidden surprises.',
  },
  {
    title: 'Filipino Pride',
    description:
      'From Pampanga food festivals to Cebu debuts to Manila corporate expos — we celebrate the diversity and richness of Philippine events.',
  },
  {
    title: 'Continuous Innovation',
    description:
      'We ship tools that make event management genuinely easier: QR check-in, digital seating, real-time analytics, and more.',
  },
]

export default function AboutPage() {
  return (
    <PageShell className="space-y-space-10">
      <HeroBanner
        eyebrow="About EventPinas"
        title="The home of Philippine events."
        description="We connect event-goers with unforgettable experiences, help organizers run seamless events, and give suppliers a platform to grow their business — all in one place."
        tone="dark"
      />

      {/* Our Story */}
      <section className="space-y-space-4">
        <SectionHeader title="Our Story" />
        <div className="grid gap-space-4 md:grid-cols-2">
          <SurfaceCard>
            <p className="font-body text-body-sm leading-relaxed text-neutral-700">
              EventPinas was born from a simple frustration: finding trusted suppliers and keeping track of
              event logistics in the Philippines was harder than it needed to be. Organizers relied on
              scattered group chats. Suppliers had no reliable way to get discovered. Attendees had no
              single destination to browse what was happening in their city.
            </p>
          </SurfaceCard>
          <SurfaceCard>
            <p className="font-body text-body-sm leading-relaxed text-neutral-700">
              We set out to fix that. Today, EventPinas is a full-stack events marketplace where you can
              discover upcoming events, book verified suppliers, and manage every detail of your event —
              from registration to check-in — without switching between a dozen different tools.
            </p>
          </SurfaceCard>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="space-y-space-4">
        <SectionHeader title="Mission & Vision" />
        <div className="grid gap-space-4 md:grid-cols-2">
          <SurfaceCard>
            <p className="mb-space-2 font-display text-label-lg text-info">Our Mission</p>
            <p className="font-body text-body-sm leading-relaxed text-neutral-700">
              To make every Philippine event — big or small — easier to plan, discover, and celebrate by
              connecting the people who make them happen.
            </p>
          </SurfaceCard>
          <SurfaceCard>
            <p className="mb-space-2 font-display text-label-lg text-info">Our Vision</p>
            <p className="font-body text-body-sm leading-relaxed text-neutral-700">
              A Philippines where no great event goes undiscovered, no talented supplier goes unnoticed,
              and every organizer has the tools to execute flawlessly.
            </p>
          </SurfaceCard>
        </div>
      </section>

      {/* Core Values */}
      <section className="space-y-space-4">
        <SectionHeader title="Our Core Values" />
        <div className="grid gap-space-3 md:grid-cols-2">
          {VALUES.map((v) => (
            <SurfaceCard key={v.title}>
              <p className="mb-space-2 font-display text-label-lg text-info">{v.title}</p>
              <p className="font-body text-body-sm leading-relaxed text-neutral-700">{v.description}</p>
            </SurfaceCard>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
