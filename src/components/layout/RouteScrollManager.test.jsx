import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import RouteScrollManager from './RouteScrollManager'

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}

let scrollToMock
let requestAnimationFrameMock
let cancelAnimationFrameMock
let scrollIntoViewSpy

function setScrollPosition(y, x = 0) {
  Object.defineProperty(window, 'scrollX', {
    configurable: true,
    writable: true,
    value: x,
  })
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    writable: true,
    value: y,
  })
}

function MarketplaceCardsPage() {
  return (
    <div>
      <h1>Marketplace cards</h1>
      <Link to="/events/evt-001">Open event card</Link>
      <Link to="/suppliers/sup-001">Open supplier card</Link>
      <Link to="/organizers/org-001">Open organizer card</Link>
    </div>
  )
}

function HashSourcePage() {
  return (
    <div>
      <h1>Hash source</h1>
      <Link to="/events/evt-001#snapshot">Open event snapshot hash</Link>
    </div>
  )
}

function DetailPage({ title }) {
  const navigate = useNavigate()

  return (
    <div>
      <h1>{title}</h1>
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>
      <section id="snapshot">Event Snapshot</section>
    </div>
  )
}

function renderWithRouter(initialEntries = ['/']) {
  return render(
    <MemoryRouter future={routerFuture} initialEntries={initialEntries}>
      <RouteScrollManager />
      <Routes>
        <Route path="/" element={<MarketplaceCardsPage />} />
        <Route path="/hash-source" element={<HashSourcePage />} />
        <Route path="/events/:id" element={<DetailPage title="Event detail" />} />
        <Route path="/suppliers/:id" element={<DetailPage title="Supplier detail" />} />
        <Route path="/organizers/:id" element={<DetailPage title="Organizer detail" />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  setScrollPosition(0, 0)

  scrollToMock = vi.fn((x = 0, y = 0) => {
    setScrollPosition(y, x)
  })
  requestAnimationFrameMock = vi.fn((callback) => {
    callback(0)
    return 1
  })
  cancelAnimationFrameMock = vi.fn()

  Object.defineProperty(window, 'scrollTo', {
    configurable: true,
    writable: true,
    value: scrollToMock,
  })
  Object.defineProperty(window, 'requestAnimationFrame', {
    configurable: true,
    writable: true,
    value: requestAnimationFrameMock,
  })
  Object.defineProperty(window, 'cancelAnimationFrame', {
    configurable: true,
    writable: true,
    value: cancelAnimationFrameMock,
  })

  if (!window.HTMLElement.prototype.scrollIntoView) {
    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      writable: true,
      value: () => {},
    })
  }

  scrollIntoViewSpy = vi.spyOn(window.HTMLElement.prototype, 'scrollIntoView').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('RouteScrollManager', () => {
  it.each([
    ['Open event card', /event detail/i],
    ['Open supplier card', /supplier detail/i],
    ['Open organizer card', /organizer detail/i],
  ])('keeps mobile "%s" navigation landing at the top', async (linkName, headingMatcher) => {
    const user = userEvent.setup()

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 390,
    })

    renderWithRouter(['/'])
    scrollToMock.mockClear()

    setScrollPosition(860, 0)
    await user.click(screen.getByRole('link', { name: linkName }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: headingMatcher })).toBeInTheDocument()
    })

    expect(scrollToMock).toHaveBeenLastCalledWith(0, 0)
    expect(window.scrollY).toBe(0)
  })

  it('restores previous scroll position on browser back (POP)', async () => {
    const user = userEvent.setup()

    renderWithRouter(['/'])
    scrollToMock.mockClear()

    setScrollPosition(720, 0)
    await user.click(screen.getByRole('link', { name: 'Open event card' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /event detail/i })).toBeInTheDocument()
    })

    setScrollPosition(42, 0)
    scrollToMock.mockClear()

    await user.click(screen.getByRole('button', { name: /back/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /marketplace cards/i })).toBeInTheDocument()
    })

    expect(scrollToMock).toHaveBeenLastCalledWith(0, 720)
    expect(window.scrollY).toBe(720)
  })

  it('prioritizes hash target scrolling over top reset', async () => {
    const user = userEvent.setup()

    renderWithRouter(['/hash-source'])
    scrollToMock.mockClear()
    scrollIntoViewSpy.mockClear()

    await user.click(screen.getByRole('link', { name: /open event snapshot hash/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /event detail/i })).toBeInTheDocument()
    })

    expect(scrollIntoViewSpy).toHaveBeenCalledTimes(1)
    expect(scrollToMock).not.toHaveBeenCalled()
  })
})
