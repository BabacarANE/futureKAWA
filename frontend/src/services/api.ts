/**
 * FutureKawa — services/api.ts
 * Toutes les requêtes HTTP vers le backend-siege (port 8000).
 * Le backend-siege agrège lui-même les backends pays.
 */
import axios from 'axios'
import type { Lot, Measure, Alert, AuthToken, ConsolidatedCountry } from '../types'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: BASE, timeout: 10_000 })

// ─── JWT automatique ──────────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── 401 → logout ─────────────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
      localStorage.removeItem('fk_user')
      sessionStorage.removeItem('fk_user')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ════════════════════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════════════════════

export const login = async (email: string, password: string): Promise<AuthToken> => {
  const form = new URLSearchParams()
  form.append('username', email)
  form.append('password', password)
  const { data } = await api.post<AuthToken>('/auth/token', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data
}

export const getMe = async () => {
  const { data } = await api.get('/auth/me')
  return data
}

export type ApiUser = {
  id: number
  name: string
  email: string
  role: string
  country_code: string | null
}

export const getUsers = async (): Promise<ApiUser[]> => {
  const { data } = await api.get<ApiUser[]>('/auth/users/')
  return data
}

export const deleteUser = async (userId: number): Promise<void> => {
  await api.delete(`/auth/users/${userId}`)
}

export const createUser = async (payload: {
  name: string
  email: string
  password: string
  role: string
  country_code: string | null
}): Promise<ApiUser> => {
  const { data } = await api.post<ApiUser>('/auth/users/', payload)
  return data
}

// ════════════════════════════════════════════════════════════════════════════
// CONSOLIDATED — vue siège (tous les pays)
// ════════════════════════════════════════════════════════════════════════════

export const getAllCountries = async (): Promise<ConsolidatedCountry[]> => {
  const { data } = await api.get<ConsolidatedCountry[]>('/consolidated')
  return data
}

export const getCountryLots = async (code: string): Promise<Lot[]> => {
  const { data } = await api.get<Lot[]>(`/consolidated/${code}/lots`)
  return data
}

export const getLot = async (countryCode: string, lotId: string): Promise<Lot> => {
  const { data } = await api.get<Lot>(`/consolidated/${countryCode}/lots/${encodeURIComponent(lotId)}`)
  return data
}

export const updateLot = async (
  countryCode: string,
  lotId: string,
  payload: { quality_notes?: string | null; status?: string; warehouse_id?: number }
): Promise<Lot> => {
  const { data } = await api.put<Lot>(`/consolidated/${countryCode}/lots/${encodeURIComponent(lotId)}`, payload)
  return data
}

export const deleteLot = async (countryCode: string, lotId: string): Promise<void> => {
  await api.delete(`/consolidated/${countryCode}/lots/${encodeURIComponent(lotId)}`)
}

export const getCountryMeasures = async (
  code: string,
  warehouseId?: number
): Promise<Measure[]> => {
  const { data } = await api.get<Measure[]>(`/consolidated/${code}/measures`, {
    params: warehouseId ? { warehouse_id: warehouseId } : {},
  })
  return data
}

export const getCountryAlerts = async (code: string): Promise<Alert[]> => {
  const { data } = await api.get<Alert[]>(`/consolidated/${code}/alerts`)
  return data
}

// ════════════════════════════════════════════════════════════════════════════
// LOTS
// ════════════════════════════════════════════════════════════════════════════

export const createLot = async (
  countryCode: string,
  payload: { id: string; exploitation_id: number; warehouse_id: number; quality_notes?: string }
): Promise<Lot> => {
  const { data } = await api.post<Lot>(`/consolidated/${countryCode}/lots`, payload)
  return data
}

export const createLotsBatch = async (
  countryCode: string,
  lots: { id: string; exploitation_id: number; warehouse_id: number; quality_notes?: string }[]
): Promise<{ created: number; errors: string[] }> => {
  const results = await Promise.allSettled(lots.map(lot => createLot(countryCode, lot)))
  const errors: string[] = []
  let created = 0
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') created++
    else errors.push(`Lot ${lots[i].id} : ${(r as PromiseRejectedResult).reason?.response?.data?.detail ?? 'erreur'}`)
  })
  return { created, errors }
}

// ════════════════════════════════════════════════════════════════════════════
// WAREHOUSES — via backend-siege agrégé
// ════════════════════════════════════════════════════════════════════════════

