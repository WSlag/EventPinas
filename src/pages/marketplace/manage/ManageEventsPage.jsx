import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import { LoadingState, ErrorState } from '@/components/ui/PageStates'
import {
  ManageBadge,
  ManageButton,
  ManageCard,
  ManageFilterBar,
  ManageSectionHeader,
} from '@/components/ui/ManagePrimitives'
import { createManageEvent, listManageEvents, updateManageEvent } from '@/services'

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
    if (!String(form[field] ?? '').trim()) {
      return message
    }
  }
  const capacity = Number(form.guestCapacity)
  if (!Number.isInteger(capacity) || capacity < 1) {
    return 'Guest capacity must be an integer greater than or equal to 1.'
  }
  return ''
}

function computeSeatingPreview(guestCapacity) {
  const seatsPerTable = 10
  const capacity = Number(guestCapacity)
  if (!Number.isInteger(capacity) || capacity < 1) {
    return { seatsPerTable, tableCount: 0, totalSeats: 0 }
  }
  const tableCount = Math.ceil(capacity / seatsPerTable)
  return {
    seatsPerTable,
    tableCount,
    totalSeats: tableCount * seatsPerTable,
  }
}

function EventFields({ form, onChange }) {
  return (
    <div className="mt-space-3 grid gap-space-2 md:grid-cols-2">
      <label className="block md:col-span-2">
        <span className="font-body text-label-sm text-neutral-700">Event title</span>
        <input
          value={form.title}
          onChange={(event) => onChange('title', event.target.value)}
          className="mt-space-1 h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
          placeholder="Example: Rivera Family Reunion 2026"
        />
      </label>

      <label className="block">
        <span className="font-body text-label-sm text-neutral-700">Event date</span>
        <input
          type="date"
          value={form.date}
          onChange={(event) => onChange('date', event.target.value)}
          className="mt-space-1 h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
        />
      </label>

      <label className="block">
        <span className="font-body text-label-sm text-neutral-700">Guest capacity</span>
        <input
          type="number"
          min="1"
          step="1"
          value={form.guestCapacity}
          onChange={(event) => onChange('guestCapacity', event.target.value)}
          className="mt-space-1 h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
        />
      </label>

      <label className="block">
        <span className="font-body text-label-sm text-neutral-700">City</span>
        <input
          value={form.city}
          onChange={(event) => onChange('city', event.target.value)}
          className="mt-space-1 h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
          placeholder="Davao City"
        />
      </label>

      <label className="block">
        <span className="font-body text-label-sm text-neutral-700">Venue</span>
        <input
          value={form.venue}
          onChange={(event) => onChange('venue', event.target.value)}
          className="mt-space-1 h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
          placeholder="Venue name"
        />
      </label>
    </div>
  )
}

