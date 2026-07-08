import { useEffect, useState, useCallback } from 'react'
import { Truck, RefreshCw, Search, MapPin, Hash, CheckCircle2, Clock, XCircle, Package } from 'lucide-react'
import { getAllExpeditions, getCountryExpeditions, updateExpedition, cancelExpedition } from '../services/api'
import type { Expedition } from '../services/api'
import { useAuth } from '../context/AuthContext'

const COUNTRIES = [
  { code: 'ALL', label: 'Tous les pays' },
  { code: 'BR',  label: '🇧🇷 Brésil'   },
  { code: 'EC',  label: '🇪🇨 Équateur' },
  { code: 'CO',  label: '🇨🇴 Colombie' },
]

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle2; cls: string }> = {
  en_route: {
    label: 'En route',
    icon:  Clock,
    cls:   'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800/40',
  },
  livre: {
    label: 'Livré',
    icon:  CheckCircle2,
    cls:   'bg-[#fdf6ee] text-[#7a4528] border-[#d4b896] dark:bg-[#4a2810]/20 dark:text-[#c4813a] dark:border-[#7a4528]/40',
  },
  annule: {
    label: 'Annulé',
    icon:  XCircle,
    cls:   'bg-stone-50 text-stone-500 border-stone-200 dark:bg-white/5 dark:text-stone-400 dark:border-white/10',
  },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.en_route
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.cls}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  )
}

