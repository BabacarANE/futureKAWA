import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, RefreshCw, Eye, Pencil, Trash2, PackageCheck, Truck } from 'lucide-react'
import { getCountryLots, deleteLot } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { Lot } from '../types'
import NewLotModal from '../components/NewLotModal'
import LotEditModal from '../components/LotEditModal'
import ExpeditionModal from '../components/ExpeditionModal'

const COUNTRIES = [
  { code: 'BR', label: '🇧🇷 Brésil'   },
  { code: 'EC', label: '🇪🇨 Équateur' },
  { code: 'CO', label: '🇨🇴 Colombie' },
]

const STATUS_BADGE: Record<string, string> = {
  compliant: 'bg-[#fdf6ee] text-[#7a4528] border-[#d4b896]',
  alert:     'bg-amber-50  text-amber-700  border-amber-200',
  expired:   'bg-red-50    text-red-700    border-red-200',
  shipped:   'bg-blue-50   text-blue-700   border-blue-200',
}
const STATUS_LABELS: Record<string, string> = {
  compliant: 'Conforme',
  alert:     'Alerte',
  expired:   'Expiré',
  shipped:   'Expédié',
}

function LotRow({
  lot, selected, onToggleSelect, onView, onEdit, onDelete, onShip,
}: {
  lot: Lot
  selected: boolean
  onToggleSelect: () => void
  onView: () => void
  onEdit: () => void
  onDelete: () => void
  onShip?: () => void
}) {
  const age = lot.storage_date
    ? Math.floor((Date.now() - new Date(lot.storage_date).getTime()) / 86400000)
    : null
  const rowBg = selected
    ? 'bg-[#fdf6ee]/60 dark:bg-[#4a2810]/10'
    : lot.status === 'expired'
    ? 'bg-red-50/30 dark:bg-red-950/10'
    : lot.status === 'alert'
    ? 'bg-amber-50/30 dark:bg-amber-950/10'
    : ''

  return (
    <tr className={`border-b border-stone-100 dark:border-white/5 hover:bg-stone-50 dark:hover:bg-white/3 transition-colors ${rowBg}`}>
      <td className="px-3 py-3 w-8">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="h-3.5 w-3.5 rounded border-stone-300 dark:border-white/20 accent-[#7a4528] cursor-pointer"
        />
      </td>
      <td className="px-4 py-3 font-mono text-sm font-semibold text-stone-800 dark:text-stone-100">{lot.id}</td>
      <td className="px-4 py-3 text-sm text-stone-600 dark:text-stone-300">{lot.exploitation_id}</td>
      <td className="px-4 py-3 text-sm text-stone-600 dark:text-stone-300">{lot.warehouse_id}</td>
      <td className="px-4 py-3 text-sm text-stone-500 dark:text-stone-400 whitespace-nowrap">
        {lot.storage_date ? new Date(lot.storage_date).toLocaleDateString('fr-FR') : '—'}
      </td>
      <td className="px-4 py-3 text-sm text-stone-500 dark:text-stone-400">
        {age !== null ? `${age} j` : '—'}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGE[lot.status] ?? 'bg-stone-100 text-stone-600 border-stone-200'}`}>
          {STATUS_LABELS[lot.status] ?? lot.status}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-stone-400 dark:text-stone-500 max-w-[180px] truncate">
        {lot.quality_notes ?? <span className="italic text-stone-300 dark:text-stone-600">—</span>}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button onClick={onView} title="Voir le détail"
            className="h-7 w-7 flex items-center justify-center rounded-lg
                       text-stone-400 hover:text-stone-700 dark:hover:text-stone-200
                       hover:bg-stone-100 dark:hover:bg-white/8 transition-colors">
            <Eye size={13} />
          </button>
          <button onClick={onEdit} title="Modifier"
            className="h-7 w-7 flex items-center justify-center rounded-lg
                       text-stone-400 hover:text-amber-600
                       hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors">
            <Pencil size={13} />
          </button>
          <button onClick={onDelete} title="Supprimer"
            className="h-7 w-7 flex items-center justify-center rounded-lg
                       text-stone-400 hover:text-red-600
                       hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
            <Trash2 size={13} />
          </button>
          {lot.status !== 'shipped' && (
            <button onClick={onShip} title="Expédier"
              className="h-7 w-7 flex items-center justify-center rounded-lg
                         text-stone-400 hover:text-[#7a4528]
                         hover:bg-[#fdf6ee] dark:hover:bg-[#4a2810]/30 transition-colors">
              <PackageCheck size={13} />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

export default function LotsPage() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const isSiege = user?.role === 'siege' || user?.role === 'admin'
  const lockedCountry = isSiege ? null : (user?.country_code ?? 'BR')
  const initialCountry = lockedCountry ?? searchParams.get('country') ?? 'BR'

  const [country,      setCountry]      = useState(initialCountry)
  const [lots,         setLots]         = useState<Lot[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)
  const [showCreate,   setShowCreate]   = useState(false)
  const [editTarget,   setEditTarget]   = useState<Lot | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Lot | null>(null)
  const [deleting,     setDeleting]     = useState(false)

  const [selectedIds,    setSelectedIds]    = useState<Set<string>>(new Set())
  const [expeditionLots, setExpeditionLots] = useState<Lot[] | null>(null)

  const [query,    setQuery]    = useState('')
  const [statusF,  setStatusF]  = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')

  const canCreate = ['responsable_exploitation','responsable_entrepot','siege','admin'].includes(user?.role ?? '')

  const fetchLots = useCallback(() => {
    setLoading(true); setError(null)
    getCountryLots(country)
      .then((data: Lot[]) => { setLots(data); setSelectedIds(new Set()) })
      .catch(() => setError('Impossible de charger les lots'))
      .finally(() => setLoading(false))
  }, [country])

  useEffect(() => { fetchLots() }, [fetchLots])
  useEffect(() => { setSearchParams({ country }) }, [country, setSearchParams])
  useEffect(() => { setSelectedIds(new Set()) }, [country])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteLot(country, deleteTarget.id)
      setDeleteTarget(null)
      fetchLots()
    } catch (err: any) {
      alert(err?.response?.data?.detail ?? 'Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  // Lots actifs = tout sauf expédiés
  const activeLots = lots.filter(l => {
    if (l.status === 'shipped') return false
    if (query    && !l.id.toLowerCase().includes(query.toLowerCase())) return false
    if (statusF  && l.status !== statusF) return false
    if (dateFrom && new Date(l.storage_date) < new Date(dateFrom)) return false
    if (dateTo   && new Date(l.storage_date) > new Date(dateTo + 'T23:59:59')) return false
    return true
  })

  const nonShipped = lots.filter(l => l.status !== 'shipped')

  const stats = {
    total:     nonShipped.length,
    compliant: nonShipped.filter(l => l.status === 'compliant').length,
    alert:     nonShipped.filter(l => l.status === 'alert').length,
    expired:   nonShipped.filter(l => l.status === 'expired').length,
    shipped:   lots.filter(l => l.status === 'shipped').length,
  }

  const shippableSelected = activeLots.filter(l => selectedIds.has(l.id))
  const allVisibleSelected = activeLots.length > 0 && activeLots.every(l => selectedIds.has(l.id))
  const someSelected = selectedIds.size > 0

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const toggleSelectAll = () => {
    if (allVisibleSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(activeLots.map(l => l.id)))
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Lots</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">Traçabilité FIFO des lots de café</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isSiege ? (
            <div className="flex gap-1 bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-white/10 p-1 rounded-xl">
              {COUNTRIES.map(c => (
                <button key={c.code} onClick={() => setCountry(c.code)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                    country === c.code
                      ? 'bg-[#4a2810] text-white shadow-sm'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                  }`}>
                  {c.label}
                </button>
              ))}
            </div>
          ) : (
            <span className="text-sm font-medium text-stone-600 dark:text-stone-300 px-3 py-1.5 bg-stone-100 dark:bg-white/5 rounded-lg">
              {COUNTRIES.find(c => c.code === country)?.label ?? country}
            </span>
          )}
          <button onClick={fetchLots}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-stone-200 dark:border-white/10
                       bg-white dark:bg-[#1c1a17] text-stone-600 dark:text-stone-300
                       hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          {canCreate && (
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl
                         bg-[#4a2810] hover:bg-[#3d1f0f] text-white text-sm font-medium transition-colors">
              <Plus size={15} /> Nouveau lot
            </button>
          )}
        </div>
      </header>

      {/* KPI */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Total',      value: stats.total,     color: 'text-stone-900 dark:text-stone-100' },
          { label: 'Conformes',  value: stats.compliant, color: 'text-[#7a4528]' },
          { label: 'En alerte',  value: stats.alert,     color: 'text-amber-600' },
          { label: 'Expirés',    value: stats.expired,   color: 'text-red-600' },
          { label: 'Expédiés',   value: stats.shipped,   color: 'text-blue-600' },
        ].map(k => (
          <div key={k.label} className="bg-white dark:bg-[#1c1a17] rounded-xl border border-stone-100 dark:border-white/10 p-4 text-center">
            <div className={`text-2xl font-bold ${k.color}`}>{loading ? '…' : k.value}</div>
            <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2 flex-wrap">
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher par ID…"
          className="px-3 py-2 border border-stone-200 dark:border-white/10 rounded-lg text-sm
                     bg-white dark:bg-[#1c1a17] text-stone-800 dark:text-stone-200
                     focus:outline-none focus:ring-2 focus:ring-stone-300 dark:focus:ring-white/20" />
        <select value={statusF} onChange={e => setStatusF(e.target.value)}
          className="px-3 py-2 border border-stone-200 dark:border-white/10 rounded-lg text-sm
                     bg-white dark:bg-[#1c1a17] text-stone-800 dark:text-stone-200">
          <option value="">Tous statuts</option>
          <option value="compliant">Conforme</option>
          <option value="alert">Alerte</option>
          <option value="expired">Expiré</option>
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          className="px-3 py-2 border border-stone-200 dark:border-white/10 rounded-lg text-sm
                     bg-white dark:bg-[#1c1a17] text-stone-800 dark:text-stone-200" />
        <span className="text-stone-400 text-sm">→</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          className="px-3 py-2 border border-stone-200 dark:border-white/10 rounded-lg text-sm
                     bg-white dark:bg-[#1c1a17] text-stone-800 dark:text-stone-200" />
        {(query || statusF || dateFrom || dateTo) && (
          <button onClick={() => { setQuery(''); setStatusF(''); setDateFrom(''); setDateTo('') }}
            className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline transition-colors">
            Réinitialiser
          </button>
        )}
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800
                        rounded-xl p-4 text-red-700 dark:text-red-400 text-sm flex items-center gap-3">
          ⚠ {error}
          <button onClick={fetchLots} className="underline ml-2">Réessayer</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-[#1c1a17] rounded-xl shadow-sm overflow-auto
                      border border-stone-100 dark:border-white/10">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-stone-100 dark:border-white/10 text-xs text-stone-400 dark:text-stone-500 uppercase tracking-wide">
              <th className="px-3 py-3 w-8">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAll}
                  disabled={activeLots.length === 0}
                  className="h-3.5 w-3.5 rounded border-stone-300 dark:border-white/20 accent-[#7a4528] cursor-pointer disabled:opacity-40"
                />
              </th>
              <th className="px-4 py-3 font-semibold">ID Lot</th>
              <th className="px-4 py-3 font-semibold">Exploitation</th>
              <th className="px-4 py-3 font-semibold">Entrepôt</th>
              <th className="px-4 py-3 font-semibold">Date stockage</th>
              <th className="px-4 py-3 font-semibold">Âge</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 font-semibold">Notes qualité</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-stone-50 dark:border-white/5">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-stone-100 dark:bg-white/5 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : activeLots.length === 0
              ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-stone-400 dark:text-stone-500">
                    {nonShipped.length === 0
                      ? 'Aucun lot actif pour ce pays.'
                      : 'Aucun lot ne correspond aux filtres.'}
                  </td>
                </tr>
              )
              : activeLots.map(l => (
                  <LotRow
                    key={l.id}
                    lot={l}
                    selected={selectedIds.has(l.id)}
                    onToggleSelect={() => toggleSelect(l.id)}
                    onView={() => navigate(`/lots/${country}/${encodeURIComponent(l.id)}`)}
                    onEdit={() => setEditTarget(l)}
                    onDelete={() => setDeleteTarget(l)}
                    onShip={() => setExpeditionLots([l])}
                  />
                ))
            }
          </tbody>
        </table>
      </div>

      {!loading && activeLots.length > 0 && (
        <p className="text-xs text-stone-400 dark:text-stone-500 text-right">
          {activeLots.length} lot{activeLots.length > 1 ? 's' : ''} affiché{activeLots.length > 1 ? 's' : ''}
          {activeLots.length !== nonShipped.length ? ` / ${nonShipped.length} au total` : ''}
        </p>
      )}

      {/* Barre flottante sélection */}
      {someSelected && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40
                        flex items-center gap-3 px-5 py-3 rounded-2xl
                        bg-[#4a2810] shadow-2xl shadow-black/30 text-white
                        border border-white/10">
          <span className="text-sm font-medium">
            {selectedIds.size} lot{selectedIds.size > 1 ? 's' : ''} sélectionné{selectedIds.size > 1 ? 's' : ''}
          </span>
          {shippableSelected.length > 0 && (
            <button onClick={() => setExpeditionLots(shippableSelected)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                         bg-white/15 hover:bg-white/25 text-white text-sm font-medium transition-colors">
              <Truck size={13} />
              Expédier ({shippableSelected.length})
            </button>
          )}
          <button onClick={() => setSelectedIds(new Set())}
            className="h-7 w-7 flex items-center justify-center rounded-lg
                       text-white/50 hover:text-white hover:bg-white/10 transition-colors text-lg leading-none">
            ×
          </button>
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <NewLotModal countryCode={country}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchLots() }} />
      )}

      {editTarget && (
        <LotEditModal
          lot={editTarget}
          countryCode={country}
          onClose={() => setEditTarget(null)}
          onUpdated={() => { setEditTarget(null); fetchLots() }} />
      )}

      {expeditionLots && (
        <ExpeditionModal
          lots={expeditionLots}
          countryCode={country}
          onClose={() => setExpeditionLots(null)}
          onCreated={() => { setExpeditionLots(null); setSelectedIds(new Set()); fetchLots() }}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
             onClick={() => setDeleteTarget(null)}>
          <div onClick={e => e.stopPropagation()}
               className="bg-white dark:bg-[#1c1a17] rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4
                          border border-stone-100 dark:border-white/10">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-2">Supprimer le lot ?</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-5">
              Le lot <strong className="font-mono text-stone-700 dark:text-stone-300">{deleteTarget.id}</strong> sera
              définitivement supprimé. Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
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
