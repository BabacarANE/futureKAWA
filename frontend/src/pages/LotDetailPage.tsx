import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Thermometer, Droplets, AlertTriangle, CheckCircle, Clock, PackageCheck, Undo2 } from 'lucide-react'
import { getLot, getCountryMeasures, getCountryAlerts, deleteLot, shipLot, unshipLot } from '../services/api'
import { useAuth } from '../context/AuthContext'
import LotEditModal from '../components/LotEditModal'
import type { Lot, Measure, Alert } from '../types'

const STATUS_CONFIG = {
  compliant: { label: 'Conforme',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',  icon: CheckCircle },
  alert:     { label: 'Alerte',    cls: 'bg-amber-50  text-amber-700  border-amber-200',       icon: AlertTriangle },
  expired:   { label: 'Expiré',    cls: 'bg-red-50    text-red-700    border-red-200',         icon: Clock },
  shipped:   { label: 'Expédié',   cls: 'bg-blue-50   text-blue-700   border-blue-200',        icon: PackageCheck },
}

function MiniSparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const w = 120, h = 36, pad = 4
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - 2 * pad)
    const y = h - pad - ((v - min) / range) * (h - 2 * pad)
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export default function LotDetailPage() {
  const { country = 'BR', id: lotId = '' } = useParams<{ country: string; id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isSiege = user?.role === 'siege' || user?.role === 'admin'

  const [lot,      setLot]      = useState<Lot | null>(null)
  const [measures, setMeasures] = useState<Measure[]>([])
  const [alerts,   setAlerts]   = useState<Alert[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [editing,  setEditing]  = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [shipping, setShipping] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const load = async () => {
    setLoading(true); setError('')
    try {
      const [lotData, measuresData, alertsData] = await Promise.all([
        getLot(country, decodeURIComponent(lotId)),
        getCountryMeasures(country).catch(() => [] as Measure[]),
        getCountryAlerts(country).catch(() => [] as Alert[]),
      ])
      setLot(lotData)
      setMeasures((measuresData as Measure[]).filter(m => m.warehouse_id === lotData.warehouse_id).slice(-20))
      setAlerts((alertsData as Alert[]).filter(a => a.warehouse_id === lotData.warehouse_id || a.lot_id === lotData.id))
    } catch {
      setError('Lot introuvable ou backend inaccessible.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [country, lotId])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteLot(country, decodeURIComponent(lotId))
      navigate('/lots', { replace: true })
    } catch (err: any) {
      alert(err?.response?.data?.detail ?? 'Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  const handleShip = async () => {
    if (!lot || !confirm(`Confirmer l'expédition du lot ${lot.id} ?`)) return
    setShipping(true)
    try {
      await shipLot(country, lot.id)
      await load()
    } catch (err: any) {
      alert(err?.response?.data?.detail ?? 'Erreur lors de l\'expédition')
    } finally {
      setShipping(false)
    }
  }

  const handleUnship = async () => {
    if (!lot || !confirm(`Annuler l'expédition du lot ${lot.id} ?`)) return
    setShipping(true)
    try {
      await unshipLot(country, lot.id)
      await load()
    } catch (err: any) {
      alert(err?.response?.data?.detail ?? 'Erreur lors de l\'annulation')
    } finally {
      setShipping(false)
    }
  }

  const age = lot?.storage_date
    ? Math.floor((Date.now() - new Date(lot.storage_date).getTime()) / 86400000)
    : null

  const statusCfg = STATUS_CONFIG[lot?.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.compliant
  const StatusIcon = statusCfg.icon
  const temps = measures.map(m => m.temperature)
  const humids = measures.map(m => m.humidity)
  const lastMeasure = measures[measures.length - 1]

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-stone-100 dark:bg-white/5 rounded-lg animate-pulse" />
      <div className="h-40 bg-stone-100 dark:bg-white/5 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-48 bg-stone-100 dark:bg-white/5 rounded-2xl animate-pulse" />
        <div className="h-48 bg-stone-100 dark:bg-white/5 rounded-2xl animate-pulse" />
      </div>
    </div>
  )

  if (error || !lot) return (
    <div className="space-y-4">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors">
        <ArrowLeft size={15} /> Retour
      </button>
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center text-red-700 dark:text-red-400">
        {error || 'Lot introuvable.'}
      </div>
    </div>
  )

  return (
    <div className="space-y-5 max-w-5xl">

      <button onClick={() => navigate('/lots')}
        className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400
                   hover:text-stone-800 dark:hover:text-stone-200 transition-colors">
        <ArrowLeft size={15} /> Retour aux lots
      </button>

      <div className="bg-white dark:bg-[#1c1a17] rounded-2xl border border-stone-100 dark:border-white/10 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">Lot · {country}</p>
            <h1 className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">{lot.id}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-stone-500 dark:text-stone-400">
              <span>Exploitation #{lot.exploitation_id}</span>
              <span>·</span>
              <span>Entrepôt #{lot.warehouse_id}</span>
              <span>·</span>
              <span>{lot.storage_date ? new Date(lot.storage_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}</span>
              {age !== null && <><span>·</span><span>{age} jour{age > 1 ? 's' : ''} de stockage</span></>}
            </div>
            {lot.shipped_at && (
              <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                📦 Expédié le {new Date(lot.shipped_at).toLocaleDateString('fr-FR')}
              </p>
            )}
            {lot.quality_notes && (
              <p className="mt-3 text-sm text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-white/5
                            rounded-lg px-3 py-2 border border-stone-100 dark:border-white/8 max-w-lg">
                {lot.quality_notes}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${statusCfg.cls}`}>
              <StatusIcon size={13} />
              {statusCfg.label}
            </span>
            {lot.status !== 'shipped' && (
              <button onClick={() => setEditing(true)} title="Modifier"
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-stone-200 dark:border-white/10
                           text-stone-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors">
                <Pencil size={15} />
              </button>
            )}
            {lot.status !== 'shipped' && (
              <button onClick={() => setConfirmDelete(true)} title="Supprimer"
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-stone-200 dark:border-white/10
                           text-stone-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                <Trash2 size={15} />
              </button>
            )}
            {isSiege && lot.status !== 'shipped' && (
              <button onClick={handleShip} disabled={shipping} title="Expédier"
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-200
                           text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30
                           transition-colors disabled:opacity-50 text-sm font-medium">
                <PackageCheck size={15} />
                {shipping ? 'En cours…' : 'Expédier'}
              </button>
            )}
            {isSiege && lot.status === 'shipped' && (
              <button onClick={handleUnship} disabled={shipping} title="Annuler l'expédition"
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-200
                           text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30
                           transition-colors disabled:opacity-50 text-sm font-medium">
                <Undo2 size={15} />
                {shipping ? 'En cours…' : 'Annuler expédition'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Données IoT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#1c1a17] rounded-2xl border border-stone-100 dark:border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-200">
              <Thermometer size={16} className="text-orange-500" /> Température
            </div>
            {lastMeasure && (
              <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                {lastMeasure.temperature.toFixed(1)}°C
              </span>
            )}
          </div>
          {temps.length > 1
            ? (
              <div className="space-y-2">
                <MiniSparkline values={temps} color="#f97316" />
                <div className="flex justify-between text-xs text-stone-400">
                  <span>Min {Math.min(...temps).toFixed(1)}°C</span>
                  <span>{measures.length} mesure{measures.length > 1 ? 's' : ''}</span>
                  <span>Max {Math.max(...temps).toFixed(1)}°C</span>
                </div>
              </div>
            )
            : <p className="text-sm text-stone-400 dark:text-stone-500 text-center py-4">Aucune mesure disponible</p>
          }
        </div>

        <div className="bg-white dark:bg-[#1c1a17] rounded-2xl border border-stone-100 dark:border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-200">
              <Droplets size={16} className="text-blue-500" /> Humidité
            </div>
            {lastMeasure && (
              <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                {lastMeasure.humidity.toFixed(1)}%
              </span>
            )}
          </div>
          {humids.length > 1
            ? (
              <div className="space-y-2">
                <MiniSparkline values={humids} color="#3b82f6" />
                <div className="flex justify-between text-xs text-stone-400">
                  <span>Min {Math.min(...humids).toFixed(1)}%</span>
                  <span>{measures.length} mesure{measures.length > 1 ? 's' : ''}</span>
                  <span>Max {Math.max(...humids).toFixed(1)}%</span>
                </div>
              </div>
            )
            : <p className="text-sm text-stone-400 dark:text-stone-500 text-center py-4">Aucune mesure disponible</p>
          }
        </div>
      </div>

      {/* Alertes */}
      <div className="bg-white dark:bg-[#1c1a17] rounded-2xl border border-stone-100 dark:border-white/10 p-5">
        <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-200 mb-3 flex items-center gap-2">
          <AlertTriangle size={15} className="text-amber-500" />
          Alertes associées
          {alerts.length > 0 && (
            <span className="ml-auto text-xs bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
              {alerts.length}
            </span>
          )}
        </h2>
        {alerts.length === 0
          ? <p className="text-sm text-stone-400 dark:text-stone-500 py-3">Aucune alerte pour cet entrepôt.</p>
          : (
            <ul className="space-y-2">
              {alerts.map(a => (
                <li key={a.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-stone-100 dark:border-white/8
                             bg-stone-50 dark:bg-white/3">
                  <AlertTriangle size={14} className={a.type === 'expired_lot' ? 'text-red-500 mt-0.5 shrink-0' : 'text-amber-500 mt-0.5 shrink-0'} />
                  <div className="min-w-0">
                    <p className="text-sm text-stone-800 dark:text-stone-200">{a.message}</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {new Date(a.triggered_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )
        }
      </div>

      {/* Historique mesures */}
      {measures.length > 0 && (
        <div className="bg-white dark:bg-[#1c1a17] rounded-2xl border border-stone-100 dark:border-white/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100 dark:border-white/10">
            <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-200">
              Historique des mesures — Entrepôt #{lot.warehouse_id}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-xs text-stone-400 uppercase tracking-wide border-b border-stone-100 dark:border-white/10">
                  <th className="px-5 py-2.5 text-left font-semibold">Date / Heure</th>
                  <th className="px-5 py-2.5 text-left font-semibold">Température</th>
                  <th className="px-5 py-2.5 text-left font-semibold">Humidité</th>
                  <th className="px-5 py-2.5 text-left font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {[...measures].reverse().map(m => (
                  <tr key={m.id} className="border-b border-stone-50 dark:border-white/5 hover:bg-stone-50 dark:hover:bg-white/3 transition-colors">
                    <td className="px-5 py-2.5 text-stone-500 dark:text-stone-400 whitespace-nowrap">
                      {new Date(m.timestamp).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-5 py-2.5 font-medium text-stone-800 dark:text-stone-200">
                      {m.temperature.toFixed(1)}°C
                    </td>
                    <td className="px-5 py-2.5 font-medium text-stone-800 dark:text-stone-200">
                      {m.humidity.toFixed(1)}%
                    </td>
                    <td className="px-5 py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                        m.status === 'compliant'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {m.status === 'compliant' ? 'Conforme' : 'Hors seuil'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal édition */}
      {editing && (
        <LotEditModal lot={lot} countryCode={country}
          onClose={() => setEditing(false)}
          onUpdated={() => { setEditing(false); load() }} />
      )}

      {/* Confirmation suppression */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
             onClick={() => setConfirmDelete(false)}>
          <div onClick={e => e.stopPropagation()}
               className="bg-white dark:bg-[#1c1a17] rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4
                          border border-stone-100 dark:border-white/10">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-2">Supprimer le lot ?</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-5">
              Le lot <strong className="font-mono text-stone-700 dark:text-stone-300">{lot.id}</strong> sera définitivement supprimé.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)}
                className="flex-1 border border-stone-300 dark:border-white/15 text-stone-600 dark:text-stone-300
                           font-medium py-2.5 rounded-lg hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
                Annuler
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium
                           py-2.5 rounded-lg disabled:opacity-50 transition-colors">
                {deleting ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
