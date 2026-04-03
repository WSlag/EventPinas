import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { SectionHeader, SurfaceCard } from '@/components/ui/MarketplacePrimitives'
import { getGuestQrPayload, listManageGuests, validateManageQrCode } from '@/services'

export default function ManageQrPage() {
  const { selectedEventId, permissions } = useOutletContext()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [guests, setGuests] = useState([])
  const [selectedGuestId, setSelectedGuestId] = useState('')
  const [payload, setPayload] = useState('')
  const [scanInput, setScanInput] = useState('')
  const [scanResult, setScanResult] = useState(null)

  const canUseQrTools = permissions.includes('qr')

  useEffect(() => {
    if (!selectedEventId) return
    if (!canUseQrTools) {
      setLoading(false)
      return
    }

    let active = true

    async function loadGuests() {
      setLoading(true)
      setError('')
      try {
        const payloadGuests = await listManageGuests(selectedEventId, { status: 'all' }, { simulateLatency: false })
        if (!active) return
        setGuests(payloadGuests)
        if (payloadGuests.length) {
          setSelectedGuestId((current) => current || payloadGuests[0].id)
        }
      } catch {
        if (active) setError('Unable to load guests for QR tools.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadGuests()
    return () => {
      active = false
    }
  }, [selectedEventId, canUseQrTools])

  useEffect(() => {
    if (!selectedEventId || !selectedGuestId || !canUseQrTools) return
    let active = true

    async function loadPayload() {
      try {
        const qrPayload = await getGuestQrPayload(selectedEventId, selectedGuestId, { simulateLatency: false })
        if (active) setPayload(qrPayload.payload)
      } catch {
        if (active) setPayload('')
      }
    }

    loadPayload()
    return () => {
      active = false
    }
  }, [selectedEventId, selectedGuestId, canUseQrTools])

  async function onValidate(event) {
    event.preventDefault()
    if (!selectedEventId) return
    setError('')
    setScanResult(null)
    try {
      const guest = await validateManageQrCode(selectedEventId, scanInput, { simulateLatency: false })
      setScanResult(guest)
    } catch (validationError) {
      setError(validationError?.message ?? 'Unable to validate QR code.')
    }
  }

  if (!selectedEventId) return <EmptyState message="Select an event first to use QR tools." />
  if (loading) return <LoadingState label="Loading QR tools..." />
  if (!canUseQrTools) return <ErrorState message="Your current role cannot access QR operations." />
  if (error && !guests.length) return <ErrorState message={error} />

  return (
    <section className="space-y-space-4">
      <SectionHeader title="QR Generator & Validator" subtitle="Generate guest QR payloads and validate scanned codes." />
      {error && <ErrorState message={error} />}

      <div className="grid gap-space-3 md:grid-cols-2">
        <SurfaceCard>
          <h3 className="font-display text-heading-md text-neutral-900">Generate Guest QR Payload</h3>
          <select
            value={selectedGuestId}
            onChange={(event) => setSelectedGuestId(event.target.value)}
            className="mt-space-3 h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
          >
            {guests.map((guest) => (
              <option key={guest.id} value={guest.id}>
                {guest.name} ({guest.id})
              </option>
            ))}
          </select>
          <p className="mt-space-3 rounded-lg border border-neutral-200 bg-neutral-50 p-space-3 font-mono text-caption-lg text-neutral-700 break-all">
            {payload || 'No payload generated yet.'}
          </p>
        </SurfaceCard>

        <SurfaceCard>
          <h3 className="font-display text-heading-md text-neutral-900">Validate Scan Input</h3>
          <form onSubmit={onValidate} className="mt-space-3 space-y-space-2">
            <input
              value={scanInput}
              onChange={(event) => setScanInput(event.target.value)}
              placeholder="Paste guest id, EVENTPH payload, or /qr/event/guest URL"
              className="h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
            />
            <button type="submit" className="rounded-full bg-info px-space-4 py-space-2 font-display text-label-md text-white">
              Validate
            </button>
          </form>

          {scanResult && (
            <div className="mt-space-3 rounded-lg border border-green-200 bg-green-50 p-space-3">
              <p className="font-display text-label-md text-success">Valid guest</p>
              <p className="font-body text-body-sm text-neutral-700">{scanResult.name} · {scanResult.id}</p>
            </div>
          )}
        </SurfaceCard>
      </div>
    </section>
  )
}


