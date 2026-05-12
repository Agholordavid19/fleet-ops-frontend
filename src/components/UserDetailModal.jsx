import { useState } from 'react'
import toast from 'react-hot-toast'
import {
    useGetUserByIdQuery,
    useResetUserPasswordMutation,
    useSetUserMediaMutation,
    useRemoveUserMediaMutation,
} from '../apis/fleetApi'
import { uploadToCloudinary } from '../utils/cloudinary.js'
import Modal from './Modal.jsx'
import Badge from './Badge.jsx'
import { FormField, Input, SubmitButton } from './Form'
import { LoadingSpinner, ErrorAlert } from './Feedback'
import { formatDate, getErrorMessage } from '../utils/format.js'

export default function UserDetailModal({ userId, onClose }) {
    const { data: user, isLoading, isError } = useGetUserByIdQuery(userId, { skip: !userId })

    const [resetUserPassword, { isLoading: resetting }] = useResetUserPasswordMutation()
    const [setUserMedia, { isLoading: uploading }] = useSetUserMediaMutation()
    const [removeUserMedia, { isLoading: removing }] = useRemoveUserMediaMutation()

    const [newPassword, setNewPassword] = useState('')
    const [file, setFile] = useState(null)

    const handleResetPassword = async (e) => {
        e.preventDefault()

        try {
            await resetUserPassword({
                id: userId,
                newPassword,
            }).unwrap()

            toast.success('Password reset successfully')
            setNewPassword('')
        } catch (err) {
            toast.error(getErrorMessage(err))
        }
    }

    const handleUploadMedia = async (e) => {
        e.preventDefault()

        if (!file) {
            toast.error('Please select an image')
            return
        }

        try {
            const uploaded = await uploadToCloudinary(file, 'fleetops/users')

            await setUserMedia({
                id: userId,
                media: {
                    publicId: uploaded.publicId,
                    url: uploaded.url,
                },
            }).unwrap()

            toast.success('Profile image updated')
            setFile(null)
        } catch (err) {
            toast.error(getErrorMessage(err))
        }
    }

    const handleRemoveMedia = async () => {
        try {
            await removeUserMedia(userId).unwrap()
            toast.success('Profile image removed')
        } catch (err) {
            toast.error(getErrorMessage(err))
        }
    }

    return (
        <Modal open={!!userId} onClose={onClose} title="User Details" size="lg">
            {isLoading && <LoadingSpinner />}

            {isError && <ErrorAlert message="Failed to load user details." />}

            {user && (
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gray-800 border border-gray-700 overflow-hidden flex items-center justify-center">
                            {user.profileMedia?.url ? (
                                <img
                                    src={user.profileMedia.url}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-[18px] font-semibold text-gray-400">
                                    {user.name?.[0]?.toUpperCase() ?? 'U'}
                                </span>
                            )}
                        </div>

                        <div>
                            <p className="text-[15px] font-semibold text-gray-100">{user.name}</p>
                            <p className="text-[12px] text-gray-500">{user.email}</p>
                            <div className="mt-2">
                                <Badge status={user.role} type="role" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-800/40 rounded-xl px-3 py-3">
                            <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">Status</p>
                            <Badge status={user.active ? 'ACTIVE' : 'INACTIVE'} />
                        </div>

                        <div className="bg-gray-800/40 rounded-xl px-3 py-3">
                            <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">Joined</p>
                            <p className="text-[13px] font-semibold text-gray-200">
                                {formatDate(user.createdAt)}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleResetPassword} className="border-t border-gray-800 pt-5">
                        <p className="text-[11px] font-medium uppercase tracking-widest text-gray-600 mb-3">
                            Reset Password
                        </p>

                        <FormField label="New Password">
                            <Input
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </FormField>

                        <SubmitButton loading={resetting}>Reset Password</SubmitButton>
                    </form>

                    <form onSubmit={handleUploadMedia} className="border-t border-gray-800 pt-5">
                        <p className="text-[11px] font-medium uppercase tracking-widest text-gray-600 mb-3">
                            Profile Image
                        </p>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-[13px] text-gray-200 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-[12px] file:font-semibold file:text-gray-900"
                        />

                        <div className="flex items-center gap-2 mt-4">
                            <SubmitButton loading={uploading}>Upload Image</SubmitButton>

                            {user.profileMedia?.url && (
                                <button
                                    type="button"
                                    onClick={handleRemoveMedia}
                                    disabled={removing}
                                    className="px-4 py-2 rounded-lg text-[12px] font-medium text-red-400 border border-red-500/20 hover:bg-red-500/10 disabled:opacity-50"
                                >
                                    {removing ? 'Removing...' : 'Remove'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}
        </Modal>
    )
}