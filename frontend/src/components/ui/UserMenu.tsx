import { useState, useRef, useEffect } from 'react'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function initialsFromName(name?: string) {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onEscape)
    }
  }, [])

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-coffee-900/10 dark:border-white/10
                   bg-white dark:bg-coffee-900/40 hover:bg-coffee-50 dark:hover:bg-coffee-900/70
                   transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-coffee-700 text-white flex items-center justify-center text-xs font-semibold shrink-0">
          {initialsFromName(user?.name)}
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-sm font-medium text-coffee-900 dark:text-coffee-50 leading-tight">
            {user?.name ?? 'Admin'}
          </div>
          <div className="text-[11px] text-coffee-700/60 dark:text-coffee-200/50 leading-tight">
            {user?.role ?? 'siege'}
          </div>
        </div>
        <ChevronDown
          size={14}
          className={`text-coffee-700/60 dark:text-coffee-200/50 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 max-h-72 overflow-y-auto rounded-xl border border-coffee-900/10
                     dark:border-white/10 bg-white dark:bg-coffee-900 shadow-card dark:shadow-card-dark z-50
                     py-1.5 animate-[fadeIn_.12s_ease-out]"
        >
          <div className="px-3 py-2 border-b border-coffee-900/10 dark:border-white/10">
            <div className="text-sm font-medium text-coffee-900 dark:text-coffee-50 truncate">
              {user?.name ?? 'Admin'}
            </div>
            <div className="text-xs text-coffee-700/60 dark:text-coffee-200/50 truncate">
              {user?.email ?? 'admin@futurekawa.com'}
            </div>
          </div>

          <button
            role="menuitem"
            onClick={() => { setOpen(false); navigate('/profile') }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-coffee-900 dark:text-coffee-50
                       hover:bg-coffee-50 dark:hover:bg-coffee-800 transition-colors"
          >
            <User size={15} className="text-coffee-700/70 dark:text-coffee-200/60" />
            Profil
          </button>

          <button
            role="menuitem"
            onClick={() => { setOpen(false); navigate('/settings') }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-coffee-900 dark:text-coffee-50
                       hover:bg-coffee-50 dark:hover:bg-coffee-800 transition-colors"
          >
            <Settings size={15} className="text-coffee-700/70 dark:text-coffee-200/60" />
            Paramètres
          </button>

          <div className="my-1 border-t border-coffee-900/10 dark:border-white/10" />

          <button
            role="menuitem"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400
                       hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <LogOut size={15} />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  )
}
