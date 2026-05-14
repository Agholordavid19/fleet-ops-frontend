import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingSpinner, ErrorAlert } from '../components/Feedback'

describe('LoadingSpinner', () => {
  it('renders the spinner element', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('contains an animated element', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })
})

describe('ErrorAlert', () => {
  it('displays a provided message', () => {
    render(<ErrorAlert message="Failed to load vehicles." />)
    expect(screen.getByText('Failed to load vehicles.')).toBeInTheDocument()
  })

  it('shows a fallback message when none is provided', () => {
    render(<ErrorAlert />)
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })
})