import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { Lock, Camera, Trash2 } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import SkeletonCard from '../../components/ui/SkeletonCard'
import CloudinaryUpload from '../../components/ui/CloudinaryUpload'
import { useGetMyProfileQuery, useUpdateMyProfileMutation, useUploadMyMediaMutation, useDeleteMyMediaMutation } from '../../features/users/usersApi'
import { useChangePasswordMutation } from '../../features/auth/authApi'
import { updateProfilePicture } from '../../features/auth/authSlice'
import { useToast } from '../../hooks/useToast'
import { formatDate } from '../../utils/formatters'
import { getRoleLabel } from '../../utils/roleHelpers'
import { StarDisplay } from '../../components/ui/StarRating'

export default function CrewProfilePage() {
  const dispatch = useDispatch()
  const toast = useToast()
  const { data: profile, isLoading } = useGetMyProfileQuery()
  const [updateProfile, { isLoading: updating }] = useUpdateMyProfileMutation()
  const [changePassword, { isLoading: changingPw }] = useChangePasswordMutation()
  const [uploadMedia, { isLoading: uploadingPic }] = useUploadMyMediaMutation()
  const [deleteMedia, { isLoading: deletingPic }] = useDeleteMyMediaMutation()

  const [showPicForm, setShowPicForm] = useState(false)
  const [picUrl, setPicUrl] = useState('')
  const [picId, setPicId] = useState('')

  const { register: regProfile, handleSubmit: submitProfile, reset: resetProfile } = useForm()
  const { register: regPw, handleSubmit: submitPw, reset: resetPw } = useForm()

  useEffect(() => {
    if (profile) resetProfile({ name: profile.name })
  }, [profile, resetProfile])

  async function handleProfile(data) {
    try { await updateProfile(data).unwrap(); toast.success('Profile updated') }
    catch { toast.error('Failed to update') }
  }

  async function handlePassword(data) {
    try { await changePassword(data).unwrap(); toast.success('Password changed'); resetPw() }
    catch { toast.error('Failed to change password') }
  }

  async function handleUploadPicture() {
    if (!picUrl) { toast.error('Please upload an image first'); return }
    try {
      await uploadMedia({ url: picUrl, publicId: picId }).unwrap()
      dispatch(updateProfilePicture({ imageUrl: picUrl, imageId: picId || undefined }))
      toast.success('Profile picture updated')
      setShowPicForm(false)
      setPicUrl('')
      setPicId('')
    } catch { toast.error('Failed to update profile picture') }
  }

  async function handleDeletePicture() {
    try {
      await deleteMedia().unwrap()
      dispatch(updateProfilePicture(null))
      toast.success('Profile picture removed')
    } catch { toast.error('Failed to remove profile picture') }
  }

  const avatarUrl = profile?.profileImageUrl

  if (isLoading) return <PageWrapper title="Profile" crumbs={['Crew', 'Profile']}><SkeletonCard lines={5} /></PageWrapper>

  return (
    <PageWrapper title="Profile" crumbs={['Crew', 'Profile']}>
      <div className="max-w-lg space-y-6">
        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-full bg-stone-200 flex items-center justify-center overflow-hidden">
                {avatarUrl
                  ? <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  : <span className="text-xl font-bold text-stone-600">{profile?.name?.charAt(0)?.toUpperCase()}</span>
                }
              </div>
              <button
                type="button"
                onClick={() => setShowPicForm((v) => !v)}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-stone-900 rounded-full flex items-center justify-center shadow-sm hover:bg-stone-700 transition-colors"
                title="Change photo"
              >
                <Camera size={11} className="text-white" />
              </button>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900">{profile?.name}</h2>
              <p className="text-sm text-stone-500">{profile?.email}</p>
              <p className="text-xs text-stone-400 mt-0.5">{getRoleLabel(profile?.role)}</p>
              {profile?.averageRating != null && (
                <div className="mt-1 flex items-center gap-2">
                  <StarDisplay rating={profile.averageRating} size={13} />
                  <span className="text-xs text-stone-500">{profile.averageRating.toFixed(1)} avg · {profile.totalJobsCompleted} jobs</span>
                </div>
              )}
            </div>
          </div>

          {/* Inline picture upload form */}
          {showPicForm && (
            <div className="mb-5 p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <p className="text-sm font-medium text-stone-700">Update Profile Picture</p>
              <CloudinaryUpload
                value={picUrl}
                onUpload={(url, id) => { setPicUrl(url); setPicId(id) }}
                onRemove={() => { setPicUrl(''); setPicId('') }}
                label="Choose photo"
                avatar
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUploadPicture}
                  disabled={uploadingPic || !picUrl}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg disabled:opacity-60"
                >
                  {uploadingPic ? 'Saving…' : 'Save Photo'}
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleDeletePicture}
                    disabled={deletingPic}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-60"
                  >
                    <Trash2 size={11} /> Remove current
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setShowPicForm(false); setPicUrl(''); setPicId('') }}
                  className="px-3 py-1.5 text-xs font-medium text-stone-500 hover:text-stone-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <form onSubmit={submitProfile(handleProfile)} autoComplete="on" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Display Name</label>
              <input {...regProfile('name')} className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700" />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={updating} className="px-4 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg disabled:opacity-60">
                {updating ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={16} className="text-stone-400" />
            <h3 className="text-sm font-semibold text-stone-900">Change Password</h3>
          </div>
          <form onSubmit={submitPw(handlePassword)} autoComplete="on" className="space-y-4">
            <input {...regPw('currentPassword', { required: true })} type="password" autoComplete="current-password" placeholder="Current password"
              className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700" />
            <input {...regPw('newPassword', { required: true, minLength: 8 })} type="password" autoComplete="new-password" placeholder="New password (min 8)"
              className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700" />
            <div className="flex justify-end">
              <button type="submit" disabled={changingPw} className="px-4 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg disabled:opacity-60">
                {changingPw ? 'Changing…' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageWrapper>
  )
}
