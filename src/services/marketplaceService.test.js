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
    const topSuppliers = await listSuppliers({}, { simulateLatency: false })
    const topOrganizers = await listOrganizers({}, { simulateLatency: false })

    expect(topSuppliers[0].rating).toBeGreaterThanOrEqual(topSuppliers[1].rating)
    expect(topOrganizers[0].rating).toBeGreaterThanOrEqual(topOrganizers[1].rating)
  })
})
