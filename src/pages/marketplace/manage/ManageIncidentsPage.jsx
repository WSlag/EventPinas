import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { SectionHeader, SurfaceCard } from '@/components/ui/MarketplacePrimitives'
import { createManageIncident, listManageIncidents, updateManageIncidentStatus } from '@/services'

function formatDateTime(value) {
  return new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function ManageIncidentsPage() {
  const { selectedEventId, permissions } = useOutletContext()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [incidents, setIncidents] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [title, setTitle] = useState('')
  const [type, setType] = useState('logistics')
  const [severity, setSeverity] = useState('medium')
  const [note, setNote] = useState('')
  const [assignee, setAssignee] = useState('')
  const [resolutionNotes, setResolutionNotes] = useState({})

  const canManageIncidents = permissions.includes('incidents')

  async function loadIncidents() {
    if (!selectedEventId) return
    const payload = await listManageIncidents(selectedEventId, { status: statusFilter }, { simulateLatency: false })
    setIncidents(payload)
  }

  useEffect(() => {
    if (!selectedEventId) return
    if (!canManageIncidents) {
      setLoading(false)
      return
    }

    let active = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        await loadIncidents()
      } catch {
        if (active) setError('Unable to load incidents right now.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [selectedEventId, statusFilter, canManageIncidents])

  async function onCreateIncident(event) {
    event.preventDefault()
    if (!title.trim()) return
    setError('')
    try {
      await createManageIncident(
        selectedEventId,
        {
          title: title.trim(),
          type,
          severity,
          note: note.trim(),
          reportedBy: 'Organizer Console',
          assignee: assignee.trim(),
        },
        { simulateLatency: false },
      )
      setTitle('')
      setNote('')
      setAssignee('')
      await loadIncidents()
    } catch (createError) {
      setError(createError?.message ?? 'Unable to create incident.')
    }
  }

  async function onChangeStatus(incident, status) {
    setError('')
    try {
      await updateManageIncidentStatus(
        selectedEventId,
        incident.id,
        {
          status,
          assignee: incident.assignee,
          resolutionNote: resolutionNotes[incident.id] ?? '',
        },
        { simulateLatency: false },
      )
      await loadIncidents()
    } catch (updateError) {
      setError(updateError?.message ?? 'Unable to update incident status.')
    }
  }

  function onResolutionChange(incidentId, value) {
    setResolutionNotes((current) => ({ ...current, [incidentId]: value }))
  }

  function onAssigneeChange(incidentId, value) {
    setIncidents((current) => current.map((incident) => (
      incident.id === incidentId ? { ...incident, assignee: value } : incident
    )))
  }

  function getSlaBadge(incident) {
    if (!incident.slaDueAt || incident.status === 'resolved') return null
    const isOverdue = new Date(incident.slaDueAt).getTime() < Date.now()
    return {
      text: isOverdue ? 'SLA overdue' : `SLA due ${formatDateTime(incident.slaDueAt)}`,
      className: isOverdue ? 'bg-primary-50 text-primary-600' : 'bg-neutral-100 text-neutral-600',
    }
  }

  if (!selectedEventId) return <EmptyState message="Select an event first to manage incidents." />
  if (loading) return <LoadingState label="Loading incident log..." />
  if (!canManageIncidents) return <ErrorState message="Your current role does not have incident access." />
  if (error && incidents.length === 0) return <ErrorState message={error} />

  return (
    <section className="space-y-space-4">
      <SectionHeader title="Incident Log" subtitle="Track operational, technical, and safety issues in real time." />
      {error && <ErrorState message={error} />}

      <form onSubmit={onCreateIncident} className="rounded-2xl border border-neutral-200 bg-white p-space-4">
        <p className="font-display text-heading-sm text-neutral-900">Report new incident</p>
        <div className="mt-space-2 grid gap-space-2 md:grid-cols-4">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Incident title"
            className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm md:col-span-4"
          />
          <select value={type} onChange={(event) => setType(event.target.value)} className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm">
            <option value="logistics">Logistics</option>
            <option value="medical">Medical</option>
            <option value="security">Security</option>
            <option value="technical">Technical</option>
          </select>
          <select value={severity} onChange={(event) => setSeverity(event.target.value)} className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            value={assignee}
            onChange={(event) => setAssignee(event.target.value)}
            placeholder="Assignee (optional)"
            className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
          />
          <button type="submit" className="rounded-full bg-primary-400 px-space-4 py-space-2 font-display text-label-md text-white">
            Add Incident
          </button>
        </div>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          placeholder="Action notes"
          className="mt-space-2 w-full rounded-md border border-neutral-200 bg-white px-space-3 py-space-2 text-body-sm"
        />
      </form>

      <div className="flex items-center gap-space-2">
        <span className="font-body text-caption-lg text-neutral-500">Status</span>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-9 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm">
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="escalated">Escalated</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="space-y-space-2">
        {incidents.length === 0 && <EmptyState message="No incidents logged for this event." />}
        {incidents.map((incident) => {
          const slaBadge = getSlaBadge(incident)
          return (
            <SurfaceCard key={incident.id}>
              <div className="space-y-space-2">
                <div className="flex items-start justify-between gap-space-2">
                  <div>
                    <p className="font-display text-heading-sm text-neutral-900">{incident.title}</p>
                    <p className="font-body text-caption-lg text-neutral-500">
                      {incident.type} · {incident.severity} · {incident.reportedBy} · {formatDateTime(incident.reportedAt)}
                    </p>
                  </div>
                  <span className={`rounded-full px-space-3 py-space-1 font-display text-label-sm ${
                    incident.status === 'resolved'
                      ? 'bg-green-100 text-success'
                      : incident.status === 'escalated'
                        ? 'bg-primary-50 text-primary-600'
                        : 'bg-neutral-100 text-neutral-700'
                  }`}
                  >
                    {incident.status}
                  </span>
                </div>

                <div>
                  {incident.note && <p className="font-body text-body-sm text-neutral-600">{incident.note}</p>}
                  {incident.resolutionNote && (
                    <p className="mt-space-1 font-body text-caption-lg text-neutral-500">Resolution: {incident.resolutionNote}</p>
                  )}
                </div>

                <div className="grid gap-space-2 md:grid-cols-4">
                  <input
                    value={incident.assignee ?? ''}
                    onChange={(event) => onAssigneeChange(incident.id, event.target.value)}
                    placeholder="Assign owner"
                    className="h-9 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                  />
                  <select
                    value={incident.status}
                    onChange={(event) => onChangeStatus(incident, event.target.value)}
                    className="h-9 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                  >
                    <option value="open">Open</option>
                    <option value="investigating">Investigating</option>
                    <option value="escalated">Escalated</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <input
                    value={resolutionNotes[incident.id] ?? ''}
                    onChange={(event) => onResolutionChange(incident.id, event.target.value)}
                    placeholder="Resolution note"
                    className="h-9 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                  />
                  <button
                    type="button"
                    onClick={() => onChangeStatus(incident, incident.status)}
                    className="rounded-full bg-info px-space-3 py-space-1 font-display text-label-sm text-white"
                  >
                    Save Update
                  </button>
                </div>

                {slaBadge && (
                  <span className={`inline-flex rounded-full px-space-2 py-space-1 text-label-sm ${slaBadge.className}`}>
                    {slaBadge.text}
                  </span>
                )}
              </div>
            </SurfaceCard>
          )
        })}
      </div>
    </section>
  )
}
