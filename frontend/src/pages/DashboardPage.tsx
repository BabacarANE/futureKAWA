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
import LineChartCard from '../components/ui/LineChartCard'
import AlertsPieChart from '../components/ui/AlertsPieChart'

const COUNTRY_META: Record<string, { label: string; color: string }> = {
  BR: { label: 'Brésil',    color: '#D9A15E' },
  CO: { label: 'Colombie',  color: '#FF9800' },
  EC: { label: 'Équateur',  color: '#EF4444' },
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)   return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}j`
}

const ALERT_TYPE_LABEL: Record<string, string> = {
  out_of_range: 'Hors plage',
  expired_lot:  'Lot expiré',
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const isSiege = user?.role === 'siege' || user?.role === 'admin'
  const lockedCountry = isSiege ? null : (user?.country_code ?? 'BR')
  const initialCountry = lockedCountry ?? searchParams.get('country') ?? 'BR'
  const [country,   setCountry]   = useState(initialCountry)
  const [lots,      setLots]      = useState<Lot[]>([])
  const [alerts,    setAlerts]    = useState<Alert[]>([])
  const [query,     setQuery]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [showModal, setShowModal] = useState(false)

  const canCreateLot =
    user?.role === 'responsable_exploitation' || user?.role === 'responsable_entrepot'

  const fetchData = useCallback(() => {
    setLoading(true)
    Promise.all([getCountryLots(country), getCountryAlerts(country)])
      .then(([l, a]) => { setLots(l); setAlerts(a) })
      .finally(() => setLoading(false))
  }, [country])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { if (country) setSearchParams({ country }) }, [country, setSearchParams])

  const filteredLots = useMemo(() => {
    if (!query.trim()) return lots
    const q = query.toLowerCase()
    return lots.filter(l =>
      l.id.toLowerCase().includes(q) ||
      String(l.warehouse_id).includes(q)
    )
  }, [lots, query])

  const totalLots        = lots.length
  const activeWarehouses = Array.from(new Set(lots.map(l => l.warehouse_id))).length
  const alertsCount      = alerts.length
  const expiringSoon     = lots.filter(l => l.status === 'expired').length

  // Pas de mesures IoT pour l'instant — séries vides
  const tempSeries: { label: string; value: number }[] = []
  const humSeries:  { label: string; value: number }[] = []

  // Stocks par entrepôt (lots chargés pour le pays sélectionné)
  const stockByWarehouse = useMemo(() => {
    const counts: Record<number, number> = {}
    lots.forEach(l => { counts[l.warehouse_id] = (counts[l.warehouse_id] ?? 0) + 1 })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id, count]) => ({ id: Number(id), count }))
  }, [lots])

  // Stocks par pays (indicateurs comparatifs sur le pays courant)
  const stockByCountry = Object.entries(COUNTRY_META).map(([code, meta]) => ({
    code, label: meta.label, color: meta.color,
    value: code === country ? lots.length : 0,
  }))

  // Alertes par type (champs réels : a.type)
  const alertsByLevel = [
    { name: 'Hors plage',   value: alerts.filter(a => a.type === 'out_of_range').length, color: '#EF4444' },
    { name: 'Lot expiré',   value: alerts.filter(a => a.type === 'expired_lot').length,  color: '#F59E0B' },
  ]

  // Alertes critiques = hors plage (le type le plus urgent disponible)
  const criticalAlerts = alerts
    .filter(a => a.type === 'out_of_range')
    .slice(0, 5)
    .map(a => ({ id: String(a.id), message: a.message }))

  // Timeline d'activité = vraies alertes triées par date
  const timelineItems = alerts
    .slice()
    .sort((a, b) => new Date(b.triggered_at).getTime() - new Date(a.triggered_at).getTime())
    .slice(0, 8)
    .map(a => ({
      id:    String(a.id),
      time:  timeAgo(a.triggered_at),
      title: `${ALERT_TYPE_LABEL[a.type] ?? a.type} — Entrepôt #${a.warehouse_id}`,
      desc:  a.message,
    }))

  return (
    <div className="min-h-full bg-[#FAF7F2] dark:bg-coffee-950 transition-colors">
      <div className="space-y-6 p-6 max-w-[1600px] mx-auto">

        {/* ── Header ── */}
        <header className="flex items-center gap-3 flex-wrap">
          {isSiege
            ? <CountrySelector selected={country} onChange={setCountry} />
            : <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-coffee-900/40 border border-coffee-900/10 dark:border-white/10 text-sm font-medium text-coffee-900 dark:text-coffee-50">
                {country === 'BR' ? '🇧🇷 Brésil' : country === 'EC' ? '🇪🇨 Équateur' : '🇨🇴 Colombie'}
              </span>
          }

          <div className="relative">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher lots, entrepôts..."
              className="pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-coffee-900/40
                         border border-coffee-900/10 dark:border-white/10
                         w-72 sm:w-80 text-sm text-coffee-900 dark:text-coffee-50
                         placeholder:text-coffee-700/40 dark:placeholder:text-coffee-200/30
                         focus:outline-none focus:ring-2 focus:ring-coffee-300 transition-colors"
            />
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-700/40 dark:text-coffee-200/35" />
          </div>

          {loading && (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-coffee-300 border-t-coffee-700" />
          )}

          {canCreateLot && (
            <button
              onClick={() => setShowModal(true)}
              className="ml-auto flex items-center gap-1.5 bg-coffee-700 hover:bg-coffee-600
                         text-white px-3.5 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <Plus size={15} />
              Nouveau lot
            </button>
          )}
        </header>

        {/* ── KPI grid ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard
            title="Nombre total de lots"
            value={<span className="text-2xl">{totalLots}</span>}
            icon={<Package size={16} />}
          />
          <KpiCard
            title="Entrepôts actifs"
            value={<span className="text-2xl">{activeWarehouses}</span>}
            icon={<Warehouse size={16} />}
          />
          <KpiCard
            title="Alertes en cours"
            value={<span className="text-2xl text-amber-600 dark:text-amber-400">{alertsCount}</span>}
            icon={<AlertTriangle size={16} />}
          />
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
          <KpiCard
            title="Lots expirés"
            value={<span className="text-2xl text-red-600 dark:text-red-400">{expiringSoon}</span>}
            icon={<Clock4 size={16} />}
          />
        </section>

        {/* ── Grille principale ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <LineChartCard
              title="Évolution température"
              subtitle="En attente de données IoT"
              data={tempSeries}
              color="#1F8A4D"
              unit="°C"
            />
            <LineChartCard
              title="Évolution humidité"
              subtitle="En attente de données IoT"
              data={humSeries}
              color="#3B82F6"
              unit="%"
            />

            {/* Stocks par entrepôt — données réelles */}
            <div className="bg-white dark:bg-coffee-900 border border-coffee-900/8 dark:border-white/8 rounded-2xl p-4 shadow-card dark:shadow-card-dark">
              <h3 className="text-base font-semibold text-coffee-900 dark:text-coffee-50 mb-3">
                Stocks par entrepôt — {COUNTRY_META[country]?.label ?? country}
              </h3>
              {stockByWarehouse.length === 0 ? (
                <p className="text-sm text-coffee-700/40 dark:text-coffee-200/35">Aucun lot enregistré</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {stockByWarehouse.map(({ id, count }) => {
                    const pct = totalLots > 0 ? Math.round(count / totalLots * 100) : 0
                    return (
                      <div key={id} className="flex items-center gap-3">
                        <span className="text-xs text-coffee-700/60 dark:text-coffee-200/50 w-24 shrink-0">
                          Entrepôt #{id}
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-coffee-100 dark:bg-coffee-800 overflow-hidden">
                          <div className="h-full rounded-full bg-coffee-700 dark:bg-coffee-400 transition-all"
                               style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-coffee-700/80 dark:text-coffee-200/70 w-14 text-right shrink-0">
                          {count} lot{count > 1 ? 's' : ''} ({pct}%)
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Stocks par pays */}
            <div className="bg-white dark:bg-coffee-900 border border-coffee-900/8 dark:border-white/8 rounded-2xl p-4 shadow-card dark:shadow-card-dark">
              <h3 className="text-base font-semibold text-coffee-900 dark:text-coffee-50 mb-3">Stocks par pays</h3>
              <div className="flex flex-col gap-2">
                {stockByCountry.map(c => (
                  <CountryIndicator
                    key={c.code}
                    code={c.code}
                    label={c.label}
                    color={c.color}
                    value={c.value}
                  />
                ))}
              </div>
              <p className="text-xs text-coffee-700/30 dark:text-coffee-200/25 mt-2">
                Changez le pays via le sélecteur pour comparer
              </p>
            </div>

            <div className="bg-white dark:bg-coffee-900 border border-coffee-900/8 dark:border-white/8 rounded-2xl p-4 shadow-card dark:shadow-card-dark">
              <h3 className="text-base font-semibold text-coffee-900 dark:text-coffee-50 mb-3">Répartition des alertes</h3>
              <AlertsPieChart data={alertsByLevel} />
            </div>
          </div>

          <aside className="space-y-4">
            <CriticalAlerts items={criticalAlerts} />

            <div className="bg-white dark:bg-coffee-900 border border-coffee-900/8 dark:border-white/8 rounded-2xl p-4 shadow-card dark:shadow-card-dark">
              <h3 className="text-sm font-semibold text-coffee-900 dark:text-coffee-50 mb-3">Derniers lots</h3>
              <LotsTable
                lots={filteredLots.slice(0, 5)}
                countryCode={country}
                onRowClick={() => {}}
              />
            </div>

            <ActivityTimeline items={timelineItems} />
          </aside>
        </div>
      </div>

      {showModal && (
        <NewLotModal
          countryCode={country}
          onClose={() => setShowModal(false)}
          onCreated={fetchData}
        />
      )}
    </div>
  )
}
