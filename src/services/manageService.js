import {
  manageAuditLogByEvent,
  manageEvents,
  manageGuestsByEvent,
  manageIncidentsByEvent,
  manageStaffByEvent,
  manageWaitlistByEvent,
} from '@/data/manageData'

const STORAGE_KEY = 'eventpinas-manage-state'
const DEFAULT_DELAY_MS = 100

const operatorRolePermissions = {
  admin: ['dashboard', 'events', 'checkin', 'guests', 'seating', 'staff', 'qr', 'incidents', 'waitlist', 'analytics', 'audit'],
  checkinLead: ['dashboard', 'checkin', 'guests', 'qr', 'waitlist', 'incidents', 'analytics', 'audit'],
  seatingLead: ['dashboard', 'guests', 'seating', 'waitlist', 'incidents', 'audit'],
  staff: ['dashboard', 'guests'],
}

const permissionLabels = {
  dashboard: 'dashboard metrics',
  events: 'event list',
  checkin: 'check-in operations',
  guests: 'guest records',
  seating: 'seating controls',
  staff: 'staff controls',
  qr: 'QR tools',
  incidents: 'incident operations',
  waitlist: 'waitlist operations',
  analytics: 'analytics exports',
  audit: 'audit logs',
}

const incidentStatusTransitions = {
  open: ['investigating', 'resolved'],
  investigating: ['escalated', 'resolved', 'open'],
  escalated: ['investigating', 'resolved'],
  resolved: ['open'],
}

const incidentSlaMinutesBySeverity = {
  low: 180,
  medium: 90,
  high: 30,
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function buildDefaultState() {
  return {
    selectedEventId: manageEvents[0]?.id ?? null,
    selectedOperatorRole: 'admin',
    events: clone(manageEvents),
    guestsByEvent: clone(manageGuestsByEvent),
    staffByEvent: clone(manageStaffByEvent),
    incidentsByEvent: clone(manageIncidentsByEvent),
    waitlistByEvent: clone(manageWaitlistByEvent),
    checkInLogByEvent: {},
    auditLogByEvent: clone(manageAuditLogByEvent),
  }
}

function readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return buildDefaultState()
    const parsed = JSON.parse(raw)
    return {
      selectedEventId: parsed.selectedEventId ?? manageEvents[0]?.id ?? null,
      selectedOperatorRole: parsed.selectedOperatorRole ?? 'admin',
      events: Array.isArray(parsed.events) ? parsed.events : clone(manageEvents),
      guestsByEvent: parsed.guestsByEvent && typeof parsed.guestsByEvent === 'object' ? parsed.guestsByEvent : clone(manageGuestsByEvent),
      staffByEvent: parsed.staffByEvent && typeof parsed.staffByEvent === 'object' ? parsed.staffByEvent : clone(manageStaffByEvent),
      incidentsByEvent: parsed.incidentsByEvent && typeof parsed.incidentsByEvent === 'object' ? parsed.incidentsByEvent : clone(manageIncidentsByEvent),
      waitlistByEvent: parsed.waitlistByEvent && typeof parsed.waitlistByEvent === 'object' ? parsed.waitlistByEvent : clone(manageWaitlistByEvent),
      checkInLogByEvent: parsed.checkInLogByEvent && typeof parsed.checkInLogByEvent === 'object' ? parsed.checkInLogByEvent : {},
      auditLogByEvent: parsed.auditLogByEvent && typeof parsed.auditLogByEvent === 'object' ? parsed.auditLogByEvent : clone(manageAuditLogByEvent),
    }
  } catch {
    return buildDefaultState()
  }
}

function writeState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase()
}

function includesQuery(value, query) {
  if (!query) return true
  return normalizeText(value).includes(query)
}

function getGuestsForEvent(state, eventId) {
  const source = state.guestsByEvent[eventId]
  return Array.isArray(source) ? source : []
}

function getStaffForEvent(state, eventId) {
  const source = state.staffByEvent[eventId]
  return Array.isArray(source) ? source : []
}

