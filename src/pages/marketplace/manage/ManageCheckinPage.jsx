import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import {
  ManageBadge,
  ManageButton,
  ManageCard,
  ManageFilterBar,
  ManageFilterChip,
  ManageSectionHeader,
} from '@/components/ui/ManagePrimitives'
import {
  checkInGuest,
  exportManageScanOutcomes,
  listManageGuests,
  listManageScanOutcomes,
  recordManageScanOutcome,
  registerWalkIn,
  validateManageQrCode,
} from '@/services'

const scanStatusChips = [
  { id: 'all', label: 'All' },
  { id: 'success', label: 'Success' },
  { id: 'warning', label: 'Warning' },
  { id: 'error', label: 'Error' },
]

const inputCls = 'h-10 rounded-md border border-mgmt-border bg-mgmt-raised px-space-3 text-body-sm text-mgmt-text placeholder:text-mgmt-dim focus:border-mgmt-gold/60 focus:outline-none focus:ring-1 focus:ring-mgmt-gold/30'

function formatTime(value) {
  if (!value) return 'Just now'
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function downloadFile(content, filename, contentType = 'text/plain') {
  const blob = new Blob([content], { type: contentType })
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(objectUrl)
}

export default function ManageCheckinPage() {
  const { selectedEventId, permissions } = useOutletContext()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingGuests, setPendingGuests] = useState([])
  const [scanOutcomes, setScanOutcomes] = useState([])
  const [scanCode, setScanCode] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [scanQuery, setScanQuery] = useState('')
  const [scanStatus, setScanStatus] = useState('all')
  const [scanExporting, setScanExporting] = useState(false)
  const [walkInName, setWalkInName] = useState('')
  const [walkInTicket, setWalkInTicket] = useState('General')
  const [walkInPhone, setWalkInPhone] = useState('')
  const [lastScan, setLastScan] = useState(null)
  const canOperateCheckin = permissions.includes('checkin')

  const loadCheckInData = useCallback(async () => {
    if (!selectedEventId) return
    const [pendingPayload, outcomesPayload] = await Promise.all([
      listManageGuests(selectedEventId, { status: 'pending' }, { simulateLatency: false }),
      listManageScanOutcomes(selectedEventId, 50, {
        status: scanStatus,
        query: scanQuery,
        simulateLatency: false,
      }),
    ])
    setPendingGuests(pendingPayload)
    setScanOutcomes(outcomesPayload)
  }, [selectedEventId, scanStatus, scanQuery])

  useEffect(() => {
    if (!selectedEventId) return
    if (!canOperateCheckin) {
      setLoading(false)
      return
    }

    let active = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        await loadCheckInData()
      } catch {
        if (active) setError('Unable to load check-in queue right now.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [selectedEventId, canOperateCheckin, loadCheckInData])

  const filteredPendingGuests = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase()
    if (!normalized) return pendingGuests
    return pendingGuests.filter((guest) =>
      guest.name.toLowerCase().includes(normalized) ||
      guest.id.toLowerCase().includes(normalized),
    )
  }, [pendingGuests, searchQuery])

  const pendingById = useMemo(() => {
    const map = new Map()
    pendingGuests.forEach((guest) => map.set(guest.id.toLowerCase(), guest))
    return map
  }, [pendingGuests])

  async function onCheckIn(guestId, source = 'manual') {
    if (!selectedEventId) return
    setError('')
    try {
      const guest = await checkInGuest(
        selectedEventId,
        guestId,
        { source, rawCode: source === 'qr' ? scanCode.trim() : guestId },
        { simulateLatency: false },
      )
      await loadCheckInData()
      setLastScan({ status: 'success', title: 'Check-in successful', detail: `${guest.name} (${guest.id})` })
    } catch (checkInError) {
      setError(checkInError?.message ?? 'Unable to check in guest right now.')
      setLastScan({ status: 'error', title: 'Check-in failed', detail: checkInError?.message ?? 'Try again.' })
    }
  }

  async function onScanSubmit(event) {
    event.preventDefault()
    if (!scanCode.trim()) return
    try {
      const matchedGuest = await validateManageQrCode(selectedEventId, scanCode.trim(), { simulateLatency: false })
      if (!pendingById.get(matchedGuest.id.toLowerCase())) {
        setError('Guest is already checked in.')
        await recordManageScanOutcome(
          selectedEventId,
          {
            status: 'warning',
            source: 'qr',
            input: scanCode.trim(),
            detail: `${matchedGuest.name} already checked in.`,
            guestId: matchedGuest.id,
            name: matchedGuest.name,
          },
          { simulateLatency: false },
        )
        await loadCheckInData()
        setLastScan({ status: 'warning', title: 'Already checked in', detail: `${matchedGuest.name} already entered.` })
        return
      }
      await onCheckIn(matchedGuest.id, 'qr')
      setScanCode('')
    } catch (scanError) {
      setError(scanError?.message ?? 'Invalid QR input.')
      await recordManageScanOutcome(
        selectedEventId,
        {
          status: 'error',
          source: 'qr',
          input: scanCode.trim(),
          detail: scanError?.message ?? 'Invalid QR input.',
        },
        { simulateLatency: false },
      )
      await loadCheckInData()
      setLastScan({ status: 'error', title: 'Invalid QR scan', detail: scanError?.message ?? 'Please rescan.' })
    }
  }

  async function onWalkInSubmit(event) {
    event.preventDefault()
    if (!selectedEventId) return
    if (!walkInName.trim()) return
    setError('')
    try {
      await registerWalkIn(
        selectedEventId,
        { name: walkInName.trim(), ticketType: walkInTicket, phone: walkInPhone.trim() },
        { simulateLatency: false },
      )
      setWalkInName('')
      setWalkInPhone('')
      setWalkInTicket('General')
      await loadCheckInData()
      setLastScan({ status: 'success', title: 'Walk-in registered', detail: `${walkInName.trim()} added and checked in.` })
    } catch (walkInError) {
      setError(walkInError?.message ?? 'Unable to register walk-in right now.')
      setLastScan({ status: 'error', title: 'Walk-in failed', detail: walkInError?.message ?? 'Retry with complete data.' })
    }
  }

  async function onExportScanLog() {
    if (!selectedEventId) return
    setScanExporting(true)
    setError('')
    try {
      const report = await exportManageScanOutcomes(
        selectedEventId,
        { status: scanStatus, query: scanQuery },
        { simulateLatency: false },
      )
      downloadFile(report.content, report.filename, report.contentType)
      setLastScan({
        status: 'success',
        title: 'Scan log exported',
        detail: `Downloaded ${report.count} record(s) as ${report.filename}.`,
      })
    } catch (exportError) {
      setError(exportError?.message ?? 'Unable to export scan log.')
    } finally {
      setScanExporting(false)
    }
  }

  if (!selectedEventId) return <EmptyState message="Select an event first to run check-in." />
  if (loading) return <LoadingState label="Loading check-in queue..." />
  if (!canOperateCheckin) return <ErrorState message="Your current role has no check-in permission." />
  if (error && pendingGuests.length === 0 && scanOutcomes.length === 0) return <ErrorState message={error} />

  return (
    <section className="space-y-space-4">
      <ManageSectionHeader
        title="Check-in / Scanner"
        subtitle="Scan QR, manually find guests, and monitor check-in outcomes in real time."
      />
      {error && <ErrorState message={error} />}

      <div className="grid gap-space-3 md:grid-cols-2">
        <ManageCard>
          <p className="font-playfair text-heading-md text-mgmt-text">Scanner Viewfinder</p>
          <div className="relative mt-space-3 overflow-hidden rounded-2xl border border-mgmt-border bg-mgmt-raised p-space-4">
            <div className="mx-auto grid h-44 w-44 place-items-center rounded-2xl border-2 border-dashed border-mgmt-gold/40 bg-white">
              <span className="font-barlow text-label-sm uppercase tracking-wide text-mgmt-gold">Camera Scan Zone</span>
            </div>
            <span className="absolute left-1/2 top-1/2 h-0.5 w-36 -translate-x-1/2 bg-gradient-accent-h shadow-[0_0_12px_rgba(255,107,74,0.35)]" />
          </div>

          <form onSubmit={onScanSubmit} className="mt-space-3 flex gap-space-2">
            <input
              value={scanCode}
              onChange={(event) => setScanCode(event.target.value)}
              placeholder="Paste guest id, payload, or /qr/event/guest URL"
              className={`flex-1 ${inputCls}`}
            />
            <ManageButton type="submit">Scan</ManageButton>
          </form>
        </ManageCard>

        <ManageCard>
          <p className="font-playfair text-heading-md text-mgmt-text">Last Scan Result</p>
          {!lastScan && <p className="mt-space-3 font-body text-body-sm text-mgmt-muted">No scan activity yet.</p>}
          {lastScan && (
            <div className={`mt-space-3 rounded-xl border p-space-3 ${
              lastScan.status === 'success'
                ? 'border-green-200 bg-green-50'
                : lastScan.status === 'warning'
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-red-200 bg-red-50'
            }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-barlow text-[0.9375rem] font-semibold uppercase tracking-wide text-mgmt-text">{lastScan.title}</p>
                <ManageBadge tone={lastScan.status === 'success' ? 'success' : lastScan.status === 'warning' ? 'warning' : 'danger'}>
                  {lastScan.status}
                </ManageBadge>
              </div>
              <p className="mt-space-1 font-body text-body-sm text-mgmt-muted">{lastScan.detail}</p>
            </div>
          )}

          <form onSubmit={onWalkInSubmit} className="mt-space-4 space-y-space-2">
            <p className="font-barlow text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-mgmt-muted">Walk-in Registration</p>
            <input
              value={walkInName}
              onChange={(event) => setWalkInName(event.target.value)}
              placeholder="Guest full name"
              className={`w-full ${inputCls}`}
            />
            <div className="grid grid-cols-1 gap-space-2 sm:grid-cols-2">
              <select
                value={walkInTicket}
                onChange={(event) => setWalkInTicket(event.target.value)}
                className={inputCls}
              >
                <option>General</option>
                <option>VIP</option>
                <option>Staff</option>
              </select>
              <input
                value={walkInPhone}
                onChange={(event) => setWalkInPhone(event.target.value)}
                placeholder="Phone number"
                className={inputCls}
              />
            </div>
            <ManageButton type="submit" variant="secondary">Register Walk-in</ManageButton>
          </form>
        </ManageCard>
      </div>

      <ManageFilterBar>
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Manual guest search by name or id"
          className={`flex-1 ${inputCls}`}
        />
        <ManageBadge tone="neutral">{filteredPendingGuests.length} pending</ManageBadge>
      </ManageFilterBar>

      <div className="grid gap-space-3 md:grid-cols-2">
        <ManageCard>
          <ManageSectionHeader title="Pending Queue" subtitle="Tap a row to check in manually." />
          <div className="mt-space-2 space-y-space-2">
            {filteredPendingGuests.length === 0 && <EmptyState message="All guests are checked in." />}
            {filteredPendingGuests.map((guest) => (
              <button
                type="button"
                key={guest.id}
                onClick={() => onCheckIn(guest.id, 'manual')}
                className="flex w-full items-center justify-between rounded-xl border border-mgmt-border bg-mgmt-raised p-space-2 text-left transition-colors duration-fast hover:border-mgmt-gold/40"
              >
                <div>
                  <p className="font-barlow text-[0.9375rem] font-semibold uppercase tracking-wide text-mgmt-text">{guest.name}</p>
                  <p className="font-body text-caption-lg text-mgmt-muted">{guest.id} - {guest.ticketType}</p>
                </div>
                <ManageBadge tone="warning">Check in</ManageBadge>
              </button>
            ))}
          </div>
        </ManageCard>

        <ManageCard>
          <ManageSectionHeader title="Scan Log" subtitle="Success, warning, and error outcomes from the gate." />
          <div className="mt-space-2 space-y-space-2 rounded-xl border border-mgmt-border bg-mgmt-raised p-space-2">
            <input
              value={scanQuery}
              onChange={(event) => setScanQuery(event.target.value)}
              placeholder="Search by guest, detail, source, or code"
              className={`w-full ${inputCls}`}
            />
            <div className="flex flex-wrap items-center gap-space-2">
              {scanStatusChips.map((chip) => (
                <ManageFilterChip
                  key={chip.id}
                  active={scanStatus === chip.id}
                  onClick={() => setScanStatus(chip.id)}
                >
                  {chip.label}
                </ManageFilterChip>
              ))}
              <ManageButton
                variant="secondary"
                onClick={onExportScanLog}
                disabled={scanExporting || scanOutcomes.length === 0}
              >
                {scanExporting ? 'Exporting...' : 'Export Scan Log CSV'}
              </ManageButton>
            </div>
            <ManageBadge tone="neutral">{scanOutcomes.length} outcome(s)</ManageBadge>
          </div>
          <div className="mt-space-2 space-y-space-2">
            {scanOutcomes.length === 0 && <EmptyState message="No scan activity logged yet." />}
            {scanOutcomes.map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between rounded-xl border p-space-2 ${
                  entry.status === 'success'
                    ? 'border-green-200 bg-green-50'
                    : entry.status === 'warning'
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-red-200 bg-red-50'
                }`}
              >
                <div>
                  <p className="font-barlow text-[0.9375rem] font-semibold uppercase tracking-wide text-mgmt-text">{entry.name || 'Unknown guest'}</p>
                  <p className="font-body text-caption-lg text-mgmt-muted">{entry.detail || entry.input || 'No detail'}</p>
                </div>
                <div className="text-right">
                  <ManageBadge tone={entry.status === 'success' ? 'success' : entry.status === 'warning' ? 'warning' : 'danger'}>
                    {entry.status}
                  </ManageBadge>
                  <p className="mt-space-1 font-body text-caption-lg text-mgmt-muted">{entry.source} - {formatTime(entry.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </ManageCard>
      </div>
    </section>
  )
}
