import { describe, it, expect } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import RegisterPage from '../../pages/auth/RegisterPage'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'

function renderPage() {
  return renderWithProviders(<RegisterPage />)
}

describe('RegisterPage', () => {
  it('renders all required form fields', () => {
    renderPage()
    expect(screen.getByPlaceholderText('Acme Logistics')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('admin@company.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit registration' })).toBeInTheDocument()
  })

  it('shows validation errors when required fields are empty', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Submit registration' }))
    await waitFor(() => {
      const errors = screen.getAllByText('Required')
      expect(errors.length).toBeGreaterThanOrEqual(4)
    })
  })

  it('shows password length error for short passwords', async () => {
    renderPage()
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('••••••••'), 'short')
    fireEvent.click(screen.getByRole('button', { name: 'Submit registration' }))
    await waitFor(() =>
      expect(screen.getByText('Min 8 characters')).toBeInTheDocument()
    )
  })

  it('shows success state after successful registration', async () => {
    renderPage()
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('Acme Logistics'), 'Test Corp')
    await user.type(screen.getByPlaceholderText('ops@company.com'), 'ops@test.com')
    await user.type(screen.getByPlaceholderText('Jane Smith'), 'Jane Doe')
    await user.type(screen.getByPlaceholderText('admin@company.com'), 'admin@test.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123')

    fireEvent.click(screen.getByRole('button', { name: 'Submit registration' }))

    await waitFor(() =>
      expect(screen.getByText('Registration submitted')).toBeInTheDocument()
    )
    expect(screen.getByText(/pending approval/i)).toBeInTheDocument()
  })

  it('shows server error message on API failure', async () => {
    server.use(
      http.post('http://localhost:8082/api/public/companies/register', () =>
        HttpResponse.json({ message: 'Email already exists' }, { status: 409 })
      )
    )

    renderPage()
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('Acme Logistics'), 'Test Corp')
    await user.type(screen.getByPlaceholderText('ops@company.com'), 'ops@test.com')
    await user.type(screen.getByPlaceholderText('Jane Smith'), 'Jane Doe')
    await user.type(screen.getByPlaceholderText('admin@company.com'), 'admin@test.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123')

    fireEvent.click(screen.getByRole('button', { name: 'Submit registration' }))

    await waitFor(() =>
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
    )
  })

  it('shows generic fallback error when server returns no message', async () => {
    server.use(
      http.post('http://localhost:8082/api/public/companies/register', () =>
        HttpResponse.json({}, { status: 500 })
      )
    )
    renderPage()
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('Acme Logistics'), 'Corp')
    await user.type(screen.getByPlaceholderText('ops@company.com'), 'a@b.com')
    await user.type(screen.getByPlaceholderText('Jane Smith'), 'Jane')
    await user.type(screen.getByPlaceholderText('admin@company.com'), 'a@b.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123')
    fireEvent.click(screen.getByRole('button', { name: 'Submit registration' }))

    await waitFor(() =>
      expect(screen.getByText('Registration failed. Please try again.')).toBeInTheDocument()
    )
  })
})
