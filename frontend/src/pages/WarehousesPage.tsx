import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import WarehouseCard from '../components/ui/WarehouseCard'
import WarehouseCreateModal from '../components/WarehouseCreateModal'
import WarehouseEditModal from '../components/WarehouseEditModal'
import { getAllWarehouses, getCountryAlerts, getCountryMeasures, getCountryLots, deleteWarehouse } from '../services/api'
import type { Warehouse } from '../services/api'
import { useAuth } from '../context/AuthContext'

interface EnrichedWarehouse extends Warehouse {
  temp?: number
  humidity?: number
  iotStatus?: 'online' | 'offline' | 'degraded'
  alertCount?: number
  lotCount?: number
}

export default function WarehousesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isSiege = user?.role === 'siege' || user?.role === 'admin'
  const lockedCountry = isSiege ? null : (user?.country_code ?? null)

  const [warehouses,   setWarehouses]   = useState<EnrichedWarehouse[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)
  const [query,        setQuery]        = useState('')
  const [activeTab,    setActiveTab]    = useState<string>('ALL')
  const [showCreate,   setShowCreate]   = useState(false)
  const [editTarget,   setEditTarget]   = useState<EnrichedWarehouse | null>(null)
  const [deleteId,     setDeleteId]     = useState<EnrichedWarehouse | null>(null)
  const [deleting,     setDeleting]     = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const allWhs = await getAllWarehouses()
      const whs = lockedCountry
        ? allWhs.filter(w => (w.country_code ?? '').toUpperCase() === lockedCountry.toUpperCase())
        : allWhs

      // Récupérer lots/alertes/mesures par pays en une seule passe
      const countryCodes = [...new Set(whs.map(w => w.country_code ?? 'BR'))]
      const perCountry = Object.fromEntries(
        await Promise.all(
          countryCodes.map(async code => {
            const [lots, alerts] = await Promise.allSettled([
              getCountryLots(code),
              getCountryAlerts(code),
            ])
            return [code, {
              lots:   lots.status   === 'fulfilled' ? lots.value   : [],
              alerts: alerts.status === 'fulfilled' ? alerts.value : [],
            }]
          })
        )
      )

      const enriched = await Promise.all(
        whs.map(async (w): Promise<EnrichedWarehouse> => {
          const code     = w.country_code ?? 'BR'
          const ctryLots = perCountry[code]?.lots   ?? []
          const ctryAlerts = perCountry[code]?.alerts ?? []
          const lotCount   = ctryLots.filter((l: any) => l.warehouse_id === w.id).length
          const whAlerts   = ctryAlerts.filter((a: any) => a.warehouse_id === w.id)
          try {
            const measures = await getCountryMeasures(code, w.id)
            const latest = measures.length > 0 ? measures[measures.length - 1] : null
            return {
              ...w,
              temp:       latest?.temperature,
              humidity:   latest?.humidity,
              iotStatus:  latest ? (whAlerts.length > 0 ? 'degraded' : 'online') : 'offline',
              alertCount: whAlerts.length,
              lotCount,
            }
          } catch {
            return { ...w, iotStatus: 'offline', alertCount: whAlerts.length, lotCount }
          }
        })
      )
      setWarehouses(enriched)
    } catch {
      setError('Impossible de charger les entrepôts')
    } finally {
      setLoading(false)
    }
  }, [lockedCountry])

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

  const COUNTRY_TABS = [
    { code: 'ALL', label: 'Tous',      flag: '' },
    { code: 'BR',  label: 'Brésil',   flag: '🇧🇷' },
    { code: 'EC',  label: 'Équateur', flag: '🇪🇨' },
    { code: 'CO',  label: 'Colombie', flag: '🇨🇴' },
  ]

  const filtered = warehouses.filter(w => {
    const matchTab = activeTab === 'ALL' || (w.country_code ?? '').toUpperCase() === activeTab
    const matchSearch =
      w.name.toLowerCase().includes(query.toLowerCase()) ||
      (w.country_code ?? '').toLowerCase().includes(query.toLowerCase()) ||
      String(w.id).includes(query)
    return matchTab && matchSearch
  })

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
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

      {/* Onglets pays — visibles seulement pour siege/admin */}
      {isSiege ? (
        <div className="flex gap-2 border-b border-stone-200 dark:border-white/8 pb-1">
          {COUNTRY_TABS.map(tab => {
            const count = tab.code === 'ALL'
              ? warehouses.length
              : warehouses.filter(w => (w.country_code ?? '').toUpperCase() === tab.code).length
            return (
              <button key={tab.code} onClick={() => setActiveTab(tab.code)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-t-lg border-b-2 transition-colors ${
                  activeTab === tab.code
                    ? 'border-[#7a4528] text-[#7a4528] dark:text-amber-400 font-semibold'
                    : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                }`}>
                {tab.flag && <span>{tab.flag}</span>}
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.code
                    ? 'bg-[#7a4528]/10 text-[#7a4528] dark:bg-amber-400/10 dark:text-amber-400'
                    : 'bg-stone-100 dark:bg-white/8 text-stone-500 dark:text-stone-400'
                }`}>{count}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-white/8
                        border border-stone-200 dark:border-white/10 text-sm text-stone-700 dark:text-stone-300">
          {lockedCountry === 'BR' ? '🇧🇷 Brésil' : lockedCountry === 'EC' ? '🇪🇨 Équateur' : '🇨🇴 Colombie'}
        </div>
      )}

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
                capacity={w.exploitation_id}
                lots={w.lotCount ?? 0}
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