function getIncidentsForEvent(state, eventId) {
  const source = state.incidentsByEvent[eventId]
  return Array.isArray(source) ? source : []
}

function getWaitlistForEvent(state, eventId) {
  const source = state.waitlistByEvent[eventId]
  return Array.isArray(source) ? source : []
}

function getAuditLogForEvent(state, eventId) {
  const source = state.auditLogByEvent[eventId]
  return Array.isArray(source) ? source : []
}

function getEventFromState(state, eventId) {
  return state.events.find((event) => event.id === eventId) ?? null
}

function getGuestFromState(state, eventId, guestId) {
  return getGuestsForEvent(state, eventId).find((guest) => guest.id === guestId) ?? null
}

function getIncidentSlaMinutes(severity) {
  return incidentSlaMinutesBySeverity[severity] ?? incidentSlaMinutesBySeverity.medium
}

function buildIncidentSlaDueAt(reportedAt, severity, slaMinutes) {
  const base = new Date(reportedAt).getTime()
  const minutes = slaMinutes ?? getIncidentSlaMinutes(severity)
  return new Date(base + minutes * 60 * 1000).toISOString()
}

function withIncidentDefaults(incident) {
  const reportedAt = incident.reportedAt ?? new Date().toISOString()
  const severity = incident.severity ?? 'medium'
  const slaMinutes = incident.slaMinutes ?? getIncidentSlaMinutes(severity)
  const status = incident.status ?? 'open'
  return {
    id: incident.id,
    title: incident.title ?? 'Untitled incident',
    type: incident.type ?? 'logistics',
    severity,
    status,
    note: incident.note ?? '',
    reportedBy: incident.reportedBy ?? 'System',
    reportedAt,
    assignee: incident.assignee ?? '',
    resolutionNote: incident.resolutionNote ?? '',
    acknowledgedAt: incident.acknowledgedAt ?? null,
    escalatedAt: incident.escalatedAt ?? null,
    resolvedAt: incident.resolvedAt ?? null,
    slaMinutes,
    slaDueAt: incident.slaDueAt ?? buildIncidentSlaDueAt(reportedAt, severity, slaMinutes),
  }
}

function appendAuditLogEntry(state, eventId, payload) {
  if (!eventId) return null
  const log = getAuditLogForEvent(state, eventId)
  const entry = {
    id: `audit-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    module: payload.module ?? 'system',
    action: payload.action ?? 'updated',
    summary: payload.summary ?? 'Updated event operations.',
    actorRole: state.selectedOperatorRole,
    createdAt: new Date().toISOString(),
    severity: payload.severity ?? 'info',
  }
  state.auditLogByEvent[eventId] = [entry, ...log].slice(0, 250)
  return entry
}

function assertPermission(state, permission) {
  const permissions = getManageRolePermissions(state.selectedOperatorRole)
  if (permissions.includes(permission)) return
  throw new Error(`Your current role cannot access ${permissionLabels[permission] ?? permission}.`)
}

function assertAnyPermission(state, permissions) {
  const granted = getManageRolePermissions(state.selectedOperatorRole)
  if (permissions.some((permission) => granted.includes(permission))) return
  throw new Error('Your current role does not have permission for this action.')
}

function computeTableSummary(event, guests) {
  if (!event?.tables?.length) return []
  return event.tables.map((table) => {
    const seatedGuests = guests.filter((guest) => guest.tableLabel === table.label)
    return {
      ...table,
      seated: seatedGuests.length,
      available: Math.max(table.capacity - seatedGuests.length, 0),
      guests: seatedGuests.map((guest) => ({
        id: guest.id,
        name: guest.name,
        ticketType: guest.ticketType,
      })),
    }
  })
}

function slugifyName(value) {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function buildGuestQrCode(eventId, guest) {
  return `EVENTPH|${eventId}|${guest.id}|${slugifyName(guest.name)}`
}

function escapeCsvValue(value) {
  const raw = String(value ?? '')
  if (/[,"\n]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`
  }
  return raw
}

