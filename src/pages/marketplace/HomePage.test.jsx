import { render, screen } from '@testing-library/react'
import HomePage from './HomePage'

describe('HomePage', () => {
  it('renders the page heading and discovery copy', () => {
    render(<HomePage />)

    expect(screen.getByRole('heading', { name: /home/i })).toBeInTheDocument()
    expect(screen.getByText(/discover events and trusted suppliers near you/i)).toBeInTheDocument()
  })
})
