import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { createWarehouse } from '../services/api'

type Props = {
  onClose: () => void
  onCreated: () => void
}

export default function WarehouseCreateModal({ onClose, onCreated }: Props) {
  const ref = useRef<HTMLInputElement | null>(null)
  const [id, setId] = useState('')
  const [country, setCountry] = useState('BR')
  const [capacity, setCapacity] = useState<number | ''>('')
  const [temp, setTemp] = useState<number | ''>('')
  const [humidity, setHumidity] = useState<number | ''>('')
  const [photo, setPhoto] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    setTimeout(() => ref.current?.focus(), 50)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createWarehouse({ id, country, capacity: Number(capacity), temp: Number(temp), humidity: Number(humidity), photo })
      onCreated()
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Nouveau entrepôt" onClick={(e) => e.stopPropagation()} className="bg-white rounded-[16px] shadow-xl p-6 w-full max-w-xl mx-4 transition-transform">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Nouveau entrepôt</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID de l'entrepôt <span className="text-red-500">*</span></label>
            <input ref={ref} value={id} onChange={(e) => setId(e.target.value)} placeholder="W-123" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500">
                <option value="BR">Brésil</option>
                <option value="CO">Colombie</option>
                <option value="EC">Equateur</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo (URL)</label>
              <input value={photo} onChange={(e) => setPhoto(e.target.value)} placeholder="https://.../photo.jpg" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacité</label>
              <input value={capacity as any} onChange={(e) => setCapacity(e.target.value === '' ? '' : Number(e.target.value))} placeholder="1000" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Température cible (°C)</label>
              <input value={temp as any} onChange={(e) => setTemp(e.target.value === '' ? '' : Number(e.target.value))} placeholder="22" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Humidité cible (%)</label>
              <input value={humidity as any} onChange={(e) => setHumidity(e.target.value === '' ? '' : Number(e.target.value))} placeholder="60" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500" />
            </div>
          </div>

          {error && <div className="text-red-600 bg-red-50 px-3 py-2 rounded-lg text-sm">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 font-medium py-2.5 rounded-lg hover:bg-gray-50">Annuler</button>
            <button type="submit" disabled={loading || !id} className="flex-1 bg-coffee-700 hover:bg-coffee-500 text-white font-medium py-2.5 rounded-lg disabled:opacity-50">{loading ? 'Création...' : 'Créer l\'entrepôt'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
