import { beforeEach, describe, expect, it } from 'vitest'
import {
  autoAssignManageSeats,
  addManageWaitlistEntry,
  archiveManageEvent,
  assignGuestSeat,
  approveManageWaitlistEntry,
  checkInGuest,
  createManageTable,
  createManageTicketType,
  createManageEvent,
  createManageGuest,
  createManageIncident,
  createManageOnsiteWalkIn,
  createManageRegistrationField,
  deleteManageRegistrationField,
  deleteManageTicketType,
  exportManageReport,
  exportManageScanOutcomes,
  goLiveManageEvent,
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
  publishManageEvent,
  requestManageEventFeatured,
  recordManageScanOutcome,
  importManageGuestsFromCsv,
  previewManageGuestCsvImport,
  reorderManageRegistrationField,
  restoreManageEvent,
  removeManageWaitlistEntry,
  softDeleteManageEvent,
  setManageRegistrationMode,
  registerWalkIn,
  removeManageTable,
  setManageOperatorRole,
  toggleManagePlannerChecklistItem,
  toggleManageRegistrationGateway,
  updateManageOnsiteBadgePrintStatus,
  updateManagePlannerEventDetails,
  updateManageRegistrationField,
  updateManageTableLayout,
  updateManageTicketType,
  updateManageTableSeats,
  updateManageEvent,
  updateManageBudgetCategorySpend,
  updateManageIncidentStatus,
  validateManageQrCode,
} from './manageService'
import {
  PUBLIC_MARKETPLACE_EVENTS_STORAGE_KEY,
  approvePublicEventFeatured,
  getPublicEventById,
  listFeaturedPublicEvents,
} from './marketplaceService'

const MANAGE_STORAGE_KEY = 'eventpinas-manage-state'

