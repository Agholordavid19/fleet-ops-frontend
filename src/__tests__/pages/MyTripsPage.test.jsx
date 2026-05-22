import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import MyTripsPage from '../../pages/staff/MyTripsPage'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { STAFF_AUTH } from '../../test/store'

// ── helpers ──────────────────────────────────────────────────────────────────

function renderPage() {
  return renderWithProviders(<MyTripsPage />, { preloadedState: STAFF_AUTH })
}

// ── notification banners ──────────────────────────────────────────────────────

describe('MyTripsPage — in-app notifications', () => {
  it('shows an approved trip notification banner for APPROVED trips', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByText(/trip approved/i)).toBeInTheDocument()
    )
    // "Mombasa" appears in both the banner span and the table destination cell
    expect(screen.getAllByText(/Mombasa/).length).toBeGreaterThanOrEqual(1)
  })

  it('shows a rejection banner with reason for REJECTED trips', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByText(/trip rejected/i)).toBeInTheDocument()
    )
    // "Vehicle unavailable" appears in both the banner and the table's Reason column
    expect(screen.getAllByText(/Vehicle unavailable/).length).toBeGreaterThanOrEqual(1)
  })

  it('does not show any banners when all trips are PENDING', async () => {
    server.use(
      http.get('http://localhost:8082/api/trip-requests/my', () =>
        HttpResponse.json([
          { id: 't1', destination: 'Lagos', startDate: '2026-06-01', endDate: '2026-06-03', status: 'PENDING', rejectionReason: null },
        ])
      )
    )
    renderPage()
    await waitFor(() => screen.getByText('Lagos'))
    expect(screen.queryByText(/trip approved/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/trip rejected/i)).not.toBeInTheDocument()
  })
})

// ── trip table actions ────────────────────────────────────────────────────────

describe('MyTripsPage — Cancel Trip flow', () => {
  it('shows Cancel button only for PENDING trips', async () => {
    renderPage()
    await waitFor(() => screen.getAllByText('PENDING'))

    const cancelBtns = screen.getAllByRole('button', { name: /cancel/i })
      .filter((b) => b.textContent.trim() === 'Cancel')
    expect(cancelBtns).toHaveLength(1)
  })

  it('opens the confirmation modal when Cancel is clicked', async () => {
    renderPage()
    await waitFor(() => screen.getAllByText('PENDING'))

    const cancelBtn = screen.getAllByRole('button', { name: /cancel/i })
      .find((b) => b.textContent.trim() === 'Cancel')
    fireEvent.click(cancelBtn)

    await waitFor(() =>
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    )
    // "Nairobi" also appears in the table; scope to the dialog to disambiguate
    expect(within(screen.getByRole('dialog')).getByText(/Nairobi/)).toBeInTheDocument()
  })

  it('calls cancelTrip API and shows toast on confirmation', async () => {
    renderPage()
    await waitFor(() => screen.getAllByText('PENDING'))

    fireEvent.click(
      screen.getAllByRole('button', { name: /cancel/i }).find((b) => b.textContent.trim() === 'Cancel')
    )
    await waitFor(() => screen.getByText('Cancel Trip Request'))

    fireEvent.click(screen.getByRole('button', { name: /submit cancellation/i }))

    await waitFor(() =>
      expect(screen.getByText(/cancellation request submitted/i)).toBeInTheDocument()
    )
  })

  it('dismisses the modal when Cancel (modal) is clicked', async () => {
    renderPage()
    await waitFor(() => screen.getAllByText('PENDING'))

    fireEvent.click(
      screen.getAllByRole('button', { name: /cancel/i }).find((b) => b.textContent.trim() === 'Cancel')
    )
    await waitFor(() => screen.getByRole('dialog'))

    // The table row also has a "Cancel" button — scope to the dialog
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' }))
    await waitFor(() =>
      expect(screen.queryByText('Cancel Trip Request')).not.toBeInTheDocument()
    )
  })
})

describe('MyTripsPage — Mark Completed flow', () => {
  it('shows Mark Completed button only for APPROVED trips', async () => {
    renderPage()
    await waitFor(() => screen.getAllByText('APPROVED'))
    const completeBtns = screen.getAllByRole('button', { name: /mark completed/i })
    expect(completeBtns).toHaveLength(1)
  })

  it('opens the confirmation modal when Mark Completed is clicked', async () => {
    renderPage()
    await waitFor(() => screen.getAllByText('APPROVED'))

    fireEvent.click(screen.getByRole('button', { name: /mark completed/i }))
    await waitFor(() =>
      expect(screen.getByText('Mark Trip as Completed')).toBeInTheDocument()
    )
  })

  it('calls completeTrip and redirects to mileage log on confirmation', async () => {
    const { store } = renderPage()
    await waitFor(() => screen.getAllByText('APPROVED'))

    fireEvent.click(screen.getByRole('button', { name: /mark completed/i }))
    await waitFor(() => screen.getByRole('dialog'))

    // After modal opens, scope the confirm click to the dialog to avoid
    // matching the identical table button still visible behind the overlay
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /mark completed/i }))

    await waitFor(() =>
      expect(screen.getByText(/log the final mileage/i)).toBeInTheDocument()
    )
  })
})

describe('MyTripsPage — empty state', () => {
  it('shows empty state when no trips exist', async () => {
    server.use(
      http.get('http://localhost:8082/api/trip-requests/my', () =>
        HttpResponse.json([])
      )
    )
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('No trips yet')).toBeInTheDocument()
    )
  })
})
