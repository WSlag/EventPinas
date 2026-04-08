import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import {
  ManageBadge,
  ManageButton,
  ManageCard,
  ManageFilterBar,
  ManageFilterChip,
  ManageKpiTile,
  ManageSectionHeader,
} from '@/components/ui/ManagePrimitives'
import {
  KanbanBoard,
  KanbanCard,
  KanbanColumn,
  KanbanDragCard,
} from '@/components/ui/ManageKanban'
import {
  autoAssignManageSeats,
  assignGuestSeat,
  checkInGuest,
  createManageGuest,
  getManageCapacitySnapshot,
  importManageGuestsFromCsv,
  listManageGuests,
  listManageTables,
  previewManageGuestCsvImport,
  subscribeManageGuests,
  subscribeManageTables,
} from '@/services'

function readCsvFileAsText(file) {
  if (typeof file?.text === 'function') return file.text()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Unable to read CSV file.'))
    reader.readAsText(file)
  })
}

function sortTablesByLabel(left, right) {
  return left.label.localeCompare(right.label, undefined, { numeric: true })
}

function ticketTypeTone(type) {
  if (type === 'VIP') return 'warning'
  if (type === 'Staff') return 'info'
  return 'neutral'
}

function formatGuestSeatText(guest) {
  if (!guest?.tableLabel) return 'No seat'
  if (guest?.seatNumber) return `Table ${guest.tableLabel} - Seat ${guest.seatNumber}`
  return `Table ${guest.tableLabel}`
}

const KANBAN_COLUMNS = [
  {
    id: 'pending',
    label: 'Pending',
    accentColor: '#8B9BB4',
    filterFn: (g) => !g.checkedInAt && !g.isWalkIn,
  },
  {
    id: 'walkin',
    label: 'Walk-ins',
    accentColor: '#C8962E',
    filterFn: (g) => g.isWalkIn && !g.checkedInAt,
  },
  {
    id: 'checkedin',
    label: 'Checked In',
    accentColor: '#22C55E',
    filterFn: (g) => !!g.checkedInAt,
  },
]

const quickFilterOptions = [
  { id: 'all', label: 'All' },
  { id: 'checkedIn', label: 'Checked-in' },
  { id: 'pending', label: 'Pending' },
  { id: 'walkIn', label: 'Walk-in' },
  { id: 'vip', label: 'VIP' },
  { id: 'staff', label: 'Staff' },
]