function toCsv(rows) {
  return rows.map((row) => row.map(escapeCsvValue).join(',')).join('\n')
}

function getCapacitySnapshotFromState(state, eventId) {
  const event = getEventFromState(state, eventId)
  if (!event) return null
  const guests = getGuestsForEvent(state, eventId)
  const checkedIn = guests.filter((guest) => Boolean(guest.checkedInAt)).length
  const pending = guests.length - checkedIn
  const waitlist = getWaitlistForEvent(state, eventId).filter((entry) => entry.status === 'waiting')
  const availableSlots = Math.max((event.guestCapacity ?? 0) - guests.length, 0)
  return {
    event,
    registered: guests.length,
    checkedIn,
    pending,
    waitlistCount: waitlist.length,
    availableSlots,
  }
}

export function getManageRolePermissions(role) {
  return operatorRolePermissions[role] ? [...operatorRolePermissions[role]] : [...operatorRolePermissions.staff]
}

export async function getManageBootstrap(options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  const events = [...state.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  return {
    selectedEventId: state.selectedEventId,
    selectedOperatorRole: state.selectedOperatorRole,
    events,
  }
}

export async function listManageEvents(filters = {}, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'events')
  const query = normalizeText(filters.query)
  const status = filters.status ?? 'All'

  return state.events
    .filter((event) => (status === 'All' ? true : event.status === status))
    .filter((event) =>
      includesQuery(event.title, query) ||
      includesQuery(event.city, query) ||
      includesQuery(event.venue, query),
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export async function setManageSelectedEvent(eventId, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  const target = getEventFromState(state, eventId)
  if (!target) return { selectedEventId: state.selectedEventId }
  state.selectedEventId = eventId
  writeState(state)
  return { selectedEventId: eventId }
}

export async function setManageOperatorRole(role, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  const normalized = operatorRolePermissions[role] ? role : 'staff'
  state.selectedOperatorRole = normalized
  writeState(state)
  return { selectedOperatorRole: normalized, permissions: getManageRolePermissions(normalized) }
}

export async function listManageGuests(eventId, filters = {}, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'guests')
  const guests = getGuestsForEvent(state, eventId)
  const query = normalizeText(filters.query)
  const status = filters.status ?? 'all'
  const ticketType = filters.ticketType ?? 'all'

  return guests
    .filter((guest) => {
      if (ticketType !== 'all' && guest.ticketType !== ticketType) return false
      if (status === 'checkedIn' && !guest.checkedInAt) return false
      if (status === 'pending' && guest.checkedInAt) return false
      if (status === 'walkIn' && !guest.isWalkIn) return false
      return true
    })
    .filter((guest) =>
      includesQuery(guest.id, query) ||
      includesQuery(guest.name, query) ||
      includesQuery(guest.tableLabel, query) ||
      includesQuery(guest.ticketType, query),
    )
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function listManageTables(eventId, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'seating')
  const event = getEventFromState(state, eventId)
  if (!event) return []
  const guests = getGuestsForEvent(state, eventId)
  const summary = computeTableSummary(event, guests)
  return summary.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }))
}

export async function assignGuestSeat(eventId, guestId, tableLabel, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'seating')
  const event = getEventFromState(state, eventId)
  if (!event) throw new Error('Event not found.')

  const guests = getGuestsForEvent(state, eventId)
  const guestIndex = guests.findIndex((guest) => guest.id === guestId)
  if (guestIndex < 0) throw new Error('Guest not found.')
  const nextTableLabel = tableLabel || null

  if (nextTableLabel) {
    const table = event.tables.find((item) => item.label === nextTableLabel)
    if (!table) throw new Error('Table not found.')
    const occupiedCount = guests.filter((guest) => guest.tableLabel === nextTableLabel && guest.id !== guestId).length
    if (occupiedCount >= table.capacity) {
      throw new Error(`Table ${nextTableLabel} is already full.`)
    }
  }

  const updatedGuest = {
    ...guests[guestIndex],
    tableLabel: nextTableLabel,
  }
  guests[guestIndex] = updatedGuest
  state.guestsByEvent[eventId] = guests
  appendAuditLogEntry(state, eventId, {
    module: 'seating',
    action: 'seat_assigned',
    summary: `${updatedGuest.name} assigned to ${nextTableLabel || 'no table'}.`,
  })
  writeState(state)
  return clone(updatedGuest)
}

