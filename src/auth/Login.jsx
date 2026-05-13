import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { fleetApi, useLoginMutation } from '../apis/fleetApi'
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
    MAINTENANCE_TEAM: '/maintenance/flags',
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
            dispatch(fleetApi.util.resetApiState())
            dispatch(setCredentials(res))
            toast.success('Signed in')
            navigate(roleRedirects[res.role] ?? '/')
        } catch (err) {
            toast.error(err?.data?.message ?? 'Invalid credentials')
        }
    }

    return (
        <div className="relative h-dvh max-w-full overflow-hidden bg-[#f5f5f7] px-4 py-4 text-[#111111] flex items-center justify-center sm:px-5 sm:py-6">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-x-0 top-0 h-24 bg-white" />
                <div className="absolute left-1/2 top-[52%] h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/8" />
                <div className="absolute left-1/2 top-[52%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/6" />
            </div>

            <motion.div
                className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[22px] border border-black/10 bg-white shadow-[0_34px_90px_rgba(0,0,0,0.16)] sm:rounded-[28px] md:grid-cols-[1.1fr_0.9fr]"
                variants={container}
                initial="hidden"
                animate="show"
            >
                <motion.div variants={item} className="relative min-h-[170px] bg-[#111111] px-6 py-6 text-white sm:min-h-[320px] sm:px-10 sm:py-9 md:min-h-[520px]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[12px] font-black text-black">
                                M
                            </div>
                            <span className="text-[13px] font-semibold tracking-tight">MpFleets</span>
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                            FleetOps
                        </span>
                    </div>

                    <div className="absolute inset-x-6 bottom-6 sm:inset-x-10 sm:bottom-9">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45 sm:mb-4 sm:text-[12px]">
                            Command center
                        </p>
                        <h1 className="max-w-md text-[40px] font-black uppercase leading-[0.88] tracking-normal sm:text-[72px] md:text-[84px]">
                            Move the fleet.
                        </h1>
                    </div>

                    <div className="absolute right-[-80px] top-24 h-56 w-80 rotate-[-18deg] rounded-full border border-white/15 sm:top-32" />
                    <div className="absolute bottom-16 right-6 h-1.5 w-28 rounded-full bg-white sm:bottom-24 sm:right-10 sm:h-2 sm:w-40" />
                    <div className="absolute bottom-11 right-20 h-1.5 w-20 rounded-full bg-white/35 sm:bottom-16 sm:right-28 sm:h-2 sm:w-28" />
                </motion.div>

                <motion.div variants={item} className="flex min-h-0 items-center px-6 py-7 sm:px-10 sm:py-9 md:min-h-[520px]">
                    <div className="w-full">
                        <div className="mb-7 sm:mb-9">
                            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-black/35">
                                Secure access
                            </p>
                            <h2 className="text-[34px] font-semibold leading-none tracking-normal text-black">
                                Sign in
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <FormField label="Email">
                                <Input
                                    type="email"
                                    name="email"
                                    placeholder="admin@fleetops.com"
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
                                    placeholder="Password"
                                    value={form.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                    required
                                />
                            </FormField>
                            <SubmitButton loading={isLoading} className="h-11 rounded-full bg-black hover:bg-black/85">
                                Continue
                            </SubmitButton>
                        </form>
                    </div>
                </motion.div>

            </motion.div>
        </div>
    )
}