export interface Warehouse {
  id: number
  name: string
  location: string | null
  exploitation_id: number
  country_code?: string
}

export const getAllWarehouses = async (): Promise<Warehouse[]> => {
  const { data } = await api.get<Warehouse[]>('/warehouses/')
  return data
}

export const getWarehousesByCountry = async (countryCode: string): Promise<Warehouse[]> => {
  const { data } = await api.get<Warehouse[]>(`/warehouses/${countryCode}`)
  return data
}

export const createWarehouse = async (
  countryCode: string,
  payload: { name: string; location?: string; exploitation_id: number }
): Promise<Warehouse> => {
  const { data } = await api.post<Warehouse>(`/warehouses/${countryCode}`, payload)
  return data
}

export const getWarehouseMeasures = async (
  countryCode: string,
  warehouseId: number
): Promise<Measure[]> => {
  const { data } = await api.get<Measure[]>(`/warehouses/${countryCode}/${warehouseId}/measures`)
  return data
}

export const getWarehouseAlerts = async (
  countryCode: string,
  warehouseId: number
): Promise<Alert[]> => {
  const { data } = await api.get<Alert[]>(`/warehouses/${countryCode}/${warehouseId}/alerts`)
  return data
}

export const updateWarehouse = async (
  countryCode: string,
  warehouseId: number,
  payload: { name: string; location?: string | null; exploitation_id: number }
): Promise<Warehouse> => {
  const { data } = await api.put<Warehouse>(`/warehouses/${countryCode}/${warehouseId}`, payload)
  return data
}

export const deleteWarehouse = async (
  countryCode: string,
  warehouseId: number
): Promise<void> => {
  await api.delete(`/warehouses/${countryCode}/${warehouseId}`)
}

// ════════════════════════════════════════════════════════════════════════════
// EXPLOITATIONS
// ════════════════════════════════════════════════════════════════════════════

export interface Exploitation {
  id: number
  name: string
  country_code: string
  city: string | null
}

export const getAllExploitations = async (): Promise<Exploitation[]> => {
  const { data } = await api.get<Exploitation[]>('/exploitations/')
  return data
}

export const getExploitationsByCountry = async (countryCode: string): Promise<Exploitation[]> => {
  const { data } = await api.get<Exploitation[]>(`/exploitations/${countryCode}`)
  return data
}

export const createExploitation = async (
  countryCode: string,
  payload: { name: string; city?: string | null }
): Promise<Exploitation> => {
  const { data } = await api.post<Exploitation>(`/exploitations/${countryCode}`, payload)
  return data
}

// ════════════════════════════════════════════════════════════════════════════
// COUNTRIES CONFIG (seuils IoT par pays)
// ════════════════════════════════════════════════════════════════════════════

export interface CountryConfig {
  code: string
  name: string
  ideal_temp: number
  ideal_humidity: number
  tolerance_temp: number
  tolerance_humidity: number
}

export const getAllCountryConfigs = async (): Promise<CountryConfig[]> => {
  const { data } = await api.get<CountryConfig[]>('/countries/')
  return data
}

export const getCountryConfig = async (code: string): Promise<CountryConfig> => {
  const { data } = await api.get<CountryConfig>(`/countries/${code}`)
  return data
}

export const updateCountryConfig = async (
  code: string,
  payload: Omit<CountryConfig, 'code' | 'name'>
): Promise<CountryConfig> => {
  const { data } = await api.put<CountryConfig>(`/countries/${code}`, payload)
  return data
}

export const createCountryConfig = async (
  payload: CountryConfig
): Promise<CountryConfig> => {
  const { data } = await api.post<CountryConfig>('/countries/', payload)
  return data
}

// ════════════════════════════════════════════════════════════════════════════
// STATS / ANALYTICS
// ════════════════════════════════════════════════════════════════════════════

export const getGlobalStats = async () => {
  const { data } = await api.get('/stats/summary')
  return data
}

export const getAlertsByCountry = async () => {
  const { data } = await api.get('/stats/alerts-by-country')
  return data
}

export const getLotsByCountry = async () => {
  const { data } = await api.get('/stats/lots-by-country')
  return data
}

export const getLatestMeasures = async () => {
  const { data } = await api.get('/stats/measures-latest')
  return data
}