export async function checkInGuest(eventId, guestId, input = {}, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'checkin')
  const guests = getGuestsForEvent(state, eventId)
  const index = guests.findIndex((guest) => guest.id === guestId)
  if (index < 0) {
    throw new Error('Guest not found for this event.')
  }

  const existing = guests[index]
  if (!existing.checkedInAt) {
    const checkedInAt = new Date().toISOString()
    guests[index] = {
      ...existing,
      checkedInAt,
      checkInSource: input.source ?? 'manual',
    }
    const log = state.checkInLogByEvent[eventId] ?? []
    log.unshift({
      id: `log-${Date.now()}`,
      guestId,
      name: existing.name,
      source: input.source ?? 'manual',
      checkedInAt,
      ticketType: existing.ticketType,
    })
    state.checkInLogByEvent[eventId] = log.slice(0, 100)
    appendAuditLogEntry(state, eventId, {
      module: 'checkin',
      action: 'guest_checked_in',
      summary: `${existing.name} checked in via ${input.source ?? 'manual'}.`,
    })
  }

  state.guestsByEvent[eventId] = guests
  writeState(state)
  return clone(state.guestsByEvent[eventId][index])
}

export async function validateManageQrCode(eventId, rawCode, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'qr')
  const code = String(rawCode ?? '').trim()
  if (!code) throw new Error('QR code is empty.')

  const guests = getGuestsForEvent(state, eventId)
  const byId = guests.find((guest) => guest.id.toLowerCase() === code.toLowerCase())
  if (byId) return clone(byId)

  const parts = code.split('|')
  if (parts.length >= 3 && parts[0] === 'EVENTPH') {
    const qrEventId = parts[1]
    const guestId = parts[2]
    if (qrEventId !== eventId) {
      throw new Error('This QR belongs to a different event.')
    }
    const guest = guests.find((item) => item.id === guestId)
    if (!guest) throw new Error('Guest referenced in QR was not found.')
    return clone(guest)
  }

  const urlMatch = code.match(/\/qr\/([^/]+)\/([^/]+)$/i)
  if (urlMatch) {
    const [, qrEventId, guestId] = urlMatch
    if (qrEventId !== eventId) throw new Error('This QR belongs to a different event.')
    const guest = guests.find((item) => item.id === guestId)
    if (!guest) throw new Error('Guest referenced in QR was not found.')
    return clone(guest)
  }

  throw new Error('QR code format is invalid.')
}

export async function getGuestQrPayload(eventId, guestId, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'qr')
  const guest = getGuestFromState(state, eventId, guestId)
  if (!guest) throw new Error('Guest not found for QR generation.')
  return {
    eventId,
    guestId: guest.id,
    guestName: guest.name,
    payload: buildGuestQrCode(eventId, guest),
  }
}

