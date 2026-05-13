import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import {
    useGetMyProfileQuery,
    useUpdateMyProfileMutation,
    useSetMyProfileMediaMutation,
    useRemoveMyProfileMediaMutation,
    useChangePasswordMutation,
} from '../apis/fleetApi.jsx'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../store/authSlice'
import { useAuth } from '../utils/useAuth.jsx'
import { uploadToCloudinary } from '../utils/cloudinary.js'
import PageHeader from "../components/Pageheader";
import { FormField, Input, SubmitButton } from '../components/Form'
import { LoadingSpinner, ErrorAlert } from '../components/Feedback'

export default function ProfileScreen() {
    const dispatch = useDispatch()
    const { token, email } = useAuth()
    const { data: profile, isLoading, isError } = useGetMyProfileQuery()

    const [updateProfile,      { isLoading: saving }]    = useUpdateMyProfileMutation()
    const [setProfileMedia,    { isLoading: savingImg }]  = useSetMyProfileMediaMutation()
    const [removeProfileMedia, { isLoading: removing }]   = useRemoveMyProfileMediaMutation()
    const [changePassword,     { isLoading: pwSaving }]   = useChangePasswordMutation() // ✅ RTK Query — no more raw fetch

    const [name,         setName]         = useState('')
    const [imgUploading, setImgUploading] = useState(false)
    const [preview,      setPreview]      = useState(null)
    const fileRef = useRef()

    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' })

    /* ── Handlers ── */

    const handleNameSubmit = async (e) => {
        e.preventDefault()
        if (!name.trim()) return
        try {
            const updated = await updateProfile({ name: name.trim() }).unwrap()
            dispatch(setCredentials({ token, email, name: updated.name }))
            toast.success('Name updated')
            setName('')
        } catch {
            toast.error('Failed to update name')
        }
    }

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setPreview(URL.createObjectURL(file))
        setImgUploading(true)
        try {
            const { publicId, url } = await uploadToCloudinary(file, 'mpfleets/users')
            await setProfileMedia({ publicId, url }).unwrap()
            toast.success('Profile picture updated')
        } catch {
            toast.error('Image upload failed')
            setPreview(null)
        } finally {
            setImgUploading(false)
        }
    }

    const handleRemoveImage = async () => {
        try {
            await removeProfileMedia().unwrap()
            setPreview(null)
            toast.success('Profile picture removed')
        } catch {
            toast.error('Failed to remove picture')
        }
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        // ✅ Basic client-side validation
        if (!pwForm.currentPassword || !pwForm.newPassword) {
            toast.error('Please fill in both password fields')
            return
        }
        if (pwForm.newPassword.length < 8) {
            toast.error('New password must be at least 8 characters')
            return
        }
        try {
            await changePassword(pwForm).unwrap() // ✅ Uses RTK Query — auth header injected automatically
            toast.success('Password changed')
            setPwForm({ currentPassword: '', newPassword: '' })
        } catch (err) {
            // ✅ Surface backend validation errors if present
            const message = err?.data?.message ?? 'Failed to change password — check your current password'
            toast.error(message)
        }
    }

    if (isLoading) return <LoadingSpinner />
    if (isError)   return <ErrorAlert message="Failed to load profile." />

    const avatarUrl = preview ?? profile?.profileImageUrl
    const initials  = profile?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? 'U'

    return (
        <>
            <PageHeader title="My Profile" subtitle="Update your details and profile picture" />

            <div className="max-w-lg space-y-6">

                {/* ── Avatar ── */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <p className="text-[11px] font-medium uppercase tracking-widest text-gray-600 mb-4">Profile Picture</p>
                    <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 shrink-0">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="Profile"
                                    className="w-16 h-16 rounded-full object-cover border border-gray-700"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                                    <span className="text-[18px] font-semibold text-gray-300">{initials}</span>
                                </div>
                            )}
                            {(imgUploading || savingImg) && (
                                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                                    <span className="text-[10px] text-white">Uploading...</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => fileRef.current?.click()}
                                disabled={imgUploading || savingImg}
                                className="text-[12px] bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-lg transition-colors duration-150 disabled:opacity-40"
                            >
                                {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                            </button>
                            {avatarUrl && (
                                <button
                                    onClick={handleRemoveImage}
                                    disabled={removing}
                                    className="rounded-md bg-red-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-red-700 transition-colors duration-150 disabled:opacity-40"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </div>
                    <p className="text-[11px] text-gray-600 mt-3">JPG, PNG or WebP. Max 5MB. Uploads instantly in the background.</p>
                </div>

                {/* ── Name ── */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <p className="text-[11px] font-medium uppercase tracking-widest text-gray-600 mb-4">Display Name</p>
                    <p className="text-[12px] text-gray-500 mb-4">
                        Current: <span className="text-gray-300">{profile?.name}</span>
                    </p>
                    <form onSubmit={handleNameSubmit}>
                        <FormField label="New Name">
                            <Input
                                name="name"
                                placeholder="Enter new name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </FormField>
                        <SubmitButton loading={saving}>Save Name</SubmitButton>
                    </form>
                </div>

                {/* ── Account Info (read-only) ── */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <p className="text-[11px] font-medium uppercase tracking-widest text-gray-600 mb-4">Account Info</p>
                    <div className="space-y-2 text-[13px]">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Email</span>
                            <span className="text-gray-300">{profile?.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Role</span>
                            <span className="text-gray-300">{profile?.role?.replace(/_/g, ' ')}</span>
                        </div>
                    </div>
                </div>

                {/* ── Change Password ── */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <p className="text-[11px] font-medium uppercase tracking-widest text-gray-600 mb-4">Change Password</p>
                    <form onSubmit={handlePasswordSubmit}>
                        <FormField label="Current Password">
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={pwForm.currentPassword}
                                onChange={(e) => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                                required
                            />
                        </FormField>
                        <FormField label="New Password">
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={pwForm.newPassword}
                                onChange={(e) => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                                required
                            />
                        </FormField>
                        <SubmitButton loading={pwSaving}>Change Password</SubmitButton>
                    </form>
                </div>

            </div>
        </>
    )
}
