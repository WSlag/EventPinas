
import { useEffect, useMemo, useState } from 'react'
import { Link, useBeforeUnload, useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/PageStates'
import { HeroBanner, PageShell, SectionHeader, StatChip, SurfaceCard } from '@/components/ui/MarketplacePrimitives'
import {
  canEditProfile,
  getOrganizerProfileById,
  getSavedItems,
  toggleSavedItem,
  uploadMarketplaceProfileImage,
  updateOrganizerProfile,
  validateOrganizerProfile,
} from '@/services'
import { getFallbackImageHandler } from '@/utils/imageFallback'

const organizerImageByCity = {
  'Davao City': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80',
  'Cagayan de Oro': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80',
  'Iloilo City': 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=80',
}

const tabs = [
  { id: 'about', label: 'Overview' },
  { id: 'services', label: 'Services' },
  { id: 'past-events', label: 'Past Events' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'reviews', label: 'Reviews' },
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

function buildFormState(organizer) {
  return {
    name: organizer?.name ?? '',
    city: organizer?.city ?? '',
    priceRangeLabel: organizer?.priceRangeLabel ?? '',
    bio: organizer?.bio ?? '',
    specialties: (organizer?.specialties ?? []).join('\n'),
    services: (organizer?.services ?? []).join('\n'),
    coverageAreas: (organizer?.coverageAreas ?? []).join('\n'),
    avatarUrl: organizer?.avatarUrl ?? '',
    yearsActive: String(organizer?.yearsActive ?? 0),
    eventsHandled: String(organizer?.eventsHandled ?? 0),
  }
}

function buildPayloadFromForm(form) {
  return {
    name: form.name,
    city: form.city,
    priceRangeLabel: form.priceRangeLabel,
    bio: form.bio,
    specialties: splitListInput(form.specialties),
    services: splitListInput(form.services),
    coverageAreas: splitListInput(form.coverageAreas),
    avatarUrl: form.avatarUrl,
    yearsActive: Number(form.yearsActive),
    eventsHandled: Number(form.eventsHandled),
  }
}

function hasChanges(form, baseline) {
  return JSON.stringify(form) !== JSON.stringify(baseline)
}

export default function OrganizerDetailPage() {
  const { id } = useParams()
  const { user, profile: viewerProfile } = useAuth()
  const [organizer, setOrganizer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savedMap, setSavedMap] = useState(() => getSavedItems())
  const [activeTab, setActiveTab] = useState('about')
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState(() => buildFormState(null))
  const [saveError, setSaveError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [showValidation, setShowValidation] = useState(false)

  useEffect(() => {
    let active = true

    async function loadDetail() {
      setLoading(true)
      setError('')

      try {
        const item = await getOrganizerProfileById(id)
        if (active) setOrganizer(item)
      } catch {
        if (active) setError('Unable to load organizer details right now.')
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
    setActiveTab('about')
    setIsEditing(false)
    setShowValidation(false)
    setSaveError('')
    setSaveMessage('')
    setUploadError('')
  }, [id])

  const baselineForm = useMemo(() => buildFormState(organizer), [organizer])

  useEffect(() => {
    setForm(baselineForm)
  }, [baselineForm])

  const isDirty = useMemo(() => hasChanges(form, baselineForm), [form, baselineForm])

  useBeforeUnload(
    (event) => {
      if (!isEditing || !isDirty) return
      event.preventDefault()
      event.returnValue = ''
    },
    { capture: true },
  )

  const isSaved = useMemo(() => (savedMap.organizers ?? []).includes(id), [savedMap.organizers, id])
  const fallbackImage = organizer ? organizerImageByCity[organizer.city] || organizerImageByCity['Davao City'] : organizerImageByCity['Davao City']

  const canEdit = useMemo(
    () => canEditProfile({
      viewerUid: user?.uid,
      viewerRole: viewerProfile?.role,
      profileType: 'organizer',
      ownerUid: organizer?.ownerUid ?? null,
      profileId: organizer?.id ?? id,
      viewerMarketplaceProfile: viewerProfile?.marketplaceProfile ?? null,
    }),
    [id, organizer?.id, organizer?.ownerUid, user?.uid, viewerProfile?.marketplaceProfile, viewerProfile?.role],
  )

  const validation = useMemo(() => {
    if (!organizer) {
      return { isValid: false, errors: [], fieldErrors: {} }
    }

    const payload = buildPayloadFromForm(form)
    return validateOrganizerProfile({
      ...organizer,
      ...payload,
    })
  }, [form, organizer])

  const reviewStats = useMemo(() => {
    const reviewList = organizer?.reviewList ?? []
    const total = reviewList.length

    return [5, 4, 3, 2, 1].map((stars) => {
      const count = reviewList.filter((item) => item.rating === stars).length
      const percent = total > 0 ? Math.round((count / total) * 100) : 0
      return { stars, count, percent }
    })
  }, [organizer])

  function onToggleSaved() {
    const updated = toggleSavedItem('organizers', id)
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

  async function onUploadAvatar(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !user?.uid) return

    setUploadError('')
    setSaveMessage('')
    setIsUploadingAvatar(true)

    try {
      const uploadedUrl = await uploadMarketplaceProfileImage({
        profileType: 'organizer',
        profileId: id,
        actorUid: user.uid,
        file,
        purpose: 'avatar',
      })
      setForm((current) => ({ ...current, avatarUrl: uploadedUrl }))
      setSaveMessage('Avatar uploaded. Save profile to publish this change.')
    } catch (uploadFailure) {
      setUploadError(uploadFailure?.message ?? 'Unable to upload avatar right now.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  async function onSaveProfile(event) {
    event.preventDefault()
    setShowValidation(true)
    setSaveError('')
    setSaveMessage('')

    if (!organizer || !user?.uid) {
      setSaveError('Please sign in as the profile owner before saving.')
      return
    }

    if (!validation.isValid) {
      return
    }

    const payload = buildPayloadFromForm(form)
    const previous = organizer
    const optimistic = {
      ...organizer,
      ...payload,
      updatedAt: new Date().toISOString(),
    }

    setIsSaving(true)
    setOrganizer(optimistic)

    try {
      const updated = await updateOrganizerProfile(id, payload, user.uid)
      setOrganizer(updated)
      setIsEditing(false)
      setShowValidation(false)
      setSaveMessage('Organizer profile updated successfully.')
    } catch (submitError) {
      setOrganizer(previous)
      setSaveError(submitError?.message ?? 'Unable to save organizer profile right now.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PageShell className="space-y-space-6">
      <HeroBanner
        eyebrow="Organizer Profile"
        title={organizer?.name ?? 'Loading organizer...'}
        description={organizer ? `${organizer.city} - ${organizer.specialties.join(', ')}` : 'Fetching organizer profile and track record.'}
        tone="blue"
        actions={(
          <>
            <Link to="/organizers" onClick={onBackClick} className="rounded-full bg-white px-space-4 py-space-2 font-display text-label-md text-info">
              Back to organizers
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

      {loading && <LoadingState label="Loading organizer details..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && !organizer && <EmptyState message="Organizer not found." />}

      {!loading && !error && organizer && (
        <>
          {isEditing && canEdit && (
            <SurfaceCard className="space-y-space-3 border-primary-200">
              <SectionHeader title="Edit Organizer Profile" subtitle="Update your public profile details. Changes are only saved when you tap Save." />
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
                    <span className="font-body text-label-sm text-neutral-700">Organizer Name</span>
                    <input
                      value={form.name}
                      onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                      className="mt-space-1 h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                    />
                    {showValidation && validation.fieldErrors.name && <p className="mt-space-1 text-caption-lg text-red-600">{validation.fieldErrors.name}</p>}
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

                  <label className="block md:col-span-2">
                    <span className="font-body text-label-sm text-neutral-700">Price Label</span>
                    <input
                      value={form.priceRangeLabel}
                      onChange={(event) => setForm((current) => ({ ...current, priceRangeLabel: event.target.value }))}
                      className="mt-space-1 h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                    />
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
                    <span className="font-body text-label-sm text-neutral-700">Specialties (one per line)</span>
                    <textarea
                      value={form.specialties}
                      onChange={(event) => setForm((current) => ({ ...current, specialties: event.target.value }))}
                      rows={3}
                      className="mt-space-1 w-full rounded-md border border-neutral-200 bg-white px-space-3 py-space-2 text-body-sm"
                    />
                    {showValidation && validation.fieldErrors.specialties && <p className="mt-space-1 text-caption-lg text-red-600">{validation.fieldErrors.specialties}</p>}
                  </label>

                  <label className="block md:col-span-2">
                    <span className="font-body text-label-sm text-neutral-700">Services (one per line)</span>
                    <textarea
                      value={form.services}
                      onChange={(event) => setForm((current) => ({ ...current, services: event.target.value }))}
                      rows={3}
                      className="mt-space-1 w-full rounded-md border border-neutral-200 bg-white px-space-3 py-space-2 text-body-sm"
                    />
                    {showValidation && validation.fieldErrors.services && <p className="mt-space-1 text-caption-lg text-red-600">{validation.fieldErrors.services}</p>}
                  </label>

                  <label className="block md:col-span-2">
                    <span className="font-body text-label-sm text-neutral-700">Coverage Areas (one per line)</span>
                    <textarea
                      value={form.coverageAreas}
                      onChange={(event) => setForm((current) => ({ ...current, coverageAreas: event.target.value }))}
                      rows={3}
                      className="mt-space-1 w-full rounded-md border border-neutral-200 bg-white px-space-3 py-space-2 text-body-sm"
                    />
                  </label>

                  <label className="block md:col-span-2">
                    <span className="font-body text-label-sm text-neutral-700">Avatar URL</span>
                    <input
                      value={form.avatarUrl}
                      onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))}
                      className="mt-space-1 h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                    />
                    <div className="mt-space-2 flex flex-wrap items-center gap-space-2">
                      <label className="rounded-full border border-neutral-300 bg-white px-space-3 py-space-1 font-display text-label-sm text-neutral-700">
                        <span>{isUploadingAvatar ? 'Uploading...' : 'Upload Avatar'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingAvatar || isSaving}
                          onChange={onUploadAvatar}
                          className="sr-only"
                        />
                      </label>
                      <span className="font-body text-caption-lg text-neutral-500">Upload from your device, then save profile.</span>
                    </div>
                    {showValidation && validation.fieldErrors.avatarUrl && <p className="mt-space-1 text-caption-lg text-red-600">{validation.fieldErrors.avatarUrl}</p>}
                  </label>

                  <label className="block">
                    <span className="font-body text-label-sm text-neutral-700">Years Active</span>
                    <input
                      type="number"
                      min="0"
                      value={form.yearsActive}
                      onChange={(event) => setForm((current) => ({ ...current, yearsActive: event.target.value }))}
                      className="mt-space-1 h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                    />
                  </label>

                  <label className="block">
                    <span className="font-body text-label-sm text-neutral-700">Events Managed</span>
                    <input
                      type="number"
                      min="0"
                      value={form.eventsHandled}
                      onChange={(event) => setForm((current) => ({ ...current, eventsHandled: event.target.value }))}
                      className="mt-space-1 h-10 w-full rounded-md border border-neutral-200 bg-white px-space-3 text-body-sm"
                    />
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
                    disabled={isSaving || isUploadingAvatar || !isDirty || !validation.isValid}
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
                  disabled={isSaving || isUploadingAvatar || !isDirty || !validation.isValid}
                  className="h-11 flex-1 rounded-full bg-primary-500 font-display text-label-md text-white disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          )}

          <SurfaceCard className="overflow-hidden p-0">
            <img
              src={organizer.avatarUrl || fallbackImage}
              alt={organizer.name}
              onError={getFallbackImageHandler(fallbackImage)}
              className="h-64 w-full object-cover"
            />
            <div className="space-y-space-3 p-space-4">
              <div className="mb-space-1 flex flex-wrap items-center gap-space-1">
                <span className="inline-flex rounded-full bg-primary-50 px-space-2 py-space-1 font-display text-overline uppercase text-primary-600">
                  Organizer
                </span>
                {organizer.isVerified && (
                  <span className="inline-flex rounded-full bg-secondary-50 px-space-2 py-space-1 font-display text-overline uppercase text-secondary-700">
                    Verified
                  </span>
                )}
                {organizer.badge && (
                  <span className="inline-flex rounded-full bg-primary-500 px-space-2 py-space-1 font-display text-overline uppercase text-white">
                    {organizer.badge}
                  </span>
                )}
                <span className="inline-flex rounded-full bg-neutral-100 px-space-2 py-space-1 font-display text-overline uppercase text-neutral-700">
                  {organizer.completeness?.percent ?? 0}% complete
                </span>
              </div>

              <h1 className="font-display text-heading-xl text-neutral-900">{organizer.name}</h1>
              <p className="font-body text-body-md text-neutral-600">{organizer.city}</p>
              <p className="font-body text-body-md text-neutral-600">Specialties: {organizer.specialties.join(', ')}</p>
              <p className="font-body text-body-md text-neutral-600">Rating: {organizer.rating} ({organizer.reviewsCount} reviews)</p>
              <p className="font-display text-display-lg text-info">{organizer.priceRangeLabel}</p>
              <p className="font-body text-body-sm text-neutral-500">Last updated: {formatLastUpdated(organizer.updatedAt)}</p>
              {saveMessage && <p className="font-body text-body-sm text-secondary-700">{saveMessage}</p>}

              <div className="flex flex-wrap gap-space-2 pt-space-1">
                <a
                  href={`mailto:bookings@eventpinas.com?subject=${encodeURIComponent(`Hire ${organizer.name}`)}`}
                  className="rounded-full bg-primary-500 px-space-4 py-space-2 font-display text-label-md text-white"
                >
                  Hire This Organizer
                </a>
                <Link to="/login" className="rounded-full border border-neutral-300 bg-white px-space-4 py-space-2 font-display text-label-md text-neutral-700">
                  Message
                </Link>
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
            <SectionHeader title="Organizer Snapshot" />
            <div className="grid grid-cols-3 gap-space-2">
              <StatChip label="Events Managed" value={organizer.eventsHandled} />
              <StatChip label="Avg Rating" value={organizer.rating} />
              <StatChip label="Years Active" value={organizer.yearsActive} />
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

            {activeTab === 'about' && (
              <div className="space-y-space-3">
                <p className="font-body text-body-sm text-neutral-700">{organizer.bio}</p>
                <div className="grid gap-space-2 sm:grid-cols-2 md:grid-cols-4">
                  <StatChip label="Events Managed" value={organizer.eventsHandled} />
                  <StatChip label="Avg Rating" value={organizer.rating} />
                  <StatChip label="Coverage" value={(organizer.coverageAreas ?? []).length} />
                  <StatChip label="Years Active" value={organizer.yearsActive} />
                </div>
                <div className="flex flex-wrap gap-space-2">
                  {(organizer.specialties ?? []).map((specialty) => (
                    <span key={specialty} className="rounded-full bg-secondary-50 px-space-3 py-space-1 font-body text-caption-lg text-secondary-700">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="space-y-space-3">
                <div className="flex flex-wrap gap-space-2">
                  {(organizer.services ?? []).map((service) => (
                    <span key={service} className="rounded-full bg-primary-50 px-space-3 py-space-1 font-body text-caption-lg text-primary-600">
                      {service}
                    </span>
                  ))}
                </div>
                <p className="font-body text-body-sm text-neutral-700">Coverage: {(organizer.coverageAreas ?? []).join(', ')}</p>
              </div>
            )}

            {activeTab === 'past-events' && (
              <div className="space-y-space-2">
                {(organizer.pastEvents ?? []).map((event) => (
                  <article key={event.id} className="rounded-2xl border border-neutral-200 p-space-3">
                    <div className="flex items-start justify-between gap-space-2">
                      <div>
                        <h3 className="font-display text-heading-md text-neutral-900">{event.title}</h3>
                        <p className="font-body text-caption-lg text-neutral-500">{event.type} - {event.year}</p>
                      </div>
                      <span className="rounded-full bg-neutral-100 px-space-2 py-space-1 font-body text-caption-lg text-neutral-600">
                        {event.guests} guests
                      </span>
                    </div>
                    <p className="mt-space-2 font-body text-body-sm text-neutral-700">Rating: {event.rating}/5</p>
                  </article>
                ))}
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="grid gap-space-3 md:grid-cols-3">
                {(organizer.pricingPackages ?? []).map((pkg) => (
                  <article key={pkg.id} className="rounded-2xl border border-neutral-200 p-space-3">
                    <div className="flex items-center justify-between gap-space-2">
                      <h3 className="font-display text-heading-md text-neutral-900">{pkg.name}</h3>
                      {pkg.badge && (
                        <span className="rounded-full bg-primary-50 px-space-2 py-space-1 font-display text-overline uppercase text-primary-600">
                          {pkg.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-space-1 font-display text-heading-lg text-info">{formatPrice(pkg.pricePhp)}</p>
                    <p className="mt-space-1 font-body text-body-sm text-neutral-600">{pkg.description}</p>
                    <ul className="mt-space-2 space-y-1 font-body text-body-sm text-neutral-600">
                      {(pkg.inclusions ?? []).map((inclusion) => (
                        <li key={inclusion}>- {inclusion}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-space-3">
                <div className="space-y-space-2 rounded-2xl border border-neutral-200 p-space-3">
                  <p className="font-display text-heading-lg text-neutral-900">{organizer.rating} Overall Rating</p>
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
                  {(organizer.reviewList ?? []).map((review) => (
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
          </SurfaceCard>
        </>
      )}
    </PageShell>
  )
}