// ── Health check ──────────────────────────────────────────────────────────────
export const getConsolidatedHealth = async () => {
  const { data } = await api.get('/consolidated/health')
  return data
}

// ════════════════════════════════════════════════════════════════════════════
// CLIENTS
// ════════════════════════════════════════════════════════════════════════════

export interface Client {
  id:           number
  name:         string
  company:      string | null
  email:        string | null
  phone:        string | null
  address:      string | null
  notes:        string | null
  country_code?: string
}

export const getAllClients = async (): Promise<Client[]> => {
  const { data } = await api.get<Client[]>('/clients/')
  return data
}

export const getCountryClients = async (countryCode: string): Promise<Client[]> => {
  const { data } = await api.get<Client[]>(`/clients/${countryCode}`)
  return data
}

export const createClient = async (
  countryCode: string,
  payload: Omit<Client, 'id' | 'country_code'>
): Promise<Client> => {
  const { data } = await api.post<Client>(`/clients/${countryCode}`, payload)
  return data
}

export const updateClient = async (
  countryCode: string,
  clientId: number,
  payload: Partial<Omit<Client, 'id' | 'country_code'>>
): Promise<Client> => {
  const { data } = await api.put<Client>(`/clients/${countryCode}/${clientId}`, payload)
  return data
}

export const deleteClient = async (countryCode: string, clientId: number): Promise<void> => {
  await api.delete(`/clients/${countryCode}/${clientId}`)
}

// ════════════════════════════════════════════════════════════════════════════
// EXPEDITIONS
// ════════════════════════════════════════════════════════════════════════════

export interface Expedition {
  id:                 number
  lot_id:             string
  country_code?:      string
  client_id:          number | null
  client:             { id: number; name: string; company: string | null; email: string | null } | null
  destination:        string
  carrier:            string | null
  tracking_number:    string | null
  status:             'en_route' | 'livre' | 'annule'
  notes:              string | null
  shipped_at:         string
  estimated_arrival:  string | null
  delivered_at:       string | null
}

export const getAllExpeditions = async (): Promise<Expedition[]> => {
  const { data } = await api.get<Expedition[]>('/expeditions/')
  return data
}

export const getCountryExpeditions = async (countryCode: string): Promise<Expedition[]> => {
  const { data } = await api.get<Expedition[]>(`/expeditions/${countryCode}`)
  return data
}

export const createExpedition = async (
  countryCode: string,
  payload: {
    lot_id:            string
    client_id?:        number | null
    destination:       string
    carrier?:          string | null
    tracking_number?:  string | null
    estimated_arrival?: string | null
    notes?:            string | null
  }
): Promise<Expedition> => {
  const { data } = await api.post<Expedition>(`/expeditions/${countryCode}`, payload)
  return data
}

export const updateExpedition = async (
  countryCode: string,
  expeditionId: number,
  payload: Partial<{
    client_id:         number | null
    destination:       string
    carrier:           string | null
    tracking_number:   string | null
    status:            string
    estimated_arrival: string | null
    delivered_at:      string | null
    notes:             string | null
  }>
): Promise<Expedition> => {
  const { data } = await api.put<Expedition>(`/expeditions/${countryCode}/${expeditionId}`, payload)
  return data
}

export const cancelExpedition = async (countryCode: string, expeditionId: number): Promise<void> => {
  await api.delete(`/expeditions/${countryCode}/${expeditionId}`)
}

// shipLot / unshipLot — compatibilité LotsPage (délèguent à expeditions)
export const getLotsHistory = async (countryCode: string): Promise<Lot[]> => {
  const { data } = await api.get<Lot[]>(`/consolidated/${countryCode}/lots`, {
    params: { status: 'shipped' },
  })
  return data
}

export const shipLot = async (countryCode: string, lotId: string): Promise<void> => {
  // Expédition minimale sans détails (depuis le bouton rapide de LotsPage)
  await api.post(`/expeditions/${countryCode}`, {
    lot_id: lotId,
    destination: 'À définir',
  })
}

export const unshipLot = async (countryCode: string, lotId: string): Promise<void> => {
  // Récupère l'expédition du lot puis l'annule
  const exps = await getCountryExpeditions(countryCode)
  const exp = exps.find(e => e.lot_id === lotId)
  if (exp) {
    await cancelExpedition(countryCode, exp.id)
  }
}

export default api