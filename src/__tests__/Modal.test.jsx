import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Modal, { ConfirmModal } from '../components/Modal'

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }) => <>{children}</>,
  motion: {
    div: ({ children, initial, animate, exit, transition, ...props }) => (
      <div {...props}>{children}</div>
    ),
  },
}))

describe('Modal', () => {
  it('renders nothing when open is false', () => {
    render(<Modal open={false} onClose={vi.fn()} title="Hidden">Content</Modal>)
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('renders title and children when open is true', () => {
    render(<Modal open={true} onClose={vi.fn()} title="My Modal">Inner content</Modal>)
    expect(screen.getByText('My Modal')).toBeInTheDocument()
    expect(screen.getByText('Inner content')).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    render(<Modal open={true} onClose={onClose} title="Test">Content</Modal>)
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn()
    render(<Modal open={true} onClose={onClose} title="Test">Content</Modal>)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not call onClose on Escape when closed', () => {
    const onClose = vi.fn()
    render(<Modal open={false} onClose={onClose} title="Test">Content</Modal>)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })
})

describe('ConfirmModal', () => {
  it('renders the message and action buttons', () => {
    render(
      <ConfirmModal
        open={true}
        message="Are you sure you want to delete this?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByText('Are you sure you want to delete this?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('calls onConfirm when Confirm is clicked', () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmModal open={true} message="Delete?" onConfirm={onConfirm} onCancel={vi.fn()} />
    )
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = vi.fn()
    render(
      <ConfirmModal open={true} message="Delete?" onConfirm={vi.fn()} onCancel={onCancel} />
    )
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})