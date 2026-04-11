import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { HeroBanner, PageShell, SurfaceCard } from '@/components/ui/MarketplacePrimitives'
import { useAuth } from '@/hooks/useAuth'

const plans = [
  {
    id: 'event-pass',
    name: 'Pay-Per-Event',
    price: 'P499 / event',
    durationDays: 7,
    description: 'Best for occasional organizers launching one event at a time.',
  },
  {
    id: 'pro-monthly',
    name: 'Pro Monthly',
    price: 'P1,499 / month',
    durationDays: 30,
    description: 'For active organizers running recurring events with live operations.',
  },
  {
    id: 'annual',
    name: 'Annual',
    price: 'P7,999 / year',
    durationDays: 365,
    description: 'Lowest effective monthly rate for teams operating year-round.',
  },
]

export default function SubscribePage() {
  const { user, profile, authBusy, hasActiveSubscription, activateSubscription, switchRole } = useAuth()
  const [error, setError] = useState('')
  const [selectedPlan, setSelectedPlan] = useState(plans[1].id)
  const location = useLocation()
  const navigate = useNavigate()

  const fromPath = useMemo(() => location.state?.from?.pathname || '/manage/dashboard', [location.state])

  async function onActivate() {
    const plan = plans.find((item) => item.id === selectedPlan) ?? plans[1]
    setError('')
    try {
      await activateSubscription({ planId: plan.id, durationDays: plan.durationDays })
      navigate(fromPath, { replace: true })
    } catch (activationError) {
      setError(activationError?.message ?? 'Unable to activate plan right now.')
    }
  }

  async function onBecome(role) {
    setError('')
    try {
      await switchRole(role)
      if (role === 'organizer') {
        navigate('/subscribe', { replace: true })
        return
      }
      navigate('/suppliers', { replace: true })
    } catch (switchError) {
      setError(switchError?.message ?? 'Unable to switch account role right now.')
    }
  }

  if (!user) {
    return (
      <PageShell className="space-y-space-4">
        <HeroBanner
          eyebrow="Organizer Access"
          title="Sign in to continue"
          description="The Event Management Console is available for organizer accounts with an active plan."
          tone="dark"
        />
        <SurfaceCard>
          <p className="font-body text-body-md text-neutral-700">Please sign in first to view plans and activate access.</p>
          <Link to="/login" className="mt-space-3 inline-flex rounded-full bg-primary-400 px-space-4 py-space-2 font-display text-label-md text-white">
            Go to Sign in
          </Link>
        </SurfaceCard>
      </PageShell>
    )
  }

  if (profile?.role !== 'organizer') {
    return (
      <PageShell className="space-y-space-4">
        <HeroBanner
          eyebrow="Role Upgrade"
          title="Become a Supplier or Organizer"
          description="Switch your current account role anytime without creating a new account."
          tone="dark"
        />
        <SurfaceCard>
          {error && <p className="mb-space-3 font-body text-body-sm text-error">{error}</p>}
          <div className="flex flex-col gap-space-2 md:flex-row">
            <button
              type="button"
              onClick={() => onBecome('supplier')}
              disabled={authBusy || profile?.role === 'supplier'}
              className="rounded-full bg-secondary-500 px-space-4 py-space-2 font-display text-label-md text-white disabled:opacity-60"
            >
              {profile?.role === 'supplier' ? 'Already a Supplier' : 'Become a Supplier'}
            </button>
            <button
              type="button"
              onClick={() => onBecome('organizer')}
              disabled={authBusy || profile?.role === 'organizer'}
              className="rounded-full bg-primary-400 px-space-4 py-space-2 font-display text-label-md text-white disabled:opacity-60"
            >
              {profile?.role === 'organizer' ? 'Already an Organizer' : 'Become an Organizer'}
            </button>
          </div>
          <p className="mt-space-3 font-body text-body-sm text-neutral-600">
            Organizer role unlocks event app plans. Supplier role unlocks supplier profile ownership.
          </p>
        </SurfaceCard>
      </PageShell>
    )
  }

  if (hasActiveSubscription) {
    return (
      <PageShell className="space-y-space-4">
        <HeroBanner
          eyebrow="Access Active"
          title="Your organizer console is already unlocked."
          description="Open the manage dashboard to run check-in, guests, and live operations."
          tone="teal"
          actions={(
            <Link to="/manage/dashboard" className="rounded-full bg-white px-space-4 py-space-2 font-display text-label-md text-secondary-700">
              Open Manage Console
            </Link>
          )}
        />
      </PageShell>
    )
  }

  return (
    <PageShell className="space-y-space-6">
      <HeroBanner
        eyebrow="Organizer Paywall"
        title="Unlock the Event Management Console"
        description="Activate a plan to use check-in, seating, guests, and live operations modules."
        tone="dark"
      />

      <section className="grid gap-space-3 md:grid-cols-3">
        {plans.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => setSelectedPlan(plan.id)}
            className={`rounded-2xl border bg-white p-space-4 text-left transition-all duration-fast ${
              selectedPlan === plan.id
                ? 'border-primary-400 ring-2 ring-primary-200'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <p className="font-display text-heading-md text-neutral-900">{plan.name}</p>
            <p className="mt-space-1 font-display text-heading-lg text-info">{plan.price}</p>
            <p className="mt-space-2 font-body text-body-sm text-neutral-600">{plan.description}</p>
          </button>
        ))}
      </section>

      <SurfaceCard>
        {error && <p className="mb-space-3 font-body text-body-sm text-error">{error}</p>}
        <button
          type="button"
          onClick={onActivate}
          disabled={authBusy}
          className="rounded-full bg-primary-400 px-space-4 py-space-2 font-display text-label-md text-white disabled:opacity-60"
        >
          {authBusy ? 'Activating...' : 'Activate & Continue'}
        </button>
      </SurfaceCard>
    </PageShell>
  )
}
