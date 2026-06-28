import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, RefreshCw, Package, Thermometer, Droplets, AlertTriangle, MapPin, Building2, Globe2, Clock } from 'lucide-react'
import {
  getAllWarehouses, getWarehouseMeasures, getWarehouseAlerts,
  getCountryLots, getExploitationsByCountry,
} from '../services/api'
import type { Warehouse, Exploitation } from '../services/api'
import type { Lot, Alert, Measure } from '../types'

const COUNTRY_LABELS: Record<string, string> = { BR: '🇧🇷 Brésil', EC: '🇪🇨 Équateur', CO: '🇨🇴 Colombie' }

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  compliant: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Conforme'  },
  alert:     { bg: 'bg-amber-50',   text: 'text-amber-700',   label: 'Alerte'    },
  expired:   { bg: 'bg-red-50',     text: 'text-red-700',     label: 'Expiré'    },
}

function KpiTile({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white dark:bg-[#1c1a17] rounded-xl border border-stone-100 dark:border-white/8 p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-stone-50 dark:bg-white/5 flex items-center justify-center text-stone-400 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-stone-500 dark:text-stone-400">{label}</p>
        <p className="text-xl font-bold text-stone-900 dark:text-stone-50">{value}</p>
        {sub && <p className="text-[11px] text-stone-400">{sub}</p>}
      </div>
    </div>
  )
}

function MiniSparkline({ data, color = '#7a4528' }: { data: number[]; color?: string }) {
  if (data.length < 2) return <span className="text-stone-300 text-xs">—</span>
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1
  const w = 80, h = 28
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" points={pts.join(' ')} />
    </svg>
  )
}

