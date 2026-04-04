import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useDrag } from '@use-gesture/react'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import {
  ManageBadge,
  ManageButton,
  ManageCard,
  ManageSectionHeader,
} from '@/components/ui/ManagePrimitives'
import {
  assignGuestSeat,
  createManageTable,
  listManageGuests,
  listManageTables,
  removeManageTable,
  updateManageTableSeats,
} from '@/services'

function getTableTone(table) {
  const ratio = table.capacity > 0 ? table.seated / table.capacity : 0
  if (ratio >= 1) return { wrap: 'border-primary-200 bg-primary-50', badge: 'danger', text: 'Full' }
  if (ratio >= 0.7) return { wrap: 'border-amber-200 bg-amber-50', badge: 'warning', text: 'Almost full' }
  return { wrap: 'border-green-200 bg-green-50', badge: 'success', text: 'Available' }
}

function buildCapacityAdjustmentHint(capacityAdjustment) {
  if (!capacityAdjustment?.autoAdjusted) return ''
  const parts = []
  const correctedBy = Math.abs(Number(capacityAdjustment.deltaBefore) || 0)
  if (correctedBy > 0) parts.push(`${correctedBy} seat(s) corrected`)
  const resizedCount = capacityAdjustment.resizedTables?.length ?? 0
  if (resizedCount > 0) parts.push(`${resizedCount} table(s) resized`)
  const removedCount = capacityAdjustment.removedTables?.length ?? 0
  if (removedCount > 0) parts.push(`${removedCount} empty table(s) removed`)
  if (parts.length === 0) return ''
  return `Auto-adjusted to match capacity: ${parts.join(', ')}.`
}

