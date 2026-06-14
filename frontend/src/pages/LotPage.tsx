import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import ChartTempHumidity from '../components/ChartTempHumidity'
import { getCountryLots, getCountryMeasures } from '../services/api'
import type { Lot, Measure } from '../types'

const statusConfig = {
  compliant: { label: 'Conforme', cls: 'badge-compliant' },
  alert:     { label: 'Alerte',   cls: 'badge-alert'    },
  expired:   { label: 'Périmé',   cls: 'badge-expired'  },
}

export default function LotPage() {
  const { lotId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const country = params.get('country') ?? 'BR'

  const [lot, setLot] = useState<Lot | null>(null)
  const [measures, setMeasures] = useState<Measure[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!lotId) return
    Promise.all([
      getCountryLots(country),
      getCountryMeasures(country, undefined as any),
    ])
      .then(([lots, ms]) => {
        const found = lots.find((l: Lot) => l.id === lotId) ?? null
        setLot(found)
        if (found) {
          setMeasures(
            ms.filter((m: Measure) => m.warehouse_id === found.warehouse_id)
          )
        }
      })
      .finally(() => setLoading(false))
  }, [lotId, country])

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-coffee-500" />
    </div>
  )

  if (!lot) return (
    <div className="text-center py-24 text-gray-400">Lot introuvable.</div>
  )

  const cfg = statusConfig[lot.status] ?? statusConfig.compliant
  const days = Math.floor(
    (Date.now() - new Date(lot.storage_date).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/')}
        className="text-sm text-coffee-600 hover:text-coffee-800 font-medium"
      >
        ← Retour au tableau de bord
      </button>

      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-mono">{lot.id}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Entrepôt #{lot.warehouse_id} — Exploitation #{lot.exploitation_id}
            </p>
          </div>
          <span className={cfg.cls}>{cfg.label}</span>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500">Date de stockage</p>
            <p className="font-semibold text-gray-800 mt-1">
              {new Date(lot.storage_date).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500">Jours stockés</p>
            <p className={`font-semibold mt-1 ${days > 330 ? 'text-red-600' : 'text-gray-800'}`}>
              {days} jours
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500">Notes qualité</p>
            <p className="font-semibold text-gray-800 mt-1">
              {lot.quality_notes ?? '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-6">
          Historique température / humidité
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({measures.length} mesures)
          </span>
        </h2>
        <ChartTempHumidity measures={measures} />
      </div>
    </div>
  )
}
