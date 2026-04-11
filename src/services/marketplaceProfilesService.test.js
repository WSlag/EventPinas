import { beforeEach, describe, expect, it } from 'vitest'
import {
  canEditProfile,
  ensureMarketplaceProfile,
  getSupplierProfileById,
  uploadMarketplaceProfileImage,
  updateSupplierProfile,
  validateSupplierProfile,
} from './marketplaceProfilesService'

describe('marketplaceProfilesService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('applies ownership rules correctly', () => {
    expect(canEditProfile({
      viewerUid: 'u1',
      viewerRole: 'supplier',
      profileType: 'supplier',
      ownerUid: 'u1',
      profileId: 'sup-001',
      viewerMarketplaceProfile: null,
    })).toBe(true)

    expect(canEditProfile({
      viewerUid: 'u2',
      viewerRole: 'supplier',
      profileType: 'supplier',
      ownerUid: 'u1',
      profileId: 'sup-001',
      viewerMarketplaceProfile: { type: 'supplier', profileId: 'sup-001' },
    })).toBe(false)

    expect(canEditProfile({
      viewerUid: 'u1',
      viewerRole: 'supplier',
      profileType: 'supplier',
      ownerUid: null,
      profileId: 'sup-001',
      viewerMarketplaceProfile: { type: 'supplier', profileId: 'sup-001' },
    })).toBe(true)
  })

  it('validates supplier profile payload rules', () => {
    const result = validateSupplierProfile({
      id: 'sup-001',
      name: '',
      category: '',
      city: '',
      specializations: [],
      portfolio: ['bad-url'],
      businessInfo: { contact: '', email: 'bad-email', facebook: '' },
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.fieldErrors.name).toBeDefined()
    expect(result.fieldErrors.portfolio).toBeDefined()
  })

  it('persists supplier profile updates in local fallback and enforces owner lock', async () => {
    const updated = await updateSupplierProfile(
      'sup-001',
      { name: 'Blooms Local Owner', specializations: ['Wedding'], businessInfo: { contact: '+63 900 000 0000' } },
      'uid-owner',
      { simulateLatency: false },
    )

    expect(updated.name).toBe('Blooms Local Owner')
    expect(updated.ownerUid).toBe('uid-owner')

    const loaded = await getSupplierProfileById('sup-001', { simulateLatency: false })
    expect(loaded?.name).toBe('Blooms Local Owner')
    expect(loaded?.ownerUid).toBe('uid-owner')

    await expect(
      updateSupplierProfile('sup-001', { name: 'Unauthorized change' }, 'uid-intruder', { simulateLatency: false }),
    ).rejects.toThrow(/not allowed/i)
  })

  it('uploads image files in local fallback mode', async () => {
    const file = new File([new Uint8Array([137, 80, 78, 71])], 'avatar.png', { type: 'image/png' })

    const uploaded = await uploadMarketplaceProfileImage({
      profileType: 'supplier',
      profileId: 'sup-001',
      actorUid: 'uid-owner',
      file,
      purpose: 'main',
    })

    expect(uploaded.startsWith('data:image/png;base64,')).toBe(true)
  })

  it('provisions and enforces ownership for unique marketplace profiles', async () => {
    const provisioned = await ensureMarketplaceProfile({
      profileType: 'supplier',
      profileId: 'sup-user-123',
      ownerUid: 'user-123',
      displayName: 'Unique Supplier Owner',
      email: 'unique-supplier@example.com',
    })

    expect(provisioned.id).toBe('sup-user-123')
    expect(provisioned.ownerUid).toBe('user-123')

    const loaded = await getSupplierProfileById('sup-user-123', { simulateLatency: false })
    expect(loaded?.ownerUid).toBe('user-123')
    expect(loaded?.name).toBe('Unique Supplier Owner')

    await expect(ensureMarketplaceProfile({
      profileType: 'supplier',
      profileId: 'sup-user-123',
      ownerUid: 'user-other',
    })).rejects.toThrow(/already owned/i)
  })
})
