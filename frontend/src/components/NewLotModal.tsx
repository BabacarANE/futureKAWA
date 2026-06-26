import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'

interface NewLotModalProps {
  countryCode: string
  onClose: () => void
  onCreated: () => void
}

export default function NewLotModal({ countryCode, onClose, onCreated }: NewLotModalProps) {
  const [reference, setReference] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      // TODO: brancher sur l'API réelle (createLot) une fois l'endpoint disponible
      await new Promise(r => setTimeout(r, 500))
      onCreated()
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-950/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-coffee-900 rounded-2xl shadow-card-dark p-6 border border-coffee-900/10 dark:border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-coffee-900 dark:text-coffee-50">Nouveau lot — {countryCode}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-coffee-50 dark:hover:bg-coffee-800 text-coffee-700/60 dark:text-coffee-200/50">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-medium text-coffee-700/70 dark:text-coffee-200/55">Référence du lot</label>
            <input
              required
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder="LOT-2026-001"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-coffee-900/15 dark:border-white/15
                         bg-white dark:bg-coffee-950 text-coffee-900 dark:text-coffee-50 text-sm
                         focus:outline-none focus:ring-2 focus:ring-coffee-300"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-coffee-700/70 dark:text-coffee-200/55">Entrepôt</label>
            <input
              required
              value={warehouseId}
              onChange={e => setWarehouseId(e.target.value)}
              placeholder="Ex : 12"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-coffee-900/15 dark:border-white/15
                         bg-white dark:bg-coffee-950 text-coffee-900 dark:text-coffee-50 text-sm
                         focus:outline-none focus:ring-2 focus:ring-coffee-300"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-coffee-700/70 dark:text-coffee-200/55">Quantité (kg)</label>
            <input
              required
              type="number"
              min="0"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              placeholder="0"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-coffee-900/15 dark:border-white/15
                         bg-white dark:bg-coffee-950 text-coffee-900 dark:text-coffee-50 text-sm
                         focus:outline-none focus:ring-2 focus:ring-coffee-300"
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2.5 rounded-lg border border-coffee-900/15 dark:border-white/15
                         text-sm font-medium text-coffee-900 dark:text-coffee-50 hover:bg-coffee-50 dark:hover:bg-coffee-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-3 py-2.5 rounded-lg bg-coffee-700 hover:bg-coffee-600 text-white text-sm font-medium transition-colors disabled:opacity-60"
            >
              {submitting ? 'Création…' : 'Créer le lot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
