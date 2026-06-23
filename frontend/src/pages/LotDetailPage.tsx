import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCountryLots } from '../services/api'
import type { Lot } from '../types'

function Hero({ lot }: { lot: Partial<Lot> | null }) {
  if (!lot) return null
  return (
    <div className="bg-white rounded-[16px] p-6 shadow-sm mb-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-500">Lot</div>
          <div className="text-2xl font-bold">{lot.id}</div>
          <div className="text-sm text-gray-500">Origine: {lot.exploitation_id ?? '-'} • Entrepôt: {lot.warehouse_id ?? '-'}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Statut</div>
          <div className="font-semibold">{lot.status}</div>
        </div>
      </div>
    </div>
  )
}

export default function LotDetailPage() {
  const { lotId } = useParams()
  const [lot, setLot] = useState<Lot | null>(null)

  useEffect(() => {
    // naive: fetch country BR lots and find by id (replace with real API)
    getCountryLots('BR').then(lots => {
      const found = lots.find(l => l.id === lotId)
      setLot(found ?? null)
    }).catch(() => setLot(null))
  }, [lotId])

  return (
    <div className="p-6">
      <Hero lot={lot} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="bg-white rounded-[12px] p-4 shadow-sm">Graphique Température (placeholder)</div>
          <div className="bg-white rounded-[12px] p-4 shadow-sm">Graphique Humidité (placeholder)</div>
          <div className="bg-white rounded-[12px] p-4 shadow-sm">Historique et mesures</div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-[12px] p-4 shadow-sm">Timeline des événements</div>
          <div className="bg-white rounded-[12px] p-4 shadow-sm">Photos du lot</div>
          <div className="bg-white rounded-[12px] p-4 shadow-sm">Alertes associées</div>
          <div className="bg-white rounded-[12px] p-4 shadow-sm flex justify-between items-center">
            <div>
              <div className="text-sm font-semibold">Actions</div>
              <div className="text-xs text-gray-500">Exporter, marquer comme résolu, etc.</div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-2 border rounded">Exporter PDF</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
