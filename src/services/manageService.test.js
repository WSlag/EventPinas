import { beforeEach, describe, expect, it } from 'vitest'
import {
  autoAssignManageSeats,
  addManageWaitlistEntry,
  assignGuestSeat,
  approveManageWaitlistEntry,
  checkInGuest,
  createManageTable,
  createManageEvent,
  createManageGuest,
  createManageIncident,
  createManageOnsiteWalkIn,
  exportManageReport,
  exportManageScanOutcomes,
  getManageOnlineRegistration,
  getManageOnsiteRegistration,
  getManagePlanner,
  getManageAnalytics,
  getGuestQrPayload,
  getManageBootstrap,
  getManageCapacitySnapshot,
  listManageAuditTrail,
  listManageEvents,
  listManageIncidents,
  listManageScanOutcomes,
  listManageTables,
  listManageWaitlist,
  listManageGuests,
  listRecentCheckIns,
  recordManageScanOutcome,
  importManageGuestsFromCsv,
  previewManageGuestCsvImport,
  reorderManageRegistrationField,
  removeManageWaitlistEntry,
  setManageRegistrationMode,
  registerWalkIn,
  removeManageTable,
  setManageOperatorRole,
  toggleManagePlannerChecklistItem,
  toggleManageRegistrationGateway,
  updateManageTableSeats,
  updateManageEvent,
  updateManageBudgetCategorySpend,
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

  it('creates events with initialized defaults and selects the new event', async () => {
    const beforeEvents = await listManageEvents({}, { simulateLatency: false })

    const created = await createManageEvent(
      {
        title: 'Lagbas Family Homecoming',
        date: '2026-10-01',
        city: 'Davao City',
        venue: 'People Park Pavilion',
        guestCapacity: 123,
      },
      { simulateLatency: false },
    )

    const afterEvents = await listManageEvents({}, { simulateLatency: false })
    expect(afterEvents.length).toBe(beforeEvents.length + 1)
    expect(created.event.status).toBe('draft')
    expect(created.event.tables.length).toBe(13)
    expect(created.selectedEventId).toBe(created.event.id)

    const bootstrap = await getManageBootstrap({ simulateLatency: false })
    expect(bootstrap.selectedEventId).toBe(created.event.id)

    const guests = await listManageGuests(created.event.id, { status: 'all' }, { simulateLatency: false })
    expect(guests).toEqual([])

    const waitlist = await listManageWaitlist(created.event.id, { status: 'all' }, { simulateLatency: false })
    expect(waitlist).toEqual([])

    const planner = await getManagePlanner(created.event.id, { simulateLatency: false })
    expect(planner.checklist.length).toBeGreaterThan(0)
    expect(planner.budget.length).toBeGreaterThan(0)
    expect(planner.eventDetails.guestTarget).toBe(123)

    const registration = await getManageOnlineRegistration(created.event.id, { simulateLatency: false })
    expect(registration.mode).toBe('free')
    expect(registration.fields.map((field) => field.id)).toEqual(['name', 'email', 'phone'])
    expect(registration.ticketTypes[0].total).toBe(123)
    expect(registration.ticketTypes[0].sold).toBe(0)

    const onsite = await getManageOnsiteRegistration(created.event.id, { simulateLatency: false })
    expect(onsite.walkIns).toEqual([])
  })

  it('validates create event payload', async () => {
    await expect(createManageEvent(
      {
        title: '',
        date: '2026-10-01',
        city: 'Davao City',
        venue: 'Venue',
        guestCapacity: 50,
      },
      { simulateLatency: false },
    )).rejects.toThrow(/title is required/i)

    await expect(createManageEvent(
      {
        title: 'Invalid capacity',
        date: '2026-10-01',
        city: 'Davao City',
        venue: 'Venue',
        guestCapacity: 0,
      },
      { simulateLatency: false },
    )).rejects.toThrow(/guestCapacity must be an integer/i)
  })

  it('updates event details with safe table capacity behavior', async () => {
    const bootstrap = await getManageBootstrap({ simulateLatency: false })
    const eventId = bootstrap.selectedEventId
    const beforeEvents = await listManageEvents({}, { simulateLatency: false })
    const originalEvent = beforeEvents.find((event) => event.id === eventId)
    const guests = await listManageGuests(eventId, { status: 'all' }, { simulateLatency: false })
    const assignedLabels = new Set(guests.map((guest) => guest.tableLabel).filter(Boolean))

    const updated = await updateManageEvent(
      eventId,
      {
        title: 'Updated Event Title',
        date: originalEvent.date,
        city: originalEvent.city,
        venue: originalEvent.venue,
        guestCapacity: guests.length + 1,
      },
      { simulateLatency: false },
    )

    expect(updated.event.title).toBe('Updated Event Title')
    expect(updated.event.guestCapacity).toBe(guests.length + 1)
    expect(updated.event.tables.length).toBeGreaterThanOrEqual(assignedLabels.size)
    const updatedLabels = new Set(updated.event.tables.map((table) => table.label))
    for (const label of assignedLabels) {
      expect(updatedLabels.has(label)).toBe(true)
    }
  })

  it('preserves existing table capacities when editing non-capacity fields', async () => {
    const events = await listManageEvents({}, { simulateLatency: false })
    const event = events.find((entry) => entry.id === 'm-evt-003')
    const beforeCapacities = event.tables.map((table) => table.capacity)

    const updated = await updateManageEvent(
      event.id,
      {
        title: `${event.title} Updated`,
        date: event.date,
        city: event.city,
        venue: event.venue,
        guestCapacity: event.guestCapacity,
      },
      { simulateLatency: false },
    )

    expect(updated.event.tables.map((table) => table.capacity)).toEqual(beforeCapacities)
  })

  it('syncs planner and registration totals when event capacity changes', async () => {
    const bootstrap = await getManageBootstrap({ simulateLatency: false })
    const eventId = bootstrap.selectedEventId
    const events = await listManageEvents({}, { simulateLatency: false })
    const event = events.find((entry) => entry.id === eventId)

    const updated = await updateManageEvent(
      eventId,
      {
        title: event.title,
        date: event.date,
        city: event.city,
        venue: event.venue,
        guestCapacity: 300,
      },
      { simulateLatency: false },
    )
    expect(updated.event.guestCapacity).toBe(300)

    const planner = await getManagePlanner(eventId, { simulateLatency: false })
    expect(planner.eventDetails.guestTarget).toBe(300)

    const registration = await getManageOnlineRegistration(eventId, { simulateLatency: false })
    const registrationTotal = registration.ticketTypes.reduce((sum, type) => sum + type.total, 0)
    expect(registrationTotal).toBe(300)
    expect(registration.ticketTypes.every((type) => type.total >= type.sold)).toBe(true)
  })

  it('blocks event updates when capacity is lower than registered guests', async () => {
    const bootstrap = await getManageBootstrap({ simulateLatency: false })
    const eventId = bootstrap.selectedEventId
    const events = await listManageEvents({}, { simulateLatency: false })
    const event = events.find((entry) => entry.id === eventId)
    const guests = await listManageGuests(eventId, { status: 'all' }, { simulateLatency: false })

    await expect(updateManageEvent(
      eventId,
      {
        title: event.title,
        date: event.date,
        city: event.city,
        venue: event.venue,
        guestCapacity: guests.length - 1,
      },
      { simulateLatency: false },
    )).rejects.toThrow(/cannot be lower than the current registered guest count/i)
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

  it('stores scan outcomes with success, warning, and error states', async () => {
    const bootstrap = await getManageBootstrap({ simulateLatency: false })
    const eventId = bootstrap.selectedEventId
    const pendingGuests = await listManageGuests(eventId, { status: 'pending' }, { simulateLatency: false })
    const target = pendingGuests[0]

    await checkInGuest(eventId, target.id, { source: 'qr', rawCode: `EVENTPH|${eventId}|${target.id}|TEST` }, { simulateLatency: false })
    await recordManageScanOutcome(
      eventId,
      { status: 'warning', source: 'qr', input: target.id, detail: `${target.name} already checked in.` },
      { simulateLatency: false },
    )
    await recordManageScanOutcome(
      eventId,
      { status: 'error', source: 'qr', input: 'bad-code', detail: 'QR code format is invalid.' },
      { simulateLatency: false },
    )

    const scanLog = await listManageScanOutcomes(eventId, 10, { simulateLatency: false })
    const statuses = scanLog.map((entry) => entry.status)
    expect(statuses).toContain('success')
    expect(statuses).toContain('warning')
    expect(statuses).toContain('error')

    const warningOnly = await listManageScanOutcomes(eventId, 10, { status: 'warning', simulateLatency: false })
    expect(warningOnly.length).toBeGreaterThan(0)
    expect(warningOnly.every((entry) => entry.status === 'warning')).toBe(true)

    const errorSearch = await listManageScanOutcomes(eventId, 10, { status: 'error', query: 'invalid', simulateLatency: false })
    expect(errorSearch.length).toBeGreaterThan(0)
    expect(errorSearch.every((entry) => entry.status === 'error')).toBe(true)
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

  it('blocks walk-in registration when event is at full capacity', async () => {
    const createdEvent = await createManageEvent(
      {
        title: 'Capacity Lock Event',
        date: '2026-12-12',
        city: 'Davao City',
        venue: 'Hall C',
        guestCapacity: 1,
      },
      { simulateLatency: false },
    )
    const eventId = createdEvent.event.id
    await createManageGuest(eventId, { name: 'Only Slot Guest', ticketType: 'General' }, { simulateLatency: false })

    await expect(registerWalkIn(
      eventId,
      { name: 'Late Walk-in', ticketType: 'General' },
      { simulateLatency: false },
    )).rejects.toThrow(/already at full capacity/i)

    await expect(createManageOnsiteWalkIn(
      eventId,
      { guestName: 'Onsite Late Walk-in', ticketType: 'General' },
      { simulateLatency: false },
    )).rejects.toThrow(/already at full capacity/i)
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

  it('adds a table and auto-adjusts other tables while keeping event capacity fixed', async () => {
    const createdEvent = await createManageEvent(
      {
        title: 'Table Add Event',
        date: '2026-12-20',
        city: 'Davao City',
        venue: 'Hall F',
        guestCapacity: 20,
      },
      { simulateLatency: false },
    )
    const eventId = createdEvent.event.id
    const beforeTables = await listManageTables(eventId, { simulateLatency: false })
    expect(beforeTables.length).toBe(2)

    const createdTable = await createManageTable(
      eventId,
      { seats: 8, label: 'VIP-X' },
      { simulateLatency: false },
    )
    expect(createdTable.table.label).toBe('VIP-X')
    expect(createdTable.table.capacity).toBe(8)
    expect(createdTable.guestCapacity).toBe(20)
    expect(createdTable.capacityAdjustment.autoAdjusted).toBe(true)

    const events = await listManageEvents({}, { simulateLatency: false })
    const updatedEvent = events.find((event) => event.id === eventId)
    expect(updatedEvent.guestCapacity).toBe(20)
    const totalSeats = updatedEvent.tables.reduce((sum, table) => sum + table.capacity, 0)
    expect(totalSeats).toBe(20)

    const planner = await getManagePlanner(eventId, { simulateLatency: false })
    expect(planner.eventDetails.guestTarget).toBe(20)

    const registration = await getManageOnlineRegistration(eventId, { simulateLatency: false })
    const registrationTotal = registration.ticketTypes.reduce((sum, type) => sum + type.total, 0)
    expect(registrationTotal).toBe(20)
  })

  it('updates table seats and auto-adjusts other tables while keeping event capacity fixed', async () => {
    const createdEvent = await createManageEvent(
      {
        title: 'Table Resize Event',
        date: '2026-12-21',
        city: 'Davao City',
        venue: 'Hall G',
        guestCapacity: 20,
      },
      { simulateLatency: false },
    )
    const eventId = createdEvent.event.id

    const updated = await updateManageTableSeats(eventId, 'T1', 12, { simulateLatency: false })
    expect(updated.table.label).toBe('T1')
    expect(updated.table.capacity).toBe(12)
    expect(updated.guestCapacity).toBe(20)
    expect(updated.capacityAdjustment.autoAdjusted).toBe(true)

    const tables = await listManageTables(eventId, { simulateLatency: false })
    const t1 = tables.find((table) => table.label === 'T1')
    expect(t1.capacity).toBe(12)
    const totalSeats = tables.reduce((sum, table) => sum + table.capacity, 0)
    expect(totalSeats).toBe(20)

    const planner = await getManagePlanner(eventId, { simulateLatency: false })
    expect(planner.eventDetails.guestTarget).toBe(20)

    const registration = await getManageOnlineRegistration(eventId, { simulateLatency: false })
    const registrationTotal = registration.ticketTypes.reduce((sum, type) => sum + type.total, 0)
    expect(registrationTotal).toBe(20)
  })

  it('blocks table seat downsize below currently seated guests', async () => {
    const createdEvent = await createManageEvent(
      {
        title: 'Table Downsize Guard Event',
        date: '2026-12-22',
        city: 'Davao City',
        venue: 'Hall H',
        guestCapacity: 20,
      },
      { simulateLatency: false },
    )
    const eventId = createdEvent.event.id
    await createManageGuest(
      eventId,
      { name: 'Seated Guest One', ticketType: 'General', tableLabel: 'T1' },
      { simulateLatency: false },
    )
    await createManageGuest(
      eventId,
      { name: 'Seated Guest Two', ticketType: 'General', tableLabel: 'T1' },
      { simulateLatency: false },
    )

    await expect(updateManageTableSeats(
      eventId,
      'T1',
      1,
      { simulateLatency: false },
    )).rejects.toThrow(/seats cannot be lower than currently seated guests/i)
  })

  it('blocks removing a table that still has assigned guests', async () => {
    const createdEvent = await createManageEvent(
      {
        title: 'Table Remove Assigned Guard Event',
        date: '2026-12-23',
        city: 'Davao City',
        venue: 'Hall I',
        guestCapacity: 20,
      },
      { simulateLatency: false },
    )
    const eventId = createdEvent.event.id
    await createManageGuest(
      eventId,
      { name: 'Assigned Table Guest', ticketType: 'General', tableLabel: 'T1' },
      { simulateLatency: false },
    )

    await expect(removeManageTable(
      eventId,
      'T1',
      { simulateLatency: false },
    )).rejects.toThrow(/has assigned guests/i)
  })

  it('blocks removing the last remaining table', async () => {
    const createdEvent = await createManageEvent(
      {
        title: 'Single Table Remove Guard Event',
        date: '2026-12-24',
        city: 'Davao City',
        venue: 'Hall J',
        guestCapacity: 5,
      },
      { simulateLatency: false },
    )
    const eventId = createdEvent.event.id

    await expect(removeManageTable(
      eventId,
      'T1',
      { simulateLatency: false },
    )).rejects.toThrow(/cannot remove last table/i)
  })

  it('fails atomically when event capacity is corrupted below registered guest count', async () => {
    const createdEvent = await createManageEvent(
      {
        title: 'Corrupted Capacity Guard Event',
        date: '2026-12-25',
        city: 'Davao City',
        venue: 'Hall K',
        guestCapacity: 20,
      },
      { simulateLatency: false },
    )
    const eventId = createdEvent.event.id

    for (let index = 1; index <= 15; index += 1) {
      await createManageGuest(
        eventId,
        { name: `Registered Guest ${index}`, ticketType: 'General' },
        { simulateLatency: false },
      )
    }

    const beforeEvents = await listManageEvents({}, { simulateLatency: false })
    const beforeEvent = beforeEvents.find((event) => event.id === eventId)
    const beforeTableSnapshot = beforeEvent.tables.map((table) => ({ label: table.label, capacity: table.capacity }))

    const rawState = localStorage.getItem(MANAGE_STORAGE_KEY)
    const parsedState = JSON.parse(rawState)
    const eventIndex = parsedState.events.findIndex((event) => event.id === eventId)
    parsedState.events[eventIndex] = {
      ...parsedState.events[eventIndex],
      guestCapacity: 5,
    }
    localStorage.setItem(MANAGE_STORAGE_KEY, JSON.stringify(parsedState))

    await expect(updateManageTableSeats(
      eventId,
      'T1',
      1,
      { simulateLatency: false },
    )).rejects.toThrow(/event capacity is lower than the current registered guest count/i)

    await expect(removeManageTable(
      eventId,
      'T2',
      { simulateLatency: false },
    )).rejects.toThrow(/event capacity is lower than the current registered guest count/i)

    const afterEvents = await listManageEvents({}, { simulateLatency: false })
    const afterEvent = afterEvents.find((event) => event.id === eventId)
    const afterTableSnapshot = afterEvent.tables.map((table) => ({ label: table.label, capacity: table.capacity }))
    expect(afterTableSnapshot).toEqual(beforeTableSnapshot)
  })

  it('records seating audit entries for table add, seat update, and table remove', async () => {
    const createdEvent = await createManageEvent(
      {
        title: 'Table Audit Event',
        date: '2026-12-26',
        city: 'Davao City',
        venue: 'Hall L',
        guestCapacity: 20,
      },
      { simulateLatency: false },
    )
    const eventId = createdEvent.event.id

    await createManageTable(eventId, { seats: 4, label: 'TMP-1' }, { simulateLatency: false })
    await updateManageTableSeats(eventId, 'TMP-1', 6, { simulateLatency: false })
    await removeManageTable(eventId, 'TMP-1', { simulateLatency: false })

    const auditTrail = await listManageAuditTrail(eventId, { module: 'seating' }, { simulateLatency: false })
    const actions = new Set(auditTrail.map((entry) => entry.action))
    expect(actions.has('table_added')).toBe(true)
    expect(actions.has('table_seats_updated')).toBe(true)
    expect(actions.has('table_removed')).toBe(true)
    expect(actions.has('table_capacity_rebalanced')).toBe(true)
  })

  it('adds a guest manually with optional table assignment', async () => {
    const bootstrap = await getManageBootstrap({ simulateLatency: false })
    const eventId = bootstrap.selectedEventId
    const beforeGuests = await listManageGuests(eventId, { status: 'all' }, { simulateLatency: false })

    const created = await createManageGuest(
      eventId,
      { name: 'Manual Guest', ticketType: 'VIP', phone: '+63 911 000 0001', tableLabel: 'T1' },
      { simulateLatency: false },
    )

    const afterGuests = await listManageGuests(eventId, { status: 'all' }, { simulateLatency: false })
    expect(afterGuests.length).toBe(beforeGuests.length + 1)
    expect(created.name).toBe('Manual Guest')
    expect(created.ticketType).toBe('VIP')
    expect(created.tableLabel).toBe('T1')
    expect(created.checkedInAt).toBeNull()
  })

  it('imports guests from csv and reports skipped/warning rows', async () => {
    const createdEvent = await createManageEvent(
      {
        title: 'Import Test Event',
        date: '2026-12-02',
        city: 'Davao City',
        venue: 'Hall D',
        guestCapacity: 3,
      },
      { simulateLatency: false },
    )
    const eventId = createdEvent.event.id
    const csv = [
      'name,ticketType,phone,tableLabel',
      'CSV Guest 1,VIP,+63 911 100 0001,T1',
      'CSV Guest 2,General,+63 911 100 0002,T1',
      ',General,+63 911 100 0003,T1',
      'CSV Guest 3,Staff,+63 911 100 0004,T9',
      'CSV Guest 4,General,+63 911 100 0005,T1',
    ].join('\n')

    const result = await importManageGuestsFromCsv(eventId, csv, { simulateLatency: false })
    const importedGuests = await listManageGuests(eventId, { status: 'all' }, { simulateLatency: false })

    expect(result.addedCount).toBe(3)
    expect(result.skippedCount).toBe(2)
    expect(result.warningCount).toBe(1)
    expect(importedGuests.length).toBe(3)
    expect(importedGuests.filter((guest) => guest.tableLabel === 'T1').length).toBe(2)
    expect(result.blankNameRows).toBe(1)
    expect(result.capacitySkippedCount).toBe(1)
    expect(result.invalidTableWarningCount).toBe(1)
    expect(result.fullTableWarningCount).toBe(0)
  })

  it('previews csv import readiness and blocks missing required headers', async () => {
    const createdEvent = await createManageEvent(
      {
        title: 'Preview CSV Event',
        date: '2026-12-08',
        city: 'Davao City',
        venue: 'Hall M',
        guestCapacity: 2,
      },
      { simulateLatency: false },
    )
    const eventId = createdEvent.event.id

    const validPreview = await previewManageGuestCsvImport(
      eventId,
      'name,ticketType\nGuest A,VIP\nGuest B,General\n',
      { simulateLatency: false },
    )
    expect(validPreview.ok).toBe(true)
    expect(validPreview.rowCount).toBe(2)
    expect(validPreview.blankNameRows).toBe(0)
    expect(validPreview.estimatedImportableRows).toBe(2)

    const invalidPreview = await previewManageGuestCsvImport(
      eventId,
      'fullnamex,ticketType\nGuest A,VIP\n',
      { simulateLatency: false },
    )
    expect(invalidPreview.ok).toBe(false)
    expect(invalidPreview.blockingIssue).toMatch(/missing required "name" header/i)
  })

  it('blocks csv import when event is already at full capacity with clear error', async () => {
    const createdEvent = await createManageEvent(
      {
        title: 'Full Capacity Import Guard',
        date: '2026-12-09',
        city: 'Davao City',
        venue: 'Hall N',
        guestCapacity: 1,
      },
      { simulateLatency: false },
    )
    const eventId = createdEvent.event.id
    await createManageGuest(eventId, { name: 'Only Guest', ticketType: 'General' }, { simulateLatency: false })

    await expect(importManageGuestsFromCsv(
      eventId,
      'name,ticketType\nLate Guest,General\n',
      { simulateLatency: false },
    )).rejects.toThrow(/already at full capacity/i)
  })

  it('auto-assigns unassigned guests to available seats', async () => {
    const createdEvent = await createManageEvent(
      {
        title: 'Seat Auto Assign Event',
        date: '2026-12-05',
        city: 'Davao City',
        venue: 'Hall E',
        guestCapacity: 20,
      },
      { simulateLatency: false },
    )
    const eventId = createdEvent.event.id

    await createManageGuest(eventId, { name: 'Seat Guest 1', ticketType: 'General' }, { simulateLatency: false })
    await createManageGuest(eventId, { name: 'Seat Guest 2', ticketType: 'VIP' }, { simulateLatency: false })
    await createManageGuest(eventId, { name: 'Seat Guest 3', ticketType: 'Staff' }, { simulateLatency: false })

    const assignment = await autoAssignManageSeats(eventId, { simulateLatency: false })
    const guests = await listManageGuests(eventId, { status: 'all' }, { simulateLatency: false })

    expect(assignment.assignedCount).toBe(3)
    expect(assignment.remainingUnassigned).toBe(0)
    expect(guests.every((guest) => Boolean(guest.tableLabel))).toBe(true)
  })

  it('validates generated QR payloads', async () => {
    const bootstrap = await getManageBootstrap({ simulateLatency: false })
    const eventId = bootstrap.selectedEventId
    const guests = await listManageGuests(eventId, { status: 'all' }, { simulateLatency: false })
    const sampleGuest = guests[0]

    const qr = await getGuestQrPayload(eventId, sampleGuest.id, { simulateLatency: false })
    expect(qr.shareUrl).toContain(`/qr/${eventId}/${sampleGuest.id}`)
    const resolved = await validateManageQrCode(eventId, qr.payload, { simulateLatency: false })
    const resolvedFromShareUrl = await validateManageQrCode(eventId, qr.shareUrl, { simulateLatency: false })
    expect(resolved.id).toBe(sampleGuest.id)
    expect(resolvedFromShareUrl.id).toBe(sampleGuest.id)
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

    const scanLogCsv = await exportManageScanOutcomes(eventId, { status: 'all' }, { simulateLatency: false })
    expect(scanLogCsv.filename).toMatch(/-scan-log\.csv$/)
    expect(scanLogCsv.content).toContain('scanId,status,source,input,detail,guestId,name,createdAt')
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

    await expect(createManageEvent(
      {
        title: 'Should not be allowed',
        date: '2026-12-01',
        city: 'Davao City',
        venue: 'Hall C',
        guestCapacity: 50,
      },
      { simulateLatency: false },
    )).rejects.toThrow(/cannot access event list/i)

    const guests = await listManageGuests(eventId, { status: 'all' }, { simulateLatency: false })
    expect(guests.length).toBeGreaterThan(0)
  })

  it('updates planner checklist and budget tracker', async () => {
    const bootstrap = await getManageBootstrap({ simulateLatency: false })
    const eventId = bootstrap.selectedEventId

    const planner = await getManagePlanner(eventId, { simulateLatency: false })
    const firstChecklist = planner.checklist[0]
    const firstBudget = planner.budget[0]

    const toggled = await toggleManagePlannerChecklistItem(eventId, firstChecklist.id, { simulateLatency: false })
    expect(toggled.done).toBe(!firstChecklist.done)

    const updatedBudget = await updateManageBudgetCategorySpend(
      eventId,
      firstBudget.id,
      firstBudget.spent + 1000,
      { simulateLatency: false },
    )
    expect(updatedBudget.spent).toBe(firstBudget.spent + 1000)
  })

  it('manages online registration mode, gateways, and field order', async () => {
    const bootstrap = await getManageBootstrap({ simulateLatency: false })
    const eventId = bootstrap.selectedEventId

    const initial = await getManageOnlineRegistration(eventId, { simulateLatency: false })
    expect(initial.fields.length).toBeGreaterThan(1)

    const mode = await setManageRegistrationMode(eventId, 'free', { simulateLatency: false })
    expect(mode.mode).toBe('free')

    const toggledGateway = await toggleManageRegistrationGateway(eventId, initial.paymentGateways[0].id, { simulateLatency: false })
    expect(typeof toggledGateway.enabled).toBe('boolean')

    const reordered = await reorderManageRegistrationField(eventId, 0, 1, { simulateLatency: false })
    expect(reordered[1].id).toBe(initial.fields[0].id)
  })

  it('creates on-site walk-ins and logs them', async () => {
    const bootstrap = await getManageBootstrap({ simulateLatency: false })
    const eventId = bootstrap.selectedEventId

    const created = await createManageOnsiteWalkIn(
      eventId,
      {
        guestName: 'Onsite Walkin Test',
        ticketType: 'General',
        paymentMethod: 'Cash',
        amountPaid: 250,
        badgePrinted: true,
      },
      { simulateLatency: false },
    )
    expect(created.guestName).toContain('Onsite Walkin Test')

    const onsite = await getManageOnsiteRegistration(eventId, { simulateLatency: false })
    expect(onsite.walkIns.length).toBeGreaterThan(0)
  })
})
