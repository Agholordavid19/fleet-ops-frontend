import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Truck, CheckCircle } from 'lucide-react'
import { useRegisterCompanyMutation } from '../../features/companies/companiesApi'

function Field({ label, name, type = 'text', placeholder, validation, required, register, errors, autoComplete }) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1.5">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <input
        type={type}
        placeholder={placeholder}
        {...register(name, validation)}
        autoComplete={autoComplete}
        className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm bg-white text-stone-900 placeholder-stone-400
          focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700 transition-colors"
      />
      {errors[name] && <p className="mt-1 text-xs text-red-600">{errors[name].message}</p>}
    </div>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [registered, setRegistered] = useState(false)
  const [serverError, setServerError] = useState(null)
  const [registerCompany, { isLoading }] = useRegisterCompanyMutation()
  const { register, handleSubmit, formState: { errors } } = useForm()

  async function onSubmit(data) {
    setServerError(null)
    try {
      await registerCompany(data).unwrap()
      setRegistered(true)
    } catch (err) {
      setServerError(err?.data?.message ?? 'Registration failed. Please try again.')
    }
  }

  const fieldProps = { register, errors }

  if (registered) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center animate-fade-up">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-10">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-500" />
            </div>
            <h2 className="text-xl font-semibold text-stone-900 mb-2">Registration submitted</h2>
            <p className="text-sm text-stone-500 mb-6">
              Your company registration is pending approval. You'll be notified once reviewed.
            </p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full h-10 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg animate-fade-up">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center mb-4">
            <Truck size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Register your company</h1>
          <p className="text-sm text-stone-500 mt-1">Get your fleet operations up and running</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-8">
          <form onSubmit={handleSubmit(onSubmit)} autoComplete="on" className="space-y-6">
            {/* Company Info */}
            <div>
              <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wide mb-4">Company Information</h3>
              <div className="space-y-4">
                <Field {...fieldProps} label="Company Name" name="name" placeholder="Acme Logistics" validation={{ required: 'Required' }} required />
                <Field {...fieldProps} label="Company Email" name="email" type="email" autoComplete="email" placeholder="ops@company.com" validation={{ required: 'Required' }} required />
                <Field {...fieldProps} label="Phone" name="contactPhone" placeholder="+1 (555) 000-0000" />
                <Field {...fieldProps} label="Address" name="address" placeholder="123 Fleet St, City, State" />
              </div>
            </div>

            <div className="border-t border-stone-100" />

            {/* Admin Account */}
            <div>
              <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wide mb-4">Admin Account</h3>
              <div className="space-y-4">
                <Field {...fieldProps} label="Admin Name" name="adminName" placeholder="Jane Smith" validation={{ required: 'Required' }} required />
                <Field {...fieldProps} label="Admin Email" name="adminEmail" type="email" autoComplete="email" placeholder="admin@company.com" validation={{ required: 'Required' }} required />
                <Field {...fieldProps} label="Password" name="adminPassword" type="password" autoComplete="new-password" placeholder="••••••••" validation={{ required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } }} required />
              </div>
            </div>

            {serverError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
                <p className="text-sm text-red-600">{serverError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isLoading ? 'Submitting…' : 'Submit registration'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-stone-500">
            Already registered?{' '}
            <a href="/login" className="text-stone-800 hover:text-stone-800 font-medium">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  )
}