export default function ManageSeatingPage() {
  const { selectedEventId, selectedEvent, permissions, refreshManageBootstrap } = useOutletContext()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [noticeTone, setNoticeTone] = useState('info')
  const [tables, setTables] = useState([])
  const [guests, setGuests] = useState([])
  const [selectedGuestId, setSelectedGuestId] = useState('')
  const [selectedTableLabel, setSelectedTableLabel] = useState('')
  const [selectedTableId, setSelectedTableId] = useState('')
  const [draggingGuestId, setDraggingGuestId] = useState('')
  const [hoveredTableId, setHoveredTableId] = useState('')
  const [hoveredDropBlockedReason, setHoveredDropBlockedReason] = useState('')
  const [assigningGuestId, setAssigningGuestId] = useState('')
  const [addTableLabel, setAddTableLabel] = useState('')
  const [addTableSeats, setAddTableSeats] = useState('10')
  const [creatingTable, setCreatingTable] = useState(false)
  const [editTableSeats, setEditTableSeats] = useState('')
  const [savingSeats, setSavingSeats] = useState(false)
  const [removingTable, setRemovingTable] = useState(false)
  const [capacityDialog, setCapacityDialog] = useState(null)
  const [applyingCapacityDialog, setApplyingCapacityDialog] = useState(false)
  const canEditSeating = permissions.includes('seating')

  const loadSeatingData = useCallback(async () => {
    if (!selectedEventId) return
    const [tablePayload, guestPayload] = await Promise.all([
      listManageTables(selectedEventId, { simulateLatency: false }),
      listManageGuests(selectedEventId, { status: 'all' }, { simulateLatency: false }),
    ])
    setTables(tablePayload)
    setGuests(guestPayload)
    return { tablePayload, guestPayload }
  }, [selectedEventId])

  useEffect(() => {
    if (!selectedEventId) return
    if (!canEditSeating) {
      setLoading(false)
      return
    }

    let active = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        await loadSeatingData()
      } catch {
        if (active) setError('Unable to load seating data right now.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [selectedEventId, canEditSeating, loadSeatingData])

  useEffect(() => {
    if (!tables.length) return
    if (selectedTableId && tables.some((table) => table.id === selectedTableId)) return
    setSelectedTableId(tables[0].id)
  }, [tables, selectedTableId])

  useEffect(() => {
    if (!selectedTableId) {
      setEditTableSeats('')
      return
    }
    const table = tables.find((entry) => entry.id === selectedTableId)
    if (!table) {
      setEditTableSeats('')
      return
    }
    setEditTableSeats(String(table.capacity))
  }, [selectedTableId, tables])

  const totalSeats = useMemo(
    () => tables.reduce((sum, table) => sum + (Number(table.capacity) || 0), 0),
    [tables],
  )
  const eventCapacity = Number(selectedEvent?.guestCapacity ?? totalSeats)

  async function assignSeat(guestId, tableLabel) {
    if (!selectedEventId || !guestId) return
    setError('')
    setNotice('')
    setAssigningGuestId(guestId)
    try {
      await assignGuestSeat(selectedEventId, guestId, tableLabel || null, { simulateLatency: false })
      await loadSeatingData()
      if (selectedGuestId === guestId) {
        setSelectedGuestId('')
        setSelectedTableLabel('')
      }
    } catch (assignmentError) {
      setError(assignmentError?.message ?? 'Unable to assign table seat.')
    } finally {
      setAssigningGuestId('')
    }
  }

  async function onAssignSeat(event) {
    event.preventDefault()
    if (!selectedGuestId) return
    await assignSeat(selectedGuestId, selectedTableLabel)
  }

  async function refreshAfterTableMutation(preferredLabel = '') {
    const payload = await loadSeatingData()
    if (typeof refreshManageBootstrap === 'function') {
      await refreshManageBootstrap()
    }
    if (!preferredLabel || !payload?.tablePayload?.length) return
    const match = payload.tablePayload.find((table) => table.label === preferredLabel)
    if (match) setSelectedTableId(match.id)
  }

  async function executeTableMutation(action) {
    if (!selectedEventId) return
    setError('')
    setNotice('')

    const source = action?.source ?? 'direct'
    const setBusyState = source === 'dialog' ? setApplyingCapacityDialog : null
    const setActionBusyState = action.kind === 'add'
      ? setCreatingTable
      : action.kind === 'update'
        ? setSavingSeats
        : setRemovingTable
    setActionBusyState(true)
    if (setBusyState) setBusyState(true)

    try {
      if (action.kind === 'add') {
        const created = await createManageTable(
          selectedEventId,
          {
            seats: action.seats,
            label: action.label || undefined,
          },
          { simulateLatency: false },
        )
        setAddTableLabel('')
        setAddTableSeats('10')
        await refreshAfterTableMutation(created.table?.label ?? '')
        const adjustmentHint = buildCapacityAdjustmentHint(created.capacityAdjustment)
        setNoticeTone('success')
        setNotice(`Table ${created.table?.label ?? action.label ?? 'new table'} added.${adjustmentHint ? ` ${adjustmentHint}` : ''}`)
      } else if (action.kind === 'update') {
        const updated = await updateManageTableSeats(
          selectedEventId,
          action.tableLabel,
          action.seats,
          { simulateLatency: false },
        )
        await refreshAfterTableMutation(updated.table?.label ?? action.tableLabel)
        const adjustmentHint = buildCapacityAdjustmentHint(updated.capacityAdjustment)
        setNoticeTone('success')
        setNotice(`Updated seats for ${action.tableLabel}.${adjustmentHint ? ` ${adjustmentHint}` : ''}`)
      } else if (action.kind === 'remove') {
        const removed = await removeManageTable(selectedEventId, action.tableLabel, { simulateLatency: false })
        await refreshAfterTableMutation()
        const adjustmentHint = buildCapacityAdjustmentHint(removed.capacityAdjustment)
        setNoticeTone('success')
        setNotice(`Removed table ${action.tableLabel}.${adjustmentHint ? ` ${adjustmentHint}` : ''}`)
      }
    } catch (tableError) {
      setNoticeTone('danger')
      setNotice(tableError?.message ?? 'Unable to update table settings right now.')
    } finally {
      setActionBusyState(false)
      if (setBusyState) setBusyState(false)
    }
  }

  function maybeOpenCapacityDialog(action) {
    if (!Number.isInteger(eventCapacity) || eventCapacity < 1) {
      void executeTableMutation(action)
      return
    }
    if (action.predictedSeats === eventCapacity) {
      void executeTableMutation(action)
      return
    }
    const delta = action.predictedSeats - eventCapacity
    setCapacityDialog({
      ...action,
      targetCapacity: eventCapacity,
      currentSeats: totalSeats,
      delta,
    })
  }

  async function onAddTable(event) {
    event.preventDefault()
    if (!selectedEventId) return
    const parsedSeats = Number(addTableSeats)
    if (!Number.isInteger(parsedSeats) || parsedSeats < 1) {
      setNoticeTone('danger')
      setNotice('Seats must be a whole number greater than or equal to 1.')
      return
    }
    const action = {
      kind: 'add',
      label: addTableLabel.trim(),
      seats: parsedSeats,
      predictedSeats: totalSeats + parsedSeats,
      source: 'direct',
    }
    maybeOpenCapacityDialog(action)
  }

  async function onSaveTableSeats(event) {
    event.preventDefault()
    if (!selectedEventId || !selectedTable) return
    const parsedSeats = Number(editTableSeats)
    if (!Number.isInteger(parsedSeats) || parsedSeats < 1) {
      setNoticeTone('danger')
      setNotice('Seats must be a whole number greater than or equal to 1.')
      return
    }
    const action = {
      kind: 'update',
      tableLabel: selectedTable.label,
      seats: parsedSeats,
      predictedSeats: totalSeats - selectedTable.capacity + parsedSeats,
      source: 'direct',
    }
    maybeOpenCapacityDialog(action)
  }

  async function onRemoveTable() {
    if (!selectedEventId || !selectedTable) return
    const action = {
      kind: 'remove',
      tableLabel: selectedTable.label,
      predictedSeats: totalSeats - selectedTable.capacity,
      source: 'direct',
    }
    maybeOpenCapacityDialog(action)
  }

  async function onConfirmCapacityDialog() {
    if (!capacityDialog) return
    await executeTableMutation({ ...capacityDialog, source: 'dialog' })
    setCapacityDialog(null)
  }

  const selectedGuest = guests.find((guest) => guest.id === selectedGuestId) ?? null
  const selectedTable = tables.find((table) => table.id === selectedTableId) ?? null
  const draggableGuests = useMemo(
    () => guests.filter((guest) => !guest.tableLabel && !guest.checkedInAt),
    [guests],
  )
  const lockedUnassignedGuests = useMemo(
    () => guests.filter((guest) => !guest.tableLabel && !!guest.checkedInAt),
    [guests],
  )
  const unassignedGuestsCount = draggableGuests.length + lockedUnassignedGuests.length
  const selectedTableSeatedCount = selectedTable?.seated ?? 0
  const parsedEditSeats = Number(editTableSeats)
  const seatsInputInvalid = !Number.isInteger(parsedEditSeats) || parsedEditSeats < 1
  const downsizeBlocked = selectedTable ? parsedEditSeats < selectedTableSeatedCount : false
  const saveSeatsDisabled = !selectedTable || seatsInputInvalid || downsizeBlocked || savingSeats
  const removeTableDisabled = !selectedTable || removingTable || tables.length <= 1 || selectedTableSeatedCount > 0

  let removeReason = ''
  if (selectedTable) {
    if (tables.length <= 1) removeReason = 'Cannot remove last table.'
    else if (selectedTableSeatedCount > 0) removeReason = 'Table has assigned guests.'
  }

  function getDropBlockReason(guest, table) {
    if (!guest) return 'Guest not found.'
    if (!table) return 'Drop onto a table card to assign a seat.'
    if (guest.checkedInAt) return 'Checked-in guests cannot be moved.'
    if (table.available <= 0) return `Table ${table.label} is full.`
    return ''
  }

  const draggingGuest = guests.find((guest) => guest.id === draggingGuestId) ?? null

  const bindGuestDrag = useDrag(
    ({ args: [guestId], first, last, xy: [x, y], active }) => {
      let computedHoveredId = ''
      if (first) {
        setDraggingGuestId(guestId)
        setHoveredDropBlockedReason('')
      }

      for (const table of tables) {
        const element = document.getElementById(`table-drop-${table.id}`)
        if (!element) continue
        const rect = element.getBoundingClientRect()
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          computedHoveredId = table.id
          break
        }
      }

      const hoveredTable = tables.find((table) => table.id === computedHoveredId) ?? null
      const guest = guests.find((entry) => entry.id === guestId) ?? null
      const blockedReason = getDropBlockReason(guest, hoveredTable)

      if (active) {
        setHoveredTableId(computedHoveredId)
        setHoveredDropBlockedReason(blockedReason)
      }

      if (last) {
        const targetTable = hoveredTable
        if (targetTable && !blockedReason) {
          void assignSeat(guestId, targetTable.label)
          setSelectedTableId(targetTable.id)
        } else if (blockedReason) {
          setNoticeTone('warning')
          setNotice(blockedReason)
        }
        setDraggingGuestId('')
        setHoveredTableId('')
        setHoveredDropBlockedReason('')
      }
    },
    { pointer: { touch: true } },
  )

  if (!selectedEventId) return <EmptyState message="Select an event first to manage seating." />
  if (loading) return <LoadingState label="Loading seating map..." />
  if (!canEditSeating) return <ErrorState message="Your current role has view-only access for seating." />
  if (error && tables.length === 0) return <ErrorState message={error} />

  return (
    <section className="space-y-space-4">
      <ManageSectionHeader title="Seating & Tables" subtitle="Color-coded table fill states with quick guest assignment controls." />
      {error && <ErrorState message={error} />}
      {notice && (
        <ManageCard className={
          noticeTone === 'success'
            ? 'border-green-200 bg-green-50'
            : noticeTone === 'danger'
              ? 'border-red-200 bg-red-50'
              : 'border-blue-200 bg-blue-50'
        }
        >
          <div className="flex items-center justify-between gap-space-2">
            <p className="font-body text-body-sm text-neutral-700">{notice}</p>
            <ManageBadge tone={noticeTone === 'danger' ? 'danger' : noticeTone}>
              {noticeTone}
            </ManageBadge>
          </div>
        </ManageCard>
      )}

      <div className="grid gap-space-3 md:grid-cols-[1.1fr_0.9fr]">
        <ManageCard>
          <p className="font-display text-heading-sm text-neutral-900">Interactive Table Grid</p>
          <p className="mt-space-1 font-body text-body-sm text-neutral-500">
            Tap a table to inspect details, or drag unassigned guest chips onto a table to assign seats.
          </p>
          <div className="mt-space-2 flex flex-wrap gap-space-2">
            {draggableGuests.length === 0 && (
              <p className="font-body text-caption-lg text-neutral-500">No unassigned guests waiting for seats.</p>
            )}
            {draggableGuests.map((guest) => (
              <button
                key={guest.id}
                type="button"
                {...bindGuestDrag(guest.id)}
                aria-label={`Drag ${guest.name} to table`}
                className={`rounded-full border px-space-3 py-space-1 font-body text-caption-lg ${
                  draggingGuestId === guest.id
                    ? 'border-info bg-blue-100 text-info'
                    : assigningGuestId === guest.id
                      ? 'border-neutral-300 bg-neutral-100 text-neutral-500'
                      : 'border-neutral-300 bg-white text-neutral-700'
                } cursor-grab active:cursor-grabbing`}
              >
                {assigningGuestId === guest.id ? 'Assigning...' : `${guest.name} (${guest.ticketType})`}
              </button>
            ))}
            {lockedUnassignedGuests.map((guest) => (
              <button
                key={guest.id}
                type="button"
                disabled
                aria-label={`${guest.name} is checked in and locked`}
                className="cursor-not-allowed rounded-full border border-neutral-200 bg-neutral-100 px-space-3 py-space-1 font-body text-caption-lg text-neutral-500"
              >
                {guest.name} ({guest.ticketType}) locked
              </button>
            ))}
          </div>
          {!!lockedUnassignedGuests.length && (
            <p className="mt-space-1 font-body text-caption-lg text-neutral-500">
              Checked-in guests are locked and cannot be dragged.
            </p>
          )}
          {!!draggingGuest && (
            <div className="mt-space-2">
              <ManageBadge tone={hoveredDropBlockedReason ? 'warning' : 'info'}>
                {hoveredDropBlockedReason || `Dragging ${draggingGuest.name}. Drop on a table to assign.`}
              </ManageBadge>
            </div>
          )}
          <div className="mt-space-3 grid grid-cols-2 gap-space-2 md:grid-cols-3">
            {tables.map((table) => {
              const tone = getTableTone(table)
              const active = selectedTableId === table.id
              const hovered = hoveredTableId === table.id
              const isBlockedDrop = hovered && !!hoveredDropBlockedReason
              return (
                <button
                  type="button"
                  key={table.id}
                  id={`table-drop-${table.id}`}
                  onClick={() => setSelectedTableId(table.id)}
                  className={`rounded-2xl border p-space-3 text-left ${tone.wrap} ${
                    active ? 'ring-2 ring-info/40' : ''
                  } ${
                    hovered && !isBlockedDrop ? 'ring-2 ring-success/60' : ''
                  } ${
                    isBlockedDrop ? 'ring-2 ring-red-300' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-display text-label-md text-neutral-900">{table.label}</p>
                    <ManageBadge tone={tone.badge}>{tone.text}</ManageBadge>
                  </div>
                  <p className="mt-space-1 font-body text-caption-lg text-neutral-600">{table.seated}/{table.capacity} seated</p>
                  <div className="mt-space-2 flex flex-wrap gap-1">
                    {Array.from({ length: table.capacity }).map((_, index) => (
                      <span
                        key={`${table.id}-seat-${index + 1}`}
                        className={`h-2.5 w-2.5 rounded-full ${
                          index < table.seated ? 'bg-info' : 'bg-white/70 border border-neutral-300'
                        }`}
                      />
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </ManageCard>

        <div className="space-y-space-3">
          <ManageCard>
            <p className="font-display text-heading-sm text-neutral-900">Table Controls</p>
            <div className="mt-space-2 flex items-center gap-space-2">
              <ManageBadge tone="info">Total seats: {totalSeats}</ManageBadge>
              <ManageBadge tone="neutral">Event capacity: {selectedEvent?.guestCapacity ?? totalSeats}</ManageBadge>
            </div>
            <form onSubmit={onAddTable} className="mt-space-2 space-y-space-2">
              <div className="grid grid-cols-2 gap-space-2">
                <input
                  value={addTableLabel}
                  onChange={(event) => setAddTableLabel(event.target.value)}
                  placeholder="Optional label (e.g. VIP-3)"
                  className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                />
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={addTableSeats}
                  onChange={(event) => setAddTableSeats(event.target.value)}
                  placeholder="Seats"
                  className="h-10 rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                />
              </div>
              <ManageButton type="submit" className="w-full" disabled={creatingTable}>
                {creatingTable ? 'Adding...' : 'Add Table'}
              </ManageButton>
            </form>
          </ManageCard>

          <ManageCard>
            <p className="font-display text-heading-sm text-neutral-900">Quick Assign Seat</p>
            <form onSubmit={onAssignSeat} className="mt-space-2 space-y-space-2">
              <select
                value={selectedGuestId}
                onChange={(event) => setSelectedGuestId(event.target.value)}
                className="h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
              >
                <option value="">Select guest</option>
                {guests.map((guest) => (
                  <option key={guest.id} value={guest.id}>
                    {guest.name} ({guest.ticketType})
                  </option>
                ))}
              </select>
              <select
                value={selectedTableLabel}
                onChange={(event) => setSelectedTableLabel(event.target.value)}
                className="h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
              >
                <option value="">Unassign table</option>
                {tables.map((table) => (
                  <option key={table.id} value={table.label}>
                    {table.label} ({table.available} available)
                  </option>
                ))}
              </select>
              <ManageButton type="submit" className="w-full">
                {selectedGuest?.tableLabel ? 'Reassign Seat' : 'Assign Seat'}
              </ManageButton>
            </form>
            <p className="mt-space-2 font-body text-caption-lg text-neutral-500">Unassigned guests: {unassignedGuestsCount}</p>
            {!!lockedUnassignedGuests.length && (
              <p className="font-body text-caption-lg text-neutral-500">Locked (checked-in): {lockedUnassignedGuests.length}</p>
            )}
          </ManageCard>

          <ManageCard>
            <p className="font-display text-heading-sm text-neutral-900">Table Detail</p>
            {!selectedTable && <p className="mt-space-2 font-body text-body-sm text-neutral-500">Select a table to inspect details.</p>}
            {selectedTable && (
              <div className="mt-space-2 space-y-space-2">
                <div className="flex items-center justify-between">
                  <p className="font-display text-label-md text-neutral-900">{selectedTable.label}</p>
                  <ManageBadge tone={getTableTone(selectedTable).badge}>
                    {selectedTable.available} seats open
                  </ManageBadge>
                </div>
                {selectedTable.guests.length === 0 && <p className="font-body text-body-sm text-neutral-500">No guests assigned.</p>}
                {selectedTable.guests.map((guest) => (
                  <div key={guest.id} className="flex items-center justify-between rounded-xl border border-neutral-200 p-space-2">
                    <p className="font-body text-body-sm text-neutral-700">{guest.name}</p>
                    <ManageBadge tone="neutral">{guest.ticketType}</ManageBadge>
                  </div>
                ))}
                <form onSubmit={onSaveTableSeats} className="mt-space-2 space-y-space-2 rounded-xl border border-neutral-200 bg-neutral-50 p-space-2">
                  <label className="block">
                    <span className="font-body text-label-sm text-neutral-700">Seats</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={editTableSeats}
                      onChange={(event) => setEditTableSeats(event.target.value)}
                      className="mt-space-1 h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                    />
                  </label>
                  {downsizeBlocked && (
                    <p className="font-body text-caption-lg text-warning">
                      Seats cannot be lower than currently seated guests.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-space-2">
                    <ManageButton type="submit" variant="secondary" disabled={saveSeatsDisabled}>
                      {savingSeats ? 'Saving...' : 'Save Seats'}
                    </ManageButton>
                    <ManageButton type="button" variant="danger" onClick={onRemoveTable} disabled={removeTableDisabled}>
                      {removingTable ? 'Removing...' : 'Remove Table'}
                    </ManageButton>
                  </div>
                  {removeReason && (
                    <p className="font-body text-caption-lg text-neutral-500">{removeReason}</p>
                  )}
                </form>
              </div>
            )}
          </ManageCard>
        </div>
      </div>

      {capacityDialog && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 p-space-3 md:p-space-6" role="presentation" onClick={() => setCapacityDialog(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Capacity auto-adjust confirmation"
            className="mx-auto mt-[8vh] w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-space-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="font-display text-heading-md text-neutral-900">Auto-adjust to Event Capacity</h3>
            <p className="mt-space-1 font-body text-body-sm text-neutral-600">
              This action would make total seats {capacityDialog.predictedSeats}, while event capacity is {capacityDialog.targetCapacity}.
            </p>
            <div className="mt-space-2 flex flex-wrap items-center gap-space-2">
              <ManageBadge tone="neutral">Current seats: {capacityDialog.currentSeats}</ManageBadge>
              <ManageBadge tone={capacityDialog.delta > 0 ? 'warning' : 'info'}>
                {capacityDialog.delta > 0 ? `Over by ${capacityDialog.delta}` : `Under by ${Math.abs(capacityDialog.delta)}`}
              </ManageBadge>
            </div>
            <p className="mt-space-2 font-body text-caption-lg text-neutral-500">
              Assigned guests are protected. Other tables and seat counts will auto-adjust to keep total seats exactly equal to event capacity.
            </p>
            <div className="mt-space-4 flex items-center justify-end gap-space-2">
              <ManageButton variant="secondary" onClick={() => setCapacityDialog(null)} disabled={applyingCapacityDialog}>
                Cancel
              </ManageButton>
              <ManageButton onClick={onConfirmCapacityDialog} disabled={applyingCapacityDialog}>
                {applyingCapacityDialog ? 'Applying...' : 'Apply & Auto-Adjust'}
              </ManageButton>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
