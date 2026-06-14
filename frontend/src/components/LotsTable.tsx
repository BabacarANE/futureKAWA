import { useNavigate } from 'react-router-dom'
import type { Lot } from '../types'

interface Props {
  lots: Lot[]
  countryCode: string
}

const statusConfig = {
  compliant: { label: 'Conforme',  cls: 'badge-compliant' },
  alert:     { label: 'Alerte',    cls: 'badge-alert'     },
  expired:   { label: 'Périmé',    cls: 'badge-expired'   },
}

function daysInStorage(date: string): number {
  return Math.floor(
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
  )
}

export default function LotsTable({ lots, countryCode }: Props) {
  const navigate = useNavigate()

  if (!lots.length) return (
    <div className="text-center py-12 text-gray-400">
      Aucun lot enregistré pour ce pays.
    </div>
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-4 font-medium text-gray-500">ID Lot</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">Date stockage</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">Jours stockés</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">Statut</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">Notes qualité</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {lots.map((lot, i) => {
            const days = daysInStorage(lot.storage_date)
            const cfg = statusConfig[lot.status] ?? statusConfig.compliant
            return (
              <tr
                key={lot.id}
                className={`border-b border-gray-50 hover:bg-gray-50 transition-colors
                            ${i === 0 ? 'bg-amber-50/40' : ''}`}
              >
                <td className="py-3 px-4 font-mono font-medium text-coffee-700">
                  {lot.id}
                  {i === 0 && (
                    <span className="ml-2 text-xs bg-amber-100 text-amber-700
                                     px-1.5 py-0.5 rounded font-sans">
                      FIFO
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {new Date(lot.storage_date).toLocaleDateString('fr-FR')}
                </td>
                <td className={`py-3 px-4 font-medium ${days > 330 ? 'text-red-600' : 'text-gray-700'}`}>
                  {days}j
                </td>
                <td className="py-3 px-4">
                  <span className={cfg.cls}>{cfg.label}</span>
                </td>
                <td className="py-3 px-4 text-gray-500 max-w-xs truncate">
                  {lot.quality_notes ?? '—'}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => navigate(`/lots/${lot.id}?country=${countryCode}`)}
                    className="text-coffee-600 hover:text-coffee-800 text-xs font-medium"
                  >
                    Détail →
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
