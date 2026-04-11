import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Footer from './Footer'

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}

describe('Footer', () => {
  it('routes create-an-event link to organizer registration', () => {
    render(
      <MemoryRouter future={routerFuture}>
        <Footer />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /create an event/i })).toHaveAttribute('href', '/register?role=organizer')
  })
})
