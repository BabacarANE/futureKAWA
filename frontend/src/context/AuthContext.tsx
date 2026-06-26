import {
  createContext, useContext, useState, useEffect, useCallback,
  type ReactNode,
} from 'react'
import type { AuthUser, LoginCredentials, RegisterData, UserRole, AccountStatus } from '../types/auth'

// ─── Mock DB (replace with real API calls) ────────────────────────────────────
const MOCK_USERS: AuthUser[] = [
  {
    id: 'U1', name: 'Admin FutureKawa', email: 'admin@futurekawa.com',
    role: 'admin', status: 'active', createdAt: '2026-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'U2', name: 'Marie Dupont', email: 'marie@futurekawa.com',
    role: 'responsable_exploitation', status: 'active', country: 'Brésil',
    createdAt: '2026-02-10T00:00:00Z',
  },
  {
    id: 'U3', name: 'Carlos Méndez', email: 'carlos@futurekawa.com',
    role: 'responsable_entrepot', status: 'pending', country: 'Colombie',
    createdAt: '2026-06-20T00:00:00Z',
  },
  {
    id: 'U4', name: 'Aïcha Touré', email: 'aicha@futurekawa.com',
    role: 'qualite', status: 'rejected', country: 'Éthiopie',
    createdAt: '2026-05-01T00:00:00Z',
  },
]

// Mock passwords (in production → bcrypt on server)
const MOCK_PASSWORDS: Record<string, string> = {
  'admin@futurekawa.com': 'admin123',
  'marie@futurekawa.com': 'marie123',
  'carlos@futurekawa.com': 'carlos123',
}

const SESSION_KEY = 'fk_session'
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 min

// ─── Simulated JWT ─────────────────────────────────────────────────────────────
function generateToken(userId: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({ sub: userId, iat: Date.now(), exp: Date.now() + 86400000 }))
  return `${header}.${payload}.mock_signature`
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return Date.now() > payload.exp
  } catch { return true }
}

// ─── Log ──────────────────────────────────────────────────────────────────────
interface AuthLog {
  ts: string
  userId: string
  action: 'login' | 'logout' | 'register' | 'approve' | 'reject' | 'disable' | 'google_login'
  ip?: string
}
const LOGS: AuthLog[] = []

function addLog(userId: string, action: AuthLog['action']) {
  LOGS.push({ ts: new Date().toISOString(), userId, action })
}

