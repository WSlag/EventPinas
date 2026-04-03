import { beforeEach, describe, expect, it } from 'vitest'
import {
  addManageWaitlistEntry,
  assignGuestSeat,
  approveManageWaitlistEntry,
  checkInGuest,
  createManageIncident,
  exportManageReport,
  getManageAnalytics,
  getGuestQrPayload,
  getManageBootstrap,
  getManageCapacitySnapshot,
  listManageAuditTrail,
  listManageIncidents,
  listManageTables,
  listManageWaitlist,
  listManageGuests,
  listRecentCheckIns,
  removeManageWaitlistEntry,
  registerWalkIn,
  setManageOperatorRole,
  updateManageIncidentStatus,
  validateManageQrCode,
} from './manageService'

const MANAGE_STORAGE_KEY = 'eventpinas-manage-state'

describe('manageService', () => {
  beforeEach(() => {
    localStorage.removeItem(MANAGE_STORAGE_KEY)
  })

  it('returns bootstrap event list', async () => {
    const bootstrap = await getManageBootstrap({ simulateLatency: false })
    expect(bootstrap.events.length).toBeGreaterThan(0)
    expect(bootstrap.selectedEventId).toBeTruthy()
  })

  it('checks in a pending guest and logs activity', async () => {
    const bootstrap = await getManageBootstrap({ simulateLatency: false })
    const eventId = bootstrap.selectedEventId
    const pendingGuests = await listManageGuests(eventId, { status: 'pending' }, { simulateLatency: false })
    expect(pendingGuests.length).toBeGreaterThan(0)

    await checkInGuest(eventId, pendingGuests[0].id, { source: 'qr' }, { simulateLatency: false })
    const latestLog = await listRecentCheckIns(eventId, 1, { simulateLatency: false })
    expect(latestLog[0].guestId).toBe(pendingGuests[0].id)
  })

  it('registers walk-in guests as checked in', async () => {
    const bootstrap = await getManageBootstrap({ simulateLatency: false })
    const eventId = bootstrap.selectedEventId
    const allBefore = await listManageGuests(eventId, { status: 'all' }, { simulateLatency: false })

    const created = await registerWalkIn(
      eventId,
      { name: 'Walk In Sample', ticketType: 'General', phone: '+63 900 000 0000' },
      { simulateLatency: false },
    )
    const allAfter = await listManageGuests(eventId, { status: 'all' }, { simulateLatency: false })

    expect(created.isWalkIn).toBe(true)
    expect(created.checkedInAt).toBeTruthy()
    expect(allAfter.length).toBe(allBefore.length + 1)
  })

  it('assigns guest seat with table capacity validation', async () => {
    const bootstrap = await getManageBootstrap({ simulateLatency: false })
    const eventId = bootstrap.selectedEventId

    const pendingGuests = await listManageGuests(eventId, { status: 'pending' }, { simulateLatency: false })
    const firstPending = pendingGuests[0]
    const tables = await listManageTables(eventId, { simulateLatency: false })
    const openTable = tables.find((table) => table.available > 0)

    const assigned = await assignGuestSeat(eventId, firstPending.id, openTable.label, { simulateLatency: false })
    expect(assigned.tableLabel).toBe(openTable.label)
  })

  it('validates generated QR payloads', async () => {
    const bootstrap = await getManageBootstrap({ simulateLatency: false })
    const eventId = bootstrap.selectedEventId
    const guests = await listManageGuests(eventId, { status: 'all' }, { simulateLatency: false })
    const sampleGuest = guests[0]

    const qr = await getGuestQrPayload(eventId, sampleGuest.id, { simulateLatency: false })
    const resolved = await validateManageQrCode(eventId, qr.payload, { simulateLatency: false })
    expect(resolved.id).toBe(sampleGuest.id)
  })

  it('creates incidents and runs incident workflow states', async () => {
    const bootstrap = await getManageBootstrap({ simulateLatency: false })
    const eventId = bootstrap.selectedEventId

    const created = await createManageIncident(
      eventId,
      { title: 'Audio desk offline', type: 'technical', severity: 'high', reportedBy: 'QA Test' },
      { simulateLatency: false },
    )
    expect(created.status).toBe('open')

    const openOnly = await listManageIncidents(eventId, { status: 'open' }, { simulateLatency: false })
    expect(openOnly.some((incident) => incident.id === created.id)).toBe(true)

    const investigating = await updateManageIncidentStatus(
      eventId,
      created.id,
      { status: 'investigating', assignee: 'Ops Lead' },
      { simulateLatency: false },
    )
    expect(investigating.status).toBe('investigating')
    expect(investigating.acknowledgedAt).toBeTruthy()

    const escalated = await updateManageIncidentStatus(
      eventId,
      created.id,
      { status: 'escalated' },
      { simulateLatency: false },
    )
    expect(escalated.status).toBe('escalated')
    expect(escalated.escalatedAt).toBeTruthy()

    const resolved = await updateManageIncidentStatus(
      eventId,
      created.id,
      { status: 'resolved', resolutionNote: 'Power cycled and tested.' },
      { simulateLatency: false },
    )
    expect(resolved.status).toBe('resolved')
    expect(resolved.resolutionNote).toContain('Power cycled')
    expect(resolved.resolvedAt).toBeTruthy()
  })

  it('manages waitlist approvals and capacity snapshots', async () => {
    const bootstrap = await getManageBootstrap({ simulateLatency: false })
    const eventId = bootstrap.selectedEventId

    const beforeCapacity = await getManageCapacitySnapshot(eventId, { simulateLatency: false })
    const newEntry = await addManageWaitlistEntry(
      eventId,
      { name: 'Capacity Guest', ticketType: 'General', phone: '+63 900 123 4567' },
      { simulateLatency: false },
    )

    const waitlist = await listManageWaitlist(eventId, { status: 'waiting' }, { simulateLatency: false })
    expect(waitlist.some((entry) => entry.id === newEntry.id)).toBe(true)

    const approved = await approveManageWaitlistEntry(eventId, newEntry.id, { simulateLatency: false })
    expect(approved.status).toBe('approved')

    const afterCapacity = await getManageCapacitySnapshot(eventId, { simulateLatency: false })
    expect(afterCapacity.registered).toBe(beforeCapacity.registered + 1)

    const removed = await removeManageWaitlistEntry(eventId, 'wl-001', { simulateLatency: false })
    expect(removed.status).toBe('removed')
  })

  it('returns analytics summaries and csv exports', async () => {
    const bootstrap = await getManageBootstrap({ simulateLatency: false })
    const eventId = bootstrap.selectedEventId

    const analytics = await getManageAnalytics(eventId, { simulateLatency: false })
    expect(analytics.totalGuests).toBeGreaterThan(0)
    expect(analytics.checkedIn).toBeGreaterThanOrEqual(0)
    expect(analytics.slaBreaches).toBeGreaterThanOrEqual(0)

    const attendanceCsv = await exportManageReport(eventId, 'attendance', { simulateLatency: false })
    expect(attendanceCsv.filename).toMatch(/-attendance\.csv$/)
    expect(attendanceCsv.content).toContain('guestId,name,ticketType')

    const incidentsCsv = await exportManageReport(eventId, 'incidents', { simulateLatency: false })
    expect(incidentsCsv.filename).toMatch(/-incidents\.csv$/)
    expect(incidentsCsv.content).toContain('incidentId,title,type,severity,status,assignee,slaDueAt')
  })

  it('records audit entries for operational changes', async () => {
    const bootstrap = await getManageBootstrap({ simulateLatency: false })
    const eventId = bootstrap.selectedEventId

    await addManageWaitlistEntry(
      eventId,
      { name: 'Audit Guest', ticketType: 'General', phone: '+63 900 111 1111' },
      { simulateLatency: false },
    )
    const auditTrail = await listManageAuditTrail(eventId, { module: 'waitlist' }, { simulateLatency: false })

    expect(auditTrail.length).toBeGreaterThan(0)
    expect(auditTrail[0].module).toBe('waitlist')
  })

  it('enforces role permissions in service layer', async () => {
    const bootstrap = await getManageBootstrap({ simulateLatency: false })
    const eventId = bootstrap.selectedEventId

    await setManageOperatorRole('staff', { simulateLatency: false })

    await expect(createManageIncident(
      eventId,
      { title: 'Should fail', type: 'technical', severity: 'low' },
      { simulateLatency: false },
    )).rejects.toThrow(/cannot access incident operations/i)

    const guests = await listManageGuests(eventId, { status: 'all' }, { simulateLatency: false })
    expect(guests.length).toBeGreaterThan(0)
  })
})
