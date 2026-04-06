import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import QRCode from 'qrcode'
import JSZip from 'jszip'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { ManageBadge, ManageButton, ManageCard, ManageSectionHeader } from '@/components/ui/ManagePrimitives'
import { getGuestQrPayload, listManageGuests, validateManageQrCode } from '@/services'

const inputCls = 'h-10 rounded-md border border-mgmt-border bg-mgmt-raised px-space-3 text-body-sm text-mgmt-text placeholder:text-mgmt-dim focus:border-mgmt-gold/60 focus:outline-none focus:ring-1 focus:ring-mgmt-gold/30'

function escapeCsvValue(value) {
  const raw = String(value ?? '')
  if (/[,"\n]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`
  }
  return raw
}

function slugifyFilename(value) {
  const slug = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'guest'
}

export default function ManageQrPage() {
  const { selectedEventId, permissions } = useOutletContext()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [guests, setGuests] = useState([])
  const [selectedGuestId, setSelectedGuestId] = useState('')
  const [payload, setPayload] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const [qrImage, setQrImage] = useState('')
  const [scanInput, setScanInput] = useState('')
  const [scanResult, setScanResult] = useState(null)
  const [actionMessage, setActionMessage] = useState('')
  const [actionTone, setActionTone] = useState('info')
  const [bulkExporting, setBulkExporting] = useState(false)

  const canUseQrTools = permissions.includes('qr')
  const selectedGuest = guests.find((guest) => guest.id === selectedGuestId) ?? null

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
        if (active) {
          setPayload(qrPayload.payload)
          setShareUrl(qrPayload.shareUrl ?? '')
        }
      } catch {
        if (active) {
          setPayload('')
          setShareUrl('')
        }
      }
    }
    loadPayload()
    return () => {
      active = false
    }
  }, [selectedEventId, selectedGuestId, canUseQrTools])

  useEffect(() => {
    let active = true
    async function renderQr() {
      if (!payload) {
        if (active) setQrImage('')
        return
      }
      try {
        const image = await QRCode.toDataURL(payload, {
          errorCorrectionLevel: 'M',
          margin: 1,
          width: 280,
        })
        if (active) setQrImage(image)
      } catch {
        if (active) setQrImage('')
      }
    }
    renderQr()
    return () => {
      active = false
    }
  }, [payload])

  async function writeText(text) {
    const value = String(text ?? '')
    if (!value.trim()) {
      throw new Error('No text available to copy.')
    }
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
      return
    }
    const input = document.createElement('textarea')
    input.value = value
    input.setAttribute('readonly', '')
    input.style.position = 'fixed'
    input.style.top = '-9999px'
    document.body.appendChild(input)
    input.select()
    const copied = document.execCommand('copy')
    document.body.removeChild(input)
    if (!copied) throw new Error('Clipboard is unavailable in this browser.')
  }

  function setAction(tone, message) {
    setActionTone(tone)
    setActionMessage(message)
  }

  async function onCopyPayload() {
    if (!payload) return
    try {
      await writeText(payload)
      setAction('success', 'QR payload copied.')
    } catch {
      setAction('danger', 'Unable to copy payload in this browser.')
    }
  }

  async function onCopyShareLink() {
    if (!shareUrl) return
    try {
      await writeText(shareUrl)
      setAction('success', 'Share link copied.')
    } catch {
      setAction('danger', 'Unable to copy share link in this browser.')
    }
  }

  async function onCopyGuestMessage() {
    if (!selectedGuest || !shareUrl) return
    const message = [
      `Hi ${selectedGuest.name},`,
      'Your check-in QR link is ready:',
      shareUrl,
      '',
      `Backup payload: ${payload}`,
    ].join('\n')
    try {
      await writeText(message)
      setAction('success', 'Guest message copied.')
    } catch {
      setAction('danger', 'Unable to copy guest message in this browser.')
    }
  }

  async function onShareQr() {
    if (!payload || !shareUrl) return
    if (!navigator.share) {
      setAction('warning', 'Web Share is not available. Use Copy Link or Download QR.')
      return
    }
    try {
      await navigator.share({
        title: selectedGuest ? `Guest QR: ${selectedGuest.name}` : 'Guest QR',
        text: selectedGuest
          ? `Check-in link for ${selectedGuest.name}`
          : 'Guest check-in link',
        url: shareUrl,
      })
      setAction('success', 'Share sheet opened.')
    } catch {
      // Sharing can be cancelled by user; no action needed.
    }
  }

  function triggerDownload(blobOrUrl, filename) {
    if (!blobOrUrl) {
      throw new Error('Download file is not ready.')
    }
    const canCreateObjectUrl = typeof URL?.createObjectURL === 'function'
    const href = typeof blobOrUrl === 'string'
      ? blobOrUrl
      : canCreateObjectUrl
        ? URL.createObjectURL(blobOrUrl)
        : ''
    if (!href) {
      throw new Error('Download is not supported in this browser.')
    }

    const link = document.createElement('a')
    link.href = href
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    if (typeof blobOrUrl !== 'string') {
      URL.revokeObjectURL(href)
    }
  }

  function onDownloadQr() {
    if (!qrImage || !selectedGuestId) return
    try {
      triggerDownload(qrImage, `guest-${selectedGuestId}.png`)
      setAction('success', 'QR image download started.')
    } catch {
      setAction('danger', 'Unable to download QR image in this browser.')
    }
  }

  async function onExportAllQrBundle() {
    if (!selectedEventId || guests.length === 0) return
    setBulkExporting(true)
    try {
      const zip = new JSZip()
      const csvRows = [['guestId', 'guestName', 'ticketType', 'payload', 'shareUrl']]

      for (const guest of guests) {
        const qrPayload = await getGuestQrPayload(selectedEventId, guest.id, { simulateLatency: false })
        const pngDataUrl = await QRCode.toDataURL(qrPayload.payload, {
          errorCorrectionLevel: 'M',
          margin: 1,
          width: 640,
        })
        const base64 = pngDataUrl.split(',')[1]
        if (!base64) {
          throw new Error(`Unable to generate QR image for ${guest.name}.`)
        }
        const safeName = slugifyFilename(guest.name)
        zip.file(`qr/${safeName}-${guest.id}.png`, base64, { base64: true })
        csvRows.push([
          guest.id,
          guest.name,
          guest.ticketType,
          qrPayload.payload,
          qrPayload.shareUrl ?? '',
        ])
      }

      const csvContent = csvRows
        .map((row) => row.map(escapeCsvValue).join(','))
        .join('\n')
      zip.file('guest-qr-mapping.csv', csvContent)
      zip.file(
        'README.txt',
        [
          `Event: ${selectedEventId}`,
          `Generated: ${new Date().toISOString()}`,
          'Contains guest QR PNG files and guest-qr-mapping.csv.',
        ].join('\n'),
      )

      const bundle = await zip.generateAsync({ type: 'blob' })
      triggerDownload(bundle, `event-${selectedEventId}-qr-bundle.zip`)
      setAction('success', `Exported QR bundle for ${guests.length} guest(s).`)
    } catch (bundleError) {
      setAction('danger', bundleError?.message ?? 'Unable to export QR bundle.')
    } finally {
      setBulkExporting(false)
    }
  }

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
      <ManageSectionHeader title="QR Generator & Validator" subtitle="Generate guest QR payloads and validate scanned codes." />
      {error && <ErrorState message={error} />}
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
          <p className="font-body text-body-sm text-mgmt-text">{actionMessage}</p>
        </ManageCard>
      )}

      <div className="grid gap-space-3 md:grid-cols-2">
        <ManageCard>
          <h3 className="font-playfair text-heading-md text-mgmt-text">Generate Guest QR</h3>
          <select
            value={selectedGuestId}
            onChange={(event) => setSelectedGuestId(event.target.value)}
            className={`mt-space-3 w-full ${inputCls}`}
          >
            {guests.map((guest) => (
              <option key={guest.id} value={guest.id}>
                {guest.name} ({guest.id})
              </option>
            ))}
          </select>
          <div className="mt-space-3 rounded-lg border border-mgmt-border bg-mgmt-raised p-space-3">
            <div className="flex items-center justify-center rounded-lg border border-mgmt-border bg-mgmt-raised p-space-2">
              {qrImage ? (
                <img src={qrImage} alt="Generated guest QR code" className="h-52 w-52 object-contain" />
              ) : (
                <p className="font-body text-body-sm text-mgmt-muted">No QR generated yet.</p>
              )}
            </div>
            <p className="mt-space-2 break-all rounded-lg border border-mgmt-border bg-mgmt-raised p-space-2 font-mono text-caption-lg text-mgmt-muted">
              {payload || 'No payload generated yet.'}
            </p>
            <p className="mt-space-2 break-all rounded-lg border border-mgmt-border bg-mgmt-raised p-space-2 font-mono text-caption-lg text-mgmt-muted">
              {shareUrl || 'No share link generated yet.'}
            </p>
            <div className="mt-space-2 flex flex-wrap gap-space-2">
              <ManageButton variant="secondary" onClick={onCopyPayload} disabled={!payload}>Copy Payload</ManageButton>
              <ManageButton variant="secondary" onClick={onCopyShareLink} disabled={!shareUrl}>Copy Share Link</ManageButton>
              <ManageButton variant="secondary" onClick={onCopyGuestMessage} disabled={!shareUrl || !payload}>
                Copy Guest Message
              </ManageButton>
              <ManageButton variant="secondary" onClick={onShareQr} disabled={!shareUrl || !payload}>Share</ManageButton>
              <ManageButton onClick={onDownloadQr} disabled={!qrImage}>Download QR PNG</ManageButton>
              <ManageButton
                variant="secondary"
                onClick={onExportAllQrBundle}
                disabled={bulkExporting || guests.length === 0}
              >
                {bulkExporting ? 'Exporting...' : 'Export All QR Bundle'}
              </ManageButton>
            </div>
          </div>
        </ManageCard>

        <ManageCard>
          <h3 className="font-playfair text-heading-md text-mgmt-text">Validate Scan Input</h3>
          <form onSubmit={onValidate} className="mt-space-3 space-y-space-2">
            <input
              value={scanInput}
              onChange={(event) => setScanInput(event.target.value)}
              placeholder="Paste guest id, EVENTPH payload, or /qr/event/guest URL"
              className={`w-full ${inputCls}`}
            />
            <ManageButton type="submit">Validate</ManageButton>
          </form>

          {scanResult && (
            <div className="mt-space-3 rounded-lg border border-green-200 bg-green-50 p-space-3">
              <div className="flex items-center justify-between">
                <p className="font-barlow text-[0.875rem] font-semibold uppercase tracking-wide text-green-700">Valid guest</p>
                <ManageBadge tone="success">Verified</ManageBadge>
              </div>
              <p className="font-body text-body-sm text-mgmt-text">{scanResult.name} - {scanResult.id}</p>
            </div>
          )}
        </ManageCard>
      </div>
    </section>
  )
}
