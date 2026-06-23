import axios from 'axios'
import type { Lot, Measure, Alert, AuthToken, ConsolidatedCountry } from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

// Injecter le token JWT automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Rediriger vers login si 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────
export const login = async (email: string, password: string): Promise<AuthToken> => {
  const form = new URLSearchParams()
  form.append('username', email)
  form.append('password', password)
  const { data } = await api.post('/auth/token', form)
  return data
}

export const getMe = async () => {
  const { data } = await api.get('/auth/me')
  return data
}

// ── Consolidated (siège) ──────────────────────────
export const getAllCountries = async (): Promise<ConsolidatedCountry[]> => {
  const { data } = await api.get('/consolidated')
  return data
}

export const getCountryLots = async (code: string): Promise<Lot[]> => {
  const { data } = await api.get(`/consolidated/${code}/lots`)
  return data
}

export const getCountryMeasures = async (
  code: string,
  warehouseId: number
): Promise<Measure[]> => {
  const { data } = await api.get(`/consolidated/${code}/measures`, {
    params: { warehouse_id: warehouseId },
  })
  return data
}

export const getCountryAlerts = async (code: string): Promise<Alert[]> => {
  const { data } = await api.get(`/consolidated/${code}/alerts`)
  return data
}

export default api

export const createLot = async (
  countryCode: string,
  payload: {
    id: string
    exploitation_id: number
    warehouse_id: number
    quality_notes?: string
  }
): Promise<Lot> => {
  const { data } = await api.post(`/consolidated/${countryCode}/lots`, payload)
  return data
}

export const createLotsBatch = async (
  countryCode: string,
  lots: {
    id: string
    exploitation_id: number
    warehouse_id: number
    quality_notes?: string
  }[]
): Promise<{ created: number; errors: string[] }> => {
  const results = await Promise.allSettled(
    lots.map(lot => createLot(countryCode, lot))
  )
  const errors: string[] = []
  let created = 0
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') created++
    else errors.push(`Lot ${lots[i].id} : ${r.reason?.response?.data?.detail ?? 'erreur'}`)
  })
  return { created, errors }
}

export const createWarehouse = async (payload: {
  id: string
  country: string
  capacity?: number
  temp?: number
  humidity?: number
  photo?: string
}) => {
  const { data } = await api.post('/warehouses', payload)
  return data
}
