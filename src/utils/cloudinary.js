const CLOUD_NAME   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

/**
 * Uploads a single file to Cloudinary asynchronously.
 * Returns { publicId, url } on success.
 */
export async function uploadToCloudinary(file, folder = 'mpfleets/users') {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', UPLOAD_PRESET)
    fd.append('folder', folder)

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: fd }
    )

    if (!res.ok) throw new Error('Cloudinary upload failed')

    const data = await res.json()
    return {
        publicId: data.public_id,
        url:      data.secure_url,
    }
}

/**
 * Uploads multiple files concurrently.
 * Returns an array of { publicId, url }.
 */
export async function uploadManyToCloudinary(files, folder = 'mpfleets/vehicles') {
    return Promise.all([...files].map((f) => uploadToCloudinary(f, folder)))
}
