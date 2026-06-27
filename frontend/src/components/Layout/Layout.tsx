/**
 * src/components/Layout.tsx  ← REMPLACE CE FICHIER (pas celui dans Layout/)
 *
 * Corrections :
 * - ChevronDown importé depuis lucide-react (pas dans ../icons)
 * - User, AlertTriangle, Info importés depuis lucide-react
 * - Sidebar sticky (hauteur 100vh fixe, le contenu scroll seul)
 * - Dark/Light branché sur ThemeContext → fonctionnel dans toute l'app
 * - Notifications + Profil alignés à droite de la navbar
 */
import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
// Icônes custom du projet (icons.tsx)
import {
  LayoutDashboard, Globe2, Warehouse, Package, Activity,
  Bell, BarChart3, Mail, ShieldCheck, Settings, LogOut,
  PanelLeft, Search, Moon, Sun,
} from '../../icons'
// Icônes NON présentes dans icons.tsx → lucide-react
import { ChevronDown, User, AlertTriangle, Info } from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const navItems = [
  { to: '/',              label: 'Dashboard',      icon: LayoutDashboard, section: 'Operations' },
  { to: '/countries',     label: 'Countries',      icon: Globe2,          section: 'Operations' },
  { to: '/warehouses',    label: 'Warehouses',     icon: Warehouse,       section: 'Operations' },
  { to: '/lots',          label: 'Lots',           icon: Package,         section: 'Operations' },
  { to: '/iot',           label: 'IoT Monitoring', icon: Activity,        section: 'Operations' },
  { to: '/alerts',        label: 'Alerts',         icon: Bell,            section: 'Operations' },
  { to: '/analytics',     label: 'Analytics',      icon: BarChart3,       section: 'Operations' },
  { to: '/notifications', label: 'Notifications',  icon: Mail,            section: 'System'     },
  { to: '/admin',         label: 'Administration', icon: ShieldCheck,     section: 'System'     },
  { to: '/settings',      label: 'Settings',       icon: Settings,        section: 'System'     },
]

function getInitials(name?: string) {
  if (!name) return 'U'
  const p = name.trim().split(/\s+/)
  return p.length === 1
    ? p[0].slice(0, 2).toUpperCase()
    : (p[0][0] + p[p.length - 1][0]).toUpperCase()
}

