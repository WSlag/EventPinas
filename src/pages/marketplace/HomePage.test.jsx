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
})
