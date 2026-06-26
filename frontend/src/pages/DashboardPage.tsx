import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Plus, Thermometer, Droplets, Package, Warehouse, AlertTriangle, Clock4 } from 'lucide-react'
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
import UserMenu from '../components/ui/UserMenu'
import NotificationsMenu from '../components/ui/NotificationsMenu'
import ThemeToggle from '../components/ui/ThemeToggle'
import LineChartCard from '../components/ui/LineChartCard'
import StockBarChart from '../components/ui/StockBarChart'
import AlertsPieChart from '../components/ui/AlertsPieChart'

const COUNTRY_META: Record<string, { label: string; color: string }> = {
  BR: { label: 'Brésil', color: '#D9A15E' },
  CO: { label: 'Colombie', color: '#FF9800' },
  EC: { label: 'Equateur', color: '#EF4444' },
}

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
    if (country) setSearchParams({ country })
  }, [country, setSearchParams])

  const filteredLots = useMemo(() => {
    if (!query.trim()) return lots
    const q = query.toLowerCase()
    return lots.filter(l =>
      String((l as any).reference ?? l.id).toLowerCase().includes(q) ||
      String(l.warehouse_id).toLowerCase().includes(q)
    )
  }, [lots, query])

  const totalLots = lots.length
  const activeWarehouses = Array.from(new Set(lots.map(l => l.warehouse_id))).length
  const alertsCount = alerts.length
  const expiringSoon = lots.filter(l => {
    const e = (l as any).expiry_date || (l as any).expiry || null
    if (!e) return false
    const days = Math.floor((new Date(e).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days >= 0 && days <= 14
  }).length

  // Séries vides par défaut — branchera sur l'API température/humidité réelle quand elle existera
  const tempSeries: { label: string; value: number }[] = []
  const humSeries: { label: string; value: number }[] = []

  const stockByCountry = Object.entries(COUNTRY_META).map(([code, meta]) => ({
    code,
    label: meta.label,
    color: meta.color,
    value: lots.filter(l => (l as any).country_code === code).length,
  }))

  const alertsByLevel = [
    { name: 'Critique', value: alerts.filter(a => (a as any).level === 'critical').length, color: '#EF4444' },
    { name: 'Avertissement', value: alerts.filter(a => (a as any).level === 'warning').length, color: '#F59E0B' },
    { name: 'Info', value: alerts.filter(a => (a as any).level === 'info').length, color: '#7A4528' },
  ]

  const criticalAlerts = alerts
    .filter(a => (a as any).level === 'critical')
    .map(a => ({ id: String(a.id), message: String((a as any).message ?? 'Alerte') }))

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-coffee-950 transition-colors">
      <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <CountrySelector selected={country} onChange={setCountry} />

            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher lots, entrepôts..."
                className="pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-coffee-900/40 border border-coffee-900/10 dark:border-white/10
                           w-72 sm:w-80 text-sm text-coffee-900 dark:text-coffee-50 placeholder:text-coffee-700/40 dark:placeholder:text-coffee-200/30
                           focus:outline-none focus:ring-2 focus:ring-coffee-300 transition-colors"
              />
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-700/40 dark:text-coffee-200/35" />
            </div>

            {loading && (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-coffee-300 border-t-coffee-700" />
            )}
          </div>

          {/* Zone utilisateur — ancrée à droite */}
          <div className="flex items-center gap-2 ml-auto">
            {canCreateLot && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 bg-coffee-700 hover:bg-coffee-600 text-white px-3.5 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <Plus size={15} />
                Nouveau lot
              </button>
            )}
            <NotificationsMenu alerts={alerts} />
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        {/* KPI grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard title="Nombre total de lots" value={<span className="text-2xl">{totalLots}</span>} icon={<Package size={16} />} />
          <KpiCard title="Entrepôts actifs" value={<span className="text-2xl">{activeWarehouses}</span>} icon={<Warehouse size={16} />} />
          <KpiCard title="Alertes en cours" value={<span className="text-2xl text-amber-600 dark:text-amber-400">{alertsCount}</span>} icon={<AlertTriangle size={16} />} />
          <KpiCard
            title="Température moyenne"
            icon={<Thermometer size={16} />}
            value={
              tempSeries.length > 0 ? (
                <>
                  <span className="text-2xl">{tempSeries[tempSeries.length - 1].value}°C</span>
                  <MiniChart data={tempSeries.map(d => d.value)} color="#1F8A4D" />
                </>
              ) : (
                <span className="text-sm text-coffee-700/40 dark:text-coffee-200/35">Pas de capteur connecté</span>
              )
            }
          />
          <KpiCard
            title="Humidité moyenne"
            icon={<Droplets size={16} />}
            value={
              humSeries.length > 0 ? (
                <>
                  <span className="text-2xl">{humSeries[humSeries.length - 1].value}%</span>
                  <MiniChart data={humSeries.map(d => d.value)} color="#1F8A4D" />
                </>
              ) : (
                <span className="text-sm text-coffee-700/40 dark:text-coffee-200/35">Pas de capteur connecté</span>
              )
            }
          />
          <KpiCard title="Lots expirant bientôt" value={<span className="text-2xl text-red-600 dark:text-red-400">{expiringSoon}</span>} icon={<Clock4 size={16} />} />
        </section>

        {/* Main grid: left charts + right panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <LineChartCard title="Evolution température" subtitle="Derniers 30 jours" data={tempSeries} color="#1F8A4D" unit="°C" />
            <LineChartCard title="Evolution humidité" subtitle="Derniers 30 jours" data={humSeries} color="#3B82F6" unit="%" />

            <div className="bg-white dark:bg-coffee-900 border border-coffee-900/8 dark:border-white/8 rounded-2xl p-4 shadow-card dark:shadow-card-dark">
              <h3 className="text-base font-semibold text-coffee-900 dark:text-coffee-50 mb-3">Stocks par pays</h3>
              <div className="flex flex-col sm:flex-row gap-4 items-stretch">
               
                <div className="sm:w-48 flex flex-col gap-1 justify-center">
                  {stockByCountry.map(c => (
                    <CountryIndicator key={c.code} code={c.code} label={c.label} color={c.color} value={c.value} />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-coffee-900 border border-coffee-900/8 dark:border-white/8 rounded-2xl p-4 shadow-card dark:shadow-card-dark">
              <h3 className="text-base font-semibold text-coffee-900 dark:text-coffee-50 mb-3">Répartition des alertes</h3>
              <AlertsPieChart data={alertsByLevel} />
            </div>
          </div>

          <aside className="space-y-4">
            <CriticalAlerts items={criticalAlerts} />

            <div className="bg-white dark:bg-coffee-900 border border-coffee-900/8 dark:border-white/8 rounded-2xl p-4 shadow-card dark:shadow-card-dark">
              <h3 className="text-sm font-semibold text-coffee-900 dark:text-coffee-50 mb-3">Derniers lots enregistrés</h3>
              <LotsTable lots={filteredLots.slice(0, 5)} countryCode={country} onRowClick={() => {}} />
            </div>

            <ActivityTimeline items={[]} />
          </aside>
        </div>
      </div>

      {showModal && (
        <NewLotModal countryCode={country} onClose={() => setShowModal(false)} onCreated={fetchData} />
      )}
    </div>
  )
}
