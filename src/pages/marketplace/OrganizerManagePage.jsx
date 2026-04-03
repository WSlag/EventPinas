import { HeroBanner, PageShell, SectionHeader, StatChip, SurfaceCard } from '@/components/ui/MarketplacePrimitives'
import { useAuth } from '@/hooks/useAuth'

const quickActions = [
  { title: 'Check-in Scanner', desc: 'Launch guest scan flow and monitor live arrivals.' },
  { title: 'Seating Builder', desc: 'Adjust tables and guest assignments quickly on event day.' },
  { title: 'Live Dashboard', desc: 'Track attendance, no-shows, and queue health in real time.' },
]

export default function OrganizerManagePage() {
  const { profile } = useAuth()

  return (
    <PageShell className="space-y-space-6">
      <HeroBanner
        eyebrow="Organizer Console"
        title={`Welcome, ${profile?.displayName || 'Organizer'}`}
        description="This protected workspace is where event-day execution happens: check-in, seating, coordination, and live operations."
        tone="dark"
      />

      <section className="grid grid-cols-3 gap-space-2">
        <StatChip label="Role" value={profile?.role || 'organizer'} />
        <StatChip label="Account" value={profile?.email || 'N/A'} />
        <StatChip label="Access" value="Protected" />
      </section>

      <section className="space-y-space-3">
        <SectionHeader title="Quick Actions" subtitle="High-priority tools for event-day command." />
        <div className="grid gap-space-3 md:grid-cols-3">
          {quickActions.map((action) => (
            <SurfaceCard key={action.title}>
              <h3 className="font-display text-heading-md text-neutral-900">{action.title}</h3>
              <p className="mt-space-1 font-body text-body-sm text-neutral-600">{action.desc}</p>
            </SurfaceCard>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
