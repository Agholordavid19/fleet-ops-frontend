import { useState } from 'react'
import { Users, Plus, UserX, UserCheck, Lock } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import StatusBadge from '../../components/ui/StatusBadge'
import DataTable from '../../components/ui/DataTable'
import SkeletonTable from '../../components/ui/SkeletonTable'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import ConfirmModal from '../../components/ui/ConfirmModal'
import { useForm } from 'react-hook-form'
import {
  useGetCompanyUsersQuery,
  useCreateUserMutation,
  useDeactivateUserMutation,
  useReactivateUserMutation,
  useResetUserPasswordMutation,
} from '../../features/users/usersApi'
import { useToast } from '../../hooks/useToast'
import { formatDate } from '../../utils/formatters'

export default function UsersPage() {
  const toast = useToast()
  const [createModal, setCreateModal] = useState(false)
  const [resetModal, setResetModal] = useState(null)
  const [confirmDeactivate, setConfirmDeactivate] = useState(null)

  const { data: users, isLoading } = useGetCompanyUsersQuery()
  const [createUser, { isLoading: creating }] = useCreateUserMutation()
  const [deactivateUser, { isLoading: deactivating }] = useDeactivateUserMutation()
  const [reactivateUser, { isLoading: reactivating }] = useReactivateUserMutation()
  const [resetPassword, { isLoading: resetting }] = useResetUserPasswordMutation()

  const { register, handleSubmit, formState: { errors }, reset } = useForm()
  const { register: regReset, handleSubmit: submitReset, reset: resetResetForm } = useForm()

  async function handleCreate(data) {
    try {
      await createUser(data).unwrap()
      toast.success('User created successfully')
      reset()
      setCreateModal(false)
    } catch (err) {
      toast.error(err?.data?.message ?? 'Failed to create user')
    }
  }

  async function handleDeactivate() {
    try {
      if (confirmDeactivate.active) {
        await deactivateUser(confirmDeactivate.id).unwrap()
        toast.success('User deactivated')
      } else {
        await reactivateUser(confirmDeactivate.id).unwrap()
        toast.success('User reactivated')
      }
      setConfirmDeactivate(null)
    } catch { toast.error('Failed to update user status') }
  }

  async function handleResetPassword(data) {
    try {
      await resetPassword({ id: resetModal.id, newPassword: data.newPassword }).unwrap()
      toast.success('Password reset successfully')
      resetResetForm()
      setResetModal(null)
    } catch { toast.error('Failed to reset password') }
  }

  const columns = [
    { key: 'name', label: 'Name', render: (v) => <span className="font-medium text-stone-900">{v}</span> },
    { key: 'email', label: 'Email', render: (v) => <span className="text-stone-500">{v}</span> },
    { key: 'role', label: 'Role', render: (v) => <StatusBadge status={v} /> },
    { key: 'active', label: 'Status', render: (v) => <span className={`text-xs font-medium ${v ? 'text-green-600' : 'text-stone-400'}`}>{v ? 'Active' : 'Inactive'}</span> },
    { key: 'createdAt', label: 'Joined', render: (v) => formatDate(v) },
    {
      key: 'id',
      label: 'Actions',
      render: (id, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmDeactivate(row) }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${row.active ? 'bg-red-50 hover:bg-red-100 text-red-700' : 'bg-green-50 hover:bg-green-100 text-green-700'}`}
          >
            {row.active ? <><UserX size={11} /> Deactivate</> : <><UserCheck size={11} /> Reactivate</>}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setResetModal(row) }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-50 hover:bg-stone-100 text-stone-600 text-xs font-medium transition-colors"
          >
            <Lock size={11} /> Reset PW
          </button>
        </div>
      ),
    },
  ]

  return (
    <PageWrapper title="Users" crumbs={['Admin', 'Users']}>
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={15} /> Add User
        </button>
      </div>

      {isLoading
        ? <SkeletonTable rows={5} cols={6} />
        : (users ?? []).length === 0
        ? <EmptyState icon={Users} title="No users yet" description="Add team members to your company." />
        : <DataTable columns={columns} data={users} />
      }

      {/* Create User Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Add User" size="sm">
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Name <span className="text-red-500">*</span></label>
            <input {...register('name', { required: 'Required' })} placeholder="Jane Smith"
              className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700" />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Email <span className="text-red-500">*</span></label>
            <input {...register('email', { required: 'Required' })} type="email" placeholder="jane@company.com"
              className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700" />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Password <span className="text-red-500">*</span></label>
            <input {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })} type="password" placeholder="••••••••"
              className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700" />
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Role <span className="text-red-500">*</span></label>
            <select {...register('role', { required: 'Required' })}
              className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700">
              <option value="">Select role…</option>
              <option value="COMPANY_ADMIN">Company Admin</option>
              <option value="FLEET_MANAGER">Fleet Manager</option>
              <option value="FIELD_STAFF">Field Staff</option>
            </select>
            {errors.role && <p className="text-xs text-red-600 mt-1">{errors.role.message}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateModal(false)} className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg">Cancel</button>
            <button type="submit" disabled={creating} className="px-4 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg disabled:opacity-60">
              {creating ? 'Creating…' : 'Add User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal open={!!resetModal} onClose={() => setResetModal(null)} title="Reset Password" size="sm">
        <p className="text-sm text-stone-500 mb-4">Reset password for <strong>{resetModal?.name}</strong>.</p>
        <form onSubmit={submitReset(handleResetPassword)} className="space-y-3">
          <input
            {...regReset('newPassword', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })}
            type="password"
            placeholder="New password (min 8 chars)"
            className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700"
          />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setResetModal(null)} className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={resetting} className="px-4 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg disabled:opacity-60">
              {resetting ? 'Resetting…' : 'Reset Password'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!confirmDeactivate}
        onClose={() => setConfirmDeactivate(null)}
        onConfirm={handleDeactivate}
        title={confirmDeactivate?.active ? 'Deactivate User' : 'Reactivate User'}
        description={`${confirmDeactivate?.active ? 'Deactivate' : 'Reactivate'} ${confirmDeactivate?.name}?`}
        confirmLabel={confirmDeactivate?.active ? 'Deactivate' : 'Reactivate'}
        confirmVariant={confirmDeactivate?.active ? 'danger' : 'primary'}
        isLoading={deactivating || reactivating}
      />
    </PageWrapper>
  )
}
