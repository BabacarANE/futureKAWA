import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Globe2,
  Warehouse,
  Package,
  Activity,
  Bell,
  BarChart3,
  Mail,
  ShieldCheck,
  Settings,
  LogOut,
  PanelLeft,
  Search,
  Moon,
  Sun,
} from '../icons'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, section: 'Operations' },
  { to: '/countries', label: 'Countries', icon: Globe2, section: 'Operations' },
  { to: '/warehouses', label: 'Warehouses', icon: Warehouse, section: 'Operations' },
  { to: '/lots', label: 'Lots', icon: Package, section: 'Operations' },
  { to: '/iot', label: 'IoT Monitoring', icon: Activity, section: 'Operations' },
  { to: '/alerts', label: 'Alerts', icon: Bell, section: 'Operations' },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, section: 'Operations' },
  { to: '/notifications', label: 'Notifications', icon: Mail, section: 'System' },
  { to: '/admin', label: 'Administration', icon: ShieldCheck, section: 'System' },
  { to: '/settings', label: 'Settings', icon: Settings, section: 'System' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [dark, setDark] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const sections = ['Operations', 'System']

  return (
    <div className={`min-h-screen flex ${dark ? 'dark' : ''}`}>
      {/* Sidebar */}
      <aside
        className={`${collapsed ? 'w-20' : 'w-64'} shrink-0 bg-[#241712] dark:bg-[#15100d]
                    text-stone-200 flex flex-col transition-all duration-300 ease-in-out`}
      >
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/5">
          <img src="/futurekawa-logo-icon.svg" alt="FutureKawa" className="h-9 w-9 shrink-0 object-contain" />
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="font-bold text-white leading-tight tracking-tight whitespace-nowrap">
                FutureKawa
              </p>
              <p className="text-[10px] uppercase tracking-widest text-stone-400 whitespace-nowrap">
                Coffee Intelligence
              </p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {sections.map((section) => (
            <div key={section}>
              {!collapsed && (
                <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-widest text-stone-500">
                  {section}
                </p>
              )}
              <div className="space-y-1">
                {navItems
                  .filter((item) => item.section === section)
                  .map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                         transition-all duration-150 relative
                         ${
                           isActive
                             ? 'bg-coffee-600/90 text-white shadow-sm'
                             : 'text-stone-300 hover:bg-white/5 hover:text-white'
                         }`
                      }
                      title={collapsed ? label : undefined}
                    >
                      <Icon size={18} className="shrink-0" />
                      {!collapsed && <span className="truncate">{label}</span>}
                      {collapsed && (
                        <span className="absolute left-full ml-2 px-2 py-1 rounded-lg bg-[#1a120e]
                                          text-xs text-white opacity-0 -translate-x-1 pointer-events-none
                                          group-hover:opacity-100 group-hover:translate-x-0
                                          transition-all duration-150 whitespace-nowrap z-50 shadow-lg">
                          {label}
                        </span>
                      )}
                    </NavLink>
                  ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5">
          <button
            onClick={() => {
              logout?.()
              navigate('/login')
            }}
            className="group relative flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium
                       text-stone-300 hover:bg-white/5 hover:text-white transition-all duration-150"
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
            {collapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 rounded-lg bg-[#1a120e]
                                text-xs text-white opacity-0 -translate-x-1 pointer-events-none
                                group-hover:opacity-100 group-hover:translate-x-0
                                transition-all duration-150 whitespace-nowrap z-50 shadow-lg">
                Logout
              </span>
            )}
          </button>
          {!collapsed && (
            <p className="px-3 pt-3 text-[11px] text-stone-500">v1.0 · MQTT connected</p>
          )}
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 bg-stone-50 dark:bg-[#0f0c0a]">
        {/* Header */}
        <header className="h-16 shrink-0 flex items-center gap-4 px-6 border-b
                            border-stone-200 dark:border-white/5
                            bg-white/80 dark:bg-[#15100d]/80 backdrop-blur-sm
                            sticky top-0 z-30">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="h-9 w-9 flex items-center justify-center rounded-lg
                       text-stone-500 hover:bg-stone-100 dark:hover:bg-white/5 dark:text-stone-300
                       transition-colors"
            aria-label="Toggle sidebar"
          >
            <PanelLeft size={18} />
          </button>

          <div className="flex-1 max-w-xl relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              placeholder="Search lots, warehouses, alerts..."
              className="w-full bg-stone-100 dark:bg-white/5 border border-transparent
                         focus:border-coffee-400 focus:bg-white dark:focus:bg-[#1a1512]
                         rounded-xl pl-9 pr-3 py-2 text-sm text-stone-700 dark:text-stone-200
                         placeholder:text-stone-400 outline-none transition-all duration-150"
            />
          </div>

          <button
            className="relative h-9 w-9 flex items-center justify-center rounded-lg
                       text-stone-500 hover:bg-stone-100 dark:hover:bg-white/5 dark:text-stone-300
                       transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#15100d]" />
          </button>

          <button
            onClick={() => setDark((d) => !d)}
            className="h-9 w-9 flex items-center justify-center rounded-lg
                       text-stone-500 hover:bg-stone-100 dark:hover:bg-white/5 dark:text-stone-300
                       transition-colors"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="flex items-center gap-3 pl-2 border-l border-stone-200 dark:border-white/10">
            <div className="h-9 w-9 rounded-full bg-coffee-100 dark:bg-coffee-600/30
                            flex items-center justify-center font-semibold text-coffee-700 dark:text-coffee-200">
              {(user?.name?.[0] ?? 'U').toUpperCase()}
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                {user?.name ?? 'Guest'}
              </p>
              <p className="text-xs text-stone-400 capitalize">{user?.role ?? 'Admin'}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}