describe('manageService', () => {
  beforeEach(() => {
    localStorage.removeItem(MANAGE_STORAGE_KEY)
    localStorage.removeItem(PUBLIC_MARKETPLACE_EVENTS_STORAGE_KEY)
  })

  it('returns bootstrap event list', async () => {
    const bootstrap = await getManageBootstrap({ simulateLatency: false })
    expect(bootstrap.events.length).toBeGreaterThan(0)
    expect(bootstrap.selectedEventId).toBeTruthy()
  })

  it('backfills legacy table assignments with deterministic seat numbers', async () => {
    const createdEvent = await createManageEvent(
      {
        title: 'Legacy Seat Backfill Event',
        date: '2026-12-01',
        city: 'Davao City',
        venue: 'Hall Legacy',
        guestCapacity: 12,
      },
      { simulateLatency: false },
    )
    const eventId = createdEvent.event.id
    await createManageGuest(eventId, { name: 'Legacy A', ticketType: 'General', tableLabel: 'T1' }, { simulateLatency: false })
    await createManageGuest(eventId, { name: 'Legacy B', ticketType: 'General', tableLabel: 'T1' }, { simulateLatency: false })
    await createManageGuest(eventId, { name: 'Legacy C', ticketType: 'General', tableLabel: 'T1' }, { simulateLatency: false })

    const rawState = JSON.parse(localStorage.getItem(MANAGE_STORAGE_KEY))
    const guests = rawState.guestsByEvent[eventId]
    const assignedIndexes = guests
      .map((guest, index) => ({ guest, index }))
      .filter((entry) => entry.guest.tableLabel === 'T1')
      .map((entry) => entry.index)

    guests[assignedIndexes[0]] = { ...guests[assignedIndexes[0]], seatNumber: 1 }
    guests[assignedIndexes[1]] = { ...guests[assignedIndexes[1]], seatNumber: 1 }
    guests[assignedIndexes[2]] = { ...guests[assignedIndexes[2]], seatNumber: null }
    localStorage.setItem(MANAGE_STORAGE_KEY, JSON.stringify(rawState))

    const normalizedGuests = await listManageGuests(eventId, { status: 'all' }, { simulateLatency: false })
    const t1Guests = normalizedGuests.filter((guest) => guest.tableLabel === 'T1')
    const seatNumbers = t1Guests.map((guest) => guest.seatNumber)
    const uniqueSeatNumbers = new Set(seatNumbers)

    expect(t1Guests.every((guest) => Number.isInteger(guest.seatNumber))).toBe(true)
    expect(uniqueSeatNumbers.size).toBe(seatNumbers.length)
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

  it('handles event lifecycle transitions with transition guards', async () => {
    const created = await createManageEvent(
      {
        title: 'Lifecycle Event',
        date: '2026-12-30',
        city: 'Davao City',
        venue: 'Hall Lifecycle',
        guestCapacity: 50,
      },
      { simulateLatency: false },
    )
    const eventId = created.event.id

    await expect(goLiveManageEvent(eventId, { simulateLatency: false })).rejects.toThrow(/cannot move event from draft to live/i)

    const published = await publishManageEvent(eventId, { simulateLatency: false })
    expect(published.status).toBe('upcoming')

    const live = await goLiveManageEvent(eventId, { simulateLatency: false })
    expect(live.status).toBe('live')

    const archived = await archiveManageEvent(eventId, { simulateLatency: false })
    expect(archived.status).toBe('past')
  })

  it('soft-deletes and restores events with list filters', async () => {
    const created = await createManageEvent(
      {
        title: 'Soft Delete Event',
        date: '2026-12-31',
        city: 'Davao City',
        venue: 'Hall Soft Delete',
        guestCapacity: 40,
      },
      { simulateLatency: false },
    )
    const eventId = created.event.id

    const deleted = await softDeleteManageEvent(eventId, { simulateLatency: false })
    expect(deleted.deletedAt).toBeTruthy()
    expect(deleted.status).toBe('past')

    const visibleEvents = await listManageEvents({}, { simulateLatency: false })
    expect(visibleEvents.some((event) => event.id === eventId)).toBe(false)

    const withDeleted = await listManageEvents({ includeDeleted: true }, { simulateLatency: false })
    const deletedEvent = withDeleted.find((event) => event.id === eventId)
    expect(deletedEvent?.deletedAt).toBeTruthy()

    const restored = await restoreManageEvent(eventId, { simulateLatency: false })
    expect(restored.deletedAt).toBeNull()
    expect(restored.status).toBe('draft')
  })

  it('publishes events into public marketplace visibility and hides on archive/delete/restore', async () => {
    const created = await createManageEvent(
      {
        title: 'Public Sync Event',
        date: '2026-12-15',
        city: 'Davao City',
        venue: 'Marketplace Sync Hall',
        guestCapacity: 80,
      },
      { simulateLatency: false },
    )
    const eventId = created.event.id

    const published = await publishManageEvent(eventId, { simulateLatency: false })
    expect(published.isPublic).toBe(true)

    const publicAfterPublish = await getPublicEventById(eventId, { simulateLatency: false, forceLocal: true })
    expect(publicAfterPublish?.isPublic).toBe(true)
    expect(publicAfterPublish?.status).toBe('upcoming')

    await archiveManageEvent(eventId, { simulateLatency: false })
    const publicAfterArchive = await getPublicEventById(eventId, {
      simulateLatency: false,
      forceLocal: true,
      includeUnpublished: true,
    })
    expect(publicAfterArchive?.isPublic).toBe(false)
    expect(publicAfterArchive?.status).toBe('past')

    await softDeleteManageEvent(eventId, { simulateLatency: false })
    await restoreManageEvent(eventId, { simulateLatency: false })
    const publicAfterRestore = await getPublicEventById(eventId, {
      simulateLatency: false,
      forceLocal: true,
      includeUnpublished: true,
    })
    expect(publicAfterRestore?.isPublic).toBe(false)
    expect(publicAfterRestore?.status).toBe('draft')

    await publishManageEvent(eventId, { simulateLatency: false })
    await softDeleteManageEvent(eventId, { simulateLatency: false })
    const publicAfterDelete = await getPublicEventById(eventId, {
      simulateLatency: false,
      forceLocal: true,
      includeUnpublished: true,
    })
    expect(publicAfterDelete?.isPublic).toBe(false)
  })

  it('sets featured request pending and shows in featured list only after admin approval', async () => {
    const created = await createManageEvent(
      {
        title: 'Featured Request Event',
        date: '2026-12-16',
        city: 'Davao City',
        venue: 'Featured Hall',
        guestCapacity: 120,
      },
      { simulateLatency: false },
    )
    const eventId = created.event.id
    await publishManageEvent(eventId, { simulateLatency: false })

    const requested = await requestManageEventFeatured(eventId, { simulateLatency: false })
    expect(requested.featureStatus).toBe('pending')
    expect(requested.isFeatured).toBe(false)

    const featuredBeforeApproval = await listFeaturedPublicEvents({}, { simulateLatency: false, forceLocal: true })
    expect(featuredBeforeApproval.some((event) => event.id === eventId)).toBe(false)

    await approvePublicEventFeatured(eventId, { featuredRank: 2 }, { forceLocal: true })
    const featuredAfterApproval = await listFeaturedPublicEvents({}, { simulateLatency: false, forceLocal: true })
    expect(featuredAfterApproval.some((event) => event.id === eventId)).toBe(true)
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
    expect(Number.isInteger(created.seatNumber)).toBe(true)
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
    expect(Number.isInteger(assigned.seatNumber)).toBe(true)
    expect(assigned.seatNumber).toBeGreaterThan(0)
  })

  it('supports explicit seat assignment and validates seat conflicts', async () => {
    const createdEvent = await createManageEvent(
      {
        title: 'Explicit Seat Event',
        date: '2026-12-19',
        city: 'Davao City',
        venue: 'Hall Explicit',
        guestCapacity: 12,
      },
      { simulateLatency: false },
    )
    const eventId = createdEvent.event.id

    const guestOne = await createManageGuest(eventId, { name: 'Seat Guest One', ticketType: 'General' }, { simulateLatency: false })
    const guestTwo = await createManageGuest(eventId, { name: 'Seat Guest Two', ticketType: 'General' }, { simulateLatency: false })

    const assignedOne = await assignGuestSeat(eventId, guestOne.id, 'T1', { simulateLatency: false, seatNumber: 3 })
    expect(assignedOne.tableLabel).toBe('T1')
    expect(assignedOne.seatNumber).toBe(3)

    await expect(assignGuestSeat(
      eventId,
      guestTwo.id,
      'T1',
      { simulateLatency: false, seatNumber: 3 },
    )).rejects.toThrow(/already occupied/i)

    await expect(assignGuestSeat(
      eventId,
      guestTwo.id,
      'T1',
      { simulateLatency: false, seatNumber: 999 },
    )).rejects.toThrow(/outside the valid range/i)
  })

  it('clears seat number when unassigning a guest', async () => {
    const createdEvent = await createManageEvent(
      {
        title: 'Seat Clear Event',
        date: '2026-12-19',
        city: 'Davao City',
        venue: 'Hall Clear',
        guestCapacity: 12,
      },
      { simulateLatency: false },
    )
    const eventId = createdEvent.event.id
    const guest = await createManageGuest(eventId, { name: 'Clear Seat Guest', ticketType: 'General' }, { simulateLatency: false })
    const assigned = await assignGuestSeat(eventId, guest.id, 'T1', { simulateLatency: false })
    expect(assigned.tableLabel).toBe('T1')
    expect(Number.isInteger(assigned.seatNumber)).toBe(true)

    const unassigned = await assignGuestSeat(eventId, guest.id, null, { simulateLatency: false })
    expect(unassigned.tableLabel).toBeNull()
    expect(unassigned.seatNumber).toBeNull()
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

  it('blocks table seat downsize below highest assigned seat number', async () => {
    const createdEvent = await createManageEvent(
      {
        title: 'Seat Position Guard Event',
        date: '2026-12-22',
        city: 'Davao City',
        venue: 'Hall Seat Guard',
        guestCapacity: 20,
      },
      { simulateLatency: false },
    )
    const eventId = createdEvent.event.id
    const guest = await createManageGuest(
      eventId,
      { name: 'High Seat Guest', ticketType: 'General' },
      { simulateLatency: false },
    )
    await assignGuestSeat(eventId, guest.id, 'T1', { simulateLatency: false, seatNumber: 8 })

    await expect(updateManageTableSeats(
      eventId,
      'T1',
      7,
      { simulateLatency: false },
    )).rejects.toThrow(/highest assigned seat number/i)
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
    expect(Number.isInteger(created.seatNumber)).toBe(true)
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
    expect(importedGuests.filter((guest) => guest.tableLabel === 'T1').every((guest) => Number.isInteger(guest.seatNumber))).toBe(true)
    expect(result.blankNameRows).toBe(1)
    expect(result.capacitySkippedCount).toBe(1)
    expect(result.invalidTableWarningCount).toBe(1)
    expect(result.fullTableWarningCount).toBe(0)
  })

  it('imports csv seatNumber values with fallback for invalid or occupied seats', async () => {
    const createdEvent = await createManageEvent(
      {
        title: 'Import Seat Number Event',
        date: '2026-12-03',
        city: 'Davao City',
        venue: 'Hall Seat CSV',
        guestCapacity: 6,
      },
      { simulateLatency: false },
    )
    const eventId = createdEvent.event.id
    const csv = [
      'name,ticketType,phone,tableLabel,seatNumber',
      'Seat CSV 1,VIP,+63 911 200 0001,T1,5',
      'Seat CSV 2,General,+63 911 200 0002,T1,5',
      'Seat CSV 3,General,+63 911 200 0003,T1,abc',
    ].join('\n')

    const result = await importManageGuestsFromCsv(eventId, csv, { simulateLatency: false })
    const guests = await listManageGuests(eventId, { status: 'all' }, { simulateLatency: false })
    const seatCsvGuests = guests.filter((guest) => guest.name.startsWith('Seat CSV'))
    const occupiedSeats = new Set(seatCsvGuests.map((guest) => guest.seatNumber))

    expect(result.addedCount).toBe(3)
    expect(result.warningCount).toBe(2)
    expect(result.invalidSeatWarningCount).toBe(1)
    expect(result.occupiedSeatWarningCount).toBe(1)
    expect(occupiedSeats.has(5)).toBe(true)
    expect(seatCsvGuests.every((guest) => Number.isInteger(guest.seatNumber))).toBe(true)
    expect(occupiedSeats.size).toBe(3)
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
    expect(guests.every((guest) => Number.isInteger(guest.seatNumber))).toBe(true)
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
    const guests = await listManageGuests(eventId, { status: 'all' }, { simulateLatency: false })
    const approvedGuest = guests.find((guest) => guest.id === approved.approvedGuestId)
    expect(Number.isInteger(approvedGuest?.seatNumber)).toBe(true)

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
    expect(attendanceCsv.content).toContain('tableLabel,seatNumber,phone')

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

  it('updates planner event details while keeping guest target capacity-synced', async () => {
    const bootstrap = await getManageBootstrap({ simulateLatency: false })
    const eventId = bootstrap.selectedEventId
    const events = await listManageEvents({}, { simulateLatency: false })
    const event = events.find((entry) => entry.id === eventId)

    const updated = await updateManagePlannerEventDetails(
      eventId,
      {
        plannerLead: 'Planner QA Lead',
        venueOpenTime: '13:30',
        showStartTime: '16:45',
      },
      { simulateLatency: false },
    )

    expect(updated.plannerLead).toBe('Planner QA Lead')
    expect(updated.venueOpenTime).toBe('13:30')
    expect(updated.showStartTime).toBe('16:45')
    expect(updated.guestTarget).toBe(event.guestCapacity)

    const planner = await getManagePlanner(eventId, { simulateLatency: false })
    expect(planner.eventDetails.plannerLead).toBe('Planner QA Lead')
    expect(planner.eventDetails.guestTarget).toBe(event.guestCapacity)
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

  it('supports registration field CRUD including required-name guard', async () => {
    const created = await createManageEvent(
      {
        title: 'Registration Field CRUD Event',
        date: '2027-01-01',
        city: 'Davao City',
        venue: 'Hall Reg Field',
        guestCapacity: 60,
      },
      { simulateLatency: false },
    )
    const eventId = created.event.id

    const createdField = await createManageRegistrationField(
      eventId,
      { label: 'Company Name', type: 'text', required: false },
      { simulateLatency: false },
    )
    expect(createdField.label).toBe('Company Name')

    const updatedField = await updateManageRegistrationField(
      eventId,
      createdField.id,
      { label: 'Organization', required: true },
      { simulateLatency: false },
    )
    expect(updatedField.label).toBe('Organization')
    expect(updatedField.required).toBe(true)

    await expect(deleteManageRegistrationField(eventId, 'name', { simulateLatency: false })).rejects.toThrow(/cannot be removed/i)

    const removed = await deleteManageRegistrationField(eventId, createdField.id, { simulateLatency: false })
    expect(removed.id).toBe(createdField.id)
  })

  it('supports ticket type CRUD with sold guard on delete', async () => {
    const created = await createManageEvent(
      {
        title: 'Ticket CRUD Event',
        date: '2027-01-02',
        city: 'Davao City',
        venue: 'Hall Ticket',
        guestCapacity: 30,
      },
      { simulateLatency: false },
    )
    const eventId = created.event.id

    const createdTicket = await createManageTicketType(
      eventId,
      { label: 'Backstage', pricePhp: 1500, sold: 0, total: 5 },
      { simulateLatency: false },
    )
    expect(createdTicket.label).toBe('Backstage')

    const updatedTicket = await updateManageTicketType(
      eventId,
      createdTicket.id,
      { sold: 1, total: 5, pricePhp: 1800 },
      { simulateLatency: false },
    )
    expect(updatedTicket.sold).toBe(1)
    expect(updatedTicket.pricePhp).toBe(1800)

    await expect(deleteManageTicketType(eventId, createdTicket.id, { simulateLatency: false })).rejects.toThrow(/sold count is greater than zero/i)

    await updateManageTicketType(
      eventId,
      createdTicket.id,
      { sold: 0, total: 5 },
      { simulateLatency: false },
    )
    const removed = await deleteManageTicketType(eventId, createdTicket.id, { simulateLatency: false })
    expect(removed.id).toBe(createdTicket.id)
  })

  it('persists table floorplan coordinates', async () => {
    const created = await createManageEvent(
      {
        title: 'Floorplan Event',
        date: '2027-01-03',
        city: 'Davao City',
        venue: 'Hall Floor',
        guestCapacity: 20,
      },
      { simulateLatency: false },
    )
    const eventId = created.event.id

    const moved = await updateManageTableLayout(eventId, 'T1', { x: 222, y: 333 }, { simulateLatency: false })
    expect(moved.x).toBe(222)
    expect(moved.y).toBe(333)

    const tables = await listManageTables(eventId, { simulateLatency: false })
    const t1 = tables.find((table) => table.label === 'T1')
    expect(t1.x).toBe(222)
    expect(t1.y).toBe(333)
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
    const guests = await listManageGuests(eventId, { status: 'all' }, { simulateLatency: false })
    const onsiteGuest = guests.find((guest) => guest.name === 'Onsite Walkin Test')
    expect(Number.isInteger(onsiteGuest?.seatNumber)).toBe(true)
  })

  it('updates on-site badge print status with print metadata', async () => {
    const bootstrap = await getManageBootstrap({ simulateLatency: false })
    const eventId = bootstrap.selectedEventId

    const created = await createManageOnsiteWalkIn(
      eventId,
      {
        guestName: 'Badge Print Test',
        ticketType: 'General',
        paymentMethod: 'Cash',
        amountPaid: 250,
        badgePrinted: false,
      },
      { simulateLatency: false },
    )
    expect(created.badgePrinted).toBe(false)

    const updated = await updateManageOnsiteBadgePrintStatus(
      eventId,
      created.id,
      { badgePrinted: true, method: 'browser-print' },
      { simulateLatency: false },
    )
    expect(updated.badgePrinted).toBe(true)
    expect(updated.badgePrintMethod).toBe('browser-print')
    expect(updated.badgePrintedAt).toBeTruthy()
    expect(updated.badgePrintLastAttemptAt).toBeTruthy()
  })
})
