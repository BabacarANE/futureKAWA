import { useEffect, useState } from 'react'
import AlertsGroup from '../components/Supervision/AlertsGroup'

type Alert = {
  id?: string | number
  ts?: string
  country?: string
  warehouse?: string
  lot?: string
  sensor?: string
  value?: number | string
  threshold?: number | string
  cause?: string
  severity?: 'critical' | 'important' | 'info'
  metric?: 'temp' | 'humidity' | string
}

export default function SupervisionPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAlerts = () => {
    setLoading(true)
    fetch('/alerts')
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.items ?? []
        setAlerts(arr)
      })
      .catch(() => {
        setAlerts([
          { id: 1, ts: new Date().toISOString(), country: 'BR', warehouse: 'W-001', lot: 'LOT-123', sensor: 'S-1', value: '28.4°C', threshold: '25°C', cause: 'Température critique', severity: 'critical', metric: 'temp' },
          { id: 2, ts: new Date().toISOString(), country: 'CO', warehouse: 'W-002', lot: 'LOT-45', sensor: 'S-3', value: '82%', threshold: '75%', cause: 'Humidité élevée', severity: 'critical', metric: 'humidity' },
          { id: 3, ts: new Date().toISOString(), country: 'EC', warehouse: 'W-003', lot: 'LOT-7', sensor: 'S-9', value: '22.1°C', threshold: '20°C', cause: 'Seuil température dépassé', severity: 'important', metric: 'temp' },
          { id: 4, ts: new Date().toISOString(), country: 'BR', warehouse: 'W-001', lot: 'LOT-88', sensor: 'S-2', value: '68%', threshold: '70%', cause: 'Humidité basse', severity: 'important', metric: 'humidity' },
          { id: 5, ts: new Date().toISOString(), country: 'CO', warehouse: 'W-002', lot: 'LOT-11', sensor: 'S-5', value: '3.2V', threshold: '3.5V', cause: 'Batterie faible', severity: 'info', metric: 'battery' },
          { id: 6, ts: new Date().toISOString(), country: 'EC', warehouse: 'W-003', lot: 'LOT-99', sensor: 'S-7', value: '19.8°C', threshold: '18°C', cause: 'Alerte préventive temp.', severity: 'info', metric: 'temp' },
        ])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAlerts() }, [])

  const handleResolve = (a: Alert) => {
    setAlerts((prev) => prev.filter((x) => x.id !== a.id))
  }

  const critical = alerts.filter((a) => a.severity === 'critical')
  const important = alerts.filter((a) => a.severity === 'important')
  const info = alerts.filter((a) => a.severity === 'info')

  const statCards = [
    { label: 'Critiques', count: critical.length, color: 'bg-rose-500' },
    { label: 'Importantes', count: important.length, color: 'bg-amber-400' },
    { label: 'Information', count: info.length, color: 'bg-sky-500' },
  ]

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Supervision & alertes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Suivi en temps réel des conditions de stockage</p>
        </div>
        <button
          onClick={fetchAlerts}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition text-gray-700"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
          Actualiser
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map(({ label, count, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-semibold text-gray-900 leading-none mt-0.5">{count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Columns */}
      {loading ? (
        <div className="text-center text-sm text-gray-400 py-12">Chargement…</div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          <AlertsGroup title="Critiques" severity="critical" alerts={critical} onResolve={handleResolve} />
          <AlertsGroup title="Importantes" severity="important" alerts={important} onResolve={handleResolve} />
          <AlertsGroup title="Information" severity="info" alerts={info} onResolve={handleResolve} />
        </div>
      )}
    </div>
  )
}