function fmt(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysDiff(from: string, to: string | null): number | null {
  if (!to) return null
  return Math.floor((new Date(to).getTime() - new Date(from).getTime()) / 86400000)
}

interface UpdateModalProps {
  exp:       Expedition
  onClose:   () => void
  onUpdated: () => void
}

function UpdateModal({ exp, onClose, onUpdated }: UpdateModalProps) {
  const [status,          setStatus]          = useState(exp.status)
  const [carrier,         setCarrier]         = useState(exp.carrier ?? '')
  const [trackingNumber,  setTrackingNumber]  = useState(exp.tracking_number ?? '')
  const [estimatedArrival,setEstimatedArrival]= useState(exp.estimated_arrival ?? '')
  const [notes,           setNotes]           = useState(exp.notes ?? '')
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState<string | null>(null)

  const inputCls = `w-full px-3 py-2.5 rounded-lg border border-stone-200 dark:border-white/10
    bg-white dark:bg-white/5 text-sm text-stone-800 dark:text-stone-100
    placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#4a2810]/30 transition-colors`

  const handleSave = async () => {
    setLoading(true); setError(null)
    try {
      await updateExpedition(exp.country_code ?? 'BR', exp.id, {
        status,
        carrier:           carrier.trim() || null,
        tracking_number:   trackingNumber.trim() || null,
        estimated_arrival: estimatedArrival || null,
        notes:             notes.trim() || null,
        ...(status === 'livre' && !exp.delivered_at
          ? { delivered_at: new Date().toISOString() }
          : {}),
      })
      onUpdated()
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
         onClick={onClose}>
      <div className="bg-white dark:bg-[#1c1a17] rounded-2xl shadow-2xl w-full max-w-md
                      border border-stone-100 dark:border-white/10"
           onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-stone-100 dark:border-white/10">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Mettre à jour l'expédition</h2>
          <p className="text-xs text-stone-400 mt-0.5">Lot <span className="font-mono">{exp.lot_id}</span> → {exp.destination}</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">Statut</label>
            <select className={inputCls} value={status} onChange={e => setStatus(e.target.value as any)}>
              <option value="en_route">En route</option>
              <option value="livre">Livré</option>
              <option value="annule">Annulé</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">Transporteur</label>
              <input className={inputCls} placeholder="DHL, FedEx…" value={carrier} onChange={e => setCarrier(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">N° suivi</label>
              <input className={inputCls} placeholder="1Z99…" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">Date d'arrivée estimée</label>
            <input type="date" className={inputCls} value={estimatedArrival} onChange={e => setEstimatedArrival(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">Notes</label>
            <textarea className={`${inputCls} resize-none`} rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-stone-300 dark:border-white/15
                         text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
              Annuler
            </button>
            <button onClick={handleSave} disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-[#4a2810] hover:bg-[#3d1f0f]
                         text-white text-sm font-medium disabled:opacity-60 transition-colors">
              {loading ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ExpeditionsPage() {
  const { user } = useAuth()
  const isSiege  = user?.role === 'siege' || user?.role === 'admin'
  const lockedCountry = isSiege ? null : (user?.country_code ?? 'BR')

  const [activeTab,    setActiveTab]    = useState(lockedCountry ?? 'ALL')
  const [expeditions,  setExpeditions]  = useState<Expedition[]>([])
  const [loading,      setLoading]      = useState(true)
  const [query,        setQuery]        = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editTarget,   setEditTarget]   = useState<Expedition | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Expedition | null>(null)
  const [cancelling,   setCancelling]   = useState(false)

  const fetchData = useCallback(() => {
    setLoading(true)
    const p = (activeTab === 'ALL' && isSiege)
      ? getAllExpeditions()
      : getCountryExpeditions(activeTab === 'ALL' ? (lockedCountry ?? 'BR') : activeTab)
    p.then(setExpeditions).catch(() => setExpeditions([])).finally(() => setLoading(false))
  }, [activeTab, isSiege, lockedCountry])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = expeditions.filter(e => {
    if (statusFilter && e.status !== statusFilter) return false
    if (query) {
      const q = query.toLowerCase()
      return (
        e.lot_id.toLowerCase().includes(q) ||
        e.destination.toLowerCase().includes(q) ||
        (e.tracking_number ?? '').toLowerCase().includes(q) ||
        (e.carrier ?? '').toLowerCase().includes(q) ||
        (e.client?.name ?? '').toLowerCase().includes(q) ||
        (e.client?.company ?? '').toLowerCase().includes(q)
      )
    }
    return true
  })

  const stats = {
    total:    expeditions.length,
    en_route: expeditions.filter(e => e.status === 'en_route').length,
    livre:    expeditions.filter(e => e.status === 'livre').length,
    annule:   expeditions.filter(e => e.status === 'annule').length,
  }

  const handleCancel = async () => {
    if (!cancelTarget) return
    setCancelling(true)
    try {
      await cancelExpedition(cancelTarget.country_code ?? 'BR', cancelTarget.id)
      setCancelTarget(null)
      fetchData()
    } catch (err: any) {
      alert(err?.response?.data?.detail ?? 'Erreur lors de l\'annulation')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Truck size={22} className="text-blue-600" />
            Expéditions
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">Suivi des lots expédiés</p>
        </div>
        <div className="flex items-center gap-2">
          {isSiege && (
            <div className="flex gap-1 bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-white/10 p-1 rounded-xl">
              {COUNTRIES.map(c => (
                <button key={c.code} onClick={() => setActiveTab(c.code)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                    activeTab === c.code
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                  }`}>
                  {c.label}
                </button>
              ))}
            </div>
          )}
          <button onClick={fetchData}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-stone-200
                       dark:border-white/10 bg-white dark:bg-[#1c1a17] text-stone-500
                       hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total',     value: stats.total,    color: 'text-stone-900 dark:text-stone-100' },
          { label: 'En route',  value: stats.en_route, color: 'text-blue-600' },
          { label: 'Livrés',    value: stats.livre,    color: 'text-[#7a4528]' },
          { label: 'Annulés',   value: stats.annule,   color: 'text-stone-400' },
        ].map(k => (
          <div key={k.label}
               className="bg-white dark:bg-[#1c1a17] rounded-xl border border-stone-100 dark:border-white/10 p-4 text-center">
            <div className={`text-2xl font-bold ${k.color}`}>{loading ? '…' : k.value}</div>
            <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Lot, destination, transporteur, suivi…"
            className="pl-8 pr-3 py-2 border border-stone-200 dark:border-white/10 rounded-lg text-sm
                       bg-white dark:bg-[#1c1a17] text-stone-800 dark:text-stone-200
                       focus:outline-none focus:ring-2 focus:ring-stone-300 dark:focus:ring-white/20 w-72" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-stone-200 dark:border-white/10 rounded-lg text-sm
                     bg-white dark:bg-[#1c1a17] text-stone-800 dark:text-stone-200">
          <option value="">Tous statuts</option>
          <option value="en_route">En route</option>
          <option value="livre">Livré</option>
          <option value="annule">Annulé</option>
        </select>
        {(query || statusFilter) && (
          <button onClick={() => { setQuery(''); setStatusFilter('') }}
            className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline transition-colors">
            Réinitialiser
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1c1a17] rounded-xl shadow-sm overflow-auto
                      border border-stone-100 dark:border-white/10">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-stone-100 dark:border-white/10 text-xs text-stone-400 dark:text-stone-500 uppercase tracking-wide">
              <th className="px-4 py-3 font-semibold">Lot</th>
              {isSiege && <th className="px-4 py-3 font-semibold">Pays</th>}
              <th className="px-4 py-3 font-semibold">Client</th>
              <th className="px-4 py-3 font-semibold">Destination</th>
              <th className="px-4 py-3 font-semibold">Transporteur</th>
              <th className="px-4 py-3 font-semibold">N° suivi</th>
              <th className="px-4 py-3 font-semibold">Date expédition</th>
              <th className="px-4 py-3 font-semibold">Arrivée estimée</th>
              <th className="px-4 py-3 font-semibold">Durée</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-stone-50 dark:border-white/5">
                    {Array.from({ length: isSiege ? 11 : 10 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-stone-100 dark:bg-white/5 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : filtered.length === 0
              ? (
                <tr>
                  <td colSpan={isSiege ? 11 : 10}
                      className="px-4 py-16 text-center text-sm text-stone-400 dark:text-stone-500">
                    <Package size={32} className="mx-auto mb-3 opacity-30" />
                    {expeditions.length === 0
                      ? 'Aucune expédition enregistrée.'
                      : 'Aucune expédition ne correspond aux filtres.'}
                  </td>
                </tr>
              )
              : filtered.map(exp => {
                  const days = exp.status === 'en_route'
                    ? daysDiff(exp.shipped_at, new Date().toISOString())
                    : daysDiff(exp.shipped_at, exp.delivered_at)

                  return (
                    <tr key={exp.id}
                        className={`border-b border-stone-100 dark:border-white/5 hover:bg-stone-50 dark:hover:bg-white/3 transition-colors ${
                          exp.status === 'livre' ? 'bg-[#fdf6ee]/30 dark:bg-[#4a2810]/10' :
                          exp.status === 'annule' ? 'opacity-50' : ''
                        }`}>
                      <td className="px-4 py-3 font-mono text-sm font-semibold text-stone-800 dark:text-stone-100">
                        {exp.lot_id}
                      </td>
                      {isSiege && (
                        <td className="px-4 py-3 text-sm text-stone-500 dark:text-stone-400">
                          {exp.country_code === 'BR' ? '🇧🇷' : exp.country_code === 'EC' ? '🇪🇨' : exp.country_code === 'CO' ? '🇨🇴' : exp.country_code}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm max-w-[150px]">
                        {exp.client ? (
                          <div>
                            <p className="font-medium text-stone-800 dark:text-stone-100 truncate">{exp.client.name}</p>
                            {exp.client.company && (
                              <p className="text-xs text-stone-400 truncate">{exp.client.company}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-stone-300 dark:text-stone-600 italic text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-700 dark:text-stone-300 max-w-[180px]">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={11} className="text-stone-400 shrink-0" />
                          <span className="truncate">{exp.destination}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-500 dark:text-stone-400">
                        {exp.carrier ?? <span className="text-stone-300 dark:text-stone-600 italic">—</span>}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-stone-500 dark:text-stone-400">
                        {exp.tracking_number
                          ? <div className="flex items-center gap-1">
                              <Hash size={10} className="text-stone-400" />
                              <span className="truncate max-w-[120px]">{exp.tracking_number}</span>
                            </div>
                          : <span className="text-stone-300 dark:text-stone-600 italic">—</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-500 dark:text-stone-400 whitespace-nowrap">
                        {fmt(exp.shipped_at)}
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-500 dark:text-stone-400 whitespace-nowrap">
                        {exp.status === 'livre' && exp.delivered_at
                          ? <span className="text-[#7a4528] dark:text-[#c4813a]">{fmt(exp.delivered_at)} ✓</span>
                          : fmt(exp.estimated_arrival)
                        }
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-400 dark:text-stone-500 whitespace-nowrap">
                        {days !== null ? `${days} j` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={exp.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {exp.status !== 'annule' && (
                            <button onClick={() => setEditTarget(exp)} title="Mettre à jour"
                              className="px-2.5 py-1 text-xs rounded-lg border border-stone-200 dark:border-white/10
                                         text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-white/8
                                         transition-colors">
                              Modifier
                            </button>
                          )}
                          {exp.status === 'en_route' && (
                            <button onClick={() => setCancelTarget(exp)} title="Annuler"
                              className="px-2.5 py-1 text-xs rounded-lg border border-red-200 dark:border-red-800/30
                                         text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20
                                         transition-colors">
                              Annuler
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
            }
          </tbody>
        </table>
      </div>

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-stone-400 dark:text-stone-500 text-right">
          {filtered.length} expédition{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}
          {filtered.length !== expeditions.length ? ` / ${expeditions.length} au total` : ''}
        </p>
      )}

      {/* Modal mise à jour */}
      {editTarget && (
        <UpdateModal
          exp={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdated={() => { setEditTarget(null); fetchData() }}
        />
      )}

      {/* Confirmation annulation */}
      {cancelTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
             onClick={() => setCancelTarget(null)}>
          <div className="bg-white dark:bg-[#1c1a17] rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4
                          border border-stone-100 dark:border-white/10"
               onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-2">Annuler l'expédition ?</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-5">
              Le lot <strong className="font-mono text-stone-700 dark:text-stone-300">{cancelTarget.lot_id}</strong> sera
              remis en stock (statut conforme). Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCancelTarget(null)}
                className="flex-1 border border-stone-300 dark:border-white/15 text-stone-600 dark:text-stone-300
                           font-medium py-2.5 rounded-lg hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
                Retour
              </button>
              <button onClick={handleCancel} disabled={cancelling}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium
                           py-2.5 rounded-lg disabled:opacity-50 transition-colors">
                {cancelling ? 'Annulation…' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
