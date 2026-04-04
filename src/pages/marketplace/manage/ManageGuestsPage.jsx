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
  autoAssignManageSeats,
  assignGuestSeat,
  createManageGuest,
  getManageCapacitySnapshot,
  importManageGuestsFromCsv,
  listManageGuests,
  listManageTables,
  previewManageGuestCsvImport,
} from '@/services'

const statusChips = [
  { id: 'all', label: 'All' },
  { id: 'checkedIn', label: 'Checked In' },
  { id: 'pending', label: 'Pending' },
  { id: 'walkIn', label: 'Walk-in' },
]

function readCsvFileAsText(file) {
  if (typeof file?.text === 'function') {
    return file.text()
  }
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

export default function ManageGuestsPage() {
  const { selectedEventId, selectedEvent, permissions } = useOutletContext()
  const [guests, setGuests] = useState([])
  const [allGuests, setAllGuests] = useState([])
  const [tables, setTables] = useState([])
  const [capacitySnapshot, setCapacitySnapshot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [actionTone, setActionTone] = useState('info')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [manualName, setManualName] = useState('')
  const [manualPhone, setManualPhone] = useState('')
  const [manualTicketType, setManualTicketType] = useState('General')
  const [manualTableLabel, setManualTableLabel] = useState('')
  const [csvText, setCsvText] = useState('name,ticketType,phone,tableLabel\n')
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
  const csvFileInputRef = useRef(null)
  const canAccessGuests = permissions.includes('guests')
  const canEditSeating = permissions.includes('seating')

  const loadGuestsData = useCallback(async () => {
    if (!selectedEventId) return
    const [guestPayload, allGuestPayload, tablePayload, capacityPayload] = await Promise.all([
      listManageGuests(selectedEventId, { query, status }, { simulateLatency: false }),
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
  }, [selectedEventId, query, status, canEditSeating])

  useEffect(() => {
    if (!selectedEventId) return
    if (!canAccessGuests) {
      setLoading(false)
      return
    }

    let active = true
    async function loadGuests() {
      setLoading(true)
      setError('')
      try {
        await loadGuestsData()
      } catch {
        if (active) setError('Unable to load guests for this event.')
      } finally {
        if (active) setLoading(false)
      }
    }
    loadGuests()
    return () => {
      active = false
    }
  }, [selectedEventId, canAccessGuests, loadGuestsData])

  useEffect(() => {
    if (!selectedEventId) return
    let active = true
    async function buildCsvPreview() {
      setCsvPreviewLoading(true)
      try {
        const preview = await previewManageGuestCsvImport(
          selectedEventId,
          csvText,
          { simulateLatency: false },
        )
        if (active) setCsvPreview(preview)
      } catch {
        if (active) {
          setCsvPreview({
            ok: false,
            blockingIssue: 'Unable to validate CSV preview right now.',
            header: [],
            rowCount: 0,
            blankNameRows: 0,
            availableSlots: 0,
            estimatedImportableRows: 0,
          })
        }
      } finally {
        if (active) setCsvPreviewLoading(false)
      }
    }
    buildCsvPreview()
    return () => {
      active = false
    }
  }, [selectedEventId, csvText])

  const stats = useMemo(() => {
    const checkedIn = allGuests.filter((guest) => guest.checkedInAt).length
    const pending = allGuests.length - checkedIn
    const walkIns = allGuests.filter((guest) => guest.isWalkIn).length
    const vip = allGuests.filter((guest) => guest.ticketType === 'VIP').length
    return { total: allGuests.length, checkedIn, pending, vip, walkIns }
  }, [allGuests])

  const unassignedCount = useMemo(
    () => allGuests.filter((guest) => !guest.tableLabel).length,
    [allGuests],
  )

  const availableSlots = capacitySnapshot?.availableSlots ?? Math.max((selectedEvent?.guestCapacity ?? 0) - stats.total, 0)

  const suggestionByGuestId = useMemo(() => {
    const ticketCountByTableByType = new Map()
    allGuests.forEach((guest) => {
      if (!guest.tableLabel) return
      const typeKey = guest.ticketType || 'General'
      if (!ticketCountByTableByType.has(typeKey)) {
        ticketCountByTableByType.set(typeKey, new Map())
      }
      const map = ticketCountByTableByType.get(typeKey)
      map.set(guest.tableLabel, (map.get(guest.tableLabel) ?? 0) + 1)
    })

    const suggestions = {}
    allGuests.forEach((guest) => {
      if (guest.checkedInAt) {
        suggestions[guest.id] = { label: '', reason: 'checked-in' }
        return
      }
      const availableTables = tables
        .filter((table) => table.available > 0 || table.label === guest.tableLabel)
        .sort(sortTablesByLabel)
      if (!availableTables.length) {
        suggestions[guest.id] = { label: '', reason: 'no-seats' }
        return
      }

      const tableCounts = ticketCountByTableByType.get(guest.ticketType || 'General') ?? new Map()
      const bestClusterTable = [...availableTables]
        .sort((left, right) => {
          const leftCount = tableCounts.get(left.label) ?? 0
          const rightCount = tableCounts.get(right.label) ?? 0
          if (leftCount !== rightCount) return rightCount - leftCount
          return sortTablesByLabel(left, right)
        })[0]
      const bestClusterCount = tableCounts.get(bestClusterTable.label) ?? 0
      if (bestClusterCount > 0) {
        suggestions[guest.id] = { label: bestClusterTable.label, reason: 'cluster' }
        return
      }

      const firstOpenTable = availableTables.find((table) => table.available > 0) ?? availableTables[0]
      suggestions[guest.id] = { label: firstOpenTable?.label ?? '', reason: 'first-open' }
    })
    return suggestions
  }, [allGuests, tables])

  useEffect(() => {
    setGuestTableDraftById((prev) => {
      let changed = false
      const next = { ...prev }
      const allGuestIds = new Set(allGuests.map((guest) => guest.id))

      Object.keys(next).forEach((guestId) => {
        if (!allGuestIds.has(guestId)) {
          delete next[guestId]
          changed = true
        }
      })

      allGuests.forEach((guest) => {
        if (next[guest.id] != null) return
        const suggestion = suggestionByGuestId[guest.id]?.label ?? ''
        next[guest.id] = guest.tableLabel ?? suggestion
        changed = true
      })

      return changed ? next : prev
    })
  }, [allGuests, suggestionByGuestId])

  useEffect(() => {
    setSelectedGuestIds((prev) => {
      const allowed = new Set(allGuests.filter((guest) => !guest.checkedInAt).map((guest) => guest.id))
      const filtered = prev.filter((guestId) => allowed.has(guestId))
      return filtered.length === prev.length ? prev : filtered
    })
  }, [allGuests])

  async function onAddGuest(event) {
    event.preventDefault()
    if (!selectedEventId) return
    const normalizedName = manualName.trim()
    const normalizedPhone = manualPhone.trim()
    if (!normalizedName) {
      setActionTone('danger')
      setActionMessage('Please enter guest name before adding.')
      return
    }
    if (normalizedName.length < 2) {
      setActionTone('danger')
      setActionMessage('Guest name should be at least 2 characters.')
      return
    }
    if (normalizedPhone && !/^[+0-9()\-.\s]{7,20}$/.test(normalizedPhone)) {
      setActionTone('danger')
      setActionMessage('Phone format looks invalid. Use digits and symbols like + - ( ).')
      return
    }

    setAddingGuest(true)
    setError('')
    setActionMessage('')
    try {
      const created = await createManageGuest(
        selectedEventId,
        {
          name: normalizedName,
          phone: normalizedPhone,
          ticketType: manualTicketType,
          tableLabel: canEditSeating ? manualTableLabel : null,
        },
        { simulateLatency: false },
      )
      await loadGuestsData()
      setManualName('')
      setManualPhone('')
      setManualTicketType('General')
      setManualTableLabel('')
      setActionTone('success')
      setActionMessage(`Guest added: ${created.name}`)
    } catch (submitError) {
      setActionTone('danger')
      setActionMessage(submitError?.message ?? 'Unable to add guest.')
    } finally {
      setAddingGuest(false)
    }
  }

  async function onImportCsv(event) {
    event.preventDefault()
    if (!selectedEventId) return
    if (!csvText.trim()) {
      setActionTone('danger')
      setActionMessage('Paste CSV content before importing.')
      return
    }
    if (csvPreview && !csvPreview.ok) {
      setActionTone('danger')
      setActionMessage(csvPreview.blockingIssue || 'CSV content has a blocking issue. Fix it before importing.')
      return
    }

    setImportingCsv(true)
    setError('')
    setActionMessage('')
    try {
      const result = await importManageGuestsFromCsv(selectedEventId, csvText, { simulateLatency: false })
      await loadGuestsData()
      setActionTone(result.warningCount > 0 || result.skippedCount > 0 ? 'warning' : 'success')
      setActionMessage(
        `Imported ${result.addedCount} guest(s). Skipped ${result.skippedCount} (blank names: ${result.blankNameRows}, capacity: ${result.capacitySkippedCount}). Warnings ${result.warningCount} (invalid table: ${result.invalidTableWarningCount}, full table: ${result.fullTableWarningCount}).`,
      )
    } catch (importError) {
      setActionTone('danger')
      setActionMessage(importError?.message ?? 'Unable to import CSV guest list.')
    } finally {
      setImportingCsv(false)
    }
  }

  function onResetCsvTemplate() {
    setCsvText('name,ticketType,phone,tableLabel\n')
    setCsvFileName('')
  }

  async function onUploadCsvFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const fileName = String(file.name ?? '')
    const normalizedName = fileName.toLowerCase()
    const mimeType = String(file.type ?? '').toLowerCase()
    const allowedMime = mimeType.includes('csv') || mimeType === 'text/plain' || mimeType === 'application/vnd.ms-excel'
    if (!normalizedName.endsWith('.csv') && !allowedMime) {
      setActionTone('danger')
      setActionMessage('Please upload a valid .csv file.')
      return
    }

    setUploadingCsvFile(true)
    try {
      const fileText = await readCsvFileAsText(file)
      if (!String(fileText).trim()) {
        setActionTone('danger')
        setActionMessage('The uploaded CSV file is empty.')
        return
      }
      setCsvText(fileText)
      setCsvFileName(fileName)
      setActionTone('info')
      setActionMessage(`Loaded CSV file: ${fileName}. Review preview then click Import CSV.`)
    } catch {
      setActionTone('danger')
      setActionMessage('Unable to read the uploaded CSV file.')
    } finally {
      setUploadingCsvFile(false)
    }
  }

  function onClickUploadCsv() {
    csvFileInputRef.current?.click()
  }

  function onChangeGuestTableDraft(guestId, value) {
    setGuestTableDraftById((prev) => ({ ...prev, [guestId]: value }))
  }

  function toggleSelectedGuest(guestId, checked) {
    setSelectedGuestIds((prev) => {
      if (checked) {
        if (prev.includes(guestId)) return prev
        return [...prev, guestId]
      }
      return prev.filter((id) => id !== guestId)
    })
  }

  async function onAssignGuestSeat(guest, targetLabelOverride = undefined) {
    if (!selectedEventId || !guest) return
    if (guest.checkedInAt) {
      setActionTone('warning')
      setActionMessage('Checked-in guests cannot be moved from Guest Management.')
      return
    }

    const targetTableLabel = targetLabelOverride !== undefined
      ? (targetLabelOverride || null)
      : (guestTableDraftById[guest.id] || null)
    if ((guest.tableLabel || null) === targetTableLabel) {
      setActionTone('info')
      setActionMessage(`${guest.name} is already assigned to ${targetTableLabel ?? 'Unassigned'}.`)
      return
    }

    setAssigningGuestId(guest.id)
    setActionMessage('')
    setError('')
    try {
      const updated = await assignGuestSeat(
        selectedEventId,
        guest.id,
        targetTableLabel,
        { simulateLatency: false },
      )
      await loadGuestsData()
      setActionTone('success')
      setActionMessage(`Seat assigned for ${updated.name}: ${updated.tableLabel ?? 'Unassigned'}.`)
    } catch (assignmentError) {
      setActionTone('danger')
      setActionMessage(assignmentError?.message ?? 'Unable to assign seat for this guest.')
    } finally {
      setAssigningGuestId('')
    }
  }

  async function onFindBestSeat(guest) {
    if (!guest) return
    if (guest.checkedInAt) {
      setActionTone('warning')
      setActionMessage('Checked-in guests cannot be moved from Guest Management.')
      return
    }
    const suggestion = suggestionByGuestId[guest.id]?.label ?? ''
    if (!suggestion) {
      setActionTone('warning')
      setActionMessage('No available seats found for this guest right now.')
      return
    }
    setGuestTableDraftById((prev) => ({ ...prev, [guest.id]: suggestion }))
    await onAssignGuestSeat(guest, suggestion)
  }

  async function onBulkAssignSelected(targetLabelOverride = bulkTargetTableLabel) {
    if (!selectedEventId || selectedGuestIds.length === 0) return
    setBulkAssigning(true)
    setActionMessage('')
    setError('')
    try {
      let assignedCount = 0
      let failedCount = 0
      const failedNames = []
      for (const guestId of selectedGuestIds) {
        const guest = allGuests.find((entry) => entry.id === guestId)
        if (!guest || guest.checkedInAt) {
          failedCount += 1
          if (guest?.name) failedNames.push(guest.name)
          continue
        }
        try {
          await assignGuestSeat(
            selectedEventId,
            guestId,
            targetLabelOverride || null,
            { simulateLatency: false },
          )
          assignedCount += 1
        } catch {
          failedCount += 1
          failedNames.push(guest.name)
        }
      }
      await loadGuestsData()
      setSelectedGuestIds([])
      setActionTone(failedCount > 0 ? 'warning' : 'success')
      setActionMessage(
        `Bulk seat update: ${assignedCount} assigned, ${failedCount} failed${failedNames.length ? ` (${failedNames.slice(0, 3).join(', ')})` : ''}.`,
      )
    } finally {
      setBulkAssigning(false)
    }
  }

  async function onBulkUnassignSelected() {
    setBulkTargetTableLabel('')
    await onBulkAssignSelected('')
  }

  const selectableGuests = useMemo(
    () => guests.filter((guest) => !guest.checkedInAt),
    [guests],
  )

  async function onAutoAssignSeats() {
    if (!selectedEventId) return
    setAssigningSeats(true)
    setError('')
    setActionMessage('')
    try {
      const result = await autoAssignManageSeats(selectedEventId, { simulateLatency: false })
      await loadGuestsData()
      setActionTone(result.assignedCount > 0 ? 'success' : 'warning')
      setActionMessage(
        `Auto-assigned ${result.assignedCount}/${result.totalUnassigned} guest(s). ${result.remainingUnassigned} still unassigned.`,
      )
    } catch (assignError) {
      setActionTone('danger')
      setActionMessage(assignError?.message ?? 'Unable to auto-assign seats.')
    } finally {
      setAssigningSeats(false)
    }
  }

  if (!selectedEventId) return <EmptyState message="Select an event first to view guests." />
  if (loading) return <LoadingState label="Loading guest list..." />
  if (!canAccessGuests) return <ErrorState message="Your current role has no guest-list permission." />
  if (error) return <ErrorState message={error} />

  return (
    <section className="space-y-space-3">
      <ManageSectionHeader
        title="Guest Management"
        subtitle="Add/import guest lists, auto-assign seats, and monitor check-in readiness in one screen."
      />

      <div className="grid grid-cols-2 gap-space-2 md:grid-cols-5">
        <ManageKpiTile label="Total" value={stats.total} />
        <ManageKpiTile label="Checked In" value={stats.checkedIn} />
        <ManageKpiTile label="Pending" value={stats.pending} />
        <ManageKpiTile label="VIP" value={stats.vip} />
        <ManageKpiTile label="Walk-ins" value={stats.walkIns} />
      </div>

      <ManageFilterBar>
        <ManageBadge tone="info">Capacity: {selectedEvent?.guestCapacity ?? 0}</ManageBadge>
        <ManageBadge tone={availableSlots > 0 ? 'success' : 'warning'}>Available slots: {availableSlots}</ManageBadge>
        <ManageBadge tone="neutral">Registered: {capacitySnapshot?.registered ?? stats.total}</ManageBadge>
      </ManageFilterBar>

      {actionMessage && (
        <ManageCard className={
          actionTone === 'success'
            ? 'border-green-200 bg-green-50'
            : actionTone === 'warning'
              ? 'border-amber-200 bg-amber-50'
              : actionTone === 'danger'
                ? 'border-red-200 bg-red-50'
                : 'border-blue-200 bg-blue-50'
        }
        >
          <div className="flex items-center justify-between gap-space-2">
            <p className="font-body text-body-sm text-neutral-700">{actionMessage}</p>
            <ManageBadge tone={actionTone}>{actionTone}</ManageBadge>
          </div>
        </ManageCard>
      )}

      <div className="grid gap-space-3 lg:grid-cols-3">
        <ManageCard>
          <p className="font-display text-heading-sm text-neutral-900">Add Guest</p>
          <form onSubmit={onAddGuest} className="mt-space-2 space-y-space-2">
            <input
              value={manualName}
              onChange={(event) => setManualName(event.target.value)}
              placeholder="Guest full name"
              className="h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
            />
            <div className="grid grid-cols-2 gap-space-2">
              <select
                value={manualTicketType}
                onChange={(event) => setManualTicketType(event.target.value)}
                className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
              >
                <option value="General">General</option>
                <option value="VIP">VIP</option>
                <option value="Staff">Staff</option>
              </select>
              <input
                value={manualPhone}
                onChange={(event) => setManualPhone(event.target.value)}
                placeholder="Phone number"
                className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
              />
            </div>
            {canEditSeating && (
              <select
                value={manualTableLabel}
                onChange={(event) => setManualTableLabel(event.target.value)}
                className="h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
              >
                <option value="">No table yet</option>
                {tables.map((table) => (
                  <option key={table.id} value={table.label}>
                    {table.label} ({table.available} open)
                  </option>
                ))}
              </select>
            )}
            <ManageButton type="submit" disabled={addingGuest} className="w-full">
              {addingGuest ? 'Adding...' : 'Add Guest'}
            </ManageButton>
          </form>
        </ManageCard>

        <ManageCard className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-space-2">
            <div>
              <p className="font-display text-heading-sm text-neutral-900">Import Guest List (CSV)</p>
              <p className="mt-space-1 font-body text-caption-lg text-neutral-500">
                Required header: <code>name</code>. Optional: <code>ticketType</code>, <code>phone</code>, <code>tableLabel</code>.
              </p>
            </div>
            <div className="flex items-center gap-space-2">
              <ManageButton variant="secondary" onClick={onClickUploadCsv} disabled={uploadingCsvFile}>
                {uploadingCsvFile ? 'Uploading...' : 'Upload CSV File'}
              </ManageButton>
              <ManageButton variant="ghost" onClick={onResetCsvTemplate}>
                Reset Template
              </ManageButton>
            </div>
          </div>
          <input
            ref={csvFileInputRef}
            type="file"
            accept=".csv,text/csv"
            aria-label="Upload CSV file"
            className="hidden"
            onChange={onUploadCsvFile}
          />
          <div className="mt-space-2 rounded-xl border border-neutral-200 bg-neutral-50 p-space-2">
            <div className="flex flex-wrap items-center gap-space-2">
              <ManageBadge tone={csvPreview?.ok ? 'success' : 'warning'}>
                {csvPreviewLoading ? 'Validating...' : csvPreview?.ok ? 'Ready to import' : 'Needs fixes'}
              </ManageBadge>
              <ManageBadge tone="neutral">Rows: {csvPreview?.rowCount ?? 0}</ManageBadge>
              <ManageBadge tone="neutral">Blank names: {csvPreview?.blankNameRows ?? 0}</ManageBadge>
              <ManageBadge tone="info">Est. importable: {csvPreview?.estimatedImportableRows ?? 0}</ManageBadge>
              {csvFileName && <ManageBadge tone="neutral">File: {csvFileName}</ManageBadge>}
            </div>
            {!!csvPreview?.header?.length && (
              <p className="mt-space-1 font-body text-caption-lg text-neutral-500">
                Detected headers: {csvPreview.header.join(', ')}
              </p>
            )}
            {!!csvPreview?.blockingIssue && (
              <p className="mt-space-1 font-body text-caption-lg text-error">{csvPreview.blockingIssue}</p>
            )}
          </div>
          <form onSubmit={onImportCsv} className="mt-space-2 space-y-space-2">
            <textarea
              aria-label="Guest CSV input"
              value={csvText}
              onChange={(event) => setCsvText(event.target.value)}
              className="min-h-36 w-full rounded-md border border-neutral-200 bg-white p-space-3 font-mono text-caption-lg"
            />
            <ManageButton type="submit" disabled={importingCsv || csvPreviewLoading || (csvPreview ? !csvPreview.ok : false)}>
              {importingCsv ? 'Importing...' : 'Import CSV'}
            </ManageButton>
          </form>
        </ManageCard>
      </div>

      <ManageCard>
        <div className="flex flex-wrap items-center justify-between gap-space-2">
          <div>
            <p className="font-display text-heading-sm text-neutral-900">Bulk Seat Assignment</p>
            <p className="font-body text-caption-lg text-neutral-500">
              Auto-assign all unassigned guests to first available seats by table order.
            </p>
          </div>
          <ManageBadge tone="info">Unassigned: {unassignedCount}</ManageBadge>
        </div>
        <div className="mt-space-2 space-y-space-2">
          <ManageButton
            variant="secondary"
            onClick={onAutoAssignSeats}
            disabled={!canEditSeating || unassignedCount === 0 || assigningSeats}
          >
            {assigningSeats ? 'Assigning...' : 'Auto-Assign Unassigned Guests'}
          </ManageButton>
          {canEditSeating && (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-space-2">
              <p className="font-body text-caption-lg text-neutral-600">Bulk actions for selected guests</p>
              <div className="mt-space-2 grid gap-space-2 md:grid-cols-[1fr_auto_auto]">
                <select
                  aria-label="Bulk target table"
                  value={bulkTargetTableLabel}
                  onChange={(event) => setBulkTargetTableLabel(event.target.value)}
                  className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                >
                  <option value="">Unassign selected guests</option>
                  {tables.map((table) => (
                    <option key={table.id} value={table.label}>
                      {table.label} ({table.available} open)
                    </option>
                  ))}
                </select>
                <ManageButton
                  variant="secondary"
                  onClick={onBulkAssignSelected}
                  disabled={selectedGuestIds.length === 0 || bulkAssigning}
                >
                  {bulkAssigning ? 'Applying...' : 'Assign Selected'}
                </ManageButton>
                <ManageButton
                  variant="ghost"
                  onClick={onBulkUnassignSelected}
                  disabled={selectedGuestIds.length === 0 || bulkAssigning}
                >
                  Unassign Selected
                </ManageButton>
              </div>
              <p className="mt-space-1 font-body text-caption-lg text-neutral-500">
                Selected: {selectedGuestIds.length}/{selectableGuests.length}
              </p>
            </div>
          )}
          {!canEditSeating && (
            <p className="mt-space-2 font-body text-caption-lg text-neutral-500">
              Need seating permission to run bulk seat assignment.
            </p>
          )}
        </div>
      </ManageCard>

      <ManageFilterBar>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by guest name, id, table, ticket"
          className="h-10 flex-1 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
        />
        <div className="flex flex-wrap gap-space-1">
          {statusChips.map((chip) => (
            <ManageFilterChip key={chip.id} active={status === chip.id} onClick={() => setStatus(chip.id)}>
              {chip.label}
            </ManageFilterChip>
          ))}
        </div>
      </ManageFilterBar>

      <div className="grid gap-space-2">
        {guests.length === 0 && <EmptyState message="No guests matched your filters." />}
        {guests.map((guest) => (
          <ManageCard key={guest.id}>
            <div className="flex flex-wrap items-start justify-between gap-space-2">
              <div>
                <p className="font-display text-heading-sm text-neutral-900">{guest.name}</p>
                <p className="font-body text-caption-lg text-neutral-500">{guest.id} - {guest.ticketType}</p>
                <p className="font-body text-caption-lg text-neutral-500">
                  Table: {guest.tableLabel ?? 'Unassigned'} - {guest.phone || 'No phone'}
                </p>
              </div>
              <div className="flex items-center gap-space-2">
                <ManageBadge tone={guest.ticketType === 'VIP' ? 'warning' : guest.ticketType === 'Staff' ? 'info' : 'neutral'}>
                  {guest.ticketType}
                </ManageBadge>
                <ManageBadge tone={guest.checkedInAt ? 'success' : 'neutral'}>
                  {guest.checkedInAt ? 'Checked in' : 'Pending'}
                </ManageBadge>
              </div>
            </div>
            {canEditSeating && (
              <div className="mt-space-2 rounded-xl border border-neutral-200 bg-neutral-50 p-space-2">
                <div className="grid gap-space-2 md:grid-cols-[auto_1fr_auto_auto] md:items-center">
                  <label className="inline-flex items-center gap-space-2 font-body text-caption-lg text-neutral-600">
                    <input
                      type="checkbox"
                      aria-label={`Select ${guest.name}`}
                      checked={selectedGuestIds.includes(guest.id)}
                      onChange={(event) => toggleSelectedGuest(guest.id, event.target.checked)}
                      disabled={!!guest.checkedInAt}
                      className="h-4 w-4 rounded border-neutral-300"
                    />
                    Select
                  </label>
                  <select
                    aria-label={`Seat table for ${guest.name}`}
                    value={guestTableDraftById[guest.id] ?? guest.tableLabel ?? ''}
                    onChange={(event) => onChangeGuestTableDraft(guest.id, event.target.value)}
                    disabled={!!guest.checkedInAt}
                    className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                  >
                    <option value="">Unassigned</option>
                    {tables
                      .filter((table) => table.available > 0 || table.label === guest.tableLabel)
                      .sort(sortTablesByLabel)
                      .map((table) => (
                        <option key={table.id} value={table.label}>
                          {table.label} ({table.available} open)
                        </option>
                      ))}
                  </select>
                  <ManageButton
                    variant="secondary"
                    onClick={() => onAssignGuestSeat(guest)}
                    disabled={assigningGuestId === guest.id || !!guest.checkedInAt}
                    aria-label={`Assign seat for ${guest.name}`}
                  >
                    {assigningGuestId === guest.id ? 'Saving...' : guest.tableLabel ? 'Move Seat' : 'Assign Seat'}
                  </ManageButton>
                  <ManageButton
                    variant="ghost"
                    onClick={() => onFindBestSeat(guest)}
                    disabled={assigningGuestId === guest.id || !!guest.checkedInAt}
                    aria-label={`Find best seat for ${guest.name}`}
                  >
                    Find Best Seat
                  </ManageButton>
                </div>
                {!guest.checkedInAt && suggestionByGuestId[guest.id]?.label && (
                  <p className="mt-space-1 font-body text-caption-lg text-neutral-500">
                    Suggested: {suggestionByGuestId[guest.id].label} ({suggestionByGuestId[guest.id].reason === 'cluster' ? 'ticket cluster' : 'first available'})
                  </p>
                )}
                {!!guest.checkedInAt && (
                  <p className="mt-space-1 font-body text-caption-lg text-neutral-500">
                    Checked-in guests cannot be moved from this page.
                  </p>
                )}
              </div>
            )}
          </ManageCard>
        ))}
      </div>
    </section>
  )
}