export async function registerWalkIn(eventId, payload, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'checkin')
  const event = getEventFromState(state, eventId)
  if (!event) throw new Error('Event not found.')

  const guests = getGuestsForEvent(state, eventId)
  const latestId = guests.reduce((max, guest) => {
    const match = String(guest.id).match(/(\d+)$/)
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)

  const tableSummary = computeTableSummary(event, guests)
  const openTable = tableSummary.find((table) => table.available > 0)
  const checkedInAt = new Date().toISOString()

  const newGuest = {
    id: `g-${latestId + 1}`,
    name: payload.name,
    ticketType: payload.ticketType ?? 'General',
    tableLabel: openTable?.label ?? null,
    phone: payload.phone ?? '',
    checkedInAt,
    checkInSource: 'walk-in',
    isWalkIn: true,
  }

  const nextGuests = [...guests, newGuest]
  state.guestsByEvent[eventId] = nextGuests
  const log = state.checkInLogByEvent[eventId] ?? []
  log.unshift({
    id: `log-${Date.now()}`,
    guestId: newGuest.id,
    name: newGuest.name,
    source: 'walk-in',
    checkedInAt,
    ticketType: newGuest.ticketType,
  })
  state.checkInLogByEvent[eventId] = log.slice(0, 100)
  appendAuditLogEntry(state, eventId, {
    module: 'checkin',
    action: 'walkin_registered',
    summary: `Walk-in registered: ${newGuest.name}.`,
  })
  writeState(state)
  return clone(newGuest)
}

export async function listRecentCheckIns(eventId, limit = 8, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertAnyPermission(state, ['dashboard', 'checkin'])
  const log = state.checkInLogByEvent[eventId] ?? []
  return clone(log.slice(0, limit))
}

export async function listManageStaff(eventId, filters = {}, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'staff')
  const staff = getStaffForEvent(state, eventId)
  const query = normalizeText(filters.query)
  const status = filters.status ?? 'all'

  return staff
    .filter((member) => (status === 'all' ? true : member.status === status))
    .filter((member) =>
      includesQuery(member.name, query) ||
      includesQuery(member.role, query) ||
      includesQuery(member.station, query),
    )
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function updateManageStaffRole(eventId, staffId, role, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'staff')
  const staff = getStaffForEvent(state, eventId)
  const index = staff.findIndex((member) => member.id === staffId)
  if (index < 0) throw new Error('Staff member not found.')

  const nextRole = operatorRolePermissions[role] ? role : 'staff'
  const previousRole = staff[index].role
  staff[index] = { ...staff[index], role: nextRole }
  state.staffByEvent[eventId] = staff
  appendAuditLogEntry(state, eventId, {
    module: 'staff',
    action: 'staff_role_updated',
    summary: `${staff[index].name} role changed from ${previousRole} to ${nextRole}.`,
  })
  writeState(state)
  return clone(staff[index])
}

export async function toggleManageStaffStatus(eventId, staffId, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'staff')
  const staff = getStaffForEvent(state, eventId)
  const index = staff.findIndex((member) => member.id === staffId)
  if (index < 0) throw new Error('Staff member not found.')
  const current = staff[index]
  staff[index] = { ...current, status: current.status === 'active' ? 'inactive' : 'active' }
  state.staffByEvent[eventId] = staff
  appendAuditLogEntry(state, eventId, {
    module: 'staff',
    action: 'staff_status_toggled',
    summary: `${staff[index].name} marked ${staff[index].status}.`,
  })
  writeState(state)
  return clone(staff[index])
}

export async function listManageIncidents(eventId, filters = {}, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'incidents')
  const incidents = getIncidentsForEvent(state, eventId).map(withIncidentDefaults)
  const query = normalizeText(filters.query)
  const status = filters.status ?? 'all'

  return incidents
    .filter((incident) => (status === 'all' ? true : incident.status === status))
    .filter((incident) =>
      includesQuery(incident.title, query) ||
      includesQuery(incident.type, query) ||
      includesQuery(incident.severity, query) ||
      includesQuery(incident.reportedBy, query),
    )
    .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
}

export async function createManageIncident(eventId, payload, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'incidents')
  const incidents = getIncidentsForEvent(state, eventId)
  const incident = withIncidentDefaults({
    id: `inc-${Date.now()}`,
    type: payload.type ?? 'logistics',
    severity: payload.severity ?? 'medium',
    status: 'open',
    title: payload.title ?? 'Untitled incident',
    note: payload.note ?? '',
    reportedBy: payload.reportedBy ?? 'System',
    reportedAt: new Date().toISOString(),
    assignee: payload.assignee ?? '',
  })
  state.incidentsByEvent[eventId] = [incident, ...incidents]
  appendAuditLogEntry(state, eventId, {
    module: 'incidents',
    action: 'incident_opened',
    summary: `Incident opened: ${incident.title}.`,
    severity: incident.severity === 'high' ? 'warning' : 'info',
  })
  writeState(state)
  return clone(incident)
}

