import type { Country, Warehouse, Lot, Sensor, Alert, User, Notification } from './types'

// ─── Countries ───────────────────────────────────────────────────────────────
export const COUNTRIES: Country[] = [
  { id: 'BR', name: 'Brésil',    code: 'BR', flag: '🇧🇷', warehouseCount: 3, lotCount: 120, totalCapacity: 6000, activeAlerts: 5 },
  { id: 'CO', name: 'Colombie',  code: 'CO', flag: '🇨🇴', warehouseCount: 2, lotCount: 80,  totalCapacity: 4000, activeAlerts: 2 },
  { id: 'ET', name: 'Éthiopie',  code: 'ET', flag: '🇪🇹', warehouseCount: 1, lotCount: 35,  totalCapacity: 2000, activeAlerts: 1 },
  { id: 'EC', name: 'Équateur',  code: 'EC', flag: '🇪🇨', warehouseCount: 1, lotCount: 40,  totalCapacity: 1800, activeAlerts: 0 },
]

// ─── Warehouses ───────────────────────────────────────────────────────────────
export const WAREHOUSES: Warehouse[] = [
  { id: 'WH-001', name: 'Entrepôt W-001', country: 'Brésil',   countryCode: 'BR', status: 'online',   lotCount: 120, capacity: 2000, temperature: 22.5, humidity: 58, alertCount: 2, lastUpdate: '2026-06-23T09:00:00Z' },
  { id: 'WH-002', name: 'Entrepôt W-002', country: 'Colombie', countryCode: 'CO', status: 'degraded', lotCount: 80,  capacity: 1200, temperature: 23.1, humidity: 60, alertCount: 4, lastUpdate: '2026-06-23T08:45:00Z' },
  { id: 'WH-003', name: 'Entrepôt W-003', country: 'Équateur', countryCode: 'EC', status: 'offline',  lotCount: 40,  capacity: 900,  temperature: 21.9, humidity: 61, alertCount: 1, lastUpdate: '2026-06-23T06:00:00Z' },
  { id: 'WH-004', name: 'Entrepôt W-004', country: 'Éthiopie', countryCode: 'ET', status: 'online',   lotCount: 35,  capacity: 2000, temperature: 20.4, humidity: 55, alertCount: 0, lastUpdate: '2026-06-23T09:05:00Z' },
  { id: 'WH-005', name: 'Entrepôt W-005', country: 'Brésil',   countryCode: 'BR', status: 'online',   lotCount: 55,  capacity: 1800, temperature: 21.8, humidity: 57, alertCount: 1, lastUpdate: '2026-06-23T09:01:00Z' },
]

// ─── Lots ─────────────────────────────────────────────────────────────────────
export const LOTS: Lot[] = [
  { id: 'L001', reference: 'LOT-BR-042', origin: 'Brésil',   warehouse: 'WH-001', warehouseId: 'WH-001', quantity: 840,  capacity: 1000, status: 'en_stock',   arrivalDate: '2026-03-10', expiryDate: '2027-03-10', quality: 92, fifoPosition: 1 },
  { id: 'L002', reference: 'LOT-CO-019', origin: 'Colombie', warehouse: 'WH-002', warehouseId: 'WH-002', quantity: 600,  capacity: 800,  status: 'en_stock',   arrivalDate: '2026-04-01', expiryDate: '2027-04-01', quality: 88, fifoPosition: 2 },
  { id: 'L003', reference: 'LOT-ET-008', origin: 'Éthiopie', warehouse: 'WH-004', warehouseId: 'WH-004', quantity: 350,  capacity: 500,  status: 'en_transit', arrivalDate: '2026-05-15', expiryDate: '2027-05-15', quality: 95, fifoPosition: 3 },
  { id: 'L004', reference: 'LOT-EC-011', origin: 'Équateur', warehouse: 'WH-003', warehouseId: 'WH-003', quantity: 200,  capacity: 600,  status: 'quarantaine',arrivalDate: '2026-05-20', expiryDate: '2027-05-20', quality: 62, fifoPosition: 4 },
  { id: 'L005', reference: 'LOT-BR-055', origin: 'Brésil',   warehouse: 'WH-005', warehouseId: 'WH-005', quantity: 980,  capacity: 1000, status: 'en_stock',   arrivalDate: '2026-06-01', expiryDate: '2027-06-01', quality: 97, fifoPosition: 5 },
  { id: 'L006', reference: 'LOT-CO-022', origin: 'Colombie', warehouse: 'WH-002', warehouseId: 'WH-002', quantity: 420,  capacity: 700,  status: 'expedie',    arrivalDate: '2026-02-14', expiryDate: '2027-02-14', quality: 85, fifoPosition: 1 },
  { id: 'L007', reference: 'LOT-BR-038', origin: 'Brésil',   warehouse: 'WH-001', warehouseId: 'WH-001', quantity: 760,  capacity: 900,  status: 'en_stock',   arrivalDate: '2026-03-28', expiryDate: '2027-03-28', quality: 91, fifoPosition: 2 },
]

