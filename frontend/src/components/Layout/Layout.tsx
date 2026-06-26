import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import type { Role } from '../../types'

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_OPERATIONS = [
  { to: '/',             label: 'Dashboard',      icon: '▣' },
  { to: '/countries',   label: 'Countries',      icon: '◉' },
  { to: '/warehouses',  label: 'Warehouses',     icon: '⬡' },
  { to: '/lots',        label: 'Lots',           icon: '◈' },
  { to: '/iot',         label: 'IoT Monitoring', icon: '〜' },
  { to: '/alerts',      label: 'Alerts',         icon: '△' },
  { to: '/analytics',   label: 'Analytics',      icon: '∥' },
]
const NAV_SYSTEM = [
  { to: '/notifications', label: 'Notifications', icon: '◻' },
  { to: '/admin',         label: 'Administration', icon: '⊙' },
  { to: '/settings',      label: 'Settings',       icon: '⚙' },
]

// Role label map
const ROLE_LABELS: Record<Role, string> = {
  siege:                   'Siège',
  responsable_exploitation:'Exploitation',
  responsable_entrepot:    'Entrepôt',
  qualite:                 'Qualité',
  supply_chain:            'Supply Chain',
}

interface Props {
  role?: Role
  userName?: string
  unreadCount?: number
}

export default function Layout({ role = 'siege', userName = 'Admin Siège', unreadCount = 2 }: Props) {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [dark, setDark] = useState(false)

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
      isActive
        ? 'bg-white/10 text-white font-medium'
        : 'text-stone-400 hover:text-white hover:bg-white/5'
    }`

  return (
    <div className={`flex h-screen overflow-hidden ${dark ? 'dark' : ''}`}>
      {/* ── Sidebar ── */}
      <aside className="w-56 flex-shrink-0 bg-stone-900 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <span className="text-2xl">☕</span>
          <div>
            <div className="text-white font-semibold text-sm leading-none">FutureKawa</div>
            <div className="text-stone-500 text-[10px] tracking-widest uppercase mt-0.5">Coffee Intelligence</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <section>
            <div className="text-[10px] text-stone-600 uppercase tracking-widest px-3 mb-2">Operations</div>
            <ul className="space-y-0.5">
              {NAV_OPERATIONS.map(n => (
                <li key={n.to}>
                  <NavLink to={n.to} end={n.to === '/'} className={linkCls}>
                    <span className="text-base w-4 text-center">{n.icon}</span>
                    {n.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="text-[10px] text-stone-600 uppercase tracking-widest px-3 mb-2">System</div>
            <ul className="space-y-0.5">
              {NAV_SYSTEM.map(n => (
                <li key={n.to}>
                  <NavLink to={n.to} className={linkCls}>
                    <span className="text-base w-4 text-center">{n.icon}</span>
                    {n.label}
                    {n.to === '/notifications' && unreadCount > 0 && (
                      <span className="ml-auto bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </section>
        </nav>

        {/* Logout + version */}
        <div className="px-3 pb-4 border-t border-white/10 pt-3">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-3 py-2 w-full text-sm text-stone-400 hover:text-white rounded-md hover:bg-white/5 transition-colors"
          >
            <span>→</span> Logout
          </button>
          <div className="text-[10px] text-stone-700 px-3 mt-2">v1.0 · MQTT connected</div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        {/* Topbar */}
        <header className="h-14 flex items-center px-6 gap-4 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search lots, warehouses, alerts…"
              className="w-full max-w-md px-4 py-2 text-sm bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Bell */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-gray-500 text-lg">△</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
              )}
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDark(d => !d)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
              aria-label="Toggle dark mode"
            >
              {dark ? '○' : '◑'}
            </button>

            {/* User */}
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-sm font-semibold text-stone-700">
                {userName.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-gray-900 leading-none">{userName}</div>
                <div className="text-xs text-gray-400 mt-0.5">{ROLE_LABELS[role]}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
