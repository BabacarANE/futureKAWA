import { useEffect, useRef, useState } from 'react'
import { updateLot } from '../services/api'
import type { Lot } from '../types'

type Props = {
  lot: Lot
  countryCode: string
  onClose: () => void
  onUpdated: () => void
}

const STATUS_OPTIONS = [
  { value: 'compliant', label: 'Conforme' },
  { value: 'alert',     label: 'Alerte'   },
  { value: 'expired',   label: 'Expiré'   },
]

export default function LotEditModal({ lot, countryCode, onClose, onUpdated }: Props) {
  const notesRef = useRef<HTMLTextAreaElement | null>(null)
  const [status,       setStatus]       = useState(lot.status)
  const [qualityNotes, setQualityNotes] = useState(lot.quality_notes ?? '')
  const [warehouseId,  setWarehouseId]  = useState<number>(lot.warehouse_id)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    setTimeout(() => notesRef.current?.focus(), 50)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await updateLot(countryCode, lot.id, {
        status,
        quality_notes: qualityNotes.trim() || null,
        warehouse_id:  warehouseId,
      })
      onUpdated()
      onClose()
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Erreur lors de la modification')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = `w-full border border-stone-300 dark:border-white/15 rounded-lg px-3 py-2 text-sm
                    bg-white dark:bg-white/5 text-stone-900 dark:text-stone-100
                    focus:outline-none focus:ring-2 focus:ring-stone-300 dark:focus:ring-white/20`

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
         onClick={onClose}>
      <div role="dialog" aria-modal="true"
           onClick={e => e.stopPropagation()}
           className="bg-white dark:bg-[#1c1a17] rounded-2xl shadow-xl p-6 w-full max-w-md mx-4
                      border border-stone-100 dark:border-white/10">

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Modifier le lot</h2>
            <p className="text-xs text-stone-400 font-mono mt-0.5">{lot.id}</p>
          </div>
          <button onClick={onClose}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Statut</label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => setStatus(opt.value as Lot['status'])}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    status === opt.value
                      ? opt.value === 'compliant'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : opt.value === 'alert'
                        ? 'bg-amber-500 border-amber-500 text-white'
                        : 'bg-red-600 border-red-600 text-white'
                      : 'border-stone-200 dark:border-white/15 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-white/5'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Entrepôt ID */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              ID Entrepôt
            </label>
            <input
              type="number" min={1} value={warehouseId}
              onChange={e => setWarehouseId(Number(e.target.value))}
              className={inputCls}
            />
          </div>

          {/* Notes qualité */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Notes qualité
            </label>
            <textarea ref={notesRef} value={qualityNotes}
              onChange={e => setQualityNotes(e.target.value)}
              rows={3} className={`${inputCls} resize-none`} />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800
                            text-red-700 dark:text-red-400 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-stone-300 dark:border-white/15
                         text-stone-600 dark:text-stone-300 font-medium py-2.5 rounded-lg
                         hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#1a2e1a] hover:bg-[#0f2010] text-white font-medium
                         py-2.5 rounded-lg disabled:opacity-50 transition-colors">
              {loading ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
