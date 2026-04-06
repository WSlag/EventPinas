import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import {
  ManageBadge,
  ManageButton,
  ManageCard,
  ManageFilterBar,
  ManageSectionHeader,
} from '@/components/ui/ManagePrimitives'
import {
  getManageOnlineRegistration,
  reorderManageRegistrationField,
  setManageRegistrationMode,
  toggleManageRegistrationGateway,
} from '@/services'

function formatCurrency(value) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value ?? 0)
}

export default function ManageOnlineRegistrationPage() {
  const { selectedEventId, permissions } = useOutletContext()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [config, setConfig] = useState(null)
  const [dragIndex, setDragIndex] = useState(null)
  const canAccess = permissions.includes('onlineRegistration')

  const totals = useMemo(() => {
    if (!config) return { sold: 0, total: 0 }
    return config.ticketTypes.reduce((acc, ticket) => ({
      sold: acc.sold + (Number(ticket.sold) || 0),
      total: acc.total + (Number(ticket.total) || 0),
    }), { sold: 0, total: 0 })
  }, [config])

  async function refresh() {
    const payload = await getManageOnlineRegistration(selectedEventId, { simulateLatency: false })
    setConfig(payload)
  }

  useEffect(() => {
    if (!selectedEventId) return
    if (!canAccess) {
      setLoading(false)
      return
    }

    let active = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const payload = await getManageOnlineRegistration(selectedEventId, { simulateLatency: false })
        if (active) setConfig(payload)
      } catch {
        if (active) setError('Unable to load online registration settings.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [selectedEventId, canAccess])

  async function onSetMode(mode) {
    setError('')
    try {
      await setManageRegistrationMode(selectedEventId, mode, { simulateLatency: false })
      await refresh()
    } catch (modeError) {
      setError(modeError?.message ?? 'Unable to update registration mode.')
    }
  }

  async function onToggleGateway(gatewayId) {
    setError('')
    try {
      await toggleManageRegistrationGateway(selectedEventId, gatewayId, { simulateLatency: false })
      await refresh()
    } catch (gatewayError) {
      setError(gatewayError?.message ?? 'Unable to update payment gateway.')
    }
  }

  async function onDropField(targetIndex) {
    if (dragIndex === null || dragIndex === targetIndex) return
    setError('')
    try {
      await reorderManageRegistrationField(selectedEventId, dragIndex, targetIndex, { simulateLatency: false })
      await refresh()
    } catch (reorderError) {
      setError(reorderError?.message ?? 'Unable to reorder fields.')
    } finally {
      setDragIndex(null)
    }
  }

  if (!selectedEventId) return <EmptyState message="Select an event first to configure online registration." />
  if (loading) return <LoadingState label="Loading online registration..." />
  if (!canAccess) return <ErrorState message="Your current role cannot access online registration settings." />
  if (!config) return <ErrorState message={error || 'No registration configuration found.'} />

  return (
    <section className="space-y-space-4">
      <ManageSectionHeader
        title="Online Registration"
        subtitle="Configure registration form fields, ticket mode, and payment gateway availability."
      />
      {error && <ErrorState message={error} />}

      <ManageFilterBar>
        <ManageButton variant={config.mode === 'free' ? 'primary' : 'secondary'} onClick={() => onSetMode('free')}>
          Free Entrance
        </ManageButton>
        <ManageButton variant={config.mode === 'ticketed' ? 'primary' : 'secondary'} onClick={() => onSetMode('ticketed')}>
          Ticketed Entry
        </ManageButton>
        <ManageBadge tone="info">{totals.sold}/{totals.total} sold</ManageBadge>
      </ManageFilterBar>

      <div className="grid gap-space-3 md:grid-cols-2">
        <ManageCard>
          <ManageSectionHeader title="Registration Form Builder" subtitle="Drag rows to reorder your form fields." />
          <div className="mt-space-3 space-y-space-2">
            {config.fields.map((field, index) => (
              <div
                key={field.id}
                draggable="true"
                onDragStart={() => setDragIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => onDropField(index)}
                className={`flex cursor-grab items-center justify-between rounded-xl border p-space-2 transition-colors duration-fast active:cursor-grabbing ${
                  dragIndex === index
                    ? 'border-mgmt-gold/50 bg-gradient-accent-tint'
                    : 'border-mgmt-border bg-mgmt-raised hover:border-mgmt-border-bright'
                }`}
              >
                <div>
                  <p className="font-barlow text-[0.9375rem] font-semibold uppercase tracking-wide text-mgmt-text">{field.label}</p>
                  <p className="font-body text-caption-lg text-mgmt-muted">{field.type}</p>
                </div>
                <ManageBadge tone={field.required ? 'warning' : 'neutral'}>
                  {field.required ? 'Required' : 'Optional'}
                </ManageBadge>
              </div>
            ))}
          </div>
        </ManageCard>

        <ManageCard>
          <ManageSectionHeader title="Payment Gateways" subtitle="Toggle accepted payment methods at registration." />
          <div className="mt-space-3 space-y-space-2">
            {config.paymentGateways.map((gateway) => (
              <button
                type="button"
                key={gateway.id}
                onClick={() => onToggleGateway(gateway.id)}
                className="flex w-full items-center justify-between rounded-xl border border-mgmt-border bg-mgmt-raised p-space-2 text-left transition-colors duration-fast hover:border-mgmt-border-bright"
              >
                <p className="font-barlow text-[0.9375rem] font-semibold uppercase tracking-wide text-mgmt-text">{gateway.label}</p>
                <ManageBadge tone={gateway.enabled ? 'success' : 'neutral'}>
                  {gateway.enabled ? 'Enabled' : 'Disabled'}
                </ManageBadge>
              </button>
            ))}
          </div>
        </ManageCard>
      </div>

      <ManageCard>
        <ManageSectionHeader title="Ticket Types" subtitle="Track sold vs remaining seats per ticket option." />
        <div className="mt-space-3 grid gap-space-2 md:grid-cols-3">
          {config.ticketTypes.map((ticket) => {
            const sold = Number(ticket.sold) || 0
            const total = Number(ticket.total) || 0
            const pct = total > 0 ? Math.min((sold / total) * 100, 100) : 0
            return (
              <div key={ticket.id} className="rounded-xl border border-mgmt-border bg-mgmt-raised p-space-3">
                <p className="font-barlow text-[0.9375rem] font-semibold uppercase tracking-wide text-mgmt-text">{ticket.label}</p>
                <p className="font-body text-caption-lg text-mgmt-muted">{formatCurrency(ticket.pricePhp)}</p>
                <p className="mt-space-1 font-body text-caption-lg text-mgmt-text">{sold}/{total} sold</p>
                <div className="mt-space-2 h-2 rounded-full bg-mgmt-bg">
                  <div className="h-2 rounded-full bg-secondary-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </ManageCard>
    </section>
  )
}
