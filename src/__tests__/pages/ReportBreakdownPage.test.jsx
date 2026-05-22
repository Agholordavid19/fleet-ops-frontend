import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import ReportBreakdownPage from '../../pages/staff/ReportBreakdownPage'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { STAFF_AUTH } from '../../test/store'

function renderPage() {
  return renderWithProviders(<ReportBreakdownPage />, { preloadedState: STAFF_AUTH })
}

describe('ReportBreakdownPage — vehicle selection', () => {
  it('shows vehicles from the worker\'s approved trips', async () => {
    renderPage()
    await waitFor(() => {
      const options = screen.getAllByRole('option')
      const plates = options.map((o) => o.textContent)
      expect(plates.some((p) => p.includes('DEF-456ZA'))).toBe(true)
    })
  })

  it('does not show vehicles that are not on approved trips', async () => {
    renderPage()
    await waitFor(() => screen.getAllByRole('option'))
    const options = screen.getAllByRole('option')
    const plates = options.map((o) => o.textContent)
    // ABC-123XY is on a PENDING trip, not an approved one
    expect(plates.some((p) => p.includes('ABC-123XY'))).toBe(false)
  })

  it('shows the "no vehicles found" hint when no approved trips exist', async () => {
    server.use(
      http.get('http://localhost:8082/api/trip-requests/my/approved', () =>
        HttpResponse.json([])
      )
    )
    renderPage()
    await waitFor(() =>
      expect(
        screen.getByText(/no vehicles found — you must have an approved trip/i)
      ).toBeInTheDocument()
    )
  })

  it('deduplicates vehicles when a vehicle appears on multiple approved trips', async () => {
    server.use(
      http.get('http://localhost:8082/api/trip-requests/my/approved', () =>
        HttpResponse.json([
          { id: 't1', vehicleId: 'v2', plateNumber: 'DEF-456ZA', make: 'Ford', model: 'Ranger' },
          { id: 't2', vehicleId: 'v2', plateNumber: 'DEF-456ZA', make: 'Ford', model: 'Ranger' },
        ])
      )
    )
    renderPage()
    // The vehicle options appear asynchronously from RTK Query. Wait for the plate to show
    // and assert that DEF-456ZA appears exactly once (deduplicated), since trip options show
    // destination text (not plate numbers) so the plate can't appear in the trips select.
    await waitFor(() => {
      const withPlate = screen.getAllByRole('option').filter((o) => o.textContent.includes('DEF-456ZA'))
      expect(withPlate).toHaveLength(1)
    })
  })
})
