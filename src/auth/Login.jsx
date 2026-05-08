import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { useLoginMutation } from '../apis/fleetApi'
import { setCredentials } from '../store/authSlice'
import { FormField, Input, SubmitButton } from '../components/Form'

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
}
const item = {
    hidden: { opacity: 0, y: 14 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 1, 0.5, 1] } },
}

const roleRedirects = {
    ADMIN:         '/admin/users',
    FLEET_MANAGER: '/fleet/vehicles',
    FIELD_STAFF:   '/staff/trips',
    MAINTENANCE:   '/maintenance/flags',
}

export default function LoginScreen() {
    const navigate  = useNavigate()
    const dispatch  = useDispatch()
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
            toast.success('Signed in')
            navigate(roleRedirects[role] ?? '/')
        } catch (err) {
            toast.error(err?.data?.message ?? 'Invalid credentials')
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
            <motion.div
                className="w-full max-w-[340px]"
                variants={container}
                initial="hidden"
                animate="show"
            >
                {/* Wordmark */}
                <motion.div variants={item} className="flex items-center gap-2 mb-12">
                    <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-gray-900 leading-none">F</span>
                    </div>
                    <span className="text-[13px] font-semibold text-gray-100 tracking-tight">FleetOps</span>
                </motion.div>

                {/* Heading */}
                <motion.div variants={item} className="mb-8">
                    <h1 className="text-[26px] font-bold text-gray-100 tracking-tight leading-tight mb-1.5">
                        Sign in
                    </h1>
                    <p className="text-[13px] text-gray-500 leading-snug">
                        Enter your credentials to continue
                    </p>
                </motion.div>

                {/* Form */}
                <motion.form variants={item} onSubmit={handleSubmit}>
                    <FormField label="Email">
                        <Input
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
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
                            autoComplete="current-password"
                            required
                        />
                    </FormField>
                    <SubmitButton loading={isLoading}>Continue</SubmitButton>
                </motion.form>

            </motion.div>
        </div>
    )
}