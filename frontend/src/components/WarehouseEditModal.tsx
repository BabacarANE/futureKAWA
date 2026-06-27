import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { updateWarehouse } from '../services/api'

type Props = {
  warehouse: {
    id: number
    name: string
    location: string | null
    exploitation_id: number
    country_code?: string
  }
  onClose: () => void
  onUpdated: () => void
}

export default function WarehouseEditModal({ warehouse, onClose, onUpdated }: Props) {
  const nameRef = useRef<HTMLInputElement | null>(null)
  const [name,     setName]     = useState(warehouse.name)
  const [location, setLocation] = useState(warehouse.location ?? '')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    setTimeout(() => nameRef.current?.focus(), 50)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Le nom est obligatoire'); return }
    setError(''); setLoading(true)
    try {
      await updateWarehouse(
        warehouse.country_code ?? 'BR',
        warehouse.id,
        {
          name: name.trim(),
          location: location.trim() || null,
          exploitation_id: warehouse.exploitation_id,
        }
      )
      onUpdated()
      onClose()
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Erreur lors de la modification')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
         onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Modifier l'entrepôt"
           onClick={e => e.stopPropagation()}
           className="bg-white dark:bg-[#1c1a17] rounded-2xl shadow-xl p-6 w-full max-w-md mx-4
                      border border-stone-100 dark:border-white/10">

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Modifier l'entrepôt</h2>
          <button onClick={onClose}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Nom <span className="text-red-500">*</span>
            </label>
            <input ref={nameRef} value={name} onChange={e => setName(e.target.value)}
              required
              className="w-full border border-stone-300 dark:border-white/15 rounded-lg px-3 py-2 text-sm
                         bg-white dark:bg-white/5 text-stone-900 dark:text-stone-100
                         focus:outline-none focus:ring-2 focus:ring-stone-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Localisation (optionnelle)
            </label>
            <input value={location} onChange={e => setLocation(e.target.value)}
              placeholder="Ex: Zone A — Hangar 3"
              className="w-full border border-stone-300 dark:border-white/15 rounded-lg px-3 py-2 text-sm
                         bg-white dark:bg-white/5 text-stone-900 dark:text-stone-100
                         focus:outline-none focus:ring-2 focus:ring-stone-400" />
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
            <button type="submit" disabled={loading || !name.trim()}
              className="flex-1 bg-[#7a4528] hover:bg-[#6a3a20] text-white font-medium
                         py-2.5 rounded-lg disabled:opacity-50 transition-colors">
              {loading ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
