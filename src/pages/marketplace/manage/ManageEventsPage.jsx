import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import { LoadingState, ErrorState } from '@/components/ui/PageStates'
import {
  ManageBadge,
  ManageButton,
  ManageCard,
  ManageDialog,
  ManageFilterBar,
  ManageFilterChip,
  ManageSectionHeader,
  TiltCard,
} from '@/components/ui/ManagePrimitives'
import { KanbanBoard, KanbanColumn } from '@/components/ui/ManageKanban'
import {
  archiveManageEvent,
  createManageEvent,
  goLiveManageEvent,
  listManageEvents,
  publishManageEvent,
  restoreManageEvent,
  setManageSelectedEvent,
  softDeleteManageEvent,
  subscribeManageEvents,
  updateManageEvent,
} from '@/services'

function formatDate(value) {
  return new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

function buildEventForm(input = {}) {
  return {
    title: input.title ?? '',
    date: input.date ?? '',
    city: input.city ?? '',
    venue: input.venue ?? '',
    guestCapacity: input.guestCapacity ?? 100,
  }
}

function validateEventForm(form) {
  const requiredFields = [
    ['title', 'Event title is required.'],
    ['date', 'Event date is required.'],
    ['city', 'City is required.'],
    ['venue', 'Venue is required.'],
  ]
  for (const [field, message] of requiredFields) {
    if (!String(form[field] ?? '').trim()) return message
  }
  const capacity = Number(form.guestCapacity)
  if (!Number.isInteger(capacity) || capacity < 1) return 'Guest capacity must be an integer ≥ 1.'
  return ''
}

function computeSeatingPreview(guestCapacity) {
  const seatsPerTable = 10
  const capacity = Number(guestCapacity)
  if (!Number.isInteger(capacity) || capacity < 1) return { seatsPerTable, tableCount: 0, totalSeats: 0 }
  const tableCount = Math.ceil(capacity / seatsPerTable)
  return { seatsPerTable, tableCount, totalSeats: tableCount * seatsPerTable }
}

const inputCls = 'mt-space-1 h-10 w-full rounded-md border border-mgmt-border bg-mgmt-raised px-space-3 font-body text-body-sm text-mgmt-text placeholder:text-mgmt-dim focus:border-mgmt-gold/60 focus:outline-none focus:ring-1 focus:ring-mgmt-gold/30 transition-colors duration-fast'
const labelCls = 'font-barlow text-[0.8125rem] uppercase tracking-[0.06em] text-mgmt-muted'

function EventFields({ form, onChange }) {
  return (
    <div className="mt-space-3 grid gap-space-2 md:grid-cols-2">
      <label className="block md:col-span-2">
        <span className={labelCls}>Event title</span>
        <input value={form.title} onChange={(e) => onChange('title', e.target.value)} className={inputCls} placeholder="e.g. Rivera Family Reunion 2026" />
      </label>
      <label className="block">
        <span className={labelCls}>Event date</span>
        <input type="date" value={form.date} onChange={(e) => onChange('date', e.target.value)} className={inputCls} />
      </label>
      <label className="block">
        <span className={labelCls}>Guest capacity</span>
        <input type="number" min="1" step="1" value={form.guestCapacity} onChange={(e) => onChange('guestCapacity', e.target.value)} className={inputCls} />
      </label>
      <label className="block">
        <span className={labelCls}>City</span>
        <input value={form.city} onChange={(e) => onChange('city', e.target.value)} className={inputCls} placeholder="Davao City" />
      </label>
      <label className="block">
        <span className={labelCls}>Venue</span>
        <input value={form.venue} onChange={(e) => onChange('venue', e.target.value)} className={inputCls} placeholder="Venue name" />
      </label>
    </div>
  )
}

const KANBAN_COLUMNS = [
  { id: 'draft',    label: 'Draft',    accentColor: '#4A5D75', statusMatch: 'draft' },
  { id: 'upcoming', label: 'Upcoming', accentColor: '#C8962E', statusMatch: 'upcoming' },
  { id: 'live',     label: 'Live',     accentColor: '#22C55E', statusMatch: 'live' },
  { id: 'past',     label: 'Past',     accentColor: '#2A3D58', statusMatch: 'past' },
]

function statusTone(status) {
  if (status === 'live')     return 'success'
  if (status === 'upcoming') return 'warning'
  if (status === 'draft')    return 'neutral'
  return 'neutral'
}

export default function ManageEventsPage() {
  const { permissions, refreshManageBootstrap } = useOutletContext()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [showDeleted, setShowDeleted] = useState(false)
  const [eventActionBusyKey, setEventActionBusyKey] = useState('')
  const [searchParams] = useSearchParams()
  const selectedEventId = searchParams.get('event')
  const navigate = useNavigate()
  const canAccessEvents = permissions.includes('events')

  const [activeTab, setActiveTab] = useState('draft')

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [createForm, setCreateForm] = useState(buildEventForm)
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingEventId, setEditingEventId] = useState('')
  const [editForm, setEditForm] = useState(buildEventForm)
  const [editError, setEditError] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    if (!canAccessEvents) { setLoading(false); return }
    let active = true
    async function loadEvents() {
      setLoading(true)
      setError('')
      try {
        const payload = await listManageEvents(
          { query, status: 'All', includeDeleted: showDeleted },
          { simulateLatency: false },
        )
        if (active) setEvents(payload)
      } catch {
        if (active) setError('Unable to load your events right now.')
      } finally {
        if (active) setLoading(false)
      }
    }
    loadEvents()
    return () => { active = false }
  }, [query, showDeleted, canAccessEvents])

  useEffect(() => {
    if (!canAccessEvents) return undefined
    const unsubscribe = subscribeManageEvents(
      { query, status: 'All', includeDeleted: showDeleted },
      setEvents,
    )
    return () => unsubscribe?.()
  }, [query, showDeleted, canAccessEvents])

  async function reloadEvents() {
    const payload = await listManageEvents(
      { query, status: 'All', includeDeleted: showDeleted },
      { simulateLatency: false },
    )
    setEvents(payload)
  }

  const createSeatingPreview = useMemo(() => computeSeatingPreview(createForm.guestCapacity), [createForm.guestCapacity])
  const editSeatingPreview   = useMemo(() => computeSeatingPreview(editForm.guestCapacity),   [editForm.guestCapacity])

  // Filter events by search query across all status columns
  const filteredEvents = useMemo(() => {
    if (!query.trim()) return events
    const q = query.toLowerCase()
    return events.filter((e) =>
      e.title.toLowerCase().includes(q) ||
      (e.city ?? '').toLowerCase().includes(q) ||
      (e.venue ?? '').toLowerCase().includes(q),
    )
  }, [events, query])

  function openCreateWizard() { setCreateForm(buildEventForm()); setWizardStep(1); setCreateError(''); setIsCreateOpen(true) }
  function closeCreateWizard() { if (creating) return; setIsCreateOpen(false); setWizardStep(1); setCreateError('') }
  function openEditModal(event) { setEditingEventId(event.id); setEditForm(buildEventForm(event)); setEditError(''); setIsEditOpen(true) }
  function closeEditModal() { if (savingEdit) return; setIsEditOpen(false); setEditingEventId(''); setEditError('') }

  function onWizardNext() {
    const msg = validateEventForm(createForm)
    if (msg) { setCreateError(msg); return }
    setCreateError(''); setWizardStep(2)
  }

  async function onCreateEvent() {
    const msg = validateEventForm(createForm)
    if (msg) { setCreateError(msg); setWizardStep(1); return }
    setCreating(true); setCreateError('')
    try {
      const payload = { title: createForm.title, date: createForm.date, city: createForm.city, venue: createForm.venue, guestCapacity: Number(createForm.guestCapacity) }
      const created = await createManageEvent(payload, { simulateLatency: false })
      if (typeof refreshManageBootstrap === 'function') await refreshManageBootstrap()
      setIsCreateOpen(false)
      navigate(`/manage/planner?event=${created.event.id}`)
    } catch (err) {
      setCreateError(err?.message ?? 'Unable to create event right now.')
    } finally { setCreating(false) }
  }

  async function onSaveEdit() {
    const msg = validateEventForm(editForm)
    if (msg) { setEditError(msg); return }
    if (!editingEventId) { setEditError('Unable to identify which event to edit.'); return }
    setSavingEdit(true); setEditError('')
    try {
      const payload = { title: editForm.title, date: editForm.date, city: editForm.city, venue: editForm.venue, guestCapacity: Number(editForm.guestCapacity) }
      await updateManageEvent(editingEventId, payload, { simulateLatency: false })
      if (typeof refreshManageBootstrap === 'function') await refreshManageBootstrap()
      await reloadEvents()
      setIsEditOpen(false); setEditingEventId('')
    } catch (err) {
      setEditError(err?.message ?? 'Unable to update event.')
    } finally { setSavingEdit(false) }
  }

  async function onEventLifecycleAction(event, action) {
    if (!event?.id) return
    setEventActionBusyKey(`${event.id}:${action}`)
    setError('')
    try {
      if (action === 'publish') {
        await publishManageEvent(event.id, { simulateLatency: false })
      } else if (action === 'live') {
        await goLiveManageEvent(event.id, { simulateLatency: false })
      } else if (action === 'archive') {
        await archiveManageEvent(event.id, { simulateLatency: false })
      } else if (action === 'delete') {
        await softDeleteManageEvent(event.id, { simulateLatency: false })
      } else if (action === 'restore') {
        await restoreManageEvent(event.id, { simulateLatency: false })
      }
      if (typeof refreshManageBootstrap === 'function') await refreshManageBootstrap()
      await reloadEvents()
    } catch (lifecycleError) {
      setError(lifecycleError?.message ?? 'Unable to update event status.')
    } finally {
      setEventActionBusyKey('')
    }
  }

  async function openEventConsole(eventId) {
    if (!eventId) return
    try {
      await setManageSelectedEvent(eventId, { simulateLatency: false })
      navigate(`/manage/dashboard?event=${eventId}`)
    } catch (selectionError) {
      setError(selectionError?.message ?? 'Unable to open event console.')
    }
  }

  function getLifecycleActions(event) {
    if (!event || event.deletedAt) return [{ id: 'restore', label: 'Restore', variant: 'secondary' }]
    const actions = []
    if (event.status === 'draft') actions.push({ id: 'publish', label: 'Publish', variant: 'secondary' })
    if (event.status === 'upcoming') actions.push({ id: 'live', label: 'Go Live', variant: 'secondary' })
    if (event.status === 'draft' || event.status === 'upcoming' || event.status === 'live') {
      actions.push({ id: 'archive', label: 'Archive', variant: 'ghost' })
    }
    actions.push({ id: 'delete', label: 'Delete', variant: 'danger' })
    return actions
  }

  if (loading) return <LoadingState label="Loading organizer events..." />
  if (!canAccessEvents) return <ErrorState message="Your current role has no event-management permission." />
  if (error) return <ErrorState message={error} />

  return (
    <section className="space-y-space-3">
      <ManageSectionHeader
        title="My Events"
        subtitle="Browse by status and use lifecycle controls to publish, go live, archive, delete, or restore."
        actions={<ManageButton onClick={openCreateWizard}>+ Create Event</ManageButton>}
      />

      <ManageFilterBar>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search event title, city, or venue..."
          className="h-10 flex-1 rounded-md border border-mgmt-border bg-mgmt-raised px-space-3 font-body text-body-sm text-mgmt-text placeholder:text-mgmt-dim focus:border-mgmt-gold/60 focus:outline-none transition-colors"
        />
        <ManageFilterChip active={!showDeleted} onClick={() => setShowDeleted(false)}>
          Active
        </ManageFilterChip>
        <ManageFilterChip active={showDeleted} onClick={() => setShowDeleted(true)}>
          Show Deleted
        </ManageFilterChip>
      </ManageFilterBar>

      {/* Mobile — tab switcher + stacked event list */}
      <div className="md:hidden">
        <div className="flex gap-space-1 rounded-xl border border-mgmt-border bg-mgmt-raised p-1">
          {KANBAN_COLUMNS.map((col) => {
            const count = filteredEvents.filter((e) => e.status === col.statusMatch).length
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => setActiveTab(col.id)}
                className={`flex-1 rounded-lg py-space-2 font-barlow text-[0.75rem] uppercase tracking-wide transition-colors duration-fast ${
                  activeTab === col.id
                    ? 'bg-gradient-accent-tint font-bold text-mgmt-gold'
                    : 'text-mgmt-muted hover:text-mgmt-text'
                }`}
              >
                {col.label}
                <span className={`ml-1 ${activeTab === col.id ? 'text-mgmt-gold' : 'text-mgmt-dim'}`}>
                  ({count})
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-space-3 space-y-space-2">
          {(() => {
            const col = KANBAN_COLUMNS.find((c) => c.id === activeTab)
            const colEvents = filteredEvents.filter((e) => e.status === col?.statusMatch)
            if (colEvents.length === 0) {
              return (
                <div className="flex items-center justify-center rounded-lg border border-dashed border-mgmt-border p-space-4">
                  <p className="font-barlow text-[0.75rem] uppercase tracking-wide text-mgmt-dim">No events</p>
                </div>
              )
            }
            return colEvents.map((event) => (
              <div
                key={event.id}
                className={`relative overflow-hidden rounded-lg border bg-mgmt-raised p-space-3 ${
                  selectedEventId === event.id
                    ? 'border-mgmt-gold/60 bg-mgmt-gold/5'
                    : 'border-mgmt-border'
                }`}
              >
                <span aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-5 w-5 rounded-tl-lg border-l-2 border-t-2 border-mgmt-gold/40" />
                <div className="flex items-start justify-between gap-space-2">
                  <p className="font-playfair text-[1.05rem] font-bold leading-tight text-mgmt-text">{event.title}</p>
                  <div className="flex flex-wrap justify-end gap-1">
                    <ManageBadge tone={statusTone(event.status)}>{event.status}</ManageBadge>
                    {event.deletedAt && <ManageBadge tone="danger">deleted</ManageBadge>}
                  </div>
                </div>
                <p className="mt-space-1 font-body text-[0.8rem] text-mgmt-muted">{event.venue}</p>
                <p className="font-barlow text-[0.75rem] uppercase tracking-wide text-mgmt-dim">
                  {event.city} · {formatDate(event.date)}
                </p>
                <p className="mt-space-1 font-barlow text-[0.75rem] uppercase tracking-wide text-mgmt-dim">
                  Capacity: {event.guestCapacity}
                </p>
                <div className="mt-space-2 grid grid-cols-2 gap-space-2">
                  <ManageButton
                    variant="ghost"
                    onClick={() => openEditModal(event)}
                    className="text-center text-[0.75rem]"
                    disabled={Boolean(event.deletedAt)}
                  >
                    Edit
                  </ManageButton>
                  <ManageButton
                    variant={selectedEventId === event.id ? 'primary' : 'secondary'}
                    onClick={() => { void openEventConsole(event.id) }}
                    className="text-center text-[0.75rem]"
                    disabled={Boolean(event.deletedAt)}
                  >
                    {selectedEventId === event.id ? 'Active' : 'Console'}
                  </ManageButton>
                </div>
                <div className="mt-space-2 flex flex-wrap gap-space-2">
                  {getLifecycleActions(event).map((action) => {
                    const busy = eventActionBusyKey === `${event.id}:${action.id}`
                    return (
                      <ManageButton
                        key={action.id}
                        variant={action.variant}
                        className="text-[0.7rem]"
                        disabled={Boolean(eventActionBusyKey)}
                        onClick={() => onEventLifecycleAction(event, action.id)}
                      >
                        {busy ? 'Working...' : action.label}
                      </ManageButton>
                    )
                  })}
                </div>
              </div>
            ))
          })()}
        </div>
      </div>

      {/* Desktop — Kanban board with 4 status columns */}
      <div className="hidden md:block">
      <KanbanBoard>
        {KANBAN_COLUMNS.map((col) => {
          const colEvents = filteredEvents.filter((e) => e.status === col.statusMatch)
          return (
            <KanbanColumn
              key={col.id}
              id={col.id}
              label={col.label}
              count={colEvents.length}
              accentColor={col.accentColor}
            >
              {colEvents.length === 0 && (
                <div className="flex items-center justify-center rounded-lg border border-dashed border-mgmt-border p-space-3">
                  <p className="font-barlow text-[0.75rem] uppercase tracking-wide text-mgmt-dim">No events</p>
                </div>
              )}
              {colEvents.map((event) => (
                <TiltCard key={event.id} maxTilt={4}>
                  <div className={`relative overflow-hidden rounded-lg border bg-mgmt-raised p-space-3 transition-colors duration-fast ${
                    selectedEventId === event.id
                      ? 'border-mgmt-gold/60 bg-mgmt-gold/5'
                      : 'border-mgmt-border hover:border-mgmt-border-bright'
                  }`}>
                    {/* Art Deco corner bracket */}
                    <span aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-5 w-5 rounded-tl-lg border-l-2 border-t-2 border-mgmt-gold/40" />

                    <div className="flex items-start justify-between gap-space-1">
                      <p className="font-playfair text-[1.05rem] font-bold leading-tight text-mgmt-text">
                        {event.title}
                      </p>
                      <div className="flex flex-wrap justify-end gap-1">
                        <ManageBadge tone={statusTone(event.status)}>{event.status}</ManageBadge>
                        {event.deletedAt && <ManageBadge tone="danger">deleted</ManageBadge>}
                      </div>
                    </div>

                    <p className="mt-space-1 font-body text-[0.8rem] text-mgmt-muted">{event.venue}</p>
                    <p className="font-barlow text-[0.75rem] uppercase tracking-wide text-mgmt-dim">
                      {event.city} · {formatDate(event.date)}
                    </p>
                    <p className="mt-space-1 font-barlow text-[0.75rem] uppercase tracking-wide text-mgmt-dim">
                      Capacity: {event.guestCapacity}
                    </p>

                    <div className="mt-space-2 grid grid-cols-2 gap-space-2">
                      <ManageButton
                        variant="ghost"
                        onClick={() => openEditModal(event)}
                        className="text-center text-[0.75rem]"
                        disabled={Boolean(event.deletedAt)}
                      >
                        Edit
                      </ManageButton>
                      <ManageButton
                        variant={selectedEventId === event.id ? 'primary' : 'secondary'}
                        onClick={() => { void openEventConsole(event.id) }}
                        className="text-center text-[0.75rem]"
                        disabled={Boolean(event.deletedAt)}
                      >
                        {selectedEventId === event.id ? 'Active' : 'Console'}
                      </ManageButton>
                    </div>
                    <div className="mt-space-2 flex flex-wrap gap-space-2">
                      {getLifecycleActions(event).map((action) => {
                        const busy = eventActionBusyKey === `${event.id}:${action.id}`
                        return (
                          <ManageButton
                            key={action.id}
                            variant={action.variant}
                            className="text-[0.7rem]"
                            disabled={Boolean(eventActionBusyKey)}
                            onClick={() => onEventLifecycleAction(event, action.id)}
                          >
                            {busy ? 'Working...' : action.label}
                          </ManageButton>
                        )
                      })}
                    </div>
                  </div>
                </TiltCard>
              ))}
            </KanbanColumn>
          )
        })}
      </KanbanBoard>
      </div>

      {/* Create Event Modal */}
      <ManageDialog isOpen={isCreateOpen} onClose={closeCreateWizard} ariaLabel="Create new event">
            <div className="flex items-center justify-between gap-space-2">
              <div>
                <p className="font-playfair text-heading-md font-bold text-mgmt-text">Create New Event</p>
                <p className="font-barlow text-[0.8125rem] uppercase tracking-wide text-mgmt-muted">Step {wizardStep} of 2</p>
              </div>
              <ManageBadge tone="neutral">Status on create: draft</ManageBadge>
            </div>

            {createError && (
              <p className="mt-space-3 rounded-xl border border-red-200 bg-red-50 p-space-2 font-body text-body-sm text-red-700">
                {createError}
              </p>
            )}

            {wizardStep === 1 && <EventFields form={createForm} onChange={(f, v) => { setCreateError(''); setCreateForm((c) => ({ ...c, [f]: v })) }} />}

            {wizardStep === 2 && (
              <div className="mt-space-3 space-y-space-3">
                <ManageCard>
                  <p className="font-playfair text-heading-sm font-bold text-mgmt-text">Review Event Details</p>
                  <div className="mt-space-2 grid gap-space-2 md:grid-cols-2">
                    {[['Title', createForm.title], ['Date', createForm.date], ['City', createForm.city], ['Venue', createForm.venue], ['Capacity', createForm.guestCapacity], ['Status', 'draft']].map(([k, v]) => (
                      <p key={k} className="font-body text-body-sm text-mgmt-text">
                        <span className="font-barlow text-[0.75rem] uppercase tracking-wide text-mgmt-muted">{k}: </span>{v}
                      </p>
                    ))}
                  </div>
                </ManageCard>
                <ManageCard>
                  <p className="font-playfair text-heading-sm font-bold text-mgmt-text">Auto-generated Seating</p>
                  <p className="mt-space-1 font-body text-body-sm text-mgmt-muted">
                    {createSeatingPreview.tableCount} table(s) x {createSeatingPreview.seatsPerTable} seats = {createSeatingPreview.totalSeats} total seats
                  </p>
                  <p className="mt-space-1 font-body text-caption-lg text-mgmt-dim">Adjust tables and seats later in Seating & Tables.</p>
                </ManageCard>
              </div>
            )}

            <div className="mt-space-4 flex items-center justify-between gap-space-2">
              <ManageButton variant="secondary" onClick={closeCreateWizard} disabled={creating}>Cancel</ManageButton>
              <div className="flex items-center gap-space-2">
                {wizardStep === 2 && <ManageButton variant="secondary" onClick={() => setWizardStep(1)} disabled={creating}>Back</ManageButton>}
                {wizardStep === 1
                  ? <ManageButton onClick={onWizardNext}>Next</ManageButton>
                  : <ManageButton onClick={onCreateEvent} disabled={creating}>{creating ? 'Creating...' : 'Create Event'}</ManageButton>
                }
              </div>
            </div>
      </ManageDialog>

      {/* Edit Event Modal */}
      <ManageDialog isOpen={isEditOpen} onClose={closeEditModal} ariaLabel="Edit event">
            <div className="flex items-center justify-between gap-space-2">
              <div>
                <p className="font-playfair text-heading-md font-bold text-mgmt-text">Edit Event</p>
                <p className="font-body text-caption-lg text-mgmt-muted">Update event details and capacity safely.</p>
              </div>
              <ManageBadge tone="info">Safe capacity mode</ManageBadge>
            </div>

            {editError && (
              <p className="mt-space-3 rounded-xl border border-red-200 bg-red-50 p-space-2 font-body text-body-sm text-red-700">
                {editError}
              </p>
            )}

            <EventFields form={editForm} onChange={(f, v) => { setEditError(''); setEditForm((c) => ({ ...c, [f]: v })) }} />

            <ManageCard className="mt-space-3">
              <p className="font-playfair text-heading-sm font-bold text-mgmt-text">Capacity & Seating Safety</p>
              <p className="mt-space-1 font-body text-body-sm text-mgmt-muted">
                Preview: {editSeatingPreview.tableCount} table(s) x {editSeatingPreview.seatsPerTable} seats = {editSeatingPreview.totalSeats} seats.
              </p>
              <p className="mt-space-1 font-body text-caption-lg text-mgmt-dim">
                Existing seat assignments are preserved. If capacity is reduced, only empty tables are removed.
              </p>
            </ManageCard>

            <div className="mt-space-4 flex items-center justify-between gap-space-2">
              <ManageButton variant="secondary" onClick={closeEditModal} disabled={savingEdit}>Cancel</ManageButton>
              <ManageButton onClick={onSaveEdit} disabled={savingEdit}>{savingEdit ? 'Saving...' : 'Save Changes'}</ManageButton>
            </div>
      </ManageDialog>
    </section>
  )
}
