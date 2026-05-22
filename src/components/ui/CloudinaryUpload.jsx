import { useRef, useState } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

/**
 * Single-image Cloudinary uploader.
 *
 * Props:
 *   onUpload(url, publicId) — called after a successful upload
 *   value   — current image URL (shows preview when set)
 *   onRemove()             — called when the user clears the preview
 *   label   — button text when empty (default "Upload image")
 *   avatar  — if true, renders a round avatar-style preview
 *   className
 */
export default function CloudinaryUpload({ onUpload, value, onRemove, label = 'Upload image', avatar = false, className }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('upload_preset', UPLOAD_PRESET)
      fd.append('folder', 'mpfleets/users')
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: fd },
      )
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      onUpload(data.secure_url, data.public_id)
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      {value ? (
        <div className={cn('relative inline-block', avatar ? 'w-14 h-14' : 'w-20 h-20')}>
          <div className={cn('w-full h-full overflow-hidden bg-stone-100', avatar ? 'rounded-full' : 'rounded-lg border border-stone-200')}>
            <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute -top-1 -right-1 w-5 h-5 bg-stone-700 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors shadow-sm"
            >
              <X size={10} />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-stone-300 hover:border-stone-500 bg-stone-50 hover:bg-white text-sm text-stone-500 hover:text-stone-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {uploading
            ? <Loader2 size={14} className="animate-spin text-stone-400" />
            : <Upload size={14} className="text-stone-400" />
          }
          {uploading ? 'Uploading…' : label}
        </button>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}