// ─── Sensors ──────────────────────────────────────────────────────────────────
export const SENSORS: Sensor[] = [
  { id: 'S-01', warehouseId: 'WH-001', warehouse: 'WH-001', metric: 'temp',     value: 28.4, unit: '°C', threshold: 25, status: 'critical', lastUpdate: '2026-06-23T09:00:00Z' },
  { id: 'S-02', warehouseId: 'WH-001', warehouse: 'WH-001', metric: 'humidity', value: 58,   unit: '%',  threshold: 70, status: 'normal',   lastUpdate: '2026-06-23T09:00:00Z' },
  { id: 'S-03', warehouseId: 'WH-002', warehouse: 'WH-002', metric: 'temp',     value: 31.1, unit: '°C', threshold: 25, status: 'critical', lastUpdate: '2026-06-23T08:45:00Z' },
  { id: 'S-04', warehouseId: 'WH-002', warehouse: 'WH-002', metric: 'humidity', value: 78,   unit: '%',  threshold: 70, status: 'warning',  lastUpdate: '2026-06-23T08:45:00Z' },
  { id: 'S-05', warehouseId: 'WH-003', warehouse: 'WH-003', metric: 'temp',     value: 19.2, unit: '°C', threshold: 22, status: 'warning',  lastUpdate: '2026-06-23T06:00:00Z' },
  { id: 'S-06', warehouseId: 'WH-004', warehouse: 'WH-004', metric: 'temp',     value: 20.4, unit: '°C', threshold: 25, status: 'normal',   lastUpdate: '2026-06-23T09:05:00Z' },
  { id: 'S-07', warehouseId: 'WH-004', warehouse: 'WH-004', metric: 'humidity', value: 55,   unit: '%',  threshold: 70, status: 'normal',   lastUpdate: '2026-06-23T09:05:00Z' },
  { id: 'S-08', warehouseId: 'WH-005', warehouse: 'WH-005', metric: 'temp',     value: 24.8, unit: '°C', threshold: 25, status: 'normal',   lastUpdate: '2026-06-23T09:01:00Z' },
  { id: 'S-09', warehouseId: 'WH-001', warehouse: 'WH-001', metric: 'battery',  value: 15,   unit: '%',  threshold: 20, status: 'warning',  lastUpdate: '2026-06-23T09:00:00Z' },
]

