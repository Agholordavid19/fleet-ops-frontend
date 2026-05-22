import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Building2 } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import StatusBadge from '../../components/ui/StatusBadge'
import SkeletonCard from '../../components/ui/SkeletonCard'
import { useGetCompanyProfileQuery, useUpdateCompanyProfileMutation } from '../../features/companies/companiesApi'
import { useToast } from '../../hooks/useToast'
import { formatDate } from '../../utils/formatters'

export default function CompanyProfilePage() {
  const toast = useToast()
  const { data: company, isLoading } = useGetCompanyProfileQuery()
  const [updateProfile, { isLoading: updating }] = useUpdateCompanyProfileMutation()
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    if (company) {
      reset({ contactPhone: company.contactPhone, address: company.address, logoUrl: company.logoUrl })
    }
  }, [company, reset])

  async function onSubmit(data) {
    try {
      await updateProfile(data).unwrap()
      toast.success('Company profile updated')
    } catch { toast.error('Failed to update profile') }
  }

  if (isLoading) {
    return (
      <PageWrapper title="Company Profile" crumbs={['Admin', 'Company']}>
        <SkeletonCard lines={5} />
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title="Company Profile" crumbs={['Admin', 'Company']}>
      <div className="max-w-2xl">
        {/* Info card */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
              {company?.logoUrl
                ? <img src={company.logoUrl} alt="Logo" className="w-full h-full rounded-xl object-cover" />
                : <Building2 size={24} className="text-stone-400" />
              }
            </div>
            <div>
              <h2 className="text-xl font-semibold text-stone-900">{company?.name}</h2>
              <p className="text-sm text-stone-500">{company?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={company?.status} />
                {company?.approvedAt && (
                  <span className="text-xs text-stone-400">Approved {formatDate(company.approvedAt)}</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-stone-400 mb-0.5">Registered</p>
              <p className="text-stone-700">{formatDate(company?.registeredAt)}</p>
            </div>
            <div>
              <p className="text-xs text-stone-400 mb-0.5">Status</p>
              <StatusBadge status={company?.status} />
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
          <h3 className="text-sm font-semibold text-stone-900 mb-4">Edit Profile</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Phone</label>
              <input {...register('contactPhone')} placeholder="+1 (555) 000-0000"
                className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Address</label>
              <input {...register('address')} placeholder="123 Fleet St, City"
                className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Logo URL</label>
              <input {...register('logoUrl')} placeholder="https://…"
                className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700" />
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={updating}
                className="px-4 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg disabled:opacity-60 transition-colors">
                {updating ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageWrapper>
  )
}
