export type LotStatus = 'compliant' | 'alert' | 'expired'
export type AlertType = 'out_of_range' | 'expired_lot'
export type UserRole =
  | 'responsable_exploitation'
  | 'responsable_entrepot'
  | 'qualite'
  | 'supply_chain'
  | 'siege'

export interface Country {
  code: string
  name: string
  ideal_temp: number
  ideal_humidity: number
  tolerance_temp: number
  tolerance_humidity: number
}

export interface Exploitation {
  id: number
  name: string
  country_code: string
  city: string
}

export interface Warehouse {
  id: number
  name: string
  location: string
  exploitation_id: number
}

export interface Lot {
  id: string
  exploitation_id: number
  warehouse_id: number
  storage_date: string
  status: LotStatus
  quality_notes: string | null
}

export interface Measure {
  id: number
  warehouse_id: number
  temperature: number
  humidity: number
  timestamp: string
  status: string
}

export interface Alert {
  id: number
  lot_id: string | null
  warehouse_id: number
  type: AlertType
  message: string
  triggered_at: string
}

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  country_code: string | null
}

export interface AuthToken {
  access_token: string
  token_type: string
}

export interface ConsolidatedCountry {
  country_code: string
  lots: Lot[]
  alerts: Alert[]
  latest_measures: Measure[]
}

export interface AnalyticsMeasure extends Measure { country: string }
export interface AnalyticsLot    extends Lot       { country: string }

export interface AnalyticsData {
  summary: {
    total_lots: number
    total_alerts: number
    avg_temperature: number
    avg_humidity: number
    active_countries: number
  }
  lotsByCountry:    Record<string, number>
  alertsByCountry:  Record<string, number>
  allLots:          AnalyticsLot[]
  allMeasures:      AnalyticsMeasure[]
}