export async function updateManageIncidentStatus(eventId, incidentId, nextStatusOrPayload, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'incidents')
  const incidents = getIncidentsForEvent(state, eventId)
  const index = incidents.findIndex((incident) => incident.id === incidentId)
  if (index < 0) throw new Error('Incident not found.')

  const current = withIncidentDefaults(incidents[index])
  const payload = typeof nextStatusOrPayload === 'string'
    ? { status: nextStatusOrPayload }
    : (nextStatusOrPayload ?? {})

  const nextStatus = payload.status ?? current.status
  const transitions = incidentStatusTransitions[current.status] ?? []
  const isStatusChanged = nextStatus !== current.status
  if (isStatusChanged && !transitions.includes(nextStatus)) {
    throw new Error(`Invalid incident status transition from ${current.status} to ${nextStatus}.`)
  }

  const timestamp = new Date().toISOString()
  const nextAssignee = payload.assignee !== undefined ? String(payload.assignee ?? '').trim() : current.assignee
  const nextResolutionNote = payload.resolutionNote !== undefined
    ? String(payload.resolutionNote ?? '').trim()
    : current.resolutionNote

  const updated = {
    ...current,
    status: nextStatus,
    assignee: nextAssignee,
    resolutionNote: nextStatus === 'resolved' ? nextResolutionNote : '',
    acknowledgedAt: current.acknowledgedAt,
    escalatedAt: current.escalatedAt,
    resolvedAt: current.resolvedAt,
  }

  if (nextStatus === 'investigating' && !current.acknowledgedAt) {
    updated.acknowledgedAt = timestamp
  }
  if (nextStatus === 'escalated' && !current.escalatedAt) {
    updated.escalatedAt = timestamp
  }
  if (nextStatus === 'resolved') {
    updated.resolvedAt = timestamp
  }
  if (nextStatus === 'open') {
    updated.resolvedAt = null
  }

  incidents[index] = updated
  state.incidentsByEvent[eventId] = incidents
  appendAuditLogEntry(state, eventId, {
    module: 'incidents',
    action: `incident_${nextStatus}`,
    summary: `Incident updated: ${updated.title} -> ${nextStatus}.`,
    severity: nextStatus === 'escalated' ? 'warning' : 'info',
  })
  writeState(state)
  return clone(updated)
}

export async function listManageWaitlist(eventId, filters = {}, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'waitlist')
  const waitlist = getWaitlistForEvent(state, eventId)
  const query = normalizeText(filters.query)
  const status = filters.status ?? 'all'

  return waitlist
    .filter((entry) => (status === 'all' ? true : entry.status === status))
    .filter((entry) =>
      includesQuery(entry.name, query) ||
      includesQuery(entry.ticketType, query) ||
      includesQuery(entry.phone, query),
    )
    .sort((a, b) => new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime())
}

export async function addManageWaitlistEntry(eventId, payload, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'waitlist')
  const waitlist = getWaitlistForEvent(state, eventId)
  const entry = {
    id: `wl-${Date.now()}`,
    name: payload.name ?? 'Unnamed',
    ticketType: payload.ticketType ?? 'General',
    phone: payload.phone ?? '',
    status: 'waiting',
    requestedAt: new Date().toISOString(),
  }
  state.waitlistByEvent[eventId] = [...waitlist, entry]
  appendAuditLogEntry(state, eventId, {
    module: 'waitlist',
    action: 'waitlist_added',
    summary: `${entry.name} added to waitlist.`,
  })
  writeState(state)
  return clone(entry)
}

