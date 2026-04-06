import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { ManageBadge, ManageButton, ManageCard, ManageKpiTile, ManageSectionHeader } from '@/components/ui/ManagePrimitives'
import { checklistPhases } from '@/data'
import { getManagePlanner, toggleManagePlannerChecklistItem, updateManageBudgetCategorySpend } from '@/services'

const phaseLabels = {
  preEvent: 'Pre-Event',
  setup: 'Setup',
  live: 'Live',
  post: 'Post',
}

const inputCls = 'rounded-md border border-mgmt-border bg-mgmt-raised px-space-2 text-body-sm text-mgmt-text placeholder:text-mgmt-dim focus:border-mgmt-gold/60 focus:outline-none focus:ring-1 focus:ring-mgmt-gold/30'

function formatCurrency(value) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value ?? 0)
}

export default function ManagePlannerPage() {
  const { selectedEventId, permissions } = useOutletContext()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [planner, setPlanner] = useState(null)
  const canAccessPlanner = permissions.includes('planner')

  const totals = useMemo(() => {
    if (!planner) return { planned: 0, spent: 0 }
    const planned = planner.budget.reduce((sum, category) => sum + (Number(category.planned) || 0), 0)
    const spent = planner.budget.reduce((sum, category) => sum + (Number(category.spent) || 0), 0)
    return { planned, spent }
  }, [planner])

  useEffect(() => {
    if (!selectedEventId) return
    if (!canAccessPlanner) {
      setLoading(false)
      return
    }

    let active = true
    async function loadPlanner() {
      setLoading(true)
      setError('')
      try {
        const payload = await getManagePlanner(selectedEventId, { simulateLatency: false })
        if (active) setPlanner(payload)
      } catch {
        if (active) setError('Unable to load planner details right now.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadPlanner()
    return () => {
      active = false
    }
  }, [selectedEventId, canAccessPlanner])

  async function onToggleChecklist(itemId) {
    setError('')
    try {
      await toggleManagePlannerChecklistItem(selectedEventId, itemId, { simulateLatency: false })
      const payload = await getManagePlanner(selectedEventId, { simulateLatency: false })
      setPlanner(payload)
    } catch (toggleError) {
      setError(toggleError?.message ?? 'Unable to update checklist right now.')
    }
  }

  async function onUpdateSpent(categoryId, spentValue) {
    setError('')
    try {
      await updateManageBudgetCategorySpend(selectedEventId, categoryId, spentValue, { simulateLatency: false })
      const payload = await getManagePlanner(selectedEventId, { simulateLatency: false })
      setPlanner(payload)
    } catch (budgetError) {
      setError(budgetError?.message ?? 'Unable to update budget spent value.')
    }
  }

  if (!selectedEventId) return <EmptyState message="Select an event first to open event planner." />
  if (loading) return <LoadingState label="Loading event planner..." />
  if (!canAccessPlanner) return <ErrorState message="Your current role cannot access event planner tools." />
  if (!planner) return <ErrorState message={error || 'No planner data found for this event.'} />

  return (
    <section className="space-y-space-4">
      <ManageSectionHeader title="Event Planner" subtitle="Plan execution from pre-event preparation to post-event closeout." />
      {error && <ErrorState message={error} />}

      <div className="grid grid-cols-2 gap-space-2 md:grid-cols-4">
        <ManageKpiTile label="Planner Lead" value={planner.eventDetails.plannerLead || 'N/A'} />
        <ManageKpiTile label="Guest Target" value={planner.eventDetails.guestTarget || 0} />
        <ManageKpiTile label="Venue Open" value={planner.eventDetails.venueOpenTime || '--:--'} />
        <ManageKpiTile label="Show Start" value={planner.eventDetails.showStartTime || '--:--'} />
      </div>

      <div className="grid gap-space-3 md:grid-cols-4">
        {checklistPhases.map((phase) => (
          <ManageCard key={phase}>
            <div className="flex items-center justify-between">
              <p className="font-playfair text-heading-sm text-mgmt-text">{phaseLabels[phase]}</p>
              <ManageBadge tone="info">
                {planner.checklist.filter((item) => item.phase === phase && item.done).length}/
                {planner.checklist.filter((item) => item.phase === phase).length}
              </ManageBadge>
            </div>
            <div className="mt-space-2 space-y-space-2">
              {planner.checklist.filter((item) => item.phase === phase).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onToggleChecklist(item.id)}
                  className={`flex w-full items-start gap-space-2 rounded-lg border p-space-2 text-left transition-colors duration-fast ${
                    item.done ? 'border-green-200 bg-green-50' : 'border-mgmt-border bg-mgmt-raised'
                  }`}
                >
                  <span className="mt-[2px] font-barlow text-[0.8125rem] font-semibold text-mgmt-gold">{item.done ? '[x]' : '[ ]'}</span>
                  <span className="font-body text-body-sm text-mgmt-text">{item.label}</span>
                </button>
              ))}
              {planner.checklist.filter((item) => item.phase === phase).length === 0 && (
                <p className="font-body text-body-sm text-mgmt-muted">No items in this phase.</p>
              )}
            </div>
          </ManageCard>
        ))}
      </div>

      <ManageCard>
        <ManageSectionHeader
          title="Budget Tracker"
          subtitle="Track category spend versus plan in real time."
          actions={<ManageBadge tone={totals.spent > totals.planned ? 'danger' : 'success'}>{formatCurrency(totals.spent)} spent</ManageBadge>}
        />
        <p className="mt-space-1 font-body text-caption-lg text-mgmt-muted">Planned total: {formatCurrency(totals.planned)}</p>

        <div className="mt-space-3 space-y-space-3">
          {planner.budget.map((category) => {
            const ratio = category.planned > 0 ? Math.min((category.spent / category.planned) * 100, 100) : 0
            return (
              <div key={category.id} className="rounded-xl border border-mgmt-border p-space-3">
                <div className="flex items-center justify-between gap-space-2">
                  <p className="font-barlow text-[0.9375rem] font-semibold uppercase tracking-wide text-mgmt-text">{category.category}</p>
                  <ManageBadge tone={category.spent > category.planned ? 'danger' : 'neutral'}>
                    {formatCurrency(category.spent)} / {formatCurrency(category.planned)}
                  </ManageBadge>
                </div>
                <div className="mt-space-2 h-2 rounded-full bg-mgmt-bg">
                  <div className={`h-2 rounded-full ${category.spent > category.planned ? 'bg-primary-500' : 'bg-secondary-500'}`} style={{ width: `${ratio}%` }} />
                </div>
                <div className="mt-space-2 flex flex-wrap items-center gap-space-2">
                  <input
                    type="number"
                    min="0"
                    value={category.spent}
                    onChange={(event) => onUpdateSpent(category.id, event.target.value)}
                    className={`h-9 min-w-0 flex-1 ${inputCls}`}
                  />
                  <ManageButton variant="secondary" onClick={() => onUpdateSpent(category.id, category.planned)}>
                    Set to Planned
                  </ManageButton>
                </div>
              </div>
            )
          })}
        </div>
      </ManageCard>
    </section>
  )
}
