import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import {
  ManageBadge,
  ManageButton,
  ManageCard,
  ManageFilterBar,
  ManageSectionHeader,
} from '@/components/ui/ManagePrimitives'
import { createManageIncident, listManageIncidents, updateManageIncidentStatus } from '@/services'

const inputCls = 'rounded-md border border-mgmt-border bg-mgmt-raised px-space-3 text-body-sm text-mgmt-text placeholder:text-mgmt-dim focus:border-mgmt-gold/60 focus:outline-none focus:ring-1 focus:ring-mgmt-gold/30'

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

  const loadIncidents = useCallback(async () => {
    if (!selectedEventId) return
    const payload = await listManageIncidents(selectedEventId, { status: statusFilter }, { simulateLatency: false })
    setIncidents(payload)
  }, [selectedEventId, statusFilter])

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
  }, [selectedEventId, statusFilter, canManageIncidents, loadIncidents])

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
      tone: isOverdue ? 'danger' : 'neutral',
    }
  }

  if (!selectedEventId) return <EmptyState message="Select an event first to manage incidents." />
  if (loading) return <LoadingState label="Loading incident log..." />
  if (!canManageIncidents) return <ErrorState message="Your current role does not have incident access." />
  if (error && incidents.length === 0) return <ErrorState message={error} />

  return (
    <section className="space-y-space-4">
      <ManageSectionHeader title="Incident Log" subtitle="Track operational, technical, and safety issues in real time." />
      {error && <ErrorState message={error} />}

      <ManageCard>
        <form onSubmit={onCreateIncident}>
          <p className="font-playfair text-heading-sm text-mgmt-text">Report new incident</p>
          <div className="mt-space-2 grid gap-space-2 md:grid-cols-4">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Incident title"
              className={`h-10 md:col-span-4 ${inputCls}`}
            />
            <select value={type} onChange={(event) => setType(event.target.value)} className={`h-10 ${inputCls}`}>
              <option value="logistics">Logistics</option>
              <option value="medical">Medical</option>
              <option value="security">Security</option>
              <option value="technical">Technical</option>
            </select>
            <select value={severity} onChange={(event) => setSeverity(event.target.value)} className={`h-10 ${inputCls}`}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input
              value={assignee}
              onChange={(event) => setAssignee(event.target.value)}
              placeholder="Assignee (optional)"
              className={`h-10 ${inputCls}`}
            />
            <ManageButton type="submit" variant="danger">Add Incident</ManageButton>
          </div>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="Action notes"
            className={`mt-space-2 w-full py-space-2 ${inputCls}`}
          />
        </form>
      </ManageCard>

      <ManageFilterBar>
        <span className="font-barlow text-[0.8125rem] uppercase tracking-wide text-mgmt-muted">Status</span>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={`h-9 ${inputCls}`}>
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="escalated">Escalated</option>
          <option value="resolved">Resolved</option>
        </select>
      </ManageFilterBar>

      <div className="space-y-space-2">
        {incidents.length === 0 && <EmptyState message="No incidents logged for this event." />}
        {incidents.map((incident) => {
          const slaBadge = getSlaBadge(incident)
          return (
            <ManageCard key={incident.id}>
              <div className="space-y-space-2">
                <div className="flex items-start justify-between gap-space-2">
                  <div>
                    <p className="font-playfair text-heading-sm text-mgmt-text">{incident.title}</p>
                    <p className="font-body text-caption-lg text-mgmt-muted">
                      {incident.type} - {incident.severity} - {incident.reportedBy} - {formatDateTime(incident.reportedAt)}
                    </p>
                  </div>
                  <ManageBadge tone={incident.status === 'resolved' ? 'success' : incident.status === 'escalated' ? 'danger' : 'neutral'}>
                    {incident.status}
                  </ManageBadge>
                </div>

                <div>
                  {incident.note && <p className="font-body text-body-sm text-mgmt-muted">{incident.note}</p>}
                  {incident.resolutionNote && (
                    <p className="mt-space-1 font-body text-caption-lg text-mgmt-dim">Resolution: {incident.resolutionNote}</p>
                  )}
                </div>

                <div className="grid gap-space-2 md:grid-cols-4">
                  <input
                    value={incident.assignee ?? ''}
                    onChange={(event) => onAssigneeChange(incident.id, event.target.value)}
                    placeholder="Assign owner"
                    className={`h-9 ${inputCls}`}
                  />
                  <select
                    value={incident.status}
                    onChange={(event) => onChangeStatus(incident, event.target.value)}
                    className={`h-9 ${inputCls}`}
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
                    className={`h-9 ${inputCls}`}
                  />
                  <ManageButton type="button" onClick={() => onChangeStatus(incident, incident.status)}>
                    Save Update
                  </ManageButton>
                </div>

                {slaBadge && <ManageBadge tone={slaBadge.tone}>{slaBadge.text}</ManageBadge>}
              </div>
            </ManageCard>
          )
        })}
      </div>
    </section>
  )
}