export default function ManageEventsPage() {
  const { permissions, refreshManageBootstrap } = useOutletContext()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [searchParams] = useSearchParams()
  const selectedEventId = searchParams.get('event')
  const navigate = useNavigate()
  const canAccessEvents = permissions.includes('events')

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
    if (!canAccessEvents) {
      setLoading(false)
      return
    }
    let active = true
    async function loadEvents() {
      setLoading(true)
      setError('')
      try {
        const payload = await listManageEvents({ query, status }, { simulateLatency: false })
        if (active) setEvents(payload)
      } catch {
        if (active) setError('Unable to load your events right now.')
      } finally {
        if (active) setLoading(false)
      }
    }
    loadEvents()
    return () => {
      active = false
    }
  }, [query, status, canAccessEvents])

  async function reloadEvents() {
    const payload = await listManageEvents({ query, status }, { simulateLatency: false })
    setEvents(payload)
  }

  function openEventConsole(eventId) {
    navigate(`/manage/dashboard?event=${eventId}`)
  }

  function openCreateWizard() {
    setCreateForm(buildEventForm())
    setWizardStep(1)
    setCreateError('')
    setIsCreateOpen(true)
  }

  function closeCreateWizard() {
    if (creating) return
    setIsCreateOpen(false)
    setWizardStep(1)
    setCreateError('')
  }

  function updateCreateField(field, value) {
    setCreateError('')
    setCreateForm((current) => ({ ...current, [field]: value }))
  }

  function openEditModal(event) {
    setEditingEventId(event.id)
    setEditForm(buildEventForm(event))
    setEditError('')
    setIsEditOpen(true)
  }

  function closeEditModal() {
    if (savingEdit) return
    setIsEditOpen(false)
    setEditingEventId('')
    setEditError('')
  }

  function updateEditField(field, value) {
    setEditError('')
    setEditForm((current) => ({ ...current, [field]: value }))
  }

  const createSeatingPreview = useMemo(
    () => computeSeatingPreview(createForm.guestCapacity),
    [createForm.guestCapacity],
  )

  const editSeatingPreview = useMemo(
    () => computeSeatingPreview(editForm.guestCapacity),
    [editForm.guestCapacity],
  )

  function onWizardNext() {
    const validationMessage = validateEventForm(createForm)
    if (validationMessage) {
      setCreateError(validationMessage)
      return
    }
    setCreateError('')
    setWizardStep(2)
  }

  async function onCreateEvent() {
    const validationMessage = validateEventForm(createForm)
    if (validationMessage) {
      setCreateError(validationMessage)
      setWizardStep(1)
      return
    }

    setCreating(true)
    setCreateError('')
    try {
      const payload = {
        title: createForm.title,
        date: createForm.date,
        city: createForm.city,
        venue: createForm.venue,
        guestCapacity: Number(createForm.guestCapacity),
      }
      const created = await createManageEvent(payload, { simulateLatency: false })
      if (typeof refreshManageBootstrap === 'function') {
        await refreshManageBootstrap()
      }
      setIsCreateOpen(false)
      navigate(`/manage/planner?event=${created.event.id}`)
    } catch (createEventError) {
      setCreateError(createEventError?.message ?? 'Unable to create event right now.')
    } finally {
      setCreating(false)
    }
  }

  async function onSaveEdit() {
    const validationMessage = validateEventForm(editForm)
    if (validationMessage) {
      setEditError(validationMessage)
      return
    }
    if (!editingEventId) {
      setEditError('Unable to identify which event to edit.')
      return
    }

    setSavingEdit(true)
    setEditError('')
    try {
      const payload = {
        title: editForm.title,
        date: editForm.date,
        city: editForm.city,
        venue: editForm.venue,
        guestCapacity: Number(editForm.guestCapacity),
      }
      await updateManageEvent(editingEventId, payload, { simulateLatency: false })
      if (typeof refreshManageBootstrap === 'function') {
        await refreshManageBootstrap()
      }
      await reloadEvents()
      setIsEditOpen(false)
      setEditingEventId('')
    } catch (updateError) {
      setEditError(updateError?.message ?? 'Unable to update event right now.')
    } finally {
      setSavingEdit(false)
    }
  }

  if (loading) return <LoadingState label="Loading organizer events..." />
  if (!canAccessEvents) return <ErrorState message="Your current role has no event-management permission." />
  if (error) return <ErrorState message={error} />

  return (
    <section className="space-y-space-3">
      <ManageSectionHeader
        title="My Events"
        subtitle="Choose an event and jump directly into operational modules."
        actions={<ManageButton onClick={openCreateWizard}>+ Create Event</ManageButton>}
      />

      <ManageFilterBar>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search event title, city, or venue"
          className="h-10 flex-1 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
        >
          <option value="All">All statuses</option>
          <option value="live">Live</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
          <option value="draft">Draft</option>
        </select>
      </ManageFilterBar>

      <div className="grid gap-space-3 md:grid-cols-2">
        {events.map((event) => (
          <ManageCard key={event.id}>
            <div className="flex items-start justify-between gap-space-2">
              <div>
                <p className="font-display text-heading-md text-neutral-900">{event.title}</p>
                <p className="mt-space-1 font-body text-body-sm text-neutral-500">{event.venue}</p>
                <p className="font-body text-caption-lg text-neutral-500">{event.city} - {formatDate(event.date)}</p>
              </div>
              <ManageBadge tone={event.status === 'live' ? 'success' : 'neutral'}>
                {event.status}
              </ManageBadge>
            </div>

            <div className="mt-space-3 flex items-center justify-between gap-space-2">
              <p className="font-body text-caption-lg text-neutral-500">Capacity: {event.guestCapacity}</p>
              <div className="flex items-center gap-space-2">
                <ManageButton variant="ghost" onClick={() => openEditModal(event)}>
                  Edit Event
                </ManageButton>
                <ManageButton
                  onClick={() => openEventConsole(event.id)}
                  variant={selectedEventId === event.id ? 'primary' : 'secondary'}
                >
                  {selectedEventId === event.id ? 'Active' : 'Open Console'}
                </ManageButton>
              </div>
            </div>
          </ManageCard>
        ))}
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 p-space-3 md:p-space-6" onClick={closeCreateWizard} role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Create new event"
            className="mx-auto mt-[4vh] w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white p-space-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-space-2">
              <div>
                <p className="font-display text-heading-md text-neutral-900">Create New Event</p>
                <p className="font-body text-caption-lg text-neutral-500">Step {wizardStep} of 2</p>
              </div>
              <ManageBadge tone="info">Status on create: draft</ManageBadge>
            </div>

            {createError && (
              <p className="mt-space-3 rounded-xl border border-red-200 bg-red-50 p-space-2 font-body text-body-sm text-error">
                {createError}
              </p>
            )}

            {wizardStep === 1 && <EventFields form={createForm} onChange={updateCreateField} />}

            {wizardStep === 2 && (
              <div className="mt-space-3 space-y-space-3">
                <ManageCard className="bg-neutral-50">
                  <p className="font-display text-heading-sm text-neutral-900">Review Event Details</p>
                  <div className="mt-space-2 grid gap-space-2 md:grid-cols-2">
                    <p className="font-body text-body-sm text-neutral-700"><span className="font-display">Title:</span> {createForm.title}</p>
                    <p className="font-body text-body-sm text-neutral-700"><span className="font-display">Date:</span> {createForm.date}</p>
                    <p className="font-body text-body-sm text-neutral-700"><span className="font-display">City:</span> {createForm.city}</p>
                    <p className="font-body text-body-sm text-neutral-700"><span className="font-display">Venue:</span> {createForm.venue}</p>
                    <p className="font-body text-body-sm text-neutral-700"><span className="font-display">Guest Capacity:</span> {createForm.guestCapacity}</p>
                    <p className="font-body text-body-sm text-neutral-700"><span className="font-display">Initial Status:</span> draft</p>
                  </div>
                </ManageCard>

                <ManageCard>
                  <p className="font-display text-heading-sm text-neutral-900">Auto-generated Seating Plan</p>
                  <p className="mt-space-1 font-body text-body-sm text-neutral-600">
                    {createSeatingPreview.tableCount} table(s) x {createSeatingPreview.seatsPerTable} seats each = {createSeatingPreview.totalSeats} total seats
                  </p>
                  <p className="mt-space-1 font-body text-caption-lg text-neutral-500">
                    You can fine-tune tables and seat assignments later in Seating & Tables.
                  </p>
                </ManageCard>
              </div>
            )}

            <div className="mt-space-4 flex items-center justify-between gap-space-2">
              <ManageButton variant="secondary" onClick={closeCreateWizard} disabled={creating}>
                Cancel
              </ManageButton>
              <div className="flex items-center gap-space-2">
                {wizardStep === 2 && (
                  <ManageButton variant="secondary" onClick={() => setWizardStep(1)} disabled={creating}>
                    Back
                  </ManageButton>
                )}
                {wizardStep === 1 ? (
                  <ManageButton onClick={onWizardNext}>Next</ManageButton>
                ) : (
                  <ManageButton onClick={onCreateEvent} disabled={creating}>
                    {creating ? 'Creating...' : 'Create Event'}
                  </ManageButton>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 p-space-3 md:p-space-6" onClick={closeEditModal} role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Edit event"
            className="mx-auto mt-[4vh] w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white p-space-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-space-2">
              <div>
                <p className="font-display text-heading-md text-neutral-900">Edit Event</p>
                <p className="font-body text-caption-lg text-neutral-500">Update event details and capacity safely.</p>
              </div>
              <ManageBadge tone="info">Safe capacity mode</ManageBadge>
            </div>

            {editError && (
              <p className="mt-space-3 rounded-xl border border-red-200 bg-red-50 p-space-2 font-body text-body-sm text-error">
                {editError}
              </p>
            )}

            <EventFields form={editForm} onChange={updateEditField} />

            <ManageCard className="mt-space-3">
              <p className="font-display text-heading-sm text-neutral-900">Capacity and Seating Safety</p>
              <p className="mt-space-1 font-body text-body-sm text-neutral-600">
                Capacity preview: {editSeatingPreview.tableCount} table(s) x {editSeatingPreview.seatsPerTable} seats
                = {editSeatingPreview.totalSeats} seats.
              </p>
              <p className="mt-space-1 font-body text-caption-lg text-neutral-500">
                Existing seat assignments are preserved. If capacity is reduced, only empty tables are removed.
              </p>
            </ManageCard>

            <div className="mt-space-4 flex items-center justify-between gap-space-2">
              <ManageButton variant="secondary" onClick={closeEditModal} disabled={savingEdit}>
                Cancel
              </ManageButton>
              <ManageButton onClick={onSaveEdit} disabled={savingEdit}>
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </ManageButton>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