// ─── Alerts ───────────────────────────────────────────────────────────────────
export const ALERTS: Alert[] = [
  { id: 1, ts: '2026-06-23T07:42:00Z', country: 'Brésil',   warehouse: 'WH-001', lot: 'LOT-BR-042', sensor: 'S-01', value: 28.4, threshold: 25, cause: 'Température critique',    severity: 'critical',  metric: 'temp',     resolved: false },
  { id: 2, ts: '2026-06-23T06:18:00Z', country: 'Colombie', warehouse: 'WH-002', lot: 'LOT-CO-019', sensor: 'S-03', value: 31.1, threshold: 25, cause: 'Surchauffe capteur',       severity: 'critical',  metric: 'temp',     resolved: false },
  { id: 3, ts: '2026-06-23T05:55:00Z', country: 'Éthiopie', warehouse: 'WH-004', lot: 'LOT-ET-008', sensor: 'S-06', value: 29.7, threshold: 25, cause: 'Température hors seuil',   severity: 'critical',  metric: 'temp',     resolved: false },
  { id: 4, ts: '2026-06-23T08:10:00Z', country: 'Brésil',   warehouse: 'WH-001', lot: 'LOT-BR-038', sensor: 'S-04', value: 78,   threshold: 70, cause: 'Humidité élevée',          severity: 'important', metric: 'humidity', resolved: false },
  { id: 5, ts: '2026-06-23T04:30:00Z', country: 'Équateur', warehouse: 'WH-003', lot: 'LOT-EC-011', sensor: 'S-05', value: 19.2, threshold: 22, cause: 'Température basse',        severity: 'important', metric: 'temp',     resolved: false },
  { id: 6, ts: '2026-06-23T09:00:00Z', country: 'Colombie', warehouse: 'WH-002', lot: 'LOT-CO-022', sensor: 'S-09', value: 15,   threshold: 20, cause: 'Batterie capteur faible',  severity: 'info',      metric: 'battery',  resolved: false },
  { id: 7, ts: '2026-06-23T03:20:00Z', country: 'Brésil',   warehouse: 'WH-001', lot: 'LOT-BR-055', sensor: 'S-08', value: 24.8, threshold: 25, cause: 'Proche du seuil temp.',    severity: 'info',      metric: 'temp',     resolved: false },
]

// ─── Users ────────────────────────────────────────────────────────────────────
export const USERS: User[] = [
  { id: 'U1', name: 'Admin Siège',       email: 'admin@futurekawa.com',    role: 'siege',                   active: true,  lastLogin: '2026-06-23T08:00:00Z' },
  { id: 'U2', name: 'Marie Dupont',      email: 'marie@futurekawa.com',    role: 'responsable_exploitation', active: true,  lastLogin: '2026-06-23T07:30:00Z', country: 'Brésil' },
  { id: 'U3', name: 'Carlos Méndez',     email: 'carlos@futurekawa.com',   role: 'responsable_entrepot',     active: true,  lastLogin: '2026-06-22T15:00:00Z', country: 'Colombie' },
  { id: 'U4', name: 'Aïcha Toure',       email: 'aicha@futurekawa.com',    role: 'qualite',                  active: false, lastLogin: '2026-06-20T10:00:00Z', country: 'Éthiopie' },
  { id: 'U5', name: 'Diego Reyes',       email: 'diego@futurekawa.com',    role: 'supply_chain',             active: true,  lastLogin: '2026-06-23T06:45:00Z', country: 'Équateur' },
]

// ─── Notifications ────────────────────────────────────────────────────────────
export const NOTIFICATIONS: Notification[] = [
  { id: 'N1', ts: '2026-06-23T09:00:00Z', title: 'Alerte critique — WH-001',     body: 'Température à 28.4°C (seuil 25°C) dans WH-001.',     type: 'alert',  read: false, severity: 'critical'  },
  { id: 'N2', ts: '2026-06-23T08:45:00Z', title: 'Capteur S-03 hors seuil',      body: 'Surchauffe détectée dans WH-002 (Colombie).',        type: 'alert',  read: false, severity: 'critical'  },
  { id: 'N3', ts: '2026-06-23T08:10:00Z', title: 'Humidité élevée — LOT-BR-038', body: 'Humidité à 78% (seuil 70%) — lot à surveiller.',     type: 'alert',  read: true,  severity: 'important' },
  { id: 'N4', ts: '2026-06-23T07:00:00Z', title: 'Mise à jour système',           body: 'FutureKawa v1.2.0 déployée avec succès.',             type: 'system', read: true  },
  { id: 'N5', ts: '2026-06-23T06:00:00Z', title: 'WH-003 hors ligne',             body: 'Entrepôt W-003 (Équateur) injoignable depuis 3h.',    type: 'alert',  read: false, severity: 'important' },
  { id: 'N6', ts: '2026-06-22T18:00:00Z', title: 'Rapport journalier disponible', body: 'Le rapport du 22/06 est prêt à télécharger.',         type: 'info',   read: true  },
  { id: 'N7', ts: '2026-06-22T14:00:00Z', title: 'Nouveau lot enregistré',        body: 'LOT-BR-055 ajouté dans WH-005 (Brésil).',            type: 'info',   read: true  },
]
