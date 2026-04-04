import {
  manageAuditLogByEvent,
  manageEvents,
  manageGuestsByEvent,
  manageIncidentsByEvent,
  manageOnlineRegistrationByEvent,
  manageOnsiteRegistrationByEvent,
  managePlannerByEvent,
  manageStaffByEvent,
  manageWaitlistByEvent,
} from '@/data/manageData'
import {
  checklistPhases,
  defaultPaymentGateways,
  manageEventCreateDefaults,
  manageEventCreatePayloadFields,
  registrationFieldLibrary,
} from '@/data/manageContracts'

const STORAGE_KEY = 'eventpinas-manage-state'
const DEFAULT_DELAY_MS = 100

const operatorRolePermissions = {
  admin: ['dashboard', 'events', 'planner', 'onlineRegistration', 'onsiteRegistration', 'checkin', 'guests', 'seating', 'staff', 'qr', 'incidents', 'waitlist', 'analytics', 'audit'],
  checkinLead: ['dashboard', 'onsiteRegistration', 'checkin', 'guests', 'qr', 'waitlist', 'incidents', 'analytics', 'audit'],
  seatingLead: ['dashboard', 'planner', 'guests', 'seating', 'waitlist', 'incidents', 'audit'],
  staff: ['dashboard', 'guests'],
}

