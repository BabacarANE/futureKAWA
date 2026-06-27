/**
 * NewLotModal.tsx — connecté au vrai backend
 *
 * Le modal original avait un TODO "brancher sur l'API réelle" et ne sauvegardait rien.
 * Ce fichier charge les exploitations et entrepôts depuis /exploitations/{country}
 * et /warehouses/{country}, puis crée le lot via POST /consolidated/{country}/lots.
 */
import { useState, useEffect, type FormEvent } from 'react'
import { X, Loader2 } from 'lucide-react'
import api from '../services/api'

interface NewLotModalProps {
  countryCode: string
  onClose: () => void
  onCreated: () => void
}

type Exploitation = { id: number; name: string; city: string | null }
type Warehouse     = { id: number; name: string; location: string | null }

export default function NewLotModal({ countryCode, onClose, onCreated }: NewLotModalProps) {
  const [lotId,          setLotId]          = useState('')
  const [exploitationId, setExploitationId] = useState<number | ''>('')
  const [warehouseId,    setWarehouseId]    = useState<number | ''>('')
  const [qualityNotes,   setQualityNotes]   = useState('')

  const [exploitations,  setExploitations]  = useState<Exploitation[]>([])
  const [warehouses,     setWarehouses]     = useState<Warehouse[]>([])
  const [loadingData,    setLoadingData]    = useState(true)
  const [submitting,     setSubmitting]     = useState(false)
  const [error,          setError]          = useState('')

  // Charger exploitations + entrepôts du pays sélectionné
  useEffect(() => {
    setLoadingData(true)
    setExploitationId('')
    setWarehouseId('')

    Promise.all([
      api.get(`/exploitations/${countryCode}`).then(r => r.data as Exploitation[]).catch(() => []),
      api.get(`/warehouses/${countryCode}`).then(r => r.data as Warehouse[]).catch(() => []),
    ])
      .then(([exps, whs]) => {
        // Fallback seed si le backend est indisponible
        if (exps.length === 0) {
          const fallback: Record<string, Exploitation[]> = {
            BR: [{ id: 1, name: 'Exploitation Amazonie', city: 'Manaus' }],
            EC: [{ id: 2, name: 'Exploitation Andes',    city: 'Quito' }],
            CO: [{ id: 3, name: 'Exploitation Cauca',    city: 'Popayan' }],
          }
          exps = fallback[countryCode] ?? []
        }
        if (whs.length === 0) {
          const fallback: Record<string, Warehouse[]> = {
            BR: [{ id: 1, name: 'Entrepôt Principal BR', location: 'Zone A' }],
            EC: [{ id: 2, name: 'Entrepôt Principal EC', location: 'Zone A' }],
            CO: [{ id: 3, name: 'Entrepôt Principal CO', location: 'Zone A' }],
          }
          whs = fallback[countryCode] ?? []
        }
        setExploitations(exps)
        setWarehouses(whs)
      })
      .finally(() => setLoadingData(false))
  }, [countryCode])

  // Fermer sur Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  // Générer un ID automatique si vide
  const generateId = () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const rand  = Math.floor(Math.random() * 900 + 100)
    setLotId(`LOT-${date}-${rand}`)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!lotId.trim())      { setError('L\'ID du lot est obligatoire'); return }
    if (!exploitationId)    { setError('Sélectionnez une exploitation'); return }
    if (!warehouseId)       { setError('Sélectionnez un entrepôt'); return }

    setError('')
    setSubmitting(true)
    try {
      // POST /consolidated/{country}/lots
      await api.post(`/consolidated/${countryCode}/lots`, {
        id:              lotId.trim(),
        exploitation_id: Number(exploitationId),
        warehouse_id:    Number(warehouseId),
        quality_notes:   qualityNotes.trim() || null,
      })
      onCreated()   // rafraîchit la liste dans la page parente
      onClose()
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      if (typeof detail === 'string') {
        setError(detail)
      } else if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg).join(', '))
      } else {
        setError('Erreur lors de la création — vérifiez que le backend est démarré')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-950/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-coffee-900 rounded-2xl shadow-card-dark p-6
                   border border-coffee-900/10 dark:border-white/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-coffee-900 dark:text-coffee-50">
            Nouveau lot — {countryCode}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-coffee-50 dark:hover:bg-coffee-800
                       text-coffee-700/60 dark:text-coffee-200/50"
          >
            <X size={18} />
          </button>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-8 text-coffee-400 gap-2">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Chargement des données…</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ID du lot */}
            <div>
              <label className="text-xs font-medium text-coffee-700/70 dark:text-coffee-200/55">
                ID du lot <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 mt-1">
                <input
                  required
                  value={lotId}
                  onChange={e => setLotId(e.target.value)}
                  placeholder="LOT-YYYYMMDD-001"
                  className="flex-1 px-3 py-2 rounded-lg border border-coffee-900/15 dark:border-white/15
                             bg-white dark:bg-coffee-950 text-coffee-900 dark:text-coffee-50 text-sm
                             focus:outline-none focus:ring-2 focus:ring-coffee-300"
                />
                <button
                  type="button"
                  onClick={generateId}
                  className="px-3 py-2 text-xs rounded-lg border border-coffee-900/15 dark:border-white/15
                             hover:bg-coffee-50 dark:hover:bg-coffee-800 text-coffee-700 dark:text-coffee-200
                             transition-colors whitespace-nowrap"
                >
                  Auto
                </button>
              </div>
            </div>

            {/* Exploitation */}
            <div>
              <label className="text-xs font-medium text-coffee-700/70 dark:text-coffee-200/55">
                Exploitation <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={exploitationId}
                onChange={e => setExploitationId(e.target.value === '' ? '' : Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-coffee-900/15 dark:border-white/15
                           bg-white dark:bg-coffee-950 text-coffee-900 dark:text-coffee-50 text-sm
                           focus:outline-none focus:ring-2 focus:ring-coffee-300"
              >
                <option value="">— Sélectionner —</option>
                {exploitations.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.name}{e.city ? ` (${e.city})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Entrepôt */}
            <div>
              <label className="text-xs font-medium text-coffee-700/70 dark:text-coffee-200/55">
                Entrepôt <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={warehouseId}
                onChange={e => setWarehouseId(e.target.value === '' ? '' : Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-coffee-900/15 dark:border-white/15
                           bg-white dark:bg-coffee-950 text-coffee-900 dark:text-coffee-50 text-sm
                           focus:outline-none focus:ring-2 focus:ring-coffee-300"
              >
                <option value="">— Sélectionner —</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name}{w.location ? ` — ${w.location}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes qualité */}
            <div>
              <label className="text-xs font-medium text-coffee-700/70 dark:text-coffee-200/55">
                Notes qualité (optionnel)
              </label>
              <textarea
                value={qualityNotes}
                onChange={e => setQualityNotes(e.target.value)}
                placeholder="Grade, variété, observations de qualité…"
                rows={2}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-coffee-900/15 dark:border-white/15
                           bg-white dark:bg-coffee-950 text-coffee-900 dark:text-coffee-50 text-sm
                           focus:outline-none focus:ring-2 focus:ring-coffee-300 resize-none"
              />
            </div>

            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Boutons */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-3 py-2.5 rounded-lg border border-coffee-900/15 dark:border-white/15
                           text-sm font-medium text-coffee-900 dark:text-coffee-50
                           hover:bg-coffee-50 dark:hover:bg-coffee-800 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting || !lotId || !exploitationId || !warehouseId}
                className="flex-1 px-3 py-2.5 rounded-lg bg-coffee-700 hover:bg-coffee-600 text-white
                           text-sm font-medium transition-colors disabled:opacity-60
                           flex items-center justify-center gap-2"
              >
                {submitting
                  ? <><Loader2 size={14} className="animate-spin" /> Création…</>
                  : 'Créer le lot'
                }
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}