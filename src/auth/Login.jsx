import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { useLoginMutation } from '../apis/fleetApi'
import { setCredentials } from '../store/authSlice'
import { FormField, Input, SubmitButton } from '../components/Form'

const roleRedirects = {
    ADMIN:         '/admin/users',
    FLEET_MANAGER: '/fleet/vehicles',
    FIELD_STAFF:   '/staff/trips',
    MAINTENANCE:   '/maintenance/flags',
}

export default function LoginScreen() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [login, { isLoading }] = useLoginMutation()
    const [form, setForm] = useState({ email: '', password: '' })

    const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await login(form).unwrap()
            dispatch(setCredentials({ token: res.token }))
            const { jwtDecode } = await import('jwt-decode')
            const { role } = jwtDecode(res.token)
            toast.success('Logged in successfully')
            navigate(roleRedirects[role] ?? '/')
        } catch (err) {
            toast.error(err?.data?.message ?? 'Invalid credentials')
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl mb-4">
                        <span className="text-xl font-bold text-gray-900">F</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-100 tracking-tight">FleetOps</h1>
                    <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
                </div>

                {/* Card */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl"
                >
                    <FormField label="Email">
                        <Input
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </FormField>
                    <FormField label="Password">
                        <Input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </FormField>
                    <SubmitButton loading={isLoading}>Sign In</SubmitButton>
                </form>
            </div>
        </div>
    )
}