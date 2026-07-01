import { useEffect, useState, useCallback } from 'react'
import AlertsGroup from '../components/Supervision/AlertsGroup'
import { getAllCountries } from '../services/api'

// Adapte le format backend → format attendu par AlertsGroup
function mapAlert(a: any, countryCode: string): any {
  const isTemp = a.type === 'out_of_range'
  const sev = a.type === 'expired_lot' ? 'important' : 'critical'
  return {
    id:        a.id,
    ts:        a.triggered_at,
    country:   countryCode,
    warehouse: String(a.warehouse_id),
    lot:       a.lot_id ?? undefined,
    sensor:    undefined,
    value:     undefined,
    threshold: undefined,
    cause:     a.message,
    severity:  sev,
    metric:    isTemp ? 'temp' : 'other',
  }
}

export default function SupervisionPage() {
  const [alerts,  setAlerts]  = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const fetchAlerts = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const countries = await getAllCountries()
      const all: any[] = []
      for (const c of countries) {
        const mapped = (c.alerts ?? []).map((a: any) => mapAlert(a, c.country_code))
        all.push(...mapped)
      }
      // Trier par date desc
      all.sort((a, b) => new Date(b.ts ?? 0).getTime() - new Date(a.ts ?? 0).getTime())
      setAlerts(all)
    } catch {
      setError('Impossible de charger les alertes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAlerts() }, [fetchAlerts])

  // Auto-refresh toutes les 30s
  useEffect(() => {
    const t = setInterval(fetchAlerts, 30_000)
    return () => clearInterval(t)
  }, [fetchAlerts])

  const handleResolve = (a: any) => setAlerts(prev => prev.filter(x => x.id !== a.id))

  const critical  = alerts.filter(a => a.severity === 'critical')
  const important = alerts.filter(a => a.severity === 'important')
  const info      = alerts.filter(a => a.severity === 'info')

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Supervision & alertes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Suivi en temps réel — actualisation auto 30s</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </div>
          <button onClick={fetchAlerts}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition text-gray-700">
            ↻ Actualiser
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Critiques',   count: critical.length,  color: 'bg-rose-500' },
          { label: 'Importantes', count: important.length, color: 'bg-amber-400' },
          { label: 'Information', count: info.length,      color: 'bg-sky-500' },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-semibold text-gray-900 leading-none mt-0.5">{count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm">
          ⚠ {error} <button onClick={fetchAlerts} className="ml-2 underline">Réessayer</button>
        </div>
      )}

      {/* Contenu */}
      {loading ? (
        <div className="grid grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="space-y-3">
              {[1,2].map(j => <div key={j} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          <AlertsGroup title="Critiques"   severity="critical"  alerts={critical}  onResolve={handleResolve} />
          <AlertsGroup title="Importantes" severity="important" alerts={important} onResolve={handleResolve} />
          <AlertsGroup title="Information" severity="info"      alerts={info}      onResolve={handleResolve} />
        </div>
      )}

      {!loading && alerts.length === 0 && !error && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">✓</div>
          <p className="text-sm font-medium">Aucune alerte active</p>
          <p className="text-xs mt-1">Tous les entrepôts fonctionnent normalement</p>
        </div>
      )}
    </div>
  )
}