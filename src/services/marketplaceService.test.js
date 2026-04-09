import {
  getHomeFeed,
  getMarketplaceFilterOptions,
  listEvents,
  listOrganizers,
  listSuppliers,
  searchMarketplace,
} from './marketplaceService'

describe('marketplaceService', () => {
  it('filters events by category', async () => {
    const festivalEvents = await listEvents(
      { category: 'Festival' },
      { simulateLatency: false },
    )

    expect(festivalEvents.length).toBeGreaterThan(0)
    expect(festivalEvents.every((event) => event.category === 'Festival')).toBe(true)
  })

  it('builds a home feed payload', async () => {
    const feed = await getHomeFeed({}, { simulateLatency: false })

    expect(feed.adSlots.length).toBeGreaterThan(0)
    expect(feed.upcomingEvents.length).toBeGreaterThan(0)
    expect(feed.featuredSuppliers.length).toBeGreaterThan(0)
    expect(feed.topOrganizers.length).toBeGreaterThan(0)
  })

  it('returns search buckets with totals', async () => {
    const results = await searchMarketplace('davao', {}, { simulateLatency: false })

    expect(results.query).toBe('davao')
    expect(results.total).toBe(
      results.events.length + results.suppliers.length + results.organizers.length,
    )
    expect(results.total).toBeGreaterThan(0)
  })

  it('returns filter options for cities and categories', () => {
    const options = getMarketplaceFilterOptions()

    expect(options.categories.length).toBeGreaterThan(0)
    expect(options.cities.length).toBeGreaterThan(0)
    expect(options.supplierCategories.length).toBeGreaterThan(0)
  })

  it('sorts suppliers and organizers by rating descending', async () => {
    const topSuppliers = await listSuppliers({ sortBy: 'ratingDesc' }, { simulateLatency: false })
    const topOrganizers = await listOrganizers({ sortBy: 'ratingDesc' }, { simulateLatency: false })

    expect(topSuppliers[0].rating).toBeGreaterThanOrEqual(topSuppliers[1].rating)
    expect(topOrganizers[0].rating).toBeGreaterThanOrEqual(topOrganizers[1].rating)
  })

  it('sorts suppliers by booking volume and puts featured suppliers first', async () => {
    const bookedSuppliers = await listSuppliers({ sortBy: 'bookingsDesc' }, { simulateLatency: false })
    const featuredSuppliers = await listSuppliers({ sortBy: 'featuredFirst' }, { simulateLatency: false })

    expect(bookedSuppliers[0].bookingsCount).toBeGreaterThanOrEqual(bookedSuppliers[1].bookingsCount)
    expect(featuredSuppliers[0].isFeatured).toBe(true)
  })

  it('filters organizers by specialty', async () => {
    const corporateOrganizers = await listOrganizers({ specialty: 'Corporate' }, { simulateLatency: false })

    expect(corporateOrganizers.length).toBeGreaterThan(0)
    expect(corporateOrganizers.every((item) => item.specialties.includes('Corporate'))).toBe(true)
  })
})
