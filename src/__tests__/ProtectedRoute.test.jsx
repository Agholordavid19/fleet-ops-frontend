import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import { renderWithProviders } from '../test/test-utils.jsx'

vi.mock('../apis/fleetApi.jsx', () => ({
  fleetApi: {
    util: { resetApiState: vi.fn(() => ({ type: 'mock/reset' })) },
  },
}))

const Protected = () => <div>Protected Content</div>

const noAuth = { auth: { token: null, role: null, name: null, email: null } }
const asAdmin = { auth: { token: 'tok', role: 'ADMIN', name: 'Admin', email: 'a@test.com' } }
const asStaff = { auth: { token: 'tok', role: 'FIELD_STAFF', name: 'Staff', email: 's@test.com' } }

describe('ProtectedRoute', () => {
  it('redirects to /login when not authenticated', () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<ProtectedRoute><Protected /></ProtectedRoute>} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>,
      { preloadedState: noAuth }
    )
    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('redirects to /unauthorized when role is not in allowedRoles', () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Protected />
            </ProtectedRoute>
          }
        />
        <Route path="/unauthorized" element={<div>Unauthorized</div>} />
      </Routes>,
      { preloadedState: asStaff }
    )
    expect(screen.getByText('Unauthorized')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders children when authenticated with an allowed role', () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Protected />
            </ProtectedRoute>
          }
        />
      </Routes>,
      { preloadedState: asAdmin }
    )
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('renders children when authenticated and no role restriction is set', () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Protected />
            </ProtectedRoute>
          }
        />
      </Routes>,
      { preloadedState: asStaff }
    )
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})