export async function approveManageWaitlistEntry(eventId, waitlistId, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'waitlist')
  const capacity = getCapacitySnapshotFromState(state, eventId)
  if (!capacity) throw new Error('Event not found.')
  if (capacity.availableSlots <= 0) {
    throw new Error('No capacity left to approve waitlist entries.')
  }

  const waitlist = getWaitlistForEvent(state, eventId)
  const waitlistIndex = waitlist.findIndex((entry) => entry.id === waitlistId)
  if (waitlistIndex < 0) throw new Error('Waitlist entry not found.')
  const entry = waitlist[waitlistIndex]
  if (entry.status !== 'waiting') return clone(entry)

  const guests = getGuestsForEvent(state, eventId)
  const latestId = guests.reduce((max, guest) => {
    const match = String(guest.id).match(/(\d+)$/)
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)

  const event = getEventFromState(state, eventId)
  const tableSummary = computeTableSummary(event, guests)
  const openTable = tableSummary.find((table) => table.available > 0)

  const approvedGuest = {
    id: `g-${latestId + 1}`,
    name: entry.name,
    ticketType: entry.ticketType,
    tableLabel: openTable?.label ?? null,
    phone: entry.phone,
    checkedInAt: null,
    checkInSource: null,
    isWalkIn: false,
  }

  state.guestsByEvent[eventId] = [...guests, approvedGuest]
  waitlist[waitlistIndex] = {
    ...entry,
    status: 'approved',
    approvedGuestId: approvedGuest.id,
    approvedAt: new Date().toISOString(),
  }
  state.waitlistByEvent[eventId] = waitlist
  appendAuditLogEntry(state, eventId, {
    module: 'waitlist',
    action: 'waitlist_approved',
    summary: `${entry.name} moved from waitlist to guests.`,
  })
  writeState(state)
  return clone(waitlist[waitlistIndex])
}

export async function removeManageWaitlistEntry(eventId, waitlistId, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'waitlist')
  const waitlist = getWaitlistForEvent(state, eventId)
  const index = waitlist.findIndex((entry) => entry.id === waitlistId)
  if (index < 0) throw new Error('Waitlist entry not found.')
  waitlist[index] = {
    ...waitlist[index],
    status: 'removed',
    removedAt: new Date().toISOString(),
  }
  state.waitlistByEvent[eventId] = waitlist
  appendAuditLogEntry(state, eventId, {
    module: 'waitlist',
    action: 'waitlist_removed',
    summary: `${waitlist[index].name} removed from waitlist.`,
  })
  writeState(state)
  return clone(waitlist[index])
}

export async function getManageCapacitySnapshot(eventId, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'waitlist')
  return getCapacitySnapshotFromState(state, eventId)
}

