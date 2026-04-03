import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { SectionHeader, SurfaceCard } from '@/components/ui/MarketplacePrimitives'
import { listManageStaff, toggleManageStaffStatus, updateManageStaffRole } from '@/services'

const staffRoleOptions = [
  { id: 'admin', label: 'Admin' },
  { id: 'checkinLead', label: 'Check-in Lead' },
  { id: 'seatingLead', label: 'Seating Lead' },
  { id: 'staff', label: 'Staff' },
]

export default function ManageStaffPage() {
  const { selectedEventId, permissions } = useOutletContext()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [staff, setStaff] = useState([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')

  const canManageStaff = permissions.includes('staff')

  async function loadStaff() {
    if (!selectedEventId) return
    const payload = await listManageStaff(selectedEventId, { query, status }, { simulateLatency: false })
    setStaff(payload)
  }

  useEffect(() => {
    if (!selectedEventId) return
    if (!canManageStaff) {
      setLoading(false)
      return
    }

    let active = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        await loadStaff()
      } catch {
        if (active) setError('Unable to load staff assignments.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [selectedEventId, query, status, canManageStaff])

  async function onRoleChange(staffId, nextRole) {
    setError('')
    try {
      await updateManageStaffRole(selectedEventId, staffId, nextRole, { simulateLatency: false })
      await loadStaff()
    } catch (updateError) {
      setError(updateError?.message ?? 'Unable to update staff role.')
    }
  }

  async function onToggleStatus(staffId) {
    setError('')
    try {
      await toggleManageStaffStatus(selectedEventId, staffId, { simulateLatency: false })
      await loadStaff()
    } catch (toggleError) {
      setError(toggleError?.message ?? 'Unable to update staff status.')
    }
  }

  if (!selectedEventId) return <EmptyState message="Select an event first to manage staff." />
  if (loading) return <LoadingState label="Loading staff roster..." />
  if (!canManageStaff) return <ErrorState message="Only admin role can modify staff and permissions." />
  if (error && staff.length === 0) return <ErrorState message={error} />

  return (
    <section className="space-y-space-4">
      <SectionHeader title="Staff & Permissions" subtitle="Apply least-privilege roles to gate check-in and seating actions." />
      {error && <ErrorState message={error} />}

      <div className="grid gap-space-2 md:grid-cols-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, role, or station"
          className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="space-y-space-2">
        {staff.map((member) => (
          <SurfaceCard key={member.id}>
            <div className="grid gap-space-2 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-center">
              <div>
                <p className="font-display text-heading-sm text-neutral-900">{member.name}</p>
                <p className="font-body text-caption-lg text-neutral-500">{member.station}</p>
              </div>

              <select
                value={member.role}
                onChange={(event) => onRoleChange(member.id, event.target.value)}
                className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
              >
                {staffRoleOptions.map((role) => (
                  <option key={role.id} value={role.id}>{role.label}</option>
                ))}
              </select>

              <span className={`inline-flex w-max rounded-full px-space-2 py-space-1 text-label-sm ${
                member.status === 'active' ? 'bg-green-100 text-success' : 'bg-neutral-100 text-neutral-600'
              }`}
              >
                {member.status}
              </span>

              <button
                type="button"
                onClick={() => onToggleStatus(member.id)}
                className="rounded-full bg-neutral-100 px-space-3 py-space-1 font-display text-label-sm text-neutral-700"
              >
                Toggle
              </button>
            </div>
          </SurfaceCard>
        ))}
      </div>
    </section>
  )
}

