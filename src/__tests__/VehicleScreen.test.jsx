import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import VehiclesScreen from '../pages/VehicleScreen'
import { renderWithProviders } from '../test/test-utils.jsx'

const mockGetVehicles = vi.hoisted(() => vi.fn())

vi.mock('../apis/fleetApi', () => ({
  fleetApi: {
    util: { resetApiState: vi.fn(() => ({ type: 'mock/reset' })) },
  },
  useGetVehiclesQuery: mockGetVehicles,
  useCreateVehicleMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useAddVehicleMediaMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
}))

vi.mock('../components/VehicleScreenModal.jsx', () => ({
  default: () => null,
}))

vi.mock('../utils/cloudinary.js', () => ({
  uploadManyToCloudinary: vi.fn().mockResolvedValue([]),
}))

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }) => <>{children}</>,
  motion: {
    div: ({ children, initial, animate, exit, transition, ...props }) => (
      <div {...props}>{children}</div>
    ),
    button: ({ children, initial, animate, exit, transition, whileTap, ...props }) => (
      <button {...props}>{children}</button>
    ),
  },
}))

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

const adminState = { auth: { token: 'tok', role: 'ADMIN', name: 'Admin', email: 'a@test.com' } }

describe('VehiclesScreen — API states', () => {
  it('shows the loading spinner while fetching', () => {
    mockGetVehicles.mockReturnValue({ isLoading: true, isError: false, data: undefined })
    renderWithProviders(<VehiclesScreen />, { preloadedState: adminState })
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('shows an error alert when the request fails', () => {
    mockGetVehicles.mockReturnValue({ isLoading: false, isError: true, data: undefined })
    renderWithProviders(<VehiclesScreen />, { preloadedState: adminState })
    expect(screen.getByText('Failed to load vehicles.')).toBeInTheDocument()
  })

  it('shows the empty-state message when no vehicles exist', () => {
    mockGetVehicles.mockReturnValue({ isLoading: false, isError: false, data: [] })
    renderWithProviders(<VehiclesScreen />, { preloadedState: adminState })
    expect(screen.getByText('No vehicles registered.')).toBeInTheDocument()
  })

  it('renders vehicle rows when data is loaded', () => {
    mockGetVehicles.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        {
          id: 1,
          make: 'Toyota',
          model: 'Hilux',
          plateNumber: 'KJA-245BX',
          status: 'AVAILABLE',
          milestoneInterval: 3000,
          lifecyclePercentage: 25,
          markedForSale: false,
        },
      ],
    })
    renderWithProviders(<VehiclesScreen />, { preloadedState: adminState })
    expect(screen.getByText('Toyota')).toBeInTheDocument()
    expect(screen.getByText('KJA-245BX')).toBeInTheDocument()
  })
})