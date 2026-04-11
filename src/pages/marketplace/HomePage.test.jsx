import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomePage from './HomePage'

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}

describe('HomePage', () => {
  it('renders the events-style hero heading and supporting copy', () => {
    render(
      <MemoryRouter future={routerFuture}>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /where great events begin/i })).toBeInTheDocument()
    expect(screen.getByText(/manage events, find trusted suppliers, and connect with top organizers/i)).toBeInTheDocument()
  })

  it('keeps the concert hero image and adds the three requested Unsplash hero slides', () => {
    render(
      <MemoryRouter future={routerFuture}>
        <HomePage />
      </MemoryRouter>,
    )

    const expectedSlides = [
      'Concerts & Festivals',
      'Wine Toast Celebrations',
      'Wedding Moments',
      'Lobby Networking',
    ]

    expectedSlides.forEach((label) => {
      expect(screen.getByRole('img', { name: label })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: `View ${label}` })).toBeInTheDocument()
    })

    expect(screen.getAllByRole('button', { name: /^View /i })).toHaveLength(4)
  })

  it('renders the why-use benefits section with four cards and key CTAs', () => {
    render(
      <MemoryRouter future={routerFuture}>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /why use eventpinas/i })).toBeInTheDocument()

    const benefitTitles = [
      /create & launch events in minutes/i,
      /connect with verified suppliers/i,
      /run your event day without chaos/i,
      /turn every event into your next win/i,
    ]

    benefitTitles.forEach((titleMatcher) => {
      expect(screen.getByRole('heading', { name: titleMatcher })).toBeInTheDocument()
    })

    expect(screen.getByRole('link', { name: /^create event$/i })).toHaveAttribute('href', '/register?role=organizer')
    expect(screen.getByRole('link', { name: /create your event/i })).toHaveAttribute('href', '/register?role=organizer')
    expect(screen.getByRole('link', { name: /browse suppliers/i })).toHaveAttribute('href', '/suppliers')
    expect(screen.getByRole('link', { name: /explore events/i })).toHaveAttribute('href', '/events')
  })
})
