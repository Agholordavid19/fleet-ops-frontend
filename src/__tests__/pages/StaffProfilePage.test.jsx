import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import StaffProfilePage from '../../pages/staff/StaffProfilePage'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { STAFF_AUTH } from '../../test/store'

const CLOUDINARY_URL = 'https://res.cloudinary.com/djizuzpk6/image/upload/v1/photo.jpg'
const PUBLIC_ID = 'mpfleet_uploads/photo'

function renderPage(extraAuth = {}) {
  return renderWithProviders(<StaffProfilePage />, {
    preloadedState: {
      ...STAFF_AUTH,
      auth: { ...STAFF_AUTH.auth, ...extraAuth },
    },
  })
}

// Wait for the profile API response — email appears only in the profile card, not sidebar/topbar.
async function waitForProfileLoad() {
  await waitFor(() => expect(screen.getByText('alice@fleet.com')).toBeInTheDocument())
}

describe('StaffProfilePage — rendering', () => {
  it('shows the user\'s name and email once the profile loads', async () => {
    renderPage()
    await waitForProfileLoad()
    // name appears in sidebar + profile card — use getAllByText
    expect(screen.getAllByText('Alice Staff').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('alice@fleet.com')).toBeInTheDocument()
    // 'Field Staff' appears exactly once in the sidebar
    expect(screen.getByText('Field Staff')).toBeInTheDocument()
  })

  it('shows the initial avatar letter when no profile picture exists', async () => {
    renderPage()
    await waitForProfileLoad()
    // avatar letter 'A' is shown in sidebar and profile card when no picture exists
    expect(screen.getAllByText('A').length).toBeGreaterThanOrEqual(1)
  })

  it('renders a profile picture img when profilePictureUrl is set in store', async () => {
    renderPage({ profilePictureUrl: CLOUDINARY_URL })
    await waitFor(() => {
      const imgs = screen.getAllByRole('img')
      expect(imgs.some((img) => img.src === CLOUDINARY_URL)).toBe(true)
    })
  })
})

describe('StaffProfilePage — profile picture upload', () => {
  beforeEach(() => vi.unstubAllGlobals())

  it('toggles the picture upload form when the camera button is clicked', async () => {
    renderPage()
    await waitForProfileLoad()

    expect(screen.queryByText('Update Profile Picture')).not.toBeInTheDocument()
    fireEvent.click(screen.getByTitle('Change photo'))
    expect(screen.getByText('Update Profile Picture')).toBeInTheDocument()

    fireEvent.click(screen.getByTitle('Change photo'))
    expect(screen.queryByText('Update Profile Picture')).not.toBeInTheDocument()
  })

  it('the "Save Photo" button is disabled until a file is uploaded to Cloudinary', async () => {
    renderPage()
    await waitForProfileLoad()
    fireEvent.click(screen.getByTitle('Change photo'))

    const saveBtn = screen.getByRole('button', { name: /save photo/i })
    expect(saveBtn).toBeDisabled()
  })

  it('enables "Save Photo" and saves after Cloudinary upload succeeds', async () => {
    // Intercept only Cloudinary; fall through to MSW-patched fetch for API calls
    const mswFetch = globalThis.fetch
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url, opts) => {
      if (String(url).includes('cloudinary.com')) {
        return new Response(
          JSON.stringify({ secure_url: CLOUDINARY_URL, public_id: PUBLIC_ID }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        )
      }
      return mswFetch(url, opts)
    }))

    renderPage()
    await waitForProfileLoad()
    fireEvent.click(screen.getByTitle('Change photo'))

    const fileInput = document.querySelector('input[type="file"]')
    const file = new File(['(img)'], 'avatar.jpg', { type: 'image/jpeg' })
    const user = (await import('@testing-library/user-event')).default.setup()
    await user.upload(fileInput, file)

    await waitFor(() => {
      const saveBtn = screen.getByRole('button', { name: /save photo/i })
      expect(saveBtn).not.toBeDisabled()
    })

    fireEvent.click(screen.getByRole('button', { name: /save photo/i }))
    await waitFor(() =>
      expect(screen.getByText('Profile picture updated')).toBeInTheDocument()
    )
  })

  it('shows a toast error when the backend save fails', async () => {
    const mswFetch = globalThis.fetch
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url, opts) => {
      if (String(url).includes('cloudinary.com')) {
        return new Response(
          JSON.stringify({ secure_url: CLOUDINARY_URL, public_id: PUBLIC_ID }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        )
      }
      return mswFetch(url, opts)
    }))

    server.use(
      http.patch('http://localhost:8082/api/users/me/media', () =>
        HttpResponse.json({ message: 'Storage quota exceeded' }, { status: 500 })
      )
    )

    renderPage()
    await waitForProfileLoad()
    fireEvent.click(screen.getByTitle('Change photo'))

    const fileInput = document.querySelector('input[type="file"]')
    const file = new File(['(img)'], 'avatar.jpg', { type: 'image/jpeg' })
    const user = (await import('@testing-library/user-event')).default.setup()
    await user.upload(fileInput, file)

    await waitFor(() => screen.getByRole('button', { name: /save photo/i }))
    fireEvent.click(screen.getByRole('button', { name: /save photo/i }))

    await waitFor(() =>
      expect(screen.getByText('Failed to update profile picture')).toBeInTheDocument()
    )
  })

  it('shows Remove current button only when a profile picture already exists', async () => {
    // Override the profile API to return a profile with an existing picture URL so
    // that avatarUrl (read from profile?.profileImageUrl) is truthy in the component.
    server.use(
      http.get('http://localhost:8082/api/users/me', () =>
        HttpResponse.json({
          id: 'user-1', name: 'Alice Staff', email: 'alice@fleet.com',
          role: 'FIELD_STAFF', createdAt: '2025-01-01T00:00:00Z',
          profileImageUrl: CLOUDINARY_URL, profileImageId: 'mpfleet/photo',
        })
      )
    )
    renderPage({ profilePictureUrl: CLOUDINARY_URL })
    await waitForProfileLoad()
    fireEvent.click(screen.getByTitle('Change photo'))

    expect(screen.getByRole('button', { name: /remove current/i })).toBeInTheDocument()
  })

  it('does not show Remove button when no picture exists', async () => {
    renderPage()
    await waitForProfileLoad()
    fireEvent.click(screen.getByTitle('Change photo'))

    expect(screen.queryByRole('button', { name: /remove current/i })).not.toBeInTheDocument()
  })
})

describe('StaffProfilePage — change password', () => {
  it('renders the change password section', async () => {
    renderPage()
    // 'Change Password' appears in both the section heading (h3) and the submit button.
    // Scope to the heading to avoid the ambiguity.
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /change password/i })).toBeInTheDocument()
    )
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument()
  })
})
