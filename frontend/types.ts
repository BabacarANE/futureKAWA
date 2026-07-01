// ─── Core domain types ───────────────────────────────────────────────────────

export type Severity = 'critical' | 'important' | 'info'
export type Metric   = 'temp' | 'humidity' | 'battery' | string
export type Role     = 'responsable_exploitation' | 'responsable_entrepot' | 'qualite' | 'supply_chain' | 'siege'
export type WarehouseStatus = 'online' | 'degraded' | 'offline'
export type LotStatus       = 'en_stock' | 'en_transit' | 'expedie' | 'quarantaine'

export interface Country {
  id: string
  name: string
  code: string
  flag: string
  warehouseCount: number
  lotCount: number
  totalCapacity: number
  activeAlerts: number
}

export interface Warehouse {
  id: string
  name: string
  country: string
  countryCode: string
  status: WarehouseStatus
  lotCount: number
  capacity: number
  temperature: number
  humidity: number
  alertCount: number
  lastUpdate: string
}

export interface Lot {
  id: string
  reference: string
  origin: string
  warehouse: string
  warehouseId: string
  quantity: number        // kg
  capacity: number        // kg
  status: LotStatus
  arrivalDate: string
  expiryDate: string
  quality: number         // 0-100
  fifoPosition: number    // 1 = oldest
}

export interface Sensor {
  id: string
  warehouseId: string
  warehouse: string
  metric: Metric
  value: number
  unit: string
  threshold: number
  status: 'normal' | 'warning' | 'critical'
  lastUpdate: string
  lotId?: string
}

export interface Alert {
  id: string | number
  ts?: string
  country?: string
  warehouse?: string
  lot?: string
  sensor?: string
  value?: number | string
  threshold?: number | string
  cause?: string
  severity?: Severity
  metric?: Metric
  resolved?: boolean
}

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatar?: string
  country?: string
  active: boolean
  lastLogin?: string
}

export interface Notification {
  id: string
  ts: string
  title: string
  body: string
  type: 'alert' | 'system' | 'info'
  read: boolean
  severity?: Severity
}

export interface KPI {
  label: string
  value: string | number
  unit?: string
  delta?: number   // % change
  trend?: 'up' | 'down' | 'stable'
  icon: string
}