// ─── Context type ─────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: AuthUser | null
  users: AuthUser[]           // admin only
  logs: AuthLog[]             // admin only
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean

  login: (creds: LoginCredentials) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => void
  register: (data: RegisterData) => Promise<void>

  // Admin actions
  approveUser: (userId: string) => Promise<void>
  rejectUser:  (userId: string, reason?: string) => Promise<void>
  disableUser: (userId: string) => Promise<void>
  enableUser:  (userId: string) => Promise<void>
  changeRole:  (userId: string, role: UserRole) => Promise<void>
  deleteUser:  (userId: string) => Promise<void>

  hasPermission: (page: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]   = useState<AuthUser | null>(null)
  const [users, setUsers] = useState<AuthUser[]>(MOCK_USERS)
  const [isLoading, setIsLoading] = useState(true)
  const [attempts, setAttempts]   = useState<Record<string, number>>({})
  const [locks, setLocks]         = useState<Record<string, number>>({})

  // Restore session on mount
  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY) ||
    sessionStorage.getItem(SESSION_KEY)
    if (raw) {
      try {
        const { token, user: u } = JSON.parse(raw)
        if (!isTokenExpired(token)) setUser(u)
        else localStorage.removeItem(SESSION_KEY)
      } catch { localStorage.removeItem(SESSION_KEY) }
    }
    setIsLoading(false)
  }, [])

  // Auto-logout on token expiry (check every minute)
  useEffect(() => {
    const t = setInterval(() => {
      const raw = localStorage.getItem(SESSION_KEY)
      if (raw) {
        try {
          const { token } = JSON.parse(raw)
          if (isTokenExpired(token)) { logout(); }
        } catch { logout() }
      }
    }, 60_000)
    return () => clearInterval(t)
  }, [])

  const persistSession = (u: AuthUser, remember: boolean) => {
    const token = generateToken(u.id)
    const storage = remember ? localStorage : sessionStorage

    storage.setItem(SESSION_KEY, JSON.stringify({ token, user: u }))
    setUser(u)
  }

  const login = useCallback(async ({ email, password, rememberMe = false }: LoginCredentials) => {
    // Lockout check
    if (locks[email] && Date.now() < locks[email]) {
      const remaining = Math.ceil((locks[email] - Date.now()) / 60000)
      throw new Error(`Compte temporairement bloqué. Réessayez dans ${remaining} min.`)
    }

    await new Promise(r => setTimeout(r, 800)) // simulate network

    const found = users.find(u => u.email === email)
    const correctPwd = MOCK_PASSWORDS[email] === password

    if (!found || !correctPwd) {
      const newAttempts = (attempts[email] ?? 0) + 1
      setAttempts(prev => ({ ...prev, [email]: newAttempts }))
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        setLocks(prev => ({ ...prev, [email]: Date.now() + LOCKOUT_DURATION_MS }))
        throw new Error(`Trop de tentatives. Compte bloqué 15 minutes.`)
      }
      throw new Error(`Email ou mot de passe incorrect. (${MAX_LOGIN_ATTEMPTS - newAttempts} essai(s) restant)`)
    }

    if (found.status === 'pending')  throw new Error('Votre compte est en attente de validation par un administrateur.')
    if (found.status === 'rejected') throw new Error('Votre demande d\'accès a été refusée. Contactez l\'administration.')
    if (found.status === 'disabled') throw new Error('Votre compte a été désactivé. Contactez l\'administration.')

    // Reset attempts
    setAttempts(prev => { const n = { ...prev }; delete n[email]; return n })

    const updated = { ...found, lastLogin: new Date().toISOString() }
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
    persistSession(updated, rememberMe)
    addLog(found.id, 'login')
  }, [users, attempts, locks])

  const loginWithGoogle = useCallback(async () => {
    await new Promise(r => setTimeout(r, 1200))
    // In production: integrate Google OAuth 2.0 / Firebase Auth / Supabase
    // Here we simulate a successful Google login
    const googleUser: AuthUser = {
      id: 'G1', name: 'Utilisateur Google', email: 'google@futurekawa.com',
      role: 'supply_chain', status: 'active', createdAt: new Date().toISOString(),
    }
    persistSession(googleUser, true)
    addLog(googleUser.id, 'google_login')
  }, [])

  const logout = useCallback(() => {
    if (user) addLog(user.id, 'logout')
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    setUser(null)
  }, [user])

  const register = useCallback(async (data: RegisterData) => {
    await new Promise(r => setTimeout(r, 900))
    if (users.find(u => u.email === data.email)) {
      throw new Error('Un compte existe déjà avec cet email.')
    }
    if (data.password.length < 8) throw new Error('Le mot de passe doit comporter au moins 8 caractères.')

    const newUser: AuthUser = {
      id: `U${Date.now()}`, name: data.name, email: data.email,
      role: data.role, status: 'pending', country: data.country,
      createdAt: new Date().toISOString(),
    }
    MOCK_PASSWORDS[data.email] = data.password
    setUsers(prev => [...prev, newUser])
    addLog(newUser.id, 'register')
  }, [users])

  // ── Admin actions ────────────────────────────────────────────────────────────
  const updateStatus = (userId: string, status: AccountStatus) =>
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u))

  const approveUser = async (userId: string) => {
    await new Promise(r => setTimeout(r, 400))
    updateStatus(userId, 'active')
    addLog(user!.id, 'approve')
  }
  const rejectUser = async (userId: string) => {
    await new Promise(r => setTimeout(r, 400))
    updateStatus(userId, 'rejected')
    addLog(user!.id, 'reject')
  }
  const disableUser = async (userId: string) => {
    await new Promise(r => setTimeout(r, 400))
    updateStatus(userId, 'disabled')
    addLog(user!.id, 'disable')
  }
  const enableUser = async (userId: string) => {
    await new Promise(r => setTimeout(r, 400))
    updateStatus(userId, 'active')
  }
  const changeRole = async (userId: string, role: UserRole) => {
    await new Promise(r => setTimeout(r, 400))
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
  }
  const deleteUser = async (userId: string) => {
    await new Promise(r => setTimeout(r, 400))
    setUsers(prev => prev.filter(u => u.id !== userId))
  }

  const hasPermission = useCallback((page: string): boolean => {
    if (!user) return false
    const perms = { admin: ['*'], siege: ['*'], responsable_exploitation: ['dashboard','warehouses','lots','alerts','iot','notifications'], responsable_entrepot: ['dashboard','warehouses','lots','iot'], qualite: ['dashboard','lots','analytics'], supply_chain: ['dashboard','lots','countries','analytics'] }
    const allowed = perms[user.role] ?? []
    return allowed.includes('*') || allowed.includes(page)
  }, [user])

  return (
    <AuthContext.Provider value={{
      user, users, logs: LOGS, isLoading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      login, loginWithGoogle, logout, register,
      approveUser, rejectUser, disableUser, enableUser, changeRole, deleteUser,
      hasPermission,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
