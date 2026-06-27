/**
 * FutureKawa — context/AuthContext.tsx
 * Authentification RÉELLE via backend-siege (JWT).
 * Expose isLoading pour la compatibilité avec App.tsx (PrivateRoute).
 */
import {
  createContext, useContext, useState, useEffect, useCallback,
  type ReactNode,
} from 'react'
import { login as apiLogin, getMe } from '../services/api'

// ─── Types ────────────────────────────────────────────────────────────────────
export type UserRole =
  | 'responsable_exploitation'
  | 'responsable_entrepot'
  | 'qualite'
  | 'supply_chain'
  | 'siege'
  | 'admin'

export type AccountStatus = 'pending' | 'active' | 'rejected' | 'disabled'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: UserRole
  country_code?: string | null
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role: UserRole
  country?: string
}

// Types compatibles avec l'ancien mock (pour Administration qui les utilise)
export type { AuthUser as AuthUserFull }

interface AuthContextValue {
  user: AuthUser | null
  users: AuthUser[]        // liste vide pour compatibilité (géré par l'API /users)
  logs: unknown[]          // vide pour compatibilité
  isLoading: boolean       // REQUIS par App.tsx (PrivateRoute)
  isAuthenticated: boolean
  isAdmin: boolean

  login: (creds: LoginCredentials) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => void
  register: (data: RegisterData) => Promise<void>

  // Actions admin — stubs (à brancher sur /users API si besoin)
  approveUser: (id: string | number) => Promise<void>
  rejectUser:  (id: string | number) => Promise<void>
  disableUser: (id: string | number) => Promise<void>
  enableUser:  (id: string | number) => Promise<void>
  changeRole:  (id: string | number, role: UserRole) => Promise<void>
  deleteUser:  (id: string | number) => Promise<void>

  hasPermission: (page: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Stockage session ─────────────────────────────────────────────────────────
const TOKEN_KEY = 'token'
const USER_KEY  = 'fk_user'

function saveSession(token: string, user: AuthUser, remember: boolean) {
  const s = remember ? localStorage : sessionStorage
  s.setItem(TOKEN_KEY, token)
  s.setItem(USER_KEY, JSON.stringify(user))
}

function clearSession() {
  ;[localStorage, sessionStorage].forEach(s => {
    s.removeItem(TOKEN_KEY)
    s.removeItem(USER_KEY)
  })
}

function getSavedToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}

function getSavedUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

// ─── Permissions ──────────────────────────────────────────────────────────────
const PERMS: Record<string, string[]> = {
  admin:                    ['*'],
  siege:                    ['*'],
  responsable_exploitation: ['dashboard','warehouses','lots','alerts','iot','notifications','realtime','supervision','countries'],
  responsable_entrepot:     ['dashboard','warehouses','lots','iot','realtime'],
  qualite:                  ['dashboard','lots','analytics'],
  supply_chain:             ['dashboard','lots','countries','analytics'],
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<AuthUser | null>(getSavedUser)
  const [isLoading, setIsLoading] = useState(true)  // true pendant la vérification du token

  // Au montage : valider le token stocké avec /auth/me
  useEffect(() => {
    const token = getSavedToken()
    if (!token) {
      setIsLoading(false)
      return
    }
    getMe()
      .then((me: AuthUser) => {
        setUser(me)
        const remember = !!localStorage.getItem(TOKEN_KEY)
        saveSession(token, me, remember)
      })
      .catch(() => {
        clearSession()
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async ({ email, password, rememberMe = false }: LoginCredentials) => {
    const tokenData = await apiLogin(email, password)
    const token = tokenData.access_token
    const s = rememberMe ? localStorage : sessionStorage
    s.setItem(TOKEN_KEY, token)
    const me: AuthUser = await getMe()
    saveSession(token, me, rememberMe)
    setUser(me)
  }, [])

  const loginWithGoogle = useCallback(async () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/google`
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const register = useCallback(async (_data: RegisterData) => {
    // À brancher sur POST /auth/register côté backend
    throw new Error('Register non encore implémenté côté backend')
  }, [])

  // Stubs admin — remplacer par appels API /users si besoin
  const approveUser = async (_id: string | number) => {}
  const rejectUser  = async (_id: string | number) => {}
  const disableUser = async (_id: string | number) => {}
  const enableUser  = async (_id: string | number) => {}
  const changeRole  = async (_id: string | number, _role: UserRole) => {}
  const deleteUser  = async (_id: string | number) => {}

  const hasPermission = useCallback((page: string): boolean => {
    if (!user) return false
    const allowed = PERMS[user.role] ?? []
    return allowed.includes('*') || allowed.includes(page)
  }, [user])

  return (
    <AuthContext.Provider value={{
      user,
      users: [],       // liste vide — Administration gère ses propres données
      logs:  [],
      isLoading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin' || user?.role === 'siege',
      login,
      loginWithGoogle,
      logout,
      register,
      approveUser, rejectUser, disableUser, enableUser, changeRole, deleteUser,
      hasPermission,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être dans AuthProvider')
  return ctx
}
