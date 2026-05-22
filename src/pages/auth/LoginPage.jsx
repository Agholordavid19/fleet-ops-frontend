import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { Truck, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useLoginMutation } from '../../features/auth/authApi'
import { setCredentials, selectIsAuthenticated, selectUserRole } from '../../features/auth/authSlice'
import { getDefaultRouteForRole } from '../../utils/roleHelpers'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const role = useSelector(selectUserRole)
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState(null)

  const [login, { isLoading }] = useLoginMutation()
  const { register, handleSubmit, formState: { errors } } = useForm()

  useEffect(() => {
    if (isAuthenticated && role) {
      navigate(getDefaultRouteForRole(role), { replace: true })
    }
  }, [isAuthenticated, role, navigate])

  async function onSubmit(data) {
    setServerError(null)
    try {
      const result = await login(data).unwrap()
      dispatch(setCredentials(result))
      navigate(getDefaultRouteForRole(result.role), { replace: true })
    } catch (err) {
      setServerError(err?.data?.message ?? 'Invalid credentials. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center mb-4 shadow-[0_4px_12px_rgba(0,0,0,0.18)]">
            <Truck size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">FleetOps</h1>
          <p className="text-sm text-stone-500 mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-8">
          <form onSubmit={handleSubmit(onSubmit)} autoComplete="on" className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                {...register('email', { required: 'Email is required' })}
                className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm bg-white text-stone-900 placeholder-stone-400
                  focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700 transition-colors"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                  className="w-full h-10 px-3 pr-10 rounded-lg border border-stone-200 text-sm bg-white text-stone-900 placeholder-stone-400
                    focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            {/* Server error */}
            {serverError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
                <p className="text-sm text-red-600">{serverError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-500">
            New company?{' '}
            <a href="/register" className="text-stone-800 hover:text-stone-800 font-medium">
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