export default function WarehouseViewPage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const wId      = Number(id)

  const [warehouse,    setWarehouse]    = useState<Warehouse | null>(null)
  const [exploitation, setExploitation] = useState<Exploitation | null>(null)
  const [lots,         setLots]         = useState<Lot[]>([])
  const [measures,     setMeasures]     = useState<Measure[]>([])
  const [alerts,       setAlerts]       = useState<Alert[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      // 1. Trouver l'entrepôt et son pays dans la liste globale
      const allWh = await getAllWarehouses()
      const wh    = allWh.find(w => w.id === wId)
      if (!wh) { setError('Entrepôt introuvable'); setLoading(false); return }
      setWarehouse(wh)

      const code = wh.country_code ?? 'BR'

      // 2. Charger tout en parallèle
      const [measRes, alertRes, lotsRes, exploRes] = await Promise.allSettled([
        getWarehouseMeasures(code, wId),
        getWarehouseAlerts(code, wId),
        getCountryLots(code),
        getExploitationsByCountry(code),
      ])

      if (measRes.status  === 'fulfilled') setMeasures(measRes.value)
      if (alertRes.status === 'fulfilled') setAlerts(alertRes.value)
      if (lotsRes.status  === 'fulfilled')
        setLots(lotsRes.value.filter(l => l.warehouse_id === wId))
      if (exploRes.status === 'fulfilled')
        setExploitation(exploRes.value.find(e => e.id === wh.exploitation_id) ?? null)
    } catch {
      setError('Impossible de charger les données')
    } finally {
      setLoading(false)
    }
  }, [wId])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Stats calculées
  const latestMeasure  = measures.length > 0 ? measures[measures.length - 1] : null
  const avgTemp        = measures.length > 0 ? measures.reduce((s, m) => s + m.temperature, 0) / measures.length : null
  const avgHumidity    = measures.length > 0 ? measures.reduce((s, m) => s + m.humidity,    0) / measures.length : null
  const tempSeries     = measures.slice(-20).map(m => m.temperature)
  const humSeries      = measures.slice(-20).map(m => m.humidity)
  const lotStats = {
    total:     lots.length,
    compliant: lots.filter(l => l.status === 'compliant').length,
    alert:     lots.filter(l => l.status === 'alert').length,
    expired:   lots.filter(l => l.status === 'expired').length,
  }

  const code = warehouse?.country_code ?? 'BR'

  if (loading) return (
    <div className="p-6 space-y-4">
      {[1,2,3,4].map(i => (
        <div key={i} className="h-28 rounded-2xl bg-stone-100 dark:bg-white/5 animate-pulse" />
      ))}
    </div>
  )

  if (error || !warehouse) return (
    <div className="p-6">
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 text-sm flex items-center gap-3">
        <AlertTriangle size={16} />
        {error ?? 'Entrepôt introuvable'}
        <button onClick={() => navigate(-1)} className="ml-auto underline">Retour</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-5 p-0">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-stone-200 dark:border-white/10
                       bg-white dark:bg-[#1c1a17] text-stone-500 dark:text-stone-300
                       hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-stone-900 dark:text-stone-50">{warehouse.name}</h1>
            <p className="text-xs text-stone-400 mt-0.5">
              {COUNTRY_LABELS[code] ?? code} · ID #{warehouse.id}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll}
            className="h-9 px-3 flex items-center gap-1.5 rounded-lg border border-stone-200 dark:border-white/10
                       bg-white dark:bg-[#1c1a17] text-sm text-stone-600 dark:text-stone-300
                       hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
            <RefreshCw size={13} /> Actualiser
          </button>
          <button onClick={() => navigate(`/warehouses/${wId}/edit`)}
            className="h-9 px-3 flex items-center gap-1.5 rounded-lg
                       bg-[#7a4528] hover:bg-[#6a3a20] text-white text-sm font-medium transition-colors">
            <Pencil size={13} /> Modifier
          </button>
        </div>
      </div>

      {/* ── KPI bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiTile icon={<Package size={18} />}     label="Lots stockés"     value={lotStats.total} />
        <KpiTile icon={<AlertTriangle size={18} />} label="Alertes actives" value={alerts.length}
          sub={alerts.length === 0 ? 'Aucune alerte' : undefined} />
        <KpiTile icon={<Thermometer size={18} />} label="Température moy."
          value={avgTemp !== null ? `${avgTemp.toFixed(1)} °C` : '—'}
          sub={latestMeasure ? `Dernière : ${latestMeasure.temperature} °C` : 'Pas de capteur'} />
        <KpiTile icon={<Droplets size={18} />}    label="Humidité moy."
          value={avgHumidity !== null ? `${avgHumidity.toFixed(1)} %` : '—'}
          sub={latestMeasure ? `Dernière : ${latestMeasure.humidity} %` : 'Pas de capteur'} />
      </div>

      {/* ── Corps : 2 colonnes ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Colonne gauche — infos ── */}
        <div className="space-y-4">

          {/* Fiche entrepôt */}
          <div className="bg-white dark:bg-[#1c1a17] rounded-2xl border border-stone-100 dark:border-white/8 p-5">
            <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100 mb-4">Informations</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin size={14} className="text-stone-400 mt-0.5 shrink-0" />
                <div>
                  <dt className="text-xs text-stone-400">Localisation</dt>
                  <dd className="font-medium text-stone-800 dark:text-stone-100">
                    {warehouse.location ?? <span className="text-stone-300 italic">Non renseignée</span>}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe2 size={14} className="text-stone-400 mt-0.5 shrink-0" />
                <div>
                  <dt className="text-xs text-stone-400">Pays</dt>
                  <dd className="font-medium text-stone-800 dark:text-stone-100">{COUNTRY_LABELS[code] ?? code}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 size={14} className="text-stone-400 mt-0.5 shrink-0" />
                <div>
                  <dt className="text-xs text-stone-400">Exploitation</dt>
                  <dd className="font-medium text-stone-800 dark:text-stone-100">
                    {exploitation
                      ? `${exploitation.name}${exploitation.city ? ` · ${exploitation.city}` : ''}`
                      : `#${warehouse.exploitation_id}`}
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          {/* Répartition lots */}
          <div className="bg-white dark:bg-[#1c1a17] rounded-2xl border border-stone-100 dark:border-white/8 p-5">
            <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100 mb-4">Répartition des lots</h2>
            {lotStats.total === 0 ? (
              <p className="text-xs text-stone-400 text-center py-4">Aucun lot dans cet entrepôt</p>
            ) : (
              <div className="space-y-2.5">
                {[
                  { label: 'Conformes', value: lotStats.compliant, color: '#10b981' },
                  { label: 'En alerte', value: lotStats.alert,     color: '#f59e0b' },
                  { label: 'Expirés',   value: lotStats.expired,   color: '#ef4444' },
                ].map(({ label, value, color }) => {
                  const pct = Math.round(value / lotStats.total * 100)
                  return (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-stone-600 dark:text-stone-400">{label}</span>
                        <span className="font-semibold text-stone-800 dark:text-stone-200">{value} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-stone-100 dark:bg-white/8 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Capteurs IoT */}
          <div className="bg-white dark:bg-[#1c1a17] rounded-2xl border border-stone-100 dark:border-white/8 p-5">
            <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100 mb-4">Capteurs IoT</h2>
            {measures.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-4">📡 En attente de données IoT</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-500">🌡 Température</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">{latestMeasure?.temperature} °C</span>
                  </div>
                  <MiniSparkline data={tempSeries} color="#ef4444" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-500">💧 Humidité</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">{latestMeasure?.humidity} %</span>
                  </div>
                  <MiniSparkline data={humSeries} color="#3b82f6" />
                </div>
                <p className="text-[11px] text-stone-400">
                  {measures.length} mesure{measures.length > 1 ? 's' : ''} · Dernière&nbsp;
                  {latestMeasure ? new Date(latestMeasure.timestamp).toLocaleString('fr-FR', { dateStyle:'short', timeStyle:'short' }) : '—'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Colonne droite — lots + alertes ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Liste des lots */}
          <div className="bg-white dark:bg-[#1c1a17] rounded-2xl border border-stone-100 dark:border-white/8 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                Lots stockés <span className="ml-1 text-stone-400 font-normal">({lots.length})</span>
              </h2>
              <button onClick={() => navigate(`/lots?country=${code}`)}
                className="text-xs text-[#7a4528] hover:underline underline-offset-2">
                Voir tous les lots →
              </button>
            </div>

            {lots.length === 0 ? (
              <div className="py-10 text-center text-stone-400">
                <Package size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucun lot enregistré dans cet entrepôt</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 dark:border-white/8 text-xs text-stone-400 uppercase tracking-wide">
                      <th className="text-left py-2 pr-4 font-medium">Référence</th>
                      <th className="text-left py-2 pr-4 font-medium">Date stockage</th>
                      <th className="text-left py-2 pr-4 font-medium">Âge</th>
                      <th className="text-left py-2 pr-4 font-medium">Statut</th>
                      <th className="text-left py-2 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lots.map(lot => {
                      const age = lot.storage_date
                        ? Math.floor((Date.now() - new Date(lot.storage_date).getTime()) / 86400000)
                        : null
                      const badge = STATUS_BADGE[lot.status] ?? { bg: 'bg-stone-100', text: 'text-stone-600', label: lot.status }
                      return (
                        <tr key={lot.id}
                          onClick={() => navigate(`/lots/${code}/${encodeURIComponent(lot.id)}`)}
                          className="border-b border-stone-50 dark:border-white/5 hover:bg-stone-50 dark:hover:bg-white/3
                                     cursor-pointer transition-colors">
                          <td className="py-2.5 pr-4 font-mono text-xs font-semibold text-stone-800 dark:text-stone-100">
                            {lot.id}
                          </td>
                          <td className="py-2.5 pr-4 text-stone-500 dark:text-stone-400 whitespace-nowrap">
                            {lot.storage_date ? new Date(lot.storage_date).toLocaleDateString('fr-FR') : '—'}
                          </td>
                          <td className="py-2.5 pr-4 text-stone-400">
                            {age !== null ? `${age} j` : '—'}
                          </td>
                          <td className="py-2.5 pr-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${badge.bg} ${badge.text}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-2.5 max-w-[200px] truncate text-stone-400 text-xs">
                            {lot.quality_notes ?? <span className="italic">—</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Alertes */}
          <div className="bg-white dark:bg-[#1c1a17] rounded-2xl border border-stone-100 dark:border-white/8 p-5">
            <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100 mb-4">
              Alertes <span className="ml-1 text-stone-400 font-normal">({alerts.length})</span>
            </h2>

            {alerts.length === 0 ? (
              <div className="py-6 text-center text-stone-400">
                <div className="text-2xl mb-1">✓</div>
                <p className="text-sm">Aucune alerte active — entrepôt conforme</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map(a => (
                  <div key={a.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-800/30">
                    <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">
                        {a.type === 'out_of_range' ? 'Mesure hors plage' : 'Lot expiré'}
                        {a.lot_id && <span className="ml-2 font-normal text-red-600 dark:text-red-400 text-xs">· {a.lot_id}</span>}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{a.message}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 text-[11px] text-red-400">
                      <Clock size={11} />
                      {new Date(a.triggered_at).toLocaleString('fr-FR', { dateStyle:'short', timeStyle:'short' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
