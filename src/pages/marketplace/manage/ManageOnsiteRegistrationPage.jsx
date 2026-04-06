import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import {
  ManageBadge,
  ManageButton,
  ManageCard,
  ManageKpiTile,
  ManageSectionHeader,
} from '@/components/ui/ManagePrimitives'
import {
  addManageWaitlistEntry,
  createManageOnsiteWalkIn,
  getManageCapacitySnapshot,
  getManageOnsiteRegistration,
} from '@/services'

const steps = ['Guest Info', 'Ticket Select', 'Payment', 'Badge Print']

const inputCls = 'h-10 rounded-md border border-mgmt-border bg-mgmt-raised px-space-3 text-body-sm text-mgmt-text placeholder:text-mgmt-dim focus:border-mgmt-gold/60 focus:outline-none focus:ring-1 focus:ring-mgmt-gold/30'

function formatDateTime(value) {
  return new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function ManageOnsiteRegistrationPage() {
  const { selectedEventId, permissions } = useOutletContext()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [payload, setPayload] = useState(null)
  const [capacitySnapshot, setCapacitySnapshot] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [statusTone, setStatusTone] = useState('info')
  const [statusAction, setStatusAction] = useState('')
  const [stepIndex, setStepIndex] = useState(0)
  const [guestName, setGuestName] = useState('')
  const [phone, setPhone] = useState('')
  const [ticketType, setTicketType] = useState('General')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [amountPaid, setAmountPaid] = useState(250)
  const [badgePrinted, setBadgePrinted] = useState(true)
  const canAccess = permissions.includes('onsiteRegistration')
  const canManageWaitlist = permissions.includes('waitlist')

  const stats = useMemo(() => {
    if (!payload) return { walkIns: 0, revenue: 0, printed: 0 }
    const walkIns = payload.walkIns.length
    const revenue = payload.walkIns.reduce((sum, item) => sum + (Number(item.amountPaid) || 0), 0)
    const printed = payload.walkIns.filter((item) => item.badgePrinted).length
    return { walkIns, revenue, printed }
  }, [payload])

  async function refresh() {
    const [nextPayload, nextCapacity] = await Promise.all([
      getManageOnsiteRegistration(selectedEventId, { simulateLatency: false }),
      getManageCapacitySnapshot(selectedEventId, { simulateLatency: false }),
    ])
    setPayload(nextPayload)
    setCapacitySnapshot(nextCapacity)
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
        const [nextPayload, nextCapacity] = await Promise.all([
          getManageOnsiteRegistration(selectedEventId, { simulateLatency: false }),
          getManageCapacitySnapshot(selectedEventId, { simulateLatency: false }),
        ])
        if (active) {
          setPayload(nextPayload)
          setCapacitySnapshot(nextCapacity)
        }
      } catch {
        if (active) setError('Unable to load on-site registration data.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [selectedEventId, canAccess])

  const isFull = capacitySnapshot ? capacitySnapshot.availableSlots <= 0 : false

  function resetDraft() {
    setGuestName('')
    setPhone('')
    setTicketType('General')
    setPaymentMethod('Cash')
    setAmountPaid(250)
    setBadgePrinted(true)
    setStepIndex(0)
  }

  async function onSubmitWalkIn(event) {
    event.preventDefault()
    if (!guestName.trim()) return
    const guestNameValue = guestName.trim()
    if (isFull) {
      setError(
        `No capacity left for walk-ins. Registered ${capacitySnapshot?.registered ?? 0} of ${capacitySnapshot?.event?.guestCapacity ?? 0}. Increase event capacity or move guests to waitlist first.`,
      )
      setStatusMessage('')
      setStatusAction('')
      return
    }
    setError('')
    setStatusMessage('')
    setStatusAction('')
    setSubmitting(true)
    try {
      await createManageOnsiteWalkIn(
        selectedEventId,
        { guestName: guestNameValue, phone: phone.trim(), ticketType, paymentMethod, amountPaid, badgePrinted },
        { simulateLatency: false },
      )
      resetDraft()
      await refresh()
      setStatusTone('success')
      setStatusMessage(`${guestNameValue} registered on-site successfully.`)
      setStatusAction('')
    } catch (submitError) {
      setError(submitError?.message ?? 'Unable to register on-site guest.')
    } finally {
      setSubmitting(false)
    }
  }

  async function onSendToWaitlist() {
    if (!selectedEventId || !canManageWaitlist) return
    const guestNameValue = guestName.trim()
    if (!guestNameValue) {
      setError('Enter guest full name before sending to waitlist.')
      setStatusMessage('')
      setStatusAction('')
      return
    }

    setWaitlistSubmitting(true)
    setError('')
    setStatusMessage('')
    setStatusAction('')
    try {
      await addManageWaitlistEntry(
        selectedEventId,
        { name: guestNameValue, ticketType, phone: phone.trim() },
        { simulateLatency: false },
      )
      resetDraft()
      await refresh()
      setStatusTone('success')
      setStatusMessage(`${guestNameValue} added to waitlist.`)
      setStatusAction('openWaitlist')
    } catch (waitlistError) {
      setError(waitlistError?.message ?? 'Unable to send guest to waitlist.')
    } finally {
      setWaitlistSubmitting(false)
    }
  }

  function onOpenWaitlistModule() {
    if (!selectedEventId) return
    navigate(`/manage/waitlist?event=${selectedEventId}`)
  }

  if (!selectedEventId) return <EmptyState message="Select an event first to run on-site registration." />
  if (loading) return <LoadingState label="Loading on-site registration..." />
  if (!canAccess) return <ErrorState message="Your current role cannot access on-site registration." />
  if (!payload) return <ErrorState message={error || 'No on-site registration data found.'} />

  return (
    <section className="space-y-space-4">
      <ManageSectionHeader title="On-site Registration" subtitle="Process walk-ins in 4 steps and print badges at the counter." />
      {error && <ErrorState message={error} />}
      {statusMessage && (
        <ManageCard className={statusTone === 'success' ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}>
          <div className="flex flex-wrap items-center justify-between gap-space-2">
            <p className="font-body text-body-sm text-mgmt-text">{statusMessage}</p>
            {statusAction === 'openWaitlist' && canManageWaitlist && (
              <ManageButton type="button" variant="secondary" onClick={onOpenWaitlistModule}>
                Open Waitlist Module
              </ManageButton>
            )}
          </div>
        </ManageCard>
      )}

      <div className="grid grid-cols-2 gap-space-2 md:grid-cols-3">
        <ManageKpiTile label="Walk-ins Today" value={stats.walkIns} />
        <ManageKpiTile label="Revenue Captured" value={`PHP ${stats.revenue.toLocaleString()}`} />
        <ManageKpiTile label="Badges Printed" value={stats.printed} />
      </div>

      <ManageCard>
        <div className="flex flex-wrap items-center gap-space-2">
          <ManageBadge tone="info">Event capacity: {capacitySnapshot?.event?.guestCapacity ?? 0}</ManageBadge>
          <ManageBadge tone="neutral">Registered: {capacitySnapshot?.registered ?? 0}</ManageBadge>
          <ManageBadge tone={isFull ? 'warning' : 'success'}>Available slots: {capacitySnapshot?.availableSlots ?? 0}</ManageBadge>
        </div>
        {isFull && (
          <p className="mt-space-2 font-body text-body-sm text-warning">
            Walk-ins paused: event is full. Increase capacity in My Events or move people to waitlist before adding new walk-ins.
          </p>
        )}
      </ManageCard>

      <ManageCard>
        <div className="grid gap-space-2 md:grid-cols-4">
          {steps.map((step, index) => (
            <button
              type="button"
              key={step}
              onClick={() => setStepIndex(index)}
              className={`rounded-xl border px-space-3 py-space-2 text-left transition-colors duration-fast ${
                stepIndex === index
                  ? 'border-mgmt-gold/60 bg-gradient-accent-tint text-mgmt-gold'
                  : 'border-mgmt-border bg-mgmt-raised text-mgmt-muted hover:border-mgmt-border-bright hover:text-mgmt-text'
              }`}
            >
              <p className="font-barlow text-[0.75rem] font-semibold uppercase tracking-[0.1em]">Step {index + 1}</p>
              <p className="font-barlow text-[0.875rem] font-semibold uppercase tracking-wide">{step}</p>
            </button>
          ))}
        </div>

        <form onSubmit={onSubmitWalkIn} className="mt-space-3 space-y-space-2">
          {stepIndex === 0 && (
            <div className="grid gap-space-2 md:grid-cols-2">
              <input
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
                placeholder="Guest full name"
                className={inputCls}
              />
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Phone number"
                className={inputCls}
              />
            </div>
          )}

          {stepIndex === 1 && (
            <select
              value={ticketType}
              onChange={(event) => setTicketType(event.target.value)}
              className={`w-full ${inputCls}`}
            >
              <option value="General">General</option>
              <option value="VIP">VIP</option>
              <option value="Staff">Staff</option>
            </select>
          )}

          {stepIndex === 2 && (
            <div className="grid gap-space-2 md:grid-cols-2">
              <select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                className={inputCls}
              >
                <option>Cash</option>
                <option>GCash</option>
                <option>Card</option>
                <option>Maya</option>
              </select>
              <input
                type="number"
                min="0"
                value={amountPaid}
                onChange={(event) => setAmountPaid(Number(event.target.value))}
                className={inputCls}
              />
            </div>
          )}

          {stepIndex === 3 && (
            <label className="flex items-center gap-space-2 rounded-xl border border-mgmt-border bg-mgmt-raised p-space-2 cursor-pointer">
              <input type="checkbox" checked={badgePrinted} onChange={(event) => setBadgePrinted(event.target.checked)} className="accent-mgmt-gold" />
              <span className="font-body text-body-sm text-mgmt-text">Badge printed and handed to guest.</span>
            </label>
          )}

          <div className="flex items-center justify-between gap-space-2">
            <ManageButton
              variant="secondary"
              onClick={() => setStepIndex((current) => Math.max(current - 1, 0))}
              disabled={stepIndex === 0 || submitting || waitlistSubmitting}
            >
              Previous
            </ManageButton>
            {stepIndex < steps.length - 1 ? (
              <ManageButton
                onClick={() => setStepIndex((current) => Math.min(current + 1, steps.length - 1))}
                disabled={submitting || waitlistSubmitting}
              >
                Next
              </ManageButton>
            ) : (
              <ManageButton type="submit" disabled={submitting || waitlistSubmitting || isFull}>
                {submitting ? 'Submitting...' : 'Complete Registration'}
              </ManageButton>
            )}
          </div>
          {isFull && canManageWaitlist && (
            <div className="pt-space-1">
              <ManageButton
                type="button"
                variant="secondary"
                onClick={onSendToWaitlist}
                disabled={submitting || waitlistSubmitting || !guestName.trim()}
              >
                {waitlistSubmitting ? 'Sending...' : 'Send to Waitlist'}
              </ManageButton>
            </div>
          )}
          {isFull && !canManageWaitlist && (
            <p className="font-body text-caption-lg text-mgmt-muted">
              Waitlist permission is required to queue full-capacity walk-ins.
            </p>
          )}
        </form>
      </ManageCard>

      <ManageCard>
        <ManageSectionHeader title="Recent Walk-ins" subtitle="Latest registrations processed at the gate." />
        <div className="mt-space-2 space-y-space-2">
          {payload.walkIns.length === 0 && <EmptyState message="No walk-ins recorded yet." />}
          {payload.walkIns.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-space-2 rounded-xl border border-mgmt-border bg-mgmt-raised p-space-2">
              <div>
                <p className="font-barlow text-[0.9375rem] font-semibold uppercase tracking-wide text-mgmt-text">{item.guestName}</p>
                <p className="font-body text-caption-lg text-mgmt-muted">
                  {item.ticketType} - {item.paymentMethod} - PHP {Number(item.amountPaid).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <ManageBadge tone={item.badgePrinted ? 'success' : 'warning'}>
                  {item.badgePrinted ? 'Badge printed' : 'Pending badge'}
                </ManageBadge>
                <p className="mt-space-1 font-body text-caption-lg text-mgmt-muted">{formatDateTime(item.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </ManageCard>
    </section>
  )
}
