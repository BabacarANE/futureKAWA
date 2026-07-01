export type UserRole =
  | 'siege'
  | 'responsable_exploitation'
  | 'responsable_entrepot'
  | 'qualite'
  | 'supply_chain'
  | 'admin'

export type AccountStatus = 'pending' | 'active' | 'rejected' | 'disabled'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: AccountStatus
  avatar?: string
  country?: string
  createdAt: string
  lastLogin?: string
  loginAttempts?: number
  lockedUntil?: string
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

export interface AuthSession {
  user: AuthUser
  token: string
  expiresAt: string
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin:                    'Administrateur',
  siege:                    'Siège',
  responsable_exploitation: 'Resp. Exploitation',
  responsable_entrepot:     'Resp. Entrepôt',
  qualite:                  'Qualité',
  supply_chain:             'Supply Chain',
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin:                    ['*'],
  siege:                    ['dashboard', 'analytics', 'countries', 'warehouses', 'lots', 'alerts', 'iot', 'notifications'],
  responsable_exploitation: ['dashboard', 'warehouses', 'lots', 'alerts', 'iot'],
  responsable_entrepot:     ['dashboard', 'warehouses', 'lots', 'iot'],
  qualite:                  ['dashboard', 'lots', 'analytics'],
  supply_chain:             ['dashboard', 'lots', 'countries', 'analytics'],
}
