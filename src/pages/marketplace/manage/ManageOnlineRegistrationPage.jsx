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
  createManageRegistrationField,
  createManageTicketType,
  deleteManageRegistrationField,
  deleteManageTicketType,
  getManageOnlineRegistration,
  reorderManageRegistrationField,
  setManageRegistrationMode,
  toggleManageRegistrationGateway,
  updateManageRegistrationField,
  updateManageTicketType,
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
  const [newField, setNewField] = useState({ label: '', type: 'text', required: false })
  const [newTicket, setNewTicket] = useState({ label: '', pricePhp: 0, total: 0 })
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

  async function onCreateField(event) {
    event.preventDefault()
    if (!newField.label.trim()) return
    setError('')
    try {
      await createManageRegistrationField(selectedEventId, newField, { simulateLatency: false })
      setNewField({ label: '', type: 'text', required: false })
      await refresh()
    } catch (fieldError) {
      setError(fieldError?.message ?? 'Unable to create registration field.')
    }
  }

  async function onEditField(field) {
    const label = window.prompt('Field label', field.label)
    if (label == null) return
    const type = window.prompt('Field type (text, email, tel, number, select, textarea)', field.type)
    if (type == null) return
    const required = window.confirm('Mark this field as required?')
    setError('')
    try {
      await updateManageRegistrationField(
        selectedEventId,
        field.id,
        { label, type, required },
        { simulateLatency: false },
      )
      await refresh()
    } catch (fieldError) {
      setError(fieldError?.message ?? 'Unable to update registration field.')
    }
  }

  async function onDeleteField(field) {
    if (!window.confirm(`Delete field "${field.label}"?`)) return
    setError('')
    try {
      await deleteManageRegistrationField(selectedEventId, field.id, { simulateLatency: false })
      await refresh()
    } catch (fieldError) {
      setError(fieldError?.message ?? 'Unable to delete registration field.')
    }
  }

  async function onCreateTicket(event) {
    event.preventDefault()
    if (!newTicket.label.trim()) return
    setError('')
    try {
      await createManageTicketType(
        selectedEventId,
        {
          label: newTicket.label,
          pricePhp: Number(newTicket.pricePhp) || 0,
          sold: 0,
          total: Math.max(Number(newTicket.total) || 0, 0),
        },
        { simulateLatency: false },
      )
      setNewTicket({ label: '', pricePhp: 0, total: 0 })
      await refresh()
    } catch (ticketError) {
      setError(ticketError?.message ?? 'Unable to create ticket type.')
    }
  }

  async function onEditTicket(ticket) {
    const label = window.prompt('Ticket label', ticket.label)
    if (label == null) return
    const priceText = window.prompt('Ticket price (PHP)', String(ticket.pricePhp ?? 0))
    if (priceText == null) return
    const totalText = window.prompt('Ticket total', String(ticket.total ?? 0))
    if (totalText == null) return
    setError('')
    try {
      await updateManageTicketType(
        selectedEventId,
        ticket.id,
        {
          label,
          pricePhp: Number(priceText),
          total: Number(totalText),
          sold: Number(ticket.sold ?? 0),
        },
        { simulateLatency: false },
      )
      await refresh()
    } catch (ticketError) {
      setError(ticketError?.message ?? 'Unable to update ticket type.')
    }
  }

  async function onDeleteTicket(ticket) {
    if (!window.confirm(`Delete ticket type "${ticket.label}"?`)) return
    setError('')
    try {
      await deleteManageTicketType(selectedEventId, ticket.id, { simulateLatency: false })
      await refresh()
    } catch (ticketError) {
      setError(ticketError?.message ?? 'Unable to delete ticket type.')
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
          <form onSubmit={onCreateField} className="mt-space-2 grid gap-space-2 md:grid-cols-[1fr_120px_120px_auto]">
            <input
              value={newField.label}
              onChange={(event) => setNewField((current) => ({ ...current, label: event.target.value }))}
              className="h-10 rounded-md border border-mgmt-border bg-mgmt-raised px-space-3 font-body text-body-sm text-mgmt-text"
              placeholder="New field label"
            />
            <select
              value={newField.type}
              onChange={(event) => setNewField((current) => ({ ...current, type: event.target.value }))}
              className="h-10 rounded-md border border-mgmt-border bg-mgmt-raised px-space-3 font-body text-body-sm text-mgmt-text"
            >
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="tel">Phone</option>
              <option value="number">Number</option>
              <option value="textarea">Textarea</option>
            </select>
            <label className="flex h-10 items-center gap-space-2 rounded-md border border-mgmt-border bg-mgmt-raised px-space-3 font-body text-body-sm text-mgmt-text">
              <input
                type="checkbox"
                checked={newField.required}
                onChange={(event) => setNewField((current) => ({ ...current, required: event.target.checked }))}
              />
              Required
            </label>
            <ManageButton type="submit" variant="secondary">Add Field</ManageButton>
          </form>
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
                <div className="flex items-center gap-space-2">
                  <ManageBadge tone={field.required ? 'warning' : 'neutral'}>
                    {field.required ? 'Required' : 'Optional'}
                  </ManageBadge>
                  <ManageButton variant="ghost" className="text-[0.7rem]" onClick={() => onEditField(field)}>Edit</ManageButton>
                  <ManageButton
                    variant="danger"
                    className="text-[0.7rem]"
                    onClick={() => onDeleteField(field)}
                    disabled={field.id === 'name'}
                  >
                    Delete
                  </ManageButton>
                </div>
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
        <form onSubmit={onCreateTicket} className="mt-space-2 grid gap-space-2 md:grid-cols-[1fr_120px_120px_auto]">
          <input
            value={newTicket.label}
            onChange={(event) => setNewTicket((current) => ({ ...current, label: event.target.value }))}
            className="h-10 rounded-md border border-mgmt-border bg-mgmt-raised px-space-3 font-body text-body-sm text-mgmt-text"
            placeholder="New ticket label"
          />
          <input
            type="number"
            min="0"
            value={newTicket.pricePhp}
            onChange={(event) => setNewTicket((current) => ({ ...current, pricePhp: event.target.value }))}
            className="h-10 rounded-md border border-mgmt-border bg-mgmt-raised px-space-3 font-body text-body-sm text-mgmt-text"
            placeholder="Price"
          />
          <input
            type="number"
            min="0"
            value={newTicket.total}
            onChange={(event) => setNewTicket((current) => ({ ...current, total: event.target.value }))}
            className="h-10 rounded-md border border-mgmt-border bg-mgmt-raised px-space-3 font-body text-body-sm text-mgmt-text"
            placeholder="Total"
          />
          <ManageButton type="submit" variant="secondary">Add Ticket</ManageButton>
        </form>
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
                <div className="mt-space-2 flex gap-space-2">
                  <ManageButton variant="ghost" className="text-[0.7rem]" onClick={() => onEditTicket(ticket)}>Edit</ManageButton>
                  <ManageButton variant="danger" className="text-[0.7rem]" onClick={() => onDeleteTicket(ticket)}>Delete</ManageButton>
                </div>
              </div>
            )
          })}
        </div>
      </ManageCard>
    </section>
  )
}
