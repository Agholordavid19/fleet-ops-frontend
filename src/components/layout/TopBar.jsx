import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Bell, ChevronDown, User, Lock, LogOut, Menu } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { logout } from '../../features/auth/authSlice'
import { toggleSidebar } from '../../features/ui/uiSlice'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../utils/cn'

function Breadcrumb({ title, crumbs = [] }) {
  return (
    <div>
      <h1 className="text-lg font-semibold text-stone-900 leading-tight">{title}</h1>
      {crumbs.length > 0 && (
        <p className="text-xs text-stone-400 mt-0.5">
          {crumbs.map((c, i) => (
            <span key={i}>
              {i > 0 && <span className="mx-1">/</span>}
              {c}
            </span>
          ))}
        </p>
      )}
    </div>
  )
}

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center overflow-hidden">
          {user?.profilePictureUrl
            ? <img src={user.profilePictureUrl} alt={user?.name} className="w-full h-full object-cover" />
            : <span className="text-xs font-semibold text-stone-600">{user?.name?.charAt(0)?.toUpperCase() ?? '?'}</span>
          }
        </div>
        <span className="text-sm font-medium text-stone-700 hidden sm:block">{user?.name}</span>
        <ChevronDown size={14} className="text-stone-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl border border-stone-200 shadow-[0_4px_12px_rgba(0,0,0,0.08)] py-1 z-50">
          <div className="px-3 py-2 border-b border-stone-100">
            <p className="text-sm font-medium text-stone-900">{user?.name}</p>
            <p className="text-xs text-stone-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => { setOpen(false); navigate('/staff/profile') }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
          >
            <User size={14} /> Profile
          </button>
          <button
            onClick={() => { setOpen(false); navigate('/staff/profile') }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
          >
            <Lock size={14} /> Change Password
          </button>
          <div className="border-t border-stone-100 mt-1">
            <button
              onClick={() => { setOpen(false); onLogout() }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TopBar({ title, crumbs }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useAuth()

  function handleLogout() {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <header className="h-16 border-b border-stone-200 bg-white/80 backdrop-blur-sm flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="md:hidden p-2 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-700 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <Breadcrumb title={title} crumbs={crumbs} />
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors relative">
          <Bell size={18} />
        </button>
        <UserMenu user={user} onLogout={handleLogout} />
      </div>
    </header>
  )
}
