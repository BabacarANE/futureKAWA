import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import CountrySelector from '../components/CountrySelector'
import LotsTable from '../components/LotsTable'
import NewLotModal from '../components/NewLotModal'
import { getCountryLots, getCountryAlerts } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { Lot, Alert } from '../types'
import KpiCard from '../components/ui/KpiCard'
import MiniChart from '../components/ui/MiniChart'
import CountryIndicator from '../components/ui/CountryIndicator'
import CriticalAlerts from '../components/ui/CriticalAlerts'
import ActivityTimeline from '../components/ui/ActivityTimeline'

export default function DashboardPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCountry = searchParams.get('country') ?? 'BR'
  const [country, setCountry] = useState(initialCountry)
  const [lots, setLots] = useState<Lot[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [dark, setDark] = useState(false)

  const canCreateLot = user?.role === 'responsable_exploitation' || user?.role === 'responsable_entrepot'

  const fetchData = useCallback(() => {
    setLoading(true)
    Promise.all([
      getCountryLots(country),
      getCountryAlerts(country),
    ])
      .then(([l, a]) => {
        setLots(l)
        setAlerts(a)
      })
      .finally(() => setLoading(false))
  }, [country])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    // keep URL in sync with selected country
    if (country) setSearchParams({ country })
  }, [country, setSearchParams])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const totalLots = lots.length
  const activeWarehouses = Array.from(new Set(lots.map(l => l.warehouse_id))).length
  const alertsCount = alerts.length
  const tempAvg = 24.3
  const humidityAvg = 56
  const expiringSoon = lots.filter(l => {
    const e = (l as any).expiry_date || (l as any).expiry || null
    if (!e) return false
    const days = Math.floor((new Date(e).getTime() - Date.now())/(1000*60*60*24))
    return days >= 0 && days <= 14
  }).length

  // dummy chart data
  const tempSeries = [22,23,24,25,24,26,25,24,23,24]
  const humSeries = [55,56,54,58,57,56,55,54,53,55]

  return (
    <div className={`space-y-6 p-6`}> 
      {/* Header */}
      <header className="flex items-center justify-between">

        <div className="flex items-center gap-3">
          <CountrySelector selected={country} onChange={setCountry} />
          <div className="relative">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher lots, entrepôts..."
              className="pl-9 pr-3 py-2 rounded-xl bg-white border border-gray-200 w-80 text-sm" />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
          <button className="p-2 rounded-lg bg-white border border-gray-100">🔔</button>
          <button onClick={() => setDark(d => !d)} className="p-2 rounded-lg bg-white border border-gray-100">🌙</button>
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-100">
            <div className="w-8 h-8 rounded-full bg-coffee-700 text-white flex items-center justify-center">JD</div>
            <div className="text-sm">
              <div className="font-medium">{user?.name ?? 'Admin'}</div>
              <div className="text-xs text-gray-500">{user?.role ?? 'siege'}</div>
            </div>
          </div>
          {canCreateLot && (
            <button onClick={() => setShowModal(true)} className="ml-2 bg-coffee-700 text-white px-3 py-2 rounded-lg">Nouveau lot</button>
          )}
          {loading && <div className="ml-2 animate-spin rounded-full h-5 w-5 border-b-2 border-coffee-500" />}
        </div>
      </header>

      {/* KPI grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard title="Nombre total de lots" value={<span className="text-2xl">{totalLots}</span>} />
        <KpiCard title="Entrepôts actifs" value={<span>{activeWarehouses}</span>} />
        <KpiCard title="Alertes en cours" value={<span className="text-amber-600">{alertsCount}</span>} />
        <KpiCard title="Température moyenne" value={<><span className="text-2xl">{tempAvg}°C</span><MiniChart data={tempSeries} color="#1F8A4D" /></>} />
        <KpiCard title="Humidité moyenne" value={<><span className="text-2xl">{humidityAvg}%</span><MiniChart data={humSeries} color="#1F8A4D" /></>} />
        <KpiCard title="Lots expirant bientôt" value={<span className="text-red-600">{expiringSoon}</span>} />
      </section>

      {/* Main grid: left charts + right panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Evolution température</h3>
              <div className="text-sm text-gray-500">Derniers 30 jours</div>
            </div>
            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">[Graph Température - placeholder]</div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Evolution humidité</h3>
              <div className="text-sm text-gray-500">Derniers 30 jours</div>
            </div>
            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">[Graph Humidité - placeholder]</div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Stocks par pays</h3>
            <div className="flex gap-4 items-center">
              <div className="flex-1 h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">[Chart Stocks]</div>
              <div className="w-48 space-y-2">
                <CountryIndicator code="BR" label="Brésil" color="#1F8A4D" />
                <CountryIndicator code="CO" label="Colombie" color="#FF9800" />
                <CountryIndicator code="EC" label="Equateur" color="#EF4444" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Répartition des alertes</h3>
            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">[Pie Chart - Alerts]</div>
          </div>
        </div>

        <aside className="space-y-4">
          <CriticalAlerts items={alerts.filter(a => (a as any).level === 'critical').map(a => ({ id: String(a.id), message: String((a as any).message ?? 'Alerte') }))} />

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold mb-3">Derniers lots enregistrés</h3>
            <LotsTable lots={lots.slice(0,5)} countryCode={country} onRowClick={() => {}} />
          </div>

          <ActivityTimeline items={[{ id: '1', time: '10m', title: 'Capteur A - Température élevée', desc: 'Brésil — Entrepôt 12' }, { id: '2', time: '45m', title: 'Lot XYZ enregistré', desc: 'Colombie — Entrepôt 3' }]} />

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold mb-3">Timeline</h3>
            <div className="text-sm text-gray-500">Historique des opérations récentes</div>
          </div>
        </aside>
      </div>
      {showModal && (
        <NewLotModal countryCode={country} onClose={() => setShowModal(false)} onCreated={fetchData} />
      )}
    </div>
  )
}