const permissionLabels = {
  dashboard: 'dashboard metrics',
  events: 'event list',
  planner: 'event planner',
  onlineRegistration: 'online registration',
  onsiteRegistration: 'on-site registration',
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
    plannerByEvent: clone(managePlannerByEvent),
    onlineRegistrationByEvent: clone(manageOnlineRegistrationByEvent),
    onsiteRegistrationByEvent: clone(manageOnsiteRegistrationByEvent),
    checkInLogByEvent: {},
    scanOutcomeLogByEvent: {},
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
      plannerByEvent: parsed.plannerByEvent && typeof parsed.plannerByEvent === 'object' ? parsed.plannerByEvent : clone(managePlannerByEvent),
      onlineRegistrationByEvent: parsed.onlineRegistrationByEvent && typeof parsed.onlineRegistrationByEvent === 'object' ? parsed.onlineRegistrationByEvent : clone(manageOnlineRegistrationByEvent),
      onsiteRegistrationByEvent: parsed.onsiteRegistrationByEvent && typeof parsed.onsiteRegistrationByEvent === 'object' ? parsed.onsiteRegistrationByEvent : clone(manageOnsiteRegistrationByEvent),
      checkInLogByEvent: parsed.checkInLogByEvent && typeof parsed.checkInLogByEvent === 'object' ? parsed.checkInLogByEvent : {},
      scanOutcomeLogByEvent: parsed.scanOutcomeLogByEvent && typeof parsed.scanOutcomeLogByEvent === 'object' ? parsed.scanOutcomeLogByEvent : {},
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

function getScanOutcomeLogForEvent(state, eventId) {
  const source = state.scanOutcomeLogByEvent[eventId]
  return Array.isArray(source) ? source : []
}

function buildScanOutcomeFallbackFromCheckInLog(state, eventId) {
  return (state.checkInLogByEvent[eventId] ?? []).map((entry) => ({
    id: `scan-fallback-${entry.id}`,
    status: 'success',
    source: entry.source ?? 'manual',
    input: entry.guestId ?? '',
    detail: `${entry.name} checked in.`,
    guestId: entry.guestId ?? null,
    name: entry.name ?? null,
    createdAt: entry.checkedInAt ?? new Date().toISOString(),
  }))
}

function filterScanOutcomeEntries(entries, filters = {}) {
  const status = normalizeText(filters.status ?? 'all')
  const source = normalizeText(filters.source ?? 'all')
  const query = normalizeText(filters.query ?? '')
  return entries
    .filter((entry) => (status === 'all' ? true : normalizeText(entry.status) === status))
    .filter((entry) => (source === 'all' ? true : normalizeText(entry.source) === source))
    .filter((entry) => {
      if (!query) return true
      return includesQuery(entry.input, query)
        || includesQuery(entry.detail, query)
        || includesQuery(entry.name, query)
        || includesQuery(entry.guestId, query)
        || includesQuery(entry.source, query)
        || includesQuery(entry.status, query)
    })
}

function getScanOutcomeEntriesFromState(state, eventId, limit = 20, filters = {}) {
  const sourceLog = getScanOutcomeLogForEvent(state, eventId)
  const entries = sourceLog.length > 0
    ? sourceLog
    : buildScanOutcomeFallbackFromCheckInLog(state, eventId)
  const filtered = filterScanOutcomeEntries(entries, filters)
  return clone(filtered.slice(0, limit))
}

function getPlannerForEvent(state, eventId) {
  const source = state.plannerByEvent[eventId]
  return source && typeof source === 'object'
    ? source
    : { eventDetails: {}, checklist: [], budget: [] }
}

function getOnlineRegistrationForEvent(state, eventId) {
  const source = state.onlineRegistrationByEvent[eventId]
  return source && typeof source === 'object'
    ? source
    : { mode: 'free', fields: [], ticketTypes: [], paymentGateways: [] }
}

function getOnsiteRegistrationForEvent(state, eventId) {
  const source = state.onsiteRegistrationByEvent[eventId]
  return source && typeof source === 'object'
    ? source
    : { walkIns: [] }
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

function appendScanOutcomeEntry(state, eventId, payload) {
  if (!eventId) return null
  const log = getScanOutcomeLogForEvent(state, eventId)
  const entry = {
    id: `scan-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    status: payload.status ?? 'success',
    source: payload.source ?? 'scanner',
    input: String(payload.input ?? ''),
    detail: payload.detail ?? '',
    guestId: payload.guestId ?? null,
    name: payload.name ?? null,
    createdAt: payload.createdAt ?? new Date().toISOString(),
  }
  state.scanOutcomeLogByEvent[eventId] = [entry, ...log].slice(0, 250)
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

function parseCsvRows(csvText) {
  const input = String(csvText ?? '')
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]
    if (inQuotes) {
      if (char === '"') {
        if (input[index + 1] === '"') {
          field += '"'
          index += 1
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
      continue
    }
    if (char === ',') {
      row.push(field)
      field = ''
      continue
    }
    if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      continue
    }
    if (char === '\r') continue
    field += char
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows.filter((nextRow) => nextRow.some((cell) => String(cell ?? '').trim() !== ''))
}

function normalizeCsvHeaderKey(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '')
}

function getCsvImportColumnIndexes(header) {
  const getColumnIndex = (...keys) => header.findIndex((column) => keys.includes(column))
  return {
    nameColumnIndex: getColumnIndex('name', 'fullname', 'guestname'),
    ticketColumnIndex: getColumnIndex('tickettype', 'ticket', 'type'),
    phoneColumnIndex: getColumnIndex('phone', 'mobile', 'mobilenumber'),
    tableColumnIndex: getColumnIndex('tablelabel', 'table', 'tableid'),
  }
}

function validateCsvImportRows(csvText) {
  const rows = parseCsvRows(csvText)
  if (rows.length < 2) {
    return {
      ok: false,
      blockingIssue: 'CSV must include a header row and at least one guest row.',
      rows: [],
      header: [],
      rowCount: 0,
      blankNameRows: 0,
      columnIndexes: null,
    }
  }
  const header = rows[0].map(normalizeCsvHeaderKey)
  const columnIndexes = getCsvImportColumnIndexes(header)
  if (columnIndexes.nameColumnIndex < 0) {
    return {
      ok: false,
      blockingIssue: 'CSV is missing required "name" header. Accepted aliases: name, fullName, guestName.',
      rows,
      header,
      rowCount: Math.max(rows.length - 1, 0),
      blankNameRows: 0,
      columnIndexes,
    }
  }

  const blankNameRows = rows
    .slice(1)
    .filter((row) => !String(row[columnIndexes.nameColumnIndex] ?? '').trim())
    .length

  return {
    ok: true,
    blockingIssue: '',
    rows,
    header,
    rowCount: Math.max(rows.length - 1, 0),
    blankNameRows,
    columnIndexes,
  }
}

function normalizeManageGuestPayload(payload = {}) {
  const name = String(payload.name ?? '').trim()
  if (!name) throw new Error('Guest name is required.')

  const normalizedTicket = normalizeText(payload.ticketType)
  const ticketType = normalizedTicket === 'vip'
    ? 'VIP'
    : normalizedTicket === 'staff'
      ? 'Staff'
      : 'General'

  const tableLabel = String(payload.tableLabel ?? '').trim() || null
  return {
    name,
    ticketType,
    phone: String(payload.phone ?? '').trim(),
    tableLabel,
  }
}

function getNextGuestNumber(guests) {
  return guests.reduce((max, guest) => {
    const match = String(guest.id ?? '').match(/(\d+)$/)
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)
}

function formatGuestId(number, minWidth = 3) {
  const width = Math.max(String(number).length, minWidth)
  return `g-${String(number).padStart(width, '0')}`
}

function buildTableOccupancyMap(event, guests) {
  const occupancy = new Map()
  const tables = Array.isArray(event?.tables) ? event.tables : []
  tables.forEach((table) => occupancy.set(table.label, 0))
  guests.forEach((guest) => {
    if (!guest.tableLabel) return
    occupancy.set(guest.tableLabel, (occupancy.get(guest.tableLabel) ?? 0) + 1)
  })
  return occupancy
}

function resolveEventTableLabel(event, value) {
  const requested = String(value ?? '').trim()
  if (!requested) return null
  return event.tables.find((table) => normalizeText(table.label) === normalizeText(requested)) ?? null
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

function buildWalkInCapacityError(event, capacitySnapshot) {
  const totalCapacity = Math.max(Number(event?.guestCapacity ?? 0), 0)
  const registered = Math.max(Number(capacitySnapshot?.registered ?? 0), 0)
  return `Cannot register walk-in: event is already at full capacity (${registered}/${totalCapacity}). Increase event capacity or free up slots first.`
}

function getNextManageEventId(events) {
  const latest = events.reduce((max, event) => {
    const match = String(event.id ?? '').match(/^m-evt-(\d+)$/i)
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)
  return `m-evt-${String(latest + 1).padStart(3, '0')}`
}

function buildDefaultTables(guestCapacity, seatsPerTable) {
  const totalTables = Math.max(Math.ceil(guestCapacity / seatsPerTable), 1)
  return Array.from({ length: totalTables }, (_, index) => ({
    id: `t-${index + 1}`,
    label: `T${index + 1}`,
    capacity: seatsPerTable,
  }))
}

function getMaxNumericSuffix(values, pattern) {
  return values.reduce((max, value) => {
    const match = String(value ?? '').match(pattern)
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)
}

function findRemovableTableIndex(tables, assignedTableLabels) {
  for (let index = tables.length - 1; index >= 0; index -= 1) {
    if (!assignedTableLabels.has(tables[index].label)) {
      return index
    }
  }
  return -1
}

function inferDefaultSeatCapacity(event) {
  const capacities = (event?.tables ?? [])
    .map((table) => Number(table.capacity))
    .filter((value) => Number.isInteger(value) && value > 0)
  if (!capacities.length) return manageEventCreateDefaults.seatsPerTable
  const counts = capacities.reduce((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1
    return acc
  }, {})
  const sorted = Object.entries(counts).sort((a, b) => {
    if (b[1] === a[1]) return Number(a[0]) - Number(b[0])
    return b[1] - a[1]
  })
  return Number(sorted[0][0]) || manageEventCreateDefaults.seatsPerTable
}

function getTotalSeatCapacity(tables) {
  return tables.reduce((sum, table) => sum + Math.max(Number(table.capacity) || 0, 0), 0)
}

function buildSafeTablesForCapacity(event, guests, guestCapacity) {
  const sourceTables = Array.isArray(event?.tables) ? [...event.tables] : []
  const assignedTableLabels = new Set(
    guests
      .map((guest) => guest.tableLabel)
      .filter(Boolean),
  )
  const defaultSeatCapacity = inferDefaultSeatCapacity(event)
  const tables = sourceTables.map((table) => ({ ...table }))

  let nextIdNumber = getMaxNumericSuffix(tables.map((table) => table.id), /^t-(\d+)$/i)

  for (const label of assignedTableLabels) {
    if (tables.some((table) => table.label === label)) continue
    nextIdNumber += 1
    tables.push({ id: `t-${nextIdNumber}`, label, capacity: defaultSeatCapacity })
  }

  while (tables.length > 1 && getTotalSeatCapacity(tables) > guestCapacity) {
    const removableIndex = findRemovableTableIndex(tables, assignedTableLabels)
    if (removableIndex < 0) break
    tables.splice(removableIndex, 1)
  }

  while (getTotalSeatCapacity(tables) < guestCapacity) {
    const nextLabel = buildNextDefaultTableLabel(tables)
    nextIdNumber += 1
    tables.push({ id: `t-${nextIdNumber}`, label: nextLabel, capacity: defaultSeatCapacity })
  }

  return tables
}

function syncTicketTotalsToCapacity(ticketTypes, guestCapacity) {
  if (!Array.isArray(ticketTypes) || ticketTypes.length === 0) {
    return [{ id: 'tt-general', label: 'General', pricePhp: 0, sold: 0, total: guestCapacity }]
  }
  const normalized = ticketTypes.map((type) => {
    const sold = Math.max(Number(type.sold ?? 0), 0)
    const total = Math.max(Number(type.total ?? sold), sold)
    return { ...type, sold, total }
  })
  const currentTotal = normalized.reduce((sum, type) => sum + type.total, 0)
  if (currentTotal === guestCapacity) return normalized

  if (currentTotal < guestCapacity) {
    const preferredIndex = normalized.findIndex((type) => normalizeText(type.label) === 'general')
    const targetIndex = preferredIndex >= 0 ? preferredIndex : 0
    normalized[targetIndex] = {
      ...normalized[targetIndex],
      total: normalized[targetIndex].total + (guestCapacity - currentTotal),
    }
    return normalized
  }

  let remainingToReduce = currentTotal - guestCapacity
  const orderedIndexes = [...normalized.keys()].sort((a, b) => b - a)
  for (const index of orderedIndexes) {
    if (remainingToReduce <= 0) break
    const minTotal = normalized[index].sold
    const reducible = Math.max(normalized[index].total - minTotal, 0)
    const reduceBy = Math.min(reducible, remainingToReduce)
    normalized[index] = { ...normalized[index], total: normalized[index].total - reduceBy }
    remainingToReduce -= reduceBy
  }

  return normalized
}

function syncEventDependentsForCapacity(state, eventId, guestCapacity) {
  const planner = getPlannerForEvent(state, eventId)
  state.plannerByEvent[eventId] = {
    ...planner,
    eventDetails: {
      ...planner.eventDetails,
      guestTarget: guestCapacity,
    },
  }

  const registration = getOnlineRegistrationForEvent(state, eventId)
  state.onlineRegistrationByEvent[eventId] = {
    ...registration,
    ticketTypes: syncTicketTotalsToCapacity(registration.ticketTypes, guestCapacity),
  }
}

function getTableLabelNumber(label) {
  const match = String(label ?? '').match(/^T(\d+)$/i)
  return match ? Number(match[1]) : null
}

function buildNextDefaultTableLabel(tables) {
  let nextDefaultLabelNumber = getMaxNumericSuffix(tables.map((table) => table.label), /^T(\d+)$/i)
  if (nextDefaultLabelNumber === 0) {
    const customMax = tables.reduce((max, table) => {
      const numeric = getTableLabelNumber(table.label)
      return numeric ? Math.max(max, numeric) : max
    }, 0)
    nextDefaultLabelNumber = customMax
  }
  let nextLabel = ''
  do {
    nextDefaultLabelNumber += 1
    nextLabel = `T${nextDefaultLabelNumber}`
  } while (tables.some((table) => table.label === nextLabel))
  return nextLabel
}

function normalizeTableSeats(value) {
  const seats = Number(value)
  if (!Number.isInteger(seats) || seats < 1) {
    throw new Error('seats must be an integer greater than or equal to 1.')
  }
  return seats
}

function findTableIndexByLabel(tables, tableLabel) {
  const normalized = normalizeText(tableLabel)
  return tables.findIndex((table) => normalizeText(table.label) === normalized)
}

function ensureUniqueTableLabel(tables, tableLabel) {
  const normalized = normalizeText(tableLabel)
  return !tables.some((table) => normalizeText(table.label) === normalized)
}

function getTableCapacityAdjustmentPriority(tables, seatedByLabel, options = {}) {
  const anchorLabel = normalizeText(options.anchorLabel)
  return [...tables].sort((left, right) => {
    const leftIsAnchor = anchorLabel && normalizeText(left.label) === anchorLabel
    const rightIsAnchor = anchorLabel && normalizeText(right.label) === anchorLabel
    if (leftIsAnchor !== rightIsAnchor) return leftIsAnchor ? 1 : -1

    const leftSeated = seatedByLabel.get(left.label) ?? 0
    const rightSeated = seatedByLabel.get(right.label) ?? 0
    if (leftSeated !== rightSeated) return leftSeated - rightSeated
    if (left.capacity !== right.capacity) return right.capacity - left.capacity
    return left.label.localeCompare(right.label, undefined, { numeric: true })
  })
}

function buildCapacityAdjustmentSummary(beforeTables, afterTables, targetCapacity, deltaBefore, removedLabels) {
  const beforeByLabel = new Map(beforeTables.map((table) => [table.label, table.capacity]))
  const resizedTables = afterTables
    .map((table) => {
      const previous = beforeByLabel.get(table.label)
      if (previous == null || previous === table.capacity) return null
      return { label: table.label, from: previous, to: table.capacity }
    })
    .filter(Boolean)
    .sort((left, right) => left.label.localeCompare(right.label, undefined, { numeric: true }))

  return {
    targetCapacity,
    totalSeatsBefore: getTotalSeatCapacity(beforeTables),
    totalSeatsAfter: getTotalSeatCapacity(afterTables),
    deltaBefore,
    autoAdjusted: deltaBefore !== 0,
    resizedTables,
    removedTables: [...removedLabels],
  }
}

function reconcileTablesToEventCapacity(event, sourceTables, guests, options = {}) {
  const targetCapacity = Number(event?.guestCapacity)
  if (!Number.isInteger(targetCapacity) || targetCapacity < 1) {
    throw new Error('Event capacity must be an integer greater than or equal to 1.')
  }
  if (!Array.isArray(sourceTables) || sourceTables.length === 0) {
    throw new Error('At least one table is required.')
  }
  if (guests.length > targetCapacity) {
    throw new Error('Event capacity is lower than the current registered guest count. Update event capacity first.')
  }

  const working = sourceTables.map((table) => ({
    ...table,
    capacity: Math.max(Number(table.capacity) || 0, 1),
  }))
  const seatedByLabel = new Map()
  guests.forEach((guest) => {
    if (!guest.tableLabel) return
    seatedByLabel.set(guest.tableLabel, (seatedByLabel.get(guest.tableLabel) ?? 0) + 1)
  })

  const totalBefore = getTotalSeatCapacity(working)
  const deltaBefore = totalBefore - targetCapacity
  const removedLabels = []
  if (deltaBefore > 0) {
    let remainingOver = deltaBefore
    const reductionPriority = getTableCapacityAdjustmentPriority(working, seatedByLabel, options)
    for (const candidate of reductionPriority) {
      if (remainingOver <= 0) break
      const currentIndex = working.findIndex((table) => table.id === candidate.id)
      if (currentIndex < 0) continue
      const current = working[currentIndex]
      const seated = seatedByLabel.get(current.label) ?? 0
      const minimumCapacity = Math.max(seated, 1)
      const reducible = Math.max(current.capacity - minimumCapacity, 0)
      if (reducible <= 0) continue
      const reduceBy = Math.min(reducible, remainingOver)
      current.capacity -= reduceBy
      remainingOver -= reduceBy
    }

    if (remainingOver > 0) {
      const removablePriority = getTableCapacityAdjustmentPriority(
        working.filter((table) => (seatedByLabel.get(table.label) ?? 0) === 0),
        seatedByLabel,
        options,
      )
      for (const candidate of removablePriority) {
        if (remainingOver <= 0) break
        const currentIndex = working.findIndex((table) => table.id === candidate.id)
        if (currentIndex < 0) continue
        const current = working[currentIndex]
        if (working.length <= 1) break
        if (current.capacity > remainingOver) continue
        remainingOver -= current.capacity
        removedLabels.push(current.label)
        working.splice(currentIndex, 1)
      }
    }

    if (remainingOver > 0) {
      throw new Error('Unable to auto-adjust tables to match event capacity without affecting assigned guests.')
    }
  } else if (deltaBefore < 0) {
    const remainingNeeded = Math.abs(deltaBefore)
    const increasePriority = getTableCapacityAdjustmentPriority(working, seatedByLabel, options)
    if (!increasePriority.length) {
      throw new Error('Unable to auto-adjust tables to match event capacity.')
    }
    const baseIncrement = Math.floor(remainingNeeded / increasePriority.length)
    const remainder = remainingNeeded % increasePriority.length
    increasePriority.forEach((candidate, index) => {
      const currentIndex = working.findIndex((table) => table.id === candidate.id)
      if (currentIndex < 0) return
      const increment = baseIncrement + (index < remainder ? 1 : 0)
      if (increment <= 0) return
      working[currentIndex].capacity += increment
    })
  }

  const totalAfter = getTotalSeatCapacity(working)
  if (totalAfter !== targetCapacity) {
    throw new Error('Unable to auto-adjust tables to the exact event capacity.')
  }

  const capacityAdjustment = buildCapacityAdjustmentSummary(
    sourceTables,
    working,
    targetCapacity,
    deltaBefore,
    removedLabels,
  )
  return {
    tables: working,
    targetCapacity,
    capacityAdjustment,
  }
}

function buildDefaultPlanner(eventPayload) {
  const checklistLabelsByPhase = {
    preEvent: 'Finalize event checklist and owner assignments',
    setup: 'Verify table tags and scanner readiness',
    live: 'Monitor check-in queue and seating operations',
    post: 'Export reports and close event operations',
  }
  const checklist = checklistPhases.map((phase, index) => ({
    id: `cl-${phase}-${index + 1}`,
    phase,
    label: checklistLabelsByPhase[phase],
    done: false,
  }))

  const budget = [
    { id: 'bgt-1', category: 'Venue', planned: 0, spent: 0 },
    { id: 'bgt-2', category: 'Food', planned: 0, spent: 0 },
    { id: 'bgt-3', category: 'AV & Lights', planned: 0, spent: 0 },
    { id: 'bgt-4', category: 'Staff', planned: 0, spent: 0 },
    { id: 'bgt-5', category: 'Contingency', planned: 0, spent: 0 },
  ]

  return {
    eventDetails: {
      plannerLead: '',
      guestTarget: eventPayload.guestCapacity,
      venueOpenTime: '',
      showStartTime: '',
    },
    checklist,
    budget,
  }
}

function buildDefaultOnlineRegistration(guestCapacity) {
  const baselineFieldIds = new Set(['name', 'email', 'phone'])
  const fields = registrationFieldLibrary
    .filter((field) => baselineFieldIds.has(field.id))
    .map((field) => ({ ...field }))

  return {
    mode: 'free',
    fields,
    ticketTypes: [
      { id: 'tt-general', label: 'General', pricePhp: 0, sold: 0, total: guestCapacity },
    ],
    paymentGateways: defaultPaymentGateways.map((gateway) => ({ ...gateway })),
  }
}

function normalizeManageEventCreatePayload(payload = {}) {
  const normalized = {
    title: String(payload.title ?? '').trim(),
    date: String(payload.date ?? '').trim(),
    city: String(payload.city ?? '').trim(),
    venue: String(payload.venue ?? '').trim(),
    guestCapacity: Number(payload.guestCapacity),
  }

  for (const field of manageEventCreatePayloadFields) {
    if (field === 'guestCapacity') continue
    if (!normalized[field]) {
      throw new Error(`${field} is required.`)
    }
  }
  if (!Number.isInteger(normalized.guestCapacity) || normalized.guestCapacity < 1) {
    throw new Error('guestCapacity must be an integer greater than or equal to 1.')
  }

  return normalized
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

export async function createManageEvent(payload, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'events')

  const normalized = normalizeManageEventCreatePayload(payload)
  const seatsPerTable = manageEventCreateDefaults.seatsPerTable
  const eventId = getNextManageEventId(state.events)

  const event = {
    id: eventId,
    title: normalized.title,
    city: normalized.city,
    venue: normalized.venue,
    date: normalized.date,
    status: manageEventCreateDefaults.status,
    guestCapacity: normalized.guestCapacity,
    tables: buildDefaultTables(normalized.guestCapacity, seatsPerTable),
  }

  state.events = [...state.events, event]
  state.selectedEventId = eventId
  state.guestsByEvent[eventId] = []
  state.staffByEvent[eventId] = []
  state.incidentsByEvent[eventId] = []
  state.waitlistByEvent[eventId] = []
  state.checkInLogByEvent[eventId] = []
  state.scanOutcomeLogByEvent[eventId] = []
  state.auditLogByEvent[eventId] = []
  state.plannerByEvent[eventId] = buildDefaultPlanner(event)
  state.onlineRegistrationByEvent[eventId] = buildDefaultOnlineRegistration(normalized.guestCapacity)
  state.onsiteRegistrationByEvent[eventId] = { walkIns: [] }

  appendAuditLogEntry(state, eventId, {
    module: 'events',
    action: 'event_created',
    summary: `Event created: ${event.title}.`,
  })
  writeState(state)

  return { event: clone(event), selectedEventId: eventId }
}

export async function updateManageEvent(eventId, payload, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'events')

  const index = state.events.findIndex((event) => event.id === eventId)
  if (index < 0) throw new Error('Event not found.')

  const normalized = normalizeManageEventCreatePayload(payload)
  const guests = getGuestsForEvent(state, eventId)
  if (normalized.guestCapacity < guests.length) {
    throw new Error('Guest capacity cannot be lower than the current registered guest count.')
  }

  const current = state.events[index]
  const capacityChanged = normalized.guestCapacity !== current.guestCapacity
  const nextTables = capacityChanged
    ? buildSafeTablesForCapacity(current, guests, normalized.guestCapacity)
    : current.tables
  const updatedEvent = {
    ...current,
    title: normalized.title,
    city: normalized.city,
    venue: normalized.venue,
    date: normalized.date,
    guestCapacity: normalized.guestCapacity,
    tables: nextTables,
  }

  state.events[index] = updatedEvent
  if (capacityChanged) {
    syncEventDependentsForCapacity(state, eventId, normalized.guestCapacity)
  }
  appendAuditLogEntry(state, eventId, {
    module: 'events',
    action: 'event_updated',
    summary: `Event updated: ${updatedEvent.title}.`,
  })
  writeState(state)

  return { event: clone(updatedEvent), selectedEventId: state.selectedEventId }
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

export async function createManageGuest(eventId, payload, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'guests')
  const event = getEventFromState(state, eventId)
  if (!event) throw new Error('Event not found.')

  const guests = getGuestsForEvent(state, eventId)
  if (guests.length >= (event.guestCapacity ?? 0)) {
    throw new Error('Guest list is already at full event capacity.')
  }

  const normalized = normalizeManageGuestPayload(payload)
  const occupancy = buildTableOccupancyMap(event, guests)
  let tableLabel = null
  if (normalized.tableLabel) {
    const matchedTable = resolveEventTableLabel(event, normalized.tableLabel)
    if (!matchedTable) {
      throw new Error(`Table ${normalized.tableLabel} not found.`)
    }
    const occupied = occupancy.get(matchedTable.label) ?? 0
    if (occupied >= matchedTable.capacity) {
      throw new Error(`Table ${matchedTable.label} is already full.`)
    }
    tableLabel = matchedTable.label
  }

  const nextGuestNumber = getNextGuestNumber(guests) + 1
  const newGuest = {
    id: formatGuestId(nextGuestNumber),
    name: normalized.name,
    ticketType: normalized.ticketType,
    tableLabel,
    phone: normalized.phone,
    checkedInAt: null,
    checkInSource: null,
    isWalkIn: false,
  }

  state.guestsByEvent[eventId] = [...guests, newGuest]
  appendAuditLogEntry(state, eventId, {
    module: 'guests',
    action: 'guest_added',
    summary: `Guest added: ${newGuest.name}.`,
  })
  writeState(state)
  return clone(newGuest)
}

export async function previewManageGuestCsvImport(eventId, csvText, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'guests')
  const event = getEventFromState(state, eventId)
  if (!event) throw new Error('Event not found.')

  const validation = validateCsvImportRows(csvText)
  const guests = getGuestsForEvent(state, eventId)
  const availableSlots = Math.max((event.guestCapacity ?? 0) - guests.length, 0)
  const estimatedRows = Math.max(validation.rowCount - validation.blankNameRows, 0)
  const estimatedImportableRows = Math.min(estimatedRows, availableSlots)
  const blockingIssue = validation.blockingIssue || (availableSlots <= 0 ? 'Event is already at full capacity. Increase event capacity or remove guests before importing.' : '')

  return {
    ok: !blockingIssue,
    blockingIssue,
    header: validation.header,
    rowCount: validation.rowCount,
    blankNameRows: validation.blankNameRows,
    availableSlots,
    estimatedImportableRows,
  }
}

export async function importManageGuestsFromCsv(eventId, csvText, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'guests')
  const event = getEventFromState(state, eventId)
  if (!event) throw new Error('Event not found.')
  const validation = validateCsvImportRows(csvText)
  if (!validation.ok) throw new Error(validation.blockingIssue)
  const { rows, columnIndexes, blankNameRows } = validation
  const guests = getGuestsForEvent(state, eventId)
  const {
    nameColumnIndex,
    ticketColumnIndex,
    phoneColumnIndex,
    tableColumnIndex,
  } = columnIndexes
  if (guests.length >= (event.guestCapacity ?? 0)) {
    throw new Error('Event is already at full capacity. Increase event capacity or remove guests before importing.')
  }

  const occupancy = buildTableOccupancyMap(event, guests)
  let nextGuestNumber = getNextGuestNumber(guests)
  let availableSlots = Math.max((event.guestCapacity ?? 0) - guests.length, 0)
  let warningCount = 0
  let skippedCount = 0
  let capacitySkippedCount = 0
  let invalidTableWarningCount = 0
  let fullTableWarningCount = 0
  const importedGuests = []

  for (const row of rows.slice(1)) {
    const rawName = row[nameColumnIndex]
    const normalizedName = String(rawName ?? '').trim()
    if (!normalizedName) {
      skippedCount += 1
      continue
    }
    if (availableSlots <= 0) {
      skippedCount += 1
      capacitySkippedCount += 1
      continue
    }

    const ticketType = ticketColumnIndex >= 0 ? row[ticketColumnIndex] : 'General'
    const phone = phoneColumnIndex >= 0 ? row[phoneColumnIndex] : ''
    const preferredTable = tableColumnIndex >= 0 ? row[tableColumnIndex] : ''
    const normalized = normalizeManageGuestPayload({
      name: normalizedName,
      ticketType,
      phone,
      tableLabel: preferredTable,
    })

    let tableLabel = null
    if (normalized.tableLabel) {
      const matchedTable = resolveEventTableLabel(event, normalized.tableLabel)
      if (!matchedTable) {
        warningCount += 1
        invalidTableWarningCount += 1
      } else {
        const occupied = occupancy.get(matchedTable.label) ?? 0
        if (occupied >= matchedTable.capacity) {
          warningCount += 1
          fullTableWarningCount += 1
        } else {
          tableLabel = matchedTable.label
          occupancy.set(matchedTable.label, occupied + 1)
        }
      }
    }

    nextGuestNumber += 1
    importedGuests.push({
      id: formatGuestId(nextGuestNumber),
      name: normalized.name,
      ticketType: normalized.ticketType,
      tableLabel,
      phone: normalized.phone,
      checkedInAt: null,
      checkInSource: null,
      isWalkIn: false,
    })
    availableSlots -= 1
  }

  if (!importedGuests.length) {
    const validNameRows = Math.max(validation.rowCount - blankNameRows, 0)
    throw new Error(`No guests were imported. Valid rows: ${validNameRows}. Skipped blank names: ${blankNameRows}. Skipped due to capacity: ${capacitySkippedCount}.`)
  }

  state.guestsByEvent[eventId] = [...guests, ...importedGuests]
  appendAuditLogEntry(state, eventId, {
    module: 'guests',
    action: 'guests_imported',
    summary: `Imported ${importedGuests.length} guest(s) from CSV.`,
    severity: warningCount > 0 || skippedCount > 0 ? 'warning' : 'info',
  })
  writeState(state)

  return {
    addedCount: importedGuests.length,
    skippedCount,
    warningCount,
    blankNameRows,
    capacitySkippedCount,
    invalidTableWarningCount,
    fullTableWarningCount,
    guests: clone(importedGuests),
  }
}

export async function autoAssignManageSeats(eventId, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'seating')
  const event = getEventFromState(state, eventId)
  if (!event) throw new Error('Event not found.')

  const guests = getGuestsForEvent(state, eventId)
  const unassignedGuestIndexes = guests
    .map((guest, index) => ({ guest, index }))
    .filter((entry) => !entry.guest.tableLabel)

  if (!unassignedGuestIndexes.length) {
    return { assignedCount: 0, totalUnassigned: 0, remainingUnassigned: 0 }
  }

  const occupancy = buildTableOccupancyMap(event, guests)
  const tables = Array.isArray(event.tables) ? event.tables : []
  let assignedCount = 0

  for (const entry of unassignedGuestIndexes) {
    const openTable = tables.find((table) => (occupancy.get(table.label) ?? 0) < table.capacity)
    if (!openTable) break
    guests[entry.index] = { ...entry.guest, tableLabel: openTable.label }
    occupancy.set(openTable.label, (occupancy.get(openTable.label) ?? 0) + 1)
    assignedCount += 1
  }

  state.guestsByEvent[eventId] = guests
  if (assignedCount > 0) {
    appendAuditLogEntry(state, eventId, {
      module: 'seating',
      action: 'bulk_seat_auto_assigned',
      summary: `${assignedCount} guest(s) auto-assigned to available seats.`,
    })
    writeState(state)
  }

  return {
    assignedCount,
    totalUnassigned: unassignedGuestIndexes.length,
    remainingUnassigned: unassignedGuestIndexes.length - assignedCount,
  }
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

export async function createManageTable(eventId, payload = {}, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'seating')
  const event = getEventFromState(state, eventId)
  if (!event) throw new Error('Event not found.')

  const seats = normalizeTableSeats(payload.seats)
  const tables = Array.isArray(event.tables) ? [...event.tables] : []
  const labelInput = String(payload.label ?? '').trim()
  const nextLabel = labelInput || buildNextDefaultTableLabel(tables)
  if (!ensureUniqueTableLabel(tables, nextLabel)) {
    throw new Error(`Table label ${nextLabel} already exists.`)
  }

  const nextTableIdNumber = getMaxNumericSuffix(tables.map((table) => table.id), /^t-(\d+)$/i) + 1
  const createdTable = {
    id: `t-${nextTableIdNumber}`,
    label: nextLabel,
    capacity: seats,
  }
  const guests = getGuestsForEvent(state, eventId)
  const mergedTables = [...tables, createdTable]
  const reconciled = reconcileTablesToEventCapacity(event, mergedTables, guests, {
    anchorLabel: createdTable.label,
  })

  const updatedEvent = {
    ...event,
    tables: reconciled.tables,
    guestCapacity: reconciled.targetCapacity,
  }
  state.events = state.events.map((entry) => (entry.id === eventId ? updatedEvent : entry))
  syncEventDependentsForCapacity(state, eventId, reconciled.targetCapacity)
  appendAuditLogEntry(state, eventId, {
    module: 'seating',
    action: 'table_added',
    summary: `Table ${createdTable.label} added with ${createdTable.capacity} seats.`,
  })
  if (reconciled.capacityAdjustment.autoAdjusted) {
    appendAuditLogEntry(state, eventId, {
      module: 'seating',
      action: 'table_capacity_rebalanced',
      summary: `Auto-adjusted tables by ${Math.abs(reconciled.capacityAdjustment.deltaBefore)} seat(s) to keep capacity at ${reconciled.targetCapacity}.`,
    })
  }
  writeState(state)

  const finalCreatedTable = reconciled.tables.find((table) => table.id === createdTable.id)
  return {
    table: finalCreatedTable ? clone(finalCreatedTable) : null,
    event: clone(updatedEvent),
    guestCapacity: reconciled.targetCapacity,
    capacityAdjustment: clone(reconciled.capacityAdjustment),
  }
}

export async function updateManageTableSeats(eventId, tableLabel, seats, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'seating')
  const event = getEventFromState(state, eventId)
  if (!event) throw new Error('Event not found.')

  const nextSeats = normalizeTableSeats(seats)
  const tables = Array.isArray(event.tables) ? [...event.tables] : []
  const tableIndex = findTableIndexByLabel(tables, tableLabel)
  if (tableIndex < 0) throw new Error('Table not found.')
  const targetTable = tables[tableIndex]
  const guests = getGuestsForEvent(state, eventId)
  const seatedCount = guests.filter((guest) => guest.tableLabel === targetTable.label).length
  if (nextSeats < seatedCount) {
    throw new Error(`Seats cannot be lower than currently seated guests (${seatedCount}).`)
  }

  const nextTables = tables.map((table, index) => (
    index === tableIndex ? { ...table, capacity: nextSeats } : table
  ))
  const reconciled = reconcileTablesToEventCapacity(event, nextTables, guests, {
    anchorLabel: targetTable.label,
  })

  const updatedEvent = {
    ...event,
    tables: reconciled.tables,
    guestCapacity: reconciled.targetCapacity,
  }
  state.events = state.events.map((entry) => (entry.id === eventId ? updatedEvent : entry))
  syncEventDependentsForCapacity(state, eventId, reconciled.targetCapacity)
  appendAuditLogEntry(state, eventId, {
    module: 'seating',
    action: 'table_seats_updated',
    summary: `${targetTable.label} seat count changed to ${nextSeats}.`,
  })
  if (reconciled.capacityAdjustment.autoAdjusted) {
    appendAuditLogEntry(state, eventId, {
      module: 'seating',
      action: 'table_capacity_rebalanced',
      summary: `Auto-adjusted tables by ${Math.abs(reconciled.capacityAdjustment.deltaBefore)} seat(s) to keep capacity at ${reconciled.targetCapacity}.`,
    })
  }
  writeState(state)

  const updatedTable = reconciled.tables.find((table) => table.label === targetTable.label)
  return {
    table: updatedTable ? clone(updatedTable) : null,
    event: clone(updatedEvent),
    guestCapacity: reconciled.targetCapacity,
    capacityAdjustment: clone(reconciled.capacityAdjustment),
  }
}

export async function removeManageTable(eventId, tableLabel, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'seating')
  const event = getEventFromState(state, eventId)
  if (!event) throw new Error('Event not found.')

  const tables = Array.isArray(event.tables) ? [...event.tables] : []
  const tableIndex = findTableIndexByLabel(tables, tableLabel)
  if (tableIndex < 0) throw new Error('Table not found.')
  if (tables.length <= 1) {
    throw new Error('Cannot remove last table.')
  }

  const targetTable = tables[tableIndex]
  const guests = getGuestsForEvent(state, eventId)
  const seatedCount = guests.filter((guest) => guest.tableLabel === targetTable.label).length
  if (seatedCount > 0) {
    throw new Error(`Cannot remove table ${targetTable.label} because it has assigned guests.`)
  }

  const nextTables = tables.filter((_, index) => index !== tableIndex)
  const reconciled = reconcileTablesToEventCapacity(event, nextTables, guests)

  const updatedEvent = {
    ...event,
    tables: reconciled.tables,
    guestCapacity: reconciled.targetCapacity,
  }
  state.events = state.events.map((entry) => (entry.id === eventId ? updatedEvent : entry))
  syncEventDependentsForCapacity(state, eventId, reconciled.targetCapacity)
  appendAuditLogEntry(state, eventId, {
    module: 'seating',
    action: 'table_removed',
    summary: `Table ${targetTable.label} removed.`,
  })
  if (reconciled.capacityAdjustment.autoAdjusted) {
    appendAuditLogEntry(state, eventId, {
      module: 'seating',
      action: 'table_capacity_rebalanced',
      summary: `Auto-adjusted tables by ${Math.abs(reconciled.capacityAdjustment.deltaBefore)} seat(s) to keep capacity at ${reconciled.targetCapacity}.`,
    })
  }
  writeState(state)

  return {
    removedTableLabel: targetTable.label,
    event: clone(updatedEvent),
    guestCapacity: reconciled.targetCapacity,
    capacityAdjustment: clone(reconciled.capacityAdjustment),
  }
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
    appendScanOutcomeEntry(state, eventId, {
      status: 'success',
      source: input.source ?? 'manual',
      input: input.rawCode ?? existing.id,
      detail: `${existing.name} checked in.`,
      guestId,
      name: existing.name,
      createdAt: checkedInAt,
    })
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
  const qrPath = `/qr/${eventId}/${guest.id}`
  const fallbackBaseUrl = 'https://eventpinas.com'
  const baseUrl = String(
    options.baseUrl ??
    (typeof window !== 'undefined' ? window.location.origin : fallbackBaseUrl),
  )
  const shareUrl = new URL(qrPath, baseUrl).toString()
  return {
    eventId,
    guestId: guest.id,
    guestName: guest.name,
    payload: buildGuestQrCode(eventId, guest),
    qrPath,
    shareUrl,
  }
}

export async function registerWalkIn(eventId, payload, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'checkin')
  const event = getEventFromState(state, eventId)
  if (!event) throw new Error('Event not found.')

  const guests = getGuestsForEvent(state, eventId)
  const capacity = getCapacitySnapshotFromState(state, eventId)
  if ((capacity?.availableSlots ?? 0) <= 0) {
    throw new Error(buildWalkInCapacityError(event, capacity))
  }
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
  appendScanOutcomeEntry(state, eventId, {
    status: 'success',
    source: 'walk-in',
    input: payload.name ?? '',
    detail: `${newGuest.name} registered as walk-in.`,
    guestId: newGuest.id,
    name: newGuest.name,
    createdAt: checkedInAt,
  })
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

export async function listManageScanOutcomes(eventId, limit = 20, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertAnyPermission(state, ['checkin', 'qr', 'dashboard'])
  return getScanOutcomeEntriesFromState(state, eventId, limit, options)
}

export async function recordManageScanOutcome(eventId, payload, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertAnyPermission(state, ['checkin', 'qr'])
  appendScanOutcomeEntry(state, eventId, payload ?? {})
  writeState(state)
  return { ok: true }
}

export async function exportManageScanOutcomes(eventId, filters = {}, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertAnyPermission(state, ['checkin', 'qr', 'analytics'])
  const event = getEventFromState(state, eventId)
  if (!event) throw new Error('Event not found.')

  const safeTitle = slugifyName(event.title).toLowerCase()
  const outcomes = getScanOutcomeEntriesFromState(state, eventId, 1000, filters)
  const csv = toCsv([
    ['scanId', 'status', 'source', 'input', 'detail', 'guestId', 'name', 'createdAt'],
    ...outcomes.map((entry) => [
      entry.id,
      entry.status,
      entry.source,
      entry.input,
      entry.detail,
      entry.guestId ?? '',
      entry.name ?? '',
      entry.createdAt,
    ]),
  ])

  return {
    filename: `${safeTitle}-scan-log.csv`,
    contentType: 'text/csv',
    content: csv,
    count: outcomes.length,
  }
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
  assertAnyPermission(state, ['waitlist', 'onsiteRegistration', 'checkin', 'guests'])
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

export async function getManagePlanner(eventId, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'planner')
  return clone(getPlannerForEvent(state, eventId))
}

export async function toggleManagePlannerChecklistItem(eventId, checklistId, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'planner')

  const planner = getPlannerForEvent(state, eventId)
  const checklist = Array.isArray(planner.checklist) ? [...planner.checklist] : []
  const index = checklist.findIndex((item) => item.id === checklistId)
  if (index < 0) throw new Error('Checklist item not found.')
  checklist[index] = { ...checklist[index], done: !checklist[index].done }

  state.plannerByEvent[eventId] = { ...planner, checklist }
  appendAuditLogEntry(state, eventId, {
    module: 'planner',
    action: 'planner_checklist_toggled',
    summary: `Checklist updated: ${checklist[index].label}.`,
  })
  writeState(state)
  return clone(checklist[index])
}

export async function updateManageBudgetCategorySpend(eventId, budgetId, spent, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'planner')

  const planner = getPlannerForEvent(state, eventId)
  const budget = Array.isArray(planner.budget) ? [...planner.budget] : []
  const index = budget.findIndex((item) => item.id === budgetId)
  if (index < 0) throw new Error('Budget category not found.')
  const numeric = Number(spent)
  budget[index] = { ...budget[index], spent: Number.isFinite(numeric) ? Math.max(numeric, 0) : budget[index].spent }
  state.plannerByEvent[eventId] = { ...planner, budget }
  appendAuditLogEntry(state, eventId, {
    module: 'planner',
    action: 'planner_budget_updated',
    summary: `Budget updated for ${budget[index].category}.`,
  })
  writeState(state)
  return clone(budget[index])
}

export async function getManageOnlineRegistration(eventId, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'onlineRegistration')
  return clone(getOnlineRegistrationForEvent(state, eventId))
}

export async function reorderManageRegistrationField(eventId, fromIndex, toIndex, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'onlineRegistration')

  const config = getOnlineRegistrationForEvent(state, eventId)
  const fields = Array.isArray(config.fields) ? [...config.fields] : []
  if (fields.length < 2) return clone(fields)
  if (fromIndex < 0 || fromIndex >= fields.length || toIndex < 0 || toIndex >= fields.length) {
    throw new Error('Invalid field move.')
  }

  const [moved] = fields.splice(fromIndex, 1)
  fields.splice(toIndex, 0, moved)
  state.onlineRegistrationByEvent[eventId] = { ...config, fields }
  appendAuditLogEntry(state, eventId, {
    module: 'registration',
    action: 'registration_fields_reordered',
    summary: `Registration field order updated.`,
  })
  writeState(state)
  return clone(fields)
}

export async function setManageRegistrationMode(eventId, mode, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'onlineRegistration')
  const config = getOnlineRegistrationForEvent(state, eventId)
  const normalized = mode === 'free' ? 'free' : 'ticketed'
  state.onlineRegistrationByEvent[eventId] = { ...config, mode: normalized }
  appendAuditLogEntry(state, eventId, {
    module: 'registration',
    action: 'registration_mode_updated',
    summary: `Registration mode set to ${normalized}.`,
  })
  writeState(state)
  return { mode: normalized }
}

export async function toggleManageRegistrationGateway(eventId, gatewayId, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'onlineRegistration')
  const config = getOnlineRegistrationForEvent(state, eventId)
  const gateways = Array.isArray(config.paymentGateways) ? [...config.paymentGateways] : []
  const index = gateways.findIndex((gateway) => gateway.id === gatewayId)
  if (index < 0) throw new Error('Payment gateway not found.')
  gateways[index] = { ...gateways[index], enabled: !gateways[index].enabled }
  state.onlineRegistrationByEvent[eventId] = { ...config, paymentGateways: gateways }
  appendAuditLogEntry(state, eventId, {
    module: 'registration',
    action: 'registration_gateway_toggled',
    summary: `Gateway ${gateways[index].label} is now ${gateways[index].enabled ? 'enabled' : 'disabled'}.`,
  })
  writeState(state)
  return clone(gateways[index])
}

export async function getManageOnsiteRegistration(eventId, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertPermission(state, 'onsiteRegistration')
  const payload = getOnsiteRegistrationForEvent(state, eventId)
  return clone(payload)
}

export async function createManageOnsiteWalkIn(eventId, payload, options = {}) {
  if (options.simulateLatency !== false) await wait(options.delayMs ?? DEFAULT_DELAY_MS)
  const state = readState()
  assertAnyPermission(state, ['onsiteRegistration', 'checkin'])
  const event = getEventFromState(state, eventId)
  if (!event) throw new Error('Event not found.')
  if (!payload?.guestName) throw new Error('Guest name is required.')

  const guests = getGuestsForEvent(state, eventId)
  const capacity = getCapacitySnapshotFromState(state, eventId)
  if ((capacity?.availableSlots ?? 0) <= 0) {
    throw new Error(buildWalkInCapacityError(event, capacity))
  }
  const latestId = guests.reduce((max, guest) => {
    const match = String(guest.id).match(/(\d+)$/)
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)

  const tableSummary = computeTableSummary(event, guests)
  const openTable = tableSummary.find((table) => table.available > 0)
  const checkedInAt = new Date().toISOString()
  const ticketType = payload.ticketType ?? 'General'
  const phone = payload.phone ?? ''

  const newGuest = {
    id: `g-${latestId + 1}`,
    name: payload.guestName,
    ticketType,
    tableLabel: openTable?.label ?? null,
    phone,
    checkedInAt,
    checkInSource: 'onsite',
    isWalkIn: true,
  }
  state.guestsByEvent[eventId] = [...guests, newGuest]

  const checkInLog = state.checkInLogByEvent[eventId] ?? []
  checkInLog.unshift({
    id: `log-${Date.now()}`,
    guestId: newGuest.id,
    name: newGuest.name,
    source: 'onsite',
    checkedInAt,
    ticketType: newGuest.ticketType,
  })
  state.checkInLogByEvent[eventId] = checkInLog.slice(0, 100)
  appendScanOutcomeEntry(state, eventId, {
    status: 'success',
    source: 'onsite',
    input: payload.guestName,
    detail: `${newGuest.name} registered on-site.`,
    guestId: newGuest.id,
    name: newGuest.name,
    createdAt: checkedInAt,
  })

  const onsite = getOnsiteRegistrationForEvent(state, eventId)
  const walkIns = Array.isArray(onsite.walkIns) ? [...onsite.walkIns] : []
  const record = {
    id: `onsite-${Date.now()}`,
    guestName: payload.guestName,
    ticketType,
    paymentMethod: payload.paymentMethod ?? 'Cash',
    amountPaid: Number(payload.amountPaid ?? 0),
    createdAt: checkedInAt,
    badgePrinted: Boolean(payload.badgePrinted),
  }
  walkIns.unshift(record)
  state.onsiteRegistrationByEvent[eventId] = { ...onsite, walkIns: walkIns.slice(0, 200) }
  appendAuditLogEntry(state, eventId, {
    module: 'onsite',
    action: 'onsite_walkin_created',
    summary: `On-site walk-in registered: ${payload.guestName}.`,
  })
  writeState(state)
  return clone(record)
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