export async function getManageAnalytics(eventId, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'analytics')
  const guests = getGuestsForEvent(state, eventId)
  const incidents = getIncidentsForEvent(state, eventId).map(withIncidentDefaults)
  const checkInLog = state.checkInLogByEvent[eventId] ?? []

  const checkedInGuests = guests.filter((guest) => Boolean(guest.checkedInAt))
  const checkInBySource = checkedInGuests.reduce((acc, guest) => {
    const key = guest.checkInSource || 'unknown'
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  const ticketBreakdown = guests.reduce((acc, guest) => {
    acc[guest.ticketType] = (acc[guest.ticketType] ?? 0) + 1
    return acc
  }, {})

  const hourlyCheckIns = checkInLog.reduce((acc, entry) => {
    const hour = new Date(entry.checkedInAt).getHours()
    const label = `${String(hour).padStart(2, '0')}:00`
    acc[label] = (acc[label] ?? 0) + 1
    return acc
  }, {})

  const now = Date.now()
  const unresolvedIncidents = incidents.filter((incident) => incident.status !== 'resolved')

  return {
    totalGuests: guests.length,
    checkedIn: checkedInGuests.length,
    pending: guests.length - checkedInGuests.length,
    walkIns: guests.filter((guest) => guest.isWalkIn).length,
    openIncidents: incidents.filter((incident) => incident.status === 'open').length,
    unresolvedIncidents: unresolvedIncidents.length,
    escalatedIncidents: incidents.filter((incident) => incident.status === 'escalated').length,
    slaBreaches: unresolvedIncidents.filter((incident) => new Date(incident.slaDueAt).getTime() < now).length,
    checkInBySource,
    ticketBreakdown,
    hourlyCheckIns,
  }
}

export async function exportManageReport(eventId, type = 'attendance', options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'analytics')
  const event = getEventFromState(state, eventId)
  if (!event) throw new Error('Event not found.')
  const safeTitle = slugifyName(event.title).toLowerCase()

  if (type === 'incidents') {
    const incidents = getIncidentsForEvent(state, eventId).map(withIncidentDefaults)
    const csv = toCsv([
      ['incidentId', 'title', 'type', 'severity', 'status', 'assignee', 'slaDueAt', 'reportedBy', 'reportedAt', 'resolvedAt', 'resolutionNote'],
      ...incidents.map((incident) => [
        incident.id,
        incident.title,
        incident.type,
        incident.severity,
        incident.status,
        incident.assignee,
        incident.slaDueAt,
        incident.reportedBy,
        incident.reportedAt,
        incident.resolvedAt,
        incident.resolutionNote,
      ]),
    ])

    return {
      filename: `${safeTitle}-incidents.csv`,
      contentType: 'text/csv',
      content: csv,
    }
  }

  const guests = getGuestsForEvent(state, eventId)
  const csv = toCsv([
    ['guestId', 'name', 'ticketType', 'tableLabel', 'phone', 'checkedInAt', 'checkInSource', 'isWalkIn'],
    ...guests.map((guest) => [
      guest.id,
      guest.name,
      guest.ticketType,
      guest.tableLabel ?? '',
      guest.phone ?? '',
      guest.checkedInAt ?? '',
      guest.checkInSource ?? '',
      guest.isWalkIn ? 'yes' : 'no',
    ]),
  ])

  return {
    filename: `${safeTitle}-attendance.csv`,
    contentType: 'text/csv',
    content: csv,
  }
}

export async function listManageAuditTrail(eventId, filters = {}, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'audit')
  const query = normalizeText(filters.query)
  const module = filters.module ?? 'all'
  const severity = filters.severity ?? 'all'
  const auditLog = getAuditLogForEvent(state, eventId)

  return auditLog
    .filter((entry) => (module === 'all' ? true : entry.module === module))
    .filter((entry) => (severity === 'all' ? true : entry.severity === severity))
    .filter((entry) =>
      includesQuery(entry.summary, query) ||
      includesQuery(entry.action, query) ||
      includesQuery(entry.actorRole, query),
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function getManageDashboard(eventId, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'dashboard')
  const event = getEventFromState(state, eventId)
  if (!event) return null

  const guests = getGuestsForEvent(state, eventId)
  const checkedIn = guests.filter((guest) => Boolean(guest.checkedInAt)).length
  const pending = guests.length - checkedIn
  const walkIns = guests.filter((guest) => guest.isWalkIn).length
  const tableSummary = computeTableSummary(event, guests)
  const seated = guests.filter((guest) => guest.tableLabel).length
  const capacity = getCapacitySnapshotFromState(state, eventId)
  const incidents = getIncidentsForEvent(state, eventId).map(withIncidentDefaults)

  return {
    event,
    totalGuests: guests.length,
    checkedIn,
    pending,
    walkIns,
    seated,
    checkInRate: guests.length ? Math.round((checkedIn / guests.length) * 100) : 0,
    tableSummary,
    availableSlots: capacity?.availableSlots ?? 0,
    waitlistCount: capacity?.waitlistCount ?? 0,
    openIncidents: incidents.filter((incident) => incident.status !== 'resolved').length,
  }
}
