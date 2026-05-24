import { useNavigate } from 'react-router-dom'
import {
  Truck, Shield, BarChart3, Wrench, AlertTriangle, Users,
  MapPin, Activity, ChevronRight, CheckCircle,
} from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'Fleet Management',
    description: 'Track every vehicle in real time. Monitor health, mileage, availability, and utilisation from a single dashboard.',
  },
  {
    icon: MapPin,
    title: 'Trip Requests',
    description: 'Staff submit trip requests, managers approve or reject with one click, and drivers get notified instantly.',
  },
  {
    icon: Wrench,
    title: 'Maintenance Flags',
    description: 'Structured maintenance workflows from flag creation through quotation, approval, and resolution with full audit trail.',
  },
  {
    icon: AlertTriangle,
    title: 'Breakdown Response',
    description: 'Field staff report breakdowns with GPS location. Platform dispatches crew immediately and tracks resolution.',
  },
  {
    icon: BarChart3,
    title: 'Operational Reports',
    description: 'Utilisation and vehicle health reports surface the data that drives smarter fleet decisions.',
  },
  {
    icon: Activity,
    title: 'Activity Logs',
    description: 'Complete audit logs for every action taken across your fleet — always know who did what and when.',
  },
]

const roles = [
  {
    label: 'Platform Admin',
    color: 'bg-stone-900',
    items: ['Approve & manage companies', 'Oversee crew performance', 'Handle escalated breakdowns', 'Monitor platform activity'],
  },
  {
    label: 'Company Admin',
    color: 'bg-stone-700',
    items: ['Manage fleet & users', 'Approve trip requests', 'Review maintenance costs', 'Access full reports'],
  },
  {
    label: 'Field Staff',
    color: 'bg-stone-600',
    items: ['Browse available vehicles', 'Submit trip requests', 'Report breakdowns with GPS', 'Log mileage post-trip'],
  },
  {
    label: 'Maintenance Crew',
    color: 'bg-stone-500',
    items: ['Receive assigned flags', 'Submit repair quotations', 'Update job progress', 'Close resolved flags'],
  },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-stone-900 rounded-lg flex items-center justify-center">
              <Truck size={14} className="text-white" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">MpFleets</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-4 py-1.5 text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="px-4 py-1.5 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors"
            >
              Register company
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs font-medium text-stone-600 mb-8">
            <Shield size={11} />
            Operational intelligence for modern fleets
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-stone-900 leading-[1.1] mb-6">
            Fleet operations,
            <br />
            <span className="text-stone-500">finally under control.</span>
          </h1>

          <p className="max-w-xl mx-auto text-lg text-stone-500 leading-relaxed mb-10">
            MpFleets connects your entire fleet — vehicles, drivers, maintenance crews, and managers — in one platform built for clarity and speed.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-xl transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
            >
              Get started
              <ChevronRight size={15} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-6 py-3 text-sm font-medium text-stone-700 bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 rounded-xl transition-colors"
            >
              Sign in to dashboard
            </button>
          </div>
        </div>

        {/* Hero graphic — stat strip */}
        <div
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-up"
          style={{ animationDelay: '150ms' }}
        >
          {[
            { value: '4', label: 'Role-based portals' },
            { value: '23+', label: 'Operational screens' },
            { value: '100%', label: 'Audit coverage' },
            { value: 'Live', label: 'GPS breakdown tracking' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <p className="text-3xl font-bold text-stone-900 mb-1">{value}</p>
              <p className="text-xs text-stone-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-y border-stone-200 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Everything your fleet needs</h2>
            <p className="text-stone-500 max-w-lg mx-auto">One platform replaces the spreadsheets, phone calls, and paper trails that slow your operations down.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, description }, i) => (
              <div
                key={title}
                className="bg-stone-50 border border-stone-200 rounded-2xl p-6 hover:border-stone-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-200 animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={18} className="text-white" />
                </div>
                <h3 className="text-sm font-semibold text-stone-900 mb-1.5">{title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight mb-3">Built for every team member</h2>
          <p className="text-stone-500 max-w-lg mx-auto">Dedicated portals ensure each role sees only what they need — no clutter, no confusion.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {roles.map(({ label, color, items }, i) => (
            <div
              key={label}
              className="bg-white border border-stone-200 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`inline-flex px-2.5 py-1 ${color} text-white text-xs font-medium rounded-full mb-4`}>
                {label}
              </div>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle size={13} className="text-stone-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-stone-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-stone-900 py-20">
        <div className="max-w-2xl mx-auto px-6 text-center animate-fade-in">
          <h2 className="text-3xl font-bold text-white tracking-tight mb-4">Ready to take control of your fleet?</h2>
          <p className="text-stone-400 mb-8 leading-relaxed">Register your company and get your whole team connected — vehicles, maintenance, and operations in one place.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="px-6 py-3 bg-white hover:bg-stone-100 text-stone-900 text-sm font-medium rounded-xl transition-colors"
            >
              Register your company
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-6 py-3 text-stone-300 hover:text-white text-sm font-medium transition-colors"
            >
              Already registered? Sign in →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-stone-900 rounded-md flex items-center justify-center">
              <Truck size={12} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-stone-900">MpFleets</span>
          </div>
          <p className="text-xs text-stone-400">Operational intelligence for modern fleet logistics.</p>
        </div>
      </footer>
    </div>
  )
}