export default function ManageGuestsPage() {
  const { selectedEventId, selectedEvent, permissions } = useOutletContext()
  const [activeTab, setActiveTab] = useState('pending')
  const [showStatsTools, setShowStatsTools] = useState(false)
  const [guests, setGuests] = useState([])
  const [allGuests, setAllGuests] = useState([])
  const [tables, setTables] = useState([])
  const [capacitySnapshot, setCapacitySnapshot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [actionTone, setActionTone] = useState('info')
  const [query, setQuery] = useState('')
  const [quickFilter, setQuickFilter] = useState('all')
  const [manualName, setManualName] = useState('')
  const [manualPhone, setManualPhone] = useState('')
  const [manualTicketType, setManualTicketType] = useState('General')
  const [manualTableLabel, setManualTableLabel] = useState('')
  const [csvText, setCsvText] = useState('name,ticketType,phone,tableLabel,seatNumber\n')
  const [csvPreview, setCsvPreview] = useState(null)
  const [csvPreviewLoading, setCsvPreviewLoading] = useState(false)
  const [csvFileName, setCsvFileName] = useState('')
  const [uploadingCsvFile, setUploadingCsvFile] = useState(false)
  const [guestTableDraftById, setGuestTableDraftById] = useState({})
  const [assigningGuestId, setAssigningGuestId] = useState('')
  const [selectedGuestIds, setSelectedGuestIds] = useState([])
  const [bulkTargetTableLabel, setBulkTargetTableLabel] = useState('')
  const [bulkAssigning, setBulkAssigning] = useState(false)
  const [addingGuest, setAddingGuest] = useState(false)
  const [importingCsv, setImportingCsv] = useState(false)
  const [assigningSeats, setAssigningSeats] = useState(false)
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [showImportPanel, setShowImportPanel] = useState(false)
  const csvFileInputRef = useRef(null)

  // Kanban column refs for drag hit-testing
  const pendingColRef = useRef(null)
  const walkinColRef = useRef(null)
  const checkedinColRef = useRef(null)
  const kanbanColumnRefs = useMemo(() => {
    const map = new Map()
    map.set('pending', pendingColRef)
    map.set('walkin', walkinColRef)
    map.set('checkedin', checkedinColRef)
    return map
  }, [])

  const canAccessGuests = permissions.includes('guests')
  const canEditSeating = permissions.includes('seating')

  const loadGuestsData = useCallback(async () => {
    if (!selectedEventId) return
    const guestFilters = { query, status: 'all' }
    if (quickFilter === 'checkedIn') guestFilters.status = 'checkedIn'
    if (quickFilter === 'pending') guestFilters.status = 'pending'
    if (quickFilter === 'walkIn') guestFilters.status = 'walkIn'
    if (quickFilter === 'vip') guestFilters.ticketType = 'VIP'
    if (quickFilter === 'staff') guestFilters.ticketType = 'Staff'
    const [guestPayload, allGuestPayload, tablePayload, capacityPayload] = await Promise.all([
      listManageGuests(selectedEventId, guestFilters, { simulateLatency: false }),
      listManageGuests(selectedEventId, { status: 'all' }, { simulateLatency: false }),
      canEditSeating
        ? listManageTables(selectedEventId, { simulateLatency: false })
        : Promise.resolve([]),
      getManageCapacitySnapshot(selectedEventId, { simulateLatency: false }),
    ])
    setGuests(guestPayload)
    setAllGuests(allGuestPayload)
    setTables(tablePayload)
    setCapacitySnapshot(capacityPayload)
  }, [selectedEventId, query, quickFilter, canEditSeating])

  useEffect(() => {
    if (!selectedEventId || !canAccessGuests) { setLoading(false); return }
    let active = true
    async function loadGuests() {
      setLoading(true)
      setError('')
      try { await loadGuestsData() }
      catch { if (active) setError('Unable to load guests for this event.') }
      finally { if (active) setLoading(false) }
    }
    loadGuests()
    return () => { active = false }
  }, [selectedEventId, canAccessGuests, loadGuestsData])

  useEffect(() => {
    if (!selectedEventId || !canAccessGuests) return undefined
    const guestFilters = { query, status: 'all' }
    if (quickFilter === 'checkedIn') guestFilters.status = 'checkedIn'
    if (quickFilter === 'pending') guestFilters.status = 'pending'
    if (quickFilter === 'walkIn') guestFilters.status = 'walkIn'
    if (quickFilter === 'vip') guestFilters.ticketType = 'VIP'
    if (quickFilter === 'staff') guestFilters.ticketType = 'Staff'

    const unsubscribeGuests = subscribeManageGuests(selectedEventId, guestFilters, () => {
      void loadGuestsData()
    })
    const unsubscribeTables = canEditSeating
      ? subscribeManageTables(selectedEventId, () => {
        void loadGuestsData()
      })
      : null

    return () => {
      unsubscribeGuests?.()
      unsubscribeTables?.()
    }
  }, [selectedEventId, canAccessGuests, canEditSeating, loadGuestsData, query, quickFilter])

  useEffect(() => {
    if (!selectedEventId) return
    let active = true
    async function buildCsvPreview() {
      setCsvPreviewLoading(true)
      try {
        const preview = await previewManageGuestCsvImport(selectedEventId, csvText, { simulateLatency: false })
        if (active) setCsvPreview(preview)
      } catch {
        if (active) setCsvPreview({ ok: false, blockingIssue: 'Unable to validate CSV preview.', header: [], rowCount: 0, blankNameRows: 0, availableSlots: 0, estimatedImportableRows: 0 })
      } finally {
        if (active) setCsvPreviewLoading(false)
      }
    }
    buildCsvPreview()
    return () => { active = false }
  }, [selectedEventId, csvText])

  const stats = useMemo(() => {
    const checkedIn = allGuests.filter((g) => g.checkedInAt).length
    const pending = allGuests.length - checkedIn
    const walkIns = allGuests.filter((g) => g.isWalkIn).length
    const vip = allGuests.filter((g) => g.ticketType === 'VIP').length
    return { total: allGuests.length, checkedIn, pending, vip, walkIns }
  }, [allGuests])

  const unassignedCount = useMemo(() => allGuests.filter((g) => !g.tableLabel || !g.seatNumber).length, [allGuests])
  const availableSlots = capacitySnapshot?.availableSlots ?? Math.max((selectedEvent?.guestCapacity ?? 0) - stats.total, 0)

  const suggestionByGuestId = useMemo(() => {
    const ticketCountByTableByType = new Map()
    allGuests.forEach((guest) => {
      if (!guest.tableLabel) return
      const typeKey = guest.ticketType || 'General'
      if (!ticketCountByTableByType.has(typeKey)) ticketCountByTableByType.set(typeKey, new Map())
      const map = ticketCountByTableByType.get(typeKey)
      map.set(guest.tableLabel, (map.get(guest.tableLabel) ?? 0) + 1)
    })
    const suggestions = {}
    allGuests.forEach((guest) => {
      if (guest.checkedInAt) { suggestions[guest.id] = { label: '', reason: 'checked-in' }; return }
      const availableTables = tables.filter((t) => t.available > 0 || t.label === guest.tableLabel).sort(sortTablesByLabel)
      if (!availableTables.length) { suggestions[guest.id] = { label: '', reason: 'no-seats' }; return }
      const tableCounts = ticketCountByTableByType.get(guest.ticketType || 'General') ?? new Map()
      const bestClusterTable = [...availableTables].sort((l, r) => {
        const lc = tableCounts.get(l.label) ?? 0, rc = tableCounts.get(r.label) ?? 0
        if (lc !== rc) return rc - lc
        return sortTablesByLabel(l, r)
      })[0]
      const bestClusterCount = tableCounts.get(bestClusterTable.label) ?? 0
      if (bestClusterCount > 0) { suggestions[guest.id] = { label: bestClusterTable.label, reason: 'cluster' }; return }
      const firstOpenTable = availableTables.find((t) => t.available > 0) ?? availableTables[0]
      suggestions[guest.id] = { label: firstOpenTable?.label ?? '', reason: 'first-open' }
    })
    return suggestions
  }, [allGuests, tables])

  useEffect(() => {
    setGuestTableDraftById((prev) => {
      let changed = false
      const next = { ...prev }
      const allGuestIds = new Set(allGuests.map((g) => g.id))
      Object.keys(next).forEach((guestId) => { if (!allGuestIds.has(guestId)) { delete next[guestId]; changed = true } })
      allGuests.forEach((guest) => {
        if (next[guest.id] != null) return
        next[guest.id] = guest.tableLabel ?? suggestionByGuestId[guest.id]?.label ?? ''
        changed = true
      })
      return changed ? next : prev
    })
  }, [allGuests, suggestionByGuestId])

  useEffect(() => {
    setSelectedGuestIds((prev) => {
      const allowed = new Set(allGuests.filter((g) => !g.checkedInAt).map((g) => g.id))
      const filtered = prev.filter((id) => allowed.has(id))
      return filtered.length === prev.length ? prev : filtered
    })
  }, [allGuests])

  async function onAddGuest(event) {
    event.preventDefault()
    if (!selectedEventId) return
    const normalizedName = manualName.trim()
    const normalizedPhone = manualPhone.trim()
    if (!normalizedName || normalizedName.length < 2) {
      setActionTone('danger'); setActionMessage('Please enter a valid guest name (2+ characters.)')
      return
    }
    if (normalizedPhone && !/^[+0-9()\-.\s]{7,20}$/.test(normalizedPhone)) {
      setActionTone('danger'); setActionMessage('Phone format invalid. Use digits and symbols like + - ( ).')
      return
    }
    setAddingGuest(true); setError(''); setActionMessage('')
    try {
      const created = await createManageGuest(selectedEventId, { name: normalizedName, phone: normalizedPhone, ticketType: manualTicketType, tableLabel: canEditSeating ? manualTableLabel : null }, { simulateLatency: false })
      await loadGuestsData()
      setManualName(''); setManualPhone(''); setManualTicketType('General'); setManualTableLabel('')
      setActionTone('success'); setActionMessage(`Guest added: ${created.name}`)
    } catch (err) {
      setActionTone('danger'); setActionMessage(err?.message ?? 'Unable to add guest.')
    } finally {
      setAddingGuest(false)
    }
  }

  async function onImportCsv(event) {
    event.preventDefault()
    if (!selectedEventId || !csvText.trim()) { setActionTone('danger'); setActionMessage('Paste CSV content before importing.'); return }
    if (csvPreview && !csvPreview.ok) { setActionTone('danger'); setActionMessage(csvPreview.blockingIssue || 'CSV has a blocking issue.'); return }
    setImportingCsv(true); setError(''); setActionMessage('')
    try {
      const result = await importManageGuestsFromCsv(selectedEventId, csvText, { simulateLatency: false })
      await loadGuestsData()
      setActionTone(result.warningCount > 0 || result.skippedCount > 0 ? 'warning' : 'success')
      setActionMessage(`Imported ${result.addedCount} guest(s). Skipped ${result.skippedCount}. Warnings: ${result.warningCount}.`)
    } catch (err) {
      setActionTone('danger'); setActionMessage(err?.message ?? 'Unable to import CSV guest list.')
    } finally {
      setImportingCsv(false)
    }
  }

  async function onUploadCsvFile(event) {
    const file = event.target.files?.[0]; event.target.value = ''
    if (!file) return
    const fileName = String(file.name ?? '')
    const mimeType = String(file.type ?? '').toLowerCase()
    if (!fileName.toLowerCase().endsWith('.csv') && !mimeType.includes('csv') && mimeType !== 'text/plain') {
      setActionTone('danger'); setActionMessage('Please upload a valid .csv file.'); return
    }
    setUploadingCsvFile(true)
    try {
      const fileText = await readCsvFileAsText(file)
      if (!String(fileText).trim()) { setActionTone('danger'); setActionMessage('The uploaded CSV file is empty.'); return }
      setCsvText(fileText); setCsvFileName(fileName)
      setActionTone('info'); setActionMessage(`Loaded: ${fileName}. Review preview then click Import CSV.`)
    } catch { setActionTone('danger'); setActionMessage('Unable to read the CSV file.') }
    finally { setUploadingCsvFile(false) }
  }

  async function onAssignGuestSeat(guest, targetLabelOverride = undefined) {
    if (!selectedEventId || !guest) return
    if (guest.checkedInAt) { setActionTone('warning'); setActionMessage('Checked-in guests cannot be moved.'); return }
    const targetTableLabel = targetLabelOverride !== undefined ? (targetLabelOverride || null) : (guestTableDraftById[guest.id] || null)
    if ((guest.tableLabel || null) === targetTableLabel) { setActionTone('info'); setActionMessage(`${guest.name} is already assigned to ${targetTableLabel ?? 'Unassigned'}.`); return }
    setAssigningGuestId(guest.id); setActionMessage(''); setError('')
    try {
      const updated = await assignGuestSeat(selectedEventId, guest.id, targetTableLabel, { simulateLatency: false })
      await loadGuestsData()
      const assignedLabel = updated.tableLabel
        ? `${updated.tableLabel}${updated.seatNumber ? ` - Seat ${updated.seatNumber}` : ''}`
        : 'Unassigned'
      setActionTone('success'); setActionMessage(`Seat assigned for ${updated.name}: ${assignedLabel}.`)
    } catch (err) {
      setActionTone('danger'); setActionMessage(err?.message ?? 'Unable to assign seat.')
    } finally { setAssigningGuestId('') }
  }

  async function onFindBestSeat(guest) {
    if (!guest || guest.checkedInAt) { setActionTone('warning'); setActionMessage('Checked-in guests cannot be moved.'); return }
    const suggestion = suggestionByGuestId[guest.id]?.label ?? ''
    if (!suggestion) { setActionTone('warning'); setActionMessage('No available seats found.'); return }
    setGuestTableDraftById((prev) => ({ ...prev, [guest.id]: suggestion }))
    await onAssignGuestSeat(guest, suggestion)
  }

  async function onBulkAssignSelected(targetLabelOverride = bulkTargetTableLabel) {
    if (!selectedEventId || selectedGuestIds.length === 0) return
    setBulkAssigning(true); setActionMessage(''); setError('')
    try {
      let assignedCount = 0, failedCount = 0, failedNames = []
      for (const guestId of selectedGuestIds) {
        const guest = allGuests.find((g) => g.id === guestId)
        if (!guest || guest.checkedInAt) { failedCount += 1; if (guest?.name) failedNames.push(guest.name); continue }
        try { await assignGuestSeat(selectedEventId, guestId, targetLabelOverride || null, { simulateLatency: false }); assignedCount += 1 }
        catch { failedCount += 1; failedNames.push(guest.name) }
      }
      await loadGuestsData(); setSelectedGuestIds([])
      setActionTone(failedCount > 0 ? 'warning' : 'success')
      setActionMessage(`Bulk update: ${assignedCount} assigned, ${failedCount} failed${failedNames.length ? ` (${failedNames.slice(0, 3).join(', ')})` : ''}.`)
    } finally { setBulkAssigning(false) }
  }

  async function onBulkUnassignSelected() { setBulkTargetTableLabel(''); await onBulkAssignSelected('') }

  async function onAutoAssignSeats() {
    if (!selectedEventId) return
    setAssigningSeats(true); setError(''); setActionMessage('')
    try {
      const result = await autoAssignManageSeats(selectedEventId, { simulateLatency: false })
      await loadGuestsData()
      setActionTone(result.assignedCount > 0 ? 'success' : 'warning')
      setActionMessage(`Auto-assigned ${result.assignedCount}/${result.totalUnassigned} guest(s). ${result.remainingUnassigned} still unassigned.`)
    } catch (err) {
      setActionTone('danger'); setActionMessage(err?.message ?? 'Unable to auto-assign seats.')
    } finally { setAssigningSeats(false) }
  }

  async function onKanbanDrop(guestId, targetColumnId) {
    const guest = allGuests.find((g) => g.id === guestId)
    if (!guest) return
    if (targetColumnId === 'checkedin') {
      if (guest.checkedInAt) { setActionTone('info'); setActionMessage(`${guest.name} is already checked in.`); return }
      setActionMessage(''); setError('')
      try {
        await checkInGuest(selectedEventId, guestId, { source: 'manual' }, { simulateLatency: false })
        await loadGuestsData()
        setActionTone('success'); setActionMessage(`${guest.name} checked in manually.`)
      } catch (err) {
        setActionTone('danger'); setActionMessage(err?.message ?? 'Unable to check in guest.')
      }
    } else if (targetColumnId === 'walkin') {
      setActionTone('warning'); setActionMessage('Walk-in status is set at registration — cannot change via drag.')
    } else if (targetColumnId === 'pending') {
      setActionTone('warning'); setActionMessage('Check-ins cannot be undone from this panel.')
    }
  }

  const selectableGuests = useMemo(() => guests.filter((g) => !g.checkedInAt), [guests])

  if (!selectedEventId) return <EmptyState message="Select an event first to view guests." />
  if (loading) return <LoadingState label="Loading guest list..." />
  if (!canAccessGuests) return <ErrorState message="Your current role has no guest-list permission." />
  if (error) return <ErrorState message={error} />

  // Input class shorthand for dark theme
  const inputCls = 'h-10 rounded-md border border-mgmt-border bg-mgmt-raised px-space-3 font-body text-body-sm text-mgmt-text placeholder:text-mgmt-dim focus:border-mgmt-gold/60 focus:outline-none focus:ring-1 focus:ring-mgmt-gold/30 transition-colors duration-fast'

  const activeColDef = KANBAN_COLUMNS.find((c) => c.id === activeTab) ?? KANBAN_COLUMNS[0]
  const activeTabGuests = guests.filter(activeColDef.filterFn)

  return (
    <section className="space-y-space-3">
      {/* Header */}
      <ManageSectionHeader
        title="Guest Management"
        subtitle="Tap to check in · drag on desktop"
        actions={
          <div className="flex gap-space-2">
            <ManageButton variant="ghost" onClick={() => { setShowAddPanel((v) => !v); setShowImportPanel(false) }}>
              {showAddPanel ? 'Close' : '+ Add'}
            </ManageButton>
            <ManageButton variant="secondary" onClick={() => { setShowImportPanel((v) => !v); setShowAddPanel(false) }}>
              {showImportPanel ? 'Close' : 'Import'}
            </ManageButton>
          </div>
        }
      />

      {/* Search — top priority on mobile */}
      <ManageFilterBar>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, ID, table, seat, ticket..."
          className={`h-10 flex-1 rounded-md border border-mgmt-border bg-mgmt-raised px-space-3 font-body text-body-sm text-mgmt-text placeholder:text-mgmt-dim focus:border-mgmt-gold/60 focus:outline-none transition-colors`}
        />
        {quickFilterOptions.map((option) => (
          <ManageFilterChip
            key={option.id}
            active={quickFilter === option.id}
            onClick={() => setQuickFilter(option.id)}
          >
            {option.label}
          </ManageFilterChip>
        ))}
      </ManageFilterBar>

      {/* Action message */}
      {actionMessage && (
        <ManageCard className={
          actionTone === 'success' ? 'border-green-200 bg-green-50'
          : actionTone === 'warning' ? 'border-amber-200 bg-amber-50'
          : actionTone === 'danger' ? 'border-red-200 bg-red-50'
          : 'border-blue-200 bg-blue-50'
        }>
          <div className="flex items-center justify-between gap-space-2">
            <p className="font-body text-body-sm text-mgmt-text">{actionMessage}</p>
            <ManageBadge tone={actionTone}>{actionTone}</ManageBadge>
          </div>
        </ManageCard>
      )}

      {/* Add Guest panel (collapsible) */}
      {showAddPanel && (
        <ManageCard>
          <p className="font-playfair text-heading-sm font-bold text-mgmt-text">Add Guest</p>
          <form onSubmit={onAddGuest} className="mt-space-2 space-y-space-2">
            <input value={manualName} onChange={(e) => setManualName(e.target.value)} placeholder="Guest full name" className={`w-full ${inputCls}`} />
            <div className="grid grid-cols-2 gap-space-2">
              <select value={manualTicketType} onChange={(e) => setManualTicketType(e.target.value)} className={inputCls}>
                <option value="General">General</option>
                <option value="VIP">VIP</option>
                <option value="Staff">Staff</option>
              </select>
              <input value={manualPhone} onChange={(e) => setManualPhone(e.target.value)} placeholder="Phone number" className={inputCls} />
            </div>
            {canEditSeating && (
              <select value={manualTableLabel} onChange={(e) => setManualTableLabel(e.target.value)} className={`w-full ${inputCls}`}>
                <option value="">No table yet</option>
                {tables.map((table) => (
                  <option key={table.id} value={table.label}>{table.label} ({table.available} open)</option>
                ))}
              </select>
            )}
            <ManageButton type="submit" disabled={addingGuest} className="w-full">
              {addingGuest ? 'Adding...' : 'Add Guest'}
            </ManageButton>
          </form>
        </ManageCard>
      )}

      {/* Import panel (collapsible) */}
      {showImportPanel && (
        <ManageCard>
          <div className="flex flex-wrap items-start justify-between gap-space-2">
            <div>
              <p className="font-playfair text-heading-sm font-bold text-mgmt-text">Import Guest List (CSV)</p>
              <p className="mt-space-1 font-body text-caption-lg text-mgmt-muted">
                Required header: <code className="text-mgmt-gold">name</code>. Optional: <code className="text-mgmt-gold">ticketType</code>, <code className="text-mgmt-gold">phone</code>, <code className="text-mgmt-gold">tableLabel</code>, <code className="text-mgmt-gold">seatNumber</code>.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-space-2">
              <ManageButton variant="secondary" onClick={() => csvFileInputRef.current?.click()} disabled={uploadingCsvFile}>
                {uploadingCsvFile ? 'Uploading...' : 'Upload CSV'}
              </ManageButton>
              <ManageButton variant="ghost" onClick={() => { setCsvText('name,ticketType,phone,tableLabel,seatNumber\n'); setCsvFileName('') }}>
                Reset
              </ManageButton>
            </div>
          </div>
          <input ref={csvFileInputRef} type="file" accept=".csv,text/csv" aria-label="Upload CSV file" className="hidden" onChange={onUploadCsvFile} />
          <div className="mt-space-2 rounded-xl border border-mgmt-border bg-mgmt-raised p-space-2">
            <div className="flex flex-wrap items-center gap-space-2">
              <ManageBadge tone={csvPreview?.ok ? 'success' : 'warning'}>
                {csvPreviewLoading ? 'Validating...' : csvPreview?.ok ? 'Ready' : 'Needs fixes'}
              </ManageBadge>
              <ManageBadge tone="neutral">Rows: {csvPreview?.rowCount ?? 0}</ManageBadge>
              <ManageBadge tone="info">Importable: {csvPreview?.estimatedImportableRows ?? 0}</ManageBadge>
              {csvFileName && <ManageBadge tone="neutral">{csvFileName}</ManageBadge>}
            </div>
            {!!csvPreview?.blockingIssue && (
              <p className="mt-space-1 font-body text-caption-lg text-red-700">{csvPreview.blockingIssue}</p>
            )}
          </div>
          <form onSubmit={onImportCsv} className="mt-space-2 space-y-space-2">
            <textarea
              aria-label="Guest CSV input"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="min-h-36 w-full rounded-md border border-mgmt-border bg-mgmt-raised p-space-3 font-mono text-caption-lg text-mgmt-text placeholder:text-mgmt-dim focus:border-mgmt-gold/60 focus:outline-none"
            />
            <ManageButton type="submit" disabled={importingCsv || csvPreviewLoading || (csvPreview ? !csvPreview.ok : false)}>
              {importingCsv ? 'Importing...' : 'Import CSV'}
            </ManageButton>
          </form>
        </ManageCard>
      )}

      {/* Stats & Tools — collapsed by default on mobile, always visible on desktop */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setShowStatsTools((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-mgmt-border bg-mgmt-surface px-space-3 py-space-2"
        >
          <span className="font-barlow text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-mgmt-muted">
            Stats &amp; Tools
          </span>
          <span className="flex items-center gap-space-2">
            <ManageBadge tone="neutral">{stats.total} guests</ManageBadge>
            <span className="font-barlow text-[0.75rem] text-mgmt-dim">{showStatsTools ? '▲' : '▼'}</span>
          </span>
        </button>
      </div>

      <div className={`space-y-space-3 ${showStatsTools ? 'block' : 'hidden md:block'}`}>
        {/* KPI strip */}
        <div className="grid grid-cols-2 gap-space-2 md:grid-cols-5">
          <ManageKpiTile label="Total" value={stats.total} />
          <ManageKpiTile label="Checked In" value={stats.checkedIn} />
          <ManageKpiTile label="Pending" value={stats.pending} />
          <ManageKpiTile label="VIP" value={stats.vip} />
          <ManageKpiTile label="Walk-ins" value={stats.walkIns} />
        </div>

        {/* Capacity badges */}
        <ManageFilterBar>
          <ManageBadge tone="info">Capacity: {selectedEvent?.guestCapacity ?? 0}</ManageBadge>
          <ManageBadge tone={availableSlots > 0 ? 'success' : 'warning'}>
            Slots: {availableSlots}
          </ManageBadge>
          <ManageBadge tone="neutral">
            Registered: {capacitySnapshot?.registered ?? stats.total}
          </ManageBadge>
        </ManageFilterBar>

        {/* Bulk seat assignment */}
        <ManageCard>
          <div className="flex flex-wrap items-center justify-between gap-space-2">
            <div>
              <p className="font-playfair text-heading-sm font-bold text-mgmt-text">Bulk Seat Assignment</p>
              <p className="font-body text-caption-lg text-mgmt-muted">Auto-assign unassigned guests to first available seats.</p>
            </div>
            <ManageBadge tone="info">Unassigned: {unassignedCount}</ManageBadge>
          </div>
          <div className="mt-space-2 space-y-space-2">
            <ManageButton
              variant="secondary"
              onClick={onAutoAssignSeats}
              disabled={!canEditSeating || unassignedCount === 0 || assigningSeats}
            >
              {assigningSeats ? 'Assigning...' : 'Auto-Assign All'}
            </ManageButton>
            {canEditSeating && (
              <div className="rounded-xl border border-mgmt-border bg-mgmt-raised p-space-2">
                <p className="font-body text-caption-lg text-mgmt-muted">Bulk actions for selected guests</p>
                <div className="mt-space-2 grid gap-space-2 md:grid-cols-[1fr_auto_auto]">
                  <select aria-label="Bulk target table" value={bulkTargetTableLabel} onChange={(e) => setBulkTargetTableLabel(e.target.value)} className={inputCls}>
                    <option value="">Unassign selected guests</option>
                    {tables.map((table) => <option key={table.id} value={table.label}>{table.label} ({table.available} open)</option>)}
                  </select>
                  <ManageButton variant="secondary" onClick={onBulkAssignSelected} disabled={selectedGuestIds.length === 0 || bulkAssigning}>
                    {bulkAssigning ? 'Applying...' : 'Assign Selected'}
                  </ManageButton>
                  <ManageButton variant="ghost" onClick={onBulkUnassignSelected} disabled={selectedGuestIds.length === 0 || bulkAssigning}>
                    Unassign
                  </ManageButton>
                </div>
                <p className="mt-space-1 font-body text-caption-lg text-mgmt-muted">
                  Selected: {selectedGuestIds.length}/{selectableGuests.length}
                </p>
              </div>
            )}
          </div>
        </ManageCard>
      </div>

      {/* ── MOBILE: Tab column switcher ── */}
      <div className="md:hidden space-y-space-2">
        {/* Tab bar */}
        <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-mgmt-border bg-mgmt-surface">
          {KANBAN_COLUMNS.map((col) => {
            const count = guests.filter(col.filterFn).length
            const isActive = activeTab === col.id
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => setActiveTab(col.id)}
                className={`relative flex flex-col items-center py-space-2 transition-colors duration-fast ${
                  isActive ? 'bg-gradient-accent-tint text-mgmt-text' : 'text-mgmt-muted'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-accent-h" />
                )}
                <span
                  className="font-playfair text-[1.5rem] font-bold leading-none"
                  style={{ color: isActive ? col.accentColor : undefined }}
                >
                  {count}
                </span>
                <span className="mt-[2px] font-barlow text-[0.65rem] font-semibold uppercase tracking-[0.1em]">
                  {col.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Active column card list (full width) */}
        <div className="space-y-space-2">
          {activeTabGuests.length === 0 && (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-mgmt-border py-space-6">
              <p className="font-barlow text-[0.75rem] uppercase tracking-wide text-mgmt-dim">No guests in this column</p>
            </div>
          )}
          {activeTabGuests.map((guest) => (
            <div
              key={guest.id}
              className="relative overflow-hidden rounded-xl border border-mgmt-border bg-mgmt-surface p-space-3 shadow-xs"
            >
              <span aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-5 w-5 rounded-tl-xl border-l-2 border-t-2 border-mgmt-gold/30" />
              <div className="flex items-start justify-between gap-space-2">
                <p className="font-barlow text-[0.9375rem] font-semibold uppercase tracking-wide text-mgmt-text leading-tight">
                  {guest.name}
                </p>
                <ManageBadge tone={ticketTypeTone(guest.ticketType)}>{guest.ticketType}</ManageBadge>
              </div>
              <p className="mt-space-1 font-body text-[0.8125rem] text-mgmt-muted">
                {formatGuestSeatText(guest)}
                {guest.phone ? ` · ${guest.phone}` : ''}
              </p>
              {guest.checkedInAt && (
                <p className="mt-space-1 font-barlow text-[0.7rem] font-semibold uppercase tracking-wide text-green-700">
                  ✓ Checked in
                </p>
              )}
              {/* Mobile action row */}
              <div className="mt-space-2 flex items-center gap-space-2">
                {!guest.checkedInAt && (
                  <button
                    type="button"
                    onClick={() => onKanbanDrop(guest.id, 'checkedin')}
                    className="flex-1 rounded-lg border border-green-200 bg-green-50 py-space-1 font-barlow text-[0.8125rem] font-semibold uppercase tracking-wide text-green-700 active:bg-green-100 transition-colors"
                  >
                    ✓ Check In
                  </button>
                )}
                {canEditSeating && !guest.checkedInAt && (
                  <select
                    aria-label={`Seat for ${guest.name}`}
                    value={guestTableDraftById[guest.id] ?? ''}
                    onChange={(e) => setGuestTableDraftById((prev) => ({ ...prev, [guest.id]: e.target.value }))}
                    className="h-9 flex-1 rounded-lg border border-mgmt-border bg-mgmt-raised px-space-2 font-body text-[0.8125rem] text-mgmt-muted focus:border-mgmt-gold/60 focus:outline-none"
                  >
                    <option value="">No seat</option>
                    {tables.filter((t) => t.available > 0 || t.label === guest.tableLabel).sort(sortTablesByLabel).map((t) => (
                      <option key={t.id} value={t.label}>{t.label} ({t.available})</option>
                    ))}
                  </select>
                )}
                {canEditSeating && !guest.checkedInAt && (
                  <button
                    type="button"
                    onClick={() => onAssignGuestSeat(guest)}
                    disabled={assigningGuestId === guest.id}
                    className="h-9 rounded-lg border border-mgmt-border bg-mgmt-raised px-space-3 font-barlow text-[0.75rem] uppercase tracking-wide text-mgmt-muted hover:border-mgmt-gold/50 hover:text-mgmt-gold transition-colors disabled:opacity-50"
                  >
                    {assigningGuestId === guest.id ? '...' : 'Set'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DESKTOP: Horizontal scroll Kanban ── */}
      <div className="hidden md:flex md:flex-col md:gap-space-2">
        <p className="font-barlow text-[0.7rem] uppercase tracking-[0.18em] text-mgmt-dim">
          Drag guest cards to the Checked In column to check them in
        </p>
        <KanbanBoard>
          {KANBAN_COLUMNS.map((col) => {
            const colGuests = guests.filter(col.filterFn)
            return (
              <KanbanColumn
                key={col.id}
                id={col.id}
                label={col.label}
                count={colGuests.length}
                accentColor={col.accentColor}
                colRef={kanbanColumnRefs.get(col.id)}
              >
                {colGuests.length === 0 && (
                  <div className="flex items-center justify-center rounded-lg border border-dashed border-mgmt-border p-space-3">
                    <p className="font-barlow text-[0.75rem] uppercase tracking-wide text-mgmt-dim">Empty</p>
                  </div>
                )}
                {colGuests.map((guest) => (
                  <KanbanDragCard
                    key={guest.id}
                    id={guest.id}
                    currentColumnId={col.id}
                    onDrop={onKanbanDrop}
                    columnRefs={kanbanColumnRefs}
                  >
                    <KanbanCard>
                      <div className="flex items-start justify-between gap-space-1">
                        <p className="font-barlow text-[0.9rem] font-semibold uppercase tracking-wide text-mgmt-text leading-tight">
                          {guest.name}
                        </p>
                        <ManageBadge tone={ticketTypeTone(guest.ticketType)}>
                          {guest.ticketType}
                        </ManageBadge>
                      </div>
                      <p className="mt-space-1 font-body text-[0.75rem] text-mgmt-muted">
                        {formatGuestSeatText(guest)}
                        {guest.phone ? ` · ${guest.phone}` : ''}
                      </p>
                      {guest.checkedInAt && (
                        <p className="mt-space-1 font-barlow text-[0.7rem] uppercase tracking-wide text-green-700">
                          ✓ Checked in
                        </p>
                      )}
                      {canEditSeating && !guest.checkedInAt && (
                        <div className="mt-space-2 flex gap-space-1">
                          <select
                            aria-label={`Seat for ${guest.name}`}
                            value={guestTableDraftById[guest.id] ?? ''}
                            onChange={(e) => setGuestTableDraftById((prev) => ({ ...prev, [guest.id]: e.target.value }))}
                            onClick={(e) => e.stopPropagation()}
                            className="h-7 flex-1 rounded border border-mgmt-border bg-mgmt-surface px-1 font-body text-[0.75rem] text-mgmt-muted focus:border-mgmt-gold/60 focus:outline-none"
                          >
                            <option value="">Unassigned</option>
                            {tables.filter((t) => t.available > 0 || t.label === guest.tableLabel).sort(sortTablesByLabel).map((t) => (
                              <option key={t.id} value={t.label}>{t.label} ({t.available})</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onAssignGuestSeat(guest) }}
                            disabled={assigningGuestId === guest.id}
                            className="rounded border border-mgmt-border bg-mgmt-raised px-space-2 font-barlow text-[0.7rem] uppercase tracking-wide text-mgmt-muted hover:border-mgmt-gold/50 hover:text-mgmt-gold transition-colors"
                          >
                            {assigningGuestId === guest.id ? '...' : 'Set'}
                          </button>
                        </div>
                      )}
                    </KanbanCard>
                  </KanbanDragCard>
                ))}
              </KanbanColumn>
            )
          })}
        </KanbanBoard>
      </div>
    </section>
  )
}