// ── Dropdown notifications ─────────────────────────────────────────────────────
function NotifDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onOut = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onOut)
    document.addEventListener('keydown', onEsc)
    return () => { document.removeEventListener('mousedown', onOut); document.removeEventListener('keydown', onEsc) }
  }, [])

  // Notifications de démonstration — à brancher sur getCountryAlerts() pour les vraies
  const notifs = [
    { id: 1, level: 'critical', message: 'Température hors seuil — W-001', wh: 1 },
    { id: 2, level: 'warning',  message: 'Humidité élevée — W-002',        wh: 2 },
  ]
  const count = notifs.length

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
        className="relative h-9 w-9 flex items-center justify-center rounded-lg
                   border border-stone-200 dark:border-white/10
                   bg-white dark:bg-[#1c1a17]
                   hover:bg-stone-100 dark:hover:bg-white/5
                   text-stone-600 dark:text-stone-300 transition-colors"
      >
        <Bell size={16} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full
                           bg-red-500 text-white text-[10px] font-semibold
                           flex items-center justify-center leading-none">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-80 overflow-y-auto rounded-xl
                        border border-stone-200 dark:border-white/10
                        bg-white dark:bg-[#1c1a17] shadow-lg z-50">
          <div className="px-4 py-2.5 border-b border-stone-100 dark:border-white/10
                          flex items-center justify-between sticky top-0
                          bg-white dark:bg-[#1c1a17]">
            <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">Notifications</span>
            <span className="text-xs text-stone-400">{count} active{count !== 1 ? 's' : ''}</span>
          </div>
          <ul>
            {notifs.map(n => (
              <li key={n.id}
                className="px-4 py-3 border-b last:border-b-0 border-stone-50 dark:border-white/5
                           hover:bg-stone-50 dark:hover:bg-white/5 transition-colors flex gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {n.level === 'critical'
                    ? <AlertTriangle size={14} className="text-red-500" />
                    : <Info size={14} className="text-amber-500" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-stone-800 dark:text-stone-100 leading-snug">{n.message}</p>
                  <p className="text-xs text-stone-400 mt-0.5">Entrepôt {n.wh}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ── Dropdown profil ────────────────────────────────────────────────────────────
function UserDropdown() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onOut = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onOut)
    document.addEventListener('keydown', onEsc)
    return () => { document.removeEventListener('mousedown', onOut); document.removeEventListener('keydown', onEsc) }
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
        className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl
                   border border-stone-200 dark:border-white/10
                   bg-white dark:bg-[#1c1a17]
                   hover:bg-stone-50 dark:hover:bg-white/5 transition-colors"
      >
        {/* Cercle brun avec initiales — identique à l'image */}
        <div className="w-8 h-8 rounded-full bg-[#4a2810] text-white
                        flex items-center justify-center text-xs font-semibold shrink-0">
          {getInitials(user?.name)}
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-semibold text-stone-800 dark:text-stone-100 leading-tight">
            {user?.name ?? 'Admin'}
          </div>
          <div className="text-[11px] text-stone-400 leading-tight capitalize">
            {user?.role ?? 'siege'}
          </div>
        </div>
        {/* ChevronDown depuis lucide-react */}
        <ChevronDown
          size={13}
          className={`text-stone-400 ml-0.5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div role="menu"
          className="absolute right-0 mt-2 w-52 rounded-xl
                     border border-stone-200 dark:border-white/10
                     bg-white dark:bg-[#1c1a17] shadow-lg z-50 py-1.5">
          <div className="px-3 py-2 border-b border-stone-100 dark:border-white/10">
            <p className="text-sm font-medium text-stone-800 dark:text-stone-100 truncate">
              {user?.name ?? 'Admin'}
            </p>
            <p className="text-xs text-stone-400 truncate">
              {(user as any)?.email ?? 'admin@futurekawa.com'}
            </p>
          </div>

          <button role="menuitem"
            onClick={() => { setOpen(false); navigate('/profile') }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm
                       text-stone-700 dark:text-stone-200
                       hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
            <User size={14} className="text-stone-400" />
            Profil
          </button>

          <button role="menuitem"
            onClick={() => { setOpen(false); navigate('/settings') }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm
                       text-stone-700 dark:text-stone-200
                       hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
            <Settings size={14} className="shrink-0 text-stone-400" />
            Paramètres
          </button>

          <div className="my-1 border-t border-stone-100 dark:border-white/10" />

          <button role="menuitem" onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm
                       text-red-600 dark:text-red-400
                       hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
            <LogOut size={14} className="shrink-0" />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  )
}

// ── Layout principal ───────────────────────────────────────────────────────────
export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const { logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const isDark = theme === 'dark'

  return (
    // 'dark' sur le wrapper → toutes les classes dark: de Tailwind s'activent
    <div className={`flex h-screen overflow-hidden ${isDark ? 'dark' : ''}`}>

      {/* ── SIDEBAR — hauteur 100vh, ne scroll jamais ─────────────────── */}
      <aside className={`
        ${collapsed ? 'w-20' : 'w-64'} shrink-0 flex flex-col
        bg-[#241712] dark:bg-[#15100d] text-stone-200
        transition-all duration-300 ease-in-out
        overflow-hidden
      `}>
        {/* Logo */}
        <div className="h-16 shrink-0 flex items-center gap-3 px-5 border-b border-white/5">
          <img src="/futurekawa-logo-icon.svg" alt="FutureKawa"
            className="h-9 w-9 shrink-0 object-contain" />
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

        {/* Nav — scrollable uniquement si débordement */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {['Operations', 'System'].map(section => (
            <div key={section}>
              {!collapsed && (
                <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-widest text-stone-500">
                  {section}
                </p>
              )}
              <div className="space-y-1">
                {navItems.filter(i => i.section === section).map(({ to, label, icon: Icon }) => (
                  <NavLink key={to} to={to} end={to === '/'}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                       transition-all duration-150 relative
                       ${isActive
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

        {/* Logout + version */}
        <div className="p-3 border-t border-white/5 shrink-0">
          <button
            onClick={() => { logout?.(); navigate('/login') }}
            className="group relative flex items-center gap-3 w-full rounded-xl px-3 py-2.5
                       text-sm font-medium text-stone-300 hover:bg-white/5 hover:text-white
                       transition-all duration-150"
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

      {/* ── COLONNE DROITE ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-stone-50 dark:bg-[#0f0c0a] overflow-hidden">

        {/* ── TOPBAR ── */}
        <header className="h-16 shrink-0 flex items-center gap-3 px-6
                           border-b border-stone-200 dark:border-white/5
                           bg-white/90 dark:bg-[#15100d]/90 backdrop-blur-sm z-30">

          {/* Toggle sidebar */}
          <button onClick={() => setCollapsed(c => !c)}
            className="h-9 w-9 flex items-center justify-center rounded-lg
                       text-stone-500 hover:bg-stone-100 dark:hover:bg-white/5
                       dark:text-stone-300 transition-colors"
            aria-label="Toggle sidebar">
            <PanelLeft size={18} />
          </button>

          {/* Barre de recherche */}
          <div className="flex-1 max-w-md relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input type="search" placeholder="Search lots, warehouses, alerts..."
              className="w-full bg-stone-100 dark:bg-white/5 border border-transparent
                         focus:border-coffee-400 focus:bg-white dark:focus:bg-[#1a1512]
                         rounded-xl pl-9 pr-3 py-2 text-sm text-stone-700 dark:text-stone-200
                         placeholder:text-stone-400 outline-none transition-all duration-150" />
          </div>

          {/* ── Bloc droite : Notif · Dark/Light · Profil ── */}
          <div className="ml-auto flex items-center gap-2">

            {/* Cloche avec badge rouge */}
            <NotifDropdown />

            {/* Dark / Light — ThemeContext → fonctionne dans toute l'app */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Mode clair' : 'Mode sombre'}
              title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
              className="h-9 w-9 flex items-center justify-center rounded-lg
                         border border-stone-200 dark:border-white/10
                         bg-white dark:bg-[#1c1a17]
                         hover:bg-stone-100 dark:hover:bg-white/5
                         text-stone-600 dark:text-stone-300 transition-colors"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Profil avec nom + rôle + chevron + dropdown */}
            <UserDropdown />
          </div>
        </header>

        {/* ── CONTENU — scroll indépendant du sidebar ── */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}