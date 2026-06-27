import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import WarehouseCard from '../components/ui/WarehouseCard'
import WarehouseCreateModal from '../components/WarehouseCreateModal'
import WarehouseEditModal from '../components/WarehouseEditModal'
import { getAllWarehouses, getCountryAlerts, getCountryMeasures, deleteWarehouse } from '../services/api'
import type { Warehouse } from '../services/api'

interface EnrichedWarehouse extends Warehouse {
  temp?: number
  humidity?: number
  iotStatus?: 'online' | 'offline' | 'degraded'
  alertCount?: number
}

export default function WarehousesPage() {
  const navigate = useNavigate()
  const [warehouses,   setWarehouses]   = useState<EnrichedWarehouse[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)
  const [query,        setQuery]        = useState('')
  const [showCreate,   setShowCreate]   = useState(false)
  const [editTarget,   setEditTarget]   = useState<EnrichedWarehouse | null>(null)
  const [deleteId,     setDeleteId]     = useState<EnrichedWarehouse | null>(null)
  const [deleting,     setDeleting]     = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const whs = await getAllWarehouses()
      const enriched = await Promise.all(
        whs.map(async (w): Promise<EnrichedWarehouse> => {
          const code = w.country_code ?? 'BR'
          try {
            const [measures, alerts] = await Promise.all([
              getCountryMeasures(code, w.id),
              getCountryAlerts(code),
            ])
            const whAlerts = (alerts as any[]).filter(a => a.warehouse_id === w.id)
            const latest = measures.length > 0 ? measures[measures.length - 1] : null
            return {
              ...w,
              temp:       latest?.temperature,
              humidity:   latest?.humidity,
              iotStatus:  latest ? (whAlerts.length > 0 ? 'degraded' : 'online') : 'offline',
              alertCount: whAlerts.length,
            }
          } catch {
            return { ...w, iotStatus: 'offline', alertCount: 0 }
          }
        })
      )
      setWarehouses(enriched)
    } catch {
      setError('Impossible de charger les entrepôts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteWarehouse(deleteId.country_code ?? 'BR', deleteId.id)
      setDeleteId(null)
      fetchData()
    } catch (err: any) {
      alert(err?.response?.data?.detail ?? 'Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = warehouses.filter(w =>
    w.name.toLowerCase().includes(query.toLowerCase()) ||
    (w.country_code ?? '').toLowerCase().includes(query.toLowerCase()) ||
    String(w.id).includes(query)
  )

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Entrepôts</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">Gérer les entrepôts et suivre leur état</p>
        </div>
        <div className="flex items-center gap-3">
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher…"
            className="px-3 py-2 rounded-xl border border-stone-200 dark:border-white/10
                       bg-white dark:bg-white/5 text-sm text-stone-700 dark:text-stone-200
                       placeholder:text-stone-400 outline-none" />
          <button onClick={fetchData}
            className="px-3 py-2 rounded-xl border border-stone-200 dark:border-white/10
                       text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-white/5">
            ↻ Actualiser
          </button>
          <button onClick={() => setShowCreate(true)}
            className="bg-[#7a4528] hover:bg-[#6a3a20] text-white px-4 py-2 rounded-xl
                       text-sm font-medium transition-colors">
            + Nouvel entrepôt
          </button>
        </div>
      </header>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-56 bg-stone-100 dark:bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800
                        rounded-xl p-4 text-red-700 dark:text-red-400 text-sm">
          ⚠ {error}
          <button onClick={fetchData} className="ml-2 underline">Réessayer</button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 text-stone-400">
          <div className="text-4xl mb-3">⬡</div>
          <p className="text-sm">Aucun entrepôt trouvé</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          {/* KPI */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total',    value: warehouses.length },
              { label: 'Online',   value: warehouses.filter(w => w.iotStatus === 'online').length },
              { label: 'Dégradés', value: warehouses.filter(w => w.iotStatus === 'degraded').length },
              { label: 'Offline',  value: warehouses.filter(w => w.iotStatus === 'offline').length },
            ].map(k => (
              <div key={k.label}
                className="bg-white dark:bg-[#1c1a17] rounded-xl border border-stone-100 dark:border-white/5 p-4 text-center">
                <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{k.value}</div>
                <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">{k.label}</div>
              </div>
            ))}
          </div>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(w => (
              <WarehouseCard
                key={`${w.country_code}-${w.id}`}
                id={`${w.country_code}-${w.id}`}
                name={w.name}
                country={w.country_code ?? ''}
                capacity={0}
                lots={0}
                temp={w.temp ?? 0}
                humidity={w.humidity ?? 0}
                iotStatus={w.iotStatus ?? 'offline'}
                alerts={w.alertCount ?? 0}
                onView={()    => navigate(`/warehouses/${w.id}`)}
                onEdit={()    => setEditTarget(w)}
                onDelete={()  => setDeleteId(w)}
                onHistory={()  => navigate(`/warehouses/${w.id}/history`)}
              />
            ))}
          </section>
        </>
      )}

      {/* Modal création */}
      {showCreate && (
        <WarehouseCreateModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchData() }}
        />
      )}

      {/* Modal édition */}
      {editTarget && (
        <WarehouseEditModal
          warehouse={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdated={() => { setEditTarget(null); fetchData() }}
        />
      )}

      {/* Confirmation suppression */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
             onClick={() => setDeleteId(null)}>
          <div onClick={e => e.stopPropagation()}
               className="bg-white dark:bg-[#1c1a17] rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4
                          border border-stone-100 dark:border-white/10">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-2">
              Supprimer l'entrepôt ?
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-5">
              <strong className="text-stone-700 dark:text-stone-300">{deleteId.name}</strong> sera
              définitivement supprimé. Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
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
