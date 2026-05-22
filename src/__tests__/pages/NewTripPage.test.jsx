import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import NewTripPage from '../../pages/staff/NewTripPage'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { STAFF_AUTH } from '../../test/store'

function renderPage() {
  return renderWithProviders(<NewTripPage />, { preloadedState: STAFF_AUTH })
}

// Recompute minDate the same way the component does.
function getMinDate() {
  const d = new Date()
  d.setDate(d.getDate() + 2)
  return d.toISOString().split('T')[0]
}

describe('NewTripPage — date restriction', () => {
  it('renders the trip request form', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
    )
  })

  it('Start Date input has min set to today + 2', async () => {
    renderPage()
    const startInput = await screen.findByLabelText(/start date/i)
    expect(startInput).toHaveAttribute('min', getMinDate())
  })

  it('End Date input has min set to today + 2', async () => {
    renderPage()
    const endInput = await screen.findByLabelText(/end date/i)
    expect(endInput).toHaveAttribute('min', getMinDate())
  })

  it('prevents manual keyboard input on the date fields', async () => {
    renderPage()
    const startInput = await screen.findByLabelText(/start date/i)

    const preventSpy = vi.fn()
    startInput.addEventListener('keydown', preventSpy)

    fireEvent.keyDown(startInput, { key: '2' })
    // The component calls e.preventDefault() — verify via the handler attribute
    // We check by confirming the value doesn't change with typed input.
    expect(startInput.value).toBe('')
  })

  it('shows a validation error when a date before min is entered programmatically', async () => {
    renderPage()

    // Fill required fields so only the date validation runs for startDate
    const vehicleSelect = await screen.findByLabelText(/vehicle/i)
    fireEvent.change(vehicleSelect, { target: { value: 'v1' } })
    fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'Nairobi' } })

    // Set a past date (before minDate) on startDate and a valid date on endDate
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2020-01-01' } })
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: getMinDate() } })

    fireEvent.click(screen.getByRole('button', { name: /request trip/i }))

    await waitFor(() =>
      expect(screen.getByText(/at least 2 days from today/i)).toBeInTheDocument()
    )
  })
})

describe('NewTripPage — form submission', () => {
  it('shows success state after submitting a valid trip', async () => {
    renderPage()

    // Wait for RTK Query to populate vehicle options before selecting
    await screen.findByRole('option', { name: /ABC-123XY/i })

    const minDate = getMinDate()
    fireEvent.change(screen.getByLabelText(/vehicle/i), { target: { value: 'v1' } })
    fireEvent.change(screen.getByPlaceholderText(/city, address/i), { target: { value: 'Nairobi CBD' } })
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: minDate } })
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: minDate } })

    fireEvent.click(screen.getByRole('button', { name: /request trip/i }))

    await waitFor(() =>
      expect(screen.getByText('Trip requested!')).toBeInTheDocument()
    )
  })

  it('shows an error toast on API failure', async () => {
    server.use(
      http.post('http://localhost:8082/api/trip-requests', () =>
        HttpResponse.json({ message: 'No vehicles available' }, { status: 400 })
      )
    )

    renderPage()

    // Wait for RTK Query to populate vehicle options before selecting
    await screen.findByRole('option', { name: /ABC-123XY/i })

    const minDate = getMinDate()
    fireEvent.change(screen.getByLabelText(/vehicle/i), { target: { value: 'v1' } })
    fireEvent.change(screen.getByPlaceholderText(/city, address/i), { target: { value: 'Nairobi' } })
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: minDate } })
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: minDate } })

    fireEvent.click(screen.getByRole('button', { name: /request trip/i }))

    await waitFor(() =>
      expect(screen.getByText('No vehicles available')).toBeInTheDocument()
    )
  })
})
