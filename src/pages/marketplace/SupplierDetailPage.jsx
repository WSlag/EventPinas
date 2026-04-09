
import { useEffect, useMemo, useState } from 'react'
import { Link, useBeforeUnload, useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { HeroBanner, PageShell, SectionHeader, StatChip, SurfaceCard } from '@/components/ui/MarketplacePrimitives'
import {
  canEditProfile,
  getSavedItems,
  getSupplierProfileById,
  toggleSavedItem,
  uploadMarketplaceProfileImage,
  updateSupplierProfile,
  validateSupplierProfile,
} from '@/services'
import { getFallbackImageHandler } from '@/utils/imageFallback'

const supplierImageByCategory = {
  Florist: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1400&q=80',
  Catering: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1400&q=80',
  Photography: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1400&q=80',
  'Audio-Visual': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1400&q=80',
}

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'packages', label: 'Packages' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'info', label: 'Business Info' },
]

function formatPrice(value) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value)
}

function formatLastUpdated(value) {
  if (!value) return 'Not yet updated'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Not yet updated'

  return new Intl.DateTimeFormat('en-PH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsed)
}

function splitListInput(value) {
  return String(value ?? '')
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizePhoneHref(value) {
  return `tel:${String(value ?? '').replace(/\s+/g, '')}`
}

function toExternalHref(value) {
  const normalized = String(value ?? '').trim()
  if (!normalized) return ''
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) return normalized
  return `https://${normalized}`
}

function buildFormState(supplier) {
  return {
    name: supplier?.name ?? '',
    category: supplier?.category ?? '',
    city: supplier?.city ?? '',
    priceRangeLabel: supplier?.priceRangeLabel ?? '',
    startingPricePhp: String(supplier?.startingPricePhp ?? 0),
    responseTime: supplier?.responseTime ?? '',
    tag: supplier?.tag ?? '',
    imageUrl: supplier?.imageUrl ?? '',
    bio: supplier?.bio ?? '',
    specializations: (supplier?.specializations ?? []).join('\n'),
    coverageAreas: (supplier?.coverageAreas ?? []).join('\n'),
    paymentMethods: (supplier?.paymentMethods ?? []).join('\n'),
    portfolio: (supplier?.portfolio ?? []).join('\n'),
    businessType: supplier?.businessInfo?.businessType ?? '',
    operatingSince: supplier?.businessInfo?.operatingSince ?? '',
    contact: supplier?.businessInfo?.contact ?? '',
    email: supplier?.businessInfo?.email ?? '',
    facebook: supplier?.businessInfo?.facebook ?? '',
  }
}

function buildPayloadFromForm(form) {
  return {
    name: form.name,
    category: form.category,
    city: form.city,
    priceRangeLabel: form.priceRangeLabel,
    startingPricePhp: Number(form.startingPricePhp),
    responseTime: form.responseTime,
    tag: form.tag,
    imageUrl: form.imageUrl,
    bio: form.bio,
    specializations: splitListInput(form.specializations),
    coverageAreas: splitListInput(form.coverageAreas),
    paymentMethods: splitListInput(form.paymentMethods),
    portfolio: splitListInput(form.portfolio),
    businessInfo: {
      businessType: form.businessType,
      operatingSince: form.operatingSince,
      contact: form.contact,
      email: form.email,
      facebook: form.facebook,
    },
  }
}

function formHasChanges(form, baseline) {
  return JSON.stringify(form) !== JSON.stringify(baseline)
}

export default function SupplierDetailPage() {
  const { id } = useParams()
  const { user, profile: viewerProfile } = useAuth()
  const [supplier, setSupplier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savedMap, setSavedMap] = useState(() => getSavedItems())
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState(() => buildFormState(null))
  const [saveError, setSaveError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isUploadingPortfolio, setIsUploadingPortfolio] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [showValidation, setShowValidation] = useState(false)

  useEffect(() => {
    let active = true

    async function loadDetail() {
      setLoading(true)
      setError('')

      try {
        const item = await getSupplierProfileById(id)
        if (active) setSupplier(item)
      } catch {
        if (active) setError('Unable to load supplier details right now.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDetail()
    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    setActiveTab('overview')
    setIsEditing(false)
    setShowValidation(false)
    setSaveError('')
    setSaveMessage('')
    setUploadError('')
  }, [id])

  const baselineForm = useMemo(() => buildFormState(supplier), [supplier])

  useEffect(() => {
    setForm(baselineForm)
  }, [baselineForm])

  const isDirty = useMemo(() => formHasChanges(form, baselineForm), [form, baselineForm])

  useBeforeUnload(
    (event) => {
      if (!isEditing || !isDirty) return
      event.preventDefault()
      event.returnValue = ''
    },
    { capture: true },
  )

  const isSaved = useMemo(() => (savedMap.suppliers ?? []).includes(id), [savedMap.suppliers, id])
  const fallbackImage = supplier ? supplierImageByCategory[supplier.category] || supplierImageByCategory.Photography : supplierImageByCategory.Photography

  const canEdit = useMemo(
    () => canEditProfile({
      viewerUid: user?.uid,
      viewerRole: viewerProfile?.role,
      profileType: 'supplier',
      ownerUid: supplier?.ownerUid ?? null,
      profileId: supplier?.id ?? id,
      viewerMarketplaceProfile: viewerProfile?.marketplaceProfile ?? null,
    }),
    [id, supplier?.id, supplier?.ownerUid, user?.uid, viewerProfile?.marketplaceProfile, viewerProfile?.role],
  )

  const validation = useMemo(() => {
    if (!supplier) {
      return { isValid: false, errors: [], fieldErrors: {} }
    }

    const payload = buildPayloadFromForm(form)
    return validateSupplierProfile({
      ...supplier,
      ...payload,
      businessInfo: {
        ...(supplier.businessInfo ?? {}),
        ...(payload.businessInfo ?? {}),
      },
    })
  }, [form, supplier])

  const reviewStats = useMemo(() => {
    const reviewList = supplier?.reviewList ?? []
    const total = reviewList.length

    return [5, 4, 3, 2, 1].map((stars) => {
      const count = reviewList.filter((item) => item.rating === stars).length
      const percent = total > 0 ? Math.round((count / total) * 100) : 0
      return { stars, count, percent }
    })
  }, [supplier])

  const contactHref = supplier?.businessInfo?.email
    ? `mailto:${supplier.businessInfo.email}?subject=${encodeURIComponent(`Quote request for ${supplier?.name ?? 'supplier'}`)}`
    : supplier?.businessInfo?.contact
      ? normalizePhoneHref(supplier.businessInfo.contact)
      : toExternalHref(supplier?.businessInfo?.facebook)

  const messageHref = toExternalHref(supplier?.businessInfo?.facebook) || (supplier?.businessInfo?.email ? `mailto:${supplier.businessInfo.email}` : '')

  function onToggleSaved() {
    const updated = toggleSavedItem('suppliers', id)
    setSavedMap(updated)
  }

  function onBackClick(event) {
    if (isEditing && isDirty && !window.confirm('You have unsaved profile changes. Leave this page anyway?')) {
      event.preventDefault()
    }
  }

  function onTabChange(nextTab) {
    if (nextTab === activeTab) return
    if (isEditing && isDirty && !window.confirm('You have unsaved profile changes. Switch tabs anyway?')) {
      return
    }
    setActiveTab(nextTab)
  }

  function onStartEditing() {
    setSaveError('')
    setSaveMessage('')
    setUploadError('')
    setShowValidation(false)
    setIsEditing(true)
  }

  function onCancelEditing() {
    if (isDirty && !window.confirm('Discard unsaved profile changes?')) {
      return
    }

    setForm(baselineForm)
    setShowValidation(false)
    setSaveError('')
    setUploadError('')
    setIsEditing(false)
  }

  async function onUploadMainImage(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !user?.uid) return

    setUploadError('')
    setSaveMessage('')
    setIsUploadingImage(true)

    try {
      const uploadedUrl = await uploadMarketplaceProfileImage({
        profileType: 'supplier',
        profileId: id,
        actorUid: user.uid,
        file,
        purpose: 'main',
      })
      setForm((current) => ({ ...current, imageUrl: uploadedUrl }))
      setSaveMessage('Main photo uploaded. Save profile to publish this change.')
    } catch (uploadFailure) {
      setUploadError(uploadFailure?.message ?? 'Unable to upload image right now.')
    } finally {
      setIsUploadingImage(false)
    }
  }

  async function onUploadPortfolioImages(event) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (files.length === 0 || !user?.uid) return

    setUploadError('')
    setSaveMessage('')
    setIsUploadingPortfolio(true)

    try {
      const uploadedUrls = await Promise.all(
        files.map((file) => uploadMarketplaceProfileImage({
          profileType: 'supplier',
          profileId: id,
          actorUid: user.uid,
          file,
          purpose: 'portfolio',
        })),
      )
      setForm((current) => {
        const existing = splitListInput(current.portfolio)
        const merged = Array.from(new Set([...existing, ...uploadedUrls]))
        return { ...current, portfolio: merged.join('\n') }
      })
      setSaveMessage('Portfolio image(s) uploaded. Save profile to publish these changes.')
    } catch (uploadFailure) {
      setUploadError(uploadFailure?.message ?? 'Unable to upload portfolio images right now.')
    } finally {
      setIsUploadingPortfolio(false)
    }
  }

  async function onSaveProfile(event) {
    event.preventDefault()
    setShowValidation(true)
    setSaveError('')
    setSaveMessage('')

    if (!supplier || !user?.uid) {
      setSaveError('Please sign in as the profile owner before saving.')
      return
    }

    if (!validation.isValid) {
      return
    }

    const payload = buildPayloadFromForm(form)
    const previous = supplier
    const optimistic = {
      ...supplier,
      ...payload,
      businessInfo: {
        ...(supplier.businessInfo ?? {}),
        ...(payload.businessInfo ?? {}),
      },
      updatedAt: new Date().toISOString(),
    }

    setIsSaving(true)
    setSupplier(optimistic)

    try {
      const updated = await updateSupplierProfile(id, payload, user.uid)
      setSupplier(updated)
      setIsEditing(false)
      setShowValidation(false)
      setSaveMessage('Supplier profile updated successfully.')
    } catch (submitError) {
      setSupplier(previous)
      setSaveError(submitError?.message ?? 'Unable to save supplier profile right now.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PageShell className="space-y-space-6">
      <HeroBanner
        eyebrow="Supplier Profile"
        title={supplier?.name ?? 'Loading supplier...'}
        description={supplier ? `${supplier.category} - ${supplier.city}` : 'Fetching supplier profile and pricing details.'}
        tone="teal"
        actions={(
          <>
            <Link to="/suppliers" onClick={onBackClick} className="rounded-full bg-white px-space-4 py-space-2 font-display text-label-md text-secondary-700">
              Back to suppliers
            </Link>
            {canEdit && !isEditing && (
              <button
                type="button"
                onClick={onStartEditing}
                className="rounded-full border border-white/60 bg-transparent px-space-4 py-space-2 font-display text-label-md text-white"
              >
                Edit profile
              </button>
            )}
          </>
        )}
      />

      <p className="sr-only" aria-live="polite">{saveError || saveMessage}</p>

      {loading && <LoadingState label="Loading supplier details..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && !supplier && <EmptyState message="Supplier not found." />}

      {!loading && !error && supplier && (
        <>
          {isEditing && canEdit && (
            <SurfaceCard className="space-y-space-3 border-primary-200">
              <SectionHeader title="Edit Supplier Profile" subtitle="Update your public profile details. Changes are only saved when you tap Save." />
              {saveError && <ErrorState message={saveError} />}
              {uploadError && <ErrorState message={uploadError} />}

              {showValidation && validation.errors.length > 0 && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-space-3">
                  <p className="font-display text-label-md text-red-700">Please fix the following before saving:</p>
                  <ul className="mt-space-2 space-y-1 font-body text-body-sm text-red-700">
                    {validation.errors.map((message) => (
                      <li key={message}>- {message}</li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={onSaveProfile} className="space-y-space-4">
                <div className="grid gap-space-3 md:grid-cols-2">
                  <label className="block">
                    <span className="font-body text-label-sm text-neutral-700">Supplier Name</span>
                    <input
                      value={form.name}
                      onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                      className="mt-space-1 h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                    />
                    {showValidation && validation.fieldErrors.name && <p className="mt-space-1 text-caption-lg text-red-600">{validation.fieldErrors.name}</p>}
                  </label>

                  <label className="block">
                    <span className="font-body text-label-sm text-neutral-700">Category</span>
                    <input
                      value={form.category}
                      onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                      className="mt-space-1 h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                    />
                    {showValidation && validation.fieldErrors.category && <p className="mt-space-1 text-caption-lg text-red-600">{validation.fieldErrors.category}</p>}
                  </label>

                  <label className="block">
                    <span className="font-body text-label-sm text-neutral-700">City</span>
                    <input
                      value={form.city}
                      onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                      className="mt-space-1 h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                    />
                    {showValidation && validation.fieldErrors.city && <p className="mt-space-1 text-caption-lg text-red-600">{validation.fieldErrors.city}</p>}
                  </label>

                  <label className="block">
                    <span className="font-body text-label-sm text-neutral-700">Starting Price (PHP)</span>
                    <input
                      type="number"
                      min="0"
                      value={form.startingPricePhp}
                      onChange={(event) => setForm((current) => ({ ...current, startingPricePhp: event.target.value }))}
                      className="mt-space-1 h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                    />
                  </label>

                  <label className="block md:col-span-2">
                    <span className="font-body text-label-sm text-neutral-700">Price Label</span>
                    <input
                      value={form.priceRangeLabel}
                      onChange={(event) => setForm((current) => ({ ...current, priceRangeLabel: event.target.value }))}
                      className="mt-space-1 h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                    />
                  </label>

                  <label className="block md:col-span-2">
                    <span className="font-body text-label-sm text-neutral-700">Main Photo URL</span>
                    <input
                      value={form.imageUrl}
                      onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))}
                      className="mt-space-1 h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                    />
                    <div className="mt-space-2 flex flex-wrap items-center gap-space-2">
                      <label className="rounded-full border border-neutral-300 bg-white px-space-3 py-space-1 font-display text-label-sm text-neutral-700">
                        <span>{isUploadingImage ? 'Uploading...' : 'Upload Main Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingImage || isSaving}
                          onChange={onUploadMainImage}
                          className="sr-only"
                        />
                      </label>
                      <span className="font-body text-caption-lg text-neutral-500">Upload from your device, then save profile.</span>
                    </div>
                  </label>

                  <label className="block md:col-span-2">
                    <span className="font-body text-label-sm text-neutral-700">Bio</span>
                    <textarea
                      value={form.bio}
                      onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                      rows={4}
                      className="mt-space-1 w-full rounded-md border border-neutral-200 bg-white px-space-3 py-space-2 text-body-sm"
                    />
                  </label>

                  <label className="block md:col-span-2">
                    <span className="font-body text-label-sm text-neutral-700">Specializations (one per line)</span>
                    <textarea
                      value={form.specializations}
                      onChange={(event) => setForm((current) => ({ ...current, specializations: event.target.value }))}
                      rows={3}
                      className="mt-space-1 w-full rounded-md border border-neutral-200 bg-white px-space-3 py-space-2 text-body-sm"
                    />
                    {showValidation && validation.fieldErrors.specializations && <p className="mt-space-1 text-caption-lg text-red-600">{validation.fieldErrors.specializations}</p>}
                  </label>

                  <label className="block md:col-span-2">
                    <span className="font-body text-label-sm text-neutral-700">Portfolio Image URLs (one per line)</span>
                    <textarea
                      value={form.portfolio}
                      onChange={(event) => setForm((current) => ({ ...current, portfolio: event.target.value }))}
                      rows={3}
                      className="mt-space-1 w-full rounded-md border border-neutral-200 bg-white px-space-3 py-space-2 text-body-sm"
                    />
                    <div className="mt-space-2 flex flex-wrap items-center gap-space-2">
                      <label className="rounded-full border border-neutral-300 bg-white px-space-3 py-space-1 font-display text-label-sm text-neutral-700">
                        <span>{isUploadingPortfolio ? 'Uploading...' : 'Upload Portfolio Photos'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={isUploadingPortfolio || isSaving}
                          onChange={onUploadPortfolioImages}
                          className="sr-only"
                        />
                      </label>
                      <span className="font-body text-caption-lg text-neutral-500">You can select multiple images.</span>
                    </div>
                    {showValidation && validation.fieldErrors.portfolio && <p className="mt-space-1 text-caption-lg text-red-600">{validation.fieldErrors.portfolio}</p>}
                  </label>

                  <label className="block">
                    <span className="font-body text-label-sm text-neutral-700">Business Contact</span>
                    <input
                      value={form.contact}
                      onChange={(event) => setForm((current) => ({ ...current, contact: event.target.value }))}
                      className="mt-space-1 h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                    />
                  </label>

                  <label className="block">
                    <span className="font-body text-label-sm text-neutral-700">Business Email</span>
                    <input
                      value={form.email}
                      onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                      className="mt-space-1 h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                    />
                    {showValidation && validation.fieldErrors.email && <p className="mt-space-1 text-caption-lg text-red-600">{validation.fieldErrors.email}</p>}
                  </label>

                  <label className="block md:col-span-2">
                    <span className="font-body text-label-sm text-neutral-700">Facebook</span>
                    <input
                      value={form.facebook}
                      onChange={(event) => setForm((current) => ({ ...current, facebook: event.target.value }))}
                      className="mt-space-1 h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                    />
                    {showValidation && validation.fieldErrors.contact && <p className="mt-space-1 text-caption-lg text-red-600">{validation.fieldErrors.contact}</p>}
                  </label>
                </div>

                <div className="hidden items-center justify-end gap-space-2 md:flex">
                  <button
                    type="button"
                    onClick={onCancelEditing}
                    disabled={isSaving}
                    className="rounded-full border border-neutral-300 bg-white px-space-4 py-space-2 font-display text-label-md text-neutral-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || isUploadingImage || isUploadingPortfolio || !isDirty || !validation.isValid}
                    className="rounded-full bg-primary-500 px-space-4 py-space-2 font-display text-label-md text-white disabled:opacity-60"
                  >
                    {isSaving ? 'Saving...' : 'Save profile'}
                  </button>
                </div>
              </form>
            </SurfaceCard>
          )}

          {isEditing && canEdit && (
            <div className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white p-space-3 shadow-lg md:hidden">
              <div className="mx-auto flex w-full max-w-[1280px] gap-space-2">
                <button
                  type="button"
                  onClick={onCancelEditing}
                  disabled={isSaving}
                  className="h-11 flex-1 rounded-full border border-neutral-300 bg-white font-display text-label-md text-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onSaveProfile}
                  disabled={isSaving || isUploadingImage || isUploadingPortfolio || !isDirty || !validation.isValid}
                  className="h-11 flex-1 rounded-full bg-primary-500 font-display text-label-md text-white disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          )}

          <SurfaceCard className="overflow-hidden p-0">
            <img
              src={supplier.imageUrl || fallbackImage}
              alt={supplier.name}
              onError={getFallbackImageHandler(fallbackImage)}
              className="h-64 w-full object-cover"
            />
            <div className="space-y-space-3 p-space-4">
              <div>
                <div className="mb-space-1 flex flex-wrap items-center gap-space-1">
                  <span className="inline-flex rounded-full bg-secondary-50 px-space-2 py-space-1 font-display text-overline uppercase text-secondary-700">
                    {supplier.category}
                  </span>
                  {supplier.isVerified && (
                    <span className="inline-flex rounded-full bg-primary-50 px-space-2 py-space-1 font-display text-overline uppercase text-primary-600">
                      Verified
                    </span>
                  )}
                  {supplier.isFeatured && (
                    <span className="inline-flex rounded-full bg-primary-500 px-space-2 py-space-1 font-display text-overline uppercase text-white">
                      Featured
                    </span>
                  )}
                  <span className="inline-flex rounded-full bg-neutral-100 px-space-2 py-space-1 font-display text-overline uppercase text-neutral-700">
                    {supplier.completeness?.percent ?? 0}% complete
                  </span>
                </div>
                <h1 className="mt-space-1 font-display text-heading-xl text-neutral-900">{supplier.name}</h1>
              </div>

              <p className="font-body text-body-md text-neutral-600">{supplier.category} - {supplier.city}</p>
              <p className="font-body text-body-md text-neutral-600">Rating: {supplier.rating} ({supplier.reviews} reviews)</p>
              <p className="font-display text-display-lg text-info">{supplier.priceRangeLabel || `Starts at ${formatPrice(supplier.startingPricePhp)}`}</p>
              <p className="font-body text-body-sm text-neutral-500">Last updated: {formatLastUpdated(supplier.updatedAt)}</p>
              {saveMessage && <p className="font-body text-body-sm text-secondary-700">{saveMessage}</p>}
              {supplier.tag && <p className="font-body text-body-sm text-primary-600">{supplier.tag}</p>}

              {(supplier.specializations ?? []).length > 0 && (
                <div className="flex flex-wrap gap-space-2">
                  {supplier.specializations.map((item) => (
                    <span key={item} className="rounded-full bg-primary-50 px-space-3 py-space-1 font-body text-caption-lg text-primary-600">
                      {item}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-space-2 pt-space-1">
                {contactHref
                  ? (
                    <a href={contactHref} className="rounded-full bg-primary-500 px-space-4 py-space-2 font-display text-label-md text-white">
                      Get Quote
                    </a>
                  )
                  : (
                    <Link to="/login" className="rounded-full bg-primary-500 px-space-4 py-space-2 font-display text-label-md text-white">
                      Sign in to Quote
                    </Link>
                  )}
                {messageHref
                  ? (
                    <a href={messageHref} className="rounded-full border border-neutral-300 bg-white px-space-4 py-space-2 font-display text-label-md text-neutral-700">
                      Message
                    </a>
                  )
                  : (
                    <Link to="/login" className="rounded-full border border-neutral-300 bg-white px-space-4 py-space-2 font-display text-label-md text-neutral-700">
                      Sign in to Message
                    </Link>
                  )}
                <button
                  type="button"
                  onClick={onToggleSaved}
                  className={`rounded-full border px-space-4 py-space-2 font-display text-label-md ${
                    isSaved ? 'border-secondary-500 bg-secondary-50 text-secondary-700' : 'border-neutral-300 text-neutral-500'
                  }`}
                >
                  {isSaved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
          </SurfaceCard>

          <section className="space-y-space-3">
            <SectionHeader title="Supplier Snapshot" />
            <div className="grid grid-cols-3 gap-space-2">
              <StatChip label="Events Done" value={supplier.eventsDone ?? 0} />
              <StatChip label="Starting At" value={supplier.priceRangeLabel || formatPrice(supplier.startingPricePhp)} />
              <StatChip label="Location" value={supplier.city} />
            </div>
          </section>

          <SurfaceCard className="space-y-space-4">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex min-w-max gap-space-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onTabChange(tab.id)}
                    className={`rounded-full border px-space-3 py-space-1 text-label-sm transition-all duration-fast ${
                      activeTab === tab.id
                        ? 'border-primary-400 bg-primary-50 text-primary-600'
                        : 'border-neutral-200 text-neutral-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-space-3">
                <p className="font-body text-body-sm text-neutral-700">{supplier.bio}</p>
                <div className="grid gap-space-2 sm:grid-cols-2 md:grid-cols-4">
                  <StatChip label="Profile" value={`${supplier.completeness?.percent ?? 0}%`} />
                  <StatChip label="Response" value={supplier.responseTime || 'N/A'} />
                  <StatChip label="Reviews" value={supplier.reviews} />
                  <StatChip label="Coverage" value={(supplier.coverageAreas ?? []).length} />
                </div>
                {(supplier.specializations ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-space-2">
                    {supplier.specializations.map((item) => (
                      <span key={item} className="rounded-full bg-secondary-50 px-space-3 py-space-1 font-body text-caption-lg text-secondary-700">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'portfolio' && (
              <div className="space-y-space-3">
                <div className="grid gap-space-2 sm:grid-cols-2 lg:grid-cols-3">
                  {(supplier.portfolio ?? []).map((image, index) => (
                    <img key={`${image}-${index}`} src={image} alt={`${supplier.name} portfolio ${index + 1}`} className="h-40 w-full rounded-xl object-cover" />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'packages' && (
              <div className="grid gap-space-3 md:grid-cols-3">
                {(supplier.packages ?? []).map((pkg) => (
                  <article key={pkg.id} className="rounded-2xl border border-neutral-200 p-space-3">
                    <div className="flex items-center justify-between gap-space-2">
                      <h3 className="font-display text-heading-md text-neutral-900">{pkg.name}</h3>
                      {pkg.isPopular && (
                        <span className="rounded-full bg-primary-50 px-space-2 py-space-1 font-display text-overline uppercase text-primary-600">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="mt-space-1 font-display text-heading-lg text-info">{formatPrice(pkg.pricePhp)}</p>
                    <ul className="mt-space-2 space-y-1 font-body text-body-sm text-neutral-600">
                      {(pkg.inclusions ?? []).map((inclusion) => (
                        <li key={inclusion}>- {inclusion}</li>
                      ))}
                    </ul>
                    <button type="button" className="mt-space-3 w-full rounded-full bg-primary-500 px-space-3 py-space-2 font-display text-label-md text-white">
                      Select This Package
                    </button>
                  </article>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-space-3">
                <div className="space-y-space-2 rounded-2xl border border-neutral-200 p-space-3">
                  <p className="font-display text-heading-lg text-neutral-900">{supplier.rating} Overall Rating</p>
                  {reviewStats.map((row) => (
                    <div key={row.stars} className="flex items-center gap-space-2">
                      <span className="w-12 font-body text-caption-lg text-neutral-600">{row.stars} star</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                        <div className="h-full rounded-full bg-primary-500" style={{ width: `${row.percent}%` }} />
                      </div>
                      <span className="w-10 text-right font-body text-caption-lg text-neutral-500">{row.count}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-space-2">
                  {(supplier.reviewList ?? []).map((review) => (
                    <article key={review.id} className="rounded-2xl border border-neutral-200 p-space-3">
                      <p className="font-display text-heading-sm text-neutral-900">{review.name}</p>
                      <p className="font-body text-caption-lg text-neutral-500">{review.eventType} - {review.date}</p>
                      <p className="mt-space-1 font-body text-body-sm text-neutral-600">Rating: {review.rating}/5</p>
                      <p className="mt-space-1 font-body text-body-sm text-neutral-700">{review.comment}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'info' && (
              <div className="space-y-space-3">
                <div className="grid gap-space-2 sm:grid-cols-2">
                  <StatChip label="Business Type" value={supplier.businessInfo?.businessType || 'N/A'} />
                  <StatChip label="Operating Since" value={supplier.businessInfo?.operatingSince || 'N/A'} />
                  <StatChip label="Response Time" value={supplier.responseTime || 'N/A'} />
                  <StatChip label="Contact" value={supplier.businessInfo?.contact || 'N/A'} />
                </div>
                <div className="rounded-2xl border border-neutral-200 p-space-3">
                  <p className="font-body text-body-sm text-neutral-700">Coverage: {(supplier.coverageAreas ?? []).join(', ')}</p>
                  <p className="mt-space-1 font-body text-body-sm text-neutral-700">Payment Methods: {(supplier.paymentMethods ?? []).join(', ')}</p>
                  <p className="mt-space-1 font-body text-body-sm text-neutral-700">Email: {supplier.businessInfo?.email || 'N/A'}</p>
                  <p className="mt-space-1 font-body text-body-sm text-neutral-700">Facebook: {supplier.businessInfo?.facebook || 'N/A'}</p>
                </div>
                {supplier.businessInfo?.dtiVerified && (
                  <div className="rounded-2xl bg-secondary-50 p-space-3 font-body text-body-sm text-secondary-700">
                    DTI verification is on file for this supplier profile.
                  </div>
                )}
              </div>
            )}
          </SurfaceCard>
        </>
      )}
    </PageShell>
  )
}
