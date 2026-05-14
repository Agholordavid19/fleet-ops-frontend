import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginScreen from '../auth/Login'
import { renderWithProviders } from '../test/test-utils.jsx'

const mockNavigate = vi.hoisted(() => vi.fn())
const mockLoginFn = vi.hoisted(() => vi.fn())

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial, animate, exit, transition, variants, ...props }) => (
      <div {...props}>{children}</div>
    ),
    button: ({ children, initial, animate, exit, transition, whileTap, variants, ...props }) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}))

vi.mock('../apis/fleetApi', () => ({
  fleetApi: {
    util: { resetApiState: vi.fn(() => ({ type: 'fleetApi/resetApiState' })) },
  },
  useLoginMutation: () => [mockLoginFn, { isLoading: false }],
}))

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(() => ({
    sub: 'admin@test.com',
    name: 'Admin',
    role: 'ROLE_ADMIN',
    exp: 9999999999,
  })),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LoginScreen', () => {
  it('renders the email and password fields', () => {
    renderWithProviders(<LoginScreen />)
    expect(screen.getByPlaceholderText('admin@fleetops.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
  })

  it('renders the submit button', () => {
    renderWithProviders(<LoginScreen />)
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('updates input values as the user types', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginScreen />)

    const emailInput = screen.getByPlaceholderText('admin@fleetops.com')
    const passwordInput = screen.getByPlaceholderText('Password')

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'mypassword')

    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('mypassword')
  })

  it('calls the login mutation with entered credentials on submit', async () => {
    const user = userEvent.setup()
    mockLoginFn.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ token: 'tok', role: 'ADMIN', name: 'Admin', email: 'a@b.com' }),
    })

    renderWithProviders(<LoginScreen />)

    await user.type(screen.getByPlaceholderText('admin@fleetops.com'), 'admin@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'secret')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(mockLoginFn).toHaveBeenCalledWith({
        email: 'admin@example.com',
        password: 'secret',
      })
    })
  })

  it('navigates to the ADMIN home page after a successful login', async () => {
    const user = userEvent.setup()
    mockLoginFn.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ token: 'tok', role: 'ADMIN', name: 'Admin', email: 'a@b.com' }),
    })

    renderWithProviders(<LoginScreen />)

    await user.type(screen.getByPlaceholderText('admin@fleetops.com'), 'admin@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'secret')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/users')
    })
  })

  it('shows an error toast when the login request fails', async () => {
    const toast = (await import('react-hot-toast')).default
    const user = userEvent.setup()
    mockLoginFn.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue({ data: { message: 'Invalid credentials' } }),
    })

    renderWithProviders(<LoginScreen />)

    await user.type(screen.getByPlaceholderText('admin@fleetops.com'), 'bad@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials')
    })
  })
})