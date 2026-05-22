import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBadge from '../../components/ui/StatusBadge'

describe('StatusBadge', () => {
  it('renders the status label with underscores replaced by spaces', () => {
    render(<StatusBadge status="CANCEL_PENDING" />)
    expect(screen.getByText('CANCEL PENDING')).toBeInTheDocument()
  })

  it('renders em-dash when status is undefined', () => {
    render(<StatusBadge />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('applies green classes for APPROVED', () => {
    const { container } = render(<StatusBadge status="APPROVED" />)
    const badge = container.firstChild
    expect(badge.className).toContain('green')
  })

  it('applies red classes for REJECTED', () => {
    const { container } = render(<StatusBadge status="REJECTED" />)
    expect(container.firstChild.className).toContain('red')
  })

  it('applies amber classes for PENDING', () => {
    const { container } = render(<StatusBadge status="PENDING" />)
    expect(container.firstChild.className).toContain('amber')
  })

  it('applies fallback stone classes for unknown status', () => {
    const { container } = render(<StatusBadge status="SOME_UNKNOWN_STATUS" />)
    expect(container.firstChild.className).toContain('stone')
  })

  it('merges extra className', () => {
    const { container } = render(<StatusBadge status="APPROVED" className="extra-class" />)
    expect(container.firstChild.className).toContain('extra-class')
  })
})
