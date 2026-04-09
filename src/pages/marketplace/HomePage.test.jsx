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

    expect(screen.getByRole('heading', { name: /great events start here/i })).toBeInTheDocument()
    expect(screen.getByText(/empowering event creators through every stage of the journey/i)).toBeInTheDocument()
  })

  it('renders the why-use benefits section with four cards and key CTAs', () => {
    render(
      <MemoryRouter future={routerFuture}>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /why use eventpinas/i })).toBeInTheDocument()

    const benefitTitles = [
      /plan events in one workspace/i,
      /book trusted suppliers faster/i,
      /run event day with control/i,
      /track performance and grow/i,
    ]

    benefitTitles.forEach((titleMatcher) => {
      expect(screen.getByRole('heading', { name: titleMatcher })).toBeInTheDocument()
    })

    expect(screen.getByRole('link', { name: /browse suppliers/i })).toHaveAttribute('href', '/suppliers')
    expect(screen.getByRole('link', { name: /explore events/i })).toHaveAttribute('href', '/events')
  })
})
