import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CloudinaryUpload from '../../components/ui/CloudinaryUpload'

const CLOUD_URL = 'https://res.cloudinary.com/djizuzpk6/image/upload/v1/photo.jpg'
const PUBLIC_ID = 'mpfleet_uploads/photo'

function mockFetchSuccess() {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ secure_url: CLOUD_URL, public_id: PUBLIC_ID }),
  }))
}

function mockFetchFailure() {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
}

describe('CloudinaryUpload', () => {
  beforeEach(() => vi.unstubAllGlobals())

  it('renders the upload button when no value is provided', () => {
    render(<CloudinaryUpload onUpload={vi.fn()} />)
    expect(screen.getByText('Upload image')).toBeInTheDocument()
  })

  it('uses a custom label when provided', () => {
    render(<CloudinaryUpload onUpload={vi.fn()} label="Choose photo" />)
    expect(screen.getByText('Choose photo')).toBeInTheDocument()
  })

  it('shows a preview image when value is set', () => {
    render(<CloudinaryUpload onUpload={vi.fn()} value={CLOUD_URL} onRemove={vi.fn()} />)
    const img = screen.getByRole('img', { name: 'Uploaded' })
    expect(img).toBeInTheDocument()
    expect(img.src).toBe(CLOUD_URL)
  })

  it('shows a remove button when value and onRemove are provided', () => {
    const onRemove = vi.fn()
    render(<CloudinaryUpload onUpload={vi.fn()} value={CLOUD_URL} onRemove={onRemove} />)
    const removeBtn = screen.getByRole('button')
    fireEvent.click(removeBtn)
    expect(onRemove).toHaveBeenCalledOnce()
  })

  it('calls onUpload with secure_url and public_id after successful upload', async () => {
    mockFetchSuccess()
    const onUpload = vi.fn()
    render(<CloudinaryUpload onUpload={onUpload} />)

    const input = document.querySelector('input[type="file"]')
    const file = new File(['(img)'], 'photo.jpg', { type: 'image/jpeg' })
    await userEvent.upload(input, file)

    await waitFor(() => expect(onUpload).toHaveBeenCalledWith(CLOUD_URL, PUBLIC_ID))
  })

  it('shows an error message when the upload fails', async () => {
    mockFetchFailure()
    render(<CloudinaryUpload onUpload={vi.fn()} />)

    const input = document.querySelector('input[type="file"]')
    const file = new File(['(img)'], 'photo.jpg', { type: 'image/jpeg' })
    await userEvent.upload(input, file)

    await waitFor(() =>
      expect(screen.getByText('Upload failed. Please try again.')).toBeInTheDocument()
    )
  })

  it('shows "Uploading…" label while the request is in flight', async () => {
    let resolve
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise((r) => { resolve = r })))

    render(<CloudinaryUpload onUpload={vi.fn()} />)
    const input = document.querySelector('input[type="file"]')
    const file = new File(['(img)'], 'photo.jpg', { type: 'image/jpeg' })
    await userEvent.upload(input, file)

    expect(screen.getByText('Uploading…')).toBeInTheDocument()

    resolve({ ok: true, json: async () => ({ secure_url: CLOUD_URL, public_id: PUBLIC_ID }) })
  })

  it('renders a rounded container when avatar prop is true', () => {
    render(<CloudinaryUpload onUpload={vi.fn()} value={CLOUD_URL} onRemove={vi.fn()} avatar />)
    const img = screen.getByRole('img')
    expect(img.parentElement.className).toContain('rounded-full')
  })

  it('does not render remove button when onRemove is not provided', () => {
    render(<CloudinaryUpload onUpload={vi.fn()} value={CLOUD_URL} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
