import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmModal from '../../components/ui/ConfirmModal'

describe('ConfirmModal', () => {
  const defaults = {
    open: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Delete item',
    description: 'Are you sure you want to delete this item?',
    confirmLabel: 'Delete',
    confirmVariant: 'danger',
  }

  it('renders title and description when open', () => {
    render(<ConfirmModal {...defaults} />)
    expect(screen.getByText('Delete item')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument()
  })

  it('does not render when open is false', () => {
    render(<ConfirmModal {...defaults} open={false} />)
    expect(screen.queryByText('Delete item')).not.toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn()
    render(<ConfirmModal {...defaults} onConfirm={onConfirm} />)
    fireEvent.click(screen.getByText('Delete'))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onClose when Cancel button is clicked', () => {
    const onClose = vi.fn()
    render(<ConfirmModal {...defaults} onClose={onClose} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('disables the confirm button and shows "Processing…" while isLoading', () => {
    render(<ConfirmModal {...defaults} isLoading />)
    const btn = screen.getByText('Processing…')
    expect(btn).toBeDisabled()
  })

  it('applies danger variant (red classes) by default', () => {
    render(<ConfirmModal {...defaults} confirmVariant="danger" />)
    const btn = screen.getByText('Delete')
    expect(btn.className).toContain('red')
  })

  it('applies primary variant (stone classes) when specified', () => {
    render(<ConfirmModal {...defaults} confirmVariant="primary" confirmLabel="Proceed" />)
    const btn = screen.getByText('Proceed')
    expect(btn.className).toContain('stone')
  })

  it('renders default confirmLabel "Confirm" when not provided', () => {
    const { confirmLabel, ...rest } = defaults
    render(<ConfirmModal {...rest} />)
    expect(screen.getByText('Confirm')).toBeInTheDocument()
  })
})
